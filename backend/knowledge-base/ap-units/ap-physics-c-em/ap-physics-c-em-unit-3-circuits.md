# AP Physics C: Electricity and Magnetism — Unit 3: Electric Circuits — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 17–23% of the AP Physics C: E&M exam
- **Sub-topics covered:** current; resistance; resistivity; Ohm's law; Kirchhoff's laws; series/parallel resistors; power; RC circuits (charging/discharging with calculus); ammeter/voltmeter use.
- **Where this unit appears on the exam:** RC circuit differential equations are a key calculus differentiator from Physics 2. Kirchhoff's laws for multi-loop circuits.

## Big Ideas

1. **I = dQ/dt** (current is rate of charge flow).
2. **Ohm's law** V = IR for ohmic conductors.
3. **Kirchhoff's laws:** charge conservation (junction), energy conservation (loop).
4. **Series/parallel** rules for resistors.
5. **RC circuits:** time constant τ = RC; exponential charging/discharging.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Current:** I = dQ/dt; units Ampere (A) = C/s.
- **Resistance:** V = IR; units Ohm (Ω).
- **Resistivity:** R = ρL/A.
- **Power:** P = IV = I²R = V²/R.
- **Series resistors:** R_eq = R₁ + R₂ + ...; same I.
- **Parallel resistors:** 1/R_eq = 1/R₁ + 1/R₂ + ...; same V.
- **Kirchhoff's laws:**
  - **Junction:** ΣI_in = ΣI_out.
  - **Loop:** ΣΔV = 0 around any closed loop.
- **EMF (ε):** energy per charge from battery.
- **Internal resistance r:** ε = IR_external + Ir.
- **RC circuit (charging):**
  - **q(t) = Cε(1 − e^(−t/RC)).**
  - **i(t) = (ε/R) e^(−t/RC).**
  - **τ = RC** is time constant.
- **RC circuit (discharging):**
  - **q(t) = Q₀ e^(−t/RC).**
  - **i(t) = (Q₀/RC) e^(−t/RC).**
- **Ammeter:** in series; ideally 0 resistance.
- **Voltmeter:** in parallel; ideally infinite resistance.

### Adds for [4]

- **RC circuit derivation (charging):**
  - Kirchhoff's loop: ε − iR − q/C = 0.
  - Substitute i = dq/dt: R(dq/dt) + q/C = ε.
  - Solve: q(t) = Cε(1 − e^(−t/RC)).
- **Power balance in resistor:** electrical power → heat (P = I²R).
- **Multi-loop circuits:** apply Kirchhoff's laws systematically; solve linear system.

### Adds for [5]

- **Why exponential decay/approach:** characteristic of first-order linear differential equations.
- **Why τ = RC sets timescale:** product of resistance and capacitance.

## Worked Examples

### Example 1 [3] — Power

100 W bulb at 120 V. Resistance and current?
- **I = P/V = 100/120 = 0.833 A.**
- **R = V/I = 144 Ω** (or V²/P = 120²/100 = 144 Ω).

### Example 2 [3] — Series-parallel

Three 6 Ω resistors: 2 in parallel, then series with the third.
- **Parallel pair:** 1/R_eq = 1/6 + 1/6 = 2/6 → R_eq = 3 Ω.
- **In series with third:** 3 + 6 = 9 Ω.

### Example 3 [4] — RC charging

R = 1 kΩ, C = 1 μF, ε = 10 V. Charge after t = τ?
- **τ = RC = 10⁻³ s.**
- **At t = τ:** q = Cε(1 − 1/e) = (10⁻⁶)(10)(0.632) = 6.32×10⁻⁶ C = 6.32 μC.

### Example 4 [4] — Discharge

C = 100 μF charged to 50 V; discharges through 10 kΩ resistor. Initial current? Time constant?
- **i₀ = V/R = 50/10000 = 5 mA.**
- **τ = RC = 10⁴ · 10⁻⁴ = 1 s.**

### Example 5 [5] — Multi-loop Kirchhoff

Two batteries with internal resistance, multiple loops. Set up equations.
- **Define currents in each branch.**
- **Junction rule** at nodes.
- **Loop rule** for each independent loop.
- **Solve simultaneous equations.**

## Top Traps & Common Errors

1. **Mixed up series/parallel for resistors vs capacitors** (opposite).
2. **Forgetting internal resistance** of battery.
3. **RC time constant** sets timescale; 5τ ≈ fully charged/discharged.
4. **Sign conventions** for Kirchhoff loop: drop in V across resistor in direction of current.

## Rubric-Aware Tactics

**For circuits:** simplify series/parallel first; apply Kirchhoff for what remains.
**For RC:** identify charging vs discharging; use τ = RC.

## "Phrases That Score" — verbatim language for FRQs

1. "Kirchhoff's junction rule (ΣI_in = ΣI_out) reflects conservation of charge; the loop rule (ΣΔV = 0 around closed loop) reflects conservation of energy."
2. "For an RC charging circuit, applying Kirchhoff's loop and substituting i = dq/dt yields R(dq/dt) + q/C = ε with solution q(t) = Cε(1 − e^(−t/RC))."
3. "The time constant τ = RC characterizes the rate of charging or discharging. After 5τ, capacitor is approximately fully charged or discharged."
4. "Power dissipated in resistor: P = IV = I²R = V²/R. Choose form based on what's known."
5. "Resistors in series add (R_eq = ΣR); in parallel reciprocal-add (1/R_eq = Σ1/R). Capacitors are opposite: parallel add; series reciprocal-add."

## If You Do Nothing Else for This Unit

*Master Kirchhoff's laws. Master series/parallel resistors. Master RC charging/discharging (q(t), i(t), τ). Power formulas.*

_lastUpdated: 2026-05-04
_sources: College Board AP Physics C: E&M CED 2024-25, Princeton Review AP Physics C 2025, Halliday-Resnick-Walker
_difficulty: advanced
_relatedUnits: ap-physics-c-em-unit-2-conductors-capacitors, ap-physics-c-em-unit-4-magnetic-fields
