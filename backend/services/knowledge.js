import { promises as fs } from 'fs';
import { join } from 'path';
import { PATHS } from './storage.js';

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
    rawCategories: ['raw_onet', 'raw_bls']
  },
  finance_careers: {
    files: ['intel-finance-careers.md'],
    triggers: ['finance', 'banking', 'investment', 'wall', 'street', 'accounting', 'cpa',
      'financial', 'analyst', 'hedge', 'fund', 'private', 'equity', 'venture', 'capital',
      'consulting', 'mckinsey', 'bain', 'bcg', 'deloitte', 'pwc', 'kpmg', 'ey',
      'actuarial', 'quant', 'trading', 'fintech', 'wealth', 'management'],
    rawCategories: ['raw_onet', 'raw_certifications']
  },
  healthcare_careers: {
    files: ['intel-healthcare-careers.md'],
    triggers: ['healthcare', 'medical', 'medicine', 'doctor', 'nurse', 'nursing', 'physician',
      'hospital', 'clinical', 'pharmacy', 'pharmacist', 'dental', 'dentist', 'veterinary',
      'therapy', 'therapist', 'physical', 'occupational', 'mental', 'health', 'psych',
      'premed', 'mcat', 'residency', 'biotech', 'pharma', 'public', 'epidemiology'],
    rawCategories: ['raw_onet', 'raw_bls']
  },
  government_careers: {
    files: ['intel-government-federal.md'],
    triggers: ['government', 'federal', 'public', 'service', 'policy', 'politics', 'political',
      'military', 'army', 'navy', 'marines', 'air', 'force', 'state', 'department',
      'nonprofit', 'ngo', 'usajobs', 'clearance', 'gs', 'scale', 'civil', 'law',
      'enforcement', 'fbi', 'cia', 'nsa', 'diplomat'],
    rawCategories: ['raw_bls']
  },
  trades_careers: {
    files: ['intel-trades-renaissance.md'],
    triggers: ['trade', 'trades', 'plumber', 'plumbing', 'electrician', 'electrical',
      'carpenter', 'carpentry', 'welding', 'welder', 'hvac', 'mechanic', 'construction',
      'apprentice', 'apprenticeship', 'union', 'vocational', 'blue', 'collar',
      'skilled', 'labor', 'technician', 'lineman', 'diesel'],
    rawCategories: ['raw_onet', 'raw_bls']
  },
  career_transitions: {
    files: ['pathway-career-pivots-30s.md', 'pathway-tech-transitions.md', 'pathway-non-degree.md',
      'audience-career-changer.md'],
    triggers: ['career', 'change', 'switch', 'transition', 'pivot', 'changing', 'mid-career',
      'new', 'field', 'different', 'industry', 'transferable', 'skills', 'restart',
      'reinvent', 'second', 'late', 'start', 'non-degree', 'alternative', 'without',
      'degree', 'bootcamp', 'self-taught'],
    rawCategories: ['raw_reddit_stories']
  },
  education_decisions: {
    files: ['framework-major-selection.md', 'framework-grad-school.md', 'pathway-stem-vs-non-stem.md',
      'roi-college-alternatives.md', 'roi-bootcamps.md'],
    triggers: ['major', 'college', 'university', 'degree', 'masters', 'phd', 'mba', 'grad',
      'school', 'graduate', 'undergraduate', 'bachelors', 'associates', 'stem',
      'humanities', 'liberal', 'arts', 'tuition', 'student', 'loan', 'debt',
      'bootcamp', 'community', 'online', 'course', 'study', 'education',
      'worth', 'roi', 'return'],
    rawCategories: ['raw_nces', 'raw_reddit_stories']
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
      'admissions-extracurricular-differentiation-strategy.md'],
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
    rawCategories: ['raw_admissions', 'raw_nces', 'raw_curriculum', 'raw_local_schools', 'raw_ethnicity', 'raw_decision_dates']
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
    files: ['framework-salary-negotiation.md', 'framework-job-offer-evaluation.md'],
    triggers: ['salary', 'pay', 'compensation', 'negotiate', 'negotiation', 'offer', 'raise',
      'promotion', 'benefits', 'equity', 'stock', 'options', 'bonus', 'package',
      'counter', 'accept', 'decline', 'compare', 'competing', 'total', 'comp',
      'remote', 'relocation', 'signing'],
    rawCategories: ['raw_bls', 'raw_reddit_salary']
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
    rawCategories: ['raw_nces']
  },
  data_synthesis: {
    files: ['synthesis-bls-insights.md', 'synthesis-community-wisdom.md', 'core-reasoning-principles.md',
      'core-conversation-patterns.md'],
    triggers: ['statistics', 'data', 'trend', 'growth', 'decline', 'outlook', 'projection',
      'bureau', 'labor', 'bls', 'onet', 'occupation', 'median', 'average',
      'percentile', 'employment', 'unemployment', 'workforce', 'economy'],
    rawCategories: ['raw_bls', 'raw_onet', 'raw_nces']
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
  'actually', 'honestly', 'truth about'
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
  return records
    .filter(r => r.description && r.description.length > 50 &&
      !['Home', 'Occupation Finder', 'OOH FAQs', 'A-Z Index'].includes(r.occupation))
    .map(r => {
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

async function loadJsonFile(filename) {
  try {
    const raw = await fs.readFile(join(PATHS.scraped, filename), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function buildRawDataIndex() {
  const now = Date.now();
  if (rawDataIndex && (now - rawDataTimestamp) < CACHE_TTL) {
    return rawDataIndex;
  }

  console.log('Building raw data reserve index...');
  const index = {};

  // O*NET occupations (25 detailed profiles)
  const onet = await loadJsonFile('onet-occupations.json');
  if (onet) {
    index.raw_onet = parseOnetRecords(onet);
    console.log(`  raw_onet: ${index.raw_onet.length} occupation profiles`);
  }

  // BLS occupations
  const bls = await loadJsonFile('bls-occupations.json');
  if (bls) {
    index.raw_bls = parseBLSRecords(bls);
    console.log(`  raw_bls: ${index.raw_bls.length} occupation records`);
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

  let totalRaw = 0;
  for (const chunks of Object.values(index)) {
    totalRaw += chunks.length;
  }
  console.log(`  Raw data reserve ready: ${totalRaw} total chunks across ${Object.keys(index).length} data sources`);

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
      contextParts.push(`\n--- DECISION DATE REFERENCE ---\n${dateParts.join('\n')}\nCommitment deadline: May 1, 2026`);
    }
  }

  // If asking generally about decisions (no specific school), give a helpful overview
  if (wantsDecisionDates && mentionedSchools.length === 0 && decisionDatesCache) {
    contextParts.push(`\n--- DECISION TIMELINE OVERVIEW (2025-2026 cycle) ---
You have access to detailed decision date data for 99 colleges. Key patterns:
- ED I notifications: Mid-December (most schools ~Dec 15)
- EA notifications: Mid-December to late January (varies widely)
- ED II notifications: Mid-February (most schools ~Feb 15)
- UC system: Mid-to-late March (Davis/UCSD first ~Mar 10-15, Berkeley/UCLA ~Mar 25-28)
- Ivy Day: Late March (typically ~March 28)
- Most RD decisions: Late March to early April
- National commitment deadline: May 1, 2026
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

/**
 * Retrieve the most relevant knowledge chunks for a query.
 *
 * Three-stage pipeline:
 *   Stage 1:   Category routing (zero cost)
 *   Stage 1.5: Specificity detection — should we access raw data?
 *   Stage 2:   Targeted retrieval from matched layers
 *
 * @param {string} query - The user's question
 * @param {number} topK - Max chunks to return
 * @returns {Array} Scored, sorted chunks
 */
export async function retrieveContext(query, topK = 6) {
  const distilledIndex = await buildCategoryIndex();
  const queryKeywords = extractKeywords(query);

  if (queryKeywords.length === 0) return [];

  // STAGE 0: Classify intent — determines breadth, depth, and assembly strategy
  const intent = classifyIntent(query);

  // STAGE 1: Route to categories (intent-aware)
  const routing = routeQuery(queryKeywords, intent);

  // STAGE 1.5: Should we drill into raw data?
  // Intent-aware: specific_lookup and comparison intents lower the threshold
  const specificity = detectSpecificity(query);
  const intentLowersThreshold = intent.primary === 'specific_lookup' || intent.primary === 'comparison';
  const shouldDrill = specificity.isSpecific || (intentLowersThreshold && specificity.signals >= 1);

  console.log(`  [Intent] ${intent.primary}${intent.secondary ? ' + ' + intent.secondary : ''}`);
  console.log(`  [Router] "${query.slice(0, 60)}..." → ${routing.routing} (${routing.categories.join(', ')})`);
  console.log(`  [Specificity] ${specificity.level} (${specificity.signals} signals)${shouldDrill ? ' → DRILLING INTO RAW DATA' : ''}`);

  // STAGE 2: Assemble candidate chunks with PROGRESSIVE LOADING
  // Start with matched category distilled chunks only. Only widen if needed.
  const candidateChunks = [];

  // Primary: distilled chunks from matched categories
  for (const catName of routing.categories) {
    if (distilledIndex[catName]) {
      candidateChunks.push(...distilledIndex[catName]);
    }
  }

  // Base knowledge: include SELECTIVELY, not as a dump.
  // For targeted routing, score base chunks against query and only include
  // ones that actually match. For fallback routing, include more base.
  if (distilledIndex._base) {
    if (routing.routing === 'fallback') {
      // Fallback: include base (this IS the general knowledge)
      candidateChunks.push(...distilledIndex._base);
    } else {
      // Targeted/focused: only include base chunks that have keyword overlap
      const baseRelevant = distilledIndex._base.filter(chunk => {
        const chunkKeywords = new Set(chunk.keywords);
        return queryKeywords.some(kw => chunkKeywords.has(kw));
      });
      candidateChunks.push(...baseRelevant);
    }
  }

  // Raw data: only if query is specific enough (intent-aware threshold)
  if (shouldDrill) {
    const rawIndex = await buildRawDataIndex();

    const rawCatsToSearch = new Set();
    for (const catName of routing.categories) {
      const cat = CATEGORIES[catName];
      if (cat?.rawCategories) {
        for (const rc of cat.rawCategories) {
          rawCatsToSearch.add(rc);
        }
      }
    }

    for (const rawCat of rawCatsToSearch) {
      if (rawIndex[rawCat]) {
        candidateChunks.push(...rawIndex[rawCat]);
      }
    }

    console.log(`  [Raw Data] Tapped: ${[...rawCatsToSearch].join(', ')}`);
  }

  // Deduplicate
  const seen = new Set();
  const uniqueChunks = candidateChunks.filter(chunk => {
    const key = `${chunk.source}:${chunk.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const totalAvailable = countAllChunks(distilledIndex) + (shouldDrill ? countAllChunks(rawDataIndex || {}) : 0);
  console.log(`  [Router] Searching ${uniqueChunks.length} of ${totalAvailable} total chunks`);

  // STAGE 3: Score, rank, and return — intent-aware topK
  // Deep-dive and comparison queries get more results
  // Targeted specific_lookup gets fewer but more precise results
  let effectiveTopK = topK;
  if (specificity.level === 'deep' || intent.primary === 'comparison') {
    effectiveTopK = topK + 2;
  } else if (intent.primary === 'specific_lookup' && routing.routing === 'targeted') {
    effectiveTopK = Math.max(topK - 1, 3); // Tight and precise
  }

  return uniqueChunks
    .map(chunk => ({
      ...chunk,
      score: scoreChunk(chunk, queryKeywords) * (chunk.boostFactor || 1.0)
    }))
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, effectiveTopK);
}

function countAllChunks(index) {
  let total = 0;
  for (const chunks of Object.values(index)) {
    total += chunks.length;
  }
  return total;
}

export function formatContext(chunks) {
  if (chunks.length === 0) {
    return '[No specific knowledge base documents matched this query. Use general career knowledge.]';
  }

  let totalChars = 0;
  const entries = [];

  for (const chunk of chunks) {
    const rawTag = chunk.isRawData ? ' [RAW DATA]' : '';
    const entry = `--- SOURCE ${entries.length + 1}: ${chunk.source}${rawTag} ---\nTOPIC: ${chunk.title}\n${chunk.content}\n`;
    if (totalChars + entry.length > MAX_TOTAL_CONTEXT_CHARS) break;
    totalChars += entry.length;
    entries.push(entry);
  }

  return entries.join('\n');
}

export function invalidateCache() {
  categoryIndex = null;
  categoryTimestamp = 0;
  rawDataIndex = null;
  rawDataTimestamp = 0;
  careerBrainCache = null;
  admissionsBrainCache = null;
  brainCacheTimestamp = 0;
}
