# AP Calculus AB — Unit 4: Contextual Applications of Differentiation — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 10–15% of the AP Calculus AB exam
- **AB vs BC distinction:** Identical content to BC Unit 4.
- **Sub-topics covered:** interpreting derivative in context; straight-line motion (position, velocity, acceleration); related rates; linear approximation; L'Hôpital's Rule.

## Big Ideas

1. **Derivatives in context measure rates of change.** Position → velocity → acceleration. Always include UNITS and CONTEXT.
2. **Related rates problems connect rates through equations.** Differentiate implicitly with respect to time.
3. **L'Hôpital's Rule resolves indeterminate forms 0/0 or ∞/∞.**
4. **Linear approximation uses tangent line.** f(x) ≈ f(a) + f'(a)·(x - a).
5. **Position, velocity, acceleration form a chain of derivatives.** v = s', a = v' = s''.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Derivative as rate of change in context:**
  - Always include units (m/s for velocity, etc.).
  - Examples: motion (position → velocity), economics (cost → marginal cost), biology (population → rate of population change).
- **Straight-line motion:**
  - **Position:** s(t).
  - **Velocity:** v(t) = s'(t). Has direction (positive or negative).
  - **Acceleration:** a(t) = v'(t) = s''(t).
  - **Speed:** |v(t)|.
  - **At rest:** v(t) = 0.
  - **Speeding up:** v(t) and a(t) have SAME sign.
  - **Slowing down:** v(t) and a(t) have OPPOSITE signs.
- **Related Rates problems:**
  - Identify quantities that change with time. Find equation relating them.
  - Differentiate with respect to TIME (Chain Rule for each variable).
  - Substitute known values; solve for unknown rate.
  - Include UNITS.
- **L'Hôpital's Rule:**
  - For indeterminate forms 0/0 or ∞/∞.
  - lim(x→a) f(x)/g(x) = lim(x→a) f'(x)/g'(x), provided latter limit exists.
  - May apply repeatedly if still indeterminate.
- **Linear approximation (linearization):**
  - L(x) = f(a) + f'(a)·(x - a).
  - Approximates f(x) for x close to a (uses tangent line).

### Adds for [4]

- **Related Rates worked example (sphere):**
  - Sphere's radius increasing at 2 cm/s. How fast is volume increasing when radius = 5 cm?
  - V = (4/3)πr³.
  - dV/dt = 4πr² · (dr/dt).
  - dV/dt = 4π(25)(2) = 200π cm³/s.
- **Common related rates scenarios:**
  - Inflating sphere/cylinder (relate volume and radius).
  - Ladder sliding down wall (Pythagorean Theorem).
  - Two cars approaching intersection.
  - Cone-shaped tank (similar triangles).
- **L'Hôpital for non-0/0 forms** (after manipulation):
  - 0 · ∞: rewrite as 0/0 or ∞/∞.
  - ∞ - ∞: find common denominator.
- **Linear approximation example:**
  - Estimate √4.1 using a = 4.
  - f(x) = √x. f(4) = 2. f'(x) = 1/(2√x). f'(4) = 1/4.
  - L(x) = 2 + (1/4)(x - 4).
  - L(4.1) = 2.025. (Actual: ≈ 2.0248.)
- **Marginal cost / revenue:** derivative of cost / revenue functions.

### Adds for [5]

- **Why related rates are foundational.** Many real-world phenomena involve multiple changing quantities.
- **Chain Rule's role in related rates.** Every variable depending on t requires Chain Rule (multiply by dy/dt, dr/dt, etc.).
- **L'Hôpital's underlying principle.** Comes from linearization concept.
- **Connection to Newton's Method.** Newton's Method uses linearization to find roots iteratively.

## Worked Examples

### Example 1 [3] — Position, velocity, acceleration

s(t) = t³ - 6t² + 9t for t in seconds, position in meters.
- v(t) = 3t² - 12t + 9. v(2) = -3 m/s. (Negative — moving in negative direction.)
- a(t) = 6t - 12. a(2) = 0 m/s².

### Example 2 [3] — Related rates (sphere)

Spherical balloon inflated; radius increases at 2 cm/sec. How fast is surface area increasing when r = 5 cm?
- S = 4πr².
- dS/dt = 8πr · (dr/dt) = 8π(5)(2) = 80π cm²/sec.

### Example 3 [4] — Related rates (ladder)

10-foot ladder slides down wall. Bottom slides away at 1 ft/sec. How fast is top sliding down when bottom is 6 ft from wall?
- x² + y² = 100. y = 8 when x = 6.
- 2x·(dx/dt) + 2y·(dy/dt) = 0.
- 12 + 16·(dy/dt) = 0 → dy/dt = -3/4 ft/sec.

### Example 4 [4] — L'Hôpital's Rule

lim(x→0) sin(x)/x.
- Direct: 0/0 (indeterminate).
- L'Hôpital: lim(x→0) cos(x)/1 = 1.

### Example 5 [4] — Linear approximation

Estimate √26 using a = 25.
- f(25) = 5. f'(25) = 1/10.
- L(26) = 5 + (1/10)(1) = 5.1.

## Top Traps & Common Errors

1. **Forgetting units.** Derivatives have specific units (m/s, etc.).
2. **Confusing speed and velocity.** Speed = |v|. Velocity has direction.
3. **Wrong direction for speeding up/slowing down.** Same signs = speeding up.
4. **Misapplying L'Hôpital.** Only for 0/0 or ∞/∞ directly.
5. **Forgetting to differentiate with respect to TIME in related rates.** Each variable becomes function of t.
6. **Substituting values BEFORE differentiating.** Must differentiate first.
7. **Wrong sign in related rates.** Decreasing → negative rate.
8. **Linearization for far-away points.** Approximation degrades far from a.

## Rubric-Aware Tactics

**For motion problems:** find v(t), a(t); identify direction and acceleration; determine speeding up/slowing down.

**For related rates:** identify quantities, write equation, differentiate w.r.t. TIME, substitute, solve, include units.

**For L'Hôpital:** verify indeterminate form; differentiate numerator and denominator separately.

**For linearization:** identify a; L(x) = f(a) + f'(a)(x - a).

## "Phrases That Score" — verbatim language for FRQs

1. "Velocity v(t) = s'(t) gives instantaneous rate of position change. Object is at rest when v(t) = 0."
2. "An object is SPEEDING UP when v and a have same sign; SLOWING DOWN when they have opposite signs."
3. "For related rates: identify equation relating changing quantities, differentiate implicitly with respect to time, substitute, solve. Always include units."
4. "L'Hôpital's Rule: for 0/0 or ∞/∞, lim f(x)/g(x) = lim f'(x)/g'(x)."
5. "Linearization L(x) = f(a) + f'(a)·(x - a) approximates f(x) for x close to a."

## If You Do Nothing Else for This Unit

*Master related rates problems (most common FRQ topic) — set up equation, differentiate w.r.t. time, substitute, solve. Master L'Hôpital for indeterminate limits. Master position-velocity-acceleration through derivatives.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus AB CED 2024-25, Princeton Review AP Calculus AB 2025, Khan Academy AP Calculus AB, Stewart Calculus 8e
_difficulty: foundational
_relatedUnits: ap-calculus-ab-unit-2-differentiation-rules, ap-calculus-ab-unit-3-composite-implicit-inverse, ap-calculus-ab-unit-5-analytical-applications-differentiation, ap-calculus-bc-unit-4-contextual-applications-differentiation
