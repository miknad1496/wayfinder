/**
 * Demographics Lookup API
 *
 * Serves IPEDS ethnicity demographics data for the frontend tool.
 * - GET /api/demographics/schools — list all schools (names + IDs)
 * - GET /api/demographics/school/:unitId — full demographics for one school
 * - GET /api/demographics/search?q=... — search schools by name
 *
 * Access control:
 *   - Free users: school list + aggregate school-level data only (no per-major breakdown)
 *   - Paid users (premium/pro): full data including per-major demographics
 */

import { Router } from 'express';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from '../services/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = Router();

// Cache the demographics data in memory (loaded once on first request)
let demographicsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function loadDemographicsData() {
  const now = Date.now();
  if (demographicsCache && (now - cacheTimestamp) < CACHE_TTL) {
    return demographicsCache;
  }

  const filePath = join(__dirname, '..', 'data', 'scraped', 'ethnicity-demographics.json');
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    demographicsCache = JSON.parse(raw);
    cacheTimestamp = now;
    return demographicsCache;
  } catch (err) {
    console.error('Failed to load demographics data:', err.message);
    return null;
  }
}

// Helper: extract user from token (returns null if not authenticated or free)
async function getUserFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    const user = await verifyToken(token);
    return user;
  } catch {
    return null;
  }
}

// Helper: check if user has paid access
function hasPaidAccess(user) {
  if (!user) return false;
  return user.plan === 'premium' || user.plan === 'pro';
}

// Helper: strip per-major data for free users (keep only school aggregate + top 3 majors preview)
function stripForFreeUser(schoolData) {
  return {
    school: schoolData.school,
    unitId: schoolData.unitId,
    year: schoolData.year,
    totalMajorsWithData: schoolData.totalMajorsWithData,
    schoolAggregate: schoolData.schoolAggregate,
    // Give free users a peek: top 3 majors only, and only the top-level percentages
    majors: (schoolData.majors || []).slice(0, 3).map(m => ({
      cipCode: m.cipCode,
      majorName: m.majorName,
      demographics: { total: m.demographics?.total || 0 },
      percentages: m.percentages
    })),
    _preview: true,
    _previewMessage: `Showing 3 of ${schoolData.totalMajorsWithData} majors. Upgrade to Premium for full demographic data across all majors.`
  };
}

// ─── GET /api/demographics/schools ─────────────────────────────
// Returns list of all schools with basic info (no auth required)
router.get('/schools', async (req, res) => {
  try {
    const data = await loadDemographicsData();
    if (!data || !data.schools) {
      return res.status(503).json({ error: 'Demographics data not available. Run the ethnicity scraper first.' });
    }

    const schools = data.schools.map(s => ({
      school: s.school,
      unitId: s.unitId,
      year: s.year,
      totalMajorsWithData: s.totalMajorsWithData,
      totalCompletions: s.schoolAggregate?.demographics?.total || 0
    }));

    res.json({
      metadata: data.metadata,
      schools
    });
  } catch (err) {
    console.error('Demographics schools error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/demographics/school/:unitId ──────────────────────
// Returns full demographics for a single school
// Free users: aggregate only + 3 major preview
// Paid users: full per-major breakdown
router.get('/school/:unitId', async (req, res) => {
  try {
    const data = await loadDemographicsData();
    if (!data || !data.schools) {
      return res.status(503).json({ error: 'Demographics data not available.' });
    }

    const unitId = parseInt(req.params.unitId);
    const school = data.schools.find(s => s.unitId === unitId);

    if (!school) {
      return res.status(404).json({ error: 'School not found in demographics database.' });
    }

    const user = await getUserFromRequest(req);
    const paid = hasPaidAccess(user);

    if (paid) {
      res.json({ school, _fullAccess: true });
    } else {
      res.json({ school: stripForFreeUser(school), _fullAccess: false });
    }
  } catch (err) {
    console.error('Demographics school error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/demographics/search ──────────────────────────────
// Search schools by name (no auth required, returns basic list)
router.get('/search', async (req, res) => {
  try {
    const data = await loadDemographicsData();
    if (!data || !data.schools) {
      return res.status(503).json({ error: 'Demographics data not available.' });
    }

    const query = (req.query.q || '').toLowerCase().trim();
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters.' });
    }

    const matches = data.schools
      .filter(s => s.school.toLowerCase().includes(query))
      .map(s => ({
        school: s.school,
        unitId: s.unitId,
        totalCompletions: s.schoolAggregate?.demographics?.total || 0
      }))
      .slice(0, 10);

    res.json({ results: matches });
  } catch (err) {
    console.error('Demographics search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/demographics/compare ─────────────────────────────
// Compare demographics across multiple schools (paid only)
router.get('/compare', async (req, res) => {
  try {
    const data = await loadDemographicsData();
    if (!data || !data.schools) {
      return res.status(503).json({ error: 'Demographics data not available.' });
    }

    const user = await getUserFromRequest(req);
    if (!hasPaidAccess(user)) {
      return res.status(403).json({
        error: 'School comparison requires a Premium or Pro plan.',
        _requiresUpgrade: true
      });
    }

    const unitIds = (req.query.ids || '').split(',').map(Number).filter(Boolean);
    if (unitIds.length < 2 || unitIds.length > 5) {
      return res.status(400).json({ error: 'Provide 2-5 school IDs to compare.' });
    }

    const schools = unitIds
      .map(id => data.schools.find(s => s.unitId === id))
      .filter(Boolean);

    res.json({ schools, _fullAccess: true });
  } catch (err) {
    console.error('Demographics compare error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
