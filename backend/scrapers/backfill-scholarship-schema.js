/**
 * Backfill scope and applicationFormat on unverified scholarships.
 *
 * Problem: 967 of 1035 scholarship entries are missing `scope` and
 * `applicationFormat` fields, causing the frontend filters to silently
 * return empty for those entries. This script infers reasonable values
 * from existing fields (eligibility.states, description, tags, category)
 * and writes them back.
 *
 * Rules:
 * - Only touches entries missing scope/applicationFormat
 * - Never overwrites existing values
 * - Never touches verified entries (those already have the fields)
 *
 * Run: node backend/scrapers/backfill-scholarship-schema.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FILE = join(__dirname, '..', 'data', 'scraped', 'scholarships.json');

// ── scope inference ─────────────────────────────────────────────────────
function inferScope(entry) {
  if (entry.scope) return entry.scope; // preserve existing

  const states = entry.eligibility?.states;

  // Treat "all" or empty/missing as national
  if (!states || states.length === 0) return 'national';
  if (states.includes('all') || states.includes('All') || states.includes('ALL')) {
    return 'national';
  }

  // Single state → state-scoped
  if (states.length === 1) return 'state';

  // 2–5 states → regional
  if (states.length >= 2 && states.length <= 5) return 'regional';

  // 6+ states listed but not "all" → effectively national
  return 'national';
}

// ── applicationFormat inference ──────────────────────────────────────────
// Look at description, tags, and strategyTip for strong signals.
// Order of precedence matters: video > portfolio > research-paper > project > interview > essay > application-only
function inferApplicationFormat(entry) {
  if (entry.applicationFormat) return entry.applicationFormat; // preserve existing

  const haystack = [
    entry.description || '',
    entry.strategyTip || '',
    (entry.tags || []).join(' '),
    (Array.isArray(entry.category) ? entry.category.join(' ') : (entry.category || ''))
  ].join(' ').toLowerCase();

  if (/\b(video|youtube|vimeo|submit.{0,10}video)\b/.test(haystack)) return 'video';
  if (/\b(portfolio|art sample|design sample|writing sample|creative work)\b/.test(haystack)) return 'portfolio';
  if (/\b(research paper|research project|thesis|scientific paper)\b/.test(haystack)) return 'research-paper';
  if (/\b(project|invention|prototype|build|stem project)\b/.test(haystack)) return 'project';
  if (/\b(interview|in-person interview|oral)\b/.test(haystack)) return 'interview';

  // Most scholarships require an essay; look for explicit signal
  if (/\b(essay|personal statement|written response|short answer)\b/.test(haystack)) return 'essay';

  // Default: if no essay keyword and no special format, it's application-only
  return 'application-only';
}

// ── main ────────────────────────────────────────────────────────────────
const data = JSON.parse(readFileSync(FILE, 'utf8'));
const arr = data.scholarships || [];

let scopeBackfilled = 0;
let formatBackfilled = 0;
const scopeDist = {};
const formatDist = {};

for (const entry of arr) {
  if (!entry.scope) {
    entry.scope = inferScope(entry);
    scopeBackfilled++;
  }
  scopeDist[entry.scope] = (scopeDist[entry.scope] || 0) + 1;

  if (!entry.applicationFormat) {
    entry.applicationFormat = inferApplicationFormat(entry);
    formatBackfilled++;
  }
  formatDist[entry.applicationFormat] = (formatDist[entry.applicationFormat] || 0) + 1;
}

// Update metadata
data.metadata = data.metadata || {};
data.metadata.lastSchemaBackfill = new Date().toISOString();
data.metadata._schemaBackfillNotes = `Inferred scope and applicationFormat for ${scopeBackfilled} entries missing scope, ${formatBackfilled} missing applicationFormat. Inference based on eligibility.states, description, tags.`;

writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');

console.log(`\n✓ Scholarship schema backfill complete`);
console.log(`  Total entries:       ${arr.length}`);
console.log(`  Scope backfilled:    ${scopeBackfilled}`);
console.log(`  Format backfilled:   ${formatBackfilled}`);
console.log(`\n  Scope distribution:  ${JSON.stringify(scopeDist)}`);
console.log(`  Format distribution: ${JSON.stringify(formatDist)}\n`);
