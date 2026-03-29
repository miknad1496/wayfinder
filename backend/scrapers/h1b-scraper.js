/**
 * H1B LCA Disclosure Data Scraper
 *
 * Processes H-1B Labor Condition Application (LCA) disclosure files
 * published by the U.S. Department of Labor's Office of Foreign Labor
 * Certification (OFLC). These are public records containing millions of
 * salary records with employer names, SOC codes, and worksite locations.
 *
 * Data source: https://www.dol.gov/agencies/eta/foreign-labor/performance
 * Also: https://lcr-pjr.doleta.gov/
 * License: Public records (US government)
 * Update frequency: Quarterly
 *
 * Output: knowledge-base/h1b-compensation.json
 * Schema: See KNOWLEDGE-BASE-ARCHITECTURE.md, Domain 4
 *
 * USAGE:
 *   1. Download LCA disclosure data from DOL:
 *      https://www.dol.gov/agencies/eta/foreign-labor/performance
 *      → Look for "H-1B" under "Disclosure Data" → Download Excel/CSV
 *   2. Run: node h1b-scraper.js --from-file <path-to-lca-disclosure.xlsx>
 *
 * The disclosure files are large (500K+ rows). This scraper filters to
 * target SOC codes and aggregates by company and metro area.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const KB_DIR = join(__dirname, '..', 'knowledge-base');

// ─── Configuration ────────────────────────────────────────────────

// Target SOC codes — tech and high-demand professional roles
// that students/career changers frequently ask about
const TARGET_SOC_PREFIXES = [
  '15-', // Computer and Mathematical
  '17-', // Architecture and Engineering
  '11-3021', // Computer and Information Systems Managers
  '11-2021', // Marketing Managers
  '11-2022', // Sales Managers
  '11-3031', // Financial Managers
  '11-9041', // Architectural and Engineering Managers
  '11-9111', // Medical and Health Services Managers
  '13-1111', // Management Analysts
  '13-2051', // Financial and Investment Analysts
  '13-2052', // Personal Financial Advisors
  '13-2011', // Accountants and Auditors
  '13-1082', // Project Management Specialists
  '13-1161', // Market Research Analysts
  '19-1042', // Medical Scientists
  '19-2031', // Chemists
  '19-4021', // Biological Technicians
  '25-1011', // Business Teachers, Postsecondary
  '25-1021', // Computer Science Teachers, Postsecondary
  '29-1071', // Physician Assistants
  '29-1141', // Registered Nurses
  '29-1171', // Nurse Practitioners
  '29-1228', // Physicians, All Other
  '41-9031', // Sales Engineers
];

function isTargetSOC(socCode) {
  if (!socCode) return false;
  const code = String(socCode).trim();
  return TARGET_SOC_PREFIXES.some(prefix => code.startsWith(prefix));
}

// Top 50 employers by H1B volume (tech + consulting + finance)
// These are the companies students ask about most
const PRIORITY_EMPLOYERS = new Set([
  'GOOGLE', 'AMAZON', 'META', 'APPLE', 'MICROSOFT', 'NVIDIA',
  'TESLA', 'NETFLIX', 'SALESFORCE', 'ORACLE', 'IBM', 'INTEL',
  'CISCO', 'ADOBE', 'VMWARE', 'UBER', 'LYFT', 'AIRBNB',
  'SNAP', 'TWITTER', 'STRIPE', 'SQUARE', 'BLOCK', 'PAYPAL',
  'COINBASE', 'ROBINHOOD', 'PALANTIR', 'SNOWFLAKE', 'DATABRICKS',
  'DATADOG', 'CLOUDFLARE', 'SERVICENOW', 'WORKDAY', 'SPLUNK',
  'QUALCOMM', 'BROADCOM', 'AMD', 'SAMSUNG',
  'INFOSYS', 'TATA', 'TCS', 'WIPRO', 'COGNIZANT', 'HCL', 'CAPGEMINI',
  'DELOITTE', 'ACCENTURE', 'KPMG', 'ERNST', 'PRICEWATERHOUSECOOPERS',
  'MCKINSEY', 'BCG', 'BAIN',
  'JPMORGAN', 'GOLDMAN', 'MORGAN STANLEY', 'BANK OF AMERICA', 'CITIGROUP',
  'WELLS FARGO', 'BARCLAYS', 'DEUTSCHE BANK', 'CREDIT SUISSE', 'UBS',
  'AMAZON WEB SERVICES', 'GOOGLE LLC', 'META PLATFORMS',
  'WALMART', 'TARGET', 'COSTCO',
  'JOHNSON & JOHNSON', 'PFIZER', 'MERCK', 'ABBVIE', 'ELI LILLY',
  'MAYO CLINIC', 'KAISER', 'CLEVELAND CLINIC',
]);

function normalizeEmployer(name) {
  if (!name) return '';
  let n = name.toUpperCase().trim();
  // Normalize common variations
  n = n.replace(/,?\s*(INC\.?|LLC\.?|L\.?L\.?C\.?|CORP\.?|CORPORATION|COMPANY|CO\.?|LTD\.?|LIMITED|INCORPORATED|PLC)\.?\s*$/gi, '');
  n = n.replace(/\s+/g, ' ').trim();
  return n;
}

function isPriorityEmployer(normalizedName) {
  return PRIORITY_EMPLOYERS.has(normalizedName) ||
    [...PRIORITY_EMPLOYERS].some(pe => normalizedName.includes(pe));
}

// ─── Data Processing ──────────────────────────────────────────────

function annualizeWage(wage, unit) {
  if (!wage || wage <= 0) return null;
  const u = String(unit || '').toLowerCase();
  if (u.includes('year') || u.includes('annual')) return wage;
  if (u.includes('month')) return wage * 12;
  if (u.includes('bi-week') || u.includes('biweek')) return wage * 26;
  if (u.includes('week')) return wage * 52;
  if (u.includes('hour')) return wage * 2080; // 40hrs × 52 weeks
  // If no unit and wage > 1000, assume annual
  if (wage > 1000) return wage;
  return null;
}

function percentile(arr, p) {
  if (!arr.length) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * p);
  return sorted[Math.min(idx, sorted.length - 1)];
}

/**
 * Process H1B LCA disclosure records.
 * Expects an array of row objects from the Excel/CSV file.
 *
 * Column names vary by fiscal year but generally include:
 * - EMPLOYER_NAME / EMPLOYER_BUSINESS_NAME
 * - SOC_CODE / SOC_CODE_2_DIG / SOC_TITLE
 * - WAGE_RATE_OF_PAY_FROM / WAGE_RATE_OF_PAY
 * - WAGE_UNIT_OF_PAY / UNIT_OF_PAY
 * - WORKSITE_CITY / WORKSITE_STATE / WORKSITE_POSTAL_CODE
 * - CASE_STATUS
 * - FULL_TIME_POSITION
 * - PW_WAGE_LEVEL / PREVAILING_WAGE_LEVEL
 */
function processH1BRecords(rows) {
  // Flexible column name resolution
  function getField(row, ...candidates) {
    for (const c of candidates) {
      if (row[c] !== undefined && row[c] !== null && row[c] !== '') return row[c];
      // Try uppercase
      if (row[c.toUpperCase()] !== undefined) return row[c.toUpperCase()];
    }
    return null;
  }

  // Aggregation buckets
  const bySOC = {}; // SOC code → { by_company: {}, by_metro: {}, all_wages: [] }

  let processed = 0;
  let skipped = 0;
  let filtered = 0;

  for (const row of rows) {
    processed++;

    // Get case status — only count certified applications
    const status = String(getField(row, 'CASE_STATUS', 'STATUS') || '').toUpperCase();
    if (!status.includes('CERTIFIED')) {
      skipped++;
      continue;
    }

    // Get SOC code
    const socRaw = getField(row, 'SOC_CODE', 'SOC_CODE_2_DIG', 'OCCUPATIONAL_CODE');
    const soc = String(socRaw || '').replace(/\.00$/, '').trim();
    if (!isTargetSOC(soc)) {
      filtered++;
      continue;
    }

    // Get wage
    const wageRaw = parseFloat(getField(row, 'WAGE_RATE_OF_PAY_FROM', 'WAGE_RATE_OF_PAY', 'PREVAILING_WAGE') || 0);
    const wageUnit = getField(row, 'WAGE_UNIT_OF_PAY', 'UNIT_OF_PAY', 'PW_UNIT_OF_PAY');
    const annualWage = annualizeWage(wageRaw, wageUnit);
    if (!annualWage || annualWage < 20000 || annualWage > 1000000) continue; // Sanity check

    // Get employer
    const employer = normalizeEmployer(
      getField(row, 'EMPLOYER_NAME', 'EMPLOYER_BUSINESS_NAME', 'EMPLOYER')
    );
    if (!employer) continue;

    // Get worksite
    const city = getField(row, 'WORKSITE_CITY', 'WORKSITE_CITY_1', 'WORK_CITY');
    const state = getField(row, 'WORKSITE_STATE', 'WORKSITE_STATE_1', 'WORK_STATE');

    // Get SOC title
    const socTitle = getField(row, 'SOC_TITLE', 'JOB_TITLE', 'OCCUPATIONAL_TITLE') || '';

    // Get wage level
    const wageLevel = getField(row, 'PW_WAGE_LEVEL', 'PREVAILING_WAGE_LEVEL', 'WAGE_LEVEL');

    // Initialize SOC bucket
    if (!bySOC[soc]) {
      bySOC[soc] = {
        soc,
        title: socTitle,
        by_company: {},
        by_metro: {},
        all_wages: [],
        levels: { I: 0, II: 0, III: 0, IV: 0 },
        total_filings: 0,
      };
    }

    const bucket = bySOC[soc];
    bucket.all_wages.push(annualWage);
    bucket.total_filings++;

    // Track wage levels
    if (wageLevel) {
      const lvl = String(wageLevel).replace(/Level\s*/i, '').trim();
      if (lvl === 'I' || lvl === '1') bucket.levels.I++;
      else if (lvl === 'II' || lvl === '2') bucket.levels.II++;
      else if (lvl === 'III' || lvl === '3') bucket.levels.III++;
      else if (lvl === 'IV' || lvl === '4') bucket.levels.IV++;
    }

    // Aggregate by company
    if (!bucket.by_company[employer]) {
      bucket.by_company[employer] = { wages: [], count: 0 };
    }
    bucket.by_company[employer].wages.push(annualWage);
    bucket.by_company[employer].count++;

    // Aggregate by state (simpler than full metro matching)
    if (state) {
      const stateKey = String(state).toUpperCase().trim();
      if (!bucket.by_metro[stateKey]) {
        bucket.by_metro[stateKey] = { wages: [], count: 0 };
      }
      bucket.by_metro[stateKey].wages.push(annualWage);
      bucket.by_metro[stateKey].count++;
    }
  }

  console.log(`  Processed ${processed.toLocaleString()} rows: ${Object.keys(bySOC).length} SOC codes, ${skipped} not certified, ${filtered} non-target SOC`);

  // Convert aggregates to percentile summaries
  const results = [];

  for (const [soc, data] of Object.entries(bySOC)) {
    if (data.all_wages.length < 5) continue; // Need enough data for meaningful percentiles

    const result = {
      soc: data.soc,
      title: data.title,
      total_filings: data.total_filings,
      wages: {
        p25: percentile(data.all_wages, 0.25),
        p50: percentile(data.all_wages, 0.50),
        p75: percentile(data.all_wages, 0.75),
        p10: percentile(data.all_wages, 0.10),
        p90: percentile(data.all_wages, 0.90),
        mean: Math.round(data.all_wages.reduce((a, b) => a + b, 0) / data.all_wages.length),
      },
      levels: data.levels,
      by_company: {},
      by_state: {},
      source: 'H1B LCA Disclosure Data (DOL/OFLC)',
    };

    // Top companies by filing count (prioritize well-known employers)
    const companies = Object.entries(data.by_company)
      .filter(([, d]) => d.count >= 3) // Minimum 3 filings for statistical relevance
      .sort((a, b) => {
        // Priority employers first, then by count
        const aPriority = isPriorityEmployer(a[0]) ? 1 : 0;
        const bPriority = isPriorityEmployer(b[0]) ? 1 : 0;
        if (aPriority !== bPriority) return bPriority - aPriority;
        return b[1].count - a[1].count;
      })
      .slice(0, 50); // Top 50 employers per SOC

    for (const [company, compData] of companies) {
      result.by_company[company] = {
        count: compData.count,
        wages: {
          p25: percentile(compData.wages, 0.25),
          p50: percentile(compData.wages, 0.50),
          p75: percentile(compData.wages, 0.75),
        },
      };
    }

    // Top states by filing count
    const states = Object.entries(data.by_metro)
      .filter(([, d]) => d.count >= 5)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 30);

    for (const [state, stateData] of states) {
      result.by_state[state] = {
        count: stateData.count,
        wages: {
          p25: percentile(stateData.wages, 0.25),
          p50: percentile(stateData.wages, 0.50),
          p75: percentile(stateData.wages, 0.75),
        },
      };
    }

    results.push(result);
  }

  return results.sort((a, b) => b.total_filings - a.total_filings);
}

// ─── Main Runner ──────────────────────────────────────────────────

export async function runH1BScraper(options = {}) {
  console.log('\n=== H1B LCA Disclosure Data Scraper ===\n');

  if (!options.fromFile) {
    console.log('ERROR: Specify --from-file <path-to-lca-disclosure.xlsx>');
    console.log('');
    console.log('Download H1B LCA disclosure data from:');
    console.log('  https://www.dol.gov/agencies/eta/foreign-labor/performance');
    console.log('');
    console.log('Look for: "H-1B" → "Disclosure Data" → Download the Excel file');
    console.log('Then run: node h1b-scraper.js --from-file <path>');
    return null;
  }

  console.log(`Loading: ${options.fromFile}`);

  let rows;
  const filePath = options.fromFile;

  if (filePath.endsWith('.csv')) {
    // Parse CSV
    const Papa = (await import('papaparse')).default;
    const csvText = await fs.readFile(filePath, 'utf-8');
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    rows = parsed.data;
    console.log(`  CSV: ${rows.length} rows`);
  } else {
    // Parse Excel
    const XLSX = (await import('xlsx')).default;
    const wb = XLSX.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
    console.log(`  Excel sheet "${sheetName}": ${rows.length} rows`);
  }

  // Show detected columns
  if (rows.length > 0) {
    const cols = Object.keys(rows[0]);
    console.log(`  Columns (${cols.length}): ${cols.slice(0, 10).join(', ')}...`);
  }

  // Process
  console.log('\nProcessing H1B records...');
  const results = processH1BRecords(rows);

  // Output
  const output = {
    metadata: {
      scraped_at: new Date().toISOString(),
      source: 'H1B LCA Disclosure Data (DOL/OFLC)',
      source_file: filePath,
      total_soc_codes: results.length,
      total_company_entries: results.reduce((sum, r) => sum + Object.keys(r.by_company).length, 0),
    },
    occupations: results,
  };

  console.log('\n─── Results Summary ───');
  console.log(`SOC codes:          ${results.length}`);
  console.log(`Total filings:      ${results.reduce((s, r) => s + r.total_filings, 0).toLocaleString()}`);
  console.log(`Company entries:    ${output.metadata.total_company_entries}`);

  // Save
  const outPath = join(KB_DIR, 'h1b-compensation.json');
  await fs.writeFile(outPath, JSON.stringify(output, null, 2));
  console.log(`\nSaved: ${outPath}`);

  // Sample
  if (results.length > 0) {
    const sample = results[0]; // Highest filing count
    console.log(`\n─── Sample: ${sample.title} (${sample.soc}) ───`);
    console.log(`  Filings: ${sample.total_filings}`);
    console.log(`  Median: $${sample.wages.p50?.toLocaleString()}`);
    console.log(`  Range: $${sample.wages.p10?.toLocaleString()} - $${sample.wages.p90?.toLocaleString()}`);
    const topCompanies = Object.entries(sample.by_company).slice(0, 5);
    for (const [co, data] of topCompanies) {
      console.log(`    ${co}: ${data.count} filings, median $${data.wages.p50?.toLocaleString()}`);
    }
  }

  return output;
}

// ─── CLI ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.includes('--from-file')) {
  const idx = args.indexOf('--from-file');
  const file = args[idx + 1];
  if (!file) {
    console.error('Error: --from-file requires a file path');
    process.exit(1);
  }
  runH1BScraper({ fromFile: file }).catch(console.error);
} else if (args.includes('--help') || (process.argv[1]?.includes('h1b-scraper') && args.length === 0)) {
  console.log(`
H1B LCA Disclosure Data Scraper
=================================

Processes H-1B LCA disclosure data to extract company-specific
salary data by occupation and geography.

Usage:
  node h1b-scraper.js --from-file <path>   Process downloaded LCA disclosure file
  node h1b-scraper.js --help               Show this help

Setup:
  1. Go to https://www.dol.gov/agencies/eta/foreign-labor/performance
  2. Under "Disclosure Data", find "H-1B" section
  3. Download the latest fiscal year disclosure file (Excel format)
  4. Run: node h1b-scraper.js --from-file <downloaded-file.xlsx>

Dependencies:
  npm install xlsx papaparse

Output:
  knowledge-base/h1b-compensation.json
  Company-specific salary data for tech and professional roles
  `);
}
