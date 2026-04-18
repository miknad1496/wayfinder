# Full System Audit — Session Report
**Date:** 2026-04-18
**Focus Area:** Essay Review Pipeline — Claude integration, JSON parsing, credit system, error recovery, timeout handling, input validation, dead code

## Run Summary
Deep audit of the entire essay review pipeline: `backend/routes/essays.js`, `backend/services/essay-reviewer.js`, `backend/routes/essay-coach.js`, and the credit system in `backend/services/auth.js`. Reviewed frontend rendering in `app.js` (lines 3221-3640). Found and fixed 3 issues, documented 4 informational findings.

## Key Findings

### EP-1: LOW — essayType POST validation missing length limit
**File:** `backend/routes/essays.js` — line 168
**Status:** FIXED

The `essayType` field on POST `/api/essays/review` was validated as a string but had no max length. Since `essayType` is passed as a search term into `extractRelevantSections()` for knowledge extraction, an arbitrarily long string could cause unnecessary processing. The `/drafts/:essayType` route already enforced a 64-char limit, but the POST route did not.

**Fix:** Added `essayType.length > 64` check to the POST validation, matching the drafts route limit.

### EP-2: LOW — History endpoint essayType query param unvalidated
**File:** `backend/routes/essays.js` — line 269
**Status:** FIXED

The `GET /api/essays/history` endpoint accepted `req.query.essayType` without any length validation. While this is only used as a string equality filter (not as a search term), it's good practice to cap it for consistency with other endpoints.

**Fix:** Added type and length validation (string, max 64 chars). Invalid values silently ignored (filter becomes undefined, returning all results).

### EP-3: INFO — Dead code: BASE_SYSTEM_PROMPT in essay-reviewer.js
**File:** `backend/services/essay-reviewer.js` — lines 411-476
**Status:** FIXED (removed)

A large `BASE_SYSTEM_PROMPT` constant (~65 lines, ~2500 chars) was defined but never referenced anywhere in the codebase. The active system prompt is built by `buildEnhancedSystemPrompt()` (line 316) which includes all the same guidance plus knowledge injection. This dead code was likely the original prompt before knowledge injection was implemented.

**Fix:** Removed the dead constant and added a comment noting it was removed and why.

### EP-4: INFO — Duplicate JSDoc comment on refundEssayCredit
**File:** `backend/services/auth.js` — lines 1364-1369
**Status:** FIXED

Two consecutive JSDoc blocks preceded `refundEssayCredit()`. Merged into a single comment.

### EP-5: INFO — History/drafts endpoints have unbounded file read concurrency
**File:** `backend/routes/essays.js` — lines 278, 329
**Status:** NOT FIXED — informational

Both `/history` and `/drafts/:essayType` use `Promise.all(files.map(async file => ...))` to read ALL review JSON files in parallel. If the reviews directory grows to thousands of files, this creates a burst of concurrent file descriptors. Currently safe (0 review files exist on disk), but will become a performance concern at scale.

**Recommendation:** When review volume grows past ~200, consider either: (a) an index file that maps userId to their review IDs, or (b) batched reads with a concurrency limiter (e.g., `p-limit`).

### EP-6: INFO — max_tokens: 3500 is tight for the full review JSON schema
**File:** `backend/services/essay-reviewer.js` — line 536
**Status:** NOT FIXED — informational

The review JSON schema has 14 top-level fields including nested objects (voiceAssessment, structure, emotionalArc, admissionsImpact) and arrays (strengths, improvements, lineNotes). A thorough review with 5+ line notes and 4+ improvements could approach 3000 tokens. The 3500 limit provides a thin margin. If Claude generates detailed feedback, JSON may get truncated, triggering the parse recovery path (partial review with only score/label/summary).

The parse recovery at line 564 handles this gracefully (extracts score via regex), so this is not a bug — but it may cause some users to receive degraded reviews. Consider bumping to 4000 if Opus output costs are acceptable.

### EP-7: INFO — Essay type not validated against ESSAY_TYPES enum
**File:** `backend/routes/essays.js` — POST handler
**Status:** NOT FIXED — informational, by design

The POST `/api/essays/review` accepts any string as `essayType` (up to 64 chars after EP-1 fix). It is not validated against the `ESSAY_TYPES` keys in `essay-reviewer.js`. Invalid types fall back to `ESSAY_TYPES.other` ("General College Essay") on line 489, so functionality is correct. However, the stored review record preserves the original invalid type string, which could cause confusion in history/drafts filtering.

This appears to be by design — allowing frontend flexibility to add new types without backend changes. No fix needed.

## Positive Observations

1. **Credit system is race-condition-safe** — `withCreditLock` properly serializes concurrent credit operations per user using promise chaining. The lock cleanup in the `finally` block is correct.
2. **Refund on failure is comprehensive** — Three separate code paths handle credit refunds: (a) `reviewEssay()` returns `success: false`, (b) review has invalid structure (no overallScore), (c) unexpected exception in the outer try/catch. All three refund paths work correctly.
3. **Atomic file writes** — Both review storage (essays.js line 229-230) and user data (auth.js atomicWriteJSON) use write-to-temp-then-rename pattern, preventing corruption on crash.
4. **Input validation is thorough** — Injection checks run BEFORE credit deduction (line 173-178), preventing users from losing credits to blocked submissions. All text inputs have length caps. Review IDs are sanitized with alphanumeric-only regex.
5. **Timeout protection** — Both essay reviewer (90s) and David coach (30s) use AbortController with proper cleanup in `finally` blocks.
6. **David coach context sanitization is solid** — The toolContext sanitization (essay-coach.js lines 412-462) uses allowlists for field names, modules, and value types. String values are capped at 120-200 chars. No arbitrary client data reaches the system prompt.
7. **Parse recovery is well-designed** — The JSON parse fallback (essay-reviewer.js lines 564-589) extracts score/label/summary via regex from malformed JSON, returning a partial but usable review with a `_parseWarning` flag.

## Files Changed
- `backend/routes/essays.js` — essayType length validation on POST and GET /history
- `backend/services/essay-reviewer.js` — removed dead BASE_SYSTEM_PROMPT constant
- `backend/services/auth.js` — merged duplicate JSDoc comment on refundEssayCredit
