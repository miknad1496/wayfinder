/**
 * Data Sync Service
 *
 * Ensures committed data files exist on the Render persistent disk.
 *
 * Problem: Render persistent disks mount OVER the git-deployed directory,
 * hiding all committed files. Only files written by scrapers or manually
 * restored appear. This means static data files (internships, programs,
 * curriculum, essays, etc.) are invisible to the server.
 *
 * Solution: On startup, check for missing data files. If any are missing,
 * fetch them from the GitHub repo (raw.githubusercontent.com). Only writes
 * files that are missing or suspiciously small (<1KB).
 *
 * This is COMPLETELY NON-FATAL — if anything fails, the server still starts.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCRAPED_DIR = join(__dirname, '..', 'data', 'scraped');
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/miknad1496/wayfinder/main/backend/data/scraped';

// All data files that are committed to git and should exist on the persistent disk.
const COMMITTED_DATA_FILES = [
  'bls-occupations.json',
  'bls-occupations.md',
  'certifications-guide.md',
  'certifications.json',
  'college-admissions.json',
  'college-admissions.md',
  'community-career-wisdom.json',
  'community-hn-discussions.json',
  'community-hn-hiring.json',
  'community-insights.md',
  'curriculum-data.json',
  'decision-dates.json',
  'essay-admissions-officer-insights.json',
  'essay-school-specific-strategies.json',
  'essay-writing-craft-techniques.json',
  'ethnicity-demographics.json',
  'government-careers.md',
  'government-pathways.json',
  'internships.json',
  'local-schools.json',
  'nces-college-data.md',
  'nces-earnings-by-major.json',
  'onet-careers.md',
  'onet-occupations.json',
  'onet-riasec-model.json',
  'programs.json',
  'reddit-advice-threads.json',
  'reddit-career-posts.json',
  'reddit-career-stories.json',
  'reddit-community-insights.md',
  'reddit-salary-discussions.json',
];

/**
 * Sync committed data files to the persistent disk.
 * Fetches missing files from GitHub. Completely non-fatal.
 */
export async function syncCommittedData() {
  try {
    console.log('[Data Sync] Checking for missing data files...');

    await fs.mkdir(SCRAPED_DIR, { recursive: true });

    // First pass: figure out which files are missing
    const missing = [];
    for (const filename of COMMITTED_DATA_FILES) {
      const filePath = join(SCRAPED_DIR, filename);
      try {
        const stat = await fs.stat(filePath);
        if (stat.size > 1024) continue; // File exists and is >1KB, skip
        console.log(`[Data Sync] ${filename}: only ${stat.size}B — will restore`);
      } catch {
        // File doesn't exist
      }
      missing.push(filename);
    }

    if (missing.length === 0) {
      console.log('[Data Sync] All data files present. Nothing to sync.');
      return { synced: 0, skipped: COMMITTED_DATA_FILES.length, failed: 0 };
    }

    console.log(`[Data Sync] ${missing.length} files missing — fetching from GitHub...`);

    let synced = 0;
    let failed = 0;

    // Fetch missing files (sequentially to avoid hammering GitHub)
    for (const filename of missing) {
      const filePath = join(SCRAPED_DIR, filename);
      const url = `${GITHUB_RAW_BASE}/${filename}`;

      try {
        const resp = await fetch(url);
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        const content = await resp.text();

        if (content.length < 100) {
          console.warn(`[Data Sync] ✗ ${filename}: response too small (${content.length}B), skipping`);
          failed++;
          continue;
        }

        await fs.writeFile(filePath, content, 'utf8');
        synced++;
        console.log(`[Data Sync] ✓ Restored ${filename} (${(content.length / 1024).toFixed(0)}KB)`);
      } catch (err) {
        failed++;
        console.warn(`[Data Sync] ✗ ${filename}: ${err.message}`);
      }
    }

    const skipped = COMMITTED_DATA_FILES.length - missing.length;
    console.log(`[Data Sync] Complete: ${synced} restored, ${skipped} already present, ${failed} failed`);
    return { synced, skipped, failed };
  } catch (err) {
    // NEVER crash the server over data sync
    console.error('[Data Sync] Failed (non-fatal):', err.message);
    return { synced: 0, skipped: 0, failed: -1 };
  }
}
