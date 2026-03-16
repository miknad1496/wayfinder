/**
 * Run CAREER-ONLY scrapers for Wayfinder
 *
 * Runs all career data sources (BLS, O*NET, Reddit, etc.)
 * WITHOUT the college admissions scraper.
 *
 * Usage: node backend/scrapers/run-career.js
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
import { runRedditScraper } from './reddit-scraper.js';
import { runCommunityScraper } from './community-scraper.js';

async function runCareer() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  Wayfinder Career Scrapers                    ║');
  console.log('║  Government + Community data (no admissions)  ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  const start = Date.now();
  const results = {};

  // === Structured Data Sources ===
  console.log('━━━ Structured Career Data ━━━\n');

  try {
    console.log('1/7 Professional Certifications (static data)...');
    results.certifications = await runCertificationsScraper();
  } catch (err) {
    console.error('Certifications scraper failed:', err.message);
  }

  try {
    console.log('\n2/7 Government Career Pathways...');
    results.government = await runUSAJobsScraper();
  } catch (err) {
    console.error('USAJobs scraper failed:', err.message);
  }

  try {
    console.log('\n3/7 NCES College Scorecard...');
    results.nces = await runNCESScraper();
  } catch (err) {
    console.error('NCES scraper failed:', err.message);
  }

  try {
    console.log('\n4/7 BLS Occupational Outlook Handbook...');
    results.bls = await runBLSScraper();
  } catch (err) {
    console.error('BLS scraper failed:', err.message);
  }

  try {
    console.log('\n5/7 O*NET Career Data...');
    results.onet = await runONETScraper();
  } catch (err) {
    console.error('O*NET scraper failed:', err.message);
  }

  // === Community Intelligence ===
  console.log('\n━━━ Community Intelligence ━━━\n');

  try {
    console.log('6/7 Reddit Career Communities...');
    results.reddit = await runRedditScraper();
  } catch (err) {
    console.error('Reddit scraper failed:', err.message);
  }

  try {
    console.log('\n7/7 HackerNews & Community Discussions...');
    results.community = await runCommunityScraper();
  } catch (err) {
    console.error('Community scraper failed:', err.message);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  Career Scraping Complete                     ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`\nTime: ${elapsed}s`);
  console.log(`Results saved to: backend/data/scraped/`);
  console.log(`\nSources: BLS, O*NET, NCES, USAJobs, Certs, Reddit, HackerNews`);
  console.log(`\nTo run admissions separately: node backend/scrapers/run-admissions.js`);
}

runCareer().catch(console.error);
