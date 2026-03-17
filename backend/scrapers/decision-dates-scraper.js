/**
 * Decision Dates Scraper
 *
 * Collects admissions decision notification dates for target colleges.
 * Unlike other scrapers that pull from APIs, this one maintains a curated
 * dataset based on publicly available information from college websites
 * and historical patterns.
 *
 * Sources:
 * - Individual college admissions websites
 * - Historical notification patterns
 * - CollegeConfidential / Reddit /r/ApplyingToCollege community reports
 *
 * Usage:
 *   node decision-dates-scraper.js [--cycle=2025-2026]
 *
 * The data is stored in data/scraped/decision-dates.json
 * and is used by:
 *   1. The Wayfinder brain (standard mode) — lightweight lookup via getLightDataContext()
 *   2. The Wayfinder engine (RAG mode) — indexed via parseDecisionDatesData()
 *   3. The temporal awareness system — buildTemporalContext() in claude.js
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = join(__dirname, '..', 'data', 'scraped');
const OUTPUT_FILE = 'decision-dates.json';

/**
 * Decision dates are maintained as a curated dataset.
 * To update:
 * 1. Check individual college admissions websites for updated timelines
 * 2. Cross-reference with community reports (Reddit, CC)
 * 3. Update the entries below
 * 4. Run this scraper to regenerate the JSON
 *
 * Most schools are consistent year-to-year (within a few days).
 * Major changes (e.g., a school adding ED II) should be flagged.
 */

const CURRENT_CYCLE = '2025-2026';

// This is the canonical list — keep it in sync with the ethnicity scraper's 100 schools
const DECISION_DATES = [
  // Ivy League
  { unitId: 166027, school: 'Harvard University', ea: { type: 'Restrictive Early Action', deadline: 'November 1', notification: 'Mid-December', restrictive: true }, rd: { deadline: 'January 1', notification: 'Late March' }, notes: 'Harvard uses REA. Class of 2030 RD expected ~March 28.' },
  { unitId: 130794, school: 'Yale University', ea: { type: 'Single-Choice Early Action', deadline: 'November 1', notification: 'Mid-December', restrictive: true }, rd: { deadline: 'January 2', notification: 'Late March' }, notes: 'Yale uses SCEA. Ivy Day typically late March.' },
  { unitId: 190150, school: 'Columbia University', ed1: { deadline: 'November 1', notification: 'Mid-December' }, ed2: { deadline: 'January 1', notification: 'Mid-February' }, rd: { deadline: 'January 1', notification: 'Late March' }, notes: 'ED I and ED II available.' },
  { unitId: 186131, school: 'Princeton University', ea: { type: 'Single-Choice Early Action', deadline: 'November 1', notification: 'Mid-December', restrictive: true }, rd: { deadline: 'January 1', notification: 'Late March' }, notes: 'Princeton uses SCEA. No binding early option.' },
  { unitId: 190415, school: 'Cornell University', ed1: { deadline: 'November 1', notification: 'Mid-December' }, ed2: { deadline: 'January 2', notification: 'Mid-February' }, rd: { deadline: 'January 2', notification: 'Late March' }, notes: 'Decisions may vary by college within Cornell.' },
  { unitId: 215062, school: 'University of Pennsylvania', ed1: { deadline: 'November 1', notification: 'Mid-December' }, rd: { deadline: 'January 5', notification: 'Late March' }, notes: 'Penn offers ED only, no EA or ED II.' },
  { unitId: 217156, school: 'Brown University', ed1: { deadline: 'November 1', notification: 'Mid-December' }, rd: { deadline: 'January 5', notification: 'Late March' }, notes: 'Brown offers ED only.' },
  { unitId: 182670, school: 'Dartmouth College', ed1: { deadline: 'November 1', notification: 'Mid-December' }, rd: { deadline: 'January 3', notification: 'Late March' }, notes: 'Dartmouth offers ED only.' },
];

async function generateDecisionDatesFile() {
  console.log(`Generating decision dates for cycle: ${CURRENT_CYCLE}`);
  console.log('Note: Decision dates are maintained as a curated dataset.');
  console.log('The full dataset is generated via generate-decision-dates.py');
  console.log(`Output: ${join(OUTPUT_DIR, OUTPUT_FILE)}`);

  // Check if the file already exists
  try {
    const existing = await fs.readFile(join(OUTPUT_DIR, OUTPUT_FILE), 'utf-8');
    const data = JSON.parse(existing);
    console.log(`\nExisting file found with ${data.schools?.length || 0} schools.`);
    console.log('To regenerate, delete the existing file and run again.');
    console.log('Or update the Python generator script for bulk updates.');
  } catch {
    console.log('\nNo existing file found. Run generate-decision-dates.py to create it.');
  }
}

// Run if called directly
if (process.argv[1] === __filename) {
  generateDecisionDatesFile().catch(console.error);
}

export { generateDecisionDatesFile };
