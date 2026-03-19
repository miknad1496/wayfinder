/**
 * K-12 School Data Expansion Scraper
 *
 * Expands from Seattle-Bellevue metro to major metros across 20+ states.
 * Uses NCES School Search API for baseline data, then enriches with
 * strategic context via Claude.
 *
 * Target: ~500 high schools + ~300 middle schools across key markets
 *
 * Data sources:
 *   - NCES School Search API (free, no key needed for basic queries)
 *   - College Scorecard's school-level data
 *   - Claude enrichment for strategic context
 *
 * Run: node backend/scrapers/k12-expansion-scraper.js [--state=WA] [--enrich]
 *
 * Output: backend/data/scraped/k12-schools-expanded.json
 */

import { fetchJSON, saveScrapedData, sleep } from './utils.js';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

// ==========================================
// TARGET REGIONS — Major metros + college pipeline hubs
// ==========================================

export const TARGET_REGIONS = [
  // West Coast
  { state: 'WA', metros: ['Seattle', 'Bellevue', 'Redmond', 'Kirkland', 'Tacoma', 'Olympia'] },
  { state: 'CA', metros: ['Los Angeles', 'San Francisco', 'San Jose', 'San Diego', 'Sacramento', 'Irvine', 'Palo Alto', 'Berkeley', 'Pasadena', 'Fremont'] },
  { state: 'OR', metros: ['Portland', 'Eugene', 'Salem'] },

  // Mountain / Southwest
  { state: 'CO', metros: ['Denver', 'Boulder', 'Colorado Springs', 'Aurora'] },
  { state: 'AZ', metros: ['Phoenix', 'Scottsdale', 'Tempe', 'Tucson'] },
  { state: 'UT', metros: ['Salt Lake City', 'Provo'] },

  // Texas
  { state: 'TX', metros: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'Plano', 'Frisco', 'Sugar Land'] },

  // Midwest
  { state: 'IL', metros: ['Chicago', 'Naperville', 'Evanston', 'Schaumburg'] },
  { state: 'MI', metros: ['Ann Arbor', 'Detroit', 'Grand Rapids', 'Troy'] },
  { state: 'OH', metros: ['Columbus', 'Cleveland', 'Cincinnati'] },
  { state: 'MN', metros: ['Minneapolis', 'St. Paul', 'Edina'] },
  { state: 'WI', metros: ['Madison', 'Milwaukee'] },
  { state: 'IN', metros: ['Indianapolis', 'Bloomington', 'Carmel'] },

  // Southeast
  { state: 'GA', metros: ['Atlanta', 'Decatur', 'Marietta', 'Alpharetta'] },
  { state: 'FL', metros: ['Miami', 'Tampa', 'Orlando', 'Jacksonville', 'Boca Raton', 'Coral Gables'] },
  { state: 'NC', metros: ['Charlotte', 'Raleigh', 'Durham', 'Chapel Hill'] },
  { state: 'VA', metros: ['Arlington', 'Fairfax', 'Richmond', 'Alexandria', 'McLean', 'Charlottesville'] },
  { state: 'TN', metros: ['Nashville', 'Memphis', 'Knoxville'] },
  { state: 'AL', metros: ['Birmingham', 'Huntsville', 'Montgomery'] },
  { state: 'SC', metros: ['Charleston', 'Columbia', 'Greenville'] },

  // Northeast / Mid-Atlantic
  { state: 'NY', metros: ['New York', 'Brooklyn', 'Bronx', 'Manhattan', 'Albany', 'White Plains', 'Scarsdale', 'Great Neck', 'Ithaca'] },
  { state: 'MA', metros: ['Boston', 'Cambridge', 'Brookline', 'Newton', 'Wellesley', 'Andover', 'Concord'] },
  { state: 'CT', metros: ['Hartford', 'New Haven', 'Greenwich', 'Westport', 'Stamford', 'Darien'] },
  { state: 'NJ', metros: ['Princeton', 'Newark', 'Jersey City', 'Hoboken', 'Montclair', 'Summit', 'Short Hills'] },
  { state: 'PA', metros: ['Philadelphia', 'Pittsburgh', 'State College'] },
  { state: 'MD', metros: ['Baltimore', 'Bethesda', 'Silver Spring', 'Rockville', 'Columbia', 'Potomac'] },
  { state: 'DC', metros: ['Washington'] },
];

// ==========================================
// NCES API
// ==========================================

// NCES doesn't have a simple REST API, but the School Search tool at
// https://nces.ed.gov/ccd/schoolsearch/ provides data.
// We'll use the EDGE (Education Demographic and Geographic Estimates) API
// and supplement with direct NCES data downloads.

const NCES_API = 'https://educationdata.urban.org/api/v1';

async function fetchNCESSchools(state, level = 'high') {
  // Education Data Portal (Urban Institute) — free, no key needed
  // level: 'high' = high schools, 'middle' = middle schools
  const gradeRange = level === 'high'
    ? '&grade_offered_highest=12&grade_offered_lowest_gte=9'
    : '&grade_offered_highest_lte=8&grade_offered_lowest_gte=6';

  const url = `${NCES_API}/schools/ccd/directory/2022/?fips=${getStateFIPS(state)}&school_level=3${level === 'high' ? '' : '&school_level=2'}&school_status=1`;

  try {
    const data = await fetchJSON(url);
    if (data && data.results) {
      return data.results.map(s => ({
        ncesId: s.ncessch,
        name: s.school_name,
        district: s.lea_name,
        city: s.city_location,
        state: s.state_location,
        zip: s.zip_location,
        level: level,
        type: s.charter === 1 ? 'charter' : (s.magnet === 1 ? 'magnet' : 'traditional'),
        enrollment: s.enrollment,
        freeReducedLunch: s.free_or_reduced_price_lunch ?
          ((s.free_or_reduced_price_lunch / s.enrollment) * 100).toFixed(1) + '%' : null,
        titleI: s.title_i_eligible === 1,
        locale: parseLocale(s.urban_centric_locale),
      }));
    }
  } catch (err) {
    console.log(`  ⚠ NCES API error for ${state}: ${err.message}`);
  }
  return [];
}

// FIPS state codes for NCES API
function getStateFIPS(state) {
  const fips = {
    'AL': 1, 'AK': 2, 'AZ': 4, 'AR': 5, 'CA': 6, 'CO': 8, 'CT': 9, 'DC': 11,
    'DE': 10, 'FL': 12, 'GA': 13, 'HI': 15, 'ID': 16, 'IL': 17, 'IN': 18,
    'IA': 19, 'KS': 20, 'KY': 21, 'LA': 22, 'ME': 23, 'MD': 24, 'MA': 25,
    'MI': 26, 'MN': 27, 'MS': 28, 'MO': 29, 'MT': 30, 'NE': 31, 'NV': 32,
    'NH': 33, 'NJ': 34, 'NM': 35, 'NY': 36, 'NC': 37, 'ND': 38, 'OH': 39,
    'OK': 40, 'OR': 41, 'PA': 42, 'RI': 44, 'SC': 45, 'SD': 46, 'TN': 47,
    'TX': 48, 'UT': 49, 'VT': 50, 'VA': 51, 'WA': 53, 'WV': 54, 'WI': 55, 'WY': 56,
  };
  return fips[state] || 0;
}

function parseLocale(code) {
  if (code <= 13) return 'city';
  if (code <= 23) return 'suburb';
  if (code <= 33) return 'town';
  return 'rural';
}

// ==========================================
// ENRICHMENT VIA CLAUDE
// ==========================================

async function enrichSchoolBatch(schools, state) {
  // Only import Anthropic if enrichment is requested
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic();

  const prompt = `You are a K-12 education expert generating school profile data for a college admissions advisory platform. For each school below, provide realistic estimates based on the school's location, enrollment, and type.

State: ${state}
Schools to profile:

${schools.map((s, i) => `${i + 1}. ${s.name} (${s.city}, ${s.district}) — ${s.enrollment?.toLocaleString() || '?'} students, ${s.type}`).join('\n')}

For each school, respond with a JSON array. Each entry should have:
{
  "name": "School Name",
  "averageSAT": "range like 1200-1350 or null if not a high school",
  "averageACT": "range like 26-30 or null",
  "apParticipationRate": "estimated % or null",
  "apPassRate": "estimated % or null",
  "graduationRate": "estimated %",
  "collegeReadiness": "estimated %",
  "notablePrograms": ["3-5 key programs"],
  "ranking": "Niche grade + any known rankings",
  "culture": "1-2 sentence description of school culture and academic environment",
  "collegeDestinations": "Where graduates typically go — types of colleges",
  "insiderTip": "One thing a parent should know about this school for college prep"
}

Be realistic based on demographics and location. Urban Title I schools will have different profiles than suburban magnet schools. Respond with ONLY the JSON array.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text.trim();
    const cleaned = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    const enriched = JSON.parse(cleaned);

    // Merge enrichment back into school records
    for (const enrichment of enriched) {
      const school = schools.find(s => s.name === enrichment.name);
      if (school) {
        Object.assign(school, enrichment);
      }
    }

    return response.usage.input_tokens + response.usage.output_tokens;
  } catch (err) {
    console.log(`  ⚠ Enrichment failed for batch: ${err.message}`);
    return 0;
  }
}

// ==========================================
// METRO FILTERING
// ==========================================

function filterToMetros(schools, metros) {
  const metroLower = metros.map(m => m.toLowerCase());
  return schools.filter(s => {
    const city = (s.city || '').toLowerCase();
    return metroLower.some(m => city.includes(m) || m.includes(city));
  });
}

// ==========================================
// MAIN
// ==========================================

async function run() {
  const args = process.argv.slice(2);
  const targetState = args.find(a => a.startsWith('--state='))?.split('=')[1];
  const doEnrich = args.includes('--enrich');
  const statesOnly = targetState
    ? TARGET_REGIONS.filter(r => r.state === targetState)
    : TARGET_REGIONS;

  console.log('===========================================');
  console.log('  Wayfinder K-12 School Expansion Scraper');
  console.log(`  States: ${statesOnly.map(r => r.state).join(', ')}`);
  console.log(`  Enrichment: ${doEnrich ? 'ON (uses Claude)' : 'OFF (raw data only)'}`);
  console.log('===========================================\n');

  const allHighSchools = [];
  const allMiddleSchools = [];
  let totalTokens = 0;

  // Load existing data for resume support
  const outputPath = join(__dirname, '..', 'data', 'scraped', 'k12-schools-expanded.json');
  let existingStates = new Set();
  try {
    const existing = JSON.parse(await fs.readFile(outputPath, 'utf-8'));
    for (const s of existing.highSchools || []) {
      if (!targetState || s.state !== targetState) {
        allHighSchools.push(s);
        existingStates.add(s.state);
      }
    }
    for (const s of existing.middleSchools || []) {
      if (!targetState || s.state !== targetState) {
        allMiddleSchools.push(s);
      }
    }
    console.log(`  Loaded ${allHighSchools.length} existing HS, ${allMiddleSchools.length} MS records.\n`);
  } catch { /* fresh start */ }

  for (const region of statesOnly) {
    console.log(`\n--- ${region.state}: ${region.metros.join(', ')} ---`);

    // Fetch all high schools in state
    console.log(`  Fetching high schools...`);
    const stateHS = await fetchNCESSchools(region.state, 'high');
    const metroHS = filterToMetros(stateHS, region.metros);
    console.log(`  Found ${stateHS.length} total HS, ${metroHS.length} in target metros`);

    // Fetch all middle schools in state
    console.log(`  Fetching middle schools...`);
    const stateMS = await fetchNCESSchools(region.state, 'middle');
    const metroMS = filterToMetros(stateMS, region.metros);
    console.log(`  Found ${stateMS.length} total MS, ${metroMS.length} in target metros`);

    // Take top schools by enrollment (larger schools = more relevant data)
    const topHS = metroHS
      .sort((a, b) => (b.enrollment || 0) - (a.enrollment || 0))
      .slice(0, 25); // Top 25 HS per state

    const topMS = metroMS
      .sort((a, b) => (b.enrollment || 0) - (a.enrollment || 0))
      .slice(0, 15); // Top 15 MS per state

    // Enrich with Claude if requested
    if (doEnrich && topHS.length > 0) {
      console.log(`  Enriching ${topHS.length} high schools with Claude...`);
      // Process in batches of 10
      for (let i = 0; i < topHS.length; i += 10) {
        const batch = topHS.slice(i, i + 10);
        const tokens = await enrichSchoolBatch(batch, region.state);
        totalTokens += tokens;
        console.log(`    Batch ${Math.floor(i / 10) + 1} done (${tokens} tokens)`);
        await sleep(1000);
      }
    }

    if (doEnrich && topMS.length > 0) {
      console.log(`  Enriching ${topMS.length} middle schools with Claude...`);
      for (let i = 0; i < topMS.length; i += 10) {
        const batch = topMS.slice(i, i + 10);
        const tokens = await enrichSchoolBatch(batch, region.state);
        totalTokens += tokens;
        await sleep(1000);
      }
    }

    allHighSchools.push(...topHS);
    allMiddleSchools.push(...topMS);

    await sleep(500); // Rate limiting between states
  }

  // Save
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      states: statesOnly.map(r => r.state),
      totalHighSchools: allHighSchools.length,
      totalMiddleSchools: allMiddleSchools.length,
      enriched: doEnrich,
      totalTokens,
    },
    highSchools: allHighSchools,
    middleSchools: allMiddleSchools,
  };

  await saveScrapedData('k12-schools-expanded.json', output);

  console.log('\n===========================================');
  console.log('  K-12 EXPANSION COMPLETE');
  console.log(`  High schools: ${allHighSchools.length}`);
  console.log(`  Middle schools: ${allMiddleSchools.length}`);
  console.log(`  States covered: ${new Set(allHighSchools.map(s => s.state)).size}`);
  if (doEnrich) {
    console.log(`  Tokens used: ${totalTokens.toLocaleString()}`);
    console.log(`  Est. cost: ~$${(totalTokens * 0.000015).toFixed(2)}`);
  }
  console.log('===========================================');
}

run().catch(console.error);
