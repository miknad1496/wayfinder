/**
 * Run all Wayfinder scrapers
 *
 * Usage: npm run scrape
 *
 * Individual scrapers can also be run:
 *   npm run scrape:bls
 *   npm run scrape:onet
 *   npm run scrape:nces
 *   npm run scrape:usajobs
 *   npm run scrape:certifications
 */

import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '..', '.env') });

import { runBLSScraper } from './bls-scraper.js';
import { runONETScraper } from './onet-scraper.js';
import { runNCESScraper } from './nces-scraper.js';
import { runUSAJobsScraper } from './usajobs-scraper.js';
import { runCertificationsScraper } from './certifications-scraper.js';

async function runAll() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Wayfinder Data Scraper Suite            ║');
  console.log('║  Gathering career data from 5+ sources   ║');
  console.log('╚══════════════════════════════════════════╝\n');

  const start = Date.now();
  const results = {};

  // Run scrapers that don't need API keys first
  try {
    console.log('1/5 Professional Certifications (static data)...');
    results.certifications = await runCertificationsScraper();
  } catch (err) {
    console.error('Certifications scraper failed:', err.message);
  }

  try {
    console.log('\n2/5 Government Career Pathways...');
    results.government = await runUSAJobsScraper();
  } catch (err) {
    console.error('USAJobs scraper failed:', err.message);
  }

  try {
    console.log('\n3/5 NCES College Scorecard...');
    results.nces = await runNCESScraper();
  } catch (err) {
    console.error('NCES scraper failed:', err.message);
  }

  // Web scrapers (slower, need network)
  try {
    console.log('\n4/5 BLS Occupational Outlook Handbook...');
    results.bls = await runBLSScraper();
  } catch (err) {
    console.error('BLS scraper failed:', err.message);
  }

  try {
    console.log('\n5/5 O*NET Career Data...');
    results.onet = await runONETScraper();
  } catch (err) {
    console.error('O*NET scraper failed:', err.message);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║  Scraping Complete                       ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\nTime: ${elapsed}s`);
  console.log(`Results saved to: backend/data/scraped/`);
  console.log(`\nNext: Run 'npm run ingest' to load data into the knowledge base.`);
}

runAll().catch(console.error);
