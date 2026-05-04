# AP Statistics — Unit 8: Inference for Categorical Data — Chi-Square — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 2–5% of the AP Statistics exam (smallest weight, but appears reliably)
- **Sub-topics covered:**
  - 8.1 Introducing Statistics: Are My Results Unexpected?
  - 8.2 Setting Up a Chi-Square Goodness of Fit Test
  - 8.3 Carrying Out a Chi-Square Goodness of Fit Test
  - 8.4 Expected Counts in Two-Way Tables
  - 8.5 Setting Up a Chi-Square Test for Homogeneity or Independence
  - 8.6 Carrying Out a Chi-Square Test for Homogeneity or Independence
  - 8.7 Skills Focus: Selecting an Appropriate Inference Procedure for Categorical Data
- **Where this unit appears on the exam:** Chi-square tests appear in roughly half of recent AP exams. The three chi-square procedures (goodness of fit, homogeneity, independence) are the focus. Distinguishing homogeneity from independence is the most common conceptual challenge — they use the same calculation but have different setups and conclusions. Computing expected counts and the chi-square test statistic is essential. The "compare to null distribution" framing applies here as it does for z and t tests.

## Big Ideas

1. **Chi-square tests evaluate whether observed categorical data fit a hypothesized pattern.** Unlike z and t tests (which deal with means and proportions), chi-square handles full distributions of categorical variables.
2. **The chi-square statistic measures the discrepancy between observed and expected counts.** Larger χ² values indicate larger discrepancies, suggesting the null hypothesis is wrong.
3. **Three distinct chi-square tests exist, each for a different question:**
   - **Goodness of fit:** does ONE categorical variable's distribution match a hypothesized distribution?
   - **Homogeneity:** are TWO or more populations' distributions the same for ONE categorical variable?
   - **Independence:** are TWO categorical variables independent (within ONE population)?
4. **The same χ² formula and df apply across all three tests.** What changes is the setup (hypotheses, expected counts) and conclusion language.
5. **Expected counts must be at least 5 (typically all expected counts ≥ 5).** This is the chi-square version of the Large Counts condition.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Chi-square statistic:**
  - **Formula:** χ² = Σ ((Observed − Expected)² / Expected)
  - Sum across all cells of a table.
  - Always non-negative.
  - Larger χ² = greater discrepancy between observed and expected.
- **Chi-square distribution:**
  - Defined by degrees of freedom (df).
  - Skewed RIGHT (long right tail).
  - As df increases, becomes more symmetric.
- **Chi-square goodness of fit test:**
  - **Tests:** does ONE sample's categorical distribution match a hypothesized distribution?
  - **H₀:** the distribution of [variable] in the population is [specified distribution].
  - **Hₐ:** the distribution of [variable] is NOT [specified distribution].
  - **Expected count for category i:** E_i = n × p_i, where n is total sample size and p_i is the hypothesized proportion for category i.
  - **df = number of categories − 1.**
- **Chi-square test for homogeneity:**
  - **Tests:** is the distribution of ONE categorical variable the SAME across two or more populations?
  - **Setup:** separate samples drawn from each population (sample sizes are PRE-DETERMINED).
  - **H₀:** the distributions of [variable] are the same across all populations.
  - **Hₐ:** the distributions of [variable] differ across at least two populations.
  - **Expected count for cell (i, j):** E_(i,j) = (row total × column total) / overall total.
  - **df = (rows − 1) × (columns − 1).**
- **Chi-square test for independence:**
  - **Tests:** are TWO categorical variables INDEPENDENT in a single population?
  - **Setup:** ONE sample drawn from a single population, classified on TWO variables (sample sizes for sub-categories are NOT pre-determined).
  - **H₀:** the two variables are INDEPENDENT in the population.
  - **Hₐ:** the two variables are NOT independent (i.e., they're associated).
  - **Expected count for cell (i, j):** E_(i,j) = (row total × column total) / overall total.
  - **df = (rows − 1) × (columns − 1).**
- **Conditions for chi-square tests:**
  - **Random:** sample(s) randomly selected.
  - **10% (Independence):** sample is less than 10% of population.
  - **Large Counts:** ALL expected counts ≥ 5.
- **Calculator usage:**
  - **Goodness of fit:** TI calculator: STAT TESTS — D: χ²GOF-Test (after entering observed in L1 and expected in L2).
  - **Homogeneity / Independence:** STAT TESTS — C: χ²-Test (after entering observed counts as a matrix in [A]; calculator places expected counts in matrix [B]).

### Adds for [4]

- **Distinguishing homogeneity from independence — the key insight:**
  - **Homogeneity:** TWO or MORE separate samples (one per population), comparing distributions across populations.
  - **Independence:** ONE sample classified on TWO variables, asking if the variables are related.
  - The CALCULATION is identical; the SETUP and CONCLUSION differ.
  - Memory trick: "Homogeneity" → multiple samples (homogeneous = same distribution across populations). "Independence" → one sample, two variables (testing if variables are independent).
- **Why expected counts must be ≥ 5.** The χ² distribution is a continuous approximation to the underlying discrete sampling distribution. The approximation requires sufficient counts in each cell. With small expected counts, the approximation breaks down. If some expected counts are too small, options include: combine categories, use a different test (Fisher's exact), or get a larger sample.
- **Computing expected counts for goodness of fit:**
  - For each category, E = n × p, where p is the hypothesized proportion.
  - Sanity check: sum of expected counts = sample size n.
- **Computing expected counts for two-way tables (homogeneity or independence):**
  - For each cell: E = (row total × column total) / overall total.
  - Why: under H₀ of homogeneity/independence, the row distribution is the same across columns, so the expected count in cell (i,j) = (column j total) × (overall proportion in row i) = (column j total) × (row i total / overall total).
- **Why df = (rows − 1) × (columns − 1) for two-way tables.** Once you know the row and column totals (which are fixed by the data), you can fill in the table by knowing only (rows − 1) × (columns − 1) cell values; the rest are determined by the totals. This represents the "free" parameters.
- **Reading chi-square output:**
  - Calculator gives: χ² statistic, p-value, df.
  - Compare p-value to α (often 0.05) for decision.
- **Following up a significant chi-square test:**
  - The chi-square test tells you WHETHER there's a significant association/difference but not WHICH cells differ.
  - To identify which cells contribute most to χ², compute "components" or look at standardized residuals: (Observed − Expected) / √Expected. Large absolute values indicate cells where observed differs most from expected.
  - This is beyond AP minimum but useful for [5]-level analysis.

### Adds for [5]

- **The conceptual unity of the three tests.** All three chi-square tests use the same formula and df calculation; the difference is in the data structure and inference. From a more general perspective, they're all comparing observed cell frequencies to those expected under a model (independence, equal distribution across populations, or specified distribution).
- **Why we square (O − E).** Squaring ensures all contributions are positive (otherwise positive and negative deviations would cancel). Dividing by E "weights" the squared deviation by what's expected — the same absolute deviation is more significant when expected count is small than when it's large.
- **Why chi-square is right-skewed.** Chi-square statistics are sums of squared standardized normal variables. Squared normals are skewed right (their distribution is bounded below at 0). Sums of skewed distributions tend to be skewed; the more df, the more symmetric the chi-square (by CLT).
- **The relationship to z-test for proportions:**
  - For 2x2 tables, the chi-square test of homogeneity is mathematically equivalent to the two-sided z-test for two proportions.
  - z² = χ² for 2x2 tables (with 1 df).
  - For 2x2 case, you can use either; for more cells, only chi-square works.
- **Combining categories when expected counts are small.** When some expected counts are < 5, one approach is to combine logical categories (e.g., merge "small" and "medium" into one). This requires:
  - Loss of information.
  - Reduced df.
  - Choice of how to combine should be theoretically meaningful, not data-driven (to avoid post-hoc adjustments that distort inference).
- **Type I and Type II errors in chi-square contexts.** Same general meaning as for other tests:
  - Type I: rejecting H₀ when true (concluding there IS an association/difference when there isn't).
  - Type II: failing to reject when H₀ is false (missing a real association/difference).
- **Beyond chi-square: more powerful tests for ordered categorical data.** When categories have a natural order (e.g., agreement levels), tests that USE the ordering (Mantel-Haenszel) have more power than chi-square (which ignores ordering). Beyond AP scope.

## Worked Examples

### Example 1 [3] — Goodness of fit test

A bag of M&Ms is supposed to contain colors in these proportions: red 13%, orange 20%, yellow 14%, green 16%, blue 24%, brown 13%. A sample of 200 M&Ms shows: red 22, orange 38, yellow 25, green 35, blue 50, brown 30. Test at α = 0.05 whether the observed colors fit the claimed distribution.

- **P:** the distribution of M&M colors in the company's product (specifically, the proportion of each color).
- **H:** H₀: distribution is as claimed (red 0.13, orange 0.20, etc.). Hₐ: distribution differs from claimed.
- **A:** Random sample ✓; 10% (likely much smaller than total production) ✓; Large Counts: all expected counts ≥ 5? Compute expected: red = 200(0.13) = 26; orange = 40; yellow = 28; green = 32; blue = 48; brown = 26. ALL ≥ 5 ✓.
- **N:** Chi-square goodness of fit test.
- **T:** χ² = (22−26)²/26 + (38−40)²/40 + (25−28)²/28 + (35−32)²/32 + (50−48)²/48 + (30−26)²/26
  = 16/26 + 4/40 + 9/28 + 9/32 + 4/48 + 16/26
  = 0.615 + 0.100 + 0.321 + 0.281 + 0.083 + 0.615 = 2.015.
  - df = 6 − 1 = 5.
  - p-value = P(χ² > 2.015 with 5 df) ≈ 0.847 (use χ²cdf(2.015, 9999, 5)).
- **O:** Since p-value (0.847) >> α (0.05), fail to reject H₀.
- **M:** Fail to reject H₀.
- **S:** "Because the p-value of 0.847 is much greater than 0.05, we fail to reject the null hypothesis. There is no convincing evidence that the distribution of M&M colors in the bag differs from the claimed distribution."

### Example 2 [3][4] — Test for independence

A survey of 200 people categorizes them by age group (young, middle, old) and political preference (liberal, moderate, conservative). The two-way table:

| | Liberal | Moderate | Conservative | Total |
|--|---------|----------|--------------|-------|
| Young | 35 | 30 | 15 | 80 |
| Middle | 20 | 30 | 30 | 80 |
| Old | 5 | 10 | 25 | 40 |
| Total | 60 | 70 | 70 | 200 |

Test at α = 0.05 whether age and political preference are independent.

- **P:** the joint distribution of age and political preference in the population.
- **H:** H₀: age and political preference are INDEPENDENT in the population. Hₐ: they are NOT independent (associated).
- **A:** Random ✓; 10% ✓; Large Counts: compute expected counts and verify all ≥ 5.
  - E(young, liberal) = 80(60)/200 = 24; E(young, moderate) = 80(70)/200 = 28; E(young, conservative) = 28.
  - E(middle, liberal) = 24; E(middle, moderate) = 28; E(middle, conservative) = 28.
  - E(old, liberal) = 12; E(old, moderate) = 14; E(old, conservative) = 14.
  - All ≥ 5 ✓.
- **N:** Chi-square test for independence.
- **T:** χ² = (35−24)²/24 + (30−28)²/28 + (15−28)²/28 + (20−24)²/24 + (30−28)²/28 + (30−28)²/28 + (5−12)²/12 + (10−14)²/14 + (25−14)²/14
  = 121/24 + 4/28 + 169/28 + 16/24 + 4/28 + 4/28 + 49/12 + 16/14 + 121/14
  ≈ 5.04 + 0.14 + 6.04 + 0.67 + 0.14 + 0.14 + 4.08 + 1.14 + 8.64 ≈ 26.03.
  - df = (3 − 1)(3 − 1) = 4.
  - p-value = P(χ² > 26.03 with 4 df) ≈ 0.000031 (extremely small).
- **O:** Since p-value (0.000031) << α (0.05), reject H₀.
- **M:** Reject H₀.
- **S:** "Because the p-value of approximately 0.000031 is much less than 0.05, we reject the null hypothesis. There is overwhelming evidence that age and political preference are NOT independent in the population — that is, they are associated."
- **[4] note:** examining the largest contributors to χ² (cells where observed differs most from expected): young people are MORE likely than expected to be liberal; old people are MORE likely than expected to be conservative. This shows the nature of the association.

### Example 3 [4] — Test for homogeneity

Two schools (A and B) survey their students about preferred extracurricular activities. School A: 50 sports, 30 arts, 20 academics (n=100). School B: 60 sports, 50 arts, 40 academics (n=150). Test at α = 0.05 whether the distributions are the same.

- **P:** the distribution of preferred extracurricular activities in each school's population.
- **H:** H₀: the distributions of preferred activities are the SAME across both schools. Hₐ: they differ.
- **A:** Random samples ✓; 10% ✓; Compute expected counts (table totals: row/column totals to find expected, with overall n = 250).
  - Column totals: 110 sports, 80 arts, 60 academics (sum = 250).
  - Row totals: 100 (School A), 150 (School B).
  - E(A, sports) = 100·110/250 = 44; E(A, arts) = 32; E(A, academics) = 24.
  - E(B, sports) = 66; E(B, arts) = 48; E(B, academics) = 36.
  - All ≥ 5 ✓.
- **N:** Chi-square test for homogeneity.
- **T:** χ² = (50−44)²/44 + (30−32)²/32 + (20−24)²/24 + (60−66)²/66 + (50−48)²/48 + (40−36)²/36
  = 36/44 + 4/32 + 16/24 + 36/66 + 4/48 + 16/36
  = 0.818 + 0.125 + 0.667 + 0.545 + 0.083 + 0.444 = 2.682.
  - df = (2 − 1)(3 − 1) = 2.
  - p-value = P(χ² > 2.682 with 2 df) ≈ 0.262.
- **O:** Since p-value (0.262) > α (0.05), fail to reject H₀.
- **M:** Fail to reject H₀.
- **S:** "Because the p-value of 0.262 is greater than 0.05, we fail to reject the null hypothesis. There is no convincing evidence that the distributions of preferred extracurricular activities differ between Schools A and B."

### Example 4 [4] — Selecting goodness of fit vs homogeneity vs independence

For each scenario, identify which chi-square test is appropriate:

(a) A geneticist crosses pea plants and expects offspring colors in a 9:3:3:1 ratio. She observes 150 plants with various colors and tests whether the observed counts fit the 9:3:3:1 ratio.

(b) A researcher samples 100 men and 100 women and asks each their preference among 4 brands of coffee. She tests whether the distribution of brand preferences is the same for men and women.

(c) A researcher samples 200 customers from one store and classifies them by age group (3 levels) and product purchased (4 levels). She tests whether age and product are independent.

- **(a) Goodness of fit:** ONE sample (150 plants), comparing observed distribution to a SPECIFIED distribution (9:3:3:1).
- **(b) Homogeneity:** TWO populations (men, women), each separately sampled (sample sizes pre-set), comparing distributions across populations.
- **(c) Independence:** ONE population, ONE sample of 200, classified on TWO variables, testing if variables are independent.
- **Memory trick:** is there ONE sample (then GOF or independence) or MULTIPLE samples (then homogeneity)? If ONE sample but TWO variables, it's independence. If ONE sample and ONE variable compared to specified distribution, it's GOF.

### Example 5 [5] — Why expected counts matter and what to do when they're too small

Suppose you do a chi-square test and find that one expected count is 3 (less than 5).

Options:
- **Combine categories:** if two categories are conceptually similar, combine them. This loses information but increases counts. Document the reason.
- **Use Fisher's exact test:** for 2x2 tables, Fisher's exact computes the p-value exactly (no approximation needed). Beyond AP scope but worth knowing.
- **Get a larger sample:** if possible, increase n to make all expected counts ≥ 5.
- **Caution in interpretation:** if expected counts are barely above 5 throughout, recognize the test is approximate and may have higher Type I error rate than nominal.

## Top Traps & Common Errors

1. **Confusing homogeneity with independence.** Same calculation, different setup. Multiple samples → homogeneity. One sample, two variables → independence.
2. **Wrong df.** GOF: df = categories − 1. Two-way (homogeneity or independence): df = (rows − 1)(cols − 1).
3. **Wrong expected count formula.** GOF: E = n × p. Two-way: E = row total × col total / overall total.
4. **Forgetting to verify Large Counts (all expected ≥ 5).** This is THE chi-square condition.
5. **Computing chi-square with observed counts twice instead of comparing to expected.** Formula: (O − E)² / E. Easy to slip into using O or E twice.
6. **Forgetting to sum across ALL cells.** χ² = Σ over all cells.
7. **Treating small p-value as showing strong PRACTICAL significance.** Statistical significance ≠ practical importance.
8. **Conclusion not in CONTEXT.** Always reference the variable(s), populations, and what the test means in the specific scenario.
9. **"Accept H₀."** Always "fail to reject H₀."
10. **Using chi-square when t-test or z-test is appropriate.** Chi-square is for CATEGORICAL data. Use z or t for continuous data.
11. **Misnaming the procedure.** Call it goodness of fit, homogeneity, or independence based on the data structure.
12. **Forgetting to compute observed counts from percentages.** If the data is given as percentages, multiply by sample size to get counts before chi-square.
13. **Using chi-square on data that's not in count form.** Chi-square requires actual counts, not means or proportions.
14. **Squaring the residuals incorrectly.** Make sure each (O − E) is squared before division by E.
15. **Forgetting to interpret which cells contribute most to χ².** Beyond the basic test, examining which cells deviate most from expected explains the nature of the association.

## Rubric-Aware Tactics

**For all chi-square tests:**
- State the appropriate test (GOF, homogeneity, or independence).
- Define hypotheses clearly.
- Verify conditions (Random, 10%, all expected ≥ 5).
- Compute expected counts (show calculations).
- Compute χ² statistic.
- Compare to chi-square distribution with appropriate df.
- State decision and conclusion in CONTEXT.

**For goodness of fit:**
- Specify the hypothesized distribution.
- Show all expected counts (E = n × p_i).
- df = number of categories − 1.

**For two-way tests (homogeneity or independence):**
- Identify whether one or multiple samples were drawn.
- Compute expected counts (E = row total × col total / overall total).
- df = (rows − 1)(cols − 1).
- Conclusion language differs:
  - Homogeneity: "the distributions [are/are not] the same across populations."
  - Independence: "the variables [are/are not] independent."

**For checking the Large Counts condition:**
- List ALL expected counts.
- Confirm each is ≥ 5 (or note which are below if any).

**For interpreting significant results:**
- Identify the cells contributing most to chi-square.
- Describe the nature of the association (which categories tend to occur with which).

## "Phrases That Score" — verbatim language for FRQs

1. "We will conduct a chi-square [goodness of fit / test for homogeneity / test for independence] because the data consist of categorical variable(s) and the question is about [matching a hypothesized distribution / comparing distributions across populations / testing for association between variables in one population]."
2. "Conditions: (1) Random — the sample(s) were randomly selected; (2) 10% — sample size is less than 10% of population; (3) Large Counts — all expected counts are at least 5 [verify with calculations]."
3. "The chi-square statistic is χ² = Σ (O − E)² / E = [calculation]. With df = [df], the p-value is approximately [value]."
4. "Since p-value ([value]) [< or >] α ([value]), we [reject / fail to reject] H₀. There [is / is not] convincing evidence that [Hₐ in context]."
5. "The expected counts under H₀ of independence/homogeneity are computed as (row total × column total) / overall total. For example, the expected count for the [cell] is ([calculation]) = [value]."
6. "The largest contributors to chi-square come from cells where [observed exceeds expected / observed falls below expected], suggesting that [interpretation in context]."

## If You Do Nothing Else for This Unit

*Master the distinction between the three chi-square tests: (1) Goodness of fit — ONE sample compared to specified distribution; (2) Homogeneity — MULTIPLE samples compared across populations; (3) Independence — ONE sample classified on TWO variables. The calculation is identical (χ² = Σ(O−E)²/E with appropriate df), but the setup, hypotheses, and conclusions differ. Master expected count computation: GOF uses n × p_i; two-way uses row × col / total. Verify the all-expected-counts-≥ 5 condition.*

_lastUpdated: 2026-05-04
_sources: College Board AP Statistics CED 2024-25, Princeton Review AP Statistics 2025, Khan Academy AP Statistics, The Practice of Statistics 6e (Starnes & Tabor)
_difficulty: intermediate
_relatedUnits: ap-statistics-unit-5-sampling-distributions, ap-statistics-unit-6-inference-proportions
