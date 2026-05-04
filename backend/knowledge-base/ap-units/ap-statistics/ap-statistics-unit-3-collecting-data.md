# AP Statistics — Unit 3: Collecting Data — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 12–15% of the AP Statistics exam
- **Sub-topics covered:**
  - 3.1 Introducing Statistics: Do the Data We Collect Tell the Truth?
  - 3.2 Introduction to Planning a Study
  - 3.3 Random Sampling and Data Collection
  - 3.4 Potential Problems with Sampling
  - 3.5 Introduction to Experimental Design
  - 3.6 Selecting an Experimental Design
  - 3.7 Inference and Experiments
- **Where this period appears on the exam:** Unit 3 is the most-tested unit in terms of FRQ frequency for design questions. Almost every exam has at least one experimental design or sampling design FRQ. The distinction between observational study and experiment is the most-violated rule. Confounding and bias identification appear constantly. The four sampling methods (SRS, stratified, cluster, systematic) and their appropriate uses are perennial MCQs. Random assignment vs random selection — the single most analytically powerful distinction in this unit — appears in nearly every design question.

## Big Ideas

1. **HOW you collect data determines what conclusions you can draw.** This is the single most important principle in statistics. Bad data collection → bad conclusions, no matter how sophisticated your analysis.
2. **Random selection (sampling) → generalize to a population. Random assignment (experiment) → establish cause-and-effect.** These are the two fundamental random procedures, and they enable two different kinds of conclusions. Doing both lets you generalize CAUSAL conclusions to a population.
3. **Observational studies vs experiments.** Observational studies record what happens; experiments impose treatments. Only experiments (with random assignment) can establish causation.
4. **Bias is systematic error, not random error.** Bias arises from the design of data collection — it doesn't get fixed by larger sample sizes. Random error decreases with larger samples; bias does not.
5. **Confounding occurs when an explanatory variable's effect cannot be separated from the effect of another variable.** Confounding is the central threat to inferring causation from observational studies.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Population vs sample:**
  - **Population:** the entire group we want to learn about.
  - **Sample:** the subset we actually observe.
  - **Census:** measures the entire population (rare; usually impractical).
  - **Sampling frame:** the list of population members from which the sample is drawn.
- **Parameter vs statistic:**
  - **Parameter:** a number describing the POPULATION (μ, σ, p) — usually unknown.
  - **Statistic:** a number describing the SAMPLE (x̄, s, p̂) — calculated from the data.
  - Memory aid: P for Parameter and Population; S for Statistic and Sample.
- **Sampling methods:**
  - **Simple Random Sample (SRS):** every group of n individuals has equal chance of being selected.
  - **Stratified random sample:** divide population into homogeneous groups (strata); take SRS from each stratum. Strata are based on a characteristic relevant to the study (gender, age, location).
  - **Cluster sample:** divide population into groups (clusters); randomly select clusters; sample everyone in selected clusters. Clusters are typically heterogeneous (mini-populations).
  - **Systematic sample:** select every kth individual after a random start.
  - **Convenience sample:** sample whoever is easy to reach. NOT RANDOM. Produces biased samples.
  - **Voluntary response sample:** sample whoever volunteers. NOT RANDOM. Produces biased samples (typically over-represents people with strong opinions).
- **Bias types:**
  - **Selection bias / undercoverage:** some groups in the population have no chance (or much smaller chance) of being included.
  - **Voluntary response bias:** allowing people to self-select into the sample (call-in surveys, online polls).
  - **Convenience bias:** sampling whoever is easy to reach.
  - **Nonresponse bias:** selected individuals don't respond, and non-respondents differ from respondents.
  - **Response bias:** people answer dishonestly or inaccurately (sensitive topics, social desirability, interviewer effects).
  - **Question wording bias:** leading or loaded questions affect responses.
- **Observational study vs experiment:**
  - **Observational study:** observe and record without imposing treatments. Can identify ASSOCIATIONS, NOT causation.
  - **Experiment:** randomly assign subjects to treatment groups; impose treatments; measure response. Can establish CAUSATION (with random assignment).
- **Experimental terminology:**
  - **Subjects (or experimental units):** what receives treatment.
  - **Factor:** an explanatory variable.
  - **Levels:** the values or settings of a factor.
  - **Treatment:** a specific combination of factor levels.
  - **Response variable:** what is measured.
  - **Control group:** group not receiving the experimental treatment (often given a placebo or standard treatment).
- **Three principles of experimental design:**
  - **Comparison:** compare two or more treatment groups (or treatment vs control).
  - **Random assignment:** randomly assign subjects to treatment groups to balance other variables on average.
  - **Replication:** apply each treatment to enough subjects to detect treatment effects above natural variability.
- **Experimental designs:**
  - **Completely Randomized Design:** all subjects randomly assigned to treatment groups.
  - **Randomized Block Design:** subjects first divided into BLOCKS based on a similar characteristic, then randomly assigned within each block. Reduces variation by controlling for the blocking variable.
  - **Matched Pairs Design:** subjects matched in pairs (often by similarity), then within each pair, randomly assign one to each treatment. Or: same subject receives both treatments (in random order).
- **Confounding:** when the effect of an explanatory variable cannot be separated from the effect of another (lurking) variable.
- **Placebo and Blinding:**
  - **Placebo:** an inert treatment that looks like the real treatment.
  - **Blinding (single-blind):** subjects don't know which treatment they receive.
  - **Double-blind:** neither subjects NOR researchers know which treatment is given.
  - These reduce response bias and observer bias.

### Adds for [4]

- **Random selection vs random assignment — the critical distinction:**
  - **Random selection** (SRS, stratified, cluster) is about HOW we choose subjects from the population. It enables GENERALIZATION to the population.
  - **Random assignment** (in experiments) is about HOW we allocate subjects to treatment groups. It enables CAUSAL CONCLUSIONS by balancing other variables across groups.
  - **Both random selection AND random assignment** allow causal conclusions that generalize to the population.
  - **Random assignment but not random selection:** can establish causation but only for the specific subjects studied.
  - **Random selection but not random assignment:** can generalize to the population but only as association, not causation.
  - **Neither:** observation only, can describe but not generalize or establish causation.
- **Why stratification reduces variability.** By stratifying on a relevant variable, you ensure each stratum is well-represented in the sample, reducing the chance of imbalance. This produces more precise estimates than SRS, especially when the strata differ from each other.
- **Why cluster sampling is used.** Practical convenience — when individuals are clustered geographically (or otherwise), it's cheaper to sample whole clusters than to sample individuals across clusters. The trade-off: cluster sampling is generally LESS precise than SRS (because clusters tend to be similar internally).
- **Stratified vs cluster — the key contrast:**
  - **Stratified:** strata are similar internally; you SRS within each stratum.
  - **Cluster:** clusters are similar to each other (each cluster is a mini-population); you sample whole clusters.
  - **Use stratified** when you want to ensure representation of subgroups.
  - **Use cluster** when geographic or logistical practicality matters more than statistical precision.
- **Why blocking is the experimental analog of stratifying.** Blocking groups subjects with similar characteristics (similar to stratifying on a variable), then randomizes within each block. This reduces variation due to the blocking variable. Stratifying = sampling design; blocking = experimental design.
- **Statistical significance:**
  - A result is "statistically significant" if it's unlikely to have occurred by chance alone (typically p-value < α, where α is the significance level, often 0.05).
  - Statistically significant ≠ practically important — a tiny effect can be significant with a large enough sample.
- **Generalizability:**
  - Results from a random sample can be generalized to the population from which it was drawn.
  - Results from a non-random sample cannot be generalized.
- **Causation vs association:**
  - **Association** (correlation): variables move together.
  - **Causation:** changes in one DIRECTLY cause changes in the other.
  - Only RANDOMIZED EXPERIMENTS establish causation. Observational studies establish only association.
- **Sources of bias in observational studies that experiments can address:**
  - **Confounding** (lurking variables): random assignment balances them across groups.
  - **Reverse causation:** observational studies can't tell which way causation runs.
  - **Selection effects:** randomization eliminates them.
- **Design issues — Hawthorne effect** — subjects' awareness of being studied affects their behavior. Mitigated by blinding (especially double-blind).
- **Sample size considerations:**
  - Larger sample → more precise estimates.
  - But: a poorly designed large sample can be MORE biased than a smaller well-designed sample.
  - Famous example: Literary Digest 1936 poll predicted Landon over Roosevelt — used 2.4 million responses but biased sampling frame (telephone owners, magazine subscribers).

### Adds for [5]

- **Why randomization works (theoretically).** Random assignment ensures that, ON AVERAGE, the treatment groups are similar in all variables — both measured and unmeasured. Any difference in response between groups can be attributed to the treatment, because other variables are balanced (in expectation). Critically, this only works ON AVERAGE — for any single experiment, balance might fail by chance, especially with small samples. Larger samples reduce this risk.
- **Why double-blinding matters more than single-blinding.** Researchers' beliefs and expectations can subtly influence subject behavior, measurement, or interpretation. Double-blinding (neither subjects nor researchers know assignments) prevents both types of bias. Famous failures of single-blind studies show that researcher expectations can swing results.
- **The placebo effect.** Subjects receiving placebos often improve, even though the placebo has no active ingredient. The placebo effect is REAL and significant — it's why control groups in medical trials get placebos rather than nothing. To detect a true treatment effect, the treatment must outperform placebo.
- **Convenience sampling vs probability sampling.** Convenience samples can be HUGE and STILL biased. The 1936 Literary Digest poll had 2.4 million respondents and was famously wrong about the Roosevelt-Landon election. The Gallup poll, with only 50,000 respondents but using probability sampling, predicted correctly. Sample SIZE doesn't fix sampling METHOD.
- **The "Census problem" of self-reporting.** The US Census, which surveys everyone, still has bias — undercount of certain groups (homeless, undocumented, transient). No amount of effort to "count everyone" eliminates this without solving the underlying response barriers.
- **Why we use random number tables, computer random number generators, or calculator random functions.** These produce pseudo-random sequences that meet statistical requirements for randomness. Coin flips, dice, and shuffled cards are also valid but slower for large samples.
- **Block-randomized vs stratified-randomized:**
  - **Block randomization (in experiments):** divide subjects into blocks, then randomly assign within each block. Reduces variation due to blocking variable.
  - **Stratified random sampling:** divide population into strata, then SRS within each. Reduces sampling variability.
  - The principle is the same: control for a variable by ensuring balance.
- **The "ethics" of randomization.** Random assignment can be ethically problematic when one treatment is suspected to be much better than another (denying the better treatment to some subjects). This is why drug trials often have STOPPING RULES — if interim analysis shows clear superiority, the trial ends to give all subjects the better treatment.
- **The "ecological validity" trade-off.** Highly controlled experiments (e.g., laboratory studies) maximize internal validity (causal inference) but may sacrifice external validity (generalizability to real-world settings). Field experiments balance differently. AP Stats focuses on internal validity (random assignment for causation), but a sophisticated answer notes that generalizability requires either probability sampling OR explicit replication in different settings.

## Worked Examples

### Example 1 [3] — Identifying sampling method

A school wants to estimate the average GPA of its students. Identify the sampling method:
(a) The principal walks down the hallway and asks the first 30 students he sees.
(b) The principal divides students by grade level (9, 10, 11, 12) and randomly selects 25 from each grade.
(c) The principal randomly selects 5 homeroom classes and surveys all students in those classes.
(d) The principal uses a random number generator to select 100 students from the school directory.

- **(a) Convenience sample.** Not random; biased toward students whose schedules match principal's hallway timing.
- **(b) Stratified random sample.** Divides into strata (grades) and SRS within each.
- **(c) Cluster sample.** Randomly selects whole groups (homeroom classes) and surveys all members.
- **(d) Simple random sample (SRS).** Each individual has equal chance of selection.

### Example 2 [3][4] — Designing an experiment

A researcher wants to test whether a new drug reduces blood pressure. She has 200 patients to study.

**Design a completely randomized experiment.**

- **Step 1.** Define the population: 200 patients.
- **Step 2.** Specify treatments: New drug vs placebo (control).
- **Step 3.** Randomly assign 100 patients to each treatment using a random number generator (or random number table). For each patient, generate a random number; assign to drug if 1–100, to placebo if 101–200.
- **Step 4.** Apply treatment for the study period.
- **Step 5.** Measure response: change in blood pressure.
- **Step 6.** Compare mean change between groups.
- **Bias controls:** double-blind the study (neither patients nor evaluators know who got what).
- **Why this is an experiment:** treatments are IMPOSED; subjects are RANDOMLY ASSIGNED; comparison group exists.

### Example 3 [4] — Identifying confounding

A study finds that people who eat more chocolate have higher heart disease rates.

- **Possible confounding variable:** age (older people may eat differently AND have more heart disease). Income (wealthier people may afford more chocolate AND have access to better healthcare, OR may have different lifestyle factors).
- **Why this is observational:** chocolate consumption was OBSERVED, not assigned.
- **Why this can't establish causation:** the chocolate-heart disease association may be entirely due to other variables (age, lifestyle, etc.) that the researchers didn't control for.
- **AP-style answer:** "Because this is an observational study, we cannot conclude that eating chocolate CAUSES heart disease. There may be confounding variables — such as age or other lifestyle factors — that influence both chocolate consumption and heart disease risk independently. To establish causation, we would need a randomized experiment that randomly assigns subjects to high-chocolate or low-chocolate diets and then measures heart disease outcomes."

### Example 4 [4][5] — Comparing CRD vs Block Design

A teacher wants to test which of three study methods is most effective for a vocabulary test. She has 60 students with varying initial vocabulary skill levels.

**Option A: Completely Randomized Design.** Randomly assign 20 students to each of three methods.

**Option B: Randomized Block Design.** Group students into blocks based on initial vocabulary score (low, medium, high — 20 students each). Within each block, randomly assign 7 to method 1, 7 to method 2, 6 to method 3 (or close variant).

- **Option A:** simpler. But variation in initial vocabulary becomes part of the response variation, making it harder to detect treatment effects.
- **Option B:** controls for initial vocabulary. Removes variation due to that variable, making treatment effect more detectable. Recommended when there's a known important source of variation.
- **General rule:** if a variable is known to affect the response, BLOCK on it. This reduces variability and gives more precise estimates of treatment effects.

### Example 5 [4] — Bias identification

Identify the bias in each scenario:

(a) A telephone survey only reaches landline numbers; the survey aims to estimate political views.
(b) An online poll asks "Should the dangerous mayor be removed from office?"
(c) A researcher studying student stress emails the survey to students; only 15% respond.

- **(a) Selection bias / undercoverage** — landline-only excludes cell-only households, who are systematically different (younger, more mobile).
- **(b) Question wording bias** — calling the mayor "dangerous" leads respondents toward the desired answer.
- **(c) Nonresponse bias** — 85% of students didn't respond. Their stress levels may differ from the 15% who did (probably MORE stressed students were too stressed to respond, OR less interested students didn't bother).

## Top Traps & Common Errors

1. **Conflating observational study and experiment.** Observation = no treatment imposed. Experiment = treatment imposed and randomly assigned.
2. **Saying "association implies causation."** Only experiments (with random assignment) establish causation.
3. **Confusing random selection (sampling) and random assignment (experiment).** Different procedures with different purposes.
4. **Calling a non-random "sample" an SRS.** SRS requires every group of n having equal chance.
5. **Missing the placebo control.** Without a control group, you can't distinguish treatment effect from natural improvement or placebo effect.
6. **Using statistical significance when it's not justified.** Need a randomized design AND large enough sample to support significance claims.
7. **Generalizing to a wider population than the sampled one.** Results from a study on one school's students don't generalize to all students nationwide.
8. **Generalizing experimental results to the population without random selection.** Random ASSIGNMENT enables causal claims; random SELECTION enables generalization. They're different.
9. **Ignoring the difference between blinding and randomization.** Randomization ensures balance; blinding prevents psychological bias.
10. **Applying SRS principles to cluster or stratified samples.** Each design has its own rules.
11. **Forgetting that a large sample size doesn't fix biased sampling.** Big biased sample = big biased estimate.
12. **Thinking that confounding = association.** Confounding is when you CAN'T tell if X causes Y because some other variable Z is mixed in.
13. **Believing that blocking eliminates variation.** Blocking REDUCES variation due to the blocking variable but doesn't eliminate it.
14. **Forgetting matched pairs is a special case of block design.** Each pair functions as a block of size 2.
15. **Not specifying random assignment explicitly when describing experiments.** AP rubrics require explicit description (e.g., "use a random number generator to assign subjects").

## Rubric-Aware Tactics

**For sampling design questions:**
- Identify the sampling method (SRS, stratified, cluster, systematic, convenience, voluntary).
- Describe the random selection mechanism EXPLICITLY (e.g., "use a random number generator").
- Address any potential biases.

**For experimental design questions:**
- Identify subjects, factors, levels, treatments, response variable.
- Describe random assignment EXPLICITLY ("use a random number generator to assign...").
- Specify any controls (placebo, blinding).
- For block design, name the blocking variable and explain why blocking is appropriate.

**For observational vs experimental classification:**
- Determine if treatments were IMPOSED (experiment) or just OBSERVED (observational).
- Note implications for causal inference.

**For bias identification:**
- Name the SPECIFIC type of bias.
- Explain HOW it leads to systematic error.
- Suggest how to address it (better sampling, blinding, etc.).

**For confounding identification:**
- Name a SPECIFIC confounding variable.
- Explain HOW it could create the observed association without causation.

**For generalizability:**
- Identify whether random selection occurred.
- If yes: results generalize to population.
- If no: results apply only to studied subjects.

**For causation:**
- Identify whether random assignment occurred (experiment).
- If yes: causal claim valid for studied subjects.
- If no: only association can be claimed.

## "Phrases That Score" — verbatim language for FRQs

1. "Use a random number generator to select [n] participants from a list of all [population]. This produces a simple random sample, ensuring every individual has an equal chance of selection."
2. "Randomly assign [n] subjects to each treatment group using a random number generator. For each subject, generate a random number; assign to treatment X if [criterion], to treatment Y if [criterion]."
3. "Because this is an observational study, we can only conclude that there is an ASSOCIATION between X and Y, not that X causes Y. There may be confounding variables, such as [example], that influence both X and Y."
4. "Block subjects based on [blocking variable] before randomly assigning to treatments within each block. This controls for variation due to [blocking variable] and produces a more precise estimate of the treatment effect."
5. "Use double-blinding so that neither subjects nor researchers know which treatment each subject received. This prevents response bias and observer bias from influencing the results."
6. "The sample is biased because [specific bias type]. This means the sample does not represent the population, and any conclusions drawn from it cannot be generalized."
7. "Because random assignment was used (experiment) but random sampling was not (subjects were volunteers), we can conclude causation FOR THESE SUBJECTS but cannot generalize to the broader population."

## If You Do Nothing Else for This Unit

*Master two distinctions: (1) random SELECTION (sampling) enables generalization to a population; random ASSIGNMENT (experiment) enables causal inference; doing both lets you generalize CAUSAL conclusions; (2) observational study (only association) vs experiment (causation possible). These two distinctions resolve nearly every Unit 3 question on the AP exam and are foundational for understanding inference in Units 6–9.*

_lastUpdated: 2026-05-04
_sources: College Board AP Statistics CED 2024-25, Princeton Review AP Statistics 2025, Khan Academy AP Statistics, The Practice of Statistics 6e (Starnes & Tabor)
_difficulty: foundational
_relatedUnits: ap-statistics-unit-1-one-variable-data, ap-statistics-unit-5-sampling-distributions, ap-statistics-unit-6-inference-proportions
