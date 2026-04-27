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

---

## 2026-04-27 — Frontend UX Audit (deep)

**Focus area**: Frontend UX (per the lessons file: "Frontend UX has not yet been audited at depth — schedule it next").

**Scope**: `frontend/index.html` (HTML structure, ARIA, modal hygiene), `frontend/src/app.js` (XSS surfaces, stale ID references, escape consistency), `frontend/src/styles/main.css` (mobile breakpoints).

### Methodology
1. Static structural pass on `index.html` — counted opening vs. closing tags for all major containers (`div`, `section`, `header`, `footer`, `form`, `button`, etc.) — **all balanced**.
2. ID-reference cross-check: extracted every `$('id')` call from `app.js` (343 references), compared against every `id="..."` attribute in `index.html` (389 IDs). Surfaced 36 references that don't resolve statically — triaged into "dynamically created at runtime" vs. "stale rename".
3. ARIA / label cross-check: every `label[for="X"]` resolves to an existing `id="X"`. All `aria-labelledby` / `aria-describedby` / `aria-controls` targets resolve.
4. XSS surface scan: 149 `innerHTML =` assignments. Spot-checked dynamic interpolations for missing `escapeHtml()` / `_esc()`.
5. Mobile responsiveness: 18 `@media` blocks; verified 768px breakpoint covers sidebar, modals, welcome screen, messages, topbar; 767px breakpoint covers tool modals (.modal-tool-list, summer camps, volunteer, k12); 600px / 480px / 500px / 400px finer-grain tweaks present.

### Issues Found

| # | Severity | File | Issue | Status |
|---|----------|------|-------|--------|
| FUX-1 | HIGH | `frontend/src/app.js` — `getActiveToolContext()` line ~4715 | Essay branch is dead. Gate `$('essaysModal')` is null (renamed `essayView` at line 484). Field IDs `essayType`/`essayTargetSchool`/`essayText` are now `evEssayType`/`evTargetSchool`/`evEssayText`. Score selector `.essay-score-value` is now `.essay-score-num`. Result: David's chat receives no per-tool context whenever the user is on the essay page. `currentPage = 'essays'` is correctly set by `detectCurrentPage()` (which has the OR with `essayView`), but every essay-specific field — type, target school, prompt, word count, score — was dropped. | FIXED |
| FUX-2 | LOW | `frontend/src/app.js` — same function, internships branch line ~4733 | Read `$('internshipPaid')` — element doesn't exist. The Internships filter dropdown was renamed `internshipCost` (with values 'paid' / 'unpaid'). Code at line 3776-3777 already uses `internshipCost` for the search call, but the David-context capture wasn't updated. Result: paid/unpaid filter never appeared in active-filter context attached to David. | FIXED |
| FUX-3 | LOW | `frontend/src/app.js` — same function, K-8 fallback block lines ~4771–4776 | Fallback chain `$('scState') \|\| $('summerCampState') \|\| $('summerState')` always returned undefined. Actual K-8 browse filter IDs are `scBrowseState`, `scBrowseGrade`, `scBrowseCategory`, `scBrowseFormat`, `scBrowseCost`, plus `scBrowseRegion` / `scBrowseAppStatus` / `scBrowseStartWindow`. Result: Summer Camps (K-8) context was effectively empty in David context. | FIXED |
| FUX-4 | INFO | `frontend/src/app.js` — multiple `innerHTML` assignments | Inconsistent escaping: a few error-display paths use `_esc(data.error)` correctly (lines 5320, 5455, 6324, 6953, 7151, 7354), but several sibling lines still interpolate `${e.message}` directly (lines 5033, 5124, 5273, 5399, 5460, 5616, 5713, 6327, 6481). For network/fetch failures `Error.message` is browser-controlled string — practical risk is low, but the inconsistency invites a regression if a future error message ever flows from a server-side string. | NOT FIXED — informational |
| FUX-5 | INFO | `frontend/index.html` — Google Fonts link (line 129) | `&display=swap` is parsed as a malformed entity by strict HTML5 parsers (one parser warning). Browsers handle it fine; cosmetic only. Could escape as `&amp;display=swap` to silence the parser. | NOT FIXED — cosmetic |
| FUX-6 | INFO | `frontend/src/app.js` — `welcomeJoinLink` reference line ~1797 | Dead reference: `$('welcomeJoinLink')` returns null because the welcome screen "join with invite" link was removed/renamed. Code is guarded with `if (joinLink)` so no error. Suggest cleanup when the welcome flow is next touched. | NOT FIXED — dead code |
| FUX-7 | INFO | `frontend/src/app.js` — multi-id fallback chains for K-8 | Several legacy IDs (`scState`, `scCategory`, `summerCampState`, `summerState`, etc.) appear ONLY in `getActiveToolContext()` fallback chains — they don't exist anywhere else in the codebase. After patch FUX-3, these legacy entries are dead. Recommend deleting on next pass once the new IDs prove stable. | NOT FIXED — defer cleanup |

### Fix Details

**FUX-1 + FUX-2 + FUX-3 — patch in `frontend/src/app.js` `getActiveToolContext()`:**

Marker: `REVAMP V2: ESSAY CONTEXT FIX PATCH30` / `REVAMP V2: PATCH30`.

1. **Essay branch:** gate now matches either `essaysModal` (legacy) OR `essayView` (current). Field reads use the `ev*` IDs first, falling back to the legacy IDs. Added `essayPromptPreview` (first 240 chars of the prompt) since the prompt picker is a major part of the new UX. Score selector is now `.essay-score-num, .essay-score-value` (current first, legacy second).
2. **Internships branch:** added `$('internshipCost')` as the primary read (with `internshipPaid` legacy fallback), plus `internshipFormat` and `internshipRegion` since both are now first-class filters.
3. **K-8 fallback block:** prepended `scBrowse*` IDs to every fallback chain; added explicit captures for `scBrowseRegion` (USA / International), `scBrowseAppStatus` (deadline filter), and `scBrowseStartWindow` (date filter) — all introduced in patches 23/26 but missing from David context.

### Validation
- `node -c frontend/src/app.js` — PASS
- `node -c backend/server.js` — PASS
- `python3 html5lib parse frontend/index.html` — 1 cosmetic entity warning (FUX-5), no structural errors
- ID cross-check post-patch: all critical David-context paths now resolve to a valid DOM ID for the live UX.

### Positive Observations
1. Helmet CSP + sanitized `escapeHtml` (line 1644) + `formatDavidReply()` (line 4896) — David's reply text is escaped before any markdown markers are applied. XSS-safe path even with model-controlled output.
2. `detectCurrentPage()` already had the `essayView` OR fallback — only `getActiveToolContext()` was stale. The split between page detection and context extraction limits the blast radius of these renames.
3. Mobile CSS coverage is comprehensive — 18 media queries, with a global-overflow reset at 768px and tool-modal-specific rules at 767px. No horizontal-overflow risk on small viewports.
4. ARIA hygiene clean — every `label[for]` and `aria-*` reference resolves to an existing ID.
5. No duplicate IDs in `index.html` (400 unique IDs).
6. `sanitizeUrl()` prevents `javascript:` / `data:` injection in dynamically-rendered links.

### Files Changed
- `frontend/src/app.js` — 3 patches inside `getActiveToolContext()`. ~12 lines added, 6 lines modified. No behavior change for the chat pipeline; David context extraction now correctly captures essay / internships / K-8 state.

### Recommended Next Audit Targets
- Re-audit Auth & Access Control (~2026-05-03 per prior calibration).
- API Surface monthly cadence (covered 2026-04-25).
- Open question: ID-reference drift like FUX-1/2/3 happens whenever the HTML is renamed. Worth a once-a-week static check — could be a tiny pre-push linter script (`grep $('X')` in app.js → confirm exists in index.html). Cheap to write, prevents recurrence.
