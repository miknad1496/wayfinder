import Anthropic from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { retrieveContext, formatContext } from './knowledge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let client = null;
let systemPromptCache = null;

function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not set. Copy .env.example to .env and add your key.');
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

async function loadSystemPrompt() {
  if (!systemPromptCache) {
    const promptPath = join(__dirname, '..', '..', 'prompts', 'wayfinder-system-prompt.txt');
    systemPromptCache = await fs.readFile(promptPath, 'utf-8');
  }
  return systemPromptCache;
}

/**
 * Send a message to Claude with RAG context.
 *
 * @param {Array} conversationHistory - Array of {role, content} messages
 * @param {string} userMessage - The latest user message
 * @param {Object} sessionContext - User profile info (type, interests, etc.)
 * @returns {Object} { response, usage, retrievedSources }
 */
export async function chat(conversationHistory, userMessage, sessionContext = {}) {
  const anthropic = getClient();
  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

  // 1. Retrieve relevant knowledge (top 6 distilled chunks, hard-capped by formatContext)
  const relevantChunks = await retrieveContext(userMessage, 6);
  const contextStr = formatContext(relevantChunks);

  // 2. Build system prompt with context
  let systemPrompt = await loadSystemPrompt();
  systemPrompt = systemPrompt.replace('{RETRIEVED_CONTEXT}', contextStr);

  // Add session context if available
  if (sessionContext && Object.keys(sessionContext).length > 0) {
    systemPrompt += `\n\n═══════════════════════════════════════════
CURRENT USER PROFILE
═══════════════════════════════════════════
${Object.entries(sessionContext)
  .map(([key, val]) => `${key}: ${val}`)
  .join('\n')}`;
  }

  // 3. Build messages array
  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  // 4. Call Claude
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1500,
      system: systemPrompt,
      messages
    });

    const assistantMessage = response.content[0].text;

    return {
      response: assistantMessage,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        model
      },
      retrievedSources: relevantChunks.map(c => ({
        source: c.source,
        title: c.title,
        score: c.score
      }))
    };
  } catch (err) {
    if (err.status === 401) {
      throw new Error('Invalid API key. Check your ANTHROPIC_API_KEY in .env');
    }
    if (err.status === 429) {
      throw new Error('Rate limited. Please wait a moment and try again.');
    }
    throw err;
  }
}

/**
 * Reload system prompt from disk (call after editing the prompt file).
 */
export function reloadPrompt() {
  systemPromptCache = null;
}
