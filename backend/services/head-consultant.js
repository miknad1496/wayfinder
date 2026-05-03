/**
 * Head Consultant Supplement — REVAMP V2: HEAD CONSULTANT SUPPLEMENT PATCH74
 *
 * Runs Claude Opus on TOP of a Wayfinder SLM response to add a layer of strategic
 * synthesis. Architecture: SLM = workhorse (RAG-grounded, fact-rich); Opus = supervisor
 * (multi-document synthesis, calibrated strategic judgment, catches what SLM missed).
 *
 * Combined output is presented as "Head Consultant note" appended to SLM response.
 * Costs 1 engine credit per fire (same quota as the prior engine mode).
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

/**
 * Auto-promotion criteria — query types where Opus supplement adds disproportionate value.
 * Returns true if the query is "Head Consultant worthy."
 *
 * High-value patterns:
 *   - Chance-me / admit-rate questions ("what are my chances", "will I get into")
 *   - School-list strategy ("build me a list", "reach/match/safety", "where should I apply")
 *   - ED/REA strategy ("should I apply ED", "is REA right for")
 *   - Multi-school comparison ("X vs Y", "compare Stanford and MIT")
 *   - Full-app strategy review ("review my application strategy", "look at my whole profile")
 *   - Specific top-tier school name + strategic verb (Harvard/MIT/Stanford/etc + "should I" / "how to")
 */
export function shouldRunHeadConsultantSupplement(query) {
  if (!query || typeof query !== 'string') return false;
  const q = query.toLowerCase();

  // Chance-me patterns
  if (/(what are my chances|will i get into|chance me|chances at|admit (?:rate|odds|chances))/.test(q)) return true;

  // School list strategy
  if (/(build (?:me )?a (?:school )?list|reach (?:and|or|\/) match|safety school|target school|where should i apply|narrow my list|finalize my list|how many schools|college list)/.test(q)) return true;

  // ED/REA strategy
  if (/(should i (?:apply )?ed|should i (?:apply )?rea|is rea (?:right|worth)|is ed (?:right|worth)|ed strategy|rea strategy|ed (?:1|2) (?:to|at)|where to ed|where to rea)/.test(q)) return true;

  // Multi-school comparison
  if (/(\b(?:vs|versus|compared? to|or)\b.*\b(?:harvard|mit|stanford|yale|princeton|columbia|penn|brown|dartmouth|cornell|caltech|chicago|northwestern|duke|johns hopkins|jhu|notre dame|nyu|georgetown|berkeley|ucla|ucsd|umich|uva|unc|williams|amherst|swarthmore|pomona|wellesley|bowdoin)\b)/.test(q)) return true;

  // Full strategy review
  if (/(review my (?:application )?strategy|look at my whole|my full application|my overall|complete profile review|hot take on my)/.test(q)) return true;

  // Top-tier school name + strategic ask
  const topTierPattern = /\b(harvard|mit|stanford|yale|princeton|columbia|penn|brown|dartmouth|cornell|caltech|chicago|northwestern|duke|johns hopkins|jhu|notre dame|amherst|williams|swarthmore|pomona|wellesley)\b/;
  const strategicVerb = /(should i|how (?:do|should|can) i|what's the best way|recommend|guide me|advise me|help me decide|chances)/;
  if (topTierPattern.test(q) && strategicVerb.test(q)) return true;

  return false;
}

/**
 * Run Opus as a supplement on top of an SLM response.
 *
 * @param {string} query - The user's original message
 * @param {string} slmResponse - The text the Wayfinder SLM produced
 * @param {string} ragContext - The RAG context that was injected into SLM (school files, curated entries, critical-facts)
 * @param {object} sessionContext - User profile + session history snippet
 * @param {object} options - { signal: AbortSignal, maxTokens?: number }
 * @returns {Promise<{success: boolean, supplement?: string, tokensUsed?: number, error?: string}>}
 */
export async function runHeadConsultantSupplement(query, slmResponse, ragContext, sessionContext, options = {}) {
  const startTime = Date.now();
  if (!query || !slmResponse) {
    return { success: false, error: 'query + slmResponse required' };
  }

  const profileBlock = sessionContext && sessionContext.profile
    ? '\n\n=== STUDENT PROFILE ===\n' + JSON.stringify(sessionContext.profile, null, 2)
    : '';

  const ragBlock = ragContext && ragContext.length > 100
    ? '\n\n=== ADVISOR RAG CONTEXT ===\n' + ragContext.slice(0, 8000)
    : '';

  const systemPrompt = [
    'You are the Head Consultant — a senior college admissions strategist supplementing a Wayfinder Advisor response.',
    '',
    'The Wayfinder Advisor (a smaller, RAG-grounded model) has already given the student a substantive answer. The Advisor has access to all of Wayfinder\'s curated data: 92+ school deep files, 14 AP exam knowledge files, critical-facts on financial aid / test policy / ED-REA / essay strategy / school selection / recommendation letters / interviews / demonstrated interest / course rigor / test prep / AP score optimization, plus the student\'s profile and conversation history.',
    '',
    'YOUR JOB:',
    '1. Read the user query, the Advisor\'s response, and the same context the Advisor saw.',
    '2. Add a "Head Consultant note" of 200-400 words that ELEVATES the Advisor\'s response with what only senior strategic judgment adds:',
    '   - Catch second-order effects the Advisor missed (e.g., "if you ED here, you forfeit ED elsewhere; here\'s the tradeoff")',
    '   - Synthesize across multiple data points (e.g., "given your profile + this school\'s yield-protection pattern + the ED admit lift...")',
    '   - Calibrate strategic priorities ("the highest-leverage move for you is X, not Y, because...")',
    '   - Surface counterfactuals and edge cases ("if your test score lands at 1480 instead of 1520, the calculus shifts to...")',
    '   - Name specific tradeoffs (Cooper Union\'s Hometest > grades; Harvey Mudd Common Core changes the major-fit math)',
    '3. DO NOT repeat the Advisor\'s factual content. Build ON TOP of it.',
    '4. DO NOT contradict the Advisor unless the Advisor was demonstrably wrong (and even then, be diplomatic).',
    '5. Open with "Here\'s the next layer:" or similar — make clear you\'re supplementing.',
    '6. End with one concrete next-step recommendation specific to the student.',
    '',
    'TONE: senior, calm, direct, strategically calibrated. The Advisor handled the basics — you\'re the one with the gray hair who\'s seen 1000 of these decisions play out.',
    '',
    'LENGTH: strictly 200-400 words. Do not exceed.',
  ].join('\n');

  const userPrompt = [
    '=== USER QUERY ===',
    query,
    '',
    '=== ADVISOR RESPONSE (the Wayfinder SLM\'s answer) ===',
    slmResponse,
    profileBlock,
    ragBlock,
    '',
    '=== YOUR TASK ===',
    'Read the Advisor response above. Add the Head Consultant note (200-400 words) that elevates it with senior strategic judgment. Output ONLY the note — no preamble, no JSON, no markdown headers beyond inline emphasis.',
  ].join('\n');

  const maxTokens = options.maxTokens || 700;
  const controller = options.signal ? null : new AbortController();
  const timeout = controller ? setTimeout(() => controller.abort(), 60000) : null;

  try {
    const resp = await client.messages.create({
      model: process.env.CLAUDE_MODEL_ENGINE || process.env.CLAUDE_MODEL || 'claude-opus-4-6',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }, { signal: options.signal || controller.signal });

    const supplement = (resp.content?.[0]?.text || '').trim();
    const tokensUsed = (resp.usage?.input_tokens || 0) + (resp.usage?.output_tokens || 0);
    const latencyMs = Date.now() - startTime;
    return { success: true, supplement, tokensUsed, latencyMs };
  } catch (err) {
    return { success: false, error: err.message || 'Head Consultant supplement failed' };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

/**
 * Format the combined output: SLM response + Head Consultant note as a single string.
 * Uses a clear visual separator so the user sees the two-layer architecture.
 */
export function formatHeadConsultantCombined(slmResponse, supplement) {
  if (!supplement) return slmResponse;
  return slmResponse.trimEnd()
    + '\n\n---\n\n'
    + '**🎓 Head Consultant note**\n\n'
    + supplement.trim();
}
