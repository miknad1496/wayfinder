# wayfinder-esms-grinder — Lessons Learned

> Read at the START of every run. Append takeaways at the END before push.
> This grinder adds verified summer camps + enrichment programs for ELEMENTARY (K-5) and MIDDLE SCHOOL (6-8) students to the existing programs.json database.

## CURRENT CALIBRATION (latest accepted values)

- batch_size: 4-6 entries per run
- typical_run_duration: TBD (no runs yet)
- typical_skip_rate: TBD
- last_calibration_change: 2026-04-26 — initial bootstrap

## EFFECTIVE PATTERNS (seeded — runs should validate)

- Big anchor sources for ES/MS camps:
  - **YMCA / Camp Fire / Boys & Girls Club** — chapters in nearly every metro
  - **Local university youth programs** — UW Robinson Center, CTY at JHU
  - **Galileo Learning** (Bay Area + Bellevue/Seattle expansion) — STEAM camps
  - **iD Tech** at universities nationwide — tech/coding camps for ages 7-19
  - **Camp Invention** (National Inventors Hall of Fame) — STEM, ages K-6
  - **Pacific Science Center camps** (Seattle)
  - **Local museums & science centers** — most have summer camps for ages 5-13
  - **Local arts orgs** — children's theaters, music schools, art studios
  - **District-run summer programs** — most school districts offer summer enrichment
- Search templates:
  - `"[city] summer camps" elementary 2026`
  - `site:ymca.net "[city]" summer camp`
  - `"[city] children's museum" summer camp`
  - `site:[district].org summer enrichment`

## FAILED PATTERNS / KNOWN ANTI-PATTERNS

(empty — fill as discovered)

Watch for:
- Pay-only camps with no scholarship aid — note the cost transparently, don't filter out
- Camps that closed during/after COVID and never reopened
- Camps requiring parent membership in another org (note prerequisite)
- Religious-instruction-required camps (mainline faith camps that welcome non-affiliated kids are fine; explicit catechism camps are different category)

## SOURCE-SPECIFIC NOTES

(empty)

## DATA QUALITY FLAGS

(empty)

## CALIBRATION SUGGESTIONS

- First run: 4-6 entries to test verification depth. ES/MS camps need cost + scholarship aid + grade range + dates verified — more fields than typical HS programs.

## CONFIDENCE TIERS (same model as volunteer grinder)

- `confidence: "high"` — all required fields verified
- `confidence: "medium"` — org clearly real, 1-2 fields couldn't be confirmed publicly. Add `_unverifiedFields: [...]` array. Description appends caveat.
- SKIP — only when org can't be verified or appears defunct

## OPEN QUESTIONS / TODO

- Best way to flag camps requiring district residency vs open-enrollment?
- Should we have a separate scholarship-aid-available field (Y/N) or inline in description?

## DEFERRED CANDIDATES

(empty)

## RUN HISTORY

| Date | Run # | Added | Skipped | Focus | Notable |
|------|-------|-------|---------|-------|---------|
