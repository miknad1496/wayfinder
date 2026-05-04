# AP Physics 1 — Unit 1: Kinematics — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 10–15% of the AP Physics 1 exam
- **Sub-topics covered:** position, velocity, acceleration; uniformly accelerated motion equations; free fall; projectile motion; relative motion; graphical analysis (position-time, velocity-time, acceleration-time graphs).
- **Where this unit appears on the exam:** Kinematics is foundational. Kinematic equations and graphical analysis appear constantly. Free fall and projectile motion are perennial. Often combined with later units (forces in dynamics).

## Big Ideas

1. **Kinematics describes motion without considering its causes.** Position, velocity, acceleration are the key quantities.
2. **Acceleration is constant in many AP Physics 1 problems** — making the kinematic equations applicable.
3. **Velocity has direction (vector); speed is magnitude (scalar).** Critical distinction.
4. **At peak of projectile motion, velocity is zero but acceleration is NOT zero (still -g).** Common conceptual trap.
5. **Free-body diagrams (FBDs) and motion equations work together.** FBDs identify forces (Unit 2); kinematic equations describe resulting motion.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Position (x or y):** location relative to reference point. Vector (has direction).
- **Displacement:** change in position. Δx = x_final - x_initial.
- **Distance:** total path length traveled. Scalar (always positive).
- **Velocity (v):** rate of change of position. Vector. v = Δx/Δt.
- **Speed:** magnitude of velocity. Scalar (always positive).
- **Acceleration (a):** rate of change of velocity. Vector. a = Δv/Δt.
- **At rest:** v = 0 (instantaneously). Object can have zero velocity but non-zero acceleration.
- **Constant acceleration kinematic equations** (1D, when a is constant):
  - **v_f = v_i + at.**
  - **Δx = v_i·t + (1/2)at².**
  - **v_f² = v_i² + 2a·Δx.**
  - **Δx = ((v_i + v_f)/2)·t.**
- **Free fall:** acceleration = g = 9.8 m/s² downward (taking down as positive).
- **Projectile motion:** combination of horizontal motion (constant velocity) and vertical motion (constant acceleration g).
  - **Horizontal:** v_x is constant; x = v_x·t.
  - **Vertical:** v_y changes due to gravity; y = v_iy·t - (1/2)g·t² (taking up as positive).
  - **Independence of axes:** horizontal and vertical motions are independent.
- **At peak of projectile motion:** v_y = 0 (instantaneously). But v_x ≠ 0 (still moving horizontally) AND a_y = -g (still accelerating downward).

### Adds for [4]

- **Sign conventions matter.** Take one direction positive (often up = positive, right = positive). Stick with it consistently.
- **Position-time graph:**
  - **Slope = velocity.**
  - Constant slope = constant velocity.
  - Curved = changing velocity (acceleration).
- **Velocity-time graph:**
  - **Slope = acceleration.**
  - **Area under curve = displacement.**
  - Constant velocity = horizontal line.
  - Constant acceleration = straight line.
- **Acceleration-time graph:**
  - Constant acceleration = horizontal line.
  - Area under curve = change in velocity.
- **Common interpretations:**
  - When v and a have SAME sign: speeding up.
  - When v and a have OPPOSITE signs: slowing down.
  - When v = 0 with a ≠ 0: object momentarily stopped but accelerating.
- **Projectile motion analysis:**
  - Decompose initial velocity: v_ix = v_i·cos(θ), v_iy = v_i·sin(θ).
  - Solve horizontal and vertical separately.
  - Time of flight, range, max height all standard problems.
- **Relative motion:** velocity of A relative to B = velocity of A in some frame minus velocity of B in same frame.

### Adds for [5]

- **Why kinematic equations require constant acceleration.** They're derived assuming a = constant. For variable acceleration, must use calculus (Unit 4 of AP Calc) — not on AP Physics 1.
- **Why v = 0 at peak of projectile motion.** Vertical velocity decreases (decelerating against gravity), reaches zero at peak, then starts decreasing further (negative vertical velocity).
- **Why a ≠ 0 at peak.** Gravity is constantly acting; only the velocity changes. The instant the object's vertical velocity is zero, the next instant it starts being negative — meaning the velocity was changing.
- **Independence of axes in projectile motion.** Horizontal velocity is unaffected by vertical motion (no horizontal force). Vertical velocity is unaffected by horizontal motion. They can be analyzed independently. This is the key insight for projectile problems.
- **Why graphs are powerful.** A graph CAPTURES ALL information about motion in one image. Slopes give rates; areas give accumulated changes. Reading graphs efficiently is essential.

## Worked Examples

### Example 1 [3] — Simple kinematic equation

A car at rest accelerates at 2 m/s² for 5 seconds. What's its final velocity?
- v_f = v_i + at = 0 + (2)(5) = 10 m/s.

### Example 2 [3] — Free fall

A ball is dropped from a height of 20 m. How long until it hits the ground?
- y = (1/2)g·t² → 20 = (1/2)(9.8)t² → t² = 4.08 → t ≈ 2.02 s.

### Example 3 [4] — Projectile motion

A ball is thrown horizontally at 10 m/s from a height of 5 m.
- (a) Time to land: 5 = (1/2)(9.8)t² → t = 1.01 s.
- (b) Horizontal distance: x = v_x·t = (10)(1.01) = 10.1 m.

### Example 4 [4] — Projectile at angle

A ball is launched at 20 m/s at 30° above horizontal.
- v_ix = 20·cos(30°) = 17.3 m/s.
- v_iy = 20·sin(30°) = 10 m/s.
- **Time at peak:** v_iy/g = 10/9.8 ≈ 1.02 s.
- **Time of flight:** 2·(1.02) ≈ 2.04 s.
- **Range:** v_ix · time of flight = 17.3 · 2.04 ≈ 35.3 m.
- **Max height:** v_iy²/(2g) = 100/19.6 ≈ 5.10 m.

### Example 5 [4][5] — Conceptual question

At the peak of a vertical throw, what is the velocity? What is the acceleration?
- **Velocity = 0.** (Object has reached top of its arc.)
- **Acceleration = -g (downward).** (Gravity is still acting.)
- This is why the object starts coming down. Velocity is changing even though it's instantaneously zero.

## Top Traps & Common Errors

1. **Confusing velocity and speed.** Velocity is vector; speed is magnitude.
2. **Forgetting that v = 0 doesn't mean a = 0.** At peak of throw, v_y = 0 but a = -g.
3. **Wrong direction for kinematic problems.** Set sign convention; stick with it.
4. **Forgetting independence of axes in projectile motion.** Horizontal and vertical analyzed separately.
5. **Wrong interpretation of slope on graphs.** v-t graph slope is acceleration; x-t graph slope is velocity.
6. **Misapplying area under curve.** v-t graph area = displacement.
7. **Treating acceleration as positive only.** Acceleration can be negative (deceleration).
8. **Wrong gravitational acceleration.** g = 9.8 m/s² (or 10 m/s² for estimates).

## Rubric-Aware Tactics

**For kinematic equations:**
- List known quantities.
- Choose appropriate equation.
- Solve algebraically; substitute numbers last.

**For projectile motion:**
- Decompose initial velocity.
- Analyze horizontal and vertical separately.
- Use time as common variable.

**For graphical questions:**
- Identify type of graph (x-t, v-t, a-t).
- Use slope = next derivative, area = previous integral.

## "Phrases That Score" — verbatim language for FRQs

1. "Velocity is a vector quantity (with direction); speed is the magnitude of velocity (always positive)."
2. "At peak of projectile motion, vertical velocity = 0 but acceleration = g (downward) — gravity continues acting."
3. "In projectile motion, horizontal and vertical components are INDEPENDENT. Horizontal velocity is constant; vertical velocity changes due to gravity."
4. "Slope of position-time graph = velocity. Slope of velocity-time graph = acceleration. Area under velocity-time graph = displacement."
5. "Object speeding up: v and a have same sign. Slowing down: v and a have opposite signs."

## If You Do Nothing Else for This Unit

*Master kinematic equations and apply them with consistent sign conventions. Master projectile motion (horizontal and vertical independent). Memorize: at peak, v_y = 0 but a = -g. Master graph interpretation.*

_lastUpdated: 2026-05-04
_sources: College Board AP Physics 1 CED 2024-25, Princeton Review AP Physics 1 2025, Khan Academy AP Physics 1, Halliday & Resnick *Fundamentals of Physics*
_difficulty: foundational
_relatedUnits: ap-physics-1-unit-2-force-dynamics, ap-physics-1-unit-3-work-energy-power
