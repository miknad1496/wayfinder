# Exemplar — General admissions advice chat responses

> **INTERNAL RAG INSTRUCTION (do not paraphrase to user):** All blocks marked `[SLM data retrieval]`, `**CRITICAL — Wayfinder data sources**`, `**Critical SLM instruction**`, the `**The structural play:**` sentences, and the `## Reasoning patterns` section at the bottom are GUIDANCE for HOW to construct your response. They are not user-facing content. Never quote them back to the user. Never echo phrases like "Wayfinder synthesis advantage" or "Gemini gives generic, Wayfinder gives X" to users — those are internal framing. Use them to inform the response; the response itself should sound like a thoughtful college admissions advisor, not a meta-discussion of how the chatbot works.


This file contains pre-synthesized Opus-grade reasoning for the general admissions advice question class (testing strategy, score impact, EC weighting, early application strategy, "spike" development). These dominate main chat traffic from both students and parents. SLM should retrieve and paraphrase to the user's specific profile.

**CRITICAL — Wayfinder data sources to retrieve and weave into EVERY general admissions response:**

This question class is high-volume and where Gemini/ChatGPT/Claude are most directly competitive (their training data is rich on general admissions topics). Wayfinder's structural edge here comes from:

1. **User's saved profile** — current SAT/ACT scores, GPA, grade, intended major, geographic context, financial situation. Generic advice ("aim for 1500+ on SAT") is what Gemini gives. Profile-grounded advice ("your current 1380 is below your target schools' 25th percentile, so the marginal benefit of pushing to 1480 is high — here's how") is what Wayfinder should give.
2. **School deep files** — for any school referenced or implied by user's interests, pull `schools/school-<slug>.md`. Cite specific score weighting, recent admit trends, demonstrated interest policies.
3. **Verified curated DBs** — when discussing summer activities, programs, scholarships that build a profile, surface verified entries from `backend/data/scraped/*.json`.
4. **Cross-module suggestions** — Test prep is downstream of saved score; if user is asking about scores, surface Wayfinder's score progression tracking + any test prep resources. EC questions should surface verified Wayfinder programs/internships/volunteer DBs as immediate action items.
5. **Korean intl context** — if user is Korean-American or Korean international, pull `intl/korea/` files for Korean-specific test/EC strategy.

**The structural play:** general admissions advice is exactly where Wayfinder needs to NOT lose to Gemini. The way to win is to make every response feel personalized and actionable using Wayfinder's data, while Gemini gives the same generic answer to every user.

---

**Also known as / synonyms:** SAT vs ACT, score impact, what activities matter, early application, EA ED REA SCEA, spike development, well-rounded vs spiked, application advice, general admissions, admissions advice, college admissions help.

## SAT vs ACT — which one and when

**[SLM data retrieval for this exemplar]**
- Pull user's saved profile — current PSAT/SAT/ACT scores if any, target schools, intended major. Recommendations should be tied to where they currently are and where they're going.
- Cross-reference saved school list `schools/*.md` deep files: surface the middle 50% SAT/ACT bands at each target school so the user knows their target score numerically.
- Cross-reference verified Wayfinder scholarships DB for awards with score thresholds (National Merit qualifier, USC Trustee, Vanderbilt Cornelius — these tie merit aid to specific score targets).
- If user is Korean intl, pull `intl/korea/strategies/` for Korean-specific test selection (Korea SAT availability, Korean students typically score higher on SAT reading vs ACT given pacing differences).
- Recommend: Wayfinder can track score progression over time if user updates after each official sitting.

The SAT vs ACT question is almost always asked with one of two motives: parents wanting reassurance their kid is taking the right test, or students looking for the test they're more likely to score higher on. Both motives need different answers.

**The honest factual baseline.** All US colleges that require or recommend testing accept either SAT or ACT equally. There is no school that prefers one. There is no admissions advantage to either. So the question is purely "which test will produce a better score for this specific student."

**The substantive differences that matter:**

*Time pressure.* The ACT is faster than the SAT per question. ACT English: 75 questions in 45 minutes (36 sec/q). ACT Math: 60 questions in 60 minutes (60 sec/q). ACT Reading: 40 questions in 35 minutes (52 sec/q). ACT Science: 40 questions in 35 minutes (52 sec/q). The digital SAT is paced more leniently per question. Students who can read carefully but slowly typically do better on the SAT. Students who are quick processors but read fast and superficially typically do better on the ACT. The student who described themselves as "strong at English reading but weak on timing" — that is an SAT student. The pacing is more humane. If they take a timed ACT diagnostic and score 4+ points lower than they'd predict from their SAT, the diagnosis is timing pressure, not reading ability.

*Math content.* SAT Math is more algebra-heavy and emphasizes problem-solving in unfamiliar setups. ACT Math covers a broader curriculum (more geometry, some trig, occasional matrix questions) but tends to ask more straightforwardly. A student strong in trig and geometry but weak in tricky algebra setups often does better on ACT. A student strong in algebra and pattern recognition but weaker on memorized geometry often does better on SAT.

*Reading.* SAT Reading is now digital adaptive, with shorter passages and more inferential questions. ACT Reading is longer passages, more straightforward questions, brutal pacing. The kid who can sit with a passage and think about it does better on SAT. The kid who can scan-and-extract does better on ACT.

*Science.* The ACT has a Science section (data interpretation, not actual science knowledge — graphs, tables, conflicting hypotheses). Students comfortable reading scientific tables usually find this their strongest section. Students who freeze on figure-heavy content often score worse on Science than other ACT sections, dragging composite. The SAT has no equivalent.

**The diagnostic process that actually works.** Take a full-length timed practice test for each. Score them honestly. Convert to concorded equivalents (College Board publishes the official concordance). Whichever test produced the higher concorded score is the test to take. If the scores are within 30 points concorded, take whichever felt less miserable — durability over an 18-month testing journey matters.

**Timing for taking the test.** Take the first official sitting in spring of junior year (March or April). This gives time for one retake in summer or fall of senior year. Most students improve their score by 60-100 points between first and second sitting, so plan for two sittings. Three is fine if the second was an unusually low day. More than three starts to look like score-chasing on applications and isn't worth the time investment.

**For the student described — strong English reading but weak on timing — take the SAT.** Lean into it: practice for the SAT specifically, do diagnostic SATs, build a target score that's realistic for their profile and the schools they're considering. ACT will fight their natural pacing. Don't take both seriously hoping to pick the higher score; commit to one and master it.

**Score targets by tier (digital SAT scale, 1600 max):**
- Top 10 schools (HYPSM and similar): 1530+ for competitive, 1500+ acceptable with strong everything else
- Top 25: 1480+ competitive
- Top 50: 1400+ competitive
- Strong public flagships: 1350+ competitive
- Test-optional strategy: if score is below the 25th percentile of admitted students at a target school, withhold; if above, submit. The test-optional bar is roughly the 25th percentile of admits at most selective schools.

**Wayfinder context:** if the user has a profile saved with current SAT or PSAT, anchor the recommendation to where they currently sit and what their target schools' middle 50% bands are. The student asking "should I switch to ACT" with a 1380 SAT and a target list including UCLA needs different advice than the student with a 1530 SAT asking the same question.

---

## Score impact — does going from 1480 to 1550 actually matter

**[SLM data retrieval for this exemplar]**
- Pull user's saved profile — current SAT, target school list, intended major.
- For target schools, retrieve `schools/school-<slug>.md` deep files and cite each school's published middle 50% SAT range. This grounds "is 1480 enough" in the SPECIFIC schools the user cares about, not generic advice.
- Cross-reference verified Wayfinder scholarships DB for merit-aid score thresholds at the user's target schools (Vanderbilt Cornelius, USC Trustee, Wash U Ervin, Vanderbilt Ingram, etc.).
- Note that score-weighting varies dramatically across schools: pull deep files to surface which target schools are highly score-weighted (Caltech, MIT, Berkeley EECS, CMU SCS) vs more holistic (Stanford, Princeton, Yale).
- Recommend: if user has not added their target schools to Wayfinder yet, prompt them so future continuity-class responses can build on the context.

This question gets asked constantly and the honest answer requires separating "marginal benefit" from "marginal cost."

**The marginal benefit of going from 1480 to 1550 at top-20 schools is real but modest.** Here's why. At Stanford, MIT, and Ivy-tier schools, the median admitted SAT is around 1530-1560. A 1480 puts you below the median; a 1550 puts you at the median. That moves you from the bottom-quartile band to the middle-quartile band of admits. In probability terms, that's a meaningful shift but smaller than students intuit. A 1480 admit rate is not 4% and a 1550 admit rate is not 12% — both are within a few percentage points of each other once you control for the rest of the profile (GPA, ECs, essays, school context).

**Where the score actually matters most.**
- **Crossing thresholds.** Going from 1380 to 1450 matters more than going from 1480 to 1550 because 1450 crosses the threshold for "competitive at top-20" while 1550 is just optimization within an already-competitive range.
- **Schools with higher score weighting.** Some schools weight scores more heavily than others. Caltech, MIT, Carnegie Mellon SCS, Berkeley EECS — these are highly score-weighted, and a 1550 vs 1480 may genuinely shift admit probability there. Schools with more holistic and contextual review (Stanford, Princeton, Yale) are less score-sensitive at the top end.
- **National Merit and merit aid.** Score thresholds matter for National Merit (PSAT-based) and for merit aid at many schools. Going from 1480 to 1550 can unlock $20K-$120K in merit aid at schools like USC, Vanderbilt, Wash U, and Northeastern.

**The marginal cost of going from 1480 to 1550 is high.** Each additional 10-point gain at the upper end takes roughly 5-10x the prep time of a 10-point gain in the middle band. A student going from 1380 to 1480 might gain 100 points with 40 hours of focused prep. A student going from 1480 to 1550 typically needs 80-150 hours of focused prep, often with diminishing returns. That time has opportunity cost: research projects not started, extracurriculars not deepened, essays not revised.

**The honest synthesis for a 1480 SAT student.** If you're applying to top-20 schools and your application is otherwise complete (strong ECs, good essays, contextually appropriate GPA), 1480 is enough. Spend the marginal 80-150 hours on essays, EC depth, or applications instead. If you're applying to MIT, Caltech, or Berkeley EECS specifically — schools with high score weighting — and you have realistic prep capacity for an 80-point jump, then yes, push for 1550. If you're chasing merit aid at a target school with a clear scholarship threshold (look it up — they're publicly listed), push for the threshold.

**The wrong reason to push for 1550.** Anxiety. Parents asking this question are often projecting their own anxiety onto a kid whose application is fine. The kid with a 1480 SAT, 4.0 GPA, real extracurriculars, and good essays will get into a great school — and will get into more great schools by polishing the rest of the application than by adding 70 points to the SAT.

**The right diagnostic question.** What's the bottleneck on this application right now? If it's testing, prep more. If it's essays (which is most often the case at the 1480-and-up band), spend the time on essays. If it's EC depth, spend the time on a real summer project.

---

## Activities — what matters and what's overrated

**[SLM data retrieval for this exemplar]**
- Pull user's saved profile — current ECs, intended major, target schools.
- Cross-reference verified Wayfinder internships DB: surface 2-3 specific verified paid internships in user's state/field that would strengthen profile. Internships are dramatically underused by HS students relative to their admissions value.
- Cross-reference verified Wayfinder programs DB: surface verified summer programs that would build "spike" depth in user's intended field.
- Cross-reference verified Wayfinder volunteer DB: if user has weak service signal, surface 2-3 sustained volunteer opportunities (NAMI, Habitat, etc.) — sustained engagement matters more than hours.
- Cross-reference verified Wayfinder scholarships DB: many merit scholarships explicitly recognize specific EC patterns (Coca-Cola Scholars for community impact, Davidson Fellows for original work, etc.).
- For each target school, pull `schools/school-<slug>.md` deep files: different schools weight ECs differently (Stanford reads for "intellectual vitality," MIT for technical achievement, Yale for community contribution).
- Recommend: open Wayfinder's verified internships, programs, and volunteer modules for full filtered browse.

There's a common belief among parents that admissions wants well-rounded students with broad activity portfolios. This was true 20 years ago. It is no longer true. The shift over the past decade is decisive: top schools want shaped students, not well-rounded ones. The well-rounded student is now considered "well-rounded but unfocused," which is a polite way of saying "no clear value proposition."

**What admissions readers actually weight at top schools (in roughly descending order):**

1. **Demonstrated depth in 1-2 areas.** Three or four years deep in something with measurable impact, leadership, or recognition. Examples: research leading to a paper or poster; founded organization with sustained scale; varsity athlete with state-level ranking; serious musician with regional/national recognition; nonprofit with measurable beneficiaries; debate team captain with state placement; published writer with real outlets.

2. **Initiative and execution.** Did the student make something happen that wouldn't have happened without them? Founding, organizing, building, leading. AOs are not impressed by "joined the club"; they are impressed by "I noticed nobody was doing X, so I built it."

3. **Sustained engagement over time.** Three years in one activity is much stronger than one year in three activities. The activity that survives the student's transition from sophomore-curious-about-everything to junior-clear-about-priorities is the activity that gets weight.

4. **Coherent narrative.** The activities together tell a story about who this student is and what they care about. The kid whose activities are tutoring + math team + research + Math Olympiad has a clear narrative (math person who cares about teaching). The kid whose activities are tennis + drama club + Model UN + tutoring has activities but no narrative.

5. **Impact on others.** Did the activity benefit anyone besides the student? Tutoring, mentoring, organizing, building things for community — these read as more meaningful than purely self-developmental activities.

**What's overrated by parents and ignored or discounted by AOs:**

1. **"Membership" activities.** Joining the National Honor Society, Key Club, etc., without a leadership role is admissions-neutral. These are listed by 70%+ of applicants to top schools. They do not differentiate.

2. **Volunteer hours without depth.** "150 hours of community service" through generic school-organized activities reads as resume-padding. AOs want to see one organization the student stuck with, not a hours-counter.

3. **Pay-to-play summer programs at prestige universities.** "Attended Summer Program at Stanford/Harvard/Brown" is a known signal for "family had $7,000 to spend on a credential" — it doesn't impress admissions. Selective free/paid programs (RSI, MITES, Telluride, Iowa Young Writers' Studio, COSMOS for some students) DO impress because the selectivity is real. The distinction matters.

4. **Generic "started a club at my school."** Without sustained scale and impact, this reads as resume-padding. Founding a club that meets twice and then dies is worse than not founding it.

5. **"Captain" of a team if the team is small or low-achievement.** Captain of a varsity team that placed at state matters. Captain of a JV team with 8 players matters less. Captain of a club team with no record matters even less.

6. **Generic "passionate about X" without evidence.** Telling AOs you're passionate about social justice without doing anything specific about it is a red flag. Doing the work without using the word "passionate" is much stronger.

**What's underrated (recommend more of these):**

1. **Sustained part-time job.** A student who works 15+ hours/week at a real job throughout high school — coffee shop, restaurant, tutoring center — signals work ethic, time management, and exposure to adults outside their bubble. This is dramatically underrated by parents who think paid work is "less impressive" than unpaid extracurriculars. AOs see it as significant evidence of maturity.

2. **Independent intellectual work.** Self-directed research, independent reading deeply in a field, building a personal project (open-source contribution, personal essay portfolio, blog with real readership) — all signal genuine intellectual engagement that doesn't fit the standard EC bucket.

3. **Family responsibility.** Caring for younger siblings, serving as a translator for parents, working in a family business — these are admissions-meaningful when authentic. The "additional info" section is the right place to surface them, briefly and without self-pity.

**The diagnostic question for parents.** "If your kid had to defend each activity in an interview, would they have something specific and authentic to say about it, or would they sound like they were checking a box?" The activities that pass this test are real. The ones that don't, drop them.

**The diagnostic for narrative.** "Read your kid's activity list to a friend who doesn't know them. What do they say your kid cares about?" If the friend can't answer, the list is unfocused. The activity list is supposed to read like a coherent person.

---

## Early application strategy (ED, EA, REA, SCEA, ED2)

**[SLM data retrieval for this exemplar]**
- Pull user's saved profile + saved school list. Recommend specific early-app strategy tied to THEIR list, not generic.
- For each ED/EA/REA-eligible school in user's list, pull `schools/school-<slug>.md` deep file. Cite each school's specific early-vs-RD admit rate split, ED1 vs ED2 availability, REA/SCEA restrictions.
- Cross-reference verified Wayfinder scholarships DB: some scholarships have early-application alignment requirements or deadlines tied to ED.
- Recommend: Wayfinder Essay Reviewer for early-app supplements (compressed timeline, October submissions need careful drafting).
- If user is paid + engine quota: this is a strategic-synthesis-class question — auto-promote to Engine + Head Consultant supplement.

Early application terminology is genuinely confusing because schools use slightly different conventions. Here's the clean breakdown:

**Early Decision (ED).** Binding. You apply by November (typically), get a decision by December, and if admitted you must enroll. You can only apply ED to ONE school. You can also apply EA elsewhere where allowed. Penn, Duke, Northwestern, Cornell, Brown, Dartmouth, Columbia, Vanderbilt, Wash U, Rice, Emory, JHU, Notre Dame, Tufts, Bowdoin, Williams, Amherst all offer ED. Most ED schools fill 40-55% of their class through ED.

**Early Decision II (ED2).** Same binding rules as ED1, but with later deadline (typically January). For students who weren't ready in November, were rejected/deferred from ED1, or whose top choice changed mid-fall. Schools offering ED2 include Vanderbilt, Wash U, Emory, NYU, Tufts, Brandeis, Bowdoin, and several others. ED2 admit rates are lower than ED1 but typically still better than RD.

**Early Action (EA).** Non-binding. You apply early, get a decision early, and have until May 1 to decide. You can apply EA to multiple schools (with restrictions for REA/SCEA — see below). Many schools offer regular EA: MIT, Caltech, Georgetown, Notre Dame, Boston College, U Chicago, U Michigan, UVA, UNC, and most public flagships. EA at most of these schools gives a small admit boost.

**Restrictive Early Action (REA) / Single-Choice Early Action (SCEA).** Non-binding (you have until May 1 to decide), but you cannot apply ED or REA/SCEA elsewhere. You CAN typically apply EA to public universities, foreign universities, and some specific exceptions per school. Stanford uses REA. Yale, Princeton, Harvard, Notre Dame use SCEA. The terms mean essentially the same thing functionally.

**Strategic application by student type:**

- **Student with a clear top choice that offers ED, plus financial flexibility.** Apply ED to that top choice. Best statistical boost, signals commitment. Examples: Penn ED if Penn is the dream; Duke ED for a Southeast applicant; Northwestern ED for a journalism kid.

- **Student aiming at HYPSM with a slight edge at one of them.** Apply REA/SCEA to the slight-edge school. The non-binding aspect protects optionality. Stanford REA, Yale SCEA, Princeton SCEA, Harvard SCEA — pick the one where you have the strongest case. Do NOT apply REA/SCEA + ED elsewhere; the restrictions disallow it. You can still apply EA to public universities and foreign schools, which is usually the play.

- **Student without a clear top choice.** Skip ED entirely. Apply EA to as many EA schools as possible (MIT, Caltech, U Chicago, Georgetown, U Michigan, UVA, UNC, etc.) and apply RD to the rest. Get multiple early decisions to have data when comparing fit in spring.

- **Student deferred or rejected from ED1.** Strong candidate for ED2 at a slightly less reachy school. The signal of "you were my second choice" is offset by the boost of binding commitment.

- **Recruited athlete or specific institutional priority.** Likely-letter or admissions advisor coordination usually drives application timing. Trust the coach/AO communication.

**The wrong reason to apply ED.** Anxiety + parents pushing. ED commits a student to a school they may not actually want most. The give-up cost (no comparing aid, no seeing what March brings) is real. Only ED if the family is genuinely happy with the outcome regardless of what RD might have produced.

**The wrong reason to apply REA/SCEA.** Underestimating that you're competing against the strongest possible early pool. REA at Stanford is not a 7% admit rate for you — it's a 4-6% admit rate for an unhooked applicant in the strongest applicant pool in higher education. Apply REA/SCEA only if you would have applied to that school RD anyway and you're willing to spend the early application slot on the long shot.

**Critical timing rule.** ED/REA/SCEA decisions force you to have your application — essays, recommendations, transcript, test scores — finalized in October. Most students underestimate the time required. Start essays in summer; have draft 2 by Labor Day; final by mid-October. The student who is still revising essays the week of ED deadline is going to submit a weaker application than they could have RD.

---

## "Spike" development — what it actually means and how late is too late

**[SLM data retrieval for this exemplar]**
- Pull user's saved profile — current grade, intended major, current ECs, target schools.
- Cross-reference verified Wayfinder programs DB for spike-building summer programs aligned with intended major (RSI for STEM research, Concord Review for history writing, YoungArts for arts, USACO/USAMO/USAPhO/USABO competition prep, Polygence for self-directed research).
- Cross-reference verified Wayfinder internships DB: a strong sustained internship in field-of-interest is itself a spike component.
- Cross-reference verified Wayfinder volunteer DB: founding/leading a sustained service program is a spike component if executed at scale.
- For target schools, pull `schools/school-<slug>.md` deep files: different schools weight different spike types (research-heavy schools want academic spike, entrepreneurship schools want building/founding spike, public service schools want impact spike).
- Recommend: based on user's grade, the realistic spike path. Sophomores have time; juniors have a year; seniors should focus on amplifying what they have rather than starting new.

"Spike" entered college admissions vocabulary roughly a decade ago and is now overused to the point of being a stress-inducing buzzword for parents. Here's what it actually means and what it doesn't.

**What spike actually means.** A spike is a concentrated area of demonstrated excellence that signals to AOs "this kid is going to do something specific and notable, not just be a generally strong student." It contrasts with the older "well-rounded" model where students were expected to be good at lots of things.

A spike is NOT:
- Just intensity in one area
- Just being good at one subject in school
- Just listing a lot of activities in one category
- A specific awards count or specific GPA

A spike IS:
- Demonstrated excellence at a level beyond peers
- Sustained engagement (multi-year commitment)
- External validation (recognition, leadership, output, impact)
- A clear narrative the student can explain in interview-style depth

**Examples of strong spikes by category:**
- Academic: USAMO qualifier (math), USACO Platinum (CS), Intel ISEF finalist (research), Concord Review publication (history), NCTE writing award
- Athletic: state ranking in a sport, recruited-athlete-tier achievement, junior national-level competition
- Arts: regional/national recognition (YoungArts, Scholastic Gold/Silver Key, NFAA), portfolio quality at art-school admit level
- Service/leadership: founded sustained organization (50+ beneficiaries, multi-year), held leadership role with measurable impact
- Entrepreneurship: built company with revenue/users, sustained nonprofit, published product
- Research: contribution to peer-reviewed paper, presentation at recognized conference, original work with mentorship

**The hard truth about spike depth.** A real spike at the top-school level usually requires 2-4 years of sustained focus, often including a national or regional recognition that's hard to fake. A junior asking "how do I develop a spike now?" is asking the question late but not too late.

**Late-spike strategies for juniors.** Junior year is the inflection point. By end of junior year, a spike that didn't exist freshman/sophomore year can be built — but only by focusing intensely from now through summer.

The realistic moves:
- **Go deep on something already started.** If the student has been doing one activity casually for two years, the path is to take it from casual to serious. Tennis player → state-level training. Coder → USACO + open-source contribution. Writer → published in real outlet + Concord Review submission.
- **Pick a national-level competition aligned with academic interests and prep hard.** USACO, USAMO/AIME, Olympiad cycles, Concord Review, Scholastic Awards, YoungArts. Even reaching qualifying rounds (USAMO qualifier from AIME, Concord Review acceptance, Scholastic Silver Key) is meaningful evidence of seriousness.
- **Build something tangible over the summer.** Founded program, shipped open-source tool, published research, started a sustained organization. Summer of junior year is the last big window.
- **Synthesize existing activities into a clear narrative.** Sometimes the spike already exists in disguise. The kid with three CS-adjacent activities just needs to articulate the through-line and add one capstone (a project, a paper, a sustained organization).

**When it's too late for a real spike.** If a student is starting senior year with no clear concentration in anything, the realistic strategy is not to fake a spike but to apply with their actual profile to schools that don't require a spike. Most schools outside the top 25 don't expect a spike. Plenty of strong schools (UMich, UNC, Wisconsin, Indiana, big state flagships, top LACs slightly below top 10) will admit a strong well-rounded student without a sharp spike.

**Parents asking this question for sophomores.** Good. Sophomore is exactly the right time. Find what the kid is actually drawn to, support sustained engagement in that direction, look for one or two competitions or programs that provide external validation by junior year. Don't manufacture spike around something the kid doesn't care about; AOs read manufactured spike as obviously inauthentic.

**The diagnostic for whether a spike is real.** Can the student talk about it for 30 minutes in detail without prompting? If yes, it's real. If they need notes or prompts, it's a resume entry, not a spike.

**The painful truth for stressed parents.** Spike anxiety is mostly imported from college consulting culture. The student who is genuinely good at something and engages deeply over multiple years — even if that something doesn't fit the standard "spike" categories — will be admitted to good schools. The student who is stressed into manufacturing a spike will produce a forced narrative that AOs see through. Authenticity beats resume engineering, even at the top schools.

---

## Reasoning patterns the SLM should recognize and apply

Across these general-admissions exemplars:

1. **Always separate the question from the anxiety driving it.** Parents asking "should we hire a counselor" are usually asking "is my kid going to be okay." Address both.
2. **Concrete numbers beat vague guidance.** Score thresholds, hour counts, percentile bands. Specificity reads as expertise.
3. **Surface the wrong-reason version of the question.** "The wrong reason to do X is Y" — this is what makes the response feel like coaching, not generic advice.
4. **Acknowledge what's overrated.** Parents and students absorb a lot of folklore. Naming it explicitly ("pay-to-play summer programs are admissions-neutral") builds trust.
5. **Recommend tied to profile AND verified Wayfinder data.** Generic "look for summer programs in your field" is what Gemini gives. "Wayfinder has X verified summer programs in your state/field; here are the top 3 that match your profile" is what Wayfinder gives. The verified DB injection is the structural advantage.
6. **End with diagnostic question PLUS specific Wayfinder action.** "Want me to pull up the verified internships in WA matching CS interests?" or "Should I open the school deep files for your reach list?" — these surface Wayfinder's unique capabilities and drive engagement.

**The Wayfinder synthesis advantage for general admissions:** this is the question class where Gemini, ChatGPT, Claude have the strongest training data signal. Wayfinder beats them not by writing better generic advice (we won't always — they have huge models) but by making EVERY response feel personalized to the user's saved profile and grounded in verified Wayfinder data. The user should never feel like they got a generic answer.
