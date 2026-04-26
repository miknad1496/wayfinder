/**
 * Shared data loader: GitHub-first with TTL caching + disk fallback.
 *
 * Why: the persistent disk on Render keeps stale copies of grinder-written
 * files forever once seeded. Disk-first loading meant new grinder commits
 * never reached production.
 *
 * Pattern:
 *   1. In-memory cache with TTL (default 5 min). On hit, return immediately.
 *   2. On miss, fetch fresh from GitHub raw. Cache it. Write to disk too.
 *   3. If GitHub unreachable, fall back to whatever's on disk.
 *
 * Result: new grinder commits reach production within 5 min automatically.
 *         If GitHub is down, production still serves last-known-good data.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const GH_RAW_BASE = 'https://raw.githubusercontent.com/miknad1496/wayfinder/main/backend';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

const _caches = new Map(); // relPath -> { data, timestamp }

function _fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'wayfinder-loader' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) return resolve(_fetchUrl(res.headers.location));
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Load a JSON file with GitHub-first + TTL + disk fallback.
 * @param {string} relPath relative path from backend/, e.g. 'data/scraped/programs.json'
 * @param {string} backendDir absolute path to the backend dir (pass __dirname/..)
 * @param {number} ttlMs cache TTL in ms (default 5 minutes)
 * @returns {Promise<object>} parsed JSON
 */
export async function loadJsonFresh(relPath, backendDir, ttlMs = DEFAULT_TTL) {
  const cached = _caches.get(relPath);
  if (cached && (Date.now() - cached.timestamp) < ttlMs) return cached.data;

  const url = `${GH_RAW_BASE}/${relPath}`;
  const localPath = path.join(backendDir, relPath);

  // Try GitHub first (always — this is the primary source)
  try {
    const buf = await _fetchUrl(url);
    const data = JSON.parse(buf.toString('utf8'));
    _caches.set(relPath, { data, timestamp: Date.now() });
    // Persist to disk for fallback if GitHub is later unreachable
    try {
      fs.mkdirSync(path.dirname(localPath), { recursive: true });
      fs.writeFileSync(localPath, buf);
    } catch (writeErr) { /* disk write failed but we have data — keep going */ }
    return data;
  } catch (ghErr) {
    console.warn(`[loader] GitHub fetch failed for ${relPath}: ${ghErr.message} — falling back to disk`);
  }

  // Fallback to disk
  try {
    const raw = fs.readFileSync(localPath, 'utf8');
    const data = JSON.parse(raw);
    _caches.set(relPath, { data, timestamp: Date.now() });
    return data;
  } catch (diskErr) {
    console.error(`[loader] disk fallback failed for ${relPath}: ${diskErr.message}`);
    return null;
  }
}

/**
 * Manually clear a cache entry (useful for admin endpoints / testing).
 */
export function clearCache(relPath) {
  if (relPath) _caches.delete(relPath);
  else _caches.clear();
}

/**
 * Get cache stats for diagnostics.
 */
export function getCacheStats() {
  const out = [];
  for (const [k, v] of _caches.entries()) {
    out.push({ key: k, ageMs: Date.now() - v.timestamp });
  }
  return out;
}
