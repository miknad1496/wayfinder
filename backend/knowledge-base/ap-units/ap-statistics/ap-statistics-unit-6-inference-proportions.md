# AP Statistics — Unit 6: Inference for Categorical Data — Proportions — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 12–15% of the AP Statistics exam
- **Sub-topics covered:**
  - 6.1 Introducing Statistics: Why Be Normal?
  - 6.2 Constructing a Confidence Interval for a Population Proportion
  - 6.3 Justifying a Claim Based on a Confidence Interval for a Population Proportion
  - 6.4 Setting Up a Test for a Population Proportion
  - 6.5 Interpreting p-Values
  - 6.6 Concluding a Test for a Population Proportion
  - 6.7 Potential Errors When Performing Tests
  - 6.8 Confidence Intervals for the Difference of Two Proportions
  - 6.9 Justifying a Claim Based on a Confidence Interval for the Difference of Two Proportions
  - 6.10 Setting Up a Test for the Difference of Two Population Proportions
  - 6.11 Carrying Out a Test for the Difference of Two Population Proportions
- **Where this unit appears on the exam:** Unit 6 introduces formal inference and is heavily tested. The PHANTOMS template for hypothesis testing is the brain file's most-cited Stats template — it appears in nearly every Unit 6+ FRQ. Confidence interval construction and interpretation are perennial. The "verbatim conclusion language" requirements (CI: "We are X% confident that the true [parameter] is between A and B"; HT: "We reject H₀ / fail to reject H₀, providing convincing evidence that...") are non-negotiable rubric requirements. Type I and Type II errors and statistical power appear as conceptual MCQs.

## Big Ideas

1. **Inference moves from sample to population.** A confidence interval estimates the parameter; a hypothesis test evaluates a claim about the parameter. Both leverage the sampling distribution from Unit 5.
2. **Confidence intervals provide RANGE estimates of parameters.** "We are 95% confident that the true proportion is between 0.42 and 0.48" — this means our METHOD captures the true parameter in 95% of all possible samples.
3. **Hypothesis tests evaluate evidence against a null hypothesis.** We measure how unusual the observed sample would be IF the null hypothesis were true. Small p-values indicate strong evidence against the null.
4. **The PHANTOMS template structures every hypothesis test.** Parameter, Hypotheses, Assumptions/Conditions, Name the test, Test statistic and p-value, Obtain conclusion in CONTEXT, Make decision, State conclusion in CONTEXT.
5. **Type I and Type II errors quantify the two ways inference can be wrong.** Type I: rejecting a true H₀ (false alarm). Type II: failing to reject a false H₀ (missed detection). Power = 1 − P(Type II) = probability of correctly rejecting a false H₀.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Confidence interval (CI) for one proportion:**
  - **Formula:** p̂ ± z* · √(p̂(1−p̂)/n)
  - **z*** = critical value from standard Normal (1.96 for 95%, 1.645 for 90%, 2.576 for 99%).
  - **Standard error:** SE = √(p̂(1−p̂)/n).
  - **Margin of error:** ME = z* · SE.
- **Conditions for one-proportion CI/test:**
  - **Random:** sample is randomly selected.
  - **10% (Independence):** n ≤ 10% of population.
  - **Large Counts:** np̂ ≥ 10 AND n(1−p̂) ≥ 10. (For tests using H₀: use np₀ ≥ 10 AND n(1−p₀) ≥ 10.)
- **Hypothesis test for one proportion:**
  - **Hypotheses:**
    - H₀: p = p₀
    - Hₐ: p < p₀, p > p₀, or p ≠ p₀
  - **Test statistic:** z = (p̂ − p₀) / √(p₀(1−p₀)/n).
  - **p-value:** the probability of observing data as extreme as or more extreme than observed, IF H₀ is true.
  - **Decision:** reject H₀ if p-value < α (significance level, often 0.05). Otherwise fail to reject.
- **Confidence interval for difference of two proportions:**
  - **Formula:** (p̂₁ − p̂₂) ± z* · √(p̂₁(1−p̂₁)/n₁ + p̂₂(1−p̂₂)/n₂).
  - **Note:** SE uses unpooled proportions (each sample has its own p̂).
- **Hypothesis test for difference of two proportions (commonly testing H₀: p₁ = p₂):**
  - **Hypotheses:**
    - H₀: p₁ = p₂ (equivalent to p₁ − p₂ = 0)
    - Hₐ: p₁ < p₂, p₁ > p₂, or p₁ ≠ p₂.
  - **Pooled proportion** (used because under H₀, both samples share the same proportion): p̂_c = (x₁ + x₂) / (n₁ + n₂).
  - **Test statistic:** z = (p̂₁ − p̂₂) / √(p̂_c(1−p̂_c) · (1/n₁ + 1/n₂)).
  - **p-value:** based on standard Normal.
- **Type I and Type II errors:**
  - **Type I error:** rejecting H₀ when H₀ is true. Probability = α (significance level).
  - **Type II error:** failing to reject H₀ when H₀ is false. Probability = β.
  - **Power = 1 − β:** probability of correctly rejecting a false H₀.
- **PHANTOMS template** for hypothesis tests:
  - **P** Parameter — define in CONTEXT.
  - **H** Hypotheses — symbols + words.
  - **A** Assumptions / Conditions — VERIFY each.
  - **N** Name the test.
  - **T** Test statistic + p-value.
  - **O** Obtain conclusion in CONTEXT.
  - **M** Make decision (reject / fail to reject).
  - **S** State conclusion in CONTEXT.

### Adds for [4]

- **Verbatim conclusion templates** (memorize cold):
  - **Reject H₀:** "Since p-value (___) < α (___), we REJECT H₀. There IS convincing evidence that [Hₐ in context]."
  - **Fail to reject:** "Since p-value (___) > α (___), we FAIL to reject H₀. There is NOT convincing evidence that [Hₐ in context]."
  - **Confidence interval:** "We are ___% confident that the true [parameter in context] is between ___ and ___."
- **NEVER write "accept H₀."** This is a guaranteed lost point. Always say "fail to reject H₀."
- **NEVER write "probability the parameter is in interval."** The parameter is FIXED (just unknown). The CI is RANDOM. The correct phrasing is about confidence in the METHOD, not probability of the parameter.
- **CI level interpretation:** "If we repeated this sampling procedure many times, about [X]% of the constructed intervals would contain the true [parameter]." This is about METHOD, not any one specific interval.
- **Why pooled SE for two-proportion test:** under H₀: p₁ = p₂ = p (some common value), our best estimate of this common p is the pooled p̂_c = (x₁ + x₂) / (n₁ + n₂). The test statistic uses this pooled estimate.
- **Why unpooled SE for two-proportion CI:** the CI doesn't assume p₁ = p₂. Each sample contributes its own p̂.
- **Connection between CI and HT for proportion:**
  - If a 95% CI for p does NOT include p₀, then a two-sided test at α = 0.05 would reject H₀: p = p₀.
  - If the CI INCLUDES p₀, you would FAIL to reject H₀.
  - This works for two-sided tests with confidence level + α = 1.
- **Statistical significance vs practical importance:**
  - Statistical significance: p-value < α.
  - Practical importance: effect size matters in real-world terms.
  - Large samples can make small effects significant; small samples can miss large effects.
  - AP wants you to comment on PRACTICAL meaning, not just statistical significance.
- **Effect of changes on margin of error:**
  - **Larger sample:** smaller ME (1/√n relationship).
  - **Higher confidence level:** larger ME (larger z*).
  - To halve ME: quadruple sample size.
- **Determining minimum sample size:**
  - Solve for n in: ME = z* · √(p̂(1−p̂)/n).
  - n = (z*/ME)² · p̂(1−p̂).
  - When p̂ unknown, use 0.5 (maximizes p̂(1−p̂) at 0.25, giving worst-case largest n).
- **Increasing power:**
  - **Larger sample size** → smaller SE → larger test statistic for same effect → higher power.
  - **Larger effect size** (true p further from H₀) → easier to detect.
  - **Larger α** (looser rejection criterion) → higher power, but more Type I errors.

### Adds for [5]

- **Why "fail to reject" not "accept" H₀.** Hypothesis testing can never PROVE H₀; we can only fail to find sufficient evidence against it. "Accept" implies certainty we don't have. The data may be insufficient (small sample, low power) — H₀ might still be false.
- **Why "true p" in CI interpretation, not "probability."** The parameter p is a FIXED but unknown number — not random. After a sample is drawn, the CI is a fixed range of numbers. The parameter is either in or not in this specific interval; there's no probability about it. The "95% confidence" applies to the LONG-RUN performance of the METHOD.
- **One-sided vs two-sided tests.** Choice depends on the research question:
  - **Two-sided** (Hₐ: p ≠ p₀): testing for any difference. Most common.
  - **One-sided** (Hₐ: p > p₀ or p < p₀): testing for a specific direction. Used when only one direction matters or is theoretically expected.
  - One-sided tests have HALF the p-value of two-sided tests for the same observed direction.
- **The trade-off between Type I and Type II errors.** Lowering α (more strict rejection) reduces Type I but INCREASES Type II (less power). You can't minimize both simultaneously with the same data. Practical resolution: choose α based on the relative cost of each error type.
- **Power analysis.** Before doing a study, you can compute the sample size needed to detect a specific effect size with a given power (often 0.80). This requires:
  - Specifying H₀ and Hₐ.
  - Specifying minimum effect size you want to detect.
  - Specifying desired power.
  - Solving for n.
  - AP rarely asks for full power calculations but expects qualitative understanding.
- **The "p-hacking" problem.** Running many tests on the same data and reporting only significant ones inflates Type I error rates. This is why pre-registration of analysis plans matters in real research.
- **Why p-value is NOT the probability that H₀ is true.** P-value is P(data as extreme as observed | H₀ true). It's NOT P(H₀ true | data observed). Confusing these is the most common p-value misinterpretation.
- **Interpreting p-value precisely.** "If H₀ were true, the probability of observing a sample as extreme as or more extreme than the one we obtained is [p-value]." A small p-value means our data is unusual under H₀, providing evidence against H₀ — but doesn't say anything about how true H₀ is in any direct probabilistic sense (frequentist framework).

## Worked Examples

### Example 1 [3] — Confidence interval for one proportion

A poll of 600 voters finds that 318 (53%) support a candidate. Construct a 95% CI for the true proportion of voters supporting the candidate.

- **Step 1.** Identify: p̂ = 318/600 = 0.530; n = 600; confidence level 95% → z* = 1.96.
- **Step 2.** Check conditions: Random ✓; 10% (likely thousands of voters in population) ✓; Large Counts: np̂ = 318 ≥ 10 ✓; n(1−p̂) = 282 ≥ 10 ✓.
- **Step 3.** SE = √(0.530 · 0.470 / 600) = √0.000415 = 0.0204.
- **Step 4.** ME = 1.96 · 0.0204 = 0.0400.
- **Step 5.** CI: 0.530 ± 0.040 = (0.490, 0.570).
- **Step 6.** Interpretation: "We are 95% confident that the true proportion of voters supporting the candidate is between 0.490 and 0.570."
- **Note:** because the CI includes 0.50 (the threshold for majority), we cannot conclude with 95% confidence that the candidate has majority support.

### Example 2 [3][4] — Hypothesis test for one proportion (PHANTOMS)

Historically, 75% of a city's voters favored a particular candidate. A poll of 200 voters finds 140 (70%) currently favor the candidate. Has support significantly decreased? Use α = 0.05.

- **P (Parameter):** p = the true proportion of city voters who favor the candidate.
- **H (Hypotheses):** H₀: p = 0.75; Hₐ: p < 0.75 (one-sided, testing for decrease).
- **A (Assumptions / Conditions):** Random ✓; 10% (likely thousands of city voters) ✓; Large Counts: np₀ = 200·0.75 = 150 ≥ 10 ✓, n(1−p₀) = 200·0.25 = 50 ≥ 10 ✓.
- **N (Name the test):** One-sample z-test for a proportion.
- **T (Test statistic + p-value):**
  - p̂ = 0.70; SE = √(0.75 · 0.25 / 200) = √0.000938 = 0.0306.
  - z = (0.70 − 0.75) / 0.0306 = −1.63.
  - p-value (one-sided) = P(z < −1.63) = 0.0516. (Or normalcdf(−999, −1.63, 0, 1) = 0.0516.)
- **O (Obtain conclusion in context):** Since p-value (0.0516) > α (0.05), we FAIL to reject H₀. We do NOT have convincing evidence that the true proportion of voters favoring the candidate has decreased below 0.75.
- **M (Make decision):** Fail to reject H₀.
- **S (State conclusion in CONTEXT):** "Because the p-value of 0.0516 is greater than the significance level of 0.05, we fail to reject the null hypothesis. There is not convincing evidence that the true proportion of city voters who favor the candidate has decreased from 75%."

### Example 3 [4] — Two-proportion confidence interval

A study compares two methods for treating a disease. Method A: 80 of 100 patients improve (80%). Method B: 60 of 100 patients improve (60%). Construct a 95% CI for the difference (p_A − p_B).

- **Step 1.** Conditions: Random ✓ (assumed); 10% ✓; Large Counts: np̂ ≥ 10 for both ✓.
- **Step 2.** SE = √(0.80·0.20/100 + 0.60·0.40/100) = √(0.0016 + 0.0024) = √0.004 = 0.0632.
- **Step 3.** ME = 1.96 · 0.0632 = 0.1240.
- **Step 4.** CI: (0.80 − 0.60) ± 0.124 = 0.20 ± 0.12 = (0.076, 0.324).
- **Step 5.** Interpretation: "We are 95% confident that the true difference in improvement rates between Method A and Method B is between 0.076 and 0.324, with Method A being more effective. Because the entire interval is positive, we have convincing evidence that Method A has a higher improvement rate than Method B."

### Example 4 [4] — Two-proportion hypothesis test

Compare improvement rates from Example 3 using a hypothesis test at α = 0.05.

- **P:** p_A = true proportion improving with Method A; p_B = true proportion improving with Method B.
- **H:** H₀: p_A = p_B (or p_A − p_B = 0); Hₐ: p_A > p_B (one-sided, testing if Method A is BETTER).
- **A:** Random/independent samples ✓; 10% ✓; Large Counts: pooled p̂_c = (80+60)/(100+100) = 0.70; np̂_c = 140 ≥ 10 ✓; n(1−p̂_c) = 60 ≥ 10 ✓ (each sample).
- **N:** Two-sample z-test for proportions.
- **T:** SE_pooled = √(0.70·0.30·(1/100 + 1/100)) = √0.0042 = 0.0648.
  - z = (0.80 − 0.60) / 0.0648 = 3.09.
  - p-value (one-sided) = P(z > 3.09) = 0.001 (or normalcdf(3.09, 999, 0, 1) = 0.001).
- **O:** Since p-value (0.001) < α (0.05), we REJECT H₀.
- **M:** Reject H₀.
- **S:** "Because the p-value of 0.001 is much less than 0.05, we reject the null hypothesis. There is very strong evidence that Method A has a higher true improvement rate than Method B."

### Example 5 [5] — Type I, Type II error, and power

A medical test screens for a disease. H₀: patient is healthy (no disease). Hₐ: patient has disease.

- **Type I error:** rejecting H₀ when the patient is actually healthy. The patient is told they have the disease when they don't (false positive). Probability = α.
- **Type II error:** failing to reject H₀ when the patient actually has the disease. The patient is told they're healthy when they're not (false negative). Probability = β.
- **Power = 1 − β:** the probability of correctly identifying a sick patient as having the disease.
- **Trade-off considerations:** A more sensitive test (lower α) reduces false positives but creates more false negatives (higher β, lower power).
- **In medical screening context:** Type II errors (missed disease) are often considered more serious than Type I errors (unnecessary follow-up testing). So screening tests often use a low threshold (high sensitivity = high power), accepting more false positives.

## Top Traps & Common Errors

1. **"Accept H₀."** NEVER. Always "fail to reject H₀."
2. **"95% probability the true p is in the interval."** WRONG. The parameter is fixed, not random. Correct: "We are 95% confident..."
3. **Forgetting "true" in CI interpretations.** Without "true," the interpretation is ambiguous. Always: "true [parameter]."
4. **Conclusion not in CONTEXT.** Just saying "we reject H₀" loses points. Must reference the specific variable, population, and context.
5. **Confusing one-sided and two-sided.** One-sided p-value is HALF the two-sided p-value (for observations in the predicted direction). Pay attention to the alternative hypothesis.
6. **Using p̂ vs p₀ in conditions.** For test conditions, use p₀ (from H₀). For CI conditions, use p̂.
7. **Using sample SE for two-proportion test instead of pooled SE.** Two-prop test uses pooled p̂_c. CI uses unpooled.
8. **Forgetting to check conditions.** AP rubrics often require explicit verification of each condition.
9. **p-value misinterpretation.** P-value is NOT the probability H₀ is true. It's P(data as extreme | H₀ true).
10. **Saying "the test confirms H₀."** Hypothesis tests can never confirm H₀.
11. **Mismatched α and confidence level.** A two-sided test at α = 0.05 corresponds to a 95% CI (1 − α = confidence level).
12. **Wrong critical value.** Memorize: z* = 1.96 for 95%, 1.645 for 90%, 2.576 for 99%, 1.28 for 80%.
13. **Sample size too small for Large Counts.** If np̂ < 10 or n(1−p̂) < 10, the Normal approximation may not be valid.
14. **Decreasing α to "improve" the test.** Decreasing α makes Type I rarer but INCREASES Type II (loses power).
15. **Statistical vs practical significance confusion.** A statistically significant result with a tiny effect may not matter practically.

## Rubric-Aware Tactics

**For confidence intervals:**
- State conditions explicitly.
- Use formula and identify each component.
- Compute the interval.
- Interpret in CONTEXT with "true" and the appropriate population.

**For hypothesis tests:**
- Use PHANTOMS template.
- Define parameter in context.
- State H₀ and Hₐ in symbols and words.
- Verify all conditions.
- Compute test statistic and p-value.
- Compare p-value to α.
- State decision (reject/fail to reject) AND conclusion in CONTEXT.

**For two-proportion tests/CI:**
- For test: use pooled SE (under H₀: p₁ = p₂).
- For CI: use unpooled SE.
- Check Large Counts for both samples.

**For Type I/II error questions:**
- Identify what each error means in CONTEXT (which mistake is being made).
- Identify which error is "worse" given the context (often Type II in medical contexts).
- Note that lowering α reduces Type I but increases Type II.

**For power questions:**
- Power = 1 − β = probability of correctly rejecting a false H₀.
- Increases with: larger n, larger effect size, larger α.

## "Phrases That Score" — verbatim language for FRQs

1. "We are [X]% confident that the true [parameter in context] is between [lower] and [upper]."
2. "Since p-value ([value]) [< or >] α ([value]), we [reject / fail to reject] H₀. There [is / is not] convincing evidence that [Hₐ in context]."
3. "The parameter of interest is p, the true proportion of [population] who [characteristic in context]."
4. "Conditions: (1) Random — the sample was randomly selected; (2) 10% — the sample size of [n] is less than 10% of the population; (3) Large Counts — np̂ = [value] ≥ 10 and n(1−p̂) = [value] ≥ 10."
5. "Type I error: concluding that [Hₐ context] when in fact [H₀ context]. The probability of this error is α = [value]."
6. "Type II error: failing to conclude [Hₐ context] when in fact [Hₐ context]. The probability of this error is β."
7. "Power increases by (1) increasing sample size, (2) increasing the magnitude of the true effect, and (3) increasing the significance level α (though this also increases the probability of a Type I error)."

## If You Do Nothing Else for This Unit

*Master PHANTOMS template cold AND the verbatim conclusion language. The rubric requires specific phrasing — never "accept H₀," always "fail to reject"; never "probability the parameter is in CI," always "we are X% confident the TRUE [parameter] is between..." Conclusions must always be in CONTEXT. These language requirements account for roughly half of the rubric points on every Unit 6+ inference FRQ.*

_lastUpdated: 2026-05-04
_sources: College Board AP Statistics CED 2024-25, Princeton Review AP Statistics 2025, Khan Academy AP Statistics, The Practice of Statistics 6e (Starnes & Tabor)
_difficulty: intermediate
_relatedUnits: ap-statistics-unit-3-collecting-data, ap-statistics-unit-5-sampling-distributions, ap-statistics-unit-7-inference-means, ap-statistics-unit-8-chi-square
