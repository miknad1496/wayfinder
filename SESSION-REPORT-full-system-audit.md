# Full System Audit — Session Report
**Date:** 2026-04-23
**Focus Area:** Chat Pipeline — routing logic, SLM/Haiku/Engine tiers, scope classifier, memory capture, rate limiting, timeout handling

## Run Summary
Deep audit of the entire chat pipeline: `backend/routes/chat.js` (866 lines), `backend/services/claude.js` (765 lines), `backend/services/slm.js` (824 lines), `backend/services/scope_classifier.js` (434 lines), `backend/services/conversation-memory.js` (331 lines), `backend/services/input_filter.js`, `backend/services/output_filter.js`, and `backend/services/storage.js`. Found and fixed 3 issues, documented 5 informational findings.

## Key Findings

### CP-1: MODERATE — Generation timeout timer never cleared on success
**File:** `backend/routes/chat.js` — lines 594-599
**Status:** FIXED

The `Promise.race()` pattern used for generation timeout creates a `setTimeout` that is never cleared when generation succeeds. On every successful chat request, a dangling 120-second timer remains on the Node.js event loop. When it fires, it rejects a promise with no `.catch()` handler, risking an unhandled rejection event. Under sustained traffic (e.g., 100 requests/minute), hundreds of orphaned timers accumulate on the event loop.

**Fix:** Captured the timer handle and wrapped the `Promise.race()` in a `try/finally` that calls `clearTimeout(timeoutHandle)`. The timer is now always cleaned up regardless of outcome.

### CP-2: MODERATE — Anonymous rate limit IP map grows unboundedly
**File:** `backend/routes/chat.js` — lines 118-138
**Status:** FIXED

The `anonLimits.ips` object accumulates one entry per unique IP address per day with no upper bound. An IP-rotating attack could inject millions of entries into this object, consuming hundreds of MB of memory and causing increasingly slow disk flushes (the entire object is serialized to JSON on every anonymous request). The object is flushed to disk via `flushAnonLimits()` on every write, so a large object also increases I/O latency.

**Fix:** Added a `MAX_TRACKED_IPS = 50000` cap. When the cap is reached, new (unseen) IPs are rejected with the daily limit exhausted response. Existing tracked IPs continue to work normally. This bounds memory at ~5MB worst case while accommodating normal traffic patterns (Wayfinder is unlikely to see 50K unique anonymous IPs in a day).

### CP-3: MODERATE — Profile array fields silently dropped on update
**File:** `backend/services/auth.js` — lines 767-776
**Status:** FIXED

The profile update handler only accepts `string | number | boolean` values for profile sub-fields. Array fields like `favoriteClasses` and `careerInterests` — which the frontend sends as arrays (app.js lines 886-887) — are silently dropped on every profile save. These fields can only be set on initial user creation (auth.js lines 449-450) but never updated through the PUT `/api/auth/profile` endpoint. Users editing their favorite classes or career interests see no error but their changes are lost.

**Fix:** Added an `Array.isArray()` branch gated to known array fields (`favoriteClasses`, `careerInterests`) via a `PROFILE_ARRAY_FIELDS` allowlist. Array elements are sanitized: filtered to strings only, capped at 20 elements, each element capped at 100 chars. This matches the sanitization pattern used for `interests` on line 766.

### CP-4: INFO — Profile fields injected unsanitized into Haiku intake prompt
**File:** `backend/services/claude.js` — line 440
**Status:** NOT FIXED — informational

In `chatHaikuIntake()`, the user's profile is serialized via `JSON.stringify(sessionContext.profile)` and concatenated directly into the system prompt. While individual profile string values are capped at 500 chars at the auth layer (auth.js line 773), the aggregate serialized profile can be several KB and could contain text that looks like prompt injection (e.g., `aboutMe: "ignore all previous instructions..."`).

The risk is mitigated by: (a) profile values are set by authenticated users modifying their own data, (b) the Haiku intake prompt is narrowly scoped with firm character limits, (c) the intake response is lightweight (60-100 words, max_tokens: 300). The attack surface is limited to self-sabotage (a user injecting their own profile to manipulate their own responses).

**Recommendation:** For defense-in-depth, consider using `buildProfileString()` instead of `JSON.stringify()` for the intake prompt, which formats values as labeled lines rather than raw JSON.

### CP-5: INFO — `buildProfileString` doesn't strip control characters
**File:** `backend/services/claude.js` — lines 204-240
**Status:** NOT FIXED — informational

Profile values like `userName`, `school`, `aboutMe`, and `targetSchools` are interpolated into system prompts without stripping control characters (null bytes, newlines, backspaces). The auth layer caps lengths but doesn't filter control chars for these fields (unlike `conversation-memory.js` line 154 which does `.replace(/[\x00-\x1f\x7f]/g, '')`). Control characters in profile values could disrupt prompt formatting.

**Recommendation:** Add control-character stripping in `buildProfileString()` using the same pattern as conversation-memory.js.

### CP-6: INFO — Scope classifier allows multiple domains but only reports the first
**File:** `backend/services/scope_classifier.js` — line 185
**Status:** NOT FIXED — informational

When multiple soft out-of-scope domains are hit, `primaryDomain` is set to `[...domainHits][0]` — the first element of the Set. Set iteration order in JavaScript follows insertion order, which is the order patterns are defined in `SCOPE_RULES.out_of_scope_soft`. A query matching both `medical` and `legal` domains would always report `medical` because it's listed first, regardless of which domain is more relevant. This affects the refusal message wording (e.g., "consult a healthcare provider" vs "consult an attorney").

This is cosmetic — the scope label (`out_of_scope` / `adjacent`) is correct regardless of which domain is reported. The refusal message is slightly misleading if the secondary domain was the user's actual intent.

### CP-7: INFO — SLM keep-alive comment says "10min idle cutoff" but code uses 5 minutes
**File:** `backend/services/slm.js` — lines 665, 648
**Status:** NOT FIXED — informational (documentation mismatch)

The `startKeepAlive` function's log message says "10min idle cutoff" but `MAX_IDLE` is set to `300000` (5 minutes). The comment on line 648 also correctly says "5 minutes with no real traffic." Only the log message is wrong.

### CP-8: INFO — Conversation memory shared across users without isolation
**File:** `backend/services/conversation-memory.js` — lines 241-249 (comment on line 246)
**Status:** NOT FIXED — informational, already documented in code

The existing code comment on line 246 correctly notes that memory chunks are shared across all users with no userId filter. The code strips `userName` at capture time (good), but `sessionContext.userType` and query content remain, meaning User A's question about "my daughter's application to Stanford" could surface as RAG context for User B. The `response` field is capped at 2000 chars (line 146) which limits data exposure.

The existing code comment recommends user-scoping if the product evolves to store personal strategy data. Currently acceptable for general domain knowledge retrieval.

## Positive Observations

1. **Session concurrency lock is well-implemented** — `activeSessions` Set prevents parallel generation on the same session, cleaned up in all code paths (success, timeout, error, and the outer catch).
2. **Tier routing is sophisticated and well-documented** — The Welcome Desk → SLM Advisor → Haiku Advisor → Claude Sonnet fallback chain handles every failure mode gracefully with automatic escalation.
3. **Scope classifier two-stage design is sound** — Rule-based fast path handles 90%+ of queries in <1ms; embedding fallback for ambiguous cases. Conservative defaults (adjacent) prevent false out-of-scope blocks.
4. **Input injection filter is comprehensive** — Layer 1 (patterns) + Layer 2 (keyword density) covers known attack classes. Hardcoded refusal prevents any injection from reaching the LLM.
5. **Output leakage filter tuning is good** — MIN_NGRAM_CHARS=50, MIN_WINDOW_SIZE=8, MIN_MATCHES_TO_TRIGGER=3 prevents false positives on education vocabulary while catching real prompt extraction.
6. **Error messages are consistently sanitized** — API key details, raw Claude error JSON, and internal paths are never leaked to the frontend.
7. **Conversation memory capture is well-designed** — Substantive exchange threshold (20 char query, 200 char response), scope filtering, PII stripping, fire-and-forget pattern, and JSONL format for easy fine-tuning data extraction.
8. **Token estimation with context overflow protection** — claude.js estimates token counts and trims history when approaching the 200K limit, preventing API 400 errors from oversized requests.

## Files Changed
- `backend/routes/chat.js` — Fixed timer leak in generation timeout race; added IP cap on anonymous rate limits
- `backend/services/auth.js` — Fixed profile array field handling for favoriteClasses and careerInterests
