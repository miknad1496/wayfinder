// REVAMP V2: ROUTER ORCHESTRATOR PATCH151
//
// The router answers ONE question per chat call:
//   "Should this query get an Opus supplement on top of SLM, and if so should
//    we also prepend exemplar context so the answer is even stronger?"
//
// It composes three independently-failing modules:
//   1. router-classifier.js   — what KIND of query is this?
//   2. exemplar-cache.js      — do we have a pre-synthesized response that fits?
//   3. supplement-quota.js    — does the user have an Opus fire left today?
//
// Plus:
//   - A circuit breaker around Opus (if too many failures recently, route
//     everyone to slm_with_exemplar for 5 minutes, auto-recover)
//   - A feature flag (ROUTER_ENABLED env var) so the whole module can be
//     turned off in <60 seconds via Render env edit, no redeploy needed
//   - An outer try/catch so ANY internal exception falls back to "no router
//     opinion, let chat.js use its existing logic" — guaranteed non-regression
//
// THIS MODULE NEVER THROWS. THE PUBLIC API ALWAYS RESOLVES.
//
// Decision shape:
//   {
//     enabled: boolean,           // false = router off, caller should ignore
//     route: string,              // one of ROUTES.*
//     supplementAllowed: boolean, // chat.js sets engineAllowed = engineAllowed || this
//     exemplarContext: string,    // empty if no cache hit; prepend to SLM input if non-empty
//     reservationId: string|null, // pass to commitSupplement / releaseSupplement after Opus
//     reason: string,             // human-readable diagnostic
//     classifierVerdict: object,  // for telemetry
//     cacheHit: boolean,          // for telemetry
//     quota: object,              // remaining/cap/etc for telemetry
//   }

import { classifyRegex, classifyHaiku, ROUTES, _bumpTotalCalls, _recordHaikuCall } from './router-classifier.js';
import { lookupExemplars, hasCacheHit, formatExemplarContext, _recordLookup } from './exemplar-cache.js';
import { reserveSupplement, commitSupplement, releaseSupplement, getSupplementStatus, getQuotaAggregateStats } from './supplement-quota.js';

// ── Feature flag ────────────────────────────────────────────────────────────
//
// ROUTER_ENABLED defaults to FALSE. Patch 151 ships dark. Dan flips it to true
// on Render env when ready, watches morning-pulse for one cycle, flips off if
// anything looks wrong.
//
// To enable: set Render env ROUTER_ENABLED=true
// To disable: set ROUTER_ENABLED=false (or unset). No redeploy needed; env
//             edits restart the dyno in ~30 seconds.

function _routerEnabled() {
  const v = String(process.env.ROUTER_ENABLED || '').toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

// ── Circuit breaker (around Opus calls) ─────────────────────────────────────
//
// Tracks the last N supplement-failure timestamps. If FAILURE_WINDOW_MS contains
// FAILURE_THRESHOLD or more failures, the breaker trips. While tripped, the
// router refuses to recommend supplement (route falls to slm_with_exemplar).
// After COOLDOWN_MS the breaker auto-resets.
//
// In-process state. If Render restarts the dyno, breaker resets — that's fine,
// because the fresh dyno hasn't seen the failures.

const FAILURE_THRESHOLD = 3;
const FAILURE_WINDOW_MS = 60 * 1000;
const COOLDOWN_MS = 5 * 60 * 1000;

let _failures = []; // array of timestamps
let _trippedUntil = 0;

function _isBreakerTripped() {
  return Date.now() < _trippedUntil;
}

export function recordSupplementFailure() {
  const now = Date.now();
  _failures.push(now);
  // Drop failures outside the window
  _failures = _failures.filter(ts => (now - ts) < FAILURE_WINDOW_MS);
  if (_failures.length >= FAILURE_THRESHOLD && !_isBreakerTripped()) {
    _trippedUntil = now + COOLDOWN_MS;
    console.warn('[router] CIRCUIT BREAKER TRIPPED — routing all supplements to slm_with_exemplar for ' + (COOLDOWN_MS / 1000) + 's');
  }
}

export function recordSupplementSuccess() {
  // Successes don't reset the failure window directly; we let it expire by time.
  // This keeps the breaker conservative under load.
}

export function getBreakerStatus() {
  const now = Date.now();
  const recent = _failures.filter(ts => (now - ts) < FAILURE_WINDOW_MS);
  return {
    state: _isBreakerTripped() ? 'tripped' : 'closed',
    recentFailures: recent.length,
    threshold: FAILURE_THRESHOLD,
    windowMs: FAILURE_WINDOW_MS,
    cooldownMs: COOLDOWN_MS,
    trippedUntil: _trippedUntil ? new Date(_trippedUntil).toISOString() : null,
  };
}

// ── Defaults (used when router is OFF or fails) ─────────────────────────────

const SAFE_DEFAULT = Object.freeze({
  enabled: false,
  route: 'unrouted',
  supplementAllowed: false,
  exemplarContext: '',
  reservationId: null,
  reason: 'router-disabled',
  classifierVerdict: null,
  cacheHit: false,
  quota: null,
});

// ── Cache-hit threshold (calibrated empirically; tunable via env) ──────────

const CACHE_HIT_THRESHOLD = parseFloat(process.env.ROUTER_CACHE_THRESHOLD || '5.0');
const STRONG_CACHE_THRESHOLD = parseFloat(process.env.ROUTER_STRONG_CACHE_THRESHOLD || '8.0');

// ── Public: evaluate(query, user, options) ──────────────────────────────────

/**
 * The single entry point. Compose all robustness layers.
 *
 * @param {string} query - the user's message
 * @param {object} user - { id, email, plan, isAdmin, isVIP }
 * @param {object} options - { engineAlreadyAllowed?: boolean (manual toggle override), useHaikuTiebreak?: boolean }
 * @returns {Promise<object>} decision (see file header)
 */
export async function evaluate(query, user, options = {}) {
  // FAST PATH: router off → return safe default. chat.js falls through to its
  // existing behavior. ZERO behavior change vs pre-patch-151.
  if (!_routerEnabled()) {
    return { ...SAFE_DEFAULT, reason: 'router-disabled-via-env' };
  }

  // Outer try/catch: any unexpected exception inside the router becomes "router
  // not enabled this call." chat.js falls through. Never crashes.
  try {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return { ...SAFE_DEFAULT, enabled: true, route: ROUTES.SLM_ONLY, reason: 'empty-query' };
    }

    _bumpTotalCalls();

    // ── Step 1: regex classification (always succeeds) ─────────────────────
    let verdict = classifyRegex(query);

    // ── Step 2: optional Haiku tiebreak when regex confidence is low ───────
    if (verdict.confidence < 0.5 && options.useHaikuTiebreak !== false) {
      const tStart = Date.now();
      try {
        const haikuVerdict = await classifyHaiku(query, { timeoutMs: 3000 });
        const lat = Date.now() - tStart;
        if (haikuVerdict) {
          verdict = haikuVerdict;
          _recordHaikuCall(lat, true);
        } else {
          _recordHaikuCall(lat, false);
        }
      } catch (_) {
        // classifyHaiku already swallows — but defense in depth
        _recordHaikuCall(Date.now() - tStart, false);
      }
    }

    // ── Step 3: cache lookup ───────────────────────────────────────────────
    let exemplars = [];
    let cacheHit = false;
    const cacheStart = Date.now();
    try {
      exemplars = await lookupExemplars(query, 3);
    } catch (_) {
      exemplars = [];
    }
    const topScore = exemplars.length > 0 ? exemplars[0].score : 0;
    cacheHit = topScore >= CACHE_HIT_THRESHOLD;
    _recordLookup(Date.now() - cacheStart, cacheHit);

    const exemplarContext = cacheHit ? formatExemplarContext(exemplars.slice(0, 2)) : '';

    // ── Step 4: should we route to supplement? ─────────────────────────────
    //
    // Logic (in priority order):
    //   - HIGH STAKES: always supplement if quota allows. Even if cache hit,
    //     we still want fresh Opus for life-decision questions like ED/REA.
    //   - SLM_ONLY (factual/greeting): never supplement.
    //   - STRONG cache hit (>= 8.0): skip supplement, exemplar is enough.
    //     Saves $$$ when the question is very well-covered.
    //   - SLM_PLUS_SUPPLEMENT (synthesis): supplement if quota allows AND
    //     no strong cache hit.
    //   - Default (low-confidence unknown): try supplement if quota allows;
    //     otherwise fall back to slm_with_exemplar.

    const wantsSupplement = (verdict.route === ROUTES.SLM_PLUS_SUPPLEMENT_PRIORITY)
      || (verdict.route === ROUTES.SLM_PLUS_SUPPLEMENT && topScore < STRONG_CACHE_THRESHOLD)
      || (verdict.route === ROUTES.SLM_WITH_EXEMPLAR && !cacheHit && verdict.confidence < 0.5);

    const isFactualOrGreeting = (verdict.route === ROUTES.SLM_ONLY);
    const isStrongCacheHit = topScore >= STRONG_CACHE_THRESHOLD;

    // Manual engine toggle (engineAlreadyAllowed) ALWAYS reserves quota.
    // The user explicitly opted in; don't override that.
    const engineAlreadyAllowed = !!options.engineAlreadyAllowed;
    const shouldTryReserve = !isFactualOrGreeting && !isStrongCacheHit && (wantsSupplement || engineAlreadyAllowed);

    // Circuit breaker check — even if we want to supplement, don't if breaker tripped
    if (shouldTryReserve && _isBreakerTripped()) {
      return {
        enabled: true,
        route: ROUTES.SLM_WITH_EXEMPLAR,
        supplementAllowed: false,
        exemplarContext,
        reservationId: null,
        reason: 'breaker-tripped',
        classifierVerdict: verdict,
        cacheHit,
        quota: null,
      };
    }

    // ── Step 5: quota reservation ──────────────────────────────────────────
    let reservationId = null;
    let quotaInfo = null;
    let supplementAllowed = false;

    if (shouldTryReserve && user && user.id) {
      try {
        const tier = String(user.plan || 'free').toLowerCase();
        const adjustedTier = (user.isAdmin || user.isVIP) ? 'admin' : tier;
        const reservation = await reserveSupplement(user.id, adjustedTier);
        quotaInfo = reservation;
        if (reservation.allowed) {
          reservationId = reservation.reservationId;
          supplementAllowed = true;
        }
      } catch (err) {
        console.warn('[router] reserve threw (treating as no-quota): ' + err.message);
      }
    }

    // ── Step 6: build final decision ───────────────────────────────────────
    let finalRoute;
    if (supplementAllowed && verdict.route === ROUTES.SLM_PLUS_SUPPLEMENT_PRIORITY) {
      finalRoute = ROUTES.SLM_PLUS_SUPPLEMENT_PRIORITY;
    } else if (supplementAllowed) {
      finalRoute = ROUTES.SLM_PLUS_SUPPLEMENT;
    } else if (isStrongCacheHit) {
      finalRoute = ROUTES.SLM_WITH_EXEMPLAR;
    } else if (cacheHit) {
      finalRoute = ROUTES.SLM_WITH_EXEMPLAR;
    } else if (isFactualOrGreeting) {
      finalRoute = ROUTES.SLM_ONLY;
    } else {
      finalRoute = ROUTES.SLM_WITH_EXEMPLAR; // safe default
    }

    return {
      enabled: true,
      route: finalRoute,
      supplementAllowed,
      exemplarContext,
      reservationId,
      reason: verdict.reason + (cacheHit ? '|cache-hit' : '') + (supplementAllowed ? '|supplement-reserved' : '|supplement-skipped'),
      classifierVerdict: verdict,
      cacheHit,
      quota: quotaInfo,
    };
  } catch (err) {
    // ANY unexpected exception → treat as router disabled. chat.js falls back.
    console.warn('[router] evaluate threw (falling back to existing logic): ' + (err && err.message));
    return { ...SAFE_DEFAULT, reason: 'router-internal-error' };
  }
}

/**
 * Called by chat.js after a successful Opus supplement fire.
 * Idempotent. Safe to call even if reservationId is null.
 */
export async function commitSupplementUse(userId, reservationId) {
  if (!userId || !reservationId) return { ok: false };
  try {
    const r = await commitSupplement(userId, reservationId);
    if (r.ok) recordSupplementSuccess();
    return r;
  } catch (err) {
    console.warn('[router] commit threw: ' + (err && err.message));
    return { ok: false };
  }
}

/**
 * Called by chat.js after a failed Opus supplement fire (so the slot is freed).
 * Also records the failure for circuit breaker.
 * Idempotent.
 */
export async function releaseSupplementUse(userId, reservationId) {
  if (!userId || !reservationId) return { ok: false };
  try {
    const r = await releaseSupplement(userId, reservationId);
    recordSupplementFailure();
    return r;
  } catch (err) {
    console.warn('[router] release threw: ' + (err && err.message));
    recordSupplementFailure();
    return { ok: false };
  }
}

/**
 * Health snapshot for /api/admin/router-health.
 */
export async function getHealthSnapshot() {
  const { getClassifierStats } = await import('./router-classifier.js');
  const { getCacheStats } = await import('./exemplar-cache.js');

  const [classifier, cache, quota] = await Promise.all([
    Promise.resolve(getClassifierStats()),
    Promise.resolve(getCacheStats()),
    getQuotaAggregateStats().catch(() => ({ error: 'quota_io_error' })),
  ]);

  const breaker = getBreakerStatus();

  // Anomaly detection — anything weird gets surfaced
  const anomalies = [];
  if (cache.indexBuildErrors > 0) anomalies.push('exemplar-index-build-errors=' + cache.indexBuildErrors);
  if (classifier.haikuFailureRate > 0.05) anomalies.push('haiku-failure-rate=' + classifier.haikuFailureRate);
  if (breaker.state === 'tripped') anomalies.push('circuit-breaker-tripped');
  if (cache.hitRate !== null && cache.totalLookups > 50 && cache.hitRate < 0.15) {
    anomalies.push('low-cache-hit-rate=' + cache.hitRate);
  }
  if (quota.ioError) anomalies.push('quota-io-error');

  return {
    enabled: _routerEnabled(),
    timestamp: new Date().toISOString(),
    classifier,
    cache,
    quota,
    breaker,
    cacheThreshold: CACHE_HIT_THRESHOLD,
    strongCacheThreshold: STRONG_CACHE_THRESHOLD,
    anomalies,
  };
}

export { ROUTES };
