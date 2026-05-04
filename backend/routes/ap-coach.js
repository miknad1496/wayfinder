/**
 * AP Coach API — REVAMP V2: AP COACH ADD-ON PATCH67
 *
 * Add-on service for Pro/Elite users. Each FRQ scoring costs 1 ap_coach credit.
 *
 * - GET  /api/ap-coach/credits      — Check remaining credits
 * - GET  /api/ap-coach/exams        — List supported AP exams
 * - GET  /api/ap-coach/frq-types    — List FRQ types
 * - POST /api/ap-coach/score        — Score an FRQ response (costs 1 credit)
 * - GET  /api/ap-coach/history      — Past scorings
 * - GET  /api/ap-coach/score/:id    — Get specific scoring
 */

import { Router } from 'express';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import { verifyToken, useApCredit, refundApCredit, canAccess, checkApCoachUsage, recordApCoachUsage } from '../services/auth.js'; // REVAMP V2: AP COACH PRICING REWORK PATCH80 routes
import { checkInjection } from '../services/input_filter.js';
import { scoreFrq, getApExams, getFrqTypes } from '../services/ap-coach.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCORES_DIR = join(__dirname, '..', 'data', 'ap-coach-scores');

const router = Router();

function sanitizeId(id) {
  if (!id || typeof id !== 'string') return null;
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return null;
  if (id.length > 128) return null;
  return id;
}

async function ensureDir() {
  await fs.mkdir(SCORES_DIR, { recursive: true });
}

// ─── GET /api/ap-coach/exams ──────────────────────────────────
router.get('/exams', (req, res) => {
  res.json({ exams: getApExams() });
});

// ─── GET /api/ap-coach/frq-types ──────────────────────────────
router.get('/frq-types', (req, res) => {
  res.json({ frqTypes: getFrqTypes() });
});

// ─── GET /api/ap-coach/credits ────────────────────────────────
// REVAMP V2: AP COACH PRICING REWORK PATCH80 — new tier-aware /usage endpoint (mounted alongside legacy /credits)
router.get('/usage', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const usage = await checkApCoachUsage(token);
    if (usage.tier === 'unauth') return res.status(401).json({ error: 'Not authenticated' });
    res.json(usage);
  } catch (err) {
    console.error('AP Coach usage error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/credits', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const credits = user.apCoachRemaining || 0;
    const allowed = canAccess(user, 'ap_coach');
    res.json({
      allowed,
      remaining: credits,
      isAdmin: !!user.isAdmin,
    });
  } catch (err) {
    console.error('AP Coach credits error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /api/ap-coach/score ─────────────────────────────────
router.post('/score', async (req, res) => {
  let creditDeducted = false;
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    if (!canAccess(user, 'ap_coach')) {
      return res.status(403).json({
        error: 'AP Coach requires an Admissions Coach Pro or Elite plan.',
        _requiresUpgrade: true,
      });
    }

    const { exam, frqType, prompt, response } = req.body;

    // Validate inputs
    if (typeof response !== 'string') {
      return res.status(400).json({ error: 'Response must be provided as text.' });
    }
    if (!response || response.trim().length < 30) {
      return res.status(400).json({ error: 'Response must be at least 30 characters.' });
    }
    if (response.length > 12000) {
      return res.status(400).json({ error: 'Response too long. Maximum 12,000 characters.' });
    }
    if (typeof exam !== 'string' || exam.length > 64) {
      return res.status(400).json({ error: 'exam must be a string of at most 64 characters.' });
    }
    if (typeof frqType !== 'string' || frqType.length > 64) {
      return res.status(400).json({ error: 'frqType must be a string of at most 64 characters.' });
    }
    if (prompt != null && (typeof prompt !== 'string' || prompt.length > 3000)) {
      return res.status(400).json({ error: 'prompt must be a string of at most 3000 characters.' });
    }

    // Prompt injection check
    const combinedInput = [response, prompt].filter(Boolean).join(' ');
    const injectionCheck = checkInjection(combinedInput);
    if (injectionCheck.blocked) {
      return res.status(400).json({ error: 'Your submission contains content that cannot be processed. Please revise and try again.' });
    }

    // Deduct credit
    // REVAMP V2: AP COACH PRICING REWORK PATCH80 — replaced credit-pack deduction with tier-aware usage check
    const usage = await checkApCoachUsage(token);
    if (!usage.allowed) {
      return res.status(402).json({
        error: 'You\'ve reached your AP Coach usage limit. Upgrade to Coach (5/month) or Consultant (unlimited) to keep practicing.',
        tier: usage.tier,
        trialUsed: usage.trialUsed,
        creditsRemaining: 0,
        _requiresPurchase: true,
      });
    }
    creditDeducted = true; // legacy var; usage recorded post-success below
    // REVAMP V2: AP COACH PRICING REWORK PATCH80 — record usage AFTER successful score (defer to post-success block)

    // Score the FRQ
    const result = await scoreFrq(exam, frqType, prompt || null, response);

    if (!result.success) {
      const refund = await refundApCredit(token);
      console.warn(`AP Coach scoring failed for user ${user.id}. Credit refunded.`, result.error);
      return res.status(500).json({
        error: 'Scoring failed. Your credit has been refunded.',
        details: result.error,
        creditsRemaining: refund.remaining,
      });
    }

    // Validate score has rubric data
    if (!result.score || typeof result.score.rubricPointsEarned !== 'number') {
      const refund = await refundApCredit(token);
      console.warn(`AP Coach scoring produced invalid structure for user ${user.id}. Credit refunded.`);
      return res.status(500).json({
        error: 'Scoring generated invalid data. Your credit has been refunded.',
        creditsRemaining: refund.remaining,
      });
    }

    // Save scoring to disk
    await ensureDir();
    const scoreId = `apsc_${randomBytes(8).toString('hex')}`;
    const record = {
      id: scoreId,
      userId: user.id,
      exam,
      frqType,
      promptText: prompt || null,
      score: result.score,
      wordCount: response.split(/\s+/).length,
      createdAt: new Date().toISOString(),
    };

    const path = join(SCORES_DIR, `${scoreId}.json`);
    const tmpPath = path + '.tmp';
    await fs.writeFile(tmpPath, JSON.stringify(record, null, 2));
    await fs.rename(tmpPath, path);

    // REVAMP V2: AP COACH PRICING REWORK PATCH80 — record usage on success (free tier marks lifetime; Coach increments month)
    await recordApCoachUsage(token);

    res.json({
      id: scoreId,
      score: result.score,
      creditsRemaining: creditResult.remaining,
      tokensUsed: result.tokensUsed,
    });
  } catch (err) {
    console.error('AP Coach score error:', err);
    if (creditDeducted) {
      try {
        const tok = req.headers.authorization?.replace('Bearer ', '');
        if (tok) {
          const refund = await refundApCredit(tok);
          return res.status(500).json({
            error: 'Internal server error. Your credit has been refunded.',
            creditsRemaining: refund.remaining,
          });
        }
      } catch (refundErr) {
        console.error('Failed to refund AP credit after error:', refundErr);
      }
      return res.status(500).json({
        error: 'Internal server error. Please contact support if credit was not refunded.',
      });
    }
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /api/ap-coach/history ────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const rawExam = req.query.exam;
    const examFilter = (typeof rawExam === 'string' && rawExam.length <= 64) ? rawExam : undefined;
    const rawLimit = parseInt(req.query.limit, 10);
    const limit = Math.max(1, Math.min(200, Number.isFinite(rawLimit) ? rawLimit : 50));

    await ensureDir();
    const files = await fs.readdir(SCORES_DIR);
    const userScores = [];
    for (const fname of files) {
      if (!fname.endsWith('.json') || fname.endsWith('.tmp')) continue;
      try {
        const data = JSON.parse(await fs.readFile(join(SCORES_DIR, fname), 'utf8'));
        if (data.userId !== user.id) continue;
        if (examFilter && data.exam !== examFilter) continue;
        userScores.push({
          id: data.id,
          exam: data.exam,
          frqType: data.frqType,
          rubricPointsEarned: data.score?.rubricPointsEarned,
          rubricPointsTotal: data.score?.rubricPointsTotal,
          scoreLabel: data.score?.scoreLabel,
          wordCount: data.wordCount,
          createdAt: data.createdAt,
        });
      } catch { /* skip malformed */ }
    }
    userScores.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    res.json({ scores: userScores.slice(0, limit) });
  } catch (err) {
    console.error('AP Coach history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/ap-coach/score/:id ──────────────────────────────
router.get('/score/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const id = sanitizeId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid score ID' });

    const path = join(SCORES_DIR, `${id}.json`);
    let data;
    try {
      data = JSON.parse(await fs.readFile(path, 'utf8'));
    } catch {
      return res.status(404).json({ error: 'Scoring not found' });
    }
    if (data.userId !== user.id && !user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(data);
  } catch (err) {
    console.error('AP Coach score-detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ─── REVAMP V2: AP COACH FRONTEND PATCH70 — Study guide download endpoints ───
const GUIDES_DIR = join(__dirname, '..', 'data', 'ap-study-guides');
const EXAM_TO_GUIDE = { // REVAMP V2: AP COACH LAYOUT + GUIDES PATCH78 EXAM_TO_GUIDE
  'ap-art-history': { file: 'AP_Art_History_Universal_Study_Guide.docx', label: 'AP Art History' },
  'ap-biology': { file: 'AP_Biology_Universal_Study_Guide.docx', label: 'AP Biology' },
  'ap-calc-ab': { file: 'AP_Calculus_AB_Universal_Study_Guide.docx', label: 'AP Calculus AB' },
  'ap-calc-bc': { file: 'AP_Calculus_BC_Universal_Study_Guide.docx', label: 'AP Calculus BC' },
  'ap-chemistry': { file: 'AP_Chemistry_Universal_Study_Guide.docx', label: 'AP Chemistry' },
  'ap-csa': { file: 'AP_Computer_Science_A_Universal_Study_Guide.docx', label: 'AP Computer Science A' },
  'ap-csp': { file: 'AP_Computer_Science_Principles_Universal_Study_Guide.docx', label: 'AP Computer Science Principles' },
  'ap-english-lang': { file: 'AP_English_Lang_Universal_Study_Guide.docx', label: 'AP English Language' },
  'ap-english-lit': { file: 'AP_English_Literature_Universal_Study_Guide.docx', label: 'AP English Literature' },
  'ap-environmental-science': { file: 'AP_Environmental_Science_Universal_Study_Guide.docx', label: 'AP Environmental Science' },
  'ap-european-history': { file: 'AP_European_History_Universal_Study_Guide.docx', label: 'AP European History' },
  'ap-french': { file: 'AP_French_Language_Culture_Universal_Study_Guide.docx', label: 'AP French Language & Culture' },
  'ap-government': { file: 'AP_Government_Universal_Study_Guide.docx', label: 'AP Government' },
  'ap-human-geography': { file: 'AP_Human_Geography_Universal_Study_Guide.docx', label: 'AP Human Geography' },
  'ap-macroeconomics': { file: 'AP_Macroeconomics_Universal_Study_Guide.docx', label: 'AP Macroeconomics' },
  'ap-microeconomics': { file: 'AP_Microeconomics_Universal_Study_Guide.docx', label: 'AP Microeconomics' },
  'ap-music-theory': { file: 'AP_Music_Theory_Universal_Study_Guide.docx', label: 'AP Music Theory' },
  'ap-physics-1': { file: 'AP_Physics_1_Universal_Study_Guide.docx', label: 'AP Physics 1' },
  'ap-physics-2': { file: 'AP_Physics_2_Universal_Study_Guide.docx', label: 'AP Physics 2' },
  'ap-physics-c-em': { file: 'AP_Physics_C_EM_Universal_Study_Guide.docx', label: 'AP Physics C: E&M' },
  'ap-physics-c-mech': { file: 'AP_Physics_C_Mechanics_Universal_Study_Guide.docx', label: 'AP Physics C: Mechanics' },
  'ap-precalculus': { file: 'AP_Precalculus_Universal_Study_Guide.docx', label: 'AP Precalculus' },
  'ap-psychology': { file: 'AP_Psychology_Universal_Study_Guide.docx', label: 'AP Psychology' },
  'ap-spanish': { file: 'AP_Spanish_Language_Culture_Universal_Study_Guide.docx', label: 'AP Spanish Language & Culture' },
  'ap-statistics': { file: 'AP_Statistics_Universal_Study_Guide.docx', label: 'AP Statistics' },
  'ap-us-history': { file: 'AP_US_History_Universal_Study_Guide.docx', label: 'AP US History' },
  'ap-world-history': { file: 'AP_World_History_Universal_Study_Guide.docx', label: 'AP World History' },
};

// GET /api/ap-coach/guides — list available study guides
router.get('/guides', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!canAccess(user, 'ap_coach')) {
      return res.status(403).json({ error: 'AP Coach add-on required', _requiresUpgrade: true });
    }
    const guides = [];
    for (const [exam, cfg] of Object.entries(EXAM_TO_GUIDE)) {
      try {
        const stat = await fs.stat(join(GUIDES_DIR, cfg.file));
        guides.push({ exam, label: cfg.label, filename: cfg.file, size: stat.size });
      } catch {
        // File missing — skip silently
      }
    }
    res.json({ guides });
  } catch (err) {
    console.error('AP Coach guides list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/ap-coach/guide/:exam — download a study guide
// Accepts token via header OR ?token= query (so users can click download links directly)
router.get('/guide/:exam', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!canAccess(user, 'ap_coach')) {
      return res.status(403).json({ error: 'AP Coach add-on required' });
    }
    const exam = req.params.exam;
    const cfg = EXAM_TO_GUIDE[exam];
    if (!cfg) return res.status(404).json({ error: 'Unsupported exam' });
    const filePath = join(GUIDES_DIR, cfg.file);
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'Study guide file not deployed yet' });
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${cfg.file}"`);
    res.sendFile(filePath);
  } catch (err) {
    console.error('AP Coach guide download error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
