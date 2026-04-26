# wayfinder-volunteer-grinder — Lessons Learned

> Read at the START of every run. Append takeaways at the END before push.

## CURRENT CALIBRATION (latest accepted values)

- batch_size: 4 entries (run 2 completed 4-of-4 verified in ~10 min — sustain at 4-5)
- typical_run_duration: ~10-15 min for 4 entries
- typical_skip_rate: 1-of-5 (Ballard Food Bank skipped — couldn't confirm age min from official page)
- last_calibration_change: 2026-04-26 — run 2

## EFFECTIVE PATTERNS

- VolunteerMatch.org and Idealist.org are useful aggregator search sources
- Local United Way chapters typically have program listings under "Volunteer" or "Get Involved"
- `site:[city].gov "youth" volunteer` finds municipal teen programs
- For health-sector volunteering: `"[hospital]" "junior volunteer" OR "teen volunteer"`
- For environmental: `"[park / land trust]" volunteer days teens`
- **NEW (run 2):** Major regional museum/aquarium teen-corps programs (Pacific Science Center Discovery Corps, Seattle Aquarium YOA, Woodland Park Zoo Teen Volunteer) are excellent verified entries — sustained for decades, structured cohorts, cited in college-prep guides. Search formula: `"[museum/aquarium]" "teen volunteer" OR "youth advocate"` then verify on the org's own /volunteer/ page.
- **NEW (run 2):** Library systems (KCLS) offer well-documented teen volunteer pages with explicit age ranges. Search: `"[library system]" teen volunteer program`.
- **NEW (run 2):** Hopelink-style multi-program social service nonprofits (regional United Way affiliates, county food bank coalitions) consolidate many volunteer roles — one DB entry can cover warehouse / food market / home delivery / weekly community dinners.
- **NEW (run 2):** State-based environmental/trail orgs (Washington Trails Association) run hundreds of work parties per year — strong for "leadership / outdoor stewardship" angle. Search: `"[state] trails association"`, `"[state] conservation corps"`.

## FAILED PATTERNS / KNOWN ANTI-PATTERNS

- Programs that look national but are actually defunct local chapters (verify the chapter is still active by looking for events in the last 6 months)
- Pay-to-volunteer programs ("send your teen to Bali to teach English for $4,500") — voluntourism, NOT a fit
- One-off events (Susan G Komen 5K) — DB is for sustained recurring programs only
- Faith-based programs that require religious affiliation as a participation requirement (note when this applies, but most welcome non-affiliated volunteers)
- **NEW (run 2):** Squarespace-built nonprofit volunteer pages (e.g. Ballard Food Bank) often omit the age minimum on the public page. If after fetching the official volunteer page no age policy is stated, SKIP rather than guess — the prompt explicitly says skip if any required field can't be confirmed. (For Ballard Food Bank specifically, age policy may be on a sub-page or in the application form — worth a deeper crawl in a future run.)

## SOURCE-SPECIFIC NOTES

- `wta.org/get-involved/volunteer/questions` — comprehensive FAQ with explicit age policy (10+, <14 with adult, <18 parent sign-in). Reliable single-fetch verification.
- `seattleaquarium.org/act-for-the-ocean/volunteer/youth-ocean-advocates/` — clean structured page listing tiers, eligibility, application timeline. Reliable.
- `hopelink.org/ways-to-help/volunteer/` — explicit age policy (16+, some 18+) and 2025 hours stat (61,730) on the page itself.
- `kcls.org/news/teen-volunteer-program-tvp/` — narrative news article rather than a structured volunteer page. Useful for verifying program existence and origin date; for explicit age info also reference `kcls.org/faq/volunteer/` (14+ for some roles, 18+ for others).
- **TODO:** check if Ballard Food Bank's volunteer application form (linked from /volunteer page) discloses age min — try a deeper crawl next time.

## DATA QUALITY FLAGS DISCOVERED

- Hopelink, KCLS, Seattle Aquarium YOA, and WTA are all "scope": "state" rather than "national" — but their reach is regional (Puget Sound or all-WA), not single-city. Confirmed appropriate per the existing schema.

## CALIBRATION SUGGESTIONS FROM PAST RUNS

- Run 2 added 4 verified WA entries (skipped 1) — runtime well within budget. **Recommend stay at 4-5 next run.**
- After 2 runs WA queue is at 9/30. At ~4 entries/run that's 5-6 more WA runs to complete the queue. Consider clustering by metro: run 3 should focus on Tacoma + Spokane (less coverage so far) before returning to Seattle/Bellevue.
- **Pre-filter recommendation:** before researching, check the existing DB for the candidate organization name to avoid spending time on duplicates. Implemented as a Python `existing_names` dedupe in run 2 — keep this pattern.

## OPEN QUESTIONS / TODO FOR FUTURE RUNS

- For state-priority entries (WA target 30): cluster by metro for efficiency? Doing all Seattle entries before moving to Tacoma may compound source familiarity.
- How to track "this program was verified active as of X date" so we know to re-verify after some time? The `_verifiedDate` field already serves this — consider a lightweight stale-checker that re-verifies entries older than 12 months.
- Web fetches return huge HTML payloads (>200KB common) and exceed the response-size limit; the workaround is reading from the saved file and stripping with regex. Consider adding a small helper script in a future run.
- Bellevue / Eastside still has gaps: Eastside Catholic / LifeWire / The Sophia Way (women's housing) / Renewal Food Bank — all candidates for run 3.
- Tacoma not yet touched: Emergency Food Network, Tacoma Rescue Mission, Point Defiance Zoo & Aquarium teen programs are obvious starters.

## RUN HISTORY

| Date | Run # | Added | Skipped | Focus | Notable |
|------|-------|-------|---------|-------|---------|
| 2026-04-25 | 1 | 5 | ? | WA (Seattle) | Initial WA cohort: FareStart, Pacific Science Center Discovery Corps, Seattle Humane, EarthCorps, Treehouse |
| 2026-04-26 | 2 | 4 | 1 | WA (Eastside + Seattle + state) | Hopelink, Seattle Aquarium YOA, KCLS TVP, WTA. Ballard Food Bank skipped — couldn't confirm age min from /volunteer page. |
