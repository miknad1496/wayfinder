#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SCRIPT_DIR = __dirname;
const FIX_MODE = process.argv.includes('--fix');

// Logger utilities
const log = {
  info: (msg) => console.log(`ℹ ${msg}`),
  success: (msg) => console.log(`✓ ${msg}`),
  error: (msg) => console.error(`✗ ${msg}`),
  warn: (msg) => console.warn(`⚠ ${msg}`),
};

// Schema validation functions
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

  // Try standard "conversations" field
  if (Array.isArray(obj.conversations)) {
    conversations = obj.conversations;
  }
  // Try "conversation" (singular) field
  else if (Array.isArray(obj.conversation)) {
    conversations = obj.conversation;
  }
  // Try "turns" field
  else if (Array.isArray(obj.turns)) {
    conversations = obj.turns;
  }

  if (!conversations || conversations.length === 0) return null;

  // Validate all turns have role and content
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

// Process a single JSONL file
function processJsonlFile(filePath) {
  const fileName = path.basename(filePath);
  const stats = {
    fileName,
    filePath,
    validLines: 0,
    invalidLines: 0,
    totalConversations: 0,
    pairs: [],
    errors: [],
  };

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim().length > 0);

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      try {
        const parsed = JSON.parse(lines[i]);
        const normalized = normalizeConversationPair(parsed);

        if (normalized && isValidConversationPair(normalized)) {
          stats.validLines++;
          stats.totalConversations += normalized.conversations.length;
          stats.pairs.push({ lineNum, data: normalized, original: parsed });
        } else {
          stats.invalidLines++;
          stats.errors.push({
            lineNum,
            reason: 'Invalid schema or missing conversations',
            preview: lines[i].substring(0, 100),
          });
        }
      } catch (e) {
        stats.invalidLines++;
        stats.errors.push({
          lineNum,
          reason: `JSON parse error: ${e.message}`,
          preview: lines[i].substring(0, 100),
        });
      }
    }
  } catch (e) {
    log.error(`Failed to read file ${filePath}: ${e.message}`);
    return null;
  }

  return stats;
}

// Fix and rewrite JSONL file
function fixJsonlFile(fileStats) {
  if (fileStats.validLines === 0) {
    log.warn(`${fileStats.fileName}: No valid lines to write`);
    return 0;
  }

  try {
    const outputLines = fileStats.pairs.map((pair) => JSON.stringify(pair.data));
    fs.writeFileSync(fileStats.filePath, outputLines.join('\n') + '\n');
    log.success(
      `Fixed ${fileStats.fileName}: removed ${fileStats.invalidLines} invalid lines`
    );
    return fileStats.invalidLines;
  } catch (e) {
    log.error(`Failed to write fixed file ${fileStats.filePath}: ${e.message}`);
    return 0;
  }
}

// Report stats for a file
function reportFileStats(stats) {
  const avgTurns =
    stats.validLines > 0 ? (stats.totalConversations / stats.validLines).toFixed(2) : '0.00';

  console.log(`\n📄 ${stats.fileName}`);
  console.log(`   Valid lines:     ${stats.validLines}`);
  console.log(`   Invalid lines:   ${stats.invalidLines}`);
  console.log(`   Total conversations: ${stats.totalConversations}`);
  console.log(`   Avg turns/pair:  ${avgTurns}`);

  if (stats.invalidLines > 0 && stats.errors.length > 0 && stats.errors.length <= 5) {
    console.log(`   Sample errors:`);
    stats.errors.slice(0, 3).forEach((err) => {
      console.log(`     Line ${err.lineNum}: ${err.reason}`);
    });
  }
}

// Main execution
async function main() {
  log.info(`Scanning JSONL files in ${SCRIPT_DIR}`);

  // Find all .jsonl files
  let jsonlFiles = [];
  try {
    const files = fs.readdirSync(SCRIPT_DIR);
    jsonlFiles = files
      .filter((f) => f.endsWith('.jsonl'))
      .map((f) => path.join(SCRIPT_DIR, f));
  } catch (e) {
    log.error(`Failed to scan directory: ${e.message}`);
    process.exit(1);
  }

  if (jsonlFiles.length === 0) {
    log.warn(`No .jsonl files found in ${SCRIPT_DIR}`);
    process.exit(0);
  }

  log.info(`Found ${jsonlFiles.length} JSONL file(s)`);

  // Process each file
  const allStats = [];
  let totalValidPairs = 0;
  let totalInvalidLines = 0;

  for (const filePath of jsonlFiles) {
    const stats = processJsonlFile(filePath);
    if (stats) {
      allStats.push(stats);
      totalValidPairs += stats.validLines;
      totalInvalidLines += stats.invalidLines;
      reportFileStats(stats);
    }
  }

  // Fix mode
  if (FIX_MODE) {
    console.log('\n🔧 Fix mode enabled, rewriting files...');
    let fixedLines = 0;
    for (const stats of allStats) {
      fixedLines += fixJsonlFile(stats);
    }
    log.success(`Removed ${fixedLines} total invalid lines across all files`);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total valid pairs:   ${totalValidPairs}`);
  console.log(`Total invalid lines: ${totalInvalidLines}`);
  console.log(`Files processed:     ${allStats.length}`);
  if (FIX_MODE) {
    console.log(`Mode: FIX (invalid lines removed)`);
  } else {
    console.log(`Mode: VALIDATE (no changes made)`);
    console.log(`Run with --fix to remove invalid lines`);
  }
  console.log('='.repeat(50));

  process.exit(totalInvalidLines > 0 && !FIX_MODE ? 1 : 0);
}

main().catch((e) => {
  log.error(e.message);
  process.exit(1);
});
