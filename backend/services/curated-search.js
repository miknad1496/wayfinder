/**
 * curated-search.js — Surface SPECIFIC curated DB entries into chat context.
 *
 * Created by REVAMP V2: CURATED DB INJECTION PATCH35.
 *
 * Today, chat references general theory + redirects users to sidebar tools
 * for actual program/internship/scholarship lookups. This service injects
 * a small number of TOP-MATCHING ACTUAL ENTRIES into the system prompt so
 * the model can name programs by name with deadlines, providers, and
 * source URLs — addressing the "didn't go deep / lacked specific knowledge"
 * class of feedback.
 *
 * Single public entry point: searchCuratedEntries(query, sessionContext, limit)
 * Returns a formatted context block (string) or '' when no specific intent
 * is detected (so it adds zero tokens to off-topic queries).
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCRAPED_DIR = join(__dirname, '..', 'data', 'scraped');

// In-memory cache (5 min TTL) — same TTL used by route loaders
const CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000;

async function loadJson(filename) {
  const cached = CACHE.get(filename);
  const now = Date.now();
  if (cached && now - cached.ts < CACHE_TTL) return cached.data;
  try {
    const raw = await fs.readFile(join(SCRAPED_DIR, filename), 'utf8');
    const data = JSON.parse(raw);
    CACHE.set(filename, { data, ts: now });
    return data;
  } catch (err) {
    return null;
  }
}

// ─── Intent detection — which modules does this query implicate? ──

const MODULE_KEYWORDS = {
  programs: [
    'program', 'programs', 'summer program', 'summer camp', 'enrichment',
    'pre-college', 'precollege', 'research program', 'science camp',
    'coding camp', 'study abroad', 'governor school',
  ],
  internships: [
    'internship', 'internships', 'intern ', 'paid internship', 'unpaid internship',
    'summer job', 'work experience', 'shadow', 'apprenticeship',
  ],
  scholarships: [
    'scholarship', 'scholarships', 'grant ', 'grants', 'award', 'awards',
    'financial aid', 'merit aid', 'need-based aid', 'fund my', 'pay for college',
  ],
  volunteer: [
    'volunteer', 'volunteering', 'community service', 'service hours',
    'nonprofit', 'service project', 'civic',
  ],
};

// REVAMP V2: CURATED-SEARCH V2 PATCH44 — international intent detection. When true, US entries
// get suppressed in scoring so non-US entries dominate.
const INTL_SIGNALS = [
  'international', 'abroad', 'overseas', 'out of country', 'out-of-country',
  'study abroad', 'foreign', 'global program', 'in europe', 'in asia',
  'in africa', 'in south america', 'in latin america', 'in oceania',
  'in the uk', 'in england', 'in france', 'in germany', 'in italy',
  'in spain', 'in china', 'in japan', 'in korea', 'in india', 'in singapore',
  'in australia', 'in new zealand', 'in canada', 'in mexico', 'in brazil',
];
function detectInternational(query) {
  const q = (query || '').toLowerCase();
  return INTL_SIGNALS.some(sig => q.includes(sig));
}

function detectModules(query) {
  const q = (query || '').toLowerCase();
  const hits = [];
  for (const [module, keywords] of Object.entries(MODULE_KEYWORDS)) {
    if (keywords.some(kw => q.includes(kw))) hits.push(module);
  }
  return hits;
}

// ─── Signal extraction — state, grade, topic ──────────────────────

const STATE_NAMES = {
  'washington': 'WA', 'wa state': 'WA', 'seattle': 'WA',
  'california': 'CA', 'cali ': 'CA', 'los angeles': 'CA', 'san francisco': 'CA', 'bay area': 'CA',
  'new york': 'NY', 'nyc': 'NY', 'manhattan': 'NY',
  'texas': 'TX', 'austin': 'TX', 'houston': 'TX', 'dallas': 'TX',
  'florida': 'FL', 'miami': 'FL',
  'massachusetts': 'MA', 'boston': 'MA',
  'illinois': 'IL', 'chicago': 'IL',
  'oregon': 'OR', 'portland': 'OR',
  'michigan': 'MI', 'detroit': 'MI',
  'maryland': 'MD', 'virginia': 'VA', 'georgia': 'GA', 'north carolina': 'NC',
  'pennsylvania': 'PA', 'philadelphia': 'PA', 'pittsburgh': 'PA',
  'colorado': 'CO', 'denver': 'CO',
  'arizona': 'AZ', 'phoenix': 'AZ',
  'minnesota': 'MN', 'ohio': 'OH', 'wisconsin': 'WI',
  'new jersey': 'NJ', 'connecticut': 'CT', 'dc ': 'DC', 'washington dc': 'DC',
};

// Whitelist of valid 2-letter US state codes (50 + DC + territories) so we don't
// false-positive on tokens like "CS" (computer science), "AI", "OK" (the word ok).
const VALID_STATE_CODES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC','PR','VI','GU','MP','AS',
]);

function extractState(query, profile = {}) {
  const original = ' ' + (query || '') + ' ';
  const lower = original.toLowerCase();
  // Match longest first to avoid 'wa' inside 'iowa'
  const sorted = Object.keys(STATE_NAMES).sort((a, b) => b.length - a.length);
  for (const name of sorted) {
    if (lower.includes(name)) return STATE_NAMES[name];
  }
  // 2-letter code: scan ALL candidates, pick the FIRST one that's a real US state.
  // Prevents "CS" / "AI" / "OK" (the word) from being mistaken for a state code.
  const re = /(?:^|[\s(\[,.])([A-Z]{2})(?=[\s)\]?,.!]|$)/g;
  let m;
  while ((m = re.exec(original)) !== null) {
    if (VALID_STATE_CODES.has(m[1])) return m[1];
  }
  // Profile fallback
  if (profile.state) return String(profile.state).toUpperCase();
  return null;
}

function extractGrade(query, profile = {}) {
  const q = (query || '').toLowerCase();
  if (/\b(kindergarten|kinder)\b/.test(q)) return 'K';
  const m = q.match(/\b(\d{1,2})(st|nd|rd|th)?\s*-?\s*grade/);
  if (m) return String(parseInt(m[1], 10));
  // REVAMP V2: CURATED-SEARCH V2 PATCH44 — rising college freshman / graduating senior / post-senior
  // all map to grade=12 (still in the 12 bucket; their post-grad summer is
  // typically eligible for 12-tagged programs + some pre-college programs).
  if (/\b(rising college freshman|rising college frosh|incoming college|post[- ]senior|post[- ]high school|graduating senior|recently graduated|just graduated|college[- ]bound)\b/.test(q)) return '12';
  if (/\bsenior\b/.test(q)) return '12';
  if (/\bjunior\b/.test(q)) return '11';
  if (/\bsophomore\b/.test(q)) return '10';
  if (/\bfreshman\b/.test(q) && /\b(high school|hs)\b/.test(q)) return '9';
  if (profile.childGrade) {
    const cm = String(profile.childGrade).match(/\d+/);
    if (cm) return cm[0];
    if (/^k/i.test(profile.childGrade)) return 'K';
  }
  if (profile.gradeLevel) {
    const cm = String(profile.gradeLevel).match(/\d+/);
    if (cm) return cm[0];
  }
  return null;
}

function extractKeywords(query) {
  const STOP = new Set([
    'the','a','an','is','are','was','were','be','been','being','have','has','had','do',
    'does','did','will','would','could','should','may','might','can','to','of','in','for',
    'on','with','at','by','from','as','about','what','which','who','when','where','how',
    'why','this','that','these','those','my','our','your','their','his','her','its','i',
    'we','you','they','me','us','him','them','any','some','more','most','all',
    'good','best','great','help','tell','show','find','get','need','want','looking','look',
    'recommend','suggest','please','kid','child','daughter','son','student',
    'program','programs','internship','internships','scholarship','scholarships',
    'volunteer','volunteering','camp','camps','summer','grade','school',
  ]);
  return (query || '').toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP.has(w));
}

// ─── Scoring + selection ──────────────────────────────────────────

function scoreEntry(entry, query, state, grade, keywords, intl = false) { // REVAMP V2: CURATED-SEARCH V2 PATCH44
  let score = 0;
  // Different modules use different shapes for location:
  //   - programs/scholarships: entry.location?.state (object) or entry.state
  //   - internships: entry.location is a STRING like "Seattle, WA" or "Remote"
  let entryState = entry.location?.state || entry.state || null;
  if (!entryState && typeof entry.location === 'string') {
    const lm = entry.location.match(/(?:^|[,\s])([A-Z]{2})(?=[\s)\]?,.!]|$)/);
    if (lm) entryState = lm[1];
    else if (/remote/i.test(entry.location)) entryState = 'ALL';
  }

  // REVAMP V2: CURATED-SEARCH V2 PATCH44 — international intent: penalize US-coded entries so
  // non-US (Oxford, Bocconi, NUS, etc.) dominate top-K results.
  if (intl) {
    const isUSEntry = entryState && /^(A[KLRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY]|ALL)$/.test(entryState);
    if (isUSEntry) score -= 10;
    else if (entryState && !isUSEntry) score += 4; // boost non-US
  } else if (state && entryState) {
    if (entryState === state) score += 5;
    else if (entryState === 'ALL') score += 1;
  } else if (entryState === 'ALL') {
    score += 1;
  }

  if (grade && Array.isArray(entry.eligibility?.grades)) {
    if (entry.eligibility.grades.includes(grade)) score += 3;
  }

  // Keyword overlap — internships use title/company/field/majors
  const haystack = [
    entry.name, entry.title, entry.provider, entry.organization, entry.company,
    entry.category, entry.subcategory, entry.field,
    Array.isArray(entry.majors) ? entry.majors.join(' ') : entry.majors,
    entry.description, (entry.tags || []).join(' '),
  ].filter(Boolean).join(' ').toLowerCase();
  for (const kw of keywords) {
    if (haystack.includes(kw)) score += 2;
  }

  if (entry._verified) score += 2;
  if (entry.admissionsImpact === 'very_high') score += 1.5;
  else if (entry.admissionsImpact === 'high') score += 1;
  if (entry.featured) score += 0.5;

  return score;
}

async function searchModule(module, query, state, grade, limit, intl = false) { // REVAMP V2: CURATED-SEARCH V2 PATCH44
  const fileMap = {
    programs: { file: 'programs.json', key: 'programs' },
    internships: { file: 'internships.json', key: 'internships' },
    scholarships: { file: 'scholarships.json', key: 'scholarships' },
    volunteer: { file: 'volunteer-opportunities.json', key: 'opportunities' },
  };
  const cfg = fileMap[module];
  if (!cfg) return [];

  const data = await loadJson(cfg.file);
  if (!data) return [];

  const entries = data[cfg.key] || data.entries || data.items || [];
  if (!Array.isArray(entries) || entries.length === 0) return [];

  const keywords = extractKeywords(query);
  const scored = entries
    .map(e => ({ entry: e, score: scoreEntry(e, query, state, grade, keywords, intl) })) // REVAMP V2: CURATED-SEARCH V2 PATCH44
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(s => s.entry);
}

// ─── Formatting — keep it tight to control token cost ─────────────

function formatEntry(entry, idx) {
  const name = entry.name || entry.title || '?';
  const provider = entry.provider || entry.organization || entry.company;
  const lines = [`${idx + 1}. ${name}${provider ? ' (' + provider + ')' : ''}`];
  const meta = [];
  let state = entry.location?.state || entry.state;
  if (!state && typeof entry.location === 'string') state = entry.location;
  if (state) meta.push('state: ' + state);
  const grades = entry.eligibility?.grades;
  if (Array.isArray(grades) && grades.length > 0) {
    meta.push('grades: ' + grades.slice(0, 6).join(','));
  }
  const cost = entry.cost?.amount === 0 || entry.cost?.type === 'free'
    ? 'free'
    : (entry.cost?.amount ? '$' + entry.cost.amount : null);
  if (cost) meta.push('cost: ' + cost);
  if (entry.format) meta.push('format: ' + entry.format);
  if (entry.deadline) meta.push('deadline: ' + entry.deadline);
  if (typeof entry.paid === 'boolean') meta.push(entry.paid ? 'paid' : 'unpaid');
  if (entry.stipend) meta.push('stipend: ' + entry.stipend);
  if (entry.field) meta.push('field: ' + entry.field);
  if (entry.amount?.min || entry.amount?.max) {
    const a = entry.amount;
    meta.push('award: $' + (a.min || a.max) + (a.max && a.min !== a.max ? '-$' + a.max : ''));
  }
  if (meta.length) lines.push('   ' + meta.join('  |  '));
  if (entry.description) {
    const desc = String(entry.description).slice(0, 180).replace(/\s+/g, ' ').trim();
    lines.push('   ' + desc + (entry.description.length > 180 ? '...' : ''));
  }
  const source = entry._source || entry.url;
  if (source) lines.push('   source: ' + source);
  return lines.join('\n');
}

const MODULE_LABELS = {
  programs: 'PROGRAMS',
  internships: 'INTERNSHIPS',
  scholarships: 'SCHOLARSHIPS',
  volunteer: 'VOLUNTEER OPPORTUNITIES',
};

/**
 * MAIN ENTRY POINT.
 * @param {string} query - the user's chat message
 * @param {object} sessionContext - same shape passed into chat()
 * @param {number} limit - max entries per module (default 5)
 * @returns {Promise<string>} formatted context block, or '' if no intent matched
 */
export async function searchCuratedEntries(query, sessionContext = {}, limit = 5) {
  const modules = detectModules(query);
  if (modules.length === 0) return '';

  const profile = sessionContext?.profile || {};
  const state = extractState(query, profile);
  const grade = extractGrade(query, profile);
  const intl = detectInternational(query); // REVAMP V2: CURATED-SEARCH V2 PATCH44

  const blocks = [];
  for (const module of modules) {
    const entries = await searchModule(module, query, state, grade, limit, intl); // REVAMP V2: CURATED-SEARCH V2 PATCH44
    if (entries.length === 0) continue;
    const headerBits = [`--- ${MODULE_LABELS[module]} — top ${entries.length} matches`];
    if (state) headerBits.push(`(state: ${state})`);
    if (grade) headerBits.push(`(grade: ${grade})`);
    headerBits.push('---');
    const lines = [
      headerBits.join(' '),
      ...entries.map((e, i) => formatEntry(e, i)),
    ];
    blocks.push(lines.join('\n'));
  }

  if (blocks.length === 0) return '';

  return [
    '',
    '═══════════════════════════════════════════',
    'RELEVANT CURATED ENTRIES (Wayfinder verified DB)',
    '═══════════════════════════════════════════',
    "These are SPECIFIC programs/internships/scholarships/volunteer opportunities from our verified database that match this query and the user's profile. // REVAMP V2: CURATED-SEARCH V2 PATCH44",
    'CRITICAL RESPONSE RULES:',
    '1. NAME at least 2-3 of these entries by their actual name in your response. Cite the deadline and source URL where present.',
    '2. Do NOT punt the user to the sidebar without naming entries first. Saying "click Programs in the sidebar" without naming any entries is a FAILURE — these entries WERE retrieved specifically for this question. Use them.',
    '3. PASSED deadlines are still informative — do not auto-suppress them. Say "X program had a March deadline (closed for this cycle), worth bookmarking for next year" or "Y has rolling admission." Do not silently omit entries because a deadline is past.',
    '4. After naming the relevant entries, you MAY suggest the sidebar for the full filterable list — but only as an AFTER-the-fact pointer, not a primary answer.',
    '5. Do NOT invent or hallucinate other entries — only mention what is shown here. If the curated section appears thin or off-target, say so honestly ("the database doesn\'t have a strong match for this specific ask") and suggest more specific filters the user could try.',
    '',
    blocks.join('\n\n'),
    '═══════════════════════════════════════════',
    '',
  ].join('\n');
}

// Helpers exported for testing / future RAG integration
export const _internals = { detectModules, extractState, extractGrade, extractKeywords, scoreEntry, formatEntry };
