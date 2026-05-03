# Full System Audit — 2026-05-03

**Date:** 2026-05-03
**Focus Area:** Chat Pipeline — patches 35-45 (Simon Kim depth bundle + SLM RAG bundle), with cross-call-site shape audit per the lesson promoted on 2026-05-02

## Run Summary
Deep audit of the recent SLM/curated-search/auto-engine/financial-aid/per-school work. The lessons file specifically called out a sub-check ("when a service exposes a function used by ≥2 modules, grep all callers and confirm they destructure / shape-handle identically") to apply on every rotation. Applied that to `retrieveContext` (called from `claude.js` and `slm.js`) and `searchCuratedEntries` (same pair).

Found **1 HIGH-severity production regression** (engine mode silently routing to lite-brain instead of BM25) and **1 LOW** issue (international scoring regex omits US territories), both fixed. All `node --check` passes; data integrity counts match metadata.

## Key Findings

### CP-AUDIT-1 (HIGH severity, FIXED) — `claude.js` engine mode silently bypasses BM25 RAG and uses only the lite-brain
**File:** `backend/services/claude.js` line 498
**Status:** FIXED

`claude.js` engine mode calls `retrieveContext(userMessage, { topK, userId })` (since Patch 41) **without** specifying `mode: 'engine'`. The dispatcher in `knowledge.js` defaults `mode` to `'standard'`:

```js
// knowledge.js retrieveContext
mode = optionsOrTopK.mode || 'standard';
if (mode === 'standard') {
  const liteBrain = await getLiteBrainContext(query);
  const chunks = [{ source: 'wayfinder-knowledge-base', title: ..., content: liteBrain, layer: 'base', score: 1.0 }];
  return { chunks, sources };          // ← returns ONE lite-brain chunk
}
// For engine mode, use full BM25 retrieval
const results = await retrieveContextV2(query, topK, { userId: _v41_userId });
```

That meant **paid Engine users (Pro/Elite/Coach/Consultant) were paying for Opus-tier model + the "premium" RAG experience, but the actual context fed to Opus was identical to what Sonnet gets in standard mode** — a single `wayfinder-knowledge-base` chunk. The BM25 layer (4280 indexed chunks across distilled MD + base + raw data + per-school files), the `topK` scaling by conversation phase, the entity boosts, the schools deep knowledge from Patch 37 — all unreachable from the engine path.

**Repro (verified):**
```
PRE-FIX  claude.js engine: { topK: 8, userId: null }
   → chunks: 1, sources: ["wayfinder-knowledge-base"]
POST-FIX claude.js engine: { topK: 8, mode: 'engine', userId: null }
   → chunks: 8, sources: ["admissions-school-selection-intelligence.md",
                          "admissions-parent-strategy-guide.md",
                          "school-stanford.md", ...]
```

**Provenance:** The `mode === 'standard' / mode === 'engine'` dispatch was added in commit `2fcf5f9` ("Add SLM tier (Wayfinder 05E)") without a corresponding update to the legacy `claude.js` call site. Since `retrieveContext(query, 6)` (the original call) becomes `topK=6, mode='standard'` (default) under the new dispatcher, claude.js engine mode has been on the lite-brain code path **since the SLM tier landed**. Patch 40 fixed the symmetric problem in `slm.js`. Patch 41 modified the `claude.js` call to pass `userId` but did not add `mode`. So the regression has been live across the entire engine mode user base for as long as the dual dispatcher has existed.

**Impact:**
- Patch 37 per-school deep knowledge (school-stanford.md) was never reaching engine users from the chat path even though it was indexed correctly.
- Patch 45 financial aid deep brain (admissions-financial-aid-strategy.md) was never reaching engine users either.
- The `topK` calculation (4 / 6 / 8 by conversation phase) was being computed and discarded.
- Engine-mode Opus calls were running on lite-brain context (38KB career + 12KB admissions) instead of BM25-scored chunks.

**Fix:** One-line change at `backend/services/claude.js:498` — added `mode: 'engine'` to the options object. Marker: `REVAMP V2: ENGINE MODE BM25 DISPATCH FIX (audit 2026-05-03)`. Verified by side-by-side run of the pre-fix and post-fix call shapes — chunk count 1 → 8, sources flipped from lite-brain to BM25-scored top-K.

**Severity rationale:** This is the single biggest perceived-quality bug in the system. The "Simon Kim depth investigation" (patches 34-37) explicitly identified that paid users felt engine answers were generic — and the architectural cause was assumed to be missing per-school files (patch 37) or curated DB entries (patch 35). Both of those landed correctly. **The actual reason engine answers felt generic is that engine mode was running on lite-brain context the entire time.** Patches 35 and 37 helped but only via the curated-search injection (which works in claude.js). The BM25 retrieval over distilled brain + base + raw data + per-school files — the 4280-chunk advisory backbone — has been dead in engine mode.

### CP-AUDIT-2 (LOW severity, FIXED) — Patch 44 international US-state regex omits territories and the 'ALL' tag
**File:** `backend/services/curated-search.js` line 199
**Status:** FIXED

Patch 44's `intl` scoring branch tested whether an entry's state code was US with a hand-rolled regex `/^(A[KLRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY]|ALL)$/`. Audited against the canonical `VALID_STATE_CODES` set (already declared at the top of the same file as the source of truth for state validation):
- **Territories missed:** `PR` (Puerto Rico), `VI` (Virgin Islands), `GU` (Guam), `MP` (Northern Mariana), `AS` (American Samoa).
- **Behavior:** when an "international" query came in and a curated entry was tagged with one of these territory codes, the entry would be scored as **non-US** (+4 boost) instead of penalized as US (-10). For a query like "study abroad programs in the Caribbean", a Puerto Rico entry would have ranked toward the top of the international results.

**Why this hadn't surfaced as a user-visible bug:** none of the 4 module data files currently use territory state codes (verified by grep across programs/internships/scholarships/volunteer JSONs). So this is a future-data hazard, not a current production bug.

**Fix:** Replaced the hand-rolled regex with `(entryState === 'ALL' || VALID_STATE_CODES.has(entryState))` — uses the same source of truth as `extractState`. Also extended the check to include `'ALL'`-tagged entries (which represent multi-state US programs, e.g., EF Language Travel Camps). Marker: `REVAMP V2: INTL US-CHECK USES STATE WHITELIST (audit 2026-05-03)`. Verified by 6-test scoring matrix — CA/PR/GU/ALL all penalized as US under intl=true, UK/FR boosted as non-US.

### CP-AUDIT-3 (INFO, not fixed) — Schools dir log overcounts files when README.md present
**File:** `backend/services/knowledge.js` lines 1606-1614
**Status:** NOT FIXED — cosmetic

The schools loader (`Patch 37`) prints `Schools deep knowledge: N chunks from M files` where `M = schoolFiles.length` (i.e., the unfiltered readdir count, including README.md). After filtering on `f.endsWith('.md') && f !== 'README.md'`, only the actually-loaded files contribute chunks. So at boot today, the log says "8 chunks from 2 files" when only 1 file (school-stanford.md) actually loaded. Trivial cosmetic. Not a behavior bug.

### CP-AUDIT-4 (INFO, RESOLVED) — Auto-engine promotion is correctly disabled via `if (false && ...)` short-circuit
**File:** `backend/routes/chat.js` line 402
**Status:** RESOLVED — informational

Confirmed Patch 43's disable-condition is `if (false && isPaidTier && (_isSpecificQuery(message) || _curatedWillFire))`. The `false &&` short-circuits the whole condition before evaluating the right-hand side, so no auto-engine promotion fires. The dead `_isSpecificQuery` helper and `_curatedSearchInternals.detectModules` import are intentionally preserved for easy re-enable. No issue.

### CP-AUDIT-5 (INFO, RESOLVED) — `searchCuratedEntries` cross-call-site shape verified consistent
**Files:** `backend/services/curated-search.js` (defines), `backend/services/claude.js:515`, `backend/services/slm.js:422` (consumers)
**Status:** RESOLVED — informational

Both consumers call `await searchCuratedEntries(userMessage, sessionContext, limit)` and treat the return as a string (truthy → append to system prompt). claude.js uses `useEngine ? 8 : 5`; slm.js hard-codes 8. Function returns `''` for off-topic queries, so the truthy gate works for both. No shape drift.

## Positive Observations
1. **Engine fix proves out patches 35 + 37 + 45 silently.** With CP-AUDIT-1 fixed, engine users now actually receive school-stanford.md (Patch 37) and admissions-financial-aid-strategy.md (Patch 45) and the full BM25 chunk pool. The Simon Kim depth bundle's intent fully reaches paid users for the first time.
2. **Curated-search v2 (Patch 44) intl detection is well-designed beyond the regex nit.** The `INTL_SIGNALS` list covers high-recall phrases without false positives on common US-state shorthand. Test scoring with a Korean / Italian / French query produced expected non-US dominance.
3. **scope_classifier graceful-degrade tree.** Empty input → `in_scope` (avoids penalizing keystroke artifacts). Embedding failure → `adjacent` (conservative). Kill-switch and shadow-mode env vars wired in. The dispatch is clean.
4. **retrieveContext's legacy fallback chain** — both the BM25 path and the keyword-based legacy still exist; if BM25 throws, the legacy path is tried before erroring out. Patch 41's userId propagation respects the same try/catch boundary.
5. **Per-school deep knowledge schema** (Patch 37) — adds `chunk._school` metadata cleanly without polluting the search field, so the BM25 surface is unchanged but downstream consumers (e.g., future per-school filtering) have access to the school identity.
6. **SLM mode='engine' (Patch 40) is correctly coupled to topK=16** — SLM gets the full BM25 surface area at zero per-token cost since it's self-hosted. This is now actually mirrored in claude.js engine path post-fix.

## Verifications Run
- `node --check` on touched files (claude.js, curated-search.js) — pass.
- `node --check` on every chat-pipeline service file — all pass.
- Repro of CP-AUDIT-1 with isolated 4-line script: confirmed pre-fix returns 1 lite-brain chunk; post-fix returns 8 BM25 chunks including school-stanford.md.
- Repro of CP-AUDIT-2 with 6-case scoring matrix: CA/PR/GU/ALL penalized; UK/FR boosted under intl=true. All PASS.
- Data integrity:
  - internships: 1606 entries, metadata.totalCount = 1606. ✓
  - programs: 1416 entries, metadata.totalCount = 1416. ✓
  - scholarships: 1043 entries, metadata.totalCount = 1043. ✓
  - volunteer: 247 entries, metadata.totalCount = 247. ✓
- JSON syntax: all 4 module files parse cleanly via `JSON.parse`.
- Auto-engine confirmed disabled via `if (false &&...)` short-circuit (CP-AUDIT-4).

## Files Modified
- `backend/services/claude.js` — CP-AUDIT-1 fix: add `mode: 'engine'` to retrieveContext call so engine mode reaches BM25 retrieval.
- `backend/services/curated-search.js` — CP-AUDIT-2 fix: replace hand-rolled US-state regex with `VALID_STATE_CODES.has(...)` + `'ALL'` check.

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

