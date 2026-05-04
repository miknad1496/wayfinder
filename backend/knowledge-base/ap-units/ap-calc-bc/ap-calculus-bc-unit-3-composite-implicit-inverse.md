# AP Calculus BC — Unit 3: Differentiation: Composite, Implicit, and Inverse Functions — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 4–7% of the AP Calculus BC exam
- **Sub-topics covered:**
  - 3.1 The Chain Rule
  - 3.2 Implicit Differentiation
  - 3.3 Differentiating Inverse Functions
  - 3.4 Differentiating Inverse Trigonometric Functions
  - 3.5 Selecting Procedures for Calculating Derivatives
  - 3.6 Calculating Higher-Order Derivatives
- **Where this unit appears on the exam:** Unit 3 extends differentiation to harder cases. The CHAIN RULE is THE most-used derivative rule on the exam — appears in essentially every multi-rule problem. Implicit differentiation is perennial. Higher-order derivatives connect to Unit 5's analytical applications.

## Big Ideas

1. **The Chain Rule handles composition of functions.** d/dx [f(g(x))] = f'(g(x)) · g'(x). "Outer derivative times inner derivative."
2. **Implicit differentiation lets us find dy/dx when y is not explicitly solved for.** Treat y as a function of x; differentiate both sides; remember dy/dx wherever y appears.
3. **The derivative of an inverse function relates to the original function.** If y = f⁻¹(x), then dy/dx = 1 / f'(y) = 1 / f'(f⁻¹(x)).
4. **Inverse trig functions have specific derivative formulas.** d/dx (arcsin x) = 1/√(1-x²), d/dx (arctan x) = 1/(1+x²). Memorize these.
5. **Higher-order derivatives are derivatives of derivatives.** Often used in physics (acceleration is second derivative of position) and concavity analysis (Unit 5).

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **The Chain Rule:** d/dx [f(g(x))] = f'(g(x)) · g'(x).
  - "Outer derivative TIMES inner derivative."
  - Or: dy/dx = (dy/du) · (du/dx), where u = g(x), y = f(u).
- **Examples of Chain Rule:**
  - d/dx [(x² + 3)⁵] = 5(x² + 3)⁴ · (2x).
  - d/dx [sin(3x²)] = cos(3x²) · 6x.
  - d/dx [e^(x²)] = e^(x²) · 2x.
  - d/dx [ln(2x + 5)] = 1/(2x + 5) · 2 = 2/(2x + 5).
- **General Chain Rule structure:** when you have a "function inside a function":
  - Identify the OUTER function and INNER function.
  - Differentiate the OUTER function (treating inner as a "variable").
  - MULTIPLY by the derivative of the INNER function.
- **Chain Rule with multiple compositions:**
  - d/dx [f(g(h(x)))] = f'(g(h(x))) · g'(h(x)) · h'(x).
  - Apply Chain Rule repeatedly from outside to inside.
- **Implicit differentiation:**
  - Used when y is defined implicitly by an equation, not solved explicitly for y.
  - **Procedure:**
    1. Take d/dx of BOTH SIDES.
    2. Whenever you encounter y, write dy/dx after differentiating (Chain Rule).
    3. Solve for dy/dx.
- **Examples of implicit differentiation:**
  - Implicit equation: x² + y² = 25 (circle).
  - d/dx (x² + y²) = d/dx (25).
  - 2x + 2y · (dy/dx) = 0.
  - Solve: dy/dx = -x/y.
- **Inverse functions:**
  - **Definition:** if f(g(x)) = x for all x in domain of g, then f and g are inverse functions.
  - **Notation:** f⁻¹(x).
  - **Example:** if f(x) = x³, then f⁻¹(x) = x^(1/3).
- **Derivative of inverse function:**
  - **Formula:** if f and f⁻¹ are inverse functions and a = f(b), then (f⁻¹)'(a) = 1/f'(b).
  - **Equivalent form:** if y = f⁻¹(x), then dy/dx = 1/f'(y).
- **Derivatives of inverse trig functions:**
  - d/dx (arcsin x) = 1/√(1-x²), valid for -1 < x < 1.
  - d/dx (arccos x) = -1/√(1-x²), valid for -1 < x < 1.
  - d/dx (arctan x) = 1/(1+x²), valid for all x.
  - d/dx (arccot x) = -1/(1+x²).
  - d/dx (arcsec x) = 1/(|x|·√(x²-1)), valid for |x| > 1.
  - d/dx (arccsc x) = -1/(|x|·√(x²-1)), valid for |x| > 1.
- **Higher-order derivatives:**
  - **First derivative:** f'(x) — slope of tangent.
  - **Second derivative:** f''(x) = d/dx [f'(x)] — concavity, acceleration.
  - **Third derivative:** f'''(x), and so on.
  - **Notation:** f^(n)(x) for nth derivative.

### Adds for [4]

- **Why Chain Rule works.** If u = g(x) and y = f(u), then dy/dx = dy/du · du/dx by the limit definition. This intuitive (and geometric) explanation is captured in Leibniz notation.
- **Chain Rule applied to multiple variables:**
  - d/dx [f(g(h(x)))] = f'(g(h(x))) · g'(h(x)) · h'(x).
  - Each "level" of composition adds another factor.
- **Implicit differentiation worked example:**
  - x² + xy + y² = 7. Find dy/dx.
  - Differentiate both sides:
    - d/dx (x²) = 2x.
    - d/dx (xy) by Product Rule = y + x·(dy/dx).
    - d/dx (y²) = 2y·(dy/dx) (using Chain Rule).
    - d/dx (7) = 0.
  - Combine: 2x + y + x·(dy/dx) + 2y·(dy/dx) = 0.
  - Solve for dy/dx: (dy/dx)(x + 2y) = -2x - y → dy/dx = -(2x + y)/(x + 2y).
- **Why we need implicit differentiation.** Some equations are difficult or impossible to solve explicitly for y as a function of x. Examples: x² + y² = 25 has TWO functions (upper and lower semicircles). Implicit differentiation handles both at once.
- **Logarithmic differentiation:** technique for differentiating expressions like x^x:
  - y = x^x.
  - Take ln of both sides: ln y = x · ln x.
  - Differentiate: (1/y)(dy/dx) = ln x + x · (1/x) = ln x + 1.
  - Solve: dy/dx = y · (ln x + 1) = x^x · (ln x + 1).
- **Derivative of inverse via formula.** If we know f⁻¹(a) = b (so f(b) = a), then (f⁻¹)'(a) = 1/f'(b).
- **Higher-order derivative applications:**
  - **Position s(t):** velocity v(t) = s'(t); acceleration a(t) = v'(t) = s''(t).
  - **Concavity:** f''(x) > 0 means concave up; f''(x) < 0 means concave down.
  - **Inflection points:** where concavity changes (f'' changes sign).

### Adds for [5]

- **Why Chain Rule is "the most-used rule."** Most non-trivial derivatives involve composition. Whenever you have a function INSIDE another function (anything raised to a power, anything inside trig functions, anything inside logs/exponentials), Chain Rule applies.
- **The "outside-inside" mental model.** Identify what's "outside" (the wrapping function) and "inside" (the wrapped function). Differentiate outside, leave inside alone. MULTIPLY by derivative of inside. This pattern handles all Chain Rule problems.
- **Common Chain Rule mistakes:**
  - Forgetting to multiply by derivative of inner function.
  - Differentiating wrong "level" of the composition.
  - Confusing variable names (e.g., letting g(x) and g'(x) blur together).
- **Implicit differentiation as a tool for related rates.** When two quantities are related (e.g., the radius and surface area of a sphere), differentiating the relationship implicitly yields equations connecting their rates. This is the foundation of related rates problems (Unit 4).
- **Why inverse trig derivatives have square roots.** d/dx (arcsin x) = 1/√(1-x²) comes from implicit differentiation:
  - y = arcsin x → sin y = x.
  - Differentiate: cos y · (dy/dx) = 1.
  - dy/dx = 1/cos y = 1/√(1-sin²y) = 1/√(1-x²).
  - The Pythagorean identity (sin²y + cos²y = 1) produces the square root.
- **L'Hôpital's Rule (preview):** for indeterminate forms 0/0 or ∞/∞:
  - lim(x→a) f(x)/g(x) = lim(x→a) f'(x)/g'(x), under certain conditions.
  - Useful when direct computation gives indeterminate forms.
  - Often used in Unit 4 for limits of Riemann sums or rates of change.
- **The hierarchy of differentiation rules.** Most expressions involve combinations:
  - Polynomials: Power Rule + Sum/Difference + Constant Multiple.
  - Products: Product Rule.
  - Quotients: Quotient Rule.
  - Compositions: Chain Rule.
  - Combinations: combine rules systematically.

## Worked Examples

### Example 1 [3] — Chain Rule basic

Find d/dx [(3x + 1)⁴].

- **Step 1.** Identify outside function: (something)⁴. Inside function: 3x + 1.
- **Step 2.** Differentiate outside: 4·(something)³. Don't change the inside.
- **Step 3.** Multiply by derivative of inside: d/dx (3x + 1) = 3.
- **Step 4.** Combine: d/dx [(3x + 1)⁴] = 4(3x + 1)³ · 3 = 12(3x + 1)³.

### Example 2 [3] — Chain Rule with trig

Find d/dx [sin(x²)].

- **Step 1.** Outside: sin(something). Inside: x².
- **Step 2.** Differentiate outside: cos(something).
- **Step 3.** Multiply by derivative of inside: d/dx (x²) = 2x.
- **Step 4.** Combine: cos(x²) · 2x = 2x · cos(x²).

### Example 3 [4] — Multiple Chain Rule applications

Find d/dx [√(sin(2x))].

- **Step 1.** This is √u where u = sin(2x).
- **Step 2.** Outermost: √u → derivative is 1/(2√u).
- **Step 3.** Middle: sin(2x) → derivative is cos(2x) · 2.
- **Step 4.** Combine: d/dx [√(sin(2x))] = [1/(2√(sin(2x)))] · cos(2x) · 2 = cos(2x)/√(sin(2x)).

### Example 4 [3][4] — Implicit differentiation

Find dy/dx for x² + y³ = 5.

- **Step 1.** Differentiate both sides:
  - d/dx (x²) = 2x.
  - d/dx (y³) = 3y² · (dy/dx) (using Chain Rule for y).
  - d/dx (5) = 0.
- **Step 2.** Equation: 2x + 3y² · (dy/dx) = 0.
- **Step 3.** Solve: 3y² · (dy/dx) = -2x → dy/dx = -2x/(3y²).

### Example 5 [4] — Inverse function derivative

If f(x) = x³ + 2x and f(2) = 12, find (f⁻¹)'(12).

- **Step 1.** We need (f⁻¹)'(12) = 1/f'(b) where b = f⁻¹(12) = 2.
- **Step 2.** Find f'(x): f'(x) = 3x² + 2.
- **Step 3.** Evaluate f'(2): f'(2) = 3(4) + 2 = 14.
- **Step 4.** (f⁻¹)'(12) = 1/14.

## Top Traps & Common Errors

1. **Forgetting to apply Chain Rule.** Whenever you have a function "inside" another function, Chain Rule applies. Don't differentiate just the outer.
2. **Wrong identification of outer/inner.** For (x² + 1)³, outer is x³, inner is x² + 1. Don't confuse.
3. **Forgetting Chain Rule in implicit differentiation.** When differentiating y², get 2y · (dy/dx) — the dy/dx is essential.
4. **Wrong sign on inverse trig derivatives.** d/dx (arcsin x) = +1/√(1-x²); d/dx (arccos x) = -1/√(1-x²).
5. **Forgetting domain restrictions.** Inverse trig formulas have specific domains where they apply.
6. **Mixing up Chain Rule and Product Rule.** Chain Rule for compositions. Product Rule for products.
7. **Incomplete Chain Rule for nested compositions.** d/dx [f(g(h(x)))] requires three factors: f'(g(h(x))) · g'(h(x)) · h'(x).
8. **Forgetting that implicit differentiation requires Chain Rule for y terms.** d/dx (y²) = 2y · (dy/dx), NOT just 2y.
9. **Solving for dy/dx incorrectly in implicit differentiation.** After differentiating, isolate dy/dx terms on one side, factor, divide.
10. **Wrong inverse function relationship.** (f⁻¹)'(a) = 1/f'(b) where b = f⁻¹(a).
11. **Confusing higher-order notations.** f''(x) is the second derivative. Don't write f²(x) for the second derivative — that means f composed with itself.
12. **Treating composition like multiplication.** sin(2x) is sin(2x), not 2·sin(x).
13. **Forgetting that constants in inner function still contribute.** d/dx [sin(2x)] = cos(2x) · 2, NOT just cos(2x).
14. **Misapplying logarithmic differentiation.** Take ln of both sides FIRST, then differentiate. The point is to simplify before differentiating.
15. **Not simplifying after applying chain rule.** While not always required, simplification often clarifies and helps catch errors.

## Rubric-Aware Tactics

**For Chain Rule problems:**
- Identify outer and inner functions.
- Differentiate outer first.
- Multiply by derivative of inner.
- For nested compositions, apply Chain Rule at each level.

**For implicit differentiation:**
- Take d/dx of BOTH SIDES.
- Use Chain Rule when differentiating y terms.
- Isolate dy/dx algebraically.

**For inverse function derivatives:**
- Use the formula (f⁻¹)'(a) = 1/f'(b) where b = f⁻¹(a).
- Or use implicit differentiation directly.

**For inverse trig derivatives:**
- Memorize the formulas.
- Note domain restrictions.

**For higher-order derivatives:**
- Take derivative iteratively.
- Simplify between steps.

## "Phrases That Score" — verbatim language for FRQs

1. "By the Chain Rule, d/dx [f(g(x))] = f'(g(x)) · g'(x). Identify the outer and inner functions, differentiate the outer (treating inner as a single quantity), and multiply by the derivative of the inner."
2. "Using implicit differentiation: take d/dx of both sides, applying the Chain Rule whenever differentiating an expression involving y. The dy/dx terms can then be isolated to solve for dy/dx."
3. "The derivative of the inverse function: if f and f⁻¹ are inverses with f(b) = a, then (f⁻¹)'(a) = 1/f'(b). The slopes of inverse functions at corresponding points are RECIPROCALS."
4. "d/dx (arcsin x) = 1/√(1-x²), valid for -1 < x < 1. The inverse sine function's derivative reflects the constraint that sine values lie between -1 and 1."
5. "Higher-order derivatives are derivatives of derivatives. The second derivative f''(x) measures the rate of change of the rate of change — physically, acceleration is the second derivative of position; geometrically, f''(x) determines concavity."
6. "When differentiating y² with respect to x using implicit differentiation, the result is 2y · (dy/dx), reflecting the Chain Rule applied to y treated as a function of x."
7. "For y = f(g(h(x))), apply the Chain Rule three times: dy/dx = f'(g(h(x))) · g'(h(x)) · h'(x). Each composition adds a factor."

## If You Do Nothing Else for This Unit

*Master the CHAIN RULE — d/dx [f(g(x))] = f'(g(x)) · g'(x) — because it appears in nearly every non-trivial derivative on the AP exam. Master implicit differentiation, especially treating y as a function of x and using Chain Rule on y terms. Memorize the inverse trig derivative formulas (especially arcsin and arctan). The Chain Rule is the "most-used rule" — getting it right is essential for the entire course.*

_lastUpdated: 2026-05-04
_sources: College Board AP Calculus BC CED 2024-25, Princeton Review AP Calculus BC 2025, Khan Academy AP Calculus BC, Stewart Calculus 8e, Larson Calculus 11e
_difficulty: foundational
_relatedUnits: ap-calculus-bc-unit-2-differentiation-rules, ap-calculus-bc-unit-4-contextual-applications-differentiation, ap-calculus-bc-unit-5-analytical-applications-differentiation
