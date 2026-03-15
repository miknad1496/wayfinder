/**
 * Run all Wayfinder scrapers (Enhanced Edition)
 *
 * Includes original government data sources PLUS community intelligence:
 *   - BLS Occupational Outlook Handbook
 *   - O*NET Career Data
 *   - NCES College Scorecard
 *   - USAJobs Government Pathways
 *   - Professional Certifications
 *   - Reddit Career Communities (NEW)
 *   - HackerNews & Community Discussions (NEW)
 *
 * Usage: npm run scrape
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

async function runAll() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  Wayfinder Data Scraper Suite (Enhanced)      ║');
  console.log('║  Gathering career data from 7+ sources        ║');
  console.log('║  Government data + Community intelligence     ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  const start = Date.now();
  const results = {};

  // === PHASE 1: Structured Data Sources ===
  console.log('━━━ PHASE 1: Structured Career Data ━━━\n');

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

  // === PHASE 2: Community Intelligence ===
  console.log('\n━━━ PHASE 2: Community Intelligence ━━━\n');

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
  console.log('║  Scraping Complete                            ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`\nTime: ${elapsed}s`);
  console.log(`Results saved to: backend/data/scraped/`);
  console.log(`\nPhase 1 (Structured): BLS, O*NET, NCES, USAJobs, Certs`);
  console.log(`Phase 2 (Community): Reddit, HackerNews, Career Wisdom`);
  console.log(`\nNext steps:`);
  console.log(`  1. Upload scraped data to Claude for intelligence synthesis`);
  console.log(`  2. Claude builds Wayfinder's brain (enhanced knowledge base)`);
  console.log(`  3. Push to GitHub → Render auto-deploys`);
}

runAll().catch(console.error);
