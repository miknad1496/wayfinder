# AP Statistics — Unit 5: Sampling Distributions — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 7–12% of the AP Statistics exam
- **Sub-topics covered:**
  - 5.1 Introducing Statistics: Why Is My Sample Different from Yours?
  - 5.2 The Normal Distribution, Revisited
  - 5.3 The Central Limit Theorem
  - 5.4 Biased and Unbiased Point Estimates
  - 5.5 Sampling Distributions for Sample Proportions
  - 5.6 Sampling Distributions for Differences in Sample Proportions
  - 5.7 Sampling Distributions for Sample Means
  - 5.8 Sampling Distributions for Differences in Sample Means
- **Where this unit appears on the exam:** Unit 5 is the conceptual bridge to inference (Units 6–9). Sampling distribution shape, mean, and standard deviation appear in nearly every MCQ section. The Central Limit Theorem (CLT) is the most-tested theoretical concept in the entire course. The "three distributions distinction" — population vs sample data vs sampling distribution — is the brain file's named signature for AP Stats and the most powerful diagnostic concept in inference. Mastering the sampling distribution formulas (means and SDs of x̄ and p̂) is essential for Units 6–9.

## Big Ideas

1. **The three distributions distinction is THE central concept of AP Statistics.**
   - **Population distribution:** the true distribution of all individuals in the population.
   - **Sample data distribution:** the distribution of data in ONE specific sample.
   - **Sampling distribution:** the theoretical distribution of a SAMPLE STATISTIC (like x̄ or p̂) computed from many possible samples of the same size.
   - Confusing these three is the most common source of conceptual errors on the AP exam.
2. **The Central Limit Theorem (CLT) makes inference possible.** For sample means, regardless of the population's shape, the sampling distribution of x̄ is approximately Normal when n is large enough (typically n ≥ 30). This is what allows us to use Normal-based methods even when populations aren't Normal.
3. **Sample statistics have predictable variability.** The standard deviation of a sample statistic (called the "standard error") tells us how much sample-to-sample variation we expect. This variability is reduced by larger sample sizes (specifically by √n).
4. **Unbiased estimators have sampling distributions centered at the parameter.** x̄ is an unbiased estimator of μ; p̂ is an unbiased estimator of p. Their sampling distributions are centered exactly at μ and p, respectively.
5. **Sampling distributions for differences (p̂₁ − p̂₂ or x̄₁ − x̄₂) follow specific rules.** Means subtract; variances ADD (for independent samples). These formulas underpin two-sample inference in Units 6 and 7.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Sampling distribution definition:**
  - The distribution of a SAMPLE STATISTIC (like x̄ or p̂) over all possible random samples of the same size from the same population.
  - It's a theoretical distribution — we don't actually compute every possible sample.
  - Tells us how the statistic VARIES from sample to sample.
- **Standard error (SE):** the standard deviation of a sampling distribution. Quantifies sample-to-sample variability.
- **Sampling distribution of sample mean (x̄):**
  - **Mean:** μ_(x̄) = μ (population mean). x̄ is an UNBIASED estimator of μ.
  - **Standard deviation:** σ_(x̄) = σ/√n, where σ is the population SD and n is sample size.
  - **Shape:**
    - If the population is Normal, x̄ is Normal for any n.
    - If the population is not Normal, x̄ is approximately Normal IF n is large (CLT — typically n ≥ 30).
- **Sampling distribution of sample proportion (p̂):**
  - **Mean:** μ_(p̂) = p (population proportion). p̂ is an UNBIASED estimator of p.
  - **Standard deviation:** σ_(p̂) = √(p(1−p)/n).
  - **Shape:** approximately Normal if both np ≥ 10 AND n(1−p) ≥ 10 (the "Large Counts" condition).
- **Central Limit Theorem (CLT):**
  - For sample means: regardless of the population shape, the sampling distribution of x̄ is approximately Normal when n is large enough. Rule of thumb: n ≥ 30.
  - For Normal populations, x̄ is Normal for any n.
- **Sampling distribution for difference in sample proportions (p̂₁ − p̂₂):**
  - **Mean:** μ_(p̂₁−p̂₂) = p₁ − p₂.
  - **Standard deviation:** σ_(p̂₁−p̂₂) = √(p₁(1−p₁)/n₁ + p₂(1−p₂)/n₂).
  - **Shape:** approximately Normal if both samples meet the Large Counts condition.
- **Sampling distribution for difference in sample means (x̄₁ − x̄₂):**
  - **Mean:** μ_(x̄₁−x̄₂) = μ₁ − μ₂.
  - **Standard deviation:** σ_(x̄₁−x̄₂) = √(σ₁²/n₁ + σ₂²/n₂).
  - **Shape:** approximately Normal if both populations are Normal OR both samples are large (CLT).
- **Conditions for sampling distributions** (used throughout inference):
  - **Random:** the sample(s) must be random (or random assignment in experiments).
  - **10% (Independence):** when sampling without replacement, n ≤ 10% of population.
  - **Large Counts (for proportions):** np ≥ 10 AND n(1−p) ≥ 10.
  - **Normal/Large Sample (for means):** Population is Normal OR n ≥ 30 (CLT).

### Adds for [4]

- **Why σ_(x̄) = σ/√n.** As sample size grows, the average of n observations becomes LESS variable than individual observations because extreme values get balanced by typical ones. Mathematically: Var(x̄) = Var(X)/n. Taking square root: SD(x̄) = SD(X)/√n. This is the famous "1/√n" rate of improvement.
- **Why np ≥ 10 and n(1−p) ≥ 10 for binomial → Normal approximation.** For the binomial distribution to be approximately Normal, both tails must have enough observations (at least 10 expected successes AND at least 10 expected failures). When this holds, the binomial's discrete shape is well-approximated by the continuous Normal.
- **The CLT in pictures.** Imagine drawing repeated samples from a skewed (e.g., exponential) population. Plot the means. As sample size grows from n=2 to n=10 to n=30, the histogram of means looks more and more Normal, regardless of population shape. By n=30, it's almost always close enough to use Normal-based inference.
- **Sampling distribution differs from sample distribution AND population distribution:**
  - **Population:** what the variable looks like for everyone in the population.
  - **Sample:** what the variable looks like for the n people in YOUR sample.
  - **Sampling:** what the STATISTIC (like x̄) would look like across all possible samples of size n.
  - All three have shapes; they're typically different.
- **Unbiased estimators:** a statistic is unbiased if its sampling distribution is centered at the true parameter. x̄ is unbiased for μ; p̂ is unbiased for p; s² (with n−1 in denominator) is unbiased for σ².
- **Why we use n−1 in s.** Using n−1 (vs n) corrects for the fact that the sample mean x̄ is itself an estimate; without correction, s² systematically underestimates σ². This is the "Bessel correction."
- **The 10% condition revisited.** When sampling WITHOUT replacement from a finite population, observations aren't truly independent. The 10% condition (n ≤ 10% of N) means the dependence is small enough to ignore. For sampling with replacement OR experiments, this condition isn't needed.
- **Variability vs bias trade-off:**
  - **Variability** = sampling-distribution spread (standard error). Reduced by larger n.
  - **Bias** = systematic deviation from parameter. NOT reduced by larger n; needs better design (random sampling).
  - A small biased sample is still biased; just biased with less variation.

### Adds for [5]

- **The mathematical statement of CLT.** For an i.i.d. sample of size n with population mean μ and finite variance σ², as n → ∞, the standardized sample mean (x̄ − μ) / (σ/√n) converges in distribution to the standard Normal N(0, 1). The "approximately Normal" approximation holds for finite but large n.
- **When does CLT NOT save you?** CLT requires:
  - Independent observations (or close to it via 10% condition).
  - Finite population variance (most real-world variables satisfy this).
  - "Large enough" n. For very skewed populations, n = 30 may not be enough; n = 50 or 100 might be needed.
  - For VERY heavy-tailed distributions (e.g., Cauchy, which has no defined variance), CLT fails entirely.
- **Why sampling distribution of x̄ has SD σ/√n.** Var(x̄) = Var((X₁ + X₂ + ... + X_n)/n) = (1/n²) · Var(X₁ + ... + X_n). For independent observations, Var(X₁ + ... + X_n) = n·σ². So Var(x̄) = nσ²/n² = σ²/n. Taking square root: SD(x̄) = σ/√n.
- **Pooled vs unpooled standard error.** For the difference in two means, you can either:
  - **Pool** the variances if you assume σ₁ = σ₂ (more efficient when assumption holds).
  - **Unpool** if assumption is uncertain or violated (more general, AP-preferred).
  - AP Stats uses the unpooled formula by default unless told otherwise.
- **The "1/√n" rule of diminishing returns.** Doubling sample size reduces SE by factor of √2 (about 41% reduction). To halve the SE, you need to QUADRUPLE the sample size. This is why huge sample sizes are needed for very precise estimates.
- **The CLT's deeper significance.** It's why so many statistical procedures use Normal-based inference. Even when individual observations are not Normally distributed, sample MEANS are approximately Normal. This makes Normal-based confidence intervals and hypothesis tests broadly applicable.
- **Sampling distributions for OTHER statistics.** The CLT we typically reference is for sample MEANS and PROPORTIONS. Other statistics (median, variance, max) have their own sampling distributions, often more complex. AP Stats focuses on means and proportions because their sampling distributions are well-behaved (approximately Normal under conditions).

## Worked Examples

### Example 1 [3] — Identifying the three distributions

A school district has 5,000 students with a true mean SAT score of μ = 1100 and SD σ = 200. A school in the district has 100 students with a sample mean x̄ = 1150 and sample SD s = 180.

Three relevant distributions:
- **Population distribution:** the SAT scores of all 5,000 students in the district. Mean = 1100, SD = 200. Shape unknown without more info.
- **Sample data distribution:** the actual 100 SAT scores in the school's sample. Mean = 1150, SD = 180. Shape would need to be assessed (histogram).
- **Sampling distribution of x̄ (for n = 100):** the theoretical distribution of sample means across all possible samples of 100 students from the population. Mean = 1100, SD = 200/√100 = 20. Approximately Normal by CLT (since n = 100 is large).
- **Crucial:** the sampling distribution has MUCH SMALLER spread (SD = 20) than the population (SD = 200) or sample (SD = 180). This is why sample means are more reliable predictors of population means than individual observations.

### Example 2 [3][4] — Sampling distribution of x̄

A population has μ = 100 and σ = 15 (assume Normal). What is the probability that a random sample of n = 25 has a sample mean greater than 105?

- **Step 1.** Sampling distribution of x̄: Mean = 100, SD = 15/√25 = 3, approximately Normal.
- **Step 2.** Standardize: z = (105 − 100) / 3 = 1.67.
- **Step 3.** P(z > 1.67) = 1 − 0.9525 = 0.0475 (or use normalcdf(105, 999, 100, 3) = 0.0478).
- **Step 4.** Interpretation: about 4.8% of samples of size 25 would have a mean greater than 105.

### Example 3 [3][4] — Sampling distribution of p̂

A population has true proportion p = 0.40 of voters who support a candidate. A poll surveys 250 voters. What is the probability that p̂ < 0.35?

- **Step 1.** Check Large Counts: np = 250(0.40) = 100 ≥ 10 ✓; n(1−p) = 250(0.60) = 150 ≥ 10 ✓.
- **Step 2.** Sampling distribution: μ_(p̂) = 0.40; σ_(p̂) = √(0.40 · 0.60 / 250) = √0.00096 = 0.0310.
- **Step 3.** Standardize: z = (0.35 − 0.40) / 0.0310 = −1.61.
- **Step 4.** P(z < −1.61) = 0.0537 (or normalcdf(−999, 0.35, 0.40, 0.0310) = 0.0537).
- **Step 5.** Interpretation: about 5.37% of samples of 250 voters would yield a sample proportion below 0.35 if the true proportion is 0.40.

### Example 4 [4] — Difference in sample proportions

Two populations have proportions p₁ = 0.45 and p₂ = 0.40 supporting a policy. Sample sizes are n₁ = 200 and n₂ = 300. What is the probability that p̂₁ − p̂₂ > 0.10?

- **Step 1.** Mean of difference: μ_(p̂₁−p̂₂) = 0.45 − 0.40 = 0.05.
- **Step 2.** SD of difference: σ_(p̂₁−p̂₂) = √(0.45·0.55/200 + 0.40·0.60/300) = √(0.001238 + 0.0008) = √0.002038 = 0.0451.
- **Step 3.** Standardize: z = (0.10 − 0.05) / 0.0451 = 1.11.
- **Step 4.** P(z > 1.11) = 1 − 0.8665 = 0.1335.
- **Step 5.** Interpretation: about 13.35% of pairs of samples (one of 200, one of 300) would show a difference of more than 0.10 in observed proportions.

### Example 5 [4][5] — CLT applied to skewed population

A package delivery company has delivery times with a strongly right-skewed distribution: mean = 25 minutes, SD = 12 minutes. A study takes a random sample of 50 packages.

(a) Describe the sampling distribution of x̄.
(b) Find the probability that the sample mean exceeds 28 minutes.

- **(a)** By CLT, since n = 50 ≥ 30, the sampling distribution of x̄ is approximately Normal regardless of the skewed population shape. Mean = 25 (μ); SD = 12/√50 ≈ 1.70.
- **(b)** z = (28 − 25) / 1.70 = 1.76. P(z > 1.76) ≈ 0.0392.
- **(b) interpretation:** about 3.9% of samples of 50 packages would have a mean delivery time exceeding 28 minutes.
- **[5] note:** even though the POPULATION is highly skewed, the SAMPLING DISTRIBUTION of x̄ is approximately Normal. This is the power of CLT — it allows Normal-based methods even for non-Normal populations, as long as n is large enough.

## Top Traps & Common Errors

1. **Confusing the three distributions.** Population vs sample data vs sampling distribution. Distinct, with different shapes, centers, and spreads.
2. **Using σ instead of σ/√n for sampling distribution.** σ is for the population; σ/√n is the SE of the sample mean.
3. **Forgetting CLT applies to sample MEAN, not sample data.** Population shape doesn't change; what changes is that x̄ is approximately Normal for large n.
4. **Failing to check conditions.** ALWAYS check Random, 10% (if without replacement), Large Counts (proportions), and Normal/Large Sample (means) before using sampling distribution formulas.
5. **Computing SD of difference as σ₁ − σ₂.** WRONG. Variance ADDS: σ²_(diff) = σ²_1 + σ²_2.
6. **Using n − 1 vs n in sampling distribution formulas.** σ_(x̄) = σ/√n uses n, not n − 1. The n − 1 is for sample SD calculation, not sampling distribution SD.
7. **Saying "the sample is approximately Normal" when meant the SAMPLING DISTRIBUTION."** Be precise: the sample data has its own shape; the sampling distribution of the statistic has another.
8. **Confusing standard deviation with standard error.** SD is for any distribution; SE is specifically the SD of a sampling distribution.
9. **Forgetting Large Counts is np ≥ 10 AND n(1−p) ≥ 10, both required.** Both conditions must hold. With p near 0.5, both are easy; with p near 0 or 1, you need much larger n.
10. **Not adjusting for sample size in difference of means SD.** σ_(x̄₁−x̄₂) = √(σ₁²/n₁ + σ₂²/n₂). Each variance is divided by its own n.
11. **Treating the CLT as an absolute rule for n ≥ 30.** It's a guideline. Heavily skewed populations may need larger n.
12. **Saying CLT applies to proportions.** CLT specifically refers to means. For proportions, the Normal approximation comes from Large Counts (np ≥ 10, n(1−p) ≥ 10).
13. **Confusing parameter and statistic notation.** μ, σ, p are parameters (population). x̄, s, p̂ are statistics (sample).
14. **Using sampling distribution incorrectly to make a claim about a single sample.** Sampling distribution describes long-run behavior across MANY samples, not what a single sample will look like.
15. **Forgetting the 10% condition.** Without it, treating without-replacement sampling as independent gives wrong (smaller) SE.

## Rubric-Aware Tactics

**For describing sampling distributions:**
- Mean = parameter (population mean or proportion).
- Standard deviation = appropriate formula (σ/√n for means; √(p(1−p)/n) for proportions).
- Shape = Normal if conditions met (CLT for means; Large Counts for proportions).
- ALWAYS in CONTEXT of the variable.

**For probability calculations involving sample statistics:**
- Identify the sampling distribution (mean, SD, shape).
- Standardize using z = (statistic − mean) / SD.
- Use z-table or calculator (normalcdf).
- State result in CONTEXT.

**For two-sample sampling distributions:**
- Mean = difference (or sum) of population parameters.
- SD = √(sum of variances), where each variance is divided by its sample size.
- Check conditions for both samples.

**For checking conditions:**
- Random: was sampling random?
- 10%: is n ≤ 10% of population (if without replacement)?
- Large Counts (proportions): np ≥ 10 AND n(1−p) ≥ 10?
- Normal/Large Sample (means): population Normal OR n ≥ 30?

**For CLT-related questions:**
- State that CLT applies for sample MEAN.
- Note that population shape doesn't matter when n is large enough.
- Identify approximate Normal as the sampling distribution shape.

## "Phrases That Score" — verbatim language for FRQs

1. "The sampling distribution of [statistic] has mean μ_[statistic] = [value], standard deviation σ_[statistic] = [formula] = [value], and is approximately Normal because [CLT applies / Large Counts condition is met]."
2. "By the Central Limit Theorem, even though the population distribution is [skewed/non-Normal], the sampling distribution of the sample mean is approximately Normal because n = [n] ≥ 30."
3. "The probability that the sample [mean / proportion] is [greater than / less than / between] [value] is approximately [probability], using the standardized score z = (statistic − mean) / SD = [value]."
4. "The conditions for using the sampling distribution are met: the sample was randomly selected, n = [n] is less than 10% of the population, and [large counts condition or normal/large sample condition] is satisfied."
5. "The standard deviation of the sampling distribution σ/√n = [value] is much smaller than the population standard deviation σ = [value]. This reflects the fact that sample means vary less than individual observations."
6. "The sampling distribution of the difference in sample proportions has mean p₁ − p₂ = [value] and standard deviation √(p₁(1−p₁)/n₁ + p₂(1−p₂)/n₂) = [value]. The shape is approximately Normal because both samples meet the Large Counts condition."
7. "[x̄ / p̂] is an unbiased estimator of [μ / p] because the sampling distribution is centered at [μ / p]."

## If You Do Nothing Else for This Unit

*Master the three-distributions distinction (population vs sample data vs sampling distribution) cold — confusing these is the most common conceptual error in AP Stats. Master the sampling distribution formulas: μ_(x̄) = μ, σ_(x̄) = σ/√n; μ_(p̂) = p, σ_(p̂) = √(p(1−p)/n). Understand that the CLT means the SAMPLE MEAN is approximately Normal for large n regardless of population shape. These three concepts are the foundation for ALL inference in Units 6–9.*

_lastUpdated: 2026-05-04
_sources: College Board AP Statistics CED 2024-25, Princeton Review AP Statistics 2025, Khan Academy AP Statistics, The Practice of Statistics 6e (Starnes & Tabor)
_difficulty: foundational
_relatedUnits: ap-statistics-unit-1-one-variable-data, ap-statistics-unit-4-probability, ap-statistics-unit-6-inference-proportions, ap-statistics-unit-7-inference-means
