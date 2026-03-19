/**
 * Expanded Admissions Data Scraper — Phase 1
 *
 * Pulls College Scorecard data for 229+ universities.
 * Builds the quantitative foundation for training pair generation.
 *
 * Run: node backend/scrapers/expanded-admissions-scraper.js
 * Requires: DATA_GOV_API_KEY in .env
 *
 * Output: backend/data/scraped/college-admissions-expanded.json
 */

import { fetchJSON, saveScrapedData, sleep } from './utils.js';
import { ALL_SCHOOLS, V1_SCHOOLS, NEW_SCHOOLS, getSchoolCategory, SCHOOL_CATEGORIES } from './expanded-schools-list.js';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

const API_BASE = 'https://api.data.gov/ed/collegescorecard/v1';
const API_KEY = process.env.DATA_GOV_API_KEY;

// Extended fields for deeper data pull
const SCHOOL_FIELDS = [
  'id',
  'school.name',
  'school.city',
  'school.state',
  'school.school_url',
  'school.type',
  'school.carnegie_basic',
  'school.carnegie_size_setting',
  'school.minority_serving.historically_black',
  'school.men_only',
  'school.women_only',
  'school.religious_affiliation',
  // Admissions
  'latest.admissions.admission_rate.overall',
  'latest.admissions.admission_rate.by_ope_id',
  'latest.admissions.sat_scores.average.overall',
  'latest.admissions.sat_scores.25th_percentile.critical_reading',
  'latest.admissions.sat_scores.75th_percentile.critical_reading',
  'latest.admissions.sat_scores.25th_percentile.math',
  'latest.admissions.sat_scores.75th_percentile.math',
  'latest.admissions.sat_scores.midpoint.critical_reading',
  'latest.admissions.sat_scores.midpoint.math',
  'latest.admissions.act_scores.25th_percentile.cumulative',
  'latest.admissions.act_scores.75th_percentile.cumulative',
  'latest.admissions.act_scores.midpoint.cumulative',
  'latest.admissions.act_scores.midpoint.english',
  'latest.admissions.act_scores.midpoint.math',
  // Student body
  'latest.student.size',
  'latest.student.enrollment.undergrad_12_month',
  'latest.student.enrollment.grad_12_month',
  'latest.student.demographics.race_ethnicity.white',
  'latest.student.demographics.race_ethnicity.black',
  'latest.student.demographics.race_ethnicity.hispanic',
  'latest.student.demographics.race_ethnicity.asian',
  'latest.student.demographics.race_ethnicity.aian',
  'latest.student.demographics.race_ethnicity.nhpi',
  'latest.student.demographics.race_ethnicity.two_or_more',
  'latest.student.demographics.race_ethnicity.non_resident_alien',
  'latest.student.demographics.race_ethnicity.unknown',
  'latest.student.demographics.female_share',
  'latest.student.part_time_share',
  // Retention & completion
  'latest.student.retention_rate.four_year.full_time',
  'latest.student.retention_rate.lt_four_year.full_time',
  'latest.completion.rate_suppressed.four_yr',
  'latest.completion.rate_suppressed.lt_four_yr_150percent',
  // Cost
  'latest.cost.tuition.in_state',
  'latest.cost.tuition.out_of_state',
  'latest.cost.avg_net_price.overall',
  'latest.cost.avg_net_price.public',
  'latest.cost.avg_net_price.private',
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
  'latest.aid.median_debt.completers.overall',
  'latest.aid.median_debt.completers.monthly_payments',
  'latest.aid.pell_grant_rate',
  'latest.aid.federal_loan_rate',
  // Earnings
  'latest.earnings.10_yrs_after_entry.median',
  'latest.earnings.6_yrs_after_entry.median',
  'latest.earnings.8_yrs_after_entry.median_earnings',
].join(',');

// ==========================================
// SCORECARD API FETCHING
// ==========================================

function parseSchoolRecord(s) {
  const type = s['school.type'];
  const isPublic = type === 1;

  // Pick the right net price by income
  const incomePrefix = isPublic
    ? 'latest.cost.net_price.public.by_income_level'
    : 'latest.cost.net_price.private.by_income_level';

  return {
    scorecardId: s['id'],
    name: s['school.name'],
    city: s['school.city'],
    state: s['school.state'],
    url: s['school.school_url'],
    type: isPublic ? 'public' : (type === 2 ? 'private_nonprofit' : 'private_forprofit'),
    carnegieBasic: s['school.carnegie_basic'],
    carnegieSize: s['school.carnegie_size_setting'],
    isHBCU: !!s['school.minority_serving.historically_black'],
    menOnly: !!s['school.men_only'],
    womenOnly: !!s['school.women_only'],
    religiousAffiliation: s['school.religious_affiliation'],
    admissions: {
      acceptanceRate: s['latest.admissions.admission_rate.overall'],
      satAvg: s['latest.admissions.sat_scores.average.overall'],
      sat25thReading: s['latest.admissions.sat_scores.25th_percentile.critical_reading'],
      sat75thReading: s['latest.admissions.sat_scores.75th_percentile.critical_reading'],
      sat25thMath: s['latest.admissions.sat_scores.25th_percentile.math'],
      sat75thMath: s['latest.admissions.sat_scores.75th_percentile.math'],
      satMidReading: s['latest.admissions.sat_scores.midpoint.critical_reading'],
      satMidMath: s['latest.admissions.sat_scores.midpoint.math'],
      act25th: s['latest.admissions.act_scores.25th_percentile.cumulative'],
      act75th: s['latest.admissions.act_scores.75th_percentile.cumulative'],
      actMid: s['latest.admissions.act_scores.midpoint.cumulative'],
      actMidEnglish: s['latest.admissions.act_scores.midpoint.english'],
      actMidMath: s['latest.admissions.act_scores.midpoint.math'],
    },
    studentBody: {
      totalSize: s['latest.student.size'],
      undergradEnrollment: s['latest.student.enrollment.undergrad_12_month'],
      gradEnrollment: s['latest.student.enrollment.grad_12_month'],
      femaleShare: s['latest.student.demographics.female_share'],
      partTimeShare: s['latest.student.part_time_share'],
      demographics: {
        white: s['latest.student.demographics.race_ethnicity.white'],
        black: s['latest.student.demographics.race_ethnicity.black'],
        hispanic: s['latest.student.demographics.race_ethnicity.hispanic'],
        asian: s['latest.student.demographics.race_ethnicity.asian'],
        aian: s['latest.student.demographics.race_ethnicity.aian'],
        nhpi: s['latest.student.demographics.race_ethnicity.nhpi'],
        twoOrMore: s['latest.student.demographics.race_ethnicity.two_or_more'],
        nonResidentAlien: s['latest.student.demographics.race_ethnicity.non_resident_alien'],
        unknown: s['latest.student.demographics.race_ethnicity.unknown'],
      },
    },
    outcomes: {
      retentionRate: s['latest.student.retention_rate.four_year.full_time']
        || s['latest.student.retention_rate.lt_four_year.full_time'],
      gradRate4yr: s['latest.completion.rate_suppressed.four_yr'],
      gradRate150pct: s['latest.completion.rate_suppressed.lt_four_yr_150percent'],
    },
    cost: {
      tuitionInState: s['latest.cost.tuition.in_state'],
      tuitionOutOfState: s['latest.cost.tuition.out_of_state'],
      avgNetPrice: s['latest.cost.avg_net_price.overall']
        || s['latest.cost.avg_net_price.private']
        || s['latest.cost.avg_net_price.public'],
      netPriceByIncome: {
        income0_30k: s[`${incomePrefix}.0-30000`],
        income30_48k: s[`${incomePrefix}.30001-48000`],
        income48_75k: s[`${incomePrefix}.48001-75000`],
        income75_110k: s[`${incomePrefix}.75001-110000`],
        income110kPlus: s[`${incomePrefix}.110001-plus`],
      },
    },
    financialAid: {
      medianDebt: s['latest.aid.median_debt.completers.overall'],
      monthlyPayment: s['latest.aid.median_debt.completers.monthly_payments'],
      pellGrantRate: s['latest.aid.pell_grant_rate'],
      federalLoanRate: s['latest.aid.federal_loan_rate'],
    },
    earnings: {
      median6yr: s['latest.earnings.6_yrs_after_entry.median'],
      median8yr: s['latest.earnings.8_yrs_after_entry.median_earnings'],
      median10yr: s['latest.earnings.10_yrs_after_entry.median'],
    },
    category: getSchoolCategory(s['school.name']),
    hasV1StrategicIntel: V1_SCHOOLS.includes(s['school.name']),
  };
}

async function fetchSchoolData(schoolName, apiKey) {
  const url = `${API_BASE}/schools.json?` + new URLSearchParams({
    'api_key': apiKey,
    'school.name': schoolName,
    'fields': SCHOOL_FIELDS,
    'per_page': '5',
  });

  const data = await fetchJSON(url);
  if (data && data.results && data.results.length > 0) {
    // Find best match (exact or closest)
    const exactMatch = data.results.find(r =>
      r['school.name'].toLowerCase() === schoolName.toLowerCase()
    );
    return parseSchoolRecord(exactMatch || data.results[0]);
  }
  return null;
}

async function fetchProgramsForSchool(schoolName, apiKey) {
  const url = `${API_BASE}/schools.json?` + new URLSearchParams({
    'api_key': apiKey,
    'school.name': schoolName,
    'fields': 'school.name,latest.programs.cip_4_digit',
    'per_page': '1',
  });

  const data = await fetchJSON(url);
  if (data?.results?.[0]) {
    const programs = data.results[0]['latest.programs.cip_4_digit'];
    if (programs && Array.isArray(programs)) {
      return programs
        .filter(p => p['credential.level'] === 3 && p['earnings.median_earnings.latest.overall'])
        .map(p => ({
          name: p.title || 'Unknown',
          cipCode: p.code || '',
          medianEarnings: Math.round(p['earnings.median_earnings.latest.overall'] || 0),
          medianDebt: Math.round(p['debt.median_debt.completers.overall'] || 0),
          completions: p['counts.ipeds_awards2'] || 0,
        }))
        .sort((a, b) => b.medianEarnings - a.medianEarnings);
    }
  }
  return [];
}

// ==========================================
// MAIN SCRAPER
// ==========================================

async function run() {
  if (!API_KEY) {
    console.error('ERROR: DATA_GOV_API_KEY not found in .env');
    console.log('Get a free key at: https://api.data.gov/signup/');
    process.exit(1);
  }

  console.log('===========================================');
  console.log('  Wayfinder Expanded Admissions Scraper');
  console.log(`  Target: ${ALL_SCHOOLS.length} schools`);
  console.log('===========================================\n');

  const results = [];
  const failures = [];
  let fetched = 0;

  // Check for existing partial results (resume support)
  const outputPath = join(__dirname, '..', 'data', 'scraped', 'college-admissions-expanded.json');
  let existing = {};
  try {
    const existingData = JSON.parse(await fs.readFile(outputPath, 'utf-8'));
    if (existingData.schools) {
      for (const s of existingData.schools) {
        existing[s.name] = s;
      }
      console.log(`  Found ${Object.keys(existing).length} existing records, will skip those.\n`);
    }
  } catch { /* no existing file, start fresh */ }

  // Phase 1: Fetch scorecard data for all schools
  console.log('Phase 1: Fetching College Scorecard data...\n');

  for (const schoolName of ALL_SCHOOLS) {
    // Skip if already fetched
    if (existing[schoolName]) {
      results.push(existing[schoolName]);
      fetched++;
      continue;
    }

    try {
      const school = await fetchSchoolData(schoolName, API_KEY);
      if (school) {
        results.push(school);
        fetched++;
        console.log(`  [${fetched}/${ALL_SCHOOLS.length}] ✓ ${school.name} (${school.state})`);
      } else {
        failures.push(schoolName);
        console.log(`  [${fetched}/${ALL_SCHOOLS.length}] ✗ Not found: ${schoolName}`);
      }
      await sleep(250); // Rate limiting — Scorecard allows ~1000/hr
    } catch (err) {
      failures.push(schoolName);
      console.log(`  [${fetched}/${ALL_SCHOOLS.length}] ✗ Error: ${schoolName} — ${err.message}`);
      await sleep(500);
    }
  }

  // Phase 2: Fetch program-level earnings data (top 100 schools by selectivity)
  console.log('\nPhase 2: Fetching program-level data for top schools...\n');

  const topSchools = results
    .filter(s => s.admissions.acceptanceRate && s.admissions.acceptanceRate < 0.40)
    .sort((a, b) => (a.admissions.acceptanceRate || 1) - (b.admissions.acceptanceRate || 1))
    .slice(0, 100);

  let programsFetched = 0;
  for (const school of topSchools) {
    if (school.programs && school.programs.length > 0) {
      programsFetched++;
      continue; // Already has program data
    }

    try {
      const programs = await fetchProgramsForSchool(school.name, API_KEY);
      if (programs.length > 0) {
        school.programs = programs;
        programsFetched++;
        console.log(`  ✓ ${school.name} — ${programs.length} programs with earnings data`);
      }
      await sleep(300);
    } catch (err) {
      console.log(`  ⚠ Programs unavailable: ${school.name}`);
    }
  }

  // Save results
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalSchools: results.length,
      withPrograms: results.filter(s => s.programs?.length > 0).length,
      failedLookups: failures,
      categories: Object.fromEntries(
        Object.entries(SCHOOL_CATEGORIES).map(([cat, schools]) => [
          cat,
          results.filter(s => s.category === cat).length + '/' + schools.length,
        ])
      ),
    },
    schools: results.sort((a, b) =>
      (a.admissions.acceptanceRate || 1) - (b.admissions.acceptanceRate || 1)
    ),
  };

  await saveScrapedData('college-admissions-expanded.json', output);

  // Summary
  console.log('\n===========================================');
  console.log('  SCRAPE COMPLETE');
  console.log(`  Schools fetched: ${results.length}/${ALL_SCHOOLS.length}`);
  console.log(`  With program data: ${output.metadata.withPrograms}`);
  console.log(`  Failed lookups: ${failures.length}`);
  if (failures.length > 0) {
    console.log(`  Failed: ${failures.join(', ')}`);
  }
  console.log('===========================================');
}

run().catch(console.error);
