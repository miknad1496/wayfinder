# wayfinder-drift-monitor — Lessons Learned

> Read at the START of every run. Append takeaways at the END.

## CURRENT CALIBRATION

- frequency: daily 5am
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
- last_calibration_change: 2026-04-26 — initial baselines (estimated, not yet validated)

## EFFECTIVE PATTERNS

- Aggregate counters reset on every Render redeploy (in-memory state). Drift monitor sees fresh window each day after the nightly audit pushes. This is acceptable but worth noting: drift detection is "today vs baseline," not "today vs yesterday."
- Confirmed empirically on first run (2026-04-26): `since` timestamp was 2 minutes before the curl — a Render redeploy had just zeroed counters. All three pipelines reported 0 volume. The `since` field IS the right way to detect a fresh deploy / cold-start.

## FAILED PATTERNS

(empty — first runs will discover)

## DATA QUALITY FLAGS

- 2026-04-26 first run: zero-volume snapshot. `since` was only ~2min before the request, indicating a recent Render redeploy. Treat as low-signal and skip threshold alerts whenever (now - since) < ~30min OR total volume across all three pipelines is 0.
- 2026-04-27 second run: also zero-volume. `since` 17min before fetch — another recent redeploy. Two-for-two zero-volume runs suggests the daily 5am drift monitor consistently fires shortly after a Render redeploy (Render free tier sleeps + cold-starts on overnight inactivity?), OR the analytics counters are being zeroed by the nightly-system-audit / full-system-audit tasks running just before this one. Worth checking if scheduled tasks at 12:08am / 12:09am cause a process restart.

## CALIBRATION SUGGESTIONS

- Initial baselines were estimated from typical LLM-app patterns — refine after 7-14 days of real data. Likely calibration: tighten upper bounds on latency, loosen RAG hit rate (real-world hit rate often 0.65-0.75 for niche queries).
- Add a low-signal guard: skip alerts when chat.totalQueries < 100 OR essay.totalReviews < 20 OR concierge.totalMessages < 50 (rather than the current <50 across all). Tiny denominators produce wildly noisy rates.
- After 2 consecutive zero-volume early-morning runs: consider rescheduling the drift monitor to a later time (e.g., 9am or 12pm PST) when accumulated volume is more likely. 5am UTC = 10pm PST previous day = also low traffic. Optimal window for Wayfinder traffic likely 4-9pm PST when high schoolers are doing homework.

## OPEN QUESTIONS

- Should the drift monitor commit a daily snapshot to git so we can graph trends week over week?
- Are nightly audit tasks (12:08am / 12:09am) triggering a restart that zeros analytics counters? If so, the in-memory counter design defeats daily drift detection — needs persistent backing or a longer rolling window.

## RUN HISTORY

| Date | Verdict | Notable |
|------|---------|---------|
| 2026-04-26 | LOW SIGNAL | Counters fresh after Render redeploy; volume=0 across chat/essay/concierge; no threshold evaluation possible |
| 2026-04-27 | LOW SIGNAL | Counter reset 17min before fetch (since=23:26:45Z); volume=0 across all 3 pipelines; second consecutive zero-volume run |
