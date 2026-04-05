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
    } catch {}
  }

  // GitHub fallback
  try {
    const resp = await fetch(GITHUB_RAW_URL);
    if (resp.ok) {
      internshipsCache = await resp.json();
      cacheTimestamp = now;
      return internshipsCache;
    }
  } catch {}

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

export default router;
