# AP Chemistry — Unit 5: Kinetics — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 7–9% of the AP Chemistry exam
- **Sub-topics covered:**
  - 5.1 Reaction Rates
  - 5.2 Introduction to Rate Laws
  - 5.3 Concentration Changes Over Time (integrated rate laws)
  - 5.4 Elementary Reactions
  - 5.5 Collision Model
  - 5.6 Reaction Energy Profile (activation energy diagrams)
  - 5.7 Introduction to Reaction Mechanisms
  - 5.8 Reaction Mechanism and Rate Law
  - 5.9 Steady-State Approximation
  - 5.10 Multistep Reaction Energy Profile
  - 5.11 Catalysis
- **Where this unit appears on the exam:** Rate law derivation from initial-rates data is the signature kinetics FRQ — it shows up nearly every year. Integrated rate law graphs (which one is linear → which order is the reaction) are common MCQs. Mechanism + rate-determining step problems test whether you can derive the overall rate law from the slow step. Energy profile diagrams (with and without catalyst) appear as both MCQ and FRQ. Catalysis questions are perennial — focus on the "lowers Eₐ, doesn't change ΔH" framing.

## Big Ideas

1. **Kinetics is about HOW FAST a reaction proceeds, not whether it's favorable.** A reaction can be thermodynamically favorable (negative ΔG) but kinetically slow because of a high activation barrier. Diamond → graphite is favorable but takes geological time.
2. **Rate depends on concentration via the rate law.** Rate = k[A]^m[B]^n. The exponents m and n are EXPERIMENTALLY DETERMINED — they are NOT necessarily the stoichiometric coefficients in the balanced equation.
3. **Collision theory has three requirements for a reaction.** Particles must (a) collide, (b) have sufficient energy (≥ activation energy), and (c) collide with proper orientation. Concentration affects collision frequency; temperature affects collision energy.
4. **Mechanisms are step-by-step "how it actually happens."** A balanced equation is a summary, not a description of the actual molecular events. The rate law of an elementary step IS its molecularity (rate = k[A][B] for A + B → products).
5. **Catalysts lower activation energy without being consumed.** They open a new pathway with a smaller Eₐ. Equilibrium position is unchanged because both forward AND reverse Eₐ drop equally.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Rate definition:** rate = −Δ[reactant]/Δt = +Δ[product]/Δt. Units: M/s (or M/min, etc.).
- **Rate normalization by stoichiometry:** for a A + b B → c C + d D, rate = −(1/a)Δ[A]/Δt = −(1/b)Δ[B]/Δt = (1/c)Δ[C]/Δt = (1/d)Δ[D]/Δt.
- **Rate law:** rate = k[A]^m[B]^n. Here m, n are reaction orders. Overall order = m + n.
- **Reaction order from initial rates** (the canonical AP method): hold one concentration constant and vary another. Compare how rate changes:
  - Doubling [A] doubles rate → first order in A (m = 1).
  - Doubling [A] quadruples rate → second order in A (m = 2).
  - Doubling [A] doesn't change rate → zero order in A (m = 0).
- **Units of k depend on overall order:**
  - Zero order (rate = k): M·s⁻¹
  - First order (rate = k[A]): s⁻¹
  - Second order (rate = k[A]² or k[A][B]): M⁻¹·s⁻¹
- **Integrated rate laws and their linear plots:**
  - Zero order: [A] = [A]₀ − kt → plot [A] vs t is linear (slope = −k).
  - First order: ln[A] = ln[A]₀ − kt → plot ln[A] vs t is linear (slope = −k).
  - Second order: 1/[A] = 1/[A]₀ + kt → plot 1/[A] vs t is linear (slope = +k).
- **Half-life formulas:**
  - First order: t₁/₂ = ln(2)/k = 0.693/k. CONSTANT (doesn't depend on starting concentration).
  - Zero order: t₁/₂ = [A]₀/(2k). DEPENDS on starting concentration.
  - Second order: t₁/₂ = 1/(k[A]₀). DEPENDS on starting concentration.
- **Activation energy (Eₐ):** the minimum energy required for reactants to form products. Visible as the height of the energy barrier on a reaction coordinate diagram.
- **Energy profile diagram:**
  - X-axis: reaction progress.
  - Y-axis: potential energy.
  - Reactants on the left, products on the right.
  - Hump in middle = transition state (top of activation energy barrier).
  - Difference between reactant and product energies = ΔH for the reaction.
- **Effects on reaction rate:**
  - ↑ Temperature → ↑ rate (more molecules with enough energy + faster motion).
  - ↑ Concentration → ↑ rate (more collisions per unit time).
  - ↑ Surface area (for solids) → ↑ rate.
  - Catalyst → ↑ rate (lowers Eₐ).
- **Catalyst effects:**
  - Lowers Eₐ for both forward and reverse reactions equally.
  - Speeds up the reaction approach to equilibrium.
  - Does NOT change ΔH, ΔG, or the equilibrium constant.
  - Is NOT consumed in the overall reaction.
- **Mechanism basics:** an elementary step is a single molecular event. Its rate law equals its molecularity (number of reactant molecules colliding):
  - Unimolecular: A → products, rate = k[A]
  - Bimolecular: A + B → products, rate = k[A][B] (or k[A]² for 2A)
  - Termolecular: very rare in practice.
- **Rate-determining step (RDS):** the slowest elementary step in a mechanism. It limits the overall rate, so the overall rate law is governed by the RDS.

### Adds for [4]

- **Determining order from initial-rates data — the systematic algorithm.** Given a table with at least 3 trials varying [A], [B], etc.:
  1. Find two trials where [A] changes but [B] is constant.
  2. Compute (rate₂/rate₁) and ([A]₂/[A]₁).
  3. The order m satisfies (rate₂/rate₁) = ([A]₂/[A]₁)^m. Solve for m by inspection.
  4. Repeat for [B] and other reactants.
  5. Plug a known trial back in to find k.
- **Half-life of first-order reaction is INDEPENDENT of [A]₀.** This is the diagnostic property: if a reaction takes the same time to drop from 1.0 M → 0.5 M as from 0.5 M → 0.25 M as from 0.25 M → 0.125 M, it's first order.
- **Multi-step mechanism with fast equilibrium step before RDS.** When the slow step uses an intermediate (something formed in an earlier step), you must:
  1. Apply the equilibrium expression of the earlier fast-equilibrium step.
  2. Solve for the intermediate's concentration in terms of starting reactants.
  3. Substitute into the slow step's rate law.
  4. The result is the overall rate law in terms of measurable concentrations only.
- **Mechanism validity checks:**
  - The sum of elementary steps (with appropriate cancellations of intermediates and catalysts) must equal the overall balanced equation.
  - The mechanism's predicted rate law (from the RDS, with substitutions for intermediates) must match the experimental rate law.
- **Maxwell-Boltzmann distribution and temperature:**
  - At higher T, the curve flattens and shifts right.
  - More molecules have energy ≥ Eₐ.
  - Even small T increases produce large rate increases (exponential dependence per Arrhenius).
- **Arrhenius equation:** k = A·e^(−Eₐ/RT).
  - A = pre-exponential factor (collision frequency × orientation factor).
  - The exponential term gives the fraction of collisions with sufficient energy.
  - Linear form: ln k = ln A − Eₐ/(RT). Plot ln k vs 1/T → slope = −Eₐ/R.
- **Activation energy from Arrhenius two-point form:** ln(k₂/k₁) = −(Eₐ/R)(1/T₂ − 1/T₁). Used to find Eₐ from k at two different temperatures.
- **Catalysis types:**
  - Homogeneous: catalyst in same phase as reactants (e.g., dissolved catalyst in solution).
  - Heterogeneous: catalyst in different phase (e.g., solid Pt catalyzing gas-phase H₂ + O₂).
  - Enzyme catalysis: protein catalyst in biology, often very specific.
- **Why a catalyst doesn't shift equilibrium:** it lowers BOTH the forward and reverse Eₐ by the same amount. The ratio of forward to reverse rate constants stays the same, so K_eq is unchanged.

### Adds for [5]

- **Steady-state approximation [5] move.** When an intermediate is formed and consumed by elementary steps that are comparable in rate, the steady-state approximation says d[Intermediate]/dt ≈ 0. You set the formation rate equal to the consumption rate, solve for [Intermediate], and substitute back. This is more general than the fast-equilibrium approach but is also harder.
- **Pre-exponential factor A and orientation.** Some reactions have very small A because they require a specific molecular orientation. For example, an SN2 reaction requires backside attack — most collisions don't have the right geometry, so A is small. This explains why two reactions with similar Eₐ can have very different rate constants.
- **Why Maxwell-Boltzmann tail dominates rate.** The rate constant depends on the FRACTION of molecules with energy ≥ Eₐ, which is the integral over the high-energy tail of the M-B distribution. A 10°C temperature rise typically doubles the rate of a reaction with Eₐ ~50 kJ/mol because exponentially more molecules cross the threshold.
- **Distinguishing intermediates from transition states:** intermediates have a finite lifetime and appear as local MINIMA on the energy diagram (between two activation barriers). Transition states are MAXIMA (tops of barriers) with effectively zero lifetime — they're a saddle point on the potential energy surface.
- **Multistep energy diagram interpretation:**
  - Number of barriers = number of elementary steps.
  - Tallest barrier = rate-determining step.
  - Intermediates appear as wells between barriers.
  - Net ΔH = (final products energy) − (initial reactants energy).
- **The [5] sophistication move on rate law derivation:** explicitly state, for a fast-equilibrium-then-slow mechanism, that "at equilibrium, the forward rate equals the reverse rate, so [intermediate] = (k_f/k_r) × [reactant1][reactant2]. Substituting into the slow step rate law eliminates the intermediate and yields rate = k_obs × [reactants]^orders, where k_obs lumps the constants."
- **Why catalyzed pathways are different reactions, kinetically.** A catalyst doesn't just speed up the original mechanism — it provides a NEW mechanism with different intermediates and a lower-energy transition state. Saying "the catalyst lowers Eₐ" is correct but the deeper explanation is "the catalyst changes the mechanism to one that goes through a lower transition state."
- **Reaction order can be fractional** (e.g., rate = k[A]^(1/2)[B]) for reactions with complicated mechanisms. Don't assume orders are always integers.
- **Negative orders** appear when adding more of a species SLOWS the reaction — usually because that species participates in a fast equilibrium step before the RDS, and shifts the equilibrium toward reactants. Rare on AP, but conceptually possible.

## Worked Examples

### Example 1 [3][4] — Determining rate law from initial-rates data

For the reaction 2 NO + Cl₂ → 2 NOCl, the following initial-rates data is obtained:

| Trial | [NO]₀ (M) | [Cl₂]₀ (M) | Initial rate (M/s) |
|-------|-----------|------------|---------------------|
| 1     | 0.10      | 0.10       | 0.0010              |
| 2     | 0.20      | 0.10       | 0.0040              |
| 3     | 0.20      | 0.20       | 0.0080              |

Determine the rate law and the value of k.

- **Step 1.** Find order with respect to NO. Compare trials 1 and 2 ([Cl₂] constant):
  - [NO] doubles (0.10 → 0.20). Rate quadruples (0.0010 → 0.0040). So 2^m = 4 → m = 2.
- **Step 2.** Find order with respect to Cl₂. Compare trials 2 and 3 ([NO] constant):
  - [Cl₂] doubles (0.10 → 0.20). Rate doubles (0.0040 → 0.0080). So 2^n = 2 → n = 1.
- **Step 3.** Rate law: rate = k[NO]²[Cl₂]. Overall order = 3.
- **Step 4.** Solve for k using trial 1: 0.0010 = k(0.10)²(0.10) → k = 0.0010 / (0.001) = 1.0 M⁻²·s⁻¹.
- **Sanity check:** units of k for third-order reaction = M⁻²·s⁻¹ ✓.

### Example 2 [3][4] — Half-life and integrated rate law

A first-order reaction has a half-life of 25.0 min. Starting from 1.00 M, how much reactant remains after 75.0 min?

- **Step 1.** First-order half-life: t₁/₂ = 0.693/k → k = 0.693/25.0 = 0.0277 min⁻¹.
- **Step 2.** Integrated rate law: ln[A] = ln[A]₀ − kt.
  - ln[A] = ln(1.00) − (0.0277)(75.0) = 0 − 2.08 = −2.08
  - [A] = e^(−2.08) = 0.125 M
- **Sanity check:** 75 min = 3 half-lives. Starting from 1.00 M: after 1 half-life = 0.50 M; after 2 = 0.25 M; after 3 = 0.125 M ✓.
- **[4] insight:** for a first-order reaction, the half-life is constant — the reaction takes the same time to drop by half regardless of starting concentration. This is unique to first-order.

### Example 3 [4][5] — Mechanism with rate-determining step

The proposed mechanism for the reaction 2 NO + O₂ → 2 NO₂ is:
- Step 1 (fast equilibrium): 2 NO ⇌ N₂O₂
- Step 2 (slow): N₂O₂ + O₂ → 2 NO₂

(a) Identify the intermediate. (b) Derive the predicted rate law.

- **Step 1.** Intermediate = N₂O₂ (formed in step 1, consumed in step 2; appears in mechanism but not in overall equation).
- **Step 2.** Rate of slow step: rate = k₂[N₂O₂][O₂].
- **Step 3.** N₂O₂ is an intermediate — eliminate via fast-equilibrium step. At equilibrium for step 1:
  - k_f[NO]² = k_r[N₂O₂]
  - [N₂O₂] = (k_f/k_r)[NO]²
- **Step 4.** Substitute back: rate = k₂(k_f/k_r)[NO]²[O₂] = k_obs[NO]²[O₂], where k_obs = k₂k_f/k_r.
- **Step 5.** Predicted rate law: rate = k_obs[NO]²[O₂]. Overall order = 3.
- **Mechanism check:** sum of steps = 2 NO + N₂O₂ + O₂ → N₂O₂ + 2 NO₂ → cancel N₂O₂ → 2 NO + O₂ → 2 NO₂ ✓.

### Example 4 [4] — Energy profile with catalyst

Sketch a reaction energy profile for an exothermic reaction A → B with Eₐ = 100 kJ/mol and ΔH = −50 kJ/mol. Then add a second curve showing the catalyzed pathway with Eₐ = 60 kJ/mol.

- **Description (since this is markdown — describe the curve):**
  - Reactants A on the left at energy 0.
  - Curve rises to a peak at +100 kJ/mol (transition state for uncatalyzed).
  - Curve falls to products B at −50 kJ/mol (exothermic).
  - Net ΔH = −50 kJ/mol.
- **Catalyzed curve:**
  - Same reactants A at 0.
  - Lower peak at +60 kJ/mol.
  - Same products B at −50 kJ/mol.
- **Key teaching points:**
  - Both curves START and END at the same energies. The catalyst changes the PATH, not the endpoints.
  - ΔH is unchanged: −50 kJ/mol in both cases.
  - The catalyst lowers Eₐ for both forward and reverse: forward Eₐ goes 100 → 60; reverse Eₐ goes 150 → 110.
- **[4] phrase:** "The catalyzed pathway has a lower activation energy because the catalyst provides an alternative reaction mechanism with a lower-energy transition state. The thermodynamic quantities (ΔH, ΔG) and equilibrium position are unchanged because they depend only on the energies of reactants and products, not the height of any barrier in between."

### Example 5 [4][5] — Arrhenius two-point calculation

A reaction has rate constant k₁ = 0.0150 s⁻¹ at 298 K and k₂ = 0.0750 s⁻¹ at 318 K. Find Eₐ.

- **Step 1.** Two-point Arrhenius: ln(k₂/k₁) = −(Eₐ/R)(1/T₂ − 1/T₁)
- **Step 2.** Compute the left side: ln(0.0750/0.0150) = ln(5.00) = 1.609.
- **Step 3.** Compute (1/T₂ − 1/T₁) = (1/318) − (1/298) = 0.003145 − 0.003356 = −2.11 × 10⁻⁴ K⁻¹.
- **Step 4.** Solve: 1.609 = −(Eₐ/8.314)(−2.11 × 10⁻⁴)
  - Eₐ = (1.609 × 8.314) / (2.11 × 10⁻⁴) = 6.35 × 10⁴ J/mol = 63.5 kJ/mol.
- **Sanity check:** rate quintupled with a 20 K temperature rise → moderately high Eₐ in the 50–80 kJ/mol range ✓.

## Top Traps & Common Errors

1. **Reading orders from balanced equation coefficients.** Orders are EXPERIMENTAL. The rate law for 2 NO + O₂ → 2 NO₂ is NOT automatically rate = k[NO]²[O₂]; it's whatever experiment shows.
2. **Forgetting that rate-law coefficients in elementary steps DO match molecularity.** This is the one exception: elementary step A + B → products has rate = k[A][B] by definition.
3. **Confusing intermediate with catalyst in a mechanism.** Intermediate is FORMED in one step and CONSUMED in a later step (zero net amount). Catalyst is CONSUMED early and REGENERATED later (zero net amount). Both cancel out of the overall equation, but they have different roles.
4. **Half-life for non-first-order reactions assumed constant.** Only first-order has constant half-life. For zero or second order, t₁/₂ depends on [A]₀.
5. **Wrong units for k.** Each overall order has its own k units. M⁻¹·s⁻¹ for second order; s⁻¹ for first; M·s⁻¹ for zero.
6. **Saying catalyst "speeds up" without explaining mechanism change.** AP wants "lowers activation energy by providing an alternative mechanism with a lower-energy transition state."
7. **Saying catalyst "shifts equilibrium toward products."** Catalysts do NOT shift equilibrium; they speed up the approach to equilibrium in both directions equally.
8. **Confusing transition state with intermediate on the energy diagram.** Transition state = MAXIMUM (peak). Intermediate = LOCAL MINIMUM (well between two peaks).
9. **Using log base 10 in Arrhenius when ln (natural log) is needed.** ln k vs 1/T gives slope = −Eₐ/R. log₁₀ would give slope = −Eₐ/(2.303R).
10. **Not converting temperature to Kelvin in Arrhenius.** Always Kelvin.
11. **Wrong sign on Arrhenius slope.** Slope of ln k vs 1/T is NEGATIVE because Eₐ is positive; the higher T (smaller 1/T) → larger k.
12. **Incomplete mechanism sum-check.** When adding elementary steps, intermediates must cancel exactly. If anything other than the overall reactants and products remains, the mechanism is wrong or you've made an arithmetic error.
13. **Treating ΔH and Eₐ as the same thing.** ΔH = energy of products − energy of reactants. Eₐ = energy of transition state − energy of reactants. Different quantities, both visible on the energy diagram.
14. **Saying "increasing concentration increases rate constant."** Concentration affects RATE but NOT the rate constant k. k depends only on temperature (and presence of catalyst).
15. **Drawing energy profile with the catalyzed and uncatalyzed curves having different product energies.** The catalyst doesn't change the product energy. Both curves end at the same level.

## Rubric-Aware Tactics

**For initial-rates rate-law derivation:**
- Show the comparison ratios explicitly: rate ratio = concentration ratio raised to order.
- State each order with its variable and derive each separately.
- Combine into the rate law expression with units of k.
- Solve for k using one trial; check with another.

**For integrated rate law / half-life problems:**
- Identify the order from a graph (which plot is linear?) or from the half-life behavior (constant or not?).
- Apply the correct integrated form.
- Show all algebra.

**For mechanism problems:**
- Identify the rate-determining step (the slow one).
- Write the rate law for that step.
- If intermediates appear, eliminate them via the prior fast-equilibrium step.
- Verify the predicted rate law matches the experimental rate law.
- Verify the mechanism sum equals the overall equation.

**For energy profile problems:**
- Label reactants, products, transition state, activation energy (Eₐ), and ΔH on the diagram.
- For multi-step mechanisms, label each transition state and intermediate.
- For catalyzed comparisons, draw both curves with the same start and end points.

**For catalyst questions:**
- State that the catalyst lowers Eₐ by providing an alternative mechanism with a lower-energy transition state.
- State that ΔH, ΔG, and K_eq are unchanged.
- State that the catalyst is regenerated (not consumed in the overall reaction).

**For Arrhenius / temperature dependence:**
- Apply the two-point form when given k at two temperatures.
- Use Kelvin.
- Show all algebra.

## "Phrases That Score" — verbatim language for FRQs

1. "From the initial-rates data, doubling [reactant X] caused the rate to [factor] by a factor of [n], so the order with respect to X is [m] where 2^m = n."
2. "The rate law is rate = k[A]^m[B]^n. Substituting trial [#] into this expression yields k = [value with units]."
3. "Because the half-life of this reaction is constant (independent of starting concentration), the reaction is first order. The rate constant is calculated from t₁/₂ = 0.693/k."
4. "The rate-determining step is the slow step. Its rate law is rate = k[reactants of slow step]. Substituting for any intermediate using the prior fast-equilibrium step yields the overall rate law in terms of the original reactants."
5. "A catalyst lowers the activation energy by providing an alternative reaction mechanism with a lower-energy transition state. The catalyst is not consumed in the overall reaction, and it does not change the thermodynamic quantities ΔH, ΔG, or the equilibrium constant K."
6. "Increasing temperature increases the rate because a larger fraction of molecules have kinetic energies exceeding the activation energy, as shown by the rightward shift of the Maxwell-Boltzmann distribution."
7. "An intermediate is a species formed in one elementary step and consumed in a subsequent step. It appears as a local minimum on the energy profile between two transition states."

## If You Do Nothing Else for This Unit

*Master the rate law derivation from initial-rates data: pairwise comparisons of trials with one concentration changed at a time, rate ratio equals concentration ratio raised to the unknown order, solve for each order independently, then assemble. This single technique is responsible for at least one full FRQ on the AP exam every year.*

_lastUpdated: 2026-05-04
_sources: College Board AP Chemistry CED 2024-25, Princeton Review AP Chemistry 2025, Khan Academy AP Chemistry, AP Chemistry Released FRQs 2014–2024, Atkins Physical Chemistry
_difficulty: intermediate
_relatedUnits: ap-chemistry-unit-6-thermodynamics, ap-chemistry-unit-7-equilibrium
