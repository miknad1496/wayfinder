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
