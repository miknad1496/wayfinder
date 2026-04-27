# full-system-audit — Lessons Learned

> Read at the START of every run. Append takeaways at the END.

## CURRENT CALIBRATION

- frequency: daily 12am-ish
- focus_areas (rotating): Auth & Access Control, Essay Review Pipeline, Chat Pipeline, Data Layer, Frontend UX, API Surface, Infrastructure
- last_calibration_change: 2026-04-27 — added FRONTEND-UX rename-drift anti-pattern after first deep frontend audit; recommend a pre-push static check

## EFFECTIVE PATTERNS

- **Rotating focus areas** (one per run) produces better depth than a generic "audit everything" sweep.
- **AUDIT_LOG.md cumulative open-issue tracker** is the source of truth — close stale items, flag new ones.
- **Cross-check CLAUDE.md "Known Gaps" against actual code.** Stale TODOs are common — items get fixed in passing without the doc being updated. The 2026-04-26 essay audit found 3 stale items in the Essay Module gap list.
- **Trace error/exception paths against state mutations.** When a code path mutates state (deduct credit, write file, send email), then later might throw, ask: "if it throws AT THIS LINE, do we correctly roll back?" The 2026-04-26 essay-route bug was exactly this — the catch refunded state that wasn't yet mutated.
- **Reproduce defects in isolation with a tiny Node script.** A 5-line repro script `node /tmp/test.mjs` proves the bug exists before patching, and proves the patch works after.
- **For LLM-backed routes that gate on payment/credit/quota:** explicitly model the "exception thrown before deduction" path. Track a `mutationApplied` boolean in scope; gate compensation on it.
- **Defensive type-narrowing for req.body fields.** Even when a route validates length/range, an attacker can send the wrong *type* (object instead of string). `typeof x !== 'string'` should precede `.trim()` / `.length` / `.split()` calls. Express.json() doesn't enforce schema.
- **ID-reference cross-check on the frontend.** Diff every `$('id')` call in `app.js` against the `id="..."` attributes in `index.html`. Surfaces stale renames that compile cleanly but silently dropped feature wiring. The 2026-04-27 audit caught FUX-1/2/3 (essay context, internship-paid filter, K-8 filter chain) entirely from this one diff — these would never trip a syntax or runtime error because every read was guarded with `?.value` and the consumers ignore undefined.
- **`?.value` fallback chains hide rename drift.** Any time the codebase has `$('legacyId')?.value || $('newId')?.value` patterns, treat them as load-bearing technical debt. The legacy half stops returning anything when the rename happens, but the chain still "works" — just drops data. Audit chains specifically: which rung is actually live today?

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
- **`frontend/src/app.js` `getActiveToolContext()`** (lines ~4710–4810) — primary surface where DOM-ID renames in `index.html` silently break David's per-tool context. Re-check this function whenever a tool modal/view is renamed or a filter dropdown is added/renamed. PATCH30 (2026-04-27) updated it for essay-view, internshipCost, and scBrowse* IDs.

## DATA QUALITY FLAGS

- **CLAUDE.md "Known Gaps / TODO" lists drift from code.** When a TODO is closed in code, the doc is rarely updated. Recommend either (a) auto-pruning tasks on commit messages mentioning the TODO ID, or (b) periodic doc refresh task. For now, audit reports cross-reference and flag staleness.

## CALIBRATION SUGGESTIONS

- Continue current rotation. Frontend UX baseline audit completed 2026-04-27 — re-check on a 4-week cadence (or whenever a tool modal is renamed).
- Essay Pipeline is now baseline-clean. Re-audit only when a release touches it OR every 3-4 weeks.
- API Surface re-audit cadence: monthly (covered well 2026-04-25, no urgency).
- Auth & Access Control: schedule for ~2026-05-03.
- **Frontend UX: ID-drift static check should be promoted to a pre-push linter** rather than an audit-time spot check. A 30-line Node script that grep-extracts `$('id')` from app.js and asserts each ID exists in index.html (or is created via createElement / innerHTML in app.js) would catch FUX-1/2/3-class regressions at commit time.
- Frontend UX re-audit: 4-week cadence is fine if the linter ships. Without the linter, monthly is too lax — every modal rename can introduce a stale-reference bug.

## OPEN QUESTIONS

- Should audits self-document their reasoning trace alongside the diff?
- Should we add a `tests/` smoke harness for the essay route specifically? The 2026-04-26 bug was reproducible in 5 lines and would have been caught by any property-based fuzz test of the route. Cost-benefit pending.
- The `/history` O(N) scan is theoretically problematic. Build per-user index now, or wait for measurement?
- After the frontend ID-drift findings — should we also audit `backend/services/scope-classifier.js` and `backend/services/sse-context.js` for stale page/tool name references? They consume what `getActiveToolContext()` produces and may have their own assumptions about field names like `essayType` etc.

## RUN HISTORY

| Date | Area | Depth | Found | Fixed | Notable |
|------|------|-------|-------|-------|---------|
| 2026-04-24 | Cost/Resource + Security/Auth + Data | broad | 0 | 0 | Clean across all three layers |
| 2026-04-25 (nightly) | Cost + Data | medium | 0 | 0 | All clean |
| 2026-04-25 (full)    | API Surface | deep | 4 | 4 | feedback.js bounds + auth.js 401 returns |
| 2026-04-26 (full)    | Essay Pipeline | deep | 1 high + 4 info | 1 | credit-gift bug via non-string essayText |
| 2026-04-27 (full)    | Frontend UX    | deep | 1 high + 2 low + 4 info | 3 | David context extraction was reading stale DOM IDs after recent renames (essay view, internshipCost, scBrowse*) |
