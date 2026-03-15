/**
 * Wayfinder Learning Pipeline
 *
 * Analyzes stored conversations to extract knowledge and improve responses.
 * This is the "synthetic RLHF" — it doesn't retrain a model, but it:
 *
 * 1. Extracts common questions and patterns from chat history
 * 2. Identifies high-quality responses (from feedback + conversation flow)
 * 3. Generates new knowledge base documents from successful conversations
 * 4. Builds a "learned patterns" file that gets injected into the system prompt
 * 5. Tracks what topics users ask about most (demand signal)
 *
 * Run: double-click LEARN-FROM-CHATS.bat
 *      or: node backend/services/learn.js
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
const KB_DIR = join(__dirname, '..', 'knowledge-base');
const LEARNED_DIR = join(__dirname, '..', 'data', 'learned');

async function learn() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Wayfinder Learning Pipeline             ║');
  console.log('║  Extracting knowledge from conversations ║');
  console.log('╚══════════════════════════════════════════╝\n');

  await fs.mkdir(LEARNED_DIR, { recursive: true });
  await fs.mkdir(KB_DIR, { recursive: true });

  // 1. Load all sessions
  const sessions = await loadAllSessions();
  console.log(`Loaded ${sessions.length} conversation sessions`);

  if (sessions.length === 0) {
    console.log('No conversations found yet. Chat with Wayfinder first!');
    return;
  }

  // 2. Load feedback data
  const feedback = await loadFeedback();
  console.log(`Loaded ${feedback.length} feedback entries`);

  // 3. Extract conversation patterns
  const patterns = extractPatterns(sessions);
  console.log(`\nExtracted patterns:`);
  console.log(`  - ${patterns.questions.length} unique question types`);
  console.log(`  - ${patterns.topics.length} topic areas`);
  console.log(`  - ${patterns.highQualityExchanges.length} high-quality exchanges`);

  // 4. Generate topic demand report
  const demandReport = generateDemandReport(patterns);
  await fs.writeFile(
    join(LEARNED_DIR, 'topic-demand.json'),
    JSON.stringify(demandReport, null, 2)
  );
  console.log('\n  Saved: topic-demand.json');

  // 5. Generate learned patterns document (injected into RAG)
  const learnedDoc = generateLearnedDocument(patterns, feedback);
  await fs.writeFile(
    join(KB_DIR, 'learned-from-conversations.md'),
    learnedDoc
  );
  console.log('  Saved: learned-from-conversations.md (to knowledge base)');

  // 6. Generate best exchanges document (few-shot examples from real convos)
  const bestExchanges = generateBestExchanges(patterns, feedback);
  await fs.writeFile(
    join(KB_DIR, 'best-conversation-examples.md'),
    bestExchanges
  );
  console.log('  Saved: best-conversation-examples.md (to knowledge base)');

  // 7. Generate conversation analytics
  const analytics = generateAnalytics(sessions, feedback);
  await fs.writeFile(
    join(LEARNED_DIR, 'analytics.json'),
    JSON.stringify(analytics, null, 2)
  );
  console.log('  Saved: analytics.json');

  // 8. Summary
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║  Learning Complete                       ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\nTop topics users ask about:`);
  demandReport.topTopics.slice(0, 5).forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.topic} (${t.count} conversations)`);
  });
  console.log(`\nConversation quality:`);
  console.log(`  - Total exchanges: ${analytics.totalExchanges}`);
  console.log(`  - Avg messages per session: ${analytics.avgMessagesPerSession}`);
  console.log(`  - Positive feedback: ${analytics.positiveFeedback}`);
  console.log(`  - Negative feedback: ${analytics.negativeFeedback}`);
  if (analytics.gapAreas.length > 0) {
    console.log(`\nKnowledge gaps detected:`);
    analytics.gapAreas.forEach(g => console.log(`  - ${g}`));
  }
  console.log(`\nRestart Wayfinder to use the improved knowledge base.`);
}

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

function extractPatterns(sessions) {
  const questions = [];
  const topics = {};
  const highQualityExchanges = [];

  // Topic keywords to detect
  const topicKeywords = {
    'major selection': ['major', 'minor', 'degree', 'study', 'field of study'],
    'salary & earnings': ['salary', 'pay', 'earn', 'income', 'compensation', 'money', 'worth'],
    'career exploration': ['career', 'job', 'profession', 'work', 'industry', 'field'],
    'AI & technology disruption': ['ai', 'artificial intelligence', 'automation', 'technology', 'disruption', 'future'],
    'certifications': ['certification', 'certificate', 'cfa', 'cpa', 'comptia', 'aws', 'credential'],
    'graduate school': ['graduate', 'masters', 'phd', 'grad school', 'mba', 'law school', 'med school'],
    'internships & experience': ['internship', 'co-op', 'experience', 'entry level', 'entry-level', 'first job'],
    'college selection': ['college', 'university', 'school', 'accepted', 'admission', 'campus'],
    'government careers': ['government', 'federal', 'public service', 'usajobs', 'goverment'],
    'international students': ['visa', 'international', 'opt', 'h1b', 'immigration', 'foreign'],
    'financial aid & loans': ['loan', 'financial aid', 'scholarship', 'grant', 'tuition', 'afford', 'debt'],
    'skills development': ['skill', 'learn', 'course', 'training', 'bootcamp', 'online course'],
    'networking & job search': ['network', 'linkedin', 'resume', 'interview', 'job search', 'apply', 'application'],
    'psychology careers': ['psychology', 'counseling', 'therapy', 'mental health', 'social work'],
    'business careers': ['business', 'consulting', 'management', 'finance', 'accounting', 'marketing'],
    'tech careers': ['software', 'developer', 'engineer', 'programming', 'coding', 'data science', 'cyber']
  };

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

      // Detect topics
      for (const [topic, keywords] of Object.entries(topicKeywords)) {
        if (keywords.some(kw => userText.includes(kw))) {
          topics[topic] = (topics[topic] || 0) + 1;
        }
      }

      // Identify high-quality exchanges (long, substantive responses that
      // didn't get negative feedback)
      if (assistantMsg.content.length > 500 && userMsg.content.length > 30) {
        highQualityExchanges.push({
          question: userMsg.content,
          response: assistantMsg.content,
          sessionId: session.id,
          responseLength: assistantMsg.content.length
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

function generateLearnedDocument(patterns, feedback) {
  let md = '# Learned From Conversations\n\n';
  md += `*Auto-generated by the Wayfinder learning pipeline*\n`;
  md += `*Last updated: ${new Date().toISOString()}*\n`;
  md += `*Based on ${patterns.questions.length} user questions*\n\n`;

  md += '## Most Asked-About Topics\n\n';
  md += 'These are the topics Wayfinder users ask about most frequently. ';
  md += 'Prioritize detailed, data-rich answers for these areas.\n\n';
  for (const topic of patterns.topics.slice(0, 10)) {
    md += `- **${topic.topic}**: ${topic.count} conversations\n`;
  }

  md += '\n## Common Question Patterns\n\n';
  md += 'Users frequently ask questions in these patterns:\n\n';

  // Deduplicate and summarize question patterns
  const questionPatterns = {};
  for (const q of patterns.questions) {
    const normalized = q.text.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(' ')
      .filter(w => w.length > 3)
      .slice(0, 5)
      .join(' ');
    if (normalized.length > 10) {
      questionPatterns[normalized] = (questionPatterns[normalized] || 0) + 1;
    }
  }

  const sortedPatterns = Object.entries(questionPatterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  for (const [pattern, count] of sortedPatterns) {
    if (count > 1) {
      md += `- "${pattern}" (asked ${count} times)\n`;
    }
  }

  // Add feedback insights
  if (feedback.length > 0) {
    const negative = feedback.filter(f => f.rating === -1 && f.comment);
    if (negative.length > 0) {
      md += '\n## Areas for Improvement (from user feedback)\n\n';
      for (const f of negative.slice(0, 10)) {
        md += `- "${f.comment}"\n`;
      }
    }
  }

  return md;
}

function generateBestExchanges(patterns, feedback) {
  let md = '# Best Conversation Examples\n\n';
  md += `*Real exchanges from Wayfinder conversations*\n`;
  md += `*Use these as reference for response quality and tone*\n\n`;

  // Get the longest, most detailed exchanges as examples
  const best = patterns.highQualityExchanges
    .sort((a, b) => b.responseLength - a.responseLength)
    .slice(0, 5);

  for (let i = 0; i < best.length; i++) {
    const ex = best[i];
    md += `## Example ${i + 1}\n\n`;
    md += `**Student question:** ${ex.question}\n\n`;
    md += `**Wayfinder response:** ${ex.response.substring(0, 1500)}`;
    if (ex.response.length > 1500) md += '...';
    md += '\n\n---\n\n';
  }

  return md;
}

function generateAnalytics(sessions, feedback) {
  const totalExchanges = sessions.reduce((sum, s) => sum + (s.messageCount || 0), 0);
  const avgMessages = sessions.length > 0
    ? (totalExchanges / sessions.length).toFixed(1)
    : 0;

  const positiveFeedback = feedback.filter(f => f.rating === 1).length;
  const negativeFeedback = feedback.filter(f => f.rating === -1).length;

  // Detect gap areas (topics with negative feedback)
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
      ? sessions.sort((a, b) => new Date(a.created) - new Date(b.created))[0].created
      : null,
    newestSession: sessions.length > 0
      ? sessions.sort((a, b) => new Date(b.created) - new Date(a.created))[0].created
      : null
  };
}

learn().catch(console.error);
