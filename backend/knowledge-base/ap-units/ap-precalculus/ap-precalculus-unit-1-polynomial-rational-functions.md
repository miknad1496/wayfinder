# AP Precalculus — Unit 1: Polynomial and Rational Functions — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** ~30–40% of the AP Precalculus exam
- **Sub-topics covered:** function basics; polynomial behavior (end behavior, zeros, multiplicities); rational functions (asymptotes, holes); transformations; complex zeros; arithmetic and geometric sequences.
- **Where this unit appears on the exam:** Largest unit. Covered heavily on MCQ and FRQ. Foundation for Calc.

## Big Ideas

1. **Functions describe how output depends on input;** key features include domain, range, end behavior, zeros.
2. **Polynomials:** end behavior determined by leading term; zeros and multiplicities shape graph.
3. **Rational functions:** asymptotes (vertical, horizontal, slant) and holes from factored form.
4. **Transformations:** shifts, stretches, reflections — shift inside flips intuition.
5. **Sequences:** arithmetic (constant difference) and geometric (constant ratio).

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Function:** rule assigning each input one output.
  - **Domain:** valid inputs.
  - **Range:** outputs.
- **Function operations:** sum, difference, product, quotient, composition (f∘g)(x) = f(g(x)).
- **Inverse function:** swap inputs and outputs; f and f⁻¹ reflect across y = x.
- **Polynomial functions:** f(x) = aₙxⁿ + ... + a₁x + a₀.
  - **Degree n:** highest exponent.
  - **Leading coefficient:** aₙ.
  - **End behavior:** determined by sign of aₙ and parity of n.
- **Zeros (roots) of polynomial:** values where f(x) = 0.
  - **Multiplicity:** how many times factor repeats.
  - **Even multiplicity:** graph touches x-axis (doesn't cross).
  - **Odd multiplicity:** graph crosses x-axis.
- **Rational function:** f(x) = p(x)/q(x).
  - **Vertical asymptote:** where q(x) = 0 and p(x) ≠ 0.
  - **Hole:** where p(x) and q(x) share factor (cancel).
  - **Horizontal asymptote:**
    - **deg p < deg q:** y = 0.
    - **deg p = deg q:** y = ratio of leading coefficients.
    - **deg p > deg q:** no horizontal (slant if exactly 1 higher).
  - **Slant (oblique) asymptote:** when deg p = deg q + 1.
- **Transformations of f(x):**
  - **f(x) + k:** shift up k.
  - **f(x − h):** shift right h (counter-intuitive).
  - **−f(x):** reflect across x-axis.
  - **f(−x):** reflect across y-axis.
  - **a·f(x):** vertical stretch by a.
  - **f(bx):** horizontal compress by b.
- **Even/odd functions:**
  - **Even:** f(−x) = f(x); symmetric about y-axis.
  - **Odd:** f(−x) = −f(x); symmetric about origin.
- **Sequences:**
  - **Arithmetic:** aₙ = a₁ + (n−1)d.
  - **Geometric:** aₙ = a₁·r^(n−1).
  - **Sum (arithmetic):** Sₙ = n(a₁ + aₙ)/2.
  - **Sum (geometric):** Sₙ = a₁(1 − rⁿ)/(1 − r).

### Adds for [4]

- **Complex zeros come in conjugate pairs** (real coefficients).
- **Fundamental Theorem of Algebra:** degree n polynomial has exactly n roots in complex plane (with multiplicity).
- **Long division of polynomials.**
- **Rational zero theorem:** rational roots of polynomial with integer coefficients are p/q where p | constant, q | leading.
- **Modeling with polynomials:** fit data, optimization basics.

### Adds for [5]

- **Why end behavior matters:** dominates as x → ±∞.
- **Why horizontal asymptotes:** describe long-term ratio.

## Worked Examples

### Example 1 [3] — End behavior

f(x) = −2x³ + 5x² − 3. End behavior?
- **Leading term −2x³.**
- **As x → +∞:** f(x) → −∞ (negative leading, odd degree).
- **As x → −∞:** f(x) → +∞.

### Example 2 [3] — Zeros and multiplicities

f(x) = x²(x − 3)(x + 1)³. Zeros and behavior?
- **x = 0** (multiplicity 2 — even, touches).
- **x = 3** (multiplicity 1 — odd, crosses).
- **x = −1** (multiplicity 3 — odd, crosses but flattens).

### Example 3 [4] — Rational asymptotes

f(x) = (x² − 4)/(x² − 1). Asymptotes and holes?
- **Factored:** (x − 2)(x + 2)/[(x − 1)(x + 1)].
- **No common factors;** no holes.
- **Vertical asymptotes:** x = 1, x = −1.
- **Horizontal asymptote:** equal degrees, ratio 1/1 = **y = 1.**

### Example 4 [4] — Transformations

g(x) = 3·f(x − 2) + 1. Describe transformations of f.
- **Shift right 2.**
- **Stretch vertically by 3.**
- **Shift up 1.**

### Example 5 [5] — Sequences

Arithmetic: a₁ = 5, d = 3. Find a₁₀ and S₁₀.
- **a₁₀ = 5 + 9·3 = 32.**
- **S₁₀ = 10(5 + 32)/2 = 185.**

## Top Traps & Common Errors

1. **Shift right** by f(x − h), NOT f(x + h).
2. **Even multiplicity touches;** odd crosses.
3. **Holes vs vertical asymptotes:** common factors create holes.
4. **Wrong end behavior** when both sign and parity must be considered.
5. **Forgetting complex roots** come in conjugate pairs.

## Rubric-Aware Tactics

**For polynomial questions:** identify leading term for end behavior; factor for zeros.
**For rational:** factor first; identify holes vs asymptotes.
**For sequences:** identify arithmetic vs geometric; apply formulas.

## "Phrases That Score" — verbatim language for FRQs

1. "End behavior of a polynomial is determined by its leading term: as x → ±∞, the polynomial behaves like aₙxⁿ. Even degree → both ends agree; odd degree → ends disagree."
2. "Zeros with even multiplicity touch but don't cross the x-axis; odd multiplicity crosses (with higher odd multiplicity flattening at the crossing)."
3. "Rational function f(x) = p(x)/q(x): vertical asymptotes occur where q(x) = 0 and p(x) ≠ 0; holes occur where p and q share a factor; horizontal asymptote depends on relative degrees."
4. "Transformations of f(x): f(x) + k shifts vertically (up if k > 0); f(x − h) shifts horizontally (right if h > 0 — counter-intuitive); a·f(x) stretches vertically; f(bx) compresses horizontally by factor b."
5. "Arithmetic sequences add constant difference d (aₙ = a₁ + (n−1)d); geometric multiply by constant ratio r (aₙ = a₁·r^(n−1))."

## If You Do Nothing Else for This Unit

*Master polynomial end behavior, zeros, multiplicities. Master rational function asymptotes and holes. Master transformations (especially horizontal direction trick). Master arithmetic and geometric sequences.*

_lastUpdated: 2026-05-04
_sources: College Board AP Precalculus CED 2024-25, Princeton Review AP Precalculus 2025, Khan Academy
_difficulty: foundational
_relatedUnits: ap-precalculus-unit-2-exponential-logarithmic-functions, ap-precalculus-unit-3-trigonometric-polar-functions
