# Exemplar — Strategic synthesis chat responses

> **INTERNAL RAG INSTRUCTION (do not paraphrase to user):** All blocks marked `[SLM data retrieval]`, `**CRITICAL — Wayfinder data sources**`, `**Critical SLM instruction**`, the `**The structural play:**` sentences, and the `## Reasoning patterns` section at the bottom are GUIDANCE for HOW to construct your response. They are not user-facing content. Never quote them back to the user. Never echo phrases like "Wayfinder synthesis advantage" or "Gemini gives generic, Wayfinder gives X" to users — those are internal framing. Use them to inform the response; the response itself should sound like a thoughtful college admissions advisor, not a meta-discussion of how the chatbot works.


This file contains pre-synthesized Opus-grade reasoning for the strategic-synthesis question class that dominates main chat (ED/REA decisions, school list construction, school comparisons, summer strategy choices, EC narrative framing). RAG retrieval should surface the closest-matching exemplar to ground SLM responses; SLM paraphrases into the user's specific context.

These are not templates to copy verbatim — they are reasoning patterns and content reservoirs the SLM can pull from. The depth, the multi-axis tradeoff analysis, and the AO-insider voice are what matter. The numerical facts (admit rates, percentile bands) should be sanity-checked against current cycle data when used.

**CRITICAL — Wayfinder data sources to retrieve and weave into EVERY strategic synthesis response:**

For each exemplar in this file, the SLM must combine the synthesis text below WITH live Wayfinder data:

1. **User's saved profile** — state, grade, GPA, SAT/ACT, intended major, ECs, financial situation. NEVER ask the user to re-state these facts. Use them implicitly.
2. **School deep files** — for any school named in the query, retrieve `backend/knowledge-base/schools/school-<slug>.md`. Wayfinder has an extensive deep file library. Cite specific institutional facts (admit weighting, recent essay shifts, demonstrated interest policy, post-SFFA changes) the user couldn't get from a generic chatbot.
3. **Verified curated DBs** — for any strategic recommendation involving programs/internships/scholarships/volunteer, surface verified entries from `backend/data/scraped/*.json`. Never fabricate.
4. **Session continuity** — if prior conversation discussed related strategic decisions, reference it explicitly ("Last time we worked through X").
5. **Engine + Head Consultant supplement** — strategic synthesis IS the question class HC was built for. Auto-promote paid users with engine quota; the supplement should fire on these queries.
6. **Cross-module suggestions** — Essay Reviewer for any essay implication, AP Coach for academic rigor questions, verified DB modules for action items.

The structural advantage over Gemini/ChatGPT/Claude is the combination of synthesis (this file) + live Wayfinder data. Synthesis alone matches frontier; synthesis + data beats it.

---

**Also known as / synonyms:** ED vs REA, Early Decision Early Action, build school list, balanced college list, summer choice, summer strategy, quitting activity, drop EC, school comparison, peer school comparison, strategic admissions, application strategy, college strategy.

## ED vs REA strategic decision (Penn ED vs Stanford REA archetype)

**[SLM data retrieval for this exemplar]**
- Pull `schools/school-penn.md` AND `schools/school-stanford.md` deep files. Cite each school's specific admit weighting, recent ED/REA admit rates from the deep file, and current essay landscape.
- Pull user's saved profile (GPA, SAT, intended major, financial situation, geographic location). NEVER ask them to re-state.
- Cross-reference: if user has saved school list, identify whether other ED-eligible schools should be considered as alternates (Duke ED, Northwestern ED, etc. — pull each candidate's school deep file).
- Recommend: Wayfinder Essay Reviewer for the early-app supplements they'll need by November.
- If user is paid + engine-quota remaining: this exemplar should trigger Head Consultant supplement automatically.

When a student asks whether to apply ED to one school or REA/SCEA to another, the decision lives across three layers most students conflate. Separate them and the choice gets clear.

**Layer 1: Binding vs non-binding optionality.** ED is binding — admit means enroll, no comparing financial aid offers in March. REA/SCEA is non-binding — you can still apply RD elsewhere and choose between offers. For full-pay families this matters less financially but matters psychologically: with ED you commit before seeing what March might bring. For families who would deeply regret not seeing what other top schools would do, the optionality of REA is worth the lower admit boost. For students whose family can be fully happy at the ED school regardless, the binding factor is feature, not bug.

**Layer 2: Admit-rate math, but pool-aware.** Penn ED has hovered ~14-15% admit rate, RD ~4-5%. Stanford REA ~7-8%, RD ~3-4%. Both schools give early applicants a 2-3x boost in nominal admit rate. But that's not the right comparison — you don't compete against the average ED applicant, you compete against the ED applicant pool that's like you. Stanford's REA pool is the strongest applicant pool of any school in the world; the kid with USACO Platinum, three published papers, and founder credentials is REA-ing Stanford. Penn's ED pool is also strong but less hyper-stratified. So a profile of 1530 SAT, 4.0 UW, 5 APs, strong-but-not-national CS extracurriculars sits roughly at the median of Penn ED admits and roughly at the 25th percentile of Stanford REA admits. The Penn boost is real for this profile; the Stanford boost is largely consumed by a stronger applicant pool.

**Layer 3: Yield signaling.** Penn cares about yield (the percentage of admits who enroll) and ED is the strongest possible yield signal. Stanford's yield is over 80% — they don't need to chase. So ED at Penn moves the needle for institutional reasons that don't apply at Stanford. This is also true at most non-HYPSM schools that offer ED (Northwestern, Vanderbilt, Wash U, Duke, Cornell, Brown, Columbia, Dartmouth, Penn, Rice, Emory, JHU, Notre Dame). Yield-protective ED gives a meaningful boost; yield-irrelevant REA gives a smaller boost.

**The honest synthesis for a 1530/4.0/strong-CS-no-national-awards profile:** Penn ED is roughly 15-20% probability for this applicant. Stanford REA is roughly 4-6% probability. Penn ED is the higher-EV play if the student would be genuinely happy at Penn. The wrong reason to pick Stanford REA is "it feels less risky because non-binding" — non-binding REA does not equal lower commitment to a long-shot; it just means you can still get rejected and have RD options.

**The real question to interrogate** before locking in ED at any school: "Will my family and I be fully happy here, even if Stanford/MIT/HYP would have admitted me in RD?" If the answer is anything less than yes, the ED bet is wrong even if the math says yes. Optionality has real value to the kid who hasn't yet processed what they want; ED is for the kid who knows.

**Wayfinder-specific application:** if the student has a profile saved (state, intended major, family financials), reference whether their reach list includes other ED-eligible schools they should consider as alternates (e.g., Duke ED has stronger boost for non-national-award profiles than Penn ED for some majors; Northwestern ED is undervalued for journalism/comm). Use the verified school deep files to ground the recommendation in institutional specifics.

---

## Building a balanced 12-school list

**[SLM data retrieval for this exemplar]**
- Pull user's saved profile (state, GPA, SAT, intended major, financials, geographic preferences). Build the list grounded in their actual stats, not generic placeholder numbers.
- For EACH candidate school proposed, pull `schools/school-<slug>.md` deep file. Cite specific admit weighting and fit signals from each.
- Cross-reference verified Wayfinder programs DB: surface 2-3 verified summer programs aligned with each tier of school (e.g., research programs that strengthen MIT/Stanford applications, business programs that strengthen Wharton applications).
- Cross-reference verified Wayfinder scholarships DB: if user is full-pay, skip; if not, surface merit aid possibilities at proposed schools (Vanderbilt's Cornelius Vanderbilt, Wash U's Ervin, USC's Trustee, etc.).
- If user has saved school list already: COMPARE against existing list, recommend adds/drops with reasons grounded in their profile.
- Recommend: Wayfinder Engine mode (auto-promote if paid) for the synthesis depth this question requires.

A balanced list at any stat level should run roughly 4 reaches, 4 matches, 4 likelies. Most students over-weight reaches because the names are exciting and under-weight likelies because they don't feel like college admissions success. That's the wrong instinct. Likelies are how you guarantee a good outcome; reaches are how you swing for the upper bound. Both layers must be real and committed-to.

**For a 3.9 UW / 1480 SAT / strong CS-focused junior with full-pay capability:**

*Reaches* (admit rate <15% for this profile):
- MIT — long shot. 1480 is below median, lacking national CS awards is the limiting factor. Apply only if the student would genuinely thrive in MIT culture (intense, technical, problem-set-driven). Otherwise it's a wasted slot.
- Stanford — long shot for the same reasons. REA-able if going early, but profile is roughly 25th percentile.
- Carnegie Mellon SCS — most stratified CS program in the country; profile is at low end of admits but in the conversation if extracurriculars show real CS depth (not just "interested in CS"). CMU separates SCS from other CMU schools — applying SCS is a different game than applying CMU broadly.
- Princeton — broadly strong, no separate CS admit; if the student would thrive at a research-heavy general institution (and isn't tied to specifically wanting a CS-anchored undergrad culture), it's a real reach not a waste.

*Matches* (admit rate 15-30% for this profile):
- UCLA / UC Berkeley — for OOS at these stats, both lean reach-match. Berkeley CS specifically is an EECS or CS-in-LS distinction; Berkeley EECS is reach territory. UCLA CS is more accessible.
- USC Viterbi — climbing institutionally; CS at Viterbi is well-funded; LA pipeline is strong. Match.
- Georgia Tech CS — public-school value at private-school CS quality. Strong match for OOS at these stats. Atlanta tech ecosystem is real.
- UMich CS — Ann Arbor is a real engineering school; Michigan CS pipeline to FAANG is excellent. Match.

*Likelies* (admit rate 30%+ for this profile):
- UW Seattle — in-state. CS direct admit is competitive but at these stats the pre-major-to-CS path is a strong likely. Don't sleep on UW; CS faculty is top-10 nationally and Seattle proximity to industry is a real four-year asset.
- UMass Amherst CS — public, ranked, strong likely.
- UIUC CS — Big-10 powerhouse; profile is above their CS median for OOS. Strong likely.
- Purdue CS — strong likely; Indiana's flagship engineering school.

**Reasoning behind the structure:**
- All 12 are CS-strong. No "well-rounded" reach schools (Brown, Cornell CALS, etc.) that dilute the strategy. CS-focused student → CS-focused list.
- East/West split per request: 6 West (West Coast leaning) / 6 East-Midwest. Adjust to taste.
- Full-pay assumption means I didn't optimize for merit aid. If merit matters, swap one of the matches for Vanderbilt, Wash U, or Northeastern (all with generous merit programs). For pure-merit hunting, swap a likely for U of Alabama or Arizona State CS (both offer near-full merit at this stat level for engineering).
- No safety below profile level. UW in-state is functionally the safety because it's accessible and excellent. Don't add a "guaranteed admit" school below profile level just to feel safe — the student will never enroll there.

**What's missing from this archetype:** liberal arts colleges. Excluded because a CS-focused student typically gets weaker CS at LACs (smaller faculty, fewer specialized courses). If LAC fit matters for cultural reasons, swap a match for Harvey Mudd (CS-strong LAC, paired with the 5C consortium) or Pomona (consortium with HMC for CS courses).

**Variants to surface:**
- East-Coast curious: drop UCLA, add Cornell Engineering (match-leaning-reach for these stats).
- Research-driven: emphasize Princeton, Berkeley, Georgia Tech, UW (research powerhouses).
- Industry pipeline focused: emphasize CMU, Stanford, Georgia Tech, UMich (FAANG/recruiting hubs).
- Lower-stress likelies: UW + UMass + UIUC + a strong in-state public is enough; don't over-engineer the safety floor.

**The diagnostic question for the student:** would you rather have a list that feels exciting (reaches dominant) or a list that feels strategic (likelies guaranteed)? A balanced list does both. The kid who only applies to reaches is gambling; the kid who only applies to safeties is sandbagging. Twelve schools, four-four-four, with each reach and each likely defensible as a school the student would genuinely attend.

---

## Comparing peer-tier liberal arts colleges (Pomona vs Williams vs Amherst archetype)

**[SLM data retrieval for this exemplar]**
- Pull `schools/school-pomona.md`, `schools/school-williams.md`, `schools/school-amherst.md` (or whichever schools are being compared) deep files. The institutional specifics (tutorial system documented at Williams, open curriculum at Amherst, 5C consortium at Pomona) come from these files.
- Pull user's saved profile — particularly intended major, geographic preferences, social/cultural fit signals from prior conversation.
- If user has Korean-American background, cross-reference `intl/korea/strategies/` for Korean-student community at each school (this is unique Wayfinder context Gemini cannot match).
- Cross-reference verified internships/programs DB for summer opportunities that strengthen LAC applications specifically (LAC AOs care about depth and authenticity, not flashy credentials).
- Recommend: continuity follow-up to refine fit further once user articulates priority rankings.

When students compare three or four schools at the same prestige tier, the right answer almost never lives at the prestige level — they're indistinguishable on that axis. The answer lives in cultural fit, pedagogy, and what kind of four years the student wants. The honest synthesis for elite LAC comparisons:

**Williams:** most academically intense of any elite LAC. The tutorial system (modeled on Oxford) puts you in a 1-2 student class with a senior professor for an entire semester. About 30% of students do at least one tutorial. For a humanities-focused student, this is the closest experience to a graduate seminar at the undergrad level — and is structurally embedded, not optional. Williams has the highest academic-attention-per-dollar of any US college. Tradeoffs: the intensity can feel airless; isolation in the Berkshires is real (nearest substantial town is 90 minutes); the social culture is more academically intense than peer LACs. If a student would thrive on intense intellectual engagement and doesn't need urban energy, Williams is the right answer.

**Amherst:** most curricular freedom. Open curriculum (no distribution requirements) lets a humanities student build a path with no science/math obligation. Five-College Consortium (Smith, Mt Holyoke, Hampshire, UMass) opens thousands of additional courses. Amherst is also more demographically diverse than Williams. Mentorship is strong but less structurally embedded than Williams's tutorial system — students must seek it more actively. If maximum curricular freedom and consortium-scale resources matter, Amherst.

**Pomona:** warmest culture of any elite LAC, hands-down. The 5C Claremont consortium (Mudd, CMC, Pitzer, Scripps) gives cross-registration in CS, business, applied fields. Pomona itself is anchored in liberal arts. SoCal weather + accessible LA culture is a genuinely different daily experience from rural Massachusetts. Mentorship is strong; faculty-student ratio is similar to peers (8:1) but the culture pushes professors toward genuine engagement. The probability that a student is happy at Pomona over four years is higher than at Williams or Amherst, holding stats constant. If close mentorship + warmth + SoCal + consortium optionality is the brief, Pomona.

**For a humanities-focused student specifically:**
- Williams's tutorial system is the single biggest pedagogical advantage in US LAC education. Nothing else replicates 14-week 1-on-1 with senior faculty.
- Amherst's open curriculum lets the student go deep on humanities without distraction.
- Pomona has the strongest "you'll be genuinely happy four years from now" probability.

**The recommendation framework:** if mentorship is the top priority and the student can stomach intellectual intensity, Williams. If the student wants to enjoy four years and still get top-tier mentorship, Pomona. Amherst sits between, slightly closer to Williams in academic feel, slightly closer to Pomona in cultural breadth.

**The diagnostic question:** would the student rather feel intellectually challenged in a way that occasionally exhausts (Williams), or feel intellectually fulfilled in a way that energizes (Pomona)? Amherst is closer to Pomona on this axis than to Williams, despite being in the same New England academic tradition.

**Visit-level signal:** the dorm walk-through and the dining hall feel will tell more than admissions stats. Williams dorms feel academic-residential (people working in lounges); Pomona dorms feel social-residential (people hanging out); Amherst sits between. If a visit isn't possible, current-student-Reddit threads from each school's subreddit reveal more than promotional materials.

---

## Summer strategy (paid internship vs research vs nonprofit)

**[SLM data retrieval for this exemplar]**
- Pull user's saved profile — intended major, target school list, current ECs, geographic location.
- Cross-reference verified Wayfinder internships DB for similar paid options the user might not know about (state-filtered, field-filtered). Surface 2-3 specific verified internships as alternatives or complements.
- Cross-reference verified Wayfinder programs DB for research-track summer programs (RSI, COSMOS, MITES, Clark Scholars, Garcia Program) that may be stronger signals than local research with one professor.
- Cross-reference verified Wayfinder volunteer DB for community-impact options that scale faster than starting a nonprofit from scratch (joining and leading at NAMI, RAINN, Habitat, etc.).
- Pull saved school list deep files: research-heavy schools (MIT, Stanford, Princeton, CMU) want different summer signals than industry-pipeline schools (Berkeley, Georgia Tech, UMich).
- Recommend: open Wayfinder's verified internships and programs modules for filtered browse; use Engine mode (auto-promote) for the strategic synthesis depth.

When a student is choosing between a paid SWE internship at a startup, unpaid research with a professor, and starting their own nonprofit, the answer depends on what gap their application has and what schools they're targeting — not on which option is "best" abstractly.

**Paid SWE internship at a 50-person startup, real project scope:** highest signal-to-effort ratio for top-CS-program admissions. AOs read thousands of "interested in CS" applications; what differentiates is evidence the student can execute. A startup paying you means they need your output, not just your shadowing. The signal depends entirely on the project scope: "worked at startup" is mediocre; "shipped feature X used by Y users, owned the recommendation engine, delivered Z metric improvement" is strong. Startups with 50 people are large enough to give real responsibility but small enough that a high schooler can have meaningful ownership. This option is highest-leverage for industry-pipeline-CS schools (CMU, Berkeley EECS, Georgia Tech, UMich, USC Viterbi).

**Unpaid research with a UW bioengineering professor:** highest signal at research-heavy universities (MIT, Stanford, CMU, Princeton, Caltech) where they're recruiting future PhD candidates. Bioengineering specifically is interesting because it shows interdisciplinary range — CS applied to biology — which reads as intellectual maturity. The risk: research is slow. The student may not have a publication or even a poster by application time. They need to be able to articulate what they contributed and what they learned, even without a deliverable. If the professor has a clear plan for a poster, paper, or shipped tool, this option is nearly as strong as the startup; if it's "help with literature review for a year," it's much weaker.

**Starting their own free coding nonprofit for middle schoolers:** the highest-risk highest-reward option. Three things admissions loves — leadership, initiative, community impact — but only if executed well. The risk: "started nonprofit" is the most-overused EC on Common Apps. AOs read 200 of these per season, and 95% are "I taught Python to 8 kids one Saturday." To make this read as real requires: (1) a recurring program (not a one-off summer event), (2) measurable scale (50+ students reached, 8+ months sustained), (3) organizational structure (curriculum, recruited volunteers, sustainability plan), (4) ideally something handed off to be maintained without you. Pulling this off in one summer is hard. If the student commits to running it through senior year as an extension of summer work, it can become genuinely differentiating.

**The honest ranking for top-20 CS programs specifically:**
1. **Startup internship with real project scope** — take it. Direct evidence of engineering execution, which CS programs care most about.
2. **Research with clear deliverable plan** — second-best. Strong for research-leaning schools.
3. **Nonprofit alone** — third for hardcore CS programs (CMU, Berkeley, MIT). Stronger for general top-20 schools that weight community impact (Princeton, Yale, Columbia, Ivies broadly).

**The hidden insight most students miss:** these aren't mutually exclusive. The startup internship is summer-bounded (8-12 weeks). The nonprofit, if real, is year-round low-intensity. The research, if real, often spans multiple semesters. A student can do startup internship + run a smaller-but-real version of the nonprofit (one Saturday/month, sustained for a year) + do part-time research during senior year. That combined profile reads stronger than any one of them in isolation, because it tells the AO this kid has range, execution, and follow-through.

**What the application is missing that drives the recommendation:** look for a national-level signal in the student's intended field. If extracurriculars are good but not nationally notable (no USACO Platinum, no published research, no top-tier hackathon wins, no founded company with traction), the summer needs to produce something quantifiably impressive. Startup internship → ship a feature with real users. Research → published poster or contribution to a paper. Nonprofit → measurable scale with letter from a sponsor or partner organization. Without something quantifiable, the application stays at "competent" instead of "differentiated."

---

## Quitting an EC to start something new (tennis to tutoring archetype)

**[SLM data retrieval for this exemplar]**
- Pull user's saved profile — current ECs, intended major, target schools (so framing matches what AOs at those schools weight).
- Pull session history — if user has discussed this transition before, reference that context.
- Cross-reference verified Wayfinder volunteer DB for tutoring organizations the new initiative could partner with or model after (gives the EC institutional credibility AOs recognize).
- Cross-reference verified Wayfinder scholarships DB for awards that recognize this kind of pivot/community impact (Coca-Cola Scholars, Prudential Spirit of Community, Bonner Scholars).
- Recommend: Wayfinder Essay Reviewer for the Additional Info paragraph that frames the transition. Essay Reviewer's voice/authenticity scoring is well-tuned for this kind of nuanced narrative — better than a generic chatbot proofread.
- Pull `schools/*.md` deep files for the user's target schools — different schools weight EC narrative differently (Brown's open curriculum culture rewards self-directed pivots more than Princeton's traditional culture).

When a student quits a multi-year activity to start something new, the framing on the Common App is the difference between "this kid is flaky" and "this kid figured out what mattered to them" — and the framing has to be earned by what they actually did.

**The wrong way to frame it:** as a discrete "I quit X to start Y" narrative. That makes activities sound like commodities you swap. AOs see through that immediately.

**The right way to frame it:** as a story about what the student discovered about themselves. Tennis was something they did, and they did it well (3 years varsity is real). At some point, they noticed something — that the kids they tutored were getting more out of an hour than they were getting out of three hours of practice; that competition was draining and teaching was filling; that the senior captain wasn't who they wanted to become but the younger students they tutored were already becoming people they wanted to know. Whatever the actual realization was, that's the story. Not "I quit"; "I learned what I cared about."

**Mechanically:**

*Activities section:* list both with accurate timeline. Tennis 9-11 with hours/role. Tutoring 10-12 with hours/role + a one-line description that signals scale and impact ("Founded weekly free tutoring program serving 30+ middle schoolers in math; recruited and trained 6 high school volunteers").

*Additional info section (or main essay if appropriate):* one paragraph max if it's additional info. Don't explain it as quitting; explain it as a recognition of where the student wanted to invest their time. Sample: "After two years of varsity tennis, I realized the hours I spent practicing competitive serves were less meaningful to me than the Saturday mornings I'd been spending teaching algebra to my neighbor's seventh grader. That winter I expanded the tutoring into a weekly free program. By junior year I'd grown it into a 30-kid operation, which made keeping varsity-level tennis impossible. Choosing tutoring over tennis wasn't a sacrifice; it was clarifying."

**Why this works:**
- Tutoring is the active choice; tennis is the thing let go consciously.
- The growth-and-recognition narrative is exactly what AOs are scoring for in essays and additional info.
- It pre-empts the "why did you quit" suspicion by making the answer "because I was building something else."
- It demonstrates self-knowledge and prioritization — both highly valued.

**What NOT to do:**
- Don't explain it in the Common App main essay unless tutoring is genuinely the centerpiece of identity. The main essay is for the most important thing about you. If tutoring is that, write the essay about the kids and the moments, not about the tennis exit.
- Don't apologize or sound defensive. "Although I had to leave the team" reads as guilt. Own the choice.
- Don't keep tennis varsity captain on the activity list with a 12-grade end date if the student actually left. Show real timelines; AOs cross-check.

**Bigger picture:** a Common App with three years varsity tennis + two years tutoring (with growth and impact) is stronger than four years varsity tennis + one year tutoring. AOs are tired of well-rounded; they want shaped. The story "this kid figured out what they cared about and pivoted toward it before it was easy or obvious" is much stronger than "this kid did everything." Quitting to build something is shaping.

**Caveat — when quitting reads as flaky:** if a student has a pattern of starting things and not finishing (joined three clubs freshman year, dropped them all sophomore year, started two new clubs junior year), the tennis-to-tutoring narrative gets contaminated by the broader pattern. AOs read the activities section as a whole. If the pattern is concerning, the additional info needs to address it directly — "I spent freshman year trying lots of things and learned which ones I actually cared about." If there's no broader pattern and tennis-to-tutoring is the only pivot, no additional context is needed.

---

## Reasoning patterns the SLM should recognize and apply

Across all five exemplars in this file:

1. **Decompose the conflated question.** ED vs REA is three separable questions, not one. Summer strategy is a function of school type, not a universal best answer. Quitting an EC is a framing problem, not a content problem.
2. **Acknowledge what most students/parents get wrong.** Lead with the misconception, then correct it. This is what makes the response feel like coaching, not generic advice.
3. **Pool-aware probability.** Admit rates are not your probability — your probability depends on where you sit in the relevant pool. Same with school comparisons: rankings are not fit, fit is institutional culture × pedagogy × student temperament.
4. **Ground in what the student/parent actually said AND what Wayfinder knows about them.** Use the saved profile. Use the school deep files for any school named. Use verified DB entries for any specific recommendation. The Wayfinder data layer is the structural advantage over generic chatbots.
5. **Recommend explicitly, then qualify.** Don't equivocate across all options. Pick one, defend it, name the conditions under which a different choice would be right.
6. **End with a question that pushes the student toward self-knowledge AND a concrete Wayfinder action.** The right last line is often a diagnostic question PLUS "want me to pull up the deep file on X?" or "should I surface verified internships matching your interest?" — this drives engagement with Wayfinder's unique capabilities.

**The Wayfinder synthesis advantage:** Gemini, ChatGPT, Claude can all write the strategic synthesis text. They CANNOT pull live verified DB entries, deep institutional knowledge for many top schools (the schools/ directory grows continuously), the user's saved profile, or prior session history. Every strategic synthesis response should explicitly weave at least 2-3 of these data sources. That's how Wayfinder structurally beats frontier on this question class.

The SLM does not need to invent these reasoning patterns at inference time. It needs to recognize the question class, retrieve the matching exemplar from this file PLUS the relevant Wayfinder data sources called out at the top of each exemplar, and paraphrase into the user's specific context.
