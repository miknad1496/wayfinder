/**
 * Injects verified federal programs and state grants into financial-aid-db.json
 *
 * Run after college-scorecard-scraper.js to add grants/programs data
 * to the scraped school data.
 *
 * Usage: node backend/scrapers/inject-grants-programs.js
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function inject() {
  console.log('=== Injecting Federal Programs & State Grants ===\n');

  const dbPath = join(__dirname, '..', 'data', 'scraped', 'financial-aid-db.json');
  const federalPath = join(__dirname, '..', 'data', 'scraped', 'federal-programs.json');
  const statePath = join(__dirname, '..', 'data', 'scraped', 'state-grants.json');

  // Load main DB
  const dbRaw = await fs.readFile(dbPath, 'utf-8');
  const db = JSON.parse(dbRaw);
  console.log(`Loaded financial-aid-db.json: ${db.schools?.length || 0} schools`);

  // Load federal programs
  const fedRaw = await fs.readFile(federalPath, 'utf-8');
  const fedData = JSON.parse(fedRaw);
  console.log(`Loaded federal-programs.json: ${fedData.federalPrograms?.length || 0} programs`);

  // Load state grants
  const stateRaw = await fs.readFile(statePath, 'utf-8');
  const stateData = JSON.parse(stateRaw);
  console.log(`Loaded state-grants.json: ${stateData.stateGrants?.length || 0} grants`);

  // Inject
  db.federalPrograms = fedData.federalPrograms;
  db.stateGrants = stateData.stateGrants;

  // Update metadata
  db._metadata.federalProgramsCount = fedData.federalPrograms.length;
  db._metadata.stateGrantsCount = stateData.stateGrants.length;
  db._metadata.statesCoveredByGrants = [...new Set(stateData.stateGrants.map(g => g.state))].length;
  db._metadata.grantsLastUpdated = new Date().toISOString();

  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
  console.log(`\nInjected into financial-aid-db.json:`);
  console.log(`  Federal programs: ${fedData.federalPrograms.length}`);
  console.log(`  State grants: ${stateData.stateGrants.length} (covering ${db._metadata.statesCoveredByGrants} states)`);
  console.log(`\nDone!`);
}

inject().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
