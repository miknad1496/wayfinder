/**
 * Strategic Intelligence Generator
 *
 * Takes College Scorecard data for 180+ new schools and generates
 * rich strategic admissions intelligence using Claude.
 *
 * This creates the same quality of advisory content that exists for
 * the original 49 schools — the stuff that makes Wayfinder feel like
 * a real $10K admissions consultant.
 *
 * Run: node backend/scrapers/strategic-intel-generator.js [--batch-size=20] [--start=0]
 * Requires: ANTHROPIC_API_KEY in .env
 *
 * Output: backend/data/scraped/strategic-intel-expanded.json
 *         (merges with existing college-admissions.json strategicIntel)
 *
 * Cost estimate: ~180 schools × ~2K tokens/school = ~360K output tokens
 *                Using Sonnet 4.6: roughly $1-2 total
 */

import Anthropic from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

const client = new Anthropic();

// Parse CLI args
const args = process.argv.slice(2);
const batchSize = parseInt(args.find(a => a.startsWith('--batch-size='))?.split('=')[1]) || 20;
const startIdx = parseInt(args.find(a => a.startsWith('--start='))?.split('=')[1]) || 0;
const useOpus = args.includes('--opus');

const MODEL = useOpus ? 'claude-opus-4-6' : 'claude-sonnet-4-6';

// ==========================================
// STRATEGIC INTEL PROMPT
// ==========================================

function buildPrompt(school) {
  const adm = school.admissions || {};
  const cost = school.cost || {};
  const aid = school.financialAid || {};
  const earn = school.earnings || {};
  const body = school.studentBody || {};
  const demos = body.demographics || {};
  const programs = school.programs || [];

  const acceptRate = adm.acceptanceRate
    ? `${(adm.acceptanceRate * 100).toFixed(1)}%`
    : 'Not reported';

  const topPrograms = programs.slice(0, 10)
    .map(p => `${p.name} ($${p.medianEarnings.toLocaleString()}/yr)`)
    .join(', ');

  return `You are an elite college admissions consultant generating strategic intelligence for a specific university. This data will be used to train an AI admissions advisor.

Generate a comprehensive strategic profile for: **${school.name}**

Here is the quantitative data we have from College Scorecard:
- Location: ${school.city}, ${school.state}
- Type: ${school.type}${school.isHBCU ? ' (HBCU)' : ''}${school.womenOnly ? ' (Women\'s college)' : ''}
- Acceptance rate: ${acceptRate}
- SAT average: ${adm.satAvg || 'N/A'} | ACT midpoint: ${adm.actMid || 'N/A'}
- SAT 25th-75th: ${adm.sat25thMath || '?'}-${adm.sat75thMath || '?'} Math, ${adm.sat25thReading || '?'}-${adm.sat75thReading || '?'} Reading
- Undergrad enrollment: ${body.undergradEnrollment?.toLocaleString() || 'N/A'}
- Retention rate: ${school.outcomes?.retentionRate ? (school.outcomes.retentionRate * 100).toFixed(0) + '%' : 'N/A'}
- 4-year grad rate: ${school.outcomes?.gradRate4yr ? (school.outcomes.gradRate4yr * 100).toFixed(0) + '%' : 'N/A'}
- Tuition (in-state): $${cost.tuitionInState?.toLocaleString() || 'N/A'} | (out-of-state): $${cost.tuitionOutOfState?.toLocaleString() || 'N/A'}
- Avg net price: $${cost.avgNetPrice?.toLocaleString() || 'N/A'}
- Net price for families <$30K: $${cost.netPriceByIncome?.income0_30k?.toLocaleString() || 'N/A'}
- Pell grant rate: ${aid.pellGrantRate ? (aid.pellGrantRate * 100).toFixed(0) + '%' : 'N/A'}
- Median debt at graduation: $${aid.medianDebt?.toLocaleString() || 'N/A'}
- Median earnings 6yr post: $${earn.median6yr?.toLocaleString() || 'N/A'} | 10yr: $${earn.median10yr?.toLocaleString() || 'N/A'}
- Demographics: ${demos.white ? (demos.white * 100).toFixed(0) : '?'}% White, ${demos.black ? (demos.black * 100).toFixed(0) : '?'}% Black, ${demos.hispanic ? (demos.hispanic * 100).toFixed(0) : '?'}% Hispanic, ${demos.asian ? (demos.asian * 100).toFixed(0) : '?'}% Asian
- Top programs by earnings: ${topPrograms || 'Not available'}

Respond with ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "school": "${school.name}",
  "acceptanceRate": "X.X%",
  "edAdvantage": "Description of Early Decision/Early Action advantage with specific acceptance rate data if known, or 'Regular admission only' if no ED/EA",
  "lessCompetitivePaths": "Specific majors or programs with smaller applicant pools or higher acceptance rates",
  "schoolsWithinSchool": "Description of different colleges/schools within the university and any acceptance rate differences, or 'Single admission for all undergrads'",
  "transferRate": "Transfer acceptance info and any notable pathway programs (community college agreements, etc.)",
  "financialAid": "Key financial aid facts — need-blind status, no-loan policies, income thresholds, % receiving aid, notable scholarships",
  "insiderTip": "The ONE thing a $10K admissions consultant would tell a family — the non-obvious strategic insight that most applicants miss",
  "essayStrategy": "Specific advice for this school's essays — what works, what to avoid, what the admissions office actually values",
  "programs": {
    "totalMajors": <number or estimate>,
    "popularMajors": ["Top 5 most popular or notable majors"],
    "uniquePrograms": "What makes this school's academic offerings distinctive",
    "curriculumHighlights": "Core requirements, notable programs, research opportunities",
    "preMedPath": "Pre-med track description and competitiveness",
    "preBusinessPath": "Business/finance path description",
    "engineeringPath": "Engineering program description and reputation"
  },
  "schoolStructure": {
    "hasMultipleSchools": <boolean>,
    "schools": [
      {
        "name": "School/college name",
        "acceptanceRate": "X% if different from overall, or same as overall",
        "notes": "Key admission differences or requirements"
      }
    ],
    "internalTransfers": "Can students switch between schools/colleges after admission?",
    "dualDegreePrograms": "Notable dual degree or combined programs"
  },
  "communityIntel": {
    "source": "Common sources: r/ApplyingToCollege, College Confidential, Niche.com",
    "admissionsQuirks": "What makes this school's admissions process unique or surprising",
    "commonMistakes": "What applicants get wrong about this school",
    "hiddenGems": "Programs, opportunities, or facts that most applicants don't know about",
    "redditWisdom": "What current students and admissions discussions reveal",
    "strategyTips": "Actionable strategy for maximizing admission chances"
  }
}

Be specific, data-driven, and strategic. Avoid generic advice. Write like an insider who knows this school deeply. If you're unsure about a specific data point, make reasonable inferences based on the school's profile and peer institutions, but note uncertainty.`;
}

// ==========================================
// GENERATION ENGINE
// ==========================================

async function generateIntel(school) {
  const prompt = buildPrompt(school);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2500,
    temperature: 0.3,  // Low temp for factual consistency
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();

  // Parse JSON — handle potential markdown wrapping
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    // Try stripping markdown code blocks
    const cleaned = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    json = JSON.parse(cleaned);
  }

  return {
    ...json,
    _meta: {
      generatedAt: new Date().toISOString(),
      model: MODEL,
      scorecardId: school.scorecardId,
      category: school.category,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  };
}

// ==========================================
// MAIN
// ==========================================

async function run() {
  console.log('===========================================');
  console.log('  Wayfinder Strategic Intel Generator');
  console.log(`  Model: ${MODEL}`);
  console.log(`  Batch size: ${batchSize} | Start index: ${startIdx}`);
  console.log('===========================================\n');

  // Load expanded scorecard data
  const scorecardPath = join(__dirname, '..', 'data', 'scraped', 'college-admissions-expanded.json');
  let scorecardData;
  try {
    scorecardData = JSON.parse(await fs.readFile(scorecardPath, 'utf-8'));
  } catch {
    console.error('ERROR: Run expanded-admissions-scraper.js first to generate scorecard data.');
    process.exit(1);
  }

  // Load existing strategic intel (for resume support)
  const outputPath = join(__dirname, '..', 'data', 'scraped', 'strategic-intel-expanded.json');
  let existingIntel = {};
  try {
    const existing = JSON.parse(await fs.readFile(outputPath, 'utf-8'));
    for (const intel of existing.strategicIntel || []) {
      existingIntel[intel.school] = intel;
    }
    console.log(`  Found ${Object.keys(existingIntel).length} existing intel records.\n`);
  } catch { /* fresh start */ }

  // Filter to schools that need intel
  const schoolsNeedingIntel = scorecardData.schools.filter(s =>
    !s.hasV1StrategicIntel && !existingIntel[s.name]
  );

  console.log(`  Schools needing new strategic intel: ${schoolsNeedingIntel.length}`);
  console.log(`  Processing batch: ${startIdx} to ${startIdx + batchSize}\n`);

  const batch = schoolsNeedingIntel.slice(startIdx, startIdx + batchSize);
  const results = Object.values(existingIntel); // Keep existing
  let generated = 0;
  let failed = 0;
  let totalTokens = 0;

  for (const school of batch) {
    try {
      console.log(`  [${generated + 1}/${batch.length}] Generating intel for ${school.name}...`);
      const intel = await generateIntel(school);
      results.push(intel);
      generated++;
      totalTokens += (intel._meta.inputTokens + intel._meta.outputTokens);
      console.log(`    ✓ Done (${intel._meta.outputTokens} tokens)`);

      // Save after every 5 schools (crash protection)
      if (generated % 5 === 0) {
        await saveOutput(results, outputPath);
        console.log(`    [Checkpoint saved: ${results.length} total records]`);
      }

      await sleep(500); // Rate limiting
    } catch (err) {
      failed++;
      console.log(`    ✗ Failed: ${school.name} — ${err.message}`);
      await sleep(1000);
    }
  }

  // Final save
  await saveOutput(results, outputPath);

  console.log('\n===========================================');
  console.log('  GENERATION COMPLETE');
  console.log(`  Generated: ${generated}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total intel records: ${results.length}`);
  console.log(`  Total tokens used: ${totalTokens.toLocaleString()}`);
  console.log(`  Est. cost (Sonnet): ~$${(totalTokens * 0.000015).toFixed(2)}`);
  console.log(`  Est. cost (Opus):   ~$${(totalTokens * 0.000075).toFixed(2)}`);
  if (startIdx + batchSize < schoolsNeedingIntel.length) {
    console.log(`\n  Next batch: --start=${startIdx + batchSize}`);
  }
  console.log('===========================================');
}

async function saveOutput(results, outputPath) {
  const output = {
    metadata: {
      lastUpdated: new Date().toISOString(),
      totalRecords: results.length,
      model: MODEL,
    },
    strategicIntel: results.sort((a, b) => a.school.localeCompare(b.school)),
  };
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
}

run().catch(console.error);
