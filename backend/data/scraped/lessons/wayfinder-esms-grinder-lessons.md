# wayfinder-esms-grinder — Lessons Learned

> Read at the START of every run. Append takeaways at the END before push.
> This grinder adds verified summer camps + enrichment programs for ELEMENTARY (K-5) and MIDDLE SCHOOL (6-8) students to the existing programs.json database.

## CURRENT CALIBRATION (latest accepted values)

- batch_size: 6 entries per run (runs 2 & 3 hit 6/6)
- typical_run_duration: ~10 min
- typical_skip_rate: 0% (runs 1-3)
- last_calibration_change: 2026-04-26 — held at 6/run on run 3 (national/online batch, all 6 fresh, 0 skips). Confident at 6 across both anchor + nationwide focuses.

## EFFECTIVE PATTERNS (validated)

- WA-first metros that work well: **Seattle (museums/aquarium/zoo/theater/music), Bellevue (children's museum, Galileo), Vashon Island (Camp Fire), Orcas Island (YMCA), Tacoma (Point Defiance Zoo)**.
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
- **Re-cloning into /tmp**: the cloned tree is owned by `nobody:nogroup` and not writable by `great-brave-faraday`. Workaround: copy the tree into `/sessions/.../mnt/outputs/wayfinder-esms` (writable), do the edits + commit there, push from that copy. Add this as a permanent step.
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
- Future WA targets: Spokane (Mobius Discovery Center — needs better source for camp details), Vancouver WA, Bellingham (Whatcom Family YMCA), Olympia, Bainbridge Island Park & Rec arts camps, Music Works Northwest (Bellevue), Seattle Public Library Summer Reading offshoots.

## DEFERRED CANDIDATES

- **Mobius Discovery Center (Spokane)** — confirmed real org (children's museum + science center merger, downtown Spokane, 331 N Post St). Camp/class detail not crawlable from landing page; FAQ exists but content is JS-rendered. Defer until we can pull from a parent newsletter or ParentMap listing for current age tiers + dates.
## RUN 3 — NATIONAL/ONLINE BATCH (2026-04-26)

### What worked
- **Switched focus to nationwide/online per priority queue + Dan's directive.** All 6 picks were nationally-available K-8 programs with online or franchise distribution. Zero geographic-residency friction means broader user value per entry.
- **WebSearch snippets carried 80%+ of the verification load for online programs** — Outschool, Brain Chase, Connected Camps, Code Ninjas, AoPS, Curious Cardinals all had pricing, ages, dates, and registration windows surfaced directly in result snippets. Saved fetching JS-heavy SPAs.
- **Outschool homepage is pure JS-app shell** (React Sentry boot, no rendered content in raw HTML). Don't fetch it — search snippets give marketplace structure already.
- **Brain Chase upcoming-programs page is too large to fetch** (292KB+). Search snippets had ages, $199 early-bird, June 15 start, 5-week format, 4 hrs/wk — sufficient for high confidence.
- **Capturing parent-facing insights worked smoothly** during research. Each program yielded ≥1 capture-worthy gotcha (Outschool teacher-quality variance, Brain Chase early-bird window, AoPS placement-test diagnostic, etc.). 6/6 programs → 6 insights captured. Created `summer-camp-insights.json` from scratch with `_meta` + `sections[]` shape, single `field-notes` section, capped at 30 items.

### Source-specific notes (run 3)
- **Outschool**: Online marketplace, $varies. Quality is per-teacher, mini-group cap 12. Marked confidence=medium (cost variance).
- **Brain Chase**: Ages 6-16, $199 early-bird for 5-week treasure-hunt enrichment. June 15, 2026 start. High confidence.
- **Connected Camps**: Founded by Mimi Ito (UC Irvine), Mimecraft/Roblox-based, $65-$140/week camps + $12/session clubs. Ages 8-17. June 1-Aug 14 2026. High confidence. Standout: club tier as low-cost ongoing-engagement option.
- **Code Ninjas**: National franchise, ages 5-14, $140-$229/wk half-day camps. AM + PM stack into full-day. June-July 2026. High confidence.
- **AoPS Academy Virtual**: Grades 2-12, math/language arts, 1.5 hr/day for 4 weeks. Placement test required (free + useful as standalone diagnostic). High confidence on structure; medium on exact cost.
- **Curious Cardinals**: Stanford-founded 1:1 mentorship, K-12, online. 1-2 week summer intensives. Cost only revealed after intake. 2-week money-back guarantee. Medium confidence.

### New patterns to keep
- **Online/nationwide batches are dramatically faster** than metro-specific WA batches. No location-disambiguation, no franchise-site digging. ~5-7 min per entry vs 8-10 for site-specific.
- **Insight capture is best done WHILE researching each program** rather than as a separate pass. The "what surprised me" moment IS the insight.
- **Always check existing DB for franchise/network candidates before writing** — already-existing iD Tech, Camp Invention, Galileo Bellevue would have been duplicate misfires. Dedup by lowercase name+provider continues to work.

### CALIBRATION
- Hold at 6/run. Online batches make it feel easy; resist temptation to push to 7-8 because metro batches will rebuild density at 6.
- For runs 4-5, consider mixing 3 nationwide + 3 metro to keep both queues advancing.

## RUN HISTORY

| Date | Run # | Added | Skipped | Focus | Notable |
|------|-------|-------|---------|-------|---------|
| 2026-04-26 | 1 | 5 (3hi/2md) | 0 | WA — Seattle/Bellevue/Vashon/Orcas | KidsQuest (md), Coyote Central (hi), Burke (hi), Camp Orkila (hi), Camp Sealth (md). Bootstrapped progress file + lessons. |
| 2026-04-26 | 2 | 6 (4hi/2md) | 0 | WA — Seattle/Bellevue/Tacoma anchors | WPZoo (hi), Sea Aqua (md), SCT (md), Galileo Bellevue (hi), MCNW (hi), Pt Defiance (hi). Dedup caught PSC. New writable-clone workaround. |
| 2026-04-26 | 3 | 6 (4hi/2md) | 0 | NATIONAL/ONLINE — K-8 anchor providers | Outschool (md), Brain Chase (hi), Connected Camps (hi), Code Ninjas (hi), AoPS Virtual (hi), Curious Cardinals (md). First nationwide batch. Bootstrapped summer-camp-insights.json with 6 field-notes. |
