/**
 * Conversation Memory — Learning Loop
 *
 * Two-purpose system:
 *   1. IMMEDIATE: Captures useful Q&A pairs into a knowledge file that the
 *      RAG system can retrieve on future queries. The system gets smarter
 *      from every substantive conversation.
 *
 *   2. FUTURE: Saves full conversation threads in JSONL format compatible
 *      with SLM fine-tuning. These become training data for the next LoRA run.
 *
 * What gets captured:
 *   - Only substantive exchanges (user message > 20 chars, response > 200 chars)
 *   - Skips blocked/refusal/out-of-scope responses
 *   - Tags each entry with domain, scope, mode, and quality signals
 *   - User feedback (helpful/not helpful) is linked back to entries
 *
 * How it improves the system:
 *   - RAG retrieval picks up past conversation insights as context chunks
 *   - When a similar topic comes up, the system has "seen it before"
 *   - Training data accumulates for the next SLM fine-tune cycle
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data');
const MEMORY_DIR = join(DATA_DIR, 'memory');
const TRAINING_DIR = join(DATA_DIR, 'training-capture');

// Ensure directories exist
async function ensureDirs() {
  await fs.mkdir(MEMORY_DIR, { recursive: true });
  await fs.mkdir(TRAINING_DIR, { recursive: true });
}

// ─── Topic Extraction ──────────────────────────────────────────
// Lightweight keyword extraction — no external deps needed.
// Pulls out the key concepts from an exchange for RAG indexing.

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because',
  'but', 'and', 'or', 'if', 'while', 'about', 'up', 'down', 'that',
  'this', 'these', 'those', 'what', 'which', 'who', 'whom', 'it', 'its',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'they',
  'them', 'his', 'her', 'their', 'think', 'know', 'want', 'like', 'get',
  'make', 'go', 'see', 'look', 'also', 'really', 'right', 'well',
]);

function extractTopics(text) {
  if (!text) return [];
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));

  // Count frequency
  const freq = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  // Return top keywords by frequency
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

// ─── Domain Detection (lightweight) ─────────────────────────────

function detectDomain(text) {
  const lower = (text || '').toLowerCase();
  const admSignals = ['college', 'university', 'admissions', 'sat', 'act', 'gpa',
    'application', 'essay', 'financial aid', 'school', 'major', 'campus'];
  const careerSignals = ['career', 'job', 'salary', 'internship', 'resume',
    'interview', 'industry', 'employment', 'hiring', 'promotion'];

  let admScore = 0, carScore = 0;
  for (const s of admSignals) if (lower.includes(s)) admScore++;
  for (const s of careerSignals) if (lower.includes(s)) carScore++;

  if (admScore > carScore) return 'admissions';
  if (carScore > admScore) return 'career';
  return 'general';
}

// ─── Memory Capture (Immediate RAG Improvement) ─────────────────

/**
 * Capture a substantive exchange into the conversation memory.
 * This gets indexed by the RAG system on next retrieval.
 *
 * @param {Object} params
 * @param {string} params.userMessage - The user's question
 * @param {string} params.response - The assistant's response
 * @param {string} params.mode - 'slm' | 'haiku_intake' | 'standard' | 'engine'
 * @param {string} params.scopeLabel - 'in_scope' | 'adjacent' | 'out_of_scope'
 * @param {Object} params.sessionContext - User profile context
 * @param {string} params.sessionId - Session identifier
 */
export async function captureConversationMemory(params) {
  const { userMessage, response, mode, scopeLabel, sessionContext, sessionId } = params;

  // Only capture substantive exchanges
  if (!userMessage || userMessage.trim().length < 20) return;
  if (!response || response.trim().length < 200) return;
  if (scopeLabel === 'out_of_scope') return;
  if (mode === 'blocked') return;

  try {
    await ensureDirs();

    const topics = extractTopics(userMessage + ' ' + response);
    const domain = detectDomain(userMessage);
    // Sanitize userType: cap length and strip control chars to prevent training data pollution
    const rawUserType = sessionContext?.userType || 'unknown';
    const userType = typeof rawUserType === 'string'
      ? rawUserType.replace(/[\x00-\x1f\x7f]/g, '').slice(0, 50)
      : 'unknown';

    const entry = {
      timestamp: new Date().toISOString(),
      sessionId,
      domain,
      userType,
      topics,
      mode,
      scopeLabel,
      query: userMessage.trim(),
      response: response.trim().slice(0, 2000), // Cap response length for RAG
      // Note: userName intentionally excluded to prevent PII leaking into RAG context
    };

    // Append to daily memory file (one file per day for manageable sizes)
    const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const memoryFile = join(MEMORY_DIR, `memory-${dateStr}.jsonl`);
    await fs.appendFile(memoryFile, JSON.stringify(entry) + '\n');

    console.log(`[MEMORY] Captured: ${domain}/${topics.slice(0, 3).join(',')} (${mode})`);
  } catch (err) {
    // Never let memory capture crash the main flow
    console.error(`[MEMORY] Capture error: ${err.message}`);
  }
}

// ─── Training Data Capture (Future SLM Fine-Tuning) ─────────────

/**
 * Save a conversation exchange in SLM training format.
 * These accumulate and become the dataset for the next LoRA fine-tune.
 *
 * Format: OpenAI chat-completion JSONL (compatible with most fine-tuning tools)
 * { "messages": [ { "role": "system", "content": "..." }, { "role": "user", ... }, { "role": "assistant", ... } ] }
 */
export async function captureTrainingPair(params) {
  const {
    userMessage, response, mode, scopeLabel,
    sessionContext, qualitySignal, domain
  } = params;

  // Only capture high-quality exchanges for training
  if (!userMessage || userMessage.trim().length < 20) return;
  if (!response || response.trim().length < 200) return;
  if (scopeLabel === 'out_of_scope' || mode === 'blocked') return;

  // Skip haiku_intake — these are intake conversations, not advisor-quality
  // We want to train the SLM on advisor-quality responses
  if (mode === 'haiku_intake') return;

  try {
    await ensureDirs();

    const systemPrompt = 'You are Wayfinder, an expert advisor on college admissions and career planning. Be warm, direct, and data-informed. Sound like a trusted human advisor.';

    const trainingEntry = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage.trim() },
        { role: 'assistant', content: response.trim() },
      ],
      metadata: {
        timestamp: new Date().toISOString(),
        mode,
        domain: domain || detectDomain(userMessage),
        userType: typeof sessionContext?.userType === 'string'
          ? sessionContext.userType.replace(/[\x00-\x1f\x7f]/g, '').slice(0, 50)
          : 'unknown',
        scopeLabel,
        quality: qualitySignal || 'unrated',
      }
    };

    // Monthly training files (so we can fine-tune on specific periods)
    const monthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
    const trainingFile = join(TRAINING_DIR, `training-${monthStr}.jsonl`);
    await fs.appendFile(trainingFile, JSON.stringify(trainingEntry) + '\n');

    console.log(`[TRAINING] Pair captured: ${mode}/${domain || 'general'}`);
  } catch (err) {
    console.error(`[TRAINING] Capture error: ${err.message}`);
  }
}

// ─── RAG Integration: Load Memory for Retrieval ─────────────────

/**
 * Load conversation memory entries relevant to a query.
 * Called by the RAG system to include past conversation insights.
 *
 * Returns an array of chunks compatible with the existing RAG format:
 *   { source, title, content, layer, score }
 */
export async function getMemoryChunks(query, topK = 3) {
  try {
    await ensureDirs();
    const files = await fs.readdir(MEMORY_DIR);
    const memoryFiles = files
      .filter(f => f.startsWith('memory-') && f.endsWith('.jsonl'))
      .sort()
      .reverse()
      .slice(0, 14); // Last 14 days of memory

    if (memoryFiles.length === 0) return [];

    const queryTopics = extractTopics(query);
    const queryDomain = detectDomain(query);
    if (queryTopics.length === 0) return [];

    const scored = [];

    for (const file of memoryFiles) {
      const content = await fs.readFile(join(MEMORY_DIR, file), 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const entry = JSON.parse(line);

          // Score by topic overlap
          let score = 0;
          const entryTopics = new Set(entry.topics || []);
          for (const qt of queryTopics) {
            if (entryTopics.has(qt)) score += 2;
          }

          // Domain match bonus
          if (entry.domain === queryDomain) score += 1;

          // Recency bonus (entries from today score higher)
          const entryDate = entry.timestamp?.slice(0, 10);
          const today = new Date().toISOString().slice(0, 10);
          if (entryDate === today) score += 0.5;

          if (score >= 2) {
            scored.push({
              entry,
              score,
            });
          }
        } catch {
          // Skip malformed lines
        }
      }
    }

    // Sort by score, take topK
    scored.sort((a, b) => b.score - a.score);
    const topEntries = scored.slice(0, topK);

    // Format as RAG chunks
    // Note: Memory is shared across users (no userId filter). The chunks below
    // contain sanitized Q&A pairs without PII — responses are capped at 2000 chars
    // and userNames are stripped at capture time. This is safe for general domain
    // knowledge (e.g., "what are good CS internships in WA?") but should be
    // user-scoped if the product evolves to store personal strategy data.
    return topEntries.map(({ entry, score }) => ({
      source: 'conversation-memory',
      title: `Past conversation: ${(entry.topics || []).slice(0, 3).join(', ')}`,
      content: `[Previous exchange — ${entry.domain}]\nQuestion: ${entry.query}\nAnswer: ${entry.response}`,
      layer: 'memory',
      score: Math.min(score / 5, 1.0), // Normalize to 0-1
    }));
  } catch (err) {
    console.error(`[MEMORY] Retrieval error: ${err.message}`);
    return [];
  }
}

// ─── Stats ──────────────────────────────────────────────────────

export async function getMemoryStats() {
  try {
    await ensureDirs();
    const memFiles = await fs.readdir(MEMORY_DIR);
    const trainFiles = await fs.readdir(TRAINING_DIR);

    let memoryEntries = 0;
    let trainingPairs = 0;

    for (const f of memFiles.filter(f => f.endsWith('.jsonl'))) {
      const content = await fs.readFile(join(MEMORY_DIR, f), 'utf-8');
      memoryEntries += content.trim().split('\n').filter(Boolean).length;
    }

    for (const f of trainFiles.filter(f => f.endsWith('.jsonl'))) {
      const content = await fs.readFile(join(TRAINING_DIR, f), 'utf-8');
      trainingPairs += content.trim().split('\n').filter(Boolean).length;
    }

    return {
      memoryEntries,
      trainingPairs,
      memoryFiles: memFiles.filter(f => f.endsWith('.jsonl')).length,
      trainingFiles: trainFiles.filter(f => f.endsWith('.jsonl')).length,
    };
  } catch {
    return { memoryEntries: 0, trainingPairs: 0, memoryFiles: 0, trainingFiles: 0 };
  }
}
