/**
 * Internships API
 *
 * Serves curated internship data from scraped database.
 * Pro users: preview (top 5, no application links)
 * Elite users: full access (all results, direct links)
 *
 * - GET /api/internships/search   — Search/filter internships
 * - GET /api/internships/featured — Curated top picks
 * - GET /api/internships/stats    — Counts by state/field
 */

import { Router } from 'express';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, canAccess } from '../services/auth.js';
/* === REVAMP V2: INTERNSHIPS-STRATEGY IMPORTS === */
import Anthropic from '@anthropic-ai/sdk';
import { chatSLM, isSLMAvailable } from '../services/slm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = Router();

// Cache internships data
let internshipsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000;

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/miknad1496/wayfinder/main/backend/data/scraped/internships.json';

async function loadInternshipsData() {
  const now = Date.now();
  if (internshipsCache && (now - cacheTimestamp) < CACHE_TTL) return internshipsCache;

  // Try local paths
  const paths = [
    join(__dirname, '..', 'data', 'scraped', 'internships.json'),
    join(process.cwd(), 'data', 'scraped', 'internships.json'),
  ];

  for (const p of paths) {
    try {
      const raw = await fs.readFile(p, 'utf8');
      internshipsCache = JSON.parse(raw);
      cacheTimestamp = now;
      return internshipsCache;
    } catch (err) { /* try next fallback path */ }
  }

  // GitHub fallback
  try {
    const resp = await fetch(GITHUB_RAW_URL, { signal: AbortSignal.timeout(10000) });
    if (resp.ok) {
      internshipsCache = await resp.json();
      cacheTimestamp = now;
      return internshipsCache;
    }
  } catch (err) { /* try next fallback path */ }

  return null;
}

// Strip sensitive data for preview users
function previewInternship(intern) {
  return {
    title: intern.title,
    company: intern.company,
    location: intern.location,
    type: intern.type,
    paid: intern.paid,
    field: intern.field,
    format: intern.format || null,
    deadline: intern.deadline,
    tags: intern.tags?.slice(0, 3),
    _preview: true
  };
}

// ─── GET /api/internships/search ────────────────────────────────
router.get('/search', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const hasFull = canAccess(user, 'internships_full');
    const hasPreview = canAccess(user, 'internships_preview') || hasFull;

    if (!hasPreview) {
      return res.status(403).json({
        error: 'Internships database requires an Admissions Coach plan.',
        _requiresUpgrade: true,
        _previewAvailable: 'pro'
      });
    }

    const data = await loadInternshipsData();
    if (!data?.internships) {
      return res.status(503).json({ error: 'Internships database not yet available. Coming soon!' });
    }

    let results = [...data.internships];

    // Apply filters
    const { state, field, major, paid, type, level, format, q } = req.query;
    if (level === 'high-school') results = results.filter(i => i.tags?.includes('high-school'));
    if (level === 'college') results = results.filter(i => !i.tags?.includes('high-school'));
    if (state) results = results.filter(i => i.location?.state?.toUpperCase() === state.toUpperCase());
    if (field) results = results.filter(i => i.field?.toLowerCase().includes(field.toLowerCase()));
    if (major) results = results.filter(i => i.majors?.some(m => m.toLowerCase().includes(major.toLowerCase())));
    if (paid === 'true') results = results.filter(i => i.paid);
    if (paid === 'false') results = results.filter(i => !i.paid);
    if (type) results = results.filter(i => i.type === type);
    if (format) {
      const fmt = format.toLowerCase();
      results = results.filter(i => i.format?.toLowerCase() === fmt);
    }
    if (q) {
      const query = q.toLowerCase();
      results = results.filter(i =>
        i.title?.toLowerCase().includes(query) ||
        i.company?.toLowerCase().includes(query) ||
        i.description?.toLowerCase().includes(query)
      );
    }

    // Access control
    if (hasFull) {
      res.json({
        results,
        total: results.length,
        _fullAccess: true
      });
    } else {
      // Preview: top 3, no URLs, limited data — show total count
      res.json({
        results: results.slice(0, 3).map(previewInternship),
        total: results.length,
        showing: 3,
        _fullAccess: false,
        _previewMessage: `Showing 3 of ${results.length} internships. Upgrade to Consultant for full access with application links.`
      });
    }
  } catch (err) {
    console.error('Internships search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/internships/featured ──────────────────────────────
router.get('/featured', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const data = await loadInternshipsData();
    if (!data?.internships) {
      return res.status(503).json({ error: 'Internships database not yet available.' });
    }

    // Featured = paid, upcoming deadline, well-known companies
    const now = new Date().toISOString().slice(0, 10);
    const featured = data.internships
      .filter(i => i.paid && i.deadline && i.deadline >= now)
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
      .slice(0, 10);

    const hasFull = canAccess(user, 'internships_full');
    res.json({
      featured: hasFull ? featured : featured.slice(0, 3).map(previewInternship),
      _fullAccess: hasFull
    });
  } catch (err) {
    console.error('Internships featured error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/internships/stats ─────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const data = await loadInternshipsData();
    if (!data?.internships) {
      return res.json({ available: false, message: 'Coming soon!' });
    }

    const byState = {};
    const byField = {};
    for (const i of data.internships) {
      const state = i.location?.state || 'Other';
      byState[state] = (byState[state] || 0) + 1;
      const field = i.field || 'Other';
      byField[field] = (byField[field] || 0) + 1;
    }

    res.json({
      available: true,
      total: data.internships.length,
      byState,
      byField,
      lastUpdated: data.metadata?.lastScraped || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* === REVAMP V2: INTERNSHIPS-STRATEGY === */
let _claudeClientInternships = null;
function _getClaudeIntern() {
  if (_claudeClientInternships) return _claudeClientInternships;
  if (!process.env.ANTHROPIC_API_KEY) return null;
  _claudeClientInternships = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _claudeClientInternships;
}

async function _internLLMCall({ systemPrompt, userPrompt, slmMaxTokens, haikuMaxTokens }) {
  let response;
  let mode = 'slm';
  if (isSLMAvailable()) {
    try {
      response = await chatSLM([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { maxTokens: slmMaxTokens });
    } catch (e) {
      console.warn('[internships/strategy] SLM failed, falling back to Haiku:', e.message);
      response = null;
    }
  }
  if (!response) {
    mode = 'haiku';
    const claude = _getClaudeIntern();
    if (!claude) throw new Error('LLM not configured');
    const r = await claude.messages.create({
      model: process.env.CLAUDE_MODEL_HAIKU || 'claude-haiku-4-5-20251001',
      max_tokens: haikuMaxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    response = { text: r.content?.[0]?.text || '', tokensUsed: (r.usage?.input_tokens || 0) + (r.usage?.output_tokens || 0) };
  }
  return { ...response, mode };
}

function _firstBalancedJsonIntern(text) {
  if (!text) return null;
  let cleaned = String(text).trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) cleaned = fenceMatch[1];
  const start = cleaned.indexOf('{');
  if (start < 0) return null;
  let depth = 0, inString = false, escape = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return cleaned.slice(start, i + 1); }
  }
  return null;
}

// 2026 HS Internship Landscape — inlined calibration. Cheap to update here when
// new programs / deadlines surface.
const _INTERN_2026_INTEL = `
=== 2026 HS INTERNSHIP LANDSCAPE (current as of April 2026) ===

[TIER 1 — Sub-5% admit, automatic narrative weight]
- RSI (Research Science Institute, MIT) — FREE, residential. Apply by Dec; for rising HS seniors.
- SSP (Summer Science Program) — FREE-to-paid sliding scale, ~$8.5K but heavy aid. Astrophysics, biochem, genomics tracks. Jan apps.
- MITES (MIT Introduction to Tech, Engineering, Science) — FREE, 6 weeks at MIT. Underrepresented students. Feb apps.
- NIH High School Summer Internship Program (HS-SIP) — PAID stipend, Bethesda labs. Feb apps; rolling.
- PROMYS (Boston U) — $5K but ~50% aid. Math focus. Jan apps.
- Bank of America Student Leaders — PAID 8 weeks at nonprofit + DC summit. Feb apps.
- Telluride TASP/TASS — FREE residential humanities. Jan apps.

[TIER 2 — Moderately selective, strong differentiation]
- Stony Brook Garcia Center (Polymer Research) — FREE, on-campus. Mar apps.
- Anson L. Clark Scholars (Texas Tech) — FREE 7 weeks research. Feb apps.
- Smithsonian Youth Engagement programs — FREE, varies by museum. Mar apps.
- High School Research Program (Cold Spring Harbor) — PAID, biology. Mar apps.
- Princeton Laboratory Learning Program — UNPAID, school-year + summer.
- Microsoft DigiGirlz Day + DigiCamps — FREE, 1-day to multi-day events.

[TIER 3 — Open application, moderate competition]
- Department of Energy STEM Volunteer Internship — UNPAID HS pathway.
- City Year + JusticeCorps — PAID year-of-service; gap-year alternative.
- Local hospital volunteer programs — most major hospitals run them.
- State Government Pages programs — varies by state.
- Local university research opportunities — direct outreach to professors.

[TIER 4 — Open enrollment, supplemental experience]
- Local nonprofit / startup / law office shadowing
- Family business / parents' employer informal mentorship
- Self-directed Github portfolio / open-source contributions
- Independent research with school teacher

[2026 DEADLINE PATTERNS]
- Most Tier 1 programs: Dec 2025 – Feb 2026 deadlines (already passed for summer 2026)
- Tier 2: many extend to Feb-March
- Most state-funded programs: rolling through April-May
- Local opportunities: often hire 2-4 weeks before start

[STRATEGIC PRIORITIES]
- Most 9th-10th graders should focus on building core skills + a portfolio rather than chasing competitive internships. Apply to Tier 3-4 to test fit.
- Rising 11th: time to apply to Tier 2 + select Tier 1. Best year for narrative-defining work.
- Rising 12th: too late for most Tier 1 fall apps. Focus on continuation of existing commitment + senior-year leadership.
- For premed: NIH HS-SIP is the gold standard. Local hospital volunteering is a fine T3-4 supplement.
- For CS/engineering: portfolio + open source > unpaid lab. Microsoft/Google DigiGirlz/CS First are good high-school awareness moves.
- For finance: Bank of America Student Leaders. Wall Street internships at HS level are extremely rare; build portfolio via investment club / market simulation games.
- Underrepresented students (low-income, rural, first-gen, racial/ethnic minorities) — TIER 1 PROGRAMS DESIGNED FOR YOU: MITES, NSBE SEEK, Bank of America Student Leaders, COSMOS (CA), QuestBridge College Prep Scholars (junior year).

[WATCHOUTS]
- Application-only "internships" charging $$ are usually NOT real internships — they're paid camps with internship branding. Verify the work + supervision before applying.
- "Resume-padding" internships where the kid does data-entry are perceived as such by AOs. Pick programs with a defined work product (paper, code repo, presentation).
- Unpaid is FINE if there's a real research output or strong reference letter. Skip unpaid if it's busywork.
=== /2026 INTEL ===
`;

router.post('/strategy', async (req, res) => {
  try {
    const {
      grade = '11',
      gpa = '',
      satScore = '',
      targetField = '',         // 'cs' | 'bio' | 'finance' | 'journalism' | 'arts' | etc.
      careerInterest = '',      // free-text 'pre-med', 'CS+ML research', etc.
      geographicFlexibility = 'national', // 'local' | 'regional' | 'national' | 'international'
      paidPreference = 'either',          // 'paid-only' | 'either' | 'unpaid-ok'
      timeAvailable = 'full-summer',      // 'full-summer' | 'partial' | 'school-year'
      currentExperience = '',
      identityContext = '',     // 'first-gen', 'low-income', 'underrepresented', etc. — voluntary
    } = req.body || {};

    if (!grade) return res.status(400).json({ error: 'grade required' });

    const paidDesc = paidPreference === 'paid-only' ? 'PAID positions only — needs stipend/wage'
      : paidPreference === 'unpaid-ok' ? 'unpaid OK if learning value is high'
      : 'either paid or unpaid';
    const geoDesc = geographicFlexibility === 'local' ? 'home metro only — no relocation'
      : geographicFlexibility === 'regional' ? 'within 4-hour drive'
      : geographicFlexibility === 'international' ? 'international + national + relocate-ready'
      : 'national + relocate-ready';

    const planSystemPrompt = `You are Wayfinder. A high school student / parent is using the Internships module to ask "what internships should we target to build a strong college application + real experience?"

CALIBRATION FOR HS INTERNSHIP STRATEGY:
- Honor the actual question (real experience + college-app strategy) without being cynical-resume-focused.
- Tier picks honestly: Tier 1 (sub-5% admit, automatic narrative weight) → Tier 4 (local self-organized, portfolio-builder).
- For Tier 1 programs with already-passed deadlines (most close Dec-Feb), say so explicitly and pivot to Tier 2-3 for the current cycle + flag Tier 1 for next year.
- For underrepresented students, NAME the specific Tier 1 programs designed for them (MITES, NIH HS-SIP, Bank of America Student Leaders).
- For 9th/10th, push toward portfolio / skills / Tier 3-4 — Tier 1 programs almost universally require rising 11th or older.
- DO NOT recommend more than 4-5 internships total. Saturating reads as scattershot.
- Reference letters > stipend > "internship" branding. Pick where the kid will get a strong rec.

Your output must be a JSON object:
{
  "summary": "1-2 sentence framing of the recommended roadmap for THIS student",
  "differentiationThesis": "what makes this student distinctive — the throughline AOs will see",
  "anchorRecommendation": { "tier": "1|2|3|4", "name": "...", "rationale": "...", "deadline": "...", "paid": true/false/null },
  "diversifyingRecommendations": [
    { "tier": "1|2|3|4", "name": "...", "rationale": "why this fits THIS student", "deadline": "...", "paid": true/false/null }
  ],
  "deadlineAlerts": ["specific 2026 deadline already passed or upcoming, with action"],
  "narrativeNote": "how this internship roadmap weaves into essays / recommendations",
  "watchOuts": ["1-2 specific things to NOT do"],
  "nextStep": "concrete first action this week"
}

ONLY return JSON. No preamble, no markdown.`;

    const calibrationSystemPrompt = `You are Wayfinder. A high school student is building an internship roadmap. Use the curated 2026 HS internship landscape below to write 3-5 tight sentences of student-specific calibration: cite specific deadline status (already passed / upcoming), 1-2 named programs that match their profile, and the most strategic ONE next move for THEIR situation. NO generic advice. Be 2026-specific and concrete.

${_INTERN_2026_INTEL}

Output: 3-5 sentences of plain text. No headers, no bullet lists, no JSON, no preamble.`;

    const userPrompt = `Build an internship roadmap for:
- Current grade: ${grade}
- GPA: ${gpa || 'unspecified'}
- SAT/ACT: ${satScore || 'unspecified'}
- Target field: ${targetField || 'unspecified'}
- Career interest: ${careerInterest || 'unspecified'}
- Geographic flexibility: ${geoDesc}
- Paid preference: ${paidDesc}
- Time available: ${timeAvailable}
- Current experience: ${currentExperience || 'limited / first internship'}
- Identity context (if voluntarily shared): ${identityContext || 'none specified'}

What 3-4 internships should they target? Calibrate tier honestly.`;

    const [planRes, calRes] = await Promise.allSettled([
      _internLLMCall({ systemPrompt: planSystemPrompt, userPrompt, slmMaxTokens: 1200, haikuMaxTokens: 1500 }),
      _internLLMCall({ systemPrompt: calibrationSystemPrompt, userPrompt, slmMaxTokens: 500, haikuMaxTokens: 600 }),
    ]);

    if (planRes.status !== 'fulfilled') {
      console.error('[internships/strategy] plan call failed:', planRes.reason?.message);
      return res.status(502).json({ error: 'Strategy generation failed: ' + (planRes.reason?.message || 'unknown') });
    }
    const planResponse = planRes.value;
    const calResponse = calRes.status === 'fulfilled' ? calRes.value : null;
    if (!calResponse) console.warn('[internships/strategy] calibration call failed (proceeding):', calRes.reason?.message);

    let plan = {};
    try {
      const candidate = _firstBalancedJsonIntern(planResponse.text);
      plan = candidate ? JSON.parse(candidate) : {};
    } catch (e) {
      console.warn('[internships/strategy] JSON parse failed; raw head:', String(planResponse.text || '').slice(0, 300));
      return res.status(502).json({ error: 'Strategy generation returned unparseable response. Try again.' });
    }

    let calibrationInsight = '';
    if (calResponse?.text) calibrationInsight = String(calResponse.text).trim().slice(0, 1200);

    res.json({
      plan,
      calibrationInsight,
      mode: planResponse.mode,
      calibrationMode: calResponse?.mode || null,
      tokensUsed: (planResponse.tokensUsed || 0) + (calResponse?.tokensUsed || 0),
      disclaimer: 'AI-generated internship roadmap. Verify deadlines + paid/unpaid status directly with each org. Use the Internships filter (level=High School) to browse the full curated database.',
    });
  } catch (err) {
    console.error('[internships/strategy] error:', err.message);
    res.status(500).json({ error: 'Strategy generation failed: ' + err.message });
  }
});

export default router;
