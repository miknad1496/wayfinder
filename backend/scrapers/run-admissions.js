/**
 * Run ADMISSIONS-ONLY scraper for Wayfinder
 *
 * Runs only the College Admissions Intelligence scraper
 * (College Scorecard API + curated strategic intel).
 *
 * Usage: node backend/scrapers/run-admissions.js
 */

import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '..', '.env') });

import { runAdmissionsScraper } from './admissions-scraper.js';

async function runAdmissions() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  Wayfinder Admissions Scraper                 ║');
  console.log('║  College Scorecard + Curated Intelligence     ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  const start = Date.now();

  try {
    console.log('Running College Admissions Intelligence scraper...\n');
    const result = await runAdmissionsScraper();
    console.log('\nResult:', result);
  } catch (err) {
    console.error('Admissions scraper failed:', err.message);
    console.error(err.stack);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  Admissions Scraping Complete                 ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`\nTime: ${elapsed}s`);
  console.log(`Results saved to: backend/data/scraped/`);
  console.log(`\nTo run career scrapers separately: node backend/scrapers/run-career.js`);
  console.log(`To run everything: node backend/scrapers/run-all.js`);
}

runAdmissions().catch(console.error);
