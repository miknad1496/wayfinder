# AP Calculus BC — Unit 1: Limits and Continuity — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 4–7% of the AP Calculus BC exam
- **Sub-topics covered:**
  - 1.1 Introducing Calculus: Can Change Occur at an Instant?
  - 1.2 Defining Limits and Using Limit Notation
  - 1.3 Estimating Limit Values from Graphs
  - 1.4 Estimating Limit Values from Tables
  - 1.5 Determining Limits Using Algebraic Properties of Limits
  - 1.6 Determining Limits Using Algebraic Manipulation
  - 1.7 Selecting Procedures for Determining Limits
  - 1.8 Determining Limits Using the Squeeze Theorem
  - 1.9 Connecting Multiple Representations of Limits
  - 1.10 Exploring Types of Discontinuities
  - 1.11 Defining Continuity at a Point
  - 1.12 Confirming Continuity over an Interval
  - 1.13 Removing Discontinuities
  - 1.14 Connecting Infinite Limits and Vertical Asymptotes
  - 1.15 Connecting Limits at Infinity and Horizontal Asymptotes
  - 1.16 Working with the Intermediate Value Theorem (IVT)
- **Where this unit appears on the exam:** Unit 1 establishes the foundation for everything in calculus. Limits, continuity, and the IVT (one of the 5 master theorems!) are tested in nearly every exam. Limit calculations using algebraic manipulation, recognizing indeterminate forms, and understanding asymptotic behavior are core skills. Unit 1 questions appear primarily in MCQ; conceptual understanding here is essential for all later units.

## Big Ideas

1. **A limit describes the behavior of a function NEAR a point, not necessarily AT it.** lim(x→a) f(x) = L means f(x) gets arbitrarily close to L as x gets close to a (but x ≠ a).
2. **Continuity at a point requires three things.** (1) f(a) is defined, (2) lim(x→a) f(x) exists, (3) lim(x→a) f(x) = f(a). Failure of any condition produces discontinuity.
3. **Three types of discontinuity exist.** Removable (hole, can be "fixed"), jump (left and right limits differ), infinite (asymptote at the point).
4. **The Intermediate Value Theorem (IVT) is one of the 5 master theorems.** If f is continuous on [a, b], then f takes every value between f(a) and f(b). Used to prove existence of solutions.
5. **Limits formalize the concept of "approaching."** Calculus is fundamentally about approximation getting better and better — the limit IS the best approximation. Derivatives and integrals are both defined via limits.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Limit notation:** lim(x→a) f(x) = L means "as x approaches a, f(x) approaches L."
- **One-sided limits:**
  - **lim(x→a⁻) f(x) = L** (left-hand limit; x approaches from values less than a).
  - **lim(x→a⁺) f(x) = L** (right-hand limit; x approaches from values greater than a).
- **Two-sided limit exists** ONLY if BOTH one-sided limits exist AND are equal.
- **Properties of limits (assuming all limits exist):**
  - lim(x→a) [f(x) ± g(x)] = lim f(x) ± lim g(x).
  - lim(x→a) [c · f(x)] = c · lim f(x).
  - lim(x→a) [f(x) · g(x)] = lim f(x) · lim g(x).
  - lim(x→a) [f(x)/g(x)] = lim f(x) / lim g(x), provided lim g(x) ≠ 0.
  - lim(x→a) [f(x)]^n = [lim f(x)]^n.
- **Limit techniques:**
  - **Direct substitution:** if f is continuous at a, lim(x→a) f(x) = f(a). Try this first.
  - **Algebraic manipulation:** if direct substitution gives 0/0 or ∞/∞ (indeterminate forms), simplify by:
    - Factoring (especially polynomials).
    - Multiplying by conjugate (for radicals).
    - Common denominator (for complex fractions).
  - **L'Hôpital's Rule** (covered in Unit 4): for 0/0 or ∞/∞, take derivatives of numerator and denominator separately.
  - **Squeeze Theorem:** if f(x) ≤ g(x) ≤ h(x) near a, and lim f(x) = lim h(x) = L, then lim g(x) = L.
- **Continuity at a point** — three conditions ALL must hold:
  - **(1) f(a) is defined** (a is in the domain).
  - **(2) lim(x→a) f(x) exists** (left and right limits agree).
  - **(3) lim(x→a) f(x) = f(a)** (the limit equals the function value).
- **Continuity on an interval:** f is continuous on [a, b] if continuous at every point in (a, b), right-continuous at a, and left-continuous at b.
- **Types of discontinuity:**
  - **Removable (hole):** lim exists but f(a) is undefined or different from limit. Can be "fixed" by redefining f(a). Visually a hole in graph.
  - **Jump:** left and right limits both exist but are different. Two-sided limit doesn't exist. Visually a step or jump.
  - **Infinite (asymptote):** function approaches ±∞. Vertical asymptote.
- **Asymptotes:**
  - **Vertical asymptote at x = a:** lim(x→a) f(x) = ±∞ (from at least one side).
  - **Horizontal asymptote at y = L:** lim(x→±∞) f(x) = L.
  - **Slant (oblique) asymptote:** if degree of numerator is exactly 1 more than denominator, perform polynomial long division.
- **Intermediate Value Theorem (IVT)** [ONE OF THE 5 MASTER THEOREMS]:
  - **Statement:** if f is continuous on [a, b] and N is between f(a) and f(b), then there exists at least one c in (a, b) such that f(c) = N.
  - **Application:** proves the existence of solutions to f(x) = N. If f is continuous and changes sign on an interval, there's at least one zero in that interval.
  - **Conditions:** f must be continuous on [a, b]. WITHOUT continuity, IVT does NOT apply.

### Adds for [4]

- **Why direct substitution sometimes fails.** Limits exist for functions that aren't defined at the point or have indeterminate forms. Examples:
  - lim(x→2) (x²-4)/(x-2): direct substitution gives 0/0. Factor: (x+2)(x-2)/(x-2) = x+2. Cancel: lim = 4.
  - lim(x→0) sin(x)/x: direct substitution gives 0/0. Special limit = 1.
- **Indeterminate forms** that require special techniques:
  - 0/0 (most common).
  - ∞/∞.
  - 0 · ∞.
  - ∞ - ∞.
  - 0⁰, 1^∞, ∞⁰ (rare in AP).
- **Special limits to memorize:**
  - lim(x→0) sin(x)/x = 1.
  - lim(x→0) (1 - cos(x))/x = 0.
  - lim(x→0) (1 - cos(x))/x² = 1/2.
  - lim(x→∞) (1 + 1/x)^x = e.
- **Limits at infinity (rational functions):**
  - **Degree numerator < degree denominator:** lim = 0.
  - **Degree numerator = degree denominator:** lim = ratio of leading coefficients.
  - **Degree numerator > degree denominator:** lim = ±∞ (depends on signs).
- **Limit involving |x|:** the sign matters!
  - lim(x→0) |x|/x doesn't exist (left-hand limit = -1, right-hand = +1; jump).
  - This is why one-sided limits matter.
- **Removable discontinuity removal:**
  - If f has a removable discontinuity at x = a, we can DEFINE f(a) = lim(x→a) f(x) to make f continuous.
- **Jump discontinuity examples:**
  - **Step function** (greatest integer function): jumps at every integer.
  - **Piecewise function** with mismatched left/right limits.
- **Infinite limit examples:**
  - lim(x→0) 1/x² = +∞.
  - lim(x→0⁺) 1/x = +∞ (from right).
  - lim(x→0⁻) 1/x = -∞ (from left).
- **IVT applications:**
  - **Proving a root exists:** if f is continuous and f(a) < 0, f(b) > 0, then by IVT, f has a zero between a and b.
  - **Bisection method:** repeatedly bisect interval to narrow down zero location.
- **Common limit FRQ topics:**
  - **Tabular data:** estimate limit from values in a table.
  - **Graphical:** read limit values from a graph.
  - **Symbolic:** algebraically compute limit.
  - All three formats appear regularly.
- **Continuity criteria visualization.** A function is continuous if you can draw it without lifting your pen. Discontinuities are points where you'd have to lift your pen.

### Adds for [5]

- **The "ε-δ definition" of limit.** Formal definition (rare on AP but important): lim(x→a) f(x) = L if for every ε > 0, there exists δ > 0 such that whenever 0 < |x - a| < δ, then |f(x) - L| < ε. Captures "f gets arbitrarily close to L as x gets close to a."
- **Why limits matter beyond AP.** Limits formalize ideas of:
  - **Instantaneous rate of change** (derivative).
  - **Total accumulation** (integral).
  - **Convergence** of sequences and series (Unit 10 of BC).
  - **Continuity** (essential for IVT, EVT, MVT).
  - Without rigorous limits, calculus would not be a coherent mathematical discipline.
- **The Squeeze Theorem applied to oscillating functions.** Some limits can't be computed directly because the function oscillates wildly. Squeeze Theorem provides a way: if you can bound the function between two functions whose limits agree, the function in between has the same limit. Example: lim(x→0) x·sin(1/x) = 0, because -|x| ≤ x·sin(1/x) ≤ |x| and lim |x| = 0.
- **Why continuity matters for IVT.** The IVT requires continuity. Without it, the function could "jump" past values without taking them. Example: f(x) = 1 for x < 0 and f(x) = -1 for x ≥ 0 has f(-1) = 1 and f(1) = -1, but f never equals 0 (the discontinuity at 0 means it skips that value).
- **Asymptotic analysis and limits.** Behavior at infinity is captured through limits. Horizontal asymptotes are limits. The dominant behavior of polynomials at infinity is determined by leading terms.
- **Discontinuities and integrability.** Functions with limited types of discontinuities (countable) can still be integrated (with adjustments). This connects to Unit 6's integration concepts.
- **Why removable discontinuities have unique characteristics.** They're the "fixable" type — by redefining the function at one point, we eliminate the discontinuity. The other types (jump, infinite) cannot be fixed by redefining a single point.
- **The art of limit computation.** Strategy:
  - Direct substitution first (try this).
  - If indeterminate (0/0, ∞/∞, etc.), apply algebraic manipulation, special limits, or L'Hôpital's Rule.
  - For complex limits: think about the geometry, sketch, or use known results.

## Worked Examples

### Example 1 [3] — Direct substitution and algebraic manipulation

Calculate:
(a) lim(x→3) (x² - 9)/(x - 3)
(b) lim(x→0) (sin(2x))/x

- **(a)** Direct substitution: (9-9)/(3-3) = 0/0 (indeterminate). Factor: (x-3)(x+3)/(x-3) = x+3. Cancel: lim(x→3) (x+3) = 6.
- **(b)** Direct substitution: 0/0 (indeterminate). Use special limit: lim(x→0) sin(2x)/x = lim(x→0) 2·sin(2x)/(2x) = 2·1 = 2.

### Example 2 [3] — Identifying discontinuity types

For each function, determine the type of discontinuity at x = 0:
(a) f(x) = (x² - x)/(x - 1)... wait, at x=0 this is 0/-1 = 0, no discontinuity. Let me use better examples.
(b) f(x) = sin(x)/x for x ≠ 0; f(0) = 0.
(c) f(x) = 1 if x ≥ 0; f(x) = -1 if x < 0.
(d) f(x) = 1/x.

- **(b)** lim(x→0) sin(x)/x = 1, but f(0) = 0. So lim ≠ f(0): REMOVABLE DISCONTINUITY. Can be "fixed" by redefining f(0) = 1.
- **(c)** Left-hand limit = -1; right-hand limit = +1. Two-sided limit doesn't exist: JUMP DISCONTINUITY.
- **(d)** lim(x→0) 1/x = ∞ (or -∞ depending on direction). INFINITE DISCONTINUITY. x = 0 is a vertical asymptote.

### Example 3 [3][4] — Limits at infinity

Compute:
(a) lim(x→∞) (3x² + 5)/(2x² - 7)
(b) lim(x→∞) (5x + 4)/(x² + 1)

- **(a)** Numerator and denominator have SAME degree (both x²). Limit = ratio of leading coefficients = 3/2.
- **(b)** Numerator degree 1 < denominator degree 2. Limit = 0 (denominator grows faster).

### Example 4 [4] — Continuity verification

Determine whether f(x) = (x² - 4)/(x - 2) is continuous at x = 2.

- **Step 1.** Check if f(2) is defined. f(2) = (4-4)/(2-2) = 0/0, UNDEFINED. Not continuous at x = 2.
- **Step 2.** Check if limit exists. Factor: (x-2)(x+2)/(x-2) = x+2 (when x ≠ 2). lim(x→2) (x+2) = 4. Limit EXISTS = 4.
- **Step 3.** This is a REMOVABLE discontinuity. We could fix it by defining f(2) = 4 → continuous.
- **Conclusion:** f is NOT continuous at x = 2 (failure of condition 1: f(2) undefined). It's a removable discontinuity.

### Example 5 [4] — Intermediate Value Theorem application

Show that f(x) = x³ + x - 1 has a root between x = 0 and x = 1.

- **Step 1.** Check continuity. f is a polynomial → continuous everywhere. ✓ for IVT applies.
- **Step 2.** Evaluate endpoints:
  - f(0) = 0 + 0 - 1 = -1.
  - f(1) = 1 + 1 - 1 = 1.
- **Step 3.** f(0) = -1 (negative); f(1) = 1 (positive). N = 0 lies between -1 and 1.
- **Step 4.** By the IVT, since f is continuous on [0, 1] and 0 is between f(0) and f(1), there exists at least one c in (0, 1) such that f(c) = 0.
- **Conclusion:** f has at least one zero (root) in (0, 1).

## Top Traps & Common Errors

1. **Confusing limit with function value.** Limit is about behavior NEAR a point. f(a) is the value AT a. They can differ (removable discontinuity).
2. **Assuming continuity always means easy substitution.** Continuous functions ARE easy to evaluate (direct substitution works). But not all functions are continuous everywhere.
3. **Forgetting one-sided limits.** Two-sided limit exists only if BOTH one-sided limits exist AND agree.
4. **Misapplying IVT.** IVT requires CONTINUITY. Without continuity, IVT does NOT apply (function can skip values).
5. **Confusing horizontal asymptote with vertical asymptote.** Horizontal asymptote: limit as x → ±∞. Vertical asymptote: function approaches ±∞ at a specific x value.
6. **Thinking limits at infinity always exist.** They might not (e.g., lim(x→∞) sin(x) doesn't exist — oscillates).
7. **Forgetting to factor when 0/0 appears.** Direct substitution giving 0/0 is a CLUE to try algebraic manipulation (factoring, conjugate, etc.).
8. **Mismatching the definition of continuity.** All three conditions must hold: (1) f(a) defined, (2) limit exists, (3) limit equals function value.
9. **Treating removable discontinuity as the same as undefined function.** A removable discontinuity has a limit (just not the function value). Can be "fixed" by redefining.
10. **Wrong formula for special limits.** sin(x)/x → 1 (NOT 0) as x → 0. (1 - cos(x))/x → 0 (the limit IS 0).
11. **Forgetting to check applicable theorems.** IVT, EVT, MVT each have specific conditions. Always verify before applying.
12. **Confusing types of discontinuity.** Removable (limit exists), Jump (one-sided limits differ), Infinite (limit is infinite).
13. **Treating ∞ as a number.** Infinity is a CONCEPT, not a number. Cannot do arithmetic with it directly.
14. **Forgetting that limits can be checked from tables or graphs.** Limit doesn't always need algebra — sometimes you read it from data.
15. **Saying "limit is undefined" when actually it's just hard to compute.** Limit is undefined ONLY if it doesn't exist (e.g., oscillates, jumps, etc.). Hard ≠ undefined.

## Rubric-Aware Tactics

**For limit calculations:**
- Try direct substitution first.
- If 0/0 or ∞/∞, simplify (factor, conjugate, special limits, L'Hôpital).
- For limits at infinity, compare degrees (rational functions).

**For continuity verification:**
- Check all three conditions: f(a) defined, limit exists, limit equals f(a).
- Identify type of discontinuity if not continuous.

**For IVT applications:**
- Verify continuity FIRST.
- Identify f(a), f(b), and the value N you're looking for.
- State conclusion: "by IVT, there exists c..."

**For asymptote questions:**
- Vertical: factor denominator, find values where it's 0 (and numerator isn't).
- Horizontal: take limit as x → ±∞.
- Slant: long division if degree numerator = degree denominator + 1.

**For graphical/tabular limits:**
- Look at behavior FROM both sides as x approaches.
- Limit = value if both sides agree.

## "Phrases That Score" — verbatim language for FRQs

1. "lim(x→a) f(x) = L means that as x approaches a (from both sides), f(x) approaches L. The limit describes behavior NEAR a, not necessarily AT a."
2. "f is continuous at x = a if and only if (1) f(a) is defined, (2) lim(x→a) f(x) exists, and (3) lim(x→a) f(x) = f(a). Failure of any condition produces a discontinuity."
3. "The function has a removable discontinuity at x = a because the limit lim(x→a) f(x) = [value] exists, but f(a) is [undefined / different from the limit]. The discontinuity could be fixed by redefining f(a) = [value]."
4. "By the Intermediate Value Theorem, since f is continuous on [a, b] and N is between f(a) and f(b), there exists at least one c in (a, b) such that f(c) = N. Therefore the equation f(x) = N has at least one solution in (a, b)."
5. "For a rational function, the horizontal asymptote depends on degrees: if numerator degree < denominator, asymptote is y = 0; if equal, asymptote is ratio of leading coefficients; if numerator > denominator, no horizontal asymptote (function grows without bound)."
6. "The Squeeze Theorem allows us to evaluate lim(x→a) g(x) by finding functions f(x) ≤ g(x) ≤ h(x) where lim f = lim h = L. Then lim g = L by the Squeeze Theorem."
7. "lim(x→0) sin(x)/x = 1 is a special limit that arises in the derivative of sin(x). It can be proven using the Squeeze Theorem with the inequality cos(x) ≤ sin(x)/x ≤ 1 for small x near 0."

## If You Do Nothing Else for This Unit

*Master direct substitution as the first attempt for any limit, then know when to apply algebraic manipulation (factoring, conjugates, special limits, L'Hôpital). Master the three-part definition of continuity. Master the Intermediate Value Theorem (one of the 5 master theorems) — verify continuity before applying. These foundations support every later unit; weak Unit 1 understanding causes problems throughout the course.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus BC CED 2024-25, Princeton Review AP Calculus BC 2025, Khan Academy AP Calculus BC, Stewart Calculus 8e, Larson Calculus 11e
_difficulty: foundational
_relatedUnits: ap-calculus-bc-unit-2-differentiation-rules, ap-calculus-bc-unit-5-analytical-applications-differentiation
