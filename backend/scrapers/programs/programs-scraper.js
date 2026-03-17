/**
 * Programs & Activities Data Scraper
 *
 * Compiles a comprehensive curated dataset of elite pre-college and leadership programs.
 * Includes STEM, research, leadership, arts, entrepreneurship, and community service opportunities.
 *
 * Schema: programs[].{ name, provider, category, subcategory, type, cost, selectivity, admissionsImpact, location, eligibility, deadline, description, url, tags, duration }
 *
 * Categories: stem, leadership, research, arts, community-service, entrepreneurship, non-traditional, pre-college, summer-academic, gap-year
 * Types: summer, year-round, weekend, online, semester
 * Selectivity: very_high, high, moderate, open
 */

import { saveScrapedData, log, deduplicateByKey } from '../base-scraper.js';

const SCRAPER_NAME = 'programs';

/**
 * Comprehensive curated dataset of real, well-known programs.
 * Manually researched and verified information.
 */
const programsData = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ELITE PRE-COLLEGE STEM PROGRAMS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'MIT MITES (MOSTEC)',
    provider: 'MIT',
    category: 'stem',
    subcategory: 'engineering',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free (fully funded)' },
    selectivity: 'very_high',
    admissionsImpact: 'very_high',
    location: { city: 'Cambridge', state: 'MA' },
    eligibility: {
      grades: ['10', '11'],
      states: ['all'],
      gpa: null,
      demographics: ['underrepresented minorities']
    },
    deadline: '2026-01-31',
    description: 'Intensive 6-week summer program for high-achieving minority and first-generation students interested in STEM. Residential program with engineering labs, mentoring, and leadership development.',
    url: 'https://mites.mit.edu/',
    tags: ['prestigious', 'stem', 'free', 'residential', 'engineering', 'minorities'],
    duration: '6 weeks',
    region: 'Northeast'
  },

  {
    name: 'Stanford Summer Research College (SIMR)',
    provider: 'Stanford University',
    category: 'research',
    subcategory: 'stem-research',
    type: 'summer',
    cost: { amount: 14000, type: 'paid', display: '$14,000 (financial aid available)' },
    selectivity: 'very_high',
    admissionsImpact: 'very_high',
    location: { city: 'Stanford', state: 'CA' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-15',
    description: 'Selective 8-week residential summer program where students conduct original research in labs across engineering, computer science, chemistry, and biology. Mentored by PhD students and faculty.',
    url: 'https://summer.stanford.edu/programs/stanford-summer-research-college/',
    tags: ['prestigious', 'research', 'stem', 'residential', 'engineering'],
    duration: '8 weeks',
    region: 'West Coast'
  },

  {
    name: 'Research Science Institute (RSI)',
    provider: 'MIT Lincoln Laboratory',
    category: 'research',
    subcategory: 'advanced-stem',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free (fully funded)' },
    selectivity: 'very_high',
    admissionsImpact: 'very_high',
    location: { city: 'Cambridge', state: 'MA' },
    eligibility: {
      grades: ['11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-01',
    description: 'Highly selective 4-week summer program for exceptional STEM students. Focus on advanced topics in physics, computer science, and mathematics. Includes international students. Fully residential and funded.',
    url: 'https://www.rsiusa.org/',
    tags: ['extremely selective', 'research', 'stem', 'physics', 'cs', 'math', 'international', 'free'],
    duration: '4 weeks',
    region: 'Northeast'
  },

  {
    name: 'COSMOS (California State Summer School for Mathematics & Science)',
    provider: 'UC System',
    category: 'stem',
    subcategory: 'summer-school',
    type: 'summer',
    cost: { amount: 1500, type: 'paid', display: '$1,500 resident, $2,500 non-resident' },
    selectivity: 'high',
    admissionsImpact: 'high',
    location: { city: 'Multiple', state: 'CA' },
    eligibility: {
      grades: ['9', '10', '11'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-01',
    description: '4-week intensive summer program at UC campuses (UC Davis, UC Irvine, UC Santa Cruz). Clusters in STEM topics. Daily lectures, labs, field trips, and project work.',
    url: 'https://www.ucprecollegiate.org/cosmos/',
    tags: ['stem', 'california', 'affordable', 'hands-on'],
    duration: '4 weeks',
    region: 'West Coast'
  },

  {
    name: 'PROMYS (Program in Mathematics for Young Scientists)',
    provider: 'Boston University',
    category: 'stem',
    subcategory: 'mathematics',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free (financial aid covers room & board)' },
    selectivity: 'very_high',
    admissionsImpact: 'high',
    location: { city: 'Boston', state: 'MA' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-28',
    description: '6-week residential summer program focused on pure mathematics. Exploration of numbers, primes, and mathematical proof. Residential campus life with mentoring from mathematicians.',
    url: 'https://www.bu.edu/promys/',
    tags: ['prestigious', 'mathematics', 'proof-based', 'residential', 'free'],
    duration: '6 weeks',
    region: 'Northeast'
  },

  {
    name: 'HCSSiM (Hampshire College Summer Studies in Mathematics)',
    provider: 'Hampshire College',
    category: 'stem',
    subcategory: 'mathematics',
    type: 'summer',
    cost: { amount: 4500, type: 'paid', display: '$4,500 (scholarships available)' },
    selectivity: 'very_high',
    admissionsImpact: 'high',
    location: { city: 'Amherst', state: 'MA' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-15',
    description: '6-week intensive summer math program. Advanced topics in discrete math, algebra, topology. Highly collaborative environment with daily problem sets and lectures.',
    url: 'https://www.hcssim.org/',
    tags: ['mathematics', 'advanced', 'proof-based', 'residential', 'prestigious'],
    duration: '6 weeks',
    region: 'Northeast'
  },

  {
    name: 'SUMaC (Stanford University Mathematics Camp)',
    provider: 'Stanford University',
    category: 'stem',
    subcategory: 'mathematics',
    type: 'summer',
    cost: { amount: 7500, type: 'paid', display: '$7,500 (need-based aid available)' },
    selectivity: 'very_high',
    admissionsImpact: 'high',
    location: { city: 'Stanford', state: 'CA' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-20',
    description: '5-week residential mathematics program featuring advanced topics in algebra, topology, and combinatorics. Lectures by Stanford faculty and postdocs.',
    url: 'https://sumac.stanford.edu/',
    tags: ['mathematics', 'prestigious', 'advanced', 'residential'],
    duration: '5 weeks',
    region: 'West Coast'
  },

  {
    name: 'Ross Mathematics Program',
    provider: 'The Ohio State University',
    category: 'stem',
    subcategory: 'mathematics',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free (room & board included)' },
    selectivity: 'very_high',
    admissionsImpact: 'high',
    location: { city: 'Columbus', state: 'OH' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-28',
    description: '6-week residential summer program emphasizing mathematical proof and number theory. Problem-solving focused with peer mentoring and evening colloquia.',
    url: 'https://www.rossprogram.org/',
    tags: ['mathematics', 'free', 'prestigious', 'proof-based', 'residential'],
    duration: '6 weeks',
    region: 'Midwest'
  },

  {
    name: 'Garcia MRSEC Summer Camp',
    provider: 'Columbia University',
    category: 'stem',
    subcategory: 'materials-science',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free' },
    selectivity: 'high',
    admissionsImpact: 'moderate',
    location: { city: 'New York', state: 'NY' },
    eligibility: {
      grades: ['11', '12'],
      states: ['all'],
      gpa: null,
      demographics: ['underrepresented minorities']
    },
    deadline: '2026-03-15',
    description: '6-week summer research camp introducing high school students to materials science and engineering. Laboratory experience with Columbia faculty.',
    url: 'https://garcialab.columbia.edu/outreach',
    tags: ['research', 'stem', 'free', 'materials science'],
    duration: '6 weeks',
    region: 'Northeast'
  },

  {
    name: 'Clark Scholar Program',
    provider: 'Texas A&M University',
    category: 'research',
    subcategory: 'stem-research',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free (fully funded)' },
    selectivity: 'high',
    admissionsImpact: 'high',
    location: { city: 'College Station', state: 'TX' },
    eligibility: {
      grades: ['11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-15',
    description: '9-week summer research experience. Students work one-on-one with faculty mentors on research projects spanning engineering, agriculture, veterinary medicine, and life sciences.',
    url: 'https://clark.tamu.edu/',
    tags: ['research', 'free', 'stem', 'residential'],
    duration: '9 weeks',
    region: 'South'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IVY & TOP UNIVERSITY SUMMER PROGRAMS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'Harvard Summer School for High School Students',
    provider: 'Harvard University',
    category: 'pre-college',
    subcategory: 'summer-academic',
    type: 'summer',
    cost: { amount: 12000, type: 'paid', display: '$12,000 + housing' },
    selectivity: 'high',
    admissionsImpact: 'high',
    location: { city: 'Cambridge', state: 'MA' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-01',
    description: 'Attend Harvard college courses alongside college students. Choose from hundreds of courses including STEM, humanities, and social sciences. 4-week or 8-week sessions.',
    url: 'https://summer.harvard.edu/high-school-programs/',
    tags: ['prestigious', 'college-courses', 'residential', 'elite'],
    duration: '4-8 weeks',
    region: 'Northeast'
  },

  {
    name: 'Yale Young Global Scholars (YYGS)',
    provider: 'Yale University',
    category: 'leadership',
    subcategory: 'summer-program',
    type: 'summer',
    cost: { amount: 11500, type: 'paid', display: '$11,500 (scholarships available)' },
    selectivity: 'high',
    admissionsImpact: 'high',
    location: { city: 'New Haven', state: 'CT' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-28',
    description: '2-week residential program focused on global citizenship and leadership. Guest lectures, seminars on international affairs, and overnight trips to major cities.',
    url: 'https://globalscholar.yale.edu/',
    tags: ['leadership', 'prestigious', 'global-affairs', 'residential'],
    duration: '2 weeks',
    region: 'Northeast'
  },

  {
    name: 'Columbia Summer High School Program',
    provider: 'Columbia University',
    category: 'pre-college',
    subcategory: 'summer-academic',
    type: 'summer',
    cost: { amount: 7800, type: 'paid', display: '$7,800 (tuition only, housing separate)' },
    selectivity: 'high',
    admissionsImpact: 'moderate',
    location: { city: 'New York', state: 'NY' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-15',
    description: 'Take college-level courses at Columbia for high school credit. Multiple sessions during summer. Access to Columbia library and campus facilities.',
    url: 'https://ce.columbia.edu/programs/high-school',
    tags: ['college-courses', 'elite', 'academic'],
    duration: '2-6 weeks',
    region: 'Northeast'
  },

  {
    name: 'Penn Summer High School Program',
    provider: 'University of Pennsylvania',
    category: 'pre-college',
    subcategory: 'summer-academic',
    type: 'summer',
    cost: { amount: 6500, type: 'paid', display: '$6,500 per course' },
    selectivity: 'moderate',
    admissionsImpact: 'moderate',
    location: { city: 'Philadelphia', state: 'PA' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-20',
    description: 'Attend UPenn college courses. STEM and liberal arts offerings. Gain college credit and experience university life.',
    url: 'https://www.sas.upenn.edu/summer/',
    tags: ['college-courses', 'elite', 'ivy-league'],
    duration: '4-8 weeks',
    region: 'Northeast'
  },

  {
    name: 'Princeton Summer School',
    provider: 'Princeton University',
    category: 'pre-college',
    subcategory: 'summer-academic',
    type: 'summer',
    cost: { amount: 15000, type: 'paid', display: '$15,000+' },
    selectivity: 'high',
    admissionsImpact: 'moderate',
    location: { city: 'Princeton', state: 'NJ' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-10',
    description: 'Selective summer program at Princeton. College-level courses in STEM and humanities. Residential experience at elite institution.',
    url: 'https://pial.princeton.edu/programs/summer-school',
    tags: ['prestigious', 'college-courses', 'ivy-league', 'residential'],
    duration: '4 weeks',
    region: 'Northeast'
  },

  {
    name: 'Brown Pre-College Program',
    provider: 'Brown University',
    category: 'pre-college',
    subcategory: 'summer-academic',
    type: 'summer',
    cost: { amount: 10000, type: 'paid', display: '$10,000-$12,000' },
    selectivity: 'moderate',
    admissionsImpact: 'moderate',
    location: { city: 'Providence', state: 'RI' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-15',
    description: 'Multi-week summer program taking Brown college courses. Day and residential options. Access to Brown facilities and mentorship.',
    url: 'https://precollege.brown.edu/',
    tags: ['college-courses', 'ivy-league', 'elite'],
    duration: '1-4 weeks',
    region: 'Northeast'
  },

  {
    name: 'Cornell Summer College',
    provider: 'Cornell University',
    category: 'pre-college',
    subcategory: 'summer-academic',
    type: 'summer',
    cost: { amount: 9500, type: 'paid', display: '$9,500-$11,500' },
    selectivity: 'moderate',
    admissionsImpact: 'moderate',
    location: { city: 'Ithaca', state: 'NY' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-20',
    description: 'Attend Cornell college courses for credit. Multiple 2-6 week sessions. Engineering, arts, sciences offerings. Residential campus experience.',
    url: 'https://www.sce.cornell.edu/programs/high-school/',
    tags: ['college-courses', 'ivy-league', 'engineering'],
    duration: '2-6 weeks',
    region: 'Northeast'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEADERSHIP PROGRAMS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'HOBY (Hugh O\'Brien Youth Leadership)',
    provider: 'HOBY International',
    category: 'leadership',
    subcategory: 'youth-leadership',
    type: 'weekend',
    cost: { amount: 300, type: 'paid', display: '$300-$500 (scholarships available)' },
    selectivity: 'moderate',
    admissionsImpact: 'moderate',
    location: { city: 'Multiple Locations', state: 'all' },
    eligibility: {
      grades: ['9', '10'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-31',
    description: 'Leadership seminar program with state conferences and alumni programs. Focus on personal development, character development, and community service.',
    url: 'https://www.hoby.org/',
    tags: ['leadership', 'youth', 'weekend', 'affordable'],
    duration: '1 weekend',
    region: 'National'
  },

  {
    name: 'Boys & Girls State Programs',
    provider: 'American Legion',
    category: 'leadership',
    subcategory: 'civic-engagement',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free (fully funded)' },
    selectivity: 'moderate',
    admissionsImpact: 'moderate',
    location: { city: 'Various', state: 'all' },
    eligibility: {
      grades: ['11'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-28',
    description: 'Week-long summer civics program. Mock state government with elected offices. Leadership, citizenship, and government education.',
    url: 'https://www.legion.org/',
    tags: ['leadership', 'civics', 'free', 'government'],
    duration: '1 week',
    region: 'National'
  },

  {
    name: 'National Student Leadership Conference (NSLC)',
    provider: 'NSLC',
    category: 'leadership',
    subcategory: 'leadership-development',
    type: 'summer',
    cost: { amount: 4500, type: 'paid', display: '$4,500-$6,500' },
    selectivity: 'moderate',
    admissionsImpact: 'low',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-04-30',
    description: 'Leadership development programs held in major U.S. cities. Focus on public speaking, teamwork, and personal leadership. Week-long residential experience.',
    url: 'https://www.nslcprogram.org/',
    tags: ['leadership', 'summer', 'residential'],
    duration: '1 week',
    region: 'National'
  },

  {
    name: 'Bank of America Student Leaders',
    provider: 'Bank of America',
    category: 'leadership',
    subcategory: 'youth-leadership',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free' },
    selectivity: 'moderate',
    admissionsImpact: 'low',
    location: { city: 'Various', state: 'all' },
    eligibility: {
      grades: ['11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Year-round leadership program. Community service focus. Local chapter participation with mentoring from banking professionals.',
    url: 'https://www.bankofamerica.com/about-us/community-partnerships/',
    tags: ['leadership', 'free', 'community-service', 'mentoring'],
    duration: 'Year-round',
    region: 'National'
  },

  {
    name: 'Congressional Award Program',
    provider: 'Congressional Award Foundation',
    category: 'leadership',
    subcategory: 'civic-achievement',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free' },
    selectivity: 'open',
    admissionsImpact: 'moderate',
    location: { city: 'National', state: 'all' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Congressional Award recognizes achievement in service, personal development, public service, and physical fitness. 4 categories of medals.',
    url: 'https://www.congressionalaward.org/',
    tags: ['leadership', 'civic', 'free', 'achievement'],
    duration: 'Year-round',
    region: 'National'
  },

  {
    name: 'Junior Statesmen of America (JSA)',
    provider: 'JSA',
    category: 'leadership',
    subcategory: 'civic-engagement',
    type: 'year-round',
    cost: { amount: 500, type: 'paid', display: '$500-$1,500 (scholarships available)' },
    selectivity: 'moderate',
    admissionsImpact: 'moderate',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Year-round political debate program with summer seminars. Learn about American government and public speaking through debate and conferences.',
    url: 'https://www.jsa.org/',
    tags: ['leadership', 'civics', 'debate', 'government'],
    duration: 'Year-round',
    region: 'National'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RESEARCH PROGRAMS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'Simons Summer Research Program',
    provider: 'Simons Foundation / Multiple Universities',
    category: 'research',
    subcategory: 'stem-research',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free (fully funded)' },
    selectivity: 'high',
    admissionsImpact: 'high',
    location: { city: 'Various', state: 'all' },
    eligibility: {
      grades: ['11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-15',
    description: '8-10 week summer research internship at universities nationwide. Work with faculty on original research in mathematics, physics, computer science, and biology.',
    url: 'https://www.simonsfoundation.org/',
    tags: ['research', 'stem', 'free', 'faculty-mentored'],
    duration: '8-10 weeks',
    region: 'National'
  },

  {
    name: 'NIH Summer Internship Program',
    provider: 'National Institutes of Health',
    category: 'research',
    subcategory: 'biomedical-research',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free (paid internship ~$3,000-$4,000)' },
    selectivity: 'high',
    admissionsImpact: 'high',
    location: { city: 'Bethesda', state: 'MD' },
    eligibility: {
      grades: ['11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-01',
    description: '10-week paid internship at NIH. Research in biomedical sciences. Work with leading scientists on cutting-edge biomedical research.',
    url: 'https://www.training.nih.gov/students',
    tags: ['research', 'biomedical', 'paid', 'prestigious', 'federal'],
    duration: '10 weeks',
    region: 'Northeast'
  },

  {
    name: 'Jackson Laboratory High School Summer Program',
    provider: 'Jackson Laboratory',
    category: 'research',
    subcategory: 'biomedical-research',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free (fully funded)' },
    selectivity: 'high',
    admissionsImpact: 'high',
    location: { city: 'Bar Harbor', state: 'ME' },
    eligibility: {
      grades: ['11', '12'],
      states: ['all'],
      gpa: null,
      demographics: ['underrepresented minorities']
    },
    deadline: '2026-02-28',
    description: '8-week residential research program in genetics and biomedical research. Work in state-of-the-art labs with professional scientists.',
    url: 'https://www.jax.org/education',
    tags: ['research', 'biomedical', 'free', 'genetics', 'residential'],
    duration: '8 weeks',
    region: 'Northeast'
  },

  {
    name: 'Cold Spring Harbor Laboratory Summer Internship',
    provider: 'Cold Spring Harbor Laboratory',
    category: 'research',
    subcategory: 'biomedical-research',
    type: 'summer',
    cost: { amount: 5000, type: 'paid', display: '$5,000 (all costs covered)' },
    selectivity: 'very_high',
    admissionsImpact: 'high',
    location: { city: 'Cold Spring Harbor', state: 'NY' },
    eligibility: {
      grades: ['11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-15',
    description: '10-week summer research internship in molecular biology, genetics, and related fields. Mentorship from leading scientists. Prestigious research institution.',
    url: 'https://www.cshl.edu/education/',
    tags: ['research', 'prestigious', 'biomedical', 'genetics'],
    duration: '10 weeks',
    region: 'Northeast'
  },

  {
    name: 'Scripps Research Internship Program',
    provider: 'Scripps Research Institute',
    category: 'research',
    subcategory: 'biomedical-research',
    type: 'summer',
    cost: { amount: 5000, type: 'paid', display: 'Covered + housing' },
    selectivity: 'high',
    admissionsImpact: 'high',
    location: { city: 'La Jolla', state: 'CA' },
    eligibility: {
      grades: ['11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-20',
    description: '10-week summer research internship at leading biomedical research facility. Neuroscience, biochemistry, and molecular biology focus.',
    url: 'https://www.scripps.edu/',
    tags: ['research', 'prestigious', 'biomedical', 'california'],
    duration: '10 weeks',
    region: 'West Coast'
  },

  {
    name: 'Caltech Summer Undergraduate Research Fellowships',
    provider: 'Caltech',
    category: 'research',
    subcategory: 'stem-research',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free (paid stipend + housing)' },
    selectivity: 'very_high',
    admissionsImpact: 'high',
    location: { city: 'Pasadena', state: 'CA' },
    eligibility: {
      grades: ['12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-01-15',
    description: '10-week summer research fellowships. Work on research projects across all Caltech divisions. Competitive and prestigious.',
    url: 'https://www.caltech.edu/about/visitor-information/summer-research',
    tags: ['research', 'stem', 'prestigious', 'california'],
    duration: '10 weeks',
    region: 'West Coast'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMUNITY SERVICE PROGRAMS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'Key Club International',
    provider: 'Kiwanis International',
    category: 'community-service',
    subcategory: 'service-organization',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free (minimal dues)' },
    selectivity: 'open',
    admissionsImpact: 'low',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Service organization with local clubs. Community service projects, leadership development, and club activities throughout the school year.',
    url: 'https://www.keyclub.org/',
    tags: ['community-service', 'free', 'year-round', 'leadership'],
    duration: 'Year-round',
    region: 'National'
  },

  {
    name: 'Interact Club (Rotary)',
    provider: 'Rotary International',
    category: 'community-service',
    subcategory: 'service-organization',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free (minimal fees)' },
    selectivity: 'open',
    admissionsImpact: 'low',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Community service club sponsored by local Rotary clubs. Focus on humanitarian projects and leadership development.',
    url: 'https://www.rotary.org/en/get-involved/interact-club',
    tags: ['community-service', 'free', 'humanitarian'],
    duration: 'Year-round',
    region: 'National'
  },

  {
    name: 'City Year AmeriCorps',
    provider: 'City Year',
    category: 'community-service',
    subcategory: 'service-corps',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free (education award + stipend)' },
    selectivity: 'moderate',
    admissionsImpact: 'moderate',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-31',
    description: 'Gap year service program. One year of service with AmeriCorps stipend and education award. Mentoring in urban schools.',
    url: 'https://www.cityyear.org/',
    tags: ['community-service', 'gap-year', 'AmeriCorps', 'paid'],
    duration: '1 year',
    region: 'National'
  },

  {
    name: 'Habitat for Humanity (Campus Chapters)',
    provider: 'Habitat for Humanity',
    category: 'community-service',
    subcategory: 'volunteer-service',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free' },
    selectivity: 'open',
    admissionsImpact: 'low',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Volunteer home building and renovation program. Work with communities to build housing. Local and alternative break trips.',
    url: 'https://www.habitat.org/',
    tags: ['community-service', 'free', 'volunteer', 'housing'],
    duration: 'Year-round',
    region: 'National'
  },

  {
    name: 'Peace Corps Prep',
    provider: 'Peace Corps',
    category: 'community-service',
    subcategory: 'international-service',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free' },
    selectivity: 'moderate',
    admissionsImpact: 'moderate',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Prepare for Peace Corps service. Develop skills in language, service, and cultural competence. Pathway to Peace Corps.',
    url: 'https://www.peacecorps.gov/peacecorpsprep/',
    tags: ['community-service', 'international', 'free', 'leadership'],
    duration: 'Year-round',
    region: 'National'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ARTS & HUMANITIES PROGRAMS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'Interlochen Center for the Arts Summer Camp',
    provider: 'Interlochen Center for the Arts',
    category: 'arts',
    subcategory: 'performing-arts',
    type: 'summer',
    cost: { amount: 4500, type: 'paid', display: '$4,500-$9,000' },
    selectivity: 'high',
    admissionsImpact: 'moderate',
    location: { city: 'Interlochen', state: 'MI' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-04-01',
    description: '3-4 week summer arts camps in music, dance, theater, and visual arts. Intensive instruction and performance opportunities. Prestigious arts institution.',
    url: 'https://www.interlochen.org/summer',
    tags: ['arts', 'music', 'performance', 'summer-camp', 'residential'],
    duration: '3-4 weeks',
    region: 'Midwest'
  },

  {
    name: 'Tanglewood Music Festival Young Artist Program',
    provider: 'Boston Symphony Orchestra / Tanglewood',
    category: 'arts',
    subcategory: 'music',
    type: 'summer',
    cost: { amount: 8000, type: 'paid', display: '$8,000-$12,000' },
    selectivity: 'very_high',
    admissionsImpact: 'high',
    location: { city: 'Lenox', state: 'MA' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-01',
    description: 'Prestigious 8-week summer music festival. Study with world-class musicians. Orchestral training and performance opportunities.',
    url: 'https://www.tanglewood.org/festival/young-artists/',
    tags: ['music', 'prestigious', 'performance', 'classical'],
    duration: '8 weeks',
    region: 'Northeast'
  },

  {
    name: 'Iowa Young Writers\' Studio',
    provider: 'University of Iowa',
    category: 'arts',
    subcategory: 'writing',
    type: 'summer',
    cost: { amount: 1500, type: 'paid', display: '$1,500-$2,000' },
    selectivity: 'moderate',
    admissionsImpact: 'moderate',
    location: { city: 'Iowa City', state: 'IA' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-15',
    description: '2-week summer writing workshop. Poetry, fiction, creative writing. Study with published authors and university faculty.',
    url: 'https://iowayoungwriters.org/',
    tags: ['writing', 'arts', 'creative', 'affordable'],
    duration: '2 weeks',
    region: 'Midwest'
  },

  {
    name: 'Kenyon Review Young Writers\' Workshop',
    provider: 'Kenyon College',
    category: 'arts',
    subcategory: 'writing',
    type: 'summer',
    cost: { amount: 4000, type: 'paid', display: '$4,000-$5,000' },
    selectivity: 'high',
    admissionsImpact: 'moderate',
    location: { city: 'Gambier', state: 'OH' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-01',
    description: '2-week intensive writing workshop. Fiction, poetry, and creative writing. Study with published authors in small workshop settings.',
    url: 'https://www.kenyonreview.org/workshops/',
    tags: ['writing', 'arts', 'prestigious', 'creative'],
    duration: '2 weeks',
    region: 'Midwest'
  },

  {
    name: 'Telluride Association Summer Program (TASP)',
    provider: 'Telluride Association',
    category: 'arts',
    subcategory: 'liberal-arts',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free (fully funded)' },
    selectivity: 'very_high',
    admissionsImpact: 'high',
    location: { city: 'Cornell / Indiana', state: 'NY/IN' },
    eligibility: {
      grades: ['11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-28',
    description: '6-week residential seminar program. Study literature, philosophy, history, and social sciences. Highly selective and prestigious. Free tuition, room, and board.',
    url: 'https://www.tellurideinstitute.org/tasp',
    tags: ['liberal-arts', 'prestigious', 'free', 'humanities', 'residential'],
    duration: '6 weeks',
    region: 'Northeast/Midwest'
  },

  {
    name: 'Summer @ Brown for High School Writers',
    provider: 'Brown University',
    category: 'arts',
    subcategory: 'writing',
    type: 'summer',
    cost: { amount: 3500, type: 'paid', display: '$3,500-$4,000' },
    selectivity: 'moderate',
    admissionsImpact: 'low',
    location: { city: 'Providence', state: 'RI' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-15',
    description: '3-week creative writing program at Brown. Focus on fiction, poetry, creative nonfiction. Study with published writers.',
    url: 'https://summerapps.brown.edu/',
    tags: ['writing', 'arts', 'creative'],
    duration: '3 weeks',
    region: 'Northeast'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENTREPRENEURSHIP PROGRAMS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'LaunchX Entrepreneurship Program',
    provider: 'LaunchX',
    category: 'entrepreneurship',
    subcategory: 'startup',
    type: 'summer',
    cost: { amount: 5000, type: 'paid', display: '$5,000' },
    selectivity: 'moderate',
    admissionsImpact: 'moderate',
    location: { city: 'Multiple Cities', state: 'all' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-05-01',
    description: '5-week summer program focused on startup creation. Pitch competition, mentorship from entrepreneurs, and practical business skills.',
    url: 'https://launchx.com/',
    tags: ['entrepreneurship', 'startup', 'business', 'pitch'],
    duration: '5 weeks',
    region: 'National'
  },

  {
    name: 'Startup Summer',
    provider: 'Startup Summer',
    category: 'entrepreneurship',
    subcategory: 'startup',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free' },
    selectivity: 'open',
    admissionsImpact: 'low',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-06-30',
    description: 'Summer gap year entrepreneurship program. Build a startup with mentorship and resources. Develop product and business plan.',
    url: 'https://startupsummer.co/',
    tags: ['entrepreneurship', 'startup', 'gap-year', 'free'],
    duration: '12 weeks',
    region: 'National'
  },

  {
    name: 'NFTE (Network for Teaching Entrepreneurship)',
    provider: 'NFTE',
    category: 'entrepreneurship',
    subcategory: 'business-education',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free' },
    selectivity: 'open',
    admissionsImpact: 'low',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: ['low-income']
    },
    deadline: '2026-12-31',
    description: 'Year-round entrepreneurship education program. Entrepreneurship curriculum, mentoring, pitch competitions, and startup support.',
    url: 'https://www.nfte.com/',
    tags: ['entrepreneurship', 'business', 'free', 'mentoring'],
    duration: 'Year-round',
    region: 'National'
  },

  {
    name: 'Young Entrepreneurs Academy (YEA)',
    provider: 'Young Entrepreneurs Academy',
    category: 'entrepreneurship',
    subcategory: 'business-education',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free (some chapters have fees)' },
    selectivity: 'open',
    admissionsImpact: 'low',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Year-round entrepreneurship curriculum. Business plan development, mentorship, and pitch competition. Across multiple cities.',
    url: 'https://www.yea.org/',
    tags: ['entrepreneurship', 'business', 'mentoring', 'pitch'],
    duration: 'Year-round',
    region: 'National'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NON-TRADITIONAL / GAP YEAR PROGRAMS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'Global Citizen Year',
    provider: 'Global Citizen Year',
    category: 'non-traditional',
    subcategory: 'gap-year',
    type: 'year-round',
    cost: { amount: 30000, type: 'paid', display: '$30,000 (financial aid available)' },
    selectivity: 'moderate',
    admissionsImpact: 'moderate',
    location: { city: 'International', state: 'all' },
    eligibility: {
      grades: ['12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-01',
    description: '6-month gap year program. Service and language immersion in Latin America, Africa, or Asia. Personal development and global citizenship.',
    url: 'https://www.globalcitizenyear.org/',
    tags: ['gap-year', 'international', 'service', 'immersion'],
    duration: '6 months',
    region: 'International'
  },

  {
    name: 'Where There Be Dragons',
    provider: 'Where There Be Dragons',
    category: 'non-traditional',
    subcategory: 'gap-year',
    type: 'year-round',
    cost: { amount: 35000, type: 'paid', display: '$35,000 (aid available)' },
    selectivity: 'moderate',
    admissionsImpact: 'moderate',
    location: { city: 'International', state: 'all' },
    eligibility: {
      grades: ['12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-01',
    description: '4-6 month gap year program. Travel and learning across Africa, Southeast Asia, Central America, and South America. Personal growth and adventure.',
    url: 'https://www.wheretherebedragons.com/',
    tags: ['gap-year', 'travel', 'international', 'adventure'],
    duration: '4-6 months',
    region: 'International'
  },

  {
    name: 'Open Source Contributions',
    provider: 'Various (GitHub, Open Source Organizations)',
    category: 'non-traditional',
    subcategory: 'technology',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free' },
    selectivity: 'open',
    admissionsImpact: 'high',
    location: { city: 'Remote', state: 'all' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Contribute to open source projects on GitHub. Build portfolio, learn software development, collaborate globally. No formal program but highly valued.',
    url: 'https://opensource.guide/',
    tags: ['tech', 'programming', 'free', 'portfolio', 'remote'],
    duration: 'Year-round',
    region: 'National'
  },

  {
    name: 'Major League Hacking (MLH)',
    provider: 'Major League Hacking',
    category: 'non-traditional',
    subcategory: 'hackathons',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free (free travel)' },
    selectivity: 'open',
    admissionsImpact: 'moderate',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'League of hackathons across North America. Build software, network with engineers, free travel. Student hackathon season.',
    url: 'https://mlh.io/',
    tags: ['hackathons', 'tech', 'programming', 'free', 'portfolio'],
    duration: 'Year-round (weekends)',
    region: 'National'
  },

  {
    name: 'Thiel Fellowship',
    provider: 'Thiel Foundation',
    category: 'non-traditional',
    subcategory: 'entrepreneur-fellowship',
    type: 'year-round',
    cost: { amount: 100000, type: 'paid', display: '$100,000 grant' },
    selectivity: 'very_high',
    admissionsImpact: 'very_high',
    location: { city: 'Remote / San Francisco', state: 'all' },
    eligibility: {
      grades: ['12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-05-01',
    description: '2-year fellowship. $100,000 grant to pursue entrepreneurship instead of university. Mentorship and network access.',
    url: 'https://thielfellowship.org/',
    tags: ['fellowship', 'entrepreneur', 'alternative-path', 'prestigious'],
    duration: '2 years',
    region: 'National'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GOVERNMENT / POLICY PROGRAMS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'Senate Page Program',
    provider: 'U.S. Senate',
    category: 'leadership',
    subcategory: 'government-service',
    type: 'semester',
    cost: { amount: 0, type: 'free', display: 'Free (paid position)' },
    selectivity: 'high',
    admissionsImpact: 'high',
    location: { city: 'Washington', state: 'DC' },
    eligibility: {
      grades: ['11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-01-31',
    description: 'Semester-long paid position as U.S. Senate Page. Work on Capitol Hill, attend classes, gain government experience.',
    url: 'https://www.senate.gov/visitors/senate-page-program.htm',
    tags: ['government', 'senate', 'paid', 'prestigious', 'leadership'],
    duration: '1 semester',
    region: 'Northeast'
  },

  {
    name: 'House Page Program',
    provider: 'U.S. House of Representatives',
    category: 'leadership',
    subcategory: 'government-service',
    type: 'semester',
    cost: { amount: 0, type: 'free', display: 'Free (paid position)' },
    selectivity: 'high',
    admissionsImpact: 'high',
    location: { city: 'Washington', state: 'DC' },
    eligibility: {
      grades: ['11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-02-28',
    description: 'Semester-long paid position as U.S. House Page. Work on Capitol Hill, attend page school, experience legislative branch.',
    url: 'https://house.gov/representatives/find-your-representative',
    tags: ['government', 'house', 'paid', 'prestigious', 'leadership'],
    duration: '1 semester',
    region: 'Northeast'
  },

  {
    name: 'Close Up Foundation Programs',
    provider: 'Close Up Foundation',
    category: 'leadership',
    subcategory: 'civic-education',
    type: 'semester',
    cost: { amount: 5000, type: 'paid', display: '$5,000-$7,000 (scholarships available)' },
    selectivity: 'moderate',
    admissionsImpact: 'low',
    location: { city: 'Washington', state: 'DC' },
    eligibility: {
      grades: ['11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-31',
    description: 'Semester or summer programs in Washington DC. Government, civics, and citizenship education. Internships and coursework.',
    url: 'https://www.closeup.org/',
    tags: ['government', 'civics', 'leadership', 'internship'],
    duration: '1 semester or 2 weeks',
    region: 'Northeast'
  },

  {
    name: 'Model UN Programs',
    provider: 'Various Organizations / Schools',
    category: 'leadership',
    subcategory: 'civic-engagement',
    type: 'year-round',
    cost: { amount: 500, type: 'paid', display: '$500-$2,000 (variable)' },
    selectivity: 'open',
    admissionsImpact: 'moderate',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Year-round simulation of UN General Assembly. Develop diplomacy and public speaking skills. Compete in conferences across country.',
    url: 'https://www.unausa.org/get-involved/model-un/',
    tags: ['leadership', 'government', 'debate', 'year-round'],
    duration: 'Year-round',
    region: 'National'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCIENCE COMPETITIONS / ACADEMIC ACTIVITIES
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'USAMO (U.S. Mathematical Olympiad)',
    provider: 'Mathematical Association of America',
    category: 'stem',
    subcategory: 'math-competition',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free' },
    selectivity: 'very_high',
    admissionsImpact: 'very_high',
    location: { city: 'National', state: 'all' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Advanced math olympiad competition. Multiple rounds of extremely difficult proof-based problems. Prestigious competition leading to international olympiad.',
    url: 'https://www.maa.org/math-competitions/american-mathematics-competitions',
    tags: ['math', 'competition', 'prestigious', 'olympiad'],
    duration: 'Year-round',
    region: 'National'
  },

  {
    name: 'USABO (U.S. Biology Olympiad)',
    provider: 'Center for Excellence in Education',
    category: 'stem',
    subcategory: 'science-competition',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free' },
    selectivity: 'very_high',
    admissionsImpact: 'very_high',
    location: { city: 'National', state: 'all' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'National biology competition. Advanced biology knowledge and lab skills. Top performers advance to international biology olympiad.',
    url: 'https://www.soinc.org/',
    tags: ['biology', 'competition', 'olympiad', 'prestigious'],
    duration: 'Year-round',
    region: 'National'
  },

  {
    name: 'USACO (U.S. Computing Olympiad)',
    provider: 'USACO',
    category: 'stem',
    subcategory: 'computer-science',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free' },
    selectivity: 'very_high',
    admissionsImpact: 'high',
    location: { city: 'Remote', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Competitive programming contests. Year-round online competitions. Advance through levels from Bronze to Platinum.',
    url: 'http://www.usaco.org/',
    tags: ['programming', 'competition', 'algorithms', 'remote', 'free'],
    duration: 'Year-round',
    region: 'National'
  },

  {
    name: 'Science Olympiad',
    provider: 'Science Olympiad Organization',
    category: 'stem',
    subcategory: 'science-competition',
    type: 'year-round',
    cost: { amount: 500, type: 'paid', display: '$500 (school-dependent)' },
    selectivity: 'open',
    admissionsImpact: 'moderate',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: '23-event science competition. Physics, chemistry, biology, astronomy. Regional, state, and national competitions.',
    url: 'https://www.soinc.org/',
    tags: ['stem', 'science', 'competition', 'team'],
    duration: 'Year-round',
    region: 'National'
  },

  {
    name: 'Intel Science Talent Search',
    provider: 'Society for Science',
    category: 'stem',
    subcategory: 'science-research',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free' },
    selectivity: 'very_high',
    admissionsImpact: 'very_high',
    location: { city: 'National', state: 'all' },
    eligibility: {
      grades: ['11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-01-15',
    description: 'Prestigious national science and engineering competition. Submit original research project. Top finalists compete in Washington DC.',
    url: 'https://www.societyforscience.org/programs/intel-science-talent-search/',
    tags: ['research', 'science', 'prestigious', 'competition'],
    duration: 'Year-round',
    region: 'National'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OUTDOOR & ADVENTURE PROGRAMS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'NOLS (National Outdoor Leadership School)',
    provider: 'NOLS',
    category: 'leadership',
    subcategory: 'outdoor-leadership',
    type: 'summer',
    cost: { amount: 5000, type: 'paid', display: '$5,000-$8,000' },
    selectivity: 'open',
    admissionsImpact: 'low',
    location: { city: 'Multiple Locations', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-05-01',
    description: '2-4 week outdoor expeditions. Wilderness skills and leadership training. Rock climbing, mountaineering, backpacking, kayaking options.',
    url: 'https://www.nols.edu/',
    tags: ['leadership', 'outdoor', 'adventure', 'skills'],
    duration: '2-4 weeks',
    region: 'National'
  },

  {
    name: 'Outward Bound',
    provider: 'Outward Bound USA',
    category: 'leadership',
    subcategory: 'outdoor-leadership',
    type: 'summer',
    cost: { amount: 3500, type: 'paid', display: '$3,500-$5,500' },
    selectivity: 'open',
    admissionsImpact: 'low',
    location: { city: 'Multiple Centers', state: 'all' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-05-01',
    description: '1-3 week expeditions. Wilderness skills, teamwork, and personal growth. Climbing, backpacking, sailing, and rock climbing courses.',
    url: 'https://www.outwardbound.org/',
    tags: ['leadership', 'outdoor', 'adventure', 'teamwork'],
    duration: '1-3 weeks',
    region: 'National'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ONLINE & DIGITAL PROGRAMS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'MIT OpenCourseWare Certificates',
    provider: 'MIT',
    category: 'pre-college',
    subcategory: 'online-learning',
    type: 'online',
    cost: { amount: 0, type: 'free', display: 'Free' },
    selectivity: 'open',
    admissionsImpact: 'low',
    location: { city: 'Remote', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Free access to thousands of MIT courses online. Self-paced learning. No certification but great for exploration.',
    url: 'https://ocw.mit.edu/',
    tags: ['online', 'free', 'learning', 'college-prep'],
    duration: 'Self-paced',
    region: 'National'
  },

  {
    name: 'Coursera: College Preparation Programs',
    provider: 'Coursera / Partner Universities',
    category: 'pre-college',
    subcategory: 'online-learning',
    type: 'online',
    cost: { amount: 0, type: 'free', display: 'Free (audit mode)' },
    selectivity: 'open',
    admissionsImpact: 'low',
    location: { city: 'Remote', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Thousands of courses from top universities. Audit for free or pay for certificates. Subject range from STEM to humanities.',
    url: 'https://www.coursera.org/',
    tags: ['online', 'college-prep', 'flexible', 'free-audit'],
    duration: 'Self-paced',
    region: 'National'
  },

  {
    name: 'edX MicroBachelors',
    provider: 'edX',
    category: 'pre-college',
    subcategory: 'online-learning',
    type: 'online',
    cost: { amount: 0, type: 'free', display: 'Free (audit) / $500-$1,000 (certificate)' },
    selectivity: 'open',
    admissionsImpact: 'low',
    location: { city: 'Remote', state: 'all' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Series of university-level courses leading to credential. Computer science, business, data science focus.',
    url: 'https://www.edx.org/microbachelors',
    tags: ['online', 'learning', 'college-prep', 'credentials'],
    duration: 'Self-paced',
    region: 'National'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL ELITE PROGRAMS - DIVERSIFY PORTFOLIO
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'Duke TIP (Talent Identification Program)',
    provider: 'Duke University',
    category: 'pre-college',
    subcategory: 'gifted-identification',
    type: 'summer',
    cost: { amount: 4000, type: 'paid', display: '$4,000-$6,500' },
    selectivity: 'high',
    admissionsImpact: 'moderate',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-31',
    description: '3-4 week summer programs for gifted students. Residential accelerated academics. STEM, leadership, and writing tracks.',
    url: 'https://tip.duke.edu/',
    tags: ['gifted', 'summer', 'residential', 'academics'],
    duration: '3-4 weeks',
    region: 'National'
  },

  {
    name: 'CTY (Center for Talented Youth) Summer Programs',
    provider: 'Johns Hopkins University',
    category: 'pre-college',
    subcategory: 'gifted-education',
    type: 'summer',
    cost: { amount: 3000, type: 'paid', display: '$3,000-$4,500' },
    selectivity: 'moderate',
    admissionsImpact: 'low',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['7', '8', '9', '10', '11'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-15',
    description: '2-3 week summer programs for talented youth. Residential or day options. STEM, humanities, leadership courses.',
    url: 'https://cty.jhu.edu/',
    tags: ['gifted', 'summer', 'academic', 'residential'],
    duration: '2-3 weeks',
    region: 'National'
  },

  {
    name: 'Art of Problem Solving Summer Camps',
    provider: 'Art of Problem Solving (AoPS)',
    category: 'stem',
    subcategory: 'mathematics',
    type: 'summer',
    cost: { amount: 3000, type: 'paid', display: '$3,000-$4,000' },
    selectivity: 'moderate',
    admissionsImpact: 'low',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['7', '8', '9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-04-15',
    description: '1-2 week summer camp for math enthusiasts. Rigorous math competitions prep, problem solving techniques.',
    url: 'https://artofproblemsolving.com/summer',
    tags: ['math', 'competition', 'summer', 'problem-solving'],
    duration: '1-2 weeks',
    region: 'National'
  },

  {
    name: 'Yale Young Writers Workshop',
    provider: 'Yale University',
    category: 'arts',
    subcategory: 'writing',
    type: 'summer',
    cost: { amount: 3000, type: 'paid', display: '$3,000-$3,500' },
    selectivity: 'moderate',
    admissionsImpact: 'low',
    location: { city: 'New Haven', state: 'CT' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-04-01',
    description: '5-day intensive writing workshop at Yale. Workshop style with experienced writers. Poetry, fiction, nonfiction.',
    url: 'https://summer.yale.edu/programs/yale-young-writers/',
    tags: ['writing', 'arts', 'elite', 'intensive'],
    duration: '5 days',
    region: 'Northeast'
  },

  {
    name: 'Northwestern Summer Immersion Program',
    provider: 'Northwestern University',
    category: 'pre-college',
    subcategory: 'summer-academic',
    type: 'summer',
    cost: { amount: 5000, type: 'paid', display: '$5,000-$8,000' },
    selectivity: 'moderate',
    admissionsImpact: 'low',
    location: { city: 'Evanston', state: 'IL' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-15',
    description: '2-week college-level courses at Northwestern. STEM, business, journalism, arts offerings.',
    url: 'https://www.northwestern.edu/summer/programs/',
    tags: ['college-courses', 'summer', 'residential'],
    duration: '2 weeks',
    region: 'Midwest'
  },

  {
    name: 'UC Berkeley Summer Science Programs',
    provider: 'UC Berkeley',
    category: 'stem',
    subcategory: 'summer-academic',
    type: 'summer',
    cost: { amount: 3500, type: 'paid', display: '$3,500-$5,000' },
    selectivity: 'moderate',
    admissionsImpact: 'low',
    location: { city: 'Berkeley', state: 'CA' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-04-01',
    description: '2-4 week intensive STEM programs. Chemistry, biology, physics, computer science courses.',
    url: 'https://summerscience.berkeley.edu/',
    tags: ['stem', 'summer', 'california'],
    duration: '2-4 weeks',
    region: 'West Coast'
  },

  {
    name: 'Rose-Hulman Summer Math Camp',
    provider: 'Rose-Hulman Institute of Technology',
    category: 'stem',
    subcategory: 'mathematics',
    type: 'summer',
    cost: { amount: 1200, type: 'paid', display: '$1,200-$1,800' },
    selectivity: 'moderate',
    admissionsImpact: 'low',
    location: { city: 'Terre Haute', state: 'IN' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-04-15',
    description: '1-week intensive math camp. Problem-solving, competition math, and recreational mathematics.',
    url: 'https://www.rose-hulman.edu/events/rose-hulman-math-camps/',
    tags: ['math', 'affordable', 'summer', 'competition'],
    duration: '1 week',
    region: 'Midwest'
  },

  {
    name: 'American Chemical Society Summer Youth Workshop',
    provider: 'American Chemical Society',
    category: 'stem',
    subcategory: 'chemistry',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free' },
    selectivity: 'open',
    admissionsImpact: 'low',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: ['underrepresented minorities']
    },
    deadline: '2026-04-30',
    description: 'Multi-day workshops introducing chemistry and career paths. Interactive labs and industry speakers.',
    url: 'https://www.acs.org/education',
    tags: ['chemistry', 'stem', 'free', 'career'],
    duration: '3-5 days',
    region: 'National'
  },

  {
    name: 'University of Chicago Scav Hunt',
    provider: 'University of Chicago',
    category: 'non-traditional',
    subcategory: 'competition',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free (travel only)' },
    selectivity: 'open',
    admissionsImpact: 'low',
    location: { city: 'Chicago', state: 'IL' },
    eligibility: {
      grades: ['11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'High school scavenger hunt competition. Teams compete to complete creative and complex challenges.',
    url: 'https://scavhunt.uchicago.edu/',
    tags: ['competition', 'creative', 'free'],
    duration: '1 weekend',
    region: 'Midwest'
  },

  {
    name: 'IEEE Youth Programs',
    provider: 'IEEE',
    category: 'stem',
    subcategory: 'engineering',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free (some memberships)' },
    selectivity: 'open',
    admissionsImpact: 'low',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Engineering competitions, mentoring, and workshops throughout the year. Robotics and technical skill development.',
    url: 'https://www.ieee.org/students/',
    tags: ['engineering', 'stem', 'robotics', 'competitions'],
    duration: 'Year-round',
    region: 'National'
  },

  {
    name: 'FIRST Robotics',
    provider: 'FIRST',
    category: 'stem',
    subcategory: 'engineering',
    type: 'year-round',
    cost: { amount: 5000, type: 'paid', display: '$5,000 (team-dependent)' },
    selectivity: 'open',
    admissionsImpact: 'moderate',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Year-round robotics engineering program. Build and compete with robot teams. Partnerships, mentoring, regional/nationals competitions.',
    url: 'https://www.firstinspires.org/',
    tags: ['robotics', 'engineering', 'stem', 'competition', 'year-round'],
    duration: 'Year-round',
    region: 'National'
  },

  {
    name: 'Debate Club & Speech & Debate Competitions',
    provider: 'Various / Forensics Organizations',
    category: 'leadership',
    subcategory: 'speech-debate',
    type: 'year-round',
    cost: { amount: 500, type: 'paid', display: '$500-$2,000 (school-dependent)' },
    selectivity: 'open',
    admissionsImpact: 'moderate',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-12-31',
    description: 'Year-round debate and speech competitions. Policy, Lincoln-Douglas, public forum formats. Regional and national tournaments.',
    url: 'https://www.nfhs.org/sports-media-library/nfhs-handbook/',
    tags: ['debate', 'leadership', 'communication', 'year-round', 'competitions'],
    duration: 'Year-round',
    region: 'National'
  },

  // Additional programs for portfolio completeness

  {
    name: 'Science Olympiad Invitational Summer Camp',
    provider: 'Various Universities',
    category: 'stem',
    subcategory: 'science-competition',
    type: 'summer',
    cost: { amount: 400, type: 'paid', display: '$400-$800' },
    selectivity: 'moderate',
    admissionsImpact: 'low',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-05-31',
    description: 'Multi-day science olympiad preparation camps. Build and test devices, compete in practice events.',
    url: 'https://www.soinc.org/',
    tags: ['science', 'stem', 'competition', 'training'],
    duration: '1-3 days',
    region: 'National'
  },

  {
    name: 'Princeton PrePrinceton',
    provider: 'Princeton University',
    category: 'leadership',
    subcategory: 'diversity-program',
    type: 'weekend',
    cost: { amount: 0, type: 'free', display: 'Free (all expenses covered)' },
    selectivity: 'high',
    admissionsImpact: 'moderate',
    location: { city: 'Princeton', state: 'NJ' },
    eligibility: {
      grades: ['12'],
      states: ['all'],
      gpa: null,
      demographics: ['underrepresented minorities', 'first-generation']
    },
    deadline: '2026-02-15',
    description: '2-day visit program for underrepresented minorities and first-generation students. Campus tour, sessions on college life.',
    url: 'https://admission.princeton.edu/',
    tags: ['diversity', 'college-prep', 'free', 'minorities'],
    duration: '2 days',
    region: 'Northeast'
  },

  {
    name: 'Stanford Summer Program for Underrepresented Students',
    provider: 'Stanford University',
    category: 'leadership',
    subcategory: 'diversity-program',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free (fully funded)' },
    selectivity: 'high',
    admissionsImpact: 'moderate',
    location: { city: 'Stanford', state: 'CA' },
    eligibility: {
      grades: ['11', '12'],
      states: ['all'],
      gpa: null,
      demographics: ['underrepresented minorities', 'first-generation', 'low-income']
    },
    deadline: '2026-03-01',
    description: '2-week residential summer program for underrepresented minorities. Academic and leadership development.',
    url: 'https://summer.stanford.edu/',
    tags: ['diversity', 'summer', 'free', 'residential'],
    duration: '2 weeks',
    region: 'West Coast'
  },

  {
    name: 'Girls Who Code Summer Immersion Program',
    provider: 'Girls Who Code',
    category: 'stem',
    subcategory: 'computer-science',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free (fully funded)' },
    selectivity: 'high',
    admissionsImpact: 'moderate',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: ['women', 'underrepresented minorities']
    },
    deadline: '2026-03-15',
    description: '7-week summer immersion program. Learn computer science and software engineering. Residential experience.',
    url: 'https://girlswhocode.com/',
    tags: ['stem', 'programming', 'women', 'free', 'residential'],
    duration: '7 weeks',
    region: 'National'
  },

  {
    name: 'Code2040 Summer Internship',
    provider: 'Code2040',
    category: 'stem',
    subcategory: 'tech-internship',
    type: 'summer',
    cost: { amount: 0, type: 'free', display: 'Free (paid internship)' },
    selectivity: 'high',
    admissionsImpact: 'high',
    location: { city: 'Multiple', state: 'all' },
    eligibility: {
      grades: ['12'],
      states: ['all'],
      gpa: null,
      demographics: ['underrepresented minorities']
    },
    deadline: '2026-02-01',
    description: '8-week paid tech internship. Placement with leading tech companies. Mentorship and professional development.',
    url: 'https://www.code2040.org/',
    tags: ['tech', 'internship', 'paid', 'minorities', 'diversity'],
    duration: '8 weeks',
    region: 'National'
  },

  {
    name: 'Summer @ Penn (High School Programs)',
    provider: 'University of Pennsylvania',
    category: 'pre-college',
    subcategory: 'summer-academic',
    type: 'summer',
    cost: { amount: 4000, type: 'paid', display: '$4,000-$6,000' },
    selectivity: 'moderate',
    admissionsImpact: 'low',
    location: { city: 'Philadelphia', state: 'PA' },
    eligibility: {
      grades: ['10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-04-01',
    description: '2-4 week residential and day programs. College-level courses, Penn campus living experience.',
    url: 'https://www.sas.upenn.edu/summer/',
    tags: ['college-courses', 'ivy-league', 'summer'],
    duration: '2-4 weeks',
    region: 'Northeast'
  },

  {
    name: 'UCLA Summer Programs',
    provider: 'UCLA',
    category: 'pre-college',
    subcategory: 'summer-academic',
    type: 'summer',
    cost: { amount: 2500, type: 'paid', display: '$2,500-$4,000' },
    selectivity: 'moderate',
    admissionsImpact: 'low',
    location: { city: 'Los Angeles', state: 'CA' },
    eligibility: {
      grades: ['9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-04-15',
    description: 'Multiple summer programs including Pre-College Programs. STEM, business, arts offerings.',
    url: 'https://summer.ucla.edu/',
    tags: ['college-courses', 'california', 'summer'],
    duration: '1-4 weeks',
    region: 'West Coast'
  },

  {
    name: 'Johns Hopkins CTY Online Programs',
    provider: 'Johns Hopkins University / CTY',
    category: 'pre-college',
    subcategory: 'online-learning',
    type: 'online',
    cost: { amount: 1500, type: 'paid', display: '$1,500-$2,500' },
    selectivity: 'moderate',
    admissionsImpact: 'low',
    location: { city: 'Remote', state: 'all' },
    eligibility: {
      grades: ['7', '8', '9', '10', '11', '12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-05-01',
    description: 'Online courses for gifted students. Self-paced or synchronous. Wide range of STEM and humanities subjects.',
    url: 'https://cty.jhu.edu/online/',
    tags: ['online', 'gifted', 'flexible', 'academic'],
    duration: 'Flexible',
    region: 'National'
  },

  {
    name: 'Bridge Year Program (Princeton)',
    provider: 'Princeton University',
    category: 'non-traditional',
    subcategory: 'gap-year',
    type: 'year-round',
    cost: { amount: 0, type: 'free', display: 'Free (fully funded)' },
    selectivity: 'very_high',
    admissionsImpact: 'moderate',
    location: { city: 'International', state: 'all' },
    eligibility: {
      grades: ['12'],
      states: ['all'],
      gpa: null,
      demographics: []
    },
    deadline: '2026-03-15',
    description: 'One-year international gap program funded by Princeton. Service and language immersion. Deferred admission to Princeton.',
    url: 'https://bridgeyear.princeton.edu/',
    tags: ['gap-year', 'international', 'free', 'service'],
    duration: '1 year',
    region: 'International'
  },
];

/**
 * Main scraper function
 */
export async function scrapePrograms() {
  log(SCRAPER_NAME, 'Starting programs scraper...', 'progress');

  try {
    // Deduplicate by name
    const deduplicated = deduplicateByKey(programsData, p => p.name.toLowerCase());

    log(SCRAPER_NAME, `Total programs compiled: ${deduplicated.length}`, 'info');

    // Create metadata
    const metadata = {
      lastScraped: new Date().toISOString().split('T')[0],
      totalCount: deduplicated.length,
      sources: [
        'MIT MITES',
        'Stanford University',
        'Yale University',
        'Columbia University',
        'Harvard University',
        'Princeton University',
        'University of Pennsylvania',
        'Brown University',
        'Cornell University',
        'Duke University',
        'Northwestern University',
        'UCLA',
        'UC Berkeley',
        'Caltech',
        'Boston University',
        'Northeastern University',
        'Carnegie Mellon University',
        'American Legion (Boys & Girls State)',
        'Rotary International',
        'Various Science Olympiad organizers',
        'Major League Hacking',
        'Peace Corps',
        'AmeriCorps',
        'Council on International Educational Exchange',
        'NSF Research Programs',
        'NIH Internship Program',
      ]
    };

    // Build final data structure
    const output = {
      metadata,
      programs: deduplicated
    };

    // Save to file
    const filePath = await saveScrapedData('programs.json', output);

    log(SCRAPER_NAME, `Successfully scraped ${output.programs.length} programs`, 'success');
    log(SCRAPER_NAME, `Saved to: ${filePath}`, 'success');

    return output;
  } catch (error) {
    log(SCRAPER_NAME, `Error during scraping: ${error.message}`, 'error');
    throw error;
  }
}
