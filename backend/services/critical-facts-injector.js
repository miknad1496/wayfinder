/**
 * critical-facts-injector.js — Topical critical facts that BYPASS BM25.
 *
 * Created by REVAMP V2: CRITICAL-FACTS INJECTOR PATCH46. Some high-value tactical facts (current-
 * cycle FAFSA changes, federal loan caps, etc.) are too important to
 * leave to BM25 retrieval, where they may get crowded out by other
 * chunks. This module ALWAYS injects them when topical intent matches —
 * mirrors the pattern of curated-search.js for module-specific entries.
 *
 * Topics seeded: financial_aid. Add more by extending TOPICS map.
 */

const TOPICS = {
  financial_aid: {
    keywords: [
      'fafsa', 'css profile', 'css', 'efc', 'sai', '529', 'pell',
      'financial aid', 'finaid', 'student aid', 'subsidized', 'unsubsidized',
      'parent plus', 'parent loan', 'pay for college', 'cover the cost',
      'questbridge', 'merit aid', 'need-based', 'aid package', 'aid eligibility',
      'aid calculation', 'aid optimization', 'fund college', 'pay tuition',
      'qualify for aid', 'become independent for aid', 'reduce assets',
      'loans', 'student loan', 'minimal loans', 'minimize debt',
      'afford college', 'afford tuition', 'tuition', 'cost of college',
      'cost of attendance', 'college cost', 'pay for school',
      'household income', 'family assets', 'family income', 'parent assets',
      'expected contribution', 'out of pocket', 'net price', 'sticker price',
      'wue', 'reciprocity', 'in-state', 'out-of-state tuition', 'scholarship',
    ],
    facts: [
      '═══════════════════════════════════════════',
      'CRITICAL CURRENT-CYCLE FINANCIAL AID FACTS — verified against the FAFSA Simplification Act (effective 2024-25, current as of 2026 cycle)',
      '═══════════════════════════════════════════',
      "",
      '1. SAI replaces EFC. The Student Aid Index (SAI) replaced the Expected Family Contribution (EFC) in 2024-25. NEVER use the term "EFC" — it is outdated. SAI can go as low as -$1500 (deeper need than EFC could express). Schools no longer call it EFC.',
      "",
        '2. Sibling discount REMOVED. Pre-2024, having multiple kids in college simultaneously divided parental contribution. Post-2024 it is GONE. Each kid pays full SAI.',
      "",
      '3. GRANDPARENT-OWNED 529 DISTRIBUTIONS NO LONGER COUNTED on FAFSA (HUGE for high-asset families). Pre-2024, distributions were treated as student income, taxed at 50% in aid calc. Post-2024, distributions are NOT REPORTED on FAFSA at all. For families with grandparents willing to own 529s, this is a near-optimal vehicle. CAVEAT: CSS Profile (used by ~250 private schools) STILL counts grandparent 529s. So the strategy works for FAFSA-only schools, not CSS Profile schools.',
      "",
      '4. CSS Profile vs FAFSA. FAFSA = federal aid form, free, used by ALL schools for federal aid. CSS Profile = separate $25-32/school form, used by ~250 mostly-private schools for institutional aid. CSS asks for MORE: home equity, sibling education costs, non-custodial parent income, retirement in some cases. KEY EXAMPLES: Northeastern requires CSS Profile. UW Foster does NOT. Stanford, Yale, Princeton require it. Most state flagships do not.',
      "",
      '5. Federal loan caps for dependent undergrads (PER YEAR / AGGREGATE): Year 1: $5,500 total ($3,500 sub + $2,000 unsub). Year 2: $6,500 ($4,500 sub + $2,000 unsub). Years 3-4: $7,500 ($5,500 sub + $2,000 unsub). AGGREGATE LIMIT: $31,000 over 4 years. Do NOT cite higher numbers. Independent students have higher caps; PARENT PLUS loans are uncapped (up to cost of attendance) but at ~7-8% interest.',
      "",
      '6. ASSET TREATMENT IN SAI: Parent assets count at 5.64% (modest hit). Student assets count at 20% (heavy hit — avoid UTMA/UGMA). Retirement accounts (401k, IRA, 403b) are EXCLUDED from FAFSA. Home equity is EXCLUDED from FAFSA but COUNTED on CSS Profile. Small businesses + family farms ARE NOW reportable post-2024 (changed from pre-2024 exclusion).',
      "",
      '7. DEPENDENCY status — actual rules: Independent ONLY if 24+, married, has dependents, veteran/active military, ward of court / foster youth (after age 13), emancipated minor, unaccompanied homeless youth, or graduate student. WORK EARNINGS DO NOT MAKE A STUDENT INDEPENDENT. Living separately does not make them independent. Tax-dependent status is unrelated to FAFSA dependency.',
      "",
      '8. WUE (Western Undergraduate Exchange) — tuition reciprocity for residents of 16 western states + territories. Reduces out-of-state tuition to ~150% of in-state at participating schools. INCLUDED: Univ of Oregon, Oregon State, Univ of Hawaii, Boise State, Univ of Idaho, Montana State, Univ of Wyoming, Univ of Nevada Reno, Univ of New Mexico, Univ of Arizona, Northern Arizona, Colorado School of Mines. NOT INCLUDED: UW Seattle, UC Berkeley, UCLA, ASU Tempe.',
      "",
      '9. Appeal levers when aid is insufficient: (a) changed circumstances (job loss, medical, divorce), (b) competitive offer appeal ("School A offered $X, can School B match?"), (c) special circumstances (one-time income spikes that don\'t reflect ongoing finances). Small private LACs are most flexible. Large public flagships and highly selective privates are least flexible.',
      "",
      '10. CITATION RULE: When you reference any of these facts in your response, mention them confidently — they are CURRENT and CITED. Do not hedge with "I\'m not sure" or "check with a financial aid officer." These are settled, verified facts as of the 2026-27 aid cycle.',
      '═══════════════════════════════════════════',
    ].join('\n'),
  },
  // Add more topics here later (essay_strategy, ed_rea_strategy, etc.)
};

function detectTopic(query) {
  const q = (query || "").toLowerCase();
  for (const [topic, cfg] of Object.entries(TOPICS)) {
    if (cfg.keywords.some(kw => q.includes(kw))) return topic;
  }
  return null;
}

/**
 * MAIN ENTRY POINT.
 * @param {string} query - the user message
 * @returns {string} formatted critical-facts block, or "" if no topic matched
 */
export function getCriticalFacts(query) {
  const topic = detectTopic(query);
  if (!topic) return "";
  return "\n" + TOPICS[topic].facts;
}

export const _internals = { detectTopic, TOPICS };
