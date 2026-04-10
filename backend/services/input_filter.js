/**
 * SS-01: Input Injection Filter
 *
 * Two-layer defense against prompt injection attacks:
 *   Layer 1 — Compiled regex patterns for known injection attack classes
 *             (system prompt extraction, instruction override, role manipulation)
 *   Layer 2 — Keyword density check for novel phrasings (2+ matches required)
 *
 * Addresses: ADV-01 (system prompt extraction), ADV-03 (instruction override),
 *            and the general class of attacks where user input contains
 *            directives intended to override the system prompt.
 *
 * Design principles:
 *   - Fires on EVERY user input, no exceptions.
 *   - False positives are preferred over false negatives in v1.
 *   - Blocked responses are hardcoded (never LLM-generated).
 *   - Returns structured result for logging and diagnostics.
 */

// ─── Layer 1: Compiled regex patterns ────────────────────────────
// Each pattern targets a known injection attack class.
// Order: extraction → override → role manipulation → essay ghostwriting

const INJECTION_PATTERNS = [
  // System prompt extraction
  {
    name: 'extraction_direct',
    pattern: /(?:what\s+is|show|tell|give|display|output|print|reveal|repeat)\s+(?:me\s+)?(?:your|the)\s+(?:\w+\s+)?(?:system\s+)?(?:prompt|instructions|rules|directives)/i,
  },
  {
    // Catches "What are your directives/instructions/rules?" — requires YOUR (not THE)
    // to avoid false positives on "What are the rules for FAFSA?"
    name: 'extraction_what_are',
    pattern: /what\s+are\s+your\s+(?:\w+\s+)?(?:instructions|rules|directives|guidelines|prompt)/i,
  },
  {
    name: 'extraction_full_text',
    pattern: /(?:give|show|tell|send)\s+(?:me\s+)?(?:the\s+)?(?:full|complete|entire)\s+(?:text|content|copy)\s+(?:of\s+)?(?:your|the)\s+(?:system\s+)?(?:prompt|instructions|rules)/i,
  },
  {
    name: 'extraction_repeat_above',
    pattern: /repeat\s+everything\s+above/i,
  },
  {
    name: 'extraction_repeat_full',
    pattern: /repeat\s+(?:your|the)\s+(?:entire|full|complete)\s+(?:system|initial)\s+(?:message|prompt|instructions)/i,
  },
  {
    name: 'extraction_how_configured',
    pattern: /(?:what|how)\s+were\s+you\s+(?:prompted|instructed|told|configured)/i,
  },
  {
    name: 'extraction_context',
    pattern: /(?:show|tell|reveal|display|output)\s+(?:me\s+)?(?:your|the)\s+(?:context|system|background|preamble|original\s+instruction)/i,
  },

  // Instruction override — allow optional qualifiers between verb and noun
  // e.g., "ignore your previous instructions" = ignore + your + previous + instructions
  {
    name: 'override_ignore',
    pattern: /ignore\s+(?:your\s+)?(?:all\s+|any\s+)?(?:previous\s+|prior\s+)?(?:instructions|rules|directives|guidelines|programming|prompt)/i,
  },
  {
    name: 'override_forget',
    pattern: /(?:forget|disregard|override|bypass|skip)\s+(?:(?:your|all|any|previous|prior|every)\s+){0,3}(?:instructions|rules|directives)/i,
  },
  {
    name: 'override_mode_switch',
    pattern: /you\s+are\s+now\s+(?:in\s+)?(?:developer|debug|admin|test|unrestricted|jailbreak)\s+mode/i,
  },
  {
    name: 'override_pretend',
    pattern: /pretend\s+you(?:'re|\s+are)\s+(?:a\s+)?(?:different|another|new)\s+(?:ai|assistant|model|chatbot)/i,
  },
  {
    name: 'override_educational_pretense',
    pattern: /for\s+(?:educational|research|testing|academic)\s+purposes?\s*,?\s*(?:demonstrate|show|pretend|act)\s+(?:that|as\s+if)/i,
  },
  {
    name: 'override_authority_claim',
    pattern: /(?:the\s+)?(?:anthropic|openai|meta|developer|admin)\s+(?:team|staff|company)\s+(?:says?|wants?|requires?|told)/i,
  },

  // Role manipulation
  {
    name: 'role_forced_compliance',
    pattern: /you\s+(?:are|should\s+be|must\s+be)\s+(?:required|obligated|forced)\s+to\s+(?:help|answer|assist|comply)/i,
  },
  {
    name: 'role_jailbreak_dan',
    pattern: /you\s+are\s+now\s+(?:DAN|STAN|JDAN|DUDE|AIM|KEVIN)\b/i,
  },
  {
    name: 'role_unrestricted_ai',
    pattern: /(?:act|behave|respond)\s+(?:as|like)\s+(?:a\s+)?(?:completely\s+)?(?:unrestricted|unfiltered|uncensored|unlimited)\s+(?:ai|assistant|model)/i,
  },

  // Data exfiltration attempts (NEW)
  {
    name: 'exfiltration_data_export',
    pattern: /(?:export|dump|save|download)\s+(?:all|every|the)\s+(?:conversation|message|chat|data|context|memory)/i,
  },
  {
    name: 'exfiltration_leak',
    pattern: /leak\s+(?:my|user|training|system|internal)\s+data/i,
  },

  // System prompt extraction variants (NEW)
  {
    name: 'extraction_variant_summarize',
    pattern: /(?:summarize|recap)\s+(?:everything|all(?:\s+of)?(?:\s+(?:that|what))?)\s+(?:you(?:'ve|\s+have)?\s+(?:been|said|told|written|instructed)|(?:before|above|prior|earlier|that\s+(?:was|came)))/i,
  },
  {
    name: 'extraction_variant_list',
    pattern: /(?:list|enumerate)\s+(?:all|every|each)\s+(?:of\s+)?(?:your|(?:the\s+)?(?:system(?:'s)?|internal|hidden))\s+(?:(?:\w+\s+)?(?:rules?|guidelines?|instructions?|constraints?|limitations?))/i,
  },

  // Essay ghostwriting — handle "college application essay" as a compound noun
  {
    name: 'role_essay_ghostwriting',
    pattern: /(?:do|write|create|generate)\s+(?:my|the|this)\s+(?:college\s+)?(?:application\s+)?(?:essay|personal\s+statement|application)\s+for\s+me/i,
  },
];

// ─── Layer 2: Keyword density ────────────────────────────────────
// Novel phrasings that don't match exact patterns but contain
// suspicious keyword combinations. Requires 2+ matches to trigger.

const INJECTION_KEYWORDS = [
  'ignore instructions',
  'previous instructions',
  'prior instructions',
  'override',
  'system prompt',
  'developer mode',
  'jailbreak',
  'pretend you are',
  'unrestricted',
  'no restrictions',
  'bypass',
  'admin mode',
  'repeat everything',
  'output your',
  'reveal your',
  'your directives',
  'your programming',
  'system context',
  'internal instructions',
  'hidden rules',
  'extract data',
  'dump memory',
  'original prompt',
  'background task',
  'security measure',
  'access control',
  'authentication',
];

// ─── Blocked response ────────────────────────────────────────────
// Hardcoded. Never generated by the LLM.

const INJECTION_REFUSAL =
  "I'm Wayfinder, an education and career advisor. " +
  "I can help you with college planning, career strategy, financial aid analysis, " +
  "and school selection. What would you like to work on?";

/**
 * Check if user input contains a prompt injection attempt.
 *
 * @param {string} userInput - Raw user message
 * @returns {{ blocked: boolean, reason: string, layer: string|null }}
 *   blocked: true if input should not reach the model
 *   reason: machine-readable reason code (for logging)
 *   layer: which detection layer fired ('pattern' | 'keyword_density' | null)
 */
export function checkInjection(userInput) {
  const text = (userInput || '').trim();

  if (!text) {
    return { blocked: false, reason: 'empty', layer: null };
  }

  // Layer 1: Pattern match
  for (const { name, pattern } of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: true, reason: name, layer: 'pattern' };
    }
  }

  // Layer 2: Keyword density
  const textLower = text.toLowerCase();
  let keywordHits = 0;

  for (const kw of INJECTION_KEYWORDS) {
    if (textLower.includes(kw)) {
      keywordHits++;
    }
  }

  if (keywordHits >= 2) {
    return {
      blocked: true,
      reason: `keyword_density_${keywordHits}`,
      layer: 'keyword_density',
    };
  }

  return { blocked: false, reason: 'clean', layer: null };
}

/**
 * Get the hardcoded refusal response.
 */
export function getInjectionRefusal() {
  return INJECTION_REFUSAL;
}
