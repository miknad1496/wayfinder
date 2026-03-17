/**
 * Essay Reviewer Service
 *
 * Uses Claude to provide structured, admissions-focused essay feedback.
 * Each review costs 1 essay credit (purchased via Stripe add-on).
 */

import Anthropic from '@anthropic-ai/sdk';

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

const SYSTEM_PROMPT = `You are an expert college admissions essay reviewer with 15+ years of experience at top universities. You've read thousands of successful essays and understand what admissions committees look for.

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
 * Review an essay using Claude.
 * @param {string} essayText - The essay content
 * @param {string} essayType - Type key from ESSAY_TYPES
 * @param {string} targetSchool - Optional school name for context
 * @param {string} prompt - Optional additional prompt/context from user
 * @returns {object} Structured review result
 */
export async function reviewEssay(essayText, essayType = 'other', targetSchool = null, prompt = null) {
  const typeName = ESSAY_TYPES[essayType] || ESSAY_TYPES.other;

  let userPrompt = `Please review this ${typeName}`;
  if (targetSchool) {
    userPrompt += ` (targeted at ${targetSchool})`;
  }
  if (prompt) {
    userPrompt += `.\n\nAdditional context from the student: ${prompt}`;
  }
  userPrompt += `\n\n--- ESSAY ---\n${essayText}\n--- END ESSAY ---`;

  try {
    const response = await client.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
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
