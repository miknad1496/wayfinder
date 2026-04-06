/**
 * data-integrity.js — Single source of truth for data validation and deduplication.
 *
 * Every path that writes to internships.json, scholarships.json, or programs.json
 * MUST go through this module. It enforces:
 *   1. Deduplication by canonical key (title/name + org/company)
 *   2. Schema validation (required fields, type checks)
 *   3. Verified entry priority (verified always beats non-verified duplicates)
 *   4. Audit logging (what was added, removed, or flagged)
 *
 * Usage:
 *   import { validateAndDedup, validateEntry, getDataStats } from '../services/data-integrity.js';
 *   const { clean, removed, warnings } = validateAndDedup('internships', rawEntries);
 */

// ═══════════════════════════════════════════════════════════════════
// SCHEMA DEFINITIONS — required fields per data type
// ═══════════════════════════════════════════════════════════════════

const SCHEMAS = {
  internships: {
    keyFields: ['title', 'company'],       // Dedup key
    nameField: 'title',                     // Display name
    required: ['title', 'company', 'field', 'description'],
    recommended: ['location', 'deadline', 'url', 'duration', 'format'],
    verifiedRequired: ['_source', '_verified', '_verifiedDate'],
    maxTitleLength: 200,
    maxDescLength: 2000,
  },
  scholarships: {
    keyFields: ['name', 'provider'],
    nameField: 'name',
    required: ['name', 'provider', 'description'],
    recommended: ['amount', 'deadline', 'scope', 'url'],
    verifiedRequired: ['_source', '_verified', '_verifiedDate'],
    maxTitleLength: 200,
    maxDescLength: 2000,
  },
  programs: {
    keyFields: ['name', 'provider'],
    nameField: 'name',
    required: ['name', 'provider', 'description'],
    recommended: ['location', 'deadline', 'category', 'format'],
    verifiedRequired: ['_source', '_verified', '_verifiedDate'],
    maxTitleLength: 200,
    maxDescLength: 2000,
  }
};

// ═══════════════════════════════════════════════════════════════════
// CANONICAL KEY — normalized dedup key for an entry
// ═══════════════════════════════════════════════════════════════════

function canonicalKey(type, entry) {
  const schema = SCHEMAS[type];
  if (!schema) throw new Error(`Unknown data type: ${type}`);

  return schema.keyFields
    .map(f => (entry[f] || '').toString().trim().toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')  // Strip punctuation
      .replace(/\s+/g, ' ')          // Normalize whitespace
    )
    .join('|||');
}

// ═══════════════════════════════════════════════════════════════════
// VALIDATE A SINGLE ENTRY
// ═══════════════════════════════════════════════════════════════════

export function validateEntry(type, entry) {
  const schema = SCHEMAS[type];
  if (!schema) return { valid: false, errors: [`Unknown type: ${type}`] };

  const errors = [];
  const warnings = [];

  // Required fields
  for (const field of schema.required) {
    const val = entry[field];
    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Name length check
  const name = entry[schema.nameField];
  if (typeof name === 'string' && name.length > schema.maxTitleLength) {
    warnings.push(`${schema.nameField} exceeds ${schema.maxTitleLength} chars`);
  }

  // Description length
  if (typeof entry.description === 'string' && entry.description.length > schema.maxDescLength) {
    warnings.push(`description exceeds ${schema.maxDescLength} chars`);
  }

  // Verified entries need extra fields
  if (entry._verified) {
    for (const field of schema.verifiedRequired) {
      if (!entry[field]) {
        errors.push(`Verified entry missing: ${field}`);
      }
    }
    // _source must be a real URL, not a bare domain
    if (entry._source && typeof entry._source === 'string') {
      if (!entry._source.startsWith('http://') && !entry._source.startsWith('https://')) {
        warnings.push(`_source is not a full URL: "${entry._source}" — should start with https://`);
      }
    }
  }

  // Recommended fields (warnings only)
  for (const field of schema.recommended) {
    if (entry[field] === undefined || entry[field] === null) {
      warnings.push(`Missing recommended field: ${field}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ═══════════════════════════════════════════════════════════════════
// VALIDATE AND DEDUPLICATE AN ENTIRE DATASET
// ═══════════════════════════════════════════════════════════════════

/**
 * Takes a raw array of entries and returns a clean, deduped array.
 * Verified entries ALWAYS win over non-verified duplicates.
 * Invalid entries (missing required fields) are dropped with warnings.
 *
 * @param {string} type - 'internships' | 'scholarships' | 'programs'
 * @param {Array} entries - Raw entries to validate
 * @returns {{ clean: Array, removed: Array, warnings: string[], stats: object }}
 */
export function validateAndDedup(type, entries) {
  const schema = SCHEMAS[type];
  if (!schema) throw new Error(`Unknown data type: ${type}`);

  const keyMap = new Map();       // canonical key → best entry
  const removed = [];
  const warnings = [];
  let invalidCount = 0;
  let dupCount = 0;

  for (const entry of entries) {
    // Validate
    const validation = validateEntry(type, entry);
    if (!validation.valid) {
      const name = entry[schema.nameField] || '<unnamed>';
      warnings.push(`DROPPED "${name}": ${validation.errors.join(', ')}`);
      removed.push({ entry, reason: 'invalid', errors: validation.errors });
      invalidCount++;
      continue;
    }

    // Collect non-critical warnings
    for (const w of validation.warnings) {
      warnings.push(`WARNING "${entry[schema.nameField]}": ${w}`);
    }

    // Dedup
    const key = canonicalKey(type, entry);
    if (key === '|||' || key.replace(/\|/g, '').trim() === '') {
      warnings.push(`DROPPED entry with empty key fields`);
      removed.push({ entry, reason: 'empty_key' });
      invalidCount++;
      continue;
    }

    const existing = keyMap.get(key);
    if (!existing) {
      keyMap.set(key, entry);
    } else {
      // Verified always wins
      if (entry._verified && !existing._verified) {
        removed.push({ entry: existing, reason: 'replaced_by_verified' });
        keyMap.set(key, entry);
        dupCount++;
      } else if (!entry._verified && existing._verified) {
        removed.push({ entry, reason: 'duplicate_of_verified' });
        dupCount++;
      } else {
        // Both same verification status — keep the one with more populated fields
        const entryFields = Object.values(entry).filter(v => v != null && v !== '').length;
        const existFields = Object.values(existing).filter(v => v != null && v !== '').length;
        if (entryFields > existFields) {
          removed.push({ entry: existing, reason: 'duplicate_less_complete' });
          keyMap.set(key, entry);
        } else {
          removed.push({ entry, reason: 'duplicate' });
        }
        dupCount++;
      }
    }
  }

  const clean = Array.from(keyMap.values());

  return {
    clean,
    removed,
    warnings,
    stats: {
      input: entries.length,
      output: clean.length,
      duplicatesRemoved: dupCount,
      invalidRemoved: invalidCount,
      verified: clean.filter(e => e._verified).length,
      nonVerified: clean.filter(e => !e._verified).length,
    }
  };
}

// ═══════════════════════════════════════════════════════════════════
// QUICK STATS — run on a dataset without modifying it
// ═══════════════════════════════════════════════════════════════════

export function getDataStats(type, entries) {
  const schema = SCHEMAS[type];
  if (!schema) throw new Error(`Unknown data type: ${type}`);

  const keys = new Set();
  let dupes = 0;
  let verified = 0;
  let invalid = 0;

  for (const entry of entries) {
    if (entry._verified) verified++;

    const validation = validateEntry(type, entry);
    if (!validation.valid) invalid++;

    const key = canonicalKey(type, entry);
    if (keys.has(key)) dupes++;
    else keys.add(key);
  }

  return {
    total: entries.length,
    unique: keys.size,
    duplicates: dupes,
    verified,
    invalid,
    healthy: dupes === 0 && invalid === 0
  };
}

// ═══════════════════════════════════════════════════════════════════
// STARTUP HEALTH CHECK — call from server.js on boot
// ═══════════════════════════════════════════════════════════════════

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data', 'scraped');

/**
 * Run health check on all three data files at server startup.
 * Logs warnings but does NOT auto-fix (too dangerous without human review).
 * Returns { healthy: bool, reports: { internships, scholarships, programs } }
 */
export async function runDataHealthCheck() {
  const reports = {};
  let allHealthy = true;

  const files = {
    internships: { file: 'internships.json', arrayKey: 'internships' },
    scholarships: { file: 'scholarships.json', arrayKey: 'scholarships' },
    programs: { file: 'programs.json', arrayKey: 'programs' },
  };

  for (const [type, { file, arrayKey }] of Object.entries(files)) {
    try {
      const raw = await fs.readFile(join(DATA_DIR, file), 'utf-8');
      const data = JSON.parse(raw);
      const entries = data[arrayKey] || [];
      const stats = getDataStats(type, entries);

      reports[type] = stats;

      if (!stats.healthy) {
        allHealthy = false;
        console.warn(`⚠️  [Data Health] ${type}: ${stats.duplicates} duplicates, ${stats.invalid} invalid entries out of ${stats.total}`);
      } else {
        console.log(`✅ [Data Health] ${type}: ${stats.total} entries (${stats.verified} verified) — clean`);
      }
    } catch (err) {
      reports[type] = { error: err.message };
      allHealthy = false;
      console.error(`❌ [Data Health] ${type}: Failed to read — ${err.message}`);
    }
  }

  return { healthy: allHealthy, reports };
}

export { SCHEMAS, canonicalKey };
