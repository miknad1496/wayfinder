# wayfinder-pii-audit — Lessons Learned

> Read at the START of every run. Append takeaways at the END.

## CURRENT CALIBRATION

- frequency: weekly Saturday 4am
- batch_size: up to 200 entries per run
- last_calibration_change: 2026-04-26 — initial setup

## EFFECTIVE PATTERNS

- Memory entries flagged "deep PII" most commonly: free-floating personal names that the regex's contextual triggers missed (e.g. user introduces "my daughter Emma" in turn 1, then says "Emma's GPA is 3.8" in turn 4 — second mention has no contextual marker).
- Salutations from the LLM ("Welcome to Wayfinder, Emma!") were a major leak source — addressed by `redactKnownName(text, userName)` second-pass added 2026-04-26.

## FAILED PATTERNS / KNOWN ANTI-PATTERNS

- Don't over-redact: K-12 school names like "Lakeside" / "Overlake" can appear as conversation TOPIC (parent asks "what about Lakeside vs Bush?") — those mentions are NOT PII. Only redact when the school is identified as the user's own school.

## DATA QUALITY FLAGS

(empty — fill as discovered)

## CALIBRATION SUGGESTIONS

- 200 entries per run is generous. If a run consistently completes with >100 entries already-audited (skipped), consider reducing the days window from 7 to 3-4.

## OPEN QUESTIONS

- Worth tracking PII-leakage rate over time? Trend would tell us if redactor is improving or degrading.

## RUN HISTORY

| Date | Entries Fetched | Patches Applied | Notable |
|------|-----------------|-----------------|---------|
| 2026-04-26 | (first manual run) | 0 (no entries) | endpoint reachable, no in-flight data to audit |
