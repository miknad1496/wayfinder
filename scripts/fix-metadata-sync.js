#!/usr/bin/env node
/**
 * fix-metadata-sync.js
 *
 * Nightly audit fix — April 8, 2026
 *
 * Fixes:
 * 1. Scholarships: metadata counts out of sync (totalCount, totalScholarships, verifiedCount)
 * 2. Internships: metadata counts out of sync (totalCount, totalInternships, verifiedCount)
 * 3. Programs: metadata counts out of sync (totalCount, totalPrograms, verifiedCount)
 * 4. Programs: remove duplicate "Interlochen Arts Camp" (keep verified version)
 * 5. Programs: normalize "online" format to "remote" for frontend filter consistency
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '..', 'backend', 'data', 'scraped');

async function fixScholarships() {
  const path = join(DATA_DIR, 'scholarships.json');
  const data = JSON.parse(await fs.readFile(path, 'utf8'));
  const actual = data.scholarships.length;
  const verified = data.scholarships.filter(s => s._verified).length;

  const before = {
    totalCount: data.metadata.totalCount,
    totalScholarships: data.metadata.totalScholarships,
    verifiedCount: data.metadata.verifiedCount
  };

  data.metadata.totalCount = actual;
  data.metadata.totalScholarships = actual;
  data.metadata.verifiedCount = verified;
  data.metadata.lastUpdated = new Date().toISOString();

  await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Scholarships: ${before.totalCount}/${before.totalScholarships} → ${actual} entries, ${before.verifiedCount} → ${verified} verified`);
}

async function fixInternships() {
  const path = join(DATA_DIR, 'internships.json');
  const data = JSON.parse(await fs.readFile(path, 'utf8'));
  const actual = data.internships.length;
  const verified = data.internships.filter(i => i._verified).length;

  const before = {
    totalCount: data.metadata.totalCount,
    totalInternships: data.metadata.totalInternships,
    verifiedCount: data.metadata.verifiedCount
  };

  data.metadata.totalCount = actual;
  data.metadata.totalInternships = actual;
  data.metadata.verifiedCount = verified;
  data.metadata.lastUpdated = new Date().toISOString();

  await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Internships: ${before.totalCount}/${before.totalInternships} → ${actual} entries, ${before.verifiedCount} → ${verified} verified`);
}

async function fixPrograms() {
  const path = join(DATA_DIR, 'programs.json');
  const data = JSON.parse(await fs.readFile(path, 'utf8'));

  // 1. Remove duplicate "Interlochen Arts Camp" — keep the verified version
  const beforeCount = data.programs.length;
  const seen = new Map();
  const deduped = [];
  for (const p of data.programs) {
    const existing = seen.get(p.name);
    if (existing !== undefined) {
      // Keep the verified version
      if (p._verified && !deduped[existing]._verified) {
        deduped[existing] = p;
        console.log(`Programs: replaced unverified dupe "${p.name}" with verified version`);
      } else {
        console.log(`Programs: removed duplicate "${p.name}" (kept ${deduped[existing]._verified ? 'verified' : 'first'} version)`);
      }
    } else {
      seen.set(p.name, deduped.length);
      deduped.push(p);
    }
  }
  data.programs = deduped;

  // 2. Normalize "online" format to "remote"
  let formatFixes = 0;
  for (const p of data.programs) {
    if (p.format === 'online') {
      p.format = 'remote';
      formatFixes++;
    }
  }
  if (formatFixes > 0) console.log(`Programs: normalized ${formatFixes} "online" → "remote" format values`);

  // 3. Fix metadata counts
  const actual = data.programs.length;
  const verified = data.programs.filter(p => p._verified).length;

  const before = {
    totalCount: data.metadata.totalCount,
    totalPrograms: data.metadata.totalPrograms,
    verifiedCount: data.metadata.verifiedCount
  };

  data.metadata.totalCount = actual;
  data.metadata.totalPrograms = actual;
  data.metadata.verifiedCount = verified;
  data.metadata.lastUpdated = new Date().toISOString();

  await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Programs: ${beforeCount} → ${actual} entries (deduped ${beforeCount - actual}), ${before.totalCount}/${before.totalPrograms} → ${actual}, ${before.verifiedCount} → ${verified} verified`);
}

async function main() {
  console.log('=== Data Integrity Fix — Metadata Sync ===\n');
  await fixScholarships();
  await fixInternships();
  await fixPrograms();
  console.log('\nDone. All metadata counts now match actual entry counts.');
}

main().catch(err => { console.error(err); process.exit(1); });
