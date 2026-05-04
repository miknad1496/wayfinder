# AP Calculus BC — Unit 4: Contextual Applications of Differentiation — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 6–9% of the AP Calculus BC exam
- **Sub-topics covered:**
  - 4.1 Interpreting the Meaning of the Derivative in Context
  - 4.2 Straight-Line Motion (position, velocity, acceleration)
  - 4.3 Rates of Change in Applied Contexts Other Than Motion
  - 4.4 Introduction to Related Rates
  - 4.5 Solving Related Rates Problems
  - 4.6 Approximating Values of a Function Using Local Linearity and Linearization
  - 4.7 Using L'Hôpital's Rule for Determining Limits of Indeterminate Forms
- **Where this unit appears on the exam:** Unit 4 connects derivatives to real-world contexts. Related rates problems are common FRQs. Straight-line motion problems are perennial. L'Hôpital's Rule is essential for handling indeterminate forms. Linear approximation appears in MCQ regularly.

## Big Ideas

1. **Derivatives in context measure rates of change.** Position → velocity → acceleration. Volume → rate of volume change. Profit → marginal profit. Always include UNITS and CONTEXT.
2. **Related rates problems connect rates through equations.** When two quantities are related by an equation, differentiate implicitly with respect to time to relate their rates.
3. **L'Hôpital's Rule resolves indeterminate forms.** For 0/0 or ∞/∞: take the derivatives of numerator and denominator separately, then take the limit again.
4. **Linear approximation uses the tangent line as a local approximation.** f(x) ≈ f(a) + f'(a)·(x - a). Useful when computing exact values is hard.
5. **Position, velocity, acceleration form a chain of derivatives.** Velocity = derivative of position. Acceleration = derivative of velocity = second derivative of position.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Derivative as rate of change in context:**
  - **In motion:** if s(t) is position, then s'(t) is velocity (rate of position change).
  - **In economics:** if C(x) is cost, then C'(x) is marginal cost (rate of cost change per unit).
  - **In biology:** if P(t) is population, then P'(t) is rate of population change.
  - **Always include units:** if x is in meters and t is in seconds, then dx/dt has units m/s.
- **Straight-line motion:**
  - **Position:** s(t) — distance from a reference point.
  - **Velocity:** v(t) = s'(t) — rate of position change. Has direction (positive or negative).
  - **Acceleration:** a(t) = v'(t) = s''(t) — rate of velocity change.
  - **Speed:** |v(t)| — magnitude of velocity (always positive).
  - **Object at rest:** v(t) = 0.
  - **Object moving in positive direction:** v(t) > 0. Negative direction: v(t) < 0.
  - **Object speeding up:** v(t) and a(t) have the SAME sign (both positive or both negative).
  - **Object slowing down:** v(t) and a(t) have OPPOSITE signs.
- **Related Rates problems:**
  - **Setup:** identify quantities that change with time. Find an equation relating them.
  - **Differentiate** the equation with respect to TIME (using Chain Rule).
  - **Substitute** known values and solve for unknown rate.
- **Steps for Related Rates:**
  - **(1) Read carefully.** Identify ALL changing quantities and their relationships.
  - **(2) Draw a diagram if possible.** Label variables.
  - **(3) Write equation** relating the variables.
  - **(4) Differentiate** with respect to t (Chain Rule for each variable).
  - **(5) Substitute** known values.
  - **(6) Solve** for the unknown rate.
  - **(7) Include UNITS** in the answer.
- **L'Hôpital's Rule:**
  - **Conditions:** lim(x→a) f(x)/g(x) is of indeterminate form 0/0 or ∞/∞ (NOT for other indeterminate forms directly).
  - **Rule:** lim(x→a) f(x)/g(x) = lim(x→a) f'(x)/g'(x), provided the latter limit exists.
  - **Important:** the rule is for the LIMIT, not the function value.
  - **Applies to one-sided limits, limits at infinity, etc.**
- **Linear approximation (linearization):**
  - **Formula:** L(x) = f(a) + f'(a)·(x - a).
  - **L(x) approximates f(x) for x close to a** (uses the tangent line).
  - **Useful when:** computing f(x) is difficult; approximate value is acceptable; x is near a known value a.

### Adds for [4]

- **Interpreting derivatives — saying it correctly:**
  - "If P(t) is the population at time t (in years), then P'(t) is the rate of change of population at time t. P'(5) = 100 means at year 5, the population is increasing by 100 individuals per year."
  - **Always include:** which quantity, time/variable, units, direction (increasing or decreasing).
- **Straight-line motion analysis:**
  - **Total distance traveled:** ∫|v(t)|dt over the interval. NOT the same as displacement.
  - **Displacement:** ∫v(t)dt = s(b) - s(a). Net change in position.
  - **Average velocity:** (s(b) - s(a))/(b - a). Same as displacement/time.
  - **Average speed:** total distance / total time.
- **Related Rates worked through (sphere example):**
  - Sphere's radius is increasing at 2 cm/s. How fast is volume increasing when radius = 5 cm?
  - **Equation:** V = (4/3)πr³.
  - **Differentiate:** dV/dt = 4πr² · (dr/dt).
  - **Substitute:** dr/dt = 2 cm/s, r = 5 cm.
  - **Compute:** dV/dt = 4π(25)(2) = 200π cm³/s.
- **Common related rates scenarios:**
  - **Inflating sphere/cylinder:** relate volume and radius/dimensions.
  - **Ladder sliding down wall:** Pythagorean Theorem (x² + y² = constant).
  - **Two cars approaching intersection:** distance formula.
  - **Cone-shaped tank:** similar triangles to relate variables.
  - **Shadow length problems:** similar triangles.
- **L'Hôpital applied to ∞/∞:**
  - lim(x→∞) (e^x)/(x²) → ∞/∞ → use L'Hôpital → lim(x→∞) (e^x)/(2x) → still ∞/∞ → again → lim(x→∞) (e^x)/2 = ∞.
  - May need to apply repeatedly.
- **L'Hôpital for other indeterminate forms** (often by manipulation):
  - **0 · ∞:** rewrite as 0/0 or ∞/∞ form: f·g = f/(1/g) = g/(1/f).
  - **∞ - ∞:** find common denominator.
  - **0⁰, 1^∞, ∞⁰:** take logarithm: ln(f^g) = g · ln(f).
- **Linear approximation example:**
  - Estimate √4.1 using linearization at a = 4.
  - f(x) = √x. f(4) = 2. f'(x) = 1/(2√x). f'(4) = 1/4.
  - L(x) = 2 + (1/4)(x - 4).
  - L(4.1) = 2 + (1/4)(0.1) = 2.025.
  - **Actual value:** √4.1 ≈ 2.0248. Linearization is close but not exact.
- **When linear approximation is good:**
  - x close to a (smaller (x - a)).
  - Function is approximately linear near a (small second derivative).
- **Marginal cost / marginal revenue / marginal profit:** the derivative of cost / revenue / profit functions. Approximates the cost / revenue / profit of producing one more unit.

### Adds for [5]

- **The "physical meaning" of derivative as instantaneous rate.** While the average rate of change tells us the average rate over an interval, the derivative gives the EXACT rate at one moment. This is what makes derivatives so powerful — they give precise instantaneous information.
- **Why related rates are foundational.** Many real-world phenomena involve multiple changing quantities. Related rates problems formalize: "if X changes this way, how does Y change?" This pattern recurs throughout science (physics, chemistry, biology, economics).
- **The Chain Rule's role in related rates.** When you differentiate an equation with respect to t, every variable that's a function of t requires the Chain Rule (multiply by dy/dt, dr/dt, etc.). Forgetting this is the most common related rates error.
- **L'Hôpital's Rule's underlying principle.** L'Hôpital comes from the linearization concept: near x = a, f(x) ≈ f'(a)(x-a) and g(x) ≈ g'(a)(x-a). So f(x)/g(x) ≈ [f'(a)(x-a)]/[g'(a)(x-a)] = f'(a)/g'(a). This is why L'Hôpital works for 0/0 forms.
- **The connection between linearization and Newton's Method.** Newton's Method uses linearization to find roots iteratively: x_(n+1) = x_n - f(x_n)/f'(x_n). Each step is a linear approximation that gets closer to the root.
- **Why position/velocity/acceleration is foundational.** Many physical applications follow this pattern:
  - Position → Velocity → Acceleration (kinematics).
  - Volume → Rate of volume change → Rate of rate change.
  - Each level reveals different information about the system.
- **The art of recognizing related rates problems.** Look for:
  - "How fast is X changing when Y has value Z?"
  - "At what rate is the [shadow length / volume / distance] changing?"
  - Time as the underlying variable.
  - Multiple quantities related by equation (geometric, physical).
- **Why we need L'Hôpital's Rule.** Without it, many limits would be intractable. Algebraic manipulation works for many cases but fails for transcendental functions. L'Hôpital provides a systematic method.

## Worked Examples

### Example 1 [3] — Position, velocity, acceleration

A particle's position is given by s(t) = t³ - 6t² + 9t for t in seconds, position in meters.

(a) Find velocity at t = 2.
(b) Find acceleration at t = 2.
(c) Is the particle speeding up or slowing down at t = 2?

- **(a)** v(t) = s'(t) = 3t² - 12t + 9. At t = 2: v(2) = 12 - 24 + 9 = -3 m/s. (Negative — moving in negative direction).
- **(b)** a(t) = v'(t) = 6t - 12. At t = 2: a(2) = 12 - 12 = 0 m/s².
- **(c)** Velocity is -3 (negative), acceleration is 0. Object instantaneously at neither speeding up nor slowing down at t = 2 — it's at a critical point of velocity.

### Example 2 [3][4] — Related rates (sphere)

A spherical balloon is inflated so that its radius increases at 2 cm/sec. How fast is the surface area increasing when the radius is 5 cm?

- **Step 1.** Identify quantities and rates.
  - Surface area: S = 4πr².
  - dr/dt = 2 cm/sec.
  - Find dS/dt when r = 5 cm.
- **Step 2.** Differentiate with respect to time:
  - dS/dt = 8πr · (dr/dt).
- **Step 3.** Substitute:
  - dS/dt = 8π(5)(2) = 80π cm²/sec.
- **Result:** surface area increasing at 80π ≈ 251 cm²/sec.

### Example 3 [4] — Related rates (ladder problem)

A 10-foot ladder slides down a wall. The bottom slides away from the wall at 1 ft/sec. How fast is the top sliding down when the bottom is 6 ft from the wall?

- **Step 1.** Set up: x = distance from wall (bottom of ladder); y = height on wall (top of ladder); ladder length = 10.
  - Equation: x² + y² = 10² = 100 (Pythagorean Theorem).
- **Step 2.** Differentiate with respect to time:
  - 2x · (dx/dt) + 2y · (dy/dt) = 0.
- **Step 3.** When x = 6, find y: y = √(100 - 36) = 8.
- **Step 4.** Substitute: dx/dt = 1, x = 6, y = 8.
  - 2(6)(1) + 2(8)(dy/dt) = 0.
  - 12 + 16(dy/dt) = 0.
  - dy/dt = -12/16 = -3/4 ft/sec.
- **Result:** top sliding DOWN at 3/4 ft/sec (negative because y is decreasing).

### Example 4 [4] — L'Hôpital's Rule

Compute lim(x→0) sin(x)/x.

- **Step 1.** Direct substitution: sin(0)/0 = 0/0, indeterminate.
- **Step 2.** Apply L'Hôpital's Rule: lim(x→0) sin(x)/x = lim(x→0) cos(x)/1.
- **Step 3.** Substitute x = 0: cos(0)/1 = 1/1 = 1.
- **Result:** lim(x→0) sin(x)/x = 1 (this is a special limit, also derived geometrically without L'Hôpital).

### Example 5 [4] — Linear approximation

Estimate √26 using linearization at a = 25.

- **Step 1.** f(x) = √x. f(25) = 5. f'(x) = 1/(2√x). f'(25) = 1/10.
- **Step 2.** L(x) = 5 + (1/10)(x - 25).
- **Step 3.** L(26) = 5 + (1/10)(1) = 5.1.
- **Step 4.** Actual: √26 ≈ 5.0990.
- **Comparison:** linear approximation gives 5.1; actual is 5.0990. Approximation is slightly off but close.

## Top Traps & Common Errors

1. **Forgetting units.** In context, derivatives have specific units (e.g., m/s for velocity). Always include them.
2. **Misinterpreting derivative.** Derivative is a RATE, not a value. f'(5) tells you how fast f changes at x = 5.
3. **Confusing speed and velocity.** Speed = |velocity|. Velocity has direction; speed doesn't.
4. **Confusing speeding up/slowing down.** Speeding up: v and a have SAME sign. Slowing down: v and a have OPPOSITE signs.
5. **Misapplying L'Hôpital.** Only for 0/0 or ∞/∞. For other indeterminate forms, manipulate first.
6. **Forgetting to differentiate WITH RESPECT TO TIME in related rates.** Each variable becomes a function of time; use Chain Rule.
7. **Setting variables to specific values BEFORE differentiating.** First write equation in general variables, THEN differentiate, THEN substitute.
8. **Wrong sign in related rates.** If a quantity is decreasing, the rate is negative. Watch signs.
9. **Linearization for far-away points.** L(x) approximates f(x) for x NEAR a. Far from a, the approximation gets worse.
10. **Forgetting to check L'Hôpital's preconditions.** Form must be 0/0 or ∞/∞.
11. **Applying L'Hôpital to fractions that aren't indeterminate.** If lim is just 5, don't apply L'Hôpital — answer is 5.
12. **Computing total distance vs displacement.** Displacement = s(b) - s(a). Total distance = ∫|v(t)|dt.
13. **Confusing related rates with implicit differentiation.** Related rates use implicit differentiation, but the variable is t (time), not x.
14. **Forgetting to include "at the moment" specifications.** Related rates often ask about a specific moment; substitute appropriately.
15. **Wrong interpretation of marginal cost/revenue.** Marginal cost ≈ cost of one more unit. It's the DERIVATIVE of cost function.

## Rubric-Aware Tactics

**For motion problems:**
- Find v(t) and a(t).
- Identify direction (sign of v) and acceleration.
- Determine speeding up/slowing down (compare signs).

**For related rates problems:**
- Identify quantities and rates.
- Write equation relating them.
- Differentiate with respect to TIME.
- Substitute and solve.
- Include units.

**For L'Hôpital's Rule:**
- Verify indeterminate form (0/0 or ∞/∞).
- Differentiate numerator and denominator SEPARATELY.
- Take limit.
- Repeat if still indeterminate.

**For linearization:**
- Identify a (point near where to approximate).
- Compute f(a) and f'(a).
- L(x) = f(a) + f'(a)(x - a).
- Evaluate at desired x.

## "Phrases That Score" — verbatim language for FRQs

1. "The derivative s'(t) = v(t) gives the velocity at time t. v(t) is positive when the object moves in the positive direction; negative when moving in the negative direction; zero when the object is momentarily at rest."
2. "An object is SPEEDING UP when velocity and acceleration have the same sign (both positive or both negative). An object is SLOWING DOWN when they have opposite signs."
3. "For related rates problems: identify the equation relating the changing quantities, differentiate implicitly with respect to time, substitute known values, and solve for the unknown rate. Always include units in the final answer."
4. "L'Hôpital's Rule: for the indeterminate form 0/0 or ∞/∞, the limit equals lim(x→a) f'(x)/g'(x). The rule may need to be applied repeatedly until a determinate form is obtained."
5. "The linearization L(x) = f(a) + f'(a)·(x - a) provides an approximation of f(x) for x close to a. The approximation is best when x is near a and when the function changes slowly (small second derivative)."
6. "The marginal cost C'(x) approximates the cost of producing the (x+1)th unit. While exact additional cost is C(x+1) - C(x), this is approximately C'(x) for small changes."
7. "When evaluating L'Hôpital's Rule with multiple applications, the limit is taken AFTER each differentiation. The rule applies as long as the new ratio is still indeterminate."

## If You Do Nothing Else for This Unit

*Master related rates problems (the most common FRQ topic) — set up the equation relating quantities, differentiate implicitly with respect to TIME, substitute, and solve. Master L'Hôpital's Rule for indeterminate limits. Master the connection between position, velocity, and acceleration through derivatives. These applications appear repeatedly throughout the rest of the course and on the exam.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus BC CED 2024-25, Princeton Review AP Calculus BC 2025, Khan Academy AP Calculus BC, Stewart Calculus 8e, Larson Calculus 11e
_difficulty: foundational
_relatedUnits: ap-calculus-bc-unit-2-differentiation-rules, ap-calculus-bc-unit-3-composite-implicit-inverse, ap-calculus-bc-unit-5-analytical-applications-differentiation
