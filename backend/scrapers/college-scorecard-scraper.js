/**
 * College Scorecard API Scraper
 * 
 * Pulls VERIFIED federal data from the U.S. Department of Education's
 * College Scorecard API. This is official IPEDS-reported data that schools
 * are required to submit to the federal government.
 * 
 * API docs: https://collegescorecard.ed.gov/data/documentation/
 * No API key required for basic access.
 * 
 * Data includes: tuition, fees, room & board, net prices by income,
 * admissions rates, SAT/ACT scores, graduation rates, earnings, etc.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_BASE = 'https://api.data.gov/ed/collegescorecard/v1';
// Free API key from https://api.data.gov/signup/ — set in .env as SCORECARD_API_KEY
const API_KEY = process.env.SCORECARD_API_KEY || 'DEMO_KEY';

// All fields we WANT from the API — the validator will auto-remove any that don't exist
const ALL_DESIRED_FIELDS = [
  // School identity (confirmed valid)
  'id',
  'school.name',
  'school.city',
  'school.state',
  'school.zip',
  'school.school_url',
  'school.ownership',          // 1=public, 2=private nonprofit, 3=private for-profit
  'school.region_id',
  'school.carnegie_basic',
  'school.minority_serving.historically_black',
  'school.men_only',
  'school.women_only',
  'school.religious_affiliation',

  // Size (confirmed valid)
  'latest.student.size',
  'latest.student.enrollment.undergrad_12_month',

  // Admissions (confirmed valid)
  'latest.admissions.admission_rate.overall',
  'latest.admissions.sat_scores.25th_percentile.critical_reading',
  'latest.admissions.sat_scores.75th_percentile.critical_reading',
  'latest.admissions.sat_scores.25th_percentile.math',
  'latest.admissions.sat_scores.75th_percentile.math',
  'latest.admissions.act_scores.25th_percentile.cumulative',
  'latest.admissions.act_scores.75th_percentile.cumulative',

  // Costs (confirmed valid: tuition.in_state, tuition.out_of_state)
  'latest.cost.tuition.in_state',
  'latest.cost.tuition.out_of_state',
  'latest.cost.roomboard.oncampus',
  'latest.cost.booksupply',
  'latest.cost.otherexpense.oncampus',
  'latest.cost.attendance.academic_year',  // Total COA

  // Net prices by income bracket (from IPEDS)
  'latest.cost.net_price.public.by_income_level.0-30000',
  'latest.cost.net_price.public.by_income_level.30001-48000',
  'latest.cost.net_price.public.by_income_level.48001-75000',
  'latest.cost.net_price.public.by_income_level.75001-110000',
  'latest.cost.net_price.public.by_income_level.110001-plus',
  'latest.cost.net_price.private.by_income_level.0-30000',
  'latest.cost.net_price.private.by_income_level.30001-48000',
  'latest.cost.net_price.private.by_income_level.48001-75000',
  'latest.cost.net_price.private.by_income_level.75001-110000',
  'latest.cost.net_price.private.by_income_level.110001-plus',

  // Aid
  'latest.aid.pell_grant_rate',
  'latest.aid.federal_loan_rate',
  'latest.aid.median_debt.completers.overall',

  // Outcomes
  'latest.completion.rate_suppressed.overall',
  'latest.earnings.10_yrs_after_entry.median',
];

// This will be populated after validation
let VALIDATED_FIELDS = '';

/**
 * Validates all field names against the API by making a test request.
 * If any field is invalid, it auto-removes it and retries until all fields work.
 * Returns the validated comma-separated field string.
 */
async function validateFields() {
  let fields = [...ALL_DESIRED_FIELDS];
  let attempts = 0;
  const maxAttempts = 20; // Safety limit
  const removedFields = [];

  console.log(`Validating ${fields.length} field names against the API...\n`);

  while (attempts < maxAttempts) {
    attempts++;
    const url = `${API_BASE}/schools.json?` + new URLSearchParams({
      'api_key': API_KEY,
      'school.degrees_awarded.predominant': '3',
      'school.operating': '1',
      'fields': fields.join(','),
      '_per_page': '1',
      'page': '0'
    });

    const res = await fetch(url);

    if (res.ok) {
      const json = await res.json();
      if (json.results && json.results.length > 0) {
        console.log(`All ${fields.length} fields validated successfully!`);
        if (removedFields.length > 0) {
          console.log(`\nRemoved ${removedFields.length} invalid field(s):`);
          removedFields.forEach(f => console.log(`  - ${f}`));
        }
        console.log('');
        return fields.join(',');
      }
    }

    // Parse error response
    const text = await res.text();
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch {
      throw new Error(`API returned non-JSON error (${res.status}): ${text.substring(0, 200)}`);
    }

    // Look for field_not_found errors
    if (errorData.errors && Array.isArray(errorData.errors)) {
      let foundBadField = false;
      for (const err of errorData.errors) {
        if (err.error === 'field_not_found' && err.input) {
          const badField = err.input;
          console.log(`  Removing invalid field: ${badField}`);
          fields = fields.filter(f => f !== badField);
          removedFields.push(badField);
          foundBadField = true;
        }
        if (err.error === 'parameter_not_found' && err.input) {
          throw new Error(`Invalid filter parameter: ${err.input}. Check your query filters.`);
        }
      }
      if (foundBadField) continue; // Retry with cleaned fields
    }

    // If we get here, it's some other error
    throw new Error(`API validation failed (${res.status}): ${text.substring(0, 500)}`);
  }

  throw new Error(`Field validation exceeded ${maxAttempts} attempts. Remaining fields: ${fields.length}`);
}

// We want all 4-year degree-granting institutions
// school.degrees_awarded.predominant: 3=bachelor's
// school.ownership: 1=public, 2=private nonprofit
// school.operating: 1=currently operating
// school.institutional_characteristics.level: 1=four-year

async function fetchPage(page = 0, perPage = 100) {
  const url = `${API_BASE}/schools.json?` + new URLSearchParams({
    'api_key': API_KEY,
    'school.degrees_awarded.predominant': '3',
    'school.operating': '1',
    'school.ownership__range': '1..2',
    'latest.student.size__range': '500..',
    'fields': VALIDATED_FIELDS,
    '_per_page': String(perPage),
    'page': String(page),
    'sort': 'school.name:asc'
  });

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text.substring(0, 500)}`);
  }
  const json = await res.json();
  console.log(`  Page ${page + 1}: ${json.results?.length || 0} results (total: ${json.metadata?.total || '?'})`);
  return json;
}

function mapOwnership(code) {
  if (code === 1) return 'public';
  if (code === 2) return 'private';
  return 'for-profit';
}

function mapRegion(regionId) {
  const regions = {
    0: 'Other', 1: 'New England', 2: 'Mid-Atlantic', 3: 'Great Lakes',
    4: 'Plains', 5: 'Southeast', 6: 'Southwest', 7: 'Rocky Mountains',
    8: 'Far West', 9: 'Outlying Areas'
  };
  // Map to simpler regions for our app
  const simpleMap = {
    0: 'Other', 1: 'Northeast', 2: 'Northeast', 3: 'Midwest',
    4: 'Midwest', 5: 'South', 6: 'South', 7: 'West',
    8: 'West', 9: 'Other'
  };
  return simpleMap[regionId] || 'Other';
}

function get(raw, field) {
  // Safely get a field value, returning null if undefined or missing
  const val = raw[field];
  return (val === undefined || val === null || val === 'Privacy Suppressed') ? null : val;
}

function transformSchool(raw) {
  const isPublic = raw['school.ownership'] === 1;

  // Get net prices from the right bucket (public vs private)
  const prefix = isPublic ? 'latest.cost.net_price.public' : 'latest.cost.net_price.private';
  
  const netPriceByIncome = {
    under30k: get(raw, `${prefix}.by_income_level.0-30000`),
    '30to48k': get(raw, `${prefix}.by_income_level.30001-48000`),
    '48to75k': get(raw, `${prefix}.by_income_level.48001-75000`),
    '75to110k': get(raw, `${prefix}.by_income_level.75001-110000`),
    over110k: get(raw, `${prefix}.by_income_level.110001-plus`),
  };

  const inStateTuition = get(raw, 'latest.cost.tuition.in_state');
  const outOfStateTuition = get(raw, 'latest.cost.tuition.out_of_state');
  const roomBoard = get(raw, 'latest.cost.roomboard.oncampus');
  const books = get(raw, 'latest.cost.booksupply');
  const otherExpenses = get(raw, 'latest.cost.otherexpense.oncampus');

  // Generate a clean ID from school name
  const schoolName = raw['school.name'] || 'unknown';
  const id = schoolName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) + '-' + raw['id'];

  return {
    id,
    scorecardId: raw['id'],                     // Federal IPEDS ID - the golden key
    name: schoolName,
    city: raw['school.city'] || null,
    state: raw['school.state'] || null,
    zip: raw['school.zip'] || null,
    website: raw['school.school_url'] || null,
    type: mapOwnership(raw['school.ownership']),
    region: mapRegion(raw['school.region_id']),

    // Verified cost data
    stickerPrice: get(raw, 'latest.cost.attendance.academic_year'),
    costBreakdown: {
      tuition: isPublic ? outOfStateTuition : inStateTuition,  // Main tuition = OOS for public, regular for private
      fees: 0,  // Scorecard includes fees in tuition
      roomBoard: roomBoard,
      booksSupplies: books,
      personal: otherExpenses,
      transportation: 0  // Scorecard doesn't break this out separately
    },
    inStateTuition: isPublic ? inStateTuition : null,

    // Verified net prices by income (from IPEDS reporting)
    netPriceByIncome,

    // Admissions data
    admissionRate: get(raw, 'latest.admissions.admission_rate.overall'),
    satRange: {
      reading25: get(raw, 'latest.admissions.sat_scores.25th_percentile.critical_reading'),
      reading75: get(raw, 'latest.admissions.sat_scores.75th_percentile.critical_reading'),
      math25: get(raw, 'latest.admissions.sat_scores.25th_percentile.math'),
      math75: get(raw, 'latest.admissions.sat_scores.75th_percentile.math'),
    },
    actRange: {
      composite25: get(raw, 'latest.admissions.act_scores.25th_percentile.cumulative'),
      composite75: get(raw, 'latest.admissions.act_scores.75th_percentile.cumulative'),
    },

    // Size & outcomes
    undergradSize: get(raw, 'latest.student.size') || get(raw, 'latest.student.enrollment.undergrad_12_month'),
    completionRate: get(raw, 'latest.completion.rate_suppressed.overall'),
    medianEarnings10yr: get(raw, 'latest.earnings.10_yrs_after_entry.median'),

    // Aid stats
    pellGrantRate: get(raw, 'latest.aid.pell_grant_rate'),
    federalLoanRate: get(raw, 'latest.aid.federal_loan_rate'),
    medianDebt: get(raw, 'latest.aid.median_debt.completers.overall'),

    // School characteristics
    hbcu: raw['school.minority_serving.historically_black'] === 1,

    // Data source marker
    _dataSource: 'college-scorecard-api',
    _verified: true,
    _lastUpdated: new Date().toISOString(),

    // These fields will be populated from existing data or manually
    needBlind: null,
    meetsFullNeed: null,
    cssRequired: null,
    deadline: null,
    aidPolicies: [],
    meritScholarships: [],
    keyInsight: null,
    tags: []
  };
}

async function scrapeAll() {
  console.log('=== College Scorecard API Scraper ===');
  console.log('Fetching verified federal data for all 4-year institutions...');
  console.log(`API Key: ${API_KEY === 'DEMO_KEY' ? 'DEMO_KEY (rate limited — get a free key at https://api.data.gov/signup/)' : API_KEY.substring(0, 8) + '...'}\n`);

  // Step 1: Validate all field names — auto-removes any that don't exist
  VALIDATED_FIELDS = await validateFields();

  const allSchools = [];
  let page = 0;
  let totalPages = 1;
  let rateLimitRetries = 0;
  const MAX_RATE_RETRIES = 5;

  while (page < totalPages) {
    try {
      console.log(`Fetching page ${page + 1}...`);
      const data = await fetchPage(page, 100);
      rateLimitRetries = 0; // Reset on success

      if (page === 0) {
        const total = data.metadata.total;
        totalPages = Math.ceil(total / 100);
        console.log(`Total schools: ${total} (${totalPages} pages)\n`);
      }

      for (const raw of data.results) {
        const school = transformSchool(raw);
        // Only include schools with actual cost data
        if (school.stickerPrice || school.costBreakdown.tuition) {
          allSchools.push(school);
        }
      }

      page++;

      // Rate limit: be nice to the API
      if (page < totalPages) {
        await new Promise(r => setTimeout(r, 250));
      }
    } catch (err) {
      console.error(`Error on page ${page + 1}:`, err.message.substring(0, 120));
      if (err.message.includes('429')) {
        rateLimitRetries++;
        if (rateLimitRetries > MAX_RATE_RETRIES) {
          console.error(`\nHit rate limit ${MAX_RATE_RETRIES} times in a row. DEMO_KEY only allows 30 req/hour.`);
          console.error(`Get a FREE API key at https://api.data.gov/signup/ (gives 1000 req/hour).`);
          console.error(`Then run:  set SCORECARD_API_KEY=your_key_here`);
          console.error(`Saving the ${allSchools.length} schools collected so far...\n`);
          break;
        }
        const waitSec = 30 * rateLimitRetries; // 30s, 60s, 90s, 120s, 150s
        console.log(`Rate limited (attempt ${rateLimitRetries}/${MAX_RATE_RETRIES}), waiting ${waitSec}s...`);
        await new Promise(r => setTimeout(r, waitSec * 1000));
      } else {
        page++; // Skip this page on other errors
      }
    }
  }
  
  console.log(`\nFetched ${allSchools.length} schools with cost data`);

  // Sort by name
  allSchools.sort((a, b) => a.name.localeCompare(b.name));

  // Load existing data to preserve manually-added fields
  const existingPath = join(__dirname, '..', 'data', 'scraped', 'financial-aid-db.json');
  let existingData = { schools: [], stateGrants: [], federalPrograms: [] };
  try {
    const raw = await fs.readFile(existingPath, 'utf-8');
    existingData = JSON.parse(raw);
    console.log(`Loaded existing data: ${existingData.schools.length} schools`);
  } catch {
    console.log('No existing data found, starting fresh');
  }

  // Merge: carry over manually-curated fields from existing schools
  const existingByName = {};
  for (const s of existingData.schools) {
    existingByName[s.name.toLowerCase()] = s;
  }

  let mergedCount = 0;
  for (const school of allSchools) {
    const existing = existingByName[school.name.toLowerCase()];
    if (existing) {
      // Preserve manually-curated fields
      school.needBlind = existing.needBlind;
      school.meetsFullNeed = existing.meetsFullNeed;
      school.cssRequired = existing.cssRequired;
      school.deadline = existing.deadline;
      school.aidPolicies = existing.aidPolicies || [];
      school.meritScholarships = existing.meritScholarships || [];
      school.keyInsight = existing.keyInsight;
      school.tags = existing.tags || [];
      mergedCount++;
    }
  }
  console.log(`Merged curated data from ${mergedCount} existing schools`);

  // Build output
  const output = {
    _metadata: {
      source: 'U.S. Department of Education - College Scorecard API',
      apiUrl: 'https://api.data.gov/ed/collegescorecard/v1/schools.json',
      description: 'Verified IPEDS data reported by institutions to the federal government',
      lastScraped: new Date().toISOString(),
      totalSchools: allSchools.length,
      fieldsUsed: VALIDATED_FIELDS.split(',').length,
      disclaimer: 'Cost data is from the most recent IPEDS reporting year. Net prices are verified federal averages.',
      _verified: true
    },
    schools: allSchools,
    // Keep state grants and federal programs from existing data
    stateGrants: existingData.stateGrants || [],
    federalPrograms: existingData.federalPrograms || []
  };

  // Ensure output directory exists
  const outDir = join(__dirname, '..', 'data', 'scraped');
  await fs.mkdir(outDir, { recursive: true });

  const outPath = join(outDir, 'financial-aid-db.json');
  await fs.writeFile(outPath, JSON.stringify(output, null, 2));
  console.log(`\nSaved to ${outPath}`);

  // Print summary stats
  const publics = allSchools.filter(s => s.type === 'public');
  const privates = allSchools.filter(s => s.type === 'private');
  console.log(`\n========================================`);
  console.log(`           SCRAPE COMPLETE`);
  console.log(`========================================`);
  console.log(`Total schools:       ${allSchools.length}`);
  console.log(`  Public:            ${publics.length}`);
  console.log(`  Private:           ${privates.length}`);
  console.log(`With sticker price:  ${allSchools.filter(s => s.stickerPrice).length}`);
  console.log(`With in-state tuit:  ${allSchools.filter(s => s.inStateTuition).length}`);
  console.log(`With admission rate: ${allSchools.filter(s => s.admissionRate).length}`);
  console.log(`With net price data: ${allSchools.filter(s => s.netPriceByIncome.under30k).length}`);
  console.log(`With SAT data:       ${allSchools.filter(s => s.satRange.math25).length}`);
  console.log(`With earnings data:  ${allSchools.filter(s => s.medianEarnings10yr).length}`);
  console.log(`With Pell rate:      ${allSchools.filter(s => s.pellGrantRate).length}`);
  console.log(`With median debt:    ${allSchools.filter(s => s.medianDebt).length}`);
  console.log(`========================================`);

  // Spot-check: print 3 sample schools
  console.log(`\nSample data (first 3 schools):`);
  for (const s of allSchools.slice(0, 3)) {
    console.log(`  ${s.name} (${s.state}) - ${s.type}`);
    console.log(`    Sticker price: $${s.stickerPrice?.toLocaleString() || 'N/A'}`);
    console.log(`    In-state tuition: $${s.inStateTuition?.toLocaleString() || 'N/A'}`);
    console.log(`    Admission rate: ${s.admissionRate ? (s.admissionRate * 100).toFixed(1) + '%' : 'N/A'}`);
    console.log(`    Net price (<$30k): $${s.netPriceByIncome.under30k?.toLocaleString() || 'N/A'}`);
  }
}

scrapeAll().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
