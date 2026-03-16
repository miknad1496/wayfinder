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
let liteBrainCache = null;
let categoryTimestamp = 0;
let rawDataTimestamp = 0;
let liteCacheTimestamp = 0;
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
    files: ['audience-high-school-undecided.md'],
    triggers: ['admissions', 'admission', 'acceptance', 'accepted', 'apply', 'application',
      'essay', 'sat', 'act', 'gpa', 'extracurricular', 'recommendation', 'early',
      'decision', 'regular', 'ivy', 'league', 'harvard', 'yale', 'princeton', 'stanford',
      'mit', 'columbia', 'penn', 'cornell', 'brown', 'dartmouth', 'duke', 'northwestern',
      'caltech', 'uchicago', 'georgetown', 'vanderbilt', 'rice', 'emory', 'notre',
      'dame', 'wash', 'usc', 'nyu', 'umich', 'berkeley', 'ucla', 'uva',
      'target', 'reach', 'safety', 'waitlist', 'defer', 'transfer', 'common',
      'supplement', 'parent', 'child', 'kid', 'son', 'daughter', 'teenager', 'teen',
      'high', 'school', 'junior', 'senior', 'freshman', 'sophomore',
      'pre-college', 'precollege', 'college', 'prep'],
    rawCategories: ['raw_admissions', 'raw_nces']
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
    triggers: ['certification', 'certified', 'certificate', 'license', 'licensed', 'credential',
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

// ─── STAGE 1: Category Router ────────────────────────────────────

function routeQuery(queryKeywords) {
  const scores = {};

  for (const [catName, cat] of Object.entries(CATEGORIES)) {
    let catScore = 0;
    const triggerSet = new Set(cat.triggers);

    for (const keyword of queryKeywords) {
      if (triggerSet.has(keyword)) {
        catScore += 3;
      }
      for (const trigger of cat.triggers) {
        if (trigger !== keyword && (trigger.includes(keyword) || keyword.includes(trigger))) {
          catScore += 1;
        }
      }
    }

    if (catScore > 0) {
      scores[catName] = catScore;
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return { categories: Object.keys(CATEGORIES), routing: 'broad', scores: {} };
  }

  const topScore = sorted[0][1];
  const threshold = topScore * 0.3;

  const matched = sorted
    .filter(([, score]) => score >= threshold)
    .slice(0, 4)
    .map(([name]) => name);

  return {
    categories: matched,
    routing: matched.length <= 2 ? 'targeted' : 'moderate',
    scores: Object.fromEntries(sorted.slice(0, 6))
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

// ─── Lite Brain (standard mode) ──────────────────────────────────

async function loadLiteBrain() {
  const now = Date.now();
  if (liteBrainCache && (now - liteCacheTimestamp) < CACHE_TTL) {
    return liteBrainCache;
  }

  console.log('Loading lite brain (general-brain.md)...');
  const brainPath = join(PATHS.knowledgeBase, 'distilled', 'general-brain.md');
  try {
    const content = await fs.readFile(brainPath, 'utf-8');
    liteBrainCache = content;
    liteCacheTimestamp = now;
    console.log(`  Lite brain loaded: ${content.length} chars`);
  } catch (err) {
    console.warn('  Could not load general-brain.md:', err.message);
    liteBrainCache = '';
  }

  return liteBrainCache;
}

export async function getLiteBrainContext() {
  const content = await loadLiteBrain();
  if (!content) {
    return '[General career knowledge — no specific knowledge base loaded.]';
  }
  return `--- WAYFINDER KNOWLEDGE BASE (condensed) ---\n${content}\n`;
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

  // STAGE 1: Route to categories
  const routing = routeQuery(queryKeywords);

  // STAGE 1.5: Should we drill into raw data?
  const specificity = detectSpecificity(query);

  console.log(`  [Router] "${query.slice(0, 60)}..." → ${routing.routing} (${routing.categories.join(', ')})`);
  console.log(`  [Specificity] ${specificity.level} (${specificity.signals} signals)${specificity.isSpecific ? ' → DRILLING INTO RAW DATA' : ''}`);

  // STAGE 2: Gather candidate chunks
  const candidateChunks = [];

  // Always include distilled chunks from matched categories
  for (const catName of routing.categories) {
    if (distilledIndex[catName]) {
      candidateChunks.push(...distilledIndex[catName]);
    }
  }

  // Always include base
  if (distilledIndex._base) {
    candidateChunks.push(...distilledIndex._base);
  }

  // If query is specific enough, tap into raw data reserve
  if (specificity.isSpecific) {
    const rawIndex = await buildRawDataIndex();

    // Determine which raw categories to pull from
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

  const totalAvailable = countAllChunks(distilledIndex) + (specificity.isSpecific ? countAllChunks(rawDataIndex || {}) : 0);
  console.log(`  [Router] Searching ${uniqueChunks.length} of ${totalAvailable} total chunks`);

  // Score and rank — allow more results for deep-dive queries
  const effectiveTopK = specificity.level === 'deep' ? topK + 2 : topK;

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
  liteBrainCache = null;
  liteCacheTimestamp = 0;
}
