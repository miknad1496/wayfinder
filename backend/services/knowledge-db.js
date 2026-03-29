/**
 * knowledge-db.js — SQLite query layer for the Wayfinder knowledge base
 *
 * Uses sql.js (pure JavaScript/WebAssembly SQLite) — no native compilation needed.
 * Provides structured SQL queries against wayfinder-kb.db, replacing the
 * in-memory JSON parsing approach. Used by knowledge.js for Layer 3 (raw data).
 *
 * Usage:
 *   import { KnowledgeDB } from './knowledge-db.js';
 *   const db = await KnowledgeDB.getInstance();
 *   const results = db.getOccupation('15-1252');
 *   db.close();
 *
 * Prerequisites:
 *   npm install sql.js
 *   python3 scripts/build-knowledge-db.py  (creates wayfinder-kb.db)
 */

import initSqlJs from 'sql.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'knowledge-base', 'wayfinder-kb.db');

let _instance = null;
let _initPromise = null;

/**
 * Helper: run a query and return rows as array of objects (column-name keyed).
 */
function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Helper: run a query and return first row as object, or null.
 */
function queryOne(db, sql, params = []) {
  const rows = queryAll(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export class KnowledgeDB {
  constructor(db) {
    this.db = db;
  }

  /** Get or create singleton instance (async — sql.js init is async) */
  static async getInstance() {
    if (_instance && _instance.db) return _instance;

    // Prevent multiple concurrent inits
    if (_initPromise) return _initPromise;

    _initPromise = KnowledgeDB._init();
    try {
      _instance = await _initPromise;
      return _instance;
    } finally {
      _initPromise = null;
    }
  }

  static async _init() {
    if (!existsSync(DB_PATH)) {
      console.warn(`[knowledge-db] Database not found at ${DB_PATH}. Run: python3 scripts/build-knowledge-db.py`);
      return new KnowledgeDB(null);
    }

    try {
      const SQL = await initSqlJs();
      const fileBuffer = readFileSync(DB_PATH);
      const db = new SQL.Database(fileBuffer);
      console.log('[knowledge-db] SQLite knowledge base loaded (sql.js)');
      return new KnowledgeDB(db);
    } catch (err) {
      console.error('[knowledge-db] Failed to load database:', err.message);
      return new KnowledgeDB(null);
    }
  }

  get isAvailable() {
    return this.db !== null;
  }

  // ════════════════════════════════════════════════════════════════
  //  BLS OEWS Methods
  // ════════════════════════════════════════════════════════════════

  getOccupation(socCode) {
    if (!this.db) return null;
    return queryOne(this.db, `
      SELECT o.soc_code, o.title, o.employment_national,
             n.annual_p10, n.annual_p25, n.annual_p50, n.annual_p75, n.annual_p90, n.annual_mean,
             n.hourly_p10, n.hourly_p25, n.hourly_p50, n.hourly_p75, n.hourly_p90, n.hourly_mean
      FROM bls_occupations o
      LEFT JOIN bls_wages_national n ON o.soc_code = n.soc_code
      WHERE o.soc_code = ?
    `, [socCode]);
  }

  searchOccupations(keyword) {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT o.soc_code, o.title, o.median_annual_wage, o.employment_national,
             n.annual_p10, n.annual_p25, n.annual_p50, n.annual_p75, n.annual_p90
      FROM bls_occupations o
      LEFT JOIN bls_wages_national n ON o.soc_code = n.soc_code
      WHERE o.title LIKE ?
      ORDER BY o.employment_national DESC
      LIMIT 20
    `, [`%${keyword}%`]);
  }

  getAllOccupations() {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT soc_code, title, median_annual_wage, employment_national
      FROM bls_occupations
      ORDER BY employment_national DESC
    `);
  }

  getStateWages(socCode) {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT state, annual_p10, annual_p25, annual_p50, annual_p75, annual_p90, employment
      FROM bls_wages_by_state
      WHERE soc_code = ?
      ORDER BY annual_p50 DESC
    `, [socCode]);
  }

  getMetroWages(socCode) {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT metro_name, annual_p10, annual_p25, annual_p50, annual_p75, annual_p90, employment
      FROM bls_wages_by_metro
      WHERE soc_code = ?
      ORDER BY annual_p50 DESC
    `, [socCode]);
  }

  getTopOccupationsInState(stateCode, limit = 20) {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT o.soc_code, o.title, s.annual_p50, s.employment
      FROM bls_wages_by_state s
      JOIN bls_occupations o ON s.soc_code = o.soc_code
      WHERE s.state = ?
      ORDER BY s.annual_p50 DESC
      LIMIT ?
    `, [stateCode, limit]);
  }

  getTopOccupationsInMetro(metroName, limit = 20) {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT o.soc_code, o.title, m.annual_p50, m.employment
      FROM bls_wages_by_metro m
      JOIN bls_occupations o ON m.soc_code = o.soc_code
      WHERE m.metro_name LIKE ?
      ORDER BY m.annual_p50 DESC
      LIMIT ?
    `, [`%${metroName}%`, limit]);
  }

  // ════════════════════════════════════════════════════════════════
  //  H1B Methods
  // ════════════════════════════════════════════════════════════════

  getH1BOccupation(socCode) {
    if (!this.db) return null;
    return queryOne(this.db, `
      SELECT soc_code, title, total_filings,
             wage_p10, wage_p25, wage_p50, wage_p75, wage_p90, wage_mean,
             level_i_count, level_ii_count, level_iii_count, level_iv_count
      FROM h1b_occupations
      WHERE soc_code = ?
    `, [socCode]);
  }

  getH1BCompanies(socCode, limit = 20) {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT company_name, filing_count, wage_p25, wage_p50, wage_p75
      FROM h1b_by_company
      WHERE soc_code = ?
      ORDER BY filing_count DESC
      LIMIT ?
    `, [socCode, limit]);
  }

  searchH1BByCompany(companyName, limit = 20) {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT h.soc_code, o.title, h.filing_count, h.wage_p25, h.wage_p50, h.wage_p75
      FROM h1b_by_company h
      JOIN h1b_occupations o ON h.soc_code = o.soc_code
      WHERE h.company_name LIKE ?
      ORDER BY h.filing_count DESC
      LIMIT ?
    `, [`%${companyName}%`, limit]);
  }

  // ════════════════════════════════════════════════════════════════
  //  Census Methods
  // ════════════════════════════════════════════════════════════════

  getCensusNational() {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT education_level, median_earnings
      FROM census_earnings_national
      ORDER BY median_earnings ASC
    `);
  }

  getCensusForState(stateName) {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT education_level, median_earnings
      FROM census_earnings_by_state
      WHERE state = ?
    `, [stateName]);
  }

  getCensusAllStates(educationLevel) {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT state, education_level, median_earnings
      FROM census_earnings_by_state
      WHERE education_level = ?
      ORDER BY median_earnings DESC
    `, [educationLevel]);
  }

  // ════════════════════════════════════════════════════════════════
  //  Cost of Living Methods
  // ════════════════════════════════════════════════════════════════

  getCOLByState() {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT state, rpp_all, rpp_goods, rpp_services, rpp_rent
      FROM col_by_state
      ORDER BY rpp_all DESC
    `);
  }

  getCOLByMetro(limit = 50) {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT metro_name, rpp_all, rpp_goods, rpp_services, rpp_rent
      FROM col_by_metro
      ORDER BY rpp_all DESC
      LIMIT ?
    `, [limit]);
  }

  getCOLForState(stateName) {
    if (!this.db) return null;
    return queryOne(this.db, `
      SELECT state, rpp_all, rpp_goods, rpp_services, rpp_rent
      FROM col_by_state
      WHERE state = ?
    `, [stateName]);
  }

  getCOLForMetro(metroName) {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT metro_name, rpp_all, rpp_goods, rpp_services, rpp_rent
      FROM col_by_metro
      WHERE metro_name LIKE ?
      LIMIT 5
    `, [`%${metroName}%`]);
  }

  // ════════════════════════════════════════════════════════════════
  //  College Scorecard Methods
  // ════════════════════════════════════════════════════════════════

  searchInstitutions(name) {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT * FROM scorecard_institutions WHERE name LIKE ? LIMIT 10
    `, [`%${name}%`]);
  }

  getInstitutionPrograms(name) {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT p.*, i.name as institution_name
      FROM scorecard_programs p
      JOIN scorecard_institutions i ON p.institution_id = i.institution_id
      WHERE i.name LIKE ?
      ORDER BY p.earnings_median_4yr DESC
      LIMIT 20
    `, [`%${name}%`]);
  }

  getFieldAggregates() {
    if (!this.db) return [];
    return queryAll(this.db, `
      SELECT * FROM scorecard_field_aggregates
      ORDER BY earnings_median DESC
    `);
  }

  // ════════════════════════════════════════════════════════════════
  //  Cross-Domain / Composite Queries
  // ════════════════════════════════════════════════════════════════

  getOccupationProfile(socCode) {
    if (!this.db) return null;
    const occ = this.getOccupation(socCode);
    if (!occ) return null;

    const h1b = this.getH1BOccupation(socCode);
    const topCompanies = this.getH1BCompanies(socCode, 10);
    const topMetros = this.getMetroWages(socCode).slice(0, 5);
    const topStates = this.getStateWages(socCode).slice(0, 5);

    return {
      ...occ,
      h1b: h1b ? {
        total_filings: h1b.total_filings,
        h1b_median: h1b.wage_p50,
        top_companies: topCompanies
      } : null,
      top_metros: topMetros,
      top_states: topStates
    };
  }

  getAdjustedSalaryByMetro(socCode) {
    if (!this.db) return [];
    const metroWages = this.getMetroWages(socCode);
    const colMetros = this.getCOLByMetro(500);

    const colLookup = {};
    for (const m of colMetros) {
      colLookup[m.metro_name.toLowerCase()] = m.rpp_all;
    }

    return metroWages.map(m => {
      const metroKey = m.metro_name.toLowerCase();
      const rpp = colLookup[metroKey] || 100;
      const adjustedP50 = Math.round(m.annual_p50 * (100 / rpp));
      return {
        ...m,
        rpp,
        adjusted_p50: adjustedP50,
        premium_pct: Math.round((adjustedP50 / m.annual_p50 - 1) * 100)
      };
    }).sort((a, b) => b.adjusted_p50 - a.adjusted_p50);
  }

  // ════════════════════════════════════════════════════════════════
  //  RAG Integration — Convert SQL results to text chunks for BM25
  // ════════════════════════════════════════════════════════════════

  buildRAGChunks() {
    if (!this.db) return {};

    const index = {};
    index.raw_bls = this._buildBLSChunks();
    index.raw_h1b = this._buildH1BChunks();
    index.raw_census = this._buildCensusChunks();
    index.raw_col = this._buildCOLChunks();
    index.raw_scorecard = this._buildScorecardChunks();
    return index;
  }

  _buildBLSChunks() {
    if (!this.db) return [];
    const chunks = [];
    const occs = this.getAllOccupations();

    for (const occ of occs) {
      const full = this.getOccupation(occ.soc_code);
      if (!full) continue;

      let text = `${full.title} (${full.soc_code})\n`;
      text += `National median: $${(full.annual_p50 || 0).toLocaleString()}/yr`;
      if (full.employment_national) {
        text += ` | Employment: ${full.employment_national.toLocaleString()}`;
      }
      text += '\n';

      if (full.annual_p10 && full.annual_p90) {
        text += `Wage range: $${full.annual_p10.toLocaleString()} (10th) → $${full.annual_p90.toLocaleString()} (90th)\n`;
      }

      const metros = this.getMetroWages(occ.soc_code).slice(0, 5);
      if (metros.length > 0) {
        text += 'Top metros: ';
        text += metros.map(m => `${m.metro_name}: $${(m.annual_p50 || 0).toLocaleString()}`).join(', ');
        text += '\n';
      }

      const states = this.getStateWages(occ.soc_code).slice(0, 5);
      if (states.length > 0) {
        text += 'Top states: ';
        text += states.map(s => `${s.state}: $${(s.annual_p50 || 0).toLocaleString()}`).join(', ');
        text += '\n';
      }

      chunks.push({
        id: `bls-${occ.soc_code}`,
        text: text.trim(),
        tokens: text.split(/\s+/).length,
        source: 'bls-oews',
        soc: occ.soc_code,
        title: full.title
      });
    }

    return chunks;
  }

  _buildH1BChunks() {
    if (!this.db) return [];
    const chunks = [];

    const rows = queryAll(this.db, 'SELECT * FROM h1b_occupations ORDER BY total_filings DESC');
    for (const occ of rows) {
      const companies = this.getH1BCompanies(occ.soc_code, 15);

      let text = `H1B: ${occ.title} (${occ.soc_code})\n`;
      text += `Total filings: ${occ.total_filings.toLocaleString()}\n`;
      text += `Median wage: $${(occ.wage_p50 || 0).toLocaleString()} | Range: $${(occ.wage_p10 || 0).toLocaleString()} – $${(occ.wage_p90 || 0).toLocaleString()}\n`;

      if (companies.length > 0) {
        text += 'Top companies:\n';
        for (const c of companies.slice(0, 10)) {
          text += `  ${c.company_name}: $${(c.wage_p50 || 0).toLocaleString()} median (${c.filing_count} filings)\n`;
        }
      }

      chunks.push({
        id: `h1b-${occ.soc_code}`,
        text: text.trim(),
        tokens: text.split(/\s+/).length,
        source: 'h1b-lca',
        soc: occ.soc_code,
        title: occ.title
      });
    }

    return chunks;
  }

  _buildCensusChunks() {
    if (!this.db) return [];
    const chunks = [];

    const national = this.getCensusNational();
    if (national.length > 0) {
      let text = 'National Median Earnings by Education Level (Census ACS):\n';
      for (const row of national) {
        text += `  ${row.education_level}: $${row.median_earnings.toLocaleString()}\n`;
      }
      chunks.push({
        id: 'census-national',
        text: text.trim(),
        tokens: text.split(/\s+/).length,
        source: 'census-acs'
      });
    }

    const stateRows = queryAll(this.db, `
      SELECT state, education_level, median_earnings
      FROM census_earnings_by_state
      ORDER BY state, median_earnings ASC
    `);

    const byState = {};
    for (const row of stateRows) {
      if (!byState[row.state]) byState[row.state] = [];
      byState[row.state].push(row);
    }

    for (const [state, rows] of Object.entries(byState)) {
      let text = `${state} Earnings by Education:\n`;
      for (const row of rows) {
        text += `  ${row.education_level}: $${row.median_earnings.toLocaleString()}\n`;
      }
      chunks.push({
        id: `census-${state}`,
        text: text.trim(),
        tokens: text.split(/\s+/).length,
        source: 'census-acs',
        state
      });
    }

    return chunks;
  }

  _buildCOLChunks() {
    if (!this.db) return [];
    const chunks = [];

    const states = this.getCOLByState();
    if (states.length > 0) {
      let text = 'Regional Price Parities by State (100 = national avg):\n';
      text += 'Most expensive: ';
      text += states.slice(0, 5).map(s => `${s.state} (${s.rpp_all})`).join(', ');
      text += '\nLeast expensive: ';
      text += states.slice(-5).reverse().map(s => `${s.state} (${s.rpp_all})`).join(', ');

      chunks.push({
        id: 'col-state-overview',
        text: text.trim(),
        tokens: text.split(/\s+/).length,
        source: 'bea-rpp'
      });
    }

    const metros = this.getCOLByMetro(200);
    if (metros.length > 0) {
      let text = 'Regional Price Parities by Metro (100 = national avg):\n';
      text += 'Most expensive metros: ';
      text += metros.slice(0, 10).map(m => `${m.metro_name} (${m.rpp_all})`).join(', ');
      text += '\nLeast expensive metros: ';
      text += metros.slice(-10).reverse().map(m => `${m.metro_name} (${m.rpp_all})`).join(', ');

      chunks.push({
        id: 'col-metro-overview',
        text: text.trim(),
        tokens: text.split(/\s+/).length,
        source: 'bea-rpp'
      });
    }

    return chunks;
  }

  _buildScorecardChunks() {
    if (!this.db) return [];
    const chunks = [];

    const institutions = queryAll(this.db, `
      SELECT * FROM scorecard_institutions ORDER BY median_earnings_10yr DESC
    `);

    for (const inst of institutions) {
      const programs = queryAll(this.db, `
        SELECT * FROM scorecard_programs WHERE institution_id = ? ORDER BY earnings_median_4yr DESC
      `, [inst.institution_id]);

      let text = `${inst.name} (${inst.city}, ${inst.state})\n`;
      if (inst.admission_rate) text += `Admission rate: ${(inst.admission_rate * 100).toFixed(0)}%\n`;
      if (inst.median_earnings_10yr) text += `Median earnings (10yr post): $${inst.median_earnings_10yr.toLocaleString()}\n`;
      if (inst.avg_net_price) text += `Avg net price: $${inst.avg_net_price.toLocaleString()}\n`;

      if (programs.length > 0) {
        text += 'Top programs by earnings:\n';
        for (const p of programs.slice(0, 10)) {
          const earnings = p.earnings_median_4yr || p.earnings_median_2yr;
          if (earnings) {
            text += `  ${p.program_name}: $${earnings.toLocaleString()}\n`;
          }
        }
      }

      chunks.push({
        id: `scorecard-${inst.institution_id}`,
        text: text.trim(),
        tokens: text.split(/\s+/).length,
        source: 'college-scorecard',
        institution: inst.name
      });
    }

    const fields = this.getFieldAggregates();
    if (fields.length > 0) {
      let text = 'Earnings by Field of Study (College Scorecard aggregate):\n';
      for (const f of fields.slice(0, 30)) {
        text += `  ${f.field_name}: $${(f.earnings_median || 0).toLocaleString()} median`;
        if (f.institution_count) text += ` (${f.institution_count} schools)`;
        text += '\n';
      }
      chunks.push({
        id: 'scorecard-fields',
        text: text.trim(),
        tokens: text.split(/\s+/).length,
        source: 'college-scorecard'
      });
    }

    return chunks;
  }

  // ════════════════════════════════════════════════════════════════
  //  Direct Query / Metadata
  // ════════════════════════════════════════════════════════════════

  rawQuery(sql, params = []) {
    if (!this.db) return [];
    return queryAll(this.db, sql, params);
  }

  getMetadata() {
    if (!this.db) return {};
    const rows = queryAll(this.db, 'SELECT key, value FROM kb_metadata');
    const meta = {};
    for (const row of rows) {
      meta[row.key] = row.value;
    }
    return meta;
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      _instance = null;
    }
  }
}

export default KnowledgeDB;
