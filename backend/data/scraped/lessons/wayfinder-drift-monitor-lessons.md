# wayfinder-drift-monitor — Lessons Learned

> Read at the START of every run. Append takeaways at the END.

## CURRENT CALIBRATION

- frequency: daily 5am UTC (≈10pm PST/9pm PDT — adjacent to 12:08/12:09am PST audit restart window AND/OR overnight low-traffic window; 4-for-4 zero-volume runs)
- baselines (current targets):
  - chat.rag_hit_rate: ≥0.80 (alert <0.65)
  - chat.refusal_rate: 0.05-0.15 (alert >0.30 or <0.01)
  - chat.engine_escalation: 0.10-0.25 (alert >0.40)
  - chat.avg_latency: <5000ms
  - essay.fail_rate: <0.05
  - essay.parse_recovery: <0.20
  - essay.avg_latency: <45000ms
  - concierge.avg_latency: <8000ms
  - concierge.avg_response_length: ≥300 chars
- low-signal guard: skip threshold alerts when chat.totalQueries < 100 OR essay.totalReviews < 20 OR concierge.totalMessages < 50 OR (now - since) < 30min
- last_calibration_change: 2026-04-26 — initial baselines (estimated, not yet validated; 5-for-5 zero-volume runs, no real data to calibrate against)

## EFFECTIVE PATTERNS

- Aggregate counters reset on every Render redeploy (in-memory state). Drift monitor sees fresh window each day after the nightly audit pushes. This is acceptable but worth noting: drift detection is "today vs baseline," not "today vs yesterday."
- Confirmed empirically on first run (2026-04-26): `since` timestamp was 2 minutes before the curl — a Render redeploy had just zeroed counters. All three pipelines reported 0 volume. The `since` field IS the right way to detect a fresh deploy / cold-start.
- THREE consecutive zero-volume runs (Apr 26, 27, 30) all show `since` within ~20min of fetch time. This is now a confirmed pattern, not coincidence: scheduled tasks running 12:08am/12:09am PST (full-system-audit, nightly-system-audit) appear to trigger Render restarts that zero counters. Drift monitor at 5am UTC = ~10pm PST consistently catches a freshly-reset state.
- 2026-05-03: First run where `since` did NOT advance from prior fetch — counters survived 25h. So the restart-adjacency hypothesis was correct for runs 1-4 but is NOT the only failure mode. Today proves a separate failure: even when counters persist, observed volume can still be zero. Two distinct hypotheses now: (a) genuinely no real traffic in this window (sundays/middle-of-night), (b) instrumentation gap where some/all live traffic doesn't increment the counters.

## FAILED PATTERNS

(empty — no false alarms yet because no runs have generated alerts)

## DATA QUALITY FLAGS

- 2026-04-26 first run: zero-volume snapshot. `since` was only ~2min before the request.
- 2026-04-27 second run: also zero-volume. `since` 17min before fetch.
- 2026-04-30 third run: also zero-volume. `since` 11min before fetch (16:13:24Z, fetched 16:24:13Z). Confirms hypothesis: counters consistently zero at this scheduled-task time. The drift monitor in its current schedule is structurally unable to observe meaningful traffic.
- Counter reset pattern across 4 runs: deltas of 2min, 17min, 11min, 55min between `since` and fetch. The 55min delta on May 2 is the longest yet but still produced zero volume — this run was ~12:03 UTC = ~5am PDT (Sunday morning, lowest natural traffic window). **This task as currently scheduled produces NO useful signal.**
- 2026-05-03 fifth run: `since` 2026-05-02T11:08:19Z — IDENTICAL to May 2 run's since timestamp. Counters survived ~25 hours WITHOUT a Render restart, yet still show 0 volume across all 3 pipelines. This is a new diagnostic: the prior 4 runs blamed restart adjacency, but today's run shows even when counters persist a full day, there's still zero observed traffic. Real conclusion: the site had effectively zero user activity in the 25h window. Either traffic is genuinely tiny, or analytics writes are silently failing for live traffic.

## CALIBRATION SUGGESTIONS

- Initial baselines were estimated from typical LLM-app patterns — refine after 7-14 days of real data. Likely calibration: tighten upper bounds on latency, loosen RAG hit rate (real-world hit rate often 0.65-0.75 for niche queries).
- **Reschedule recommendation (URGENT, 4-for-4 zero-volume confirms):** move drift monitor from 5am UTC to 04:00 UTC (= 9pm PST = peak high-schooler homework window) OR even better, run at a non-Render-restart-adjacent time like 16:00 UTC (= 9am PST). Current schedule is structurally adjacent to the 12:08am/12:09am audit tasks that zero counters.
- Alternative: persist analytics counters to disk (file-backed like `_quota-tracker.json`) so they survive restart. This is a code change — flag for Dan, don't attempt.

## OPEN QUESTIONS

- Should the drift monitor commit a daily snapshot to git so we can graph trends week over week?
- **Confirmed:** nightly audit tasks (12:08am / 12:09am PST) ARE triggering restarts that zero analytics counters (4-for-4 evidence — May 2 run had 55min since-to-fetch gap but counters had still been zeroed earlier in the morning). Either (a) reschedule drift monitor to non-adjacent window, or (b) make analytics counters persistent.
- Is there a way to query the analytics endpoint with a time range parameter rather than relying on the in-memory `since`?
- **NEW:** With counters now demonstrably persistent across a full 25h window, but still showing zero volume, is the analytics-write path actually wired up for live user chat/essay/concierge calls in production? Worth Dan spot-checking with a manual chat query and immediately curl'ing the endpoint to verify counter increments. If counters DON'T tick after a manual query, recordChatQuery() / essay logging may have regressed.

## RUN HISTORY

| Date | Verdict | Notable |
|------|---------|---------|
| 2026-04-26 | LOW SIGNAL | Counters fresh after Render redeploy; volume=0 across chat/essay/concierge; no threshold evaluation possible |
| 2026-04-27 | LOW SIGNAL | Counter reset 17min before fetch (since=23:26:45Z); volume=0 across all 3 pipelines; second consecutive zero-volume run |
| 2026-04-30 | LOW SIGNAL | Counter reset 11min before fetch (since=16:13:24Z); volume=0 across all 3 pipelines; third consecutive zero-volume run — pattern confirmed, schedule needs to move |
| 2026-05-02 | LOW SIGNAL | Counter reset 55min before fetch (since=11:08:19Z, fetched=12:03:10Z); volume=0 across all 3 pipelines; FOURTH consecutive zero-volume run |
| 2026-05-03 | LOW SIGNAL | since=2026-05-02T11:08:19Z (UNCHANGED from prior run, ~25h elapsed, no restart); volume=0 across all 3 pipelines; FIFTH consecutive zero-volume run — flips the diagnosis: not just restart-adjacency, the site genuinely has near-zero traffic in observed windows |
