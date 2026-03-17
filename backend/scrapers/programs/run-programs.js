#!/usr/bin/env node

/**
 * Programs & Activities Scraper Runner
 *
 * Execute the programs scraper and populate the database.
 *
 * Usage:
 *   node run-programs.js
 *   npm run scrape:programs
 */

import { scrapePrograms } from './programs-scraper.js';

async function main() {
  try {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  WAYFINDER PROGRAMS & ACTIVITIES SCRAPER');
    console.log('═══════════════════════════════════════════════════════════\n');

    const result = await scrapePrograms();

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  SCRAPE COMPLETED');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\nMetadata:`);
    console.log(`  Last Scraped: ${result.metadata.lastScraped}`);
    console.log(`  Total Programs: ${result.metadata.totalCount}`);
    console.log(`  Sources: ${result.metadata.sources.length} institutions/organizations`);

    // Show category breakdown
    const byCategory = {};
    for (const p of result.programs) {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    }

    console.log(`\nPrograms by Category:`);
    Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
      });

    // Cost breakdown
    const byCost = { free: 0, paid: 0 };
    for (const p of result.programs) {
      if (p.cost?.amount === 0 || p.cost?.type === 'free') {
        byCost.free++;
      } else {
        byCost.paid++;
      }
    }

    console.log(`\nCost Breakdown:`);
    console.log(`  Free: ${byCost.free} programs`);
    console.log(`  Paid: ${byCost.paid} programs`);

    // Type breakdown
    const byType = {};
    for (const p of result.programs) {
      byType[p.type] = (byType[p.type] || 0) + 1;
    }

    console.log(`\nPrograms by Type:`);
    Object.entries(byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });

    // Selectivity breakdown
    const bySelectivity = {};
    for (const p of result.programs) {
      bySelectivity[p.selectivity] = (bySelectivity[p.selectivity] || 0) + 1;
    }

    console.log(`\nSelectivity Breakdown:`);
    Object.entries(bySelectivity)
      .sort((a, b) => b[1] - a[1])
      .forEach(([sel, count]) => {
        console.log(`  ${sel}: ${count}`);
      });

    console.log('\n✅ Programs database successfully populated!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Scraper failed:', error);
    process.exit(1);
  }
}

main();
