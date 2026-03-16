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

// Top 60 target universities by OPEID — covers Ivy League, top 25, flagship state schools, top LACs
const TARGET_SCHOOLS = [
  // Ivy League
  'Harvard University', 'Yale University', 'Princeton University',
  'Columbia University in the City of New York', 'University of Pennsylvania',
  'Brown University', 'Dartmouth College', 'Cornell University',
  // Top Private
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
  // Top Public / Flagship State
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
  // Top Liberal Arts
  'Williams College', 'Amherst College', 'Pomona College',
  'Swarthmore College', 'Wellesley College', 'Bowdoin College',
  'Middlebury College', 'Claremont McKenna College'
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
