# AP Calculus AB — Unit 2: Differentiation: Definition and Fundamental Properties — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 10–12% of the AP Calculus AB exam
- **AB vs BC distinction:** Identical content to BC Unit 2.
- **Sub-topics covered:** average vs instantaneous rate of change; derivative definition (limit form and notation); differentiability and continuity; Power Rule; Sum/Difference, Constant Multiple Rules; derivatives of basic functions (polynomials, trig, exponential, logarithmic); Product Rule; Quotient Rule.

## Big Ideas

1. **The derivative measures instantaneous rate of change** — slope of the tangent line.
2. **The derivative is defined as a limit:** f'(x) = lim(h→0) [f(x+h) - f(x)]/h.
3. **Differentiable implies continuous, but NOT vice versa.** Corners, cusps, and vertical tangents are continuous but not differentiable.
4. **Derivative rules let us compute derivatives without using the limit definition each time.**
5. **Multiple notations for derivative:** f'(x), df/dx, d/dx [f(x)], y'.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Average rate of change** of f over [a, b]: (f(b) - f(a))/(b - a). Slope of secant.
- **Instantaneous rate of change** at x = a: f'(a) = lim(h→0) [f(a+h) - f(a)]/h. Slope of TANGENT.
- **Definition of derivative:** f'(x) = lim(h→0) [f(x+h) - f(x)]/h.
  - **Alternative form:** f'(a) = lim(x→a) [f(x) - f(a)]/(x - a).
- **Differentiable → Continuous.** Continuous does NOT imply differentiable.
- **When NOT differentiable:** discontinuity, corner, cusp, vertical tangent.
- **Power Rule:** d/dx (x^n) = n·x^(n-1).
- **Sum/Difference:** d/dx [f ± g] = f' ± g'.
- **Constant Multiple:** d/dx [c · f] = c · f'.
- **Constant:** d/dx (c) = 0.
- **Trig derivatives:**
  - d/dx (sin x) = cos x.
  - d/dx (cos x) = -sin x.
  - d/dx (tan x) = sec² x.
  - d/dx (cot x) = -csc² x.
  - d/dx (sec x) = sec x · tan x.
  - d/dx (csc x) = -csc x · cot x.
- **Exponential and log:**
  - d/dx (e^x) = e^x.
  - d/dx (ln x) = 1/x.
  - d/dx (a^x) = a^x · ln(a).
- **Product Rule:** d/dx [f · g] = f'·g + f·g'.
- **Quotient Rule:** d/dx [f/g] = (f'·g - f·g') / g².

### Adds for [4]

- **Derivative as slope of tangent.** Visual: secant slope → tangent slope as points approach.
- **Tangent line equation at (a, f(a)):** y - f(a) = f'(a)·(x - a).
- **Higher-order derivatives:** f'(x), f''(x), f'''(x), f^(n)(x).
- **Power Rule extended.** Works for ALL real n: d/dx (x^(1/2)) = (1/2)·x^(-1/2). d/dx (x^(-2)) = -2·x^(-3).
- **Combining rules.** d/dx (x²·sin(x)) requires Product Rule. d/dx (sin(x)/x) requires Quotient Rule.

### Adds for [5]

- **Why differentiability implies continuity.** If f' exists at a, then [f(a+h) - f(a)] → 0 as h → 0, which is the definition of continuity.
- **Geometric meaning of differentiability.** A tangent line exists. At corners, no single tangent. At cusps, vertical tangent.
- **Quotient Rule asymmetry.** It's f'·g - f·g', not f·g' - f'·g. Order matters.
- **Why d/dx (e^x) = e^x is special.** e^x is the unique function (up to constant multiplier) whose derivative equals itself.
- **Tangent line approximation.** For x close to a, f(x) ≈ f(a) + f'(a)·(x - a). Foundation for linearization (Unit 4).

## Worked Examples

### Example 1 [3] — Definition of derivative

Use limit definition to find f'(x) for f(x) = x².

- f'(x) = lim(h→0) [(x+h)² - x²]/h = lim(h→0) (2xh + h²)/h = lim(h→0) (2x + h) = 2x.
- Verify with Power Rule: d/dx (x²) = 2x ✓.

### Example 2 [3] — Combining rules

(a) f(x) = 3x⁴ + 2x³ - 5x + 7. f'(x) = 12x³ + 6x² - 5.
(b) f(x) = (2x + 1)(x² - 3). Use Product Rule: f' = 2(x²-3) + (2x+1)(2x) = 6x² + 2x - 6.
(c) f(x) = x²/sin(x). Use Quotient Rule: f' = [2x·sin(x) - x²·cos(x)]/sin²(x).

### Example 3 [3] — Tangent line

Find tangent line to f(x) = x³ at x = 2.

- f(2) = 8. f'(x) = 3x². f'(2) = 12.
- y - 8 = 12·(x - 2) → y = 12x - 16.

### Example 4 [4] — Differentiability vs continuity

Is f(x) = |x| differentiable at x = 0?

- Continuous? Yes (no break in graph).
- Differentiable? Right derivative = 1, left derivative = -1. They differ → NOT DIFFERENTIABLE at x = 0.
- This is a CORNER.

### Example 5 [4] — Derivative of trig

Use Quotient Rule to derive d/dx [tan(x)] from sin/cos.

- d/dx [sin/cos] = [cos·cos - sin·(-sin)]/cos² = (cos² + sin²)/cos² = 1/cos² = sec²(x).

## Top Traps & Common Errors

1. **Confusing average and instantaneous rate.** Average = secant. Instantaneous = tangent (derivative).
2. **Forgetting derivative is LIMIT.** f'(x) = lim(h→0) [f(x+h) - f(x)]/h.
3. **Misapplying Power Rule.** Bring DOWN exponent, REDUCE by 1.
4. **Wrong sign on cos derivative.** d/dx (cos x) = -sin x.
5. **Forgetting Product/Quotient Rule for products and quotients.**
6. **Wrong order in Quotient Rule.** [f'·g - f·g']/g². Minus sign matters.
7. **Treating differentiability as same as continuity.** They're not.
8. **Forgetting derivatives of standard functions.** e^x, ln x, etc.

## Rubric-Aware Tactics

**For limit definition:** set up correctly, simplify, take limit.

**For derivatives:** identify structure (sum, product, quotient, composition), apply appropriate rule.

**For tangent lines:** find f(a) and f'(a), use point-slope.

**For differentiability questions:** check continuity first, then check derivative existence.

## "Phrases That Score" — verbatim language for FRQs

1. "The derivative f'(x) = lim(h→0) [f(x+h) - f(x)]/h represents instantaneous rate of change — equivalently, slope of tangent line."
2. "f is differentiable at x = a if and only if the limit f'(a) = lim(h→0) [f(a+h) - f(a)]/h exists. Differentiability requires continuity but is more restrictive."
3. "Power Rule: d/dx (x^n) = n·x^(n-1). Product Rule: d/dx [f·g] = f'·g + f·g'. Quotient Rule: d/dx [f/g] = (f'·g - f·g')/g²."
4. "The tangent line to f at x = a has equation y - f(a) = f'(a)(x - a). This linearization approximates f for x near a."

## If You Do Nothing Else for This Unit

*Master derivative rules — Power, Sum/Difference, Constant Multiple, Product, Quotient — and derivatives of basic functions (polynomials, trig, exp, log). Master limit definition and the differentiability-implies-continuity relationship.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus AB CED 2024-25, Princeton Review AP Calculus AB 2025, Khan Academy AP Calculus AB, Stewart Calculus 8e
_difficulty: foundational
_relatedUnits: ap-calculus-ab-unit-1-limits-continuity, ap-calculus-ab-unit-3-composite-implicit-inverse, ap-calculus-ab-unit-4-contextual-applications-differentiation, ap-calculus-bc-unit-2-differentiation-rules
