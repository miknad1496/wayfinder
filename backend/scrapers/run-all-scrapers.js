/**
 * Run all knowledge base scrapers in sequence.
 *
 * Usage:
 *   node scrapers/run-all-scrapers.js
 *
 * Prerequisites:
 *   1. Set environment variables (in .env or inline):
 *      SCORECARD_API_KEY=<from api.data.gov/signup>
 *      CENSUS_API_KEY=<from api.census.gov/data/key_signup.html>
 *      BEA_API_KEY=<from apps.bea.gov/API/signup>
 *
 *   2. Download BLS OEWS files:
 *      https://www.bls.gov/oes/tables.htm → Download all three (nat/st/ma)
 *      Extract .xlsx files into backend/data/oews/
 *
 *   3. H1B data should already be in backend/data/H1B/
 *      (already processed if you see knowledge-base/h1b-compensation.json)
 */

import { config } from 'dotenv';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from wayfinder/ root (parent of backend/)
config({ path: join(__dirname, '..', '..', '.env') });

async function fileExists(path) {
  try { await fs.access(path); return true; } catch { return false; }
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Wayfinder Knowledge Base — Scraper Runner');
  console.log('═══════════════════════════════════════════════\n');

  const kbDir = join(__dirname, '..', 'knowledge-base');
  const results = {};

  // 1. College Scorecard
  if (process.env.SCORECARD_API_KEY || process.env.DATA_GOV_API_KEY) {
    try {
      const { runScorecardScraper } = await import('./scorecard-scraper.js');
      await runScorecardScraper();
      results['College Scorecard'] = '✓';
    } catch (err) {
      console.error('College Scorecard failed:', err.message);
      results['College Scorecard'] = '✗ ' + err.message;
    }
  } else {
    console.log('⏭  Skipping College Scorecard (no SCORECARD_API_KEY set)');
    results['College Scorecard'] = 'skipped (no key)';
  }

  // 2. Census ACS
  if (process.env.CENSUS_API_KEY) {
    try {
      const { runCensusAcsScraper } = await import('./census-acs-scraper.js');
      await runCensusAcsScraper();
      results['Census ACS'] = '✓';
    } catch (err) {
      console.error('Census ACS failed:', err.message);
      results['Census ACS'] = '✗ ' + err.message;
    }
  } else {
    // Census works without key (limited)
    try {
      const { runCensusAcsScraper } = await import('./census-acs-scraper.js');
      await runCensusAcsScraper();
      results['Census ACS'] = '✓ (no key, limited)';
    } catch (err) {
      console.error('Census ACS failed:', err.message);
      results['Census ACS'] = '✗ ' + err.message;
    }
  }

  // 3. Cost of Living (BEA)
  if (process.env.BEA_API_KEY) {
    try {
      const { runCOLScraper } = await import('./col-scraper.js');
      await runCOLScraper();
      results['Cost of Living'] = '✓';
    } catch (err) {
      console.error('Cost of Living failed:', err.message);
      results['Cost of Living'] = '✗ ' + err.message;
    }
  } else {
    console.log('⏭  Skipping Cost of Living (no BEA_API_KEY set)');
    results['Cost of Living'] = 'skipped (no key)';
  }

  // 4. BLS OEWS
  const oewsDir = join(__dirname, '..', 'data', 'oews');
  if (await fileExists(oewsDir)) {
    try {
      const { runBLSOEWSScraper } = await import('./bls-oews-scraper.js');
      await runBLSOEWSScraper({ fromFiles: oewsDir });
      results['BLS OEWS'] = '✓';
    } catch (err) {
      console.error('BLS OEWS failed:', err.message);
      results['BLS OEWS'] = '✗ ' + err.message;
    }
  } else {
    console.log('⏭  Skipping BLS OEWS (no data/oews/ directory)');
    console.log('   Download from: https://www.bls.gov/oes/tables.htm');
    results['BLS OEWS'] = 'skipped (no data files)';
  }

  // 5. H1B — check if already processed
  if (await fileExists(join(kbDir, 'h1b-compensation.json'))) {
    console.log('\n✓ H1B data already processed (h1b-compensation.json exists)');
    results['H1B'] = '✓ (already done)';
  } else {
    console.log('\n⏭  H1B needs manual processing (see SETUP-KNOWLEDGE-BASE.md)');
    results['H1B'] = 'skipped';
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════');
  console.log('  Results');
  console.log('═══════════════════════════════════════════════');
  for (const [name, status] of Object.entries(results)) {
    console.log(`  ${name}: ${status}`);
  }

  // Show what files exist
  console.log('\n  Knowledge Base Files:');
  const expectedFiles = [
    'bls-compensation.json', 'scorecard-earnings.json',
    'census-education-earnings.json', 'cost-of-living.json',
    'h1b-compensation.json',
  ];
  for (const file of expectedFiles) {
    const path = join(kbDir, file);
    if (await fileExists(path)) {
      const stat = await fs.stat(path);
      console.log(`    ✓ ${file} (${(stat.size / 1024).toFixed(0)}KB)`);
    } else {
      console.log(`    ✗ ${file} (missing)`);
    }
  }

  // Auto-build SQLite database from the JSON files
  console.log('\n═══════════════════════════════════════════════');
  console.log('  Building SQLite Database...');
  console.log('═══════════════════════════════════════════════\n');
  try {
    // Dynamic import to avoid failure if sql.js not installed
    await import('../scripts/build-knowledge-db.js');
  } catch (err) {
    console.error('  ⚠ SQLite build failed:', err.message);
    console.error('  Run manually: node scripts/build-knowledge-db.js');
  }
}

main().catch(console.error);
