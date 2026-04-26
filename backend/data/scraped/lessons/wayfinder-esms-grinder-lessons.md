# wayfinder-esms-grinder — Lessons Learned

> Read at the START of every run. Append takeaways at the END before push.
> This grinder adds verified summer camps + enrichment programs for ELEMENTARY (K-5) and MIDDLE SCHOOL (6-8) students to the existing programs.json database.

## CURRENT CALIBRATION (latest accepted values)

- batch_size: 5 entries per run (run 3 stepped outside well-known anchor metros and stayed at 5; landed 5/5 with no skips, 2 hi / 3 md). Stay at 5 while continuing to step into less-familiar WA metros (Spokane, Vancouver WA, Olympia). Push back to 6 only when going back to anchor-rich metros or to a national-anchor theme batch.
- typical_run_duration: ~10 min
- typical_skip_rate: 0% (runs 1-3)
- last_calibration_change: 2026-04-26 — held at 5 for run 3 (Everett/Bellingham/Bainbridge/Woodinville/Bellevue). All 5 added.

## EFFECTIVE PATTERNS (validated)

- WA-first metros that work well so far: **Seattle (museums/aquarium/zoo/theater/music), Bellevue (children's museum, theatre, Galileo, Music Works NW), Vashon Island (Camp Fire), Orcas Island (YMCA), Tacoma (Point Defiance Zoo), Everett (Imagine Children's Museum), Bellingham (Whatcom Family YMCA), Bainbridge Island/Woodinville (IslandWood)**.
- ANCHOR ORG TYPES that reliably yield ES/MS programs:
  - **Children's museums** — KidsQuest (Bellevue), Imagine Children's Museum (Everett). Most run summer camps for ages 3-11. Cost typically NOT on landing page → mark medium.
  - **Natural-history / science museums** — Burke Museum (Seattle), Pacific Science Center (already in DB). Day-camps with grade-banded sessions.
  - **Zoos / aquariums** — Woodland Park Zoo (Seattle), Point Defiance Zoo & Aquarium (Tacoma), Seattle Aquarium. NGSS-aligned age-tiered camps with scholarships.
  - **YMCA residential AND day camps** — Orkila (Orcas), Whatcom Family Y (Bellingham). Both have member/non-member tiering, $25/wk deposit pattern, financial assistance, and explicit grade-entering brackets. Whatcom Y is the cleanest day-camp pricing data we've gotten.
  - **Camp Fire / BGCA / Girl Scouts council camps** — Camp Sealth (Camp Fire CPS) is the WA model. Age-5+ residential.
  - **Pay-what-you-can arts orgs** — Coyote Central (Seattle), Music Center of the NW (Seattle), Music Works Northwest (Bellevue, separate org). All sliding-scale or scholarship-friendly. Music Works NW had the cleanest dollar pricing posted ($330/$530).
  - **Children's theater** — Seattle Children's Theatre Drama School, Bellevue Youth Theatre. BYT is City of Bellevue Parks-run, casts every camper, has Resident/Non-Resident pricing — full price grid was on the page ($120-$720) but ages-per-session were not extractable.
  - **National camp networks (regional sites)** — Camp Galileo (Bellevue + Seattle locations), IslandWood (Bainbridge + Brightwater Education Center Woodinville). Public, predictable curriculum.
  - **University youth programs** — already well-covered in existing DB (Robinson Center, UW Engineering, DigiPen).
- WebSearch → search-result snippets are reliable for confirming registration windows, age tiers, and scholarship existence. Cloudflare- or JS-rendered pages still need triangulation; **search-result snippets often contain the FAQ accordion content** which is a goldmine.
- **Pricing extraction trick**: when a page is JS-rendered, `curl -sL ... | sed 's/<[^>]*>/ /g' | grep -oE '\\$[0-9]+'` still pulls dollar amounts out of inlined JSON or fallback text. Used this on BYT and Whatcom Y to get pricing without rendering JS.

## FAILED PATTERNS / KNOWN ANTI-PATTERNS

- **Cloudflare-protected sites** (KidsQuest, IslandWood) block curl + WebFetch with a JS challenge. Workaround: triangulate via search-result snippets + ACA listings + the org's own social media.
- **Squarespace sites** (Coyote Central) load content via JS — raw curl returns boilerplate. Same workaround.
- **Heavy WordPress with React/JS-rendered content** (zoo.org/education/camps/info) — curl returns mostly stylesheet boilerplate. Search snippet captured the scholarship FAQ; that was sufficient to confirm scholarship-aid policy.
- **Re-cloning into /tmp**: on SOME runs the cloned tree is owned by `nobody:nogroup` and not writable. Earlier runs worked around this by copying into `/sessions/.../mnt/outputs/wayfinder-esms`. Run 3 hit a NEW failure mode: `cp -rH` of the readonly tree into `mnt/outputs/` produced files the session user could not later delete (Operation not permitted), and the corrupted .git/index could not be recovered. **CORRECT pattern (run 3 recovery):** clone DIRECTLY to `/tmp/wfg` (always writable for the session user), do all edits + commits there, then `git push` from `/tmp/wfg`. No copy step needed. If `/tmp/wfg` clone itself fails on perms, only then fall back to copying.
- **Existing-DB collisions**: Pacific Science Center already had two entries from a pre-grinder data refresh. Dedup matched on `name+provider/organization` lowercase — caught it before adding a third. Always run the dedup loop. (Run 3: dedup loop ran cleanly; 0 collisions.)
- **City Parks sites with Resident/Non-Resident pricing**: BYT page had a full price grid ($120-$720), but per-session ages were not extractable from raw HTML. Mark medium with `_unverifiedFields: ["per-session cost","per-session age tier"]`. Acceptable trade-off — the org is real, the program runs annually, and the page tells parents how to register and ask.
- Watch for:
  - Pay-only camps with no scholarship aid — note the cost transparently, don't filter out
  - Camps that closed during/after COVID and never reopened
  - Camps requiring parent membership in another org (note prerequisite — Whatcom Y member rate requires active YMCA membership)
  - Religious-instruction-required camps (mainline faith camps that welcome non-affiliated kids are fine; explicit catechism camps are different category)
  - **Financial-aid windows**: IslandWood 2026 aid funds are exhausted as of April 2026. Note status truthfully ("currently exhausted; waitlist available") rather than dropping the entry.

## SOURCE-SPECIFIC NOTES

- **Burke Museum (Seattle)**: Dino Trackers grades 1-3, Paleo Discovery grades 4-6. $100/day session ($90 member). Aftercare $30. URL: burkemuseum.org/education/families-and-youth/camps.
- **Coyote Central**: ages 10-15, $400/$450 program fee, sliding scale (pay-what-you-can). Address: Central District Seattle. Contact: programs@coyotecentral.org / (206) 323-7276.
- **KidsQuest (Bellevue)**: ages 4-10. Cost not on landing page — must email education@kidsquestmuseum.org. Marked medium-confidence with `_unverifiedFields: ["cost","scholarshipAid"]`.
- **YMCA Camp Orkila**: grades 3-12 entering, since 1906. Sliding-scale Price A/Price B. $50 deposit. Registration opens Feb 4, 2026 6 a.m.
- **Camp Sealth (Camp Fire CPS)**: ACA-accredited, ages 5-17, 4-13 day sessions. Cost not on landing — medium confidence.
- **Pacific Science Center**: ALREADY in DB (two entries from prior data refresh). Skipped on run 2. PSC has 6 satellite locations. Members register Feb 2 2026; general Feb 9; scholarship apps Feb 6.
- **Woodland Park Zoo**: ages 4-13, NGSS-aligned, scholarships up to 100% in 20% increments. Confirmed on FAQ accordion via curl text grep.
- **Seattle Aquarium**: ages 6-12, members 10% off, needs-based scholarships limited. Tuition not posted — registration@seattleaquarium.org for specifics. Medium-confidence on cost.
- **Seattle Children's Theatre Drama School**: ages 3.5-18, weeklong sessions, 2026 Summer Digital Course Catalog hosts dates/tuition. Medium-confidence on cost+dates.
- **Camp Galileo Bellevue**: rising K-5, 9am-3pm, three rotations daily. Early Bird by Feb 28, 2026 saves $50/wk; multi-week saves $25/wk after week 1. National network = trusted operator.
- **Music Center of the Northwest (Seattle)**: Music Together summer camp July 20-24, 12:30-4:00pm, $295. Tuition discounts + scholarships. Phone (206) 526-8443. (NOTE: distinct org from Music Works Northwest in Bellevue — different city, different curriculum, different price grid.)
- **Point Defiance Zoo & Aquarium (Tacoma)**: age-tiered camps from Little Explorers through teen Zoo Camp. Member reg opened Mar 10 2026; general Mar 12. Scholarships for Pierce County residents on EBT/WIC/foster/kinship.
- **Imagine Children's Museum (Everett)** — NEW run 3. Ages 3-11. First Preschool Camp week of June 22, 2026. Half-day camps for 3-5 and 5-7 (STEM, marine science, soccer, animal clinic, water exploration); full-day camps for 7-11 (nature, fossils, themed). Cost not on landing page → contact education@imaginecm.org or (425) 258-1006. Medium confidence.
- **Whatcom Family YMCA (Bellingham)** — NEW run 3. Outdoor Day Camp $330 mem/$380 non-mem (entering 2-5). Discovery Camp $355 mem/$405 non-mem (entering 1-5). Other tracks: Minis (3-5), Sports & Swim (1-5), Multi-Sports/Court Sports (entering 4-7), Trail Blazers Elementary (entering 2-5), Trail Blazers Middle (entering 6-8). $25/wk deposit. Member rate requires active YMCA membership. Financial aid via registrar@whatcomymca.org / 360-255-0585. HIGH confidence.
- **Bellevue Youth Theatre** — NEW run 3. City of Bellevue Parks. Casts every camper. Confirmed 2026 sessions: Play-Making Camp Aug 10-14 (9:30am-3pm), Beauty and the Beast Aug 17-21, A Midsummer Night's Dream, Jack and the Beanstalk, The Tortoise and the Hare. Resident/Non-Resident pricing tiered $120-$720. Extended care 8-9:30am and 3-5:30pm. (425) 452-7155. Medium confidence (per-session age + cost not extractable).
- **Music Works Northwest (Bellevue)** — NEW run 3. Bellevue community music school (DISTINCT from Music Center of the NW in Seattle). Ages 4-16. $330 for 3-day sessions; $530 for 5-day sessions. Programs: I Love Music, Creative Keyboards Piano, Gotta Sing! Voice, Instrument Exploration, Electronic Music Creation. Sliding-scale tuition assistance available at musicworksnw.org/tuition-assistance. HIGH confidence.
- **IslandWood Outdoor Summer Day Camps (Bainbridge + Brightwater Woodinville)** — NEW run 3. Last week of June through first week of August 2026, Mon-Fri (except week of June 29). Full-day 9am-3:30pm for entering 1st-6th. Half-day 9am-12pm at Brightwater for entering Pre-K and K, beginning at age 4. $100/camp non-refundable processing fee. Apr 3 cutoff for full refund (less the fee). 2026 financial-assistance funds currently EXHAUSTED — community-need waitlist available. 206-855-4300. Medium confidence (per-session tuition not on landing page; Cloudflare blocks deeper crawl).

## DATA QUALITY FLAGS

- Existing `programs.json` schema uses object-shaped `cost` (`{amount, type, display}`) and object `location` (`{city, state}`). Grinder writes both this canonical shape AND task-spec extras (`scope`, `dates`, `scholarshipAid`, `registrationUrl`, `howToStart`, `confidence`). Backward-compatible — extras are ignored by the search route.
- All grinder entries tagged `_addedBy: "esms-grinder"` for future isolation. Run 3 confirmed isolation count: 16 grinder-added programs out of 842 total.
- City-Parks-run programs (BYT) — eligibility.grades was set broadly (1-12) since BYT casts everyone; ages string carries the nuance. Future iteration: split into per-camp entries if Dan wants finer filtering.

## CALIBRATION SUGGESTIONS

- 5 entries/run is the right size for a multi-metro WA spread (run 3 hit Everett, Bellingham, Bainbridge/Woodinville, Bellevue x2 — 5 metros, 5/5 added, 0 skip).
- Push to 6/run when batching anchor-rich metros (Seattle multi-org, e.g., MoPOP + Seattle Public Library + Wing Luke + Henry Art) or when batching a national-anchor theme.
- Spread metros across at least 3 cities/sub-regions per run from now on. Run 3 hit 4 metros — sustainable cadence.
- When existing DB shows ANY pre-existing entry for a candidate org, check what's already there before researching — saves WebSearch budget. (Confirmed pattern: dedup-pre-check on candidate names, plus a sweep for keyword fragments like "everett", "bellingham", etc., catches duplicates fast.)

## CONFIDENCE TIERS

- `confidence: "high"` — all required fields verified
- `confidence: "medium"` — org clearly real, 1-2 fields couldn't be confirmed publicly. Add `_unverifiedFields: [...]` array. Description appends caveat.
- SKIP — only when org can't be verified or appears defunct

## OPEN QUESTIONS / TODO

- Best way to flag camps requiring district residency vs open-enrollment? (Point Defiance scholarships are Pierce-County-only; Whatcom Y member-rate requires active YMCA membership.) Currently noted in description + scholarshipAid string. Consider top-level `scholarshipResidencyRequired` or `membershipRequired` flags in a future iteration.
- Should we have a separate scholarshipAid (Y/N) field at top level vs inline in description? Currently using both: top-level `scholarshipAid` string AND mention in description.
- Should we split city-parks omnibus entries (BYT) into per-camp rows (Play-Making, Beauty and the Beast, etc.) so filters can match an individual ages window? Defer until we hit at least one more omnibus city-parks org.
- Future WA targets remaining: **Spokane (Mobius — DEFERRED below; Spokane Civic Theater; Mt. Spokane area camps), Vancouver WA (Camas-Washougal Family YMCA, Vancouver Symphony summer programs), Olympia (South Sound YMCA, Hands On Children's Museum), Bainbridge Island Park & Rec arts camps, Bothell/Kenmore (Northshore Senior Center youth programs are sparse — better to look at Bothell Parks & Rec), Seattle Public Library Summer Reading offshoots, MoPOP Seattle youth camps, Wing Luke Museum Tateuchi, Henry Art Gallery youth programs, BARN (Bainbridge BARN — youth maker/wood/textile camps).**

## DEFERRED CANDIDATES

- **Mobius Discovery Center (Spokane)** — confirmed real org (children's museum + science center merger, downtown Spokane, 331 N Post St). Camp/class detail not crawlable from landing page; FAQ exists but content is JS-rendered. Defer until we can pull from a parent newsletter or ParentMap listing for current age tiers + dates.
- **Bainbridge Island Metro Park & Recreation District** — confirmed real (biparks.org), uses ACTIVENet, but specific summer-2026 camp catalog requires authenticated/JS-rendered registration UI. WebSearch returned only the registration shell. Defer until they post a public seasonal program catalog PDF or the seasonal page renders age tiers in static HTML. Substituted IslandWood (also Bainbridge) for run 3.

## RUN HISTORY

| Date | Run # | Added | Skipped | Focus | Notable |
|------|-------|-------|---------|-------|---------|
| 2026-04-26 | 1 | 5 (3hi/2md) | 0 | WA — Seattle/Bellevue/Vashon/Orcas | KidsQuest (md), Coyote Central (hi), Burke (hi), Camp Orkila (hi), Camp Sealth (md). Bootstrapped progress + lessons. |
| 2026-04-26 | 2 | 6 (4hi/2md) | 0 | WA — Seattle/Bellevue/Tacoma anchors | Woodland Park Zoo (hi), Seattle Aquarium (md), Seattle Children's Theatre (md), Camp Galileo Bellevue (hi), Music Center NW (hi), Point Defiance Zoo (hi). Caught Pacific Science Center as existing-DB duplicate; substituted Point Defiance. New writable-clone workaround documented. |
| 2026-04-26 | 3 | 5 (2hi/3md) | 0 | WA — Everett/Bellingham/Bainbridge/Woodinville/Bellevue | Imagine Children's Museum Everett (md), Whatcom Family YMCA Outdoor Day Camp Bellingham (hi), Bellevue Youth Theatre (md), Music Works Northwest Bellevue (hi), IslandWood Bainbridge+Woodinville (md). First step outside Seattle/Bellevue/Tacoma anchor cluster — clean 5/5. Substituted IslandWood for Bainbridge Parks & Rec (deferred). Disambiguated Music Works NW (Bellevue) vs Music Center NW (Seattle). Confirmed Cloudflare-blocked IslandWood; pricing-extraction `curl|sed|grep '$[0-9]+'` trick worked on BYT and Whatcom Y. |
