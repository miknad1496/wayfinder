# wayfinder-pii-audit — Lessons Learned

> Read at the START of every run. Append takeaways at the END.

## CURRENT CALIBRATION

- frequency: weekly Saturday 4am
- batch_size: up to 200 entries per run
- last_calibration_change: 2026-04-26 — initial setup

## EFFECTIVE PATTERNS

- Memory entries flagged "deep PII" most commonly: free-floating personal names that the regex's contextual triggers missed (e.g. user introduces "my daughter Emma" in turn 1, then says "Emma's GPA is 3.8" in turn 4 — second mention has no contextual marker).
- Salutations from the LLM ("Welcome to Wayfinder, Emma!") were a major leak source — addressed by `redactKnownName(text, userName)` second-pass added 2026-04-26.
- **2026-05-02:** First-name-as-direct-address leak in assistant openers — assistant began a long reply with "Dan, I want to be direct:..." and `redactKnownName` did not catch it. The matching pattern is `<FirstName>,` at start of paragraph (often after the word "**" markdown or right after a newline). The `[NAME]`-redaction WAS applied successfully on the same user's later session ("Welcome to Wayfinder, [NAME]!" in memory-2026-04-29) — suggests the known-name pass requires the user to be re-identified per session, and missed sessions on a different memory shard.

- **2026-05-09:** K-12 school name as the user's own child's school — caught in `memory-2026-05-03.jsonl:3` and `training-2026-05.jsonl:12`. Lead-in pattern: "My son is a 9th grader at Lakeside in Seattle" → assistant response then echoed "Lakeside" twice in summary callbacks ("9th grader / Lakeside / robotics conversation" and "Your son's grade (9th, Lakeside, got it)"). The lead-in user phrasing is the only place a regex needs to bind — once captured at intake, downstream assistant echoes can be redacted by the same `redactKnownName` second-pass mechanism that handles user names.

## FAILED PATTERNS / KNOWN ANTI-PATTERNS

- Don't over-redact: K-12 school names like "Lakeside" / "Overlake" can appear as conversation TOPIC (parent asks "what about Lakeside vs Bush?") — those mentions are NOT PII. Only redact when the school is identified as the user's own school.
- **2026-05-02:** "Investment executive" / "12th grader" / "three kids at different stages" all appeared together as paraphrased context the assistant carried forward from a prior turn. Considered redaction but each individually is generic role/family demography — the COMBINATION is mildly identifying but does not name a person, location, school, or employer. Held to false-negative bias and only redacted the unambiguous first-name leak.

- **2026-05-09:** "Mercer Island" appeared 3 times this run — once in a parent comparing 3 districts ("Compare Bellevue HS, Mercer Island HS, and Newport HS"), once as a recommendation in a Korean parent's school-discovery query, and once in a school-finder assistant response listing it among options. All three were TOPIC mentions, not user-identifier mentions. Held to the false-negative-bias rule and did NOT redact. The earlier instinct ("WA family — Mercer Island feels personal") would have over-redacted three legitimate informational discussions of a public-school district.
- **2026-05-09:** Sentence-starter words like "Competitive," "Yes," "However," "First," "Also," matched a naive `^[A-Z][a-z]{2,15},\s` leading-vocative pattern. They are NOT first names. Auditor must always cross-check leading-vocative matches against (a) known user names, (b) school/company names ("Caltech, Harvard, Emory" all matched but are universities). Calibration: only flag leading-vocatives that match a confirmed username for the session.

- **2026-05-16:** Saw a clear case of OVER-redaction (not the audit's concern but worth logging): `memory-2026-05-15.jsonl:0` response contained `Welcome to [NAME]! ... Your [NAME] Advisor is getting ready` — the upstream regex appears to have redacted the product name "Wayfinder" as if it were a user's first name. Not a PII leak (over-redaction, not under-redaction), so no patch posted per false-negative bias. But the regex team should whitelist the product name. Pattern: `redactKnownName` is binding "Wayfinder" to the user's name slot incorrectly — likely because some welcome-desk flow seeded `userName` to "Wayfinder" or the redactor's name-detection misidentified the product in the assistant opener.

## DATA QUALITY FLAGS

- **2026-05-02:** Recurring assistant pattern: opening a high-effort reply with `<FirstName>, I want to be direct/honest/clear` style. Recommend regex team add a leading-vocative pattern: `^([A-Z][a-z]{2,15}),\s` checked against the session's known username before the response is persisted. Sample size: 1 leak this run, but pattern is template-y enough to recur.

- **2026-05-09:** This run found 1 K-12-school-as-identifier leak. Recommend regex team add a pattern to `redactPII`: `\b(?:my (?:son|daughter|kid|child) (?:is|attends|goes to|is a \d{1,2}\w*\s+grader at)|I (?:attend|go to|study at|am at)) (the )?([A-Z][\w'\s\-]{2,40}?)(?=[,.\s])` — capture group 2 should be redacted to `[SCHOOL]` IF and ONLY IF it matches a known K-12 school name list (Lakeside, Bush, Overlake, Eastside Prep, University Prep, Annie Wright, Charles Wright, Forest Ridge, Bishop Blanchet, Holy Names, Bellevue, Newport, Interlake, Mercer Island, Issaquah, Skyline, Eastlake, Inglemoor, Roosevelt, Garfield, Ingraham, Ballard). Whitelist approach prevents over-redaction of universities and generic words. Sample size: 1 leak this run, but the pattern is straightforward enough to justify proactive coverage rather than wait for repeat instances.
- **2026-05-09:** Volume jumped 14× over last week — 154 entries vs. 11 prior week. Real product traffic, not redactor degradation. With higher volume, the cap-of-200 may bind on a future run; flag if next 2 runs exceed 180.

- **2026-05-16:** Product name "Wayfinder" being redacted as `[NAME]` in welcome-desk assistant responses. Recommend regex team explicitly exclude product/brand names from the `redactKnownName` second-pass. Suggested patch: add a hard whitelist `PRODUCT_NAMES = ['Wayfinder']` and skip these tokens before applying the known-name redaction. Sample size: 1 instance this run (out of 5 total entries), but the boilerplate welcome message is high-traffic so the pattern likely affects many real entries that simply weren't sampled.
- **2026-05-30:** Third consecutive low-volume run (154 -> 5 -> 2 over three weeks). Only 1 unique exchange this run (the memory and training entries are the same welcome-desk intake). The 05-16 OPEN QUESTION — did chat traffic actually fall or is the memory writer silently skipping writes — is now a STANDING data-quality flag, not a one-off. Two weeks of near-zero captures while the product is live strongly suggests a capture/writer issue rather than genuine traffic. Strongly recommend a morning-pulse cross-check of 7-day chat counts vs. memory-write counts before next run.

## CALIBRATION SUGGESTIONS

- 200 entries per run is generous. If a run consistently completes with >100 entries already-audited (skipped), consider reducing the days window from 7 to 3-4.
- **2026-05-02:** Run fetched only 11 entries (6 memory + 5 training) over a 7-day window — well under the 200 cap. Not a calibration problem yet (low traffic week, not stale window). Re-evaluate after 2-3 more runs; if cap is consistently nowhere near hit, leave window at 7 days for trend stability.
- **2026-05-02 — proposed regex addition:** add a leading-vocative scrub to `redactKnownName` that strips `^<knownFirstName>,` at the start of any paragraph in the assistant response, in addition to the existing inline scrub. Implementation hint: split response on `\n\n`, scan first 30 chars of each chunk.

- **2026-05-09:** Last week 11 entries, this week 154 entries — within cap (200) but trending up. Hold 7-day window for now; revisit if cap binds.
- **2026-05-09 — proposed redactor enhancement (preferred over the leading-vocative scrub from 2026-05-02):** add K-12-school-as-personal-identifier scrub to `redactKnownName`. Trigger: text contains `my (son|daughter|kid|child)` AND a known K-12 school name from the WA state schools whitelist within the same paragraph. Action: redact the school name to `[SCHOOL]`. Also retroactively scrub the assistant response of the same school name once intake binds it (similar to how user-name retroactive scrub works post-2026-04-26).
- **2026-05-09 — leading-vocative regex must be username-gated.** Naive pattern matched 8 false positives this run (sentence starters + university names). Only meaningful as a vocative when the captured word equals a confirmed username for the session.

- **2026-05-16:** Volume dropped sharply: 154 entries last week → 5 entries this week. Possible causes: (a) genuine low-traffic week (mid-month Saturday), (b) memory writer regression, (c) capture pipeline degradation (entries written elsewhere or dropped). Recommend morning-pulse audit cross-check chat counts vs. memory-write counts. If chat traffic stayed flat but memory dropped, that's a redactor/writer bug, not low traffic.
- **2026-05-16 — keep 7-day window.** The 5-entry sample is far under the 200 cap; widening to 14 days would not improve signal because entries are uniformly boilerplate welcome-desk intake. The problem is volume / pipeline (see above), not window size.
- **2026-05-30:** Keep 7-day window — widening would not help while the writer is the suspected bottleneck (more days x near-zero writes = still near-zero). The fix is upstream (confirm captures are being written), not the audit window. Also: no audit ran on 2026-05-23 (gap). If runs keep slipping, the 7-day window will leave permanent blind spots between runs; consider widening to match the actual inter-run gap (e.g. 14 days) ONLY after the writer-volume question is resolved, so a real backlog isn't missed.

## OPEN QUESTIONS

- Worth tracking PII-leakage rate over time? Trend would tell us if redactor is improving or degrading.
- **2026-05-02:** Why did `redactKnownName` succeed on the 04-29 capture (`Welcome to Wayfinder, [NAME]!`) but fail on the 04-26 capture (`Dan, I want to be direct`) for what looks like the same user? Hypothesis: known-name table is keyed by (sessionId, userName) and the 04-26 session predated the user's name being persisted. If true, the redactor needs a retroactive sweep when a name is first observed.

- **2026-05-09:** Mercer Island appeared three separate times in school-finder contexts. None were user-identifying, but the volume hints at a future need to distinguish neighborhood-as-residence ("we live on Mercer Island") from neighborhood-as-school-shopping-criterion ("is Mercer Island HS good?"). Worth tracking whether residence-style usage shows up in future runs.
- **2026-05-09:** Should the redactor whitelist be living-document — pulled from `backend/knowledge-base/schools/`'s K-12 entries — rather than hardcoded? Would auto-grow with the schools-deep-files batches. Trade-off: dependency on K-12 deep-file expansion, currently still BETA per CLAUDE.md.

- **2026-05-16:** Did chat traffic actually drop 30× this week or did the memory writer skip writes? Cross-checking morning-pulse's chat counts against memory file growth for the same window would settle it. If chat counts held but memory dropped, the redactor or writer has a silent skip path that needs fixing.
- **2026-05-16:** Is the "Wayfinder→[NAME]" over-redaction localized to the welcome-desk concierge flow or does it affect main chat? All 5 sampled entries this run were welcome-desk style intake, so the sample doesn't disambiguate.
- **2026-05-30:** Now two+ weeks of suspiciously low capture volume (5 then 2). Is `memory-recent` only surfacing welcome-desk/concierge intake and missing main-chat captures entirely? Every low-volume sample for three runs has been intake-style. Worth confirming whether main-chat sessions are written to a different shard/file that this endpoint's day-window query isn't picking up.

## RUN HISTORY

| Date | Entries Fetched | Patches Applied | Notable |
|------|-----------------|-----------------|---------|
| 2026-04-26 | (first manual run) | 0 (no entries) | endpoint reachable, no in-flight data to audit |
| 2026-05-02 | 11 (6 mem + 5 train) | 2 (HTTP 200) | Caught first-name "Dan" in assistant openers — leading-vocative pattern missed by redactKnownName. Held back on redacting role/family-context combinations per false-negative-bias rule. |
| 2026-05-09 | 154 (81 mem + 73 train) | 2 (HTTP 200) | Caught K-12-school-as-user-identifier leak: "My son is a 9th grader at Lakeside in Seattle" — Lakeside redacted to [SCHOOL] in both query and assistant echo (3 occurrences). Held back on Mercer Island mentions (topic comparison, not user identifier). |
| 2026-05-16 | 5 (3 mem + 2 train) | 0 | All entries were boilerplate parent-intake welcome-desk exchanges — no PII to catch. Noted over-redaction (product name "Wayfinder" → "[NAME]") for regex-team follow-up. Volume dropped 30× from last week (154 → 5); flagged for morning-pulse cross-check on whether chat traffic actually dropped or memory writer is skipping. |
| 2026-05-30 | 2 (1 mem + 1 train) | 0 | Both entries were the SAME boilerplate parent-intake welcome-desk exchange (generic "my child" query + David's calibration-question reply). No names, schools, towns, phones, or identifiers present. Nothing to redact. Note: no run on record for 2026-05-23 (week skipped); this run still only sees a 7-day window so 05-17..05-23 captures, if any, were not re-examined. Volume remains very low (2) — continues the 154->5->2 downtrend; pipeline/volume question from 05-16 still open. |
