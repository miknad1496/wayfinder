# Wayfinder Knowledge Base — Gap Analysis & Research Roadmap

**Date:** March 20, 2026
**Scope:** Complete audit of 87 brain files across 7 domains
**Last Updated:** Session 3 — closed 4 gaps, added 3 new brain files

---

## SECTION 1: DATA GAPS — INCOMPLETE OR MISSING DATASETS

### GAP 1: Institutional DNA Coverage Stops at T17

**Status:** ✅ CLOSED — resolved across 3 files

**Resolution:** Built `institutional-dna-next20.md` (97.8 KB, 20 schools T18-T40), `institutional-dna-value-tier.md` (69 KB, 18 schools T41-T60), and `grad-school-institutional-dna.md` (19 KB, T14 Law + T10 Med + PhD + MPP/MPA). Total institutional coverage: 55+ named undergrad institutions with full DNA profiles + 40+ graduate/professional programs.

---

### GAP 2: Financial Aid Data — Missing Common Data Set (CDS) Integration

**Status:** HIGH — the `financial-aid-brain.md` has excellent strategic frameworks but lacks school-specific aid data.

The brain explains HOW to negotiate aid and how merit aid works mechanically, but doesn't contain the actual numbers: what percentage of students receive institutional aid, median net price by income bracket, or typical merit packages at specific schools. This data exists in every school's Common Data Set (Section H) and in College Scorecard net price data.

**Fix:** Create a structured aid table for the top 40 schools (or the schools covered in institutional-dna files):
- % receiving institutional grant aid
- Average institutional grant
- Median net price at $0-$30K, $30-$48K, $48-$75K, $75-$110K, $110K+ income bands
- Known merit scholarship programs and thresholds

**Perplexity Queries:**
1. "Common Data Set Section H financial aid data Harvard Stanford MIT Yale Princeton Columbia UChicago 2024-2025"
2. "College Scorecard net price by income bracket top 20 universities 2025"
3. "Schools with best financial aid for families earning $100K-$200K — net price comparison 2025-2026"

**Scraper Task:** College Scorecard API → pull `net_price.consumer.by_income_level` fields for all schools in the institutional-dna files.

---

### GAP 3: Admissions Data Freshness — Class of 2030 Cycle Not Yet Reflected

**Status:** MEDIUM — `admissions-data-synthesis.md` contains 2020-2025 data. The 2025-2026 application cycle (Class of 2030) results are either just released or imminent.

**Fix:** Once Class of 2030 Regular Decision results are available (typically late March/early April 2026), patch the acceptance rate tables in `admissions-data-synthesis.md` with the new cycle's numbers.

**Perplexity Queries:**
1. "Class of 2030 acceptance rates Ivy League Stanford MIT Caltech 2026"
2. "Class of 2030 early decision acceptance rates top 20 universities"
3. "Most significant changes college acceptance rates 2025-2026 cycle"

---

### GAP 4: ROI Engine — Missing Salary Data by Major at Each School

**Status:** MEDIUM-HIGH — `roi-engine.md` has institutional medians but not major-specific earnings by school.

The Brand-to-Value Pivot (MODULE 4) tells the SLM to compare earnings — but the comparison uses INSTITUTIONAL medians, which blend CS majors ($120K) with English majors ($45K). A student choosing between Purdue CS and Columbia CS needs the CS-specific comparison, not the whole-institution number.

**Fix:** Integrate College Scorecard's program-level earnings data (available since 2023) for the Smart Money schools and T20 comparators.

**Perplexity Queries:**
1. "College Scorecard field of study earnings data — Purdue computer science vs Columbia computer science median salary"
2. "College Scorecard program-level earnings — how to access field of study data by institution"
3. "Purdue Texas A&M Virginia Tech UIUC Lehigh — median earnings by major engineering computer science business 2025"

**Scraper Task:** College Scorecard API → pull `latest.programs.cip_4_digit.earnings` for CS (CIP 11.07), Engineering (CIP 14), Business (CIP 52) at all Smart Money and T20 schools.

---

### GAP 5: International Student — Missing Country-Specific Credential Equivalency Tables

**Status:** MEDIUM — `international-student-brain.md` covers visa and general strategy but lacks country-specific grading scale conversions.

Indian CBSE percentages, UK A-Level grades, IB diploma scores, Chinese Gaokao, and Korean CSAT all need explicit conversion guidance so the SLM can evaluate international transcripts accurately.

**Perplexity Queries:**
1. "How do US universities evaluate Indian CBSE ICSE board exam percentages — GPA equivalency conversion"
2. "UK A-Level grade conversion to US GPA for university admissions"
3. "IB diploma score conversion to US GPA — what score equals 4.0"
4. "Top 10 source countries for international students US universities 2025 — credential evaluation requirements by country"

---

### GAP 6: Test Prep — ACT Strategy Depth vs. SAT

**Status:** MEDIUM — `test-prep-strategic-brain.md` is heavily SAT/DSAT-focused. The ACT-specific strategy is thin.

The `essay-deep/sat-act-master-brain.md` partially fills this, but the root-level brain doesn't include ACT-specific adaptive mechanics (since ACT isn't adaptive), ACT science section strategy, or SAT-to-ACT crosswalk decision protocol for students choosing which test to take.

**Perplexity Queries:**
1. "ACT vs SAT 2025-2026 — which test is easier for which student type — concordance table"
2. "ACT science section strategy — fastest approaches — 2025-2026"
3. "SAT to ACT score conversion concordance table 2025 College Board ACT Inc"

---

## SECTION 2: STRUCTURAL GAPS — MISSING BRAIN FILES

### GAP 7: No Dedicated "School List Builder" Brain

**Status:** ✅ CLOSED

**Resolution:** Built `school-list-builder.md` (29 KB, 7 modules). 3-Filter Logic Gate Architecture (Fit + Context + ROI), 2-2-2-2-2 Output Format, 7-step Decision Tree, 6 Edge Cases, 10-point Quality Control checklist. 44 cross-references — the most interconnected brain in the system.

---

### GAP 8: No Athletic Recruitment Brain

**Status:** ✅ CLOSED

**Resolution:** Built `athletic-recruitment-brain.md` (15 KB, 5 modules). Covers D1/D2/D3/NAIA division structure, sport-specific scholarship limits, Ivy League Academic Index calculation with AI floor thresholds, recruitment timeline by grade (9th-12th), NCAA contact rules, coach email template, modified 2-2-2-2-2 framework for recruited athletes, D3 strategy for academic athletes, and NCAA eligibility requirements with sliding scale.

---

### GAP 9: No "Application Submission Checklist" Brain

**Status:** LOW-MEDIUM — the system has strategy for every piece of the application but no single operational checklist that ensures nothing is forgotten: Common App fields, CSS Profile deadlines, FAFSA submission, transcript requests, test score sends, recommendation letter tracking.

**Proposed Brain:** `application-ops-checklist.md` — month-by-month operational timeline from August through April with all mechanical tasks tracked.

---

## SECTION 3: REFINEMENT OPPORTUNITIES — EXISTING FILES THAT NEED UPGRADES

### REFINEMENT 1: `intel-finance-careers.md` — Thin and Possibly Dated

**Current state:** 17.2 KB — the smallest industry intel file. Only 3 references to 2024-2026 data. The finance landscape has shifted significantly (crypto winter aftermath, AI in trading, PE consolidation). This brain needs a refresh.

**Perplexity Queries:**
1. "Investment banking entry-level hiring trends 2025-2026 — target schools, compensation, headcount"
2. "Private equity associate hiring changes 2025-2026 — is PE still hiring from IB"
3. "Quantitative finance and AI in trading — career outlook 2026"

---

### REFINEMENT 2: `admissions-brain.md` — Undersized Router

**Current state:** 7.8 KB — the smallest admissions file. As the master routing brain for all admissions queries, it may be too thin to effectively route the SLM to the right specialized brain. Consider expanding the routing logic with more conditional triggers.

---

### REFINEMENT 3: Essay-Deep Files — CogAT and Elementary/Middle School Brains in Wrong Location

**Current state:** `essay-deep/cogat-master-brain.md` (112 KB), `essay-deep/elementary-school-master-brain.md` (107 KB), and `essay-deep/middle-school-master-brain.md` (91 KB) are in the essay-deep subdirectory but aren't essay files. They're K-8 academic preparation brains. Consider relocating to root or creating a `k8-prep/` subdirectory for architectural clarity.

---

## SECTION 4: SCRAPER OPPORTUNITIES — LEVERAGING THE 91K-RECORD NCES DATABASE

The K-12 national scraper already has 91,354 school records. Additional scraping targets:

| Data Source | What to Pull | Which Brain It Feeds |
|------------|-------------|---------------------|
| **College Scorecard API** | Program-level earnings by CIP code for T40 schools | `roi-engine.md` GAP 4 |
| **College Scorecard API** | Net price by income bracket for T40 schools | `financial-aid-brain.md` GAP 2 |
| **Common Data Set archives** | Section C (test scores), Section H (financial aid) for T40 schools | `admissions-data-synthesis.md`, `financial-aid-brain.md` |
| **IPEDS** | Graduation rates by race/gender/income for equity analysis | `admissions-diversity-school-profiling.md` |
| **NCES CRDC** | Updated AP/IB course offerings per high school (if newer data available) | `feeder-school-diagnostic.md` |

---

## SECTION 5: PRIORITY RANKING

| Priority | Gap | Effort | Impact |
|----------|-----|--------|--------|
| ~~1~~ | ~~GAP 1 — Institutional DNA T18-T60~~ | ~~HIGH~~ | ✅ CLOSED — `next20.md` + `value-tier.md` + `grad-school-institutional-dna.md` |
| **1** | GAP 4 — Major-specific earnings data | MEDIUM (API scrape) | HIGH — transforms ROI comparisons from fuzzy to precise |
| **2** | GAP 2 — CDS financial aid data | MEDIUM (API scrape) | HIGH — enables personalized cost estimates |
| ~~3~~ | ~~GAP 7 — School List Builder brain~~ | ~~MEDIUM~~ | ✅ CLOSED — `school-list-builder.md` |
| **3** | GAP 3 — Class of 2030 data | LOW (wait for data) | MEDIUM — seasonal refresh (March/April 2026) |
| **4** | REFINEMENT 1 — Finance careers refresh | LOW (Perplexity) | MEDIUM — thin file in important domain |
| ~~5~~ | ~~GAP 8 — Athletic recruitment brain~~ | ~~MEDIUM~~ | ✅ CLOSED — `athletic-recruitment-brain.md` |
| **5** | GAP 5 — International credentials | LOW (Perplexity) | MEDIUM — important for international segment |
| **6** | GAP 6 — ACT strategy depth | LOW (Perplexity) | LOW-MEDIUM — SAT-dominant but ACT users exist |
| **7** | GAP 9 — Application ops checklist | LOW (synthesis) | LOW-MEDIUM — operational convenience |
