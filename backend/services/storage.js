import { promises as fs } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data');

/**
 * Sanitize a session ID to prevent path traversal attacks.
 * Only allows alphanumeric characters, hyphens, and underscores.
 * Rejects any ID containing path separators or other dangerous characters.
 */
function sanitizeSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') return null;
  // Only allow UUID-like strings: alphanumeric, hyphens, underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(sessionId)) return null;
  // Additional safety: reject excessively long IDs
  if (sessionId.length > 128) return null;
  return sessionId;
}

export const PATHS = {
  sessions: join(DATA_DIR, 'sessions'),
  feedback: join(DATA_DIR, 'feedback'),
  scraped: join(DATA_DIR, 'scraped'),
  knowledgeBase: join(__dirname, '..', 'knowledge-base'),
  prompts: join(__dirname, '..', '..', 'prompts')
};

export async function ensureDirectories() {
  for (const dir of Object.values(PATHS)) {
    await fs.mkdir(dir, { recursive: true });
  }
  console.log('Storage directories initialized');
}

// Session storage - simple JSON files per session
export async function saveSession(sessionId, data) {
  const safe = sanitizeSessionId(sessionId);
  if (!safe) throw new Error('Invalid session ID');
  const filePath = join(PATHS.sessions, `${safe}.json`);
  // Verify resolved path stays within sessions directory (defense in depth)
  if (!resolve(filePath).startsWith(resolve(PATHS.sessions))) {
    throw new Error('Invalid session path');
  }
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function loadSession(sessionId) {
  const safe = sanitizeSessionId(sessionId);
  if (!safe) return null;
  const filePath = join(PATHS.sessions, `${safe}.json`);
  // Verify resolved path stays within sessions directory (defense in depth)
  if (!resolve(filePath).startsWith(resolve(PATHS.sessions))) {
    return null;
  }
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Feedback storage
export async function saveFeedback(entry) {
  const filePath = join(PATHS.feedback, 'feedback.jsonl');
  const line = JSON.stringify({ ...entry, timestamp: new Date().toISOString() }) + '\n';
  await fs.appendFile(filePath, line);
}

export async function loadAllFeedback() {
  const filePath = join(PATHS.feedback, 'feedback.jsonl');
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return raw.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
  } catch {
    return [];
  }
}

// Knowledge base file operations (includes subdirectories like distilled/)
export async function listKnowledgeFiles() {
  try {
    const results = [];
    const topFiles = await fs.readdir(PATHS.knowledgeBase);

    for (const entry of topFiles) {
      const fullPath = join(PATHS.knowledgeBase, entry);
      const stat = await fs.stat(fullPath);

      if (stat.isFile() && (entry.endsWith('.md') || entry.endsWith('.json') || entry.endsWith('.txt'))) {
        results.push(entry);
      } else if (stat.isDirectory()) {
        // Read subdirectories (e.g., distilled/)
        try {
          const subFiles = await fs.readdir(fullPath);
          for (const sub of subFiles) {
            if (sub.endsWith('.md') || sub.endsWith('.json') || sub.endsWith('.txt')) {
              results.push(join(entry, sub));
            }
          }
        } catch {
          // skip unreadable subdirectories
        }
      }
    }

    return results;
  } catch {
    return [];
  }
}

export async function readKnowledgeFile(filename) {
  const filePath = join(PATHS.knowledgeBase, filename);
  // Prevent path traversal out of knowledge base directory
  if (!resolve(filePath).startsWith(resolve(PATHS.knowledgeBase))) {
    throw new Error('Invalid knowledge file path');
  }
  return fs.readFile(filePath, 'utf-8');
}
