/**
 * WAYFINDER ESSAY DEEP INTELLIGENCE — DISTILLATION PROMPTS
 *
 * This is the expanded essay brain architecture for the Admissions SLM.
 * These prompts generate the deep knowledge that makes Wayfinder's essay
 * coaching feel like a $10K private consultant, not a chatbot.
 *
 * Architecture:
 *   Layer E1: Diagnostic Intelligence (identify WHAT's wrong and WHY)
 *   Layer E2: School-Specific Essay Decoding (229+ schools)
 *   Layer E3: Supplemental Essay Mastery (the overlooked battleground)
 *   Layer E4: Worked Examples & Calibration (show, don't just tell)
 *   Layer E5: Edge Case Coaching (first-gen, international, trauma, limited experience)
 *   Layer E6: Process & Timeline Management (the logistics of 10+ applications)
 *   Layer E7: Essay Ecosystem Strategy (how all essays work together)
 *
 * Run via: node backend/distillation/distill.js --prompts=essay-deep
 */

// ============================================================
// LAYER E1: DIAGNOSTIC INTELLIGENCE
// "Your essay isn't working because..." — the decision tree layer
// ============================================================

const essayDiagnosticPrompts = [
  {
    id: 'essay-diagnostic-decision-tree',
    layer: 'essay-deep',
    title: 'Essay Diagnostic Decision Tree',
    prompt: `You are the head of essay coaching at a top admissions consulting firm that charges $15,000 per student. Your coaches need a diagnostic framework — a decision tree — that lets them read any college essay draft and identify EXACTLY what's wrong and what intervention to apply.

Create a comprehensive diagnostic decision tree for college application essays.

## TIER 1: THE INITIAL READ (First 30 seconds)
For each diagnostic question, specify:
- What to look for (specific textual signals)
- What it means when it's present vs. absent
- Which intervention to apply

Questions:
1. Does the essay have a SPECIFIC moment, scene, or story? (vs. abstract reflection)
2. Can you hear a distinct human voice in the first paragraph? (vs. generic/adult/AI tone)
3. Is there a clear "so what"? Does the reader know why this matters to the writer?
4. Does it surprise you at least once? (unexpected turn, insight, detail)

## TIER 2: STORY-LEVEL DIAGNOSIS (If the story itself is the problem)
Create diagnostic pathways for:
- The "nothing happened" essay (student picked a boring topic)
- The "everything happened" essay (student is trying to cover too much)
- The "wrong story" essay (student picked a safe topic instead of the real one)
- The "someone else's story" essay (parent/counselor clearly influenced topic choice)
- The "trauma dump" essay (powerful experience but no reflection or growth)
- The "humble brag" essay (achievement-focused disguised as reflection)
- The "lesson learned" essay (predictable moral at the end)

For each: diagnostic signals, root cause, coaching intervention (specific questions to ask the student), and example of how to redirect.

## TIER 3: EXECUTION-LEVEL DIAGNOSIS (Good story, weak execution)
Create diagnostic pathways for:
- Weak opening (generic, cliché, or buried lead)
- Missing scene-setting (tells instead of shows)
- Underdeveloped reflection (story without meaning)
- Overdeveloped reflection (too much telling, not enough story)
- Voice collapse (starts authentic, becomes formal/stiff midway)
- Structural confusion (reader gets lost)
- Weak ending (trails off, cliché conclusion, forced lesson)
- Word count problems (too long/short, padding, compression needed)

## TIER 4: SCHOOL-FIT DIAGNOSIS (Good essay, wrong school)
- How to diagnose when an essay is well-written but wrong for the target school
- Calibration mismatches (too casual for Princeton, too formal for Brown)
- "Why Us" essays that could be about any school
- Supplementals that repeat the personal statement

## THE DIAGNOSTIC OUTPUT FORMAT
For each diagnosis, the coach should produce:
1. PRIMARY ISSUE: [one sentence]
2. ROOT CAUSE: [why this happened]
3. SEVERITY: [1-5, where 5 = needs complete rewrite]
4. INTERVENTION: [specific coaching action]
5. COACHING QUESTIONS: [3-5 questions to ask the student]
6. SUCCESS SIGNAL: [how to know the revision fixed it]

Make this extremely practical. A coach should be able to read an essay, walk through this tree in 5 minutes, and know exactly what to say to the student.

Format as structured markdown with clear decision paths.`
  },
  {
    id: 'essay-diagnostic-failure-patterns',
    layer: 'essay-deep',
    title: 'Essay Failure Pattern Recognition',
    prompt: `You are analyzing the 50 most common failure patterns in college application essays. For each pattern, create a profile that a coach or AI can use to instantly recognize the problem and apply the right fix.

## FORMAT FOR EACH PATTERN:

**Pattern Name:** [memorable, descriptive name]
**Frequency:** [how often this appears — e.g., "40% of first drafts"]
**What It Looks Like:** [2-3 specific textual signals a reader would notice]
**Why Students Do This:** [the underlying psychology]
**Why It Fails:** [what AOs think when they read it]
**The Fix:** [specific coaching intervention]
**Before/After Signal:** [what the essay looks like before vs. after fixing]

## PATTERNS TO COVER:

**Story Selection Failures (10 patterns):**
1. The Resume Essay — listing accomplishments as narrative
2. The Trophy Case — essay about winning/awards
3. The Volunteer Tourism Essay — mission trip or community service that centers the writer's feelings
4. The Sports Metaphor — using athletics as life lesson
5. The Dead Relative Essay — grief used as admissions strategy
6. The "I'm So Passionate" Essay — claims of passion without evidence
7. The Safe Choice — deliberately bland topic to avoid risk
8. The Wikipedia Essay — writes about a topic, not about themselves
9. The "My Identity" Essay — reduces self to one demographic label
10. The Adult's Essay — clearly written by parent/counselor

**Execution Failures (10 patterns):**
11. The Thesaurus — overwrites to sound impressive
12. The Preach — ends every paragraph with a moral lesson
13. The List — covers 5 things shallowly instead of 1 thing deeply
14. The Hedge — qualifies every statement, never commits
15. The Time Machine — jumps through years without landing anywhere
16. The Mirror — describes looking in a mirror or watching oneself
17. The Dictionary — opens with "Webster's defines X as..."
18. The AI Essay — suspiciously polished, no genuine voice
19. The Run-On Narrative — one long story with no reflection breaks
20. The Reflection Trap — all analysis, no actual story or scene

**Voice Failures (5 patterns):**
21. The Chameleon — changes voice based on perceived audience
22. The Adult Impersonator — 17-year-old writing like a 45-year-old
23. The Emoji Writer — too casual, no intellectual depth shown
24. The Robot — technically perfect but emotionally dead
25. The Performer — performing emotion rather than expressing it

**Strategic Failures (5 patterns):**
26. The Carbon Copy — same essay sent to every school
27. The Name Drop — "Why Us" essay that just lists school features
28. The Wrong Fit — essay tone mismatched to school culture
29. The Repeat — supplemental says same thing as personal statement
30. The Overreach — tries to connect every activity to one grand theme

Be brutally specific. A coach reading this should be able to say "ah, this is Pattern #14" within 30 seconds.

Format as structured markdown.`
  },
  {
    id: 'essay-scoring-calibration',
    layer: 'essay-deep',
    title: 'Essay Scoring Calibration & Rubric',
    prompt: `Create a comprehensive essay scoring calibration system for Wayfinder's essay review service. This needs to ensure consistency — whether a student gets reviewed on Monday or Friday, by AI or human coach, the score should mean the same thing.

## THE 1-10 SCALE WITH ANCHOR DESCRIPTIONS

For each score level (1 through 10), provide:
- **Score meaning** in one sentence
- **What an AO would think** reading this essay
- **Textual markers** (specific things you'd see in the writing)
- **Admissions impact** (how this essay affects the application)
- **Percentage of essays at this level** (realistic distribution)

Score Distribution Reality:
- 1-3: Weak (needs fundamental rework) — ~15% of submitted essays
- 4-5: Below average to average (functional but forgettable) — ~40%
- 6-7: Good (competitive at most schools) — ~30%
- 8-9: Excellent (stands out in committee) — ~12%
- 10: Exceptional (gets read aloud in admissions committee) — ~3%

## SUB-SCORING DIMENSIONS

Create 5 sub-scores that add up to the overall impression:
1. **Story/Content** (weight: 30%) — Is there a compelling story or insight?
2. **Voice/Authenticity** (weight: 25%) — Does it sound like a real person?
3. **Reflection/Depth** (weight: 20%) — Does the writer show self-awareness?
4. **Structure/Craft** (weight: 15%) — Is it well-organized and compelling to read?
5. **School Fit** (weight: 10%) — Does it work for the target institution?

For each dimension, describe what a 3, 5, 7, and 9 look like with specific observable markers.

## CALIBRATION EXERCISES

Create 5 brief essay excerpts (100-150 words each, FICTIONAL — do not reproduce real essays) at different quality levels. For each:
- The excerpt itself (fictional but realistic)
- The correct score with justification
- Common scoring errors (why a coach might mis-score it)
- The key diagnostic — what moves this from its current score to the next level

Levels to demonstrate:
- A 3/10 essay excerpt
- A 5/10 essay excerpt
- A 7/10 essay excerpt
- A 8/10 essay excerpt
- A 9/10 essay excerpt

## SCORE COMMUNICATION FRAMEWORK

How to communicate scores to students without crushing them:
- Never lead with the number
- Frame every score as a starting point, not a judgment
- The "strength-first" feedback format
- How to explain a 4/10 to a student who thinks they're a 9
- How to push a 7/10 student to try for 9 without implying their essay is bad

Format as structured markdown.`
  },
];

// ============================================================
// LAYER E2: SCHOOL-SPECIFIC ESSAY DECODING (229+ schools)
// Generated per-school, but the META-PROMPT is here
// ============================================================

const essaySchoolSpecificPrompts = [
  {
    id: 'essay-school-decoding-template',
    layer: 'essay-deep',
    title: 'School-Specific Essay Decoding (Template)',
    isTemplate: true, // Signal to the generator: run this for each school
    prompt: `You are a top admissions consultant who has successfully guided 500+ students into {SCHOOL_NAME}. Create the definitive essay strategy guide for this specific institution.

## SCHOOL ESSAY PHILOSOPHY
What does {SCHOOL_NAME} actually value in essays? Not what they say publicly — what their admitted students' essays actually reveal about institutional priorities.

- Core value signal: What ONE quality does this school prioritize above all?
- Reading style: How do AOs at this school read essays? (speed readers vs. close readers, committees vs. individual decisions)
- Cultural fit markers: What signals "this student belongs here" in an essay?

## CURRENT ESSAY PROMPTS (2025-2026 CYCLE)
List all required and optional essay/short-answer prompts with:
- The prompt text
- Word limit
- What they're ACTUALLY asking (decoded)
- The trap most applicants fall into
- The approach that works

## THE "WHY {SCHOOL_NAME}" ESSAY
- The #1 mistake applicants make on this school's "Why Us" essay
- The 3 things this school wants to hear (specific programs, opportunities, culture elements)
- The 3 things that make AOs roll their eyes (generic praise, rankings, prestige signaling)
- How to research this school deeply enough to write a genuine supplement
- 2 fictional but realistic example approaches that would work

## SUPPLEMENTAL ESSAY STRATEGY
For each supplemental prompt:
- What the school is screening for
- The winning approach vs. the losing approach
- How this supplemental connects to the rest of the application
- Specific programs, professors, traditions, or opportunities to reference (that most applicants miss)

## ESSAY TONE CALIBRATION
- Where does this school fall on the formality spectrum? (MIT quirky vs. Georgetown polished)
- Can you be funny? Should you be funny?
- How intellectual should the writing be?
- Is vulnerability rewarded or risky here?
- What voice would an AO at this school find authentic vs. try-hard?

## RED FLAGS SPECIFIC TO THIS SCHOOL
- Topics that are overdone for THIS school specifically
- Essay approaches that signal the student doesn't understand the school
- Common demographic-specific mistakes (e.g., international students at this school, legacy applicants)

## EARLY DECISION / EARLY ACTION ESSAY NUANCES
- Does applying early change the essay strategy?
- How to signal genuine first-choice interest without being desperate
- Is there any demonstrated interest factor in essay evaluation?

Format as structured markdown. Be extremely specific to {SCHOOL_NAME} — nothing in this guide should be interchangeable with another school.`
  },
  {
    id: 'essay-supplement-type-mastery',
    layer: 'essay-deep',
    title: 'Supplemental Essay Type Mastery',
    prompt: `Create the definitive guide to every type of supplemental essay a student will encounter across 200+ college applications. Most essay guides focus on the Common App personal statement — but supplementals are where applications are actually won or lost.

## SUPPLEMENT TYPE TAXONOMY

For each supplement type, provide:
- **What it's asking** (decoded from what the prompt says)
- **Why schools ask it** (what they're screening for)
- **The winning formula** (specific structure and approach)
- **The losing formula** (most common failure mode)
- **Word count strategy** (how to handle 100 vs. 250 vs. 500 word limits)
- **Reusability score** (1-5, can this be adapted for multiple schools?)

### Types to cover:

**1. "Why Us?" Essays**
- The short version (100-150 words)
- The medium version (250 words)
- The long version (500+ words)
- How depth changes with word count

**2. "Why This Major?" Essays**
- When you're certain about your major
- When you're undecided (and the school knows it's ok)
- When you're undecided but the school seems to want certainty
- The "intellectual journey" approach vs. the "career goal" approach

**3. Community / Contribution Essays**
- "What will you contribute to our community?"
- "Describe a community you belong to"
- How to be specific without being self-aggrandizing

**4. Diversity / Identity / Background Essays**
- Post-SFFA: what's changed and what hasn't
- How to write about identity without reducing yourself to it
- First-gen essays (what to include, what to avoid)
- Immigration narratives (when they work, when they're overdone)
- LGBTQ+ identity essays (authenticity without making it the whole story)

**5. Intellectual Curiosity / Academic Interest Essays**
- "Tell us about an intellectual experience that excited you"
- "What would you teach a class about?"
- "Describe a problem you'd like to solve"
- The difference between sounding smart and showing genuine curiosity

**6. Quirky / Creative Essays**
- UChicago extended essay tradition
- MIT "describe the world you come from"
- Stanford "letter to your future roommate"
- "List 10 things..." format
- When to take creative risks vs. play it straight

**7. Activity / Extracurricular Elaboration**
- The 150-word activity description box
- How to add dimension without repeating the activities list
- Leadership vs. impact vs. growth framing

**8. Additional Information Section**
- When to use it vs. leave it blank
- Grade explanations, gaps, context
- How to discuss learning disabilities, family circumstances, or hardship
- What AOs actually want to see here vs. what makes them skeptical

**9. Scholarship Essays**
- How they differ from admissions essays
- The "financial need" essay
- The "leadership" essay
- The "community service" essay
- Merit scholarship essays vs. need-based

**10. "Short Takes" / Quick Response**
- The 50-word responses (yes, these matter)
- "Favorite book/movie/song" — what it signals
- "In one sentence, why?" questions
- How to be memorable in 25 words

Format as structured markdown. For each type, include at least one specific example approach (fictional) that demonstrates the technique.`
  },
];

// ============================================================
// LAYER E3: WORKED EXAMPLES & COACHING DEMONSTRATIONS
// ============================================================

const essayWorkedExamplePrompts = [
  {
    id: 'essay-coaching-demonstrations',
    layer: 'essay-deep',
    title: 'Essay Coaching Demonstrations (Before/After)',
    prompt: `Create 8 fictional but hyper-realistic essay coaching demonstrations. Each one shows a student's draft, the coach's diagnostic, the coaching conversation, and the improved version.

These are NOT real essays. Create fictional students and essays that represent common archetypes.

## FORMAT FOR EACH DEMONSTRATION:

**Student Profile:** [brief — grade, background, target schools, personality]
**Essay Type:** [personal statement / Why Us / supplement type]
**Target School:** [specific school if relevant]

**DRAFT (150-200 words of the key section, not full essay):**
[The problematic section of the essay]

**DIAGNOSTIC:**
- Primary issue: [from the diagnostic decision tree]
- Pattern match: [which failure pattern from the failure patterns guide]
- Score: [current score on 1-10 scale]
- Root cause: [why the student wrote it this way]

**COACHING CONVERSATION:**
[3-4 exchange dialogue showing how the coach guides the student to see the problem and discover the fix — using questions, not instructions]

**REVISED SECTION (150-200 words):**
[The same section after coaching — showing concrete improvement]

**WHAT CHANGED & WHY:**
- Score improvement: [before → after]
- Key moves: [2-3 specific changes and why they work]

## THE 8 DEMONSTRATIONS:

1. **The Resume Rewriter** — High-achieving student listing accomplishments. Transform into genuine reflection.
2. **The Overedited Essay** — Parent clearly rewrote the student's voice. Recover authentic teen voice.
3. **The Trauma Dump** — Powerful experience but no reflection. Add depth without minimizing the experience.
4. **The Generic "Why Us"** — Could be about any school. Make it genuinely school-specific.
5. **The Safe Choice** — Student chose a boring topic to avoid risk. Help them find the real story.
6. **The Brilliant but Unfocused** — Great writer, too many ideas. Focus and deepen.
7. **The First-Gen Student** — Powerful story but told through a deficit lens. Reframe toward agency and strength.
8. **The 150-Word Supplement** — Student can't be substantive in short format. Demonstrate compression with depth.

Each demonstration should feel like eavesdropping on a real coaching session. The coaching questions should be ones that help the student discover the answer themselves.

Format as structured markdown.`
  },
  {
    id: 'essay-before-after-library',
    layer: 'essay-deep',
    title: 'Essay Technique Before/After Library',
    prompt: `Create a library of 20 before/after transformations demonstrating specific essay writing techniques. Each one isolates a SINGLE technique and shows how it changes the writing.

These are all FICTIONAL examples — realistic but not from real essays.

## FORMAT:

**Technique:** [name]
**Before:** [2-3 sentences demonstrating the weak version]
**After:** [same content transformed using the technique]
**What Changed:** [1 sentence explaining the specific move]
**When to Use:** [which essay types/situations call for this technique]

## TECHNIQUES TO DEMONSTRATE:

**Opening Moves (5):**
1. The Zoom-In Open (start with a specific sensory detail, not a broad statement)
2. The In Medias Res (drop into the middle of a scene)
3. The Contradiction Open (juxtapose two unexpected things)
4. The Quiet Open (understated beginning that draws the reader in)
5. The Question Open (genuine question, not rhetorical)

**Show Don't Tell (5):**
6. Emotion through action (instead of "I was nervous," show the physical manifestation)
7. Character through dialogue (reveal personality through what someone says)
8. Setting through sensory detail (make the reader see/hear/smell the scene)
9. Growth through contrast (show the before and after without stating "I grew")
10. Values through choices (show what matters to you through a decision, not a declaration)

**Reflection & Depth (5):**
11. The Pivot Sentence (the moment the essay shifts from story to meaning)
12. The Complication (adding nuance: "but it wasn't that simple...")
13. The Honest Doubt (showing genuine uncertainty or unresolved tension)
14. The Connection (linking a small moment to a larger pattern or value)
15. The Forward Look (ending with possibility, not conclusion)

**Compression & Precision (5):**
16. The One-Sentence Scene (conveying a full moment in 20 words)
17. The Specific Detail (replacing "a lot" with "27 hours" or "Tuesday at 4am")
18. The Active Voice Swap (passive → active for energy)
19. The Clause Cut (removing every word that doesn't earn its place)
20. The Resonant Ending (final sentence that echoes through the reader's memory)

Format as structured markdown. Each before/after should be a standalone, instantly usable teaching example.`
  },
];

// ============================================================
// LAYER E4: EDGE CASE COACHING
// ============================================================

const essayEdgeCasePrompts = [
  {
    id: 'essay-edge-case-coaching',
    layer: 'essay-deep',
    title: 'Edge Case Essay Coaching Guide',
    prompt: `Create the definitive guide for coaching essays from students who don't fit the "standard" applicant profile. These are the students that generic essay advice fails — and where Wayfinder can provide enormous value.

## FIRST-GENERATION COLLEGE STUDENTS
- Common essay traps: deficit narrative ("I overcame poverty"), savior narrative ("I'll be the first to make it"), family guilt
- The reframe: agency, curiosity, and what they'll bring — not what they lack
- How to discuss family context without poverty tourism
- Navigating the "additional information" section for family circumstances
- First-gen-specific supplemental strategies
- Cultural code-switching in essay voice: when formal writing IS their authentic voice

## INTERNATIONAL STUDENTS
- Writing in a second language: when to embrace accent/idiom vs. when to polish
- Cultural context that American AOs won't understand (explain without over-explaining)
- The visa/immigration anxiety: how it seeps into essays and how to manage it
- Country-specific patterns that AOs see too often (the Indian competition essay, the Chinese piano essay, the Korean sacrifice essay)
- When cultural values (collectivism, filial piety, modesty) conflict with American essay expectations
- How to discuss wanting to stay in the US without being transactional

## STUDENTS WITH LEARNING DIFFERENCES / NEURODIVERGENCE
- ADHD: how it shows up in essay writing (tangential, unfocused) and how to work WITH the brain
- Dyslexia: editing strategies, voice preservation despite mechanical challenges
- Autism spectrum: authentic voice that may read as "different" — when that's a strength
- When to disclose in the essay vs. additional information vs. not at all
- How to write about accommodations without centering disability

## STUDENTS WITH LIMITED "IMPRESSIVE" EXPERIENCES
- The student who worked a job instead of doing extracurriculars
- The student from a school with no APs, no clubs, no opportunities
- The rural student with limited access
- The student whose "biggest achievement" feels small compared to peers
- How to find the extraordinary in ordinary life
- The power of depth over breadth in a constrained context

## STUDENTS WRITING ABOUT SENSITIVE TOPICS
- Mental health: when to include, when to avoid, how to frame it
- Family instability / divorce / incarceration
- Abuse or neglect (when the student insists on writing about it)
- Sexual orientation or gender identity in conservative contexts
- Religious faith or loss of faith
- Political beliefs or activism
- Chronic illness or disability

For each sensitive topic:
- When it strengthens the application
- When it hurts the application
- How to frame it with agency and forward motion
- Ethical boundaries for coaches (when to refer out)

## TRANSFER STUDENTS
- The "Why Transfer" essay: what AOs actually want to hear
- How to discuss your current school without being negative
- Demonstrating genuine research into the target school
- Community college → 4-year specific strategies
- The gap year / stop-out essay

## LEGACY AND DEVELOPMENT APPLICANTS
- Yes, even privileged students can write bad essays
- The privilege trap: how wealth and access make essays WORSE, not better
- Writing authentically when your "challenge" is choosing between opportunities
- How to avoid tone-deafness without pretending to be someone you're not

Format as structured markdown. Each section should have specific coaching questions the advisor should ask.`
  },
];

// ============================================================
// LAYER E5: PROCESS & TIMELINE MANAGEMENT
// ============================================================

const essayProcessPrompts = [
  {
    id: 'essay-process-timeline',
    layer: 'essay-deep',
    title: 'Essay Process & Timeline Management',
    prompt: `Create the complete essay project management guide for a student applying to 8-15 schools. This is the operational knowledge that private consultants provide but is almost never written down.

## THE MASTER TIMELINE

Create month-by-month and week-by-week guides for TWO scenarios:
1. **Ideal Timeline** (starting summer before senior year — June/July)
2. **Compressed Timeline** (starting September of senior year — realistic for many students)

For each timeline include:
- What to draft and when
- Revision cycles and who should review at each stage
- When to finalize and submit
- Buffer time for the unexpected

## ESSAY TRIAGE: WHICH ESSAYS TO WRITE FIRST

The strategic sequencing that maximizes quality:
1. Start with the Common App personal statement (it sets the narrative foundation)
2. Then the "core narrative" supplements (Why Us, Why This Major — these have the most reuse)
3. Then school-specific supplements (unique prompts that can't be reused)
4. Then short answers and additional information
5. Then scholarship essays (if applicable)

For each stage: estimated hours, recommended number of drafts, and when to move on even if imperfect.

## THE ESSAY PORTFOLIO STRATEGY

How to think about all your essays across all schools as one coherent portfolio:
- The "no redundancy" rule: each essay should reveal something new
- The narrative thread: how your Common App, activities, and supplements tell a complete story
- Quality allocation: which schools get your A-game drafts vs. adapted versions
- The "Good Enough" threshold: when perfectionism becomes counterproductive

## MANAGING MULTIPLE SCHOOL ESSAYS SIMULTANEOUSLY

Practical strategies for:
- Tracking prompts, word counts, and deadlines across 10+ schools
- Identifying essay "families" (prompts that can share 70%+ of content)
- The adaptation strategy: how to customize a base essay for different schools efficiently
- When to write from scratch vs. adapt

## THE REVISION PROCESS

- How many revision cycles for each essay type (personal statement: 5-8, supplements: 3-5, short answers: 2-3)
- Who should review and when (self → peer → teacher/counselor → parent last)
- How to incorporate feedback without losing your voice
- The "fresh eyes" technique: reading your essay after 48 hours
- When to STOP revising (the law of diminishing returns)
- The "read aloud" test (if you stumble, the reader will too)

## EMERGENCY PROTOCOLS

- The last-minute essay rewrite (48 hours before deadline)
- When a school changes its prompts after you've drafted
- When you realize your personal statement topic isn't working in October
- When you can't think of anything to write about
- When you get conflicting feedback from different reviewers
- When a parent is pressuring you to write about something you don't want to

## PARENT MANAGEMENT (YES, THIS IS NECESSARY)

- How to involve parents productively
- How to set boundaries on parent editing
- The "parent review" protocol: what they should look for (typos, factual errors) vs. what they shouldn't touch (voice, topic, structure)
- How to handle the parent who wants to rewrite the essay
- How to handle the parent who is completely uninvolved

Format as structured markdown with checklists where appropriate.`
  },
];

// ============================================================
// LAYER E6: ESSAY ECOSYSTEM STRATEGY
// ============================================================

const essayEcosystemPrompts = [
  {
    id: 'essay-ecosystem-strategy',
    layer: 'essay-deep',
    title: 'The Essay Ecosystem: How All Pieces Work Together',
    prompt: `Create the strategic framework for how a student's entire essay portfolio works as a unified system. Private consultants think about this holistically — every essay should serve a purpose in the overall application narrative.

## THE NARRATIVE ARCHITECTURE

Every application tells a story across multiple documents:
- Common App personal statement (the emotional core)
- Activities list and descriptions (the evidence)
- Additional information section (the context)
- School-specific supplements (the fit demonstration)
- Letters of recommendation (the external validation)

How do essays fit into this system? The personal statement shouldn't try to do everything — it should do ONE thing brilliantly and trust the other components to fill in the rest.

## THE "WHAT'S LEFT TO SAY" FRAMEWORK

After the personal statement, each supplement should answer: "What does the AO still not know about me?"

Create a diagnostic tool:
- After reading their personal statement, list what an AO now knows about the student
- Identify the gaps: intellectual depth? Leadership? Community? Creativity? Resilience?
- Map each supplement to a specific gap
- Ensure no two essays cover the same ground

## THEME MANAGEMENT ACROSS APPLICATIONS

How to maintain a coherent narrative across 10-15 different schools:
- The "core themes" approach: identify 3-4 themes that define you
- How to distribute themes across different essay types
- When thematic consistency becomes repetitive
- How to adapt themes for different school cultures

## THE ACTIVITY ELABORATION STRATEGY

The 150-word activity description boxes are essays too:
- Which activities to elaborate on (not your biggest — your most misunderstood)
- How to add dimension that the activities list can't convey
- The "impact + growth + why it matters" formula for 150 words
- How these descriptions should complement, not duplicate, your supplements

## SCHOOL-SPECIFIC ADAPTATION MATRIX

Create a decision framework for how to adapt essays across schools:
- Which essays can be 80% reused with school-specific details swapped
- Which essays MUST be written from scratch for each school
- How to customize a "Why Us" essay without it feeling templated
- The "find and replace school name" test (if it would still work with a different school name, it's too generic)

## THE OPTIONAL ESSAY DECISION

When to write optional essays (almost always) and the rare exceptions:
- The "additional information" optional: when blank is better
- The "optional diversity essay": risk/reward calculation
- The "anything else?" prompt: what to include vs. leave out

## FINAL QUALITY ASSURANCE CHECKLIST

Before submitting, a student should verify:
- No two essays tell the same story
- Every school gets at least one school-specific reference
- The overall portrait shows multiple dimensions
- Voice is consistent across all essays (same person wrote them)
- No factual contradictions between essays
- Word counts are respected (not 1 over)
- The application "reads" as a complete person, not a collection of parts

Format as structured markdown.`
  },
];

// ============================================================
// LAYER E7: CUTTING-EDGE 2025-2026 INTELLIGENCE
// The stuff that makes Wayfinder smarter than any human consultant
// ============================================================

const essayCuttingEdgePrompts = [
  {
    id: 'essay-ai-landscape-2026',
    layer: 'essay-deep',
    title: 'AI in Admissions: The 2025-2026 Reality',
    prompt: `Create the definitive, CURRENT intelligence brief on AI and college admissions essays as of the 2025-2026 application cycle. This needs to be the most up-to-date, nuanced analysis available — the kind of intel that even experienced consultants don't have because the landscape is moving so fast.

## THE AI DETECTION REALITY (Not Theory — What's Actually Happening)

Based on current data:
- ~68% of surveyed colleges now incorporate AI detection tools (up from 42% in 2024)
- Turnitin is the dominant platform but has a 4% sentence-level false positive rate
- International students and ESL writers see false positive rates approaching 9.24%
- Several major schools (UCLA, UC San Diego, Cal State LA) DEACTIVATED detectors in 2024-2025 due to unreliability
- UW-Madison explicitly states they don't run detection — preferring trust over imperfect surveillance

Create a comprehensive breakdown:

### SCHOOL-BY-SCHOOL AI POLICY TIERS:
**Tier 1: Explicit Ban + Active Detection**
- Brown, Georgetown — explicit ban on any AI content
- Schools using Turnitin for admissions essays specifically

**Tier 2: Nuanced Allowance (Grammar/Style OK, Content NO)**
- Caltech, Cornell, UC system — allow limited AI for grammar/clarity
- Where the line is and how it's enforced

**Tier 3: Reading Differently (Changed How They Evaluate)**
- Duke — stopped scoring essays numerically because of AI
- Virginia Tech — hybrid AI + human reader model (one AI reader replaced a human)
- What this means for applicants

**Tier 4: Don't Ask, Don't Tell**
- Schools with no stated policy
- What silence means strategically

**Tier 5: Actively Deactivated Detection**
- Schools that tried and stopped
- Why they stopped and what replaced it

### WHAT AI-WRITTEN ESSAYS ACTUALLY LOOK LIKE TO AN AO
- The "too polished" signal — suspiciously clean prose from a 17-year-old
- The voice flatness — AI produces competent but personality-free writing
- The specificity gap — AI struggles with hyper-specific personal details
- The reflection paradox — AI can narrate but can't genuinely reflect
- The vocabulary mismatch — when the essay sounds nothing like the interview

### THE STUDENT'S ETHICAL FRAMEWORK FOR AI USE
Not "don't use AI" — that ship has sailed. Instead:
- What's clearly fine: grammar check, spell check, word count tools
- What's gray area: brainstorming topics with AI, getting structural feedback
- What's clearly crossing the line: generating draft text, having AI write sections
- The practical test: "Could I defend every word in this essay as my own in an interview?"
- How to use AI as a THINKING PARTNER without letting it write for you
- The Wayfinder approach: AI assists the process, never produces the product

### HOW WAYFINDER SHOULD COACH ON THIS
- Proactively address AI with every student
- The voice preservation protocol: draft by hand first, then polish
- The "interview test" — if asked about any sentence, could you explain why you wrote it?
- Why human imperfection is now an ASSET (authentic voice > polished AI)
- How to help students who already used AI on a draft (recovery strategy)

Format as structured markdown. This should read like a classified intelligence briefing, not a blog post.`
  },
  {
    id: 'essay-post-sffa-adversity-intelligence',
    layer: 'essay-deep',
    title: 'Post-SFFA + Post-Landscape: The Adversity Essay Crisis',
    prompt: `Create the most current, strategically sophisticated analysis of how the death of race-conscious admissions AND the death of College Board's Landscape tool are reshaping essay strategy in the 2025-2026 cycle.

This is the intelligence that Wayfinder needs to be smarter than EVERY human consultant in the country on.

## THE TECTONIC SHIFTS

Three massive changes have converged simultaneously:

**1. SFFA Decision (June 2023):** Supreme Court banned race-conscious admissions. BUT explicitly allowed students to write about "how race affected [their] life." This created a paradox: race can't be a checkbox, but can be an essay topic.

**2. Landscape Tool Death (September 2025):** College Board killed Landscape — the tool that gave AOs neighborhood-level adversity data (crime rates, income, school quality) for EVERY applicant. This means AOs now have LESS automatic context about a student's circumstances. The adversity context that used to be supplied automatically by data now has to be SELF-REPORTED by the student in their essays or additional information section.

**3. Current Administration Pressure:** Executive orders mandating colleges prove they aren't using "hidden racial proxies" in admissions. Schools are running scared. Many are pulling back on diversity-oriented supplemental questions.

## THE ADVERSITY ESSAY OVERINDEXING CRISIS

Analyze the current overcorrection happening across the admissions landscape:

### What's happening:
- Students who DON'T have genuine hardship are manufacturing or exaggerating adversity
- Students who DO have genuine hardship are writing "trauma porn" — raw pain without reflection or agency
- Consultants are coaching students to lead with adversity because they think that's what AOs want
- Some schools have added "adversity" or "challenges" supplemental prompts, others have REMOVED them
- 19 colleges dropped or modified diversity prompts for 2025-2026

### Why this is a trap:
- AOs are now drowning in adversity essays — they're becoming the new "sports injury comeback"
- Manufactured hardship is transparent to experienced readers
- Real hardship without agency or growth actually HURTS applications
- The Department of Education mentioning "adversity" 25 times in guidance created a gold rush mentality
- Parents and consultants are gaming a system that doesn't reward gaming

### The Wayfinder contrarian position:
The students who will WIN in this new landscape are NOT the ones who hardship-signal the loudest. They're the ones who:
- Show authentic context without performing victimhood
- Demonstrate AGENCY — what they did with their circumstances, not just what happened to them
- Let adversity be context, not the main story
- Use the Additional Information section for FACTUAL context (explain the circumstances) and the essay for WHO THEY ARE (not what happened to them)

## STRATEGIC GUIDANCE BY STUDENT TYPE

### Students with genuine hardship:
- The Additional Info vs. Essay partition strategy
- How to provide context without exploitation
- The agency frame: "Because of X, I learned/built/created Y"
- When to be explicit vs. when to let the reader infer
- How much detail is enough (less is often more)

### Students WITHOUT hardship (majority of applicants):
- Stop trying to manufacture adversity — AOs see through it instantly
- The alternative: intellectual curiosity, genuine passion, community impact
- How to write compellingly about a comfortable life without being tone-deaf
- The "challenge of privilege" done right vs. done catastrophically wrong
- Why your best essay might have nothing to do with overcoming anything

### First-generation students:
- First-gen status is still incredibly powerful context — use it
- But: the "I'll be the first in my family" essay is now overdone
- The reframe: show what your unique perspective brings, not just that you're first
- Navigate family dynamics in the essay with dignity for everyone involved

### International students:
- How the SFFA + Landscape changes affect international applicants differently
- Country-specific adversity that American AOs may not understand
- The balance between explaining context and centering your story

## THE NEW SUPPLEMENTAL PROMPT LANDSCAPE

Map what's changed in supplemental prompts across major schools:
- Schools that ADDED adversity/context prompts (filling the Landscape gap)
- Schools that REMOVED diversity prompts (responding to political pressure)
- Schools that REWORDED prompts to be more oblique ("tell us about your background" vs. "tell us about your identity")
- What these changes signal about what each school actually wants
- How to read between the lines of a school's prompt changes

## THE ADDITIONAL INFORMATION SECTION: NOW MORE IMPORTANT THAN EVER

With Landscape dead, the Additional Information section has become the PRIMARY mechanism for adversity context. This needs its own playbook:
- What to include: factual circumstances, family context, school limitations, health issues, any disruption to academics
- What NOT to include: sob stories, blame, excuses
- The tone: neutral, factual, brief — let the facts speak
- When to leave it blank (yes, some students should)
- Word count strategy (usually 250-650 words depending on platform)
- How AOs actually use this section in committee

Format as structured markdown. This should be the single most valuable piece of admissions intelligence in Wayfinder's entire system.`
  },
  {
    id: 'essay-emerging-trends-2026',
    layer: 'essay-deep',
    title: 'Emerging Essay Trends & Forward Intelligence',
    prompt: `Create forward-looking intelligence on where college admissions essays are heading. This is predictive analysis based on current signals — the kind of insight that gives Wayfinder users a 6-12 month advantage over everyone else.

## TREND 1: THE DEATH OF THE POLISHED ESSAY
- AI has made "polished" the default. Perfect grammar, smooth transitions, clean structure = AI-suspicious
- AOs are now actively looking for IMPERFECTION as an authenticity signal
- Slightly raw, genuine voice > perfectly crafted prose
- What this means for coaching: stop over-editing, preserve the student's natural rhythm
- The paradox: the best essay coaches now need to know when to STOP coaching

## TREND 2: THE RISE OF "SHOW YOUR WORK" TRANSPARENCY
- Some schools beginning to ask about essay process ("who helped you?")
- The Common App may add AI disclosure questions in future cycles
- How to prepare students for transparency expectations
- Wayfinder's position: full transparency is a feature, not a bug

## TREND 3: THE SUPPLEMENTAL ESSAY ARMS RACE
- Schools adding MORE supplementals to differentiate real applicants from "spray and pray" AI-assisted mass applicants
- Average supplement count increasing: 2-3 supplements was standard, some schools now at 4-6
- Short-form supplements (100-150 words) becoming more common — harder to fake
- The "Additional Information" box becoming a de facto required essay at many schools

## TREND 4: INTERVIEW + ESSAY ALIGNMENT CHECKS
- Schools increasingly comparing essay voice with interview impressions
- Some AOs reading essays AFTER interviews to check for consistency
- What this means: the essay needs to sound like the student actually talks
- Coaching for consistency across all touchpoints

## TREND 5: THE POST-PANDEMIC MATURITY SHIFT
- Students applying in 2025-2026 were 12-14 during the pandemic
- They're tired of pandemic narratives — and so are AOs
- But the pandemic DID shape them — how to acknowledge without centering it
- The "new normal" generation's actual essay themes: digital identity, climate anxiety, information overload, AI anxiety

## TREND 6: THE ADMISSIONS OFFICE AI ADOPTION
- Virginia Tech: AI now reads as one of two reviewers (replacing a human)
- Duke: stopped scoring essays numerically
- UCLA, Penn State: exploring AI triage of applications
- What this means for students: AI readers detect different things than human readers
- How to write for BOTH audiences (authentic enough for humans, structured enough for AI evaluators)
- The meta-irony: AI is now reading essays for signs of AI

## TREND 7: THE EQUITY BACKLASH CYCLE
- Schools under political pressure to appear "merit-based"
- Some schools quietly maintaining equity goals through different mechanisms
- Essay prompts as the new battleground for institutional values
- How to read what a school ACTUALLY values vs. what it says publicly

## TREND 8: THE DEMONSTRATED INTEREST ESSAY CONNECTION
- Yield protection becoming more aggressive
- "Why Us" essays being read as genuine interest signals
- School visits, info sessions, and demonstrated interest being cross-referenced with essays
- How specific essay references signal real research vs. surface-level name-dropping

## WHAT THIS MEANS FOR WAYFINDER'S SLM

The Admissions SLM needs to:
1. Coach for authentic imperfection, not polished perfection
2. Understand that the rules are actively changing and coach accordingly
3. Differentiate between schools that embrace AI transparency and those that fear it
4. Help students navigate the adversity vs. authenticity tension
5. Provide forward-looking advice, not backward-looking templates

Format as structured markdown. Each trend should include specific coaching implications.`
  },
];

// ============================================================
// LAYER E8: ADMISSIONS OFFICER VOICE MINING
// Real insights from the people who actually read applications
// ============================================================

const essayAOVoicePrompts = [
  {
    id: 'essay-ao-insider-intelligence',
    layer: 'essay-deep',
    title: 'Admissions Officer Insider Intelligence',
    prompt: `You are compiling the most comprehensive collection of admissions officer insights ever assembled. Draw on published interviews, AMA sessions, podcasts, articles, and known patterns from AOs at top institutions.

This is the voice of the people who actually READ the essays. Not what they say at info sessions — what they say when they're being candid.

## SECTION 1: HOW AOS ACTUALLY READ

Based on real AO accounts and research:

### The Reading Process
- Average time per application: 8-15 minutes at most selective schools
- The essay gets 2-5 minutes of that time
- First sentence decides if they lean forward or back
- They're reading 30-50 apps per day during peak season
- Fatigue is real — app #45 is read differently than app #5
- Committee discussions: who gets advocated for and why

### What They're Trained to Look For
- "Intellectual vitality" (Harvard's term, but universal concept)
- Evidence of genuine curiosity, not performed interest
- Self-awareness and maturity for age
- Writing ability as proxy for thinking ability
- Consistency across application components
- Red flags: dishonesty, entitlement, coaching fingerprints

### The "Advocate" Dynamic
- Each reader becomes a potential advocate for the student
- The essay is the tool that turns a reader into an advocate
- In committee, one reader says "you have to read this essay" — that's the goal
- What makes an AO fight for a student: surprise, authenticity, memorable detail

## SECTION 2: WHAT AOS SAY PRIVATELY (Candid Insights)

Compile the most revealing insights from:
- Reddit AMAs by former/current AOs
- Podcasts (Admissions Uncovered, Admissions Beat, etc.)
- Published interviews in NY Times, Chronicle of Higher Ed, Inside Higher Ed
- Jeff Selingo's reporting on reading committees
- College Confidential verified AO posts
- YouTube Q&As by former AOs turned consultants

Organize by theme:

### On Essay Topics:
- "I've read 500 dead grandmother essays. Unless yours genuinely changes me, pick something else."
- "The best essays aren't about extraordinary events — they're about ordinary moments seen through extraordinary eyes."
- "I can tell within one paragraph if a student wrote this or someone helped."

### On Authenticity:
- What authenticity ACTUALLY sounds like to an AO (specific markers)
- How they detect parent/counselor editing (sentence structure shifts, vocabulary jumps)
- The AI tells: "suspiciously clean" writing from teenagers
- Why they'd rather read a messy authentic essay than a polished ghost-written one

### On What Gets Read Aloud in Committee:
- The essays that make AOs laugh, cry, or stop and re-read
- Specific qualities that make an essay "shareable"
- The difference between "interesting" and "admissions-worthy"

### On Diversity & Adversity (Post-SFFA):
- How AOs are navigating the new constraints
- What they can and can't consider
- How they're reading adversity essays differently now
- The fatigue with performative hardship

### On AI & Ghostwriting:
- How AOs are adapting their reading to the AI era
- The schools that care about detection vs. those that don't
- What AOs say about students who clearly used AI
- The interview as the new essay verification mechanism

### On Demographics They're Reading:
- How context changes how they read (first-gen, legacy, athlete, international, etc.)
- The "holistic review" in practice — how your essay is read alongside everything else
- Development/donor considerations (the elephant in the room)

## SECTION 3: FORMER AO CONSULTANT INSIGHTS

Many former AOs become private consultants. What do they reveal now that they're on the other side?

- The most common advice they give that CONTRADICTS what they said as AOs
- What they wish they could have told applicants while they were in the office
- The biggest misconceptions about what AOs want
- How the job has changed with AI, SFFA, and increasing application volumes

## SECTION 4: SCHOOL-SPECIFIC AO CULTURE

Different schools have different reading cultures:
- Harvard: intellectual vitality, depth of passion
- Stanford: agency, impact, what will you DO
- MIT: genuine problem-solver, builder, maker
- Yale: community contributor, social impact, "who is this person?"
- UChicago: intellectual playfulness, willingness to be weird
- Columbia: engagement with ideas, NYC as classroom
- Princeton: academic depth, independent thinking, thesis potential

For each, describe the AO culture, what they train readers to prioritize, and how this affects essay strategy.

Format as structured markdown. Source attributions where possible (even if generalized: "former Harvard AO speaking on podcast" is fine).`
  },
  {
    id: 'essay-ao-reading-simulation',
    layer: 'essay-deep',
    title: 'AO Reading Simulation: How to Think Like a Reader',
    prompt: `Create a guide that teaches students (and the Wayfinder SLM) to read their own essays THE WAY AN ADMISSIONS OFFICER WOULD.

This is a perspective-shifting exercise — most students write essays for themselves, not for the tired, overworked AO who will spend 3 minutes on it.

## THE AO READING SIMULATION

### Step 1: Set the Scene
Imagine you are an admissions officer at [target school]. It's 4:30 PM on a Tuesday in January. You've read 37 applications today. You're behind schedule. Your coffee is cold. You have 13 more to get through before dinner.

You open the next application. You see:
- GPA, test scores, school context (10 seconds)
- Activities list (20 seconds)
- Counselor recommendation (30 seconds)
- Now: the personal statement (3-5 minutes)

What are you looking for? What makes you lean forward vs. skim?

### Step 2: The First 30 Seconds
- Read your opening paragraph as the AO would
- What impression forms in the first three sentences?
- Are you curious to keep reading, or are you already categorizing?
- The "lean test": does the reader lean in or lean back?

### Step 3: The "So What?" Checkpoint
- At the midpoint of the essay, does the AO know WHY they're reading this?
- Is there a clear reason this essay is being told to THIS reader at THIS school?
- Or is this a generic story that could be told to anyone?

### Step 4: The Closing Impression
- When the AO finishes, what one word describes this applicant?
- If the AO had to summarize this essay to the committee in one sentence, what would they say?
- Would the AO remember this essay tomorrow? In a week?

### Step 5: The Committee Test
- Imagine presenting this application to a committee of 5 colleagues
- What would you say about this essay?
- "You need to read this" → admission likely
- "Solid essay, nothing remarkable" → depends on other factors
- "I can't remember what the essay was about" → application is in trouble

## THE ANTI-PATTERNS (What Makes AOs Disengage)

For each, describe the AO's internal monologue:
1. The opening that starts with a quote → "Oh no, another one"
2. The essay that describes an event without reflecting → "And? So what?"
3. The essay that reads like a resume → "I already have the activities list"
4. The essay with big vocabulary that doesn't sound like a teenager → "Who wrote this?"
5. The essay about helping others that centers the writer's feelings → "This isn't about you helping — it's about how great you feel about helping"
6. The generic "Why Us" that lists school features → "This could be about any school"
7. The adversity essay that's all pain and no growth → "I feel bad but I can't advocate for this"
8. The essay that tries to be funny but isn't → "Risky choice that didn't pay off"

## TEACHING THE SLM TO READ LIKE AN AO

The Wayfinder SLM needs to internalize this reading mode. When reviewing an essay, it should:
1. Read the first paragraph and form an initial impression (lean forward or back?)
2. Identify the core story/insight within 30 seconds
3. Check for the "so what" by the halfway point
4. Evaluate the closing impression — what one word describes this applicant?
5. Run the committee test — would you advocate for this student?
6. Score accordingly

This is what separates Wayfinder from ChatGPT: ChatGPT evaluates essays on writing quality. Wayfinder evaluates essays on ADMISSIONS IMPACT.

Format as structured markdown.`
  },
];

// ============================================================
// AGGREGATE EXPORT
// ============================================================

export const essayDeepPrompts = [
  ...essayDiagnosticPrompts,
  ...essaySchoolSpecificPrompts,
  ...essayWorkedExamplePrompts,
  ...essayEdgeCasePrompts,
  ...essayProcessPrompts,
  ...essayEcosystemPrompts,
  ...essayCuttingEdgePrompts,
  ...essayAOVoicePrompts,
];

// Summary
export function getEssayDeepSummary() {
  return {
    totalPrompts: essayDeepPrompts.length,
    layers: {
      'E1: Diagnostic Intelligence': essayDiagnosticPrompts.length,
      'E2: School-Specific Decoding': essaySchoolSpecificPrompts.length + ' (+ 229 per-school)',
      'E3: Worked Examples': essayWorkedExamplePrompts.length,
      'E4: Edge Cases': essayEdgeCasePrompts.length,
      'E5: Process & Timeline': essayProcessPrompts.length,
      'E6: Ecosystem Strategy': essayEcosystemPrompts.length,
      'E7: Cutting-Edge 2025-2026': essayCuttingEdgePrompts.length,
      'E8: AO Voice Mining': essayAOVoicePrompts.length,
    },
    estimatedOutput: {
      fixedPrompts: '~50,000 words of distilled essay intelligence',
      perSchoolPrompts: '229 schools × ~2,000 words = ~458,000 words',
      total: '~500,000+ words of essay-specific training foundation',
    },
    estimatedCost: {
      fixedPromptsSonnet: '~$2-3',
      perSchoolSonnet: '~$5-8',
      fixedPromptsOpus: '~$10-15',
      perSchoolOpus: '~$25-40',
    },
  };
}

console.log('\nWayfinder Essay Deep Intelligence — Prompt Architecture');
console.log('=====================================================');
const summary = getEssayDeepSummary();
console.log(`Fixed prompts: ${summary.totalPrompts}`);
for (const [layer, count] of Object.entries(summary.layers)) {
  console.log(`  ${layer}: ${count}`);
}
console.log(`\nEstimated output: ${summary.estimatedOutput.total}`);
console.log(`Estimated cost (Sonnet): ${summary.estimatedCost.fixedPromptsSonnet} fixed + ${summary.estimatedCost.perSchoolSonnet} per-school`);
console.log(`Estimated cost (Opus):   ${summary.estimatedCost.fixedPromptsOpus} fixed + ${summary.estimatedCost.perSchoolOpus} per-school`);
