/**
 * SLM Service — Wayfinder Small Language Model (Llama 3.1 8B + 04A LoRA)
 *
 * Provides the fast, cheap, always-on Tier 1 response layer.
 * The SLM handles ~93% of in-scope conversations with warm, empathetic responses
 * trained in Wayfinder's voice.
 *
 * Architecture:
 *   Tier 1 — SLM (this service): Fast, cheap, personality-consistent
 *   Tier 2 — Orchestration (chat.js + knowledge.js): Routes, retrieves, monitors
 *   Tier 3 — Claude (claude.js): Safety net for complex/adjacent/engine queries
 *
 * Deployment options (configured via SLM_ENDPOINT env var):
 *   - RunPod Serverless: https://api.runpod.ai/v2/{endpoint_id}/runsync
 *   - Self-hosted: Any OpenAI-compatible API (vLLM, TGI, Ollama)
 *   - Disabled: Falls back to Claude for everything (current default)
 *
 * Quality gate: If the SLM response triggers refusal patterns or is too short,
 * the orchestration layer automatically escalates to Claude.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { retrieveContext, formatContext } from './knowledge.js';
import { BOUNDARY_INSTRUCTION } from './scope_classifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Configuration ──────────────────────────────────────────────

const SLM_ENDPOINT = process.env.SLM_ENDPOINT || null;
const SLM_API_KEY = process.env.SLM_API_KEY || null;
const SLM_MODEL_NAME = process.env.SLM_MODEL_NAME || 'wayfinder-04a';
const SLM_MAX_TOKENS = parseInt(process.env.SLM_MAX_TOKENS || '1024', 10);
const SLM_TEMPERATURE = parseFloat(process.env.SLM_TEMPERATURE || '0.7');
const SLM_ENABLED = process.env.SLM_ENABLED === 'true';

// Quality gate thresholds
const MIN_RESPONSE_LENGTH = 200;          // Chars — anything shorter triggers escalation
const REFUSAL_PATTERNS = [
  /^i can'?t\b/i,
  /^i cannot\b/i,
  /^i'?m not able to\b/i,
  /^i'?m sorry,? (?:but )?i can'?t/i,
  /^unfortunately,? i can'?t/i,
  /^i don'?t have the (?:ability|expertise|qualifications)/i,
];

let systemPromptCache = null;

// ─── Warm-Up Status Tracking ───────────────────────────────────
// Tracks whether the SLM GPU worker is warm (ready for instant responses).
// Updated by warmUpSLM() and successful chatSLM() calls.
// Consumed by /api/slm/status endpoint so the frontend can notify the user.
const slmStatus = {
  state: 'cold',          // 'cold' | 'warming' | 'warm' | 'error'
  lastWarmAt: null,        // Timestamp of last successful warm-up or response
  lastError: null,         // Last error message if any
  warmLatencyMs: null,     // How long the last warm-up took
};

// ─── System Prompt (SLM-specific, lighter than Claude's) ────────

async function loadSLMSystemPrompt() {
  if (systemPromptCache) return systemPromptCache;

  // Try SLM-specific prompt first, fall back to main prompt
  const slmPromptPath = join(__dirname, '..', '..', 'prompts', 'wayfinder-slm-system-prompt.txt');
  const mainPromptPath = join(__dirname, '..', '..', 'prompts', 'wayfinder-system-prompt.txt');

  try {
    systemPromptCache = await fs.readFile(slmPromptPath, 'utf-8');
  } catch {
    // No SLM-specific prompt — use main prompt
    systemPromptCache = await fs.readFile(mainPromptPath, 'utf-8');
  }

  return systemPromptCache;
}

export function invalidateSLMPromptCache() {
  systemPromptCache = null;
}

// ─── Status ─────────────────────────────────────────────────────

/**
 * Check if the SLM is available and enabled.
 */
export function isSLMAvailable() {
  return SLM_ENABLED && !!SLM_ENDPOINT;
}

/**
 * Get SLM service status for admin dashboard.
 */
export function getSLMStatus() {
  return {
    enabled: SLM_ENABLED,
    endpoint: SLM_ENDPOINT ? SLM_ENDPOINT.replace(/\/[^/]+$/, '/***') : null,
    model: SLM_MODEL_NAME,
    maxTokens: SLM_MAX_TOKENS,
    temperature: SLM_TEMPERATURE,
    available: isSLMAvailable(),
  };
}

/**
 * Get the live warm-up status of the SLM worker.
 * Used by /api/slm/status endpoint for frontend notifications.
 */
export function getSLMWarmStatus() {
  // If warm-up happened recently (within 3x the idle timeout), consider it warm.
  // RunPod idle timeout is 120s. We use 3x (360s) because the RunPod worker
  // often stays alive slightly past the configured timeout, and it's better
  // to TRY the SLM (fast response if warm, falls back to Haiku if cold)
  // than to skip it and stay on Welcome Desk forever.
  const idleTimeout = parseInt(process.env.SLM_IDLE_TIMEOUT || '120000', 10);
  const timeSinceWarm = slmStatus.lastWarmAt ? (Date.now() - slmStatus.lastWarmAt) : Infinity;
  const isStale = timeSinceWarm > (idleTimeout * 3);

  return {
    state: isStale ? 'cold' : slmStatus.state,
    lastWarmAt: slmStatus.lastWarmAt,
    warmLatencyMs: slmStatus.warmLatencyMs,
    timeSinceWarmMs: timeSinceWarm === Infinity ? null : Math.round(timeSinceWarm),
    idleTimeoutMs: idleTimeout,
    available: isSLMAvailable(),
  };
}

// ─── Quality Gate ───────────────────────────────────────────────

/**
 * Check if an SLM response passes the quality gate.
 * Returns { passed: boolean, reason: string | null }
 *
 * Edge cases handled:
 * - Unicode normalization (emoji, accents counted correctly)
 * - Boundary condition at MIN_RESPONSE_LENGTH
 * - Empty/whitespace strings
 */
export function qualityGate(response) {
  if (!response || typeof response !== 'string') {
    return { passed: false, reason: 'empty_response' };
  }

  const trimmed = response.trim();

  // Handle empty after trim
  if (trimmed.length === 0) {
    return { passed: false, reason: 'empty_response' };
  }

  // Normalize unicode for proper length counting (handles emoji, accents, etc.)
  // NFC = composed form (more consistent for length checks)
  const normalized = trimmed.normalize('NFC');
  const charCount = normalized.length;

  // Length check: strictly greater than MIN_RESPONSE_LENGTH to avoid 200-char boundary issues
  if (charCount <= MIN_RESPONSE_LENGTH) {
    return { passed: false, reason: 'too_short', length: charCount, threshold: MIN_RESPONSE_LENGTH };
  }

  // Refusal pattern check: check both original and trimmed for comprehensive matching
  for (const pattern of REFUSAL_PATTERNS) {
    if (pattern.test(normalized.toLowerCase())) {
      return { passed: false, reason: 'refusal_detected', pattern: pattern.source };
    }
  }

  return { passed: true, reason: null };
}

// ─── Domain Router ──────────────────────────────────────────────

/**
 * Determine which RAG domain to pull from based on the query + scope classification.
 * This is the software layer that directs the SLM to the right knowledge.
 *
 * Returns: 'admissions' | 'career' | 'general'
 *
 * Edge cases handled:
 * - New content areas: graduate, trades, military, international, financial aid
 * - Domain ambiguity: prefer most specific match
 * - Cross-domain queries: military + medical, grad + financial aid, etc.
 * - Fallback: 'general' for unmatched queries
 */
export function routeDomain(query, scopeResult) {
  const lower = (query || '').toLowerCase();

  // Strong admissions signals (undergraduate + graduate + international)
  const admissionsSignals = [
    'college', 'university', 'admissions', 'admission', 'application',
    'essay', 'sat', 'act', 'gpa', 'fafsa', 'financial aid', 'scholarship',
    'early decision', 'early action', 'regular decision', 'waitlist',
    'common app', 'supplement', 'recommendation', 'extracurricular',
    'ivy', 'harvard', 'yale', 'princeton', 'stanford', 'mit',
    'acceptance', 'accepted', 'rejected', 'deferred', 'deposit',
    'campus', 'dorm', 'orientation', 'transfer', 'gap year',
    'reach school', 'safety school', 'target school', 'school list',
    'ap credit', 'test optional', 'class rank', 'valedictorian',
    'my son', 'my daughter', 'my child', 'my kid', 'my teen',
    'parent', 'high school', 'junior', 'senior', 'sophomore', 'freshman',
    'pre-college', 'college prep', 'curriculum', 'course',
    'decision date', 'notification', 'ivy day',
    'ethnicity', 'demographics', 'diversity', 'first-gen',
    'binding', 'binding agreement',
  ];

  // Graduate program signals (high confidence)
  const graduateSignals = [
    'graduate', 'grad school', 'grad', 'masters', 'master\'s', 'master program',
    'phd', 'doctorate', 'doctoral', 'professional school',
    'mba', 'jd', 'md', 'medical degree', 'business school',
    'law school', 'medical school', 'med school',
    'business program', 'law program', 'medical program',
  ];

  // Graduate test signals
  const graduateTestSignals = [
    'gre', 'gmat', 'lsat', 'mcat',
  ];

  // International student signals
  const internationalSignals = [
    'international', 'visa', 'student visa', 'international student', 'f-1', 'f1',
    'international admissions', 'international education',
    'study abroad', 'overseas', 'abroad', 'exchange student',
  ];

  // Language/proficiency signals for international students
  const languageSignals = [
    'ielts', 'toefl', 'english proficiency', 'english requirement',
    'language requirement', 'english test', 'proficiency test',
  ];

  // Financial aid signals (strong domain indicator)
  const financialAidSignals = [
    'financial aid', 'aid package', 'efc', 'expected family contribution',
    'merit aid', 'need-based aid', 'merit scholarship', 'need-based scholarship',
    'grant', 'education grant', 'student loan', 'loan program',
    '529', 'education savings', 'college savings', 'parent plus',
    'fafsa', 'federal aid', 'federal student aid',
  ];

  // Short abbreviations for graduate tests (word-boundary matching)
  const graduateTestPatterns = [
    /\bGRE\b/, /\bGMAT\b/, /\bLSAT\b/, /\bMCAT\b/,
  ];

  // Strong career signals (including trades and military)
  const careerSignals = [
    'career', 'job', 'salary', 'salaries', 'compensation', 'internship',
    'resume', 'interview', 'networking', 'linkedin', 'hire', 'hiring',
    'employment', 'employer', 'industry', 'field', 'profession',
    'software engineer', 'data scientist', 'analyst', 'consultant',
    'doctor', 'nurse', 'lawyer', 'accountant', 'teacher',
    'bootcamp', 'certification', 'career change', 'career switch',
    'mid-career', 'entry level', 'promotion', 'raise',
    'bls', 'onet', 'occupational', 'job market', 'job growth',
    'roi', 'return on investment', 'worth it', 'payoff',
    'working', 'workplace', 'remote work', 'hybrid',
    'startup', 'freelance', 'self-employed', 'entrepreneur',
    'government', 'federal', 'nonprofit',
  ];

  // Trades-specific signals (strong career domain)
  const tradesSignals = [
    'trades', 'trade', 'skilled trade', 'trade school', 'vocational',
    'electrician', 'plumber', 'hvac', 'welding', 'welder',
    'construction', 'carpenter', 'pipefitter',
    'apprentice', 'apprenticeship', 'apprentice program',
    'union', 'union job', 'blue collar', 'journeyman',
    'skilled labor', 'vocational training',
  ];

  // Military-specific signals (can be admissions OR career)
  const militarySignals = [
    'military', 'armed forces', 'army', 'navy', 'air force', 'marines',
    'veteran', 'vet', 'service member', 'military service',
    'service academy', 'rotc', 'military career',
    'gi bill', 'gi bill education', 'veteran education',
    'skillbridge', 'military transition', 'military to civilian',
    'mos', 'military occupational', 'clearance', 'security clearance',
  ];

  // Score accumulation
  let admissionsScore = 0;
  let careerScore = 0;

  // Check admissions signals
  for (const signal of admissionsSignals) {
    if (lower.includes(signal)) admissionsScore++;
  }

  // Check graduate signals (count as admissions if application/program context)
  for (const signal of graduateSignals) {
    if (lower.includes(signal)) admissionsScore += 2; // Weight graduate heavily
  }

  // Check graduate tests (word-boundary + signal list)
  for (const pattern of graduateTestPatterns) {
    if (pattern.test(query)) admissionsScore += 1;
  }
  for (const signal of graduateTestSignals) {
    if (lower.includes(signal)) admissionsScore += 1;
  }

  // Check international signals
  for (const signal of internationalSignals) {
    if (lower.includes(signal)) admissionsScore += 2; // Weight international heavily
  }
  for (const signal of languageSignals) {
    if (lower.includes(signal)) admissionsScore += 1;
  }

  // Check financial aid signals (primary admissions concern)
  for (const signal of financialAidSignals) {
    if (lower.includes(signal)) admissionsScore += 2; // Weight financial aid heavily
  }

  // Check career signals
  for (const signal of careerSignals) {
    if (lower.includes(signal)) careerScore++;
  }

  // Check trades signals
  for (const signal of tradesSignals) {
    if (lower.includes(signal)) careerScore += 2; // Weight trades as career domain
  }

  // Check military signals (context-dependent)
  // If also has admissions context, count toward admissions (e.g., "GI Bill for nursing school")
  // Otherwise, count toward career
  let militaryHits = 0;
  for (const signal of militarySignals) {
    if (lower.includes(signal)) militaryHits++;
  }
  if (militaryHits > 0) {
    // Check if there's also admissions context
    const hasAdmissionsContext = /\b(school|program|degree|admission|apply|application|major)\b/i.test(query);
    if (hasAdmissionsContext) {
      admissionsScore += militaryHits;
    } else {
      careerScore += militaryHits * 2; // Weight military careers heavily
    }
  }

  // Use scope classifier domain hint if available
  if (scopeResult?.domain === 'admissions') admissionsScore += 3;
  if (scopeResult?.domain === 'career') careerScore += 3;

  // Parent signals + school context → lean admissions (parent asking about schools FOR a career)
  const parentSignal = /\b(?:my\s+(?:son|daughter|child|kid|teen)|parent|as\s+a\s+(?:mom|dad|parent))\b/i.test(query);
  const schoolSignal = /\b(?:school|program|study|degree|major|college|university)\b/i.test(lower);
  if (parentSignal && schoolSignal) admissionsScore += 2;
  else if (parentSignal) admissionsScore += 1;

  // Edge case: "Should I do MBA or become electrician?" → cross-domain, prefer admissions (MBA choice)
  const crossDomainPattern = /\b(or|versus|vs|instead of|rather than)\b/i;
  const hasCrossDomain = crossDomainPattern.test(query);
  if (hasCrossDomain && admissionsScore > 0 && careerScore > 0) {
    // Both domains present; tie-break by specific entity type
    // Graduate/international programs are admissions-focused
    const graduateHits = graduateSignals.filter(s => lower.includes(s)).length;
    const internationalHits = internationalSignals.filter(s => lower.includes(s)).length;
    if (graduateHits > 0 || internationalHits > 0) {
      admissionsScore += 1; // Slight boost to admissions
    }
  }

  // Decision tree (priority order)
  if (admissionsScore > careerScore && admissionsScore >= 1) return 'admissions';
  if (careerScore > admissionsScore && careerScore >= 1) return 'career';
  if (admissionsScore > 0) return 'admissions'; // Tie-break toward admissions
  if (careerScore > 0) return 'career';
  return 'general';
}

// ─── SLM Inference ──────────────────────────────────────────────

/**
 * Build the messages array for the SLM, including system prompt + RAG context.
 */
async function buildSLMMessages(history, userMessage, sessionContext, options = {}) {
  let systemPrompt = await loadSLMSystemPrompt();

  // Retrieve RAG context based on domain routing
  const domain = routeDomain(userMessage, options.scopeResult);
  const ragContext = await retrieveContext(userMessage, {
    topK: 6,
    domain,
    mode: 'standard',
  });

  if (ragContext && ragContext.chunks && ragContext.chunks.length > 0) {
    const contextStr = formatContext(ragContext.chunks);
    systemPrompt += `\n\n═══════════════════════════════════════════
RETRIEVED KNOWLEDGE (use this to inform your response)
═══════════════════════════════════════════
${contextStr}`;
  }

  // Inject boundary instruction for adjacent queries
  if (options.scopeLabel === 'adjacent') {
    systemPrompt += `\n\n${BOUNDARY_INSTRUCTION}`;
  }

  // Build profile string
  if (sessionContext) {
    const profileLines = [];
    if (sessionContext.userName) profileLines.push(`Name: ${sessionContext.userName}`);
    if (sessionContext.userType) profileLines.push(`Type: ${sessionContext.userType}`);
    if (sessionContext.school) profileLines.push(`School: ${sessionContext.school}`);
    if (profileLines.length > 0) {
      systemPrompt += `\n\n═══════════════════════════════════════════
CURRENT USER PROFILE
═══════════════════════════════════════════
${profileLines.join('\n')}`;
    }
  }

  // Build messages array (Llama 3.1 chat format)
  const messages = [{ role: 'system', content: systemPrompt }];

  // Add conversation history (last 10 exchanges)
  const trimmedHistory = history.slice(-20);
  for (const msg of trimmedHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // Add current user message
  messages.push({ role: 'user', content: userMessage });

  return { messages, domain, ragSources: ragContext?.sources || [] };
}

/**
 * Call the SLM endpoint (OpenAI-compatible API).
 * Supports: vLLM, TGI, Ollama, RunPod Serverless, any OpenAI-compatible server.
 */
async function callSLMEndpoint(messages) {
  if (!SLM_ENDPOINT) {
    throw new Error('SLM_ENDPOINT not configured');
  }

  // Validate messages structure
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Invalid messages: must be a non-empty array');
  }

  // Security: Never expose API key in error messages
  const headers = {
    'Content-Type': 'application/json',
  };

  if (SLM_API_KEY) {
    headers['Authorization'] = `Bearer ${SLM_API_KEY}`;
  }

  // Detect RunPod serverless vs OpenAI-compatible endpoint
  const isRunPod = SLM_ENDPOINT.includes('runpod.ai');

  let body;
  let url;

  if (isRunPod) {
    // RunPod Serverless format
    url = SLM_ENDPOINT;
    body = {
      input: {
        messages,
        max_tokens: SLM_MAX_TOKENS,
        temperature: SLM_TEMPERATURE,
        top_p: 0.9,
      }
    };
  } else {
    // OpenAI-compatible format (vLLM, TGI, Ollama, etc.)
    url = SLM_ENDPOINT.endsWith('/chat/completions')
      ? SLM_ENDPOINT
      : `${SLM_ENDPOINT}/v1/chat/completions`;

    body = {
      model: SLM_MODEL_NAME,
      messages,
      max_tokens: SLM_MAX_TOKENS,
      temperature: SLM_TEMPERATURE,
      top_p: 0.9,
      stop: ['<|eot_id|>'],  // Llama 3.1 stop token
    };
  }

  // Timeout: 90s default to handle RunPod cold starts (~60-90s first request)
  // Warm requests complete in <2s, so this only matters for cold starts.
  const timeout = parseInt(process.env.SLM_TIMEOUT || '90000', 10);
  if (timeout < 5000 || timeout > 180000) {
    throw new Error('SLM_TIMEOUT must be between 5000 and 180000 ms');
  }

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
    });
  } catch (fetchErr) {
    // Network error or timeout
    if (fetchErr.name === 'AbortError') {
      throw new Error(`SLM endpoint timeout after ${timeout}ms`);
    }
    throw new Error(`SLM endpoint unreachable: ${fetchErr.message}`);
  }

  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
      // Truncate to avoid spamming logs with large error responses
      if (errorText.length > 500) {
        errorText = errorText.slice(0, 500) + '...';
      }
    } catch {
      errorText = `HTTP ${response.status}`;
    }
    throw new Error(`SLM endpoint error ${response.status}${errorText ? ': ' + errorText : ''}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (parseErr) {
    throw new Error(`SLM returned invalid JSON: ${parseErr.message}`);
  }

  // Parse response based on format
  if (isRunPod) {
    // RunPod vLLM worker formats vary by configuration:
    //   RAW_OPENAI_OUTPUT=true:  { output: { choices: [{ message: { content: "..." } }] } }
    //   Default vLLM worker:     { output: { choices: [{ tokens: ["..."] }] } }
    //   Legacy/simple:           { output: "text" }
    if (data.output?.choices?.[0]?.message?.content) {
      return data.output.choices[0].message.content;
    }
    if (data.output?.choices?.[0]?.tokens) {
      // vLLM worker returns tokens array — join if multiple, take first if single
      const tokens = data.output.choices[0].tokens;
      return Array.isArray(tokens) ? tokens.join('') : String(tokens);
    }
    if (data.output?.choices?.[0]?.text) {
      return data.output.choices[0].text;
    }
    if (typeof data.output === 'string') {
      return data.output;
    }
    // Last resort: try to extract any text from the response
    console.error('[SLM] Unexpected RunPod response structure:', JSON.stringify(data).slice(0, 500));
    throw new Error('Unexpected RunPod response format');
  } else {
    // OpenAI format
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    throw new Error('Unexpected OpenAI-compatible response format');
  }
}

// ─── Main Chat Function ─────────────────────────────────────────

/**
 * Generate a response using the SLM.
 *
 * Returns:
 *   {
 *     response: string,         // The generated text
 *     mode: 'slm',
 *     model: string,            // Model name
 *     domain: string,           // 'admissions' | 'career' | 'general'
 *     retrievedSources: [],     // RAG sources used
 *     qualityCheck: {},         // Quality gate result
 *     usage: { inputTokens, outputTokens }  // Estimated
 *   }
 *
 * Throws if SLM is unavailable or endpoint errors.
 */
export async function chatSLM(history, userMessage, sessionContext, options = {}) {
  if (!isSLMAvailable()) {
    throw new Error('SLM not available — falling back to Claude');
  }

  const t0 = Date.now();

  // Build messages with RAG context
  const { messages, domain, ragSources } = await buildSLMMessages(
    history, userMessage, sessionContext, options
  );

  // Call SLM endpoint
  const rawResponse = await callSLMEndpoint(messages);

  // Quality gate
  const qc = qualityGate(rawResponse);

  const latency = Date.now() - t0;

  // Mark SLM as warm on any successful response
  slmStatus.state = 'warm';
  slmStatus.lastWarmAt = Date.now();
  startKeepAlive(); // Ensure keep-alive is running

  // Rough token estimation (for cost tracking — SLM is essentially free)
  const inputChars = messages.reduce((sum, m) => sum + m.content.length, 0);
  const estimatedInputTokens = Math.ceil(inputChars / 4);
  const estimatedOutputTokens = Math.ceil(rawResponse.length / 4);

  return {
    response: rawResponse,
    mode: 'slm',
    model: SLM_MODEL_NAME,
    domain,
    retrievedSources: ragSources,
    qualityCheck: qc,
    usage: {
      inputTokens: estimatedInputTokens,
      outputTokens: estimatedOutputTokens,
      model: SLM_MODEL_NAME,
    },
    latency,
  };
}

/**
 * Should this query be handled by the SLM or escalated to Claude?
 *
 * Decision tree:
 *   1. Engine mode requested → Claude (Opus)
 *   2. SLM not available → Claude
 *   3. Out of scope → hardcoded refusal (no model needed)
 *   4. Adjacent + low confidence → Claude (needs nuance)
 *   5. In-scope → SLM
 *   6. Adjacent + high confidence → SLM (with boundary instruction)
 */
// ─── Warm-Up Ping ──────────────────────────────────────────────

/**
 * Fire a lightweight request to the RunPod endpoint to wake the GPU worker.
 * This is non-blocking — call it and forget. If the endpoint is already warm,
 * this completes in <1s. If cold, it triggers the worker load (~60-90s) so
 * it's ready by the time the user sends their second message.
 *
 * Returns a promise that resolves to { warmed: boolean, latency: number }
 * but callers should NOT await this — fire and forget.
 */
export async function warmUpSLM() {
  if (!isSLMAvailable()) {
    return { warmed: false, reason: 'slm_not_available' };
  }

  slmStatus.state = 'warming';
  const t0 = Date.now();
  const isRunPod = SLM_ENDPOINT.includes('runpod.ai');

  try {
    if (isRunPod) {
      // RunPod: use /runsync with a minimal prompt to trigger worker activation
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SLM_API_KEY}`,
      };

      const body = {
        input: {
          messages: [
            { role: 'user', content: 'hello' }
          ],
          max_tokens: 1,
          temperature: 0.0,
        }
      };

      const response = await fetch(SLM_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000), // 120s — cold start can take a while
      });

      const latency = Date.now() - t0;

      // Check HTTP status — a 500/503 means the worker isn't actually ready
      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        slmStatus.state = 'error';
        slmStatus.lastError = `Warm-up HTTP ${response.status}: ${errBody.slice(0, 200)}`;
        console.warn(`[SLM] Warm-up got HTTP ${response.status} after ${latency}ms: ${errBody.slice(0, 200)}`);
        return { warmed: false, reason: `HTTP ${response.status}`, latency };
      }

      slmStatus.state = 'warm';
      slmStatus.lastWarmAt = Date.now();
      slmStatus.warmLatencyMs = latency;
      slmStatus.lastError = null;
      console.log(`[SLM] Warm-up complete in ${latency}ms (status: ${response.status})`);
      startKeepAlive(); // Keep the worker alive
      return { warmed: true, latency };
    } else {
      // OpenAI-compatible: health check endpoint or minimal completion
      const url = SLM_ENDPOINT.replace(/\/chat\/completions$/, '/models');
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${SLM_API_KEY}` },
        signal: AbortSignal.timeout(10000),
      });

      const latency = Date.now() - t0;
      slmStatus.state = 'warm';
      slmStatus.lastWarmAt = Date.now();
      slmStatus.warmLatencyMs = latency;
      slmStatus.lastError = null;
      console.log(`[SLM] Warm-up complete in ${latency}ms (status: ${response.status})`);
      return { warmed: true, latency };
    }
  } catch (err) {
    const latency = Date.now() - t0;
    slmStatus.state = 'error';
    slmStatus.lastError = err.message;
    console.warn(`[SLM] Warm-up failed after ${latency}ms: ${err.message}`);
    return { warmed: false, reason: err.message, latency };
  }
}

// ─── Keep-Alive Ping ─────────────────────────────────────────────
// Once the SLM is warmed for the first time, ping every 90s to prevent
// RunPod's idle timeout from killing the worker. Stops pinging if the
// SLM goes cold/error and hasn't been used in 5 minutes.

let keepAliveTimer = null;

function startKeepAlive() {
  if (keepAliveTimer) return; // Already running

  const PING_INTERVAL = 90000; // 90s — under RunPod's 120s idle timeout
  const MAX_IDLE = 300000;     // 5 minutes with no real traffic → stop pinging

  keepAliveTimer = setInterval(async () => {
    // If it's been too long since any real warm-up, stop keep-alive
    if (!slmStatus.lastWarmAt || (Date.now() - slmStatus.lastWarmAt) > MAX_IDLE) {
      console.log('[SLM-KEEPALIVE] No recent activity — stopping keep-alive');
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
      return;
    }

    // Only ping if we think it's warm
    if (slmStatus.state !== 'warm') return;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SLM_API_KEY}`,
      };
      const body = {
        input: {
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1,
          temperature: 0.0,
        }
      };
      const t0 = Date.now();
      await fetch(SLM_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });
      // NOTE: Do NOT update lastWarmAt here — pings must not reset the idle timer
      // or keep-alive runs forever. Only real chatSLM() calls update lastWarmAt.
      console.log(`[SLM-KEEPALIVE] Ping OK (${Date.now() - t0}ms)`);
    } catch (err) {
      console.warn(`[SLM-KEEPALIVE] Ping failed: ${err.message}`);
    }
  }, PING_INTERVAL);

  console.log('[SLM-KEEPALIVE] Started (90s interval, 10min idle cutoff)');
}

// Hook into warmUpSLM result — start keep-alive once warm
const _origWarmUp = warmUpSLM;

// We can't reassign exports, so we'll start keep-alive from the warmUpSLM success path.
// Instead, watch slmStatus for transitions to 'warm'.
// Simpler: just check in warmUpSLM and chatSLM success paths.

export function shouldUseSLM(options = {}) {
  // Never use SLM for engine mode — that's the premium Claude experience
  if (options.useEngine) return false;

  // SLM must be enabled and available
  if (!isSLMAvailable()) return false;

  // Scope-based routing
  const scope = options.scopeLabel || 'in_scope';
  const confidence = options.scopeConfidence || 0.8;

  // Out of scope never reaches a model
  if (scope === 'out_of_scope') return false;

  // In-scope: SLM handles it
  if (scope === 'in_scope') return true;

  // Adjacent: SLM handles ALL adjacent queries. The quality gate will
  // catch bad responses. Previously gated on confidence >= 0.7, but this
  // was blocking legitimate parent/career questions that the scope
  // classifier marked as adjacent with low confidence.
  if (scope === 'adjacent') return true;

  // Default: try SLM anyway (only out_of_scope is blocked above)
  return true;
}
