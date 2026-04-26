# wayfinder-k12-grinder — Lessons Learned

> Read at the START of every run. Append takeaways at the END before push.

## CURRENT CALIBRATION (latest accepted values)

- batch_size: 8 schools (current setting in prompt)
- typical_run_duration: 18-25 min
- typical_skip_rate: ~25%
- last_calibration_change: 2026-04-26 — initial setup; bootstrap from runs 1-7

## EFFECTIVE PATTERNS (use these — they work)

- For principal names when official site fails: `site:[district domain] "[school name]" principal` works well (e.g. site:lwsd.org, site:kent.k12.wa.us, site:bisd303.org)
- WebSearch result snippets often have the data (enrollment, principal, AP count) and the article URL itself is small enough to WebFetch even when the school's homepage is too large.
- US News K-12 ranking pages: too large to WebFetch directly, but the ranking number is in WebSearch snippets.
- For demographics + enrollment: NCES Public School Search (`https://nces.ed.gov/ccd/schoolsearch/school_detail.asp?ID={ncessch}`) is the most parseable single source.
- Niche.com pages parse cleaner than US News for ratings.

## FAILED PATTERNS / KNOWN ANTI-PATTERNS (don't repeat)

- Don't retry WebFetch on the same URL after a "file too large" error — it'll fail again. Switch to WebSearch immediately.
- Don't process schools with enrollment <50 — they're typically alternative/reentry programs with no useful enrichment data and the NCES record is often a placeholder.
- Don't waste a slot on tribal schools at this stage — NCES data is sparse and most don't have public-facing websites with the fields we need.
- Avoid Wikipedia for K-12 schools — pages are usually too large and the encyclopedic content is rarely a current source for principal/enrollment/scores.

## SOURCE-SPECIFIC NOTES

### URLs / domains that hit "too large for inline parsing"
- `bhs.bisd303.org/*` (~700KB)
- US News k12 pages (~600-800KB)
- Wikipedia school pages (commonly >50KB)
- Many large district homepages (Seattle Public Schools homepage, Bellevue School District landing)
- Pattern: any official school homepage with photo galleries / embedded calendars

### High-yield search query templates
- Principal: `site:[district].org "[School]" principal`
- Enrollment: `"[School]" Washington enrollment 2024 OR 2025`
- AP courses: `"[School]" "Advanced Placement" courses count`
- Test scores: `[School] Washington state report card`

## DATA QUALITY FLAGS DISCOVERED

- 2026-04-26: **Summit Olympus, Tacoma** appears to have CLOSED at the end of 2024-25 per WA Charter Commission. Recorded with `schoolStatus: "closed_2025"` so the frontend can filter. Going forward: when adding charter schools, do a quick "[school] charter commission [state] status" check.
- 2026-04-26: NCES placeholders for "Renton Technical HS" (5 students) and "Ella Baker HS" (Open Doors reentry, 88 students) — confirm enrollment >50 before spending an enrichment slot on a school.

## CALIBRATION SUGGESTIONS FROM PAST RUNS

- Batch size 8 is the current setting and seems sustainable. Run 7 reported "WebFetch hit 'file too large' wall on 2 of 8 sites" — workaround via WebSearch handled it without dropping enrichment quality. **No batch-size change recommended yet.**
- The grinder is currently advancing offset by 8 even when 2-3 are skipped. Consider whether to keep advancing the cursor (current behavior — moves through the queue faster but leaves gaps) vs. only advancing the cursor by `verified` count (more thorough but slower). **Current consensus: advancing by 8 is correct** — skipped schools are typically structurally low-yield and not worth re-attempting later.

## OPEN QUESTIONS / TODO FOR FUTURE RUNS

- Worth normalizing rating fields across US News / Niche / GreatSchools to a unified 1-10 scale? Currently each entry stores source + scale separately.
- A handful of WA private schools (Lakeside Upper School, etc.) appear in NCES dataset but with limited public data — should we deprioritize private schools in this grinder, since they're less searchable in our typical sources?
- Should the grinder annotate magnet/STEM/IB designation as a separate top-level field (currently buried in `notablePrograms`)?

## RUN HISTORY (most recent 10 runs — older entries get summarized + pruned)

| Date       | Run # | Verified | Skipped | Notable                                               |
|------------|-------|----------|---------|-------------------------------------------------------|
| 2026-04-26 | 7     | 6        | 2       | WebFetch failed on 2 sites; site:domain workaround OK |
| 2026-04-26 | 6     | 8        | 0       | All 8 enriched; no issues                              |
| 2026-04-26 | 5     | 7        | 1       | One charter placeholder skipped                        |
| (earlier runs summarized in next compaction pass) | | | | |
