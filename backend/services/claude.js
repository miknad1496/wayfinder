import Anthropic from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { retrieveContext, formatContext, getLiteBrainContext } from './knowledge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let client = null;
let systemPromptCache = null;

// ─── Structured Analysis Frameworks ──────────────────────────────
// When engine mode detects specific analysis patterns, these frameworks
// are injected to produce structured, data-rich outputs.

const ANALYSIS_FRAMEWORKS = {
  roi_academic: {
    signals: ['roi', 'return on investment', 'worth it', 'payoff', 'cost benefit', 'cost-benefit',
      'game plan', 'academic plan', 'investment', 'value of degree', 'is it worth'],
    prompt: `[ANALYSIS FRAMEWORK: ROI ON ACADEMIC GAME PLAN]
You are producing a structured ROI analysis. Format your response with these sections:

1. INVESTMENT SUMMARY: Total estimated cost (tuition × years + living + opportunity cost of not working)
2. EARNINGS TRAJECTORY: Year 1, Year 5, Year 10, Year 20 projected earnings based on major/school/field data
3. BREAKEVEN ANALYSIS: When does the investment pay for itself vs. entering workforce directly?
4. RISK-ADJUSTED ROI: Account for employment probability, industry stability, and geographic factors
5. ALTERNATIVE PATHS: Compare ROI against 2-3 alternative routes (community college → transfer, bootcamp, direct employment, trades)
6. FORWARD TRAJECTORY: Project 5-10 years ahead — will this field's ROI improve or compress based on pipeline dynamics?
7. VERDICT: Clear recommendation with confidence level (high/medium/low) and key assumptions

Use specific dollar amounts, percentages, and timeframes. Reference BLS median salaries, school-specific earnings data, and industry trends. Always account for student debt load in calculations.`
  },

  forward_compensation: {
    signals: ['future salary', 'future compensation', 'predict', 'projection', 'forecast',
      'years from now', 'when i graduate', 'by the time', 'compensation expectations',
      'future earnings', 'earning potential', 'what will i make', 'salary trajectory'],
    prompt: `[ANALYSIS FRAMEWORK: FORWARD COMPENSATION TRAJECTORY]
You are producing a time-adjusted compensation forecast. Format your response with these sections:

1. CURRENT STATE (Today): Median entry-level salary, typical compensation range (25th-75th percentile), geographic variance
2. GRADUATION TIMELINE: When will this student enter the workforce? (Factor in remaining education years)
3. PIPELINE DYNAMICS: How many students are currently pursuing this field? Is the pipeline growing, stable, or shrinking?
4. SUPPLY/DEMAND FORECAST: Project the job market at graduation time — will there be more or fewer openings? More or fewer qualified candidates?
5. COMPENSATION PROJECTION:
   - Year 0 (entry): projected range accounting for inflation + market conditions
   - Year 3: after building experience
   - Year 5: mid-career trajectory
   - Year 10: senior/management level
   - Year 20: peak earning potential
6. DISRUPTION FACTORS: AI automation risk, industry consolidation, regulatory changes, geographic shifts
7. COMPOUNDING SKILLS PREMIUM: Which skills within this field compound in value vs. commoditize?

Use specific BLS growth projections, known pipeline data, and structural trends. Always distinguish between today's numbers and forward projections. Flag uncertainty levels.`
  },

  perception_vs_reality: {
    signals: ['perception', 'reality', 'myth', 'actually', 'truth about', 'really like',
      'misconception', 'overrated', 'underrated', 'hype', 'bubble', 'everyone says',
      'people think', 'common belief', 'vs reality', 'versus reality'],
    prompt: `[ANALYSIS FRAMEWORK: PERCEPTION VS. FORWARD REALITY]
You are producing a perception-reality gap analysis. Format your response with these sections:

1. POPULAR PERCEPTION: What most people (students, parents, media) currently believe about this field/school/career path
2. CURRENT REALITY: What the data actually shows TODAY — use real numbers, not vibes
3. FORWARD REALITY (3-5 years): Where this is ACTUALLY heading based on structural trends, pipeline dynamics, and emerging signals
4. THE GAP: Where is the biggest disconnect between perception and reality? Quantify it where possible
5. WHO BENEFITS FROM THE PERCEPTION: Follow the incentives — who profits from maintaining the current narrative? (Schools? Employers? Media?)
6. CONTRARIAN PLAY: What's the strategic opportunity that most people are missing because they're following perception, not reality?
7. WAYFINDER VERDICT: Our honest, data-backed take — with specific recommendations

Examples of perception gaps to analyze:
- "CS is the safest degree" (perception) vs. entry-level saturation + AI displacement (emerging reality)
- "Ivy League guarantees success" (perception) vs. outcomes data showing diminishing returns past top 50 (reality)
- "Trades are for people who can't do college" (perception) vs. $80-120K earnings with zero debt (reality)
- "Follow your passion" (perception) vs. find what you're good at that the market will value in 4 years (reality)

Be bold, honest, and data-driven. This is where Wayfinder's forward-looking philosophy shines.`
  }
};

/**
 * Detect if the user's query triggers a structured analysis framework.
 * Returns the framework prompt to inject, or null.
 */
function detectAnalysisFramework(query) {
  if (!query) return null;
  const lower = query.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const [name, framework] of Object.entries(ANALYSIS_FRAMEWORKS)) {
    let hits = 0;
    for (const signal of framework.signals) {
      if (lower.includes(signal)) hits++;
    }
    if (hits >= 2 && hits > bestScore) {
      bestScore = hits;
      bestMatch = { name, prompt: framework.prompt };
    }
  }

  // Also trigger on explicit requests
  if (lower.includes('full analysis') || lower.includes('deep analysis') || lower.includes('full pull')) {
    // Pick the most relevant framework based on any signal hit
    for (const [name, framework] of Object.entries(ANALYSIS_FRAMEWORKS)) {
      for (const signal of framework.signals) {
        if (lower.includes(signal)) {
          return { name, prompt: framework.prompt };
        }
      }
    }
  }

  return bestMatch;
}

function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not set. Copy .env.example to .env and add your key.');
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

async function loadSystemPrompt() {
  if (!systemPromptCache) {
    const promptPath = join(__dirname, '..', '..', 'prompts', 'wayfinder-system-prompt.txt');
    systemPromptCache = await fs.readFile(promptPath, 'utf-8');
  }
  return systemPromptCache;
}

// Call this if you need to reload the system prompt (e.g., after editing it)
export function invalidatePromptCache() {
  systemPromptCache = null;
}

/**
 * Build user profile string for injection into the system prompt.
 */
function buildProfileString(sessionContext) {
  if (!sessionContext || Object.keys(sessionContext).length === 0) return '';

  const lines = [];
  if (sessionContext.userName) lines.push(`Name: ${sessionContext.userName}`);
  if (sessionContext.userType) lines.push(`Type: ${sessionContext.userType}`);
  if (sessionContext.school) lines.push(`School: ${sessionContext.school}`);

  // Track indicator
  if (sessionContext.track) lines.push(`Track: ${sessionContext.track}`);

  // Expanded profile fields
  const p = sessionContext.profile;
  if (p) {
    if (p.age) lines.push(`Age: ${p.age}`);
    if (p.gradeLevel) lines.push(`Grade/Year: ${p.gradeLevel}`);
    if (p.childGrade) lines.push(`Child's Grade: ${p.childGrade}`);
    if (p.targetSchools) lines.push(`Target Schools: ${p.targetSchools}`);
    if (p.favoriteClasses && p.favoriteClasses.length > 0) {
      lines.push(`Favorite Classes: ${p.favoriteClasses.join(', ')}`);
    }
    if (p.careerInterests && p.careerInterests.length > 0) {
      lines.push(`Career Interests: ${p.careerInterests.join(', ')}`);
    }
    if (p.aboutMe) lines.push(`About: ${p.aboutMe}`);
  }

  if (sessionContext.interests && sessionContext.interests.length > 0) {
    lines.push(`Interests: ${Array.isArray(sessionContext.interests) ? sessionContext.interests.join(', ') : sessionContext.interests}`);
  }

  if (lines.length === 0) return '';

  return `\n\n═══════════════════════════════════════════
CURRENT USER PROFILE
═══════════════════════════════════════════
${lines.join('\n')}`;
}

// ─── Conversation Depth Detection ────────────────────────────
// Analyzes conversation history to determine what phase we're in
// and how much context the user has already built up.
// This drives: response length calibration, engine pull nudges,
// and whether to proactively offer deeper analysis.

function detectConversationPhase(conversationHistory, sessionContext) {
  const exchangeCount = conversationHistory.filter(m => m.role === 'user').length;
  const hasProfile = sessionContext && (sessionContext.userType || sessionContext.profile?.gradeLevel || sessionContext.profile?.careerInterests?.length);
  const hasTrack = sessionContext?.track;

  // Count how much context the user has shared (look at user message lengths)
  const totalUserChars = conversationHistory
    .filter(m => m.role === 'user')
    .reduce((sum, m) => sum + (m.content?.length || 0), 0);

  // Phase 1: Context building — first few exchanges, still learning about user
  if (exchangeCount <= 2 && !hasProfile) {
    return {
      phase: 1,
      label: 'context_building',
      suggestedMaxTokens: 800,
      nudgeDeepAnalysis: false,
      contextRichness: 'lean'
    };
  }

  // Phase 2: Targeted exploration — have some context, can get specific
  if (exchangeCount <= 6 || (exchangeCount <= 8 && !hasTrack)) {
    return {
      phase: 2,
      label: 'targeted_exploration',
      suggestedMaxTokens: 1200,
      nudgeDeepAnalysis: exchangeCount >= 4 && hasProfile,
      contextRichness: 'moderate'
    };
  }

  // Phase 3: Deep analysis — earned through conversation depth
  return {
    phase: 3,
    label: 'deep_analysis',
    suggestedMaxTokens: 2000,
    nudgeDeepAnalysis: true,
    contextRichness: 'rich'
  };
}

/**
 * Send a message to Claude.
 *
 * @param {Array} conversationHistory - Array of {role, content} messages
 * @param {string} userMessage - The latest user message
 * @param {Object} sessionContext - User profile info (type, interests, etc.)
 * @param {Object} options - { useEngine: boolean }
 * @returns {Object} { response, usage, retrievedSources, mode }
 */
export async function chat(conversationHistory, userMessage, sessionContext = {}, options = {}) {
  const anthropic = getClient();
  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';
  const useEngine = options.useEngine || false;

  // Detect conversation depth — this influences token budget and context assembly
  const phase = detectConversationPhase(conversationHistory, sessionContext);
  console.log(`[Conversation] Phase ${phase.phase} (${phase.label}), exchanges: ${conversationHistory.filter(m => m.role === 'user').length}`);

  let contextStr;
  let relevantChunks = [];

  if (useEngine) {
    // FULL ENGINE MODE: RAG retrieval — topK scales with conversation phase
    const topK = phase.phase >= 3 ? 8 : phase.phase >= 2 ? 6 : 4;
    relevantChunks = await retrieveContext(userMessage, topK);
    contextStr = formatContext(relevantChunks);
    console.log(`[Engine Mode] Retrieved ${relevantChunks.length} chunks for: "${userMessage.slice(0, 60)}..."`);
  } else {
    // STANDARD MODE: Route to career or admissions brain based on query (~50% token savings)
    contextStr = await getLiteBrainContext(userMessage);
    console.log(`[Standard Mode] Brain routed for: "${userMessage.slice(0, 60)}..."`);
  }

  // Build system prompt with context
  let systemPrompt = await loadSystemPrompt();
  systemPrompt = systemPrompt.replace('{RETRIEVED_CONTEXT}', contextStr);

  // Add mode indicator and analysis framework injection
  if (useEngine) {
    systemPrompt += '\n\n[WAYFINDER ENGINE ACTIVE — You have access to deep, specific knowledge from BLS data, O*NET profiles, community insights, and distilled career intelligence. Provide detailed, data-rich answers with specific numbers, salary ranges, and growth projections.]';

    // Check if a structured analysis framework should be activated
    const framework = detectAnalysisFramework(userMessage);
    if (framework) {
      systemPrompt += '\n\n' + framework.prompt;
      console.log(`[Engine Mode] Analysis framework activated: ${framework.name}`);
    }
  }

  // Add user profile
  systemPrompt += buildProfileString(sessionContext);

  // Add conversation phase guidance — tells Claude where we are in the arc
  // and how to calibrate response depth
  const phaseGuidance = {
    1: '\n\n[CONVERSATION PHASE: CONTEXT BUILDING — This is an early exchange. Keep responses warm, concise (150-250 words), and end with a natural question to learn more about the user. Provide helpful directional guidance but save the deep data for later. Build rapport and understanding first.]',
    2: '\n\n[CONVERSATION PHASE: TARGETED EXPLORATION — You have some context about this user. Provide data-specific responses (250-400 words) tailored to their situation. ' +
      (phase.nudgeDeepAnalysis ? 'When relevant, offer to go deeper: "I can run a full analysis on this if helpful..." ' : '') +
      'Reference what you know about them from earlier in the conversation.]',
    3: '\n\n[CONVERSATION PHASE: DEEP ANALYSIS — This conversation has earned depth. Provide comprehensive, structured responses (400-600+ words) with specific data, projections, and personalized strategy. This is the $10K consultant moment — deliver maximum value.]'
  };
  systemPrompt += phaseGuidance[phase.phase] || '';

  // Build messages array
  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  // Token budget scales with conversation phase — early = lean, deep = generous
  const maxTokens = useEngine ? phase.suggestedMaxTokens : Math.min(phase.suggestedMaxTokens, 1500);

  // Call Claude
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages
    });

    const assistantMessage = response.content[0].text;

    return {
      response: assistantMessage,
      mode: useEngine ? 'engine' : 'standard',
      phase: phase.phase,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        model
      },
      retrievedSources: relevantChunks.map(c => ({
        source: c.source,
        title: c.title,
        score: c.score
      }))
    };
  } catch (err) {
    if (err.status === 401) {
      throw new Error('Invalid API key. Check your ANTHROPIC_API_KEY in .env');
    }
    if (err.status === 429) {
      throw new Error('Rate limited. Please wait a moment and try again.');
    }
    throw err;
  }
}

/**
 * Reload system prompt from disk (call after editing the prompt file).
 */
export function reloadPrompt() {
  systemPromptCache = null;
}
