# AP Calculus AB — Unit 1: Limits and Continuity — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 10–12% of the AP Calculus AB exam (heavier than BC's 4-7% because AB has fewer units total)
- **Sub-topics covered:** same as BC Unit 1 — limits, continuity, asymptotes, IVT.
  - 1.1 Introducing Calculus
  - 1.2-1.9 Limit definitions, calculation techniques, Squeeze Theorem
  - 1.10-1.13 Continuity and discontinuities
  - 1.14-1.15 Asymptotes (vertical and horizontal)
  - 1.16 Intermediate Value Theorem
- **AB vs BC distinction:** Unit 1 content is IDENTICAL between AB and BC. Both exams test the same limit concepts. AB has fewer units overall (8 vs 10), making each unit weigh more.
- **Where this unit appears on the exam:** limits, continuity, IVT (one of the 5 master theorems) appear in essentially every exam. Limit calculations using algebraic manipulation, recognizing indeterminate forms, asymptotic behavior are core skills.

## Big Ideas

1. **A limit describes the behavior of a function NEAR a point, not necessarily AT it.** lim(x→a) f(x) = L means f(x) gets arbitrarily close to L as x approaches a.
2. **Continuity at a point requires three things.** (1) f(a) is defined, (2) lim(x→a) f(x) exists, (3) lim(x→a) f(x) = f(a). Failure of any condition produces discontinuity.
3. **Three types of discontinuity exist.** Removable (hole), jump (left/right limits differ), infinite (asymptote).
4. **The Intermediate Value Theorem (IVT) is one of the 5 master theorems.** If f is continuous on [a, b], then f takes every value between f(a) and f(b).
5. **Limits formalize the concept of "approaching."** Calculus is fundamentally about approximation getting better and better.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Limit notation:** lim(x→a) f(x) = L means "as x approaches a, f(x) approaches L."
- **One-sided limits:** lim(x→a⁻) f(x) (left) and lim(x→a⁺) f(x) (right). Two-sided limit exists only if both one-sided limits exist AND are equal.
- **Properties of limits:**
  - lim [f ± g] = lim f ± lim g.
  - lim [c · f] = c · lim f.
  - lim [f · g] = lim f · lim g.
  - lim [f / g] = lim f / lim g (provided lim g ≠ 0).
- **Limit techniques:**
  - **Direct substitution:** if f is continuous at a, lim(x→a) f(x) = f(a). Try this first.
  - **Algebraic manipulation:** for 0/0 indeterminate forms, factor or use conjugate.
  - **L'Hôpital's Rule** (covered more in Unit 4): for 0/0 or ∞/∞.
  - **Squeeze Theorem:** if f ≤ g ≤ h and lim f = lim h = L, then lim g = L.
- **Continuity at a point** — three conditions ALL must hold:
  - (1) f(a) is defined.
  - (2) lim(x→a) f(x) exists.
  - (3) lim(x→a) f(x) = f(a).
- **Types of discontinuity:**
  - **Removable (hole):** lim exists but f(a) undefined or different from lim. Visually a hole.
  - **Jump:** left and right limits both exist but differ. Visually a step.
  - **Infinite (asymptote):** function approaches ±∞.
- **Asymptotes:**
  - **Vertical:** at x = a if lim(x→a) f(x) = ±∞.
  - **Horizontal:** at y = L if lim(x→±∞) f(x) = L.
- **Limits at infinity (rational functions):**
  - Degree numerator < degree denominator → lim = 0.
  - Degree numerator = degree denominator → lim = ratio of leading coefficients.
  - Degree numerator > degree denominator → lim = ±∞.
- **Special limits to memorize:**
  - lim(x→0) sin(x)/x = 1.
  - lim(x→0) (1 - cos(x))/x = 0.
- **Intermediate Value Theorem (IVT)** [5 MASTER THEOREMS]:
  - **Statement:** if f is continuous on [a, b] and N is between f(a) and f(b), then there exists at least one c in (a, b) such that f(c) = N.
  - **Application:** proves existence of solutions. If f is continuous and changes sign, there's at least one zero.

### Adds for [4]

- **Why direct substitution fails sometimes.** Indeterminate forms (0/0, ∞/∞) require techniques like factoring, conjugates, or L'Hôpital.
- **Indeterminate forms:**
  - 0/0 (most common).
  - ∞/∞.
  - 0 · ∞.
  - ∞ - ∞.
- **One-sided limits with absolute values.** lim(x→0) |x|/x doesn't exist (left = -1, right = +1).
- **Jump discontinuity examples:** step functions, piecewise functions with mismatched limits.
- **Removable discontinuity removal:** can be "fixed" by redefining f(a) to equal the limit.
- **IVT application to root-finding:** if f(a) < 0 and f(b) > 0 with f continuous, there's at least one zero in (a, b).
- **Common limit FRQ topics:** tabular, graphical, and symbolic limit interpretations all appear.

### Adds for [5]

- **Why limits matter beyond AP.** Limits formalize:
  - Instantaneous rate of change (derivative).
  - Total accumulation (integral).
  - Convergence (sequences/series — BC only).
  - Continuity (essential for IVT, EVT, MVT).
- **Squeeze Theorem applied to oscillating functions.** Some limits (like x·sin(1/x) as x→0) require Squeeze Theorem because the function oscillates.
- **Why continuity matters for IVT.** Without continuity, the function could "jump" past values. IVT REQUIRES continuity.
- **Removable vs other discontinuities.** Removable can be "fixed" by redefining one point. Jump and infinite cannot.

## Worked Examples

### Example 1 [3] — Direct substitution and algebraic manipulation

(a) lim(x→3) (x² - 9)/(x - 3)
(b) lim(x→0) sin(2x)/x

- **(a)** Direct substitution: 0/0 (indeterminate). Factor: (x-3)(x+3)/(x-3) → x+3. lim = 6.
- **(b)** Direct substitution: 0/0. Use special limit: lim sin(2x)/x = lim 2·sin(2x)/(2x) = 2·1 = 2.

### Example 2 [3] — Identifying discontinuity types

(a) f(x) = (x²-1)/(x-1) at x = 1: lim = 2 but f(1) undefined. REMOVABLE.
(b) f(x) = 1 if x ≥ 0; -1 if x < 0: at x = 0, left = -1, right = 1. JUMP.
(c) f(x) = 1/x at x = 0: lim = ∞. INFINITE.

### Example 3 [4] — IVT application

Show f(x) = x³ + x - 1 has a root between x = 0 and x = 1.

- f is polynomial → continuous.
- f(0) = -1; f(1) = 1.
- N = 0 lies between -1 and 1.
- By IVT, there exists c in (0, 1) such that f(c) = 0.

### Example 4 [4] — Continuity verification

Determine whether f(x) = (x²-4)/(x-2) is continuous at x = 2.

- f(2) is UNDEFINED (0/0). Not continuous.
- However, lim(x→2) (x-2)(x+2)/(x-2) = lim(x→2) (x+2) = 4.
- This is a REMOVABLE discontinuity.

### Example 5 [4] — Limits at infinity

(a) lim(x→∞) (3x² + 5)/(2x² - 7) = 3/2 (same degree, ratio of leading coefficients).
(b) lim(x→∞) (5x + 4)/(x² + 1) = 0 (numerator degree < denominator degree).

## Top Traps & Common Errors

1. **Confusing limit with function value.** Limit is about behavior NEAR a point; f(a) is the value AT a.
2. **Forgetting one-sided limits.** Two-sided limit exists only if both one-sided limits exist AND agree.
3. **Misapplying IVT.** Requires CONTINUITY. Without it, IVT does NOT apply.
4. **Using log instead of −log for pH-style limits.** Direct substitution first; then algebraic manipulation if needed.
5. **Confusing horizontal and vertical asymptote.** Horizontal: lim as x → ±∞. Vertical: function approaches ±∞ at specific x.
6. **Forgetting to check applicable theorems.** IVT requires continuity.
7. **Misidentifying types of discontinuity.** Removable (limit exists), jump (one-sided differ), infinite (limit is infinite).

## Rubric-Aware Tactics

**For limit calculations:** try direct substitution first; if 0/0 or ∞/∞, use algebraic manipulation, special limits, or L'Hôpital.

**For continuity verification:** check all three conditions.

**For IVT applications:** verify continuity FIRST.

**For asymptote questions:** vertical (denominator zero, numerator not), horizontal (limits at ±∞).

## "Phrases That Score" — verbatim language for FRQs

1. "lim(x→a) f(x) = L means as x approaches a, f(x) approaches L. Limit describes behavior NEAR, not necessarily AT, the point."
2. "f is continuous at x = a if and only if (1) f(a) is defined, (2) lim(x→a) f(x) exists, and (3) lim(x→a) f(x) = f(a)."
3. "By the IVT, since f is continuous on [a, b] and N is between f(a) and f(b), there exists at least one c in (a, b) such that f(c) = N."
4. "For a rational function, the horizontal asymptote depends on degrees: numerator degree < denominator → y = 0; equal → ratio of leading coefficients; numerator > denominator → no horizontal asymptote."
5. "lim(x→0) sin(x)/x = 1 is a special limit derived from the geometric definition of sine."

## If You Do Nothing Else for This Unit

*Master direct substitution as first attempt for any limit, then know when to apply algebraic manipulation. Master continuity (three-part definition). Master IVT — verify continuity before applying. These foundations underpin all later units.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus AB CED 2024-25, Princeton Review AP Calculus AB 2025, Khan Academy AP Calculus AB, Stewart Calculus 8e
_difficulty: foundational
_relatedUnits: ap-calculus-ab-unit-2-differentiation-rules, ap-calculus-ab-unit-5-analytical-applications-differentiation, ap-calculus-bc-unit-1-limits-continuity
