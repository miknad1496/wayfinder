# wayfinder-watchdog — Lessons Learned

> Read at the START of every run. Append takeaways at the END.

## CURRENT CALIBRATION

- frequency: every 6h
- typical_run_duration: <60 sec
- last_calibration_change: 2026-04-27 — added 3-task simultaneous-stall pattern (esms-grinder + insight-harvest + drift-monitor stalling together while audits keep firing → suspect tool-approval gate, not code bug)

## EFFECTIVE PATTERNS

- Use `wayfinderai.org` for all health checks. The `.onrender.com` subdomain is intentionally suspended (Render does this when a custom domain is configured) — its "Service Suspended" page is expected, not a fault.
- Compare lastRunAt of scheduled tasks vs cron interval × 2 — anything older signals a stalled task.
- Push freshness baseline: with active grinders running on `*/15`-or-tighter cadences, commits land every ~5-15 min during business hours. A multi-hour gap during active hours is a signal to look at task health.
- Active grinder slate (as of 2026-04-26 evening): `wayfinder-esms-grinder` (cron `5,20,35,50 * * * *`, ~4×/hr) and `wayfinder-insight-harvest` (cron `8,38 * * * *`, 2×/hr) are the current write-side workhorses. K12 + volunteer grinders have been parked (enabled=false) — that's a deliberate handoff, not a regression.
- Three-task simultaneous stall pattern observed 2026-04-27: esms-grinder + insight-harvest + drift-monitor all stopped firing within ~6h of each other while audits kept running fine. Common factor: all three are MCP-tool-heavy (web fetch, DB diff, analytics fetch) — likely ran into a tool-approval prompt that paused all subsequent runs. Audit tasks (which use mostly Read/Bash) were unaffected. Watch for this clustering pattern; if multiple data-write tasks stall together, suspect a permissions/approval gate rather than a code bug.

## FAILED PATTERNS

- Curling wayfinder.onrender.com triggered a false alarm in early runs — fixed by hardcoding wayfinderai.org as the only health URL in the prompt.
- DON'T flag `wayfinder-internship-grinder` as stalled — it's intentionally disabled (cron `0 0 1 1 *`, enabled=false) and not running. Same for the various one-time enable/cadence-switch tasks (k12-grinder-enable-11pm, volunteer-grinder-enable-1130pm, etc.) — they're spent and disabled by design.
- DON'T flag `wayfinder-data-refresh` if lastRunAt is several days old — it's a Sunday-only weekly job; on non-Sundays drift is expected. On Sunday morning, however, it should fire by ~16:03 UTC.
- DON'T flag `wayfinder-k12-grinder` or `wayfinder-volunteer-grinder` as stalled when their lastRunAt is hours old — both have been parked (enabled=false) in favor of the ESMS grinder + insight-harvest. Their lastRunAt represents the final pre-park run (mid-afternoon 2026-04-26).

## DATA QUALITY FLAGS

- 2026-04-26 19:27 UTC — sandbox `/` filesystem hit 100% used (9.6G/9.6G), with `36M` free. Stale clones from prior nobody-uid sessions (`/tmp/wfg2`, `/tmp/wf-fresh`, `/tmp/harvest*`, etc.) couldn't be removed by current user (Permission denied: not our uid). Worked around by cloning into `/sessions/clever-dazzling-cray/work/wf-watch` instead of `/tmp`. Future runs should default to a path under `/sessions/...` if `/tmp` is full or owned by an old uid.

## CALIBRATION SUGGESTIONS

- Watchdog is well-tuned. If notification noise becomes excessive, consider reducing to every 12h or only-on-failure notifications (would require a notification-suppression scheme not currently available).
- Latency at advisor-status has been comfortably <1s for several consecutive runs; could tighten the UNHEALTHY threshold from 10s to ~5s to catch slow-down trends earlier.
- Consider adding a sanity-check that the active grinder slate hasn't silently changed without a lessons-file update — currently the watchdog detects "things still firing on schedule" but doesn't notice if the schedule of which tasks are active has shifted.
- `/tmp` may not be reliably writable across runs. Recommend hardcoding `/sessions/clever-dazzling-cray/work/` as the watchdog's clone target in the next prompt rev.
- Add an active-task lastRunAt freshness scan to the watchdog: for every enabled, non-one-time task, compare lastRunAt to (cron interval × 2) and surface any drift. Today's 3-task stall would have been caught earlier had the watchdog explicitly flagged drift-monitor + esms-grinder + insight-harvest. The current rule ("compare lastRunAt vs cron × 2") was applied manually this run — should be the default check loop, not a judgment call.

## OPEN QUESTIONS

- Should the watchdog also do a TTFB / latency trend check (avg over 4 runs)?
- Worth adding a check on `_verified` count growth in scholarships/internships JSON to detect a silent grinder regression where commits happen but no verified data is being added?
- Why did `k12-grinder-enable-11pm` apparently never fire (no `lastRunAt` field) while `volunteer-grinder-enable-1130pm` did? Both are now moot since the grinders are intentionally parked, but worth noting if similar one-time enables are scheduled in future.

## RUN HISTORY

(only ~30 days of history kept — older entries summarized)

- 2026-04-26 13:24 UTC — HEALTHY. Site 200/0.36s, frontend 200, last commit 13min ago (6d8e2c6 Volunteer grinder run 11), all enabled tasks firing on schedule. Volunteer + K12 grinders both green.
- 2026-04-26 19:27 UTC — HEALTHY. Site 200/0.35s, frontend 200, last commit 4min ago (b199540 "Harvest run 2: k12 — 5 entries scanned, 10 insights captured"). All enabled tasks on schedule. K12 + volunteer grinders now intentionally parked; ESMS grinder + insight-harvest are the new active write loop. Sandbox `/tmp` was at 100% with leftover dirs from prior uids — cloned into `/sessions/clever-dazzling-cray/work/` to work around.
- 2026-04-27 23:24 UTC — DEGRADED. Site 200/0.51s, frontend 200, last commit 2min ago (c595328 "Full system audit (Frontend UX): fix David context extraction stale DOM IDs"). Audits + ii-scraper-watchdog firing fine. STALLED: `wayfinder-esms-grinder` lastRunAt 2026-04-26T23:30 (~24h ago, ~95 missed slots — cron 5,20,35,50); `wayfinder-insight-harvest` lastRunAt 2026-04-26T21:40 (~26h ago, ~52 missed slots — cron 8,38); `wayfinder-drift-monitor` lastRunAt 2026-04-26T12:02 (~35h ago, missed today's 05:03 UTC slot). All three are still enabled=true with fresh nextRunAt timestamps in the API, but their lastRunAt has not advanced — classic queued-but-not-executing pattern. Suggested next step: Dan hits "Run now" on esms-grinder + insight-harvest + drift-monitor to clear any stuck approval, or toggle enabled=false→true to flush stale queued runs.
