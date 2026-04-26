# full-system-audit — Lessons Learned

> Read at the START of every run. Append takeaways at the END.

## CURRENT CALIBRATION

- frequency: daily 12am-ish
- focus_areas (rotating): Security, Performance, UX, Data Integrity, API Surface, Code Quality, Auth, Essay Pipeline
- last_calibration_change: 2026-04-26 — initial bootstrap

## EFFECTIVE PATTERNS

- Rotating focus areas (one per run) produces better depth than a generic "audit everything" sweep.
- The AUDIT_LOG.md cumulative open-issue tracker is the source of truth — close stale items, flag new ones, never forget.
- When fixing security issues, also commit a regression test or a clearly-named comment so future audits don't re-flag the same thing.

## FAILED PATTERNS

- Don't open an issue without proposing a fix or explicitly tagging "DEFERRED — bigger redesign needed."
- Don't auto-fix changes that touch the chat pipeline without a smoke-test commit.

## DATA QUALITY FLAGS

(empty — populated as discovered)

## CALIBRATION SUGGESTIONS

- Continue current rotation. If a focus area produces "no findings" for 3 consecutive runs, consider compressing it (e.g. UX has been quiet — drop to every other rotation).

## OPEN QUESTIONS

- Should audits self-document their reasoning trace alongside the diff?

## RUN HISTORY

(see git log for "nightly audit" / "Full system audit" commits)
