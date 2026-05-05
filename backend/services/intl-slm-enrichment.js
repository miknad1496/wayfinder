// PATCH138: SLM-as-research-brief for international (non-English) chat queries.
//
// PROBLEM: patch 114 routes intl queries (Korean, etc) AWAY from SLM because
// the SLM is English-trained. So Korean users get Haiku-only responses, and
// they NEVER access the SLM's deep knowledge layer (school files, AP brain,
// curated DB injection, deeper RAG retrieval).
//
// SOLUTION: for any intl query, run a side-loop:
//   1. Translate the user's question to English (one cheap Haiku call)
//   2. Send the English version to SLM as a fresh query (no history)
//   3. SLM returns an English "research brief" with all its deep knowledge
//      reasoning baked in
//   4. Caller (chat.js) passes the English brief to chatHaikuAdvisor as
//      additional system context. Haiku then writes a Korean (etc) response
//      that internalizes the SLM intel — without exposing English to the user.
//
// COST + LATENCY:
//   - 1 Haiku-Haiku call (~300-400 input tok, ~200 output) ≈ $0.001 per query
//   - 1 SLM call ≈ free (self-hosted)
//   - 1 final Haiku response (existing path)
//   - Net latency: +1.5-3s vs current. Acceptable for the intel boost.
//
// FAILURE MODES (all non-fatal — Haiku response served regardless):
//   - SLM not warm/available  → returns null, no brief injected
//   - Translation Haiku errors → returns null
//   - SLM quality gate fails  → returns null
//   - SLM brief too short      → returns null

import { chatSLM, isSLMAvailable } from './slm.js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();
const HAIKU_MODEL = process.env.CLAUDE_MODEL_HAIKU || 'claude-haiku-4-5-20251001';

/**
 * Build an English research brief from the SLM for an intl chat query.
 *
 * @param {string} userMessage - The user's original (non-English) question
 * @param {object} sessionContext - The chat session context (passed to SLM)
 * @param {object} routingOptions - Routing/scope options (passed to SLM)
 * @returns {{ englishIntent, brief, briefLen } | null}
 */
export async function buildIntlSlmBrief(userMessage, sessionContext = {}, routingOptions = {}) {
  if (!isSLMAvailable()) return null;
  if (!userMessage || typeof userMessage !== 'string') return null;

  // Step 1: translate KO→EN (or whatever→EN) intent via a quick Haiku call.
  let englishIntent;
  try {
    const tr = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 500,
      system: 'Translate the user message to English. Output ONLY the English translation — no "Translation:" prefix, no commentary. Preserve specific names like 외대부고 (HAFS), 의대 (medical school admissions), SKY (Seoul/Korea/Yonsei top three), 학종 (holistic admissions track), 정시 (regular admission), 수능 (CSAT), 자사고 (autonomous private school), 외고 (foreign-language high school), 과고 (science high school), 영재학교 (gifted school) either as common transliterations OR with brief English explanations in parentheses where useful.',
      messages: [{ role: 'user', content: userMessage }],
    });
    englishIntent = (tr.content?.[0]?.text || '').trim();
    if (!englishIntent || englishIntent.length < 10) return null;
  } catch (e) {
    console.warn('[INTL-SLM-ENRICH] translation failed:', e.message);
    return null;
  }

  // Step 2: SLM with the English intent. Reuses the standard chatSLM path —
  // no special prompts. SLM's natural response IS the research brief.
  let slmBrief;
  try {
    const slmResult = await chatSLM(
      [],  // no history — keep the brief independent of prior conversation
      englishIntent,
      sessionContext || {},
      routingOptions || {}
    );
    if (!slmResult || !slmResult.qualityCheck?.passed) return null;
    slmBrief = slmResult.response;
    if (!slmBrief || slmBrief.length < 100) return null;
  } catch (e) {
    console.warn('[INTL-SLM-ENRICH] SLM call failed:', e.message);
    return null;
  }

  return {
    englishIntent,
    brief: slmBrief,
    briefLen: slmBrief.length,
  };
}
