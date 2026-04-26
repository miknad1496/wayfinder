# wayfinder-esms-grinder — Lessons Learned

> Read at the START of every run. Append takeaways at the END before push.
> This grinder adds verified summer camps + enrichment programs for ELEMENTARY (K-5) and MIDDLE SCHOOL (6-8) students to the existing programs.json database.

## CURRENT CALIBRATION (latest accepted values)

- batch_size: 5 entries per run (run 3 stepped outside Seattle into secondary WA metros; held at 5; 0 skips)
- typical_run_duration: ~10 min
- typical_skip_rate: 0% (runs 1-3)
- last_calibration_change: 2026-04-26 — held at 5/run for first non-Seattle batch; consider returning to 6 next run since 0 skips again

## EFFECTIVE PATTERNS (validated)

- WA-first metros that work well: **Seattle (museums/aquarium/zoo/theater/music), Bellevue (children's museum, Galileo), Vashon Island (Camp Fire), Orcas Island (YMCA), Tacoma (Point Defiance Zoo)**.
- **Secondary WA metros now confirmed productive (run 3)**: Bellingham (Whatcom Family YMCA), Bainbridge Island (IslandWood, KiDiMu), Vancouver WA (City Parks & Rec). Each city yielded 1-2 high/medium-confidence entries on first pass. Bellevue (Music Works Northwest) is also still mining well beyond Galileo + KidsQuest.
- ANCHOR ORG TYPES that reliably yield ES/MS programs:
  - **Children's museums** — KidsQuest (Bellevue), Seattle Children's Museum, etc. Most run summer camps for ages 4-10.
  - **Natural-history / science museums** — Burke Museum (Seattle), Pacific Science Center. Day-camps with grade-banded sessions. (PSC already in DB before grinder started — dedup catch worked.)
  - **Zoos / aquariums** — Woodland Park Zoo (Seattle), Point Defiance Zoo & Aquarium (Tacoma), Seattle Aquarium. Most run NGSS-aligned age-tiered camps with scholarships.
  - **YMCA residential camps** — Orkila (Orcas), other YMCA chapters across states. Sliding-scale + financial aid is consistent across YMCAs.
  - **Camp Fire / BGCA / Girl Scouts council camps** — Camp Sealth (Camp Fire CPS) is the WA model. Age-5+ residential.
  - **Pay-what-you-can arts orgs** — Coyote Central (Seattle), Music Center of the NW. Both sliding-scale or scholarship-friendly.
  - **Children's theater** — Seattle Children's Theatre Drama School. Age-banded creative drama camps.
  - **National camp networks (regional sites)** — Camp Galileo (Bellevue + Seattle locations). Public, predictable curriculum + Early Bird discount structure.
  - **University youth programs** — already well-covered in existing DB (Robinson Center, UW Engineering, DigiPen).
- WebSearch → search-result snippets are reliable for confirming registration windows, age tiers, and scholarship existence. Pages with heavy WP/Squarespace/Cloudflare protection (e.g., zoo.org renders, KidsQuest, Coyote Central) need triangulation; **search-result snippets often have the FAQ accordion content** which is a goldmine.

## FAILED PATTERNS / KNOWN ANTI-PATTERNS

- **Cloudflare-protected sites** (KidsQuest is one) block curl + WebFetch. Workaround: triangulate via search-result snippets + ACA listings + the org's social media.
- **Squarespace sites** (Coyote Central) load content via JS — raw curl returns boilerplate. Same workaround.
- **Heavy WordPress with React/JS-rendered content** (zoo.org/education/camps/info) — curl returns mostly stylesheet boilerplate. Search snippet captured the scholarship FAQ; that was sufficient to confirm scholarship-aid policy.
- **Re-cloning into /tmp**: the cloned tree is owned by `nobody:nogroup` and not writable by current sandbox user. Old workaround was to copy into `/sessions/.../mnt/outputs/wayfinder-esms`, but `cp -r` preserves nobody ownership for `.git/index` and confuses git (run 3 hit `.git/index.lock: Operation not permitted`). NEW workaround (run 3 confirmed working): clone DIRECTLY into `$HOME/wf-esms` — that path is writable by current user, `git clone` produces correctly-owned `.git` internals, no copy step needed. Use this from now on.
- **Existing-DB collisions**: Pacific Science Center already had two entries from a pre-grinder data refresh. Dedup matched on `name+provider/organization` lowercase — caught it before adding a third. Always run the dedup loop, not just trust new candidates.
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
- **Pacific Science Center**: ALREADY in DB (two entries from prior data refresh). Skipped on run 2. PSC has 6 satellite locations (Explorer West MS, Kenmore EE&RC, Mercer Slough EEC, Salish Sea Elementary, Woodinville Montessori Bothell, on-site campus). Members register Feb 2 2026; general Feb 9; scholarship apps Feb 6.
- **Woodland Park Zoo**: ages 4-13, NGSS-aligned, scholarships up to 100% in 20% increments. Confirmed on FAQ accordion via curl text grep.
- **Seattle Aquarium**: ages 6-12, members 10% off, needs-based scholarships limited. Tuition not posted — registration@seattleaquarium.org for specifics. Medium-confidence on cost.
- **Seattle Children's Theatre Drama School**: ages 3.5-18, weeklong sessions, 2026 Summer Digital Course Catalog hosts dates/tuition. Medium-confidence on cost+dates.
- **Camp Galileo Bellevue**: rising K-5, 9am-3pm, three rotations daily. Early Bird by Feb 28, 2026 saves $50/wk; multi-week saves $25/wk after week 1. National network = trusted operator.
- **Music Center of the Northwest**: Music Together summer camp July 20-24, 12:30-4:00pm, $295. Tuition discounts + scholarships. Phone (206) 526-8443.
- **Point Defiance Zoo & Aquarium (Tacoma)**: age-tiered camps from Little Explorers through teen Zoo Camp. Member reg opened Mar 10 2026; general Mar 12. Scholarships for Pierce County residents on EBT/WIC/foster/kinship.

- **Whatcom Family YMCA (Bellingham)**: 6 distinct camp tracks Pre-K through grade 8 (Minis, Back to School, Discovery, Outdoor Day, Sports, Trail Blazers). Drupal/openy_carnation site (the YMCA standard). Cost varies by track — registrar@whatcomymca.org or 360-255-0585. Medium-confidence on aggregate cost.
- **Music Works Northwest (Bellevue)**: ages 4-16 across 4 tracks; June 22-26 ($530) and June 29-July 1 ($330) sessions; 9:30am-3:30pm. Inclusive of neurodivergent students. Tuition assistance available. Wix-hosted but search snippets surface clean pricing/dates. High confidence.
- **IslandWood (Bainbridge Island)**: full-day 1st-8th and half-day Pre-K/K. 2026 financial assistance funds already exhausted; waitlist form available. Cloudflare-blocked at curl level (HTTP 403); search snippets confirmed via SeattlesChild + IslandWood meta. $100 non-refundable processing fee per camp. Medium confidence on tuition + week-by-week dates.
- **KiDiMu (Bainbridge Island)**: ages 3-12 in 4-hour half-day sessions (9-12 or 12-3); $350 non-member / $325 member; +$20/hr early-late care. KiDiMu's site loaded clean (HTTP 200). High confidence.
- **City of Vancouver Parks & Rec**: ages 6-10 (grades 1-5) at Marshall + Firstenburg community centers; $220 resident / $275 non-resident; Everybody Plays! 50% scholarship auto-applies for eligible families. Registration April 15 (residents) / April 16 (non-residents). High confidence.

## DATA QUALITY FLAGS

- Existing `programs.json` schema uses object-shaped `cost` (`{amount, type, display}`) and object `location` (`{city, state}`). Grinder writes both this canonical shape AND task-spec extras (`scope`, `dates`, `scholarshipAid`, `registrationUrl`, `howToStart`, `confidence`). Backward-compatible — extras are ignored by the search route.
- All grinder entries tagged `_addedBy: "esms-grinder"` for future isolation.

## CALIBRATION SUGGESTIONS

- 6 entries/run is comfortable when targeting well-known anchor orgs in a single metro region. Drop back to 5 the first time we step outside well-known anchors (e.g., neighborhood arts orgs, smaller faith-based camps).
- Spread metros across at least 2 cities/sub-regions per run. Run 2 hit Seattle (multiple), Bellevue, and Tacoma — good variety.
- When existing DB shows ANY pre-existing entry for a candidate org, check what's already there before researching — saves WebSearch budget.

## CONFIDENCE TIERS

- `confidence: "high"` — all required fields verified
- `confidence: "medium"` — org clearly real, 1-2 fields couldn't be confirmed publicly. Add `_unverifiedFields: [...]` array. Description appends caveat.
- SKIP — only when org can't be verified or appears defunct

## OPEN QUESTIONS / TODO

- Best way to flag camps requiring district residency vs open-enrollment? (Point Defiance scholarships are Pierce-County-only — currently noted in description + scholarshipAid string. Consider top-level `scholarshipResidencyRequired` boolean future-iteration.)
- Should we have a separate scholarshipAid (Y/N) field at top level vs inline in description? Currently using both: top-level `scholarshipAid` string AND mention in description.
- Future WA targets remaining: Spokane (Mobius Discovery Center — still deferred), Olympia (Hands On Children's Museum), BARN Bainbridge youth artisan camps (8-18), Bainbridge Island Museum of Art summer camps, Bellingham SPARK Museum, Tacoma — TAM and Children's Museum of Tacoma, Spokane Riverfront Park kids programs, Seattle Public Library Summer Reading offshoots, Northwest Outdoor Center youth kayak (Seattle). Done in run 3: Whatcom Family YMCA, Music Works NW, IslandWood, KiDiMu, City of Vancouver P&R.

## DEFERRED CANDIDATES

- **Mobius Discovery Center (Spokane)** — confirmed real org (children's museum + science center merger, downtown Spokane, 331 N Post St). Camp/class detail not crawlable from landing page; FAQ exists but content is JS-rendered. Defer until we can pull from a parent newsletter or ParentMap listing for current age tiers + dates.

## RUN HISTORY

| Date | Run # | Added | Skipped | Focus | Notable |
|------|-------|-------|---------|-------|---------|
| 2026-04-26 | 1 | 5 (3hi/2md) | 0 | WA — Seattle/Bellevue/Vashon/Orcas | KidsQuest (md), Coyote Central (hi), Burke (hi), Camp Orkila (hi), Camp Sealth (md). Bootstrapped progress file + lessons. |
| 2026-04-26 | 2 | 6 (4hi/3md... wait 4hi/2md after correction) | 0 | WA — Seattle/Bellevue/Tacoma anchors | Woodland Park Zoo (hi), Seattle Aquarium (md cost), Seattle Children's Theatre (md cost+dates), Camp Galileo Bellevue (hi), Music Center NW (hi), Point Defiance Zoo (hi). Caught Pacific Science Center as existing-DB duplicate; substituted Point Defiance. New writable-clone workaround documented. |
| 2026-04-26 | 3 | 5 (3hi/2md) | 0 | WA — Bellingham/Bellevue/Bainbridge/Vancouver (secondary metros) | Whatcom Family YMCA (md cost), Music Works NW (hi), IslandWood (md cost+dates), KiDiMu (hi), City of Vancouver P&R (hi). First non-Seattle WA batch; 0 skips, 0 dedup hits. WA progress 16/30. |
