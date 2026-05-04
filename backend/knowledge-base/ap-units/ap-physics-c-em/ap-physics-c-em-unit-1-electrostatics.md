# AP Physics C: Electricity and Magnetism — Unit 1: Electrostatics — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 26–34% of the AP Physics C: E&M exam (largest unit)
- **Sub-topics covered:** Coulomb's law; electric field (continuous distributions, integration); electric flux; Gauss's law; electric potential; calculating V from E (and vice versa) via integration.
- **Where this unit appears on the exam:** Foundational. Calculus-based field/potential calculations from continuous charge distributions (line, ring, disk, shell). Gauss's law applications.

## Big Ideas

1. **Coulomb's law** for point charges; superposition for systems.
2. **Continuous distributions** require integration: E = ∫ kdq/r² r̂.
3. **Gauss's law:** ∮E·dA = Q_enc/ε₀ — powerful when symmetry exists.
4. **Electric potential** V = −∫E·dl from reference (often infinity).
5. **E = −∇V** (relate field and potential via gradient).

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Coulomb's law:** F = kq₁q₂/r², with k = 1/(4πε₀) = 9×10⁹ N·m²/C².
- **Field of point charge:** E = kq/r² (away from + charge; toward − charge).
- **Superposition:** total E from multiple charges = vector sum of individual E.
- **Continuous distributions:** dq from charge density.
  - **Linear:** λ = dq/dl (C/m).
  - **Surface:** σ = dq/dA (C/m²).
  - **Volume:** ρ = dq/dV (C/m³).
- **E from continuous distribution:** E = ∫(k dq/r²) r̂ along the geometry.
- **Electric flux:** Φ_E = ∫E·dA over surface.
- **Gauss's law:** ∮E·dA = Q_enc/ε₀.
- **Common Gauss's law applications (high symmetry):**
  - **Point charge or spherical shell:** E = kq/r² outside; E = 0 inside hollow shell.
  - **Infinite line:** E = λ/(2πε₀r).
  - **Infinite plane:** E = σ/(2ε₀) (each side).
  - **Two oppositely charged plates (capacitor):** E = σ/ε₀ between, ~0 outside.
- **Electric potential:**
  - **V = −∫E·dl** from reference point.
  - **Point charge:** V = kq/r (zero at infinity).
  - **Continuous distribution:** V = ∫k dq/r (scalar — easier to integrate than E).
- **Potential difference:** ΔV = V_b − V_a; W = qΔV.
- **E from V:** E = −dV/dx (1D), generally E = −∇V.
- **Conductors in equilibrium:**
  - **E = 0 inside.**
  - **Charge resides on surface.**
  - **Surface E perpendicular to conductor.**

### Adds for [4]

- **Field on axis of charged ring:**
  - **E = kqx/(x² + R²)^(3/2)** along axis (x = distance from center).
  - **At center of ring:** E = 0.
- **Field on axis of charged disk:**
  - **E = (σ/2ε₀)(1 − x/√(x² + R²)).**
  - **At center:** E = σ/(2ε₀) — same as infinite plane in limit.
- **Field of uniformly charged sphere (insulator):**
  - **Outside (r > R):** E = kQ/r².
  - **Inside (r < R):** E = kQr/R³ (linear).
- **Why Gauss helps:** symmetry → E constant on Gaussian surface → integral simplifies.
- **Equipotential surfaces** perpendicular to E.

### Adds for [5]

- **Why E = −∇V intuitive:** force points "downhill" on potential.
- **Why V more useful for many problems:** scalar (no direction); easier to add.

## Worked Examples

### Example 1 [3] — Field of point charge

Field 0.5 m from +3 μC charge?
- **E = kq/r² = (9×10⁹)(3×10⁻⁶)/0.25 = 1.08×10⁵ N/C** (away from +).

### Example 2 [3] — Gauss's law for sphere

Charge Q on conducting sphere of radius R. Field at distance r > R?
- **By Gauss:** E·4πr² = Q/ε₀ → **E = Q/(4πε₀r²) = kQ/r²** (same as point charge at center).

### Example 3 [4] — Field on axis of ring

Ring of charge Q, radius R, on x-axis. Field at distance x along axis?
- **By symmetry, only x-component survives.**
- **dE_x = (k dq/r²) cos θ = (k dq/(x²+R²)) · x/√(x²+R²).**
- **Integrate dq → Q:** E_x = kQx/(x²+R²)^(3/2).
- **At center (x=0):** E = 0. **As x → ∞:** E → kQ/x² (point charge).

### Example 4 [4] — Potential of uniform line charge

Line of length 2L, charge density λ. Potential at distance d above midpoint?
- **dV = k dq/r = kλ dx/√(x²+d²).**
- **V = kλ ∫_{-L}^{L} dx/√(x²+d²) = kλ · ln((L+√(L²+d²))/(−L+√(L²+d²))).**
- **Or using sinh⁻¹:** V = 2kλ sinh⁻¹(L/d).

### Example 5 [5] — E from V

V(x, y, z) = 5x²y. Find E.
- **E = −∇V = −(∂V/∂x x̂ + ∂V/∂y ŷ + ∂V/∂z ẑ) = −(10xy x̂ + 5x² ŷ).**

## Top Traps & Common Errors

1. **Gauss's law only useful with symmetry.** Sphere, infinite line, infinite plane.
2. **V is scalar; E is vector.** V easier to compute for distributions.
3. **Conductor in equilibrium:** E = 0 inside; charges on surface.
4. **Sign of V:** positive near + charges; integrate from infinity.
5. **Integration limits and geometry** matter; sketch first.

## Rubric-Aware Tactics

**For Gauss's law:** identify symmetry; choose appropriate Gaussian surface (sphere, cylinder, pillbox).
**For continuous distributions:** set up integral with dq and geometry.
**For potential:** integrate dq/r (scalar).

## "Phrases That Score" — verbatim language for FRQs

1. "Gauss's law: ∮E·dA = Q_enc/ε₀. With sufficient symmetry — spherical, cylindrical, or planar — the field is constant on the chosen Gaussian surface, simplifying the integral."
2. "For continuous charge distributions, integrate over the geometry: dE = (k dq/r²) r̂. By symmetry, components perpendicular to a chosen axis often cancel."
3. "Electric potential V = −∫E·dl from a reference point (typically infinity). For a point charge: V = kq/r. Potential is a scalar — much easier than vector field for many calculations."
4. "Field from potential: E = −∇V. In one dimension: E_x = −dV/dx. The field points in the direction of decreasing potential."
5. "In a conductor in electrostatic equilibrium, the electric field inside is zero, all excess charge resides on the surface, and the field just outside is perpendicular to the conductor with magnitude E = σ/ε₀."

## If You Do Nothing Else for This Unit

*Master Coulomb's law and superposition. Master Gauss's law (sphere, line, plane). Master continuous distribution integration. Master V = −∫E·dl. Master E = −∇V.*

_lastUpdated: 2026-05-04
_sources: College Board AP Physics C: E&M CED 2024-25, Princeton Review AP Physics C 2025, Halliday-Resnick-Walker
_difficulty: advanced
_relatedUnits: ap-physics-c-em-unit-2-conductors-capacitors, ap-physics-c-em-unit-3-circuits
