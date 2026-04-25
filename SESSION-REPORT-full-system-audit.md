# Full System Audit — Session Report
**Date:** 2026-04-25
**Focus Area:** API Surface — All route handlers, error responses, input validation, rate limiting consistency

## Run Summary
Deep audit of all 15 route files (5,773 lines total) and server.js route mounting. Reviewed: auth.js (372 lines), feedback.js (78 lines), invites.js (186 lines), demographics.js (278 lines), timeline.js (301 lines), intelligence.js (210 lines), internships.js (208 lines), scholarships.js (201 lines), programs.js (221 lines), financial-aid.js (786 lines), essay-coach.js (618 lines), essays.js (398 lines), chat.js (882 lines), admin.js (576 lines), stripe.js (458 lines). Found and fixed 4 issues, documented 6 informational findings.

## Key Findings

### API-01: LOW — Feedback messageIndex not validated
**File:** `backend/routes/feedback.js` — line 30
**Status:** FIXED

The `messageIndex` field from `req.body` was destructured and stored directly into the feedback JSONL file without any type or bounds validation. An attacker could submit an object, array, huge string, or negative number as `messageIndex`, which would be serialized to disk via `JSON.stringify`. While `saveFeedback` uses `appendFile` (not a write-replace), a large payload in `messageIndex` could bloat the JSONL file over time.

**Fix:** Added validation: `messageIndex` must be a non-negative integer ≤ 100,000 if provided. Non-conforming values are coerced to `null` before storage.

### API-02: LOW — Auth consent endpoint returns 400 for missing auth instead of 401
**File:** `backend/routes/auth.js` — line 185
**Status:** FIXED

`POST /api/auth/consent` passed a null token to `updateProfile()`, which returned `{error: 'Not authenticated'}`. The route then sent this with `res.status(400)` instead of `401`. Clients checking HTTP status codes for auth failures would not detect this correctly.

**Fix:** Added early `if (!token) return res.status(401)` guard before calling `updateProfile`.

### API-03: LOW — Auth delete endpoint returns 400 for missing auth instead of 401
**File:** `backend/routes/auth.js` — line 218
**Status:** FIXED

Same pattern as API-02. `DELETE /api/auth/account` would return 400 with "Not authenticated" error text when no token was provided.

**Fix:** Added early `if (!token) return res.status(401)` guard.

### API-04: LOW — Auth settings endpoint returns 400 for missing auth instead of 401
**File:** `backend/routes/auth.js` — line 230
**Status:** FIXED

Same pattern. `PUT /api/auth/settings` would return 400 for missing auth.

**Fix:** Added early `if (!token) return res.status(401)` guard.

### API-05: INFO — Admin secret comparison uses string !== (not timing-safe)
**File:** `backend/routes/auth.js` — lines 245, 285; `backend/routes/invites.js` — line 157
**Status:** NOT FIXED — informational

Three endpoints compare `ADMIN_SECRET` using JavaScript `!==` operator, which is theoretically vulnerable to timing attacks. In practice, the risk is minimal because: (a) authLimiter restricts to 10 attempts per 15 minutes, (b) network jitter overwhelms any timing signal, (c) the secret is only used for admin bootstrapping. A timing-safe comparison (`crypto.timingSafeEqual`) would be ideal but is low priority given the rate limiting.

### API-06: INFO — Feedback POST endpoint has no authentication
**File:** `backend/routes/feedback.js` — line 8
**Status:** NOT FIXED — informational (by design)

`POST /api/feedback` accepts feedback from any client without authentication. This is likely intentional to collect feedback from users who may not be logged in (e.g., during the signup flow or from free-tier users). The `apiLimiter` (30 req/min/IP) provides basic protection against spam. Input validation is otherwise solid: sessionId type+length, rating type+range, comment length cap.

### API-07: INFO — Stats endpoints on internships/scholarships/programs have no authentication
**File:** `backend/routes/internships.js` (stats), `backend/routes/scholarships.js` (stats), `backend/routes/programs.js` (stats)
**Status:** NOT FIXED — informational (by design)

These public endpoints return aggregate counts (by state, by field, by category). They expose no individual entries or user data. Useful for landing page content and SEO. Protected by `apiLimiter`.

### API-08: INFO — Rate limiter stacking: auth routes get both authLimiter and route-level limiters
**File:** `backend/server.js` — line 172; `backend/routes/auth.js` — lines 11-31
**Status:** NOT FIXED — informational

The `/api/auth` prefix gets `authLimiter` (10 req/15min) at the server level. Inside auth.js, login gets an additional `loginLimiter` (20 req/15min), and forgot-password/reset-password have their own limiters. The server-level limiter is the binding constraint — the route-level limiters are effectively redundant since 10 < 20. This is harmless (defense in depth) but worth noting.

### API-09: INFO — programs.js loads programs.json (826 entries), not programs-expanded.json (74 entries)
**File:** `backend/routes/programs.js` — line 28
**Status:** NOT FIXED — informational

Two programs JSON files exist. `programs.json` has 826 entries and is the one served by the API. `programs-expanded.json` has 74 entries in a different structure (middleSchool/highSchoolInternships/highSchoolPrograms sections). CLAUDE.md mentions some confusion about which is canonical. Currently `programs.json` is correctly served as the primary database. The expanded file appears to be supplementary.

### API-10: INFO — Demographics search has no result count cap on fuzzy matching
**File:** `backend/routes/demographics.js` — line 230
**Status:** NOT FIXED — informational

`GET /api/demographics/search?q=university` could match hundreds of schools, but the result is capped at `.slice(0, 10)` — this is correctly bounded. No issue.

## Positive Observations

1. **Consistent rate limiting architecture** — All routes have rate limiters applied at the server.js level. Expensive endpoints (essay review, financial-aid strategy) have a dedicated `expensiveLimiter` (3 req/min). Smart layering.
2. **Auth checks are consistently placed** — All data endpoints (internships, scholarships, programs, financial-aid, timeline, intelligence) require `verifyToken()` and use `canAccess()` for tier gating. No exposed data routes.
3. **Input validation is thorough across routes** — Query params, body fields, and URL params are validated. Invite codes are sanitized with regex. Search queries have minimum length. Profile fields have size caps.
4. **Preview/full access tier separation is clean** — All three data modules (internships, scholarships, programs) implement the same `previewX()` → strip sensitive data → `.slice(0, 3)` pattern for non-premium users. Consistent UX.
5. **Error responses never leak internals** — 500 handlers return generic messages. Stack traces are only shown in development mode.
6. **CORS is properly locked down** — Specific origin allowlist in production, no wildcard. Credentials enabled.
7. **Stripe webhook body parsing is correctly ordered** — Raw body middleware for webhook route is registered BEFORE `express.json()`, ensuring signature verification works.
8. **GitHub fallback for data files** — Demographics, internships, scholarships, programs all have GitHub raw content fallback when local files are missing (handles Render deploy edge cases).
9. **Graceful shutdown** — Server handles SIGTERM/SIGINT, stops scrapers and runs final backup before exit.
10. **Request body size limit** — Global 100KB cap via `express.json({ limit: '100kb' })` prevents large payload abuse.

## Data Integrity Check
- Internships: 1606 entries, 981 verified — metadata matches ✓
- Scholarships: 1043 entries, 80 verified — metadata matches ✓
- Programs: 826 entries — metadata matches ✓
- Frontend syntax: `node -c frontend/src/app.js` — PASS ✓

## Files Changed
- `backend/routes/feedback.js` — Added messageIndex type+bounds validation
- `backend/routes/auth.js` — Added 401 early-return guards on consent, delete, and settings endpoints
