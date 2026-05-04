# AP Physics 2 — Unit 4: Electric Circuits — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 13–17% of the AP Physics 2 exam
- **Sub-topics covered:** current, resistance, Ohm's law; resistors in series and parallel; power; Kirchhoff's laws; capacitors; RC circuits.
- **Where this unit appears on the exam:** Ohm's law (V = IR). Series vs parallel resistance. Kirchhoff's loop and junction rules. Power (P = IV).

## Big Ideas

1. **Current** = charge flow per unit time (I = ΔQ/Δt).
2. **Ohm's law:** V = IR.
3. **Series:** R_total = R₁ + R₂ + ... ; current same; voltages add.
4. **Parallel:** 1/R_total = 1/R₁ + 1/R₂ + ... ; voltage same; currents add.
5. **Kirchhoff's laws:** charge conservation (junction) + energy conservation (loop).

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Current (I):** I = ΔQ/Δt. Units: Ampere (A) = C/s.
- **Resistance (R):** V = IR. Units: Ohm (Ω) = V/A.
- **Resistivity:** R = ρL/A (ρ = resistivity, L = length, A = cross-section).
- **Ohm's law:** V = IR (linear; ohmic materials).
- **Power:**
  - **P = IV** (general).
  - **P = I²R** (using V = IR).
  - **P = V²/R.**
  - Units: Watt (W) = J/s.
- **Series circuits:**
  - **Same current** through all elements.
  - **Voltages add.**
  - **R_eq = R₁ + R₂ + ... .**
- **Parallel circuits:**
  - **Same voltage** across all elements.
  - **Currents add.**
  - **1/R_eq = 1/R₁ + 1/R₂ + ... .**
- **Kirchhoff's laws:**
  - **Junction (current) rule:** sum of currents in = sum out (conservation of charge).
  - **Loop (voltage) rule:** sum of voltage changes around loop = 0 (conservation of energy).
- **Capacitors:**
  - **C = Q/V** (capacitance).
  - **Stores charge.**
  - **Parallel-plate:** C = ε₀A/d.
  - **Energy stored:** U = ½CV² = ½QV.
  - **Series:** 1/C_eq = 1/C₁ + 1/C₂ (opposite of resistors!).
  - **Parallel:** C_eq = C₁ + C₂.
- **RC circuits:**
  - **Charging:** Q(t) = CV(1 − e^(−t/RC)).
  - **Discharging:** Q(t) = Q₀ e^(−t/RC).
  - **τ = RC** is time constant.

### Adds for [4]

- **Internal resistance** of battery: ε = IR_external + IR_internal.
- **Ammeter** in series; very low resistance.
- **Voltmeter** in parallel; very high resistance.

### Adds for [5]

- **Why combine resistors:** simplify complex circuits.
- **Why use Kirchhoff's:** when no simple series/parallel reduction.

## Worked Examples

### Example 1 [3] — Ohm's law

10 V across 5 Ω resistor. Current?
- **I = V/R = 10/5 = 2 A.**

### Example 2 [3] — Series

Two resistors in series: 4 Ω and 6 Ω. R_eq?
- **R_eq = 4 + 6 = 10 Ω.**

### Example 3 [4] — Parallel

Two resistors in parallel: 4 Ω and 6 Ω. R_eq?
- **1/R_eq = 1/4 + 1/6 = 3/12 + 2/12 = 5/12.**
- **R_eq = 12/5 = 2.4 Ω.**
- **Note:** parallel R < smallest individual R.

### Example 4 [4] — Power

100 W bulb at 120 V. Current?
- **P = IV → I = P/V = 100/120 = 0.83 A.**
- **R = V/I = 120/0.83 ≈ 144 Ω.**

### Example 5 [5] — RC time constant

R = 1 kΩ, C = 1 μF. τ?
- **τ = RC = 1000 · 10⁻⁶ = 10⁻³ s = 1 ms.**

## Top Traps & Common Errors

1. **Wrong series/parallel for capacitors.** Capacitors are opposite of resistors.
2. **Power formula choice.** P = IV (general); P = I²R or V²/R as needed.
3. **Forgetting Kirchhoff's signs** when summing voltages around loop.
4. **Confusing ammeter and voltmeter placement.**

## Rubric-Aware Tactics

**For circuit analysis:** identify series/parallel; reduce step-by-step.
**For complex circuits:** use Kirchhoff's loop and junction rules.
**For power:** identify which formula applies given known quantities.

## "Phrases That Score" — verbatim language for FRQs

1. "Ohm's law V = IR relates voltage, current, and resistance for an ohmic conductor. Power dissipated: P = IV = I²R = V²/R."
2. "Resistors in series add: R_eq = R₁ + R₂ + ... Same current; voltages add. Resistors in parallel: 1/R_eq = 1/R₁ + 1/R₂ + ... Same voltage; currents add."
3. "Capacitors are opposite of resistors: in PARALLEL they add (C_eq = C₁ + C₂); in SERIES they reciprocal-add (1/C_eq = 1/C₁ + 1/C₂)."
4. "Kirchhoff's junction rule (sum of currents in = sum out) reflects conservation of charge; Kirchhoff's loop rule (sum of voltage changes around closed loop = 0) reflects conservation of energy."
5. "RC circuit time constant τ = RC characterizes charging or discharging. After 5τ, capacitor is ~99% charged or discharged."

## If You Do Nothing Else for This Unit

*Master V = IR. Master series vs parallel for resistors AND capacitors. Master Kirchhoff's laws. Master power formulas (P = IV = I²R = V²/R). Master capacitor energy and RC time constant.*

_lastUpdated: 2026-05-04
_sources: College Board AP Physics 2 CED 2024-25, Princeton Review AP Physics 2 2025, Knight
_difficulty: foundational
_relatedUnits: ap-physics-2-unit-3-electric-force-field-potential, ap-physics-2-unit-5-magnetism
