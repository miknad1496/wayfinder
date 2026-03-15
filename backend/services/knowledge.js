import { promises as fs } from 'fs';
import { join } from 'path';
import { PATHS } from './storage.js';

/**
 * Wayfinder Knowledge Retrieval Engine
 *
 * Architecture:
 * - The "brain" is the distilled/ directory: 27 Opus-synthesized markdown files
 *   containing deep career intelligence, decision frameworks, and contrarian insights.
 * - The hand-crafted .md files in knowledge-base/ provide foundational guidance.
 * - Raw scraped JSON data is NOT loaded at runtime — it was already synthesized
 *   into the distilled files during the distillation process. This keeps token
 *   costs low and response quality high.
 *
 * Token budget: ~8K tokens of context per query (system prompt is ~3K tokens,
 * leaving plenty of room for conversation history + response).
 */

let knowledgeCache = null;
let liteBrainCache = null;
let cacheTimestamp = 0;
let liteCacheTimestamp = 0;
const CACHE_TTL = 10 * 60 * 1000; // Refresh every 10 minutes

// Max chars per chunk (~750 tokens)
const MAX_CHUNK_CHARS = 3000;
// Max total context injected into prompt (~8K tokens)
const MAX_TOTAL_CONTEXT_CHARS = 32000;

// ─── Keyword extraction ───────────────────────────────────────────

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
  'those', 'it', 'its', 'they', 'them', 'their', 'we', 'us', 'our',
  'you', 'your', 'i', 'my', 'me', 'he', 'she', 'him', 'her', 'his',
  'not', 'no', 'so', 'if', 'as', 'than', 'then', 'also', 'just',
  'more', 'most', 'some', 'any', 'all', 'each', 'every', 'both',
  'such', 'when', 'where', 'how', 'what', 'which', 'who', 'whom',
  'about', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'between', 'under', 'over', 'out', 'up', 'down', 'very'
]);

function extractKeywords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

// ─── Chunk parsing (markdown only) ────────────────────────────────

function parseMarkdown(content, filename) {
  const chunks = [];
  const sections = content.split(/\n#{1,3}\s+/);

  for (const section of sections) {
    const trimmed = section.trim();
    if (trimmed.length < 30) continue;

    const lines = trimmed.split('\n');
    const title = lines[0].replace(/^#+\s*/, '').trim();
    const body = lines.slice(1).join('\n').trim();
    if (!body) continue;

    chunks.push({
      source: filename,
      title: title.slice(0, 200),
      content: body.slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords(title + ' ' + body.slice(0, 1500))
    });
  }

  // Fallback: if no sections found, use the whole doc (capped)
  if (chunks.length === 0 && content.trim().length > 30) {
    chunks.push({
      source: filename,
      title: filename.replace(/\.\w+$/, '').replace(/[-_]/g, ' '),
      content: content.trim().slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords(content.slice(0, 1500))
    });
  }

  return chunks;
}

// ─── Scoring ──────────────────────────────────────────────────────

function scoreChunk(chunk, queryKeywords) {
  let score = 0;
  const chunkKeywordSet = new Set(chunk.keywords);

  for (const keyword of queryKeywords) {
    if (chunkKeywordSet.has(keyword)) {
      score += 2;
    }
    for (const ck of chunk.keywords) {
      if (ck !== keyword && (ck.includes(keyword) || keyword.includes(ck))) {
        score += 1;
      }
    }
  }

  // Boost for title matches
  const titleKeywords = extractKeywords(chunk.title);
  for (const keyword of queryKeywords) {
    if (titleKeywords.includes(keyword)) {
      score += 3;
    }
  }

  return score;
}

// ─── Knowledge loading ────────────────────────────────────────────

async function loadMarkdownFiles(dir, boostFactor = 1.0) {
  const chunks = [];
  try {
    const files = await fs.readdir(dir);
    for (const file of files.filter(f => f.endsWith('.md'))) {
      try {
        const content = await fs.readFile(join(dir, file), 'utf-8');
        const parsed = parseMarkdown(content, file);
        for (const chunk of parsed) {
          chunk.boostFactor = boostFactor;
        }
        chunks.push(...parsed);
      } catch (err) {
        console.warn(`  Skipped ${file}:`, err.message);
      }
    }
  } catch {
    // Directory doesn't exist yet — that's fine
  }
  return chunks;
}

async function loadKnowledge() {
  const now = Date.now();
  if (knowledgeCache && (now - cacheTimestamp) < CACHE_TTL) {
    return knowledgeCache;
  }

  console.log('Loading Wayfinder knowledge base...');
  const allChunks = [];

  // 1. Distilled intelligence (Opus-generated) — highest priority
  const distilledDir = join(PATHS.knowledgeBase, 'distilled');
  const distilledChunks = await loadMarkdownFiles(distilledDir, 2.0);
  allChunks.push(...distilledChunks);
  console.log(`  Distilled: ${distilledChunks.length} chunks`);

  // 2. Hand-crafted knowledge base .md files — good foundational content
  const baseChunks = await loadMarkdownFiles(PATHS.knowledgeBase, 1.0);
  allChunks.push(...baseChunks);
  console.log(`  Base docs: ${baseChunks.length} chunks`);

  // 3. Scraped markdown summaries (if any) — useful narrative content
  try {
    const scrapedDir = PATHS.scraped;
    const scrapedMdChunks = await loadMarkdownFiles(scrapedDir, 0.8);
    allChunks.push(...scrapedMdChunks);
    console.log(`  Scraped summaries: ${scrapedMdChunks.length} chunks`);
  } catch {
    // No scraped dir
  }

  // NOTE: Raw JSON data (reddit posts, BLS records, etc.) is intentionally
  // NOT loaded here. That data was the INPUT to the distillation process.
  // The distilled/ files contain the synthesized intelligence from all sources.
  // Loading raw JSON would waste tokens and dilute quality.

  knowledgeCache = allChunks;
  cacheTimestamp = now;
  console.log(`Knowledge base ready: ${allChunks.length} total chunks`);

  return allChunks;
}

// ─── Lite Brain (standard mode — general-brain.md only) ──────────

async function loadLiteBrain() {
  const now = Date.now();
  if (liteBrainCache && (now - liteCacheTimestamp) < CACHE_TTL) {
    return liteBrainCache;
  }

  console.log('Loading lite brain (general-brain.md)...');
  const brainPath = join(PATHS.knowledgeBase, 'distilled', 'general-brain.md');
  try {
    const content = await fs.readFile(brainPath, 'utf-8');
    liteBrainCache = content;
    liteCacheTimestamp = now;
    console.log(`  Lite brain loaded: ${content.length} chars`);
  } catch (err) {
    console.warn('  Could not load general-brain.md:', err.message);
    liteBrainCache = '';
  }

  return liteBrainCache;
}

/**
 * Get the condensed general brain content (no RAG, no scoring).
 * Used for standard queries — cheap and fast.
 */
export async function getLiteBrainContext() {
  const content = await loadLiteBrain();
  if (!content) {
    return '[General career knowledge — no specific knowledge base loaded.]';
  }
  return `--- WAYFINDER KNOWLEDGE BASE (condensed) ---\n${content}\n`;
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Retrieve the most relevant knowledge chunks for a query.
 * This is the FULL Wayfinder Engine — used for deep-dive queries.
 */
export async function retrieveContext(query, topK = 6) {
  const chunks = await loadKnowledge();
  const queryKeywords = extractKeywords(query);

  if (queryKeywords.length === 0) return [];

  return chunks
    .map(chunk => ({
      ...chunk,
      score: scoreChunk(chunk, queryKeywords) * (chunk.boostFactor || 1.0)
    }))
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Format retrieved chunks into a context string for injection into the prompt.
 * Enforces a hard cap on total size to keep token costs predictable.
 */
export function formatContext(chunks) {
  if (chunks.length === 0) {
    return '[No specific knowledge base documents matched this query. Use general career knowledge.]';
  }

  let totalChars = 0;
  const entries = [];

  for (const chunk of chunks) {
    const entry = `--- SOURCE ${entries.length + 1}: ${chunk.source} ---\nTOPIC: ${chunk.title}\n${chunk.content}\n`;
    if (totalChars + entry.length > MAX_TOTAL_CONTEXT_CHARS) break;
    totalChars += entry.length;
    entries.push(entry);
  }

  return entries.join('\n');
}

/**
 * Force-reload the knowledge cache (call after adding new distilled docs).
 */
export function invalidateCache() {
  knowledgeCache = null;
  cacheTimestamp = 0;
  liteBrainCache = null;
  liteCacheTimestamp = 0;
}
