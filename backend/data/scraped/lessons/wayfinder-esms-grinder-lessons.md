# wayfinder-esms-grinder — Lessons Learned

> Read at the START of every run. Append takeaways at the END before push.
> This grinder adds verified summer camps + enrichment programs for ELEMENTARY (K-5) and MIDDLE SCHOOL (6-8) students to the existing programs.json database.

## CURRENT CALIBRATION (latest accepted values)

- batch_size: 5 entries per run (run 3 stepped down to 5 to broaden metro coverage outside Seattle/Bellevue core)
- typical_run_duration: ~10 min
- typical_skip_rate: 0% (runs 1-3)
- last_calibration_change: 2026-04-26 — run 3 dialed back to 5 to spread across Bellingham/Olympia/Bainbridge in addition to Bellevue. 6/run is fine for anchor-heavy regions; 5/run is the right cadence when reaching for new metros.

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
- **Branded YMCA day camps in mid-size WA cities** (e.g., Whatcom Family YMCA Discovery Camp) reliably yield: confirmed grades, transparent member/non-member pricing, sliding-scale financial aid, and an online aid request form. Strong run-3 pattern.
- **Outdoor-education campuses with day-camp programs** (IslandWood) are anchor-strength: real campus, multi-year operating history, age-banded sessions, transparent pricing — even when financial aid funds are exhausted for the year, the program itself is fully verifiable.
- **Youth orchestras with summer camps** (BYSO) are excellent ES/MS finds: explicit grade ranges, school-year-of-instrument prerequisites, 100% tuition-aid commitments are common.
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
- **Whatcom Family YMCA Discovery Camp (Bellingham)**: grades 1-5 Fall 2026, 10 themed weeks (Extreme Earth, Grossology, Ocean Odyssey, Maker Mania, Weather Wizards, Space Explorers, Arctic Adventures, Secret Agents Academy, Glow Lab, Art Attack Studio) June 15-Aug 21, 2026. $355 member / $405 community per week, $25 deposit. Financial assistance + sliding fee. Registration opened Feb 2 2026 at 6:30am.
- **Music Works Northwest (Bellevue)**: ages 4-16. Voice (4-6), Musical (6-9), I Love Music themed weeks, Electronic Music (12-16). $330 (3-day) - $530 (full week). 9:30-3:30pm. Welcomes neurodivergent kids — flag accommodations before registering. URL musicworksnw.org/summer-camps.
- **Hands On Children's Museum (Olympia)**: ages 3-9 (5yo must have completed K). Half-day or full-day camps. Tuition NOT on landing page — call (360) 956-0818 ext. 103 / reservations@hocm.org. $25 half-day / $50 full-day non-refundable deposit per spot. Forms due 2 weeks before camp. Medium-confidence on cost.
- **IslandWood (Bainbridge Island)**: 255-acre campus. Pre-K/K half-day Garden Explorers $346, 1st-2nd Builder's Quest $474, plus full-day grades 1-8 marine science / cooking / art. $100 non-refundable processing fee per camp. Aftercare $25/day. Financial aid funds for 2026 currently exhausted; waitlist via interest form. URL islandwood.org/outdoor-summer-day-camps-2026.
- **Bellevue Youth Symphony Orchestra (Bellevue)**: Summer Strings grades 1-6 / ages 6-11 July 6-10 2026 $550. Summer Symphony grades 4-8 / ages 10-14 July 13-17 2026 $600. SMI for ages 14+ July 20-24. Mon-Fri 9am-3pm. **100% of requested tuition assistance met** via Charlotte Field Scholarship. Registration closes May 31 (some sessions waitlist-only as of late April).

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
- Future WA targets: Vancouver WA, Olympia non-museum (Yashiro Japanese Garden, Olympia Family Theater), Spokane alternatives to Mobius (Spokane County Library / Manito Park / Spokane Children's Theatre), Bainbridge Island Park & Rec native arts camps, Bellingham Children's Museum / Whatcom Museum, KCLS Summer Reading offshoots, Tacoma Children's Museum, Seattle Public Library Summer Reading offshoots.

## DEFERRED CANDIDATES

- **Mobius Discovery Center (Spokane)** — confirmed real org (children's museum + science center merger, downtown Spokane, 331 N Post St). Camp/class detail not crawlable from landing page; FAQ exists but content is JS-rendered. Defer until we can pull from a parent newsletter or ParentMap listing for current age tiers + dates.

## RUN HISTORY

| Date | Run # | Added | Skipped | Focus | Notable |
|------|-------|-------|---------|-------|---------|
| 2026-04-26 | 1 | 5 (3hi/2md) | 0 | WA — Seattle/Bellevue/Vashon/Orcas | KidsQuest (md), Coyote Central (hi), Burke (hi), Camp Orkila (hi), Camp Sealth (md). Bootstrapped progress file + lessons. |
| 2026-04-26 | 2 | 6 (4hi/3md... wait 4hi/2md after correction) | 0 | WA — Seattle/Bellevue/Tacoma anchors | Woodland Park Zoo (hi), Seattle Aquarium (md cost), Seattle Children's Theatre (md cost+dates), Camp Galileo Bellevue (hi), Music Center NW (hi), Point Defiance Zoo (hi). Caught Pacific Science Center as existing-DB duplicate; substituted Point Defiance. New writable-clone workaround documented. |
| 2026-04-26 | 3 | 5 (4hi/1md) | 0 | WA — Bellingham/Bellevue/Olympia/Bainbridge | Whatcom Family YMCA Discovery Camp (hi), Music Works NW (hi), Hands On Children's Museum Olympia (md cost), IslandWood Bainbridge (hi), BYSO Summer Music Camps (hi). First run reaching outside core Seattle/Eastside metros — three new WA cities covered. |


## INSIGHT CAPTURE PROTOCOL (added 2026-04-26)

While researching each program, opportunistically capture **parent-facing insights** that go beyond standard fields. These are the "I wouldn't have known unless I'd talked to 50 parents" facts that make Wayfinder genuinely valuable.

### What counts as a capture-worthy insight

- **Hidden scholarship details** — "Org X has 100% aid but landing page only says 'sliding scale'"; specific tier breakdowns
- **Registration timing edge cases** — "Members get access 3 weeks before general; popular sessions sell out in <48h"
- **Age-flexibility** — "Listed ages 6-12 but accepts 5 if you email coordinator"
- **Name vs reality mismatches** — "Marketed as 'STEM camp' but actually 70% arts/crafts"
- **Hidden discount stacks** — "Multi-week + sibling discounts stack with Early Bird"
- **CIT / volunteer pathways** — "Free attendance for 13-15 year olds via CIT pipeline"
- **Counter-intuitive quality** — "Free parks dept camp at this site is run by the same instructors as the $500/wk specialty camp"
- **Site-specific gotchas** — "Downtown site is loud + cramped vs suburban site has full grounds — same brand, different experience"
- **Real cost vs sticker price** — fees beyond tuition, refund policies

### How to capture

After processing each program, if you discovered ≥1 capture-worthy insight, append to `backend/data/scraped/summer-camp-insights.json` → find the section with `id: "field-notes"` → PREPEND new items to its `items[]` array (most recent at top).

Format each item:
```json
{ "label": "[Org name] — [Insight type in 4-7 words]", "detail": "[1-2 sentence specific actionable detail with org named]" }
```

Cap section at 30 items. Drop oldest if exceeding. Dedup by label substring match.

**Quality bar**: specific, actionable, parent-facing. "This camp is fun" doesn't qualify. "PSC scholarship form is 1 page and includes low-friction pay-stub upload — most parents skip because they assume it's complex" qualifies.

### NOT to capture
- Generic facts already in entry's structured fields
- Marketing fluff
- Anything you can't trace to a specific fetched source
- Speculation
- Anything stale within 30 days
