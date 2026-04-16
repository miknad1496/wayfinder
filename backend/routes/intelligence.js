/**
 * Opportunity Intelligence API
 *
 * Serves strategic insights alongside the opportunity databases.
 * When a user browses scholarships, internships, or programs, the frontend
 * can request category-level (or eventually item-level) intelligence to
 * display as tips, strategy cards, or contextual guidance.
 *
 * - GET /api/intelligence/:type           — Get cross-cutting strategy for a type
 * - GET /api/intelligence/:type/:category — Get category-specific insights
 */

import { Router } from 'express';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from '../services/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = Router();

let intelCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes — responsive to data updates

async function loadIntel() {
  const now = Date.now();
  if (intelCache && (now - cacheTimestamp) < CACHE_TTL) return intelCache;

  const paths = [
    join(__dirname, '..', 'data', 'scraped', 'opportunity-intelligence.json'),
    join(process.cwd(), 'data', 'scraped', 'opportunity-intelligence.json'),
  ];

  for (const p of paths) {
    try {
      const raw = await fs.readFile(p, 'utf8');
      const parsed = JSON.parse(raw);
      if (!parsed?.metadata) {
        console.warn('[Intelligence] JSON loaded but missing metadata — possible corruption');
        continue;
      }
      intelCache = parsed;
      cacheTimestamp = now;
      return intelCache;
    } catch (err) {
      console.warn(`[Intelligence] Failed to load ${p}: ${err.message}`);
    }
  }

  return null;
}

// Map type param to the correct top-level key in the JSON
const TYPE_MAP = {
  scholarships: 'scholarshipStrategy',
  scholarship: 'scholarshipStrategy',
  internships: 'internshipStrategy',
  internship: 'internshipStrategy',
  programs: 'programStrategy',
  program: 'programStrategy',
  'financial-aid': 'financialAidStrategy',
  aid: 'financialAidStrategy',
};

// ─── GET /api/intelligence/item/:name ───────────────────────
// Returns item-level intelligence for a specific opportunity by name
// MUST be registered before /:type and /:type/:category to avoid route collision
router.get('/item/:name', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Login required.' });

    const intel = await loadIntel();
    if (!intel) return res.status(503).json({ error: 'Intelligence data not available.' });

    const name = req.params.name;

    // Validate name length to prevent abuse
    if (!name || name.length > 200) {
      return res.status(400).json({ error: 'Invalid item name.' });
    }

    // Search across all strategy sections for item-level intel
    for (const [section, data] of Object.entries(intel)) {
      if (data?.itemIntel?.[name]) {
        return res.json({
          name,
          section: section.replace('Strategy', ''),
          ...data.itemIntel[name],
        });
      }
    }

    // Fuzzy match — partial name matching
    for (const [section, data] of Object.entries(intel)) {
      if (!data?.itemIntel) continue;
      const match = Object.entries(data.itemIntel).find(([k]) =>
        k.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(k.toLowerCase())
      );
      if (match) {
        return res.json({
          name: match[0],
          section: section.replace('Strategy', ''),
          ...match[1],
        });
      }
    }

    res.status(404).json({ error: `No item intelligence for: ${name}` });
  } catch (err) {
    console.error('[Intelligence] Item error:', err.message);
    res.status(500).json({ error: 'Failed to load item intelligence.' });
  }
});

// ─── GET /api/intelligence/:type ────────────────────────────
// Returns cross-cutting strategy + category list for a given opportunity type
router.get('/:type', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Login required.' });

    const intel = await loadIntel();
    if (!intel) return res.status(503).json({ error: 'Intelligence data not available.' });

    const key = TYPE_MAP[req.params.type?.toLowerCase()];
    if (!key || !intel[key]) {
      return res.status(404).json({ error: `No intelligence for type: ${req.params.type}` });
    }

    const section = intel[key];

    // Return cross-cutting strategy + list of available categories
    const result = {
      type: req.params.type,
      crossCuttingStrategy: section.crossCuttingStrategy || null,
      availableCategories: section.categoryInsights
        ? Object.keys(section.categoryInsights)
        : [],
    };

    // For financial aid (flat structure, no categoryInsights)
    if (key === 'financialAidStrategy') {
      result.fafsaHacks = section.fafsaHacks || null;
      result.cssProfileInsights = section.cssProfileInsights || null;
      result.negotiationTactics = section.negotiationTactics || null;
    }

    res.json(result);
  } catch (err) {
    console.error('[Intelligence] Error:', err.message);
    res.status(500).json({ error: 'Failed to load intelligence.' });
  }
});

// ─── GET /api/intelligence/:type/:category ──────────────────
// Returns detailed insights for a specific category within a type
router.get('/:type/:category', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Login required.' });

    const intel = await loadIntel();
    if (!intel) return res.status(503).json({ error: 'Intelligence data not available.' });

    const key = TYPE_MAP[req.params.type?.toLowerCase()];
    if (!key || !intel[key]) {
      return res.status(404).json({ error: `No intelligence for type: ${req.params.type}` });
    }

    const section = intel[key];
    const cat = req.params.category?.toLowerCase();

    if (!section.categoryInsights || !section.categoryInsights[cat]) {
      // Try fuzzy match — "essay" should match "essay-based", "tech" should match "tech-industry"
      const fuzzyMatch = section.categoryInsights
        ? Object.entries(section.categoryInsights).find(([k]) => k.includes(cat) || cat.includes(k))
        : null;

      if (fuzzyMatch) {
        return res.json({
          type: req.params.type,
          category: fuzzyMatch[0],
          ...fuzzyMatch[1],
        });
      }

      return res.status(404).json({
        error: `No insights for category: ${cat}`,
        available: section.categoryInsights ? Object.keys(section.categoryInsights) : [],
      });
    }

    res.json({
      type: req.params.type,
      category: cat,
      ...section.categoryInsights[cat],
    });
  } catch (err) {
    console.error('[Intelligence] Category error:', err.message);
    res.status(500).json({ error: 'Failed to load category intelligence.' });
  }
});

export default router;
