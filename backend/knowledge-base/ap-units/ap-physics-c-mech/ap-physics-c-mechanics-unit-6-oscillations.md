# AP Physics C: Mechanics — Unit 6: Oscillations — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 5–10% of the AP Physics C: Mechanics exam
- **Sub-topics covered:** simple harmonic motion (SHM); springs; pendulums; SHM equations of motion; energy in SHM; physical pendulum.
- **Where this unit appears on the exam:** SHM differential equation. x(t) = A cos(ωt + φ). Period of spring-mass and pendulum. Energy oscillation.

## Big Ideas

1. **SHM:** restoring force proportional to displacement (F = −kx).
2. **Differential equation:** d²x/dt² = −(k/m)x.
3. **Solution:** x(t) = A cos(ωt + φ), with ω = √(k/m).
4. **Period:** T = 2π/ω = 2π√(m/k) for spring; T = 2π√(L/g) for pendulum.
5. **Energy oscillates** between KE and PE; total constant.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Simple harmonic motion (SHM):**
  - **Restoring force:** F = −kx (Hooke's law for spring; small-angle pendulum).
  - **Differential equation:** d²x/dt² = −(k/m)x.
- **Solution:**
  - **x(t) = A cos(ωt + φ).**
  - **A:** amplitude.
  - **ω = √(k/m):** angular frequency.
  - **φ:** phase constant (depends on initial conditions).
- **Velocity and acceleration:**
  - **v(t) = −Aω sin(ωt + φ).**
  - **a(t) = −Aω² cos(ωt + φ) = −ω²x.**
- **Period and frequency:**
  - **T = 2π/ω.**
  - **f = 1/T = ω/(2π).**
- **Spring-mass system:**
  - **ω = √(k/m).**
  - **T = 2π√(m/k).**
- **Simple pendulum (small angle):**
  - **ω = √(g/L).**
  - **T = 2π√(L/g).**
  - **Independent of mass and amplitude (for small θ).**
- **Energy in SHM:**
  - **U(x) = ½kx².**
  - **KE(x) = ½m(v_max² − ω²x²)... actually:** KE + U = ½kA².
  - **At x = ±A:** all PE; KE = 0.
  - **At x = 0:** all KE; PE = 0.
  - **Total E = ½kA².**

### Adds for [4]

- **Physical pendulum:**
  - **T = 2π√(I/(Mgd)),** where d is distance from pivot to CM.
- **Initial conditions:**
  - **Amplitude A** depends on initial position and velocity.
  - **Phase φ** depends on initial conditions.
  - **At t=0, x=A, v=0:** φ = 0.
- **v_max = Aω** (at equilibrium).
- **a_max = Aω²** (at extremes).

### Adds for [5]

- **Why SHM ubiquitous:** any system near stable equilibrium approximates SHM.
- **Damped oscillation:** energy decreases over time (not in AP scope generally).

## Worked Examples

### Example 1 [3] — Period of spring

Mass 0.5 kg on spring k = 200 N/m. Period?
- **T = 2π√(m/k) = 2π√(0.5/200) = 2π·0.05 = 0.314 s.**

### Example 2 [3] — Period of pendulum

Pendulum length 1 m. Period?
- **T = 2π√(L/g) = 2π√(0.1) = 2π·0.316 = 1.99 s ≈ 2 s.**

### Example 3 [4] — SHM solution

Spring-mass system k = 100 N/m, m = 1 kg, A = 0.1 m. Find x(t) if released from rest at x = A.
- **ω = √(100/1) = 10 rad/s.**
- **At t=0, x=A=0.1, v=0:** x(t) = 0.1 cos(10t).

### Example 4 [4] — Energy

For above system, max velocity?
- **Total E = ½kA² = ½·100·0.01 = 0.5 J.**
- **v_max:** all energy KE → ½mv_max² = 0.5 → v_max = 1 m/s.
- **Or:** v_max = Aω = 0.1·10 = 1 m/s.

### Example 5 [5] — Physical pendulum

Rod (mass M, length L) pivoted at end, swinging as pendulum. Period?
- **I = ML²/3 about end.**
- **d = L/2** (CM to pivot).
- **T = 2π√(I/(Mgd)) = 2π√((ML²/3)/(Mg·L/2)) = 2π√(2L/(3g)).**

## Top Traps & Common Errors

1. **Pendulum approximation only for small angles.**
2. **Spring period independent of amplitude;** depends on m and k.
3. **Pendulum period independent of mass.**
4. **Forgetting energy distribution:** at extremes all PE; at equilibrium all KE.
5. **Wrong ω for spring:** ω = √(k/m), not √(m/k).

## Rubric-Aware Tactics

**For SHM:** identify spring constant or pendulum length; calculate ω, T.
**For energy:** total = ½kA²; partition between KE and PE.
**For physical pendulum:** identify I and d.

## "Phrases That Score" — verbatim language for FRQs

1. "Simple harmonic motion arises whenever the restoring force is proportional to displacement: F = −kx, leading to d²x/dt² = −(k/m)x. The solution is x(t) = A cos(ωt + φ) with angular frequency ω = √(k/m)."
2. "For a spring-mass system: T = 2π√(m/k). For a simple pendulum (small-angle): T = 2π√(L/g) — independent of mass and amplitude."
3. "Energy in SHM: total mechanical energy E = ½kA² is constant. At maximum displacement (x = ±A), all energy is potential; at equilibrium (x = 0), all energy is kinetic."
4. "Velocity in SHM: v(t) = −Aω sin(ωt + φ); maximum velocity v_max = Aω at equilibrium. Acceleration: a(t) = −ω²x(t); maximum acceleration at extremes."
5. "Physical pendulum: T = 2π√(I/(Mgd)), where I is moment of inertia about the pivot and d is distance from pivot to center of mass."

## If You Do Nothing Else for This Unit

*Master SHM differential equation and solution. Master spring (T = 2π√(m/k)) and pendulum (T = 2π√(L/g)). Master energy distribution (E_total = ½kA²). Master physical pendulum.*

_lastUpdated: 2026-05-04
_sources: College Board AP Physics C: Mechanics CED 2024-25, Princeton Review AP Physics C 2025, Halliday-Resnick-Walker
_difficulty: intermediate
_relatedUnits: ap-physics-c-mechanics-unit-3-work-energy-power, ap-physics-c-mechanics-unit-7-gravitation
