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
    } catch {}
  }

  try {
    const resp = await fetch(GITHUB_RAW_URL);
    if (resp.ok) {
      programsCache = await resp.json();
      cacheTimestamp = now;
      return programsCache;
    }
  } catch {}

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

    const { category, state, cost, grade, selectivity, q } = req.query;
    if (category) results = results.filter(p => p.category === category || p.subcategory === category);
    if (state) results = results.filter(p => p.location?.state === state.toUpperCase() || p.eligibility?.states?.includes('all'));
    if (cost === 'free') results = results.filter(p => p.cost?.amount === 0 || p.cost?.type === 'free');
    if (grade) results = results.filter(p => p.eligibility?.grades?.includes(grade));
    if (selectivity) results = results.filter(p => p.selectivity === selectivity);
    if (q) {
      const query = q.toLowerCase();
      results = results.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.provider?.toLowerCase().includes(query) ||
        p.tags?.some(t => t.toLowerCase().includes(query))
      );
    }

    if (hasFull) {
      res.json({ results: results.slice(0, 50), total: results.length, _fullAccess: true });
    } else {
      res.json({
        results: results.slice(0, 3).map(previewProgram),
        total: results.length,
        _fullAccess: false,
        _previewMessage: `Showing 3 of ${results.length} programs. Upgrade to Elite for full access.`
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

export default router;
