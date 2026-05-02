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

## FAILED PATTERNS / KNOWN ANTI-PATTERNS

- Don't over-redact: K-12 school names like "Lakeside" / "Overlake" can appear as conversation TOPIC (parent asks "what about Lakeside vs Bush?") — those mentions are NOT PII. Only redact when the school is identified as the user's own school.
- **2026-05-02:** "Investment executive" / "12th grader" / "three kids at different stages" all appeared together as paraphrased context the assistant carried forward from a prior turn. Considered redaction but each individually is generic role/family demography — the COMBINATION is mildly identifying but does not name a person, location, school, or employer. Held to false-negative bias and only redacted the unambiguous first-name leak.

## DATA QUALITY FLAGS

- **2026-05-02:** Recurring assistant pattern: opening a high-effort reply with `<FirstName>, I want to be direct/honest/clear` style. Recommend regex team add a leading-vocative pattern: `^([A-Z][a-z]{2,15}),\s` checked against the session's known username before the response is persisted. Sample size: 1 leak this run, but pattern is template-y enough to recur.

## CALIBRATION SUGGESTIONS

- 200 entries per run is generous. If a run consistently completes with >100 entries already-audited (skipped), consider reducing the days window from 7 to 3-4.
- **2026-05-02:** Run fetched only 11 entries (6 memory + 5 training) over a 7-day window — well under the 200 cap. Not a calibration problem yet (low traffic week, not stale window). Re-evaluate after 2-3 more runs; if cap is consistently nowhere near hit, leave window at 7 days for trend stability.
- **2026-05-02 — proposed regex addition:** add a leading-vocative scrub to `redactKnownName` that strips `^<knownFirstName>,` at the start of any paragraph in the assistant response, in addition to the existing inline scrub. Implementation hint: split response on `\n\n`, scan first 30 chars of each chunk.

## OPEN QUESTIONS

- Worth tracking PII-leakage rate over time? Trend would tell us if redactor is improving or degrading.
- **2026-05-02:** Why did `redactKnownName` succeed on the 04-29 capture (`Welcome to Wayfinder, [NAME]!`) but fail on the 04-26 capture (`Dan, I want to be direct`) for what looks like the same user? Hypothesis: known-name table is keyed by (sessionId, userName) and the 04-26 session predated the user's name being persisted. If true, the redactor needs a retroactive sweep when a name is first observed.

## RUN HISTORY

| Date | Entries Fetched | Patches Applied | Notable |
|------|-----------------|-----------------|---------|
| 2026-04-26 | (first manual run) | 0 (no entries) | endpoint reachable, no in-flight data to audit |
| 2026-05-02 | 11 (6 mem + 5 train) | 2 (HTTP 200) | Caught first-name "Dan" in assistant openers — leading-vocative pattern missed by redactKnownName. Held back on redacting role/family-context combinations per false-negative-bias rule. |
