// BLS OEWS wage lookup — national + per-state median wages by occupation (SOC).
// Data source: BLS Occupational Employment and Wage Statistics, May 2024.
//
// Endpoints:
//   GET /api/wages/national?soc=15-1252         → single occupation, national
//   GET /api/wages/national?q=software          → search occupations by title (max 50)
//   GET /api/wages/state/:state?soc=15-1252     → single occupation, single state
//   GET /api/wages/state/:state?q=software      → search occupations by title within a state
//   GET /api/wages/compare?soc=15-1252&states=WA,CA,TX  → cross-state comparison

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data', 'scraped');

const router = express.Router();

let nationalCache = null;
let stateCache = null;
let stateIndex = null;

function loadNational() {
  if (nationalCache) return nationalCache;
  try {
    nationalCache = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'oews-national.json'), 'utf8'));
  } catch (e) {
    console.error('[wages] failed to load oews-national.json:', e.message);
    nationalCache = { metadata: { source: 'unknown', count: 0 }, wages: [] };
  }
  return nationalCache;
}

function loadState() {
  if (stateCache) return stateCache;
  try {
    stateCache = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'oews-state.json'), 'utf8'));
    stateIndex = {};
    for (const w of stateCache.wages) {
      const k = w.state || 'XX';
      if (!stateIndex[k]) stateIndex[k] = [];
      stateIndex[k].push(w);
    }
  } catch (e) {
    console.error('[wages] failed to load oews-state.json:', e.message);
    stateCache = { metadata: { source: 'unknown', count: 0 }, wages: [] };
    stateIndex = {};
  }
  return stateCache;
}

function pickFields(w) {
  return {
    soc: w.soc,
    title: w.title,
    area: w.area,
    state: w.state,
    employed: w.employed,
    medianAnnual: w.medianAnnual,
    meanAnnual: w.meanAnnual,
    p10: w.p10, p25: w.p25, p75: w.p75, p90: w.p90,
  };
}

router.get('/national', (req, res) => {
  const data = loadNational();
  const { soc, q } = req.query;
  if (soc) {
    const hit = data.wages.find(w => w.soc === soc);
    if (!hit) return res.status(404).json({ error: 'SOC not found', soc });
    return res.json({ source: data.metadata.source, result: pickFields(hit) });
  }
  if (q && String(q).trim().length >= 2) {
    const term = String(q).trim().toLowerCase();
    const results = data.wages
      .filter(w => (w.title || '').toLowerCase().includes(term))
      .slice(0, 50)
      .map(pickFields);
    return res.json({ source: data.metadata.source, count: results.length, results });
  }
  const top = [...data.wages].sort((a, b) => (b.employed || 0) - (a.employed || 0)).slice(0, 50).map(pickFields);
  return res.json({ source: data.metadata.source, count: top.length, results: top, note: 'top 50 occupations by national employment' });
});

router.get('/state/:state', (req, res) => {
  loadState();
  const stateAbbr = String(req.params.state || '').toUpperCase();
  const slice = stateIndex[stateAbbr] || [];
  if (slice.length === 0) return res.status(404).json({ error: 'State not found', state: stateAbbr });
  const { soc, q } = req.query;
  if (soc) {
    const hit = slice.find(w => w.soc === soc);
    if (!hit) return res.status(404).json({ error: 'SOC not found in state', soc, state: stateAbbr });
    return res.json({ source: stateCache.metadata.source, result: pickFields(hit) });
  }
  if (q && String(q).trim().length >= 2) {
    const term = String(q).trim().toLowerCase();
    const results = slice.filter(w => (w.title || '').toLowerCase().includes(term)).slice(0, 50).map(pickFields);
    return res.json({ source: stateCache.metadata.source, count: results.length, results });
  }
  const top = [...slice].sort((a, b) => (b.employed || 0) - (a.employed || 0)).slice(0, 50).map(pickFields);
  return res.json({ source: stateCache.metadata.source, state: stateAbbr, count: top.length, results: top });
});

router.get('/compare', (req, res) => {
  loadState();
  const soc = req.query.soc;
  const states = String(req.query.states || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  if (!soc || states.length === 0) return res.status(400).json({ error: 'soc and states (comma-separated) required' });
  const out = [];
  for (const st of states) {
    const slice = stateIndex[st] || [];
    const hit = slice.find(w => w.soc === soc);
    out.push(hit ? pickFields(hit) : { state: st, soc, error: 'not found' });
  }
  return res.json({ source: stateCache.metadata.source, soc, results: out });
});

export default router;
