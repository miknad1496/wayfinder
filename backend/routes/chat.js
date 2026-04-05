import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { chat, chatHaikuIntake, chatHaikuAdvisor } from '../services/claude.js';
import { chatSLM, shouldUseSLM, qualityGate, isSLMAvailable, routeDomain, warmUpSLM, getSLMWarmStatus } from '../services/slm.js';
import { checkInjection, getInjectionRefusal } from '../services/input_filter.js';
import { classifyScope, getScopeRefusal } from '../services/scope_classifier.js';
import { saveSession, loadSession } from '../services/storage.js';
import { verifyToken, linkSession, useEngine, getEngineUsage, checkTokenUsage, recordTokenUsage, checkMessageUsage, recordMessageUsage } from '../services/auth.js';
import { createTelemetryEvent, logTelemetry } from '../services/telemetry.js';
import { captureConversationMemory, captureTrainingPair } from '../services/conversation-memory.js';
import { performance } from 'perf_hooks';

const router = Router();

// ─── Routing Debug Log (last 20 decisions, in-memory) ──────────
const routingLog = [];
function logRouting(entry) {
  routingLog.push({ ...entry, ts: new Date().toISOString() });
  if (routingLog.length > 20) routingLog.shift();
}
export function getRoutingLog() { return [...routingLog]; }

// GET /api/chat/advisor-status — Check if the SLM advisor is warm and ready
// Frontend polls this after the Haiku intake to show "your advisor has arrived"
router.get('/advisor-status', (req, res) => {
  const status = getSLMWarmStatus();
  res.json({
    ready: status.state === 'warm',
    state: status.state,       // 'cold' | 'warming' | 'warm' | 'error'
    warmLatencyMs: status.warmLatencyMs,
    available: status.available,
  });
});

// In-memory lock: prevents concurrent generation on the same session.
// If a second request arrives while the first is mid-generation, return 409.
const activeSessions = new Set();

// ─── Per-User Rate Limiting (in-memory, basic) ────────────────────
// Tracks requests per user/IP to prevent abuse. Production should use Redis.
// Structure: Map<identifier, { count: number, resetAt: timestamp }>
const userRateLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // Max 30 requests per minute per user

function checkRateLimit(identifier) {
  const now = Date.now();
  const record = userRateLimits.get(identifier);

  if (!record || now > record.resetAt) {
    // Create new window
    userRateLimits.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW
    });
    // Clean up expired windows to prevent memory leak
    for (const [key, val] of userRateLimits.entries()) {
      if (now > val.resetAt) {
        userRateLimits.delete(key);
      }
    }
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  // Within existing window
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(record.resetAt).toISOString()
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - record.count
  };
}

// Helper: extract user from auth header (optional — doesn't fail if no token)
async function getOptionalUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    return { user: await verifyToken(token), token };
  } catch (err) {
    console.warn(`[Auth] Token verification failed: ${err.message}`);
    return null;
  }
}

// POST /api/chat - Send a message
router.post('/', async (req, res) => {
  const t0 = performance.now();
  const tEvent = createTelemetryEvent();
  let lockedSessionId = null;

  try {
    // ─── REQUEST VALIDATION ────────────────────────────────────────
    // Strict validation: type, length, encoding

    const { message, sessionId: existingSessionId, useWayfinderEngine } = req.body;

    // Message existence and type
    if (typeof message !== 'string') {
      return res.status(400).json({ error: 'Message must be a string' });
    }

    // Empty check (after trim to avoid whitespace-only messages)
    const trimmedMsg = message.trim();
    if (trimmedMsg.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty or whitespace only' });
    }

    // Length check (5000 char limit)
    const MAX_MESSAGE_LENGTH = 5000;
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(413).json({
        error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters, got ${message.length})`
      });
    }

    // Minimum message length check (prevent abuse from "." or single chars)
    if (trimmedMsg.length < 2) {
      return res.status(400).json({
        error: 'Message must be at least 2 characters'
      });
    }

    // ─── SESSION ID VALIDATION ─────────────────────────────────────
    if (existingSessionId && (typeof existingSessionId !== 'string' || existingSessionId.length === 0)) {
      return res.status(400).json({ error: 'sessionId must be a non-empty string if provided' });
    }

    // ─── SS-01: INPUT INJECTION FILTER ──────────────────────────
    // Every user input passes through this filter. No exceptions.
    // If blocked, short-circuit with hardcoded refusal (never reaches LLM).
    const tSS01 = performance.now();
    const injectionCheck = checkInjection(message);
    tEvent.latency.ss01_ms = Math.round((performance.now() - tSS01) * 100) / 100;

    if (injectionCheck.blocked) {
      console.log(`[SS-01] Input blocked: ${injectionCheck.reason} (layer: ${injectionCheck.layer})`);
      tEvent.ss01 = { blocked: true, reason: injectionCheck.reason, layer: injectionCheck.layer };
      tEvent.generation.mode = 'blocked';
      tEvent.generation.hard_refusal_served = true;
      tEvent.session_id = existingSessionId || 'blocked';
      tEvent.latency.total_ms = Math.round((performance.now() - t0) * 100) / 100;
      logTelemetry(tEvent);
      return res.json({
        sessionId: existingSessionId || 'blocked',
        response: getInjectionRefusal(),
        sources: [],
        usage: null,
        mode: 'blocked',
        messageCount: 0,
        engineRemaining: null,
        tokenUsage: null
      });
    }

    // ─── SS-04: SCOPE CLASSIFIER ──────────────────────────────
    // Every clean input is classified: in_scope, adjacent, or out_of_scope.
    // out_of_scope → hardcoded refusal (no LLM call, no token cost).
    // adjacent → LLM called with boundary instruction injected.
    // in_scope → normal generation.
    const tSS04 = performance.now();
    const scopeResult = await classifyScope(message);
    tEvent.latency.ss04_ms = Math.round((performance.now() - tSS04) * 100) / 100;

    tEvent.ss04 = {
      label: scopeResult.label,
      confidence: scopeResult.confidence,
      domain: scopeResult.domain,
      stage: scopeResult.stage,
      rule_hits: scopeResult.ruleHits || [],
    };

    if (scopeResult.label === 'out_of_scope') {
      console.log(`[SS-04] Out-of-scope: domain=${scopeResult.domain}, confidence=${scopeResult.confidence}, stage=${scopeResult.stage}`);
      tEvent.generation.mode = 'hardcoded_refusal';
      tEvent.generation.hard_refusal_served = true;
      tEvent.session_id = existingSessionId || 'out_of_scope';
      tEvent.latency.total_ms = Math.round((performance.now() - t0) * 100) / 100;
      logTelemetry(tEvent);
      return res.json({
        sessionId: existingSessionId || 'out_of_scope',
        response: getScopeRefusal(scopeResult.domain),
        sources: [],
        usage: null,
        mode: 'out_of_scope',
        messageCount: 0,
        engineRemaining: null,
        tokenUsage: null,
        scopeLabel: scopeResult.label,
      });
    }

    if (scopeResult.label === 'adjacent') {
      console.log(`[SS-04] Adjacent: domain=${scopeResult.domain}, confidence=${scopeResult.confidence}, stage=${scopeResult.stage}`);
      tEvent.generation.mode = 'boundary_injected';
      tEvent.generation.boundary_instruction_injected = true;
    } else {
      tEvent.generation.mode = 'normal';
    }

    // Check for authenticated user (optional)
    const auth = await getOptionalUser(req);
    tEvent.user_id = auth?.user?.id || null;

    // ─── PER-USER RATE LIMITING ────────────────────────────────────
    // Identify user by: auth ID > client IP (fallback)
    const rateLimitId = auth?.user?.id || (req.ip || req.connection.remoteAddress || 'unknown');
    const rateCheck = checkRateLimit(rateLimitId);

    if (!rateCheck.allowed) {
      tEvent.outcome.http_status = 429;
      tEvent.outcome.error = 'user_rate_limit_exceeded';
      tEvent.latency.total_ms = Math.round((performance.now() - t0) * 100) / 100;
      logTelemetry(tEvent);
      return res.status(429).json({
        error: 'Too many requests. Please wait before sending another message.',
        resetAt: rateCheck.resetAt
      });
    }

    // Handle engine usage limits
    let engineAllowed = false;
    let engineRemaining = 0;
    tEvent.engine.requested = !!useWayfinderEngine;

    if (useWayfinderEngine && auth?.token) {
      const result = await useEngine(auth.token);
      if (!result.allowed) {
        tEvent.outcome.http_status = 429;
        tEvent.outcome.error = 'engine_limit_exceeded';
        tEvent.latency.total_ms = Math.round((performance.now() - t0) * 100) / 100;
        logTelemetry(tEvent);
        return res.status(429).json({
          error: 'You\'ve used all 3 Wayfinder Engine queries for today. Try again tomorrow, or use standard mode.',
          engineRemaining: 0
        });
      }
      engineAllowed = true;
      engineRemaining = result.remaining;
      tEvent.engine.allowed = true;
    } else if (useWayfinderEngine && !auth?.token) {
      tEvent.outcome.http_status = 401;
      tEvent.outcome.error = 'engine_auth_required';
      tEvent.latency.total_ms = Math.round((performance.now() - t0) * 100) / 100;
      logTelemetry(tEvent);
      return res.status(401).json({
        error: 'Please log in to use the Wayfinder Engine.'
      });
    }

    // Check daily + monthly message limits for authenticated users
    if (auth?.token) {
      const msgUsage = await checkMessageUsage(auth.token);
      if (!msgUsage.allowed) {
        tEvent.outcome.http_status = 429;
        tEvent.outcome.error = 'message_limit_exceeded';
        tEvent.latency.total_ms = Math.round((performance.now() - t0) * 100) / 100;
        logTelemetry(tEvent);

        const reason = msgUsage.upgradeReason === 'daily_messages'
          ? `You've reached your daily message limit (${msgUsage.daily.limit} messages/day). Come back tomorrow or upgrade for more.`
          : `You've reached your monthly message limit (${msgUsage.monthly.limit} messages/month). Upgrade your plan for unlimited messaging.`;

        return res.status(429).json({
          error: reason,
          messageUsage: {
            daily: msgUsage.daily,
            monthly: msgUsage.monthly
          },
          upgradeReason: msgUsage.upgradeReason
        });
      }
    }

    // Check daily token limits for authenticated users (Claude API calls)
    if (auth?.token) {
      const tokenUsage = await checkTokenUsage(auth.token);
      if (!tokenUsage.allowed) {
        tEvent.outcome.http_status = 429;
        tEvent.outcome.error = 'token_limit_exceeded';
        tEvent.latency.total_ms = Math.round((performance.now() - t0) * 100) / 100;
        logTelemetry(tEvent);
        return res.status(429).json({
          error: `You've hit your daily token limit. Your limit resets tomorrow. Upgrade your plan for more capacity.`,
          tokenUsage: {
            used: tokenUsage.tokensUsed,
            limit: tokenUsage.limit,
            remaining: 0
          }
        });
      }
    }

    // Load or create session
    const sessionId = existingSessionId || uuidv4();
    tEvent.session_id = sessionId;

    // Reject concurrent generation on the same session
    if (activeSessions.has(sessionId)) {
      tEvent.outcome.http_status = 409;
      tEvent.outcome.error = 'generation_in_progress';
      tEvent.latency.total_ms = Math.round((performance.now() - t0) * 100) / 100;
      logTelemetry(tEvent);
      return res.status(409).json({
        error: 'A response is already being generated for this session. Please wait.'
      });
    }
    activeSessions.add(sessionId);
    lockedSessionId = sessionId;

    let session = await loadSession(sessionId);

    if (!session) {
      session = {
        id: sessionId,
        created: new Date().toISOString(),
        history: [],
        context: {},
        messageCount: 0,
        userId: auth?.user?.id || null
      };
    }

    // If user is logged in, inject their profile into context
    if (auth?.user) {
      session.userId = auth.user.id;
      session.context = {
        ...session.context,
        userName: auth.user.name,
        userType: auth.user.userType,
        school: auth.user.school,
        interests: auth.user.interests,
        profile: auth.user.profile
      };
    }

    // ─── TIER ROUTING ───────────────────────────────────────────────
    // Messages 1-3 (SLM warming): Welcome Desk gathers context for advisor
    // SLM warm at any point: SLM Advisor takes over
    // Messages 4+ (SLM still not warm): Haiku Advisor fallback (real answers)
    // Engine mode: Claude Sonnet/Opus (premium)
    const isFirstMessage = session.history.length === 0 && !engineAllowed;
    const slmWarmStatus = getSLMWarmStatus();
    const slmIsWarm = slmWarmStatus.state === 'warm';
    const routingOptions = {
      useEngine: engineAllowed,
      scopeLabel: scopeResult.label,
      scopeConfidence: scopeResult.confidence,
    };

    const slmEverWarmed = slmWarmStatus.lastWarmAt !== null;
    const hasHistory = session.history.length > 0;
    const exchangeCount = Math.floor(session.history.length / 2); // pairs of user+assistant

    // SLM: use if warm or was recently warm AND scope allows it
    const useSLM = !isFirstMessage && (slmIsWarm || (hasHistory && slmEverWarmed))
      && shouldUseSLM(routingOptions);

    // Welcome Desk: holds the conversation for up to 3 exchanges while SLM warms up.
    // Gathers useful context (grade level, interests, goals) so the advisor can
    // hit the ground running. Only exits when SLM is warm or exchange threshold hit.
    const WELCOME_DESK_MAX_EXCHANGES = 3;
    const useWelcomeDesk = !useSLM && !engineAllowed
      && exchangeCount < WELCOME_DESK_MAX_EXCHANGES
      && scopeResult.label !== 'out_of_scope';

    // Haiku Advisor: kicks in after Welcome Desk threshold if SLM still hasn't warmed.
    // Gives real substantive answers using Haiku + RAG so user isn't stuck forever.
    const useHaikuAdvisor = !useSLM && !useWelcomeDesk && !engineAllowed
      && scopeResult.label !== 'out_of_scope';

    const routingDebug = {
      isFirstMessage, slmState: slmWarmStatus.state, slmIsWarm, slmEverWarmed,
      hasHistory, useSLM, useWelcomeDesk, useHaikuAdvisor, engineAllowed,
      scope: scopeResult.label, scopeConf: scopeResult.confidence,
      lastWarmAt: slmWarmStatus.lastWarmAt, timeSinceWarm: slmWarmStatus.timeSinceWarmMs,
      historyLen: session.history.length, sessionId,
      shouldUseSLM: shouldUseSLM(routingOptions), slmAvailable: isSLMAvailable(),
    };
    logRouting(routingDebug);
    console.log(`[ROUTING] ${JSON.stringify(routingDebug)}`);

    const tGen = performance.now();
    const GENERATION_TIMEOUT = 120000; // 120 seconds max for generation
    let result;
    let escalatedFromSLM = false;
    let generationTimedOut = false;

    try {
      // Wrap generation with timeout protection
      const generationPromise = (async () => {
        if (useWelcomeDesk) {
          // ── Welcome Desk: FIRST MESSAGE ONLY ──
          // Fire SLM warm-up in background
          if (isSLMAvailable()) {
            warmUpSLM().catch(err => {
              console.warn(`[WARM-UP] Background SLM warm-up failed: ${err.message}`);
            });
            console.log('[WARM-UP] SLM warm-up ping fired (background)');
          }

          try {
            result = await chatHaikuIntake(trimmedMsg, session.context, session.history);
            tEvent.generation.mode = 'haiku_intake';
            console.log(`[WELCOME-DESK] Response OK (SLM state: ${slmWarmStatus.state})`);
          } catch (haikuError) {
            console.error(`[WELCOME-DESK] Haiku error: ${haikuError.message}`);
            throw new Error('Our welcome desk is momentarily unavailable. Please try again.');
          }
        } else if (useSLM) {
          // ── SLM Advisor (warm or recently warm, in-scope) ──
          console.log(`[ADVISOR] Attempting SLM call...`);
          try {
            const slmResult = await chatSLM(
              session.history,
              trimmedMsg,
              session.context,
              { scopeLabel: scopeResult.label, scopeResult }
            );

            if (slmResult.qualityCheck.passed) {
              result = slmResult;
              tEvent.generation.mode = 'slm';
              tEvent.generation.domain = slmResult.domain;
              console.log(`[ADVISOR] SLM response OK (${slmResult.domain}, ${slmResult.latency}ms)`);
            } else {
              // Quality gate failed → Haiku Advisor (real answers, not greeter)
              console.log(`[ADVISOR→HAIKU] SLM quality failed: ${slmResult.qualityCheck.reason}`);
              tEvent.generation.slm_escalation = slmResult.qualityCheck.reason;
              escalatedFromSLM = true;
              result = await chatHaikuAdvisor(session.history, trimmedMsg, session.context, { scopeLabel: scopeResult.label });
              tEvent.generation.mode = 'haiku_advisor';
            }
          } catch (slmError) {
            // SLM errored → Haiku Advisor (real answers, not greeter)
            console.error(`[ADVISOR→HAIKU] SLM error: ${slmError.message}`);
            tEvent.generation.slm_error = slmError.message;
            escalatedFromSLM = true;
            warmUpSLM().catch(() => {}); // Re-warm in background

            try {
              result = await chatHaikuAdvisor(session.history, trimmedMsg, session.context, { scopeLabel: scopeResult.label });
              tEvent.generation.mode = 'haiku_advisor';
            } catch (haikuErr) {
              console.error(`[ADVISOR→HAIKU→CLAUDE] Both failed — last resort Sonnet`);
              result = await chat(
                session.history, trimmedMsg, session.context,
                { useEngine: false, scopeLabel: scopeResult.label }
              );
              tEvent.generation.mode = 'claude_fallback';
            }
          }
        } else if (engineAllowed) {
          // ── Engine Mode: Claude Opus/Sonnet (premium, user-requested) ──
          result = await chat(
            session.history,
            trimmedMsg,
            session.context,
            { useEngine: true, scopeLabel: scopeResult.label }
          );
          tEvent.generation.mode = 'engine';
        } else if (useHaikuAdvisor) {
          // ── Haiku Advisor: SLM not available but user needs real answers ──
          console.log(`[HAIKU-ADVISOR] SLM unavailable — giving real answers via Haiku+RAG`);
          try {
            result = await chatHaikuAdvisor(session.history, trimmedMsg, session.context, { scopeLabel: scopeResult.label });
            tEvent.generation.mode = 'haiku_advisor';
          } catch (err) {
            console.error(`[HAIKU-ADVISOR→CLAUDE] Haiku failed — last resort Sonnet`);
            result = await chat(
              session.history, trimmedMsg, session.context,
              { useEngine: false, scopeLabel: scopeResult.label }
            );
            tEvent.generation.mode = 'claude_fallback';
          }
        } else {
          // ── Final fallback — Sonnet standard ──
          result = await chat(
            session.history, trimmedMsg, session.context,
            { useEngine: false, scopeLabel: scopeResult.label }
          );
          tEvent.generation.mode = 'standard';
        }
      })();

      // Race generation against timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Generation timeout')), GENERATION_TIMEOUT)
      );

      await Promise.race([generationPromise, timeoutPromise]);
    } catch (genErr) {
      if (genErr.message === 'Generation timeout') {
        generationTimedOut = true;
        console.error('[TIMEOUT] Generation exceeded 120s limit');
        tEvent.outcome.error = 'generation_timeout';
        tEvent.latency.generation_ms = GENERATION_TIMEOUT;
        activeSessions.delete(sessionId);
        logTelemetry(tEvent);
        return res.status(504).json({
          error: 'Response generation timeout. The request took too long to complete. Please try a simpler question.'
        });
      }
      throw genErr;
    }

    const generationTime = Math.round((performance.now() - tGen) * 100) / 100;
    tEvent.latency.generation_ms = generationTime;

    // Record token usage
    if (result.usage) {
      tEvent.tokens.input = result.usage.inputTokens || 0;
      tEvent.tokens.output = result.usage.outputTokens || 0;
      tEvent.tokens.total = tEvent.tokens.input + tEvent.tokens.output;
    }

    // Record RAG usage
    if (result.retrievedSources && result.retrievedSources.length > 0) {
      tEvent.rag.used = true;
      tEvent.rag.sources_count = result.retrievedSources.length;
    }

    // Record message usage for authenticated users (ALL modes count toward message limits)
    if (auth?.token) {
      recordMessageUsage(auth.token).catch(err => {
        console.error('[Background] Message usage recording failed:', err.message);
      });
    }

    // Record token usage for authenticated users (only for Claude API calls — SLM tokens are free/separate)
    if (auth?.token && result.usage && result.mode !== 'slm') {
      const totalTokens = (result.usage.inputTokens || 0) + (result.usage.outputTokens || 0);
      if (totalTokens > 0) {
        recordTokenUsage(auth.token, totalTokens).catch(err => {
          console.error('[Background] Token usage recording failed:', err.message);
        });
      }
    }

    // Update session history (keep last 20 messages to manage context window)
    session.history.push(
      { role: 'user', content: message.trim() },
      { role: 'assistant', content: result.response }
    );

    // Trim history if too long (keep last 10 exchanges = 20 messages)
    if (session.history.length > 20) {
      session.history = session.history.slice(-20);
    }

    session.messageCount += 1;
    session.lastActive = new Date().toISOString();

    // Save session
    await saveSession(sessionId, session);

    // ─── CONVERSATION MEMORY: Capture for RAG + future SLM training ───
    // Runs in background — never blocks the response
    const memoryParams = {
      userMessage: message.trim(),
      response: result.response,
      mode: tEvent.generation.mode || result.mode,
      scopeLabel: scopeResult?.label || 'in_scope',
      sessionContext: session.context,
      sessionId,
    };
    captureConversationMemory(memoryParams).catch(err => {
      console.error('[Background] Memory capture failed:', err.message);
    });
    captureTrainingPair({
      ...memoryParams,
      qualitySignal: 'unrated',
      domain: null, // auto-detected inside
    }).catch(err => {
      console.error('[Background] Training capture failed:', err.message);
    });

    // Link session to user account if logged in
    if (auth?.token) {
      linkSession(auth.token, sessionId).catch(err => {
        console.error('[Background] Session linking failed:', err.message);
      });
    }

    // Get updated engine, token, and message usage for response
    let engineUsage = null;
    let tokenUsageInfo = null;
    let messageUsageInfo = null;
    if (auth?.token) {
      engineUsage = await getEngineUsage(auth.token);
      tokenUsageInfo = await checkTokenUsage(auth.token);
      messageUsageInfo = await checkMessageUsage(auth.token);
    }

    // ─── TELEMETRY: success ──────────────────────────────────
    activeSessions.delete(sessionId);
    tEvent.latency.total_ms = Math.round((performance.now() - t0) * 100) / 100;
    logTelemetry(tEvent);

    res.json({
      sessionId,
      response: result.response,
      sources: result.retrievedSources,
      usage: result.usage,
      mode: result.mode,
      messageCount: session.messageCount,
      engineRemaining: engineUsage?.remaining ?? null,
      tokenUsage: tokenUsageInfo ? {
        used: tokenUsageInfo.tokensUsed,
        remaining: tokenUsageInfo.tokensRemaining,
        limit: tokenUsageInfo.limit
      } : null,
      // Message usage for frontend
      messageUsage: messageUsageInfo ? {
        daily: messageUsageInfo.daily,
        monthly: messageUsageInfo.monthly
      } : null,
      // Signal frontend to start polling /api/chat/advisor-status
      advisorWarming: result.mode === 'haiku_intake' && isSLMAvailable(),
    });

  } catch (err) {
    if (lockedSessionId) activeSessions.delete(lockedSessionId);
    console.error('Chat error:', err);
    tEvent.outcome.http_status = 500;
    tEvent.outcome.error = err.message || 'unknown';
    tEvent.latency.total_ms = Math.round((performance.now() - t0) * 100) / 100;
    logTelemetry(tEvent);
    // Sanitize error message — never leak raw API JSON to frontend
    let safeMsg = err.message || 'Failed to generate response';
    if (safeMsg.includes('"type":"error"') || safeMsg.includes('invalid_request_error')) {
      safeMsg = 'Your message could not be processed. Try rephrasing your question.';
    }
    res.status(500).json({ error: safeMsg });
  }
});

// POST /api/chat/context - Update session context (user profile info)
router.post('/context', async (req, res) => {
  try {
    const { sessionId, context } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    // Require authentication for context updates
    const auth = await getOptionalUser(req);
    if (!auth?.user) {
      return res.status(401).json({ error: 'Authentication required to update session context' });
    }

    let session = await loadSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Verify the authenticated user owns this session
    if (session.userId && session.userId !== auth.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    session.context = { ...session.context, ...context };
    await saveSession(sessionId, session);

    res.json({ success: true, context: session.context });
  } catch (err) {
    console.error('Context update error:', err);
    res.status(500).json({ error: 'Failed to update context' });
  }
});

// GET /api/chat/session/:id - Get session info
router.get('/session/:id', async (req, res) => {
  try {
    const auth = await getOptionalUser(req);
    const session = await loadSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    // Verify user owns session if authenticated and session has an owner
    if (auth?.user && session.userId && session.userId !== auth.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({
      id: session.id,
      created: session.created,
      lastActive: session.lastActive,
      messageCount: session.messageCount,
      context: session.context
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load session' });
  }
});

// GET /api/chat/history/:sessionId - Get full message history for a session
router.get('/history/:sessionId', async (req, res) => {
  try {
    const auth = await getOptionalUser(req);
    const session = await loadSession(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    // Verify user owns session if authenticated
    if (auth?.user && session.userId && session.userId !== auth.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({
      id: session.id,
      created: session.created,
      lastActive: session.lastActive,
      messages: session.history,
      messageCount: session.messageCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load session history' });
  }
});

export default router;
