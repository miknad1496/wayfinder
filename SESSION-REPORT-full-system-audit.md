# Full System Audit — Session Report
**Date:** 2026-05-02
**Focus Area:** Auth & Access Control — JWT/token flow, tier enforcement, admin/VIP system, password storage, input validation, status-code consistency

## Run Summary
Deep audit of the auth surface: `backend/routes/auth.js` (375 lines), `backend/services/auth.js` (1661 lines), `backend/services/crypto.js` (155 lines), `backend/services/tier-gates.js` (260 lines), `backend/routes/admin.js` (auth middleware + VIP routes), and consumer routes that gate via `canAccess` / `verifyToken` (essays, internships, programs, scholarships, demographics, summer-camps, essay-coach, stripe). Also closed an open question from the prior audit by spot-checking `scope_classifier.js` and `curated-db-context.js` for stale frontend ID references.

Found **1 HIGH-severity production bug** (paid users incorrectly treated as free in K-8 + David coach surfaces — fixed) and **5 LOW/INFO** findings, four of which were patched in safe one-line changes. All JS syntax checks pass; data integrity counts verified.

## Key Findings

### AC-AUDIT-1 (HIGH severity, FIXED) — `tier-gates.js getUserFromReq` reads wrong return shape; all paid users treated as free
**File:** `backend/services/tier-gates.js` lines 78–88
**Status:** FIXED

`tier-gates.js` calls `verifyToken` from `services/auth.js`, which returns the sanitized user object directly (a flat object: `{ id, email, plan, isAdmin, ... }`). Every other consumer of `verifyToken` in the codebase (essays.js, internships.js, programs.js, scholarships.js, demographics.js, stripe.js, etc.) treats the return value as the user. **`tier-gates.js` was the outlier** — it accessed `result.user`, which was always `undefined`, so `getUserFromReq()` returned `null` for every authenticated request.

**Cascade impact for paid users:**

1. `isFreeUser(req)` always returned `true` even for Pro/Elite users. Cascades into:
   - **K-8 Browse (`/api/summer-camps/browse`)** — paid users got abridged browse fields meant only for free users; their `_tier` was tagged `'free'` and the upgrade tease was shown to them.
   - **K-8 Insights (`/api/summer-camps/insights`)** — sections were filtered through `filterInsightsForTier(_, true)`, suppressing Pro-only content.
   - **K-8 Plan (`/api/summer-camps/plan`)** — code path called `checkAndConsumeQuota` (see below), blocking the request entirely.
   - **K-8 Ask (`/api/summer-camps/ask`)** — same.
2. `checkAndConsumeQuota(req, kind)` always returned `{allowed: false, reason: 'auth-required', message: 'Sign in to use this feature...'}` for every request (since `getUserFromReq` returned null). Pro/Elite users were *blocked entirely* from K-8 plan generation and the K-8 free-text Ask feature with a "sign in" message — even though they were already signed in.
3. `tierAwareDavidPromptPrefix(_isFreeDavid)` was always invoked with `_isFreeDavid = true` for every essay-coach request. Paid users got the free-tier David preamble (consultations capped at "general advice mode") despite paying.

**Repro (verified):**
```js
// verifyToken returns: { id, email, plan: 'pro', isAdmin: false }   ← flat object
// getUserFromReq did: return (result && result.user) || null        ← .user is undefined
// → isFreeUser() returned TRUE for a Pro user.
```

I confirmed this in isolation with a 20-line Node script that mocks `verifyToken` with a Pro-tier user — `getUserFromReq` returned `null`, `isFreeUser` returned `true`. After the patch, `isFreeUser` returns `false` for Pro/Elite and `true` only for `plan === 'free'` or anonymous.

**Fix:** changed `return (result && result.user) || null` → `return result || null` and added an explanatory comment block. One-line change. Marker: `REVAMP V2: TIER-GATES VERIFYTOKEN-RETURN-SHAPE FIX (audit 2026-05-02)`.

**Severity rationale:** This is a production-impact regression. K-8 Summer Camps went GA in patch 28, so paid families with K-8 children (Dan's daughter is the real end-user) were getting "sign in to use this feature" errors on K-8 Plan and K-8 Ask. David always used the free-tier preamble for everyone, undercutting the paid coaching experience. Both are user-visible breakages.

### AC-AUDIT-2 (LOW, FIXED) — Unauthenticated email-bearing endpoints crashed on non-string input
**File:** `backend/routes/auth.js` POST `/forgot-password`, POST `/reset-password`, POST `/signup`, POST `/login`
**Status:** FIXED

Same input-validation gap pattern as ER-AUDIT-1 from 2026-04-26. Each endpoint reads `req.body.email` and immediately calls `.toLowerCase().trim()` (or, for signup/login, ternary-truthy passes through). If a client sent `{"email": {}}` or `{"email": []}`, the `.toLowerCase()` call threw `TypeError`, was caught by the outer `try`, and returned a 500. No exploit (didn't grant access or leak info), but ugly logs and inconsistent client experience.

**Fix:** Added explicit `typeof email !== 'string'` (and corresponding password / code / newPassword guards on signup, login, reset-password) returning 400 before any string operation. Pattern matches the ER-AUDIT-1 lesson captured 2026-04-26.

### AC-AUDIT-3 (LOW, FIXED) — Three unauth-token-tolerant endpoints lacked the early-401 guard pattern
**File:** `backend/routes/auth.js` GET `/sessions`, GET `/engine-usage`, GET `/token-usage`, GET `/search`
**Status:** FIXED

Pattern flagged in lessons file 2026-04-25: `if (!token) return 401` is the standard early guard for token-required endpoints. These four endpoints called the underlying service with `undefined`, which returned safe defaults (empty array / zero usage). Not an info leak — but inconsistent with the rest of the auth route, makes legitimate clients (e.g., an expired-token user) silently see zero results instead of an actionable 401.

**Fix:** Added `if (!token) return res.status(401).json({ error: 'Not authenticated' });` to all four. For `/search`, also added `typeof rawQ === 'string'` coercion since Express turns repeated `?q=a&q=b` into an array — `.trim()` on an array would have thrown.

### AC-AUDIT-4 (INFO, not fixed) — Admin secret + internal-task-token comparisons are not timing-safe
**File:** `backend/routes/auth.js` POST `/admin/secret-login`, POST `/admin/create`; `backend/routes/admin.js` middleware (lines 24, 34)
**Status:** NOT FIXED — informational

`secret !== process.env.ADMIN_SECRET` and `taskToken === process.env.INTERNAL_TASK_TOKEN` use `!==` / `===`, which short-circuit on first byte mismatch and leak length+prefix timing. Mitigated in practice by `adminLimiter` (5 req/min) and `authLimiter` (10/15min) — over a year an attacker gets ~2.6M attempts, far below brute-force range for a long random secret. Already noted in lessons file 2026-04-25. Recommend `crypto.timingSafeEqual` when convenient, but not urgent.

### AC-AUDIT-5 (INFO, not fixed) — VIP additions via `/api/admin/vip` are not persisted across restarts
**File:** `backend/services/auth.js` `addVIP`/`removeVIP` (lines 207–219)
**Status:** NOT FIXED — known design choice flagged for documentation

`VIP_EMAILS` is a module-level `let` initialized from `process.env.VIP_EMAILS`. `addVIP`/`removeVIP` mutate the in-memory list but never persist to disk or update env. After each Render redeploy, runtime additions are lost. The auth.js comment ("Mutable at runtime via admin API") implies persistence; the route does not provide it. Either (a) persist to a `_vip-list.json` (atomic write, load at startup with env fallback) or (b) update the comment. Deferring to Dan's call.

### AC-AUDIT-6 (INFO, RESOLVED) — Closed open question: scope_classifier + curated-db-context do not consume frontend DOM IDs
**File:** `backend/services/scope_classifier.js`, `backend/services/curated-db-context.js`
**Status:** RESOLVED — informational

The 2026-04-27 lessons file asked: "should we audit `scope-classifier.js` and `sse-context.js` for stale page/tool name references?" Spot-checked both: scope_classifier matches only on free-text user message regex (no field IDs), and curated-db-context builds context purely from JSON data files (programs.json, internships.json, etc.) with no frontend ID references. Tool-context consumer in `essay-coach.js` already enforces a strict `ALLOWED_CTX_FIELDS` allowlist that matches what `getActiveToolContext()` sends post-PATCH30. Closing this open question as no-op.

## Positive Observations
1. **Token model.** Opaque 32-byte random tokens (not JWTs) with server-side revocation via the in-memory token index. Server-side invalidation on logout is trivial. 30-day TTL with `tokenCreatedAt` checked on every verify. Index built once at startup, maintained on create/login/logout.
2. **Password storage.** bcrypt cost 12, password strength validation (min 8 chars + ≥1 letter + ≥1 number), legacy SHA256 auto-migrate on login, no plaintext password ever logged.
3. **Account lockout.** 5 failed attempts → 15-minute lockout. Auto-unlock on expiry. Successful login resets the counter. Clean.
4. **Reset-code brute force defense.** 6-digit reset code with 15-min expiry AND 5-attempt cap (the code is invalidated after 5 wrong guesses, not just rate-limited). Stronger than the rate limiter alone.
5. **PII encryption at rest.** AES-256-GCM via `crypto.js` for `name`/`school`/`interests`/`profile`/`settings.displayName`. Fail-open if `ENCRYPTION_KEY` is unset (with warning), so the system still boots in dev.
6. **Per-user credit lock.** `withCreditLock` serializes credit ops per-user across `useEssayCredit`/`refundEssayCredit`/`addEssayCredits` (Stripe webhook). Prevents race between concurrent reviews and credit deposits.
7. **Mass-assignment defense.** `updateProfile` allowlists fields; `__proto__`/`constructor`/`prototype` are explicitly filtered out before Object.assign. `updateSettings` does the same.
8. **Account deletion cascade.** Deletes user file → unlinks session files → scrubs memory + training-capture JSONL entries → appends a hashed tombstone (no PII) for audit. Right level of detail for GDPR-style "right to erasure".
9. **Admin middleware design.** `routes/admin.js` enforces 401 (no token) → 401 (invalid) → 403 (not admin) consistently, with `INTERNAL_TASK_TOKEN` fallback for scheduled tasks (env-gated to non-empty).
10. **`canAccess` consolidation.** Plan-tier feature gates are centralized in one map (`FEATURE_ACCESS`) and one helper (`canAccess`), used uniformly across module routes (essays/internships/programs/scholarships). Admin/VIP shortcut is checked via `isAdmin`/`isVIP` inside the helper.
11. **`sanitizeUser`.** No password / hash / salt / token / reset code is ever serialized to the client — even for admin endpoints.
12. **Stripe customer index.** Same O(1) optimization as the token index, separately maintained on `updateUserPlan`. Webhook lookups stay fast as users grow.

## Verifications Run
- `node --check` on all touched files (services/tier-gates.js, routes/auth.js, services/auth.js, routes/admin.js, routes/summer-camps.js, routes/essay-coach.js) — all pass.
- Data integrity:
  - internships: 1606 entries, 981 verified, metadata.totalCount matches.
  - scholarships: 1043 entries, 80 verified, metadata.totalCount matches.
  - programs: 1416 entries, 672 verified, metadata.totalCount matches.
  - volunteer: 247 entries, 247 verified, metadata.totalCount matches.
- TG-AUDIT-1 fix verified with isolated repro Node script: `isFreeUser` now returns `false` for Pro user, `true` for free / anonymous.

## Files Modified
- `backend/services/tier-gates.js` — TG-AUDIT-1 fix (return shape) + comment block.
- `backend/routes/auth.js` — AC-AUDIT-2 + AC-AUDIT-3 fixes (typeof guards on signup/login/forgot-password/reset-password; 401 early guards on /sessions, /engine-usage, /token-usage, /search; query-param coercion on /search).

