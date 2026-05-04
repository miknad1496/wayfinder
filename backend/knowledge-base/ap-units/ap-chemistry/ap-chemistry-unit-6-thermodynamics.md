# AP Chemistry — Unit 6: Thermodynamics — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 7–9% of the AP Chemistry exam
- **Sub-topics covered:**
  - 6.1 Endothermic and Exothermic Processes
  - 6.2 Energy Diagrams
  - 6.3 Heat Transfer and Thermal Equilibrium
  - 6.4 Heat Capacity and Calorimetry
  - 6.5 Energy of Phase Changes
  - 6.6 Introduction to Enthalpy of Reaction
  - 6.7 Bond Enthalpies
  - 6.8 Enthalpy of Formation
  - 6.9 Hess's Law
- **Where this unit appears on the exam:** Calorimetry calculations are guaranteed — usually as the bridge between experimental data and a thermodynamic FRQ. Hess's law (combining known reactions to get an unknown ΔH) appears as an MCQ or FRQ sub-question in nearly every exam. Bond enthalpy estimation of ΔH is common. Note: entropy (ΔS) and Gibbs free energy (ΔG) are in Unit 9, NOT here. Unit 6 is enthalpy-focused.

## Big Ideas

1. **Energy is conserved.** The first law of thermodynamics: energy isn't created or destroyed; it changes form or moves between system and surroundings. Heat lost by hot object = heat gained by cold object (for isolated systems).
2. **Enthalpy (ΔH) is heat at constant pressure.** Most lab reactions occur at atmospheric pressure, so ΔH is the heat we measure or calculate. ΔH < 0 means exothermic (releases heat); ΔH > 0 means endothermic (absorbs heat).
3. **Calorimetry connects temperature change to heat.** q = mcΔT. The temperature change of a known mass with known specific heat tells you how much heat was transferred.
4. **Hess's law: ΔH is path-independent.** ΔH for a reaction is the sum of ΔH values for any sequence of steps that net to that reaction. This lets you calculate unknown ΔH values from known ones.
5. **Enthalpy of formation (ΔH°f) is the foundation calculation.** For any reaction: ΔH°rxn = Σ(n × ΔH°f products) − Σ(n × ΔH°f reactants). Memorize this and you can compute any reaction enthalpy from a table of formation enthalpies.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **System and surroundings:** the system is what we're studying (the reaction). Surroundings = everything else. Energy can flow between them.
- **Endothermic vs exothermic:**
  - Exothermic: releases heat to surroundings, ΔH < 0, container feels warm to touch (ice packs are endothermic; hand warmers are exothermic).
  - Endothermic: absorbs heat from surroundings, ΔH > 0, container feels cold to touch.
- **Sign conventions for q (heat) from the SYSTEM's perspective:**
  - q < 0 → system loses heat → surroundings gain heat → exothermic.
  - q > 0 → system gains heat → surroundings lose heat → endothermic.
- **Heat formula (the workhorse of calorimetry):** q = mcΔT
  - q = heat transferred (J or kJ)
  - m = mass of substance (g)
  - c = specific heat capacity (J/g·°C); for water, c = 4.18 J/g·°C
  - ΔT = T_final − T_initial (°C or K — same magnitude either way)
- **Specific heat capacity:** the heat needed to raise 1 g of substance by 1°C. Water has unusually high specific heat (4.18 J/g·°C) because of hydrogen bonding.
- **Phase changes (ΔH at constant T):**
  - Melting (fusion): ΔH_fus, endothermic (positive).
  - Vaporization: ΔH_vap, endothermic (positive). Always larger than ΔH_fus for the same substance.
  - Freezing: −ΔH_fus, exothermic (negative).
  - Condensation: −ΔH_vap, exothermic (negative).
  - Sublimation (s → g): ΔH_sub = ΔH_fus + ΔH_vap.
- **Heating curve:** plot of T vs heat added. Sloped portions = changing T with single phase (use q = mcΔT). Flat (horizontal) portions = phase changes at constant T (use q = n × ΔH_phase).
- **Constant-pressure calorimetry** (Styrofoam cup, "coffee cup calorimeter"):
  - Reaction occurs in solution at atmospheric pressure.
  - q_rxn = −q_solution = −(m_solution × c_solution × ΔT_solution).
  - Negative sign: reaction loses heat that solution gains (or vice versa).
- **Hess's law:** for any reaction expressible as a sum of other reactions, ΔH for the overall reaction equals the sum of ΔH for the steps.
  - If you reverse a reaction, FLIP the sign of ΔH.
  - If you multiply a reaction by a coefficient n, multiply ΔH by n.
- **Enthalpy of formation (ΔH°f):** the enthalpy change when 1 mole of compound forms from its elements in their standard states. By definition, ΔH°f for an element in its standard state = 0.
- **Standard state:** most stable form at 1 atm and 25°C (298 K). For carbon, standard state is graphite (NOT diamond). For oxygen, it's O₂ gas. For hydrogen, it's H₂ gas. For mercury, it's liquid Hg.
- **ΔH°rxn from formation enthalpies:**
  - ΔH°rxn = Σ(n × ΔH°f products) − Σ(n × ΔH°f reactants)
  - "Products minus reactants, weighted by coefficients."

### Adds for [4]

- **Calorimetry with a chemical reaction in solution.** Algorithm:
  1. Calculate heat absorbed by the solution: q_solution = m_solution × c_solution × ΔT.
  2. Heat released by reaction: q_rxn = −q_solution.
  3. Convert to per-mole basis: ΔH_rxn = q_rxn / moles of limiting reagent.
- **The mass of the solution** (not just the solute) is what gets heated. For dilute aqueous solutions, c ≈ 4.18 J/g·°C (treat as water).
- **Bomb calorimeter (constant volume):** measures q_v = ΔU, not ΔH. AP rarely tests this distinction directly, but be aware that constant-pressure (coffee cup) gives ΔH and constant-volume (bomb) gives ΔU.
- **Bond enthalpy (BE) estimation of ΔH:**
  - ΔH ≈ Σ(BE bonds broken) − Σ(BE bonds formed)
  - "Bonds broken minus bonds formed," with positive values for both because BE is always positive.
  - This is approximation only — ignores intermolecular forces. Valid mainly for gas-phase reactions.
- **Common bond enthalpies to remember directionally** (kJ/mol):
  - C–H ≈ 414, C–C ≈ 347, C=C ≈ 614, C≡C ≈ 839
  - O–H ≈ 463, O=O ≈ 498, C=O (in CO₂) ≈ 799
  - H–H ≈ 436, N≡N ≈ 945, C–O ≈ 358
  - Bond strength generally: triple > double > single for same atom pair.
- **Hess's law worked through.** Given:
  - Reaction A: 2 H₂ + O₂ → 2 H₂O, ΔH = −572 kJ
  - Reaction B: H₂O(l) → H₂O(g), ΔH = +44 kJ
  - Find: 2 H₂(g) + O₂(g) → 2 H₂O(g)
  - Method: A + 2B (multiply B by 2 since the target produces 2 H₂O(g)):
  - ΔH_target = −572 + 2(+44) = −572 + 88 = −484 kJ.
- **Combustion reactions** are always exothermic. ΔH_combustion is a special case of ΔH_rxn calculated by ΔH°f.
- **Heat lost = heat gained** (when no heat is lost to surroundings):
  - For two substances reaching thermal equilibrium: m₁c₁(T_f − T_initial,1) + m₂c₂(T_f − T_initial,2) = 0.
  - Solve for T_f or one of the masses or specific heats.
- **Enthalpy is a state function.** It depends only on initial and final states, not the path. This is WHY Hess's law works.
- **Sign convention for w (work) in chemistry:** w = −PΔV (system perspective). Expansion (ΔV > 0) → w < 0 → system does work on surroundings, losing energy. Compression → w > 0 → surroundings do work on system, gaining energy.
- **First law:** ΔU = q + w. Internal energy change = heat added + work done on the system. At constant pressure, ΔH = ΔU + PΔV — but for most reactions, the work term is small enough that ΔH ≈ ΔU for AP purposes.

### Adds for [5]

- **Why ΔH ≈ ΔU for most chemical reactions.** The PΔV term is significant only for gas-producing or gas-consuming reactions where Δn_gas is large. For solution or solid-only reactions, ΔV ≈ 0 → PΔV ≈ 0 → ΔH ≈ ΔU.
- **Heat capacity vs specific heat distinction:**
  - Specific heat c (J/g·°C): per gram.
  - Molar heat capacity Cₘ (J/mol·°C): per mole.
  - Heat capacity C (J/°C): for a specific amount of substance.
  - Calorimeter constant C_cal (J/°C): heat capacity of the calorimeter itself; often negligible for coffee-cup but matters for bomb calorimetry.
- **Bond enthalpy ΔH estimation has known errors.** It assumes:
  - Bond strengths are independent of molecular environment (approximate).
  - Reactants and products are in the gas phase (significant error for solutions).
  - The actual answer can deviate by 10–30 kJ/mol from formation-enthalpy-derived values.
- **The [5] reasoning move on whether a reaction is endo- or exothermic from bond analysis:**
  - Bonds with HIGHER total enthalpy on the products side → energy is RELEASED when those stronger bonds form → exothermic.
  - "Bonds broken (endothermic, costs energy) minus bonds formed (exothermic, releases energy)" — if formed bonds are stronger, the formed-energy exceeds broken-energy, giving net negative ΔH (exothermic).
- **Standard enthalpy of combustion ΔH°c** is tabulated for many fuels. Useful for combustion-stoichiometry FRQs.
- **Heat curves and the area under each region.** The total heat absorbed to warm ice from −20°C to steam at 120°C requires summing five terms:
  1. Heat ice from −20°C to 0°C (use mcΔT with c_ice).
  2. Melt ice at 0°C (use n × ΔH_fus).
  3. Heat liquid water from 0°C to 100°C (use mcΔT with c_water).
  4. Vaporize water at 100°C (use n × ΔH_vap).
  5. Heat steam from 100°C to 120°C (use mcΔT with c_steam).
- **Why ΔH_vap >> ΔH_fus for most substances.** Vaporization requires breaking nearly ALL intermolecular forces (transitioning to gas phase where molecules are essentially independent). Melting only loosens the lattice — molecules stay close together in the liquid, retaining most of their IMFs. So vaporization costs much more energy.
- **Hess's law as a path argument.** ΔH for "graphite → diamond" can be calculated even though the direct measurement is impractical, by combining: graphite + O₂ → CO₂ (ΔH known) and diamond + O₂ → CO₂ (ΔH known). Reverse the second and add: graphite → diamond, ΔH = ΔH(graphite combustion) − ΔH(diamond combustion).

## Worked Examples

### Example 1 [3] — Calorimetry with single substance heating

How much heat is required to raise the temperature of 250 g of water from 20.0°C to 80.0°C?

- **Step 1.** q = mcΔT.
- **Step 2.** Plug in: q = (250 g)(4.18 J/g·°C)(80.0 − 20.0)°C = (250)(4.18)(60.0) = 62,700 J = 62.7 kJ.
- **Sanity check:** specific heat of water is high (4.18), and we're heating 250 g by 60°C → expect tens of kJ. ✓.
- **[3] note:** ΔT is positive (heating), so q is positive (absorbed). This is endothermic from water's perspective.

### Example 2 [3][4] — Calorimetry of a chemical reaction

When 50.0 mL of 1.00 M HCl is mixed with 50.0 mL of 1.00 M NaOH (both at 22.0°C) in a coffee-cup calorimeter, the temperature rises to 28.7°C. Calculate ΔH for the neutralization reaction in kJ/mol.

- **Step 1.** Total mass of solution = 100.0 g (assume density 1.00 g/mL for dilute aqueous solutions).
- **Step 2.** Heat absorbed by solution: q_solution = mcΔT = (100.0)(4.18)(28.7 − 22.0) = (100.0)(4.18)(6.7) = 2,801 J = 2.80 kJ.
- **Step 3.** Heat released by reaction: q_rxn = −q_solution = −2.80 kJ. (Exothermic — solution warmed up because reaction released heat.)
- **Step 4.** Moles of reaction. Moles HCl = 0.0500 L × 1.00 M = 0.0500 mol. Moles NaOH = same. 1:1 stoichiometry → 0.0500 mol of reaction occurred.
- **Step 5.** ΔH per mole = q_rxn / mol = −2.80 kJ / 0.0500 mol = −56.0 kJ/mol.
- **Sanity check:** the literature value for HCl + NaOH neutralization is about −56 kJ/mol ✓.
- **AP-style answer:** "The reaction is exothermic with ΔH = −56.0 kJ per mole of water formed. The negative sign reflects that the system (reaction) lost heat to the surroundings (solution), which we measured as the solution's temperature rise."

### Example 3 [3][4] — Hess's law

Given:
- (1) C(graphite) + O₂(g) → CO₂(g), ΔH = −393.5 kJ
- (2) H₂(g) + ½ O₂(g) → H₂O(l), ΔH = −285.8 kJ
- (3) CH₄(g) + 2 O₂(g) → CO₂(g) + 2 H₂O(l), ΔH = −890.4 kJ

Find ΔH for: C(graphite) + 2 H₂(g) → CH₄(g) (the formation of methane).

- **Step 1.** Target equation has C(graphite) and 2 H₂(g) on reactant side and CH₄(g) on product side.
- **Step 2.** Strategy: combine (1) + 2(2) − (3).
  - (1) gives C → CO₂ (good; we want C on reactant side ✓).
  - 2(2) gives 2 H₂ → 2 H₂O (good; we want 2 H₂ on reactant side ✓).
  - We want CH₄ on PRODUCT side, but (3) has CH₄ on REACTANT side. Reverse (3): CO₂ + 2 H₂O → CH₄ + 2 O₂, ΔH = +890.4.
- **Step 3.** Add: C + O₂ + 2 H₂ + O₂ + CO₂ + 2 H₂O → CO₂ + 2 H₂O + CH₄ + 2 O₂.
- **Step 4.** Cancel: O₂ on both sides (2 each), CO₂ on both, H₂O on both → C + 2 H₂ → CH₄.
- **Step 5.** Sum ΔH: ΔH = (−393.5) + 2(−285.8) + (+890.4) = −393.5 − 571.6 + 890.4 = −74.7 kJ.
- **Sanity check:** the literature ΔH°f of methane is −74.85 kJ/mol ✓.

### Example 4 [4] — Bond enthalpy estimation of ΔH

Estimate ΔH for the combustion of methane: CH₄(g) + 2 O₂(g) → CO₂(g) + 2 H₂O(g). Use BE values (kJ/mol): C–H = 414, O=O = 498, C=O (in CO₂) = 799, O–H = 463.

- **Step 1.** Identify bonds broken (reactants):
  - 4 C–H bonds in CH₄ → 4 × 414 = 1656 kJ
  - 2 O=O bonds in 2 O₂ → 2 × 498 = 996 kJ
  - Total broken: 1656 + 996 = 2652 kJ
- **Step 2.** Identify bonds formed (products):
  - 2 C=O bonds in CO₂ → 2 × 799 = 1598 kJ
  - 4 O–H bonds in 2 H₂O → 4 × 463 = 1852 kJ
  - Total formed: 1598 + 1852 = 3450 kJ
- **Step 3.** ΔH ≈ Σ(broken) − Σ(formed) = 2652 − 3450 = −798 kJ.
- **Sanity check:** the actual ΔH of CH₄ combustion (with H₂O as gas) is about −802 kJ/mol — bond enthalpy gives a close estimate. ✓.
- **[4] explanation:** "Bond enthalpy estimation works in the gas phase because all reactants and products are gases, so we ignore phase-change energies. The estimate is approximate because individual bond enthalpies depend slightly on molecular environment, but it captures the overall energy change well."

### Example 5 [4] — Heating curve total energy

How much heat is required to convert 25.0 g of ice at −10.0°C to steam at 110.0°C? Given: c_ice = 2.10, c_water = 4.18, c_steam = 1.92 J/g·°C; ΔH_fus = 334 J/g; ΔH_vap = 2260 J/g.

- **Step 1.** Heat ice from −10.0 to 0.0°C: q₁ = (25.0)(2.10)(10.0) = 525 J.
- **Step 2.** Melt ice at 0°C: q₂ = (25.0)(334) = 8350 J.
- **Step 3.** Heat liquid water from 0 to 100°C: q₃ = (25.0)(4.18)(100.0) = 10,450 J.
- **Step 4.** Vaporize water at 100°C: q₄ = (25.0)(2260) = 56,500 J.
- **Step 5.** Heat steam from 100 to 110°C: q₅ = (25.0)(1.92)(10.0) = 480 J.
- **Step 6.** Total: 525 + 8350 + 10,450 + 56,500 + 480 = 76,305 J ≈ 76.3 kJ.
- **[4] insight:** vaporization (q₄) dominates the total energy (~74% of the total). This is why steam burns are so dangerous — condensing steam releases enormous energy.

## Top Traps & Common Errors

1. **Sign convention errors.** Exothermic = ΔH NEGATIVE. Endothermic = ΔH POSITIVE. Memorize this; it's the most common single error in thermo problems.
2. **Mass of solute vs mass of solution.** In calorimetry, you heat the WHOLE solution, not just the solute. Use total mass.
3. **Forgetting the negative sign in q_rxn = −q_solution.** Heat lost by reaction = heat gained by solution (for exothermic), so they have opposite signs.
4. **Bond enthalpy formula direction.** ΔH ≈ broken − formed. NOT formed − broken. Bonds broken absorb energy (positive contribution to ΔH); bonds formed release energy (negative contribution).
5. **Hess's law sign errors when reversing reactions.** Flipping a reaction flips the sign of ΔH. Multiplying by n multiplies ΔH by n.
6. **ΔH°f of an element ≠ 0.** ΔH°f of an element IN ITS STANDARD STATE = 0. ΔH°f of carbon as DIAMOND ≠ 0 (graphite is the standard state). ΔH°f of O₃ (ozone) ≠ 0 (O₂ is standard state).
7. **Coefficient errors in formation enthalpy calculations.** ΔH°rxn = Σ(n × ΔH°f products) − Σ(n × ΔH°f reactants). Coefficients matter.
8. **Forgetting that vaporization is much more endothermic than melting.** ΔH_vap >> ΔH_fus typically.
9. **Heating curve flat regions confused.** Flat segments are PHASE CHANGES (use n × ΔH_phase, not q = mcΔT). Sloped segments are temperature changes within a single phase.
10. **Using c_water for substances that aren't water.** Each substance has its own specific heat. AP often gives you the value or expects you to know c_water = 4.18.
11. **ΔT direction confusion.** ΔT = T_final − T_initial. For cooling, ΔT is negative.
12. **Mixing units.** J and kJ. Convert before adding.
13. **Stoichiometric scaling of ΔH.** ΔH is per the reaction AS WRITTEN. If the equation produces 2 mol H₂O, the ΔH is for 2 mol of water formed. To get per mole, divide by 2.
14. **Using bond enthalpy for solution-phase reactions.** BE estimation is GAS PHASE only. For aqueous reactions, use formation enthalpies.
15. **Calorimeter heat capacity ignored when significant.** For coffee-cup calorimetry, usually negligible. For bomb calorimetry, you MUST include it.

## Rubric-Aware Tactics

**For calorimetry calculations:**
- Show q = mcΔT explicitly.
- Specify which mass and which c you're using.
- Show the sign carefully — exothermic reaction releases heat to solution (positive q_solution, negative q_rxn).
- Convert to per-mole basis if asked.

**For Hess's law:**
- Show how you manipulated each given equation (reverse? multiply?).
- Show the algebra: ΔH_target = sum of weighted ΔH's.
- Verify by adding the reactions and confirming they sum to the target.

**For bond enthalpy estimation:**
- List bonds broken (reactant side) with their BE values.
- List bonds formed (product side) with their BE values.
- Apply ΔH ≈ Σ(broken) − Σ(formed).
- Note this is an estimation, not a precise value.

**For formation enthalpy calculations:**
- Use ΔH°rxn = Σ(n × ΔH°f products) − Σ(n × ΔH°f reactants).
- Multiply each ΔH°f by its coefficient in the balanced equation.
- ΔH°f for elements in standard state = 0.

**For heating curve problems:**
- Identify each stage (heating in phase, phase change at constant T).
- Apply correct formula for each stage.
- Sum all contributions.

**For exo/endo identification:**
- State explicitly: "ΔH negative → exothermic" or vice versa.
- Connect to physical observation: "the surroundings warmed up" or "the system absorbed heat from surroundings."

## "Phrases That Score" — verbatim language for FRQs

1. "The reaction is exothermic because ΔH is negative; the system (reaction) released heat to the surroundings, which we observed as a temperature increase in the solution."
2. "By calorimetry, q_solution = m × c × ΔT = [calculation]. Since the system loses what the surroundings gain, q_rxn = −q_solution = [value]. Per mole of reaction, ΔH = q_rxn / moles = [value]."
3. "By Hess's law, ΔH for the target reaction is the sum of ΔH values for the steps that combine to give the target. Reversing equation X flips the sign of its ΔH; multiplying equation Y by [n] multiplies its ΔH by [n]."
4. "Using formation enthalpies: ΔH°rxn = Σ(n × ΔH°f products) − Σ(n × ΔH°f reactants) = [calculation]."
5. "Using bond enthalpies (gas phase only): ΔH ≈ Σ(BE bonds broken) − Σ(BE bonds formed). Bonds broken absorb energy (endothermic contribution); bonds formed release energy (exothermic contribution)."
6. "Vaporization is more endothermic than melting because vaporization breaks essentially all intermolecular forces, whereas melting only loosens the lattice while keeping molecules in close contact."
7. "ΔH°f of an element in its standard state is defined as zero. For carbon, the standard state is graphite, so ΔH°f of graphite = 0 but ΔH°f of diamond ≠ 0."

## If You Do Nothing Else for This Unit

*Master q = mcΔT for calorimetry, ΔH°rxn = Σ(n × ΔH°f products) − Σ(n × ΔH°f reactants) for tabulated data, and Hess's law for combining known reactions. These three formulas, applied with correct sign conventions, solve essentially every Unit 6 thermodynamics problem on the AP exam.*

_lastUpdated: 2026-05-04
_sources: College Board AP Chemistry CED 2024-25, Princeton Review AP Chemistry 2025, Khan Academy AP Chemistry, AP Chemistry Released FRQs 2014–2024, Atkins Physical Chemistry, Zumdahl Chemistry 10th edition
_difficulty: intermediate
_relatedUnits: ap-chemistry-unit-3-imfs, ap-chemistry-unit-5-kinetics, ap-chemistry-unit-9-thermo-electrochem
