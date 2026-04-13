# Full System Audit — Session Report
**Date:** 2026-04-13
**Focus Area:** Chat Pipeline (deep dive) — chat.js route, claude.js service, slm.js service, scope_classifier.js, input_filter.js, conversation-memory.js

## Run Summary
Performed a comprehensive audit of the entire chat pipeline: request validation → injection filter → scope classification → auth/rate-limiting → tier routing (Welcome Desk → SLM → Haiku Advisor → Claude) → generation → memory capture → response. Found and fixed five issues across session security, data integrity, and correctness. Three additional findings logged but not fixed (require larger changes or are documented trade-offs). Also resolved two open issues from prior audits.

## Key Findings

### CP-1: HIGH — Session Hijack via POST /api/chat (Missing Ownership Check)
**File:** `backend/routes/chat.js` — POST `/api/chat`, line ~392-407
**Status:** FIXED

The main chat endpoint accepted a `sessionId` from the request body and loaded the corresponding session, but **never verified the authenticated user owned that session**. If authenticated user A sent a message with user B's `sessionId`, the endpoint would:
1. Load user B's session (with their conversation history and context)
2. Overwrite `session.userId` with user A's ID (line 407)
3. Inject user A's profile into the context
4. Save the modified session — effectively stealing it from user B

This was inconsistent with the other session endpoints (`/context`, `/session/:id`, `/history/:sessionId`) which all properly check `session.userId !== auth.user.id`.

**Impact:** Session theft — an attacker who guesses or obtains a valid sessionId (UUIDs are not secret) could read another user's conversation history, inject messages into their session, and overwrite their profile context.

**Fix:** Added ownership check immediately after `loadSession()`: if `session.userId` exists and doesn't match the authenticated user, return 403 with telemetry logging. Anonymous sessions (no userId) remain adoptable by the first authenticated user, preserving the existing anonymous→authenticated upgrade flow.

### CP-2: MODERATE — Non-Atomic Write in flushAnonLimits
**File:** `backend/routes/chat.js` — `flushAnonLimits()`, line ~108-114
**Status:** FIXED

`flushAnonLimits()` used `fs.writeFile()` directly, which is non-atomic. If the process crashes mid-write or two concurrent requests both call `flushAnonLimits()` (it's fire-and-forget), the file can end up truncated or corrupted. On next server restart, `loadAnonLimits()` would fail to parse the corrupted JSON and reset all anonymous rate limits to zero — effectively giving every anonymous user a fresh 5-message quota.

The rest of the codebase uses atomic writes consistently: `saveSession()` in storage.js, `atomicWriteJSON()` in auth.js. This was the only non-atomic write path.

**Fix:** Changed to atomic write pattern: write to `ANON_LIMITS_PATH + '.tmp'` then `fs.rename()` to the final path.

### CP-3: LOW — SLM Keep-Alive Comment Says "10 minutes", Code Says 5
**File:** `backend/services/slm.js` — line 740
**Status:** FIXED

Comment on the keep-alive timer block said "hasn't been used in 10 minutes" but `MAX_IDLE = 300000` is 5 minutes (300 seconds). The code behavior (5 min) is correct for the 90s ping interval + 120s RunPod idle timeout. The comment was simply wrong.

**Fix:** Updated comment to say "5 minutes".

### CP-4: LOW — SessionId Format Not Validated Before Use
**File:** `backend/routes/chat.js` — sessionId validation, line ~190-193
**Status:** FIXED

The sessionId validation only checked `typeof === 'string'` and non-empty. While `storage.js:sanitizeSessionId()` applies a stricter regex (`/^[a-zA-Z0-9_-]+$/`) and length cap (128), the validation gap means malformed sessionIds travel deeper into the request pipeline (through rate limit checks, scope classification, telemetry) before being rejected at the storage layer. This wastes compute and makes the telemetry data dirtier.

**Fix:** Added early format validation matching storage.js's sanitizeSessionId rules: alphanumeric + hyphens + underscores, max 128 chars. Rejects invalid formats at the request boundary before any processing.

### CP-5: LOW — Conversation Memory userType Not Sanitized
**File:** `backend/services/conversation-memory.js` — lines ~127 and ~197
**Status:** FIXED

`captureConversationMemory()` and `captureTrainingPair()` wrote `sessionContext.userType` directly into JSONL files without sanitizing. While `JSON.stringify()` handles newlines safely (escapes them), the `userType` field comes from user-controlled profile data. A malicious user could set `userType` to a 10KB string or include control characters, bloating memory/training files and potentially confusing downstream processing.

**Fix:** Both functions now sanitize `userType`: strip control characters (`[\x00-\x1f\x7f]`), cap at 50 characters, and default to `'unknown'` for non-string values.

## Issues Found But NOT Fixed

### CP-6: MODERATE — Conversation Memory Shared Across Users (No userId Filter)
**File:** `backend/services/conversation-memory.js` — `getMemoryChunks()`, lines ~220-270
**Status:** NOT FIXED — documented design decision

`getMemoryChunks()` retrieves past conversation entries for RAG context injection without filtering by userId. This means user A's question about "best CS internships in Seattle" could surface as RAG context when user B asks a similar question. The code has a comment acknowledging this: "Memory is shared across users... safe for general domain knowledge."

**Privacy risk:** While `userName` is stripped at capture time, the query text itself may contain personally identifiable information (school names, specific circumstances). For a small-user-count product this is low risk, but if the user base grows, user-scoping the memory retrieval is recommended.

**Recommendation:** Add `userId` to memory entries and filter in `getMemoryChunks()`. This is a larger change that should be its own task.

### CP-7: INFO — Anonymous Rate Limit Bypass via IP Rotation
**File:** `backend/routes/chat.js` — `checkAnonDailyLimit()`, lines ~117-135
**Status:** NOT FIXED — inherent limitation

Anonymous users are rate-limited by IP address (5 messages/day). This is trivially bypassed by rotating IPs (VPN, Tor, mobile networks). The mitigation is that anonymous users also hit the per-IP burst rate limiter (5 req/min) and get no engine access, so the attack surface is limited to free Haiku/SLM calls.

No fix needed — this is a known trade-off between friction and abuse resistance. The real defense is requiring authentication for meaningful access.

### CP-8: INFO — Generation Timeout Doesn't Cancel the Underlying API Call
**File:** `backend/routes/chat.js` — lines ~569-585
**Status:** NOT FIXED — requires Anthropic SDK changes

The `Promise.race([generationPromise, timeoutPromise])` pattern returns a 504 to the user after 120s, but the underlying Claude/SLM API call continues running (and consuming tokens/credits). The `activeSessions` lock is properly released, but token usage for the orphaned call may still be recorded when it eventually completes.

For Claude API calls, the Anthropic SDK would need an `AbortController` signal (similar to what `essay-reviewer.js` already does with `controller.abort()`). For SLM calls, `slm.js` already uses `AbortSignal.timeout()`. This inconsistency should be addressed but requires careful testing.

## Resolved Open Issues from Prior Audits

### H-2: No max_tokens on Claude API calls — RESOLVED
All Claude API call sites now have explicit `max_tokens`: `chatHaikuIntake` (300), `chatHaikuAdvisor` (1024), `chat()` (dynamic by phase, 800-2000), `essay-reviewer.js` (3500), `essay-coach.js` (500), `financial-aid.js` (4000). This issue can be closed.

### H-14: JSONL Injection in Conversation Memory — DOWNGRADED to LOW
The original concern was that embedded newlines in `userType` could inject arbitrary JSON lines. Testing confirms `JSON.stringify()` properly escapes newlines to `\n`, so JSONL line injection is not possible via this vector. The remaining concern (training data semantic pollution) is addressed by CP-5's sanitization. Downgrade from HIGH to LOW.

## Positive Observations

- **Tier routing logic is well-designed:** The Welcome Desk → SLM → Haiku Advisor → Claude fallback chain is robust. Each tier has proper error handling with fallback to the next tier. The triple-fallback path (SLM error → Haiku error → Claude) at lines 525-535 prevents users from ever hitting a dead end.

- **Scope classifier is conservative and safe:** Stage 1 rules are well-curated with clear in-scope/out-of-scope domains. The `adjacent` default for ambiguous queries is the right call — better to inject a boundary instruction than to block a legitimate education question that touches an adjacent domain.

- **Input injection filter is solid:** 18 regex patterns covering extraction, override, role manipulation, and exfiltration. The two-layer approach (pattern + keyword density) catches both known attack patterns and novel phrasings.

- **Telemetry is comprehensive:** Every exit path in the chat handler logs a telemetry event with consistent structure (http_status, error, latency breakdown). The `tEvent` object tracks SS-01, SS-04, generation mode, RAG usage, and token counts.

- **Error sanitization is good:** The catch block at lines ~710-720 maps Anthropic API error codes to safe user messages and explicitly avoids leaking raw API JSON. The `safeMsg` filter catches both JSON and error_type patterns.

- **Session concurrency protection works:** The `activeSessions` Set prevents parallel generation on the same session. All exit paths (success, error, timeout) properly clean up the lock.

- **Output leakage filter (SS-03):** Every Claude response passes through `filterLeakage()` before reaching the user, preventing system prompt extraction via model output.

## Cumulative Open Issue Tracker Update

| ID | Severity | Summary | First Found | Status |
|----|----------|---------|-------------|--------|
| CP-6 | MODERATE | Conversation memory shared across users (no userId filter) | Apr 13 | NEW |
| CP-7 | INFO | Anonymous rate limit bypass via IP rotation | Apr 13 | NEW |
| CP-8 | INFO | Generation timeout doesn't cancel underlying API call | Apr 13 | NEW |
| CQ-4 | LOW | Duplicated essay review file-reading logic | Apr 12 | OPEN |
| CQ-5 | LOW | Empty catch blocks in data-loading functions | Apr 12 | OPEN |
| UX-4 | LOW | No focus trap in modals | Apr 11 | OPEN |
| UX-5 | LOW | Console warnings in production | Apr 7 | OPEN |
| P-3 | MEDIUM | Admin stats O(n) all-files read, no caching | Apr 10 | OPEN |
| H-10 | HIGH | 0/1035 scholarships have location.state | Apr 7 | OPEN |
| H-14 | LOW | JSONL injection in conversation memory (downgraded — JSON.stringify escapes newlines; CP-5 adds sanitization) | Apr 7 | DOWNGRADED |
| H-15 | HIGH | 34 verified internships have invalid _source | Apr 7 | OPEN |
| H-17 | HIGH | applicationFormat filter broken (6.6% populated) | Apr 7 | OPEN |
| H-1 | HIGH | Webhook idempotency in-memory only | Apr 7 | OPEN |
| H-2 | CLOSED | No max_tokens on Claude API calls — all call sites verified | Apr 7 | CLOSED |
| H-3 | CLOSED | Reset code brute-forceable via botnet — fixed in Apr 12 auth audit | Apr 7 | CLOSED |
| H-12 | HIGH | Email validation too permissive in invites | Apr 7 | OPEN |

### Recommendations for Next Audit
1. **Data Integrity** (overdue): Fix H-10 (scholarship states), H-15 (internship sources), H-17 (applicationFormat population)
2. **Infrastructure**: Address H-1 (webhook idempotency — consider file-based processed events), CP-8 (AbortController for Claude calls)
3. **Privacy**: Implement user-scoped conversation memory (CP-6) before user base grows
