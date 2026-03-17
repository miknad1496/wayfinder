/**
 * Runner script for local schools data scraper
 * Exports school data to JSON file in backend/data/scraped/
 */

import fs from 'fs';
import path from 'path';
import { getLocalSchoolData } from './local-schools-data.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runLocalSchoolsScraper() {
  console.log('Starting Local Schools Data Export...');

  try {
    // Get school data
    const schoolData = getLocalSchoolData();

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../data/scraped');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write to JSON file
    const outputPath = path.join(outputDir, 'local-schools.json');
    const jsonString = JSON.stringify(schoolData, null, 2);

    fs.writeFileSync(outputPath, jsonString, 'utf8');

    console.log(`✓ School data exported successfully to ${outputPath}`);
    console.log(`✓ Total data size: ${(jsonString.length / 1024).toFixed(2)} KB`);

    // Log summary statistics
    const stats = {
      regions: 1,
      districts: Object.keys(schoolData.districts).length,
      privateSchools: Object.keys(schoolData.privateSchools).length,
      publicHighSchools: Object.keys(schoolData.publicHighSchools).length,
      publicMiddleSchools: Object.keys(schoolData.publicMiddleSchools).length,
      publicElementarySchools: Object.keys(schoolData.publicElementary).reduce((acc, key) => {
        if (Array.isArray(schoolData.publicElementary[key])) {
          return acc + schoolData.publicElementary[key].length;
        }
        return acc;
      }, 0)
    };

    console.log('\n=== Export Summary ===');
    console.log(`Districts: ${stats.districts}`);
    console.log(`Private Schools: ${stats.privateSchools}`);
    console.log(`Public High Schools: ${stats.publicHighSchools}`);
    console.log(`Public Middle Schools: ${stats.publicMiddleSchools}`);
    console.log(`Public Elementary Schools: ${stats.publicElementarySchools}`);
    console.log(`Total Schools: ${stats.privateSchools + stats.publicHighSchools + stats.publicMiddleSchools + stats.publicElementarySchools}`);

    return true;
  } catch (error) {
    console.error('Error exporting school data:', error);
    process.exit(1);
  }
}

// Run the scraper
runLocalSchoolsScraper();
