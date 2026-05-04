# AP Physics C: Electricity and Magnetism — Unit 4: Magnetic Fields and Sources — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 17–23% of the AP Physics C: E&M exam
- **Sub-topics covered:** magnetic force on charges and currents; force between current-carrying wires; Biot-Savart law; Ampère's law; field of solenoid; magnetic flux.
- **Where this unit appears on the exam:** Biot-Savart integrations for B field of distributions. Ampère's law for symmetric currents. Right-hand rule applications.

## Big Ideas

1. **Magnetic force on moving charge:** F = qv × B.
2. **Force on current-carrying wire:** F = ∫I dL × B.
3. **Biot-Savart law:** dB = (μ₀/4π) I dL × r̂/r².
4. **Ampère's law:** ∮B·dl = μ₀I_enc.
5. **Magnetic flux:** Φ_B = ∫B·dA (essential for Faraday in next unit).

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Magnetic force on moving charge:**
  - **F = qv × B.**
  - **Magnitude:** F = qvB sin θ.
  - **Direction:** right-hand rule.
  - **Force perpendicular to v** → no work; KE unchanged.
- **Charged particle in uniform B (perpendicular):**
  - **Circular motion.**
  - **r = mv/(qB).**
  - **T = 2πm/(qB)** (independent of v).
- **Force on current-carrying wire:** F = IL × B (or magnitude F = ILB sin θ).
- **Force between parallel wires:**
  - **Currents same direction:** attract.
  - **Currents opposite:** repel.
  - **F/L = μ₀I₁I₂/(2πd).**
- **Biot-Savart law:** dB = (μ₀/4π) I dL × r̂/r².
- **Ampère's law:** ∮B·dl = μ₀I_enc.
- **Common results from Ampère's law:**
  - **Long straight wire:** B = μ₀I/(2πr).
  - **Solenoid (interior):** B = μ₀nI (n = turns per unit length).
  - **Toroid:** B = μ₀NI/(2πr) inside.
- **Magnetic flux:** Φ_B = ∫B·dA = BA cos θ (uniform B, flat surface).

### Adds for [4]

- **Biot-Savart for ring of current:**
  - **At center:** B = μ₀I/(2R).
  - **On axis distance x from center:** B = μ₀IR²/(2(R² + x²)^(3/2)).
- **Field of finite straight wire:**
  - **B = (μ₀I/4πr)(sin θ₁ + sin θ₂)** where θ are angles from perpendicular to ends.
- **Why solenoid B = μ₀nI:**
  - Apply Ampère's law to rectangular loop (one side inside, others negligible).
- **Hall effect:** moving charges in B field accumulate on one side; produces transverse voltage.

### Adds for [5]

- **Why Ampère's law works:** symmetry → B uniform on Amperian loop.
- **Why F·v = 0** for magnetic force: dot product zero → no work.

## Worked Examples

### Example 1 [3] — Force on charge

Electron at v = 10⁶ m/s perpendicular to B = 0.1 T. Force?
- **F = qvB = (1.6×10⁻¹⁹)(10⁶)(0.1) = 1.6×10⁻¹⁴ N.**

### Example 2 [3] — Field around wire

Long wire 5 A; field at 0.02 m?
- **B = μ₀I/(2πr) = (4π×10⁻⁷)(5)/(2π·0.02) = 5×10⁻⁵ T.**

### Example 3 [4] — Solenoid

Solenoid 1000 turns/m, current 2 A. Interior B?
- **B = μ₀nI = (4π×10⁻⁷)(1000)(2) = 2.51×10⁻³ T = 2.51 mT.**

### Example 4 [4] — Circular orbit in B

Proton (m = 1.67×10⁻²⁷ kg, q = 1.6×10⁻¹⁹ C) at 10⁶ m/s in B = 1 T. Radius?
- **r = mv/(qB) = (1.67×10⁻²⁷)(10⁶)/((1.6×10⁻¹⁹)(1)) ≈ 1.04×10⁻² m = 1 cm.**

### Example 5 [5] — Biot-Savart for ring

Ring of radius R, current I; field at center.
- **dB = (μ₀/4π)(I dL × r̂/R²).**
- **dL is along ring; r̂ from dL to center, perpendicular.**
- **dB = (μ₀ I dL)/(4π R²) into page** (consistent direction).
- **Integrate dL → 2πR:** B = μ₀I·2πR/(4πR²) = μ₀I/(2R).

## Top Traps & Common Errors

1. **Right-hand rule errors.** Practice carefully; reverse for electron.
2. **F·v = 0** → magnetic force does no work.
3. **Ampère's law only useful** with symmetry.
4. **Biot-Savart is vector integral.**
5. **Solenoid n** = turns per unit LENGTH, not total turns.

## Rubric-Aware Tactics

**For force:** identify v × B; right-hand rule.
**For B from currents:** symmetry → Ampère; otherwise Biot-Savart.

## "Phrases That Score" — verbatim language for FRQs

1. "Magnetic force F = qv × B is perpendicular to velocity, so it does no work and KE remains constant. A charged particle moving perpendicular to a uniform B field undergoes circular motion with r = mv/(qB)."
2. "Biot-Savart law gives the field from a current element: dB = (μ₀/4π) I dL × r̂/r². Integration over the geometry yields total field."
3. "Ampère's law: ∮B·dl = μ₀I_enc. Useful when symmetry allows: long wire (B = μ₀I/2πr), solenoid (B = μ₀nI), toroid."
4. "Two parallel wires carrying currents in the same direction attract each other; opposite directions repel. Force per unit length: F/L = μ₀I₁I₂/(2πd)."
5. "Magnetic flux Φ_B = ∫B·dA. Uniform field through flat area: Φ_B = BA cos θ. Essential for Faraday's law of induction."

## If You Do Nothing Else for This Unit

*Master F = qv × B (right-hand rule). Master B around wire. Master solenoid. Master Biot-Savart for distributions. Master Ampère's law symmetry cases.*

_lastUpdated: 2026-05-04
_sources: College Board AP Physics C: E&M CED 2024-25, Princeton Review AP Physics C 2025, Halliday-Resnick-Walker
_difficulty: advanced
_relatedUnits: ap-physics-c-em-unit-3-circuits, ap-physics-c-em-unit-5-electromagnetic-induction
