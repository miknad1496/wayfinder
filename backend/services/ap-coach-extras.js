/**
 * AP Coach Chat + Tutor services — REVAMP V2: AP COACH FULL MODULE PATCH81
 *
 * Adds two new generative services to the AP Coach module:
 *
 *   coachChat()          — free-form Q&A grounded in per-exam knowledge + per-unit
 *                          brains. SLM-primary; Opus supplement on complex queries.
 *
 *   generateTeachingGuide() — full teaching-guide builder. Takes an exam + topic
 *                             (e.g., "AP Chemistry" + "VSEPR + Lewis structures")
 *                             and produces a 10-page (~3000-5000 word) markdown
 *                             teaching guide with tier-tagged content [3]/[4]/[5],
 *                             worked examples, formula boxes, KaTeX-renderable
 *                             equations. Opus + RAG context.
 *
 * Both services load the existing per-exam knowledge files (loaded by patch 67's
 * loadKnowledge()) plus auto-discovered ap-units/<exam>/<unit>.md brains
 * (added in patch 80 via knowledge.js loadApUnitsBrains()).
 */

import Anthropic from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Anthropic();

// Per-unit brain cache (loaded once at startup)
let apUnitsCache = null;

async function loadApUnitsCacheOnce() {
  if (apUnitsCache !== null) return apUnitsCache;
  apUnitsCache = {};
  try {
    const apUnitsDir = join(__dirname, '..', 'knowledge-base', 'ap-units');
    await fs.access(apUnitsDir);
    const entries = await fs.readdir(apUnitsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const examSlug = entry.name;
        if (!apUnitsCache[examSlug]) apUnitsCache[examSlug] = {};
        const subdir = join(apUnitsDir, entry.name);
        const subFiles = await fs.readdir(subdir);
        for (const sub of subFiles) {
          if (!sub.endsWith('.md')) continue;
          const unitSlug = sub.replace(/\.md$/, '');
          apUnitsCache[examSlug][unitSlug] = await fs.readFile(join(subdir, sub), 'utf8');
        }
      } else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
        const fname = entry.name.replace(/\.md$/, '');
        const dashIdx = fname.indexOf('-unit-');
        const examSlug = dashIdx > 0 ? fname.slice(0, dashIdx) : fname.split('-')[0];
        const unitSlug = dashIdx > 0 ? fname.slice(dashIdx + 1) : fname;
        if (!apUnitsCache[examSlug]) apUnitsCache[examSlug] = {};
        apUnitsCache[examSlug][unitSlug] = await fs.readFile(join(apUnitsDir, entry.name), 'utf8');
      }
    }
    const totalUnits = Object.values(apUnitsCache).reduce((sum, exam) => sum + Object.keys(exam).length, 0);
    if (totalUnits > 0) console.log('[ApCoach] Per-unit brains: ' + totalUnits + ' units across ' + Object.keys(apUnitsCache).length + ' exams');
  } catch (err) {
    // ap-units/ doesn't exist yet (no per-unit content authored) — fine, return empty
  }
  return apUnitsCache;
}

// Pre-load at module init
loadApUnitsCacheOnce().catch(() => {});

/**
 * Detect which AP exam (and optionally which unit) a free-form query is about.
 * Returns { exam, unit } or { exam: null, unit: null } if not detectable.
 */
function detectTopicScope(query) {
  if (!query) return { exam: null, unit: null };
  const q = query.toLowerCase();
  // Exam name detection
  const examMap = {
    'ap chem': 'ap-chemistry', 'chemistry': 'ap-chemistry',
    'apush': 'ap-us-history', 'us history': 'ap-us-history', 'american history': 'ap-us-history',
    'ap world': 'ap-world-history', 'world history': 'ap-world-history',
    'ap euro': 'ap-european-history', 'european history': 'ap-european-history',
    'calc bc': 'ap-calc-bc', 'calculus bc': 'ap-calc-bc',
    'calc ab': 'ap-calc-ab', 'calculus ab': 'ap-calc-ab',
    'ap stats': 'ap-statistics', 'statistics': 'ap-statistics',
    'ap bio': 'ap-biology', 'biology': 'ap-biology',
    'ap gov': 'ap-government', 'government': 'ap-government',
    'ap lang': 'ap-english-lang', 'english language': 'ap-english-lang',
    'ap lit': 'ap-english-lit', 'english literature': 'ap-english-lit',
    'precalc': 'ap-precalculus', 'precalculus': 'ap-precalculus',
    'macro': 'ap-macroeconomics', 'macroeconomics': 'ap-macroeconomics',
    'micro': 'ap-microeconomics', 'microeconomics': 'ap-microeconomics',
    'physics 1': 'ap-physics-1',
    'physics 2': 'ap-physics-2',
    'physics c em': 'ap-physics-c-em', 'physics c e&m': 'ap-physics-c-em',
    'physics c mech': 'ap-physics-c-mech', 'physics c mechanics': 'ap-physics-c-mech',
    'psychology': 'ap-psychology', 'ap psych': 'ap-psychology',
    'environmental': 'ap-environmental-science',
    'human geo': 'ap-human-geography', 'human geography': 'ap-human-geography',
    'csa': 'ap-csa', 'computer science a': 'ap-csa',
    'csp': 'ap-csp', 'computer science principles': 'ap-csp',
    'spanish': 'ap-spanish', 'french': 'ap-french',
    'music theory': 'ap-music-theory', 'art history': 'ap-art-history',
  };
  let exam = null;
  for (const [keyword, slug] of Object.entries(examMap)) {
    if (q.includes(keyword)) { exam = slug; break; }
  }
  return { exam, unit: null };
}

/**
 * Build RAG context for coach chat or tutor — pulls per-exam knowledge + matching
 * per-unit brain (when available) + scope hint for the LLM.
 */
function buildApContext(exam, unit, perExamKnowledge) {
  const blocks = [];
  if (exam && perExamKnowledge && perExamKnowledge[exam]) {
    blocks.push('=== ' + exam.toUpperCase() + ' STRATEGIC KNOWLEDGE ===\n' + perExamKnowledge[exam]);
  }
  if (apUnitsCache && exam && apUnitsCache[exam]) {
    const examUnits = apUnitsCache[exam];
    if (unit && examUnits[unit]) {
      blocks.push('=== ' + exam.toUpperCase() + ' UNIT ' + unit.toUpperCase() + ' BRAIN ===\n' + examUnits[unit]);
    } else {
      // Inject all units for this exam (capped) since we couldn't pinpoint the unit
      const allUnits = Object.values(examUnits).slice(0, 3).join('\n\n---\n\n');
      if (allUnits) blocks.push('=== ' + exam.toUpperCase() + ' UNIT BRAINS (all available) ===\n' + allUnits);
    }
  }
  return blocks.join('\n\n');
}

/**
 * Coach Chat — free-form Q&A. SLM-primary; Opus on complex queries.
 *
 * @param {string} message - the user's chat message
 * @param {object} session - { history: [...], context: {...} }
 * @param {object} perExamKnowledge - the loaded ap-exams/*.md cache from ap-coach.js
 * @param {object} options - { useOpus: boolean }
 */
export async function coachChat(message, session, perExamKnowledge, options = {}) {
  const startTime = Date.now();
  if (!message || typeof message !== 'string') {
    return { success: false, error: 'message required' };
  }

  await loadApUnitsCacheOnce();
  const scope = detectTopicScope(message);
  const ragContext = buildApContext(scope.exam, scope.unit, perExamKnowledge);

  const systemPrompt = [
    'You are Wayfinder AP Coach — a strategic, conversational AP study companion.',
    '',
    'Wayfinder rule: NEVER mention Claude, Anthropic, OpenAI, or that you are an AI. You are Wayfinder.',
    '',
    'You help students with ANY AP-related question: concept explanations, strategy advice, study planning, FRQ technique, "I have X weeks until exam Y, what should I prioritize," "explain VSEPR," "compare these two answer approaches," etc. Conversational and warm — not bureaucratic.',
    '',
    'GROUNDING:',
    '- You have access to Wayfinder\'s curated AP intelligence below (per-exam knowledge files and per-unit brains where authored). PREFER this content over your training-data prior when grounding answers.',
    '- If the user asks about an exam/unit not covered, give your best general AP guidance and note that we have deeper coverage on commonly-tested exams.',
    '',
    'STYLE:',
    '- 200-500 words typical response. Concise but substantive.',
    '- Use markdown freely (lists, bold, code blocks). KaTeX inline math via $...$ or block via $$...$$ — frontend will render.',
    '- Tier-tag advice when relevant: [3] foundational / [4] floor / [5] stretch.',
    '- End with a concrete next-step recommendation when possible.',
    '',
    'CONTEXT FROM WAYFINDER\'S CURATED INTELLIGENCE:',
    ragContext || '(no specific exam detected — answer with general AP guidance)',
  ].join('\n');

  // Build conversation messages
  const recentHistory = (session?.history || []).slice(-8);
  const messages = recentHistory.map(h => ({ role: h.role, content: h.content }));
  messages.push({ role: 'user', content: message });

  const useOpus = !!options.useOpus;
  const model = useOpus
    ? (process.env.CLAUDE_MODEL_ENGINE || 'claude-opus-4-6')
    : (process.env.CLAUDE_MODEL_HAIKU || 'claude-haiku-4-5-20251001');

  try {
    const resp = await client.messages.create({
      model,
      max_tokens: 1500,
      system: systemPrompt,
      messages,
    });
    const text = (resp.content?.[0]?.text || '').trim();
    const tokensUsed = (resp.usage?.input_tokens || 0) + (resp.usage?.output_tokens || 0);
    const latencyMs = Date.now() - startTime;
    return { success: true, text, tokensUsed, latencyMs, scope, model };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Generate a custom teaching guide on demand. Opus + RAG.
 * Returns markdown with KaTeX inline math, ready to render in-app.
 *
 * @param {string} exam - e.g., 'ap-chemistry'
 * @param {string} topic - e.g., 'VSEPR and Lewis structures'
 * @param {string} targetTier - '3' | '4' | '5' (focus tier)
 * @param {object} perExamKnowledge - cache from ap-coach.js
 */
export async function generateTeachingGuide(exam, topic, targetTier, perExamKnowledge) {
  const startTime = Date.now();
  if (!exam || !topic) {
    return { success: false, error: 'exam + topic required' };
  }

  await loadApUnitsCacheOnce();
  const ragContext = buildApContext(exam, null, perExamKnowledge);

  const systemPrompt = [
    'You are Wayfinder AP Tutor. Generate a complete, dense, useful TEACHING GUIDE on the requested topic.',
    '',
    'Wayfinder rule: NEVER mention Claude, Anthropic, OpenAI, or that you are an AI. You are Wayfinder.',
    '',
    'OUTPUT FORMAT: Markdown only. Use:',
    '- # for the title',
    '- ## for sections (4-7 sections per guide)',
    '- ### for subsections',
    '- KaTeX inline math: $E = mc^2$ or block: $$F = ma$$ — frontend renders both',
    '- Lists for bullets, ordered lists for steps',
    '- > blockquotes for KEY INSIGHT or WATCH OUT callouts (prefix with **KEY INSIGHT:** or **WATCH OUT:**)',
    '- Tier badges inline: [3] foundational / [4] floor / [5] stretch — frontend renders as colored chips',
    '',
    'STRUCTURE (every guide):',
    '1. # Title — "AP <exam> — <topic> — Tutor Guide"',
    '2. ## Topic at a glance — what this is, exam weight, sub-topics, where it appears',
    '3. ## Big Ideas — 3-5 organizing principles',
    '4. ## Tier-tagged content — sections for [3], [4], [5] separately',
    '5. ## Worked Examples — 2-4 problems with step-by-step reasoning',
    '6. ## Top Traps — numbered specific errors students make',
    '7. ## Phrases that score — verbatim language for FRQs',
    '8. ## If you do nothing else — single-sentence highest-leverage move (italicized, centered if possible)',
    '',
    'LENGTH: aim for 2500-4500 words. Dense but readable. NOT a textbook chapter — a focused teaching guide.',
    '',
    'TARGET TIER: the user is targeting a ' + (targetTier || '4 or 5') + '. Calibrate depth accordingly: bias toward what THIS tier needs.',
    '',
    'GROUNDING: prefer Wayfinder\'s curated content below over your training-data prior.',
    '',
    'CONTEXT:',
    ragContext || '(no specific exam knowledge file — use general AP intelligence)',
  ].join('\n');

  const userPrompt = [
    'EXAM: ' + exam,
    'TOPIC: ' + topic,
    'TARGET SCORE TIER: ' + (targetTier || '4-5'),
    '',
    'Produce the full teaching guide now. Markdown only — no preamble, no explanation. Start with the # title.',
  ].join('\n');

  try {
    const resp = await client.messages.create({
      model: process.env.CLAUDE_MODEL_ENGINE || 'claude-opus-4-6',
      max_tokens: 6000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const markdown = (resp.content?.[0]?.text || '').trim();
    const tokensUsed = (resp.usage?.input_tokens || 0) + (resp.usage?.output_tokens || 0);
    const latencyMs = Date.now() - startTime;
    const wordCount = markdown.split(/\s+/).length;
    return { success: true, markdown, tokensUsed, latencyMs, wordCount };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Compute days/weeks until a given AP exam date based on the schedule JSON.
 * @param {string} exam - exam slug
 * @param {object} schedule - the loaded ap-exam-schedule.json content
 */
export function getExamCountdown(exam, schedule) {
  if (!schedule || !schedule.exams || !schedule.exams[exam]) return null;
  const dateStr = schedule.exams[exam].date;
  const examDate = new Date(dateStr + 'T08:00:00Z');
  const now = new Date();
  const diffMs = examDate - now;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return {
    exam,
    label: schedule.exams[exam].label,
    date: dateStr,
    daysUntil: days,
    weeksUntil: Math.ceil(days / 7),
    isPast: days < 0,
  };
}
