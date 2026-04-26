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

## FAILED PATTERNS

(empty — first runs will discover)

## DATA QUALITY FLAGS

(empty)

## CALIBRATION SUGGESTIONS

- Initial baselines were estimated from typical LLM-app patterns — refine after 7-14 days of real data. Likely calibration: tighten upper bounds on latency, loosen RAG hit rate (real-world hit rate often 0.65-0.75 for niche queries).

## OPEN QUESTIONS

- Should the drift monitor commit a daily snapshot to git so we can graph trends week over week?

## RUN HISTORY

| Date | Verdict | Notable |
|------|---------|---------|
| (no runs yet — first fires 5am tomorrow) | | |
