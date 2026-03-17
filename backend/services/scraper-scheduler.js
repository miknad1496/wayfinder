/**
 * Scraper Scheduler
 *
 * Runs scrapers on appropriate intervals within the server process.
 * No extra compute cost — uses the same Render instance.
 *
 * Schedule:
 * - Weekly:    Reddit, HackerNews (community intelligence, fast-changing)
 * - Monthly:   BLS, O*NET, USAJobs, Certifications, Admissions (structured data)
 * - Quarterly: NCES, IPEDS Ethnicity (slow-changing government data)
 * - On-demand: Decision dates (curated, run via admin endpoint)
 *
 * NOTE: Distillation (Opus synthesis) is NOT automated here.
 * That requires offline Claude/Cowork sessions — too expensive for server-side.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCRAPED_DIR = join(__dirname, '..', 'data', 'scraped');
const SCHEDULE_FILE = join(__dirname, '..', 'data', 'scraper-schedule.json');

// Scraper definitions with frequency
const SCRAPERS = {
  // Weekly scrapers — community data changes frequently
  reddit: {
    frequency: 'weekly',
    intervalMs: 7 * 24 * 60 * 60 * 1000,
    module: '../scrapers/reddit-scraper.js',
    fn: 'runRedditScraper',
    description: 'Reddit career communities'
  },
  community: {
    frequency: 'weekly',
    intervalMs: 7 * 24 * 60 * 60 * 1000,
    module: '../scrapers/community-scraper.js',
    fn: 'runCommunityScraper',
    description: 'HackerNews & community discussions'
  },

  // Monthly scrapers — structured data, moderate change rate
  bls: {
    frequency: 'monthly',
    intervalMs: 30 * 24 * 60 * 60 * 1000,
    module: '../scrapers/bls-scraper.js',
    fn: 'runBLSScraper',
    description: 'BLS occupational outlook'
  },
  onet: {
    frequency: 'monthly',
    intervalMs: 30 * 24 * 60 * 60 * 1000,
    module: '../scrapers/onet-scraper.js',
    fn: 'runONETScraper',
    description: 'O*NET career data'
  },
  usajobs: {
    frequency: 'monthly',
    intervalMs: 30 * 24 * 60 * 60 * 1000,
    module: '../scrapers/usajobs-scraper.js',
    fn: 'runUSAJobsScraper',
    description: 'Government career pathways'
  },
  certifications: {
    frequency: 'monthly',
    intervalMs: 30 * 24 * 60 * 60 * 1000,
    module: '../scrapers/certifications-scraper.js',
    fn: 'runCertificationsScraper',
    description: 'Professional certifications'
  },
  admissions: {
    frequency: 'monthly',
    intervalMs: 30 * 24 * 60 * 60 * 1000,
    module: '../scrapers/admissions-scraper.js',
    fn: 'runAdmissionsScraper',
    description: 'College admissions profiles'
  },

  // Quarterly scrapers — slow-changing government/institutional data
  nces: {
    frequency: 'quarterly',
    intervalMs: 90 * 24 * 60 * 60 * 1000,
    module: '../scrapers/nces-scraper.js',
    fn: 'runNCESScraper',
    description: 'NCES College Scorecard'
  },
  ethnicity: {
    frequency: 'quarterly',
    intervalMs: 90 * 24 * 60 * 60 * 1000,
    module: '../scrapers/ethnicity-demographics-scraper.js',
    fn: 'scrapeEthnicityDemographics',
    description: 'IPEDS ethnicity demographics'
  }
};

let schedule = {};
let schedulerInterval = null;

/**
 * Load the schedule state (last run times)
 */
async function loadSchedule() {
  try {
    const raw = await fs.readFile(SCHEDULE_FILE, 'utf8');
    schedule = JSON.parse(raw);
  } catch {
    schedule = {};
  }
}

/**
 * Save the schedule state
 */
async function saveSchedule() {
  try {
    await fs.mkdir(join(__dirname, '..', 'data'), { recursive: true });
    await fs.writeFile(SCHEDULE_FILE, JSON.stringify(schedule, null, 2));
  } catch (err) {
    console.error('[Scraper Scheduler] Failed to save schedule:', err.message);
  }
}

/**
 * Check if a scraper is due to run
 */
async function isDue(scraperKey) {
  const scraper = SCRAPERS[scraperKey];
  const lastRun = schedule[scraperKey]?.lastRun;

  // If never run before, check if a data file already exists with good data.
  // This prevents overwriting committed data on first deploy when APIs are unreachable.
  if (!lastRun) {
    const dataFiles = {
      ethnicity: 'ethnicity-demographics.json',
      nces: 'nces-college-scorecard.json',
      admissions: 'admissions-data.json',
    };
    if (dataFiles[scraperKey]) {
      try {
        const filePath = join(SCRAPED_DIR, dataFiles[scraperKey]);
        const stat = await fs.stat(filePath);
        // If file exists and is substantial (>10KB), skip — data was committed to repo
        if (stat.size > 10240) {
          console.log(`[Scraper Scheduler] ${scraperKey}: data file exists (${(stat.size/1024).toFixed(0)}KB), skipping first-run`);
          return false;
        }
      } catch { /* file doesn't exist, proceed */ }
    }
    return true; // Never run before and no existing data
  }

  const elapsed = Date.now() - new Date(lastRun).getTime();
  return elapsed >= scraper.intervalMs;
}

/**
 * Run a single scraper with error handling
 */
async function runScraper(key) {
  const scraper = SCRAPERS[key];
  console.log(`[Scraper Scheduler] Running ${key} (${scraper.description})...`);

  try {
    const module = await import(scraper.module);
    const fn = module[scraper.fn] || module.default;
    if (!fn) {
      console.error(`[Scraper Scheduler] No export "${scraper.fn}" in ${scraper.module}`);
      return false;
    }

    await fn();

    schedule[key] = {
      lastRun: new Date().toISOString(),
      status: 'success',
      frequency: scraper.frequency
    };
    await saveSchedule();
    console.log(`[Scraper Scheduler] ✓ ${key} completed successfully`);
    return true;
  } catch (err) {
    console.error(`[Scraper Scheduler] ✗ ${key} failed:`, err.message);
    schedule[key] = {
      ...schedule[key],
      lastError: new Date().toISOString(),
      errorMessage: err.message,
      status: 'failed'
    };
    await saveSchedule();
    return false;
  }
}

/**
 * Check all scrapers and run any that are due.
 * Runs scrapers sequentially to avoid overwhelming APIs.
 * Adds a random jitter (0-60min) to avoid predictable patterns.
 */
async function checkAndRun() {
  console.log(`[Scraper Scheduler] Checking scraper schedule...`);

  for (const [key, scraper] of Object.entries(SCRAPERS)) {
    if (await isDue(key)) {
      // Add random jitter (0-60min) to spread API calls
      const jitter = Math.floor(Math.random() * 60 * 60 * 1000);
      console.log(`[Scraper Scheduler] ${key} is due (${scraper.frequency}), running with ${Math.round(jitter/60000)}min jitter...`);

      await new Promise(resolve => setTimeout(resolve, Math.min(jitter, 5000))); // Cap at 5s in practice
      await runScraper(key);

      // Brief pause between scrapers to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

/**
 * Start the scheduler. Checks every 6 hours.
 */
export async function startScraperScheduler() {
  await loadSchedule();

  console.log('[Scraper Scheduler] Starting automated scraper scheduler');
  console.log('[Scraper Scheduler] Schedule:');
  for (const [key, scraper] of Object.entries(SCRAPERS)) {
    const lastRun = schedule[key]?.lastRun || 'never';
    const due = (await isDue(key)) ? '(DUE)' : '';
    console.log(`  ${scraper.frequency.padEnd(10)} | ${key.padEnd(16)} | last: ${lastRun} ${due}`);
  }

  // Don't run immediately on server start — wait 5 minutes to let the server stabilize
  setTimeout(async () => {
    await checkAndRun();
  }, 5 * 60 * 1000);

  // Check every 6 hours
  schedulerInterval = setInterval(async () => {
    await checkAndRun();
  }, 6 * 60 * 60 * 1000);
}

/**
 * Stop the scheduler
 */
export function stopScraperScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

/**
 * Get schedule status (for admin API)
 */
export async function getScheduleStatus() {
  await loadSchedule();
  const status = {};
  for (const [key, scraper] of Object.entries(SCRAPERS)) {
    status[key] = {
      description: scraper.description,
      frequency: scraper.frequency,
      lastRun: schedule[key]?.lastRun || null,
      status: schedule[key]?.status || 'never_run',
      lastError: schedule[key]?.errorMessage || null,
      isDue: await isDue(key)
    };
  }
  return status;
}

/**
 * Force-run a specific scraper (for admin API)
 */
export async function forceRunScraper(key) {
  if (!SCRAPERS[key]) return { error: `Unknown scraper: ${key}` };
  const success = await runScraper(key);
  return { success, scraper: key };
}
