# Full System Audit — Session Report
**Date:** 2026-04-09
**Focus Area:** Essay Review Pipeline (deep dive) + known HIGH carryovers (H-13 fetch timeouts) + quick-win frontend password hint fix

## Run Summary
Performed a deep audit of the essay review pipeline (`backend/routes/essays.js`, `backend/services/essay-reviewer.js`, and mount points in `server.js`). Found several reliability and performance issues in the `/history` and `/drafts/:essayType` endpoints (full-directory sequential scans, no pagination, no input bounds), missing input validation on `targetSchool`/`prompt` parameters, and a minor fragility in the LLM JSON parser when the model wraps output in a markdown code fence. Also fixed the known HIGH issue H-13 (external GitHub fetches without timeouts in demographics/financial-aid/timeline) which can hang Express workers if GitHub is slow, and closed a long-standing quick-win: the signup/reset-password HTML placeholders still claimed "6+ characters" while the backend enforces 8+.

## Key Findings

### Essay Pipeline
1. **No input length validation on `targetSchool` and `prompt`** (essays.js POST /review) — these strings are concatenated into the Claude prompt and one also feeds the knowledge-injection section extractor. A 1MB `targetSchool` would bloat the prompt and waste credits/tokens. `essayType` was also not type-checked.
2. **`/history` and `/drafts/:essayType` scan every review file on disk sequentially** for every request and for every user. Each handler did `for (file of files) await readFile(...)`, which serializes I/O and grows linearly with *all* users' reviews (not just the caller's). No pagination either — a user (or attacker) with enough reviews could hold a worker for seconds.
3. **Markdown code fence fragility in `essay-reviewer.js`** — the JSON matcher `text.match(/\{[\s\S]*\}/)` happens to survive ```json code fences in practice (it picks the first `{` to last `}`), but `JSON.parse` still trips if the fenced output contains stray characters after the final `}`. Stripping fences first makes recovery strictly more robust.
4. **Recovery branch in parser** on line ~570 returns `success:true` with default `hasHook/hasNarrative/hasReflection = false`; caller's guard `typeof result.review.overallScore !== 'number'` correctly catches the only bad case — OK as-is.
5. **Rate limiting + credit lock are already in place** (`expensiveLimiter` on POST /review, `withCreditLock()` in auth.js) — previous audits covered these.
6. **Path traversal on `/review/:id`** — already guarded by `sanitizeReviewId()` plus owner check. Good.
7. **History endpoint return shape change** — previously `{ reviews }`, now `{ reviews, total }` with a 100-item cap. Frontend `renderEssayHistory()` consumes `reviews` array, so backward compatible.

### External Fetch Timeouts (H-13 — was OPEN from Apr 7)
GitHub-raw fallback fetches in `demographics.js:61`, `financial-aid.js:159`, and `timeline.js:45` had no `AbortController` timeout. Under GitHub degradation all three could hang an Express worker indefinitely.

### Frontend Quick Win
`frontend/index.html` lines 689 and 724 still had `"6+ characters"` placeholder text for the signup and password-reset forms while the backend (and the inline JS validator in app.js:1451) enforces 8+ chars with a letter and number. Users would type "hello12", get rejected, and be confused.

## Changes Made

### `backend/routes/essays.js`
- **POST /review**: Added bounds checks — `targetSchool` ≤ 200 chars, `prompt` ≤ 2000 chars, `essayType` must be a string if provided. Returns 400 with a clear message on violation.
- **GET /history**: Added `?limit` query param (default 100, max 200, min 1). Parallelized per-file JSON reads with `Promise.all(files.map(...))` so disk I/O runs concurrently. Returns `{ reviews: [...], total: N }` so the UI can still display the true count.
- **GET /drafts/:essayType**: Added `essayType` string-type and length-bound check. Parallelized reads with `Promise.all` to match `/history`.

### `backend/services/essay-reviewer.js`
- Added markdown code-fence stripping (```json and plain ```) before the JSON regex match, improving parse recovery when the model disregards the "Always return valid JSON, nothing else" directive and wraps in a fence.

### `backend/routes/demographics.js` / `financial-aid.js` / `timeline.js` (H-13)
- Wrapped the GitHub-raw fallback `fetch()` in each file with an `AbortController` + `setTimeout(..., 5000)` and proper `finally { clearTimeout }` cleanup. Any GitHub outage now fails fast instead of hanging the worker.

### `frontend/index.html`
- Lines 689 and 724: Updated password placeholder text from `"(6+ characters)"` to `"(8+ chars, letter and number)"` to match actual backend validation rules.

## Issues Found But NOT Fixed
- **`/history` and `/drafts` still O(all reviews on disk)**: Parallelization helps constant factor but not asymptotic cost. The proper fix is a per-user index (e.g., `essay-reviews/<userId>/<reviewId>.json` or a DB table). Deferred — larger refactor, touches data layout and inject path.
- **Unbounded `Promise.all` concurrency**: With thousands of review files, this could momentarily open many FDs. Low risk at current scale; could use `p-limit` later.
- **Carried over from prior audits**: C-4 (Stripe customer-ID index), C-5/H-16 (metadata count drift), H-1 (persistent webhook idempotency), H-2 (max_tokens on some Claude calls — essay-reviewer is fine, has `max_tokens: 3500`), H-3, H-4, H-5, H-6, H-10 (scholarship states), H-11 (4 multi-state programs), H-12, H-14 (JSONL injection), H-15 (34 internships with invalid `_source`), H-17 (applicationFormat filter 6.6% populated), M-18 (admin limit cap), M-19, M-23 (env var startup validation), L-10..L-13.

## Security/Vulnerability Notes
- **New input validation** on `targetSchool`/`prompt` closes a minor resource-exhaustion / prompt-bloat vector on the expensive essay-review endpoint. Not exploitable for data exfil, but limits wasteful token spend.
- **Fetch timeouts** (H-13) materially reduce DoS risk from GitHub downtime.
- No new vulnerabilities introduced; all changes are additive bounds checks or idiomatic async refactors.

## Code Health Assessment
- `backend/routes/essays.js` is well-organized (~375 lines), with good separation of concerns and solid error handling including credit refund on all failure paths. The main lingering concern is storage scalability — as review count grows, per-request full directory reads will dominate latency. Worth budgeting for a user-scoped file layout or a tiny SQLite index soon.
- `backend/services/essay-reviewer.js` is sophisticated — 6-file core brain + 4-file deep knowledge injection, timeout protection, graceful parse recovery, analytics recording, credit lock. The knowledge injection is already rich; the CLAUDE.md note about "feedback feels generic" should be revisited now that deep knowledge IS being injected (that TODO may be stale).
- External-fetch fallback pattern is consistent across demographics/financial-aid/timeline; a shared helper like `fetchWithTimeout(url, ms)` would DRY this up — leave for a future cleanup pass.

## Flags & Warnings
- None. No expiring credentials or approaching quotas observed in audited files.

## Unresolved Items
- **Review storage re-architecture** (O(N) scan on every /history hit) — deferred pending reviewer input.
- **CLAUDE.md TODO freshness check**: The file lists "Feedback feels generic — 16 deep files NOT used" as a known gap, but `essay-reviewer.js` *does* inject 4 of them (`failure-patterns`, `scoring-calibration`, `edge-case`, `supplement-mastery`) via `loadDeepKnowledge()`. CLAUDE.md should be updated to reflect current state (not modified this pass to avoid drift from user-authored docs).
- All carryover issues from Apr 4–7 audits except H-13.

## Suggestions for Next Run
- **Data Integrity sprint** (H-10, H-15, H-16, H-17) — this area has been repeatedly flagged and is ripe for a single focused batch fix.
- **Review storage user-scoping** — small refactor: namespace reviews by userId subdirectory so history scans are O(user's own reviews).
- **Shared `fetchWithTimeout` helper** — consolidate the now-three copies of the AbortController pattern.
- **C-4 (Stripe customer ID index)** — critical-tagged carryover that still needs architectural attention.

## Git Status
- **Branch**: main
- **Files changed**: 6 — `backend/routes/essays.js`, `backend/services/essay-reviewer.js`, `backend/routes/demographics.js`, `backend/routes/financial-aid.js`, `backend/routes/timeline.js`, `frontend/index.html`, plus this session report.
- **Commit message**: "Full system audit (essay pipeline): input bounds, parallel history, fetch timeouts (H-13), pw hint fix"
