# AP Calculus AB — Unit 5: Analytical Applications of Differentiation — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 15–18% of the AP Calculus AB exam — heaviest unit
- **AB vs BC distinction:** Identical content to BC Unit 5.
- **Sub-topics covered:** Mean Value Theorem (MVT); Extreme Value Theorem (EVT); intervals of increase/decrease; First and Second Derivative Tests; concavity and inflection points; sketching graphs of f, f', f''; optimization; behaviors of implicit relations.

## Big Ideas

1. **The 5 master theorems anchor analytical calculus.** IVT (Unit 1), Extreme Value Theorem (EVT), Mean Value Theorem (MVT), FTC1 and FTC2 (Unit 6).
2. **Critical points are where derivative is zero or undefined.** CANDIDATES for relative extrema.
3. **The derivative tells us about increasing/decreasing.** f' > 0 → increasing. f' < 0 → decreasing.
4. **The second derivative tells us about concavity.** f'' > 0 → concave UP. f'' < 0 → concave DOWN.
5. **Optimization finds extreme values within constraints.** Identify function, constraint, set up in one variable, find critical points.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Mean Value Theorem (MVT)** [5 MASTER THEOREMS]:
  - Conditions: f continuous on [a, b] AND differentiable on (a, b).
  - Statement: there exists c in (a, b) such that f'(c) = (f(b) - f(a))/(b - a).
  - Geometric: somewhere, instantaneous rate equals average rate.
- **Extreme Value Theorem (EVT)** [5 MASTER THEOREMS]:
  - Conditions: f continuous on closed interval [a, b].
  - Statement: f attains both absolute maximum and minimum on [a, b].
- **Critical points:** where f'(x) = 0 OR f'(x) is undefined. Candidates for extrema.
- **Increasing/decreasing test:**
  - f' > 0 → increasing.
  - f' < 0 → decreasing.
- **First Derivative Test:**
  - At critical point c: f' changes + → - means relative MAX.
  - f' changes - → + means relative MIN.
  - No sign change means NEITHER.
- **Second Derivative Test:**
  - f'(c) = 0, f''(c) > 0 → relative MIN.
  - f'(c) = 0, f''(c) < 0 → relative MAX.
  - f''(c) = 0 → INCONCLUSIVE.
- **Concavity:**
  - f'' > 0 → concave UP.
  - f'' < 0 → concave DOWN.
- **Inflection points:** where concavity changes (f'' changes sign).
- **Candidates Test for absolute extrema on [a, b]:**
  - Find critical points in (a, b).
  - Evaluate f at critical points AND endpoints.
  - Largest = absolute max. Smallest = absolute min.
- **Optimization:**
  - Identify function to optimize.
  - Identify constraint.
  - Express in terms of one variable.
  - Find critical points.
  - Use derivative tests.
  - Include endpoints if domain is closed.

### Adds for [4]

- **Why MVT is important.** Connects average rate (secant slope) to instantaneous rate (tangent slope). Used to prove other results.
- **Local vs absolute extrema:**
  - Local: largest in some neighborhood.
  - Absolute: largest across entire interval.
- **First derivative test interpretation:** sign change of f' tells you behavior:
  - + to - → max.
  - - to + → min.
  - No change → no extremum.
- **Common optimization scenarios:** minimize material for box; maximize area enclosed by fence; minimize cost; find shortest distance.
- **Sketching f from f' graph:** where f' positive, f increasing; etc.

### Adds for [5]

- **The 5 master theorems are foundational.** They provide formal guarantees about continuous functions.
- **Critical thinking about extrema.** Local extrema can be at interior critical points OR endpoints (if interval closed).
- **Why second derivative test sometimes fails.** When f''(c) = 0, inconclusive. Use first derivative test instead.
- **Concavity and economic interpretation.** Diminishing returns, economies of scale.
- **The shape of a derivative.** Graph of f' can be sketched from f by tracing slopes.

## Worked Examples

### Example 1 [3] — MVT application

For f(x) = x² on [1, 3]: average rate = (9-1)/2 = 4. Set f'(c) = 4: 2c = 4 → c = 2. ✓

### Example 2 [3] — Finding extrema

f(x) = x³ - 3x² + 4 on [-1, 4].
- f'(x) = 3x² - 6x = 3x(x - 2). Critical points: x = 0, x = 2.
- f(-1) = 0, f(0) = 4, f(2) = 0, f(4) = 20.
- Absolute max: f(4) = 20. Absolute min: 0 (at x = -1 and x = 2).
- Local max: f(0) = 4. Local min: f(2) = 0.

### Example 3 [3] — Concavity and inflection points

f(x) = x³ - 6x² + 9x + 1.
- f''(x) = 6x - 12. f''(2) = 0.
- f''(x) < 0 for x < 2 (concave DOWN); f''(x) > 0 for x > 2 (concave UP).
- Inflection point at x = 2: (2, 3).

### Example 4 [4] — Optimization (box)

Box with square base, open top, volume 32 ft³. Minimize surface area.
- V = x²·h = 32 → h = 32/x².
- S = x² + 4xh = x² + 128/x.
- dS/dx = 2x - 128/x² = 0 → x³ = 64 → x = 4. h = 2.
- S = 16 + 32 = 48 ft².

### Example 5 [4] — Connecting f, f', f''

Given graph of f', describe behavior of f.
- Where f' > 0: f is increasing.
- Where f' < 0: f is decreasing.
- Where f' = 0 with sign change: f has extremum.
- Where f' has its own max/min: f has inflection point (concavity changes).

## Top Traps & Common Errors

1. **Confusing MVT and EVT conditions.** MVT: continuity + differentiability. EVT: continuity on closed interval.
2. **Critical point ≠ extremum.** Critical points are CANDIDATES.
3. **Forgetting endpoint check in Candidates Test.** Absolute extrema can occur at endpoints.
4. **Misapplying Second Derivative Test.** Only when f'(c) = 0 AND f''(c) ≠ 0.
5. **Confusing increasing/decreasing of f and f'.** f' > 0 → f increasing; f'' > 0 → f' increasing.
6. **Wrong concavity rules.** Concave UP = f'' > 0.
7. **Inflection point requires sign change of f''.** Just f'' = 0 isn't enough.
8. **Skipping context/units in optimization.**

## Rubric-Aware Tactics

**For MVT:** verify both conditions; compute average rate; find c.

**For extrema:** find critical points; use first/second derivative test; for absolute, also check endpoints.

**For concavity/inflection:** find f''; determine signs; identify changes.

**For optimization:** identify function and constraint; express in one variable; find critical point; verify max/min; include units.

## "Phrases That Score" — verbatim language for FRQs

1. "By Mean Value Theorem, since f is continuous on [a, b] and differentiable on (a, b), there exists c in (a, b) such that f'(c) = (f(b) - f(a))/(b - a)."
2. "By Extreme Value Theorem, since f is continuous on closed interval [a, b], f attains both absolute maximum and minimum on [a, b]."
3. "Critical points occur where f'(x) = 0 or f'(x) is undefined. By First Derivative Test: f' changes + → - means relative MAX; - → + means relative MIN."
4. "Using Candidates Test: evaluate f at all critical points in (a, b) and at endpoints a and b. Largest is absolute max; smallest is absolute min."
5. "f is concave UP where f''(x) > 0; concave DOWN where f''(x) < 0. Inflection points occur where concavity changes (f'' changes sign)."

## If You Do Nothing Else for This Unit

*Master the 5 master theorems (IVT, EVT, MVT). Master the connection between f, f', and f''. Master optimization problems. The Candidates Test is most reliable for absolute extrema.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus AB CED 2024-25, Princeton Review AP Calculus AB 2025, Khan Academy AP Calculus AB, Stewart Calculus 8e
_difficulty: foundational
_relatedUnits: ap-calculus-ab-unit-2-differentiation-rules, ap-calculus-ab-unit-4-contextual-applications-differentiation, ap-calculus-ab-unit-6-integration-accumulation, ap-calculus-bc-unit-5-analytical-applications-differentiation
