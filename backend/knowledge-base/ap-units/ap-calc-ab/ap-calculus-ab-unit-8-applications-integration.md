# AP Calculus AB — Unit 8: Applications of Integration — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 10–15% of the AP Calculus AB exam
- **AB vs BC distinction:** AB Unit 8 is a SUBSET of BC Unit 8. AB does NOT cover: arc length (BC only). AB covers most volume of revolution and area between curves.
- **Sub-topics covered (AB):** average value of function; position/velocity/acceleration with integrals; area between curves; volumes with cross-sections; volumes of revolution (disc and washer methods); accumulation in applied contexts.

## Big Ideas

1. **Definite integrals compute accumulated quantities.** Area, volume, distance.
2. **Area between curves = ∫(a to b) [top - bottom] dx (or [right - left] dy).**
3. **Volume of revolution uses disc and washer methods.**
4. **Volume with cross sections = ∫(a to b) A(x) dx.**
5. **Average value: (1/(b-a))·∫(a to b) f(x)dx.**

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Average value of f on [a, b]:** (1/(b-a))·∫(a to b) f(x)dx.
- **Position from velocity:** s(t) = ∫v(t) dt + C, with constant from initial condition.
- **Total displacement:** ∫(a to b) v(t) dt = s(b) - s(a).
- **Total distance:** ∫(a to b) |v(t)| dt.
- **Area between two curves (vertical strips):**
  - If f(x) ≥ g(x) on [a, b], area = ∫(a to b) [f(x) - g(x)] dx.
  - "TOP MINUS BOTTOM."
- **Area between two curves (horizontal strips):**
  - If f(y) ≥ g(y) on [c, d], area = ∫(c to d) [f(y) - g(y)] dy.
- **Volume with known cross-sections:**
  - V = ∫(a to b) A(x) dx, where A(x) is cross-section area at x.
  - Common shapes: squares, rectangles, triangles, semicircles.
- **Disc method (volume of revolution, no hole):**
  - Revolve f(x) around x-axis on [a, b]: V = π·∫(a to b) [f(x)]² dx.
- **Washer method (volume of revolution, with hole):**
  - Revolve area between f(x) (outer) and g(x) (inner): V = π·∫(a to b) ([f(x)]² - [g(x)]²) dx.

### Adds for [4]

- **Total displacement vs total distance:**
  - Displacement = s(b) - s(a) = ∫v(t)dt.
  - Distance = ∫|v(t)|dt. Different when v changes sign.
- **Average value example:** average value of x² on [0, 3] = (1/3)·9 = 3.
- **Volume of revolution worked example:**
  - Revolve y = √x on [0, 4] around x-axis.
  - V = π·∫(0 to 4) x dx = π·8 = 8π.
- **Washer method example:**
  - Revolve region between y = x and y = x² (between x = 0 and x = 1) around x-axis.
  - V = π·∫(0 to 1) (x² - x⁴) dx = 2π/15.

### Adds for [5]

- **Geometric basis of disc and washer methods.** Slicing solid into thin disks (or washers); each ≈ π·r²·thickness.
- **Choosing dx vs dy.** Depends on geometry; integrate appropriate variable.

## Worked Examples

### Example 1 [3] — Average value

Average value of f(x) = sin(x) on [0, π] = (1/π)·∫(0 to π) sin(x) dx = (1/π)·2 = 2/π.

### Example 2 [3] — Area between curves

Find area between y = x² and y = x.
- Intersections: x² = x → x = 0, 1.
- Top is x on [0, 1].
- Area = ∫(0 to 1) (x - x²) dx = 1/2 - 1/3 = 1/6.

### Example 3 [3] — Disc method

Volume of solid formed by revolving y = √x on [0, 4] around x-axis.
- V = π·∫(0 to 4) x dx = π·8 = 8π.

### Example 4 [4] — Washer method

Region between y = x and y = x² on [0, 1] revolved around x-axis.
- V = π·∫(0 to 1) (x² - x⁴) dx = π·(1/3 - 1/5) = 2π/15.

### Example 5 [4] — Cross-sections

Region between y = x² and y = 2x has volume formed by squares perpendicular to x-axis. Side length = (2x - x²).
- V = ∫(0 to 2) (2x - x²)² dx.

## Top Traps & Common Errors

1. **Forgetting average value formula.** (1/(b-a))·∫f(x)dx.
2. **Wrong direction in area between curves.** TOP minus BOTTOM.
3. **Wrong setup for volume.** Disc when no hole. Washer with outer and inner radii.
4. **Forgetting π in volume formulas.**
5. **Squaring radii correctly.** Outer² minus inner², not (outer - inner)².
6. **Confusing displacement and distance.** Distance involves |v(t)|.

## Rubric-Aware Tactics

**For volume problems:** visualize solid; identify cross-sections; set up appropriate integral; include π for revolutions.

**For area between curves:** find intersections; identify top/bottom; set up integral.

**For motion:** displacement vs distance.

## "Phrases That Score" — verbatim language for FRQs

1. "Average value of f on [a, b] is (1/(b-a))·∫(a to b) f(x)dx — the constant value with same total accumulation."
2. "Area between curves f(x) and g(x) (with f ≥ g) on [a, b] = ∫(a to b) [f(x) - g(x)] dx (TOP minus BOTTOM)."
3. "Volume of revolution by disc method: V = π·∫(a to b) [f(x)]² dx."
4. "Volume of revolution by washer method: V = π·∫(a to b) ([f(x)]² - [g(x)]²) dx, where f outer and g inner."
5. "Total distance traveled = ∫(a to b) |v(t)| dt; total displacement = ∫(a to b) v(t) dt."

## If You Do Nothing Else for This Unit

*Master volume of revolution (disc and washer methods). Master area between curves. Note: AB does NOT cover arc length — that's BC only.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus AB CED 2024-25, Princeton Review AP Calculus AB 2025, Khan Academy AP Calculus AB, Stewart Calculus 8e
_difficulty: foundational
_relatedUnits: ap-calculus-ab-unit-6-integration-accumulation, ap-calculus-ab-unit-7-differential-equations, ap-calculus-bc-unit-8-applications-integration
