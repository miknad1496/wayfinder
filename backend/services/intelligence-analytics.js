/**
 * Intelligence Analytics Service — Wayfinder
 *
 * Captures and analyzes how well the intelligence layer is performing across:
 * - Essay reviews (Claude Opus): score distribution, latency, token cost, parse success rate
 * - David concierge (Haiku): response quality, conversation depth, topic coverage
 * - Chat engine (main pipeline): routing efficiency, RAG hit rate, scope accuracy
 *
 * Data stored as JSONL in backend/logs/intelligence-analytics.jsonl
 * Aggregated stats served via admin API for the dashboard.
 *
 * This data feeds into model dev/training decisions:
 * - Which essay types produce weakest reviews?
 * - What topics does David struggle with?
 * - Where does RAG fail to surface relevant knowledge?
 * - What's the cost per user interaction by tier?
 */

import { appendFile, readFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOG_DIR = join(__dirname, '..', 'logs');
const ANALYTICS_FILE = join(LOG_DIR, 'intelligence-analytics.jsonl');

let dirEnsured = false;

// ─── In-Memory Aggregates (survive across requests, reset on deploy) ───

const aggregates = {
  essay: {
    totalReviews: 0,
    successCount: 0,
    failCount: 0,
    parseRecoveryCount: 0,
    totalTokensUsed: 0,
    totalLatencyMs: 0,
    scoreDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
    byEssayType: {},    // { 'common-app': { count, avgScore, avgTokens } }
    byModel: {},        // { 'claude-opus-4-6': { count, avgLatency } }
    recentErrors: [],   // last 10 errors for debugging
    lastReviewAt: null,
  },
  concierge: {
    totalMessages: 0,
    totalTokensUsed: 0,
    totalLatencyMs: 0,
    byTopic: {},        // inferred topic buckets
    avgResponseLength: 0,
    totalResponseChars: 0,
    recentMessages: [], // last 20 for quality spot-checks
    lastMessageAt: null,
  },
  chat: {
    totalQueries: 0,
    ragHits: 0,
    ragMisses: 0,
    scopeClassifications: { in_scope: 0, adjacent: 0, out_of_scope: 0 },
    engineUsage: { requested: 0, allowed: 0, denied: 0 },
    avgLatencyMs: 0,
    totalLatencyMs: 0,
    lastQueryAt: null,
  },
  since: new Date().toISOString(),
};

async function ensureLogDir() {
  if (dirEnsured) return;
  try {
    await mkdir(LOG_DIR, { recursive: true });
    dirEnsured = true;
  } catch { /* already exists */ }
}

/**
 * Log a raw analytics event to the JSONL file.
 * Non-blocking, fire-and-forget.
 */
async function logEvent(event) {
  try {
    await ensureLogDir();
    const line = JSON.stringify(event) + '\n';
    await appendFile(ANALYTICS_FILE, line);
  } catch (err) {
    console.error('[IntelAnalytics] Log write error:', err.message);
  }
}

// ─── Essay Review Analytics ─────────────────────────────────

/**
 * Record an essay review result for analytics.
 * Call this after every essay review attempt (success or failure).
 */
export function recordEssayReview({
  success,
  essayType = 'other',
  targetSchool = null,
  score = null,
  scoreLabel = null,
  tokensUsed = 0,
  latencyMs = 0,
  model = null,
  parseRecovered = false,
  error = null,
  wordCount = 0,
  userId = null,
}) {
  const event = {
    type: 'essay_review',
    timestamp: new Date().toISOString(),
    success,
    essayType,
    targetSchool,
    score,
    scoreLabel,
    tokensUsed,
    latencyMs,
    model: model || process.env.CLAUDE_MODEL_ENGINE || 'claude-opus-4-6',
    parseRecovered,
    error: error || null,
    wordCount,
    userId,
  };

  // Update in-memory aggregates
  aggregates.essay.totalReviews++;
  aggregates.essay.lastReviewAt = event.timestamp;

  if (success) {
    aggregates.essay.successCount++;
    aggregates.essay.totalTokensUsed += tokensUsed;
    aggregates.essay.totalLatencyMs += latencyMs;

    if (score >= 1 && score <= 10) {
      aggregates.essay.scoreDistribution[score] = (aggregates.essay.scoreDistribution[score] || 0) + 1;
    }

    if (parseRecovered) {
      aggregates.essay.parseRecoveryCount++;
    }

    // Per essay type aggregates
    if (!aggregates.essay.byEssayType[essayType]) {
      aggregates.essay.byEssayType[essayType] = { count: 0, totalScore: 0, totalTokens: 0 };
    }
    const typeAgg = aggregates.essay.byEssayType[essayType];
    typeAgg.count++;
    typeAgg.totalScore += (score || 0);
    typeAgg.totalTokens += tokensUsed;

    // Per model aggregates
    const modelName = event.model;
    if (!aggregates.essay.byModel[modelName]) {
      aggregates.essay.byModel[modelName] = { count: 0, totalLatency: 0 };
    }
    aggregates.essay.byModel[modelName].count++;
    aggregates.essay.byModel[modelName].totalLatency += latencyMs;
  } else {
    aggregates.essay.failCount++;
    aggregates.essay.recentErrors.push({ timestamp: event.timestamp, error, essayType });
    if (aggregates.essay.recentErrors.length > 10) {
      aggregates.essay.recentErrors.shift();
    }
  }

  // Fire-and-forget log
  logEvent(event);
}

// ─── David Concierge Analytics ──────────────────────────────

/**
 * Record a David concierge interaction.
 */
export function recordConciergeMessage({
  userId = null,
  userMessage = '',
  responseLength = 0,
  tokensUsed = 0,
  latencyMs = 0,
  model = null,
  error = null,
}) {
  const event = {
    type: 'concierge_message',
    timestamp: new Date().toISOString(),
    userId,
    userMessageLength: userMessage.length,
    userMessagePreview: userMessage.substring(0, 100),
    responseLength,
    tokensUsed,
    latencyMs,
    model: model || 'claude-haiku-4-5-20251001',
    error: error || null,
  };

  aggregates.concierge.totalMessages++;
  aggregates.concierge.totalTokensUsed += tokensUsed;
  aggregates.concierge.totalLatencyMs += latencyMs;
  aggregates.concierge.totalResponseChars += responseLength;
  aggregates.concierge.lastMessageAt = event.timestamp;

  // Keep last 20 messages for quality review
  aggregates.concierge.recentMessages.push({
    timestamp: event.timestamp,
    preview: userMessage.substring(0, 80),
    responseLen: responseLength,
    latencyMs,
  });
  if (aggregates.concierge.recentMessages.length > 20) {
    aggregates.concierge.recentMessages.shift();
  }

  logEvent(event);
}

// ─── Chat Engine Analytics ──────────────────────────────────

/**
 * Record a chat engine query result.
 * Call from the telemetry pipeline or directly from chat route.
 */
export function recordChatQuery({
  userId = null,
  scopeLabel = null,
  ragUsed = false,
  ragSourceCount = 0,
  engineRequested = false,
  engineAllowed = false,
  latencyMs = 0,
  tokensUsed = 0,
  generationMode = null,
  httpStatus = 200,
}) {
  const event = {
    type: 'chat_query',
    timestamp: new Date().toISOString(),
    userId,
    scopeLabel,
    ragUsed,
    ragSourceCount,
    engineRequested,
    engineAllowed,
    latencyMs,
    tokensUsed,
    generationMode,
    httpStatus,
  };

  aggregates.chat.totalQueries++;
  aggregates.chat.totalLatencyMs += latencyMs;
  aggregates.chat.lastQueryAt = event.timestamp;

  if (ragUsed) {
    aggregates.chat.ragHits++;
  } else {
    aggregates.chat.ragMisses++;
  }

  if (scopeLabel && aggregates.chat.scopeClassifications[scopeLabel] !== undefined) {
    aggregates.chat.scopeClassifications[scopeLabel]++;
  }

  if (engineRequested) {
    aggregates.chat.engineUsage.requested++;
    if (engineAllowed) aggregates.chat.engineUsage.allowed++;
    else aggregates.chat.engineUsage.denied++;
  }

  logEvent(event);
}

// ─── Aggregated Stats for Admin Dashboard ───────────────────

/**
 * Get computed analytics for the admin dashboard.
 * Returns aggregated stats with derived metrics.
 */
export function getIntelligenceAnalytics() {
  const e = aggregates.essay;
  const c = aggregates.concierge;
  const ch = aggregates.chat;

  return {
    since: aggregates.since,
    essay: {
      totalReviews: e.totalReviews,
      successRate: e.totalReviews > 0 ? Math.round((e.successCount / e.totalReviews) * 1000) / 10 : 0,
      parseRecoveryRate: e.successCount > 0 ? Math.round((e.parseRecoveryCount / e.successCount) * 1000) / 10 : 0,
      avgTokensPerReview: e.successCount > 0 ? Math.round(e.totalTokensUsed / e.successCount) : 0,
      avgLatencyMs: e.successCount > 0 ? Math.round(e.totalLatencyMs / e.successCount) : 0,
      avgScore: e.successCount > 0
        ? Math.round(Object.entries(e.scoreDistribution).reduce((sum, [score, count]) => sum + (parseInt(score) * count), 0) / e.successCount * 10) / 10
        : 0,
      scoreDistribution: { ...e.scoreDistribution },
      byEssayType: Object.fromEntries(
        Object.entries(e.byEssayType).map(([type, agg]) => [type, {
          count: agg.count,
          avgScore: agg.count > 0 ? Math.round((agg.totalScore / agg.count) * 10) / 10 : 0,
          avgTokens: agg.count > 0 ? Math.round(agg.totalTokens / agg.count) : 0,
        }])
      ),
      byModel: Object.fromEntries(
        Object.entries(e.byModel).map(([model, agg]) => [model, {
          count: agg.count,
          avgLatencyMs: agg.count > 0 ? Math.round(agg.totalLatency / agg.count) : 0,
        }])
      ),
      recentErrors: e.recentErrors,
      lastReviewAt: e.lastReviewAt,
    },
    concierge: {
      totalMessages: c.totalMessages,
      avgTokensPerMessage: c.totalMessages > 0 ? Math.round(c.totalTokensUsed / c.totalMessages) : 0,
      avgLatencyMs: c.totalMessages > 0 ? Math.round(c.totalLatencyMs / c.totalMessages) : 0,
      avgResponseLength: c.totalMessages > 0 ? Math.round(c.totalResponseChars / c.totalMessages) : 0,
      recentMessages: c.recentMessages,
      lastMessageAt: c.lastMessageAt,
    },
    chat: {
      totalQueries: ch.totalQueries,
      ragHitRate: ch.totalQueries > 0 ? Math.round((ch.ragHits / ch.totalQueries) * 1000) / 10 : 0,
      scopeBreakdown: { ...ch.scopeClassifications },
      engineUsage: { ...ch.engineUsage },
      avgLatencyMs: ch.totalQueries > 0 ? Math.round(ch.totalLatencyMs / ch.totalQueries) : 0,
      lastQueryAt: ch.lastQueryAt,
    },
    // Cost estimates (rough, based on Anthropic pricing)
    costEstimates: {
      essayTokensTotal: e.totalTokensUsed,
      conciergeTokensTotal: c.totalTokensUsed,
      // Opus ≈ $15/M input + $75/M output, rough avg $0.03 per 1K tokens
      essayCostEstimate: `$${(e.totalTokensUsed * 0.00003).toFixed(2)}`,
      // Haiku ≈ $0.25/M input + $1.25/M output, rough avg $0.001 per 1K tokens
      conciergeCostEstimate: `$${(c.totalTokensUsed * 0.000001).toFixed(2)}`,
    },
  };
}
