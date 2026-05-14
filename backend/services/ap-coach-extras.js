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

// PATCH156 - format the user's saved Game Plan profile (exams, target score,
// hours/week) into a system-prompt block so the LLM can reason about their
// goal + study load. Returns empty string if no profile is set.
function _formatUserProfile(profile) {
  if (!profile || typeof profile !== 'object') return '';
  const lines = ['USER PROFILE (Wayfinder Game Plan):'];
  if (Array.isArray(profile.exams) && profile.exams.length > 0) {
    const labels = profile.exams.slice(0, 12).map(slug => {
      if (typeof slug !== 'string') return null;
      return slug.replace(/^ap-/, 'AP ').replace(/-/g, ' ');
    }).filter(Boolean);
    if (labels.length > 0) lines.push('- Targeting: ' + labels.join(', '));
  }
  if (profile.defaultTargetScore != null) {
    const ts = parseInt(profile.defaultTargetScore, 10);
    if (Number.isFinite(ts) && ts >= 1 && ts <= 5) lines.push('- Default target score: ' + ts);
  }
  if (profile.hoursPerWeek != null) {
    const hrs = parseInt(profile.hoursPerWeek, 10);
    if (Number.isFinite(hrs) && hrs > 0 && hrs <= 80) lines.push('- Study time: ' + hrs + ' hrs/week');
  }
  if (lines.length === 1) return ''; // no useful fields
  lines.push('');
  lines.push('Use this profile to calibrate your advice. If they ask a generic question,');
  lines.push('default to whichever exam in their list seems most relevant. Reference their');
  lines.push('target score when discussing tier-tagged advice.');
  lines.push('');
  return lines.join('\n');
}

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
 * @param {object} options - { useOpus?: boolean, examHint?: string, userProfile?: object }
 *   - examHint: AP exam slug from the UI dropdown (e.g. 'ap-english-lang'). Takes
 *     precedence over keyword-detection from the message text. PATCH156 fix:
 *     previously this option was accepted but ignored, so even when the user
 *     picked AP English Language in the Subject dropdown, a generic question
 *     ("what should I cram for tomorrow's test?") fell back to keyword detection
 *     which returned null, leaving the LLM with no exam context.
 *   - userProfile: the user's apProfile (exams[], defaultTargetScore, hoursPerWeek)
 *     so chat answers can reference their goal score + study load.
 */
export async function coachChat(message, session, perExamKnowledge, options = {}) {
  const startTime = Date.now();
  if (!message || typeof message !== 'string') {
    return { success: false, error: 'message required' };
  }

  await loadApUnitsCacheOnce();
  // PATCH156: prefer the explicit examHint from the UI dropdown over fragile
  // keyword detection. Only fall back to detectTopicScope when no hint is set.
  const detected = detectTopicScope(message);
  const hint = (typeof options.examHint === 'string' && options.examHint.trim())
    ? options.examHint.trim().toLowerCase()
    : null;
  const examForContext = (hint && perExamKnowledge && perExamKnowledge[hint])
    ? hint
    : detected.exam;
  const ragContext = buildApContext(examForContext, detected.unit, perExamKnowledge);
  const examLabelHint = examForContext
    ? examForContext.replace(/^ap-/, 'AP ').replace(/-/g, ' ').toUpperCase()
    : null;

  // PATCH156: surface the user's saved Game Plan (exams + target score + hours/week)
  // so chat answers can reason about their goal and time budget.
  const profileBlock = _formatUserProfile(options.userProfile);

  const systemPrompt = [
    'You are Wayfinder AP Coach — a strategic, conversational AP study companion.',
    '',
    'Wayfinder rule: NEVER mention Claude, Anthropic, OpenAI, or that you are an AI. You are Wayfinder.',
    '',
    'You help students with ANY AP-related question: concept explanations, strategy advice, study planning, FRQ technique, "I have X weeks until exam Y, what should I prioritize," "explain VSEPR," "compare these two answer approaches," etc. Conversational and warm — not bureaucratic.',
    '',
    examLabelHint
      ? 'CURRENT SUBJECT IN FOCUS: the user has selected ' + examLabelHint + ' in the Subject dropdown. Treat all of their questions as referring to that exam unless they explicitly switch context. Do NOT ask "which AP exam?" — they already told you.'
      : 'CURRENT SUBJECT IN FOCUS: the user has not picked a Subject yet — if their question is exam-specific and ambiguous, ask once which exam they mean.',
    '',
    profileBlock,
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
    ragContext || '(no specific exam knowledge loaded — answer with general AP guidance)',
  ].filter(Boolean).join('\n');

  // Build conversation messages
  const recentHistory = (session?.history || []).slice(-8);
  const messages = recentHistory.map(h => ({ role: h.role, content: h.content }));
  messages.push({ role: 'user', content: message });

  const useOpus = !!options.useOpus;
  const model = useOpus
    ? (process.env.CLAUDE_MODEL_ENGINE || 'claude-opus-4-7')
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
    // PATCH164: was 'scope' (undeclared since patch 156 renamed it to 'detected').
    // Caused coachChat to return success:false with error 'scope is not defined'
    // on every Coach Chat call. Same TDZ/undef class as patch 159.
    return { success: true, text, tokensUsed, latencyMs, scope: detected, model };
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
export async function generateTeachingGuide(exam, topic, targetTier, perExamKnowledge, userProfile) {
  const startTime = Date.now();
  if (!exam || !topic) {
    return { success: false, error: 'exam + topic required' };
  }

  await loadApUnitsCacheOnce();
  const ragContext = buildApContext(exam, null, perExamKnowledge);
  // PATCH156: surface the user's Game Plan profile in the tutor system prompt too
  const profileBlock = _formatUserProfile(userProfile);

  const systemPrompt = [
    'You are Wayfinder AP Tutor. Generate a complete, dense, exceptionally useful TEACHING GUIDE on the requested topic — at the caliber of the AP Chemistry and AP Precalculus reference guides Wayfinder ships (those are the quality bar; do not fall below them).',
    '',
    'Wayfinder rule: NEVER mention Claude, Anthropic, OpenAI, or that you are an AI. You are Wayfinder.',
    '',
    'CALIBER REQUIREMENT — every guide must include:',
    '- Specific, named worked examples (not "consider a problem where...") — actual numbers, actual setups, actual answers walked step-by-step',
    '- Tier badges threaded into the body. [3] = what a 3-scorer needs to lock down. [4] = what jumps a 3 to a 4 (the FLOOR for a strong AP). [5] = the STRETCH that separates 4 from 5.',
    '- Phrases-that-score — the exact words/templates that earn rubric points on FRQs (every AP rubric rewards specific verbal moves; surface those verbatim)',
    '- Top Traps — what specifically goes wrong, with the FIX. Not generic ("students forget steps") — concrete ("students forget the negative sign on the d/dx of cos(x); fix: write the rule down before solving").',
    '- "Math of a 5" or "Math of a 4" framing — concretely, how many of each rubric point are required for that score, what the typical 4-scorer is missing.',
    '- KaTeX rendering: block math $$F = ma$$ and inline $E=mc^2$. Use them liberally. The frontend renders both.',
    '',
    'OUTPUT FORMAT: Markdown only. Use:',
    '- # for the title',
    '- ## for top-level sections',
    '- ### for subsections (tier sub-headers, worked example titles, etc.)',
    '- KaTeX inline math $...$ and block $$...$$',
    '- Bulleted + numbered lists where they help density',
    '- > blockquotes for KEY INSIGHT or WATCH OUT callouts (prefix with **KEY INSIGHT:** or **WATCH OUT:**)',
    '- Inline tier badges: [3] foundational / [4] floor / [5] stretch — frontend renders these as colored chips',
    '- Tables when comparing concepts side-by-side (frontend supports markdown tables)',
    '',
    'STRUCTURE (mandatory for every guide):',
    '1. # Title — "AP <exam> — <topic> — Tutor Guide"',
    '2. ## Topic at a glance — what this concept is, where it lives in the curriculum, exam weight (% of MCQ + FRQ), connected sub-topics',
    '3. ## Big Ideas — 3-5 organizing principles, each with a one-line "why this matters for the rubric"',
    '4. ## The math of a 5 (or 4) — concretely what point distribution gets you that score on this topic',
    '5. ## [3] Foundational — what every test-taker has to know cold',
    '6. ## [4] The floor for a strong AP — what jumps a 3 to a 4',
    '7. ## [5] The stretch — what separates a 4 from a 5',
    '8. ## Worked Examples — 3-5 problems, fully worked, with the step-by-step reasoning AND a "scoring annotation" calling out WHICH rubric point each step earns',
    '9. ## Top Traps — numbered, specific, with the fix in plain language',
    '10. ## Phrases that score — table or list of EXACT verbal templates the rubric rewards',
    '11. ## If you do nothing else — single bold sentence with the highest-leverage move',
    '',
    'LENGTH: aim for 3000-5500 words. Dense but readable. Mirror the AP Chemistry / AP Precalculus reference guides — comprehensive enough that a strong student could use this as their primary review for the topic.',
    '',
    'TARGET TIER: the user is targeting a ' + (targetTier || '4 or 5') + '. Calibrate depth accordingly: bias toward what THIS tier needs.',
    '',
    profileBlock,
    'GROUNDING: prefer Wayfinder\'s curated content below over your training-data prior.',
    '',
    'CONTEXT:',
    ragContext || '(no specific exam knowledge file — use general AP intelligence)',
  ].filter(Boolean).join('\n');

  const userPrompt = [
    'EXAM: ' + exam,
    'TOPIC: ' + topic,
    'TARGET SCORE TIER: ' + (targetTier || '4-5'),
    '',
    'Produce the full teaching guide now. Markdown only — no preamble, no explanation. Start with the # title.',
  ].join('\n');

  try {
    const resp = await client.messages.create({
      model: process.env.CLAUDE_MODEL_ENGINE || 'claude-opus-4-7',
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
