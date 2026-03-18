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
 * Solution: On startup, extract any missing data files from git into
 * the working tree (i.e., onto the persistent disk). We use
 * `git show HEAD:<path>` to read from git, then write to disk only
 * if the file doesn't already exist or is suspiciously small (<1KB).
 *
 * This runs ONCE at startup, before scrapers or API routes need the data.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCRAPED_DIR = join(__dirname, '..', 'data', 'scraped');

// All data files that are committed to git and should exist on the persistent disk.
// This list is maintained manually — add new committed data files here.
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
 * Only writes files that are missing or suspiciously small.
 */
export async function syncCommittedData() {
  console.log('[Data Sync] Checking for missing data files on persistent disk...');

  await fs.mkdir(SCRAPED_DIR, { recursive: true });

  let synced = 0;
  let skipped = 0;
  let failed = 0;

  for (const filename of COMMITTED_DATA_FILES) {
    const filePath = join(SCRAPED_DIR, filename);
    const gitPath = `backend/data/scraped/${filename}`;

    try {
      // Check if file already exists and is substantial
      try {
        const stat = await fs.stat(filePath);
        if (stat.size > 1024) {
          skipped++;
          continue; // File exists and is >1KB, skip
        }
        // File exists but is tiny — likely corrupted, overwrite
        console.log(`[Data Sync] ${filename}: exists but only ${stat.size}B — restoring from git`);
      } catch {
        // File doesn't exist — need to sync
      }

      // Extract from git
      try {
        const content = execSync(`git show HEAD:${gitPath}`, {
          encoding: 'utf8',
          maxBuffer: 10 * 1024 * 1024, // 10MB
          cwd: join(__dirname, '..', '..') // project root
        });

        await fs.writeFile(filePath, content, 'utf8');
        synced++;
        console.log(`[Data Sync] ✓ Restored ${filename} (${(content.length / 1024).toFixed(0)}KB)`);
      } catch (gitErr) {
        // File might not be in git (new file, or git not available)
        failed++;
        console.warn(`[Data Sync] ✗ Could not extract ${filename} from git: ${gitErr.message?.slice(0, 100)}`);
      }
    } catch (err) {
      failed++;
      console.error(`[Data Sync] ✗ Error syncing ${filename}: ${err.message}`);
    }
  }

  console.log(`[Data Sync] Complete: ${synced} restored, ${skipped} already present, ${failed} failed`);
  return { synced, skipped, failed };
}
