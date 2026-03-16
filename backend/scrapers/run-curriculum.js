/**
 * Run CURRICULUM DATA scraper for Wayfinder
 *
 * Processes curated curriculum data for all 49 universities
 * and saves to JSON for use in admissions system.
 *
 * Usage: node backend/scrapers/run-curriculum.js
 */

import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '..', '.env') });

import { getCurriculumData } from './curriculum-data.js';
import { saveScrapedData } from './utils.js';

async function runCurriculumScraper() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  Wayfinder Curriculum Data Scraper            ║');
  console.log('║  Comprehensive Major & Course Requirements     ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  const start = Date.now();

  try {
    console.log('Loading curriculum data for 49 universities...\n');
    const curriculumData = getCurriculumData();

    const schoolCount = Object.keys(curriculumData).length;
    console.log(`  ✓ Loaded ${schoolCount} schools\n`);

    // Calculate some stats
    const majorCounts = {};
    let totalMajors = 0;

    Object.entries(curriculumData).forEach(([school, data]) => {
      const majorCount = Object.keys(data.popularMajorRequirements || {}).length;
      majorCounts[majorCount] = (majorCounts[majorCount] || 0) + 1;
      totalMajors += majorCount;
    });

    console.log('Curriculum Statistics:');
    console.log(`  • Total schools: ${schoolCount}`);
    console.log(`  • Total majors described: ${totalMajors}`);
    console.log(`  • Average majors per school: ${(totalMajors / schoolCount).toFixed(1)}\n`);

    // Save to JSON
    console.log('Saving curriculum data to JSON...\n');
    await saveScrapedData('curriculum-data.json', curriculumData);

  } catch (err) {
    console.error('Error running curriculum scraper:', err.message);
    console.error(err.stack);
    process.exit(1);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  Curriculum Data Processing Complete          ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`\nTime: ${elapsed}s`);
  console.log(`Results saved to: backend/data/scraped/curriculum-data.json`);
  console.log(`\nData includes for each school:`);
  console.log(`  • Core requirements & general education`);
  console.log(`  • 5-8 popular major sequences with course numbers`);
  console.log(`  • Prerequisites, course counts, insider tips`);
  console.log(`  • Academic calendar, grading, unique features`);
  console.log(`  • Research opportunities & study abroad programs`);
  console.log(`  • Notable faculty members\n`);
}

runCurriculumScraper().catch(console.error);
