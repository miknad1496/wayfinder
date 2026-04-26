# wayfinder-watchdog — Lessons Learned

> Read at the START of every run. Append takeaways at the END.

## CURRENT CALIBRATION

- frequency: every 6h
- typical_run_duration: <60 sec
- last_calibration_change: 2026-04-26 — added explicit guidance to ignore wayfinder.onrender.com (suspended subdomain is expected, not a failure)

## EFFECTIVE PATTERNS

- Use `wayfinderai.org` for all health checks. The `.onrender.com` subdomain is intentionally suspended (Render does this when a custom domain is configured) — its "Service Suspended" page is expected, not a fault.
- Compare lastRunAt of scheduled tasks vs cron interval × 2 — anything older signals a stalled task.
- Push freshness baseline: with the k12 + volunteer grinders both on */15, commits land every ~7-15 min during active hours. "Last commit" is rarely older than 30 min, so a multi-hour gap during business hours is a signal to look at task health.

## FAILED PATTERNS

- Curling wayfinder.onrender.com triggered a false alarm in early runs — fixed by hardcoding wayfinderai.org as the only health URL in the prompt.
- DON'T flag `wayfinder-internship-grinder` as stalled — it's intentionally disabled (cron `0 0 1 1 *`, enabled=false) and not running. Same for the various one-time enable/cadence-switch tasks (k12-grinder-enable-11pm, volunteer-grinder-enable-1130pm, etc.) — they're spent and disabled by design.
- DON'T flag `wayfinder-data-refresh` if lastRunAt is several days old — it's a Sunday-only weekly job; on non-Sundays drift is expected. On Sunday morning, however, it should fire by ~16:03 UTC.

## DATA QUALITY FLAGS

(none yet)

## CALIBRATION SUGGESTIONS

- Watchdog is well-tuned. If notification noise becomes excessive, consider reducing to every 12h or only-on-failure notifications (would require a notification-suppression scheme not currently available).
- Latency at advisor-status has been comfortably <1s for several consecutive runs; could tighten the UNHEALTHY threshold from 10s to ~5s to catch slow-down trends earlier.

## OPEN QUESTIONS

- Should the watchdog also do a TTFB / latency trend check (avg over 4 runs)?
- Worth adding a check on `_verified` count growth in scholarships/internships JSON to detect a silent grinder regression where commits happen but no verified data is being added?

## RUN HISTORY

(only ~30 days of history kept — older entries summarized)

- 2026-04-26 13:24 UTC — HEALTHY. Site 200/0.36s, frontend 200, last commit 13min ago (6d8e2c6 Volunteer grinder run 11), all enabled tasks firing on schedule. Volunteer + K12 grinders both green.
