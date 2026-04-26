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

## RUN HISTORY

| Date | Run # | Added | Skipped | Focus | Notable |
|------|-------|-------|---------|-------|---------|
| 2026-04-26 | 1 | 5 (3hi/2md) | 0 | WA — Seattle/Bellevue/Vashon/Orcas | KidsQuest (md), Coyote Central (hi), Burke (hi), Camp Orkila (hi), Camp Sealth (md). Bootstrapped progress file + lessons. |
| 2026-04-26 | 2 | 6 (4hi/3md... wait 4hi/2md after correction) | 0 | WA — Seattle/Bellevue/Tacoma anchors | Woodland Park Zoo (hi), Seattle Aquarium (md cost), Seattle Children's Theatre (md cost+dates), Camp Galileo Bellevue (hi), Music Center NW (hi), Point Defiance Zoo (hi). Caught Pacific Science Center as existing-DB duplicate; substituted Point Defiance. New writable-clone workaround documented. |
| 2026-04-26 | 3 | 5 (3hi/2md) | 0 | WA — Bellingham/Bellevue/Bainbridge/Vancouver (secondary metros) | Whatcom Family YMCA (md cost), Music Works NW (hi), IslandWood (md cost+dates), KiDiMu (hi), City of Vancouver P&R (hi). First non-Seattle WA batch; 0 skips, 0 dedup hits. WA progress 16/30. |
| 2026-04-26 | 4 | 6 (6hi/0md) | 0 | National-remote anchors (per Dan's nationwide priority directive) | Outschool, Beast Academy Online, Curious Cardinals, Synthesis Tutor, Brain Chase, Northwestern CTD. First batch outside WA — all high-confidence; 0 skips. National-anchors queue 6/25. Captured 6 field-note insights (CTD Amber open enrollment; BA sibling discount requires Bundle; Synthesis Tutor vs Teams; Brain Chase early-bird window; Curious Cardinals plan tiers; Outschool 2026 membership pivot). |
| 2026-04-26 | 5 | 3 (3hi/0md) | 3 dedup (Outschool, Beast Academy Online, Brain Chase already added in run 4) | National-anchors continued — nationwide K-8 STEM/math/coding | Mathnasium (hi), Code Ninjas (hi), CodaKid (hi). Six original candidates collapsed to 3 after fetching remote and discovering Outschool/Beast Academy/Brain Chase landed in run 4. Captured 6 field-note insights focused on Mathnasium pricing/sibling discounts, Outschool ESA-fund eligibility + filter caveat, Code Ninjas Unlimited Pass effective rate, CodaKid free-trial trick. Pushed via GitHub REST API after local git tooling hit unrecoverable index/rebase locks on the sandbox mount. |
| 2026-04-26 | 6 | 6 (3hi/3md) | 0 | National-remote anchors continued (per Dan's nationwide priority directive) | Tynker (hi), Connected Camps (md cost), Khan Academy Kids (hi free), NASA Kids' Club (hi free), CodeCombat (md cost), RSM Online (md cost). 0 dedup; loose hits on "Khan Academy" and "NASA" turned out to be different K-8 vs HS programs. Captured 8 field-note insights (Tynker family-plan trick, 30-day refund, Connected Camps free Kid Club server, Khan Academy Kids vs ABCmouse free, NASA Spanish portal, CodeCombat free Chapter 1, RSM tuition-by-form, RSM placement-test placement). National queue 15/25. |
