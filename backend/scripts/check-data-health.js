#!/usr/bin/env node

/**
 * check-data-health.js — Standalone data health check.
 *
 * Validates all three data files (internships, scholarships, programs) for:
 *   - Duplicates (by canonical key)
 *   - Missing required fields
 *   - Verified entry integrity (_source URL format, _verifiedDate)
 *   - Schema consistency
 *
 * Run manually:  node backend/scripts/check-data-health.js
 * Run with fix:  node backend/scripts/check-data-health.js --fix
 *
 * Exit codes:
 *   0 = all clean
 *   1 = issues found (no fix applied)
 *   2 = issues found and fixed (re-run to verify)
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { validateAndDedup, getDataStats, runDataHealthCheck } from '../services/data-integrity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data', 'scraped');

const shouldFix = process.argv.includes('--fix');

const FILES = {
  internships: { file: 'internships.json', arrayKey: 'internships' },
  scholarships: { file: 'scholarships.json', arrayKey: 'scholarships' },
  programs: { file: 'programs.json', arrayKey: 'programs' },
};

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Wayfinder Data Health Check');
  console.log('═══════════════════════════════════════════════════\n');

  let hasIssues = false;
  let fixedSomething = false;

  for (const [type, { file, arrayKey }] of Object.entries(FILES)) {
    const filePath = join(DATA_DIR, file);
    console.log(`\n📂 ${type.toUpperCase()} (${file})`);
    console.log('─'.repeat(50));

    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(raw);
      const entries = data[arrayKey] || [];

      // Quick stats
      const stats = getDataStats(type, entries);
      console.log(`  Total entries:  ${stats.total}`);
      console.log(`  Unique:         ${stats.unique}`);
      console.log(`  Duplicates:     ${stats.duplicates}`);
      console.log(`  Verified:       ${stats.verified}`);
      console.log(`  Invalid:        ${stats.invalid}`);

      if (stats.healthy) {
        console.log(`  Status:         ✅ CLEAN`);
      } else {
        console.log(`  Status:         ❌ ISSUES FOUND`);
        hasIssues = true;

        if (shouldFix) {
          console.log(`\n  🔧 Applying fix...`);
          const { clean, removed, warnings, stats: fixStats } = validateAndDedup(type, entries);

          data[arrayKey] = clean;
          data.metadata = data.metadata || {};
          data.metadata.totalCount = clean.length;
          data.metadata.lastHealthCheck = new Date().toISOString();
          data.metadata.healthCheckAction = `Removed ${fixStats.duplicatesRemoved} dupes, ${fixStats.invalidRemoved} invalid`;

          await fs.writeFile(filePath, JSON.stringify(data, null, 2));
          fixedSomething = true;

          console.log(`  ✅ Fixed: ${clean.length} entries (removed ${removed.length})`);
          if (warnings.length > 0) {
            console.log(`  ⚠️  ${warnings.length} warnings:`);
            warnings.slice(0, 5).forEach(w => console.log(`     ${w}`));
            if (warnings.length > 5) console.log(`     ... and ${warnings.length - 5} more`);
          }
        }
      }

      // State distribution for context
      const byState = {};
      for (const e of entries) {
        const state = e.location?.state || 'Other';
        byState[state] = (byState[state] || 0) + 1;
      }
      const topStates = Object.entries(byState).sort((a, b) => b[1] - a[1]).slice(0, 5);
      if (topStates.length > 0) {
        console.log(`  Top states:     ${topStates.map(([s, c]) => `${s}(${c})`).join(', ')}`);
      }

    } catch (err) {
      console.log(`  ❌ ERROR: ${err.message}`);
      hasIssues = true;
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  if (!hasIssues) {
    console.log('  ✅ All data files are clean!');
    process.exit(0);
  } else if (fixedSomething) {
    console.log('  🔧 Issues were found and fixed. Run again to verify.');
    process.exit(2);
  } else {
    console.log('  ❌ Issues found. Run with --fix to auto-repair.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
