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

// Fields we need from the API
const FIELDS = [
  // School identity
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
  
  // Size
  'latest.student.size',
  'latest.student.enrollment.undergrad_12_month',
  
  // Admissions
  'latest.admissions.admission_rate.overall',
  'latest.admissions.sat_scores.25th_percentile.critical_reading',
  'latest.admissions.sat_scores.75th_percentile.critical_reading',
  'latest.admissions.sat_scores.25th_percentile.math',
  'latest.admissions.sat_scores.75th_percentile.math',
  'latest.admissions.act_scores.25th_percentile.cumulative',
  'latest.admissions.act_scores.75th_percentile.cumulative',
  
  // Costs - IN-STATE
  'latest.cost.tuition.in_state',
  'latest.cost.tuition.out_of_state',
  'latest.cost.roomboard.oncampus',
  'latest.cost.booksupply',
  'latest.cost.otherexpense.oncampus',
  'latest.cost.attendance.academic_year',  // Total COA
  
  // Net prices by income bracket (VERIFIED from IPEDS)
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
].join(',');

// We want all 4-year degree-granting institutions
// ownership: 1=public, 2=private nonprofit
// degrees_highest: 3=bachelor's, 4=graduate
// operating: 1=currently operating

async function fetchPage(page = 0, perPage = 100) {
  const url = `${API_BASE}/schools.json?` + new URLSearchParams({
    'api_key': API_KEY,
    'school.degrees_highest__range': '3..4',
    'school.operating': '1',
    'school.ownership__range': '1..2',
    'latest.student.size__range': '500..', // At least 500 students
    'fields': FIELDS,
    'per_page': String(perPage),
    'page': String(page),
    'sort': 'school.name:asc'
  });

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
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

function transformSchool(raw) {
  const isPublic = raw['school.ownership'] === 1;
  
  // Get net prices from the right bucket (public vs private)
  const prefix = isPublic ? 'latest.cost.net_price.public' : 'latest.cost.net_price.private';
  
  const netPriceByIncome = {
    under30k: raw[`${prefix}.by_income_level.0-30000`] || null,
    '30to48k': raw[`${prefix}.by_income_level.30001-48000`] || null,
    '48to75k': raw[`${prefix}.by_income_level.48001-75000`] || null,
    '75to110k': raw[`${prefix}.by_income_level.75001-110000`] || null,
    over110k: raw[`${prefix}.by_income_level.110001-plus`] || null,
  };

  const inStateTuition = raw['latest.cost.tuition.in_state'] || null;
  const outOfStateTuition = raw['latest.cost.tuition.out_of_state'] || null;
  const roomBoard = raw['latest.cost.roomboard.oncampus'] || null;
  const books = raw['latest.cost.booksupply'] || null;
  const otherExpenses = raw['latest.cost.otherexpense.oncampus'] || null;

  // Generate a clean ID from school name
  const id = raw['school.name']
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) + '-' + raw['id'];

  return {
    id,
    scorecardId: raw['id'],                     // Federal IPEDS ID - the golden key
    name: raw['school.name'],
    city: raw['school.city'],
    state: raw['school.state'],
    zip: raw['school.zip'],
    website: raw['school.school_url'],
    type: mapOwnership(raw['school.ownership']),
    region: mapRegion(raw['school.region_id']),
    
    // Verified cost data
    stickerPrice: raw['latest.cost.attendance.academic_year'] || null,
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
    admissionRate: raw['latest.admissions.admission_rate.overall'] || null,
    satRange: {
      reading25: raw['latest.admissions.sat_scores.25th_percentile.critical_reading'],
      reading75: raw['latest.admissions.sat_scores.75th_percentile.critical_reading'],
      math25: raw['latest.admissions.sat_scores.25th_percentile.math'],
      math75: raw['latest.admissions.sat_scores.75th_percentile.math'],
    },
    actRange: {
      composite25: raw['latest.admissions.act_scores.25th_percentile.cumulative'],
      composite75: raw['latest.admissions.act_scores.75th_percentile.cumulative'],
    },
    
    // Size & outcomes
    undergradSize: raw['latest.student.size'] || raw['latest.student.enrollment.undergrad_12_month'],
    completionRate: raw['latest.completion.rate_suppressed.overall'] || null,
    medianEarnings10yr: raw['latest.earnings.10_yrs_after_entry.median'] || null,
    
    // Aid stats
    pellGrantRate: raw['latest.aid.pell_grant_rate'] || null,
    federalLoanRate: raw['latest.aid.federal_loan_rate'] || null,
    medianDebt: raw['latest.aid.median_debt.completers.overall'] || null,
    
    // School characteristics
    hbcu: raw['school.minority_serving.historically_black'] === 1,
    
    // Data source marker
    _dataSource: 'college-scorecard-api',
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
  console.log('Fetching verified federal data for all 4-year institutions...\n');
  
  const allSchools = [];
  let page = 0;
  let totalPages = 1;
  
  while (page < totalPages) {
    try {
      console.log(`Fetching page ${page + 1}...`);
      const data = await fetchPage(page, 100);
      
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
        await new Promise(r => setTimeout(r, 200));
      }
    } catch (err) {
      console.error(`Error on page ${page}:`, err.message);
      if (err.message.includes('429')) {
        console.log('Rate limited, waiting 5 seconds...');
        await new Promise(r => setTimeout(r, 5000));
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
    }
  }
  
  // Build output
  const output = {
    _metadata: {
      source: 'U.S. Department of Education - College Scorecard API',
      apiUrl: 'https://api.data.gov/ed/collegescorecard/v1/schools.json',
      description: 'Verified IPEDS data reported by institutions to the federal government',
      lastScraped: new Date().toISOString(),
      totalSchools: allSchools.length,
      disclaimer: 'Cost data is from the most recent IPEDS reporting year. Net prices are verified federal averages.'
    },
    schools: allSchools,
    // Keep state grants and federal programs from existing data
    stateGrants: existingData.stateGrants || [],
    federalPrograms: existingData.federalPrograms || []
  };
  
  const outPath = join(__dirname, '..', 'data', 'scraped', 'financial-aid-db.json');
  await fs.writeFile(outPath, JSON.stringify(output, null, 2));
  console.log(`\nSaved to ${outPath}`);
  
  // Print summary stats
  const publics = allSchools.filter(s => s.type === 'public');
  const privates = allSchools.filter(s => s.type === 'private');
  console.log(`\n--- Summary ---`);
  console.log(`Public: ${publics.length}`);
  console.log(`Private: ${privates.length}`);
  console.log(`With admission rate: ${allSchools.filter(s => s.admissionRate).length}`);
  console.log(`With net price data: ${allSchools.filter(s => s.netPriceByIncome.under30k).length}`);
  console.log(`With SAT data: ${allSchools.filter(s => s.satRange.math25).length}`);
  console.log(`With earnings data: ${allSchools.filter(s => s.medianEarnings10yr).length}`);
}

scrapeAll().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
