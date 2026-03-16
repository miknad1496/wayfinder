/**
 * College Admissions Data Scraper
 *
 * Fetches admissions profiles for top 60+ universities from the College Scorecard API.
 * Data includes: acceptance rates, test scores, costs, programs, demographics, outcomes.
 *
 * Also includes curated strategic intelligence: less competitive majors, school-within-school
 * acceptance rates, Early Decision advantages, transfer strategies, and application insights.
 *
 * Source: https://api.data.gov/ed/collegescorecard/v1
 * Free API key: https://api.data.gov/signup/
 */

import { fetchJSON, saveScrapedData, sleep } from './utils.js';

const API_BASE = 'https://api.data.gov/ed/collegescorecard/v1';

// Top 100 target universities — Ivy League, top 25, flagship state, top LACs, rising programs
const TARGET_SCHOOLS = [
  // Ivy League (8)
  'Harvard University', 'Yale University', 'Princeton University',
  'Columbia University in the City of New York', 'University of Pennsylvania',
  'Brown University', 'Dartmouth College', 'Cornell University',
  // Top Private (30)
  'Stanford University', 'Massachusetts Institute of Technology',
  'California Institute of Technology', 'Duke University',
  'University of Chicago', 'Northwestern University',
  'Johns Hopkins University', 'Rice University',
  'Vanderbilt University', 'Washington University in St Louis',
  'Emory University', 'Georgetown University',
  'University of Notre Dame', 'Carnegie Mellon University',
  'University of Southern California', 'Tufts University',
  'New York University', 'Boston University', 'Boston College',
  'Wake Forest University', 'Northeastern University',
  'Tulane University of Louisiana', 'Case Western Reserve University',
  'Lehigh University', 'Brandeis University', 'Villanova University',
  'University of Rochester', 'Rensselaer Polytechnic Institute',
  'Santa Clara University', 'George Washington University',
  // Top Public / Flagship State (40)
  'University of California-Berkeley', 'University of California-Los Angeles',
  'University of Michigan-Ann Arbor', 'University of Virginia-Main Campus',
  'University of North Carolina at Chapel Hill', 'Georgia Institute of Technology-Main Campus',
  'University of Texas at Austin', 'University of Florida',
  'University of Wisconsin-Madison', 'University of Illinois Urbana-Champaign',
  'Ohio State University-Main Campus', 'Pennsylvania State University-Main Campus',
  'Purdue University-Main Campus', 'University of Washington-Seattle Campus',
  'University of California-San Diego', 'University of California-Davis',
  'University of California-Irvine', 'University of California-Santa Barbara',
  'University of Maryland-College Park', 'Rutgers University-New Brunswick',
  'University of Georgia', 'University of Minnesota-Twin Cities',
  'Indiana University-Bloomington', 'Michigan State University',
  'Virginia Polytechnic Institute and State University',
  'University of Pittsburgh-Pittsburgh Campus',
  'Texas A & M University-College Station',
  'North Carolina State University at Raleigh',
  'University of Connecticut', 'Clemson University',
  'University of Massachusetts-Amherst', 'University of Colorado Boulder',
  'University of Iowa', 'University of Oregon',
  'Arizona State University-Tempe', 'University of Arizona',
  'Florida State University', 'University of South Carolina-Columbia',
  'University of Alabama', 'Colorado School of Mines',
  // Top Liberal Arts (14)
  'Williams College', 'Amherst College', 'Pomona College',
  'Swarthmore College', 'Wellesley College', 'Bowdoin College',
  'Middlebury College', 'Claremont McKenna College',
  'Carleton College', 'Davidson College',
  'Colgate University', 'Hamilton College',
  'Barnard College', 'Colby College'
];

// Fields to fetch from College Scorecard
const SCHOOL_FIELDS = [
  'school.name',
  'school.city',
  'school.state',
  'school.school_url',
  'school.type',               // 1=public, 2=private nonprofit, 3=private for-profit
  'school.carnegie_basic',
  'latest.admissions.admission_rate.overall',
  'latest.admissions.sat_scores.average.overall',
  'latest.admissions.sat_scores.midpoint.critical_reading',
  'latest.admissions.sat_scores.midpoint.math',
  'latest.admissions.act_scores.midpoint.cumulative',
  'latest.admissions.act_scores.midpoint.english',
  'latest.admissions.act_scores.midpoint.math',
  'latest.student.size',
  'latest.student.enrollment.undergrad_12_month',
  'latest.student.demographics.race_ethnicity.white',
  'latest.student.demographics.race_ethnicity.black',
  'latest.student.demographics.race_ethnicity.hispanic',
  'latest.student.demographics.race_ethnicity.asian',
  'latest.student.retention_rate.four_year.full_time',
  'latest.completion.rate_suppressed.four_yr',
  'latest.cost.tuition.in_state',
  'latest.cost.tuition.out_of_state',
  'latest.cost.avg_net_price.overall',
  'latest.cost.avg_net_price.public',
  'latest.cost.avg_net_price.private',
  'latest.aid.median_debt.completers.overall',
  'latest.aid.pell_grant_rate',
  'latest.earnings.10_yrs_after_entry.median',
  'latest.earnings.6_yrs_after_entry.median'
].join(',');

// ==========================================
// SCORECARD API FETCHING
// ==========================================

async function fetchSchoolData(apiKey) {
  console.log('  Fetching admissions data for target universities...');
  const schools = [];

  // Fetch in batches by name search
  for (const schoolName of TARGET_SCHOOLS) {
    try {
      // Use school name search
      const searchName = schoolName.split('-')[0].trim(); // Simplify hyphenated names
      const url = `${API_BASE}/schools.json?` + new URLSearchParams({
        'api_key': apiKey,
        'school.name': schoolName,
        'fields': SCHOOL_FIELDS,
        'per_page': '5'
      });

      const data = await fetchJSON(url);
      if (data && data.results && data.results.length > 0) {
        const school = data.results[0]; // Best match
        schools.push(parseSchoolRecord(school));
        console.log(`    ✓ ${school['school.name']}`);
      } else {
        console.log(`    ✗ Not found: ${schoolName}`);
      }

      await sleep(300); // Rate limiting
    } catch (err) {
      console.log(`    ✗ Error fetching ${schoolName}: ${err.message}`);
    }
  }

  return schools;
}

function parseSchoolRecord(s) {
  return {
    name: s['school.name'],
    city: s['school.city'],
    state: s['school.state'],
    url: s['school.school_url'],
    type: s['school.type'] === 1 ? 'public' : 'private',
    admissionRate: s['latest.admissions.admission_rate.overall'],
    satAvg: s['latest.admissions.sat_scores.average.overall'],
    satReading: s['latest.admissions.sat_scores.midpoint.critical_reading'],
    satMath: s['latest.admissions.sat_scores.midpoint.math'],
    actAvg: s['latest.admissions.act_scores.midpoint.cumulative'],
    actEnglish: s['latest.admissions.act_scores.midpoint.english'],
    actMath: s['latest.admissions.act_scores.midpoint.math'],
    studentSize: s['latest.student.size'],
    undergradEnrollment: s['latest.student.enrollment.undergrad_12_month'],
    retentionRate: s['latest.student.retention_rate.four_year.full_time'],
    gradRate4yr: s['latest.completion.rate_suppressed.four_yr'],
    tuitionInState: s['latest.cost.tuition.in_state'],
    tuitionOutOfState: s['latest.cost.tuition.out_of_state'],
    avgNetPrice: s['latest.cost.avg_net_price.overall'] || s['latest.cost.avg_net_price.private'] || s['latest.cost.avg_net_price.public'],
    medianDebt: s['latest.aid.median_debt.completers.overall'],
    pellGrantRate: s['latest.aid.pell_grant_rate'],
    earnings10yr: s['latest.earnings.10_yrs_after_entry.median'],
    earnings6yr: s['latest.earnings.6_yrs_after_entry.median'],
    demographics: {
      white: s['latest.student.demographics.race_ethnicity.white'],
      black: s['latest.student.demographics.race_ethnicity.black'],
      hispanic: s['latest.student.demographics.race_ethnicity.hispanic'],
      asian: s['latest.student.demographics.race_ethnicity.asian']
    }
  };
}

// ==========================================
// CURATED STRATEGIC INTELLIGENCE
// ==========================================

function getCuratedAdmissionsIntel() {
  return [
    // ==================== IVY LEAGUE (8) ====================
    {
      school: 'Harvard University',
      acceptanceRate: '3.4%',
      edAdvantage: 'REA (Restrictive Early Action) — ~7.9% acceptance vs 2.6% regular',
      lessCompetitivePaths: 'Classics, Celtic Languages, Folklore & Mythology, Sanskrit, South Asian Studies have smaller applicant pools',
      schoolsWithinSchool: 'All apply to Harvard College (no separate schools for undergrad)',
      transferRate: '<1% transfer acceptance (~12 students/year)',
      financialAid: 'Need-blind admissions, no loans, families <$85K pay nothing. 55% of students receive need-based aid.',
      insiderTip: 'Harvard values intellectual vitality — demonstrate deep passion in one area rather than breadth. Z-list (gap year admission) is a real pathway for borderline admits.',
      essayStrategy: 'Supplemental essay is optional but NEVER skip it. Focus on intellectual curiosity, not achievements.'
    },
    {
      school: 'Yale University',
      acceptanceRate: '3.7%',
      edAdvantage: 'REA — ~9% acceptance vs 2.8% regular',
      lessCompetitivePaths: 'Humanities departments (Classics, East Asian Studies, Ethnicity/Race/Migration) have smaller applicant pools. Yale admits to the college, not a major.',
      schoolsWithinSchool: 'All undergrads admitted to Yale College (no separate schools)',
      transferRate: '<2% transfer acceptance (~25 students/year)',
      financialAid: 'Need-blind, no loans for any student. Families <$75K pay $0. All financial aid is grants.',
      insiderTip: 'Yale puts more weight on extracurricular passion and community involvement than any other Ivy. They want future leaders who care about social impact. Residential college system is central — show you value community.',
      essayStrategy: 'Yale\'s short-answer essays ("Why Yale" + quirky prompts) are critical. Be specific about residential colleges, cultural houses, specific clubs. Show personality, not just achievements.'
    },
    {
      school: 'Princeton University',
      acceptanceRate: '3.5%',
      edAdvantage: 'REA — ~10-12% acceptance vs 2.5% regular. REA is a major advantage at Princeton.',
      lessCompetitivePaths: 'Classics, Comparative Literature, Near Eastern Studies, Slavic Languages have smaller pools. BSE (engineering) slightly higher acceptance than AB (arts).',
      schoolsWithinSchool: 'AB (liberal arts) and BSE (engineering) — BSE slightly higher rate (~5% vs ~3.5%)',
      transferRate: 'Historically 0 transfers accepted. Princeton recently resumed transfer admissions — ~1-2% acceptance.',
      financialAid: 'No loans for anyone. Families <$65K pay $0. One of the most generous aid programs in the nation.',
      insiderTip: 'Princeton values the undergraduate experience more than any Ivy — no grad students teaching. Senior thesis is mandatory. Show intellectual depth and willingness to engage in independent research.',
      essayStrategy: 'Princeton\'s "graded written paper" requirement is unique — submit your best AP/IB paper. The extracurricular and intellectual curiosity essays should show depth, not breadth.'
    },
    {
      school: 'Columbia University',
      acceptanceRate: '3.9%',
      edAdvantage: 'ED — ~10-12% acceptance vs 2.9% regular. ED fills ~45% of the class.',
      lessCompetitivePaths: 'Columbia College and SEAS are only two options. SEAS (engineering) has slightly higher acceptance. General Studies is a separate non-traditional pathway.',
      schoolsWithinSchool: 'Columbia College (~3.5%), SEAS Engineering (~5-6%), School of General Studies (non-traditional, ~25-30%)',
      transferRate: '~5-7% via standard transfer. General Studies has ~25-30% acceptance for non-traditional students.',
      financialAid: 'Need-blind for US citizens. No parental contribution for families <$66K.',
      insiderTip: 'Columbia\'s General Studies is a legitimate pathway for students who took gap years, military, or non-traditional paths. The Core Curriculum is Columbia\'s defining feature — show genuine enthusiasm for it.',
      essayStrategy: 'The "Why Columbia" essay must reference the Core Curriculum and NYC. Be specific about which classes, professors, or research opportunities excite you.'
    },
    {
      school: 'University of Pennsylvania',
      acceptanceRate: '5.4%',
      edAdvantage: 'ED is HUGE at Penn — ~15-18% acceptance vs 4-5% regular. ED fills ~50% of class.',
      lessCompetitivePaths: 'College of Arts & Sciences less competitive than Wharton (5%) or VIPER. Nursing has slightly higher rate. Apply to CAS then internal transfer to Wharton.',
      schoolsWithinSchool: 'Wharton (~5%), Engineering (~9%), Nursing (~11%), Arts & Sciences (~7%) — rates vary significantly.',
      transferRate: '~7-9% transfer acceptance (higher than most Ivies)',
      financialAid: 'Need-blind for US citizens. All-grant program (no loans in packages).',
      insiderTip: 'Penn values "why Penn specifically" — demonstrate knowledge of dual-degree programs, specific professors, research labs. The Huntsman/Vagelos/M&T programs are extremely competitive.',
      essayStrategy: 'The "Why Penn" essay is critical. Reference specific programs, professors, or resources. Cross-school collaboration is a Penn differentiator — mention it.'
    },
    {
      school: 'Brown University',
      acceptanceRate: '5.0%',
      edAdvantage: 'ED — ~14-16% acceptance vs 3.5% regular',
      lessCompetitivePaths: 'Open curriculum means no required courses — all students admitted to the college. Smaller departments like Egyptology, Portuguese, Religious Studies have fewer applicants.',
      schoolsWithinSchool: 'All admitted to Brown (open curriculum). PLME (8-year med program) is extremely selective (~2-3%).',
      transferRate: '~5-8% transfer acceptance',
      financialAid: 'Need-blind for US citizens. Meets 100% of demonstrated need with no loans.',
      insiderTip: 'Brown\'s open curriculum is the defining feature — show you\'re a self-directed learner who thrives without structure. PLME applicants should apply separately. The Brown/RISD dual degree is a unique pathway for creative students.',
      essayStrategy: 'Show intellectual independence. Brown wants students who will design their own education. Reference specific courses from Brown\'s unique offerings and explain WHY the open curriculum appeals to you specifically.'
    },
    {
      school: 'Dartmouth College',
      acceptanceRate: '6.2%',
      edAdvantage: 'ED — ~18-21% acceptance vs 4-5% regular. ED is a very strong advantage.',
      lessCompetitivePaths: 'All admitted to Dartmouth (small college model). Native American Studies, Geography, Italian have smaller pools.',
      schoolsWithinSchool: 'No separate schools — all undergrads in one college. Thayer School of Engineering is accessed via a modified major.',
      transferRate: '~2-3% transfer acceptance',
      financialAid: 'Need-blind, meets 100% need. Families <$65K pay $0.',
      insiderTip: 'Dartmouth values the outdoors, community, and the D-Plan (unique quarter system with off-campus terms). Demonstrate you want a small-school, close-knit experience. Greek life and outdoor culture are central.',
      essayStrategy: 'The "Why Dartmouth" essay should reference the D-Plan, specific off-campus programs, and Dartmouth\'s intimate community. Rural setting is a feature, not a bug — embrace it.'
    },
    {
      school: 'Cornell University',
      acceptanceRate: '8.7%',
      edAdvantage: 'ED — ~17-23% acceptance vs 6-7% regular (biggest ED advantage in Ivy League)',
      lessCompetitivePaths: 'College of Agriculture & Life Sciences (~11%), Industrial & Labor Relations (~11%), Hotel Administration (~18-22%) all significantly higher than Arts & Sciences (~7%)',
      schoolsWithinSchool: 'Arts & Sciences (~7%), Engineering (~9%), CALS (~11%), ILR (~11%), Hotel (~18-22%), Human Ecology (~14%), AAP (~10%)',
      transferRate: '~15-18% transfer acceptance (highest Ivy — especially into CALS and Hotel)',
      financialAid: 'Need-blind for US. Strong aid but some loans in packages.',
      insiderTip: 'Cornell is the most strategic Ivy for admissions. Applying to CALS or Hotel dramatically increases odds. Internal transfers between colleges are possible but competitive. CALS applicants write about ag/environment even if planning to study something else.',
      essayStrategy: 'Each college has its own essay — tailor completely. CALS essay about impact on NY state. Hotel essay about hospitality passion. Do NOT write generic "why Cornell."'
    },

    // ==================== TOP PRIVATE (21) ====================
    {
      school: 'Stanford University',
      acceptanceRate: '3.7%',
      edAdvantage: 'REA — ~9.2% acceptance vs 2.7% regular',
      lessCompetitivePaths: 'Earth Sciences, Linguistics, German Studies, Slavic Languages, Classics',
      schoolsWithinSchool: 'All apply to Stanford undergrad (engineering major declaration sophomore year)',
      transferRate: '<2% transfer acceptance',
      financialAid: 'No tuition for families earning <$100K/year. Free room & board for <$75K.',
      insiderTip: 'Stanford values "intellectual vitality" and quirkiness. Show genuine passion projects over polished resumes. The "roommate essay" is crucial.',
      essayStrategy: 'Short answers matter as much as long essays. Be authentic and specific — admissions reads 20K+ applications.'
    },
    {
      school: 'MIT',
      acceptanceRate: '3.9%',
      edAdvantage: 'EA — ~5.7% acceptance vs 3.2% regular',
      lessCompetitivePaths: 'All majors same difficulty (admitted to MIT, not a department). But declaring Linguistics, Philosophy, or Writing has smaller class sizes.',
      schoolsWithinSchool: 'All undergrads admitted to MIT (choose major end of freshman year)',
      transferRate: '~3-4% transfer acceptance',
      financialAid: 'Need-blind for all (including international). Families <$75K pay nothing.',
      insiderTip: 'MIT wants builders and tinkerers. Competitive math/science olympiad credentials help but aren\'t sufficient — show projects you\'ve built. "Maker" mentality is key.',
      essayStrategy: 'Focus on what you\'ve MADE or BUILT. Describe process, failures, iteration. Be precise and technical where appropriate.'
    },
    {
      school: 'California Institute of Technology',
      acceptanceRate: '3.2%',
      edAdvantage: 'EA — ~6-8% acceptance vs 2.5% regular',
      lessCompetitivePaths: 'All admitted to Caltech (no separate departments for admissions). ~230 students per class — extremely small.',
      schoolsWithinSchool: 'Single admissions process. Choose one of 6 divisions after arriving.',
      transferRate: '<1% transfer acceptance',
      financialAid: 'Need-blind, meets 100% need. Average financial aid package covers most of cost.',
      insiderTip: 'Caltech is the most academically intense school in the nation. Show you LOVE math and science for their own sake. Research experience is almost expected. Only apply if you genuinely want a small, intensely academic STEM environment.',
      essayStrategy: 'Show deep math/science curiosity. Describe research, experiments, or problems you\'ve worked on. Caltech wants to see you think like a scientist.'
    },
    {
      school: 'Duke University',
      acceptanceRate: '5.0%',
      edAdvantage: 'ED — ~16-18% acceptance vs 3-4% regular. ED fills ~50% of class.',
      lessCompetitivePaths: 'Trinity College of Arts & Sciences slightly more accessible than Pratt School of Engineering.',
      schoolsWithinSchool: 'Trinity (Arts & Sciences) ~5.5%, Pratt (Engineering) ~8%',
      transferRate: '~5-6% transfer acceptance',
      financialAid: 'Need-blind for US citizens. Strong financial aid, all-grant for <$60K families.',
      insiderTip: 'Duke ED is one of the strongest advantages in elite admissions. Alumni legacy is significant. Demonstrated interest matters — visit campus, attend info sessions.',
      essayStrategy: '"Why Duke" supplement is crucial. Reference specific programs like DukeEngage, Bass Connections, or Focus programs. Interdisciplinary themes resonate.'
    },
    {
      school: 'University of Chicago',
      acceptanceRate: '5.2%',
      edAdvantage: 'ED I and ED II — combined ~7-10% acceptance vs 3-4% regular. UChicago also has EA.',
      lessCompetitivePaths: 'All admitted to the College (declare major later). Less popular concentrations: Classics, Near Eastern Languages, South Asian Studies.',
      schoolsWithinSchool: 'Single admissions pool. Core curriculum is mandatory for all.',
      transferRate: '~5-8% transfer acceptance',
      financialAid: 'Need-blind. Odyssey program: families <$60K pay $0. No loans in financial aid.',
      insiderTip: 'UChicago\'s "uncommon essay" prompts are legendary — they want intellectual weirdness and genuine curiosity. Students who love learning for its own sake thrive here. The Core is intense.',
      essayStrategy: 'The extended essay is your chance to be intellectually playful. UChicago rewards creative, unconventional thinking. Don\'t play it safe. The "Why UChicago" should reference specific professors and the Core.'
    },
    {
      school: 'Northwestern University',
      acceptanceRate: '7%',
      edAdvantage: 'ED — ~20-25% acceptance vs 4-5% regular. ED is a massive advantage.',
      lessCompetitivePaths: 'Weinberg (Arts & Sciences) more accessible than McCormick (Engineering) or Medill (Journalism ~12%). School of Communication (Theatre/Dance) has different criteria.',
      schoolsWithinSchool: 'Weinberg ~7%, McCormick Engineering ~9%, Medill Journalism ~12%, Communication ~15%',
      transferRate: '~12-15% transfer acceptance',
      financialAid: 'Need-blind, meets 100% need.',
      insiderTip: 'Northwestern ED acceptance rate is roughly 3x the regular rate. Apply ED if Northwestern is your true #1. Medill and McCormick are good "strategic" choices for students on the edge.',
      essayStrategy: '"Why Northwestern" should show genuine school knowledge. Mention the quarter system advantage, specific professors, student organizations.'
    },
    {
      school: 'Johns Hopkins University',
      acceptanceRate: '6.5%',
      edAdvantage: 'ED I and ED II — ~15-18% acceptance vs 4-5% regular',
      lessCompetitivePaths: 'Krieger School of Arts & Sciences more accessible than Whiting School of Engineering. Humanities and social science majors have smaller applicant pools.',
      schoolsWithinSchool: 'Krieger (A&S) ~7%, Whiting (Engineering) ~9%',
      transferRate: '~7-10% transfer acceptance',
      financialAid: 'Need-blind for US citizens. Hopkins Pledge: families <$60K pay $0.',
      insiderTip: 'JHU is the #1 research university by federal R&D spending. Highlight research interest in your application. Pre-med is strong but not the only path — they want diverse interests.',
      essayStrategy: 'Show intellectual depth and research curiosity. Reference specific labs, professors, or research centers. JHU values collaboration across disciplines.'
    },
    {
      school: 'Rice University',
      acceptanceRate: '7.7%',
      edAdvantage: 'ED — ~19-22% acceptance vs 5-6% regular',
      lessCompetitivePaths: 'Humanities and Social Sciences divisions less competitive than Engineering and Natural Sciences.',
      schoolsWithinSchool: 'All admitted to Rice (residential college system). Engineering slightly more competitive.',
      transferRate: '~10-12% transfer acceptance',
      financialAid: 'Rice Investment: families <$75K pay $0 tuition. <$140K pay $0 tuition + room/board. Exceptional value.',
      insiderTip: 'Rice is a best-kept secret for financial aid — the Rice Investment program is among the most generous in the nation. Residential college system means you should mention community in essays.',
      essayStrategy: 'The "Why Rice" and "unconventional" essay are both important. Show personality and quirkiness — Rice culture values it.'
    },
    {
      school: 'Vanderbilt University',
      acceptanceRate: '5.6%',
      edAdvantage: 'ED I and ED II — combined ~18-22% vs 4-5% regular',
      lessCompetitivePaths: 'Peabody College (Education/Human Development) ~13%, slightly more accessible than Arts & Science or Engineering.',
      schoolsWithinSchool: 'Arts & Science ~5%, Engineering ~8%, Peabody ~13%, Blair School of Music (audition-based)',
      transferRate: '~20-25% transfer acceptance',
      financialAid: 'Meets 100% demonstrated need. Opportunity Vanderbilt: no loans in any financial aid package.',
      insiderTip: 'Peabody College is a strategic entry point — Human & Organizational Development (HOD) is popular and opens doors to consulting/business careers while being less competitive to enter than A&S.',
      essayStrategy: 'Show genuine interest in Nashville and Vanderbilt community. The "contribution" essay should be specific about what you\'ll add to campus.'
    },
    {
      school: 'Washington University in St Louis',
      acceptanceRate: '11%',
      edAdvantage: 'ED I and ED II — ~28-32% acceptance vs 8% regular. One of the biggest ED advantages nationally.',
      lessCompetitivePaths: 'Sam Fox School of Design & Visual Arts (~20%), and University College (non-traditional) are less competitive than A&S or Olin Business.',
      schoolsWithinSchool: 'Arts & Sciences ~10%, Olin Business ~12%, McKelvey Engineering ~15%, Sam Fox ~20%',
      transferRate: '~15-20% transfer acceptance',
      financialAid: 'Need-blind. Meets 100% need. WashU Pledge: families <$75K pay $0.',
      insiderTip: 'WashU has one of the largest ED advantages in the country — applying ED roughly triples your odds. Demonstrated interest is heavily tracked (visits, emails, info sessions). Show genuine WashU knowledge.',
      essayStrategy: '"Why WashU" must be ultra-specific. Mention the Danforth campus, specific programs, research opportunities. WashU values collaborative, kind students.'
    },
    {
      school: 'Emory University',
      acceptanceRate: '11%',
      edAdvantage: 'ED I and ED II — ~20-25% acceptance vs 8-9% regular',
      lessCompetitivePaths: 'Oxford College (2-year campus) has ~25-28% acceptance, then guaranteed transfer to Emory main campus for junior/senior years.',
      schoolsWithinSchool: 'Emory College ~10%, Oxford College ~25-28% (then transfer to main campus), Goizueta Business ~15%',
      transferRate: '~20-25% transfer acceptance',
      financialAid: 'Meets 100% need. Emory Advantage: families <$50K pay $0 tuition.',
      insiderTip: 'Oxford College is the BEST strategic entry point — ~25-28% acceptance with guaranteed transfer to Emory main campus. Same Emory degree. Students also report stronger professor relationships at Oxford.',
      essayStrategy: 'For Oxford specifically, show you value a small liberal arts experience. For Emory main, reference the Atlanta location and specific research opportunities.'
    },
    {
      school: 'Georgetown University',
      acceptanceRate: '12%',
      edAdvantage: 'EA — ~14-16% acceptance vs 10% regular. Georgetown uses EA, not ED (non-binding).',
      lessCompetitivePaths: 'School of Nursing & Health Studies (~18-20%) and College of A&S (~14%) more accessible than SFS (Foreign Service ~8%) or McDonough Business (~10%).',
      schoolsWithinSchool: 'SFS (Foreign Service ~8%), McDonough Business (~10%), College A&S (~14%), Nursing (~18-20%)',
      transferRate: '~10-15% transfer acceptance',
      financialAid: 'Need-blind for US. Georgetown Pledge: meets 100% need.',
      insiderTip: 'Georgetown\'s School of Foreign Service is one of the most competitive sub-schools in the country. If interested in policy/international affairs, consider applying to the College instead and taking SFS courses. DC location is a huge asset for internships.',
      essayStrategy: 'Georgetown values community, service, and Jesuit values (cura personalis — care for the whole person). Show intellectual depth and commitment to others.'
    },
    {
      school: 'University of Notre Dame',
      acceptanceRate: '12%',
      edAdvantage: 'EA — ~22-25% acceptance vs 8-10% regular. Legacy and Catholic school background are advantages.',
      lessCompetitivePaths: 'College of Arts & Letters and School of Architecture slightly less competitive than Mendoza Business or Engineering.',
      schoolsWithinSchool: 'Mendoza Business (~10%), Engineering (~12%), A&L (~14%), Science (~14%), Architecture (~16%)',
      transferRate: '~20-25% transfer acceptance',
      financialAid: 'Meets 100% demonstrated need. Strong merit scholarships.',
      insiderTip: 'Notre Dame is one of the few elite schools where religious identity can be an advantage. Catholic school background, community service, and alignment with ND\'s values all help. Legacy is very strong here.',
      essayStrategy: 'Show alignment with Notre Dame\'s values — community, faith, service. Be genuine about why the culture appeals to you. The "Why Notre Dame" should be deeply personal.'
    },
    {
      school: 'Carnegie Mellon University',
      acceptanceRate: '11%',
      edAdvantage: 'ED — ~22-26% acceptance vs 8-9% regular',
      lessCompetitivePaths: 'Dietrich College (Humanities/SS) ~18-20% much more accessible than SCS (Computer Science ~5%) or Drama (~6% audition-based).',
      schoolsWithinSchool: 'SCS (CS ~5%), Drama (~6%), Art (~8%), Engineering (~12%), Tepper Business (~14%), Dietrich H&SS (~18-20%)',
      transferRate: '~8-10% transfer acceptance',
      financialAid: 'Not need-blind. Aid can be limited compared to Ivies. Strong merit scholarships.',
      insiderTip: 'CMU CS is harder to get into than most Ivies (~5%). Dietrich College (H&SS) is much more accessible and you can still take CS courses and minor in CS. Cross-college collaboration is CMU\'s strength.',
      essayStrategy: 'Be specific about WHY your chosen school within CMU. Show interdisciplinary interests — CMU values cross-pollination between arts, tech, and humanities.'
    },
    {
      school: 'University of Southern California',
      acceptanceRate: '12%',
      edAdvantage: 'No ED/EA. USC reviews on a rolling basis — apply early in the cycle for best odds.',
      lessCompetitivePaths: 'Dornsife (Arts & Sciences ~14%) more accessible than Viterbi Engineering (~8-10%) or Marshall Business (~10%). USC Cinematic Arts (~4%) is among the hardest programs nationally.',
      schoolsWithinSchool: 'Cinematic Arts (~4%), Viterbi Eng (~8-10%), Marshall Business (~10%), Dornsife A&S (~14%), Annenberg Comm (~15%)',
      transferRate: '~18-22% transfer acceptance (transfer-friendly for CA community colleges)',
      financialAid: 'Strong merit scholarships (Trustee, Presidential, Deans). Need-based aid meets most demonstrated need.',
      insiderTip: 'USC Film School is one of the most competitive programs in the world (~4%). Troy Camp and other service programs demonstrate USC\'s community values. The alumni network is one of the most powerful in the country.',
      essayStrategy: 'Show passion for USC\'s specific offerings — not just LA. Reference the Trojan Family network, specific programs, and how you\'ll contribute to campus community.'
    },
    {
      school: 'Tufts University',
      acceptanceRate: '10%',
      edAdvantage: 'ED I and ED II — ~28-32% acceptance vs 7-8% regular. One of the biggest ED advantages.',
      lessCompetitivePaths: 'All admitted to Tufts (choose between A&S and Engineering). Engineering slightly less competitive.',
      schoolsWithinSchool: 'A&S and Engineering are the two options. SMFA (School of Museum of Fine Arts) combined degree is less competitive.',
      transferRate: '~10-15% transfer acceptance',
      financialAid: 'Need-blind for US. Meets 100% need.',
      insiderTip: 'Tufts ED gives roughly 3-4x the RD acceptance rate — massive advantage. The school highly values demonstrated interest and "Why Tufts" specificity. International relations and STEM are particularly strong.',
      essayStrategy: 'Tufts\' supplemental essays are quirky and creative. Show personality and intellectual curiosity. The community engagement essay should highlight specific programs at Tufts.'
    },
    {
      school: 'New York University',
      acceptanceRate: '12.2%',
      edAdvantage: 'ED I and ED II — ~25-30% acceptance vs 8% regular',
      lessCompetitivePaths: 'Gallatin School of Individualized Study (~20%), Steinhardt (~18%), Liberal Studies (~25%) are all less competitive than Stern Business (~5-7%) or Tisch Arts (~15%).',
      schoolsWithinSchool: 'Stern Business (~5-7%), Tisch Arts (~15%), CAS (~12%), Tandon Eng (~18%), Gallatin (~20%), Liberal Studies (~25%)',
      transferRate: '~25-30% transfer acceptance (very transfer-friendly)',
      financialAid: 'Not fully need-blind historically. Financial aid has been improving but can leave gaps. Merit scholarships available.',
      insiderTip: 'NYU Stern is harder to get into than most Ivies. Apply to CAS or Gallatin then take Stern courses if interested in business. NYU is very transfer-friendly — the 2+2 community college to CAS pathway works. The global sites (Abu Dhabi, Shanghai) have higher acceptance rates and full financial aid.',
      essayStrategy: '"Why NYU" should reference specific programs AND how you\'ll use NYC. The city is your campus — show you\'ll take advantage of it. For Stern, demonstrate business passion beyond just wanting to make money.'
    },
    {
      school: 'Tulane University',
      acceptanceRate: '13%',
      edAdvantage: 'ED I — ~38-42% acceptance. EA — ~26-30%. ED is a massive advantage at Tulane.',
      lessCompetitivePaths: 'School of Liberal Arts and School of Science & Engineering slightly more accessible than A.B. Freeman School of Business.',
      schoolsWithinSchool: 'Freeman Business (~10%), A&S (~15%), Science & Engineering (~16%)',
      transferRate: '~30-35% transfer acceptance',
      financialAid: 'Strong merit scholarships. Need-based aid meets most need but not always 100%.',
      insiderTip: 'Tulane tracks demonstrated interest HEAVILY. Visit campus, attend virtual sessions, email admissions. ED acceptance rate is roughly 3x RD. Community service is core to Tulane\'s identity.',
      essayStrategy: 'The "Why Tulane" must be hyper-specific — mention New Orleans, service-learning, specific courses. Tulane can tell when you\'re using a generic "why X school" essay.'
    },
    {
      school: 'Northeastern University',
      acceptanceRate: '7%',
      edAdvantage: 'ED I and ED II — ~22-28% acceptance vs 5% regular. EA is also available.',
      lessCompetitivePaths: 'College of Social Sciences & Humanities more accessible than Khoury College of Computer Sciences or D\'Amore-McKim Business.',
      schoolsWithinSchool: 'Khoury CS (~4-5%), D\'Amore-McKim Business (~7%), Engineering (~8%), Social Sciences (~12%)',
      transferRate: '~20-25% transfer acceptance',
      financialAid: 'Not need-blind. Strong merit scholarships including Dean\'s and Excellence awards.',
      insiderTip: 'Northeastern\'s co-op program (6-month paid work experiences) is the main differentiator. Mention specific co-op employers or industries. Demonstrated interest is tracked and matters significantly.',
      essayStrategy: 'Reference the co-op program specifically — which companies, what experiences you want. Show you understand experiential learning and why it appeals to you over traditional models.'
    },
    {
      school: 'Case Western Reserve University',
      acceptanceRate: '30%',
      edAdvantage: 'ED I and ED II — ~50-55% acceptance. EA ~40%. Strong merit scholarships for early applicants.',
      lessCompetitivePaths: 'Arts & Sciences more accessible than Engineering or Pre-Professional Health tracks.',
      schoolsWithinSchool: 'Single admissions but different competitive levels by intended major.',
      transferRate: '~35-40% transfer acceptance',
      financialAid: 'Very generous merit scholarships — many students receive $25K+/year in merit. Need-based aid also available.',
      insiderTip: 'Case Western is a hidden gem for STEM students. Strong pre-med track with University Hospitals and Cleveland Clinic partnerships. Merit scholarships can make CWRU cheaper than state schools.',
      essayStrategy: 'Show why Cleveland and CWRU\'s specific resources appeal to you. Reference research partnerships, the Think Forum, or specific interdisciplinary programs.'
    },

    // ==================== TOP PUBLIC / FLAGSHIP (18) ====================
    {
      school: 'University of California-Berkeley',
      acceptanceRate: '11.4%',
      edAdvantage: 'No ED/EA (UC system). Apply to multiple UCs on one application.',
      lessCompetitivePaths: 'Letters & Science admits to college not major (declare later). Direct admit to Engineering/Haas/Chemistry are most competitive. Environmental Design, Social Welfare less competitive.',
      schoolsWithinSchool: 'EECS (~4-6%), Haas Business (~6%), Letters & Science (~14%), Environmental Design (~18-20%)',
      transferRate: '~22-25% transfer acceptance — UCB is VERY transfer friendly (guaranteed TAG from CA community colleges for some majors)',
      financialAid: 'UC system strong financial aid for CA residents. Blue & Gold plan: families <$80K pay no tuition.',
      insiderTip: 'The transfer pathway from California community college is a genuine strategy. TAG (Transfer Admission Guarantee) exists for some UC campuses. Apply L&S then petition into competitive majors.',
      essayStrategy: 'PIQs (Personal Insight Questions): choose 4 of 8 prompts. Be specific about overcoming adversity and contributing to community. UC readers spend 8-12 minutes per application.'
    },
    {
      school: 'University of California-Los Angeles',
      acceptanceRate: '8.6%',
      edAdvantage: 'No ED/EA (UC system). Rolling holistic review.',
      lessCompetitivePaths: 'Letters & Science (~12%) more accessible than Henry Samueli Engineering (~7-8%) or direct nursing/theater/film/music admits.',
      schoolsWithinSchool: 'Engineering (~7-8%), School of Theater/Film/TV (~4-6% for some programs), L&S (~12%), Nursing (~5-8%)',
      transferRate: '~20-24% transfer acceptance — very transfer-friendly. TAG from CA community colleges.',
      financialAid: 'Blue & Gold: families <$80K pay no tuition. Strong aid for CA residents.',
      insiderTip: 'UCLA is the most applied-to university in America. Film/Theater/Music programs are extremely selective (audition-based). Apply to L&S for best odds. Transfer from community college is a very viable strategy.',
      essayStrategy: 'Same PIQs as all UCs. Show cultural awareness, community involvement, and how you\'ve overcome challenges. UCLA values diversity of experience.'
    },
    {
      school: 'University of Michigan-Ann Arbor',
      acceptanceRate: '18%',
      edAdvantage: 'EA — ~32% acceptance vs ~15% regular. EA is SIGNIFICANT.',
      lessCompetitivePaths: 'LSA (Liberal Arts) more accessible than Ross Business (~8% direct admit) or Engineering (~18%). School of Music and Art & Design also accessible.',
      schoolsWithinSchool: 'Ross Business (~8% direct admit), Engineering (~18%), LSA (~22%), Nursing, Kinesiology, Music — rates vary substantially.',
      transferRate: '~35-40% transfer acceptance',
      financialAid: 'Go Blue Guarantee: families <$65K pay $0 for tuition, fees, housing.',
      insiderTip: 'Ross Business preferred admission is extremely competitive — apply LSA with business intent, then transfer to Ross sophomore year (higher acceptance). Michigan values demonstrated interest.',
      essayStrategy: '"Why Michigan" essay is critical — be school-specific. Mention specific programs, research opportunities, campus culture.'
    },
    {
      school: 'University of Virginia',
      acceptanceRate: '16%',
      edAdvantage: 'ED — ~28-32% acceptance vs 14% regular. Strong ED advantage, especially for out-of-state.',
      lessCompetitivePaths: 'College of Arts & Sciences more accessible than McIntire Commerce (~8% direct) or Engineering (~15%). Curry School of Education also accessible.',
      schoolsWithinSchool: 'McIntire Commerce (~8% direct admit), Engineering (~15%), A&S (~18%), Nursing (~20%)',
      transferRate: '~30-35% transfer acceptance',
      financialAid: 'AccessUVA: families <$60K pay $0. Meets 100% demonstrated need.',
      insiderTip: 'McIntire Commerce is one of the top business programs nationally but extremely hard to get into directly. Apply A&S and transfer to McIntire sophomore year — more students go this route. ED is smart for out-of-state applicants.',
      essayStrategy: 'Show love for UVA\'s traditions — the Honor Code, student self-governance, Lawn living. Reference specific programs and the Charlottesville community.'
    },
    {
      school: 'University of North Carolina at Chapel Hill',
      acceptanceRate: '17%',
      edAdvantage: 'EA — ~36% in-state acceptance vs ~12% out-of-state. In-state advantage is enormous.',
      lessCompetitivePaths: 'General College (all freshmen enter here, declare major later). No direct admit to Kenan-Flagler Business (apply sophomore year).',
      schoolsWithinSchool: 'All freshmen enter General College. Kenan-Flagler Business (~20-25% of internal applicants), Hussman School of Journalism (~30%)',
      transferRate: '~35-40% transfer acceptance',
      financialAid: 'Carolina Covenant: families <$62K pay $0 for tuition, fees, room, board. One of the most generous public school programs.',
      insiderTip: 'UNC is required by NC law to admit 82% in-state students. Out-of-state is ~12% acceptance. The Carolina Covenant is exceptional — fully covers low-income students. Apply to General College, then internal transfer to competitive programs.',
      essayStrategy: 'Show North Carolina connections if applicable. The short-answer essays should demonstrate community involvement, intellectual curiosity, and why UNC\'s specific culture appeals to you.'
    },
    {
      school: 'Georgia Institute of Technology-Main Campus',
      acceptanceRate: '17%',
      edAdvantage: 'EA — ~35-40% acceptance for in-state EA. EA vs RD significant, especially in-state.',
      lessCompetitivePaths: 'Liberal Arts, International Affairs, History/Sociology have higher rates than CS (~8-10%) or Mechanical Engineering (~15%).',
      schoolsWithinSchool: 'Computer Science is by far most competitive (~8-10%). Other engineering ~15-20%. Non-STEM ~25-30%.',
      transferRate: '~30-35% transfer acceptance',
      financialAid: 'HOPE scholarship covers tuition for GA students with 3.0+ GPA. Zell Miller for 3.7+.',
      insiderTip: 'CS at Georgia Tech is harder to get into than most Ivies. Apply for less competitive major then transfer — but GT internal transfers are also competitive for CS. In-state advantage is enormous.',
      essayStrategy: 'Show quantitative/analytical thinking even for non-STEM majors. GT wants problem-solvers.'
    },
    {
      school: 'University of Texas at Austin',
      acceptanceRate: '31%',
      edAdvantage: 'No ED. Texas auto-admission: top 6% of TX high school class guaranteed admission (but NOT to specific major/school).',
      lessCompetitivePaths: 'McCombs Business (~15%) and CS (~6-8%) are extremely competitive. Liberal Arts, Education, Natural Sciences more accessible.',
      schoolsWithinSchool: 'McCombs Business (~15%), Cockrell Engineering (~17%), CS within Natural Sciences (~6-8%), Communications (~20%), Liberal Arts (~40%)',
      transferRate: '~25-30% external transfer acceptance',
      financialAid: 'Strong for TX residents. Texas Advance Commitment: families <$65K pay $0.',
      insiderTip: 'UT CS is one of the hardest programs to enter in the nation (~6-8% direct admit). Apply to less competitive college then try internal transfer, but UT has been tightening these. Auto-admit doesn\'t guarantee your major.',
      essayStrategy: 'Apply A topics show leadership and responsibility. Topic B should be unique personal story. UT values Texas connections and community impact.'
    },
    {
      school: 'University of Florida',
      acceptanceRate: '23%',
      edAdvantage: 'No ED/EA. Rolling notifications. Apply early for best odds.',
      lessCompetitivePaths: 'CLAS (Arts & Sciences ~28%) more accessible than Warrington Business (~15%) or Herbert Wertheim Engineering (~18%).',
      schoolsWithinSchool: 'Warrington Business (~15%), Engineering (~18%), CLAS (~28%), Journalism (~22%)',
      transferRate: '~40-45% transfer acceptance (2+2 pathway with FL state colleges)',
      financialAid: 'Bright Futures covers tuition for FL students with qualifying GPA/test scores. Machen Florida Opportunity: families <$65K pay $0.',
      insiderTip: 'UF has a strong 2+2 program with Florida state colleges — guaranteed admission if you meet requirements. Bright Futures scholarship makes UF essentially free for many FL students. Innovation Academy is a unique spring/summer admit pathway.',
      essayStrategy: 'Show Gator spirit and specific program knowledge. UF values leadership, community service, and Florida connections.'
    },
    {
      school: 'University of Illinois Urbana-Champaign',
      acceptanceRate: '45%',
      edAdvantage: 'EA — priority consideration for early applicants. No ED.',
      lessCompetitivePaths: 'LAS (Liberal Arts & Sciences ~60%) and Education much more accessible than Grainger Engineering (~20%) or Gies Business (~30%). CS within Grainger is ~6-8%.',
      schoolsWithinSchool: 'CS in Grainger (~6-8%), Grainger Eng (~20%), Gies Business (~30%), LAS (~60%)',
      transferRate: '~45-50% transfer acceptance',
      financialAid: 'Illinois Commitment: families <$67K pay $0 tuition. Strong for IL residents.',
      insiderTip: 'UIUC CS is a top-5 program nationally and harder to get into than most Ivies (~6-8%). Apply to CS+X (interdisciplinary CS programs in LAS) for better odds — still access to CS courses. Apply LAS then try internal transfer to Grainger CS (very competitive).',
      essayStrategy: 'For Grainger Engineering/CS, show strong STEM passion and specific projects. For LAS, show intellectual breadth. Mention specific programs, research opportunities, or student organizations.'
    },
    {
      school: 'University of Wisconsin-Madison',
      acceptanceRate: '49%',
      edAdvantage: 'EA — ~60% acceptance. Apply early for best results.',
      lessCompetitivePaths: 'Letters & Science (~55%) more accessible than Engineering (~35%) or Wisconsin School of Business (~25% direct admit).',
      schoolsWithinSchool: 'Business (~25% direct), Engineering (~35%), L&S (~55%), Nursing (~30%)',
      transferRate: '~50-55% transfer acceptance',
      financialAid: 'Bucky\'s Tuition Promise: families <$60K pay $0 tuition for WI residents.',
      insiderTip: 'Apply to L&S then transfer to Business if that\'s your goal — direct admit to Business is competitive. UW-Madison is a massive research university with incredible resources. Strong for pre-med, engineering, and political science.',
      essayStrategy: 'Show intellectual curiosity and how you\'ll take advantage of UW\'s breadth. Mention specific programs, the Wisconsin Idea, or research opportunities.'
    },
    {
      school: 'Purdue University-Main Campus',
      acceptanceRate: '53%',
      edAdvantage: 'EA — ~65% acceptance. Strong advantage for early applicants.',
      lessCompetitivePaths: 'Liberal Arts and Education much more accessible than Engineering (~40%) or CS (~18-22%). Polytechnic Institute also accessible.',
      schoolsWithinSchool: 'CS (~18-22%), Engineering (~40%), Krannert Business (~45%), Liberal Arts (~70%)',
      transferRate: '~50-55% transfer acceptance',
      financialAid: 'Purdue Promise: families <$60K pay $0 for tuition/fees. Frozen tuition since 2012.',
      insiderTip: 'Purdue CS/Engineering is dramatically harder than overall acceptance suggests. Apply to Exploratory Studies or Polytechnic then transfer if you don\'t get direct admit. Purdue has frozen tuition since 2012 — exceptional value.',
      essayStrategy: 'For Engineering/CS, show passion for the specific field and reference Purdue\'s research strengths. Mention the tuition freeze and value proposition as evidence you\'ve done your research.'
    },
    {
      school: 'University of Washington-Seattle Campus',
      acceptanceRate: '48%',
      edAdvantage: 'No ED/EA. Rolling review. Apply early.',
      lessCompetitivePaths: 'Pre-Sciences and pre-major admission are less competitive. Direct admit to CS (~8-10%) and Foster Business (~20%) are extremely competitive.',
      schoolsWithinSchool: 'CS direct admit (~8-10%), Foster Business (~20%), Engineering (~25%), College of A&S (~55%)',
      transferRate: '~50% transfer acceptance',
      financialAid: 'Husky Promise: families <$65K pay $0 for tuition (WA residents).',
      insiderTip: 'UW CS direct admission is among the hardest in the country (~8-10%). Most CS students get in through competitive major application after freshman year — but this is also very competitive. Apply to Informatics or pre-science then try for CS.',
      essayStrategy: 'Short-answer format. Show connection to Pacific Northwest values, intellectual curiosity, and specific UW programs. Mention research opportunities and Seattle\'s tech ecosystem.'
    },
    {
      school: 'Virginia Polytechnic Institute and State University',
      acceptanceRate: '57%',
      edAdvantage: 'ED — ~70-75% acceptance vs 50% regular',
      lessCompetitivePaths: 'Liberal Arts, Agriculture, Natural Resources more accessible than Engineering (~45%) or CS (~30%).',
      schoolsWithinSchool: 'CS (~30%), Engineering (~45%), Pamplin Business (~50%), Liberal Arts (~70%)',
      transferRate: '~60% transfer acceptance',
      financialAid: 'Strong for VA residents. VT Guarantee for low-income families.',
      insiderTip: 'Virginia Tech Engineering is top-tier and much more competitive than the overall rate suggests. CS is also increasingly competitive. The Corps of Cadets is a unique differentiator. Strong agricultural and natural resource programs.',
      essayStrategy: 'Show Hokie spirit. Reference Ut Prosim (That I May Serve) and specific programs. VT values community, service, and hands-on learning.'
    },
    {
      school: 'Texas A & M University-College Station',
      acceptanceRate: '63%',
      edAdvantage: 'No ED/EA. Rolling admissions with priority deadline. Top 10% auto-admit for TX residents.',
      lessCompetitivePaths: 'Liberal Arts and Education much more accessible than Mays Business (~25%) or Engineering (~35%). CS is increasingly competitive.',
      schoolsWithinSchool: 'Mays Business (~25%), Engineering (~35%), CS (~25-30%), Liberal Arts (~75%)',
      transferRate: '~50-55% transfer acceptance',
      financialAid: 'Aggie Assurance: families <$60K pay $0 tuition. Strong for TX residents.',
      insiderTip: 'A&M Engineering is one of the largest in the nation and quality is high. Mays Business is competitive for direct admit. The Aggie Network is one of the most powerful alumni networks nationally. Corps of Cadets provides unique leadership development.',
      essayStrategy: 'Show alignment with Aggie values — selfless service, integrity, respect, excellence. A&M cares deeply about tradition and community. Reference specific programs and the Core Values.'
    },
    {
      school: 'North Carolina State University at Raleigh',
      acceptanceRate: '47%',
      edAdvantage: 'EA — ~55% acceptance. No ED.',
      lessCompetitivePaths: 'Humanities and Social Sciences (~60%) much more accessible than Engineering (~35%) or CS (~20%).',
      schoolsWithinSchool: 'CS (~20%), Engineering (~35%), Poole Management (~40%), CHASS (~60%)',
      transferRate: '~50-55% transfer acceptance',
      financialAid: 'Pack Promise: families <$60K pay $0 tuition (NC residents).',
      insiderTip: 'NC State CS and Engineering are hidden gems — top programs at state school prices. The Research Triangle location provides incredible internship and job opportunities. Strong co-op programs.',
      essayStrategy: 'Reference the Research Triangle, specific labs, and industry partnerships. Show you understand NC State\'s practical, applied approach to education.'
    },

    // ==================== TOP LIBERAL ARTS (6) ====================
    {
      school: 'Williams College',
      acceptanceRate: '9%',
      edAdvantage: 'ED I and ED II — ~30-35% acceptance vs 6% regular. ED fills about 40% of class.',
      lessCompetitivePaths: 'All admitted to Williams (no separate schools). Smaller departments like Classics, Astrophysics, Arabic Studies have fewer applicants.',
      schoolsWithinSchool: 'No separate schools — single admissions pool.',
      transferRate: '~3-5% transfer acceptance (very few spots)',
      financialAid: 'Need-blind, meets 100% need. Families <$75K pay $0.',
      insiderTip: 'Williams ED is extremely powerful — roughly 4-5x the RD rate. The tutorial system (2 students + 1 professor) is unique and should be mentioned. Smallest class sizes of any top college.',
      essayStrategy: 'Show genuine love for learning and intellectual curiosity. Reference the tutorial system, Winter Study term, and specific professors. Williams values students who will contribute to a small, close-knit community.'
    },
    {
      school: 'Amherst College',
      acceptanceRate: '7%',
      edAdvantage: 'ED — ~25-30% acceptance vs 5% regular',
      lessCompetitivePaths: 'Open curriculum (no required courses). All admitted to Amherst. Smaller departments in languages and area studies.',
      schoolsWithinSchool: 'Single admissions pool. Five College Consortium gives access to UMass, Smith, Hampshire, Mt. Holyoke courses.',
      transferRate: '~3-5% transfer acceptance',
      financialAid: 'Need-blind, meets 100% need. No loans in financial aid packages.',
      insiderTip: 'Amherst\'s open curriculum is a major draw — like Brown but at a small LAC. The Five College Consortium effectively gives you access to a university-scale course catalog. ED is a strong advantage.',
      essayStrategy: 'Show intellectual independence and self-direction. Reference the open curriculum and how you\'d design your education. The Five College Consortium is a unique selling point to mention.'
    },
    {
      school: 'Pomona College',
      acceptanceRate: '7%',
      edAdvantage: 'ED I and ED II — ~18-22% acceptance vs 5% regular',
      lessCompetitivePaths: 'All admitted to Pomona. Claremont Consortium gives access to 4 other colleges\' courses. Smaller departments in Classics, Linguistics, Africana Studies.',
      schoolsWithinSchool: 'Single admissions pool. Claremont Consortium: Pomona, CMC, Scripps, Harvey Mudd, Pitzer share courses.',
      transferRate: '~2-4% transfer acceptance',
      financialAid: 'Need-blind, meets 100% need. One of the wealthiest LACs per student.',
      insiderTip: 'Pomona + the Claremont Consortium gives you a LAC experience with university-level resources and course options. Southern California location is underrated for internships and outdoor access. Extremely generous financial aid.',
      essayStrategy: 'Reference the Consortium advantage, specific courses across the 5C schools, and California\'s unique environment. Show why a small school in Southern California is your ideal fit.'
    },
    {
      school: 'Bowdoin College',
      acceptanceRate: '8.5%',
      edAdvantage: 'ED I and ED II — ~25-30% acceptance vs 5-6% regular. ED fills about 45% of class.',
      lessCompetitivePaths: 'All admitted to Bowdoin. Test-optional pioneer — Bowdoin has been test-optional since 1969.',
      schoolsWithinSchool: 'Single admissions pool.',
      transferRate: '~3-5% transfer acceptance',
      financialAid: 'Need-blind, meets 100% need. No loans in financial aid.',
      insiderTip: 'Bowdoin was the original test-optional school (since 1969) — if your scores don\'t reflect your ability, Bowdoin is ideal. ED is very powerful here. The food is famously excellent. Maine location is a draw for outdoors-loving students.',
      essayStrategy: 'Show you value community and the liberal arts. Reference Bowdoin\'s specific offerings and why Maine\'s environment appeals to you. Be authentic and personal.'
    },
    {
      school: 'Swarthmore College',
      acceptanceRate: '7%',
      edAdvantage: 'ED I and ED II — ~22-28% acceptance vs 5% regular',
      lessCompetitivePaths: 'All admitted to Swarthmore. Honors Program is Swarthmore\'s signature — small seminar discussions with external examiners.',
      schoolsWithinSchool: 'Single admissions pool. Engineering program is unique for a LAC.',
      transferRate: '~3-5% transfer acceptance',
      financialAid: 'Need-blind, meets 100% need. $0 family contribution for incomes <$60K.',
      insiderTip: 'Swarthmore is the most academically intense LAC — students call it "Swatties" for a reason. The Honors Program is unique in American higher education. Also one of the few LACs with an accredited engineering program. Tri-College Consortium with Haverford and Bryn Mawr.',
      essayStrategy: 'Show intellectual depth and genuine academic passion. Reference the Honors Program, specific departments, and the Tri-College Consortium. Swarthmore values students who love learning deeply.'
    },
    {
      school: 'Wellesley College',
      acceptanceRate: '13%',
      edAdvantage: 'ED I and ED II — ~30-35% acceptance vs 10% regular',
      lessCompetitivePaths: 'All admitted to Wellesley. Cross-registration with MIT is a unique advantage. Smaller departments in languages and interdisciplinary programs.',
      schoolsWithinSchool: 'Single admissions pool. MIT cross-registration gives access to engineering/tech courses.',
      transferRate: '~15-20% transfer acceptance (including Davis Degree program for non-traditional students)',
      financialAid: 'Need-blind for US, meets 100% need. Families <$60K pay $0.',
      insiderTip: 'Wellesley + MIT cross-registration is an incredibly powerful combination — LAC experience with access to MIT courses and research. Davis Scholars program for non-traditional students. Strong alumnae network (Hillary Clinton, Madeleine Albright).',
      essayStrategy: 'Show why a women\'s college appeals to you specifically. Reference MIT cross-registration if STEM-interested. Wellesley values leadership, intellectual ambition, and community contribution.'
    }
  ];
}

// ==========================================
// MARKDOWN GENERATION
// ==========================================

function generateAdmissionsMarkdown(scorecardData, curatedIntel) {
  let md = `# College Admissions Intelligence — Top Universities\n\n`;
  md += `*Sources: NCES College Scorecard API + Curated Strategic Analysis*\n`;
  md += `*Last Updated: ${new Date().toISOString().split('T')[0]}*\n\n`;
  md += `---\n\n`;

  // Section 1: Curated Strategic Intelligence (most valuable)
  md += `## Strategic Admissions Intelligence\n\n`;
  md += `This section contains school-specific strategic insights that go far beyond basic statistics — including less competitive entry paths, school-within-school acceptance rate differentials, Early Decision advantages, transfer strategies, and application tips.\n\n`;

  for (const school of curatedIntel) {
    md += `### ${school.school}\n\n`;
    md += `**Overall Acceptance Rate:** ${school.acceptanceRate}\n\n`;
    md += `**Early Decision/Action Advantage:** ${school.edAdvantage}\n\n`;
    md += `**Less Competitive Entry Paths:** ${school.lessCompetitivePaths}\n\n`;
    md += `**School-Within-School Rates:** ${school.schoolsWithinSchool}\n\n`;
    md += `**Transfer Strategy:** ${school.transferRate}\n\n`;
    md += `**Financial Aid:** ${school.financialAid}\n\n`;
    md += `**Insider Tip:** ${school.insiderTip}\n\n`;
    md += `**Essay Strategy:** ${school.essayStrategy}\n\n`;
    md += `---\n\n`;
  }

  // Section 2: Scorecard Data (statistical profiles)
  if (scorecardData.length > 0) {
    md += `## University Statistical Profiles (College Scorecard Data)\n\n`;

    // Sort by acceptance rate
    const sorted = [...scorecardData].sort((a, b) =>
      (a.admissionRate || 1) - (b.admissionRate || 1)
    );

    for (const s of sorted) {
      md += `### ${s.name} (${s.city}, ${s.state})\n\n`;
      md += `- **Type:** ${s.type === 'public' ? 'Public' : 'Private'}\n`;
      if (s.admissionRate != null) md += `- **Admission Rate:** ${(s.admissionRate * 100).toFixed(1)}%\n`;
      if (s.satAvg) md += `- **SAT Average:** ${s.satAvg}\n`;
      if (s.satReading && s.satMath) md += `- **SAT Midpoints:** Reading ${s.satReading}, Math ${s.satMath}\n`;
      if (s.actAvg) md += `- **ACT Average:** ${s.actAvg}\n`;
      if (s.studentSize) md += `- **Student Body:** ${s.studentSize.toLocaleString()}\n`;
      if (s.retentionRate) md += `- **Retention Rate (4yr):** ${(s.retentionRate * 100).toFixed(1)}%\n`;
      if (s.gradRate4yr) md += `- **4-Year Graduation Rate:** ${(s.gradRate4yr * 100).toFixed(1)}%\n`;
      if (s.tuitionInState) md += `- **Tuition (In-State):** $${s.tuitionInState.toLocaleString()}\n`;
      if (s.tuitionOutOfState) md += `- **Tuition (Out-of-State):** $${s.tuitionOutOfState.toLocaleString()}\n`;
      if (s.avgNetPrice) md += `- **Average Net Price:** $${s.avgNetPrice.toLocaleString()}\n`;
      if (s.medianDebt) md += `- **Median Debt at Graduation:** $${s.medianDebt.toLocaleString()}\n`;
      if (s.pellGrantRate) md += `- **Pell Grant Recipients:** ${(s.pellGrantRate * 100).toFixed(1)}%\n`;
      if (s.earnings6yr) md += `- **Median Earnings (6yr post-entry):** $${s.earnings6yr.toLocaleString()}\n`;
      if (s.earnings10yr) md += `- **Median Earnings (10yr post-entry):** $${s.earnings10yr.toLocaleString()}\n`;
      md += `\n`;
    }
  }

  // Section 3: General Admissions Strategy Guide
  md += `## General College Admissions Strategy Guide\n\n`;

  md += `### The Strategic Application Approach\n\n`;
  md += `Most families waste thousands on admissions consultants who provide generic advice. Here are data-backed strategies that actually move the needle:\n\n`;

  md += `#### 1. Early Decision / Early Action Advantage\n`;
  md += `ED acceptance rates are typically 2-4x higher than Regular Decision at selective schools. At schools like Duke, Northwestern, and Penn, ED fills 40-50% of the class. If you have a clear first choice, ED is the single most impactful strategic decision.\n\n`;

  md += `#### 2. School-Within-School Strategy\n`;
  md += `Many universities have separate admissions for different colleges/schools with dramatically different acceptance rates. Cornell's Hotel School (~20%) vs Arts & Sciences (~7%) is a well-known example. UT Austin's Liberal Arts (~40%) vs CS (~6-8%) is another. Research each school's sub-college rates.\n\n`;

  md += `#### 3. Less Competitive Major Strategy\n`;
  md += `At universities that admit by major (UT Austin, UIUC, UC system, many state schools), applying to a less popular major significantly increases admission odds. Consider: Can you major in something accessible, then add your target field as a minor or pursue an internal transfer?\n\n`;

  md += `#### 4. Transfer Pathway\n`;
  md += `Some elite schools have surprisingly accessible transfer routes. Cornell (~15-18%), Vanderbilt (~20-25%), and UC Berkeley (~22-25%) have much higher transfer rates than freshman admission rates. The community college → UC pathway with TAG is a legitimate strategy to top schools.\n\n`;

  md += `#### 5. Demonstrated Interest\n`;
  md += `At schools that track demonstrated interest (Northeastern, Tulane, Case Western, many LACs), campus visits, info sessions, email engagement, and Early Decision all matter. Research which of your target schools track interest.\n\n`;

  md += `#### 6. Geographic & Demographic Strategy\n`;
  md += `Schools aim for geographic diversity. Students from underrepresented states (Montana, Alaska, Wyoming, Dakotas) can have a meaningful advantage at national schools. Similarly, pursuing less common academic + extracurricular combinations makes your application memorable.\n\n`;

  md += `#### 7. Financial Aid Strategy\n`;
  md += `Many families don't realize: at top schools, attending can be CHEAPER than state schools. Harvard, Stanford, MIT, Rice, and others cover full tuition for families under $75-100K. Run each school's Net Price Calculator before crossing any school off your list due to sticker price.\n\n`;

  md += `### Application Timeline\n\n`;
  md += `| Month | Action |\n|-------|--------|\n`;
  md += `| Summer before senior year | Finalize school list (2-3 reach, 3-4 target, 2-3 safety), draft main essay |\n`;
  md += `| September | Complete Common App/Coalition, finalize main essay, request recommendation letters |\n`;
  md += `| October | Submit EA/ED applications (deadlines: Nov 1-15) |\n`;
  md += `| November | Submit EA/ED, begin Regular Decision supplements |\n`;
  md += `| December-January | Submit Regular Decision (deadlines: Jan 1-15) |\n`;
  md += `| February | Complete FAFSA and CSS Profile if not already done |\n`;
  md += `| March-April | Decisions arrive, compare financial aid packages |\n`;
  md += `| May 1 | National Decision Day — commit to one school |\n\n`;

  md += `### The College List Framework\n\n`;
  md += `Build a balanced list of 8-12 schools:\n`;
  md += `- **2-3 "Reach" Schools**: Acceptance rate significantly below your profile (dream schools)\n`;
  md += `- **3-4 "Target" Schools**: Your profile matches the 50th percentile of admitted students\n`;
  md += `- **2-3 "Likely" Schools**: Your profile exceeds the 75th percentile, AND you'd be genuinely happy attending\n`;
  md += `- **1 "Safety" School**: Near-certain admission with auto-merit scholarship potential\n\n`;

  md += `### What Actually Matters in Admissions (by weight)\n\n`;
  md += `Based on NACAC surveys and admissions officer interviews:\n`;
  md += `1. **Grades in college-prep courses** (most important single factor)\n`;
  md += `2. **Strength of curriculum** (AP/IB rigor relative to what's available at your school)\n`;
  md += `3. **Standardized test scores** (still important at most schools, even test-optional ones)\n`;
  md += `4. **Essays** (critical differentiator at selective schools — often the tiebreaker)\n`;
  md += `5. **Extracurricular depth** (leadership and impact in 2-3 areas > membership in 10)\n`;
  md += `6. **Letters of recommendation** (choose teachers who know you well over famous names)\n`;
  md += `7. **Demonstrated interest** (varies by school — some track, some don't)\n`;
  md += `8. **Interview** (rarely decisive, but a bad one can hurt at schools that require them)\n\n`;

  return md;
}

// ==========================================
// MAIN EXPORT
// ==========================================

export async function runAdmissionsScraper() {
  console.log('\n=== College Admissions Data Scraper ===\n');

  // Always generate curated strategic intelligence
  const curatedIntel = getCuratedAdmissionsIntel();
  console.log(`  ✓ ${curatedIntel.length} schools with curated strategic intelligence`);

  // Try to fetch from College Scorecard API
  let scorecardData = [];
  const apiKey = process.env.DATA_GOV_API_KEY;

  if (apiKey) {
    scorecardData = await fetchSchoolData(apiKey);
    console.log(`  ✓ ${scorecardData.length} schools from College Scorecard API`);
  } else {
    console.log('  ⚠ No DATA_GOV_API_KEY — using curated data only');
    console.log('    Get a free key at: https://api.data.gov/signup/');
  }

  // Save JSON data
  await saveScrapedData('college-admissions.json', {
    scorecardProfiles: scorecardData,
    strategicIntel: curatedIntel,
    metadata: {
      scrapedAt: new Date().toISOString(),
      scorecardCount: scorecardData.length,
      curatedCount: curatedIntel.length
    }
  });

  // Generate and save markdown for knowledge base
  const markdown = generateAdmissionsMarkdown(scorecardData, curatedIntel);
  await saveScrapedData('college-admissions.md', { content: markdown });

  console.log(`\n  Total: ${scorecardData.length} API profiles + ${curatedIntel.length} strategic profiles`);
  console.log('  Saved: college-admissions.json, college-admissions.md');

  return { scorecardData, curatedIntel };
}

// Run if called directly
if (process.argv[1] && process.argv[1].includes('admissions-scraper')) {
  runAdmissionsScraper().catch(console.error);
}
