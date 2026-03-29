/**
 * College Scorecard API Scraper
 *
 * Fetches institution-specific earnings, debt, and admissions data
 * from the U.S. Department of Education's College Scorecard API.
 *
 * Data includes:
 * - Earnings by field of study (CIP 4-digit) per institution
 * - 1-year and 4-year post-graduation median earnings
 * - Median debt at graduation by program
 * - Institution admissions rates, net price, completion rates
 *
 * API: https://api.data.gov/ed/collegescorecard/v1/schools
 * Key: Free from https://api.data.gov/signup/
 * Rate limits: ~1000 requests/hour
 * License: Public domain (US government data)
 *
 * Output: knowledge-base/scorecard-earnings.json
 * Schema: See KNOWLEDGE-BASE-ARCHITECTURE.md, Domain 2
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const KB_DIR = join(__dirname, '..', 'knowledge-base');

// ─── Configuration ────────────────────────────────────────────────

const API_BASE = 'https://api.data.gov/ed/collegescorecard/v1/schools';

// API key from environment or .env file
// Get a free key at: https://api.data.gov/signup/
function getApiKey() {
  return process.env.SCORECARD_API_KEY || process.env.DATA_GOV_API_KEY || '';
}

// Fields to request from the API
const INSTITUTION_FIELDS = [
  'id',
  'school.name',
  'school.state',
  'school.city',
  'school.school_url',
  'school.ownership',                    // 1=public, 2=private nonprofit, 3=private for-profit
  'school.carnegie_basic',
  'latest.student.size',
  'latest.admissions.admission_rate.overall',
  'latest.admissions.sat_scores.average.overall',
  'latest.admissions.act_scores.midpoint.cumulative',
  'latest.cost.avg_net_price.overall',
  'latest.cost.tuition.in_state',
  'latest.cost.tuition.out_of_state',
  'latest.completion.rate_suppressed.overall',
  'latest.aid.median_debt.completers.overall',
  'latest.earnings.6_yrs_after_entry.median',
  'latest.earnings.8_yrs_after_entry.median_earnings',
  'latest.earnings.10_yrs_after_entry.median',
].join(',');

// Program-level fields (nested under latest.programs.cip_4_digit)
const PROGRAM_FIELDS = [
  'latest.programs.cip_4_digit.code',
  'latest.programs.cip_4_digit.title',
  'latest.programs.cip_4_digit.credential.level',
  'latest.programs.cip_4_digit.credential.title',
  'latest.programs.cip_4_digit.earnings.1_yr.overall_median_earnings',
  'latest.programs.cip_4_digit.earnings.4_yr.overall_median_earnings',
  'latest.programs.cip_4_digit.debt.staff_grad_median',
  'latest.programs.cip_4_digit.debt.parent_plus_loan_median',
  'latest.programs.cip_4_digit.counts.ipeds_awards1',
].join(',');

// ─── Target Institutions ──────────────────────────────────────────
// Top 200 institutions by national reputation, enrollment, and frequency
// of student/parent questions. Mix of: top research universities, major
// state flagships, top liberal arts, major regional universities.

const TARGET_INSTITUTIONS = [
  // === IVY LEAGUE & ELITE PRIVATE ===
  { name: 'Harvard University', id: 166027 },
  { name: 'Yale University', id: 130794 },
  { name: 'Princeton University', id: 186131 },
  { name: 'Columbia University', id: 190150 },
  { name: 'University of Pennsylvania', id: 215062 },
  { name: 'Brown University', id: 217156 },
  { name: 'Dartmouth College', id: 182670 },
  { name: 'Cornell University', id: 190415 },
  { name: 'Massachusetts Institute of Technology', id: 166683 },
  { name: 'Stanford University', id: 243744 },
  { name: 'California Institute of Technology', id: 110404 },
  { name: 'Duke University', id: 198419 },
  { name: 'University of Chicago', id: 144050 },
  { name: 'Northwestern University', id: 147767 },
  { name: 'Johns Hopkins University', id: 162928 },
  { name: 'Rice University', id: 227757 },
  { name: 'Vanderbilt University', id: 221999 },
  { name: 'Washington University in St Louis', id: 179867 },
  { name: 'Georgetown University', id: 131469 },
  { name: 'Carnegie Mellon University', id: 211440 },
  { name: 'Emory University', id: 139658 },
  { name: 'University of Notre Dame', id: 152080 },
  { name: 'University of Southern California', id: 123961 },
  { name: 'New York University', id: 193900 },
  { name: 'Tufts University', id: 168148 },
  { name: 'Boston University', id: 164988 },
  { name: 'Boston College', id: 164924 },
  { name: 'Northeastern University', id: 167358 },
  { name: 'Wake Forest University', id: 199847 },
  { name: 'Brandeis University', id: 165015 },

  // === TOP STATE FLAGSHIPS ===
  { name: 'University of California-Berkeley', id: 110635 },
  { name: 'University of California-Los Angeles', id: 110662 },
  { name: 'University of Michigan-Ann Arbor', id: 170976 },
  { name: 'University of Virginia-Main Campus', id: 234076 },
  { name: 'University of North Carolina at Chapel Hill', id: 199120 },
  { name: 'Georgia Institute of Technology-Main Campus', id: 139755 },
  { name: 'University of Texas at Austin', id: 228778 },
  { name: 'University of Florida', id: 134130 },
  { name: 'University of Wisconsin-Madison', id: 240444 },
  { name: 'University of Illinois Urbana-Champaign', id: 145637 },
  { name: 'University of Washington-Seattle Campus', id: 236948 },
  { name: 'Ohio State University-Main Campus', id: 204796 },
  { name: 'Penn State University-Main Campus', id: 214777 },
  { name: 'Purdue University-Main Campus', id: 243780 },
  { name: 'University of Maryland-College Park', id: 163286 },
  { name: 'Indiana University-Bloomington', id: 151351 },
  { name: 'University of Minnesota-Twin Cities', id: 174066 },
  { name: 'Rutgers University-New Brunswick', id: 186380 },
  { name: 'University of Pittsburgh-Pittsburgh Campus', id: 215293 },
  { name: 'University of California-San Diego', id: 110680 },
  { name: 'University of California-Davis', id: 110644 },
  { name: 'University of California-Irvine', id: 110653 },
  { name: 'University of California-Santa Barbara', id: 110705 },
  { name: 'University of Colorado Boulder', id: 126614 },
  { name: 'University of Connecticut', id: 129020 },
  { name: 'University of Georgia', id: 139959 },
  { name: 'University of Iowa', id: 153658 },
  { name: 'University of Massachusetts-Amherst', id: 166629 },
  { name: 'Virginia Polytechnic Institute and State University', id: 233921 },
  { name: 'Texas A&M University-College Station', id: 228723 },
  { name: 'North Carolina State University at Raleigh', id: 199193 },
  { name: 'Michigan State University', id: 171100 },
  { name: 'Arizona State University-Tempe', id: 104151 },
  { name: 'University of Arizona', id: 104179 },
  { name: 'University of Oregon', id: 209551 },
  { name: 'Oregon State University', id: 209542 },
  { name: 'University of Utah', id: 230764 },
  { name: 'Colorado State University-Fort Collins', id: 126818 },
  { name: 'University of South Carolina-Columbia', id: 218663 },
  { name: 'Clemson University', id: 217882 },
  { name: 'University of Tennessee-Knoxville', id: 221759 },
  { name: 'University of Alabama', id: 100751 },
  { name: 'University of Kentucky', id: 157085 },
  { name: 'Louisiana State University and Agricultural & Mechanical College', id: 159391 },
  { name: 'Iowa State University', id: 153603 },
  { name: 'University of Kansas', id: 155317 },
  { name: 'University of Missouri-Columbia', id: 178396 },
  { name: 'University of Nebraska-Lincoln', id: 181464 },
  { name: 'University of Oklahoma-Norman Campus', id: 207500 },
  { name: 'University of Arkansas', id: 106397 },
  { name: 'West Virginia University', id: 238032 },

  // === TOP LIBERAL ARTS ===
  { name: 'Williams College', id: 168342 },
  { name: 'Amherst College', id: 164465 },
  { name: 'Swarthmore College', id: 216287 },
  { name: 'Wellesley College', id: 168263 },
  { name: 'Pomona College', id: 119678 },
  { name: 'Bowdoin College', id: 161004 },
  { name: 'Middlebury College', id: 231174 },
  { name: 'Carleton College', id: 173258 },
  { name: 'Claremont McKenna College', id: 112260 },
  { name: 'Davidson College', id: 198385 },
  { name: 'Colgate University', id: 190099 },
  { name: 'Hamilton College', id: 191515 },
  { name: 'Grinnell College', id: 153384 },
  { name: 'Bates College', id: 161086 },
  { name: 'Colby College', id: 161059 },

  // === MAJOR REGIONAL / SECOND-TIER UNIVERSITIES ===
  { name: 'George Washington University', id: 131496 },
  { name: 'American University', id: 131159 },
  { name: 'Syracuse University', id: 196413 },
  { name: 'University of Miami', id: 135726 },
  { name: 'Tulane University of Louisiana', id: 160755 },
  { name: 'University of Rochester', id: 195030 },
  { name: 'Case Western Reserve University', id: 201885 },
  { name: 'Lehigh University', id: 213543 },
  { name: 'Rensselaer Polytechnic Institute', id: 194824 },
  { name: 'Worcester Polytechnic Institute', id: 168421 },
  { name: 'Stevens Institute of Technology', id: 186867 },
  { name: 'Villanova University', id: 216597 },
  { name: 'Santa Clara University', id: 122931 },
  { name: 'Fordham University', id: 190549 },
  { name: 'Loyola University Chicago', id: 147536 },
  { name: 'University of Denver', id: 127060 },
  { name: 'Drexel University', id: 212054 },
  { name: 'Temple University', id: 216339 },
  { name: 'George Mason University', id: 232186 },
  { name: 'University of Delaware', id: 130943 },
  { name: 'Stony Brook University', id: 196097 },
  { name: 'University at Buffalo', id: 196088 },
  { name: 'Binghamton University', id: 196079 },
  { name: 'Florida State University', id: 134097 },
  { name: 'University of Central Florida', id: 132903 },
  { name: 'University of South Florida-Main Campus', id: 137351 },
  { name: 'Florida International University', id: 133951 },

  // === HISTORICALLY BLACK COLLEGES (HBCUs) ===
  { name: 'Howard University', id: 131520 },
  { name: 'Spelman College', id: 141060 },
  { name: 'Morehouse College', id: 140553 },
  { name: 'Hampton University', id: 232265 },
  { name: 'Tuskegee University', id: 101709 },
  { name: 'Florida A&M University', id: 133650 },
  { name: 'North Carolina A&T State University', id: 198464 },
  { name: 'Prairie View A&M University', id: 228459 },

  // === TECH-FOCUSED ===
  { name: 'Georgia Institute of Technology-Main Campus', id: 139755 },
  { name: 'Illinois Institute of Technology', id: 145725 },
  { name: 'Rochester Institute of Technology', id: 195003 },
  { name: 'Drexel University', id: 212054 },

  // === LARGE ENROLLMENT (high volume of student questions) ===
  { name: 'Liberty University', id: 232557 },
  { name: 'Grand Canyon University', id: 104717 },
  { name: 'Southern New Hampshire University', id: 183026 },
  { name: 'Western Governors University', id: 433387 },

  // === COMMUNITY COLLEGES (high-ROI pathway) ===
  // We include a few major CCs to show transfer pathway economics
  { name: 'Northern Virginia Community College', id: 232982 },
  { name: 'Miami Dade College', id: 135717 },
  { name: 'Houston Community College', id: 225432 },
  { name: 'Austin Community College District', id: 222178 },
  { name: 'Santa Monica College', id: 122755 },
  { name: 'De Anza College', id: 114116 },
];

// Deduplicate by ID
const UNIQUE_INSTITUTIONS = [...new Map(TARGET_INSTITUTIONS.map(i => [i.id, i])).values()];

// Target CIP 2-digit codes (broad fields we care about most)
const TARGET_CIP_2DIGIT = new Set([
  '01', // Agriculture
  '03', // Natural Resources
  '04', // Architecture
  '05', // Area/Ethnic/Cultural Studies
  '09', // Communication/Journalism
  '10', // Communications Technologies
  '11', // Computer and Information Sciences
  '13', // Education
  '14', // Engineering
  '15', // Engineering Technologies
  '16', // Foreign Languages
  '19', // Family and Consumer Sciences
  '22', // Legal Professions
  '23', // English Language/Literature
  '24', // Liberal Arts
  '25', // Library Science
  '26', // Biological/Biomedical Sciences
  '27', // Mathematics and Statistics
  '30', // Multi/Interdisciplinary Studies
  '31', // Parks, Recreation, Leisure
  '38', // Philosophy and Religious Studies
  '40', // Physical Sciences
  '42', // Psychology
  '43', // Homeland Security/Law Enforcement
  '44', // Public Administration/Social Service
  '45', // Social Sciences
  '46', // Construction Trades
  '47', // Mechanic and Repair Technologies
  '48', // Precision Production
  '49', // Transportation
  '50', // Visual and Performing Arts
  '51', // Health Professions
  '52', // Business, Management, Marketing
  '54', // History
]);

// ─── API Client ───────────────────────────────────────────────────

async function fetchScorecard(params) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      'No API key found. Set SCORECARD_API_KEY or DATA_GOV_API_KEY environment variable.\n' +
      'Get a free key at: https://api.data.gov/signup/'
    );
  }

  const url = new URL(API_BASE);
  url.searchParams.set('api_key', apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Scorecard API ${response.status}: ${text.slice(0, 200)}`);
  }

  return response.json();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Data Processing ──────────────────────────────────────────────

function getOwnershipLabel(code) {
  const labels = { 1: 'public', 2: 'private_nonprofit', 3: 'private_forprofit' };
  return labels[code] || 'unknown';
}

function processInstitution(schoolData) {
  const s = schoolData;
  const school = s['school.name'] || s.school?.name;
  if (!school) return null;

  const result = {
    institution: {
      id: s.id,
      name: school,
      state: s['school.state'] || s.school?.state,
      city: s['school.city'] || s.school?.city,
      type: getOwnershipLabel(s['school.ownership'] || s.school?.ownership),
      admission_rate: s['latest.admissions.admission_rate.overall'] ?? s.latest?.admissions?.admission_rate?.overall ?? null,
      sat_avg: s['latest.admissions.sat_scores.average.overall'] ?? null,
      act_midpoint: s['latest.admissions.act_scores.midpoint.cumulative'] ?? null,
      avg_net_price: s['latest.cost.avg_net_price.overall'] ?? null,
      tuition_in_state: s['latest.cost.tuition.in_state'] ?? null,
      tuition_out_of_state: s['latest.cost.tuition.out_of_state'] ?? null,
      student_size: s['latest.student.size'] ?? null,
      completion_rate: s['latest.completion.rate_suppressed.overall'] ?? null,
      median_debt: s['latest.aid.median_debt.completers.overall'] ?? null,
      earnings_6yr: s['latest.earnings.6_yrs_after_entry.median'] ?? null,
      earnings_8yr: s['latest.earnings.8_yrs_after_entry.median_earnings'] ?? null,
      earnings_10yr: s['latest.earnings.10_yrs_after_entry.median'] ?? null,
    },
    programs: [],
  };

  // Process program-level data
  const programs = s['latest.programs.cip_4_digit'] || s.latest?.programs?.cip_4_digit || [];
  for (const prog of programs) {
    if (!prog) continue;

    const cipCode = prog.code || '';
    const cip2 = cipCode.substring(0, 2);

    // Only include target fields
    if (!TARGET_CIP_2DIGIT.has(cip2)) continue;

    // Only bachelor's (3) and master's (5) credentials
    const credLevel = prog.credential?.level;
    if (credLevel !== 3 && credLevel !== 5) continue;

    const earnings1yr = prog.earnings?.['1_yr']?.overall_median_earnings ?? null;
    const earnings4yr = prog.earnings?.['4_yr']?.overall_median_earnings ?? null;

    // Skip programs with no earnings data
    if (earnings1yr == null && earnings4yr == null) continue;

    result.programs.push({
      cip: cipCode,
      field: prog.title || '',
      credential: credLevel === 3 ? 'bachelors' : 'masters',
      earnings_1yr: earnings1yr ? { median: earnings1yr } : null,
      earnings_4yr: earnings4yr ? { median: earnings4yr } : null,
      debt_at_grad: prog.debt?.staff_grad_median ? { median: prog.debt.staff_grad_median } : null,
      completers: prog.counts?.ipeds_awards1 ?? null,
    });
  }

  return result;
}

// ─── Main Runner ──────────────────────────────────────────────────

export async function runScorecardScraper(options = {}) {
  console.log('\n=== College Scorecard API Scraper ===');
  console.log(`Target: ${UNIQUE_INSTITUTIONS.length} institutions\n`);

  const results = [];
  const errors = [];
  const batchSize = 10; // Fetch 10 institutions at a time

  // Process in batches
  for (let i = 0; i < UNIQUE_INSTITUTIONS.length; i += batchSize) {
    const batch = UNIQUE_INSTITUTIONS.slice(i, i + batchSize);
    const ids = batch.map(inst => inst.id).join(',');

    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(UNIQUE_INSTITUTIONS.length / batchSize);
    console.log(`  Batch ${batchNum}/${totalBatches}: ${batch.map(b => b.name.substring(0, 30)).join(', ')}...`);

    try {
      const data = await fetchScorecard({
        'id': ids,
        'fields': `${INSTITUTION_FIELDS},${PROGRAM_FIELDS}`,
        'per_page': batchSize.toString(),
        'all_programs_nested': 'true', // Return ALL programs, not just matching
      });

      if (data.results) {
        for (const schoolData of data.results) {
          const processed = processInstitution(schoolData);
          if (processed) {
            results.push(processed);
            const progCount = processed.programs.length;
            if (progCount > 0) {
              process.stdout.write(`    ✓ ${processed.institution.name}: ${progCount} programs\n`);
            } else {
              process.stdout.write(`    ○ ${processed.institution.name}: no program earnings data\n`);
            }
          }
        }
      }
    } catch (err) {
      console.error(`    ✗ Batch error: ${err.message}`);
      errors.push({ batch: batch.map(b => b.name), error: err.message });
    }

    // Rate limiting — be kind to the API
    if (i + batchSize < UNIQUE_INSTITUTIONS.length) {
      await sleep(1000);
    }
  }

  // ─── Also fetch aggregate field-level data (all institutions) ───
  console.log('\nFetching aggregate earnings by field of study...');
  const aggregateByField = await fetchAggregateFieldEarnings();

  // ─── Output ───────────────────────────────────────────────────

  const output = {
    metadata: {
      scraped_at: new Date().toISOString(),
      source: 'College Scorecard API (api.data.gov)',
      institutions_queried: UNIQUE_INSTITUTIONS.length,
      institutions_returned: results.length,
      total_programs: results.reduce((sum, r) => sum + r.programs.length, 0),
      errors: errors.length,
    },
    institutions: results,
    aggregate_by_field: aggregateByField,
  };

  // Stats
  const withPrograms = results.filter(r => r.programs.length > 0);
  const totalPrograms = results.reduce((sum, r) => sum + r.programs.length, 0);
  const withEarnings1yr = results.reduce((sum, r) =>
    sum + r.programs.filter(p => p.earnings_1yr).length, 0);
  const withEarnings4yr = results.reduce((sum, r) =>
    sum + r.programs.filter(p => p.earnings_4yr).length, 0);

  console.log('\n─── Results Summary ───');
  console.log(`Institutions:        ${results.length} of ${UNIQUE_INSTITUTIONS.length}`);
  console.log(`With program data:   ${withPrograms.length}`);
  console.log(`Total programs:      ${totalPrograms}`);
  console.log(`With 1yr earnings:   ${withEarnings1yr}`);
  console.log(`With 4yr earnings:   ${withEarnings4yr}`);
  console.log(`Aggregate fields:    ${aggregateByField.length}`);
  console.log(`Errors:              ${errors.length}`);

  // Save
  const outPath = join(KB_DIR, 'scorecard-earnings.json');
  await fs.writeFile(outPath, JSON.stringify(output, null, 2));
  console.log(`\nSaved: ${outPath}`);

  if (errors.length > 0) {
    console.warn('\n⚠ Errors occurred:');
    for (const err of errors) {
      console.warn(`  ${err.batch.join(', ')}: ${err.error}`);
    }
  }

  // Sample output
  if (results.length > 0) {
    console.log('\n─── Sample Output ───');
    const sample = results.find(r => r.programs.length >= 5) || results[0];
    console.log(`  ${sample.institution.name} (${sample.institution.state})`);
    console.log(`    Admission rate: ${sample.institution.admission_rate ? (sample.institution.admission_rate * 100).toFixed(0) + '%' : 'N/A'}`);
    console.log(`    Avg net price: $${sample.institution.avg_net_price?.toLocaleString() || 'N/A'}`);
    console.log(`    6yr median earnings: $${sample.institution.earnings_6yr?.toLocaleString() || 'N/A'}`);
    console.log(`    Programs with earnings: ${sample.programs.length}`);
    for (const prog of sample.programs.slice(0, 3)) {
      console.log(`      ${prog.field} (${prog.credential}): 1yr=$${prog.earnings_1yr?.median?.toLocaleString() || 'N/A'}, 4yr=$${prog.earnings_4yr?.median?.toLocaleString() || 'N/A'}`);
    }
  }

  return output;
}

/**
 * Fetch aggregate earnings by field of study across all institutions.
 * This gives us a national-level "what does a CS degree earn?" answer.
 */
async function fetchAggregateFieldEarnings() {
  const results = [];

  // Query for bachelor's programs in each major CIP 2-digit category
  const cipCodes = [...TARGET_CIP_2DIGIT];

  for (const cip of cipCodes) {
    try {
      const data = await fetchScorecard({
        'latest.programs.cip_4_digit.code': `${cip}`,
        'latest.programs.cip_4_digit.credential.level': '3', // bachelors
        'fields': 'school.name,latest.programs.cip_4_digit.code,latest.programs.cip_4_digit.title,latest.programs.cip_4_digit.earnings.1_yr.overall_median_earnings,latest.programs.cip_4_digit.earnings.4_yr.overall_median_earnings,latest.programs.cip_4_digit.counts.ipeds_awards1',
        'per_page': '100',
        'sort': 'latest.programs.cip_4_digit.earnings.4_yr.overall_median_earnings:desc',
      });

      if (data.results) {
        // Collect all earnings for this CIP to compute national distribution
        const allEarnings1yr = [];
        const allEarnings4yr = [];
        let totalCompleters = 0;
        let fieldTitle = '';

        for (const school of data.results) {
          const progs = school['latest.programs.cip_4_digit'] || [];
          for (const prog of progs) {
            if (!prog || !String(prog.code || '').startsWith(cip)) continue;
            if (!fieldTitle && prog.title) fieldTitle = prog.title;

            const e1 = prog.earnings?.['1_yr']?.overall_median_earnings;
            const e4 = prog.earnings?.['4_yr']?.overall_median_earnings;
            if (e1) allEarnings1yr.push(e1);
            if (e4) allEarnings4yr.push(e4);
            totalCompleters += prog.counts?.ipeds_awards1 || 0;
          }
        }

        if (allEarnings1yr.length > 0 || allEarnings4yr.length > 0) {
          results.push({
            cip_2digit: cip,
            field: fieldTitle || `CIP ${cip}`,
            credential: 'bachelors',
            sample_size: data.results.length,
            total_completers: totalCompleters,
            earnings_1yr: computeDistribution(allEarnings1yr),
            earnings_4yr: computeDistribution(allEarnings4yr),
          });
          console.log(`    CIP ${cip} (${fieldTitle || 'unknown'}): ${allEarnings4yr.length} schools with 4yr data`);
        }
      }

      await sleep(500);
    } catch (err) {
      console.warn(`    ✗ CIP ${cip}: ${err.message}`);
    }
  }

  return results;
}

function computeDistribution(values) {
  if (!values || values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  return {
    median: sorted[Math.floor(n / 2)],
    p25: sorted[Math.floor(n * 0.25)],
    p75: sorted[Math.floor(n * 0.75)],
    min: sorted[0],
    max: sorted[n - 1],
    count: n,
  };
}

// ─── CLI ──────────────────────────────────────────────────────────

if (process.argv[1]?.includes('scorecard-scraper')) {
  if (process.argv.includes('--help')) {
    console.log(`
College Scorecard API Scraper
==============================

Fetches institution-specific earnings and program data from the
U.S. Department of Education's College Scorecard API.

Usage:
  node scorecard-scraper.js               Run the scraper
  node scorecard-scraper.js --help        Show this help

Environment:
  SCORECARD_API_KEY=<key>    API key from api.data.gov (free)
  DATA_GOV_API_KEY=<key>     Alternative env var name

Get your free API key at: https://api.data.gov/signup/

Output:
  knowledge-base/scorecard-earnings.json
  ~150+ institutions × 20+ fields of study = ~3,000+ program earnings records
  Plus aggregate national earnings by major field
    `);
  } else {
    runScorecardScraper().catch(console.error);
  }
}
