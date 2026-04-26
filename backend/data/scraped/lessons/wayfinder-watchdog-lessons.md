# wayfinder-watchdog — Lessons Learned

> Read at the START of every run. Append takeaways at the END.

## CURRENT CALIBRATION

- frequency: every 6h
- typical_run_duration: <60 sec
- last_calibration_change: 2026-04-26 — added explicit guidance to ignore wayfinder.onrender.com (suspended subdomain is expected, not a failure)

## EFFECTIVE PATTERNS

- Use `wayfinderai.org` for all health checks. The `.onrender.com` subdomain is intentionally suspended (Render does this when a custom domain is configured) — its "Service Suspended" page is expected, not a fault.
- Compare lastRunAt of scheduled tasks vs cron interval × 2 — anything older signals a stalled task.

## FAILED PATTERNS

- Curling wayfinder.onrender.com triggered a false alarm in early runs — fixed by hardcoding wayfinderai.org as the only health URL in the prompt.

## DATA QUALITY FLAGS

(none yet)

## CALIBRATION SUGGESTIONS

- Watchdog is well-tuned. If notification noise becomes excessive, consider reducing to every 12h or only-on-failure notifications (would require a notification-suppression scheme not currently available).

## OPEN QUESTIONS

- Should the watchdog also do a TTFB / latency trend check (avg over 4 runs)?

## RUN HISTORY

(only ~30 days of history kept — older entries summarized)
