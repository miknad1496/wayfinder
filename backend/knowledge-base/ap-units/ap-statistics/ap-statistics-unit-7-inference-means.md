# AP Statistics — Unit 7: Inference for Quantitative Data — Means — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 10–18% of the AP Statistics exam
- **Sub-topics covered:**
  - 7.1 Introducing Statistics: Should I Worry About Error?
  - 7.2 Constructing a Confidence Interval for a Population Mean
  - 7.3 Justifying a Claim About a Population Mean Based on a Confidence Interval
  - 7.4 Setting Up a Test for a Population Mean
  - 7.5 Carrying Out a Test for a Population Mean
  - 7.6 Confidence Intervals for the Difference of Two Means
  - 7.7 Justifying a Claim About the Difference of Two Means Based on a Confidence Interval
  - 7.8 Setting Up a Test for the Difference of Two Population Means
  - 7.9 Carrying Out a Test for the Difference of Two Population Means
  - 7.10 Skills Focus: Selecting an Appropriate Inference Procedure for Means
- **Where this unit appears on the exam:** Unit 7 mirrors Unit 6 but for means instead of proportions. Two-sample t-tests/intervals are particularly common as full FRQs. The matched-pairs t-test is a perennial AP topic — recognizing when to use it (paired data) is the key challenge. Sample SD use of t-distribution (instead of z) is the core distinction from Unit 6. Selecting the right inference procedure (one-sample vs two-sample vs matched pairs) is a key skill tested in MCQ and FRQ format.

## Big Ideas

1. **When σ is unknown, we estimate it with s and use the t-distribution instead of z.** The t-distribution has fatter tails to account for the additional uncertainty from estimating σ. As n grows, t approaches z.
2. **Inference for means uses the same PHANTOMS framework as proportions, but with t-distribution.** All other steps (parameter, hypotheses, conditions, conclusion language) are identical.
3. **Conditions for means inference are: Random, 10%, Normal/Large Sample.** The Normal/Large Sample condition replaces the Large Counts condition from proportions inference.
4. **Two-sample inference for means has TWO common designs.** Two independent samples (use two-sample t-test) vs paired (matched-pairs t-test on the differences). Recognizing which is essential.
5. **Selecting the right procedure is a major skill.** Paired vs independent, one-sample vs two-sample, proportion vs mean, t vs chi-square — students must choose correctly before computing.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **One-sample t-confidence interval for μ:**
  - **Formula:** x̄ ± t* · (s/√n).
  - **t*** = critical value from t-distribution with df = n − 1.
  - **Standard error:** SE = s/√n.
  - **Margin of error:** ME = t* · SE.
- **Conditions for one-sample t-procedures:**
  - **Random:** sample is randomly selected.
  - **10% (Independence):** n ≤ 10% of population (if without replacement).
  - **Normal/Large Sample:** Population is approximately Normal OR n ≥ 30 (CLT). Check sample shape via histogram, dotplot, or boxplot if n < 30.
- **One-sample t-test:**
  - **Hypotheses:**
    - H₀: μ = μ₀
    - Hₐ: μ < μ₀, μ > μ₀, or μ ≠ μ₀
  - **Test statistic:** t = (x̄ − μ₀) / (s/√n).
  - **df = n − 1.**
  - **p-value:** computed from t-distribution.
  - **Decision:** reject H₀ if p-value < α.
- **Two-sample t-procedures (independent samples):**
  - **CI for μ₁ − μ₂:** (x̄₁ − x̄₂) ± t* · √(s₁²/n₁ + s₂²/n₂).
  - **Test statistic:** t = (x̄₁ − x̄₂) / √(s₁²/n₁ + s₂²/n₂).
  - **df:** AP uses the conservative approximation: df = min(n₁ − 1, n₂ − 1) (or use calculator for the more precise Welch-Satterthwaite formula).
- **Matched-pairs t-procedures:**
  - When data are PAIRED (e.g., before/after on same subjects, twin pairs, matched subjects), compute the DIFFERENCES first.
  - Apply ONE-SAMPLE t-procedures to the differences.
  - **CI for μ_d:** d̄ ± t* · (s_d/√n_d), where d̄ is mean of differences, s_d is SD of differences, n_d is number of pairs.
  - **Test statistic:** t = (d̄ − μ_d,0) / (s_d/√n_d), df = n_d − 1.
  - Most common: H₀: μ_d = 0 (no difference) vs Hₐ: μ_d ≠ 0 (or one-sided).
- **Selecting the procedure:**
  - **Mean vs proportion?** Quantitative variable → mean. Categorical variable → proportion.
  - **One sample vs two samples?** Single group → one-sample. Two groups → two-sample.
  - **Independent vs paired?** Two independent random samples → two-sample t. Paired observations (same subjects, before/after; matched) → matched-pairs (one-sample on differences).

### Adds for [4]

- **Why t-distribution instead of Normal.** When we estimate σ with s, we add uncertainty. The t-distribution has slightly heavier tails to account for this. As n increases, the uncertainty in estimating σ shrinks, and t approaches Normal. By n = 30, the difference is negligible for most purposes.
- **t-distribution properties:**
  - Symmetric, bell-shaped (like Normal).
  - Centered at 0.
  - Heavier tails than Normal.
  - Defined by degrees of freedom (df).
  - df = n − 1 for one-sample.
  - As df → ∞, t → Normal.
- **Why we check Normal/Large Sample condition.** For small samples (n < 30), the t-procedures require the POPULATION to be approximately Normal. Check by examining a histogram, dotplot, boxplot, or normal probability plot of the SAMPLE. For larger samples (n ≥ 30), CLT makes the sampling distribution approximately Normal even if the population isn't.
- **Why min(n₁−1, n₂−1) for two-sample df.** This is the conservative choice. The more accurate Welch-Satterthwaite formula gives larger df, leading to slightly tighter CIs. AP accepts either approach but the conservative version is safer for written work; calculators automatically use the more precise version.
- **Robustness of t-procedures:**
  - For symmetric distributions: t-procedures work well even with small n.
  - For skewed distributions: requires n ≥ 30 typically.
  - For very skewed distributions or small n with skewness: may need n ≥ 40 or more.
- **Recognizing matched pairs:**
  - Same subject measured twice (before/after, with/without treatment).
  - Subjects matched by some characteristic (twins, identical conditions).
  - Repeated measures on same units.
  - **Key sign:** the data has a NATURAL pairing structure.
- **Matched-pairs vs two-sample comparison:**
  - Matched-pairs is generally MORE powerful than two-sample (for same data structure) because it removes between-subject variation.
  - Always check the design: if pairing exists, use matched-pairs.
- **Using calculators for t-procedures:**
  - **TI calculator:** STAT TESTS — 8: TInterval for one-sample CI; 2: T-Test for one-sample test; 0: 2-SampTInt for two-sample CI; 4: 2-SampTTest for two-sample test.
  - For matched pairs: compute differences first, then use 8 or 2.
- **Confidence interval and hypothesis test connections:**
  - For two-sided test: if CI for μ excludes μ₀, you would reject H₀: μ = μ₀ at corresponding α.
  - For two-sample CI: if CI for μ₁ − μ₂ excludes 0, you would reject H₀: μ₁ = μ₂.

### Adds for [5]

- **The historical Fisher development of t-distribution.** William Sealy Gosset (writing as "Student" while at Guinness Brewery in Dublin) developed the t-distribution in 1908 to handle small-sample beer-quality testing. The modern theoretical framework was developed by Fisher.
- **Why we use sample standard deviation s with n − 1.** Using n in the denominator gives a biased estimate of σ²; using n − 1 (Bessel's correction) makes s² unbiased. The "−1" reflects the loss of one degree of freedom by estimating the mean before computing deviations.
- **The Behrens-Fisher problem.** When two populations have different variances and unknown variances, the exact distribution of the test statistic isn't t. Welch (1947) approximated it with a t-distribution using a complex df formula. AP uses either Welch's approximation (calculator) or the conservative min(n₁−1, n₂−1).
- **Pooled vs unpooled t-tests.** Pooled assumes σ₁ = σ₂; unpooled doesn't. AP Stats traditionally uses unpooled (more general), but pooled is more efficient when variances are truly equal. For modern practice (and AP), always use unpooled unless explicitly told otherwise.
- **Effect of robustness:**
  - For symmetric populations with no outliers: t-procedures work even for very small n.
  - For skewed populations: increase n requirement.
  - For populations with outliers: t-procedures can be misleading. Consider robust alternatives or remove outliers (with justification).
- **The "10% condition" beyond proportions.** Originally framed for proportions (Unit 5/6), the 10% condition applies to all sampling without replacement. For means too: if n ≤ 10% of population, treat as approximately independent.
- **Difference between matched pairs and two-sample analysis:** the SAME data can yield different inferences depending on whether it's analyzed as paired or as two independent samples. If it's truly paired, two-sample analysis loses efficiency (ignores the pairing structure) and can fail to detect real differences. Always identify the design correctly.

## Worked Examples

### Example 1 [3] — One-sample t-CI

A random sample of 25 students has a mean SAT score of x̄ = 1150 with SD s = 200. Construct a 95% CI for the true mean SAT score in the population.

- **Step 1.** Conditions: Random ✓ (assumed); 10% (likely thousands of students) ✓; Normal/Large Sample: n = 25 < 30, so check sample shape; assume approximately Normal.
- **Step 2.** df = 25 − 1 = 24. From t-table or calculator: t* (95%, 24 df) = 2.064.
- **Step 3.** SE = 200 / √25 = 40.
- **Step 4.** ME = 2.064 · 40 = 82.6.
- **Step 5.** CI: 1150 ± 82.6 = (1067.4, 1232.6).
- **Step 6.** Interpretation: "We are 95% confident that the true mean SAT score in the population is between 1067.4 and 1232.6."

### Example 2 [3][4] — One-sample t-test (PHANTOMS)

A company claims their product weighs 500 grams on average. A random sample of 36 products yields x̄ = 495 grams with s = 12 grams. Test whether the true mean differs from 500 at α = 0.05.

- **P (Parameter):** μ = the true mean weight of the company's products, in grams.
- **H (Hypotheses):** H₀: μ = 500; Hₐ: μ ≠ 500 (two-sided).
- **A (Conditions):** Random ✓ (assumed); 10% (presumably thousands of products manufactured) ✓; Normal/Large Sample: n = 36 ≥ 30, so CLT applies.
- **N (Name):** One-sample t-test for a mean.
- **T (Test statistic + p-value):**
  - SE = 12 / √36 = 2.
  - t = (495 − 500) / 2 = −2.50.
  - df = 35.
  - p-value (two-sided) = 2 · P(t < −2.50) = 2 · 0.009 = 0.018 (approximately; check with calculator: tcdf(−999, −2.5, 35) ≈ 0.0087, two-sided p-value ≈ 0.0174).
- **O:** Since p-value (0.0174) < α (0.05), we reject H₀.
- **M:** Reject H₀.
- **S:** "Because the p-value of 0.0174 is less than 0.05, we reject the null hypothesis. There is convincing evidence that the true mean weight of the company's products differs from 500 grams. (The sample mean of 495 g is significantly lower than the claimed 500 g.)"

### Example 3 [4] — Two-sample t-test

Two teaching methods are compared. Method A: 30 students, x̄_A = 78, s_A = 10. Method B: 25 students, x̄_B = 72, s_B = 12. Test at α = 0.05 whether the true means differ.

- **P:** μ_A = true mean score with Method A; μ_B = true mean score with Method B.
- **H:** H₀: μ_A = μ_B (or μ_A − μ_B = 0); Hₐ: μ_A ≠ μ_B (two-sided).
- **A:** Random/independent ✓; 10% ✓; Normal/Large Sample: n_A = 30 ≥ 30 ✓; n_B = 25 < 30, so check Method B sample shape; assume approximately Normal.
- **N:** Two-sample t-test for difference in means.
- **T:** SE = √(10²/30 + 12²/25) = √(3.33 + 5.76) = √9.09 = 3.02.
  - t = (78 − 72) / 3.02 = 1.99.
  - df = min(29, 24) = 24 (conservative).
  - p-value (two-sided) ≈ 2 · P(t > 1.99 with 24 df) ≈ 2 · 0.029 = 0.058. (Calculator gives more precise df via Welch-Satterthwaite; for this data, df ≈ 47, p-value ≈ 0.052.)
- **O:** Using conservative df, p-value (0.058) > α (0.05). Fail to reject H₀.
- **M:** Fail to reject H₀.
- **S:** "Because the p-value of 0.058 (using conservative df = 24) is greater than 0.05, we fail to reject the null hypothesis. We do not have convincing evidence that the true mean scores for Methods A and B differ." (Note: with calculator's more precise df, p-value ≈ 0.052, still > 0.05.)

### Example 4 [4] — Matched-pairs t-test

A weight-loss program is evaluated by measuring 20 participants' weights before and after the program. Differences (after − before) are calculated:
- Mean difference d̄ = −5.2 lbs (negative = weight loss).
- SD of differences s_d = 3.5 lbs.

Test at α = 0.01 whether the program significantly reduces weight.

- **P:** μ_d = true mean weight change (after − before) for participants in this program.
- **H:** H₀: μ_d = 0; Hₐ: μ_d < 0 (one-sided, testing for weight loss).
- **A:** Random ✓ (assumed); 10% ✓; Normal/Large Sample: n_d = 20 < 30, check shape of differences; assume approximately Normal.
- **N:** Matched-pairs t-test (apply one-sample t-test to the differences).
- **T:** SE = 3.5 / √20 = 0.783.
  - t = (−5.2 − 0) / 0.783 = −6.64.
  - df = 19.
  - p-value (one-sided) ≈ P(t < −6.64) ≈ 0.000002 (extremely small).
- **O:** Since p-value (0.000002) << α (0.01), reject H₀.
- **M:** Reject H₀.
- **S:** "Because the p-value is extremely small (much less than 0.01), we reject the null hypothesis. There is overwhelming evidence that the weight-loss program significantly reduces the mean weight of participants."
- **Note:** because data is paired (same subjects measured twice), matched-pairs (one-sample on differences) is correct, not two-sample t-test.

### Example 5 [5] — Selecting the right procedure

Identify the correct inference procedure for each scenario:

(a) Researchers measure the systolic blood pressure of 50 randomly selected adults to estimate the mean blood pressure of all adults.
(b) Researchers compare the mean systolic blood pressure of 50 randomly selected men with the mean of 50 randomly selected women.
(c) Researchers measure systolic blood pressure of 30 patients before and 30 days after starting medication.
(d) Researchers want to estimate the proportion of voters who plan to vote for a candidate.

- **(a)** One-sample t-procedure for mean (one group, quantitative variable).
- **(b)** Two-sample t-procedure for difference in means (two independent groups).
- **(c)** Matched-pairs t-procedure (same subjects measured twice — paired data).
- **(d)** One-sample z-procedure for proportion (one group, categorical variable).
- **Common error:** treating (c) as two-sample t. The before/after measurements are PAIRED (same subjects), not independent samples — must use matched-pairs.

## Top Traps & Common Errors

1. **Using z instead of t for sample SD.** When σ is unknown and s is used, use t-distribution with df = n − 1.
2. **Confusing matched-pairs and two-sample.** If data is paired (same subjects, before/after), use matched-pairs (one-sample on differences). If two independent groups, use two-sample.
3. **Wrong df.** For one-sample: df = n − 1. For matched pairs: df = n_d − 1 (n_d = number of pairs). For two-sample: df = min(n₁ − 1, n₂ − 1) [conservative] or Welch-Satterthwaite [calculator].
4. **Skipping conditions.** Random, 10%, Normal/Large Sample.
5. **Forgetting to check Normal condition for small samples.** For n < 30, examine sample shape (histogram, dotplot).
6. **Not mentioning shape checking when n is small.** AP rubrics may require explicit verification ("the sample shows no strong skewness or outliers").
7. **Conclusion not in CONTEXT.** Always reference the variable, units, and population.
8. **"Accept H₀."** Always "fail to reject H₀."
9. **Confusing one-sided and two-sided.** For one-sided test in a specific direction: p-value = P(t > observed) or P(t < observed). For two-sided: p-value = 2 · P(t > |observed|).
10. **Computing differences in wrong order for matched pairs.** Be consistent: always compute (after − before) or always (treatment − control). The sign of d̄ and the alternative hypothesis must align.
11. **Treating paired data as independent two samples.** Loses pairing efficiency; can fail to detect real differences.
12. **Wrong critical value t* lookup.** For 95% CI with 24 df: t* = 2.064. For 99% CI with 24 df: t* = 2.797.
13. **Using two-sample t-test on paired data.** This is the most common Unit 7 error.
14. **Confusing the test statistic with the parameter.** t = (x̄ − μ₀) / (s/√n). The numerator is sample minus hypothesized; SE is in denominator.
15. **Reporting CIs in wrong format.** Always include: lower bound, upper bound, units, what variable, what population, in CONTEXT.

## Rubric-Aware Tactics

**For one-sample t-procedures:**
- State conditions explicitly.
- Compute SE = s/√n.
- Use df = n − 1.
- For test: compute t = (x̄ − μ₀) / SE.
- For CI: x̄ ± t* · SE.

**For matched-pairs:**
- IDENTIFY the pairing structure first.
- Compute differences (consistent direction).
- Apply one-sample t-procedures to the differences.

**For two-sample t-procedures:**
- Verify the data are TWO INDEPENDENT samples (not paired).
- Use SE = √(s₁²/n₁ + s₂²/n₂).
- Use df = min(n₁−1, n₂−1) for written work, or Welch-Satterthwaite for calculator.

**For all inference:**
- Use PHANTOMS template.
- Verify conditions.
- Compute test statistic and p-value (or CI).
- State conclusion in CONTEXT with verbatim language.

**For selecting procedure:**
- Quantitative variable → mean → t-procedure.
- One group → one-sample. Paired data → matched-pairs (one-sample on differences). Two independent groups → two-sample.

## "Phrases That Score" — verbatim language for FRQs

1. "Because we are estimating σ from the sample, we use a t-distribution with df = [n − 1] degrees of freedom."
2. "Conditions: (1) Random — the sample was randomly selected; (2) 10% — n = [n] is less than 10% of the population; (3) Normal/Large Sample — n = [n] is [≥ 30, so CLT applies / less than 30, but the sample shape shows no strong skewness or outliers]."
3. "Because the data are paired (each subject measured before and after), we use a matched-pairs t-procedure on the differences."
4. "We are [X]% confident that the true mean [variable in context] is between [lower] and [upper] [units]."
5. "Since p-value ([value]) [< or >] α ([value]), we [reject / fail to reject] H₀. There [is / is not] convincing evidence that [Hₐ in context]."
6. "The two-sample t-procedure is appropriate because the two samples are independent and randomly selected, with both samples meeting the Normal/Large Sample condition."
7. "Because n = [n] is small (less than 30), we examine the sample distribution; the [histogram / dotplot / boxplot] shows no strong skewness or outliers, so the Normal condition is satisfied."

## If You Do Nothing Else for This Unit

*Master three things: (1) recognize when to use t vs z (use t when σ is unknown, which is almost always with sample data); (2) recognize matched-pairs design (paired observations) and apply one-sample t-procedures to the differences — never two-sample t on paired data; (3) check Normal/Large Sample condition appropriately (n ≥ 30 OR check sample shape if smaller). Combined with PHANTOMS and verbatim conclusion language from Unit 6, these unlock every Unit 7 inference question.*

_lastUpdated: 2026-05-04
_sources: College Board AP Statistics CED 2024-25, Princeton Review AP Statistics 2025, Khan Academy AP Statistics, The Practice of Statistics 6e (Starnes & Tabor)
_difficulty: intermediate
_relatedUnits: ap-statistics-unit-3-collecting-data, ap-statistics-unit-5-sampling-distributions, ap-statistics-unit-6-inference-proportions
