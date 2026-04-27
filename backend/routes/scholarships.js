/**
 * Scholarships API
 *
 * Serves curated scholarship data. Elite-only full access.
 * Pro users see count + top 3 preview teaser.
 *
 * - GET /api/scholarships/search    — Search/filter scholarships
 * - GET /api/scholarships/featured  — High-value, upcoming deadline
 * - GET /api/scholarships/stats     — Total available, by category
 */

import { Router } from 'express';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, canAccess } from '../services/auth.js';
/* === REVAMP V2: SCHOLARSHIPS-STRATEGY IMPORTS === */
import Anthropic from '@anthropic-ai/sdk';
import { chatSLM, isSLMAvailable } from '../services/slm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = Router();

let scholarshipsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000;
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/miknad1496/wayfinder/main/backend/data/scraped/scholarships.json';

async function loadScholarshipsData() {
  const now = Date.now();
  if (scholarshipsCache && (now - cacheTimestamp) < CACHE_TTL) return scholarshipsCache;

  const paths = [
    join(__dirname, '..', 'data', 'scraped', 'scholarships.json'),
    join(process.cwd(), 'data', 'scraped', 'scholarships.json'),
  ];

  for (const p of paths) {
    try {
      const raw = await fs.readFile(p, 'utf8');
      scholarshipsCache = JSON.parse(raw);
      cacheTimestamp = now;
      return scholarshipsCache;
    } catch (err) { /* try next fallback path */ }
  }

  try {
    const resp = await fetch(GITHUB_RAW_URL, { signal: AbortSignal.timeout(10000) });
    if (resp.ok) {
      scholarshipsCache = await resp.json();
      cacheTimestamp = now;
      return scholarshipsCache;
    }
  } catch (err) { /* try next fallback path */ }

  return null;
}

function previewScholarship(s) {
  return {
    name: s.name,
    provider: s.provider,
    amount: s.amount,
    deadline: s.deadline,
    category: s.category,
    competitiveness: s.competitiveness,
    scope: s.scope || 'national',
    applicationFormat: s.applicationFormat || null,
    _preview: true
  };
}

// ─── GET /api/scholarships/search ───────────────────────────────
router.get('/search', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const hasFull = canAccess(user, 'scholarships');
    const hasPreview = canAccess(user, 'scholarships_preview') || hasFull;

    if (!hasPreview) {
      return res.status(403).json({
        error: 'Scholarships database requires an Admissions Coach plan.',
        _requiresUpgrade: true
      });
    }

    const data = await loadScholarshipsData();
    if (!data?.scholarships) {
      return res.status(503).json({ error: 'Scholarships database not yet available. Coming soon!' });
    }

    let results = [...data.scholarships];

    const { state, gpa, need, major, category, scope, applicationFormat, amountRange, q } = req.query;
    if (state) results = results.filter(s => s.eligibility?.states?.includes('all') || s.eligibility?.states?.includes(state.toUpperCase()));
    if (gpa) results = results.filter(s => !s.eligibility?.gpa || s.eligibility.gpa <= parseFloat(gpa));
    if (need === 'true') results = results.filter(s => s.eligibility?.financialNeed);
    if (major) results = results.filter(s => s.eligibility?.majors?.includes('any') || s.eligibility?.majors?.some(m => m.toLowerCase().includes(major.toLowerCase())));
    if (category) results = results.filter(s => s.category?.includes(category));

    // Scope filter: national vs state vs regional
    if (scope) {
      results = results.filter(s => (s.scope || 'national') === scope);
    }

    // Application format filter: essay, video, portfolio, project, etc.
    if (applicationFormat) {
      results = results.filter(s => s.applicationFormat === applicationFormat);
    }

    // Amount range filter
    if (amountRange) {
      const getMax = (sch) => sch.amount?.max || sch.amount?.min || 0;
      const rangeMap = {
        'under1k': (sch) => getMax(sch) > 0 && getMax(sch) < 1000,
        '1k-5k': (sch) => getMax(sch) >= 1000 && getMax(sch) <= 5000,
        '5k-20k': (sch) => getMax(sch) > 5000 && getMax(sch) <= 20000,
        '20k-50k': (sch) => getMax(sch) > 20000 && getMax(sch) <= 50000,
        'over50k': (sch) => getMax(sch) > 50000,
      };
      const filterFn = rangeMap[amountRange];
      if (filterFn) results = results.filter(filterFn);
    }

    if (q) {
      const query = q.toLowerCase();
      results = results.filter(s => s.name?.toLowerCase().includes(query) || s.provider?.toLowerCase().includes(query));
    }

    if (hasFull) {
      res.json({ results, total: results.length, _fullAccess: true });
    } else {
      res.json({
        results: results.slice(0, 3).map(previewScholarship),
        total: results.length,
        _fullAccess: false,
        _previewMessage: `Showing 3 of ${results.length} scholarships. Upgrade to Consultant for full access.`
      });
    }
  } catch (err) {
    console.error('Scholarships search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/scholarships/featured ─────────────────────────────
router.get('/featured', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);

    const data = await loadScholarshipsData();
    if (!data?.scholarships) {
      return res.status(503).json({ error: 'Scholarships database not yet available.' });
    }

    const now = new Date().toISOString().slice(0, 10);
    const featured = data.scholarships
      .filter(s => s.deadline && s.deadline >= now)
      .sort((a, b) => (b.amount?.max || 0) - (a.amount?.max || 0))
      .slice(0, 10);

    const hasFull = user && canAccess(user, 'scholarships');
    res.json({
      featured: hasFull ? featured : featured.slice(0, 3).map(previewScholarship),
      _fullAccess: hasFull || false
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/scholarships/stats ────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const data = await loadScholarshipsData();
    if (!data?.scholarships) {
      return res.json({ available: false, message: 'Coming soon!' });
    }

    const byCategory = {};
    for (const s of data.scholarships) {
      for (const cat of (s.category || ['other'])) {
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      }
    }

    res.json({
      available: true,
      total: data.scholarships.length,
      totalValue: data.metadata?.totalValue || null,
      byCategory,
      lastUpdated: data.metadata?.lastScraped || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* === REVAMP V2: SCHOLARSHIPS-STRATEGY === */
let _claudeClientScholarships = null;
function _getClaudeSchol() {
  if (_claudeClientScholarships) return _claudeClientScholarships;
  if (!process.env.ANTHROPIC_API_KEY) return null;
  _claudeClientScholarships = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _claudeClientScholarships;
}

async function _scholLLMCall({ systemPrompt, userPrompt, slmMaxTokens, haikuMaxTokens }) {
  let response;
  let mode = 'slm';
  if (isSLMAvailable()) {
    try {
      response = await chatSLM([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { maxTokens: slmMaxTokens });
    } catch (e) {
      console.warn('[scholarships/strategy] SLM failed, falling back to Haiku:', e.message);
      response = null;
    }
  }
  if (!response) {
    mode = 'haiku';
    const claude = _getClaudeSchol();
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

function _firstBalancedJsonSchol(text) {
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

const _SCHOL_2026_INTEL = `
=== 2026 SCHOLARSHIP LANDSCAPE INTEL ===

[STRATEGY FUNDAMENTALS]
- State + regional pools have SMALLEST applicant counts → BEST effort:reward ratio. Always apply to every state/regional one you qualify for.
- Application format = applicant filter. Essay / portfolio / video apps have HIGH effort threshold = LOWER competition. "Application-only" (no extra creative work) is MOST competitive — everyone applies easily.
- Sub-$1K scholarships are the easiest absolute wins (low applicant counts).
- $1K-5K is the sweet spot for effort:reward ratio.
- $20K+ are highly competitive — apply but don't bet your strategy on them.
- Most aid is NON-OVERLAPPING. Apply to every kind of pool: federal, state, employer, demographic, merit, community foundation.

[DEMOGRAPHIC-TARGETED FUNDING TIERS (apply to ALL you qualify for)]
- BIPOC / Black: Coca-Cola Scholars, UNCF, Jackie Robinson Foundation, Ron Brown Scholars, Gates Millennium (closed but successor programs continue)
- Hispanic/Latino: HSF (Hispanic Scholarship Fund), HHF Youth Awards, AABE (American Association of Blacks in Energy + variations), Cafe Bustelo Latino Scholarships
- AAPI: APIA Scholars, Korean American Scholarship Foundation, Sikh American Scholarship, Vietnamese American Scholarship
- Native: AISES (American Indian Science & Engineering Society), Native Forward Scholars Fund, Cobell, Truman D. Picard
- LGBTQ+: Point Foundation, Pride Foundation, PFLAG (some chapters offer)
- Disabled: AAHD Frederick J. Krause Scholarship, NFB (National Federation of the Blind), AG Bell College Scholarship, Microsoft Disability Scholarship
- Foster / Kinship: Foster Care to Success, Casey Family Scholars, Ready to Succeed, state-specific foster scholarship programs
- First-gen: I'm First!, ScholarMatch, QuestBridge Scholars (rising 11+; National College Match round)
- Low-income (income-tested): Coca-Cola, Jack Kent Cooke Foundation Young Scholars, Posse Foundation
- Military: Marine Corps Scholarship Foundation, AMVETS, Pat Tillman Foundation (HS dependents)
- Religious: Knights of Columbus, B'nai B'rith, Catholic Knights, BCSF (Buddhist), specific denominational scholarships

[FORMAT-SPECIFIC STRATEGY]
- ESSAY scholarships: invest 1 strong essay; tweak per prompt. Coca-Cola Scholars, Elks MVS, Davidson Fellows.
- VIDEO/PORTFOLIO: requires technical skill — fewer applicants. NCAC Cheryl Frasier Memorial, AXA Achievement, James W. Foley Legacy, Adobe Creativity.
- ESSAY+ESSAY+ESSAY (multiple essay prompts): seriously high effort, very low competition. Cooke Foundation, Cargill, Stockholm Junior Water Prize.
- APPLICATION-ONLY: easy to apply, MOST competitive. Stick to local/state versions where applicant pool is smaller (your school district, your county foundation).

[HOW TO PRIORITIZE]
1. State-restricted scholarships (your state) — apply to ALL eligible
2. Regional/county/local scholarships — apply to ALL eligible
3. Demographic-targeted (NATIONAL) for any/all categories you qualify
4. State financial aid programs (Cal Grant, NY TAP, Texas Grant, WA College Grant) — required FAFSA + state form
5. Employer parental scholarships (your parents' employers — ALWAYS ASK)
6. Faith-based scholarships through your community
7. Merit-only (national high-bar) — Coca-Cola, Cooke, Davidson, Regeneron — these are bonus shots, not strategy

[2026 DEADLINE PATTERNS]
- Fall (Sep-Dec): national big-name applications open + close. Coca-Cola Scholars, QuestBridge College Match, Posse, Gates.
- Winter (Jan-Feb): state grant deadlines (Cal Grant Mar 2 priority, etc.), demographic scholarships peak.
- Spring (Mar-May): regional + community foundation pools, smaller dollar amounts but high hit rate.
- Summer (Jun-Aug): post-decision scholarships open after college acceptance — your accepted college's financial aid office is your best resource here.

[WATCHOUTS]
- Scholarship "matching" services charging fees (FastWeb is FREE; Scholarship Owl free; College Confidential free) — anything wanting to charge you to FIND scholarships is suspect.
- Application-fee scholarships ("send $25 to apply for our $5,000 scholarship") = SCAM. Real foundations don't charge.
- "Scholarship guaranteed" outfits ("we'll find you scholarships you're guaranteed to win") = SCAM.
- Scholarship lottery/sweepstakes = NOT scholarships.
- Verify legitimacy via state financial aid office or college access nonprofit (Access First, Scholarship America, Posse) before applying.

[STACKING PRINCIPLE]
- Cooke Foundation Young Scholars + employer FSA + state CCDF + camp's own need-based aid CAN stack to fully cover a $3K summer.
- College acceptance + state grant + Pell Grant + private scholarship + work-study CAN stack to cover full COA.
- AOs only see external scholarships if you self-report to your college's financial aid office. Some colleges reduce institutional aid $-for-$ when you bring outside scholarships ("scholarship displacement"). Check your college's policy BEFORE applying for big-dollar national scholarships if you're already receiving institutional need-based aid.
=== /2026 INTEL ===
`;

router.post('/strategy', async (req, res) => {
  try {
    const {
      grade = '11',
      gpa = '',
      satScore = '',
      intendedMajor = '',
      state = '',
      demographics = [],            // ['first-gen', 'low-income', 'bipoc', 'lgbtq', 'disabled', etc.]
      faithCommunity = '',          // optional: 'catholic', 'jewish', 'muslim', 'buddhist', etc.
      strengthFormat = 'essay',     // 'essay' | 'portfolio' | 'video' | 'application-only' | 'mixed'
      timePerWeek = '5-10',         // '<5' | '5-10' | '10-20' | '20+'
      targetAwardSize = 'mixed',    // 'small' (<$1k) | 'medium' ($1-5k) | 'large' ($5-20k) | 'big' ($20k+) | 'mixed'
      currentSituation = '',        // free-text — special situations (asylum status, parent unemployed, etc.)
      familyIncomeContext = '',     // optional, voluntary
    } = req.body || {};

    if (!grade) return res.status(400).json({ error: 'grade required' });

    const demoList = Array.isArray(demographics) && demographics.length ? demographics.join(', ') : 'none specified';
    const formatDesc = strengthFormat === 'essay' ? 'strong writer — essay scholarships preferred'
      : strengthFormat === 'portfolio' ? 'portfolio-builder — visual/coding/creative work to show'
      : strengthFormat === 'video' ? 'video-storyteller — comfortable on camera'
      : strengthFormat === 'application-only' ? 'application-only (highest competition)'
      : 'mixed strengths';
    const sizeDesc = targetAwardSize === 'small' ? 'sub-$1K (highest hit rate; easiest)'
      : targetAwardSize === 'medium' ? '$1-5K (sweet spot for effort:reward)'
      : targetAwardSize === 'large' ? '$5-20K (need to be selective and high-quality)'
      : targetAwardSize === 'big' ? '$20K+ (most competitive; bonus shots only)'
      : 'mixed across all sizes';

    const planSystemPrompt = `You are Wayfinder. A high school student / parent is using the Scholarships module to ask "what scholarships should we target this year for max ROI on time spent?"

CALIBRATION FOR HS SCHOLARSHIP STRATEGY:
- Honor the student's actual eligibility — NEVER suggest scholarships they don't qualify for.
- Tier picks honestly: state/regional pools have BIG hit rates; national merit awards are bonus shots, not strategy.
- ALWAYS surface demographic-targeted scholarships if any apply (first-gen, low-income, BIPOC, LGBTQ+, disabled, foster, military, faith) — don't shy away from these to be "neutral"; they're real money the student is leaving on the table if they don't apply.
- Match scholarships to STRENGTHS (essay-writer → essay scholarships; portfolio-builder → portfolio scholarships).
- Recommend 5-8 specific scholarships across tiers (state/regional/national/demographic).
- Include 1-2 employer-parental scholarship reminders ("ask your parents' employer + their union, if applicable").
- DON'T recommend application-fee scholarships; if any sound suspicious to you, FLAG in watchouts.
- For 11th grade: focus on senior-year applications; for 9th-10th: emphasize habit-building (apply to small local ones now to practice).

Your output must be a JSON object:
{
  "summary": "1-2 sentence framing of the scholarship strategy for THIS student",
  "differentiationThesis": "what makes this student's scholarship app distinctive",
  "anchorRecommendation": { "tier": "state|regional|national|demographic", "name": "...", "rationale": "...", "deadline": "...", "amount": "...", "format": "essay|video|portfolio|application-only" },
  "diversifyingRecommendations": [
    { "tier": "state|regional|national|demographic", "name": "...", "rationale": "why this fits THIS student", "deadline": "...", "amount": "...", "format": "essay|video|portfolio|application-only" }
  ],
  "stackingNote": "how these scholarships combine + interact with FAFSA/college aid",
  "watchOuts": ["1-2 specific things to avoid (scams, displacement, etc.)"],
  "nextStep": "concrete first action this week"
}

ONLY return JSON. No preamble, no markdown.`;

    const calibrationSystemPrompt = `You are Wayfinder. A high school student is building a scholarship strategy. Use the curated 2026 scholarship landscape below to write 3-5 tight sentences of student-specific calibration: cite specific scholarship names that match their profile, note application format strategies, and the ONE most important next move. NO generic advice — be 2026-specific and concrete.

${_SCHOL_2026_INTEL}

Output: 3-5 sentences of plain text. No headers, no bullet lists, no JSON, no preamble.`;

    const userPrompt = `Build a scholarship strategy for:
- Current grade: ${grade}
- GPA: ${gpa || 'unspecified'}
- SAT/ACT: ${satScore || 'unspecified'}
- Intended major: ${intendedMajor || 'unspecified'}
- State: ${state || 'unspecified'}
- Demographics (voluntarily shared): ${demoList}
- Faith/community: ${faithCommunity || 'none specified'}
- Strength format: ${formatDesc}
- Time per week: ${timePerWeek} hrs
- Target award size: ${sizeDesc}
- Special situation: ${currentSituation || 'none specified'}
- Family income context: ${familyIncomeContext || 'not specified'}

What 5-8 scholarships should they target? Calibrate honestly.`;

    const [planRes, calRes] = await Promise.allSettled([
      _scholLLMCall({ systemPrompt: planSystemPrompt, userPrompt, slmMaxTokens: 1400, haikuMaxTokens: 1700 }),
      _scholLLMCall({ systemPrompt: calibrationSystemPrompt, userPrompt, slmMaxTokens: 500, haikuMaxTokens: 600 }),
    ]);

    if (planRes.status !== 'fulfilled') {
      console.error('[scholarships/strategy] plan call failed:', planRes.reason?.message);
      return res.status(502).json({ error: 'Strategy generation failed: ' + (planRes.reason?.message || 'unknown') });
    }
    const planResponse = planRes.value;
    const calResponse = calRes.status === 'fulfilled' ? calRes.value : null;
    if (!calResponse) console.warn('[scholarships/strategy] calibration call failed (proceeding):', calRes.reason?.message);

    let plan = {};
    try {
      const candidate = _firstBalancedJsonSchol(planResponse.text);
      plan = candidate ? JSON.parse(candidate) : {};
    } catch (e) {
      console.warn('[scholarships/strategy] JSON parse failed; raw head:', String(planResponse.text || '').slice(0, 300));
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
      disclaimer: 'AI-generated scholarship strategy. Verify each scholarship deadline + eligibility directly. Use the Scholarships filter (scope=state) to surface state pools you may have missed.',
    });
  } catch (err) {
    console.error('[scholarships/strategy] error:', err.message);
    res.status(500).json({ error: 'Strategy generation failed: ' + err.message });
  }
});

export default router;
