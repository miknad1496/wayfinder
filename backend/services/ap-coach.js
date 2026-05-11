/**
 * AP Coach Service — REVAMP V2: AP COACH ADD-ON PATCH67
 *
 * Add-on service for Pro/Elite users. Each FRQ scoring costs 1 ap_coach credit.
 * Mirror of essay-reviewer.js pattern, adapted for AP free-response questions.
 *
 * Knowledge sources loaded at startup + cached:
 *   - backend/knowledge-base/ap-exams/_brain.md (master AP study guide brain file)
 *   - backend/knowledge-base/ap-exams/ap-<exam>.md (per-exam strategic insights)
 *
 * For each request, the service:
 *   1. Validates the exam is supported
 *   2. Loads the per-exam knowledge file and the universal patterns from _brain.md
 *   3. Builds a system prompt encoding the rubric for the FRQ type
 *   4. Calls Claude Opus to score the response against the rubric
 *   5. Returns structured JSON: rubric points earned/missing, what-a-5-adds, top 3 fixes,
 *      phrases-that-score the student should adopt
 */

import Anthropic from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Anthropic();

// PATCH162 AP PDF TEXT EXTRACT - lazy-load pdf-parse so PDF attachments to
// scoreFrq become text snippets (5x cheaper tokens, sidesteps Anthropic 32mb
// per-request cap, faster). Failures degrade gracefully:
//   - pdf-parse not installed -> _pdfParse = false, returns null -> caller
//     falls back to a document content block (Claude's native PDF vision).
//   - PDF is scanned (no embedded text, <50 chars extracted) -> returns null
//     -> caller falls back to document block.
//   - PDF is encrypted / corrupted -> caught, returns null -> caller falls
//     back to document block.
let _pdfParse = null;
async function _loadPdfParse() {
  if (_pdfParse !== null) return _pdfParse;
  try {
    const mod = await import('pdf-parse');
    _pdfParse = mod.default || mod;
    console.log('[ApCoach] pdf-parse loaded for PDF text extraction');
  } catch (e) {
    _pdfParse = false;
    console.warn('[ApCoach] pdf-parse not available (npm install pending?):', e.message);
  }
  return _pdfParse;
}

async function tryExtractPdfText(base64Data, nameForLog) {
  const parser = await _loadPdfParse();
  if (!parser) return null;
  try {
    const buf = Buffer.from(base64Data, 'base64');
    // max:50 caps page count to keep extraction bounded; most FRQ reference
    // PDFs are a few pages.
    const result = await parser(buf, { max: 50 });
    const text = String((result && result.text) || '').trim();
    if (text.length < 50) {
      console.log('[ApCoach] PDF "' + (nameForLog || 'unnamed') + '" extracted only ' + text.length + ' chars (likely scanned) -- falling back to vision');
      return null;
    }
    // Cap at 200K chars to keep token budget sane even for long PDFs
    const capped = text.slice(0, 200000);
    console.log('[ApCoach] PDF "' + (nameForLog || 'unnamed') + '" -> ' + capped.length + ' chars text');
    return capped;
  } catch (e) {
    console.warn('[ApCoach] PDF text extraction failed for "' + (nameForLog || 'unnamed') + '":', e.message);
    return null;
  }
}


const SUPPORTED_EXAMS = { // REVAMP V2: AP COACH FULL MODULE PATCH81 SUPPORTED_EXAMS — expanded to 27
  'ap-art-history':       { label: 'AP Art History', file: 'ap-art-history.md' },
  'ap-biology':           { label: 'AP Biology', file: 'ap-biology.md' },
  'ap-calc-ab':           { label: 'AP Calculus AB', file: 'ap-calc-ab.md' },
  'ap-calc-bc':           { label: 'AP Calculus BC', file: 'ap-calc-bc.md' },
  'ap-chemistry':         { label: 'AP Chemistry', file: 'ap-chemistry.md' },
  'ap-csa':               { label: 'AP Computer Science A', file: 'ap-csa.md' },
  'ap-csp':               { label: 'AP Computer Science Principles', file: 'ap-csp.md' },
  'ap-english-lang':      { label: 'AP English Language', file: 'ap-english-lang.md' },
  'ap-english-lit':       { label: 'AP English Literature', file: 'ap-english-lit.md' },
  'ap-environmental-science': { label: 'AP Environmental Science', file: 'ap-environmental-science.md' },
  'ap-european-history':  { label: 'AP European History', file: 'ap-european-history.md' },
  'ap-french':            { label: 'AP French Language & Culture', file: 'ap-french.md' },
  'ap-government':        { label: 'AP US Government & Politics', file: 'ap-government.md' },
  'ap-human-geography':   { label: 'AP Human Geography', file: 'ap-human-geography.md' },
  'ap-macroeconomics':    { label: 'AP Macroeconomics', file: 'ap-macroeconomics.md' },
  'ap-microeconomics':    { label: 'AP Microeconomics', file: 'ap-microeconomics.md' },
  'ap-music-theory':      { label: 'AP Music Theory', file: 'ap-music-theory.md' },
  'ap-physics-1':         { label: 'AP Physics 1', file: 'ap-physics-1.md' },
  'ap-physics-2':         { label: 'AP Physics 2', file: 'ap-physics-2.md' },
  'ap-physics-c-em':      { label: 'AP Physics C: E&M', file: 'ap-physics-c-em.md' },
  'ap-physics-c-mech':    { label: 'AP Physics C: Mechanics', file: 'ap-physics-c-mech.md' },
  'ap-precalculus':       { label: 'AP Precalculus', file: 'ap-precalculus.md' },
  'ap-psychology':        { label: 'AP Psychology', file: 'ap-psychology.md' },
  'ap-spanish':           { label: 'AP Spanish Language & Culture', file: 'ap-spanish.md' },
  'ap-statistics':        { label: 'AP Statistics', file: 'ap-statistics.md' },
  'ap-us-history':        { label: 'AP US History (APUSH)', file: 'ap-us-history.md' },
  'ap-world-history':     { label: 'AP World History', file: 'ap-world-history.md' },
  // PATCH102: Capstones
  'ap-research':          { label: 'AP Research (Capstone)', file: 'ap-research.md' },
  'ap-seminar':           { label: 'AP Seminar (Capstone)', file: 'ap-seminar.md' },
  // PATCH102: New exams added 2026-05
  'ap-african-american-studies': { label: 'AP African American Studies', file: 'ap-african-american-studies.md' },
  'ap-comparative-gov':   { label: 'AP Comparative Government & Politics', file: 'ap-comparative-gov.md' },
  'ap-latin':             { label: 'AP Latin', file: 'ap-latin.md' },
  // PATCH102: World languages
  'ap-chinese-language':  { label: 'AP Chinese Language & Culture', file: 'ap-chinese-language.md' },
  'ap-german-language':   { label: 'AP German Language & Culture', file: 'ap-german-language.md' },
  'ap-italian-language':  { label: 'AP Italian Language & Culture', file: 'ap-italian-language.md' },
  'ap-japanese-language': { label: 'AP Japanese Language & Culture', file: 'ap-japanese-language.md' },
  'ap-spanish-lit':       { label: 'AP Spanish Literature & Culture', file: 'ap-spanish-lit.md' },
  'other':                { label: 'Other AP Exam (general feedback)', file: null },
};

const FRQ_TYPES = {
  'free-response':  'Free-Response Question (general)',
  'dbq':            'Document-Based Question (APUSH/AP World)',
  'leq':            'Long Essay Question (APUSH/AP World)',
  'saq':            'Short Answer Question (APUSH/AP World)',
  'argument':       'Argument Essay (AP Lang/AP Gov)',
  'rhetorical':     'Rhetorical Analysis Essay (AP Lang)',
  'synthesis':      'Synthesis Essay (AP Lang)',
  'scotus-comp':    'SCOTUS Comparison FRQ (AP Gov)',
  'concept-app':    'Concept Application FRQ (AP Gov)',
  'quant-analysis': 'Quantitative Analysis FRQ (AP Gov)',
  'inference':      'Inference FRQ (AP Stats)',
  'investigative':  'Investigative Task (AP Stats long FRQ)',
  'modeling':       'Modeling FRQ (AP Precalc/Stats/Macro)',
  'other':          'Other FRQ Format',
};

// Knowledge cache
let knowledgeCache = {
  loaded: false,
  brain: null,
  perExam: {},
};

async function loadKnowledge() {
  if (knowledgeCache.loaded) return knowledgeCache;
  try {
    const apDir = join(__dirname, '..', 'knowledge-base', 'ap-exams');
    try {
      knowledgeCache.brain = await fs.readFile(join(apDir, '_brain.md'), 'utf8');
    } catch { knowledgeCache.brain = ''; }
    for (const [examKey, cfg] of Object.entries(SUPPORTED_EXAMS)) {
      if (!cfg.file) continue;
      try {
        knowledgeCache.perExam[examKey] = await fs.readFile(join(apDir, cfg.file), 'utf8');
      } catch { knowledgeCache.perExam[examKey] = ''; }
    }
    knowledgeCache.loaded = true;
    console.log('[ApCoach] Knowledge loaded — brain ' + (knowledgeCache.brain?.length || 0) + ' bytes, ' + Object.keys(knowledgeCache.perExam).filter(k => knowledgeCache.perExam[k]).length + ' per-exam files');
  } catch (err) {
    console.warn('[ApCoach] Knowledge load failed:', err.message);
  }
  return knowledgeCache;
}

// Pre-load at module init (non-blocking)
loadKnowledge().catch(err => console.warn('[ApCoach] init load failed:', err.message));

function buildKnowledgeInjection(exam) {
  const cache = knowledgeCache;
  const blocks = [];
  // Per-exam strategic insights (highest priority — direct rubric + differentiator)
  if (exam && cache.perExam[exam]) {
    blocks.push('=== PER-EXAM STRATEGIC INSIGHTS ===\n' + cache.perExam[exam]);
  }
  // Universal patterns from brain file (sections 2 + 6 are most relevant)
  if (cache.brain) {
    // Pull the universal pedagogy patterns + per-exam table from brain file
    const universalSection = cache.brain.match(/## 6\. CONTENT PATTERNS[\s\S]*?(?=\n## 7\.|\n---)/);
    const pedagogySection = cache.brain.match(/## 9\. PEDAGOGY PRINCIPLES[\s\S]*?(?=\n## 10\.|\n---)/);
    if (universalSection) blocks.push('=== UNIVERSAL CONTENT PATTERNS ===\n' + universalSection[0]);
    if (pedagogySection) blocks.push('=== PEDAGOGY PRINCIPLES ===\n' + pedagogySection[0]);
  }
  return blocks.join('\n\n');
}

/**
 * Score a free-response answer against the AP rubric for the given exam.
 *
 * REVAMP V2: PATCH154 AP ATTACHMENTS - now accepts an optional attachments array
 * so students can attach reference material from any source: photos of paper
 * textbook passages (image/*), full PDF chapters (application/pdf), or text
 * snippets (.txt / .md / .csv / source code / pasted notes). Each attachment is
 * routed to the correct Claude content block type:
 *   - kind:'image' -> image block (vision)
 *   - kind:'document' -> document block (native PDF understanding)
 *   - kind:'text' -> inline text block bracketed with the filename
 *
 * @param {string} exam - one of SUPPORTED_EXAMS keys
 * @param {string} frqType - one of FRQ_TYPES keys
 * @param {string} prompt - the FRQ prompt the student responded to
 * @param {string} response - the student's response
 * @param {Array<object>} [attachments] - optional array of reference attachments.
 *        Each attachment shape:
 *          { kind:'image',    mediaType:'image/jpeg', data:'<base64>', name?:string }
 *          { kind:'document', mediaType:'application/pdf', data:'<base64>', name?:string }
 *          { kind:'text',     mediaType:'text/plain', text:'<raw>', name?:string }
 * @returns {Promise<{success: boolean, score?: object, error?: string, tokensUsed?: number}>}
 */
export async function scoreFrq(exam, frqType, prompt, response, attachments, userProfile) {
  const startTime = Date.now();
  await loadKnowledge();

  const examCfg = SUPPORTED_EXAMS[exam];
  if (!examCfg) {
    return { success: false, error: 'Unsupported exam: ' + exam };
  }
  if (!FRQ_TYPES[frqType]) {
    return { success: false, error: 'Unsupported FRQ type: ' + frqType };
  }

  const knowledgeInjection = buildKnowledgeInjection(exam);

  // PATCH158-fix: include user's saved Game Plan in scoring system context.
  // HOISTED to top of fn because the systemPrompt array (built below)
  // references _profileLines; placing the declaration after the array hit a
  // temporal-dead-zone ReferenceError, which the outer catch surfaced as a
  // generic 'Internal server error' on every FRQ score call. Same class as
  // patch 124 (undeclared options ref). node --check can't see it because
  // the JS is syntactically valid; only runtime execution surfaces TDZ.
  let _profileLines = '';
  if (userProfile && typeof userProfile === 'object') {
    const _bits = [];
    if (Array.isArray(userProfile.exams) && userProfile.exams.length > 0) {
      _bits.push('targeting ' + userProfile.exams.slice(0, 12).map(s => (s || '').replace(/^ap-/, 'AP ').replace(/-/g, ' ')).filter(Boolean).join(', '));
    }
    const _ts = parseInt(userProfile.defaultTargetScore, 10);
    if (Number.isFinite(_ts) && _ts >= 1 && _ts <= 5) _bits.push('default target score ' + _ts);
    const _hrs = parseInt(userProfile.hoursPerWeek, 10);
    if (Number.isFinite(_hrs) && _hrs > 0 && _hrs <= 80) _bits.push(_hrs + ' hrs/week');
    if (_bits.length > 0) _profileLines = '\n=== USER GAME PLAN ===\n' + _bits.join(' | ');
  }


  const systemPrompt = [
    (_profileLines ? _profileLines + '\n\n' : '') + 'You are an AP Score Coach for ' + examCfg.label + '. You score student responses to free-response questions against the official AP rubric and provide rubric-aware coaching feedback.',
    '',
    'You have access to Wayfinder\'s deep AP intelligence:',
    '',
    knowledgeInjection,
    '',
    '=== YOUR JOB ===',
    'Given the FRQ type, prompt, and student response, return a structured JSON evaluation. Identify which rubric points were earned, which were missed, and what specifically would push the response from a 4-zone to a 5-zone (or 3 to 4, etc.). Use the per-exam differentiator (e.g., particulate-level reasoning for Chem, specificity for APUSH, commentary depth for Lang, chain of reasoning for Macro, STATE-PLAN-DO-CONCLUDE in context for Stats, the constitutional clause for Gov).',
    '',
    'You MUST return ONLY valid JSON in this exact shape (no markdown, no surrounding prose):',
    '{',
    '  "rubricPointsEarned": <number>,',
    '  "rubricPointsTotal": <number>,',
    '  "scoreLabel": "<one of: Below Floor | Floor | Mid | Strong | Exceptional>",',
    '  "summary": "<2-3 sentence holistic assessment>",',
    '  "rubricBreakdown": [',
    '    { "criterion": "<name of rubric point>", "earned": <bool>, "evidence": "<specific quote or claim from response>", "feedback": "<what they got right OR what is missing>" }',
    '  ],',
    '  "topThreeFixes": [',
    '    { "fix": "<specific actionable change>", "rubricImpact": "<which rubric point this earns>", "exampleRevision": "<concrete revision sentence>" }',
    '  ],',
    '  "whatAFiveWouldAdd": "<the specific differentiator move that pushes this to a 5: specificity, commentary depth, chain of reasoning, etc. — NAME the move and give a concrete example tied to this response>",',
    '  "phrasesThatScore": [',
    '    "<exact phrase the student should adopt verbatim, drawn from rubric-pleasing language for this exam>"',
    '  ],',
    '  "voiceFlag": "<empty string OR \'over-coached\' OR \'too-generic\' OR \'specific-and-strong\'>"',
    '}',
    '',
    '=== SCORING DISCIPLINE ===',
    '- PATCH163 MANDATORY PER-PART AUDIT (do this FIRST, before any other reasoning):',
    '  1. Read the prompt and count the discrete tasks it requires. APUSH SAQ prompts are typically Part A / B / C. AP Lang argument essays require thesis + evidence + reasoning + sophistication. AP Bio FRQs may have parts (a) through (e). Identify the exact set of rubric points available.',
    '  2. For EACH part, search the student response for an answer that explicitly addresses it. The response must directly answer that part -- content that merely touches the same topic does NOT count.',
    '  3. If the student did NOT write an answer for a part, mark that rubric criterion with earned:false and award ZERO points for it. Do NOT charitably assume credit. Do NOT imagine content the student did not write. Do NOT extrapolate Part C from a strong Part B.',
    '  4. rubricPointsEarned MUST equal the count of earned:true criteria in rubricBreakdown. Recheck this before returning. A response that addresses 2 of 3 required parts earns exactly 2/3 -- never 3/3.',
    '  5. scoreLabel reflects the actual ratio: 0% earned = Below Floor, 1-39% = Floor, 40-69% = Mid, 70-89% = Strong, 90-100% = Exceptional. A response missing any required part CANNOT be Exceptional.',
    '  6. The summary field MUST acknowledge any missing parts by name (e.g. "Part C is entirely missing"). topThreeFixes MUST include writing the missing part as a fix if any part is missing.',
    '',
    '- Be honest and rubric-aware. Most student first drafts are 50-70% of max points.',
    '- Specificity wins (APUSH/Lang/Gov). Generic claims with no names/dates/specifics earn 0.',
    '- For physics/chem/precalc: showing symbolic algebra before numbers is the differentiator.',
    '- For Stats: every conclusion must reference the SPECIFIC variable + population + units.',
    '- For Macro: count chain-of-reasoning links explicitly.',
    '- Quote actual phrases from the student response in "evidence" fields.',
    '- Top three fixes must be ACTIONABLE — not "be more specific" but "name the specific Hull House example like Jane Addams in Chicago, 1889".',
  ].join('\n');

  // REVAMP V2: PATCH154 AP ATTACHMENTS - split user prompt into pre/post halves
  // so reference material (images / PDFs / text snippets) can sit between
  // PROMPT and STUDENT RESPONSE in the content array. Claude sees:
  // prompt context -> attachments -> student response.
  const userPromptHead = [
    '=== EXAM ===',
    examCfg.label,
    '',
    '=== FRQ TYPE ===',
    FRQ_TYPES[frqType],
    '',
    '=== PROMPT ===',
    prompt || '(no prompt provided — score on response merits alone)',
  ].join('\n');

  const userPromptTail = [
    '',
    '=== STUDENT RESPONSE ===',
    response,
    '=== END RESPONSE ===',
    '',
    'Score this response. Return ONLY the JSON object.',
  ].join('\n');

  // Build content: text head + (optional) attachment blocks + text tail
  const valid = Array.isArray(attachments)
    ? attachments.filter(a => a && typeof a === 'object' && (a.kind === 'image' || a.kind === 'document' || a.kind === 'text'))
    : [];
  let userContent;
  if (valid.length > 0) {
    userContent = [{ type: 'text', text: userPromptHead + '\n\n=== REFERENCE MATERIAL (paper textbook passages, charts, question stems, snippets, stimulus material the student is responding to) ===' }];
    for (const a of valid) {
      const _name = (typeof a.name === 'string' && a.name) ? a.name.slice(0, 120) : null;
      if (a.kind === 'image' && typeof a.mediaType === 'string' && typeof a.data === 'string' && a.data) {
        if (_name) userContent.push({ type: 'text', text: '[' + _name + ']' });
        userContent.push({
          type: 'image',
          source: { type: 'base64', media_type: a.mediaType, data: a.data },
        });
      } else if (a.kind === 'document' && typeof a.data === 'string' && a.data) {
        // PATCH162: try server-side text extraction first. Cuts tokens ~5x
        // and avoids size limits entirely. Scanned PDFs fall back to vision.
        const _extracted = await tryExtractPdfText(a.data, _name);
        if (_extracted) {
          const _label = _name ? ('[' + _name + ' -- extracted PDF text]') : '[PDF reference -- extracted text]';
          userContent.push({ type: 'text', text: _label + '\n' + _extracted + '\n[end of ' + (_name || 'PDF') + ']' });
        } else {
          // Scanned PDF / extraction failed / pdf-parse missing -- send as native PDF block
          if (_name) userContent.push({ type: 'text', text: '[' + _name + ']' });
          userContent.push({
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: a.data },
          });
        }
      } else if (a.kind === 'text' && typeof a.text === 'string' && a.text) {
        const label = _name ? '[' + _name + ']' : '[reference snippet]';
        userContent.push({ type: 'text', text: label + '\n' + a.text + '\n[end of ' + (_name || 'snippet') + ']' });
      }
    }
    userContent.push({ type: 'text', text: userPromptTail });
  } else {
    // No attachments - keep behavior identical to pre-patch154 (single text block)
    userContent = userPromptHead + userPromptTail;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);
  let resp;
  try {
    resp = await client.messages.create({
      model: process.env.CLAUDE_MODEL_ENGINE || process.env.CLAUDE_MODEL || 'claude-opus-4-7',
      max_tokens: 2500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }, { signal: controller.signal });
  } catch (err) {
    return { success: false, error: 'AI request failed: ' + err.message };
  } finally {
    clearTimeout(timeout);
  }

  const text = resp.content?.[0]?.text || '';
  const tokensUsed = (resp.usage?.input_tokens || 0) + (resp.usage?.output_tokens || 0);

  // Parse JSON resilient to LLM quirks
  const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '');
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) {
    return { success: false, error: 'No JSON in model output' };
  }
  let jsonStr = match[0].replace(/,\s*([\]}])/g, '$1');
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    return { success: false, error: 'JSON parse failed: ' + err.message };
  }

  // Validate score structure
  if (typeof parsed.rubricPointsEarned !== 'number' || typeof parsed.rubricPointsTotal !== 'number') {
    return { success: false, error: 'Invalid score structure (missing rubric points)' };
  }
  parsed.rubricPointsEarned = Math.max(0, Math.min(parsed.rubricPointsTotal, parsed.rubricPointsEarned));

  const latencyMs = Date.now() - startTime;
  return { success: true, score: parsed, tokensUsed, latencyMs };
}

export function getApExams() {
  return Object.entries(SUPPORTED_EXAMS).map(([key, cfg]) => ({ key, label: cfg.label }));
}

export function getFrqTypes() {
  return Object.entries(FRQ_TYPES).map(([key, label]) => ({ key, label }));
}

// REVAMP V2: PATCH155 AP SPELLCHECK - cheap Haiku-backed spellcheck for FRQ responses.
// SCOPE: spelling + capitalization ONLY. NOT grammar, NOT style, NOT punctuation.
// Keeps the user voice fully intact. Returns the corrected text + a count of changes.
export async function spellcheckText(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return { success: false, error: 'Empty text.' };
  }
  if (text.length > 14000) {
    return { success: false, error: 'Text too long for spellcheck (max 14k chars).' };
  }
  const haikuModel = process.env.CLAUDE_MODEL_HAIKU || 'claude-haiku-4-5-20251001';
  const systemPrompt = [
    'You are a SPELLING + CAPITALIZATION corrector. Your ONLY job is to fix:',
    '  1. Misspelled words (typos, transpositions, missing/extra letters).',
    '  2. Wrong capitalization (proper nouns lowercased, sentence-starts lowercased,',
    '     all-caps mid-sentence words that should not be).',
    '',
    'YOU MUST NOT:',
    '  - Fix grammar (subject-verb agreement, tense, articles, prepositions).',
    '  - Reword anything for style or clarity.',
    '  - Change punctuation (commas, semicolons, dashes, ellipses).',
    '  - Reformat paragraphs, line breaks, or whitespace.',
    '  - Substitute synonyms.',
    '  - Expand contractions or change tone.',
    '',
    'Preserve every line break, indent, and punctuation mark exactly. Touch ONLY misspelled',
    'words and capitalization errors. Domain terms specific to AP exams (VSEPR, FRQ, APUSH,',
    'SCOTUS, etc.) are correctly spelled - do NOT "correct" them.',
    '',
    'Return ONLY a JSON object with this exact shape, no markdown fences, no prose:',
    '{',
    '  "correctedText": "<full text with spelling+capitalization fixes applied>",',
    '  "corrections": [',
    '    { "from": "<original misspelled token>", "to": "<corrected token>" }',
    '  ]',
    '}',
    '',
    'If there are NO spelling/capitalization errors, return the input as correctedText with an empty corrections array.',
  ].join('\n');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  let resp;
  try {
    resp = await client.messages.create({
      model: haikuModel,
      max_tokens: Math.min(4000, Math.ceil(text.length / 2) + 600),
      system: systemPrompt,
      messages: [{ role: 'user', content: 'TEXT TO CHECK:\n' + text }],
    }, { signal: controller.signal });
  } catch (err) {
    return { success: false, error: 'Spellcheck request failed: ' + err.message };
  } finally {
    clearTimeout(timeout);
  }
  const out = resp.content?.[0]?.text || '';
  const stripped = out.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '');
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) return { success: false, error: 'No JSON in spellcheck output.' };
  let parsed;
  try { parsed = JSON.parse(match[0].replace(/,\s*([\]}])/g, '$1')); }
  catch (e) { return { success: false, error: 'Spellcheck JSON parse failed: ' + e.message }; }
  if (typeof parsed.correctedText !== 'string') {
    return { success: false, error: 'Spellcheck response missing correctedText.' };
  }
  const corrections = Array.isArray(parsed.corrections) ? parsed.corrections.filter(c =>
    c && typeof c.from === 'string' && typeof c.to === 'string' && c.from !== c.to
  ) : [];
  return { success: true, correctedText: parsed.correctedText, corrections, count: corrections.length };
}
