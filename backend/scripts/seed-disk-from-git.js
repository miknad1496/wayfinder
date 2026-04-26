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
  'data/scraped/volunteer-opportunities.json',
  'data/scraped/k12-enriched.json',
  'data/scraped/summer-camp-insights.json',
  'data/scraped/k12-national/AK_elementary.json',
  'data/scraped/k12-national/AK_high.json',
  'data/scraped/k12-national/AK_middle.json',
  'data/scraped/k12-national/AL_elementary.json',
  'data/scraped/k12-national/AL_high.json',
  'data/scraped/k12-national/AL_middle.json',
  'data/scraped/k12-national/AR_elementary.json',
  'data/scraped/k12-national/AR_high.json',
  'data/scraped/k12-national/AR_middle.json',
  'data/scraped/k12-national/AZ_elementary.json',
  'data/scraped/k12-national/AZ_high.json',
  'data/scraped/k12-national/AZ_middle.json',
  'data/scraped/k12-national/CA_elementary.json',
  'data/scraped/k12-national/CA_high.json',
  'data/scraped/k12-national/CA_middle.json',
  'data/scraped/k12-national/CO_elementary.json',
  'data/scraped/k12-national/CO_high.json',
  'data/scraped/k12-national/CO_middle.json',
  'data/scraped/k12-national/CT_elementary.json',
  'data/scraped/k12-national/CT_high.json',
  'data/scraped/k12-national/CT_middle.json',
  'data/scraped/k12-national/DC_elementary.json',
  'data/scraped/k12-national/DC_high.json',
  'data/scraped/k12-national/DC_middle.json',
  'data/scraped/k12-national/DE_elementary.json',
  'data/scraped/k12-national/DE_high.json',
  'data/scraped/k12-national/DE_middle.json',
  'data/scraped/k12-national/FL_elementary.json',
  'data/scraped/k12-national/FL_high.json',
  'data/scraped/k12-national/FL_middle.json',
  'data/scraped/k12-national/GA_elementary.json',
  'data/scraped/k12-national/GA_high.json',
  'data/scraped/k12-national/GA_middle.json',
  'data/scraped/k12-national/HI_elementary.json',
  'data/scraped/k12-national/HI_high.json',
  'data/scraped/k12-national/HI_middle.json',
  'data/scraped/k12-national/IA_elementary.json',
  'data/scraped/k12-national/IA_high.json',
  'data/scraped/k12-national/IA_middle.json',
  'data/scraped/k12-national/ID_elementary.json',
  'data/scraped/k12-national/ID_high.json',
  'data/scraped/k12-national/ID_middle.json',
  'data/scraped/k12-national/IL_elementary.json',
  'data/scraped/k12-national/IL_high.json',
  'data/scraped/k12-national/IL_middle.json',
  'data/scraped/k12-national/IN_elementary.json',
  'data/scraped/k12-national/IN_high.json',
  'data/scraped/k12-national/IN_middle.json',
  'data/scraped/k12-national/KS_elementary.json',
  'data/scraped/k12-national/KS_high.json',
  'data/scraped/k12-national/KS_middle.json',
  'data/scraped/k12-national/KY_elementary.json',
  'data/scraped/k12-national/KY_high.json',
  'data/scraped/k12-national/KY_middle.json',
  'data/scraped/k12-national/LA_elementary.json',
  'data/scraped/k12-national/LA_high.json',
  'data/scraped/k12-national/LA_middle.json',
  'data/scraped/k12-national/MA_elementary.json',
  'data/scraped/k12-national/MA_high.json',
  'data/scraped/k12-national/MA_middle.json',
  'data/scraped/k12-national/MD_elementary.json',
  'data/scraped/k12-national/MD_high.json',
  'data/scraped/k12-national/MD_middle.json',
  'data/scraped/k12-national/ME_elementary.json',
  'data/scraped/k12-national/ME_high.json',
  'data/scraped/k12-national/ME_middle.json',
  'data/scraped/k12-national/MI_elementary.json',
  'data/scraped/k12-national/MI_high.json',
  'data/scraped/k12-national/MI_middle.json',
  'data/scraped/k12-national/MN_elementary.json',
  'data/scraped/k12-national/MN_high.json',
  'data/scraped/k12-national/MN_middle.json',
  'data/scraped/k12-national/MO_elementary.json',
  'data/scraped/k12-national/MO_high.json',
  'data/scraped/k12-national/MO_middle.json',
  'data/scraped/k12-national/MS_elementary.json',
  'data/scraped/k12-national/MS_high.json',
  'data/scraped/k12-national/MS_middle.json',
  'data/scraped/k12-national/MT_elementary.json',
  'data/scraped/k12-national/MT_high.json',
  'data/scraped/k12-national/MT_middle.json',
  'data/scraped/k12-national/NC_elementary.json',
  'data/scraped/k12-national/NC_high.json',
  'data/scraped/k12-national/NC_middle.json',
  'data/scraped/k12-national/ND_elementary.json',
  'data/scraped/k12-national/ND_high.json',
  'data/scraped/k12-national/ND_middle.json',
  'data/scraped/k12-national/NE_elementary.json',
  'data/scraped/k12-national/NE_high.json',
  'data/scraped/k12-national/NE_middle.json',
  'data/scraped/k12-national/NH_elementary.json',
  'data/scraped/k12-national/NH_high.json',
  'data/scraped/k12-national/NH_middle.json',
  'data/scraped/k12-national/NJ_elementary.json',
  'data/scraped/k12-national/NJ_high.json',
  'data/scraped/k12-national/NJ_middle.json',
  'data/scraped/k12-national/NM_elementary.json',
  'data/scraped/k12-national/NM_high.json',
  'data/scraped/k12-national/NM_middle.json',
  'data/scraped/k12-national/NV_elementary.json',
  'data/scraped/k12-national/NV_high.json',
  'data/scraped/k12-national/NV_middle.json',
  'data/scraped/k12-national/NY_elementary.json',
  'data/scraped/k12-national/NY_high.json',
  'data/scraped/k12-national/NY_middle.json',
  'data/scraped/k12-national/OH_elementary.json',
  'data/scraped/k12-national/OH_high.json',
  'data/scraped/k12-national/OH_middle.json',
  'data/scraped/k12-national/OK_elementary.json',
  'data/scraped/k12-national/OK_high.json',
  'data/scraped/k12-national/OK_middle.json',
  'data/scraped/k12-national/OR_elementary.json',
  'data/scraped/k12-national/OR_high.json',
  'data/scraped/k12-national/OR_middle.json',
  'data/scraped/k12-national/PA_elementary.json',
  'data/scraped/k12-national/PA_high.json',
  'data/scraped/k12-national/PA_middle.json',
  'data/scraped/k12-national/RI_elementary.json',
  'data/scraped/k12-national/RI_high.json',
  'data/scraped/k12-national/RI_middle.json',
  'data/scraped/k12-national/SC_elementary.json',
  'data/scraped/k12-national/SC_high.json',
  'data/scraped/k12-national/SC_middle.json',
  'data/scraped/k12-national/SD_elementary.json',
  'data/scraped/k12-national/SD_high.json',
  'data/scraped/k12-national/SD_middle.json',
  'data/scraped/k12-national/TN_elementary.json',
  'data/scraped/k12-national/TN_high.json',
  'data/scraped/k12-national/TN_middle.json',
  'data/scraped/k12-national/TX_elementary.json',
  'data/scraped/k12-national/TX_high.json',
  'data/scraped/k12-national/TX_middle.json',
  'data/scraped/k12-national/UT_elementary.json',
  'data/scraped/k12-national/UT_high.json',
  'data/scraped/k12-national/UT_middle.json',
  'data/scraped/k12-national/VA_elementary.json',
  'data/scraped/k12-national/VA_high.json',
  'data/scraped/k12-national/VA_middle.json',
  'data/scraped/k12-national/VT_elementary.json',
  'data/scraped/k12-national/VT_high.json',
  'data/scraped/k12-national/VT_middle.json',
  'data/scraped/k12-national/WA_elementary.json',
  'data/scraped/k12-national/WA_high.json',
  'data/scraped/k12-national/WA_middle.json',
  'data/scraped/k12-national/WI_elementary.json',
  'data/scraped/k12-national/WI_high.json',
  'data/scraped/k12-national/WI_middle.json',
  'data/scraped/k12-national/WV_elementary.json',
  'data/scraped/k12-national/WV_high.json',
  'data/scraped/k12-national/WV_middle.json',
  'data/scraped/k12-national/WY_elementary.json',
  'data/scraped/k12-national/WY_high.json',
  'data/scraped/k12-national/WY_middle.json',
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
