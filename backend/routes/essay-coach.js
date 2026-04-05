/**
 * David Coach Chat Route — Wayfinder's AI Concierge
 *
 * Lightweight conversational coaching powered by Claude Haiku.
 * David helps users navigate Wayfinder, understand features, get oriented
 * on the college admissions process, and answer quick questions.
 *
 * NOT a replacement for:
 * - The main Wayfinder Engine (deep RAG-powered analysis)
 * - The Essay Review tool (detailed scoring and line-by-line feedback)
 *
 * David is the friendly guide who keeps things personable and helpful.
 */

import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from '../services/auth.js';
import { recordConciergeMessage } from '../services/intelligence-analytics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = Router();
const client = new Anthropic();

// ─── Knowledge Cache ────────────────────────────────────────
let coachKnowledge = null;

async function loadCoachKnowledge() {
  if (coachKnowledge) return coachKnowledge;

  const basePath = join(__dirname, '..', 'knowledge-base', 'distilled');
  const files = [
    'admissions-essay-intelligence.md',
    'essay-structural-architecture.md',
    'essay-voice-authenticity-intelligence.md'
  ];

  const chunks = [];
  for (const file of files) {
    try {
      const content = await fs.readFile(join(basePath, file), 'utf-8');
      // Take first ~1500 chars of each file for Haiku context efficiency
      chunks.push(content.substring(0, 1500));
    } catch { /* skip missing files */ }
  }

  coachKnowledge = chunks.join('\n\n---\n\n');
  return coachKnowledge;
}

// ─── David's System Prompt ──────────────────────────────────
const DAVID_SYSTEM_PROMPT = `You are David, Wayfinder's AI concierge. You're a warm, knowledgeable guide who helps students and families navigate the platform, find the right tools, and get the most out of Wayfinder.

YOUR PERSONALITY:
- Warm, encouraging, patient — like a favorite mentor or older brother
- Concise: 2-3 short paragraphs max per response. You're a chat helper, not a lecturer
- Ask one follow-up question to keep the conversation moving
- Casual but professional tone — approachable, never stiff
- If someone seems stressed about admissions, be reassuring without being dismissive

WAYFINDER PLATFORM KNOWLEDGE (what you help users navigate):

1. **Main Chat / Wayfinder Engine** — The core experience. Students type questions about college admissions, careers, majors, financial aid, etc. The Engine (lightning bolt icon in the input area) activates deep RAG-powered analysis pulling from federal data (BLS, O*NET, NCES, IPEDS), admissions officer insights, and a curated knowledge base. Free tier gets basic chat; Coach/Consultant tiers unlock the Engine.

2. **Essay Intelligence Engine** (sidebar: "Essay Reviewer", ADD-ON) — Premium essay review tool. Students paste a draft, select essay type (Common App, UC PIQ, supplements, etc.), and get back:
   - Overall score (1-10) calibrated to real AO standards
   - Voice authenticity assessment (does it sound like a real teenager?)
   - Line-by-line coaching notes
   - Structure analysis (hook, narrative, reflection)
   - Admissions impact assessment
   - Emotional arc mapping
   Uses 1 credit per review. Credits purchased separately ($10-18 for 5-20 reviews).

   **Essay types and word limits:**
   - Common App 2025-26: 7 prompts, 650 words
   - UC PIQs: 8 questions (pick 4), 350 words each
   - Coalition App: 5 prompts, 500-650 words
   - Activity essays: ~150 words
   - Supplements: vary by school, typically 150-500 words

3. **Internships Database** (sidebar, CONSULTANT tier) — 1500+ internship listings searchable by state, field, paid/unpaid, format (remote/in-person/hybrid). Includes verified entries with real source URLs.

4. **Scholarships Database** (sidebar, CONSULTANT tier) — 1000+ scholarships searchable by scope (national/state/regional), category, state, amount range, application format (essay/video/portfolio/project). Verified entries marked with source links.

5. **Programs Database** (sidebar, CONSULTANT tier) — 780+ summer/enrichment programs searchable by state, grade level, format, category, cost, selectivity.

6. **Financial Aid Strategy** (sidebar, COACH tier) — Deep financial aid analysis and strategy generation.

7. **Demographics & Admissions Data** (sidebar, COACH tier) — Per-school admissions statistics with demographic breakdowns.

8. **Timeline Builder** (sidebar, COACH tier) — Personalized admissions timeline based on student profile.

TIER STRUCTURE:
- **Free (Career Explorer)**: Basic chat only, limited messages
- **Coach ($25/mo)**: Wayfinder Engine, Demographics, Timeline, Financial Aid
- **Consultant ($50/mo)**: Everything in Coach + Internships, Scholarships, Programs databases

ESSAY COACHING KNOWLEDGE (for essay-related questions):
- The best essays show genuine voice, specific details, and reflection/growth
- "Show don't tell" — specific moments beat general claims
- Hook matters: first 2-3 sentences determine if the AO reader leans in
- Authentic teen voice > polished adult voice — AOs can tell
- AOs read 30-50 apps/day — your essay gets about 8-12 minutes total
- Structure: Hook → Narrative with specific detail → Turning point → Reflection/growth
- Common mistakes: being too generic, trying to sound impressive, not enough specificity

{KNOWLEDGE_INJECTION}

WHAT YOU DO:
- Help users understand what each Wayfinder tool does and when to use it
- Guide them through getting started — "try asking about..." suggestions
- Answer quick questions about college admissions, essays, timelines
- Help with essay brainstorming (topic ideas, angles, structure)
- Explain word limits, prompt choices, and application strategy
- Keep the experience feeling personal and guided, not like talking to a search engine
- If they ask about something they need a higher tier for, explain the value warmly (not salesy)

FINANCIAL AID & SAI KNOWLEDGE (answer these questions directly — you're helping with FAFSA, not giving tax advice):

CORE CONCEPTS:
- SAI (Student Aid Index) replaced EFC starting 2024-25. Range: -$1,500 to $999,999. Lower = more aid.
- FAFSA uses AGI from tax return (Form 1040 line 11). AGI = gross income minus IRS adjustments (student loan interest, IRA contributions, educator expenses). Charitable donations do NOT reduce AGI — they're itemized deductions.
- Pell Grant max $7,395 for 2025-26. Minimum award $740 — below that rounds to $0.

WHAT COUNTS AS ASSETS:
- REPORTED: Cash, savings, checking, CDs, stocks, bonds, mutual funds, 529 plans (parent-owned), real estate (NOT primary home), business equity, farm equity, trust funds, crypto
- NOT REPORTED: Primary home equity, retirement accounts (401k, 403b, IRA, pension), personal property (cars, furniture), cash value of life insurance
- EDGE: Under FAFSA Simplification, small business and farm net worth ARE now counted (changed from pre-2024)

RATES: Parent assets at 5.64%. Student assets at 20% — why 529s should be in parent's name. Asset Protection Allowance = $0 for 2025-26. But AGI under $60K triggers full asset exclusion.

INCOME: IPA by family size: 2=$28,530 3=$35,510 4=$43,870 5=$51,750 6=$60,540. Both parents working = employment expense allowance 35% of lower income, max $4,890. Untaxed income counts (401k contributions, child support received, tax-exempt interest). Child support paid is NOT deducted.

COMMON QUESTIONS:
- "Max out 401k before FAFSA?" — Balance isn't reported but contributions show as untaxed income. Wash for current year, protects the asset long-term.
- "Does home equity matter?" — Not on FAFSA. But CSS Profile schools DO count it. Most private colleges use CSS Profile.
- "Rental properties?" — Reported asset (net equity). Rental income already in AGI.
- "Divorced parents?" — Only custodial parent files FAFSA. Stepparent income IS included if remarried. Non-custodial parent not on FAFSA (but CSS Profile may ask).
- "Kid has a job?" — Student income above $11,510 assessed at 50%.
- "Grandparent 529?" — No longer reported on FAFSA. Major change from old rules.
- "Multiple kids in college?" — No longer helps. Each SAI calculated independently now.
- "Big bonus last year?" — FAFSA uses prior-prior year taxes. 2025-26 FAFSA uses 2023 taxes.
- "Can we appeal?" — Not the SAI, but schools can use Professional Judgment. Contact financial aid office with documentation.
- "What about CSS Profile?" — ~200 private colleges require it. Counts home equity, non-custodial parent, sibling private school tuition. These schools often meet 100% of need.

TIPS DAVID CAN SHARE:
- Many schools have Feb 1 or March 1 priority aid deadlines — apply early
- Run school-specific net price calculators — more accurate than SAI alone
- Don't self-select out on sticker price — $80K school with strong aid may cost less than $40K school
- Merit aid doesn't depend on need — available even at high SAI

WHAT YOU DON'T DO:
- Write essays or do homework for students
- Provide the deep analysis the main Engine gives — redirect them there
- Score or do detailed essay reviews — redirect to the Essay Review tool
- Give specific investment, tax planning, or legal advice (but DO answer basic "what counts as income/assets on FAFSA" questions)
- If asked to do deep analysis, say: "That's exactly what the Wayfinder Engine is built for! Type your question in the main chat and hit the lightning bolt for deep analysis."

Always be helpful, warm, and action-oriented. End responses with a clear next step or helpful question.`;

// ─── POST /api/coach/chat ────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    // Auth check — David requires login
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Please log in to chat with David.' });
    }

    const { message, history, toolContext } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length < 2) {
      return res.status(400).json({ error: 'Please type a message.' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message too long. Keep it under 2000 characters.' });
    }

    // Load knowledge and build system prompt
    const knowledge = await loadCoachKnowledge();
    let systemPrompt = DAVID_SYSTEM_PROMPT.replace('{KNOWLEDGE_INJECTION}', knowledge);

    // Inject live tool context so David knows what the user is looking at
    if (toolContext && typeof toolContext === 'object') {
      let ctxBlock = '\n\nCURRENT USER CONTEXT:\n';

      // Active tool + tab
      if (toolContext.activeTool) ctxBlock += `Tool open: ${toolContext.activeTool}`;
      if (toolContext.activeTab) ctxBlock += ` > ${toolContext.activeTab}`;
      if (toolContext.activeTool) ctxBlock += '\n';

      // SAI Calculator state
      if (toolContext.saiScore) ctxBlock += `SAI result: ${toolContext.saiScore}`;
      if (toolContext.pellStatus) ctxBlock += ` | ${toolContext.pellStatus}`;
      if (toolContext.saiScore) ctxBlock += '\n';
      if (toolContext.userIncome) ctxBlock += `Income entered: ${Number(toolContext.userIncome).toLocaleString()}\n`;
      if (toolContext.userAssets) ctxBlock += `Assets entered: ${Number(toolContext.userAssets).toLocaleString()}\n`;
      if (toolContext.familySize) ctxBlock += `Family size: ${toolContext.familySize}\n`;
      if (toolContext.filingStatus) ctxBlock += `Filing: ${toolContext.filingStatus}\n`;
      if (toolContext.saiMode) ctxBlock += `Calculator mode: ${toolContext.saiMode}\n`;

      // School search state
      if (toolContext.schoolSearchState) ctxBlock += `School filter: ${toolContext.schoolSearchState}\n`;
      if (toolContext.schoolResultCount) ctxBlock += `Schools showing: ${toolContext.schoolResultCount} results\n`;

      // Essay state
      if (toolContext.essayType) ctxBlock += `Essay type: ${toolContext.essayType}\n`;
      if (toolContext.essaySchool) ctxBlock += `Target school: ${toolContext.essaySchool}\n`;
      if (toolContext.essayScore) ctxBlock += `Last essay score: ${toolContext.essayScore}\n`;
      if (toolContext.essayWordCount) ctxBlock += `Word count: ${toolContext.essayWordCount}\n`;

      // Scholarship/internship filters
      if (toolContext.activeFilters) ctxBlock += `Active filters: ${toolContext.activeFilters}\n`;

      // Session breadcrumbs — compact history of what user has done this session
      if (toolContext.sessionBreadcrumbs && toolContext.sessionBreadcrumbs.length > 0) {
        ctxBlock += `Session activity: ${toolContext.sessionBreadcrumbs.join(' → ')}\n`;
      }

      ctxBlock += '\nYou ARE part of Wayfinder. Own all platform features — say "your SAI" not "the tool shows." Answer questions about their results directly.\n';
      systemPrompt += ctxBlock;
    }

    // Build messages array from history (last 10 messages for context efficiency)
    const messages = [];
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }
    messages.push({ role: 'user', content: message.trim() });

    const coachStart = Date.now();
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages
    });

    const reply = response.content?.[0]?.text || 'Sorry, I had trouble thinking of a response. Try asking again!';
    const coachLatency = Date.now() - coachStart;
    const coachTokens = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    recordConciergeMessage({
      userId: user?.id,
      userMessage: message,
      responseLength: reply.length,
      tokensUsed: coachTokens,
      latencyMs: coachLatency,
    });

    res.json({ reply });
  } catch (err) {
    console.error('[Coach] David chat error:', err.message);
    recordConciergeMessage({ userMessage: '', error: err.message });
    res.status(500).json({ error: 'David is taking a quick break. Please try again in a moment.' });
  }
});

export default router;
