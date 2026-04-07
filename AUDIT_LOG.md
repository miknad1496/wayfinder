# Wayfinder Nightly Audit Log

## 2026-04-04 — Security & Reliability

**Focus Areas**: Security (path traversal, auth gaps, input validation), Reliability (session ownership)

### Issues Found

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | **CRITICAL** | Path traversal in session storage — `saveSession` and `loadSession` used raw `sessionId` in file paths without sanitization. A crafted ID like `../../etc/passwd` could read/write arbitrary files on disk. | FIXED |
| 2 | **CRITICAL** | Path traversal in `readKnowledgeFile` — filename parameter passed directly to `join()` without verifying the resolved path stays within the knowledge base directory. | FIXED |
| 3 | **MODERATE** | `POST /api/chat/context` lacked authentication — anyone with a session ID could modify session context without being logged in. | FIXED |
| 4 | **MODERATE** | `GET /api/chat/session/:id` lacked owner verification — any authenticated user could read any session's metadata (unlike `/history/:sessionId` which already had this check). | FIXED |
| 5 | MINOR | `POST /api/feedback` does not require authentication — potential spam vector. | NOT FIXED — low risk, rate-limited at the middleware level |
| 6 | MINOR | `/api/scholarships/stats`, `/api/internships/stats`, `/api/programs/stats` are unauthenticated — leaks aggregate data counts. | NOT FIXED — data is non-sensitive (just counts), useful for public landing page |

### Fixes Applied

1. **`backend/services/storage.js`**: Added `sanitizeSessionId()` function that rejects any session ID not matching `/^[a-zA-Z0-9_-]+$/` and enforces max length of 128 chars. Both `saveSession` and `loadSession` now use this. Added `resolve()` path containment check as defense-in-depth. Added `resolve` import from `path`. Added path traversal protection to `readKnowledgeFile` as well.

2. **`backend/routes/chat.js`**: `POST /api/chat/context` now requires Bearer token authentication and verifies the authenticated user owns the session. `GET /api/chat/session/:id` now performs the same owner verification that `/history/:sessionId` already had.

### Positive Observations (Things Already Done Well)

- Helmet with comprehensive CSP, HSTS, and other security headers
- Rate limiting on all route groups including specialized limits for auth, admin, chat, and expensive endpoints
- CORS locked to specific origins (no wildcard)
- Stripe webhook signature verification enforced in production
- Input injection filter (SS-01) and scope classifier (SS-04) on all chat inputs
- bcrypt password hashing with cost factor 12
- Login attempt lockout after 5 failures
- JSON body size limited to 100KB
- Error messages sanitized before sending to frontend
- Admin routes protected by token + isAdmin middleware
- Atomic writes for user files with JSON repair on startup
- HTTPS enforcement in production

### Recommendations for Future Audits

- **Performance**: Audit the admin `/stats` endpoint which reads ALL user and session files on every call — consider caching or incremental computation
- **Data Integrity**: Verify JSON schema consistency across scraped data files
- **UX/Frontend**: Check for XSS vectors in rendered scholarship/program names (user-supplied data displayed in cards)
- **Code Quality**: The `auth.js` service is ~850+ lines — consider splitting into separate modules (user CRUD, token management, plan/access control)
- **DevOps**: Consider adding structured logging (JSON format) for better monitoring in production

---

## 2026-04-04 (Night) — Security Audit: Password Handling & Input Validation

**Focus Areas**: Password reset security, input validation consistency, information disclosure

### Issues Found

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | **MODERATE** | Password reset code generated with `Math.random()` instead of CSPRNG — predictable codes could allow attackers to guess reset tokens | FIXED |
| 2 | **MODERATE** | Password reset enforced only `length >= 6` while signup requires 8+ chars with number and letter — users could weaken passwords via reset flow | FIXED |
| 3 | **MINOR** | Signup route checked `password.length < 6` but service validates 8+ — misleading error message for 6-7 char passwords | FIXED |
| 4 | **MINOR** | Health check endpoint (`/api/health`) exposed `model` field revealing exact Claude model in use — unnecessary reconnaissance data for attackers | FIXED |
| 5 | **MINOR** | Feedback endpoint accepted arbitrary-length `sessionId` and `comment` fields without explicit size validation | FIXED |

### Fixes Applied

1. **`backend/services/auth.js` — `requestPasswordReset()`**: Replaced `Math.floor(100000 + Math.random() * 900000)` with `100000 + (randomBytes(4).readUInt32BE(0) % 900000)` using Node's `crypto.randomBytes()` which is backed by the OS CSPRNG.

2. **`backend/services/auth.js` — `resetPassword()`**: Replaced weak `password.length < 6` check with call to `validatePasswordStrength()` which enforces 8+ chars, at least one number, and at least one letter — same rules as signup.

3. **`backend/routes/auth.js` — signup route**: Updated route-level password length check from `< 6` to `< 8` for consistency with the service-level validation.

4. **`backend/server.js` — health check**: Removed `model` field from `/api/health` response. Health checks should return status and version only.

5. **`backend/routes/feedback.js`**: Added explicit validation: `sessionId` must be a string of max 128 chars, `comment` max 2000 chars, and `userMessage`/`assistantResponse` are explicitly coerced to strings before truncation.

### Not Fixed (Documented Only)

- **Feedback endpoint unauthenticated**: Product decision — anonymous feedback may be intentional. Rate limiter provides adequate protection.
- **verifyToken/logoutUser O(n) file scan**: Performance concern noted in prior audit. Not a security vulnerability but worth addressing for scalability.

### Recommendations for Next Audit

- **Performance**: Focus on the O(n) user file scanning in `verifyToken()` and `logoutUser()`. Consider an in-memory token→userId index rebuilt on startup.
- **Reliability**: Audit file I/O race conditions — what happens if two concurrent requests write to the same user file despite atomic writes?
- **UX/Frontend**: Review for XSS in rendered card content, accessibility compliance, mobile responsiveness.
- **Data Integrity**: Validate scraped JSON schema consistency and check for orphaned session files.

---

## 2026-04-05 — Security & Reliability (Continued)

**Focus Areas**: Path traversal in essay routes, access control on feedback stats, atomic session writes

### Issues Found

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | **MODERATE** | Path traversal in `GET /api/essays/review/:id` — `req.params.id` used directly in file path with no sanitization. Attacker could read arbitrary JSON files via `../../data/users/admin`. | FIXED |
| 2 | **MODERATE** | `GET /api/feedback/stats` publicly accessible — returned `recentComments` array with user messages and feedback text without authentication. | FIXED |
| 3 | **MINOR** | Session writes (`saveSession`) not atomic — `fs.writeFile` without temp-file-then-rename pattern risks corruption on process crash. Auth service already used atomic writes. | FIXED |
| 4 | **INFO** | Essay credit not refunded on review failure (`essays.js` ~line 108) — code says "credit was not deducted" but credit IS deducted before review runs. TODO comment exists. | NOT FIXED — needs `refundEssayCredit()` function |
| 5 | **INFO** | Anonymous sessions accessible without auth via `GET /api/chat/session/:id` — acceptable risk since session IDs are UUIDs (unguessable). | NOT FIXED — by design |

### Fixes Applied

1. **`backend/routes/essays.js`**: Added `sanitizeReviewId()` function matching the established pattern from `sanitizeSessionId()` in storage.js — rejects IDs not matching `/^[a-zA-Z0-9_-]+$/`, max 128 chars. Applied to `GET /api/essays/review/:id`.

2. **`backend/routes/feedback.js`**: Added admin-only authentication to `GET /api/feedback/stats`. Imported `verifyToken` from auth service. Non-admin requests now receive 403.

3. **`backend/services/storage.js`**: Changed `saveSession()` to use atomic write pattern (write to `.tmp` file, then `fs.rename`). Prevents partial writes on crash — same pattern already used by `atomicWriteJSON()` in auth.js.

### Observations on Previous Audit Coverage

The April 4 audits already covered the most critical security issues (session path traversal, knowledge file path traversal, context auth, password handling). Tonight's audit found the remaining path traversal gap in essays and tightened two additional access control points.

### Recommendations for Next Audit

- **Performance**: Review the n-gram output filter (SS-03) scalability with large system prompts. Also audit admin `/stats` endpoint memory usage with many users.
- **UX/Frontend**: Test mobile responsiveness and accessibility of filter dropdowns. Check for XSS in rendered card content.
- **Data Integrity**: Validate JSON schema consistency across scraped data files. Check for orphaned `.tmp` files from atomic writes.
- **Code Quality**: Consider splitting `auth.js` (~850+ lines) into modules. Implement `refundEssayCredit()` for the essay review failure path.

---

## 2026-04-07 — Full System Audit (Automated)

**Focus Areas**: All — Security, Backend Routes, Frontend, Data Integrity, Performance, Infrastructure

**Audit Type**: Comprehensive parallel audit with 4 independent agents covering backend routes/services, frontend JS/HTML, data integrity, and security/infrastructure.

### Summary Statistics

| Severity | Count |
|----------|-------|
| CRITICAL | 5 |
| HIGH | 12 |
| MEDIUM | 16 |
| LOW | 9 |
| **Total** | **42** |

### Previous Audit Issue Status

| Previous Issue | Status |
|----------------|--------|
| Path traversal in session storage (Apr 4) | STILL FIXED |
| Path traversal in readKnowledgeFile (Apr 4) | STILL FIXED |
| POST /api/chat/context auth (Apr 4) | STILL FIXED |
| GET /api/chat/session/:id owner verification (Apr 4) | STILL FIXED |
| Password reset CSPRNG (Apr 4) | STILL FIXED |
| Password reset strength validation (Apr 4) | STILL FIXED |
| Path traversal in essays review (Apr 5) | STILL FIXED |
| Feedback stats auth (Apr 5) | STILL FIXED |
| Atomic session writes (Apr 5) | STILL FIXED |
| Feedback endpoint unauthenticated (Apr 4) | STILL OPEN — by design, rate-limited |
| Stats endpoints unauthenticated (Apr 4) | STILL OPEN — by design, non-sensitive |
| Essay credit refund on failure (Apr 5) | STILL OPEN — needs refundEssayCredit() |
| O(n) user file scan in verifyToken (Apr 4) | STILL OPEN — token index exists but not used everywhere |

---

### CRITICAL Issues

#### C-1: Open Redirect via Host Header Injection in Stripe Checkout
- **File**: `backend/routes/stripe.js`, lines 156-157
- **Description**: `success_url` and `cancel_url` constructed from `req.protocol` and `req.get('host')` without validation. Attacker can inject arbitrary hosts via Host header, redirecting users to phishing sites after Stripe checkout.
- **Impact**: Credential theft via post-payment redirect to malicious domain
- **Fix**: Use explicit allowed domain from environment variable instead of trusting Host header

#### C-2: Webhook Signature Verification Bypassed in Non-Production
- **File**: `backend/routes/stripe.js`, lines 265-274
- **Description**: If `NODE_ENV !== 'production'`, webhook signature is not verified. If deployment misconfigures NODE_ENV, anyone can forge Stripe webhooks and add arbitrary essay credits.
- **Impact**: Free essay credits, revenue loss, privilege escalation
- **Fix**: Hard-fail at startup if STRIPE_WEBHOOK_SECRET is missing in production. Never silently accept unverified webhooks.

#### C-3: Race Condition Allows Negative Essay Credit Balance
- **File**: `backend/services/auth.js` (useEssayCredit)
- **Description**: No atomic read-modify-write for credit deduction. Concurrent requests can deduct credits below zero, allowing free essay reviews.
- **Impact**: Users exploit race condition to get free reviews
- **Fix**: Implement file-level locking or atomic credit operations

#### C-4: O(n) User File Scan in Stripe Webhook Handler
- **File**: `backend/services/auth.js`, lines 1282-1305
- **Description**: `addEssayCredits()` scans ALL user files to find user by Stripe Customer ID. At scale, this blocks webhook processing and risks Stripe webhook timeouts.
- **Impact**: Failed credit delivery, revenue-critical webhook timeouts
- **Fix**: Build Stripe Customer ID → User ID index at startup

#### C-5: Scholarship Metadata Counts Severely Out of Sync
- **File**: `backend/data/scraped/scholarships.json`, `internships.json`, `programs-expanded.json`
- **Description**: All three modules have stale metadata counts diverging from actual entry counts (e.g., internships metadata says 1,549 but only 683 entries exist). Verified counts also wrong.
- **Impact**: Data integrity — reporting, UI counts, and admin dashboards show wrong numbers
- **Fix**: Re-run inject scripts or update metadata counts to match actual data

---

### HIGH Issues

#### H-1: Stripe Webhook Idempotency Uses Ephemeral In-Memory Set
- **File**: `backend/routes/stripe.js`, lines 40-52
- **Description**: `processedEvents` Set is in-memory only. Server restart or exceeding 10K events causes duplicate webhook processing.
- **Fix**: Persist processed event IDs to disk/Redis

#### H-2: No Cost Controls on Claude API Calls
- **File**: `backend/services/claude.js`
- **Description**: No `max_tokens` set on Claude Opus calls. Essay reviews with 15K char input could cost $1+ each with no per-user budget cap.
- **Fix**: Set explicit max_tokens; implement per-user cost tracking

#### H-3: 6-Digit Password Reset Code Brute-Forceable via Botnet
- **File**: `backend/services/auth.js`, line 593
- **Description**: Rate limiting is per-IP, not per-user+code. A botnet can distribute attempts across IPs. No per-user reset attempt lockout.
- **Fix**: Add per-user failed reset attempt counter with lockout

#### H-4: Admin Stats Endpoint Scans All User/Session/Feedback Files
- **File**: `backend/routes/admin.js`, lines 175-410
- **Description**: GET /api/admin/stats reads ALL user files, session files, invite files, and feedback files on every call. Unusable at scale.
- **Fix**: Cache stats with 5-minute TTL; pre-compute aggregates

#### H-5: Token Lookups Bypass Existing Index (O(n) Scans)
- **File**: `backend/services/auth.js` — updateUserPlan, setUserPlan, etc.
- **Description**: Some functions scan all user files comparing tokens directly instead of using resolveUserByToken() index.
- **Fix**: Refactor all token lookups to use the index

#### H-6: Missing Input Validation on Financial Aid Endpoints
- **File**: `backend/routes/financial-aid.js`, lines 557-564
- **Description**: `targetSchools` not validated as array before filtering. `additionalContext` type not validated.
- **Fix**: Add explicit type checking: `if (!Array.isArray(targetSchools)) return 400`

#### H-7: Missing Response Status Checks in ~35 Frontend Fetch Calls
- **File**: `frontend/src/app.js` — multiple locations
- **Description**: Many fetch calls don't check `response.ok` before parsing JSON. Server errors result in silent failures.
- **Fix**: Add `if (!res.ok) throw new Error()` before `.json()` on all fetch calls

#### H-8: Frontend Auth Functions Missing Error Handling
- **File**: `frontend/src/app.js`, lines 1310-1477
- **Description**: Login, signup, forgot-password, reset-password functions don't check res.ok.
- **Fix**: Add response validation before parsing

#### H-9: Listener Accumulation in Essay Prompts
- **File**: `frontend/src/app.js`, lines 3163-3195
- **Description**: `loadEssayPrompts()` adds new event listeners on each call without removing old ones.
- **Fix**: Use event delegation or removeEventListener before adding

#### H-10: Scholarships Have No State Data Despite State Filter
- **File**: `backend/data/scraped/scholarships.json`
- **Description**: 0 of 1,035 scholarships have `location.state` populated, but the UI shows a state filter dropdown.
- **Fix**: Either populate state data or hide the state filter for scholarships

#### H-11: Programs Invalid State Codes
- **File**: `backend/data/scraped/programs-expanded.json`
- **Description**: 12 entries have invalid state values like "NY/IN", "CA/MA", "International", "Various" that won't match filter logic.
- **Fix**: Normalize multi-state entries or add "Multiple" as valid filter option

#### H-12: Email Validation Too Permissive in Invites
- **File**: `backend/routes/invites.js`, line 34
- **Description**: Email validated only with `email.includes('@')`. Allows malformed addresses.
- **Fix**: Use proper email regex or validation library

---

### MEDIUM Issues

#### M-1: Essay Review Null Reference Risk
- **File**: `backend/routes/essays.js`, lines 184-192
- **Description**: `result.review.overallScore` accessed without checking `result.review` exists first.

#### M-2: Race Condition in Essay Credit Refund Flow
- **File**: `backend/routes/essays.js`, lines 160-181
- **Description**: Credit deducted before Claude API call; refunded on failure. Gap allows temporary negative balance visibility.

#### M-3: School Alias Lookup Case-Sensitive
- **File**: `backend/routes/financial-aid.js`, lines 35-129
- **Description**: School alias expansion uses exact case matching. "UW" vs "uw" may not match.

#### M-4: RunPod Endpoint ID Hardcoded in render.yaml
- **File**: `render.yaml`, line 22
- **Description**: External service endpoint committed to repo. Should be env var.

#### M-5: Auto-Deploy from GitHub Without PR Approval Required
- **File**: `render.yaml`
- **Description**: Any push to main auto-deploys. No branch protection mentioned.

#### M-6: Admin Dashboard Served with unsafe-inline CSP
- **File**: `backend/server.js`, lines 206-211
- **Description**: Admin HTML served directly; CSP allows unsafe-inline scripts.

#### M-7: Input Filter/Scope Classifier Not Adversarially Tested
- **File**: `backend/routes/chat.js`, lines 138-164
- **Description**: If regex-based, can be bypassed with Unicode escaping or obfuscation.

#### M-8: Error Messages Leak Paths in Dev Mode
- **File**: `backend/server.js`, line 232
- **Description**: In dev mode, full error.message sent to client including file paths.

#### M-9: VIP Email List Mutable at Runtime but Not Persisted
- **File**: `backend/services/auth.js`, lines 193-207

#### M-10: Stripe Price ID Format Not Validated at Startup
- **File**: `backend/routes/stripe.js`, lines 119-122

#### M-11: Webhook Metadata Plan Not Whitelisted Before Use
- **File**: `backend/routes/stripe.js`, lines 333-337

#### M-12: XSS Risk in Inline onclick Handlers
- **File**: `frontend/src/app.js`, line 2462

#### M-13: Document-Level Event Listener Accumulation in Essay Resizer
- **File**: `frontend/src/app.js`, lines 2452-2456, 3057-3071

#### M-14: Accessibility Gaps — Missing ARIA Roles on Modals/Dropdowns
- **File**: `frontend/index.html` — all modals and interactive elements

#### M-15: Hardcoded Verification Dates in Inject Scripts
- **File**: `backend/scrapers/inject-verified-*.js`
- **Description**: All scripts hardcode `_verifiedDate: "2026-04-04"` instead of using current date.

#### M-16: Essay Data Files Curated but Not Referenced
- **File**: `backend/data/scraped/essay-*.json` (3 files, 117 entries total)
- **Description**: Essay data exists but isn't loaded by essay-reviewer.js.

---

### LOW Issues

#### L-1: Information Disclosure — Result Count Leaks Database Size
- **File**: `backend/routes/scholarships.js` line 141, `programs.js` line 135

#### L-2: Console Warnings Left in Production Frontend
- **File**: `frontend/src/app.js` — 8+ locations

#### L-3: Z-Index Management Inconsistent (10 to 10000)
- **File**: `frontend/src/styles/main.css`

#### L-4: CORS Allows Requests with No Origin Header
- **File**: `backend/server.js`, lines 133-143

#### L-5: Rate Limiters Don't Persist Across Server Restarts
- **File**: `backend/routes/chat.js`, lines 43-80

#### L-6: uuid Package Could Use Node.js Built-in randomUUID()
- **File**: `package.json`

#### L-7: xlsx Package Has Known Prototype Pollution Vulnerability
- **File**: `package.json` — GHSA-4r6h-8v6p-xvw6

#### L-8: Missing Error Feedback When School Picker API Fails
- **File**: `frontend/src/app.js`, lines 2405-2413

#### L-9: Database Stats File 2+ Days Stale
- **File**: `backend/data/scraped/db-stats.json`

---

### Fixes Applied This Audit

#### Fix 1: C-1 — Open Redirect via Host Header (stripe.js)
- **Changed**: All three `baseUrl` constructions (create-checkout, purchase-essays, portal) now require `process.env.APP_URL` and reject requests if not set. Removed `req.protocol + req.get('host')` fallback entirely.
- **Before**: `const baseUrl = process.env.APP_URL || \`${req.protocol}://${req.get('host')}\``
- **After**: `const baseUrl = process.env.APP_URL; if (!baseUrl) return 500`

#### Fix 2: C-2 — Webhook Signature Bypass in Dev (stripe.js)
- **Changed**: Removed the `NODE_ENV !== 'production'` bypass that allowed unverified webhooks in development. All webhooks now require `STRIPE_WEBHOOK_SECRET` regardless of environment. Dev/test should use Stripe CLI for signed webhook forwarding.
- **Before**: Non-production environments skipped signature verification
- **After**: All environments reject webhooks without valid signature

#### Fix 3: C-3 — Essay Credit Race Condition (auth.js)
- **Changed**: Added `withCreditLock()` — a per-user in-memory promise-based lock that serializes credit operations. Both `useEssayCredit()` and `refundEssayCredit()` now re-read the user file inside the lock to get the freshest balance, preventing concurrent requests from reading stale values.
- **Before**: Read balance → check → deduct (no concurrency protection)
- **After**: Lock(userId) → read fresh balance → check → deduct → unlock

#### Not Fixed (Documented Only)
- **C-4**: O(n) scan in Stripe webhook handler — requires architectural change (customer ID index). Documented for manual implementation.
- **C-5**: Metadata count mismatches — data issue requiring re-running inject scripts. Not a security vulnerability.

---

## 2026-04-07 (Night) — Performance & Code Quality

**Focus Areas**: Token lookup O(n) elimination, auth.js hot-path optimization, essay review reliability

### Issues Found

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | **HIGH** | `verifyToken()` scans ALL user files (O(n)) on every authenticated API request — called 5-6 times per chat message via useEngine, checkTokenUsage, recordTokenUsage, checkMessageUsage, recordMessageUsage | FIXED (prior commit) |
| 2 | **HIGH** | 24 separate O(n) `readdir(USERS_DIR)` scans in auth.js — each authenticated request triggers multiple full directory scans | FIXED — reduced to 16 (8 hot-path functions refactored) |
| 3 | **MODERATE** | Essay credit race condition — concurrent review requests could double-deduct credits (C-3 from earlier audit) | FIXED — per-user promise lock added |
| 4 | **MINOR** | Essay review writes not atomic — `fs.writeFile` without temp-file-then-rename pattern | FIXED |
| 5 | **INFO** | Admin `/stats` endpoint reads ALL user, session, invite, and feedback files on every call | NOT FIXED — low frequency (admin only), documented for future caching |
| 6 | **INFO** | `addEssayCredits()` uses O(n) scan by Stripe Customer ID — no index for this lookup pattern | NOT FIXED — requires separate index (customer ID → user file) |
| 7 | **INFO** | Remaining 16 O(n) scans are in low-frequency paths (profile update, session link, settings, etc.) | NOT FIXED — acceptable at current scale |

### Fixes Applied

1. **Token Index (`backend/services/auth.js`)**: Added in-memory `Map<token, filename>` index built at startup via `buildTokenIndex()`. All hot-path functions (`verifyToken`, `logoutUser`, `findUserByToken`, `useEngine`, `checkTokenUsage`, `recordTokenUsage`, `checkMessageUsage`, `recordMessageUsage`, `useEssayCredit`, `refundEssayCredit`) now use `resolveUserByToken()` for O(1) lookup with graceful fallback to full scan on miss.

2. **Startup integration (`backend/server.js`)**: `buildTokenIndex()` called after `repairCorruptedUserFiles()` during server startup. Index maintained by `createUser()` and `loginUser()` on token creation, and `logoutUser()` on token invalidation.

3. **Credit lock (`backend/services/auth.js`)**: Added `withCreditLock()` — per-user promise-based lock that serializes `useEssayCredit` and `refundEssayCredit`. Re-reads user file inside lock for fresh balance.

4. **Atomic essay writes (`backend/routes/essays.js`)**: Essay review records now written via temp-file-then-rename pattern, consistent with session and auth storage.

### Performance Impact

- **Before**: Every authenticated API call = O(n) directory read + up to n file reads. A chat message triggers 5-6 such scans = 5n-6n file reads.
- **After**: Warm lookups = O(1) single file read. Cold/miss = one-time O(n) that populates the index for future calls. A chat message now does ~5-6 file reads instead of ~500-600 (for 100 users).

### Recommendations for Next Audit

- **UX/Frontend**: Focus on the 35+ missing `res.ok` checks (H-7), listener accumulation (H-9), and accessibility (M-14)
- **Data Integrity**: Fix metadata count mismatches (C-5), populate scholarship state data (H-10), normalize multi-state entries (H-11)
- **Code Quality**: Split auth.js (~1400+ lines) into separate modules (user CRUD, token management, plan/access control, credit management)

---

## 2026-04-07 (Late Night) — Full System Audit #3 (Automated)

**Focus Areas**: All — Security, Backend Routes, Frontend, Data Integrity, Performance, Infrastructure

**Audit Type**: Comprehensive parallel audit with 4 independent agents covering backend routes/services, frontend JS/HTML, data integrity, and security/infrastructure.

### Summary Statistics (NEW issues only — excludes previously documented)

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 5 |
| MEDIUM | 8 |
| LOW | 4 |
| **Total NEW** | **18** |

### Previous Audit Issue Status

| Previous Issue | Current Status |
|----------------|--------|
| C-1: Open redirect in Stripe (Apr 7 AM) | STILL FIXED — APP_URL validation in place |
| C-2: Webhook signature bypass (Apr 7 AM) | STILL FIXED — All envs require signature |
| C-3: Essay credit race condition (Apr 7 AM) | STILL FIXED — withCreditLock() active |
| C-4: O(n) Stripe webhook scan (Apr 7 AM) | STILL OPEN — needs customer ID index |
| C-5: Metadata count mismatches (Apr 7 AM) | STILL OPEN — see H-16 below for updated numbers |
| H-1 through H-12 (Apr 7 AM) | ALL STILL OPEN — no fixes applied between audits |
| Token index optimization (Apr 7 PM) | STILL FIXED — hot-path O(1) lookups working |
| Credit lock (Apr 7 PM) | STILL FIXED — withCreditLock() serializing ops |
| Atomic essay writes (Apr 7 PM) | STILL FIXED |
| Path traversal fixes (Apr 4-5) | ALL STILL FIXED |
| Password reset CSPRNG (Apr 4) | STILL FIXED |

---

### NEW CRITICAL Issue

#### C-6: Demographics `/health` Endpoint Leaks Internal Server Paths
- **File**: `backend/routes/demographics.js`, lines 133-162
- **Description**: `GET /api/demographics/health` is unauthenticated and returns `__dirname` (full filesystem path), `cwd` (process working directory), and all candidate file paths with existence status. Returns JSON like: `{ "__dirname": "/opt/render/project/src/backend/routes", "cwd": "/opt/render/project/src", "paths": [{ "path": "...", "exists": true }] }`
- **Impact**: Reconnaissance — attacker learns exact deployment paths, OS structure, and file layout. Combined with any other vulnerability, this makes exploitation significantly easier.
- **Fix**: Remove `__dirname` and `cwd` from response. Return only `{ dataLoaded, schoolCount, source }`. Or restrict to admin-only.
- **Status**: FIXED this audit

---

### NEW HIGH Issues

#### H-13: External GitHub Fetch Calls Have No Timeout
- **File**: `backend/routes/demographics.js:61`, `backend/routes/financial-aid.js:159`, `backend/routes/timeline.js:45`
- **Description**: Three routes use `fetch()` to pull data from GitHub raw URLs as fallback when local files are missing (e.g., on fresh Render deploys). None set an AbortController timeout. If GitHub is slow or down, the request hangs indefinitely, tying up an Express worker thread.
- **Impact**: Server thread exhaustion under GitHub downtime. Multiple concurrent users hitting demographics/financial-aid/timeline could deadlock the entire server.
- **Fix**: Add `AbortController` with 5-second timeout on all external fetch calls.

#### H-14: Conversation Memory JSONL Injection Risk
- **File**: `backend/services/conversation-memory.js`, lines ~130-145
- **Description**: `userName` and `userType` are written into JSONL training files without sanitizing newlines or special characters. A malicious `userName` containing `\n{"role":"system",...}` could inject arbitrary JSON lines into the training data, poisoning future SLM fine-tuning.
- **Impact**: Training data poisoning — injected entries could influence future model behavior.
- **Fix**: Strip newlines and validate field types before writing to JSONL.

#### H-15: 34 Verified Internships Have Invalid `_source` URLs
- **File**: `backend/data/scraped/internships.json`
- **Description**: 34 of 58 verified internships have `_source` values that are bare domains (e.g., `"seattlechildrens.org"`) instead of full URLs with protocol. These entries DO have valid `url` fields with full https:// URLs, but `_source` should be the verification source per CLAUDE.md rules.
- **Impact**: Data quality — violates "every verified entry MUST have a real `_source` URL" rule.
- **Fix**: Update `_source` to copy from the `url` field for these 34 entries.

#### H-16: Metadata Count Mismatches Persist (Updated Measurements)
- **File**: `backend/data/scraped/scholarships.json`, `internships.json`
- **Description**: Current actual vs declared counts:
  - Scholarships: **1,035 actual** vs **1,013 declared** (+22 drift)
  - Internships: **683 actual** vs **1,549 declared** (-866 drift!)
  - Programs (programs.json): **815 actual** vs **815 declared** (synced correctly)
- **Impact**: Admin dashboards, landing page stats, and metadata-based reporting show wrong numbers. The internships gap (1,549 vs 683) suggests a major data restructuring that metadata wasn't updated for.
- **Fix**: Update metadata counts to match actual array lengths.

#### H-17: `applicationFormat` Filter Broken — Only 6.6% of Scholarships Populated
- **File**: `backend/data/scraped/scholarships.json`
- **Description**: Only 68 of 1,035 scholarships have `applicationFormat` populated (all 68 are verified entries). The UI shows an applicationFormat filter dropdown, but it matches almost nothing for the 967 template entries.
- **Impact**: Users filtering by application format see nearly empty results.
- **Fix**: Either populate `applicationFormat` for template entries or conditionally hide the filter.

---

### NEW MEDIUM Issues

#### M-17: Chat Route Concurrent Request Lock Not Atomic
- **File**: `backend/routes/chat.js`, lines ~307-318
- **Description**: The concurrent request guard uses a check-then-add pattern on a Set. Under heavy load, two requests could both pass the `has()` check before either calls `add()`.
- **Fix**: Use a promise-based lock pattern (like `withCreditLock()`).

#### M-18: Missing Bounds Check on Admin Query Limits
- **File**: `backend/routes/admin.js`, line ~102
- **Description**: `?limit=999999` not capped, could cause memory exhaustion when scanning user files.
- **Fix**: Cap limit to 100.

#### M-19: 4 Programs Have Multi-State Codes Breaking Filter
- **File**: `backend/data/scraped/programs.json`
- **Description**: 4 entries with values like "NY/IN", "CA/NY", "CA/MA", "NY/MA" that won't match single-state filter. Down from 12 in previous audit (8 were fixed).
- **Fix**: Split into separate location entries or normalize to primary state.

#### M-20: Missing ARIA Labels on Interactive SVG Buttons
- **File**: `frontend/index.html` — sidebar buttons, modal controls
- **Description**: Multiple SVG icons used as buttons lack `aria-label`. Screen readers cannot identify them.

#### M-21: Missing Keyboard Escape Handler for Modals
- **File**: `frontend/src/app.js`
- **Description**: No consistent Escape key handler to close modals. Some close on backdrop click but not Escape.

#### M-22: School Picker Dropdown Overflow on Mobile
- **File**: `frontend/src/styles/main.css`, line ~3501
- **Description**: `.school-picker-dropdown` uses `position: absolute` without mobile constraints.

#### M-23: Missing Startup Validation for Critical Env Vars
- **File**: `backend/server.js`
- **Description**: Server starts even if `APP_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` are missing. Payment endpoints then fail with confusing 500s.
- **Fix**: Add startup validation in production.

#### M-24: Demographics `/schools` List Fully Open (By Design)
- **File**: `backend/routes/demographics.js`, lines 166-189
- **Description**: Returns full school list without auth. Code comments say "no auth required." Allows full school database scraping but is a documented product decision.
- **Note**: Documented, not a vulnerability — just tracked for completeness.

---

### NEW LOW Issues

#### L-10: VIP Email Addresses Hardcoded as Fallback
- **File**: `backend/services/auth.js`, line 135
- **Description**: Family emails appear as fallback when `VIP_EMAILS` env var is unset. Best practice: use empty fallback.

#### L-11: Essay History Card Uses Inline onclick
- **File**: `frontend/src/app.js`, line ~3530
- **Description**: `onclick="viewEssayReviewFull('${review.id}')"` — should use event delegation for CSP compliance.

#### L-12: Z-Index Scale Undefined
- **File**: `frontend/src/styles/main.css`
- **Description**: Values range from 10 to 10000 with no defined layering system.

#### L-13: programs-expanded.json Separate Structure Not Used by API
- **File**: `backend/data/scraped/programs-expanded.json`
- **Description**: Uses `{ middleSchool, highSchoolInternships, highSchoolPrograms }` structure while the API loads `programs.json` with `{ programs: [...] }`. The expanded file is an alternate data source not currently referenced.

---

### Fix Applied This Audit

#### Fix 1: C-6 — Demographics Health Path Leakage
- **Changed**: `GET /api/demographics/health` stripped of `__dirname`, `cwd`, and internal file paths. Now returns only operational status: `{ dataLoaded, schoolCount, source }`.

---

### Cumulative Open Issue Tracker (All Audits)

| ID | Severity | Summary | First Found | Status |
|----|----------|---------|-------------|--------|
| C-4 | CRITICAL | O(n) Stripe webhook user scan | Apr 7 AM | OPEN |
| C-5/H-16 | HIGH | Metadata count mismatches (scholarships +22, internships -866) | Apr 7 AM | OPEN |
| H-1 | HIGH | Webhook idempotency in-memory only | Apr 7 AM | OPEN |
| H-2 | HIGH | No max_tokens on Claude API calls | Apr 7 AM | OPEN |
| H-3 | HIGH | Reset code brute-forceable via botnet | Apr 7 AM | OPEN |
| H-4 | HIGH | Admin stats endpoint O(n) scan | Apr 7 AM | OPEN |
| H-5 | HIGH | Token lookups bypass index in some functions | Apr 7 AM | OPEN |
| H-6 | HIGH | Missing input validation on financial-aid | Apr 7 AM | OPEN |
| H-7 | HIGH | 35+ frontend fetch calls missing response.ok | Apr 7 AM | OPEN |
| H-8 | HIGH | Frontend auth functions missing error handling | Apr 7 AM | OPEN |
| H-9 | HIGH | Listener accumulation in essay prompts | Apr 7 AM | OPEN |
| H-10 | HIGH | 0/1035 scholarships have location.state | Apr 7 AM | OPEN |
| H-11 | HIGH | 4 programs have invalid multi-state codes | Apr 7 AM | OPEN (was 12, now 4) |
| H-12 | HIGH | Email validation too permissive in invites | Apr 7 AM | OPEN |
| H-13 | HIGH | External fetch calls have no timeout | Apr 7 PM | NEW |
| H-14 | HIGH | JSONL injection in conversation memory | Apr 7 PM | NEW |
| H-15 | HIGH | 34 verified internships have invalid _source | Apr 7 PM | NEW |
| H-17 | HIGH | applicationFormat filter broken (6.6% populated) | Apr 7 PM | NEW |
| — | MEDIUM | Essay credit refund TODO | Apr 5 | OPEN |
| — | MEDIUM | 16 medium issues from AM audit + 8 new | Various | OPEN |

### Recommendations for Next Audit

1. **Priority fixes**: H-7 (35+ missing response.ok checks) and H-13 (fetch timeouts) are the most impactful reliability improvements
2. **Data sprint needed**: H-10 (scholarship states), H-15 (internship sources), H-16 (metadata counts), H-17 (applicationFormat) are all data quality issues that should be addressed in one batch
3. **Architecture**: C-4 (customer ID index) and H-1 (persistent webhook idempotency) require small but important architectural changes
4. **Frontend cleanup**: H-7, H-8, H-9, M-20, M-21 can be batched into a single frontend reliability pass
