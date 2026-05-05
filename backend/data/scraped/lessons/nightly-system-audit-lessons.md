# nightly-system-audit — Lessons Learned

> Read at the START of every run. Append takeaways at the END.

## CURRENT CALIBRATION

- frequency: daily 12am-ish
- focus_areas (rotating): Cost & Resource Leaks (every night), Backend Runtime (every night), Data Integrity (every night via boot data-health), then 1-2 of: Security, API Surface, Code Quality, Auth, Essay Pipeline, Frontend & Build
- last_calibration_change: 2026-04-27 — promote `Backend Runtime` to nightly priority alongside Cost; added "boot the server and grep for runtime warnings" as a high-yield move (caught the stripe `fsPromises` bug + 5 program duplicates that startup data-health check surfaces). Demote pure API-surface input-validation rotation: 4 fixes were applied 2026-04-25 and no new ones since — drop to weekly.
- last_calibration_change: 2026-05-02 — runtime + data + cost have been clean for 5 consecutive runs. Keep all three nightly. Surfaced one data-hygiene drift (bare-domain `_source` in internship grinder writes) — would benefit from a one-time architectural fix vs. nightly patching.
- last_calibration_change: 2026-05-03 — closed the bare-domain `_source` drift with an architectural fix in `data-integrity.js` (`normalizeEntry` runs before `validateEntry`). 470-entry one-time backfill applied. Going forward, deterministic-fix data drift (mirror `url` → `_source`, etc.) should be added to `normalizeEntry` rather than tracked in this file.
- last_calibration_change: 2026-05-04 — second consecutive clean nightly with the normalize fix in place. Promote `canonicalKey()` import + dupe scan to a standard nightly move (replaces hand-rolled `(title|city)` keys, which produced 10 false-positive flags tonight). Three-way clean (cost/runtime/data) for two nights running suggests we can rotate Frontend & Build into the nightly slot occasionally without sacrificing depth.
- last_calibration_change: 2026-05-05 — closed the deep-auth OPEN QUESTION about `verifyToken` token-cache TTL. One LOW-severity finding: `tokenIndex` unbounded across long-lived processes because `buildTokenIndex` re-adds every non-null token at boot regardless of age, and lazy eviction (`verifyToken` → `isTokenExpired`) only fires when stale tokens are queried. Fix: one-line guard `!isTokenExpired(user.tokenCreatedAt)` in `buildTokenIndex`. Auth has now been clean for 7 nights (counting tonight's deep-dive as a check, not a defect). Drop deep-auth audits to monthly — surface checks remain in twice-weekly rotation.

## EFFECTIVE PATTERNS
- **NEW (2026-05-05)**: When auditing in-memory caches/Maps for unbounded growth, the right grep is `new Map()` + every `.set()` site for it. Cross-reference against eviction sites — both explicit (`.delete()`, `.clear()`) AND implicit (replacement on .set with same key). If eviction is purely lazy (only on access), then any cache entry that's never accessed is a leak. Tonight: `tokenIndex` lazily evicts expired tokens but `buildTokenIndex` re-populates them on every boot. Fix: filter at population time, not eviction time.
- **NEW (2026-05-04)**: Use the official `canonicalKey()` from `backend/services/data-integrity.js` for any duplicate-detection scan — DON'T re-roll `(name|city)` etc. Tonight a hand-rolled `(title|city)` key produced 10 false positives that the canonical `(title|company)` key correctly cleared. Pattern: `import { canonicalKey } from './backend/services/data-integrity.js'` then `canonicalKey('internships', entry)`.
- **NEW (2026-05-03)**: when a deferred data-hygiene flag is "auto-fixable from another field on the same entry," the right place to fix it is in `data-integrity.js normalizeEntry()` — runtime defense + one-time backfill via `validateAndDedup`, not a 19,853-line source-code edit. Pattern: extend `normalizeEntry` for any new deterministic-fix issue.
- **NEW (2026-05-02)**: cross-checking `_source` URL hygiene against `url` rendering paths is high-yield — surfaced 470 internships with bare-domain `_source` (no user impact since `.url` is the rendered field, but violates the canonical-citation rule in CLAUDE.md). Pattern: `node -e "... !e._source.match(/^https?:\/\//)"` filter on each verified array.
- **NEW (2026-05-02)**: re-checking flagged OPEN QUESTIONS against current code is worthwhile — tonight closed the stale `markEventProcessed` unhandled-rejection question (the .catch is already there; prior lesson was overstated).

- **NEW (2026-04-27)**: `cd backend && npm i && timeout 12 node ./server.js` with test env vars is the highest-yield single check. The startup logger surfaces (a) any service-init runtime errors thrown silently in async IIFEs, (b) the data-integrity health-check's duplicate/invalid counts. Tonight it caught two real bugs that no static check would find: the `fsPromises is not defined` reference error in `routes/stripe.js` (broken idempotency persistence → double-credit risk) and 5 exact duplicates in `programs.json` from international HS batches.
- Rotating focus areas (one per run) produces better depth than a generic "audit everything" sweep.
- The AUDIT_LOG.md cumulative open-issue tracker is the source of truth — close stale items, flag new ones, never forget.
- When fixing security issues, also commit a regression test or a clearly-named comment so future audits don't re-flag the same thing.
- **For data-integrity duplicates**: the existing `data-integrity.js` `canonicalKey()` + `getDataStats()` helpers are the right tools — don't re-roll. Importing them with `node --input-type=module -e '...'` is fast.
- Metadata count drift between `metadata.totalCount` and the actual array length is recurring (programs and volunteer drifted by 459 and 80 respectively before the 04-27 fix). Worth auto-syncing on every inject script run rather than nightly patching — see Data Quality Flags. **Status as of 05-04: 4 nights clean, drift mechanism appears resolved at the inject-script level. Continue monitoring.**

## FAILED PATTERNS

- Don't open an issue without proposing a fix or explicitly tagging "DEFERRED — bigger redesign needed."
- Don't auto-fix changes that touch the chat pipeline without a smoke-test commit.
- Don't trust `node -c` alone for runtime correctness — it catches syntax but not undefined-symbol references like `fsPromises` (the reference was inside an async IIFE that gets called at module import time, so even a static lint catches it; but plain `node -c` does not). **Always boot the server.**
- **NEW (2026-05-04)**: hand-rolled canonical keys (e.g., `(title|city)`) produce false-positive duplicate flags — the actual schema uses `(title|company)`. Always import the official `canonicalKey()` rather than re-rolling.

## DATA QUALITY FLAGS
- **RESOLVED 2026-05-03 (was NEW 2026-05-02): bare-domain `_source` in 470 verified internships.** Closed via architectural fix in `data-integrity.js` (`normalizeEntry` mirrors `url` → `_source` when bare-domain detected on a verified entry) + one-time backfill (470 mutated, 0 still bare). Verified 2026-05-04: 0 bare-domain `_source` across all four modules' verified arrays. Fix is holding.

- **Metadata count drift across all data files** — every inject script SHOULD update `metadata.totalCount` from `array.length` and stamp `metadata.lastVerified` after successful write. **Status 2026-05-04**: 4 consecutive nights of metadata.totalCount === array.length across all 4 modules (internships 1606, scholarships 1043, programs 1416, volunteer 260). The drift fix is holding. Recommendation: still ship the shared `syncMetadata(d, arrayKey)` helper proactively; mostly to prevent future regression.
- **NEW (2026-05-05) volunteer schema gap**: `data-integrity.js` SCHEMAS map only covers `internships / scholarships / programs`. Calling `canonicalKey('volunteer', e)` throws `Unknown data type: volunteer`. Tonight worked around by hand-rolling `(name|organization)` for the volunteer dedup check (0 dupes found). One-time arch fix: add `volunteer: { keyFields: ['name','organization'], nameField: 'name', required: ['name','organization','description'], recommended: ['url','category','format'], verifiedRequired: ['_source','_verified','_verifiedDate'], maxTitleLength: 200, maxDescLength: 2000 }` to SCHEMAS. Defer until Dan has cycles — not urgent because the inject scripts for volunteer don't currently route through `validateAndDedup`.
- **NEW (2026-05-05) volunteer bare-domain `_source`**: 26/260 verified volunteer entries have `_source` like `https://www.communitygarden.org/` (no path). Unlike internships (where the program is a sub-page of a larger org site, so bare-domain is wrong), MOST volunteer entries are single-purpose nonprofits where the homepage IS the program page (e.g., Color a Smile, Letters Against Isolation, Best Buddies). Not necessarily a violation. DEFERRED — manual review of the 26 entries would distinguish (a) bare-domain that should be /volunteer/ deep links from (b) bare-domain that's correct. Not nightly-fixable.
- **International HS programs duplicate-injection risk** — 5 exact duplicates landed in programs.json (Samsung KR, Tesla DE, ARM UK, Sony JP, TSMC TW) from international HS batches. Inject scripts apparently match by name within the file but not across batches that re-add the same name. **Status 2026-05-04**: 0 duplicates in any module by official `canonicalKey()`. Inject-script dedup logic appears to be holding. Continue monitoring; consider adding a unit test that runs `validateAndDedup` over each file post-inject.

## CALIBRATION SUGGESTIONS

- **Cost & Resource Leaks** — keep nightly. The SLM keep-alive grep alone is worth the cycles (it caught the original `lastWarmAt` infinite loop pattern; now serves as a regression detector).
- **Backend Runtime (server boot)** — keep nightly. Two-night-streak of clean boots, but it's the single highest-yield check we have.
- **Security & Auth** — continue, twice-weekly is fine; been clean for 6 nights running. Consider rotating in a deeper auth audit (e.g., review `verifyToken` token-cache TTL, JWT expiry semantics) on the next twice-weekly slot since surface checks have plateaued.
- **API Surface input-validation** — drop to weekly. Big sweep done 2026-04-25 covered all 15 routes; nothing new since.
- **Essay Pipeline** — twice-weekly. Last fix 2026-04-26 (credit-refund-without-deduction), still warrants periodic re-check given premium-tier money flow.
- **Data Integrity** — keep nightly via the boot-time data-health check; deeper spot-checks twice-weekly.
- **NEW (2026-05-03)**: any future deterministic data-hygiene drift should go through `normalizeEntry` extension rather than nightly patches or per-script fixes. The pattern is now established.
- **NEW (2026-05-04)**: Frontend & Build has been deprioritized for several runs. Add a bi-weekly `node -c frontend/src/app.js` + grep for stale references to removed features. Tonight's pass took 5s and covered both checks; cheap insurance.
- **NEW (2026-05-05)**: Deep-auth audits (`verifyToken` cache, JWT semantics, session lifecycle) found 1 LOW issue tonight after 6 nights of clean surface-level auth checks. Drop the deep-auth slot from "next twice-weekly rotation" (per 2026-05-04 calibration) to **monthly** — the issue density is now too low to justify weekly. Surface auth checks (premium routes, CORS, Stripe sig) stay in twice-weekly rotation.
- **NEW (2026-05-05) Volunteer module**: belongs in nightly data-integrity scan, not weekly. Hand-rolled `(name|organization)` key for now; add a 2-line `volunteer:` SCHEMAS extension to `data-integrity.js` to officialize.

## OPEN QUESTIONS

- Should audits self-document their reasoning trace alongside the diff?
- ~~The Stripe webhook handler at line 313 calls `markEventProcessed(event.id)` without `await` and without `.catch`~~ → CLOSED 2026-05-02. Re-read of stripe.js: `markEventProcessed` is async, but the only async I/O inside (`fs.appendFile`) already has `.catch(err => console.error(...))`. The unawaited call is safe — no error escapes the function body.
- **Production audit**: did the Stripe `fsPromises` bug double-credit any real user pack purchase? Grep production audit logs (`backend/data/audit/*`) for users with multiple `essay_credits_added` events for the same Stripe `event.id`. Beyond what nightly can do — flag for Dan.
- ~~**NEW (2026-05-04)**: `verifyToken` token cache TTL semantics — is there an upper bound on cache size, or could a long-lived production process accumulate stale token entries forever?~~ → CLOSED 2026-05-05. No upper bound (unbounded `Map`); lazy eviction only on access. Fixed by adding `!isTokenExpired(user.tokenCreatedAt)` filter in `buildTokenIndex`. Memory now bounded by active-user count rather than ever-touched-user count.
- **NEW (2026-05-05)**: `data-integrity.js` SCHEMAS has no `volunteer` entry. Tonight's dedup scan worked around it. Cheap arch fix — see DATA QUALITY FLAGS.

## RUN HISTORY

| Date | Focus | Found | Fixed | Notable |
|------|-------|-------|-------|---------|
| 2026-04-23 | data-integrity, runtime | clean | 0 | baseline |
| 2026-04-24 | api surface | clean | 0 | |
| 2026-04-25 | cost leaks, data integrity | clean | 0 | full setInterval cleanup verified |
| 2026-04-25 | API surface deep | 4 | 4 | feedback messageIndex + 3x auth.js 400→401 guards |
| 2026-04-26 | essay pipeline deep | 1 | 1 | refund-without-deduction (HIGH, free credits exploit) |
| 2026-04-27 | cost leaks, runtime, data | 3 | 3 | Stripe `fsPromises` undef (HIGH, double-credit risk) + 5 program dupes + 2 metadata drifts |
| 2026-05-02 | cost, runtime, data, essay-pipeline | 1 (deferred) | 0 | clean — surfaced bare-domain `_source` data-hygiene drift in 470 internships |
| 2026-05-03 | cost, runtime, data + arch fix | 1 | 1 | closed `_source` drift via `normalizeEntry` + 470-entry backfill |
| 2026-05-04 | cost, runtime, data, frontend | clean | 0 | all checks pass; calibration note about hand-rolled canonical keys |
| 2026-05-05 | cost, runtime, data, deep-auth | 1 | 1 | LOW: `tokenIndex` unbounded — fixed via `buildTokenIndex` expired-token filter |

(see git log for "nightly audit" / "Full system audit" commits)
