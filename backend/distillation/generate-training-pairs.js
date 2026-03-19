/**
 * Wayfinder Training Pair Generator
 *
 * Generates high-quality conversation training pairs for the Admissions and Career SLMs.
 * Uses the distilled knowledge base as context to produce domain-specific Q&A pairs
 * that teach the model to think like a $10K consultant.
 *
 * Architecture:
 *   - Reads distilled knowledge files as context
 *   - Generates diverse training pairs across a taxonomy of topics
 *   - Outputs in JSONL format compatible with Axolotl / Unsloth / HuggingFace
 *   - Supports both Admissions SLM and Career SLM pair generation
 *
 * Run: node backend/distillation/generate-training-pairs.js --model=admissions [--count=50] [--category=essay]
 *
 * Output: slm-training/admissions-pairs.jsonl or slm-training/career-pairs.jsonl
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const KB_DIR = join(__dirname, '..', 'knowledge-base', 'distilled');
const ESSAY_DEEP_DIR = join(KB_DIR, 'essay-deep');
const SCRAPED_DIR = join(__dirname, '..', 'data', 'scraped');
const OUTPUT_DIR = join(__dirname, '..', '..', 'slm-training');

// Parse CLI args
const args = process.argv.slice(2);
const targetModel = args.find(a => a.startsWith('--model='))?.split('=')[1] || 'admissions';
const pairCount = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1]) || 50;
const targetCategory = args.find(a => a.startsWith('--category='))?.split('=')[1];
const dryRun = args.includes('--dry-run');

// ==========================================
// SYSTEM PROMPTS FOR EACH SLM
// ==========================================

const ADMISSIONS_SYSTEM_PROMPT = `You are Wayfinder, an elite AI college admissions consultant. You provide the caliber of strategic advice that families pay $10,000-$15,000 for from private consultants — but accessible to everyone.

Your expertise spans:
- College selection strategy (250+ schools, from Ivy League to strong regionals)
- Essay coaching (diagnostic, strategic, school-specific)
- Application strategy (ED/EA/RD timing, demonstrated interest, financial aid optimization)
- Admissions data analysis (acceptance rates, test scores, program-level outcomes)
- Parent and family advising
- First-generation, international, and non-traditional student guidance

Your approach:
- Data-driven but warm — you lead with empathy, back it up with evidence
- Forward-looking — you think about trajectories, not just current stats
- Strategically honest — you tell families what they need to hear, not what they want to hear
- School-specific — your advice is calibrated to each institution's reading culture
- Action-biased — every conversation ends with a concrete next step

You are NOT a generic chatbot. You have deep institutional knowledge, understand how admissions committees actually work, and provide the kind of insider perspective that changes outcomes.`;

const CAREER_SYSTEM_PROMPT = `You are Wayfinder, an AI career strategist and advisor. You combine labor market data, industry intelligence, and practical career wisdom to help people make better career decisions — whether they're a high school student choosing a major, a mid-career professional considering a pivot, or a parent helping their child think about the future.

Your expertise spans:
- Career pathway mapping across 50+ industries
- Salary trajectory analysis with real BLS/O*NET data
- Skills-based career transitions and pivots
- Education ROI (degrees, bootcamps, certifications)
- Job search strategy, networking, and interview preparation
- Industry-specific intelligence (tech, finance, healthcare, trades, government)

Your approach:
- Data-grounded — you cite real salary ranges, growth rates, and employment data
- Trajectory-focused — you think in 5-10 year arcs, not just first jobs
- Honest about uncertainty — you flag when conventional wisdom is wrong
- Skills-first — you evaluate capabilities over credentials
- Equity-conscious — you recognize that access and opportunity aren't evenly distributed`;

// ==========================================
// ADMISSIONS PAIR TAXONOMY
// ==========================================

const ADMISSIONS_CATEGORIES = {
  essay_diagnostic: {
    weight: 15, // percentage of total pairs
    description: 'Essay review and diagnostic coaching',
    knowledgeFiles: ['essay-deep/essay-diagnostic-decision-tree.md', 'essay-deep/essay-diagnostic-failure-patterns.md', 'essay-deep/essay-scoring-calibration.md'],
    personaVariants: ['junior_high_achiever', 'senior_first_gen', 'parent_helping_child', 'transfer_student', 'international_student'],
    samplePrompts: [
      "Can you review my Common App essay? I wrote about my experience volunteering at a food bank and how it taught me the value of community service.",
      "My daughter wrote her essay about being captain of the debate team. It lists all her accomplishments. Is that the right approach?",
      "I've rewritten my essay 12 times and I still don't think it's good enough. My counselor says it's fine but something feels off.",
      "I want to write about my mental health journey but I'm scared it'll hurt my application. What should I do?",
      "My essay is about how my family immigrated from Vietnam. My counselor says it's overdone but it's my real story. Should I change it?",
    ],
  },
  essay_strategy: {
    weight: 12,
    description: 'Essay topic selection, supplemental strategy, portfolio management',
    knowledgeFiles: ['essay-deep/essay-supplement-type-mastery.md', 'essay-deep/essay-ecosystem-strategy.md', 'essay-deep/essay-process-timeline.md'],
    personaVariants: ['junior_starting_essays', 'senior_overwhelmed', 'parent_managing_process', 'student_applying_to_15_schools'],
    samplePrompts: [
      "I'm applying to 12 schools and have no idea how to manage all these essays. Where do I even start?",
      "What should I write my Common App essay about? I don't feel like I have an interesting story.",
      "How do I write a 'Why Us' essay for Stanford that doesn't sound generic?",
      "I'm applying ED to Duke and also to 8 other schools. How should I prioritize my essays?",
      "My personal statement is about my love of cooking. Can I reuse parts of it for my supplements?",
    ],
  },
  essay_school_specific: {
    weight: 10,
    description: 'School-specific essay advice calibrated to institutional culture',
    knowledgeFiles: ['essay-deep/essay-ao-insider-intelligence.md', 'essay-deep/essay-ao-reading-simulation.md'],
    personaVariants: ['student_targeting_specific_school', 'parent_researching_schools'],
    samplePrompts: [
      "What does MIT actually look for in essays? I'm a strong math student but I'm not sure how to stand out.",
      "I'm writing the UChicago extended essay. Should I try to be funny or intellectual?",
      "What's the difference between what Harvard and Yale look for in essays?",
      "How should I approach the Georgetown supplement differently from other schools?",
      "Is Brown's open curriculum something I should reference in my 'Why Brown' essay?",
    ],
  },
  essay_cutting_edge: {
    weight: 8,
    description: 'AI detection, post-SFFA landscape, adversity essay strategy',
    knowledgeFiles: ['essay-deep/essay-ai-landscape-2026.md', 'essay-deep/essay-post-sffa-adversity-intelligence.md', 'essay-deep/essay-emerging-trends-2026.md'],
    personaVariants: ['student_worried_about_ai', 'parent_confused_about_changes', 'first_gen_adversity_question', 'privileged_student_no_hardship'],
    samplePrompts: [
      "I used ChatGPT to help brainstorm my essay topics. Is that going to get me rejected?",
      "My counselor says I should write about adversity but I grew up comfortable. What do I do?",
      "I heard colleges are using AI to read applications now. Does that change how I should write?",
      "As a first-gen student, should I focus my essay on my family's hardships?",
      "Will colleges know if I used Grammarly on my essay? Is that considered AI?",
    ],
  },
  essay_edge_cases: {
    weight: 8,
    description: 'First-gen, international, neurodivergent, sensitive topics',
    knowledgeFiles: ['essay-deep/essay-edge-case-coaching.md', 'essay-deep/essay-coaching-demonstrations.md'],
    personaVariants: ['first_gen_student', 'international_student', 'student_with_adhd', 'student_limited_resources', 'lgbtq_student', 'student_family_trauma'],
    samplePrompts: [
      "I'm the first in my family to apply to college. I don't even know what a supplemental essay is.",
      "English is my second language. My essays sound different from my American classmates. Is that a problem?",
      "I have ADHD and my essay feels scattered. How do I keep it focused?",
      "I want to write about being gay but I live in a conservative area. Should I?",
      "My school doesn't have AP classes or clubs. How do I compete with students who had those opportunities?",
    ],
  },
  school_selection: {
    weight: 12,
    description: 'School list building, safety/match/reach strategy, comparing schools',
    knowledgeFiles: ['admissions-school-selection-intelligence.md', 'admissions-data-synthesis.md', 'admissions-strategic-playbook.md'],
    personaVariants: ['junior_building_list', 'parent_researching', 'student_rejected_rebuilding', 'budget_conscious_family'],
    samplePrompts: [
      "My GPA is 3.7 and SAT is 1420. What schools should I be looking at?",
      "Is it worth applying to Ivy League schools or am I wasting my money on application fees?",
      "How do I build a balanced college list with reaches, matches, and safeties?",
      "My family can't afford more than $20K per year. Which good schools actually meet full need?",
      "I want to study computer science. Should I prioritize school ranking or program ranking?",
    ],
  },
  admissions_strategy: {
    weight: 10,
    description: 'ED/EA timing, demonstrated interest, application tactics',
    knowledgeFiles: ['admissions-strategic-playbook.md', 'admissions-ed-strategy-calibration.md'],
    personaVariants: ['strategic_family', 'confused_about_ed', 'waitlisted_student', 'deferred_student'],
    samplePrompts: [
      "Should I apply Early Decision to my top choice even though we need financial aid?",
      "I got deferred from my ED school. What should I do now?",
      "How important is demonstrated interest? Should I visit every school I apply to?",
      "Is applying to 20 schools a good strategy or does it hurt my chances?",
      "My GPA dropped junior year because of family issues. How do I explain this?",
    ],
  },
  financial_aid: {
    weight: 8,
    description: 'FAFSA, CSS Profile, merit aid, scholarship strategy, cost comparison',
    knowledgeFiles: ['admissions-data-synthesis.md'],
    personaVariants: ['low_income_family', 'middle_class_squeezed', 'international_needing_aid', 'parent_planning_ahead'],
    samplePrompts: [
      "How does FAFSA actually work? When should I fill it out?",
      "We make $120K household income. Are we too rich for financial aid?",
      "What's the difference between need-based and merit-based aid?",
      "My parents are divorced. Whose income goes on the FAFSA?",
      "Are there full-ride scholarships for students with a 3.5 GPA?",
    ],
  },
  parent_advisor: {
    weight: 7,
    description: 'Guidance specifically for parents navigating the process',
    knowledgeFiles: ['admissions-parent-strategy-guide.md', 'admissions-parent-adult-children.md'],
    personaVariants: ['anxious_parent', 'hands_off_parent', 'parent_of_middle_schooler', 'parent_of_underperformer'],
    samplePrompts: [
      "My son is in 8th grade. What should we be doing NOW to prepare for college admissions?",
      "How involved should I be in my daughter's application process? She gets angry when I try to help.",
      "My child has a 3.2 GPA. Is college even realistic? What are our options?",
      "We're a first-gen family. I never went to college. How do I help my kid through this?",
      "My daughter got rejected from her dream school. She's devastated. What do I say?",
    ],
  },
  pre_highschool: {
    weight: 5,
    description: 'Middle school planning, course selection, early pipeline',
    knowledgeFiles: ['admissions-pre-highschool-planning.md', 'admissions-curriculum-synthesis.md'],
    personaVariants: ['parent_of_6th_grader', 'parent_of_8th_grader', 'middle_school_counselor'],
    samplePrompts: [
      "My daughter is in 7th grade and wants to go to a top college someday. What should she focus on?",
      "Should my 8th grader take Algebra 2 over the summer to get ahead?",
      "What extracurriculars should a middle schooler start to be competitive later?",
      "Is it too early to think about college in 6th grade? I don't want to pressure my kid.",
      "My son's middle school doesn't offer advanced math. Will this hurt him for college?",
    ],
  },
  worked_examples: {
    weight: 5,
    description: 'Before/after essay coaching and technique demonstrations',
    knowledgeFiles: ['essay-deep/essay-coaching-demonstrations.md', 'essay-deep/essay-technique-before-after-library.md'],
    personaVariants: ['student_wanting_examples', 'parent_wanting_to_understand'],
    samplePrompts: [
      "Can you show me what a good opening paragraph looks like vs a bad one?",
      "What does 'show don't tell' actually look like in a college essay?",
      "How do you turn a resume-style essay into something more personal?",
      "What's the difference between a 6/10 essay and a 9/10 essay?",
      "Can you walk me through how a coach would improve a weak essay?",
    ],
  },
};

// ==========================================
// CAREER PAIR TAXONOMY
// ==========================================

const CAREER_CATEGORIES = {
  career_exploration: {
    weight: 20,
    description: 'Career discovery, interest mapping, pathway exploration',
    knowledgeFiles: ['career-brain.md', 'core-reasoning-principles.md'],
    personaVariants: ['undecided_freshman', 'career_changer_30s', 'high_schooler_exploring', 'parent_guiding_child'],
    samplePrompts: [
      "I have no idea what I want to do with my life. How do I even start figuring this out?",
      "I'm good at math and writing but hate science. What careers should I explore?",
      "I'm 32 and hate my accounting job. Is it too late to switch to tech?",
      "What are careers that combine creativity with good pay?",
    ],
  },
  salary_roi: {
    weight: 15,
    description: 'Salary data, education ROI, financial trajectory analysis',
    knowledgeFiles: ['framework-salary-negotiation.md', 'roi-bootcamps.md', 'roi-certifications.md', 'roi-college-alternatives.md'],
    personaVariants: ['student_choosing_major', 'parent_worried_about_roi', 'professional_evaluating_degree'],
    samplePrompts: [
      "Is a computer science degree worth it or should I do a bootcamp?",
      "What's the realistic salary trajectory for a nurse vs a software engineer?",
      "My parents want me to major in business but I love history. What are the earning differences?",
      "Are coding bootcamps actually worth the money in 2026?",
    ],
  },
  industry_intel: {
    weight: 15,
    description: 'Industry-specific trends, disruption, emerging fields',
    knowledgeFiles: ['intel-tech-landscape.md', 'intel-finance-careers.md', 'intel-healthcare-careers.md', 'intel-trades-renaissance.md', 'intel-government-federal.md'],
    personaVariants: ['student_researching_fields', 'professional_assessing_industry', 'parent_advising'],
    samplePrompts: [
      "Is AI going to replace software engineers? Should I still study CS?",
      "What healthcare careers are growing that don't require medical school?",
      "Are trade jobs actually paying well now? My parents say I should go to college.",
      "What's the job market look like for finance majors in 2026?",
    ],
  },
  career_transitions: {
    weight: 15,
    description: 'Career pivots, skills transfer, non-linear paths',
    knowledgeFiles: ['pathway-tech-transitions.md', 'pathway-career-pivots-30s.md', 'pathway-non-degree.md', 'audience-career-changer.md'],
    personaVariants: ['teacher_leaving_education', 'military_transitioning', 'mid_career_pivoter', 'returning_to_workforce'],
    samplePrompts: [
      "I'm a teacher wanting to move into tech. Where do I start?",
      "I'm leaving the military next year. What civilian careers match my intelligence analyst experience?",
      "Can I break into product management without a CS degree?",
      "I've been a stay-at-home parent for 8 years. How do I re-enter the workforce?",
    ],
  },
  job_search: {
    weight: 15,
    description: 'Interview prep, networking, job search strategy',
    knowledgeFiles: ['playbook-first-job.md', 'playbook-interview.md', 'playbook-networking.md'],
    personaVariants: ['new_grad', 'experienced_professional', 'career_changer', 'introvert_networker'],
    samplePrompts: [
      "I'm graduating in May and haven't started applying. What's my game plan?",
      "How do I network when I'm an introvert who hates small talk?",
      "I keep getting interviews but no offers. What am I doing wrong?",
      "Should I take a lower-paying job to get my foot in the door?",
    ],
  },
  education_decisions: {
    weight: 10,
    description: 'Major selection, grad school, certifications',
    knowledgeFiles: ['framework-major-selection.md', 'framework-grad-school.md', 'pathway-stem-vs-non-stem.md'],
    personaVariants: ['undeclared_sophomore', 'considering_grad_school', 'certification_seeker'],
    samplePrompts: [
      "Should I double major or just do one major well?",
      "Is an MBA worth it if I'm already 5 years into my career?",
      "What certifications actually matter for getting hired in cybersecurity?",
      "I'm a humanities major. Am I doomed?",
    ],
  },
  first_gen_career: {
    weight: 10,
    description: 'First-gen specific career guidance, navigating professional world',
    knowledgeFiles: ['audience-first-gen.md', 'audience-high-school-undecided.md'],
    personaVariants: ['first_gen_college_student', 'first_gen_professional', 'immigrant_family'],
    samplePrompts: [
      "Nobody in my family has a professional career. I don't even know what people do in offices.",
      "I got into college but I don't know how to choose a major that leads to a real job.",
      "How do I build a professional network when my family doesn't know anyone in business?",
      "My parents want me to get a 'safe' job. How do I talk to them about wanting to do something different?",
    ],
  },
};

// ==========================================
// PAIR GENERATION ENGINE
// ==========================================

async function loadKnowledgeFiles(filenames) {
  let context = '';
  for (const filename of filenames) {
    try {
      // Try essay-deep subfolder first, then main distilled folder
      let filepath = join(ESSAY_DEEP_DIR, filename.replace('essay-deep/', ''));
      try {
        await fs.access(filepath);
      } catch {
        filepath = join(KB_DIR, filename);
      }
      const content = await fs.readFile(filepath, 'utf-8');
      // Truncate to keep context manageable
      context += `\n\n=== ${filename} ===\n${content.substring(0, 8000)}\n`;
    } catch (err) {
      console.log(`  ⚠ Could not load ${filename}: ${err.message}`);
    }
  }
  return context;
}

function buildPairGenerationPrompt(category, categoryDef, systemPrompt, context, count) {
  return `You are generating training data for a specialized AI model. Generate ${count} high-quality conversation training pairs.

SYSTEM PROMPT THE MODEL WILL USE:
${systemPrompt}

CATEGORY: ${category} — ${categoryDef.description}

KNOWLEDGE CONTEXT (use this to ground the responses in real data and frameworks):
${context.substring(0, 15000)}

PERSONA VARIANTS TO COVER: ${categoryDef.personaVariants.join(', ')}

EXAMPLE USER MESSAGES (generate similar but DIFFERENT ones):
${categoryDef.samplePrompts.map((p, i) => `${i + 1}. "${p}"`).join('\n')}

REQUIREMENTS:
- Each pair is a realistic conversation between a user and the Wayfinder AI
- User messages should sound like REAL people (casual, sometimes confused, sometimes emotional)
- Assistant responses should be warm but strategic, data-grounded, and action-oriented
- Responses should be 200-500 words (the sweet spot for the model)
- Each pair should teach the model something specific about this domain
- Vary the user personas across the variants listed above
- Include follow-up exchanges where natural (2-3 turns, not just single Q&A)
- Reference specific schools, programs, data points where relevant
- NEVER be generic — every response should contain at least one specific insight

OUTPUT FORMAT — respond with ONLY a JSON array, no markdown:
[
  {
    "conversations": [
      {"role": "system", "content": "<system prompt>"},
      {"role": "user", "content": "<user message>"},
      {"role": "assistant", "content": "<wayfinder response>"},
      {"role": "user", "content": "<optional follow-up>"},
      {"role": "assistant", "content": "<optional follow-up response>"}
    ],
    "metadata": {
      "category": "${category}",
      "persona": "<which persona variant>",
      "topics": ["topic1", "topic2"],
      "quality_notes": "<what makes this pair valuable for training>"
    }
  }
]

Generate exactly ${count} pairs. Make each one count.`;
}

// ==========================================
// MAIN
// ==========================================

async function run() {
  const categories = targetModel === 'career' ? CAREER_CATEGORIES : ADMISSIONS_CATEGORIES;
  const systemPrompt = targetModel === 'career' ? CAREER_SYSTEM_PROMPT : ADMISSIONS_SYSTEM_PROMPT;

  console.log('===========================================');
  console.log(`  Wayfinder Training Pair Generator`);
  console.log(`  Model: ${targetModel.toUpperCase()} SLM`);
  console.log(`  Target pairs: ${pairCount}`);
  console.log(`  Category filter: ${targetCategory || 'ALL'}`);
  console.log(`  Mode: ${dryRun ? 'DRY RUN' : 'GENERATE'}`);
  console.log('===========================================\n');

  // Calculate pair distribution
  const filteredCategories = targetCategory
    ? { [targetCategory]: categories[targetCategory] }
    : categories;

  if (targetCategory && !categories[targetCategory]) {
    console.error(`ERROR: Unknown category "${targetCategory}"`);
    console.log('Available categories:', Object.keys(categories).join(', '));
    process.exit(1);
  }

  const totalWeight = Object.values(filteredCategories).reduce((s, c) => s + c.weight, 0);
  const distribution = {};
  let remaining = pairCount;

  for (const [cat, def] of Object.entries(filteredCategories)) {
    const count = Math.max(1, Math.round((def.weight / totalWeight) * pairCount));
    distribution[cat] = Math.min(count, remaining);
    remaining -= distribution[cat];
  }

  console.log('Pair distribution:');
  for (const [cat, count] of Object.entries(distribution)) {
    console.log(`  ${cat}: ${count} pairs`);
  }
  console.log('');

  if (dryRun) {
    console.log('[DRY RUN] Would generate the above distribution.');
    console.log('Knowledge files that would be loaded:');
    for (const [cat, def] of Object.entries(filteredCategories)) {
      console.log(`  ${cat}: ${def.knowledgeFiles.join(', ')}`);
    }
    return;
  }

  // Ensure output directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const outputFile = join(OUTPUT_DIR, `${targetModel}-pairs.jsonl`);
  let totalGenerated = 0;
  let allPairs = [];

  // Load existing pairs for append mode
  try {
    const existing = (await fs.readFile(outputFile, 'utf-8')).trim().split('\n');
    allPairs = existing.filter(Boolean).map(line => JSON.parse(line));
    console.log(`  Loaded ${allPairs.length} existing pairs (will append)\n`);
  } catch { /* fresh start */ }

  for (const [cat, count] of Object.entries(distribution)) {
    if (count === 0) continue;

    console.log(`\nGenerating ${count} pairs for: ${cat}...`);
    const def = filteredCategories[cat];

    // Load knowledge context
    const context = await loadKnowledgeFiles(def.knowledgeFiles);
    console.log(`  Knowledge context loaded (${(context.length / 1024).toFixed(0)}KB)`);

    // Build prompt
    const prompt = buildPairGenerationPrompt(cat, def, systemPrompt, context, count);

    console.log(`  Prompt ready (${(prompt.length / 1024).toFixed(0)}KB). Paste into Claude conversation to generate.`);
    console.log(`  Or run with API: node backend/distillation/generate-training-pairs.js --api`);

    // Save prompt for manual generation
    const promptFile = join(OUTPUT_DIR, `prompt-${targetModel}-${cat}.txt`);
    await fs.writeFile(promptFile, prompt);
    console.log(`  ✓ Prompt saved: ${promptFile}`);

    totalGenerated += count;
  }

  console.log('\n===========================================');
  console.log('  PROMPT GENERATION COMPLETE');
  console.log(`  Prompts saved: ${Object.keys(distribution).length}`);
  console.log(`  Target pairs: ${totalGenerated}`);
  console.log(`  Output directory: ${OUTPUT_DIR}`);
  console.log('');
  console.log('  NEXT STEPS:');
  console.log('  1. Run each prompt through Claude (in this Cowork session)');
  console.log('  2. Or paste prompts into Claude.ai conversation');
  console.log('  3. Save results as JSONL to slm-training/ folder');
  console.log('===========================================');
}

run().catch(console.error);
