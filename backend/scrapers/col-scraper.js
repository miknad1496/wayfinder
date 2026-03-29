/**
 * Cost of Living / Regional Price Parities Scraper
 *
 * Fetches Regional Price Parities (RPPs) from the Bureau of Economic Analysis
 * (BEA) API. RPPs measure the differences in the price levels of goods and
 * services across states and metropolitan areas, enabling salary comparisons
 * adjusted for purchasing power.
 *
 * Example: A $100K salary in SF (RPP ~128) buys what $78K buys nationally.
 *
 * Data source: https://apps.bea.gov/api/
 * Key: Free from https://apps.bea.gov/API/signup/
 * Rate limits: Generous (100 requests/minute)
 * License: Public domain (US government data)
 *
 * Output: knowledge-base/cost-of-living.json
 * Schema: See KNOWLEDGE-BASE-ARCHITECTURE.md, Domain 6
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const KB_DIR = join(__dirname, '..', 'knowledge-base');

// ─── Configuration ────────────────────────────────────────────────

const BEA_BASE = 'https://apps.bea.gov/api/data';

function getApiKey() {
  return process.env.BEA_API_KEY || '';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── BEA API Client ──────────────────────────────────────────────

async function fetchBEA(params) {
  const key = getApiKey();
  if (!key) {
    throw new Error(
      'No BEA_API_KEY set. Get a free key at: https://apps.bea.gov/API/signup/'
    );
  }

  const url = new URL(BEA_BASE);
  url.searchParams.set('UserID', key);
  url.searchParams.set('method', 'GetData');
  url.searchParams.set('ResultFormat', 'JSON');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`BEA API ${response.status}: ${await response.text()}`);
  }

  const json = await response.json();

  // Debug: log response structure on first call
  if (!fetchBEA._logged) {
    fetchBEA._logged = true;
    const keys = Object.keys(json);
    console.log(`    [DEBUG] BEA response top keys: ${keys.join(', ')}`);
    const beaapi = json.BEAAPI || json.beaapi;
    if (beaapi) {
      console.log(`    [DEBUG] BEAAPI keys: ${Object.keys(beaapi).join(', ')}`);
      const results = beaapi.Results || beaapi.results;
      if (results) {
        console.log(`    [DEBUG] Results keys: ${Object.keys(results).join(', ')}`);
      }
    }
  }

  // Check for errors (handle both cases)
  const beaapi = json.BEAAPI || json.beaapi || {};
  if (beaapi.Error || beaapi.error) {
    const err = beaapi.Error || beaapi.error;
    throw new Error(`BEA API error: ${err.APIErrorDescription || err.Description || JSON.stringify(err)}`);
  }

  // Handle multiple possible response structures
  const results = beaapi.Results || beaapi.results || {};

  // Check for error nested inside Results (BEA sometimes puts it here)
  if (results.Error || results.error) {
    const err = results.Error || results.error;
    const msg = err.APIErrorDescription || err.Description || err.ErrorDetail || JSON.stringify(err);
    console.error(`    ✗ BEA API error in Results: ${msg}`);
    throw new Error(`BEA API error: ${msg}`);
  }

  const data = results.Data || results.data || [];

  if (data.length === 0) {
    console.warn(`    ⚠ BEA API returned empty data. Full response:\n${JSON.stringify(json, null, 2).slice(0, 2000)}`);
  }

  return data;
}

// ─── Data Fetching ───────────────────────────────────────────────

/**
 * Fetch Regional Price Parities by state.
 * DatasetName: Regional
 * TableName: SARPP (State Annual RPPs)
 * LineCode: 1 = All items
 * LineCode: 2 = Goods
 * LineCode: 3 = Services: Housing
 * LineCode: 4 = Services: Utilities
 */
async function fetchStateRPPs() {
  console.log('  Fetching state-level RPPs...');

  try {
    // Get all-items RPP for all states, most recent year
    const allItems = await fetchBEA({
      DatasetName: 'Regional',
      TableName: 'SARPP',
      LineCode: '1', // All items RPP
      GeoFips: 'STATE',
      Year: 'LAST5',
    });

    await sleep(500);

    // Get housing RPP
    const housing = await fetchBEA({
      DatasetName: 'Regional',
      TableName: 'SARPP',
      LineCode: '3', // Housing
      GeoFips: 'STATE',
      Year: 'LAST5',
    });

    // Process into state map
    const states = {};

    for (const row of allItems) {
      const fips = row.GeoFips;
      const name = row.GeoName;
      if (!fips || fips === '00000') continue; // Skip national

      if (!states[fips]) {
        states[fips] = { name, fips, rpp: null, rpp_housing: null, years: {} };
      }
      states[fips].years[row.TimePeriod] = parseFloat(row.DataValue) || null;

      // Use the most recent year
      const val = parseFloat(row.DataValue);
      if (val && (!states[fips].rpp || parseInt(row.TimePeriod) > (states[fips]._year || 0))) {
        states[fips].rpp = val;
        states[fips]._year = parseInt(row.TimePeriod);
      }
    }

    for (const row of housing) {
      const fips = row.GeoFips;
      if (states[fips]) {
        const val = parseFloat(row.DataValue);
        if (val) states[fips].rpp_housing = val;
      }
    }

    // Clean up and format
    return Object.values(states).map(s => {
      delete s._year;
      const rppNonHousing = s.rpp && s.rpp_housing
        ? Math.round((s.rpp * 2 - s.rpp_housing) * 10) / 10 // Approximate
        : null;

      return {
        name: s.name,
        fips: s.fips,
        rpp: s.rpp,
        rpp_housing: s.rpp_housing,
        rpp_nonhousing: rppNonHousing,
        interpretation: s.rpp
          ? (s.rpp > 100
            ? `Costs ${(s.rpp - 100).toFixed(1)}% above national average`
            : `Costs ${(100 - s.rpp).toFixed(1)}% below national average`)
          : null,
        salary_equivalent: s.rpp
          ? {
              '100000_nominal': Math.round(100000 * (100 / s.rpp)),
              note: `$100K here buys what $${Math.round(100000 * (100 / s.rpp)).toLocaleString()} buys nationally`,
            }
          : null,
      };
    });
  } catch (err) {
    console.error(`    ✗ State RPPs failed: ${err.message}`);
    if (err.stack) console.error(`      ${err.stack.split('\n').slice(1, 3).join('\n      ')}`);
    return [];
  }
}

/**
 * Fetch RPPs for metropolitan statistical areas.
 * Uses MARPP table.
 */
async function fetchMetroRPPs() {
  console.log('  Fetching metro-level RPPs...');

  try {
    const allItems = await fetchBEA({
      DatasetName: 'Regional',
      TableName: 'MARPP',
      LineCode: '1', // All items
      GeoFips: 'MSA',
      Year: 'LAST5',
    });

    await sleep(500);

    const housing = await fetchBEA({
      DatasetName: 'Regional',
      TableName: 'MARPP',
      LineCode: '3', // Housing
      GeoFips: 'MSA',
      Year: 'LAST5',
    });

    const metros = {};

    for (const row of allItems) {
      const fips = row.GeoFips;
      const name = row.GeoName;
      if (!fips) continue;

      if (!metros[fips]) {
        metros[fips] = { name, fips, rpp: null, rpp_housing: null };
      }
      const val = parseFloat(row.DataValue);
      if (val && (!metros[fips].rpp || parseInt(row.TimePeriod) > (metros[fips]._year || 0))) {
        metros[fips].rpp = val;
        metros[fips]._year = parseInt(row.TimePeriod);
      }
    }

    for (const row of housing) {
      const fips = row.GeoFips;
      if (metros[fips]) {
        const val = parseFloat(row.DataValue);
        if (val) metros[fips].rpp_housing = val;
      }
    }

    return Object.values(metros).map(m => {
      delete m._year;
      return {
        metro: m.name,
        fips: m.fips,
        rpp: m.rpp,
        rpp_housing: m.rpp_housing,
        rpp_nonhousing: m.rpp && m.rpp_housing
          ? Math.round((m.rpp * 2 - m.rpp_housing) * 10) / 10
          : null,
        interpretation: m.rpp
          ? (m.rpp > 100
            ? `Costs ${(m.rpp - 100).toFixed(1)}% above national average`
            : `Costs ${(100 - m.rpp).toFixed(1)}% below national average`)
          : null,
        salary_equivalent: m.rpp
          ? {
              '100000_nominal': Math.round(100000 * (100 / m.rpp)),
              note: `$100K here buys what $${Math.round(100000 * (100 / m.rpp)).toLocaleString()} buys nationally`,
            }
          : null,
      };
    });
  } catch (err) {
    console.error(`    ✗ Metro RPPs failed: ${err.message}`);
    if (err.stack) console.error(`      ${err.stack.split('\n').slice(1, 3).join('\n      ')}`);
    return [];
  }
}

// ─── Main Runner ──────────────────────────────────────────────────

export async function runCOLScraper() {
  console.log('\n=== Cost of Living / Regional Price Parities Scraper ===\n');

  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('ERROR: Set BEA_API_KEY environment variable.');
    console.error('Get a free key at: https://apps.bea.gov/API/signup/');
    return null;
  }

  const states = await fetchStateRPPs();
  console.log(`    Got ${states.length} states`);

  await sleep(1000);

  const metros = await fetchMetroRPPs();
  console.log(`    Got ${metros.length} metros`);

  const output = {
    metadata: {
      scraped_at: new Date().toISOString(),
      source: 'BEA Regional Price Parities (RPPs)',
      api: BEA_BASE,
      note: 'RPP of 100 = national average. >100 means higher cost of living.',
    },
    states,
    metros,
  };

  // Save
  const outPath = join(KB_DIR, 'cost-of-living.json');
  await fs.writeFile(outPath, JSON.stringify(output, null, 2));

  console.log('\n─── Results Summary ───');
  console.log(`States:   ${states.length}`);
  console.log(`Metros:   ${metros.length}`);

  // Show highest/lowest
  if (states.length > 0) {
    const sorted = states.filter(s => s.rpp).sort((a, b) => b.rpp - a.rpp);
    console.log('\nHighest cost states:');
    for (const s of sorted.slice(0, 5)) {
      console.log(`  ${s.name}: RPP ${s.rpp} — ${s.interpretation}`);
    }
    console.log('Lowest cost states:');
    for (const s of sorted.slice(-5)) {
      console.log(`  ${s.name}: RPP ${s.rpp} — ${s.interpretation}`);
    }
  }

  if (metros.length > 0) {
    const sorted = metros.filter(m => m.rpp).sort((a, b) => b.rpp - a.rpp);
    console.log('\nHighest cost metros:');
    for (const m of sorted.slice(0, 5)) {
      console.log(`  ${m.metro}: RPP ${m.rpp} — ${m.interpretation}`);
    }
  }

  console.log(`\nSaved: ${outPath}`);
  return output;
}

// ─── CLI ──────────────────────────────────────────────────────────

if (process.argv[1]?.includes('col-scraper')) {
  if (process.argv.includes('--help')) {
    console.log(`
Cost of Living / Regional Price Parities Scraper
==================================================

Fetches Regional Price Parities from the BEA API to enable
geographic salary comparisons.

Usage:
  node col-scraper.js              Run the scraper
  node col-scraper.js --help       Show this help

Environment:
  BEA_API_KEY=<key>    API key from BEA (free, required)
                       Get at: https://apps.bea.gov/API/signup/

Output:
  knowledge-base/cost-of-living.json
  50 states + 380+ metros with RPP indices
    `);
  } else {
    runCOLScraper().catch(console.error);
  }
}
