# AP Calculus AB — Unit 3: Differentiation: Composite, Implicit, and Inverse Functions — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 9–13% of the AP Calculus AB exam
- **AB vs BC distinction:** Identical content to BC Unit 3.
- **Sub-topics covered:** Chain Rule; implicit differentiation; derivatives of inverse functions; inverse trig derivatives; selecting procedures; higher-order derivatives.

## Big Ideas

1. **Chain Rule handles composition of functions:** d/dx [f(g(x))] = f'(g(x)) · g'(x).
2. **Implicit differentiation lets us find dy/dx when y is not explicitly solved for.** Treat y as a function of x; differentiate; remember dy/dx wherever y appears.
3. **Inverse function derivatives:** if y = f⁻¹(x), then dy/dx = 1/f'(y).
4. **Inverse trig functions have specific derivative formulas to memorize.**
5. **Higher-order derivatives are derivatives of derivatives** — used in physics (acceleration = 2nd derivative of position) and concavity (Unit 5).

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Chain Rule:** d/dx [f(g(x))] = f'(g(x)) · g'(x).
  - "Outer derivative TIMES inner derivative."
  - Or in Leibniz: dy/dx = (dy/du) · (du/dx).
- **Examples:**
  - d/dx [(x² + 3)⁵] = 5(x² + 3)⁴ · (2x).
  - d/dx [sin(3x²)] = cos(3x²) · 6x.
  - d/dx [e^(x²)] = e^(x²) · 2x.
  - d/dx [ln(2x + 5)] = 2/(2x + 5).
- **Multiple compositions:** d/dx [f(g(h(x)))] = f'(g(h(x))) · g'(h(x)) · h'(x).
- **Implicit differentiation:**
  - Take d/dx of both sides.
  - Whenever you encounter y, write dy/dx after differentiating (Chain Rule).
  - Solve for dy/dx.
  - **Example:** x² + y² = 25 → 2x + 2y·(dy/dx) = 0 → dy/dx = -x/y.
- **Derivative of inverse function:**
  - If a = f(b), then (f⁻¹)'(a) = 1/f'(b).
  - Equivalent: if y = f⁻¹(x), then dy/dx = 1/f'(y).
- **Inverse trig derivatives:**
  - d/dx (arcsin x) = 1/√(1-x²), valid for -1 < x < 1.
  - d/dx (arccos x) = -1/√(1-x²), valid for -1 < x < 1.
  - d/dx (arctan x) = 1/(1+x²), valid for all x.
  - d/dx (arccot x) = -1/(1+x²).
  - d/dx (arcsec x) = 1/(|x|·√(x²-1)).
  - d/dx (arccsc x) = -1/(|x|·√(x²-1)).
- **Higher-order derivatives:** f'(x), f''(x), f'''(x). Notation f^(n)(x).

### Adds for [4]

- **Why Chain Rule works.** dy/dx = (dy/du) · (du/dx) — captured intuitively by Leibniz notation.
- **Implicit differentiation worked example:** x² + xy + y² = 7. Differentiate: 2x + y + x·(dy/dx) + 2y·(dy/dx) = 0. Solve: dy/dx = -(2x + y)/(x + 2y).
- **Logarithmic differentiation:** for y = x^x, take ln: ln y = x·ln x. Differentiate: (1/y)(dy/dx) = ln x + 1. Solve: dy/dx = x^x · (ln x + 1).
- **Higher-order derivative applications:** acceleration = s''(t); concavity (Unit 5).

### Adds for [5]

- **Chain Rule is the most-used rule.** Most non-trivial derivatives involve composition.
- **"Outside-inside" mental model.** Identify what's outside (wrapper) and inside (wrapped). Differentiate outside, leave inside, multiply by inside's derivative.
- **Implicit differentiation as a tool for related rates** (Unit 4).
- **Why inverse trig derivatives have square roots.** Comes from implicit differentiation: y = arcsin x → sin y = x → cos y · (dy/dx) = 1 → dy/dx = 1/cos y = 1/√(1-x²).

## Worked Examples

### Example 1 [3] — Chain Rule basic

Find d/dx [(3x + 1)⁴].
- Outer: (something)⁴, derivative 4(something)³.
- Inner: 3x + 1, derivative 3.
- Result: 4(3x + 1)³ · 3 = 12(3x + 1)³.

### Example 2 [3] — Chain Rule with trig

Find d/dx [sin(x²)].
- Outer: sin(something), derivative cos(something).
- Inner: x², derivative 2x.
- Result: cos(x²) · 2x = 2x·cos(x²).

### Example 3 [4] — Implicit differentiation

Find dy/dx for x² + y³ = 5.
- d/dx: 2x + 3y²·(dy/dx) = 0.
- Solve: dy/dx = -2x/(3y²).

### Example 4 [4] — Inverse function derivative

If f(x) = x³ + 2x and f(2) = 12, find (f⁻¹)'(12).
- f⁻¹(12) = 2 (since f(2) = 12).
- f'(x) = 3x² + 2. f'(2) = 14.
- (f⁻¹)'(12) = 1/f'(2) = 1/14.

### Example 5 [4] — Multiple Chain Rule

Find d/dx [√(sin(2x))].
- This is √u where u = sin(2x).
- d/dx = (1/(2√u)) · cos(2x) · 2 = cos(2x)/√(sin(2x)).

## Top Traps & Common Errors

1. **Forgetting Chain Rule.** Applies whenever there's composition.
2. **Wrong identification of outer/inner.** For (x² + 1)³: outer is x³, inner is x² + 1.
3. **Forgetting Chain Rule in implicit differentiation.** d/dx (y²) = 2y · (dy/dx).
4. **Wrong sign on inverse trig derivatives.** d/dx (arcsin x) = +1/√(1-x²); d/dx (arccos x) = -1/√(1-x²).
5. **Mixing up Chain Rule and Product Rule.**
6. **Incomplete Chain Rule for nested compositions.** Three factors needed.
7. **Forgetting that constants in inner function still contribute.** d/dx [sin(2x)] = cos(2x) · 2.
8. **Wrong inverse function relationship.** (f⁻¹)'(a) = 1/f'(b) where b = f⁻¹(a).

## Rubric-Aware Tactics

**For Chain Rule:** identify outer and inner; differentiate outer; multiply by inner's derivative.

**For implicit differentiation:** take d/dx of both sides; use Chain Rule on y; isolate dy/dx.

**For inverse function derivatives:** use formula (f⁻¹)'(a) = 1/f'(b) where b = f⁻¹(a).

## "Phrases That Score" — verbatim language for FRQs

1. "By Chain Rule, d/dx [f(g(x))] = f'(g(x)) · g'(x). Identify outer and inner functions; differentiate outer treating inner as a single quantity; multiply by derivative of inner."
2. "Using implicit differentiation, take d/dx of both sides, applying Chain Rule whenever differentiating y. The dy/dx terms can then be isolated."
3. "Derivative of inverse: (f⁻¹)'(a) = 1/f'(b) where b = f⁻¹(a). The slopes of inverse functions at corresponding points are RECIPROCALS."
4. "d/dx (arcsin x) = 1/√(1-x²), valid for -1 < x < 1. d/dx (arctan x) = 1/(1+x²), valid for all x."

## If You Do Nothing Else for This Unit

*Master Chain Rule — appears in nearly every non-trivial derivative on the AP exam. Master implicit differentiation. Memorize inverse trig derivative formulas (especially arcsin and arctan).*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus AB CED 2024-25, Princeton Review AP Calculus AB 2025, Khan Academy AP Calculus AB, Stewart Calculus 8e
_difficulty: foundational
_relatedUnits: ap-calculus-ab-unit-2-differentiation-rules, ap-calculus-ab-unit-4-contextual-applications-differentiation, ap-calculus-ab-unit-5-analytical-applications-differentiation, ap-calculus-bc-unit-3-composite-implicit-inverse
