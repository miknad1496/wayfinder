#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SCRIPT_DIR = __dirname;
const SYSTEM_PROMPT =
  'You are Wayfinder, an AI assistant specialized in providing personalized guidance and recommendations for students exploring their educational and career paths.';

// Logger utilities
const log = {
  info: (msg) => console.log(`ℹ ${msg}`),
  success: (msg) => console.log(`✓ ${msg}`),
  error: (msg) => console.error(`✗ ${msg}`),
  warn: (msg) => console.warn(`⚠ ${msg}`),
};

// Validation functions
function isValidConversationPair(obj) {
  if (typeof obj !== 'object' || obj === null) return false;
  return (
    Array.isArray(obj.conversations) &&
    obj.conversations.length > 0 &&
    obj.conversations.every((turn) => {
      return (
        typeof turn === 'object' &&
        turn !== null &&
        typeof turn.role === 'string' &&
        typeof turn.content === 'string'
      );
    })
  );
}

// Normalize schema to standard format
function normalizeConversationPair(obj) {
  if (typeof obj !== 'object' || obj === null) return null;

  let conversations = null;

  if (Array.isArray(obj.conversations)) {
    conversations = obj.conversations;
  } else if (Array.isArray(obj.conversation)) {
    conversations = obj.conversation;
  } else if (Array.isArray(obj.turns)) {
    conversations = obj.turns;
  }

  if (!conversations || conversations.length === 0) return null;

  const validTurns = conversations.every((turn) => {
    return (
      typeof turn === 'object' &&
      turn !== null &&
      typeof turn.role === 'string' &&
      typeof turn.content === 'string'
    );
  });

  if (!validTurns) return null;

  return { conversations };
}

// Ensure system prompt is present
function ensureSystemPrompt(pair) {
  if (!Array.isArray(pair.conversations) || pair.conversations.length === 0) {
    return pair;
  }

  // Check if first turn is system prompt
  if (pair.conversations[0].role === 'system') {
    return pair;
  }

  // Add system prompt at the beginning
  return {
    conversations: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...pair.conversations,
    ],
  };
}

// Read and parse JSONL file
function readJsonlFile(filePath) {
  const pairs = [];
  const errors = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim().length > 0);

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      try {
        const parsed = JSON.parse(lines[i]);
        const normalized = normalizeConversationPair(parsed);

        if (normalized && isValidConversationPair(normalized)) {
          pairs.push(normalized);
        } else {
          errors.push({ lineNum, reason: 'Invalid schema or missing conversations' });
        }
      } catch (e) {
        errors.push({ lineNum, reason: `JSON parse error: ${e.message}` });
      }
    }
  } catch (e) {
    log.error(`Failed to read ${path.basename(filePath)}: ${e.message}`);
    return { pairs: [], errors: [{ reason: `File read error: ${e.message}` }] };
  }

  return { pairs, errors };
}

// Extract first user message for deduplication
function getFirstUserMessage(pair) {
  if (!Array.isArray(pair.conversations)) return '';
  const userTurn = pair.conversations.find((turn) => turn.role === 'user');
  return userTurn ? userTurn.content : '';
}

// Deduplicate pairs by first user message
function deduplicatePairs(pairs) {
  const seen = new Set();
  const deduped = [];
  let duplicateCount = 0;

  for (const pair of pairs) {
    const firstMsg = getFirstUserMessage(pair);
    if (!seen.has(firstMsg)) {
      seen.add(firstMsg);
      deduped.push(pair);
    } else {
      duplicateCount++;
    }
  }

  return { deduped, duplicateCount };
}

// Classify pair into category
function classifyPair(pair) {
  const conversations = pair.conversations || [];
  const text = conversations
    .map((t) => t.content)
    .join(' ')
    .toLowerCase();

  const admissionsKeywords = [
    'admissions',
    'application',
    'gpa',
    'sat',
    'act',
    'college',
    'university',
    'transcript',
    'essay',
    'apply',
    'acceptance',
  ];
  const careerKeywords = [
    'career',
    'job',
    'profession',
    'industry',
    'salary',
    'path',
    'field',
    'major',
    'internship',
    'skills',
    'employment',
  ];

  const admissionsCount = admissionsKeywords.filter((kw) => text.includes(kw)).length;
  const careerCount = careerKeywords.filter((kw) => text.includes(kw)).length;

  if (admissionsCount > careerCount) return 'admissions';
  if (careerCount > admissionsCount) return 'career';
  return 'general'; // Default to general/unclassified
}

// Write pairs to output file
function writePairsToFile(filePath, pairs) {
  try {
    const lines = pairs.map((pair) => JSON.stringify(pair));
    fs.writeFileSync(filePath, lines.join('\n') + '\n');
    return true;
  } catch (e) {
    log.error(`Failed to write ${path.basename(filePath)}: ${e.message}`);
    return false;
  }
}

// Main execution
async function main() {
  log.info('Starting training data merge...');

  const admissionsPairs = [];
  const careerPairs = [];
  let totalDuplicates = 0;
  let totalSchemaFixes = 0;

  // Find all admissions-*.jsonl files
  log.info('Processing admissions files...');
  const admissionsFiles = fs
    .readdirSync(SCRIPT_DIR)
    .filter((f) => f.match(/^admissions-.*\.jsonl$/) && f !== 'admissions-unified.jsonl')
    .map((f) => path.join(SCRIPT_DIR, f));

  let admissionsProcessed = 0;
  for (const filePath of admissionsFiles) {
    const { pairs, errors } = readJsonlFile(filePath);
    admissionsProcessed += pairs.length;

    for (const pair of pairs) {
      const withSystem = ensureSystemPrompt(pair);
      const original = JSON.stringify(pair);
      const fixed = JSON.stringify(withSystem);

      if (original !== fixed) {
        totalSchemaFixes++;
      }
      admissionsPairs.push(withSystem);
    }

    if (errors.length > 0) {
      log.warn(`${path.basename(filePath)}: ${errors.length} invalid lines`);
    }
  }
  log.success(`Loaded ${admissionsProcessed} admissions pairs from ${admissionsFiles.length} files`);

  // Find all career-*.jsonl files
  log.info('Processing career files...');
  const careerFiles = fs
    .readdirSync(SCRIPT_DIR)
    .filter((f) => f.match(/^career-.*\.jsonl$/) && f !== 'career-unified.jsonl')
    .map((f) => path.join(SCRIPT_DIR, f));

  let careerProcessed = 0;
  for (const filePath of careerFiles) {
    const { pairs, errors } = readJsonlFile(filePath);
    careerProcessed += pairs.length;

    for (const pair of pairs) {
      const withSystem = ensureSystemPrompt(pair);
      const original = JSON.stringify(pair);
      const fixed = JSON.stringify(withSystem);

      if (original !== fixed) {
        totalSchemaFixes++;
      }
      careerPairs.push(withSystem);
    }

    if (errors.length > 0) {
      log.warn(`${path.basename(filePath)}: ${errors.length} invalid lines`);
    }
  }
  log.success(`Loaded ${careerProcessed} career pairs from ${careerFiles.length} files`);

  // Process training-pairs/wayfinder-pairs-v1.jsonl if it exists
  log.info('Processing wayfinder-pairs-v1.jsonl...');
  const trainingPairsPath = path.join(SCRIPT_DIR, 'training-pairs', 'wayfinder-pairs-v1.jsonl');
  let v1Processed = 0;
  if (fs.existsSync(trainingPairsPath)) {
    const { pairs, errors } = readJsonlFile(trainingPairsPath);
    v1Processed = pairs.length;

    for (const pair of pairs) {
      const withSystem = ensureSystemPrompt(pair);
      const original = JSON.stringify(pair);
      const fixed = JSON.stringify(withSystem);

      if (original !== fixed) {
        totalSchemaFixes++;
      }

      const category = classifyPair(withSystem);
      if (category === 'admissions') {
        admissionsPairs.push(withSystem);
      } else if (category === 'career') {
        careerPairs.push(withSystem);
      } else {
        // Default to career if unclassified
        careerPairs.push(withSystem);
      }
    }

    if (errors.length > 0) {
      log.warn(`wayfinder-pairs-v1.jsonl: ${errors.length} invalid lines`);
    }
    log.success(`Loaded and classified ${v1Processed} pairs from wayfinder-pairs-v1.jsonl`);
  } else {
    log.warn('wayfinder-pairs-v1.jsonl not found, skipping');
  }

  // Deduplicate
  log.info('Deduplicating pairs...');
  const { deduped: admissionsDeduped, duplicateCount: admissionsDups } =
    deduplicatePairs(admissionsPairs);
  const { deduped: careerDeduped, duplicateCount: careerDups } =
    deduplicatePairs(careerPairs);
  totalDuplicates = admissionsDups + careerDups;

  log.success(
    `Removed ${totalDuplicates} duplicate pairs (admissions: ${admissionsDups}, career: ${careerDups})`
  );

  // Write unified files
  log.info('Writing unified output files...');
  const admissionsUnified = path.join(SCRIPT_DIR, 'admissions-unified.jsonl');
  const careerUnified = path.join(SCRIPT_DIR, 'career-unified.jsonl');

  let success = true;
  if (writePairsToFile(admissionsUnified, admissionsDeduped)) {
    log.success(`Wrote ${admissionsDeduped.length} pairs to admissions-unified.jsonl`);
  } else {
    success = false;
  }

  if (writePairsToFile(careerUnified, careerDeduped)) {
    log.success(`Wrote ${careerDeduped.length} pairs to career-unified.jsonl`);
  } else {
    success = false;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 MERGE SUMMARY');
  console.log('='.repeat(60));
  console.log(`Admissions pairs: ${admissionsDeduped.length} (from ${admissionsProcessed})`);
  console.log(`Career pairs:     ${careerDeduped.length} (from ${careerProcessed})`);
  console.log(`V1 pairs added:   ${v1Processed}`);
  console.log(`Total duplicates removed: ${totalDuplicates}`);
  console.log(`Schema fixes applied:     ${totalSchemaFixes}`);
  console.log(`System prompts added:     ${totalSchemaFixes}`);
  console.log('='.repeat(60));
  console.log('Output files:');
  console.log(`  ✓ ${path.relative(SCRIPT_DIR, admissionsUnified)}`);
  console.log(`  ✓ ${path.relative(SCRIPT_DIR, careerUnified)}`);
  console.log('='.repeat(60));

  process.exit(success ? 0 : 1);
}

main().catch((e) => {
  log.error(e.message);
  process.exit(1);
});
