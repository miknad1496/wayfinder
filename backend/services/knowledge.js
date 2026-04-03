import { promises as fs } from 'fs';
import { join } from 'path';
import { PATHS } from './storage.js';
import {
  buildInvertedIndex, scoreBM25, analyzeQuery,
  assembleContext, SemanticCache
} from './retrieval.js';
import { getMemoryChunks } from './conversation-memory.js';

// SQLite knowledge base — preferred over JSON files when available
let KnowledgeDB = null;
try {
  const mod = await import('./knowledge-db.js');
  KnowledgeDB = mod.KnowledgeDB;
} catch (e) {
  // sql.js not installed — fall back to JSON parsing
  console.log('[knowledge] SQLite not available (install sql.js), using JSON fallback');
}

// Dynamic commitment deadline — always May 1 of the current admissions cycle
function getCommitmentDeadline() {
  const now = new Date();
  // If we're past May 1, next cycle is next year; otherwise this year
  const year = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();
  return `May 1, ${year}`;
}

/**
 * Wayfinder Knowledge Retrieval Engine v3 — Intelligent Indexed Retrieval
 * with Deep-Dive Raw Data Reserve
 *
 * THREE-LAYER architecture:
 *
 *   LAYER 1 — DISTILLED INTELLIGENCE (28 Opus-synthesized files)
 *     Primary brain. Organized into 14 category buckets.
 *     Searched on every engine query via targeted routing.
 *
 *   LAYER 2 — BASE KNOWLEDGE (hand-crafted markdown)
 *     Foundational guidance. Always included as fallback context.
 *
 *   LAYER 3 — RAW DATA RESERVE (scraped JSON, parsed into chunks)
 *     Deep-dive granular data: O*NET occupation profiles, BLS stats,
 *     NCES earnings by major, certifications, Reddit career stories,
 *     admissions data per school. Only accessed when the query router
 *     detects a SPECIFIC question that needs granular data points.
 *     ~99% of queries never touch this layer, but when a parent asks
 *     "what are the specific program requirements for CS at Georgia Tech"
 *     this is where the answer lives.
 *
 * THREE-STAGE retrieval pipeline:
 *   Stage 1   — Category routing (zero cost, keyword-based)
 *   Stage 1.5 — Specificity detection: should we drill into raw data?
 *   Stage 2   — Targeted chunk retrieval from matched layers
 *
 * Token savings: ~40-60% vs brute-force on standard queries.
 * Deep-dive queries load more data but still only from matched categories.
 */

let categoryIndex = null;    // Map<category, chunk[]> — distilled + base
let rawDataIndex = null;     // Map<category, chunk[]> — raw JSON parsed
let careerBrainCache = null;
let admissionsBrainCache = null;
let decisionDatesCache = null;   // Lightweight decision dates for standard mode
let demographicsSummaryCache = null; // Lightweight demographics for standard mode
let bm25Index = null;            // BM25 inverted index for engine mode
let bm25IndexTimestamp = 0;
const semanticCache = new SemanticCache(150, 5 * 60 * 1000); // 150 entries, 5min TTL
let categoryTimestamp = 0;
let rawDataTimestamp = 0;
let brainCacheTimestamp = 0;
let lightDataTimestamp = 0;
const CACHE_TTL = 10 * 60 * 1000;

const MAX_CHUNK_CHARS = 3000;
const MAX_TOTAL_CONTEXT_CHARS = 32000;

// ─── Category Definitions (Layer 1: Distilled) ──────────────────

const CATEGORIES = {
  tech_careers: {
    files: ['intel-tech-landscape.md', 'pathway-tech-transitions.md', 'pathway-ai-disruption-map.md'],
    triggers: ['tech', 'software', 'engineering', 'developer', 'programming', 'coding', 'computer',
      'science', 'data', 'machine', 'learning', 'artificial', 'intelligence', 'web', 'app',
      'startup', 'silicon', 'valley', 'devops', 'cloud', 'cybersecurity', 'infosec',
      'frontend', 'backend', 'fullstack', 'product', 'manager', 'ux', 'designer',
      'faang', 'google', 'amazon', 'meta', 'apple', 'microsoft', 'nvidia', 'openai'],
    rawCategories: ['raw_onet', 'raw_bls', 'raw_h1b', 'raw_col', 'raw_scorecard']
  },
  h1b_visa: {
    files: ['synthesis-h1b-insights.md'],
    triggers: ['h1b', 'h-1b', 'visa', 'sponsor', 'sponsorship', 'immigration', 'green card',
      'work permit', 'opt', 'cpt', 'stem opt', 'lca', 'prevailing wage',
      'infosys', 'tcs', 'cognizant', 'wipro', 'outsourcing', 'consulting firm'],
    rawCategories: ['raw_h1b', 'raw_bls', 'raw_col']
  },
  finance_careers: {
    files: ['intel-finance-careers.md'],
    triggers: ['finance', 'banking', 'investment', 'wall', 'street', 'accounting', 'cpa',
      'financial', 'analyst', 'hedge', 'fund', 'private', 'equity', 'venture', 'capital',
      'consulting', 'mckinsey', 'bain', 'bcg', 'deloitte', 'pwc', 'kpmg', 'ey',
      'actuarial', 'quant', 'trading', 'fintech', 'wealth', 'management'],
    rawCategories: ['raw_onet', 'raw_bls', 'raw_h1b', 'raw_certifications', 'raw_col']
  },
  healthcare_careers: {
    files: ['intel-healthcare-careers.md'],
    triggers: ['healthcare', 'medical', 'medicine', 'doctor', 'nurse', 'nursing', 'physician',
      'hospital', 'clinical', 'pharmacy', 'pharmacist', 'dental', 'dentist', 'veterinary',
      'therapy', 'therapist', 'physical', 'occupational', 'mental', 'health', 'psych',
      'premed', 'mcat', 'residency', 'biotech', 'pharma', 'public', 'epidemiology'],
    rawCategories: ['raw_onet', 'raw_bls', 'raw_col', 'raw_census']
  },
  government_careers: {
    files: ['intel-government-federal.md'],
    triggers: ['government', 'federal', 'public', 'service', 'policy', 'politics', 'political',
      'military', 'army', 'navy', 'marines', 'air', 'force', 'state', 'department',
      'nonprofit', 'ngo', 'usajobs', 'clearance', 'gs', 'scale', 'civil', 'law',
      'enforcement', 'fbi', 'cia', 'nsa', 'diplomat'],
    rawCategories: ['raw_bls', 'raw_military', 'raw_col']
  },
  trades_careers: {
    files: ['intel-trades-renaissance.md'],
    triggers: ['trade', 'trades', 'plumber', 'plumbing', 'electrician', 'electrical',
      'carpenter', 'carpentry', 'welding', 'welder', 'hvac', 'mechanic', 'construction',
      'apprentice', 'apprenticeship', 'union', 'vocational', 'blue', 'collar',
      'skilled', 'labor', 'technician', 'lineman', 'diesel'],
    rawCategories: ['raw_onet', 'raw_bls', 'raw_trades', 'raw_col', 'raw_census']
  },
  career_transitions: {
    files: ['pathway-career-pivots-30s.md', 'pathway-tech-transitions.md', 'pathway-non-degree.md',
      'audience-career-changer.md'],
    triggers: ['career', 'change', 'switch', 'transition', 'pivot', 'changing', 'mid-career',
      'new', 'field', 'different', 'industry', 'transferable', 'skills', 'restart',
      'reinvent', 'second', 'late', 'start', 'non-degree', 'alternative', 'without',
      'degree', 'bootcamp', 'self-taught'],
    rawCategories: ['raw_reddit_stories', 'raw_bls', 'raw_census', 'raw_h1b', 'raw_col']
  },
  education_decisions: {
    files: ['framework-major-selection.md', 'framework-grad-school.md', 'pathway-stem-vs-non-stem.md',
      'roi-college-alternatives.md', 'roi-bootcamps.md', 'synthesis-census-education-premium.md',
      'synthesis-scorecard-earnings.md'],
    triggers: ['major', 'college', 'university', 'degree', 'masters', 'phd', 'mba', 'grad',
      'school', 'graduate', 'undergraduate', 'bachelors', 'associates', 'stem',
      'humanities', 'liberal', 'arts', 'tuition', 'student', 'loan', 'debt',
      'bootcamp', 'community', 'online', 'course', 'study', 'education',
      'worth', 'roi', 'return'],
    rawCategories: ['raw_nces', 'raw_scorecard', 'raw_census', 'raw_reddit_stories', 'raw_grad_programs', 'raw_financial_aid']
  },
  admissions: {
    files: ['audience-high-school-undecided.md', 'admissions-strategic-playbook.md',
      'admissions-school-selection-intelligence.md', 'admissions-parent-strategy-guide.md',
      'admissions-essay-intelligence.md', 'admissions-curriculum-synthesis.md',
      'admissions-data-synthesis.md', 'admissions-pre-highschool-planning.md',
      'admissions-parent-adult-children.md',
      'admissions-ed-strategy-calibration.md',
      'admissions-adversity-landscape-intelligence.md',
      'admissions-diversity-school-profiling.md',
      'admissions-extracurricular-differentiation-strategy.md',
      'synthesis-scorecard-earnings.md'],
    triggers: ['admissions', 'admission', 'acceptance', 'accepted', 'apply', 'application',
      'essay', 'sat', 'act', 'gpa', 'extracurricular', 'recommendation', 'early',
      'decision', 'regular', 'ivy', 'league', 'harvard', 'yale', 'princeton', 'stanford',
      'mit', 'columbia', 'penn', 'cornell', 'brown', 'dartmouth', 'duke', 'northwestern',
      'caltech', 'uchicago', 'georgetown', 'vanderbilt', 'rice', 'emory', 'notre',
      'dame', 'wash', 'usc', 'nyu', 'umich', 'berkeley', 'ucla', 'uva',
      'target', 'reach', 'safety', 'waitlist', 'defer', 'transfer', 'common',
      'supplement', 'parent', 'child', 'kid', 'son', 'daughter', 'teenager', 'teen',
      'high', 'school', 'junior', 'senior', 'freshman', 'sophomore',
      'pre-college', 'precollege', 'college', 'prep',
      'curriculum', 'course', 'courses', 'class', 'classes', 'prerequisite', 'prerequisites',
      'credit', 'credits', 'requirement', 'requirements', 'catalog', 'syllabus',
      'distribution', 'core', 'gen-ed', 'elective', 'electives', 'thesis',
      'capstone', 'study', 'abroad', 'quarter', 'semester', 'faculty', 'professor',
      'adversity', 'landscape', 'diversity', 'first-gen', 'pell', 'questbridge',
      'ed', 'early decision', 'ed2', 'binding', 'club', 'activity', 'activities',
      'passion', 'project', 'business', 'startup', 'differentiate',
      'ethnicity', 'ethnic', 'race', 'racial', 'demographics', 'demographic',
      'asian', 'white', 'black', 'hispanic', 'latino', 'representation',
      'notification', 'hear', 'hearing', 'waiting', 'results', 'released', 'ivy day',
      'decision date', 'decision dates', 'when will', 'when do'],
    rawCategories: ['raw_admissions', 'raw_nces', 'raw_scorecard', 'raw_curriculum', 'raw_local_schools', 'raw_ethnicity', 'raw_decision_dates', 'raw_financial_aid', 'raw_international']
  },
  local_schools: {
    files: ['admissions-pre-highschool-planning.md'],
    triggers: ['lakeside', 'bush school', 'university prep', 'overlake', 'eastside prep',
      'forest ridge', 'eastside catholic', 'bear creek', 'bellevue christian', 'northwest school',
      'holy names', 'seattle academy', 'saas', 'epiphany', 'bertschi', 'charles wright',
      'annie wright', 'seattle country day', 'kennedy catholic', 'bishop blanchet', 'odea',
      'bellevue high', 'newport high', 'interlake high', 'sammamish high', 'mercer island',
      'redmond high', 'woodinville', 'eastlake high', 'tesla stem', 'garfield high',
      'roosevelt high', 'ballard high', 'ingraham', 'issaquah high', 'skyline high',
      'liberty high', 'juanita high', 'lake washington high', 'bothell high',
      'bellevue school', 'lake washington school', 'issaquah school', 'northshore',
      'seattle public', 'elementary school', 'middle school', 'private school',
      'odle', 'highland middle', 'chinook middle', 'tillicum', 'tyee middle',
      'medina', 'clyde hill', 'yarrow point', 'hunts point', 'beaux arts',
      'seattle', 'bellevue', 'kirkland', 'redmond', 'sammamish', 'issaquah',
      'mercer island', 'renton', 'kent', 'federal way', 'tacoma', 'shoreline',
      'edmonds', 'bothell', 'woodinville', 'kenmore', 'burien', 'tukwila',
      'k-12', 'k-8', 'elementary', 'preschool', 'kindergarten', 'tuition',
      'private school cost', 'public school', 'school district', 'school rating'],
    rawCategories: ['raw_local_schools']
  },
  salary_negotiation: {
    files: ['framework-salary-negotiation.md', 'framework-job-offer-evaluation.md', 'synthesis-h1b-insights.md', 'synthesis-col-insights.md'],
    triggers: ['salary', 'pay', 'compensation', 'negotiate', 'negotiation', 'offer', 'raise',
      'promotion', 'benefits', 'equity', 'stock', 'options', 'bonus', 'package',
      'counter', 'accept', 'decline', 'compare', 'competing', 'total', 'comp',
      'remote', 'relocation', 'signing'],
    rawCategories: ['raw_bls', 'raw_h1b', 'raw_col', 'raw_reddit_salary']
  },
  job_search: {
    files: ['playbook-first-job.md', 'playbook-interview.md', 'playbook-networking.md'],
    triggers: ['job', 'search', 'apply', 'applying', 'resume', 'cover', 'letter', 'interview',
      'behavioral', 'technical', 'whiteboard', 'hiring', 'recruiter', 'linkedin',
      'networking', 'network', 'connection', 'referral', 'portfolio', 'entry',
      'level', 'junior', 'internship', 'intern', 'co-op', 'first', 'experience',
      'cold', 'email', 'reach', 'coffee', 'informational'],
    rawCategories: ['raw_reddit_advice']
  },
  certifications: {
    files: ['roi-certifications.md'],
    triggers: ['certification', 'certifications', 'certified', 'certificate', 'certificates',
      'license', 'licensed', 'credential', 'credentials',
      'aws', 'azure', 'gcp', 'pmp', 'scrum', 'agile', 'comptia', 'cisco', 'ccna',
      'cissp', 'cfa', 'cpa', 'series', 'professional', 'development'],
    rawCategories: ['raw_certifications']
  },
  ai_impact: {
    files: ['pathway-ai-disruption-map.md'],
    triggers: ['automation', 'automate', 'automated', 'replace', 'replaced', 'obsolete',
      'future', 'proof', 'disruption', 'disrupt', 'chatgpt', 'llm', 'generative',
      'robot', 'robotics', 'autonomous', 'survive', 'adapt', 'resistant', 'safe'],
    rawCategories: ['raw_onet']
  },
  first_gen: {
    files: ['audience-first-gen.md'],
    triggers: ['first', 'generation', 'first-gen', 'low', 'income', 'pell', 'grant',
      'disadvantaged', 'underrepresented', 'minority', 'immigrant', 'esl',
      'undocumented', 'daca', 'fafsa', 'financial', 'aid', 'scholarship',
      'work-study', 'need-based'],
    rawCategories: ['raw_nces', 'raw_financial_aid']
  },
  cost_of_living: {
    files: ['synthesis-col-insights.md', 'framework-job-offer-evaluation.md'],
    triggers: ['cost of living', 'col', 'cost-of-living', 'rpp', 'regional price', 'price parity',
      'purchasing power', 'expensive', 'affordable', 'cheap', 'relocate', 'relocation',
      'move to', 'moving to', 'live in', 'living in', 'rent', 'housing cost',
      'geo band', 'location adjustment', 'location-based pay', 'remote salary',
      'adjusted salary', 'real salary', 'nominal vs real',
      'san francisco', 'new york', 'nyc', 'los angeles', 'seattle', 'austin', 'denver',
      'chicago', 'miami', 'boston', 'dallas', 'houston', 'atlanta', 'phoenix',
      'portland', 'minneapolis', 'nashville', 'raleigh', 'charlotte'],
    rawCategories: ['raw_col', 'raw_bls']
  },
  data_synthesis: {
    files: ['synthesis-bls-insights.md', 'synthesis-h1b-insights.md', 'synthesis-col-insights.md',
      'synthesis-census-education-premium.md', 'synthesis-scorecard-earnings.md',
      'synthesis-community-wisdom.md', 'core-reasoning-principles.md',
      'core-conversation-patterns.md'],
    triggers: ['statistics', 'data', 'trend', 'growth', 'decline', 'outlook', 'projection',
      'bureau', 'labor', 'bls', 'onet', 'occupation', 'median', 'average',
      'percentile', 'employment', 'unemployment', 'workforce', 'economy'],
    rawCategories: ['raw_bls', 'raw_onet', 'raw_nces', 'raw_scorecard', 'raw_census', 'raw_h1b', 'raw_col']
  }
};

// ─── Specificity Signals ─────────────────────────────────────────
// Words/patterns that indicate the user wants granular, specific data
// rather than general guidance. These trigger raw data access.

const SPECIFICITY_SIGNALS = [
  // Asking about a SPECIFIC occupation or role
  'specific', 'specifically', 'exactly', 'particular', 'detailed', 'details',
  // Named entities that need raw lookup
  'requirements', 'required', 'qualifications', 'prerequisite', 'prerequisite',
  // Quantitative asks
  'how much', 'median', 'average', 'percentile', 'range', 'starting',
  'salary for', 'pay for', 'earn', 'earnings', 'income',
  // School-specific asks
  'acceptance rate', 'admission rate', 'sat score', 'act score',
  'tuition', 'net price', 'financial aid at', 'scholarship at',
  'retention', 'graduation rate', 'early decision rate',
  // Curriculum-specific asks
  'curriculum', 'course', 'courses', 'class', 'classes', 'prerequisite',
  'credit hours', 'credits', 'core requirement', 'distribution',
  'gen ed', 'gen-ed', 'major requirement', 'minor in', 'thesis',
  'capstone', 'study abroad', 'quarter system', 'semester',
  // Occupation-specific asks
  'tasks', 'duties', 'day-to-day', 'skills needed', 'education needed',
  'certification for', 'license for', 'outlook for', 'growth rate',
  'number of jobs', 'job openings', 'demand for',
  // Comparison asks
  'compare', 'versus', 'difference between', 'better',
  // Deep experience
  'what is it like', 'experience', 'story', 'stories', 'real',
  'actually', 'honestly', 'truth about',
  // Cost of living / location-based queries
  'cost of living', 'col', 'rpp', 'purchasing power', 'price parity',
  'relocate', 'relocation', 'move to', 'moving to', 'live in', 'living in',
  'expensive', 'affordable', 'adjusted salary', 'real salary', 'geo band',
  'location adjustment', 'remote salary', 'housing cost'
];

function detectSpecificity(query) {
  const lower = query.toLowerCase();
  let signals = 0;

  for (const signal of SPECIFICITY_SIGNALS) {
    if (lower.includes(signal)) signals++;
  }

  // Also check for named entities (proper nouns, school names, etc.)
  // Heuristic: words with capital letters that aren't sentence starts
  const words = query.split(/\s+/);
  for (let i = 1; i < words.length; i++) {
    if (words[i].length > 2 && words[i][0] === words[i][0].toUpperCase() && words[i][0] !== words[i][0].toLowerCase()) {
      signals++;
    }
  }

  // Threshold: 2+ signals = specific enough for raw data
  return {
    isSpecific: signals >= 2,
    signals,
    level: signals >= 4 ? 'deep' : signals >= 2 ? 'moderate' : 'general'
  };
}

// ─── Keyword extraction ───────────────────────────────────────────

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
  'best', 'get', 'make', 'going', 'looking', 'trying'
]);

function extractKeywords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

// ─── Chunk parsing ───────────────────────────────────────────────

function parseMarkdown(content, filename) {
  const chunks = [];
  const sections = content.split(/\n#{1,3}\s+/);

  for (const section of sections) {
    const trimmed = section.trim();
    if (trimmed.length < 30) continue;

    const lines = trimmed.split('\n');
    const title = lines[0].replace(/^#+\s*/, '').trim();
    const body = lines.slice(1).join('\n').trim();
    if (!body) continue;

    chunks.push({
      source: filename,
      title: title.slice(0, 200),
      content: body.slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords(title + ' ' + body.slice(0, 1500))
    });
  }

  if (chunks.length === 0 && content.trim().length > 30) {
    chunks.push({
      source: filename,
      title: filename.replace(/\.\w+$/, '').replace(/[-_]/g, ' '),
      content: content.trim().slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords(content.slice(0, 1500))
    });
  }

  return chunks;
}

// ─── Raw JSON → Chunk Parsers (Layer 3) ──────────────────────────
// Convert structured JSON records into searchable text chunks

function parseOnetRecords(records) {
  return records.map(r => {
    const text = [
      `Occupation: ${r.title} (SOC: ${r.soc})`,
      r.tasks?.length ? `Key Tasks: ${r.tasks.slice(0, 5).join('; ')}` : '',
      r.skills?.length ? `Skills: ${r.skills.join(', ')}` : '',
      r.knowledge?.length ? `Knowledge: ${r.knowledge.join(', ')}` : '',
      r.education?.length ? `Education: ${r.education.join('; ')}` : '',
      r.interests?.length ? `Interests: ${r.interests.join(', ')}` : '',
      r.wages ? `Wages: ${r.wages}` : ''
    ].filter(Boolean).join('\n');

    return {
      source: 'onet-occupations.json',
      title: `O*NET: ${r.title}`,
      content: text.slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords(text),
      boostFactor: 0.8,
      isRawData: true
    };
  });
}

function parseBLSRecords(records) {
  // Support both old format (bls-occupations.json) and new format (bls-compensation.json)
  return records
    .filter(r => {
      // New format: has 'soc' field with wage percentiles
      if (r.soc && r.wages) return true;
      // Old format: filter out junk entries
      return r.description && r.description.length > 50 &&
        !['Home', 'Occupation Finder', 'OOH FAQs', 'A-Z Index'].includes(r.occupation);
    })
    .map(r => {
      // ─── New OEWS format (bls-compensation.json) ───
      if (r.soc && r.wages) {
        return parseBLSCompensationRecord(r);
      }

      // ─── Legacy format (bls-occupations.json) ───
      const text = [
        `Occupation: ${r.occupation} (${r.group})`,
        r.medianPay !== 'Not available' ? `Median Pay: ${r.medianPay}` : '',
        r.education !== 'Not available' ? `Education: ${r.education}` : '',
        r.outlook !== 'Not available' ? `Job Outlook: ${r.outlook}` : '',
        r.numberOfJobs !== 'Not available' ? `Number of Jobs: ${r.numberOfJobs}` : '',
        r.description ? `Description: ${r.description}` : '',
        r.howToBecome && r.howToBecome !== 'See BLS page for details' ? `How to Become: ${r.howToBecome}` : ''
      ].filter(Boolean).join('\n');

      return {
        source: 'bls-occupations.json',
        title: `BLS: ${r.occupation}`,
        content: text.slice(0, MAX_CHUNK_CHARS),
        keywords: extractKeywords(text),
        boostFactor: 0.8,
        isRawData: true
      };
    });
}

/**
 * Parse a single BLS OEWS compensation record into RAG chunks.
 * Each occupation produces one primary chunk (national data + top metros)
 * and optionally additional geographic chunks for detailed state/metro queries.
 */
function parseBLSCompensationRecord(r) {
  const fmt = (v) => v != null ? `$${v.toLocaleString()}` : 'N/A';
  const nat = r.wages?.national?.annual || {};

  // Primary chunk: national wages + employment + outlook
  const lines = [
    `Occupation: ${r.title} (SOC ${r.soc})`,
    `Source: BLS OEWS (${r.reference_period || 'May 2024'})`,
    '',
    'National Annual Wages:',
    `  Median (50th): ${fmt(nat.p50)}`,
    `  Entry-level (10th percentile): ${fmt(nat.p10)}`,
    `  25th percentile: ${fmt(nat.p25)}`,
    `  75th percentile: ${fmt(nat.p75)}`,
    `  Top earners (90th percentile): ${fmt(nat.p90)}`,
    `  Mean: ${fmt(nat.mean)}`,
  ];

  if (r.employment?.total) {
    lines.push(`\nTotal Employment: ${r.employment.total.toLocaleString()} jobs`);
  }
  if (r.employment?.jobs_per_1000) {
    lines.push(`Jobs per 1,000: ${r.employment.jobs_per_1000}`);
  }

  if (r.outlook) {
    lines.push(`\nJob Outlook (${r.outlook.period || '2024-2034'}): ${r.outlook.growth_rate} growth (${r.outlook.growth_category})`);
    if (r.outlook.projected_openings) {
      lines.push(`Projected Annual Openings: ${r.outlook.projected_openings.toLocaleString()}`);
    }
  }

  // Add top-paying metros (up to 5 for context)
  const metros = Object.entries(r.wages?.by_metro || {});
  if (metros.length > 0) {
    const sorted = metros
      .filter(([, d]) => d.annual?.p50 != null)
      .sort((a, b) => (b[1].annual.p50 || 0) - (a[1].annual.p50 || 0));

    if (sorted.length > 0) {
      lines.push('\nHighest-Paying Metro Areas:');
      for (const [metro, data] of sorted.slice(0, 5)) {
        lines.push(`  ${metro}: ${fmt(data.annual.p50)} median (range: ${fmt(data.annual.p10)} - ${fmt(data.annual.p90)})`);
      }
    }
  }

  // Add a few state highlights
  const states = Object.entries(r.wages?.by_state || {});
  if (states.length > 0) {
    const sorted = states
      .filter(([, d]) => d.annual?.p50 != null)
      .sort((a, b) => (b[1].annual.p50 || 0) - (a[1].annual.p50 || 0));

    if (sorted.length >= 5) {
      lines.push(`\nHighest-Paying States: ${sorted.slice(0, 5).map(([st, d]) => `${st} (${fmt(d.annual.p50)})`).join(', ')}`);
      lines.push(`Lowest-Paying States: ${sorted.slice(-3).map(([st, d]) => `${st} (${fmt(d.annual.p50)})`).join(', ')}`);
    }
  }

  const text = lines.join('\n');

  // Build rich keyword set for matching
  const keywordParts = [
    r.title, r.soc,
    'salary', 'wage', 'pay', 'compensation', 'income', 'earnings',
    'median', 'percentile', 'range',
    nat.p50 ? 'annual' : '',
  ].filter(Boolean).join(' ');

  return {
    source: 'bls-compensation.json',
    title: `BLS Wages: ${r.title}`,
    content: text.slice(0, MAX_CHUNK_CHARS),
    keywords: extractKeywords(keywordParts),
    boostFactor: 1.0, // Higher boost than old BLS data (0.8) — this is real wage data
    isRawData: true,
  };
}

function parseNCESRecords(records) {
  return records.map(r => {
    const text = [
      `Major: ${r.major}`,
      r.medianEarnings1yr ? `Median Earnings (1 yr post-grad): $${r.medianEarnings1yr.toLocaleString()}` : '',
      r.medianEarnings4yr ? `Median Earnings (4 yr post-grad): $${r.medianEarnings4yr.toLocaleString()}` : '',
      r.percentile25 ? `25th Percentile: $${r.percentile25.toLocaleString()}` : '',
      r.percentile75 ? `75th Percentile: $${r.percentile75.toLocaleString()}` : ''
    ].filter(Boolean).join('\n');

    return {
      source: 'nces-earnings-by-major.json',
      title: `Earnings: ${r.major}`,
      content: text,
      keywords: extractKeywords(r.major + ' earnings salary income major degree'),
      boostFactor: 0.8,
      isRawData: true
    };
  });
}

/**
 * Parse College Scorecard data into RAG chunks.
 * Each institution produces one chunk with overview + top programs.
 * Aggregate field-level data produces one chunk per major field.
 */
function parseScorecardRecords(data) {
  const chunks = [];
  const fmt = (v) => v != null ? `$${v.toLocaleString()}` : 'N/A';

  // Institution-level chunks
  const institutions = data.institutions || data;
  if (Array.isArray(institutions)) {
    for (const inst of institutions) {
      if (!inst.institution?.name) continue;
      const i = inst.institution;

      const lines = [
        `${i.name} (${i.city ? i.city + ', ' : ''}${i.state || ''})`,
        `Source: College Scorecard (U.S. Dept of Education)`,
        `Type: ${i.type || 'unknown'}`,
        i.admission_rate != null ? `Admission Rate: ${(i.admission_rate * 100).toFixed(0)}%` : '',
        i.sat_avg ? `Average SAT: ${i.sat_avg}` : '',
        i.avg_net_price ? `Average Net Price: ${fmt(i.avg_net_price)}/year` : '',
        i.tuition_in_state ? `In-State Tuition: ${fmt(i.tuition_in_state)}` : '',
        i.tuition_out_of_state ? `Out-of-State Tuition: ${fmt(i.tuition_out_of_state)}` : '',
        i.completion_rate != null ? `Completion Rate: ${(i.completion_rate * 100).toFixed(0)}%` : '',
        i.median_debt ? `Median Debt at Graduation: ${fmt(i.median_debt)}` : '',
        i.earnings_6yr ? `Median Earnings (6yr after entry): ${fmt(i.earnings_6yr)}` : '',
        i.earnings_10yr ? `Median Earnings (10yr after entry): ${fmt(i.earnings_10yr)}` : '',
      ].filter(Boolean);

      // Add top programs with earnings
      if (inst.programs && inst.programs.length > 0) {
        const sorted = inst.programs
          .filter(p => p.earnings_4yr?.median || p.earnings_1yr?.median)
          .sort((a, b) => (b.earnings_4yr?.median || b.earnings_1yr?.median || 0) -
                          (a.earnings_4yr?.median || a.earnings_1yr?.median || 0));

        if (sorted.length > 0) {
          lines.push(`\nProgram Earnings (${sorted.length} programs with data):`);
          for (const prog of sorted.slice(0, 10)) {
            const e1 = prog.earnings_1yr?.median;
            const e4 = prog.earnings_4yr?.median;
            const debt = prog.debt_at_grad?.median;
            lines.push(`  ${prog.field} (${prog.credential}): ` +
              (e4 ? `4yr=${fmt(e4)}` : '') +
              (e1 ? ` 1yr=${fmt(e1)}` : '') +
              (debt ? ` debt=${fmt(debt)}` : ''));
          }
        }
      }

      const text = lines.join('\n');
      chunks.push({
        source: 'scorecard-earnings.json',
        title: `Scorecard: ${i.name}`,
        content: text.slice(0, MAX_CHUNK_CHARS),
        keywords: extractKeywords(
          `${i.name} ${i.state} ${i.city} college university earnings salary debt tuition admissions`
        ),
        boostFactor: 1.0,
        isRawData: true,
      });
    }
  }

  // Aggregate field-level chunks
  const aggFields = data.aggregate_by_field || [];
  for (const field of aggFields) {
    if (!field.field) continue;
    const e1 = field.earnings_1yr;
    const e4 = field.earnings_4yr;

    const lines = [
      `Field of Study: ${field.field} (CIP ${field.cip_2digit})`,
      `Source: College Scorecard aggregate across ${field.sample_size || '?'} institutions`,
      `Credential: ${field.credential || 'bachelors'}`,
      '',
    ];

    if (e4) {
      lines.push(`4-Year Post-Graduation Earnings (national, bachelors):`);
      lines.push(`  Median: ${fmt(e4.median)}`);
      lines.push(`  25th percentile: ${fmt(e4.p25)}`);
      lines.push(`  75th percentile: ${fmt(e4.p75)}`);
      lines.push(`  Range: ${fmt(e4.min)} - ${fmt(e4.max)}`);
    }
    if (e1) {
      lines.push(`1-Year Post-Graduation Earnings:`);
      lines.push(`  Median: ${fmt(e1.median)}`);
      lines.push(`  25th percentile: ${fmt(e1.p25)}`);
      lines.push(`  75th percentile: ${fmt(e1.p75)}`);
    }

    const text = lines.join('\n');
    chunks.push({
      source: 'scorecard-earnings.json',
      title: `Earnings by Major: ${field.field}`,
      content: text.slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords(
        `${field.field} major degree earnings salary income bachelors graduate roi`
      ),
      boostFactor: 0.9,
      isRawData: true,
    });
  }

  return chunks;
}

/**
 * Parse Census ACS education-earnings data into RAG chunks.
 */
function parseCensusRecords(data) {
  const chunks = [];
  const fmt = (v) => v != null ? `$${v.toLocaleString()}` : 'N/A';

  // National overview chunk
  if (data.national) {
    const n = data.national;
    const premiums = data.education_premiums || {};
    const lines = [
      'National Median Earnings by Education Level',
      'Source: U.S. Census Bureau, American Community Survey',
      '',
      `  Less than High School: ${fmt(n.less_than_hs)}`,
      `  High School Graduate: ${fmt(n.high_school)}`,
      `  Some College/Associate's: ${fmt(n.some_college)}`,
      `  Bachelor's Degree: ${fmt(n.bachelors)}`,
      `  Graduate/Professional Degree: ${fmt(n.graduate)}`,
      '',
    ];

    if (premiums.bachelors_over_hs) {
      lines.push(`Bachelor's premium over HS: ${premiums.bachelors_over_hs.percent} (${fmt(premiums.bachelors_over_hs.absolute)}/year)`);
    }
    if (premiums.graduate_over_bachelors) {
      lines.push(`Graduate premium over Bachelor's: ${premiums.graduate_over_bachelors.percent} (${fmt(premiums.graduate_over_bachelors.absolute)}/year)`);
    }

    chunks.push({
      source: 'census-education-earnings.json',
      title: 'Census: Earnings by Education Level (National)',
      content: lines.join('\n'),
      keywords: extractKeywords('education degree earnings salary bachelor master doctorate graduate premium worth value roi'),
      boostFactor: 1.0,
      isRawData: true,
    });
  }

  // Age-bracket earnings chunk (experience progression)
  if (data.by_age) {
    const lines = [
      'Median Earnings by Education Level and Age (Experience Proxy)',
      'Source: Census ACS (PUMS estimates)',
      '',
    ];

    for (const [age, earnings] of Object.entries(data.by_age)) {
      lines.push(`Age ${age}:`);
      for (const [level, amount] of Object.entries(earnings)) {
        lines.push(`  ${level.replace(/_/g, ' ')}: ${fmt(amount)}`);
      }
    }

    chunks.push({
      source: 'census-education-earnings.json',
      title: 'Census: Earnings by Education and Age',
      content: lines.join('\n').slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords('age experience earnings career progression salary growth mid-career education degree'),
      boostFactor: 0.9,
      isRawData: true,
    });
  }

  // State-level chunks (top/bottom states)
  if (data.by_state && data.by_state.length > 0) {
    const statesWithData = data.by_state.filter(s => s.earnings?.bachelors);
    const sorted = statesWithData.sort((a, b) => (b.earnings.bachelors || 0) - (a.earnings.bachelors || 0));

    if (sorted.length > 0) {
      const lines = [
        'Median Earnings by Education Level — State Comparisons',
        'Source: Census ACS',
        '',
        'Highest-paying states for bachelor\'s degree holders:',
      ];
      for (const s of sorted.slice(0, 10)) {
        lines.push(`  ${s.state}: BS=${fmt(s.earnings.bachelors)}, Grad=${fmt(s.earnings.graduate)}, HS=${fmt(s.earnings.high_school)}`);
      }
      lines.push('\nLowest-paying states for bachelor\'s degree holders:');
      for (const s of sorted.slice(-10)) {
        lines.push(`  ${s.state}: BS=${fmt(s.earnings.bachelors)}, Grad=${fmt(s.earnings.graduate)}, HS=${fmt(s.earnings.high_school)}`);
      }

      chunks.push({
        source: 'census-education-earnings.json',
        title: 'Census: Earnings by Education — State Rankings',
        content: lines.join('\n').slice(0, MAX_CHUNK_CHARS),
        keywords: extractKeywords('state earnings salary education degree bachelor master comparison geographic location'),
        boostFactor: 0.8,
        isRawData: true,
      });
    }
  }

  return chunks;
}

/**
 * Parse Cost of Living (RPP) data into RAG chunks.
 */
function parseCOLRecords(data) {
  const chunks = [];

  // State-level COL chunk
  const states = data.states || [];
  if (states.length > 0) {
    const sorted = states.filter(s => s.rpp).sort((a, b) => b.rpp - a.rpp);

    const lines = [
      'Regional Price Parities by State (Cost of Living Index)',
      'Source: Bureau of Economic Analysis (BEA)',
      'RPP of 100 = national average. Higher = more expensive.',
      '',
      'Most Expensive States:',
    ];
    for (const s of sorted.slice(0, 10)) {
      lines.push(`  ${s.name}: RPP ${s.rpp} — ${s.salary_equivalent?.note || ''}`);
    }
    lines.push('\nLeast Expensive States:');
    for (const s of sorted.slice(-10)) {
      lines.push(`  ${s.name}: RPP ${s.rpp} — ${s.salary_equivalent?.note || ''}`);
    }

    chunks.push({
      source: 'cost-of-living.json',
      title: 'Cost of Living: State Rankings (RPP)',
      content: lines.join('\n').slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords('cost living expensive cheap affordable state salary equivalent purchasing power rpp'),
      boostFactor: 0.9,
      isRawData: true,
    });
  }

  // Metro-level COL chunk
  const metros = data.metros || [];
  if (metros.length > 0) {
    const sorted = metros.filter(m => m.rpp).sort((a, b) => b.rpp - a.rpp);

    const lines = [
      'Regional Price Parities by Metro Area (Cost of Living Index)',
      'Source: Bureau of Economic Analysis (BEA)',
      '',
      'Most Expensive Metro Areas:',
    ];
    for (const m of sorted.slice(0, 15)) {
      lines.push(`  ${m.metro}: RPP ${m.rpp} — ${m.salary_equivalent?.note || ''}`);
    }
    lines.push('\nLeast Expensive Metro Areas:');
    for (const m of sorted.slice(-10)) {
      lines.push(`  ${m.metro}: RPP ${m.rpp} — ${m.salary_equivalent?.note || ''}`);
    }

    chunks.push({
      source: 'cost-of-living.json',
      title: 'Cost of Living: Metro Area Rankings (RPP)',
      content: lines.join('\n').slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords('cost living metro city expensive affordable salary purchasing power housing rent'),
      boostFactor: 0.9,
      isRawData: true,
    });
  }

  return chunks;
}

/**
 * Parse H1B LCA disclosure data into RAG chunks.
 * Each SOC code produces one chunk with company-specific wage data.
 */
function parseH1BRecords(data) {
  const occupations = data.occupations || data;
  if (!Array.isArray(occupations)) return [];
  const fmt = (v) => v != null ? `$${v.toLocaleString()}` : 'N/A';

  return occupations
    .filter(r => r.soc && r.total_filings >= 10)
    .map(r => {
      const lines = [
        `${r.title} (SOC ${r.soc}) — H1B Salary Data`,
        `Source: H1B LCA Disclosure Data (DOL/OFLC)`,
        `Total H1B filings: ${r.total_filings?.toLocaleString()}`,
        '',
        'H1B Wages (annualized):',
        `  Median: ${fmt(r.wages?.p50)}`,
        `  25th percentile: ${fmt(r.wages?.p25)}`,
        `  75th percentile: ${fmt(r.wages?.p75)}`,
        `  10th percentile: ${fmt(r.wages?.p10)}`,
        `  90th percentile: ${fmt(r.wages?.p90)}`,
      ];

      // Top companies
      const companies = Object.entries(r.by_company || {}).slice(0, 10);
      if (companies.length > 0) {
        lines.push('\nTop H1B Sponsors:');
        for (const [co, data] of companies) {
          lines.push(`  ${co}: ${data.count} filings, median ${fmt(data.wages?.p50)}`);
        }
      }

      const text = lines.join('\n');
      return {
        source: 'h1b-compensation.json',
        title: `H1B Wages: ${r.title}`,
        content: text.slice(0, MAX_CHUNK_CHARS),
        keywords: extractKeywords(
          `${r.title} h1b visa salary compensation company employer tech ${Object.keys(r.by_company || {}).slice(0, 5).join(' ')}`
        ),
        boostFactor: 0.9,
        isRawData: true,
      };
    });
}

function parseCertifications(data) {
  const certs = data.certifications || [];
  return certs.map(c => {
    const text = [
      `Certification: ${c.name}`,
      c.organization ? `Organization: ${c.organization}` : '',
      c.field ? `Field: ${c.field}` : '',
      c.levels ? `Levels: ${c.levels}` : '',
      c.timeToComplete ? `Time: ${c.timeToComplete}` : '',
      c.cost ? `Cost: ${c.cost}` : '',
      c.idealFor ? `Ideal For: ${c.idealFor}` : '',
      c.careerImpact ? `Impact: ${c.careerImpact}` : ''
    ].filter(Boolean).join('\n');

    return {
      source: 'certifications.json',
      title: `Cert: ${c.name}`,
      content: text.slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords(text),
      boostFactor: 0.8,
      isRawData: true
    };
  });
}

function parseAdmissionsData(records) {
  if (!Array.isArray(records)) return [];
  const chunks = [];

  for (const r of records) {
    const schoolName = r.school || r.name || 'Unknown';
    const ci = r.curatedIntel || {};

    // CHUNK 1: Core admissions profile (stats + strategy)
    const coreText = [
      `School: ${schoolName}`,
      r.city && r.state ? `Location: ${r.city}, ${r.state}` : '',
      r.admissionRate ? `Admission Rate: ${(r.admissionRate * 100).toFixed(1)}%` : '',
      r.satAvg ? `Average SAT: ${r.satAvg}` : '',
      r.satReading ? `SAT Reading: ${r.satReading}` : '',
      r.satMath ? `SAT Math: ${r.satMath}` : '',
      r.actMedian ? `ACT Median: ${r.actMedian}` : '',
      r.tuitionInState ? `In-State Tuition: $${r.tuitionInState?.toLocaleString()}` : '',
      r.tuitionOutOfState ? `Out-of-State Tuition: $${r.tuitionOutOfState?.toLocaleString()}` : '',
      r.avgNetPrice ? `Average Net Price: $${r.avgNetPrice?.toLocaleString()}` : '',
      r.retentionRate ? `Retention Rate: ${(r.retentionRate * 100).toFixed(0)}%` : '',
      r.gradRate4yr ? `4yr Graduation Rate: ${(r.gradRate4yr * 100).toFixed(0)}%` : '',
      r.medianDebt ? `Median Debt: $${r.medianDebt?.toLocaleString()}` : '',
      r.pellGrantRate ? `Pell Grant Rate: ${(r.pellGrantRate * 100).toFixed(0)}%` : '',
      r.earnings6yr ? `Earnings (6yr): $${r.earnings6yr?.toLocaleString()}` : '',
      r.earnings10yr ? `Earnings (10yr): $${r.earnings10yr?.toLocaleString()}` : '',
      ci.acceptanceRate ? `\nDetailed Acceptance: ${ci.acceptanceRate}` : '',
      ci.edAdvantage ? `ED Advantage: ${ci.edAdvantage}` : '',
      ci.lessCompetitivePaths ? `Less Competitive Paths: ${ci.lessCompetitivePaths}` : '',
      ci.schoolsWithinSchool ? `Schools Within School: ${ci.schoolsWithinSchool}` : '',
      ci.transferRate ? `Transfer: ${ci.transferRate}` : '',
      ci.financialAid ? `Financial Aid: ${ci.financialAid}` : '',
      ci.insiderTip ? `Insider Tip: ${ci.insiderTip}` : '',
      ci.essayStrategy ? `Essay Strategy: ${ci.essayStrategy}` : ''
    ].filter(Boolean).join('\n');

    chunks.push({
      source: 'admissions-data.json',
      title: `Admissions: ${schoolName}`,
      content: coreText.slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords(schoolName + ' admissions ' + coreText.slice(0, 800)),
      boostFactor: 1.0,
      isRawData: true
    });

    // CHUNK 2: School structure + programs (curriculum, majors, pathways)
    const ss = ci.schoolStructure;
    const pg = ci.programs;
    if (ss || pg) {
      const structText = [
        `School: ${schoolName} — Programs & Structure`,
        pg?.totalMajors ? `Total Undergraduate Majors: ~${pg.totalMajors}` : '',
        pg?.popularMajors?.length ? `Popular Majors: ${pg.popularMajors.join(', ')}` : '',
        pg?.uniquePrograms ? `Unique Programs: ${pg.uniquePrograms}` : '',
        pg?.curriculumHighlights ? `Curriculum: ${pg.curriculumHighlights}` : '',
        pg?.preMedPath ? `Pre-Med: ${pg.preMedPath}` : '',
        pg?.preBusinessPath ? `Pre-Business: ${pg.preBusinessPath}` : '',
        pg?.engineeringPath ? `Engineering: ${pg.engineeringPath}` : '',
        ss?.hasMultipleSchools !== undefined ? `\nMultiple Schools: ${ss.hasMultipleSchools ? 'Yes' : 'No'}` : '',
        ...(ss?.schools || []).map(s =>
          `  ${s.name}: ${s.acceptanceRate || 'N/A'}${s.notes ? ' — ' + s.notes : ''}`
        ),
        ss?.internalTransfers ? `Internal Transfers: ${ss.internalTransfers}` : '',
        ss?.dualDegreePrograms ? `Dual Degree: ${ss.dualDegreePrograms}` : ''
      ].filter(Boolean).join('\n');

      chunks.push({
        source: 'admissions-programs.json',
        title: `Programs: ${schoolName}`,
        content: structText.slice(0, MAX_CHUNK_CHARS),
        keywords: extractKeywords(schoolName + ' major program curriculum school ' + structText.slice(0, 600)),
        boostFactor: 1.0,
        isRawData: true
      });
    }

    // CHUNK 3: Community intel (Reddit/forum strategies)
    const cmi = ci.communityIntel;
    if (cmi) {
      const communityText = [
        `School: ${schoolName} — Community Intelligence`,
        cmi.source ? `Sources: ${cmi.source}` : '',
        cmi.admissionsQuirks ? `Admissions Quirks: ${cmi.admissionsQuirks}` : '',
        cmi.commonMistakes ? `Common Mistakes: ${cmi.commonMistakes}` : '',
        cmi.hiddenGems ? `Hidden Gems: ${cmi.hiddenGems}` : '',
        cmi.redditWisdom ? `Reddit Wisdom: ${cmi.redditWisdom}` : '',
        cmi.strategyTips ? `Strategy Tips: ${cmi.strategyTips}` : ''
      ].filter(Boolean).join('\n');

      chunks.push({
        source: 'admissions-community.json',
        title: `Community Intel: ${schoolName}`,
        content: communityText.slice(0, MAX_CHUNK_CHARS),
        keywords: extractKeywords(schoolName + ' strategy tips admissions ' + communityText.slice(0, 600)),
        boostFactor: 0.9,
        isRawData: true
      });
    }

    // CHUNK 4: API-sourced program earnings data (per-major outcomes)
    if (r.programs && r.programs.length > 0) {
      const top = r.programs
        .sort((a, b) => (b.medianEarnings || 0) - (a.medianEarnings || 0))
        .slice(0, 20);
      const progText = [
        `School: ${schoolName} — Program Earnings by Major`,
        ...top.map(p =>
          `${p.name} (CIP ${p.cipCode}): Median earnings $${(p.medianEarnings || 0).toLocaleString()}` +
          (p.medianDebt ? `, debt $${p.medianDebt.toLocaleString()}` : '') +
          (p.completions ? `, ${p.completions} completions/yr` : '')
        )
      ].join('\n');

      chunks.push({
        source: 'admissions-earnings.json',
        title: `Earnings by Major: ${schoolName}`,
        content: progText.slice(0, MAX_CHUNK_CHARS),
        keywords: extractKeywords(schoolName + ' earnings salary major program ' + progText.slice(0, 600)),
        boostFactor: 0.9,
        isRawData: true
      });
    }
  }

  return chunks;
}

/**
 * Parse curriculum data into retrieval chunks.
 * Each school gets 2 chunks: core requirements + popular major requirements.
 */
function parseCurriculumData(data) {
  const chunks = [];
  if (!data || typeof data !== 'object') return chunks;

  for (const [schoolName, info] of Object.entries(data)) {
    if (!info) continue;

    // CHUNK 1: Core requirements & academic structure
    const coreLines = [
      `# ${schoolName} — Curriculum & Academic Structure`,
      ''
    ];

    if (info.coreRequirements) {
      const cr = info.coreRequirements;
      coreLines.push(`Core Curriculum: ${cr.description || 'N/A'}`);
      if (cr.categories && cr.categories.length) {
        for (const cat of cr.categories) {
          coreLines.push(`  - ${cat.name}: ${cat.courses} course(s)${cat.examples ? ' (e.g., ' + cat.examples.join(', ') + ')' : ''}`);
        }
      }
      if (cr.totalCoreCourses) coreLines.push(`Total core courses: ${cr.totalCoreCourses}`);
      if (cr.writingRequirement) coreLines.push(`Writing: ${cr.writingRequirement}`);
      if (cr.foreignLanguageRequirement) coreLines.push(`Foreign Language: ${cr.foreignLanguageRequirement}`);
      if (cr.quantitativeRequirement) coreLines.push(`Quantitative: ${cr.quantitativeRequirement}`);
    }

    if (info.academicCalendar) coreLines.push(`Calendar: ${info.academicCalendar}`);
    if (info.creditsToGraduate) coreLines.push(`Credits to graduate: ${info.creditsToGraduate}`);
    if (info.averageCourseLoad) coreLines.push(`Average load: ${info.averageCourseLoad}`);
    if (info.gradingSystem) coreLines.push(`Grading: ${info.gradingSystem}`);

    if (info.uniqueAcademicFeatures && info.uniqueAcademicFeatures.length) {
      coreLines.push(`Unique features: ${info.uniqueAcademicFeatures.join('; ')}`);
    }
    if (info.researchOpportunities) coreLines.push(`Research: ${info.researchOpportunities}`);
    if (info.studyAbroad) coreLines.push(`Study abroad: ${info.studyAbroad}`);
    if (info.notableFaculty && info.notableFaculty.length) {
      coreLines.push(`Notable faculty: ${info.notableFaculty.join(', ')}`);
    }

    const coreText = coreLines.join('\n');
    chunks.push({
      source: 'curriculum-data.json',
      title: `Curriculum Overview: ${schoolName}`,
      content: coreText.slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords(schoolName + ' curriculum core requirements courses credits ' + coreText.slice(0, 600)),
      boostFactor: 1.0,
      isRawData: true
    });

    // CHUNK 2: Popular major requirements (detailed)
    if (info.popularMajorRequirements && Object.keys(info.popularMajorRequirements).length) {
      const majorLines = [`# ${schoolName} — Major Requirements Detail`, ''];

      for (const [majorName, req] of Object.entries(info.popularMajorRequirements)) {
        majorLines.push(`## ${majorName}`);
        if (req.totalCourses) majorLines.push(`  Total courses: ${req.totalCourses}`);
        if (req.prerequisites && req.prerequisites.length) majorLines.push(`  Prerequisites: ${req.prerequisites.join(', ')}`);
        if (req.coreCourses && req.coreCourses.length) majorLines.push(`  Core courses: ${req.coreCourses.join(', ')}`);
        if (req.electivesNeeded) majorLines.push(`  Electives: ${req.electivesNeeded}`);
        if (req.seniorThesis) majorLines.push(`  Thesis/Capstone: ${req.seniorThesis}`);
        if (req.typicalTimeline) majorLines.push(`  Timeline: ${req.typicalTimeline}`);
        if (req.insiderTip) majorLines.push(`  Insider tip: ${req.insiderTip}`);
        majorLines.push('');
      }

      const majorText = majorLines.join('\n');
      chunks.push({
        source: 'curriculum-majors.json',
        title: `Major Requirements: ${schoolName}`,
        content: majorText.slice(0, MAX_CHUNK_CHARS),
        keywords: extractKeywords(schoolName + ' major requirements courses prerequisites ' +
          Object.keys(info.popularMajorRequirements).join(' ') + ' ' + majorText.slice(0, 600)),
        boostFactor: 1.0,
        isRawData: true
      });
    }
  }

  return chunks;
}

/**
 * Parse local school data into retrieval chunks.
 * Data structure: { districts: {name: {...}}, privateSchools: {name: {...}},
 *   publicHighSchools: {name: {...}}, publicMiddleSchools: {name: {...}},
 *   publicElementary: { "Group Name": [{...}] } }
 */
function parseEthnicityData(data) {
  const chunks = [];
  if (!data || !data.schools) return chunks;

  for (const school of data.schools) {
    // School-level aggregate chunk
    const agg = school.schoolAggregate;
    if (agg && agg.percentages) {
      const pct = agg.percentages;
      const demoLine = Object.entries(pct)
        .filter(([k]) => !['unknown', 'nonresident_alien'].includes(k))
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}%`)
        .join(', ');

      chunks.push({
        text: `# ${school.school} — Ethnicity Demographics (${school.year})\nSchool-wide bachelor's completions: ${agg.demographics?.total || '?'} total\nBreakdown: ${demoLine}\nNonresident alien: ${pct.nonresident_alien || '?'}%`,
        keywords: [school.school.toLowerCase(), 'ethnicity', 'demographics', 'race', 'diversity'],
        boost: 1.0
      });
    }

    // Top majors with demographic breakdown (limit to top 15 per school to control size)
    const topMajors = (school.majors || []).slice(0, 15);
    for (const major of topMajors) {
      if (!major.percentages || !major.demographics?.total) continue;
      const pct = major.percentages;
      const demoLine = Object.entries(pct)
        .filter(([k]) => !['unknown', 'nonresident_alien'].includes(k))
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}%`)
        .join(', ');

      chunks.push({
        text: `# ${school.school} — ${major.majorName} — Ethnicity (${school.year})\nCompletions: ${major.demographics.total}\nBreakdown: ${demoLine}`,
        keywords: [school.school.toLowerCase(), major.majorName.toLowerCase(), 'ethnicity', 'demographics', major.cipCode],
        boost: 0.8
      });
    }
  }

  return chunks;
}

function parseDecisionDatesData(data) {
  const chunks = [];
  if (!data || !data.schools) return chunks;

  for (const school of data.schools) {
    const dates = school.decisionDates || {};
    const parts = [];
    if (dates.earlyDecisionI) parts.push(`ED I notification: ${dates.earlyDecisionI.notification} (deadline: ${dates.earlyDecisionI.deadline}, binding)`);
    if (dates.earlyDecisionII) parts.push(`ED II notification: ${dates.earlyDecisionII.notification} (deadline: ${dates.earlyDecisionII.deadline}, binding)`);
    if (dates.earlyAction) parts.push(`${dates.earlyAction.type} notification: ${dates.earlyAction.notification} (deadline: ${dates.earlyAction.deadline}${dates.earlyAction.restrictive ? ', restrictive' : ''})`);
    if (dates.regularDecision) parts.push(`RD notification: ${dates.regularDecision.notification} (deadline: ${dates.regularDecision.deadline})`);

    chunks.push({
      text: `# ${school.school} — Admissions Decision Dates (${school.cycle})\n${parts.join('\n')}\nCommitment deadline: ${school.commitmentDeadline}\n${school.notes}`,
      keywords: [school.school.toLowerCase(), 'decision', 'decisions', 'notification', 'hear back', 'results', 'when', 'dates', 'deadline'],
      boost: 0.9
    });
  }

  return chunks;
}

function parseLocalSchoolData(data) {
  const chunks = [];
  if (!data || typeof data !== 'object') return chunks;

  // Helper: flatten a school object into a text chunk
  function schoolToChunk(name, school, label) {
    const demographics = school.demographics || school.ethnicity;
    const demoStr = demographics && typeof demographics === 'object'
      ? Object.entries(demographics).map(([k, v]) => `${k}: ${v}`).join(', ')
      : (typeof demographics === 'string' ? demographics : '');
    const tuitionStr = school.tuition && typeof school.tuition === 'object'
      ? Object.entries(school.tuition).map(([k, v]) => `${k}: ${v}`).join(', ')
      : (typeof school.tuition === 'string' ? school.tuition : '');
    const strengthsStr = Array.isArray(school.strengths) ? school.strengths.join('; ') : (school.strengths || '');
    const weaknessesStr = Array.isArray(school.weaknesses) ? school.weaknesses.join('; ') : (school.weaknesses || '');
    const programsStr = Array.isArray(school.keyPrograms) ? school.keyPrograms.join('; ')
      : (Array.isArray(school.programs) ? school.programs.join('; ') : '');

    const lines = [
      `# ${name} (${label})`,
      school.location ? `Location: ${school.location}` : '',
      school.district ? `District: ${school.district}` : '',
      school.grades || school.gradeLevels ? `Grades: ${school.grades || school.gradeLevels}` : '',
      school.enrollment || school.totalEnrollment ? `Students: ${(school.enrollment || school.totalEnrollment).toLocaleString()}` : '',
      tuitionStr ? `Tuition: ${tuitionStr}` : '',
      school.acceptanceRate ? `Acceptance Rate: ${school.acceptanceRate}` : '',
      school.studentTeacherRatio ? `Student-Teacher Ratio: ${school.studentTeacherRatio}` : '',
      school.overallGraduationRate ? `Graduation Rate: ${school.overallGraduationRate}` : '',
      school.perPupilSpending ? `Per-Pupil Spending: ${school.perPupilSpending}` : '',
      school.stateRanking ? `State Ranking: ${school.stateRanking}` : '',
      school.satScores || school.avgSAT ? `SAT: ${school.satScores || school.avgSAT}` : '',
      school.actScores || school.avgACT ? `ACT: ${school.actScores || school.avgACT}` : '',
      school.apCourses ? `AP Courses: ${school.apCourses}` : '',
      school.collegeMatriculation ? `College Matriculation: ${school.collegeMatriculation}` : '',
      school.testScores ? `Test Scores: ${school.testScores}` : '',
      demoStr ? `Demographics: ${demoStr}` : '',
      school.freeReducedLunchPercentage ? `Free/Reduced Lunch: ${school.freeReducedLunchPercentage}` : '',
      programsStr ? `Programs: ${programsStr}` : '',
      school.culture ? `Culture: ${school.culture}` : '',
      school.reputation ? `Reputation: ${school.reputation}` : '',
      strengthsStr ? `Strengths: ${strengthsStr}` : '',
      weaknessesStr ? `Weaknesses: ${weaknessesStr}` : '',
      school.insiderTip ? `Insider Tip: ${school.insiderTip}` : '',
      school.notableAlumni ? `Notable Alumni: ${school.notableAlumni}` : '',
      school.collegeReadiness ? `College Readiness: ${school.collegeReadiness}` : ''
    ].filter(Boolean).join('\n');

    return {
      source: 'local-schools.json',
      title: `${label}: ${name}`,
      content: lines.slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords(name + ' ' + label + ' school ' + (school.location || '') + ' ' +
        (school.district || '') + ' ' + lines.slice(0, 600)),
      boostFactor: 0.9,
      isRawData: true
    };
  }

  // Parse districts (object with district names as keys)
  if (data.districts && typeof data.districts === 'object') {
    for (const [districtName, info] of Object.entries(data.districts)) {
      chunks.push(schoolToChunk(districtName, info, 'School District'));
    }
  }

  // Parse school sections (objects with school names as keys)
  const schoolSections = [
    { key: 'privateSchools', label: 'Private School' },
    { key: 'publicHighSchools', label: 'Public High School' },
    { key: 'publicMiddleSchools', label: 'Public Middle School' }
  ];

  for (const { key, label } of schoolSections) {
    if (!data[key] || typeof data[key] !== 'object') continue;
    for (const [schoolName, school] of Object.entries(data[key])) {
      chunks.push(schoolToChunk(school.name || schoolName, school, label));
    }
  }

  // Parse elementary schools (grouped by district — each value is an array)
  if (data.publicElementary && typeof data.publicElementary === 'object') {
    for (const [groupName, schools] of Object.entries(data.publicElementary)) {
      if (!Array.isArray(schools)) continue;
      for (const school of schools) {
        chunks.push(schoolToChunk(school.name || 'Unknown', school, 'Elementary School'));
      }
    }
  }

  return chunks;
}

function parseRedditSalary(records) {
  // Only include highly-rated threads
  return records
    .filter(r => (r.score || 0) > 20)
    .slice(0, 100) // Cap at 100 most relevant
    .map(r => {
      const text = [
        r.title,
        r.subreddit ? `(r/${r.subreddit})` : '',
        r.content ? r.content.slice(0, 1500) : '',
        r.topComments?.length ? `\nTop insight: ${r.topComments[0].body?.slice(0, 500)}` : ''
      ].filter(Boolean).join('\n');

      return {
        source: 'reddit-salary-discussions.json',
        title: `Reddit Salary: ${r.title?.slice(0, 120)}`,
        content: text.slice(0, MAX_CHUNK_CHARS),
        keywords: extractKeywords(text.slice(0, 1000)),
        boostFactor: 0.6,
        isRawData: true
      };
    });
}

function parseRedditStories(records) {
  return records
    .filter(r => (r.score || 0) > 10)
    .slice(0, 50)
    .map(r => {
      const text = [
        r.title,
        r.subreddit ? `(r/${r.subreddit})` : '',
        r.content ? r.content.slice(0, 2000) : '',
        r.topComments?.length ? `\nTop comment: ${r.topComments[0].body?.slice(0, 500)}` : ''
      ].filter(Boolean).join('\n');

      return {
        source: 'reddit-career-stories.json',
        title: `Career Story: ${r.title?.slice(0, 120)}`,
        content: text.slice(0, MAX_CHUNK_CHARS),
        keywords: extractKeywords(text.slice(0, 1000)),
        boostFactor: 0.6,
        isRawData: true
      };
    });
}

function parseRedditAdvice(records) {
  return records
    .filter(r => (r.score || 0) > 50)
    .slice(0, 80)
    .map(r => {
      const text = [
        r.title,
        r.subreddit ? `(r/${r.subreddit})` : '',
        r.content ? r.content.slice(0, 1500) : '',
        r.topComments?.length ? `\nTop advice: ${r.topComments[0].body?.slice(0, 500)}` : ''
      ].filter(Boolean).join('\n');

      return {
        source: 'reddit-advice-threads.json',
        title: `Career Advice: ${r.title?.slice(0, 120)}`,
        content: text.slice(0, MAX_CHUNK_CHARS),
        keywords: extractKeywords(text.slice(0, 1000)),
        boostFactor: 0.6,
        isRawData: true
      };
    });
}

// ─── Scoring ──────────────────────────────────────────────────────

function scoreChunk(chunk, queryKeywords) {
  let score = 0;
  const chunkKeywordSet = new Set(chunk.keywords);

  for (const keyword of queryKeywords) {
    if (chunkKeywordSet.has(keyword)) {
      score += 2;
    }
    for (const ck of chunk.keywords) {
      if (ck !== keyword && (ck.includes(keyword) || keyword.includes(ck))) {
        score += 1;
      }
    }
  }

  const titleKeywords = extractKeywords(chunk.title);
  for (const keyword of queryKeywords) {
    if (titleKeywords.includes(keyword)) {
      score += 3;
    }
  }

  return score;
}

// ─── Query Intent Classification ──────────────────────────────
// Classify the intent BEFORE routing so we can make smarter decisions
// about what context to assemble. Not just "what topic" but "what kind
// of question" — this determines breadth and depth.

const INTENT_PATTERNS = {
  specific_lookup: {
    signals: ['what is', 'tell me about', 'how much', 'what are the', 'acceptance rate',
      'tuition at', 'sat score', 'salary for', 'requirements for', 'prerequisites for'],
    namedEntityBoost: true
  },
  comparison: {
    signals: ['compare', 'versus', 'vs', 'or', 'better', 'difference between',
      'which is', 'should i choose', 'pros and cons', 'trade-off']
  },
  strategic: {
    signals: ['plan', 'strategy', 'roadmap', 'timeline', 'steps', 'how do i',
      'how should i', 'what should i', 'best approach', 'game plan', 'prepare']
  },
  financial: {
    signals: ['worth', 'roi', 'cost', 'afford', 'investment', 'pay off', 'debt',
      'salary', 'earn', 'income', 'money', 'financial', 'tuition', 'scholarship', 'aid']
  },
  exploratory: {
    signals: ['what careers', 'what jobs', 'what options', 'interested in', 'thinking about',
      'not sure', 'undecided', 'explore', 'possibilities', 'ideas', 'suggestions']
  },
  personal: {
    signals: ['worried', 'stressed', 'anxious', 'pressure', 'scared', 'frustrated',
      'confused', 'overwhelmed', 'lost', 'stuck', 'behind', 'too late', 'regret',
      'parent', 'my child', 'my kid', 'my son', 'my daughter']
  }
};

function classifyIntent(query) {
  const lower = query.toLowerCase();
  const intentScores = {};

  for (const [intent, config] of Object.entries(INTENT_PATTERNS)) {
    let score = 0;
    for (const signal of config.signals) {
      if (lower.includes(signal)) score += 2;
    }
    if (config.namedEntityBoost) {
      const words = query.split(/\s+/);
      for (let i = 1; i < words.length; i++) {
        if (words[i].length > 2 && /^[A-Z]/.test(words[i]) && words[i] !== words[i].toUpperCase()) {
          score += 1;
        }
      }
    }
    if (score > 0) intentScores[intent] = score;
  }

  const sorted = Object.entries(intentScores).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return { primary: 'exploratory', secondary: null, all: {} };

  return {
    primary: sorted[0][0],
    secondary: sorted.length > 1 ? sorted[1][0] : null,
    all: Object.fromEntries(sorted)
  };
}

// ─── STAGE 1: Category Router ────────────────────────────────────
//
// Redesigned to avoid "dumb dumps." Key principles:
//   1. Specific triggers (school names, role titles) weighted 4x
//   2. Ambiguous words ("school", "college") only 1x — won't drive routing alone
//   3. A category needs at least 1 specific hit OR 3+ ambiguous co-occurrences
//   4. Never falls back to ALL categories — uses data_synthesis as general fallback
//   5. Gap between #1 and #2 score determines how many categories to include

const AMBIGUOUS_TRIGGERS = new Set([
  'school', 'college', 'university', 'degree', 'program', 'course',
  'study', 'student', 'class', 'apply', 'application', 'career',
  'field', 'industry', 'job', 'work', 'professional', 'senior',
  'junior', 'first', 'level', 'experience', 'skills', 'start',
  'education', 'training', 'prep', 'plan', 'future', 'high',
  'public', 'private', 'state', 'community', 'online'
]);

function routeQuery(queryKeywords, intent) {
  const scores = {};

  for (const [catName, cat] of Object.entries(CATEGORIES)) {
    let catScore = 0;
    let specificHits = 0;
    let ambiguousHits = 0;
    const triggerSet = new Set(cat.triggers);

    for (const keyword of queryKeywords) {
      if (triggerSet.has(keyword)) {
        if (AMBIGUOUS_TRIGGERS.has(keyword)) {
          catScore += 1;
          ambiguousHits++;
        } else {
          catScore += 4; // specific triggers get heavy weight
          specificHits++;
        }
      }
      // Partial match only for non-ambiguous, min 4-char keywords
      for (const trigger of cat.triggers) {
        if (trigger !== keyword && !AMBIGUOUS_TRIGGERS.has(trigger) && !AMBIGUOUS_TRIGGERS.has(keyword)) {
          if ((trigger.includes(keyword) || keyword.includes(trigger)) && Math.min(trigger.length, keyword.length) >= 4) {
            catScore += 1;
          }
        }
      }
    }

    // Gate: needs at least 1 specific hit OR 3+ ambiguous co-occurrences
    if (specificHits >= 1 || ambiguousHits >= 3) {
      scores[catName] = { total: catScore, specific: specificHits, ambiguous: ambiguousHits };
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1].total - a[1].total);

  if (sorted.length === 0) {
    // Graceful fallback — NOT a dump of everything
    return { categories: ['data_synthesis'], routing: 'fallback', scores: {} };
  }

  const topScore = sorted[0][1].total;
  const topName = sorted[0][0];
  const matched = [topName];

  // Intent-aware secondary category inclusion:
  // - comparison/financial intents benefit from 2 categories
  // - specific_lookup should stay narrow
  // - exploratory can go slightly wider
  const intentBreadth = (intent?.primary === 'comparison' || intent?.primary === 'financial') ? 0.4
    : (intent?.primary === 'exploratory') ? 0.5
    : 0.55; // specific_lookup, strategic, personal → stay narrow

  for (let i = 1; i < sorted.length && i < 3; i++) {
    const ratio = sorted[i][1].total / topScore;
    if (ratio >= intentBreadth && sorted[i][1].specific >= 1) {
      matched.push(sorted[i][0]);
    } else if (ratio >= 0.75 && sorted[i][1].total >= 4) {
      matched.push(sorted[i][0]);
    }
  }

  return {
    categories: matched,
    routing: matched.length === 1 ? 'targeted' : matched.length === 2 ? 'focused' : 'moderate',
    scores: Object.fromEntries(sorted.slice(0, 6).map(([k, v]) => [k, v.total]))
  };
}

// ─── Knowledge Loading (Layer 1 + 2) ────────────────────────────

async function loadMarkdownFile(dir, filename, boostFactor = 1.0) {
  try {
    const content = await fs.readFile(join(dir, filename), 'utf-8');
    const parsed = parseMarkdown(content, filename);
    for (const chunk of parsed) {
      chunk.boostFactor = boostFactor;
    }
    return parsed;
  } catch {
    return [];
  }
}

async function buildCategoryIndex() {
  const now = Date.now();
  if (categoryIndex && (now - categoryTimestamp) < CACHE_TTL) {
    return categoryIndex;
  }

  console.log('Building category-indexed knowledge base...');
  const index = {};
  const distilledDir = join(PATHS.knowledgeBase, 'distilled');
  const loadedFiles = new Set();

  for (const [catName, cat] of Object.entries(CATEGORIES)) {
    index[catName] = [];
    for (const file of cat.files) {
      if (!loadedFiles.has(file)) {
        const chunks = await loadMarkdownFile(distilledDir, file, 2.0);
        for (const chunk of chunks) {
          chunk.category = catName;
        }
        index[catName].push(...chunks);
        loadedFiles.add(file);
      } else {
        for (const [otherCat, otherChunks] of Object.entries(index)) {
          if (otherCat !== catName) {
            const shared = otherChunks.filter(c => cat.files.includes(c.source));
            index[catName].push(...shared);
          }
        }
      }
    }
  }

  // Base knowledge files
  const baseChunks = [];
  try {
    const files = await fs.readdir(PATHS.knowledgeBase);
    for (const file of files.filter(f => f.endsWith('.md'))) {
      const chunks = await loadMarkdownFile(PATHS.knowledgeBase, file, 1.0);
      baseChunks.push(...chunks);
    }
  } catch { /* OK */ }
  index._base = baseChunks;

  let totalChunks = 0;
  for (const [cat, chunks] of Object.entries(index)) {
    if (cat !== '_base') totalChunks += chunks.length;
  }
  console.log(`  Distilled index: ${Object.keys(index).length - 1} categories, ${totalChunks} chunks + ${baseChunks.length} base`);

  categoryIndex = index;
  categoryTimestamp = now;
  return index;
}

// ─── Raw Data Loading (Layer 3) ──────────────────────────────────
// Robust error handling: missing files, corrupted JSON, empty data

async function loadJsonFile(filename) {
  try {
    const filePath = join(PATHS.scraped, filename);
    const raw = await fs.readFile(filePath, 'utf-8');

    // Check if file is empty or just whitespace
    if (!raw || raw.trim().length === 0) {
      console.warn(`[Knowledge] Warning: ${filename} is empty`);
      return null;
    }

    const parsed = JSON.parse(raw);

    // Validate parsed data is not null/undefined/empty
    if (!parsed || (typeof parsed === 'object' && Object.keys(parsed).length === 0)) {
      console.warn(`[Knowledge] Warning: ${filename} parsed to empty object`);
      return null;
    }

    return parsed;
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File not found — expected for optional data files
      console.debug(`[Knowledge] Data file not found: ${filename}`);
    } else if (err instanceof SyntaxError) {
      // JSON parse error — log but don't crash
      console.warn(`[Knowledge] JSON parse error in ${filename}: ${err.message}`);
    } else {
      // Other file system errors
      console.warn(`[Knowledge] Error loading ${filename}: ${err.message}`);
    }
    return null;
  }
}

// ─── New Data Parsers (Graduate, Financial Aid, International, Trades, Military) ─

function parseGradPrograms(programs) {
  const chunks = [];
  for (const prog of programs) {
    if (prog.topPrograms) {
      const text = [
        `Graduate Program Type: ${prog.type}`,
        ...(prog.topPrograms || []).map(p =>
          `${p.school}: Rank #${p.ranking}` +
          (p.medianGMAT ? `, GMAT ${p.medianGMAT}` : '') +
          (p.medianLSAT ? `, LSAT ${p.medianLSAT}` : '') +
          (p.medianMCAT ? `, MCAT ${p.medianMCAT}` : '') +
          (p.acceptanceRate ? `, Accept ${(p.acceptanceRate * 100).toFixed(0)}%` : '') +
          (p.medianSalary ? `, Median Salary $${p.medianSalary.toLocaleString()}` : '') +
          (p.tuition ? `, Tuition $${p.tuition.toLocaleString()}` : '')
        ),
        prog.overview ? `\nOverview: ${JSON.stringify(prog.overview).slice(0, 800)}` : ''
      ].filter(Boolean).join('\n');

      chunks.push({
        source: 'graduate-programs.json',
        title: `Graduate: ${prog.type}`,
        content: text.slice(0, MAX_CHUNK_CHARS),
        keywords: extractKeywords(prog.type + ' graduate ' + text.slice(0, 500)),
        boostFactor: 0.9,
        isRawData: true
      });
    }
    if (prog.overview && !prog.topPrograms) {
      chunks.push({
        source: 'graduate-programs.json',
        title: `Graduate: ${prog.type}`,
        content: JSON.stringify(prog.overview).slice(0, MAX_CHUNK_CHARS),
        keywords: extractKeywords(prog.type + ' graduate program'),
        boostFactor: 0.9,
        isRawData: true
      });
    }
  }
  return chunks;
}

function parseFinancialAidGuide(data) {
  const chunks = [];
  for (const [section, content] of Object.entries(data)) {
    if (section === 'lastUpdated' || section === 'source') continue;
    const text = typeof content === 'string' ? content : JSON.stringify(content, null, 1).slice(0, MAX_CHUNK_CHARS);
    chunks.push({
      source: 'financial-aid-guide.json',
      title: `Financial Aid: ${section.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}`,
      content: text,
      keywords: extractKeywords('financial aid fafsa css scholarship merit ' + section + ' ' + text.slice(0, 300)),
      boostFactor: 1.0,
      isRawData: true
    });
  }
  return chunks;
}

function parseInternationalEducation(data) {
  const chunks = [];
  if (data.studyAbroad?.topDestinations) {
    for (const dest of data.studyAbroad.topDestinations) {
      const text = JSON.stringify(dest, null, 1).slice(0, MAX_CHUNK_CHARS);
      chunks.push({
        source: 'international-education.json',
        title: `Study Abroad: ${dest.country}`,
        content: text,
        keywords: extractKeywords('international study abroad ' + dest.country + ' ' + (dest.topSchools || []).join(' ')),
        boostFactor: 0.9,
        isRawData: true
      });
    }
  }
  if (data.internationalStudentsInUS) {
    chunks.push({
      source: 'international-education.json',
      title: 'International Students in US',
      content: JSON.stringify(data.internationalStudentsInUS, null, 1).slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords('international student visa f1 financial aid toefl ielts'),
      boostFactor: 0.9,
      isRawData: true
    });
  }
  return chunks;
}

function parseTradesData(data) {
  const chunks = [];
  if (data.highDemandTrades) {
    for (const trade of data.highDemandTrades) {
      const text = [
        `Trade: ${trade.trade}`,
        `Median Pay: $${trade.medianPay?.toLocaleString()}`,
        `Top Pay: $${trade.topPay?.toLocaleString()}`,
        `Job Growth: ${trade.jobGrowth}`,
        `Apprenticeship: ${trade.apprenticeshipLength}`,
        trade.specializations ? `Specializations: ${trade.specializations.join(', ')}` : '',
        trade.demandDrivers ? `Demand Drivers: ${trade.demandDrivers}` : '',
        trade.unionVsNonUnion ? `Union vs Non-Union: ${trade.unionVsNonUnion}` : '',
        trade.note || ''
      ].filter(Boolean).join('\n');

      chunks.push({
        source: 'trades-apprenticeships.json',
        title: `Trade: ${trade.trade}`,
        content: text.slice(0, MAX_CHUNK_CHARS),
        keywords: extractKeywords(trade.trade + ' trade apprenticeship union salary ' + text.slice(0, 300)),
        boostFactor: 0.9,
        isRawData: true
      });
    }
  }
  if (data.pathways) {
    chunks.push({
      source: 'trades-apprenticeships.json',
      title: 'Trade Career Pathways',
      content: JSON.stringify(data.pathways, null, 1).slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords('trade apprenticeship union non-union pathway'),
      boostFactor: 0.8,
      isRawData: true
    });
  }
  return chunks;
}

function parseMilitaryData(data) {
  const chunks = [];
  if (data.giBill) {
    chunks.push({
      source: 'military-transitions.json',
      title: 'GI Bill & Military Education Benefits',
      content: JSON.stringify(data.giBill, null, 1).slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords('gi bill veteran military education post 911 yellow ribbon voc rehab'),
      boostFactor: 1.0,
      isRawData: true
    });
  }
  if (data.careerTransitions?.topInDemandPaths) {
    for (const path of data.careerTransitions.topInDemandPaths) {
      const text = JSON.stringify(path, null, 1).slice(0, MAX_CHUNK_CHARS);
      chunks.push({
        source: 'military-transitions.json',
        title: `Military → ${path.path}`,
        content: text,
        keywords: extractKeywords('military veteran transition career ' + path.path + ' mos'),
        boostFactor: 0.9,
        isRawData: true
      });
    }
  }
  if (data.securityClearance) {
    chunks.push({
      source: 'military-transitions.json',
      title: 'Security Clearance Career Value',
      content: JSON.stringify(data.securityClearance, null, 1).slice(0, MAX_CHUNK_CHARS),
      keywords: extractKeywords('security clearance ts sci secret defense contractor'),
      boostFactor: 0.8,
      isRawData: true
    });
  }
  return chunks;
}

async function buildRawDataIndex() {
  const now = Date.now();
  if (rawDataIndex && (now - rawDataTimestamp) < CACHE_TTL) {
    return rawDataIndex;
  }

  console.log('Building raw data reserve index...');
  const index = {};

  // ── Try SQLite first for structured data (BLS, H1B, Census, COL, Scorecard) ──
  let sqliteLoaded = false;
  if (KnowledgeDB) {
    try {
      const db = await KnowledgeDB.getInstance();
      if (db.isAvailable) {
        const sqlChunks = db.buildRAGChunks();
        let totalChunks = 0;
        for (const [category, chunks] of Object.entries(sqlChunks)) {
          if (chunks.length > 0) {
            index[category] = chunks;
            totalChunks += chunks.length;
            console.log(`  ${category}: ${chunks.length} chunks (from SQLite)`);
          }
        }
        if (totalChunks > 0) {
          sqliteLoaded = true;
          console.log(`  ✓ SQLite loaded ${totalChunks} total chunks across ${Object.keys(sqlChunks).length} categories`);
        }
      }
    } catch (err) {
      console.warn('  ⚠ SQLite query failed, falling back to JSON:', err.message);
    }
  }

  // O*NET occupations (25 detailed profiles) — always from JSON (not in SQLite yet)
  const onet = await loadJsonFile('onet-occupations.json');
  if (onet) {
    index.raw_onet = parseOnetRecords(onet);
    console.log(`  raw_onet: ${index.raw_onet.length} occupation profiles`);
  }

  // ── JSON fallback for BLS/H1B/Census/COL/Scorecard (only if SQLite didn't load them) ──
  if (!sqliteLoaded) {
    // BLS occupations — prefer new OEWS compensation data, fall back to legacy
    const blsComp = await loadJsonFile('bls-compensation.json');
    const blsLegacy = await loadJsonFile('bls-occupations.json');
    if (blsComp && blsComp.length > 0) {
      index.raw_bls = parseBLSRecords(blsComp);
      console.log(`  raw_bls: ${index.raw_bls.length} occupations (OEWS compensation data — JSON fallback)`);
    } else if (blsLegacy) {
      index.raw_bls = parseBLSRecords(blsLegacy);
      console.log(`  raw_bls: ${index.raw_bls.length} occupation records (legacy OOH scraper — no wage data)`);
    }

    // Census ACS — earnings by education level
    const censusEd = await loadJsonFile('census-education-earnings.json');
    if (censusEd) {
      index.raw_census = parseCensusRecords(censusEd);
      console.log(`  raw_census: ${index.raw_census.length} education-earnings records (JSON fallback)`);
    }

    // Cost of Living — Regional Price Parities
    const col = await loadJsonFile('cost-of-living.json');
    if (col) {
      index.raw_col = parseCOLRecords(col);
      console.log(`  raw_col: ${index.raw_col.length} geographic cost-of-living records (JSON fallback)`);
    }

    // H1B LCA — company-specific compensation data
    const h1b = await loadJsonFile('h1b-compensation.json');
    if (h1b) {
      index.raw_h1b = parseH1BRecords(h1b);
      console.log(`  raw_h1b: ${index.raw_h1b.length} SOC codes with company-specific H1B wage data (JSON fallback)`);
    }

    // College Scorecard — institution-specific earnings by program
    const scorecard = await loadJsonFile('scorecard-earnings.json');
    if (scorecard) {
      index.raw_scorecard = parseScorecardRecords(scorecard);
      console.log(`  raw_scorecard: ${index.raw_scorecard.length} records (JSON fallback)`);
    }
  }

  // NCES earnings by major
  const nces = await loadJsonFile('nces-earnings-by-major.json');
  if (nces) {
    index.raw_nces = parseNCESRecords(nces);
    console.log(`  raw_nces: ${index.raw_nces.length} major records`);
  }

  // Certifications
  const certs = await loadJsonFile('certifications.json');
  if (certs) {
    index.raw_certifications = parseCertifications(certs);
    console.log(`  raw_certifications: ${index.raw_certifications.length} certs`);
  }

  // Admissions data — the scraper saves as { scorecardProfiles: [], strategicIntel: [] }
  const admissions = await loadJsonFile('college-admissions.json')
    || await loadJsonFile('admissions-data.json');
  if (admissions) {
    // Merge scorecard profiles with curated strategic intel by school name
    const profiles = admissions.scorecardProfiles || [];
    const intel = admissions.strategicIntel || [];

    // Build a lookup of curated intel by school name
    const intelBySchool = {};
    for (const si of intel) {
      const key = (si.school || '').toLowerCase().trim();
      if (key) intelBySchool[key] = si;
    }

    // Merge: attach curated intel to matching scorecard profiles
    const merged = profiles.map(p => {
      const key = (p.name || '').toLowerCase().trim();
      const match = intelBySchool[key];
      return match ? { ...p, curatedIntel: match } : p;
    });

    // Also add curated-only schools (no scorecard match)
    const profileNames = new Set(profiles.map(p => (p.name || '').toLowerCase().trim()));
    for (const si of intel) {
      const key = (si.school || '').toLowerCase().trim();
      if (!profileNames.has(key)) {
        merged.push({ name: si.school, curatedIntel: si });
      }
    }

    index.raw_admissions = parseAdmissionsData(merged);
    console.log(`  raw_admissions: ${index.raw_admissions.length} school profiles (${profiles.length} scorecard + ${intel.length} curated)`);
  } else {
    index.raw_admissions = [];
    console.log('  raw_admissions: no data file found (run admissions scraper)');
  }

  // Curriculum data (course catalogs, major requirements, core curriculum)
  const curriculum = await loadJsonFile('curriculum-data.json');
  if (curriculum) {
    index.raw_curriculum = parseCurriculumData(curriculum);
    console.log(`  raw_curriculum: ${index.raw_curriculum.length} curriculum chunks`);
  } else {
    index.raw_curriculum = [];
    console.log('  raw_curriculum: no data file found (run curriculum scraper)');
  }

  // Local school data (Seattle/Bellevue metro — districts, private, public, middle, elementary)
  const localSchools = await loadJsonFile('local-schools.json');
  if (localSchools) {
    index.raw_local_schools = parseLocalSchoolData(localSchools);
    console.log(`  raw_local_schools: ${index.raw_local_schools.length} school profiles`);
  } else {
    index.raw_local_schools = [];
    console.log('  raw_local_schools: no data file found (run local schools scraper)');
  }

  // IPEDS Ethnicity demographics by school and major
  const ethnicityData = await loadJsonFile('ethnicity-demographics.json');
  if (ethnicityData && ethnicityData.schools) {
    index.raw_ethnicity = parseEthnicityData(ethnicityData);
    console.log(`  raw_ethnicity: ${index.raw_ethnicity.length} school-major demographic profiles`);
  } else {
    index.raw_ethnicity = [];
    console.log('  raw_ethnicity: no data file found (run ethnicity demographics scraper)');
  }

  // Admissions decision dates
  const decisionData = await loadJsonFile('decision-dates.json');
  if (decisionData && decisionData.schools) {
    index.raw_decision_dates = parseDecisionDatesData(decisionData);
    console.log(`  raw_decision_dates: ${index.raw_decision_dates.length} school decision profiles`);
  } else {
    index.raw_decision_dates = [];
    console.log('  raw_decision_dates: no data file found');
  }

  // Reddit salary discussions
  const salaryThreads = await loadJsonFile('reddit-salary-discussions.json');
  if (salaryThreads) {
    index.raw_reddit_salary = parseRedditSalary(salaryThreads);
    console.log(`  raw_reddit_salary: ${index.raw_reddit_salary.length} threads`);
  }

  // Reddit career stories
  const stories = await loadJsonFile('reddit-career-stories.json');
  if (stories) {
    index.raw_reddit_stories = parseRedditStories(stories);
    console.log(`  raw_reddit_stories: ${index.raw_reddit_stories.length} stories`);
  }

  // Reddit advice threads
  const advice = await loadJsonFile('reddit-advice-threads.json');
  if (advice) {
    index.raw_reddit_advice = parseRedditAdvice(advice);
    console.log(`  raw_reddit_advice: ${index.raw_reddit_advice.length} threads`);
  }

  // Graduate programs (MBA, JD, MD, PhD, PA/NP/PT/OT)
  const gradPrograms = await loadJsonFile('graduate-programs.json');
  if (gradPrograms?.programs) {
    index.raw_grad_programs = parseGradPrograms(gradPrograms.programs);
    console.log(`  raw_grad_programs: ${index.raw_grad_programs.length} program profiles`);
  }

  // Financial aid guide (FAFSA, CSS, merit, 529, need-blind)
  const finAid = await loadJsonFile('financial-aid-guide.json');
  if (finAid) {
    index.raw_financial_aid = parseFinancialAidGuide(finAid);
    console.log(`  raw_financial_aid: ${index.raw_financial_aid.length} chunks`);
  }

  // International education pathways
  const intlEd = await loadJsonFile('international-education.json');
  if (intlEd) {
    index.raw_international = parseInternationalEducation(intlEd);
    console.log(`  raw_international: ${index.raw_international.length} chunks`);
  }

  // Trades & apprenticeship data
  const trades = await loadJsonFile('trades-apprenticeships.json');
  if (trades) {
    index.raw_trades = parseTradesData(trades);
    console.log(`  raw_trades: ${index.raw_trades.length} chunks`);
  }

  // Military transition pathways
  const military = await loadJsonFile('military-transitions.json');
  if (military) {
    index.raw_military = parseMilitaryData(military);
    console.log(`  raw_military: ${index.raw_military.length} chunks`);
  }

  let totalRaw = 0;
  let totalCharsRaw = 0;
  for (const chunks of Object.values(index)) {
    for (const chunk of chunks) {
      totalRaw++;
      totalCharsRaw += (chunk.content || '').length;
    }
  }

  // ─── MEMORY MANAGEMENT: Check index size ─────────────────────────
  // With 5+ new data files, ensure we don't exceed reasonable memory footprint
  const MAX_RAW_CHARS = 50 * 1024 * 1024; // 50MB safety limit
  if (totalCharsRaw > MAX_RAW_CHARS) {
    console.warn(`[Knowledge] WARNING: Raw data index is ${(totalCharsRaw / 1024 / 1024).toFixed(1)}MB`);
    console.warn(`[Knowledge] Consider pruning or archiving older data files to stay under ${MAX_RAW_CHARS / 1024 / 1024}MB`);
  }

  console.log(`  Raw data reserve ready: ${totalRaw} total chunks across ${Object.keys(index).length} data sources`);
  console.log(`  Memory footprint: ~${(totalCharsRaw / 1024 / 1024).toFixed(1)}MB`);

  rawDataIndex = index;
  rawDataTimestamp = now;
  return index;
}

// ─── Dual Brain System (standard mode) ────────────────────────────
//
// Two separate brains: career-brain.md and admissions-brain.md
// Quick keyword routing determines which brain to serve (or both in
// rare cross-over queries). Saves ~50% tokens on every standard query.

const ADMISSIONS_SIGNALS = [
  'admissions', 'admission', 'acceptance', 'accepted', 'apply', 'application',
  'essay', 'sat', 'act', 'gpa', 'extracurricular', 'recommendation',
  'early', 'decision', 'ivy', 'league', 'harvard', 'yale', 'princeton',
  'stanford', 'mit', 'columbia', 'penn', 'cornell', 'brown', 'dartmouth',
  'duke', 'northwestern', 'caltech', 'uchicago', 'georgetown', 'vanderbilt',
  'rice', 'emory', 'notre dame', 'usc', 'nyu', 'berkeley', 'ucla',
  'target school', 'reach school', 'safety school', 'waitlist', 'defer',
  'transfer', 'common app', 'supplement', 'parent', 'child', 'kid',
  'son', 'daughter', 'teenager', 'high school', 'junior', 'senior',
  'college', 'pre-college', 'college prep', 'college list', 'school list', 'university',
  'curriculum', 'course', 'courses', 'prerequisite', 'credits',
  'financial aid', 'fafsa', 'scholarship', 'tuition', 'net price',
  'middle school', 'elementary', '9th grade', '10th grade', '11th grade', '12th grade',
  'freshman year', 'sophomore year'
];

async function loadBrains() {
  const now = Date.now();
  if (careerBrainCache && admissionsBrainCache && (now - brainCacheTimestamp) < CACHE_TTL) {
    return;
  }

  console.log('Loading dual brains (career + admissions)...');
  const distilledDir = join(PATHS.knowledgeBase, 'distilled');

  try {
    careerBrainCache = await fs.readFile(join(distilledDir, 'career-brain.md'), 'utf-8');
    console.log(`  Career brain loaded: ${careerBrainCache.length} chars`);
  } catch (err) {
    console.warn('  Could not load career-brain.md:', err.message);
    // Fallback to general-brain.md
    try {
      careerBrainCache = await fs.readFile(join(distilledDir, 'general-brain.md'), 'utf-8');
      console.log('  Fell back to general-brain.md');
    } catch { careerBrainCache = ''; }
  }

  try {
    admissionsBrainCache = await fs.readFile(join(distilledDir, 'admissions-brain.md'), 'utf-8');
    console.log(`  Admissions brain loaded: ${admissionsBrainCache.length} chars`);
  } catch (err) {
    console.warn('  Could not load admissions-brain.md:', err.message);
    admissionsBrainCache = '';
  }

  brainCacheTimestamp = now;
}

// Strong admissions signals — these alone indicate admissions context
const STRONG_ADMISSIONS = new Set([
  'admissions', 'admission', 'acceptance', 'accepted', 'essay', 'sat', 'act',
  'gpa', 'extracurricular', 'recommendation', 'early decision', 'ivy', 'league',
  'waitlist', 'defer', 'deferred', 'common app', 'supplement', 'college prep', 'college list',
  'financial aid', 'fafsa', 'scholarship', 'middle school', 'elementary',
  'pre-college', 'precollege', 'lakeside', 'bush school', 'overlake',
  'decision date', 'decision dates', 'hear back', 'hearing back', 'notification',
  'when will i hear', 'when do i hear', 'results come out', 'ivy day',
  // Named schools are unambiguous admissions signals
  'harvard', 'yale', 'princeton', 'stanford', 'mit', 'columbia', 'penn',
  'cornell', 'brown', 'dartmouth', 'duke', 'northwestern', 'caltech',
  'uchicago', 'georgetown', 'vanderbilt', 'rice', 'emory', 'notre dame',
  'usc', 'nyu', 'berkeley', 'ucla', 'umich', 'uva'
]);

// Weak admissions signals — need multiple OR paired with a strong signal
const WEAK_ADMISSIONS = new Set([
  'college', 'university', 'school', 'course', 'courses', 'curriculum',
  'parent', 'child', 'kid', 'son', 'daughter', 'teenager', 'tuition',
  'high school', 'junior', 'senior', 'freshman', 'sophomore',
  'transfer', 'credits', 'prerequisite', 'apply', 'application'
]);

function detectBrainType(query) {
  if (!query) return 'career';
  const lower = query.toLowerCase();

  let strongHits = 0;
  let weakHits = 0;

  for (const signal of STRONG_ADMISSIONS) {
    if (lower.includes(signal)) strongHits++;
  }
  for (const signal of WEAK_ADMISSIONS) {
    if (lower.includes(signal)) weakHits++;
  }

  // Strong signal(s) alone → admissions
  if (strongHits >= 1) return 'admissions';
  // 2+ weak signals → probably admissions (e.g., "my daughter is in high school")
  // Lowered from 3 to 2 — queries like "my child is a sophomore" should route to admissions
  if (weakHits >= 2) return 'admissions';
  // 1 weak signal → cross-over territory, send both but career-primary
  if (weakHits >= 1) return 'both';
  // No admissions signals at all → pure career
  return 'career';
}

// ─── Lightweight Data Access for Standard Mode ──────────────────────
// These load compact summaries from scraped data so the standard brain
// can reference demographics and decision dates without a full engine pull.

async function loadLightData() {
  const now = Date.now();
  if (decisionDatesCache && demographicsSummaryCache && (now - lightDataTimestamp) < CACHE_TTL) {
    return;
  }

  // Load decision dates
  try {
    const raw = await fs.readFile(join(PATHS.scraped, 'decision-dates.json'), 'utf-8');
    const data = JSON.parse(raw);
    // Build a compact lookup: school name → dates summary
    decisionDatesCache = {};
    for (const school of (data.schools || [])) {
      const dates = school.decisionDates || {};
      const parts = [];
      if (dates.earlyDecisionI) parts.push(`ED I: ${dates.earlyDecisionI.notification}`);
      if (dates.earlyDecisionII) parts.push(`ED II: ${dates.earlyDecisionII.notification}`);
      if (dates.earlyAction) parts.push(`EA: ${dates.earlyAction.notification} (${dates.earlyAction.type})`);
      if (dates.regularDecision) parts.push(`RD: ${dates.regularDecision.notification}`);
      decisionDatesCache[school.school.toLowerCase()] = {
        name: school.school,
        unitId: school.unitId,
        dates: parts.join(' | '),
        notes: school.notes,
        commitmentDeadline: school.commitmentDeadline
      };
    }
    console.log(`[LightData] Decision dates loaded: ${Object.keys(decisionDatesCache).length} schools`);
  } catch (err) {
    console.warn('[LightData] Decision dates not available:', err.message);
    decisionDatesCache = {};
  }

  // Load demographics summary (just school-level aggregates, no per-major)
  try {
    const raw = await fs.readFile(join(PATHS.scraped, 'ethnicity-demographics.json'), 'utf-8');
    const data = JSON.parse(raw);
    demographicsSummaryCache = {};
    for (const school of (data.schools || [])) {
      const agg = school.schoolAggregate;
      if (!agg || !agg.percentages) continue;
      const pct = agg.percentages;
      // Build a compact string: "White 45%, Asian 22%, Hispanic 15%, Black 8%, ..."
      const breakdown = Object.entries(pct)
        .filter(([k, v]) => v > 0 && k !== 'unknown')
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}%`)
        .join(', ');
      demographicsSummaryCache[school.school.toLowerCase()] = {
        name: school.school,
        unitId: school.unitId,
        total: agg.demographics?.total || 0,
        breakdown,
        totalMajors: school.totalMajorsWithData
      };
    }
    console.log(`[LightData] Demographics summaries loaded: ${Object.keys(demographicsSummaryCache).length} schools`);
  } catch (err) {
    console.warn('[LightData] Demographics not available:', err.message);
    demographicsSummaryCache = {};
  }

  lightDataTimestamp = now;
}

/**
 * Detect if a query mentions specific schools and pull relevant light data.
 * Returns a compact context string to append to brain context in standard mode.
 */
async function getLightDataContext(query) {
  await loadLightData();

  if (!query) return '';
  const lower = query.toLowerCase();

  // Detect if query is about decision dates / when decisions come out
  const hasDecisionSignal = /\b(decision|decisions|hear back|hearing back|when will|when do|notification|result|results|release|admit|admitted|wait|waiting|march|april|deferred|defer|accepted)\b/i.test(lower);
  const hasCollegeSignal = /\b(college|school|university|admissions|admission|apply|applied|application)\b/i.test(lower);

  // Detect if query is about demographics / diversity
  const wantsDemographics = /\b(demographic|demographics|diversity|diverse|ethnicity|ethnic|race|racial|representation|asian|white|black|hispanic|latino|breakdown|composition)\b/i.test(lower);

  // Find which schools are mentioned
  const mentionedSchools = [];
  const allSchoolNames = new Set([
    ...Object.keys(decisionDatesCache || {}),
    ...Object.keys(demographicsSummaryCache || {})
  ]);

  for (const schoolName of allSchoolNames) {
    // Match on school name or common abbreviation
    const words = schoolName.split(/\s+/);
    // Try full name match
    if (lower.includes(schoolName)) {
      mentionedSchools.push(schoolName);
      continue;
    }
    // Try partial match (e.g., "northwestern" matches "northwestern university")
    for (const word of words) {
      if (word.length > 4 && lower.includes(word) && !['university', 'college', 'institute', 'technology'].includes(word)) {
        mentionedSchools.push(schoolName);
        break;
      }
    }
  }

  const contextParts = [];

  // Decision dates trigger: either (decision signal + college signal) or (decision signal + specific school mentioned)
  const wantsDecisionDates = hasDecisionSignal && (hasCollegeSignal || mentionedSchools.length > 0);

  // If asking about decisions and schools are mentioned, inject decision dates
  if (wantsDecisionDates && mentionedSchools.length > 0 && decisionDatesCache) {
    const dateParts = [];
    for (const school of mentionedSchools.slice(0, 8)) {
      const info = decisionDatesCache[school];
      if (info) {
        dateParts.push(`${info.name}: ${info.dates}. ${info.notes}`);
      }
    }
    if (dateParts.length > 0) {
      contextParts.push(`\n--- DECISION DATE REFERENCE ---\n${dateParts.join('\n')}\nCommitment deadline: ${getCommitmentDeadline()}`);
    }
  }

  // If asking generally about decisions (no specific school), give a helpful overview
  if (wantsDecisionDates && mentionedSchools.length === 0 && decisionDatesCache) {
    const cycleYear = new Date().getFullYear();
    const cycleStr = `${cycleYear - 1}-${cycleYear}`;
    contextParts.push(`\n--- DECISION TIMELINE OVERVIEW (${cycleStr} cycle) ---
You have access to detailed decision date data for 99 colleges. Key patterns:
- ED I notifications: Mid-December (most schools ~Dec 15)
- EA notifications: Mid-December to late January (varies widely)
- ED II notifications: Mid-February (most schools ~Feb 15)
- UC system: Mid-to-late March (Davis/UCSD first ~Mar 10-15, Berkeley/UCLA ~Mar 25-28)
- Ivy Day: Late March (typically ~March 28)
- Most RD decisions: Late March to early April
- National commitment deadline: ${getCommitmentDeadline()}
If the user mentions a specific school, reference the exact dates. Direct users wanting comprehensive date lookups to the Demographics tool in the sidebar.`);
  }

  // If asking about demographics and schools are mentioned, inject summaries
  if (wantsDemographics && mentionedSchools.length > 0 && demographicsSummaryCache) {
    const demoParts = [];
    for (const school of mentionedSchools.slice(0, 5)) {
      const info = demographicsSummaryCache[school];
      if (info) {
        demoParts.push(`${info.name} (${info.total.toLocaleString()} total completions, ${info.totalMajors} majors with data): ${info.breakdown}`);
      }
    }
    if (demoParts.length > 0) {
      contextParts.push(`\n--- DEMOGRAPHICS REFERENCE ---\n${demoParts.join('\n')}\nFor detailed per-major breakdowns, direct users to the Demographics tool in the sidebar.`);
    }
  }

  if (contextParts.length > 0) {
    console.log(`[LightData] Injecting ${contextParts.length} data context(s) for standard mode`);
  }

  return contextParts.join('\n');
}

export async function getLiteBrainContext(query) {
  await loadBrains();

  const brainType = detectBrainType(query);

  // Get lightweight data context (decision dates, demographics) if query warrants it
  const lightData = await getLightDataContext(query);

  let brainContext;

  if (brainType === 'admissions') {
    if (!admissionsBrainCache) brainContext = '[Admissions knowledge — no brain loaded.]';
    else {
      console.log(`  Brain routing: ADMISSIONS (${admissionsBrainCache.length} chars)`);
      brainContext = `--- WAYFINDER ADMISSIONS INTELLIGENCE (condensed) ---\n${admissionsBrainCache}\n`;
    }
  } else if (brainType === 'both') {
    // Smart merge: the primary brain is career (since "both" means weak admissions signal),
    // but include relevant SECTIONS from admissions brain, not the whole thing.
    const queryKw = new Set(extractKeywords(query));
    let admissionsContext = admissionsBrainCache || '';

    if (admissionsContext && queryKw.size > 0) {
      const sections = admissionsContext.split(/\n#{1,3}\s+/);
      const relevantSections = sections.filter(section => {
        const sectionKw = extractKeywords(section.slice(0, 500));
        return sectionKw.some(kw => queryKw.has(kw));
      });

      if (relevantSections.length > 0 && relevantSections.length < sections.length) {
        admissionsContext = relevantSections.join('\n\n');
        console.log(`  Brain routing: BOTH — full career + ${relevantSections.length}/${sections.length} admissions sections (${admissionsContext.length} chars)`);
      } else {
        console.log(`  Brain routing: BOTH — full career + full admissions (${admissionsContext.length} chars)`);
      }
    }

    const combined = [careerBrainCache, admissionsContext].filter(Boolean).join('\n\n---\n\n');
    brainContext = `--- WAYFINDER KNOWLEDGE BASE (career + admissions context) ---\n${combined}\n`;
  } else {
    // Default: career
    if (!careerBrainCache) brainContext = '[Career knowledge — no brain loaded.]';
    else {
      console.log(`  Brain routing: CAREER (${careerBrainCache.length} chars)`);
      brainContext = `--- WAYFINDER CAREER INTELLIGENCE (condensed) ---\n${careerBrainCache}\n`;
    }
  }

  // Append lightweight data if relevant (decision dates, demographics)
  if (lightData) {
    brainContext += lightData;
  }

  return brainContext;
}

// ─── Public API ───────────────────────────────────────────────────

// OLD retrieveContext removed — replaced by BM25-powered retrieveContext() below
// Legacy keyword-based retrieval is preserved as retrieveContextLegacy() for fallback

function countAllChunks(index) {
  let total = 0;
  for (const chunks of Object.values(index)) {
    total += chunks.length;
  }
  return total;
}

// ─── BM25-Powered Retrieval (v2) ─────────────────────────────────
//
// This replaces the keyword-based category routing with BM25 scoring.
// Key advantages:
//   - Scales to any database size (always retrieves top-K, O(1) in DB size)
//   - Scores individual chunks, not categories — more precise matching
//   - Entity detection boosts known school/career names automatically
//   - Semantic cache avoids re-scoring for similar queries
//   - Adaptive budget adjusts topK and token spend based on query complexity

/**
 * Build or return the cached BM25 inverted index over all knowledge chunks.
 * Combines distilled (Layer 1), base (Layer 2), and raw (Layer 3) into
 * a single flat index that BM25 can score against.
 */
async function buildBM25Index() {
  const now = Date.now();
  if (bm25Index && (now - bm25IndexTimestamp) < CACHE_TTL) {
    return bm25Index;
  }

  console.log('[BM25] Building unified inverted index...');

  // Load both category (distilled + base) and raw data indexes
  const catIndex = await buildCategoryIndex();
  const rawIndex = await buildRawDataIndex();

  // Flatten all chunks into a single array with layer tags
  const allChunks = [];

  // Layer 1: Distilled intelligence (highest quality, boosted)
  for (const [catName, chunks] of Object.entries(catIndex)) {
    if (catName === '_base') continue;
    for (const chunk of chunks) {
      allChunks.push({
        ...chunk,
        layer: 'distilled',
        boostFactor: chunk.boostFactor || 2.0,
        text: chunk.content || chunk.text || '',
        keywords: chunk.keywords || []
      });
    }
  }

  // Layer 2: Base knowledge
  if (catIndex._base) {
    for (const chunk of catIndex._base) {
      allChunks.push({
        ...chunk,
        layer: 'base',
        boostFactor: chunk.boostFactor || 1.0,
        text: chunk.content || chunk.text || '',
        keywords: chunk.keywords || []
      });
    }
  }

  // Layer 3: Raw data reserve
  for (const [catName, chunks] of Object.entries(rawIndex)) {
    for (const chunk of chunks) {
      allChunks.push({
        ...chunk,
        layer: 'raw',
        boostFactor: chunk.boost || 0.8,
        text: chunk.text || chunk.content || '',
        keywords: chunk.keywords || []
      });
    }
  }

  console.log(`[BM25] Total chunks to index: ${allChunks.length} (distilled + base + raw)`);

  bm25Index = buildInvertedIndex(allChunks);
  bm25IndexTimestamp = now;

  // Clear semantic cache when index rebuilds
  semanticCache.clear();

  return bm25Index;
}

/**
 * BM25-powered retrieval — the new engine mode pipeline.
 *
 * Replaces the old retrieveContext() with:
 *   1. Query analysis (intent + entity + complexity)
 *   2. Semantic cache check
 *   3. BM25 scoring against the unified index
 *   4. Adaptive topK based on query complexity
 *   5. Context assembly with deduplication
 *
 * @param {string} query - The user's question
 * @param {number} topK - Max chunks to return (overridden by query analysis)
 * @returns {Array} Scored, sorted chunks
 */
export async function retrieveContextV2(query, topK = 6) {
  if (!query || query.trim().length === 0) return [];

  // Step 1: Analyze the query
  const analysis = analyzeQuery(query);
  console.log(`  [BM25] Query: "${query.slice(0, 60)}..."`);
  console.log(`  [BM25] Intent: ${analysis.intent} | Domain: ${analysis.domain} | Complexity: ${analysis.complexity}`);
  console.log(`  [BM25] Entities: ${analysis.entities.map(e => `${e.type}:${e.value}`).join(', ') || 'none'}`);
  console.log(`  [BM25] TopK: ${analysis.suggestedTopK} | NeedsRaw: ${analysis.needsRawData}`);

  // Step 2: Check semantic cache
  const cached = semanticCache.get(query);
  if (cached) {
    console.log(`  [BM25] Cache HIT (${semanticCache.stats().hitRate} hit rate)`);
    return cached;
  }

  // Step 3: Build/get the BM25 index
  const index = await buildBM25Index();

  // Step 4: Score via BM25
  const effectiveTopK = Math.max(analysis.suggestedTopK, topK);
  const layerBoosts = analysis.needsRawData
    ? { distilled: 1.5, base: 1.0, raw: 1.2 }    // Boost raw when we need specifics
    : { distilled: 2.0, base: 1.0, raw: 0.5 };    // Suppress raw for general queries

  const ranked = scoreBM25(query, index, {
    topK: effectiveTopK,
    entityBoostFactor: 2.5,
    layerBoosts
  });

  console.log(`  [BM25] Scored ${index.totalDocs} chunks, returning top ${ranked.length}`);
  if (ranked.length > 0) {
    console.log(`  [BM25] Top score: ${ranked[0].score} (${ranked[0].chunk.source || 'unknown'})`);
    console.log(`  [BM25] Layers: ${ranked.map(r => r.chunk.layer).join(', ')}`);
  }

  // Step 5: Convert to the format expected by formatContext()
  const results = ranked.map(r => ({
    ...r.chunk,
    score: r.score,
    content: r.chunk.text || r.chunk.content || '',
    title: r.chunk.title || r.chunk.source || 'Knowledge',
    source: r.chunk.source || 'wayfinder-kb'
  }));

  // Step 6: Blend in conversation memory chunks (past Q&A insights)
  try {
    const memoryChunks = await getMemoryChunks(query, 2);
    if (memoryChunks.length > 0) {
      results.push(...memoryChunks);
      console.log(`  [BM25] Added ${memoryChunks.length} conversation memory chunks`);
    }
  } catch (memErr) {
    // Never let memory retrieval break main retrieval
    console.error(`  [BM25] Memory retrieval error (non-fatal): ${memErr.message}`);
  }

  // Cache the results
  semanticCache.set(query, results);

  return results;
}

/**
 * Retrieve the most relevant knowledge chunks for a query.
 * Supports both calling conventions:
 *   - retrieveContext(query, 6) — legacy (claude.js)
 *   - retrieveContext(query, { topK, domain, mode }) — new (slm.js)
 *
 * Falls back to the old keyword-based system if BM25 index fails to build.
 */
export async function retrieveContext(query, optionsOrTopK = 6) {
  // Support both calling conventions:
  //   retrieveContext(query, 6)         — legacy (claude.js)
  //   retrieveContext(query, { topK, domain, mode }) — new (slm.js)
  let topK = 6;
  let domain = null;
  let mode = 'standard';

  if (typeof optionsOrTopK === 'object' && optionsOrTopK !== null) {
    topK = optionsOrTopK.topK || 6;
    domain = optionsOrTopK.domain || null;
    mode = optionsOrTopK.mode || 'standard';
  } else if (typeof optionsOrTopK === 'number') {
    topK = optionsOrTopK;
  }

  try {
    // For standard mode (SLM), use lite brain context + light data
    if (mode === 'standard') {
      const liteBrain = await getLiteBrainContext(query);
      const chunks = [{
        source: 'wayfinder-knowledge-base',
        title: 'Wayfinder Knowledge',
        content: liteBrain,
        layer: 'base',
        score: 1.0
      }];

      // Add conversation memory for SLM too — past insights improve all tiers
      try {
        const memoryChunks = await getMemoryChunks(query, 2);
        if (memoryChunks.length > 0) {
          chunks.push(...memoryChunks);
          console.log(`  [RAG-STD] Added ${memoryChunks.length} memory chunks for SLM`);
        }
      } catch (memErr) {
        console.error(`  [RAG-STD] Memory error (non-fatal): ${memErr.message}`);
      }

      return { chunks, sources: ['wayfinder-knowledge-base'] };
    }

    // For engine mode, use full BM25 retrieval
    const results = await retrieveContextV2(query, topK);
    return { chunks: results, sources: results.map(r => r.source).filter(Boolean) };
  } catch (err) {
    console.error('[retrieveContext] Error, falling back to legacy:', err.message);
    const results = await retrieveContextLegacy(query, topK);
    return { chunks: results, sources: results.map(r => r.source).filter(Boolean) };
  }
}

/**
 * Legacy keyword-based retrieval (v1) — kept as fallback.
 * This is the old retrieveContext() before BM25 was added.
 */
async function retrieveContextLegacy(query, topK = 6) {
  const distilledIndex = await buildCategoryIndex();
  const queryKeywords = extractKeywords(query);

  if (queryKeywords.length === 0) return [];

  const intent = classifyIntent(query);
  const routing = routeQuery(queryKeywords, intent);
  const specificity = detectSpecificity(query);
  const intentLowersThreshold = intent.primary === 'specific_lookup' || intent.primary === 'comparison';
  const shouldDrill = specificity.isSpecific || (intentLowersThreshold && specificity.signals >= 1);

  console.log(`  [Legacy] "${query.slice(0, 60)}..." → ${routing.routing} (${routing.categories.join(', ')})`);

  const candidateChunks = [];

  for (const catName of routing.categories) {
    if (distilledIndex[catName]) candidateChunks.push(...distilledIndex[catName]);
  }

  if (distilledIndex._base) {
    if (routing.routing === 'fallback') {
      candidateChunks.push(...distilledIndex._base);
    } else {
      const baseRelevant = distilledIndex._base.filter(chunk => {
        const chunkKeywords = new Set(chunk.keywords);
        return queryKeywords.some(kw => chunkKeywords.has(kw));
      });
      candidateChunks.push(...baseRelevant);
    }
  }

  if (shouldDrill) {
    const rawIdx = await buildRawDataIndex();
    const rawCatsToSearch = new Set();
    for (const catName of routing.categories) {
      const cat = CATEGORIES[catName];
      if (cat?.rawCategories) {
        for (const rc of cat.rawCategories) rawCatsToSearch.add(rc);
      }
    }
    for (const rawCat of rawCatsToSearch) {
      if (rawIdx[rawCat]) candidateChunks.push(...rawIdx[rawCat]);
    }
  }

  const seen = new Set();
  const uniqueChunks = candidateChunks.filter(chunk => {
    const key = `${chunk.source}:${chunk.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return uniqueChunks
    .map(chunk => ({ ...chunk, score: scoreChunk(chunk, queryKeywords) * (chunk.boostFactor || 1.0) }))
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function formatContext(chunks) {
  if (chunks.length === 0) {
    return '[No specific knowledge base documents matched this query. Use general career knowledge.]';
  }

  let totalChars = 0;
  const entries = [];

  for (const chunk of chunks) {
    const rawTag = chunk.isRawData || chunk.layer === 'raw' ? ' [RAW DATA]' : '';
    const entry = `--- SOURCE ${entries.length + 1}: ${chunk.source}${rawTag} ---\nTOPIC: ${chunk.title}\n${chunk.content}\n`;
    if (totalChars + entry.length > MAX_TOTAL_CONTEXT_CHARS) break;
    totalChars += entry.length;
    entries.push(entry);
  }

  return entries.join('\n');
}

export function getDataFreshness() {
  return {
    categoryIndex: categoryTimestamp > 0 ? new Date(categoryTimestamp).toISOString() : null,
    rawDataIndex: rawDataTimestamp > 0 ? new Date(rawDataTimestamp).toISOString() : null,
    brainCache: brainCacheTimestamp > 0 ? new Date(brainCacheTimestamp).toISOString() : null,
    bm25Index: bm25IndexTimestamp > 0 ? new Date(bm25IndexTimestamp).toISOString() : null,
    lightData: lightDataTimestamp > 0 ? new Date(lightDataTimestamp).toISOString() : null,
    cacheTTL: CACHE_TTL,
    semanticCacheStats: semanticCache.stats()
  };
}

export function invalidateCache(which = 'all') {
  // Granular cache invalidation — allows selective refresh
  if (which === 'all' || which === 'category') {
    categoryIndex = null;
    categoryTimestamp = 0;
  }
  if (which === 'all' || which === 'raw') {
    rawDataIndex = null;
    rawDataTimestamp = 0;
  }
  if (which === 'all' || which === 'brains') {
    careerBrainCache = null;
    admissionsBrainCache = null;
    brainCacheTimestamp = 0;
  }
  if (which === 'all' || which === 'bm25') {
    bm25Index = null;
    bm25IndexTimestamp = 0;
  }
  if (which === 'all' || which === 'semantic') {
    semanticCache.clear();
  }
  console.log(`[Knowledge] Cache invalidated: ${which}`);
}

// ── Direct SQLite query access (for API endpoints that need structured data) ──

/**
 * Get the SQLite knowledge DB instance for direct queries.
 * Returns null if SQLite is not available (better-sqlite3 not installed or DB not built).
 */
export async function getKnowledgeDB() {
  if (!KnowledgeDB) return null;
  const db = await KnowledgeDB.getInstance();
  return db.isAvailable ? db : null;
}
