#!/usr/bin/env node

/**
 * Run Internships Scraper
 *
 * Usage:
 *   node run-internships.js
 */

import { scrapeInternships } from './internships-scraper.js';

async function main() {
  try {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('  Wayfinder Internships Data Scraper');
    console.log('═══════════════════════════════════════════════════');
    console.log('');

    const result = await scrapeInternships();

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  ✅ Scraping Complete`);
    console.log(`  📊 Total internships: ${result.count}`);
    console.log(`  📁 Saved to: ${result.filePath}`);
    console.log('═══════════════════════════════════════════════════');
    console.log('');
  } catch (err) {
    console.error('❌ Scraper failed:', err.message);
    process.exit(1);
  }
}

main();
