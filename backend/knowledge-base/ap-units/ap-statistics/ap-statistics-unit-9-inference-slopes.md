# AP Statistics — Unit 9: Inference for Quantitative Data — Slopes — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 2–5% of the AP Statistics exam (smallest weight, but appears reliably as one FRQ)
- **Sub-topics covered:**
  - 9.1 Introducing Statistics: Do Those Points Align?
  - 9.2 Confidence Intervals for the Slope of a Regression Model
  - 9.3 Justifying a Claim About the Slope of a Regression Model Based on a Confidence Interval
  - 9.4 Setting Up a Test for the Slope of a Regression Model
  - 9.5 Carrying Out a Test for the Slope of a Regression Model
  - 9.6 Skills Focus: Selecting an Appropriate Inference Procedure
- **Where this unit appears on the exam:** Unit 9 typically appears as one full FRQ that combines Unit 2 (regression mechanics) with Unit 6/7 (inference framework). Students must read regression output (computer-generated tables), identify the slope estimate and its standard error, construct a confidence interval, and conduct a hypothesis test. The "LINER" conditions for regression inference are the unique conditions for this unit. The connection between regression slope inference and the regression equation from Unit 2 is critical.

## Big Ideas

1. **Regression slope inference asks: is there a real linear relationship between x and y in the population?** Even if our sample shows a relationship (b ≠ 0), is this a real population effect or just sampling variability?
2. **The slope statistic b has a sampling distribution.** Different samples produce different slopes. The standard error of b (SE_b) quantifies this variability.
3. **The t-distribution applies to slope inference.** With df = n − 2 (we lose 2 degrees of freedom for estimating both intercept and slope).
4. **The LINER conditions are unique to regression inference.** Linear, Independent, Normal residuals, Equal variance, Random.
5. **Computer regression output is the standard format for AP problems.** Students must extract slope estimate, standard error, t-statistic, and p-value from a table.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Regression model in population:**
  - The TRUE regression line: μ_y = α + βx, where α and β are population parameters (intercept and slope).
  - Sample regression line: ŷ = a + bx, where a and b estimate α and β from data.
- **Sampling distribution of slope b:**
  - **Mean:** β (the true population slope). b is an UNBIASED estimator of β.
  - **Standard error:** SE_b = s / (s_x · √(n−1)), where s is the standard deviation of the residuals (sometimes called the "residual standard error" in computer output) and s_x is the SD of x values.
  - **Shape:** approximately Normal (specifically t-distributed with df = n − 2).
- **t-test for slope:**
  - **H₀:** β = 0 (no linear relationship between x and y).
  - **Hₐ:** β ≠ 0 (or β > 0 or β < 0, one-sided).
  - **Test statistic:** t = b / SE_b (with df = n − 2).
  - **p-value:** from t-distribution.
- **Confidence interval for slope:**
  - **Formula:** b ± t* · SE_b, where t* has df = n − 2.
  - **Interpretation:** "We are X% confident that the true slope (β), describing the change in [y in context] for each one-unit increase in [x in context], is between [lower] and [upper]."
- **LINER conditions for regression inference:**
  - **L — Linear:** the relationship between x and y is linear in the population. Check using scatterplot AND residual plot (no clear curvature in residuals).
  - **I — Independent:** observations are independent. Check randomization or 10% condition.
  - **N — Normal:** residuals are approximately Normally distributed. Check histogram or Normal probability plot of residuals.
  - **E — Equal variance:** the spread of residuals is constant across all x values. Check residual plot (no fan shape).
  - **R — Random:** data come from a random sample or randomized experiment.
- **Reading computer regression output (typical format):**
  - **Predictor / Coefficients table:**
    - **(Intercept) Estimate:** value of a (sample intercept).
    - **x Estimate:** value of b (sample slope).
    - **Std. Error:** SE_a, SE_b.
    - **t-value:** t-statistic for testing if each parameter = 0.
    - **Pr(>|t|) or p-value:** for two-sided test of each parameter = 0.
  - **R-squared:** proportion of variation in y explained by linear regression on x.
  - **Residual standard error (s):** standard deviation of residuals.
  - **df:** typically n − 2 for slope inference.

### Adds for [4]

- **Why df = n − 2 for slope inference.** We use 2 degrees of freedom to estimate both intercept and slope from the data. df = n − 2 is the remaining "freedom" for estimating the residual variability.
- **Standard error of slope explained:**
  - SE_b = s / (s_x · √(n−1)).
  - **s** = standard deviation of residuals (typical residual size).
  - **s_x · √(n−1)** = related to spread of x values; larger spread of x reduces SE.
  - Larger n → smaller SE.
  - Larger spread of x values → smaller SE (more "leverage" for estimating slope).
  - Smaller s (better fitting line) → smaller SE.
- **Interpreting the slope test:**
  - If p-value < α: reject H₀: β = 0. There IS a statistically significant linear relationship.
  - If p-value > α: fail to reject H₀. There is NOT convincing evidence of a linear relationship.
- **Connection between CI and HT:**
  - For two-sided test: if 95% CI for β does NOT include 0, reject H₀: β = 0 at α = 0.05.
  - If CI INCLUDES 0, fail to reject.
- **Verifying conditions from given displays:**
  - Scatterplot: check for linearity (no obvious curve).
  - Residual plot: check for randomness (no pattern), constant variance (no fan).
  - Histogram of residuals: check for approximate normality (no strong skew, no outliers).
  - Be explicit about what each plot shows.
- **Using the calculator for regression inference:**
  - **TI calculator:** STAT TESTS — F: LinRegTTest. Need x-list and y-list, plus alternative hypothesis.
  - Output includes t-statistic, p-value, and df.

### Adds for [5]

- **Why we use a t-distribution for slope.** Like all t-procedures, we use t (not z) because we're estimating σ (the SD of residuals) from the data. The added uncertainty is captured by the t-distribution's heavier tails.
- **The "regression to the mean" phenomenon.** When we observe an extreme value of x, our prediction of y is usually less extreme. This isn't measurement error — it's the inherent uncertainty in linear regression. Doesn't directly affect slope inference but is conceptually important.
- **Outliers and influential points in regression inference:**
  - **Outliers in y direction** (large residuals): inflate s, increase SE_b, decrease t-statistic, weaken evidence.
  - **Outliers in x direction** (high leverage): can substantially change b. May make a "real" relationship appear false or vice versa.
  - Regression inference is SENSITIVE to influential points — examine residual plots carefully.
- **Why we test β = 0 specifically.** This is the "no linear relationship" hypothesis — interpretable as "knowing x doesn't help predict y" linearly. Other null values can be tested (e.g., is the slope = 1, suggesting one-to-one relationship?), but β = 0 is the most common.
- **Statistical vs practical significance in regression:**
  - With LARGE n, even a tiny slope can be statistically significant.
  - A statistically significant slope of 0.01 may have no practical importance.
  - Always discuss the magnitude of the slope in CONTEXT.
- **Multiple regression** (beyond AP scope but worth knowing): adding more predictors. The same inference principles apply but extended to multiple slopes (each with its own t-test).
- **Why "no linear relationship" doesn't mean "no relationship."** Two variables can have a strong NON-LINEAR relationship (perfect parabolic, U-shaped) with β = 0. The slope test only addresses LINEAR relationships. A failed slope test doesn't rule out other relationship forms.

## Worked Examples

### Example 1 [3] — Reading regression output and constructing CI

A study of 20 students examines the relationship between hours studied (x) and test score (y). Computer output:

```
Coefficients:
              Estimate  Std. Error  t value  Pr(>|t|)
(Intercept)   55.00     8.50        6.47     1.5e-05
hours_studied 4.20      1.10        3.82     0.0013

Residual standard error: 12.5 on 18 degrees of freedom
Multiple R-squared: 0.448
```

(a) Write the regression equation.
(b) Construct a 95% CI for the true slope.
(c) Interpret the slope and its CI in context.

- **(a)** ŷ = 55.00 + 4.20x, where x = hours studied and ŷ = predicted test score.
- **(b)** SE_b = 1.10. df = n − 2 = 18. t* (95%, 18 df) = 2.101. CI: 4.20 ± 2.101(1.10) = 4.20 ± 2.31 = (1.89, 6.51).
- **(c)** Slope: "For every additional hour studied, the predicted test score increases by 4.20 points."
- CI: "We are 95% confident that the true slope — the average increase in test score for each additional hour studied — is between 1.89 and 6.51 points per hour."

### Example 2 [3][4] — Hypothesis test for slope (PHANTOMS)

Using the same data from Example 1, test at α = 0.05 whether there is a significant linear relationship between hours studied and test score.

- **P:** β = the true slope of the linear regression of test score on hours studied.
- **H:** H₀: β = 0; Hₐ: β ≠ 0 (two-sided).
- **A (LINER):**
  - **L (Linear):** check scatterplot — assume approximately linear.
  - **I (Independent):** observations independent (assumed by random sampling).
  - **N (Normal residuals):** check histogram of residuals — assume approximately Normal.
  - **E (Equal variance):** check residual plot — assume constant variance.
  - **R (Random):** assume random sample.
- **N (Name):** t-test for the slope of a regression model.
- **T:** From output: t = 3.82; df = 18; p-value = 0.0013 (two-sided).
- **O:** Since p-value (0.0013) < α (0.05), reject H₀.
- **M:** Reject H₀.
- **S:** "Because the p-value of 0.0013 is much less than 0.05, we reject the null hypothesis. There is convincing evidence of a linear relationship between hours studied and test score in the population."

### Example 3 [4] — Using CI to evaluate claim

Suppose the CI from Example 1 is (1.89, 6.51). Does the data support the claim that one additional hour of study increases test scores by exactly 5 points?

- The interval (1.89, 6.51) DOES include 5.
- Therefore, we can NOT reject the hypothesis that β = 5 at the 95% level.
- The data is CONSISTENT with the claim that an additional hour of study increases scores by 5 points (the CI includes 5), but the data is also consistent with other slopes from 1.89 to 6.51.

### Example 4 [4] — When conditions fail

Suppose the residual plot for a regression shows a clear FAN SHAPE (residuals' spread increases with x). What does this mean?

- The "Equal variance" (E) condition of LINER is VIOLATED.
- The standard error formulas assume constant variance; with non-constant variance, they're inaccurate.
- The slope estimate b is still UNBIASED, but inferences (CI and HT) are unreliable.
- Possible remedies: transform y (e.g., log transformation), use weighted regression, use robust standard errors.
- For AP: identify the violation, note that inference is unreliable, recommend caution in interpretation.

### Example 5 [5] — Statistical vs practical significance

A study of 5,000 students finds the slope of test score on hours of homework is b = 0.05, with t = 4.5, p-value < 0.001.

- **Statistical analysis:** highly significant (p << 0.05).
- **Practical analysis:** the slope is 0.05 — meaning each additional hour of homework predicts an INCREASE of just 0.05 points in test score. Even with hours of additional homework, the impact on test scores is tiny.
- **Conclusion:** statistically significant but practically negligible. The relationship exists in the population but is too small to matter for educational practice.
- **Lesson:** always discuss the SIZE of the slope in context, not just whether it's significant.

## Top Traps & Common Errors

1. **Forgetting df = n − 2.** Slope inference uses df = n − 2 (not n − 1).
2. **Using the wrong SE.** SE_b is the standard error of the slope, not the residual standard error (s) or the SD of x.
3. **Conflating regression line and inferential test.** Regression equation gives the SAMPLE estimate; inference asks if there's a real population effect.
4. **Skipping LINER conditions.** All five conditions should be addressed.
5. **Treating "no significant slope" as "no relationship."** Two variables may have a NON-LINEAR relationship that the slope test doesn't capture.
6. **Wrong interpretation of slope.** "Slope is 4.20" — context-free. Should be: "For each additional hour of [x in context], predicted [y in context] increases by 4.20 [units]."
7. **Confusing "true slope = 0" with "no relationship at all."** β = 0 means no LINEAR relationship; doesn't preclude curved relationships.
8. **CI interpretation missing "true slope."** Always: "We are X% confident that the TRUE slope is between..."
9. **Wrong direction of one-sided test.** If alternative is β > 0, p-value is one-sided positive direction.
10. **Reading wrong row from regression output.** "Estimate" row gives intercept and slope; SE row gives standard errors.
11. **Forgetting to verify Normal condition for small samples.** With small n, examine residual histogram or Normal probability plot.
12. **Treating high R² as proof of linearity.** Anscombe's quartet shows datasets with same R² but very different scatterplot shapes. Always check residual plot.
13. **Conclusion not in CONTEXT.** Always reference variables, populations, units, and meaning.
14. **"Accept H₀."** Always "fail to reject H₀."
15. **Statistical vs practical significance.** A small slope can be statistically significant with large n but practically meaningless.

## Rubric-Aware Tactics

**For interpreting computer regression output:**
- Identify the intercept (a), slope (b), their SEs, t-values, and p-values.
- Note df, residual SE, R².
- Use these values directly for CI and HT.

**For confidence intervals:**
- CI = b ± t* · SE_b with df = n − 2.
- Interpret as "we are X% confident that the TRUE slope is between..."
- Include "for each one-unit increase in x in context, predicted y in context changes by..."

**For hypothesis tests:**
- Use PHANTOMS template.
- Define β as the TRUE population slope.
- Verify LINER conditions explicitly.
- Use df = n − 2.
- State decision and conclusion in CONTEXT.

**For verifying conditions from displays:**
- L: scatterplot for linearity, residual plot for no curvature.
- I: random sampling or experimental design.
- N: histogram or Normal probability plot of residuals.
- E: residual plot for constant spread (no fan shape).
- R: random sampling.

**For practical interpretation:**
- Discuss the magnitude of the slope (not just the p-value).
- Note units.
- Distinguish statistical significance from practical importance.

## "Phrases That Score" — verbatim language for FRQs

1. "The true slope β represents the average change in [y in context] for each one-unit increase in [x in context]."
2. "Conditions (LINER): Linear — the scatterplot and residual plot show no obvious curvature; Independent — observations are independent (random sample); Normal — the histogram of residuals shows approximately Normal shape with no strong skew; Equal variance — the residual plot shows constant spread (no fan shape); Random — data come from a random sample."
3. "Using df = n − 2 = [df], the test statistic is t = b / SE_b = [calculation]. The p-value is approximately [value]."
4. "We are [X]% confident that the true slope of the regression of [y in context] on [x in context] is between [lower] and [upper]. This means the average change in [y] for each one-unit increase in [x] is between [lower] and [upper] [units]."
5. "Since p-value ([value]) [< or >] α ([value]), we [reject / fail to reject] H₀: β = 0. There [is / is not] convincing evidence of a linear relationship between [x in context] and [y in context]."
6. "Although the slope is statistically significant (p = [value]), the magnitude of [b] [unit per unit] is [practically large/small/negligible], suggesting [practical interpretation]."
7. "The 95% confidence interval for the slope does not include 0, providing strong evidence that [x] and [y] are linearly associated in the population."

## If You Do Nothing Else for This Unit

*Master three things: (1) reading computer regression output to extract b, SE_b, t, and p-value; (2) using df = n − 2 for slope inference; (3) verifying LINER conditions (Linear, Independent, Normal residuals, Equal variance, Random). The slope inference framework is exactly PHANTOMS from Units 6–7 applied to regression coefficients with df = n − 2.*

_lastUpdated: 2026-05-04
_sources: College Board AP Statistics CED 2024-25, Princeton Review AP Statistics 2025, Khan Academy AP Statistics, The Practice of Statistics 6e (Starnes & Tabor)
_difficulty: intermediate
_relatedUnits: ap-statistics-unit-2-two-variable-data, ap-statistics-unit-6-inference-proportions, ap-statistics-unit-7-inference-means
