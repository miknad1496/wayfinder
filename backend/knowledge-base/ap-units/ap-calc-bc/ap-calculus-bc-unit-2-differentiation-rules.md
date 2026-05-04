# AP Calculus BC — Unit 2: Differentiation: Definition and Fundamental Properties — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 4–7% of the AP Calculus BC exam
- **Sub-topics covered:**
  - 2.1 Defining Average and Instantaneous Rates of Change at a Point
  - 2.2 Defining the Derivative of a Function and Using Derivative Notation
  - 2.3 Estimating Derivatives of a Function at a Point
  - 2.4 Connecting Differentiability and Continuity
  - 2.5 Applying the Power Rule
  - 2.6 Derivative Rules: Constant, Sum, Difference, and Constant Multiple
  - 2.7 Derivatives of cos(x), sin(x), e^x, and ln(x)
  - 2.8 The Product Rule
  - 2.9 The Quotient Rule
  - 2.10 Finding the Derivatives of Tangent, Cotangent, Secant, and Cosecant Functions
- **Where this unit appears on the exam:** Unit 2 establishes the basic differentiation toolkit. The derivative rules (power, product, quotient, basic transcendentals) are essential for all later differentiation. Definition of derivative as a limit is tested frequently. Differentiability vs continuity (the asymmetric relationship) is a perennial conceptual question.

## Big Ideas

1. **The derivative measures the instantaneous rate of change.** It's the slope of the tangent line at a point.
2. **The derivative is defined as a limit.** f'(a) = lim(h→0) [f(a+h) - f(a)]/h. This limit definition is what makes derivatives precise.
3. **Differentiable implies continuous, but NOT vice versa.** A function must be smooth to be differentiable; corners and cusps preserve continuity but lose differentiability.
4. **Derivative rules let us compute derivatives without using the limit definition each time.** Power rule, product rule, quotient rule, derivatives of standard functions all derive from the limit definition.
5. **The derivative has multiple notations.** f'(x), df/dx, d/dx [f(x)], y'. Each emphasizes different aspects (function, rate of change, operator, dependent variable).

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Average rate of change** of f over [a, b]: (f(b) - f(a)) / (b - a). Slope of secant line.
- **Instantaneous rate of change** at x = a: f'(a) = lim(h→0) [f(a+h) - f(a)]/h. Slope of TANGENT line at a.
- **Definition of the derivative (limit form):**
  - **Standard form:** f'(x) = lim(h→0) [f(x+h) - f(x)]/h.
  - **Alternative form:** f'(a) = lim(x→a) [f(x) - f(a)]/(x - a).
- **Derivative notation:**
  - f'(x) — Lagrange notation.
  - df/dx — Leibniz notation.
  - d/dx [f(x)] — operator notation.
  - y' — when y = f(x).
- **Differentiability and continuity:**
  - **Differentiable → Continuous** (a function that has a derivative at a point must be continuous there).
  - **Continuous does NOT imply differentiable** (corners, cusps, vertical tangents are continuous but not differentiable).
- **When a function is NOT differentiable:**
  - **Discontinuity** (limit doesn't exist).
  - **Corner** (sharp turn — left and right derivatives differ).
  - **Cusp** (sharp point with vertical tangent).
  - **Vertical tangent** (slope is infinite).
- **Power Rule:** d/dx (x^n) = n·x^(n-1).
  - **Examples:** d/dx (x²) = 2x. d/dx (x³) = 3x². d/dx (1/x) = d/dx (x⁻¹) = -x⁻².
- **Sum/Difference Rule:** d/dx [f(x) ± g(x)] = f'(x) ± g'(x).
- **Constant Multiple Rule:** d/dx [c · f(x)] = c · f'(x).
- **Constant Rule:** d/dx (c) = 0 (derivative of any constant is 0).
- **Derivatives of trig functions:**
  - d/dx (sin x) = cos x.
  - d/dx (cos x) = -sin x.
  - d/dx (tan x) = sec² x.
  - d/dx (cot x) = -csc² x.
  - d/dx (sec x) = sec x · tan x.
  - d/dx (csc x) = -csc x · cot x.
- **Derivatives of exponential and logarithmic functions:**
  - d/dx (e^x) = e^x.
  - d/dx (ln x) = 1/x.
  - d/dx (a^x) = a^x · ln(a).
  - d/dx (log_a x) = 1/(x · ln a).
- **Product Rule:** d/dx [f(x) · g(x)] = f'(x) · g(x) + f(x) · g'(x).
  - "First times derivative of second + Derivative of first times second."
- **Quotient Rule:** d/dx [f(x)/g(x)] = [f'(x) · g(x) - f(x) · g'(x)] / [g(x)]².
  - "Low D-high minus High D-low, all over Low squared."
  - "(Low)(D-High) - (High)(D-Low) over (Low)²"
  - Easier mnemonic: "lo-d-hi minus hi-d-lo over lo squared."

### Adds for [4]

- **Derivative as slope of tangent.** Visual: secant line connecting two points → as the points approach each other, the secant approaches the TANGENT. Slope of tangent = derivative at that point.
- **Tangent line equation at point (a, f(a)):**
  - y - f(a) = f'(a) · (x - a).
  - This is a key equation for many problems.
- **Derivative as a function.** f'(x) is itself a function. We can find f'(x), then evaluate at specific values.
- **Higher-order derivatives:**
  - **First derivative:** f'(x).
  - **Second derivative:** f''(x) (derivative of f').
  - **Third derivative:** f'''(x), and so on.
  - **Notation:** f''(x), d²f/dx², or y''.
  - Second derivative measures rate of change of rate of change (concavity, acceleration).
- **Power Rule extended.** Power Rule works for ALL real numbers n (not just positive integers):
  - d/dx (x^(1/2)) = (1/2)·x^(-1/2) = 1/(2√x).
  - d/dx (x^(-2)) = -2·x^(-3) = -2/x³.
  - d/dx (x^π) = π·x^(π-1).
- **Combining rules.** Real problems often require multiple rules:
  - d/dx (x²·sin(x)): use Product Rule. = 2x·sin(x) + x²·cos(x).
  - d/dx (sin(x)/x): use Quotient Rule. = [cos(x)·x - sin(x)·1]/x² = (x·cos(x) - sin(x))/x².
- **Derivatives of inverse trig functions** (often deferred to Unit 3):
  - d/dx (arcsin x) = 1/√(1-x²).
  - d/dx (arccos x) = -1/√(1-x²).
  - d/dx (arctan x) = 1/(1+x²).
- **Why the limit definition matters even with rules.** While we use the rules in practice, the limit definition:
  - Underlies the rules (each rule is proven from the limit definition).
  - Helps with problems involving exotic functions.
  - Is occasionally tested directly.
  - Connects to the deeper meaning of derivative.
- **Chain Rule preview** (covered in Unit 3): d/dx [f(g(x))] = f'(g(x)) · g'(x).

### Adds for [5]

- **Why differentiability implies continuity.** If f'(a) = lim(h→0) [f(a+h) - f(a)]/h exists, then [f(a+h) - f(a)] must approach 0 as h approaches 0. This means f(a+h) approaches f(a) — which is the definition of continuity. The converse is not true (continuous functions can have corners).
- **The geometric meaning of differentiability.** A function is differentiable at a point if you can draw a tangent line there — a line that touches but doesn't cross the curve. At corners, no single tangent line exists (left and right tangents differ). At cusps, the tangent is vertical (undefined slope).
- **Why the Quotient Rule is asymmetric.** Notice the order matters: it's f'·g - f·g', not f·g' - f'·g. The asymmetry comes from differentiating 1/g (which gives -g'/g²) and then applying the Product Rule.
- **The Product Rule's mnemonic visualization.** d(uv)/dx = u'v + uv'. Think of it as: "the product of two functions changes because EITHER the first function changes (u'v) OR the second function changes (uv'). Both contribute."
- **Why d/dx (e^x) = e^x is special.** e^x is the unique function (up to a constant multiplier) whose derivative equals itself. This is what makes e the "natural" base for exponential and logarithmic functions in calculus.
- **The derivative of tan(x) = sec²(x) explained.** d/dx (sin/cos) = (cos·cos - sin·(-sin))/cos² = (cos² + sin²)/cos² = 1/cos² = sec². Uses Quotient Rule and the trig identity cos² + sin² = 1.
- **Why the limit definition appears as an FRQ topic.** Students often must:
  - Identify the derivative being defined (recognize the limit form).
  - Use the limit definition for an unfamiliar function.
  - Apply the alternative form: f'(a) = lim(x→a) [f(x) - f(a)]/(x - a).
- **Tangent line approximation (linearization).** For x close to a, f(x) ≈ f(a) + f'(a)·(x-a). The tangent line provides a LINEAR APPROXIMATION of the function near a point. Important for Newton's method (Unit 4) and applications.

## Worked Examples

### Example 1 [3] — Definition of derivative

Use the limit definition to find f'(x) for f(x) = x².

- **Step 1.** f'(x) = lim(h→0) [f(x+h) - f(x)]/h = lim(h→0) [(x+h)² - x²]/h.
- **Step 2.** Expand: (x+h)² - x² = x² + 2xh + h² - x² = 2xh + h².
- **Step 3.** Substitute: f'(x) = lim(h→0) (2xh + h²)/h = lim(h→0) (2x + h).
- **Step 4.** As h → 0: f'(x) = 2x.
- **Verify with Power Rule:** d/dx (x²) = 2·x¹ = 2x. ✓

### Example 2 [3] — Combining derivative rules

Find f'(x) for:
(a) f(x) = 3x⁴ + 2x³ - 5x + 7
(b) f(x) = (2x + 1)(x² - 3)
(c) f(x) = x²/sin(x)

- **(a)** Apply rules term by term:
  - d/dx (3x⁴) = 3·4x³ = 12x³.
  - d/dx (2x³) = 6x².
  - d/dx (-5x) = -5.
  - d/dx (7) = 0.
  - Total: f'(x) = 12x³ + 6x² - 5.
- **(b)** Use Product Rule:
  - f' = (2x + 1)' · (x² - 3) + (2x + 1) · (x² - 3)'
  - f' = 2 · (x² - 3) + (2x + 1) · 2x
  - f' = 2x² - 6 + 4x² + 2x
  - f' = 6x² + 2x - 6.
- **(c)** Use Quotient Rule:
  - f' = [(x²)' · sin(x) - x² · (sin(x))'] / sin²(x)
  - f' = [2x · sin(x) - x² · cos(x)] / sin²(x).

### Example 3 [3] — Tangent line equation

Find the equation of the tangent line to f(x) = x³ at x = 2.

- **Step 1.** f(2) = 8.
- **Step 2.** f'(x) = 3x². f'(2) = 12.
- **Step 3.** Use point-slope form: y - 8 = 12·(x - 2) → y = 12x - 16.
- **Tangent line:** y = 12x - 16.

### Example 4 [4] — Differentiability vs continuity

Determine whether f(x) = |x| is differentiable at x = 0.

- **Step 1.** f is continuous at x = 0 (no break in graph).
- **Step 2.** Check derivative from both sides:
  - From right: f(x) = x, f'(x) = 1. So lim(h→0⁺) f'(0+h) = 1.
  - From left: f(x) = -x, f'(x) = -1. So lim(h→0⁻) f'(0+h) = -1.
- **Step 3.** Left and right derivatives differ. The derivative does NOT exist at x = 0.
- **Conclusion:** f(x) = |x| is CONTINUOUS at x = 0 but NOT DIFFERENTIABLE there. The graph has a CORNER.
- **Insight:** continuous doesn't imply differentiable. Differentiability requires smoothness (no corners, cusps, vertical tangents).

### Example 5 [4] — Derivative of trig function

Use the Quotient Rule to find d/dx [tan(x)] starting from tan(x) = sin(x)/cos(x).

- **Step 1.** Quotient Rule: d/dx [sin/cos] = [cos·cos - sin·(-sin)] / cos² = [cos² + sin²] / cos².
- **Step 2.** Apply identity: cos² + sin² = 1.
- **Step 3.** d/dx [tan(x)] = 1/cos² = sec²(x).
- **Result:** d/dx (tan x) = sec²(x). ✓

## Top Traps & Common Errors

1. **Confusing average and instantaneous rate of change.** Average = slope of secant. Instantaneous = slope of tangent (derivative).
2. **Forgetting that derivative requires LIMIT definition.** f'(x) = lim(h→0) [f(x+h) - f(x)]/h.
3. **Misapplying Power Rule.** d/dx (x^n) = n·x^(n-1). Bring DOWN exponent, REDUCE by 1.
4. **Wrong sign in derivatives of trig functions.** d/dx (cos x) = -sin x. Easy to forget the negative.
5. **Forgetting Product/Quotient Rule.** Products and quotients of functions can't be differentiated by simply differentiating each piece.
6. **Wrong order in Quotient Rule.** [f' · g - f · g'] / g². The MINUS sign matters; order matters.
7. **Treating differentiability as same as continuity.** Differentiable IMPLIES continuous, but continuous does NOT imply differentiable.
8. **Forgetting derivatives of standard functions.** d/dx (e^x) = e^x, d/dx (ln x) = 1/x, etc.
9. **Confusing higher-order derivatives.** f' (1st), f'' (2nd), f''' (3rd). Each is the derivative of the previous.
10. **Misapplying derivative to expressions, not functions.** d/dx [x³] makes sense; d/dx [3] (constant) = 0.
11. **Incorrect simplification.** Don't simplify until you've correctly applied derivative rules.
12. **Confusing slope of secant with slope of tangent.** Average rate = secant. Instantaneous rate = tangent (derivative).
13. **Treating linear approximation as exact.** f(x) ≈ f(a) + f'(a)·(x-a) is approximation, valid only near a.
14. **Forgetting that 1/x can be written as x⁻¹ for Power Rule.** d/dx (1/x) = d/dx (x⁻¹) = -x⁻² = -1/x².
15. **Wrong derivative of constant.** d/dx (constant) = 0. d/dx (c·f(x)) = c·f'(x). Different things.

## Rubric-Aware Tactics

**For limit definition problems:**
- Set up the limit form correctly.
- Algebraically simplify to remove indeterminate form.
- Take limit as h → 0.

**For derivative computations:**
- Identify the structure (sum, product, quotient, composition).
- Apply the appropriate rule.
- Simplify if needed.

**For tangent line problems:**
- Find f(a) (point on curve).
- Find f'(a) (slope at that point).
- Use point-slope form: y - f(a) = f'(a)(x - a).

**For differentiability questions:**
- Check continuity first.
- Then check whether one-sided derivatives agree.
- Look for corners, cusps, vertical tangents.

**For higher-order derivatives:**
- Take first derivative, simplify.
- Take derivative of result.
- Continue as needed.

## "Phrases That Score" — verbatim language for FRQs

1. "The derivative f'(x) = lim(h→0) [f(x+h) - f(x)]/h represents the instantaneous rate of change of f at x — equivalently, the slope of the tangent line to the graph of f at the point (x, f(x))."
2. "f is differentiable at x = a if and only if the limit f'(a) = lim(h→0) [f(a+h) - f(a)]/h exists. Differentiability requires continuity but is more restrictive — corners, cusps, and vertical tangents preserve continuity but lose differentiability."
3. "The Power Rule: d/dx (x^n) = n·x^(n-1). For example, d/dx (x⁵) = 5x⁴."
4. "The Product Rule: d/dx [f(x)·g(x)] = f'(x)·g(x) + f(x)·g'(x). Each term reflects the change due to one function while holding the other fixed."
5. "The Quotient Rule: d/dx [f(x)/g(x)] = [f'(x)·g(x) - f(x)·g'(x)] / [g(x)]². The numerator is f'·g minus f·g'."
6. "The tangent line to f at x = a has equation y - f(a) = f'(a)(x - a). This linearization provides a good approximation of f for x values near a."
7. "Although f is continuous at x = a, it is not differentiable there because [reason: corner, cusp, vertical tangent]. The function is continuous (no break) but lacks the smoothness required for a derivative to exist."

## If You Do Nothing Else for This Unit

*Master the derivative rules — Power, Sum/Difference, Constant Multiple, Product, Quotient — and the derivatives of basic functions (polynomials, trig, exponentials, logarithms). Master the limit definition and the relationship between differentiability and continuity (differentiable ⟹ continuous, but not the reverse). These foundations support every later unit's differentiation work.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus BC CED 2024-25, Princeton Review AP Calculus BC 2025, Khan Academy AP Calculus BC, Stewart Calculus 8e, Larson Calculus 11e
_difficulty: foundational
_relatedUnits: ap-calculus-bc-unit-1-limits-continuity, ap-calculus-bc-unit-3-composite-implicit-inverse, ap-calculus-bc-unit-4-contextual-applications-differentiation
