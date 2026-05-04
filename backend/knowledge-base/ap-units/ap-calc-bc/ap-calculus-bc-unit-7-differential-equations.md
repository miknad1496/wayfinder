# AP Calculus BC — Unit 7: Differential Equations — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 6–9% of the AP Calculus BC exam
- **Sub-topics covered:**
  - 7.1 Modeling Situations with Differential Equations
  - 7.2 Verifying Solutions for Differential Equations
  - 7.3 Sketching Slope Fields
  - 7.4 Reasoning Using Slope Fields
  - 7.5 Approximating Solutions Using Euler's Method (BC only)
  - 7.6 Finding General Solutions Using Separation of Variables
  - 7.7 Finding Particular Solutions Using Initial Conditions and Separation of Variables
  - 7.8 Exponential Models with Differential Equations
  - 7.9 Logistic Models with Differential Equations (BC only)
- **Where this unit appears on the exam:** Differential equations are a perennial FRQ topic. Slope fields, separation of variables, and exponential/logistic growth are all common. Euler's method is BC-specific. Logistic models with carrying capacity show up regularly.

## Big Ideas

1. **A differential equation involves derivatives.** Solving means finding the function whose derivatives satisfy the equation. Most useful: dy/dx = f(x, y) form.
2. **Slope fields visualize differential equations.** At each point in the plane, draw a small line segment with slope dy/dx. Solutions follow these slopes.
3. **Separation of variables solves dy/dx = f(x)·g(y).** Separate y-terms (with dy) from x-terms (with dx); integrate both sides.
4. **Initial conditions specify particular solutions.** A general solution has a constant; an initial condition fixes that constant.
5. **Logistic growth models limited resource scenarios.** dy/dt = ky(1 - y/L), where L is carrying capacity. Sigmoid curve. Critical for population biology.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Differential equation:** an equation involving a function and its derivatives.
- **Order:** highest derivative present (1st-order = involves only first derivative; 2nd-order = involves second).
- **General solution:** function + arbitrary constant (e.g., y = 3x² + C).
- **Particular solution:** general solution with constant determined by initial condition.
- **Verifying a solution:** plug the function and its derivatives into the equation; check both sides match.
- **Slope field:** at each point (x, y), draw a small line with slope dy/dx evaluated at that point. Solutions follow these slopes.
- **Reading slope fields:**
  - Where slopes are positive, solutions are increasing.
  - Where slopes are negative, solutions are decreasing.
  - Where slopes are 0, solutions have horizontal tangents (potential extrema).
- **Separation of variables:**
  - If dy/dx = f(x)·g(y), separate as: (1/g(y)) dy = f(x) dx.
  - Integrate both sides: ∫(1/g(y)) dy = ∫f(x) dx.
  - Solve for y if possible.
- **Initial value problem (IVP):** differential equation + initial condition.
  - General solution gives a family; initial condition specifies one particular solution.
- **Exponential model:**
  - dy/dt = ky.
  - Solution: y = y₀ · e^(kt).
  - **k > 0:** exponential growth.
  - **k < 0:** exponential decay.
  - **Examples:** unrestricted population growth, radioactive decay, compound interest.
- **Logistic model (BC only):**
  - dy/dt = ky(1 - y/L), where L is carrying capacity.
  - **Behavior:** when y is small, behaves like exponential; as y approaches L, growth slows to zero.
  - Produces S-shaped (sigmoid) curve.
  - **Examples:** population growth with limited resources, spread of disease (initially exponential, then slowing as susceptible population decreases).
  - **Equilibrium values:** y = 0 (unstable) and y = L (stable, carrying capacity).

### Adds for [4]

- **Euler's Method (BC only):**
  - Numerical approximation of solution to dy/dx = f(x, y) with initial condition.
  - **Step size h.**
  - Iterate: y_(n+1) = y_n + h · f(x_n, y_n).
  - **Smaller h** → more accurate but more computation.
  - **Errors accumulate** — Euler's method is approximate.
- **Slope field interpretation:**
  - **Equilibrium solutions:** where dy/dx = 0 for ALL x. Horizontal lines.
  - **Stable equilibria:** solutions converge to them.
  - **Unstable equilibria:** solutions diverge from them.
- **Separation of variables worked example:**
  - dy/dx = x · y. Initial: y(0) = 1.
  - Separate: (1/y) dy = x dx.
  - Integrate: ln|y| = x²/2 + C.
  - Solve: |y| = e^(x²/2 + C) = e^C · e^(x²/2). Let A = e^C: y = A · e^(x²/2).
  - Apply initial condition: 1 = A · e^0 = A. So A = 1.
  - Particular solution: y = e^(x²/2).
- **Exponential growth/decay applications:**
  - **Half-life problems:** y = y₀ · (1/2)^(t/T), where T is half-life.
  - **Continuous compound interest:** A = P · e^(rt).
  - **Newton's Law of Cooling:** dT/dt = -k(T - T_ambient).
- **Logistic equation solution** (often given, not required to derive):
  - y = L / (1 + A · e^(-kt)), where A = (L - y₀)/y₀.
- **Inflection point of logistic curve:**
  - At y = L/2 (halfway to carrying capacity).
  - This is where growth rate is maximum.

### Adds for [5]

- **Why differential equations are powerful.** Many physical, biological, economic systems are described by relationships between QUANTITIES and their RATES OF CHANGE. Differential equations encode these relationships and can be solved (or numerically approximated) to predict behavior.
- **Why Euler's method works.** It's a linearization at each step — using the tangent line to extrapolate forward. Smaller steps reduce error but require more computation.
- **The "exponential growth = unrealistic" critique.** Exponential growth assumes UNLIMITED resources. Real populations face limits (food, space, predation). Logistic growth is more realistic.
- **The "logistic equation" history.** Pierre-François Verhulst (1838) derived it as a refinement of Malthusian (exponential) growth. The model captures the key insight that growth slows as a population approaches its environmental carrying capacity.
- **Modeling and reality.** Real systems are often more complex than the idealized differential equations. But these idealized models capture important qualitative behavior: exponential systems grow without bound; logistic systems approach a stable equilibrium.
- **Stability of equilibria.** A small perturbation away from a stable equilibrium decays back; from an unstable equilibrium, it grows away. For logistic equation: y = 0 is unstable (small populations grow); y = L is stable (deviations from carrying capacity correct themselves).

## Worked Examples

### Example 1 [3] — Verifying a solution

Verify that y = e^(2x) is a solution to dy/dx = 2y.

- **Step 1.** Find dy/dx: dy/dx = 2 · e^(2x).
- **Step 2.** Compute 2y: 2y = 2 · e^(2x).
- **Step 3.** Compare: dy/dx = 2 · e^(2x) = 2y. ✓
- **Conclusion:** y = e^(2x) is a solution.

### Example 2 [3] — Separation of variables

Solve dy/dx = (x²+1)/y, with y(0) = 2.

- **Step 1.** Separate: y dy = (x² + 1) dx.
- **Step 2.** Integrate: y²/2 = x³/3 + x + C.
- **Step 3.** Apply initial condition: y(0) = 2.
  - 2²/2 = 0 + 0 + C → C = 2.
- **Step 4.** Equation: y²/2 = x³/3 + x + 2 → y² = (2x³)/3 + 2x + 4.
- **Step 5.** Solve for y: y = √((2x³)/3 + 2x + 4) (take positive root since y(0) = 2 > 0).

### Example 3 [3][4] — Exponential growth

A population of bacteria doubles every 3 hours. If 100 bacteria are initially present, how many are there after 9 hours?

- **Step 1.** Doubling every 3 hours → exponential growth.
- **Step 2.** Model: y = y₀ · e^(kt), where y₀ = 100.
- **Step 3.** Find k: y(3) = 200. So 200 = 100 · e^(3k) → e^(3k) = 2 → k = ln(2)/3 ≈ 0.231.
- **Step 4.** Calculate y(9):
  - y(9) = 100 · e^(0.231 · 9) = 100 · e^(2.08) ≈ 100 · 8 = 800.
- **Verify:** doubling every 3 hours: 100 → 200 → 400 → 800. ✓
- **Result:** 800 bacteria after 9 hours.

### Example 4 [4] — Euler's Method

Use Euler's method with step size h = 0.5 to estimate y(1) given dy/dx = x + y, y(0) = 1.

- **Step 1.** Initial: x₀ = 0, y₀ = 1.
- **Step 2.** Compute y₁ at x = 0.5: y₁ = y₀ + h · f(x₀, y₀) = 1 + 0.5 · (0 + 1) = 1.5.
- **Step 3.** Compute y₂ at x = 1: y₂ = y₁ + h · f(x₁, y₁) = 1.5 + 0.5 · (0.5 + 1.5) = 1.5 + 1 = 2.5.
- **Result:** y(1) ≈ 2.5 by Euler's method with h = 0.5.

### Example 5 [4][5] — Logistic growth

A population of fish in a lake follows logistic growth with carrying capacity L = 1000 and growth rate k = 0.5/year. Initial population y(0) = 100.

(a) Write the differential equation.
(b) When does the population reach half the carrying capacity?

- **(a) Differential equation:** dy/dt = ky(1 - y/L) = 0.5y(1 - y/1000).
- **(b) Population reaches half carrying capacity at y = 500.**
  - Use logistic solution: y(t) = L/(1 + A·e^(-kt)), where A = (L-y₀)/y₀ = 900/100 = 9.
  - Solve 500 = 1000/(1 + 9·e^(-0.5t)).
  - 1 + 9·e^(-0.5t) = 2.
  - 9·e^(-0.5t) = 1.
  - e^(-0.5t) = 1/9.
  - -0.5t = ln(1/9).
  - t = -2 · ln(1/9) = 2 · ln(9) ≈ 4.39 years.
- **Result:** population reaches 500 fish after about 4.4 years.

## Top Traps & Common Errors

1. **Forgetting "+ C" in general solution.** General solutions have arbitrary constant.
2. **Wrong direction of initial condition application.** Substitute initial values to find C.
3. **Confusing exponential and logistic models.** Exponential = no limits. Logistic = carrying capacity.
4. **Misapplying separation of variables.** Only works if dy/dx = f(x)·g(y) (separable form).
5. **Forgetting absolute value in ln.** ∫(1/y) dy = ln|y| + C.
6. **Wrong direction of Euler's method.** y_(n+1) = y_n + h · f(x_n, y_n).
7. **Treating Euler's method as exact.** It's an approximation; smaller h is more accurate.
8. **Misnaming solution types.** General solution (with C). Particular solution (specific C from initial condition).
9. **Wrong slope field reading.** Match slope to direction of solution at each point.
10. **Forgetting carrying capacity in logistic equation.** dy/dt = ky(1 - y/L).
11. **Wrong sign in exponential decay.** Decay: k < 0; growth: k > 0.
12. **Missing equilibrium solutions.** dy/dt = 0 gives equilibrium values.
13. **Arithmetic errors in Euler iterations.** Each step requires careful computation.
14. **Misapplying logistic to non-bounded growth.** Logistic specifically for bounded growth.
15. **Confusing differential equation with its solution.** dy/dx = 2y is the EQUATION; y = Ce^(2x) is a solution.

## Rubric-Aware Tactics

**For separation of variables:**
- Separate y-terms (with dy) from x-terms (with dx).
- Integrate both sides.
- Apply initial condition for particular solution.

**For Euler's method:**
- Use formula y_(n+1) = y_n + h · f(x_n, y_n).
- Show each step.

**For exponential/logistic models:**
- Identify model type from differential equation.
- Use formula or solve.

**For slope fields:**
- Read slope at each grid point.
- Solutions follow slopes.

## "Phrases That Score" — verbatim language for FRQs

1. "By separation of variables: separate y-terms with dy on one side, x-terms with dx on the other; integrate both sides; apply the initial condition to find the constant of integration."
2. "Exponential growth is modeled by dy/dt = ky, with solution y = y₀·e^(kt). The growth rate k > 0 indicates growth; k < 0 indicates decay."
3. "Logistic growth is modeled by dy/dt = ky(1 - y/L), where L is carrying capacity. Population grows nearly exponentially when small but slows as it approaches L, producing an S-shaped curve. The population's growth rate is maximum at y = L/2."
4. "Using Euler's method with step size h: y_(n+1) = y_n + h · f(x_n, y_n). Smaller step size produces more accurate approximations."
5. "Solutions to differential equations follow the slopes given by the slope field. Stable equilibrium solutions attract nearby solutions; unstable equilibria repel them."
6. "To verify a function is a solution to a differential equation, compute the required derivatives and substitute into the equation. Both sides should equal."
7. "An initial condition specifies a unique particular solution from the family of general solutions. The arbitrary constant C is determined by substituting the initial values."

## If You Do Nothing Else for This Unit

*Master separation of variables (the main BC technique). Master exponential and logistic models. Master Euler's method. Slope field reading is essential for understanding behavior. These models appear in physics, biology, economics — applications well beyond pure math.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus BC CED 2024-25, Princeton Review AP Calculus BC 2025, Khan Academy AP Calculus BC, Stewart Calculus 8e, Larson Calculus 11e
_difficulty: foundational
_relatedUnits: ap-calculus-bc-unit-6-integration-accumulation, ap-calculus-bc-unit-8-applications-integration
