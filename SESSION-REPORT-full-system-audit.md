# Full System Audit — Session Report
**Date:** 2026-04-12
**Focus Area:** Auth & Access Control (deep dive) — auth.js service, auth routes, admin routes, VIP/admin tier enforcement, password reset security, prototype pollution

## Run Summary
Performed a comprehensive audit of the authentication and access control layer: `backend/services/auth.js` (1547→1570 lines), `backend/routes/auth.js` (286 lines), `backend/routes/admin.js` (373 lines), and `backend/routes/stripe.js` webhook auth. Found and fixed five issues across tier enforcement, brute-force resistance, and input safety. Two additional findings logged but not fixed.

## Key Findings

### AC-1: MODERATE — useEngine Ignores VIP/Admin Status
**File:** `backend/services/auth.js` — `useEngine()` and `getEngineUsage()`
**Status:** FIXED

Both `useEngine()` and `getEngineUsage()` used `getPlanLimits(user.plan || 'free')` directly, without checking whether the user is a VIP or admin. This meant:
- A VIP user on the 'free' plan (which all VIPs are — they get elite access via the VIP list, not a plan change) was limited to 3 engine uses/day instead of 20.
- Dan's family members (all on the VIP list) were subject to free-tier engine limits.

The `checkMessageUsage()` function already correctly applied VIP/admin overrides (lines 1164-1166), but `useEngine` and `getEngineUsage` were missed when that pattern was added.

**Fix:** Both functions now compute `effectivePlan = (isAdmin(user.email) || isVIP(user.email)) ? 'elite' : (user.plan || 'free')` before calling `getPlanLimits()`. This matches the pattern already used in `checkMessageUsage()` and `sanitizeUser()`.

### AC-2: MODERATE — checkTokenUsage Ignores VIP/Admin Status
**File:** `backend/services/auth.js` — `checkTokenUsage()`
**Status:** FIXED

Same issue as AC-1 but for token usage limits. `checkTokenUsage()` used `getDailyTokenLimit(user.plan || 'free')` and `getMonthlyTokenLimit(user.plan || 'free')` without VIP/admin override. VIP users on the free plan were limited to 25,000 daily tokens instead of 300,000.

Note: `recordTokenUsage()` doesn't enforce limits (it just increments), so it doesn't need the fix — the enforcement happens in `checkTokenUsage()`.

**Fix:** Added `effectivePlan` computation with VIP/admin override before calling `getDailyTokenLimit()` and `getMonthlyTokenLimit()`.

### AC-3: MODERATE — Reset Code Vulnerable to Distributed Brute-Force
**File:** `backend/services/auth.js` — `resetPassword()`
**Status:** FIXED

The 6-digit numeric reset code has 900,000 possible values. The IP-based rate limiter (`resetPasswordLimiter`: 10 attempts per 15 min per IP) only blocks single-source attacks. A distributed attack (botnet, rotating proxies) could try thousands of codes within the 15-minute expiry window since there was no per-account attempt tracking.

For comparison, the login flow has per-account lockout after 5 failed attempts (`MAX_LOGIN_ATTEMPTS`), but the password reset flow had no equivalent.

**Fix:** Added per-account `resetAttempts` counter:
- Each wrong code increments `user.resetAttempts`
- After 5 wrong guesses, the code is invalidated entirely (set to null) and the user must request a new one
- Counter resets when: (a) a new code is generated via `requestPasswordReset()`, or (b) a successful reset completes
- The user record is persisted after each failed attempt so the counter survives across requests

### AC-4: LOW — updateAdmissionsProfile Vulnerable to Prototype Pollution
**File:** `backend/services/auth.js` — `updateAdmissionsProfile()`
**Status:** FIXED

`updateAdmissionsProfile()` performed a blind spread merge: `{ ...user.admissionsProfile, ...profile }` where `profile` comes directly from `req.body`. An attacker could send `{"__proto__": {"isAdmin": true}}` to pollute `Object.prototype`. While the spread operator on modern V8 engines doesn't actually set `__proto__` on the prototype chain (it creates an own property), this is defense-in-depth against future engine changes or serialization surprises.

**Fix:** Added filter: `Object.keys(profile).filter(k => k !== '__proto__' && k !== 'constructor' && k !== 'prototype')` before merging.

### AC-5: LOW — updateProfile Profile Merge Missing Pollution Guard
**File:** `backend/services/auth.js` — `updateProfile()` profile sub-object merge
**Status:** FIXED

The profile sub-object merge in `updateProfile()` iterated over `Object.entries(updates.profile)` with type checking (string/number/boolean only, key length ≤ 50) but didn't filter `__proto__`, `constructor`, or `prototype` keys. While the type guards make exploitation difficult (these keys would need to have primitive values to pass), adding the explicit filter is a best practice.

**Fix:** Added `if (pk === '__proto__' || pk === 'constructor' || pk === 'prototype') continue;` before the type check loop.

## Issues Found But NOT Fixed

### AC-6: LOW — recordTokenUsage Doesn't Apply VIP/Admin Plan Override
**File:** `backend/services/auth.js` — `recordTokenUsage()`
**Status:** NOT FIXED — no runtime impact

`recordTokenUsage()` increments counters but doesn't enforce limits — it just records what was used. The enforcement happens in `checkTokenUsage()` (now fixed). A VIP user's recorded usage might look higher than their actual plan's limit, but that's cosmetically inconsistent rather than functionally broken. The admin dashboard shows raw usage numbers correctly.

### AC-7: INFO — Admin Secret Login Uses Secret as Password
**File:** `backend/routes/auth.js` — `POST /admin/secret-login`
**Status:** NOT FIXED — intentional design

The admin secret login endpoint uses `ADMIN_SECRET` as both the authentication secret and the admin account password (`const adminPassword = secret`). This means the admin password equals the webhook/API secret. While not ideal (compartmentalization principle), changing this would require a migration step and the risk is contained: the ADMIN_SECRET is only in Render env vars and is already high-value. Logged for awareness.

### AC-8: INFO — VIP List Mutable at Runtime Without Persistence
**File:** `backend/services/auth.js` — `addVIP()` / `removeVIP()`
**Status:** NOT FIXED — known limitation

VIP email additions/removals via the admin API modify the in-memory `VIP_EMAILS` array but don't persist to disk or env vars. A Render redeploy resets the VIP list to the `VIP_EMAILS` env var value. This is documented behavior but worth noting for the admin who might add a VIP and expect it to survive deploys.

## Positive Observations

- **Admin middleware is solid:** The `admin.js` router uses a `router.use()` middleware that gates ALL admin endpoints behind `verifyToken()` + `isAdmin()`. No individual endpoint can accidentally skip auth.
- **Stripe webhook auth is well-designed:** Production requires `STRIPE_WEBHOOK_SECRET` and uses `constructEvent()` for signature verification. Dev mode skips verification but logs a warning. Production without the secret rejects entirely. Idempotency with `processedEvents` Set prevents duplicate processing.
- **Token expiration is enforced correctly:** `isTokenExpired()` treats missing/invalid timestamps as expired (secure default). 30-day TTL with `tokenCreatedAt` tracking.
- **Account lockout works correctly:** 5 failed login attempts → 15 min lockout. Counter resets on success. Lockout uses ISO timestamp for proper timezone handling.
- **Input validation is thorough:** Profile updates use an allowlist (`ALLOWED_FIELDS`), string length caps (100-500 chars), type checking, and valid value sets for enums.
- **Password hashing is strong:** bcrypt with cost factor 12, automatic migration from legacy SHA256. Password strength validation (8+ chars, letter + number).
- **Atomic writes everywhere:** All user file updates use `atomicWriteJSON()` (write to .tmp then rename) preventing data corruption on crashes.
- **Feature access control is well-layered:** `canAccess()` function handles both object-form (sanitized user) and string-form (plan + email), with VIP/admin overrides at the check layer.
