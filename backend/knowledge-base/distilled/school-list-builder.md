# School List Builder — The Orchestration Brain

## Purpose

This is the **CPU of the Wayfinder knowledge base.** Every other brain file is a data layer or reasoning module. This brain is the ASSEMBLER — it tells the SLM how to combine data from 80+ files into a personalized, strategic school list for each student.

No other brain file produces a direct deliverable for the student. This one does: a ranked, categorized, 10-school list with clear rationale for every entry.

**Compliance Gate:** All school list recommendations must include the standard disclaimer from `compliance-brain.md`: "This list reflects strategic analysis based on historical data patterns. Admissions outcomes are inherently uncertain. Individual results depend on application quality, institutional priorities, and factors outside any advisor's control."

---

## MODULE 1: THE INTAKE PROTOCOL — STUDENT PROFILE CAPTURE

### Required Inputs (Minimum Viable Profile)

Before the SLM can build a list, it MUST collect these data points. If any are missing, the SLM asks for them before proceeding. No list is generated without a complete profile.

| Input | What the SLM Needs | Source Brain for Interpretation |
|-------|--------------------|---------------------------------|
| **GPA** (Unweighted + Weighted) | Both scales. UW GPA is the universal comparator; weighted shows rigor | `admissions-data-synthesis.md` (percentile tables) |
| **Test Scores** (SAT/ACT/PSAT) | Highest composite + section breakdown. "Test-optional" status if applicable | `test-prep-strategic-brain.md` (score interpretation, NM qualification) |
| **High School Name + Location** | State + school name → feeds into feeder school tier lookup | `feeder-school-diagnostic.md` (3-Tier Rigor Model) |
| **Intended Major / Career Direction** | Even "undecided" is useful — narrows to liberal arts or STEM-leaning | `framework-major-selection.md`, `career-brain.md` |
| **Top 3 Extracurricular Activities** | The spike candidates. Need enough to score on 4-Tier Impact Scale | `extracurricular-spike.md` (scoring protocol) |
| **Family Financial Context** | Income bracket (rough), willingness to pay full sticker, need-based aid eligibility | `financial-aid-brain.md`, `roi-engine.md` |
| **Geographic Preferences** | Stay in-state? Open to anywhere? Specific regions? | Used for public flagship ROI calculations |
| **Career Brand Dependency** | Is the target career brand-dependent (MBB, IB, BigLaw) or brand-independent (SWE, nursing, engineering)? | `roi-engine.md` MODULE 3 (Brand Classification) |

### Derived Variables (SLM Computes These)

From the raw inputs, the SLM derives:

| Derived Variable | Computation | Purpose |
|-----------------|-------------|---------|
| **Feeder School Tier** | Lookup student's high school in `feeder-school-diagnostic.md` 3-Tier model using NCES data (AP/IB offering rate, student-teacher ratio) | Calibrates reach/match/safety classifications |
| **Contextual Rigor Score** | `(Student AP/IB Count) / (School Total AP/IB Offerings) × 100` from `feeder-school-diagnostic.md` MODULE 4 | Determines whether student has maximized available rigor |
| **Activity Impact Score** | Score each of top 3 ECs on the 4-Tier Impact Scale (5 dimensions × 1-4 scale = composite 5-20) with anti-bias adjustments | Determines spike strength for "Fit" matching |
| **NM Qualification Status** | Compare PSAT Selection Index to state cutoff from `test-prep-strategic-brain.md` 50-state table | Unlocks NM merit aid schools for Financial Safety tier |
| **Brand Dependency Classification** | Map target career to Brand-Dependent or Brand-Independent from `roi-engine.md` MODULE 3 | Determines whether T20 premium is justified |
| **Financial Safety Floor** | Identify schools where student's SAT exceeds the 75th percentile by 50+ points (from `financial-aid-brain.md` Financial Safety Filter) | Anchors the bottom of the list with funded options |

---

## MODULE 2: THE THREE FILTERS — FIT, CONTEXT, ROI

Every candidate school must pass through THREE sequential filters. A school that fails any filter is flagged for review or replacement.

### FILTER 1: THE FIT FILTER — Spike-to-Hidden-Ask Matching

**Logic:** Match the student's demonstrated spike (from `extracurricular-spike.md` scoring) to each institution's Hidden Ask (from the four DNA brains).

**How it works:**

1. **Identify the student's spike category:**
   - Scientific Research / Discovery
   - Engineering / Building / Making
   - Creative Arts / Performance / Design
   - Social Impact / Community / Service
   - Entrepreneurship / Business / Ventures
   - Writing / Communication / Advocacy
   - Policy / Government / Systems Thinking
   - Athletic Excellence (see note on `athletic-recruitment-brain.md` gap)

2. **Match spike to institutional DNA:**

   | Spike Category | Highest-Fit Institutions (from DNA brains) |
   |---------------|---------------------------------------------|
   | Scientific Research | MIT, Caltech, Hopkins, UCSD, CWRU, Rochester, Colorado Mines |
   | Engineering / Making | MIT, CMU, Georgia Tech, Purdue, Virginia Tech, RPI, Lehigh |
   | Creative Arts | USC (SCA), NYU (Tisch), Brown (open curriculum), CMU (CFA+SCS), Tufts (SMFA), Pepperdine (IP) |
   | Social Impact / Service | Georgetown, Emory, Tulane, BC, UNC, Northeastern, Virginia Tech |
   | Entrepreneurship | Stanford, USC, CMU, Northeastern, Lehigh (IBE), UT Austin |
   | Writing / Communication | Northwestern (Medill), BU (COM), Tufts, Brown, Princeton |
   | Policy / Government | Georgetown (SFS), Harvard (IOP), Princeton (SPIA), UVA, Michigan, UMD |
   | STEM + Business Hybrid | UPenn (Wharton+SEAS), Lehigh (IBE), WashU, Michigan (Ross+CoE) |

3. **Fit Score:**
   - **Strong Fit** = Student's spike directly maps to institution's Hidden Ask. Student's spike category appears in the institution's DNA entry.
   - **Moderate Fit** = Student's spike is adjacent — the institution has relevant resources but it's not the primary DNA.
   - **Weak Fit** = Student's spike has no clear connection to the institution's DNA. Flag for review.

   **Rule:** No school with a "Weak Fit" score should appear on a final list unless it serves the Financial Safety role AND the student has been informed of the fit gap.

### FILTER 2: THE CONTEXT FILTER — Reach/Match/Safety Calibration

**Logic:** Use the student's academic profile + their feeder school tier to determine realistic admissions probability at each school.

**Step 1 — Raw Statistical Position:**

| Student's SAT vs. School's 25th-75th %ile | Student's GPA vs. School's Median | Raw Classification |
|-------------------------------------------|-----------------------------------|--------------------|
| SAT above school's 75th %ile + GPA above median | = **Likely** |
| SAT within school's 50th-75th %ile + GPA at or above median | = **Match** |
| SAT within school's 25th-50th %ile + GPA at median | = **Reach** |
| SAT below school's 25th %ile OR GPA significantly below median | = **High Reach / Moonshot** |

**Step 2 — Feeder School Context Adjustment:**

The raw classification is MODIFIED by the student's feeder school tier (from `feeder-school-diagnostic.md`):

| Feeder School Tier | Adjustment |
|--------------------|------------|
| **Tier 1** (Global Feeder: >40% AP/IB participation, <15:1 STR) | No adjustment. Raw classification stands. AOs expect these numbers from this context |
| **Tier 2** (Regional Powerhouse: 20-40% AP/IB, 15-22:1 STR) | Shift one category MORE favorable. A "Reach" becomes a "High Match" because the student achieved in a less-resourced context |
| **Tier 3** (Local/Resource-Constrained: <20% AP/IB, >22:1 STR) | Shift one category MORE favorable AND flag the Additional Information section strategy from `feeder-school-diagnostic.md` MODULE 3 |

**Critical caveat:** Context adjustment applies to HOLISTIC review schools only (most T40 schools). For schools with formula-based admissions (some public flagships that use GPA/test-score cutoffs), raw statistical position is determinative.

**Step 3 — Contextual Rigor Check:**

If the student's Contextual Rigor Score (from MODULE 1 derived variables) is below 70% — meaning they did NOT take at least 70% of available AP/IB courses at their school — flag a warning:

> ⚠️ **Rigor Warning:** Student has not maximized available rigor at their high school. This is a negative signal at all T40 schools. Consider whether the student can explain the gap (extenuating circumstances, scheduling conflicts) or whether the school list should be adjusted downward.

### FILTER 3: THE ROI FILTER — Financial Viability Check

**Logic:** Every school on the list must pass a financial viability test. A school that is academically appropriate but financially destructive is a BAD recommendation.

**Step 1 — Estimate Net Cost:**

| Student's Financial Context | Net Cost Estimation Method |
|-----------------------------|---------------------------|
| Family income <$75K | Most T20s meet 100% of demonstrated need. Estimate net cost at $0-15K/year. Public flagships: in-state tuition minus Pell + state grants |
| Family income $75K-$150K | "Donut Hole" families. T20 need-based aid is partial. Estimate net cost at $20-40K/year for privates. Public in-state: full tuition minus moderate aid |
| Family income $150K-$250K | Limited need-based aid at most schools. Merit aid is the primary discount. Estimate sticker or near-sticker for privates without merit |
| Family income >$250K | Full sticker at all schools. Merit aid at lower-ranked schools is the only discount |

**Step 2 — Apply the ROI Gate:**

For each school on the list, compute the **Efficiency Index:**

```
Efficiency Index = (Estimated 10-Year Median Earnings for Student's Major at This School) / (Estimated Total 4-Year Net Cost)
```

| Efficiency Index | Classification | Action |
|-----------------|----------------|--------|
| >2.0 | **High ROI** | Green light. School passes financial filter |
| 1.5-2.0 | **Moderate ROI** | Yellow flag. Acceptable if brand-dependent career justifies premium |
| 1.0-1.5 | **Marginal ROI** | Orange flag. SLM MUST present a "Market-Beater" alternative (see below) |
| <1.0 | **Negative ROI** | Red flag. SLM MUST flag this school as financially questionable and present alternatives |

**Step 3 — The Market-Beater Rule:**

> **MANDATORY RULE:** If a school classified as "Match" has an Efficiency Index below 1.5 AND the student's career target is brand-independent (from `roi-engine.md` MODULE 3), the SLM MUST suggest a "Market-Beater" alternative from the Value Tier (`institutional-dna-value-tier.md`) that delivers comparable or superior outcomes at lower cost.

**Market-Beater Lookup Table:**

| If the "Match" is... | And the career is brand-independent... | The Market-Beater alternative is... |
|----------------------|---------------------------------------|--------------------------------------|
| Mid-tier private ($70K+/yr) for CS | SWE / Data Science / Tech | Purdue ($28K OOS), Georgia Tech ($34K OOS), UW Seattle ($40K OOS) |
| Mid-tier private for engineering | Industry engineering | Virginia Tech ($34K OOS), Purdue ($28K OOS), Colorado Mines ($42K OOS) |
| Mid-tier private for pre-med | Clinical medicine | CWRU ($76K but PPSP guarantee), state flagship + strong hospital system |
| Mid-tier private for business | Non-IB/non-MBB business | UT Austin McCombs ($41K OOS), Wisconsin ($39K OOS), Ohio State Fisher ($36K OOS) |
| OOS public flagship for liberal arts | General career | In-state public flagship (saves $20-30K/year) |

---

## MODULE 3: THE 2-2-2-2-2 OUTPUT FORMAT — BUILDING THE TEN-SCHOOL LIST

### The Architecture

Every Wayfinder school list follows the **2-2-2-2-2 format** — 10 schools across 5 tiers:

| Tier | Definition | Schools | Strategic Role |
|------|-----------|---------|---------------|
| **2 Moonshots** | Schools where the student is below the 25th percentile for admitted students OR the school's acceptance rate is <8%. Probability: 5-15% | 2 | Aspirational ceiling. The student understands these are long shots but the application is strategically crafted |
| **2 High Reaches** | Schools where the student is between the 25th-50th percentile for admitted students. Probability: 15-30% | 2 | Achievable stretch. These are the schools where a strong application tips the balance |
| **2 Matches** | Schools where the student's profile is within or above the middle 50% for admitted students. Probability: 30-60% | 2 | The likely outcomes. These schools MUST be ones the student would be excited to attend |
| **2 Financial Safeties** | Schools where the student's stats exceed the 75th percentile AND the school offers merit aid (from `financial-aid-brain.md` Financial Safety Filter). Probability: 60-90% with funding | 2 | The floor. These schools guarantee both ADMISSION and FUNDING. The student WILL have an affordable option |
| **2 Wildcards** | Schools chosen for a SPECIFIC non-academic reason: geography, culture, unique program, family connection, or emerging opportunity. Not constrained by strict tier logic | 2 | The human element. These are the schools that reflect the student's PERSONALITY, not just their metrics |

### Assembly Rules

1. **Every Moonshot must also have a Strong Fit score.** There is no strategic value in applying to a school where you're unlikely to be admitted AND where your spike doesn't match the institution's DNA. A Moonshot application to a Weak Fit school is a wasted slot.

2. **Every Financial Safety must pass the ROI Gate.** A school where you'll get in and get funded but that delivers poor career outcomes is a false safety. The Financial Safety must be a school where the student can THRIVE, not just survive.

3. **The Match tier is where the ROI Filter matters most.** Matches are the most likely outcome — the student will probably attend one of these schools. If the Match schools have Marginal or Negative ROI, the student is likely to attend a school that costs more than it returns. The SLM must ensure Match-tier schools pass the financial viability test.

4. **At least ONE school in the list must be a public in-state option** (if the student has a viable in-state flagship). This anchors the financial floor regardless of what happens at other schools.

5. **The Wildcard tier is mandatory, not optional.** Students are not spreadsheets. The Wildcard tier exists because sometimes the right school is right for reasons that don't appear in any data model — a family connection, a campus visit that clicked, a specific professor whose work matters. The SLM should ASK the student: "Is there any school you're drawn to for reasons that go beyond rankings and statistics?"

6. **No more than 3 schools in any single acceptance-rate band.** If 4 of 10 schools all have <10% acceptance rates, the list is top-heavy and the student faces unacceptable risk. Redistribute.

### The Anti-Prestige-Bias Protocol

The SLM must actively counterbalance prestige bias in list construction. This means:

- **Never rank schools on the list by U.S. News ranking.** Present them by TIER (Moonshot → Safety), not by perceived prestige.
- **Always include the Efficiency Index for every school.** The student sees the financial math, not just the name.
- **When a brand-independent career is targeted, the SLM must present the Market-Beater comparison** even if the student hasn't asked for it. This is a fiduciary obligation.
- **Use the Brand-to-Value Pivot from `roi-engine.md` MODULE 4** when families resist the data. The 5-step conversation protocol (Identify Career → Classify Brand Dependency → Run Financial Comparison → Present Math → Acknowledge Intangibles) is designed for exactly this moment.

---

## MODULE 4: THE OUTPUT TEMPLATE — WHAT THE STUDENT SEES

### Wayfinder School List Output

```
═══════════════════════════════════════════════════
         WAYFINDER STRATEGIC SCHOOL LIST
         Prepared for: [Student Name]
         Date: [Date]
═══════════════════════════════════════════════════

STUDENT PROFILE SNAPSHOT
─────────────────────────
GPA: [UW] / [W]
Test Scores: [SAT/ACT] | PSAT SI: [Index] | NM Status: [Qualified/Not]
Feeder School Tier: [1/2/3] — [School Name, State]
Contextual Rigor Score: [X]%
Spike Category: [Category] | Impact Score: [X]/20 ([Tier Name])
Career Direction: [Target] | Brand Dependency: [Dependent/Independent]
Financial Context: [Income Bracket] | Aid Strategy: [Need-Based/Merit/Both]

═══════════════════════════════════════════════════

🎯 MOONSHOTS (Probability: 5-15%)
─────────────────────────────────
1. [SCHOOL NAME]
   Why it's here: [1-sentence fit rationale connecting spike to Hidden Ask]
   Acceptance Rate: [X]% | Your Position: [Below 25th %ile / etc.]
   Efficiency Index: [X.X] | Estimated Net Cost: $[X]/yr
   Key Essay Strategy: [1-sentence from DNA brain]

2. [SCHOOL NAME]
   [Same format]

📈 HIGH REACHES (Probability: 15-30%)
──────────────────────────────────────
3. [SCHOOL NAME]
   [Same format]

4. [SCHOOL NAME]
   [Same format]

✅ MATCHES (Probability: 30-60%)
────────────────────────────────
5. [SCHOOL NAME]
   [Same format]
   ⚠️ ROI Alert: [If Efficiency Index <1.5, note Market-Beater alternative]

6. [SCHOOL NAME]
   [Same format]

💰 FINANCIAL SAFETIES (Probability: 60-90% with funding)
──────────────────────────────────────────────────────────
7. [SCHOOL NAME]
   Merit Aid Estimate: $[X]-$[X]/yr based on stats exceeding 75th %ile by [X] points
   NM Scholarship: [If applicable, reference test-prep-strategic-brain.md table]
   Efficiency Index: [X.X] — [Assessment]

8. [SCHOOL NAME]
   [Same format]

🃏 WILDCARDS (The Human Element)
─────────────────────────────────
9. [SCHOOL NAME]
   Why it's here: [Non-metric rationale — culture, geography, specific program, gut feel]

10. [SCHOOL NAME]
    [Same format]

═══════════════════════════════════════════════════

FINANCIAL SUMMARY
─────────────────
Best-case scenario (highest aid): [School] at ~$[X]/yr
Worst-case scenario (all sticker): $[X] total over 4 years
Expected outcome (weighted probability): $[X]-$[X] total

ROI ASSESSMENT
──────────────
Career Target: [X] | Brand Dependency: [Dep/Indep]
If brand-dependent: T20 premium is justified. Moonshots/High Reaches are worth the application.
If brand-independent: Value Tier schools offer comparable outcomes. Financial Safeties may be optimal.

⚖️ COMPLIANCE NOTICE
This list reflects strategic analysis based on historical data patterns.
Admissions outcomes are inherently uncertain. Individual results depend on
application quality, institutional priorities, and factors outside any
advisor's control. Earnings projections are median historical figures,
not guarantees. See compliance-brain.md for full disclaimer protocol.
═══════════════════════════════════════════════════
```

---

## MODULE 5: THE DECISION TREE — SLM EXECUTION FLOW

The SLM follows this exact sequence when a user requests a school list:

```
START
  │
  ├─ STEP 1: INTAKE
  │    Collect all 8 required inputs (MODULE 1)
  │    If any input is missing → ASK before proceeding
  │    Compute all 6 derived variables
  │
  ├─ STEP 2: GENERATE CANDIDATE POOL
  │    Pull all schools from DNA brains where student has
  │    Strong or Moderate Fit score (FILTER 1)
  │    Typical candidate pool: 20-40 schools
  │
  ├─ STEP 3: CLASSIFY EACH CANDIDATE
  │    Apply Context Filter (FILTER 2) to assign
  │    Moonshot / High Reach / Match / Likely to each school
  │    Apply feeder school tier adjustment
  │    Check Contextual Rigor Score — flag if <70%
  │
  ├─ STEP 4: APPLY ROI FILTER
  │    Compute Efficiency Index for each candidate (FILTER 3)
  │    Flag any school with EI <1.5 and brand-independent career
  │    Generate Market-Beater alternatives for flagged schools
  │
  ├─ STEP 5: ASSEMBLE 2-2-2-2-2 LIST
  │    Select 2 Moonshots (Strong Fit + highest aspiration)
  │    Select 2 High Reaches (Strong Fit + realistic stretch)
  │    Select 2 Matches (Strong Fit + passes ROI Gate)
  │    Select 2 Financial Safeties (stats > 75th %ile + merit aid)
  │    Ask student for 2 Wildcards (or suggest based on personality)
  │    Verify: no more than 3 schools in any single acceptance-rate band
  │    Verify: at least 1 in-state public option (if viable)
  │
  ├─ STEP 6: GENERATE OUTPUT
  │    Populate the output template (MODULE 4)
  │    Include 1-sentence essay strategy for each school
  │    (pulled from the relevant DNA brain's Red-Flag Filter + Easter Eggs)
  │    Include Financial Summary and ROI Assessment
  │    Include Compliance Notice
  │
  └─ STEP 7: DELIVER + ITERATE
       Present the list to the student/family
       Ask: "Does any school on this list surprise you? Is there a school
       NOT on this list that you feel strongly about?"
       If yes → evaluate the suggested school through all 3 filters
       and replace a Wildcard slot or adjust the list with explanation
```

---

## MODULE 6: EDGE CASES AND OVERRIDE PROTOCOLS

### Edge Case 1: The "All Moonshots" Family

**Trigger:** Family insists on 6+ T10 schools despite student profile suggesting low probability.

**Protocol:**
1. Present the data: "At schools with <5% acceptance rates, even students with perfect scores are rejected 80%+ of the time."
2. Run the ROI comparison from `roi-engine.md` MODULE 4 (Brand-to-Value Pivot).
3. If the family persists, build the list they want BUT add the compliance disclaimer AND ensure at least 2 Financial Safeties and 1 Match remain on the list. Never build an all-Moonshot list.
4. Cross-reference `compliance-brain.md` for language on managing expectations.

### Edge Case 2: The Undecided Student

**Trigger:** Student has no declared major or career direction.

**Protocol:**
1. Classify career direction as "Undecided — Liberal Arts Leaning" or "Undecided — STEM Leaning" based on coursework and activities.
2. Prioritize schools with flexible curricula: Brown (open curriculum), Rochester (no core), WashU (flexible), Tufts (eclectic culture).
3. Weight the ROI Filter toward schools with BROAD outcome distributions rather than specialized pipelines.
4. Cross-reference `framework-major-selection.md` for major exploration frameworks.

### Edge Case 3: The International Student

**Trigger:** Student is non-US citizen requiring visa sponsorship.

**Protocol:**
1. Cross-reference `international-student-brain.md` for visa and credential requirements.
2. Filter school list for institutions that guarantee to meet 100% of demonstrated need for international students (most T20s do; most T40+ do NOT).
3. Add the international financial safety calculation: identify schools with specific international merit scholarships.
4. Verify that the student's home-country credentials have been properly evaluated per `international-student-brain.md`.

### Edge Case 4: The Transfer Student

**Trigger:** Student is applying as a transfer from CC or 4-year institution.

**Protocol:**
1. Cross-reference `transfer-strategy.md` for the full transfer framework.
2. Modify all filters: GPA weight shifts from HS to college GPA, test scores become less important, "Why Transfer" essay becomes critical.
3. UC TAG eligibility must be checked for California CC transfers.
4. Adjust the 2-2-2-2-2 format: transfer lists typically have fewer Moonshots (transfer acceptance rates are different) and more Matches.

### Edge Case 5: The NM Semifinalist

**Trigger:** Student's PSAT Selection Index meets or exceeds their state cutoff (from `test-prep-strategic-brain.md` 50-state table).

**Protocol:**
1. The Financial Safety tier MUST include at least one NM full-ride school from the NM Full-Ride table in `test-prep-strategic-brain.md` (Alabama, UT Dallas, Tulsa, USF, Houston, Liberty, Harding, Florida Benacquisto).
2. This student has a guaranteed funded option. The existence of this floor changes the entire risk calculation — they can afford to take MORE risk on Moonshots because the downside (unfunded attendance) is eliminated.
3. Flag the NM status in the output template and explain the strategic implication.

### Edge Case 6: The Recruited Athlete

**Trigger:** Student is being actively recruited by college coaches.

**Protocol:**
1. Athletic recruitment fundamentally changes the admissions probability model. A recruited athlete at a D1 school may have 50-80% admission probability even at schools with <5% general acceptance rates.
2. The SLM must note that the athletic recruitment brain is a gap in the current knowledge base (see `GAP-ANALYSIS.md` GAP 8). For now, advise the student to work with their recruiting coach AND use the academic/financial framework here as a parallel analysis.
3. The school list should include the student's recruiting targets PLUS 2-3 academic-merit schools as insurance in case the athletic recruitment falls through.

---

## MODULE 7: QUALITY CONTROL — POST-GENERATION CHECKLIST

Before delivering any school list, the SLM must verify:

- [ ] **Every school has a DNA entry.** If a school on the list doesn't appear in any DNA brain, the SLM cannot provide essay strategy. Flag this gap.
- [ ] **No more than 3 schools with <10% acceptance rate.** Top-heavy lists create unacceptable risk.
- [ ] **At least 1 in-state public option** (if the student has a viable flagship).
- [ ] **At least 2 schools where the student's stats exceed the 75th percentile.** These are the safety floor.
- [ ] **The Match tier passes the ROI Gate.** If not, Market-Beater alternatives have been presented.
- [ ] **The Financial Safety tier includes at least one school with confirmed merit aid programs** (not just need-based).
- [ ] **The Compliance Notice is included** (from `compliance-brain.md`).
- [ ] **The student has been asked about Wildcard preferences.** The list includes schools the student WANTS, not just schools the algorithm recommends.
- [ ] **If career is brand-independent, the Value Tier has been represented.** At least one Smart Money or Efficiency Outlier school appears on the list.
- [ ] **If the student is a NM Semifinalist, at least one NM full-ride school is included.**

---

## CROSS-REFERENCE MAP — THE FULL INTEGRATION NETWORK

This brain orchestrates the following files:

| Brain File | What This Brain Pulls From It |
|-----------|------------------------------|
| `admissions-data-synthesis.md` | Acceptance rates, score distributions, yield data for statistical positioning |
| `institutional-dna-top7.md` | Hidden Ask, Easter Eggs, essay strategy for schools #1-7 |
| `institutional-dna-next10.md` | Hidden Ask, Easter Eggs, essay strategy for schools #8-17 |
| `institutional-dna-next20.md` | Hidden Ask, Easter Eggs, essay strategy for schools #18-37 |
| `institutional-dna-value-tier.md` | Hidden Ask, Easter Eggs, essay strategy for schools #38-55. Market-Beater alternatives |
| `extracurricular-spike.md` | 4-Tier Activity Impact Scale scoring for Fit Filter. Anti-bias context adjustments |
| `feeder-school-diagnostic.md` | 3-Tier Rigor Model for Context Filter. Contextual Rigor Score computation |
| `roi-engine.md` | Smart Money Table, Efficiency Outliers, Brand Classification, Brand-to-Value Pivot for ROI Filter |
| `financial-aid-brain.md` | Merit aid data, Financial Safety Filter, need-based aid estimation |
| `test-prep-strategic-brain.md` | NM cutoffs, NM full-ride table for NM Semifinalist edge case |
| `framework-major-selection.md` | Major exploration for undecided students |
| `international-student-brain.md` | International student edge case handling |
| `transfer-strategy.md` | Transfer student edge case handling |
| `career-brain.md` | Career direction classification for brand dependency |
| `compliance-brain.md` | **THE SHIELD** — mandatory disclaimer language for all output |
| `waitlist-recovery.md` | Post-decision protocol if waitlisted at any school on the list |
