// PATCH118: in-memory response cache for international queries.
// Cuts cost on repeat questions. 24h TTL, LRU eviction at 500 entries.

const _cache = new Map(); // key -> { text, ts, sources, mode }
const CACHE_MAX = 500;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function _hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
  return h.toString(36);
}

export function intlCacheKey(lang, message) {
  const norm = String(message || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return (lang || 'en') + ':' + _hash(norm);
}

export function intlCacheGet(lang, message) {
  const k = intlCacheKey(lang, message);
  const e = _cache.get(k);
  if (!e) return null;
  if (Date.now() - e.ts > CACHE_TTL_MS) {
    _cache.delete(k);
    return null;
  }
  // Move to end (LRU)
  _cache.delete(k);
  _cache.set(k, e);
  return e;
}

export function intlCacheSet(lang, message, payload) {
  const k = intlCacheKey(lang, message);
  if (_cache.size >= CACHE_MAX) {
    // Drop oldest
    const first = _cache.keys().next().value;
    if (first) _cache.delete(first);
  }
  _cache.set(k, { ...payload, ts: Date.now() });
}

export function intlCacheStats() {
  return { size: _cache.size, max: CACHE_MAX, ttlMs: CACHE_TTL_MS };
}
