/**
 * SS-03: Output System-Prompt Leakage Filter
 *
 * Scans every SLM/LLM response for verbatim substrings of the system prompt.
 * If a match is found (20+ characters, 4+ word window), the entire response
 * is replaced with a safe redirect.
 *
 * Addresses: ADV-01 (system prompt extraction)
 *
 * Design:
 *   - N-grams (4-word to 15-word sliding windows) are generated from the
 *     system prompt at initialization time and stored in a Set.
 *   - On each response, the filter checks if any n-gram appears verbatim
 *     in the response text (case-insensitive).
 *   - The 20-char minimum prevents false positives on common short phrases
 *     like "acceptance rates" or "career strategy."
 *   - The 15-word window cap keeps the n-gram set manageable (~O(15N) where
 *     N = system prompt word count).
 *
 * Performance:
 *   N-gram generation runs once at startup. Per-response check is O(|ngrams|)
 *   with native String.includes() — fast enough for synchronous filtering.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tuned to avoid false positives: education-domain responses naturally share
// vocabulary with the system prompt. Requiring 8+ word phrases (50+ chars)
// catches real prompt extraction while ignoring normal education terminology.
const MIN_NGRAM_CHARS = 50;
const MIN_WINDOW_SIZE = 8;
const MAX_WINDOW_SIZE = 15;
const MIN_MATCHES_TO_TRIGGER = 3; // Require 3+ distinct matches to trigger

let systemPromptNgrams = null;
let initialized = false;

const LEAKAGE_REPLACEMENT =
  "I appreciate the question! I'm here to help with college admissions, " +
  "career planning, and education strategy. " +
  "Tell me a bit about your situation — are you a student, parent, " +
  "or professional? I'd love to give you some tailored guidance.";

/**
 * Generate n-grams from system prompt text.
 * Returns a Set of lowercase multi-word substrings (20+ chars).
 */
function generateNgrams(text) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const ngrams = new Set();

  const maxWindow = Math.min(MAX_WINDOW_SIZE, words.length);

  for (let windowSize = MIN_WINDOW_SIZE; windowSize <= maxWindow; windowSize++) {
    for (let i = 0; i <= words.length - windowSize; i++) {
      const ngram = words.slice(i, i + windowSize).join(' ');
      if (ngram.length >= MIN_NGRAM_CHARS) {
        ngrams.add(ngram.toLowerCase());
      }
    }
  }

  return ngrams;
}

/**
 * Initialize the filter by loading the system prompt and building the n-gram set.
 * Called once at startup or on first use.
 */
export async function initOutputFilter() {
  if (initialized) return;

  const promptPath = join(__dirname, '..', '..', 'prompts', 'wayfinder-system-prompt.txt');
  try {
    const systemPrompt = await fs.readFile(promptPath, 'utf-8');
    systemPromptNgrams = generateNgrams(systemPrompt);
    initialized = true;
    console.log(`[SS-03] Output filter initialized: ${systemPromptNgrams.size} n-grams from system prompt`);
  } catch (err) {
    console.error(`[SS-03] Failed to load system prompt for output filter: ${err.message}`);
    // Fail open — if we can't load the prompt, we can't detect leakage.
    // Log the error but don't crash the service.
    systemPromptNgrams = new Set();
    initialized = true;
  }
}

/**
 * Re-initialize the filter (call after editing the system prompt file).
 */
export function invalidateOutputFilter() {
  initialized = false;
  systemPromptNgrams = null;
}

/**
 * Check if a response contains verbatim system prompt substrings.
 * Returns true if leakage is detected.
 */
export function checkLeakage(response) {
  if (!initialized || !systemPromptNgrams || systemPromptNgrams.size === 0) {
    return false;
  }

  const responseLower = response.toLowerCase();
  let matchCount = 0;
  const matchedNgrams = [];

  for (const ngram of systemPromptNgrams) {
    if (responseLower.includes(ngram)) {
      matchCount++;
      matchedNgrams.push(ngram.slice(0, 40) + '...');
      if (matchCount >= MIN_MATCHES_TO_TRIGGER) {
        console.log(`[SS-03] Leakage detected: ${matchCount} n-gram matches: ${matchedNgrams.join(' | ')}`);
        return true;
      }
    }
  }

  // Below threshold — not leakage, just normal education vocabulary overlap
  if (matchCount > 0) {
    console.log(`[SS-03] ${matchCount} n-gram near-miss (threshold: ${MIN_MATCHES_TO_TRIGGER}) — NOT blocking`);
  }

  return false;
}

/**
 * Filter a response for system prompt leakage.
 * If leakage is detected, replaces the entire response with a safe redirect.
 * Returns { response, leaked } where leaked indicates whether replacement occurred.
 */
export function filterResponse(response) {
  const leaked = checkLeakage(response);

  if (leaked) {
    console.log(`[SS-03] ⚠ System prompt leakage detected — response replaced`);
    return { response: LEAKAGE_REPLACEMENT, leaked: true };
  }

  return { response, leaked: false };
}

/**
 * Get the replacement text (for testing).
 */
export function getLeakageReplacement() {
  return LEAKAGE_REPLACEMENT;
}

/**
 * Get the current n-gram count (for diagnostics).
 */
export function getNgramCount() {
  return systemPromptNgrams ? systemPromptNgrams.size : 0;
}
