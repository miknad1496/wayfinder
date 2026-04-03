import Anthropic from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { retrieveContext, formatContext, getLiteBrainContext } from './knowledge.js';
import { initOutputFilter, filterResponse as filterLeakage, invalidateOutputFilter } from './output_filter.js';
import { BOUNDARY_INSTRUCTION } from './scope_classifier.js';

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
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Validate API key existence and format
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not set. Copy .env.example to .env and add your key.');
    }

    // Basic format check: Anthropic keys are typically 40+ chars starting with 'sk-ant-'
    if (apiKey.length < 20) {
      throw new Error('Invalid ANTHROPIC_API_KEY format (too short). Check your .env file.');
    }

    try {
      client = new Anthropic({ apiKey });
    } catch (err) {
      // Anthropic SDK validation error
      throw new Error(`Failed to initialize Anthropic client: ${err.message}`);
    }
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

  // Values orientation
  if (sessionContext.valuesOrientation) lines.push(`Values: ${sessionContext.valuesOrientation}`);

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

// ─── Temporal Awareness ────────────────────────────────────────
// Injects current date and admissions cycle stage so the brain
// gives time-appropriate advice automatically.

function buildTemporalContext() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  const year = now.getFullYear();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dateStr = `${monthNames[month-1]} ${day}, ${year}`;

  // Determine admissions cycle stage
  let cycleStage = '';
  if (month >= 1 && month <= 3) {
    // Jan-Mar: Decision season — most RD decisions come March-April
    cycleStage = `DECISION SEASON. Regular Decision applications are submitted. Most RD notifications arrive mid-March through early April. ED II results typically come in February. For 12th graders: applications are DONE — this is the waiting period. Do NOT ask about application strategy, essay writing, or ED decisions for seniors. Instead focus on: what decisions they're waiting on, how to evaluate offers when they arrive, financial aid comparison, deposit deadlines (typically May 1), and emotional support during the wait. For 11th graders: this is prime time to start building their school list and planning summer activities. For 10th graders and younger: long-horizon strategic planning.`;
  } else if (month >= 4 && month <= 5) {
    // Apr-May: Decisions are in, commitment deadline
    cycleStage = `COMMITMENT SEASON. Most admissions decisions are in. National commitment deadline is May 1. For 12th graders: focus on comparing offers, financial aid packages, admitted student events, and making the final decision. Waitlist strategy if applicable. For 11th graders: junior year is wrapping up — standardized testing, school list development, summer planning are key.`;
  } else if (month >= 6 && month <= 8) {
    // Jun-Aug: Summer — orientation, rising seniors prep
    cycleStage = `SUMMER PREPARATION. For incoming college freshmen: orientation, housing, course registration. For rising 12th graders: this is the critical summer for finalizing school lists, drafting essays (Common App opens Aug 1), and preparing applications. ED strategy decisions should be made by end of summer. For rising 11th graders: summer programs, test prep, extracurricular depth-building.`;
  } else if (month >= 9 && month <= 10) {
    // Sep-Oct: Application season begins
    cycleStage = `APPLICATION SEASON. Early Decision / Early Action deadlines are typically November 1-15. For 12th graders: applications are being finalized and submitted. Essay polishing, supplemental essays, recommendation letters. This is crunch time. For 11th graders: PSAT in October, start exploring schools.`;
  } else if (month >= 11 && month <= 12) {
    // Nov-Dec: ED submitted, RD prep
    cycleStage = `EARLY ROUND RESULTS & RD PREP. EA/ED applications are submitted (Nov 1-15 deadlines passed). ED results typically arrive mid-December. For 12th graders: if ED is submitted, focus on Regular Decision apps (Jan 1-15 deadlines). If deferred from ED, strategize for RD round. For 11th graders: start thinking about summer plans and initial school research.`;
  }

  return `\n\n═══════════════════════════════════════════
TEMPORAL CONTEXT (CRITICAL — USE THIS)
═══════════════════════════════════════════
Today's date: ${dateStr}
Academic year: ${month >= 7 ? year : year - 1}-${month >= 7 ? year + 1 : year}
Admissions cycle stage: ${cycleStage}

IMPORTANT: Calibrate ALL advice to the current date and cycle stage. A 12th grader in March has already submitted all applications — do not suggest application strategies. A parent asking about their senior in April should be guided on decision-making, not application prep. Always be aware of where we are in the calendar.`;
}

// ─── Signal-Driven Conversation Phase Detection ────────────────
// Analyzes conversation history to determine what phase we're in
// based on CONTEXT RICHNESS, not just exchange count.
// A high-context opener should skip the warm-up phase entirely.

function detectConversationPhase(conversationHistory, sessionContext) {
  const exchangeCount = conversationHistory.filter(m => m.role === 'user').length;
  const hasProfile = sessionContext && (sessionContext.userType || sessionContext.profile?.gradeLevel || sessionContext.profile?.careerInterests?.length);
  const hasTrack = sessionContext?.track;
  const hasValues = sessionContext?.valuesOrientation;

  // Count how much context the user has shared (look at user message lengths)
  const totalUserChars = conversationHistory
    .filter(m => m.role === 'user')
    .reduce((sum, m) => sum + (m.content?.length || 0), 0);

  // ─── Context Richness Scoring ─────────────────────────────
  // Instead of just counting exchanges, score how much useful context we have
  let contextScore = 0;

  // Profile completeness signals
  if (hasProfile) contextScore += 2;
  if (hasTrack) contextScore += 1;
  if (hasValues) contextScore += 1;
  if (sessionContext?.profile?.gradeLevel) contextScore += 1;
  if (sessionContext?.profile?.targetSchools) contextScore += 1;
  if (sessionContext?.profile?.careerInterests?.length) contextScore += 1;

  // Message content richness — high-context openers should advance phase faster
  const latestUserMsg = conversationHistory.filter(m => m.role === 'user').pop();
  if (latestUserMsg) {
    const msgLen = latestUserMsg.content?.length || 0;
    // A detailed first message (200+ chars) suggests the user has context to share
    if (msgLen > 300) contextScore += 2;
    else if (msgLen > 150) contextScore += 1;

    // Detect specific data points in the message (GPA, scores, school names, grade level)
    const msg = latestUserMsg.content?.toLowerCase() || '';
    const specificSignals = [
      /\d+\.\d+\s*(gpa|weighted|unweighted)/,     // GPA mentioned
      /\d{3,4}\s*(sat|act|score)/,                 // Test scores
      /\b(9th|10th|11th|12th|junior|senior|freshman|sophomore)\s*(grade|grader)?\b/,  // Grade level
      /\b(harvard|yale|princeton|stanford|mit|cornell|penn|columbia|duke|northwestern|caltech|uchicago|georgetown|vanderbilt|rice)\b/i,  // Named schools
      /\b(pre-med|premed|engineering|computer science|business|nursing)\b/i,  // Specific fields
      /\b(budget|afford|financial|cost|tuition|debt|loan)\b/i,  // Financial context
    ];
    for (const pattern of specificSignals) {
      if (pattern.test(msg)) contextScore += 1;
    }
  }

  // Exchange-based floor (still consider time in conversation)
  if (exchangeCount >= 4) contextScore += 2;
  else if (exchangeCount >= 2) contextScore += 1;

  // Total user investment in the conversation
  if (totalUserChars > 1000) contextScore += 1;
  if (totalUserChars > 2500) contextScore += 1;

  // ─── Phase Assignment Based on Context Score ───────────────
  // Phase 1: Lean context (score 0-3) — still building understanding
  // Phase 2: Moderate context (score 4-7) — have enough to get specific
  // Phase 3: Rich context (score 8+) — ready for deep analysis

  if (contextScore >= 8) {
    return {
      phase: 3,
      label: 'deep_analysis',
      suggestedMaxTokens: 2000,
      nudgeDeepAnalysis: true,
      contextRichness: 'rich',
      contextScore
    };
  }

  if (contextScore >= 4) {
    return {
      phase: 2,
      label: 'targeted_exploration',
      suggestedMaxTokens: 1200,
      nudgeDeepAnalysis: contextScore >= 6,
      contextRichness: 'moderate',
      contextScore
    };
  }

  // Phase 1: Context building
  return {
    phase: 1,
    label: 'context_building',
    suggestedMaxTokens: 800,
    nudgeDeepAnalysis: false,
    contextRichness: 'lean',
    contextScore
  };
}

/**
 * Haiku Intake — Cheapest possible first-turn response.
 *
 * Uses Claude Haiku (19x cheaper than Sonnet output) for the initial
 * info-gathering prompt. This serves two purposes:
 *   1. Saves money — intake doesn't need Sonnet's full power
 *   2. Buys time — while Haiku responds, the caller can fire a
 *      RunPod warm-up ping so the SLM worker is ready for turn 2
 *
 * Returns the same shape as chat() for drop-in compatibility.
 */
export async function chatHaikuIntake(userMessage, sessionContext = {}, conversationHistory = []) {
  const anthropic = getClient();
  const haikuModel = process.env.CLAUDE_MODEL_HAIKU || 'claude-haiku-4-5-20251001';

  // Lightweight system prompt for intake — no RAG, no frameworks
  // This persona is the "assistant coach / front desk admin" who greets the user
  // while the main advisor (SLM) warms up in the background.
  const intakeSystemPrompt = `You are the Wayfinder Welcome Desk.

Wayfinder is an intelligent advisory platform powered by a proprietary intelligence engine and a highly curated, RAG-based knowledge architecture purpose-built for education and career guidance.

You are the front desk greeter. A dedicated Wayfinder advisor is loading right now and will take over shortly. Your ONLY job:
- Greet the user warmly in 1-2 sentences
- Briefly acknowledge their topic WITHOUT answering it
- Tell them their Wayfinder advisor is connecting now
- Ask 1-2 clarifying questions to help the advisor

HARD LIMITS — VIOLATION OF THESE IS A SYSTEM FAILURE:
1. MAX 80 WORDS. No exceptions. Count them.
2. ZERO substantive content. Do not explain, analyze, advise, predict, compare, or evaluate ANYTHING about their topic. Not even "here's what I can say" or "what I do know is." NOTHING.
3. Do not apologize for not answering. Do not explain why you can't answer. Just greet, acknowledge the topic name, and hand off.
4. The advisor IS real and IS coming. Never say otherwise. Never say "there is no advisor." Never suggest the user look elsewhere. The advisor is loading — that is the truth.
5. You ARE Wayfinder. If asked what you are: "I'm the Wayfinder welcome desk — part of an intelligent advisory platform built for education and career guidance. Your dedicated advisor is connecting now."
6. NEVER say "Claude", "Anthropic", "AI assistant", "ChatGPT", "OpenAI", "language model", or "I'm not actually." You are Wayfinder. Period.
7. If the user presses you, gets frustrated, or demands answers — stay in role. Say: "I completely understand the urgency. Your Wayfinder advisor is almost ready and will be able to dig into this properly. Just a moment."
8. NEVER break character. NEVER confess. NEVER say "I should be honest" or "let me be straight." There is nothing to confess. You ARE the Wayfinder welcome desk.

EXAMPLE GOOD RESPONSE:
"Welcome to Wayfinder! Great question about CS curriculum trends — that's exactly the kind of forward-looking question our advisor specializes in. They're connecting now. While we wait, are your kids currently in high school or college? And are they leaning toward any particular area within CS?"

EXAMPLE BAD RESPONSE (NEVER DO THIS):
Any response that contains analysis, predictions, advice, opinions about the user's topic, admission of being Claude, or suggestion that no advisor exists.`;

  // Inject user context if available
  let contextNote = '';
  if (sessionContext.userName) contextNote += `User's name: ${sessionContext.userName}. `;
  if (sessionContext.userType) contextNote += `User type: ${sessionContext.userType}. `;
  if (sessionContext.interests) contextNote += `Interests: ${sessionContext.interests}. `;
  if (sessionContext.profile) contextNote += `Profile: ${JSON.stringify(sessionContext.profile)}. `;

  const systemPrompt = contextNote
    ? `${intakeSystemPrompt}\n\n[User context: ${contextNote.trim()}]`
    : intakeSystemPrompt;

  // Try Haiku first, then fall back to Sonnet with the same Welcome Desk persona
  // (so the persona is preserved even if Haiku model isn't available)
  const modelsToTry = [
    haikuModel,
    process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
  ];

  for (const model of modelsToTry) {
    try {
      console.log(`[HAIKU-INTAKE] Trying model: ${model}`);
      const response = await anthropic.messages.create({
        model,
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          // Only pass last 2 messages for minimal context — more history
          // causes the model to break character under conversational pressure
          ...conversationHistory.slice(-2),
          { role: 'user', content: userMessage },
        ],
      });

      const text = response.content?.[0]?.text || '';

      console.log(`[HAIKU-INTAKE] ${model} — ${response.usage?.input_tokens}in/${response.usage?.output_tokens}out`);

      return {
        response: text,
        mode: 'haiku_intake',
        model,
        retrievedSources: [],
        usage: {
          inputTokens: response.usage?.input_tokens || 0,
          outputTokens: response.usage?.output_tokens || 0,
          model,
        },
      };
    } catch (err) {
      console.error(`[HAIKU-INTAKE] ${model} failed: ${err.status || ''} ${err.message}`);
      // If this was Haiku and it failed, try the next model
      if (model === haikuModel) {
        console.log(`[HAIKU-INTAKE] Haiku unavailable — trying Sonnet with Welcome Desk persona`);
        continue;
      }
      // If Sonnet also failed, throw to let caller handle
      throw err;
    }
  }

  // Should never reach here, but just in case
  throw new Error('All intake models failed');
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
  const useEngine = options.useEngine || false;
  const scopeLabel = options.scopeLabel || 'in_scope';

  // Tiered model strategy:
  // - Free users (standard mode): Sonnet — efficient, selective context from lite brain
  // - Paid engine pulls (Coach/Consultant): Opus — comprehensive analysis with full RAG
  //   Falls back to Sonnet if CLAUDE_MODEL_ENGINE is not set
  const standardModel = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';
  const engineModel = useEngine
    ? (process.env.CLAUDE_MODEL_ENGINE || process.env.CLAUDE_MODEL || 'claude-sonnet-4-6')
    : standardModel;
  const model = useEngine ? engineModel : standardModel;

  // Detect conversation depth — this influences token budget and context assembly
  const phase = detectConversationPhase(conversationHistory, sessionContext);
  console.log(`[Conversation] Phase ${phase.phase} (${phase.label}), context score: ${phase.contextScore}, exchanges: ${conversationHistory.filter(m => m.role === 'user').length}`);

  let contextStr;
  let relevantChunks = [];

  if (useEngine) {
    // FULL ENGINE MODE: RAG retrieval — topK scales with conversation phase
    const topK = phase.phase >= 3 ? 8 : phase.phase >= 2 ? 6 : 4;
    const ragResult = await retrieveContext(userMessage, topK);
    // Support both new format ({ chunks, sources }) and legacy (flat array)
    relevantChunks = Array.isArray(ragResult) ? ragResult : (ragResult?.chunks || []);
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

  // ─── TEMPORAL AWARENESS ─────────────────────────────────────────
  // Inject current date and admissions cycle stage so the brain
  // gives time-appropriate advice (e.g., don't ask a 12th grader
  // in March about ED strategy — apps are submitted, we're waiting
  // on decisions).
  systemPrompt += buildTemporalContext();

  // Add mode indicator and analysis framework injection
  if (useEngine) {
    systemPrompt += '\n\n[WAYFINDER ENGINE ACTIVE — You have access to Wayfinder\'s full proprietary advisory intelligence: deep domain-specific knowledge continuously refined across hundreds of career and admissions sub-verticals, multi-layer distilled reasoning from expert synthesis, and calibrated insights from industry professionals and real interaction patterns. Provide personalized, strategic analysis mapped to this user\'s specific situation. Use specific data points, projections, and nuanced recommendations. This is the $10K consultant moment — deliver maximum value.]';

    // Check if a structured analysis framework should be activated
    const framework = detectAnalysisFramework(userMessage);
    if (framework) {
      systemPrompt += '\n\n' + framework.prompt;
      console.log(`[Engine Mode] Analysis framework activated: ${framework.name}`);
    }

    // ─── SS-02: RAG PROMPT AUGMENTATION ───────────────────────────
    // When real RAG chunks were retrieved, inject an expansion instruction
    // to prevent the model from under-utilizing the evidence. Addresses
    // RAG-04, RAG-09, RAG-11, RAG-12 (under-length despite correct
    // evidence use). Only fires when actual context chunks are present —
    // not on the "no documents matched" fallback.
    if (relevantChunks.length > 0) {
      systemPrompt += '\n\n[GENERATION INSTRUCTION: You have been provided with retrieved context. ' +
        'Develop your analysis fully using specific data points from the context. ' +
        'Structure your response with clear sections. For questions with substantial ' +
        'retrieved data, target 400-600 words. Do not summarize in fewer than 200 words ' +
        'when the context provides enough data to support a developed answer.]';
      console.log(`[SS-02] RAG augmentation injected (${relevantChunks.length} chunks present)`);
    }
  }

  // Add user profile
  systemPrompt += buildProfileString(sessionContext);

  // ─── SS-04: SCOPE BOUNDARY INJECTION ────────────────────────
  // For adjacent queries (straddling education + out-of-scope domain),
  // inject a boundary instruction that tells the model to address only
  // the education component and redirect the rest to a professional.
  if (scopeLabel === 'adjacent') {
    systemPrompt += BOUNDARY_INSTRUCTION;
    console.log(`[SS-04] Boundary instruction injected for adjacent query`);
  }

  // Add conversation phase guidance — tells Claude where we are in the arc
  // and how to calibrate response depth
  const phaseGuidance = {
    1: '\n\n[CONVERSATION PHASE: CONTEXT BUILDING — Context is still lean. Keep responses warm, concise (150-250 words), and conversational. Include the Engine orientation naturally in your first response. Ask about their values orientation (ROI vs fulfillment). End with a natural question to learn more. Provide helpful directional guidance but save the deep analysis for later. Do NOT front-load statistics or data dumps — build rapport and understanding first.]',
    2: '\n\n[CONVERSATION PHASE: TARGETED EXPLORATION — You have meaningful context about this user. Provide tailored guidance (250-400 words) calibrated to their situation and values. Reference what you know about them. ' +
      (phase.nudgeDeepAnalysis ? 'When relevant, naturally suggest going deeper: "I can do a full strategic breakdown on this if you want to use an Engine call..." ' : '') +
      'Use data to support your narrative when relevant, but keep it conversational — not data-dump style.]',
    3: '\n\n[CONVERSATION PHASE: DEEP ANALYSIS — This conversation has earned depth. Provide comprehensive, structured responses (400-600+ words) with personalized analysis, specific data mapped to their profile, and strategic recommendations. Calibrate to their values orientation throughout. This is where Wayfinder\'s full intelligence shines.]'
  };
  systemPrompt += phaseGuidance[phase.phase] || '';

  // Build messages array
  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  // Token budget scales with conversation phase — early = lean, deep = generous
  const maxTokens = useEngine ? phase.suggestedMaxTokens : Math.min(phase.suggestedMaxTokens, 1500);

  // ─── TOKEN COUNT ESTIMATION (prevent context overflow) ──────────────
  // Rough estimate: 1 token ≈ 4 chars (Claude uses byte-pair encoding, varies by content)
  // For safety, assume worst case (fewer chars per token for Unicode/special chars)
  const estimateTokens = (text) => {
    if (!text) return 0;
    // Use 3.5 chars/token as conservative estimate (safer than 4)
    return Math.ceil(text.length / 3.5);
  };

  const estimatedInputTokens = estimateTokens(systemPrompt) + messages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
  const estimatedTotalTokens = estimatedInputTokens + maxTokens;
  const MAX_TOTAL_TOKENS = 200000; // Opus context limit safety margin

  if (estimatedTotalTokens > MAX_TOTAL_TOKENS * 0.95) {
    // Trim conversation history if approaching context limit
    console.warn(`[Claude] Estimated tokens (${estimatedTotalTokens}) approaching limit. Trimming history.`);
    // Keep only last 4 exchanges (8 messages) instead of 10
    messages.splice(0, Math.max(0, messages.length - 8));
  }

  // Call Claude
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages
    });

    if (!response.content || response.content.length === 0 || !response.content[0].text) {
      throw new Error('Claude returned empty or malformed response');
    }
    const rawMessage = response.content[0].text;

    // ─── SS-03: OUTPUT LEAKAGE FILTER ───────────────────────────
    // Scan every response for verbatim system prompt substrings.
    // If leakage detected, replace entire response with safe redirect.
    await initOutputFilter();
    const { response: assistantMessage, leaked } = filterLeakage(rawMessage);
    if (leaked) {
      console.log(`[SS-03] Response replaced due to system prompt leakage`);
    }

    return {
      response: assistantMessage,
      mode: useEngine ? 'engine' : 'standard',
      leaked,
      phase: phase.phase,
      contextScore: phase.contextScore,
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
    // ─── ERROR HANDLING: No API key leakage ────────────────────────
    // Never expose actual API key, error details, or request bodies in error messages

    // Map HTTP status codes to safe user messages
    const statusErrorMap = {
      401: 'Authentication failed. Verify your API key is valid and not expired.',
      429: 'API rate limit exceeded. Please wait a moment and try again. Consider upgrading your plan for higher limits.',
      400: 'Invalid request format. This may be due to message length or content.',
      503: 'Anthropic API is temporarily unavailable. Please try again in a moment.',
    };

    if (err.status && statusErrorMap[err.status]) {
      throw new Error(statusErrorMap[err.status]);
    }

    // Generic error — log to console (server-side only) but return safe message
    console.error('[Claude API Error]', {
      status: err.status,
      message: err.message,
      // Never log error.error which might contain full request/key details
    });

    throw new Error('Failed to generate response. Please try again.');
  }
}

/**
 * Reload system prompt from disk (call after editing the prompt file).
 */
export function reloadPrompt() {
  systemPromptCache = null;
  invalidateOutputFilter(); // SS-03: re-build n-grams from new prompt
}
