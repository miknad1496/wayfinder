# AP Statistics — Wayfinder Study Guide

> Wayfinder advisory file. Surfaces when user asks about AP Stats prep, the
> STATE-PLAN-DO-CONCLUDE framework, or inference FRQ technique.

## Math of a 5
~75% total. MCQ 30/40 correct + FRQs scored 0-4 each, aim for 3s and 4s on most.

## THE differentiator (5-scorer vs 4-scorer)
**STATE → PLAN → DO → CONCLUDE framework executed IN CONTEXT.** Generic answers earn no points; every parameter, hypothesis, condition, conclusion must reference SPECIFIC people/things in the problem with SPECIFIC measurement and units.

A 4-scorer says "p < 0.05 so we reject H₀." A 5-scorer says "Since the p-value 0.023 < α = 0.05, we have sufficient evidence to reject the null hypothesis. We conclude that the true mean cholesterol level for the population of adults aged 40+ taking medication X is less than 200 mg/dL." Note the unit (mg/dL), the parameter context (cholesterol), the population (adults 40+), the variable (cholesterol level).

Generic = 0-1 points. In-context = 3-4 points.

## The 4-step framework (the entire game)
Use STATE-PLAN-DO-CONCLUDE on every inference FRQ:

**STATE** — define parameter in context, hypotheses, alpha:
- "Let μ represent the true mean [variable] for [specific population in problem]"
- H₀: μ = [value] (or μ_diff = 0)
- H_A: μ ≠ [value] (or appropriate one-sided)
- α = 0.05 (or whatever the problem specifies)

**PLAN** — name the procedure + check ALL conditions explicitly:
- Name: "1-sample t-test for population mean" / "2-proportion z-interval" / etc.
- Conditions (the big 3 always — adapt names to test):
  - **Random** sample (or random assignment for experiments)
  - **10% condition** (n ≤ 10% of population, for sampling from finite population)
  - **Normal/Large condition** (n ≥ 30 OR data approximately normal — show histogram/boxplot if given)
  - For proportions: **Large counts** (np ≥ 10 AND n(1-p) ≥ 10)

**DO** — show formula, substituted values, test stat, p-value/df:
- Write the formula symbolically
- Substitute the values
- Compute test statistic, df (if t-test), p-value
- "t = (x̄ − μ₀) / (s/√n) = (245 − 250) / (12/√36) = −2.5, df = 35, p = 0.017"

**CONCLUDE** — decision + context + name original variable:
- "Since p < α, reject H₀..." OR "Fail to reject H₀..."
- "...we have/don't have sufficient evidence that..."
- Restate the alternative hypothesis IN CONTEXT with the specific variable + population

## Confidence Interval interpretation (gold-standard wording)
**CORRECT:** "We are X% confident that the true [parameter, in context, in units] is between [low value] and [high value]."

**INCORRECT (these lose the interpretation point):**
- "There is a 95% chance the parameter is in this interval" (parameter is fixed, not random)
- "95% of the data falls in this interval" (CI is about the parameter, not the data)
- Generic statement without naming the parameter or population

## P-value interpretation (gold-standard wording)
**CORRECT:** "Assuming H₀ is true, the probability of observing data as extreme or more extreme than what we observed is [p-value]."

**INCORRECT:**
- "Probability that H₀ is true" (this is NOT what p-value means)
- "Probability of making a mistake" (this is alpha, not p)

## Confidence Level interpretation (gold-standard)
**CORRECT:** "If we were to repeat this sampling procedure many times, X% of the resulting confidence intervals would capture the true [parameter]."

## Top traps
1. **Generic conclusion** without naming the variable + population in context (caps at 1-2/4)
2. **CI misinterpretation** — saying "95% chance" instead of "95% confident"
3. **Random sampling vs random assignment** — sampling generalizes to population; assignment establishes causation. Don't conflate.
4. **Pooled vs unpooled SE** — for 2-prop TEST use POOLED SE (combine for null hypothesis); for 2-prop CI use UNPOOLED SE
5. **Forgetting to check conditions** — listing the test name but not verifying conditions caps the PLAN section
6. **Confusing MM with LF** — wait, that's Macro. For Stats: confusing population vs sample notation (μ vs x̄, p vs p̂, σ vs s)

## Exam structure
- Section I: 40 MCQ, 90 minutes, 50% of score
- Section II Part A: 5 short FRQs (4 pts each), 65 minutes
- Section II Part B: 1 long FRQ (investigative), 25 minutes, 50% combined
- Total: 3 hours

## Score distribution
- 5: ~14% / 4: ~22% / 3: ~24% / 2: ~17% / 1: ~24%

## Phrases that score (drop these into FRQs)
- "Assuming H₀ is true, the probability of observing..."
- "We are 95% confident that the true [parameter] for [population] is between [low] and [high]"
- "Since the p-value [number] is less than α = 0.05, we reject H₀"
- "We have sufficient evidence at the 5% level to conclude that..."
- "If we repeated this sampling procedure many times, 95% of the intervals would capture..."

## Wayfinder note
We have a 13-page comprehensive guide targeting a 5. The STATE-PLAN-DO-CONCLUDE framework + IN-CONTEXT phrasing are the entire test. Drill these on 8-10 released FRQs minimum.

_lastUpdated: 2026-05-03_
_sources: AP Study Guide Brain File (Wayfinder internal), College Board AP Statistics CED, released FRQ scoring guidelines_
