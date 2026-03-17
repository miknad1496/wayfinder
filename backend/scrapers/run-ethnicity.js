#!/usr/bin/env node

/**
 * Runner for IPEDS Ethnicity Demographics Scraper
 *
 * Usage:
 *   node run-ethnicity.js                     # default (API method, latest year)
 *   node run-ethnicity.js --year=2023         # specific year
 *   node run-ethnicity.js --method=bulk       # force bulk CSV download
 *   node run-ethnicity.js --year=2023 --method=bulk
 *
 * Output: backend/data/scraped/ethnicity-demographics.json
 *
 * This is a "one and done for 1 year" scraper — IPEDS releases completions
 * data annually (~18 month lag). Run once when new data becomes available.
 *
 * Data source: IPEDS Completions Survey via Urban Institute Education Data Portal
 * Fallback: Direct IPEDS bulk CSV download from NCES
 */

import { scrapeEthnicityDemographics } from './ethnicity-demographics-scraper.js';

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {};

for (const arg of args) {
  if (arg.startsWith('--year=')) {
    options.year = parseInt(arg.split('=')[1]);
  } else if (arg.startsWith('--method=')) {
    options.method = arg.split('=')[1]; // 'api' or 'bulk'
  }
}

console.log('IPEDS Ethnicity Demographics Scraper');
console.log('====================================');
console.log(`Year: ${options.year || 2023} | Method: ${options.method || 'api (with bulk fallback)'}`);
console.log('');

try {
  const results = await scrapeEthnicityDemographics(options);
  console.log('\n✅ Scrape completed successfully!');
  console.log(`   ${results.schools.length} schools processed`);
  console.log(`   Output: backend/data/scraped/ethnicity-demographics.json`);
} catch (error) {
  console.error('\n❌ Scrape failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
