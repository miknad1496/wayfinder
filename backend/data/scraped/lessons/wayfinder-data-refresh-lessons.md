# wayfinder-data-refresh — Lessons Learned

> Weekly Sunday refresh: research and inject new verified scholarships,
> programs, internships. Read at start, append at end.

## CURRENT CALIBRATION

- frequency: weekly Sunday 9:03am PT
- typical batch: ~5-10 new entries per category per week
- last_calibration_change: 2026-04-26 — initial bootstrap

## EFFECTIVE PATTERNS

- Verifying entries with multiple sources (program homepage + state DOE listing OR USDE listing OR foundation directory) catches expired programs before they pollute the DB.
- Internship and scholarship deadlines in Dec-March are most at-risk of staleness — that's when programs publish/finalize next-year specifics. Re-verify these entries closer to season.

## FAILED PATTERNS

- Don't add scholarships announced "for 2025-26 only" — they're one-cycle, not the kind of recurring program the DB is built for.
- Don't add programs that require parent fundraising or massive participation fees as "free" — note the actual cost tier.

## DATA QUALITY FLAGS

(empty — fill as discovered)

## CALIBRATION SUGGESTIONS

- 5-10 entries/category/week is sustainable for verification quality. If the LLM consistently completes in <20 min, consider going to 12-15.

## OPEN QUESTIONS

- Worth re-verifying old entries (>1 year since last verify) on a rotating cadence?

## RUN HISTORY

(see git log for "Weekly data refresh" commits — most recent: 2026-04-23)

## RUN 1 — 2026-05-03

**Phase**: FL volunteer expansion (1 → 14 entries).
**Outcome**: +13 verified Florida volunteer entries spanning Miami-Dade, Jacksonville, Tampa Bay, Orlando, Stuart, Sanibel, Key Largo, St. Petersburg, statewide. 12 categories covered (animals, environment, education, health, civic, mental_health, leadership, homelessness, arts, disaster, seniors, hunger).

**Top 5 high-impact entries**:
1. Zoo Miami Conservation Teen Scientist — flagship pre-vet/biology pipeline, Miami-Dade.
2. Nicklaus Children's Hospital Teen Volunteer — pediatric pre-med pipeline, 80hr/6mo Miami.
3. Frameworks Teens In Action — Bright Futures-eligible civic engagement, Hillsborough County.
4. Florida Aquarium Junior Camp Counselor — selective marine-bio summer track, Tampa.
5. Sanibel-Captiva Conservation Foundation — sea turtle + reef restoration, SW Florida.

**Process notes**:
- Bootstrapped `.refresh-state.json` (didn't exist before run 1) with comprehensive `gapMap` covering volunteer/internships/scholarships/programs.
- Discovered 3 stale facts in CLAUDE.md (FL covered post-batch-145 was wrong, internship counts outdated, scholarship counts outdated). Logged in `discoveredCorrections`.
- Used direct git push since the scheduled task environment doesn't expose `INTERNAL_TASK_TOKEN`. Watchdog + drift-monitor scheduled tasks follow the same pattern. Single commit, no concurrent writers on Sunday 9am — race-condition risk minimal.
- All 13 URLs verified with curl HEAD or earlier WebSearch surface-text. Two entries (Coral Restoration FF age, FHM age) marked `confidence: medium` with `_unverifiedFields` per the volunteer-grinder skip-rule (since their public pages don't publish explicit age min, but org reputation is robust).

**Effective patterns added**:
- For state-volunteer expansion runs, the highest-leverage urban anchors are: zoo + aquarium teen program, children's hospital junior volunteer, food bank, Habitat affiliate, regional environmental conservation org, marquee museum (Holocaust/history), state-level service commission. ~7-9 entries fall out of these anchors before having to go down a long tail. Repeat formula for GA next.
- Search formulas that worked: `"<state>" zoo aquarium teen volunteer`, `"<state>" children hospital junior volunteer high school`, `"<state>" environment volunteer teen <coastline name>`, `"<state>" Holocaust museum volunteer`, `"<state>" Habitat for Humanity teen youth build`, `<state> AmeriCorps state commission`.

**Next run plan** (May 10): GA volunteer expansion (currently 2 entries). Pre-planned candidates: Atlanta Botanical Garden teen, Georgia Aquarium teen volunteer, Children's Healthcare of Atlanta junior volunteer, Atlanta Mission, Hands On Atlanta, Children's Museum of Atlanta, Atlanta History Center, Trees Atlanta, Captain Planet Foundation, Habitat Atlanta, Volunteer Georgia. Target 10-12 verified entries spanning Atlanta + Savannah + Athens metros.
