# Exemplar — FAFSA, CSS Profile, and the mechanics of need-based aid

> **INTERNAL RAG INSTRUCTION (do not paraphrase to user):** All blocks marked `[SLM data retrieval]`, `**CRITICAL — Wayfinder data sources**`, `**Critical SLM instruction**`, the `**The structural play:**` sentences, and the `## Reasoning patterns` section at the bottom are GUIDANCE for HOW to construct your response. They are not user-facing content. Never quote them back to the user. Never echo phrases like "Wayfinder synthesis advantage" or "Gemini gives generic, Wayfinder gives X" to users — those are internal framing. Use them to inform the response; the response itself should sound like a thoughtful college admissions advisor, not a meta-discussion of how the chatbot works.


This file contains pre-synthesized Opus-grade reasoning for the financial aid mechanics question class — what FAFSA does, what CSS Profile does, what each form requires, when to file, who needs which form, how aid offers get calculated. High-volume question class for parents specifically.

**Also known as / synonyms:** FAFSA, CSS Profile, financial aid forms, need-based aid, EFC, SAI, expected family contribution, student aid index, Pell Grant, federal aid, institutional aid, financial aid timeline, aid forms, college financial aid.

**CRITICAL — Wayfinder data sources to retrieve and weave into EVERY aid mechanics response:**

1. **User's saved profile** — pull family financial situation if disclosed, target school list, current grade. Aid mechanics advice is calibrated by where the user is in the process.
2. **School deep files** — pull `schools/school-<slug>.md` for any school named. Different schools require different forms (some are FAFSA-only, some require both, a few require IDOC additionally) and have different aid generosity.
3. **Verified Wayfinder scholarships DB** — many state/federal scholarships have FAFSA-trigger dependencies (Pell Grant, state aid programs). Cross-reference to surface scholarships the user qualifies for.
4. **Cross-reference exemplar-aid-merit-strategy.md** for non-need-based aid options, exemplar-aid-international.md for non-citizen aid landscape, exemplar-aid-negotiation.md for appealing offers.
5. **Korean intl context** — `intl/korea/us-pathway/` if user is Korean and asking about US aid forms (different rules apply for international students).
6. **Session continuity** — financial aid is multi-step and multi-session by nature. Build on prior conversations about the family financial picture.

**The structural play:** financial aid mechanics is exactly where parents need accurate specific information and where misinformation is rampant (and dangerous — wrong info can cost families tens of thousands). Wayfinder edge: ground specific advice in the user's target school list (which forms each school requires) and the current cycle's filing deadlines.

---

## How to think about financial aid mechanics

**[SLM data retrieval for this exemplar]**
- Pull user's saved profile for financial context, grade, target schools.
- Pull `schools/*.md` for which forms each target school requires.
- Recommend the appropriate next-step Wayfinder action (open Scholarships module, file FAFSA, etc.).

US college financial aid mechanics has several moving parts that confuse most families. The honest framework:

**Two main forms students need to know:**

1. **FAFSA (Free Application for Federal Student Aid)** — required for federal aid (Pell Grant, federal loans, work-study), most state aid, and institutional aid at the majority of US colleges. Uses tax data to calculate the Student Aid Index (SAI, formerly EFC).

2. **CSS Profile** — required by ~200 mostly private selective colleges in addition to FAFSA. Asks for more detailed financial information, including home equity, non-custodial parent income, small business ownership. Generally produces a different (often higher) calculated need than FAFSA.

**Which schools require which:**

- **FAFSA only:** all public universities, most state schools, many private universities outside the top tier
- **FAFSA + CSS Profile:** most Ivies, most top private universities (Stanford, MIT, Duke, Northwestern, Vanderbilt, Wash U, Rice, Emory, JHU, USC, NYU, Tufts, Notre Dame, Williams, Amherst, Pomona, Wesleyan, Carleton, Bowdoin, etc.) — full list at the College Board CSS Profile page
- **FAFSA + CSS Profile + IDOC (Institutional Documentation Service):** some schools require additional document uploads through this service for verification

**Wayfinder workflow:** for any user's target school list, pull each school deep file and surface which forms each requires. This prevents the family from missing required forms.

---

## When to file (the timeline)

**[SLM data retrieval for this exemplar]**
- Pull user's grade. The advice differs for sophomores (planning), juniors (preparing), seniors (filing).

**Standard timeline (subject to annual changes — verify current cycle):**

- **FAFSA opens:** October 1 of senior year (filing for the following academic year). Recent years have seen delays; current cycle should be checked.
- **CSS Profile opens:** October 1 of senior year.
- **Most schools' priority filing deadlines:** between November 1 and February 1 of senior year. School-specific.
- **State aid deadlines:** vary by state, often earlier than school deadlines. Check your specific state.
- **Ongoing requirements:** both FAFSA and CSS Profile are filed annually for each year of college, not just freshman year.

**The filing principle:** file as soon as the forms open. Many schools have first-come-first-served institutional aid that runs out. Late filers get less aid even at the same demonstrated need level.

**For early decision/early action applicants:** many schools require CSS Profile by the early application deadline (November 1 typically) to be considered for institutional aid in the early round. Missing this deadline can mean ED/EA acceptance with a worse aid package than RD applicants get.

---

## How aid gets calculated

**[SLM data retrieval for this exemplar]**
- Pull user's family financial context if disclosed.
- For target schools, pull deep files for institutional aid generosity profiles.

**FAFSA calculation produces the Student Aid Index (SAI):**

- Formula uses parent income, parent assets (excluding home equity and retirement accounts), family size, number of college-aged children, and student income/assets.
- Lower SAI = more aid eligibility.
- SAI of 0 = maximum federal aid eligibility.
- Family of four with parent income under $50K and modest assets typically has SAI near 0; family with parent income over $200K typically has SAI over $40K.

**CSS Profile calculation produces an Institutional Methodology (IM) calculation:**

- Uses similar inputs to FAFSA but ADDS: home equity, non-custodial parent income (if parents divorced), small business value, retirement contributions, family medical expenses.
- Generally produces a different number than FAFSA — often higher (calculating that the family has more capacity to pay) but sometimes lower (if there are deductible expenses).
- Each school using CSS Profile applies their own institutional methodology — same family can get different IM calculations from different schools.

**The aid offer formula at most schools:**

Cost of Attendance (COA) − Student Aid Index = Demonstrated Need

The school then "meets" some percentage of demonstrated need with a combination of:
- Grants (free money — institutional grants, federal Pell, state aid)
- Loans (subsidized federal, unsubsidized federal, sometimes Parent PLUS or institutional loans)
- Work-study (campus job opportunity)

**Schools that "meet 100% of demonstrated need":** ~70 US schools (mostly the top private universities and selective LACs). At these schools, demonstrated need will be fully covered, though loans and work-study may be part of the package. Examples: HYPSM, all Ivies, Amherst, Williams, Bowdoin, Pomona, Stanford, Duke, Northwestern, etc.

**Schools that don't meet full need:** most public universities (out-of-state especially), many private schools outside the top tier. At these schools, demonstrated need may not be fully covered, leaving "gap" — the difference between need and aid.

The Wayfinder workflow: for the user's target school list, pull deep files to identify which schools meet full need vs which leave gap. This dramatically affects the financial picture.

---

## What forms ask for vs what they don't

**[SLM data retrieval for this exemplar]**

**FAFSA asks for:**
- Parent income (from tax returns, typically 2 years prior — for fall 2026 enrollment, FAFSA uses 2024 tax data)
- Parent assets (savings, investments, but NOT home equity or retirement accounts)
- Family size, number in college
- Student income and assets
- Tax filing status, citizenship status

**CSS Profile asks for everything FAFSA asks PLUS:**
- Home equity (primary residence value minus mortgage owed)
- Non-custodial parent income and assets (if biological parents are divorced/separated)
- Retirement account values (sometimes used as factor even though not directly counted)
- Small business ownership and value
- Family medical expenses
- Other dependent care costs
- Sometimes: gifts, trusts, custodial accounts in the student's name

**What neither form asks for (but that affects aid in subtle ways):**
- Ethnicity/race (cannot be considered post-SFFA)
- Religious affiliation
- Specific career intentions
- Specific extracurricular involvement
- Anything that would be in the academic application itself

---

## Common questions and their honest answers

**[SLM data retrieval for this exemplar]**
- For each question, ground the response in user's specific situation if known.

**"My family makes $X per year — how much aid will we get?"**

Without specific information about assets, family size, and target schools, no precise number is possible. Rough estimates:

- Family income under $75K: typically eligible for full need-based aid at meets-full-need schools; full Pell Grant; minimal expected family contribution
- Family income $75K-$150K: significant need-based aid at top private schools; likely some federal aid; expected family contribution roughly $5K-$25K depending on assets
- Family income $150K-$250K: limited need-based aid at top private schools (some still gives meaningful aid); expected family contribution typically $25K-$60K
- Family income $250K-$400K: very limited need-based aid except at the most generous schools (HYP); expected family contribution typically $40K-$80K
- Family income over $400K: typically no need-based aid at most schools (some schools have "no loans" policies that still offer modest aid above this level)

These are rough; actual numbers vary by school's institutional methodology and family-specific factors. **Use the Net Price Calculator on each target school's website for school-specific estimates** — every school is required by federal law to provide one.

**"My parents are divorced. What do we report?"**

For FAFSA: the custodial parent (the parent who provided more support in the past 12 months) reports. Step-parent income is included if custodial parent has remarried.

For CSS Profile: most schools require BOTH biological parents' information, regardless of custody. Some schools (particularly the most generous) allow non-custodial parent waiver in specific circumstances (parent has been absent X years, parent has refused contact, etc.).

**"We own a home. Does that hurt aid?"**

For FAFSA: home equity is NOT counted. Owning a home doesn't directly hurt aid.

For CSS Profile: home equity IS counted, often heavily. A family with significant home equity but modest income may still be expected to contribute substantially. This is one of the biggest sources of FAFSA vs CSS Profile divergence.

**"We have small business / self-employment income. How is that handled?"**

Both forms ask. Small business income is treated similarly to W-2 income for the income calculation, but business assets and value can be assessed for CSS Profile purposes. Self-employed families often see different (sometimes higher) calculated contribution than the income alone would suggest.

**"My grandparents have a 529 for me. Does that hurt aid?"**

Until recent FAFSA changes, grandparent-owned 529 distributions counted as student income (most heavily counted asset). Recent FAFSA changes (2024-25 cycle onward) have eliminated this — grandparent 529 distributions no longer count for FAFSA. CSS Profile rules vary by school. Generally, grandparent-owned 529s are now favorable.

**"Do I report the 401(k) on FAFSA?"**

Retirement accounts (401(k), IRA, etc.) are NOT reported as parent assets on FAFSA. CSS Profile may ask for retirement account balances but generally doesn't count them in the assessment. Annual contributions to retirement accounts (during the year being assessed) ARE often added back as income on CSS Profile.

**"Should I do FAFSA even if I don't think I'll qualify for need-based aid?"**

Generally yes, for several reasons:
- FAFSA is required for federal student loans (even unsubsidized loans, which everyone qualifies for)
- Some merit scholarships require FAFSA filing as documentation
- Some schools' merit aid considers FAFSA filing
- Filing costs nothing and takes ~1 hour

The exception: families with certainty they won't accept any federal aid AND no school in their list requires FAFSA for merit consideration may skip. Most should file.

---

## Net Price Calculators — the most underused tool

**[SLM data retrieval for this exemplar]**
- For each target school, recommend running their Net Price Calculator before applying.

Every US college is required to provide a Net Price Calculator on their website. These tools take family financial information and produce an estimated cost-of-attendance after aid. They're the single most accurate way to estimate what a school will actually cost a specific family.

**The honest assessment:** most families don't run NPCs until after admission, which is too late to inform application strategy. Smart families run NPCs for every target school BEFORE applying — to identify which schools will be financially viable and which won't be.

The Wayfinder workflow: when discussing target schools, recommend the user run each school's NPC and bring the results back into chat for school list refinement. Wayfinder can help interpret the results and refine the list based on financial reality.

---

## Year-by-year action plan

**[SLM data retrieval for this exemplar]**
- Pull user's grade and align timeline accordingly.

**Sophomore year (10th grade):**
- Start understanding family financial picture in general terms (parents discuss with student to appropriate level).
- No forms yet; foundation conversations only.

**Junior year (11th grade):**
- Run Net Price Calculators for any schools showing up on initial target list.
- Discuss with parents whether financial reality changes the school list.
- If specific concerns (divorced parents, complex assets, etc.), consult a financial aid specialist or college's aid office for general guidance.

**Senior year (12th grade), fall:**
- October: FAFSA and CSS Profile open. File ASAP.
- November: file CSS Profile by ED/EA deadlines if applying early.
- December-January: file FAFSA + CSS Profile for RD schools by their priority deadlines.
- Track each school's specific aid filing requirements.

**Senior year, spring:**
- March-April: aid offers arrive with admit decisions.
- Compare offers (see exemplar-aid-negotiation.md for offer comparison and appeals).
- Make decision by May 1.

**During college (each year):**
- Re-file FAFSA and CSS Profile every fall for the following year.
- Aid offers can change year-to-year based on family circumstances and school policies.

---

## The Wayfinder workflow for aid mechanics

**[SLM critical workflow]**

The user's question typically falls into one of three categories:

1. **Mechanics question** ("how does FAFSA work," "what's the difference between FAFSA and CSS Profile"): direct synthesis from the framework above.

2. **Strategy question** ("which form do I file for X school," "when should we file"): pull school deep files for school-specific requirements + apply the timeline.

3. **Calculation question** ("how much aid will we get"): redirect to Net Price Calculators for school-specific estimates; don't try to give precise numbers without running them through the actual school's NPC.

For strategy and calculation questions, also surface:
- Verified Wayfinder scholarships DB for non-need-based aid options (cross-reference exemplar-aid-merit-strategy.md)
- School deep files for institutional aid generosity (which schools meet full need, which leave gap)
- Recommended next steps (run NPC, file FAFSA when it opens, contact school aid office for specific scenarios)

---

## Reasoning patterns the SLM should recognize and apply

For aid mechanics queries:

1. **Always ground in user's specific situation when known.** Generic advice is what Gemini gives; user-specific advice using saved profile is the Wayfinder edge.
2. **Pull school deep files for form requirements.** Different schools require different forms; surface this for the user's specific list.
3. **Recommend Net Price Calculators.** This is the single most accurate tool and is underused.
4. **Cross-reference verified Wayfinder scholarships DB.** Non-need-based aid is often equally important to need-based aid.
5. **Be honest about variability.** Aid calculations are school-specific and family-specific; precise numbers require NPCs.
6. **Push for early action on filing.** Late filers get less aid; this is consistent advice.
7. **Distinguish need-based from merit-based aid.** Different forms, different processes, different strategies.

**The Wayfinder synthesis advantage for aid mechanics:** Gemini can give generic FAFSA/CSS Profile information. Wayfinder grounds it in the user's target school list (pulled from saved profile + school deep files), surfaces which forms each target school requires, cross-references the verified scholarships DB for non-need aid, and recommends specific Net Price Calculator action. The integration with the school deep files and verified scholarships DB is what makes the response more valuable than a Wikipedia-style answer.
