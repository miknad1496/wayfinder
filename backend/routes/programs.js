/**
 * Programs & Activities API
 *
 * Leadership programs, summer activities, research, service opportunities.
 * Elite-only full access. Pro users see preview teaser.
 *
 * - GET /api/programs/search          — Search/filter programs
 * - GET /api/programs/featured        — Editor's picks, high-impact
 * - GET /api/programs/non-traditional — Smart/unique picks
 * - GET /api/programs/stats
 */

import { Router } from 'express';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, canAccess } from '../services/auth.js';
/* === REVAMP V2: PROGRAMS COLLEGE-APP STRATEGY ENDPOINT === */
import Anthropic from '@anthropic-ai/sdk';
import { chatSLM, isSLMAvailable } from '../services/slm.js';
import { loadJsonFresh } from '../services/data-loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = Router();

let programsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000;
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/miknad1496/wayfinder/main/backend/data/scraped/programs.json';

async function loadProgramsData() {
  const now = Date.now();
  if (programsCache && (now - cacheTimestamp) < CACHE_TTL) return programsCache;

  const paths = [
    join(__dirname, '..', 'data', 'scraped', 'programs.json'),
    join(process.cwd(), 'data', 'scraped', 'programs.json'),
  ];

  for (const p of paths) {
    try {
      const raw = await fs.readFile(p, 'utf8');
      programsCache = JSON.parse(raw);
      cacheTimestamp = now;
      return programsCache;
    } catch (err) { /* try next fallback path */ }
  }

  try {
    const resp = await fetch(GITHUB_RAW_URL, { signal: AbortSignal.timeout(10000) });
    if (resp.ok) {
      programsCache = await resp.json();
      cacheTimestamp = now;
      return programsCache;
    }
  } catch (err) { /* try next fallback path */ }

  return null;
}

function previewProgram(p) {
  return {
    name: p.name,
    provider: p.provider,
    category: p.category,
    type: p.type,
    cost: p.cost,
    selectivity: p.selectivity,
    admissionsImpact: p.admissionsImpact,
    format: p.format || null,
    deadline: p.deadline,
    _preview: true
  };
}

// ─── GET /api/programs/search ───────────────────────────────────
router.get('/search', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const hasFull = canAccess(user, 'programs');
    const hasPreview = canAccess(user, 'programs_preview') || hasFull;

    if (!hasPreview) {
      return res.status(403).json({
        error: 'Programs database requires an Admissions Coach plan.',
        _requiresUpgrade: true
      });
    }

    const data = await loadProgramsData();
    if (!data?.programs) {
      return res.status(503).json({ error: 'Programs database not yet available. Coming soon!' });
    }

    let results = [...data.programs];

    const { category, state, cost, grade, selectivity, format, q } = req.query;
    if (category) results = results.filter(p => p.category === category || p.subcategory === category);
    if (state) results = results.filter(p => p.location?.state === state.toUpperCase() || p.eligibility?.states?.includes('all'));
    if (cost === 'free') results = results.filter(p => p.cost?.amount === 0 || p.cost?.type === 'free');
    if (grade) {
      const gradeMap = {
        elementary: ['K', '1', '2', '3', '4', '5'],
        middle: ['6', '7', '8'],
        high: ['9', '10', '11', '12']
      };
      const gradeSet = gradeMap[grade] || [grade];
      results = results.filter(p => p.eligibility?.grades?.some(g => gradeSet.includes(g)));
    }
    if (selectivity) results = results.filter(p => p.selectivity === selectivity);
    if (format) {
      const fmt = format.toLowerCase();
      results = results.filter(p => p.format?.toLowerCase() === fmt);
    }
    if (q) {
      const query = q.toLowerCase();
      results = results.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.provider?.toLowerCase().includes(query) ||
        p.tags?.some(t => t.toLowerCase().includes(query))
      );
    }

    if (hasFull) {
      res.json({ results, total: results.length, _fullAccess: true });
    } else {
      res.json({
        results: results.slice(0, 3).map(previewProgram),
        total: results.length,
        _fullAccess: false,
        _previewMessage: `Showing 3 of ${results.length} programs. Upgrade to Consultant for full access.`
      });
    }
  } catch (err) {
    console.error('Programs search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/programs/featured ─────────────────────────────────
router.get('/featured', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);

    const data = await loadProgramsData();
    if (!data?.programs) {
      return res.status(503).json({ error: 'Programs database not yet available.' });
    }

    const featured = data.programs
      .filter(p => p.admissionsImpact === 'very_high' || p.admissionsImpact === 'high')
      .slice(0, 10);

    const hasFull = user && canAccess(user, 'programs');
    res.json({
      featured: hasFull ? featured : featured.slice(0, 3).map(previewProgram),
      _fullAccess: hasFull || false
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/programs/non-traditional ──────────────────────────
router.get('/non-traditional', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const data = await loadProgramsData();
    if (!data?.programs) {
      return res.status(503).json({ error: 'Programs database not yet available.' });
    }

    const nonTrad = data.programs.filter(p =>
      p.category === 'non-traditional' ||
      p.tags?.some(t => ['startup', 'apprenticeship', 'gap-year', 'open-source', 'entrepreneurship'].includes(t))
    );

    const hasFull = canAccess(user, 'programs');
    res.json({
      programs: hasFull ? nonTrad : nonTrad.slice(0, 3).map(previewProgram),
      total: nonTrad.length,
      _fullAccess: hasFull
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/programs/stats ────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const data = await loadProgramsData();
    if (!data?.programs) {
      return res.json({ available: false, message: 'Coming soon!' });
    }

    const byCategory = {};
    const byCost = { free: 0, paid: 0 };
    for (const p of data.programs) {
      byCategory[p.category || 'other'] = (byCategory[p.category || 'other'] || 0) + 1;
      if (p.cost?.amount === 0 || p.cost?.type === 'free') byCost.free++;
      else byCost.paid++;
    }

    res.json({
      available: true,
      total: data.programs.length,
      byCategory,
      byCost,
      lastUpdated: data.metadata?.lastScraped || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


/* === REVAMP V2: PROGRAMS COLLEGE-APP STRATEGY ENDPOINT === */
// ─── /api/programs/strategy — HS college-app strategy planner ─────
// Two parallel LLM calls (proven on K-8 /plan): structured JSON + free-text
// 2026 calibration insight. Calibration sourced from summer-camp-insights.json
// _aiContext sections (incl. the new hs-college-app-program-intelligence-2026
// section).

let _claudeClientPrograms = null;
function _getClaude() {
  if (_claudeClientPrograms) return _claudeClientPrograms;
  if (!process.env.ANTHROPIC_API_KEY) return null;
  _claudeClientPrograms = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _claudeClientPrograms;
}

async function _loadStrategyCalibration() {
  try {
    const data = await loadJsonFresh('data/scraped/summer-camp-insights.json', join(__dirname, '..'));
    const aiSections = (data?.sections || []).filter(s => s && s._aiContext === true);
    if (!aiSections.length) return '';
    const blocks = aiSections.map(sec => {
      const items = (sec.items || []).map(i => `  • ${i.label}: ${i.detail}`).join('\n');
      return `\n[${sec.title || sec.id}]\n${items}`;
    }).join('\n');
    return `\n\n=== CURRENT 2026 CALIBRATION (live from curated insights) ===${blocks}\n=== /CALIBRATION ===\n`;
  } catch (e) { return ''; }
}

async function _strategyLLMCall({ systemPrompt, userPrompt, slmMaxTokens, haikuMaxTokens }) {
  let response;
  let mode = 'slm';
  if (isSLMAvailable()) {
    try {
      response = await chatSLM([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { maxTokens: slmMaxTokens });
    } catch (e) {
      console.warn('[programs/strategy] SLM failed, falling back to Haiku:', e.message);
      response = null;
    }
  }
  if (!response) {
    mode = 'haiku';
    const claude = _getClaude();
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

function _firstBalancedJsonStrat(text) {
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

router.post('/strategy', async (req, res) => {
  try {
    const {
      grade = '11',
      gpa = '',
      satScore = '',
      targetTier = 'mix',          // reach | match | safety | mix
      interests = [],              // ['math','cs','bio',...]
      intendedMajor = '',
      currentECs = '',
      location = '',
      budget = 'flexible',         // free | low (<2k) | mid (2-5k) | high (5k+) | flexible
    } = req.body || {};

    if (!grade) return res.status(400).json({ error: 'grade required' });

    const interestList = Array.isArray(interests) && interests.length ? interests.join(', ') : 'unspecified';
    const budgetDesc = budget === 'free' ? 'FREE programs only — fee-based options not viable'
      : budget === 'low' ? 'budget-constrained (<$2,000 total)'
      : budget === 'mid' ? 'mid-tier budget ($2,000-5,000 total)'
      : budget === 'high' ? 'premium budget OK ($5,000+ total)'
      : 'flexible budget';

    const planSystemPrompt = `You are Wayfinder. A high school student / parent is using the Programs module to ask "what programs should we apply to / build into our summer to strengthen the college application?"

CALIBRATION FOR HS COLLEGE-APP STRATEGY:
- Honor the actual question (admissions strategy) without being cynical-resume-focused. Real personal development matters too.
- Tier picks honestly: Tier 1 (sub-5% admit, automatic narrative weight) → Tier 4 (open enrollment, supplemental). Don't overpromise.
- For affluent families, PUSH toward free competitive programs (RSI, SSP, MITES, PROMYS) — cheaper AND more weighted. Many don't know.
- For budget-constrained, identify free options first (state Governor's Schools, NIH HS-SIP, NSBE).
- Mention regional / state-restricted programs they qualify for (e.g. COSMOS for CA residents, Governor's Schools).
- Don't recommend more than 3-4 programs total. Saturating reads as frantic, not focused.
- A continuing project (year 2-3 of an existing commitment) often beats a new program. Honor that.

Your output must be a JSON object:
{
  "summary": "1-2 sentence framing of the recommended strategy for THIS student",
  "differentiationThesis": "what makes this student distinctive — the throughline AOs will see",
  "anchorRecommendation": { "tier": "1|2|3|4", "name": "...", "rationale": "...", "deadline": "..." },
  "diversifyingRecommendations": [
    { "tier": "1|2|3|4", "name": "...", "rationale": "why this fits THIS student specifically", "deadline": "..." }
  ],
  "narrativeNote": "how to weave these into essays + recommendation letters",
  "watchOuts": ["1-2 specific things this student should NOT do"],
  "nextStep": "concrete first action to take this week"
}

ONLY return JSON. No preamble, no markdown.`;

    const calibrationContext = await _loadStrategyCalibration();
    const calibrationSystemPrompt = `You are Wayfinder. A high school student is building a college-app strategy through the Programs module. Use the curated 2026 calibration data below to write 3-5 tight sentences of student-specific calibration insight: cite specific deadlines, free-vs-paid program tiers at THEIR profile level, and 1-2 specific named programs that match their interests + budget. NO generic advice — be concrete and 2026-specific.

${calibrationContext}

Output: 3-5 sentences of plain text. No headers, no bullet lists, no JSON, no preamble.`;

    const userPrompt = `Build a college-app strategy for:
- Current grade: ${grade}
- GPA: ${gpa || 'unspecified'}
- SAT/ACT: ${satScore || 'unspecified'}
- Target school tier mix: ${targetTier}
- Interests / intended major: ${intendedMajor || interestList}
- Current ECs / commitments: ${currentECs || 'unspecified'}
- Location: ${location || 'unspecified'}
- Budget: ${budgetDesc}

What 2-3 programs should they target this summer / near-term for max strategic value?`;

    const [planRes, calRes] = await Promise.allSettled([
      _strategyLLMCall({ systemPrompt: planSystemPrompt, userPrompt, slmMaxTokens: 1200, haikuMaxTokens: 1500 }),
      _strategyLLMCall({ systemPrompt: calibrationSystemPrompt, userPrompt, slmMaxTokens: 500, haikuMaxTokens: 600 }),
    ]);

    if (planRes.status !== 'fulfilled') {
      console.error('[programs/strategy] plan call failed:', planRes.reason?.message);
      return res.status(502).json({ error: 'Strategy generation failed: ' + (planRes.reason?.message || 'unknown') });
    }
    const planResponse = planRes.value;
    const calResponse = calRes.status === 'fulfilled' ? calRes.value : null;
    if (!calResponse) console.warn('[programs/strategy] calibration call failed (proceeding without):', calRes.reason?.message);

    let plan = {};
    try {
      const candidate = _firstBalancedJsonStrat(planResponse.text);
      plan = candidate ? JSON.parse(candidate) : {};
    } catch (e) {
      console.warn('[programs/strategy] JSON parse failed; raw head:', String(planResponse.text || '').slice(0, 300));
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
      disclaimer: 'AI-generated college-app strategy. Verify program deadlines + selectivity directly with each org. Use the Programs filter ^(grade=high^) to browse the full curated database for additional options.',
    });
  } catch (err) {
    console.error('[programs/strategy] error:', err.message);
    res.status(500).json({ error: 'Strategy generation failed: ' + err.message });
  }
});

export default router;
