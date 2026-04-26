# wayfinder-k12-grinder — Lessons Learned

> Read at the START of every run. Append takeaways at the END before push.

## CURRENT CALIBRATION (latest accepted values)

- batch_size: 8 schools (current setting in prompt)
- typical_run_duration: 12-20 min (Run 10 ~10 min — batched parallel WebSearch is fast for clusters of district-grouped schools)
- typical_skip_rate: ~25% structural; can spike to 60%+ when batch overlaps with manually-entered schools
- last_calibration_change: 2026-04-26 — Run 11 confirmed batch_size=8 sustainable; Bethel/Blaine/Bremerton district cluster verified 6/6 in ~5 WebSearches

## EFFECTIVE PATTERNS (use these — they work)

- For principal names when official site fails: `site:[district domain] "[school name]" principal` works well (e.g. site:lwsd.org, site:kent.k12.wa.us, site:bisd303.org)
- WebSearch result snippets often have the data (enrollment, principal, AP count) and the article URL itself is small enough to WebFetch even when the school's homepage is too large.
- US News K-12 ranking pages: too large to WebFetch directly, but the ranking number is in WebSearch snippets.
- For demographics + enrollment: NCES Public School Search (`https://nces.ed.gov/ccd/schoolsearch/school_detail.asp?ID={ncessch}`) is the most parseable single source.
- Niche.com pages parse cleaner than US News for ratings.
- **NEW (Run 9):** BSD405 (and other Finalsite-hosted district sites) staff pages return >100KB but are searchable via Python: load the JSON tool-result file, find anchor like "Principal - {School Name}" and extract the `<h3 class="fsFullName">` 200-400 chars before. Worked first try for 3/3 BSD principals (Drew Thomas / Russell White / Bethany Spinler).
- **NEW (Run 9):** When a `web_fetch` returns "exceeds maximum allowed tokens" but **saves to a file**, treat that file as a parseable artifact — `python3` regex over the saved file (in `~/.claude/projects/.../tool-results/*.txt`) recovers data without retrying the fetch.

- **NEW (Run 10):** **Cluster batches by district when possible.** Run 10's batch was 4 Bellingham SD schools + 2 Bethel SD schools — single `site:[district].org "[School]" principal` queries returned principal + AP courses + grad rate in one snippet for each. Net: 6/6 verified in <10 min using only WebSearch (no WebFetch needed).
- **NEW (Run 10):** **Niche.com k12 pages return clean snippets for AP enrollment %, AP pass %, student-teacher ratio, demographics in WebSearch results** without needing to fetch the full page. Standard query: `"[School]" [city] enrollment AP courses graduation rate`.

- **NEW (Run 11):** **For CTE/Skills Centers**, use `"[Skills Center]" director programs CTE` rather than `"[School]" principal` — the role title is "Director", and the programs query also surfaces the program list in a single search snippet (e.g. PCSC's 17 CTE pathways).
- **NEW (Run 11):** **For franchise alt-recovery schools (Acceleration Academies)**, the parent org's site (`accelerationacademy.org/[district]`) carries hours, eligibility, and enrollment criteria; the district programs page (`bethelsd.org/programs/...`) carries the local context. Together they constitute ≥3 verified fields without needing a principal name (typical credit-recovery program is run by a partner-org "Academy Director", not a traditional principal).

## FAILED PATTERNS / KNOWN ANTI-PATTERNS (don't repeat)

- Don't retry WebFetch on the same URL after a "file too large" error — it'll fail again. Switch to WebSearch immediately.
- Don't process schools with enrollment <50 — they're typically alternative/reentry programs with no useful enrichment data and the NCES record is often a placeholder.
- Don't waste a slot on tribal schools at this stage — NCES data is sparse and most don't have public-facing websites with the fields we need.
- Avoid Wikipedia for K-12 schools — pages are usually too large and the encyclopedic content is rarely a current source for principal/enrollment/scores.
- **NEW (Run 9):** Don't `cat <<HEREDOC` write large JSON to `/tmp/` — `/tmp` is a tiny tmpfs (100% full from prior session caches) and the write silently fails with "No space left on device". Write to `/sessions/nifty-confident-bardeen/` instead (~6GB free). Same trap for git clone — clone target must be on `/sessions`, not `/tmp` or `/var/tmp`.
- **NEW (Run 9):** Don't `rm -rf /tmp/wayfinder` — old clones from prior sessions are owned by `nobody:nogroup` and the current user can't unlink them. Use a fresh clone path under `/sessions/nifty-confident-bardeen/wfclone-$$` instead.
- **NEW (Run 9):** Don't clone into `/sessions/.../mnt/outputs/` — that mount is fuse-virtiofs and git's atomic ops fail with `unable to unlink '.git/config.lock': Operation not permitted`. The native `/sessions/` ext4 mount works fine.

- **NEW (Run 11):** Don't `rm -rf /tmp/wayfinder` even with the Run 9 workaround in mind — the *current* session's `/` filesystem hit 100% from old session caches across many `wf-*` and `wayfinder-*` dirs owned by `nobody:nogroup`. Skip `/tmp` entirely and clone to `/sessions/[session-id]/wfclone-$$` from the start. (`/sessions` ext4 had 6.2GB free vs 16MB on `/`.)
- **NEW (Run 11):** When NCES's `enrollment.total = 0` (Morgan Center School in Bremerton SD this run), it almost always means a placeholder/recently-closed/internal-only record — fast-skip without research, like the <50 enrollment rule.

## SOURCE-SPECIFIC NOTES

### URLs / domains that hit "too large for inline parsing"
- `bhs.bisd303.org/*` (~700KB)
- US News k12 pages (~600-800KB)
- Wikipedia school pages (commonly >50KB)
- Many large district homepages (Seattle Public Schools homepage, Bellevue School District landing)
- Pattern: any official school homepage with photo galleries / embedded calendars
- BSD405 Finalsite staff pages (`*.bsd405.org/our-school/staff`, `*.bsd405.org/our-school/contact-us`) — 100-130KB; saves to file, parseable via grep/python (see EFFECTIVE PATTERNS above)
- BSD405 school profile PDFs (`resources.finalsite.net/.../*Profile*.pdf`) — 230KB-560KB; binary PDF, low yield from inline grep

### High-yield search query templates
#### NEW (Run 11) — high-yield templates added
- CTE / Skills Centers: `"[Skills Center name]" director programs CTE` — returns director + program list in one snippet.
- Recovery / alt-academy franchises: combine `"[School]" [district]` (general) + `"[School]" [city] niche student teacher ratio` (Niche stats) for full coverage in 2 searches.


- Principal: `site:[district].org "[School]" principal`
- Enrollment: `"[School]" Washington enrollment 2024 OR 2025`
- AP courses: `"[School]" "Advanced Placement" courses count`
- Test scores: `[School] Washington state report card`
- Magnet / lottery school context: `"[School]" magnet OR lottery [city] enrollment` (Run 9 found Intl School curriculum + lottery rules in 1 query)

## DATA QUALITY FLAGS DISCOVERED

- 2026-04-26: **Summit Olympus, Tacoma** appears to have CLOSED at the end of 2024-25 per WA Charter Commission. Recorded with `schoolStatus: "closed_2025"` so the frontend can filter. Going forward: when adding charter schools, do a quick "[school] charter commission [state] status" check.
- 2026-04-26: NCES placeholders for "Renton Technical HS" (5 students) and "Ella Baker HS" (Open Doors reentry, 88 students) — confirm enrollment >50 before spending an enrichment slot on a school.
- 2026-04-26 (Run 9): **Duplicate-with-manual-entries problem.** Bellevue HS, Interlake, and Newport were already in `enriched.json` (manual entries from Run 4) but the NCES queue at offset 65-67 hit them again, wasting 3/8 slots. Future runs should run a `name-in-existing-enriched` pre-filter before counting toward batch size, OR the next prompt iteration should pre-skip dups and pull from the next NCES rows to maintain net-8 enrichments.

- 2026-04-26 (Run 11): **NCES `enrollment.total = 0` records.** Morgan Center School (Bremerton SD, ncessch 530066001751) has total=0 — the school's NCES record exists but it's effectively a programmatic placeholder (no enrollment, possibly admin-only). Adding to the auto-skip list alongside `<50 enrollment` and `tribal placeholder` filters.
- 2026-04-26 (Run 11): **Acceleration Academy** is a national franchise model — local entries here may have no traditional principal field. Schema accepts this since `_sources` has 3+ live verified URLs and we have website/enrollment/student-teacher-ratio (3 of 4 REQUIRED).

## CALIBRATION SUGGESTIONS FROM PAST RUNS

- Batch size 8 is the current setting and seems sustainable. Run 7 reported "WebFetch hit 'file too large' wall on 2 of 8 sites" — workaround via WebSearch handled it without dropping enrichment quality.
- The grinder is currently advancing offset by 8 even when 2-3 are skipped. Consider whether to keep advancing the cursor (current behavior — moves through the queue faster but leaves gaps) vs. only advancing the cursor by `verified` count (more thorough but slower). **Current consensus: advancing by 8 is correct** — skipped schools are typically structurally low-yield and not worth re-attempting later.
- **NEW (Run 11, replaces Run 10 suggestion):** Run 11 mirrored Run 10 — 6/6 verified across 3 districts (Bethel + Blaine + Bremerton) using WebSearch only, ~5 min wall clock for research. Batch_size=8 is the sweet spot; the natural alphabetical-by-city NCES ordering keeps clustering automatic. Recommend keeping batch_size=8 for at least one more WA-high run before considering a bump. **Open follow-up:** the dedup-against-existing-enriched pre-filter (Run 9's proposal) is still unimplemented at the prompt level — it didn't bite this run, but will at offsets ~95+ where Run 4's manual additions cluster.

- **NEW (Run 10, retained):** Run 10 hit a clean district-cluster (Bellingham SD + Bethel SD) and verified 6/6 with no dups in ~10 min. Validates that **clustering by district** is the right batch-selection heuristic when the queue allows it. Strong recommendation for next prompt iteration: when `findRaw`/batch-selection returns a sequential window, look ahead for district groupings and prefer 6-8 schools across 1-3 districts over 8 schools spread across 8 districts. Until prompt formalizes this, the natural NCES alphabetical-by-city ordering already groups districts well, so business-as-usual works.
- **NEW (Run 9 — kept for reference):** Run 9 produced only 3 enrichments because 3 dups + 2 alt-program skips ate the batch. Two viable next-run tweaks: (a) **pre-dedup pass** — at batch-selection time, scan candidates against the existing `enriched.json` name set; advance past dups silently and pull additional NCES rows to keep net target = 8 enrichments. (b) **Bump batch_size to 10** for the WA-high tail since most remaining entries are processable. Recommend (a) — preserves data quality, addresses the actual blocker. **Proposed prompt change for next iteration:** add step "When selecting batch, skip names already present in enriched.json (count as 'pre-dedup', not 'skipped'); advance offset until net target = batch_size processable schools." Until prompt changes, this run advanced offset only by 8 per current rule.

## OPEN QUESTIONS / TODO FOR FUTURE RUNS

- Worth normalizing rating fields across US News / Niche / GreatSchools to a unified 1-10 scale? Currently each entry stores source + scale separately.
- A handful of WA private schools (Lakeside Upper School, etc.) appear in NCES dataset but with limited public data — should we deprioritize private schools in this grinder, since they're less searchable in our typical sources?
- Should the grinder annotate magnet/STEM/IB designation as a separate top-level field (currently buried in `notablePrograms`)? Run 9 added `admission` and tagged `magnet: true / magnetProgram: true` for International School — propose making `admission` and `magnetProgram` first-class top-level fields in the schema.
- The 32 prior manual entries don't have stable ncessch keys aligned with the NCES dump (some used different IDs). Worth a one-time backfill script to reconcile so future dedup checks can match on ncessch instead of name.

## RUN HISTORY (most recent 10 runs — older entries get summarized + pruned)

| Date       | Run # | Verified | Skipped | Notable                                                                                                |
|------------|-------|----------|---------|--------------------------------------------------------------------------------------------------------|
| 2026-04-26 | 11    | 6        | 2       | WA high offsets 80-87 (Bethel + Blaine + Bremerton SD cluster). 6/6 verified (Challenger HS, Graham Kapowsin HS, Pierce County Skills Center, Acceleration Academy, Blaine HS, Bremerton HS). 2 skipped (Blaine Re-Engagement enr=13 alt; Morgan Center enr=0 placeholder). All-WebSearch run, ~5 min research wall-clock. |
| 2026-04-25 | 10    | 6        | 2       | WA high offsets 72-79 (Bellingham SD + Bethel SD cluster). 6/6 verified, 2 skipped (Visions enr=13, Bellingham Re-Engagement alt). District-cluster batching = fast. |
| 2026-04-26 | 9     | 3        | 5       | 3/5 skips were dups w/ manual entries (Bellevue HS, Interlake, Newport); 2 alt-program <50 skips. Discovered fuse mount + /tmp full traps. |
| 2026-04-26 | 8     | 7        | 1       | Battle Ground / Prairie / Summit View / Lumen / Whatcom batch; 1 alt placeholder skipped              |
| 2026-04-26 | 7     | 6        | 2       | WebFetch failed on 2 sites; site:domain workaround OK                                                  |
| 2026-04-26 | 6     | 8        | 0       | All 8 enriched; no issues                                                                              |
| 2026-04-26 | 5     | 7        | 1       | One charter placeholder skipped                                                                        |
| (earlier runs summarized in next compaction pass) | | | | |
