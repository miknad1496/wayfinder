# nightly-system-audit — Lessons Learned

> Read at the START of every run. Append takeaways at the END.
> **Compacted 2026-08-16** — 41 RUN HISTORY rows across 16 append-blocks consolidated to a single 14-row table
> (policy cap) + an archive summary; scattered dated PATTERN/FLAG/QUESTION blocks merged into their canonical
> sections. No pattern, flag, or open question was dropped — only de-duplicated and re-homed.

## CURRENT CALIBRATION

- **frequency**: daily 12:09am (host-local), jitter 0-600s
- **nightly, every run**: Cost & Resource Leaks · Backend Runtime (full boot smoke) · Data Integrity (standard panel)
- **rotating slot**: code-focused areas (Security/Auth, API Surface, Essay Pipeline, Frontend & Build) at
  **monthly-OR-on-commit** cadence — gate on `git log --since=<last sweep> -- backend/ frontend/` showing real
  code commits. The repo has had **zero feature commits since 2026-05-15 (patch 165)** and **zero data commits
  since 2026-05-10**, so there is nothing new to sweep; reclaimed depth goes to data provenance.
- **standing thesis (7/14, reaffirmed 7/15 → 8/16)**: *the risk in Wayfinder has migrated from code to data.*
  The last three genuine findings (6/18, 7/14, and the 8/16 scheduler-mechanism correction) are data/infra;
  code checks have been clean for ~13 straight weeks against a static repo.

### Calibration changelog (compacted)

- **2026-04-27 → 2026-05-15 (summarized)**: promoted Backend Runtime to nightly alongside Cost (boot smoke is the
  single highest-yield check — caught the Stripe `fsPromises` undef + 5 program dupes). Closed the bare-domain
  `_source` drift architecturally via `normalizeEntry` Rule 1 (5/3, 470-entry backfill) and homepage-only `_source`
  via Rule 2 (5/6, 30-entry backfill). Adopted official `canonicalKey()` for dedup scans after hand-rolled keys
  produced 10 false positives. Deep-auth dropped to monthly after the `tokenIndex` unbounded-growth fix (5/5).
  Added URL-hygiene scan (5/10). API-surface promoted back to twice-weekly (5/12) and immediately earned it —
  caught the volunteer `/discover-local` phantom-cap (5/13). Added shadowed-route scan after the ap-coach
  `/usage` dup (5/15). Programs Rule-2 net residue settled at **82** and has not moved since 5/12.
- **2026-05-16 → 2026-06-03 (summarized)**: essay-pipeline and API-surface both pushed out to monthly after
  repeated zero-defect dormant cycles. Rule-2 net 82 demoted from nightly to weekly tracking (zero-information at
  nightly resolution). ENOSPC on `/sessions` went from outlier → trend → sustained (5/28-6/3, 100% used); solved
  6/02 via the npm-cache-redirect workaround, which restored full boot smoke after 5 static-only nights.
- **2026-06-17/18**: first runs after the 13-night blackout. Added the **shared-path-across-N-hosts fingerprint
  scan** permanently to the data panel — it catches a fabrication class the three structural scans cannot see, and
  that class had sat in `_verified:true` data undetected for ~7 weeks.
- **2026-07-14/15**: added the **DNS-resolution scan** permanently. Data panel is now five scans, cheapest →
  most decisive: Rule-1 (bare domain) · Rule-2 (homepage-only, two buckets) · URL-hygiene (malformed) ·
  shared-path fingerprint (templated) · DNS resolution (nonexistent host). Established that when the curated JSONs
  are git-identical, **confirm with a targeted sample + live controls rather than re-running the full sweep**.
- **2026-07-19**: corrected a standing claim by re-deriving it from source (data-refresh "dead since 5/24" → actually
  5/17). Established that carried claims deserve periodic re-derivation, not just re-confirmation.
- **2026-07-26**: called the `scheduled-tasks` MCP directly instead of inferring from git cadence — overturned two
  multi-week false narratives in one read (data-refresh and pii-audit are both enabled and firing). Sharpened the
  NXDOMAIN escalation into its remediation-ready apex/subdomain/transient split (28/13/2).
- **2026-08-16 (this run)**: **root-cause hypothesis for the recurring "scheduler blackouts" — host availability,
  not task faults.** See the finding below; this supersedes five episodes' worth of "check the dashboard" guesses.
  Also added the **cron-vs-lastRunAt consistency check** as the required second step whenever the scheduled-tasks
  MCP is read (7/26 established *call it*; tonight establishes *don't stop at the value it returns*).
  No rotation changes. Lessons-file compaction (flagged 7/19, carried 7/26) **DONE**.

## EFFECTIVE PATTERNS

**Scheduler / task health**
- **(2026-07-26) Read scheduled-task state DIRECTLY when the MCP is available; commit-cadence ≠ run-cadence.**
  `list_scheduled_tasks` gives `enabled` + `lastRunAt` + `nextRunAt` per task — authoritative. A task can fire and
  legitimately produce NO commit (pii-audit no-ops when there is no PII to patch; data-refresh silent-exits on its
  "if unsure STOP" guard). When the MCP is NOT reachable, explicitly label commit-cadence conclusions as
  "commit cadence, not confirmed run cadence" so they are not later carried as fact. **Corollary**: for a task that
  commits even on clean runs (nightly-audit itself), a missing commit IS a missing successful run; for tasks that
  only commit when they have output, a missing commit is ambiguous.
- **(2026-08-16) Then cross-check every `lastRunAt` against its own `cronExpression` — the MCP value proves a task
  RAN, not that it ran ON SCHEDULE.** Two mechanical tests, both cheap and both decisive:
  (a) **day-of-week/slot test** — does `lastRunAt` fall on a day and time the cron actually permits? A `0 9 * * 0`
  (Sunday-only) task showing a Tuesday `lastRunAt` is structurally impossible on its own schedule.
  (b) **burst-clustering test** — group all tasks' `lastRunAt` values; if N tasks with N *different* cron slots share
  a sub-5-minute window, that is a catch-up queue drain, not N coincidental on-time runs (jitter is capped at 600s
  and cannot make independent crons converge, nor produce multi-hour offsets).
  Tonight both tests fired and together they explain the whole blackout series. Run this every time.
- **(2026-06-17) Detect a BROAD stoppage by cross-checking ALL auto-push tasks, not a single control task.** Prior
  nights used pii-audit as an "alive" control to isolate data-refresh; on 6/17 the control failed the same way.
  When multiple independent tasks are behind cadence, escalate as ONE environment issue, not N task bugs.
  *(Superseded in mechanism by the 8/16 finding, but the cross-check discipline still applies.)*
- **(2026-06-01) Decisive-slot resolution via HEAD-staleness.** To check whether a Sunday-morning auto-task fired,
  `git log --oneline -1` at the next nightly: if HEAD is still the prior audit's own commit, the slot produced
  nothing. Avoids false negatives from date-filtering greps with jittered/TZ-shifted dates.

**Data integrity**
- **(2026-07-14) DNS-resolution scan over verified `_source`/`url` hosts — cheapest, highest-yield, zero-judgment.**
  Every other scan reasons about URL *structure*; this one asks whether the host *exists*. A `_verified:true` entry
  whose hostname has no DNS record cannot have been verified against a live page. **Run it correctly or it lies to
  you**: naive `resolve4` with `tries:1, timeout:2500` reported 45 dead hosts, 4 of them obviously-real institutions
  that resolve on retry. Correct shape: `new Resolver({timeout:6000, tries:3})`, servers
  `['8.8.8.8','1.1.1.1','9.9.9.9']`, try `resolve4 → resolve6 → resolveCname`, and **bucket by `err.code`** — only
  `ENOTFOUND` is actionable; `ETIMEOUT`/`ESERVFAIL`/`ENODATA` are inconclusive. Also retry the apex with `www.`
  stripped. ~1,600 hosts at concurrency 60 takes 2-3 min — background it or it blows the bash timeout.
- **(2026-07-26) Apex-vs-subdomain split + authoritative retry when re-deriving NXDOMAIN findings.** A flat
  "unresolvable host" count conflates three populations: (1) **apex-DEAD** (registrable domain itself is NXDOMAIN,
  handling SLDs like ac.kr/co.uk) = the hard fabrication core; (2) **subdomain-only-dead** (apex is a live real
  institution, cited subdomain is gone) = real programs needing URL updates, **NOT** un-verification — a blunt bulk
  `_verified:false` would wrongly nuke these; (3) **transient FP** (re-resolve against a public resolver; 2 of 30
  flipped LIVE on 7/26). Only bucket (1) minus transients is a confident fabrication signal.
- **(2026-06-18) Shared-path-across-N-hosts fingerprint catches fabricated `_source` URLs the structural scans miss.**
  A generator that stamps a template slug onto each entry's real domain produces structurally-VALID deep links that
  pass Rule-1/Rule-2/URL-hygiene while being fabricated. Detection: over entries where `url===_source`, group by
  `new URL(url).pathname` (strip trailing slash); any non-root path on ≥3 DISTINCT hosts is a template — independent
  institutions never converge on byte-identical paths.
- **(2026-07-14) Fingerprint FLAGS a candidate; DNS + slug-shape/batch-tag CONVICTS it.** Extended to all 4 modules,
  the fingerprint over-flags on internships/scholarships: `/volunteer` on 15 hosts, `/programs` on 11 are genuinely
  common CMS paths on real museums/zoos. The separating signal is the **slug shape plus the `_addedBy` batch tag**,
  not raw host count — `/learn/<audience>` is a *generator* slug. Without this second filter, ~70 legitimate
  internship rows would have been wrongly condemned.
- **(2026-07-15) When data is git-identical to the last scan, CONFIRM — don't RE-SWEEP.** Check
  `git log --since=<last audit> -- backend/data/scraped/` first. If only the audit's own markdown touched that tree,
  the JSONs are bit-identical and every prior finding carries unchanged by definition. Spend ~40s on a targeted
  re-resolve of a representative sample instead of 2-3 min on the full sweep.
- **(2026-07-15) Always include LIVE CONTROLS in a targeted DNS sample.** Re-resolving only known-dead hosts cannot
  distinguish "finding still valid" from "my resolver is broken tonight." The typosquat pairs are ideal controls:
  fabricated `www.wheretheresbedragons.com` (dead) vs real `wheretherebedragons.com` (live); `nytimes.edu` (dead) vs
  `nytimes.com` (live).
- **(2026-05-06) Run TWO bare-domain `_source` checks per module** — (a) "no `http://` prefix" (Rule 1) and
  (b) "full URL with empty path" (Rule 2). Different populations, different root causes. Bucket Rule-2 hits against
  `url`: deeper on same host → fixable; `url === _source` → "homepage IS the program" deferred; different host →
  manual review.
- **(2026-05-09) Log Rule-2 sub-buckets separately, never just the net.** The architectural mirror only reduces
  `sameUrl`; `diffHost` needs manual review. Net-only reporting masks which bucket is moving and why.
- **(2026-05-10) URL hygiene scan alongside Rule-1/Rule-2.** Rule-1/Rule-2 only inspect entries where `_source`
  parses as a full URL — a structurally malformed value is silently skipped and never surfaces. Flag if
  `(v.match(/https?:\/\//gi)||[]).length > 1`, or `^https?` AND contains whitespace, or matches `\s+(or|and|\/)\s+`,
  or `new URL(v)` throws.
- **(2026-05-04) Use the official `canonicalKey()` from `data-integrity.js`** for any dedup scan — never re-roll.
  Hand-rolled `(title|city)` produced 10 false positives that canonical `(title|company)` cleared.
- **(2026-06-17) Pin the module→array-key map.** `volunteer-opportunities.json`'s array is under key
  **`opportunities`**, not `volunteer`. Canonical: internships→`internships`, scholarships→`scholarships`,
  programs→`programs`, volunteer→`opportunities`. Always cross-check each module's verified count against the
  metadata-count scan — a 0 where metadata says 275 is a scan-key bug, not a data finding.
- **(2026-05-03) Deterministic, auto-fixable data drift belongs in `normalizeEntry()`** — runtime defense + one-time
  backfill via `validateAndDedup`, not a source-file edit. Write new rules as *additive*; verify the prior rule's
  filter still returns 0 afterward.

**Code / runtime**
- **(2026-04-27) Boot the server — the single highest-yield check.** `npm i && timeout 12 node ./server.js` with
  minimal env (`NODE_ENV=development CLAUDE_API_KEY=sk-test JWT_SECRET=… PORT=3099`). The startup logger surfaces
  service-init errors thrown silently inside async IIFEs plus the data-health duplicate/invalid counts.
- **(2026-06-02) ENOSPC boot-smoke workaround.** When `/sessions` is full, npm fails because it writes cache to that
  mount — but the clone lives on `/`. Redirect: `npm install --no-audit --no-fund --cache /tmp/npmcache` with
  `TMPDIR=/tmp`. Use this **before** falling back to static-only; the static panel is ~85% of the signal and boot
  smoke is the only thing that catches async-IIFE init errors.
- **(2026-05-15) Shadowed-route scan.** `grep -nE "^router\.(get|post|put|delete|patch)\(" <file>` → normalize to
  `path method` → `sort | uniq -d`. Any duplicate is a dead-code bug (Express matches first). Apply to every route
  file when a module has 5+ patches in a 2-week window.
- **(2026-05-13) Cross-reference code-comment promises against runtime enforcement.** The volunteer
  `/discover-local` comment promised a "hard cap" that did not exist. Same pattern caught the 5/5 `tokenIndex`
  unbounded growth ("expired tokens are evicted" — only lazily).
- **(2026-05-27) Public-by-design route justification.** For any route without auth, verify the handler makes NO LLM
  call, returns NO per-user data, and performs NO mutation. If it does not call `verifyToken`, it must return data
  identical for all callers AND make no upstream LLM/DB calls.
- **(2026-05-16) Re-verify recent fixes on subsequent nights, not once.** Maintain a rolling 14-day recent-fixes
  cross-check (<5s per fix). Catches the "fix reverted by a later commit" class.
- **(2026-05-13) When rotating a dormant focus area back in, prioritize surfaces added DURING the dormancy.**
  `git log --since=<dormancy start>` on the relevant directory, audit those files first.
- **(2026-05-14) "Freshly-swept area + zero new commits = move the slot elsewhere."** Conserves depth for areas that
  actually accumulate change.
- **(2026-05-27) A zero-defect finding on a 2-week dormant cycle means push the cycle OUT, not keep it weekly.**

**Meta**
- **(2026-05-12 → 7/15, five instances) Interrogate a surprising result BEFORE you believe it.** Applies to
  surprising counts (internships sameUrl 94→99 was scan-logic drift, not data drift — the newest entries were all
  30+ days old), to alarming non-findings (7/15's two false alarms), and to **standing carried claims**.
- **(2026-07-19) Periodically re-derive old carried claims from source, not just re-confirm them.** "data-refresh
  dead since 5/24" had been repeated across ~15 entries for ~8 weeks; a 10-second `git log --grep` showed the true
  date was 5/17. Re-run the ORIGINAL derivation query monthly-ish on any long-carried escalation.
- **(2026-06-18) When a data finding is large + destructive + requires per-entry research, ESCALATE with a
  reproducible query — do NOT auto-mutate curated rows at midnight.** CLAUDE.md's no-agent manual-verification rule
  + the grinder-write single-writer pipeline + the "furious at hallucinated data" history all point the same way.
  Acting on the 2-of-225 subset I happened to verify would fragment the fix — hand over the whole set.
- The AUDIT_LOG.md cumulative open-issue tracker is the source of truth — close stale items, flag new ones.
- Rotating focus areas produces better depth than a generic "audit everything" sweep.

## FAILED PATTERNS

- **(2026-07-15) An empty grep is not a finding.** A tight `grep -A<n>` window around a route registration returning
  "no auth" does NOT mean the route is unauthenticated — the volunteer `/discover-local` gate sits ~8 lines past a
  naive window. **For any auth/security assertion, read the full handler body.**
- **(2026-07-15) A per-file grep loop with `|| echo 0` reports 0 for a file that does not exist**, which reads
  identically to "0 auth refs." `coach.js` showed 0 — but `/api/coach` mounts `essay-coach.js` (import alias
  `coachRoutes`). Resolve the route→file mapping from the actual `import … from` before auditing gating.
- **(2026-07-19) The morning-pulse email cross-check is NOT reachable from this environment.** The only mailbox
  connected to this sandbox belongs to an unrelated third party. Don't spend budget here again — if that
  cross-check is wanted it must be built inside the morning-pulse task itself.
- **(2026-05-04) Hand-rolled canonical keys produce false-positive duplicates.** Always import `canonicalKey()`.
- **Don't trust `node -c` alone for runtime correctness** — it catches syntax, not undefined-symbol references like
  the `fsPromises` bug. Always boot the server.
- Don't open an issue without proposing a fix or explicitly tagging "DEFERRED — bigger redesign needed."
- Don't auto-fix anything touching the chat pipeline without a smoke-test commit.

## DATA QUALITY FLAGS

- **OPEN (2026-07-14, sharpened 7/26, re-confirmed 8/16) — NXDOMAIN hosts on `_verified:true` entries.**
  Remediation-ready split: **28 apex-DEAD** (hard fabrication core, incl. typosquats `nytimes.edu`,
  `www.wheretheresbedragons.com`, `www.junachievement.org`) + **13 subdomain-only-dead** on LIVE institutions (real
  programs needing URL updates, must NOT be bulk-unverified) + transient FPs excluded. 8/16 targeted resample:
  4/5 sampled apex-dead still NXDOMAIN, live controls all resolve; **`aviationcampsofamerica.com` flipped LIVE**
  (either a late registration or a further transient — re-derive the apex-dead count on the next full sweep).
- **OPEN (2026-06-18) — templated/fabricated `_source` on the `hs-international-batch-*` program entries.**
  ~225 entries, all `_verified:true`, all `url===_source`, machine-templated paths (32 hosts share
  `/learn/hs-summer`, 26 `/learn/hs-pre-university`, 23 `/learn/summer-school`, 7 `/careers/hs-insight`). Two
  WebSearch-confirmed fabrications (Bologna HS pre-med, UBA HS summer) where both the path AND the described program
  do not exist. 7/26 re-derivation: 120 verified `/learn/hs*` remain, a subset of the ~320-entry batch family;
  overlaps the NXDOMAIN flag. NOT deterministically auto-fixable — no sibling field holds the correct URL.
- **RECOMMENDED FIX THAT CLOSES BOTH FLAGS PERMANENTLY** — a **write-time gate** in inject-script validation /
  `data-integrity.js`: no entry may be written with `_verified: true` if (a) its `_source` hostname does not resolve,
  or (b) its `_source` pathname is shared byte-identically across ≥3 unrelated hosts. Both are mechanical and
  zero-judgment and would have blocked every one of these at write time. This is squarely the "deterministic drift
  belongs in data-integrity.js" pattern established 5/3. **Prioritise the gate over the per-entry cleanup — the
  cleanup is finite, but without the gate the next batch run re-introduces the class.**
- **DEFERRED — programs Rule-2 `diffHost` subset (5 entries).** `_source` cites the parent org (USAEOP / DiscoverE /
  TeamUSA / CISV-USA / NSBE) while `url` points to the program's own domain. Both arguably correct; not
  architecturally fixable from the existing two fields.
- **DEFERRED — homepage-only `_source` residue** (77 programs / 94 internships / 12 scholarships / 27 volunteer).
  Confirmed "homepage IS the program page" pattern (NSF REU subdomains, NASA portals, single-purpose nonprofits).
  Manual review only. Net programs Rule-2 residue has been **82, steady since 2026-05-12**.
- **OPEN (2026-05-05) — `data-integrity.js` SCHEMAS has no `volunteer` entry.** `canonicalKey('volunteer', e)`
  throws. Workaround: hand-roll `(name|organization)`. Cheap 2-line fix; deferred because volunteer inject scripts
  don't currently route through `validateAndDedup`.
- **RESOLVED 2026-05-03 — bare-domain `_source` in 470 verified internships.** Closed via `normalizeEntry` Rule 1 +
  backfill. Verified 0 across all four modules on every night since.
- **RESOLVED 2026-05-04 — metadata count drift.** `metadata.totalCount === array.length` across all four modules on
  every night since. Fix holding at the inject-script level.
- **RESOLVED 2026-05-04 — international-HS duplicate injection.** 0 duplicates by official `canonicalKey()`.

## CALIBRATION SUGGESTIONS

- **Cost & Resource Leaks** — keep nightly. The SLM keep-alive grep alone is worth the cycles; it now serves as a
  permanent regression detector for the original `lastWarmAt` infinite-loop pattern.
- **Backend Runtime (boot smoke)** — keep nightly. Highest-yield single check we have.
- **Data Integrity** — keep the five-scan panel nightly, but run the *expensive* scans (full DNS sweep, full
  fingerprint) only on the first night AFTER new data lands. While the JSONs are git-identical, a targeted sample
  with live controls is the calibrated move.
- **Code-focused rotation (Security/Auth · API Surface · Essay Pipeline · Frontend & Build)** — monthly-OR-on-commit.
  Gate on `git log --since` showing real code commits. Zero feature commits since 5/15 means these slots are
  currently reduced to cheap recent-fix regression checks, which is correct.
- **Scheduler health** — now a *first-class nightly panel*, not an incidental observation: call the scheduled-tasks
  MCP, then run both cron-consistency tests (§ EFFECTIVE PATTERNS 8/16). It has produced the last two runs' most
  valuable output.
- Any future deterministic data-hygiene drift goes through `normalizeEntry` extension, not nightly patches.

## OPEN QUESTIONS

- **(NEW 2026-08-16, supersedes the "why did the scheduler go dark" question across all 5 prior episodes) The
  blackouts are host-availability gaps, not task faults — what remains is why `nightly-system-audit` specifically
  fails to drain.** Evidence is in tonight's AUDIT_LOG entry: 9 tasks with 9 different cron slots all last-ran
  inside a 4m19s window on Sat 8/15 (three sub-second clusters of 2/3/3), each hours after its own slot; and a
  Sunday-only task last-ran on a Tuesday. That is a catch-up queue drain after the host was unavailable. **The
  residual asymmetry**: the 8/15 drain fired `daily-platform-audit` (daily, 12:19am) but NOT `nightly-system-audit`
  (daily, 12:09am) — both enabled, both daily, ten minutes apart. Strongest candidate is CLAUDE.md's own
  documented failure mode: *"Tool approvals persist per-task — if the first run needs permission prompts, all
  subsequent runs pause too."* **Concrete ask for Dan: hit "Run now" on `nightly-system-audit` once to clear any
  pending tool-approval prompt, then confirm it fires unattended for 3 consecutive nights.** If the machine is
  simply asleep at 12:09am, consider moving the slot to a time the machine is reliably awake.
- **(carry, reframed 7/26) `wayfinder-data-refresh` is ENABLED and firing but has completed no grinder-write since
  5/10** (`.refresh-state.json` lastRunISO 5/10, totalRuns 2). Not a stopped-task problem — a silent-failure
  problem. Open its run log and look for WebFetch/WebSearch errors, a grinder-write 401
  (`INTERNAL_TASK_TOKEN` mismatch on Render), or a tool-approval pause; the task then exits via its own
  "better to skip a week" guard with no notification. **Also make it emit an explicit "ran but wrote nothing"
  signal** — the current behavior violates CLAUDE.md's Failure-visibility rule. Note 8/16: its `lastRunAt` is
  Tue 8/11, itself a drain artifact, so its true on-schedule cadence is unverified.
- **(carry) The dead-man's-switch remains unbuilt after being proposed on 7/14, 7/15, 7/19, and 7/21.**
  morning-pulse should assert HEAD carries a nightly-audit commit within the last 48h and flag its absence in the
  daily email. Tonight's 20-night gap (7/27-8/15) is the sixth episode and the second-longest; the switch would
  have capped every one of them at ≤1 day of undetected silence. **A nightly that silently stops is worse than no
  nightly, because the absence of alarms reads as "all clear."** morning-pulse is confirmed firing.
- **(carry) How many fabricated entries remain beyond the two flags?** Module coverage is closed (fingerprint + DNS
  now cover all 4 modules). The remaining unknown is entries whose host resolves and whose path is unique but which
  are still fabricated — a real domain plus a plausible-but-wrong deep path, appearing only once. Invisible to
  every mechanical scan; only catchable by live-fetching each `_source` and checking for 404, which is exactly what
  a repaired data-refresh should do on a slow rolling basis.
- **(carry) Should the validators live in the repo?** `validate-changes.js` / `validate-runtime.js` are in Dan's
  local `Wayfinder/` folder, not the repo, so nightly runs cannot download them (404). Moving them to
  `wayfinder/scripts/` would let nightly tasks run the real layer-1/layer-2 gate instead of synthesizing equivalent
  evidence. Small architectural call for Dan.
- **(carry) Production audit — did the Stripe `fsPromises` bug double-credit any real pack purchase?** Grep
  `backend/data/audit/*` for users with multiple `essay_credits_added` events sharing one Stripe `event.id`.
  Beyond what a nightly can do.
- **(carry, 2026-05-10) Wider field-coverage scan for batch-concatenation artifacts.** The URL-hygiene scan only
  checks `url` + `_source`. Do any other `international-*-batch-*` entries carry similar concatenation patterns in
  `provider` or in descriptions with embedded URLs?
- ~~Stripe `markEventProcessed` unawaited call~~ → CLOSED 5/2 (the only async I/O inside already has a `.catch`).
- ~~`verifyToken` token-cache unbounded growth~~ → CLOSED 5/5 via a `!isTokenExpired(...)` filter in
  `buildTokenIndex`. Memory now bounded by active-user count.
- ~~ENOSPC on `/sessions`~~ → CLOSED 6/17 (cleared to 63% and has stayed healthy; 8/16 disk 64%). Workaround
  documented above in case of recurrence.

## RUN HISTORY

> Policy: 14 rows max. Compacted 2026-08-16 (was 41 rows across 16 append-blocks).
> **Archive summary 2026-04-25 → 2026-05-31 (27 runs, condensed):** 9 findings, all fixed — API-surface auth guards
> (4/25), essay refund-without-deduction (4/26), Stripe `fsPromises` undef + 5 program dupes + metadata drift
> (4/27), `normalizeEntry` Rule-1 `_source` backfill (5/3), `tokenIndex` unbounded growth (5/5), Rule-2 backfill
> (5/6), malformed URL in programs.json (5/10), volunteer `/discover-local` phantom cap (5/13), ap-coach `/usage`
> shadowed route (5/15). Everything from 5/16 onward was clean. Full detail preserved in the git history of this
> file and in AUDIT_LOG.md.

| Date | Focus | Found | Fixed | Notable |
|------|-------|-------|-------|---------|
| 2026-06-01 | cost, runtime[static], data, cross-cutting | 0 | 0 | CLEAN 20th/22. Rule-2 net 82 STEADY 14. ENOSPC 5th night. ESCALATION: data-refresh appeared silently dead (missed 5/24+5/31) — later corrected 7/26. |
| 2026-06-02 | cost, runtime[FULL BOOT], data, cross-cutting | 0 | 0 | CLEAN 21st/23. **Boot smoke RESTORED via npm-cache-redirect ENOSPC workaround** — data-health all-clean (1606/1043/1416), all services init, graceful shutdown. Rule-2 net 82 STEADY 15. |
| 2026-06-03 | cost, runtime[FULL BOOT], data, cross-cutting/frontend | 0 | 0 | CLEAN 22nd/24. ENOSPC 7th night, workaround held. Rule-2 net 82 STEADY 16. 18 `_source` spot-checks real. Layer-3 3/3 resolve. |
| 2026-06-17 | cost, runtime[FULL BOOT], data, cross-cutting | 0 | 0 | CLEAN. First run after **13-night blackout (6/4-6/16)**; all 3 auto-push tasks silent. **ENOSPC CLEARED** (63%, first non-100% since 5/28) — native boot. SOFT FLAG: 2 intl-batch entries with templated `/learn/` paths → became the 6/18 finding. |
| 2026-06-18 | cost, runtime[FULL BOOT], data, security&auth deep-sweep | 1 | 0 | **NOT CLEAN — 1 HIGH data finding, ESCALATED not auto-fixed.** ~225 verified program entries carry templated/fabricated `_source` URLs (32 hosts share `/learn/hs-summer`, etc); 2 WebSearch-confirmed fabricated path AND program. Invisible to Rule-1/Rule-2/URL-hygiene. Security deep-sweep clean. |
| 2026-07-14 | cost, runtime[FULL BOOT], data deep (DNS scan + fingerprint x4), cross-cutting | 2 | 0 | **NOT CLEAN — 1 HIGH data + 1 HIGH scheduler.** NEW DNS scan over 1,634 hosts: **37 `_verified:true` entries reference NXDOMAIN hostnames**. 3 WebSearch-confirmed typosquats. Scheduler blackout #2: nightly-audit silent 6/19-7/13 (25 nights) while pii-audit kept firing. |
| 2026-07-15 | cost, runtime[FULL BOOT], data[git-identity + targeted DNS], security surface | 2 carried (0 new) | 0 | **NOT CLEAN (carried).** JSONs bit-identical → confirmed via 7-host targeted resample + live controls rather than re-sweeping. Scheduler recovering (2 consecutive nights). Rule-2 net 82 STEADY. |
| 2026-07-19 | cost, runtime[FULL BOOT], data[git-identity], cross-cutting, scheduler deep-dive | 2 carried (0 new) | 0 | **NOT CLEAN (carried).** 3rd blackout (7/16-7/18, environment-wide). **CORRECTED**: data-refresh first miss was 5/17, not 5/24 — re-derived from source after ~8 weeks of carrying the wrong date. |
| 2026-07-21 | cost, runtime[FULL BOOT], data[git-identity], cross-cutting, scheduler | 2 carried (0 new) | 0 | **NOT CLEAN (carried).** 4th blackout, shortest yet (1 night, 7/20), recovered same-cycle. |
| 2026-07-23 | cost, runtime, data[git-identity], cross-cutting | 0 new (2 carried) | 0 | CLEAN. 3rd consecutive clean-scheduler night. Full native boot (1606/1043/1416), 4 setIntervals bounded, anon cap 5/day, tiers 30/5, CORS allowlist, Stripe sig, 0 shadowed routes across 8 files. |
| 2026-07-25 | cost, runtime[FULL BOOT], data[git-identity], cross-cutting/scheduler | 2 carried (0 new) | 0 | **NOT CLEAN (carried).** Believed pii-audit had missed 2 Saturdays — later corrected 7/26 as a commit-vs-run artifact. Sandbox hiccup: first clone landed unwritable, re-clone fixed. |
| 2026-07-26 | cost, runtime[FULL BOOT], data[git-identity + authoritative DNS re-derive], scheduler[DIRECT MCP read], cross-cutting | 2 carried (0 new) | 0 | **NOT CLEAN (carried)** — 0 new defects but MAJOR scheduler correction. `list_scheduled_tasks` showed data-refresh and pii-audit both **enabled and firing**; the ~15-entry "dead since 5/17" narrative was a commit-cadence misdiagnosis. Escalation #1 sharpened to 28 apex-dead / 13 subdomain-dead / 2 transient-FP. |
| 2026-08-16 | scheduler[DIRECT MCP + cron-consistency], cost, runtime[FULL BOOT], data[git-identity + targeted DNS], cross-cutting, **lessons compaction** | 1 new (2 carried) | 1 (housekeeping) | **NOT CLEAN (carried)** — 0 new code/data defects, but **NEW ROOT-CAUSE FINDING on the blackout series**: 9 tasks with 9 different crons all last-ran within a 4m19s window on 8/15 (clusters of 2/3/3), each hours late, and Sunday-only `data-refresh` last-ran on a **Tuesday** → these are **host-availability gaps + catch-up queue drains**, not task faults. Supersedes 5 episodes of "check the dashboard." Residual: the 8/15 drain fired `daily-platform-audit` but not `nightly-system-audit` (both daily, 10 min apart) → likely a per-task tool-approval pause (CLAUDE.md lesson #4). 6th blackout = 20 nights (7/27-8/15), 2nd longest. Everything else CLEAN: full native boot (1606/1043/1416, 220 AP units/37 exams), SLM `lastWarmAt` ping discipline intact (slm.js:871-872), 4 setIntervals bounded, anon cap 5/day (chat.js:329), tiers 30 auth / 5 anon (chat.js:346), CORS allowlist, Stripe sig prod-reject (stripe.js:295), premium routes gated (essays 8 / ap-coach 17 / fin-aid 14), 0 shadowed routes across 10 files, 5/13 + 5/15 fixes holding (full-handler read). Data panel: drift 0, Rule-1 0, URL-hygiene 0 all 4 modules; programs Rule-2 net 82 STEADY. `intelligence-analytics.js` opus refs interrogated → label defaults, zero API calls, NOT a cost leak. **Lessons file compacted** (41 rows/16 blocks → 14-row table), closing the housekeeping flag carried since 7/19. Markdown-only — validation gate N/A. |
