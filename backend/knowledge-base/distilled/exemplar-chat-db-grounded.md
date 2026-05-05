# Exemplar — DB-grounded query chat responses

> **INTERNAL RAG INSTRUCTION (do not paraphrase to user):** All blocks marked `[SLM data retrieval]`, `**CRITICAL — Wayfinder data sources**`, `**Critical SLM instruction**`, the `**The structural play:**` sentences, and the `## Reasoning patterns` section at the bottom are GUIDANCE for HOW to construct your response. They are not user-facing content. Never quote them back to the user. Never echo phrases like "Wayfinder synthesis advantage" or "Gemini gives generic, Wayfinder gives X" to users — those are internal framing. Use them to inform the response; the response itself should sound like a thoughtful college admissions advisor, not a meta-discussion of how the chatbot works.


This file contains pre-synthesized Opus-grade reasoning for the question class where Wayfinder MOST DECISIVELY beats every general chatbot: queries that should be answered from verified curated databases (programs, internships, scholarships, volunteer opportunities) rather than from training-data recall.

**The hallucination edge:** Gemini, ChatGPT, and Claude all routinely hallucinate program names, application URLs, deadlines, and scholarship eligibility criteria when asked for specifics. Wayfinder has verified entries with `_verified: true`, `_verifiedDate`, and real `_source` URLs. The SLM should NEVER fabricate a program/internship/scholarship/volunteer entry — it should ALWAYS pull from the curated DB via the Wayfinder curated-search injection (patch 35).

**Critical SLM instruction for every DB-grounded query:**
1. Detect the intent (programs / internships / scholarships / volunteer) from the query.
2. Extract filtering criteria from query AND from saved user profile (state, grade, intended major, EC interests, financial need, etc.).
3. Retrieve verified entries from the curated DB injection.
4. PRESENT the verified entries with their real URLs, dates, and details.
5. NEVER invent or generalize a program/internship/scholarship not in the DB. If the DB returns fewer entries than requested, present what's available and note the gap honestly.
6. Suggest the user open the relevant Wayfinder module (Programs / Internships / Scholarships / Volunteer) for the full filtered list and additional filtering options.

---

**Also known as / synonyms:** verified programs, verified internships, verified scholarships, verified volunteer opportunities, summer programs, paid internships, scholarships search, volunteer opportunities, QuestBridge, find programs, find internships, find scholarships, find volunteer.

## Verified summer programs query (state + interest filtered)

When a student asks for verified summer programs in a specific state for a specific interest area, the response should: (1) acknowledge the request, (2) present 4-6 specific verified entries with real institutional names + real URLs + key details, (3) note any gaps or recommendations to expand search, (4) point to the Wayfinder Programs module for full list.

**The synthesis pattern (using the WA + biomedical engineering archetype):**

For a rising 11th grader in Washington interested in biomedical engineering, here are verified programs from Wayfinder's curated database that match. These are real programs with verified URLs and verified application status as of [_verifiedDate from each entry].

[SLM instruction: pull 5 verified entries from `backend/data/scraped/programs.json` filtering by state=WA, eligibility includes grade 11, category aligned with biomedical/engineering/STEM/health-sciences. Present each entry with: name, host institution, location, format (residential/commuter/hybrid), cost (or full-funded note), application deadline, brief 1-2 sentence description, and the real `_source` URL. Cite `_verifiedDate` so user knows when last confirmed.]

Example formatting (with real entries when retrieved):

**1. UW Department of Bioengineering — High School Summer Internship**
- Location: Seattle, WA
- Format: in-person at UW campus
- Eligibility: rising juniors and seniors
- Cost: free (paid stipend in some labs)
- Deadline: typically March-April (verify on the program page)
- What it is: 8-week paid research internship in UW bioengineering labs. Students are matched with faculty mentors based on interest and work on active research projects.
- Real source: [URL from verified entry]

**2. [Next verified entry from DB]**

[Continue with 3-5 more verified entries.]

**What's NOT in the DB or what's gaps:**

If the curated DB doesn't have 5 strong matches for the specific filter combination, be honest. Say something like: "Wayfinder's DB has 3 verified bioengineering-specific programs in WA — I've listed all of them. To expand, I can also surface: (a) WA programs in adjacent fields (general STEM research, chemistry, biology) that would still serve a bioengineering-interested student, (b) verified bioengineering programs in nearby states (CA, OR) for residential applications, or (c) verified national-level bioengineering programs (RSI at MIT, COSMOS at UC, etc.) for the strongest applicants."

**What to AVOID:**

- Inventing program names. If "BioE Bridge Program at UW" doesn't exist in the verified DB, don't include it.
- Inventing URLs. If the verified DB entry has the URL, use that. If it doesn't, say "verify on UW Bioengineering's department site" rather than fabricating a URL.
- Generic advice like "look on the UW website for opportunities." That's the user could get from any chatbot. The Wayfinder edge is the verified specific entries.
- Claiming entries are verified that aren't. If the DB returns an entry with `_verified: false`, note that this is a known opportunity but Wayfinder hasn't fully confirmed details — verify before applying.

**Recommend the next action:**

End with: "Want to see the full filtered list of all WA programs available to rising juniors? The Programs module in Wayfinder lets you filter by additional criteria (residential vs commuter, cost, selectivity, application status). I can also pull internships separately if you want paid options or specific scholarships for any program with significant cost." This routes the user into deeper Wayfinder engagement.

---

## Verified internships query (paid, location, interest filtered)

For a high school junior asking for paid internships in Seattle for CS, the synthesis pattern:

[SLM instruction: pull verified entries from `backend/data/scraped/internships.json` filtering state=WA, paid=true, field=CS/tech, eligibility includes high-school. Present 3-5 with real institutional names, application URLs, hour expectations, pay (when known), application status.]

The differentiator from any general chatbot: Wayfinder's verified internships database has REAL programs that have actually accepted high schoolers in recent cycles. Most generic chatbots return either (a) very general suggestions like "look on Indeed" or (b) hallucinated specific programs that don't exist.

The Seattle area has a particularly strong verified-internship DB because of Wayfinder's heavy WA focus. Example entries the DB likely has:

[SLM: surface real entries from internships.json when query matches]

Examples (verified entries when DB returns them):
- **UW Computer Science Department — Allen School Summer High School Research**
- **Seattle Children's Research Institute — Computational Biology Internship**
- **Microsoft TEALS or Microsoft High School Internship Programs**
- **Uplift Northwest — High School Tech Internship**
- **Various Seattle startup internships matched via DB**

Each entry should include the real application URL and current application status (open/closed/upcoming).

**For the user looking for CS-specific paid internships in Seattle:**

After listing verified entries, contextualize: "Most paid CS internships in Seattle for high schoolers are competitive — Microsoft, Amazon, and Boeing all have programs but they're application-driven and selective. Smaller startups (50-person range) sometimes hire high schoolers but rarely advertise widely; for those, the path is direct outreach, not application portals. If you want strategy on direct outreach to startups (cold email templates, what to include in your portfolio), let me know — that's a separate conversation."

**Wayfinder's edge:** the curated internships DB has many verified entries with state-level coverage including WA. The user can browse the full list in the Internships module. For DB-grounded queries, the chat should always recommend opening the module for the full filtered view.

---

## Verified scholarships query (eligibility + state filtered)

For a first-generation low-income WA student asking about scholarships, the synthesis pattern:

[SLM instruction: pull verified entries from `backend/data/scraped/scholarships.json` filtering by eligibility (first-gen, low-income, WA-eligible). Present 5 with real names, URLs, amounts, deadlines, application requirements.]

This query class is high-stakes — students rely on scholarships for actual college funding and bad information has real cost. Hallucinated scholarship names (which other chatbots commonly produce) waste student application time and erode trust. Wayfinder's verified DB is specifically valuable here.

Example formatting:

**1. QuestBridge National College Match**
- Eligibility: high-achieving low-income students (typically <$65K family income)
- Award: full four-year scholarship to one of QuestBridge's 50+ partner colleges
- Deadline: late September application opens, late September submission
- Application: separate from Common App; QuestBridge essays + match list
- Real source: questbridge.org

**2. Washington State Opportunity Scholarship**
- Eligibility: WA residents, low/middle income, STEM/health field intent
- Award: up to $22,500 over 5 years
- Deadline: typically February
- Real source: [verified URL]

[Continue with verified entries from DB.]

**What to recommend strategically:**

After listing verified scholarships, recommend Wayfinder's Build My Scholarship Stack feature (patch 17 — 3-tier strategic stack generator). For first-gen low-income students, the strategic value of Wayfinder over Gemini is significant: Wayfinder can generate a personalized 3-tier stack (definitely-apply / probably-apply / stretch-apply) given the user's profile. Gemini can only suggest scholarships; it can't synthesize a strategic application stack.

**Wayfinder's edge:** the curated scholarships DB has many verified entries (with growing verified coverage). For first-gen and low-income students specifically, Wayfinder has heavy verified coverage (national scholarships like QuestBridge, Coca-Cola Scholars, Gates Scholars, plus state-specific ones). The strategic stack tool is a Wayfinder-only capability.

---

## Verified volunteer opportunities query

For a HS student in CA asking about mental health volunteer opportunities, the synthesis pattern:

[SLM instruction: pull verified entries from `backend/data/scraped/volunteer-opportunities.json` filtering category=mental-health, state=CA, age=high-school. Present 4 with real org names, signup URLs, time commitment, college-app value notes.]

Wayfinder's volunteer DB is significantly differentiated from any general chatbot because of patches 138-145's mental health expansion. Specific verified entries the DB has:
- NAMI (National Alliance on Mental Illness) — CA state chapters with HS programs
- JED Foundation — student ambassadors program
- Active Minds — HS chapter starter
- Trevor Project — HS volunteer training
- RAINN — verified HS-eligible volunteer roles
- Crisis Text Line — age-eligible verified roles
- Bring Change to Mind — HS chapter program

For each, surface the real signup URL, training requirements, time commitment, and college-application narrative value.

**The Discover Local feature:**

If the curated DB doesn't have a perfect match in the user's specific California region, recommend Wayfinder's Discover Local feature (Haiku-powered live search). This is another Wayfinder-only capability — Discover Local can find local mental health volunteer programs that aren't in the curated DB but are real and active.

**The 3-pillar strategy generator:**

Also recommend Wayfinder's 3-pillar volunteer strategy tool (POST /api/volunteer/strategy). For a student building a college-app-ready volunteer narrative around mental health, the strategy tool synthesizes (a) a national-level commitment, (b) a local/community-level commitment, (c) a leadership/initiative-level commitment. This synthesis is a Wayfinder-only capability.

---

## Verified application question (specific deadline / fee / prompt for a known program)

For a question about QuestBridge National College Match (deadline, fee waiver, essay prompt), the synthesis pattern:

[SLM instruction: pull QuestBridge entry from scholarships.json. If `_verifiedDate` is recent, present the data. If the entry is older or the user is asking about a current cycle that may have changed, present the verified data with the date noted and recommend the user verify on questbridge.org for any final-deadline-day decisions.]

For QuestBridge specifically, the response should cover:
- Application opens (typically late August)
- Submission deadline (typically late September)
- No application fee for QuestBridge itself; QB then applies to your match list of partner colleges with no additional fees for QB Finalists
- Essay prompts (current year prompts; reference QB's published prompts)
- Eligibility (income thresholds, academic profile)
- Match List process (rank order of partner colleges)
- The College Match (binding ED-equivalent for matched students) vs College Prep Scholars (for sophomores/juniors)

**The differentiator from generic chatbots:**

Generic chatbots will often confuse the QuestBridge College Match (binding match for seniors) with the College Prep Scholars (non-binding scholarship for sophomores/juniors). Wayfinder should distinguish these correctly because the verified DB entry has both programs separately.

**For the user asking about QuestBridge:**

If the user has a saved profile suggesting they're QuestBridge eligible (income, first-gen status, strong academics), proactively recommend they apply if not already planning to. If they're not eligible based on saved profile, mention the eligibility threshold and that QuestBridge is one of the most life-changing scholarship programs in US higher ed for those who qualify.

**Recommend supporting actions:**

- Open the Scholarships module to see QB alongside other low-income/first-gen scholarships
- Use the Scholarship Stack Builder to generate a strategic stack including QB + complementary scholarships
- If the user is a sophomore/junior, recommend the College Prep Scholars program (less well-known, fewer applicants, valuable preparation for the senior year College Match)

---

## Reasoning patterns the SLM should recognize and apply

For DB-grounded queries:

1. **NEVER hallucinate.** This is the cardinal rule. If the verified DB doesn't have an entry, say so honestly. Do not invent entries to fill the response.

2. **Always pull from the DB injection.** The Wayfinder chat backend (per patch 35) automatically injects relevant curated entries when intent is detected. Use them.

3. **Cite the verified date.** If the user is going to act on the data (apply, submit, contact), they should know how recent the verification is. "Verified [date]" caveats build trust.

4. **Use real URLs from the DB, not invented URLs.** If the DB entry doesn't have a URL, say "verify on [organization]'s site" rather than fabricating.

5. **Distinguish Wayfinder's curated DB from general suggestions.** Make it clear the response is grounded in verified data, not training-data recall. "Wayfinder's verified database includes..." is the framing.

6. **Recommend the dedicated Wayfinder module for the full list.** The chat shows top 5; the module shows all the full filtered DB (browse the relevant module for the complete current list). Surface that.

7. **Surface Wayfinder-only capabilities.** Strategic Stack Builder, Discover Local, 3-Pillar Strategy, Build My Scholarship Stack — these don't exist anywhere else. Mention them when contextually relevant.

8. **Note gaps honestly.** If the DB has 3 matches and the user asked for 5, present 3 and explain what's missing rather than padding with fabricated entries.

9. **Connect to user profile when relevant.** If the saved profile indicates the user qualifies for a specific scholarship (income, first-gen, geographic), proactively note that. If they don't qualify, gently say so to save them application time.

10. **End with a clear next action.** Open the relevant module, apply by a specific deadline, contact a verified source. DB-grounded responses should produce action.
