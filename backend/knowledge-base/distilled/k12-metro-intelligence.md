# K-12 Metro Intelligence — Gifted Programs, Magnet Pipelines & Feeder Patterns Across 15 Major Metros

## Purpose

This brain transforms Wayfinder's 91,354-record NCES school database from raw data into **actionable metro-area intelligence** for K-12 families. Each metro entry decodes the local gifted/talented ecosystem: what the program is called, how to qualify, when to test, which schools are the elite feeders, and how the local pipeline connects to the college admissions intelligence in the rest of the knowledge base.

**Data Infrastructure:** All school-level data references the NCES scraped dataset at `backend/data/scraped/k12-national/`. The SLM can look up any specific school by name, NCES ID, district, city, or state using the JSON files structured as `{STATE}_{level}.json`. Fields available: enrollment, demographics, magnet status, charter status, Title I, student-teacher ratio, grade span, locale type, and geographic coordinates.

**Cross-reference:** This brain sits atop `feeder-school-diagnostic.md` (which provides the 3-Tier Rigor Model) and connects to `essay-deep/elementary-school-master-brain.md` (WA-specific deep dive) and `essay-deep/middle-school-master-brain.md` (national math acceleration frameworks). The CogAT preparation protocol lives in `essay-deep/cogat-master-brain.md`.

**Compliance Gate:** Wayfinder provides school data and strategic frameworks. It does not guarantee admission to any gifted program, magnet school, or selective institution. See `compliance-brain.md`.

---

## HOW TO USE THIS BRAIN

**When a family mentions their city or school district**, the SLM should:
1. Look up the metro in this brain to identify the local gifted/GT program name and structure
2. Cross-reference the student's school in the NCES dataset for Tier classification (`feeder-school-diagnostic.md`)
3. Provide metro-specific strategic advice using the entry below
4. Connect the K-12 strategy to the college pipeline using the institutional DNA brains

---

## METRO 1: NEW YORK CITY

### The Gifted & Talented Landscape

**Program Name:** NYC G&T Programs (NYC DOE) — **MAJOR 2024-2026 RESTRUCTURE**

NYC's gifted landscape underwent a seismic shift. The previous citywide test (administered at age 4) was eliminated in 2021 under Mayor de Blasio, replaced by "Brilliant NYC" enrichment. Under Mayor Adams, a modified system was reinstated with significant changes:

- **Current Model (2025-2026):** Test-based admissions eliminated entirely. Eligibility determined by a 4-point rubric from teacher evaluations (early grades) or top 10% school ranking based on core subject grades (3rd grade). Applications open in spring. The eligibility pool expanded to approximately 85% of applicants.
- **Kindergarten G&T seats:** Still exist at district-level G&T programs and citywide G&T programs (e.g., Anderson School, NEST+m, TAG Young Scholars)
- **Citywide G&T schools** (the elite pipeline): Anderson School (PS 334, Upper West Side), NEST+m (Lower East Side), TAG Young Scholars (East Harlem), Brooklyn School of Inquiry
- **Qualification:** Varies by program. Citywide programs historically required 97th+ percentile on cognitive assessments. Current thresholds are in flux — verify annually.

### The Magnet & Specialized High School Pipeline

NYC's **Specialized High School Admissions Test (SHSAT)** is the single highest-stakes K-12 exam in America. It gates admission to:

| School | SHSAT Cutoff (2025→2026) | Seats | The Real Story |
|--------|----------------------|-------|----------------|
| **Stuyvesant** | 556→561 | ~850 | Most selective public HS in America. Admissions 100% SHSAT-based. No policy changes |
| **Bronx Science** | 518→525 | ~748 | Nobel laureate pipeline (8 alumni Nobels). Entirely test-based |
| **Brooklyn Tech** | 505→506 | ~1,490 | Largest specialized HS. 18 STEM majors. Most accessible specialized HS entry point |
| **Staten Island Tech** | ~520 | ~360 | Smallest, often overlooked. Strong per-capita outcomes |
| **Queens HS for Sciences** | ~530 | ~150 | Tiny, intense. Research-focused |
| **HSMSE, HSAS, Brooklyn Latin** | ~490-510 | 100-150 each | Smaller specialized schools |
| **LaGuardia** | Audition-based (NO SHSAT) | ~660 | The "Fame" school |

**SHSAT Prep Timeline:**
- **Grade 6-7:** Begin SHSAT prep (test taken October of 8th grade or 9th grade for late testers)
- **Summer before 8th grade:** Intensive prep window. NYC's free DREAM-SHSAT prep program + private tutoring market ($5K-$15K)
- **The equity issue:** Families in high-income neighborhoods spend $5K-$15K on SHSAT prep. Families in under-resourced neighborhoods often don't know the test exists until it's too late. Wayfinder should surface this information proactively.

### Elite Middle School Feeders

- **Mark Twain IS 239 (Coney Island):** Audition/test-based for gifted in specific talent areas. The "LaGuardia of middle schools."
- **NEST+m (G&T K-12 continuum):** Feeds directly into specialized HS pipeline
- **Anderson School (K-8):** The most academically intense K-8 in the city
- **District 2 middle schools (Manhattan):** Generally highest-performing traditional pipeline

### NCES Data Anchor

Query: `NY_high.json`, `NY_middle.json`, `NY_elementary.json` — filter by `city: "New York"` or specific borough names. Use `magnet: true` to identify specialized programs. NYC has ~1,800 schools in the dataset.

---

## METRO 2: SAN FRANCISCO BAY AREA / SILICON VALLEY

### The Gifted & Talented Landscape

**Program Name:** Varies by district — no unified Bay Area GT system

The Bay Area is a patchwork. Each district runs its own gifted identification:

| District | GT Program Name | Qualification | Key Detail |
|----------|----------------|---------------|------------|
| **San Francisco USD** | GATE (Gifted and Talented Education) | CogAT + teacher recommendation + portfolio review | SF uses a lottery-based system for many schools, reducing the impact of traditional GT identification |
| **Palo Alto USD** | No formal GT label — "differentiated instruction" | No separate GT program. Advanced students get in-class differentiation | Palo Alto's baseline IS elite. The median Gunn/Paly student is what other districts call "gifted" |
| **Cupertino Union SD** | GATE | CogAT, typically 96th+ percentile | Cupertino's baseline is extremely high — qualifying as "gifted" here requires scores that would be exceptional elsewhere |
| **Fremont USD** | GATE | CogAT + teacher nomination | Large district with strong STEM culture |
| **San Jose USD** | GATE | CogAT screening | Varied quality across schools |

**The Bay Area Reality:** In districts like Palo Alto, Cupertino, and parts of Fremont, the academic baseline is so high that traditional "gifted" identification is almost meaningless. A student in the 90th percentile nationally may be average in a Cupertino classroom. The strategic play is NOT gifted identification — it's math acceleration and extracurricular depth.

### The Magnet & Elite Public Pipeline

| School | Type | The Real Story |
|--------|------|----------------|
| **Lowell High School (SF)** | Selective public (merit-based, recently changed to lottery) | Was the Bay Area's Stuyvesant — merit-based admission using GPA + test. Changed to lottery in 2021, creating political firestorm. Academic culture remains strong but admission is now luck-based |
| **Mission San Jose HS (Fremont)** | Traditional public (attendance zone) | Not officially selective, but the attendance zone is self-selecting — families move to the area specifically for this school. AP participation >60%. De facto elite public |
| **Monta Vista HS (Cupertino)** | Traditional public (attendance zone) | Same dynamic as MSJHS. One of the highest AP participation rates in the state. The pressure cooker reputation is real |
| **Gunn/Paly HS (Palo Alto)** | Traditional public (attendance zone) | Palo Alto's two high schools are pipeline schools to Stanford. Student-teacher ratio ~16:1. Mental health support is a major institutional focus due to historical student stress concerns |
| **Lynbrook HS (San Jose)** | Traditional public | Strong STEM, high Asian-American population, competitive math/science culture |

### Math Competition & STEM Pipeline

The Bay Area's true K-12 advantage is the **extracurricular STEM ecosystem:**
- **Art of Problem Solving (AoPS)** centers in San Jose and online — the math competition preparation standard
- **MATHCOUNTS** chapters are hyper-competitive in Santa Clara County
- **Science Olympiad** teams from Mission San Jose and Monta Vista are nationally ranked
- **RSI (Research Science Institute) at MIT** recruits heavily from Bay Area schools

### NCES Data Anchor

Query: `CA_high.json`, `CA_middle.json`, `CA_elementary.json` — filter by cities: San Francisco, Palo Alto, Cupertino, Fremont, San Jose, Mountain View, Sunnyvale. Use `studentTeacherRatio` to identify well-resourced schools.

---

## METRO 3: LOS ANGELES

### The Gifted & Talented Landscape

**Program Name:** LAUSD GATE (Gifted and Talented Education) — the largest GT program in America

- **Identification:** OLSAT-8 for general GATE (95th percentile cutoff; 90th percentile for free/reduced lunch students) and a psychologist-administered IQ test for Highly Gifted programs (99.9th percentile). Universal screening at 2nd grade. Testing month: March. The district continued expanding cluster models and alternative equity-based thresholds for underrepresented demographics in 2024-2026
- **GATE designation categories:** Intellectual, High Achievement, Specific Academic, Creative, Leadership (unusual — most districts only test intellectual)
- **Scale:** LAUSD has ~500,000 students. The GATE-identified population is ~60,000-70,000 (roughly 12-14%)
- **GATE magnets:** Schools with dedicated GATE magnet programs cluster on the Westside and in the Valley

### The Magnet Pipeline

LAUSD operates the largest magnet school system in the country with **330+ magnet programs** accessible via the centralized eChoices platform. The 2025-2026 application window ran October 1 to November 15, 2024, using a priority point system (waitlist history, sibling enrollment, overcrowded home schools). Most seats awarded by computerized lottery; highly gifted programs require prior IQ or state testing eligibility:

| School | Type | The Real Story |
|--------|------|----------------|
| **LACES (Los Angeles Center for Enriched Studies)** | Magnet (application + lottery) | The most sought-after magnet in LA. Grades 6-12 continuum. Students apply via LAUSD's eChoices system. Highly diverse by design |
| **Walter Reed MS GATE Magnet** | Middle school magnet | Strong GATE feeder. Application-based |
| **Granada Hills Charter HS** | Charter | Largest charter HS in the US. Strong AP program, competitive academic decathlon team (national champions) |
| **Sherman Oaks CES for Enriched Studies** | Elementary magnet | GATE elementary pipeline |
| **Bravo Medical Magnet HS** | Magnet (medical sciences) | Pre-med pipeline starting in high school. Unique in LAUSD |

**Most Sought-After Magnets by Level (2025-2026):**
- **Elementary:** Wonderland Avenue Elementary Magnet, San Jose Street Highly Gifted Magnet, Gledhill Street Science/Tech Magnet
- **Middle:** Portola Highly Gifted Magnet, Millikan STEM Magnet, Walter Reed Middle Magnet
- **High:** North Hollywood Highly Gifted Magnet, Downtown Business Magnets, LACES (LA Center for Enriched Studies)

### Outside LAUSD

| District | Notable Schools |
|----------|----------------|
| **Beverly Hills USD** | Beverly Hills HS — small, well-resourced, strong college placement |
| **Santa Monica-Malibu USD** | Santa Monica HS — strong arts + academics |
| **Palos Verdes Peninsula USD** | Palos Verdes Peninsula HS — consistently top-ranked in LA County |
| **San Marino USD** | San Marino HS — extremely high API scores, predominantly Asian-American, competitive culture similar to Cupertino |

### NCES Data Anchor

Query: `CA_high.json`, `CA_middle.json`, `CA_elementary.json` — filter by `city: "Los Angeles"` or surrounding cities. Use `magnet: true` to identify magnet programs. LA County has ~2,500+ schools in the dataset.

---

## METRO 4: WASHINGTON DC / NORTHERN VIRGINIA / MARYLAND

### The Gifted & Talented Landscape

**The three-jurisdiction reality:** DC, Northern Virginia, and Maryland each operate completely independent school systems with different GT models.

**Fairfax County Public Schools (FCPS) — Virginia:**
- **Program Name:** AAP (Advanced Academic Programs) — Level IV (full-time center-based gifted)
- **Identification:** CogAT + NNAT3 (universal screening at 2nd grade, October through December). No absolute cutoff — historically the 90th to 95th percentile forms the automatic screening pool. FCPS formalized the removal of strict test-score cutoffs in 2024-2026, emphasizing holistic review of student portfolios, work samples, and teacher narratives
- **AAP Centers:** Students are bussed to designated AAP center schools for full-time gifted instruction (grades 3-8)
- **The pipeline:** AAP centers → Thomas Jefferson HS for Science and Technology (TJHSST)
- **Scale:** ~35,000 students in AAP (Level IV) out of ~180,000 total FCPS enrollment
- **AAP Referral Deadlines (2025-2026):** October 15, 2024 (newly enrolled students) and December 15, 2024 (general spring screening). Three dedicated elementary magnet schools + dozens of Full-Time AAP centers, managed via central referral forms and lottery. Magnet schools use lottery; AAP centers use a screening committee evaluating holistic portfolios including test scores, grades, and teacher referrals
- **Most Sought-After FCPS Schools by Level:** Elementary: Bailey's Primary (Magnet), Hunters Woods (Magnet/AAP), Mantua Elementary (AAP Center). Middle: Rachel Carson Middle (AAP), Longfellow Middle (AAP), Rocky Run Middle (AAP). High: Thomas Jefferson HS for Science and Technology (TJHSST) — the only selective HS option for FCPS residents

**Montgomery County Public Schools (MCPS) — Maryland:**
- **Program Name:** Centers for Enriched Studies (CES)
- **Identification:** CogAT + NWEA MAP (universal screening at 3rd grade, October-November). Approximately 90th percentile to qualify for the candidate pool. MCPS shifted from strict merit-based rank-order admissions to a lottery system for all students meeting baseline academic and cognitive criteria in 2024-2026
- **Magnet programs:** Blair HS Magnet (Science/Math/Computer Science), Poolesville HS Global Ecology program
- **Notable:** MCPS is one of the largest and most diverse districts in America. GT identification has been reformed for equity

**DC Public Schools (DCPS):**
- **Program Name:** No formal GT designation at scale. DC relies on selective schools
- **The pipeline runs through:** School Without Walls HS, Benjamin Banneker Academic HS

### The Thomas Jefferson Pipeline (THE Elite Feeder)

**Thomas Jefferson High School for Science and Technology (TJHSST)** is the #1-ranked public high school in America (multiple years).

| Metric | Value |
|--------|-------|
| Acceptance Rate | ~17-20% (550 seats from ~3,500 applicants) |
| Admission Test | Eliminated standardized testing in 2020. Now uses holistic review: 3.9+ GPA, Student Portrait Sheet, Problem-Solving Essay, and Experience Factors (e.g., ELL status, socioeconomic context). Significantly increased Black and Hispanic enrollment post-reform |
| Feeder Pattern | Primarily Fairfax County AAP centers. Students from Arlington, Loudoun, Prince William, and Falls Church also eligible |
| College Placement | 30%+ attend T20 universities. Heavy MIT, Stanford, CMU, Georgia Tech pipeline |
| Demographics | Post-reform admission has significantly increased Black and Hispanic enrollment. Asian-American students remain a plurality |

**TJ Prep Timeline:**
- **Grades 3-5:** Get into AAP Level IV (the feeder program)
- **Grade 6-7:** Build the portfolio — math competitions, science fair, community involvement
- **Grade 7 (fall):** Problem Solving Essay preparation
- **Grade 8 (fall):** Application submitted. Holistic review occurs December-February. Decisions in spring

### Other Elite Public High Schools in the DMV

| School | Jurisdiction | Type | The Real Story |
|--------|-------------|------|----------------|
| **Montgomery Blair HS Magnet** | MCPS, MD | Magnet-within-school | Nationally ranked math/science/CS magnet. Houses the Intel STS winners. Separate application |
| **Poolesville HS** | MCPS, MD | Magnet (Global Ecology / Humanities / STEM) | Small, rural-suburban magnet. Niche but elite |
| **School Without Walls** | DCPS | Selective | DC's most prestigious public HS. GW University campus integration |
| **McLean HS** | FCPS, VA | Traditional public (attendance zone) | Avg SAT ~1380. ~85% AP participation. Top traditional feeder to UVA, W&M, and national T50s |
| **Langley HS** | FCPS, VA | Traditional public (attendance zone) | Avg SAT ~1380. ~83% AP participation. Elite neighborhood profile with heavy UVA and T50 matriculation |
| **Oakton HS** | FCPS, VA | Traditional public (attendance zone) | Avg SAT ~1350. ~80% AP participation. High T50 acceptance volume driven by wealthy attendance zone |
| **James Madison HS** | FCPS, VA | Traditional public (attendance zone) | Avg SAT ~1330. ~78% AP participation. Consistent top-tier university presence and high National Merit count |
| **George Mason HS** | Falls Church City, VA | Traditional public | Tiny district, extremely well-resourced |

### NCES Data Anchor

Query: `VA_high.json` (Fairfax, Arlington, Loudoun counties), `MD_high.json` (Montgomery County), `DC_high.json`. The DMV region has some of the highest student-teacher ratios and AP participation rates in the national dataset.

---

## METRO 5: CHICAGO

### The Gifted & Talented Landscape

**Program Name:** CPS (Chicago Public Schools) Options for Knowledge (Gifted) + Selective Enrollment

Chicago operates a **two-track elite pipeline** — gifted elementary programs AND selective enrollment high schools — both using standardized testing:

- **Gifted Elementary (Classical Schools):** Regional Gifted Centers (RGC) and Classical Schools. Entry via CPS Admissions Exam (Regional Gifted Center Exam and Classical Schools Exam). No fixed percentile cutoff — admission is based on four socioeconomic tiers where Tier 4 often requires 99th percentile scores. Testing grades: Pre-K and Kindergarten primarily. Testing month: November through January. **2024-2026 policy change:** CPS officially eliminated the NWEA MAP test as a prerequisite for Selective Enrollment applications, and socioeconomic tiers are no longer used for waitlists in non-entry years
- **Academic Centers (7th-8th grade):** Bridge programs between gifted elementary and selective enrollment HS. Application-based with test scores
- **Selective Enrollment High Schools (SEHS):** The crown jewels. 11 schools with test-based admission

### Selective Enrollment High Schools

| School | Tier | The Real Story |
|--------|------|----------------|
| **Walter Payton College Prep** | Tier 1 | #1 in Illinois. Most selective — Tier 4 requires perfect 900 composite. Avg SAT ~1420/ACT ~30. 100% AP participation. Highest Ivy+ and elite liberal arts placement in the Midwest |
| **Northside College Prep** | Tier 1 | Close second to Payton — cutoffs jumped 4 points recently to require near-perfect scores for Tier 4. Avg SAT ~1400/ACT ~30. ~99% AP participation. Exceptional national T50 matriculation via unique seminar-style curriculum |
| **Jones College Prep** | Tier 1 | South Loop. Growing rapidly. Diverse. Strong AP offerings |
| **Whitney Young Magnet HS** | Tier 1 | West Side. Named for civil rights leader. Strong academics + diversity. Michelle Obama and others are alumni |
| **Lane Tech College Prep** | Tier 2 | Largest SEHS (4,500 students). Championship-level athletics + strong academics. More accessible entry point |
| **Lindblom Math & Science Academy** | Tier 2 | South Side. STEM-focused. Strong for underrepresented students in STEM |

**Admission System:** CPS uses a 600-point composite: 50% 7th-grade core GPA + 50% CPS HSAT (High School Admissions Test) score, distributed across four socioeconomic tiers. For top-tier schools (Payton, Northside), Tier 4 applicants require a perfect 900 composite score. Cutoffs have surged across all tiers, effectively eliminating the waitlist for students scoring below 600. Application via GoCPS platform; 2025-2026 window: September 24 to November 22, 2024.

**Most Sought-After CPS Schools by Level (2025-2026):**
- **Elementary:** Decatur Classical, Skinner North Classical, Lenart Regional Gifted Center
- **Middle:** Whitney Young Academic Center, Lane Tech Academic Center, Taft Academic Center
- **High:** Walter Payton College Prep, Northside College Prep, Whitney M. Young Magnet

**SEHS Prep Timeline:**
- **Grades 4-6:** Seek gifted/classical elementary or Academic Center placement
- **Grade 7 (fall):** Register for the Selective Enrollment Exam
- **Grade 7 (winter):** Exam administered (typically January)
- **Grade 7 (spring):** Results and acceptance notifications
- **The prep market:** Tutoring for the SEHS exam is a $3K-$10K market in Chicago

### Illinois Math & Science Academy (IMSA)

**IMSA** is a state-funded residential STEM academy for grades 10-12 in Aurora, IL.
- **Admission:** 1/3 GPA + 1/3 SAT/ACT score + 1/3 Review Committee rating, factored against geographic quotas. ~250 seats per class (~650 total). ~23% acceptance rate. No major policy changes; continues to balance academic composite scores with statutory demographic goals
- **The pipeline:** IMSA is the Illinois equivalent of TJ or Stuyvesant — a statewide magnet that feeds elite STEM universities
- **College placement:** Heavy MIT, CMU, UIUC, Northwestern pipeline
- **Free tuition + room/board** for all admitted students (state-funded)

### NCES Data Anchor

Query: `IL_high.json`, `IL_middle.json`, `IL_elementary.json` — filter by `city: "Chicago"` and surrounding suburbs. CPS magnet programs will appear with `magnet: true`.

---

## METRO 6: HOUSTON / DALLAS-FORT WORTH

### The Gifted & Talented Landscape

**Texas has the most aggressive state-mandated GT identification in America.** Texas Education Code §29.121 requires every school district to adopt a process for identifying gifted students in grades K-12. Districts must have GT services; it's state law.

**Houston ISD (HISD):**
- **Program Name:** Vanguard (GT magnet program)
- **Identification:** CogAT + Logramos or Iowa Assessments. No strict percentile cutoff — students must meet a minimum matrix score combining cognitive percentiles and achievement percentiles (usually requiring 80th to 90th percentiles). Universal screening at Kindergarten and 5th grade. Testing month: November. **2024-2026 policy change:** HISD rigidly enforced early testing deadlines (August 2025) for out-of-district applicants seeking Phase 1 enrollment under recent district administration changes
- **Vanguard magnets:** Dedicated campuses where all students are GT-identified (e.g., T.H. Rogers, Mark Twain, Pin Oak MS)
- **The pipeline:** Vanguard elementary → Vanguard middle → DeBakey HS for Health Professions or Carnegie Vanguard HS

**Most Sought-After HISD Magnets by Level (2025-2026):**
- **Elementary:** Harvard Elementary, Kolter Elementary, Wharton Dual Language Academy
- **Middle:** Pin Oak Middle, Lanier Middle, Hogg Middle
- **High:** DeBakey HS for Health Professions, Carnegie Vanguard High, Bellaire High

**HISD Application System:** HISD School Choice online portal. Phase 1 application window: early December 2024 to mid-February 2025. Selections by computerized lottery; Vanguard/GT programs mandate matrix score qualifications and GT testing prior to the draw.

**Dallas ISD:**
- **Program Name:** TAG (Talented and Gifted)
- **Identification:** CogAT + ITBS or Logramos. Matrix-based selection targeting the 90th percentile or above on specific subtests. Testing grades: Kindergarten through 5th grade. Testing month: November and December. **2024-2026 policy change:** DISD has increasingly integrated local school-based norms alongside national percentiles to identify historically underrepresented groups
- **TAG magnets:** Dealey Montessori, Travis Vanguard/Academy for the Talented and Gifted (ranked #1 US high school by multiple outlets), Irma Rangel Young Women's Leadership School

| School | District | The Real Story |
|--------|----------|----------------|
| **School for the Talented and Gifted (TAG) at Yvonne A. Ewell Townview Center** | Dallas ISD | Minimum 80 GPA + qualifying STAAR/MAP scores, followed by on-campus assessment. ~135 freshman seats. Consistently ranked #1 public HS in Texas. Entirely GT-identified student body. 100% college acceptance rate |
| **DeBakey HS for Health Professions** | HISD | Medical career magnet. Minimum 80 on the Houston ISD Magnet Matrix (GPA + standardized test percentiles). Shifted to a lottery system for eligible applicants — no longer requires the Health Sciences Readiness test. Avg SAT ~1330/ACT ~29. 100% AP participation. Elite pre-med placement to UT Austin, Rice, and top Texas universities |
| **Carnegie Vanguard HS** | HISD | IB World School. All-IB curriculum. Avg SAT ~1317/ACT ~28. 100% AP participation. Heavy T50 placement including Ivy League and Rice University |
| **School of Science and Engineering (SEM) at Townview** | Dallas ISD | STEM magnet sharing the Townview campus with TAG |
| **LASA (Liberal Arts and Science Academy)** | Austin ISD | Austin's selective magnet HS. Application + test-based. Strong T20 pipeline |

### Texas GT Testing Timeline

- **Kindergarten/1st grade:** Universal screening (most districts use NNAT or CogAT Screener)
- **2nd-3rd grade:** Full CogAT or OLSAT administration for nominated students
- **5th grade:** Re-evaluation and middle school magnet application window
- **8th grade:** HS magnet applications (TAG, DeBakey, Carnegie, LASA open applications in fall)

### NCES Data Anchor

Query: `TX_high.json`, `TX_middle.json`, `TX_elementary.json` — filter by cities: Houston, Dallas, Fort Worth, Austin, San Antonio. Texas has the largest school count in the dataset (~9,000+ K-12 schools).

---

## METRO 7: BOSTON

### The Gifted & Talented Landscape

**Program Name:** BPS (Boston Public Schools) Advanced Work Class (AWC) — **UNDER REFORM**

- **AWC (grades 4-6):** Historically the primary gifted track. Students tested in 3rd grade using Terra Nova or MAP. Top scorers invited to AWC schools
- **Exam Schools (grades 7-12):** Boston's three selective exam schools are the crown jewels
- **Reform status:** BPS has been reforming the exam school admission process since 2021, moving away from pure test-based admission toward a hybrid of GPA + test + zip code/SES factors

### The Exam School Pipeline

| School | Admission | The Real Story |
|--------|----------|----------------|
| **Boston Latin School (BLS)** | Exam-based (7th or 9th grade entry) | Founded 1635. Oldest public school in America. The most prestigious public school in New England. Feeds Ivy League at significant rates |
| **Boston Latin Academy (BLA)** | Exam-based | Second-tier exam school. Still highly selective. Strong academics |
| **John D. O'Bryant School of Mathematics and Science** | Exam-based | STEM-focused exam school. Smallest of the three |

**Exam School Admission (Post-Reform):**
- 80% of seats filled by: GPA (grades 5-6 for 7th grade entry) + NWEA MAP scores
- 20% reserved for high-performing students from underrepresented zip codes
- The pure ISEE-based exam was eliminated

**Outside BPS:** Many Boston-area families are in suburban districts with their own GT systems:

| District | GT Approach | Notable Schools |
|----------|------------|----------------|
| **Brookline** | No formal GT label — differentiated instruction. Baseline is high | Brookline HS — strong college placement |
| **Newton** | No formal GT — course acceleration available | Newton North/South HS — among the best publics in MA |
| **Lexington** | Challenge and Enrichment programs | Lexington HS — top-ranked, heavy STEM culture |
| **Wellesley** | Advanced Learner programs | Wellesley HS — affluent, well-resourced |

### NCES Data Anchor

Query: `MA_high.json`, `MA_middle.json`, `MA_elementary.json` — filter by Boston and surrounding cities (Brookline, Newton, Lexington, Wellesley, Cambridge).

---

## METRO 8: ATLANTA

### The Gifted & Talented Landscape

**Georgia state law mandates GT identification.** All districts must identify and serve gifted students. Georgia uses a multiple-criteria model requiring eligibility in at least 3 of 4 areas: mental ability (CogAT/OLSAT), achievement, creativity, and motivation.

**Fulton County Schools / Atlanta Public Schools:**
- **Identification:** CogAT + achievement tests + creativity assessment + motivation rating
- **GT threshold:** Typically 96th+ percentile on mental ability measure
- **GT delivery:** Pull-out enrichment in elementary, advanced content classes in middle/high school

### The Elite Public Pipeline

| School | District | The Real Story |
|--------|----------|----------------|
| **Gwinnett School of Mathematics, Science, and Technology (GSMST)** | Gwinnett County | Selective STEM magnet. Avg SAT ~1380/ACT ~30. 100% AP participation. Premier STEM pipeline to Georgia Tech, MIT, and T20 engineering programs |
| **Chamblee Charter HS** | DeKalb County | IB World School. Strong academics + diversity |
| **North Atlanta HS** | APS | IB program within APS. Growing reputation |
| **Walton HS** | Cobb County | Attendance-zone. Avg SAT ~1320/ACT ~28. ~82% AP participation. Top suburban feeder to UGA Honors, Emory, and Ivy League institutions |
| **Northview HS** | Fulton County | Attendance-zone. Avg SAT ~1340/ACT ~29. ~85% AP participation. Exceptionally high national T50 and out-of-state elite placement |
| **Chattahoochee HS** | Fulton County | Attendance-zone. Avg SAT ~1290/ACT ~27. ~78% AP participation. Strong presence at national top-tier universities and liberal arts colleges |
| **Alpharetta HS** | Fulton County | Attendance-zone. Avg SAT ~1280/ACT ~27. ~75% AP participation. Consistent pipeline to T50 schools driven by heavily resourced academics |
| **Decatur HS** | City of Decatur | Small, diverse, strong academics. "City Schools of Decatur" operates independently |

**The Georgia Tech pipeline:** Atlanta-area elite public HSs feed Georgia Tech at high rates. In-state GT admission (~30%) makes GT the natural target for metro Atlanta STEM students. Cross-reference `institutional-dna-value-tier.md` (Georgia Tech entry).

### NCES Data Anchor

Query: `GA_high.json`, `GA_middle.json`, `GA_elementary.json` — filter by Atlanta, Alpharetta, Decatur, Marietta, Roswell, and Gwinnett County cities.

---

## METRO 9: PHILADELPHIA

### The Gifted & Talented Landscape

**Program Name:** SDP (School District of Philadelphia) Gifted Programs + Criteria-Based Admission Schools

- **Gifted identification:** Pennsylvania law (Chapter 16) mandates gifted services. SDP uses cognitive ability testing (typically CogAT) + achievement + teacher nomination. Threshold: ~95th+ percentile
- **Gifted support:** Pull-out enrichment in elementary; criteria-based admission schools in middle/high

### The Criteria-Based Pipeline

| School | Level | The Real Story |
|--------|-------|----------------|
| **Julia R. Masterman School** | 5-12 | Philadelphia's most prestigious public school. Criteria-based admission. Avg SAT ~1410/ACT ~31. 99% AP participation. Unrivaled Ivy League and University of Pennsylvania placement in the state |
| **Central High School** | 9-12 | Second-oldest public HS in America (1836). Selective magnet. Avg SAT ~1300/ACT ~28. 95% AP participation. Heavy T50 matriculation including local elite colleges and state flagships |
| **Carver Engineering and Science HS** | 9-12 | STEM magnet. Application-based |
| **Palumbo Academy** | 9-12 | Academic magnet |

**Outside SDP:** The suburban "Main Line" districts (Lower Merion, Radnor, Haverford) are among the wealthiest in America with commensurately well-resourced public schools.

| School | Type | Avg SAT/ACT | AP Part. | T50 Placement |
|--------|------|-------------|----------|----------------|
| **Conestoga HS** (Tredyffrin-Easttown SD) | Attendance-Zone | ~1330/29 | ~85% | The definitive suburban T50 and Ivy+ feeder in the Philadelphia suburbs |
| **Radnor HS** (Radnor Twp SD) | Attendance-Zone | ~1340/29 | ~86% | Exceptional placement at highly selective universities and NESCACs |
| **Lower Merion HS** (Lower Merion SD) | Attendance-Zone | ~1320/28 | ~82% | Consistent Ivy+ presence supported by affluent, highly educated demographics |

### NCES Data Anchor

Query: `PA_high.json`, `PA_middle.json` — filter by Philadelphia and Main Line suburbs (Ardmore, Bryn Mawr, Wayne, Gladwyne).

---

## METRO 10: MIAMI / SOUTH FLORIDA

### The Gifted & Talented Landscape

**Program Name:** Miami-Dade County Public Schools (MDCPS) Gifted Programs

- **Identification:** State-approved intelligence test (WISC-V, Stanford-Binet, or CogAT). Threshold: 130 IQ (~98th percentile). Florida's **"Plan B" alternative matrix** allows 115 or 112 IQ for English Language Learners and low-income students. Testing grade: rolling (referred by teachers or parents). Testing month: year-round. **2024-2026 policy change:** MDCPS heavily expanded use of the Plan B alternative matrix to identify more Black, Hispanic, and low-income students who fall short of the strict 130 IQ threshold
- **GT delivery:** Full-time gifted centers (elementary) and advanced academic programs (secondary)

### The Magnet Pipeline

MDCPS operates **one of the largest magnet school systems in the country** with **400+ magnet programs across 119 schools**, managed through the M-DCPS Parent Portal. The 2025-2026 application window ran October 1, 2024 to January 15, 2025, relying primarily on a randomized lottery. Visual and performing arts programs require a formal audition; some advanced STEM schools require academic prerequisites prior to the lottery:

| School | Type | The Real Story |
|--------|------|----------------|
| **Design and Architecture Senior High (DASH)** | Magnet | #1 arts HS in Florida. Application + portfolio |
| **MAST Academy (Maritime and Science Technology)** | Magnet | Located on Virginia Key. Marine science + STEM focus |
| **Coral Gables Senior HS IB** | Magnet-within-school | Strong IB program. One of the highest IB enrollment rates in the state |
| **School for Advanced Studies (SAS)** | Dual-enrollment magnet | Students take Miami Dade College courses. Graduate with both HS diploma and AA degree |
| **iPrep Academy** | Magnet | Technology-integrated, project-based learning |

**Most Sought-After MDCPS Magnets by Level (2025-2026):**
- **Elementary:** Sunset Elementary (International), Coral Reef Elementary, North Dade Center for Modern Languages
- **Middle:** George Washington Carver Middle, South Miami Middle (Arts), Ada Merritt K-8 Center
- **High:** MAST Academy, Design and Architecture (DASH), Coral Reef Senior High

**The Florida Bright Futures connection:** Florida's merit-based scholarship program (Bright Futures) means that high-performing South Florida students can attend UF, FSU, or UCF at near-zero cost. This changes the K-12 strategy: the goal is not just elite HS → elite college, but also elite HS → Florida public flagship for free. Cross-reference `test-prep-strategic-brain.md` (NM Full-Ride / Benacquisto) and `institutional-dna-value-tier.md` (UF entry).

### NCES Data Anchor

Query: `FL_high.json`, `FL_middle.json`, `FL_elementary.json` — filter by Miami, Coral Gables, Hialeah, and Broward County cities.

---

## METRO 11: DENVER / COLORADO

### The Gifted & Talented Landscape

**Program Name:** DPS (Denver Public Schools) GT Programs + Colorado state-mandated identification

- **Colorado is one of the strongest GT mandate states.** The Exceptional Children's Educational Act (ECEA) requires all districts to identify and create Advanced Learning Plans (ALPs) for gifted students
- **Identification:** NNAT3 and CogAT (universal screening at Kindergarten, 2nd grade, and 6th grade; October-November). Threshold: 95th percentile for GT designation and 98th to 99th percentile for Highly Gifted and Talented (HGT) magnet programs. **2024-2026 policy change:** DPS expanded its "body of evidence" approach to reduce reliance on the 95th percentile hard cutoff, emphasizing non-verbal testing to identify bilingual students
- **ALP requirement:** Every identified gifted student must have an individualized Advanced Learning Plan — similar to an IEP but for acceleration

### The Elite Pipeline

| School | Type | The Real Story |
|--------|------|----------------|
| **D'Evelyn Junior/Senior HS** | Selective magnet (JeffCo) | Avg SAT ~1310/ACT ~28. ~90% AP participation. Top Colorado placement for national T50 universities and elite liberal arts colleges |
| **Denver School of Science and Technology (DSST)** | Charter network | High-performing STEM charter network. Strong college placement for historically underserved students |
| **George Washington HS IB** | DPS | Strong IB program. Application-based for IB track |
| **Colorado School of Mines** | University | Not K-12, but the pipeline terminates here for many CO STEM students. Cross-reference `institutional-dna-value-tier.md` |

**The Jefferson County (JeffCo) and Cherry Creek pipelines:**
- **Cherry Creek HS** (Cherry Creek SD) — Avg SAT ~1260/ACT ~27. ~75% AP participation. Massive graduating classes with a large, highly competitive elite university cohort
- **Fairview HS** (Boulder Valley SD) — Avg SAT ~1280/ACT ~28. ~80% AP participation. High T50 matriculation and heavy pipeline to CU Boulder honors programs
- **Boulder HS** (Boulder Valley SD) — Avg SAT ~1250/ACT ~26. ~70% AP participation. Strong placement in West Coast T50s, elite liberal arts, and national universities

### NCES Data Anchor

Query: `CO_high.json`, `CO_middle.json`, `CO_elementary.json` — filter by Denver, Aurora, Lakewood, Boulder, Centennial.

---

## METRO 12: RESEARCH TRIANGLE (RALEIGH-DURHAM-CHAPEL HILL)

### The Gifted & Talented Landscape

**Program Name:** WCPSS (Wake County Public Schools) AIG (Academically or Intellectually Gifted)

- **North Carolina mandates gifted identification.** Article 9B of NC General Statutes
- **Identification:** CogAT + Iowa Assessments (IOWA). Universal screening at 3rd grade, October-November. Threshold: 95th percentile on either test, or a combined matrix score placing the student in the 95th percentile overall. **2024-2026 policy change:** Under the 2022-2025 local AIG plan, WCPSS expanded identification pathways to include portfolio reviews and alternative assessments for students missing the strict 95th percentile cutoff
- **AIG delivery:** Differentiated instruction in regular classroom (most common) + pull-out enrichment + subject acceleration

### The Elite Pipeline

| School | District | The Real Story |
|--------|----------|----------------|
| **North Carolina School of Science and Mathematics (NCSSM)** | State-run (Durham) | **Free state residential STEM academy for grades 11-12.** ~1,000 students. Holistic review of grades, test scores, essays, leadership, and extracurricular STEM involvement. By law, an equal number of students accepted from each of NC's congressional districts. Avg SAT ~1450/ACT ~33. Massive feeder to UNC-Chapel Hill, Duke, NC State, and Ivies. ONE OF THE BEST-KEPT SECRETS IN AMERICAN EDUCATION |
| **Raleigh Charter HS** | Charter | Avg SAT ~1380/ACT ~30. ~95% AP participation. Exceptional per-capita T50 placement and National Merit counts |
| **East Chapel Hill HS** | CHCCS, Attendance-Zone | Avg SAT ~1300/ACT ~28. ~80% AP participation. Top traditional feeder to UNC-Chapel Hill and elite out-of-state colleges |
| **William G. Enloe Magnet** | WCPSS, Magnet/Zone | Avg SAT ~1280/ACT ~27. ~75% AP participation. Specialized magnet cohort heavily represented at T20s |
| **Green Hope HS** | WCPSS, Attendance-Zone | Avg SAT ~1290/ACT ~27. ~78% AP participation. Major suburban pipeline to elite universities and STEM programs |
| **Durham School of the Arts** | DPS | Arts magnet (6-12). Strong performing arts + academics |
| **Research Triangle HS** | Charter | STEM-focused charter in RTP area |

**The NCSSM advantage:** Families in the Triangle should know that NCSSM offers FREE residential STEM education for juniors and seniors, with outcomes rivaling T20 private high schools. It's state-funded. Any NC resident can apply. The application window is typically fall of sophomore year.

### NCES Data Anchor

Query: `NC_high.json`, `NC_middle.json` — filter by Raleigh, Durham, Chapel Hill, Cary, Apex.

---

## METRO 13: MINNEAPOLIS-ST. PAUL

### The Gifted & Talented Landscape

**Program Name:** MPS (Minneapolis Public Schools) "Talents Unlimited" and various district GT programs

- **Minnesota mandates GT services** under the Gifted and Talented Students Act
- **Identification varies by district.** Minneapolis and St. Paul use different models
- **The open enrollment system:** Minnesota allows open enrollment across district lines, meaning families can access GT programs in neighboring districts

### The Elite Pipeline

| School | Type | The Real Story |
|--------|------|----------------|
| **Edina HS** | Traditional public (Edina SD) | Avg SAT ~1330/ACT ~28. ~80% AP participation. Historic pipeline to elite Midwestern colleges (Northwestern, UChicago) and Ivies |
| **Wayzata HS** | Traditional public (Wayzata SD) | Avg SAT ~1340/ACT ~28. ~75% AP participation. Top traditional feeder in the state for national T50s and Ivy+ schools |
| **Minnetonka HS** | Traditional public | Avg SAT ~1320/ACT ~28. ~78% AP participation. High T50 placement driven by robust International Baccalaureate (IB) track |
| **Math and Science Academy** | Charter/Lottery | Avg SAT ~1380/ACT ~30. ~90% AP participation. Elite STEM placement across top national universities and engineering programs |
| **Nova Classical Academy** | Charter/Lottery | Avg SAT ~1360/ACT ~29. ~85% AP participation. Exceptional liberal arts, T20, and elite university matriculation |
| **Blake School / Breck School / SPA** | Private | The Twin Cities private school pipeline. Feeds T20 |

### NCES Data Anchor

Query: `MN_high.json`, `MN_middle.json` — filter by Minneapolis, St. Paul, Edina, Wayzata, Minnetonka, Eden Prairie.

---

## METRO 14: SEATTLE / PUGET SOUND

**COVERED IN DEPTH** in `essay-deep/elementary-school-master-brain.md` (107 WA-specific references).

**Key highlights for cross-reference:**
- **HiCap (Highly Capable):** Washington State mandates identification and service (RCW 28A.185.010). 98th+ percentile on CogAT typically required
- **Seattle Public Schools HiCap:** Universal screening in grades K-1. Pathway schools for grades 2-8
- **Bellevue SD, Issaquah SD, Lake Washington SD:** Each has own HiCap model
- **The equity gap:** HiCap identification in Seattle ranges from 3-5% (south Seattle) to 15-20% (north Seattle)
- **Lakeside School** (private): Bill Gates's alma mater. The Pacific Northwest's most elite private pipeline

**The SLM should route all Seattle-area queries to the full elementary-school-master-brain.md for detailed guidance.**

---

## METRO 15: PHOENIX / ARIZONA

### The Gifted & Talented Landscape

**Program Name:** Varies by district — Arizona has a strong GT mandate

- **Arizona law (ARS §15-779) requires GT programs** in all districts with 15+ students who qualify
- **Identification:** Cognitive ability test (CogAT or similar). Threshold typically 97th+ percentile on any one battery OR 95th+ composite
- **Delivery model:** Most districts offer self-contained gifted classrooms (elementary) and honors/AP tracks (secondary)

### The Elite Pipeline

| School | Type | The Real Story |
|--------|------|----------------|
| **Arizona School for the Arts (ASA)** | Charter (Phoenix) | Arts-integrated charter. Strong academics + performing arts |
| **BASIS Scottsdale** | Charter/Selective | Avg SAT ~1450/ACT ~32. 100% AP participation. National powerhouse for Ivy League, Stanford, and elite STEM admissions |
| **BASIS Chandler** | Charter/Selective | Avg SAT ~1440/ACT ~32. 100% AP participation. Mirrors Scottsdale with top-tier university placement and high National Merit counts |
| **Arizona College Prep** | Selective Magnet (Chandler USD) | Avg SAT ~1320/ACT ~28. ~95% AP participation. Rapidly growing T50 feeder in the East Valley |
| **University HS (Tucson USD)** | Magnet | Tucson's selective academic magnet. Test-based admission |
| **Hamilton HS (Chandler USD)** | Traditional public | Large, well-resourced. Strong AP program |
| **Desert Mountain HS (Scottsdale USD)** | Traditional public | Affluent attendance zone. Strong college placement |

**The BASIS phenomenon:** BASIS charter schools are the most unusual story in American K-12 education. They operate a curriculum 1-2 years ahead of grade level, require AP exams of ALL students, and produce test scores that rival the nation's best magnet schools — but they're open-enrollment charters. Multiple BASIS campuses rank in the top 10 nationally. The catch: the attrition rate is high (the rigor pushes out students who can't keep pace).

### NCES Data Anchor

Query: `AZ_high.json`, `AZ_middle.json`, `AZ_elementary.json` — filter by Phoenix, Scottsdale, Chandler, Gilbert, Tucson. Use `charter: true` to identify BASIS and other charter schools.

---

## STATE RESIDENTIAL STEM ACADEMIES — The Hidden Gems

**The most underutilized resource in American K-12 education.** Fifteen state-funded residential STEM high schools offer free tuition (and often free room and board) to state residents. These are the Illinois Math & Science Academy (IMSA) model replicated nationwide — selective admission, university-level coursework, and college placement outcomes rivaling the best private schools. Every family in these states should know these exist.

| State | School | Grades/Enrollment | Cost | Admission | Application | College Outcomes |
|-------|--------|-------------------|------|-----------|-------------|-----------------|
| **AL** | Alabama School of Math and Science (ASMS) | 10-12, ~300 | Free T/R/B | Top 17% selection; holistic GPA, ACT, maturity | Rolling, Aug-July | 100% acceptance; high National Merit Finalist counts |
| **AL** | Alabama School of Cyber Technology & Engineering (ASCTE) | 9-12, ~367 | Free T/R/B | STEM teacher recs, middle/high school grades, essays | Spring (March) | 30 average ACT; frequent service academy appointments |
| **AR** | Arkansas School for Math, Sciences, and the Arts (ASMSA) | 10-12, ~250 | Free T/R/B | 3.5 GPA; 19+ ACT (24+ for early entry) | Spring | Prominent placements in top-tier engineering schools |
| **IL** | Illinois Math and Science Academy (IMSA) | 10-12, ~650 | Free tuition; sliding scale R&B | 1/3 GPA + 1/3 SAT/ACT + 1/3 Review Committee; geographic quotas | Winter | ~23% acceptance. Heavy feeder to Ivies, MIT, Caltech, and UIUC |
| **IN** | Indiana Academy for Science, Math, and Humanities | 11-12, ~300 | Free tuition; R&B fee (aid available) | Strong GPA, SAT/ACT, essays | Winter/Spring | Extensive dual credits via Ball State University |
| **KS** | Kansas Academy of Math and Science (KAMS) | 11-12, ~80 | Free tuition (68 credits); R&B fee | Distinction in math/science; high GPA and ACT | Rolling, priority April | Graduates enter university as college juniors |
| **KY** | Gatton Academy of Math and Science | 11-12, ~200 | Free T/R/B | ACT Math 22 or SAT 540; completed Algebra I-II and Geometry | February 1 | Full college immersion and undergraduate research at WKU |
| **KY** | Craft Academy for Excellence in Science and Mathematics | 11-12, ~150 | Free T/R/B | 3.0 GPA; ACT 18 English/22 Math; completed core math | February 1 | Graduates earn 60+ college hours via Morehead State |
| **LA** | Louisiana School for Math, Science, and the Arts (LSMSA) | 10-12, ~350 | Free T/R/B | High GPA, ACT/SAT, essays, university-level prep | Spring | Strong national university and liberal arts admits |
| **ME** | Maine School of Science and Mathematics (MSSM) | 9-12, ~130 | Free tuition; R&B fee (aid available) | STEM interest; out-of-state and international students allowed | Rolling | High acceptance rates at elite East Coast STEM schools |
| **MS** | Mississippi School for Math and Science (MSMS) | 11-12, ~240 | Free T/R/B | MS residency; high ACT; strong academic record | Spring | Dual credits accepted by MUW and Mississippi State |
| **NC** | North Carolina School of Science and Mathematics (NCSSM) | 11-12, ~1,000 | Free T/R/B | Highly competitive; congressional district quotas | Winter | Massive feeder to UNC-Chapel Hill, Duke, NC State, and Ivies |
| **OK** | Oklahoma School of Science and Mathematics (OSSM) | 11-12, ~150 | Free T/R/B | Strong math/science grades; geographic selection across 77 counties | Spring | Outstanding Ivy League placement and local honors programs |
| **SC** | SC Governor's School for Science & Mathematics (SCGSSM) | 11-12, ~280 | Free T/R/B | High test scores; 10.5 HS credits completed prior | Winter/Spring | Graduates receive both state and Governor's School diplomas |
| **TX** | Texas Academy of Mathematics and Science (TAMS) | 11-12, ~400 | Free tuition; R&B fee (aid available) | Exceptional SAT/ACT; completed Algebra I-II and Geometry | January-March | Major feeder to UT Austin, Texas A&M, and elite national tier |

**Strategic value for families:** These academies are the ultimate equity play. A student in rural Oklahoma or coastal Mississippi with strong STEM aptitude can access a $0-cost residential education producing Ivy-level college outcomes. Wayfinder should surface these proactively whenever a family is in a covered state and the student shows STEM strength. Cross-reference `feeder-school-diagnostic.md` (Tier 1 classification for residential STEM academies).

---

## CROSS-REFERENCE MAP

| Brain | Relationship |
|-------|-------------|
| `essay-deep/cogat-master-brain.md` | CogAT preparation protocol — referenced by every metro that uses CogAT for GT identification |
| `essay-deep/elementary-school-master-brain.md` | Washington State deep dive — this brain's Metro 14 is the summary; that brain is the full treatment |
| `essay-deep/middle-school-master-brain.md` | National math acceleration pipeline — applies to every metro |
| `feeder-school-diagnostic.md` | 3-Tier Rigor Model for classifying any school looked up in NCES data |
| `institutional-dna-value-tier.md` | College pipeline connections (Georgia Tech for Atlanta, UF for Miami, Mines for Denver, etc.) |
| `test-prep-strategic-brain.md` | NM/PSAT pipeline — connects K-12 to merit scholarship strategy |
| `school-list-builder.md` | The ultimate destination — K-12 intelligence feeds into college list building |
| `compliance-brain.md` | **THE SHIELD** — all school recommendations subject to disclaimers |

---

## NCES DATA QUERY PROTOCOL

When a family provides their city, state, or school name, the SLM should:

1. **Identify the metro** from this brain (or the closest match)
2. **Look up the specific school** in the NCES JSON files: `backend/data/scraped/k12-national/{STATE}_{level}.json`
3. **Extract key metrics:** enrollment, student-teacher ratio, magnet/charter status, Title I, demographics
4. **Classify the school** using `feeder-school-diagnostic.md` 3-Tier Model:
   - Tier 1 (Global Feeder): magnet=true OR STR <15:1 OR in an attendance zone with >$150K median household income
   - Tier 2 (Regional Powerhouse): STR 15-22:1, non-Title I, suburban or urban locale
   - Tier 3 (Local/Resource-Constrained): STR >22:1 OR Title I = true OR rural locale
5. **Provide metro-specific GT strategy** from this brain
6. **Connect to the college pipeline** using the institutional DNA brains

**Example SLM output:**
> "Your daughter attends [School Name] in Fairfax County, VA — that's a Tier 1 school in the DC/NoVA metro. Fairfax County's Advanced Academic Programs (AAP) Level IV is the gifted track. She should be tested via CogAT in 2nd-3rd grade, with the goal of AAP center placement by 4th grade. The long-term pipeline: AAP centers → Thomas Jefferson HS for Science & Technology (TJHSST) application in 8th grade → T20 STEM universities. Given her math scores, I'd recommend starting AoPS or MATHCOUNTS preparation in 5th grade to build the competition portfolio that strengthens the TJ application."
