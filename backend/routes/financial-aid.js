/**
 * Financial Aid API
 *
 * Serves college financial aid data and generates personalized strategies.
 * Pro users see preview access (limited results).
 * Elite users have full access.
 *
 * - GET /api/financial-aid/search     — Search schools by filters, net price estimates
 * - GET /api/financial-aid/state-grants — State grant programs by state
 * - GET /api/financial-aid/strategies  — Financial aid strategies guide (elite only)
 * - GET /api/financial-aid/stats       — Public stats on database coverage
 * - GET /api/financial-aid/estimate    — Estimate net price for a school
 * - POST /api/financial-aid/calculate-sai — Calculate Student Aid Index (SAI) estimate
 * - POST /api/financial-aid/my-strategy — Generate personalized aid strategy (elite only)
 */

import { Router } from 'express';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, canAccess, checkMessageUsage, recordMessageUsage } from '../services/auth.js';
import { calculateSAI, quickEstimateSAI } from '../services/sai-calculator.js';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = Router();

let financialAidCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000;
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/miknad1496/wayfinder/main/backend/data/scraped/financial-aid-db.json';

// ─── School abbreviation / alias lookup ─────────────────────────
const SCHOOL_ALIASES = {
  'uw': ['university of washington - seattle'],
  'uw seattle': ['university of washington - seattle'],
  'uw bothell': ['university of washington - bothell'],
  'uwb': ['university of washington - bothell'],
  'uw tacoma': ['university of washington - tacoma'],
  'uwt': ['university of washington - tacoma'],
  'uw madison': ['university of wisconsin'],
  'wisc': ['university of wisconsin'],
  'mit': ['massachusetts institute of technology'],
  'stanford': ['stanford university'],
  'harvard': ['harvard university'],
  'yale': ['yale university'],
  'princeton': ['princeton university'],
  'columbia': ['columbia university'],
  'upenn': ['university of pennsylvania'],
  'penn': ['university of pennsylvania'],
  'cornell': ['cornell university'],
  'dartmouth': ['dartmouth college'],
  'brown': ['brown university'],
  'duke': ['duke university'],
  'cal': ['university of california, berkeley'],
  'berkeley': ['university of california, berkeley'],
  'ucb': ['university of california, berkeley'],
  'ucla': ['university of california, los angeles'],
  'usc': ['university of southern california'],
  'nyu': ['new york university'],
  'cmu': ['carnegie mellon university'],
  'caltech': ['california institute of technology'],
  'gatech': ['georgia institute of technology'],
  'gt': ['georgia institute of technology'],
  'umich': ['university of michigan'],
  'uva': ['university of virginia'],
  'unc': ['university of north carolina'],
  'ut': ['university of texas at austin'],
  'osu': ['ohio state university'],
  'psu': ['penn state university', 'pennsylvania state university'],
  'umd': ['university of maryland'],
  'bu': ['boston university'],
  'bc': ['boston college'],
  'jhu': ['johns hopkins university'],
  'wustl': ['washington university in st. louis'],
  'washu': ['washington university in st. louis'],
  'rice': ['rice university'],
  'emory': ['emory university'],
  'tufts': ['tufts university'],
  'gtown': ['georgetown university'],
  'georgetown': ['georgetown university'],
  'nd': ['university of notre dame'],
  'notre dame': ['university of notre dame'],
  'vanderbilt': ['vanderbilt university'],
  'vandy': ['vanderbilt university'],
  'northwestern': ['northwestern university'],
  'nu': ['northwestern university'],
  'neu': ['northeastern university'],
  'uiuc': ['university of illinois'],
  'purdue': ['purdue university'],
  'uf': ['university of florida'],
  'fsu': ['florida state university'],
  'asu': ['arizona state university'],
  'cu': ['university of colorado'],
  'cu boulder': ['university of colorado'],
  'uconn': ['university of connecticut'],
  'rutgers': ['rutgers university'],
  'howard': ['howard university'],
  'spelman': ['spelman college'],
  'morehouse': ['morehouse college'],
  'hampton': ['hampton university'],
  'williams': ['williams college'],
  'amherst': ['amherst college'],
  'swarthmore': ['swarthmore college'],
  'pomona': ['pomona college'],
  'bowdoin': ['bowdoin college'],
  'wellesley': ['wellesley college'],
  'barnard': ['barnard college'],
  'smith': ['smith college'],
  'colby': ['colby college'],
  'bates': ['bates college'],
  'carleton': ['carleton college'],
  'grinnell': ['grinnell college'],
  'oberlin': ['oberlin college'],
  'reed': ['reed college'],
  'cwru': ['case western reserve university'],
  'case western': ['case western reserve university'],
  'wfu': ['wake forest university'],
  'wake forest': ['wake forest university'],
  'tulane': ['tulane university'],
  'lmu': ['loyola marymount university'],
  'scu': ['santa clara university'],
  'uop': ['university of the pacific'],
  'uga': ['university of georgia'],
  'clemson': ['clemson university'],
  'vt': ['virginia tech'],
  'virginia tech': ['virginia polytechnic institute'],
};

function expandSearchQuery(query) {
  const q = query.toLowerCase().trim();
  const aliasMatches = SCHOOL_ALIASES[q] || [];
  return { original: q, aliases: aliasMatches };
}

async function loadFinancialAidData() {
  const now = Date.now();
  if (financialAidCache && (now - cacheTimestamp) < CACHE_TTL) return financialAidCache;

  const paths = [
    join(__dirname, '..', 'data', 'scraped', 'financial-aid-db.json'),
    join(process.cwd(), 'data', 'scraped', 'financial-aid-db.json'),
  ];

  for (const p of paths) {
    try {
      const raw = await fs.readFile(p, 'utf8');
      financialAidCache = JSON.parse(raw);
      cacheTimestamp = now;
      console.log(`[Financial Aid] Loaded data from ${p}`);
      return financialAidCache;
    } catch (e) {
      console.warn(`[Financial Aid] Could not load ${p}: ${e.message}`);
    }
  }

  try {
    const resp = await fetch(GITHUB_RAW_URL, { signal: AbortSignal.timeout(10000) });
    if (resp.ok) {
      financialAidCache = await resp.json();
      cacheTimestamp = now;
      console.log('[Financial Aid] Loaded data from GitHub fallback');
      return financialAidCache;
    }
  } catch (e) {
    console.warn(`[Financial Aid] GitHub fallback failed: ${e.message}`);
  }

  return null;
}

function getIncomeCategory(income) {
  if (income <= 30000) return 'under30k';
  if (income <= 48000) return '30to48k';
  if (income <= 75000) return '48to75k';
  if (income <= 110000) return '75to110k';
  return 'over110k';
}

function previewSchool(s) {
  return {
    name: s.name,
    type: s.type,
    state: s.state,
    stickerPrice: s.stickerPrice,
    needBlind: s.needBlind,
    meetsFullNeed: s.meetsFullNeed,
    deadline: s.deadline,
    _preview: true
  };
}

// ─── GET /api/financial-aid/schools ──────────────────────────── (lightweight list for picker)
router.get('/schools', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const financialAidData = await loadFinancialAidData();
    if (!financialAidData) return res.status(503).json({ error: 'Financial aid data not available' });

    const results = financialAidData.schools.map(s => ({
      id: s.id, name: s.name, type: s.type, state: s.state
    }));
    results.sort((a, b) => a.name.localeCompare(b.name));
    res.json({ results });
  } catch (err) {
    console.error('Schools list error:', err);
    res.status(500).json({ error: 'Failed to load school list' });
  }
});

// ─── GET /api/financial-aid/search ─────────────────────────────
router.get('/search', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const hasFull = canAccess(user, 'financial_aid');
    const hasPreview = canAccess(user, 'financial_aid_preview') || hasFull;

    if (!hasPreview) {
      return res.status(403).json({
        error: 'Financial aid database requires a Pro plan or higher.',
        _requiresUpgrade: true
      });
    }

    const data = await loadFinancialAidData();
    if (!data?.schools) {
      return res.status(503).json({ error: 'Financial aid database not yet available. Coming soon!' });
    }

    let results = [...data.schools];

    const { state, type, tags, incomeBracket, q } = req.query;
    if (state) results = results.filter(s => s.state?.toUpperCase() === state.toUpperCase());
    if (type) results = results.filter(s => s.type?.toLowerCase() === type.toLowerCase());
    if (tags) {
      const tagsArray = tags.split(',');
      results = results.filter(s => tagsArray.some(t => s.tags?.includes(t)));
    }
    if (incomeBracket) {
      results = results.filter(s => {
        const netPrices = s.netPriceByIncome || {};
        return netPrices[incomeBracket] !== undefined;
      });
    }
    if (q) {
      const { original, aliases } = expandSearchQuery(q);
      results = results.filter(s => {
        const name = s.name?.toLowerCase() || '';
        // Direct substring match
        if (name.includes(original)) return true;
        // Alias match: check if any alias is a substring of the school name
        for (const alias of aliases) {
          if (name.includes(alias)) return true;
        }
        // Fuzzy: also check if the query words all appear in the name
        const words = original.split(/\s+/).filter(w => w.length > 1);
        if (words.length > 1 && words.every(w => name.includes(w))) return true;
        return false;
      });
    }

    if (hasFull) {
      res.json({
        results,
        total: results.length,
        _fullAccess: true
      });
    } else {
      res.json({
        results: results.slice(0, 5).map(previewSchool),
        total: results.length,
        _fullAccess: false,
        _previewMessage: `Showing 5 of ${results.length} schools. Upgrade to Elite for full access.`
      });
    }
  } catch (err) {
    console.error('Financial aid search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/financial-aid/state-grants ──────────────────────────
router.get('/state-grants', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const data = await loadFinancialAidData();
    if (!data?.stateGrants) {
      return res.status(503).json({ error: 'Grants database not available.' });
    }

    let stateResults = [...data.stateGrants];

    const { state } = req.query;
    if (state) {
      stateResults = stateResults.filter(g => g.state?.toUpperCase() === state.toUpperCase());
    }

    // Always include federal programs
    const federalPrograms = data.federalPrograms || [];

    res.json({
      federalPrograms,
      stateResults,
      total: stateResults.length + federalPrograms.length
    });
  } catch (err) {
    console.error('State grants error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/financial-aid/strategies ────────────────────────────
router.get('/strategies', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const hasAccess = canAccess(user, 'financial_aid');
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Strategies require Elite access.',
        _requiresUpgrade: true
      });
    }

    const data = await loadFinancialAidData();
    if (!data?.strategies) {
      return res.status(503).json({ error: 'Strategies database not available.' });
    }

    res.json(data.strategies);
  } catch (err) {
    console.error('Strategies error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/financial-aid/stats ──────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const data = await loadFinancialAidData();
    if (!data?.schools) {
      return res.json({ available: false, message: 'Coming soon!' });
    }

    const states = new Set(data.schools.map(s => s.state).filter(Boolean));
    const types = {};
    for (const s of data.schools) {
      const t = s.type || 'other';
      types[t] = (types[t] || 0) + 1;
    }

    res.json({
      available: true,
      totalSchools: data.schools.length,
      statesCovered: states.size,
      schoolsByType: types,
      totalStateGrants: data.stateGrants?.length || 0,
      lastUpdated: data.metadata?.lastScraped || null
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/financial-aid/estimate ───────────────────────────────
router.get('/estimate', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const hasAccess = canAccess(user, 'financial_aid') || canAccess(user, 'financial_aid_preview');
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Estimates require Pro plan or higher.',
        _requiresUpgrade: true
      });
    }

    const { income, assets, familySize, targetSchool } = req.query;
    if (!targetSchool) {
      return res.status(400).json({ error: 'targetSchool query parameter required' });
    }

    const data = await loadFinancialAidData();
    if (!data?.schools) {
      return res.status(503).json({ error: 'Financial aid database not available.' });
    }

    const school = data.schools.find(s => s.name?.toLowerCase() === targetSchool.toLowerCase());
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const incomeNum = income != null ? parseFloat(income) : NaN;
    const incomeCat = !isNaN(incomeNum) ? getIncomeCategory(incomeNum) : '48to75k';

    const estimate = {
      school: {
        name: school.name,
        state: school.state,
        stickerPrice: school.stickerPrice
      },
      householdIncome: incomeNum,
      estimatedNetPrice: school.netPriceByIncome?.[incomeCat] || null,
      meetsFullNeed: school.meetsFullNeed,
      needBlind: school.needBlind,
      cssRequired: school.cssRequired,
      deadline: school.deadline,
      stateGrants: data.stateGrants?.filter(g => g.state?.toUpperCase() === school.state?.toUpperCase()) || []
    };

    res.json(estimate);
  } catch (err) {
    console.error('Estimate error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /api/financial-aid/calculate-sai ─────────────────────────
router.post('/calculate-sai', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    // SAI calculator available to all authenticated users (it's a core value-add)
    const hasPreview = canAccess(user, 'financial_aid_preview') || canAccess(user, 'financial_aid');
    if (!hasPreview) {
      return res.status(403).json({
        error: 'SAI calculator requires a Pro plan or higher.',
        _requiresUpgrade: true
      });
    }

    const { mode, ...params } = req.body;

    let result;
    if (mode === 'detailed') {
      // Full detailed calculation with all inputs
      const {
        parentAGI, parentFederalTaxPaid, parentUntaxedIncome,
        parent1EarnedIncome, parent2EarnedIncome,
        parentCashSavingsInvestments, parentBusinessFarmNetWorth,
        familySize, parentMaritalStatus, olderParentAge, stateOfResidence,
        studentAGI, studentFederalTaxPaid, studentEarnedIncome,
        studentAssets, receivedMeansTestedBenefit
      } = params;

      // Validate required fields
      if (parentAGI === undefined || parentAGI === null) {
        return res.status(400).json({ error: 'Parent AGI is required.' });
      }

      result = calculateSAI({
        parentAGI: Number(parentAGI) || 0,
        parentFederalTaxPaid: Number(parentFederalTaxPaid) || 0,
        parentUntaxedIncome: Number(parentUntaxedIncome) || 0,
        parent1EarnedIncome: Number(parent1EarnedIncome) || 0,
        parent2EarnedIncome: Number(parent2EarnedIncome) || 0,
        parentCashSavingsInvestments: Number(parentCashSavingsInvestments) || 0,
        parentBusinessFarmNetWorth: Number(parentBusinessFarmNetWorth) || 0,
        familySize: Number(familySize) || 4,
        parentMaritalStatus: parentMaritalStatus || 'married',
        olderParentAge: Number(olderParentAge) || 45,
        stateOfResidence: stateOfResidence || 'WA',
        studentAGI: Number(studentAGI) || 0,
        studentFederalTaxPaid: Number(studentFederalTaxPaid) || 0,
        studentEarnedIncome: Number(studentEarnedIncome) || 0,
        studentAssets: Number(studentAssets) || 0,
        receivedMeansTestedBenefit: !!receivedMeansTestedBenefit,
      });
    } else {
      // Quick estimate with fewer inputs
      const { householdIncome, parentAssets, familySize, studentIncome, studentAssets, state, filingStatus } = params;

      if (!householdIncome && householdIncome !== 0) {
        return res.status(400).json({ error: 'Household income is required.' });
      }

      result = quickEstimateSAI({
        householdIncome: Number(householdIncome) || 0,
        parentAssets: Number(parentAssets) || 0,
        familySize: Number(familySize) || 4,
        studentIncome: Number(studentIncome) || 0,
        studentAssets: Number(studentAssets) || 0,
        state: state || 'WA',
        filingStatus: filingStatus || 'married',
      });
    }

    // Don't send back the full inputs object (privacy)
    delete result.inputs;

    res.json(result);
  } catch (err) {
    console.error('SAI calculation error:', err);
    res.status(500).json({ error: 'Failed to calculate SAI. Please check your inputs.' });
  }
});

// ─── POST /api/financial-aid/my-strategy ───────────────────────────
router.post('/my-strategy', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const hasAccess = canAccess(user, 'financial_aid');
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Personalized strategies require Elite access.',
        _requiresUpgrade: true
      });
    }

    // Check daily message limits (strategy generation counts as 2 messages due to cost)
    const usageCheck = await checkMessageUsage(token);
    if (usageCheck && !usageCheck.allowed) {
      return res.status(429).json({
        error: `You've reached your daily ${usageCheck.upgradeReason === 'daily_messages' ? 'message' : 'monthly'} limit. Upgrade for more.`,
        _requiresUpgrade: true,
        usage: usageCheck
      });
    }

    const {
      householdIncome,
      assets,
      familySize,
      state,
      studentGPA,
      targetSchools,
      additionalContext,
      includeSAI
    } = req.body;

    // Validate required fields with type checking
    const income = Number(householdIncome);
    const famSize = Number(familySize) || 4;
    if (isNaN(income) || income <= 0) {
      return res.status(400).json({ error: 'Please provide a valid household income.' });
    }
    if (!targetSchools || !Array.isArray(targetSchools) || targetSchools.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one target school.' });
    }
    // Sanitize: ensure all school names are strings, cap length to prevent token abuse
    const cleanSchools = targetSchools
      .filter(s => typeof s === 'string' && s.trim().length > 0)
      .map(s => s.trim().slice(0, 100)) // Cap each school name to 100 chars
      .slice(0, 10); // Cap at 10 schools to prevent cost abuse (was 20)
    if (cleanSchools.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one valid school name.' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ error: 'Strategy generation is temporarily unavailable.' });
    }

    const data = await loadFinancialAidData();
    if (!data?.schools) {
      return res.status(503).json({ error: 'Financial aid database not available.' });
    }

    const matchedSchools = [];
    for (const schoolName of cleanSchools) {
      // Try direct match first
      let school = data.schools.find(s =>
        s.name?.toLowerCase().includes(schoolName.toLowerCase()) ||
        schoolName.toLowerCase().includes(s.name?.toLowerCase())
      );
      // Try alias expansion if no direct match
      if (!school) {
        const { aliases } = expandSearchQuery(schoolName);
        for (const alias of aliases) {
          school = data.schools.find(s => s.name?.toLowerCase().includes(alias));
          if (school) break;
        }
      }
      if (school && !matchedSchools.find(m => m.name === school.name)) {
        matchedSchools.push(school);
      }
    }

    if (matchedSchools.length === 0) {
      return res.status(400).json({
        error: 'None of the target schools were found in our database'
      });
    }

    const incomeCat = getIncomeCategory(income);
    const safeAssets = Number(assets) || 0;
    const safeGPA = Number(studentGPA) || 0;

    // Calculate SAI if requested
    let saiResult = null;
    if (includeSAI) {
      try {
        saiResult = quickEstimateSAI({
          householdIncome: income,
          parentAssets: safeAssets,
          familySize: famSize,
          state: state || 'WA',
          filingStatus: 'married'
        });
      } catch { /* SAI calc is optional, don't fail the strategy */ }
    }

    const schoolDetails = matchedSchools.map(s => ({
      name: s.name,
      state: s.state,
      type: s.type,
      stickerPrice: s.stickerPrice,
      costBreakdown: s.costBreakdown,
      inStateTuition: s.inStateTuition,
      meetsFullNeed: s.meetsFullNeed,
      needBlind: s.needBlind,
      netPrice: s.netPriceByIncome?.[incomeCat],
      cssRequired: s.cssRequired,
      deadline: s.deadline,
      meritScholarships: s.meritScholarships,
      aidPolicies: s.aidPolicies,
      keyInsight: s.keyInsight
    }));

    const stateGrantsInfo = state
      ? data.stateGrants?.filter(g => g.state?.toUpperCase() === state.toUpperCase())
      : [];

    const federalPrograms = data.federalPrograms || [];

    const userPrompt = `
Student Financial Profile:
- Household Income: $${income.toLocaleString()}
- Assets: ${safeAssets > 0 ? '$' + safeAssets.toLocaleString() : 'Not specified'}
- Family Size: ${famSize}
- Student GPA: ${safeGPA > 0 ? safeGPA : 'Not specified'}
- Home State: ${state || 'Not specified'}
${saiResult ? `- Estimated SAI (Student Aid Index): $${saiResult.sai.toLocaleString()}
- Estimated Pell Grant: ${saiResult.pellGrant > 0 ? '$' + saiResult.pellGrant.toLocaleString() : 'Not eligible'}` : ''}

Target Schools and Their Financial Data:
${schoolDetails.map(s => {
  const cb = s.costBreakdown;
  const costLine = cb ? `Tuition: $${cb.tuition?.toLocaleString()}, Fees: $${cb.fees?.toLocaleString()}, Room & Board: $${cb.roomBoard?.toLocaleString()}` : 'Breakdown not available';
  return `
  ${s.name} (${s.state}, ${s.type})
  - Total Cost of Attendance: $${s.stickerPrice?.toLocaleString()}
  - Cost Breakdown: ${costLine}
  ${s.inStateTuition && state?.toUpperCase() === s.state?.toUpperCase() ? `- In-State Tuition: $${s.inStateTuition.toLocaleString()} (student is in-state!)` : ''}
  - Estimated Net Price (${incomeCat} income): ${s.netPrice != null ? '$' + s.netPrice.toLocaleString() : 'N/A'}
  - Meets Full Need: ${s.meetsFullNeed ? 'Yes' : 'No'}
  - Need Blind: ${s.needBlind ? 'Yes' : 'No'}
  - CSS Profile Required: ${s.cssRequired ? 'Yes' : 'No'}
  - Aid Deadline: ${s.deadline || 'Check school website'}
  - Merit Scholarships: ${Array.isArray(s.meritScholarships) && s.meritScholarships.length > 0 ? s.meritScholarships.join('; ') : 'None listed'}
  - Aid Policies: ${Array.isArray(s.aidPolicies) && s.aidPolicies.length > 0 ? s.aidPolicies.join('; ') : 'Standard'}
  - Key Insight: ${s.keyInsight || 'None'}`;
}).join('\n')}

Federal Aid Programs Available:
${federalPrograms.filter(p => p.type === 'grant').map(p => `- ${p.name}: Up to $${p.maxAward?.toLocaleString()} — ${p.eligibility || ''}`).join('\n')}
${federalPrograms.filter(p => p.type === 'loan').map(p => `- ${p.name}: Up to $${p.maxAward?.toLocaleString()}, Rate: ${p.interestRate || 'variable'}`).join('\n')}
${federalPrograms.filter(p => p.type === 'work-study').map(p => `- ${p.name}: ${p.description || ''}`).join('\n')}

${stateGrantsInfo.length > 0 ? `
State Grants & Scholarships for ${state}:
${stateGrantsInfo.map(g => `- ${g.name}: Up to $${g.maxAward?.toLocaleString()} | ${g.needBased ? 'Need-based' : ''}${g.meritBased ? 'Merit-based' : ''} | Deadline: ${g.deadline || 'varies'}`).join('\n')}
` : ''}

Create a comprehensive, personalized financial aid strategy covering:

1. **Cost Comparison Table**: Show each school's total cost, estimated net price for this family, and annual savings vs. sticker price. If the student qualifies as in-state for any public school, highlight the in-state tuition savings.

2. **Federal Aid Eligibility**: Based on this family's income ($${income.toLocaleString()}), estimate eligibility for Pell Grant, subsidized/unsubsidized loans, and work-study. Calculate the approximate Pell Grant amount.

3. **School-by-School Analysis**: For each target school, break down the likely financial aid package (institutional grants, federal aid, loans, work-study) and the estimated out-of-pocket cost.

4. **Merit Scholarship Strategy**: Given the student's GPA${safeGPA > 0 ? ' of ' + safeGPA : ''}, identify specific merit scholarship opportunities at each school and estimated likelihood.

5. **State Aid**: Detail which state grants/scholarships the student should apply for, deadlines, and estimated award amounts.

6. **Action Plan & Timeline**: FAFSA filing date, CSS Profile deadlines, when to submit appeals, and a month-by-month checklist.

7. **Appeal Strategy**: Specific tactics for negotiating better offers, including which schools are most likely to match offers.

8. **Smart Financial Moves**: Include lesser-known but powerful strategies, such as:
   - Students with their own Roth IRA can withdraw contributions (not earnings) penalty-free for qualified education expenses
   - 529 plan strategies and grandparent-owned 529 FAFSA advantages under current rules
   - FAFSA asset protection allowance and how to position assets before filing
   - If the family has multiple children, consider timing of enrollment for FAFSA sibling benefits
   - American Opportunity Tax Credit ($2,500/year for 4 years) and Lifetime Learning Credit strategies
   - Employer tuition reimbursement programs that parents may have access to
   Only include tips that are relevant to this family's specific financial profile.

${additionalContext ? `\nAdditional Context from Student:\n${String(additionalContext).slice(0, 500)}\n\nFactor this context into your recommendations where relevant.\n` : ''}
Use markdown formatting with headers, tables, and bullet points for clarity. Be specific — cite actual program names, dollar amounts, and deadlines.
`;

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    let strategyText = '';
    try {
      const response = await client.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: `You are an expert college financial aid advisor with deep knowledge of FAFSA, CSS Profile, federal aid programs, state grants, institutional aid policies, and sophisticated tax/savings strategies. Provide a comprehensive, data-driven financial aid strategy. Use markdown formatting (headers, tables, bullet points, checkboxes) to make the output scannable and professional. Always cite specific dollar amounts, program names, and deadlines. When estimating federal aid eligibility, use the provided income data to give realistic estimates.

Key expertise areas to draw from when relevant:
- Roth IRA education strategy: Contributions (not earnings) can be withdrawn penalty-free and tax-free for qualified education expenses. This is a powerful tool many families overlook.
- 529 plan optimization: Grandparent-owned 529s no longer count against FAFSA (as of 2024 FAFSA simplification). Recommend front-loading contributions.
- FAFSA asset positioning: Money in retirement accounts is excluded from FAFSA. Small businesses with <100 employees are excluded. Time asset moves before filing.
- Tax credits: American Opportunity Tax Credit ($2,500/yr for 4 years) and Lifetime Learning Credit — never stack these, choose the better one per year.
- Sibling enrollment timing: Having multiple children in college simultaneously no longer splits the EFC under SAI, but can still impact institutional aid at CSS Profile schools.
- Appeal leverage: Use competing offers from peer schools. Best timing is within 2 weeks of receiving award letters.
- Professional judgment: Families can request FAFSA income adjustments for job loss, divorce, or unusual circumstances.

Be thorough but actionable. Present information as a trusted advisor who knows insider strategies.`,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      if (response?.content?.length > 0 && response.content[0]?.text) {
        strategyText = response.content[0].text;
      } else {
        strategyText = 'Unable to generate a detailed strategy at this time. Please try again.';
      }
    } catch (apiErr) {
      console.error('[My-Strategy] API error:', apiErr.status, apiErr.message);
      const statusMap = {
        401: 'Strategy generation is temporarily unavailable (configuration issue).',
        429: 'Too many requests. Please wait a moment and try again.',
        400: 'Could not process your request. Try adjusting your inputs.',
        503: 'AI service is temporarily unavailable. Please try again in a moment.',
      };
      return res.status(503).json({
        error: statusMap[apiErr.status] || 'Strategy generation failed. Please try again.'
      });
    }

    // Record usage: strategy counts as 2 messages (expensive API call)
    recordMessageUsage(token, 2).catch(() => {});

    res.json({
      strategy: strategyText,
      schools: schoolDetails,
      stateGrants: stateGrantsInfo,
      federalPrograms: federalPrograms.filter(p => p.type === 'grant'),
      _generated: true
    });
  } catch (err) {
    console.error('My-strategy error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export default router;
