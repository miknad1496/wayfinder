# AP Precalculus — Unit 2: Exponential and Logarithmic Functions — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** ~27–40% of the AP Precalculus exam
- **Sub-topics covered:** exponential functions; logarithmic functions; properties of logs; solving exponential and logarithmic equations; modeling with exponentials and logs; semi-log plots.
- **Where this unit appears on the exam:** Exponential growth/decay modeling. Solving log/exp equations. Properties of logs. Inverses.

## Big Ideas

1. **Exponentials:** f(x) = a·bˣ; multiplicative growth/decay.
2. **Logs:** inverse of exponentials; log_b(x) answers "b to what power is x?"
3. **Properties of logs:** log(ab) = log a + log b; log(aⁿ) = n log a; change of base.
4. **Solving:** isolate exponential or log; apply inverse.
5. **Modeling:** continuous compound interest (Aeʳᵗ); half-life decay.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Exponential function:** f(x) = a·bˣ.
  - **Base b > 1:** growth.
  - **0 < b < 1:** decay.
  - **a:** initial value f(0).
- **Continuous growth:** f(t) = a·eʳᵗ.
  - **r > 0:** growth.
  - **r < 0:** decay.
  - **e ≈ 2.718.**
- **Logarithm:** log_b(x) = y ⟺ bʸ = x.
  - **Common log:** log = log₁₀.
  - **Natural log:** ln = log_e.
- **Domain of log:** x > 0.
- **Range:** all reals.
- **Inverse relationship:** b^(log_b x) = x; log_b(bˣ) = x.
- **Properties of logs:**
  - **log(ab) = log a + log b.**
  - **log(a/b) = log a − log b.**
  - **log(aⁿ) = n log a.**
  - **Change of base:** log_b(x) = log(x)/log(b) = ln(x)/ln(b).
- **Solving exponential equations:**
  - Take log of both sides.
  - Solve for variable.
- **Solving log equations:**
  - Combine logs into one.
  - Exponentiate (apply b^).
  - Check for extraneous solutions (log domain).
- **Half-life:** time for quantity to halve.
  - **N(t) = N₀(½)^(t/T_½).**
  - **Or:** N(t) = N₀ e^(−kt) with T_½ = ln 2 / k.
- **Continuous compounding:** A = Pe^(rt).
- **Compound interest (n times/year):** A = P(1 + r/n)^(nt).

### Adds for [4]

- **Why ln important:** derivative of ln x is 1/x; e arises naturally in growth.
- **Semi-log plot:** plot log(y) vs x; exponentials become straight lines.
- **Log-log plot:** plot log(y) vs log(x); power functions become straight lines.

### Adds for [5]

- **Why exponential models so common:**
  - Growth/decay rate proportional to current amount → dy/dt = ky → y = y₀ e^(kt).
  - Population, radioactive decay, cooling, interest, viral spread.

## Worked Examples

### Example 1 [3] — Solve exponential

3·2^x = 96.
- **2^x = 32.**
- **x = 5.**

### Example 2 [3] — Solve log

log₂(x − 1) = 3.
- **x − 1 = 2³ = 8.**
- **x = 9.**

### Example 3 [4] — Properties of logs

Simplify: log(x²) − log(x) + log(5).
- **= 2 log x − log x + log 5.**
- **= log x + log 5 = log(5x).**

### Example 4 [4] — Half-life

Substance has 1000 atoms; half-life 8 years. Atoms after 24 years?
- **t/T_½ = 24/8 = 3.**
- **N = 1000·(½)³ = 125 atoms.**

### Example 5 [5] — Continuous compounding

$1000 invested at 5% continuous compounding for 10 years. Value?
- **A = Pe^(rt) = 1000·e^(0.5) ≈ 1000·1.6487 = $1648.72.**

## Top Traps & Common Errors

1. **Log domain:** x > 0; can't take log of negative or zero.
2. **Confusing log and ln** (different bases).
3. **log(a + b) ≠ log a + log b.** Only PRODUCTS factor.
4. **Extraneous solutions** in log equations: check.
5. **Wrong inverse application** in solving.

## Rubric-Aware Tactics

**For exponential equations:** take log, solve for x.
**For log equations:** combine logs, exponentiate, check domain.
**For modeling:** identify if continuous (e^rt) or periodic compounding.

## "Phrases That Score" — verbatim language for FRQs

1. "Exponential functions f(x) = a·bˣ model multiplicative change. With b > 1, growth; 0 < b < 1, decay. Continuous growth: f(t) = a·eʳᵗ."
2. "Logarithm log_b(x) = y ⟺ bʸ = x. Logs and exponentials are inverse functions. Natural log (ln) uses base e ≈ 2.718."
3. "Properties of logs: log(ab) = log a + log b; log(a/b) = log a − log b; log(aⁿ) = n log a; change of base log_b(x) = log(x)/log(b)."
4. "Half-life T_½ relates to decay constant k by T_½ = ln 2 / k. Quantity at time t: N(t) = N₀(½)^(t/T_½) = N₀ e^(−kt)."
5. "Continuous compound interest: A = Pe^(rt). Periodic compounding (n per year): A = P(1 + r/n)^(nt). For n → ∞, both converge."

## If You Do Nothing Else for This Unit

*Master exponential and log function definitions. Master log properties. Master solving exp/log equations. Master continuous growth (e^rt). Master half-life formulas.*

_lastUpdated: 2026-05-04
_sources: College Board AP Precalculus CED 2024-25, Princeton Review AP Precalculus 2025, Khan Academy
_difficulty: foundational
_relatedUnits: ap-precalculus-unit-1-polynomial-rational-functions, ap-precalculus-unit-3-trigonometric-polar-functions
