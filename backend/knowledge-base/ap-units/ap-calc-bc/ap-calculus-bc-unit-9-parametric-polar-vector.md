# AP Calculus BC — Unit 9: Parametric Equations, Polar Coordinates, and Vector-Valued Functions — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 11–12% of the AP Calculus BC exam
- **Sub-topics covered:**
  - 9.1 Defining and Differentiating Parametric Equations
  - 9.2 Second Derivatives of Parametric Equations
  - 9.3 Finding Arc Lengths of Curves Given by Parametric Equations
  - 9.4 Defining and Differentiating Vector-Valued Functions
  - 9.5 Integrating Vector-Valued Functions
  - 9.6 Solving Motion Problems Using Parametric and Vector-Valued Functions
  - 9.7 Defining Polar Coordinates and Differentiating in Polar Form
  - 9.8 Find the Area of a Polar Region or the Area Bounded by a Single Polar Curve
  - 9.9 Finding the Area of the Region Bounded by Two Polar Curves
- **Where this unit appears on the exam:** This is BC-specific content (Calc AB doesn't cover this). Parametric and polar topics appear regularly as FRQs. Vector-valued functions for motion problems appear annually. Polar area formulas are essential.

## Big Ideas

1. **Parametric equations describe curves with x and y as functions of a third parameter (often t).** This allows representation of more complex curves than Cartesian functions y = f(x).
2. **For parametric curves, dy/dx = (dy/dt)/(dx/dt).** The slope at any point comes from the parametric derivatives.
3. **Polar coordinates use (r, θ) instead of (x, y).** Conversion: x = r·cos(θ), y = r·sin(θ).
4. **Polar area formula: A = (1/2)·∫r² dθ.** Used for area enclosed by polar curve.
5. **Vector-valued functions describe motion in 2D or 3D.** Position, velocity, acceleration are all vectors.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Parametric equations:** x = f(t), y = g(t), where t is a parameter (often time).
- **Slope (dy/dx) for parametric:** dy/dx = (dy/dt)/(dx/dt), where dx/dt ≠ 0.
- **Second derivative for parametric:** d²y/dx² = d/dx(dy/dx) = [d/dt(dy/dx)]/(dx/dt). Apply chain rule again.
- **Arc length of parametric curve from t = a to t = b:**
  - L = ∫(a to b) √((dx/dt)² + (dy/dt)²) dt.
- **Vector-valued functions:** r(t) = ⟨f(t), g(t)⟩ or sometimes written as (f(t), g(t)).
  - **Position vector:** r(t).
  - **Velocity vector:** v(t) = r'(t) = ⟨f'(t), g'(t)⟩.
  - **Acceleration vector:** a(t) = v'(t) = ⟨f''(t), g''(t)⟩.
  - **Speed:** |v(t)| = √((f'(t))² + (g'(t))²).
- **Total distance for vector-valued function:** ∫|v(t)| dt = ∫√((dx/dt)² + (dy/dt)²) dt. Same as arc length formula.
- **Polar coordinates:**
  - **Conversion to Cartesian:** x = r·cos(θ), y = r·sin(θ).
  - **Conversion from Cartesian:** r = √(x² + y²), θ = arctan(y/x) (with appropriate quadrant).
- **Common polar curves:**
  - **r = constant:** circle of radius r.
  - **r = a·cos(θ):** circle.
  - **r = a·sin(θ):** circle.
  - **r = a + b·cos(θ):** limaçon (cardioid if a = b).
  - **r = a·cos(nθ) or a·sin(nθ):** rose curve. n petals if n odd, 2n if n even.
  - **r = aθ:** Archimedean spiral.
- **Area in polar coordinates:**
  - **Single curve:** A = (1/2) · ∫(α to β) r² dθ.
  - **Between two curves (outer R, inner r):** A = (1/2) · ∫(α to β) (R² - r²) dθ.

### Adds for [4]

- **Eliminating the parameter:**
  - From parametric x = f(t), y = g(t), express t in terms of x (from x = f(t)), then substitute into y = g(t).
  - Useful to recognize the curve type.
- **Velocity and acceleration vectors:**
  - Position r(t) = ⟨f(t), g(t)⟩.
  - Velocity v(t) = ⟨f'(t), g'(t)⟩ — points in direction of motion.
  - Acceleration a(t) = ⟨f''(t), g''(t)⟩ — change in velocity.
  - **Speed = |v(t)|.** Always non-negative.
- **Displacement of vector-valued function:**
  - From t = a to t = b: r(b) - r(a) = ⟨∫f'(t)dt, ∫g'(t)dt⟩.
- **Total distance traveled:**
  - ∫(a to b) |v(t)| dt = ∫(a to b) √((f'(t))² + (g'(t))²) dt.
- **Polar slope:** dy/dx in polar coordinates uses chain rule:
  - x = r·cos(θ), y = r·sin(θ), where r is a function of θ.
  - dx/dθ = (dr/dθ)·cos(θ) - r·sin(θ).
  - dy/dθ = (dr/dθ)·sin(θ) + r·cos(θ).
  - dy/dx = (dy/dθ)/(dx/dθ).
- **Tangent line to polar curve.** Use polar slope formula above.
- **Area inside one curve, outside another:**
  - Find intersection points (set R(θ) = r(θ)).
  - A = (1/2) · ∫(α to β) (R² - r²) dθ on appropriate interval.

### Adds for [5]

- **Why parametric curves matter.** Parametric equations describe motion (position as function of time), curves that aren't functions in Cartesian sense (circles, ellipses, complex paths), and 3D curves.
- **Why polar coordinates are useful.** Some shapes (rose curves, spirals, cardioids) are MUCH simpler in polar than Cartesian. Symmetry and radial structure are natural.
- **The connection between parametric and polar.** Polar coordinates can be viewed as a particular parametric form: x = r·cos(θ), y = r·sin(θ), with θ as parameter and r as a function of θ.
- **Vector approaches generalize.** 3D motion is just adding a z-component. Calculus rules extend naturally.
- **Graphing polar curves.** Plot points (r, θ) by going OUT from origin a distance r, in the direction θ. For r < 0, go in the opposite direction.

## Worked Examples

### Example 1 [3] — Parametric slope

Find dy/dx for x = t² and y = t³ - 3t.

- **Step 1.** dx/dt = 2t. dy/dt = 3t² - 3.
- **Step 2.** dy/dx = (dy/dt)/(dx/dt) = (3t² - 3)/(2t).

### Example 2 [3] — Parametric arc length

Find arc length of curve given by x = cos(t), y = sin(t) for 0 ≤ t ≤ π.

- **Step 1.** dx/dt = -sin(t). dy/dt = cos(t).
- **Step 2.** (dx/dt)² + (dy/dt)² = sin²(t) + cos²(t) = 1.
- **Step 3.** L = ∫(0 to π) √1 dt = π.
- **Verification:** this curve is a semicircle of radius 1; semicircle length = π. ✓

### Example 3 [4] — Polar area

Find area inside r = 2·cos(θ).

- **Step 1.** This is a circle. To enclose the entire curve, integrate over [0, π] (cosine repeats from π to 2π, would double-count).
- **Step 2.** A = (1/2) · ∫(0 to π) (2·cos(θ))² dθ = (1/2) · ∫(0 to π) 4·cos²(θ) dθ = 2 · ∫(0 to π) cos²(θ) dθ.
- **Step 3.** Use identity cos²(θ) = (1 + cos(2θ))/2: A = 2 · ∫(0 to π) (1 + cos(2θ))/2 dθ = ∫(0 to π) (1 + cos(2θ)) dθ.
- **Step 4.** = (θ + sin(2θ)/2) from 0 to π = π - 0 = π.
- **Result:** area = π. (This makes sense: r = 2·cos(θ) is a circle of radius 1.)

### Example 4 [4] — Vector-valued function motion

A particle's position is r(t) = ⟨2t² - 5, 3t + 1⟩ for 0 ≤ t ≤ 2.

(a) Find velocity vector at t = 1.
(b) Find speed at t = 1.
(c) Find total distance traveled.

- **(a)** v(t) = r'(t) = ⟨4t, 3⟩. v(1) = ⟨4, 3⟩.
- **(b)** Speed = |v(1)| = √(4² + 3²) = √(16 + 9) = 5.
- **(c)** Total distance = ∫(0 to 2) |v(t)| dt = ∫(0 to 2) √((4t)² + 3²) dt = ∫(0 to 2) √(16t² + 9) dt.
  - Use substitution u = 4t, du = 4dt → dt = du/4. When t = 0, u = 0; when t = 2, u = 8.
  - = (1/4) · ∫(0 to 8) √(u² + 9) du = ... (requires more advanced integration techniques).

### Example 5 [4][5] — Polar area between curves

Find area of region inside r = 1 + cos(θ) and outside r = 1.

- **Step 1.** Find intersection: 1 + cos(θ) = 1 → cos(θ) = 0 → θ = π/2 or 3π/2.
- **Step 2.** Between θ = -π/2 and θ = π/2, the larger curve is 1 + cos(θ) (cos is positive here).
- **Step 3.** A = (1/2) · ∫(-π/2 to π/2) [(1 + cos(θ))² - 1²] dθ.
- **Step 4.** Expand and integrate (uses cos² identity).

## Top Traps & Common Errors

1. **Wrong slope formula for parametric.** dy/dx = (dy/dt)/(dx/dt).
2. **Forgetting parametric arc length formula.** L = ∫√((dx/dt)² + (dy/dt)²) dt.
3. **Missing 1/2 in polar area.** A = (1/2) · ∫r² dθ.
4. **Wrong integration limits in polar area.** Must trace the curve once.
5. **Confusing polar and Cartesian conversion.** x = r·cos(θ), y = r·sin(θ).
6. **Missing absolute value in distance.** Distance = ∫|v(t)| dt.
7. **Polar curve drawing errors.** Sketch test points; understand cosine vs sine differences.
8. **Wrong formula for area between polar curves.** (1/2) · ∫(R² - r²) dθ.
9. **Treating polar coordinates as 2D Cartesian.** Different system; need conversion.
10. **Missing polar second derivative chain rule.** d²y/dx² requires another chain rule application.

## Rubric-Aware Tactics

**For parametric problems:**
- Use formulas: dy/dx = (dy/dt)/(dx/dt), L = ∫√((dx/dt)² + (dy/dt)²) dt.
- For motion: v(t) = r'(t), |v(t)| is speed.

**For polar problems:**
- Convert to Cartesian for visualization if needed.
- Area = (1/2) · ∫r² dθ (single) or (1/2) · ∫(R² - r²) dθ (between).
- Find intersections; integrate over correct interval.

**For vector-valued functions:**
- Treat each component separately for differentiation.
- |v| = √((dx/dt)² + (dy/dt)²).

## "Phrases That Score" — verbatim language for FRQs

1. "For parametric curves x(t) and y(t), the slope dy/dx = (dy/dt)/(dx/dt), where dx/dt ≠ 0."
2. "The arc length of a parametric curve from t = a to t = b is L = ∫(a to b) √((dx/dt)² + (dy/dt)²) dt."
3. "For polar curves, the area enclosed is A = (1/2) · ∫(α to β) r² dθ. The factor 1/2 comes from the area formula for a circular sector."
4. "For motion described by vector-valued function r(t), the speed at time t is |v(t)| = √((dx/dt)² + (dy/dt)²). Total distance traveled equals ∫(a to b) |v(t)| dt."
5. "Polar coordinates use (r, θ) instead of Cartesian (x, y). Conversion: x = r·cos(θ), y = r·sin(θ); r = √(x² + y²) and θ = arctan(y/x)."
6. "The area between two polar curves (outer R(θ), inner r(θ)) is A = (1/2) · ∫(α to β) (R² - r²) dθ. The integration limits are determined by where the curves intersect."

## If You Do Nothing Else for This Unit

*Master parametric slope formula (dy/dx = (dy/dt)/(dx/dt)) and parametric arc length. Master polar area formula (1/2)·∫r² dθ. Master vector-valued functions for motion. These are BC-only topics that appear annually as FRQs.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus BC CED 2024-25, Princeton Review AP Calculus BC 2025, Khan Academy AP Calculus BC, Stewart Calculus 8e
_difficulty: intermediate
_relatedUnits: ap-calculus-bc-unit-3-composite-implicit-inverse, ap-calculus-bc-unit-8-applications-integration, ap-calculus-bc-unit-10-sequences-series
