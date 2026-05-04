# AP Calculus BC — Unit 10: Infinite Sequences and Series — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 17–18% of the AP Calculus BC exam — one of the heaviest units (BC-specific)
- **Sub-topics covered:**
  - 10.1 Defining Convergent and Divergent Infinite Series
  - 10.2 Working with Geometric Series
  - 10.3 The nth Term Test for Divergence
  - 10.4 Integral Test for Convergence
  - 10.5 Harmonic Series and p-Series
  - 10.6 Comparison Tests for Convergence
  - 10.7 Alternating Series Test for Convergence
  - 10.8 Ratio Test for Convergence
  - 10.9 Determining Absolute or Conditional Convergence
  - 10.10 Alternating Series Error Bound
  - 10.11 Finding Taylor Polynomial Approximations of Functions
  - 10.12 Lagrange Error Bound
  - 10.13 Radius and Interval of Convergence of Power Series
  - 10.14 Finding Taylor or Maclaurin Series for a Function
  - 10.15 Representing Functions as Power Series
- **Where this unit appears on the exam:** This is the LARGEST single unit by exam weight in BC. Sequences and series problems are essentially guaranteed FRQ. Convergence tests are extensively tested. Taylor series and the 6 famous Maclaurin series (per the brain file's signature) are essential. This is the most BC-distinctive unit.

## Big Ideas

1. **An infinite series is a sum of infinitely many terms.** Either CONVERGES (sum is a finite number) or DIVERGES (sum is infinite or doesn't exist).
2. **Multiple convergence tests address different patterns.** Geometric, p-series, integral, comparison, alternating, ratio. Match test to series type.
3. **The 6 famous Maclaurin series are essential to memorize:** e^x, sin(x), cos(x), 1/(1-x), ln(1+x), arctan(x). These appear constantly.
4. **Taylor and Maclaurin series approximate functions as polynomials.** Taylor series centered at a; Maclaurin series centered at 0.
5. **Lagrange Error Bound estimates the error in Taylor polynomial approximations.** |R_n(x)| ≤ M·|x-a|^(n+1)/(n+1)!, where M is bound on (n+1)th derivative.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Sequence vs Series:**
  - **Sequence:** ordered list (a₁, a₂, a₃, ...).
  - **Series:** sum of sequence (a₁ + a₂ + a₃ + ...).
- **Convergence and divergence:**
  - **Series CONVERGES** if its partial sums approach a finite limit as n → ∞.
  - **Series DIVERGES** otherwise.
- **Geometric series:** Σ a·r^n (sum of a, ar, ar², ar³, ...).
  - **Converges** if |r| < 1: sum = a/(1-r).
  - **Diverges** if |r| ≥ 1.
- **Harmonic series:** Σ(1/n) = 1 + 1/2 + 1/3 + ... DIVERGES (despite terms going to 0).
- **p-Series:** Σ(1/n^p).
  - **Converges** if p > 1.
  - **Diverges** if p ≤ 1.
  - Harmonic is the special case p = 1.
- **nth Term Test for Divergence:**
  - If lim(n→∞) aₙ ≠ 0, then series DIVERGES.
  - If lim aₙ = 0, the test is INCONCLUSIVE (need another test).
- **Integral Test:**
  - For positive, decreasing function f(x): Σ aₙ converges if and only if ∫(1 to ∞) f(x)dx converges.
- **Comparison Tests:**
  - **Direct comparison:** if 0 ≤ aₙ ≤ bₙ:
    - If Σbₙ converges, so does Σaₙ.
    - If Σaₙ diverges, so does Σbₙ.
  - **Limit comparison:** if lim(n→∞) (aₙ/bₙ) = c, where 0 < c < ∞, then Σaₙ and Σbₙ both converge or both diverge.
- **Alternating Series Test:**
  - Series Σ(-1)^n·bₙ converges if:
    - bₙ is positive and decreasing.
    - lim(n→∞) bₙ = 0.
- **Ratio Test:**
  - For Σaₙ, compute L = lim(n→∞) |aₙ₊₁/aₙ|.
  - If L < 1: converges absolutely.
  - If L > 1: diverges.
  - If L = 1: inconclusive.
- **Absolute vs conditional convergence:**
  - **Absolute convergence:** Σ|aₙ| converges. Implies original Σaₙ converges.
  - **Conditional convergence:** Σaₙ converges but Σ|aₙ| diverges.
- **Power series:** Σaₙ(x-c)ⁿ.
  - **Center:** c.
  - **Radius of convergence (R):** half-width of convergence interval.
  - **Interval of convergence:** values of x for which the series converges.
- **Taylor series of f at x = a:**
  - Σ f^(n)(a)/n! · (x-a)ⁿ.
  - When a = 0, called Maclaurin series.
- **The 6 Famous Maclaurin Series** (MEMORIZE):
  - e^x = Σ x^n/n! = 1 + x + x²/2! + x³/3! + ...
  - sin(x) = Σ (-1)^n · x^(2n+1)/(2n+1)! = x - x³/3! + x⁵/5! - ...
  - cos(x) = Σ (-1)^n · x^(2n)/(2n)! = 1 - x²/2! + x⁴/4! - ...
  - 1/(1-x) = Σ x^n = 1 + x + x² + x³ + ... (converges for |x| < 1).
  - ln(1+x) = Σ (-1)^(n+1) · x^n/n = x - x²/2 + x³/3 - x⁴/4 + ... (converges for -1 < x ≤ 1).
  - arctan(x) = Σ (-1)^n · x^(2n+1)/(2n+1) = x - x³/3 + x⁵/5 - x⁷/7 + ... (converges for -1 ≤ x ≤ 1).

### Adds for [4]

- **Lagrange Error Bound:**
  - For Taylor polynomial T_n(x) approximating f(x): |R_n(x)| ≤ M · |x-a|^(n+1)/(n+1)!, where M = max |f^(n+1)(z)| for z between a and x.
- **Alternating Series Error Bound:**
  - For convergent alternating series, error after n terms ≤ first omitted term: |S - S_n| ≤ |a_{n+1}|.
- **Finding Taylor series of a function:**
  - Compute derivatives of f at a.
  - Plug into Σ f^(n)(a)/n! · (x-a)ⁿ.
- **Finding interval of convergence:**
  - Use Ratio Test to find radius R.
  - Then check endpoints separately.
- **Manipulating series.** Common techniques:
  - **Substitution:** if you know series for f(x), find series for f(g(x)).
  - **Differentiation:** differentiate term-by-term.
  - **Integration:** integrate term-by-term.
- **Recognizing series.** Look for patterns matching famous series.

### Adds for [5]

- **Why convergence matters.** Without convergence, infinite sums make no sense. Convergence guarantees a finite, well-defined value.
- **Geometric series formula derivation.** For S = a + ar + ar² + ..., multiply by r: rS = ar + ar² + ... Subtract: S(1-r) = a, so S = a/(1-r) for |r| < 1.
- **Why p-series rule (p > 1) holds.** Comes from integral test: ∫(1/x^p)dx converges if p > 1, diverges if p ≤ 1.
- **Taylor series as polynomial approximations.** Take more terms for better approximation. The Lagrange Error Bound tells you how good the approximation is.
- **Connection between Taylor series and derivatives.** Each coefficient is f^(n)(a)/n!, where f^(n) is the nth derivative. Higher-order terms capture progressively finer behavior of f near a.
- **Why MEMORIZING the 6 Maclaurin series matters.** Many problems require these directly. Substitution generates many other series. Differentiation/integration generates more. Without memorization, every series problem becomes a derivative computation.

## Worked Examples

### Example 1 [3] — Geometric series

Find sum of 6 + 4 + 8/3 + 16/9 + ...

- **Step 1.** Identify a = 6, r = 4/6 = 2/3.
- **Step 2.** |r| = 2/3 < 1, so series converges.
- **Step 3.** Sum = a/(1-r) = 6/(1 - 2/3) = 6/(1/3) = 18.

### Example 2 [3] — p-series

Determine whether Σ(1/n^(1/2)) converges or diverges.

- **Step 1.** This is p-series with p = 1/2.
- **Step 2.** Since p = 1/2 ≤ 1, series DIVERGES.

### Example 3 [3] — nth Term Test

Determine if Σ(n²/(n²+1)) converges or diverges.

- **Step 1.** Check lim(n→∞) aₙ = lim(n→∞) n²/(n²+1) = 1.
- **Step 2.** Since limit ≠ 0, by nth Term Test, series DIVERGES.

### Example 4 [4] — Ratio Test

Determine convergence of Σ(2^n/n!).

- **Step 1.** L = lim(n→∞) |aₙ₊₁/aₙ| = lim(n→∞) |2^(n+1)/(n+1)! · n!/2^n| = lim(n→∞) 2/(n+1) = 0.
- **Step 2.** L = 0 < 1, so series CONVERGES (absolutely).

### Example 5 [4] — Maclaurin series substitution

Find Maclaurin series for f(x) = e^(2x).

- **Step 1.** Start with e^x = Σ x^n/n!.
- **Step 2.** Substitute x → 2x: e^(2x) = Σ (2x)^n/n! = Σ 2^n · x^n/n!.

### Example 6 [4] — Taylor series with derivatives

Find Maclaurin series for f(x) = 1/(1+x).

- **Step 1.** Recognize that 1/(1+x) = 1/(1-(-x)).
- **Step 2.** From geometric series 1/(1-x) = Σ x^n, substitute x → -x:
  - 1/(1-(-x)) = Σ (-x)^n = Σ (-1)^n · x^n.
- **Step 3.** = 1 - x + x² - x³ + ... (converges for |x| < 1).

### Example 7 [5] — Interval of convergence

Find interval of convergence for Σ x^n/n.

- **Step 1.** Apply Ratio Test: L = lim |x^(n+1)/(n+1) · n/x^n| = lim |x · n/(n+1)| = |x|.
- **Step 2.** Converges when |x| < 1: interval at least (-1, 1).
- **Step 3.** Check endpoints:
  - x = 1: Σ 1/n = harmonic series, DIVERGES.
  - x = -1: Σ (-1)^n/n = alternating harmonic, CONVERGES.
- **Step 4.** Interval of convergence: [-1, 1).

## Top Traps & Common Errors

1. **Wrong direction of nth Term Test.** Limit ≠ 0 → diverges. Limit = 0 → INCONCLUSIVE.
2. **Forgetting endpoints in interval of convergence.** Always check x = ±R separately.
3. **Misapplying Ratio Test.** L < 1: converges. L > 1: diverges. L = 1: inconclusive.
4. **Wrong p-series rule.** Converges if p > 1, diverges if p ≤ 1.
5. **Forgetting harmonic series diverges.** Despite terms going to 0.
6. **Wrong geometric series formula.** Sum = a/(1-r), valid only when |r| < 1.
7. **Misremembering famous Maclaurin series.** Cosine starts with 1; sine starts with x. Memorize correctly.
8. **Ratio test for non-positive terms.** Use |aₙ₊₁/aₙ|.
9. **Confusing Taylor and Maclaurin.** Maclaurin = Taylor at a = 0.
10. **Wrong Lagrange Error formula.** |R_n| ≤ M·|x-a|^(n+1)/(n+1)!.

## Rubric-Aware Tactics

**For convergence questions:**
- Check nth Term Test first.
- Match series to known type (geometric, p-series, etc.).
- Use appropriate test.

**For Taylor/Maclaurin series:**
- Use known series with substitution if possible.
- Otherwise compute derivatives.
- Check radius/interval of convergence.

**For error bounds:**
- Lagrange Error Bound for Taylor polynomial approximations.
- Alternating Series Error Bound for alternating series.

## "Phrases That Score" — verbatim language for FRQs

1. "By the Ratio Test, L = lim(n→∞) |aₙ₊₁/aₙ| = [calculation]. Since L < 1, the series converges absolutely."
2. "The geometric series Σar^n converges to a/(1-r) when |r| < 1."
3. "By the nth Term Test, since lim(n→∞) aₙ = [value] ≠ 0, the series diverges."
4. "The p-series Σ(1/n^p) converges if p > 1 and diverges if p ≤ 1."
5. "The Maclaurin series for e^x is Σ x^n/n! = 1 + x + x²/2! + x³/3! + ..."
6. "By the Lagrange Error Bound, |f(x) - T_n(x)| ≤ M·|x-a|^(n+1)/(n+1)!, where M is the maximum of the (n+1)th derivative on the interval."
7. "The interval of convergence is [-1, 1) — found by Ratio Test (radius 1), then checking endpoints separately."

## If You Do Nothing Else for This Unit

*Master the 6 famous Maclaurin series (the brain file's signature for AP Calc BC). Master convergence tests (geometric, p-series, ratio, comparison, alternating). Master Taylor series construction and Lagrange Error Bound. This is the largest BC unit by weight; mastering it is essential for a strong score.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus BC CED 2024-25, Princeton Review AP Calculus BC 2025, Khan Academy AP Calculus BC, Stewart Calculus 8e
_difficulty: advanced
_relatedUnits: ap-calculus-bc-unit-1-limits-continuity, ap-calculus-bc-unit-9-parametric-polar-vector
