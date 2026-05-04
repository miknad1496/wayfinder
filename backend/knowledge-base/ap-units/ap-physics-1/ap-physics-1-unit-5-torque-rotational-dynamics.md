# AP Physics 1 — Unit 5: Torque and Rotational Dynamics — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 10–15% of the AP Physics 1 exam
- **Sub-topics covered:** torque; rotational equilibrium; angular variables (angular position, velocity, acceleration); rotational kinematic equations; moment of inertia; rotational form of Newton's 2nd Law (τ = Iα).
- **Where this unit appears on the exam:** Rotational mechanics. Torque problems and rotational equilibrium are common. Rotational analogs of translational equations are central.

## Big Ideas

1. **Torque (τ) is the rotational analog of force.** τ = r × F (where r is lever arm).
2. **Newton's 2nd Law in rotational form: τ_net = Iα.**
3. **Moment of inertia (I) is the rotational analog of mass.** Depends on mass DISTRIBUTION (not just total mass).
4. **Rotational equilibrium:** net torque = 0 (no angular acceleration).
5. **Angular variables (θ, ω, α) follow rotational kinematic equations** parallel to linear (x, v, a).

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Angular position (θ):** angle from reference. Units: radians (or degrees).
- **Angular velocity (ω):** rate of angular position change. Units: rad/s.
  - **ω = Δθ/Δt.**
- **Angular acceleration (α):** rate of angular velocity change. Units: rad/s².
  - **α = Δω/Δt.**
- **Relationship between linear and angular for object on rim of rotating circle:**
  - **v = rω** (linear velocity = radius × angular velocity).
  - **a_t = rα** (tangential acceleration = radius × angular acceleration).
- **Rotational kinematic equations** (constant α, parallel to linear):
  - ω_f = ω_i + αt.
  - Δθ = ω_i·t + (1/2)αt².
  - ω_f² = ω_i² + 2α·Δθ.
- **Torque (τ):** rotational analog of force.
  - **τ = r × F = rF·sin(θ),** where r is distance from axis to point of force application, F is force, θ is angle between r and F.
  - **Maximum torque** when force is perpendicular to lever arm (sin(θ) = 1).
  - Units: N·m.
- **Moment of inertia (I):** rotational analog of mass.
  - Depends on mass DISTRIBUTION about axis of rotation.
  - For point mass: I = mr².
  - For collection: I = Σm_i·r_i².
  - Common shapes (memorize):
    - Solid disk/cylinder (axis through center): I = (1/2)MR².
    - Hollow cylinder (axis through center): I = MR².
    - Solid sphere: I = (2/5)MR².
    - Hollow sphere: I = (2/3)MR².
    - Rod (axis at center): I = (1/12)ML².
    - Rod (axis at end): I = (1/3)ML².
- **Rotational form of Newton's 2nd Law:**
  - **τ_net = Iα.**
  - Net torque equals moment of inertia times angular acceleration.
- **Rotational equilibrium:**
  - τ_net = 0 (no angular acceleration).
  - Σ(τ clockwise) = Σ(τ counterclockwise).

### Adds for [4]

- **Why torque is r × F.**
  - Force at distance r from axis has rotational effect proportional to r.
  - Same force has more rotational effect at greater distance.
  - Component of force perpendicular to r contributes; parallel doesn't.
  - Hence τ = r·F·sin(θ).
- **Center of mass for systems.** Behaves as if all mass concentrated there.
- **Lever arm:** perpendicular distance from rotation axis to line of force.
  - Easier visualization: lever arm is "moment arm."
- **Equilibrium problems:**
  - Two conditions: F_net = 0 AND τ_net = 0.
  - Useful for see-saw, beam, ladder problems.
- **Rolling motion:**
  - Pure rolling: v_cm = rω (no slipping).
  - For rolling object, KE = (1/2)mv² + (1/2)Iω².

### Adds for [5]

- **Why moment of inertia depends on mass distribution.**
  - Mass farther from axis has more rotational inertia.
  - Hollow cylinder has higher I than solid cylinder of same mass and radius — mass concentrated at outer radius.
  - This is why ice skaters pull arms in to spin faster — reduces I, so ω increases (since L = Iω is conserved).
- **Connection to translational analogs.**
  - Position (x) ↔ angle (θ).
  - Velocity (v) ↔ angular velocity (ω).
  - Acceleration (a) ↔ angular acceleration (α).
  - Mass (m) ↔ moment of inertia (I).
  - Force (F) ↔ torque (τ).
  - F = ma ↔ τ = Iα.
  - Linear momentum (p = mv) ↔ angular momentum (L = Iω).
  - KE = (1/2)mv² ↔ rotational KE = (1/2)Iω².

## Worked Examples

### Example 1 [3] — Torque calculation

A force of 20 N is applied perpendicular to a 0.5 m lever arm. Find torque.
- τ = rF·sin(90°) = 0.5·20·1 = 10 N·m.

### Example 2 [3] — Rotational kinematic

A wheel starts at rest, accelerates at 2 rad/s² for 5 seconds. Find angular velocity.
- ω_f = ω_i + αt = 0 + 2·5 = 10 rad/s.

### Example 3 [4] — Moment of inertia

A solid disk of mass 2 kg and radius 0.5 m rotates about its center. Find I.
- I = (1/2)MR² = (1/2)(2)(0.5)² = 0.25 kg·m².

### Example 4 [4] — Equilibrium

A 5 m beam (mass 20 kg) is supported at its ends. A 30 kg person stands 2 m from the left end.
Find force at left support.

- Take torques about right support.
- Person's torque (counterclockwise about right support): F_p · 3 m = 30·9.8·3 = 882 N·m.
- Beam weight torque (counterclockwise about right support): 20·9.8·2.5 = 490 N·m.
- Left support torque (clockwise): F_L · 5 m.
- Equilibrium: F_L · 5 = 882 + 490 = 1372 → F_L = 274.4 N.
- (Right support force found similarly.)

### Example 5 [4][5] — Rotational dynamics

A torque of 30 N·m is applied to a wheel with moment of inertia 5 kg·m². Find angular acceleration.
- τ = Iα → 30 = 5·α → α = 6 rad/s².

## Top Traps & Common Errors

1. **Forgetting sin(θ) in torque formula.** τ = rF·sin(θ). When force is perpendicular to r, sin = 1.
2. **Confusing angular and linear quantities.** ω is angular; v is linear. v = rω.
3. **Wrong moment of inertia formula.** Different shapes have different formulas.
4. **Forgetting that I depends on AXIS of rotation.** Same object has different I for different axes.
5. **Mixing units (degrees vs radians).** AP usually uses radians.

## Rubric-Aware Tactics

**For torque problems:**
- Identify forces and lever arms.
- Determine torque direction (clockwise/counterclockwise).
- Apply equilibrium or τ = Iα.

**For rotational kinematic problems:**
- Use rotational analog of kinematic equations.
- Substitute consistently.

**For moment of inertia:**
- Identify shape and axis.
- Use appropriate formula.

## "Phrases That Score" — verbatim language for FRQs

1. "Torque is the rotational analog of force: τ = r × F = rF·sin(θ). Maximum torque occurs when the force is perpendicular to the lever arm."
2. "Newton's 2nd Law in rotational form: τ_net = Iα. The net torque equals the product of moment of inertia and angular acceleration."
3. "Moment of inertia depends on mass distribution about the axis of rotation. For a solid cylinder rotating about its central axis: I = (1/2)MR²."
4. "Rotational equilibrium requires both F_net = 0 AND τ_net = 0."
5. "Rotational kinematic equations parallel translational ones: ω_f = ω_i + αt, Δθ = ω_i·t + (1/2)αt², ω_f² = ω_i² + 2α·Δθ."

## If You Do Nothing Else for This Unit

*Master torque calculation (τ = rF·sin(θ)). Master rotational form of Newton's 2nd Law (τ_net = Iα). Memorize moment of inertia formulas for common shapes. Master rotational equilibrium.*

_lastUpdated: 2026-05-04
_sources: College Board AP Physics 1 CED 2024-25, Princeton Review AP Physics 1 2025, Khan Academy AP Physics 1, Halliday & Resnick *Fundamentals of Physics*
_difficulty: intermediate
_relatedUnits: ap-physics-1-unit-2-force-dynamics, ap-physics-1-unit-6-rotating-systems
