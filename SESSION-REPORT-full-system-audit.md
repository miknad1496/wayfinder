# Full System Audit — Session Report
**Date:** 2026-04-24
**Focus Area:** Essay Review Pipeline — Claude integration, credit system, JSON parsing, error recovery, injection filtering, coach chat security

## Run Summary
Deep audit of the essay review pipeline: `backend/routes/essays.js` (395 lines), `backend/services/essay-reviewer.js` (545 lines), `backend/routes/essay-coach.js` (611 lines), credit operations in `backend/services/auth.js`, Stripe essay purchase flow in `backend/routes/stripe.js`, and frontend rendering in `frontend/src/app.js`. Found and fixed 3 issues, documented 5 informational findings.

## Key Findings

### ER-01: MODERATE — Essay review score not bounds-checked
**File:** `backend/routes/essays.js` — line 205, `backend/services/essay-reviewer.js` — line 503
**Status:** FIXED

The route validates that `overallScore` is a number but does not check the range. If Claude returns a score of 0, -1, 15, NaN, or Infinity, it passes validation and gets stored and rendered. In the frontend, `scorePercent = (overallScore / 10) * 100` would produce negative percentages or values over 100%, causing the score gauge to render incorrectly. The partial-parse recovery path (`parseInt(scoreMatch[1])`) also had no bounds clamping.

**Fix (essays.js):** Added bounds validation: `!Number.isFinite(overallScore) || overallScore < 1 || overallScore > 10` triggers the invalid-structure refund path.

**Fix (essay-reviewer.js):** Clamped recovered score: `Math.max(1, Math.min(10, parseInt(scoreMatch[1])))`.

### ER-02: MODERATE — addEssayCredits race condition with credit lock
**File:** `backend/services/auth.js` — line 1309
**Status:** FIXED

`addEssayCredits()` (called from the Stripe webhook when a user purchases an essay credit pack) performed a read-modify-write on the user's `essayReviewsRemaining` field WITHOUT using `withCreditLock`. Meanwhile, `useEssayCredit()` and `refundEssayCredit()` both use `withCreditLock` for their read-modify-write cycles. If a Stripe webhook fires at the same moment a user submits a review, both operations could read the same credit balance. The loser's write would overwrite the winner's, either losing the deduction (giving a free review) or losing the purchased credits.

**Fix:** Wrapped the credit addition in `withCreditLock(lockKey, ...)` and re-reads the file inside the lock to get the freshest value, matching the pattern used by `useEssayCredit` and `refundEssayCredit`.

### ER-03: MODERATE — David coach history messages bypass injection filter
**File:** `backend/routes/essay-coach.js` — line 561
**Status:** FIXED

The David coach chat endpoint checks the current `message` for prompt injection (line 405) but does not check `history` messages. The `history` array is client-supplied and sent directly to the Claude API. An attacker could craft a request with injection payloads in fabricated history entries to manipulate David's behavior while the current message appears benign.

**Fix:** Added `checkInjection()` screening for user-role history messages. Injected entries are silently skipped (not rejected — to avoid breaking the entire request over one stale history entry). Assistant-role messages are not checked since they represent our own previous output.

### ER-04: INFO — History/drafts endpoints scan all review files on every request
**File:** `backend/routes/essays.js` — lines 276-286, 328-337
**Status:** NOT FIXED — informational

Both `/api/essays/history` and `/api/essays/drafts/:essayType` read the entire reviews directory and parse every JSON file with `Promise.all`, then filter by userId. This is O(all_users_reviews) per request. Currently acceptable (0 reviews on disk), but will degrade as reviews accumulate. At 10K reviews with average 2KB each, each history request would read ~20MB from disk.

**Recommendation:** When review volume grows, either: (a) add a per-user index file mapping userId → reviewIds, or (b) use per-user subdirectories (`essay-reviews/{userId}/`), or (c) add a lightweight SQLite database.

### ER-05: INFO — Essay text not stored in review records
**File:** `backend/routes/essays.js` — lines 221-226
**Status:** NOT FIXED — informational (known gap per CLAUDE.md)

Review records store `wordCount` but not the actual essay text. Users cannot compare what they submitted across drafts. This is documented in CLAUDE.md as a known gap ("No multi-draft tracking").

### ER-06: INFO — Recovered partial reviews default voiceAssessment to authentic
**File:** `backend/services/essay-reviewer.js` — lines 519-520
**Status:** NOT FIXED — informational

When JSON parsing fails and the score is recovered via regex, the fallback `voiceAssessment` defaults to `{ authentic: true, sounds_like_teenager: true }`. This is misleading — these fields should be null or marked as unknown since the LLM's actual assessment was lost. However, since partial recovery is rare and the `_parseWarning` field flags the issue, this is low-priority.

### ER-07: INFO — Knowledge injection token counting is approximate
**File:** `backend/services/essay-reviewer.js` — lines 143, 173-175
**Status:** NOT FIXED — informational

Token estimation uses `chars / 4` which is a rough approximation. For the knowledge injection cap of 6000 tokens, actual token counts could vary by ±30%. The system prompt could end up at ~7800 actual tokens in the worst case. Since the essay reviewer uses `max_tokens: 3500` for the response and Opus has a 200K context window, this overshoot is inconsequential.

### ER-08: INFO — Stripe essay pack description says $20 for bulk but code says $18
**File:** `backend/routes/stripe.js` — line 194
**Status:** NOT FIXED — informational

The error message for invalid pack selection says "bulk (20/$20)" but the credits endpoint (essays.js line 128) advertises the bulk pack as "$18". The Stripe price ID controls the actual charge, so whatever's configured in Stripe is the real price. The error message text is just misleading.

## Positive Observations

1. **Credit locking is well-designed** — `withCreditLock` serializes per-user credit operations via a promise chain, preventing the classic double-deduction race condition on concurrent review submissions.
2. **Atomic writes throughout** — All file writes (reviews, user data) use the tmp+rename pattern to prevent corruption from crashes.
3. **Credit refund on every failure path** — The review endpoint refunds credits on: review failure, invalid JSON structure, and unexpected exceptions. The outer catch block even attempts a refund if the inner logic throws.
4. **Injection checks before credit deduction** — Smart ordering: injection check runs BEFORE `useEssayCredit`, so malicious input never costs the user a credit.
5. **Input validation is thorough** — Essay text (50 char min, 15K max), targetSchool (200 char cap), prompt (2K cap), essayType (64 char cap) all validated before processing.
6. **Review ID sanitization** — `sanitizeReviewId` prevents path traversal with strict alphanumeric+hyphen+underscore regex and 128 char cap.
7. **AbortController timeout** — The Claude API call has a 90-second timeout with proper cleanup (`clearTimeout` in `finally`), preventing indefinite hangs.
8. **JSON parse recovery** — Graceful degradation: if the LLM returns malformed JSON, the system attempts regex extraction of at least the score and summary, providing a partial but usable result rather than a hard failure.
9. **David coach context sanitization** — Extensive allowlisting of `toolContext` fields with length caps prevents client-side prompt injection via the session context object.
10. **Prompt database is server-side** — Common App, UC PIQ, Coalition, and supplement prompts are served from the backend, ensuring students get accurate, curated prompts.

## Files Changed
- `backend/routes/essays.js` — Added score bounds validation (1-10 range, finite number check)
- `backend/services/essay-reviewer.js` — Clamped recovered score to 1-10 range on partial parse
- `backend/services/auth.js` — Wrapped addEssayCredits in withCreditLock to prevent race condition with concurrent credit operations
- `backend/routes/essay-coach.js` — Added injection screening for client-supplied history messages
