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

async function fetchProgramData(apiKey) {
  console.log('  Fetching program data from College Scorecard...');
  const programData = [];

  // Only fetch for first 30 schools to avoid rate limits
  const schoolsToFetch = TARGET_SCHOOLS.slice(0, 30);

  for (const schoolName of schoolsToFetch) {
    try {
      const url = `${API_BASE}/schools.json?` + new URLSearchParams({
        'api_key': apiKey,
        'school.name': schoolName,
        'fields': 'school.name,latest.programs.cip_4_digit',
        'per_page': '1'
      });

      const data = await fetchJSON(url);
      if (data && data.results && data.results.length > 0) {
        const school = data.results[0];
        const schoolFullName = school['school.name'];
        const programs = school['latest.programs.cip_4_digit'];

        if (programs && Array.isArray(programs)) {
          // Filter to bachelor's level (credential.level === 3) with earnings data
          const filteredPrograms = programs
            .filter(p => p['credential.level'] === 3 && p['earnings.median_earnings.latest.overall'])
            .map(p => ({
              name: p.title || 'Unknown',
              cipCode: p.code || '',
              medianEarnings: Math.round(p['earnings.median_earnings.latest.overall'] || 0),
              medianDebt: Math.round(p['debt.median_debt.completers.overall'] || 0),
              completions: p['counts.ipeds_awards2'] || 0
            }));

          if (filteredPrograms.length > 0) {
            programData.push({
              schoolName: schoolFullName,
              data: filteredPrograms
            });
            console.log(`    ✓ ${schoolFullName} — ${filteredPrograms.length} programs`);
          }
        }
      }

      await sleep(500); // Rate limiting
    } catch (err) {
      console.log(`    ⚠ Program data not available for ${schoolName}`);
    }
  }

  return programData;
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
      essayStrategy: 'Supplemental essay is optional but NEVER skip it. Focus on intellectual curiosity, not achievements.',
      programs: {
        totalMajors: 85,
        popularMajors: ['Applied Mathematics', 'Computer Science', 'Economics', 'History', 'Biology'],
        uniquePrograms: 'Joint concentrations common (e.g., Computer Science + Statistics). Biochemistry program highly regarded.',
        curriculumHighlights: 'Distribution requirements in humanities, social sciences, natural sciences, and foreign languages. Junior/senior thesis available in many departments.',
        preMedPath: 'Competitive pre-med environment. ~8-10% of students pre-med. Harvard Medical School on campus.',
        preBusinessPath: 'No dedicated business school. Economics concentration is the standard path. Many students do consulting recruiting from Applied Math.',
        engineeringPath: 'Applied Mathematics concentration; some cross-register at MIT. School of Engineering & Applied Sciences established 2007, relatively young program.',
      },
      schoolStructure: {
        hasMultipleSchools: false,
        schools: [
          {
            name: 'Harvard College (all undergrads)',
            acceptanceRate: '3.4%',
            notes: 'All undergraduates admitted through same application. Concentration (major) declared end of sophomore year.'
          }
        ],
        internalTransfers: 'N/A — single college',
        dualDegreePrograms: 'Harvard/MIT cross-registration permitted. Harvard is part of the Five College Consortium (includes MIT).',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Quora',
        admissionsQuirks: 'Harvard emphasizes "intellectual vitality" — the willingness to engage deeply with ideas. Quirky, passionate students succeed; straightforward overachievers often get rejected.',
        commonMistakes: 'Trying to appeal to the entire Harvard community. Admissions wants focus — deep expertise in one domain, not shallow breadth across many.',
        hiddenGems: 'Harvard Crimson (student newspaper) and Hasty Pudding Club are cultural touchstones. The Institute of Politics internships are extremely competitive.',
        redditWisdom: 'AOs consistently say: "We want students who will light our campus on fire." Passion and intellectual curiosity matter more than perfect stats.',
        strategyTips: 'If waitlisted, reference specific academic programs/professors and demonstrate genuine passion for Harvard beyond prestige.',
      },
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
      essayStrategy: 'Yale\'s short-answer essays ("Why Yale" + quirky prompts) are critical. Be specific about residential colleges, cultural houses, specific clubs. Show personality, not just achievements.',
      programs: {
        totalMajors: 80,
        popularMajors: ['Economics', 'Political Science', 'English', 'History', 'Computer Science'],
        uniquePrograms: 'Directed Studies (freshman program) is selective, interdisciplinary program combining literature, philosophy, history.',
        curriculumHighlights: '14-course major requirement. Residential college provides advising. Capstone projects required in many departments.',
        preMedPath: 'Strong pre-med program. ~6% of students pre-med. Yale School of Medicine on campus.',
        preBusinessPath: 'No undergraduate business school. Economics is standard path. Many students recruit for consulting/banking from Economics + Statistics.',
        engineeringPath: 'Bachelor of Science in Engineering (B.S.E.). Applied Physics and Physics popular. Joint engineering concentrations available.',
      },
      schoolStructure: {
        hasMultipleSchools: false,
        schools: [
          {
            name: 'Yale College (all undergrads)',
            acceptanceRate: '3.7%',
            notes: 'All undergraduates admitted to Yale College. Assigned to one of 14 residential colleges upon admission.'
          }
        ],
        internalTransfers: 'N/A — single college',
        dualDegreePrograms: 'Yale/YSOA dual degree (music). Yale School of Art collaborative opportunities.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Yale explicitly values leadership, social impact, and "love of learning for its own sake." Essays about extracurricular contributions weigh heavily.',
        commonMistakes: 'Being too focused on prestige. Yale wants students genuinely excited about the residential college system and specific opportunities.',
        hiddenGems: 'The Berkeley College traditions and senior societies (Skull & Bones, Scroll & Key) are culturally significant. Overnight hosting programs let applicants visit residential colleges.',
        redditWisdom: 'AOs emphasize: "We want leaders who care about their communities." Show genuine passion for making a difference, not just academics.',
        strategyTips: 'Reference specific residential college traditions and how you\'ll contribute to Yale community, not just why Yale is prestigious.',
      },
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
      essayStrategy: 'Princeton\'s "graded written paper" requirement is unique — submit your best AP/IB paper. The extracurricular and intellectual curiosity essays should show depth, not breadth.',
      programs: {
        totalMajors: 78,
        popularMajors: ['Engineering', 'Economics', 'Computer Science', 'History', 'Physics'],
        uniquePrograms: 'Proud of both AB (liberal arts) and BSE (engineering) parity. Physics is world-renowned. Princeton plasma physics lab is famous.',
        curriculumHighlights: 'Rigorous distribution requirements. Senior thesis mandatory for all concentrations. Independent work courses throughout.',
        preMedPath: 'Strong pre-med program. ~8% of students pre-med. Princeton does not have medical school (nearby Penn does).',
        preBusinessPath: 'No business school. Economics concentration + additional coursework is standard. Finance programs through independent work.',
        engineeringPath: 'Sc.B. (Bachelor of Science) in Engineering. More rigorous than A.B. engineering concentration. Highly selective within Princeton.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'AB (Arts/Liberal Arts)',
            acceptanceRate: '3.0%',
            notes: 'Traditional liberal arts degree. Requires senior thesis.'
          },
          {
            name: 'BSE (Engineering)',
            acceptanceRate: '5%',
            notes: 'Bachelor of Science in Engineering. More specialized and rigorous than A.B. engineering.'
          }
        ],
        internalTransfers: 'Possible between AB and BSE but difficult — separate admissions tracks from start.',
        dualDegreePrograms: 'None officially. Can combine AB concentration with engineering coursework.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Princeton heavily rewards the "graded written paper" requirement. They genuinely want to see your intellectual depth on paper.',
        commonMistakes: 'Assuming high stats guarantee admission. Princeton cares about fit with undergraduate experience — they admit few graduate-track researchers.',
        hiddenGems: 'The senior thesis is actually a huge draw for research-minded students. Princeton internship programs (like Summer in Toulouse) are competitive but transformative.',
        redditWisdom: 'AOs emphasize: "We want students excited about being undergraduates." Princeton\'s undergraduate focus is real.',
        strategyTips: 'In essays, emphasize genuine intellectual curiosity and independent research interests. Reference specific Princeton programs.',
      },
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
      essayStrategy: 'The "Why Columbia" essay must reference the Core Curriculum and NYC. Be specific about which classes, professors, or research opportunities excite you.',
      programs: {
        totalMajors: 95,
        popularMajors: ['Economics', 'Political Science', 'Computer Science', 'English', 'Biology'],
        uniquePrograms: 'Core Curriculum is mandatory for all Columbia College students — unique integrated humanities/social sciences sequence. SEAS has separate engineering curriculum.',
        curriculumHighlights: 'Core Curriculum (Humanities, History, Literature, Contemporary Civilization, Art Humanities). Senior seminars required. Extensive NYC research opportunities.',
        preMedPath: 'Strong pre-med track. ~7% of students pre-med. Columbia University Medical School on campus (Morningside Heights).',
        preBusinessPath: 'No undergraduate business school. Economics is default path. Many consulting recruiters target economics concentrators.',
        engineeringPath: 'SEAS (School of Engineering and Applied Science). Slightly higher acceptance than Columbia College. Strong in computer science and applied physics.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Columbia College',
            acceptanceRate: '3.5%',
            notes: 'Traditional liberal arts. All students take Core Curriculum (humanities, history, literature, contemporary civilization).'
          },
          {
            name: 'SEAS (School of Engineering and Applied Science)',
            acceptanceRate: '5-6%',
            notes: 'Engineering school. Takes Core Curriculum courses alongside engineering sequence.'
          },
          {
            name: 'School of General Studies',
            acceptanceRate: '25-30%',
            notes: 'Non-traditional pathway for gap year, military, older students. Takes Core Curriculum like Columbia College.'
          }
        ],
        internalTransfers: 'Rare from CC to SEAS or vice versa. General Studies → Columbia College possible but uncommon.',
        dualDegreePrograms: 'M&T (Management & Technology) with Wharton. Joint degrees with SIPA, School of the Arts.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Quora',
        admissionsQuirks: 'Columbia applicants must show genuine passion for the Core Curriculum — not treating it as a barrier but as a feature.',
        commonMistakes: 'Not understanding what Core Curriculum actually is. It\'s humanities-focused, not STEM — if you hate reading, Columbia may not be right.',
        hiddenGems: 'Columbia General Studies is genuinely underutilized as a backdoor entry point. ~25-30% acceptance for non-traditional students is real.',
        redditWisdom: 'AOs emphasize: "The Core Curriculum is what makes Columbia Columbia." Show genuine intellectual curiosity about interdisciplinary learning.',
        strategyTips: 'Reference specific Core classes/authors that excite you. NYC location is important — show you\'ll use it for research/internships.',
      },
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
      essayStrategy: 'The "Why Penn" essay is critical. Reference specific programs, professors, or resources. Cross-school collaboration is a Penn differentiator — mention it.',
      programs: {
        totalMajors: 120,
        popularMajors: ['Finance', 'Accounting', 'Economics', 'Computer Science', 'Psychology'],
        uniquePrograms: 'Wharton is one of the top undergraduate business schools in the US. Joseph Wharton School of Business is separate from liberal arts.',
        curriculumHighlights: 'Cross-school registration common — take Wharton classes from CAS, SEAS classes from anywhere. Extensive undergraduate research opportunities.',
        preMedPath: 'Strong pre-med program. ~6% of students pre-med. University of Pennsylvania School of Medicine on campus.',
        preBusinessPath: 'Wharton School of Business — the crown jewel. Highly competitive to enter (~5%). Many CAS students do consulting/finance recruiting.',
        engineeringPath: 'School of Engineering and Applied Science (SEAS). Strong CS and bioengineering programs. Can double-major with Wharton.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Wharton School of Business',
            acceptanceRate: '5%',
            notes: 'Elite business school. Can double-major with CAS or other schools.'
          },
          {
            name: 'College of Arts & Sciences',
            acceptanceRate: '7%',
            notes: 'Traditional liberal arts. Can double-major with Wharton or minor in business.'
          },
          {
            name: 'School of Engineering (SEAS)',
            acceptanceRate: '9%',
            notes: 'Engineering school with strong CS/bioengineering.'
          },
          {
            name: 'School of Nursing',
            acceptanceRate: '11%',
            notes: 'Nursing program. Can double-degree with other schools.'
          }
        ],
        internalTransfers: 'Possible but highly competitive. Easier to enter via less-competitive school then transfer.',
        dualDegreePrograms: 'M&T (Management & Technology), Huntsman (International Studies + Business), Vagelos (Pre-med + Wharton), LSM (Life Sciences + Wharton).',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Quora',
        admissionsQuirks: 'Penn is super strategic — many successful applicants apply to CAS and transfer to Wharton after proving themselves.',
        commonMistakes: 'Only applying to Wharton if you\'re borderline. CAS is slightly more accessible and provides a legitimate path.',
        hiddenGems: 'The dual-degree programs (M&T, Huntsman, Vagelos) are transformative but extremely competitive. The M&T essays require serious creativity.',
        redditWisdom: 'AOs emphasize: "Be specific about which school you\'re applying to and why." Penn wants intentionality, not prestige-chasing.',
        strategyTips: 'Apply ED to Penn if it\'s #1. For Wharton admits, emphasize business-specific interests. For CAS admits, talk about specific majors + cross-registration plans.',
      },
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
      essayStrategy: 'Show intellectual independence. Brown wants students who will design their own education. Reference specific courses from Brown\'s unique offerings and explain WHY the open curriculum appeals to you specifically.',
      programs: {
        totalMajors: 85,
        popularMajors: ['Economics', 'Computer Science', 'Political Science', 'Biology', 'English'],
        uniquePrograms: 'Open Curriculum — no core requirements or distribution requirements. Students design their own course of study.',
        curriculumHighlights: 'Senior capstone/thesis required in most concentrations. ShopPeriod lets students try courses for 2 weeks before committing.',
        preMedPath: 'Strong pre-med advising. ~20% of students are pre-med. No specific pre-med major — bio, chem, neuro all work.',
        preBusinessPath: 'No undergraduate business school. Economics concentration is the common path. Many do finance recruiting from Econ/Applied Math.',
        engineeringPath: 'Brown offers Sc.B. (bachelor of science) degrees — more rigorous than A.B. engineering concentration.',
      },
      schoolStructure: {
        hasMultipleSchools: false,
        schools: [
          {
            name: 'Brown College (all undergrads)',
            acceptanceRate: '5.0%',
            notes: 'All undergrads admitted to same college. Major declaration typically sophomore year.'
          }
        ],
        internalTransfers: 'N/A — single college',
        dualDegreePrograms: 'Brown/RISD dual degree (5 years). PLME 8-year BS/MD.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Quora',
        admissionsQuirks: 'Brown is known for valuing "weirdness" and unconventional thinkers. The open curriculum essay is almost always the strongest differentiator — show you know what it means and why it fits you.',
        commonMistakes: 'Applying because "no requirements sounds easy." Brown wants self-directed learners, not people avoiding work.',
        hiddenGems: 'The Writing Center internship and Swearer Center for Public Service are underutilized resources that impress admissions when referenced.',
        redditWisdom: 'AOs consistently emphasize: fit matters more than prestige. Show genuine love for Brown specifically.',
        strategyTips: 'If waitlisted, write a strong LOCI (Letter of Continued Interest) referencing specific new achievements and why Brown remains #1.',
      },
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
      essayStrategy: 'The "Why Dartmouth" essay should reference the D-Plan, specific off-campus programs, and Dartmouth\'s intimate community. Rural setting is a feature, not a bug — embrace it.',
      programs: {
        totalMajors: 71,
        popularMajors: ['Economics', 'Engineering', 'Computer Science', 'English', 'Biology'],
        uniquePrograms: 'Thayer School of Engineering (five-course engineering major). Strong outdoor/environmental programs.',
        curriculumHighlights: 'D-Plan (quarter system) allows off-campus terms, internships, research flexibility. Undergraduate seminars required.',
        preMedPath: 'Strong pre-med program. ~10% of students pre-med. Hanover Medical School affiliated.',
        preBusinessPath: 'No business school. Economics + Statistics combo common for consulting/finance recruiting.',
        engineeringPath: 'Thayer School of Engineering. Five-course major (lighter than most schools). Can combine with other concentrations.',
      },
      schoolStructure: {
        hasMultipleSchools: false,
        schools: [
          {
            name: 'Dartmouth College (all undergrads)',
            acceptanceRate: '6.2%',
            notes: 'Single college with no separate schools. Thayer engineering is a modified major, not separate school.'
          }
        ],
        internalTransfers: 'N/A — single college',
        dualDegreePrograms: 'None formally. Can do off-campus terms at partner institutions through D-Plan.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Dartmouth cares deeply about fit with rural, outdoors-focused community. Applicants who ignore the D-Plan or rural location often get rejected despite strong stats.',
        commonMistakes: 'Not understanding the D-Plan or treating rural location as a negative. For Dartmouth, isolation = feature, not bug.',
        hiddenGems: 'The D-Plan flexibility for off-campus terms is incredible for internships/research. First-year trips (outdoor orientation) are legendary.',
        redditWisdom: 'AOs emphasize: "We want students excited about our community." Dartmouth culture is strong and exclusive in a good way.',
        strategyTips: 'Show genuine interest in outdoor activities or D-Plan flexibility. Reference specific outdoor clubs or off-campus programs.',
      },
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
      essayStrategy: 'Each college has its own essay — tailor completely. CALS essay about impact on NY state. Hotel essay about hospitality passion. Do NOT write generic "why Cornell."',
      programs: {
        totalMajors: 200,
        popularMajors: ['Engineering', 'Economics', 'Agriculture', 'Computer Science', 'Hotel Management'],
        uniquePrograms: 'Hotel School (only hotel program in Ivy League). ILR School (labor relations, unique program). CALS (Agriculture & Life Sciences).',
        curriculumHighlights: 'Varies by college. Some colleges have GE requirements, others don\'t. Research opportunities across all colleges.',
        preMedPath: '~8% pre-med. Strong pre-med track. Cornell directly affiliated with Weill Medical School.',
        preBusinessPath: 'No business school. Economics + Engineering path common. Hotel School offers business-focused curriculum.',
        engineeringPath: 'College of Engineering. One of the largest engineering programs in the country. Strong computer science.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'College of Arts & Sciences',
            acceptanceRate: '7%',
            notes: 'Traditional liberal arts. Largest college. Most competitive acceptance rate.'
          },
          {
            name: 'College of Engineering',
            acceptanceRate: '9%',
            notes: 'One of the largest engineering programs in any university.'
          },
          {
            name: 'College of Agriculture & Life Sciences (CALS)',
            acceptanceRate: '11%',
            notes: 'Unique agricultural/environmental focus. Lower acceptance rate than implied.'
          },
          {
            name: 'School of Industrial & Labor Relations (ILR)',
            acceptanceRate: '11%',
            notes: 'Unique school. Only one like it in US. Genuine alternative pathway.'
          },
          {
            name: 'School of Hotel Administration',
            acceptanceRate: '18-22%',
            notes: 'Only hotel school in Ivy League. Extremely strategic entry point.'
          }
        ],
        internalTransfers: 'Possible between colleges but competitive. Easier to enter via CALS/Hotel then transfer.',
        dualDegreePrograms: 'Cornell/SJU 3+2 (engineering + architecture). Various dual majors available.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Quora',
        admissionsQuirks: 'Cornell is THE strategic Ivy. Apply to Hotel (~20%) or CALS (~11%) if borderline for Arts & Sciences (~7%). Internal transfers possible but not easy.',
        commonMistakes: 'Applying only to CAS when you\'d get into Hotel or CALS with same application.',
        hiddenGems: 'ILR School is genuinely unique and underappreciated. Hotel School is the back door to Ivy League. Both have strong post-grad outcomes.',
        redditWisdom: 'AOs emphasize: "Choose the college that fits you best." They literally WANT students to use strategic college selection.',
        strategyTips: 'Be strategic — Hotel/CALS have 2-3x higher acceptance. Tailor essays by college. Show genuine interest in that specific college\'s mission.',
      },
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
      essayStrategy: 'Short answers matter as much as long essays. Be authentic and specific — admissions reads 20K+ applications.',
      programs: {
        totalMajors: 95,
        popularMajors: ['Computer Science', 'Engineering', 'Economics', 'Biology', 'Physics'],
        uniquePrograms: 'Design school pioneering design thinking. Symbolic Systems (CS + philosophy). Strong interdisciplinary options.',
        curriculumHighlights: 'Flexible freshman year. GE requirements cover basics. Senior capstone varies by major. Internship culture strong.',
        preMedPath: '~4% of students pre-med. No pre-med major — bio, chem, neuro all work. Strong research opportunities.',
        preBusinessPath: 'No business school. Economics concentration + CS double major common for tech/finance. Stanford offers advanced business electives.',
        engineeringPath: 'One of the best engineering programs in the world. Can declare any engineering major sophomore year.',
      },
      schoolStructure: {
        hasMultipleSchools: false,
        schools: [
          {
            name: 'Stanford University (single school)',
            acceptanceRate: '3.7%',
            notes: 'All undergraduates admitted to same school. Engineering major declared sophomore year, not at admission.'
          }
        ],
        internalTransfers: 'N/A — single school',
        dualDegreePrograms: 'None officially, but interdisciplinary majors common.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Quora',
        admissionsQuirks: 'Stanford loves "intellectual vitality" and students building things outside the classroom. Passion projects > traditional achievements.',
        commonMistakes: 'Sounding like everyone else. Stanford rejects many 4.0/1600 applicants. Quirky, creative, ambitious applicants succeed.',
        hiddenGems: 'The "roommate essay" is often the strongest differentiator. Stanford wants to know who you are as a person.',
        redditWisdom: 'AOs emphasize: "Build something. Start something." Entrepreneurial mindset matters even if not about business.',
        strategyTips: 'Show intellectual curiosity and real-world impact of your work. Stanford wants builders and innovators.',
      },
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
      essayStrategy: 'Focus on what you\'ve MADE or BUILT. Describe process, failures, iteration. Be precise and technical where appropriate.',
      programs: {
        totalMajors: 34,
        popularMajors: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Physics', 'Mathematics'],
        uniquePrograms: 'Media Lab (interdisciplinary tech/art research). System Design & Management. Urban Studies. Philosophy.',
        curriculumHighlights: 'General Institute Requirements cover basics. Undergraduate Research Opportunities Program (UROP) is legendary. Hands-on learning culture.',
        preMedPath: '~5% pre-med (rare). MIT students interested in medicine usually go biomedical engineering route instead.',
        preBusinessPath: 'No business school. Sloan School is grad-only. Some undergrads do consulting/finance but less common than Stanford.',
        engineeringPath: 'World\'s best engineering program. All 5 schools within MIT offer engineering-focused degrees.',
      },
      schoolStructure: {
        hasMultipleSchools: false,
        schools: [
          {
            name: 'MIT (single admissions pool)',
            acceptanceRate: '3.9%',
            notes: 'No separate schools for admission. Choose major (course) at end of freshman year.'
          }
        ],
        internalTransfers: 'N/A — students can change majors easily.',
        dualDegreePrograms: 'Can double major without much extra time due to flexibility.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'MIT wants to see what you\'ve built or created. ISEF/Olympiad credentials help, but a student who built a robot in their garage might beat a perfect-score student.',
        commonMistakes: 'Assuming high test scores alone get you in. MIT rejects many perfect-score applicants. Must show intellectual curiosity AND building/making.',
        hiddenGems: 'UROP (Undergraduate Research Opportunities Program) is incredibly powerful — get involved first semester if possible.',
        redditWisdom: 'AOs say: "Show us something you\'ve made." Even a small project matters if you describe learning deeply.',
        strategyTips: 'In essays, focus on process, iteration, failures, and what you learned. MIT values learning mindset over perfection.',
      },
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
      essayStrategy: 'Show deep math/science curiosity. Describe research, experiments, or problems you\'ve worked on. Caltech wants to see you think like a scientist.',
      programs: {
        totalMajors: 28,
        popularMajors: ['Physics', 'Engineering', 'Mathematics', 'Computer Science', 'Chemistry'],
        uniquePrograms: 'Extremely specialized STEM programs. Physics program is world-renowned. Research-focused from day one.',
        curriculumHighlights: 'Caltech core curriculum for all — heavy math/science requirements. Undergraduate research expected. Senior thesis required.',
        preMedPath: 'Rare — maybe 1-2% pre-med. Caltech students interested in medicine usually go to grad school instead.',
        preBusinessPath: 'Almost no undergrads pursue business from Caltech. Culture is research/science focused.',
        engineeringPath: 'Excellent but very rigorous. All engineering students take same core curriculum.',
      },
      schoolStructure: {
        hasMultipleSchools: false,
        schools: [
          {
            name: 'Caltech (single pool, 230 students/year)',
            acceptanceRate: '3.2%',
            notes: 'Extraordinarily small. Single admissions pool. Choose division (engineering, physics, etc.) after arrival.'
          }
        ],
        internalTransfers: 'N/A — everyone is STEM focused',
        dualDegreePrograms: 'None — students often go to grad school instead.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Caltech wants to see you love math/science for its own sake, not for prestige. A student with a unique research project beats perfect scores without research.',
        commonMistakes: 'Applying if you want business, liberal arts, or social sciences. Caltech is STEM-only and intensely academic.',
        hiddenGems: 'The research opportunities start immediately. Freshman year you\'re working on real research projects.',
        redditWisdom: 'AOs emphasize: "Only apply if you genuinely love pure science/math." Caltech is not for everyone, even smart kids.',
        strategyTips: 'Show deep curiosity about a specific problem in physics, math, or engineering. Research experience is expected.',
      },
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
      essayStrategy: '"Why Duke" supplement is crucial. Reference specific programs like DukeEngage, Bass Connections, or Focus programs. Interdisciplinary themes resonate.',
      programs: {
        totalMajors: 120,
        popularMajors: ['Engineering', 'Economics', 'Computer Science', 'Biology', 'Chemistry'],
        uniquePrograms: 'Fuqua School of Business (undergrad business program). DukeEngage (service learning). Bass Connections (interdisciplinary research).',
        curriculumHighlights: 'Bass Connections allow undergrads to work on faculty research. DukeEngage required for engagement. Interdisciplinary majors popular.',
        preMedPath: 'Strong pre-med (~7% of students). Duke School of Medicine on campus. Medical school preferences given to Duke undergrads.',
        preBusinessPath: 'No separate business school for undergrad (Fuqua is grad), but strong business-focused courses. Consulting recruiting strong.',
        engineeringPath: 'Pratt School of Engineering — top-tier. Slightly higher acceptance than Trinity but still ~8%.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Trinity College of Arts & Sciences',
            acceptanceRate: '5.5%',
            notes: 'Traditional liberal arts college. Largest college at Duke.'
          },
          {
            name: 'Pratt School of Engineering',
            acceptanceRate: '8%',
            notes: 'Top engineering school. Admits separately from Trinity.'
          }
        ],
        internalTransfers: 'Possible but requires strong performance. Most enter the school they choose.',
        dualDegreePrograms: 'Rare cross-school double degrees. Some students do Trinity + engineering minor.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Quora',
        admissionsQuirks: 'Duke values legacy highly. ED acceptance is notably higher than RD — if Duke is your #1, ED can make a big difference.',
        commonMistakes: 'Ignoring demonstrated interest. Duke explicitly cares about campus visits and info session attendance.',
        hiddenGems: 'Bass Connections and DukeEngage are incredible differentiators if you mention them in essays.',
        redditWisdom: 'AOs emphasize: "We want to see genuine interest in Duke, not just prestige." Mention specific programs/professors.',
        strategyTips: 'Apply ED if Duke is #1. Show demonstrated interest. Reference DukeEngage or Bass Connections specifically.',
      },
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
      essayStrategy: 'The extended essay is your chance to be intellectually playful. UChicago rewards creative, unconventional thinking. Don\'t play it safe. The "Why UChicago" should reference specific professors and the Core.',
      programs: {
        totalMajors: 99,
        popularMajors: ['Economics', 'Physics', 'Computer Science', 'Biology', 'Mathematics'],
        uniquePrograms: 'Core Curriculum is mandatory — great books approach to education. UChicago Economics is world-famous.',
        curriculumHighlights: 'Core Curriculum (humanities, social sciences, natural sciences). Seminar-based learning. Independent work encouraged.',
        preMedPath: 'Strong pre-med (~8% of students). UChicago Medicine on campus. Very competitive but well-supported.',
        preBusinessPath: 'No business school. Economics concentration is default path. Booth is grad-only (but offers undergrad internships).',
        engineeringPath: 'Physical Sciences program (not traditional engineering). Strong physics and computational backgrounds.',
      },
      schoolStructure: {
        hasMultipleSchools: false,
        schools: [
          {
            name: 'University of Chicago College',
            acceptanceRate: '5.2%',
            notes: 'Single college. Core Curriculum is defining feature. All students take same required courses.'
          }
        ],
        internalTransfers: 'N/A — single college',
        dualDegreePrograms: 'UChicago/Argonne Lab dual degrees. Some interdisciplinary majors.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'UChicago wants "weirdness" and intellectual curiosity. The uncommon essays are genuinely uncommon prompts that reward unconventional thinking.',
        commonMistakes: 'Being too safe in essays. UChicago explicitly wants creative, quirky responses.',
        hiddenGems: 'The Core Curriculum is intellectually transformative. If you mention specific professors, your chances improve significantly.',
        redditWisdom: 'AOs emphasize: "Be yourself. Be weird. Tell us what makes you intellectually passionate." Standard essays fail here.',
        strategyTips: 'Use the uncommon essay to show personality and intellectual curiosity. Reference specific professors or Core texts that excite you.',
      },
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
      essayStrategy: '"Why Northwestern" should show genuine school knowledge. Mention the quarter system advantage, specific professors, student organizations.',
      programs: {
        totalMajors: 125,
        popularMajors: ['Communications', 'Engineering', 'Economics', 'Psychology', 'Computer Science'],
        uniquePrograms: 'Medill School of Journalism (undergrad journalism school). School of Communication (film, theater, speech). Quarter system.',
        curriculumHighlights: 'Quarter system allows 5 academic sessions/year (compressed or with breaks). Flexibility for internships/study abroad. Cross-school registration.',
        preMedPath: 'Strong pre-med (~7% of students). No med school on campus but Chicago-area resources.',
        preBusinessPath: 'No undergrad business school (Kellogg is grad-only). Many do consulting/finance recruiting from Econ + Engineering.',
        engineeringPath: 'McCormick School of Engineering. Well-regarded. Slightly higher acceptance than Weinberg.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Weinberg College of Arts & Sciences',
            acceptanceRate: '7%',
            notes: 'Largest college. Traditional liberal arts.'
          },
          {
            name: 'McCormick School of Engineering',
            acceptanceRate: '9%',
            notes: 'Top engineering school. Admissions separate from Weinberg.'
          },
          {
            name: 'Medill School of Journalism',
            acceptanceRate: '12%',
            notes: 'Undergrad journalism school — unique. Different admissions process and portfolio review.'
          },
          {
            name: 'School of Communication',
            acceptanceRate: '15%',
            notes: 'Film, theater, speech programs. Audition/portfolio-based.'
          }
        ],
        internalTransfers: 'Possible but difficult. Most students choose their school at admission and stay.',
        dualDegreePrograms: 'Some students double major across schools. Medill/Engineering double degrees rare but possible.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Quora',
        admissionsQuirks: 'Northwestern ED is incredibly powerful — roughly 3x higher acceptance than RD. Strategic school choice matters (Medill/McCormick > Weinberg by acceptance rate).',
        commonMistakes: 'Only applying to Weinberg when Medill or McCormick might be accessible. Bad strategy.',
        hiddenGems: 'The quarter system is amazing for internships and flexibility. Medill is one of the best journalism schools in the country.',
        redditWisdom: 'AOs emphasize: "If Northwestern is your #1, ED is a game changer." The acceptance rate difference is real.',
        strategyTips: 'Apply ED if Northwestern is #1. Consider strategic school selection (Medill has higher acceptance). Reference quarter system flexibility.',
      },
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
      essayStrategy: 'Show intellectual depth and research curiosity. Reference specific labs, professors, or research centers. JHU values collaboration across disciplines.',
      programs: {
        totalMajors: 150,
        popularMajors: ['Biomedical Engineering', 'Computer Science', 'Pre-med Track', 'Physics', 'Psychology'],
        uniquePrograms: 'Biomedical Engineering is world-leading. Engineering for Professionals allows dual study. Entrepreneurship focus.',
        curriculumHighlights: 'Research expected for many majors. Undergraduate research opportunities abundant. Intersession options.',
        preMedPath: 'Extremely strong (~18% of students pre-med). JHU School of Medicine on campus. Direct research opportunities.',
        preBusinessPath: 'No business school. Economics + Engineering path common. Carey Business School is grad-only.',
        engineeringPath: 'Whiting School of Engineering is world-renowned. Biomedical engineering especially strong.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Krieger School of Arts & Sciences',
            acceptanceRate: '7%',
            notes: 'Traditional liberal arts college.'
          },
          {
            name: 'Whiting School of Engineering',
            acceptanceRate: '9%',
            notes: 'Top engineering school. Biomedical engineering is especially prestigious.'
          }
        ],
        internalTransfers: 'Possible but students typically stay in their school.',
        dualDegreePrograms: 'Rare. Some students do engineering + pre-med path.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'JHU is research-focused — having research experience or passion for a specific lab helps a lot. Pre-med pipeline is very strong but not the only path.',
        commonMistakes: 'Assuming JHU is primarily pre-med. They want diverse interests in engineering, physics, and other fields too.',
        hiddenGems: 'The undergraduate research opportunities are exceptional. Having a specific lab/professor you want to work with is a major advantage.',
        redditWisdom: 'AOs emphasize: "We want curious researchers, not just pre-meds." Show genuine intellectual curiosity, not just medical school trajectory.',
        strategyTips: 'Research specific professors or labs and mention them. Show intellectual depth. If pre-med, emphasize broader scientific interests too.',
      },
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
      essayStrategy: 'The "Why Rice" and "unconventional" essay are both important. Show personality and quirkiness — Rice culture values it.',
      programs: {
        totalMajors: 130,
        popularMajors: ['Engineering', 'Computer Science', 'Economics', 'Biology', 'Chemistry'],
        uniquePrograms: 'Architecture program is top-tier (5-year B.Arch). Strong engineering pipeline. Shepherd School of Music',
        curriculumHighlights: 'Residential college system provides strong community. 6-to-1 student-to-faculty ratio. Extensive undergraduate research.',
        preMedPath: 'Strong pre-med program (~10% of students). Rice School of Medicine on campus (but grad-focused). Excellent pre-med advising.',
        preBusinessPath: 'No undergraduate business school (Jones Graduate School is grad-only). Economics + Engineering path common.',
        engineeringPath: 'Excellent engineering program. Architecture is particularly strong (5-year B.Arch degree).',
      },
      schoolStructure: {
        hasMultipleSchools: false,
        schools: [
          {
            name: 'Rice University (single college)',
            acceptanceRate: '7.7%',
            notes: 'All undergraduates admitted to same college. Residential college system provides community structure.'
          }
        ],
        internalTransfers: 'N/A — single college',
        dualDegreePrograms: 'None. Some students do engineering + music double major.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Quora',
        admissionsQuirks: 'Rice is under-the-radar — equally excellent as Duke/Northwestern but less competitive. Financial aid is world-class.',
        commonMistakes: 'Not knowing about Rice Investment (free tuition/room & board for <$75K families). Treating Rice as a safety when it\'s genuinely excellent.',
        hiddenGems: 'Residential colleges create tight-knit communities. The "unconventional" essay is a chance to show personality and fit.',
        redditWisdom: 'AOs emphasize: "We want quirky, fun, community-focused students." Rice culture is tight-knit and collaborative.',
        strategyTips: 'Reference specific residential college traditions or research opportunities. Show genuine interest in community.',
      },
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
      essayStrategy: 'Show genuine interest in Nashville and Vanderbilt community. The "contribution" essay should be specific about what you\'ll add to campus.',
      programs: {
        totalMajors: 140,
        popularMajors: ['Engineering', 'Economics', 'Medicine/Pre-med', 'Business', 'Computer Science'],
        uniquePrograms: 'Peabody College for Human Development (education/social sciences). Blair School of Music. Owen Graduate Business.',
        curriculumHighlights: 'Strong research opportunities. Extensive internship partnerships in Nashville. Honor code culture.',
        preMedPath: 'Strong pre-med program (~12% of students). Vanderbilt School of Medicine on campus. Pre-med advising is excellent.',
        preBusinessPath: 'Owen Graduate School is grad-only. Owen Undergraduate Business program bridges to grad school. Economics common path.',
        engineeringPath: 'Solid engineering program. Not top-tier but respected. Slightly higher acceptance than A&S.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'College of Arts & Sciences',
            acceptanceRate: '5%',
            notes: 'Largest college. Most competitive.'
          },
          {
            name: 'School of Engineering',
            acceptanceRate: '8%',
            notes: 'Solid engineering program.'
          },
          {
            name: 'Peabody College for Human Development',
            acceptanceRate: '13%',
            notes: 'Education, human development, social sciences. Strategic entry point.'
          },
          {
            name: 'Blair School of Music',
            acceptanceRate: 'Audition-based',
            notes: 'Music school. Audition required.'
          }
        ],
        internalTransfers: 'Possible but competitive. Strategic to choose right school from start.',
        dualDegreePrograms: 'Some students double major across schools. Blair/A&S combinations possible.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Quora',
        admissionsQuirks: 'Vanderbilt values community involvement and demonstrated interest in Nashville. ED advantage is significant.',
        commonMistakes: 'Ignoring Peabody College as a strategic option. HOD major opens consulting/business doors while having higher acceptance.',
        hiddenGems: 'Peabody College is genuinely underutilized. Human & Organizational Development (HOD) is a recruiting pipeline for consulting firms.',
        redditWisdom: 'AOs emphasize: "We want students who will contribute to our community." Nashville location and community involvement matter.',
        strategyTips: 'Show interest in Nashville. Consider Peabody/HOD as strategic choice if borderline. Apply ED if Vandy is #1.',
      },
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
      essayStrategy: '"Why WashU" must be ultra-specific. Mention the Danforth campus, specific programs, research opportunities. WashU values collaborative, kind students.',
      programs: {
        totalMajors: 150,
        popularMajors: ['Engineering', 'Business Administration', 'Economics', 'Computer Science', 'Biology'],
        uniquePrograms: 'Olin Business School (undergrad). McKelvey Engineering (strong). Sam Fox School of Design (architecture/design).',
        curriculumHighlights: 'Extensive research opportunities. Collaborative culture. Semester abroad common. Service-learning emphasized.',
        preMedPath: 'Strong pre-med program (~8% of students). Washington University School of Medicine on campus. Research opportunities abundant.',
        preBusinessPath: 'Olin Business School — one of the top undergrad business schools. Strong recruiting for consulting/banking.',
        engineeringPath: 'McKelvey School of Engineering. Well-regarded. Top-tier CS program.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'College of Arts & Sciences',
            acceptanceRate: '10%',
            notes: 'Largest college. Traditional liberal arts.'
          },
          {
            name: 'Olin Business School',
            acceptanceRate: '12%',
            notes: 'Top undergrad business school. Competitive recruiting for consulting/banking.'
          },
          {
            name: 'McKelvey School of Engineering',
            acceptanceRate: '15%',
            notes: 'Strong engineering program, especially CS. Highest acceptance of main schools.'
          },
          {
            name: 'Sam Fox School of Design',
            acceptanceRate: '20%',
            notes: 'Architecture, design, art. Portfolio-based admissions.'
          }
        ],
        internalTransfers: 'Possible but competitive. Strategic to choose right school from start.',
        dualDegreePrograms: 'Olin/Engineering double degrees possible. Sam Fox/A&S combinations rare.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Quora',
        admissionsQuirks: 'WashU tracks demonstrated interest heavily. ED advantage is enormous (~28-32% vs 8% RD). Many borderline applicants get in via ED.',
        commonMistakes: 'Not demonstrating interest (campus visits, info sessions, emails matter). Only applying to A&S when engineering might be strategic.',
        hiddenGems: 'Sam Fox School has ~20% acceptance — legitimate strategic entry point for design/architecture students.',
        redditWisdom: 'AOs emphasize: "Show us you\'re genuinely interested in WashU." Demonstrated interest is measurable and tracked.',
        strategyTips: 'Apply ED if WashU is #1 — advantage is real. Show demonstrated interest (campus visits, emails). Consider strategic school selection.',
      },
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
      essayStrategy: 'For Oxford specifically, show you value a small liberal arts experience. For Emory main, reference the Atlanta location and specific research opportunities.',
      programs: {
        totalMajors: 160,
        popularMajors: ['Business', 'Biology', 'Chemistry', 'Economics', 'Psychology'],
        uniquePrograms: 'Goizueta Business School (undergrad). Pre-med is extremely competitive. Oxford College (2-year option).',
        curriculumHighlights: 'Oxford provides intimate 2-year liberal arts experience then transfer to main campus. Atlanta location brings internship opportunities.',
        preMedPath: 'Very strong pre-med (~15% of students, highest percentage of any research university). Emory School of Medicine on campus. Extremely competitive.',
        preBusinessPath: 'Goizueta Business School — top undergrad business program. Strong recruiting for consulting/finance.',
        engineeringPath: 'Limited engineering options. Physics-heavy instead.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Emory College of Arts & Sciences',
            acceptanceRate: '10%',
            notes: 'Main college for Emory campus. Traditional liberal arts.'
          },
          {
            name: 'Oxford College of Emory University',
            acceptanceRate: '25-28%',
            notes: '2-year campus with guaranteed transfer to Emory main. Same Emory degree. Excellent strategic entry point.'
          },
          {
            name: 'Goizueta Business School',
            acceptanceRate: '15%',
            notes: 'Top undergrad business school.'
          },
          {
            name: 'Nell Hodgson Woodruff School of Nursing',
            acceptanceRate: '18-20%',
            notes: 'Nursing program. More accessible than main college.'
          }
        ],
        internalTransfers: 'Oxford → Emory guaranteed. Otherwise possible but competitive.',
        dualDegreePrograms: 'Goizueta/A&S double degrees possible.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Quora',
        admissionsQuirks: 'Oxford College is genuinely the best kept secret in elite college admissions — 25-28% acceptance with guaranteed transfer and same Emory degree.',
        commonMistakes: 'Not knowing about Oxford. Applying to main Emory when Oxford provides legitimate alternative pathway.',
        hiddenGems: 'Oxford students often report stronger professor relationships and smaller class sizes (LAC experience) before transferring.',
        redditWisdom: 'AOs emphasize: "Oxford is not a consolation prize." It\'s a legitimate pathway with real benefits (close-knit community, better professor access).',
        strategyTips: 'Consider Oxford strategically if borderline for main Emory. Research shows Oxford graduates succeed equally well.',
      },
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
      essayStrategy: 'Georgetown values community, service, and Jesuit values (cura personalis — care for the whole person). Show intellectual depth and commitment to others.',
      programs: {
        totalMajors: 110,
        popularMajors: ['International Affairs', 'Economics', 'Business', 'Government', 'History'],
        uniquePrograms: 'School of Foreign Service is world-renowned (but extremely selective). McDonough Business School. Jesuit education focus.',
        curriculumHighlights: 'DC location provides unmatched internship opportunities in policy/government. Jesuit core curriculum emphasizes ethics and service.',
        preMedPath: 'Moderate pre-med program (~5% of students). Georgetown School of Medicine on campus (grad-only).',
        preBusinessPath: 'McDonough Business School — top undergrad business school. Strong consulting recruiting.',
        engineeringPath: 'No engineering school. Physics/chemistry heavy science path.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'School of Foreign Service (SFS)',
            acceptanceRate: '8%',
            notes: 'World-renowned. Extremely selective. International affairs focus.'
          },
          {
            name: 'McDonough School of Business',
            acceptanceRate: '10%',
            notes: 'Top undergrad business school.'
          },
          {
            name: 'College of Arts & Sciences',
            acceptanceRate: '14%',
            notes: 'Largest college. More accessible than SFS.'
          },
          {
            name: 'School of Nursing & Health Studies',
            acceptanceRate: '18-20%',
            notes: 'Nursing program. Most accessible school.'
          }
        ],
        internalTransfers: 'Possible but difficult. Strategic to choose right school.',
        dualDegreePrograms: 'McDonough/SFS combinations rare but possible.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Quora',
        admissionsQuirks: 'Georgetown values service and Jesuit mission. Essays about faith, community, and service matter.',
        commonMistakes: 'Only applying to SFS when College might be strategic. Ignoring Jesuit values in essays.',
        hiddenGems: 'Nursing has ~18-20% acceptance — legitimate strategic entry. DC internship opportunities are incredible.',
        redditWisdom: 'AOs emphasize: "Show us how you\'ll serve others and contribute to community." Jesuit values are genuinely important.',
        strategyTips: 'Consider strategic school selection (College > SFS). Reference DC location and specific internship goals. Mention community service.',
      },
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
      essayStrategy: 'Show alignment with Notre Dame\'s values — community, faith, service. Be genuine about why the culture appeals to you. The "Why Notre Dame" should be deeply personal.',
      programs: {
        totalMajors: 150,
        popularMajors: ['Business', 'Engineering', 'Economics', 'Science', 'Pre-Law'],
        uniquePrograms: 'Mendoza Business School (undergrad). Strong architecture program. Preprofessional programs (pre-law, pre-med).',
        curriculumHighlights: 'Strong core curriculum with faith/values component. Residential college system. Service-learning emphasized.',
        preMedPath: 'Moderate pre-med (~6% of students). No medical school on campus.',
        preBusinessPath: 'Mendoza Business School — top undergrad business school. Strong consulting/finance recruiting.',
        engineeringPath: 'Solid engineering program. Not top-tier but respected.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Mendoza College of Business',
            acceptanceRate: '10%',
            notes: 'Top undergrad business school.'
          },
          {
            name: 'College of Engineering',
            acceptanceRate: '12%',
            notes: 'Solid engineering program.'
          },
          {
            name: 'College of Arts & Letters',
            acceptanceRate: '14%',
            notes: 'Largest college. More accessible than engineering/business.'
          },
          {
            name: 'College of Science',
            acceptanceRate: '14%',
            notes: 'STEM-focused liberal arts college.'
          },
          {
            name: 'School of Architecture',
            acceptanceRate: '16%',
            notes: 'Architecture program. Slightly more accessible than main schools.'
          }
        ],
        internalTransfers: 'Possible but difficult. Strategic school choice matters.',
        dualDegreePrograms: 'Rare. Most students stay in their school.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Quora',
        admissionsQuirks: 'Notre Dame values faith, service, and community alignment. Catholic school background is genuinely an advantage (not a disadvantage).',
        commonMistakes: 'Trying to hide Catholic school background if you attended one. ND wants to see values alignment.',
        hiddenGems: 'Residential college system creates tight-knit communities. Architecture program is overlooked but strong.',
        redditWisdom: 'AOs emphasize: "We want to see genuine values alignment." Showing service-mindedness helps.',
        strategyTips: 'If you have Catholic school background, highlight it. Show genuine interest in ND community/values. Architecture is strategic.',
      },
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
      essayStrategy: 'Be specific about WHY your chosen school within CMU. Show interdisciplinary interests — CMU values cross-pollination between arts, tech, and humanities.',
      programs: {
        totalMajors: 140,
        popularMajors: ['Computer Science', 'Engineering', 'Business Administration', 'Drama', 'Art'],
        uniquePrograms: 'School of Computer Science (one of the top 3 in the US). Drama program (world-class). Art & Design schools.',
        curriculumHighlights: 'Interdisciplinary culture. Cross-college collaboration. Extensive entrepreneurship programs.',
        preMedPath: 'Rare pre-med path (~2% of students). Carnegie Mellon is STEM/tech/arts focused, not pre-med.',
        preBusinessPath: 'Tepper Business School — top undergrad business school. Strong consulting recruiting.',
        engineeringPath: 'Solid engineering program. Slightly less selective than CS, equally strong academically.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'School of Computer Science (SCS)',
            acceptanceRate: '5%',
            notes: 'Top 3 CS program in the US. Extremely selective.'
          },
          {
            name: 'School of Drama',
            acceptanceRate: '6%',
            notes: 'World-class drama program. Audition-based. Very selective.'
          },
          {
            name: 'College of Fine Arts',
            acceptanceRate: '8%',
            notes: 'Art, design, music. Portfolio-based admissions.'
          },
          {
            name: 'Carnegie Institute of Technology (Engineering)',
            acceptanceRate: '12%',
            notes: 'Solid engineering program.'
          },
          {
            name: 'Tepper Business School',
            acceptanceRate: '14%',
            notes: 'Top undergrad business school.'
          },
          {
            name: 'Dietrich College of Humanities and Social Sciences',
            acceptanceRate: '18-20%',
            notes: 'Most accessible school. Can still take CS courses and minor in CS.'
          }
        ],
        internalTransfers: 'Possible but competitive. Cross-college minor/double major common instead.',
        dualDegreePrograms: 'Dietrich/SCS double degree possible. Drama/CS combinations rare but creative.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Quora',
        admissionsQuirks: 'CMU SCS is incredibly selective (~5% acceptance) — harder than most Ivies. Dietrich College is strategic alternative.',
        commonMistakes: 'Only applying to SCS when Dietrich might be strategic. Not showing interdisciplinary interests.',
        hiddenGems: 'Dietrich College allows CS minors — legitimate backdoor to CS curriculum. Drama is world-class.',
        redditWisdom: 'AOs emphasize: "Show us why you fit this specific school." CMU is extremely school-specific.',
        strategyTips: 'Consider Dietrich strategically if interested in CS. Show interdisciplinary interests. Be specific about school choice.',
      },
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
      essayStrategy: 'Show passion for USC\'s specific offerings — not just LA. Reference the Trojan Family network, specific programs, and how you\'ll contribute to campus community.',
      programs: {
        totalMajors: 150,
        popularMajors: ['Film/Television', 'Engineering', 'Business', 'Communications', 'Chemistry'],
        uniquePrograms: 'School of Cinematic Arts (one of the top film schools in the world). Viterbi Engineering. Marshall Business. Annenberg School of Communications.',
        curriculumHighlights: 'Rolling admissions (apply early advantage). LA location provides entertainment/tech internship hub. Hands-on learning in many programs.',
        preMedPath: 'Limited pre-med program (~4% of students). Not a pre-med focused school.',
        preBusinessPath: 'Marshall Business School — top undergrad business school. Strong consulting/finance recruiting.',
        engineeringPath: 'Viterbi School of Engineering. Top-tier. Solid CS program.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'School of Cinematic Arts',
            acceptanceRate: '4%',
            notes: 'Top film/television school in the US. Extremely selective. Portfolio/application-based.'
          },
          {
            name: 'Viterbi School of Engineering',
            acceptanceRate: '8-10%',
            notes: 'Top engineering school. Separate admissions.'
          },
          {
            name: 'Marshall School of Business',
            acceptanceRate: '10%',
            notes: 'Top undergrad business school.'
          },
          {
            name: 'Dornsife College of Arts & Sciences',
            acceptanceRate: '14%',
            notes: 'Largest college. Traditional liberal arts.'
          },
          {
            name: 'Annenberg School for Communication & Journalism',
            acceptanceRate: '15%',
            notes: 'Communications, journalism, public relations.'
          }
        ],
        internalTransfers: 'Possible but difficult. Choose carefully at admission.',
        dualDegreePrograms: 'Dornsife/Viterbi double degrees possible. Cinematic Arts/other schools rare.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Quora',
        admissionsQuirks: 'USC uses rolling admissions (no ED/EA) — early application helps. Film School is incredibly selective (~4%).',
        commonMistakes: 'Applying to Film School without genuine portfolio/experience. Not applying early in rolling admissions cycle.',
        hiddenGems: 'Dornsife is more accessible (~14%) while still being excellent. The Trojan Family network is genuinely powerful post-grad.',
        redditWisdom: 'AOs emphasize: "Apply early in rolling admissions cycle." Early applicants have better odds than late ones.',
        strategyTips: 'Apply in September/October for better odds. Consider Dornsife strategically. Show genuine passion for specific USC programs.',
      },
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
      essayStrategy: 'Tufts\' supplemental essays are quirky and creative. Show personality and intellectual curiosity. The community engagement essay should highlight specific programs at Tufts.',
      programs: {
        totalMajors: 115,
        popularMajors: ['International Relations', 'Engineering', 'Biology', 'Economics', 'Computer Science'],
        uniquePrograms: 'Tufts is known for international relations and diplomatic studies. The Fletcher School of Law & Diplomacy (grad) influences undergrad curriculum. Strong STEM programs with research opportunities.',
        curriculumHighlights: 'Tufts requires a combination of distribution requirements and deep study in major. Strong emphasis on global perspectives and international engagement.',
        preMedPath: 'Moderate pre-med program (~8% of students). Pre-med track is rigorous but supported. Some hospital partnerships in Boston area.',
        preBusinessPath: 'No dedicated business school. Students major in Economics or related fields. Strong consulting recruiting from major.',
        engineeringPath: 'Strong engineering program. Civil, mechanical, electrical, biomedical, and computer engineering are particularly strong.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'School of Arts & Sciences',
            acceptanceRate: '10%',
            notes: 'Largest school. Includes humanities, social sciences, natural sciences, mathematics.'
          },
          {
            name: 'School of Engineering',
            acceptanceRate: '11-12%',
            notes: 'Strong engineering programs. Slightly more accessible than A&S.'
          },
          {
            name: 'School of Museum of Fine Arts (combined degree)',
            acceptanceRate: '15-18%',
            notes: 'Collaborative program with museum. More accessible option.'
          }
        ],
        internalTransfers: 'Possible between A&S and Engineering after first year if strong academic performance. Not encouraged as strategic pathway.',
        dualDegreePrograms: 'SMFA combined program (A&S + Museum of Fine Arts diploma). Five-year program.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Tufts heavily emphasizes "demonstrated interest" and wants students who genuinely want to be there. The "Why Tufts" essay is critical — admissions officers can tell when you\'ve done your homework.',
        commonMistakes: 'Generic "Why Tufts" essays that could apply to any school. Not researching specific programs, professors, or opportunities. Underestimating the power of ED at Tufts.',
        hiddenGems: 'The SMFA combined degree is significantly more accessible (~15-18%) while still providing a full Tufts education. International relations courses without declaring IR as major. The quirky supplemental essays actually show personality better than traditional essays.',
        redditWisdom: 'AOs say: "We want students who are genuinely excited about Tufts specifically, not just using us as a backup." Demonstrated interest (emails, visits, webinars) genuinely matters.',
        strategyTips: 'Use ED if Tufts is your top choice — the acceptance boost is massive (~28-32% vs 7-8%). Research deeply and reference specific opportunities in your essays. Highlight global perspectives and intellectual curiosity.',
      },
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
      essayStrategy: '"Why NYU" should reference specific programs AND how you\'ll use NYC. The city is your campus — show you\'ll take advantage of it. For Stern, demonstrate business passion beyond just wanting to make money.',
      programs: {
        totalMajors: 210,
        popularMajors: ['Business Administration', 'Finance', 'Accounting', 'Psychology', 'Drama'],
        uniquePrograms: 'Stern Business School (top undergrad business program). Tisch School of the Arts (world-class drama, film, music). Gallatin School allows fully customized interdisciplinary majors.',
        curriculumHighlights: 'NYU is highly specialized by school — curriculum varies dramatically. Stern has rigorous business core. Tisch emphasizes portfolio-based learning. Gallatin is radically open curriculum.',
        preMedPath: 'Pre-med available through CAS, not emphasized. ~4% of students pre-med. NYC hospitals offer research opportunities.',
        preBusinessPath: 'Stern Business School — one of the top undergrad programs. Extremely selective but legitimate direct admit program. Strong consulting/finance recruiting.',
        engineeringPath: 'Tandon School of Engineering (Brooklyn). Solid engineering program with strong CS focus. More accessible than Stern.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Stern School of Business',
            acceptanceRate: '5-7%',
            notes: 'Top undergrad business school. Extremely selective. BBA degree.'
          },
          {
            name: 'Tisch School of the Arts',
            acceptanceRate: '15%',
            notes: 'World-class drama, film, music programs. Audition/portfolio-based.'
          },
          {
            name: 'College of Arts & Science (CAS)',
            acceptanceRate: '12%',
            notes: 'Largest school. Most flexible and accessible option.'
          },
          {
            name: 'Tandon School of Engineering',
            acceptanceRate: '18%',
            notes: 'Engineering program in Brooklyn. More accessible than Stern.'
          },
          {
            name: 'Gallatin School of Individualized Study',
            acceptanceRate: '20%',
            notes: 'Design your own major. Most accessible school. Unique curriculum freedom.'
          },
          {
            name: 'Steinhardt School of Culture, Education, and Human Development',
            acceptanceRate: '18%',
            notes: 'Education, music therapy, performing arts education. More accessible.'
          },
          {
            name: 'School of Liberal Studies',
            acceptanceRate: '25%',
            notes: 'Accelerated completion programs. Most accessible entry point.'
          }
        ],
        internalTransfers: 'Possible but competitive. Strategic to choose right school from start. Stern internal transfers are very difficult.',
        dualDegreePrograms: 'Stern/CAS combinations possible. Tisch/other schools are challenging due to portfolio demands.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'NYU is known for having dramatically different acceptance rates by school — Stern (~5-7%) vs Liberal Studies (~25%). It\'s not one acceptance rate; it\'s highly school-specific. NYC location is a major draw and should be referenced.',
        commonMistakes: 'Applying only to Stern without backup schools. Not understanding school-specific differences. Thinking you can easily transfer from one NYU school to another (very competitive).',
        hiddenGems: 'Gallatin School allows you to design your own major and cross-register at other schools. Tandon engineering is legitimate and more accessible. The global sites (Abu Dhabi, Shanghai) have higher acceptance rates and full financial aid.',
        redditWisdom: 'AOs emphasize: "Know which NYU school you\'re applying to and why." NYC location and specific school culture should feature prominently. Transfer-friendly reputation is real but internal transfers between prestigious schools are hard.',
        strategyTips: 'Apply strategically to less competitive NYU schools if that\'s your true interest level. Don\'t bank on transferring from CAS to Stern. Reference NYC specifically and how you\'ll engage with it.',
      },
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
      essayStrategy: 'The "Why Tulane" must be hyper-specific — mention New Orleans, service-learning, specific courses. Tulane can tell when you\'re using a generic "why X school" essay.',
      programs: {
        totalMajors: 125,
        popularMajors: ['Business Administration', 'Psychology', 'Biology', 'Economics', 'International Relations'],
        uniquePrograms: 'Strong business program (Freeman School). Public health and medicine are distinctive strengths. Environmental studies with New Orleans focus. Service-learning integration throughout.',
        curriculumHighlights: 'Core curriculum emphasizes New Orleans and social responsibility. Service-learning components in many courses. School of Continuing Studies allows community engagement.',
        preMedPath: 'Moderate pre-med program (~8% of students). Tulane School of Medicine on campus attracts pre-med students. Research opportunities with medical school.',
        preBusinessPath: 'Freeman School of Business — strong undergrad program. Consulting and finance recruiting presence.',
        engineeringPath: 'Solid engineering program. Chemical, civil, mechanical engineering are strong. Smaller program than peer schools.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'A.B. Freeman School of Business',
            acceptanceRate: '10%',
            notes: 'Strong business program. BBA degree. Selective.'
          },
          {
            name: 'School of Continuing Studies',
            acceptanceRate: '12-13%',
            notes: 'Same rigorous curriculum as day school. Evening and flexible options available.'
          },
          {
            name: 'School of Liberal Arts',
            acceptanceRate: '15%',
            notes: 'Largest school. Humanities, social sciences, sciences.'
          },
          {
            name: 'School of Science & Engineering',
            acceptanceRate: '16%',
            notes: 'STEM-focused. Solid engineering program.'
          }
        ],
        internalTransfers: 'Possible but not common. Better to choose right school initially.',
        dualDegreePrograms: 'Some dual degree programs with professional schools. Engineering/Business combinations possible.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Tulane HEAVILY tracks demonstrated interest. Campus visits, emails, webinar attendance all matter. ED acceptance is roughly 3x RD — one of the biggest ED advantages among non-Ivies.',
        commonMistakes: 'Not demonstrating interest. Generic "Why Tulane" essays that don\'t mention New Orleans or service learning. Underestimating the power of ED.',
        hiddenGems: 'The service-learning curriculum is genuinely distinctive and integrated throughout. New Orleans location provides unique internship opportunities. School of Continuing Studies is viable alternative pathway.',
        redditWisdom: 'AOs say: "Show us you\'ve done your homework and genuinely care about Tulane." Demonstrated interest is real and tracked. The ED advantage is enormous.',
        strategyTips: 'Use ED if Tulane is your top choice — acceptance rate jumps to 38-42%. Demonstrate interest early and often through visits, emails, webinars. Reference New Orleans specifically and service-learning opportunities in essays.',
      },
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
      essayStrategy: 'Reference the co-op program specifically — which companies, what experiences you want. Show you understand experiential learning and why it appeals to you over traditional models.',
      programs: {
        totalMajors: 150,
        popularMajors: ['Computer Science', 'Business Administration', 'Engineering', 'Biology', 'Economics'],
        uniquePrograms: 'Co-op program is the main differentiator — 6-month paid work experiences integrated throughout. Khoury College of CS is top-tier. Strong engineering across disciplines.',
        curriculumHighlights: 'Co-op integrated into 5-year curriculum for most students. Experiential learning is central to Northeastern\'s identity. Global co-op opportunities available.',
        preMedPath: 'Moderate pre-med program (~6% of students). Co-op experience strengthens med school applications. Limited hospital partnerships but Boston location helps.',
        preBusinessPath: 'D\'Amore-McKim Business School — solid undergrad program. Co-op opportunities with consulting firms and finance companies. Strong recruiting.',
        engineeringPath: 'Strong engineering across mechanical, electrical, chemical, civil, and biomedical. Co-op experiences with top engineering firms.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Khoury College of Computer Sciences',
            acceptanceRate: '4-5%',
            notes: 'Top-tier CS program. Extremely selective. Co-op with major tech companies.'
          },
          {
            name: 'D\'Amore-McKim School of Business',
            acceptanceRate: '7%',
            notes: 'Solid business program. AACSB accredited.'
          },
          {
            name: 'College of Engineering',
            acceptanceRate: '8%',
            notes: 'Strong across all engineering disciplines. ABET accredited.'
          },
          {
            name: 'College of Social Sciences & Humanities',
            acceptanceRate: '12%',
            notes: 'Most accessible school. Still offers co-op programs.'
          },
          {
            name: 'College of Science',
            acceptanceRate: '10%',
            notes: 'STEM-focused. Biology, chemistry, physics, mathematics.'
          }
        ],
        internalTransfers: 'Possible but competitive. Better to select right college from start.',
        dualDegreePrograms: 'Co-op integrated into all programs. Dual degrees possible but less common.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Northeastern explicitly tracks demonstrated interest through their application tracking system. Attending info sessions, visiting campus, emailing AOs all get logged and reviewed.',
        commonMistakes: 'Not demonstrating interest. Generic essays that don\'t mention co-op or experiential learning specifically. Not researching which companies/industries co-op with Northeastern.',
        hiddenGems: 'The co-op program genuinely sets Northeastern apart — students graduate with 18+ months of real work experience. Global co-op options (Europe, Asia, etc.). Strong for pre-med given Boston location.',
        redditWisdom: 'AOs emphasize: "Show us you understand what Northeastern is about — it\'s not a traditional college experience." The co-op is the differentiator and should be central to your essays.',
        strategyTips: 'Mention specific companies or industries you\'d co-op with. Use ED if Northeastern is your top choice (acceptance jumps to 22-28%). Research and email admissions about your specific interests.',
      },
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
      essayStrategy: 'Show why Cleveland and CWRU\'s specific resources appeal to you. Reference research partnerships, the Think Forum, or specific interdisciplinary programs.',
      programs: {
        totalMajors: 110,
        popularMajors: ['Engineering', 'Biology', 'Biochemistry', 'Psychology', 'Physics'],
        uniquePrograms: 'Exceptional pre-med track with partnerships to Cleveland Clinic and University Hospitals. Strong engineering across disciplines. Excellent for interdisciplinary STEM. Case also unique for small school feel with strong research.',
        curriculumHighlights: 'Undergraduate research heavily emphasized — many undergrads work in faculty labs. Engineering clinics and design projects. Pre-professional health advising is excellent. Flexible curriculum allows customization.',
        preMedPath: 'Excellent pre-med program (~20% of students). Direct partnerships with Cleveland Clinic and University Hospitals for internships/research. Strong medical school placement.',
        preBusinessPath: 'No dedicated business school. Students major in economics or management-focused programs. Some business courses available.',
        engineeringPath: 'Strong engineering program across chemical, civil, mechanical, electrical, and biomedical. Excellent research and internship opportunities.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'School of Engineering',
            acceptanceRate: '26-28%',
            notes: 'Strong across all disciplines. Excellent research opportunities. Clinical partnerships.'
          },
          {
            name: 'College of Arts & Sciences',
            acceptanceRate: '32-35%',
            notes: 'Largest school. Includes sciences, mathematics, humanities, social sciences.'
          },
          {
            name: 'College of Nursing',
            acceptanceRate: '30-32%',
            notes: 'Strong nursing program. ACEN accredited.'
          }
        ],
        internalTransfers: 'Possible between schools. Generally feasible if maintaining good GPA.',
        dualDegreePrograms: 'Engineering/Science dual degrees available. Pre-professional pathways integrated.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'CWRU offers very generous merit scholarships — many students get $20K+/year making it significantly cheaper than state schools. ED acceptance is 50-55% vs 30% regular.',
        commonMistakes: 'Overlooking CWRU due to lower overall prestige. Not highlighting STEM interests strongly enough. Missing the merit scholarship opportunity.',
        hiddenGems: 'The Cleveland Clinic partnership is genuinely valuable for pre-med students. Generous merit scholarships can make cost comparable to state schools. Small school size allows real undergraduate research experience.',
        redditWisdom: 'AOs say: "CWRU students are passionate about STEM. Show us your intellectual curiosity and research interests." Merit scholarships are generous for early applicants.',
        strategyTips: 'Apply early for best merit scholarships. Highlight STEM interests and research aspirations. If pre-med, reference Cleveland Clinic partnership specifically. Use ED if you\'re committed (acceptance jumps to 50-55%).',
      },
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
      essayStrategy: 'PIQs (Personal Insight Questions): choose 4 of 8 prompts. Be specific about overcoming adversity and contributing to community. UC readers spend 8-12 minutes per application.',
      programs: {
        totalMajors: 180,
        popularMajors: ['Electrical Engineering & Computer Science', 'Business Administration', 'Computer Science', 'Biology', 'Economics'],
        uniquePrograms: 'EECS (Electrical Engineering & Computer Science) is top-tier (ranked #1). Haas School of Business is world-class. Strong across STEM and humanities. Cutting-edge research institution.',
        curriculumHighlights: 'Strong general education requirements. Declare major after freshman/sophomore year. Exceptional research opportunities — all students can participate. World-class faculty across all disciplines.',
        preMedPath: 'Good pre-med program (~8% of students). Strong pre-med advising. UCSF medical school partnerships. Excellent science curriculum.',
        preBusinessPath: 'Haas School of Business — top undergrad program (requires separate application). Strong consulting/finance/tech recruiting.',
        engineeringPath: 'EECS is ranked #1 nationally. Other engineering disciplines (mechanical, civil, chemical, biomedical) are also very strong.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'College of Engineering - EECS',
            acceptanceRate: '4-6%',
            notes: 'Ranked #1 nationally. Extremely selective. Direct admit.'
          },
          {
            name: 'Haas School of Business',
            acceptanceRate: '6%',
            notes: 'Top undergrad business program. Requires separate application and admission by junior year.'
          },
          {
            name: 'College of Engineering - Other Disciplines',
            acceptanceRate: '10-12%',
            notes: 'Mechanical, civil, chemical, biomedical engineering. Very strong.'
          },
          {
            name: 'College of Letters & Science',
            acceptanceRate: '14%',
            notes: 'Largest college. Declare major later. Can petition into competitive majors.'
          },
          {
            name: 'College of Environmental Design',
            acceptanceRate: '18-20%',
            notes: 'Architecture, landscape architecture, urban planning. More accessible.'
          },
          {
            name: 'School of Social Welfare',
            acceptanceRate: '20-22%',
            notes: 'Most accessible school. Social work, public policy.'
          }
        ],
        internalTransfers: 'Possible into Haas from L&S (competitive). Engineering internal transfers are also competitive but happen.',
        dualDegreePrograms: 'Haas/Engineering combinations possible. Business/Engineering double degrees exist but rare.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'UC system uses holistic review with Personal Insight Questions (PIQs). No ED/EA means apply broadly across UC system on single app. EECS is one of the hardest programs in US (~4-6%).',
        commonMistakes: 'Applying only to Berkeley engineering when overall acceptance makes L&S seem viable. Not understanding college-specific acceptance rates. Missing TAG opportunity from CA community colleges.',
        hiddenGems: 'Letters & Science admission (14%) is more accessible — declare major later and petition into competitive programs. Environmental Design is significantly more accessible (18-20%). CA community college → Berkeley TAG is a legitimate pathway.',
        redditWisdom: 'AOs say: "PIQs should be thoughtful and specific. Show us who you are and how you\'ve overcome challenges." Berkeley values diversity of experience and intellectual curiosity.',
        strategyTips: 'Apply to multiple UCs since single application. If interested in business/engineering, understand internal competition. Use TAG from CA community colleges if eligible. Apply L&S if borderline — declare major later.',
      },
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
      essayStrategy: 'Same PIQs as all UCs. Show cultural awareness, community involvement, and how you\'ve overcome challenges. UCLA values diversity of experience.',
      programs: {
        totalMajors: 170,
        popularMajors: ['Engineering', 'Computer Science', 'Business Economics', 'Psychology', 'Film & Television'],
        uniquePrograms: 'World-class film, television, and theater programs (audition-based). Strong engineering and CS. Excellent humanities and social sciences. School of Nursing.',
        curriculumHighlights: 'General Education requirements. Declare major by end of first year. Strong research opportunities. Outstanding faculty across disciplines. Los Angeles location provides entertainment/tech industry access.',
        preMedPath: 'Moderate pre-med program (~7% of students). UCSF medical school partnerships. Strong pre-med advising. Excellent biology curriculum.',
        preBusinessPath: 'No dedicated business school. Students major in Business Economics (within L&S). Strong accounting and finance courses. Some business consulting clubs.',
        engineeringPath: 'Strong engineering across all disciplines. CS within engineering is very competitive. Good hands-on learning and internship opportunities.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'School of Theater, Film & Television',
            acceptanceRate: '4-6%',
            notes: 'World-class programs. Audition/portfolio-based. Extremely selective.'
          },
          {
            name: 'Henry Samueli School of Engineering',
            acceptanceRate: '7-8%',
            notes: 'Strong across all engineering disciplines.'
          },
          {
            name: 'School of Nursing',
            acceptanceRate: '5-8%',
            notes: 'Excellent nursing program. CCNE accredited.'
          },
          {
            name: 'College of Letters & Science',
            acceptanceRate: '12%',
            notes: 'Largest school. All majors including sciences, humanities, social sciences, music.'
          }
        ],
        internalTransfers: 'Possible but competitive. Better to apply to correct school initially.',
        dualDegreePrograms: 'Engineering/Science combinations possible. Film + humanities combinations available.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'UCLA is the most applied-to university in America. Film and theater programs are among the most selective in the world. Audition-based admissions are highly competitive. Rolling review means earlier applications have slight advantage.',
        commonMistakes: 'Applying only to theater/film when audition acceptance is <5%. Not understanding college-specific rates. Thinking UCLA is easier than Berkeley (both are extremely selective).',
        hiddenGems: 'L&S acceptance is 12% — more accessible path to UCLA education. Film/music minors are available through L&S. Entertainment industry access is extraordinary given LA location. TAG pathway available.',
        redditWisdom: 'AOs emphasize: "Show us your specific passion and why UCLA is the right fit." LA location should be referenced. If film/theater interested, understand audition process.',
        strategyTips: 'Apply to multiple UCs. If interested in film/theater, understand extremely high selectivity and audition requirements. L&S is more accessible entry point. Apply early (rolling review). Use TAG if eligible.',
      },
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
      essayStrategy: '"Why Michigan" essay is critical — be school-specific. Mention specific programs, research opportunities, campus culture.',
      programs: {
        totalMajors: 275,
        popularMajors: ['Business Administration', 'Engineering', 'Economics', 'Psychology', 'Computer Science'],
        uniquePrograms: 'Ross School of Business (top undergrad program). Strong engineering across all disciplines. Exceptional research opportunities. School of Music (Thornton), School of Kinesiology.',
        curriculumHighlights: 'General Education requirements. Optional writing major. Strong research opportunities across disciplines. Extensive professional clubs and societies. Ann Arbor cultural scene is exceptional.',
        preMedPath: 'Good pre-med program (~8% of students). Strong pre-med advising. University of Michigan Medical School on campus (graduate). Excellent biology and chemistry curriculum.',
        preBusinessPath: 'Ross School of Business — top undergrad business program. Direct admit is extremely competitive (~8%). Apply LSA then transfer to Ross sophomore year is common and often easier.',
        engineeringPath: 'Strong engineering across mechanical, electrical, civil, chemical, and computer. Equal-strength program nationally. Good research and internship opportunities.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Ross School of Business',
            acceptanceRate: '8%',
            notes: 'Top undergrad business school. Extremely selective direct admit. Transfer from LSA sophomore year is more common/easier.'
          },
          {
            name: 'College of Engineering',
            acceptanceRate: '18%',
            notes: 'Strong across all engineering disciplines. Excellent research and internships.'
          },
          {
            name: 'College of Literature, Science, and the Arts (LSA)',
            acceptanceRate: '22%',
            notes: 'Largest school. Most accessible. Can transfer to Ross or pursue business minor/courses.'
          },
          {
            name: 'School of Music, Theatre & Dance',
            acceptanceRate: '20-25%',
            notes: 'Performing arts. Audition-based for performance tracks.'
          },
          {
            name: 'School of Kinesiology',
            acceptanceRate: '25-30%',
            notes: 'Exercise science, physical education, sports management.'
          },
          {
            name: 'School of Nursing',
            acceptanceRate: '30-35%',
            notes: 'Nursing program. More accessible entry point.'
          }
        ],
        internalTransfers: 'Ross transfer from LSA is possible but competitive (higher than direct admit). Engineering transfers more common. Between LSA and other schools generally feasible.',
        dualDegreePrograms: 'Ross/Engineering combinations exist. LSA/Ross dual possible through careful course planning.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Michigan uses EA (non-binding) — acceptance rate jumps to ~32% for EA vs 15-18% regular. School-specific acceptance rates vary dramatically. Ross direct admit is one of the hardest admits nationally.',
        commonMistakes: 'Only applying to Ross when direct admit rate is ~8%. Not using EA when it offers major advantage. Not demonstrating enough interest for out-of-state applicants.',
        hiddenGems: 'LSA → Ross transfer is more accessible (many students take this route). Ann Arbor is exceptional for college experience — strong community, restaurants, cultural scene. Go Blue Guarantee (families <$65K get free tuition, fees, housing).',
        redditWisdom: 'AOs emphasize: "Know what school/major you want and why." Michigan values demonstrated interest. "Go Blue Guarantee" is genuinely generous.',
        strategyTips: 'Use EA — acceptance jumps to ~32% vs 15-18% regular. If Ross-interested, apply LSA and transfer sophomore year (many do this). Research specific programs. Reference Ann Arbor community and culture.',
      },
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
      essayStrategy: 'Show love for UVA\'s traditions — the Honor Code, student self-governance, Lawn living. Reference specific programs and the Charlottesville community.',
      programs: {
        totalMajors: 120,
        popularMajors: ['Business Administration', 'Engineering', 'Biology', 'Economics', 'Psychology'],
        uniquePrograms: 'McIntire School of Commerce is top-tier business school (nationally ranked). Strong engineering program. Liberal Arts offers flexibility and breadth. Honor Code is central to UVA identity.',
        curriculumHighlights: 'Strong general education requirements. Student-run Honor Code is unique differentiator. Lawn living (first-year students get central campus housing). Strong research opportunities.',
        preMedPath: 'Moderate pre-med program (~7% of students). UVA School of Medicine on campus (graduate). Strong pre-med advising. Excellent biology/chemistry programs.',
        preBusinessPath: 'McIntire School of Commerce — top undergrad business school. Direct admit is extremely competitive (~8%). A&S → McIntire transfer sophomore year is more common and often easier.',
        engineeringPath: 'Strong engineering across mechanical, electrical, chemical, and systems engineering. Solid but not at absolute top-tier level.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'McIntire School of Commerce',
            acceptanceRate: '8%',
            notes: 'Top undergrad business school. Direct admit extremely competitive. Transfer from A&S sophomore year is more feasible.'
          },
          {
            name: 'School of Engineering & Applied Science',
            acceptanceRate: '15%',
            notes: 'Strong engineering program. Mechanical, electrical, chemical, systems engineering.'
          },
          {
            name: 'College of Arts & Sciences',
            acceptanceRate: '18%',
            notes: 'Largest school. Most accessible. Can transfer to McIntire or take business courses.'
          },
          {
            name: 'School of Nursing',
            acceptanceRate: '20%',
            notes: 'Nursing program. ACEN accredited.'
          },
          {
            name: 'Curry School of Education and Human Development',
            acceptanceRate: '22%',
            notes: 'Education programs. More accessible than business/engineering.'
          }
        ],
        internalTransfers: 'A&S → McIntire transfer sophomore year is common and often more successful than direct admit. Engineering transfers feasible. Good internal transfer system.',
        dualDegreePrograms: 'McIntire/A&S combinations possible. Engineering dual degrees available.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'UVA culture and traditions (Honor Code, Lawn, student self-governance) matter. McIntire direct admit is ~8% — extremely competitive. ED acceptance jumps to ~28-32% vs 14-16% regular.',
        commonMistakes: 'Only applying to McIntire when direct admit is nearly impossible. Not showing understanding/love for UVA traditions and culture. Underestimating ED advantage for out-of-state.',
        hiddenGems: 'A&S → McIntire transfer is more accessible path. Curry School of Education is solid and more accessible. The Honor Code and student governance actually create unique community.',
        redditWisdom: 'AOs emphasize: "Show us you understand and value UVA\'s traditions." The Honor Code, Lawn, and student self-governance genuinely matter. McIntire transfers are common and successful.',
        strategyTips: 'Apply A&S if interested in business — transfer to McIntire sophomore year is more accessible. Use ED if UVA is top choice (~28-32% vs 14-16%). Reference Honor Code and UVA traditions specifically.',
      },
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
      essayStrategy: 'Show North Carolina connections if applicable. The short-answer essays should demonstrate community involvement, intellectual curiosity, and why UNC\'s specific culture appeals to you.',
      programs: {
        totalMajors: 150,
        popularMajors: ['Business Administration', 'Biology', 'Psychology', 'Economics', 'Computer Science'],
        uniquePrograms: 'Kenan-Flagler Business School is top-tier (no direct admit for undergrads, apply sophomore year). Strong research opportunities. Hussman School of Journalism is excellent. Nursing program.',
        curriculumHighlights: 'General College requires broad exploration. Declare major later. Strong emphasis on research and service. Carolina Covenant provides exceptional financial aid. First-year seminars build community.',
        preMedPath: 'Good pre-med program (~7% of students). UNC School of Medicine on campus (graduate). Strong pre-med advising. Excellent biology curriculum.',
        preBusinessPath: 'Kenan-Flagler Business School — top undergrad program. NO direct admit to business — all students apply sophomore year from General College. Internal acceptance is ~20-25% of applicants.',
        engineeringPath: 'Solid engineering program. Applied sciences and engineering options available.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'General College (all freshmen)',
            acceptanceRate: '17%',
            notes: 'All first-year students enter General College. Declare major sophomore year.'
          },
          {
            name: 'Kenan-Flagler School of Business',
            acceptanceRate: '20-25% (internal)',
            notes: 'Top business school. NO direct admit for undergrads. All students apply sophomore year. Competitive internal application.'
          },
          {
            name: 'Hussman School of Journalism',
            acceptanceRate: '30% (internal)',
            notes: 'Excellent journalism program. Internal transfer sophomore year.'
          },
          {
            name: 'School of Nursing',
            acceptanceRate: '25-30%',
            notes: 'Nursing program. Direct admit available for some applicants.'
          }
        ],
        internalTransfers: 'Kenan-Flagler internal transfer is ~20-25% for business majors — competitive. Journalism internal transfer is ~30%. Good internal transfer system for other programs.',
        dualDegreePrograms: 'Kenan-Flagler/other major combinations possible. Most students focus on single major.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'UNC is required by NC law to admit 82% in-state. Out-of-state acceptance is ~12% (extremely competitive). NO direct admit to Kenan-Flagler — all business students apply sophomore year.',
        commonMistakes: 'Out-of-state applicants underestimating selectivity (~12% acceptance). Expecting to directly admit to business (doesn\'t exist). Not knowing about internal transfer process.',
        hiddenGems: 'Carolina Covenant is one of most generous public school financial aid programs (families <$62K pay $0). Kenan-Flagler internal transfer is ~20-25% (more accessible than other schools\' direct admits). Research opportunities exceptional.',
        redditWisdom: 'AOs emphasize: "Show us why you\'re excited about UNC specifically." In-state vs out-of-state disparity is real — out-of-state must be strategic. "Carolina Covenant is genuinely generous."',
        strategyTips: 'Out-of-state: treat UNC as reach school (~12% acceptance). In-state with EA can reach ~36%. Don\'t expect Kenan-Flagler direct admit — apply sophomore year (all do). Reference NC connections if applicable.',
      },
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
      essayStrategy: 'Show quantitative/analytical thinking even for non-STEM majors. GT wants problem-solvers.',
      programs: {
        totalMajors: 150,
        popularMajors: ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Engineering Science', 'Business Administration'],
        uniquePrograms: 'CS is one of the best in the nation (top 5). Engineering programs are world-class across all disciplines. Ivan Allen College (Liberal Arts/International Affairs) is strong. Strong business and management programs.',
        curriculumHighlights: 'Core curriculum is rigorous with emphasis on math/physics. Extensive research opportunities. Atlanta location provides internship access. Entrepreneurship and innovation emphasized.',
        preMedPath: 'Rare pre-med path (~3% of students). Georgia Tech is STEM/engineering focused, not pre-med oriented.',
        preBusinessPath: 'Scheller College of Business offers business majors. Not top-tier business school but solid consulting recruiting.',
        engineeringPath: 'World-class engineering across all disciplines. CS program is in College of Computing (separate). Exceptional research opportunities.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'College of Computing (Computer Science)',
            acceptanceRate: '8-10%',
            notes: 'Top 5 CS program nationally. Extremely selective. Separate from engineering.'
          },
          {
            name: 'College of Engineering',
            acceptanceRate: '15-20%',
            notes: 'World-class across all disciplines. Mechanical, electrical, chemical, civil, aerospace.'
          },
          {
            name: 'Ivan Allen College (Liberal Arts & Sciences)',
            acceptanceRate: '25-30%',
            notes: 'International affairs, public policy, humanities. Most accessible school.'
          },
          {
            name: 'Scheller College of Business',
            acceptanceRate: '20-25%',
            notes: 'Business administration and management. Consulting recruiting.'
          }
        ],
        internalTransfers: 'Very competitive especially into CS. Internal transfers to engineering exist but challenging. Better to choose right school initially.',
        dualDegreePrograms: 'Engineering/Science combinations possible. CS/Engineering dual degree available but rare.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Georgia Tech CS is harder to get into than most Ivies (~8-10%). In-state vs out-of-state disparity is significant. HOPE/Zell Miller scholarships make it free for GA residents who qualify.',
        commonMistakes: 'Out-of-state applicants underestimating Georgia Tech selectivity. Expecting to transfer into CS after admitting for different major (very competitive).',
        hiddenGems: 'Ivan Allen College (Liberal Arts) is 25-30% acceptance — more accessible GT education. HOPE/Zell Miller scholarships are extremely generous for GA residents. Atlanta tech ecosystem is powerful.',
        redditWisdom: 'AOs emphasize: "Show us your quantitative thinking and problem-solving." Atlanta location matters. CS internal transfers are extremely competitive.',
        strategyTips: 'Apply EA for advantage. If CS-interested but concerned about acceptance, consider different major (but internal transfer is also hard). Out-of-state: treat as reach school.',
      },
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
      essayStrategy: 'Apply A topics show leadership and responsibility. Topic B should be unique personal story. UT values Texas connections and community impact.',
      programs: {
        totalMajors: 170,
        popularMajors: ['Computer Science', 'Business Administration', 'Engineering', 'Biology', 'Economics'],
        uniquePrograms: 'CS program is one of the best in nation (top 5). McCombs Business School is top-tier. Cockrell Engineering is excellent. Strong across sciences and liberal arts.',
        curriculumHighlights: 'Flexible curriculum. Declare major after freshman year. Exceptional research opportunities. Austin tech/startup ecosystem. Student organizations are outstanding.',
        preMedPath: 'Good pre-med program (~8% of students). UT Dell Medical School on campus (very new, opening 2016). Strong pre-med advising. Excellent biology curriculum.',
        preBusinessPath: 'McCombs Business School — top undergrad business program. Direct admit is extremely competitive (~15%). Apply to other school then internal transfer.',
        engineeringPath: 'Cockrell School of Engineering is excellent. Strong across mechanical, electrical, civil, chemical, and computer engineering.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Computer Science (within Natural Sciences)',
            acceptanceRate: '6-8%',
            notes: 'Top 5 CS program. Extremely selective. Direct admit is nearly impossible for out-of-state.'
          },
          {
            name: 'McCombs School of Business',
            acceptanceRate: '15%',
            notes: 'Top business program. Very selective. Direct admit.'
          },
          {
            name: 'Cockrell School of Engineering',
            acceptanceRate: '17%',
            notes: 'Excellent engineering. Strong across all disciplines.'
          },
          {
            name: 'College of Natural Sciences',
            acceptanceRate: '20-25%',
            notes: 'Biology, chemistry, physics, mathematics. Can declare CS after freshman year (competitive).'
          },
          {
            name: 'College of Liberal Arts',
            acceptanceRate: '40%',
            notes: 'Largest college. Most accessible entry point. Can try internal transfer later.'
          },
          {
            name: 'College of Communications',
            acceptanceRate: '20%',
            notes: 'Journalism, advertising, media studies. Solid program.'
          }
        ],
        internalTransfers: 'CS and McCombs internal transfers are competitive and being tightened. Better to apply directly or choose accessible major/school from start.',
        dualDegreePrograms: 'McCombs/Engineering combinations possible. Some dual degree pathways available.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'UT CS is one of the hardest programs in the nation to get into (~6-8%). Auto-admit (top 6% TX class) doesn\'t guarantee your major. School-specific acceptance rates vary dramatically.',
        commonMistakes: 'Expecting auto-admit guarantees CS/McCombs admission (it doesn\'t). Thinking internal transfer to CS is viable (it\'s not). Not understanding college-specific acceptance rates.',
        hiddenGems: 'Natural Sciences (20-25%) → internal CS transfer is theoretically possible but being restricted. Texas Advance Commitment (families <$65K get free tuition) is generous. Austin tech ecosystem is exceptional.',
        redditWisdom: 'AOs emphasize: "Know what school you\'re applying to." Auto-admit is real but doesn\'t lock in major. UT values Texas connections and leadership.',
        strategyTips: 'If CS-interested but concerned about acceptance, apply to Natural Sciences (20-25%). Don\'t bank on internal transfer (being tightened). Highlight Texas connections. Use Texas Advance Commitment info.',
      },
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
      essayStrategy: 'Show Gator spirit and specific program knowledge. UF values leadership, community service, and Florida connections.',
      programs: {
        totalMajors: 140,
        popularMajors: ['Business Administration', 'Engineering', 'Biology', 'Psychology', 'Computer Science'],
        uniquePrograms: 'Strong engineering program. Warrington Business is solid. CLAS offers breadth. Journalism program is well-regarded. College of Health and Human Performance.',
        curriculumHighlights: 'General Education requirements. Research opportunities available. Strong student life and traditions. Florida Bright Futures funding makes education affordable for FL students. Innovation Academy (spring/summer admits).',
        preMedPath: 'Good pre-med program (~7% of students). UF College of Medicine on campus (graduate). Strong pre-med advising. Excellent biology curriculum.',
        preBusinessPath: 'Warrington College of Business — solid business program. Consulting recruiting. Not top-tier but strong regionally.',
        engineeringPath: 'Solid engineering across mechanical, civil, electrical, and chemical engineering. Good research and internship opportunities.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Warrington College of Business',
            acceptanceRate: '15%',
            notes: 'Solid business program. AACSB accredited.'
          },
          {
            name: 'College of Engineering',
            acceptanceRate: '18%',
            notes: 'Strong engineering programs. ABET accredited.'
          },
          {
            name: 'College of Journalism & Communications',
            acceptanceRate: '22%',
            notes: 'Well-regarded journalism/communications programs.'
          },
          {
            name: 'College of Liberal Arts & Sciences (CLAS)',
            acceptanceRate: '28%',
            notes: 'Largest college. Most accessible entry point.'
          },
          {
            name: 'College of Health & Human Performance',
            acceptanceRate: '25-30%',
            notes: 'Health sciences, exercise science, physical education.'
          }
        ],
        internalTransfers: 'Possible between schools. Generally feasible with good GPA.',
        dualDegreePrograms: 'Business/Engineering combinations possible. Some dual degree pathways.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'UF is rolling admissions — apply early for advantage. Bright Futures scholarship makes it free/very cheap for FL students. 2+2 pathway with state colleges is a legitimate and often excellent strategy.',
        commonMistakes: 'Out-of-state applicants underestimating that Bright Futures makes UF attractive for FL residents. Not understanding 2+2 community college pathway (often better deal).',
        hiddenGems: 'The 2+2 pathway with Florida community colleges is genuinely strong — guaranteed admission and often leads to successful outcomes. Innovation Academy (spring/summer admits) is an unconventional but viable pathway. Bright Futures generosity.',
        redditWisdom: 'AOs emphasize: "Show Gator spirit and specific program interests." Bright Futures is genuinely generous. Rolling admissions means early application helps.',
        strategyTips: 'FL residents: apply early to maximize Bright Futures coverage. Consider 2+2 community college pathway if available — can be better financial/academic fit. Show leadership and community service.',
      },
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
      essayStrategy: 'For Grainger Engineering/CS, show strong STEM passion and specific projects. For LAS, show intellectual breadth. Mention specific programs, research opportunities, or student organizations.',
      programs: {
        totalMajors: 180,
        popularMajors: ['Computer Science', 'Engineering', 'Business Administration', 'Psychology', 'Biology'],
        uniquePrograms: 'CS program is top-5 nationally (one of best). Engineering is world-class across disciplines. Grainger School of Engineering is top-tier. Illinois Innovation Network.',
        curriculumHighlights: 'Strong general education requirements. Declare major by end of first year. Exceptional research opportunities. Engineering/business emphasis throughout. Extensive student organizations.',
        preMedPath: 'Moderate pre-med program (~6% of students). University of Illinois College of Medicine on campus (Urbana). Strong pre-med advising. Excellent biology curriculum.',
        preBusinessPath: 'Gies College of Business is solid. Not top-tier but strong consulting/finance recruiting.',
        engineeringPath: 'Grainger School of Engineering is world-class. All engineering disciplines are excellent. Strong research and internship opportunities.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Department of Computer Science (in Grainger)',
            acceptanceRate: '6-8%',
            notes: 'Top 5 CS program nationally. Extremely selective. Direct admit is nearly impossible.'
          },
          {
            name: 'Grainger School of Engineering',
            acceptanceRate: '20%',
            notes: 'World-class engineering across all disciplines. ABET accredited.'
          },
          {
            name: 'Gies College of Business',
            acceptanceRate: '30%',
            notes: 'Solid business program. AACSB accredited. Consulting recruiting.'
          },
          {
            name: 'College of Liberal Arts & Sciences (LAS)',
            acceptanceRate: '60%',
            notes: 'Largest college. Most accessible. CS+X interdisciplinary options available.'
          }
        ],
        internalTransfers: 'CS internal transfer is extremely competitive. Engineering transfers possible but challenging. LAS → other schools feasible.',
        dualDegreePrograms: 'Engineering/Business dual degrees exist. CS+X programs allow CS depth with interdisciplinary focus.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'UIUC CS is one of the hardest programs in the nation (~6-8%) — harder than most Ivies. Overall acceptance rate is 45% but school-specific rates vary dramatically.',
        commonMistakes: 'Assuming 45% overall acceptance applies to CS (it\'s 6-8%). Not understanding school-specific selectivity. Expecting LAS → Grainger CS internal transfer (very competitive).',
        hiddenGems: 'CS+X programs (interdisciplinary CS in LAS) offer better odds while still accessing CS curriculum. LAS (60%) is much more accessible entry point. Illinois Commitment covers tuition for IL residents <$67K.',
        redditWisdom: 'AOs emphasize: "Know which school you\'re applying to." UIUC CS is world-class and extremely selective. LAS offers flexibility.',
        strategyTips: 'If CS-interested, understand extreme selectivity (~6-8%). Consider CS+X in LAS for better odds. Apply EA for priority. Show STEM passion for engineering/CS programs.',
      },
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
      essayStrategy: 'Show intellectual curiosity and how you\'ll take advantage of UW\'s breadth. Mention specific programs, the Wisconsin Idea, or research opportunities.',
      programs: {
        totalMajors: 200,
        popularMajors: ['Business Administration', 'Engineering', 'Biology', 'Psychology', 'Computer Science'],
        uniquePrograms: 'Strong engineering program. Wisconsin School of Business is solid. Excellent across sciences and liberal arts. "Wisconsin Idea" emphasizes research and service to society. Strong pre-med.',
        curriculumHighlights: 'Flexible general education. Declare major by end of first year. Exceptional research opportunities. Campus beautiful on Lake Mendota. Strong student life traditions.',
        preMedPath: 'Good pre-med program (~7% of students). UW School of Medicine on campus (graduate). Strong pre-med advising. Excellent biology curriculum.',
        preBusinessPath: 'Wisconsin School of Business — solid business program. Direct admit is competitive (~25%). L&S → business transfer is feasible alternative.',
        engineeringPath: 'Strong engineering across mechanical, electrical, civil, and chemical engineering. Good research opportunities.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Wisconsin School of Business',
            acceptanceRate: '25%',
            notes: 'Solid business program. Direct admit. AACSB accredited.'
          },
          {
            name: 'College of Engineering',
            acceptanceRate: '35%',
            notes: 'Strong across mechanical, electrical, civil, chemical engineering.'
          },
          {
            name: 'College of Letters & Science',
            acceptanceRate: '55%',
            notes: 'Largest college. Most accessible. Can transfer to business or engineering with good GPA.'
          },
          {
            name: 'School of Nursing',
            acceptanceRate: '30%',
            notes: 'Nursing program. ACEN accredited.'
          }
        ],
        internalTransfers: 'L&S → Business transfer is possible but competitive. Engineering transfers available. Generally more feasible than at top universities.',
        dualDegreePrograms: 'Business/Engineering combinations possible. Some dual degree pathways.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Wisconsin uses EA (Early Action) — acceptance jumps to ~60% vs ~49% regular. Direct admit to business is competitive (~25%) but less so than peer schools.',
        commonMistakes: 'Not using EA when it offers significant advantage (~60% vs ~49%). Assuming 49% acceptance applies to business/engineering when rates vary.',
        hiddenGems: 'Bucky\'s Tuition Promise (WI residents <$60K get free tuition). L&S → Business transfer is more accessible than direct admit. Madison is an exceptional college town.',
        redditWisdom: 'AOs emphasize: "Show intellectual curiosity and how you\'ll engage with UW community." Wisconsin Idea matters. Madison\'s culture is unique.',
        strategyTips: 'Use EA for advantage (~60% acceptance). If business-interested, apply L&S and transfer (more accessible than direct admit). WI residents: leverage Bucky\'s Tuition Promise.',
      },
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
      essayStrategy: 'For Engineering/CS, show passion for the specific field and reference Purdue\'s research strengths. Mention the tuition freeze and value proposition as evidence you\'ve done your research.',
      programs: {
        totalMajors: 200,
        popularMajors: ['Engineering', 'Computer Science', 'Business Administration', 'Biology', 'Agriculture'],
        uniquePrograms: 'Strong engineering across all disciplines. CS program is excellent. Krannert Business School is solid. Agricultural engineering and agricultural sciences. Polytechnic Institute.',
        curriculumHighlights: 'General Education requirements. Declare major in freshman or sophomore year. Strong research opportunities. Frozen tuition since 2012 (no increases). Innovation ecosystem.',
        preMedPath: 'Moderate pre-med program (~6% of students). Purdue School of Pharmacy and Pharmaceutical Sciences on campus (graduate). Strong pre-med advising. Good biology curriculum.',
        preBusinessPath: 'Krannert School of Business is solid. Business/Engineering combinations strong. Management/engineering dual tracks available.',
        engineeringPath: 'Strong engineering across mechanical, electrical, civil, chemical, and computer engineering. Research-focused. Good internship opportunities.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Department of Computer Science',
            acceptanceRate: '18-22%',
            notes: 'Strong CS program. More accessible than top-tier competitors.'
          },
          {
            name: 'College of Engineering',
            acceptanceRate: '40%',
            notes: 'Strong across all engineering disciplines. ABET accredited.'
          },
          {
            name: 'Krannert School of Business',
            acceptanceRate: '45%',
            notes: 'Solid business program. AACSB accredited.'
          },
          {
            name: 'Polytechnic Institute',
            acceptanceRate: '50-55%',
            notes: 'More accessible engineering pathway. Can transition to main engineering with performance.'
          },
          {
            name: 'College of Liberal Arts',
            acceptanceRate: '70%',
            notes: 'Most accessible entry point.'
          }
        ],
        internalTransfers: 'Possible between schools. Liberal Arts → Engineering transfers feasible. Generally more accessible than peer universities.',
        dualDegreePrograms: 'Engineering/Business dual degree programs available. Engineering management pathways.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Purdue CS/Engineering are much more selective (18-40%) than overall 53% acceptance suggests. Frozen tuition since 2012 is a major financial advantage.',
        commonMistakes: 'Assuming 53% acceptance applies to engineering/CS (it doesn\'t). Not understanding frozen tuition advantage. Not using EA.',
        hiddenGems: 'Purdue Promise covers tuition for families <$60K. Frozen tuition since 2012 is exceptional value long-term. Polytechnic Institute is accessible alternative to main engineering.',
        redditWisdom: 'AOs emphasize: "Purdue is value-focused." Frozen tuition matters. Engineering students build strong networks.',
        strategyTips: 'Use EA for advantage (~65% vs 53%). If engineering-interested but concerned, consider Polytechnic Institute. Highlight long-term value with frozen tuition.',
      },
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
      essayStrategy: 'Short-answer format. Show connection to Pacific Northwest values, intellectual curiosity, and specific UW programs. Mention research opportunities and Seattle\'s tech ecosystem.',
      programs: {
        totalMajors: 160,
        popularMajors: ['Computer Science', 'Engineering', 'Business Administration', 'Biology', 'Psychology'],
        uniquePrograms: 'CS program is top-tier (top 10). Engineering is excellent. Foster School of Business is solid. Strong research focus. Seattle tech ecosystem.',
        curriculumHighlights: 'General Education requirements. Declare major in freshman/sophomore year. Exceptional research opportunities. Access to tech companies (Google, Amazon, Microsoft). Strong internship market.',
        preMedPath: 'Good pre-med program (~6% of students). UW School of Medicine on campus (graduate, primary care focus). Strong pre-med advising. Excellent biology curriculum.',
        preBusinessPath: 'Foster School of Business — solid business program. CS + business combinations strong. Tech industry recruiting.',
        engineeringPath: 'Strong engineering across mechanical, electrical, civil, and computer engineering. Seattle tech ecosystem provides internships.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Paul G. Allen School of Computer Science & Engineering',
            acceptanceRate: '8-10%',
            notes: 'Top 10 CS program. Extremely selective. Direct admit is nearly impossible.'
          },
          {
            name: 'College of Engineering',
            acceptanceRate: '25%',
            notes: 'Strong across all engineering disciplines.'
          },
          {
            name: 'Foster School of Business',
            acceptanceRate: '20%',
            notes: 'Solid business program. AACSB accredited.'
          },
          {
            name: 'College of Arts & Sciences',
            acceptanceRate: '55%',
            notes: 'Largest college. Most accessible. Can apply for CS major sophomore year (competitive).'
          }
        ],
        internalTransfers: 'CS major application sophomore year is competitive. Engineering transfers possible. A&S → other school feasible.',
        dualDegreePrograms: 'Engineering/Business combinations possible. CS/Math dual tracks available.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'UW CS is among hardest admits in nation (~8-10%). Overall 48% acceptance is misleading — major-specific rates vary dramatically. Rolling admissions means early application helps.',
        commonMistakes: 'Assuming 48% applies to CS/engineering (it doesn\'t). Expecting A&S → CS major application is viable (very competitive). Not applying early.',
        hiddenGems: 'Husky Promise (WA residents <$65K get free tuition) is generous. Informatics major offers CS-adjacent path. Seattle tech ecosystem is extraordinary for internships/jobs.',
        redditWisdom: 'AOs emphasize: "UW values service and community engagement." Seattle location matters. Tech ecosystem is huge advantage.',
        strategyTips: 'Apply early (rolling admissions). If CS-interested, understand extreme selectivity. Consider Informatics major for better odds. WA residents: use Husky Promise.',
      },
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
      essayStrategy: 'Show Hokie spirit. Reference Ut Prosim (That I May Serve) and specific programs. VT values community, service, and hands-on learning.',
      programs: {
        totalMajors: 140,
        popularMajors: ['Engineering', 'Computer Science', 'Business Administration', 'Biology', 'Agriculture'],
        uniquePrograms: 'Top-tier engineering program across all disciplines. CS program increasingly competitive. Strong agricultural sciences and natural resources. Corps of Cadets provides leadership development.',
        curriculumHighlights: 'Strong core curriculum emphasis on service ("Ut Prosim — That I May Serve"). Declare major by sophomore year. Hands-on learning with research opportunities. Corps of Cadets optional leadership track.',
        preMedPath: 'Moderate pre-med program (~6% of students). Virginia Tech Carilion School of Medicine on campus (graduate, integrated program). Good pre-med advising.',
        preBusinessPath: 'Pamplin College of Business is solid. Not top-tier but good recruiting for consulting/finance.',
        engineeringPath: 'Top-tier engineering across mechanical, electrical, civil, aerospace, and computer engineering. Strong research opportunities.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Department of Computer Science',
            acceptanceRate: '30%',
            notes: 'Increasingly competitive. Strong program.'
          },
          {
            name: 'College of Engineering',
            acceptanceRate: '45%',
            notes: 'Top-tier across all disciplines. ABET accredited.'
          },
          {
            name: 'Pamplin College of Business',
            acceptanceRate: '50%',
            notes: 'Solid business program. AACSB accredited.'
          },
          {
            name: 'College of Liberal Arts & Human Sciences',
            acceptanceRate: '65%',
            notes: 'Largest college. Includes agriculture, natural resources.'
          },
          {
            name: 'College of Agriculture & Life Sciences',
            acceptanceRate: '70%',
            notes: 'Agricultural sciences, forestry, natural resources. Most accessible.'
          }
        ],
        internalTransfers: 'Possible between schools. Engineering transfers competitive. Liberal arts transfers more feasible.',
        dualDegreePrograms: 'Engineering/Business combinations possible. Agricultural/environmental science dual tracks.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Virginia Tech engineering is much more selective (45%) than overall 57% acceptance suggests. Corps of Cadets provides unique military-style leadership development (optional). ED acceptance jumps to ~70-75% vs 50% regular.',
        commonMistakes: 'Assuming 57% applies to engineering/CS. Not understanding Hokie/Ut Prosim culture matters. Overlooking Corps of Cadets as differentiator.',
        hiddenGems: 'Corps of Cadets (optional) creates unique leadership development and tight community. Agricultural programs are overlooked but strong. Liberal Arts provides accessible entry with transfer options.',
        redditWisdom: 'AOs emphasize: "We value Hokie spirit and community service." Ut Prosim and hands-on learning genuinely important. Corps provides unique experience.',
        strategyTips: 'Use ED if VT is top choice (~70-75% vs 50%). Show Hokie spirit and service orientation. If engineering-interested, understand higher selectivity. Consider Corps of Cadets.',
      },
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
      essayStrategy: 'Show alignment with Aggie values — selfless service, integrity, respect, excellence. A&M cares deeply about tradition and community. Reference specific programs and the Core Values.',
      programs: {
        totalMajors: 150,
        popularMajors: ['Engineering', 'Business Administration', 'Agriculture', 'Computer Science', 'Biology'],
        uniquePrograms: 'One of largest engineering schools in nation. Strong across all disciplines. Mays Business School is solid. Agricultural engineering and sciences are distinctive. Corps of Cadets leadership program.',
        curriculumHighlights: 'Strong core curriculum with Aggie values (selfless service, integrity, respect, excellence). Declare major by sophomore year. Hands-on learning. Corps of Cadets optional leadership development. Strong traditions.',
        preMedPath: 'Moderate pre-med program (~6% of students). Texas A&M College of Medicine on campus (graduate). Strong pre-med advising. Good biology curriculum.',
        preBusinessPath: 'Mays College of Business — solid business program. Direct admit competitive (~25%). Consulting and finance recruiting.',
        engineeringPath: 'One of the largest engineering schools. Excellent across all disciplines. Strong research and internship opportunities.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Mays Business School',
            acceptanceRate: '25%',
            notes: 'Solid business program. Direct admit. AACSB accredited.'
          },
          {
            name: 'College of Engineering',
            acceptanceRate: '35%',
            notes: 'One of largest in nation. Strong across all disciplines. ABET accredited.'
          },
          {
            name: 'Department of Computer Science',
            acceptanceRate: '25-30%',
            notes: 'Increasingly competitive. Good program.'
          },
          {
            name: 'College of Liberal Arts',
            acceptanceRate: '75%',
            notes: 'Most accessible entry point.'
          },
          {
            name: 'College of Agriculture & Life Sciences',
            acceptanceRate: '70%',
            notes: 'Agricultural engineering, sciences, natural resources. Strong programs.'
          }
        ],
        internalTransfers: 'Possible between schools. Generally more feasible than peer universities.',
        dualDegreePrograms: 'Engineering/Business combinations possible. Agricultural/environmental science dual tracks.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'A&M is known for strong traditions and values (Aggie Code). Corps of Cadets (optional) is unique differentiator. Aggie Network is one of most powerful alumni networks. Rolling admissions means apply early.',
        commonMistakes: 'Not understanding A&M\'s strong cultural/values focus. Underestimating power of Aggie Network. Not emphasizing service/integrity in essays.',
        hiddenGems: 'Aggie Assurance (families <$60K get free tuition). Corps of Cadets optional but creates tremendous value/network. Agricultural programs are excellent. Tradition and community are genuine assets.',
        redditWisdom: 'AOs emphasize: "A&M values service, integrity, and tradition." Aggie Core Values genuinely matter. Whip Rule and traditions are real.',
        strategyTips: 'Show Aggie values alignment (selfless service, integrity, respect, excellence). Reference specific programs and traditions. Consider Corps of Cadets for leadership development. TX residents: use Aggie Assurance.',
      },
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
      essayStrategy: 'Reference the Research Triangle, specific labs, and industry partnerships. Show you understand NC State\'s practical, applied approach to education.',
      programs: {
        totalMajors: 130,
        popularMajors: ['Engineering', 'Computer Science', 'Business Administration', 'Biology', 'Psychology'],
        uniquePrograms: 'Top-tier engineering program across all disciplines. Strong CS program. Poole College of Management is solid. Research Triangle location. Co-op programs integrated.',
        curriculumHighlights: 'Strong general education. Declare major by sophomore year. Co-op programs in many majors. Research Triangle provides exceptional internship/career access. Student-focused culture.',
        preMedPath: 'Moderate pre-med program (~6% of students). UNC School of Medicine and Duke School of Medicine nearby in Research Triangle. Good pre-med advising.',
        preBusinessPath: 'Poole College of Management — solid business program. Research Triangle recruiting opportunities. AACSB accredited.',
        engineeringPath: 'Top-tier engineering across mechanical, electrical, civil, aerospace, and chemical. Co-op programs. Strong internship/job market.',
      },
      schoolStructure: {
        hasMultipleSchools: true,
        schools: [
          {
            name: 'Department of Computer Science',
            acceptanceRate: '20%',
            notes: 'Strong CS program. Top in region.'
          },
          {
            name: 'College of Engineering',
            acceptanceRate: '35%',
            notes: 'Top-tier across all disciplines. ABET accredited.'
          },
          {
            name: 'Poole College of Management',
            acceptanceRate: '40%',
            notes: 'Solid business program. AACSB accredited.'
          },
          {
            name: 'College of Humanities & Social Sciences (CHASS)',
            acceptanceRate: '60%',
            notes: 'Most accessible entry point.'
          }
        ],
        internalTransfers: 'Possible between schools. Generally more feasible than peer universities.',
        dualDegreePrograms: 'Engineering/Business combinations possible. CS/Math dual tracks.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'NC State CS and Engineering are excellent but less selective than peer institutions. Research Triangle location is major advantage for internships/careers. Pack Promise generous for NC residents.',
        commonMistakes: 'Overlooking NC State due to perceived lower prestige (programs are genuinely strong). Not leveraging Research Triangle connections.',
        hiddenGems: 'Research Triangle (UNC, Duke, NC State) creates unmatched career opportunity. Co-op programs provide real work experience. Pack Promise (NC residents <$60K get free tuition).',
        redditWisdom: 'AOs emphasize: "NC State values practical, applied learning." Research Triangle is huge advantage. Industry partnerships are exceptional.',
        strategyTips: 'Use EA for advantage (~55% vs 47%). Reference Research Triangle location and internship opportunities. NC residents: leverage Pack Promise. Strong value proposition overall.',
      },
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
      essayStrategy: 'Show genuine love for learning and intellectual curiosity. Reference the tutorial system, Winter Study term, and specific professors. Williams values students who will contribute to a small, close-knit community.',
      programs: {
        totalMajors: 45,
        popularMajors: ['Economics', 'History', 'Mathematics', 'English', 'Biology'],
        uniquePrograms: 'Tutorial system (unique to Williams — 2 students + 1 professor seminars). Winter Study term (one-month January term for specialized courses). Open curriculum (no core requirements). Exceptional faculty engagement.',
        curriculumHighlights: 'Open curriculum — no requirements, students design education. Tutorial system emphasizes discussion/writing. Winter Study term offers specialized topics. Faculty accessibility is exceptional. Small class sizes (highest in nation).',
        preMedPath: 'Strong pre-med program (~10-12% of students). Excellent biology and chemistry programs. Strong pre-med advising. Outstanding placement to medical schools.',
        preBusinessPath: 'No dedicated business school. Economics major is strong preparation. Finance/economics pathway available.',
        engineeringPath: 'No engineering school. Physics and mathematics are strong.',
      },
      schoolStructure: {
        hasMultipleSchools: false,
        schools: [
          {
            name: 'Williams College (single admissions)',
            acceptanceRate: '9%',
            notes: 'All students admitted to same college. No separate schools. ~550 students per class.'
          }
        ],
        internalTransfers: 'No internal transfers — single admissions pool.',
        dualDegreePrograms: 'No dual degrees. Open curriculum allows broad customization.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Williams ED is extraordinarily powerful (~30-35% vs 6% RD). Tutorial system is genuinely unique and differentiating. Winter Study term allows deep specialization.',
        commonMistakes: 'Not using ED when advantage is massive. Not mentioning tutorial system/Winter Study in essays. Underestimating appeal of open curriculum.',
        hiddenGems: 'Open curriculum means infinite customization and no distribution requirements (unlike most LACs). Tutorial system creates rare depth of faculty engagement. Winter Study allows pursuing niche interests.',
        redditWisdom: 'AOs emphasize: "Show us you\'ll thrive in our academic culture." Tutorial system and open curriculum genuinely matter. Close-knit community is central.',
        strategyTips: 'Use ED if Williams is top choice (~30-35% vs 6% RD). Reference tutorial system and Winter Study specifically. Show intellectual curiosity. Emphasize fit with close-knit community.',
      },
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
      essayStrategy: 'Show intellectual independence and self-direction. Reference the open curriculum and how you\'d design your education. The Five College Consortium is a unique selling point to mention.',
      programs: {
        totalMajors: 50,
        popularMajors: ['Economics', 'English', 'History', 'Mathematics', 'Biology'],
        uniquePrograms: 'Open curriculum (no core requirements — unique among top LACs). Five College Consortium allows courses at UMass, Smith, Hampshire, Mt. Holyoke. Exceptional faculty access.',
        curriculumHighlights: 'Radical open curriculum — no requirements, no general education. Students design entire education. Five College Consortium provides university-scale course options. Small classes and exceptional faculty mentorship.',
        preMedPath: 'Strong pre-med program (~12% of students). Excellent biology and chemistry. Strong pre-med advising and medical school placement.',
        preBusinessPath: 'No dedicated business school. Economics major strong. Finance/economics pathway available.',
        engineeringPath: 'No engineering school. Physics and mathematics strong.',
      },
      schoolStructure: {
        hasMultipleSchools: false,
        schools: [
          {
            name: 'Amherst College (single admissions)',
            acceptanceRate: '7%',
            notes: 'Single admissions pool. ~430 students per class. Five College Consortium access.'
          }
        ],
        internalTransfers: 'No internal transfers — single admissions pool.',
        dualDegreePrograms: 'No dual degrees. Open curriculum allows infinite customization.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Amherst open curriculum is genuinely radical — literally no requirements at all. Five College Consortium gives unmatched flexibility/breadth. ED advantage is significant (~25-30% vs 5% RD).',
        commonMistakes: 'Underestimating appeal of open curriculum. Not mentioning Five College Consortium. Assuming LAC = less selective than Ivies (Amherst is peer to Ivies).',
        hiddenGems: 'Open curriculum is rarer than you\'d think — Brown has requirements, most LACs require distribution. Five College Consortium effectively gives university-scale options. Class of ~430 means real access to faculty/community.',
        redditWisdom: 'AOs emphasize: "Show intellectual self-direction." Open curriculum truly appeals to independent thinkers. Amherst values intellectual curiosity and community engagement.',
        strategyTips: 'Use ED if Amherst is top choice (~25-30% vs 5% RD). Highlight open curriculum appeal in essays. Reference Five College options. Show intellectual independence.',
      },
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
      essayStrategy: 'Reference the Consortium advantage, specific courses across the 5C schools, and California\'s unique environment. Show why a small school in Southern California is your ideal fit.',
      programs: {
        totalMajors: 46,
        popularMajors: ['Economics', 'Biology', 'English', 'History', 'Mathematics'],
        uniquePrograms: 'Claremont Consortium (5C) allows access to world-class courses at Harvey Mudd, CMC, Scripps, Pitzer, Pomona. Open curriculum (no core requirements). Exceptional faculty engagement.',
        curriculumHighlights: 'Open curriculum with no requirements. Claremont Consortium gives university-scale course catalog (essentially 5 institutions). Small classes and outstanding faculty. Southern CA location for internships/research.',
        preMedPath: 'Strong pre-med program (~12% of students). Excellent biology and chemistry. Strong pre-med advising. Consortium access to specialized science courses at Harvey Mudd.',
        preBusinessPath: 'No dedicated business school. Economics major is strong. Consortium access to CMC business courses.',
        engineeringPath: 'No engineering at Pomona but can take engineering courses at Harvey Mudd through Consortium.',
      },
      schoolStructure: {
        hasMultipleSchools: false,
        schools: [
          {
            name: 'Pomona College (single admissions)',
            acceptanceRate: '7%',
            notes: 'Single admissions pool. ~380 students per class. Claremont Consortium access (5C schools).'
          }
        ],
        internalTransfers: 'No internal transfers — single admissions pool.',
        dualDegreePrograms: 'No dual degrees. Open curriculum + Consortium provides extensive flexibility.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Pomona\'s Claremont Consortium is genuinely valuable — essentially 5 institutions for course selection. Open curriculum means no requirements. ED advantage is solid (~18-22% vs 5% RD).',
        commonMistakes: 'Underestimating Consortium value. Not understanding Southern CA location advantages. Overlooking Pomona\'s financial aid generosity.',
        hiddenGems: 'Claremont Consortium + open curriculum is unmatched combination — LAC community + university-scale resources. Harvey Mudd science/engineering courses accessible. SoCal location for internships/research.',
        redditWisdom: 'AOs emphasize: "Show us you\'ll thrive in our collaborative community." Consortium truly matters. Southern CA environment is differentiating.',
        strategyTips: 'Use ED if Pomona is top choice (~18-22% vs 5% RD). Reference Consortium specifically. Highlight SoCal location advantages. Show collaborative spirit.',
      },
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
      essayStrategy: 'Show you value community and the liberal arts. Reference Bowdoin\'s specific offerings and why Maine\'s environment appeals to you. Be authentic and personal.',
      programs: {
        totalMajors: 50,
        popularMajors: ['Economics', 'English', 'History', 'Mathematics', 'Biology'],
        uniquePrograms: 'Test-optional pioneer since 1969. Open curriculum (no core requirements). Exceptional food services (dining is famous). Outdoor emphasis (Maine location). Small residential community.',
        curriculumHighlights: 'Open curriculum with no requirements. Maine location emphasizes outdoor learning/research. First-year seminars build community. Outstanding faculty access. Residential college experience.',
        preMedPath: 'Strong pre-med program (~10-12% of students). Excellent biology and chemistry. Strong pre-med advising. Great pre-med placement.',
        preBusinessPath: 'No dedicated business school. Economics major strong.',
        engineeringPath: 'No engineering school. Physics and mathematics strong.',
      },
      schoolStructure: {
        hasMultipleSchools: false,
        schools: [
          {
            name: 'Bowdoin College (single admissions)',
            acceptanceRate: '8.5%',
            notes: 'Single admissions pool. ~500 students per class. Test-optional since 1969.'
          }
        ],
        internalTransfers: 'No internal transfers — single admissions pool.',
        dualDegreePrograms: 'No dual degrees. Open curriculum allows customization.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Bowdoin test-optional since 1969 (predecessor to modern test-optional movement). ED advantage very strong (~25-30% vs 5-6% RD). Food services genuinely legendary.',
        commonMistakes: 'Not using ED when advantage is significant. Underestimating Maine location appeal. Assuming test scores must be submitted.',
        hiddenGems: 'Test-optional pioneer — ideal for strong applicants with weak standardized test scores. Maine location creates tight community and outdoor culture. Dining services are genuinely top-notch.',
        redditWisdom: 'AOs emphasize: "We value community and service." Test-optional is genuine (not performative). Maine culture matters.',
        strategyTips: 'Use ED if Bowdoin is top choice (~25-30% vs 5-6% RD). Consider test-optional route if scores don\'t reflect ability. Highlight outdoor interests or Maine connection.',
      },
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
      essayStrategy: 'Show intellectual depth and genuine academic passion. Reference the Honors Program, specific departments, and the Tri-College Consortium. Swarthmore values students who love learning deeply.',
      programs: {
        totalMajors: 45,
        popularMajors: ['Engineering', 'Biology', 'Economics', 'Chemistry', 'Mathematics'],
        uniquePrograms: 'Honors Program (unique in American higher ed — small seminars with external examiners). ABET-accredited engineering (rare for LAC). Tri-College Consortium with Haverford/Bryn Mawr. Most academically intense LAC.',
        curriculumHighlights: 'Honors seminars (junior/senior) with external examiners. Regular seminars junior/senior years. Exceptional research opportunities. Tri-College access. Most rigorous academics among LACs.',
        preMedPath: 'Excellent pre-med program (~12-14% of students). Outstanding biology and chemistry. Strong pre-med advising and medical school placement. Most rigorous pre-med curriculum.',
        preBusinessPath: 'No dedicated business school. Economics major strong.',
        engineeringPath: 'Accredited engineering program (ABET). Civil, electrical, mechanical engineering. Unique strength for LAC.',
      },
      schoolStructure: {
        hasMultipleSchools: false,
        schools: [
          {
            name: 'Swarthmore College (single admissions)',
            acceptanceRate: '7%',
            notes: 'Single admissions pool. ~380 students per class. Tri-College Consortium access.'
          }
        ],
        internalTransfers: 'No internal transfers — single admissions pool.',
        dualDegreePrograms: 'No dual degrees. Open curriculum allows customization.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Swarthmore is academically most intense LAC. Honors Program is genuinely unique (external examiners). ABET engineering at LAC is rare. ED advantage strong (~22-28% vs 5% RD).',
        commonMistakes: 'Underestimating academic rigor (Swarthmore is known for intensity). Not understanding Honors Program significance. Assuming all LACs are equally selective.',
        hiddenGems: 'Honors Program with external examiners is unique intellectual experience. ABET engineering is rare at LAC level. Tri-College Consortium adds resources. Most rigorous LAC academics.',
        redditWisdom: 'AOs emphasize: "Show genuine intellectual passion." Swarthmore values deep learning and intensity. Honors Program is differentiating.',
        strategyTips: 'Use ED if Swarthmore is top choice (~22-28% vs 5% RD). Show intellectual depth and academic passion. Reference Honors Program. Understand academic intensity.',
      },
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
      essayStrategy: 'Show why a women\'s college appeals to you specifically. Reference MIT cross-registration if STEM-interested. Wellesley values leadership, intellectual ambition, and community contribution.',
      programs: {
        totalMajors: 60,
        popularMajors: ['Economics', 'Biology', 'Mathematics', 'English', 'Political Science'],
        uniquePrograms: 'MIT cross-registration (take MIT courses while at Wellesley). All-women\'s college with strong alumnae network. Science programs enhanced by MIT access. Davis Degree program (non-traditional).',
        curriculumHighlights: 'Open curriculum with some degree of choice. Exceptional science programs (enhanced by MIT access). First-year experiences. MIT courses accessible. Strong women\'s leadership emphasis.',
        preMedPath: 'Excellent pre-med program (~12% of students). Strong biology and chemistry. MIT science courses available. Outstanding pre-med placement.',
        preBusinessPath: 'No dedicated business school. Economics major strong. MIT Sloan courses accessible for interested students.',
        engineeringPath: 'No engineering at Wellesley but can take engineering courses at MIT. MIT connection provides extraordinary STEM access.',
      },
      schoolStructure: {
        hasMultipleSchools: false,
        schools: [
          {
            name: 'Wellesley College (single admissions)',
            acceptanceRate: '13%',
            notes: 'Single admissions pool. ~600 students per class. MIT cross-registration available.'
          }
        ],
        internalTransfers: 'No internal transfers — single admissions pool.',
        dualDegreePrograms: 'No dual degrees. MIT cross-registration provides flexibility.',
      },
      communityIntel: {
        source: 'r/ApplyingToCollege, College Confidential, Reddit',
        admissionsQuirks: 'Wellesley + MIT cross-registration is genuinely powerful (LAC + world-class STEM access). Women\'s college identity is central to mission. Alumnae network is extraordinarily strong (Hillary, Madeleine Albright, etc.).',
        commonMistakes: 'Assuming women\'s college is limiting (it\'s empowering and creates strong sisterhood). Underestimating MIT cross-registration value. Not understanding alumnae network strength.',
        hiddenGems: 'MIT cross-registration is unmatched advantage — take courses at top engineering/CS school while getting LAC experience. Women\'s college creates leadership opportunities for women. Alumnae network is elite.',
        redditWisdom: 'AOs emphasize: "Understand what it means to be part of a women\'s college." MIT access genuinely matters for STEM. Alumnae network matters.',
        strategyTips: 'Use ED if Wellesley is top choice (~30-35% vs 10% RD). If STEM-interested, emphasize MIT cross-registration. Reference women\'s leadership and empowerment.',
      },
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

    // Add programs section if available
    if (school.programs) {
      md += `#### Program Information\n\n`;
      md += `**Total Majors:** ${school.programs.totalMajors || 'N/A'}\n\n`;
      if (school.programs.popularMajors) {
        md += `**Popular Majors:** ${Array.isArray(school.programs.popularMajors) ? school.programs.popularMajors.join(', ') : school.programs.popularMajors}\n\n`;
      }
      if (school.programs.uniquePrograms) {
        md += `**Unique Programs:** ${school.programs.uniquePrograms}\n\n`;
      }
      if (school.programs.curriculumHighlights) {
        md += `**Curriculum Highlights:** ${school.programs.curriculumHighlights}\n\n`;
      }
      if (school.programs.preMedPath) {
        md += `**Pre-Med Path:** ${school.programs.preMedPath}\n\n`;
      }
      if (school.programs.preBusinessPath) {
        md += `**Pre-Business Path:** ${school.programs.preBusinessPath}\n\n`;
      }
      if (school.programs.engineeringPath) {
        md += `**Engineering Path:** ${school.programs.engineeringPath}\n\n`;
      }
    }

    // Add school structure section if available
    if (school.schoolStructure) {
      md += `#### School Structure\n\n`;
      md += `**Multiple Schools:** ${school.schoolStructure.hasMultipleSchools ? 'Yes' : 'No'}\n\n`;
      if (school.schoolStructure.schools && school.schoolStructure.schools.length > 0) {
        for (const subschool of school.schoolStructure.schools) {
          md += `- **${subschool.name}** (${subschool.acceptanceRate || 'varies'}): ${subschool.notes}\n`;
        }
        md += `\n`;
      }
      if (school.schoolStructure.internalTransfers) {
        md += `**Internal Transfers:** ${school.schoolStructure.internalTransfers}\n\n`;
      }
      if (school.schoolStructure.dualDegreePrograms) {
        md += `**Dual Degree Programs:** ${school.schoolStructure.dualDegreePrograms}\n\n`;
      }
    }

    // Add community intel section if available
    if (school.communityIntel) {
      md += `#### Application Insights from Student Communities\n\n`;
      md += `**Source:** ${school.communityIntel.source || 'Various'}\n\n`;
      if (school.communityIntel.admissionsQuirks) {
        md += `**Admissions Quirks:** ${school.communityIntel.admissionsQuirks}\n\n`;
      }
      if (school.communityIntel.commonMistakes) {
        md += `**Common Mistakes:** ${school.communityIntel.commonMistakes}\n\n`;
      }
      if (school.communityIntel.hiddenGems) {
        md += `**Hidden Gems:** ${school.communityIntel.hiddenGems}\n\n`;
      }
      if (school.communityIntel.redditWisdom) {
        md += `**Reddit Wisdom:** ${school.communityIntel.redditWisdom}\n\n`;
      }
      if (school.communityIntel.strategyTips) {
        md += `**Strategy Tips:** ${school.communityIntel.strategyTips}\n\n`;
      }
    }

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
  let programData = [];
  const apiKey = process.env.DATA_GOV_API_KEY;

  if (apiKey) {
    scorecardData = await fetchSchoolData(apiKey);
    console.log(`  ✓ ${scorecardData.length} schools from College Scorecard API`);

    // Fetch program data for first 30 schools
    programData = await fetchProgramData(apiKey);
    console.log(`  ✓ ${programData.length} schools with program data`);

    // Attach program data to scorecard profiles
    if (programData.length > 0) {
      for (const school of scorecardData) {
        const programs = programData.find(p => p.schoolName === school.name);
        if (programs) {
          school.programs = programs.data;
        }
      }
    }
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
      curatedCount: curatedIntel.length,
      programsCount: programData.length
    }
  });

  // Generate and save markdown for knowledge base
  const markdown = generateAdmissionsMarkdown(scorecardData, curatedIntel);
  await saveScrapedData('college-admissions.md', { content: markdown });

  console.log(`\n  Total: ${scorecardData.length} API profiles + ${curatedIntel.length} strategic profiles`);
  console.log(`  Programs: ${programData.length} schools with College Scorecard program data`);
  console.log('  Saved: college-admissions.json, college-admissions.md');

  return { scorecardData, curatedIntel, programData };
}

// Run if called directly
if (process.argv[1] && process.argv[1].includes('admissions-scraper')) {
  runAdmissionsScraper().catch(console.error);
}
