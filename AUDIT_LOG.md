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
