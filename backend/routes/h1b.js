// H-1B sponsorship lookup — top sponsoring employers + occupational view.
// Data source: DOL LCA Disclosure FY2025 Q4 (most recent quarter).
//
// Endpoints:
//   GET /api/h1b/employers?q=microsoft         → search by employer name (max 50)
//   GET /api/h1b/employers?state=WA            → top sponsors filing in a state (max 100)
//   GET /api/h1b/employers/top?n=50            → top N employers nationally by certified count
//   GET /api/h1b/occupations?q=software        → SOC search by title
//   GET /api/h1b/occupations?soc=15-1252       → single SOC detail (top employers + median wage)

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data', 'scraped');

const router = express.Router();

let employersCache = null;
let socCache = null;
let socIndex = null;

function loadEmployers() {
  if (employersCache) return employersCache;
  try {
    employersCache = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'h1b-employers.json'), 'utf8'));
  } catch (e) {
    console.error('[h1b] failed to load h1b-employers.json:', e.message);
    employersCache = { metadata: {}, employers: [] };
  }
  return employersCache;
}

function loadSoc() {
  if (socCache) return socCache;
  try {
    socCache = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'h1b-by-soc.json'), 'utf8'));
    socIndex = new Map();
    for (const o of socCache.occupations) socIndex.set(o.soc, o);
  } catch (e) {
    console.error('[h1b] failed to load h1b-by-soc.json:', e.message);
    socCache = { metadata: {}, occupations: [] };
    socIndex = new Map();
  }
  return socCache;
}

router.get('/employers/top', (req, res) => {
  const data = loadEmployers();
  const n = Math.min(Number(req.query.n) || 50, 200);
  const top = data.employers.slice(0, n);
  return res.json({ source: data.metadata.source, quarter: data.metadata.quarter, count: top.length, results: top });
});

router.get('/employers', (req, res) => {
  const data = loadEmployers();
  const { q, state } = req.query;
  if (q && String(q).trim().length >= 2) {
    const term = String(q).trim().toUpperCase();
    const results = data.employers.filter(e => e.name.includes(term)).slice(0, 50);
    return res.json({ source: data.metadata.source, quarter: data.metadata.quarter, count: results.length, results });
  }
  if (state) {
    const st = String(state).toUpperCase();
    const results = data.employers.filter(e => (e.topStates || []).some(s => s.state === st)).slice(0, 100);
    return res.json({ source: data.metadata.source, quarter: data.metadata.quarter, state: st, count: results.length, results });
  }
  return res.status(400).json({ error: 'q (employer name) or state required' });
});

router.get('/occupations', (req, res) => {
  const data = loadSoc();
  const { soc, q } = req.query;
  if (soc) {
    const hit = socIndex.get(soc);
    if (!hit) return res.status(404).json({ error: 'SOC not found', soc });
    return res.json({ source: data.metadata.source, quarter: data.metadata.quarter, result: hit });
  }
  if (q && String(q).trim().length >= 2) {
    const term = String(q).trim().toLowerCase();
    const results = data.occupations.filter(o => (o.title || '').toLowerCase().includes(term)).slice(0, 50);
    return res.json({ source: data.metadata.source, quarter: data.metadata.quarter, count: results.length, results });
  }
  const top = data.occupations.slice(0, 50);
  return res.json({ source: data.metadata.source, quarter: data.metadata.quarter, count: top.length, results: top, note: 'top 50 occupations by H-1B volume' });
});

export default router;
