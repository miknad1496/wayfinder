/**
 * Essay Reviewer Service
 *
 * Uses Claude to provide structured, admissions-focused essay feedback powered by
 * Wayfinder's essay coaching methodology and deep admissions intelligence.
 *
 * Each review costs 1 essay credit (purchased via Stripe add-on).
 *
 * KNOWLEDGE INJECTION SYSTEM:
 * - Loads essay brain files at startup and caches them
 * - Selects relevant knowledge based on essay type and target school
 * - Injects up to 4000 tokens of contextual coaching philosophy
 * - Dramatically upgrades reviewer instructions to reflect Wayfinder methodology
 */

import Anthropic from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Anthropic();

const ESSAY_TYPES = {
  'common-app': 'Common Application Personal Statement',
  'supplemental': 'Supplemental Essay',
  'why-school': '"Why This School" Essay',
  'diversity': 'Diversity / Identity Essay',
  'activity': 'Extracurricular / Activity Essay',
  'community': 'Community / Service Essay',
  'challenge': 'Challenge / Setback Essay',
  'other': 'General College Essay'
};

// Knowledge cache structure
let essayBrainCache = {
  loaded: false,
  'essay-brain': null,
  'voice-authenticity': null,
  'structural-architecture': null,
  'revision-methodology': null,
  'differentiation': null,
  'school-specific': null
};

/**
 * Load essay brain knowledge files at startup and cache them
 */
async function loadEssayBrainKnowledge() {
  if (essayBrainCache.loaded) {
    return essayBrainCache;
  }

  try {
    const knowledgeBasePath = join(__dirname, '..', 'knowledge-base', 'distilled');

    // Map of cache keys to file names
    const files = {
      'essay-brain': 'admissions-essay-intelligence.md',
      'voice-authenticity': 'essay-voice-authenticity-intelligence.md',
      'structural-architecture': 'essay-structural-architecture.md',
      'revision-methodology': 'essay-revision-methodology.md',
      'differentiation': 'essay-differentiation-intelligence.md',
      'school-specific': 'essay-school-specific-decoding.md'
    };

    for (const [key, filename] of Object.entries(files)) {
      const filepath = join(knowledgeBasePath, filename);
      try {
        const content = await fs.readFile(filepath, 'utf-8');
        essayBrainCache[key] = content;
      } catch (err) {
        console.warn(`[EssayReviewer] Could not load ${filename}:`, err.message);
        essayBrainCache[key] = null;
      }
    }

    essayBrainCache.loaded = true;
  } catch (err) {
    console.error('[EssayReviewer] Error loading essay brain:', err.message);
  }

  return essayBrainCache;
}

/**
 * Extract relevant sections from an essay brain file based on search terms
 * Returns up to maxTokens worth of content (rough estimate: 4 chars ≈ 1 token)
 */
function extractRelevantSections(content, searchTerms, maxTokens = 1000) {
  if (!content) return '';

  const maxChars = maxTokens * 4;
  const lines = content.split('\n');
  const relevant = [];
  let totalChars = 0;

  // Weighted section extraction
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line matches search terms (case-insensitive)
    const matchesSearch = searchTerms.some(term =>
      line.toLowerCase().includes(term.toLowerCase())
    );

    // Include headers and matching content
    const isHeader = line.startsWith('#');
    if ((matchesSearch || isHeader) && totalChars < maxChars) {
      relevant.push(line);
      totalChars += line.length + 1;
    }
  }

  return relevant.join('\n').substring(0, maxChars);
}

/**
 * Build knowledge injection based on essay type and target school
 * Returns formatted knowledge context (under 4000 tokens)
 */
function buildKnowledgeInjection(essayType, targetSchool, knowledgeCache) {
  let injection = '';
  let tokenCount = 0;
  const maxTokens = 4000;

  // ALWAYS inject: Core essay philosophy from main brain file
  if (knowledgeCache['essay-brain']) {
    const corePhilosophy = extractRelevantSections(
      knowledgeCache['essay-brain'],
      ['scoring', 'what gets flagged', 'red flags', 'green flags', 'authenticity'],
      1200
    );
    if (corePhilosophy) {
      injection += '## WAYFINDER ESSAY PHILOSOPHY\n' + corePhilosophy + '\n\n';
      tokenCount += Math.ceil(corePhilosophy.length / 4);
    }
  }

  // ALWAYS inject: Revision methodology (how to give feedback)
  if (knowledgeCache['revision-methodology'] && tokenCount < maxTokens - 500) {
    const methodology = extractRelevantSections(
      knowledgeCache['revision-methodology'],
      ['coaching', 'not editing', 'questions not directives', '4-pass'],
      800
    );
    if (methodology) {
      injection += '## COACHING METHODOLOGY (Not Editing)\n' + methodology + '\n\n';
      tokenCount += Math.ceil(methodology.length / 4);
    }
  }

  // ALWAYS inject: Voice authenticity markers
  if (knowledgeCache['voice-authenticity'] && tokenCount < maxTokens - 400) {
    const voiceGuidance = extractRelevantSections(
      knowledgeCache['voice-authenticity'],
      ['authentic voice', 'markers', 'contractions', 'uncertainty', 'specific vocabulary'],
      600
    );
    if (voiceGuidance) {
      injection += '## AUTHENTIC VOICE MARKERS\n' + voiceGuidance + '\n\n';
      tokenCount += Math.ceil(voiceGuidance.length / 4);
    }
  }

  // ALWAYS inject: Structural architecture guidance
  if (knowledgeCache['structural-architecture'] && tokenCount < maxTokens - 400) {
    const structure = extractRelevantSections(
      knowledgeCache['structural-architecture'],
      ['constraint', 'opening', 'hook', 'structure', 'paragraph'],
      600
    );
    if (structure) {
      injection += '## STRUCTURAL ARCHITECTURE\n' + structure + '\n\n';
      tokenCount += Math.ceil(structure.length / 4);
    }
  }

  // CONDITIONAL: School-specific decoding if "why-school" essay and target school provided
  if (essayType === 'why-school' && targetSchool && knowledgeCache['school-specific'] && tokenCount < maxTokens - 400) {
    const schoolDecode = extractRelevantSections(
      knowledgeCache['school-specific'],
      [targetSchool.toLowerCase(), targetSchool],
      800
    );
    if (schoolDecode.length > 100) {
      injection += `## SCHOOL-SPECIFIC GUIDANCE: ${targetSchool}\n` + schoolDecode + '\n\n';
      tokenCount += Math.ceil(schoolDecode.length / 4);
    }
  }

  // CONDITIONAL: Differentiation intelligence for strong essays
  if (knowledgeCache['differentiation'] && tokenCount < maxTokens - 300) {
    const diff = extractRelevantSections(
      knowledgeCache['differentiation'],
      ['unforgettable', 'tier', 'forgettable', 'excellent', 'spectrum'],
      400
    );
    if (diff) {
      injection += '## WHAT MAKES ESSAYS UNFORGETTABLE\n' + diff + '\n\n';
      tokenCount += Math.ceil(diff.length / 4);
    }
  }

  return injection;
}

/**
 * Build the enhanced system prompt with Wayfinder coaching methodology
 */
function buildEnhancedSystemPrompt(knowledgeInjection) {
  const basePrompt = `You are a Wayfinder essay coach—not a traditional admissions consultant, but a guide who helps students discover and articulate their own deepest thinking.

Your role is NOT to edit, rewrite, or judge. Your role is to:
1. IDENTIFY THE STRONGEST MOMENT — Find what's genuinely compelling and build coaching feedback around it
2. ASK COACHING QUESTIONS — Never say "be more specific" without pointing to WHERE it needs specificity
3. HONOR STUDENT VOICE — Challenge vague thinking while protecting authentic expression
4. REVEAL UNEXAMINED ASSUMPTIONS — Help students see their own stories more clearly
5. FOCUS ON AUTHENTICITY — This essay will be discussed in interviews; does it sound like THIS STUDENT?

ANTI-PATTERNS TO AVOID IN YOUR FEEDBACK:
- Never provide generic feedback that could apply to anyone
- Never tell a student "I want more detail" without citing the specific phrase
- Never shame or critique tone — instead note what the tone reveals
- Never confuse "different from what I would write" with "weak writing"
- Never reduce complex thinking to simplistic lessons

YOUR SCORING REFLECTS ADMISSIONS REALITY:
- 1-3: Needs significant work (unclear central moment, generic insights, voice sounds inauthentic)
- 4-5: Fair (has potential but surface-level reflection or weak opening that buries the real story)
- 6-7: Good (specific, authentic, clear voice — would read as solid in an application)
- 8-9: Strong (compelling specificity, genuine voice, shows real thinking — would stand out in a committee)
- 10: Exceptional (unforgettable — the essay the AO will discuss weeks later, rare)

CRITICAL COACHING PRINCIPLES:
- The fundamental question: "Does this essay reveal something REAL about who this person IS?"
- Red flags: Clichés, thesaurus abuse, essays that could be about anyone, humble-brags, obvious parent editing
- Green flags: Specific sensory details, authentic teenage voice, intellectual honesty, vulnerability about stakes
- Voice authenticity can be detected in first 100 words with 82% accuracy — listen for the student's actual thinking patterns
- If an essay is AI-generated, flag this prominently — admissions officers are trained to detect this

REVIEW STRUCTURE (you must follow this exact JSON format):

{
  "overallScore": <1-10 integer>,
  "scoreLabel": "<Needs Work | Fair | Good | Strong | Exceptional>",
  "summary": "<2-3 sentence coaching assessment—what's working, what needs development>",
  "strengths": [
    "<specific strength with brief quote or reference from essay>",
    "<specific strength with detail>",
    "<specific strength with detail>"
  ],
  "improvements": [
    {"area": "<specific area>", "suggestion": "<coaching question or specific observation that points to WHERE to develop>", "priority": "high|medium|low"},
    {"area": "<specific area>", "suggestion": "<coaching question or specific guidance>", "priority": "high|medium|low"},
    {"area": "<specific area>", "suggestion": "<coaching question or specific guidance>", "priority": "high|medium|low"}
  ],
  "lineNotes": [
    {"text": "<exact phrase from essay>", "note": "<specific coaching suggestion pointing to what this phrase reveals or where it needs development>"},
    {"text": "<exact phrase from essay>", "note": "<specific coaching suggestion>"}
  ],
  "voiceAssessment": {
    "authentic": <true|false>,
    "sounds_like_teenager": <true|false>,
    "notes": "<Does this sound like an actual student thinking and speaking, or like a performance? Note specific voice markers.>"
  },
  "structure": {
    "hasHook": <true|false>,
    "hasNarrative": <true|false>,
    "hasReflection": <true|false>,
    "notes": "<brief structural assessment—does the opening land immediately? Is there a clear turning point? Does reflection feel earned?>"
  },
  "wordCount": <number>,
  "readingLevel": "<approximate grade level>"
}

KNOWLEDGE-INFORMED COACHING:
The coaching feedback below is informed by deep research into what admissions officers actually respond to, authentic voice markers, structural architecture, and school-specific institutional philosophies. Use this knowledge to inform your feedback, but keep feedback rooted in THIS STUDENT'S essay.

---

${knowledgeInjection}

---

REMEMBER: You are not critiquing writing as an English teacher would. You are coaching a student toward their own deepest thinking, helping them make their authentic self visible to admissions officers. Every suggestion should point toward authenticity, specificity, and genuine intellectual engagement.

Always return valid JSON, nothing else.`;

  return basePrompt;
}

const BASE_SYSTEM_PROMPT = `You are an expert college admissions essay reviewer with 15+ years of experience at top universities. You've read thousands of successful essays and understand what admissions committees look for.

Your review should be thorough, constructive, and actionable. You are kind but honest — you don't sugarcoat, but you're never cruel. You understand that these are 16-18 year olds writing about their lives.

REVIEW STRUCTURE (you must follow this exact JSON format):

{
  "overallScore": <1-10 integer>,
  "scoreLabel": "<Needs Work | Fair | Good | Strong | Exceptional>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": [
    "<specific strength with quote from essay>",
    "<specific strength>",
    "<specific strength>"
  ],
  "improvements": [
    {"area": "<area name>", "suggestion": "<specific, actionable advice>", "priority": "high|medium|low"},
    {"area": "<area name>", "suggestion": "<specific, actionable advice>", "priority": "high|medium|low"},
    {"area": "<area name>", "suggestion": "<specific, actionable advice>", "priority": "high|medium|low"}
  ],
  "lineNotes": [
    {"text": "<quoted phrase from essay>", "note": "<specific suggestion>"},
    {"text": "<quoted phrase from essay>", "note": "<specific suggestion>"}
  ],
  "voiceAssessment": {
    "authentic": <true|false>,
    "sounds_like_teenager": <true|false>,
    "notes": "<brief assessment of voice/tone — does it sound genuine? Over-written? Too polished? Too casual?>"
  },
  "structure": {
    "hasHook": <true|false>,
    "hasNarrative": <true|false>,
    "hasReflection": <true|false>,
    "notes": "<brief structural assessment>"
  },
  "wordCount": <number>,
  "readingLevel": "<approximate grade level>"
}

SCORING GUIDE:
- 1-3: Needs significant work (unclear thesis, generic, doesn't reveal personality)
- 4-5: Fair (has potential but needs revision — weak opening, surface-level reflection)
- 6-7: Good (solid essay with clear voice, but could be more specific/memorable)
- 8-9: Strong (compelling, specific, authentic — would stand out positively)
- 10: Exceptional (unforgettable, perfectly crafted — rare)

CRITICAL RULES:
- Be specific — cite actual phrases from the essay
- Focus on what makes a college essay EFFECTIVE, not just grammatically correct
- The #1 question: "Does this essay reveal something meaningful about who this person IS?"
- Watch for red flags: clichés, thesaurus abuse, essays that could be about anyone, humble-brags
- If the essay is clearly AI-generated, note this prominently — admissions officers can tell
- Always return valid JSON, nothing else`;

/**
 * Review an essay using Claude with knowledge-injected coaching.
 * @param {string} essayText - The essay content
 * @param {string} essayType - Type key from ESSAY_TYPES
 * @param {string} targetSchool - Optional school name for context
 * @param {string} prompt - Optional additional prompt/context from user
 * @returns {object} Structured review result with {success, review, tokensUsed}
 */
export async function reviewEssay(essayText, essayType = 'other', targetSchool = null, prompt = null) {
  try {
    const typeName = ESSAY_TYPES[essayType] || ESSAY_TYPES.other;

    // Load essay brain knowledge
    const knowledgeCache = await loadEssayBrainKnowledge();

    // Build knowledge injection based on essay type and target school
    const knowledgeInjection = buildKnowledgeInjection(essayType, targetSchool, knowledgeCache);

    // Build enhanced system prompt with knowledge injection
    const systemPrompt = buildEnhancedSystemPrompt(knowledgeInjection);

    // Build user prompt
    let userPrompt = `Please review this ${typeName}`;
    if (targetSchool) {
      userPrompt += ` (targeted at ${targetSchool})`;
    }
    if (prompt) {
      userPrompt += `.\n\nAdditional context from the student: ${prompt}`;
    }
    userPrompt += `\n\n--- ESSAY ---\n${essayText}\n--- END ESSAY ---`;

    const response = await client.messages.create({
      model: process.env.CLAUDE_MODEL_ENGINE || process.env.CLAUDE_MODEL || 'claude-opus-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const text = response.content[0]?.text || '';

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const review = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        review,
        tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens || 0
      };
    }

    return { success: false, error: 'Failed to parse review response' };
  } catch (err) {
    console.error('[EssayReviewer] Error:', err.message);
    return { success: false, error: err.message };
  }
}

export function getEssayTypes() {
  return ESSAY_TYPES;
}
