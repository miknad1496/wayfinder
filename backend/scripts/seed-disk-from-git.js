#!/usr/bin/env node
/**
 * Render persistent-disk seed bootstrap.
 *
 * The persistent disk at /opt/render/project/src/backend/data hides any
 * files shipped via git into that path. Existing files (committed when the
 * disk was first seeded) are fine — but new ship-with-code data files in
 * subsequent commits never reach production because the disk's state takes
 * precedence over the build's.
 *
 * This script runs at app boot (via package.json start script). For each
 * data file listed in SEED_FILES, if the file is missing from the live
 * disk, it downloads the latest version from GitHub raw and writes it.
 * Idempotent — files that already exist are skipped.
 */

import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data');

const REPO = 'miknad1496/wayfinder';
const BRANCH = 'main';

// Files that ship with code and need to land on the disk on first boot.
// Add new entries here as new ship-with-code data is committed.
const SEED_FILES = [
  'data/scraped/oews-national.json',
  'data/scraped/oews-state.json',
  'data/scraped/h1b-employers.json',
  'data/scraped/h1b-by-soc.json',
];

function downloadToBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'wayfinder-seed' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(downloadToBuffer(res.headers.location));
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  const results = { skipped: 0, downloaded: 0, errors: 0 };
  for (const relPath of SEED_FILES) {
    const localPath = join(__dirname, '..', relPath);
    if (existsSync(localPath)) {
      results.skipped++;
      continue;
    }
    try {
      const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/backend/${relPath}`;
      console.log(`[seed] downloading ${relPath}...`);
      const buf = await downloadToBuffer(url);
      await fs.mkdir(dirname(localPath), { recursive: true });
      await fs.writeFile(localPath, buf);
      console.log(`[seed]   wrote ${buf.length} bytes`);
      results.downloaded++;
    } catch (e) {
      console.error(`[seed] FAILED ${relPath}: ${e.message}`);
      results.errors++;
    }
  }
  console.log(`[seed] done. skipped=${results.skipped} downloaded=${results.downloaded} errors=${results.errors}`);
}

main().catch(err => { console.error('[seed] FATAL:', err); process.exit(0); }); // exit 0 — never block app boot
