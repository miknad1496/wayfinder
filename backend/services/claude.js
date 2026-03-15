import Anthropic from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { retrieveContext, formatContext, getLiteBrainContext } from './knowledge.js';

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
 * Build user profile string for injection into the system prompt.
 */
function buildProfileString(sessionContext) {
  if (!sessionContext || Object.keys(sessionContext).length === 0) return '';

  const lines = [];
  if (sessionContext.userName) lines.push(`Name: ${sessionContext.userName}`);
  if (sessionContext.userType) lines.push(`Type: ${sessionContext.userType}`);
  if (sessionContext.school) lines.push(`School: ${sessionContext.school}`);

  // Expanded profile fields
  const p = sessionContext.profile;
  if (p) {
    if (p.age) lines.push(`Age: ${p.age}`);
    if (p.gradeLevel) lines.push(`Grade/Year: ${p.gradeLevel}`);
    if (p.favoriteClasses && p.favoriteClasses.length > 0) {
      lines.push(`Favorite Classes: ${p.favoriteClasses.join(', ')}`);
    }
    if (p.careerInterests && p.careerInterests.length > 0) {
      lines.push(`Career Interests: ${p.careerInterests.join(', ')}`);
    }
    if (p.aboutMe) lines.push(`About: ${p.aboutMe}`);
  }

  if (sessionContext.interests && sessionContext.interests.length > 0) {
    lines.push(`Interests: ${Array.isArray(sessionContext.interests) ? sessionContext.interests.join(', ') : sessionContext.interests}`);
  }

  if (lines.length === 0) return '';

  return `\n\n═══════════════════════════════════════════
CURRENT USER PROFILE
═══════════════════════════════════════════
${lines.join('\n')}`;
}

/**
 * Send a message to Claude.
 *
 * @param {Array} conversationHistory - Array of {role, content} messages
 * @param {string} userMessage - The latest user message
 * @param {Object} sessionContext - User profile info (type, interests, etc.)
 * @param {Object} options - { useEngine: boolean }
 * @returns {Object} { response, usage, retrievedSources, mode }
 */
export async function chat(conversationHistory, userMessage, sessionContext = {}, options = {}) {
  const anthropic = getClient();
  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';
  const useEngine = options.useEngine || false;

  let contextStr;
  let relevantChunks = [];

  if (useEngine) {
    // FULL ENGINE MODE: RAG retrieval across all 27 distilled files
    relevantChunks = await retrieveContext(userMessage, 6);
    contextStr = formatContext(relevantChunks);
    console.log(`[Engine Mode] Retrieved ${relevantChunks.length} chunks for: "${userMessage.slice(0, 60)}..."`);
  } else {
    // STANDARD MODE: Just the condensed general brain (~2K tokens)
    contextStr = await getLiteBrainContext();
    console.log(`[Standard Mode] Using general brain for: "${userMessage.slice(0, 60)}..."`);
  }

  // Build system prompt with context
  let systemPrompt = await loadSystemPrompt();
  systemPrompt = systemPrompt.replace('{RETRIEVED_CONTEXT}', contextStr);

  // Add mode indicator
  if (useEngine) {
    systemPrompt += '\n\n[WAYFINDER ENGINE ACTIVE — You have access to deep, specific knowledge from BLS data, O*NET profiles, community insights, and distilled career intelligence. Provide detailed, data-rich answers with specific numbers, salary ranges, and growth projections.]';
  }

  // Add user profile
  systemPrompt += buildProfileString(sessionContext);

  // Build messages array
  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  // Call Claude
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: useEngine ? 2000 : 1500,
      system: systemPrompt,
      messages
    });

    const assistantMessage = response.content[0].text;

    return {
      response: assistantMessage,
      mode: useEngine ? 'engine' : 'standard',
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
