# AP Calculus AB — Unit 7: Differential Equations — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 6–12% of the AP Calculus AB exam
- **AB vs BC distinction:** AB Unit 7 covers a SUBSET of BC Unit 7. AB does NOT cover: Euler's Method (BC only), Logistic Models (BC only). AB DOES cover: slope fields, separation of variables, exponential models.
- **Sub-topics covered (AB):** modeling differential equations; verifying solutions; slope fields; separation of variables; exponential growth/decay models.

## Big Ideas

1. **A differential equation involves derivatives.** Solving means finding the function whose derivatives satisfy the equation.
2. **Slope fields visualize differential equations.** At each point, draw a small line with slope dy/dx.
3. **Separation of variables solves dy/dx = f(x)·g(y).** Separate y-terms (with dy) from x-terms (with dx); integrate.
4. **Initial conditions specify particular solutions.** General solution + initial condition → particular.
5. **Exponential growth/decay: dy/dt = ky.** Solution: y = y₀·e^(kt). Real-world: populations, radioactive decay, compound interest.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Differential equation:** equation involving function and its derivatives.
- **General solution:** function + arbitrary constant.
- **Particular solution:** general + initial condition fixes constant.
- **Verifying a solution:** plug the function and derivatives into the equation; check both sides match.
- **Slope field:** at each (x, y), draw small line with slope dy/dx.
- **Reading slope fields:**
  - Where slopes positive: solutions increasing.
  - Where slopes negative: solutions decreasing.
  - Where slopes zero: solutions have horizontal tangents.
- **Separation of variables:**
  - If dy/dx = f(x)·g(y), separate as: (1/g(y)) dy = f(x) dx.
  - Integrate both sides.
  - Apply initial condition for particular solution.
- **Exponential model:**
  - dy/dt = ky.
  - Solution: y = y₀·e^(kt).
  - **k > 0:** growth. **k < 0:** decay.
  - Examples: unrestricted population growth, radioactive decay, compound interest.

### Adds for [4]

- **Slope field interpretation:**
  - Horizontal lines = equilibrium solutions (where dy/dx = 0).
  - Stable equilibria attract; unstable repel.
- **Separation of variables example:**
  - dy/dx = x · y, y(0) = 1.
  - Separate: (1/y) dy = x dx.
  - Integrate: ln|y| = x²/2 + C.
  - Solve: y = e^(x²/2 + C) = A · e^(x²/2). Apply IC: A = 1. y = e^(x²/2).
- **Exponential growth applications:**
  - **Half-life:** y = y₀ · (1/2)^(t/T), where T is half-life.
  - **Continuous compound interest:** A = P·e^(rt).
  - **Newton's Law of Cooling:** dT/dt = -k(T - T_ambient).

### Adds for [5]

- **Why differential equations are powerful.** Many physical, biological, economic systems are described by relationships between QUANTITIES and their RATES OF CHANGE.
- **Modeling and reality.** Real systems often more complex than idealized differential equations, but qualitative behavior captured.

## Worked Examples

### Example 1 [3] — Verifying solution

Verify y = e^(2x) is a solution to dy/dx = 2y.
- dy/dx = 2·e^(2x).
- 2y = 2·e^(2x).
- ✓ They match.

### Example 2 [3] — Separation of variables

Solve dy/dx = (x²+1)/y, y(0) = 2.
- y dy = (x²+1) dx.
- y²/2 = x³/3 + x + C.
- IC: y(0) = 2 → 4/2 = 0 + 0 + C → C = 2.
- y² = 2x³/3 + 2x + 4. y = √(2x³/3 + 2x + 4).

### Example 3 [3] — Exponential growth

Bacteria population doubles every 3 hours. Initial 100. After 9 hours?
- y = y₀ · e^(kt). y(3) = 200 → 200 = 100·e^(3k) → k = ln(2)/3.
- y(9) = 100 · e^((ln(2)/3)·9) = 100 · e^(3·ln(2)) = 100 · 8 = 800.

### Example 4 [4] — Half-life

Carbon-14 has half-life of 5730 years. Initial 1g. After 17190 years?
- 17190 = 3 · 5730. 3 half-lives.
- 1 → 0.5 → 0.25 → 0.125 g.

## Top Traps & Common Errors

1. **Forgetting + C in general solution.**
2. **Wrong direction of initial condition application.** Substitute initial values to find C.
3. **Misapplying separation of variables.** Only works for separable form.
4. **Wrong sign in exponential decay.** Decay: k < 0; growth: k > 0.
5. **Forgetting absolute value in ln.** ∫(1/y) dy = ln|y| + C.

## Rubric-Aware Tactics

**For separation of variables:** separate y-terms (dy) from x-terms (dx); integrate both sides; apply initial condition.

**For exponential models:** identify k from rate; use y = y₀·e^(kt).

**For slope fields:** read slope at grid points; solutions follow slopes.

## "Phrases That Score" — verbatim language for FRQs

1. "By separation of variables: separate y-terms with dy on one side, x-terms with dx on the other; integrate both sides; apply initial condition to find constant of integration."
2. "Exponential growth: dy/dt = ky, with solution y = y₀·e^(kt). k > 0 indicates growth; k < 0 indicates decay."
3. "Solutions to differential equations follow slopes given by the slope field."
4. "To verify a function is a solution to a differential equation, compute required derivatives and substitute into the equation."

## If You Do Nothing Else for This Unit

*Master separation of variables and exponential models. Slope field reading is essential. AB doesn't include Euler's method or logistic models — those are BC-only.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus AB CED 2024-25, Princeton Review AP Calculus AB 2025, Khan Academy AP Calculus AB, Stewart Calculus 8e
_difficulty: foundational
_relatedUnits: ap-calculus-ab-unit-6-integration-accumulation, ap-calculus-ab-unit-8-applications-integration, ap-calculus-bc-unit-7-differential-equations
