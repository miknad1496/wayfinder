#!/usr/bin/env node
/**
 * One-off PII backfill — scans existing memory + training-capture JSONL files
 * on disk and re-writes each entry with the redactor applied. Idempotent:
 * already-redacted entries are detected via the `_piiRedacted` / `piiRedacted`
 * marker and skipped.
 *
 * USAGE (on Render Shell):
 *   node backend/scripts/backfill-pii-redaction.js
 *
 * Or trigger as a One-Off Job from the Render dashboard with the same command.
 *
 * Safe to run multiple times. Atomic per-file writes (temp + rename).
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { redactPII } from '../services/pii-redactor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data');
const MEMORY_DIR = join(DATA_DIR, 'memory');
const TRAINING_DIR = join(DATA_DIR, 'training-capture');

const stats = {
  files: 0,
  filesModified: 0,
  entriesScanned: 0,
  entriesAlreadyRedacted: 0,
  entriesRedactedNow: 0,
  redactionsByType: {},
  errors: [],
};

function applyToEntry(entry) {
  // Already-redacted markers from real-time path (memory + training).
  if (entry?.piiRedacted || entry?._piiRedacted) {
    stats.entriesAlreadyRedacted++;
    return { entry, changed: false };
  }

  let touched = false;
  const types = new Set();

  // Memory shape: { query, response, ... }
  for (const f of ['query', 'response', 'userMessage']) {
    if (typeof entry[f] === 'string') {
      const r = redactPII(entry[f]);
      if (r.redactedCount > 0) {
        entry[f] = r.text;
        touched = true;
        r.types.forEach(t => types.add(t));
        stats.entriesRedactedNow++;
      }
    }
  }

  // Training-pair shape: { messages: [{role, content}, ...] }
  if (Array.isArray(entry.messages)) {
    for (const m of entry.messages) {
      if (m && typeof m.content === 'string' && m.role !== 'system') {
        const r = redactPII(m.content);
        if (r.redactedCount > 0) {
          m.content = r.text;
          touched = true;
          r.types.forEach(t => types.add(t));
        }
      }
    }
  }

  if (touched) {
    const piiRecord = {
      count: types.size > 0 ? Array.from(types).length : 0,
      types: Array.from(types),
      at: new Date().toISOString(),
      backfill: true,
    };
    // Use whichever marker field the original entry's siblings use.
    if (entry.messages) entry._piiRedacted = piiRecord;
    else entry.piiRedacted = piiRecord;
    types.forEach(t => {
      stats.redactionsByType[t] = (stats.redactionsByType[t] || 0) + 1;
    });
  }

  return { entry, changed: touched };
}

async function processJsonlFile(filepath) {
  stats.files++;
  let raw;
  try {
    raw = await fs.readFile(filepath, 'utf8');
  } catch (e) {
    stats.errors.push({ file: filepath, error: `read: ${e.message}` });
    return;
  }

  const lines = raw.split('\n');
  const out = [];
  let fileChanged = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) { out.push(line); continue; }
    let entry;
    try {
      entry = JSON.parse(line);
    } catch (e) {
      stats.errors.push({ file: filepath, line: i + 1, error: `parse: ${e.message}` });
      out.push(line); // preserve unparseable lines
      continue;
    }
    stats.entriesScanned++;
    const { entry: updated, changed } = applyToEntry(entry);
    if (changed) fileChanged = true;
    out.push(JSON.stringify(updated));
  }

  if (fileChanged) {
    const tmp = `${filepath}.backfill.tmp`;
    try {
      await fs.writeFile(tmp, out.join('\n'));
      await fs.rename(tmp, filepath);
      stats.filesModified++;
    } catch (e) {
      stats.errors.push({ file: filepath, error: `write: ${e.message}` });
    }
  }
}

async function listJsonlFiles(dir) {
  try {
    const names = await fs.readdir(dir);
    return names.filter(n => n.endsWith('.jsonl')).map(n => join(dir, n));
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

async function main() {
  console.log('PII backfill starting...');
  console.log(`  memory dir:    ${MEMORY_DIR}`);
  console.log(`  training dir:  ${TRAINING_DIR}`);

  const memFiles = await listJsonlFiles(MEMORY_DIR);
  const trnFiles = await listJsonlFiles(TRAINING_DIR);
  console.log(`  found ${memFiles.length} memory files, ${trnFiles.length} training files`);

  for (const f of memFiles) await processJsonlFile(f);
  for (const f of trnFiles) await processJsonlFile(f);

  console.log('\n─── Backfill summary ───');
  console.log(`  files scanned:           ${stats.files}`);
  console.log(`  files modified:          ${stats.filesModified}`);
  console.log(`  entries scanned:         ${stats.entriesScanned}`);
  console.log(`  entries already-redacted (skipped): ${stats.entriesAlreadyRedacted}`);
  console.log(`  entries redacted now:    ${stats.entriesRedactedNow}`);
  console.log(`  redactions by type:`);
  for (const [t, n] of Object.entries(stats.redactionsByType).sort((a,b) => b[1]-a[1])) {
    console.log(`    ${t.padEnd(20)} ${n}`);
  }
  if (stats.errors.length) {
    console.log(`\n  ${stats.errors.length} error(s):`);
    for (const e of stats.errors.slice(0, 10)) console.log('   ', JSON.stringify(e));
    if (stats.errors.length > 10) console.log(`   (+ ${stats.errors.length - 10} more)`);
  }
  console.log('\nDone. Run again any time — script is idempotent.');
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
