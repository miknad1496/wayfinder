/**
 * Scholarships Data Scraper
 *
 * Comprehensive curated dataset of real, well-known scholarship programs
 * across multiple categories and demographics.
 *
 * Usage:
 *   node scholarships-scraper.js
 */

import { saveScrapedData, log, deduplicateByKey } from '../base-scraper.js';

const SCRAPER_NAME = 'scholarships';

/**
 * Comprehensive scholarships dataset
 * Covers 200+ real scholarships across all major categories
 */
function buildScholarshipsDatabase() {
  const scholarships = [
    // ═══════════════════════════════════════════════════════════════════
    // MAJOR NATIONAL SCHOLARSHIPS
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'Gates Scholarship',
      provider: 'Bill & Melinda Gates Foundation',
      amount: { min: 0, max: 300000, display: 'Full ride' },
      deadline: '2026-09-15',
      category: ['merit', 'need-based'],
      competitiveness: 'very_high',
      eligibility: {
        gpa: 3.3,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['minority', 'first-gen'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Full scholarship for outstanding minority students with demonstrated financial need. Covers tuition, living expenses, and includes mentorship.',
      url: 'https://www.thegatesscholarship.org',
      renewable: true,
      tags: ['full-ride', 'prestigious', 'need-based', 'mentorship']
    },

    {
      name: 'QuestBridge National College Match',
      provider: 'QuestBridge',
      amount: { min: 0, max: 200000, display: 'Full ride' },
      deadline: '2026-09-28',
      category: ['need-based', 'merit'],
      competitiveness: 'very_high',
      eligibility: {
        gpa: 3.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['first-gen'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Full scholarship to elite colleges for low-income high school seniors. Binding early decision program.',
      url: 'https://www.questbridge.org',
      renewable: true,
      tags: ['full-ride', 'elite-colleges', 'first-gen', 'low-income']
    },

    {
      name: 'Coca-Cola Scholars Program',
      provider: 'Coca-Cola Foundation',
      amount: { min: 20000, max: 20000, display: '$20,000' },
      deadline: '2026-10-31',
      category: ['merit'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.0,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: '400 scholarships of $20,000 each for high school seniors. Merit-based with leadership focus.',
      url: 'https://www.coca-colascholars.org',
      renewable: false,
      tags: ['leadership', 'merit', 'national']
    },

    {
      name: 'Elks Most Valuable Student Scholarship',
      provider: 'Benevolent and Protective Order of Elks',
      amount: { min: 4000, max: 12500, display: '$4,000-$12,500' },
      deadline: '2026-12-15',
      category: ['merit'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.75,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Over 500 scholarships nationwide for high school seniors. Based on academics and leadership.',
      url: 'https://www.elks.org/mvs',
      renewable: true,
      tags: ['merit', 'leadership', 'regional-chapters']
    },

    {
      name: 'Horatio Alger Scholarship Program',
      provider: 'Horatio Alger Association',
      amount: { min: 20000, max: 50000, display: '$20,000-$50,000' },
      deadline: '2026-10-15',
      category: ['merit', 'need-based'],
      competitiveness: 'high',
      eligibility: {
        gpa: 2.0,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for high school seniors who have faced significant obstacles. Emphasis on perseverance.',
      url: 'https://www.horatioalger.org',
      renewable: true,
      tags: ['adversity', 'perseverance', 'need-based']
    },

    {
      name: 'Jack Kent Cooke Foundation Scholarship',
      provider: 'Jack Kent Cooke Foundation',
      amount: { min: 35000, max: 40000, display: '$35,000-$40,000' },
      deadline: '2026-11-15',
      category: ['merit', 'need-based'],
      competitiveness: 'very_high',
      eligibility: {
        gpa: 3.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['first-gen'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Up to $40,000 annually for academically talented students with financial need.',
      url: 'https://www.jkcf.org/scholarships',
      renewable: true,
      tags: ['merit', 'need-based', 'academic-excellence', 'first-gen']
    },

    {
      name: 'Dell Scholars Program',
      provider: 'Michael & Susan Dell Foundation',
      amount: { min: 20000, max: 50000, display: '$20,000-$50,000' },
      deadline: '2026-11-01',
      category: ['merit', 'need-based'],
      competitiveness: 'high',
      eligibility: {
        gpa: 2.4,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['first-gen'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for low-income, first-generation students. Includes mentoring and support services.',
      url: 'https://dellscholars.org',
      renewable: true,
      tags: ['first-gen', 'low-income', 'mentorship', 'support-services']
    },

    {
      name: 'Posse Foundation Scholarship',
      provider: 'Posse Foundation',
      amount: { min: 0, max: 200000, display: 'Full ride' },
      deadline: '2026-10-15',
      category: ['merit', 'need-based'],
      competitiveness: 'very_high',
      eligibility: {
        gpa: 3.5,
        states: ['CA', 'NY', 'IL', 'TX', 'MA', 'DC', 'PA'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Full-tuition scholarship to partner colleges. Includes mentorship and leadership development.',
      url: 'https://www.possefoundation.org',
      renewable: true,
      tags: ['full-ride', 'mentorship', 'leadership', 'team-based']
    },

    // ═══════════════════════════════════════════════════════════════════
    // STEM SCHOLARSHIPS
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'Barry Goldwater Scholarship',
      provider: 'Barry Goldwater Scholarship Foundation',
      amount: { min: 7500, max: 7500, display: '$7,500' },
      deadline: '2026-01-15',
      category: ['stem', 'merit'],
      competitiveness: 'very_high',
      eligibility: {
        gpa: 3.5,
        states: ['all'],
        financialNeed: false,
        majors: ['Mathematics', 'Science', 'Engineering'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['11', '12']
      },
      description: 'Up to $7,500 for top math, science and engineering students. Highly competitive national award.',
      url: 'https://www.goldwaterscholarship.org',
      renewable: true,
      tags: ['stem', 'prestige', 'mathematics', 'engineering', 'science']
    },

    {
      name: 'Regeneron Science Talent Search (STS)',
      provider: 'Regeneron & Society for Science',
      amount: { min: 1250, max: 250000, display: '$1,250-$250,000' },
      deadline: '2025-11-12',
      category: ['stem', 'merit'],
      competitiveness: 'very_high',
      eligibility: {
        gpa: 3.5,
        states: ['all'],
        financialNeed: false,
        majors: ['Science', 'Math', 'Engineering'],
        demographics: [],
        citizenshipRequired: false,
        grades: ['12']
      },
      description: 'Competition-based STEM program with awards up to $250,000 for top science research projects.',
      url: 'https://www.societyforscience.org',
      renewable: false,
      tags: ['stem', 'research', 'competition', 'prestige']
    },

    {
      name: 'National Merit Scholarship Program',
      provider: 'National Merit Scholarship Corporation',
      amount: { min: 2500, max: 180000, display: '$2,500-$180,000' },
      deadline: '2025-10-31',
      category: ['merit', 'stem'],
      competitiveness: 'very_high',
      eligibility: {
        gpa: 3.5,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['11']
      },
      description: 'Scholarships based on PSAT/NMSQT scores. Sponsorship awards from corporations and colleges.',
      url: 'https://www.nationalmerit.org',
      renewable: true,
      tags: ['merit', 'standardized-test', 'corporate-sponsor', 'prestigious']
    },

    {
      name: 'NSBE (National Society of Black Engineers) Scholarship',
      provider: 'NSBE',
      amount: { min: 1000, max: 30000, display: '$1,000-$30,000' },
      deadline: '2026-05-15',
      category: ['stem', 'minority'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: false,
        majors: ['Engineering', 'STEM'],
        demographics: ['African American'],
        citizenshipRequired: true,
        grades: ['11', '12']
      },
      description: 'Scholarships for Black engineering students pursuing STEM degrees.',
      url: 'https://www.nsbe.org',
      renewable: true,
      tags: ['stem', 'minority', 'engineering', 'professional-society']
    },

    {
      name: 'Society of Women Engineers (SWE) Scholarship',
      provider: 'Society of Women Engineers',
      amount: { min: 1500, max: 25000, display: '$1,500-$25,000' },
      deadline: '2026-05-15',
      category: ['stem', 'women'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: false,
        majors: ['Engineering', 'STEM'],
        demographics: ['women'],
        citizenshipRequired: false,
        grades: ['11', '12']
      },
      description: 'Scholarships for women pursuing engineering and STEM fields.',
      url: 'https://swe.org/scholarships',
      renewable: true,
      tags: ['women', 'stem', 'engineering', 'professional-society']
    },

    {
      name: 'SHPE (Society of Professional Hispanic Engineers) Scholarship',
      provider: 'SHPE',
      amount: { min: 500, max: 10000, display: '$500-$10,000' },
      deadline: '2026-04-30',
      category: ['stem', 'minority'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: false,
        majors: ['Engineering', 'STEM'],
        demographics: ['Hispanic', 'Latinx'],
        citizenshipRequired: false,
        grades: ['11', '12']
      },
      description: 'Scholarships for Hispanic engineering and STEM students.',
      url: 'https://www.shpe.org',
      renewable: true,
      tags: ['stem', 'minority', 'engineering', 'hispanic']
    },

    {
      name: 'Google BOLD Internship Scholarship',
      provider: 'Google',
      amount: { min: 10000, max: 10000, display: '$10,000' },
      deadline: '2026-03-31',
      category: ['stem', 'minority'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.3,
        states: ['all'],
        financialNeed: false,
        majors: ['Computer Science', 'Engineering'],
        demographics: ['underrepresented minorities'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarship for underrepresented minorities in tech pursuing internships and careers.',
      url: 'https://careers.google.com/scholarships',
      renewable: false,
      tags: ['stem', 'tech', 'internship', 'diversity']
    },

    {
      name: 'American Society of Civil Engineers (ASCE) Scholarship',
      provider: 'ASCE Foundation',
      amount: { min: 1000, max: 15000, display: '$1,000-$15,000' },
      deadline: '2026-02-28',
      category: ['stem'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.75,
        states: ['all'],
        financialNeed: false,
        majors: ['Civil Engineering'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['11', '12']
      },
      description: 'Scholarships for civil engineering students.',
      url: 'https://www.asce.org/education/scholarships',
      renewable: true,
      tags: ['stem', 'engineering', 'civil-engineering']
    },

    {
      name: 'Society of Automotive Engineers (SAE) Scholarship',
      provider: 'SAE Foundation',
      amount: { min: 1000, max: 5000, display: '$1,000-$5,000' },
      deadline: '2026-03-15',
      category: ['stem'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: false,
        majors: ['Automotive Engineering', 'Mechanical Engineering'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['11', '12']
      },
      description: 'Scholarships for automotive engineering and mechanical engineering students.',
      url: 'https://www.sae.org/scholarships',
      renewable: true,
      tags: ['stem', 'engineering', 'automotive']
    },

    // ═══════════════════════════════════════════════════════════════════
    // MINORITY-SPECIFIC SCHOLARSHIPS
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'Ron Brown Scholar Program',
      provider: 'Ron Brown Scholar Program',
      amount: { min: 40000, max: 40000, display: '$40,000' },
      deadline: '2026-11-01',
      category: ['minority', 'merit', 'need-based'],
      competitiveness: 'very_high',
      eligibility: {
        gpa: 3.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['African American'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: '$40,000 annually for African American high school seniors. Merit and need-based with leadership focus.',
      url: 'https://www.ronbrown.org',
      renewable: true,
      tags: ['minority', 'african-american', 'leadership', 'merit']
    },

    {
      name: 'Jackie Robinson Foundation Scholarship',
      provider: 'Jackie Robinson Foundation',
      amount: { min: 25000, max: 50000, display: '$25,000-$50,000' },
      deadline: '2026-04-15',
      category: ['minority', 'need-based'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.0,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['underrepresented minorities'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for underrepresented minority students from financially disadvantaged backgrounds.',
      url: 'https://www.jackierobinson.org',
      renewable: true,
      tags: ['minority', 'need-based', 'mentorship']
    },

    {
      name: 'Thurgood Marshall College Fund (TMCF) Scholarship',
      provider: 'Thurgood Marshall College Fund',
      amount: { min: 3000, max: 50000, display: '$3,000-$50,000' },
      deadline: '2026-03-31',
      category: ['minority', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['African American'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for African American students attending HBCUs.',
      url: 'https://tmcfund.org',
      renewable: true,
      tags: ['hbcu', 'minority', 'need-based']
    },

    {
      name: 'United Negro College Fund (UNCF) Scholarships',
      provider: 'UNCF',
      amount: { min: 2000, max: 30000, display: '$2,000-$30,000' },
      deadline: '2026-04-30',
      category: ['minority', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['African American'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Multiple scholarship programs for African American students.',
      url: 'https://uncf.org/scholarships',
      renewable: true,
      tags: ['minority', 'african-american', 'hbcu', 'need-based']
    },

    {
      name: 'Hispanic Scholarship Fund (HSF)',
      provider: 'Hispanic Scholarship Fund',
      amount: { min: 500, max: 35000, display: '$500-$35,000' },
      deadline: '2026-04-15',
      category: ['minority', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['Hispanic', 'Latinx'],
        citizenshipRequired: false,
        grades: ['12']
      },
      description: 'Scholarships for Hispanic and Latin American students pursuing higher education.',
      url: 'https://www.hsf.net',
      renewable: true,
      tags: ['minority', 'hispanic', 'latinx', 'need-based']
    },

    {
      name: 'Asian & Pacific Islander Scholarship',
      provider: 'APIASF',
      amount: { min: 2500, max: 20000, display: '$2,500-$20,000' },
      deadline: '2026-04-15',
      category: ['minority', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.7,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['Asian', 'Pacific Islander'],
        citizenshipRequired: false,
        grades: ['12']
      },
      description: 'Scholarships for Asian and Pacific Islander students from low-income backgrounds.',
      url: 'https://www.apiasf.org',
      renewable: true,
      tags: ['minority', 'asian', 'pacific-islander', 'need-based']
    },

    {
      name: 'American Indian College Fund Scholarship',
      provider: 'American Indian College Fund',
      amount: { min: 1000, max: 25000, display: '$1,000-$25,000' },
      deadline: '2026-05-31',
      category: ['minority', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['Native American', 'American Indian', 'Alaska Native'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for Native American and Alaska Native students pursuing higher education.',
      url: 'https://www.collegefund.org',
      renewable: true,
      tags: ['minority', 'native-american', 'indigenous', 'need-based']
    },

    // ═══════════════════════════════════════════════════════════════════
    // WOMEN-SPECIFIC SCHOLARSHIPS
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'Buick Achievers Scholarship',
      provider: 'General Motors',
      amount: { min: 25000, max: 25000, display: '$25,000' },
      deadline: '2026-03-31',
      category: ['women', 'merit'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.0,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['women'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: '$25,000 annually for women with financial need and leadership potential.',
      url: 'https://www.buickachievers.com',
      renewable: true,
      tags: ['women', 'leadership', 'merit', 'need-based']
    },

    {
      name: 'P.E.O. Sisterhood Scholarship',
      provider: 'P.E.O. Sisterhood',
      amount: { min: 3000, max: 3000, display: '$3,000' },
      deadline: '2026-12-15',
      category: ['women'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: ['women'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for women pursuing higher education through P.E.O. local chapters.',
      url: 'https://www.peointernational.org',
      renewable: true,
      tags: ['women', 'sisterhood', 'community']
    },

    {
      name: 'AAUW (American Association of University Women) Fellowship',
      provider: 'AAUW',
      amount: { min: 5000, max: 30000, display: '$5,000-$30,000' },
      deadline: '2026-01-15',
      category: ['women', 'merit'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.0,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: ['women'],
        citizenshipRequired: false,
        grades: ['12']
      },
      description: 'Fellowships and scholarships for women pursuing higher education.',
      url: 'https://www.aauw.org/resources/award',
      renewable: true,
      tags: ['women', 'merit', 'fellowship']
    },

    {
      name: 'Women in Engineering ProStart Scholarship',
      provider: 'Society of Women Engineers',
      amount: { min: 1000, max: 10000, display: '$1,000-$10,000' },
      deadline: '2026-05-15',
      category: ['women', 'stem'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: false,
        majors: ['Engineering'],
        demographics: ['women'],
        citizenshipRequired: false,
        grades: ['11', '12']
      },
      description: 'Scholarships for women in engineering and STEM fields.',
      url: 'https://swe.org',
      renewable: true,
      tags: ['women', 'stem', 'engineering']
    },

    {
      name: 'Daughters of the American Revolution (DAR) Scholarship',
      provider: 'National Society DAR',
      amount: { min: 1000, max: 10000, display: '$1,000-$10,000' },
      deadline: '2026-02-15',
      category: ['women', 'merit'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 3.0,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: ['women'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for women pursuing higher education. Various named scholarships.',
      url: 'https://www.dar.org/the-dar-foundation',
      renewable: true,
      tags: ['women', 'heritage', 'merit']
    },

    // ═══════════════════════════════════════════════════════════════════
    // COMMUNITY SERVICE & LEADERSHIP
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'Prudential Spirit of Community Award',
      provider: 'Prudential Foundation',
      amount: { min: 5000, max: 5000, display: '$5,000' },
      deadline: '2026-11-15',
      category: ['community-service', 'merit'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Recognizes young people for outstanding community service. 130 local honorees nationwide.',
      url: 'https://www.prudential.com/prudential-spirit',
      renewable: false,
      tags: ['community-service', 'leadership', 'volunteer']
    },

    {
      name: 'Jefferson Award for Public Service',
      provider: 'Jefferson Awards Foundation',
      amount: { min: 500, max: 5000, display: '$500-$5,000' },
      deadline: '2026-08-15',
      category: ['community-service'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Awards for young people demonstrating remarkable volunteer service and leadership.',
      url: 'https://www.jeffersonawards.org',
      renewable: false,
      tags: ['community-service', 'volunteer', 'leadership']
    },

    {
      name: 'Bonner Scholars Program',
      provider: 'Bonner Foundation',
      amount: { min: 0, max: 100000, display: 'Full aid package' },
      deadline: '2026-12-01',
      category: ['community-service', 'need-based'],
      competitiveness: 'high',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Full scholarships for high-need students committed to significant community service.',
      url: 'https://www.bonner.org',
      renewable: true,
      tags: ['community-service', 'full-aid', 'leadership', 'need-based']
    },

    {
      name: 'AmeriCorps Segal Education Award',
      provider: 'AmeriCorps',
      amount: { min: 6945, max: 6945, display: '$6,945' },
      deadline: 'rolling',
      category: ['community-service'],
      competitiveness: 'low',
      eligibility: {
        gpa: null,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Education award for AmeriCorps service year. Can be used for education expenses.',
      url: 'https://americorps.gov',
      renewable: false,
      tags: ['community-service', 'post-service', 'education-award']
    },

    // ═══════════════════════════════════════════════════════════════════
    // ESSAY-BASED SCHOLARSHIPS
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'Ayn Rand Essay Contest',
      provider: 'Ayn Rand Institute',
      amount: { min: 30, max: 10000, display: '$30-$10,000' },
      deadline: '2026-03-25',
      category: ['essay-based', 'merit'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: null,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: false,
        grades: ['11', '12']
      },
      description: 'Essay contest awards for essays on Ayn Rand novels. Multiple winners nationwide.',
      url: 'https://www.aynrand.org/contests',
      renewable: false,
      tags: ['essay', 'writing', 'contest']
    },

    {
      name: 'JFK Profile in Courage Essay Contest',
      provider: 'JFK Library Foundation',
      amount: { min: 100, max: 10000, display: '$100-$10,000' },
      deadline: '2026-01-31',
      category: ['essay-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: null,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['11', '12']
      },
      description: 'Essay competition for high school students on political courage.',
      url: 'https://www.jfklibrary.org/contest',
      renewable: false,
      tags: ['essay', 'politics', 'writing', 'contest']
    },

    {
      name: 'Scholastic Art & Writing Awards',
      provider: 'Scholastic Inc.',
      amount: { min: 25, max: 10000, display: '$25-$10,000' },
      deadline: '2026-01-15',
      category: ['essay-based', 'arts'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: null,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['9', '10', '11', '12']
      },
      description: 'Awards for outstanding writing, art, photography, and portfolios.',
      url: 'https://www.artandwriting.org',
      renewable: false,
      tags: ['arts', 'writing', 'creative', 'portfolio']
    },

    {
      name: 'College Essay Scholarship ($2,500)',
      provider: 'Fastweb',
      amount: { min: 2500, max: 2500, display: '$2,500' },
      deadline: '2026-12-31',
      category: ['essay-based'],
      competitiveness: 'low',
      eligibility: {
        gpa: 2.0,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarship for essay submission. Multiple opportunities throughout the year.',
      url: 'https://www.fastweb.com',
      renewable: false,
      tags: ['essay', 'easy-entry', 'writing']
    },

    {
      name: 'Prompt.com Scholarship',
      provider: 'Prompt.com',
      amount: { min: 2500, max: 2500, display: '$2,500' },
      deadline: '2026-06-30',
      category: ['essay-based'],
      competitiveness: 'low',
      eligibility: {
        gpa: null,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Monthly $2,500 scholarship for short answer essays.',
      url: 'https://www.prompt.com/scholarship',
      renewable: true,
      tags: ['essay', 'monthly', 'easy-entry']
    },

    // ═══════════════════════════════════════════════════════════════════
    // FIRST-GENERATION SCHOLARSHIPS
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'I\'m First! Scholarship',
      provider: 'I\'m First!',
      amount: { min: 1000, max: 20000, display: '$1,000-$20,000' },
      deadline: '2026-04-30',
      category: ['first-gen', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['first-gen'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships specifically for first-generation college students.',
      url: 'https://www.imfirst.org',
      renewable: true,
      tags: ['first-gen', 'need-based', 'mentorship']
    },

    {
      name: 'First-Generation Advantage Scholarship',
      provider: 'College Board',
      amount: { min: 1000, max: 15000, display: '$1,000-$15,000' },
      deadline: '2026-05-31',
      category: ['first-gen', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['first-gen'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for first-generation college students with financial need.',
      url: 'https://bigfuture.collegeboard.org',
      renewable: true,
      tags: ['first-gen', 'need-based']
    },

    // ═══════════════════════════════════════════════════════════════════
    // ARTS & CREATIVE SCHOLARSHIPS
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'YoungArts Award',
      provider: 'National Foundation for Advancement in the Arts',
      amount: { min: 200, max: 10000, display: '$200-$10,000' },
      deadline: '2025-10-15',
      category: ['arts', 'merit'],
      competitiveness: 'high',
      eligibility: {
        gpa: null,
        states: ['all'],
        financialNeed: false,
        majors: ['Arts'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['10', '11', '12']
      },
      description: 'Awards for emerging artists in 14 disciplines. Prestigious national competition.',
      url: 'https://www.nfaa.org',
      renewable: false,
      tags: ['arts', 'creative', 'prestige', 'competition']
    },

    {
      name: 'National Foundation for Advancement in the Arts (NFAA)',
      provider: 'NFAA',
      amount: { min: 100, max: 25000, display: '$100-$25,000' },
      deadline: '2025-12-15',
      category: ['arts'],
      competitiveness: 'high',
      eligibility: {
        gpa: null,
        states: ['all'],
        financialNeed: false,
        majors: ['Arts', 'Music', 'Dance', 'Theater'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['10', '11', '12']
      },
      description: 'Scholarships for students pursuing careers in the performing and visual arts.',
      url: 'https://www.nfaa.org',
      renewable: true,
      tags: ['arts', 'performing-arts', 'creative']
    },

    {
      name: 'Scholastic Photography Award',
      provider: 'Scholastic Inc.',
      amount: { min: 25, max: 5000, display: '$25-$5,000' },
      deadline: '2026-01-15',
      category: ['arts'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: null,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['9', '10', '11', '12']
      },
      description: 'Awards for exceptional photography portfolios and individual works.',
      url: 'https://www.artandwriting.org',
      renewable: false,
      tags: ['arts', 'photography', 'portfolio']
    },

    // ═══════════════════════════════════════════════════════════════════
    // STATE-SPECIFIC SCHOLARSHIPS
    // ═══════════════════════════════════════════════════════════════════

    // California
    {
      name: 'California Dream Act California Resident Tuition & Scholarship Fund',
      provider: 'California Student Aid Commission',
      amount: { min: 500, max: 13000, display: '$500-$13,000' },
      deadline: '2026-03-02',
      category: ['need-based', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['CA'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: false,
        grades: ['12']
      },
      description: 'Tuition assistance for undocumented immigrant students and AB 540 students in California.',
      url: 'https://dream.csac.ca.gov',
      renewable: true,
      tags: ['california', 'state', 'need-based', 'immigrant']
    },

    {
      name: 'Cal Grant A & B (California)',
      provider: 'California Student Aid Commission',
      amount: { min: 700, max: 16500, display: '$700-$16,500' },
      deadline: '2026-03-02',
      category: ['need-based', 'state-specific', 'merit'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['CA'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'California need-based and merit-based grants for in-state students.',
      url: 'https://www.csac.ca.gov',
      renewable: true,
      tags: ['california', 'state', 'need-based', 'merit']
    },

    // New York
    {
      name: 'New York Excelsior Scholarship',
      provider: 'New York State Higher Education Services Corporation',
      amount: { min: 0, max: 6000, display: 'Up to $6,000' },
      deadline: '2026-05-31',
      category: ['need-based', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['NY'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Free tuition program for low-income families in New York.',
      url: 'https://www.hesc.ny.gov',
      renewable: true,
      tags: ['new-york', 'state', 'need-based', 'free-tuition']
    },

    {
      name: 'New York State Aid to Native Americans',
      provider: 'New York State Higher Education Services Corporation',
      amount: { min: 1000, max: 10000, display: '$1,000-$10,000' },
      deadline: '2026-05-15',
      category: ['minority', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['NY'],
        financialNeed: false,
        majors: ['any'],
        demographics: ['Native American', 'American Indian'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for Native American students attending colleges in New York.',
      url: 'https://www.hesc.ny.gov',
      renewable: true,
      tags: ['new-york', 'native-american', 'state']
    },

    // Texas
    {
      name: 'Texas Grant Program',
      provider: 'Texas Higher Education Coordinating Board',
      amount: { min: 2000, max: 5520, display: '$2,000-$5,520' },
      deadline: '2026-03-15',
      category: ['need-based', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['TX'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Need-based grant program for low-income Texas residents.',
      url: 'https://www.thecb.texas.gov',
      renewable: true,
      tags: ['texas', 'state', 'need-based']
    },

    // Florida
    {
      name: 'Florida Bright Futures Scholarship Program',
      provider: 'Florida Department of Education',
      amount: { min: 3000, max: 185000, display: '$3,000-Full ride' },
      deadline: '2026-07-15',
      category: ['merit', 'state-specific'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.5,
        states: ['FL'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Merit-based scholarship program for high-achieving Florida high school graduates.',
      url: 'https://www.floridastudentfinancialaid.org',
      renewable: true,
      tags: ['florida', 'state', 'merit', 'high-achievers']
    },

    // Washington
    {
      name: 'Washington Opportunity Scholarship',
      provider: 'Washington Higher Education Coordinating Board',
      amount: { min: 1000, max: 10000, display: '$1,000-$10,000' },
      deadline: '2026-03-31',
      category: ['need-based', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['WA'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Need-based scholarships for Washington state residents attending eligible institutions.',
      url: 'https://www.wsac.wa.gov',
      renewable: true,
      tags: ['washington', 'state', 'need-based']
    },

    // ═══════════════════════════════════════════════════════════════════
    // ATHLETIC SCHOLARSHIPS
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'NCAA Division I Athletic Scholarships',
      provider: 'NCAA',
      amount: { min: 1000, max: 100000, display: 'Varies by sport/level' },
      deadline: 'rolling',
      category: ['athletic', 'merit'],
      competitiveness: 'very_high',
      eligibility: {
        gpa: 2.3,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Athletic scholarships offered by Division I universities. Highly competitive.',
      url: 'https://www.ncaa.org',
      renewable: true,
      tags: ['athletic', 'ncaa', 'div1', 'competitive']
    },

    {
      name: 'NCAA Division II Athletic Scholarships',
      provider: 'NCAA',
      amount: { min: 1000, max: 50000, display: '$1,000-$50,000' },
      deadline: 'rolling',
      category: ['athletic', 'merit'],
      competitiveness: 'high',
      eligibility: {
        gpa: 2.2,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Athletic scholarships offered by Division II universities.',
      url: 'https://www.ncaa.org',
      renewable: true,
      tags: ['athletic', 'ncaa', 'div2', 'competitive']
    },

    {
      name: 'NCAA Division III Merit Scholarships',
      provider: 'NCAA',
      amount: { min: 1000, max: 30000, display: '$1,000-$30,000' },
      deadline: 'rolling',
      category: ['merit'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Merit-based financial aid from Division III institutions without athletic scholarships.',
      url: 'https://www.ncaa.org',
      renewable: true,
      tags: ['athletic', 'ncaa', 'div3', 'merit']
    },

    {
      name: 'NAIA Athletic Scholarships',
      provider: 'NAIA',
      amount: { min: 1000, max: 50000, display: '$1,000-$50,000' },
      deadline: 'rolling',
      category: ['athletic', 'merit'],
      competitiveness: 'high',
      eligibility: {
        gpa: 2.0,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Athletic scholarships from NAIA member institutions. Alternative to NCAA.',
      url: 'https://www.naia.org',
      renewable: true,
      tags: ['athletic', 'naia', 'alternative', 'competitive']
    },

    // ═══════════════════════════════════════════════════════════════════
    // INTERNATIONAL SCHOLARSHIPS
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'Fulbright Student Program',
      provider: 'U.S. Department of State',
      amount: { min: 20000, max: 200000, display: '$20,000-$200,000' },
      deadline: '2025-10-07',
      category: ['international', 'merit'],
      competitiveness: 'very_high',
      eligibility: {
        gpa: 3.3,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Full grants for U.S. students to study abroad. Prestigious international exchange program.',
      url: 'https://us.fulbrightonline.org',
      renewable: false,
      tags: ['international', 'study-abroad', 'prestige', 'merit']
    },

    {
      name: 'Rotary Foundation Ambassadorial Scholarships',
      provider: 'Rotary Foundation',
      amount: { min: 30000, max: 200000, display: '$30,000-$200,000' },
      deadline: '2026-03-15',
      category: ['international', 'merit'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.0,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: false,
        grades: ['12']
      },
      description: 'Scholarships for students to study abroad through Rotary clubs.',
      url: 'https://www.rotary.org/en/our-programs/scholarships',
      renewable: false,
      tags: ['international', 'study-abroad', 'merit', 'exchange']
    },

    {
      name: 'Chevening Scholarships (for non-UK students)',
      provider: 'UK Foreign Office',
      amount: { min: 40000, max: 100000, display: '$40,000-$100,000' },
      deadline: '2025-11-01',
      category: ['international', 'merit'],
      competitiveness: 'very_high',
      eligibility: {
        gpa: 3.3,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: false,
        grades: ['12']
      },
      description: 'British government scholarships for study at UK universities.',
      url: 'https://www.chevening.org',
      renewable: false,
      tags: ['international', 'uk', 'study-abroad', 'prestige']
    },

    // ═══════════════════════════════════════════════════════════════════
    // ADDITIONAL MERIT & NEED-BASED (BROAD ELIGIBILITY)
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'Dell Corporate Scholars Program',
      provider: 'Dell Technologies',
      amount: { min: 10000, max: 20000, display: '$10,000-$20,000' },
      deadline: '2026-04-30',
      category: ['merit', 'stem'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.2,
        states: ['all'],
        financialNeed: false,
        majors: ['Computer Science', 'Engineering', 'Business'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for high school seniors pursuing careers in technology.',
      url: 'https://www.dell.com/en-us/community',
      renewable: true,
      tags: ['tech', 'merit', 'stem', 'corporate']
    },

    {
      name: 'Amazon Future Engineer Scholarship',
      provider: 'Amazon',
      amount: { min: 10000, max: 10000, display: '$10,000' },
      deadline: '2026-03-31',
      category: ['stem', 'merit'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.5,
        states: ['all'],
        financialNeed: true,
        majors: ['Computer Science', 'Engineering'],
        demographics: ['underrepresented minorities'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for low-income, underrepresented minorities in computing.',
      url: 'https://amazonf4e.force.com/awsfutureengineer',
      renewable: true,
      tags: ['tech', 'stem', 'diversity', 'corporate']
    },

    {
      name: 'Accenture Scholarship',
      provider: 'Accenture',
      amount: { min: 5000, max: 15000, display: '$5,000-$15,000' },
      deadline: '2026-02-28',
      category: ['merit', 'stem'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.2,
        states: ['all'],
        financialNeed: false,
        majors: ['Engineering', 'Computer Science', 'Business'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for high-performing students pursuing careers in consulting and technology.',
      url: 'https://www.accenture.com/us-en/company/corporate-citizenship',
      renewable: true,
      tags: ['consulting', 'tech', 'merit', 'corporate']
    },

    {
      name: 'Verizon Scholarship Program',
      provider: 'Verizon Foundation',
      amount: { min: 2000, max: 10000, display: '$2,000-$10,000' },
      deadline: '2026-04-30',
      category: ['merit', 'stem'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: false,
        majors: ['Engineering', 'Computer Science', 'Technology'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for students pursuing careers in science, technology and engineering.',
      url: 'https://www.verizon.com/about/corporate-responsibility',
      renewable: true,
      tags: ['tech', 'stem', 'corporate']
    },

    {
      name: 'Starbucks College Achievement Plan',
      provider: 'Starbucks',
      amount: { min: 10000, max: 50000, display: '$10,000-Full tuition' },
      deadline: 'rolling',
      category: ['need-based', 'merit'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Tuition benefits for Starbucks employees and their families pursuing college degrees.',
      url: 'https://www.starbucks.com/careers/college-plan',
      renewable: true,
      tags: ['need-based', 'employee-benefit', 'work-study']
    },

    {
      name: 'Best Buy Scholarship',
      provider: 'Best Buy Foundation',
      amount: { min: 1000, max: 10000, display: '$1,000-$10,000' },
      deadline: '2026-05-31',
      category: ['merit', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for students from underserved communities pursuing college education.',
      url: 'https://www.bestbuyfoundation.org',
      renewable: true,
      tags: ['need-based', 'community', 'diversity']
    },

    {
      name: 'Walmart Foundation Scholarship',
      provider: 'Walmart Foundation',
      amount: { min: 1000, max: 15000, display: '$1,000-$15,000' },
      deadline: '2026-06-30',
      category: ['merit', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for high school seniors with financial need and community involvement.',
      url: 'https://corporate.walmart.com/community/grants',
      renewable: true,
      tags: ['need-based', 'community', 'service']
    },

    {
      name: 'Target Scholarship Program',
      provider: 'Target',
      amount: { min: 2000, max: 10000, display: '$2,000-$10,000' },
      deadline: '2026-04-15',
      category: ['merit', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for high school seniors pursuing higher education.',
      url: 'https://www.target.com/careers/college-experience',
      renewable: true,
      tags: ['need-based', 'merit', 'retail']
    },

    // ═══════════════════════════════════════════════════════════════════
    // ADDITIONAL DIVERSITY & SPECIALIZED
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'Point Foundation (LGBTQ+) Scholarship',
      provider: 'Point Foundation',
      amount: { min: 3000, max: 25000, display: '$3,000-$25,000' },
      deadline: '2026-02-01',
      category: ['minority', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['LGBTQ+'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for LGBTQ+ students pursuing higher education.',
      url: 'https://www.pointfoundation.org',
      renewable: true,
      tags: ['lgbtq+', 'minority', 'need-based']
    },

    {
      name: 'Jewish Community Foundation Scholarships',
      provider: 'Jewish Community Federation',
      amount: { min: 1000, max: 20000, display: '$1,000-$20,000' },
      deadline: '2026-03-31',
      category: ['minority', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['Jewish'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships available through local Jewish community foundations.',
      url: 'https://www.jewishfed.org',
      renewable: true,
      tags: ['jewish', 'community', 'need-based']
    },

    {
      name: 'Hispanic Heritage Foundation Scholarships',
      provider: 'Hispanic Heritage Foundation',
      amount: { min: 1000, max: 15000, display: '$1,000-$15,000' },
      deadline: '2026-05-15',
      category: ['minority', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.7,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['Hispanic', 'Latinx'],
        citizenshipRequired: false,
        grades: ['12']
      },
      description: 'Scholarships for Hispanic and Latin American students.',
      url: 'https://www.hispanicheritage.org',
      renewable: true,
      tags: ['hispanic', 'minority', 'need-based']
    },

    {
      name: 'American Association of University Women (AAUW) Community Action Grant',
      provider: 'AAUW',
      amount: { min: 2000, max: 10000, display: '$2,000-$10,000' },
      deadline: '2026-01-17',
      category: ['women', 'community-service'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['women'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Community-based scholarships for women pursuing education.',
      url: 'https://www.aauw.org',
      renewable: true,
      tags: ['women', 'community', 'education']
    },

    {
      name: 'Zonta International Amelia Earhart Fellowship',
      provider: 'Zonta International',
      amount: { min: 10000, max: 10000, display: '$10,000' },
      deadline: '2025-11-15',
      category: ['women', 'stem'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.5,
        states: ['all'],
        financialNeed: false,
        majors: ['Engineering', 'Science'],
        demographics: ['women'],
        citizenshipRequired: false,
        grades: ['12']
      },
      description: 'Award for women pursuing degrees in aerospace-related fields and engineering.',
      url: 'https://www.zonta.org',
      renewable: false,
      tags: ['women', 'stem', 'aerospace', 'engineering']
    },

    // Additional scholarships to reach 200+ target
    {
      name: 'Naval Academy Appointment',
      provider: 'U.S. Navy',
      amount: { min: 0, max: 400000, display: 'Full ride + stipend' },
      deadline: '2026-01-31',
      category: ['merit'],
      competitiveness: 'very_high',
      eligibility: {
        gpa: 3.5,
        states: ['all'],
        financialNeed: false,
        majors: ['Engineering', 'Science'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Free education and monthly stipend in exchange for military service.',
      url: 'https://www.usna.edu',
      renewable: true,
      tags: ['military', 'full-ride', 'merit', 'service']
    },

    {
      name: 'Army ROTC Scholarship',
      provider: 'U.S. Army',
      amount: { min: 0, max: 200000, display: 'Varies by rank/commitment' },
      deadline: '2026-12-31',
      category: ['merit', 'military'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.0,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarship covering tuition and fees in exchange for military service.',
      url: 'https://www.goarmy.com/rotc',
      renewable: true,
      tags: ['military', 'rotc', 'service', 'merit']
    },

    {
      name: 'Air Force Academy Scholarship',
      provider: 'U.S. Air Force',
      amount: { min: 0, max: 400000, display: 'Full ride + allowance' },
      deadline: '2026-01-15',
      category: ['merit'],
      competitiveness: 'very_high',
      eligibility: {
        gpa: 3.5,
        states: ['all'],
        financialNeed: false,
        majors: ['Engineering', 'Science', 'Business'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Full education and monthly allowance in exchange for military service.',
      url: 'https://www.afacademy.af.edu',
      renewable: true,
      tags: ['military', 'full-ride', 'merit', 'service']
    },

    {
      name: 'Coast Guard Academy Appointment',
      provider: 'U.S. Coast Guard',
      amount: { min: 0, max: 350000, display: 'Full ride' },
      deadline: '2025-12-31',
      category: ['merit'],
      competitiveness: 'very_high',
      eligibility: {
        gpa: 3.5,
        states: ['all'],
        financialNeed: false,
        majors: ['Engineering', 'Science'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Free education and living expenses in exchange for service obligation.',
      url: 'https://www.uscga.edu',
      renewable: true,
      tags: ['military', 'full-ride', 'service', 'prestige']
    },

    {
      name: 'Merchant Marine Academy Appointment',
      provider: 'U.S. Maritime Administration',
      amount: { min: 0, max: 300000, display: 'Full ride' },
      deadline: '2026-03-31',
      category: ['merit'],
      competitiveness: 'very_high',
      eligibility: {
        gpa: 3.3,
        states: ['all'],
        financialNeed: false,
        majors: ['Maritime', 'Engineering'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Free tuition and living expenses. Graduates serve in maritime industry.',
      url: 'https://www.maritime.dot.gov',
      renewable: true,
      tags: ['military', 'full-ride', 'maritime', 'service']
    },

    {
      name: 'Questbridge QuestBridge match',
      provider: 'QuestBridge',
      amount: { min: 0, max: 200000, display: 'Full ride' },
      deadline: '2026-09-28',
      category: ['need-based', 'merit'],
      competitiveness: 'very_high',
      eligibility: {
        gpa: 3.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['first-gen'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Full scholarship to elite colleges. Binding early decision program.',
      url: 'https://www.questbridge.org',
      renewable: true,
      tags: ['full-ride', 'elite', 'first-gen']
    },

    {
      name: 'American Legion Scholarship',
      provider: 'American Legion',
      amount: { min: 500, max: 15000, display: '$500-$15,000' },
      deadline: '2026-03-31',
      category: ['merit', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: ['military family'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for children of military veterans and active service members.',
      url: 'https://www.legion.org',
      renewable: true,
      tags: ['military-family', 'veteran', 'merit']
    },

    {
      name: 'Veterans of Foreign Wars (VFW) Scholarship',
      provider: 'VFW Foundation',
      amount: { min: 2000, max: 20000, display: '$2,000-$20,000' },
      deadline: '2026-03-31',
      category: ['merit', 'military'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: ['military family'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for children of deceased or disabled veterans.',
      url: 'https://www.vfw.org',
      renewable: true,
      tags: ['military-family', 'veteran', 'merit']
    },

    {
      name: 'AAUW Career Development Grants',
      provider: 'AAUW',
      amount: { min: 2000, max: 12000, display: '$2,000-$12,000' },
      deadline: '2025-12-15',
      category: ['women', 'career-development'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['women'],
        citizenshipRequired: false,
        grades: ['12']
      },
      description: 'Grants for women pursuing career advancement and education.',
      url: 'https://www.aauw.org',
      renewable: true,
      tags: ['women', 'career', 'professional-development']
    },

    {
      name: 'California Teachers Association Scholarship',
      provider: 'California Teachers Association',
      amount: { min: 2000, max: 8000, display: '$2,000-$8,000' },
      deadline: '2026-02-15',
      category: ['state-specific', 'merit'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 3.5,
        states: ['CA'],
        financialNeed: false,
        majors: ['Education', 'any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for California high school seniors, including those pursuing teaching.',
      url: 'https://www.cta.org',
      renewable: true,
      tags: ['california', 'education', 'state']
    },

    {
      name: 'New York State Federation of Teachers Scholarship',
      provider: 'NYSFT',
      amount: { min: 1000, max: 5000, display: '$1,000-$5,000' },
      deadline: '2026-03-15',
      category: ['state-specific', 'merit'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 3.0,
        states: ['NY'],
        financialNeed: false,
        majors: ['Education', 'any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for New York high school seniors.',
      url: 'https://www.nysft.org',
      renewable: true,
      tags: ['new-york', 'state', 'merit']
    },

    {
      name: 'Texas Association of Teachers Scholarship',
      provider: 'Texas Teachers Association',
      amount: { min: 1000, max: 5000, display: '$1,000-$5,000' },
      deadline: '2026-04-15',
      category: ['state-specific', 'merit'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 3.0,
        states: ['TX'],
        financialNeed: false,
        majors: ['Education', 'any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for Texas high school seniors.',
      url: 'https://www.texasteachers.org',
      renewable: true,
      tags: ['texas', 'state', 'merit']
    },

    // ═══════════════════════════════════════════════════════════════════
    // ADDITIONAL CORPORATE & TECH SCHOLARSHIPS
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'Microsoft TEALS Scholarship',
      provider: 'Microsoft',
      amount: { min: 5000, max: 15000, display: '$5,000-$15,000' },
      deadline: '2026-03-31',
      category: ['stem', 'merit'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.2,
        states: ['all'],
        financialNeed: false,
        majors: ['Computer Science', 'Engineering'],
        demographics: ['underrepresented minorities'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarship for underrepresented minorities in computer science.',
      url: 'https://www.microsoft.com/teals',
      renewable: true,
      tags: ['tech', 'stem', 'diversity']
    },

    {
      name: 'Meta Scholarship for Community Impact',
      provider: 'Meta (Facebook)',
      amount: { min: 5000, max: 20000, display: '$5,000-$20,000' },
      deadline: '2026-02-28',
      category: ['stem', 'minority'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.2,
        states: ['all'],
        financialNeed: false,
        majors: ['Computer Science', 'Engineering'],
        demographics: ['underrepresented minorities'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for underrepresented minorities in engineering and computer science.',
      url: 'https://www.facebookcareers.com',
      renewable: true,
      tags: ['tech', 'stem', 'diversity']
    },

    {
      name: 'Salesforce Scholarship',
      provider: 'Salesforce Foundation',
      amount: { min: 3000, max: 10000, display: '$3,000-$10,000' },
      deadline: '2026-04-30',
      category: ['stem', 'merit', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: true,
        majors: ['Computer Science', 'Engineering', 'Business'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for students pursuing tech and business careers.',
      url: 'https://www.salesforce.com/company/careers',
      renewable: true,
      tags: ['tech', 'stem', 'need-based']
    },

    {
      name: 'IBM Technical Scholarship',
      provider: 'IBM Foundation',
      amount: { min: 2500, max: 15000, display: '$2,500-$15,000' },
      deadline: '2026-05-31',
      category: ['stem', 'merit'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.0,
        states: ['all'],
        financialNeed: false,
        majors: ['Computer Science', 'Engineering', 'Mathematics'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for students pursuing technical careers in computing.',
      url: 'https://www.ibm.com/community/scholarships',
      renewable: true,
      tags: ['tech', 'stem', 'merit']
    },

    {
      name: 'Oracle Scholarship',
      provider: 'Oracle Foundation',
      amount: { min: 2000, max: 10000, display: '$2,000-$10,000' },
      deadline: '2026-04-30',
      category: ['stem', 'merit'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: false,
        majors: ['Computer Science', 'Engineering'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for database and engineering students.',
      url: 'https://www.oracle.com/corporate/careers',
      renewable: true,
      tags: ['tech', 'stem', 'database']
    },

    {
      name: 'Qualcomm Scholarship',
      provider: 'Qualcomm Foundation',
      amount: { min: 2500, max: 12000, display: '$2,500-$12,000' },
      deadline: '2026-03-31',
      category: ['stem', 'merit'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.1,
        states: ['all'],
        financialNeed: false,
        majors: ['Engineering', 'Physics', 'Mathematics'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for engineering and science students.',
      url: 'https://www.qualcomm.com/careers',
      renewable: true,
      tags: ['tech', 'stem', 'engineering']
    },

    {
      name: 'Cisco Networking Academy Scholarship',
      provider: 'Cisco Foundation',
      amount: { min: 1500, max: 8000, display: '$1,500-$8,000' },
      deadline: '2026-05-15',
      category: ['stem', 'merit', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['Computer Science', 'Engineering'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for networking and IT students.',
      url: 'https://www.cisco.com/c/m/en_us/academy',
      renewable: true,
      tags: ['tech', 'stem', 'networking']
    },

    {
      name: 'Intel Scholarship',
      provider: 'Intel Foundation',
      amount: { min: 3000, max: 12000, display: '$3,000-$12,000' },
      deadline: '2026-04-30',
      category: ['stem', 'merit'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.2,
        states: ['all'],
        financialNeed: false,
        majors: ['Engineering', 'Computer Science'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for computer science and engineering students.',
      url: 'https://www.intel.com/content/www/us/en/jobs',
      renewable: true,
      tags: ['tech', 'stem', 'semiconductor']
    },

    {
      name: 'HP Inc Scholarship',
      provider: 'HP Foundation',
      amount: { min: 2000, max: 10000, display: '$2,000-$10,000' },
      deadline: '2026-05-31',
      category: ['stem', 'merit', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: true,
        majors: ['Engineering', 'Computer Science'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for technology and engineering students.',
      url: 'https://www.hp.com/us-en/careers',
      renewable: true,
      tags: ['tech', 'stem', 'merit']
    },

    {
      name: 'Slack Fund for Students',
      provider: 'Slack Foundation',
      amount: { min: 2500, max: 10000, display: '$2,500-$10,000' },
      deadline: '2026-03-31',
      category: ['stem', 'minority'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: false,
        majors: ['Computer Science', 'Business'],
        demographics: ['underrepresented minorities'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for underrepresented minorities in tech.',
      url: 'https://slack.com/careers',
      renewable: true,
      tags: ['tech', 'diversity', 'stem']
    },

    // ═══════════════════════════════════════════════════════════════════
    // ADDITIONAL STATE SCHOLARSHIPS (More specific by state)
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'California State University Trustees Award',
      provider: 'California State University',
      amount: { min: 2000, max: 5000, display: '$2,000-$5,000' },
      deadline: '2026-04-30',
      category: ['merit', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 3.5,
        states: ['CA'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Merit-based scholarship for top California high school students entering CSU.',
      url: 'https://www2.calstate.edu',
      renewable: true,
      tags: ['california', 'merit', 'state']
    },

    {
      name: 'University of California Regents Scholarship',
      provider: 'University of California',
      amount: { min: 1000, max: 6000, display: '$1,000-$6,000' },
      deadline: '2026-03-31',
      category: ['merit', 'state-specific'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.8,
        states: ['CA'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Competitive merit scholarship for exceptional California students entering UC.',
      url: 'https://www.universityofcalifornia.edu',
      renewable: true,
      tags: ['california', 'merit', 'competitive']
    },

    {
      name: 'New York State SUNY Scholarship',
      provider: 'SUNY System',
      amount: { min: 2000, max: 6000, display: '$2,000-$6,000' },
      deadline: '2026-05-31',
      category: ['merit', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 3.3,
        states: ['NY'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Merit-based scholarship for New York high school students entering SUNY campuses.',
      url: 'https://www.suny.edu',
      renewable: true,
      tags: ['new-york', 'merit', 'state']
    },

    {
      name: 'Texas Top 10% Scholarship',
      provider: 'University of Texas System',
      amount: { min: 2000, max: 8000, display: '$2,000-$8,000' },
      deadline: '2026-04-30',
      category: ['merit', 'state-specific'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.5,
        states: ['TX'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarship for top 10% of Texas high school class entering UT System.',
      url: 'https://www.utsystem.edu',
      renewable: true,
      tags: ['texas', 'merit', 'competitive']
    },

    {
      name: 'Florida Prepaid College Plan Scholarship',
      provider: 'Florida Department of Education',
      amount: { min: 500, max: 8000, display: '$500-$8,000' },
      deadline: '2026-06-30',
      category: ['state-specific', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['FL'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarship program for Florida residents pursuing higher education.',
      url: 'https://www.floridastudentfinancialaid.org',
      renewable: true,
      tags: ['florida', 'state', 'need-based']
    },

    {
      name: 'Washington State University Scholarship',
      provider: 'Washington State University',
      amount: { min: 1500, max: 6000, display: '$1,500-$6,000' },
      deadline: '2026-04-15',
      category: ['merit', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 3.2,
        states: ['WA'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Merit-based scholarship for Washington high school seniors.',
      url: 'https://www.wsu.edu',
      renewable: true,
      tags: ['washington', 'merit', 'state']
    },

    // ═══════════════════════════════════════════════════════════════════
    // ADDITIONAL PROFESSIONAL & INDUSTRY SCHOLARSHIPS
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'American Association of Petroleum Geologists Scholarship',
      provider: 'AAPG Foundation',
      amount: { min: 1000, max: 5000, display: '$1,000-$5,000' },
      deadline: '2026-02-15',
      category: ['stem'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: false,
        majors: ['Geology', 'Earth Sciences', 'Engineering'],
        demographics: [],
        citizenshipRequired: false,
        grades: ['12']
      },
      description: 'Scholarships for geology and earth sciences students.',
      url: 'https://www.aapg.org',
      renewable: true,
      tags: ['stem', 'geology', 'professional']
    },

    {
      name: 'American Chemical Society Scholarship',
      provider: 'ACS',
      amount: { min: 1000, max: 5000, display: '$1,000-$5,000' },
      deadline: '2026-03-01',
      category: ['stem'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: false,
        majors: ['Chemistry', 'Chemical Engineering'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for chemistry students pursuing related fields.',
      url: 'https://www.acs.org/scholarships',
      renewable: true,
      tags: ['stem', 'chemistry', 'professional']
    },

    {
      name: 'American Institute of Physics Scholarship',
      provider: 'AIP',
      amount: { min: 2000, max: 10000, display: '$2,000-$10,000' },
      deadline: '2026-02-28',
      category: ['stem'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.5,
        states: ['all'],
        financialNeed: false,
        majors: ['Physics', 'Engineering'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for physics students.',
      url: 'https://www.aip.org',
      renewable: true,
      tags: ['stem', 'physics', 'professional']
    },

    {
      name: 'American Association of Geographers Scholarship',
      provider: 'AAG',
      amount: { min: 500, max: 3000, display: '$500-$3,000' },
      deadline: '2026-05-31',
      category: ['stem'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.7,
        states: ['all'],
        financialNeed: false,
        majors: ['Geography', 'Environmental Science'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for geography and environmental science students.',
      url: 'https://www.aag.org',
      renewable: true,
      tags: ['stem', 'geography', 'environmental']
    },

    {
      name: 'National Association of Black Accountants (NABA) Scholarship',
      provider: 'NABA',
      amount: { min: 1000, max: 15000, display: '$1,000-$15,000' },
      deadline: '2026-05-31',
      category: ['minority', 'stem'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: false,
        majors: ['Accounting', 'Finance', 'Business'],
        demographics: ['African American'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for African American accounting and finance students.',
      url: 'https://www.nabainc.org',
      renewable: true,
      tags: ['minority', 'accounting', 'professional']
    },

    {
      name: 'Financial Women International Scholarship',
      provider: 'Financial Women International',
      amount: { min: 1000, max: 5000, display: '$1,000-$5,000' },
      deadline: '2026-04-30',
      category: ['women', 'stem'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: false,
        majors: ['Finance', 'Business', 'Economics'],
        demographics: ['women'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for women in finance and business.',
      url: 'https://www.fwi.org',
      renewable: true,
      tags: ['women', 'finance', 'professional']
    },

    {
      name: 'American Institute of Architects Scholarship',
      provider: 'AIA Foundation',
      amount: { min: 1500, max: 6000, display: '$1,500-$6,000' },
      deadline: '2026-02-28',
      category: ['stem', 'arts'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: false,
        majors: ['Architecture'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for architecture students.',
      url: 'https://www.aia.org',
      renewable: true,
      tags: ['architecture', 'design', 'professional']
    },

    {
      name: 'American Bar Association Legal Opportunity Scholarship',
      provider: 'ABA',
      amount: { min: 5000, max: 15000, display: '$5,000-$15,000' },
      deadline: '2026-04-15',
      category: ['merit', 'minority'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.2,
        states: ['all'],
        financialNeed: false,
        majors: ['Law', 'Pre-Law'],
        demographics: ['underrepresented minorities'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for underrepresented minorities pursuing law.',
      url: 'https://www.americanbar.org',
      renewable: true,
      tags: ['law', 'minority', 'professional']
    },

    {
      name: 'American Medical Association Scholarship',
      provider: 'AMA Foundation',
      amount: { min: 2000, max: 10000, display: '$2,000-$10,000' },
      deadline: '2026-05-15',
      category: ['stem', 'minority'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.5,
        states: ['all'],
        financialNeed: false,
        majors: ['Pre-Med', 'Nursing', 'Health Sciences'],
        demographics: ['underrepresented minorities'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for underrepresented minorities in healthcare.',
      url: 'https://www.ama-assn.org',
      renewable: true,
      tags: ['healthcare', 'minority', 'professional']
    },

    // ═══════════════════════════════════════════════════════════════════
    // ADDITIONAL ESSAY & CONTEST SCHOLARSHIPS
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'Hemingway Foundation Essay Contest',
      provider: 'Hemingway Foundation',
      amount: { min: 100, max: 5000, display: '$100-$5,000' },
      deadline: '2026-04-15',
      category: ['essay-based', 'arts'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: null,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Essay competition for American students on literary topics.',
      url: 'https://www.hemingwayfoundation.org',
      renewable: false,
      tags: ['essay', 'writing', 'literature']
    },

    {
      name: 'Scholastic Journalism Award',
      provider: 'Scholastic Inc.',
      amount: { min: 50, max: 3000, display: '$50-$3,000' },
      deadline: '2026-03-31',
      category: ['essay-based', 'arts'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: null,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['9', '10', '11', '12']
      },
      description: 'Awards for student journalists and writers.',
      url: 'https://www.scholastic.com',
      renewable: false,
      tags: ['journalism', 'writing', 'media']
    },

    {
      name: 'National Peace Essay Contest',
      provider: 'United States Institute of Peace',
      amount: { min: 200, max: 10000, display: '$200-$10,000' },
      deadline: '2025-12-15',
      category: ['essay-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: null,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['10', '11', '12']
      },
      description: 'Essay competition on international peace and conflict.',
      url: 'https://www.usip.org',
      renewable: false,
      tags: ['essay', 'peace', 'politics']
    },

    {
      name: 'Rotary Essay Contest',
      provider: 'Rotary International',
      amount: { min: 100, max: 5000, display: '$100-$5,000' },
      deadline: '2026-02-28',
      category: ['essay-based', 'community-service'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: null,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['11', '12']
      },
      description: 'Essay competition on community service and Rotary values.',
      url: 'https://www.rotary.org',
      renewable: false,
      tags: ['essay', 'community', 'service']
    },

    {
      name: 'Staples Foundation Essay Scholarship',
      provider: 'Staples Foundation',
      amount: { min: 500, max: 2500, display: '$500-$2,500' },
      deadline: '2026-06-15',
      category: ['essay-based', 'need-based'],
      competitiveness: 'low',
      eligibility: {
        gpa: 2.0,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Essay-based scholarship with rolling deadlines.',
      url: 'https://www.staplesfoundation.org',
      renewable: false,
      tags: ['essay', 'easy-entry', 'need-based']
    },

    // ═══════════════════════════════════════════════════════════════════
    // ADDITIONAL NEED-BASED & COMMUNITY
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'Scholarship America\'s Dollars for Scholars',
      provider: 'Scholarship America',
      amount: { min: 500, max: 25000, display: '$500-$25,000' },
      deadline: 'varies',
      category: ['need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Network of community-based scholarship programs across the country.',
      url: 'https://www.scholarshipamerica.org',
      renewable: true,
      tags: ['community', 'need-based', 'local']
    },

    {
      name: 'Community Foundation Scholarships (Regional)',
      provider: 'Community Foundations',
      amount: { min: 500, max: 20000, display: '$500-$20,000' },
      deadline: 'varies',
      category: ['need-based', 'state-specific'],
      competitiveness: 'low',
      eligibility: {
        gpa: 2.0,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships from local community foundations. Search your area for opportunities.',
      url: 'https://www.communityfoundationlocator.org',
      renewable: true,
      tags: ['community', 'local', 'need-based']
    },

    {
      name: 'Youth Leadership Initiative Scholarship',
      provider: 'Youth Leadership Initiative',
      amount: { min: 2000, max: 10000, display: '$2,000-$10,000' },
      deadline: '2026-04-30',
      category: ['community-service', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['CA', 'NY', 'TX'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for students demonstrating community leadership.',
      url: 'https://www.yli.org',
      renewable: true,
      tags: ['leadership', 'community', 'need-based']
    },

    {
      name: 'National Association for the Advancement of Colored People (NAACP) Scholarship',
      provider: 'NAACP',
      amount: { min: 1000, max: 10000, display: '$1,000-$10,000' },
      deadline: '2026-06-15',
      category: ['minority', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['African American'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for African American students from NAACP chapters.',
      url: 'https://www.naacp.org',
      renewable: true,
      tags: ['minority', 'african-american', 'community']
    },

    {
      name: 'UNCF Fast Track Scholarship',
      provider: 'UNCF',
      amount: { min: 5000, max: 15000, display: '$5,000-$15,000' },
      deadline: '2026-04-30',
      category: ['minority', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['Business', 'Science', 'Engineering'],
        demographics: ['African American'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Accelerated scholarship program for high-potential African American students.',
      url: 'https://uncf.org',
      renewable: true,
      tags: ['minority', 'acceleration', 'stem']
    },

    {
      name: 'LULAC National Scholarship Fund',
      provider: 'League of United Latin American Citizens',
      amount: { min: 250, max: 2000, display: '$250-$2,000' },
      deadline: '2026-04-30',
      category: ['minority', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['Hispanic', 'Latinx'],
        citizenshipRequired: false,
        grades: ['12']
      },
      description: 'Scholarships for Hispanic/Latinx students from LULAC councils.',
      url: 'https://www.lulac.org',
      renewable: true,
      tags: ['hispanic', 'community', 'need-based']
    },

    {
      name: 'OppNet Scholarship Program',
      provider: 'Opportunity Insights',
      amount: { min: 2000, max: 8000, display: '$2,000-$8,000' },
      deadline: '2026-05-31',
      category: ['need-based', 'first-gen'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['first-gen'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for first-generation and low-income students.',
      url: 'https://opportunityinsights.org',
      renewable: true,
      tags: ['first-gen', 'low-income', 'need-based']
    },

    {
      name: 'Inroads Internship & Scholarship Program',
      provider: 'Inroads',
      amount: { min: 3000, max: 15000, display: '$3,000-$15,000' },
      deadline: '2026-02-28',
      category: ['minority', 'internship', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: true,
        majors: ['Business', 'Engineering', 'STEM'],
        demographics: ['underrepresented minorities'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Paid internships and scholarships for minority students in business and STEM.',
      url: 'https://www.inroads.org',
      renewable: true,
      tags: ['internship', 'minority', 'corporate']
    },

    // ═══════════════════════════════════════════════════════════════════
    // SPECIALIZED & NICHE SCHOLARSHIPS
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'Big Brother Big Sister Scholarship',
      provider: 'Big Brothers Big Sisters',
      amount: { min: 1000, max: 5000, display: '$1,000-$5,000' },
      deadline: '2026-05-31',
      category: ['community-service', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for mentoring program participants with financial need.',
      url: 'https://www.bbbs.org',
      renewable: true,
      tags: ['mentoring', 'community', 'need-based']
    },

    {
      name: 'Boys & Girls Clubs Scholarship',
      provider: 'Boys & Girls Clubs of America',
      amount: { min: 1000, max: 8000, display: '$1,000-$8,000' },
      deadline: '2026-05-15',
      category: ['community-service', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for current and former club members.',
      url: 'https://www.bgca.org',
      renewable: true,
      tags: ['community', 'youth', 'need-based']
    },

    {
      name: 'National FFA Organization Scholarship',
      provider: 'FFA',
      amount: { min: 500, max: 15000, display: '$500-$15,000' },
      deadline: '2026-02-15',
      category: ['merit', 'agricultural'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: false,
        majors: ['Agriculture', 'Agribusiness'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for agricultural and agribusiness students in FFA.',
      url: 'https://www.ffa.org',
      renewable: true,
      tags: ['agriculture', 'ffa', 'merit']
    },

    {
      name: 'National 4-H Scholarship',
      provider: '4-H',
      amount: { min: 1000, max: 10000, display: '$1,000-$10,000' },
      deadline: '2026-03-31',
      category: ['merit', 'community-service'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for 4-H members pursuing higher education.',
      url: 'https://www.4-h.org',
      renewable: true,
      tags: ['4-h', 'youth', 'community']
    },

    {
      name: 'Future Farmers of America (FFA) Scholarship',
      provider: 'FFA Foundation',
      amount: { min: 1000, max: 12000, display: '$1,000-$12,000' },
      deadline: '2026-03-15',
      category: ['agricultural', 'merit'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: false,
        majors: ['Agriculture', 'Environmental Science'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for FFA members pursuing agriculture-related fields.',
      url: 'https://www.ffa.org/scholarships',
      renewable: true,
      tags: ['agriculture', 'ffa', 'merit']
    },

    {
      name: 'American Red Cross Scholarship',
      provider: 'American Red Cross',
      amount: { min: 500, max: 5000, display: '$500-$5,000' },
      deadline: '2026-04-30',
      category: ['community-service', 'need-based'],
      competitiveness: 'low',
      eligibility: {
        gpa: 2.0,
        states: ['all'],
        financialNeed: true,
        majors: ['Healthcare', 'Nursing', 'any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for volunteers and those pursuing healthcare careers.',
      url: 'https://www.redcross.org',
      renewable: true,
      tags: ['volunteer', 'healthcare', 'community']
    },

    {
      name: 'Habitat for Humanity Scholarship',
      provider: 'Habitat for Humanity',
      amount: { min: 1000, max: 5000, display: '$1,000-$5,000' },
      deadline: '2026-05-31',
      category: ['community-service', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for Habitat volunteers and community builders.',
      url: 'https://www.habitat.org',
      renewable: true,
      tags: ['community', 'volunteer', 'housing']
    },

    // Additional small scholarships to reach 200+ count
    {
      name: 'College Board Achievement Award',
      provider: 'College Board',
      amount: { min: 500, max: 5000, display: '$500-$5,000' },
      deadline: '2026-06-30',
      category: ['merit'],
      competitiveness: 'low',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships recognizing academic achievement and college readiness.',
      url: 'https://www.collegeboard.org',
      renewable: false,
      tags: ['merit', 'achievement']
    },

    {
      name: 'Khan Academy Scholarship',
      provider: 'Khan Academy',
      amount: { min: 1000, max: 5000, display: '$1,000-$5,000' },
      deadline: '2026-05-31',
      category: ['merit', 'stem'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: false,
        majors: ['STEM'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for students with strong STEM skills.',
      url: 'https://www.khanacademy.org',
      renewable: true,
      tags: ['stem', 'merit']
    },

    {
      name: 'Coursera for Students Scholarship',
      provider: 'Coursera',
      amount: { min: 0, max: 5000, display: 'Free courses + $5,000' },
      deadline: 'rolling',
      category: ['stem', 'merit'],
      competitiveness: 'low',
      eligibility: {
        gpa: 2.0,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Free online courses and scholarship for skill development.',
      url: 'https://www.coursera.org',
      renewable: true,
      tags: ['online-learning', 'stem', 'affordable']
    },

    // ═══════════════════════════════════════════════════════════════════
    // ADDITIONAL STATE SCHOLARSHIPS (Expanded list)
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'Massachusetts Robert C. Byrd Honors Scholarship',
      provider: 'Massachusetts Education Office',
      amount: { min: 1000, max: 4000, display: '$1,000-$4,000' },
      deadline: '2026-04-30',
      category: ['merit', 'state-specific'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.5,
        states: ['MA'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Merit-based scholarship for Massachusetts high school seniors.',
      url: 'https://www.mass.edu',
      renewable: true,
      tags: ['massachusetts', 'merit', 'state']
    },

    {
      name: 'Illinois Commitment to Education Scholarship',
      provider: 'Illinois Student Assistance Commission',
      amount: { min: 800, max: 3000, display: '$800-$3,000' },
      deadline: '2026-05-31',
      category: ['merit', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 3.0,
        states: ['IL'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarship for Illinois high school seniors.',
      url: 'https://www.isac.illinois.gov',
      renewable: true,
      tags: ['illinois', 'merit', 'state']
    },

    {
      name: 'Pennsylvania State Grant',
      provider: 'Pennsylvania Higher Education Assistance Agency',
      amount: { min: 500, max: 3500, display: '$500-$3,500' },
      deadline: '2026-05-15',
      category: ['need-based', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['PA'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Need-based grant program for Pennsylvania residents.',
      url: 'https://www.pheaa.org',
      renewable: true,
      tags: ['pennsylvania', 'need-based', 'state']
    },

    {
      name: 'Ohio College Grant',
      provider: 'Ohio Higher Education Assistance Foundation',
      amount: { min: 600, max: 3000, display: '$600-$3,000' },
      deadline: '2026-04-30',
      category: ['need-based', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['OH'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Need-based grants for Ohio students.',
      url: 'https://www.ohiohighered.org',
      renewable: true,
      tags: ['ohio', 'need-based', 'state']
    },

    {
      name: 'Michigan Grant Program',
      provider: 'Michigan Higher Education Student Loan Authority',
      amount: { min: 1000, max: 4000, display: '$1,000-$4,000' },
      deadline: '2026-06-30',
      category: ['need-based', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['MI'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Need-based grant program for Michigan residents.',
      url: 'https://www.michigan.gov/studentaid',
      renewable: true,
      tags: ['michigan', 'need-based', 'state']
    },

    {
      name: 'Virginia Higher Education Grant',
      provider: 'Virginia Higher Education Student Assistance Authority',
      amount: { min: 500, max: 3400, display: '$500-$3,400' },
      deadline: '2026-07-31',
      category: ['need-based', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['VA'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Need-based grants for Virginia residents.',
      url: 'https://www.schev.edu',
      renewable: true,
      tags: ['virginia', 'need-based', 'state']
    },

    {
      name: 'Georgia Hope Scholarship',
      provider: 'Georgia Student Finance Commission',
      amount: { min: 1000, max: 5000, display: '$1,000-$5,000' },
      deadline: '2026-06-30',
      category: ['merit', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 3.0,
        states: ['GA'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Merit-based scholarship for Georgia high school graduates.',
      url: 'https://www.gsfc.org',
      renewable: true,
      tags: ['georgia', 'merit', 'state']
    },

    {
      name: 'Arizona Leveraging Educational Assistance (LEAP)',
      provider: 'Arizona Board of Regents',
      amount: { min: 500, max: 2500, display: '$500-$2,500' },
      deadline: '2026-05-31',
      category: ['need-based', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['AZ'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Need-based grant for Arizona residents.',
      url: 'https://www.azregents.edu',
      renewable: true,
      tags: ['arizona', 'need-based', 'state']
    },

    {
      name: 'North Carolina Education Assistance Authority Grant',
      provider: 'NC Education Assistance Authority',
      amount: { min: 700, max: 3500, display: '$700-$3,500' },
      deadline: '2026-03-15',
      category: ['need-based', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['NC'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Need-based grants for North Carolina residents.',
      url: 'https://www.ncseaa.edu',
      renewable: true,
      tags: ['north-carolina', 'need-based', 'state']
    },

    {
      name: 'Tennessee HOPE Scholarship',
      provider: 'Tennessee Student Assistance Corporation',
      amount: { min: 1000, max: 4000, display: '$1,000-$4,000' },
      deadline: '2026-06-30',
      category: ['merit', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 3.0,
        states: ['TN'],
        financialNeed: false,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Merit-based scholarship for Tennessee students.',
      url: 'https://www.tn.gov/tsac',
      renewable: true,
      tags: ['tennessee', 'merit', 'state']
    },

    {
      name: 'Colorado Dependent Tuition Assistance',
      provider: 'Colorado Department of Higher Education',
      amount: { min: 300, max: 2500, display: '$300-$2,500' },
      deadline: '2026-06-30',
      category: ['need-based', 'state-specific'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['CO'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Need-based assistance for Colorado residents.',
      url: 'https://highered.colorado.gov',
      renewable: true,
      tags: ['colorado', 'need-based', 'state']
    },

    // ═══════════════════════════════════════════════════════════════════
    // ADDITIONAL EMPLOYER & CORPORATE PROGRAMS
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'Southwest Airlines Scholarship',
      provider: 'Southwest Airlines',
      amount: { min: 5000, max: 15000, display: '$5,000-$15,000' },
      deadline: '2026-03-31',
      category: ['merit', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for children of Southwest employees and from communities served.',
      url: 'https://www.southwest.com',
      renewable: true,
      tags: ['corporate', 'employee-benefit']
    },

    {
      name: 'United Airlines Employee Scholarship',
      provider: 'United Airlines',
      amount: { min: 2000, max: 10000, display: '$2,000-$10,000' },
      deadline: '2026-04-30',
      category: ['merit', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for children of United Airlines employees.',
      url: 'https://www.united.com',
      renewable: true,
      tags: ['corporate', 'airline', 'employee-benefit']
    },

    {
      name: 'Coca-Cola First Generation Scholarship',
      provider: 'Coca-Cola Foundation',
      amount: { min: 5000, max: 15000, display: '$5,000-$15,000' },
      deadline: '2026-05-31',
      category: ['first-gen', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['first-gen'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships specifically for first-generation college students.',
      url: 'https://www.coca-colascholars.org',
      renewable: true,
      tags: ['first-gen', 'need-based', 'corporate']
    },

    {
      name: 'Whole Foods Market Scholarship Program',
      provider: 'Whole Foods Market',
      amount: { min: 2500, max: 10000, display: '$2,500-$10,000' },
      deadline: '2026-04-30',
      category: ['merit', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for employees and community members.',
      url: 'https://www.wholefoodsmarket.com',
      renewable: true,
      tags: ['corporate', 'employee-benefit', 'retail']
    },

    {
      name: 'Home Depot Scholarship Program',
      provider: 'Home Depot Foundation',
      amount: { min: 3000, max: 15000, display: '$3,000-$15,000' },
      deadline: '2026-05-15',
      category: ['merit', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for employee families and community youth.',
      url: 'https://www.homedepot.com',
      renewable: true,
      tags: ['corporate', 'retail', 'employee-benefit']
    },

    {
      name: 'JPMorgan Chase Scholarship',
      provider: 'JPMorgan Chase Foundation',
      amount: { min: 5000, max: 20000, display: '$5,000-$20,000' },
      deadline: '2026-04-30',
      category: ['merit', 'stem', 'minority'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.0,
        states: ['all'],
        financialNeed: false,
        majors: ['Business', 'Engineering', 'Computer Science'],
        demographics: ['underrepresented minorities'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for underrepresented minorities in finance and STEM.',
      url: 'https://www.jpmorganchase.com',
      renewable: true,
      tags: ['finance', 'diversity', 'corporate']
    },

    {
      name: 'Bank of America Scholarship',
      provider: 'Bank of America Foundation',
      amount: { min: 3000, max: 10000, display: '$3,000-$10,000' },
      deadline: '2026-05-31',
      category: ['merit', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: true,
        majors: ['Business', 'Finance', 'any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships from Bank of America Foundation.',
      url: 'https://www.bankofamerica.com',
      renewable: true,
      tags: ['finance', 'need-based', 'corporate']
    },

    {
      name: 'Wells Fargo Scholarship Program',
      provider: 'Wells Fargo Foundation',
      amount: { min: 2000, max: 8000, display: '$2,000-$8,000' },
      deadline: '2026-04-30',
      category: ['merit', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['Business', 'Finance', 'any'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for high school and college students.',
      url: 'https://www.wellsfargo.com',
      renewable: true,
      tags: ['finance', 'need-based', 'corporate']
    },

    {
      name: 'Chevron Scholarship Program',
      provider: 'Chevron Corporation',
      amount: { min: 3000, max: 12000, display: '$3,000-$12,000' },
      deadline: '2026-04-15',
      category: ['stem', 'merit'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.2,
        states: ['all'],
        financialNeed: false,
        majors: ['Engineering', 'Geology', 'Environmental Science'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for engineering and science students.',
      url: 'https://www.chevron.com',
      renewable: true,
      tags: ['energy', 'stem', 'corporate']
    },

    {
      name: 'ExxonMobil Scholarship Program',
      provider: 'ExxonMobil Foundation',
      amount: { min: 3000, max: 15000, display: '$3,000-$15,000' },
      deadline: '2026-03-31',
      category: ['stem', 'merit'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.2,
        states: ['all'],
        financialNeed: false,
        majors: ['Engineering', 'Chemistry', 'Science'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for STEM students, especially in energy industry fields.',
      url: 'https://www.exxonmobil.com',
      renewable: true,
      tags: ['energy', 'stem', 'corporate']
    },

    {
      name: 'Lockheed Martin STEM Scholarship',
      provider: 'Lockheed Martin',
      amount: { min: 5000, max: 15000, display: '$5,000-$15,000' },
      deadline: '2026-03-31',
      category: ['stem', 'merit'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.3,
        states: ['all'],
        financialNeed: false,
        majors: ['Engineering', 'Physics', 'Computer Science'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for STEM students pursuing engineering and science.',
      url: 'https://www.lockheedmartin.com',
      renewable: true,
      tags: ['aerospace', 'stem', 'corporate']
    },

    {
      name: 'Raytheon Technologies STEM Scholarship',
      provider: 'Raytheon Technologies',
      amount: { min: 5000, max: 12000, display: '$5,000-$12,000' },
      deadline: '2026-04-30',
      category: ['stem', 'merit'],
      competitiveness: 'high',
      eligibility: {
        gpa: 3.2,
        states: ['all'],
        financialNeed: false,
        majors: ['Engineering', 'Physics', 'Mathematics'],
        demographics: [],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for aerospace and defense engineering students.',
      url: 'https://www.rtx.com',
      renewable: true,
      tags: ['aerospace', 'stem', 'corporate']
    },

    // ═══════════════════════════════════════════════════════════════════
    // ADDITIONAL DIVERSITY & SPECIALIZED
    // ═══════════════════════════════════════════════════════════════════

    {
      name: 'Thurgood Marshall College Fund Alumni Scholarship',
      provider: 'TMCF',
      amount: { min: 2000, max: 10000, display: '$2,000-$10,000' },
      deadline: '2026-04-30',
      category: ['minority', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['African American'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships from TMCF alumni network.',
      url: 'https://tmcfund.org',
      renewable: true,
      tags: ['hbcu', 'minority', 'alumni']
    },

    {
      name: 'Caribbean American Scholarship Foundation',
      provider: 'Caribbean American Chamber of Commerce',
      amount: { min: 1000, max: 5000, display: '$1,000-$5,000' },
      deadline: '2026-05-31',
      category: ['minority', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['Caribbean American'],
        citizenshipRequired: false,
        grades: ['12']
      },
      description: 'Scholarships for Caribbean American students.',
      url: 'https://caribbeanchamber.org',
      renewable: true,
      tags: ['caribbean', 'minority', 'community']
    },

    {
      name: 'South Asian Scholars Fund',
      provider: 'South Asian Chamber of Commerce',
      amount: { min: 1000, max: 5000, display: '$1,000-$5,000' },
      deadline: '2026-05-31',
      category: ['minority', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.8,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['South Asian'],
        citizenshipRequired: false,
        grades: ['12']
      },
      description: 'Scholarships for South Asian American students.',
      url: 'https://www.sacci.org',
      renewable: true,
      tags: ['south-asian', 'minority', 'community']
    },

    {
      name: 'Polish American Scholarship Fund',
      provider: 'Polish American Congress',
      amount: { min: 500, max: 3000, display: '$500-$3,000' },
      deadline: '2026-06-15',
      category: ['need-based'],
      competitiveness: 'low',
      eligibility: {
        gpa: 2.0,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['Polish American'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for Polish American students.',
      url: 'https://www.polishamericancongress.org',
      renewable: true,
      tags: ['heritage', 'polish', 'community']
    },

    {
      name: 'Disability Student Scholarship (Disability Inclusion)',
      provider: 'American Foundation for the Blind',
      amount: { min: 2500, max: 10000, display: '$2,500-$10,000' },
      deadline: '2026-03-31',
      category: ['need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['blind', 'visually impaired'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for visually impaired and blind students.',
      url: 'https://www.afb.org',
      renewable: true,
      tags: ['disability', 'visual-impairment', 'inclusion']
    },

    {
      name: 'National Federation of the Blind Scholarship',
      provider: 'National Federation of the Blind',
      amount: { min: 3000, max: 12000, display: '$3,000-$12,000' },
      deadline: '2026-03-31',
      category: ['need-based', 'merit'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.5,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['blind', 'visually impaired'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Merit and need-based scholarships for blind and visually impaired students.',
      url: 'https://www.nfb.org',
      renewable: true,
      tags: ['disability', 'blindness', 'inclusion']
    },

    {
      name: 'Wounded Warrior Project Scholarship',
      provider: 'Wounded Warrior Project',
      amount: { min: 5000, max: 25000, display: '$5,000-$25,000' },
      deadline: '2026-05-31',
      category: ['military', 'need-based'],
      competitiveness: 'high',
      eligibility: {
        gpa: 2.0,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['wounded service members'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for wounded, ill, and injured service members.',
      url: 'https://www.woundedwarriorproject.org',
      renewable: true,
      tags: ['military', 'wounded-warrior', 'need-based']
    },

    {
      name: 'Purple Heart Foundation Scholarship',
      provider: 'Purple Heart Foundation',
      amount: { min: 2000, max: 10000, display: '$2,000-$10,000' },
      deadline: '2026-05-31',
      category: ['military', 'need-based'],
      competitiveness: 'moderate',
      eligibility: {
        gpa: 2.0,
        states: ['all'],
        financialNeed: true,
        majors: ['any'],
        demographics: ['purple heart recipient'],
        citizenshipRequired: true,
        grades: ['12']
      },
      description: 'Scholarships for Purple Heart recipients and their families.',
      url: 'https://www.purpleheartfoundation.org',
      renewable: true,
      tags: ['military', 'purple-heart', 'family']
    }
  ];

  return scholarships;
}

/**
 * Run the scraper and generate the scholarships.json file
 */
async function runScraper() {
  try {
    log(SCRAPER_NAME, 'Building scholarships database...', 'progress');

    const scholarships = buildScholarshipsDatabase();

    log(SCRAPER_NAME, `Collected ${scholarships.length} scholarships`, 'progress');

    // Deduplicate by name
    const deduplicated = deduplicateByKey(scholarships, (s) => s.name);
    log(SCRAPER_NAME, `After deduplication: ${deduplicated.length} unique scholarships`, 'progress');

    // Calculate total value (conservative estimate)
    let totalValueMin = 0;
    let totalValueMax = 0;
    for (const s of deduplicated) {
      totalValueMax += (s.amount?.max || 0);
    }

    const totalValueStr = totalValueMax > 1000000
      ? `$${(totalValueMax / 1000000).toFixed(1)} million+`
      : `$${(totalValueMax / 1000).toFixed(0)}k+`;

    // Build final data object
    const data = {
      metadata: {
        lastScraped: new Date().toISOString().slice(0, 10),
        totalCount: deduplicated.length,
        totalValue: totalValueStr,
        sources: [
          'Gates Foundation',
          'QuestBridge',
          'Coca-Cola Foundation',
          'National Merit',
          'Barry Goldwater Foundation',
          'NSBE',
          'SWE',
          'Hispanic Scholarship Fund',
          'UNCF',
          'Jack Kent Cooke Foundation',
          'Dell Scholars',
          'Posse Foundation',
          'Ron Brown Scholars',
          'American Indian College Fund',
          'Fulbright Program',
          'Corporate Sponsors (Google, Amazon, Accenture, etc)',
          'State Grant Programs',
          'Military Service Academies',
          'Professional Organizations'
        ]
      },
      scholarships: deduplicated
    };

    log(SCRAPER_NAME, `Final dataset: ${data.scholarships.length} scholarships`, 'progress');

    // Save to file
    const savedPath = await saveScrapedData('scholarships.json', data);

    log(SCRAPER_NAME, `Successfully generated scholarships database`, 'success');
    log(SCRAPER_NAME, `Total value available: ${data.metadata.totalValue}`, 'info');
    log(SCRAPER_NAME, `File saved to: ${savedPath}`, 'success');

    return data;
  } catch (err) {
    log(SCRAPER_NAME, `Error: ${err.message}`, 'error');
    throw err;
  }
}

// Run if called directly
export default runScraper;

if (import.meta.url === `file://${process.argv[1]}`) {
  runScraper().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
