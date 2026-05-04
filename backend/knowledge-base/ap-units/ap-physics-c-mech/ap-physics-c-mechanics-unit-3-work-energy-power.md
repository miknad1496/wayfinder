# AP Physics C: Mechanics — Unit 3: Work, Energy, and Power — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 15–25% of the AP Physics C: Mechanics exam
- **Sub-topics covered:** work (with variable forces, integral form); kinetic energy; potential energy; conservation of energy; power; conservative vs non-conservative forces; relating force to potential energy.
- **Where this unit appears on the exam:** Calculus-based work integral (W = ∫F·dx). Spring potential energy. Energy conservation problems with non-trivial force functions. F = −dU/dx relationship.

## Big Ideas

1. **Work:** W = ∫F·dr (integral; variable force).
2. **Kinetic energy:** KE = ½mv².
3. **Work-energy theorem:** W_net = ΔKE.
4. **Conservation of energy:** mechanical energy conserved if only conservative forces act.
5. **Force from potential:** F = −dU/dx.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Work:**
  - **W = F·d cos θ** (constant force).
  - **W = ∫F·dr** (variable force; integral along path).
  - **Units:** Joule (J) = N·m.
- **Kinetic energy:** KE = ½mv².
- **Work-energy theorem:** W_net = ΔKE.
- **Power:**
  - **P = dW/dt** (instantaneous).
  - **P = F·v** (force on object moving at velocity v).
  - **Units:** Watt (W) = J/s.
- **Potential energy types:**
  - **Gravitational (near Earth):** U_g = mgh.
  - **Gravitational (general):** U = −GMm/r.
  - **Spring:** U_s = ½kx².
- **Conservative force:**
  - **Work depends only on endpoints,** not path.
  - **Has associated potential energy U.**
  - **Examples:** gravity, spring force.
- **Non-conservative force:**
  - **Work depends on path.**
  - **No associated U.**
  - **Examples:** friction, air resistance.
- **Conservation of energy:**
  - **If only conservative forces:** KE + U = constant.
  - **With non-conservative:** ΔKE + ΔU = W_nc.
- **F = −dU/dx:**
  - Force from potential is negative gradient.
  - **Equilibrium:** dU/dx = 0.
  - **Stable equilibrium:** d²U/dx² > 0 (minimum of U).
  - **Unstable:** d²U/dx² < 0 (maximum of U).

### Adds for [4]

- **Calculating work via integral:**
  - **F(x) = kx (spring):** W = ∫₀^x kx' dx' = ½kx².
  - **F(x) = −kx (Hooke's, on object):** Work done BY spring = −½kx².
- **Power for variable force:**
  - **P(t) = F(t)·v(t).**
  - **Average:** P_avg = W/t.

### Adds for [5]

- **Why F = −dU/dx:** force points downhill on potential energy curve.
- **Why energy conservation powerful:** sidesteps force/time analysis.

## Worked Examples

### Example 1 [3] — Work-energy

5 N force pulls 2 kg block 3 m horizontally. Initial v=0. Final v?
- **W = Fd = 5·3 = 15 J.**
- **W = ΔKE = ½mv² → v = √(2W/m) = √15 = 3.87 m/s.**

### Example 2 [3] — Spring energy

Spring k = 200 N/m compressed 0.1 m. Energy stored?
- **U_s = ½kx² = ½·200·0.01 = 1 J.**

### Example 3 [4] — Conservation

Block of 1 kg slides down frictionless incline from height 5 m. Speed at bottom?
- **mgh = ½mv².**
- **v = √(2gh) = √100 = 10 m/s.**

### Example 4 [4] — Variable force work

F(x) = 3x² N. Find work to move from x=0 to x=2 m.
- **W = ∫₀² 3x² dx = x³|₀² = 8 J.**

### Example 5 [5] — Force from U

U(x) = ½kx² + ⅓ax³. Force?
- **F = −dU/dx = −kx − ax².**

## Top Traps & Common Errors

1. **Sign of work** by gravity (positive going down).
2. **Forgetting work-energy includes ALL forces.** Net work, not just one.
3. **Spring energy ½kx²,** not kx.
4. **Conservation of mechanical energy fails** if non-conservative forces (friction).
5. **F = −dU/dx, not +dU/dx.**

## Rubric-Aware Tactics

**For energy problems:** identify initial and final states; apply conservation.
**For work integral:** ∫F·dx along path.
**For power:** P = F·v.

## "Phrases That Score" — verbatim language for FRQs

1. "Work done by a force is W = ∫F·dr along the path. For constant force in 1D: W = Fd cos θ. The work-energy theorem states W_net = ΔKE."
2. "Conservative forces (gravity, spring force) have associated potential energies; their work depends only on endpoints. Total mechanical energy KE + U is conserved when only conservative forces act."
3. "The force associated with a potential energy is F = −dU/dx. The system is at equilibrium where dU/dx = 0; stable equilibrium at minima (d²U/dx² > 0); unstable at maxima."
4. "Spring potential energy U_s = ½kx² (x measured from equilibrium). Spring force F = −kx (Hooke's law, restoring)."
5. "Power is the rate of doing work: P = dW/dt = F·v. Total work over time t: W = ∫P dt."

## If You Do Nothing Else for This Unit

*Master W = ∫F·dr. Master conservation of energy. Master spring PE (½kx²). Master F = −dU/dx. Master power (P = F·v).*

_lastUpdated: 2026-05-04
_sources: College Board AP Physics C: Mechanics CED 2024-25, Princeton Review AP Physics C 2025, Halliday-Resnick-Walker
_difficulty: intermediate
_relatedUnits: ap-physics-c-mechanics-unit-2-newtons-laws, ap-physics-c-mechanics-unit-4-momentum
