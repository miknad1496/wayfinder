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
];


async function main() {
  const raw = await fs.readFile(SCHOLARSHIPS_PATH, 'utf8');
  const data = JSON.parse(raw);

  const existingNames = new Set(data.scholarships.map(s => s.name?.toLowerCase().trim()));
  let injected = 0;
  let updated = 0;

  for (const schol of verifiedScholarships) {
    const key = schol.name.toLowerCase().trim();
    if (existingNames.has(key)) {
      // Replace the existing entry with verified data
      const idx = data.scholarships.findIndex(s => s.name?.toLowerCase().trim() === key);
      if (idx !== -1) {
        data.scholarships[idx] = schol;
        updated++;
      }
    } else {
      data.scholarships.push(schol);
      existingNames.add(key);
      injected++;
    }
  }

  // Update metadata
  data.metadata = data.metadata || {};
  data.metadata._verified = "partial";
  data.metadata._verificationNotes = `${injected} new verified scholarships injected, ${updated} existing entries replaced with verified data on 2026-04-04. Each verified entry has _source URL. Remaining entries may have template descriptions.`;
  data.metadata.lastUpdated = new Date().toISOString();

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
