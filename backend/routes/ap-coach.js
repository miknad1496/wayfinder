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

import { Router, json as expressJson } from 'express'; // REVAMP V2: PATCH154 AP ATTACHMENTS - per-route body-size limit
import https from 'https';  // PATCH94: ESM has no require()
import { generatePreview } from '../services/study-guide-preview.js'; // PATCH97
import { findUserByToken, updateUserPlan, checkStudyGuideDownload, recordStudyGuideDownload } from '../services/auth.js'; // PATCH97 + PATCH110
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import { verifyToken, useApCredit, refundApCredit, canAccess, getApCoachUsageDetails, recordApChatUsage, recordApTutorUsage, getApProfile, setApProfile, redeemFriendsCoachCode, isFamilyConsultant, getEffectivePlan, checkApCoachUsage, recordApCoachUsage } from '../services/auth.js'; // REVAMP V2: AP COACH PRICING REWORK PATCH80 routes
import { checkInjection } from '../services/input_filter.js';
import { scoreFrq, getApExams, getFrqTypes } from '../services/ap-coach.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCORES_DIR = join(__dirname, '..', 'data', 'ap-coach-scores');

import { coachChat, generateTeachingGuide, getExamCountdown } from '../services/ap-coach-extras.js'; // REVAMP V2: AP COACH FULL MODULE PATCH81 routes
// REVAMP V2: PATCH81 DUP-IMPORT HOTFIX PATCH82HF — duplicate fileURLToPath import removed (was crashing prod)

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
// REVAMP V2: PATCH154 AP ATTACHMENTS - per-route 35mb JSON limit so the body
// can carry up to 5 base64-encoded reference attachments (images / PDFs up to
// ~5MB raw each = ~6.7MB base64, plus JSON overhead). Server-wide limit is
// 100kb, which would 413 the moment a student attaches a textbook photo.
// Override applies only to this route.
router.post('/score', expressJson({ limit: '35mb' }), async (req, res) => {
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

    const { exam, frqType, prompt, response, attachments } = req.body;

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

    // REVAMP V2: PATCH154 AP ATTACHMENTS - validate optional attachments array.
    // Up to 5 attachments per submission. Each attachment is one of:
    //   - kind:'image'    - JPEG/PNG/GIF/WebP, base64 in `data`, max ~5MB raw
    //   - kind:'document' - PDF, base64 in `data`, max ~5MB raw
    //   - kind:'text'     - any text-like file (.txt/.md/.csv/source code), raw text in `text`,
    //                       max ~200KB chars
    let safeAttachments = [];
    if (attachments != null) {
      if (!Array.isArray(attachments)) {
        return res.status(400).json({ error: 'attachments must be an array.' });
      }
      if (attachments.length > 5) {
        return res.status(400).json({ error: 'At most 5 attachments per submission.' });
      }
      const IMAGE_MEDIA = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
      const B64_RE = /^[A-Za-z0-9+/=]+$/;
      const MAX_B64 = 7000000;          // ~5.25MB raw
      const MAX_TEXT_CHARS = 200000;    // ~200KB text
      for (let i = 0; i < attachments.length; i++) {
        const a = attachments[i];
        if (!a || typeof a !== 'object') {
          return res.status(400).json({ error: 'attachment ' + (i + 1) + ' must be an object.' });
        }
        const _name = (typeof a.name === 'string') ? a.name.slice(0, 120) : null;
        if (a.kind === 'image') {
          if (typeof a.mediaType !== 'string' || !IMAGE_MEDIA.has(a.mediaType)) {
            return res.status(400).json({ error: 'attachment ' + (i + 1) + ' (image) has unsupported mediaType. Use JPEG, PNG, GIF, or WebP.' });
          }
          if (typeof a.data !== 'string' || a.data.length === 0) {
            return res.status(400).json({ error: 'attachment ' + (i + 1) + ' (image) has empty data.' });
          }
          if (a.data.length > MAX_B64) {
            return res.status(400).json({ error: 'attachment ' + (i + 1) + ' (image) too large. Max ~5MB.' });
          }
          if (!B64_RE.test(a.data)) {
            return res.status(400).json({ error: 'attachment ' + (i + 1) + ' (image) data is not valid base64.' });
          }
          safeAttachments.push({ kind: 'image', mediaType: a.mediaType, data: a.data, name: _name });
        } else if (a.kind === 'document') {
          if (a.mediaType && a.mediaType !== 'application/pdf') {
            return res.status(400).json({ error: 'attachment ' + (i + 1) + ' (document) only PDF is supported. Convert other docs to PDF or paste as text.' });
          }
          if (typeof a.data !== 'string' || a.data.length === 0) {
            return res.status(400).json({ error: 'attachment ' + (i + 1) + ' (document) has empty data.' });
          }
          if (a.data.length > MAX_B64) {
            return res.status(400).json({ error: 'attachment ' + (i + 1) + ' (document) too large. Max ~5MB.' });
          }
          if (!B64_RE.test(a.data)) {
            return res.status(400).json({ error: 'attachment ' + (i + 1) + ' (document) data is not valid base64.' });
          }
          safeAttachments.push({ kind: 'document', mediaType: 'application/pdf', data: a.data, name: _name });
        } else if (a.kind === 'text') {
          if (typeof a.text !== 'string' || a.text.length === 0) {
            return res.status(400).json({ error: 'attachment ' + (i + 1) + ' (text) is empty.' });
          }
          if (a.text.length > MAX_TEXT_CHARS) {
            return res.status(400).json({ error: 'attachment ' + (i + 1) + ' (text) too long. Max ' + MAX_TEXT_CHARS + ' characters.' });
          }
          safeAttachments.push({ kind: 'text', mediaType: typeof a.mediaType === 'string' ? a.mediaType : 'text/plain', text: a.text, name: _name });
        } else {
          return res.status(400).json({ error: 'attachment ' + (i + 1) + ' has unknown kind. Use image, document, or text.' });
        }
      }
    }

    // Prompt injection check - covers the textual prompt + response + any
    // text-kind attachments. Image and PDF bytes aren't scanned; the model's
    // own safety layer handles those.
    const combinedInput = [
      response,
      prompt,
      ...safeAttachments.filter(a => a.kind === 'text').map(a => a.text),
    ].filter(Boolean).join(' ');
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

    // Score the FRQ (PATCH154: pass attachments through - images / PDFs / text snippets)
    const result = await scoreFrq(exam, frqType, prompt || null, response, safeAttachments);

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
      // REVAMP V2: PATCH154 AP ATTACHMENTS - persist response text in history so
      // the user can retrieve their original answer when reviewing past scores
      // even after the input form has been wiped for the next FRQ. Also save
      // attachment metadata (filename + kind only, no binary bytes) so they can
      // see what reference material was in scope.
      responseText: response,
      attachments: safeAttachments.map(a => ({
        kind: a.kind,
        name: a.name || null,
        mediaType: a.mediaType || null,
      })),
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

    // REVAMP V2: PATCH154 AP ATTACHMENTS - fix latent ReferenceError. The success
    // path was referencing `creditResult.remaining` from the deleted PATCH67
    // useApCredit() flow, which has been replaced by checkApCoachUsage +
    // recordApCoachUsage in PATCH80. Re-query usage to surface the post-record
    // remaining count to the client (frontend uses it to refresh the credits
    // bar). If this call errors we still return the scoring result rather than
    // 500ing on the user.
    let remainingAfter = null;
    try {
      const usageAfter = await checkApCoachUsage(token);
      remainingAfter = (usageAfter && typeof usageAfter.remainingMonth === 'number')
        ? usageAfter.remainingMonth
        : (usageAfter && typeof usageAfter.remaining === 'number' ? usageAfter.remaining : null);
    } catch (_) { /* non-fatal — frontend will refetch via loadApUsage() anyway */ }

    res.json({
      id: scoreId,
      score: result.score,
      creditsRemaining: remainingAfter,
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

// PATCH97: pick the best available local file (PDF preferred, DOCX fallback)
async function _bestLocalGuideFile(cfg) {
  const pdfPath = cfg.pdfFile ? join(GUIDES_DIR, cfg.pdfFile) : null;
  const docxPath = cfg.file ? join(GUIDES_DIR, cfg.file) : null;
  if (pdfPath) {
    try { await fs.access(pdfPath); return { path: pdfPath, ext: 'pdf', filename: cfg.pdfFile }; } catch {}
  }
  if (docxPath) {
    try { await fs.access(docxPath); return { path: docxPath, ext: 'docx', filename: cfg.file }; } catch {}
  }
  return null;
}

// PATCH97: GitHub-raw recursive fetch (mirrors the helper used in the
// download route so the preview path also has a remote fallback).
function _ghFetchBuffer(url, depth) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'wayfinder-ap-coach' } }, (resp) => {
      if ((resp.statusCode === 301 || resp.statusCode === 302 || resp.statusCode === 307) && resp.headers.location) {
        if (depth > 5) { resp.resume(); return reject(new Error('too many redirects')); }
        resp.resume();
        return _ghFetchBuffer(resp.headers.location, depth + 1).then(resolve, reject);
      }
      if (resp.statusCode !== 200) { resp.resume(); return reject(new Error('GitHub raw HTTP ' + resp.statusCode)); }
      const chunks = [];
      resp.on('data', (c) => chunks.push(c));
      resp.on('end', () => resolve(Buffer.concat(chunks)));
      resp.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(new Error('GitHub raw timeout')); });
  });
}

const EXAM_TO_GUIDE = { // REVAMP V2: AP COACH LAYOUT + GUIDES PATCH78 EXAM_TO_GUIDE
  'ap-art-history': { file: 'AP_Art_History_Universal_Study_Guide.docx', pdfFile: 'AP_Art_History_Universal_Study_Guide.pdf', label: 'AP Art History' },
  'ap-biology': { file: 'AP_Biology_Universal_Study_Guide.docx', pdfFile: 'AP_Biology_Universal_Study_Guide.pdf', label: 'AP Biology' },
  'ap-calc-ab': { file: 'AP_Calculus_AB_Universal_Study_Guide.docx', pdfFile: 'AP_Calculus_AB_Universal_Study_Guide.pdf', label: 'AP Calculus AB' },
  'ap-calc-bc': { file: 'AP_Calculus_BC_Universal_Study_Guide.docx', pdfFile: 'AP_Calculus_BC_Universal_Study_Guide.pdf', label: 'AP Calculus BC' },
  'ap-chemistry': { file: 'AP_Chemistry_Universal_Study_Guide.docx', pdfFile: 'AP_Chemistry_Universal_Study_Guide.pdf', label: 'AP Chemistry' },
  'ap-csa': { file: 'AP_Computer_Science_A_Universal_Study_Guide.docx', pdfFile: 'AP_Computer_Science_A_Universal_Study_Guide.pdf', label: 'AP Computer Science A' },
  'ap-csp': { file: 'AP_Computer_Science_Principles_Universal_Study_Guide.docx', pdfFile: 'AP_Computer_Science_Principles_Universal_Study_Guide.pdf', label: 'AP Computer Science Principles' },
  'ap-english-lang': { file: 'AP_English_Lang_Universal_Study_Guide.docx', pdfFile: 'AP_English_Lang_Universal_Study_Guide.pdf', label: 'AP English Language' },
  'ap-english-lit': { file: 'AP_English_Literature_Universal_Study_Guide.docx', pdfFile: 'AP_English_Literature_Universal_Study_Guide.pdf', label: 'AP English Literature' },
  'ap-environmental-science': { file: 'AP_Environmental_Science_Universal_Study_Guide.docx', pdfFile: 'AP_Environmental_Science_Universal_Study_Guide.pdf', label: 'AP Environmental Science' },
  'ap-european-history': { file: 'AP_European_History_Universal_Study_Guide.docx', pdfFile: 'AP_European_History_Universal_Study_Guide.pdf', label: 'AP European History' },
  'ap-french': { file: 'AP_French_Language_Culture_Universal_Study_Guide.docx', pdfFile: 'AP_French_Language_Culture_Universal_Study_Guide.pdf', label: 'AP French Language & Culture' },
  'ap-government': { file: 'AP_Government_Universal_Study_Guide.docx', pdfFile: 'AP_Government_Universal_Study_Guide.pdf', label: 'AP Government' },
  'ap-human-geography': { file: 'AP_Human_Geography_Universal_Study_Guide.docx', pdfFile: 'AP_Human_Geography_Universal_Study_Guide.pdf', label: 'AP Human Geography' },
  'ap-macroeconomics': { file: 'AP_Macroeconomics_Universal_Study_Guide.docx', pdfFile: 'AP_Macroeconomics_Universal_Study_Guide.pdf', label: 'AP Macroeconomics' },
  'ap-microeconomics': { file: 'AP_Microeconomics_Universal_Study_Guide.docx', pdfFile: 'AP_Microeconomics_Universal_Study_Guide.pdf', label: 'AP Microeconomics' },
  'ap-music-theory': { file: 'AP_Music_Theory_Universal_Study_Guide.docx', pdfFile: 'AP_Music_Theory_Universal_Study_Guide.pdf', label: 'AP Music Theory' },
  'ap-physics-1': { file: 'AP_Physics_1_Universal_Study_Guide.docx', pdfFile: 'AP_Physics_1_Universal_Study_Guide.pdf', label: 'AP Physics 1' },
  'ap-physics-2': { file: 'AP_Physics_2_Universal_Study_Guide.docx', pdfFile: 'AP_Physics_2_Universal_Study_Guide.pdf', label: 'AP Physics 2' },
  'ap-physics-c-em': { file: 'AP_Physics_C_EM_Universal_Study_Guide.docx', pdfFile: 'AP_Physics_C_EM_Universal_Study_Guide.pdf', label: 'AP Physics C: E&M' },
  'ap-physics-c-mech': { file: 'AP_Physics_C_Mechanics_Universal_Study_Guide.docx', pdfFile: 'AP_Physics_C_Mechanics_Universal_Study_Guide.pdf', label: 'AP Physics C: Mechanics' },
  'ap-precalculus': { file: 'AP_Precalculus_Universal_Study_Guide.docx', pdfFile: 'AP_Precalculus_Universal_Study_Guide.pdf', label: 'AP Precalculus' },
  'ap-psychology': { file: 'AP_Psychology_Universal_Study_Guide.docx', pdfFile: 'AP_Psychology_Universal_Study_Guide.pdf', label: 'AP Psychology' },
  'ap-spanish': { file: 'AP_Spanish_Language_Culture_Universal_Study_Guide.docx', pdfFile: 'AP_Spanish_Language_Culture_Universal_Study_Guide.pdf', label: 'AP Spanish Language & Culture' },
  'ap-statistics': { file: 'AP_Statistics_Universal_Study_Guide.docx', pdfFile: 'AP_Statistics_Universal_Study_Guide.pdf', label: 'AP Statistics' },
  'ap-us-history': { file: 'AP_US_History_Universal_Study_Guide.docx', pdfFile: 'AP_US_History_Universal_Study_Guide.pdf', label: 'AP US History' },
  'ap-world-history': { file: 'AP_World_History_Universal_Study_Guide.docx', pdfFile: 'AP_World_History_Universal_Study_Guide.pdf', label: 'AP World History' },
};

// GET /api/ap-coach/guides — list available study guides
router.get('/guides', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    // PATCH135: free users CAN see the listing (they need it to pick their one
    // free preview). The /guide/:exam endpoint enforces the preview-slot rule —
    // listing should not 403. Previously this 403 forced frontend to use
    // FALLBACK_GUIDES with no ext field → all cards rendered as 'docx'.
    const guides = [];
    for (const [exam, cfg] of Object.entries(EXAM_TO_GUIDE)) {
      // PATCH132: prefer PDF over DOCX in the listing (matches the download
      // endpoint's PDF-preferred-over-DOCX logic from PATCH97). Without this,
      // the frontend cards rendered "21 KB · docx" forever even after the
      // 1.2 MB PDFs were committed in patch 130.
      let size = null;
      let filename = cfg.file;
      let ext = 'docx';
      if (cfg.pdfFile) {
        try {
          const stat = await fs.stat(join(GUIDES_DIR, cfg.pdfFile));
          size = stat.size;
          filename = cfg.pdfFile;
          ext = 'pdf';
        } catch { /* PDF missing locally — fall through to DOCX */ }
      }
      if (size === null) {
        try {
          const stat = await fs.stat(join(GUIDES_DIR, cfg.file));
          size = stat.size;
        } catch {
          // Neither found locally — still emit so /guide/:exam can serve via
          // GitHub raw fallback. Default to PDF metadata.
          if (cfg.pdfFile) { filename = cfg.pdfFile; ext = 'pdf'; }
        }
      }
      guides.push({ exam, label: cfg.label, filename, size, ext });
    }
    // PATCH137: tell the frontend the user's tier + which exam they've already
    // claimed as their free preview. Frontend uses this to badge the locked card
    // and gray out / mark the others as upgrade-only. Without this the cards
    // all look identical, leaving free users guessing which one is theirs.
    const fullUser = await findUserByToken(req.headers.authorization?.replace('Bearer ', ''));
    const planRaw = String((fullUser && fullUser.plan) || 'free').toLowerCase();
    const isPaidOrPrivileged = (
      ['pro', 'elite', 'consultant', 'coach', 'admin'].includes(planRaw)
      || canAccess(user, 'ap_coach')
    );
    res.json({
      guides,
      tier: planRaw,
      isPaidOrPrivileged,
      previewedExam: (fullUser && fullUser.previewedExam) || null,
    });
  } catch (err) {
    console.error('AP Coach guides list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/ap-coach/guide/:exam — download a study guide
// Accepts token via header OR ?token= query (so users can click download links directly)
router.get('/guide/:exam', async (req, res) => {
  // PATCH97: Free tier downloads HALF of ONE study guide of their choosing.
  //          Paid tiers (or admin/VIP) download the full file.
  //          PDF preferred over DOCX when both committed locally.
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const exam = req.params.exam;
    const cfg = EXAM_TO_GUIDE[exam];
    if (!cfg) return res.status(404).json({ error: 'Unsupported exam' });

    // Resolve effective tier (admin/VIP bypass, paid tier flag)
    const fullUser = await findUserByToken(token).catch(() => null);
    const planRaw = (fullUser && fullUser.plan) || (user && user.plan) || 'free';
    const isPaidOrPrivileged = (
      ['pro', 'elite', 'consultant', 'coach', 'admin'].includes(String(planRaw).toLowerCase())
      || canAccess(user, 'ap_coach')
    );

    // Free tier: must have selected this exam as their preview slot
    if (!isPaidOrPrivileged) {
      const prev = (fullUser && fullUser.previewedExam) || null;
      console.log(`[AP-DL-FREE] exam=${exam} previewedExam=${prev || 'null'} plan=${planRaw}`);
      if (!prev) {
        console.log(`[AP-DL-FREE] returning 402 _requiresPreviewSelection`);
        // First click: tell the frontend to ask for confirmation
        return res.status(402).json({
          _requiresPreviewSelection: true,
          error: 'You can preview half of one guide for free. Confirm to use your free preview on ' + cfg.label + '.',
          exam,
          label: cfg.label,
        });
      }
      if (prev !== exam) {
        return res.status(403).json({
          _previewAlreadyUsed: true,
          previewedExam: prev,
          error: 'You already used your free preview on ' + (EXAM_TO_GUIDE[prev]?.label || prev) + '. Upgrade to Coach or Consultant for full access to all 27 guides.',
        });
      }
      // Generate preview and stream
      let buf, ext;
      const local = await _bestLocalGuideFile(cfg);
      if (local) {
        const raw = await fs.readFile(local.path);
        try {
          const out = await generatePreview(raw, local.ext);
          buf = out.buf;
          ext = out.extension;
        } catch (prevErr) {
          if (prevErr && prevErr.code === 'PREVIEW_LIB_MISSING') {
            return res.status(503).json({ error: 'Free preview is being deployed. Please try again in a few minutes, or upgrade to Coach/Consultant for full access.' });
          }
          throw prevErr;
        }
      } else {
        // Local missing — fetch from GitHub (PDF first, fall back to DOCX)
        let raw = null;
        let triedExt = 'pdf';
        if (cfg.pdfFile) {
          try {
            raw = await _ghFetchBuffer('https://raw.githubusercontent.com/miknad1496/wayfinder/main/backend/data/ap-study-guides/' + encodeURIComponent(cfg.pdfFile), 0);
          } catch {}
        }
        if (!raw && cfg.file) {
          triedExt = 'docx';
          try {
            raw = await _ghFetchBuffer('https://raw.githubusercontent.com/miknad1496/wayfinder/main/backend/data/ap-study-guides/' + encodeURIComponent(cfg.file), 0);
          } catch {}
        }
        if (!raw) {
          return res.status(404).json({ error: 'Study guide currently unavailable. Email danielyungkim@hotmail.com.' });
        }
        try {
          const out = await generatePreview(raw, triedExt);
          buf = out.buf;
          ext = out.extension;
        } catch (prevErr) {
          if (prevErr && prevErr.code === 'PREVIEW_LIB_MISSING') {
            return res.status(503).json({ error: 'Free preview is being deployed. Please try again in a few minutes, or upgrade to Coach/Consultant for full access.' });
          }
          throw prevErr;
        }
      }
      const previewName = (cfg.label || exam).replace(/[^A-Za-z0-9]+/g, '_') + '_FREE_PREVIEW.' + ext;
      res.setHeader('Content-Type', ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment; filename="' + previewName + '"');
      return res.send(buf);
    }

    // PATCH110: enforce monthly cap for Coach tier (2/mo). Consultant/admin/VIP unlimited.
    const dlCheck = await checkStudyGuideDownload(token, exam);
    if (!dlCheck.allowed) {
      return res.status(429).json({
        error: dlCheck.reason || 'Download limit reached.',
        _capReached: true,
        count: dlCheck.count,
        cap: dlCheck.cap,
        _requiresUpgrade: true,
      });
    }

    // Paid path: prefer local PDF > local DOCX > GitHub raw (PDF, then DOCX)
    const local = await _bestLocalGuideFile(cfg);
    if (local) {
      res.setHeader('Content-Type', local.ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment; filename="' + local.filename + '"');
      try { await recordStudyGuideDownload(token); } catch (_) {}
      return res.sendFile(local.path);
    }
    // GitHub fallback
    if (cfg.pdfFile) {
      try {
        const buf = await _ghFetchBuffer('https://raw.githubusercontent.com/miknad1496/wayfinder/main/backend/data/ap-study-guides/' + encodeURIComponent(cfg.pdfFile), 0);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="' + cfg.pdfFile + '"');
        try { await recordStudyGuideDownload(token); } catch (_) {}
        return res.send(buf);
      } catch {}
    }
    if (cfg.file) {
      try {
        const buf = await _ghFetchBuffer('https://raw.githubusercontent.com/miknad1496/wayfinder/main/backend/data/ap-study-guides/' + encodeURIComponent(cfg.file), 0);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename="' + cfg.file + '"');
        try { await recordStudyGuideDownload(token); } catch (_) {}
        return res.send(buf);
      } catch {}
    }
    return res.status(404).json({ error: 'Study guide currently unavailable. Email danielyungkim@hotmail.com.' });
  } catch (err) {
    console.error('AP Coach guide download error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH97: Free-tier "use my one preview slot" confirmation endpoint.
// POST body: { exam: 'ap-chemistry' } -> stores user.previewedExam.
// Idempotent: if already set to a different exam, returns 409 with the locked-in choice.
// PATCH137: self-reset endpoint so Dan (or any user) can clear their own
// previewedExam slot for testing or remorse purposes. POST with no body.
// (Could be exploited by a free user to repeatedly preview different guides —
// that's intentionally allowed for now; if abuse becomes a problem, gate
// behind a 24h cooldown later.)
router.post('/guide/preview-reset', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    await updateUserPlan(token, { previewedExam: null });
    console.log(`[AP-PREVIEW-RESET] email=${user.email}`);
    return res.json({ ok: true, resetEmail: user.email });
  } catch (err) {
    console.error('AP Coach preview-reset error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/guide/preview-select', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const exam = (req.body && req.body.exam) || '';
    const cfg = EXAM_TO_GUIDE[exam];
    if (!cfg) return res.status(400).json({ error: 'Unsupported exam' });

    const fullUser = await findUserByToken(token);
    if (!fullUser) return res.status(404).json({ error: 'User not found' });
    // PATCH136 DIAG: log preview-select attempts to verify previewedExam persists
    console.log(`[AP-PREVIEW-SELECT] email=${user.email} exam=${exam} currentPreviewedExam=${fullUser.previewedExam || 'null'} plan=${fullUser.plan || 'free'}`);

    const planRaw = String(fullUser.plan || 'free').toLowerCase();
    const isPaid = ['pro', 'elite', 'consultant', 'coach', 'admin'].includes(planRaw)
      || canAccess(user, 'ap_coach');
    if (isPaid) {
      // Paid users don't need preview slots — return success silently
      return res.json({ ok: true, _alreadyFullAccess: true });
    }

    if (fullUser.previewedExam && fullUser.previewedExam !== exam) {
      return res.status(409).json({
        error: 'You already used your free preview on ' + (EXAM_TO_GUIDE[fullUser.previewedExam]?.label || fullUser.previewedExam) + '. Upgrade for full access.',
        previewedExam: fullUser.previewedExam,
      });
    }
    if (!fullUser.previewedExam) {
      await updateUserPlan(token, { previewedExam: exam });
    }
    return res.json({ ok: true, previewedExam: exam });
  } catch (err) {
    console.error('AP Coach preview-select error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// ─── REVAMP V2: AP COACH FULL MODULE PATCH81


// ─── REVAMP V2: AP COACH FULL MODULE PATCH81 routes — new endpoints for full AP Coach module ───

// Tier-aware usage info (replaces /credits + /usage with combined info)
router.get('/usage', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const usage = await getApCoachUsageDetails(token);
    res.json(usage);
  } catch (err) { console.error('AP usage err:', err); res.status(500).json({ error: 'Internal error' }); }
});

// AP exam schedule (public; no auth needed)
let _apScheduleCache = null;
router.get('/schedule', async (req, res) => {
  try {
    if (!_apScheduleCache) {
      const fs = await import('fs/promises');
      const { join: pjoin } = await import('path');
      _apScheduleCache = JSON.parse(await fs.readFile(pjoin(__dirname, '..', 'data', 'ap-exam-schedule.json'), 'utf8'));
    }
    res.json(_apScheduleCache);
  } catch (err) { res.status(500).json({ error: 'Schedule unavailable' }); }
});

// Coach Chat — free-form Q&A. SLM-primary; Opus on complex/Coach+ users
router.post('/chat', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const usage = await getApCoachUsageDetails(token);
    if (usage.tier === 'free' && usage.chatRemaining <= 0) {
      return res.status(402).json({ error: 'Free tier monthly chat cap (5) reached. Upgrade to Coach (unlimited chat) or Consultant.', _requiresUpgrade: true });
    }

    const { message, exam, history } = req.body;
    if (typeof message !== 'string' || message.trim().length < 2) return res.status(400).json({ error: 'message required' });
    if (message.length > 2000) return res.status(400).json({ error: 'message too long' });

    // Load per-exam knowledge cache from ap-coach.js — re-import to access internal cache
    // Simpler: just pass the exam slug; coachChat() loads what it needs internally
    const session = { history: Array.isArray(history) ? history : [] };
    const useOpus = usage.tier !== 'free'; // paid tiers get Opus; free gets Haiku
    const result = await coachChat(message, session, await _getPerExamKnowledge(), { useOpus, examHint: exam });
    if (!result.success) return res.status(500).json({ error: result.error || 'Chat failed' });

    if (usage.tier === 'free') await recordApChatUsage(token);
    res.json({ text: result.text, scope: result.scope, tokensUsed: result.tokensUsed });
  } catch (err) { console.error('AP chat err:', err); res.status(500).json({ error: 'Internal error' }); }
});

// Tutor — generate full teaching guide
router.post('/tutor', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const usage = await getApCoachUsageDetails(token);
    if (usage.tutorRemaining <= 0) {
      const msg = usage.tier === 'free'
        ? 'Tutor mode is a Coach/Consultant feature. Upgrade to generate custom teaching guides.'
        : 'Monthly Tutor cap reached. Upgrade to Consultant for 20/month.';
      return res.status(402).json({ error: msg, _requiresUpgrade: true });
    }

    const { exam, topic, targetTier } = req.body;
    if (typeof exam !== 'string' || !exam) return res.status(400).json({ error: 'exam required' });
    if (typeof topic !== 'string' || topic.trim().length < 3) return res.status(400).json({ error: 'topic required (at least 3 chars)' });
    if (topic.length > 200) return res.status(400).json({ error: 'topic too long' });

    const result = await generateTeachingGuide(exam, topic, targetTier || '4', await _getPerExamKnowledge());
    if (!result.success) return res.status(500).json({ error: result.error || 'Generation failed' });

    await recordApTutorUsage(token);
    res.json({ markdown: result.markdown, wordCount: result.wordCount, tokensUsed: result.tokensUsed });
  } catch (err) { console.error('AP tutor err:', err); res.status(500).json({ error: 'Internal error' }); }
});

// AP Profile (Game Plan onboarding)
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const profile = await getApProfile(token);
    res.json({ profile });
  } catch (err) { res.status(500).json({ error: 'Internal error' }); }
});

router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const result = await setApProfile(token, req.body || {});
    if (!result.success) return res.status(400).json({ error: result.error || 'Save failed' });
    res.json({ profile: result.profile });
  } catch (err) { res.status(500).json({ error: 'Internal error' }); }
});

// Helper: read per-exam knowledge from ap-coach.js cache (uses dynamic import)
let _perExamKnowledgeCache = null;
async function _getPerExamKnowledge() {
  if (_perExamKnowledgeCache) return _perExamKnowledgeCache;
  try {
    const fsp = await import('fs/promises');
    const { join: pjoin } = await import('path');
    const apDir = pjoin(__dirname, '..', 'knowledge-base', 'ap-exams');
    const cache = {};
    const files = await fsp.readdir(apDir);
    for (const f of files) {
      if (!f.endsWith('.md') || f.startsWith('_')) continue;
      const slug = f.replace(/\.md$/, '');
      cache['ap-' + slug.replace(/^ap-/, '')] = await fsp.readFile(pjoin(apDir, f), 'utf8');
    }
    _perExamKnowledgeCache = cache;
    return cache;
  } catch { return {}; }
}


export default router;
