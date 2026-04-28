# wayfinder-esms-grinder — Lessons Learned

> Read at the START of every run. Append takeaways at the END before push.
> This grinder adds verified summer camps + enrichment programs for ELEMENTARY (K-5) and MIDDLE SCHOOL (6-8) students to the existing programs.json database.

## CURRENT CALIBRATION (latest accepted values)

- batch_size: 6 entries per run (run 14 held at 6, 0 skips, 5 high + 1 high — California museum/aquarium anchors landed cleanly)
- typical_run_duration: ~10 min
- typical_skip_rate: 0% (runs 1-6, 8, 12, 14)
- last_calibration_change: 2026-04-27 — held at 6 for run 14; CA museum/aquarium/science-center anchors yielded all-high-confidence batch. Pricing surfaces well in landing-page text or "Learn More" sub-pages.

## EFFECTIVE PATTERNS (validated)

- WA-first metros that work well: **Seattle (museums/aquarium/zoo/theater/music), Bellevue (children's museum, Galileo), Vashon Island (Camp Fire), Orcas Island (YMCA), Tacoma (Point Defiance Zoo)**.
- **Secondary WA metros now confirmed productive (run 3)**: Bellingham (Whatcom Family YMCA), Bainbridge Island (IslandWood, KiDiMu), Vancouver WA (City Parks & Rec). Bellevue (Music Works Northwest) is also still mining well beyond Galileo + KidsQuest.
- ANCHOR ORG TYPES that reliably yield ES/MS programs:
  - **Children's museums** — KidsQuest (Bellevue), Seattle Children's Museum, etc. Most run summer camps for ages 4-10.
  - **Natural-history / science museums** — Burke Museum (Seattle), Pacific Science Center, NHM Los Angeles (run 14), Fleet Science Center San Diego (run 14), MOSAC Sacramento (run 14). Day camps with grade-banded sessions; 6-9 themed weeks. NEAR-UNIVERSAL pattern: tier 1 (TK-K half-day), tier 2 (grades 1-2), tier 3 (3-5/3-4), tier 4 (6-8 specialty/maker/design lab).
  - **Zoos / aquariums** — Woodland Park Zoo (Seattle), Point Defiance Zoo & Aquarium (Tacoma), Seattle Aquarium, Aquarium of the Pacific Long Beach (run 14), Cabrillo Marine Aquarium San Pedro (run 14). Most run NGSS-aligned age-tiered camps with scholarships.
  - **YMCA residential camps** — Orkila (Orcas), other YMCA chapters across states.
  - **Camp Fire / BGCA / Girl Scouts council camps** — Camp Sealth (Camp Fire CPS) is the WA model.
  - **Pay-what-you-can arts orgs** — Coyote Central (Seattle), Music Center of the NW.
  - **Children's theater** — Seattle Children's Theatre Drama School. Age-banded creative drama camps.
  - **National camp networks (regional sites)** — Camp Galileo, Steve & Kate's, Discovery Cube (run 14 — dual OC+LA campuses with identical curriculum).
  - **University youth programs** — already well-covered in existing DB (Robinson Center, UW Engineering, DigiPen, Lawrence Hall of Science).
  - **City Parks & Rec marine/coastal programs** — Cabrillo Marine Aquarium (run 14) is a STANDOUT example: operated by LA City Recreation & Parks, prices summer marine-science 4-day camps at $85 (a quarter of comparable peer aquariums). Look for similar municipal-coastal anchors in other CA harbor cities (San Diego, Santa Cruz, Monterey).
- **Nationwide/remote anchors are the highest-leverage tier** (run 4 confirmed): Outschool, Beast Academy Online, Curious Cardinals, Synthesis Tutor, Brain Chase, Northwestern CTD all yielded high-confidence entries.
- **Run 14 reinforced the CA museum/aquarium tier**: All-high-confidence batch (Aquarium of the Pacific Long Beach, NHM Adventures in Nature, Fleet Science Center San Diego, Discovery Cube OC+LA, MOSAC Sacramento, Cabrillo Marine Aquarium San Pedro). Pricing surfaces cleanly via WebFetch + sed + grep on landing pages OR via "Learn More" sub-pages — even when the museum's CMS is a JS-heavy Drupal/WP install. Landing-page text snippets typically contain explicit `Members $X | General $Y` patterns. Strategy that worked: fetch landing page, pipe through `sed 's/<[^>]*>//g' | tr -s '[:space:]' ' '` to flatten, then grep for `\\\$|cost|member|grade|register|2026`. Most CA anchors include scholarship/aid mentions inline (often on a separate FAQ tab) — note that some require email follow-up (Aquarium of the Pacific) while others are publicly transparent (Cabrillo Marine Aquarium / MOSAC).

## FAILED PATTERNS / KNOWN ANTI-PATTERNS

- **Concurrent grinder runs cause stale-clone problem**: Mitigation: re-fetch the remote `programs.json` raw via API before final write, run dedup again, then push only the diff.
- **Cloudflare-protected sites** block curl + WebFetch. Workaround: triangulate via search-result snippets + ACA listings + the org's social media.
- **Squarespace sites** load content via JS — raw curl returns boilerplate. Same workaround.
- **Sub-page 403s on NHM**: Some NHM "Adventures in Nature" specific session pages return 403 ("there's a sauropod between you and this page") to bots — the parent landing page (`/adventures-nature`) is fine. Lesson: get pricing from the parent page or via search-snippet pricing lookups (which surface from older NHM cached content), not from individual themed-week pages.
- **Powerhouse Science Center is a NAME COLLISION**: The Sacramento "Powerhouse Science Center" rebranded to **SMUD Museum of Science and Curiosity (MOSAC)** at visitmosac.org. The powsci.org domain belongs to a DIFFERENT org — Powerhouse Science Center in Durango, Colorado (run 14 originally researched powsci.org thinking it was Sacramento). Always cross-check the city/state in the address before adding. Sacramento = visitmosac.org; Durango = powsci.org.
- **Monterey Bay Aquarium does NOT run a traditional K-8 day camp**. Their primary K-8 offering is "Underwater Explorers" (90-min sessions ages 8-13, $120/$150) — not multi-day camp. Skip MBA for the camp grinder; consider it for an "experiences" sub-product if Wayfinder ever adds that category.
- **Aquarium of the Pacific 2026 sold out within 24h** of public March 12 registration. This is consistent with the WA aquarium pattern (Seattle Aquarium, Point Defiance) where members get 1-3 weeks early access. For 2027: calendar member-presale dates 6 weeks ahead.

## SOURCE-SPECIFIC NOTES (CA — RUN 14)

- **Aquarium of the Pacific (Long Beach)**: Five tracks — Fish Fry (3-4yo with adult), Sea Squirts (5-6), Ocean Adventure (7-9), Junior Biologist (10-12), Coastal Explorer (10-12 + whale watch). $275/$250 member for ages 7-12. Member presale March 11, 2026; general March 12. ALL 2026 sessions sold out. Tuition assistance not publicly advertised — email education@lbaop.org. URL: aquariumofpacific.org/education/camps.
- **NHM Adventures in Nature (Los Angeles)**: Grades K-5; 6 themed weeks at NHM (Insect Investigators, Raptor Rangers, Pod Patrol, Nocturnal Neighbors, Paleo Tales, Museum Makers) + 1 week at La Brea Tar Pits. June 29 - Aug 7, 2026. $400 non-member / $360 member per week. Optional 3-5pm extended care +$75/week. Funded by LADWP. URL: nhm.org/adventures-nature. Sub-page 403s; landing page is the canonical source.
- **Fleet Science Center (San Diego)**: TK-grade 8. Full-day 5-day weeks $425/$350 member. Half-day TK-K 5-day weeks $225/$200 member. 4-day weeks priced lower ($340/$280 full; $180/$160 half). June 1 - Aug 19, 2026. Themed grade-banded weeks (Spy Academy, Inventors in Wonderland, Movie Magic, STEM Adventures with Inspiring Women, etc.). URL: fleetscience.org/events/camps.
- **Discovery Cube OC + LA**: Grades K-5. Both campuses (Santa Ana + Sylmar) run identical curriculum. M-F 9am-4pm; optional 2pm early-pick-up for K-2 saves $100-$130/week. Themes vary by grade band (K-2 Wild Wilderness/Busy Bots; 3-5 STEAM Studio/Robo-Lab). Pricing $365-$445 non-member full-day. Phone (714) 542-2823 / customerservice@discoverycube.org. URL: discoverycube.org/camp.
- **SMUD Museum of Science and Curiosity (MOSAC, Sacramento)**: Rising K-8. Three pricing tiers — K Half-day $275/$255 member; 1-6 Standard $435/$415 member; 5-8 Design Lab Specialty $545/$525 member. Member registration opens by grade band March 18-20, 2026; general April 1-3, 2026. Family Duo level or above required for member rate + early access. 400 Jibboom St, Sacramento. URL: visitmosac.org/learn/camps.
- **Cabrillo Marine Aquarium (San Pedro)**: City of LA Recreation & Parks asset. Tales Between the Tides (3-5, 2-day) $26/$24 Friends member. Grades 1-2 Galloping Snails / 3-4 Crab Shells / 5-6 Ichthyology / 7-8 Coastal Research — all 4-day, 9am-12pm, $85/$77 Friends member with t-shirt included. Member reg opens March 2, 2026; non-members March 16. (310) 548-7562. URL: cma.recreation.parks.lacity.gov/programs/public-programs.

(Older source notes from runs 1-13 retained in git history at backend/data/scraped/lessons/wayfinder-esms-grinder-lessons.md commits prior to 2026-04-27.)

## DATA QUALITY FLAGS

- Existing `programs.json` schema uses object-shaped `cost` (`{amount, type, display}`) and object `location` (`{city, state}`). Grinder writes both this canonical shape AND task-spec extras (`scope`, `dates`, `scholarshipAid`, `registrationUrl`, `howToStart`, `confidence`). Backward-compatible — extras are ignored by the search route.
- All grinder entries tagged `_addedBy: "esms-grinder"` for future isolation.

## CALIBRATION SUGGESTIONS

- 6 entries/run is comfortable when targeting well-known anchor orgs in a single state. Run 14 (CA museum/aquarium anchors) confirmed: 0 skips, 6/6 high confidence, all pricing publicly verifiable.
- When existing DB shows ANY pre-existing entry for a candidate org, check what's already there before researching — saves WebSearch budget. Run 14 dedup-checked 20+ candidates before researching; 0 collisions on the chosen 6.
- Spread across at least 2 metros per run. Run 14 hit Long Beach + Los Angeles + San Diego + Santa Ana/Sylmar + Sacramento + San Pedro — excellent geographic spread within CA.

## CONFIDENCE TIERS

- `confidence: "high"` — all required fields verified
- `confidence: "medium"` — org clearly real, 1-2 fields couldn't be confirmed publicly. Add `_unverifiedFields: [...]` array. Description appends caveat.
- SKIP — only when org can't be verified or appears defunct

## OPEN QUESTIONS / TODO

- Best way to flag camps requiring district residency vs open-enrollment? 
- **Next CA candidates** (run 15+): Crystal Cove Conservancy (OC), New Children's Museum (San Diego), Habitot Children's Museum (Berkeley — verify still open), Children's Creativity Museum (SF), Cayton Children's Museum (Santa Monica), Crocker Art Museum kids camps (Sacramento), Effie Yeaw Nature Center (Sacramento), LACMA / Huntington kids art camps (LA / San Marino), Heal the Bay Aquarium Science Camp (Santa Monica), Aquarium of the Bay (SF), Discovery Science Center San Jose, Pacific Marine Mammal Center (Laguna Beach), Camp Galileo Online + Camp Galileo CA locations (already partially in DB).
- **Move to next state after CA fills out** — likely NY (Brooklyn Children's Museum, Intrepid Museum, NYHall of Science, Liberty Science Center NJ, Wave Hill Bronx, Bronx Zoo, Wildlife Conservation Society, Children's Museum of Manhattan), then TX (Witte San Antonio, DoSeum, Fort Worth Museum, Perot Dallas, HMNS Houston, AMSET Beaumont) per Dan's plan.
- Should we have a separate scholarshipAid (Y/N) field at top level vs inline in description?
- Future WA targets remaining: Spokane Mobius (deferred), Olympia Hands On Children's Museum, BARN Bainbridge youth artisan camps (8-18), Bainbridge Island Museum of Art, Bellingham SPARK Museum, Tacoma TAM and Children's Museum of Tacoma, Spokane Riverfront Park kids programs.

## DEFERRED CANDIDATES

- **Mobius Discovery Center (Spokane)** — confirmed real org. Camp/class detail not crawlable from landing page.
- **Monterey Bay Aquarium** — DOES NOT run multi-day day camps for K-8; only 90-minute Underwater Explorers experiences. Skip for grinder; reconsider if Wayfinder adds an "experiences" category.
- **Powerhouse Science Center (Durango, CO)** — different org from Sacramento MOSAC. Could be added later if/when CO state gets attention.

## NEW LESSON FROM 2026-04-27 RUN 14

- **Powerhouse Science Center NAME-COLLISION trap**: powsci.org is Durango, Colorado (NOT Sacramento). Sacramento's "Powerhouse Science Center" rebranded to SMUD Museum of Science and Curiosity (MOSAC) at visitmosac.org. Always confirm the address (city + state) before drafting the entry. Look at the "Contact" / "Address" / "footer" before assuming the brand maps to your target state.
- **Monterey Bay Aquarium has no multi-day K-8 camp**: parents looking for "Monterey Bay Aquarium summer camp" should be redirected to Camp SEA Lab (Monterey, ages 8-16, multi-day) or Seymour Marine Discovery Center / UCSC (Santa Cruz, Ocean Explorers). Add either of those to a future run if the marine-camp lane needs more depth.
- **All-high-confidence runs are achievable on CA museum anchors**: Run 14 was 6/6 high confidence with 0 skips because museum/aquarium/science-center landing pages publish pricing directly. Don't drop to medium just because the org has a complex CMS — flatten the HTML, grep for `\\\$|grade|member`, and the pricing usually surfaces.

## RUN HISTORY

| Date | Run # | Added | Skipped | Focus | Notable |
|------|-------|-------|---------|-------|---------|
| 2026-04-26 | 1 | 5 (3hi/2md) | 0 | WA — Seattle/Bellevue/Vashon/Orcas | Bootstrapped progress + lessons |
| 2026-04-26 | 2 | 6 (4hi/2md) | 0 | WA — Seattle/Bellevue/Tacoma anchors | Caught PSC pre-existing dup |
| 2026-04-26 | 3-7 | various | various | WA expansion + ad-hoc national rounds | DB grew from 837 → 926 via mix of esms-grinder + ad-hoc + round runs |
| 2026-04-26 | 8 | 6 (2hi/4md-cost) | 0 | Nationwide-remote (Juni, iCode, Snapology, Bricks 4 Kidz, Create & Learn, Codingal) | WA concluded by Dan directive. Field-notes hit 30/30 cap. |
| 2026-04-26 | 9 | 6 (4hi/2md) | 3 | National-anchors — diversity + advanced + virtual K-8 STEM | NSBE SEEK, Math Beasts Camp, Northwestern CTD Solstice, CodeWizardsHQ, Black Girls CODE, AAUW Tech Trek. |
| 2026-04-26 | 10 | 6 (5hi/1md) | 0 (after replay) | Free/freemium online K-8 | Camp Wonderopolis, Camp CrunchLabs, Generation Genius, Mystery Science, Maker Camp, BrainPOP. NaNoWriMo YWP defunct-check caught. |
| 2026-04-26 | 11 | 1 (Synthesis Teams) | 5 | Race-condition recovery | 5 of 6 candidates claimed by parallel grinders during research window. |
| 2026-04-26 | 12 | 5 (4hi/1md) | 0 | CA initial batch — Bay Area + LA + San Diego anchors | Steve & Kate's Camp, Lawrence Hall of Science, CAMP at The Tech Interactive, California Science Center, Birch Aquarium. |
| 2026-04-26 | 13 | 6 (5hi/1md) | 6 | Nationwide year-round/subscription/contest K-8 | Math Kangaroo USA, MOEMS, KiwiCo, MEL Science, ChessKid, Prodigy Math (free). +6 field-notes. |
| 2026-04-27 | 14 | 6 (6hi/0md) | 0 | CA museum/aquarium/science-center anchors | Aquarium of the Pacific (Long Beach), NHM Adventures in Nature (LA), Fleet Science Center (San Diego), Discovery Cube OC+LA, MOSAC Camp Curiosity (Sacramento), Cabrillo Marine Aquarium (San Pedro). 0 skips, all high confidence. Caught Powerhouse Science Center name-collision (Sacramento→MOSAC, Durango→powsci.org). +6 field-notes. CA queue ~17/30 across all CA runs. |
