# AP Chemistry — Unit 9: Applications of Thermodynamics (Entropy, Free Energy, Electrochemistry) — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 7–9% of the AP Chemistry exam
- **Sub-topics covered:**
  - 9.1 Introduction to Entropy
  - 9.2 Absolute Entropy and Entropy Change
  - 9.3 Gibbs Free Energy and Thermodynamic Favorability
  - 9.4 Thermodynamic and Kinetic Control
  - 9.5 Free Energy and Equilibrium
  - 9.6 Coupled Reactions
  - 9.7 Galvanic (Voltaic) and Electrolytic Cells
  - 9.8 Cell Potential and Free Energy
  - 9.9 Cell Potential Under Nonstandard Conditions
  - 9.10 Electrolysis and Faraday's Law
- **Where this unit appears on the exam:** ΔG° = ΔH° − TΔS° calculations are essentially guaranteed. The "three Great Connections" (ΔG° = −RT·ln K, ΔG° = −nFE°, K ↔ E°) appear in nearly every exam. Galvanic cell diagrams + cell potential calculations are perennial FRQs. Electrolysis with Faraday's law (charge → moles of metal deposited) is a common quantitative FRQ. Thermodynamic vs kinetic control comes up as a conceptual MCQ. Coupled reactions (using a favorable reaction to drive an unfavorable one) is a higher-order [5] move that occasionally appears.

## Big Ideas

1. **Entropy is a measure of disorder / multiplicity.** More microstates accessible to a system = higher entropy. Gas > liquid > solid. More moles = higher entropy. Higher temperature = higher entropy.
2. **Gibbs free energy combines enthalpy and entropy.** ΔG = ΔH − TΔS. Negative ΔG = thermodynamically favorable (spontaneous in the direction written). Positive ΔG = unfavorable (spontaneous in reverse).
3. **Three Great Connections link thermodynamics to equilibrium and electrochemistry:**
   - ΔG° = −RT·ln K
   - ΔG° = −nFE°
   - Therefore: ln K = nFE°/(RT)
4. **Galvanic cells: spontaneous redox does work.** A favorable redox reaction (positive E°cell) generates electricity. Electrons flow from anode (oxidation) to cathode (reduction) through an external circuit.
5. **Electrolytic cells: external power forces non-spontaneous redox.** Apply voltage to drive a redox reaction backward (negative E°cell forced positive by external power). Used industrially for metal refining, electroplating, electrolysis of water.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Entropy (S) basics:** unit J/(mol·K). Measure of disorder/randomness/multiplicity of microstates.
- **Sign predictions for ΔS:**
  - Gas > liquid > solid → going from solid to gas INCREASES S (ΔS > 0).
  - Increase moles of gas → ΔS > 0.
  - Decrease moles of gas → ΔS < 0.
  - Mixing → ΔS > 0.
  - Dissolving solid in liquid → ΔS > 0 (usually).
  - Increasing temperature → S increases.
- **Standard entropy change:** ΔS°rxn = Σ(n × S° products) − Σ(n × S° reactants). Same form as ΔH°f formula but with absolute entropies (S° of an element ≠ 0; entropy is absolute, unlike enthalpy of formation).
- **Gibbs free energy:** G = H − TS. For a process: ΔG = ΔH − TΔS.
- **Sign of ΔG and favorability:**
  - ΔG < 0: thermodynamically favorable (forward reaction).
  - ΔG > 0: thermodynamically UNFAVORABLE (reverse direction is favored).
  - ΔG = 0: at equilibrium.
- **Combinations of ΔH and ΔS:**
  - ΔH < 0, ΔS > 0: always favorable at all T (ΔG always negative).
  - ΔH > 0, ΔS < 0: always unfavorable at all T (ΔG always positive).
  - ΔH < 0, ΔS < 0: favorable at LOW T (TΔS small).
  - ΔH > 0, ΔS > 0: favorable at HIGH T (TΔS dominates).
- **Standard ΔG°rxn from ΔG°f:**
  - ΔG°rxn = Σ(n × ΔG°f products) − Σ(n × ΔG°f reactants).
  - Or compute ΔG° = ΔH° − TΔS° from separately calculated ΔH° and ΔS°.
- **Electrochemical cell components:**
  - Anode = where oxidation occurs (electrons LEAVE). Memory aid: "AnOx" — anode oxidation. Negative terminal in galvanic cells; positive in electrolytic.
  - Cathode = where reduction occurs (electrons ARRIVE). Positive terminal in galvanic; negative in electrolytic.
  - Salt bridge: maintains electrical neutrality by allowing ion flow between half-cells.
  - External circuit: where electrons travel from anode to cathode (the useful current).
- **Standard reduction potentials (E°):** tabulated for each half-reaction at standard conditions (1 M, 1 atm, 25°C). Higher E° = stronger oxidizing agent (more eager to be reduced).
- **Cell potential calculation:** E°cell = E°cathode − E°anode (both values from a reduction potential table; do NOT flip the anode value).
- **E°cell sign and favorability:**
  - E°cell > 0 → spontaneous galvanic reaction.
  - E°cell < 0 → not spontaneous; must be driven (electrolytic).
- **ΔG° = −nFE°:**
  - n = moles of electrons transferred.
  - F = Faraday constant = 96,485 C/mol e⁻.
  - E° in volts; ΔG° in J (or J/mol).
  - Spontaneous redox (E° > 0) gives ΔG° < 0 ✓.
- **Electrolysis quantification (Faraday's law):**
  - Charge Q = It (current × time).
  - Moles of electrons = Q / F.
  - Moles of substance deposited or evolved = moles of e⁻ / n (where n is the electron stoichiometric coefficient in the half-reaction).

### Adds for [4]

- **Standard state conventions for E°:**
  - 1 M for aqueous species.
  - 1 atm for gases.
  - 25°C (298 K).
  - Pure solid for metals.
- **Standard hydrogen electrode (SHE)** is the reference: 2 H⁺ + 2 e⁻ → H₂(g), E° = 0 V exactly (by definition).
- **Reading the activity series from reduction potentials:** more positive E° → more easily reduced → "less active" metal. Less positive (or more negative) E° → harder to reduce → "more active" metal. Lithium is at one end (−3.05 V); fluorine at the other (+2.87 V).
- **Predicting redox direction.** If you couple two half-reactions, the one with the HIGHER E° goes as REDUCTION (cathode); the one with LOWER E° flips to OXIDATION (anode). Then E°cell = E°cathode − E°anode > 0.
- **Free energy from cell potential** (the [4] application): nFE° gives ΔG° in joules. For example, E°cell = +1.10 V with n = 2: ΔG° = −(2)(96485)(1.10) = −212,300 J = −212 kJ. Strongly favorable.
- **Connection to K:** combining ΔG° = −RT·ln K with ΔG° = −nFE° gives ln K = nFE°/(RT). At 25°C: log K = nE°/(0.0592). This means a small E°cell can correspond to a large K because of the n factor.
- **Nernst equation** (concentration effects on E):
  - E = E° − (RT/nF)·ln Q
  - At 25°C: E = E° − (0.0592/n)·log Q
  - When Q < 1 (more reactants than products): log Q < 0, so E > E°. The cell potential is HIGHER under non-standard conditions favoring reactants.
  - When Q > 1: E < E°.
  - At Q = K (equilibrium): E = 0.
- **Concentration cells:** two half-cells with the same species but different concentrations. The "spontaneous" direction is dilute → concentrated for the cathode side (i.e., the more dilute solution provides a higher driving force for "diluting" the more concentrated one).
- **Faraday's law worked through:**
  - 1 ampere × 1 second = 1 coulomb.
  - 1 mole of electrons = 96,485 C (Faraday constant).
  - For metal deposition: M^(n+) + n e⁻ → M(s). Moles of M = moles of e⁻ / n.
- **Stoichiometric link from charge to mass:**
  - mass of metal deposited = (I × t / F) × (M / n)
  - where M = molar mass of metal, n = charge on metal ion.
- **Galvanic vs electrolytic comparison:**
  - Galvanic: spontaneous (E° > 0, ΔG° < 0). Battery, fuel cell. Electrons flow from − to + outside (anode to cathode).
  - Electrolytic: forced by external power (E° < 0 made positive by applied voltage). Electroplating, electrolysis. Anode is + terminal; cathode is − terminal.

### Adds for [5]

- **The deeper interpretation of entropy.** Entropy is proportional to ln(W), where W = number of microstates. Statistical mechanics gives S = k_B·ln(W). A solid has few accessible microstates (atoms locked in lattice); a gas has many (molecules translating, rotating, vibrating in 3D). This is why ΔS > 0 for melting and vaporization — the system gains accessible microstates.
- **Why Gibbs free energy specifically.** ΔG combines the system's enthalpy and entropy contributions in a way that — when the surroundings exchange heat reversibly with the system — captures the TOTAL entropy change of universe. ΔG_system < 0 ⇔ ΔS_universe > 0 ⇔ spontaneous.
- **Coupled reactions (the [5] move).** A non-spontaneous reaction (ΔG > 0) can be driven by coupling it to a more strongly spontaneous reaction (ΔG << 0) such that the net ΔG < 0. Biological example: ATP hydrolysis (ΔG° ≈ −31 kJ/mol) drives many anabolic reactions in cells. AP-style example: extraction of metals from ores by reduction with carbon, where the unfavorable metal-oxide → metal step is driven by the favorable C → CO₂ oxidation.
- **Thermodynamic vs kinetic control.** A reaction is THERMODYNAMICALLY favored if ΔG < 0. It is KINETICALLY accessible if Eₐ is low enough at the given T. A reaction can be highly favorable but kinetically slow (diamond → graphite, ΔG < 0, but Eₐ is huge). AP loves the conceptual question "this reaction has K = 10²⁰ but doesn't occur at room temperature — explain."
- **The full Nernst equation with worked example.** For Cu²⁺ + 2e⁻ → Cu, E° = +0.34 V. If [Cu²⁺] = 0.01 M (vs standard 1 M), Q = 1/[Cu²⁺] = 100 (since reactant is in denominator of half-reaction's "Q"). Wait — careful here. Nernst: E = E° − (0.0592/n)·log Q where Q is for the OVERALL cell reaction. Don't apply Nernst to a single half-reaction in isolation; apply it to the full cell.
- **Concentration cell EMF.** E = (0.0592/n) × log([conc]_cathode / [conc]_anode). The cell drives the dilute side to become more dilute and the concentrated side to become less concentrated, until equilibrium.
- **Electrolysis selectivity.** When multiple species could be reduced/oxidized at an electrode, the one with the most favorable E° wins. In electrolysis of aqueous NaCl, water (E° = +1.23 for O₂/H₂O system) competes with Cl⁻ for oxidation at the anode. Overpotential effects often allow Cl₂ to form despite this — an empirical complication AP rarely tests.
- **Why the SHE is exactly 0 V.** It's a definitional choice — every other potential is measured relative to it. There is no "absolute" zero of electrochemical potential; the SHE is an arbitrary reference, like setting sea level for elevation.
- **The unit catastrophe.** ΔG = −nFE: ensure n is dimensionless (mol e⁻ per mol reaction), F in C/mol, E in V (= J/C). Result is in J/mol of reaction — convert to kJ as needed.

## Worked Examples

### Example 1 [3] — Predicting ΔS sign

Predict whether ΔS is positive or negative for each:
- (a) H₂O(l) → H₂O(g)
- (b) 2 SO₂(g) + O₂(g) → 2 SO₃(g)
- (c) Mg(s) + 2 HCl(aq) → MgCl₂(aq) + H₂(g)
- (d) C(s) + O₂(g) → CO₂(g)

- **(a) ΔS > 0.** Going from liquid to gas (much greater accessible microstates).
- **(b) ΔS < 0.** Reactants: 3 mol gas. Products: 2 mol gas. Fewer moles of gas → lower S.
- **(c) ΔS > 0.** Producing 1 mol H₂ gas from 0 mol of gas reactants increases entropy substantially.
- **(d) ΔS ≈ 0** (small change). 1 mol gas reactant, 1 mol gas product. Very small change in entropy.

### Example 2 [3][4] — Calculating ΔG° and predicting favorability

For the reaction N₂(g) + 3 H₂(g) → 2 NH₃(g), ΔH° = −92.4 kJ and ΔS° = −198.3 J/K. (a) Calculate ΔG° at 25°C. (b) At what temperature does the reaction become non-spontaneous?

- **(a)** ΔG° = ΔH° − TΔS°. Convert: ΔS° = −0.1983 kJ/K. T = 298 K.
  - ΔG° = (−92.4) − (298)(−0.1983) = −92.4 − (−59.1) = −92.4 + 59.1 = −33.3 kJ.
  - ΔG° < 0 → spontaneous at 25°C.
- **(b)** The reaction becomes non-spontaneous when ΔG° = 0:
  - 0 = ΔH° − TΔS°
  - T = ΔH° / ΔS° = (−92.4) / (−0.1983) = 466 K = 193°C.
  - Above 193°C, ΔG° becomes positive (the entropy penalty outweighs the enthalpy benefit). This is why ammonia synthesis is run at moderate temperatures with high pressure (Le Chatelier shifts equilibrium back) and a catalyst (kinetic boost).
- **AP-style answer:** "The reaction has favorable ΔH (negative, exothermic) but unfavorable ΔS (negative, fewer moles of gas). At low temperatures, the enthalpy term dominates (favorable). At high temperatures, the −TΔS term grows positive enough to make ΔG positive. The crossover temperature is T = ΔH/ΔS = 466 K."

### Example 3 [4] — Galvanic cell potential and ΔG°

A galvanic cell uses Zn(s) | Zn²⁺(aq) || Cu²⁺(aq) | Cu(s). Given E°(Zn²⁺/Zn) = −0.76 V and E°(Cu²⁺/Cu) = +0.34 V, calculate E°cell and ΔG°.

- **Step 1.** Identify cathode and anode. Higher E° → reduction at cathode. Cu²⁺/Cu (+0.34) > Zn²⁺/Zn (−0.76). So Cu is cathode, Zn is anode.
- **Step 2.** E°cell = E°cathode − E°anode = (+0.34) − (−0.76) = +1.10 V.
- **Step 3.** Half-reactions:
  - Cathode (reduction): Cu²⁺ + 2e⁻ → Cu
  - Anode (oxidation): Zn → Zn²⁺ + 2e⁻
- **Step 4.** Overall: Zn + Cu²⁺ → Zn²⁺ + Cu, n = 2 electrons.
- **Step 5.** ΔG° = −nFE° = −(2)(96,485)(1.10) = −212,267 J = −212 kJ.
- **Sanity check:** E° > 0 → ΔG° < 0 ✓ spontaneous.
- **AP-style answer:** "Copper has a higher reduction potential, so it serves as the cathode (gets reduced). Zinc has the lower reduction potential, so it gets oxidized at the anode. The cell potential is +1.10 V, and ΔG° = −nFE° = −212 kJ, indicating a strongly favorable spontaneous reaction."

### Example 4 [4] — Electrolysis with Faraday's law

A current of 5.00 A is passed through molten NaCl for 1.00 hour. How many grams of sodium metal are deposited at the cathode?

- **Step 1.** Cathode half-reaction: Na⁺ + e⁻ → Na. n = 1 electron per Na atom.
- **Step 2.** Total charge: Q = It = (5.00)(3600) = 18,000 C.
- **Step 3.** Moles of e⁻ = Q/F = 18,000 / 96,485 = 0.1866 mol.
- **Step 4.** Moles of Na = moles of e⁻ / n = 0.1866 / 1 = 0.1866 mol.
- **Step 5.** Mass = (0.1866)(22.99) = 4.29 g of Na.
- **Sanity check:** small mass for moderate current and time — consistent with the small molar mass of Na.

### Example 5 [4][5] — Connecting ΔG°, K, and E° (the Three Great Connections)

For a redox reaction with E°cell = +0.50 V and n = 2 electrons, calculate (a) ΔG° in kJ; (b) K at 25°C.

- **(a) ΔG° = −nFE° = −(2)(96,485)(0.50) = −96,485 J = −96.5 kJ.**
- **(b) Two methods, both should agree:**
  - Method 1: log K = nE°/0.0592 = (2)(0.50)/0.0592 = 16.89, so K = 10^16.89 ≈ 7.8 × 10¹⁶.
  - Method 2: ΔG° = −RT·ln K → ln K = −ΔG°/(RT) = −(−96,500)/(8.314 × 298) = 38.95, so K = e^38.95 ≈ 8 × 10¹⁶ ✓.
- **Insight:** even a moderate cell potential of 0.50 V corresponds to an enormous equilibrium constant (10¹⁶). This is why electrochemistry is sensitive to E°: small differences in voltage correspond to huge differences in K.
- **[5] phrase:** "The three Great Connections — ΔG° = −RT·ln K, ΔG° = −nFE°, and the derived ln K = nFE°/(RT) — link thermodynamics, equilibrium, and electrochemistry into a single framework. A negative ΔG°, a positive E°cell, and a K > 1 are equivalent statements about thermodynamic favorability."

## Top Traps & Common Errors

1. **Sign convention errors with ΔG.** ΔG < 0 is favorable. ΔG > 0 is unfavorable. Easy to flip under exam pressure.
2. **Forgetting to convert ΔS units.** S° is usually given in J/(mol·K). When combining with ΔH° in kJ to get ΔG°, convert to kJ/(mol·K) by dividing by 1000.
3. **Wrong sign on E°anode in cell potential calculation.** E°cell = E°cathode − E°anode. Use the REDUCTION potential of the anode species directly; do NOT flip the sign yourself. The minus sign in the formula handles it.
4. **Reversing the AnOx/RedCat memory aid.** Anode = Oxidation. Cathode = Reduction.
5. **Confusing galvanic vs electrolytic terminal polarity.**
   - Galvanic: anode is NEGATIVE (electrons leave from negative); cathode is POSITIVE.
   - Electrolytic: anode is POSITIVE (forced by external power); cathode is NEGATIVE.
6. **Faraday's law unit slips.** A × s = C; C / F = mol e⁻; mol e⁻ / n = mol substance; × molar mass = grams.
7. **Treating ΔG° as a function of ΔG.** They are different! ΔG° is at standard conditions (1 M, 1 atm, 25°C). ΔG depends on actual conditions: ΔG = ΔG° + RT·ln Q.
8. **Confusing Q with K in Nernst equation.** Q is the current state (changes as reaction proceeds). K is the equilibrium value.
9. **Using log instead of ln (or vice versa) in thermodynamic equations.** ΔG° = −RT·ln K (natural log). At 25°C, this becomes ΔG° = −5.71·log K (kJ scale, base-10 log).
10. **Treating cell potential as additive.** E° is INTENSIVE — multiplying a half-reaction by 2 does NOT double E°. (But ΔG° IS extensive — multiplying doubles ΔG°.) This is why ΔG° = −nFE° has the n factor: it absorbs the extensivity.
11. **Forgetting to identify n correctly.** n is the moles of electrons transferred PER MOLE OF REACTION (as written and balanced). Double the equation, double n. But n in E°cell × E° doesn't change with scaling because E° is intensive.
12. **Salt bridge omission in cell diagram.** Without a salt bridge, charge buildup stops the reaction. The salt bridge is essential.
13. **Treating S° as zero for elements.** ΔH°f for an element in standard state = 0. But S° (absolute entropy) is NEVER zero for anything except a perfect crystal at 0 K (third law of thermodynamics). Elements have positive S° values listed in tables.
14. **Mixing up endothermic/exothermic with favorable/unfavorable.** Exothermic ≠ spontaneous. Spontaneity is about ΔG, which combines both ΔH and ΔS.
15. **Concentration cell direction errors.** In a concentration cell, the more concentrated side is the cathode (the side that "wants" to dilute itself by being reduced and gaining the metal).

## Rubric-Aware Tactics

**For ΔS sign predictions:**
- Count moles of gas on each side.
- Note any phase changes.
- Note any mixing or dissolution.

**For ΔG° calculations:**
- Use ΔG° = ΔH° − TΔS° (with T in Kelvin, units consistent).
- Or use ΔG°rxn = Σ(n × ΔG°f products) − Σ(n × ΔG°f reactants).
- State the favorability conclusion explicitly.

**For temperature-dependent favorability:**
- Set ΔG° = 0 to find crossover temperature T = ΔH°/ΔS°.
- State which T range gives favorable / unfavorable.

**For cell potential calculations:**
- Identify cathode (higher E°) and anode (lower E°).
- Apply E°cell = E°cathode − E°anode (do not flip anode value).
- Identify n from the balanced overall equation.

**For ΔG° from E°:**
- ΔG° = −nFE°.
- Use F = 96,485 C/mol, E° in V, result in J or J/mol.
- Convert to kJ as needed.

**For Faraday's law / electrolysis:**
- Compute total charge Q = It.
- Convert to moles of e⁻: Q/F.
- Convert to moles of substance using the half-reaction's electron stoichiometry.
- Convert to grams via molar mass.

**For three Great Connections problems:**
- Identify which two of the three (ΔG°, K, E°) are given.
- Apply the appropriate connection.
- Use n correctly when E° and K are involved.

## "Phrases That Score" — verbatim language for FRQs

1. "ΔS is positive because the reaction produces more moles of gas (or transitions from solid/liquid to gas), which increases the number of accessible microstates."
2. "ΔG° = ΔH° − TΔS° = [calculation]. Since ΔG° is [negative/positive], the reaction is thermodynamically [favorable/unfavorable] at [temperature]."
3. "Because [substance with higher E°] has the higher standard reduction potential, it is reduced at the cathode. [Substance with lower E°] is oxidized at the anode. The cell potential is E°cell = E°cathode − E°anode = [calculation], which is positive, indicating a spontaneous galvanic reaction."
4. "ΔG° = −nFE° = [calculation]. The negative ΔG° confirms the reaction is thermodynamically favorable, consistent with the positive E°cell."
5. "The three Great Connections relate ΔG°, K, and E°: ΔG° = −RT·ln K = −nFE°. A positive E°cell corresponds to a negative ΔG° and a K greater than 1, all three indicating thermodynamic favorability."
6. "Total charge passed = I × t = [value] coulombs. Moles of electrons = Q/F = [value]. Each mole of [metal] requires n moles of electrons, so moles deposited = [Q/F]/n = [value]. Mass = moles × molar mass = [value] grams."
7. "The reaction is thermodynamically favorable (ΔG° < 0) but kinetically slow because the activation energy is high. A catalyst would speed up the rate without changing K, ΔG°, or the equilibrium position."

## If You Do Nothing Else for This Unit

*Master the three Great Connections cold: ΔG° = −RT·ln K, ΔG° = −nFE°, and ln K = nFE°/(RT). These three equations link thermodynamics, equilibrium, and electrochemistry, and they appear together in essentially every Unit 9 FRQ on the AP exam. If you can move fluidly between ΔG°, K, and E° using these formulas, you can solve any quantitative problem in this unit.*

_lastUpdated: 2026-05-04
_sources: College Board AP Chemistry CED 2024-25, Princeton Review AP Chemistry 2025, Khan Academy AP Chemistry, AP Chemistry Released FRQs 2014–2024, Atkins Physical Chemistry, Zumdahl Chemistry 10th edition
_difficulty: advanced
_relatedUnits: ap-chemistry-unit-4-chemical-reactions, ap-chemistry-unit-6-thermodynamics, ap-chemistry-unit-7-equilibrium
