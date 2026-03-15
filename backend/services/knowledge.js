import { promises as fs } from 'fs';
import { join } from 'path';
import { PATHS, listKnowledgeFiles, readKnowledgeFile } from './storage.js';

/**
 * Simple keyword-based knowledge retrieval.
 * This is the "poor man's RAG" — no vector DB needed.
 * Upgrade path: swap this for ChromaDB or Pinecone embeddings later.
 *
 * How it works:
 * 1. Load all knowledge documents into memory
 * 2. Score each document against the user's query using TF-IDF-like keyword matching
 * 3. Return the top N most relevant chunks
 */

let knowledgeCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // Refresh every 5 minutes

// Parse a knowledge document into searchable chunks
function parseDocument(content, filename) {
  const chunks = [];
  const sections = content.split(/\n#{1,3}\s+/);

  for (const section of sections) {
    const trimmed = section.trim();
    if (trimmed.length < 20) continue;

    // Extract title from first line
    const lines = trimmed.split('\n');
    const title = lines[0].replace(/^#+\s*/, '').trim();
    const body = lines.slice(1).join('\n').trim();

    chunks.push({
      source: filename,
      title,
      content: body || title,
      keywords: extractKeywords(title + ' ' + body)
    });
  }

  // If no sections found, treat whole document as one chunk
  if (chunks.length === 0 && content.trim().length > 20) {
    chunks.push({
      source: filename,
      title: filename.replace(/\.\w+$/, ''),
      content: content.trim(),
      keywords: extractKeywords(content)
    });
  }

  return chunks;
}

// Extract meaningful keywords from text
function extractKeywords(text) {
  const stopWords = new Set([
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

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

// Score a chunk against a query
function scoreChunk(chunk, queryKeywords) {
  let score = 0;
  const chunkKeywordSet = new Set(chunk.keywords);

  for (const keyword of queryKeywords) {
    if (chunkKeywordSet.has(keyword)) {
      score += 2; // Exact match
    }
    // Partial match (keyword contains or is contained by chunk keyword)
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

// Load all knowledge documents
async function loadKnowledge() {
  const now = Date.now();
  if (knowledgeCache && (now - cacheTimestamp) < CACHE_TTL) {
    return knowledgeCache;
  }

  const files = await listKnowledgeFiles();
  const allChunks = [];

  for (const file of files) {
    try {
      const content = await readKnowledgeFile(file);
      const chunks = parseDocument(content, file);
      allChunks.push(...chunks);
    } catch (err) {
      console.warn(`Failed to load knowledge file ${file}:`, err.message);
    }
  }

  // Load distilled intelligence (Opus-generated insights)
  try {
    const distilledDir = join(PATHS.knowledgeBase, 'distilled');
    const distilledFiles = await fs.readdir(distilledDir);
    for (const file of distilledFiles.filter(f => f.endsWith('.md'))) {
      try {
        const content = await fs.readFile(join(distilledDir, file), 'utf-8');
        const distilledChunks = parseDocument(content, `distilled/${file}`);
        // Boost distilled content — it's higher quality than raw data
        for (const chunk of distilledChunks) {
          chunk.boostFactor = 2.0;
        }
        allChunks.push(...distilledChunks);
      } catch (err) {
        console.warn(`Failed to load distilled file ${file}:`, err.message);
      }
    }
  } catch {
    // distilled directory may not exist yet
  }

  // Also load scraped data if available
  try {
    const scrapedFiles = await fs.readdir(PATHS.scraped);
    for (const file of scrapedFiles.filter(f => f.endsWith('.json'))) {
      try {
        const raw = await fs.readFile(join(PATHS.scraped, file), 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          for (const item of data) {
            allChunks.push({
              source: file,
              title: item.title || item.occupation || file,
              content: typeof item === 'string' ? item : JSON.stringify(item),
              keywords: extractKeywords(
                (item.title || '') + ' ' + (item.description || '') + ' ' + (item.occupation || '')
              )
            });
          }
        }
      } catch (err) {
        console.warn(`Failed to load scraped file ${file}:`, err.message);
      }
    }
  } catch {
    // scraped directory may not exist yet
  }

  knowledgeCache = allChunks;
  cacheTimestamp = now;
  console.log(`Knowledge base loaded: ${allChunks.length} chunks from ${files.length} files`);

  return allChunks;
}

/**
 * Retrieve the most relevant knowledge chunks for a query.
 * @param {string} query - The user's message
 * @param {number} topK - Number of chunks to return (default 5)
 * @returns {Array} Top matching chunks with scores
 */
export async function retrieveContext(query, topK = 5) {
  const chunks = await loadKnowledge();
  const queryKeywords = extractKeywords(query);

  if (queryKeywords.length === 0) return [];

  const scored = chunks
    .map(chunk => ({
      ...chunk,
      score: scoreChunk(chunk, queryKeywords) * (chunk.boostFactor || 1.0)
    }))
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}

/**
 * Format retrieved chunks into context string for the prompt.
 */
export function formatContext(chunks) {
  if (chunks.length === 0) {
    return '[No specific knowledge base documents matched this query. Use general training knowledge.]';
  }

  return chunks.map((chunk, i) => {
    return `--- SOURCE ${i + 1}: ${chunk.source} ---\nTOPIC: ${chunk.title}\n${chunk.content}\n`;
  }).join('\n');
}

/**
 * Force-reload the knowledge cache (call after scraping or adding new docs).
 */
export function invalidateCache() {
  knowledgeCache = null;
  cacheTimestamp = 0;
}
