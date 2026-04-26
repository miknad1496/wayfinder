# wayfinder-esms-grinder — Lessons Learned

> Read at the START of every run. Append takeaways at the END before push.
> This grinder adds verified summer camps + enrichment programs for ELEMENTARY (K-5) and MIDDLE SCHOOL (6-8) students to the existing programs.json database.

## CURRENT CALIBRATION (latest accepted values)

- batch_size: 6 entries per run (run 6 held at 6, 0 skips, mixed 3 high + 3 medium confidence — comfortable when leaning on national operators)
- typical_run_duration: ~10 min
- typical_skip_rate: 0% (runs 1-6)
- last_calibration_change: 2026-04-26 — held at 6 for run 6; medium-confidence entries were medium because cost not posted on landing page (Connected Camps via Outschool, CodeCombat parent pricing, RSM tuition-by-form), not because the org itself was uncertain.


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
- **Nationwide/remote anchors are the highest-leverage tier** (run 4 confirmed): Outschool, Beast Academy Online, Curious Cardinals, Synthesis Tutor, Brain Chase, Northwestern CTD all yielded high-confidence entries with full pricing/eligibility/scholarship data on a single research pass. Operating histories are publicly documented, pricing is structured (not negotiable per-family), and they benefit students in EVERY state — exactly what Dan flagged as the "golden low-hanging fruit." Continue rotating nationwide candidates into runs alongside metro/state work.
- **Run 6 reinforced the nationwide tier** with mixed-confidence batch (3 hi + 3 md): Tynker, Khan Academy Kids, NASA Kids' Club delivered as high-confidence on first pass; Connected Camps / CodeCombat / RSM landed at medium because *pricing surfaces require parent action* (Outschool storefront for CC, Vue SPA for CodeCombat, tuition-form-submission for RSM). Lesson: when researching a national org and its landing page lacks a public price, mark medium and capture the friction itself as a field-note (parents value the heads-up about the obstacle).
- WebSearch → search-result snippets are reliable for confirming registration windows, age tiers, and scholarship existence. Pages with heavy WP/Squarespace/Cloudflare protection (e.g., zoo.org renders, KidsQuest, Coyote Central) need triangulation; **search-result snippets often have the FAQ accordion content** which is a goldmine.

## FAILED PATTERNS / KNOWN ANTI-PATTERNS

- **Concurrent grinder runs cause stale-clone problem**: Run 5 cloned, did its research, started writing — meanwhile run 4 had already pushed Outschool/Beast Academy Online/Brain Chase to main. We had to dedup against the *remote* tip, not just our cached clone. Mitigation: re-fetch the remote `programs.json` raw via API before final write, run dedup again, then push only the diff.
- **Sandbox mount (`/sessions/.../mnt/outputs/`) blocks `unlink()` even on files we own**: stale `.git/index.lock`, `.git/HEAD.lock`, `.git/rebase-merge/` directories cannot be removed mid-rebase. Once a rebase fails partway through, the local clone is unrecoverable for further git operations. Workaround: use `GIT_INDEX_FILE=/tmp/...` to redirect index, OR push commits via GitHub REST API (create blobs → tree → commit → update ref) instead of `git push`. Both worked when used early; once the rebase stalled, the only path forward was the REST API.
- **Don't use `git pull --rebase` on this mount** — `--no-rebase` (default merge) avoids creating `.git/rebase-merge/` and is recoverable. Better still: `git fetch` + check tip + decide manually whether to merge or just-push-after-pull.


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


- **Outschool**: pivoted to credit-based memberships in 2026 ($60–$600/mo for 1–10 group classes/wk) alongside the legacy pay-per-class model. Group class $5–$36 each; self-paced $10–$94/week. ESA-funded enrollment supported in AZ + other participating states. Outschool Cares scholarships exist but require app. URL: outschool.com/online-classes/summer-camps. High confidence.
- **Beast Academy Online (AoPS)**: $99.99/yr or $16/mo per student covers grades 1–5 (one sub, all five levels). Sibling Yearly $64.99 ONLY with active Bundle. Bundle ~$160 (printed books for one level + 1-yr sub). 10% group discount for 5+. URL: beastacademy.com/online/enroll. High confidence.
- **Curious Cardinals**: 1:1 mentorship K–12, sessions start $95/hr. 4-month plan cheapest, monthly higher, pay-as-you-go highest. 2-month minimum commitment + 2-week money-back. 30-min sessions for under-4th-grade or learning differences. URL: curiouscardinals.com/pricing. High confidence.
- **Synthesis Tutor**: AI math K–5 (ages 5–11) at $20/mo, $99/yr, or $240/yr (up to 7 student profiles). Synthesis Teams (live group, ages 8–14) is $95/mo — separate product. 7-day free trial. URL: synthesis.com/tutor. High confidence.
- **Brain Chase Summer Treasure Hunt**: 5-week online program ages 6–16 (designed gr 2–8) starting June 15, 2026. Early-bird $199, standard ~$249. Choose-your-own electives + global treasure-hunt narrative. URL: brainchase.com/upcoming-programs. High confidence.
- **Northwestern CTD Academic Day Camps**: PreK–grade 8 enrichment in Evanston + Chicago South Loop. Amber tier (PreK–gr 2) is open enrollment; Emerald tier (gr 3–8) requires eligibility docs. Tuition from $395. Need-based aid + Jack Kent Cooke partnership. Sessions June 29 – Aug 7, 2026. URL: ctd.northwestern.edu/summer-programs. High confidence.

- **Tynker**: K-12 self-paced platform, ages 5-18. Quarterly $54 / Yearly - **Northwestern CTD Academic Day Camps**: PreK–grade 8 enrichment in Evanston + Chicago South Loop. Amber tier (PreK–gr 2) is open enrollment; Emerald tier (gr 3–8) requires eligibility docs. Tuition from $395. Need-based aid + Jack Kent Cooke partnership. Sessions June 29 – Aug 7, 2026. URL: ctd.northwestern.edu/summer-programs. High confidence.
80 / Lifetime tier; ALL plans cover up to 3 children. 30-day money-back guarantee on all plans. Pricing pulled cleanly from /parents/pricing/ via curl. URL: tynker.com/parents/pricing.
- **Connected Camps**: ages 8-13 (some clubs 9-14), 90-min weekly clubs sold via Outschool. Co-founded by Connie Yowell + UC Irvine prof Mimi Ito. Includes a separate FREE Kid Club Minecraft server (moderated public sandbox). Site is WordPress + Wordfence — clean curl extraction.
- **Khan Academy Kids**: ages 2-8. 100% free, no ads, COPPA-compliant, partnered with Stanford GSE. Distinct from Khan Academy proper (which is already in DB). Award-winner. URL: khanacademy.org/kids.
- **NASA Kids' Club**: K-8 portal organized by grade band (K-4, 5-8). Spanish sub-portal (Sistema Solar). Free federal resource. NASA EXPRESS newsletter is the action-item: weekly student challenges + contests. URL: nasa.gov/learning-resources/nasa-kids-club.
- **CodeCombat**: grades 4-12, ages 9+. JS/Python via game (Kithgard Dungeon RPG + Ozaria narrative). First chapter free. Home premium - **Northwestern CTD Academic Day Camps**: PreK–grade 8 enrichment in Evanston + Chicago South Loop. Amber tier (PreK–gr 2) is open enrollment; Emerald tier (gr 3–8) requires eligibility docs. Tuition from $395. Need-based aid + Jack Kent Cooke partnership. Sessions June 29 – Aug 7, 2026. URL: ctd.northwestern.edu/summer-programs. High confidence.
0-$40/mo range (cited via search snippet — codecombat.com itself is fully Vue SPA, parent pricing not curl-extractable). Schools by quote.
- **RSM Online**: grades 2-10 online (K-12 in-person at 60+ branches). 2026 Summer June 29 - Aug 6, 6-week and 3-week tracks. Tuition by form submission only — cited range $41-- **Northwestern CTD Academic Day Camps**: PreK–grade 8 enrichment in Evanston + Chicago South Loop. Amber tier (PreK–gr 2) is open enrollment; Emerald tier (gr 3–8) requires eligibility docs. Tuition from $395. Need-based aid + Jack Kent Cooke partnership. Sessions June 29 – Aug 7, 2026. URL: ctd.northwestern.edu/summer-programs. High confidence.
10/lesson. Placement test (free) determines level not grade. Includes coding (JS), chess, STEAM, Math/Science/Art Lab. URL: mathschool.com/rsm-online-math.

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

- Best way to flag camps requiring district residency vs open-enrollment? 
- **Next nationwide/remote candidates** (run 7+): MIT App Inventor youth camps, Camp Galileo Online, Zaniac Learning, Stanford OHS K-8 footprint (limited), Davidson Young Scholars enrichment, AOPS Online (separate from Beast Academy), Prodigy Math (free game-based K-8), Russian School of Math in-person locations (CA/MA/NY/NJ branches), Brilliant.org Kids/Family, Studio in a School (NYC arts), 4-H Online STEM, Coursera for Kids partnerships, Outschool 1:1 tutoring vertical (separate product line from group classes already added run 4).
- (Point Defiance scholarships are Pierce-County-only — currently noted in description + scholarshipAid string. Consider top-level `scholarshipResidencyRequired` boolean future-iteration.)
- (run 6 confirmed) National queue is the productive lane — 15 of target-25 done. WA queue still at 16/30. Once national is at 20+, rotate back to WA secondary metros (Spokane Mobius, Olympia, Tacoma TAM, Bainbridge BIMA + BARN, Seattle Public Library Summer Reading).
- Should we have a separate scholarshipAid (Y/N) field at top level vs inline in description? Currently using both: top-level `scholarshipAid` string AND mention in description.
- Future WA targets remaining: Spokane (Mobius Discovery Center — still deferred), Olympia (Hands On Children's Museum), BARN Bainbridge youth artisan camps (8-18), Bainbridge Island Museum of Art summer camps, Bellingham SPARK Museum, Tacoma — TAM and Children's Museum of Tacoma, Spokane Riverfront Park kids programs, Seattle Public Library Summer Reading offshoots, Northwest Outdoor Center youth kayak (Seattle). Done in run 3: Whatcom Family YMCA, Music Works NW, IslandWood, KiDiMu, City of Vancouver P&R. Run 4 pivoted to nationwide/remote anchors (Outschool, Beast Academy, Curious Cardinals, Synthesis, Brain Chase, Northwestern CTD).

## DEFERRED CANDIDATES

- **Mobius Discovery Center (Spokane)** — confirmed real org (children's museum + science center merger, downtown Spokane, 331 N Post St). Camp/class detail not crawlable from landing page; FAQ exists but content is JS-rendered. Defer until we can pull from a parent newsletter or ParentMap listing for current age tiers + dates.


## NEW LESSON FROM 2026-04-26 RUN 7 (CLOBBER INCIDENT)

- **Always pull-rebase before push.** Run 7 cloned to /tmp at the start of execution; mid-run, runs 4-6 plus an ad-hoc grinder commit landed on the remote (added 27 entries to the DB). When run 7 pushed, it fast-forwarded against its own stale base and overwrote the in-between work. Rescue path: `git show <prev-good-sha>:path > base.json`, replay our additions on top, force-push (or normal push if the bad commit is at HEAD). Going forward: ALWAYS run `git pull --rebase origin main` after the initial clone-and-before any commit, OR re-clone fresh into a unique /tmp path right before commit/push.
- **Writable mount can corrupt new git clones.** Cloning into `/sessions/.../mnt/outputs/<new-name>` produces a `.git/config` with mode bytes ahead of the real content (`fatal: bad config line 1`). Workaround: clone into `/tmp/<unique-name>` (e.g., `/tmp/wf_esms_run3_$`) where the working user has full write — then commit and push from there. Don't reuse the long-lived `/sessions/.../mnt/outputs/wayfinder-esms` working copy across multiple runs because rebases there can wedge the index in a state that's impossible for the user to clear (`Operation not permitted` on `.git/index.lock`).

## RUN HISTORY

| Date | Run # | Added | Skipped | Focus | Notable |
|------|-------|-------|---------|-------|---------|
| 2026-04-26 | 1 | 5 (3hi/2md) | 0 | WA — Seattle/Bellevue/Vashon/Orcas | KidsQuest (md), Coyote Central (hi), Burke (hi), Camp Orkila (hi), Camp Sealth (md). Bootstrapped progress file + lessons. |
| 2026-04-26 | 2 | 6 (4hi/3md... wait 4hi/2md after correction) | 0 | WA — Seattle/Bellevue/Tacoma anchors | Woodland Park Zoo (hi), Seattle Aquarium (md cost), Seattle Children's Theatre (md cost+dates), Camp Galileo Bellevue (hi), Music Center NW (hi), Point Defiance Zoo (hi). Caught Pacific Science Center as existing-DB duplicate; substituted Point Defiance. New writable-clone workaround documented. |
| 2026-04-26 | 3 | 5 (3hi/2md) | 0 | WA — Bellingham/Bellevue/Bainbridge/Vancouver (secondary metros) | Whatcom Family YMCA (md cost), Music Works NW (hi), IslandWood (md cost+dates), KiDiMu (hi), City of Vancouver P&R (hi). First non-Seattle WA batch; 0 skips, 0 dedup hits. WA progress 16/30. |
| 2026-04-26 | 4 | 6 (6hi/0md) | 0 | National-remote anchors (per Dan's nationwide priority directive) | Outschool, Beast Academy Online, Curious Cardinals, Synthesis Tutor, Brain Chase, Northwestern CTD. First batch outside WA — all high-confidence; 0 skips. National-anchors queue 6/25. Captured 6 field-note insights (CTD Amber open enrollment; BA sibling discount requires Bundle; Synthesis Tutor vs Teams; Brain Chase early-bird window; Curious Cardinals plan tiers; Outschool 2026 membership pivot). |
| 2026-04-26 | 5 | 3 (3hi/0md) | 3 dedup (Outschool, Beast Academy Online, Brain Chase already added in run 4) | National-anchors continued — nationwide K-8 STEM/math/coding | Mathnasium (hi), Code Ninjas (hi), CodaKid (hi). Six original candidates collapsed to 3 after fetching remote and discovering Outschool/Beast Academy/Brain Chase landed in run 4. Captured 6 field-note insights focused on Mathnasium pricing/sibling discounts, Outschool ESA-fund eligibility + filter caveat, Code Ninjas Unlimited Pass effective rate, CodaKid free-trial trick. Pushed via GitHub REST API after local git tooling hit unrecoverable index/rebase locks on the sandbox mount. |
| 2026-04-26 | 6 | 6 (3hi/3md) | 0 | National-remote anchors continued (per Dan's nationwide priority directive) | Tynker (hi), Connected Camps (md cost), Khan Academy Kids (hi free), NASA Kids' Club (hi free), CodeCombat (md cost), RSM Online (md cost). 0 dedup; loose hits on "Khan Academy" and "NASA" turned out to be different K-8 vs HS programs. Captured 8 field-note insights (Tynker family-plan trick, 30-day refund, Connected Camps free Kid Club server, Khan Academy Kids vs ABCmouse free, NASA Spanish portal, CodeCombat free Chapter 1, RSM tuition-by-form, RSM placement-test placement). National queue 15/25. |


## AD-HOC HARVEST RUN — 2026-04-26 (Dan-initiated, manual)

Per Dan's directive: 'do an ad-hoc grinder run targeting the low-hanging fruit national/remote programs that benefit any state'.

Added 13 high-leverage national/remote K-8 programs:
- Camp Invention 2026 (1500+ host elementary schools nationwide)
- 4-H Cooperative Extension network (every state via land-grant universities)
- FIRST LEGO League Explore (K-4 robotics) + FLL Challenge (4-8 robotics)
- Junior Achievement BizTown + Finance Park (free, corporate-sponsored)
- NPS Junior Ranger Program (free, all 400+ NPS sites)
- iD Tech Online Camps (small-group remote coding)
- Outschool (small-group online classes K-12, $10-30/session)
- AoPS + Beast Academy (math enrichment, $15/mo subscription)
- Khan Academy + Khan Academy Kids (100% free)
- Smithsonian Learning Lab + Affiliate Museums (200+ partners nationwide)
- Code.org (free CS curriculum, 45% of US schools)
- NASA STEM Engagement Virtual Events (free, multiple NASA centers)

Captured 12 parent-facing insights → summer-camp-insights.json field-notes:
- Camp Invention discount-code stacking (4 codes stack)
- 4-H pricing varies by land-grant university
- FLL teams often free through schools/libraries
- JA programs free for school field trips
- NPS Junior Ranger badges across multiple parks
- iD Tech Campers' Choice scholarships
- Outschool Foundation 100% aid
- AoPS Beast Academy $15/mo
- Khan Academy parent dashboard
- Smithsonian Affiliate Museums (200+ nationwide)
- Code.org accounts often pre-provisioned at school
- NASA EXPRESS newsletter for first-access to events

This is the 'low-hanging fruit' batch Dan flagged — programs that benefit
WA + every other state equally. Future grinder runs should continue
expanding this national-anchor coverage before going deeper into local
metros.
| 2026-04-26 | 7 | 3 (0hi/3md) | 3 (Outschool, Beast Academy, Mathnasium — already added by run 6 / ad-hoc) | National STEM franchises | Mad Science, Engineering For Kids, Play-Well TEKnologies (all md cost — varies by franchise/host). Recovered from a clobber-rebase incident; learned NEVER to push from a stale base clone — always pull-rebase first. Captured 3 net-new field-note insights. |


## AD-HOC HARVEST RUN ROUND 2 — 2026-04-26

Per Dan: 'do another non-duped iteration to add to this national data adder feed.'

Added 13 more national/remote programs (no duplicates with round 1):
- Boys & Girls Clubs of America (4500+ clubs, $20-30/yr membership)
- YMCA Youth Programs (Open Doors 100% scholarship)
- Scholastic Summer Reading Challenge (free K-6 literacy)
- Google CS First (free K-8 coding curriculum, 8 themed clubs)
- Microsoft DigiGirlz Day (free middle school girls STEM events)
- Carnegie Hall Link Up (free K-3 music with 90+ partner orchestras)
- PJ Library (free monthly Jewish-themed books, all faiths welcome)
- Nat Geo Kids + Slingshot Challenge ($10K youth climate-action prize)
- PBS Kids Summer Learning (free preschool through grade 3)
- Civil Air Patrol Cadet Program (USAF auxiliary, ages 12-18)
- Junior Master Gardener (USDA Coop Extension partnered)
- Destination Imagination (creative problem-solving K-12)
- National History Day (research competition grades 6-12)

13 new field-note insights captured to summer-camp-insights.json.

Total ad-hoc national/remote programs added: 26 (round 1: 13 + round 2: 13).
The grinder will dedup these (matched on name+provider lowercase) on its
next regular run. Future grinder runs should expand to:
- More museum networks (AMNH, Field Museum, Exploratorium, Adler Planetarium)
- More tech corps programs (Apple Camp at Apple Store, Tynker, ScratchJr)
- Faith-based + cultural programs (Hispanic Heritage Foundation, etc.)
- Disability-inclusive programs (Autism camps, deaf/HoH summer programs)


## AD-HOC HARVEST RUN ROUND 3 — 2026-04-26

Per Dan: 'do another ad hoc run on the national front. even some
international if there are any obvious foreign large entities.'

Added 14 more national + international K-8 programs:

INTERNATIONAL (4):
- CISV International (peace education, 60+ countries, age 11+)
- Concordia Language Villages (14+ languages immersion, MN)
- EF Language Travel Camps (50+ international cities, ages 10+)
- WWOOF Family Stays (12,000 organic farms, 130 countries)

US ACADEMIC COMPETITIONS (5):
- MATHCOUNTS (free middle school math competition)
- VEX IQ Challenge (elementary + middle robotics)
- eCYBERMISSION (Army STEM, \$9K savings bonds prizes)
- Future City Competition (engineering grades 6-8)
- Science Olympiad Division B (grades 6-9)

MAJOR MUSEUM CAMPS (3):
- AMNH Discovery Squad + Children's Camps (NYC)
- Exploratorium Summer Camps (SF)
- Field Museum Summer Camps + Junior Curators (Chicago)

CORPORATE / FREE (1):
- Apple Camp at Apple Store (free 90-min, 300+ stores)

DISABILITY-INCLUSION (1):
- Best Buddies International (school chapters all 50 states + 50 countries)

Total ad-hoc national/remote/international additions across 3 rounds:
40 programs + 38 parent-facing field-note insights.

Future grinder runs should expand into:
- Faith-based + cultural (Jewish, Islamic, Hindu, secular humanist youth)
- Disability-inclusive sports + arts (Special Olympics Unified, etc.)
- Hispanic/Latino + Asian American cultural orgs (e.g., Hispanic Heritage
  Foundation, Asian Pacific American Forum, AAJA)
- Ecology/conservation field schools (Audubon, Sierra Club, NWF, NPCA)
- Native American/Indigenous youth programs
- Religious-affiliated camps (Christian, Jewish, Muslim, Buddhist) with
  clear non-coercive participation policies


## AD-HOC HARVEST RUNS — ROUNDS 4-7 (2026-04-26)

Per Dan: '3-4 properly sized/targeted incremental grinds'.

ROUND 4 — Faith-based + cultural identity (7):
- Foundation for Jewish Camp One Happy Camper grant
- Catholic Heart Workcamp
- Hispanic Heritage Foundation Youth Awards + LOFT
- Plum Village Mindfulness Family Retreats
- FGC Quaker Family Camp
- AAJA youth programs
- Hispanic Scholarship Fund Youth Leadership Institute

ROUND 5 — Conservation + outdoors (7):
- Sierra Club ICO
- NWF Eco-Schools USA
- NPS Every Kid Outdoors (free 4th-grade pass)
- Audubon for Kids
- NOAA Planet Stewards (\$5K project funding)
- Outdoor Afro
- Earthwatch Family Expeditions

ROUND 6 — Disability-inclusive (6):
- Special Olympics Unified Champion Schools
- Easterseals
- Camp Korey (SeriousFun)
- Friendship Circle
- AHRC NY
- Autism Society local affiliate network

ROUND 7 — Indigenous + LGBTQ+ + arts + sports (6):
- AISES Pre-College
- Native Like Water
- Camp Brave Trails
- Family Equality Family Week
- Interlochen Arts Camp Junior Programs
- USA Junior Olympic pipeline (multi-NGB)

CUMULATIVE TOTALS (across all 7 ad-hoc rounds):
- Programs added: 66 (rounds 1-7)
- Field-note insights: 64 captured
- Geographic coverage: nationwide + 4 international (CISV, Concordia,
  EF, WWOOF, Plum Village France) + Earthwatch field sites worldwide
- Categories: STEM, arts, leadership, service, non-traditional,
  faith-based, cultural-identity, disability-inclusive, conservation,
  sports, performing arts, robotics, math, language immersion

NEXT GRINDER PRIORITY ZONES (handed off to /15-min cron grinder):
- Major-metro day-camp deepening (Boston, Chicago, Phoenix, Atlanta,
  DC metro, Houston, Denver, Detroit)
- WA/CA/NY metro local-program coverage
- Religious-school summer programs (parochial schools)
- Suburban day-camp networks (KE Camps, Kids in the Game, Harlem RBI)

## RUN 8 — 2026-04-26 (nationwide-remote, post-WA-conclude)

Added 6 nationwide/remote K-8-eligible programs:
- **Juni Learning 1:1 Online** (high) — $140-$450/mo, 2-wk free trial, ages 7-18
- **iCode National Summer STEM Camps** (medium cost) — 244+ US locations, ages 6-18, $400-$700/wk
- **Snapology LEGO STEAM Camps** (medium cost) — national franchise, ages 4-14
- **Bricks 4 Kidz LEGO Camps** (medium cost) — national franchise, ages 5-14, NEW for 2026: choose-your-own-adventure
- **Create & Learn Online** (high) — small-group (3-5 students), ~$30/hr, free intro classes, K-12
- **Codingal Online Summer Camp** (medium cost) — STEM.org accredited, ages 6-18

6 field-note insights captured. Field-notes section at 30/30 cap (oldest 6 dropped on PREPEND).

## DIRECTIVE CHANGE — 2026-04-26 (Dan)

> "after you finish this round, move onto the top 10 or so for each major state/metro areas. conclude wa state at this point. progressively should keep iterating and have basic coverage"

**WA state CONCLUDED** in `esms-grinder-progress.json`. Sufficient coverage: 17+ esms-grinder entries spanning Seattle, Bellevue, Vashon, Orcas Island, Tacoma, Bellingham, Vancouver, Bainbridge, plus IslandWood. Future WA additions only when a clear gap surfaces.

**Next iterations: state-by-state, ~10 per state**, rotating in this order (codified in `progress.plan.nextStateOrder`):

1. CA (Bay Area, LA, San Diego, Sacramento) — start here
2. NY (NYC, Long Island, Westchester)
3. TX (Houston, Austin, Dallas, San Antonio)
4. MA (Boston, Cambridge, Worcester)
5. MI (Detroit Metro, Ann Arbor, Grand Rapids)
6. IL (Chicago metro)
7. PA (Philly, Pittsburgh)
8. GA (Atlanta metro)
9. FL (Miami, Orlando, Tampa)
10. CO (Denver, Boulder)
11. OR (Portland)
12. DC metro (DC, MD, VA)

Per-state target: 10 verified K-8 programs. Cadence: 1 state-batch per run, rotate to next. Mix in nationwide/remote opportunistically when they fill genuine gaps. Major metros first — secondary cities come later.

**Run 9 should start CA** — Bay Area anchor orgs to research first: Tech Interactive (San Jose), Exploratorium (SF), CuriOdyssey (San Mateo), Lawrence Hall of Science (Berkeley), Children's Discovery Museum SJ, San Mateo County Park ranger camps, JCC Berkeley, Roughing It Day Camp (Lafayette). Existing dedup risk: Camp Galileo Bay Area sites — many are likely already in DB; check before listing.

## CALIBRATION UPDATE

- Batch size 6 still comfortable when targeting well-known online/national orgs. Maintain 6 for state-batches.
- DEDUP CRITICAL: many "obvious" national programs (Outschool, Beast Academy, Code Ninjas, Curious Cardinals, Synthesis, Brain Chase, AoPS, Khan Academy, iD Tech, Camp Invention, Tynker, Mathnasium) are now ALREADY in DB from prior ad-hoc and round runs (920+ programs as of run 8). Always run name-substring grep against existing programs before deciding candidate list.
- Permission gotcha: `/sessions/.../mnt/outputs/wayfinder-esms` was NOT writable on this run after `cp -r` — files came over with read-only perms. Workaround: clone fresh into `/tmp/esms-work/wayfinder` and work entirely from there. Both `/tmp/wayfinder-esms` and `/sessions/.../mnt/outputs/wayfinder-esms` had permission issues; `/tmp/esms-work/wayfinder` was clean.
- ESM gotcha: package.json declares `"type": "module"`, so any `node` script using `require()` must use `.cjs` extension. All future inline grinder scripts: name them `*.cjs`.
- PUSH-CONFLICT gotcha: programs.json + summer-camp-insights.json get concurrent commits from k12-grinder, ad-hoc rounds, and harvest tasks. Plan for conflict on push. Workflow: commit → try push → on rejection, abort/reset to origin/main, re-run update script (which is idempotent on dedup), recommit, push.

## RUN HISTORY (UPDATED)

| Date | Run # | Added | Skipped | Focus | Notable |
|------|-------|-------|---------|-------|---------|
| 2026-04-26 | 1 | 5 (3hi/2md) | 0 | WA — Seattle/Bellevue/Vashon/Orcas | Bootstrapped progress + lessons |
| 2026-04-26 | 2 | 6 (4hi/2md) | 0 | WA — Seattle/Bellevue/Tacoma anchors | Caught PSC pre-existing dup |
| 2026-04-26 | 3-7 | various | various | WA expansion + ad-hoc national rounds | DB grew from 837 → 926 via mix of esms-grinder + ad-hoc + round runs |
| 2026-04-26 | 8 | 6 (2hi/4md-cost) | 0 | nationwide-remote (Juni, iCode, Snapology, Bricks 4 Kidz, Create & Learn, Codingal) | WA concluded by Dan directive. Next iterations: ~10 per state starting CA. Field-notes hit 30/30 cap. Push conflicted once with concurrent commits — resolved by reset/replay. |

## RUN 9 — NSBE / Diversity-anchored national STEM (2026-04-26)

### What landed (6/6, 0 skipped after dedup)
1. **NSBE SEEK** (high) — FREE 3-week virtual program, rising 4th-6th, materials shipped at no cost.
2. **Math Beasts Camp / AoPS Academy** (medium-cost) — distinct sub-product from "Beast Academy Online" already in DB. Live online K-5 math camps in 2-week / 4-week formats.
3. **Northwestern CTD Solstice Online (Grades 4-6)** (medium-cost) — distinct from general "Northwestern CTD Academic Day Camps" already in DB. No district nomination required (key parent-facing insight).
4. **CodeWizardsHQ** (high) — virtual coding ages 8-18, 1-week themed + 3-week accelerated formats.
5. **Black Girls CODE Summer Camp 2026** (high) — 10 US cities + 2 virtual sessions, mostly $0 via sponsorship. Game design theme.
6. **AAUW Tech Trek** (high) — week-long residential STEM at university campuses for rising 8th-grade girls. $50 family fee covers $1,000+ program via AAUW donations.

### Stale-clone gotcha (NEW LESSON — IMPORTANT)
- The pattern of cloning into `/tmp/wayfinder-esms` PLUS copying into `/sessions/.../mnt/outputs/wayfinder-esms` produced a STALE working copy: the lessons file in that copy showed only runs 1-2, but the actual remote was already at run 8 with 932 programs. The copy step had been done at the start of an earlier session and persisted.
- **Workaround applied**: Did a fresh `git clone` into `/tmp/wfg2` (newly-named, fresh-perms) right before commit. Compared `/tmp/wfg2/programs.json` to my outputs and discovered 3 of my 6 candidates were already in DB (Outschool, Play-Well, Engineering For Kids — all added in runs 4-8 by ad-hoc and round runs). Substituted CodeWizardsHQ, Black Girls CODE, AAUW Tech Trek as drop-in replacements.
- **Future-proof rule**: Always `git pull` (or fresh clone) IMMEDIATELY before dedup check, not at the start of session. The grinder is one of multiple writers (esms-grinder, k12-grinder, ad-hoc rounds, harvest tasks) and the DB state shifts within a single calendar day. Treat any local cache >2 hours old as definitely stale.

### Permission gotcha continues
- `/sessions/.../mnt/outputs/wayfinder-esms` was unwritable for git operations on this run too (`Operation not permitted` on .git/index.lock). Worked around by doing all git work in `/tmp/wfg2` (fresh clone, owned by adoring-gracious-gauss). Same as the lesson noted in run 8: don't use the mounted folder for git, only for staging file content.

### Insight capture (6 new field-notes prepended; cap held at 30)
- AAUW Tech Trek $50 covers $1,000+ residential STEM week
- NSBE SEEK open to all students despite name
- Black Girls CODE most participants pay $0 via sponsorship
- Northwestern CTD Solstice no district nomination required
- Math Beasts Camp placement is by readiness not strict grade
- CodeWizardsHQ money-back guarantee does NOT cover summer camps

### Run history (appended)
| Date | Run # | Added | Skipped | Focus | Notable |
|------|-------|-------|---------|-------|---------|
| 2026-04-26 | 9 | 6 (4hi/2md) | 3 (initially picked, found in DB after fresh-clone dedup) | National-anchors — diversity + advanced + virtual K-8 STEM | NSBE SEEK, Math Beasts Camp, Northwestern CTD Solstice, CodeWizardsHQ, Black Girls CODE, AAUW Tech Trek. Caught stale-clone problem; new lesson added. |

## RUN 10 — FREE/FREEMIUM ONLINE K-8 BATCH (2026-04-26, replay after rebase incident)

### What happened (operationally)
- Initial attempt at this run (commit e6ccc30) was based on a STALE `/sessions/.../mnt/outputs/wayfinder-esms` clone showing only runs 1-2. Pushing it clobbered runs 3-9 on the remote (938→843 programs, lost ~95 entries). **Reverted with commit 22fbbbc within minutes**, then re-cloned cleanly into `/sessions/brave-exciting-rubin/tmp/wf-push` (the `mnt/outputs` mount had permissions/disk issues — `/tmp` on `/` was at 100% used and `mnt/outputs/` had stuck `.git/config.lock` from the bad clone).
- **NEW LESSON: `/sessions/brave-exciting-rubin/tmp/` is the writable scratch space when `mnt/outputs/` and `/tmp` are degraded.** Adopt this as the default writable-clone location going forward.
- **NEW LESSON: when a stale local clone is suspected, ALWAYS check `git log --oneline | head` against the remote BEFORE editing.** A 2-line log when the remote has 9+ recent commits is a smoking gun.

### What worked (research)
- All 6 picks: Camp Wonderopolis (free, NCFL), Camp CrunchLabs (Mark Rober, $329.40/12wk), Generation Genius (K-8 NGSS science), Mystery Science (K-5 science, free trial through June 30 2026), Maker Camp by Make: (free 6-week), BrainPOP/BrainPOP Jr ($129/$159 family). All verified via search snippets — no JS-heavy fetches needed.
- **NEW DEFUNCT-CHECK PATTERN**: NaNoWriMo Young Writers Program was on the candidate list. Quick "shutdown 2025" search caught that the parent NaNoWriMo nonprofit closed March 2025 and YWP is no longer active. Always run a "shutdown OR closure OR defunct" sanity search on any nonprofit-affiliated candidate before adding.

### Source notes
- **Camp Wonderopolis**: Genuine free, 350K+ learners, current edition is music-themed. Fully high-confidence.
- **Camp CrunchLabs**: $329.40/12 weeks ships physical Build Boxes weekly + Mark Rober videos. Auto-rolls to $27.45/month subscription unless cancelled — flagged as field-note.
- **Generation Genius**: 14-day no-card trial; subscription price not posted publicly. Marked medium with `_unverifiedFields: ["paidSubscriptionPrice"]`.
- **Mystery Science**: 50%+ of US elementary schools use it. Free trial currently extended through June 30, 2026 (no card). Acquired by Discovery Education. Subscription price not on landing page — medium confidence.
- **Maker Camp**: 2,000+ host sites worldwide. Free 6-week structured summer; can be run anytime by family. Badge system. High confidence.
- **BrainPOP**: $129/yr family (3-8), +$30/yr for combo with Jr. (K-3) → $159/yr. 30-day free trial REQUIRES card and auto-converts — flagged as field-note. High confidence on pricing.

### Calibration
- **Hold at 6/run, even after replay**. Replay batch ran cleanly with zero skips; no signal to push higher.
- **Add `git log --oneline -5` against remote BEFORE EVERY EDIT as a mandatory check** in the run-flow.



## RUN 11 — RACE-CONDITION RECOVERY (originally planned as run 3)

### Outcome
- Started with DB at 837. Researched 6 nationwide/online programs (Outschool, Brain Chase, Mathnasium, Synthesis Teams, Code Ninjas, Connected Camps) + 6 field-note insights.
- Between research start (~19:46) and final commit attempt (~20:05), at least 8 concurrent grinder runs landed on remote — DB grew 837 → 944. 5 of my 6 candidates were claimed by ad-hoc/concurrent runs in parallel.
- Synthesis Teams remained unique → added. All 6 of my insights were novel → captured. (Insight survives races much better than program entries.)

### New patterns
- Pre-research dedup CHECK + post-research RE-DEDUP both required. Race window can be ~minutes.
- Filesystem permission woes in /sessions/.../mnt/outputs prevent some `git` operations: `cp -r` of a clone induces mode-changes; `.git/index.lock` can be stuck and unremovable. WORKAROUND: use `GIT_INDEX_FILE=/tmp/git-index` env var for index ops, run `git config core.fileMode false`, work via `read-tree FETCH_HEAD` + plumbing.
- Direct cloning into `/sessions/.../mnt/outputs/<name>` fails with `bad config line 1` if the same path was previously cp'd. Use a fresh path or rsync instead of cp.
- When research target is hot (nationwide/online programs are everyone's "low-hanging fruit"), expect dupes. Pivot toward narrower geographic targets that fewer parallel grinders are working on.



## RUN 12 — CA INITIAL BATCH (Bay Area + LA + San Diego anchors)

### Outcome
- DB was at 945 after run 11; after this run total = 950 (+5).
- All 5 high-quality CA anchors (4 high / 1 medium): Steve & Kate's Camp (Bay Area + LA), Lawrence Hall of Science (UC Berkeley), CAMP at The Tech Interactive (San Jose, md cost), California Science Center (LA), Birch Aquarium / Scripps (San Diego). 0 skips, 0 dedup hits.
- 5 net-new field-note insights captured (Steve & Kate's auto-refund passes; Lawrence Hall 2-week sessions vs 1-week peers; CSC half+afternoon flexible scheduling; Birch quiet Scripps scholarships; The Tech IMAX + after-hours bundled).
- Field-notes section was already at 30 cap from prior runs; new items prepended and oldest dropped (5 dropped to fit 5 new).

### What worked
- **Pivot to CA** per Dan's plan directive (WA concluded; cadence=1 state per run, CA first). Confirmed plan via progress.json before research.
- **Pre-research dedup check** caught 0 collisions on 5 candidates — CA museum/science-center camps weren't yet in DB (only Bay Area Camp Galileo + Burke + Pacific Science Center on the WA side). Plenty of room in CA.
- **Search-snippet pricing** consistently captured tuition + member-vs-public-presale dates without needing full HTML fetches. The CA museum/science-center sites typically post tuition cleanly in search snippets.
- **Recovery from /tmp permission failures**: discovered $HOME/work/ is the correct writable + git-friendly clone location. /sessions/.../mnt/outputs has weird mount restrictions (locked .git/index.lock unrecoverable; cp -r induces mass mode changes). Future runs should clone direct to $HOME/work/wf, NOT /tmp or /sessions/.../mnt/outputs.

### Calibration
- 5/run on a fresh state where DB has light coverage works well. Could push to 6 next CA run if Bay Area/LA/SD are tapped out and we move to Sacramento or Inland Empire (smaller pool — risk of skips).
- **Mandatory pre-flight steps** going forward:
  1. `git clone <token-url> $HOME/work/wf-<runID>` (NOT /tmp; NOT /sessions/.../mnt/outputs)
  2. Inspect existing-DB names + the latest progress.json plan section BEFORE picking research candidates
  3. After research, RE-DEDUP since other runs may have landed in parallel

### Source notes (CA run 12)
- **Steve & Kate's Camp**: PreK–7 ages 4–13. Day Pass model: $114/day at 15+ pass tier. 15+ Bay Area sites + multiple LA sites. Unused passes auto-refund. URL: steveandkatescamp.com/fees/
- **Lawrence Hall of Science**: UC Berkeley public science center. Grades 1–6. $625–$950/wk. 2-WEEK sessions (rare). Member presale before general (Jan 2 2026). Financial aid open.
- **CAMP at The Tech Interactive**: San Jose, rising 3rd–6th. 8 weekly sessions June 15–Aug 7. Tuition NOT on landing page — medium confidence with `_unverifiedFields: ["cost","scholarshipAid"]`. New format replacing prior Galileo-at-The-Tech partnership.
- **California Science Center**: LA Exposition Park. Pre-K through 8. Member presale Feb 18–24 closes BEFORE general. Half + afternoon classes combine to make full day (flexible scheduling). $225 half / $450 full per week (member); extended care $110-$120/wk.
- **Birch Aquarium**: La Jolla / Scripps / UCSD. K-8+ (extends to grade 9 via Surfing Into Science). $250–$600/wk. Needs-based scholarships not advertised — email birchaquariumprogram@ucsd.edu.

### Open questions
- Should we add a top-level `presaleWindow` or `memberOnlyRegistrationOpens` field? Multiple CA museums (CSC, Lawrence Hall, Birch) all gate first-tier access via membership presale, then open to public. Currently noted in description + deadline — could be a structured filter.
- Most CA anchors have undisclosed scholarship policies that require email follow-up. Worth a "scholarshipDisclosed" boolean to rank programs by transparency for parents on tight budgets.

