# AP Calculus BC — Unit 6: Integration and Accumulation of Change — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 17–20% of the AP Calculus BC exam — one of the heaviest units
- **Sub-topics covered:**
  - 6.1 Exploring Accumulations of Change
  - 6.2 Approximating Areas with Riemann Sums
  - 6.3 Riemann Sums, Summation Notation, and Definite Integral Notation
  - 6.4 The Fundamental Theorem of Calculus and Accumulation Functions
  - 6.5 Interpreting the Behavior of Accumulation Functions
  - 6.6 Applying Properties of Definite Integrals
  - 6.7 The Fundamental Theorem of Calculus and Definite Integrals
  - 6.8 Finding Antiderivatives and Indefinite Integrals
  - 6.9 Integrating Using Substitution
  - 6.10 Integrating Functions Using Long Division and Completing the Square
  - 6.11 Using Integration by Parts
  - 6.12 Using Linear Partial Fractions
  - 6.13 Evaluating Improper Integrals
  - 6.14 Selecting Techniques for Antidifferentiation
- **Where this unit appears on the exam:** Unit 6 is one of the heaviest. The Fundamental Theorem of Calculus (parts 1 and 2) is the central result and one of the 5 master theorems. Riemann sums, accumulation functions, and various integration techniques (substitution, integration by parts, partial fractions) all appear regularly. Improper integrals are a BC-specific topic.

## Big Ideas

1. **Integration is the inverse of differentiation.** The Fundamental Theorem of Calculus formalizes this: if F(x) = ∫f(x)dx, then F'(x) = f(x).
2. **Definite integrals represent accumulated change or area.** ∫(a to b) f(x)dx = F(b) - F(a), where F is an antiderivative of f.
3. **Riemann sums approximate definite integrals.** Various forms (left, right, midpoint, trapezoidal) converge to the actual integral as the partition becomes finer.
4. **The 5 master theorems include both FTC1 and FTC2.** FTC1: derivative of accumulation function. FTC2: definite integral via antiderivative.
5. **Several integration techniques work for different function types.** Substitution (Chain Rule reverse), integration by parts (Product Rule reverse), partial fractions (rational functions), trig substitution.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Indefinite integral (antiderivative):** if F'(x) = f(x), then ∫f(x)dx = F(x) + C.
  - C is the constant of integration (since derivatives of constants are 0).
- **Common antiderivatives:**
  - ∫x^n dx = x^(n+1)/(n+1) + C, for n ≠ -1.
  - ∫(1/x) dx = ln|x| + C.
  - ∫e^x dx = e^x + C.
  - ∫sin(x) dx = -cos(x) + C.
  - ∫cos(x) dx = sin(x) + C.
  - ∫sec²(x) dx = tan(x) + C.
  - ∫sec(x)·tan(x) dx = sec(x) + C.
  - ∫1/(1+x²) dx = arctan(x) + C.
  - ∫1/√(1-x²) dx = arcsin(x) + C.
- **Definite integral:** ∫(a to b) f(x)dx represents accumulated change, area under curve (when f > 0), or net displacement (when f represents velocity).
- **Definite integral properties:**
  - ∫(a to a) f(x)dx = 0.
  - ∫(a to b) f(x)dx = -∫(b to a) f(x)dx.
  - ∫(a to b) [f(x) + g(x)]dx = ∫(a to b) f(x)dx + ∫(a to b) g(x)dx.
  - ∫(a to b) c·f(x)dx = c·∫(a to b) f(x)dx.
  - ∫(a to c) f(x)dx + ∫(c to b) f(x)dx = ∫(a to b) f(x)dx.
- **Riemann sums** (approximate definite integrals):
  - **Left Riemann Sum:** sum of areas of rectangles with heights at LEFT endpoints. Underestimates if f is increasing.
  - **Right Riemann Sum:** heights at RIGHT endpoints. Overestimates if f is increasing.
  - **Midpoint Riemann Sum:** heights at MIDPOINTS of subintervals. Generally more accurate.
  - **Trapezoidal Sum:** averages left and right (uses trapezoids). Generally more accurate than left or right alone.
  - As number of subintervals → ∞, all Riemann sums → exact integral.
- **Fundamental Theorem of Calculus, Part 1 (FTC1)** [ONE OF THE 5 MASTER THEOREMS]:
  - **Statement:** if F(x) = ∫(a to x) f(t)dt, then F'(x) = f(x).
  - **Interpretation:** the derivative of the accumulation function gives back the original function.
- **Fundamental Theorem of Calculus, Part 2 (FTC2)** [ANOTHER OF THE 5 MASTER THEOREMS]:
  - **Statement:** if F is an antiderivative of f, then ∫(a to b) f(x)dx = F(b) - F(a).
  - **Interpretation:** to compute a definite integral, find an antiderivative and evaluate at endpoints.
- **Accumulation function:** F(x) = ∫(a to x) f(t)dt represents the accumulated total of f from a to x.
  - F'(x) = f(x) (FTC1).
  - F is increasing where f > 0; decreasing where f < 0.
- **Substitution method** (reverse Chain Rule):
  - Let u = inner function, du = u' dx.
  - Substitute to simplify integral.
  - Integrate in terms of u.
  - Substitute back to original variable.
- **Integration by Parts** (reverse Product Rule):
  - Formula: ∫u dv = uv - ∫v du.
  - **LIATE rule for choosing u:** Logarithm > Inverse trig > Algebraic > Trig > Exponential.

### Adds for [4]

- **Why FTC matters fundamentally.** It connects two seemingly separate concepts:
  - Differentiation (rate of change at a point).
  - Integration (accumulated change over an interval).
  - The two are INVERSE operations. This is the central insight of calculus.
- **Choosing Riemann sum type:**
  - **Left/Right:** simpler but potentially less accurate.
  - **Midpoint:** generally more accurate.
  - **Trapezoidal:** averages left and right; better than either alone.
  - **Simpson's Rule** (advanced): even more accurate using parabolic approximation.
- **Substitution worked through:**
  - ∫2x · sin(x²) dx.
  - Let u = x². Then du = 2x dx.
  - Substitute: ∫sin(u) du = -cos(u) + C.
  - Replace u: -cos(x²) + C.
- **Integration by parts worked through:**
  - ∫x · e^x dx.
  - Let u = x, dv = e^x dx.
  - Then du = dx, v = e^x.
  - ∫u dv = uv - ∫v du = x·e^x - ∫e^x dx = x·e^x - e^x + C = e^x(x - 1) + C.
- **Partial fractions for rational functions:**
  - For ∫(2x + 3)/((x-1)(x-2)) dx, decompose:
  - (2x + 3)/((x-1)(x-2)) = A/(x-1) + B/(x-2) for some constants A, B.
  - Solve for A and B by clearing denominators.
  - Integrate each term separately (often gives ln |x - constant|).
- **Improper integrals** (BC-specific):
  - **Type 1 (infinite limits):** ∫(a to ∞) f(x)dx = lim(b→∞) ∫(a to b) f(x)dx.
  - **Type 2 (unbounded integrand):** when f has vertical asymptote in interval.
  - Either CONVERGES (limit exists) or DIVERGES (limit is infinite or doesn't exist).
- **Long division for rational functions:** if degree of numerator ≥ degree of denominator, divide first to get a polynomial plus a proper rational expression. Then integrate.
- **Completing the square** for integrals like ∫1/(x² - 4x + 13) dx:
  - x² - 4x + 13 = (x - 2)² + 9.
  - Substitute u = x - 2.
  - Get ∫1/(u² + 9) du = (1/3)·arctan(u/3) + C.

### Adds for [5]

- **Why integration is harder than differentiation.** Differentiation is a procedure — apply rules to get an answer. Integration is more ART than procedure — choosing technique requires recognition. Many functions don't have elementary antiderivatives.
- **Why the FTC's two parts work together:**
  - **FTC1** says the accumulation function's derivative is the original function.
  - **FTC2** uses antiderivatives to compute definite integrals.
  - **Both rely on the same underlying connection:** integration and differentiation are inverse processes.
- **The "constant of integration" matters because antiderivatives aren't unique.** Any constant can be added without changing the derivative (since d/dx(c) = 0). Hence ∫f(x)dx = F(x) + C.
- **Integration by Parts derivation.** From the Product Rule: d/dx(uv) = u'v + uv'. Integrating: uv = ∫u'v dx + ∫uv' dx. Rearranging: ∫uv' dx = uv - ∫u'v dx, which is the integration by parts formula.
- **Why LIATE for integration by parts.** The order Log > Inverse trig > Algebraic > Trig > Exponential reflects how often each function "simplifies" under differentiation. Choose u as the function listed first; the integration generally simplifies.
- **Improper integrals as limits.** ∫(a to ∞) f(x)dx is defined as lim(b→∞) ∫(a to b) f(x)dx. The integral CONVERGES if the limit exists; DIVERGES otherwise. Common test cases:
  - ∫(1 to ∞) 1/x dx = lim(b→∞) ln(b) = ∞. DIVERGES.
  - ∫(1 to ∞) 1/x² dx = lim(b→∞) [-1/x](1 to b) = lim(b→∞) (1 - 1/b) = 1. CONVERGES to 1.
- **Average value of a function.** Over [a, b], average value = (1/(b-a)) · ∫(a to b) f(x)dx. This is the definite integral divided by the interval length — the "constant" function with the same total accumulation.
- **The accumulation function vs the antiderivative.** F(x) = ∫(a to x) f(t)dt is the accumulation function. Any antiderivative F(x) + C also has F'(x) = f(x). The FTC2 says ∫(a to b) f(x)dx = F(b) - F(a), and the constant C cancels in the subtraction.

## Worked Examples

### Example 1 [3] — Basic indefinite integral

Compute ∫(3x² - 5x + 7)dx.

- **Step 1.** Integrate term by term:
  - ∫3x² dx = 3 · x³/3 = x³.
  - ∫-5x dx = -5 · x²/2 = -5x²/2.
  - ∫7 dx = 7x.
- **Step 2.** Add constant of integration: x³ - 5x²/2 + 7x + C.

### Example 2 [3] — Using FTC2

Compute ∫(0 to 2) (x² + 1)dx.

- **Step 1.** Find antiderivative: F(x) = x³/3 + x.
- **Step 2.** Apply FTC2: F(2) - F(0) = (8/3 + 2) - (0 + 0) = 8/3 + 2 = 14/3.

### Example 3 [3] — Substitution

Compute ∫2x · √(x² + 1) dx.

- **Step 1.** Let u = x² + 1. Then du = 2x dx.
- **Step 2.** Substitute: ∫√u du = u^(3/2)/(3/2) = (2/3)u^(3/2).
- **Step 3.** Substitute back: (2/3)(x² + 1)^(3/2) + C.

### Example 4 [4] — Integration by parts

Compute ∫x · cos(x) dx.

- **Step 1.** Let u = x, dv = cos(x) dx.
- **Step 2.** Then du = dx, v = sin(x).
- **Step 3.** Apply formula: ∫u dv = uv - ∫v du = x·sin(x) - ∫sin(x) dx.
- **Step 4.** Compute remaining integral: ∫sin(x) dx = -cos(x).
- **Step 5.** Combine: x·sin(x) - (-cos(x)) + C = x·sin(x) + cos(x) + C.

### Example 5 [4][5] — Improper integral

Compute ∫(1 to ∞) 1/x³ dx.

- **Step 1.** Set up as limit: ∫(1 to ∞) 1/x³ dx = lim(b→∞) ∫(1 to b) 1/x³ dx.
- **Step 2.** Find antiderivative: F(x) = x^(-2)/(-2) = -1/(2x²).
- **Step 3.** Evaluate: F(b) - F(1) = -1/(2b²) - (-1/2) = 1/2 - 1/(2b²).
- **Step 4.** Take limit: lim(b→∞) [1/2 - 1/(2b²)] = 1/2 - 0 = 1/2.
- **Result:** ∫(1 to ∞) 1/x³ dx = 1/2. CONVERGES.

## Top Traps & Common Errors

1. **Forgetting "+ C" in indefinite integrals.** Antiderivatives are unique only up to a constant.
2. **Wrong power rule integration.** ∫x^n dx = x^(n+1)/(n+1), NOT n·x^(n-1).
3. **Forgetting that ∫(1/x)dx = ln|x| + C.** The absolute value matters because ln of negative numbers is undefined.
4. **Misapplying integration by parts.** The formula is ∫u dv = uv - ∫v du.
5. **Wrong substitution.** Choose u so that du appears (or can be made to appear) in the integral.
6. **Forgetting to substitute BACK** at the end of u-substitution.
7. **Confusing definite and indefinite integrals.** Indefinite gives a function (with C). Definite gives a number.
8. **Sign errors in trig integrals.** ∫sin(x) dx = -cos(x). ∫cos(x) dx = sin(x).
9. **Treating Riemann sums as exact.** They APPROXIMATE; only as n → ∞ do they equal the integral.
10. **Misapplying FTC.** FTC requires f to be CONTINUOUS on [a, b].
11. **Wrong direction for improper integral convergence test.** Convergent if limit exists. Divergent if limit is infinite or doesn't exist.
12. **Failing to recognize integration by parts opportunity.** When you see x·trig, x·exp, x·log, etc., often try IBP.
13. **Using LIATE incorrectly.** Choose u as Log > Inverse trig > Algebraic > Trig > Exponential.
14. **Forgetting to include constant when computing definite integrals.** Constant cancels in F(b) - F(a), so it's not an issue, but be sure to include all terms.
15. **Confusing accumulation function and antiderivative.** Accumulation function F(x) = ∫(a to x) f(t)dt is a SPECIFIC antiderivative; any antiderivative differs from this by a constant.

## Rubric-Aware Tactics

**For indefinite integrals:**
- Always include + C.
- Use power rule, special integrals, substitution, integration by parts as appropriate.

**For definite integrals:**
- Find antiderivative.
- Apply FTC2: F(b) - F(a).

**For Riemann sums:**
- Identify type (left, right, midpoint, trapezoidal).
- Calculate areas of rectangles or trapezoids.
- Sum.

**For substitution:**
- Choose u so du appears or can be created.
- Substitute, simplify, integrate, substitute back.

**For integration by parts:**
- Use LIATE to choose u.
- Apply formula ∫u dv = uv - ∫v du.

**For improper integrals:**
- Set up as limit.
- Compute the integral.
- Take limit; determine convergence/divergence.

## "Phrases That Score" — verbatim language for FRQs

1. "The Fundamental Theorem of Calculus, Part 2: ∫(a to b) f(x)dx = F(b) - F(a), where F is any antiderivative of f. This connects integration to differentiation."
2. "By the Fundamental Theorem of Calculus, Part 1: if F(x) = ∫(a to x) f(t)dt, then F'(x) = f(x). The derivative of the accumulation function gives back the original function."
3. "Using u-substitution: let u = [inner function]. Then du = [derivative] dx. Substituting transforms the integral into a simpler form involving u."
4. "Integration by Parts: ∫u dv = uv - ∫v du. Choose u using LIATE rule (Logarithm > Inverse trig > Algebraic > Trig > Exponential)."
5. "The improper integral ∫(a to ∞) f(x)dx = lim(b→∞) ∫(a to b) f(x)dx. The integral CONVERGES if this limit exists and is finite; DIVERGES otherwise."
6. "Riemann sums approximate the definite integral by summing areas of rectangles. As the number of subintervals approaches infinity, the Riemann sum converges to the exact value of the integral."
7. "The average value of f on [a, b] is (1/(b-a)) · ∫(a to b) f(x)dx — the constant value that has the same total accumulation as f over the interval."

## If You Do Nothing Else for This Unit

*Master the Fundamental Theorem of Calculus (both parts). Master the basic antiderivatives (polynomials, trig, exponential, logarithm, inverse trig). Master substitution (reverse Chain Rule) and integration by parts (reverse Product Rule). The FTC connects differentiation and integration — this is the central insight of calculus.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus BC CED 2024-25, Princeton Review AP Calculus BC 2025, Khan Academy AP Calculus BC, Stewart Calculus 8e, Larson Calculus 11e
_difficulty: foundational
_relatedUnits: ap-calculus-bc-unit-1-limits-continuity, ap-calculus-bc-unit-5-analytical-applications-differentiation, ap-calculus-bc-unit-7-differential-equations, ap-calculus-bc-unit-8-applications-integration
