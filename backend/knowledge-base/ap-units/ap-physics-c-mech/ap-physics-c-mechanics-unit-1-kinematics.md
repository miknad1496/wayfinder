# AP Physics C: Mechanics — Unit 1: Kinematics — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 10–15% of the AP Physics C: Mechanics exam
- **Sub-topics covered:** position, velocity, acceleration as functions of time; calculus relationships (derivative/integral); 1D motion; 2D motion (projectile); relative velocity.
- **Where this unit appears on the exam:** Calculus-based kinematics is the core differentiator from Physics 1. Position-velocity-acceleration via integration/differentiation. Variable acceleration problems.

## Big Ideas

1. **v = dx/dt; a = dv/dt = d²x/dt².**
2. **Conversely:** x = ∫v dt; v = ∫a dt.
3. **Constant acceleration:** v = v₀ + at; x = x₀ + v₀t + ½at²; v² = v₀² + 2a(x − x₀).
4. **2D motion:** treat x and y components independently.
5. **Projectile motion:** a_x = 0; a_y = −g.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Position x(t):** location as function of time.
- **Velocity v(t):**
  - **v = dx/dt** (instantaneous).
  - **Average:** v_avg = Δx/Δt.
- **Acceleration a(t):**
  - **a = dv/dt = d²x/dt²** (instantaneous).
  - **Average:** a_avg = Δv/Δt.
- **Inverse relationships:**
  - **v = v₀ + ∫a dt.**
  - **x = x₀ + ∫v dt.**
  - **Net displacement = area under v(t) curve.**
  - **Net Δv = area under a(t) curve.**
- **Constant acceleration kinematics:**
  - **v = v₀ + at.**
  - **x = x₀ + v₀t + ½at².**
  - **v² = v₀² + 2a(x − x₀).**
  - **x = x₀ + ½(v + v₀)t.**
- **2D motion:**
  - **r = (x, y).**
  - **v = (v_x, v_y).**
  - **a = (a_x, a_y).**
  - **Each component independent.**
- **Projectile motion:**
  - **a_x = 0; a_y = −g** (downward).
  - **v_x constant; v_y changes.**
  - **Range R = v₀² sin(2θ)/g** for level ground.
  - **Max height H = (v₀ sin θ)²/(2g).**
- **Relative velocity:** v_AB = v_A − v_B (velocity of A in B's frame).

### Adds for [4]

- **Variable acceleration:**
  - **Find v(t):** v = v₀ + ∫₀^t a(t') dt'.
  - **Find x(t):** x = x₀ + ∫₀^t v(t') dt'.
  - **Common:** a(t) = bt → v(t) = v₀ + bt²/2 → x(t) = x₀ + v₀t + bt³/6.
- **Position-time graphs:** slope = velocity.
- **Velocity-time graphs:** slope = acceleration; area = displacement.
- **Acceleration-time graphs:** area = velocity change.

### Adds for [5]

- **Why calculus essential:** non-constant acceleration requires it.
- **Why projectile separable:** no x-y force coupling.

## Worked Examples

### Example 1 [3] — Constant acceleration

Object starts at rest, accelerates at 2 m/s² for 5 s. Final velocity? Distance?
- **v = at = 2·5 = 10 m/s.**
- **x = ½at² = ½·2·25 = 25 m.**

### Example 2 [3] — Projectile

Cannonball launched at 50 m/s, 30°. Range?
- **R = v₀² sin(2θ)/g = 2500·sin 60°/10 = 2500·0.866/10 = 217 m.**

### Example 3 [4] — Variable acceleration

a(t) = 6t. v(0) = 2 m/s, x(0) = 0. Find x(t) and v(t).
- **v(t) = v₀ + ∫₀^t 6t' dt' = 2 + 3t².**
- **x(t) = ∫₀^t (2 + 3t'²) dt' = 2t + t³.**

### Example 4 [4] — Find time to land

Ball thrown straight up at 20 m/s. When does it land?
- **y = v₀t − ½gt² = 0.**
- **t(20 − 5t) = 0 → t = 0 or t = 4 s.**
- **Lands at t = 4 s.**

### Example 5 [5] — Trajectory equation

Projectile from origin at v₀, angle θ. Trajectory y(x)?
- **x = v₀ cos θ · t → t = x/(v₀ cos θ).**
- **y = v₀ sin θ · t − ½gt²** = v₀ sin θ · x/(v₀ cos θ) − g·x²/(2v₀² cos² θ).
- **y = x tan θ − gx²/(2v₀² cos² θ).**
- **Parabola.**

## Top Traps & Common Errors

1. **Confusing average and instantaneous v.**
2. **Forgetting integration constants** (v₀, x₀).
3. **Using kinematics equations** when a not constant.
4. **Confusing displacement and distance.**
5. **Wrong sign convention** (especially up vs down).

## Rubric-Aware Tactics

**For variable a:** integrate to get v(t), x(t).
**For projectile:** treat x and y separately.
**For constant a:** apply kinematics equations.

## "Phrases That Score" — verbatim language for FRQs

1. "Velocity is the time derivative of position: v(t) = dx/dt. Acceleration is the time derivative of velocity: a(t) = dv/dt = d²x/dt². Conversely, v(t) = v₀ + ∫a(t') dt' and x(t) = x₀ + ∫v(t') dt'."
2. "For constant acceleration: v = v₀ + at; x = x₀ + v₀t + ½at²; v² = v₀² + 2a(x − x₀)."
3. "For projectile motion under gravity: a_x = 0 (horizontal velocity constant) and a_y = −g (vertical acceleration constant). Treat x- and y-components independently."
4. "Range of projectile on level ground: R = v₀² sin(2θ)/g. Maximum range at θ = 45°."
5. "For variable acceleration a(t), velocity at time t is v₀ + ∫₀^t a(t') dt'; position is x₀ + ∫₀^t v(t') dt'. Calculus is essential when acceleration is not constant."

## If You Do Nothing Else for This Unit

*Master kinematic equations (constant a). Master integration for variable a. Master projectile (independent x, y). Master derivatives/integrals of position-velocity-acceleration.*

_lastUpdated: 2026-05-04
_sources: College Board AP Physics C: Mechanics CED 2024-25, Princeton Review AP Physics C 2025, Halliday-Resnick-Walker
_difficulty: intermediate
_relatedUnits: ap-physics-c-mechanics-unit-2-newtons-laws
