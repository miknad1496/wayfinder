# wayfinder-esms-grinder — Lessons Learned

> Read at the START of every run. Append takeaways at the END before push.
> This grinder adds verified summer camps + enrichment programs for ELEMENTARY (K-5) and MIDDLE SCHOOL (6-8) students to the existing programs.json database.

## CURRENT CALIBRATION (latest accepted values)

- batch_size: 4-6 entries per run (run 1 hit 5/5)
- typical_run_duration: ~10 min (run 1)
- typical_skip_rate: 0% in run 1 — all candidates landed at high or medium confidence
- last_calibration_change: 2026-04-26 — run 1 confirmed 5/run is comfortable

## EFFECTIVE PATTERNS (validated)

- WA-first metros that work well: **Seattle (museums), Bellevue (children's-museum), Vashon Island (Camp Fire), Orcas Island (YMCA)**.
- ANCHOR ORG TYPES that reliably yield ES/MS programs:
  - **Children's museums** — KidsQuest (Bellevue), Seattle Children's Museum, etc. Most run summer camps for ages 4-10.
  - **Natural-history / science museums** — Burke Museum (Seattle), Pacific Science Center. Day-camps with grade-banded sessions.
  - **YMCA residential camps** — Orkila (Orcas), other YMCA chapters across states. Sliding-scale + financial aid is consistent across YMCAs.
  - **Camp Fire / BGCA / Girl Scouts council camps** — Camp Sealth (Camp Fire CPS) is the WA model. Age-5+ residential.
  - **Pay-what-you-can arts orgs** — Coyote Central (Seattle) is a strong model: 20-21 hr workshops, artist-led, sliding scale.
  - **University youth programs** — already well-covered in existing DB (Robinson Center, UW Engineering, DigiPen).
- WebSearch → Burke / YMCA Seattle pages render plain HTML well via curl. Coyote Central + KidsQuest are Squarespace/Cloudflare; rely on search-result snippets + ACA / external listings to confirm fields.

## FAILED PATTERNS / KNOWN ANTI-PATTERNS

- **Cloudflare-protected sites** (KidsQuest is one) block curl + WebFetch. Workaround: triangulate via search-result snippets + ACA listings + the org's social media.
- **Squarespace sites** (Coyote Central) load content via JS — raw curl returns boilerplate. Same workaround.
- Watch for:
  - Pay-only camps with no scholarship aid — note the cost transparently, don't filter out
  - Camps that closed during/after COVID and never reopened
  - Camps requiring parent membership in another org (note prerequisite)
  - Religious-instruction-required camps (mainline faith camps that welcome non-affiliated kids are fine; explicit catechism camps are different category)

## SOURCE-SPECIFIC NOTES

- **Burke Museum (Seattle)**: Dino Trackers grades 1-3, Paleo Discovery grades 4-6. $100/day session ($90 member). Aftercare $30. URL: burkemuseum.org/education/families-and-youth/camps.
- **Coyote Central**: ages 10-15, $400/$450 program fee, sliding scale (pay-what-you-can). Address: Central District Seattle. Contact: programs@coyotecentral.org / (206) 323-7276.
- **KidsQuest (Bellevue)**: ages 4-10. Cost not on landing page — must email education@kidsquestmuseum.org. Marked medium-confidence with `_unverifiedFields: ["cost","scholarshipAid"]`.
- **YMCA Camp Orkila**: grades 3-12 entering, since 1906. Sliding-scale Price A/Price B. $50 deposit. Registration opens Feb 4, 2026 6 a.m.
- **Camp Sealth (Camp Fire CPS)**: ACA-accredited, ages 5-17, 4-13 day sessions. Cost not on landing — medium confidence.

## DATA QUALITY FLAGS

- Existing `programs.json` schema uses object-shaped `cost` (`{amount, type, display}`) and object `location` (`{city, state}`). Grinder writes both this canonical shape AND task-spec extras (`scope`, `dates`, `scholarshipAid`, `registrationUrl`, `howToStart`, `confidence`). Backward-compatible — extras are ignored by the search route.
- All run-1 entries tagged `_addedBy: "esms-grinder"` for future isolation.

## CALIBRATION SUGGESTIONS

- 5 entries/run is comfortable; could push to 6 if all candidates are well-known anchor orgs. Hold at 5 until first non-WA run.
- Suggest spreading across at least 2 different city/island in WA per run (run 1 used Seattle + Bellevue + Vashon + Orcas — good variety).

## CONFIDENCE TIERS

- `confidence: "high"` — all required fields verified
- `confidence: "medium"` — org clearly real, 1-2 fields couldn't be confirmed publicly. Add `_unverifiedFields: [...]` array. Description appends caveat.
- SKIP — only when org can't be verified or appears defunct

## OPEN QUESTIONS / TODO

- Best way to flag camps requiring district residency vs open-enrollment? (none yet in pool)
- Should we have a separate scholarshipAid (Y/N) field at top level vs inline in description? Currently using both: top-level `scholarshipAid` string AND mention in description.
- Future: hit Galileo Bellevue, Pacific Science Center additional locations (already partially covered), Seattle Children's Theatre, Seattle Aquarium camps, Woodland Park Zoo ZooU, Music Center of the NW.

## DEFERRED CANDIDATES

(empty — all run-1 candidates landed)

## RUN HISTORY

| Date | Run # | Added | Skipped | Focus | Notable |
|------|-------|-------|---------|-------|---------|
| 2026-04-26 | 1 | 5 (3hi/2md) | 0 | WA — Seattle/Bellevue/Vashon/Orcas | KidsQuest (md), Coyote Central (hi), Burke (hi), Camp Orkila (hi), Camp Sealth (md). Bootstrapped progress file + lessons. |
