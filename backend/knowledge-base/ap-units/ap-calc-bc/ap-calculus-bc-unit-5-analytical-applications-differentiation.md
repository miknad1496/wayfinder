# AP Calculus BC — Unit 5: Analytical Applications of Differentiation — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 8–11% of the AP Calculus BC exam
- **Sub-topics covered:**
  - 5.1 Using the Mean Value Theorem (MVT)
  - 5.2 Extreme Value Theorem (EVT), Global vs Local Extrema
  - 5.3 Determining Intervals on Which a Function is Increasing or Decreasing
  - 5.4 Using the First Derivative Test to Determine Relative (Local) Extrema
  - 5.5 Using the Candidates Test to Determine Absolute (Global) Extrema
  - 5.6 Determining Concavity of Functions over Their Domains
  - 5.7 Using the Second Derivative Test to Determine Extrema
  - 5.8 Sketching Graphs of Functions and Their Derivatives
  - 5.9 Connecting a Function, Its First Derivative, and Its Second Derivative
  - 5.10 Introduction to Optimization Problems
  - 5.11 Solving Optimization Problems
  - 5.12 Exploring Behaviors of Implicit Relations
- **Where this unit appears on the exam:** Unit 5 contains the 5 master theorems (MVT, EVT, IVT). Most prominent FRQ topics: critical points, extrema, intervals of increase/decrease, concavity, inflection points, optimization problems. Connecting graphs of f, f', and f'' is a classic FRQ.

## Big Ideas

1. **The 5 master theorems anchor analytical calculus.** IVT (Unit 1), Extreme Value Theorem (EVT), Mean Value Theorem (MVT), FTC1 and FTC2 (Unit 6). Each requires continuity (and EVT/MVT also require differentiability where applicable).
2. **Critical points are where derivative is zero or undefined.** These are CANDIDATES for relative extrema. Use first or second derivative test to determine which are actually maxima or minima.
3. **The derivative tells us about increasing/decreasing.** f' > 0 → f is increasing. f' < 0 → f is decreasing. f' = 0 → critical point (potential extremum).
4. **The second derivative tells us about concavity.** f'' > 0 → f is concave UP (smiley face shape, slope increasing). f'' < 0 → concave DOWN (frown shape). f'' = 0 may be inflection point (where concavity changes).
5. **Optimization finds extreme values within constraints.** Identify the function to optimize, the constraint, set up equation in one variable, find critical points, check endpoints.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Mean Value Theorem (MVT)** [ONE OF THE 5 MASTER THEOREMS]:
  - **Conditions:** f is continuous on [a, b] AND differentiable on (a, b).
  - **Statement:** there exists c in (a, b) such that f'(c) = (f(b) - f(a))/(b - a).
  - **Geometric meaning:** somewhere in the interval, the instantaneous rate of change (slope of tangent) equals the average rate of change (slope of secant).
- **Extreme Value Theorem (EVT)** [ONE OF THE 5 MASTER THEOREMS]:
  - **Conditions:** f is CONTINUOUS on a CLOSED interval [a, b].
  - **Statement:** f attains both an absolute maximum and absolute minimum on [a, b].
  - **Why both conditions matter:** without continuity, function could "skip" the extreme value. Without closed interval, endpoints might not be attained.
- **Critical points:** where f'(x) = 0 OR f'(x) is undefined.
  - These are CANDIDATES for relative extrema, not guaranteed extrema.
  - Need further analysis (first or second derivative test) to determine.
- **Increasing/decreasing test:**
  - f' > 0 on interval → f is INCREASING on that interval.
  - f' < 0 on interval → f is DECREASING.
- **First Derivative Test for local extrema:**
  - At a critical point c:
    - If f'(x) changes from POSITIVE to NEGATIVE → relative MAXIMUM at c.
    - If f'(x) changes from NEGATIVE to POSITIVE → relative MINIMUM at c.
    - If f'(x) doesn't change sign → NEITHER (saddle point, inflection point, etc.).
- **Second Derivative Test for local extrema:**
  - At a critical point c (where f'(c) = 0):
    - If f''(c) > 0 → relative MINIMUM at c.
    - If f''(c) < 0 → relative MAXIMUM at c.
    - If f''(c) = 0 → INCONCLUSIVE; use first derivative test.
- **Concavity:**
  - f''(x) > 0 → CONCAVE UP (curve "holds water").
  - f''(x) < 0 → CONCAVE DOWN (curve "doesn't hold water").
- **Inflection points:** where concavity changes (f'' changes sign).
  - **Test:** find where f'' = 0 or undefined; check sign of f'' on both sides.
  - If sign changes → inflection point.
  - If sign doesn't change → NOT an inflection point (just a flat spot in concavity).
- **Candidates Test for ABSOLUTE extrema on [a, b]:**
  - Find all critical points in (a, b).
  - Evaluate f at each critical point AND at the endpoints a and b.
  - The largest value = absolute maximum.
  - The smallest value = absolute minimum.
- **Connecting f, f', f'':**
  - **f vs f':** if f' > 0, f is increasing; if f' < 0, f is decreasing.
  - **f vs f'':** if f'' > 0, f is concave up; if f'' < 0, f is concave down.
  - **f' vs f'':** if f'' > 0, f' is increasing; if f'' < 0, f' is decreasing.
- **Optimization problem strategy:**
  - **(1) Identify** what's being maximized or minimized.
  - **(2) Identify** the constraints.
  - **(3) Express** the quantity in terms of one variable using the constraint.
  - **(4) Find** the critical points.
  - **(5) Determine** which is the optimum.
  - **(6) Check** endpoints if domain is closed.
  - **(7) Answer** in context with units.

### Adds for [4]

- **Why MVT is so important.** It connects average rate of change (slope of secant) to instantaneous rate of change (slope of tangent). Used to prove many other results in calculus, including:
  - **Rolle's Theorem** (special case of MVT where f(a) = f(b), so the slope is 0).
  - **First derivative test for monotonicity.**
  - **The Fundamental Theorem of Calculus** (Unit 6).
- **Why EVT requires CLOSED interval and CONTINUITY.** Without closed interval, the maximum may approach but not attain a value (e.g., f(x) = 1/x on (0, 1) has no maximum). Without continuity, function could skip values. Both conditions guarantee attainment of extrema.
- **Local vs absolute extrema:**
  - **Local (relative) maximum:** f(c) is the largest value in some neighborhood of c.
  - **Local minimum:** f(c) is the smallest value in some neighborhood of c.
  - **Absolute (global) maximum:** f(c) is the LARGEST value across the entire interval.
  - **Absolute minimum:** f(c) is the SMALLEST value across the entire interval.
- **First derivative test interpretation:** the SIGN CHANGE of f' tells you about the behavior:
  - + to - → max (going from increasing to decreasing).
  - - to + → min (going from decreasing to increasing).
  - + to + or - to - → no extremum (function continues in same direction).
- **Common optimization scenarios:**
  - **Minimize material to make a box of given volume.**
  - **Maximize area enclosed by fence of given length.**
  - **Minimize cost / maximize profit.**
  - **Find shortest distance from point to curve.**
  - **Minimize time of travel.**
- **Sketching f from graph of f':**
  - Where f' is positive → f is increasing.
  - Where f' is negative → f is decreasing.
  - Where f' = 0 → critical points of f.
  - Where f' has its extrema → inflection points of f.
- **Sketching f' from graph of f:**
  - Slope of f at each point gives value of f' at that point.
  - Maxima/minima of f → zeros of f'.
  - Steeply increasing f → large positive f'.
- **Concavity from f vs f'':**
  - f concave up → tangent lines below curve.
  - f concave down → tangent lines above curve.
  - Inflection points are where the curve transitions.

### Adds for [5]

- **Why the 5 master theorems are foundational.** They provide formal guarantees:
  - **IVT (Unit 1):** continuous functions attain intermediate values.
  - **EVT:** continuous functions on closed intervals attain extreme values.
  - **MVT:** differentiable functions have a tangent that matches the average secant.
  - **FTC1, FTC2 (Unit 6):** integration and differentiation are inverse operations.
  - Without these theorems, calculus's logical structure would crumble.
- **Critical thinking about extrema.** Local extrema can be at interior critical points OR at endpoints (if interval is closed). Always check both.
- **Why second derivative test sometimes fails.** When f''(c) = 0, the test is inconclusive. f could have a maximum, minimum, or neither (e.g., y = x³ has f''(0) = 0 but no extremum at x = 0). Use first derivative test in such cases.
- **Optimization in context.** Real-world optimization problems require setting up the function correctly, identifying the constraint, and answering in the context (with appropriate units). The mathematical framework is consistent, but the setup varies dramatically.
- **Concavity and economic interpretation.** In economics, concavity of utility functions reflects diminishing returns. Concavity of cost functions reflects economies of scale. Concavity changes (inflection points) often have economic significance.
- **The "shape" of a derivative.** A graph of f' can be sketched from a graph of f by tracing slopes. Conversely, the graph of f can be reconstructed (up to a constant) from the graph of f' by integrating. This bidirectional relationship is key to understanding derivatives geometrically.

## Worked Examples

### Example 1 [3] — MVT application

For f(x) = x², verify the conclusion of MVT on [1, 3].

- **Step 1.** Check conditions: f is continuous everywhere ✓; f is differentiable everywhere ✓.
- **Step 2.** Compute average rate of change: (f(3) - f(1))/(3 - 1) = (9 - 1)/2 = 4.
- **Step 3.** MVT guarantees c in (1, 3) such that f'(c) = 4.
- **Step 4.** Solve: f'(x) = 2x = 4 → x = 2.
- **Step 5.** Verify: c = 2 is in (1, 3) ✓.
- **Conclusion:** by MVT, c = 2 satisfies the conclusion. The instantaneous rate of change at x = 2 (which is 4) equals the average rate of change over [1, 3] (which is also 4).

### Example 2 [3][4] — Finding extrema

Find the local and absolute extrema of f(x) = x³ - 3x² + 4 on [-1, 4].

- **Step 1.** Find critical points: f'(x) = 3x² - 6x = 3x(x - 2). Critical points at x = 0 and x = 2.
- **Step 2.** Apply Candidates Test (evaluate at critical points and endpoints):
  - f(-1) = -1 - 3 + 4 = 0.
  - f(0) = 4.
  - f(2) = 8 - 12 + 4 = 0.
  - f(4) = 64 - 48 + 4 = 20.
- **Step 3.** Determine extrema:
  - **Absolute maximum:** f(4) = 20 (at endpoint x = 4).
  - **Absolute minimum:** f(-1) = 0 = f(2) (tie at two points).
  - **Local maximum:** f(0) = 4 (since f' changes from + to - at x = 0).
  - **Local minimum:** f(2) = 0 (since f' changes from - to + at x = 2).

### Example 3 [3] — Concavity and inflection points

For f(x) = x³ - 6x² + 9x + 1, find intervals of concavity and inflection points.

- **Step 1.** f''(x) = 6x - 12.
- **Step 2.** f''(x) = 0 → x = 2.
- **Step 3.** Test concavity:
  - For x < 2: f''(x) < 0 → CONCAVE DOWN.
  - For x > 2: f''(x) > 0 → CONCAVE UP.
- **Step 4.** Concavity changes at x = 2, so inflection point at x = 2.
- **Step 5.** f(2) = 8 - 24 + 18 + 1 = 3. Inflection point: (2, 3).

### Example 4 [4] — Optimization (box problem)

A box with a square base and open top has volume 32 cubic feet. Find the dimensions that minimize the surface area.

- **Step 1.** Variables: x = side of square base; h = height.
- **Step 2.** Constraint: V = x² · h = 32 → h = 32/x².
- **Step 3.** Surface area: S = x² (base) + 4xh (4 sides).
  - S = x² + 4x(32/x²) = x² + 128/x.
- **Step 4.** Minimize: dS/dx = 2x - 128/x² = 0 → 2x³ = 128 → x³ = 64 → x = 4.
- **Step 5.** h = 32/16 = 2.
- **Step 6.** Verify with second derivative: d²S/dx² = 2 + 256/x³ > 0, so x = 4 gives MINIMUM.
- **Step 7.** Surface area: S = 16 + 32 = 48 sq ft.
- **Answer:** dimensions 4 × 4 × 2 minimize surface area to 48 sq ft.

### Example 5 [4][5] — Connecting f, f', f''

Given the graph of f' (NOT f), describe the behavior of f.

- **Where f' > 0:** f is increasing.
- **Where f' < 0:** f is decreasing.
- **Where f' = 0 with sign change:** f has local extremum.
- **Where f' has its own maximum:** f has inflection point (where concavity changes from up to down).
- **Where f' has its own minimum:** f has inflection point (where concavity changes from down to up).
- **Slope of f' = f''.** So:
  - Where f' is increasing: f'' > 0, so f is concave UP.
  - Where f' is decreasing: f'' < 0, so f is concave DOWN.

## Top Traps & Common Errors

1. **Confusing MVT and EVT conditions.** MVT requires continuity AND differentiability. EVT requires continuity on closed interval.
2. **Critical point ≠ extremum.** Critical points are CANDIDATES; need to determine if they're actually max or min.
3. **Forgetting endpoint check in Candidates Test.** Absolute extrema can occur at endpoints; always evaluate at endpoints.
4. **Misapplying second derivative test.** Only works when f'(c) = 0 AND f''(c) ≠ 0.
5. **Confusing increasing/decreasing of f and f'.** f increasing means f' > 0. f' increasing means f'' > 0.
6. **Wrong concavity rules.** Concave UP = f'' > 0 = "smiley face" shape = tangent lines below curve.
7. **Inflection point requires sign change.** f'' = 0 alone isn't enough; concavity must actually change.
8. **Skipping context/units in optimization.** Real-world problems need answers with appropriate context and units.
9. **Treating local extrema as global.** Local maximum is just for some neighborhood; global maximum is over the entire interval.
10. **Forgetting candidates test endpoints.** Always include endpoints in the comparison.
11. **Wrong setup in optimization.** Identify the function being optimized AND the constraint clearly.
12. **Misapplying MVT to non-continuous or non-differentiable functions.** MVT requires both conditions.
13. **Confusing relative and absolute extrema.** Relative = local. Absolute = global.
14. **Using second derivative test when first is needed.** When second derivative test is inconclusive (f''(c) = 0), use first derivative test.
15. **Forgetting to include critical points where f' is undefined.** Not just where f' = 0; also where f' doesn't exist.

## Rubric-Aware Tactics

**For MVT problems:**
- Verify both conditions (continuity, differentiability).
- Compute average rate of change.
- Find c such that f'(c) = average rate of change.

**For extrema problems:**
- Find critical points (where f' = 0 or undefined).
- Use first derivative test (sign analysis) or second derivative test.
- For absolute extrema, also check endpoints.

**For concavity / inflection point problems:**
- Find f''.
- Find where f'' = 0 or undefined.
- Test sign of f'' on each side.
- Inflection point ONLY if concavity changes.

**For optimization:**
- Identify what's being optimized.
- Express in terms of one variable using constraint.
- Take derivative; find critical points.
- Verify max/min using first or second derivative test.
- Provide answer in context with units.

**For graph connections:**
- Use sign of f' to determine increase/decrease of f.
- Use sign of f'' to determine concavity of f.
- Critical points of f' are inflection points of f.

## "Phrases That Score" — verbatim language for FRQs

1. "By the Mean Value Theorem, since f is continuous on [a, b] and differentiable on (a, b), there exists c in (a, b) such that f'(c) = (f(b) - f(a))/(b - a). The instantaneous rate of change at c equals the average rate of change over [a, b]."
2. "By the Extreme Value Theorem, since f is continuous on the closed interval [a, b], f attains both an absolute maximum and absolute minimum on [a, b]."
3. "Critical points of f occur where f'(x) = 0 or f'(x) is undefined. At a critical point c, applying the First Derivative Test: if f' changes from positive to negative, c is a relative maximum; if f' changes from negative to positive, c is a relative minimum."
4. "Using the Candidates Test for absolute extrema on [a, b]: evaluate f at all critical points in (a, b) and at the endpoints a and b. The largest value is the absolute maximum; the smallest is the absolute minimum."
5. "f is concave up where f''(x) > 0 (curve 'holds water', tangent lines below curve). f is concave down where f''(x) < 0 (curve 'doesn't hold water', tangent lines above curve). Inflection points occur where concavity changes (f'' changes sign)."
6. "By the Second Derivative Test, if f'(c) = 0 and f''(c) > 0, then c is a relative minimum. If f'(c) = 0 and f''(c) < 0, c is a relative maximum. If f''(c) = 0, the test is inconclusive."
7. "For optimization problems, identify the function to optimize and the constraint, express the quantity in terms of one variable, take the derivative and find critical points, verify max/min using a derivative test, and provide the answer in context with appropriate units."

## If You Do Nothing Else for This Unit

*Master the 5 master theorems (IVT, EVT, MVT, FTC1, FTC2 — three are in this unit). Master the connection between f, f', and f'' for finding extrema and concavity. Master optimization problems — they appear regularly as FRQs. The Candidates Test is the most reliable method for absolute extrema. These analytical applications appear constantly throughout calculus.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus BC CED 2024-25, Princeton Review AP Calculus BC 2025, Khan Academy AP Calculus BC, Stewart Calculus 8e, Larson Calculus 11e
_difficulty: foundational
_relatedUnits: ap-calculus-bc-unit-2-differentiation-rules, ap-calculus-bc-unit-4-contextual-applications-differentiation, ap-calculus-bc-unit-6-integration-accumulation
