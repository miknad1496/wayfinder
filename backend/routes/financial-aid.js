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
 * - POST /api/financial-aid/my-strategy — Generate personalized aid strategy (elite only)
 */

import { Router } from 'express';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, canAccess } from '../services/auth.js';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = Router();

let financialAidCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000;
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/miknad1496/wayfinder/main/backend/data/scraped/financial-aid-db.json';

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
    const resp = await fetch(GITHUB_RAW_URL);
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
      const query = q.toLowerCase();
      results = results.filter(s => s.name?.toLowerCase().includes(query));
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
      return res.status(503).json({ error: 'State grants database not available.' });
    }

    let results = [...data.stateGrants];

    const { state } = req.query;
    if (state) {
      results = results.filter(g => g.state?.toUpperCase() === state.toUpperCase());
    }

    res.json({
      results,
      total: results.length
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

    const {
      householdIncome,
      assets,
      familySize,
      state,
      studentGPA,
      targetSchools
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
    // Sanitize: ensure all school names are strings
    const cleanSchools = targetSchools
      .filter(s => typeof s === 'string' && s.trim().length > 0)
      .map(s => s.trim())
      .slice(0, 20); // Cap at 20 schools to prevent abuse
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
      const school = data.schools.find(s =>
        s.name?.toLowerCase().includes(schoolName.toLowerCase()) ||
        schoolName.toLowerCase().includes(s.name?.toLowerCase())
      );
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

    const schoolDetails = matchedSchools.map(s => ({
      name: s.name,
      state: s.state,
      type: s.type,
      stickerPrice: s.stickerPrice,
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

    const userPrompt = `
Student Financial Profile:
- Household Income: $${income.toLocaleString()}
- Assets: ${safeAssets > 0 ? '$' + safeAssets.toLocaleString() : 'Not specified'}
- Family Size: ${famSize}
- Student GPA: ${safeGPA > 0 ? safeGPA : 'Not specified'}
- Home State: ${state || 'Not specified'}

Target Schools and Their Financial Data:
${schoolDetails.map(s => `
  ${s.name} (${s.state})
  - Sticker Price: $${s.stickerPrice?.toLocaleString()}
  - Estimated Net Price (${incomeCat} income): $${s.netPrice?.toLocaleString() || 'N/A'}
  - Meets Full Need: ${s.meetsFullNeed ? 'Yes' : 'No'}
  - Need Blind: ${s.needBlind ? 'Yes' : 'No'}
  - CSS Profile Required: ${s.cssRequired ? 'Yes' : 'No'}
  - Application Deadline: ${s.deadline}
  - Merit Scholarships Available: ${Array.isArray(s.meritScholarships) && s.meritScholarships.length > 0 ? 'Yes' : 'No'}
  - Key Insight: ${s.keyInsight || 'None'}
`).join('\n')}
${stateGrantsInfo.length > 0 ? `
Relevant State Grants for ${state}:
${stateGrantsInfo.map(g => `
  - ${g.name}: Up to $${g.maxAward?.toLocaleString()} (Deadline: ${g.deadline})
`).join('\n')}
` : ''}

Provide personalized financial aid advice focusing on:
1. Estimated net costs at each school for this family's income level
2. Which schools offer the best value based on their financial aid policies
3. Specific merit scholarship opportunities relevant to the student
4. Strategies for appealing financial aid offers
5. FAFSA and CSS Profile timing recommendations
6. Any relevant state grants they should pursue

Be specific and reference actual programs, policies, and deadlines mentioned above.
`;

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    let strategyText = '';
    try {
      const response = await client.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: 'You are a college financial aid advisor. Analyze the student financial situation and target schools to provide personalized, actionable advice. Focus on estimated net costs, best value schools from their list, specific merit scholarship opportunities, appeal strategies, and FAFSA/CSS timing recommendations. Be specific and reference actual programs and policies.',
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

    res.json({
      strategy: strategyText,
      schools: schoolDetails,
      stateGrants: stateGrantsInfo,
      _generated: true
    });
  } catch (err) {
    console.error('My-strategy error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export default router;
