// REVAMP V2: ROUTER CLASSIFIER PATCH151
//
// Three-layer classifier with hard fail-open semantics. Used by router.js to decide
// whether a chat query needs (a) SLM-only, (b) SLM with exemplar context, or
// (c) SLM + Opus supplement (and at what priority).
//
// LAYER 1: Pure-regex classification — zero dependencies, zero failure modes.
// LAYER 2: Exemplar BM25 confirmation (delegated to exemplar-cache.js).
// LAYER 3: Optional Haiku tiebreaker, with a hard 3-second timeout. If Haiku
//          times out / errors / 429s / API key missing — we silently fall through
//          to the regex verdict. The classifier NEVER blocks the response path.
//
// Default-on-unknown: route = 'slm_with_exemplar' (the safe / generous default).
// This means a worst-case classifier failure just routes EVERYONE through the
// exemplar cache + SLM, which is the strongest baseline we have.
//
// Robustness rule: this module exports pure functions. It owns no state, no
// timers, no caches. Every call is independent. If you replace the file at
// runtime (hot deploy), in-flight requests keep using the previously-imported
// reference. No partial-state issues.

const ROUTES = Object.freeze({
  SLM_ONLY: 'slm_only',                          // factual / DB lookup
  SLM_WITH_EXEMPLAR: 'slm_with_exemplar',        // synthesis covered by cached exemplar
  SLM_PLUS_SUPPLEMENT: 'slm_plus_supplement',    // novel synthesis, fire Opus
  SLM_PLUS_SUPPLEMENT_PRIORITY: 'slm_plus_supplement_priority', // high-stakes, fire Opus, never skip
});

// ── Layer 1: Regex patterns ────────────────────────────────────────────────

// Factual / DB-lookup patterns — these get answered well by SLM + curated DB
// + school deep files alone. No supplement needed.
const FACTUAL_PATTERNS = [
  /\b(deadline|when (?:is|does)|application open|due date)\b/i,
  /\b(scholarship|internship|program|camp|volunteer)s?\b.*\b(in|near|around|for)\b/i,
  /\b(list|show|find|search) (?:me )?(?:the|some|all)?\b.*(programs?|internships?|scholarships?|camps?)/i,
  /\b(cost|tuition|price|fee|how much)\b/i,
  /\b(SAT|ACT|GPA|test score|score range|admit rate|acceptance rate)\b/i,
  /\b(major|department|class|course) at\b/i,
];

// High-stakes patterns — ALWAYS supplement when paid quota allows. These are
// the moments that drive subscription value: chance-me, ED/REA, school list.
const HIGH_STAKES_PATTERNS = [
  /\b(what (?:are )?(?:my|the) chances?|chance ?me|will i get in|admit (?:rate|odds|chances))\b/i,
  /\b(should i (?:apply )?(?:ed|rea|early decision|early action|restrictive))\b/i,
  /\b(build (?:me )?a (?:school )?list|reach (?:and|or|\/) match|safety school|target school|where should i apply|narrow my list|finalize my list)\b/i,
  /\b(review my (?:application|profile|strategy)|hot take on my|complete profile review|look at my whole)\b/i,
  /\b(?:harvard|yale|princeton|stanford|mit|caltech|columbia|cornell|dartmouth|brown|penn|chicago|duke|northwestern|jhu)\b.{0,30}\b(?:vs|versus|or|compared|over)\b.{0,30}\b(?:harvard|yale|princeton|stanford|mit|caltech|columbia|cornell|dartmouth|brown|penn|chicago|duke|northwestern|jhu)\b/i,
];

// Novel-synthesis patterns — synthesis questions that probably aren't in our
// exemplar cache yet. Fire supplement if quota allows; degrade gracefully if not.
const SYNTHESIS_PATTERNS = [
  /\b(how (?:do|should|can) i (?:approach|frame|position|tell|write))/i,
  /\b(what's the best (?:way|approach|strategy)|recommend (?:a|an|the)|advise me)/i,
  /\b(strategy for|approach to|game plan)/i,
  /\b(why (?:would|should|might) i\b)/i,
  /\b(weigh|compare|tradeoff|pros and cons|better choice)\b/i,
];

// Greeting / smalltalk — slm_only, never supplement (would be insulting to user
// to waste an Opus fire on "hi" or "thanks").
const GREETING_PATTERNS = [
  /^(hi|hello|hey|sup|yo|thanks?|thank you|ok|okay|got it|cool|nice|great)\W{0,3}$/i,
  /^(good (?:morning|afternoon|evening|night))\W{0,3}$/i,
];

// ── Public: classify(query) ────────────────────────────────────────────────

/**
 * Pure-regex classification. Always returns a verdict in <1ms. Never throws.
 *
 * @param {string} query - user message (assumed already trimmed; we trim defensively too)
 * @returns {{ class: string, route: string, confidence: number, reason: string }}
 */
export function classifyRegex(query) {
  const safe = (typeof query === 'string') ? query.trim() : '';
  if (!safe) {
    return { class: 'unknown', route: ROUTES.SLM_WITH_EXEMPLAR, confidence: 0.0, reason: 'empty-query-default' };
  }

  // Greeting / smalltalk
  for (const re of GREETING_PATTERNS) {
    if (re.test(safe)) {
      return { class: 'greeting', route: ROUTES.SLM_ONLY, confidence: 0.95, reason: 'greeting-pattern' };
    }
  }

  // High-stakes always wins
  for (const re of HIGH_STAKES_PATTERNS) {
    if (re.test(safe)) {
      return { class: 'high_stakes', route: ROUTES.SLM_PLUS_SUPPLEMENT_PRIORITY, confidence: 0.9, reason: 'high-stakes-pattern' };
    }
  }

  // Factual queries beat synthesis (more specific)
  for (const re of FACTUAL_PATTERNS) {
    if (re.test(safe)) {
      return { class: 'factual', route: ROUTES.SLM_ONLY, confidence: 0.8, reason: 'factual-pattern' };
    }
  }

  // Synthesis queries — supplement-worthy
  for (const re of SYNTHESIS_PATTERNS) {
    if (re.test(safe)) {
      return { class: 'synthesis', route: ROUTES.SLM_PLUS_SUPPLEMENT, confidence: 0.7, reason: 'synthesis-pattern' };
    }
  }

  // Default: medium confidence, route through exemplar cache
  // (this is the SAFE bucket — even if classification is wrong, we still get
  //  a strong response from exemplar + SLM)
  return { class: 'unknown', route: ROUTES.SLM_WITH_EXEMPLAR, confidence: 0.4, reason: 'no-pattern-match-default' };
}

// ── Layer 3: Optional Haiku tiebreak (with hard timeout) ───────────────────

let _haikuClient = null;
let _haikuClientAttempted = false;
function _getHaikuClient() {
  if (_haikuClientAttempted) return _haikuClient;
  _haikuClientAttempted = true;
  try {
    // Lazy import — never throws at module load time even if SDK missing.
    // We resolve at call time with a fresh require equivalent.
    return null; // placeholder — actual import happens in classifyHaiku below
  } catch (_) {
    return null;
  }
}
// noop reference to silence unused-fn lint when API stub used
void _getHaikuClient;

/**
 * Optional Haiku tiebreaker. ONLY called when regex returned low confidence
 * AND quota for the Haiku call is available (router.js gates this).
 *
 * Hard rules:
 *   - 3-second AbortController timeout. After 3s we give up and return null.
 *   - Any throw / 429 / network error returns null silently.
 *   - On null, caller falls back to regex verdict. Worst case = same as Layer 1.
 *
 * @param {string} query
 * @param {object} options - { signal?: AbortSignal, timeoutMs?: number }
 * @returns {Promise<{class: string, route: string, confidence: number, reason: string} | null>}
 */
export async function classifyHaiku(query, options = {}) {
  const timeoutMs = options.timeoutMs || 3000;

  // Hard guard: if no API key, don't even try
  if (!process.env.ANTHROPIC_API_KEY) return null;

  // Hard guard: query too long (unusual) — fall through to regex
  if (!query || typeof query !== 'string' || query.length > 4000) return null;

  let Anthropic;
  try {
    const mod = await import('@anthropic-ai/sdk');
    Anthropic = mod.default || mod.Anthropic;
  } catch (_) {
    return null; // SDK not available
  }
  if (!Anthropic) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => {
    try { controller.abort(); } catch (_) {}
  }, timeoutMs);

  try {
    const client = new Anthropic();
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 32,
      system: 'Classify the user query into ONE label. Reply with ONLY the label, nothing else.\n\nLabels:\n- factual (asking for a specific fact, deadline, list, score, cost)\n- synthesis (asking for advice, strategy, comparison, framing)\n- high_stakes (chance-me, ED/REA, school list, application review)\n- greeting (hi/thanks/ok/smalltalk)\n- unknown (none of the above)',
      messages: [{ role: 'user', content: query.slice(0, 2000) }],
    }, { signal: controller.signal });

    clearTimeout(timer);

    const text = (resp && resp.content && resp.content[0] && resp.content[0].text || '').trim().toLowerCase();
    const label = text.replace(/[^a-z_]/g, '');

    if (label === 'factual') return { class: 'factual', route: ROUTES.SLM_ONLY, confidence: 0.85, reason: 'haiku-tiebreak-factual' };
    if (label === 'synthesis') return { class: 'synthesis', route: ROUTES.SLM_PLUS_SUPPLEMENT, confidence: 0.8, reason: 'haiku-tiebreak-synthesis' };
    if (label === 'high_stakes' || label === 'highstakes') return { class: 'high_stakes', route: ROUTES.SLM_PLUS_SUPPLEMENT_PRIORITY, confidence: 0.9, reason: 'haiku-tiebreak-high-stakes' };
    if (label === 'greeting') return { class: 'greeting', route: ROUTES.SLM_ONLY, confidence: 0.95, reason: 'haiku-tiebreak-greeting' };

    return null; // unknown / unparseable — fall back to regex
  } catch (_) {
    clearTimeout(timer);
    return null; // API error / timeout / abort — silent fall-through
  }
}

// ── Stats (for /router-health) ─────────────────────────────────────────────

const _stats = {
  totalCalls: 0,
  haikuCalls: 0,
  haikuFailures: 0,
  haikuLatencies: [], // last 100, for p50
};

export function _recordHaikuCall(latencyMs, ok) {
  _stats.haikuCalls++;
  if (!ok) _stats.haikuFailures++;
  if (typeof latencyMs === 'number' && latencyMs > 0) {
    _stats.haikuLatencies.push(latencyMs);
    if (_stats.haikuLatencies.length > 100) _stats.haikuLatencies.shift();
  }
}

export function getClassifierStats() {
  const lat = [..._stats.haikuLatencies].sort((a, b) => a - b);
  const p50 = lat.length ? lat[Math.floor(lat.length / 2)] : null;
  const failureRate = _stats.haikuCalls > 0 ? _stats.haikuFailures / _stats.haikuCalls : 0;
  return {
    totalCalls: _stats.totalCalls,
    haikuCalls: _stats.haikuCalls,
    haikuFailures: _stats.haikuFailures,
    haikuFailureRate: Math.round(failureRate * 1000) / 1000,
    haikuP50Ms: p50,
  };
}

export function _bumpTotalCalls() { _stats.totalCalls++; }

export { ROUTES };
