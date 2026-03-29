/**
 * Wayfinder Retrieval Engine v2 — BM25 + Semantic Scoring
 *
 * WHY THIS EXISTS:
 * The v1 retrieval system used keyword-based category routing:
 *   - Each category had a fixed trigger word list
 *   - A query matched categories by counting trigger hits
 *   - All chunks from matched categories were candidates
 *
 * This DOESN'T SCALE. As the database grows:
 *   - More keywords = more false positive category matches
 *   - More categories = more irrelevant context pulled
 *   - Token usage grows proportionally with database size
 *   - The system gets WORSE, not better, as it grows
 *
 * THE FIX: Score-based retrieval using BM25 (Okapi BM25).
 * Instead of "does this category match?", we score EVERY chunk
 * against the query and only take the top-K most relevant.
 * As the database grows from 100 to 10,000 chunks, we still
 * only retrieve top-K. Token usage stays constant.
 *
 * BM25 is the same algorithm used by Elasticsearch, Lucene,
 * and most production search engines. It accounts for:
 *   - Term frequency (how often a term appears in a chunk)
 *   - Inverse document frequency (rare terms matter more)
 *   - Document length normalization (don't bias toward long chunks)
 *
 * ARCHITECTURE:
 *   1. At startup: build an inverted index from all chunks
 *   2. At query time: tokenize → score via BM25 → rank → return top-K
 *   3. Entity boost: detected school names, career fields get score multipliers
 *   4. Recency boost: freshly distilled content ranks slightly higher
 *   5. Adaptive budget: query complexity determines how many tokens to spend
 *   6. Semantic cache: similar queries reuse previously assembled contexts
 *
 * SCALING PROPERTIES:
 *   - Index build: O(total_tokens) — done once at startup, cached
 *   - Query scoring: O(query_terms × avg_postings) — fast, sublinear in DB size
 *   - Context assembly: O(K) — always constant regardless of DB size
 *   - Memory: O(unique_terms × avg_postings) — ~10-50MB for typical corpus
 */

// ─── BM25 Parameters ────────────────────────────────────────────
// These are tuned for advisory/educational content.
// k1 controls term frequency saturation (higher = more weight to repeated terms)
// b controls length normalization (0 = no normalization, 1 = full normalization)

const BM25_K1 = 1.5;    // Standard value — good balance for mixed-length chunks
const BM25_B = 0.75;    // Standard value — moderate length normalization

// ─── Stop Words ─────────────────────────────────────────────────
// Comprehensive stop word list — these are never indexed or queried
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
  'those', 'it', 'its', 'they', 'them', 'their', 'we', 'us', 'our',
  'you', 'your', 'i', 'my', 'me', 'he', 'she', 'him', 'her', 'his',
  'not', 'no', 'so', 'if', 'as', 'than', 'then', 'also', 'just',
  'more', 'most', 'some', 'any', 'all', 'each', 'every', 'both',
  'such', 'when', 'where', 'how', 'what', 'which', 'who', 'whom',
  'about', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'between', 'under', 'over', 'out', 'up', 'down', 'very',
  'want', 'need', 'know', 'think', 'tell', 'help', 'like', 'good',
  'best', 'get', 'make', 'going', 'looking', 'trying', 'really',
  'many', 'much', 'well', 'way', 'even', 'still', 'here', 'there',
  'only', 'other', 'new', 'now', 'back', 'two', 'thing', 'things'
]);

// ─── Entity Dictionaries ────────────────────────────────────────
// Known entities get boosted during scoring — these are high-signal terms
// that strongly indicate what the user is asking about.

const SCHOOL_ENTITIES = new Set([
  'harvard', 'yale', 'princeton', 'stanford', 'mit', 'columbia', 'penn',
  'cornell', 'brown', 'dartmouth', 'duke', 'northwestern', 'caltech',
  'uchicago', 'georgetown', 'vanderbilt', 'rice', 'emory', 'notre dame',
  'usc', 'nyu', 'berkeley', 'ucla', 'umich', 'uva', 'unc',
  'georgia tech', 'carnegie mellon', 'johns hopkins', 'wash u', 'wustl',
  'tufts', 'tulane', 'boston college', 'boston university', 'northeastern',
  'purdue', 'ohio state', 'penn state', 'rutgers', 'uw', 'wisconsin',
  'michigan', 'virginia', 'florida', 'texas', 'illinois',
  'williams', 'amherst', 'swarthmore', 'wellesley', 'bowdoin', 'pomona',
  'claremont mckenna', 'harvey mudd', 'carleton', 'middlebury',
  'colgate', 'hamilton', 'davidson', 'grinnell', 'haverford', 'colby',
  'bates', 'wesleyan', 'wake forest', 'william mary', 'clemson',
  'virginia tech', 'smu', 'pepperdine', 'villanova', 'lehigh',
  'uc davis', 'uc irvine', 'ucsd', 'uc santa barbara', 'umass',
  'stony brook', 'uconn', 'colorado', 'iowa', 'oregon', 'indiana',
  'nc state', 'texas a&m', 'arizona state', 'pitt', 'drexel', 'rpi',
  'case western', 'rochester', 'brandeis', 'fordham', 'gw',
  'santa clara', 'stevens', 'richmond', 'miami',
  // Additional T25-T100 schools
  'washington', 'colorado school of mines', 'baylor', 'marquette',
  'loyola', 'creighton', 'gonzaga', 'santa clara', 'chapman',
  'elon', 'furman', 'denison', 'kenyon', 'oberlin', 'reed',
  'macalester', 'st olaf', 'whitman', 'colorado college',
  'connecticut college', 'skidmore', 'union', 'bucknell',
  'lafayette', 'gettysburg', 'dickinson', 'franklin marshall',
  // State flagship additions
  'uga', 'lsu', 'alabama', 'auburn', 'tennessee', 'arkansas',
  'mississippi', 'ole miss', 'kentucky', 'missouri', 'kansas',
  'oklahoma', 'nebraska', 'iowa state', 'utah', 'byu',
  'new mexico', 'hawaii', 'wyoming', 'montana', 'idaho',
  'maine', 'vermont', 'new hampshire', 'delaware', 'west virginia',
  'north dakota', 'south dakota',
  // HBCUs
  'howard', 'spelman', 'morehouse', 'hampton', 'tuskegee',
  'fisk', 'xavier', 'clark atlanta', 'nc a&t', 'florida a&m',
  // International
  'oxford', 'cambridge', 'toronto', 'mcgill', 'ubc',
  'imperial', 'lse', 'edinburgh', 'st andrews', 'ucl',
  'nus', 'ntu', 'eth zurich', 'epfl', 'melbourne',
  'sydney', 'anu', 'hku', 'tsinghua', 'peking'
]);

const CAREER_ENTITIES = new Set([
  'software', 'engineering', 'engineer', 'developer', 'programming',
  'data science', 'machine learning', 'artificial intelligence',
  'medicine', 'doctor', 'physician', 'nurse', 'nursing', 'premed',
  'law', 'lawyer', 'attorney', 'legal',
  'finance', 'banking', 'investment', 'consulting', 'analyst',
  'accounting', 'cpa', 'actuarial', 'quant',
  'marketing', 'advertising', 'product management',
  'teaching', 'education', 'professor',
  'research', 'scientist', 'biology', 'chemistry', 'physics',
  'architecture', 'design', 'ux',
  'journalism', 'media', 'communications',
  'psychology', 'therapy', 'counseling', 'social work',
  'pharmacy', 'dental', 'veterinary',
  'trades', 'electrician', 'plumber', 'hvac', 'welding', 'carpentry',
  'cybersecurity', 'cloud', 'devops', 'infrastructure',
  'entrepreneurship', 'startup', 'business',
  // Additional career fields
  'project management', 'supply chain', 'logistics', 'operations',
  'human resources', 'hr', 'recruiting', 'talent',
  'real estate', 'insurance', 'underwriting',
  'biotech', 'pharmaceutical', 'biomedical',
  'environmental', 'sustainability', 'climate',
  'aerospace', 'mechanical', 'civil engineering', 'chemical engineering',
  'industrial', 'manufacturing', 'quality',
  'film', 'entertainment', 'music', 'gaming',
  'sports', 'athletics', 'coaching',
  'nonprofit', 'philanthropy', 'social impact',
  'diplomat', 'foreign service', 'intelligence',
  'actuary', 'underwriter', 'claims',
  'paralegal', 'compliance', 'regulatory',
  'data analyst', 'business analyst', 'systems analyst',
  'network engineer', 'database', 'blockchain',
  'robotics', 'automation', 'iot',
  'technical writer', 'content', 'copywriting',
  'urban planning', 'public administration',
  'librarian', 'museum', 'curator',
  'pilot', 'aviation', 'maritime',
  // Graduate programs (career-focused)
  'mba', 'masters', 'phd', 'doctorate',
  'graduate degree', 'professional degree', 'advanced degree',
  // Trades careers
  'electrician', 'plumber', 'hvac', 'welder', 'carpenter',
  'pipefitter', 'journeyman', 'apprentice', 'trade worker',
  'skilled trade', 'blue collar', 'union job',
  'construction', 'electrical work', 'heating cooling',
  // Military careers
  'military', 'veteran', 'armed forces', 'army', 'navy', 'marines',
  'air force', 'military service', 'military officer',
  'military job', 'mos', 'occupational specialty',
  'service academy', 'rotc', 'military branch',
  // Medical career paths
  'residency', 'fellowship', 'medical residency',
  'medical training', 'clinical training', 'postgraduate training',
  // International career focus
  'international work', 'overseas work', 'expat', 'global career',
  'foreign work', 'international employment'
]);

const ADMISSIONS_ENTITIES = new Set([
  'admissions', 'admission', 'acceptance', 'accepted', 'rejected',
  'waitlist', 'waitlisted', 'deferred', 'essay', 'essays',
  'extracurricular', 'recommendation', 'gpa', 'sat', 'act',
  'early decision', 'early action', 'regular decision',
  'common app', 'coalition', 'supplement', 'supplemental',
  'financial aid', 'fafsa', 'scholarship', 'merit',
  'decision date', 'notification', 'ivy day',
  'demographics', 'diversity', 'ethnicity',
  'ed', 'ea', 'rea', 'scea', 'ed2', 'rd',
  'reach', 'target', 'safety', 'likely',
  'yield', 'acceptance rate', 'selectivity',
  // Graduate program admissions
  'graduate admission', 'grad admission', 'masters admission',
  'mba admission', 'jd admission', 'md admission',
  'gre', 'gmat', 'lsat', 'mcat',
  'graduate gpa', 'bachelor degree', 'undergraduate gpa',
  'personal statement', 'research experience', 'clinical experience',
  'recommendation letter', 'letters of recommendation',
  'professional school', 'professional program',
  'application essay', 'application essays',
  // International admissions
  'international admission', 'visa requirement', 'student visa',
  'english requirement', 'language requirement',
  'toefl', 'ielts', 'english proficiency',
  // Financial aid (admissions context)
  'financial aid package', 'tuition assistance', 'funding',
  'merit scholarship', 'need based', 'grant', '529',
]);


// ─── Synonym Expansion ──────────────────────────────────────────
// Maps common terms to their synonyms for better recall.
// When a user says "developer", BM25 should also match chunks containing "engineer".
const SYNONYM_MAP = new Map([
  // Tech careers
  ['developer', ['engineer', 'programmer', 'coder', 'dev']],
  ['engineer', ['developer', 'programmer']],
  ['programmer', ['developer', 'engineer', 'coder']],
  ['coder', ['developer', 'programmer']],
  ['software', ['tech', 'programming', 'coding']],
  ['ai', ['artificial_intelligence', 'machine_learning', 'ml']],
  ['ml', ['machine_learning', 'artificial_intelligence', 'ai']],
  ['devops', ['sre', 'infrastructure', 'cloud']],
  ['cybersecurity', ['infosec', 'security']],
  ['infosec', ['cybersecurity', 'security']],

  // Healthcare
  ['doctor', ['physician', 'md']],
  ['physician', ['doctor', 'md']],
  ['nurse', ['nursing', 'rn', 'bsn']],
  ['therapist', ['counselor', 'therapy']],
  ['premed', ['pre-med', 'medicine']],
  ['md', ['medical_degree', 'doctor', 'physician']],
  ['mcat', ['medical_school_test', 'med_school_exam']],

  // Finance
  ['banking', ['finance', 'investment']],
  ['consulting', ['consultant', 'advisory']],
  ['accounting', ['accountant', 'cpa']],
  ['actuarial', ['actuary']],

  // Education
  ['college', ['university', 'school']],
  ['university', ['college', 'school']],
  ['major', ['concentration', 'field', 'discipline']],
  ['masters', ['graduate', 'grad', 'master_degree']],
  ['mba', ['business_school', 'business_degree', 'graduate_business']],
  ['phd', ['doctorate', 'doctoral', 'graduate', 'grad_school']],
  ['jd', ['law_degree', 'law_school', 'graduate_law']],
  ['gre', ['graduate_school_test', 'grad_test']],
  ['gmat', ['business_school_test', 'mba_test']],
  ['lsat', ['law_school_test']],
  ['graduate', ['grad', 'grad_school', 'graduate_program', 'graduate_school']],
  ['tuition', ['cost', 'price', 'fees']],
  ['scholarship', ['merit', 'financial_aid', 'grant', 'merit_aid']],
  ['financial_aid', ['fafsa', 'scholarship', 'grant', 'aid', 'aid_package', 'merit_aid', 'need_based_aid']],
  ['grant', ['free_money', 'gift_aid', 'financial_aid']],
  ['loan', ['student_debt', 'education_loan', 'student_loan']],
  ['fafsa', ['federal_aid', 'financial_aid_form']],
  ['529', ['education_savings', 'savings_plan', 'college_savings']],

  // Admissions
  ['acceptance', ['admission', 'admissions']],
  ['waitlist', ['waitlisted', 'deferred']],
  ['essay', ['personal_statement', 'supplement', 'supplemental']],
  ['extracurricular', ['activities', 'clubs', 'ecs']],
  ['recommendation', ['rec', 'letter']],

  // Career transitions
  ['career_change', ['career_switch', 'pivot', 'transition']],
  ['pivot', ['transition', 'switch', 'career_change']],
  ['bootcamp', ['coding_bootcamp', 'intensive', 'accelerated']],

  // Job search
  ['resume', ['cv', 'curriculum_vitae']],
  ['interview', ['behavioral', 'technical_interview']],
  ['internship', ['intern', 'co-op', 'coop']],
  ['salary', ['compensation', 'pay', 'wages', 'earnings']],
  ['compensation', ['salary', 'pay', 'total_comp']],

  // Trades
  ['trades', ['skilled_labor', 'vocational', 'apprenticeship', 'skilled_trades', 'trade_school']],
  ['apprenticeship', ['apprentice', 'apprentice_program', 'trades', 'journeyman']],
  ['electrician', ['electrical_worker', 'electrical_trade', 'lineman']],
  ['plumber', ['pipefitter', 'plumbing_trade']],
  ['hvac', ['heating_cooling', 'heating_and_cooling', 'climate_control']],
  ['welding', ['welder', 'welding_trade']],
  ['welder', ['welding', 'welding_technician']],
  ['union', ['organized_labor', 'labor_union', 'union_job']],
  ['journeyman', ['journey_worker', 'skilled_trade_worker']],

  // Military
  ['military', ['armed_forces', 'military_service', 'service_member']],
  ['veteran', ['vet', 'military_veteran', 'service_member']],
  ['gi_bill', ['veteran_education_benefit', 'education_benefit']],
  ['mos', ['military_job', 'military_occupational_specialty']],
  ['skillbridge', ['military_internship', 'military_transition_program']],
  ['clearance', ['security_clearance', 'military_clearance']],
  ['rotc', ['reserve_officers_training_corps', 'military_training']],

  // International
  ['study_abroad', ['overseas_study', 'international_study', 'abroad']],
  ['visa', ['student_visa', 'visa_requirement', 'visa_process']],
  ['ucas', ['uk_application', 'uk_admissions', 'british_universities']],
  ['toefl', ['english_proficiency_test', 'english_language_test']],
  ['ielts', ['english_proficiency', 'english_test']],
  ['international', ['international_student', 'overseas', 'foreign_student']],
  ['coop', ['cooperative_education', 'work_integrated_learning', 'internship']],
  ['co-op', ['cooperative_education', 'coop', 'internship']],

  // Residency (medical training)
  ['residency', ['medical_residency', 'medical_training', 'post_graduate_training']],
]);

// ─── Tokenizer ──────────────────────────────────────────────────

/**
 * Tokenize text into normalized terms suitable for indexing/querying.
 * Handles:
 * - Lowercasing
 * - Punctuation removal (preserving hyphens in compound words)
 * - Stop word removal
 * - Minimum length filtering
 * - Bigram generation for known multi-word entities
 * - Optional synonym expansion for better query recall
 */
function tokenize(text, { expandSynonyms = false } = {}) {
  if (!text) return [];

  const lower = text.toLowerCase();

  // Extract bigrams first (e.g., "early decision", "machine learning")
  const bigrams = [];
  const bigramPatterns = [
    'early decision', 'early action', 'regular decision', 'financial aid',
    'machine learning', 'data science', 'artificial intelligence',
    'computer science', 'software engineering', 'product management',
    'investment banking', 'private equity', 'venture capital',
    'decision date', 'decision dates', 'acceptance rate', 'graduation rate',
    'common app', 'social work', 'public health', 'first generation',
    'study abroad', 'test optional', 'merit aid', 'need blind',
    'georgia tech', 'carnegie mellon', 'johns hopkins', 'notre dame',
    'wake forest', 'virginia tech', 'penn state', 'ohio state',
    'boston college', 'boston university', 'uc berkeley', 'uc davis',
    'nc state', 'texas a&m', 'arizona state', 'case western',
    'harvey mudd', 'claremont mckenna', 'william mary', 'santa clara',
    'stony brook',
    // Graduate programs
    'graduate school', 'grad school', 'business school', 'law school',
    'medical school', 'med school', 'professional school',
    'graduate program', 'masters program', 'phd program',
    'mba admission', 'jd admission', 'md admission',
    'business school test', 'law school test', 'medical school test',
    // Trades
    'trade school', 'skilled trade', 'apprentice program', 'journey worker',
    'blue collar', 'vocational training', 'skilled labor', 'union job',
    'electrical worker', 'pipefitter', 'heating cooling',
    // Military
    'military service', 'service member', 'armed forces',
    'gi bill', 'military career', 'service academy',
    'military internship', 'security clearance', 'military job',
    'military occupational', 'military transition',
    // International
    'international student', 'student visa', 'international education',
    'study abroad', 'overseas study', 'international admissions',
    'english proficiency', 'language requirement', 'uk application',
    'cooperative education', 'work integrated',
    // Financial aid
    'financial aid', 'aid package', 'merit aid', 'merit scholarship',
    'need based', 'need based aid', 'education savings',
    'federal aid', 'expected family', 'family contribution',
    // Medical/Health
    'medical residency', 'medical training', 'post graduate training',
  ];

  for (const bg of bigramPatterns) {
    if (lower.includes(bg)) {
      bigrams.push(bg.replace(/\s+/g, '_'));
    }
  }

  // Single-word tokens
  const words = lower
    .replace(/[^a-z0-9\s\-']/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w));

  // Synonym expansion (only for queries, not for indexing)
  if (expandSynonyms) {
    const expanded = [];
    for (const word of words) {
      const syns = SYNONYM_MAP.get(word);
      if (syns) {
        for (const syn of syns) {
          if (!words.includes(syn) && !expanded.includes(syn)) {
            expanded.push(syn);
          }
        }
      }
    }
    // Also check bigrams for expansion
    for (const bg of bigrams) {
      const syns = SYNONYM_MAP.get(bg);
      if (syns) {
        for (const syn of syns) {
          if (!bigrams.includes(syn) && !expanded.includes(syn)) {
            expanded.push(syn);
          }
        }
      }
    }
    return [...bigrams, ...words, ...expanded];
  }

  return [...bigrams, ...words];
}

// ─── Inverted Index ─────────────────────────────────────────────

/**
 * Build an inverted index from a flat array of chunks.
 *
 * Each chunk should have: { id, text, source, category, boost }
 *
 * Returns: {
 *   postings: Map<term, [{docId, tf}]>,     // term → documents containing it
 *   docLengths: Map<docId, number>,          // document lengths for normalization
 *   avgDocLength: number,                     // average document length
 *   totalDocs: number,                        // total number of documents
 *   idf: Map<term, number>,                   // pre-computed IDF scores
 *   chunks: Map<docId, chunk>                 // doc ID → chunk data
 * }
 */
function buildInvertedIndex(chunks) {
  const postings = new Map();     // term → [{docId, tf}]
  const docLengths = new Map();   // docId → length
  const chunkMap = new Map();     // docId → chunk

  let totalLength = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const docId = i;
    chunkMap.set(docId, chunk);

    // Tokenize the chunk text + any keywords
    const textTokens = tokenize(chunk.text || '');
    const keywordTokens = tokenize((chunk.keywords || []).join(' '));

    // Keywords are indexed with 2x weight (they appear twice in the term frequency)
    const allTokens = [...textTokens, ...keywordTokens, ...keywordTokens];

    docLengths.set(docId, allTokens.length);
    totalLength += allTokens.length;

    // Count term frequencies
    const tf = new Map();
    for (const token of allTokens) {
      tf.set(token, (tf.get(token) || 0) + 1);
    }

    // Add to postings
    for (const [term, freq] of tf) {
      if (!postings.has(term)) postings.set(term, []);
      postings.get(term).push({ docId, tf: freq });
    }
  }

  const totalDocs = chunks.length;
  const avgDocLength = totalDocs > 0 ? totalLength / totalDocs : 1;

  // Pre-compute IDF for all terms
  const idf = new Map();
  for (const [term, docs] of postings) {
    // BM25 IDF formula: log((N - n + 0.5) / (n + 0.5) + 1)
    const n = docs.length;
    const idfScore = Math.log((totalDocs - n + 0.5) / (n + 0.5) + 1);
    idf.set(term, idfScore);
  }

  console.log(`  [BM25] Index built: ${totalDocs} docs, ${postings.size} unique terms, avg length: ${avgDocLength.toFixed(0)} tokens`);

  return { postings, docLengths, avgDocLength, totalDocs, idf, chunks: chunkMap };
}

// ─── BM25 Scoring ───────────────────────────────────────────────

/**
 * Score all documents against a query using BM25.
 *
 * @param {string} query - The user's question
 * @param {Object} index - The inverted index from buildInvertedIndex()
 * @param {Object} options - { topK, entityBoost, boostMap }
 * @returns {Array<{docId, score, chunk}>} Ranked results
 */
function scoreBM25(query, index, options = {}) {
  const {
    topK = 10,
    entityBoostFactor = 2.0,    // How much to boost entity matches
    layerBoosts = {}             // { 'distilled': 1.5, 'base': 1.0, 'raw': 0.8 }
  } = options;

  const queryTerms = tokenize(query, { expandSynonyms: true });
  if (queryTerms.length === 0) return [];

  // Classify which query terms are entities (high-signal)
  const entityTerms = new Set();
  for (const term of queryTerms) {
    const clean = term.replace(/_/g, ' ');
    if (SCHOOL_ENTITIES.has(clean) || CAREER_ENTITIES.has(clean) || ADMISSIONS_ENTITIES.has(clean)) {
      entityTerms.add(term);
    }
  }

  // Score each document
  const scores = new Map();

  for (const term of queryTerms) {
    const termPostings = index.postings.get(term);
    if (!termPostings) continue;

    const idfScore = index.idf.get(term) || 0;
    const isEntity = entityTerms.has(term);

    for (const { docId, tf } of termPostings) {
      const docLength = index.docLengths.get(docId) || 1;

      // BM25 term score
      const numerator = tf * (BM25_K1 + 1);
      const denominator = tf + BM25_K1 * (1 - BM25_B + BM25_B * (docLength / index.avgDocLength));
      let termScore = idfScore * (numerator / denominator);

      // Entity boost: entity terms get amplified
      if (isEntity) {
        termScore *= entityBoostFactor;
      }

      scores.set(docId, (scores.get(docId) || 0) + termScore);
    }
  }

  // Apply layer boosts (distilled > base > raw)
  for (const [docId, score] of scores) {
    const chunk = index.chunks.get(docId);
    if (chunk) {
      let layerBoost = 1.0;
      if (chunk.layer === 'distilled') layerBoost = layerBoosts.distilled || 1.5;
      else if (chunk.layer === 'base') layerBoost = layerBoosts.base || 1.0;
      else if (chunk.layer === 'raw') layerBoost = layerBoosts.raw || 0.8;

      // Also apply any per-chunk boost factor
      const chunkBoost = chunk.boostFactor || chunk.boost || 1.0;

      scores.set(docId, score * layerBoost * chunkBoost);
    }
  }

  // Sort by score, take top-K
  const ranked = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([docId, score]) => ({
      docId,
      score: Math.round(score * 1000) / 1000,
      chunk: index.chunks.get(docId)
    }));

  return ranked;
}

// ─── Query Analyzer ─────────────────────────────────────────────

/**
 * Analyze a query to extract intent, entities, and complexity.
 * This replaces the old keyword-based classifyIntent() and detectSpecificity().
 *
 * Returns: {
 *   intent: string,          // 'specific_lookup' | 'exploratory' | 'comparison' | 'strategic' | 'personal'
 *   domain: string,          // 'admissions' | 'career' | 'both' | 'general'
 *   entities: string[],      // Detected school names, career fields, etc.
 *   complexity: string,      // 'simple' | 'moderate' | 'complex'
 *   suggestedTopK: number,   // How many chunks to retrieve
 *   suggestedMaxTokens: number, // Token budget for the response
 *   needsRawData: boolean    // Should we include raw data layer?
 * }
 */
function analyzeQuery(query) {
  if (!query) return defaultAnalysis();

  const lower = query.toLowerCase();
  const terms = tokenize(query);
  const termSet = new Set(terms);

  // ─── Entity Detection ────────────────────────────────────
  const entities = [];
  const detectedSchools = [];
  const detectedCareers = [];

  for (const term of terms) {
    const clean = term.replace(/_/g, ' ');
    if (SCHOOL_ENTITIES.has(clean)) {
      detectedSchools.push(clean);
      entities.push({ type: 'school', value: clean });
    }
    if (CAREER_ENTITIES.has(clean)) {
      detectedCareers.push(clean);
      entities.push({ type: 'career', value: clean });
    }
    if (ADMISSIONS_ENTITIES.has(clean)) {
      entities.push({ type: 'admissions', value: clean });
    }
  }

  // ─── Domain Detection (covers undergrad, grad, trades, military, international, financial aid) ─────────
  const admissionSignals = entities.filter(e => e.type === 'admissions' || e.type === 'school').length;
  const careerSignals = entities.filter(e => e.type === 'career').length;

  // New domain signals (graduate, trades, military, international, financial aid)
  const graduateSignals = /\b(graduate|grad school|masters|mba|phd|jd|gre|gmat|lsat|mcat|professional school|doctoral)\b/i;
  const tradesSignals = /\b(trade|electrician|plumber|hvac|welder|apprentice|journeyman|union|blue collar|vocational|skilled trade)\b/i;
  const militarySignals = /\b(military|armed forces|veteran|rotc|service academy|gi bill|skillbridge|mos|clearance)\b/i;
  const internationalSignals = /\b(international|visa|study abroad|toefl|ielts|ucas|overseas|exchange)\b/i;
  const financialAidSignals = /\b(fafsa|financial aid|scholarship|grant|loan|merit aid|need based|529|efc)\b/i;

  const graduateHits = (lower.match(graduateSignals) || []).length;
  const tradesHits = (lower.match(tradesSignals) || []).length;
  const militaryHits = (lower.match(militarySignals) || []).length;
  const internationalHits = (lower.match(internationalSignals) || []).length;
  const financialAidHits = (lower.match(financialAidSignals) || []).length;

  // Check for weak admissions signals
  const weakAdmissionPatterns = /\b(college|university|school|parent|child|kid|son|daughter|teenager|teen|junior|senior|freshman|sophomore)\b/i;
  const weakAdmissionHits = (lower.match(weakAdmissionPatterns) || []).length;

  let domain = 'general';
  // Priority: specific new domains > traditional admissions/career > general
  if (graduateHits >= 1) {
    domain = 'admissions'; // Graduate admissions still falls under admissions domain
  } else if (tradesHits >= 1 || militaryHits >= 1) {
    domain = 'career'; // Trades and military are career-domain
  } else if (internationalHits >= 1) {
    domain = 'admissions'; // International has both admissions AND career angles, default to admissions
  } else if (financialAidHits >= 1) {
    domain = 'admissions'; // Financial aid is primarily an admissions concern
  } else if (admissionSignals >= 2 || (admissionSignals >= 1 && weakAdmissionHits >= 1)) {
    domain = 'admissions';
  } else if (careerSignals >= 2) {
    domain = 'career';
  } else if (admissionSignals >= 1 || weakAdmissionHits >= 2) {
    domain = 'admissions';
  } else if (careerSignals >= 1) {
    domain = 'career';
  } else if (weakAdmissionHits >= 1 && careerSignals >= 1) {
    domain = 'both';
  }

  // ─── Intent Classification ───────────────────────────────
  let intent = 'exploratory';

  // Specific lookup: asking about particular things
  const specificPatterns = /\b(what is|what are|how much|how many|tell me about|requirements|acceptance rate|salary|median|average|tuition|cost|deadline|when|decision date)\b/i;
  if (specificPatterns.test(lower) && entities.length > 0) {
    intent = 'specific_lookup';
  }

  // Comparison: comparing things
  const comparisonPatterns = /\b(compare|versus|vs\.?|difference between|better|which is|pros and cons|or should)\b/i;
  if (comparisonPatterns.test(lower)) {
    intent = 'comparison';
  }

  // Strategic: planning and strategy
  const strategicPatterns = /\b(strategy|strategic|plan|should i|how do i|approach|maximize|optimize|chances|competitive|position|strengthen)\b/i;
  if (strategicPatterns.test(lower)) {
    intent = 'strategic';
  }

  // Personal: about the user's specific situation
  const personalPatterns = /\b(my|i am|i'm|i have|my child|my daughter|my son|my kid|we are|we're)\b/i;
  if (personalPatterns.test(lower) && intent !== 'comparison') {
    intent = 'personal';
  }

  // ─── Complexity Assessment ───────────────────────────────
  const wordCount = query.split(/\s+/).length;
  const entityCount = entities.length;
  const questionDepth = (lower.match(/\b(why|how|explain|analyze|evaluate|assess)\b/g) || []).length;

  let complexity = 'simple';
  if (wordCount > 30 || entityCount > 3 || questionDepth >= 2) {
    complexity = 'complex';
  } else if (wordCount > 15 || entityCount > 1 || questionDepth >= 1) {
    complexity = 'moderate';
  }

  // Edge case: Very short queries (1-2 words) need more context to avoid spurious results
  // E.g., "MBA" or "electrician" alone should get broader context
  if (wordCount <= 2 && entityCount === 1) {
    complexity = 'moderate'; // Upgrade short named entities to moderate
  } else if (wordCount === 1) {
    complexity = 'simple'; // Single word stays simple but gets flagged for raw data
  }

  // ─── Needs Raw Data? ─────────────────────────────────────
  // Specific lookups with named entities often need granular data
  const rawDataPatterns = /\b(specific|specifically|exact|detailed|data|statistics|numbers|breakdown|percentage|rate|score|ranking|sat|act|gpa|median|average|salary|tuition|demographics|ethnicity|decision date|curriculum|courses|requirements)\b/i;
  const needsRawData = intent === 'specific_lookup' && rawDataPatterns.test(lower) && entities.length > 0;

  // ─── Adaptive Budgeting ──────────────────────────────────
  // How many chunks to retrieve and how many tokens to spend
  let suggestedTopK, suggestedMaxTokens;

  switch (complexity) {
    case 'complex':
      suggestedTopK = needsRawData ? 10 : 8;
      suggestedMaxTokens = 2000;
      break;
    case 'moderate':
      suggestedTopK = needsRawData ? 7 : 5;
      suggestedMaxTokens = 1200;
      break;
    default: // simple
      suggestedTopK = needsRawData ? 5 : 3;
      suggestedMaxTokens = 800;
  }

  return {
    intent,
    domain,
    entities,
    detectedSchools,
    detectedCareers,
    complexity,
    suggestedTopK,
    suggestedMaxTokens,
    needsRawData,
    termCount: terms.length,
    entityCount: entities.length
  };
}

function defaultAnalysis() {
  return {
    intent: 'exploratory',
    domain: 'general',
    entities: [],
    detectedSchools: [],
    detectedCareers: [],
    complexity: 'simple',
    suggestedTopK: 4,
    suggestedMaxTokens: 800,
    needsRawData: false,
    termCount: 0,
    entityCount: 0
  };
}

// ─── Context Assembly ───────────────────────────────────────────

/**
 * Assemble a context string from ranked chunks within a token budget.
 * Handles deduplication and prioritization.
 *
 * @param {Array} rankedChunks - Output from scoreBM25()
 * @param {number} maxChars - Maximum characters for context (not tokens, but close proxy)
 * @returns {string} Assembled context string
 */
function assembleContext(rankedChunks, maxChars = 32000) {
  if (!rankedChunks || rankedChunks.length === 0) return '';

  const parts = [];
  let totalChars = 0;
  const seenSources = new Set();
  const seenContent = new Set(); // Dedup by first 100 chars

  for (const { chunk, score } of rankedChunks) {
    if (!chunk || !chunk.text) continue;

    // Deduplication: skip if we've seen very similar content
    const fingerprint = chunk.text.slice(0, 100).toLowerCase().replace(/\s+/g, ' ');
    if (seenContent.has(fingerprint)) continue;
    seenContent.add(fingerprint);

    // Budget check
    const chunkText = chunk.text.slice(0, 3000); // Cap individual chunks
    if (totalChars + chunkText.length > maxChars) {
      // Try to fit a truncated version
      const remaining = maxChars - totalChars;
      if (remaining > 200) {
        parts.push(chunkText.slice(0, remaining) + '...');
        totalChars += remaining;
      }
      break;
    }

    parts.push(chunkText);
    totalChars += chunkText.length;
    if (chunk.source) seenSources.add(chunk.source);
  }

  return parts.join('\n\n---\n\n');
}

// ─── Semantic Cache ─────────────────────────────────────────────

/**
 * Simple semantic cache that stores query → context mappings.
 * Uses normalized query fingerprints for matching.
 *
 * Cache eviction: LRU with TTL.
 */
class SemanticCache {
  constructor(maxSize = 100, ttlMs = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Generate a fingerprint for cache lookup.
   * Normalizes the query to catch semantically similar queries:
   * - Lowercase, sorted tokens, no stop words
   * - "What is the acceptance rate at Harvard?" and
   *   "Harvard acceptance rate?" should hit the same cache entry
   */
  fingerprint(query) {
    const terms = tokenize(query);
    // Sort for order independence
    return terms.sort().join('|');
  }

  get(query) {
    const fp = this.fingerprint(query);
    const entry = this.cache.get(fp);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(fp);
      this.misses++;
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(fp);
    this.cache.set(fp, entry);
    this.hits++;

    return entry.value;
  }

  set(query, value) {
    const fp = this.fingerprint(query);

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(fp, {
      value,
      timestamp: Date.now()
    });
  }

  stats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total * 100).toFixed(1) + '%' : '0%'
    };
  }

  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

// ─── Exports ────────────────────────────────────────────────────

export {
  tokenize,
  buildInvertedIndex,
  scoreBM25,
  analyzeQuery,
  assembleContext,
  SemanticCache,
  SCHOOL_ENTITIES,
  CAREER_ENTITIES,
  ADMISSIONS_ENTITIES,
  SYNONYM_MAP
};
