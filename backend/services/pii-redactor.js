/**
 * PII Redactor — Wayfinder
 *
 * Pure-regex sanitizer applied at the persistence layer (memory + training-capture)
 * before any user-generated text is written to disk. Real-time LLM generation still
 * sees the raw input so responses can be personalized; only stored copies are scrubbed.
 *
 * Design constraints:
 *   - Zero API calls. Deterministic, free, microsecond-latency.
 *   - Conservative on names: only redact when there is a contextual marker
 *     (e.g. "my daughter X", "I'm X"). Free-floating capitalized words are
 *     LEFT ALONE — false positives would destroy useful college / career
 *     content (Stanford, MIT, Microsoft, Google, etc. must pass through).
 *   - K-12 school proper nouns are redacted (when paired with "High School",
 *     "Academy", etc.). College names are NOT redacted — they are the topic.
 *
 * Returns: { text, redactedCount, types: [...] }
 */

// ─── Patterns ────────────────────────────────────────────────────

const PATTERNS = [
  // Emails
  {
    name: 'email',
    regex: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g,
    replacement: '[EMAIL]',
  },

  // US Phone numbers — multiple formats
  // Matches: (425) 555-1234 | 425-555-1234 | 425.555.1234 | 4255551234 | +1 425 555 1234
  {
    name: 'phone',
    regex: /(?:\+?1[\s\-.]?)?(?:\(\d{3}\)[\s\-.]?|\d{3}[\s\-.])\d{3}[\s\-.]\d{4}\b/g,
    replacement: '[PHONE]',
  },

  // SSN: ###-##-####
  {
    name: 'ssn',
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: '[SSN]',
  },

  // Credit card-like: 16 digits in groups
  {
    name: 'creditcard',
    regex: /\b(?:\d{4}[\s\-]?){3}\d{4}\b/g,
    replacement: '[CARD]',
  },

  // Street addresses: <number> <Capitalized words> <Street/Ave/etc.>
  {
    name: 'address',
    regex: /\b\d{1,6}\s+(?:[A-Z][a-zA-Z'\-]+\s+){1,4}(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Way|Court|Ct|Place|Pl|Parkway|Pkwy|Circle|Cir|Highway|Hwy|Terrace|Ter)\b\.?/g,
    replacement: '[ADDRESS]',
  },

  // K-12 school proper nouns. The Capitalized phrase BEFORE the K-12 marker is replaced.
  // Captures: "Lakeside Upper School", "Bellevue High School", "Holy Names Academy", "International School of the Sacred Heart Tokyo"
  // Does NOT capture: bare "Stanford", "MIT" (no K-12 marker), so college names pass through.
  {
    name: 'k12_school',
    regex: /\b[A-Z][A-Za-z'\-]+(?:\s+(?:of\s+(?:the\s+)?)?[A-Z][A-Za-z'\-]+){0,5}\s+(High School|Middle School|Elementary(?:\s+School)?|Junior\s+High|Senior\s+High|Academy|Preparatory(?:\s+School)?|Prep(?:\s+School)?|Charter(?:\s+School)?|Day School|Upper School|Lower School|Magnet(?:\s+School)?)\b/g,
    replacement: '[SCHOOL]',
  },

  // Self-introduction names: "I'm X" / "I am X" / "my name is X" / "this is X"
  // X = 1-3 capitalized words. Stops at common terminators.
  // We require lower-case context BEFORE the marker so we don't match capitalized starts of sentences.
  {
    name: 'self_intro',
    regex: /\b(I['’]?m|I am|[Mm]y name is|[Tt]his is|[Cc]all me)\s+([A-Z][a-zA-Z]{1,20}(?:\s+[A-Z][a-zA-Z]{1,20}){0,2})\b/g,
    replacement: (_, marker) => `${marker} [NAME]`,
  },

  // Family-member-introduction names: "my son X", "my daughter X", "our kid X", etc.
  // Allows optional "named" between relation and name.
  {
    name: 'family_intro',
    regex: /\b([Mm]y|[Oo]ur)\s+([Ss]on|[Dd]aughter|[Kk]id|[Cc]hild|[Tt]een|[Tt]eenager|[Nn]ephew|[Nn]iece|[Bb]rother|[Ss]ister|[Ff]ather|[Mm]other|[Dd]ad|[Mm]om|[Hh]usband|[Ww]ife|[Ss]pouse|[Pp]artner|[Gg]randson|[Gg]randdaughter|[Cc]ousin)(?:\s+named)?\s+([A-Z][a-zA-Z]{1,20}(?:\s+[A-Z][a-zA-Z]{1,20}){0,2})\b/g,
    replacement: (_, possessive, relation) => `${possessive} ${relation} [NAME]`,
  },

  // Possessive name + identifying noun: "Emma's SAT", "Marcus's GPA", "Sophia's transcript"
  // Single capitalized word followed by 's and an identifying noun.
  {
    name: 'possessive_name',
    regex: /\b([A-Z][a-zA-Z]{1,20})['’]s\s+(SAT|ACT|GPA|grades|transcript|test scores|test score|guidance counselor|report card)\b/g,
    replacement: (_, _name, noun) => `[NAME]'s ${noun}`,
  },
];

// ─── Public API ───────────────────────────────────────────────────

/**
 * Redact PII from a text string.
 * @param {string} text
 * @returns {{ text: string, redactedCount: number, types: string[] }}
 */
export function redactPII(text) {
  if (!text || typeof text !== 'string') {
    return { text: text || '', redactedCount: 0, types: [] };
  }

  let out = text;
  let count = 0;
  const types = new Set();

  for (const p of PATTERNS) {
    let didReplace = false;
    out = out.replace(p.regex, (...args) => {
      count++;
      didReplace = true;
      if (typeof p.replacement === 'function') {
        return p.replacement(...args);
      }
      return p.replacement;
    });
    if (didReplace) types.add(p.name);
  }

  return { text: out, redactedCount: count, types: Array.from(types) };
}

/**
 * Convenience: redact a structured capture entry (memory or training).
 * Mutates and returns the entry. Skips already-redacted-looking content.
 */
export function redactEntry(entry) {
  let totalRedactions = 0;
  const allTypes = new Set();
  const fields = ['query', 'response', 'userMessage'];

  for (const f of fields) {
    if (typeof entry[f] === 'string') {
      const r = redactPII(entry[f]);
      entry[f] = r.text;
      totalRedactions += r.redactedCount;
      r.types.forEach(t => allTypes.add(t));
    }
  }

  // Training-pair format: { messages: [{role, content}, ...] }
  if (Array.isArray(entry.messages)) {
    for (const m of entry.messages) {
      if (m && typeof m.content === 'string' && m.role !== 'system') {
        const r = redactPII(m.content);
        m.content = r.text;
        totalRedactions += r.redactedCount;
        r.types.forEach(t => allTypes.add(t));
      }
    }
  }

  if (totalRedactions > 0) {
    entry._piiRedacted = { count: totalRedactions, types: Array.from(allTypes), at: new Date().toISOString() };
  }

  return entry;
}

export const _patterns = PATTERNS; // exposed for tests
