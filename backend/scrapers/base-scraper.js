/**
 * Base Scraper Framework
 *
 * Shared utilities for all Wayfinder data scrapers.
 * Features: rate limiting, retry with backoff, HTML parsing, output formatting.
 *
 * Usage:
 *   import { fetchWithRetry, delay, parseHTML, saveScrapedData, log } from '../base-scraper.js';
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Logging ──────────────────────────────────────────────────
export function log(scraperName, message, level = 'info') {
  const timestamp = new Date().toISOString().slice(11, 19);
  const prefix = {
    info: '📋',
    success: '✅',
    warn: '⚠️',
    error: '❌',
    progress: '🔄'
  }[level] || '📋';
  console.log(`[${timestamp}] ${prefix} [${scraperName}] ${message}`);
}

// ─── Rate-limited fetch with retry and backoff ─────────────────
const REQUEST_DELAY_MS = 1500; // 1.5s between requests to be polite
let lastRequestTime = 0;

export async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  // Rate limiting
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < REQUEST_DELAY_MS) {
    await delay(REQUEST_DELAY_MS - timeSinceLast);
  }
  lastRequestTime = Date.now();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Wayfinder-DataBot/1.0 (educational research; contact@wayfinderai.org)',
          'Accept': 'text/html,application/json,application/xhtml+xml',
          ...options.headers
        },
        signal: AbortSignal.timeout(30000), // 30s timeout
        ...options
      });

      if (response.ok) return response;

      if (response.status === 429) {
        // Rate limited — wait longer
        const retryAfter = parseInt(response.headers.get('retry-after') || '60');
        log('fetch', `Rate limited on ${url}, waiting ${retryAfter}s`, 'warn');
        await delay(retryAfter * 1000);
        continue;
      }

      if (response.status >= 500 && attempt < maxRetries) {
        await delay(2000 * attempt); // Exponential backoff
        continue;
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (err) {
      if (attempt === maxRetries) throw err;
      log('fetch', `Attempt ${attempt}/${maxRetries} failed for ${url}: ${err.message}`, 'warn');
      await delay(2000 * attempt);
    }
  }
}

// ─── Utility functions ─────────────────────────────────────────
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simple HTML text extractor — strips tags and normalizes whitespace.
 * For more complex parsing, use a proper HTML parser like cheerio.
 */
export function stripHTML(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract JSON-LD structured data from HTML.
 */
export function extractJsonLd(html) {
  const matches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
  if (!matches) return [];
  return matches.map(m => {
    try {
      const json = m.replace(/<[^>]+>/g, '');
      return JSON.parse(json);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

// ─── Data saving ───────────────────────────────────────────────
const DATA_DIR = join(__dirname, '..', 'data', 'scraped');

export async function saveScrapedData(filename, data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const filePath = join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  log('save', `Wrote ${filePath} (${(JSON.stringify(data).length / 1024).toFixed(1)} KB)`, 'success');
  return filePath;
}

export async function loadExistingData(filename) {
  try {
    const raw = await fs.readFile(join(DATA_DIR, filename), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ─── Deduplication ─────────────────────────────────────────────
export function deduplicateByKey(items, keyFn) {
  const seen = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  }
  return Array.from(seen.values());
}

// ─── Field categorization ──────────────────────────────────────
const FIELD_KEYWORDS = {
  'Technology': ['software', 'computer', 'data', 'engineering', 'cyber', 'ai', 'machine learning', 'web', 'app', 'IT', 'tech'],
  'Healthcare': ['health', 'medical', 'nursing', 'pharma', 'clinical', 'biotech', 'hospital', 'dental'],
  'Business': ['business', 'marketing', 'finance', 'accounting', 'consulting', 'management', 'sales', 'banking'],
  'Science': ['research', 'biology', 'chemistry', 'physics', 'environmental', 'lab', 'science'],
  'Arts & Media': ['design', 'art', 'media', 'film', 'music', 'creative', 'journalism', 'writing'],
  'Law & Government': ['law', 'legal', 'government', 'policy', 'political', 'public service', 'nonprofit'],
  'Education': ['education', 'teaching', 'tutor', 'curriculum', 'school'],
  'Engineering': ['mechanical', 'civil', 'electrical', 'aerospace', 'chemical engineering'],
};

export function categorizeField(text) {
  const lower = (text || '').toLowerCase();
  for (const [field, keywords] of Object.entries(FIELD_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return field;
  }
  return 'Other';
}

// ─── State normalization ───────────────────────────────────────
const STATE_MAP = {
  'washington': 'WA', 'california': 'CA', 'texas': 'TX', 'michigan': 'MI',
  'new york': 'NY', 'oregon': 'OR', 'massachusetts': 'MA', 'illinois': 'IL',
  'pennsylvania': 'PA', 'ohio': 'OH', 'florida': 'FL', 'georgia': 'GA',
  'virginia': 'VA', 'north carolina': 'NC', 'new jersey': 'NJ', 'colorado': 'CO',
  'maryland': 'MD', 'minnesota': 'MN', 'arizona': 'AZ', 'indiana': 'IN',
  'tennessee': 'TN', 'missouri': 'MO', 'wisconsin': 'WI', 'connecticut': 'CT',
  'iowa': 'IA', 'utah': 'UT', 'dc': 'DC', 'district of columbia': 'DC',
};

export function normalizeState(stateStr) {
  if (!stateStr) return null;
  const s = stateStr.trim();
  if (s.length === 2) return s.toUpperCase();
  return STATE_MAP[s.toLowerCase()] || s.toUpperCase().slice(0, 2);
}
