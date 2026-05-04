# AP Calculus BC — Unit 8: Applications of Integration — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 6–9% of the AP Calculus BC exam
- **Sub-topics covered:**
  - 8.1 Finding the Average Value of a Function on an Interval
  - 8.2 Connecting Position, Velocity, and Acceleration of Functions Using Integrals
  - 8.3 Using Accumulation Functions and Definite Integrals in Applied Contexts
  - 8.4 Finding the Area Between Curves Expressed as Functions of x
  - 8.5 Finding the Area Between Curves Expressed as Functions of y
  - 8.6 Finding the Area Between Curves That Intersect at More Than Two Points
  - 8.7 Volumes with Cross Sections: Squares and Rectangles
  - 8.8 Volumes with Cross Sections: Triangles and Semicircles
  - 8.9 Volume with Disc Method: Revolving Around the x- or y-Axis
  - 8.10 Volume with Disc Method: Revolving Around Other Axes
  - 8.11 Volume with Washer Method: Revolving Around the x- or y-Axis
  - 8.12 Volume with Washer Method: Revolving Around Other Axes
  - 8.13 The Arc Length of a Smooth, Planar Curve and Distance Traveled (BC only)
- **Where this unit appears on the exam:** Unit 8 contains the major area and volume applications of integration. Volume of revolution (disc and washer methods) is a perennial FRQ topic. Area between curves is essentially guaranteed. Arc length is BC-specific. Average value and accumulation in applied contexts are common.

## Big Ideas

1. **Definite integrals compute accumulated quantities.** Area, volume, distance, total accumulation — all are integrals.
2. **Area between two curves = ∫(a to b) [top - bottom] dx (or [right - left] dy).** Set up the integral with the higher curve minus the lower.
3. **Volume of revolution uses two main methods.** DISC (when no hole), WASHER (when hole around axis).
4. **Volume with cross sections = ∫(a to b) A(x) dx.** Integrate the area function across the interval.
5. **Arc length: L = ∫(a to b) √(1 + (dy/dx)²) dx.** BC-specific formula for the length of a curve.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Average value of a function on [a, b]:**
  - **Formula:** (1/(b-a)) · ∫(a to b) f(x) dx.
  - **Interpretation:** the constant value with the same total accumulation as f.
- **Position, velocity, acceleration with integrals:**
  - **Velocity:** v(t) = ∫a(t) dt + C, where a is acceleration.
  - **Position:** s(t) = ∫v(t) dt + C, where v is velocity.
  - **Constant of integration determined by initial conditions.**
- **Total displacement:** ∫(a to b) v(t) dt = s(b) - s(a). Net change in position.
- **Total distance:** ∫(a to b) |v(t)| dt. Different from displacement when velocity changes sign.
- **Area between two curves (vertical strips):**
  - If f(x) ≥ g(x) on [a, b], area = ∫(a to b) [f(x) - g(x)] dx.
  - "TOP MINUS BOTTOM."
- **Area between two curves (horizontal strips):**
  - If f(y) ≥ g(y) on [c, d], area = ∫(c to d) [f(y) - g(y)] dy.
  - Used when curves are easier to express as functions of y.
- **Area where curves intersect at multiple points:**
  - Find intersection points.
  - Set up integrals piece-by-piece (top function changes between sections).
- **Volume with known cross-sections:**
  - **Formula:** V = ∫(a to b) A(x) dx, where A(x) is cross-section area at x.
  - **Common shapes:**
    - **Squares:** A(x) = (side)².
    - **Rectangles:** A(x) = base · height.
    - **Triangles:** A(x) = (1/2) · base · height.
    - **Semicircles:** A(x) = (1/2) · π · r².
- **Disc method (volume of revolution, no hole):**
  - Revolve f(x) around x-axis on [a, b]: V = π · ∫(a to b) [f(x)]² dx.
  - Each disc has radius f(x) and area π·[f(x)]².
- **Washer method (volume of revolution, with hole):**
  - Revolve area between f(x) (outer) and g(x) (inner) around x-axis on [a, b]: V = π · ∫(a to b) ([f(x)]² - [g(x)]²) dx.
  - Each washer has outer radius f(x) and inner radius g(x); area = π·([f]² - [g]²).
- **Arc length** [BC only]:
  - Formula: L = ∫(a to b) √(1 + (dy/dx)²) dx.
  - Or: L = ∫(c to d) √(1 + (dx/dy)²) dy if expressing x as function of y.
  - **For parametric:** L = ∫(t_a to t_b) √((dx/dt)² + (dy/dt)²) dt.

### Adds for [4]

- **Average value worked example:**
  - Average value of f(x) = x² on [0, 3]: (1/3) · ∫(0 to 3) x² dx = (1/3) · (x³/3 from 0 to 3) = (1/3) · (9 - 0) = 3.
- **Position from velocity:**
  - If v(t) = 2t and s(0) = 5: s(t) = ∫2t dt + C = t² + C. With s(0) = 5: C = 5. So s(t) = t² + 5.
- **Total displacement vs total distance worked example:**
  - v(t) = t² - 4 on [0, 3]. Note v < 0 for t in (0, 2) and v > 0 for t in (2, 3).
  - **Displacement:** ∫(0 to 3) (t² - 4) dt = (t³/3 - 4t) from 0 to 3 = (9 - 12) - 0 = -3.
  - **Total distance:** ∫(0 to 3) |t² - 4| dt = ∫(0 to 2) -(t² - 4) dt + ∫(2 to 3) (t² - 4) dt = ... requires evaluating each piece.
- **Volume of revolution (disc method) worked example:**
  - Revolve y = √x on [0, 4] around x-axis.
  - V = π · ∫(0 to 4) (√x)² dx = π · ∫(0 to 4) x dx = π · (x²/2 from 0 to 4) = π · (8 - 0) = 8π.
- **Volume of revolution (washer method) worked example:**
  - Revolve region between y = x² and y = x (between intersections at x=0 and x=1) around x-axis.
  - **Outer:** x (since x ≥ x² on [0, 1]).
  - **Inner:** x².
  - V = π · ∫(0 to 1) (x² - (x²)²) dx = π · ∫(0 to 1) (x² - x⁴) dx.
  - = π · (x³/3 - x⁵/5) from 0 to 1 = π · (1/3 - 1/5) = π · 2/15 = 2π/15.
- **Volume with cross-sections (square cross-sections perpendicular to x-axis):**
  - If region's height at x is h(x), and cross-section is square with side h(x):
  - V = ∫(a to b) [h(x)]² dx.

### Adds for [5]

- **Why the disc and washer methods work geometrically.** Slicing the solid into thin disks (or washers if there's a hole) and summing their volumes (each ≈ π·r²·thickness) gives the integral as the limit. Each cross-section is a circle (or annulus) of known area.
- **Choosing between disc and washer:** disc when no hole around axis. Washer when there's a hole.
- **Choosing dx vs dy:** depends on the geometry. If the cross-section's area is naturally expressed in terms of x, integrate dx. If in terms of y, integrate dy.
- **Why arc length integral makes sense.** A small piece of curve has length ds = √(dx² + dy²). Dividing by dx and integrating: L = ∫√(1 + (dy/dx)²) dx. The integrand is the "infinitesimal length" of curve; the integral sums these.
- **The "shell method" alternative.** Some textbooks use the shell method as an alternative to disc/washer. Both give correct results; AP allows either.
- **Average value as integral mean.** The average value of a function is the integral divided by the interval length. This is the analog of "average" for a continuous distribution — the constant function with the same total area under the curve.

## Worked Examples

### Example 1 [3] — Average value

Find the average value of f(x) = sin(x) on [0, π].

- **Step 1.** Average value = (1/π) · ∫(0 to π) sin(x) dx.
- **Step 2.** ∫sin(x) dx = -cos(x). Evaluate: -cos(π) - (-cos(0)) = -(-1) - (-1) = 2.
- **Step 3.** Average value = (1/π) · 2 = 2/π ≈ 0.637.

### Example 2 [3] — Area between curves

Find the area between y = x² and y = x.

- **Step 1.** Find intersections: x² = x → x(x-1) = 0 → x = 0, x = 1.
- **Step 2.** Determine which is "top" on [0, 1]. At x = 0.5: y = x = 0.5; y = x² = 0.25. So x is on top.
- **Step 3.** Area = ∫(0 to 1) (x - x²) dx = (x²/2 - x³/3) from 0 to 1 = (1/2 - 1/3) - 0 = 1/6.

### Example 3 [3][4] — Disc method

Find volume of solid formed by revolving y = √x on [0, 4] around x-axis.

- **Step 1.** Each disc has radius f(x) = √x, area = π·(√x)² = πx.
- **Step 2.** V = ∫(0 to 4) πx dx = π · (x²/2 from 0 to 4) = π · 8 = 8π.

### Example 4 [4] — Washer method

Find volume of solid formed by revolving region between y = x and y = x² (on [0, 1]) around x-axis.

- **Step 1.** Outer radius: x. Inner radius: x².
- **Step 2.** Each washer area: π · (x² - (x²)²) = π · (x² - x⁴).
- **Step 3.** V = π · ∫(0 to 1) (x² - x⁴) dx = π · (x³/3 - x⁵/5) from 0 to 1 = π · (1/3 - 1/5) = π · 2/15 = 2π/15.

### Example 5 [4] — Arc length (BC only)

Find arc length of y = x^(3/2) on [0, 4].

- **Step 1.** dy/dx = (3/2) · x^(1/2).
- **Step 2.** (dy/dx)² = (9/4) · x.
- **Step 3.** 1 + (dy/dx)² = 1 + (9/4)x.
- **Step 4.** L = ∫(0 to 4) √(1 + (9x)/4) dx.
- **Step 5.** Substitute u = 1 + (9x)/4, du = (9/4) dx → dx = (4/9) du.
- When x = 0: u = 1. When x = 4: u = 10.
- **Step 6.** L = (4/9) · ∫(1 to 10) √u du = (4/9) · (2u^(3/2)/3 from 1 to 10) = (8/27) · (10^(3/2) - 1) = (8/27)(10√10 - 1) ≈ 9.07.

## Top Traps & Common Errors

1. **Forgetting average value formula.** (1/(b-a)) · ∫f(x)dx.
2. **Wrong direction in area between curves.** TOP minus BOTTOM (or right minus left for horizontal strips).
3. **Wrong setup for volume.** Disc method when no hole. Washer method with outer and inner radii.
4. **Forgetting π in volume formulas.** All volumes of revolution involve π.
5. **Squaring radii correctly.** Outer radius squared minus inner radius squared, NOT (outer - inner)².
6. **Confusing displacement and distance.** Displacement = ∫v(t)dt. Distance = ∫|v(t)|dt.
7. **Forgetting to identify intersection points.** Area between curves requires knowing where they intersect.
8. **Wrong cross-section formula.** Square: side². Triangle: (1/2)·base·height. Semicircle: (1/2)·π·r².
9. **Misapplying arc length formula.** L = ∫√(1 + (dy/dx)²) dx. Don't forget the +1.
10. **Choosing disc when washer is needed.** Visualize the solid; check for holes.

## Rubric-Aware Tactics

**For volume problems:**
- Visualize the solid.
- Identify cross-sections (discs, washers, or known shapes).
- Set up integral with appropriate area function.
- Include π for revolutions.

**For area between curves:**
- Find intersection points.
- Identify top/bottom (or right/left).
- Set up integral as upper minus lower.
- May need multiple integrals for multiple intersections.

**For arc length (BC):**
- Use formula L = ∫√(1 + (dy/dx)²) dx.

## "Phrases That Score" — verbatim language for FRQs

1. "The average value of f on [a, b] is (1/(b-a))·∫(a to b) f(x)dx — the constant value that produces the same total accumulation."
2. "The area between curves f(x) and g(x) (with f ≥ g) on [a, b] is ∫(a to b) [f(x) - g(x)] dx (TOP minus BOTTOM)."
3. "Volume of solid of revolution by disc method: V = π·∫(a to b) [f(x)]² dx. Each disc has radius f(x) and area π·[f(x)]²."
4. "Volume of solid of revolution by washer method: V = π·∫(a to b) ([f(x)]² - [g(x)]²) dx, where f(x) is outer radius and g(x) is inner radius."
5. "Arc length of a smooth curve: L = ∫(a to b) √(1 + (dy/dx)²) dx. Each infinitesimal piece of curve has length √(dx² + dy²)."
6. "Total distance traveled by a particle is ∫(a to b) |v(t)| dt; total displacement is ∫(a to b) v(t) dt. They differ when velocity changes sign."
7. "Volume with known cross-sections: V = ∫(a to b) A(x) dx, where A(x) is the area of the cross-section at x."

## If You Do Nothing Else for This Unit

*Master volume of revolution (disc and washer methods). Master area between curves. Memorize arc length formula. Apply formulas with proper setup. Practice many problems to recognize the right method quickly.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus BC CED 2024-25, Princeton Review AP Calculus BC 2025, Khan Academy AP Calculus BC, Stewart Calculus 8e
_difficulty: foundational
_relatedUnits: ap-calculus-bc-unit-6-integration-accumulation, ap-calculus-bc-unit-9-parametric-polar-vector
