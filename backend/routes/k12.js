// K-12 Schools module — searches enriched schools + falls back to raw NCES base data.
// Architecture: enriched schools (k12-enriched.json) provide rich detail (principal,
// AP count, ratings, demographics). For schools not yet enriched, we still surface
// the NCES base record (name, district, address, lat/lon) so parents in any state
// see something. The enriched set grows state-by-state as the grinder completes.
//
// Endpoints:
//   GET /api/k12/states                 — list all states with count of enriched + raw schools
//   GET /api/k12/search?state=WA&level=high&q=bellevue&hasAP=true&minRating=8
//   GET /api/k12/school/:ncessch        — single school detail (merged enriched + raw)
//   GET /api/k12/by-district?state=WA&district=Bellevue School District
//   GET /api/k12/zip/:zip               — schools near a zip code (raw lat/lon)

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRAPED = path.join(__dirname, '..', 'data', 'scraped');
const K12_DIR = path.join(SCRAPED, 'k12-national');

const router = express.Router();

let enrichedCache = null;
let enrichedIndex = null; // ncessch → enriched record

function loadEnriched() {
  if (enrichedCache) return enrichedCache;
  try {
    enrichedCache = JSON.parse(fs.readFileSync(path.join(SCRAPED, 'k12-enriched.json'), 'utf8'));
    enrichedIndex = new Map();
    for (const s of enrichedCache.schools || []) {
      if (s.ncessch) enrichedIndex.set(String(s.ncessch), s);
    }
  } catch (e) {
    console.error('[k12] failed to load enriched:', e.message);
    enrichedCache = { schools: [] };
    enrichedIndex = new Map();
  }
  return enrichedCache;
}

const stateFileCache = new Map(); // `${STATE}_${level}` → parsed JSON
function loadStateLevel(state, level) {
  const key = `${state.toUpperCase()}_${level}`;
  if (stateFileCache.has(key)) return stateFileCache.get(key);
  const filepath = path.join(K12_DIR, `${state.toUpperCase()}_${level}.json`);
  try {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    stateFileCache.set(key, data);
    return data;
  } catch (e) {
    if (e.code !== 'ENOENT') console.error(`[k12] failed to load ${key}:`, e.message);
    return null;
  }
}

function mergeSchool(rawSchool) {
  // Returns the raw record + enriched fields if available, plus an `enriched` flag.
  const ncessch = String(rawSchool.ncessch || '');
  const enriched = enrichedIndex?.get(ncessch);
  return {
    ...rawSchool,
    ...(enriched || {}),
    enriched: !!enriched,
  };
}

// GET /api/k12/states — list states with enriched + raw counts
router.get('/states', (req, res) => {
  loadEnriched();
  const enrichedByState = {};
  for (const s of enrichedCache.schools || []) {
    enrichedByState[s.state] = (enrichedByState[s.state] || 0) + 1;
  }
  // Quick scan of which raw files exist (don't load contents — just check filenames)
  let rawAvailable = [];
  try {
    rawAvailable = fs.readdirSync(K12_DIR).filter(f => f.endsWith('.json'));
  } catch {}
  const states = new Set();
  rawAvailable.forEach(f => states.add(f.split('_')[0]));
  const out = Array.from(states).sort().map(state => ({
    state,
    enrichedCount: enrichedByState[state] || 0,
    rawAvailable: ['high', 'middle', 'elementary'].filter(lvl =>
      rawAvailable.includes(`${state}_${lvl}.json`)
    ),
  }));
  res.json({
    totalEnriched: enrichedCache.schools?.length || 0,
    totalStatesWithRaw: states.size,
    states: out,
  });
});

// GET /api/k12/search — filter schools by state + level + free-text + flags
router.get('/search', (req, res) => {
  loadEnriched();
  const { state, level = 'high', q, hasAP, ibProgram, magnetProgram, minRating, district, enrichedOnly } = req.query;
  if (!state) return res.status(400).json({ error: 'state parameter required (e.g., WA, TX, CA)' });

  const stateUpper = String(state).toUpperCase();
  const lvl = String(level).toLowerCase();
  if (!['high', 'middle', 'elementary'].includes(lvl)) {
    return res.status(400).json({ error: 'level must be high | middle | elementary' });
  }

  const stateData = loadStateLevel(stateUpper, lvl);
  if (!stateData) {
    return res.status(404).json({ error: `No data for ${stateUpper} ${lvl}`, state: stateUpper, level: lvl });
  }

  let schools = (stateData.schools || []).map(mergeSchool);

  if (enrichedOnly === 'true') {
    schools = schools.filter(s => s.enriched);
  }
  if (q && String(q).trim().length >= 2) {
    const term = String(q).trim().toLowerCase();
    schools = schools.filter(s =>
      (s.name || '').toLowerCase().includes(term) ||
      (s.district || '').toLowerCase().includes(term) ||
      (s.city || '').toLowerCase().includes(term)
    );
  }
  if (district) {
    const d = String(district).toLowerCase();
    schools = schools.filter(s => (s.district || '').toLowerCase().includes(d));
  }
  if (hasAP === 'true') {
    schools = schools.filter(s => s.enriched && (s.apCourses || 0) > 0);
  }
  if (ibProgram === 'true') {
    schools = schools.filter(s => s.enriched && s.ibProgram);
  }
  if (magnetProgram === 'true') {
    schools = schools.filter(s => s.enriched && s.magnetProgram);
  }
  if (minRating) {
    const min = Number(minRating);
    schools = schools.filter(s => s.enriched && (s.rating?.score || 0) >= min);
  }

  // Sort: enriched first, then by name
  schools.sort((a, b) => {
    if (a.enriched !== b.enriched) return a.enriched ? -1 : 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  res.json({
    state: stateUpper,
    level: lvl,
    totalInState: stateData.schools?.length || 0,
    matched: schools.length,
    enrichedInResults: schools.filter(s => s.enriched).length,
    results: schools.slice(0, 100),
    note: schools.length > 100 ? 'Returning first 100. Refine filters for narrower set.' : undefined,
  });
});

// GET /api/k12/school/:ncessch — single school detail
router.get('/school/:ncessch', (req, res) => {
  loadEnriched();
  const ncessch = String(req.params.ncessch);
  const enriched = enrichedIndex?.get(ncessch);
  if (enriched) return res.json({ enriched: true, school: enriched });
  // Fall back to scanning raw files — slow but correct (rare path)
  try {
    for (const f of fs.readdirSync(K12_DIR).filter(f => f.endsWith('.json'))) {
      const data = JSON.parse(fs.readFileSync(path.join(K12_DIR, f), 'utf8'));
      const hit = (data.schools || []).find(s => String(s.ncessch) === ncessch);
      if (hit) return res.json({ enriched: false, school: hit });
    }
  } catch (e) {
    console.error('[k12/school] scan error:', e.message);
  }
  res.status(404).json({ error: 'School not found', ncessch });
});

// GET /api/k12/zip/:zip — schools near a zip code
router.get('/zip/:zip', (req, res) => {
  const zip = String(req.params.zip).slice(0, 5);
  if (!/^\d{5}$/.test(zip)) return res.status(400).json({ error: 'zip must be a 5-digit US ZIP' });
  const stateHint = req.query.state;
  const lvl = String(req.query.level || 'high').toLowerCase();
  if (!['high', 'middle', 'elementary'].includes(lvl)) {
    return res.status(400).json({ error: 'level must be high | middle | elementary' });
  }
  loadEnriched();

  // Without a zip-to-state lookup we'd need to scan all 50 states. For v1 require state hint.
  if (!stateHint) {
    return res.status(400).json({ error: 'state query parameter is required (e.g., ?state=WA). zip-only lookup across all states not yet supported.' });
  }
  const stateData = loadStateLevel(String(stateHint).toUpperCase(), lvl);
  if (!stateData) return res.status(404).json({ error: 'State data unavailable' });

  const matches = (stateData.schools || [])
    .filter(s => String(s.zip || '').startsWith(zip))
    .map(mergeSchool);
  res.json({
    zip,
    state: String(stateHint).toUpperCase(),
    level: lvl,
    matched: matches.length,
    results: matches.slice(0, 50),
  });
});

export default router;
