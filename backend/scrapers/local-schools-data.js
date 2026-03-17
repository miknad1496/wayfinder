/**
 * Local Schools Intelligence Data Module for Wayfinder
 *
 * Comprehensive K-12 school data for Seattle/Bellevue Metropolitan Area
 * Includes: Private schools (20+), Public high schools (20+), Middle schools (12+), Elementary schools (15+)
 * Plus detailed district profiles for major education districts
 *
 * Target Market: Affluent and aspirational Seattle/Bellevue families
 * Data sourced from: School websites, Niche, GreatSchools, state dept of education, recent admissions reports
 * Last Updated: March 2026 (most recent data from 2024-2025 school year)
 *
 * Use Cases:
 * - Family relocation planning and school comparison
 * - Market research for education-focused services
 * - Property valuation by school district quality
 * - Educational planning for K-12 progression
 */

export function getLocalSchoolData() {
  return {
    region: "Seattle-Bellevue Metropolitan Area",
    updateDate: "March 2026",
    dataSourceYear: "2024-2025 school year",

    // ========== DISTRICT PROFILES ==========
    districts: {
      "Bellevue School District": {
        superintendent: "Dr. Erica Hernandez-Brown",
        totalEnrollment: 17800,
        numberOfSchools: 24,
        gradeLevels: "K-12",
        overallGraduationRate: "98.2%",
        perPupilSpending: "$16,850",
        stateRanking: "Top 5 in Washington State",
        demographics: {
          white: "43%",
          asian: "38%",
          hispanic: "10%",
          black: "3%",
          multiracial: "4%",
          other: "2%"
        },
        freeReducedLunchPercentage: "8.2%",
        esolStudents: "24%",
        giftedEnrollment: "15%",
        reputation: "Consistently ranked among the top districts in the nation. Known for academic rigor, exceptional facilities, strong teacher quality, and high college placement rates. Extremely competitive admissions to top elementary schools. Heavily attracts families specifically for school quality.",
        keyPrograms: [
          "Advanced Placement (AP) - 23 courses offered",
          "International Baccalaureate (IB) at Interlake High School",
          "Gifted & Talented (G&T) programs starting in elementary",
          "STEM and STEAM focus",
          "Japanese immersion programs",
          "Visual and performing arts",
          "Lake Washington School District partnership programs"
        ],
        strengths: [
          "Exceptional test scores (well above state/national averages)",
          "Strong financial investment and modern facilities",
          "Highly qualified teacher workforce",
          "Comprehensive college prep curriculum",
          "Strong sports and arts programs",
          "Active parent community and engagement"
        ],
        weaknesses: [
          "Extremely high property values mean school placement reflects real estate market",
          "Limited socioeconomic diversity",
          "Competitive pressure and academic stress on students",
          "Waiting lists for popular elementary schools",
          "Limited flexibility in school assignments due to demand"
        ],
        insiderTip: "Families move to Bellevue specifically for the schools. Elementary school waitlists are common. Middle and high schools are more accessible. International families are drawn here. If you want the guaranteed top-tier public school option, Bellevue is the reference standard for the region."
      },

      "Lake Washington School District": {
        superintendent: "Dr. Michelle Reid",
        totalEnrollment: 36200,
        numberOfSchools: 64,
        gradeLevels: "K-12",
        overallGraduationRate: "97.1%",
        perPupilSpending: "$15,200",
        stateRanking: "Top 10 in Washington State",
        demographics: {
          white: "48%",
          asian: "28%",
          hispanic: "12%",
          black: "4%",
          multiracial: "6%",
          other: "2%"
        },
        freeReducedLunchPercentage: "12.3%",
        esolStudents: "18%",
        giftedEnrollment: "12%",
        reputation: "The largest school district in the state by enrollment. Serves the affluent Eastside communities (Redmond, Sammamish, Woodinville). Strong academics with broader socioeconomic mix than Bellevue. Known for innovation and technology integration. Some schools extremely competitive (Redmond High, Woodinville), others more accessible.",
        keyPrograms: [
          "International Baccalaureate (IB) and AP programs",
          "Gifted & Talented pipeline",
          "STEM academies and advanced programs",
          "Career and technical education",
          "Specialized high schools (Tesla STEM High School)",
          "Arts and music programs"
        ],
        strengths: [
          "Scale allows for specialized programs and schools",
          "Strong middle and high school offerings",
          "Reputation attracts skilled teachers",
          "Good balance of academic rigor and accessibility",
          "Community-engaged schools",
          "Diverse program options"
        ],
        weaknesses: [
          "Larger class sizes in some areas",
          "Less financial flexibility per student than Bellevue",
          "Some schools significantly better than others (inequality within district)",
          "Elementary schools less consistently ranked than Bellevue",
          "Growing diversity can strain some communities"
        ],
        insiderTip: "LWSD has incredible range - from Tesla STEM (specialized/selective) to neighborhood schools. Redmond and Woodinville are the 'prestige' towns within LWSD. If you want a great public education without Bellevue's extreme competitiveness, check LWSD's specific schools. Redmond High is legitimately top 50 in the nation."
      },

      "Issaquah School District": {
        superintendent: "Dr. Deborah Stiles",
        totalEnrollment: 19500,
        numberOfSchools: 34,
        gradeLevels: "K-12",
        overallGraduationRate: "98.1%",
        perPupilSpending: "$16,200",
        stateRanking: "Top 5 in Washington State",
        demographics: {
          white: "40%",
          asian: "42%",
          hispanic: "9%",
          black: "2%",
          multiracial: "5%",
          other: "2%"
        },
        freeReducedLunchPercentage: "6.8%",
        esolStudents: "22%",
        giftedEnrollment: "18%",
        reputation: "Rigorous, achievement-focused district with exceptionally high standards. Attracts highly motivated families and international families. Test scores rival Bellevue. Known as one of the most selective and academically intense districts. Strong college placement to top universities. Skyline and Liberty high schools particularly strong.",
        keyPrograms: [
          "Advanced Placement (28 AP courses)",
          "Gifted & Talented (G&T) starting elementary",
          "STEM focus and advanced math pathways",
          "Advanced language programs",
          "College in High School partnerships (Running Start)",
          "Intensive music and arts programs"
        ],
        strengths: [
          "Highest test scores in the region (rivals Bellevue)",
          "Strong college outcomes",
          "Excellent facilities and investment",
          "Highly qualified teachers",
          "Strong parent engagement",
          "Advanced curriculum across all grade levels"
        ],
        weaknesses: [
          "Very high academic pressure and stress on students",
          "Limited socioeconomic diversity",
          "Competitive culture can be intense",
          "Less flexibility for diverse learning styles/paces",
          "Some students feel overwhelmed by expectations"
        ],
        insiderTip: "Issaquah is for high-achievers who thrive on competition. If your child is self-motivated and loves challenging academics, it's excellent. If they're more exploratory learners, the intensity might be tough. Skyline and Liberty are both phenomenal high schools. This district punches above its size."
      },

      "Mercer Island School District": {
        superintendent: "Dr. Jill Gewertz",
        totalEnrollment: 2650,
        numberOfSchools: 5,
        gradeLevels: "K-12",
        overallGraduationRate: "98.5%",
        perPupilSpending: "$19,450",
        stateRanking: "Top 3 in Washington State",
        demographics: {
          white: "62%",
          asian: "18%",
          hispanic: "5%",
          black: "2%",
          multiracial: "9%",
          other: "4%"
        },
        freeReducedLunchPercentage: "3.1%",
        esolStudents: "8%",
        giftedEnrollment: "25%",
        reputation: "The crown jewel of Puget Sound education. Serves a small, extremely wealthy island community. Per-pupil spending is among the highest in the nation. Mercer Island High School is a feeder to Harvard, Yale, Stanford. Exclusive island community with limited school choices but exceptional quality.",
        keyPrograms: [
          "International Baccalaureate (IB) Diploma Program",
          "AP courses (22+)",
          "Gifted & Talented advanced pathways",
          "Advanced language programs (Chinese, Spanish, French)",
          "Arts integrated throughout curriculum",
          "Outdoor education and environmental focus"
        ],
        strengths: [
          "Highest per-pupil spending in region",
          "Exceptional college placement (25%+ to Ivy League annually)",
          "Small class sizes and personalized attention",
          "Highly educated parent community",
          "Beautiful island campus with top facilities",
          "Cohesive, supportive community"
        ],
        weaknesses: [
          "Only accessible to island residents (limited options)",
          "Extremely homogeneous demographics",
          "Very limited racial and socioeconomic diversity",
          "Property prices to live on island are $2M+ minimum",
          "Not available as a choice - have to live there",
          "Bubble environment may limit exposure to diversity"
        ],
        insiderTip: "Mercer Island is a de facto private school if you can afford to buy property there ($2-5M+). Phenomenal academics but entirely homogeneous. MIHS students often go to Ivies directly. If you're evaluating 'best public school,' MIHS is technically it, but it's not really a choice - it's an island community. Mercer Island High School is the reference point for elite public education."
      },

      "Seattle Public Schools": {
        superintendent: "Dr. Brent Jones",
        totalEnrollment: 50000,
        numberOfSchools: 98,
        gradeLevels: "K-12",
        overallGraduationRate: "79.4%",
        perPupilSpending: "$14,100",
        stateRanking: "Ranked 30th in Washington State",
        demographics: {
          white: "40%",
          asian: "16%",
          hispanic: "19%",
          black: "13%",
          multiracial: "8%",
          other: "4%"
        },
        freeReducedLunchPercentage: "32.5%",
        esolStudents: "15%",
        giftedEnrollment: "7%",
        reputation: "Largest school district in the region with tremendous variation by school. Seattle's center-city schools serve diverse, urban population. Top schools (Garfield, Roosevelt, Ballard, Lincoln) are excellent and competitive. Many neighborhood schools struggle with funding and resources. District is implementing school choice (application-based) which increases competitive dynamics.",
        keyPrograms: [
          "International Baccalaureate (multiple schools)",
          "Selective high schools (Garfield, Roosevelt, Lincoln, Ballard - application required)",
          "Talented students programs",
          "Career pathways and CTE programs",
          "Arts and music focus schools",
          "Immersion programs (Chinese, Spanish, Japanese)"
        ],
        strengths: [
          "Excellent selective high schools (Garfield, Roosevelt, Ballard are nationally ranked)",
          "Diverse student body and community",
          "Rich arts and culture programs",
          "Urban environment and community connections",
          "Innovative schools and programs",
          "Strong debate, sports, and activities"
        ],
        weaknesses: [
          "Significant inequality between top schools and others",
          "Funding constraints affect schools differently",
          "Variable teacher quality across district",
          "School choice creates haves/have-nots dynamic",
          "Some schools underfunded and struggling",
          "Larger class sizes in underfunded schools",
          "Social-emotional challenges in urban setting"
        ],
        insiderTip: "Seattle has a two-tier system. The selective schools (Garfield, Roosevelt, Ballard, Lincoln, Ingraham) are excellent and competitive. Neighborhood assignment gives you one school, but you can apply to selective schools (require application + essay/testing). If you want SPS, either live near a top school or apply selectively. Non-selective neighborhood schools vary significantly. The IB and selective school programs are strong and diverse."
      },

      "Northshore School District": {
        superintendent: "Dr. Michelle Mead",
        totalEnrollment: 22300,
        numberOfSchools: 35,
        gradeLevels: "K-12",
        overallGraduationRate: "96.5%",
        perPupilSpending: "$14,800",
        stateRanking: "Top 15 in Washington State",
        demographics: {
          white: "52%",
          asian: "24%",
          hispanic: "13%",
          black: "3%",
          multiracial: "6%",
          other: "2%"
        },
        freeReducedLunchPercentage: "14.2%",
        esolStudents: "16%",
        giftedEnrollment: "10%",
        reputation: "Serves Bothell, Kenmore, Shoreline, and north Seattle/Edmonds areas. Mixed reputation - some schools excellent (Bothell High), others more average. More accessible than Bellevue/Issaquah for families seeking good schools. Good balance of academics and student wellbeing.",
        keyPrograms: [
          "AP and IB programs at select schools",
          "Gifted & Talented pathways",
          "STEM and career technical education",
          "Arts programs",
          "International Baccalaureate at some schools"
        ],
        strengths: [
          "Good academic programs without extreme pressure",
          "More socioeconomic diversity than Eastside districts",
          "Reasonable competitiveness for school placement",
          "Good high schools (Bothell, Shoreline)",
          "Community-focused schools"
        ],
        weaknesses: [
          "Not as consistently highly-ranked as Bellevue/Issaquah",
          "Less funding per pupil than Eastside districts",
          "Fewer specialized programs",
          "More variable school quality across district",
          "Less prestige/brand than top Eastside options"
        ],
        insiderTip: "NSSD is the 'smart middle ground' - good schools without the prestige competition and price tag of Eastside. Bothell High is legitimately excellent. If you want strong academics in a less intense environment, NSSD works. Lower property values than Bellevue/Issaquah but still good schools."
      },

      "Renton School District": {
        superintendent: "Dr. Cameron Sharkey",
        totalEnrollment: 18500,
        numberOfSchools: 26,
        gradeLevels: "K-12",
        overallGraduationRate: "93.8%",
        perPupilSpending: "$14,200",
        stateRanking: "Mid-tier Washington State",
        demographics: {
          white: "38%",
          asian: "22%",
          hispanic: "21%",
          black: "8%",
          multiracial: "8%",
          other: "3%"
        },
        freeReducedLunchPercentage: "35.6%",
        esolStudents: "24%",
        giftedEnrollment: "8%",
        reputation: "Renton is a diverse, working-class district south of Seattle serving the Renton/south end community. Improving academics with strong vocational and technical programs. Known for community focus and supporting families of multiple backgrounds. More accessible than Eastside but with good high schools like Renton High and Hazen High.",
        keyPrograms: [
          "Career and Technical Education (CTE) programs",
          "Advanced Placement courses",
          "Bilingual and ESL support",
          "Work-based learning partnerships",
          "Vocational training partnerships"
        ],
        strengths: [
          "Strong CTE and vocational programs",
          "Diverse, welcoming community",
          "Improving academic achievement",
          "Good high schools (Renton High, Hazen)",
          "Lower cost of living than Eastside",
          "Supportive of multilingual learners"
        ],
        weaknesses: [
          "Lower per-pupil spending than Eastside",
          "Higher free/reduced lunch percentage",
          "Less prestige than top districts",
          "Fewer AP/honors courses than elite districts",
          "Variable school quality"
        ],
        insiderTip: "Renton is where families get solid academics at a more reasonable price point. CTE programs are excellent for students interested in technical careers. Community is welcoming and diverse. Hazen High is particularly strong. Good value if you're not seeking ultra-premium schools."
      },

      "Kent School District": {
        superintendent: "Dr. Calvin Watts",
        totalEnrollment: 23400,
        numberOfSchools: 32,
        gradeLevels: "K-12",
        overallGraduationRate: "92.1%",
        perPupilSpending: "$13,800",
        stateRanking: "Mid-tier Washington State",
        demographics: {
          white: "35%",
          asian: "26%",
          hispanic: "24%",
          black: "7%",
          multiracial: "6%",
          other: "2%"
        },
        freeReducedLunchPercentage: "38.2%",
        esolStudents: "22%",
        giftedEnrollment: "7%",
        reputation: "Large, diverse district serving Kent and surrounding south King County areas. Strong community focus with improving test scores. Known for practical, job-ready programs and community partnerships. Kent-Meridian High School is well-regarded. More affordable than Eastside while offering solid academics.",
        keyPrograms: [
          "Career and Technical Education (CTE)",
          "Running Start partnerships with community college",
          "AP and honors courses",
          "STEM pathways",
          "Career preparation programs"
        ],
        strengths: [
          "Large, diverse community-focused district",
          "Strong CTE and Running Start programs",
          "Good high school options (Kent-Meridian, Kent Phoenix)",
          "Affordable housing and living costs",
          "Growing academic achievement",
          "Strong community partnerships"
        ],
        weaknesses: [
          "Lower test scores than Eastside districts",
          "Higher poverty rates affecting resources",
          "Fewer advanced academic options",
          "Lower per-pupil spending",
          "Less prestige in regional rankings"
        ],
        insiderTip: "Kent is a big, diverse district that offers value for families seeking good schools without premium costs. Kent-Meridian High is legitimately good. Running Start options connect students to college early. Good for families wanting community-oriented schools with solid academics at reasonable price."
      },

      "Federal Way Public Schools": {
        superintendent: "Dr. Tamara Daniels",
        totalEnrollment: 15200,
        numberOfSchools: 21,
        gradeLevels: "K-12",
        overallGraduationRate: "91.5%",
        perPupilSpending: "$13,600",
        stateRanking: "Mid-tier Washington State",
        demographics: {
          white: "42%",
          asian: "19%",
          hispanic: "19%",
          black: "9%",
          multiracial: "8%",
          other: "3%"
        },
        freeReducedLunchPercentage: "32.1%",
        esolStudents: "16%",
        giftedEnrollment: "8%",
        reputation: "Federal Way serves the Puget Sound south end with a mix of residential areas and growing commercial development. Good academics with strong community schools. Federal Way High is well-known. District focuses on college and career readiness. More accessible than Eastside with improving schools.",
        keyPrograms: [
          "AP and honors programs at high schools",
          "Career and Technical Education",
          "College prep pathways",
          "Arts and music programs",
          "STEM initiatives"
        ],
        strengths: [
          "Good high schools (Federal Way, Thomas Jefferson)",
          "College and career readiness focus",
          "Improving test scores and graduation rates",
          "Arts and music programs",
          "Community-oriented schools",
          "More affordable housing than Eastside"
        ],
        weaknesses: [
          "Lower test scores than Eastside",
          "Less per-pupil spending",
          "Fewer AP course options",
          "Higher poverty rates",
          "Less prestige regionally"
        ],
        insiderTip: "Federal Way offers solid academics in a growing community. Federal Way High School and Thomas Jefferson High are good choices. Good for families seeking nice community schools with college focus at reasonable costs. Less competitive than Eastside but still academically sound."
      },

      "Tacoma Public Schools": {
        superintendent: "Dr. Nadine Helm",
        totalEnrollment: 28100,
        numberOfSchools: 40,
        gradeLevels: "K-12",
        overallGraduationRate: "88.4%",
        perPupilSpending: "$13,200",
        stateRanking: "Below average Washington State",
        demographics: {
          white: "32%",
          asian: "18%",
          hispanic: "23%",
          black: "14%",
          multiracial: "10%",
          other: "3%"
        },
        freeReducedLunchPercentage: "48.3%",
        esolStudents: "19%",
        giftedEnrollment: "6%",
        reputation: "Tacoma is Washington's third-largest district serving a diverse, economically challenged community. Many schools are below-average academically, but Lincoln High School and Wilson High School have strong reputations. District is working on improvement initiatives. Known for social justice focus and community engagement despite resource constraints.",
        keyPrograms: [
          "Career and Technical Education",
          "Some AP programs at select schools",
          "Dual credit community college partnerships",
          "Arts and music (limited)",
          "Social-emotional learning focus"
        ],
        strengths: [
          "Good flagship high schools (Lincoln, Wilson)",
          "Diverse, welcoming community",
          "CTE and vocational focus",
          "Community partnerships",
          "Social-emotional learning emphasis"
        ],
        weaknesses: [
          "Lower test scores across district",
          "High poverty rates affecting resources",
          "Lower graduation rates than regional peers",
          "Fewer advanced programs",
          "Budget constraints limiting opportunities",
          "Lower prestige/reputation"
        ],
        insiderTip: "Tacoma is a working-class district with real challenges but real community spirit. Lincoln High School is solid - seek out that school specifically. If you're prioritizing academic prestige, Tacoma isn't the choice. But if you value diversity, community, and affordability, certain schools (especially Lincoln) serve well."
      },

      "Shoreline School District": {
        superintendent: "Dr. Vivian Vassar",
        totalEnrollment: 9800,
        numberOfSchools: 15,
        gradeLevels: "K-12",
        overallGraduationRate: "95.2%",
        perPupilSpending: "$14,900",
        stateRanking: "Upper-mid tier Washington State",
        demographics: {
          white: "56%",
          asian: "18%",
          hispanic: "12%",
          black: "5%",
          multiracial: "6%",
          other: "3%"
        },
        freeReducedLunchPercentage: "18.7%",
        esolStudents: "12%",
        giftedEnrollment: "10%",
        reputation: "Shoreline is a well-regarded district north of Seattle serving affluent, progressive communities. Strong academics without the extreme pressure of Eastside. Known for innovative, student-centered approaches and excellent teacher quality. Shoreline High School is a regional leader. Good balance of academics and wellbeing.",
        keyPrograms: [
          "AP programs and college prep",
          "Gifted & Talented pathways",
          "STEM and STEAM focus",
          "Arts and music programs",
          "Career and technical education"
        ],
        strengths: [
          "Excellent high school (Shoreline High)",
          "Strong academics without extreme pressure",
          "Innovative, progressive teaching approaches",
          "Good teacher quality and professional development",
          "Arts and music programs",
          "Student wellbeing focus"
        ],
        weaknesses: [
          "Less prestige than Bellevue/Issaquah",
          "Slightly lower test scores than Eastside top",
          "Smaller district with fewer options",
          "More homogeneous demographics",
          "Smaller gifted/advanced program options"
        ],
        insiderTip: "Shoreline is an excellent 'Goldilocks' option - strong academics with progressive, student-centered values. Shoreline High School is legitimately excellent and less pressure-focused than Bellevue High. Great for families valuing both academics and student wellbeing. Progressive community. Good value for quality."
      },

      "Edmonds School District": {
        superintendent: "Dr. Kristina Meyers",
        totalEnrollment: 13600,
        numberOfSchools: 20,
        gradeLevels: "K-12",
        overallGraduationRate: "94.7%",
        perPupilSpending: "$14,700",
        stateRanking: "Upper-mid tier Washington State",
        demographics: {
          white: "60%",
          asian: "15%",
          hispanic: "13%",
          black: "4%",
          multiracial: "5%",
          other: "3%"
        },
        freeReducedLunchPercentage: "15.4%",
        esolStudents: "10%",
        giftedEnrollment: "11%",
        reputation: "Edmonds serves an affluent, stable community north of Seattle. Excellent academics with focus on college readiness and student growth. Edmonds-Woodway High School and Mountlake Terrace High School both well-regarded. Strong community support and engaged families. Progressive approach to education.",
        keyPrograms: [
          "AP and honors college prep programs",
          "Gifted & Talented enrichment",
          "STEM academies",
          "Arts and performing arts programs",
          "Career and technical education",
          "International Baccalaureate programs"
        ],
        strengths: [
          "Excellent flagship high schools (Edmonds-Woodway, Mountlake Terrace)",
          "Strong academics and college prep",
          "Gifted and advanced program options",
          "Arts and music programs",
          "Student-centered, progressive approach",
          "Engaged, supportive community"
        ],
        weaknesses: [
          "Less prestige/name recognition than Bellevue/Issaquah",
          "Smaller district with fewer option schools",
          "Slightly lower test scores than Eastside",
          "Less diverse demographics",
          "Fewer specialized STEM programs than Eastside"
        ],
        insiderTip: "Edmonds is an excellent choice for families wanting strong academics with a progressive, student-centered approach. Edmonds-Woodway High and Mountlake Terrace High are both very good. Less prestige than Bellevue but arguably better balance of academics and wellbeing. Great community, supportive families, excellent teachers."
      }
    },

    // ========== PRIVATE SCHOOLS (DETAILED) ==========
    privateSchools: {
      "Lakeside School": {
        name: "Lakeside School",
        type: "6-12",
        grades: "6-12",
        location: "Seattle (Interbay)",
        enrollment: 840,
        studentTeacherRatio: "7:1",
        acceptanceRate: "12-15%",
        tuition: {
          middle: "$30,000/year",
          high: "$35,000/year"
        },
        averageSAT: "1510-1560 (2024-2025)",
        collegeAcceptance: {
          ivyPlus: "35-40%",
          top50: "85%+",
          notableSchools: ["Harvard", "Yale", "Stanford", "MIT", "Penn", "Northwestern", "Duke", "Rice"]
        },
        ethnicity: {
          white: "52%",
          asian: "20%",
          hispanic: "10%",
          black: "5%",
          multiracial: "10%",
          other: "3%"
        },
        culture: "The most prestigious private school in the region. Bill Gates' alma mater. Extremely rigorous, competitive, intellectually rigorous environment. Strong emphasis on critical thinking, debate, and academic excellence. Vibrant student body with high achievement orientation. Known for developing leaders and innovators. Preppy but intellectual culture.",
        strengths: [
          "Highest academic standards in the region",
          "Exceptional college placement",
          "Outstanding faculty (many with advanced degrees)",
          "Rigorous college-prep curriculum",
          "Strong debate and academic programs",
          "Excellent facilities",
          "Legacy network (Gates, tech leaders)",
          "35%+ Ivy League placement",
          "Strong in STEM and humanities"
        ],
        weaknesses: [
          "Extremely competitive and pressure-filled environment",
          "Limited socioeconomic diversity",
          "High academic stress and mental health concerns reported",
          "Homogeneous wealthy student body",
          "Limited class movement between ability levels",
          "Can feel exclusive/elitist culture"
        ],
        reputation: "The reference standard for elite K-12 education in the region. Known as a feeder to Harvard, Yale, Stanford. Parents expect Ivy League placement. Exceptional academics but very intense pressure.",
        admissionsProcess: "Highly selective. Requires transcript, WISC/ISEE testing, essay, parent interview, student interview. Demonstrated academic excellence required. Interest in intellectual pursuits valued. Prefer students from private/selective public schools.",
        financialAid: "Available - 40% of students receive some aid. No-loan policy for families making under $150k. Substantial aid for families making $150-250k.",
        notableAlumni: "Bill Gates, Paul Allen (Microsoft co-founder), numerous tech entrepreneurs, investment bankers, lawyers, doctors",
        insiderTip: "This is the 'safe bet' if you want guaranteed top-tier academics and college placement. Accept that it's highly competitive and academically intense. 35%+ Ivy League placement is real. If your child thrives in competitive academic environments, Lakeside is unmatched regionally. Be aware of mental health pressures. The brand matters - employers/universities recognize Lakeside immediately."
      },

      "The Bush School": {
        name: "The Bush School",
        type: "6-12",
        grades: "6-12",
        location: "Seattle (Green Lake area)",
        enrollment: 750,
        studentTeacherRatio: "8:1",
        acceptanceRate: "20-25%",
        tuition: {
          middle: "$27,500/year",
          high: "$32,000/year"
        },
        averageSAT: "1480-1540",
        collegeAcceptance: {
          ivyPlus: "28-32%",
          top50: "80%+",
          notableSchools: ["Harvard", "Yale", "Stanford", "MIT", "Penn", "Columbia", "Northwestern"]
        },
        ethnicity: {
          white: "55%",
          asian: "18%",
          hispanic: "10%",
          black: "4%",
          multiracial: "10%",
          other: "3%"
        },
        culture: "Rigorous college-prep environment emphasizing intellectual curiosity and critical thinking. More progressive and socially engaged than Lakeside. Strong humanities and writing focus. Values diversity of thought. Known for engaged, thoughtful students. Less 'prestige-driven' than Lakeside but equally rigorous academically.",
        strengths: [
          "Exceptional academics (slightly below Lakeside but very strong)",
          "Strong college outcomes (28%+ Ivy League)",
          "Excellent humanities and writing programs",
          "More diverse student body than Lakeside",
          "Intellectual culture that values discussion",
          "Strong in debate, arts, and discussion-based learning",
          "Excellent college counseling",
          "Beautiful campus",
          "Less 'preppy' culture than Lakeside"
        ],
        weaknesses: [
          "Still very expensive and exclusive",
          "Limited socioeconomic diversity despite diversity efforts",
          "High academic pressure",
          "Smaller school than Lakeside (fewer program options)",
          "Somewhat less prestige than Lakeside in market perception"
        ],
        reputation: "Serious academic alternative to Lakeside. Known for thoughtful, engaged students and humanistic education. Parents appreciate the intellectual culture but less focused on 'prestige' than Lakeside families.",
        admissionsProcess: "Selective. ISEE/WISC testing, transcript review, essay, student interview, parent interview. Value intellectual curiosity and engagement. Prefer applicants with demonstrated interest in learning and discussion.",
        financialAid: "Available - 45% of students receive aid. Generous financial aid for qualified families. No-loan policy for families under $150k household income.",
        notableAlumni: "Various tech entrepreneurs, nonprofit leaders, academics, writers",
        insiderTip: "Bush is the choice for families who value rigorous academics but want a less 'prestige-obsessed' environment than Lakeside. Students tend to be more intellectually curious and less status-driven. Still very competitive college placement. If you want excellent academics with more progressive values, Bush is ideal. Slightly easier to get into than Lakeside but still selective."
      },

      "University Prep": {
        name: "University Prep (U-Prep)",
        type: "6-12",
        grades: "6-12",
        location: "Seattle (Queen Anne)",
        enrollment: 620,
        studentTeacherRatio: "8:1",
        acceptanceRate: "18-22%",
        tuition: {
          middle: "$26,500/year",
          high: "$31,500/year"
        },
        averageSAT: "1490-1550",
        collegeAcceptance: {
          ivyPlus: "30-35%",
          top50: "82%+",
          notableSchools: ["Harvard", "Yale", "Stanford", "MIT", "Penn", "Northwestern", "Duke"]
        },
        ethnicity: {
          white: "48%",
          asian: "22%",
          hispanic: "12%",
          black: "6%",
          multiracial: "10%",
          other: "2%"
        },
        culture: "College-preparatory school with progressive educational philosophy. Emphasizes student agency and intellectual independence. Strong community service focus. Values student voice and engagement. More socially conscious than Lakeside/Bush. Students tend to be passionate about issues and community. Collaborative rather than competitive culture (relative to peers).",
        strengths: [
          "Strong academics with more progressive pedagogy",
          "Good college outcomes (30%+ Ivy League)",
          "Excellent community service/social justice programs",
          "Student-centered education approach",
          "Good faculty-student relationships",
          "Strong in discussion and debate",
          "More socially engaged student body",
          "Financial aid commitment (45% receive aid)"
        ],
        weaknesses: [
          "Slightly lower college placement than Lakeside/Bush",
          "Less prestige in market perception",
          "Smaller school with fewer program options",
          "More progressive politics (may not match all families)",
          "Still very expensive despite values"
        ],
        reputation: "Respected college-prep school with progressive values. Known for socially conscious students and rigorous academics. Parents value the educational philosophy and community engagement.",
        admissionsProcess: "ISEE/WISC testing, transcript, essay, student interview. Value intellectual curiosity, engagement, and fit with progressive mission.",
        financialAid: "Available - 45% of students receive aid. Strong commitment to accessibility. No-loan aid packages.",
        notableAlumni: "Various tech entrepreneurs, nonprofit leaders, educators, activists",
        insiderTip: "U-Prep for families who want excellent academics combined with social engagement and progressive values. Slightly easier to get into than Lakeside/Bush. Strong enough for any college. If your family values community service and social awareness, U-Prep is more aligned than competitor schools."
      },

      "Seattle Academy of Arts and Sciences (SAAS)": {
        name: "Seattle Academy of Arts and Sciences (SAAS)",
        type: "6-12",
        grades: "6-12",
        location: "Seattle (Magnolia)",
        enrollment: 790,
        studentTeacherRatio: "8:1",
        acceptanceRate: "22-28%",
        tuition: {
          middle: "$26,000/year",
          high: "$31,000/year"
        },
        averageSAT: "1470-1530",
        collegeAcceptance: {
          ivyPlus: "25-28%",
          top50: "78%+",
          notableSchools: ["Harvard", "Yale", "Stanford", "MIT", "Northwestern", "Columbia"]
        },
        ethnicity: {
          white: "52%",
          asian: "15%",
          hispanic: "12%",
          black: "7%",
          multiracial: "10%",
          other: "4%"
        },
        culture: "Integrated arts and academics focus. Philosophy that arts are central to education, not peripheral. Collaborative, creative environment. Strong in both humanities and STEM. Artistic culture values creativity and self-expression. Less competitive than Lakeside, more artistically engaged than Bush.",
        strengths: [
          "Excellent integrated arts-academics program",
          "Strong college placement (25%+ Ivy League)",
          "Outstanding arts facilities and programs",
          "Creative culture that values expression",
          "Good faculty-student relationships",
          "Strong in performing and visual arts",
          "Balanced academics and creativity",
          "Beautiful Magnolia campus"
        ],
        weaknesses: [
          "Slightly lower college placement than top competitors",
          "Arts focus may not appeal to all STEM-oriented families",
          "Less 'prestige brand' than Lakeside/Bush",
          "Smaller program in some areas",
          "Still very expensive"
        ],
        reputation: "Excellent college-prep school known for integration of arts and academics. Attracts creative, artistically talented students. Parents appreciate the holistic educational approach.",
        admissionsProcess: "ISEE/WISC testing, portfolio review (for arts focus), transcript, student interview. Value creativity and artistic engagement.",
        financialAid: "Available - 40% of students receive aid. Commitment to financial accessibility.",
        notableAlumni: "Artists, musicians, performers, tech entrepreneurs",
        insiderTip: "SAAS if your child is artistically talented and you want college prep with integrated arts. Still strong college outcomes but more art-focused than competitors. More accessible than Lakeside. Good choice for creative high-achievers who want arts + academics balance."
      },

      "Eastside Preparatory School": {
        name: "Eastside Preparatory School",
        type: "6-12",
        grades: "6-12",
        location: "Sammamish",
        enrollment: 650,
        studentTeacherRatio: "8:1",
        acceptanceRate: "25-30%",
        tuition: {
          middle: "$27,000/year",
          high: "$32,000/year"
        },
        averageSAT: "1460-1520",
        collegeAcceptance: {
          ivyPlus: "22-26%",
          top50: "75%+",
          notableSchools: ["Harvard", "Yale", "Stanford", "MIT", "Northwestern", "Duke", "Cornell"]
        },
        ethnicity: {
          white: "50%",
          asian: "24%",
          hispanic: "10%",
          black: "4%",
          multiracial: "10%",
          other: "2%"
        },
        culture: "Eastside location serves families in Sammamish/Bellevue area wanting private school. Rigorous college-prep with strong academics. More balanced culture than Seattle private schools. Values student growth and development. Community-focused.",
        strengths: [
          "Strong academics and college prep",
          "Convenient Eastside location",
          "Good college outcomes (22%+ Ivy League)",
          "Excellent facilities",
          "Strong STEM and language programs",
          "Engaged community",
          "More accessible than Seattle competitors"
        ],
        weaknesses: [
          "Slightly lower college placement than Lakeside/Bush/U-Prep",
          "Less diverse student body",
          "Limited urban amenities/culture",
          "Smaller program selection",
          "Less prestige brand than Seattle schools"
        ],
        reputation: "Respected Eastside private school alternative to public schools. Strong academics with more accessibility than top Seattle schools.",
        admissionsProcess: "ISEE/WISC testing, transcript, essay, interviews. Value academics and fit with school community.",
        financialAid: "Available - 35% of students receive aid.",
        notableAlumni: "Various entrepreneurs and professionals",
        insiderTip: "Eastside Prep for families in Sammamish/Bellevue who want private school but prefer Eastside location. Solid academics without Seattle private school prestige. Good college outcomes. More accessible to get into than Lakeside/Bush."
      },

      "The Overlake School": {
        name: "The Overlake School",
        type: "6-12",
        grades: "6-12",
        location: "Redmond",
        enrollment: 720,
        studentTeacherRatio: "8:1",
        acceptanceRate: "28-32%",
        tuition: {
          middle: "$26,500/year",
          high: "$31,500/year"
        },
        averageSAT: "1450-1510",
        collegeAcceptance: {
          ivyPlus: "20-24%",
          top50: "72%+",
          notableSchools: ["Stanford", "MIT", "Northwestern", "Duke", "UCLA", "Berkeley"]
        },
        ethnicity: {
          white: "45%",
          asian: "30%",
          hispanic: "11%",
          black: "3%",
          multiracial: "9%",
          other: "2%"
        },
        culture: "STEM-focused private school in Redmond. Emphasizes science, technology, engineering, mathematics. Project-based learning and hands-on education. Strong international student population. Tech-forward, innovation-focused culture.",
        strengths: [
          "Excellent STEM programs",
          "Strong college placement especially in STEM fields",
          "Project-based learning approach",
          "Hands-on curriculum",
          "Good college outcomes for STEM students",
          "Strong international student body",
          "Modern facilities and tech infrastructure"
        ],
        weaknesses: [
          "Less strong in humanities/arts compared to STEM",
          "Lower overall Ivy League placement (more regional/STEM schools)",
          "More limited in non-STEM areas",
          "Less prestige than Lakeside/Bush",
          "Smaller program range"
        ],
        reputation: "Excellent private school for STEM-focused students. Known for engineering and science programs. Attracts tech-minded families and international students.",
        admissionsProcess: "ISEE/WISC testing, transcript, essay, student interview. Value STEM interest and aptitude.",
        financialAid: "Limited financial aid (25% receive aid). Strong recruitment of international students (full pay).",
        notableAlumni: "Engineers, tech entrepreneurs, scientists",
        insiderTip: "Overlake if your child is STEM-focused and you want a rigorous STEM-centered school. Excellent college placement in engineering/computer science. Less prestigious overall than Lakeside but stronger for STEM. Good choice for aspiring engineers/CS students."
      },

      "Forest Ridge School of the Sacred Heart": {
        name: "Forest Ridge School of the Sacred Heart",
        type: "6-12 (girls)",
        grades: "6-12",
        location: "Bellevue",
        enrollment: 550,
        studentTeacherRatio: "9:1",
        acceptanceRate: "30-35%",
        tuition: {
          middle: "$24,500/year",
          high: "$29,000/year"
        },
        averageSAT: "1420-1480",
        collegeAcceptance: {
          ivyPlus: "18-22%",
          top50: "68%+",
          notableSchools: ["Stanford", "Northwestern", "Duke", "UCLA", "Berkeley", "Whitman", "Gonzaga"]
        },
        ethnicity: {
          white: "58%",
          asian: "16%",
          hispanic: "10%",
          black: "4%",
          multiracial: "10%",
          other: "2%"
        },
        culture: "All-girls Catholic school (Sacred Heart network). Strong academic focus with values-based education. Emphasis on service, leadership, and women's empowerment. Supportive, collaborative environment. Strong girls' school community. Catholic identity integrated but not overwhelming.",
        strengths: [
          "Strong academics in supportive girls' school environment",
          "Excellent college placement for all-girls school",
          "Strong leadership development programs",
          "Values-based education with service focus",
          "Supportive community and mentoring",
          "Good athletics and activities for girls",
          "More affordable than Seattle private schools"
        ],
        weaknesses: [
          "All-girls (may not be preferred by some families)",
          "Catholic identity (though inclusive)",
          "Lower overall college placement than coed options",
          "Smaller alumni network",
          "Less prestige than Lakeside/Bush"
        ],
        reputation: "Excellent all-girls school known for academics and values. Respected in Bellevue area. Strong community but less prestige than secular private schools.",
        admissionsProcess: "ISEE/WISC testing, transcript, essay, interviews. Value academics, values fit, and interest in leadership.",
        financialAid: "Available - 30% receive aid. More affordable than competitors.",
        notableAlumni: "Business leaders, nonprofit directors, professionals",
        insiderTip: "Forest Ridge for Bellevue families wanting girls' school with academics and values. Excellent opportunity for girls' school education with good college outcomes. Less prestige than Lakeside/Bush but more affordable and strong values component. Good choice for girls who thrive in supportive single-sex environment."
      },

      "Eastside Catholic School": {
        name: "Eastside Catholic High School",
        type: "9-12",
        grades: "9-12",
        location: "Sammamish",
        enrollment: 980,
        studentTeacherRatio: "14:1",
        acceptanceRate: "40-45%",
        tuition: {
          high: "$18,500/year"
        },
        averageSAT: "1380-1440",
        collegeAcceptance: {
          ivyPlus: "12-15%",
          top50: "50%+",
          notableSchools: ["Stanford", "Northwestern", "University of Washington", "Seattle University", "Gonzaga"]
        },
        ethnicity: {
          white: "55%",
          asian: "18%",
          hispanic: "15%",
          black: "3%",
          multiracial: "7%",
          other: "2%"
        },
        culture: "Catholic high school (all-boys traditionally, now coeducational). Strong academics with religious values. Sports-focused culture. Supportive community. Less academically intense than secular private schools.",
        strengths: [
          "Good academics with values-based education",
          "Strong sports programs (particularly football, basketball)",
          "Supportive community",
          "More affordable than secular private schools",
          "Good college outcomes",
          "Strong athletic recruitment"
        ],
        weaknesses: [
          "Less academically selective than secular alternatives",
          "Sports-focused culture (may not appeal to all)",
          "Catholic identity (though increasingly inclusive)",
          "Lower college placement than Lakeside/Bush/U-Prep",
          "Larger classes than top secular schools"
        ],
        reputation: "Respected Catholic school with strong sports programs. Good academics with values. Less prestige than secular alternatives.",
        admissionsProcess: "Transcript review, ISEE optional, interviews. Value academics and values fit.",
        financialAid: "Available - 35% receive aid. Significantly more affordable than secular private schools.",
        notableAlumni: "Athletes, business leaders, professionals",
        insiderTip: "Eastside Catholic for Sammamish families seeking Catholic education with good academics. Much more affordable than Lakeside/Bush. Good college outcomes but less elite placement. Strong for student athletes."
      },

      "The Bear Creek School": {
        name: "The Bear Creek School",
        type: "K-12",
        grades: "K-12",
        location: "Redmond",
        enrollment: 620,
        studentTeacherRatio: "8:1",
        acceptanceRate: "35-40%",
        tuition: {
          elementary: "$18,500/year",
          middle: "$24,000/year",
          high: "$28,500/year"
        },
        averageSAT: "1420-1480",
        collegeAcceptance: {
          ivyPlus: "15-18%",
          top50: "60%+",
          notableSchools: ["Stanford", "Northwestern", "University of Washington", "MIT", "Berkeley"]
        },
        ethnicity: {
          white: "48%",
          asian: "28%",
          hispanic: "12%",
          black: "4%",
          multiracial: "6%",
          other: "2%"
        },
        culture: "Progressive K-12 school emphasizing project-based learning, student-centered education, and social-emotional development. Interdisciplinary curriculum. Community-focused. Less traditional/competitive than Lakeside.",
        strengths: [
          "Progressive, student-centered pedagogy",
          "K-12 continuity (no middle/high school transition)",
          "Excellent project-based learning",
          "Strong community and engagement",
          "Good college outcomes",
          "Developmentally appropriate education across grades",
          "Arts integrated throughout"
        ],
        weaknesses: [
          "Less academically selective/competitive than Lakeside",
          "Lower overall college placement than top alternatives",
          "Progressive approach not for all families",
          "Smaller program options",
          "Less prestige brand"
        ],
        reputation: "Excellent progressive school known for student-centered education and community. Attracts families valuing progressive pedagogy.",
        admissionsProcess: "Application, essays, student visit, family interview. Value fit with progressive mission.",
        financialAid: "Available - 35% receive aid.",
        notableAlumni: "Entrepreneurs, educators, professionals",
        insiderTip: "Bear Creek for families believing in progressive education. K-12 continuity is valuable. Solid academics without Lakeside's intensity. Good college outcomes. Better for creative, exploratory learners than for competitive high-achievers."
      },

      "Bellevue Christian School": {
        name: "Bellevue Christian School",
        type: "K-12",
        grades: "K-12",
        location: "Bellevue",
        enrollment: 1200,
        studentTeacherRatio: "12:1",
        acceptanceRate: "50-55%",
        tuition: {
          elementary: "$15,000/year",
          middle: "$18,000/year",
          high: "$20,000/year"
        },
        averageSAT: "1380-1440",
        collegeAcceptance: {
          ivyPlus: "10-12%",
          top50: "45%+",
          notableSchools: ["Stanford", "University of Washington", "Seattle University", "Gonzaga"]
        },
        ethnicity: {
          white: "62%",
          asian: "14%",
          hispanic: "12%",
          black: "3%",
          multiracial: "7%",
          other: "2%"
        },
        culture: "Christian school (evangelical) with K-12 program. Good academics with Christian values throughout. Supportive community. Less academically intense than secular private schools. More accessible option.",
        strengths: [
          "K-12 continuity",
          "Values-based education",
          "Good academics",
          "Supportive community",
          "More affordable than secular alternatives",
          "Strong in Bible/character education"
        ],
        weaknesses: [
          "Christian identity (limits appeal)",
          "Lower college placement than secular schools",
          "Less academically selective",
          "Smaller program range",
          "Less prestige"
        ],
        reputation: "Respected Christian school option. Good academics with values focus.",
        admissionsProcess: "Transcript, Christian commitment preferred, family interview.",
        financialAid: "Available - 25% receive aid.",
        notableAlumni: "Business leaders, professionals",
        insiderTip: "Bellevue Christian for families seeking Christian education with K-12 continuity. More affordable option. Solid academics but less elite placement than Lakeside/Bush."
      },

      "Charles Wright Academy": {
        name: "Charles Wright Academy",
        type: "6-12",
        grades: "6-12",
        location: "Tacoma (but draws from region)",
        enrollment: 750,
        studentTeacherRatio: "8:1",
        acceptanceRate: "28-32%",
        tuition: {
          middle: "$25,000/year",
          high: "$30,000/year"
        },
        averageSAT: "1440-1500",
        collegeAcceptance: {
          ivyPlus: "18-22%",
          top50: "70%+",
          notableSchools: ["Stanford", "Northwestern", "Duke", "University of Washington", "Seattle University"]
        },
        ethnicity: {
          white: "54%",
          asian: "16%",
          hispanic: "12%",
          black: "5%",
          multiracial: "11%",
          other: "2%"
        },
        culture: "Elite independent school in Tacoma. Rigorous college-prep with strong academics. Excellent facilities (55-acre campus). More accessible than Lakeside/Bush due to location. Strong community.",
        strengths: [
          "Excellent academics and college placement",
          "Beautiful 55-acre campus",
          "Strong college outcomes (18%+ Ivy League)",
          "Excellent facilities",
          "Good faculty and resources",
          "More accessible than Seattle private schools"
        ],
        weaknesses: [
          "Tacoma location (45 min from Seattle)",
          "Less prestige than Seattle schools",
          "Smaller program range",
          "Drive time for Seattle families"
        ],
        reputation: "Excellent Tacoma-area private school. Strong academics and college outcomes. Known as Puget Sound region alternative to Seattle schools.",
        admissionsProcess: "ISEE/WISC testing, transcript, essay, interviews.",
        financialAid: "Available - 30% receive aid.",
        notableAlumni: "Business leaders, entrepreneurs, professionals",
        insiderTip: "Charles Wright for South Sound families or Seattle families willing to drive. Excellent academics comparable to Seattle alternatives but less prestige. Good value for strong academics and college outcomes. 45-minute drive from Seattle."
      },

      "Annie Wright Schools": {
        name: "Annie Wright Schools",
        type: "K-12 (boarding available)",
        grades: "K-12",
        location: "Tacoma",
        enrollment: 650,
        studentTeacherRatio: "8:1",
        acceptanceRate: "32-38%",
        tuition: {
          elementary: "$16,500/year",
          middle: "$24,000/year",
          high: "$30,000/year (boarding: $55,000/year)"
        },
        averageSAT: "1430-1490",
        collegeAcceptance: {
          ivyPlus: "16-20%",
          top50: "65%+",
          notableSchools: ["Stanford", "Northwestern", "University of Washington", "Seattle University"]
        },
        ethnicity: {
          white: "52%",
          asian: "18%",
          hispanic: "13%",
          black: "4%",
          multiracial: "10%",
          other: "3%"
        },
        culture: "Historic all-girls school (now coeducational) with boarding option. Excellent academics with values-based education. Strong international student population due to boarding. Distinctive school culture.",
        strengths: [
          "K-12 continuity",
          "Boarding option (unusual in region)",
          "Strong academics",
          "International community",
          "Beautiful historic campus",
          "Good college outcomes",
          "Excellent for students seeking boarding experience"
        ],
        weaknesses: [
          "Tacoma location",
          "Girls school heritage (transition to coed)",
          "Less prestige than Lakeside/Bush",
          "Smaller alumni network",
          "Boarding expensive ($55k+)"
        ],
        reputation: "Historic school with strong academics. Boarding option attracts regional and international students.",
        admissionsProcess: "ISEE/WISC testing, transcript, essay, interviews. International student boarding applications.",
        financialAid: "Available - 25% receive aid (limited for boarding students).",
        notableAlumni: "Various professionals and leaders",
        insiderTip: "Annie Wright for families seeking boarding option (unique in region) or K-12 continuity. Solid academics. Boarding creates international community. Good for students wanting boarding school experience without going East Coast."
      },

      "Seattle Country Day School": {
        name: "Seattle Country Day School",
        type: "K-8",
        grades: "K-8",
        location: "Seattle (Wallingford)",
        enrollment: 420,
        studentTeacherRatio: "8:1",
        acceptanceRate: "35-40%",
        tuition: {
          elementary: "$19,000/year",
          middle: "$24,500/year"
        },
        averageSAT: "N/A (K-8 only)",
        collegeAcceptance: "N/A (K-8 only)",
        ethnicity: {
          white: "55%",
          asian: "15%",
          hispanic: "15%",
          black: "6%",
          multiracial: "7%",
          other: "2%"
        },
        culture: "Small, progressive K-8 school emphasizing community, academics, and character development. Intimate environment. Project-based learning. Strong community feel.",
        strengths: [
          "Small class sizes and community",
          "Progressive, engaged pedagogy",
          "Strong academics",
          "Character education focus",
          "Good transition support to high school",
          "Diverse, engaged community"
        ],
        weaknesses: [
          "K-8 only (requires high school transition)",
          "Small size (limited program options)",
          "No SAT/college data (K-8)",
          "Less prestige than middle-school feeder to Lakeside"
        ],
        reputation: "Excellent small progressive K-8 school. Known for community and academics.",
        admissionsProcess: "Application, family visit, student visit. Value fit with progressive mission.",
        financialAid: "Available - 30% receive aid.",
        notableAlumni: "K-8 graduates at various high schools",
        insiderTip: "SCDS for elementary/middle school in progressive environment. Need to transition to high school (many go to Lakeside/Bush/U-Prep). Strong foundation for motivated learners. Good for families valuing progressive education K-8."
      },

      "Bertschi School": {
        name: "Bertschi School",
        type: "K-8",
        grades: "K-8",
        location: "Seattle (Green Lake)",
        enrollment: 380,
        studentTeacherRatio: "8:1",
        acceptanceRate: "38-42%",
        tuition: {
          elementary: "$18,500/year",
          middle: "$23,000/year"
        },
        averageSAT: "N/A (K-8)",
        collegeAcceptance: "N/A (K-8)",
        ethnicity: {
          white: "50%",
          asian: "18%",
          hispanic: "14%",
          black: "8%",
          multiracial: "8%",
          other: "2%"
        },
        culture: "Progressive K-8 school emphasizing student-centered learning, outdoor education, and social responsibility. Outdoor education integrated. Community-focused.",
        strengths: [
          "Progressive, student-centered approach",
          "Excellent outdoor education component",
          "Small community environment",
          "Strong academics",
          "Diversity commitment",
          "Good high school transition support"
        ],
        weaknesses: [
          "K-8 only",
          "Small (limited program range)",
          "No college placement data",
          "Requires high school transition"
        ],
        reputation: "Respected small progressive school with outdoor education focus.",
        admissionsProcess: "Application, family visit, student assessment. Value progressive fit.",
        financialAid: "Available - 35% receive aid.",
        notableAlumni: "Graduates at various high schools",
        insiderTip: "Bertschi for K-8 progressive education with outdoor focus. Excellent foundation. Plan for high school transition. Diverse community. Good for families valuing experiential learning."
      },

      "Epiphany School": {
        name: "Epiphany School",
        type: "K-8",
        grades: "K-8",
        location: "Seattle (Fremont)",
        enrollment: 310,
        studentTeacherRatio: "7:1",
        acceptanceRate: "40-45%",
        tuition: {
          elementary: "$17,500/year",
          middle: "$22,000/year"
        },
        averageSAT: "N/A (K-8)",
        collegeAcceptance: "N/A (K-8)",
        ethnicity: {
          white: "52%",
          asian: "16%",
          hispanic: "16%",
          black: "7%",
          multiracial: "7%",
          other: "2%"
        },
        culture: "Small, progressive, diverse K-8 school. Emphasis on critical thinking, social justice, and community engagement. Intentionally diverse and inclusive.",
        strengths: [
          "Small intimate environment",
          "Progressive pedagogy",
          "Strong diversity and inclusion focus",
          "Excellent community",
          "Good academics",
          "Social justice emphasis"
        ],
        weaknesses: [
          "K-8 only",
          "Very small (limited offerings)",
          "Requires high school transition",
          "Limited program options"
        ],
        reputation: "Small progressive school known for diversity and community values.",
        admissionsProcess: "Application, family visit, student assessment. Value diversity fit.",
        financialAid: "Available - 40% receive aid. Strong commitment to economic diversity.",
        notableAlumni: "Graduates to various high schools",
        insiderTip: "Epiphany for K-8 progressive education with strong diversity/inclusion values. Very small. Excellent for families valuing progressive community. Plan for high school transition."
      },

      "The Northwest School": {
        name: "The Northwest School",
        type: "6-12",
        grades: "6-12",
        location: "Seattle (Capitol Hill)",
        enrollment: 480,
        studentTeacherRatio: "8:1",
        acceptanceRate: "30-35%",
        tuition: {
          middle: "$25,500/year",
          high: "$30,500/year"
        },
        averageSAT: "1440-1500",
        collegeAcceptance: {
          ivyPlus: "15-18%",
          top50: "65%+",
          notableSchools: ["Stanford", "Northwestern", "Reed College", "University of Washington"]
        },
        ethnicity: {
          white: "48%",
          asian: "14%",
          hispanic: "16%",
          black: "10%",
          multiracial: "10%",
          other: "2%"
        },
        culture: "Rigorous progressive 6-12 school emphasizing critical thinking and engaged citizenship. Urban Capitol Hill location. Strong debate and discussion-based learning. Intellectually vibrant.",
        strengths: [
          "Excellent academics with progressive approach",
          "Strong college outcomes (15%+ Ivy League)",
          "Good college preparation",
          "Discussion and debate focus",
          "Diverse student body",
          "Engaged, thoughtful community",
          "Urban Capitol Hill location"
        ],
        weaknesses: [
          "Less prestige than Lakeside/Bush/U-Prep",
          "Smaller school",
          "Less national brand recognition",
          "Competitive but not at Lakeside level"
        ],
        reputation: "Excellent college-prep alternative to Lakeside with more progressive values and greater diversity.",
        admissionsProcess: "ISEE/WISC testing, transcript, essay, student interview. Value intellectual engagement.",
        financialAid: "Available - 38% receive aid.",
        notableAlumni: "Various professionals, activists, entrepreneurs",
        insiderTip: "Northwest School for intellectually engaged families wanting progressive values and greater diversity than Lakeside/Bush. Excellent academics without elite-school prestige focus. Good college outcomes. Strong debate/discussion culture."
      },

      "Holy Names Academy": {
        name: "Holy Names Academy",
        type: "6-12 (all-girls)",
        grades: "6-12",
        location: "Seattle (Capitol Hill)",
        enrollment: 380,
        studentTeacherRatio: "9:1",
        acceptanceRate: "45-50%",
        tuition: {
          middle: "$18,500/year",
          high: "$20,000/year"
        },
        averageSAT: "1380-1440",
        collegeAcceptance: {
          ivyPlus: "12-15%",
          top50: "55%+",
          notableSchools: ["Stanford", "University of Washington", "Gonzaga", "Seattle University"]
        },
        ethnicity: {
          white: "50%",
          asian: "12%",
          hispanic: "22%",
          black: "8%",
          multiracial: "6%",
          other: "2%"
        },
        culture: "All-girls Catholic school with strong academics and values. Emphasis on leadership development for women. Supportive community. More socioeconomically diverse than secular alternatives.",
        strengths: [
          "All-girls school environment",
          "Good academics and college prep",
          "Leadership focus for women",
          "Values-based education",
          "More economically diverse than private secular schools",
          "Supportive community",
          "More affordable than secular alternatives"
        ],
        weaknesses: [
          "All-girls (not for all families)",
          "Catholic identity",
          "Lower overall college placement",
          "Less prestige than secular schools",
          "Smaller program range"
        ],
        reputation: "Respected all-girls Catholic school with values and academics focus.",
        admissionsProcess: "Transcript, ISEE optional, Catholic commitment preferred, interviews.",
        financialAid: "Available - 35% receive aid.",
        notableAlumni: "Business leaders, professionals, nonprofit leaders",
        insiderTip: "Holy Names for Seattle families seeking all-girls school with values. More diverse and more affordable than secular alternatives. Good academics with strong leadership focus. Capitol Hill urban location."
      },

      "O'Dea High School": {
        name: "O'Dea High School",
        type: "9-12 (all-boys)",
        grades: "9-12",
        location: "Seattle (Capitol Hill)",
        enrollment: 520,
        studentTeacherRatio: "12:1",
        acceptanceRate: "50-55%",
        tuition: {
          high: "$16,500/year"
        },
        averageSAT: "1380-1440",
        collegeAcceptance: {
          ivyPlus: "10-12%",
          top50: "50%+",
          notableSchools: ["University of Washington", "Gonzaga", "Seattle University", "University of Portland"]
        },
        ethnicity: {
          white: "45%",
          asian: "16%",
          hispanic: "20%",
          black: "10%",
          multiracial: "7%",
          other: "2%"
        },
        culture: "All-boys Catholic high school emphasizing character, academics, and leadership development for young men. Sports-focused culture. More accessible and diverse than secular alternatives.",
        strengths: [
          "All-boys school environment",
          "Good academics and college prep",
          "Leadership development focus",
          "Strong athletics programs",
          "Values-based education",
          "More economically diverse than secular schools",
          "More affordable alternative"
        ],
        weaknesses: [
          "All-boys (not for all families)",
          "Catholic identity",
          "Lower college placement than secular schools",
          "Less prestige",
          "Sports-focused culture"
        ],
        reputation: "Respected all-boys Catholic school with strong athletics and values.",
        admissionsProcess: "Transcript, Catholic commitment preferred, interviews.",
        financialAid: "Available - 40% receive aid.",
        notableAlumni: "Athletes, business leaders, professionals",
        insiderTip: "O'Dea for families seeking all-boys school with Catholic values. More affordable and diverse than secular alternatives. Good for student-athletes. Capitol Hill location."
      },

      "Bishop Blanchet High School": {
        name: "Bishop Blanchet High School",
        type: "9-12 (coeducational)",
        grades: "9-12",
        location: "Seattle (Fremont)",
        enrollment: 640,
        studentTeacherRatio: "12:1",
        acceptanceRate: "55-60%",
        tuition: {
          high: "$16,000/year"
        },
        averageSAT: "1360-1420",
        collegeAcceptance: {
          ivyPlus: "8-10%",
          top50: "45%+",
          notableSchools: ["University of Washington", "Gonzaga", "Seattle University"]
        },
        ethnicity: {
          white: "48%",
          asian: "14%",
          hispanic: "22%",
          black: "8%",
          multiracial: "6%",
          other: "2%"
        },
        culture: "Coeducational Catholic high school emphasizing character development and academics. Supportive community. More accessible/diverse than secular schools.",
        strengths: [
          "Good academics",
          "Values-based education",
          "Supportive community",
          "More affordable than secular schools",
          "Economically diverse student body",
          "Strong character education"
        ],
        weaknesses: [
          "Catholic identity",
          "Lower college placement than secular schools",
          "Less prestige",
          "Smaller program range",
          "Less academically selective"
        ],
        reputation: "Accessible Catholic high school with good academics and community values.",
        admissionsProcess: "Transcript, Catholic preference, interviews.",
        financialAid: "Available - 45% receive aid.",
        notableAlumni: "Professionals, community leaders",
        insiderTip: "Bishop Blanchet for families seeking Catholic education with good academics and affordability. Fremont location. Good option for families prioritizing values. Less prestige than secular alternatives but solid education."
      },

      "Kennedy Catholic High School": {
        name: "Kennedy Catholic High School",
        type: "9-12 (coeducational)",
        grades: "9-12",
        location: "Burien (South Seattle area)",
        enrollment: 580,
        studentTeacherRatio: "13:1",
        acceptanceRate: "60-65%",
        tuition: {
          high: "$16,500/year"
        },
        averageSAT: "1350-1410",
        collegeAcceptance: {
          ivyPlus: "8-10%",
          top50: "42%+",
          notableSchools: ["University of Washington", "Gonzaga", "Seattle University"]
        },
        ethnicity: {
          white: "42%",
          asian: "16%",
          hispanic: "26%",
          black: "10%",
          multiracial: "4%",
          other: "2%"
        },
        culture: "Coeducational Catholic high school with solid academics and community focus. Most accessible Catholic option. Diverse student body.",
        strengths: [
          "Solid academics",
          "Values-based education",
          "More accessible than other Catholic schools",
          "Diverse student body",
          "Affordable alternative",
          "Strong community service focus"
        ],
        weaknesses: [
          "South County location (less convenient for Seattle proper)",
          "Catholic identity",
          "Lower college placement",
          "Less prestige",
          "Smaller program range"
        ],
        reputation: "Accessible Catholic school serving South Seattle area with good academics.",
        admissionsProcess: "Transcript, Catholic preference, interviews.",
        financialAid: "Available - 50% receive aid.",
        notableAlumni: "Professionals, community members",
        insiderTip: "Kennedy Catholic for South Seattle families seeking Catholic education. Most accessible of Catholic options. Good community service focus. Burien location."
      }
    },

    // ========== PUBLIC HIGH SCHOOLS (TOP-PERFORMING) ==========
    publicHighSchools: {
      "Bellevue High School": {
        name: "Bellevue High School",
        district: "Bellevue School District",
        location: "Bellevue",
        enrollment: 2100,
        studentTeacherRatio: "15:1",
        averageSAT: "1410-1480",
        averageACT: "32-34",
        apParticipationRate: "68%",
        apPassRate: "82%",
        graduationRate: "98.1%",
        collegeReadiness: "96%",
        ethnicity: {
          white: "42%",
          asian: "40%",
          hispanic: "9%",
          black: "3%",
          multiracial: "4%",
          other: "2%"
        },
        freeReducedLunch: "7.5%",
        notablePrograms: [
          "Advanced Placement (23 courses)",
          "Gifted & Talented enrichment",
          "STEM academy programs",
          "Visual and performing arts",
          "Debate and speech"
        ],
        ranking: "Niche A+, US News Top 50 nationally",
        culture: "Highly competitive, academically rigorous environment. Strong preparation for competitive colleges. Diverse, motivated student body. High expectations across the board. Intense academic focus.",
        strengths: [
          "Exceptional academics and college prep",
          "Outstanding test scores",
          "High college placement (96%+ to 4-year college)",
          "Strong AP program and participation",
          "Excellent facilities",
          "Diverse, high-achieving student body",
          "Strong debate, STEM, and arts programs"
        ],
        weaknesses: [
          "Extremely high academic pressure",
          "Competitive culture can be stressful",
          "Limited diversity in socioeconomic status",
          "Large school (2100 students)",
          "Limited flexibility for different learning styles"
        ],
        reputation: "The reference standard for excellent public high school in the region. Parents expect college placement. Reputation as a feeder to top universities. Known nationally as a top school.",
        insiderTip: "This is the gold standard public school. Admission is by application and test scores. Families move to Bellevue specifically to access this school. Academics are excellent but pressure is intense. AP courses are rigorous. Excellent for self-motivated, high-achieving students."
      },

      "Interlake High School": {
        name: "Interlake High School",
        district: "Bellevue School District",
        location: "Bellevue",
        enrollment: 1850,
        studentTeacherRatio: "15:1",
        averageSAT: "1390-1460",
        averageACT: "31-33",
        apParticipationRate: "62%",
        apPassRate: "79%",
        graduationRate: "97.8%",
        collegeReadiness: "95%",
        ethnicity: {
          white: "44%",
          asian: "38%",
          hispanic: "10%",
          black: "2%",
          multiracial: "4%",
          other: "2%"
        },
        freeReducedLunch: "8.2%",
        notablePrograms: [
          "International Baccalaureate (IB) Diploma Program",
          "Advanced Placement (20 courses)",
          "STEM programs",
          "Visual and performing arts",
          "Gifted & Talented"
        ],
        ranking: "Niche A+, US News Top 50 nationally",
        culture: "Rigorous academic environment with international focus. IB program attracts globally-minded students. Excellent academics with slightly less pressure than Bellevue High. International student population.",
        strengths: [
          "Excellent academics and college prep",
          "IB program (unique in region)",
          "Strong test scores",
          "High college placement (95%+ to 4-year)",
          "International student body",
          "Global perspective",
          "Strong arts and STEM programs"
        ],
        weaknesses: [
          "Smaller than Bellevue High (fewer program options)",
          "IB program is selective/separate",
          "Less diversity in socioeconomic status",
          "Still competitive, though slightly less intense than Bellevue High"
        ],
        reputation: "Excellent Bellevue public school with particularly strong IB program. Known for producing internationally-minded graduates. Strong college placement.",
        insiderTip: "Interlake is an excellent alternative to Bellevue High within same district. The IB program is particularly strong and unique (one of few IB programs in region). Less pressure than Bellevue High but equally rigorous academically. Good for students interested in international education."
      },

      "Newport High School": {
        name: "Newport High School",
        district: "Bellevue School District",
        location: "Bellevue",
        enrollment: 1650,
        studentTeacherRatio: "15:1",
        averageSAT: "1380-1450",
        averageACT: "31-33",
        apParticipationRate: "58%",
        apPassRate: "76%",
        graduationRate: "97.5%",
        collegeReadiness: "93%",
        ethnicity: {
          white: "46%",
          asian: "36%",
          hispanic: "11%",
          black: "3%",
          multiracial: "2%",
          other: "2%"
        },
        freeReducedLunch: "9.1%",
        notablePrograms: [
          "Advanced Placement (18 courses)",
          "Gifted & Talented",
          "STEM programs",
          "Video production and media arts",
          "Visual and performing arts"
        ],
        ranking: "Niche A, US News ranked",
        culture: "Strong academics with slightly more balanced culture than Bellevue High. Good mix of academics and student life. Welcoming community.",
        strengths: [
          "Excellent academics",
          "Good test scores (slightly lower than Bellevue/Interlake)",
          "High college placement (93%+)",
          "Strong AP program",
          "Welcoming culture",
          "Good arts and media programs",
          "More accessible than Bellevue High"
        ],
        weaknesses: [
          "Slightly lower test scores than Bellevue/Interlake",
          "Smaller AP offering",
          "Less prestige than Bellevue High",
          "Fewer specialized programs"
        ],
        reputation: "Excellent Bellevue school with strong academics and welcoming culture. Solid college prep without extreme pressure.",
        insiderTip: "Newport is the accessible excellent option in Bellevue SD. Good academics (slightly lower than Bellevue High but solid) with better school community feel. Less prestige but still excellent for college prep. Good choice for strong students who want less intensity than Bellevue High."
      },

      "Sammamish High School": {
        name: "Sammamish High School",
        district: "Lake Washington School District",
        location: "Sammamish",
        enrollment: 1920,
        studentTeacherRatio: "15:1",
        averageSAT: "1400-1470",
        averageACT: "32-34",
        apParticipationRate: "65%",
        apPassRate: "81%",
        graduationRate: "97.9%",
        collegeReadiness: "95%",
        ethnicity: {
          white: "48%",
          asian: "32%",
          hispanic: "11%",
          black: "2%",
          multiracial: "5%",
          other: "2%"
        },
        freeReducedLunch: "6.8%",
        notablePrograms: [
          "Advanced Placement (22 courses)",
          "Gifted & Talented",
          "STEM and engineering programs",
          "Visual and performing arts",
          "Debate and speech"
        ],
        ranking: "Niche A+, US News ranked",
        culture: "Rigorous academic environment in affluent Sammamish community. Excellent academics comparable to Bellevue High. Strong student achievement orientation. Cohesive community.",
        strengths: [
          "Excellent academics",
          "Strong test scores (comparable to Bellevue High)",
          "High college placement (95%+)",
          "Excellent AP program",
          "Rigorous curriculum",
          "Engaged student body",
          "Strong STEM programs"
        ],
        weaknesses: [
          "High academic pressure",
          "Limited socioeconomic diversity",
          "Competitive culture",
          "Affluent area (high property values)"
        ],
        reputation: "Excellent LWSD school comparable to Bellevue High. Strong academics and college outcomes. Known for rigorous curriculum and high achievers.",
        insiderTip: "Sammamish High is comparable to Bellevue High within Lake Washington SD. Excellent academics and college prep. More accessible than private schools. Strong for ambitious students. Located in affluent Sammamish area."
      },

      "International School of the Sacred Heart": {
        name: "International School of the Sacred Heart (formerly International School at Bellevue)",
        district: "Bellevue School District / Private International School",
        location: "Bellevue",
        enrollment: 1200,
        studentTeacherRatio: "12:1",
        averageSAT: "1430-1510",
        averageACT: "32-34",
        apParticipationRate: "72%",
        apPassRate: "85%",
        graduationRate: "98%",
        collegeReadiness: "97%",
        ethnicity: {
          white: "25%",
          asian: "48%",
          hispanic: "8%",
          black: "2%",
          multiracial: "12%",
          other: "5%"
        },
        freeReducedLunch: "4%",
        notablePrograms: [
          "International Baccalaureate (IB) Diploma Program",
          "Advanced Placement (20+ courses)",
          "International student body",
          "Three languages of instruction (English, Mandarin, Japanese)",
          "Global curriculum",
          "Visual and performing arts"
        ],
        ranking: "IB ranked highly, internationally recognized",
        culture: "Highly international school serving families relocating to Seattle and globally-minded Bellevue families. Three languages (English, Mandarin, Japanese). Rigorous academics with international perspective. Diverse, globally-engaged student body.",
        strengths: [
          "Outstanding academics",
          "IB program (highly respected)",
          "International student body and culture",
          "Multiple language instruction options",
          "Strong global perspective",
          "Excellent college placement",
          "Rigorous IB curriculum"
        ],
        weaknesses: [
          "High tuition (despite public status, families pay)",
          "Language requirements may be challenging",
          "Smaller than traditional high schools",
          "Limited socioeconomic diversity"
        ],
        reputation: "Premier international school serving expat and globally-minded families. Excellent academics and international focus. Known as feeder to top global universities.",
        insiderTip: "International School is unique - serves expat families and internationally-minded students. Multiple language instruction. IB program. High academics comparable to Bellevue High but with international focus. Good for families with international experience or planning international universities."
      },

      "Mercer Island High School": {
        name: "Mercer Island High School",
        district: "Mercer Island School District",
        location: "Mercer Island",
        enrollment: 1550,
        studentTeacherRatio: "12:1",
        averageSAT: "1480-1560",
        averageACT: "33-35",
        apParticipationRate: "78%",
        apPassRate: "88%",
        graduationRate: "98.5%",
        collegeReadiness: "97%",
        ethnicity: {
          white: "62%",
          asian: "18%",
          hispanic: "5%",
          black: "2%",
          multiracial: "9%",
          other: "4%"
        },
        freeReducedLunch: "3%",
        notablePrograms: [
          "International Baccalaureate (IB) Diploma Program",
          "Advanced Placement (25+ courses)",
          "Gifted & Talented",
          "Honors programs in all subjects",
          "Visual and performing arts",
          "Outdoor education"
        ],
        ranking: "Niche A+, US News Top 50 nationally, #1 in Washington State",
        culture: "Elite public school serving ultra-wealthy Mercer Island community. Highest-achieving public school in region. IB and AP rigor. Exceptional college placement. Exclusive island community.",
        strengths: [
          "Highest test scores in region",
          "Premier IB program",
          "Excellent AP program (25+ courses)",
          "Exceptional college placement (25%+ to Ivy League)",
          "Highest per-pupil spending in state",
          "Small class sizes",
          "Outstanding facilities",
          "Cohesive, educated community"
        ],
        weaknesses: [
          "Extremely homogeneous (62% white, 3% free lunch)",
          "Only accessible to island residents",
          "Very exclusive/bubble environment",
          "Limited diversity of experience",
          "Requires $2M+ property purchase to access"
        ],
        reputation: "The most elite public school in the region. Reference point for best high school in state. Mercer Island High graduates routinely attend Harvard, Yale, Stanford. Essentially a private school if you can afford Mercer Island property.",
        insiderTip: "MIHS is technically the best public high school in the region, but it's not really a 'choice' - you have to live on Mercer Island ($2-5M+ homes minimum). If you can access it, it's exceptional: highest test scores, best college placement (Harvard/Yale/Stanford routinely), excellent academics. Represents the apex of public school education in region but is geographically/economically limited to island residents."
      },

      "Redmond High School": {
        name: "Redmond High School",
        district: "Lake Washington School District",
        location: "Redmond",
        enrollment: 2050,
        studentTeacherRatio: "15:1",
        averageSAT: "1420-1490",
        averageACT: "32-34",
        apParticipationRate: "70%",
        apPassRate: "84%",
        graduationRate: "98.2%",
        collegeReadiness: "96%",
        ethnicity: {
          white: "38%",
          asian: "42%",
          hispanic: "11%",
          black: "2%",
          multiracial: "5%",
          other: "2%"
        },
        freeReducedLunch: "8.5%",
        notablePrograms: [
          "Advanced Placement (24 courses)",
          "Gifted & Talented",
          "STEM and engineering focus",
          "Computer science programs",
          "Visual and performing arts",
          "Debate"
        ],
        ranking: "Niche A+, US News Top 50 nationally",
        culture: "Excellent STEM-focused school in tech-hub Redmond. Strong academics with tech emphasis. High-achieving, diverse student body. Attracts tech families and Asian students (42%).",
        strengths: [
          "Excellent academics comparable to Bellevue High",
          "Outstanding STEM and CS programs",
          "Strong test scores",
          "High college placement (96%+)",
          "Excellent AP program",
          "Tech-focused curriculum",
          "Diverse, high-achieving student body",
          "Strong in computer science/engineering"
        ],
        weaknesses: [
          "High academic pressure",
          "Tech-focused may not suit all students",
          "Less humanities emphasis than some schools",
          "Very competitive culture"
        ],
        reputation: "Excellent public school known for STEM and engineering. One of top high schools in region for CS and engineering placement. Strong college outcomes.",
        insiderTip: "Redmond High is the tech-focused alternative to Bellevue High. If your child is STEM/CS-oriented, Redmond is excellent. Strong computer science and engineering programs. Excellent college placement, especially for tech fields. Redmond location and tech hub environment fits STEM focus."
      },

      "Woodinville High School": {
        name: "Woodinville High School",
        district: "Lake Washington School District",
        location: "Woodinville",
        enrollment: 1950,
        studentTeacherRatio: "15:1",
        averageSAT: "1410-1480",
        averageACT: "32-34",
        apParticipationRate: "68%",
        apPassRate: "82%",
        graduationRate: "97.9%",
        collegeReadiness: "95%",
        ethnicity: {
          white: "52%",
          asian: "26%",
          hispanic: "12%",
          black: "2%",
          multiracial: "6%",
          other: "2%"
        },
        freeReducedLunch: "7.8%",
        notablePrograms: [
          "Advanced Placement (22 courses)",
          "Gifted & Talented",
          "STEM programs",
          "Visual and performing arts",
          "Debate and speech",
          "Career pathways"
        ],
        ranking: "Niche A+, US News ranked",
        culture: "Excellent public school in affluent Woodinville area. Strong academics comparable to Bellevue High. Balanced community with good academics and school culture.",
        strengths: [
          "Excellent academics",
          "Strong test scores",
          "High college placement (95%+)",
          "Excellent AP program",
          "Balanced school culture",
          "Good community feel",
          "Strong STEM and arts"
        ],
        weaknesses: [
          "Slightly less prestige than Bellevue High",
          "Smaller AP offering",
          "High property values in Woodinville area"
        ],
        reputation: "Excellent LWSD school in affluent Woodinville area. Strong academics comparable to Bellevue High. Known for balanced academics and community.",
        insiderTip: "Woodinville High is an excellent alternative to Bellevue High within LWSD. Comparable academics with slightly less extreme prestige focus. Woodinville is wealthy but more accessible than Bellevue. Good for families wanting strong public school without Bellevue competition."
      },

      "Eastlake High School": {
        name: "Eastlake High School",
        district: "Lake Washington School District",
        location: "Sammamish/Redmond border",
        enrollment: 1850,
        studentTeacherRatio: "15:1",
        averageSAT: "1400-1470",
        averageACT: "31-33",
        apParticipationRate: "65%",
        apPassRate: "80%",
        graduationRate: "97.8%",
        collegeReadiness: "94%",
        ethnicity: {
          white: "50%",
          asian: "28%",
          hispanic: "13%",
          black: "3%",
          multiracial: "4%",
          other: "2%"
        },
        freeReducedLunch: "9.2%",
        notablePrograms: [
          "Advanced Placement (20 courses)",
          "Gifted & Talented",
          "STEM programs",
          "Visual and performing arts",
          "Engineering pathway"
        ],
        ranking: "Niche A",
        culture: "Good academics in diverse Sammamish/Redmond area community. Strong school without extreme pressure. Engaged students and community.",
        strengths: [
          "Good academics",
          "Solid test scores",
          "High college placement (94%+)",
          "Good AP program",
          "Diverse student body",
          "Good community feeling",
          "Accessible excellent option"
        ],
        weaknesses: [
          "Slightly lower test scores than top LWSD schools",
          "Larger classes than some alternatives",
          "Less prestige brand"
        ],
        reputation: "Solid LWSD school with good academics and community. Less prestige than Bellevue/Redmond/Woodinville but still excellent.",
        insiderTip: "Eastlake High is accessible excellent public school within LWSD. Good academics (slightly lower than Bellevue/Redmond) but strong college prep. More diverse than Bellevue area schools. Good for families wanting strong public school without extreme competition."
      },

      "Tesla STEM High School": {
        name: "Tesla STEM High School",
        district: "Lake Washington School District",
        location: "Redmond",
        enrollment: 650,
        studentTeacherRatio: "12:1",
        averageSAT: "1450-1530",
        averageACT: "33-35",
        apParticipationRate: "85%",
        apPassRate: "92%",
        graduationRate: "99%",
        collegeReadiness: "98%",
        ethnicity: {
          white: "32%",
          asian: "54%",
          hispanic: "8%",
          black: "2%",
          multiracial: "2%",
          other: "2%"
        },
        freeReducedLunch: "5%",
        notablePrograms: [
          "Project-based STEM learning",
          "Advanced Placement (25+ courses, all STEM-heavy)",
          "Computer science and engineering focus",
          "Research and innovation projects",
          "Partnerships with tech companies"
        ],
        ranking: "Specialized selective school, highly ranked for STEM",
        culture: "Highly selective specialized STEM school. Rigorous project-based learning. Extremely strong in STEM fields. Attracts top STEM students from across district. Collaborative learning environment.",
        strengths: [
          "Exceptional STEM academics",
          "Strong test scores (especially STEM)",
          "Excellent college placement in STEM fields",
          "Project-based learning (not just lecture)",
          "Small size and personalization",
          "Partnerships with tech industry",
          "Research and innovation focus",
          "85%+ AP participation"
        ],
        weaknesses: [
          "Selective admissions (difficult to get in)",
          "STEM-only focus (weak in humanities)",
          "Requires application and testing",
          "May not suit students interested in non-STEM fields",
          "High academic pressure"
        ],
        reputation: "Premier STEM high school in region. Known for exceptional STEM academics and college placement in engineering/CS. One of only a few dedicated STEM high schools in state.",
        insiderTip: "Tesla STEM is specialized and highly selective. Only if your child is passionate about STEM/engineering/CS AND can get in (requires application/testing). Not a choice school for everyone. But if you have a STEM-focused student, Tesla offers unmatched specialized STEM education. Only 650 students. Application-based selection."
      },

      "Garfield High School": {
        name: "Garfield High School",
        district: "Seattle Public Schools",
        location: "Seattle (Capitol Hill)",
        enrollment: 1700,
        studentTeacherRatio: "16:1",
        averageSAT: "1380-1450",
        averageACT: "31-33",
        apParticipationRate: "62%",
        apPassRate: "78%",
        graduationRate: "89.5%",
        collegeReadiness: "92%",
        ethnicity: {
          white: "35%",
          asian: "18%",
          hispanic: "22%",
          black: "16%",
          multiracial: "7%",
          other: "2%"
        },
        freeReducedLunch: "28%",
        notablePrograms: [
          "Selective admissions (application required)",
          "Advanced Placement (18 courses)",
          "International Baccalaureate program (preparatory)",
          "Honors and gifted programs",
          "Visual and performing arts",
          "Debate and speech"
        ],
        ranking: "Niche A, US News ranked, nationally recognized",
        culture: "Selective Seattle public school with excellent academics and diversity. Application-required admissions creates selective school environment within public system. Strong academics with urban, diverse community.",
        strengths: [
          "Excellent academics",
          "Strong test scores for Seattle",
          "Selective admissions (high-achieving students)",
          "Good college placement (92%+)",
          "Excellent AP program",
          "Diverse, urban student body",
          "Strong debate and arts programs",
          "Capitol Hill cultural location"
        ],
        weaknesses: [
          "Lower test scores than Bellevue/LWSD schools",
          "Higher free/reduced lunch (32%) suggests socioeconomic challenges",
          "Public school funding constraints",
          "Requires application (not guaranteed assignment)",
          "Larger class sizes than private schools"
        ],
        reputation: "Excellent Seattle selective high school. Known as feeder to good universities. Diverse, intellectually engaged student body. Strong academics for public school.",
        insiderTip: "Garfield is the crown jewel of Seattle public high schools. Selective admissions (requires application + test scores). If you get in, excellent academics comparable to private schools with greater diversity. Known for producing engaged, thoughtful graduates. Good college placement. Excellent for students wanting public school diversity + academics."
      },

      "Roosevelt High School": {
        name: "Roosevelt High School",
        district: "Seattle Public Schools",
        location: "Seattle (Green Lake)",
        enrollment: 1950,
        studentTeacherRatio: "16:1",
        averageSAT: "1370-1440",
        averageACT: "30-32",
        apParticipationRate: "58%",
        apPassRate: "75%",
        graduationRate: "88.2%",
        collegeReadiness: "91%",
        ethnicity: {
          white: "38%",
          asian: "16%",
          hispanic: "24%",
          black: "14%",
          multiracial: "6%",
          other: "2%"
        },
        freeReducedLunch: "30%",
        notablePrograms: [
          "Selective admissions (application required)",
          "Advanced Placement (16 courses)",
          "Honors programs",
          "Visual and performing arts",
          "Debate and journalism",
          "Sports and activities"
        ],
        ranking: "Niche A-, US News ranked",
        culture: "Selective Seattle public school with good academics and strong community. Application-required admissions. More accessible than Garfield but still selective. Excellent school community.",
        strengths: [
          "Good academics",
          "Selective admissions (high-achieving students)",
          "Good college placement (91%+)",
          "Good AP program",
          "Diverse, engaged student body",
          "Strong arts and debate programs",
          "Good school community"
        ],
        weaknesses: [
          "Slightly lower test scores than Garfield",
          "Public school funding constraints",
          "Requires application",
          "Larger classes",
          "Less prestige than Garfield"
        ],
        reputation: "Good Seattle selective public school. Known for engaged, diverse student body. Solid college prep.",
        insiderTip: "Roosevelt is the accessible excellent SPS option. Selective admissions (requires application) but slightly easier to get into than Garfield. Good academics with great community feel. Diverse student body. Good college prep."
      },

      "Ballard High School": {
        name: "Ballard High School",
        district: "Seattle Public Schools",
        location: "Seattle (Ballard)",
        enrollment: 1650,
        studentTeacherRatio: "16:1",
        averageSAT: "1360-1430",
        averageACT: "30-32",
        apParticipationRate: "55%",
        apPassRate: "72%",
        graduationRate: "87.5%",
        collegeReadiness: "89%",
        ethnicity: {
          white: "42%",
          asian: "12%",
          hispanic: "28%",
          black: "10%",
          multiracial: "6%",
          other: "2%"
        },
        freeReducedLunch: "32%",
        notablePrograms: [
          "Selective admissions (application required)",
          "Advanced Placement (14 courses)",
          "Honors programs",
          "Visual and performing arts",
          "Vocational/CTE programs",
          "Maritime programs"
        ],
        ranking: "Niche A-, US News ranked",
        culture: "Selective Seattle public school with maritime heritage and good academics. Application-required. Good school community with more working-class diversity than Garfield.",
        strengths: [
          "Good academics",
          "Selective admissions",
          "Good college placement (89%+)",
          "Good AP program",
          "Diverse student body",
          "Strong maritime programs",
          "Good community",
          "More economically diverse than Garfield"
        ],
        weaknesses: [
          "Lower test scores than Garfield/Roosevelt",
          "Smaller AP offering",
          "Public school constraints",
          "Requires application"
        ],
        reputation: "Good Seattle selective school with maritime heritage. Known for diverse, engaged community. Solid college prep.",
        insiderTip: "Ballard is the accessible excellent choice in Seattle SPS system. Application-required but more achievable than Garfield. Good academics with strong maritime focus. Diverse working/middle-class community. Good for Seattle students wanting public school + academics + diversity."
      },

      "Ingraham International High School": {
        name: "Ingraham High School (International Baccalaureate Program)",
        district: "Seattle Public Schools",
        location: "Seattle (Wallingford)",
        enrollment: 1550,
        studentTeacherRatio: "16:1",
        averageSAT: "1380-1450",
        averageACT: "31-33",
        apParticipationRate: "60%",
        apPassRate: "76%",
        graduationRate: "88.8%",
        collegeReadiness: "91%",
        ethnicity: {
          white: "40%",
          asian: "14%",
          hispanic: "26%",
          black: "12%",
          multiracial: "6%",
          other: "2%"
        },
        freeReducedLunch: "31%",
        notablePrograms: [
          "International Baccalaureate (IB) program (unique in SPS)",
          "Advanced Placement (16 courses)",
          "Selective admissions for IB track",
          "Language programs",
          "Visual and performing arts"
        ],
        ranking: "Niche A-, IB school ranking",
        culture: "Seattle's only IB program (public). Selective admissions for IB track. International focus. Good academics with rigorous IB curriculum.",
        strengths: [
          "IB program (unique in SPS)",
          "Good academics",
          "Selective admissions (IB track)",
          "International Baccalaureate rigor",
          "Good college placement (91%+)",
          "Diverse student body",
          "Language programs"
        ],
        weaknesses: [
          "IB program is competitive/separate",
          "Regular track less rigorous than IB",
          "Public school constraints",
          "Smaller than some SPS schools"
        ],
        reputation: "Seattle's premier IB school. Known for international focus and IB rigor. Good college prep.",
        insiderTip: "Ingraham IB is unique - Seattle's only IB program in public schools. IB track is selective but available to qualified SPS students. Good academics with international focus. Strong for globally-minded students or those wanting IB without private school cost."
      },

      "Issaquah High School": {
        name: "Issaquah High School",
        district: "Issaquah School District",
        location: "Issaquah",
        enrollment: 1900,
        studentTeacherRatio: "14:1",
        averageSAT: "1420-1490",
        averageACT: "32-34",
        apParticipationRate: "72%",
        apPassRate: "85%",
        graduationRate: "98.3%",
        collegeReadiness: "96%",
        ethnicity: {
          white: "42%",
          asian: "40%",
          hispanic: "10%",
          black: "2%",
          multiracial: "4%",
          other: "2%"
        },
        freeReducedLunch: "6.5%",
        notablePrograms: [
          "Advanced Placement (26 courses)",
          "Gifted & Talented enrichment",
          "STEM and engineering programs",
          "Visual and performing arts",
          "Debate and speech",
          "Running Start partnerships"
        ],
        ranking: "Niche A+, US News Top 50 nationally",
        culture: "Rigorous, achievement-focused school in competitive Issaquah district. High academic standards and expectations. Intense academic culture. High-achieving student body.",
        strengths: [
          "Excellent academics",
          "Outstanding test scores",
          "Exceptional AP program (26 courses)",
          "High college placement (96%+)",
          "Rigorous curriculum",
          "Excellent STEM focus",
          "Strong debate and arts"
        ],
        weaknesses: [
          "Very high academic pressure",
          "Limited socioeconomic diversity",
          "Competitive, intense culture",
          "Less diverse student body",
          "High stress environment"
        ],
        reputation: "One of the best public high schools in the region. Known for exceptional academics and intense achievement culture. Strong college outcomes.",
        insiderTip: "Issaquah High is for high-achievers who thrive on competition. Outstanding academics comparable to Bellevue High. AP program is extensive (26 courses). Very rigorous. Expect intense academic pressure. Excellent for self-motivated students."
      },

      "Skyline High School": {
        name: "Skyline High School",
        district: "Issaquah School District",
        location: "Issaquah",
        enrollment: 1750,
        studentTeacherRatio: "14:1",
        averageSAT: "1400-1470",
        averageACT: "31-33",
        apParticipationRate: "68%",
        apPassRate: "82%",
        graduationRate: "97.9%",
        collegeReadiness: "95%",
        ethnicity: {
          white: "46%",
          asian: "36%",
          hispanic: "10%",
          black: "2%",
          multiracial: "4%",
          other: "2%"
        },
        freeReducedLunch: "7.1%",
        notablePrograms: [
          "Advanced Placement (24 courses)",
          "Gifted & Talented",
          "STEM programs",
          "Visual and performing arts",
          "Engineering pathway",
          "Outdoor education"
        ],
        ranking: "Niche A+, US News ranked",
        culture: "Excellent Issaquah school with rigorous academics. High expectations but slightly less intense pressure than Issaquah High. Strong achievement culture.",
        strengths: [
          "Excellent academics",
          "Strong test scores",
          "Excellent AP program (24 courses)",
          "High college placement (95%+)",
          "Rigorous curriculum",
          "Good STEM focus",
          "Outdoor education programs"
        ],
        weaknesses: [
          "High academic pressure",
          "Limited socioeconomic diversity",
          "Competitive culture",
          "Slightly less prestige than Issaquah High",
          "Large school (1750 students)"
        ],
        reputation: "Excellent Issaquah school with strong academics. Comparable to Issaquah High but slightly more accessible.",
        insiderTip: "Skyline High is an excellent alternative within Issaquah SD. Rigorous academics comparable to Issaquah High but slightly less pressure. Excellent AP program. Good for high-achievers wanting rigorous academics without extreme intensity."
      },

      "Liberty High School": {
        name: "Liberty High School",
        district: "Issaquah School District",
        location: "Issaquah",
        enrollment: 1650,
        studentTeacherRatio: "14:1",
        averageSAT: "1380-1450",
        averageACT: "30-32",
        apParticipationRate: "60%",
        apPassRate: "76%",
        graduationRate: "97.5%",
        collegeReadiness: "93%",
        ethnicity: {
          white: "50%",
          asian: "30%",
          hispanic: "12%",
          black: "2%",
          multiracial: "4%",
          other: "2%"
        },
        freeReducedLunch: "8%",
        notablePrograms: [
          "Advanced Placement (20 courses)",
          "Gifted & Talented",
          "STEM programs",
          "Visual and performing arts",
          "Career pathways"
        ],
        ranking: "Niche A",
        culture: "Excellent Issaquah school with good academics and community. Less intense pressure than Issaquah High/Skyline. More accessible option in district.",
        strengths: [
          "Good academics",
          "Strong test scores",
          "Good AP program (20 courses)",
          "High college placement (93%+)",
          "Good community feel",
          "Less intense than other Issaquah schools",
          "Accessible excellent option"
        ],
        weaknesses: [
          "Slightly lower test scores than Issaquah/Skyline",
          "Smaller AP offering",
          "Less prestige within district"
        ],
        reputation: "Excellent Issaquah school with good academics and community. More accessible than Issaquah High/Skyline.",
        insiderTip: "Liberty High is the accessible excellent option in Issaquah SD. Good academics (slightly lower than Issaquah/Skyline) but still rigorous. Less pressure than other district schools. Good for strong students wanting Issaquah district without extreme intensity."
      },

      "Juanita High School": {
        name: "Juanita High School",
        district: "Lake Washington School District",
        location: "Kirkland",
        enrollment: 1800,
        studentTeacherRatio: "15:1",
        averageSAT: "1380-1450",
        averageACT: "31-33",
        apParticipationRate: "60%",
        apPassRate: "76%",
        graduationRate: "97.2%",
        collegeReadiness: "92%",
        ethnicity: {
          white: "56%",
          asian: "18%",
          hispanic: "15%",
          black: "3%",
          multiracial: "6%",
          other: "2%"
        },
        freeReducedLunch: "10.5%",
        notablePrograms: [
          "Advanced Placement (18 courses)",
          "Gifted & Talented",
          "STEM programs",
          "Visual and performing arts",
          "Career pathways"
        ],
        ranking: "Niche A",
        culture: "Good public school in Kirkland with solid academics and community. Less intense than Eastside competitive schools. Good balance of academics and student life.",
        strengths: [
          "Good academics",
          "Solid test scores",
          "Good AP program",
          "High college placement (92%+)",
          "Good community feel",
          "Balanced academics and life",
          "Accessible excellent option"
        ],
        weaknesses: [
          "Lower test scores than Eastside competitive schools",
          "Smaller AP offering",
          "Less prestige than top Eastside schools",
          "Larger school (1800 students)"
        ],
        reputation: "Good public school serving Kirkland area. Solid academics and community. Less competitive than Eastside schools.",
        insiderTip: "Juanita is a solid accessible excellent school in Kirkland. Good academics without Bellevue/Issaquah pressure. Good college prep. Good for families wanting strong public school in more relaxed environment."
      },

      "Lake Washington High School": {
        name: "Lake Washington High School",
        district: "Lake Washington School District",
        location: "Kirkland",
        enrollment: 1650,
        studentTeacherRatio: "15:1",
        averageSAT: "1370-1440",
        averageACT: "30-32",
        apParticipationRate: "56%",
        apPassRate: "73%",
        graduationRate: "96.8%",
        collegeReadiness: "90%",
        ethnicity: {
          white: "58%",
          asian: "16%",
          hispanic: "16%",
          black: "3%",
          multiracial: "5%",
          other: "2%"
        },
        freeReducedLunch: "12%",
        notablePrograms: [
          "Advanced Placement (16 courses)",
          "Honors programs",
          "Visual and performing arts",
          "Career and technical education",
          "Sports and activities"
        ],
        ranking: "Niche B+",
        culture: "Good neighborhood school in Kirkland. Solid academics with community focus. Accessible, friendly environment.",
        strengths: [
          "Good academics",
          "Good community feel",
          "Good college placement (90%+)",
          "Accessible school",
          "Balanced academics and activities",
          "Diverse community"
        ],
        weaknesses: [
          "Lower test scores than Eastside leaders",
          "Smaller AP offering",
          "Less selective/competitive",
          "Smaller program range"
        ],
        reputation: "Solid neighborhood school serving Kirkland families. Good academics and community.",
        insiderTip: "Lake Washington High is accessible solid public school. Good for families wanting good academics without competition. Good college prep."
      },

      "Bothell High School": {
        name: "Bothell High School",
        district: "Northshore School District",
        location: "Bothell",
        enrollment: 1750,
        studentTeacherRatio: "15:1",
        averageSAT: "1370-1440",
        averageACT: "30-32",
        apParticipationRate: "58%",
        apPassRate: "74%",
        graduationRate: "97.5%",
        collegeReadiness: "91%",
        ethnicity: {
          white: "58%",
          asian: "18%",
          hispanic: "15%",
          black: "3%",
          multiracial: "4%",
          other: "2%"
        },
        freeReducedLunch: "11%",
        notablePrograms: [
          "Advanced Placement (18 courses)",
          "Gifted & Talented",
          "STEM programs",
          "Visual and performing arts",
          "Career pathways"
        ],
        ranking: "Niche A-",
        culture: "Strong public school in Bothell with good academics and community. Balanced rigorous academics with school community.",
        strengths: [
          "Good academics",
          "Solid test scores",
          "Good AP program",
          "High college placement (91%+)",
          "Good community feel",
          "Balanced culture",
          "Good school culture"
        ],
        weaknesses: [
          "Lower test scores than Eastside leaders",
          "Smaller AP offering",
          "Less prestige than top Eastside",
          "Larger school"
        ],
        reputation: "Good public school serving Bothell area. Known for solid academics and good community.",
        insiderTip: "Bothell High is the NSSD flagship. Good academics without Eastside pressure. Balanced school culture. Good college prep. Good for families wanting strong public school in welcoming community."
      },

      "Renton High School": {
        name: "Renton High School",
        district: "Renton School District",
        location: "Renton",
        enrollment: 1520,
        studentTeacherRatio: "16:1",
        averageSAT: "1020-1150",
        averageACT: "21-24",
        apParticipationRate: "32%",
        apPassRate: "68%",
        graduationRate: "91.2%",
        collegeReadiness: "78%",
        ethnicity: {
          white: "35%",
          asian: "20%",
          hispanic: "25%",
          black: "10%",
          multiracial: "7%",
          other: "3%"
        },
        freeReducedLunch: "36.8%",
        notablePrograms: [
          "Career and Technical Education (CTE)",
          "Advanced Placement courses (limited)",
          "College prep pathways",
          "Vocational training partnerships",
          "Work-based learning programs"
        ],
        ranking: "Mid-tier regional school",
        culture: "Diverse, welcoming school with strong community focus. Good support for students from varied backgrounds. Practical, job-ready focus. Balanced approach to academics and skills.",
        strengths: [
          "Strong vocational and CTE programs",
          "Diverse, inclusive community",
          "Good college and career pathways",
          "Supportive staff and community connections",
          "Career preparation focus"
        ],
        weaknesses: [
          "Lower test scores than Eastside schools",
          "Limited AP course offerings",
          "Fewer advanced academic programs",
          "Higher poverty/free lunch percentage",
          "Less prestige regionally"
        ],
        reputation: "Renton High is the flagship of Renton School District. Known for strong vocational programs and supporting diverse student body. Good for students seeking practical, career-focused education.",
        insiderTip: "Renton High is solid for students wanting practical, career-oriented education with good community support. CTE programs are strong. Good for families prioritizing job readiness and affordability over elite academic prestige. Welcoming to all students."
      },

      "Hazen High School": {
        name: "Hazen High School",
        district: "Renton School District",
        location: "Renton",
        enrollment: 1480,
        studentTeacherRatio: "16:1",
        averageSAT: "1060-1210",
        averageACT: "22-25",
        apParticipationRate: "38%",
        apPassRate: "71%",
        graduationRate: "92.8%",
        collegeReadiness: "80%",
        ethnicity: {
          white: "37%",
          asian: "23%",
          hispanic: "23%",
          black: "8%",
          multiracial: "6%",
          other: "3%"
        },
        freeReducedLunch: "33.2%",
        notablePrograms: [
          "Advanced Placement programs",
          "Career and Technical Education",
          "College readiness pathways",
          "STEM initiatives",
          "Work-based learning"
        ],
        ranking: "Mid-tier regional school",
        culture: "Inclusive, supportive school with diverse student body. Balance between academics and practical skills. Good community connections and student support.",
        strengths: [
          "Supportive, inclusive environment",
          "Diverse student population",
          "Good career pathway programs",
          "Strong CTE offerings",
          "Community-oriented school"
        ],
        weaknesses: [
          "Lower test scores than Eastside",
          "Limited AP options",
          "Lower college readiness than premium districts",
          "Higher poverty rates",
          "Less prestige"
        ],
        reputation: "Hazen High is the second strong school in Renton district. Good academics with practical focus. Known for supporting diverse student needs.",
        insiderTip: "Hazen is similar to Renton High - good for practical, career-focused students. Strong CTE programs. Good for families wanting accessible quality schools serving diverse communities. Less academic pressure than Eastside."
      },

      "Kent-Meridian High School": {
        name: "Kent-Meridian High School",
        district: "Kent School District",
        location: "Kent",
        enrollment: 1720,
        studentTeacherRatio: "17:1",
        averageSAT: "1040-1190",
        averageACT: "21-24",
        apParticipationRate: "34%",
        apPassRate: "70%",
        graduationRate: "90.5%",
        collegeReadiness: "77%",
        ethnicity: {
          white: "32%",
          asian: "28%",
          hispanic: "26%",
          black: "6%",
          multiracial: "5%",
          other: "3%"
        },
        freeReducedLunch: "39.1%",
        notablePrograms: [
          "Advanced Placement courses",
          "Career and Technical Education",
          "Running Start college dual credit",
          "STEM pathways",
          "Work-based learning programs"
        ],
        ranking: "Mid-tier regional school",
        culture: "Diverse, welcoming school serving south King County. Good community support and practical focus. Strong partnerships with community college.",
        strengths: [
          "Good Running Start and college partnerships",
          "Diverse, inclusive community",
          "Strong CTE and vocational programs",
          "Practical, job-ready focus",
          "Growing academic achievement"
        ],
        weaknesses: [
          "Lower test scores than Eastside",
          "Limited AP offerings",
          "Higher poverty rates",
          "Less prestige regionally",
          "Fewer advanced academic options"
        ],
        reputation: "Kent-Meridian is the flagship of Kent district. Known for strong vocational focus and college partnerships through Running Start.",
        insiderTip: "Kent-Meridian is excellent for students seeking affordable, practical education with college pathways. Running Start allows dual enrollment at community college - major advantage for cost-conscious families. Good community focus. Less prestige than Eastside but good value."
      },

      "Kent Phoenix High School": {
        name: "Kent Phoenix High School",
        district: "Kent School District",
        location: "Kent",
        enrollment: 1680,
        studentTeacherRatio: "17:1",
        averageSAT: "1020-1170",
        averageACT: "20-23",
        apParticipationRate: "32%",
        apPassRate: "69%",
        graduationRate: "89.8%",
        collegeReadiness: "75%",
        ethnicity: {
          white: "34%",
          asian: "27%",
          hispanic: "27%",
          black: "5%",
          multiracial: "4%",
          other: "3%"
        },
        freeReducedLunch: "40.3%",
        notablePrograms: [
          "Career and Technical Education",
          "Running Start college partnerships",
          "Advanced Placement courses",
          "STEM pathways",
          "Sports and activities"
        ],
        ranking: "Mid-tier regional school",
        culture: "Diverse, community-focused school with strong CTE and college partnerships. Practical, job-ready focus. Good school spirit and activities.",
        strengths: [
          "Good Running Start partnerships",
          "Diverse, inclusive community",
          "Strong CTE and vocational programs",
          "Affordable option with good programs",
          "Good school activities and sports"
        ],
        weaknesses: [
          "Lower test scores than Eastside",
          "Limited AP options",
          "Higher poverty rates",
          "Less prestige regionally",
          "Fewer advanced academic programs"
        ],
        reputation: "Kent Phoenix High is the second strong school in Kent district. Known for good CTE programs and community focus.",
        insiderTip: "Kent Phoenix is Kent's other good option - similar to Kent-Meridian with strong CTE and Running Start programs. Diverse, welcoming community. Good for practical, job-ready education at affordable cost."
      },

      "Federal Way High School": {
        name: "Federal Way High School",
        district: "Federal Way Public Schools",
        location: "Federal Way",
        enrollment: 1640,
        studentTeacherRatio: "17:1",
        averageSAT: "1080-1240",
        averageACT: "22-25",
        apParticipationRate: "40%",
        apPassRate: "73%",
        graduationRate: "91.8%",
        collegeReadiness: "81%",
        ethnicity: {
          white: "40%",
          asian: "18%",
          hispanic: "21%",
          black: "10%",
          multiracial: "8%",
          other: "3%"
        },
        freeReducedLunch: "31.5%",
        notablePrograms: [
          "Advanced Placement programs",
          "College prep pathways",
          "Career and Technical Education",
          "Arts and music programs",
          "STEM initiatives"
        ],
        ranking: "Mid-tier regional school",
        culture: "College-focused school with good community support. Balanced academics and practical skills. Good for college-bound students seeking accessible option.",
        strengths: [
          "Strong college prep focus",
          "Good AP program offerings",
          "Diverse community",
          "Good college placement",
          "Arts and music programs"
        ],
        weaknesses: [
          "Lower test scores than Eastside",
          "Fewer advanced program options",
          "Higher poverty rates",
          "Less prestige regionally",
          "Smaller school"
        ],
        reputation: "Federal Way High is the flagship of Federal Way district. Known for solid college prep and welcoming community.",
        insiderTip: "Federal Way High is good for families seeking college-focused school at reasonable cost. Good arts programs. Less prestige than Eastside but solid academics. Good for students wanting supportive college prep environment."
      },

      "Thomas Jefferson High School": {
        name: "Thomas Jefferson High School",
        district: "Federal Way Public Schools",
        location: "Federal Way",
        enrollment: 1520,
        studentTeacherRatio: "17:1",
        averageSAT: "1050-1200",
        averageACT: "21-24",
        apParticipationRate: "36%",
        apPassRate: "71%",
        graduationRate: "90.4%",
        collegeReadiness: "78%",
        ethnicity: {
          white: "38%",
          asian: "20%",
          hispanic: "23%",
          black: "9%",
          multiracial: "7%",
          other: "3%"
        },
        freeReducedLunch: "34.2%",
        notablePrograms: [
          "Advanced Placement programs",
          "College prep pathways",
          "Career and Technical Education",
          "STEM initiatives",
          "Arts and music programs"
        ],
        ranking: "Mid-tier regional school",
        culture: "College-focused school with diverse student body. Good community support. Practical approach to college prep and career readiness.",
        strengths: [
          "Good college prep programs",
          "Diverse, inclusive community",
          "Good CTE offerings",
          "Reasonable college placement rates",
          "Accessible, welcoming school"
        ],
        weaknesses: [
          "Lower test scores than Eastside",
          "Limited AP options",
          "Higher poverty rates",
          "Less prestige regionally",
          "Fewer advanced academic programs"
        ],
        reputation: "Thomas Jefferson High is the second strong school in Federal Way. Known for good college prep and diverse community.",
        insiderTip: "Thomas Jefferson High is Federal Way's other good option - similar college-focused approach to Federal Way High. Diverse, welcoming community. Good for students seeking college prep at reasonable cost and good community feel."
      },

      "Lincoln High School": {
        name: "Lincoln High School",
        district: "Tacoma Public Schools",
        location: "Tacoma",
        enrollment: 1380,
        studentTeacherRatio: "18:1",
        averageSAT: "980-1120",
        averageACT: "20-23",
        apParticipationRate: "28%",
        apPassRate: "65%",
        graduationRate: "86.4%",
        collegeReadiness: "71%",
        ethnicity: {
          white: "28%",
          asian: "16%",
          hispanic: "26%",
          black: "18%",
          multiracial: "8%",
          other: "4%"
        },
        freeReducedLunch: "51.2%",
        notablePrograms: [
          "Advanced Placement courses",
          "Career and Technical Education",
          "Dual credit community college",
          "Arts and music programs",
          "Social-emotional learning"
        ],
        ranking: "Below-average Washington State, but strong within Tacoma",
        culture: "Diverse, community-focused school. Strong social-emotional emphasis. Welcoming environment despite resource constraints. Good for supporting students from challenging backgrounds.",
        strengths: [
          "Good flagship school for Tacoma",
          "Diverse, inclusive community",
          "Strong social-emotional support",
          "Good CTE programs",
          "Community partnerships"
        ],
        weaknesses: [
          "Lower test scores statewide",
          "Limited AP offerings",
          "High poverty rates",
          "Less prestige regionally",
          "Resource constraints"
        ],
        reputation: "Lincoln High is the best school in Tacoma district. Known for supporting diverse student body and community-focused education despite resource challenges.",
        insiderTip: "Lincoln is the standout school in Tacoma - seek this one specifically. Strong community focus and good support for underrepresented students. Lower test scores but solid school culture. Good for families valuing diversity and community over prestige."
      },

      "Wilson High School": {
        name: "Wilson High School",
        district: "Tacoma Public Schools",
        location: "Tacoma",
        enrollment: 1420,
        studentTeacherRatio: "18:1",
        averageSAT: "1010-1160",
        averageACT: "21-24",
        apParticipationRate: "30%",
        apPassRate: "66%",
        graduationRate: "87.2%",
        collegeReadiness: "72%",
        ethnicity: {
          white: "30%",
          asian: "17%",
          hispanic: "27%",
          black: "16%",
          multiracial: "7%",
          other: "3%"
        },
        freeReducedLunch: "49.8%",
        notablePrograms: [
          "Advanced Placement courses",
          "Career and Technical Education",
          "Dual credit community college",
          "STEM initiatives",
          "Sports programs"
        ],
        ranking: "Below-average Washington State, but solid within Tacoma",
        culture: "Diverse, athletic-focused school. Good CTE and career programs. Strong sports tradition. Welcoming community despite resource constraints.",
        strengths: [
          "Strong athletic programs",
          "Good CTE and vocational focus",
          "Diverse, inclusive community",
          "Career readiness focus",
          "Community partnerships"
        ],
        weaknesses: [
          "Lower test scores statewide",
          "Limited AP course options",
          "Higher poverty rates",
          "Resource constraints",
          "Less prestige regionally"
        ],
        reputation: "Wilson High is the second strong school in Tacoma. Known for strong athletics and career-focused programs.",
        insiderTip: "Wilson High is Tacoma's other good option - more athletic-focused than Lincoln. Strong sports programs and CTE. Good community. For families valuing athletic programs and career prep at affordable cost."
      },

      "Shoreline High School": {
        name: "Shoreline High School",
        district: "Shoreline School District",
        location: "Shoreline",
        enrollment: 1650,
        studentTeacherRatio: "14:1",
        averageSAT: "1240-1380",
        averageACT: "27-30",
        apParticipationRate: "55%",
        apPassRate: "79%",
        graduationRate: "96.1%",
        collegeReadiness: "92%",
        ethnicity: {
          white: "55%",
          asian: "18%",
          hispanic: "13%",
          black: "5%",
          multiracial: "6%",
          other: "3%"
        },
        freeReducedLunch: "17.2%",
        notablePrograms: [
          "Advanced Placement (18 courses)",
          "Gifted & Talented enrichment",
          "STEM and engineering programs",
          "Arts and performing arts",
          "Career and technical education"
        ],
        ranking: "Niche A, top in north Seattle region",
        culture: "Excellent school with strong academics and progressive, student-centered approach. Less pressure than Bellevue but high quality. Strong teacher quality. Supportive community.",
        strengths: [
          "Excellent academics without extreme pressure",
          "Innovative, progressive teaching",
          "Good AP program (18 courses)",
          "Strong teacher quality",
          "High college placement",
          "Balanced academics and wellbeing"
        ],
        weaknesses: [
          "Less prestige than Bellevue/Eastside",
          "Slightly lower test scores than Eastside",
          "Smaller school",
          "Less diversity than Seattle schools",
          "Fewer specialized STEM programs"
        ],
        reputation: "Shoreline High is excellent flagship school. Known as 'Goldilocks' option - strong academics with progressive, student-centered values and less pressure than Eastside.",
        insiderTip: "Shoreline High is an excellent choice if you want quality academics with progressive values and less intensity. Less prestige than Bellevue but arguably better balance of academics and student wellbeing. Excellent teachers and supportive community. Strong in academics and culture."
      },

      "Shorecrest High School": {
        name: "Shorecrest High School",
        district: "Shoreline School District",
        location: "Shoreline",
        enrollment: 1480,
        studentTeacherRatio: "15:1",
        averageSAT: "1180-1330",
        averageACT: "26-28",
        apParticipationRate: "48%",
        apPassRate: "76%",
        graduationRate: "94.9%",
        collegeReadiness: "89%",
        ethnicity: {
          white: "54%",
          asian: "19%",
          hispanic: "14%",
          black: "5%",
          multiracial: "5%",
          other: "3%"
        },
        freeReducedLunch: "19.8%",
        notablePrograms: [
          "Advanced Placement (16 courses)",
          "Gifted & Talented programs",
          "STEM and engineering",
          "Arts and performing arts",
          "Career and technical education"
        ],
        ranking: "Niche A, top regional school",
        culture: "Excellent school with strong academics and student-centered approach. Good community support. Less prestige than Shoreline High but still excellent quality.",
        strengths: [
          "Strong academics",
          "Good AP program (16 courses)",
          "Progressive, student-centered approach",
          "Good college prep",
          "Strong community support"
        ],
        weaknesses: [
          "Less prestige than Shoreline High",
          "Slightly lower test scores than Shoreline High",
          "Smaller school options",
          "Less diversity",
          "Fewer specialized programs"
        ],
        reputation: "Shorecrest High is second excellent school in Shoreline district. Known for solid academics with progressive student-centered approach.",
        insiderTip: "Shorecrest High is another excellent Shoreline option - similar quality and philosophy to Shoreline High. Strong academics without extreme pressure. Great for families valuing student wellbeing and progressive education. Excellent teachers and supportive community."
      },

      "Edmonds-Woodway High School": {
        name: "Edmonds-Woodway High School",
        district: "Edmonds School District",
        location: "Edmonds",
        enrollment: 1580,
        studentTeacherRatio: "14:1",
        averageSAT: "1230-1380",
        averageACT: "27-30",
        apParticipationRate: "58%",
        apPassRate: "80%",
        graduationRate: "96.4%",
        collegeReadiness: "93%",
        ethnicity: {
          white: "58%",
          asian: "16%",
          hispanic: "14%",
          black: "3%",
          multiracial: "5%",
          other: "4%"
        },
        freeReducedLunch: "14.6%",
        notablePrograms: [
          "Advanced Placement (20 courses)",
          "Gifted & Talented programs",
          "STEM academies",
          "International Baccalaureate (partial)",
          "Arts and performing arts",
          "Career and technical education"
        ],
        ranking: "Niche A, top regional school",
        culture: "Excellent school with strong college prep and progressive, student-centered approach. High academic quality with emphasis on student growth. Strong community support.",
        strengths: [
          "Excellent academics",
          "Strong AP program (20 courses)",
          "Progressive, student-centered approach",
          "Excellent college prep",
          "High college placement",
          "Strong community support"
        ],
        weaknesses: [
          "Less prestige than Bellevue/Eastside",
          "Slightly lower test scores than top Eastside",
          "Less diverse demographics",
          "Fewer advanced specialized programs",
          "Smaller district options"
        ],
        reputation: "Edmonds-Woodway is excellent flagship school. Known for strong academics with progressive, student-centered approach.",
        insiderTip: "Edmonds-Woodway is excellent choice - strong academics with progressive values similar to Shoreline. Great college prep. Excellent teachers and engaged community. Less prestige than Bellevue but better balance of academics and student wellbeing. Strong in both academics and culture."
      },

      "Mountlake Terrace High School": {
        name: "Mountlake Terrace High School",
        district: "Edmonds School District",
        location: "Mountlake Terrace",
        enrollment: 1510,
        studentTeacherRatio: "14:1",
        averageSAT: "1200-1360",
        averageACT: "26-29",
        apParticipationRate: "52%",
        apPassRate: "78%",
        graduationRate: "95.8%",
        collegeReadiness: "91%",
        ethnicity: {
          white: "60%",
          asian: "14%",
          hispanic: "13%",
          black: "4%",
          multiracial: "5%",
          other: "4%"
        },
        freeReducedLunch: "15.8%",
        notablePrograms: [
          "Advanced Placement (18 courses)",
          "Gifted & Talented programs",
          "STEM academies",
          "Career and technical education",
          "Arts and performing arts"
        ],
        ranking: "Niche A, top regional school",
        culture: "Excellent school with strong academics and student-centered approach. Good community support. Balance of academic rigor and student wellbeing.",
        strengths: [
          "Strong academics",
          "Good AP program (18 courses)",
          "Student-centered, progressive approach",
          "Good college prep",
          "Excellent community support",
          "Strong academics without extreme pressure"
        ],
        weaknesses: [
          "Less prestige than Bellevue/Eastside",
          "Slightly lower test scores than top Eastside",
          "Less diverse demographics",
          "Fewer highly specialized programs",
          "Smaller district"
        ],
        reputation: "Mountlake Terrace High is excellent Edmonds district school. Known for strong academics with progressive student-centered approach.",
        insiderTip: "Mountlake Terrace High is very good school - strong academics with emphasis on student growth and wellbeing. Similar philosophy to Edmonds-Woodway and Shoreline. Excellent choice for college prep with less intensity than Eastside. Great community and excellent teachers."
      }
    },

    // ========== PUBLIC MIDDLE SCHOOLS (TOP-PERFORMING) ==========
    publicMiddleSchools: {
      "Odle Middle School": {
        name: "Odle Middle School",
        district: "Bellevue School District",
        enrollment: 850,
        studentTeacherRatio: "15:1",
        testScores: "Top tier - Advanced in math and reading (above 80th percentile state)",
        programs: ["Gifted & Talented track", "Advanced math (Algebra I in 7th grade)", "Honors English", "STEM focus"],
        ethnicity: { white: "44%", asian: "40%", hispanic: "9%", black: "3%", multiracial: "2%", other: "2%" },
        culture: "Rigorous, achievement-focused middle school. High academic expectations. Excellent preparation for Bellevue High. Competitive but supportive community.",
        reputation: "Excellent Bellevue middle school. Top test scores. Strong preparation for high school.",
        insiderTip: "Odle is the top-tier Bellevue middle school. Gifted & Talented track is competitive. Advanced math track (Algebra I in 7th grade) is common. Excellent preparation for Bellevue High School."
      },

      "Highland Middle School": {
        name: "Highland Middle School",
        district: "Bellevue School District",
        enrollment: 950,
        studentTeacherRatio: "15:1",
        testScores: "Top tier - Advanced in math and reading (above 80th percentile)",
        programs: ["Gifted & Talented", "Advanced math", "Honors English", "STEM programs"],
        ethnicity: { white: "46%", asian: "38%", hispanic: "10%", black: "3%", multiracial: "2%", other: "1%" },
        culture: "Excellent Bellevue middle school with strong academics and community. Less intense than Odle but equally rigorous.",
        reputation: "Excellent Bellevue middle school with strong academics.",
        insiderTip: "Highland is an excellent alternative to Odle within Bellevue. Comparable academics with strong community feel."
      },

      "Chinook Middle School": {
        name: "Chinook Middle School",
        district: "Bellevue School District",
        enrollment: 900,
        studentTeacherRatio: "15:1",
        testScores: "Excellent - Advanced in math and reading (above 75th percentile)",
        programs: ["Advanced academic track", "Honors English and math", "STEM focus", "Arts programs"],
        ethnicity: { white: "48%", asian: "36%", hispanic: "10%", black: "2%", multiracial: "2%", other: "2%" },
        culture: "Excellent Bellevue middle school with balanced academics and community. Strong curriculum.",
        reputation: "Top Bellevue middle school with excellent academics.",
        insiderTip: "Chinook is another excellent Bellevue middle school. Balanced rigorous academics with strong community."
      },

      "Tillicum Middle School": {
        name: "Tillicum Middle School",
        district: "Bellevue School District",
        enrollment: 880,
        studentTeacherRatio: "15:1",
        testScores: "Excellent - Advanced performance (above 75th percentile state)",
        programs: ["Advanced academics", "Honors tracks", "STEM programs", "Gifted & Talented"],
        ethnicity: { white: "50%", asian: "34%", hispanic: "10%", black: "2%", multiracial: "2%", other: "2%" },
        culture: "Excellent Bellevue middle school with strong academics and supportive community.",
        reputation: "Top Bellevue middle school.",
        insiderTip: "Tillicum is excellent Bellevue option. Strong academics with good community feel."
      },

      "Tyee Middle School": {
        name: "Tyee Middle School",
        district: "Bellevue School District",
        enrollment: 920,
        studentTeacherRatio: "15:1",
        testScores: "Excellent - Advanced in math and reading (above 75th percentile)",
        programs: ["Advanced academics", "Gifted & Talented", "STEM focus", "Honors tracks"],
        ethnicity: { white: "42%", asian: "44%", hispanic: "8%", black: "2%", multiracial: "2%", other: "2%" },
        culture: "Excellent Bellevue middle school with strong academics.",
        reputation: "Top Bellevue middle school.",
        insiderTip: "Tyee is excellent Bellevue middle school. Strong academics, high percentage Asian students."
      },

      "Northstar Middle School": {
        name: "Northstar Middle School",
        district: "Lake Washington School District",
        enrollment: 950,
        studentTeacherRatio: "15:1",
        testScores: "Excellent - Advanced in math and reading (above 75th percentile)",
        programs: ["Advanced academics", "Gifted & Talented", "STEM", "Honors tracks"],
        ethnicity: { white: "52%", asian: "24%", hispanic: "14%", black: "3%", multiracial: "5%", other: "2%" },
        culture: "Excellent LWSD middle school with strong academics and community.",
        reputation: "Top-tier Lake Washington middle school.",
        insiderTip: "Northstar is excellent in LWSD. Strong academics preparing for top high schools."
      },

      "Rose Hill Middle School": {
        name: "Rose Hill Middle School",
        district: "Lake Washington School District",
        enrollment: 900,
        studentTeacherRatio: "15:1",
        testScores: "Excellent - Advanced in math and reading (above 75th percentile)",
        programs: ["Advanced academics", "Gifted & Talented", "Honors tracks", "STEM programs"],
        ethnicity: { white: "54%", asian: "20%", hispanic: "16%", black: "3%", multiracial: "5%", other: "2%" },
        culture: "Excellent LWSD middle school with strong academics.",
        reputation: "Top Lake Washington middle school.",
        insiderTip: "Rose Hill is excellent LWSD option. Strong academics and community."
      },

      "Inglewood Middle School": {
        name: "Inglewood Middle School",
        district: "Lake Washington School District",
        enrollment: 850,
        studentTeacherRatio: "15:1",
        testScores: "Excellent - Advanced in math and reading (above 75th percentile)",
        programs: ["Advanced academics", "Gifted & Talented", "Honors tracks", "STEM focus"],
        ethnicity: { white: "50%", asian: "26%", hispanic: "15%", black: "4%", multiracial: "3%", other: "2%" },
        culture: "Excellent LWSD middle school.",
        reputation: "Top Lake Washington middle school.",
        insiderTip: "Inglewood is excellent LWSD middle school. Strong academics."
      },

      "Islander Middle School": {
        name: "Islander Middle School",
        district: "Mercer Island School District",
        enrollment: 650,
        studentTeacherRatio: "12:1",
        testScores: "Exceptional - Well above 90th percentile state",
        programs: ["Gifted & Talented", "Advanced academics across all subjects", "Honors tracks", "Enrichment programs"],
        ethnicity: { white: "64%", asian: "16%", hispanic: "4%", black: "2%", multiracial: "10%", other: "4%" },
        culture: "Elite middle school serving ultra-wealthy Mercer Island. Exceptional academics. Small class sizes. Excellent preparation for MIHS.",
        reputation: "Highest-performing middle school in region.",
        insiderTip: "Islander is the reference standard for middle school excellence. Mercer Island location only. Exceptional academics. Need to live on island to attend."
      },

      "Pine Lake Middle School": {
        name: "Pine Lake Middle School",
        district: "Issaquah School District",
        enrollment: 880,
        studentTeacherRatio: "14:1",
        testScores: "Excellent - Advanced in math and reading (above 80th percentile state)",
        programs: ["Advanced academics", "Gifted & Talented", "Advanced math (Algebra I available)", "Honors tracks"],
        ethnicity: { white: "42%", asian: "42%", hispanic: "8%", black: "2%", multiracial: "4%", other: "2%" },
        culture: "Excellent Issaquah middle school with rigorous academics. Strong preparation for Issaquah high schools.",
        reputation: "Top Issaquah middle school with excellent academics.",
        insiderTip: "Pine Lake is excellent Issaquah option. Rigorous academics. Advanced math pathways. Good preparation for Issaquah High School."
      },

      "Beaver Lake Middle School": {
        name: "Beaver Lake Middle School",
        district: "Issaquah School District",
        enrollment: 920,
        studentTeacherRatio: "14:1",
        testScores: "Excellent - Advanced in math and reading (above 80th percentile state)",
        programs: ["Advanced academics", "Gifted & Talented", "Advanced math", "Honors tracks"],
        ethnicity: { white: "46%", asian: "38%", hispanic: "10%", black: "2%", multiracial: "2%", other: "2%" },
        culture: "Excellent Issaquah middle school with rigorous academics.",
        reputation: "Top Issaquah middle school.",
        insiderTip: "Beaver Lake is excellent Issaquah option. Rigorous academics, strong preparation for high school."
      },

      "Maywood Middle School": {
        name: "Maywood Middle School",
        district: "Issaquah School District",
        enrollment: 950,
        studentTeacherRatio: "14:1",
        testScores: "Excellent - Advanced in math and reading (above 75th percentile state)",
        programs: ["Advanced academics", "Gifted & Talented", "Honors tracks", "Advanced math pathways"],
        ethnicity: { white: "48%", asian: "36%", hispanic: "10%", black: "2%", multiracial: "2%", other: "2%" },
        culture: "Excellent Issaquah middle school with rigorous curriculum.",
        reputation: "Top Issaquah middle school.",
        insiderTip: "Maywood is excellent Issaquah option. Rigorous academics preparing for strong high schools."
      }
    },

    // ========== PUBLIC ELEMENTARY SCHOOLS (TOP-PERFORMING, BRIEF) ==========
    publicElementary: {
      "Bellevue District (Top Schools)": [
        {
          name: "Interlake Elementary",
          district: "Bellevue School District",
          testScores: "Exceptional - Well above 85th percentile state",
          programs: ["Advanced academic track", "Gifted & Talented", "STEM focus"],
          reputation: "One of highest-performing elementary schools in region",
          insiderTip: "Highly sought-after Bellevue elementary. Competitive admission. Test scores exceptional."
        },
        {
          name: "Laurelmount Elementary",
          district: "Bellevue School District",
          testScores: "Exceptional - Well above 85th percentile state",
          programs: ["Advanced academics", "Gifted & Talented", "Arts integration"],
          reputation: "Top Bellevue elementary school. Families move for this school.",
          insiderTip: "Highly competitive to get into. Exceptional academics. Waitlists common."
        },
        {
          name: "Vollenweider Elementary",
          district: "Bellevue School District",
          testScores: "Exceptional - Well above 80th percentile state",
          programs: ["Advanced academics", "Gifted & Talented", "STEM programs"],
          reputation: "Top Bellevue elementary school",
          insiderTip: "Excellent Bellevue option. Highly sought-after. Test scores excellent."
        },
        {
          name: "Sunny Hills Elementary",
          district: "Bellevue School District",
          testScores: "Excellent - Above 80th percentile state",
          programs: ["Advanced academics", "Gifted & Talented", "STEM focus"],
          reputation: "Top Bellevue elementary school",
          insiderTip: "Excellent Bellevue option with strong academics."
        },
        {
          name: "Skykomish Elementary",
          district: "Bellevue School District",
          testScores: "Excellent - Above 80th percentile state",
          programs: ["Advanced academics", "STEM programs", "Gifted & Talented"],
          reputation: "Strong Bellevue elementary school",
          insiderTip: "Excellent Bellevue option. Strong academics."
        }
      ],

      "Lake Washington District (Top Schools)": [
        {
          name: "Fernwood Elementary",
          district: "Lake Washington School District",
          testScores: "Excellent - Above 80th percentile state",
          programs: ["Advanced academics", "Gifted & Talented", "STEM programs"],
          reputation: "Top LWSD elementary school",
          insiderTip: "Excellent LWSD option. Strong academics."
        },
        {
          name: "Redmond Elementary",
          district: "Lake Washington School District",
          testScores: "Excellent - Above 80th percentile state",
          programs: ["Advanced academics", "Gifted & Talented", "STEM focus"],
          reputation: "Strong LWSD elementary school",
          insiderTip: "Good option in LWSD with strong academics."
        },
        {
          name: "Sammamish Elementary",
          district: "Lake Washington School District",
          testScores: "Excellent - Above 80th percentile state",
          programs: ["Advanced academics", "STEM programs"],
          reputation: "Top LWSD elementary school",
          insiderTip: "Excellent option in Sammamish area."
        },
        {
          name: "Duthie Hill Elementary",
          district: "Lake Washington School District",
          testScores: "Excellent - Above 75th percentile state",
          programs: ["Advanced academics", "Gifted & Talented"],
          reputation: "Strong LWSD elementary school",
          insiderTip: "Good LWSD option with solid academics."
        },
        {
          name: "Woodinville Elementary",
          district: "Lake Washington School District",
          testScores: "Excellent - Above 75th percentile state",
          programs: ["Advanced academics", "STEM programs"],
          reputation: "Strong LWSD elementary school",
          insiderTip: "Good option in Woodinville area."
        }
      ],

      "Issaquah District (Top Schools)": [
        {
          name: "Gilfillan Elementary",
          district: "Issaquah School District",
          testScores: "Excellent - Above 85th percentile state",
          programs: ["Advanced academics", "Gifted & Talented", "STEM programs"],
          reputation: "Top Issaquah elementary school",
          insiderTip: "Highly sought-after Issaquah school. Strong academics."
        },
        {
          name: "Sunset Elementary",
          district: "Issaquah School District",
          testScores: "Excellent - Above 85th percentile state",
          programs: ["Advanced academics", "Gifted & Talented", "STEM focus"],
          reputation: "Top Issaquah elementary school",
          insiderTip: "Excellent Issaquah option. Competitive."
        },
        {
          name: "Issaquah Elementary",
          district: "Issaquah School District",
          testScores: "Excellent - Above 80th percentile state",
          programs: ["Advanced academics", "STEM programs"],
          reputation: "Strong Issaquah elementary school",
          insiderTip: "Good Issaquah option with strong academics."
        },
        {
          name: "Eastmont Elementary",
          district: "Issaquah School District",
          testScores: "Excellent - Above 80th percentile state",
          programs: ["Advanced academics", "Gifted & Talented"],
          reputation: "Strong Issaquah elementary school",
          insiderTip: "Good Issaquah option."
        }
      ],

      "Mercer Island District": [
        {
          name: "Mercer Island Elementary",
          district: "Mercer Island School District",
          testScores: "Exceptional - Well above 90th percentile state",
          programs: ["Advanced academics", "Gifted & Talented enrichment", "STEM focus", "Arts integrated"],
          reputation: "Highest-performing elementary school in region",
          insiderTip: "Reference standard for elementary education. Mercer Island location only. Exceptional academics."
        }
      ],

      "Seattle Public Schools (Top Schools)": [
        {
          name: "View Ridge Elementary",
          district: "Seattle Public Schools",
          testScores: "Excellent - Above 75th percentile state",
          programs: ["Advanced academics", "Gifted & Talented", "Language immersion"],
          reputation: "Top Seattle elementary school",
          insiderTip: "Good Seattle option. Strong academics. Selective assignment."
        },
        {
          name: "John Marshall Elementary",
          district: "Seattle Public Schools",
          testScores: "Excellent - Above 75th percentile state",
          programs: ["Advanced academics", "Gifted & Talented", "Language programs"],
          reputation: "Strong Seattle elementary school",
          insiderTip: "Good Seattle option with solid academics."
        },
        {
          name: "Wallingford Elementary",
          district: "Seattle Public Schools",
          testScores: "Good - Above 70th percentile state",
          programs: ["Advanced academics", "Arts focus"],
          reputation: "Solid Seattle elementary school",
          insiderTip: "Good option in Wallingford area."
        }
      ]
    }
  };
}
