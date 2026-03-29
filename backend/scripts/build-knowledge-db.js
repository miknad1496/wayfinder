#!/usr/bin/env node
/**
 * Build the Wayfinder knowledge base SQLite database from JSON source files.
 * Pure Node.js — no Python required.
 *
 * Usage:
 *   node scripts/build-knowledge-db.js
 *
 * Reads from:  backend/knowledge-base/*.json
 * Writes to:   backend/knowledge-base/wayfinder-kb.db
 *
 * Safe to re-run — drops and recreates all tables each time.
 */

import initSqlJs from 'sql.js';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KB_DIR = join(__dirname, '..', 'knowledge-base');
const DB_PATH = join(KB_DIR, 'wayfinder-kb.db');

// ── Helpers ──────────────────────────────────────────────────────

async function loadJson(filename) {
  const path = join(KB_DIR, filename);
  if (!existsSync(path)) {
    console.log(`  ⏭  ${filename} not found, skipping`);
    return null;
  }
  try {
    const raw = await fs.readFile(path, 'utf-8');
    const data = JSON.parse(raw);
    const sizeKB = (Buffer.byteLength(raw) / 1024).toFixed(0);
    console.log(`  ✓ Loaded ${filename} (${sizeKB}KB)`);
    return data;
  } catch (err) {
    const stat = await fs.stat(path);
    console.log(`  ⚠  ${filename} is corrupt/truncated (${(stat.size/1024).toFixed(0)}KB): ${err.message}`);
    console.log(`     → Re-run the scraper for this file. Skipping.`);
    return null;
  }
}

function run(db, sql) {
  db.run(sql);
}

function insert(db, sql, params) {
  const stmt = db.prepare(sql);
  stmt.run(params);
  stmt.free();
}

function count(db, table) {
  const stmt = db.prepare(`SELECT COUNT(*) as c FROM ${table}`);
  stmt.step();
  const c = stmt.getAsObject().c;
  stmt.free();
  return c;
}

// ── Schema ────────────────────────────────────────────────────────

function createSchema(db) {
  // BLS OEWS
  run(db, 'DROP TABLE IF EXISTS bls_occupations');
  run(db, 'DROP TABLE IF EXISTS bls_wages_national');
  run(db, 'DROP TABLE IF EXISTS bls_wages_by_state');
  run(db, 'DROP TABLE IF EXISTS bls_wages_by_metro');
  run(db, `CREATE TABLE bls_occupations (
    soc_code TEXT PRIMARY KEY, title TEXT NOT NULL,
    employment_national INTEGER, mean_annual_wage INTEGER, median_annual_wage INTEGER
  )`);
  run(db, `CREATE TABLE bls_wages_national (
    soc_code TEXT PRIMARY KEY,
    annual_p10 INTEGER, annual_p25 INTEGER, annual_p50 INTEGER, annual_p75 INTEGER, annual_p90 INTEGER, annual_mean INTEGER,
    hourly_p10 REAL, hourly_p25 REAL, hourly_p50 REAL, hourly_p75 REAL, hourly_p90 REAL, hourly_mean REAL
  )`);
  run(db, `CREATE TABLE bls_wages_by_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT, soc_code TEXT NOT NULL, state TEXT NOT NULL,
    annual_p10 INTEGER, annual_p25 INTEGER, annual_p50 INTEGER, annual_p75 INTEGER, annual_p90 INTEGER, employment INTEGER
  )`);
  run(db, 'CREATE INDEX idx_bls_state_soc ON bls_wages_by_state(soc_code)');
  run(db, 'CREATE INDEX idx_bls_state_state ON bls_wages_by_state(state)');
  run(db, `CREATE TABLE bls_wages_by_metro (
    id INTEGER PRIMARY KEY AUTOINCREMENT, soc_code TEXT NOT NULL,
    metro_code TEXT, metro_name TEXT NOT NULL,
    annual_p10 INTEGER, annual_p25 INTEGER, annual_p50 INTEGER, annual_p75 INTEGER, annual_p90 INTEGER, employment INTEGER
  )`);
  run(db, 'CREATE INDEX idx_bls_metro_soc ON bls_wages_by_metro(soc_code)');
  run(db, 'CREATE INDEX idx_bls_metro_name ON bls_wages_by_metro(metro_name)');

  // H1B
  run(db, 'DROP TABLE IF EXISTS h1b_occupations');
  run(db, 'DROP TABLE IF EXISTS h1b_by_company');
  run(db, `CREATE TABLE h1b_occupations (
    soc_code TEXT PRIMARY KEY, title TEXT NOT NULL, total_filings INTEGER,
    wage_p10 INTEGER, wage_p25 INTEGER, wage_p50 INTEGER, wage_p75 INTEGER, wage_p90 INTEGER, wage_mean INTEGER,
    level_i_count INTEGER, level_ii_count INTEGER, level_iii_count INTEGER, level_iv_count INTEGER
  )`);
  run(db, `CREATE TABLE h1b_by_company (
    id INTEGER PRIMARY KEY AUTOINCREMENT, soc_code TEXT NOT NULL,
    company_name TEXT NOT NULL, filing_count INTEGER, wage_p25 INTEGER, wage_p50 INTEGER, wage_p75 INTEGER
  )`);
  run(db, 'CREATE INDEX idx_h1b_company_soc ON h1b_by_company(soc_code)');
  run(db, 'CREATE INDEX idx_h1b_company_name ON h1b_by_company(company_name)');

  // Census
  run(db, 'DROP TABLE IF EXISTS census_earnings_national');
  run(db, 'DROP TABLE IF EXISTS census_earnings_by_state');
  run(db, `CREATE TABLE census_earnings_national (education_level TEXT PRIMARY KEY, median_earnings INTEGER NOT NULL)`);
  run(db, `CREATE TABLE census_earnings_by_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT, state TEXT NOT NULL, state_fips TEXT,
    education_level TEXT NOT NULL, median_earnings INTEGER
  )`);
  run(db, 'CREATE INDEX idx_census_state ON census_earnings_by_state(state)');

  // Cost of Living
  run(db, 'DROP TABLE IF EXISTS col_by_state');
  run(db, 'DROP TABLE IF EXISTS col_by_metro');
  run(db, `CREATE TABLE col_by_state (
    state TEXT PRIMARY KEY, rpp_all REAL, rpp_goods REAL, rpp_services REAL, rpp_rent REAL, year INTEGER
  )`);
  run(db, `CREATE TABLE col_by_metro (
    id INTEGER PRIMARY KEY AUTOINCREMENT, metro_code TEXT, metro_name TEXT NOT NULL,
    rpp_all REAL, rpp_goods REAL, rpp_services REAL, rpp_rent REAL, year INTEGER
  )`);
  run(db, 'CREATE INDEX idx_col_metro_name ON col_by_metro(metro_name)');

  // Scorecard
  run(db, 'DROP TABLE IF EXISTS scorecard_institutions');
  run(db, 'DROP TABLE IF EXISTS scorecard_programs');
  run(db, 'DROP TABLE IF EXISTS scorecard_field_aggregates');
  run(db, `CREATE TABLE scorecard_institutions (
    institution_id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT, state TEXT,
    school_type TEXT, admission_rate REAL, avg_net_price INTEGER, median_debt INTEGER,
    completion_rate REAL, median_earnings_10yr INTEGER
  )`);
  run(db, 'CREATE INDEX idx_scorecard_name ON scorecard_institutions(name)');
  run(db, `CREATE TABLE scorecard_programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, institution_id INTEGER NOT NULL,
    cip_code TEXT NOT NULL, program_name TEXT, credential_level TEXT,
    earnings_median_2yr INTEGER, earnings_median_4yr INTEGER
  )`);
  run(db, 'CREATE INDEX idx_scorecard_prog_inst ON scorecard_programs(institution_id)');
  run(db, 'CREATE INDEX idx_scorecard_prog_cip ON scorecard_programs(cip_code)');
  run(db, `CREATE TABLE scorecard_field_aggregates (
    id INTEGER PRIMARY KEY AUTOINCREMENT, field_code TEXT NOT NULL, field_name TEXT NOT NULL,
    credential_level TEXT, institution_count INTEGER,
    earnings_p25 INTEGER, earnings_median INTEGER, earnings_p75 INTEGER
  )`);

  // Metadata
  run(db, 'DROP TABLE IF EXISTS kb_metadata');
  run(db, `CREATE TABLE kb_metadata (key TEXT PRIMARY KEY, value TEXT)`);

  console.log('  ✓ Schema created (12 tables)');
}

// ── Importers ─────────────────────────────────────────────────────

function importBLS(db, data) {
  if (!data || !Array.isArray(data)) return;
  let occCount = 0, stateCount = 0, metroCount = 0;

  for (const occ of data) {
    const soc = occ.soc || '';
    const title = occ.title || '';
    const wages = occ.wages || {};
    const nat = wages.national || {};
    const annual = nat.annual || {};
    const hourly = nat.hourly || {};
    const emp = occ.employment;
    const empTotal = typeof emp === 'object' ? (emp?.total ?? null) : emp;

    insert(db, 'INSERT OR REPLACE INTO bls_occupations VALUES (?,?,?,?,?)',
      [soc, title, empTotal, annual.mean ?? null, annual.p50 ?? null]);
    insert(db, 'INSERT OR REPLACE INTO bls_wages_national VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [soc, annual.p10??null, annual.p25??null, annual.p50??null, annual.p75??null, annual.p90??null, annual.mean??null,
       hourly.p10??null, hourly.p25??null, hourly.p50??null, hourly.p75??null, hourly.p90??null, hourly.mean??null]);
    occCount++;

    for (const [state, sdata] of Object.entries(wages.by_state || {})) {
      const sa = sdata.annual || {};
      insert(db, 'INSERT INTO bls_wages_by_state (soc_code,state,annual_p10,annual_p25,annual_p50,annual_p75,annual_p90,employment) VALUES (?,?,?,?,?,?,?,?)',
        [soc, state, sa.p10??null, sa.p25??null, sa.p50??null, sa.p75??null, sa.p90??null, sdata.employment??null]);
      stateCount++;
    }

    for (const [metroKey, mdata] of Object.entries(wages.by_metro || {})) {
      const ma = mdata.annual || {};
      insert(db, 'INSERT INTO bls_wages_by_metro (soc_code,metro_code,metro_name,annual_p10,annual_p25,annual_p50,annual_p75,annual_p90,employment) VALUES (?,?,?,?,?,?,?,?,?)',
        [soc, metroKey, mdata.metro_name || metroKey, ma.p10??null, ma.p25??null, ma.p50??null, ma.p75??null, ma.p90??null, mdata.employment??null]);
      metroCount++;
    }
  }
  console.log(`  ✓ BLS: ${occCount} occupations, ${stateCount} state records, ${metroCount} metro records`);
}

function importH1B(db, data) {
  if (!data) return;
  const occupations = data.occupations || [];
  let companyCount = 0;

  for (const occ of occupations) {
    const soc = occ.soc || '';
    const wages = occ.wages || {};
    const levels = occ.levels || {};

    insert(db, 'INSERT OR REPLACE INTO h1b_occupations VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [soc, occ.title||'', occ.total_filings??null,
       wages.p10??null, wages.p25??null, wages.p50??null, wages.p75??null, wages.p90??null, wages.mean??null,
       levels.I??null, levels.II??null, levels.III??null, levels.IV??null]);

    for (const [company, cdata] of Object.entries(occ.by_company || {})) {
      const cw = cdata.wages || {};
      insert(db, 'INSERT INTO h1b_by_company (soc_code,company_name,filing_count,wage_p25,wage_p50,wage_p75) VALUES (?,?,?,?,?,?)',
        [soc, company, cdata.count??null, cw.p25??null, cw.p50??null, cw.p75??null]);
      companyCount++;
    }
  }
  console.log(`  ✓ H1B: ${occupations.length} SOC codes, ${companyCount} company entries`);
}

function importCensus(db, data) {
  if (!data) return;
  const nat = data.national || {};
  const eduLabels = {
    total: 'All Workers', less_than_hs: 'Less than High School',
    high_school: 'High School Diploma', some_college: 'Some College / Associates',
    bachelors: "Bachelor's Degree", graduate: 'Graduate Degree'
  };

  let natCount = 0;
  for (const [key, label] of Object.entries(eduLabels)) {
    if (nat[key] != null) {
      insert(db, 'INSERT OR REPLACE INTO census_earnings_national VALUES (?,?)', [label, nat[key]]);
      natCount++;
    }
  }

  let stateCount = 0;
  for (const entry of data.by_state || []) {
    const state = entry.state || '';
    const fips = entry.state_fips || '';
    const earnings = entry.earnings || {};
    for (const [key, label] of Object.entries(eduLabels)) {
      if (earnings[key] != null) {
        insert(db, 'INSERT INTO census_earnings_by_state (state,state_fips,education_level,median_earnings) VALUES (?,?,?,?)',
          [state, fips, label, earnings[key]]);
        stateCount++;
      }
    }
  }
  console.log(`  ✓ Census: ${natCount} national levels, ${stateCount} state records`);
}

function importCOL(db, data) {
  if (!data) return;
  let stateCount = 0, metroCount = 0;

  for (const entry of data.states || []) {
    const name = entry.name || '';
    insert(db, 'INSERT OR REPLACE INTO col_by_state VALUES (?,?,?,?,?,?)',
      [name, entry.rpp??null, entry.rpp_goods??null, entry.rpp_services??null,
       entry.rpp_housing??entry.rpp_rent??null, entry._year??entry.year??null]);
    stateCount++;
  }

  for (const entry of data.metros || []) {
    const name = entry.metro || entry.name || '';
    insert(db, 'INSERT INTO col_by_metro (metro_code,metro_name,rpp_all,rpp_goods,rpp_services,rpp_rent,year) VALUES (?,?,?,?,?,?,?)',
      [entry.fips??null, name, entry.rpp??null, entry.rpp_goods??null, entry.rpp_services??null,
       entry.rpp_housing??entry.rpp_rent??null, entry._year??entry.year??null]);
    metroCount++;
  }
  console.log(`  ✓ Cost of Living: ${stateCount} states, ${metroCount} metros`);
}

function importScorecard(db, data) {
  if (!data) return;
  let instCount = 0, progCount = 0, aggCount = 0;

  for (const entry of data.institutions || []) {
    const inst = entry.institution || entry;
    const iid = inst.id || inst.institution_id;
    if (!iid) continue;

    insert(db, 'INSERT OR REPLACE INTO scorecard_institutions VALUES (?,?,?,?,?,?,?,?,?,?)',
      [iid, inst.name??'', inst.city??null, inst.state??null,
       inst.type??inst.school_type??null, inst.admission_rate??null,
       inst.avg_net_price??inst.avg_cost??null, inst.median_debt??null,
       inst.completion_rate??null, inst.earnings_10yr??inst.median_earnings_10yr??inst.median_earnings??null]);
    instCount++;

    for (const prog of entry.programs || []) {
      const e1yr = prog.earnings_1yr?.median ?? null;
      const e4yr = prog.earnings_4yr?.median ?? null;
      insert(db, 'INSERT INTO scorecard_programs (institution_id,cip_code,program_name,credential_level,earnings_median_2yr,earnings_median_4yr) VALUES (?,?,?,?,?,?)',
        [iid, prog.cip??prog.cip_code??'', prog.field??prog.program_name??'',
         prog.credential??prog.credential_level??'', e1yr, e4yr]);
      progCount++;
    }
  }

  for (const agg of data.field_aggregates || data.by_field || []) {
    insert(db, 'INSERT INTO scorecard_field_aggregates (field_code,field_name,credential_level,institution_count,earnings_p25,earnings_median,earnings_p75) VALUES (?,?,?,?,?,?,?)',
      [agg.field_code??agg.code??'', agg.field_name??agg.name??'',
       agg.credential_level??null, agg.institution_count??agg.count??null,
       agg.earnings_p25??agg.p25??null, agg.earnings_median??agg.median??null, agg.earnings_p75??agg.p75??null]);
    aggCount++;
  }
  console.log(`  ✓ Scorecard: ${instCount} institutions, ${progCount} programs, ${aggCount} field aggregates`);
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Wayfinder Knowledge Base → SQLite Builder');
  console.log('═══════════════════════════════════════════════\n');

  console.log('📂 Loading JSON source files...\n');

  const blsData = await loadJson('bls-compensation.json');
  const h1bData = await loadJson('h1b-compensation.json');
  const censusData = await loadJson('census-education-earnings.json');
  const colData = await loadJson('cost-of-living.json');
  const scorecardData = await loadJson('scorecard-earnings.json');

  console.log('\n🗄️  Creating SQLite database...\n');

  const SQL = await initSqlJs();
  const db = new SQL.Database();

  createSchema(db);

  console.log('\n📥 Importing data...\n');

  importBLS(db, blsData);
  importH1B(db, h1bData);
  importCensus(db, censusData);
  importCOL(db, colData);
  importScorecard(db, scorecardData);

  // Metadata
  const now = new Date().toISOString();
  insert(db, 'INSERT INTO kb_metadata VALUES (?,?)', ['built_at', now]);
  insert(db, 'INSERT INTO kb_metadata VALUES (?,?)', ['builder_version', '2.0.0-node']);

  // Count totals
  const tables = [
    'bls_occupations', 'bls_wages_national', 'bls_wages_by_state', 'bls_wages_by_metro',
    'h1b_occupations', 'h1b_by_company',
    'census_earnings_national', 'census_earnings_by_state',
    'col_by_state', 'col_by_metro',
    'scorecard_institutions', 'scorecard_programs', 'scorecard_field_aggregates'
  ];

  let totalRows = 0;
  for (const table of tables) {
    const c = count(db, table);
    if (c > 0) insert(db, 'INSERT OR REPLACE INTO kb_metadata VALUES (?,?)', [`${table}_count`, String(c)]);
    totalRows += c;
  }
  insert(db, 'INSERT OR REPLACE INTO kb_metadata VALUES (?,?)', ['total_rows', String(totalRows)]);

  // Export to file
  const data = db.export();
  const buffer = Buffer.from(data);
  await fs.writeFile(DB_PATH, buffer);
  db.close();

  const dbSizeMB = (buffer.length / (1024 * 1024)).toFixed(1);

  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`  ✅ Database built successfully!`);
  console.log(`  📊 Total rows: ${totalRows.toLocaleString()}`);
  console.log(`  💾 Database size: ${dbSizeMB}MB`);
  console.log(`  📍 Location: ${DB_PATH}`);
  console.log(`═══════════════════════════════════════════════\n`);

  console.log('  Table                          Rows');
  console.log('  ────────────────────────────── ─────────');
  for (const table of tables) {
    // Re-open to read counts from metadata (db is closed)
    const db2 = new SQL.Database(buffer);
    const c = count(db2, table);
    db2.close();
    if (c > 0) {
      console.log(`  ${table.padEnd(32)} ${c.toLocaleString().padStart(9)}`);
    }
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
