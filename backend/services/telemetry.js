/**
 * Telemetry Service — Wayfinder Internal Alpha
 *
 * Structured JSON logging for every chat request.
 * Each line is a self-contained JSON object appended to a JSONL file.
 *
 * Fields logged:
 *   - timestamp, session_id, user_id
 *   - SS-01: injection_blocked, injection_reason, injection_layer
 *   - SS-04: scope_label, scope_confidence, scope_domain, scope_stage
 *   - Generation: generation_mode, boundary_instruction_injected, hard_refusal_served
 *   - RAG: rag_used, sources_count
 *   - Engine: engine_mode, engine_allowed
 *   - Tokens: input_tokens, output_tokens, total_tokens
 *   - Latency: ss01_ms, ss04_ms, generation_ms, total_ms
 *   - Outcome: http_status, error (if any)
 *
 * Usage:
 *   import { createTelemetryEvent, logTelemetry } from '../services/telemetry.js';
 *   const tEvent = createTelemetryEvent(sessionId, userId);
 *   tEvent.ss04 = { label: 'in_scope', ... };
 *   ...
 *   logTelemetry(tEvent);
 */

import { appendFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Log directory: backend/logs/ (gitignored, created on first write)
const LOG_DIR = join(__dirname, '..', 'logs');
const LOG_FILE = join(LOG_DIR, 'telemetry.jsonl');

let dirEnsured = false;

// ─── In-Memory Routing Counters (survives across requests, resets on deploy) ──
const routingCounters = {
  total: 0,
  byMode: {},          // e.g. { haiku_intake: 12, slm: 45, engine: 3, standard: 2 }
  byOutcome: {},       // e.g. { 200: 55, 429: 3, 500: 1 }
  lastReset: new Date().toISOString(),
};

/**
 * Get snapshot of in-memory routing stats (non-destructive).
 */
export function getRoutingStats() {
  const total = routingCounters.total || 1; // avoid /0
  const breakdown = {};
  for (const [mode, count] of Object.entries(routingCounters.byMode)) {
    breakdown[mode] = {
      count,
      pct: Math.round((count / total) * 1000) / 10, // e.g. 45.3
    };
  }
  return {
    total: routingCounters.total,
    breakdown,
    outcomes: { ...routingCounters.byOutcome },
    since: routingCounters.lastReset,
  };
}

/**
 * Create a blank telemetry event with all fields initialized.
 * Caller fills in fields as the request progresses through the pipeline.
 */
export function createTelemetryEvent(sessionId = null, userId = null) {
  return {
    timestamp: new Date().toISOString(),
    session_id: sessionId,
    user_id: userId,

    // SS-01: Input filter
    ss01: {
      blocked: false,
      reason: null,
      layer: null,
    },

    // SS-04: Scope classifier
    ss04: {
      label: null,        // 'in_scope', 'adjacent', 'out_of_scope'
      confidence: null,
      domain: null,
      stage: null,
      rule_hits: [],      // which patterns fired (for debugging classifications)
    },

    // Generation pipeline
    generation: {
      mode: null,          // 'normal', 'boundary_injected', 'hardcoded_refusal', 'blocked'
      boundary_instruction_injected: false,
      hard_refusal_served: false,
    },

    // RAG
    rag: {
      used: false,
      sources_count: 0,
    },

    // Engine mode
    engine: {
      requested: false,
      allowed: false,
    },

    // Token usage
    tokens: {
      input: 0,
      output: 0,
      total: 0,
    },

    // Latency (milliseconds)
    latency: {
      ss01_ms: 0,
      ss04_ms: 0,
      generation_ms: 0,
      total_ms: 0,
    },

    // Outcome
    outcome: {
      http_status: 200,
      error: null,
    },
  };
}

/**
 * Write the telemetry event as a single JSON line to the log file.
 * Also logs a compact summary to stdout so Render's log drain captures it
 * (the JSONL file resets on each deploy since Render's filesystem is ephemeral).
 * Non-blocking — fire and forget. Errors go to stderr, never interrupt the request.
 */
export async function logTelemetry(event) {
  // ── Update in-memory routing counters ──
  try {
    routingCounters.total++;
    const mode = event.generation?.mode || 'unknown';
    routingCounters.byMode[mode] = (routingCounters.byMode[mode] || 0) + 1;
    const status = String(event.outcome?.http_status || 200);
    routingCounters.byOutcome[status] = (routingCounters.byOutcome[status] || 0) + 1;
  } catch { /* counter updates should never fail */ }

  try {
    // Always emit a compact log line to stdout for Render's log drain
    const summary = {
      t: event.timestamp,
      sid: event.session_id,
      ss01: event.ss01?.blocked ? `BLOCKED:${event.ss01.reason}` : 'pass',
      ss04: event.ss04?.label || '-',
      mode: event.generation?.mode || '-',
      rag: event.rag?.used ? event.rag.sources_count : 0,
      tokens: event.tokens?.total || 0,
      ms: event.latency?.total_ms || 0,
      status: event.outcome?.http_status || 200
    };
    console.log(`[Telemetry] ${JSON.stringify(summary)}`);
  } catch { /* never interrupt the request */ }

  try {
    if (!dirEnsured) {
      await mkdir(LOG_DIR, { recursive: true });
      dirEnsured = true;
    }
    const line = JSON.stringify(event) + '\n';
    await appendFile(LOG_FILE, line, 'utf8');
  } catch (err) {
    console.error('[Telemetry] File write failed:', err.message);
  }
}
