# AP Calculus AB — Unit 6: Integration and Accumulation of Change — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 17–20% of the AP Calculus AB exam — one of the heaviest units
- **AB vs BC distinction:** AB Unit 6 covers most of BC Unit 6 BUT excludes some advanced techniques. AB does NOT cover: integration by parts (BC only), partial fractions (BC only), improper integrals (BC only). AB DOES cover: substitution and basic antidifferentiation.
- **Sub-topics covered (AB):** Riemann sums; FTC1 and FTC2; basic antiderivatives; properties of definite integrals; substitution.
- **Where this unit appears on the exam:** Unit 6 is heavy. The Fundamental Theorem of Calculus is central and is one of the 5 master theorems. Riemann sums appear regularly. Substitution is the main AB integration technique.

## Big Ideas

1. **Integration is the inverse of differentiation.** Fundamental Theorem of Calculus formalizes this.
2. **Definite integrals represent accumulated change or area.** ∫(a to b) f(x)dx = F(b) - F(a).
3. **Riemann sums approximate definite integrals.** Various forms (left, right, midpoint, trapezoidal).
4. **The 5 master theorems include FTC1 and FTC2** — both essential.
5. **Substitution is the main AB integration technique** (reverse Chain Rule).

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Indefinite integral (antiderivative):** if F'(x) = f(x), then ∫f(x)dx = F(x) + C.
- **Common antiderivatives:**
  - ∫x^n dx = x^(n+1)/(n+1) + C, for n ≠ -1.
  - ∫(1/x) dx = ln|x| + C.
  - ∫e^x dx = e^x + C.
  - ∫sin(x) dx = -cos(x) + C.
  - ∫cos(x) dx = sin(x) + C.
  - ∫sec²(x) dx = tan(x) + C.
  - ∫1/(1+x²) dx = arctan(x) + C.
  - ∫1/√(1-x²) dx = arcsin(x) + C.
- **Definite integral:** ∫(a to b) f(x)dx represents accumulated change or area.
- **Properties of definite integrals:**
  - ∫(a to a) f(x)dx = 0.
  - ∫(a to b) f(x)dx = -∫(b to a) f(x)dx.
  - Linearity, additive over intervals.
- **Riemann sums:** approximate definite integrals.
  - **Left:** heights at left endpoints. Underestimates for increasing f.
  - **Right:** heights at right endpoints. Overestimates for increasing f.
  - **Midpoint:** heights at midpoints. Generally more accurate.
  - **Trapezoidal:** averages left and right.
- **FTC1 (Fundamental Theorem of Calculus, Part 1)** [5 MASTER THEOREMS]:
  - If F(x) = ∫(a to x) f(t)dt, then F'(x) = f(x).
- **FTC2 (Fundamental Theorem of Calculus, Part 2)** [5 MASTER THEOREMS]:
  - If F is an antiderivative of f, then ∫(a to b) f(x)dx = F(b) - F(a).
- **Accumulation function:** F(x) = ∫(a to x) f(t)dt.
- **Substitution method (reverse Chain Rule):**
  - Let u = inner function, du = u' dx.
  - Substitute, integrate, substitute back.

### Adds for [4]

- **Why FTC matters fundamentally.** Connects differentiation and integration as inverse operations.
- **Riemann sum types.** Left, right, midpoint, trapezoidal — different accuracies.
- **Substitution worked example:**
  - ∫2x · sin(x²) dx.
  - Let u = x². du = 2x dx.
  - ∫sin(u) du = -cos(u) + C = -cos(x²) + C.
- **Average value of function on [a, b]:** (1/(b-a)) · ∫(a to b) f(x)dx.

### Adds for [5]

- **Why integration is harder than differentiation.** Differentiation is procedural; integration requires recognition.
- **Why FTC's two parts work together.** FTC1: derivative of accumulation. FTC2: definite integral via antiderivative.
- **The constant of integration.** Antiderivatives unique only up to a constant.

## Worked Examples

### Example 1 [3] — Basic indefinite integral

∫(3x² - 5x + 7)dx = x³ - 5x²/2 + 7x + C.

### Example 2 [3] — Definite integral via FTC2

∫(0 to 2) (x² + 1)dx.
- Antiderivative: F(x) = x³/3 + x.
- F(2) - F(0) = (8/3 + 2) - 0 = 14/3.

### Example 3 [3] — Substitution

∫2x · √(x² + 1) dx.
- Let u = x² + 1. du = 2x dx.
- ∫√u du = (2/3)u^(3/2) + C = (2/3)(x² + 1)^(3/2) + C.

### Example 4 [4] — Average value

Average value of f(x) = sin(x) on [0, π].
- Average = (1/π) · ∫(0 to π) sin(x) dx = (1/π) · 2 = 2/π.

### Example 5 [4] — Riemann sum

Estimate ∫(0 to 4) x² dx using left Riemann sum with 4 subintervals.
- Subintervals: [0,1], [1,2], [2,3], [3,4]. Width = 1.
- Left endpoints: x = 0, 1, 2, 3.
- f(0) = 0, f(1) = 1, f(2) = 4, f(3) = 9.
- Left Riemann sum = 1·(0 + 1 + 4 + 9) = 14.
- Actual: ∫(0 to 4) x² dx = 64/3 ≈ 21.33.
- Left sum underestimates because f is increasing.

## Top Traps & Common Errors

1. **Forgetting + C.** Indefinite integrals have arbitrary constant.
2. **Wrong power rule for integration.** ∫x^n dx = x^(n+1)/(n+1).
3. **Forgetting ln|x|.** ∫(1/x) dx = ln|x| + C (absolute value matters).
4. **Wrong substitution.** Choose u so du appears.
5. **Forgetting to substitute BACK** at end of u-substitution.
6. **Sign errors in trig integrals.** ∫sin = -cos. ∫cos = sin.
7. **Treating Riemann sums as exact.** Only approximations.
8. **Misapplying FTC.** Requires continuity.

## Rubric-Aware Tactics

**For indefinite integrals:** include + C.

**For definite integrals:** find antiderivative; apply FTC2.

**For substitution:** choose u; substitute; integrate; substitute back.

**For Riemann sums:** identify type; calculate areas; sum.

## "Phrases That Score" — verbatim language for FRQs

1. "FTC2: ∫(a to b) f(x)dx = F(b) - F(a), where F is any antiderivative of f."
2. "FTC1: if F(x) = ∫(a to x) f(t)dt, then F'(x) = f(x)."
3. "Using u-substitution: let u = [inner function]. du = [derivative] dx. Substitute to simplify."
4. "Average value of f on [a, b] = (1/(b-a)) · ∫(a to b) f(x)dx."

## If You Do Nothing Else for This Unit

*Master the Fundamental Theorem of Calculus. Master basic antiderivatives. Master substitution. The FTC connects differentiation and integration — central insight of calculus.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus AB CED 2024-25, Princeton Review AP Calculus AB 2025, Khan Academy AP Calculus AB, Stewart Calculus 8e
_difficulty: foundational
_relatedUnits: ap-calculus-ab-unit-1-limits-continuity, ap-calculus-ab-unit-5-analytical-applications-differentiation, ap-calculus-ab-unit-7-differential-equations, ap-calculus-ab-unit-8-applications-integration, ap-calculus-bc-unit-6-integration-accumulation
