#!/usr/bin/env node

/**
 * Scholarships Scraper Runner
 *
 * Runs the scholarships data scraper and saves output to JSON
 *
 * Usage:
 *   node run-scholarships.js
 */

import runScraper from './scholarships-scraper.js';

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║       Wayfinder Scholarships Database Scraper             ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    const data = await runScraper();

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    SCRAPER COMPLETE                       ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    console.log(`✅ Successfully generated scholarships database`);
    console.log(`   Total Scholarships: ${data.scholarships.length}`);
    console.log(`   Total Value: ${data.metadata.totalValue}`);
    console.log(`   Last Updated: ${data.metadata.lastScraped}`);
    console.log(`   Data Sources: ${data.metadata.sources.length}`);
    console.log();

    // Category breakdown
    const categoryCount = {};
    for (const scholarship of data.scholarships) {
      for (const cat of (scholarship.category || ['other'])) {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      }
    }

    console.log('📊 Scholarships by Category:');
    Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   • ${cat}: ${count}`);
      });

    console.log();

    // Competitiveness breakdown
    const compCount = {};
    for (const scholarship of data.scholarships) {
      const comp = scholarship.competitiveness || 'unknown';
      compCount[comp] = (compCount[comp] || 0) + 1;
    }

    console.log('🎯 Scholarships by Competitiveness:');
    const compOrder = ['very_high', 'high', 'moderate', 'low'];
    compOrder.forEach((level) => {
      if (compCount[level]) {
        console.log(`   • ${level.replace('_', ' ')}: ${compCount[level]}`);
      }
    });

    console.log();
    console.log('✨ Database ready for API consumption!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Scraper failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

main();
