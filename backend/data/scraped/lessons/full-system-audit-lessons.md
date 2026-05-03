# full-system-audit — Lessons Learned

> Read at the START of every run. Append takeaways at the END.

## CURRENT CALIBRATION

- frequency: daily 12am-ish
- focus_areas (rotating): Auth & Access Control, Essay Review Pipeline, Chat Pipeline, Data Layer, Frontend UX, API Surface, Infrastructure
- last_calibration_change: 2026-05-03 — Chat Pipeline pass surfaced one HIGH-impact bug (claude.js engine mode silently routing to lite-brain because retrieveContext defaults mode='standard'). Confirms the cross-call-site shape-audit lesson from 2026-05-02 has high yield: same pattern, two consecutive audits. Promote dispatch-default consistency to the recurring sub-check list (when a function uses default-arg dispatch, audit every caller for the implicit-default surprise).

## EFFECTIVE PATTERNS

- **Rotating focus areas** (one per run) produces better depth than a generic "audit everything" sweep.
- **AUDIT_LOG.md cumulative open-issue tracker** is the source of truth — close stale items, flag new ones.
- **Cross-check CLAUDE.md "Known Gaps" against actual code.** Stale TODOs are common — items get fixed in passing without the doc being updated. The 2026-04-26 essay audit found 3 stale items in the Essay Module gap list.
- **Trace error/exception paths against state mutations.** When a code path mutates state (deduct credit, write file, send email), then later might throw, ask: "if it throws AT THIS LINE, do we correctly roll back?" The 2026-04-26 essay-route bug was exactly this — the catch refunded state that wasn't yet mutated.
- **Reproduce defects in isolation with a tiny Node script.** A 5-line repro script `node /tmp/test.mjs` proves the bug exists before patching, and proves the patch works after. The 2026-05-02 TG-AUDIT-1 bug was confirmed in 20 lines.
- **For LLM-backed routes that gate on payment/credit/quota:** explicitly model the "exception thrown before deduction" path. Track a `mutationApplied` boolean in scope; gate compensation on it.
- **Defensive type-narrowing for req.body fields.** Even when a route validates length/range, an attacker can send the wrong *type* (object instead of string). `typeof x !== 'string'` should precede `.trim()` / `.length` / `.split()` calls. Express.json() doesn't enforce schema. The 2026-05-02 audit found this same pattern on every unauthenticated email-bearing endpoint in routes/auth.js.
- **ID-reference cross-check on the frontend.** Diff every `$('id')` call in `app.js` against the `id="..."` attributes in `index.html`. Surfaces stale renames that compile cleanly but silently dropped feature wiring. The 2026-04-27 audit caught FUX-1/2/3 (essay context, internship-paid filter, K-8 filter chain) entirely from this one diff — these would never trip a syntax or runtime error because every read was guarded with `?.value` and the consumers ignore undefined.
- **`?.value` fallback chains hide rename drift.** Any time the codebase has `$('legacyId')?.value || $('newId')?.value` patterns, treat them as load-bearing technical debt. The legacy half stops returning anything when the rename happens, but the chain still "works" — just drops data. Audit chains specifically: which rung is actually live today?
- **Cross-call-site return-shape audit when a function is consumed by ≥2 modules.** The 2026-05-02 TG-AUDIT-1 bug was caused by `tier-gates.js` accessing `verifyToken(token).user` while every other consumer accessed the flat object directly. Whenever a service exports a function that's imported by multiple other modules, grep every call site and confirm they all destructure the same shape. The outlier is usually wrong.
- **Look for `(result && result.x) || null` patterns specifically.** They're a code smell — they silently swallow shape mismatches because both `null` and the wrong-shape result coerce to "falsy enough." If `result` is supposed to be an object, write `result || null` and `result.x` separately.
- **Default-arg dispatch is a bug-attractor.** Functions that branch on a parameter with a `||` default (`mode = options.mode || 'standard'`) are dangerous because callers who pass an options object without setting the mode silently take the default branch. The 2026-05-03 CP-AUDIT-1 was exactly this — claude.js called `retrieveContext({topK, userId})` and got `mode='standard'` (lite-brain) when it intended `mode='engine'` (BM25). The fix is one keyword in the call, but finding it required reading the dispatcher: ALWAYS read the function signature when auditing a multi-consumer service. If the function is `f(x, options)` and `options` has multiple keys with `||` defaults, every caller needs to be checked for which keys they DON'T pass.
- **Repro fixes with side-by-side calls in a tiny script.** For dispatch-default bugs, calling the function once with the broken-shape options and once with the fixed-shape options shows the diff in 4 lines. Saves arguing about whether the fix actually does anything. CP-AUDIT-1 verification was 4 lines of node + a tail of the output.

## FAILED PATTERNS / ANTI-PATTERNS

- Don't open an issue without proposing a fix or explicitly tagging "DEFERRED — bigger redesign needed."
- Don't auto-fix changes that touch the chat pipeline without a smoke-test commit.
- Don't trust that "the tests/grep would have caught it" for a route that has no automated test coverage. Read the actual code.
- Don't refund/rollback in a catch block without checking whether the corresponding action actually ran. Always pair `mutate → set flag → catch checks flag`.
- Don't trust shape-defensive patterns like `(x && x.field) || null` to surface bugs — they hide them. They're worse than `x.field` because `x.field` would NPE loudly on a wrong shape; the `&& .field` pattern silently returns `null`.

## SOURCE-SPECIFIC NOTES

- **`backend/routes/essays.js` POST `/review`** — has a complex error/recovery flow with multiple refund paths. Worth re-auditing whenever this route changes. Pre-fix it had a credit-gift bug; the `creditDeducted` flag pattern should be preserved.
- **`backend/routes/auth.js`** — recurring pattern of returning 400 for "Not authenticated" instead of 401. Three instances were fixed 2026-04-25; 2026-05-02 added 401 guards to `/sessions`, `/engine-usage`, `/token-usage`, `/search`. Re-audit on next auth-touching commit.
- **`backend/routes/auth.js` unauth email endpoints** — 2026-05-02 added typeof guards to signup/login/forgot-password/reset-password. New auth endpoints should follow the same `if (typeof email !== 'string') return 400` pattern up front.
- **`backend/routes/feedback.js`** — recurring weak-validation footprint. 2026-04-25 added bounds on `messageIndex`. Watch for similar weakly-typed JSONL appends.
- **`backend/services/intelligence-analytics.js`** — JSONL aggregator. Schema drift here would affect admin dashboards.
- **`backend/services/tier-gates.js`** — 2026-05-02 found a verifyToken return-shape bug here. The module is the only one in the codebase that did `(result && result.user) || null` instead of treating the flat user object as the result. Re-audit any new tier-gating helpers added here for the same pattern.
- **`frontend/src/app.js` `getActiveToolContext()`** (lines ~4710–4810) — primary surface where DOM-ID renames in `index.html` silently break David's per-tool context. Re-check this function whenever a tool modal/view is renamed or a filter dropdown is added/renamed. PATCH30 (2026-04-27) updated it for essay-view, internshipCost, and scBrowse* IDs.
- **`backend/services/scope_classifier.js` + `backend/services/curated-db-context.js`** — confirmed 2026-05-02 that neither consumes frontend DOM IDs. Open question from 2026-04-27 closed. They consume only message text + JSON data files, so ID renames don't cascade.
- **`backend/services/knowledge.js` `retrieveContext` dispatcher** — 2026-05-03 found that `claude.js` and `slm.js` are both consumers but only one set `mode:'engine'`. Re-audit any new consumer of `retrieveContext` to confirm it sets mode explicitly. Consider: should the default be `'engine'` (safer for the heavyweight call) and `'standard'` be opt-in? If we keep mode-defaulting-to-standard, document it on the function and add a JSDoc warning to the source. Also: the in-tree comment block at the top of the function still says "legacy (claude.js)" — that's outdated post-fix, claude.js now uses the new options form WITH `mode`.
- **`backend/services/curated-search.js` intl scoring** — 2026-05-03 fixed a US-state-detection regex that omitted territories. Future-proofing rule: when a function builds an in-place regex from an enum-like list, AND that enum-like list is already declared elsewhere in the file as a Set, use the Set. The duplicate-source-of-truth pattern in `curated-search.js` was the bug seed.

## DATA QUALITY FLAGS

- **CLAUDE.md "Known Gaps / TODO" lists drift from code.** When a TODO is closed in code, the doc is rarely updated. Recommend either (a) auto-pruning tasks on commit messages mentioning the TODO ID, or (b) periodic doc refresh task. For now, audit reports cross-reference and flag staleness.
- **VIP_EMAILS persistence.** addVIP/removeVIP only mutate the in-memory list. Render redeploys reset to env-var defaults. If the runtime API is intended to be the source of truth, persistence to disk should be added. If it's intended only for testing, the API endpoint should warn or not exist.

## CALIBRATION SUGGESTIONS

- Continue current rotation. Frontend UX baseline audit completed 2026-04-27 — re-check on a 4-week cadence (or whenever a tool modal is renamed).
- Essay Pipeline is now baseline-clean. Re-audit only when a release touches it OR every 3-4 weeks.
- API Surface re-audit cadence: monthly (covered well 2026-04-25, no urgency).
- **Auth & Access Control: re-audit cadence is now ~1 month** (covered 2026-05-02). Add a sub-check to every audit: "is there any new caller of `verifyToken` since last audit, and does it treat the return as the flat user object?"
- **Frontend UX: ID-drift static check should be promoted to a pre-push linter** rather than an audit-time spot check.
- **NEW recurring audit sub-check across all rotations**: when a service exposes a function used by ≥2 modules, grep all callers and confirm they destructure / shape-handle identically. The 2026-05-02 outlier-call-site pattern is reusable across the codebase (curated-db-context, intelligence-analytics, scope_classifier, etc.).
- **NEW recurring audit sub-check from 2026-05-03**: for any function that branches on an option with `||` default (`mode = opts.mode || 'standard'`), audit every caller for the implicit-default branch. Equivalent surface area to the call-site-shape rule but catches a different bug class.
- **Chat Pipeline: re-audit cadence is now ~1 month** (covered 2026-05-03). High patch-velocity area (35-45 in <2 days), worth checking back after the next 5-patch run.

## OPEN QUESTIONS

- Should audits self-document their reasoning trace alongside the diff?
- Should we add a `tests/` smoke harness for the essay route specifically? The 2026-04-26 bug was reproducible in 5 lines and would have been caught by any property-based fuzz test of the route. Cost-benefit pending.
- The `/history` O(N) scan is theoretically problematic. Build per-user index now, or wait for measurement?
- Should a code-mod pass globally rewrite `(result && result.x) || null` patterns to be explicit about what shape they expect? Net-new findings would be rare but the patterns are bug-attractors.
- Does Dan want VIP_EMAILS persistence shipped now that it's flagged, or is the in-memory + env-var hybrid intentional?
- Should `retrieveContext`'s `mode` default flip from `'standard'` to `'engine'`? `'standard'` is the cheaper path; `'engine'` is the heavier path. If the heavier path is what callers more often want (claude.js engine + slm.js both want engine), the default should match. Cost: a few extra ms when an unintended call lands the heavy path; benefit: the engine-mode regression is structurally impossible.
- Should the engine-mode RAG regression be backfilled in the lessons file as an architectural recommendation (e.g., "prefer required parameters over defaulted parameters when the branches have meaningfully different cost profiles")?

## RUN HISTORY

| Date | Area | Depth | Found | Fixed | Notable |
|------|------|-------|-------|-------|---------|
| 2026-04-24 | Cost/Resource + Security/Auth + Data | broad | 0 | 0 | Clean across all three layers |
| 2026-04-25 (nightly) | Cost + Data | medium | 0 | 0 | All clean |
| 2026-04-25 (full)    | API Surface | deep | 4 | 4 | feedback.js bounds + auth.js 401 returns |
| 2026-04-26 (full)    | Essay Pipeline | deep | 1 high + 4 info | 1 | credit-gift bug via non-string essayText |
| 2026-04-27 (full)    | Frontend UX    | deep | 1 high + 2 low + 4 info | 3 | David context extraction was reading stale DOM IDs after recent renames |
| 2026-05-02 (full)    | Auth & Access Control | deep | 1 high + 2 low + 3 info | 4 | tier-gates.js getUserFromReq read wrong return shape from verifyToken — paid users treated as free in K-8 + David coach |
| 2026-05-03 (full)    | Chat Pipeline | deep | 1 high + 1 low + 3 info | 2 | claude.js engine mode silently using lite-brain — paid users got Opus + Sonnet's lite-RAG context since SLM tier landed; patches 37 & 45 deep brain unreachable from engine path until fix |
