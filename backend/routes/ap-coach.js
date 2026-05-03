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
import { verifyToken, useApCredit, refundApCredit, canAccess } from '../services/auth.js';
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
    const creditResult = await useApCredit(token);
    if (!creditResult.allowed) {
      return res.status(402).json({
        error: 'No AP Coach credits remaining. Purchase more to continue.',
        creditsRemaining: 0,
        _requiresPurchase: true,
      });
    }
    creditDeducted = true;

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

export default router;
