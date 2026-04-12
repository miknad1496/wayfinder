#!/usr/bin/env node
/**
 * inject-verified-scholarships.js
 *
 * Injects verified, source-backed scholarships into scholarships.json.
 * Every entry has a _source URL, real amounts, real deadlines,
 * and proper type categorization (essay, video, portfolio, project, etc.).
 *
 * Fields added:
 *   - scope: "national" | "state" | "regional"
 *   - applicationFormat: "essay" | "video" | "portfolio" | "project" | "application-only" | "interview" | "research-paper"
 *   - _verified, _verifiedDate, _source
 *
 * Run: node backend/scrapers/inject-verified-scholarships.js
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCHOLARSHIPS_PATH = join(__dirname, '..', 'data', 'scraped', 'scholarships.json');

const verifiedScholarships = [

  // ════════════════════════════════════════════════════════════════
  // NATIONAL — FULL RIDE / HIGH VALUE (>$20K)
  // ════════════════════════════════════════════════════════════════

  {
    name: "Gates Scholarship",
    provider: "Bill & Melinda Gates Foundation",
    amount: { min: 0, max: 300000, display: "Full cost of attendance" },
    deadline: "2026-09-15",
    category: ["merit", "need-based"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.3,
      states: ["all"],
      financialNeed: true,
      majors: ["any"],
      demographics: ["minority", "first-gen"],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "Full cost-of-attendance scholarship for outstanding minority high school seniors with financial need. ~300 scholars selected annually from 50,000+ applicants. Covers tuition, room, board, books, transportation, and personal expenses not covered by other aid.",
    url: "https://www.thegatesscholarship.org",
    renewable: true,
    tags: ["full-ride", "prestigious", "need-based", "minority", "first-gen"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.thegatesscholarship.org"
  },
  {
    name: "QuestBridge National College Match",
    provider: "QuestBridge",
    amount: { min: 0, max: 300000, display: "Full four-year scholarship" },
    deadline: "2026-09-26",
    category: ["need-based", "merit"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.5,
      states: ["all"],
      financialNeed: true,
      majors: ["any"],
      demographics: ["low-income"],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Matches high-achieving, low-income seniors with full four-year scholarships at 50+ top partner colleges including MIT, Stanford, Yale, Princeton, Columbia, and more. Covers tuition, room, board, books, and travel.",
    url: "https://www.questbridge.org/high-school-students/national-college-match",
    renewable: true,
    tags: ["full-ride", "prestigious", "need-based", "college-match"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.questbridge.org/high-school-students/national-college-match"
  },
  {
    name: "Jack Kent Cooke College Scholarship",
    provider: "Jack Kent Cooke Foundation",
    amount: { min: 0, max: 55000, display: "Up to $55,000/year" },
    deadline: "2026-11-15",
    category: ["merit", "need-based"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.75,
      states: ["all"],
      financialNeed: true,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: false,
      grades: ["12"],
      maxIncome: 95000
    },
    description: "Up to $55,000/year for high-achieving seniors with financial need. Requires unweighted GPA of 3.75+, SAT/ACT/AP/IB scores, and family AGI up to $95,000. One of the largest private scholarships in the country.",
    url: "https://www.jkcf.org/our-scholarships/college-scholarship-program/",
    renewable: true,
    tags: ["prestigious", "need-based", "high-value"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.jkcf.org/our-scholarships/college-scholarship-program/"
  },
  {
    name: "Cameron Impact Scholarship",
    provider: "Bryan Cameron Education Foundation",
    amount: { min: 0, max: 200000, display: "Full tuition, fees, and books" },
    deadline: "2026-05-01",
    category: ["merit"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.7,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["11"]
    },
    description: "Full tuition scholarship covering tuition, fees, and books at any accredited 4-year institution. ~25 scholars selected from 3,000 applicants. Finalists receive in-person interviews. Application closes at 3,000 submissions or May 1, whichever comes first.",
    url: "https://www.bryancameroneducationfoundation.org/scholarship",
    renewable: true,
    tags: ["full-ride", "prestigious", "merit", "interview"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.bryancameroneducationfoundation.org/scholarship"
  },
  {
    name: "Horatio Alger National Scholarship",
    provider: "Horatio Alger Association",
    amount: { min: 25000, max: 50000, display: "$25,000-$50,000" },
    deadline: "2026-02-15",
    category: ["need-based"],
    competitiveness: "high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 2.0,
      states: ["all"],
      financialNeed: true,
      majors: ["any"],
      demographics: ["adversity"],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "For seniors who have overcome significant adversity. 600+ scholarships awarded annually ($10K-$50K). Minimum 2.0 GPA. Emphasizes perseverance, integrity, and determination. State scholarships ($10K) also available in every state.",
    url: "https://scholars.horatioalger.org/scholarships/",
    renewable: false,
    tags: ["need-based", "adversity", "overcoming-hardship"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://scholars.horatioalger.org/scholarships/"
  },

  // ════════════════════════════════════════════════════════════════
  // NATIONAL — MERIT / ACHIEVEMENT ($5K-$20K)
  // ════════════════════════════════════════════════════════════════

  {
    name: "Coca-Cola Scholars Program",
    provider: "Coca-Cola Scholars Foundation",
    amount: { min: 20000, max: 20000, display: "$20,000" },
    deadline: "2026-09-30",
    category: ["merit"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "application-only",
    eligibility: {
      gpa: 3.0,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "150 scholars selected from 107,000+ applicants. $20,000 each. Recognizes leadership, service, and impact on school/community. Three-phase process: application, semifinalist essays, finalist interviews.",
    url: "https://www.coca-colascholarsfoundation.org/apply/",
    renewable: false,
    tags: ["prestigious", "merit", "leadership", "community-service"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.coca-colascholarsfoundation.org/apply/"
  },
  {
    name: "Dell Scholars Program",
    provider: "Michael & Susan Dell Foundation",
    amount: { min: 20000, max: 20000, display: "$20,000 + laptop + textbook credits" },
    deadline: "2026-02-15",
    category: ["need-based", "merit"],
    competitiveness: "high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 2.4,
      states: ["all"],
      financialNeed: true,
      majors: ["any"],
      demographics: ["low-income"],
      citizenshipRequired: true,
      grades: ["12"],
      pellEligible: true
    },
    description: "500 scholars selected annually. $20,000 + Dell laptop + textbook credits + ongoing mentoring. Must be Pell Grant-eligible and have participated in an approved college-readiness program (AVID, Upward Bound, GEAR UP, etc.).",
    url: "https://www.dellscholars.org/students/",
    renewable: false,
    tags: ["need-based", "pell-eligible", "college-readiness", "tech"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.dellscholars.org/students/"
  },
  {
    name: "Ron Brown Scholar Program",
    provider: "CAP Charitable Foundation",
    amount: { min: 10000, max: 40000, display: "$10,000/year ($40,000 total)" },
    deadline: "2026-01-09",
    category: ["merit"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.0,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: ["african-american"],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "20 scholars selected annually from thousands of applicants. $10,000/year renewable for 4 years. For Black/African American seniors demonstrating academic excellence, leadership, and community service. Includes mentorship and lifelong network.",
    url: "https://ronbrown.org/ron-brown-scholarship/",
    renewable: true,
    tags: ["prestigious", "african-american", "leadership", "mentorship"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://ronbrown.org/ron-brown-scholarship/"
  },
  {
    name: "Elks Most Valuable Student Scholarship",
    provider: "Elks National Foundation",
    amount: { min: 4000, max: 30000, display: "$4,000-$30,000" },
    deadline: "2025-11-12",
    category: ["merit"],
    competitiveness: "high",
    scope: "national",
    applicationFormat: "application-only",
    eligibility: {
      gpa: 3.0,
      states: ["all"],
      financialNeed: true,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "500 four-year scholarships awarded annually. Top 20 win $30,000; 480 runners-up receive $4,000. Judged on scholarship, leadership, and financial need. Leadership Weekend in Chicago for finalists.",
    url: "https://www.elks.org/scholars/scholarships/mvs.cfm",
    renewable: true,
    tags: ["merit", "leadership", "community"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.elks.org/scholars/scholarships/mvs.cfm"
  },
  {
    name: "Edison Scholars",
    provider: "Edison International",
    amount: { min: 50000, max: 50000, display: "$50,000" },
    deadline: "2025-11-01",
    category: ["stem"],
    competitiveness: "high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.0,
      states: ["CA"],
      financialNeed: false,
      majors: ["stem"],
      demographics: [],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "30 high school seniors each receive $50,000 for pursuing STEM degrees. Must live in Edison International's service territory (Southern California). Strong emphasis on community involvement and STEM passion.",
    url: "https://www.edison.com/community/edison-scholars",
    renewable: false,
    tags: ["stem", "high-value", "california"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.edison.com/community/edison-scholars"
  },

  // ════════════════════════════════════════════════════════════════
  // NATIONAL — STEM / RESEARCH (PROJECT-BASED)
  // ════════════════════════════════════════════════════════════════

  {
    name: "Regeneron Science Talent Search",
    provider: "Society for Science / Regeneron",
    amount: { min: 25000, max: 250000, display: "$25,000-$250,000" },
    deadline: "2026-06-01",
    category: ["stem"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "research-paper",
    eligibility: {
      gpa: null,
      states: ["all"],
      financialNeed: false,
      majors: ["stem"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "Nation's oldest and most prestigious science research competition. Top 300 scholars get $2,000 each; 40 finalists get $25,000+; top winner gets $250,000. Requires original STEM research project. $3.1M awarded annually.",
    url: "https://www.societyforscience.org/regeneron-sts/",
    renewable: false,
    tags: ["prestigious", "stem", "research", "science-competition"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.societyforscience.org/regeneron-sts/"
  },
  {
    name: "Davidson Fellows Scholarship",
    provider: "Davidson Institute",
    amount: { min: 25000, max: 100000, display: "$25,000-$100,000" },
    deadline: "2026-02-12",
    category: ["stem", "creative"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "project",
    eligibility: {
      gpa: null,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: ["gifted"],
      citizenshipRequired: true,
      grades: ["9", "10", "11", "12"],
      maxAge: 18
    },
    description: "Awards $25K, $50K, or $100K to students 18 and under who have completed a significant piece of work in STEM, humanities (music, literature, philosophy), or 'outside the box.' Requires graduate-level achievement.",
    url: "https://www.davidsongifted.org/gifted-programs/fellows-scholarship/",
    renewable: false,
    tags: ["prestigious", "gifted", "research", "project-based"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.davidsongifted.org/gifted-programs/fellows-scholarship/"
  },
  {
    name: "Scholarship America National STEM Excellence",
    provider: "Scholarship America",
    amount: { min: 10000, max: 10000, display: "$10,000" },
    deadline: "2026-03-15",
    category: ["stem"],
    competitiveness: "high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.0,
      states: ["all"],
      financialNeed: false,
      majors: ["stem"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "One-time $10,000 scholarship for future STEM leaders. Seeks students with strong academic records and demonstrated interest in science, technology, engineering, or mathematics.",
    url: "https://scholarshipamerica.org/scholarship/stemexcellence/",
    renewable: false,
    tags: ["stem", "merit"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://scholarshipamerica.org/scholarship/stemexcellence/"
  },

  // ════════════════════════════════════════════════════════════════
  // NATIONAL — ESSAY-BASED
  // ════════════════════════════════════════════════════════════════

  {
    name: "Scholastic Art & Writing Awards",
    provider: "Alliance for Young Artists & Writers",
    amount: { min: 500, max: 12500, display: "$500-$12,500" },
    deadline: "2025-12-01",
    category: ["creative"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "portfolio",
    eligibility: {
      gpa: null,
      states: ["all"],
      financialNeed: false,
      majors: ["arts", "writing"],
      demographics: [],
      citizenshipRequired: false,
      grades: ["7", "8", "9", "10", "11", "12"]
    },
    description: "America's longest-running, most prestigious recognition for creative teens. 29 categories including poetry, fiction, painting, photography, film, journalism. Gold Medal Portfolio winners receive $12,500. Regional and national levels.",
    url: "https://www.artandwriting.org/awards/",
    renewable: false,
    tags: ["creative", "art", "writing", "portfolio", "prestigious"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.artandwriting.org/awards/"
  },
  {
    name: "Let Grow Think for Yourself Scholarship",
    provider: "Let Grow",
    amount: { min: 500, max: 5000, display: "$500-$5,000" },
    deadline: "2026-05-15",
    category: ["merit"],
    competitiveness: "moderate",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: null,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "$14,000 in total scholarships. 600-800 word essay on independent thinking. Open to all high school seniors. Lower competition than many essay scholarships due to specific prompt requirements.",
    url: "https://letgrow.org/program/think-for-yourself-scholarship-2026/",
    renewable: false,
    tags: ["essay", "independent-thinking"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://letgrow.org/program/think-for-yourself-scholarship-2026/"
  },
  {
    name: "BigFuture Scholarships (College Board)",
    provider: "College Board",
    amount: { min: 500, max: 40000, display: "$500-$40,000" },
    deadline: "2026-06-30",
    category: ["merit"],
    competitiveness: "moderate",
    scope: "national",
    applicationFormat: "application-only",
    eligibility: {
      gpa: null,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "Complete college planning steps on BigFuture to earn scholarship entries. $500 and $40,000 awards. No essay required — just complete activities like building a college list and exploring majors. Open to Class of 2026.",
    url: "https://bigfuture.collegeboard.org/pay-for-college/bigfuture-scholarships-2026",
    renewable: false,
    tags: ["no-essay", "college-planning", "easy-apply"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://bigfuture.collegeboard.org/pay-for-college/bigfuture-scholarships-2026"
  },

  // ════════════════════════════════════════════════════════════════
  // NATIONAL — VIDEO SUBMISSION
  // ════════════════════════════════════════════════════════════════

  {
    name: "C-SPAN StudentCam Documentary Competition",
    provider: "C-SPAN",
    amount: { min: 250, max: 5000, display: "$250-$5,000" },
    deadline: "2026-01-20",
    category: ["creative"],
    competitiveness: "moderate",
    scope: "national",
    applicationFormat: "video",
    eligibility: {
      gpa: null,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: false,
      grades: ["6", "7", "8", "9", "10", "11", "12"]
    },
    description: "Create a 5-6 minute video documentary on an annual theme. 150 prizes totaling $100,000. Middle and high school categories. Grand prize $5,000. Open to grades 6-12, individuals or teams of 2-3.",
    url: "https://www.studentcam.org/",
    renewable: false,
    tags: ["video", "documentary", "government", "middle-school", "high-school"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.studentcam.org/"
  },
  {
    name: "Project Yellow Light (Distracted Driving PSA)",
    provider: "Project Yellow Light",
    amount: { min: 2000, max: 2000, display: "$2,000" },
    deadline: "2026-03-01",
    category: ["creative", "community"],
    competitiveness: "moderate",
    scope: "national",
    applicationFormat: "video",
    eligibility: {
      gpa: null,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["9", "10", "11", "12"]
    },
    description: "Create a PSA video about distracted driving awareness. $2,000 scholarship. Billboard, radio, and digital categories available. Strong social impact focus.",
    url: "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-type/video-contest-scholarships",
    renewable: false,
    tags: ["video", "psa", "social-impact", "community"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-type/video-contest-scholarships"
  },
  {
    name: "Unboxing Your Life Video Scholarship",
    provider: "Sttark",
    amount: { min: 3000, max: 3000, display: "$3,000" },
    deadline: "2026-04-30",
    category: ["creative"],
    competitiveness: "moderate",
    scope: "national",
    applicationFormat: "video",
    eligibility: {
      gpa: null,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "Create a creative 5-minute video 'unboxing' your life story. $3,000 scholarship. Open to high school seniors, undergrads, and grad students. Winner announced May 18, 2026.",
    url: "https://www.sttark.com/scholarship/unboxing-your-life-scholarship",
    renewable: false,
    tags: ["video", "creative", "storytelling"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.sttark.com/scholarship/unboxing-your-life-scholarship"
  },

  // ════════════════════════════════════════════════════════════════
  // NATIONAL — COMMUNITY SERVICE
  // ════════════════════════════════════════════════════════════════

  {
    name: "Prudential Spirit of Community Awards",
    provider: "Prudential Financial / NASSP",
    amount: { min: 1000, max: 5000, display: "$1,000-$5,000" },
    deadline: "2025-11-05",
    category: ["community"],
    competitiveness: "high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: null,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["5", "6", "7", "8", "9", "10", "11", "12"]
    },
    description: "Recognizes youth volunteer service. State-level honorees receive $1,000; national honorees receive $5,000 + trip to Washington DC. Two honorees per state + DC. Open to grades 5-12.",
    url: "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-type/community-service-scholarships",
    renewable: false,
    tags: ["community-service", "volunteering", "leadership"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-type/community-service-scholarships"
  },
  {
    name: "Warrick Dunn Hearts for Community Scholarship",
    provider: "Warrick Dunn Charities",
    amount: { min: 5000, max: 5000, display: "$5,000" },
    deadline: "2026-03-31",
    category: ["community"],
    competitiveness: "moderate",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.0,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "$5,000 scholarship recognizing high school seniors who have demonstrated a commitment to community service, volunteering, and making a positive impact in their communities.",
    url: "https://wdc.org/hearts-for-community-scholarships/",
    renewable: false,
    tags: ["community-service", "volunteering"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://wdc.org/hearts-for-community-scholarships/"
  },

  // ════════════════════════════════════════════════════════════════
  // NATIONAL — FIRST-GEN / MINORITY SPECIFIC
  // ════════════════════════════════════════════════════════════════

  {
    name: "Hispanic Scholarship Fund (HSF)",
    provider: "Hispanic Scholarship Fund",
    amount: { min: 500, max: 5000, display: "$500-$5,000" },
    deadline: "2026-02-15",
    category: ["merit", "need-based"],
    competitiveness: "moderate",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.0,
      states: ["all"],
      financialNeed: true,
      majors: ["any"],
      demographics: ["hispanic", "latino"],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Largest organization supporting Hispanic higher education. $500-$5,000 awards. Must be of Hispanic heritage. Includes mentorship, career services, and alumni network. Thousands awarded annually.",
    url: "https://www.hsf.net/scholarship",
    renewable: false,
    tags: ["hispanic", "latino", "need-based", "mentorship"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.hsf.net/scholarship"
  },
  {
    name: "APIA Scholars (Asian & Pacific Islander)",
    provider: "APIA Scholars",
    amount: { min: 2500, max: 20000, display: "$2,500-$20,000" },
    deadline: "2026-01-15",
    category: ["merit", "need-based"],
    competitiveness: "moderate",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 2.7,
      states: ["all"],
      financialNeed: true,
      majors: ["any"],
      demographics: ["asian", "pacific-islander"],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Awards ranging from one-time $2,500 to multi-year $20,000. For Asian and Pacific Islander American students. One of the largest scholarship providers for AAPI community.",
    url: "https://apiascholars.org/",
    renewable: true,
    tags: ["asian", "pacific-islander", "need-based"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://apiascholars.org/"
  },
  {
    name: "NSHSS First Generation Scholarship",
    provider: "National Society of High School Scholars",
    amount: { min: 2500, max: 2500, display: "$2,500" },
    deadline: "2026-04-15",
    category: ["merit"],
    competitiveness: "moderate",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.0,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: ["first-gen"],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "$2,500 for first-generation college students who are NSHSS members. Recognizes academic achievement and community involvement among students who will be the first in their family to attend college.",
    url: "https://www.nshss.org/scholarships/s/first-generation-scholarship-2026/",
    renewable: false,
    tags: ["first-gen", "merit"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.nshss.org/scholarships/s/first-generation-scholarship-2026/"
  },

  // ════════════════════════════════════════════════════════════════
  // WASHINGTON STATE SPECIFIC
  // ════════════════════════════════════════════════════════════════

  {
    name: "Washington State Opportunity Scholarship (WSOS) — Baccalaureate",
    provider: "Washington State Opportunity Scholarship",
    amount: { min: 0, max: 22500, display: "Up to $22,500 total" },
    deadline: "2026-02-26",
    category: ["stem", "need-based"],
    competitiveness: "moderate",
    scope: "state",
    applicationFormat: "application-only",
    eligibility: {
      gpa: 2.75,
      states: ["WA"],
      financialNeed: true,
      majors: ["stem", "healthcare"],
      demographics: [],
      citizenshipRequired: false,
      grades: ["12"],
      maxIncome: 125
    },
    description: "Up to $22,500 for WA residents pursuing high-demand STEM and healthcare majors. Must complete FAFSA/WASFA. Family income at or below 125% of WA median. Includes career-launching support services.",
    url: "https://waopportunityscholarship.org/",
    renewable: true,
    tags: ["washington", "stem", "healthcare", "need-based", "state"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://waopportunityscholarship.org/"
  },
  {
    name: "Washington College Grant",
    provider: "Washington Student Achievement Council (WSAC)",
    amount: { min: 0, max: 12000, display: "Up to full tuition at public institutions" },
    deadline: null,
    category: ["need-based"],
    competitiveness: "open",
    scope: "state",
    applicationFormat: "application-only",
    eligibility: {
      gpa: null,
      states: ["WA"],
      financialNeed: true,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Washington's largest state financial aid program. Covers tuition and some fees at public colleges/universities for eligible low-income residents. Complete FAFSA or WASFA to apply. No separate application needed.",
    url: "https://wsac.wa.gov/sfa-overview",
    renewable: true,
    tags: ["washington", "state-grant", "need-based", "no-essay"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://wsac.wa.gov/sfa-overview"
  },
  {
    name: "College Bound Scholarship (Washington)",
    provider: "WSAC",
    amount: { min: 0, max: 12000, display: "Tuition at state's highest-priced public university" },
    deadline: null,
    category: ["need-based"],
    competitiveness: "open",
    scope: "state",
    applicationFormat: "application-only",
    eligibility: {
      gpa: 2.0,
      states: ["WA"],
      financialNeed: true,
      majors: ["any"],
      demographics: ["low-income"],
      citizenshipRequired: false,
      grades: ["7", "8"]
    },
    description: "Sign up in 7th or 8th grade, maintain 2.0 GPA, stay out of trouble, and file FAFSA/WASFA as a senior. Covers tuition and a book allowance. Must sign the College Bound pledge by June 30 of 8th grade.",
    url: "https://wsac.wa.gov/sfa-overview",
    renewable: true,
    tags: ["washington", "early-commitment", "need-based", "middle-school"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://wsac.wa.gov/sfa-overview"
  },
  {
    name: "Seattle Foundation Scholarships",
    provider: "Seattle Foundation",
    amount: { min: 1000, max: 10000, display: "$1,000-$10,000 (varies by fund)" },
    deadline: "2026-03-01",
    category: ["merit", "need-based"],
    competitiveness: "moderate",
    scope: "regional",
    applicationFormat: "essay",
    eligibility: {
      gpa: null,
      states: ["WA"],
      financialNeed: true,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Multiple scholarship funds administered through Seattle Foundation for WA students. Various criteria including financial need, field of study, and community involvement. One application covers multiple funds.",
    url: "https://www.seattlefoundation.org/current-scholarship-opportunities/",
    renewable: false,
    tags: ["seattle", "washington", "community-foundation"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.seattlefoundation.org/current-scholarship-opportunities/"
  },
  {
    name: "WAVE (Washington Award for Vocational Excellence)",
    provider: "WSAC",
    amount: { min: 0, max: 5000, display: "Tuition waiver" },
    deadline: "2026-05-01",
    category: ["merit"],
    competitiveness: "moderate",
    scope: "state",
    applicationFormat: "application-only",
    eligibility: {
      gpa: null,
      states: ["WA"],
      financialNeed: false,
      majors: ["cte", "vocational"],
      demographics: [],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Recognizes graduating seniors for outstanding achievement in career and technical education (CTE). Tuition waiver at WA public colleges. Nominated by school CTE programs.",
    url: "https://wsac.wa.gov/sfa-overview",
    renewable: true,
    tags: ["washington", "vocational", "cte", "trades"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://wsac.wa.gov/sfa-overview"
  },

  // ════════════════════════════════════════════════════════════════
  // OTHER STATE SPECIFIC
  // ════════════════════════════════════════════════════════════════

  {
    name: "NYS STEM Incentive Program",
    provider: "New York State HESC",
    amount: { min: 0, max: 10000, display: "Full tuition at SUNY/CUNY" },
    deadline: "2026-06-30",
    category: ["stem"],
    competitiveness: "moderate",
    scope: "state",
    applicationFormat: "application-only",
    eligibility: {
      gpa: null,
      states: ["NY"],
      financialNeed: false,
      majors: ["stem"],
      demographics: [],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Full tuition scholarship at SUNY or CUNY for NY high school graduates ranked in top 10% of their class pursuing STEM degrees. Must work in STEM field in NY for 5 years after graduation.",
    url: "https://hesc.ny.gov/find-aid/nys-grants-scholarships/nys-science-technology-engineering-and-mathematics-stem-incentive",
    renewable: true,
    tags: ["new-york", "stem", "state", "full-tuition"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://hesc.ny.gov/find-aid/nys-grants-scholarships/nys-science-technology-engineering-and-mathematics-stem-incentive"
  },
  {
    name: "Horatio Alger State Scholarship — Texas",
    provider: "Horatio Alger Association",
    amount: { min: 10000, max: 10000, display: "$10,000" },
    deadline: "2026-03-01",
    category: ["need-based"],
    competitiveness: "moderate",
    scope: "state",
    applicationFormat: "essay",
    eligibility: {
      gpa: 2.5,
      states: ["TX"],
      financialNeed: true,
      majors: ["any"],
      demographics: ["adversity"],
      citizenshipRequired: true,
      grades: ["11"]
    },
    description: "$10,000 for Texas high school juniors who have overcome significant adversity and demonstrate financial need. Part of the Horatio Alger state scholarship network available in all 50 states.",
    url: "https://scholars.horatioalger.org/scholarships/",
    renewable: false,
    tags: ["texas", "adversity", "need-based", "state"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://scholars.horatioalger.org/scholarships/"
  },
  {
    name: "Horatio Alger State Scholarship — California",
    provider: "Horatio Alger Association",
    amount: { min: 10000, max: 10000, display: "$10,000" },
    deadline: "2026-03-01",
    category: ["need-based"],
    competitiveness: "moderate",
    scope: "state",
    applicationFormat: "essay",
    eligibility: {
      gpa: 2.5,
      states: ["CA"],
      financialNeed: true,
      majors: ["any"],
      demographics: ["adversity"],
      citizenshipRequired: true,
      grades: ["11"]
    },
    description: "$10,000 for California high school juniors who have overcome significant adversity and demonstrate financial need.",
    url: "https://scholars.horatioalger.org/scholarships/",
    renewable: false,
    tags: ["california", "adversity", "need-based", "state"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://scholars.horatioalger.org/scholarships/"
  },
  {
    name: "Horatio Alger State Scholarship — Michigan",
    provider: "Horatio Alger Association",
    amount: { min: 10000, max: 10000, display: "$10,000" },
    deadline: "2026-03-01",
    category: ["need-based"],
    competitiveness: "moderate",
    scope: "state",
    applicationFormat: "essay",
    eligibility: {
      gpa: 2.5,
      states: ["MI"],
      financialNeed: true,
      majors: ["any"],
      demographics: ["adversity"],
      citizenshipRequired: true,
      grades: ["11"]
    },
    description: "$10,000 for Michigan high school juniors who have overcome significant adversity and demonstrate financial need.",
    url: "https://scholars.horatioalger.org/scholarships/",
    renewable: false,
    tags: ["michigan", "adversity", "need-based", "state"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://scholars.horatioalger.org/scholarships/"
  },
  {
    name: "Horatio Alger State Scholarship — New York",
    provider: "Horatio Alger Association",
    amount: { min: 10000, max: 10000, display: "$10,000" },
    deadline: "2026-03-01",
    category: ["need-based"],
    competitiveness: "moderate",
    scope: "state",
    applicationFormat: "essay",
    eligibility: {
      gpa: 2.5,
      states: ["NY"],
      financialNeed: true,
      majors: ["any"],
      demographics: ["adversity"],
      citizenshipRequired: true,
      grades: ["11"]
    },
    description: "$10,000 for New York high school juniors who have overcome significant adversity and demonstrate financial need.",
    url: "https://scholars.horatioalger.org/scholarships/",
    renewable: false,
    tags: ["new-york", "adversity", "need-based", "state"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://scholars.horatioalger.org/scholarships/"
  },
  {
    name: "Horatio Alger State Scholarship — Washington",
    provider: "Horatio Alger Association",
    amount: { min: 10000, max: 10000, display: "$10,000" },
    deadline: "2026-03-01",
    category: ["need-based"],
    competitiveness: "moderate",
    scope: "state",
    applicationFormat: "essay",
    eligibility: {
      gpa: 2.5,
      states: ["WA"],
      financialNeed: true,
      majors: ["any"],
      demographics: ["adversity"],
      citizenshipRequired: true,
      grades: ["11"]
    },
    description: "$10,000 for Washington high school juniors who have overcome significant adversity and demonstrate financial need.",
    url: "https://scholars.horatioalger.org/scholarships/",
    renewable: false,
    tags: ["washington", "adversity", "need-based", "state"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://scholars.horatioalger.org/scholarships/"
  },

  // ════════════════════════════════════════════════════════════════
  // NEW ENTRIES — April 2026 Refresh
  // ════════════════════════════════════════════════════════════════

  {
    name: "Buick Achievers Scholarship Program",
    provider: "GM Foundation / Scholarship America",
    amount: { min: 5000, max: 25000, display: "Up to $25,000/year (renewable)" },
    deadline: "2027-02-28",
    category: ["merit", "need-based"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.0,
      states: ["all"],
      financialNeed: true,
      majors: ["STEM"],
      demographics: ["women", "minority", "first-gen", "military-family"],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "Renewable scholarship up to $25,000/year for students planning to major in STEM fields. ~50 scholars selected annually. Special consideration for women, minorities, military veterans, and first-generation college students. Funded by the GM Foundation.",
    url: "https://powerofdiscovery.org/buick-achievers-scholarship-program",
    renewable: true,
    tags: ["stem", "renewable", "need-based", "national", "prestigious"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://powerofdiscovery.org/buick-achievers-scholarship-program"
  },
  {
    name: "Carol S. Comeau Environmental Scholarship",
    provider: "Carol S. Comeau Environmental Scholarship Fund",
    amount: { min: 2000, max: 2000, display: "$2,000" },
    deadline: "2027-04-01",
    category: ["merit", "community-service"],
    competitiveness: "moderate",
    scope: "state",
    applicationFormat: "essay",
    eligibility: {
      gpa: 0,
      states: ["WA"],
      financialNeed: false,
      majors: ["Environmental Studies", "Environmental Science"],
      demographics: [],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Scholarship for Washington state public high school seniors planning to pursue a degree in environmental studies. Four winners selected annually. Essay-based application about how you hope to make a difference through environmental studies.",
    url: "https://bold.org/scholarships/carol-s-comeau-environmental-scholarship/",
    renewable: false,
    tags: ["washington", "environmental", "essay", "state"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://bold.org/scholarships/carol-s-comeau-environmental-scholarship/"
  },
  {
    name: "Cooke Young Scholars Program",
    provider: "Jack Kent Cooke Foundation",
    amount: { min: 0, max: 55000, display: "Comprehensive support through high school + pathway to $55K/yr college scholarship" },
    deadline: "2026-04-29",
    category: ["merit", "need-based"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.7,
      states: ["all"],
      financialNeed: true,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: false,
      grades: ["7"]
    },
    description: "Selective five-year pre-college scholarship for exceptional 7th graders with financial need. Provides individualized academic advising, financial support for enrichment, and a pathway to the Cooke College Scholarship ($55K/year). Family AGI up to $95,000 eligible.",
    url: "https://www.jkcf.org/our-scholarships/young-scholars-program/",
    renewable: true,
    tags: ["pre-college", "prestigious", "need-based", "middle-school", "advising"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.jkcf.org/our-scholarships/young-scholars-program/"
  },
  {
    name: "Washington State College Grant",
    provider: "Washington Student Achievement Council (WSAC)",
    amount: { min: 0, max: 12000, display: "Up to full tuition at public institutions" },
    deadline: "2027-06-30",
    category: ["need-based"],
    competitiveness: "low",
    scope: "state",
    applicationFormat: "application-only",
    eligibility: {
      gpa: 0,
      states: ["WA"],
      financialNeed: true,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Washington's largest state financial aid program, covering up to the full cost of tuition at public colleges. Available to Washington residents with family income at or below 100% of state median family income (~$70K for family of four). Apply via FAFSA or WASFA.",
    url: "https://wsac.wa.gov/washington-college-grant",
    renewable: true,
    tags: ["washington", "need-based", "state-grant", "tuition"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://wsac.wa.gov/washington-college-grant"
  },
  {
    name: "NSHSS Foundation STEM Scholarship",
    provider: "National Society of High School Scholars",
    amount: { min: 1000, max: 5000, display: "$1,000 - $5,000" },
    deadline: "2026-12-15",
    category: ["merit"],
    competitiveness: "moderate",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.0,
      states: ["all"],
      financialNeed: false,
      majors: ["STEM"],
      demographics: [],
      citizenshipRequired: false,
      grades: ["9", "10", "11", "12"]
    },
    description: "Scholarship supporting students with demonstrated interest in STEM fields. Applicants need resume, transcript, educator recommendation, and essay about why they want to study STEM and how they will give back to their community.",
    url: "https://www.nshss.org/scholarships/",
    renewable: false,
    tags: ["stem", "national", "merit", "essay"],
    _verified: true,
    _verifiedDate: "2026-04-04",
    _source: "https://www.nshss.org/scholarships/"
  },
  // ════════════════════════════════════════════════════════════════
  // NEW ENTRIES — 2026-04-05 Weekly Refresh
  // ════════════════════════════════════════════════════════════════

  {
    name: "SAME Seattle Post & PSE&SSF Engineering Scholarship",
    provider: "Society of American Military Engineers — Seattle Post",
    amount: { min: 1000, max: 2000, display: "$1,000 - $2,000" },
    deadline: "2026-04-17",
    category: ["merit"],
    competitiveness: "moderate",
    scope: "regional",
    applicationFormat: "application-only",
    eligibility: {
      gpa: 0,
      states: ["WA"],
      financialNeed: false,
      majors: ["Engineering", "Science", "Technology"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "Up to $27,500 awarded across 18 scholarships for graduating high school seniors in Puget Sound counties pursuing BS degrees in engineering, science, or technology. Awards range from $1,000-$2,000. Must attend an accredited college or university in Fall 2026.",
    url: "https://www.same.org/seattle/scholarships/",
    renewable: false,
    tags: ["engineering", "stem", "military", "puget-sound", "regional"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://www.same.org/seattle/scholarships/"
  },
  {
    name: "Museum of Flight Post-Secondary STEM Scholarship",
    provider: "The Museum of Flight",
    amount: { min: 5000, max: 30000, display: "Up to $30,000/year for 4 years" },
    deadline: "2027-02-01",
    category: ["merit"],
    competitiveness: "high",
    scope: "state",
    applicationFormat: "application-only",
    eligibility: {
      gpa: 3.5,
      states: ["WA"],
      financialNeed: false,
      majors: ["STEM", "Aviation", "Aerospace"],
      demographics: [],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Renewable STEM scholarship for Washington State resident high school seniors with 3.5+ GPA who participated in at least 40 hours of Museum of Flight programs. Awards up to $30,000 annually for four years toward a STEM degree.",
    url: "https://www.museumofflight.org/education/post-secondary-scholarships",
    renewable: true,
    tags: ["stem", "aerospace", "aviation", "washington", "renewable", "high-value"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://www.museumofflight.org/education/post-secondary-scholarships"
  },
  {
    name: "Nellie Martin Carman Scholarship",
    provider: "Nellie Martin Carman Scholarship Fund",
    amount: { min: 500, max: 2000, display: "Up to $2,000/year" },
    deadline: "2027-04-06",
    category: ["need-based"],
    competitiveness: "moderate",
    scope: "regional",
    applicationFormat: "application-only",
    eligibility: {
      gpa: 0,
      states: ["WA"],
      financialNeed: true,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "Founded in 1949. For graduating seniors from public high schools in King, Pierce, or Snohomish County, WA. Must demonstrate financial need. Requires school counselor nomination. Must attend a WA college or university full-time. Not available for arts majors.",
    url: "https://carmanscholarships.org/",
    renewable: true,
    tags: ["need-based", "king-county", "pierce-county", "snohomish", "counselor-nomination"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://carmanscholarships.org/"
  },
  {
    name: "Black at Microsoft Scholarship",
    provider: "Black at Microsoft & Seattle Foundation",
    amount: { min: 2500, max: 5000, display: "$2,500 - $5,000 (renewable)" },
    deadline: "2027-03-16",
    category: ["merit"],
    competitiveness: "high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.0,
      states: ["all"],
      financialNeed: false,
      majors: ["Engineering", "Computer Science", "Business", "Finance"],
      demographics: ["Black/African American"],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "National scholarship for Black high school seniors pursuing STEM or business degrees. Five $5,000 renewable awards (up to 3 years) and 55 one-time $2,500 awards. Administered by Scholarship America. Selection based on academics, interest in software/tech, and leadership.",
    url: "https://www.microsoft.com/en-us/diversity/bam-scholarship",
    renewable: true,
    tags: ["tech", "microsoft", "diversity", "stem", "business", "renewable"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://www.microsoft.com/en-us/diversity/bam-scholarship"
  },
  {
    name: "WWIN Star Scholarship",
    provider: "Washington Women In Need",
    amount: { min: 5000, max: 5000, display: "$5,000/year (up to $20,000 total)" },
    deadline: "2026-04-16",
    category: ["need-based"],
    competitiveness: "moderate",
    scope: "state",
    applicationFormat: "application-only",
    eligibility: {
      gpa: 0,
      states: ["WA"],
      financialNeed: true,
      majors: ["any"],
      demographics: ["women"],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Annual $5,000 renewable scholarship for women in Washington state pursuing post-secondary credentials. Renewable up to $20,000 total. Includes a Resiliency Fund for financial setbacks, Career Coaching program, and online networking community. Open to US citizens, permanent residents, refugees, asylees, and DACA recipients.",
    url: "https://wwin.org/star-scholars/",
    renewable: true,
    tags: ["women", "washington", "need-based", "renewable", "career-support"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://wwin.org/star-scholars/"
  },

  // ════════════════════════════════════════════════════════════════
  // ADDED 2026-04-05 — Weekly Refresh
  // ════════════════════════════════════════════════════════════════

  {
    name: "Pride Foundation Scholarships",
    provider: "Pride Foundation",
    amount: { min: 1000, max: 12500, display: "Average $6,700 (up to $12,500)" },
    deadline: "2027-01-09",
    category: ["need-based", "merit", "community-service"],
    competitiveness: "moderate",
    scope: "regional",
    applicationFormat: "essay",
    eligibility: {
      gpa: 0,
      states: ["WA", "OR", "ID", "MT", "AK"],
      financialNeed: false,
      majors: ["any"],
      demographics: ["lgbtq"],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "60+ scholarships for LGBTQ+ students and allies in the Pacific Northwest (AK, ID, MT, OR, WA). One application covers all awards. Over $8.5 million awarded to 2,400+ students. Average award is $6,700. Renewable — students can reapply annually.",
    url: "https://pridefoundation.org/find-funding/scholarships/",
    renewable: true,
    tags: ["lgbtq", "pacific-northwest", "washington", "renewable", "regional"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://pridefoundation.org/find-funding/scholarships/"
  },
  {
    name: "We The Future Contest",
    provider: "Constituting America",
    amount: { min: 2000, max: 5000, display: "$2,000–$5,000" },
    deadline: "2026-05-31",
    category: ["merit"],
    competitiveness: "moderate",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 0,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["9", "10", "11", "12"]
    },
    description: "Submit an essay (500-1000 words), song, STEM project, short film (5-10 min), social media video (60 sec), or PSA (~30 sec) on the U.S. Constitution. Open to elementary through college. High school winners may receive an additional $5,000 Hillsdale College scholarship.",
    url: "https://constitutingamerica.org/contest-categories-new/",
    renewable: false,
    tags: ["essay", "video", "stem-project", "constitution", "creative", "multi-format"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://constitutingamerica.org/contest-categories-new/"
  },
  {
    name: "Stossel in the Classroom Essay Contest",
    provider: "Stossel in the Classroom",
    amount: { min: 500, max: 2500, display: "Up to $2,500" },
    deadline: "2027-03-13",
    category: ["merit"],
    competitiveness: "moderate",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 0,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: false,
      grades: ["5", "6", "7", "8", "9", "10", "11", "12"]
    },
    description: "Essay contest for grades 5-12 requiring a 500-1000 word original essay. For 2026, the topic focuses on America's 250th anniversary milestone. Finalists must participate in a brief interview. Open to students in the US, Canada, or at US military addresses.",
    url: "https://stosselintheclassroom.org/essay-contest/",
    renewable: false,
    tags: ["essay", "middle-school", "high-school", "writing"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://stosselintheclassroom.org/essay-contest/"
  },
  {
    name: "College JumpStart Scholarship",
    provider: "College JumpStart Scholarship Fund",
    amount: { min: 1000, max: 1000, display: "$1,000" },
    deadline: "2027-03-31",
    category: ["merit"],
    competitiveness: "low",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 0,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["10", "11", "12"]
    },
    description: "Merit-based scholarship requiring a personal statement about educational goals. No GPA or test score requirements. Multiple scholarship tracks with different themes and deadlines throughout the year (Show Grit, Gratitude, Pay It Forward, Love of Learning).",
    url: "https://www.jumpstart-scholarship.net/",
    renewable: false,
    tags: ["essay", "no-gpa-requirement", "easy-apply", "personal-statement"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://www.jumpstart-scholarship.net/"
  },
  {
    name: "Terry Foundation Scholarship",
    provider: "Terry Foundation",
    amount: { min: 0, max: 200000, display: "Full cost of attendance (last-dollar)" },
    deadline: "2027-01-15",
    category: ["merit", "need-based"],
    competitiveness: "very_high",
    scope: "state",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.5,
      states: ["TX"],
      financialNeed: true,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "Full-ride, last-dollar scholarship covering up to 8 semesters at 11 Texas public universities including UT Austin, Texas A&M, UH, and Texas Tech. Covers tuition, room, board, books, and includes a $5,000 study abroad stipend. Selected based on academic achievement, leadership, and financial need.",
    url: "https://terryfoundation.org/apply/",
    renewable: true,
    tags: ["full-ride", "texas", "prestigious", "leadership", "study-abroad"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://terryfoundation.org/apply/"
  },

  // ════════════════════════════════════════════════════════════════
  // NATIONAL — FULL RIDE / HIGH VALUE (NEW BATCH — April 5 2026)
  // ════════════════════════════════════════════════════════════════

  {
    name: "Coolidge Scholarship",
    provider: "Calvin Coolidge Presidential Foundation",
    amount: { min: 0, max: 250000, display: "Full ride (tuition, room, board, expenses)" },
    deadline: "2026-12-16",
    category: ["merit"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.5,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      citizenshipRequired: true,
      grades: ["11"]
    },
    description: "The only full-ride presidential scholarship in the United States. Covers tuition, room, board, required fees, and provides an annual book stipend for four years at any accredited U.S. college or university. Open to high school juniors who demonstrate academic excellence, interest in public policy, and leadership.",
    url: "https://coolidgescholars.org/",
    renewable: true,
    tags: ["full-ride", "prestigious", "merit", "public-policy", "leadership"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://coolidgescholars.org/"
  },
  {
    name: "GE-Reagan Foundation Scholarship",
    provider: "Ronald Reagan Presidential Foundation & Institute",
    amount: { min: 10000, max: 40000, display: "$10,000/year renewable up to $40,000" },
    deadline: "2027-01-05",
    category: ["merit", "leadership"],
    competitiveness: "high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.0,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "Awards $10,000 per year (renewable up to $40,000 total) to high school seniors who demonstrate leadership, drive, integrity, and citizenship with a minimum 3.0 GPA. Applicants must demonstrate strong community involvement, plan to enroll full-time at an accredited U.S. college or university.",
    url: "https://www.reaganfoundation.org/education/scholarship-programs",
    renewable: true,
    tags: ["leadership", "renewable", "merit", "citizenship"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://www.reaganfoundation.org/education/scholarship-programs"
  },
  {
    name: "Posse Foundation Leadership Scholarship",
    provider: "Posse Foundation",
    amount: { min: 0, max: 300000, display: "Full tuition for four years" },
    deadline: "2026-08-01",
    category: ["merit", "leadership"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "interview",
    eligibility: {
      gpa: 3.0,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Full-tuition leadership scholarships to 70+ partner colleges and universities including Vanderbilt, Middlebury, Pomona, Bryn Mawr, and more. Students are nominated by their high school or community organization, then go through a dynamic assessment process emphasizing leadership, teamwork, and communication. Scholars attend college in cohorts of 10.",
    url: "https://www.possefoundation.org/",
    renewable: true,
    tags: ["full-tuition", "prestigious", "leadership", "nomination-based", "diverse"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://www.possefoundation.org/"
  },
  {
    name: "Cobell Scholarship (Undergraduate)",
    provider: "Cobell Education Scholarship Fund",
    amount: { min: 1000, max: 10000, display: "Up to $10,000" },
    deadline: "2027-03-31",
    category: ["need-based", "heritage"],
    competitiveness: "moderate",
    scope: "national",
    applicationFormat: "application-only",
    eligibility: {
      states: ["all"],
      financialNeed: true,
      majors: ["any"],
      demographics: ["native-american", "alaska-native"],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Scholarship for American Indian, Alaska Native, Native Hawaiian, and Pacific Islander students who are enrolled members of U.S. federally recognized tribes. Authorized by the Cobell Settlement Agreement, funded by the U.S. Department of the Interior. Covers tuition and educational expenses for undergraduate study.",
    url: "https://cobellscholar.org/our-scholarships/",
    renewable: true,
    tags: ["native-american", "need-based", "federal", "indigenous"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://cobellscholar.org/our-scholarships/"
  },
  {
    name: "Thiel Fellowship",
    provider: "Thiel Foundation",
    amount: { min: 200000, max: 200000, display: "$200,000 over two years" },
    deadline: "2026-12-31",
    category: ["merit", "entrepreneurship"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Two-year $200,000 grant for young people aged 22 or under who want to build new things instead of attending college. Founded by Peter Thiel in 2011. Approximately 20-30 fellows selected annually. The Foundation does not take equity. Fellows build startups, nonprofits, research projects, and technologies with mentorship from the Thiel network of founders, investors, and scientists.",
    url: "https://thielfellowship.org/",
    renewable: false,
    tags: ["entrepreneurship", "innovation", "prestigious", "alternative-path", "startup"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://thielfellowship.org/"
  },
  {
    name: "DAR Good Citizens Scholarship",
    provider: "Daughters of the American Revolution",
    amount: { min: 500, max: 5000, display: "$500-$5,000 (varies by chapter/state/national level)" },
    deadline: "2027-02-01",
    category: ["merit", "community-service", "leadership"],
    competitiveness: "moderate",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Since 1934, the DAR Good Citizens program recognizes high school seniors who exemplify dependability, service, leadership, and patriotism. Students are nominated by their school, then write an essay to compete for scholarships at the chapter, state, division, and national levels. One student per school may be nominated per year.",
    url: "https://www.dar.org/national-society/scholarships/dar-related",
    renewable: false,
    tags: ["leadership", "community-service", "patriotism", "nomination-based", "essay"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://www.dar.org/national-society/scholarships/dar-related"
  },
  {
    name: "National Merit Scholarship",
    provider: "National Merit Scholarship Corporation",
    amount: { min: 2500, max: 2500, display: "$2,500 one-time (corporate/college-sponsored awards up to full tuition)" },
    deadline: "2026-10-15",
    category: ["merit"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "application-only",
    eligibility: {
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      citizenshipRequired: true,
      grades: ["11"]
    },
    description: "Based on PSAT/NMSQT scores, approximately 16,000 semifinalists are named each September. About 95% advance to finalist standing, and approximately 6,930 scholarships worth nearly $26 million are awarded: 2,500 National Merit $2,500 Scholarships, 830 corporate-sponsored awards, and 3,600 college-sponsored awards (some covering full tuition at the sponsoring institution).",
    url: "https://www.nationalmerit.org/",
    renewable: false,
    tags: ["merit", "prestigious", "PSAT", "standardized-test", "national"],
    _verified: true,
    _verifiedDate: "2026-04-05",
    _source: "https://www.nationalmerit.org/"
  },

  // ════════════════════════════════════════════════════════════════
  // WEEKLY REFRESH — April 12, 2026
  // ════════════════════════════════════════════════════════════════

  {
    name: "Jackie Robinson Foundation Scholarship",
    provider: "Jackie Robinson Foundation",
    amount: { min: 0, max: 35000, display: "Up to $35,000 over 4 years" },
    deadline: "2027-01-07",
    category: ["merit", "need-based"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.0,
      states: ["all"],
      financialNeed: true,
      majors: ["any"],
      demographics: ["minority"],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "Provides up to $35,000 over four years to minority high school seniors demonstrating academic excellence, leadership potential, and community service. Approximately 60 scholars selected annually. Includes mentoring, internship placement, career guidance, and an annual leadership conference in NYC.",
    url: "https://jackierobinson.org/scholarship/",
    renewable: true,
    tags: ["merit", "need-based", "minority", "leadership", "mentorship"],
    _verified: true,
    _verifiedDate: "2026-04-12",
    _source: "https://jackierobinson.org/scholarship/"
  },
  {
    name: "Taco Bell Live Más Scholarship",
    provider: "Taco Bell Foundation",
    amount: { min: 5000, max: 25000, display: "$5,000 - $25,000" },
    deadline: "2027-01-06",
    category: ["merit"],
    competitiveness: "high",
    scope: "national",
    applicationFormat: "video",
    eligibility: {
      gpa: 0,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["11", "12"]
    },
    description: "Awards $5,000, $10,000, or $25,000 scholarships to innovative young leaders ages 16-26 pursuing education after high school. Over $14.5 million awarded annually to 1,000+ students. Unique 2-minute video application — no GPA or test score requirements. Focuses on passion, creativity, and community impact.",
    url: "https://www.tacobellfoundation.org/live-mas-scholarship/",
    renewable: false,
    tags: ["video-application", "creative", "no-GPA-requirement", "accessible"],
    _verified: true,
    _verifiedDate: "2026-04-12",
    _source: "https://www.tacobellfoundation.org/live-mas-scholarship/"
  },
  {
    name: "Foot Locker Scholar Athletes",
    provider: "Foot Locker Foundation",
    amount: { min: 20000, max: 20000, display: "$20,000 ($5,000/year for 4 years)" },
    deadline: "2026-12-15",
    category: ["merit"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "application-only",
    eligibility: {
      gpa: 3.0,
      states: ["all"],
      financialNeed: false,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "Awards 20 graduating high school seniors $20,000 each ($5,000/year over 4 years) for leadership in academics, sports, and community. Must be involved in high school or community-based sports. Recognizes well-rounded student-athletes who demonstrate excellence beyond the playing field.",
    url: "https://www.footlocker-inc.com/content/flinc-aem/us/en/community/foot-locker-scholar-athletes.html",
    renewable: true,
    tags: ["athlete", "leadership", "sports", "community"],
    _verified: true,
    _verifiedDate: "2026-04-12",
    _source: "https://www.footlocker-inc.com/content/flinc-aem/us/en/community/foot-locker-scholar-athletes.html"
  },
  {
    name: "Generation Google Scholarship",
    provider: "Google",
    amount: { min: 10000, max: 10000, display: "$10,000" },
    deadline: "2026-04-23",
    category: ["field-specific"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 0,
      states: ["all"],
      financialNeed: false,
      majors: ["Computer Science", "Computer Engineering", "Software Engineering"],
      demographics: ["underrepresented-in-tech"],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Awards $10,000 to students from groups historically underrepresented in the technology industry who are pursuing degrees in computer science or related fields. Selected based on academic performance, leadership, and commitment to diversity in tech. Administered by the Institute of International Education (IIE).",
    url: "https://buildyourfuture.withgoogle.com/scholarships/generation-google-scholarship",
    renewable: false,
    tags: ["tech", "computer-science", "diversity", "google", "STEM"],
    _verified: true,
    _verifiedDate: "2026-04-12",
    _source: "https://buildyourfuture.withgoogle.com/scholarships/generation-google-scholarship"
  },
  {
    name: "Burger King Scholars Program",
    provider: "Burger King McLamore Foundation",
    amount: { min: 1000, max: 60000, display: "$1,000 - $60,000" },
    deadline: "2026-12-15",
    category: ["merit", "need-based"],
    competitiveness: "high",
    scope: "national",
    applicationFormat: "application-only",
    eligibility: {
      gpa: 2.5,
      states: ["all"],
      financialNeed: true,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "Awards scholarships ranging from $1,000 to $60,000 to graduating high school seniors. The top-tier James W. McLamore WHOPPER Scholarship awards $60,000 to three students annually. Applicants evaluated on academics, community involvement, work experience, and financial need. Application opens October 15 and closes at 30,000 applications or December 15.",
    url: "https://www.burgerkingfoundation.org/programs/burger-king-sm-scholars",
    renewable: false,
    tags: ["need-based", "merit", "community-service", "work-experience"],
    _verified: true,
    _verifiedDate: "2026-04-12",
    _source: "https://www.burgerkingfoundation.org/programs/burger-king-sm-scholars"
  },
  {
    name: "Amazon Future Engineer Scholarship",
    provider: "Amazon / Scholarship America",
    amount: { min: 40000, max: 40000, display: "$40,000 ($10,000/year for 4 years)" },
    deadline: "2027-01-22",
    category: ["field-specific", "need-based"],
    competitiveness: "very_high",
    scope: "national",
    applicationFormat: "essay",
    eligibility: {
      gpa: 3.0,
      states: ["all"],
      financialNeed: true,
      majors: ["Computer Science", "Software Engineering", "Computer Engineering"],
      demographics: [],
      citizenshipRequired: true,
      grades: ["12"]
    },
    description: "Awards $40,000 over four years plus a paid summer internship at Amazon to high school seniors planning to study computer science. Must have completed a CS course in high school. Demonstrates financial need and plans to major in CS or related STEM field at an accredited 4-year institution.",
    url: "https://www.amazonfutureengineer.com/scholarships",
    renewable: true,
    tags: ["tech", "computer-science", "internship", "amazon", "STEM", "need-based"],
    _verified: true,
    _verifiedDate: "2026-04-12",
    _source: "https://www.amazonfutureengineer.com/scholarships"
  },
  {
    name: "WSECU Foundation Scholarship",
    provider: "Washington State Employees Credit Union",
    amount: { min: 2000, max: 3000, display: "$2,000 - $3,000" },
    deadline: "2027-02-28",
    category: ["merit"],
    competitiveness: "moderate",
    scope: "state",
    applicationFormat: "application-only",
    eligibility: {
      gpa: 0,
      states: ["WA"],
      financialNeed: true,
      majors: ["any"],
      demographics: [],
      citizenshipRequired: false,
      grades: ["12"]
    },
    description: "Awards $2,000 for 2-year/vocational and $3,000 for 4-year undergraduate/graduate students. Open to WSECU members of all ages pursuing higher education. $100,000 total awarded annually. FAFSA completion required. Application opens December through February each year.",
    url: "https://wsecu.org/scholarships",
    renewable: false,
    tags: ["washington", "credit-union", "accessible", "state"],
    _verified: true,
    _verifiedDate: "2026-04-12",
    _source: "https://wsecu.org/scholarships"
  },

];


async function main() {
  const raw = await fs.readFile(SCHOLARSHIPS_PATH, 'utf8');
  const data = JSON.parse(raw);

  // Use data-integrity module for dedup + validation (verified always wins)
  const { validateAndDedup } = await import('../services/data-integrity.js');
  const allEntries = [...verifiedScholarships, ...(data.scholarships || [])];
  const { clean, removed, warnings, stats } = validateAndDedup('scholarships', allEntries);

  console.log(`\n📊 Data Integrity Report:`);
  console.log(`  Input: ${stats.input} | Output: ${stats.output}`);
  console.log(`  Duplicates removed: ${stats.duplicatesRemoved}`);
  console.log(`  Invalid removed: ${stats.invalidRemoved}`);
  console.log(`  Verified: ${stats.verified} | Non-verified: ${stats.nonVerified}`);
  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${warnings.length}):`);
    warnings.slice(0, 10).forEach(w => console.log(`  ${w}`));
    if (warnings.length > 10) console.log(`  ... and ${warnings.length - 10} more`);
  }

  data.scholarships = clean;

  // Update metadata — sync counts to actual data
  data.metadata = data.metadata || {};
  data.metadata._verified = "partial";
  data.metadata._verificationNotes = `Data integrity enforced on ${new Date().toISOString().slice(0, 10)}. ${stats.verified} verified, ${stats.nonVerified} non-verified, ${stats.duplicatesRemoved} dupes removed.`;
  data.metadata.lastUpdated = new Date().toISOString();
  data.metadata.totalCount = data.scholarships.length;
  data.metadata.totalScholarships = data.scholarships.length;
  data.metadata.verifiedCount = data.scholarships.filter(s => s._verified).length;

  await fs.writeFile(SCHOLARSHIPS_PATH, JSON.stringify(data, null, 2));

  console.log(`Existing scholarships: ${data.scholarships.length - injected}`);
  console.log(`✅ New verified injected: ${injected}`);
  console.log(`🔄 Existing replaced with verified: ${updated}`);
  console.log(`Total scholarships: ${data.scholarships.length}`);

  // Stats
  const byScope = {};
  const byFormat = {};
  const byAmount = { under1k: 0, '1k-5k': 0, '5k-20k': 0, '20k-50k': 0, 'over50k': 0 };
  let verifiedCount = 0;

  for (const s of data.scholarships) {
    const scope = s.scope || 'national';
    byScope[scope] = (byScope[scope] || 0) + 1;
    const fmt = s.applicationFormat || 'unspecified';
    byFormat[fmt] = (byFormat[fmt] || 0) + 1;
    if (s._verified) verifiedCount++;
    const max = s.amount?.max || 0;
    if (max < 1000) byAmount.under1k++;
    else if (max <= 5000) byAmount['1k-5k']++;
    else if (max <= 20000) byAmount['5k-20k']++;
    else if (max <= 50000) byAmount['20k-50k']++;
    else byAmount['over50k']++;
  }

  console.log('\nBy scope:', byScope);
  console.log('By format:', byFormat);
  console.log('By amount range:', byAmount);
  console.log('Verified:', verifiedCount);
}

main().catch(console.error);
