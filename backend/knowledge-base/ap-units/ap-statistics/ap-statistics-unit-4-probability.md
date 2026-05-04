# AP Statistics — Unit 4: Probability, Random Variables, and Probability Distributions — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 10–20% of the AP Statistics exam
- **Sub-topics covered:**
  - 4.1 Introducing Statistics: Random and Non-Random Patterns?
  - 4.2 Estimating Probabilities Using Simulation
  - 4.3 Introduction to Probability
  - 4.4 Mutually Exclusive Events
  - 4.5 Conditional Probability
  - 4.6 Independent Events and Unions of Events
  - 4.7 Introduction to Random Variables and Probability Distributions
  - 4.8 Mean and Standard Deviation of Random Variables
  - 4.9 Combining Random Variables
  - 4.10 Introduction to the Binomial Distribution
  - 4.11 Parameters for a Binomial Distribution
  - 4.12 The Geometric Distribution
- **Where this unit appears on the exam:** Probability calculations (conditional, joint, complement) appear in nearly every MCQ section. Binomial and geometric distributions are perennial FRQs. The expected value calculation for game/decision contexts is a frequent FRQ. The distinction between independent and mutually exclusive — the most-violated probability concept — appears constantly. Combining random variables (sums, differences) with the rule that VARIANCES ADD (for independent variables) is a critical tool that recurs in Units 5–9.

## Big Ideas

1. **Probability quantifies long-run behavior of random processes.** It's the proportion of times an event occurs in many repetitions, NOT a guarantee about any single trial.
2. **Conditional probability is the foundation of inference.** P(A|B) — the probability of A given B — captures how knowing one event changes the probability of another. Bayes' theorem and many statistical methods are conditional probability in disguise.
3. **Independent events are not the same as mutually exclusive events.** Mutually exclusive: can't both happen (P(A and B) = 0). Independent: knowing one doesn't change the other (P(A|B) = P(A)). They are DIFFERENT — and in fact, mutually exclusive events with positive probabilities are NEVER independent.
4. **Random variables (numerical outcomes of random processes) have means and standard deviations that follow specific rules.** Means add (always). Variances add (only for independent variables). Standard deviations do NOT add directly.
5. **Binomial and geometric distributions describe specific repeated-trial scenarios.** Binomial: fixed number of trials, count successes. Geometric: trials until first success.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Probability basics:**
  - **0 ≤ P(A) ≤ 1** for any event A.
  - **P(sample space) = 1** (something must happen).
  - **P(impossible) = 0**.
  - **Complement rule:** P(A^c) = 1 − P(A). The probability of NOT A is 1 minus the probability of A.
  - **Long-run interpretation:** in many repetitions, the proportion of A approaches P(A).
- **Sample space (S):** the set of all possible outcomes.
- **Event:** a subset of the sample space.
- **Mutually exclusive (disjoint) events:** A and B cannot both occur. P(A AND B) = 0.
- **Addition Rule** (general): P(A OR B) = P(A) + P(B) − P(A AND B).
- **Addition Rule** (mutually exclusive): P(A OR B) = P(A) + P(B). [The intersection is 0.]
- **Multiplication Rule** (general): P(A AND B) = P(A) × P(B|A).
- **Multiplication Rule** (independent): P(A AND B) = P(A) × P(B). [Because P(B|A) = P(B).]
- **Conditional probability:** P(A|B) = P(A AND B) / P(B). The probability of A given B has occurred.
- **Independent events:** A and B are independent if knowing one doesn't change the other:
  - P(A|B) = P(A), or equivalently
  - P(A AND B) = P(A) × P(B).
- **Random variable (RV):** a numerical outcome of a random process. Two types:
  - **Discrete RV:** takes finite or countable values (number of heads in 10 coin tosses).
  - **Continuous RV:** takes any value in an interval (height of a randomly chosen person).
- **Discrete probability distribution:** a table or formula giving each possible value and its probability.
- **Mean (Expected Value) of a discrete RV:**
  - μ_X = E(X) = Σ(x · P(x)).
  - Long-run average value over many repetitions.
- **Variance of a discrete RV:**
  - σ²_X = Σ((x − μ)² · P(x)).
- **Standard deviation:** σ_X = √σ²_X.
- **Combining random variables:**
  - **Mean of sum/difference:** μ_(X+Y) = μ_X + μ_Y; μ_(X−Y) = μ_X − μ_Y. ALWAYS true.
  - **Variance of sum/difference (independent):** σ²_(X+Y) = σ²_X + σ²_Y; σ²_(X−Y) = σ²_X + σ²_Y. NOTE: variance adds for BOTH addition and subtraction!
  - **Standard deviation of sum/difference (independent):** σ_(X±Y) = √(σ²_X + σ²_Y). Standard deviations do NOT add directly.
- **Linear transformation of RV:**
  - **Mean:** μ_(aX+b) = a · μ_X + b.
  - **Standard deviation:** σ_(aX+b) = |a| · σ_X. (Adding a constant does NOT change SD.)
- **Binomial distribution:**
  - **B**INS conditions:
    - **B**inary: each trial has two outcomes (success/failure).
    - **I**ndependent: trials are independent.
    - **N**umber of trials fixed at n.
    - **S**uccess probability p constant across trials.
  - X = number of successes in n trials.
  - Possible values: 0, 1, 2, ..., n.
  - **P(X = k)** = C(n,k) · p^k · (1−p)^(n−k), where C(n,k) = "n choose k" = n! / (k!(n−k)!).
  - **Mean:** μ = np.
  - **Standard deviation:** σ = √(np(1−p)).
- **Geometric distribution:**
  - Same B and I from BINS, but trials continue until the FIRST success.
  - X = number of trials until first success.
  - Possible values: 1, 2, 3, ...
  - **P(X = k)** = (1−p)^(k−1) · p.
  - **Mean:** μ = 1/p.
  - **Standard deviation:** σ = √((1−p)/p²).

### Adds for [4]

- **Why mutually exclusive ≠ independent.** If A and B are mutually exclusive (P(A AND B) = 0) AND both have positive probability, then knowing A occurred TELLS you B did NOT occur. So they're highly DEPENDENT, not independent. Common error: assuming "they don't overlap" means "they're independent" — opposite is true.
- **Conditional probability and independence:**
  - If P(A|B) = P(A), then A and B are independent.
  - If P(A|B) ≠ P(A), then A and B are dependent.
  - This is the practical test for independence.
- **Bayes' Theorem (basic):**
  - P(A|B) = P(B|A) · P(A) / P(B).
  - Often used in tree diagrams or two-way tables to find a "reverse" conditional probability.
- **Tree diagrams:** powerful tool for sequential probability problems. Probability of any path = product along the branches.
- **Two-way tables for joint probabilities:** find joint, conditional, and marginal probabilities directly from frequencies.
- **Variance adds for INDEPENDENT random variables.** Critical: variance adds even for the DIFFERENCE of independent variables. σ²_(X−Y) = σ²_X + σ²_Y, NOT σ²_X − σ²_Y.
- **Why variance adds for sum and difference but standard deviation doesn't.** Variance is in squared units; sums of independent random variances behave linearly. Standard deviation, the square root, requires the Pythagorean-style combination: σ_(X+Y) = √(σ²_X + σ²_Y).
- **Linear combinations** for non-unit coefficients:
  - **Mean:** E(aX + bY) = a·E(X) + b·E(Y).
  - **Variance** (independent): Var(aX + bY) = a²·Var(X) + b²·Var(Y).
- **When binomial conditions might fail:**
  - **B (Binary):** if there are more than two outcomes per trial → not binomial.
  - **I (Independence):** sampling without replacement from a small population violates independence. The 10% condition: if sample is less than 10% of population, treat as approximately independent.
  - **N (Number fixed):** if you keep trying until success → it's geometric, not binomial.
  - **S (Success probability constant):** if p changes → not binomial.
- **Calculating binomial probabilities on calculator:**
  - **binompdf(n, p, k)** = P(X = k).
  - **binomcdf(n, p, k)** = P(X ≤ k).
  - **P(X ≥ k)** = 1 − binomcdf(n, p, k−1).
- **Calculating geometric probabilities:**
  - **geometpdf(p, k)** = P(X = k) (probability first success on trial k).
  - **geometcdf(p, k)** = P(X ≤ k) (probability first success by trial k).
- **Normal approximation to binomial:** when n is large and both np ≥ 10 AND n(1−p) ≥ 10, the binomial distribution is approximately Normal with mean np and SD √(np(1−p)).
- **Expected value in decision contexts:** when deciding among options with random outcomes, compute the expected value of each and compare. Highest expected value is the "best" decision in long-run sense.

### Adds for [5]

- **Why expected value is "long-run average" not "most likely outcome."** A lottery ticket with expected value −$0.50 means that, ON AVERAGE, you lose $0.50 per ticket. Any individual ticket might win millions or lose its full price. Expected value describes long-run behavior, not single-trial prediction.
- **The "10% condition" intuition.** When sampling WITHOUT replacement from a finite population, each observation slightly affects the next. If your sample is less than 10% of the population, the dependence is small enough to treat as approximately independent. This is why surveying 100 people from a city of 1,000,000 can be treated as independent trials.
- **Why we use simulations.** Many real-world probability problems are too complex for analytical solutions. Simulation (running random trials and counting outcomes) approximates the true probability. AP often asks students to design a simulation: "use random digits to estimate P(...)."
- **Geometric mean = 1/p intuition.** If success probability is 0.2, you'd expect the first success on the 5th trial on average (since 1/0.2 = 5). If p = 0.5, expect first success on 2nd trial. Inversely related — the rarer the success, the longer the wait.
- **Binomial vs Hypergeometric.** Hypergeometric distribution applies when sampling WITHOUT replacement from a small population. AP doesn't formally test hypergeometric, but the 10% condition is what allows treating without-replacement sampling as binomial.
- **Why the binomial PMF formula has C(n,k).** C(n,k) counts the number of WAYS to choose which k of the n trials are successes. The probability of any SPECIFIC sequence of k successes and (n−k) failures is p^k · (1−p)^(n−k). Multiplying by C(n,k) accounts for all the orderings.
- **Indicator variables and binomial.** Each binomial variable X = X₁ + X₂ + ... + X_n where X_i is 1 if trial i is a success, 0 otherwise. Each X_i has mean p and variance p(1−p). By independence: μ_X = np and σ²_X = np(1−p). This decomposition explains the binomial formulas.
- **Conditional probability revisited via tree diagrams.** Bayesian "reversal" — given a positive medical test, what's the probability of actually having the disease? — requires combining the test's accuracy with the disease's base rate. Counterintuitively, even very accurate tests can have low predictive value if the base rate is low.

## Worked Examples

### Example 1 [3] — Conditional probability with two-way table

A school surveyed students about pet ownership and grade level:

| | Cat | Dog | None | Total |
|--|-----|-----|------|-------|
| Freshman | 20 | 30 | 50 | 100 |
| Sophomore | 25 | 35 | 40 | 100 |
| Total | 45 | 65 | 90 | 200 |

(a) Find P(Dog).
(b) Find P(Dog | Sophomore).
(c) Are owning a dog and being a sophomore independent?

- **(a)** P(Dog) = 65/200 = 0.325.
- **(b)** P(Dog | Sophomore) = 35/100 = 0.35. (Among sophomores, 35% have a dog.)
- **(c)** P(Dog) = 0.325 ≠ P(Dog | Sophomore) = 0.35. So owning a dog and being a sophomore are NOT independent — being a sophomore slightly increases the probability of owning a dog.

### Example 2 [3] — Mean and SD of random variable

A spinner has sectors labeled 1, 2, 3, 4 with respective probabilities 0.4, 0.3, 0.2, 0.1. Find E(X) and SD(X).

- **Mean:** E(X) = 1(0.4) + 2(0.3) + 3(0.2) + 4(0.1) = 0.4 + 0.6 + 0.6 + 0.4 = 2.0.
- **Variance:** Var(X) = (1−2)²(0.4) + (2−2)²(0.3) + (3−2)²(0.2) + (4−2)²(0.1) = 0.4 + 0 + 0.2 + 0.4 = 1.0.
- **SD:** σ_X = √1.0 = 1.0.

### Example 3 [3][4] — Binomial probability

A test consists of 10 multiple-choice questions, each with 4 choices (probability of guessing correctly = 0.25). What is the probability of getting exactly 4 correct by guessing?

- **Step 1.** Check binomial conditions: BINS — Binary (right/wrong), Independent (questions don't affect each other), N = 10 fixed, p = 0.25 constant. ✓
- **Step 2.** P(X = 4) = C(10, 4) · (0.25)^4 · (0.75)^6 = 210 · 0.00391 · 0.178 = 0.146.
- **Step 3.** Or use calculator: binompdf(10, 0.25, 4) = 0.146.
- **Step 4.** Mean: μ = np = 10(0.25) = 2.5 (expected number correct by guessing).
- **Step 5.** SD: σ = √(np(1−p)) = √(10·0.25·0.75) = √1.875 ≈ 1.37.

### Example 4 [4] — Combining random variables

Suppose X has mean 50 and SD 10, and Y has mean 30 and SD 8. X and Y are independent. Find the mean and SD of (X − Y).

- **Mean of X − Y:** μ_(X−Y) = 50 − 30 = 20.
- **Variance of X − Y (independent):** σ²_(X−Y) = σ²_X + σ²_Y = 100 + 64 = 164. (Variance ADDS even for difference!)
- **SD of X − Y:** σ_(X−Y) = √164 ≈ 12.81.
- **Common error:** computing SD as |10 − 8| = 2 — WRONG. SDs don't subtract directly.

### Example 5 [4][5] — Geometric expected value

A basketball player makes free throws with probability 0.7. What is the expected number of attempts until her first miss?

- **Step 1.** Define event: a "success" is missing the free throw. p (miss) = 1 − 0.7 = 0.3.
- **Step 2.** Use geometric distribution. Mean = 1/p = 1/0.3 ≈ 3.33.
- **Step 3.** Interpretation: on average, she'll miss her 4th free throw (since 3.33 rounds to 4 attempts). More precisely, the expected number of attempts is 3.33.
- **Common error:** confusing "first success" with "until success" — be clear about what counts as a success in your context.

## Top Traps & Common Errors

1. **Confusing mutually exclusive with independent.** Mutually exclusive events (P(A∩B) = 0) are NOT independent (they're maximally dependent because knowing A happened tells you B didn't).
2. **Variance subtracts for independent X − Y.** WRONG. σ²_(X−Y) = σ²_X + σ²_Y. Variance ADDS for sum AND difference of independent variables.
3. **Adding standard deviations.** Don't do σ_X + σ_Y. Use √(σ²_X + σ²_Y).
4. **Forgetting to check binomial conditions (BINS).** Always verify all four before using binomial formulas.
5. **Confusing binomial and geometric.** Binomial: fixed n, count successes. Geometric: variable n, count until first success.
6. **Using P(X ≤ k) when P(X < k) is needed (or vice versa).** Discrete distribution: P(X ≤ 5) includes X = 5; P(X < 5) excludes it.
7. **Formula errors for E(X) of discrete RV.** E(X) = Σ x · P(x), not Σ P(x).
8. **Forgetting the complement rule.** P(at least one) = 1 − P(none). Often easier than direct calculation.
9. **Treating sequential dependent events as independent.** Drawing cards without replacement: probabilities CHANGE between draws.
10. **10% condition not applied.** When sampling without replacement, treat as independent ONLY if sample is less than 10% of population.
11. **Confusing complement with mutually exclusive.** Complement of A is "NOT A"; mutually exclusive with A is "any event B where A and B can't both occur."
12. **Using addition rule for non-mutually-exclusive events.** P(A or B) = P(A) + P(B) − P(A and B). Don't omit the subtraction.
13. **Confusing P(A|B) with P(B|A).** They're generally NOT equal. Conditional direction matters.
14. **Treating expected value as "what will happen."** EV is the long-run AVERAGE. Any single trial can deviate substantially.
15. **Forgetting linear transformation rules for SD.** SD(aX + b) = |a| · SD(X). Adding b doesn't change SD; multiplying by a scales SD by |a|.

## Rubric-Aware Tactics

**For probability calculations:**
- Identify whether events are mutually exclusive, independent, or neither.
- Use appropriate addition/multiplication rule.
- For conditional, distinguish P(A|B) from P(B|A).

**For random variable problems:**
- Identify possible values and probabilities.
- Compute mean using Σ x·P(x).
- Compute variance using Σ (x−μ)² · P(x).

**For combining variables:**
- Mean adds for sum/difference.
- Variance adds for sum/difference of INDEPENDENT variables.
- SD = √variance.

**For binomial:**
- Check BINS conditions explicitly.
- State n and p.
- Use formula or calculator (binompdf, binomcdf).
- Identify if cumulative or specific value is needed.

**For geometric:**
- Identify "first success" scenario.
- Use formula or calculator (geometpdf, geometcdf).
- Mean = 1/p.

**For decision problems:**
- Compute expected value of each option.
- Compare; recommend highest EV.
- Note that EV is long-run average, not single-trial prediction.

## "Phrases That Score" — verbatim language for FRQs

1. "P(A and B) = P(A) × P(B|A) = [calculation]. Because the events are [independent / dependent], [we can / cannot] use the simpler formula P(A) × P(B)."
2. "The conditional probability P(A | B) = P(A and B) / P(B) = [calculation]."
3. "Using the binomial distribution with n = [n] and p = [p], P(X = [k]) = C([n],[k]) · ([p])^[k] · ([1-p])^[n-k] = [value]. Or by calculator: binompdf([n], [p], [k]) = [value]."
4. "The expected value of X is E(X) = Σ x · P(x) = [calculation]. The standard deviation is σ_X = √(Σ (x − μ)² · P(x)) = [calculation]."
5. "Because X and Y are independent, the variance of X + Y equals the sum of their variances: σ²_(X+Y) = σ²_X + σ²_Y = [value]. The standard deviation is σ_(X+Y) = √(σ²_X + σ²_Y) = [value]."
6. "The conditions for a binomial distribution are met: each trial is binary (success/failure), trials are independent, the number of trials is fixed at n = [n], and the success probability is constant at p = [p]."
7. "The expected value of [option A] is [EV_A]; for [option B] it is [EV_B]. The recommended decision is [option with higher EV] because it produces a higher long-run average outcome."

## If You Do Nothing Else for This Unit

*Master four foundational concepts: (1) the distinction between mutually exclusive and independent events (these are NOT the same and are often opposite); (2) conditional probability P(A|B) = P(A AND B) / P(B); (3) variance adds for sum AND difference of independent variables, but standard deviations do NOT add directly; (4) BINS conditions for binomial. These four concepts underpin every probability calculation on the AP exam and are foundations for inference in Units 5–9.*

_lastUpdated: 2026-05-04
_sources: College Board AP Statistics CED 2024-25, Princeton Review AP Statistics 2025, Khan Academy AP Statistics, The Practice of Statistics 6e (Starnes & Tabor)
_difficulty: foundational
_relatedUnits: ap-statistics-unit-5-sampling-distributions, ap-statistics-unit-6-inference-proportions
