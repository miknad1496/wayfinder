# nightly-system-audit — Lessons Learned

> Read at the START of every run. Append takeaways at the END.

## CURRENT CALIBRATION

- frequency: daily 12am-ish
- focus_areas (rotating): Cost & Resource Leaks (every night), then 1-2 of: Security, Data Integrity, API Surface, Code Quality, Auth, Essay Pipeline, Backend Runtime, Frontend & Build
- last_calibration_change: 2026-04-27 — promote `Backend Runtime` to nightly priority alongside Cost; added "boot the server and grep for runtime warnings" as a high-yield move (caught the stripe `fsPromises` bug + 5 program duplicates that startup data-health check surfaces). Demote pure API-surface input-validation rotation: 4 fixes were applied 2026-04-25 and no new ones since — drop to weekly.
- last_calibration_change: 2026-05-02 — runtime + data + cost have been clean for 5 consecutive runs. Keep all three nightly. Surfaced one data-hygiene drift (bare-domain `_source` in internship grinder writes) — would benefit from a one-time architectural fix vs. nightly patching.

## EFFECTIVE PATTERNS
- **NEW (2026-05-02)**: cross-checking `_source` URL hygiene against `url` rendering paths is high-yield — surfaced 470 internships with bare-domain `_source` (no user impact since `.url` is the rendered field, but violates the canonical-citation rule in CLAUDE.md). Pattern: `node -e "... !e._source.match(/^https?:\/\//)"` filter on each verified array.
- **NEW (2026-05-02)**: re-checking flagged OPEN QUESTIONS against current code is worthwhile — tonight closed the stale `markEventProcessed` unhandled-rejection question (the .catch is already there; prior lesson was overstated).

- **NEW (2026-04-27)**: `cd backend && npm i && timeout 12 node ./server.js` with test env vars is the highest-yield single check. The startup logger surfaces (a) any service-init runtime errors thrown silently in async IIFEs, (b) the data-integrity health-check's duplicate/invalid counts. Tonight it caught two real bugs that no static check would find: the `fsPromises is not defined` reference error in `routes/stripe.js` (broken idempotency persistence → double-credit risk) and 5 exact duplicates in `programs.json` from international HS batches.
- Rotating focus areas (one per run) produces better depth than a generic "audit everything" sweep.
- The AUDIT_LOG.md cumulative open-issue tracker is the source of truth — close stale items, flag new ones, never forget.
- When fixing security issues, also commit a regression test or a clearly-named comment so future audits don't re-flag the same thing.
- **For data-integrity duplicates**: the existing `data-integrity.js` `canonicalKey()` + `getDataStats()` helpers are the right tools — don't re-roll. Importing them with `node --input-type=module -e '...'` is fast.
- Metadata count drift between `metadata.totalCount` and the actual array length is recurring (programs and volunteer drifted by 459 and 80 respectively before tonight's fix). Worth auto-syncing on every inject script run rather than nightly patching — see Data Quality Flags.

## FAILED PATTERNS

- Don't open an issue without proposing a fix or explicitly tagging "DEFERRED — bigger redesign needed."
- Don't auto-fix changes that touch the chat pipeline without a smoke-test commit.
- Don't trust `node -c` alone for runtime correctness — it catches syntax but not undefined-symbol references like `fsPromises` (the reference was inside an async IIFE that gets called at module import time, so even a static lint catches it; but plain `node -c` does not). **Always boot the server.**

## DATA QUALITY FLAGS
- **NEW (2026-05-02): bare-domain `_source` in 470 verified internships.** Grinder writes `_source: "seattlechildrens.org"` instead of the full URL. Frontend uses `.url` field for rendering so users are unaffected, but the `_source` field is the canonical citation per CLAUDE.md rule 2. Recommend updating the inject script + grinder write logic to mirror `url → _source` when `_source` is missing the protocol prefix. One-time backfill: `for e in arr: if e._source && !e._source.startsWith('http') && e.url?.startsWith('http'): e._source = e.url`.

- **Metadata count drift across all data files** — every inject script SHOULD update `metadata.totalCount` from `array.length` and stamp `metadata.lastVerified` after successful write. Today the programs and volunteer files drifted significantly. Recommendation: add a single shared `syncMetadata(d, arrayKey)` helper in `data-integrity.js` and call it at the end of every inject script. Until then, nightly audit must keep running the count-fix.
- **International HS programs duplicate-injection risk** — 5 exact duplicates landed in programs.json (Samsung KR, Tesla DE, ARM UK, Sony JP, TSMC TW) from international HS batches. Inject scripts apparently match by name within the file but not across batches that re-add the same name. Worth auditing the inject-verified-programs.js dedup logic.

## CALIBRATION SUGGESTIONS

- **Cost & Resource Leaks** — keep nightly. The SLM keep-alive grep alone is worth the cycles (it caught the original `lastWarmAt` infinite loop pattern; now serves as a regression detector).
- **Backend Runtime (server boot)** — promote to nightly. Tonight's two highest-impact findings came from the startup log.
- **Security & Auth** — continue, twice-weekly is fine; been clean for 5 nights running.
- **API Surface input-validation** — drop to weekly. Big sweep done 2026-04-25 covered all 15 routes; nothing new since.
- **Essay Pipeline** — twice-weekly. Last fix 2026-04-26 (credit-refund-without-deduction), still warrants periodic re-check given premium-tier money flow.
- **Data Integrity** — keep nightly via the boot-time data-health check; deeper spot-checks twice-weekly.

## OPEN QUESTIONS

- Should audits self-document their reasoning trace alongside the diff?
- ~~The Stripe webhook handler at line 313 calls `markEventProcessed(event.id)` without `await` and without `.catch`~~ → CLOSED 2026-05-02. Re-read of stripe.js: `markEventProcessed` is async, but the only async I/O inside (`fs.appendFile`) already has `.catch(err => console.error(...))`. The unawaited call is safe — no error escapes the function body.
- **Production audit**: did the Stripe `fsPromises` bug double-credit any real user pack purchase? Grep production audit logs (`backend/data/audit/*`) for users with multiple `essay_credits_added` events for the same Stripe `event.id`. Beyond what nightly can do — flag for Dan.

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

(see git log for "nightly audit" / "Full system audit" commits)
