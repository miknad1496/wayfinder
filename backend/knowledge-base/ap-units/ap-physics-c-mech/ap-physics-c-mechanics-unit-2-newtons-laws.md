# AP Physics C: Mechanics — Unit 2: Newton's Laws of Motion — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 15–20% of the AP Physics C: Mechanics exam
- **Sub-topics covered:** Newton's three laws; free-body diagrams; friction; pulleys; inclined planes; circular motion; drag forces; differential equations from forces.
- **Where this unit appears on the exam:** Calculus-based Newton's law problems, especially with non-constant forces (drag, restoring force) requiring differential equations.

## Big Ideas

1. **Newton's 1st law:** object at rest stays at rest; in motion stays in motion (no net force).
2. **Newton's 2nd law:** F_net = ma. Vector equation.
3. **Newton's 3rd law:** for every action, equal and opposite reaction.
4. **Friction:** static (≤ μ_s N), kinetic (= μ_k N).
5. **Drag:** velocity-dependent force; leads to terminal velocity.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Newton's laws:**
  - **1st (inertia):** ΣF = 0 → no acceleration.
  - **2nd:** ΣF = ma. (Vector!)
  - **3rd:** F_AB = −F_BA (action-reaction pairs).
- **Free-body diagrams (FBD):**
  - **Draw all forces** on object.
  - **Resolve into components** (often x, y).
  - **Apply Newton's 2nd law** in each direction.
- **Common forces:**
  - **Gravity:** F_g = mg (downward, near Earth).
  - **Normal force:** perpendicular to surface.
  - **Tension:** along string/rope.
  - **Friction:** parallel to surface.
  - **Spring:** F = −kx.
- **Friction:**
  - **Static:** f_s ≤ μ_s N (up to maximum, then kinetic takes over).
  - **Kinetic:** f_k = μ_k N (constant magnitude when sliding).
  - **μ_k < μ_s** typically.
- **Inclined plane (angle θ):**
  - **Component of gravity along incline:** mg sin θ (down slope).
  - **Component perpendicular:** mg cos θ (into surface).
  - **Normal force:** N = mg cos θ.
- **Circular motion:**
  - **Centripetal acceleration:** a_c = v²/r toward center.
  - **F_net,radial = mv²/r** toward center.
  - **Period:** T = 2πr/v.
- **Drag force (calculus differentiator):**
  - **F_drag ∝ v** (linear drag, low v).
  - **F_drag ∝ v²** (quadratic drag, high v).
  - **Differential equation** for v(t).
- **Terminal velocity:** when F_drag = mg → no further acceleration.

### Adds for [4]

- **Linear drag (Stokes):**
  - **m dv/dt = mg − bv.**
  - **v_terminal = mg/b.**
  - **v(t) = v_terminal (1 − e^(−bt/m)).**
- **Quadratic drag:**
  - **m dv/dt = mg − cv².**
  - **v_terminal = √(mg/c).**
- **Atwood machine:** two masses on pulley.
  - **Tension same throughout** (massless string, frictionless pulley).
  - **Same acceleration magnitude.**
  - **a = (m₁ − m₂)g / (m₁ + m₂).**

### Adds for [5]

- **Why differential equations:** non-constant forces require integration.
- **Why FBD essential:** organize forces; apply Newton's law.

## Worked Examples

### Example 1 [3] — Block on incline

5 kg block on frictionless incline (30°). Acceleration?
- **a = g sin θ = 10 · 0.5 = 5 m/s².**

### Example 2 [3] — Friction

Box on horizontal surface, μ_k = 0.2. Acceleration if pushed with 50 N (mass 10 kg)?
- **f_k = μ_k mg = 0.2·10·10 = 20 N.**
- **F_net = 50 − 20 = 30 N.**
- **a = F/m = 3 m/s².**

### Example 3 [4] — Atwood machine

Masses 3 kg and 5 kg on pulley. Acceleration?
- **a = (5 − 3)·10/(5 + 3) = 20/8 = 2.5 m/s².**

### Example 4 [4] — Linear drag

Object falls with linear drag b = 2 N·s/m, mass 1 kg. Terminal velocity?
- **v_t = mg/b = 1·10/2 = 5 m/s.**

### Example 5 [5] — Differential equation

m dv/dt = mg − bv. Initial v = 0. Solve v(t).
- **dv/(mg − bv) = dt/m.**
- **−(1/b) ln|mg − bv| = t/m + C.**
- **At t=0, v=0:** C = −(1/b) ln(mg).
- **mg − bv = mg · e^(−bt/m).**
- **v(t) = (mg/b)(1 − e^(−bt/m)) = v_t (1 − e^(−bt/m)).**

## Top Traps & Common Errors

1. **Forgetting components.** mg sin θ along incline; mg cos θ perpendicular.
2. **Confusing static and kinetic friction.** Static is variable up to max; kinetic is constant.
3. **Drag direction.** Always opposes velocity.
4. **Centripetal force is NET force toward center,** not a separate force.
5. **Wrong tension** in Atwood (use system).

## Rubric-Aware Tactics

**For FBD problems:** draw clearly; resolve components; apply ΣF = ma.
**For drag:** set up DE; identify terminal v.
**For circular motion:** F_net = mv²/r toward center.

## "Phrases That Score" — verbatim language for FRQs

1. "Newton's 2nd law: ΣF = ma. As a vector equation, it must be applied component-wise after drawing a free-body diagram."
2. "On an inclined plane (angle θ), the component of gravity along the slope is mg sin θ; perpendicular to the surface is mg cos θ. Normal force N = mg cos θ when no other vertical forces act."
3. "Static friction is variable up to its maximum f_s,max = μ_s N; kinetic friction f_k = μ_k N is constant during sliding. Typically μ_k < μ_s."
4. "Centripetal acceleration a_c = v²/r is directed toward the center. The net radial force F_net = mv²/r — not a new force, but the resultant of forces acting toward the center."
5. "Linear drag F = −bv leads to differential equation m(dv/dt) = mg − bv with solution v(t) = (mg/b)(1 − e^(−bt/m)). Terminal velocity v_t = mg/b is reached as t → ∞."

## If You Do Nothing Else for This Unit

*Master FBD. Master inclined plane components. Master friction (static vs kinetic). Master Atwood. Master drag with differential equations.*

_lastUpdated: 2026-05-04
_sources: College Board AP Physics C: Mechanics CED 2024-25, Princeton Review AP Physics C 2025, Halliday-Resnick-Walker
_difficulty: intermediate
_relatedUnits: ap-physics-c-mechanics-unit-1-kinematics, ap-physics-c-mechanics-unit-3-work-energy-power
