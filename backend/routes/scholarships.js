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
    } catch {}
  }

  try {
    const resp = await fetch(GITHUB_RAW_URL);
    if (resp.ok) {
      scholarshipsCache = await resp.json();
      cacheTimestamp = now;
      return scholarshipsCache;
    }
  } catch {}

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

    const { state, gpa, need, major, category, q } = req.query;
    if (state) results = results.filter(s => s.eligibility?.states?.includes('all') || s.eligibility?.states?.includes(state.toUpperCase()));
    if (gpa) results = results.filter(s => !s.eligibility?.gpa || s.eligibility.gpa <= parseFloat(gpa));
    if (need === 'true') results = results.filter(s => s.eligibility?.financialNeed);
    if (major) results = results.filter(s => s.eligibility?.majors?.includes('any') || s.eligibility?.majors?.some(m => m.toLowerCase().includes(major.toLowerCase())));
    if (category) results = results.filter(s => s.category?.includes(category));
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

export default router;
