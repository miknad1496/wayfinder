# AP Statistics — Unit 2: Exploring Two-Variable Data — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 5–7% of the AP Statistics exam
- **Sub-topics covered:**
  - 2.1 Introducing Statistics: Are Variables Related?
  - 2.2 Representing Two Categorical Variables
  - 2.3 Statistics for Two Categorical Variables
  - 2.4 Representing the Relationship Between Two Quantitative Variables (scatterplots)
  - 2.5 Correlation
  - 2.6 Linear Regression Models
  - 2.7 Residuals
  - 2.8 Least Squares Regression
  - 2.9 Analyzing Departures from Linearity
- **Where this period appears on the exam:** Scatterplot interpretation and linear regression analysis are guaranteed FRQ topics. Correlation interpretation is among the most-tested and most-misunderstood concepts. Residual plot analysis (deciding whether linear model is appropriate) appears in nearly every exam. Two-way tables for categorical variables are common MCQ targets. The "correlation does not imply causation" framing recurs constantly. Unit 2's regression foundations get reactivated in Unit 9 (inference for slopes).

## Big Ideas

1. **Two-variable data analysis identifies relationships between variables.** Scatterplots, correlation, and regression for quantitative pairs; two-way tables for categorical pairs.
2. **Correlation measures the STRENGTH and DIRECTION of LINEAR relationships only.** It doesn't measure non-linear relationships, doesn't imply causation, and is heavily influenced by outliers.
3. **Linear regression provides a model for predicting one variable from another.** The least-squares regression line minimizes the sum of squared residuals. It can be used for prediction within the data range (interpolation), but extrapolation outside the range is unreliable.
4. **Residuals diagnose model fit.** A "good" linear model has residuals that are randomly scattered around zero with no pattern. Patterns in residuals (curves, fans) indicate the linear model is inappropriate.
5. **Correlation does NOT imply causation.** This is the single most-violated principle in popular use of statistics. AP rubrics reliably test this distinction.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Two categorical variables — two-way tables:**
  - **Joint frequency** = count in a single cell (e.g., students who like math AND are seniors).
  - **Marginal frequency** = total in a row or column (the "margins" of the table).
  - **Conditional frequency** = frequency within a row or column (e.g., proportion of seniors who like math).
  - **Marginal distributions** describe one variable's distribution overall.
  - **Conditional distributions** describe one variable's distribution within a category of the other.
- **Two-variable categorical displays:**
  - **Side-by-side bar graph** — bars for each category of one variable, grouped by category of the other.
  - **Segmented (stacked) bar graph** — single bar per category of one variable, segmented by the other.
  - **Mosaic plot** — visual proportions for combinations.
- **Comparing categorical variables:** look at conditional distributions to see if they differ across groups. If conditional distributions are the same across groups, the variables are NOT associated. If they differ, the variables ARE associated.
- **Two quantitative variables — scatterplots:**
  - X-axis = explanatory (independent) variable.
  - Y-axis = response (dependent) variable.
  - Each dot represents one observation.
- **Describing scatterplots — DUFS in CONTEXT:**
  - **D — Direction:** positive (slopes up), negative (slopes down).
  - **U — Unusual features:** outliers, clusters, gaps, influential points.
  - **F — Form:** linear, curved, no apparent pattern.
  - **S — Strength:** weak, moderate, strong (how tightly clustered around the pattern).
  - Always in CONTEXT of the variables.
- **Correlation coefficient (r):**
  - Measures STRENGTH and DIRECTION of LINEAR relationship.
  - Range: −1 ≤ r ≤ 1.
  - r = 1: perfect positive linear; r = −1: perfect negative linear; r = 0: no linear relationship.
  - r does NOT change with linear transformations (units, scaling).
  - r does NOT distinguish explanatory from response (symmetric in x and y).
- **Coefficient of determination (R²):**
  - R² = the square of r (always between 0 and 1, expressed as decimal or percentage).
  - Interprets as "the proportion of variation in [response variable] explained by the linear regression of [response] on [explanatory]."
  - R² = 0.81 means 81% of the variation in y is explained by the linear relationship with x.
- **Linear regression equation:**
  - ŷ = a + bx (or ŷ = b₀ + b₁x), where ŷ ("y-hat") is the predicted value.
  - **a (or b₀)** = y-intercept = predicted y when x = 0.
  - **b (or b₁)** = slope = predicted change in y for a 1-unit increase in x.
- **Least-squares regression:**
  - Finds the line that MINIMIZES the SUM of SQUARED RESIDUALS (vertical distances from points to line).
  - Slope: b = r × (sy / sx), where r is correlation, sx and sy are standard deviations of x and y.
  - The line ALWAYS passes through (x̄, ȳ).
- **Residuals:**
  - Residual = actual y − predicted ŷ.
  - Positive residual: actual is above predicted.
  - Negative residual: actual is below predicted.
  - Sum of residuals from least-squares line = 0.
- **Residual plot:**
  - Plot residuals vs x.
  - **Random scatter around 0** = linear model is appropriate.
  - **Pattern (curve, fan, U-shape)** = linear model is NOT appropriate.

### Adds for [4]

- **Interpreting the slope IN CONTEXT.** Don't just say "slope is 2." Say: "For every additional [unit of x], the predicted [y in context] increases by 2 [units of y]."
- **Interpreting the y-intercept in context.** Often only meaningful if x = 0 makes sense in context. Otherwise, note that it's the predicted value when x = 0 but caution about extrapolation.
- **Interpreting r²:** "Approximately [r² × 100]% of the variation in [y in context] can be explained by the linear regression of [y] on [x in context]."
- **Interpreting r:** "There is a [strong/moderate/weak] [positive/negative] linear association between [x] and [y in context]."
- **Effect of outliers and influential points on regression:**
  - **Outliers in y direction** (high residuals) — increase scatter, slightly decrease r².
  - **Influential points** (high in x direction) — pull regression line toward them. Removing them can dramatically change slope and intercept.
- **Extrapolation:** using the regression line to predict outside the data range. Risky because the relationship may not extend. AP penalizes extrapolation.
- **Interpolation:** using the regression line within the data range. Generally appropriate.
- **Standard deviation of residuals (s):**
  - s = √(Σ(residuals²) / (n−2))
  - Interpretation: typical distance between actual and predicted values.
- **Lurking variables (confounding):** a variable not in the analysis that influences both x and y, creating apparent association without direct causation.
- **The correlation-causation distinction:**
  - High correlation = there's a relationship.
  - Causation = changes in x DIRECTLY cause changes in y.
  - Establishing causation requires either:
    - A randomized experiment.
    - A theoretical mechanism PLUS strong observational evidence.
- **Regression assumptions** (more relevant in Unit 9 for inference):
  - Linearity (relationship is actually linear).
  - Constant variance (residuals' spread is the same across x values).
  - Independence (observations don't influence each other).
  - Normality of residuals (less critical for fitting; more important for inference).
- **Coefficient interpretation in computer output:**
  - **Coefficient (Estimate)** column gives slope and intercept values.
  - **SE (Standard Error)** column gives standard error of each estimate.
  - **t-value and p-value** test if slope is significantly different from 0.
  - **R-squared** appears in summary statistics.

### Adds for [5]

- **Why r is unitless.** Standardizing both x and y (z-scores) before computing the average product results in a number not tied to the units of either variable. This makes r comparable across different datasets.
- **Why r doesn't depend on which is x or y.** The formula for r is symmetric in x and y. Switching x and y gives the same r. But the regression equations DIFFER depending on whether you regress y on x or x on y — they minimize different residuals (vertical for y on x; horizontal for x on y).
- **Why R² has the "explained variation" interpretation.** R² = 1 − (SSE / SST), where SSE is the sum of squared errors (residuals) and SST is the total sum of squares ((y − ȳ)²). So R² = (SST − SSE) / SST = the proportion of total variability that the regression model accounts for.
- **High r doesn't mean a linear model is appropriate.** Anscombe's quartet (famous teaching example) shows four datasets with same r, same regression line, same R², but very different scatterplot shapes — only one is well-modeled by linear regression. Always check residual plots, even when r is high.
- **Influential points vs outliers in regression:**
  - **High-leverage point:** observation with extreme x-value. Has potential to influence regression line.
  - **Influential point:** observation whose removal substantially changes regression line.
  - All influential points have high leverage; not all high-leverage points are influential.
  - Outliers in y direction (high residual) at typical x values affect SE more than slope.
- **Why log transformations help.** When relationships are exponential or power-law, log-transforming one or both variables can linearize them. log(y) = a + bx → y = e^a × e^(bx), an exponential model. log(y) = a + b×log(x) → y = e^a × x^b, a power model.
- **Confounding examples that frequently appear:**
  - Ice cream sales correlate with drowning deaths — both are caused by warm weather.
  - Shoe size correlates with reading ability in children — both are caused by age.
  - Number of firefighters at a fire correlates with property damage — both are caused by fire size.
- **The "ecological fallacy."** Aggregated (group-level) data often shows different correlations than individual-level data. A correlation between average state income and average voting behavior doesn't tell you about individual people.

## Worked Examples

### Example 1 [3] — Describing a scatterplot (DUFS)

A scatterplot shows a relationship between hours studied (x) and test score (y) for 25 students. The points generally trend upward; one student scored very low despite studying many hours.

- **D — Direction:** positive (more study = higher score).
- **U — Unusual:** one outlier (student with high study hours but low score).
- **F — Form:** approximately linear.
- **S — Strength:** moderate.
- **In context:** "There is a moderate positive linear association between hours studied and test score, with one possible outlier (a student who studied many hours but scored low)."

### Example 2 [3][4] — Slope, intercept, and r² interpretation

The least-squares regression for predicting test score (y) from hours studied (x) is: ŷ = 50 + 5x, with r² = 0.72.

- **Slope:** for every additional hour studied, the predicted test score increases by 5 points.
- **Intercept:** a student who studies 0 hours is predicted to score 50 points (the y-intercept). This may not be meaningful in context (no one studies 0 hours).
- **r²:** approximately 72% of the variation in test scores is explained by the linear regression on hours studied.
- **r:** since slope is positive, r = +√0.72 ≈ +0.85. Strong positive linear association.

### Example 3 [3][4] — Residual computation and analysis

Using the regression ŷ = 50 + 5x, find the residual for a student who studied 8 hours and scored 95.

- **Step 1.** Predicted ŷ = 50 + 5(8) = 90.
- **Step 2.** Residual = actual − predicted = 95 − 90 = 5.
- **Step 3.** Interpretation: this student scored 5 points HIGHER than predicted by the regression line.

### Example 4 [4] — Two-way table conditional distributions

A survey of 200 students asked about handedness (right/left) and athletic preference (team sport/individual sport):

| | Team | Individual | Total |
|--|------|------------|-------|
| Right-handed | 110 | 70 | 180 |
| Left-handed | 8 | 12 | 20 |
| Total | 118 | 82 | 200 |

Find the conditional distribution of athletic preference given handedness, and determine if there's an association.

- **Right-handed conditional distribution:** Team = 110/180 = 61.1%; Individual = 70/180 = 38.9%.
- **Left-handed conditional distribution:** Team = 8/20 = 40.0%; Individual = 12/20 = 60.0%.
- **Conclusion:** the conditional distributions DIFFER (61.1% vs 40.0% for team sports), suggesting an association between handedness and athletic preference. Right-handed students are MORE likely to prefer team sports than left-handed students.
- **AP-style answer:** "There appears to be an association between handedness and athletic preference. Among right-handed students, 61.1% prefer team sports, compared to only 40.0% of left-handed students. The conditional distributions are not the same, suggesting handedness and athletic preference are related in this sample."

### Example 5 [4] — Recognizing inappropriate linear model from residual plot

A scatterplot of fertilizer applied (x) vs crop yield (y) appears moderately linear. But the residual plot shows a clear curved (parabolic) pattern.

- **Conclusion:** the linear model is NOT appropriate, even though the original scatterplot looked roughly linear.
- **Why:** the curved pattern in residuals indicates that yield first increases with fertilizer, then decreases (reaching a maximum and then declining). A quadratic model or log transformation might be more appropriate.
- **AP-style answer:** "The residual plot shows a clear curved pattern (with positive residuals at low and high fertilizer levels and negative residuals at moderate levels), indicating that the linear model does not adequately fit the relationship between fertilizer applied and crop yield. A non-linear model (such as quadratic) would likely fit better."

## Top Traps & Common Errors

1. **Confusing correlation with causation.** "There is a strong correlation between X and Y" does NOT mean X causes Y. AP penalizes causation claims from observational data.
2. **Saying "high r means good linear fit."** Always check residual plot. High r with curved residuals = inappropriate linear model.
3. **Interpreting slope without context.** Don't just say "slope is 5." Say "for every additional unit of x in context, predicted y increases by 5 units."
4. **Interpreting r² as a percentage of variation in everything.** R² is the proportion of variation in Y EXPLAINED BY the regression on X — specifically tied to that explanatory variable.
5. **Extrapolating beyond the data range.** Don't predict y values for x values outside the range of observed data.
6. **Using regression to predict the response from any value.** Predictions are only valid within the data range.
7. **Forgetting that r doesn't measure non-linear relationships.** A perfect quadratic relationship has r = 0.
8. **Computing r incorrectly when x and y units differ.** r is unitless; you don't need to worry about unit consistency.
9. **Conflating influential points with outliers.** Influential points have high LEVERAGE (extreme x). Outliers have large RESIDUALS (extreme y given x).
10. **Comparing conditional distributions incorrectly.** When checking association between categorical variables, compare conditional distributions (within rows or columns), not joint or marginal frequencies.
11. **Confusing y-intercept interpretation in extrapolation context.** When x = 0 isn't meaningful (e.g., predicting weight from height where height = 0 is impossible), the y-intercept is mathematically the line's intercept but may not have practical interpretation.
12. **Using the wrong residual formula.** Residual = ACTUAL − PREDICTED. NOT predicted − actual.
13. **Forgetting that least-squares minimizes SQUARED residuals.** Other regression methods minimize different objectives.
14. **Treating r and r² as interchangeable.** They're related (r² = r squared) but interpretations differ.
15. **Assuming linear regression assumes Normal y values.** It doesn't (for fitting). Inference about regression (Unit 9) does require approximate Normality of residuals.

## Rubric-Aware Tactics

**For describing scatterplots (DUFS):**
- Direction, Unusual, Form, Strength.
- Always in CONTEXT.

**For interpreting slope:**
- "For every additional [x in context, with units], predicted [y in context] [increases/decreases] by [slope] [y units]."

**For interpreting y-intercept:**
- "When [x in context] is 0, predicted [y in context] is [intercept] [y units]."
- Note if extrapolation makes the interpretation meaningless.

**For interpreting r²:**
- "Approximately [r² × 100]% of the variation in [y in context] can be explained by the linear regression of [y] on [x in context]."

**For interpreting r:**
- "There is a [strong/moderate/weak] [positive/negative] linear association between [x] and [y in context]."

**For two-way table analysis:**
- Compute and compare CONDITIONAL distributions.
- State whether they suggest association or independence.

**For evaluating linear model appropriateness:**
- Examine residual plot for randomness or pattern.
- If random scatter around 0: linear is appropriate.
- If curved/fan-shaped pattern: linear is NOT appropriate.

**For correlation-causation discussions:**
- Acknowledge correlation does NOT imply causation.
- Identify possible lurking variables when relevant.
- Note that only randomized experiments can establish causation.

## "Phrases That Score" — verbatim language for FRQs

1. "There is a [strong/moderate/weak] [positive/negative] linear association between [x in context] and [y in context]."
2. "The residual plot shows [random scatter around 0 / a clear pattern], suggesting that the linear model is [appropriate / inappropriate] for this relationship."
3. "For every additional [unit of x in context], the predicted [y in context] [increases/decreases] by [slope] [units of y]."
4. "Approximately [r² × 100]% of the variation in [y in context] can be explained by the linear regression of [y] on [x in context]."
5. "Although there is a strong correlation between X and Y, this does NOT imply that X causes Y. There may be a lurking variable that influences both, such as [example]."
6. "Predicting [y in context] for [x value outside data range] would be extrapolation, which is unreliable because the linear relationship may not hold outside the observed range."
7. "The conditional distributions of [variable A] differ across categories of [variable B], suggesting an association between the two variables."

## If You Do Nothing Else for This Unit

*Master four anchor concepts: (1) DUFS for scatterplot description (Direction, Unusual, Form, Strength), always in context; (2) interpretation of slope, intercept, r, and r² IN CONTEXT — every coefficient must be tied to the specific variables; (3) residual plot analysis as the test for whether linear model is appropriate (random scatter = appropriate; pattern = inappropriate); (4) the correlation-causation distinction. These four concepts are tested in nearly every Unit 2 question on the AP exam.*

_lastUpdated: 2026-05-04
_sources: College Board AP Statistics CED 2024-25, Princeton Review AP Statistics 2025, Khan Academy AP Statistics, The Practice of Statistics 6e (Starnes & Tabor)
_difficulty: foundational
_relatedUnits: ap-statistics-unit-1-one-variable-data, ap-statistics-unit-9-inference-slopes
