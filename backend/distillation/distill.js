#!/usr/bin/env node

/**
 * WAYFINDER KNOWLEDGE DISTILLATION ENGINE
 *
 * This script sends carefully crafted prompts to Claude Opus 4.6
 * to synthesize deep career intelligence. The outputs are stored
 * as markdown files in the knowledge base, where Wayfinder's RAG
 * system picks them up automatically.
 *
 * Architecture:
 *   Opus 4.6 (teacher) → synthesized insights → knowledge-base/ → Sonnet (student via RAG)
 *
 * This is knowledge distillation: expensive reasoning done once,
 * served cheaply at scale through RAG.
 *
 * Usage:
 *   node distill.js                    # Run all prompts
 *   node distill.js --layer roi        # Run specific layer
 *   node distill.js --id pathway-tech  # Run specific prompt by ID (partial match)
 *   node distill.js --list             # List all prompts without running
 *   node distill.js --resume           # Skip already-generated files
 */

import Anthropic from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ALL_PROMPTS, LAYERS, PROMPT_COUNT, LAYER_COUNT } from './prompts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

// ============================================================
// CONFIG
// ============================================================
const CONFIG = {
  model: 'claude-opus-4-6-20250610',
  maxTokens: 8192,
  temperature: 0.3, // Lower temp for more consistent, factual output
  outputDir: join(__dirname, '..', 'knowledge-base', 'distilled'),
  scrapedDir: join(__dirname, '..', 'data', 'scraped'),
  delayBetweenCalls: 3000, // 3 seconds between API calls to be respectful
  systemPrompt: `You are the intelligence engine behind Wayfinder, an AI career advisor built for pre-college and college students, as well as career changers.

Your role in this conversation is to generate deep, synthesized career intelligence that will be stored in Wayfinder's knowledge base and served to users via RAG.

Guidelines:
- Be specific and data-grounded. Cite BLS, NCES, Georgetown CEW, or other sources when possible.
- When you're reasoning beyond data, say so explicitly ("Based on industry patterns..." or "Anecdotally...").
- Be contrarian where the data supports it. Challenge conventional career advice when it's wrong.
- Write for maximum information density. Every paragraph should contain actionable insight.
- Use clear markdown formatting with headers, but prioritize content over formatting.
- Don't hedge excessively. Be direct. These insights need to be useful, not just safe.
- Think like a brilliant career strategist who genuinely cares about the student's outcome.
- Include specific numbers (salaries, timelines, costs) wherever possible.
- Acknowledge tradeoffs honestly. There are no perfect career paths — help people make informed tradeoffs.`
};

// ============================================================
// HELPERS
// ============================================================
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    list: args.includes('--list'),
    resume: args.includes('--resume'),
    layer: args.find((a, i) => args[i - 1] === '--layer'),
    id: args.find((a, i) => args[i - 1] === '--id'),
    help: args.includes('--help') || args.includes('-h')
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sanitizeFilename(id) {
  return id.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
}

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function loadScrapedData(filename) {
  const path = join(CONFIG.scrapedDir, filename);
  try {
    const raw = await fs.readFile(path, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`  ⚠ Could not load scraped data from ${filename}: ${err.message}`);
    return null;
  }
}

// ============================================================
// MAIN DISTILLATION ENGINE
// ============================================================
async function distillPrompt(client, promptConfig, index, total) {
  const { id, layer, title, prompt, requiresData, dataSource } = promptConfig;
  const outputFile = join(CONFIG.outputDir, `${sanitizeFilename(id)}.md`);

  console.log(`\n  [${index + 1}/${total}] 🧠 ${title}`);
  console.log(`           Layer: ${layer}`);
  console.log(`           Output: distilled/${sanitizeFilename(id)}.md`);

  // Build the prompt — inject scraped data if needed
  let finalPrompt = prompt;
  if (requiresData && dataSource) {
    const data = await loadScrapedData(dataSource);
    if (data) {
      const dataStr = JSON.stringify(data, null, 2);
      // Truncate if too large (keep under ~50K chars to leave room for reasoning)
      const truncated = dataStr.length > 50000
        ? dataStr.substring(0, 50000) + '\n... [truncated for length]'
        : dataStr;
      finalPrompt = prompt.replace(
        /\[SCRAPED .* WILL BE INJECTED HERE\]/,
        `\n\nHere is the scraped data:\n\`\`\`json\n${truncated}\n\`\`\``
      );
      console.log(`           📊 Injected ${data.length || 'N/A'} records from ${dataSource}`);
    } else {
      console.log(`           ⚠ No scraped data available — using general knowledge only`);
      finalPrompt = prompt.replace(
        /\[SCRAPED .* WILL BE INJECTED HERE\]/,
        '\n\n[No scraped data available. Use your training knowledge to provide the best analysis possible.]'
      );
    }
  }

  // Make the API call
  const startTime = Date.now();
  try {
    const response = await client.messages.create({
      model: CONFIG.model,
      max_tokens: CONFIG.maxTokens,
      temperature: CONFIG.temperature,
      system: CONFIG.systemPrompt,
      messages: [{ role: 'user', content: finalPrompt }]
    });

    const content = response.content[0].text;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const tokens = response.usage;

    // Add metadata header to the output
    const output = `# ${title}
<!--
  Generated by Wayfinder Knowledge Distillation Engine
  Model: ${CONFIG.model}
  Layer: ${layer}
  Prompt ID: ${id}
  Generated: ${new Date().toISOString()}
  Input tokens: ${tokens.input_tokens}
  Output tokens: ${tokens.output_tokens}
-->

${content}
`;

    await fs.writeFile(outputFile, output, 'utf-8');
    console.log(`           ✅ Done in ${elapsed}s (${tokens.input_tokens} in / ${tokens.output_tokens} out)`);

    return {
      id,
      success: true,
      tokens: tokens.input_tokens + tokens.output_tokens,
      elapsed: parseFloat(elapsed)
    };
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`           ❌ Failed after ${elapsed}s: ${err.message}`);

    // Detect credit exhaustion — save progress and stop gracefully
    if (err.message?.includes('credit') || err.message?.includes('balance') || err.status === 402) {
      console.error(`\n  ⚠️  API CREDITS EXHAUSTED`);
      console.error(`  Your Anthropic API balance has run out.`);
      console.error(`  ${index} of ${total} prompts completed successfully.`);
      console.error(`  \n  To continue:`);
      console.error(`    1. Add more credits at console.anthropic.com → Billing`);
      console.error(`    2. Run DISTILL.bat again and choose "Resume"`);
      console.error(`    3. It will pick up right where it left off.\n`);
      return { id, success: false, error: 'CREDITS_EXHAUSTED', fatal: true };
    }

    // Detect rate limiting — wait and retry once
    if (err.status === 429 || err.message?.includes('rate')) {
      const retryAfter = err.headers?.['retry-after'] ? parseInt(err.headers['retry-after']) * 1000 : 60000;
      console.log(`           ⏳ Rate limited. Waiting ${retryAfter / 1000}s then retrying...`);
      await sleep(retryAfter);
      try {
        const retryResponse = await client.messages.create({
          model: CONFIG.model,
          max_tokens: CONFIG.maxTokens,
          temperature: CONFIG.temperature,
          system: CONFIG.systemPrompt,
          messages: [{ role: 'user', content: finalPrompt }]
        });
        const content = retryResponse.content[0].text;
        const tokens = retryResponse.usage;
        const retryElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const output = `# ${title}\n<!--\n  Generated by Wayfinder Knowledge Distillation Engine\n  Model: ${CONFIG.model}\n  Layer: ${layer}\n  Prompt ID: ${id}\n  Generated: ${new Date().toISOString()}\n  Input tokens: ${tokens.input_tokens}\n  Output tokens: ${tokens.output_tokens}\n-->\n\n${content}\n`;
        await fs.writeFile(outputFile, output, 'utf-8');
        console.log(`           ✅ Retry succeeded in ${retryElapsed}s`);
        return { id, success: true, tokens: tokens.input_tokens + tokens.output_tokens, elapsed: parseFloat(retryElapsed) };
      } catch (retryErr) {
        console.error(`           ❌ Retry also failed: ${retryErr.message}`);
      }
    }

    // Detect overloaded API
    if (err.status === 529 || err.message?.includes('overloaded')) {
      console.log(`           ⏳ API overloaded. Waiting 30s before continuing...`);
      await sleep(30000);
    }

    // Write error log (not .md so --resume will retry this prompt)
    const errorFile = join(CONFIG.outputDir, `${sanitizeFilename(id)}.error.txt`);
    await fs.writeFile(errorFile, `Error: ${err.message}\nTimestamp: ${new Date().toISOString()}\n`, 'utf-8');

    return { id, success: false, error: err.message };
  }
}

async function runDistillation(prompts, options = {}) {
  const { resume = false } = options;

  // Init
  await ensureDir(CONFIG.outputDir);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\n  ❌ ANTHROPIC_API_KEY not found in .env file');
    console.error('     Create a .env file in the project root with:');
    console.error('     ANTHROPIC_API_KEY=sk-ant-...\n');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Filter already-completed prompts if resuming
  let toRun = prompts;
  if (resume) {
    const filtered = [];
    for (const p of prompts) {
      const outputFile = join(CONFIG.outputDir, `${sanitizeFilename(p.id)}.md`);
      if (await fileExists(outputFile)) {
        console.log(`  ⏭ Skipping ${p.id} (already exists)`);
      } else {
        filtered.push(p);
      }
    }
    toRun = filtered;
  }

  if (toRun.length === 0) {
    console.log('\n  ✅ All prompts already distilled. Nothing to do.');
    console.log('     (Delete files from knowledge-base/distilled/ to re-run)\n');
    return;
  }

  console.log(`\n  ╔══════════════════════════════════════════════════╗`);
  console.log(`  ║  WAYFINDER KNOWLEDGE DISTILLATION ENGINE         ║`);
  console.log(`  ║  Opus 4.6 → Synthesized Intelligence → RAG       ║`);
  console.log(`  ╚══════════════════════════════════════════════════╝`);
  console.log(`\n  Model: ${CONFIG.model}`);
  console.log(`  Prompts to run: ${toRun.length}`);
  console.log(`  Output: backend/knowledge-base/distilled/`);
  console.log(`  Estimated time: ~${Math.ceil(toRun.length * 1.5)} minutes`);
  console.log(`  Estimated cost: ~$${(toRun.length * 0.15).toFixed(2)} (varies by response length)`);

  const results = [];
  let totalTokens = 0;
  let totalTime = 0;
  let successes = 0;
  let failures = 0;

  for (let i = 0; i < toRun.length; i++) {
    const result = await distillPrompt(client, toRun[i], i, toRun.length);
    results.push(result);

    if (result.success) {
      successes++;
      totalTokens += result.tokens;
      totalTime += result.elapsed;
    } else {
      failures++;
      // Stop immediately if credits are exhausted
      if (result.fatal) {
        console.log(`\n  Stopping early — ${successes} prompts completed, ${toRun.length - i - 1} remaining.`);
        console.log(`  Run with --resume to continue after adding credits.\n`);
        break;
      }
    }

    // Delay between calls
    if (i < toRun.length - 1) {
      await sleep(CONFIG.delayBetweenCalls);
    }
  }

  // Summary
  console.log(`\n  ═══════════════════════════════════════════════`);
  console.log(`  DISTILLATION COMPLETE`);
  console.log(`  ───────────────────────────────────────────────`);
  console.log(`  ✅ Successful: ${successes}/${toRun.length}`);
  if (failures > 0) console.log(`  ❌ Failed: ${failures}`);
  console.log(`  📊 Total tokens: ${totalTokens.toLocaleString()}`);
  console.log(`  ⏱  Total time: ${totalTime.toFixed(0)}s`);
  console.log(`  💰 Est. cost: ~$${(totalTokens * 0.000035).toFixed(2)}`);
  console.log(`  📁 Files: backend/knowledge-base/distilled/`);
  console.log(`  ═══════════════════════════════════════════════`);

  if (failures > 0) {
    console.log(`\n  Failed prompts (re-run with --resume to retry):`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`    - ${r.id}: ${r.error}`);
    });
  }

  console.log(`\n  Next steps:`);
  console.log(`    1. Review the generated files in knowledge-base/distilled/`);
  console.log(`    2. Push to GitHub: git add . && git commit -m "Add distilled knowledge" && git push`);
  console.log(`    3. Render will auto-deploy and Wayfinder's RAG picks up the new intelligence\n`);
}

// ============================================================
// LIST MODE
// ============================================================
function listPrompts() {
  console.log(`\n  WAYFINDER DISTILLATION PROMPTS`);
  console.log(`  ─────────────────────────────────────────`);
  console.log(`  ${PROMPT_COUNT} prompts across ${LAYER_COUNT} layers\n`);

  for (const [key, layer] of Object.entries(LAYERS)) {
    console.log(`  📂 ${layer.name} (${layer.prompts.length} prompts)`);
    for (const p of layer.prompts) {
      const dataTag = p.requiresData ? ' [needs scraped data]' : '';
      console.log(`     • ${p.id}: ${p.title}${dataTag}`);
    }
    console.log();
  }
}

// ============================================================
// ENTRY POINT
// ============================================================
async function main() {
  const args = parseArgs();

  if (args.help) {
    console.log(`
  Wayfinder Knowledge Distillation Engine

  Usage:
    node distill.js                    Run all prompts
    node distill.js --layer <name>     Run specific layer (partial match)
    node distill.js --id <id>          Run specific prompt (partial match)
    node distill.js --list             List all prompts
    node distill.js --resume           Skip already-completed prompts
    node distill.js --help             Show this help

  Layers: ${Object.keys(LAYERS).join(', ')}
    `);
    return;
  }

  if (args.list) {
    listPrompts();
    return;
  }

  // Filter prompts based on args
  let prompts = ALL_PROMPTS;

  if (args.layer) {
    const matchKey = Object.keys(LAYERS).find(k => k.includes(args.layer.toLowerCase()));
    if (!matchKey) {
      console.error(`\n  ❌ Unknown layer: "${args.layer}"`);
      console.error(`     Available: ${Object.keys(LAYERS).join(', ')}\n`);
      process.exit(1);
    }
    prompts = LAYERS[matchKey].prompts;
    console.log(`\n  Running layer: ${LAYERS[matchKey].name} (${prompts.length} prompts)`);
  }

  if (args.id) {
    const match = ALL_PROMPTS.filter(p => p.id.includes(args.id.toLowerCase()));
    if (match.length === 0) {
      console.error(`\n  ❌ No prompt found matching: "${args.id}"\n`);
      process.exit(1);
    }
    prompts = match;
    console.log(`\n  Running ${match.length} prompt(s) matching: "${args.id}"`);
  }

  await runDistillation(prompts, { resume: args.resume });
}

main().catch(err => {
  console.error('\n  ❌ Fatal error:', err.message);
  process.exit(1);
});
