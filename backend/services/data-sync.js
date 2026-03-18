/**
 * Data Sync Service
 *
 * Ensures committed data files exist on the Render persistent disk.
 *
 * Problem: Render persistent disks mount OVER the git-deployed directory,
 * hiding all committed files. Only files written by scrapers or manually
 * restored appear on the persistent disk.
 *
 * Solution: The build step copies data files to `seed-data/` (outside the
 * persistent disk mount at `backend/data/`). On startup, this service copies
 * any missing files from `seed-data/` into `backend/data/scraped/` (on the
 * persistent disk). Existing files >1KB are never overwritten.
 *
 * This is COMPLETELY NON-FATAL — if anything fails, the server still starts.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// seed-data/ is at the project root, OUTSIDE the persistent disk mount
const SEED_DIR = join(__dirname, '..', '..', 'seed-data');
// backend/data/scraped/ is ON the persistent disk
const SCRAPED_DIR = join(__dirname, '..', 'data', 'scraped');

/**
 * Sync seed data files to the persistent disk.
 * Copies missing or tiny (<1KB) files from seed-data/ into backend/data/scraped/.
 */
export async function syncCommittedData() {
  try {
    console.log('[Data Sync] Checking for missing data files on persistent disk...');

    // Check if seed directory exists (only present after build step)
    let seedFiles;
    try {
      seedFiles = await fs.readdir(SEED_DIR);
    } catch {
      console.log('[Data Sync] No seed-data/ directory found — skipping sync (dev mode or first build).');
      return { synced: 0, skipped: 0, failed: 0 };
    }

    if (seedFiles.length === 0) {
      console.log('[Data Sync] seed-data/ is empty — nothing to sync.');
      return { synced: 0, skipped: 0, failed: 0 };
    }

    await fs.mkdir(SCRAPED_DIR, { recursive: true });

    let synced = 0;
    let skipped = 0;
    let failed = 0;

    for (const filename of seedFiles) {
      const seedPath = join(SEED_DIR, filename);
      const destPath = join(SCRAPED_DIR, filename);

      try {
        // Skip directories
        const seedStat = await fs.stat(seedPath);
        if (seedStat.isDirectory()) continue;

        // Check if destination already exists and is substantial
        try {
          const destStat = await fs.stat(destPath);
          if (destStat.size > 1024) {
            skipped++;
            continue; // File exists and is >1KB, don't overwrite
          }
          console.log(`[Data Sync] ${filename}: only ${destStat.size}B on disk — restoring from seed`);
        } catch {
          // File doesn't exist on persistent disk — need to copy
        }

        // Copy from seed to persistent disk
        await fs.copyFile(seedPath, destPath);
        synced++;
        console.log(`[Data Sync] ✓ Restored ${filename} (${(seedStat.size / 1024).toFixed(0)}KB)`);
      } catch (err) {
        failed++;
        console.warn(`[Data Sync] ✗ ${filename}: ${err.message}`);
      }
    }

    console.log(`[Data Sync] Complete: ${synced} restored, ${skipped} already present, ${failed} failed`);
    return { synced, skipped, failed };
  } catch (err) {
    // NEVER crash the server over data sync
    console.error('[Data Sync] Failed (non-fatal):', err.message);
    return { synced: 0, skipped: 0, failed: -1 };
  }
}
