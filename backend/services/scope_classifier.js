/**
 * SS-04: Scope Classifier
 *
 * Pre-generation classifier that determines whether an incoming user query
 * falls within Wayfinder's domain before the SLM produces a response.
 *
 * Two-stage architecture:
 *   Stage 1 — Rule-based keyword scoring (fast path, <1ms)
 *   Stage 2 — Embedding similarity against reference exemplars (~20-50ms)
 *             (Lazy-loaded on first ambiguous query. Graceful fallback if unavailable.)
 *
 * Labels: 'in_scope', 'adjacent', 'out_of_scope'
 *
 * Design:
 *   - Fires on every input that passes SS-01.
 *   - 'adjacent' is the conservative default when confidence is low.
 *   - Kill switch: set SS04_ENABLED=false in env to bypass.
 *   - Shadow mode: set SS04_SHADOW_MODE=true to log without blocking.
 *
 * Addresses: 03A abstention score of 3.32/50%. The 03A checkpoint fails scope
 * boundaries half the time. SS-04 moves scope enforcement from model weights
 * into the serving layer where it can be tuned independently.
 */

// ─── Configuration ──────────────────────────────────────────────

const CONFIDENCE_THRESHOLD = 0.70;   // Below this, override any result to 'adjacent'
const SIMILARITY_THRESHOLD = 0.55;  // Min cosine similarity to trust an embedding match
const MARGIN_THRESHOLD = 0.10;      // Min gap between classes to be confident
const SS04_ENABLED = process.env.SS04_ENABLED !== 'false';
const SS04_SHADOW_MODE = process.env.SS04_SHADOW_MODE === 'true';
const NO_SIGNAL_FALLBACK = process.env.SS04_NO_SIGNAL_FALLBACK || 'adjacent'; // 'in_scope' or 'adjacent'

// ─── Stage 1: Rule-based keyword scoring ────────────────────────

const SCOPE_RULES = {
  // High-confidence OUT-OF-SCOPE markers.
  // If query matches one of these AND has no in-scope signal, classify immediately.
  out_of_scope_strong: [
    /\b(?:diagnos[ei]s?|prescription|prescribe|antidepressants?|psychiatrist)\b/i,
    /\b(?:lawsuit|attorney|lawyer|legal\s+action|sue\s+(?:the|my|them))\b/i,
    /\b(?:custody|divorce\s+(?:proceedings?|lawyer|attorney))\b/i,
    /\b(?:bitcoin|cryptocurrency|day\s*trad(?:e|ing)|forex)\b/i,
    /\b(?:couples?\s+therap(?:y|ist)|marriage\s+counsel(?:or|ing|ling)|dating\s+advice)\b/i,
    /\b(?:real\s+estate\s+invest(?:ment|ing|or)?|invest(?:ing)?\s+in\s+real\s+estate|rental\s+propert(?:y|ies)\s+invest(?:ment|ing)?|invest(?:ing)?\s+in\s+rental\s+propert(?:y|ies))\b/i,
    /\b(?:blood\s+pressure|cholesterol|dosage|side\s+effects?\s+of)\b/i,
    /\b(?:what\s+medication|should\s+i\s+take\s+(?:for|medication)|what\s+(?:pills?|drugs?|meds?)\s+(?:should|can|do))\b/i,
  ],

  // High-confidence IN-SCOPE markers.
  // If query matches one of these, it is at minimum adjacent (never pure out-of-scope).
  in_scope_strong: [
    /\b(?:college|colleges|university|universities|admissions?|acceptance\s+rate|GPA|SAT|ACT|FAFSA)\b/i,
    /\b(?:financial\s+aid|scholarships?|tuition|merit\s+aid)\b/i,
    /\b(?:majors?|degrees?|graduate\s+school|med(?:ical)?\s+school|law\s+school|nursing\s+school|dental\s+school|pharmacy\s+school)\b/i,
    /\b(?:careers?|salary|salaries|internships?|job\s+market|employment)\b/i,
    /(?:how\s+much|what)\s+(?:do|does|can|will)\s+[\w\s]+?\s+(?:make|earn|pay|get\s+paid)/i,
    /\b(?:applications?|common\s+app|essays?|recommendation\s+letters?)\b/i,
    /\b(?:waitlist|early\s+decision|early\s+action|regular\s+decision)\b/i,
    /\b(?:529|Pell\s+Grant|CSS\s+Profile|EFC|net\s+price)\b/i,
    /\b(?:school\s+list|safety\s+school|reach\s+school|target\s+school)\b/i,
    /\b(?:AP\s+(?:credit|class|classes|course|courses|calculus|statistics|physics|chemistry|biology|history|english|lit|lang|comp\s+sci|psych|econ|gov)|test[\s-]optional|GI\s+Bill)\b/i,
    /\b(?:class(?:es)?|course(?:s)?|curriculum|homework|grade(?:s)?)\b/i,
    /\b(?:study\s+(?:abroad|plan|habits?|for|group|guide|tips|schedule|skills)|field\s+of\s+study|studying\s+for)\b/i,
    /\b(?:extracurriculars?|clubs?|volunteer(?:ing)?|community\s+service)\b/i,
    /\b(?:transfer(?:ring)?|gap\s+year|deferr?(?:al|ed)|enrollment)\b/i,
    /\b(?:campus|dorms?|housing|orientation|roommates?)\b/i,
    /\b(?:test\s+prep|PSAT|LSAT|MCAT|GRE|GMAT)\b/i,
    /\b(?:bootcamps?|certifications?|trade\s+school|vocational)\b/i,
    /\b(?:resumes?|cover\s+letters?|interviews?|networking|linkedin)\b/i,
    /\b(?:student\s+loans?|debt|repayment|income[\s-]driven)\b/i,
    /\b(?:schools?|high\s+school|middle\s+school|elementary)\b/i,
    /\b(?:physical\s+therap(?:y|ist)|occupational\s+therap(?:y|ist)|speech\s+therap(?:y|ist))\b/i,
    /\b(?:pre[\s-]?med|pre[\s-]?law|pre[\s-]?dental|pre[\s-]?nursing)\b/i,
    /\b(?:bachelor'?s?|master'?s?|associate'?s?|doctorate|PhD|EdD)\b/i,
    /\b(?:PA\s+school|PT\s+school|OT\s+school|SLP|BS\/MD|MD\/PhD|JD|JD\/PhD)\b/i,
    /\b(?:professor|dean|registrar|bursar|syllabus|semester|quarter|credit\s+hours?)\b/i,
    /\b(?:valedictorian|salutatorian|magna\s+cum\s+laude|summa\s+cum\s+laude|cum\s+laude)\b/i,
    // K-12 education (parents asking about schools for children)
    /\b(?:kindergarten|preschool|elementary|middle\s+school|private\s+school|public\s+school|school\s+district)\b/i,
    /\b(?:gifted|magnet|charter|montessori|waldorf|IB\s+program|STEM\s+school)\b/i,
    /\b(?:my\s+(?:son|daughter|child|kid|teen)\s+(?:is|wants?|should|has|needs?))\b/i,
    /\b(?:parent(?:s|ing)?|family)\b.*\b(?:college|school|education|career|university|admissions?)\b/i,
    // Graduate programs (NEW)
    /\b(?:MBA|JD|MD|PhD|GMAT|LSAT|MCAT|GRE)\b/i,
    /\b(?:residency|fellowship|dissertation|thesis\s+defense)\b/i,
    /\b(?:graduate\s+(?:program|degree|school)|postgraduate|post[\s-]?grad|doctoral)\b/i,
    /\b(?:stipend|TA|RA|research\s+assistant|teaching\s+assistant)\b/i,
    // Financial aid deep (NEW)
    /\b(?:FAFSA\s+(?:appeal|correction)|professional\s+judgment|SAI|expected\s+family\s+contribution)\b/i,
    /\b(?:QuestBridge|Posse\s+(?:Foundation|Scholar)|Chevening|Rhodes\s+Scholar|Gates\s+Cambridge)\b/i,
    /\b(?:need[\s-]blind|need[\s-]aware|merit\s+scholarship|need[\s-]based|529\s+plan)\b/i,
    // International education (NEW)
    /\b(?:UCAS|Oxbridge|study\s+abroad|student\s+visa|F[\s-]?1|OPT|STEM\s+OPT|PGWP|co[\s-]?op\s+program)\b/i,
    /\b(?:Russell\s+Group|Go8|U15|Chevening|Rhodes|Gates\s+Cambridge)\b/i,
    // Trades & apprenticeships (NEW)
    /\b(?:apprenticeship|journeyman|master\s+electrician|union\s+(?:card|hall)|IBEW|UA\s+plumber)\b/i,
    /\b(?:HVAC|EPA\s+608|welding\s+(?:certification|license)|trade\s+school|skilled\s+trade|trades?\s+(?:career|apprentice|program|union|worker))\b/i,
    // Military transitions (NEW)
    /\b(?:GI\s+Bill|Post[\s-]?9\/11|Yellow\s+Ribbon|VR&E|SkillBridge|MOS\s+translation)\b/i,
    /\b(?:security\s+clearance|veteran|Helmets\s+to\s+Hardhats|VET\s+TEC)\b/i,
    // Career-specific pathways
    /\b(?:apprenticeship|journeyman|master\s+(?:electrician|plumber)|union\s+(?:card|hall))\b/i,
    /\b(?:military\s+(?:to\s+civilian|transition|career)|GI\s+Bill|veteran)\b/i,
    /\b(?:freelanc(?:e|ing|er)|self[\s-]employ(?:ed|ment)|side\s+hustle|gig\s+economy)\b/i,
    // ROI and outcomes
    /\b(?:worth\s+(?:it|the\s+(?:cost|money|investment))|ROI|return\s+on\s+(?:investment|education))\b/i,
    /\b(?:earnings?\s+(?:after|post|by\s+major)|debt[\s-]to[\s-]income|loan\s+repayment)\b/i,
  ],

  // OUT-OF-SCOPE domain indicators (weaker signal, need accumulation or absence of in-scope).
  out_of_scope_soft: [
    { pattern: /\b(?:medication|medic(?:al|ine)|symptom|treatment|dosage)\b/i, domain: 'medical' },
    { pattern: /\b(?:therap(?:y|ist)|mental\s+health|anxious|anxiety|depressed|depression|panic)\b/i, domain: 'medical' },
    { pattern: /\b(?:ADHD|autism|dyslexia|learning\s+disabilit(?:y|ies))\b/i, domain: 'medical' },
    { pattern: /\b(?:PTSD|trauma|sober|sobriety|addiction|anorexi|bulimi|eating\s+disorder)/i, domain: 'medical' },
    { pattern: /\b(?:pregnant|pregnancy|miscarriage|prenatal)\b/i, domain: 'medical' },
    { pattern: /\b(?:diabetes|insulin|chronic\s+(?:illness|condition|pain))\b/i, domain: 'medical' },
    { pattern: /\b(?:diagnos[ei]s|diagnosis|diagnose|disease|condition)\s+(?:for|of|from)/i, domain: 'medical' },
    { pattern: /\b(?:legal(?:ly)?|court\s+(?:order|date|hearing|case|ruling)|complaint|sue|filing|lawsuit)\b/i, domain: 'legal' },
    { pattern: /\b(?:legal\s+options?|legal\s+rights?|legal\s+process)\b/i, domain: 'legal' },
    { pattern: /\b(?:immigration\s+(?:law|process|status)|green\s+card|permanent\s+resident|deportation)\b/i, domain: 'legal' },
    { pattern: /\b(?:marriage|divorce|relationship|spouse|dating\s+(?:someone|life|app|scene|pool|site|advice)|couples?)\b/i, domain: 'relationship' },
    { pattern: /\b(?:boyfriend|girlfriend|partner|(?:my|the)\s+ex|break\s*(?:up|ing\s+up)|cheating)\b/i, domain: 'relationship' },
    { pattern: /\b(?:stalking|restraining\s+order|domestic\s+(?:violence|abuse|assault)|abusive\s+(?:partner|relationship)|intimate\s+partner\s+violence)\b/i, domain: 'relationship' },
    { pattern: /\b(?:invest(?:ment|ing)?\s+(?:portfolio|account|advisor|strategy|return)|stock(?:s|\s+market)?|(?:investment|stock)\s+portfolio|HELOC|mortgage|insurance\s+(?:premium|policy|plan|coverage)|crypto)\b/i, domain: 'financial_product' },
    { pattern: /\b(?:target[\s-]date\s+fund|index\s+fund|401k|IRA|Roth)\b/i, domain: 'financial_product' },
    { pattern: /\b(?:real\s+estate|rental|property\s+tax|refinance)\b/i, domain: 'financial_product' },
    { pattern: /\b(?:life\s+insurance|whole\s+life|cash\s+value|non[\s-]compete)\b/i, domain: 'financial_product' },
    { pattern: /\b(?:tax\s+(?:preparation|filing|return|refund|credit)|IRS|deduction|withholding)\b/i, domain: 'tax' },
  ],
};

// Domain-to-professional mapping for refusal template
const DOMAIN_MAP = {
  medical:           { label: 'medical or mental health', professional: 'a healthcare provider or licensed therapist' },
  legal:             { label: 'legal', professional: 'an attorney' },
  relationship:      { label: 'relationship', professional: 'a licensed counselor or therapist' },
  financial_product: { label: 'investment or financial product', professional: 'a licensed financial advisor' },
  tax:               { label: 'tax preparation', professional: 'a tax professional or CPA' },
  general:           { label: 'that topic', professional: 'an appropriate specialist' },
};

/**
 * Stage 1: Rule-based classification.
 * Returns { label, confidence, stage, domain } or { label: null } if unresolved.
 */
function classifyByRules(text) {
  // Track which patterns fired for telemetry
  const ruleHits = [];

  const hasStrongInScope = SCOPE_RULES.in_scope_strong.some(r => {
    const hit = r.test(text);
    if (hit) ruleHits.push(`is:${r.source.slice(0, 40)}`);
    return hit;
  });
  const hasStrongOutOfScope = SCOPE_RULES.out_of_scope_strong.some(r => {
    const hit = r.test(text);
    if (hit) ruleHits.push(`oos_strong:${r.source.slice(0, 40)}`);
    return hit;
  });

  // Collect soft out-of-scope domain hits
  const domainHits = new Set();
  for (const entry of SCOPE_RULES.out_of_scope_soft) {
    if (entry.pattern.test(text)) {
      domainHits.add(entry.domain);
      ruleHits.push(`oos_soft:${entry.domain}`);
    }
  }
  const hasOutOfScopeSoft = domainHits.size > 0;
  const primaryDomain = domainHits.size > 0 ? [...domainHits][0] : 'general';

  // Decision matrix:
  //
  // Strong OOS + No in-scope    → out_of_scope (high confidence)
  // Strong in-scope + No OOS    → in_scope (high confidence)
  // Strong in-scope + Any OOS   → adjacent (the query straddles domains)
  // No in-scope + Soft OOS      → escalate to Stage 2
  // No signals at all           → escalate to Stage 2

  if (hasStrongOutOfScope && !hasStrongInScope) {
    return { label: 'out_of_scope', confidence: 0.9, stage: 1, domain: primaryDomain, ruleHits };
  }
  if (hasStrongInScope && !hasStrongOutOfScope && !hasOutOfScopeSoft) {
    return { label: 'in_scope', confidence: 0.9, stage: 1, domain: null, ruleHits };
  }
  if (hasStrongInScope && (hasStrongOutOfScope || hasOutOfScopeSoft)) {
    return { label: 'adjacent', confidence: 0.8, stage: 1, domain: primaryDomain, ruleHits };
  }
  if (!hasStrongInScope && hasOutOfScopeSoft) {
    // Soft OOS signal but no in-scope signal. Could go either way.
    // If multiple OOS domains are hit, increase confidence it's truly OOS.
    if (domainHits.size >= 2) {
      return { label: 'out_of_scope', confidence: 0.7, stage: 1, domain: primaryDomain, ruleHits };
    }
    // Single soft OOS signal — escalate to Stage 2
    return { label: null, confidence: 0, stage: 1, domain: primaryDomain, ruleHits };
  }

  // No signal at all — escalate to Stage 2.
  // If Stage 2 is unavailable, this will fall through to the conservative default.
  return { label: null, confidence: 0, stage: 1, domain: null, noSignal: true, ruleHits };
}

// ─── Stage 2: Embedding similarity ──────────────────────────────

let pipeline = null;
let exemplarEmbeddings = null;

async function initEmbeddings() {
  if (pipeline) return true;

  try {
    const { pipeline: createPipeline } = await import('@xenova/transformers');
    pipeline = await createPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    // Load pre-computed exemplar embeddings if they exist
    const { promises: fsPromises } = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const exemplarPath = path.join(__dirname, 'scope_exemplars.json');

    try {
      const raw = await fsPromises.readFile(exemplarPath, 'utf-8');
      exemplarEmbeddings = JSON.parse(raw);
      console.log(
        `[SS-04] Embeddings initialized: ${exemplarEmbeddings.in_scope.length} in-scope, ` +
        `${exemplarEmbeddings.out_of_scope.length} out-of-scope exemplars`
      );
      return true;
    } catch {
      console.log('[SS-04] No scope_exemplars.json found — Stage 2 disabled, using rules only');
      return false;
    }
  } catch (err) {
    console.log(`[SS-04] @xenova/transformers not available — Stage 2 disabled: ${err.message}`);
    return false;
  }
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function classifyByEmbedding(text, ruleResult) {
  const available = await initEmbeddings();
  if (!available || !exemplarEmbeddings) return null;

  const output = await pipeline(text, { pooling: 'mean', normalize: true });
  const queryEmb = Array.from(output.data);

  let maxInScope = -1;
  for (const exemplar of exemplarEmbeddings.in_scope) {
    const sim = cosineSimilarity(queryEmb, exemplar.embedding);
    if (sim > maxInScope) maxInScope = sim;
  }

  let maxOutOfScope = -1;
  for (const exemplar of exemplarEmbeddings.out_of_scope) {
    const sim = cosineSimilarity(queryEmb, exemplar.embedding);
    if (sim > maxOutOfScope) maxOutOfScope = sim;
  }

  const margin = Math.abs(maxInScope - maxOutOfScope);

  if (margin < MARGIN_THRESHOLD) {
    return {
      label: 'adjacent',
      confidence: 0.5,
      stage: 2,
      domain: ruleResult.domain || 'general',
      debug: { maxInScope, maxOutOfScope, margin }
    };
  }

  if (maxInScope > maxOutOfScope && maxInScope >= SIMILARITY_THRESHOLD) {
    return {
      label: 'in_scope',
      confidence: maxInScope,
      stage: 2,
      domain: null,
      debug: { maxInScope, maxOutOfScope, margin }
    };
  }

  if (maxOutOfScope > maxInScope && maxOutOfScope >= SIMILARITY_THRESHOLD) {
    return {
      label: 'out_of_scope',
      confidence: maxOutOfScope,
      stage: 2,
      domain: ruleResult.domain || 'general',
      debug: { maxInScope, maxOutOfScope, margin }
    };
  }

  // Below threshold for both — default to adjacent
  return {
    label: 'adjacent',
    confidence: 0.4,
    stage: 2,
    domain: ruleResult.domain || 'general',
    debug: { maxInScope, maxOutOfScope, margin }
  };
}

// ─── Public API ─────────────────────────────────────────────────

/**
 * Classify a user query's scope.
 *
 * @param {string} userInput - Raw user message (already past SS-01)
 * @returns {Promise<{label: string, confidence: number, stage: number, domain: string|null}>}
 */
export async function classifyScope(userInput) {
  // Kill switch
  if (!SS04_ENABLED) {
    return { label: 'in_scope', confidence: 1.0, stage: 0, domain: null, bypassed: true };
  }

  const text = (userInput || '').trim();
  if (!text) {
    return { label: 'in_scope', confidence: 1.0, stage: 0, domain: null };
  }

  // Stage 1: Rules
  const ruleResult = classifyByRules(text);

  if (ruleResult.label && ruleResult.confidence >= CONFIDENCE_THRESHOLD) {
    // Shadow mode: log but don't block
    if (SS04_SHADOW_MODE) {
      console.log(`[SS-04 SHADOW] Would classify as ${ruleResult.label} (stage ${ruleResult.stage}, conf ${ruleResult.confidence})`);
      return { label: 'in_scope', confidence: 1.0, stage: 0, domain: null, shadow: ruleResult };
    }
    return ruleResult;
  }

  // Stage 2: Embedding similarity (only for unresolved queries)
  try {
    const embeddingResult = await classifyByEmbedding(text, ruleResult);

    if (embeddingResult && embeddingResult.confidence >= CONFIDENCE_THRESHOLD) {
      if (SS04_SHADOW_MODE) {
        console.log(`[SS-04 SHADOW] Would classify as ${embeddingResult.label} (stage 2, conf ${embeddingResult.confidence})`);
        return { label: 'in_scope', confidence: 1.0, stage: 0, domain: null, shadow: embeddingResult };
      }
      return embeddingResult;
    }

    // Below threshold or Stage 2 unavailable.
    // If rules found NO out-of-scope signal at all, use NO_SIGNAL_FALLBACK
    // (configurable: 'in_scope' for less friction, 'adjacent' for safer deployments).
    // If rules found SOME OOS signal but couldn't resolve, default to adjacent.
    const fallbackLabel = ruleResult.noSignal ? NO_SIGNAL_FALLBACK : 'adjacent';
    const fallback = {
      label: fallbackLabel,
      confidence: embeddingResult?.confidence || ruleResult.confidence || 0.5,
      stage: embeddingResult ? 2 : 1,
      domain: embeddingResult?.domain || ruleResult.domain || 'general',
      ruleHits: ruleResult.ruleHits || [],
    };

    if (SS04_SHADOW_MODE) {
      console.log(`[SS-04 SHADOW] Would classify as ${fallback.label} (fallback, conf ${fallback.confidence})`);
      return { label: 'in_scope', confidence: 1.0, stage: 0, domain: null, shadow: fallback };
    }
    return fallback;

  } catch (err) {
    // Embedding failure — degrade gracefully to adjacent
    console.error(`[SS-04] Embedding classification failed: ${err.message}`);
    const fallback = {
      label: 'adjacent',
      confidence: 0.3,
      stage: 1,
      domain: ruleResult.domain || 'general',
      ruleHits: ruleResult.ruleHits || [],
      error: err.message
    };

    if (SS04_SHADOW_MODE) {
      return { label: 'in_scope', confidence: 1.0, stage: 0, domain: null, shadow: fallback };
    }
    return fallback;
  }
}

/**
 * Get a domain-specific scope refusal response.
 * Hardcoded — never LLM-generated.
 */
export function getScopeRefusal(domain = 'general') {
  const mapping = DOMAIN_MAP[domain] || DOMAIN_MAP.general;
  return (
    `That falls outside what I'm built to help with. I specialize in education ` +
    `planning, career strategy, college admissions, and financial aid analysis. ` +
    `For ${mapping.label} questions, I'd recommend consulting ${mapping.professional}.\n\n` +
    `If there's an education or career angle to your situation, I'm ready to work on that.`
  );
}

/**
 * Boundary instruction injected into system prompt for 'adjacent' queries.
 */
export const BOUNDARY_INSTRUCTION =
  '\n\n[SCOPE BOUNDARY: This query touches on topics outside your primary domain. ' +
  'Address ONLY the education, career, or financial aid components. For any ' +
  'medical, legal, relationship, or financial product aspects, explicitly state ' +
  'that this falls outside your expertise and recommend the user consult a ' +
  'qualified professional. Do not provide medical diagnoses, legal strategies, ' +
  'relationship advice, or investment recommendations. Be direct about what ' +
  'you can and cannot help with.]';

/**
 * Check if SS-04 is enabled (for diagnostics).
 */
export function isEnabled() {
  return SS04_ENABLED && !SS04_SHADOW_MODE;
}

/**
 * Check if SS-04 is in shadow mode (for diagnostics).
 */
export function isShadowMode() {
  return SS04_SHADOW_MODE;
}
