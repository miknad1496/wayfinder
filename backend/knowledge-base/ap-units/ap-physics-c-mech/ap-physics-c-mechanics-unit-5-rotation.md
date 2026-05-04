# AP Physics C: Mechanics — Unit 5: Rotation — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 10–15% of the AP Physics C: Mechanics exam
- **Sub-topics covered:** angular kinematics; moment of inertia (computation by integration); torque; rotational Newton's 2nd; angular momentum; conservation; rotational kinetic energy; rolling; parallel axis theorem.
- **Where this unit appears on the exam:** Moment of inertia integrals. τ = Iα. Angular momentum conservation. Rolling motion (translation + rotation). Parallel axis theorem.

## Big Ideas

1. **Angular analogs** to linear: ω ↔ v, α ↔ a, I ↔ m, τ ↔ F, L ↔ p.
2. **Moment of inertia I = ∫r² dm** depends on mass distribution.
3. **τ = Iα** (rotational Newton's 2nd).
4. **Angular momentum L = Iω** conserved if no external torque.
5. **Parallel axis theorem:** I = I_cm + Md².

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Angular quantities:**
  - **Angular position θ:** in radians.
  - **Angular velocity:** ω = dθ/dt.
  - **Angular acceleration:** α = dω/dt.
  - **Period:** T = 2π/ω.
- **Angular kinematics (constant α):**
  - **ω = ω₀ + αt.**
  - **θ = θ₀ + ω₀t + ½αt².**
  - **ω² = ω₀² + 2α(θ − θ₀).**
- **Linear-angular relations:**
  - **v = rω, a_t = rα** (tangential).
  - **a_c = v²/r = rω²** (centripetal).
- **Moment of inertia:**
  - **I = Σm_i r_i²** (point masses).
  - **I = ∫r² dm** (continuous).
  - **Common values:**
    - **Solid sphere:** I = (2/5)MR².
    - **Hollow sphere:** I = (2/3)MR².
    - **Solid cylinder/disk (axis):** I = ½MR².
    - **Hoop (axis):** I = MR².
    - **Rod (center, ⊥):** I = (1/12)ML².
    - **Rod (end, ⊥):** I = (1/3)ML².
- **Parallel axis theorem:** I = I_cm + Md².
- **Torque:**
  - **τ = r × F.**
  - **Magnitude:** τ = rF sin θ.
  - **Direction:** perpendicular to plane of r, F.
- **Rotational Newton's 2nd:** τ_net = Iα.
- **Rotational KE:** KE_rot = ½Iω².
- **Angular momentum:**
  - **L = Iω** (rigid body about fixed axis).
  - **L = r × p** (general, single particle).
- **Conservation of L:** if τ_ext = 0, L constant.

### Adds for [4]

- **Rolling without slipping:**
  - **v_cm = Rω.**
  - **a_cm = Rα.**
  - **KE_total = ½Mv_cm² + ½I_cm ω².**
- **Calculating I via integration:**
  - **Rod about end:** I = ∫₀^L (M/L) x² dx = ML²/3.
  - **Disk:** I = ∫₀^R (2πr · σ) r² dr = ½MR² (with σ = M/(πR²)).

### Adds for [5]

- **Why rolling is interesting:** combines translation and rotation; KE in both.
- **Why L conserved illustrates symmetry:** rotational symmetry → L conservation.

## Worked Examples

### Example 1 [3] — Angular kinematics

Wheel from rest, α = 2 rad/s², for 5 s. Final ω?
- **ω = ω₀ + αt = 0 + 2·5 = 10 rad/s.**

### Example 2 [3] — Torque

Force 10 N applied at distance 0.5 m, perpendicular. Torque?
- **τ = rF sin 90° = 0.5·10 = 5 N·m.**

### Example 3 [4] — Moment of inertia

Solid sphere mass 2 kg, radius 0.1 m. I about center?
- **I = (2/5)MR² = 0.4·2·0.01 = 0.008 kg·m².**

### Example 4 [4] — Parallel axis

Rod mass 1 kg, length 1 m, axis at end. I?
- **I_cm (about center) = (1/12)ML² = (1/12)(1)(1) = 1/12.**
- **d = L/2 = 0.5 m.**
- **I = I_cm + Md² = 1/12 + 1·0.25 = 1/12 + 1/4 = 1/12 + 3/12 = 4/12 = 1/3 kg·m².**
- **Matches formula** I_end = ML²/3.

### Example 5 [5] — Rolling KE

Solid sphere (M, R) rolls without slipping at v. Total KE?
- **KE = ½Mv² + ½Iω² = ½Mv² + ½(2/5 MR²)(v/R)².**
- **= ½Mv² + (1/5)Mv² = (7/10)Mv².**

## Top Traps & Common Errors

1. **Wrong moment of inertia.** Memorize common cases or calculate by integration.
2. **Parallel axis theorem requires d** between original axis (CM) and new axis.
3. **Rolling: v_cm = Rω** (not Rω/2 or other).
4. **Angular momentum L conserved** if NO external torque.
5. **Rolling KE** has both translational and rotational parts.

## Rubric-Aware Tactics

**For I:** identify shape; use formula or integrate.
**For dynamics:** τ = Iα.
**For conservation:** identify if external τ = 0.

## "Phrases That Score" — verbatim language for FRQs

1. "Rotational analogs to linear motion: ω ↔ v, α ↔ a, I ↔ m, τ ↔ F, L ↔ p. Rotational Newton's 2nd law: τ_net = Iα."
2. "Moment of inertia I = ∫r² dm depends on the axis and mass distribution. Common values: solid sphere (2/5)MR²; solid cylinder/disk (1/2)MR²; thin rod about center (1/12)ML²; rod about end (1/3)ML²."
3. "Parallel axis theorem: I = I_cm + Md², where d is the distance between the new axis and the axis through the center of mass."
4. "Angular momentum L = Iω is conserved when the net external torque is zero. A figure skater pulling in arms decreases I and increases ω accordingly."
5. "Rolling without slipping: v_cm = Rω. Total kinetic energy: KE = ½Mv_cm² + ½I_cm ω². For a solid sphere: KE = (7/10)Mv²."

## If You Do Nothing Else for This Unit

*Master angular kinematics. Master moment of inertia (common shapes + integration). Master parallel axis theorem. Master τ = Iα. Master rolling motion KE.*

_lastUpdated: 2026-05-04
_sources: College Board AP Physics C: Mechanics CED 2024-25, Princeton Review AP Physics C 2025, Halliday-Resnick-Walker
_difficulty: intermediate
_relatedUnits: ap-physics-c-mechanics-unit-4-linear-momentum, ap-physics-c-mechanics-unit-6-oscillations
