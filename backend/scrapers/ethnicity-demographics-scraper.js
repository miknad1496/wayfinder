/**
 * IPEDS Ethnicity Demographics Scraper
 *
 * Fetches race/ethnicity breakdown by major (CIP code) for each target school
 * using IPEDS Completions data. This is a "one and done for 1 year" scraper —
 * IPEDS releases completions data annually, so run once per year with updated year.
 *
 * Data source: IPEDS Completions Survey (Table A) — awards/completions by
 * race/ethnicity, sex, CIP code, and award level.
 *
 * Two data access strategies:
 *   1. PRIMARY: Urban Institute Education Data Portal API (clean REST wrapper around IPEDS)
 *   2. FALLBACK: IPEDS bulk CSV download from NCES
 *
 * Output: backend/data/scraped/ethnicity-demographics.json
 *
 * Usage:
 *   node run-ethnicity.js                    # uses latest available year
 *   node run-ethnicity.js --year=2023        # specific academic year (2022-23)
 *   node run-ethnicity.js --method=bulk      # force bulk CSV download method
 */

import { fetchJSON, saveScrapedData, sleep } from './utils.js';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createGunzip } from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================
// CONFIGURATION
// ============================================================

// Default to most recent full completions year available in IPEDS
// IPEDS typically releases completions data ~18 months after the academic year
// As of early 2026, 2022-23 (year=2023) should be the most recent full release
const DEFAULT_YEAR = 2023;

// Urban Institute Education Data Portal API
const URBAN_API_BASE = 'https://educationdata.urban.org/api/v1';
const URBAN_COMPLETIONS_ENDPOINT = `${URBAN_API_BASE}/college-university/ipeds/completions-cip-6`;

// IPEDS Bulk Data Download (fallback)
const IPEDS_BULK_BASE = 'https://nces.ed.gov/ipeds/datacenter/data';

// Race/ethnicity field mapping for IPEDS Completions CSV columns
const RACE_COLUMNS = {
  CWHITT: 'white',
  CASIAT: 'asian',
  CBKAAT: 'black',
  CHISPT: 'hispanic',
  CAIANT: 'american_indian_alaska_native',
  CNHPIT: 'native_hawaiian_pacific_islander',
  C2MORT: 'two_or_more_races',
  CUNKNW: 'unknown',
  CNRALT: 'nonresident_alien',
  CTOTALT: 'total'
};

// Urban Institute API race code mapping
const URBAN_RACE_CODES = {
  1: 'white',
  2: 'black',
  3: 'hispanic',
  4: 'asian',
  5: 'american_indian_alaska_native',
  6: 'native_hawaiian_pacific_islander',
  7: 'two_or_more_races',
  8: 'nonresident_alien',
  9: 'unknown',
  99: 'total'
};

// Award levels — we want bachelor's degrees (level 5 in IPEDS)
const BACHELORS_AWARD_LEVEL = 5;

// ============================================================
// TARGET SCHOOLS — UNITID mapping
// UNITID is the unique IPEDS identifier for each institution.
// These are stable across years. Sourced from College Scorecard / IPEDS.
// ============================================================

const TARGET_SCHOOLS = {
  // Ivy League (8)
  166027: 'Harvard University',
  130794: 'Yale University',
  186131: 'Princeton University',
  190150: 'Columbia University',
  215062: 'University of Pennsylvania',
  217156: 'Brown University',
  182670: 'Dartmouth College',
  190415: 'Cornell University',

  // Top Private (20)
  243744: 'Stanford University',
  166683: 'Massachusetts Institute of Technology',
  110404: 'California Institute of Technology',
  152651: 'Duke University',
  144050: 'University of Chicago',
  147767: 'Northwestern University',
  162928: 'Johns Hopkins University',
  227757: 'Rice University',
  221999: 'Vanderbilt University',
  179867: 'Washington University in St Louis',
  139755: 'Emory University',
  131469: 'Georgetown University',
  152080: 'University of Notre Dame',
  211440: 'Carnegie Mellon University',
  123961: 'University of Southern California',
  168148: 'Tufts University',
  193900: 'New York University',
  160755: 'Tulane University',
  167358: 'Northeastern University',
  132903: 'Case Western Reserve University',

  // More Top Private (15)
  164924: 'Boston College',
  164988: 'Boston University',
  199847: 'Wake Forest University',
  213543: 'Lehigh University',
  165015: 'Brandeis University',
  216597: 'Villanova University',
  195030: 'University of Rochester',
  194824: 'Rensselaer Polytechnic Institute',
  131159: 'George Washington University',
  121150: 'Pepperdine University',
  135726: 'University of Miami',
  228459: 'Southern Methodist University',
  191241: 'Fordham University',
  233374: 'University of Richmond',
  122931: 'Santa Clara University',

  // Top Public / Flagship State (15)
  110635: 'University of California-Berkeley',
  110662: 'University of California-Los Angeles',
  170976: 'University of Michigan-Ann Arbor',
  234076: 'University of Virginia',
  199120: 'University of North Carolina at Chapel Hill',
  139959: 'Georgia Institute of Technology',
  228778: 'University of Texas at Austin',
  134130: 'University of Florida',
  240444: 'University of Wisconsin-Madison',
  145637: 'University of Illinois Urbana-Champaign',
  243780: 'Purdue University',
  236948: 'University of Washington-Seattle',
  233921: 'Virginia Tech',
  228723: 'Texas A&M University',
  199193: 'North Carolina State University',

  // More Top Public (15)
  204796: 'Ohio State University',
  214777: 'Penn State University',
  163286: 'University of Maryland',
  186380: 'Rutgers University-New Brunswick',
  110680: 'UC San Diego',
  110644: 'UC Davis',
  110653: 'UC Irvine',
  110705: 'UC Santa Barbara',
  139940: 'University of Georgia',
  174066: 'University of Minnesota',
  217882: 'Clemson University',
  215293: 'University of Pittsburgh',
  151351: 'Indiana University Bloomington',
  126614: 'University of Colorado Boulder',
  129020: 'University of Connecticut',

  // Elite Liberal Arts (18)
  168342: 'Williams College',
  164465: 'Amherst College',
  119678: 'Pomona College',
  161004: 'Bowdoin College',
  216010: 'Swarthmore College',
  168218: 'Wellesley College',
  218742: 'Middlebury College',
  173258: 'Carleton College',
  112260: 'Claremont McKenna College',
  115409: 'Harvey Mudd College',
  161086: 'Colby College',
  191515: 'Hamilton College',
  130226: 'Wesleyan University',
  213367: 'Haverford College',
  198385: 'Davidson College',
  153384: 'Grinnell College',
  190099: 'Colgate University',
  161200: 'Bates College',

  // Rising / Popular (9)
  231624: 'William & Mary',
  134097: 'Florida State University',
  196097: 'Stony Brook University',
  166629: 'UMass Amherst',
  153658: 'University of Iowa',
  104151: 'Arizona State University',
  212054: 'Drexel University',
  186867: 'Stevens Institute of Technology',
  209551: 'University of Oregon',
};

// All 100 UNITIDs are now explicitly mapped above.
// If expanding beyond 100, add names here for API-based resolution.
const SCHOOL_NAMES_FOR_LOOKUP = [];

// ============================================================
// UNITID RESOLVER — uses College Scorecard API to find UNITIDs
// ============================================================

async function resolveUnitIds(schoolNames) {
  const apiKey = process.env.DATA_GOV_API_KEY || 'YOUR_API_KEY_HERE';
  const resolved = {};

  for (const name of schoolNames) {
    try {
      const searchName = name.replace(/\s+/g, '+');
      const url = `https://api.data.gov/ed/collegescorecard/v1/schools?school.name=${searchName}&fields=id,school.name&api_key=${apiKey}`;
      const data = await fetchJSON(url);

      if (data.results && data.results.length > 0) {
        // Find exact or closest match
        const match = data.results.find(r =>
          r['school.name'].toLowerCase() === name.toLowerCase()
        ) || data.results[0];

        resolved[match.id] = match['school.name'];
        console.log(`  Resolved: ${name} → UNITID ${match.id}`);
      }
      await sleep(200); // Rate limit
    } catch (err) {
      console.warn(`  Could not resolve UNITID for ${name}: ${err.message}`);
    }
  }

  return resolved;
}

// ============================================================
// CIP CODE REFERENCE — human-readable major names
// ============================================================

// Top ~100 CIP codes (2-digit families + common 6-digit specifics)
// Full reference: https://nces.ed.gov/ipeds/cipcode
const CIP_FAMILIES = {
  '01': 'Agriculture',
  '03': 'Natural Resources & Conservation',
  '04': 'Architecture',
  '05': 'Area, Ethnic & Cultural Studies',
  '09': 'Communication & Journalism',
  '10': 'Communications Technologies',
  '11': 'Computer & Information Sciences',
  '13': 'Education',
  '14': 'Engineering',
  '15': 'Engineering Technologies',
  '16': 'Foreign Languages & Linguistics',
  '19': 'Family & Consumer Sciences',
  '22': 'Legal Professions',
  '23': 'English Language & Literature',
  '24': 'Liberal Arts & General Studies',
  '25': 'Library Science',
  '26': 'Biological & Biomedical Sciences',
  '27': 'Mathematics & Statistics',
  '29': 'Military Technologies',
  '30': 'Multi/Interdisciplinary Studies',
  '31': 'Parks, Recreation & Fitness',
  '38': 'Philosophy & Religious Studies',
  '40': 'Physical Sciences',
  '42': 'Psychology',
  '43': 'Homeland Security & Law Enforcement',
  '44': 'Public Administration & Social Services',
  '45': 'Social Sciences',
  '49': 'Transportation',
  '50': 'Visual & Performing Arts',
  '51': 'Health Professions',
  '52': 'Business, Management & Marketing',
  '54': 'History'
};

// Popular specific CIP codes for detailed tracking
const SPECIFIC_CIP_NAMES = {
  '110101': 'Computer Science',
  '110701': 'Computer Science (General)',
  '140101': 'Engineering (General)',
  '140201': 'Aerospace Engineering',
  '140301': 'Agricultural Engineering',
  '140501': 'Biomedical Engineering',
  '140701': 'Chemical Engineering',
  '140801': 'Civil Engineering',
  '140901': 'Computer Engineering',
  '141001': 'Electrical Engineering',
  '141301': 'Engineering Science',
  '141401': 'Environmental Engineering',
  '141901': 'Mechanical Engineering',
  '260101': 'Biology (General)',
  '270101': 'Mathematics',
  '270501': 'Statistics',
  '400501': 'Chemistry',
  '400801': 'Physics',
  '420101': 'Psychology',
  '450601': 'Economics',
  '451001': 'Political Science',
  '451101': 'Sociology',
  '450201': 'Anthropology',
  '230101': 'English',
  '540101': 'History',
  '380101': 'Philosophy',
  '500501': 'Drama/Theater',
  '500701': 'Fine/Studio Arts',
  '500901': 'Music',
  '510000': 'Health Services (General)',
  '511601': 'Nursing',
  '520101': 'Business (General)',
  '520201': 'Business Admin & Management',
  '520301': 'Accounting',
  '520801': 'Finance',
  '521401': 'Marketing',
  '090101': 'Communication (General)',
  '131001': 'Special Education',
  '160101': 'Foreign Languages (General)',
  '160901': 'French',
  '160905': 'Spanish',
  '300101': 'Biological & Physical Sciences',
  '302001': 'International/Global Studies',
  '310501': 'Health/Physical Education',
  '440401': 'Public Policy',
  '512201': 'Public Health'
};

function getCipName(cipCode) {
  // Try specific match first
  const normalized = cipCode.replace('.', '');
  if (SPECIFIC_CIP_NAMES[normalized]) return SPECIFIC_CIP_NAMES[normalized];

  // Fall back to 2-digit family
  const family = normalized.substring(0, 2);
  if (CIP_FAMILIES[family]) return `${CIP_FAMILIES[family]} (${cipCode})`;

  return `CIP ${cipCode}`;
}

// ============================================================
// METHOD 1: URBAN INSTITUTE API
// ============================================================

async function fetchViaUrbanApi(year, unitIds) {
  console.log(`\n📡 Fetching via Urban Institute Education Data Portal API (year=${year})...`);
  const results = {};

  for (const [unitId, schoolName] of Object.entries(unitIds)) {
    console.log(`  Fetching: ${schoolName} (UNITID: ${unitId})...`);

    try {
      // Fetch all completions for this school, bachelor's level
      // The API returns paginated results — we need to handle pagination
      let allRecords = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const url = `${URBAN_COMPLETIONS_ENDPOINT}/${year}/?unitid=${unitId}&award_level=${BACHELORS_AWARD_LEVEL}&sex=99&page=${page}&per_page=1000`;

        try {
          const data = await fetchJSON(url);
          if (data.results && data.results.length > 0) {
            allRecords = allRecords.concat(data.results);
            hasMore = data.results.length === 1000; // Full page means there might be more
            page++;
          } else {
            hasMore = false;
          }
        } catch (err) {
          if (err.message.includes('404') || err.message.includes('400')) {
            hasMore = false;
          } else {
            throw err;
          }
        }

        await sleep(150); // Rate limit
      }

      if (allRecords.length === 0) {
        console.warn(`    No data found for ${schoolName}`);
        continue;
      }

      // Aggregate by CIP code
      const majors = {};
      for (const record of allRecords) {
        const cipCode = String(record.cipcode_6digit || record.cipcode || '').replace('.', '');
        if (!cipCode || cipCode === '99') continue; // Skip grand totals

        const raceName = URBAN_RACE_CODES[record.race] || `race_${record.race}`;
        const count = record.awards || record.completions || 0;

        if (!majors[cipCode]) {
          majors[cipCode] = {
            cipCode,
            majorName: getCipName(cipCode),
            demographics: {}
          };
        }
        majors[cipCode].demographics[raceName] = (majors[cipCode].demographics[raceName] || 0) + count;
      }

      results[unitId] = {
        school: schoolName,
        unitId: parseInt(unitId),
        year: `${year - 1}-${year}`,
        totalMajorsWithData: Object.keys(majors).length,
        majors: Object.values(majors)
          .filter(m => (m.demographics.total || 0) > 0)
          .sort((a, b) => (b.demographics.total || 0) - (a.demographics.total || 0))
      };

      console.log(`    ✓ ${Object.keys(majors).length} majors found`);

    } catch (err) {
      console.error(`    ✗ Error fetching ${schoolName}: ${err.message}`);
    }

    await sleep(300); // Be polite to the API
  }

  return results;
}

// ============================================================
// METHOD 2: IPEDS BULK CSV DOWNLOAD (FALLBACK)
// ============================================================

async function fetchViaBulkCsv(year, unitIds) {
  console.log(`\n📦 Fetching via IPEDS bulk CSV download (year=${year})...`);

  const zipUrl = `${IPEDS_BULK_BASE}/C${year}_A.zip`;
  const tempDir = join(__dirname, '..', 'data', 'temp');
  const zipPath = join(tempDir, `C${year}_A.zip`);
  const csvPath = join(tempDir, `c${year}_a.csv`);

  await fs.mkdir(tempDir, { recursive: true });

  // Step 1: Download the ZIP file
  console.log(`  Downloading: ${zipUrl}`);
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(zipUrl, {
      headers: { 'User-Agent': 'Wayfinder-Career-Advisor/1.0 (educational-research)' }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const fileStream = createWriteStream(zipPath);
    await pipeline(response.body, fileStream);
    console.log(`  ✓ Downloaded ZIP`);
  } catch (err) {
    throw new Error(`Failed to download IPEDS bulk data: ${err.message}`);
  }

  // Step 2: Extract CSV from ZIP
  console.log(`  Extracting CSV...`);
  try {
    // Use system unzip since Node.js doesn't have native ZIP support
    const { execSync } = await import('child_process');
    execSync(`cd "${tempDir}" && unzip -o "${zipPath}" -d "${tempDir}"`, { stdio: 'pipe' });

    // Find the CSV file (name varies by year — could be c2023_a.csv or C2023_A.csv)
    const files = await fs.readdir(tempDir);
    const csvFile = files.find(f => f.toLowerCase().endsWith('.csv') && f.toLowerCase().includes('c'));
    if (!csvFile) throw new Error('CSV file not found in ZIP');

    const actualCsvPath = join(tempDir, csvFile);
    console.log(`  ✓ Extracted: ${csvFile}`);

    // Step 3: Parse CSV — only rows matching our target UNITIDs
    return await parseBulkCsv(actualCsvPath, unitIds, year);

  } catch (err) {
    throw new Error(`Failed to process IPEDS CSV: ${err.message}`);
  } finally {
    // Cleanup temp files
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) { /* ignore cleanup errors */ }
  }
}

async function parseBulkCsv(csvPath, unitIds, year) {
  console.log(`  Parsing CSV for ${Object.keys(unitIds).length} target schools...`);

  const targetUnitIdSet = new Set(Object.keys(unitIds).map(Number));
  const results = {};
  const content = await fs.readFile(csvPath, 'utf8');
  const lines = content.split('\n');

  if (lines.length < 2) throw new Error('CSV appears empty');

  // Parse header
  const header = lines[0].toUpperCase().split(',').map(h => h.trim().replace(/"/g, ''));
  const colIndex = {};
  header.forEach((col, i) => { colIndex[col] = i; });

  // Verify required columns exist
  const requiredCols = ['UNITID', 'CIPCODE', 'AWLEVEL', 'CTOTALT'];
  for (const col of requiredCols) {
    if (colIndex[col] === undefined) {
      throw new Error(`Required column ${col} not found in CSV. Available: ${header.slice(0, 20).join(', ')}`);
    }
  }

  let matchedRows = 0;
  let totalRows = 0;

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    totalRows++;

    const cols = line.split(',').map(c => c.trim().replace(/"/g, ''));
    const unitId = parseInt(cols[colIndex['UNITID']]);

    // Skip non-target schools immediately (huge efficiency gain)
    if (!targetUnitIdSet.has(unitId)) continue;

    const awLevel = parseInt(cols[colIndex['AWLEVEL']]);
    // Only bachelor's degrees
    if (awLevel !== BACHELORS_AWARD_LEVEL) continue;

    const cipCode = cols[colIndex['CIPCODE']]?.replace('.', '') || '';
    if (!cipCode || cipCode === '99') continue; // Skip grand total rows

    matchedRows++;
    const schoolName = unitIds[unitId];

    if (!results[unitId]) {
      results[unitId] = {
        school: schoolName,
        unitId,
        year: `${year - 1}-${year}`,
        majors: {}
      };
    }

    // Extract race/ethnicity counts
    const demographics = {};
    for (const [csvCol, raceName] of Object.entries(RACE_COLUMNS)) {
      const idx = colIndex[csvCol];
      if (idx !== undefined) {
        const val = parseInt(cols[idx]) || 0;
        demographics[raceName] = val;
      }
    }

    // Use MAJORNUM to handle double majors (MAJORNUM=1 is primary, 2 is second)
    const majorNum = parseInt(cols[colIndex['MAJORNUM']]) || 1;
    const key = `${cipCode}_${majorNum}`;

    if (!results[unitId].majors[key]) {
      results[unitId].majors[key] = {
        cipCode,
        majorName: getCipName(cipCode),
        majorNumber: majorNum,
        demographics: {}
      };
    }

    // Aggregate (in case of multiple rows per CIP, e.g. male+female when not pre-aggregated)
    const existing = results[unitId].majors[key].demographics;
    for (const [race, count] of Object.entries(demographics)) {
      existing[race] = (existing[race] || 0) + count;
    }
  }

  console.log(`  ✓ Parsed ${totalRows.toLocaleString()} rows, ${matchedRows.toLocaleString()} matched target schools`);

  // Convert majors objects to sorted arrays
  for (const unitId of Object.keys(results)) {
    const majorsObj = results[unitId].majors;
    results[unitId].majors = Object.values(majorsObj)
      .filter(m => (m.demographics.total || 0) > 0)
      .sort((a, b) => (b.demographics.total || 0) - (a.demographics.total || 0));
    results[unitId].totalMajorsWithData = results[unitId].majors.length;
  }

  return results;
}

// ============================================================
// POST-PROCESSING — compute percentages, add school-level aggregates
// ============================================================

function enrichResults(rawResults) {
  const enriched = {};

  for (const [unitId, schoolData] of Object.entries(rawResults)) {
    // Compute school-level aggregate demographics
    const schoolAggregate = {
      total: 0, white: 0, asian: 0, black: 0, hispanic: 0,
      american_indian_alaska_native: 0, native_hawaiian_pacific_islander: 0,
      two_or_more_races: 0, unknown: 0, nonresident_alien: 0
    };

    for (const major of schoolData.majors) {
      for (const [race, count] of Object.entries(major.demographics)) {
        schoolAggregate[race] = (schoolAggregate[race] || 0) + count;
      }

      // Add percentage breakdown to each major
      const total = major.demographics.total || 1;
      major.percentages = {};
      for (const [race, count] of Object.entries(major.demographics)) {
        if (race !== 'total') {
          major.percentages[race] = Math.round((count / total) * 1000) / 10; // 1 decimal
        }
      }
    }

    // School-level percentages
    const schoolTotal = schoolAggregate.total || 1;
    const schoolPercentages = {};
    for (const [race, count] of Object.entries(schoolAggregate)) {
      if (race !== 'total') {
        schoolPercentages[race] = Math.round((count / schoolTotal) * 1000) / 10;
      }
    }

    enriched[unitId] = {
      ...schoolData,
      schoolAggregate: {
        demographics: schoolAggregate,
        percentages: schoolPercentages
      }
    };
  }

  return enriched;
}

// ============================================================
// MAIN EXPORT
// ============================================================

export async function scrapeEthnicityDemographics(options = {}) {
  const year = options.year || DEFAULT_YEAR;
  const method = options.method || 'api'; // 'api' or 'bulk'

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  IPEDS Ethnicity Demographics Scraper            ║');
  console.log('║  Race/Ethnicity by Major by School               ║');
  console.log(`║  Academic Year: ${year - 1}-${year}                        ║`);
  console.log(`║  Method: ${method === 'api' ? 'Urban Institute API' : 'IPEDS Bulk CSV'}              ║`);
  console.log('╚══════════════════════════════════════════════════╝');

  // Step 1: Build complete UNITID mapping
  console.log('\n🔍 Building school UNITID mapping...');
  let allSchools = { ...TARGET_SCHOOLS };

  // Resolve any schools that need API lookup
  if (SCHOOL_NAMES_FOR_LOOKUP.length > 0) {
    try {
      const resolved = await resolveUnitIds(SCHOOL_NAMES_FOR_LOOKUP);
      allSchools = { ...allSchools, ...resolved };
    } catch (err) {
      console.warn(`  Could not resolve additional schools: ${err.message}`);
    }
  }

  // Remove any placeholder/incorrect entries
  // (entries where UNITID maps to a school name that's also in the lookup list)
  for (const name of SCHOOL_NAMES_FOR_LOOKUP) {
    for (const [id, n] of Object.entries(allSchools)) {
      if (n === name) {
        // Keep only the most recently added (resolved) entry
        break;
      }
    }
  }

  console.log(`  Total target schools: ${Object.keys(allSchools).length}`);

  // Step 2: Fetch data
  let rawResults;

  if (method === 'api') {
    try {
      rawResults = await fetchViaUrbanApi(year, allSchools);
    } catch (err) {
      console.warn(`\n⚠️  Urban API failed: ${err.message}`);
      console.log('  Falling back to IPEDS bulk CSV download...');
      rawResults = await fetchViaBulkCsv(year, allSchools);
    }
  } else {
    rawResults = await fetchViaBulkCsv(year, allSchools);
  }

  // Step 3: Enrich with percentages and aggregates
  console.log('\n📊 Computing percentages and school-level aggregates...');
  const enrichedResults = enrichResults(rawResults);

  // Guard: do NOT overwrite existing data with empty results
  if (Object.keys(enrichedResults).length === 0) {
    console.warn('\n⚠️  Scraper returned 0 schools — NOT overwriting existing data file.');
    console.warn('   This usually means the API was unreachable. Data file left intact.');
    return null;
  }

  // Step 4: Build final output
  const output = {
    metadata: {
      source: 'IPEDS Completions Survey (NCES)',
      academicYear: `${year - 1}-${year}`,
      scrapedAt: new Date().toISOString(),
      totalSchools: Object.keys(enrichedResults).length,
      description: 'Race/ethnicity demographics by major (CIP code) for target schools. Bachelor\'s degrees only.',
      awardLevel: 'Bachelor\'s degree',
      raceCategories: {
        white: 'White',
        asian: 'Asian',
        black: 'Black or African American',
        hispanic: 'Hispanic or Latino',
        american_indian_alaska_native: 'American Indian or Alaska Native',
        native_hawaiian_pacific_islander: 'Native Hawaiian or Other Pacific Islander',
        two_or_more_races: 'Two or more races',
        nonresident_alien: 'Nonresident alien',
        unknown: 'Race/ethnicity unknown'
      },
      notes: [
        'Data from IPEDS Completions survey — counts of degree completions, not enrollment',
        'Percentages calculated from completions totals per major per school',
        'CIP codes follow the Classification of Instructional Programs standard',
        'Some CIP codes may aggregate multiple sub-specialties',
        'Nonresident alien is a separate IPEDS category, not a race/ethnicity',
        'Run this scraper annually when new IPEDS data is released (typically 12-18 months lag)'
      ]
    },
    schools: Object.values(enrichedResults)
      .sort((a, b) => a.school.localeCompare(b.school))
  };

  // Step 5: Save
  const savedPath = await saveScrapedData('ethnicity-demographics.json', output);

  // Step 6: Summary stats
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  SCRAPE COMPLETE');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Schools with data: ${output.schools.length}`);
  console.log(`  Total major-school combinations: ${output.schools.reduce((sum, s) => sum + s.majors.length, 0)}`);
  console.log(`  Output: ${savedPath}`);

  // Print quick sample
  if (output.schools.length > 0) {
    const sample = output.schools[0];
    console.log(`\n  Sample — ${sample.school}:`);
    console.log(`    School-wide: Asian ${sample.schoolAggregate?.percentages?.asian || '?'}%, White ${sample.schoolAggregate?.percentages?.white || '?'}%, Black ${sample.schoolAggregate?.percentages?.black || '?'}%, Hispanic ${sample.schoolAggregate?.percentages?.hispanic || '?'}%`);
    if (sample.majors.length > 0) {
      const topMajor = sample.majors[0];
      console.log(`    Top major: ${topMajor.majorName} (${topMajor.demographics.total} completions)`);
    }
  }

  return output;
}

export default scrapeEthnicityDemographics;
