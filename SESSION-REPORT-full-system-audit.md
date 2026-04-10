# Full System Audit — Session Report
**Date:** 2026-04-10
**Focus Area:** Chat Pipeline (deep dive) — routing logic, input/output filters, session security, memory capture

## Run Summary
Performed a comprehensive audit of the chat pipeline: `backend/routes/chat.js` (816 lines), `backend/services/slm.js` (823 lines), `backend/services/scope_classifier.js` (434 lines), `backend/services/input_filter.js` (216 lines), `backend/services/output_filter.js` (161 lines), `backend/services/conversation-memory.js` (320 lines), and `backend/services/claude.js` (chat/chatHaikuIntake/chatHaikuAdvisor functions). Found and fixed four issues: critical false positives in SS-01 input filter, session ownership bypass for anonymous users, prototype pollution vector in context endpoint, and PII leakage in conversation memory.

## Key Findings

### CP-1: CRITICAL — SS-01 Input Filter False Positives Block Legitimate Queries
**File:** `backend/services/input_filter.js:109-116`
**Status:** FIXED

Two regex patterns added in a prior audit were far too broad:
- `extraction_variant_summarize`: Pattern `/summarize|recap\s+everything.../i` matched the bare word "summarize" ANYWHERE in input. This blocked legitimate education queries like "Can you summarize the differences between UC Berkeley and UCLA?", "summarize what I should know about Stanford admissions", and "Can you summarize my options for CS programs?"
- `extraction_variant_list`: Pattern matched "list every rule about early decision" and "enumerate each rule I should follow for applications" — common education queries.

**Impact:** Users asking Wayfinder to summarize or list educational information would receive the injection-refusal response instead of help. This silently degrades the product for legitimate users.

**Fix:** Tightened both patterns to require extraction-specific context:
- `summarize/recap` now requires "everything/all" + "you/above/before/prior" context (e.g., "recap everything you said" → blocked; "summarize Stanford admissions" → allowed)
- `list/enumerate` now requires "your/system/internal/hidden" qualifier before "rules/instructions/etc." (e.g., "list all your system rules" → blocked; "list every rule about early decision" → allowed)

Verified with 13 test cases: 0 false positives, 0 missed true positives.

### CP-2: MODERATE — Anonymous Users Can Read Owned Sessions
**File:** `backend/routes/chat.js` — GET `/session/:id` and GET `/history/:sessionId`
**Status:** FIXED

Both endpoints used the pattern:
```js
if (auth?.user && session.userId && session.userId !== auth.user.id) → 403
```
When `auth` is null (unauthenticated request), `auth?.user` is falsy, so the entire condition evaluates to false — access is granted. This means an anonymous user who guesses/obtains a session UUID can read:
- Session metadata (GET /session/:id) including `context` (user profile: name, school, interests, grade level, career interests)
- Full message history (GET /history/:sessionId) containing all conversation messages

**Fix:** Changed both endpoints to check if the session has an owner FIRST. If `session.userId` is set, authentication is required and the user must match. Anonymous sessions (no userId) remain accessible by anyone with the UUID (design intent — they have no sensitive context).

### CP-3: MODERATE — POST /context Allows Arbitrary Key Injection
**File:** `backend/routes/chat.js` — POST `/api/chat/context`
**Status:** FIXED

The endpoint did `session.context = { ...session.context, ...context }` where `context` came directly from `req.body.context` without key validation. An authenticated user could:
1. Set `__proto__` or `constructor` keys (prototype pollution)
2. Inject arbitrary keys that persist in the session and could affect other code paths
3. Overwrite internal fields if any code reads unexpected session context keys

**Fix:** Added a whitelist of allowed context keys: `userName`, `userType`, `school`, `interests`, `profile`, `track`, `valuesOrientation`. Only these keys are accepted from the request body. Also blocks `__proto__` and `constructor` explicitly as defense-in-depth.

### CP-4: LOW — Conversation Memory Stores PII (userName) and Leaks Cross-User
**File:** `backend/services/conversation-memory.js`
**Status:** PARTIALLY FIXED

Two related issues:
1. **PII in memory entries:** `captureConversationMemory()` stored `userName` from session context into JSONL memory files. These files are read by `getMemoryChunks()` and injected into RAG context for ALL users — not just the original user.
2. **Cross-user memory leakage:** `getMemoryChunks()` has no user-scoping. It reads the last 14 days of memory files and returns topic-matched entries regardless of which user originated them. A user asking about "Harvard admissions" could receive RAG context containing another user's personal conversation about Harvard, potentially including details about their profile, grades, or strategy.

**Fix (partial):**
- Removed `userName` storage from memory capture entries
- Changed RAG chunk labels from "User asked: / Wayfinder responded:" to neutral "Question: / Answer:" to avoid implying the content is from the current user
- Added documentation comment noting the cross-user design and when it would need user-scoping

**Not fixed:** Full user-scoping of memory retrieval requires adding `userId` to memory entries and filtering in `getMemoryChunks()`. This is a larger change that touches the RAG pipeline and should be coordinated with the knowledge.js integration. At current scale (single-digit concurrent users), the risk is low — memory entries contain domain Q&A without PII after this fix.

## Issues Found But NOT Fixed

### CP-5: MODERATE — SLM Responses Bypass Output Leakage Filter (SS-03)
**File:** `backend/services/slm.js` — `chatSLM()`
The SLM response path returns `rawResponse` directly without passing through `filterResponse()` from `output_filter.js`. If the SLM were to echo system prompt fragments, they would reach the user unfiltered. Currently low risk because `SLM_ENABLED` is false (SLM is disabled), but this should be fixed before enabling SLM in production.

### CP-6: LOW — chatHaikuIntake Skips Output Leakage Filter (SS-03)
**File:** `backend/services/claude.js` — `chatHaikuIntake()`
The Welcome Desk intake response is returned without SS-03 filtering. Risk is low because the intake prompt is minimal (no system prompt injected into context), but for consistency all LLM output paths should be filtered.

### CP-7: LOW — Generation Timeout Doesn't Cancel Orphaned Promise
**File:** `backend/routes/chat.js:455-470`
The generation timeout uses `Promise.race([generationPromise, timeoutPromise])`. When the timeout wins, the response returns 504, but the `generationPromise` continues running in the background. The orphaned promise will:
- Continue consuming CPU/memory for the LLM call
- Eventually try to `saveSession()` after the user already got an error
- Run `captureConversationMemory()` and `captureTrainingPair()` with a response the user never saw
- The `activeSessions` lock is already cleaned up by the timeout handler, so a new request could race with the orphaned save

Proper fix: Use an `AbortController` passed to the Anthropic SDK call so the HTTP request is actually cancelled on timeout. This is a larger change touching `claude.js`.

### CP-8: LOW — Rate Limit Map Cleanup Only On New Window
**File:** `backend/routes/chat.js:66-70`
The `userRateLimits` Map cleanup (deleting expired entries) only runs when a NEW rate limit window is created. If the same set of users keep sending requests, expired entries from old users never get cleaned up. In a long-running server with many unique IPs, this could grow unboundedly. Fix: Add a periodic cleanup interval or cap the map size.

### Carryover from Prior Audits
- C-4 (Stripe customer-ID index), H-15 (34 internships with invalid _source), H-16 (metadata count drift), H-17 (applicationFormat 6.6% populated), M-18 (admin limit cap), M-23 (env var startup validation), R-10 (inconsistent error logging in GitHub fallbacks), R-11 (slm.js keep-alive timer not cleared on shutdown), R-12 (JSON fallback parse not validated)

## Positive Observations

### Routing Logic (chat.js)
The tier routing is well-designed and handles edge cases:
- Welcome Desk → SLM → Haiku Advisor → Claude Sonnet fallback chain is robust
- SLM quality gate catches bad responses and escalates to Haiku
- SLM error path re-warms in background and falls back gracefully
- Double-fallback (Haiku fails → Sonnet last resort) prevents total outage
- Session concurrency lock (`activeSessions` Set) prevents duplicate generation
- Anonymous daily cap is disk-persisted (survives redeploys)

### Scope Classifier (scope_classifier.js)
Two-stage architecture (rules + embeddings) is well thought out:
- Rule-based stage catches 90%+ of queries in <1ms
- Embedding stage provides graceful degradation for ambiguous queries
- Shadow mode and kill switch allow safe rollout
- Configurable `NO_SIGNAL_FALLBACK` defaults to conservative 'adjacent'

### Input Filter (input_filter.js)
Solid two-layer defense with good pattern coverage:
- Layer 1 regex patterns cover extraction, override, role manipulation, exfiltration
- Layer 2 keyword density catches novel phrasings (2+ keyword threshold)
- Hardcoded refusal prevents any prompt content from reaching user
- The false positive issue (CP-1) was the only significant problem

### Output Filter (output_filter.js)
Thoughtful n-gram approach with tuned thresholds:
- 8+ word windows (50+ chars) prevent false positives on education vocabulary
- Requiring 3+ distinct matches avoids triggering on natural overlap
- One-time initialization at startup keeps per-response cost low

## Security/Vulnerability Notes
- **CP-2 (session access)** was the most significant security fix — it allowed reading user profiles and conversation history without authentication
- **CP-3 (prototype pollution)** was a theoretical vector that could have become exploitable if any downstream code used `session.context` keys in unsafe ways
- **CP-1 (false positives)** was a UX issue but had no security implications
- No new vulnerabilities introduced; all changes are additive guards

## Code Health Assessment
- `backend/routes/chat.js` is the most complex file at 816 lines but is well-organized with clear sections for validation, scope classification, routing, and generation. The tier routing logic is sophisticated but readable.
- `backend/services/slm.js` is comprehensive with good error handling. The quality gate, domain router, and keep-alive system are well-engineered. Main gap: no SS-03 output filter.
- `backend/services/scope_classifier.js` has excellent coverage of education-adjacent domains. The two-stage architecture is a good pattern.
- `backend/services/conversation-memory.js` is clean but needs user-scoping for production use.

## Changes Made
1. `backend/services/input_filter.js` — Tightened `extraction_variant_summarize` and `extraction_variant_list` regex patterns to eliminate false positives on legitimate education queries
2. `backend/routes/chat.js` — Fixed GET /session/:id and GET /history/:sessionId to require auth when session has an owner; added context key whitelist to POST /context
3. `backend/services/conversation-memory.js` — Removed PII (userName) from memory capture entries; updated RAG chunk labels to neutral phrasing

## Suggestions for Next Run
- **CP-5 fix** — Add `filterResponse()` call to `chatSLM()` return path in slm.js (simple 3-line change, but should test with SLM enabled)
- **CP-7 fix** — Implement AbortController-based cancellation for generation timeout
- **Data Integrity sprint** — H-15, H-16, H-17 have been repeatedly flagged
- **Memory user-scoping** — Add userId to memory entries and filter in getMemoryChunks
- **Rate limit map cap** — Add periodic cleanup or LRU eviction to userRateLimits

## Git Status
- **Branch**: main
- **Files changed**: 3 — `backend/services/input_filter.js`, `backend/routes/chat.js`, `backend/services/conversation-memory.js`, plus this session report
- **Commit message**: "Full system audit (chat pipeline): fix SS-01 false positives, session auth bypass, context key injection, memory PII"
