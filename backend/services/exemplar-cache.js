// REVAMP V2: EXEMPLAR CACHE PATCH151
//
// Independent BM25-ish lookup against the exemplar-*.md files in distilled/.
// Used by router.js to detect "this query has a pre-synthesized Opus exemplar
// available — we can skip firing fresh Opus and just paraphrase the cached one."
//
// Self-contained on purpose: does NOT depend on knowledge.js / buildCategoryIndex.
// That way, a regression in the main RAG path can't break router cache lookup,
// and a regression here can't break main RAG. Both fail independently.
//
// Cache is in-memory, refreshed every 10 minutes. File system reads are async
// and wrapped in try/catch — any IO error returns "no hit" (the safe default).

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const EXEMPLAR_DIR = join(__dirname, '..', 'knowledge-base', 'distilled');

// ── Cache state ─────────────────────────────────────────────────────────────

const TTL_MS = 10 * 60 * 1000; // 10 minutes
let _index = null;            // Array<{ filename, title, text, tokens, summary }>
let _indexLoadedAt = 0;
let _indexBuildErrors = 0;

// ── Tokenization (cheap stemming, no deps) ─────────────────────────────────

const STOPWORDS = new Set([
  'a','an','the','and','or','but','if','in','on','at','to','for','of','with','from','by',
  'is','am','are','was','were','be','been','being','do','does','did','done','have','has',
  'had','having','will','would','should','could','can','may','might','must','shall',
  'i','you','he','she','it','we','they','my','your','his','her','its','our','their',
  'me','him','us','them','this','that','these','those','what','which','who','whom',
  'how','when','where','why','there','here','about','as','so','than','then','too','very',
  'just','only','also','any','some','such','no','not','nor','own','same','said','say',
  'get','got','go','goes','went','going','make','makes','made','take','takes','took',
  'see','saw','seen','know','known','knew','want','wants','wanted','need','needs',
  'one','two','three','many','much','more','most','less','few','all','each','every',
  's','t','d','ll','re','ve','m',
]);

function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && t.length <= 30 && !STOPWORDS.has(t));
}

// ── Index build ─────────────────────────────────────────────────────────────

async function _buildIndex() {
  const records = [];
  let entries;
  try {
    entries = await fs.readdir(EXEMPLAR_DIR);
  } catch (err) {
    console.warn('[exemplar-cache] readdir failed: ' + err.message);
    _indexBuildErrors++;
    return records;
  }

  const exemplarFiles = entries.filter(f => f.startsWith('exemplar-') && f.endsWith('.md'));

  for (const filename of exemplarFiles) {
    try {
      const text = await fs.readFile(join(EXEMPLAR_DIR, filename), 'utf-8');
      // Title = first heading line
      const titleMatch = text.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : filename;
      // Summary = first paragraph after title (cheap quick-look)
      const summary = (text.split(/\n\n/).find(p => p.length > 80 && !p.startsWith('#') && !p.startsWith('>')) || '').slice(0, 400);
      const tokens = tokenize(text);
      records.push({ filename, title, text, tokens, summary });
    } catch (err) {
      console.warn('[exemplar-cache] read ' + filename + ' failed: ' + err.message);
      _indexBuildErrors++;
    }
  }

  return records;
}

async function _ensureIndex() {
  const now = Date.now();
  if (_index && (now - _indexLoadedAt) < TTL_MS) return _index;
  try {
    _index = await _buildIndex();
    _indexLoadedAt = now;
    return _index;
  } catch (err) {
    // Catastrophic failure — leave _index as it was (could be null) and return empty.
    console.warn('[exemplar-cache] _buildIndex catastrophic: ' + err.message);
    _indexBuildErrors++;
    return _index || [];
  }
}

// ── Scoring ─────────────────────────────────────────────────────────────────

function _scoreRecord(record, queryTokens, queryTokenSet) {
  if (!record.tokens || record.tokens.length === 0) return 0;
  // BM25-lite: term frequency in record, weighted by query token uniqueness.
  // Title hits and summary hits weighted higher.
  const recordTokenSet = new Set(record.tokens);
  let score = 0;

  // Body hits
  for (const qt of queryTokenSet) {
    if (recordTokenSet.has(qt)) {
      // Count occurrences (capped at 5 to prevent over-weighting one term)
      let tf = 0;
      for (const rt of record.tokens) {
        if (rt === qt) {
          tf++;
          if (tf >= 5) break;
        }
      }
      score += Math.min(tf, 5) * 0.5; // each match worth 0.5 up to 2.5
    }
  }

  // Title hits worth 2x
  const titleTokens = new Set(tokenize(record.title));
  for (const qt of queryTokenSet) {
    if (titleTokens.has(qt)) score += 2.0;
  }

  // Summary hits (worth 1.0)
  const summaryTokens = new Set(tokenize(record.summary));
  for (const qt of queryTokenSet) {
    if (summaryTokens.has(qt)) score += 1.0;
  }

  // Bonus for query token coverage (% of query tokens that hit anywhere)
  const allRecordTokens = new Set([...recordTokenSet, ...titleTokens, ...summaryTokens]);
  let coverageHits = 0;
  for (const qt of queryTokenSet) if (allRecordTokens.has(qt)) coverageHits++;
  const coverage = queryTokenSet.size > 0 ? coverageHits / queryTokenSet.size : 0;
  score += coverage * 3.0; // up to 3 bonus

  return score;
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Look up the top-N most relevant exemplars for a query.
 * Returns an empty array on any internal failure — caller treats as "no cache hit."
 *
 * @param {string} query
 * @param {number} topN - how many to return (default 3)
 * @returns {Promise<Array<{filename, title, score, summary, snippet}>>}
 */
export async function lookupExemplars(query, topN = 3) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) return [];
  let index;
  try {
    index = await _ensureIndex();
  } catch (err) {
    console.warn('[exemplar-cache] ensureIndex failed: ' + err.message);
    return [];
  }
  if (!index || index.length === 0) return [];

  try {
    const queryTokens = tokenize(query);
    const queryTokenSet = new Set(queryTokens);
    if (queryTokenSet.size === 0) return [];

    const scored = index.map(rec => ({
      filename: rec.filename,
      title: rec.title,
      summary: rec.summary,
      snippet: rec.text.slice(0, 1200),
      fullText: rec.text,
      score: _scoreRecord(rec, queryTokens, queryTokenSet),
    }));

    return scored
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  } catch (err) {
    console.warn('[exemplar-cache] lookup scoring failed: ' + err.message);
    return [];
  }
}

/**
 * Quick check: does a hit exist above threshold? Cheaper than lookupExemplars
 * because it short-circuits at the first qualifying hit.
 *
 * @param {string} query
 * @param {number} threshold - minimum score (default 5.0 — calibrated for cache-quality)
 * @returns {Promise<boolean>}
 */
export async function hasCacheHit(query, threshold = 5.0) {
  const results = await lookupExemplars(query, 1);
  return results.length > 0 && results[0].score >= threshold;
}

/**
 * Format the top-N exemplars into a context block for prepending to SLM input.
 *
 * @param {Array} exemplars - from lookupExemplars()
 * @returns {string}
 */
export function formatExemplarContext(exemplars) {
  if (!exemplars || exemplars.length === 0) return '';
  const blocks = exemplars.map((ex, i) => {
    return `=== EXEMPLAR ${i + 1}: ${ex.title} (score ${ex.score.toFixed(1)}) ===\n${ex.snippet}`;
  });
  return '## PRE-SYNTHESIZED REFERENCE EXEMPLARS\n\nThese are previously-curated deep responses to similar questions. Use their reasoning patterns, structure, and Wayfinder-data integration as your guide. Adapt content to the specific user query — do NOT copy verbatim.\n\n' + blocks.join('\n\n');
}

// ── Stats / health ──────────────────────────────────────────────────────────

const _hitStats = {
  totalLookups: 0,
  hitsAboveThreshold: 0,
  noHits: 0,
  lookupLatencies: [], // last 100
};

export function _recordLookup(latencyMs, hadHit) {
  _hitStats.totalLookups++;
  if (hadHit) _hitStats.hitsAboveThreshold++;
  else _hitStats.noHits++;
  if (typeof latencyMs === 'number' && latencyMs >= 0) {
    _hitStats.lookupLatencies.push(latencyMs);
    if (_hitStats.lookupLatencies.length > 100) _hitStats.lookupLatencies.shift();
  }
}

export function getCacheStats() {
  const lat = [..._hitStats.lookupLatencies].sort((a, b) => a - b);
  const p50 = lat.length ? lat[Math.floor(lat.length / 2)] : null;
  const hitRate = _hitStats.totalLookups > 0 ? _hitStats.hitsAboveThreshold / _hitStats.totalLookups : 0;
  return {
    exemplarCount: _index ? _index.length : 0,
    indexLoadedAt: _indexLoadedAt ? new Date(_indexLoadedAt).toISOString() : null,
    indexBuildErrors: _indexBuildErrors,
    totalLookups: _hitStats.totalLookups,
    hitsAboveThreshold: _hitStats.hitsAboveThreshold,
    hitRate: Math.round(hitRate * 1000) / 1000,
    lookupP50Ms: p50,
  };
}

/** Manually invalidate the index — useful for tests + admin endpoints. */
export function invalidateExemplarCache() {
  _index = null;
  _indexLoadedAt = 0;
}
