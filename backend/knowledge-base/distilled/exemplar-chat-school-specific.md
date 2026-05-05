# Exemplar — School-specific deep knowledge chat responses

> **INTERNAL RAG INSTRUCTION (do not paraphrase to user):** All blocks marked `[SLM data retrieval]`, `**CRITICAL — Wayfinder data sources**`, `**Critical SLM instruction**`, the `**The structural play:**` sentences, and the `## Reasoning patterns` section at the bottom are GUIDANCE for HOW to construct your response. They are not user-facing content. Never quote them back to the user. Never echo phrases like "Wayfinder synthesis advantage" or "Gemini gives generic, Wayfinder gives X" to users — those are internal framing. Use them to inform the response; the response itself should sound like a thoughtful college admissions advisor, not a meta-discussion of how the chatbot works.


This file contains pre-synthesized Opus-grade reasoning for school-specific institutional questions. Wayfinder has an extensive library of school deep files in `backend/knowledge-base/schools/`. The SLM should ALWAYS retrieve the relevant school deep file alongside this exemplar and weave its specific institutional content into the response — that's the structural advantage over Gemini/ChatGPT/Claude, which have only general training-data knowledge of these schools.

**Critical SLM instruction for every school-specific query:**
1. Identify the school(s) named in the query.
2. Retrieve the matching school-*.md deep file(s) from the schools/ directory.
3. Pull the user's saved profile for fit analysis.
4. Weave specific institutional content (from the deep file) into the synthesis (from this exemplar).
5. The response should cite specific facts the school deep file gives that the user couldn't get from a generic chatbot.

---

**Also known as / synonyms:** Stanford demonstrated interest, Cooper Union Hometest, Babson FME, Yale post-SFFA, MIT vs Harvey Mudd, school-specific admissions, why this school, institutional fit, school deep file, school admissions strategy.

## Demonstrated interest at schools that don't track visits (Stanford archetype)

Stanford explicitly states they don't track demonstrated interest — no visit tracking, no email-open tracking, no tour attendance scoring. This confuses students who've been told demonstrated interest matters. The honest answer requires distinguishing between schools that score interest mechanically and schools that read interest qualitatively.

**The mechanical version of demonstrated interest** (some schools, mostly mid-tier private universities trying to protect yield): they literally count whether you opened emails, attended a tour, requested information, attended a virtual session. These count toward an "interest score" that contributes to admit decisions. Schools that do this: many private universities ranked 25-75 with yield concerns. Examples include some at Tulane, Wake Forest, Lehigh, Northeastern (historically), American University.

**The qualitative version of demonstrated interest** (most top schools, including Stanford): they don't track behavior, but they read the application for specificity. The "Why Stanford" essay (and equivalents) is the primary surface where interest gets read. Generic "I want to attend Stanford because of its strong CS program and beautiful campus" reads as low-effort. Specific "I want to attend Stanford because Professor Manning's Natural Language Processing group is doing the work I want to do; I've read three of his recent papers and Stanford's CS194 sequence is exactly the curriculum I need to contribute" reads as serious interest.

**For Stanford specifically — what the institutional context makes the right move:**

[SLM: pull from `schools/school-stanford.md` if available. Reference specific institutional facts: Stanford's emphasis on intellectual vitality, the "What matters to you and why" supplemental, the role of curiosity and self-direction in their reads, recent shifts in essay weighting post-SFFA, what Stanford AOs are documented as looking for. If the deep file doesn't exist, note that and synthesize based on the general qualitative-interest framework above.]

The right ways to demonstrate interest at Stanford:

1. **Supplemental essays that show specific institutional knowledge.** Stanford's supplements include the famous "What matters to you and why" and the roommate letter. These aren't general personal statements — they're an opportunity to show that you understand Stanford's culture (intellectually playful, low-stress in self-presentation, valuing curiosity over credentialing) and that your voice fits it. Per the Stanford deep file, recent supplements have rewarded answers that felt authentic and specific over polished and generic.

2. **Specific course / faculty / program references in your "why" essays.** Not "Stanford's CS program is amazing" but "Stanford's CS231N (Convolutional Neural Networks for Visual Recognition) is exactly the entry point I want into the field I've been preparing for; the integration with Stanford's HAI (Human-Centered AI Institute) for cross-disciplinary work is something I haven't seen at peer institutions." This signals you've actually done the research.

3. **Engagement with Stanford-specific content if accessible.** Reading Stanford faculty publications, watching Stanford CS lectures on YouTube (CS229 ML, CS231N CV, CS236 Deep Generative Models are all publicly available), engaging with Stanford-affiliated research news. None of this is tracked, but all of it shows up in the specificity of how you write about Stanford in your supplements.

4. **DON'T:** spam information requests, attend lots of virtual events hoping it counts, repeatedly email the AO. None of these matter at Stanford and they don't help you.

5. **DON'T:** apply REA "to show interest" if you're not actually committed enough. REA does signal interest, but it's not a magic boost — it's a roughly 7-8% admit rate against the strongest applicant pool. If you're hoping REA "demonstrates interest" without actually being your strongest application, you're misusing the slot.

**The deeper insight:** at the very top schools (Stanford, MIT, HYP), demonstrated interest is essentially "did you write essays that show you actually understand and want THIS school, or did you write generic essays you could submit anywhere." That's it. Visit tracking, email opens, tour attendance — irrelevant. Essay specificity — everything.

**Wayfinder context:** if the user has saved Stanford as a target school, surface (a) a reminder of which Stanford-specific supplements they'll need to write and (b) the specific institutional features from the school deep file they should reference. If the user hasn't saved Stanford yet but is asking, prompt to save it so future continuity-class responses can build on the context.

---

## Cooper Union's Hometest and what it actually evaluates

Cooper Union is one of the most institutionally distinctive schools in US admissions. Most students applying haven't fully understood the Hometest's role, which dramatically affects how to prepare.

**Critical SLM instruction:** retrieve `schools/school-cooper-union.md` deep file (added in patch 73) and weave its specific institutional content. Below is the framework; the deep file content is the differentiator.

**The institutional context Wayfinder's deep file establishes:**

- Cooper Union is small (about 900 undergrads total across Architecture, Art, and Engineering)
- Each of the three schools admits separately and weights differently
- The 50% Tuition Scholarship is automatic for ALL admitted students (Cooper Union's distinctive financial model)
- The Hometest is the dominant admit factor for Architecture and Art applicants — substantially more weight than grades or test scores

**What the Hometest actually evaluates:**

For Architecture: the Hometest is a multi-day at-home design challenge requiring spatial thinking, ideation, drawing, and presentation. It's evaluated for design sensibility, thinking process (how the student approached the problem, not just the final solution), and willingness to take creative risks. Cooper Union Architecture is evaluating whether you think like an architect — they're not testing general academic capability.

For Art: the Hometest evaluates artistic vision, technical capability, and ability to develop a body of work over a constrained timeframe. The applicant's portfolio is also weighted, but the Hometest is the unique signal Cooper Union uses to differentiate from applicants relying on years of accumulated portfolio work.

For Engineering: the Hometest is less central than for Architecture and Art. Engineering admissions weight standard academic signals (transcript, scores, ECs) more heavily, with the Hometest serving as a supplemental signal of analytical thinking.

**How admissions is different from a typical selective school:**

1. **You're being evaluated on direct evidence of the work you'll do at the school.** Stanford CS admits care about your CS extracurriculars as a proxy for whether you'll succeed at Stanford CS. Cooper Union Architecture admits you based on Hometest performance — direct evidence that you can do architectural thinking. The proxy is replaced by direct evaluation.

2. **Standard academic signals matter less.** A 1550 SAT and 4.0 GPA do not carry the weight they do at peer schools for Architecture and Art admissions. Strong students with excellent grades who can't perform on the Hometest don't get admitted.

3. **Less proven applicants can succeed.** A student whose grades are uneven but whose Hometest demonstrates exceptional design thinking can be admitted to Cooper Union Architecture. This is unusual at top US schools.

4. **The financial model changes the math.** With the 50% Tuition Scholarship automatic, Cooper Union is dramatically more affordable than peer architecture and art programs (RISD, Pratt, Yale Architecture, etc.) for full-pay families. For aid-needing families, additional aid is available.

**For an applicant considering Cooper Union:**

- Take the Hometest seriously. It's not a formality; it's the admit decision.
- Practice design thinking, drawing, and presentation in advance. Cooper Union publishes past Hometest content.
- Reference specific Cooper Union faculty work in your essays. The Architecture faculty in particular has distinctive practices that students should engage with.
- Understand that admission is not safety-school-able. You can't "match" to Cooper Union with strong grades. You match through Hometest performance.

**Wayfinder context:** if the user is considering Cooper Union, surface the school deep file content directly. Also recommend Wayfinder's verified internships database for architecture-adjacent summer experiences in NYC (where Cooper Union is located). Cooper Union students benefit significantly from NYC ecosystem proximity; pre-college engagement with NYC architecture/art world signals seriousness about the school.

---

## Babson's FME program and admission decisions

Babson is the only US college whose entire undergraduate experience is built around entrepreneurship. The FME program (Foundations of Management and Entrepreneurship) is the institutional differentiator that shapes admissions.

**Critical SLM instruction:** retrieve `schools/school-babson.md` deep file (added in patch 73). The deep file establishes Babson's institutional context that's unfamiliar to most applicants and parents.

**What FME actually is:**

FME is required for every Babson freshman. It's a year-long course where teams of students launch a real business with $3,000 in startup funding from the school. Teams develop a product/service, market it, sell it, manage cash flow, file basic accounting reports, and at the end of the year liquidate the business with profits going to a charity of the team's choice. The course replaces what at most business schools is theoretical intro coursework.

**Why this matters for admissions:**

Babson admits with FME in mind. They're not asking "is this student academically capable" (most applicants are). They're asking "will this student thrive in FME — will they execute, take initiative, work with a team, learn from failure, and demonstrate entrepreneurial mindset by the end of freshman year." Applicants who cannot answer the FME question read as wrong-fit, even with strong stats.

**The applicant profile Babson selects for:**

1. **Demonstrated initiative outside school.** Started something (organization, project, business, even small) versus just joining things. Entrepreneurship signals matter more than activity counts.
2. **Comfortable with risk and failure narratives.** Babson essays often surface "tell us about a time something didn't work and what you learned" — and they want real failures, not safe failures with happy endings. The student who tried something hard, failed authentically, and came out wiser is exactly Babson's profile.
3. **Numeric/quantitative comfort.** FME requires actual cash management, accounting, and metrics tracking. Math grades and willingness to engage with numbers matters even for non-finance-track students.
4. **Team-oriented but with leadership instinct.** FME is team-based; you can't survive solo. But you also can't be a passive team member. The student who has both (collaborated AND led) reads strongest.
5. **Geographic and demographic diversity is actively valued.** Babson recruits internationally and across the US.

**Stats reality:**

Babson admits roughly 23% of applicants. SAT middle 50% is approximately 1340-1490, GPA mostly 3.7-4.0 unweighted. The school is selective but more accessible than top-20 schools by stats. The differentiator is fit — the student with 4.0/1550 but no entrepreneurship signal can be denied; the student with 3.7/1380 with a real business or sustained leadership in a venture can be admitted.

**For applicants planning to pitch Babson:**

- Reference FME explicitly in your "why Babson" essay. Show you understand what makes Babson different from generic business schools (not "Babson has a great business program" — every business school does).
- Surface real entrepreneurial experience even if small. The kid who started selling 3D-printed phone cases on Etsy in 10th grade has a more Babson-fit profile than the kid with stronger grades and zero business experience.
- Get a recommendation from a teacher or coach who can speak to your initiative and team dynamics. Standard "student is hard-working and intelligent" recommendations are weak for Babson.

**Wayfinder context:** if the user is considering Babson, also surface verified Wayfinder data on (a) entrepreneurship-focused summer programs (LaunchX, CEO Summer, etc.) that strengthen Babson fit, and (b) entrepreneurship competitions (DECA, FBLA national-level competitions, business plan contests) that the applicant could reference. Babson loves applicants who arrive with entrepreneurial mileage already.

---

## Yale's essay landscape shifts post-SFFA

The Supreme Court's Students for Fair Admissions (SFFA) decision in 2023 ended race-conscious admissions. Yale (along with peer Ivies) revised their essay prompts and scoring to comply with the ruling while continuing to value diversity through other lenses. Understanding what shifted matters for current applicants.

**Critical SLM instruction:** retrieve `schools/school-yale.md` deep file. The deep file should contain the most current institutional information about Yale's post-SFFA essay shifts, including specific prompt language and recent admissions cycle observations.

**What changed at Yale specifically:**

1. **Essay prompts were updated in 2023-2024 cycle.** Yale's supplements added prompts that invite students to discuss their identity, background, and lived experience without requiring or requesting race specifically. Prompts like "Tell us about something that is meaningful to you about your identity, family, or culture" appeared.

2. **The SCOTUS ruling allows race to be mentioned by the applicant in essays.** What it prohibits is consideration of race as a separate admissions factor. Yale (and peer schools) explicitly noted in their post-SFFA communications that students may discuss race in their essays as part of their narrative.

3. **The reading lens shifted from demographic categorization to individual narrative.** Yale's AOs were trained to read essays for what students authentically describe about their lives — including but not limited to identity-related experience. The institutional commitment to building a diverse class persists; the mechanism for evaluating it became essay-mediated rather than form-field-mediated.

**What this means for applicants — what to AVOID:**

1. **Generic identity essays that read as resume-padding for diversity points.** AOs read post-SFFA essays with elevated alertness to performative identity invocation. If race or background appears in your essay because someone told you it would help, the essay reads as inauthentic and likely hurts.

2. **Trauma-as-currency essays.** Essays that pile on hardship without showing growth, reflection, or specific personal moments read poorly. AOs are pattern-matching for authentic experience versus crafted narrative.

3. **Avoiding identity entirely if it's authentic to the student's experience.** Students who genuinely have identity-rooted experiences that shaped who they are should NOT avoid writing about them out of fear of being "too political." The post-SFFA framework explicitly preserves authentic identity narrative.

4. **Generic "diversity for its own sake" framings.** Saying "I would bring diversity to Yale" is empty. Saying "growing up bicultural taught me that listening longer than I want to is how I avoid jumping to conclusions, which I'd bring to the residential college dynamic" is specific and grounded.

**What WORKS in post-SFFA Yale supplements:**

1. **Specific moments, not category-claims.** A scene from a holiday dinner that captures family complexity matters more than "I'm a first-generation American."

2. **Reflection on what you've learned, not just what happened to you.** AOs are reading for intellectual maturity. The kid who can articulate what an experience taught them about how the world works reads stronger than the kid who describes the experience without reflection.

3. **Genuine voice over polished narrative.** Post-SFFA, AOs have been documented preferring essays that sound like an actual 17-year-old talking about their actual life, not a 17-year-old who's been heavily coached toward a college essay archetype.

4. **Specificity of what you'd bring to a residential community.** Yale's residential college system is central to Yale culture. Essays that show how the applicant would contribute to a small community (not just a class) read well.

**For applicants writing Yale supplements now:**

- Read Yale's current supplemental prompts directly (they update annually). Don't write to last year's prompts.
- The Yale "Tell us why Yale" supplement should reference specific aspects of Yale culture (residential colleges by name, specific faculty work, specific Yale opportunities) that you've actually researched.
- The "What's something meaningful to you" type prompts should answer the actual question with specificity — not deliver a generic story repurposed from the Common App.
- Don't avoid identity if it's relevant; don't insert identity if it's not.

**Wayfinder context:** if the user is targeting Yale, verify their saved school list reflects this and surface (a) the specific Yale supplemental prompts they'll need to write per Wayfinder's school deep file, (b) any prior conversation about their essay drafts, (c) Wayfinder's Essay Reviewer module if they want to draft and get feedback. Yale supplements particularly benefit from the Essay Reviewer's voice/authenticity scoring because Yale weights authentic voice heavily.

---

## MIT vs Harvey Mudd for engineering — what each school selects for

MIT and Harvey Mudd are both highly selective STEM-focused schools, and students often consider them together. The institutional differences are large and the applicant profile they select for is meaningfully different.

**Critical SLM instruction:** retrieve both `schools/school-mit.md` and `schools/school-harvey-mudd.md` deep files. Weave specific institutional content from each.

**MIT — what they select for:**

1. **Demonstrated technical achievement at a national or near-national level.** USAMO/USACO Platinum/IOI participation, Intel ISEF finalist, Regeneron Science Talent Search semifinalist, founder of something with traction. MIT explicitly notes they value applicants who have "shown what they can do" at the highest levels accessible to high schoolers.

2. **Genuine intellectual joy in technical subjects.** MIT's institutional culture rewards students who love problems for their own sake, not as a means to a credential. Essays that read as "I want to make money in tech" or "I want a high-status career" read poorly. Essays that read as "I've been building this thing for two years because I can't stop thinking about it" read strongly.

3. **The "match" axis — fit for MIT's intensity.** MIT freshman year is documented as one of the most intense in US higher ed. The school is looking for students who will not only survive but thrive in that intensity. Students who present as already-stressed or fragile under their high school workload are read with concern.

4. **The "why MIT" essay is dispositive.** MIT's "Why MIT" prompt rewards specific institutional knowledge — naming specific labs, professors, courses, communities. Generic MIT love does not work.

5. **Hands-on tinkering and making.** MIT's culture values building things — hardware, software, robots, instruments, anything physical or computational with real outputs. Pure theoretical interest without making is less valued than at a school like Princeton.

**Harvey Mudd — what they select for:**

1. **Strong stats with curricular rigor as foundation.** HMC is academically intense and the rigor of the math/science transcript is foundational. AMC/AIME competition mathematics and AP Calc BC at minimum are expected.

2. **Liberal arts breadth alongside STEM depth.** HMC is part of the 5C Claremont consortium and is committed to a humanities core (about 1/3 of the curriculum is humanities and social sciences). The kid who wants pure STEM with no humanities interest is wrong-fit. The kid who is excited about studying philosophy alongside CS is right-fit.

3. **Collaborative, not competitive culture.** HMC's culture is documented as significantly more collaborative than MIT's. Students do problem sets together, share solutions (within honor code), support each other through difficulty. The kid who reads as competitive in a zero-sum way reads wrong-fit.

4. **The "Why HMC" essay tests cultural fit.** HMC's essay prompts include questions about why specifically HMC versus other STEM schools. The right answer references the consortium structure, the humanities core, the small size (~900 students), the warm SoCal location.

5. **Diverse interests, not just CS or engineering.** HMC graduates many students who go into research, medical school, finance, consulting — not just tech. The kid who is laser-focused on one career path may read as wrong-fit for HMC's broader vision of educated technical people.

**The honest comparison for an applicant considering both:**

- If you have national-level technical competition results AND love technical work for its own sake AND would thrive in maximum intensity, MIT is the right reach.
- If you have strong but not national-level technical achievement AND want a humanities-inflected education AND want a smaller, collaborative environment, Harvey Mudd is the right match.
- The kid who applies to both should write significantly different "why" essays. They are not interchangeable.

**Stats reality:**

MIT admit rate: ~4-5%. Median SAT: ~1540-1570. Almost universal national-level achievements among admits.

HMC admit rate: ~13-15%. Median SAT: ~1500-1540. Strong stats expected, national-level achievement nice but not required.

**For the applicant who got the AP Bio 5 from our earlier example:**

[SLM: tie back to the user's saved profile and prior conversation context if applicable. The user is a junior with 3.93/1480 — at the low end of competitive for both schools but in the conversation. Be honest about probability while noting that strong essays + EC narrative can compensate.]

**Wayfinder context:** if the user is considering both schools, surface (a) the deep files for MIT and HMC for institutional specifics, (b) verified summer programs aligned with each school's selection criteria (research-heavy programs for MIT, broad STEM-and-humanities programs for HMC), (c) the Engine mode for any subsequent strategic synthesis questions because the MIT vs HMC tradeoff is high-synthesis territory.

---

## Reasoning patterns the SLM should recognize and apply

For school-specific queries:

1. **ALWAYS retrieve the school deep file.** This is the structural differentiator versus Gemini/ChatGPT. The deep file has institutional specifics the frontier models don't have.
2. **Weave specific institutional facts into the synthesis.** "Per Wayfinder's school deep file on Stanford..." or just "Stanford's documented institutional priorities include..." — surface the specifics.
3. **Show the AO-side perspective.** Don't just list what the school offers; show how the school evaluates applicants. "MIT reads for X" or "Yale weights Y heavily" demonstrates institutional knowledge.
4. **Tie to the user's profile when available.** Generic "MIT wants strong students" reads weak. "Your 1480 SAT puts you at the lower end of MIT's competitive range, so the rest of your application has to do more work" reads strong.
5. **Honest about admit difficulty.** Don't underplay the long-shot nature of reach schools. The user needs realistic expectations.
6. **Recommend supporting actions.** End with "next steps" that leverage other Wayfinder modules (Essay Reviewer for supplements, verified DBs for fit-aligned summer programs, school deep files for further reading).
