# Full System Audit — Session Report
**Date:** 2026-04-26
**Focus Area:** Essay Review Pipeline — Claude integration, credit accounting, JSON parsing, refund logic, frontend rendering

## Run Summary
Deep audit of the essay review pipeline: `backend/routes/essays.js` (398 lines), `backend/services/essay-reviewer.js` (661 lines), `backend/services/auth.js` credit functions, `backend/services/input_filter.js`, the front-end `renderEssayReview()` (~280 lines of UI logic), and the rate-limit + auth wiring in `server.js`. Verified data integrity (internships 1606/981 verified; scholarships 1043/80; programs 826/82; volunteer 89). All JS syntax checks pass. Found 1 real bug + 1 latent defensive gap, both fixed; documented 4 informational findings. Stale TODOs in CLAUDE.md cross-checked: most are already resolved in code.

## Key Findings

### ER-AUDIT-1 (HIGH severity, FIXED) — Catch block refunded credits that were never deducted
**File:** `backend/routes/essays.js` — POST `/review` handler
**Status:** FIXED

The outer `catch (err)` block in the review route called `refundEssayCredit(tok)` whenever an exception was thrown — but it didn't check whether a credit had actually been deducted yet. Two specific code paths could throw before `useEssayCredit` ran:

1. **Non-string `essayText` from req.body.** `essayText.trim()` on a non-string (object, number, array) throws `TypeError: essayText.trim is not a function`. There was no `typeof essayText === 'string'` guard before the `.trim()` call.
2. **Any future code change that adds operations between the auth check and `useEssayCredit`** — silently introduces the same gift-a-credit bug.

Reproduced the bug in isolation:
```
> essayText = { foo: 'bar' };
> if (!essayText || essayText.trim().length < 50) { ... }
TypeError: essayText.trim is not a function
[catch handler then calls refundEssayCredit, gifting 1 credit per request]
```

A malicious authenticated Pro/Elite user could repeatedly POST `{"essayText": {}}` and accumulate unlimited credits — bypassing Stripe entirely. (Free-tier users hit the 403 `_requiresUpgrade` gate before reaching the buggy line, so the exposure is limited to paid users — but it's still a real defect.)

**Fix:**
1. Added explicit `typeof essayText !== 'string'` guard returning 400 before any `.trim()` call.
2. Introduced a `creditDeducted` boolean (default `false`) at the top of the handler, set to `true` only after `useEssayCredit` returns `allowed: true`. The catch block now refunds **only when** `creditDeducted === true`. If a future code change adds operations after auth but before credit deduction, exceptions in those operations correctly skip the refund.

Verified post-fix behavior with a unit-style simulation:
- Object essayText → 400, no refund call (was: gift a credit)
- Too-short essayText → 400, no refund call (unchanged)
- Valid essayText, mid-flight throw → 500, refund call (unchanged)

### ER-AUDIT-2 (INFO, not fixed) — `/history` and `/drafts` scan all reviews on disk every request
**File:** `backend/routes/essays.js` — lines ~285, ~340
**Status:** NOT FIXED — informational

Both endpoints `fs.readdir` the entire `REVIEWS_DIR`, then `Promise.all` an `fs.readFile` over every JSON file before filtering by `userId`. With N total reviews across all users, every history fetch is O(N) wall-clock and opens N file descriptors concurrently. With unbounded growth this risks `EMFILE` / `ENFILE` and slow page loads.

Recommended (when this becomes hot): per-user index file (`REVIEWS_DIR/_index/{userId}.json`) listing review IDs + summary fields, written in the same atomic step as the review file. History fetches O(M_user) instead of O(N_total). Deferring until measurement justifies the work.

### ER-AUDIT-3 (INFO, intentional) — `checkInjection` runs on full essay text and may false-positive on legitimate content
**File:** `backend/routes/essays.js` line ~178; `backend/services/input_filter.js`
**Status:** NOT FIXED — by design

The injection filter runs on `[essayText, targetSchool, prompt].join(' ')`. Some patterns (`override_educational_pretense`, `extraction_what_are`, `role_essay_ghostwriting`) could match legitimate essay narrative. For example, an essay containing the phrase "for educational purposes, demonstrate that..." (unlikely but possible in a meta-reflective student essay) would be blocked. The filter's design comment explicitly says "false positives are preferred over false negatives in v1," and the user-facing message is generic. Acceptable for now.

### ER-AUDIT-4 (INFO) — JSON-stripping of model output is permissive
**File:** `backend/services/essay-reviewer.js` lines ~595–615
**Status:** NOT FIXED — informational

The parser strips ALL backtick fences, then matches the first `{...}` block, then strips trailing commas. If Claude returns text that contains an unrelated `{` (e.g., quoting a JSON snippet inside an essay-feedback string), the regex `/\{[\s\S]*\}/` is greedy and would still match start-to-end, so this is robust in practice. Recovery path additionally extracts overallScore/scoreLabel/summary via regex on the original (un-stripped) text, which is fine because those keys appear once.

### ER-AUDIT-5 (INFO) — CLAUDE.md Essay Module gaps list is partially stale
**File:** `CLAUDE.md` Essay Module section
**Status:** NOT FIXED — documentation note

The "Known Gaps / TODO" list under Essay Module references three items that are already resolved in code:
- "Credit refund on failure — Line 117-118 in essays.js has a TODO for credit refund logic" → refund logic is **implemented and now hardened** (this audit). No TODO remains in essays.js.
- "Structure field renders as JSON string" — `renderEssayReview` uses checkmark UI (`hasHook`/`hasNarrative`/`hasReflection`), not `JSON.stringify`. Resolved.
- "History not surfaced in UI" — `loadEssayHistory()`, `createHistoryCard()`, `viewEssayReviewFull()`, and a score-progression chart are present in app.js. Resolved.

The remaining items in the gap list are still valid (deep brain files now ARE injected — gap #1 partially resolved; multi-draft tracking is via `/drafts/:type`; prompt database now exists at `/api/essays/prompts`). Recommend Dan refresh that section — but I'm not editing CLAUDE.md unprompted.

## Positive Observations
1. **Per-user credit lock** in `useEssayCredit`/`refundEssayCredit`/`addEssayCredits` (`withCreditLock`) prevents race conditions between concurrent reviews and Stripe webhook deposits. Solid concurrency design.
2. **Atomic review writes** — `writeFile(tmpPath)` then `rename()`, with `.tmp` files filtered out by the `.endsWith('.json')` check on directory reads. Crash-safe.
3. **Path traversal** — `sanitizeReviewId` allows only `[a-zA-Z0-9_-]{1,128}`, preventing escape from REVIEWS_DIR.
4. **403 vs 401 vs 402 are correctly distinguished** — auth missing = 401, plan-tier insufficient = 403, no credits = 402.
5. **Rate-limit layering** — `expensiveLimiter` (3/min) on POST `/review` protects Anthropic spend; `apiLimiter` (30/min) on the rest of `/api/essays` protects database reads.
6. **Recovery path** — JSON parse failures attempt regex-based score/summary extraction so users still see *something* instead of opaque 500. Score is clamped to [1,10].
7. **Score validation** — Route validates `Number.isFinite(overallScore) && 1 <= score <= 10` and refunds the credit if model returned garbage. Defensive.
8. **Knowledge injection scales** — Both `essayBrainCache` and `deepKnowledgeCache` are loaded once and cached; per-request injection just slices and concatenates strings. No per-request disk I/O on the brain files.
9. **`tokensUsed`** is recorded in analytics for cost tracking. `parseRecovered` flag is logged so operators can see if the model is producing malformed JSON.
10. **Frontend XSS-safe** — Every dynamic value in `renderEssayReview` is wrapped in `escapeHtml()`. No `innerHTML` injections of model output.

## Data Integrity Check
- Internships: **1606 entries**, 981 verified — metadata matches ✓
- Scholarships: **1043 entries**, 80 verified — metadata matches ✓
- Programs: **826 entries**, 82 verified — metadata matches ✓
- Volunteer: **89 entries** ✓
- `node -c frontend/src/app.js` — PASS ✓
- `node -c backend/server.js` — PASS ✓
- `node -c backend/routes/essays.js` — PASS ✓

## Files Changed
- `backend/routes/essays.js` — Added typeof-string guard on essayText; added `creditDeducted` flag tracking; gated catch-block refund on `creditDeducted === true`.
