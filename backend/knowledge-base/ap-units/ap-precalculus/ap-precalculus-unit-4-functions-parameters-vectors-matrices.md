# AP Precalculus — Unit 4: Functions Involving Parameters, Vectors, and Matrices — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** Not directly tested on the AP exam (Unit 4 is "exam-not-tested" content but is foundational for college calc/linear algebra)
- **Sub-topics covered:** parametric equations; vectors; matrices; linear transformations.
- **Where this unit appears on the exam:** Officially not tested on AP exam itself; serves as a bridge to college calc/linear algebra. Some teachers cover; some skip.

## Big Ideas

1. **Parametric equations** describe motion: x(t), y(t).
2. **Vectors** have magnitude and direction; can be added, scaled.
3. **Matrices** organize data; multiply to compose linear transformations.
4. **Linear transformations** map vectors to vectors via matrix multiplication.
5. **Foundation for college calculus, linear algebra, physics.**

## Tier-Tagged Content

### Foundational [3] — needed for any score (per teacher coverage)

- **Parametric equations:**
  - **(x(t), y(t))** — both coordinates as functions of parameter t.
  - **Eliminate parameter** to convert to Cartesian.
  - **Example:** x = t, y = t² → y = x² (parabola).
  - **Example:** x = cos t, y = sin t → x² + y² = 1 (circle).
- **Vectors:**
  - **Magnitude and direction.**
  - **Components:** v = (v_x, v_y) or v = v_x î + v_y ĵ.
  - **Magnitude:** |v| = √(v_x² + v_y²).
  - **Addition:** component-wise.
  - **Scalar multiplication:** k·v = (k·v_x, k·v_y).
  - **Dot product:** v·w = v_x w_x + v_y w_y = |v||w| cos θ.
  - **Unit vector:** v/|v|.
- **Matrices:**
  - **Rectangular array of numbers.**
  - **Dimensions:** m × n (m rows, n columns).
  - **Addition:** element-wise.
  - **Scalar multiplication:** scale every element.
  - **Matrix multiplication:** AB has (i,j) entry = sum of A_i? × B_?j (dot of i-th row with j-th column).
  - **A·B requires** A's columns = B's rows.
- **Identity matrix:** I, with 1's on diagonal, 0's elsewhere.
- **Linear transformations:**
  - **T(v) = Av** for matrix A.
  - **Examples:** rotation, scaling, reflection.
- **Determinant of 2×2 matrix:**
  - **det = ad − bc** for matrix [[a,b],[c,d]].
  - **Determinant 0:** matrix singular (no inverse).

### Adds for [4]

- **Inverse matrix:** A^(−1) such that A·A^(−1) = I.
- **Solving systems via matrix inverse:** Ax = b → x = A^(−1)b.
- **Vector projections.**

### Adds for [5]

- **Why parametric:** describes paths where Cartesian fails (e.g., self-intersecting curves).
- **Why matrices:** compactly represent linear transformations and systems.

## Worked Examples

### Example 1 [3] — Parametric to Cartesian

x = 2t, y = t² + 1. Eliminate parameter.
- **t = x/2.**
- **y = (x/2)² + 1 = x²/4 + 1.**

### Example 2 [3] — Vector operations

v = (3, 4), w = (1, −1). Find v + w, |v|, v·w.
- **v + w = (4, 3).**
- **|v| = 5.**
- **v·w = 3·1 + 4·(−1) = −1.**

### Example 3 [4] — Matrix multiplication

A = [[1, 2], [3, 4]], B = [[5, 6], [7, 8]]. AB?
- **AB[0,0] = 1·5 + 2·7 = 19.**
- **AB[0,1] = 1·6 + 2·8 = 22.**
- **AB[1,0] = 3·5 + 4·7 = 43.**
- **AB[1,1] = 3·6 + 4·8 = 50.**
- **AB = [[19, 22], [43, 50]].**

### Example 4 [4] — Determinant

det of [[3, 1], [2, 4]]?
- **det = 3·4 − 1·2 = 12 − 2 = 10.**

### Example 5 [5] — Linear transformation

Rotation 90° counterclockwise: matrix [[0, −1], [1, 0]]. Apply to (1, 0).
- **[[0, −1], [1, 0]] · (1, 0)ᵀ = (0·1 + (−1)·0, 1·1 + 0·0) = (0, 1).** ✓ (rotated (1,0) becomes (0,1))

## Top Traps & Common Errors

1. **Matrix multiplication NOT commutative:** AB ≠ BA generally.
2. **Dimension constraints:** A_{m×n} · B_{n×p} = AB_{m×p}.
3. **Eliminating parameter:** be careful with domain restrictions.
4. **Vector magnitude vs component.**

## Rubric-Aware Tactics

(Note: Unit 4 is not officially exam-tested.)

For practice problems: identify operation; apply systematically.

## "Phrases That Score" — verbatim language for FRQs

1. "Parametric equations express position via a parameter t: x(t), y(t). Eliminating the parameter (e.g., solving x = f(t) for t and substituting into y = g(t)) yields a Cartesian relation between x and y."
2. "Vectors have magnitude and direction. Addition is component-wise; the dot product v·w = v_x w_x + v_y w_y = |v||w| cos θ measures alignment."
3. "Matrix multiplication composes linear transformations. The product AB requires A's column count equal to B's row count; the resulting (i,j) entry is the dot product of A's i-th row with B's j-th column."
4. "The determinant of a 2×2 matrix [[a,b],[c,d]] is ad − bc. Zero determinant means the matrix is singular (no inverse) and the columns are linearly dependent."
5. "Linear transformations map vectors via matrix multiplication T(v) = Av. Common examples: rotation by angle θ uses [[cos θ, −sin θ], [sin θ, cos θ]]; scaling by k uses [[k, 0], [0, k]]."

## If You Do Nothing Else for This Unit

*If covered: master parametric-Cartesian conversion, vector operations, matrix multiplication and determinant, linear transformations. Note: Unit 4 not directly tested on AP exam but is foundation for college math/physics.*

_lastUpdated: 2026-05-04
_sources: College Board AP Precalculus CED 2024-25, Princeton Review AP Precalculus 2025
_difficulty: intermediate
_relatedUnits: ap-precalculus-unit-3-trigonometric-polar-functions
