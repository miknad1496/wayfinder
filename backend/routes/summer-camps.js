// Summer Camps (K-8) module — interactive features for parents of elementary
// and middle school kids. Three endpoints + the curated insights:
//   GET  /api/summer-camps/insights — returns curated tips/hacks (static JSON)
//   POST /api/summer-camps/plan      — interactive planner; takes parent inputs,
//                                       calls SLM (with Haiku fallback) to build
//                                       a tailored summer plan
//   POST /api/summer-camps/ask       — free-form K-8-calibrated question, calls
//                                       SLM (with Haiku fallback)
//
// Browse uses the existing /api/programs route with grade filter — no duplicate
// DB infrastructure.

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import { chatSLM, isSLMAvailable } from '../services/slm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INSIGHTS_PATH = path.join(__dirname, '..', 'data', 'scraped', 'summer-camp-insights.json');

const router = express.Router();

let claudeClient = null;
function getClaude() {
  if (claudeClient) return claudeClient;
  if (!process.env.ANTHROPIC_API_KEY) return null;
  claudeClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return claudeClient;
}

let insightsCache = null;
function loadInsights() {
  if (insightsCache) return insightsCache;
  try {
    insightsCache = JSON.parse(fs.readFileSync(INSIGHTS_PATH, 'utf8'));
  } catch (e) {
    console.error('[summer-camps] failed to load insights:', e.message);
    insightsCache = { sections: [] };
  }
  return insightsCache;
}

// GET /api/summer-camps/insights — returns curated static content (no LLM cost)
router.get('/insights', (req, res) => {
  const data = loadInsights();
  res.json({
    sections: data.sections || [],
    metadata: data.metadata || {},
  });
});

// POST /api/summer-camps/plan — interactive K-8 summer planner
// Body: { grade, age, city, state, budget, hoursPerWeek, interests, careerCurious }
router.post('/plan', async (req, res) => {
  const {
    grade = '3',
    age,
    city = '',
    state = 'WA',
    budget = 'medium',  // free | low (<$300/wk) | medium ($300-500/wk) | high (>$500/wk) | flexible
    weeks = 4,
    interests = [],     // ['stem','arts','sports','nature','music','coding','reading'...]
    careerCurious = '', // freeform, optional
    sleepawayInterest = false,
    needsScholarshipInfo = false,
  } = req.body || {};

  if (!grade) return res.status(400).json({ error: 'grade required' });

  // Build SLM prompt with K-8-specific calibration
  const interestList = Array.isArray(interests) && interests.length > 0
    ? interests.join(', ') : 'mixed';
  const ageDesc = age ? `${age}-year-old` : `grade ${grade}`;
  const locationDesc = city ? `${city}, ${state}` : state;
  const budgetDesc = budget === 'free' ? 'free or near-free only ($0-100/wk)'
    : budget === 'low' ? 'budget-friendly (<$300/wk)'
    : budget === 'medium' ? 'mid-tier ($300-500/wk)'
    : budget === 'high' ? 'premium acceptable (>$500/wk)'
    : 'flexible budget';

  const systemPrompt = `You are Wayfinder, a college and career advisory platform that ALSO maintains the most thoughtful K-8 summer + enrichment guidance for parents. A parent is using the Summer Camps planner.

CALIBRATION FOR K-8 PLANNING:
- This is NOT college admissions. Don't frame summers as resume-building. Focus on: childcare logistics, social development, exposure to varied interests, building independence, and giving kids experiences that compound over years.
- Cost calibration matters HUGELY. Be honest about what costs what. Free public library + parks dept rec is often as good as $500/wk specialty camps.
- Scholarship availability is real and under-applied-for. Mention it.
- Sleepaway camp is age-appropriate starting age 7-8 for shorter sessions, 9-10 for longer. Don't push it on younger kids.
- Wayfinder's database has a growing curated list (especially WA + nationwide remote). Reference it confidently. For specific named programs, be conservative — suggest categories the user can filter for in the Programs sidebar tool with grade filter set to elementary/middle.
- Use the 60/30/10 frame: ~60% recurring anchor (Y day camp / parks dept), ~30% specialty experiences (1-2 museum/zoo/coding camps), ~10% wildcard (the niche experience).

Your output must be a JSON object:
{
  "summary": "1-2 sentence framing of the recommended approach for THIS family",
  "anchorRecommendation": { "type": "...", "rationale": "...", "lookFor": ["...", "..."] },
  "specialtyRecommendations": [
    { "category": "STEM|arts|nature|music|...", "rationale": "...", "lookFor": ["specific program type or named programs"], "estimatedCost": "$X-Y/week" }
  ],
  "wildcardSuggestion": { "idea": "...", "rationale": "..." },
  "scholarshipNote": "specific scholarship hunting advice for this family's budget level",
  "watchOuts": ["1-2 things this family specifically should avoid"],
  "nextStep": "concrete first action to take this week"
}

ONLY return JSON. No preamble, no markdown.`;

  const userPrompt = `Build a K-8 summer plan for:
- ${ageDesc}, currently in grade ${grade}
- Location: ${locationDesc}
- Budget: ${budgetDesc}
- Available weeks for camps: ${weeks}
- Interests: ${interestList}${careerCurious ? `\n- Curious about: ${careerCurious}` : ''}${sleepawayInterest ? `\n- Open to sleepaway: yes` : ''}${needsScholarshipInfo ? `\n- Needs scholarship/aid information` : ''}

Be specific to THIS family. Consider their budget honestly. Mention scholarship pathways if budget is low or they specifically asked.`;

  // Try SLM first (cheap), fallback to Haiku
  try {
    let response;
    let mode = 'slm';
    if (isSLMAvailable()) {
      try {
        response = await chatSLM([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ], { maxTokens: 1200 });
      } catch (slmErr) {
        console.warn('[summer-camps/plan] SLM failed, falling back to Haiku:', slmErr.message);
        response = null;
      }
    }
    if (!response) {
      mode = 'haiku';
      const claude = getClaude();
      if (!claude) return res.status(503).json({ error: 'Plan service unavailable (LLM not configured)' });
      const r = await claude.messages.create({
        model: process.env.CLAUDE_MODEL_HAIKU || 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });
      response = { text: r.content?.[0]?.text || '{}', tokensUsed: (r.usage?.input_tokens || 0) + (r.usage?.output_tokens || 0) };
    }

    // Parse JSON
    let parsed = {};
    try {
      const m = response.text.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : {};
    } catch (e) {
      return res.status(502).json({ error: 'Plan generation returned unparseable response. Try again.' });
    }

    res.json({
      plan: parsed,
      mode,
      tokensUsed: response.tokensUsed || 0,
      disclaimer: 'AI-generated plan. Verify program details + scholarship application windows directly with each org. Use the Programs sidebar tool with grade filter set to elementary/middle to browse the full curated database.',
    });
  } catch (err) {
    console.error('[summer-camps/plan] error:', err.message);
    res.status(500).json({ error: 'Plan generation failed: ' + err.message });
  }
});

// POST /api/summer-camps/ask — free-form K-8 question
// Body: { question, grade?, city?, state? }
router.post('/ask', async (req, res) => {
  const { question, grade = '', city = '', state = '' } = req.body || {};
  if (!question || String(question).trim().length < 5) {
    return res.status(400).json({ error: 'question required (at least 5 chars)' });
  }

  const ctxLines = [];
  if (grade) ctxLines.push(`Grade: ${grade}`);
  if (city || state) ctxLines.push(`Location: ${city}${city && state ? ', ' : ''}${state}`);
  const userCtx = ctxLines.length ? `\n[Parent context: ${ctxLines.join(' · ')}]\n\n` : '\n';

  const systemPrompt = `You are Wayfinder. The parent is asking a K-8 elementary/middle school enrichment + summer camps question through the dedicated Summer Camps tool.

CALIBRATION:
- This is NOT college admissions. Focus on practical guidance for K-8 parents: cost, scholarships, age-appropriateness, social/emotional fit, logistics.
- Be specific about cost ranges, registration windows, scholarship pathways.
- For named programs, mention 2-3 from these reliable categories: YMCA, Camp Fire, museum/zoo/aquarium camps, Camp Galileo, iD Tech, Camp Invention, university youth programs (UW Robinson Center, DigiPen).
- For WA-specific recommendations: KidsQuest (Bellevue), Burke Museum, Pacific Science Center, Woodland Park Zoo, Seattle Aquarium, Seattle Children's Theatre, Camp Orkila, Camp Sealth, Point Defiance Zoo (Tacoma), Music Center NW.
- For nationwide/remote: iD Tech, Outschool, Camp Invention, Khan Academy, Camp Galileo Online.
- Tell them: "Use the Programs sidebar tool with grade filter set to elementary or middle to see the full filterable list."
- Keep responses practical, concise (200-400 words), warm but direct.
- For cost-sensitive families, ALWAYS mention scholarship availability + library/parks dept options.

Answer the question directly. No preamble. No "great question!". Just the substance.`;

  try {
    let response;
    let mode = 'slm';
    if (isSLMAvailable()) {
      try {
        response = await chatSLM([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userCtx + question }
        ], { maxTokens: 700 });
      } catch (slmErr) {
        console.warn('[summer-camps/ask] SLM failed, falling back to Haiku:', slmErr.message);
        response = null;
      }
    }
    if (!response) {
      mode = 'haiku';
      const claude = getClaude();
      if (!claude) return res.status(503).json({ error: 'Ask service unavailable (LLM not configured)' });
      const r = await claude.messages.create({
        model: process.env.CLAUDE_MODEL_HAIKU || 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: 'user', content: userCtx + question }],
      });
      response = { text: r.content?.[0]?.text || '', tokensUsed: (r.usage?.input_tokens || 0) + (r.usage?.output_tokens || 0) };
    }

    res.json({
      answer: response.text,
      mode,
      tokensUsed: response.tokensUsed || 0,
    });
  } catch (err) {
    console.error('[summer-camps/ask] error:', err.message);
    res.status(500).json({ error: 'Ask failed: ' + err.message });
  }
});

export default router;
