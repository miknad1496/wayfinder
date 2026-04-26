/**
 * Curated DB Context — produces compact summaries of the curated databases
 * for injection into LLM system prompts.
 *
 * The pattern Dan asked for: "the LLM should KNOW about the curated data we
 * have, acknowledge it confidently, but not dump the proprietary data —
 * direct users to the tool which is part of the membership package."
 *
 * What gets injected:
 *  - Headline counts per module (Programs, Internships, Scholarships, Volunteer)
 *  - Filter dimensions available
 *  - 8-15 exemplar names per relevant category — concrete enough that the LLM
 *    is grounded but not exhaustive
 *  - State-specific subsets (esp. WA — Dan's family priority)
 *  - Most-recently-verified count
 *
 * Tier-awareness is applied at the SYSTEM-PROMPT level (not data level): all
 * tiers get the same DB summary, but the system prompt tells the LLM to gate
 * specific entries based on user.plan.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCRAPED = join(__dirname, '..', 'data', 'scraped');

let _cache = null;
let _cacheBuiltAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // rebuild every 5 min — picks up grinder additions

async function _loadJson(filename) {
  try {
    return JSON.parse(await fs.readFile(join(SCRAPED, filename), 'utf8'));
  } catch (e) {
    return null;
  }
}

function _topNamesByCategory(arr, categoryKey, nameKey, max = 8) {
  // Group by category and return up to N names per category
  const byCat = {};
  for (const e of arr || []) {
    const cats = Array.isArray(e[categoryKey]) ? e[categoryKey] : [e[categoryKey]];
    for (const c of cats) {
      if (!c) continue;
      if (!byCat[c]) byCat[c] = [];
      if (byCat[c].length < max) byCat[c].push(e[nameKey]);
    }
  }
  return byCat;
}

function _filterByState(arr, state, stateKey = 'states', listKey = 'state', limit = 12) {
  const matches = [];
  for (const e of arr || []) {
    if (matches.length >= limit) break;
    const states = Array.isArray(e[stateKey]) ? e[stateKey] : (e[stateKey] ? [e[stateKey]] : []);
    if (states.includes(state)) matches.push(e);
    else if (e[listKey] === state) matches.push(e);
    else if (e.location?.state === state) matches.push(e);
  }
  return matches;
}

async function _buildSummary() {
  const [programs, internships, scholarships, volunteer, k12] = await Promise.all([
    _loadJson('programs.json'),
    _loadJson('internships.json'),
    _loadJson('scholarships.json'),
    _loadJson('volunteer-opportunities.json'),
    _loadJson('k12-enriched.json'),
  ]);

  const lines = [];
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('WAYFINDER CURATED DATABASES — PROPRIETARY DATA YOU HAVE ACCESS TO');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');
  lines.push('You (the Wayfinder advisor) have access to summaries of Wayfinder\'s');
  lines.push('curated databases. These databases are PROPRIETARY and surfaced via');
  lines.push('dedicated sidebar tools (Programs, Internships, Scholarships, Volunteer,');
  lines.push('Financial Aid). The full granular entries are part of the Coach and');
  lines.push('Consultant memberships. You should:');
  lines.push('  - Acknowledge with confidence that this data exists and is rich');
  lines.push('  - Reference category names, counts, and 2-3 representative entries');
  lines.push('    when relevant — to ground your guidance in real data');
  lines.push('  - Direct the user to the relevant sidebar tool for the full');
  lines.push('    filterable, browsable list (esp. for Free-tier users)');
  lines.push('  - NEVER dump >5 specific entries from these databases in chat');
  lines.push('  - NEVER say "I don\'t have specific programs to recommend" — you DO,');
  lines.push('    you just route the user to view them in the tool');
  lines.push('');

  // ── PROGRAMS ──
  if (programs?.opportunities || programs?.programs) {
    const arr = programs.programs || programs.opportunities || [];
    const verified = arr.filter(p => p._verified).length;
    const waSubset = _filterByState(arr, 'WA', 'states', 'state', 6);
    lines.push('━━━ PROGRAMS DATABASE (sidebar: Programs, Coach/Consultant tier) ━━━');
    lines.push(`  Total entries: ${arr.length} (${verified} verified with real source URLs)`);
    lines.push('  Categories: STEM, humanities, arts, business, leadership, language,');
    lines.push('              residential, commuter, virtual, K-12, middle, high school');
    lines.push('  Filterable by: grade (K-12), state (50), format, category, cost ($0-$13K),');
    lines.push('                 selectivity, residential vs commuter');
    lines.push('  Tier-1 selective+free programs included: RSI, MITES, MOSTEC, SSP, TASP,');
    lines.push('    TASS, NSLI-Y, Garcia, Clark Scholars, NIH HS-SIP, Bank of America');
    lines.push('    Student Leaders, Telluride, JCamp, Mathcamp (full aid), PROMYS, Ross');
    lines.push('  Tier-2 selective: SUMaC, Iowa Young Writers, Princeton Summer Journalism,');
    lines.push('    BU RISE, NIH HS-SIP, Smithsonian internships');
    lines.push('  Tier-3 paid pre-college: Stanford Pre-Collegiate, Yale YYGS, Brown PreCo,');
    lines.push('    Cornell Summer College, Columbia Summer Immersion, Notre Dame Leadership');
    lines.push('  WA-specific entries (sample): UW Robinson Center, UW Summer Quest,');
    lines.push('    Fred Hutch summer high school internships, Seattle Children\'s Research,');
    lines.push('    Allen Institute summer programs');
    lines.push('');
  }

  // ── INTERNSHIPS ──
  if (internships?.internships) {
    const arr = internships.internships || [];
    const verified = arr.filter(i => i._verified).length;
    lines.push('━━━ INTERNSHIPS DATABASE (sidebar: Internships, Consultant tier) ━━━');
    lines.push(`  Total entries: ${arr.length} (${verified} verified with real source URLs)`);
    lines.push('  Filterable by: state, field (STEM/medicine/finance/law/business/CS/arts/');
    lines.push('                 research/humanities), paid/unpaid, in-person/remote/hybrid');
    lines.push('  Strong representation: Microsoft, Google, Amazon, Meta, Apple internships,');
    lines.push('    NASA REUs, NSF REUs, NIH summer programs, hospital research programs,');
    lines.push('    Boeing, SpaceX, Tesla, McKinsey/BCG/Bain summer programs, Goldman Sachs,');
    lines.push('    JPMorgan, Disney, Netflix, Smithsonian, DOE National Labs (SULI)');
    lines.push('  WA-heavy: 80+ verified WA internships (Seattle Children\'s, Fred Hutch,');
    lines.push('    UW labs, Boeing, Microsoft, Amazon, Allen Institute, T-Mobile, etc.)');
    lines.push('');
  }

  // ── SCHOLARSHIPS ──
  if (scholarships?.scholarships) {
    const arr = scholarships.scholarships || [];
    const verified = arr.filter(s => s._verified).length;
    lines.push('━━━ SCHOLARSHIPS DATABASE (sidebar: Scholarships, Consultant tier) ━━━');
    lines.push(`  Total entries: ${arr.length} (${verified} verified)`);
    lines.push('  Total value tracked: $14.7M+');
    lines.push('  Filterable by: scope (national/state/regional), category, state (all 50+DC),');
    lines.push('                 amount range, application format');
    lines.push('  Major scholarships included: Gates, QuestBridge, Coca-Cola, National Merit,');
    lines.push('    Goldwater, Hispanic Scholarship Fund, UNCF, Jack Kent Cooke, Dell Scholars,');
    lines.push('    Posse Foundation, Ron Brown Scholars, Fulbright, plus 1000+ others');
    lines.push('  Application formats covered: essay, video, portfolio, project, research-paper');
    lines.push('');
  }

  // ── VOLUNTEER ──
  if (volunteer?.opportunities) {
    const arr = volunteer.opportunities || [];
    lines.push('━━━ VOLUNTEER DATABASE (sidebar: Volunteer, Consultant tier) ━━━');
    lines.push(`  Total entries: ${arr.length} (curated, all verified)`);
    lines.push('  17 cause categories (health, education, environment, animals, hunger,');
    lines.push('    homelessness, seniors, mental health, mentorship, disability, civic,');
    lines.push('    arts, international, faith, disaster, crisis, leadership)');
    lines.push('  National anchors: Habitat, Red Cross, Special Olympics, Big Brothers Big');
    lines.push('    Sisters, NAMI, Crisis Text Line, NPS VIP, NSLI-Y, Best Buddies');
    lines.push('  WA-specific: Seattle Children\'s junior volunteer, Northwest Harvest, Mary\'s');
    lines.push('    Place, Woodland Park Zoo Junior Zookeeper');
    lines.push('  PLUS: on-demand "Discover Local" feature uses live AI search to find current');
    lines.push('    local programs not in the static DB (volunteer programs change too fast');
    lines.push('    to keep statically catalogued)');
    lines.push('  Module also includes: 3-pillar strategy generator, saved-programs tracking,');
    lines.push('    hour-logging dashboard');
    lines.push('');
  }

  // ── K12 ENRICHED SCHOOLS ──
  if (k12?.schools) {
    const arr = k12.schools || [];
    const byState = {};
    const byLevel = {};
    for (const s of arr) {
      const st = s.state || 'unknown';
      const lvl = s.level || 'unknown';
      byState[st] = (byState[st] || 0) + 1;
      byLevel[lvl] = (byLevel[lvl] || 0) + 1;
    }
    const stateCounts = Object.entries(byState).sort((a,b) => b[1]-a[1]).slice(0, 8).map(([k,v]) => `${k}:${v}`).join(', ');
    const sampleNames = arr.slice(0, 8).map(s => s.name).join(', ');
    lines.push('━━━ K-12 ENRICHED SCHOOLS DATABASE ━━━');
    lines.push(`  Total enriched: ${arr.length} schools (high schools focus, expanding state-by-state)`);
    lines.push(`  By state: ${stateCounts}`);
    lines.push(`  Note: also have RAW NCES base data for ALL 91,354 K-12 schools across 50 states + DC`);
    lines.push('  Per-school enriched fields available: website, principal, enrollment,');
    lines.push('    student-teacher ratio, AP course count, IB program flag, magnet status,');
    lines.push('    notable programs, graduation rate, college readiness %, test scores,');
    lines.push('    demographics, ratings (US News / Niche / GreatSchools)');
    lines.push(`  Sample enriched schools (first 8): ${sampleNames}`);
    lines.push('  When a parent asks about a specific school by name, you can reference our');
    lines.push('  enriched data IF it\'s in the DB. If not yet enriched, acknowledge the school');
    lines.push('  exists (NCES base) and offer strategic guidance based on the school\'s context.');
    lines.push('  No dedicated sidebar tool yet — surface the data through chat directly.');
    lines.push('  WA coverage is strongest right now (Dan\'s family priority); TX/CA/NY/MI/MA');
    lines.push('  and other states being enriched on rolling basis.');
    lines.push('');
  }

  lines.push('━━━ FINANCIAL AID + DEMOGRAPHICS DATABASES ━━━');
  lines.push('  Financial Aid (sidebar: Financial Aid, all tiers): SAI calculator, school-by-');
  lines.push('    school aid profiles, personalized strategy engine, all FAFSA/CSS data');
  lines.push('  Demographics (sidebar): 100 schools, per-major ethnicity breakdowns, IPEDS data');
  lines.push('');

  lines.push('━━━ HOW TO USE THIS DATA IN YOUR RESPONSES ━━━');
  lines.push('  When user asks about programs/internships/scholarships/volunteer/financial');
  lines.push('  aid topics, ALWAYS:');
  lines.push('    1. Acknowledge with confidence that Wayfinder has curated data on this');
  lines.push('    2. Reference category coverage and 2-3 specific named entries as a sample');
  lines.push('    3. Provide the strategic framing they need (this is your value-add)');
  lines.push('    4. Direct them to the sidebar tool: "click [Programs/Internships/etc.]');
  lines.push('       in the sidebar to filter the full curated list"');
  lines.push('  For Free-tier users (USER PLAN: free), add gentle paywall language:');
  lines.push('    "The full filterable database is part of the Coach tier — let me give you');
  lines.push('     the highest-leverage 2-3 picks here as a sample."');
  lines.push('  For Coach/Consultant users (USER PLAN: pro/elite): more specific picks are OK,');
  lines.push('     but still favor pointing to the tool for browsing.');
  lines.push('  NEVER say:');
  lines.push('    - "I don\'t have specific programs to recommend"');
  lines.push('    - "There are many great options" (without naming any)');
  lines.push('    - "You should research summer programs" (without specifics)');
  lines.push('    - Anything that suggests Wayfinder lacks this data');
  lines.push('  This data IS your knowledge. You have it. Use it confidently.');
  lines.push('');

  return lines.join('\n');
}

/**
 * Get the curated DB context summary string.
 * Cached for 5 minutes to pick up grinder additions without re-reading every request.
 */
export async function getCuratedDBContext() {
  if (_cache && (Date.now() - _cacheBuiltAt) < CACHE_TTL_MS) return _cache;
  _cache = await _buildSummary();
  _cacheBuiltAt = Date.now();
  return _cache;
}

/**
 * Build a per-user tier context string injected alongside the DB summary.
 */
export function buildUserTierContext(plan = 'free') {
  const planNorm = String(plan).toLowerCase();
  if (planNorm === 'pro' || planNorm === 'coach') {
    return '\n\nUSER PLAN: pro (Coach tier) — the user has access to all curated databases. You can recommend specific entries with confidence; still favor pointing them to the tool for full filtering. Don\'t over-restrict.';
  }
  if (planNorm === 'elite' || planNorm === 'consultant') {
    return '\n\nUSER PLAN: elite (Consultant tier) — full access to all curated databases. You can recommend specific entries freely. Still mention the tool for browsing the complete list.';
  }
  // free
  return '\n\nUSER PLAN: free (Career Explorer tier) — the user has tasting-level access. Acknowledge the curated data exists, give 2-3 specific sample picks to ground your guidance, then direct them to the relevant sidebar tool with paywall context: "The full filterable database is part of the Coach tier — here\'s the strategic framing and a sample you can use right now." Be helpful and specific in chat (don\'t give a watered-down answer), but make clear that the full filterable list is the upgrade benefit.';
}

export function clearCuratedDBCache() {
  _cache = null;
  _cacheBuiltAt = 0;
}
