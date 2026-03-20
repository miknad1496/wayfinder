# SAT/ACT Adaptive Prep Module — Architecture Document

**Product Owner:** Wayfinder Admissions Platform
**Module Type:** Standalone Paid Product
**Price:** $200 USD (One-Time Purchase)
**Target Audience:** High school students (grades 10-12), test-optional strategy participants
**Launch Date:** Q2 2026

---

## 1. EXECUTIVE OVERVIEW

The SAT/ACT Adaptive Prep Module represents a fundamental shift in how students prepare for standardized tests. Rather than the traditional "test-fail-repeat" loop, Wayfinder's approach identifies the *underlying concepts* students don't grasp and teaches them through intuitive, real-world examples before providing targeted practice.

**The Core Problem We're Solving:**
Students spend 50+ hours on test prep and see minimal score gains. Why? Because when they get a question wrong, they see the answer explanation and move on—without understanding the concept it actually tests. They'll encounter that same concept (tested 15 different ways across the exam) and fail it again.

**The Wayfinder Difference:**
1. Diagnostic assessment pinpoints concept gaps (not just wrong answers)
2. Personalized learning plan sequences concepts from foundation to mastery
3. Each concept taught via real-world intuition, not textbook language
4. Graduated practice: easy → medium → hard, each reinforcing the concept
5. Friendly recaps between practice sets remind students of key insights
6. Sequential module unlock prevents "dump and cancel" churn

**Business Model:**
- One-time $200 purchase (no subscription churn risk)
- Available to Coach and Consultant tier subscribers + standalone buyers
- Sequential module access (must progress through system to prevent abandonment)
- Integration with existing Stripe payment system and user profiles

---

## 2. PRODUCT STRUCTURE & LEARNING PATHWAY

### 2.1 The Eight-Module Sequential System

Each module builds on the previous. Students cannot access Module 2 until completing Module 1. This sequential design is intentional: it ensures sustained engagement and prevents users from downloading all content and abandoning the platform.

#### **Module 1: Diagnostic & Foundation Concepts**
**Duration:** 4-5 hours over 1-2 weeks
**Objective:** Identify concept gaps and establish baseline

- **Diagnostic Assessment (60 questions)**
  - Not a full SAT/ACT (those are 3+ hours)
  - Strategically selected to probe all major concept areas
  - Adaptive within sections: harder questions if you're performing well
  - Takes 45-60 minutes
  - Produces detailed concept mastery report (0-100% per concept)

- **Personalized Study Plan Generation**
  - Algorithm ranks all concepts by:
    - Diagnostic performance (weakest first)
    - Test frequency (most-tested concepts first among weak areas)
    - Prerequisite relationships (foundations before advanced)
  - Student sees a visual roadmap: "You have 18 concept gaps to master. Here's your path."
  - Timeline estimate: "Based on your gaps, plan for 30-40 hours of focused study over 8-10 weeks."

- **Module 1 Learning Core**
  - First 3-5 concepts from the personalized plan
  - For each concept: Intuitive Explanation → Why Students Fail It → Graduated Practice (3 problems)
  - Introduction to "The Wayfinder Method" (the thinking framework unique to this platform)
  - Progress tracking unlocks Module 2

**Unlock Requirement:** Complete diagnostic + finish first 3 concepts

---

#### **Module 2: Targeted Concept Mastery (Part 1)**
**Duration:** 8-10 hours over 2-3 weeks
**Objective:** Master foundation and mid-level concepts

- Concepts 4-12 from the personalized study plan
- Expanded practice: 5-7 problems per concept (not just 3)
- Introduction of "concept clusters": "You missed problems about inequalities AND absolute value. They're related. Here's how to think about them together."
- Adaptive difficulty: if student scores 80%+ on a concept, they advance; below 60%, they get a "friendly recap" and retry
- Progress milestone: "Halfway to mastery. Your predicted score range has improved by 40 points."

**Unlock Requirement:** Achieve 70%+ mastery on 8+ concepts from Module 1

---

#### **Module 3: Strategy & Timing**
**Duration:** 3-4 hours over 1 week
**Objective:** Develop test-taking strategy independently of content

- **Pacing Strategy**
  - Digital SAT: 70 minutes for Math section (35 questions)
  - Digital SAT: 64 minutes for Reading & Writing (52 questions)
  - How to pace: 1.5 min/question for easy, 2 min for hard, skip/return strategy

- **Question Selection Strategy**
  - The elimination method (why it's more powerful than solving from scratch)
  - When to skip and return (the 30-second rule)
  - Calculator vs mental math decision trees
  - Reading passage order (which type to tackle first based on YOUR strengths)

- **Anxiety Management**
  - Stress-testing: timed practice in controlled conditions
  - The "confidence log": students record which concepts they feel confident about
  - Night-before ritual: what helps, what hurts (backed by cognitive science)
  - Test day logistics that affect performance

- **Interactive Strategy Workshop**
  - Simulated mini-tests (15 questions) at various time pressures
  - Feedback: "You're rushing through reading comprehension. Slow down 20 seconds per passage."
  - Strategy adjustment: students modify their approach in real-time

**Unlock Requirement:** Complete strategy modules + score 65%+ on timed mini-tests

---

#### **Module 4: Full Practice Test 1**
**Duration:** 4-5 hours (including review)
**Objective:** Apply learning in realistic test conditions

- **Proctored Full-Length Practice Test**
  - Digital SAT or ACT format (student chooses or takes both)
  - 3-hour timed session (breaks allowed as on actual test)
  - Administered through secure testing interface
  - Score reported within 1 hour

- **Comprehensive Score Report**
  - Raw score and percentile
  - Concept mastery breakdown: which concepts showed improvement, which need more work
  - Time analysis: average time per question, by section
  - Accuracy vs. speed profile: are they rushing or overthinking?
  - Predicted test day score range (confidence interval)

- **Comparison to Diagnostic**
  - Visual progress: "You've improved 65 points in predicted score since diagnostic."
  - Concept-by-concept comparison: "Math algebra improved from 45% to 78%."
  - "But you still need work on: geometry, reading inference questions, grammar."

**Unlock Requirement:** Complete practice test (yes, you have to actually take it)

---

#### **Module 5: Review & Adaptive Reteaching**
**Duration:** 6-8 hours over 2-3 weeks
**Objective:** Deep review of weak areas; targeted reteaching

- **Auto-Generated Review Curriculum**
  - Algorithm analyzes Practice Test 1 performance
  - Rebuilds study plan focusing on concepts where student scored <70%
  - Example: "You got 3/8 questions on circle properties. Let's go deeper."

- **Reteaching: Different Angle**
  - Same concept, different explanation pathway
  - New real-world examples
  - Prerequisite concepts reviewed (e.g., if they struggle with circles, make sure they own degree/radian basics)

- **Concept Clinic Sessions**
  - 5-7 targeted practice problems per weak concept
  - After each problem: immediate explanation + connection to real world
  - Confidence building: "Last time you got these wrong. This time, you're going to see why."

- **Mastery Verification**
  - Mini-quizzes on reteach concepts (10 questions per concept)
  - Must score 75%+ to move forward
  - If they score <75%, system suggests another reteach session or marks for SLM live support

**Unlock Requirement:** Achieve 75%+ mastery on at least 75% of previously weak concepts

---

#### **Module 6: Advanced Concepts & Score Optimization**
**Duration:** 5-7 hours over 2-3 weeks
**Objective:** Push from good scores to great scores

- **Advanced Concept Sequence**
  - Concepts 13-25 (higher difficulty, less frequently tested but high-value)
  - Example (Math): complex coordinate geometry, advanced trig applications, polynomial division
  - Example (Reading): rhetorical analysis, synthesis across multiple passages

- **The "Score Unlock" Technique**
  - Students who've mastered foundation concepts are ready for the advanced insights that unlock 50+ point gains
  - Example: "You own quadratics. Now learn how the SAT disguises them in word problems. This pattern alone will give you 3-4 extra questions right."

- **Strategic Problem Patterns**
  - Students don't learn individual problems; they learn patterns
  - "Every time you see a word problem about consecutive integers, here's the setup."
  - "When a geometry problem mentions 'inscribed,' think about angle relationships."

- **Precision & Efficiency**
  - Timed drills focusing on the 30 hardest problem types
  - Speed optimization: "You can solve this in 45 seconds instead of 2 minutes. Here's how."

**Unlock Requirement:** Achieve 80%+ on 15+ concepts from Modules 1-2

---

#### **Module 7: Full Practice Test 2**
**Duration:** 4-5 hours (including review)
**Objective:** Measure progress and identify final polish areas

- **Second Full-Length Practice Test**
  - Same format as Practice Test 1
  - Different questions (obviously)
  - Ideally taken 2-3 weeks after Practice Test 1

- **Comparison Score Report**
  - Side-by-side with Test 1: which sections improved most?
  - Concept-by-concept: "Algebra went from 78% to 92%. Reading inference jumped from 61% to 81%."
  - Predicted score range: narrower (more confident) than after Test 1
  - Percentile improvement: "You're now in the 87th percentile (was 72nd after Test 1)."

- **Diminishing Returns Analysis**
  - If student has reached goal score: "You've hit your target of 1350. Option 1: Stop here and ace essays/EC. Option 2: Keep going for 1400+."
  - If still below target: "You've improved 120 points. Here's the specific area that's holding you back from your 1450 goal."

**Unlock Requirement:** Complete practice test

---

#### **Module 8: Final Review & Test Day Prep**
**Duration:** 3-4 hours over final 1 week before test
**Objective:** Build confidence and prepare for test day

- **The 1-Week Sprint**
  - Not about learning new things
  - Micro-reviews of the student's *personal* weak points
  - Example: "Based on your tests, you miss 2/10 problems on exponential growth. Here's a 5-minute primer."

- **Confidence Building**
  - Personalized strength report: "You own these 22 concepts. That's 70% of the test."
  - Realistic limitations: "These 8 concepts are hard for you. That's okay—most students miss these too."
  - Expected score range: "Based on your performance, plan for 1320-1400."

- **Test Day Preparation**
  - Mental preparation: visualization, stress-reduction techniques
  - Logistics checklist: calculator batteries, admission ticket, COVID protocols, etc.
  - Night-before ritual: "Here's what to do (review easy concepts) and NOT do (cram new content)."
  - Test day morning: what to eat, how to approach first section, how to pace

- **Post-Test Support**
  - If score disappoints: "Here's what to do differently for retake (if you take one)."
  - If score exceeds expectations: "Here's how to leverage this in applications."
  - Strategy for score-optional schools: "Based on your score, here's which schools to report to."

**Unlock Requirement:** Complete modules 1-7 (this is the victory lap)

---

### 2.2 Anti-Churn Design Elements

The sequential module unlock is the primary churn prevention. Additional elements:

1. **Psychological Momentum**
   - After Practice Test 1, students see concrete score improvement (usually +60-120 points predicted)
   - The diagnostic was discouraging ("18 concept gaps") but now it's encouraging ("already mastered 7, 11 to go")
   - This momentum carries them through Modules 5-6

2. **Sunk Cost / Progress Visibility**
   - Students see their progress dashboard: concepts mastered, modules completed, predicted score
   - They've invested time (30-40 hours) and they can see they're 60% through the program
   - Stopping now means abandoning that progress

3. **Gamification (Light)**
   - Concept mastery badges: "You've mastered 15 concepts. Next milestone: 20."
   - Time-to-score tracking: "You've improved 100 points in 18 hours of study."
   - Leaderboard (optional): students can opt into a cohort leaderboard to see their percentile

4. **Forced Engagement Gates**
   - Can't access Module 4 (practice test) without doing Module 3 (strategy)
   - Can't take Practice Test 2 without doing Module 5 (reteaching)
   - This prevents "download everything and skip" behavior

---

## 3. THE CONCEPT-BASED LEARNING SYSTEM

### 3.1 The Anatomy of a Concept Node

Every concept in Wayfinder follows this five-part structure:

#### **Part 1: Concept Explanation (Real-World Bridge)**

**Traditional approach (BAD):**
"A rate is a ratio comparing two quantities with different units, expressed in the form a:b or a/b."

**Wayfinder approach (GOOD):**
"Imagine you're driving from Seattle to Portland—about 170 miles. It takes you 3 hours. Rate is just 'how much of thing A for each unit of thing B.' In this case: 170 miles ÷ 3 hours = 57 miles *per* hour. When you see 'per,' you're seeing rate. It could be miles per hour, dollars per gallon, students per classroom—anything 'per' anything."

**Key principle:** Every math concept has a real-world instantiation. SAT/ACT doesn't test abstract math; it tests math that models the real world. By grounding explanation in reality, students develop intuition instead of memorizing formulas.

**Examples of real-world bridges:**
- **Inequalities:** "You have $20. Video game costs $15. You can afford it if $15 ≤ $20. Change it: You need at least $20 to buy something. So your budget *x* must satisfy x ≥ 20."
- **Exponential growth:** "Your COVID antibodies decay by half every 3 months. Started with 1000 units. After 3 months: 500. After 6 months: 250. The pattern is 1000 × (0.5)^(t/3). Real-world math."
- **Circle properties:** "Pizza box (square) vs. pizza (circle). Same 'width'—the box is 14×14, pizza is 14 diameter. The pizza has way more area. That's why circles are special: they pack more area than rectangles of the same dimension."

#### **Part 2: Why Students Get This Wrong (Common Misconceptions)**

Wayfinder explicitly teaches the *traps* students fall into:

**Example: Percentage Increase/Decrease**
- **Common trap:** "If a stock goes up 20% then down 20%, you're back where you started."
  - Reality: $100 → $120 (up 20%) → $96 (down 20%). You lose money.
  - Why students fall for it: They think of percentages as symmetric. They're not.
  - Fix: "Percentage is always relative to the current value. 20% of $120 ≠ 20% of $100."

**Example: Solving Systems of Equations**
- **Common trap:** Students use substitution when elimination is faster (or vice versa)
  - Reality: Both work, but one is more efficient depending on equation structure
  - Why students fall for it: They don't have a *why-to-use* framework, just memorized steps
  - Fix: "If you can eliminate a variable with one operation, do it. If you need multiple operations, substitute."

Every concept node includes 3-4 misconceptions. Students learn what's *wrong* first, which actually improves memory of what's *right*.

#### **Part 3: The Wayfinder Method (The Intuitive Thinking Framework)**

Each concept gets a named, intuitive method that students can recall and apply:

**Example: The "Unitary Method" for Ratios/Proportions**
"If 3 workers build 8 houses in a month, how many houses do 5 workers build?"
- Wayfinder method: Find the unit rate first (houses per worker), then scale.
  - 8 houses ÷ 3 workers = 2.67 houses per worker
  - 5 workers × 2.67 = 13.3 houses
- Why it works: You always reduce to the unit first, then scale. Simple, visual, applies everywhere.

**Example: The "Opposite Operation" Method for Inequalities**
"What's the solution to -2x + 5 > 13?"
- Wayfinder method: Inequalities are solved *exactly* like equations, except: when you multiply/divide by a negative, flip the inequality sign.
  - -2x + 5 > 13
  - -2x > 8 (subtract 5)
  - x < -4 (divide by -2, flip the sign)
- Why it works: Students understand *why* the flip happens (negative numbers reverse order) instead of just memorizing the rule.

Each concept has a uniquely-named method. It's memorable and teachable: "Use the opposite operation method" is clearer than "remember the rules for inequalities."

#### **Part 4: Graduated Practice Problems (Easy → Medium → Hard)**

Three problems per concept in the learning modules, with deliberate structure:

**Problem 1 (Easy): Direct Application**
- Minimal setup, direct use of the concept
- Example (Pythagorean theorem): "A right triangle has legs of 3 and 4. What's the hypotenuse?"
- Purpose: confirm understanding of the core idea
- Difficulty: 30-40% of students will get this wrong (shows they don't own the concept yet)

**Problem 2 (Medium): Applied to Context**
- Real-world scenario, minor complexity
- Example (Pythagorean theorem): "A ladder is 13 feet long. It leans against a wall and reaches 12 feet up. How far from the wall is the base?"
- Purpose: apply the concept to something that looks different
- Difficulty: 50-60% accuracy (requires one transfer step)

**Problem 3 (Hard): Multi-step or Unexpected Format**
- Concept is embedded in a more complex problem
- Example (Pythagorean theorem): "Two hikers start at the same point. One walks north 5 miles, the other walks east 12 miles. How far apart are they?" (It's Pythagorean theorem, but students don't see it immediately.)
- Purpose: ensure transfer and robustness
- Difficulty: 60-70% accuracy (requires recognizing the concept in disguise)

**Feedback structure:**
- Problem 1: If correct, brief affirmation. If wrong, re-explain the core idea and retry.
- Problem 2: If correct, "Great—you can apply this in context." If wrong, "You've got the concept, but let's see how it works in this setup."
- Problem 3: If correct, "You own this concept. Hard problems can't trick you now." If wrong, "Hard problems disguise the concept. Let's talk about how to *recognize* it in new formats."

#### **Part 5: The Friendly Recap (Before Next Practice Set)**

Before launching into the next concept, Wayfinder reminds students of what they struggled with:

"**Last time:** You solved 4 quadratic equations. Two of them you factored, two you used the quadratic formula. You were faster with factoring, so you wanted to use it for everything—but one equation didn't factor nicely, so you struggled.

**Key insight:** Factoring is fast *when it works*. Quadratic formula *always works*. Pick the right tool for the equation.

**This time:** We're giving you 5 quadratics. Some factor cleanly. Some don't. See if you can decide which method to use *before* trying to solve."

This recap:
- Builds confidence (you succeeded last time)
- Reminds of the key insight (the aha moment)
- Sets up the next challenge with context
- Reduces anxiety (you're not starting from scratch; you're building)

---

### 3.2 Concept Clustering

Some concepts are deeply related. Wayfinder doesn't teach them sequentially; it teaches them as clusters:

**Example Cluster: Functions & Transformations**
- Linear functions (y = mx + b)
- Quadratic functions (y = ax² + bx + c)
- Exponential functions (y = ab^x)
- How transformations work (vertical shift, horizontal shift, stretches)
- Why the transformations are *the same* across all three types

Most students see these as separate topics. Wayfinder reveals the deep structure: "All these follow the same transformation rules because they're all functions. Once you own the pattern, all three get easier."

**Example Cluster: Solving Equations**
- Linear equations
- Quadratic equations
- Exponential equations
- Systems of equations
- Inequalities

The connection: "Solving is about isolating the variable. The steps look different, but the *thinking* is the same. When you solve a quadratic vs. a linear, you're doing the same thing with different tools."

Concept clustering is visualized in the student dashboard: "These 4 concepts are related. You've mastered 2 of them. Mastering all 4 unlocks a cluster badge."

---

## 4. SAT/ACT CONTENT COVERAGE MAPPING

### 4.1 SAT Math (35 Concept Nodes)

The Digital SAT (since March 2024) is ~70 minutes, 35 questions, no calculator section, adaptive difficulty.

**Algebra & Equations (8 concepts)**
1. Linear equations (solving ax + b = c variations)
2. Systems of equations (substitution vs. elimination strategy)
3. Inequalities & absolute value (solving and graphing)
4. Quadratic equations (factoring, formula, completing the square—when each?)
5. Linear inequality systems and boundary lines
6. Function notation and evaluation
7. Polynomials (addition, multiplication, long division)
8. Rational expressions (simplification, solving)

**Advanced Functions (7 concepts)**
9. Exponential functions (growth/decay, real-world applications)
10. Quadratic function properties (vertex, axis of symmetry, transformations)
11. Function transformations (vertical/horizontal shifts, stretches)
12. Composition and inverse functions
13. Piecewise functions (reading and interpreting)
14. Radical equations and functions
15. Logarithmic functions (definition and properties)

**Problem Solving & Data (8 concepts)**
16. Ratios & proportions (the unitary method)
17. Percentages & percent change (the trap)
18. Speed, rate, and time problems
19. Probability (basic and compound events)
20. Statistics (mean, median, mode, standard deviation—when each?)
21. Data interpretation (graphs, charts, tables)
22. Correlation vs. causation (reading scatterplots)
23. Counting principles (combinations and permutations when to use each)

**Geometry & Trigonometry (12 concepts)**
24. Angles and angle relationships (vertical, complementary, supplementary)
25. Triangles (congruence, similarity, area, special right triangles)
26. Circles (area, circumference, arc length, sector area, inscribed angles)
27. Polygons (interior angles, regular polygons, area)
28. 3D geometry (volume, surface area of prisms, cylinders, spheres)
29. Pythagorean theorem and distance formula
30. Coordinate geometry (slope, parallel/perpendicular lines, distance)
31. Equation of a line (slope-intercept, point-slope forms)
32. Transformations (translation, rotation, reflection, dilation)
33. Right triangle trigonometry (SOH-CAH-TOA in context)
34. Angle measurement (degrees and radians)
35. Special triangles (30-60-90, 45-45-90, golden ratio insights)

---

### 4.2 SAT Reading & Writing (25 Concept Nodes)

The Digital SAT Reading & Writing is ~64 minutes, 52 questions, mixed format (standalone + paired questions).

**Vocabulary & Context (4 concepts)**
1. Vocabulary in context (it's NEVER about knowing obscure words—always context clues)
2. Word choice and tone implications
3. Synonym vs. exact meaning (why "walking" ≠ "striding")
4. Metaphor and figurative language in context

**Information & Ideas (7 concepts)**
5. Main idea vs. supporting detail (hierarchy)
6. Central claim and thesis
7. Evidence-based questions (paired question strategy—evidence gives the answer)
8. Inference vs. stated information (what the text implies vs. what it says)
9. Author's purpose and rhetorical strategy
10. Text structure (compare/contrast, cause/effect, chronological, problem/solution)
11. Synthesis across multiple sources/passages

**Expression of Ideas (5 concepts)**
12. Transitions and logical connectors
13. Conciseness (shorter is better, eliminate redundancy)
14. Sentence variety and combining sentences
15. Rhetorical effectiveness (does it support the author's point?)
16. Data integration (reading charts/graphs within a passage)

**Standard English Conventions (9 concepts)**
17. Subject-verb agreement (singular vs. plural, tricky cases)
18. Pronoun reference and agreement (she/her/they, ambiguous antecedents)
19. Verb tense consistency
20. Comma rules (4 rules that cover 90% of questions)
21. Semicolon and colon usage
22. Parallelism (lists and paired structures)
23. Modifier placement (dangling, misplaced, squinting modifiers)
24. Apostrophes and possessives
25. Run-ons and fragments

---

### 4.3 ACT-Specific Additions (15 concepts)

The ACT is 3 hours, 215 questions, multiple sections: English, Math, Reading, Science.

**ACT Math Unique (3 concepts)**
- Matrices (basic operations)
- Logarithms in different bases
- Trigonometric identities

**ACT English (Mechanics & Rhetoric) (6 concepts)**
- Comma usage (ACT style, slightly different from SAT)
- Transition words and sentence combining
- Organization (where sentences belong in paragraphs)
- Rhetorical effectiveness in context
- Verb tense across paragraphs
- Pronoun consistency

**ACT Science Reasoning (6 concepts, entirely unique)**
- Reading data from tables and graphs
- Interpreting experimental results
- Comparing scientific models
- Identifying variables (independent, dependent, control)
- Conflicting viewpoints (comparing two hypotheses)
- Extrapolation and trend prediction

---

## 5. SCORING & ANALYTICS ARCHITECTURE

### 5.1 Concept Mastery Scoring

Each concept is scored 0-100% based on:

- **Accuracy:** All problems on that concept, weighted by difficulty
- **Consistency:** Do they nail it once or repeatedly?
- **Speed:** Can they solve it quickly, or are they struggling?

**Formula (simplified):**
```
Concept Mastery % = (Easy accuracy × 0.25) + (Medium accuracy × 0.35) + (Hard accuracy × 0.40)
```

Students need:
- 75%+ on a concept to advance
- 90%+ to unlock the advanced variant
- <60% triggers automatic reteaching

### 5.2 Predicted Score Calculation

The system calculates a predicted SAT/ACT score based on mastery:

**SAT Prediction Model:**
- Math: Concepts 1-35 map to ~35-40 questions on the test
- Each mastery % predicts probability of getting that category right
- Weighted by test frequency (common topics weighted higher)
- Confidence interval: ±30-50 points (wider after diagnostic, narrower after Practice Test 2)

**Example calculation:**
- Student masters: Algebra 92%, Advanced Functions 68%, Problem Solving 85%, Geometry 71%
- Math section predicted score: 1100-1150 (out of 1600 total)
- After Practice Test 1, confidence interval narrows

### 5.3 Progress Dashboard

Students see:

1. **Concept Mastery Grid**
   - All 60 concepts (SAT) or 75 (ACT)
   - Color-coded: Red (0-50%), Yellow (50-75%), Green (75%+)
   - Sortable: by mastery, by test frequency, by difficulty

2. **Predicted Score Range**
   - Updated after every practice test and reteaching session
   - Timeline: "Based on progress, you'll be ready for test day in 6 weeks."
   - Comparison: "You've improved 78 points since the diagnostic."

3. **Time Analytics**
   - Total study time logged
   - Time per concept (which areas are you spending most time on?)
   - Efficiency: hours studied vs. score improvement
   - Benchmark: "Average student spends 35 hours to improve 100 points. You're at 28 hours for +110 points. Well done."

4. **Speed vs. Accuracy Profile**
   - Students who are fast but inaccurate need different coaching than slow but accurate
   - Dashboard alerts: "You're rushing. You've solved 8/10 quickly but only got 6 right. Slow down on hard problems."

5. **Practice Test Trends**
   - Test 1 vs. Test 2: which sections improved most
   - Concept-by-concept: "SAT Math percentiles: Algebra 91st, Geometry 73rd. Focus on geometry next."

---

## 6. PRICING, ACCESS & PAYMENT ARCHITECTURE

### 6.1 Pricing Strategy

- **One-time purchase: $100 USD**
  - No subscription (eliminates churn)
  - No upsells (simple, transparent)
  - Perpetual access (student can use it years later if they take the test twice)

- **Access tiers:**
  - Coach subscribers: included or bundled discount ($70 for coaches)
  - Consultant subscribers: included or separate purchase
  - Standalone buyers: $100

- **Bundle options:**
  - SAT-only prep: $100 (or $60 for Coach subscribers)
  - ACT-only prep: $100 (or $60 for Coach subscribers)
  - SAT + ACT combo: $150 (or $100 for Coach subscribers)

### 6.2 Payment Integration

- **Stripe integration:** Same as existing Wayfinder payments
- **Billing:** One-time charge at purchase
- **Access:** Immediately unlocked after payment confirmation
- **Invoice:** Emailed to student/parent
- **Refund policy:** 14-day full refund if purchase made in error (no chargeback disputes)

### 6.3 Licensing & Access Control

- **Purchase tied to user account**
  - Once purchased, content accessible via login forever
  - No device limit (can access on phone, tablet, laptop)
  - Offline mode (downloadable notes, but quizzes require internet)

- **Transferability:** Non-transferable (one person buys, one person uses)

- **Multi-account households:** Parents can gift purchase to student account, or each student needs separate purchase

---

## 7. TECHNICAL IMPLEMENTATION NOTES

### 7.1 Data Schema

**Progress tracking (backend/data/users/{userId}/sat-act/):**
```
{
  purchaseDate: "2026-03-15",
  testType: "SAT" | "ACT" | "BOTH",
  currentModule: 1-8,
  conceptMastery: {
    concept_1: { accuracy: 0.85, lastAttempt: "2026-03-18", attempts: 7 },
    concept_2: { accuracy: 0.62, lastAttempt: "2026-03-17", attempts: 3 },
    ...
  },
  practiceTests: [
    {
      testId: "pt1_20260318",
      date: "2026-03-18",
      predictedScore: 1260,
      scoreConfidence: 50,
      sectionScores: { math: 650, readingWriting: 610 }
    }
  ],
  personalizedPlan: [
    { rank: 1, concept: "Algebra", status: "in_progress", priority: "WEAK_FOUNDATION" },
    { rank: 2, concept: "Systems", status: "pending", priority: "WEAK_FOUNDATION" },
    ...
  ],
  totalStudyHours: 18.5
}
```

### 7.2 Content Delivery

- **Learning modules:** Markdown + interactive React components
- **Concept explanations:** SLM-generated (but templated and reviewed)
- **Practice problems:** Vetted SAT/ACT problems, metadata-tagged by concept
- **Video explanations:** Optional (SLM-generated, 2-3 min per concept)
- **Quiz engine:** Interactive JSON-based format, timed, immediate feedback

### 7.3 SLM Integration

The Claude SLM is used for:

1. **Diagnostic generation:** Creates the 60-question diagnostic tailored to the student's grade/test preference
2. **Personalized plan:** Ranks concepts by mastery and test frequency
3. **Concept explanations:** Generates intuitive, real-world explanations (reviewed for quality)
4. **Feedback generation:** Personalized coaching based on student performance
5. **Reteaching content:** When a student falls below 75%, SLM generates alternative explanations
6. **Recap generation:** Auto-generated "friendly recaps" before each practice set
7. **Score predictions:** Bayesian model predicting test day score from practice test data

### 7.4 Progress Persistence

- Progress saved to database after every action (quiz completion, module unlock, etc.)
- No loss of data if session interrupted
- Sync across devices: if student starts on phone, can resume on laptop

### 7.5 Quality Assurance

- All SLM-generated content reviewed by content team before launch
- Practice problems sourced from verified SAT/ACT prep banks
- A/B testing: different coaching styles to see what works best
- Analytics: which modules see highest completion, which concepts take longest

---

## 8. SUCCESS METRICS & GROWTH PROJECTIONS

### 8.1 Engagement KPIs

- **Module completion rate:** Target 85%+ of students complete all 8 modules
- **Time-to-completion:** Median 8-10 weeks start to finish
- **Practice test retakes:** 40%+ of students retake the actual SAT/ACT (proof of motivation)
- **Score improvement:** Average +85 points (from diagnostic to Practice Test 2)

### 8.2 Revenue Projections (Year 1)

- **Conservative:** 500 purchases @ $100 = $50k
- **Moderate:** 1,200 purchases @ $100 = $120k
- **Optimistic:** 2,500 purchases @ $100 = $250k

(Assumes 10-25% of Coach subscribers purchase; 5-15% of standalone)

### 8.3 User Feedback Targets

- NPS (Net Promoter Score): Target 50+ (very good for educational software)
- Concept clarity: "I understood the concept" should be >85% for each module
- Confidence improvement: "I feel more confident about the SAT/ACT" >80% pre-to-post

---

## 9. COMPETITIVE DIFFERENTIATION

| Feature | Khan Academy | Kaplan | Princeton Review | **Wayfinder** |
|---------|--------------|--------|------------------|--------------|
| Cost | Free | $300-800 | $300-600 | **$100 one-time** |
| Concept-based learning | Partial | Weak | Weak | **Strong** |
| Personalized plan | No | Yes (generic) | Yes (generic) | **AI-generated, adaptive** |
| Real-world explanations | Some | Rare | Rare | **All** |
| Friendly recaps | No | No | No | **Yes** |
| Sequential modules | No | No | No | **Yes (anti-churn)** |
| Integration with Wayfinder | No | No | No | **Yes** |

---

## 10. LAUNCH ROADMAP

**Phase 1 (March-April 2026):** Content Development
- SAT math concepts 1-15 (algebra, functions)
- SAT reading/writing concepts 1-10
- Diagnostic assessment design
- SLM prompt engineering for explanations

**Phase 2 (May 2026):** Beta Testing
- Closed beta with 50 Wayfinder Coach subscribers
- Gather feedback on concept clarity, pacing, engagement
- Iterate on SLM prompts

**Phase 3 (June 2026):** Full Launch
- Complete SAT content (all 60 concepts)
- Launch ACT content (75 concepts)
- Live payment integration
- Marketing push to Coach subscribers

**Phase 4 (July-August 2026):** Growth & Optimization
- Monitor completion rates, score improvements, NPS
- A/B test engagement strategies
- Add optional video explanations
- Expand to high school partnerships

---

## 11. CONCLUSION

The Wayfinder SAT/ACT Adaptive Prep Module solves a critical gap in test prep: students know what they got wrong, but not *why*. By identifying concept gaps and teaching through intuition before practice, we create a learning experience that's both more effective and more humane than traditional test prep.

The $200 one-time price eliminates the subscription model's perverse incentive to keep students dependent on study materials. The sequential module structure keeps students engaged through completion. And the concept-based approach produces real score improvements (85-120 points) in 8-10 weeks.

This isn't just another test prep tool. It's Wayfinder's commitment to demystifying test prep and helping students succeed with clarity and confidence.

---

## ADDENDUM: THE 5+5 EXAM SYSTEM (Updated Architecture)

### The Core Loop: 5 Full-Length + 5 Targeted Practice Sets

The module delivers **10 total practice experiences** in a strict sequential flow:

```
Exam 1 (Full-Length, Regulation) → Intelligence Report 1 → Targeted Practice Set 1
    ↓
Exam 2 (Full-Length, Regulation) → Intelligence Report 2 → Targeted Practice Set 2
    ↓
Exam 3 (Full-Length, Regulation) → Intelligence Report 3 → Targeted Practice Set 3
    ↓
Exam 4 (Full-Length, Regulation) → Intelligence Report 4 → Targeted Practice Set 4
    ↓
Exam 5 (Full-Length, Regulation) → Intelligence Report 5 → Targeted Practice Set 5
    ↓
Final Assessment Report + Score Trajectory + Recommendations
```

### Full-Length Exams (5)
- Match official SAT/ACT format exactly (timing, question count, section structure)
- Digital SAT: 2 modules of Reading/Writing (54 questions) + 2 modules of Math (44 questions)
- ACT: English (75 questions), Math (60), Reading (40), Science (40)
- Timed with official time limits
- Adaptive within sections (matching real Digital SAT behavior)

### Intelligence Reports (5)
After each full-length exam, the student receives a personalized report:

1. **Score Breakdown** — Overall, section-by-section, predicted official score range
2. **Concept Map** — Visual showing which concept clusters they've mastered (green), are close on (yellow), and are struggling with (red)
3. **The "Why" Analysis** — Not "you got Q14 wrong." Instead: "You missed 4 questions across the test that all test the concept of RATE-OF-CHANGE. Here's what's happening: you're confusing total change with rate. Let me explain the difference with a real example..."
4. **Improvement Priority Stack** — Ranked list: "If you master these 3 concepts, your score jumps 60-80 points. Here they are in order of impact."
5. **Comparison to Previous** — Progress tracking: "Last exam you missed 7 rate problems. This time you missed 3. You're on the right track. Here's what's still tripping you up."
6. **Emotional Check-In** — "Your score went up 40 points from Exam 1. That's real progress. The areas still in red? Those are exactly what your next practice set targets."

### Targeted Practice Sets (5)
Each practice set is CUSTOM GENERATED based on that student's specific Intelligence Report:

- **NOT a random practice test** — every question targets a concept the student is struggling with
- **Graduated difficulty**: first 30% are foundation-level (build confidence), middle 40% are exam-level, final 30% are stretch (harder than actual test)
- **Concept clustering**: questions are grouped by concept with a brief "Friendly Reminder" header before each cluster:
  - "Remember: Last time you mixed up rate vs. total. The key insight: rate is always PER UNIT. When you see 'per hour' or 'for every,' that's your signal to divide, not multiply."
- **Length**: ~40-50 questions (shorter than full exam, more focused)
- **Timed but gentler**: slightly more time per question than the real test (building mastery before speed)

### Sequential Unlock Logic
```
Must complete Exam 1 → unlocks Report 1 → must review Report 1 → unlocks Practice Set 1
Must complete Practice Set 1 → unlocks Exam 2 → and so on...
```
Students CANNOT skip ahead. This ensures:
- They actually learn from each report before taking the next exam
- They can't bulk-download content (each practice set is dynamically generated)
- Engagement stays high through the full 10-step journey

### Why This Is Unshareable / Piracy-Proof
The value is NOT in the questions (those are commodities). The value is:
- The **Intelligence Report** is generated from THEIR specific answers
- The **Targeted Practice Set** is generated from THEIR specific concept gaps
- The **Friendly Reminders** reference THEIR specific mistakes from THEIR previous test
- If you share your practice set with a friend, it won't help them — it targets YOUR gaps, not theirs

---

## ADDENDUM: VOCABULARY HACKER MODULE

### The Problem with Traditional Vocab Prep
Every existing program: "Here are 500 words. Memorize them. Quiz on Friday."

Result: Students cram, pass the quiz, forget 80% within 2 weeks. Zero retention. Zero transfer to actual test performance.

### Wayfinder's Vocabulary Hacker: Retention-Optimized, Personalized

#### How It Works

**Step 1: Diagnostic Vocabulary Assessment**
- Pulled from the student's full-length exam performance
- Identifies not just "words they don't know" but "types of vocabulary they struggle with"
- Categories: academic tone words, context-shift words, discipline-specific terms, connotation vs denotation

**Step 2: Custom Weekly Word Set (20 words)**
- Generated based on the student's specific gaps + most frequently tested words on upcoming exam
- NOT random words from a master list
- Prioritized by: (a) frequency on SAT/ACT, (b) student's demonstrated weakness, (c) difficulty level appropriate to their current score

**Step 3: The Retention-Optimized Learning Flow**
For each word, the student gets:

1. **The Word + Definition** (plain language, not dictionary-speak)
2. **The Context Sentence** — how it actually appears on the SAT (in-passage context)
3. **The Memory Hook** — a vivid, memorable association or story
   - Example: "EPHEMERAL means lasting a very short time. Think: Snapchat stories are ephemeral — they disappear in 24 hours."
4. **The Trap** — how the SAT tries to trick you with this word
   - Example: "SANCTION can mean BOTH 'to approve' AND 'to punish.' The SAT loves testing words with contradictory meanings."
5. **The Word Family** — related words that build vocabulary networks
   - Example: "EPHEMERAL → TRANSIENT → FLEETING → EVANESCENT (all mean 'short-lived' but at different formality levels)"

**Step 4: Spaced Repetition Testing**
- Day 1: Learn 20 words
- Day 3: Quick recall quiz (context-based, not just definitions)
- Day 7: Mixed quiz (old words + new context)
- Day 14: Retention check (only words they got wrong come back)
- Day 30: Final retention verification

The system doesn't progress to the next set of 20 until the student demonstrates **80% retention** on the current set. This prevents the "learn and forget" cycle.

**Step 5: Dynamic Adjustment After Each Exam**
After each full-length practice exam:
- New vocabulary gaps identified from reading passages
- Word sets adjusted to target newly identified weaknesses
- Words from previous sets that appeared in the exam are flagged (reinforcement)
- Difficulty calibrates up as the student progresses

#### Retention Science Behind the Design
- **Spaced repetition** (Ebbinghaus curve): reviewing at expanding intervals maximizes retention
- **Contextual learning**: words learned in context are retained 3x better than isolated definitions
- **Emotional anchoring**: vivid memory hooks create stronger neural pathways
- **Active recall**: testing yourself is more effective than re-reading definitions
- **Interleaving**: mixing old and new words prevents interference

#### UI/UX Design Principles
- **Swipe interface**: card-based, mobile-friendly (students study on phones)
- **Progress bar**: visual completion tracking per set
- **Streak counter**: "7-day streak! Keep going!" (gamification without being childish)
- **Audio pronunciation**: hear the word spoken correctly
- **"Mark as known"**: if a student already knows a word, they can skip it (respects their time)
- **Weekly summary email**: "You learned 18/20 words this week. 2 need review. Here they are."

#### Integration with the 5+5 Exam System
- Vocabulary module runs ALONGSIDE the exam progression
- After Exam 1 → first vocab set generated from exam vocabulary gaps
- After Exam 2 → vocab set adjusts based on progress + new gaps
- By Exam 5 → student has worked through 100-200 targeted vocabulary words with verified retention
- This alone could account for a 30-50 point Reading score improvement

---

**Document Version:** 2.0
**Last Updated:** 2026-03-19
**Owner:** Wayfinder Product Team
