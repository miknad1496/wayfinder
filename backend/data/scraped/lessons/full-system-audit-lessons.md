# full-system-audit — Lessons Learned

> Read at the START of every run. Append takeaways at the END.

## CURRENT CALIBRATION

- frequency: daily 12am-ish
- focus_areas (rotating): Auth & Access Control, Essay Review Pipeline, Chat Pipeline, Data Layer, Frontend UX, API Surface, Infrastructure
- last_calibration_change: 2026-04-26 — added essay-pipeline-specific anti-patterns after first deep audit of that area

## EFFECTIVE PATTERNS

- **Rotating focus areas** (one per run) produces better depth than a generic "audit everything" sweep.
- **AUDIT_LOG.md cumulative open-issue tracker** is the source of truth — close stale items, flag new ones.
- **Cross-check CLAUDE.md "Known Gaps" against actual code.** Stale TODOs are common — items get fixed in passing without the doc being updated. The 2026-04-26 essay audit found 3 stale items in the Essay Module gap list.
- **Trace error/exception paths against state mutations.** When a code path mutates state (deduct credit, write file, send email), then later might throw, ask: "if it throws AT THIS LINE, do we correctly roll back?" The 2026-04-26 essay-route bug was exactly this — the catch refunded state that wasn't yet mutated.
- **Reproduce defects in isolation with a tiny Node script.** A 5-line repro script `node /tmp/test.mjs` proves the bug exists before patching, and proves the patch works after.
- **For LLM-backed routes that gate on payment/credit/quota:** explicitly model the "exception thrown before deduction" path. Track a `mutationApplied` boolean in scope; gate compensation on it.
- **Defensive type-narrowing for req.body fields.** Even when a route validates length/range, an attacker can send the wrong *type* (object instead of string). `typeof x !== 'string'` should precede `.trim()` / `.length` / `.split()` calls. Express.json() doesn't enforce schema.

## FAILED PATTERNS / ANTI-PATTERNS

- Don't open an issue without proposing a fix or explicitly tagging "DEFERRED — bigger redesign needed."
- Don't auto-fix changes that touch the chat pipeline without a smoke-test commit.
- Don't trust that "the tests/grep would have caught it" for a route that has no automated test coverage. Read the actual code.
- Don't refund/rollback in a catch block without checking whether the corresponding action actually ran. Always pair `mutate → set flag → catch checks flag`.

## SOURCE-SPECIFIC NOTES

- **`backend/routes/essays.js` POST `/review`** — has a complex error/recovery flow with multiple refund paths. Worth re-auditing whenever this route changes. Pre-fix it had a credit-gift bug; the `creditDeducted` flag pattern should be preserved.
- **`backend/routes/auth.js`** — recurring pattern of returning 400 for "Not authenticated" instead of 401. Three instances were fixed 2026-04-25; verify any newly-added auth-touching endpoints follow the early `if (!token) return 401` guard.
- **`backend/routes/feedback.js`** — recurring weak-validation footprint. 2026-04-25 added bounds on `messageIndex`. Watch for similar weakly-typed JSONL appends.
- **`backend/services/intelligence-analytics.js`** — JSONL aggregator. Schema drift here would affect admin dashboards.

## DATA QUALITY FLAGS

- **CLAUDE.md "Known Gaps / TODO" lists drift from code.** When a TODO is closed in code, the doc is rarely updated. Recommend either (a) auto-pruning tasks on commit messages mentioning the TODO ID, or (b) periodic doc refresh task. For now, audit reports cross-reference and flag staleness.

## CALIBRATION SUGGESTIONS

- Continue current rotation. Frontend UX has not yet been audited at depth — schedule it next.
- Essay Pipeline is now baseline-clean. Re-audit only when a release touches it OR every 3-4 weeks.
- API Surface re-audit cadence: monthly (covered well 2026-04-25, no urgency).
- Auth & Access Control: schedule for ~2026-05-03.

## OPEN QUESTIONS

- Should audits self-document their reasoning trace alongside the diff?
- Should we add a `tests/` smoke harness for the essay route specifically? The 2026-04-26 bug was reproducible in 5 lines and would have been caught by any property-based fuzz test of the route. Cost-benefit pending.
- The `/history` O(N) scan is theoretically problematic. Build per-user index now, or wait for measurement?

## RUN HISTORY

| Date | Area | Depth | Found | Fixed | Notable |
|------|------|-------|-------|-------|---------|
| 2026-04-24 | Cost/Resource + Security/Auth + Data | broad | 0 | 0 | Clean across all three layers |
| 2026-04-25 (nightly) | Cost + Data | medium | 0 | 0 | All clean |
| 2026-04-25 (full)    | API Surface | deep | 4 | 4 | feedback.js bounds + auth.js 401 returns |
| 2026-04-26 (full)    | Essay Pipeline | deep | 1 high + 4 info | 1 | credit-gift bug via non-string essayText |
