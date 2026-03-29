# Feeder-School Rigor Diagnostic — The Context Engine

## Purpose

This brain gives the SLM the ability to assess a student's high school context using federal data — then convert that context into admissions strategy. The core insight: admissions officers read applications within the context of what was AVAILABLE to the student. A student who takes 4 APs at a school that offers 4 is stronger than a student who takes 8 APs at a school that offers 25. This brain quantifies that signal.

**Data Sources:** NCES Common Core of Data (CCD) and Civil Rights Data Collection (CRDC). These are the same datasets elite admissions offices use for school context profiling. The SLM uses the exact federal variable codes to compute rigor metrics.

**Compliance Gate:** This brain provides strategic framing, not school evaluation. Wayfinder does NOT rank schools as "good" or "bad." It diagnoses what was available and advises how to frame that context. See `compliance-brain.md` MODULE 1 for boundary enforcement.

---

## MODULE 1: THE NCES/CRDC VARIABLE MAP

### Data Architecture

Federal education data comes from two distinct systems that must be merged:

**NCES CCD (Common Core of Data):** Annual census of all public schools. Provides enrollment, staffing, Title I status. Updated annually with ~1 year lag.

**CRDC (Civil Rights Data Collection):** Biennial survey with detailed program-level data: AP/IB enrollment, Gifted/Talented, discipline, course offerings. Richer data, slower release cycle.

**Key limitation:** 2024-2025 datasets are not yet finalized at time of writing. The variable codes below are standardized across recent longitudinal files and remain consistent. The SLM must verify data availability for the most recent year.

### The Variable Codebook

**AP and IB Participation (CRDC)**

| Variable Code | What It Contains | Notes |
|--------------|-----------------|-------|
| `SCH_APENR_IND` | Binary: Does this school offer AP courses? (Yes/No) | First-gate check. If No → school is automatically Tier 3 for AP metric |
| `SCH_IBENR_IND` | Binary: Does this school offer IB courses? (Yes/No) | IB schools are rarer; IB Diploma Programme is a strong rigor signal |
| `TOT_APENR_M` | Count: Male students enrolled in AP courses | Raw count, not percentage |
| `TOT_APENR_F` | Count: Female students enrolled in AP courses | Raw count, not percentage |
| `TOT_IBENR_M` | Count: Male students enrolled in IB courses | Raw count |
| `TOT_IBENR_F` | Count: Female students enrolled in IB courses | Raw count |
| `TOT_ENR_M` | Count: Total male enrollment at school | Denominator for rate calculations |
| `TOT_ENR_F` | Count: Total female enrollment at school | Denominator for rate calculations |

**Derived Metric — AP/IB Participation Rate:**
```
AP_IB_Rate = (TOT_APENR_M + TOT_APENR_F + TOT_IBENR_M + TOT_IBENR_F) / (TOT_ENR_M + TOT_ENR_F)
```
This is NOT pre-calculated in the CRDC. The SLM must compute it from raw counts.

**Gifted and Talented (CRDC)**

| Variable Code | What It Contains | Notes |
|--------------|-----------------|-------|
| `SCH_GT_IND` | Binary: Does this school have a G/T program? | Gate check |
| `TOT_GTENR_M` | Count: Male students in G/T program | Raw count |
| `TOT_GTENR_F` | Count: Female students in G/T program | Raw count |

**Derived Metric — G/T Participation Rate:**
```
GT_Rate = (TOT_GTENR_M + TOT_GTENR_F) / (TOT_ENR_M + TOT_ENR_F)
```

**Student-Teacher Ratio (NCES CCD)**

| Variable Code | What It Contains | Notes |
|--------------|-----------------|-------|
| `MEMBER` | Total student enrollment/membership at school | Numerator |
| `FTE` | Full-time equivalent teachers at school | Denominator |

**Derived Metric — Student-Teacher Ratio:**
```
STR = MEMBER / FTE
```
Not pre-calculated in CCD. Must be derived.

**Title I Status (NCES CCD)**

| Variable Code | What It Contains | Notes |
|--------------|-----------------|-------|
| `TITLEI_STATUS` | Alphanumeric code for Title I eligibility/program type | Values include: Targeted Assistance, Schoolwide, Not a Title I School |

Title I status is a socioeconomic proxy. Schoolwide Title I (≥40% low-income) signals resource-constrained context. This is NOT a negative — it's an admissions leverage point.

### Data Merge Protocol

CRDC and CCD are separate datasets. To build a complete school profile, the SLM must merge them using the shared school identifier:

- **NCES School ID** (`NCESSCH` in CCD, `COMBOKEY` in CRDC) serves as the join key
- State + district + school FIPS codes can serve as a fallback crosswalk
- The K-12 national scraper (`backend/scrapers/k12-national-scraper/`) already contains 91,354 school records that can be cross-referenced

---

## MODULE 2: THE 3-TIER HIGH SCHOOL RIGOR MODEL

### The Calculation Framework

When a student provides their school name (or the SLM looks up their school data), compute three metrics:

**Metric 1 — Resource Ratio (AP/IB Participation Rate)**
```
Resource_Ratio = (Total AP/IB Enrolled Students) / (Total School Enrollment)
```

**Metric 2 — Instructional Intensity (Student-Teacher Ratio)**
```
Instructional_Intensity = Total Students / FTE Teachers
```

**Metric 3 — Socioeconomic Context Flag**
```
SES_Context = TITLEI_STATUS value (Schoolwide / Targeted / None)
```

**Optional Metric 4 — G/T Concentration**
```
GT_Rate = (Total G/T Students) / (Total Enrollment)
```

### The Tier Assignment

| Tier | Label | Resource Ratio (AP/IB) | Student-Teacher Ratio | Title I Status | Profile |
|------|-------|----------------------|---------------------|---------------|---------|
| **Tier 1** | Global Feeder | >40% AP/IB participation | <15:1 | Not Title I | Elite public magnets (Thomas Jefferson, Stuyvesant), top private day schools, IB Diploma schools. Students compete against global talent pool. AP/IB is the baseline, not the ceiling. |
| **Tier 2** | Regional Powerhouse | 20-40% AP/IB participation | 15-22:1 | Mixed | Strong suburban publics, competitive regionals, well-resourced schools with solid college-prep tracks. AP/IB is available and encouraged but not universal. |
| **Tier 3** | Local / Resource-Constrained | <20% AP/IB participation OR no AP/IB offered | >22:1 | Schoolwide Title I (common) | Rural schools, under-resourced urban schools, small schools with limited course catalogs. AP may be available but participation is low due to structural barriers, not student ability. |

### Critical Nuance: Tier 3 Is NOT a Deficit Label

The SLM must NEVER frame Tier 3 as a disadvantage in isolation. Admissions officers at selective schools apply a contextual review — they evaluate what a student did with what was available. A Tier 3 student who exhausted their school's offerings and sought out supplemental rigor (dual enrollment, online AP through College Board, community college courses) demonstrates EXACTLY the initiative that T20 schools prize.

The diagnostic question for every Tier 3 student: "Did you max out what was available AND seek more?" If yes, this student has a STRONGER contextual narrative than a Tier 1 student who took 8 of 25 available APs.

---

## MODULE 3: THE STRATEGIC OUTPUT — WHAT TO DO WITH THE TIER

### Tier 1 (Global Feeder) Strategy

**The challenge:** You're competing against the strongest applicants in the country at your own school. Your school's Naviance data shows 30+ students applying to each T20. Internal competition is fierce.

**Common App "Additional Information" approach:** Do NOT explain your school's rigor — AOs already know it. Use this section ONLY if there's something the transcript doesn't show: a scheduling conflict that prevented a specific AP, a family obligation that limited course selection in a specific semester, or participation in a school-specific accelerated track that has a non-obvious name.

**Strategic calculus:**
- Your AP/IB load is expected to be heavy (8-12+ APs or full IB Diploma). Taking fewer than your school's norm is a red flag that must be explained.
- Class rank at a Tier 1 school is a compressed signal — being top 20% at Thomas Jefferson is different from top 20% at a median suburban school. The SLM should flag this when rank-conscious schools (UT Austin, UC system) are on the list.
- Differentiation at Tier 1 comes from SPIKE activities and essays, not transcript rigor (which is table stakes).

### Tier 2 (Regional Powerhouse) Strategy

**The challenge:** Strong foundation, but the school may not be well-known nationally. AOs outside your region may not recognize the school's quality.

**Common App "Additional Information" approach:** A brief school context statement is valuable here. Frame it as data:
- "My school offers [X] AP courses. I have taken [Y] of the [Z] available to me, which represents [percentage] of the AP curriculum accessible in my grade sequence."
- Include the AP/IB participation rate if it demonstrates you're an outlier at your school.
- If your school has strong but non-AP rigor (Honors sequences, dual enrollment partnerships), name them explicitly — AOs may not be familiar with your school's specific offerings.

**Strategic calculus:**
- Taking 6-10 APs at a Tier 2 school can represent a higher relative rigor commitment than 12 APs at a Tier 1 school. The SLM should calculate and communicate this ratio.
- Supplemental rigor beyond what the school offers (community college courses, online APs, research programs) is a STRONG signal at Tier 2 — it shows self-directed ambition.
- The school counselor recommendation matters more here because AOs rely on it to calibrate the transcript within school context.

### Tier 3 (Local / Resource-Constrained) Strategy

**The challenge:** Limited course offerings create a ceiling that isn't the student's fault. The student may have exhausted everything available by junior year.

**Common App "Additional Information" approach:** This is the section where Tier 3 students gain the MOST leverage. The SLM should help construct a statement that includes:

1. **School-level data** (sourced from NCES): "My school has a student-teacher ratio of [X]:1, offers [Y] AP courses (versus the national average of [Z] for schools of similar size), and has an AP/IB participation rate of [W]%."
2. **Student-level response**: "Within this context, I enrolled in every honors and AP course available to me — [list courses]. To pursue additional rigor, I [dual-enrolled at community college / completed online AP courses through College Board / pursued independent study in X]."
3. **Outcome evidence**: "My [score/achievement] on the [AP exam/SAT/standardized test] demonstrates academic capability that exceeded my school's typical preparation pathway."

**Strategic calculus:**
- Tier 3 context is the most POWERFUL narrative tool when used correctly. It transforms a "4 AP" transcript from weak to heroic.
- The SLM must identify and quantify the gap: "Your 4 AP courses represent enrollment in 100% of your school's AP offerings. At a school with an AP participation rate of 12%, you are performing at 3x the school norm."
- Standardized test scores become disproportionately important at Tier 3 — they're the only school-independent benchmark. If a Tier 3 student scores 1500+ SAT, that's a LOUD signal to AOs that the transcript ceiling is environmental, not intellectual.
- Recommend the QuestBridge, Posse Foundation, and institutional fly-in programs explicitly — these are designed for Tier 3 students and carry significant admissions weight at partner schools.

---

## MODULE 4: THE CONTEXTUAL MULTIPLIER

### How AOs Actually Use School Context

Admissions officers at selective schools use a process called **contextual review** (Harvard, Princeton, and Stanford have all described versions of this in public testimony). The process works as follows:

1. **School Profile Review**: Every high school sends a School Profile document with the application. It lists courses offered, grade distribution, demographic data, and (sometimes) a "school context" statement from the counselor. AOs read this FIRST.

2. **Within-School Calibration**: The AO evaluates the applicant's transcript AGAINST the school's offerings. The metric is: "Did this student take the most rigorous courseload available?" If yes → full rigor credit, regardless of raw AP count.

3. **Academic Index Contextualization**: At schools that use a numerical academic index (Ivy League schools compute one), the index is interpreted within cohort context. A 220 AI from a Tier 1 school faces different benchmarks than a 220 AI from a Tier 3 school.

### The Wayfinder Contextual Multiplier

The SLM should compute and communicate a "Contextual Rigor Score" to the student:

```
Contextual_Rigor = (Student's AP/IB Course Count) / (School's Total AP/IB Offerings) × 100
```

**Interpretation:**
- 90-100%: "You have effectively exhausted your school's advanced curriculum. This is the maximum rigor signal."
- 70-89%: "Strong, but AOs will ask why you didn't take [specific courses you skipped]. Prepare an explanation."
- 50-69%: "Moderate rigor relative to availability. This will not be viewed as 'most rigorous' at selective schools."
- <50%: "Below the rigor threshold for competitive applications. The SLM should discuss whether the student's school list needs recalibration."

---

## MODULE 5: THE FEEDER SCHOOL HALO — AND HOW TO COMPETE WITHOUT IT

### The Feeder Effect (What Wealthy Families Pay $10K to Know)

Certain high schools have disproportionate representation at T20 schools. These "feeders" — Phillips Exeter, Stuyvesant, Thomas Jefferson, Trinity School NYC, Horace Mann, the Dalton School — benefit from:

1. **AO Familiarity**: Admissions officers KNOW these schools. They know the grading scale, the course rigor, and the counselor. There's no information asymmetry.
2. **Counselor Relationships**: Feeder school counselors have direct relationships with admissions offices. Their recommendations carry institutional trust.
3. **Peer Network Effects**: Students at feeder schools are surrounded by T20-bound peers. EC ecosystems, summer program knowledge, and application strategy circulate socially.

### How Non-Feeder Students Compete

The SLM must identify and mitigate the information asymmetry for students outside the feeder pipeline:

**Bridge Strategy 1 — Build the School Profile**
If the student's school counselor is unfamiliar with elite admissions, the student (or parent) should provide the counselor with a school profile template that includes NCES data. Many under-resourced schools don't send adequate profiles. This is fixable.

**Bridge Strategy 2 — External Validators**
Non-feeder students need independent credibility signals: strong SAT/ACT scores, AP exam scores (not just enrollment — the 5 on the exam is the proof), research with university faculty, competition results, or portfolio pieces that can be independently verified.

**Bridge Strategy 3 — Fly-In and Access Programs**
T20 schools specifically recruit from non-feeder pipelines through access programs. These exist precisely to counter the feeder effect. The SLM should maintain a reference list: QuestBridge (general), Posse Foundation (leadership), LEDA (Leadership Enterprise for a Diverse America), Prep for Prep (NYC), A Better Chance (boarding school placement).

**Bridge Strategy 4 — The "Additional Information" Narrative**
The Common App's Additional Information section is the Tier 3 student's equalizer. This is where the Contextual Multiplier data goes. The SLM should ALWAYS recommend Tier 3 students use this section — leaving it blank wastes the most powerful tool available for leveling the contextual playing field.

---

## MODULE 6: INTEGRATION WITH K-12 SCRAPER DATA

### Connecting to the National Dataset

The K-12 national scraper (`backend/scrapers/k12-national-scraper/`) has already collected 91,354 school records across all 50 states from the NCES Education Data Portal API. This data feeds directly into the diagnostic:

**Lookup flow:**
1. User provides school name + state (or NCES ID if known)
2. SLM queries the scraped dataset for matching records
3. Extract: enrollment, FTE teachers, Title I status, locale code
4. Cross-reference with CRDC data (when available) for AP/IB/GT variables
5. Compute the three metrics (Resource Ratio, Instructional Intensity, SES Context)
6. Assign Tier
7. Generate strategic advice per MODULE 3

**When CRDC data is unavailable** (e.g., private schools not in CRDC, or data lag): The SLM should use available CCD variables (enrollment, FTE, Title I) to assign an approximate tier, and note the data limitation to the user. The student can provide AP/IB course count manually to supplement.

### The Diagnostic Output Template

When the SLM completes a school assessment, it should deliver a structured diagnostic:

```
SCHOOL CONTEXT PROFILE: [School Name], [City, State]
─────────────────────────────────────
Tier Assignment: [1 / 2 / 3] — [Global Feeder / Regional Powerhouse / Local-Resource Constrained]

METRICS:
• AP/IB Participation Rate: [X]% (vs. national avg ~28%)
• Student-Teacher Ratio: [X]:1 (vs. national avg 15.4:1)
• Title I Status: [Schoolwide / Targeted / Not Title I]
• G/T Program: [Yes/No] — Participation: [X]%

YOUR CONTEXT:
• AP/IB Courses Taken: [X] of [Y] available = [Z]% utilization
• Contextual Rigor Score: [Score]% — [Interpretation]

STRATEGIC RECOMMENDATION:
[Tier-specific advice from MODULE 3]
```

This diagnostic gives the student concrete, data-backed language for the Additional Information section and frames their entire application in the proper competitive context.
