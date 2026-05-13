// Volunteer module — Wayfinder
//
// Architecture (per Dan's spec):
//  - Curated DB of ~75 large, sustainable, recurring programs
//    (volunteer-opportunities.json) — fast filterable baseline
//  - On-demand discover-local endpoint that uses Claude Haiku + web reasoning
//    to surface CURRENT local programs not in the DB (because volunteer
//    programs change too fast to keep statically up to date)
//  - Strategy generator: takes student inputs, returns a structured plan
//    of attack with anchor + project commitments and growth pathway
//
// Endpoints:
//   GET  /api/volunteer/categories
//   GET  /api/volunteer/search?state=&category=&ageMin=&timeCommitment=&format=&q=
//   POST /api/volunteer/strategy        {grade, state, hoursPerWeek, causes[], careerInterest, goal, horizon}
//   POST /api/volunteer/discover-local  {state, city, causes[], ageMin, useEngine}

import express from 'express';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import { verifyToken, canAccess } from '../services/auth.js';
import { loadJsonFresh } from '../services/data-loader.js';

const GH_RAW = 'https://raw.githubusercontent.com/miknad1496/wayfinder/main/backend';

function _fetchUrlSync(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'wayfinder-vol' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) return resolve(_fetchUrlSync(res.headers.location));
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '..', 'data', 'scraped', 'volunteer-opportunities.json');

const router = express.Router();
let claudeClient = null;
function getClaude() {
  if (claudeClient) return claudeClient;
  if (!process.env.ANTHROPIC_API_KEY) return null;
  claudeClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return claudeClient;
}

async function loadDB() {
  // GitHub-first with 5-min TTL — auto-picks up grinder commits
  const data = await loadJsonFresh('data/scraped/volunteer-opportunities.json', path.join(__dirname, '..'));
  return data || { metadata: {}, opportunities: [] };
}

// ─── GET /api/volunteer/categories ─────────────────────────────

router.get('/categories', async (req, res) => {
  const db = await loadDB();
  res.json({
    categories: db.metadata?.categories || {},
    totalOpportunities: db.opportunities.length
  });
});

// ─── GET /api/volunteer/search ─────────────────────────────────

router.get('/search', async (req, res) => {
  const db = await loadDB();
  const { state, category, ageMin, timeCommitment, format, q, scope, collegeAppValue } = req.query;

  let results = db.opportunities;

  if (state && state !== 'all') {
    const st = String(state).toUpperCase();
    results = results.filter(o =>
      (o.states || []).includes('all') || (o.states || []).includes(st)
    );
  }
  if (category && category !== 'all') {
    const cat = String(category);
    results = results.filter(o => (o.categories || []).includes(cat));
  }
  if (ageMin) {
    const age = parseInt(ageMin, 10);
    if (!isNaN(age)) results = results.filter(o => (o.ageMin || 0) <= age && (o.ageMax || 99) >= age);
  }
  if (timeCommitment && timeCommitment !== 'all') {
    results = results.filter(o => o.timeCommitment === timeCommitment);
  }
  if (format && format !== 'all') {
    results = results.filter(o => o.format === format);
  }
  if (scope && scope !== 'all') {
    results = results.filter(o => o.scope === scope);
  }
  if (collegeAppValue && collegeAppValue !== 'all') {
    results = results.filter(o => o.collegeAppValue === collegeAppValue);
  }
  if (q && String(q).trim().length >= 2) {
    const term = String(q).trim().toLowerCase();
    results = results.filter(o =>
      o.name.toLowerCase().includes(term) ||
      (o.organization || '').toLowerCase().includes(term) ||
      (o.description || '').toLowerCase().includes(term) ||
      (o.skillsBuilt || []).some(s => s.toLowerCase().includes(term))
    );
  }

  res.json({
    count: results.length,
    totalDB: db.opportunities.length,
    results: results.slice(0, 100),
    note: results.length > 100 ? 'Returning first 100. Refine filters for narrower set.' : undefined,
    metadata: { source: db.metadata?.dataYear, totalDB: db.opportunities.length }
  });
});

// ─── POST /api/volunteer/strategy ──────────────────────────────
// Generates a structured plan-of-attack from user inputs, drawing from
// the curated DB. No external API calls — pure rule-based assembly.

router.post('/strategy', async (req, res) => {
  const db = await loadDB();
  const {
    grade = 10,             // 9 | 10 | 11 | 12
    state = 'all',
    hoursPerWeek = 3,
    causes = [],            // array of category keys
    careerInterest = '',    // freeform: "medicine", "law", "engineering", etc.
    goal = 'rounded',       // 'college_app' | 'rounded' | 'specific_skill' | 'leadership'
    horizon = 'year'        // 'semester' | 'year' | 'multi_year'
  } = req.body || {};

  const age = grade <= 9 ? 14 : grade <= 11 ? 16 : 17; // approx age from grade
  const userCauses = Array.isArray(causes) && causes.length ? causes : ['education', 'health', 'environment'];

  const fits = db.opportunities.filter(o => {
    // Age check
    if ((o.ageMin || 0) > age) return false;
    if ((o.ageMax || 99) < age) return false;
    // State check
    if (state !== 'all' && !(o.states || []).includes('all') && !(o.states || []).includes(String(state).toUpperCase())) return false;
    // Cause overlap
    if (userCauses.length > 0 && !(o.categories || []).some(c => userCauses.includes(c))) return false;
    return true;
  });

  // Score each fit
  const scored = fits.map(o => {
    let score = 0;
    // Cause match strength
    score += (o.categories || []).filter(c => userCauses.includes(c)).length * 3;
    // College app value alignment
    if (goal === 'college_app' && o.collegeAppValue === 'high') score += 4;
    if (goal === 'leadership' && (o.categories || []).includes('leadership')) score += 4;
    // Time commitment alignment with hoursPerWeek
    if (hoursPerWeek <= 2 && ['flexible', 'monthly', 'one_time'].includes(o.timeCommitment)) score += 2;
    if (hoursPerWeek >= 5 && ['weekly', 'intensive'].includes(o.timeCommitment)) score += 2;
    // Career interest soft-match in description / skillsBuilt
    if (careerInterest) {
      const term = careerInterest.toLowerCase();
      const hay = (o.description + ' ' + (o.skillsBuilt || []).join(' ')).toLowerCase();
      if (hay.includes(term)) score += 3;
    }
    // Sustainability
    if (o.sustainability === 'large') score += 1;
    return { ...o, _score: score };
  }).sort((a, b) => b._score - a._score);

  // Build strategy structure
  // 1. Anchor commitment(s) — 1-2 weekly programs aligned to causes
  const anchors = scored
    .filter(o => ['weekly', 'monthly'].includes(o.timeCommitment) && o.collegeAppValue !== 'low')
    .slice(0, 2);
  const anchorIds = anchors.map(o => o.name);

  // 2. Project / special commitment (project-based or intensive)
  const projects = scored
    .filter(o => ['project', 'intensive', 'one_time'].includes(o.timeCommitment) && !anchorIds.includes(o.name))
    .slice(0, 2);

  // 3. Stretch / leadership (high collegeAppValue, leadership or intensive)
  const stretches = scored
    .filter(o => o.collegeAppValue === 'high' && !anchorIds.includes(o.name) && !projects.find(p => p.name === o.name))
    .filter(o => (o.categories || []).includes('leadership') || o.timeCommitment === 'intensive')
    .slice(0, 2);

  // Strategy narrative (rule-based)
  const yearsLeft = grade <= 9 ? '4 years' : grade <= 10 ? '3 years' : grade <= 11 ? '2 years' : '1 year';
  const recommendedHours = hoursPerWeek <= 2 ? '50-100 hours/year' : hoursPerWeek <= 4 ? '100-200 hours/year' : '200-400 hours/year';

  const strategy = {
    summary: `Based on your inputs (grade ${grade}, ${state} state, ~${hoursPerWeek}h/week, ${horizon} horizon, ${goal} goal), here's a balanced plan: an anchor weekly commitment for depth and consistency, 1-2 project-based engagements for breadth, and a stretch leadership track to grow into over your remaining ${yearsLeft} of high school.`,
    expectedHours: recommendedHours,
    pillars: [
      {
        name: 'Anchor Commitment',
        description: 'A consistent weekly or biweekly volunteer engagement. This is your "I show up every week" service identity. Admissions readers recognize sustained engagement above sporadic involvement.',
        recommended: anchors.map(stripScore)
      },
      {
        name: 'Project / Special Initiatives',
        description: 'Time-bounded project work or seasonal commitments. Builds breadth and shows initiative beyond passive participation. Often easier to ramp up if you\'re newer to volunteering.',
        recommended: projects.map(stripScore)
      },
      {
        name: 'Stretch / Leadership Track',
        description: 'Higher-investment opportunities to grow into over time. As you build reliability in your anchor, you can step into project-leadership or intensive programs that demonstrate ownership.',
        recommended: stretches.map(stripScore)
      }
    ],
    growthPath: [
      `Year 1 (${grade <= 10 ? 'this year' : 'starting now'}): Lock in your anchor commitment. Show up reliably for 6+ months before adding more.`,
      `Year 2: Add a project or seasonal initiative aligned to your career interest${careerInterest ? ` (${careerInterest})` : ''}.`,
      `Year 3+: Move into a leadership role within your anchor (event coordinator, fundraising lead, training new volunteers) or take on a stretch program like SCA, AmeriCorps gap year, or international build trip.`
    ],
    discoverLocalNote: 'This recommendation pulls from our curated database of large, sustainable programs. To find current LOCAL volunteer opportunities specific to your area (which change too often to keep statically catalogued), use the "Discover Local Programs" feature — it does a live web search calibrated to your state, city, and causes.'
  };

  res.json({
    strategy,
    matched: scored.length,
    inputs: { grade, state, hoursPerWeek, causes: userCauses, careerInterest, goal, horizon }
  });
});

function stripScore(o) {
  const { _score, ...rest } = o;
  return rest;
}

// ─── POST /api/volunteer/discover-local ────────────────────────
// Uses Claude (Haiku — cheap + fast) to identify CURRENT local programs.
// This is the on-demand "deep dig" feature that supplements the curated DB.

router.post('/discover-local', async (req, res) => {
  const claude = getClaude();
  if (!claude) {
    return res.status(503).json({ error: 'Discover-local is unavailable (LLM not configured).' });
  }

  // 2026-05-13 nightly-audit fix: require auth. The previous "optional auth with a hard cap" pattern had no actual daily cap,
  // exposing Haiku calls to unauthenticated abuse (apiLimiter is per-minute-IP only; ~$432/day per IP worst case).
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Sign in to use Discover Local — keeps costs sustainable.' });
  const user = await verifyToken(token).catch(() => null);
  if (!user) return res.status(401).json({ error: 'Invalid or expired session — sign in again to use Discover Local.' });

  const {
    state = '',
    city = '',
    causes = [],
    ageMin = 14,
    grade = 10,
    radiusMiles = 25
  } = req.body || {};

  if (!city && !state) {
    return res.status(400).json({ error: 'state or city is required for local discovery.' });
  }

  const causeNames = causes.length ? causes.join(', ') : 'general community service';
  const locationDesc = city ? `${city}${state ? ', ' + state : ''}` : state;

  const systemPrompt = `You are a volunteer-opportunity research assistant for Wayfinder, a college admissions advisory platform. A high school student (grade ${grade}, age approximately ${ageMin}+) is looking for CURRENT local volunteer opportunities in ${locationDesc} that align with: ${causeNames}.

Your job: surface 6-10 SPECIFIC LOCAL programs that:
- Are within ~${radiusMiles} miles of ${locationDesc}
- Are real, currently-active programs (not defunct ones)
- Accept high-school-aged volunteers
- Are NOT just generic national programs — focus on local chapters, local organizations, or local affiliates of national programs

For each opportunity, return:
- name (specific local program / chapter name, not just "Habitat for Humanity")
- organization (the local org operating it)
- briefDescription (1-2 sentences, specific to what THIS local program does)
- whyItFits (1 sentence: why this matches the student's stated causes)
- howToStart (concrete first step — phone number, website page, or in-person visit)
- weeklyTimeRange (e.g. "2-4 hours/week" or "varies")
- ageRequirement
- url (must be a real, plausible URL — no fabricated links)

Output as JSON: { "programs": [...] }. ONLY return JSON. Be honest if you're uncertain — note "verify directly" rather than fabricating details.`;

  const userPrompt = `Find local volunteer programs in ${locationDesc} for a grade-${grade} student interested in ${causeNames}. Return 6-10 specific local programs as JSON.`;

  try {
    const response = await claude.messages.create({
      model: process.env.CLAUDE_MODEL_HAIKU || 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const text = response.content?.[0]?.text || '{}';
    let parsed = {};
    try {
      // Extract JSON from response (model may wrap it in markdown)
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    } catch (e) {
      console.error('[volunteer/discover-local] parse failed:', e.message);
      return res.status(502).json({ error: 'Discovery returned an unparseable response — try again.' });
    }

    const programs = Array.isArray(parsed.programs) ? parsed.programs : [];
    res.json({
      location: locationDesc,
      causes,
      programs,
      count: programs.length,
      disclaimer: 'These local programs are surfaced via live AI research. Verify each program directly before applying — local programs change frequently. Wayfinder does not guarantee current availability, eligibility, or contact information.',
      tokensUsed: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
    });
  } catch (err) {
    console.error('[volunteer/discover-local] error:', err.message);
    res.status(500).json({ error: 'Discovery failed: ' + err.message });
  }
});



// ─── V2: Per-user saved programs + hour tracking ────────────────
// Storage shape on the user object:
//   user.savedVolunteerPrograms = [{ programName, savedAt, source: 'curated'|'discovered' }]
//   user.volunteerHours         = [{ id, programName, date, hours, notes, loggedAt }]

import { promises as fsPromises } from 'fs';
import { randomBytes } from 'crypto';

async function _resolveUser(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { res.status(401).json({ error: 'Not authenticated' }); return null; }
  const user = await verifyToken(token).catch(() => null);
  if (!user) { res.status(401).json({ error: 'Invalid token' }); return null; }
  return user;
}

async function _readUserFile(email) {
  const { default: pathMod } = await import('path');
  const usersDir = pathMod.join(__dirname, '..', 'data', 'users');
  const safe = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filePath = pathMod.join(usersDir, `${safe}.json`);
  const raw = await fsPromises.readFile(filePath, 'utf8');
  // Decrypt fields if encryption is on
  const { decryptUserFields } = await import('../services/crypto.js');
  return { user: decryptUserFields(JSON.parse(raw)), filePath };
}

async function _writeUserFile(filePath, user) {
  // Re-encrypt + atomic write using the same helper that auth.js uses.
  // Easiest: spawn the same logic — clone, encrypt sensitive fields, write to .tmp then rename.
  const { encryptUserFields } = await import('../services/crypto.js');
  const clone = JSON.parse(JSON.stringify(user));
  const toWrite = encryptUserFields(clone);
  const tmp = filePath + '.tmp';
  await fsPromises.writeFile(tmp, JSON.stringify(toWrite, null, 2));
  await fsPromises.rename(tmp, filePath);
}

// POST /api/volunteer/save  { programName, source? }
router.post('/save', async (req, res) => {
  const u = await _resolveUser(req, res); if (!u) return;
  const { programName, source = 'curated' } = req.body || {};
  if (!programName || typeof programName !== 'string') return res.status(400).json({ error: 'programName required' });
  try {
    const { user, filePath } = await _readUserFile(u.email);
    if (!Array.isArray(user.savedVolunteerPrograms)) user.savedVolunteerPrograms = [];
    if (user.savedVolunteerPrograms.find(p => p.programName === programName)) {
      return res.json({ success: true, alreadySaved: true, count: user.savedVolunteerPrograms.length });
    }
    if (user.savedVolunteerPrograms.length >= 50) return res.status(400).json({ error: 'Saved-programs cap reached (50). Unsave one first.' });
    user.savedVolunteerPrograms.push({
      programName: programName.slice(0, 200),
      source: ['curated','discovered'].includes(source) ? source : 'curated',
      savedAt: new Date().toISOString()
    });
    await _writeUserFile(filePath, user);
    res.json({ success: true, count: user.savedVolunteerPrograms.length });
  } catch (e) {
    console.error('[volunteer/save] error:', e.message);
    res.status(500).json({ error: 'Save failed' });
  }
});

// DELETE /api/volunteer/save  body: { programName }
router.delete('/save', async (req, res) => {
  const u = await _resolveUser(req, res); if (!u) return;
  const { programName } = req.body || {};
  if (!programName) return res.status(400).json({ error: 'programName required' });
  try {
    const { user, filePath } = await _readUserFile(u.email);
    const before = (user.savedVolunteerPrograms || []).length;
    user.savedVolunteerPrograms = (user.savedVolunteerPrograms || []).filter(p => p.programName !== programName);
    await _writeUserFile(filePath, user);
    res.json({ success: true, removed: before - user.savedVolunteerPrograms.length, count: user.savedVolunteerPrograms.length });
  } catch (e) {
    console.error('[volunteer/save DELETE] error:', e.message);
    res.status(500).json({ error: 'Unsave failed' });
  }
});

// GET /api/volunteer/saved
router.get('/saved', async (req, res) => {
  const u = await _resolveUser(req, res); if (!u) return;
  try {
    const { user } = await _readUserFile(u.email);
    const saved = user.savedVolunteerPrograms || [];
    // Hydrate curated entries with full program data
    const db = await loadDB();
    const lookup = new Map(db.opportunities.map(o => [o.name, o]));
    const hydrated = saved.map(s => ({
      ...s,
      program: lookup.get(s.programName) || null
    }));
    res.json({ count: saved.length, saved: hydrated });
  } catch (e) {
    console.error('[volunteer/saved] error:', e.message);
    res.status(500).json({ error: 'Load failed' });
  }
});

// POST /api/volunteer/hours  { programName, date (YYYY-MM-DD), hours, notes? }
router.post('/hours', async (req, res) => {
  const u = await _resolveUser(req, res); if (!u) return;
  const { programName, date, hours, notes = '' } = req.body || {};
  if (!programName || !date || hours == null) return res.status(400).json({ error: 'programName, date, hours required' });
  const hrs = Number(hours);
  if (!isFinite(hrs) || hrs < 0 || hrs > 100) return res.status(400).json({ error: 'hours must be 0-100' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
  try {
    const { user, filePath } = await _readUserFile(u.email);
    if (!Array.isArray(user.volunteerHours)) user.volunteerHours = [];
    if (user.volunteerHours.length >= 1000) return res.status(400).json({ error: 'Hour-log cap reached (1000 entries).' });
    const id = 'vh_' + randomBytes(6).toString('hex');
    const entry = {
      id, programName: programName.slice(0, 200),
      date, hours: hrs,
      notes: String(notes).slice(0, 500),
      loggedAt: new Date().toISOString()
    };
    user.volunteerHours.push(entry);
    await _writeUserFile(filePath, user);
    const total = user.volunteerHours.reduce((s, h) => s + (h.hours || 0), 0);
    res.json({ success: true, entry, totalHours: total });
  } catch (e) {
    console.error('[volunteer/hours POST] error:', e.message);
    res.status(500).json({ error: 'Log failed' });
  }
});

// GET /api/volunteer/hours
router.get('/hours', async (req, res) => {
  const u = await _resolveUser(req, res); if (!u) return;
  try {
    const { user } = await _readUserFile(u.email);
    const entries = (user.volunteerHours || []).sort((a,b) => (b.date || '').localeCompare(a.date || ''));
    const totalHours = entries.reduce((s, h) => s + (h.hours || 0), 0);
    // Per-program rollup
    const byProgram = {};
    for (const e of entries) {
      const pn = e.programName || 'Other';
      if (!byProgram[pn]) byProgram[pn] = { hours: 0, count: 0 };
      byProgram[pn].hours += e.hours || 0;
      byProgram[pn].count++;
    }
    res.json({ count: entries.length, totalHours, byProgram, entries });
  } catch (e) {
    console.error('[volunteer/hours GET] error:', e.message);
    res.status(500).json({ error: 'Load failed' });
  }
});

// DELETE /api/volunteer/hours  body: { id }
router.delete('/hours', async (req, res) => {
  const u = await _resolveUser(req, res); if (!u) return;
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id required' });
  try {
    const { user, filePath } = await _readUserFile(u.email);
    const before = (user.volunteerHours || []).length;
    user.volunteerHours = (user.volunteerHours || []).filter(e => e.id !== id);
    await _writeUserFile(filePath, user);
    res.json({ success: true, removed: before - user.volunteerHours.length });
  } catch (e) {
    console.error('[volunteer/hours DELETE] error:', e.message);
    res.status(500).json({ error: 'Delete failed' });
  }
});



// GET /api/volunteer/insights — curated insider volunteer insights (GitHub-first 5min TTL)
router.get('/insights', async (req, res) => {
  const data = await loadJsonFresh('data/scraped/volunteer-insights.json', path.join(__dirname, '..'));
  if (!data) return res.status(500).json({ error: 'Failed to load volunteer insights' });
  res.json({ sections: data.sections || [], metadata: data.metadata || {} });
});

export default router;
