# AP Physics C: Electricity and Magnetism — Unit 5: Electromagnetic Induction — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 14–20% of the AP Physics C: E&M exam
- **Sub-topics covered:** Faraday's law; Lenz's law; motional EMF; inductance; LR circuits; LC circuits; energy in magnetic field; Maxwell's equations summary.
- **Where this unit appears on the exam:** Faraday's law calculations. Lenz's law direction problems. Inductors in circuits (LR, LC). Energy stored in inductor.

## Big Ideas

1. **Faraday's law:** EMF = −dΦ_B/dt.
2. **Lenz's law:** induced current opposes change in flux.
3. **Motional EMF:** moving conductor in field generates EMF.
4. **Inductance:** L = NΦ/I (self-inductance); voltage = −L dI/dt.
5. **Energy in inductor:** U = ½LI²; energy density u = B²/(2μ₀).

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Faraday's law:** EMF = −dΦ_B/dt.
- **For N turns:** EMF = −N dΦ_B/dt.
- **Lenz's law:** induced current creates field opposing change in flux.
- **Motional EMF:** rod of length L moving at v perpendicular to B: EMF = BLv.
- **Inductance (self):**
  - **L = NΦ/I.**
  - **EMF across inductor:** EMF_L = −L dI/dt.
  - **Solenoid inductance:** L = μ₀n²V (V = volume).
  - **Units:** Henry (H) = V·s/A.
- **Energy in inductor:** U = ½LI².
- **Energy density of magnetic field:** u = B²/(2μ₀).
- **LR circuit:**
  - **Charging (current rising):** I(t) = (ε/R)(1 − e^(−Rt/L)).
  - **Decaying (battery removed):** I(t) = I₀ e^(−Rt/L).
  - **τ = L/R** is time constant.
- **LC circuit (oscillating):**
  - **Q oscillates;** energy transfers between C and L.
  - **ω = 1/√(LC).**
  - **T = 2π√(LC).**
- **Maxwell's equations (summary):**
  - **Gauss's law (E):** ∮E·dA = Q_enc/ε₀.
  - **Gauss's law (B):** ∮B·dA = 0 (no magnetic monopoles).
  - **Faraday's law:** ∮E·dl = −dΦ_B/dt.
  - **Ampère-Maxwell:** ∮B·dl = μ₀(I_enc + ε₀ dΦ_E/dt).

### Adds for [4]

- **Why motional EMF = BLv:**
  - Magnetic force on charges in moving rod: F = qv × B.
  - Charges accumulate; create E field opposing further accumulation.
  - At equilibrium: qE = qvB → E = vB → V across rod = EL = BLv.
- **LR circuit derivation:**
  - Loop rule: ε − IR − L dI/dt = 0.
  - Solve: I(t) = (ε/R)(1 − e^(−Rt/L)).
- **LC circuit derivation:**
  - Energy conservation: Q²/(2C) + ½LI² = const.
  - Differentiate: gives Q(t) = Q₀ cos(ωt) with ω = 1/√(LC).

### Adds for [5]

- **Why Lenz's law required:** energy conservation (induced current must oppose, otherwise free energy).
- **Why displacement current:** completes Maxwell's equations; predicts EM waves.

## Worked Examples

### Example 1 [3] — Faraday's law

Coil with N=200 turns, area 0.05 m². B changes from 0 to 0.4 T in 0.2 s. EMF?
- **ΔΦ_B per turn = ΔB·A = 0.4·0.05 = 0.02 Wb.**
- **EMF = N·ΔΦ_B/Δt = 200·0.02/0.2 = 20 V.**

### Example 2 [3] — Motional EMF

Rod 0.5 m moving at 4 m/s perpendicular in B = 2 T. EMF?
- **EMF = BLv = 2·0.5·4 = 4 V.**

### Example 3 [4] — LR circuit

L = 0.1 H, R = 10 Ω, ε = 12 V. After t = τ, current?
- **τ = L/R = 0.01 s.**
- **At t = τ:** I = (ε/R)(1 − 1/e) = 1.2·(0.632) = 0.758 A.

### Example 4 [4] — LC oscillation

L = 1 mH, C = 1 μF. Frequency?
- **ω = 1/√(LC) = 1/√(10⁻⁹) = 31623 rad/s.**
- **f = ω/(2π) ≈ 5033 Hz.**

### Example 5 [5] — Lenz's law

Bar magnet's N pole moves down toward horizontal coil. Direction of induced current?
- **Approaching N pole → flux into coil (downward) increases.**
- **Lenz:** induced current opposes → produces upward flux.
- **Right-hand rule:** counterclockwise as viewed from above.

## Top Traps & Common Errors

1. **Forgetting N (number of turns)** in Faraday's law for coils.
2. **Sign in Faraday's law:** negative gives Lenz's direction.
3. **L dI/dt** is voltage drop across inductor.
4. **τ for LR is L/R** (units: H/Ω = s).
5. **Lenz: opposes CHANGE in flux,** not the field itself.

## Rubric-Aware Tactics

**For Faraday:** identify Φ_B; differentiate.
**For Lenz:** determine direction of change; induced current opposes.
**For LR:** identify charging vs decaying; use τ = L/R.

## "Phrases That Score" — verbatim language for FRQs

1. "Faraday's law: EMF = −dΦ_B/dt for a single loop; for N turns, EMF = −N dΦ_B/dt."
2. "Lenz's law: the induced current flows in a direction that opposes the change in magnetic flux through the loop, by conservation of energy."
3. "Motional EMF in a rod of length L moving at velocity v perpendicular to magnetic field B: EMF = BLv."
4. "Self-inductance L = NΦ/I; voltage across inductor EMF_L = −L dI/dt. Energy stored: U = ½LI². Energy density of magnetic field: u = B²/(2μ₀)."
5. "LR circuit time constant τ = L/R; LC circuit oscillates at angular frequency ω = 1/√(LC). Maxwell's equations unify electricity and magnetism, with the displacement current term in Ampère-Maxwell predicting electromagnetic waves."

## If You Do Nothing Else for This Unit

*Master Faraday (EMF = −dΦ/dt). Master Lenz (induced opposes change). Master motional EMF (BLv). Master inductance and energy. Master LR and LC time constants.*

_lastUpdated: 2026-05-04
_sources: College Board AP Physics C: E&M CED 2024-25, Princeton Review AP Physics C 2025, Halliday-Resnick-Walker
_difficulty: advanced
_relatedUnits: ap-physics-c-em-unit-4-magnetic-fields
