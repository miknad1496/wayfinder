// backend/routes/account.js — patch 84
// Account data export (GDPR/CCPA compliance)
// Marker: REVAMP V2: ACCOUNT MANAGEMENT PATCH84
//
// NOTE: Account delete is already wired in routes/auth.js via deleteUser(token).
// NOTE: Forgot/reset password is already wired at /api/auth/forgot-password + /api/auth/reset-password.

import express from 'express';
import fs from 'fs/promises';
import { existsSync, readdirSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from '../services/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const SESSIONS_DIR = path.join(__dirname, '..', 'data', 'sessions');
const ESSAY_REVIEWS_DIR = path.join(__dirname, '..', 'data', 'essay-reviews');
const AP_SCORES_DIR = path.join(__dirname, '..', 'data', 'ap-coach-scores');

function _scanForUser(dir, userId) {
  const out = [];
  if (!existsSync(dir)) return out;
  let files = [];
  try { files = readdirSync(dir); } catch { return out; }
  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    try {
      const r = JSON.parse(readFileSync(path.join(dir, f), 'utf8'));
      if (r && (r.userId === userId || r.user_id === userId)) out.push(r);
    } catch {}
  }
  return out;
}

// GET /api/account/export — full user data dump
router.get('/export', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const safeUser = { ...user };
    delete safeUser.passwordHash;
    delete safeUser.password;
    delete safeUser.resetCode;
    delete safeUser.resetCodeExpiresAt;
    delete safeUser.resetToken;

    // Pull this user's sessions from sessions dir
    const sessions = [];
    const sessionIds = Array.isArray(user.sessionHistory) ? user.sessionHistory : [];
    for (const sid of sessionIds) {
      const safe = String(sid).replace(/[^a-zA-Z0-9_-]/g, '');
      if (!safe) continue;
      const p = path.join(SESSIONS_DIR, safe + '.json');
      if (existsSync(p)) {
        try { sessions.push(JSON.parse(readFileSync(p, 'utf8'))); } catch {}
      }
    }

    const exportData = {
      _exportedAt: new Date().toISOString(),
      _exportFormat: 'wayfinder-account-export-v1',
      _note: 'This is the full data Wayfinder holds about you. Save this file for your records or to import elsewhere.',
      user: safeUser,
      sessions,
      essayReviews: _scanForUser(ESSAY_REVIEWS_DIR, user.id),
      apCoachScores: _scanForUser(AP_SCORES_DIR, user.id),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="wayfinder-export-' + (user.id || 'data') + '.json"');
    res.send(JSON.stringify(exportData, null, 2));
  } catch (err) {
    console.error('[account/export] error:', err.message);
    res.status(500).json({ error: 'Export failed' });
  }
});

export default router;
