/**
 * Wayfinder Learning Pipeline v2
 *
 * Analyzes stored conversations to extract knowledge and improve responses.
 * This is the "synthetic RLHF" — it doesn't retrain a model, but it:
 *
 * 1. Extracts common questions and patterns from chat history
 * 2. Identifies high-quality responses (from feedback + conversation flow)
 * 3. Appends learned insights INTO EXISTING distilled brain files
 *    (same buckets the SLM already knows about — no new categories created)
 * 4. Tracks what topics users ask about most (demand signal)
 * 5. Generates analytics for monitoring conversation quality
 *
 * IMPORTANT: This pipeline writes to knowledge-base/distilled/*.md — the same
 * files the SLM was trained on. It NEVER creates new category files. This means
 * learned knowledge is immediately available via RAG without SLM retraining.
 *
 * Run manually: double-click LEARN-FROM-CHATS.bat
 *               or: node backend/services/learn.js
 * Automated:    Registered in scraper-scheduler.js (weekly)
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '..', '.env') });

const SESSIONS_DIR = join(__dirname, '..', 'data', 'sessions');
const FEEDBACK_FILE = join(__dirname, '..', 'data', 'feedback', 'feedback.jsonl');
const DISTILLED_DIR = join(__dirname, '..', 'knowledge-base', 'distilled');
const LEARNED_DIR = join(__dirname, '..', 'data', 'learned');

// ─── Topic → Brain File Mapping ─────────────────────────────────────
// Each topic maps to the PRIMARY brain file in distilled/ that the SLM
// already knows. Learned insights get appended to these files so the
// RAG pipeline picks them up automatically without creating new categories.
//
// This mirrors the CATEGORIES in knowledge.js — same buckets.
const TOPIC_TO_BRAIN = {
  'tech careers': {
    brainFile: 'intel-tech-landscape.md',
    keywords: ['software', 'developer', 'engineer', 'programming', 'coding',
      'data science', 'cyber', 'tech', 'ai', 'machine learning', 'devops',
      'cloud', 'frontend', 'backend', 'fullstack', 'product manager',
      'startup', 'faang', 'web development']
  },
  'finance & business careers': {
    brainFile: 'intel-finance-careers.md',
    keywords: ['finance', 'banking', 'investment', 'accounting', 'cpa',
      'consulting', 'business', 'management', 'marketing', 'wall street',
      'private equity', 'venture capital', 'fintech', 'actuarial']
  },
  'healthcare careers': {
    brainFile: 'intel-healthcare-careers.md',
    keywords: ['healthcare', 'medical', 'medicine', 'doctor', 'nurse',
      'pharmacy', 'dental', 'therapy', 'premed', 'mcat', 'residency',
      'biotech', 'public health', 'psychology', 'counseling', 'mental health',
      'social work']
  },
  'government careers': {
    brainFile: 'intel-government-federal.md',
    keywords: ['government', 'federal', 'public service', 'usajobs',
      'military', 'army', 'navy', 'marines', 'air force', 'clearance',
      'nonprofit', 'law enforcement', 'fbi', 'cia', 'diplomat']
  },
  'trades & apprenticeships': {
    brainFile: 'intel-trades-renaissance.md',
    keywords: ['trade', 'trades', 'plumber', 'electrician', 'carpenter',
      'welding', 'hvac', 'mechanic', 'construction', 'apprentice',
      'apprenticeship', 'union', 'vocational', 'blue collar', 'skilled labor',
      'technician', 'lineman', 'diesel']
  },
  'career transitions': {
    brainFile: 'pathway-career-pivots-30s.md',
    keywords: ['career change', 'switch', 'transition', 'pivot', 'mid-career',
      'different industry', 'transferable skills', 'restart', 'non-degree',
      'bootcamp', 'self-taught', 'alternative path']
  },
  'major & education decisions': {
    brainFile: 'framework-major-selection.md',
    keywords: ['major', 'minor', 'degree', 'study', 'field of study',
      'college', 'university', 'stem', 'humanities', 'liberal arts',
      'roi', 'worth it', 'tuition', 'student loan', 'debt']
  },
  'graduate school': {
    brainFile: 'framework-grad-school.md',
    keywords: ['graduate', 'masters', 'phd', 'grad school', 'mba',
      'law school', 'med school', 'gmat', 'lsat', 'gre', 'doctorate',
      'fellowship', 'stipend', 'residency', 'jd', 'md']
  },
  'admissions': {
    brainFile: 'admissions-brain.md',
    keywords: ['admission', 'acceptance', 'apply', 'application', 'essay',
      'sat', 'act', 'gpa', 'extracurricular', 'recommendation',
      'early decision', 'ivy', 'harvard', 'waitlist', 'transfer',
      'common app', 'supplement', 'stanford', 'mit']
  },
  'salary & negotiation': {
    brainFile: 'framework-salary-negotiation.md',
    keywords: ['salary', 'pay', 'compensation', 'negotiate', 'negotiation',
      'offer', 'raise', 'promotion', 'benefits', 'equity', 'stock',
      'bonus', 'total comp', 'income', 'earnings']
  },
  'job search & networking': {
    brainFile: 'playbook-first-job.md',
    keywords: ['job search', 'apply', 'resume', 'cover letter', 'interview',
      'linkedin', 'networking', 'network', 'referral', 'portfolio',
      'entry level', 'internship', 'co-op', 'first job', 'recruiter']
  },
  'certifications': {
    brainFile: 'roi-certifications.md',
    keywords: ['certification', 'certificate', 'cfa', 'cpa', 'comptia',
      'aws', 'credential', 'license', 'pmp', 'scrum', 'cisco', 'ccna']
  },
  'ai disruption': {
    brainFile: 'pathway-ai-disruption-map.md',
    keywords: ['automation', 'replace', 'obsolete', 'future proof',
      'disruption', 'chatgpt', 'llm', 'generative ai', 'robot',
      'robotics', 'survive', 'adapt', 'ai-resistant']
  },
  'financial aid': {
    brainFile: 'financial-aid-brain.md',
    keywords: ['financial aid', 'fafsa', 'scholarship', 'grant', 'pell',
      'loan', 'afford', 'css profile', 'need-blind', 'merit aid',
      '529', 'questbridge', 'work-study', 'need-based', 'aid appeal']
  },
  'international students': {
    brainFile: 'international-student-brain.md',
    keywords: ['visa', 'international', 'opt', 'h1b', 'immigration',
      'foreign', 'study abroad', 'f1', 'stem opt', 'ucas', 'ielts',
      'toefl', 'overseas', 'pgwp', 'chevening']
  },
  'military transitions': {
    brainFile: 'financial-aid-brain.md',  // GI Bill/veteran benefits live here
    secondaryBrain: 'career-brain.md',     // Career transition advice
    keywords: ['gi bill', 'veteran', 'military', 'vet tec', 'skillbridge',
      'yellow ribbon', 'mos', 'helmets to hardhats', 'vr&e',
      'service member', 'active duty', 'reserves']
  },
  'general career': {
    brainFile: 'career-brain.md',
    keywords: ['career', 'job', 'profession', 'work', 'industry',
      'field', 'skill', 'learn', 'course', 'training', 'online course']
  }
};

// Sentinel that marks the start of learned content in brain files.
// We replace everything from this marker to EOF on each run, so
// multiple runs don't stack duplicate content.
const LEARNED_SECTION_MARKER = '\n\n---\n\n<!-- LEARNED_FROM_CONVERSATIONS -->\n';

/**
 * Main learning pipeline. Exported so scraper-scheduler can call it.
 */
export async function runLearningPipeline() {
  console.log('[Learn] Starting learning pipeline...');

  await fs.mkdir(LEARNED_DIR, { recursive: true });

  // 1. Load sessions + feedback
  const sessions = await loadAllSessions();
  console.log(`[Learn] Loaded ${sessions.length} conversation sessions`);

  if (sessions.length === 0) {
    console.log('[Learn] No conversations found. Skipping.');
    return { sessions: 0, exchanges: 0, brainFilesUpdated: 0 };
  }

  const feedback = await loadFeedback();
  console.log(`[Learn] Loaded ${feedback.length} feedback entries`);

  // 2. Extract patterns and classify exchanges by brain category
  const patterns = extractPatterns(sessions);
  console.log(`[Learn] Extracted: ${patterns.questions.length} questions, ${patterns.highQualityExchanges.length} high-quality exchanges`);

  // 3. Group high-quality exchanges by brain file
  const brainInsights = groupByBrainFile(patterns.highQualityExchanges);

  // 4. Append learned sections to existing brain files
  let brainFilesUpdated = 0;
  for (const [brainFile, exchanges] of Object.entries(brainInsights)) {
    if (exchanges.length === 0) continue;
    const updated = await appendToBrainFile(brainFile, exchanges);
    if (updated) brainFilesUpdated++;
  }
  console.log(`[Learn] Updated ${brainFilesUpdated} brain files with learned insights`);

  // 5. Save demand report + analytics (metadata, not RAG content)
  const demandReport = generateDemandReport(patterns);
  await fs.writeFile(
    join(LEARNED_DIR, 'topic-demand.json'),
    JSON.stringify(demandReport, null, 2)
  );

  const analytics = generateAnalytics(sessions, feedback);
  await fs.writeFile(
    join(LEARNED_DIR, 'analytics.json'),
    JSON.stringify(analytics, null, 2)
  );

  // 6. Save a manifest of what was learned (for auditing/debugging)
  const manifest = {
    runAt: new Date().toISOString(),
    sessionsProcessed: sessions.length,
    feedbackEntries: feedback.length,
    totalExchanges: patterns.questions.length,
    highQualityExchanges: patterns.highQualityExchanges.length,
    brainFilesUpdated,
    updatedFiles: Object.entries(brainInsights)
      .filter(([, ex]) => ex.length > 0)
      .map(([file, ex]) => ({ file, insightsAdded: ex.length })),
    topTopics: demandReport.topTopics.slice(0, 10)
  };
  await fs.writeFile(
    join(LEARNED_DIR, 'last-run-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  // 7. Console summary
  console.log('\n[Learn] === LEARNING PIPELINE COMPLETE ===');
  console.log(`  Sessions processed: ${sessions.length}`);
  console.log(`  High-quality exchanges: ${patterns.highQualityExchanges.length}`);
  console.log(`  Brain files enriched: ${brainFilesUpdated}`);
  if (manifest.updatedFiles.length > 0) {
    console.log('  Updated files:');
    for (const f of manifest.updatedFiles) {
      console.log(`    - distilled/${f.file}: +${f.insightsAdded} insights`);
    }
  }
  console.log(`  Top demand: ${demandReport.topTopics.slice(0, 3).map(t => t.topic).join(', ')}`);

  return manifest;
}

// ─── Session & Feedback Loading ─────────────────────────────────────

async function loadAllSessions() {
  try {
    const files = await fs.readdir(SESSIONS_DIR);
    const sessions = [];
    for (const file of files.filter(f => f.endsWith('.json'))) {
      try {
        const raw = await fs.readFile(join(SESSIONS_DIR, file), 'utf-8');
        sessions.push(JSON.parse(raw));
      } catch (err) {
        console.warn(`  Skipped ${file}: ${err.message}`);
      }
    }
    return sessions;
  } catch {
    return [];
  }
}

async function loadFeedback() {
  try {
    const raw = await fs.readFile(FEEDBACK_FILE, 'utf-8');
    return raw.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
  } catch {
    return [];
  }
}

// ─── Pattern Extraction ─────────────────────────────────────────────

function extractPatterns(sessions) {
  const questions = [];
  const topics = {};
  const highQualityExchanges = [];

  for (const session of sessions) {
    if (!session.history || session.history.length < 2) continue;

    for (let i = 0; i < session.history.length; i += 2) {
      const userMsg = session.history[i];
      const assistantMsg = session.history[i + 1];
      if (!userMsg || !assistantMsg) continue;
      if (userMsg.role !== 'user' || assistantMsg.role !== 'assistant') continue;

      const userText = userMsg.content.toLowerCase();

      // Classify question
      questions.push({
        text: userMsg.content,
        length: userMsg.content.length,
        sessionId: session.id
      });

      // Detect topics using the brain-aligned topic map
      const matchedTopics = classifyToBrainTopics(userText);
      for (const topic of matchedTopics) {
        topics[topic] = (topics[topic] || 0) + 1;
      }

      // Identify high-quality exchanges: long substantive responses
      // to real questions (not "hi" or "thanks")
      if (assistantMsg.content.length > 500 && userMsg.content.length > 30) {
        highQualityExchanges.push({
          question: userMsg.content,
          response: assistantMsg.content,
          sessionId: session.id,
          responseLength: assistantMsg.content.length,
          topics: matchedTopics
        });
      }
    }
  }

  return {
    questions,
    topics: Object.entries(topics)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count),
    highQualityExchanges
  };
}

/**
 * Classify a user message to one or more brain topic keys.
 * Returns array of topic names from TOPIC_TO_BRAIN.
 */
function classifyToBrainTopics(userTextLower) {
  const matched = [];
  for (const [topicName, config] of Object.entries(TOPIC_TO_BRAIN)) {
    if (config.keywords.some(kw => userTextLower.includes(kw))) {
      matched.push(topicName);
    }
  }
  // If nothing matched, classify as general career
  if (matched.length === 0) {
    matched.push('general career');
  }
  return matched;
}

// ─── Brain File Grouping ────────────────────────────────────────────

/**
 * Groups high-quality exchanges by their target brain file.
 * Returns: { 'career-brain.md': [exchange, ...], ... }
 */
function groupByBrainFile(exchanges) {
  const grouped = {};

  for (const ex of exchanges) {
    // Each exchange can match multiple topics; append to each brain file
    const targetFiles = new Set();
    for (const topic of ex.topics) {
      const mapping = TOPIC_TO_BRAIN[topic];
      if (mapping) {
        targetFiles.add(mapping.brainFile);
        if (mapping.secondaryBrain) {
          targetFiles.add(mapping.secondaryBrain);
        }
      }
    }

    for (const brainFile of targetFiles) {
      if (!grouped[brainFile]) grouped[brainFile] = [];
      grouped[brainFile].push(ex);
    }
  }

  return grouped;
}

// ─── Brain File Appending ───────────────────────────────────────────

/**
 * Append learned insights to an existing brain file in distilled/.
 * Uses a sentinel marker so repeated runs REPLACE (not stack) the
 * learned section. The original brain content is never touched.
 *
 * Returns true if file was updated, false if brain file doesn't exist.
 */
async function appendToBrainFile(brainFilename, exchanges) {
  const filePath = join(DISTILLED_DIR, brainFilename);

  // Only append to files that already exist — never create new brain files
  let existingContent;
  try {
    existingContent = await fs.readFile(filePath, 'utf-8');
  } catch {
    console.warn(`[Learn] Brain file not found: distilled/${brainFilename} — skipping`);
    return false;
  }

  // Strip any previous learned section (from the marker to EOF)
  const markerIndex = existingContent.indexOf('<!-- LEARNED_FROM_CONVERSATIONS -->');
  const baseContent = markerIndex >= 0
    ? existingContent.substring(0, markerIndex).trimEnd()
    : existingContent.trimEnd();

  // Build the learned section
  const learnedSection = buildLearnedSection(brainFilename, exchanges);

  // Write back: original content + marker + learned section
  const newContent = baseContent + LEARNED_SECTION_MARKER + learnedSection;
  await fs.writeFile(filePath, newContent, 'utf-8');

  console.log(`[Learn] Updated distilled/${brainFilename}: +${exchanges.length} insights`);
  return true;
}

/**
 * Build the learned section markdown for a brain file.
 * Extracts compact insight bullets from high-quality exchanges.
 * Limits to top 20 insights per brain file to avoid bloat.
 */
function buildLearnedSection(brainFilename, exchanges) {
  const timestamp = new Date().toISOString().split('T')[0];

  let md = `## Learned From User Conversations\n\n`;
  md += `*Auto-enriched by the Wayfinder learning pipeline (${timestamp})*\n`;
  md += `*${exchanges.length} high-quality exchanges analyzed*\n\n`;

  // Sort by response length (longer = more detailed = more useful)
  const sorted = [...exchanges].sort((a, b) => b.responseLength - a.responseLength);

  // Extract the top questions users ask in this domain
  md += `### Common Questions Users Ask\n\n`;
  const uniqueQuestions = deduplicateQuestions(sorted.map(e => e.question));
  for (const q of uniqueQuestions.slice(0, 15)) {
    md += `- ${q}\n`;
  }

  // Extract key response patterns (condensed insights, not full responses)
  md += `\n### Key Insights From Conversations\n\n`;
  const insights = extractInsights(sorted.slice(0, 20));
  for (const insight of insights) {
    md += `- ${insight}\n`;
  }

  // Best example exchange (just one, condensed)
  if (sorted.length > 0) {
    const best = sorted[0];
    md += `\n### Example High-Quality Exchange\n\n`;
    md += `**Q:** ${best.question.substring(0, 200)}${best.question.length > 200 ? '...' : ''}\n\n`;
    // Only include first 800 chars of response to avoid bloating the brain file
    md += `**A:** ${best.response.substring(0, 800)}${best.response.length > 800 ? '...' : ''}\n`;
  }

  return md;
}

/**
 * Deduplicate similar questions using simple normalization.
 */
function deduplicateQuestions(questions) {
  const seen = new Set();
  const unique = [];

  for (const q of questions) {
    const normalized = q.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(' ')
      .filter(w => w.length > 3)
      .sort()
      .join(' ');

    if (!seen.has(normalized) && normalized.length > 10) {
      seen.add(normalized);
      unique.push(q);
    }
  }

  return unique;
}

/**
 * Extract condensed insight bullets from high-quality responses.
 * Pulls the first substantive sentence from each response as a key takeaway.
 */
function extractInsights(exchanges) {
  const insights = [];

  for (const ex of exchanges) {
    // Find the first sentence that's actually informative (>40 chars, not a greeting)
    const sentences = ex.response.split(/[.!?]\s+/);
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (
        trimmed.length > 40 &&
        trimmed.length < 300 &&
        !trimmed.toLowerCase().startsWith('hi') &&
        !trimmed.toLowerCase().startsWith('hello') &&
        !trimmed.toLowerCase().startsWith('great question') &&
        !trimmed.toLowerCase().startsWith('that\'s a great') &&
        !trimmed.toLowerCase().startsWith('i\'d be happy') &&
        !trimmed.toLowerCase().includes('let me')
      ) {
        insights.push(trimmed);
        break;
      }
    }
  }

  // Deduplicate
  const seen = new Set();
  return insights.filter(i => {
    const key = i.toLowerCase().substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Reports (metadata, not RAG content) ────────────────────────────

function generateDemandReport(patterns) {
  return {
    generatedAt: new Date().toISOString(),
    totalQuestions: patterns.questions.length,
    topTopics: patterns.topics,
    questionLengthDistribution: {
      short: patterns.questions.filter(q => q.length < 50).length,
      medium: patterns.questions.filter(q => q.length >= 50 && q.length < 200).length,
      long: patterns.questions.filter(q => q.length >= 200).length
    }
  };
}

function generateAnalytics(sessions, feedback) {
  const totalExchanges = sessions.reduce((sum, s) => sum + (s.messageCount || 0), 0);
  const avgMessages = sessions.length > 0
    ? (totalExchanges / sessions.length).toFixed(1)
    : 0;

  const positiveFeedback = feedback.filter(f => f.rating === 1).length;
  const negativeFeedback = feedback.filter(f => f.rating === -1).length;

  const gapAreas = feedback
    .filter(f => f.rating === -1 && f.comment)
    .map(f => f.comment)
    .filter(Boolean);

  return {
    generatedAt: new Date().toISOString(),
    totalSessions: sessions.length,
    totalExchanges,
    avgMessagesPerSession: avgMessages,
    positiveFeedback,
    negativeFeedback,
    satisfactionRate: feedback.length > 0
      ? ((positiveFeedback / feedback.length) * 100).toFixed(1) + '%'
      : 'No feedback yet',
    gapAreas: [...new Set(gapAreas)],
    oldestSession: sessions.length > 0
      ? sessions.sort((a, b) => new Date(a.created) - new Date(b.created))[0]?.created
      : null,
    newestSession: sessions.length > 0
      ? sessions.sort((a, b) => new Date(b.created) - new Date(a.created))[0]?.created
      : null
  };
}

// ─── CLI Entry Point ────────────────────────────────────────────────
// When run directly (node backend/services/learn.js), execute the pipeline.
// When imported by scraper-scheduler, only the export is used.

const isMainModule = process.argv[1] &&
  (process.argv[1].endsWith('learn.js') || process.argv[1].endsWith('learn'));

if (isMainModule) {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Wayfinder Learning Pipeline v2          ║');
  console.log('║  Enriching existing brain files from     ║');
  console.log('║  real conversation data                  ║');
  console.log('╚══════════════════════════════════════════╝\n');

  runLearningPipeline()
    .then(manifest => {
      if (manifest) {
        console.log('\nRestart Wayfinder to pick up enriched knowledge (or wait for cache TTL).');
      }
    })
    .catch(console.error);
}
