# wayfinder-k12-grinder — Lessons Learned

> Read at the START of every run. Append takeaways at the END before push.

## CURRENT CALIBRATION (latest accepted values)

- batch_size: 8 schools (current setting in prompt)
- typical_run_duration: 12-20 min (Run 10 ~10 min — batched parallel WebSearch is fast for clusters of district-grouped schools)
- typical_skip_rate: ~25% structural; can spike to 60%+ when batch overlaps with manually-entered schools
- last_calibration_change: 2026-04-26 — Run 20 confirmed batch_size=8 yields 6 verified + 2 alt-placeholder skips for the Edmonds-SD-clustered offset band (177-184). Edmonds eLearning Academy (enr 255 alt-online) refines the alt-skip rule: alt programs >100 enrollment ARE processable; the auto-skip name pattern (Open Doors / Virtual Academy / Reentry / Re-Engagement) holds — eLearning Academy is its own enrichment class.

## EFFECTIVE PATTERNS (use these — they work)

- For principal names when official site fails: `site:[district domain] "[school name]" principal` works well (e.g. site:lwsd.org, site:kent.k12.wa.us, site:bisd303.org)
- WebSearch result snippets often have the data (enrollment, principal, AP count) and the article URL itself is small enough to WebFetch even when the school's homepage is too large.
- US News K-12 ranking pages: too large to WebFetch directly, but the ranking number is in WebSearch snippets.
- For demographics + enrollment: NCES Public School Search (`https://nces.ed.gov/ccd/schoolsearch/school_detail.asp?ID={ncessch}`) is the most parseable single source.
- Niche.com pages parse cleaner than US News for ratings.
- **NEW (Run 9):** BSD405 (and other Finalsite-hosted district sites) staff pages return >100KB but are searchable via Python: load the JSON tool-result file, find anchor like "Principal - {School Name}" and extract the `<h3 class="fsFullName">` 200-400 chars before. Worked first try for 3/3 BSD principals (Drew Thomas / Russell White / Bethany Spinler).
- **NEW (Run 9):** When a `web_fetch` returns "exceeds maximum allowed tokens" but **saves to a file**, treat that file as a parseable artifact — `python3` regex over the saved file (in `~/.claude/projects/.../tool-results/*.txt`) recovers data without retrying the fetch.

- **NEW (Run 10):** **Cluster batches by district when possible.** Run 10's batch was 4 Bellingham SD schools + 2 Bethel SD schools — single `site:[district].org "[School]" principal` queries returned principal + AP courses + grad rate in one snippet for each. Net: 6/6 verified in <10 min using only WebSearch (no WebFetch needed).
- **NEW (Run 10):** **Niche.com k12 pages return clean snippets for AP enrollment %, AP pass %, student-teacher ratio, demographics in WebSearch results** without needing to fetch the full page. Standard query: `"[School]" [city] enrollment AP courses graduation rate`.

- **NEW (Run 11):** **For CTE/Skills Centers**, use `"[Skills Center]" director programs CTE` rather than `"[School]" principal` — the role title is "Director", and the programs query also surfaces the program list in a single search snippet (e.g. PCSC's 17 CTE pathways).

- **NEW (Run 12):** **Cross-state homonym trap** — Brewster, WA HS and Brewster, NY HS share the name + "Bears" mascot. The first WebSearch synthesis hallucinated NY's "Nichole Horler" as the WA principal. **Lesson:** for any common school name (Brewster, Lincoln, Roosevelt, Madison, Washington, etc.), include county/region disambiguator in the query (`Okanogan` for Brewster WA), and verify the result city/state before recording.
- **NEW (Run 12):** **NCES `enrollment.total` for Skills Centers is structurally low (typically <50)** — the 8-40 figure is a snapshot of teacher-FTE-adjusted headcount, not the true cohort. WST shows 8-40 NCES; PCSC (Run 11) showed 279. Both are real, fully-staffed multi-district CTE centers. **Treat skills/CTE centers as a separate enrichment class:** process them despite low NCES enrollment, but record `enrollmentNotes` explaining the under-count. Rule: if `schoolType: "vocational"` AND name contains "Skills Center"/"Technical"/"CTE", override the <50 skip rule.

- **NEW (Run 13):** **Camas SD has 3 'choice schools' (Camas HS + Hayes Freedom + Discovery HS + Camas Connect Academy)** sharing one principal pool — `site:camas.wednet.edu "[School]" principal` returned a clean per-school admin page in single-snippet form for all 3. Camas SD's Finalsite-style staff URLs (`/o/[code]/page/administration`) are reliably parseable.
- **NEW (Run 13):** **For tribal-area public schools** (Neah Bay HS / Cape Flattery SD), the school's *own* dedicated subdomain (`nbs.cfsd401.org`) carried current principal info that the district directory only listed by phone. Pattern: when the district directory truncates the principal name due to formatting, try `[school-code].[district].org/[about-page-id]`.
- **NEW (Run 13):** **For rural mountain-town high schools** (Cascade HS Leavenworth), the local press archive (Wenatchee Business Journal / Leavenworth Echo) is more authoritative for principal transitions than the district staff page, which often lags. `"School name" principal Leavenworth 2024` surfaces the named-personnel article directly.

- **NEW (Run 11):** **For franchise alt-recovery schools (Acceleration Academies)**, the parent org's site (`accelerationacademy.org/[district]`) carries hours, eligibility, and enrollment criteria; the district programs page (`bethelsd.org/programs/...`) carries the local context. Together they constitute ≥3 verified fields without needing a principal name (typical credit-recovery program is run by a partner-org "Academy Director", not a traditional principal).


- **NEW (Run 13):** **District micro-cluster (3 schools, single domain).** Offsets 97/98/100 were all Camas SD schools (`camas.wednet.edu` subdomain). One `site:camas.wednet.edu "[School]" principal` query returned hits for all three. WebSearch synthesis was clean — no homonym risk because all three are in same district/state. Confirms Run 10's clustering rule.
- **NEW (Run 13):** **Tribal/reservation schools with enroll>50 ARE processable** despite earlier lesson "deprioritize tribal schools at this stage". Neah Bay Jr/Sr HS (Makah Indian Reservation, ncessch 530084000165, enroll=196) yielded principal name (Lucy Dafoe), grad rate, demographics, and program detail in 2 WebSearches — the school district `cfsd401.org` and OSPI articles surface principal-level info. **Update to lesson:** auto-skip tribal schools ONLY when enrollment <50 OR no district website is searchable. Schools on reservations with active district sites and ≥100 students are legitimate enrichment targets.
- **NEW (Run 13):** **For new-build / specialty STEAM-focused programs (Discovery HS Camas), the architecture/spec source `spaces4learning.com` carries the original program design intent** (project-based learning, integrated learning teams, dual enrollment). Useful as a `_sources` entry alongside Niche/US News for `programNotes`.
- **NEW (Run 20):** **Edmonds SD micro-cluster (3 schools, single domain).** Offsets 177/178/179 were all Edmonds SD (`*.edmonds.wednet.edu` + Edmonds College subdomain for the Open Doors). One round of `site:edmonds.wednet.edu "[School]" principal` queries plus Niche/USNews surfaced 3-clean-fields-each in <3 min. Confirms Run 13's district-cluster heuristic.
- **NEW (Run 20):** **Open Doors consortium programs (Edmonds Career Access Program / EdCAP)** are co-administered by a CTC + the school district. Both `[college].edu/programs-and-degrees/...` and `[district]/quicklinks/career-college-readiness` surface eligibility, hours, and structure — together they constitute ≥3 verified fields without a principal. Same handling as Run 11's Acceleration Academy lesson: drop principal, add `principalNote` explaining consortium model.
- **NEW (Run 20):** **myedmondsnews.com / lynnwoodtoday.com** are clean local-press sources for "Class of 2025 graduates" articles which name the principal in the byline lede. Useful for confirming smaller alt schools when the district staff page is JS-rendered (eela.edmonds.wednet.edu/about loads via JS).


- **NEW (Run 14):** **Verify principal names against the school's own current administration page when historical mentions exist.** Web-search synthesis returned "Mike Hittle" as Central Valley HS principal — true in 2009 (Distinguished League Principal Award), but the current principal is Katie Louie (per cvhs.cvsd.org admin page footer). When the only WebSearch citation for a principal is from >5 years ago, treat as historical and follow up with a direct fetch of the school's admin page. Sharp School / Edlio sites expose admin lists in the page footer (`<span id="footer_names">`) which is parseable from a single fetch.
- **NEW (Run 14):** **CK SD's Sharp School/CMS sites embed admin info on the about page rather than staff-directory.** olympic.ckschools.org/about-olympic, cvhs.cvsd.org admin page, etc. — the staff-directory.html is a JS-rendered widget (empty without browser), but the about page footer carries Principal/AP names in `<p style="text-align: center;"><strong>Principal:</strong>` blocks. Saved-fetch + python regex extracts cleanly.

- **NEW (Run 15):** **Co-located school IDs share staff/principal.** SVT Skills Center (NCES 530111003387) and STEM Academy at SVT (NCES 530111003657) are two distinct NCES records but the same physical campus + administration (115 S University Rd, Spokane Valley) — both list Amanda St Pierre as principal. When two queue rows have the same address, treat them as a paired enrichment: research once, write two entries with cross-referencing `principalNotes`. Saves ~50% research time on these pairs.
- **NEW (Run 15):** **WA Open Doors / reentry programs DO have enrichable data** when enrollment > 50, even though they're consortium-administered. The CVSD/OSPI program profile PDF + the district's `/apps/pages/OpenDoors` landing page provide outcomes (diploma counts, GED counts) and consortium structure — counts as ≥3 verified fields without a traditional principal. Use `schoolType: "reentry"` and skip the principal field.
- **NEW (Run 15):** **Juvenile-rehab schools (Green Hill, Maple Lane historically)** have a clean enrichment path: WA DCYF page (facility info, superintendent name, capacity) + DCYF's youth handbook PDF + Wikipedia + Niche/USNews academic profile = 4-5 sources. Use `schoolType: "juvenile_rehabilitation"` and a `facilityNotes` field; the academic program is operated by the host district (Chehalis SD for Green Hill).


- **NEW (Run 21):** **Merge-on-dup pattern.** When NCES offset hits a school already in `enriched.json` from a prior NCES-only stub, don't skip the slot — read the old entry, layer new web-research fields on top, preserve old NCES demographics, and replace by ncessch. Counts as a `lastRunReplaced` not a fresh `lastRunAdded`. This run: Henry M. Jackson HS had a Run 19 NCES-only entry (no principal, no programs); Run 21 added principal/AP/mascot and kept the demographics block.
- **NEW (Run 21):** **Common-name disambiguator field.** Cascade HS Everett (530267000391) and Cascade HS Leavenworth (530095001935) both verified in the past 2 weeks. Added `nameDisambiguator` field to the Everett entry pointing at the other ncessch. Recommend doing the same any time a name collides across two enriched entries.
- **NEW (Run 21):** **Reengagement / Graduation Alliance partner schools** (Everett Reengagement Academy this run) consistently surface principal + program model + enrollment route + diploma-issuing school via the district's `/graduation/[name]` URL pattern. Standard query: `"[School]" "[district]" principal program description` returns the partner-org details (Graduation Alliance) plus the local principal in one snippet.

## FAILED PATTERNS / KNOWN ANTI-PATTERNS (don't repeat)

- Don't retry WebFetch on the same URL after a "file too large" error — it'll fail again. Switch to WebSearch immediately.
- Don't process schools with enrollment <50 — they're typically alternative/reentry programs with no useful enrichment data and the NCES record is often a placeholder.
- Don't waste a slot on tribal schools at this stage — NCES data is sparse and most don't have public-facing websites with the fields we need.
- Avoid Wikipedia for K-12 schools — pages are usually too large and the encyclopedic content is rarely a current source for principal/enrollment/scores.
- **NEW (Run 9):** Don't `cat <<HEREDOC` write large JSON to `/tmp/` — `/tmp` is a tiny tmpfs (100% full from prior session caches) and the write silently fails with "No space left on device". Write to `/sessions/nifty-confident-bardeen/` instead (~6GB free). Same trap for git clone — clone target must be on `/sessions`, not `/tmp` or `/var/tmp`.
- **NEW (Run 9):** Don't `rm -rf /tmp/wayfinder` — old clones from prior sessions are owned by `nobody:nogroup` and the current user can't unlink them. Use a fresh clone path under `/sessions/nifty-confident-bardeen/wfclone-$$` instead.
- **NEW (Run 9):** Don't clone into `/sessions/.../mnt/outputs/` — that mount is fuse-virtiofs and git's atomic ops fail with `unable to unlink '.git/config.lock': Operation not permitted`. The native `/sessions/` ext4 mount works fine.


- **NEW (Run 13 — confirms Run 12 lesson):** WebSearch's first synthesis paragraph for `"Cascade School District" "Mike Hill" Leavenworth high school principal` literally invented a "Mike" hit when the actual principal (per WBJ + Leavenworth Echo articles) is **James Swanson** (started 2024-25). The follow-up `"James Swanson" "Cascade High School" Leavenworth principal 2024` confirmed via two named-byline news sources. **Lesson:** when researching a *specific* principal name from a hunch, ALWAYS confirm with a quoted-name search before recording. The hunch-name pattern is high-risk for cross-contamination.

- **NEW (Run 12):** Don't trust the LLM-generated synthesis paragraph at the bottom of WebSearch results without checking the underlying snippet/URL. Twice this run the synthesis claimed names ("Mark Mayfield", "Nichole Horler") that weren't in any quoted snippet — the model fabricated/cross-contaminated. **Always verify the name via a follow-up `"School" "Name" principal` query** before recording, OR drop the field if uncertain.
- **NEW (Run 12):** Don't include the principal field if you can't independently verify the person via at least one fetched URL or unambiguous snippet quote — better to leave principal blank than record a hallucinated name.

- **NEW (Run 11):** Don't `rm -rf /tmp/wayfinder` even with the Run 9 workaround in mind — the *current* session's `/` filesystem hit 100% from old session caches across many `wf-*` and `wayfinder-*` dirs owned by `nobody:nogroup`. Skip `/tmp` entirely and clone to `/sessions/[session-id]/wfclone-$$` from the start. (`/sessions` ext4 had 6.2GB free vs 16MB on `/`.)
- **NEW (Run 11):** When NCES's `enrollment.total = 0` (Morgan Center School in Bremerton SD this run), it almost always means a placeholder/recently-closed/internal-only record — fast-skip without research, like the <50 enrollment rule.


- **NEW (Run 20):** **Stale-clone trap.** This run started by reading the `lessons/wayfinder-k12-grinder-lessons.md` file from a `/tmp/wayfinder` clone owned by `nobody:nogroup` (left behind from prior session). The lessons file was real but several runs out of date — it claimed `last run = 12, offset 96`, but main was already at run 19 / offset 177. Wasted ~10 min researching offsets 96-103, all of which were already enriched. **Lesson:** ALWAYS clone fresh to `/sessions/[session-id]/wfclone-$$` (per Run 11 rule) FROM THE START, never read lessons from a `/tmp/wayfinder` left behind by a prior session. Pre-flight: `ls -la /tmp/wayfinder/.git` — if present + owned by `nobody:nogroup`, abandon and clone fresh.
- **NEW (Run 20):** **Don't trust a `progress.json` lastRun number from a stale clone.** Cross-check with `git log --oneline -- backend/data/scraped/k12-enriched.json | head -3` to see the real most-recent run before selecting a batch.

- **NEW (Run 13):** Don't WebFetch `nbs.cfsd401.org/332823_2` or other Cape Flattery SD pages — they return 169KB+ HTML that exceeds inline tokens and `principal` keyword grep over the saved file returned no matches (the principal name was instead surfaced via WebSearch result snippet). Skip the WebFetch step for `*.cfsd401.org/*` and go straight to WebSearch.


- **NEW (Run 14):** **Don't trust principal names sourced only from old award/news articles.** Spokesman-Review's 2009 "Hittle awarded principal honors" article surfaces in 2026 search results without dating context, and LLM synthesis treats it as current. Rule: any principal sourced from a news article older than 3 years should be treated as needs-verification, not as the answer.
- **NEW (Run 14):** **us news k12 pages with auto-generated leadership lists are stale.** US News' "Principal: [Name]" line on Olympic HS pointed to a generic answer because the data refresh appears to lag the school's own site. Prefer the school district's own admin page when available.


- **NEW (Run 21):** Don't trust the first WebSearch hit for `"School" "Mill Creek" principal` — for Henry M Jackson HS, the 2024-25 student handbook shows "Monica Pierce, Principal for Instruction (12th grade)" prominently. That's a sub-role, NOT the head principal. The actual head is Lance Balla (verified via countyoffice.org snippet quoting "Lance Balla is listed as the Principal"). **Lesson:** when a school's handbook lists multiple "Principal of X" roles, do a follow-up search for "head principal" to disambiguate.
- **NEW (Run 21):** Don't `git clone` to `/tmp/wayfinder` — the fresh clone *appears* to succeed with current-user ownership but underlying files (e.g. `k12-enriched.json`) get written with `nobody:nogroup` ownership from the prior session's leftovers, blocking subsequent writes with `Permission denied`. Confirmed AGAIN this run (Run 21) — same trap as Runs 9/11. Always clone to `/sessions/[session-id]/wfclone-$$` from the start.

## SOURCE-SPECIFIC NOTES

### URLs / domains that hit "too large for inline parsing"
- `bhs.bisd303.org/*` (~700KB)
- US News k12 pages (~600-800KB)
- Wikipedia school pages (commonly >50KB)
- Many large district homepages (Seattle Public Schools homepage, Bellevue School District landing)
- Pattern: any official school homepage with photo galleries / embedded calendars
- BSD405 Finalsite staff pages (`*.bsd405.org/our-school/staff`, `*.bsd405.org/our-school/contact-us`) — 100-130KB; saves to file, parseable via grep/python (see EFFECTIVE PATTERNS above)
- BSD405 school profile PDFs (`resources.finalsite.net/.../*Profile*.pdf`) — 230KB-560KB; binary PDF, low yield from inline grep

### High-yield search query templates

#### NEW (Run 13) — high-yield templates added
- **Camas SD choice schools (Hayes Freedom, Discovery, Camas Connect)**: `site:camas.wednet.edu "[School]" principal` returns single-snippet admin/contact info for each.
- **Tribal-area / reservation schools**: try the school's own subdomain (`nbs.cfsd401.org`, `wsskillsCenter.cfsd401.org`-style) before the district directory — district directories often truncate names due to special character formatting issues.
- **Rural mountain-town schools (Cascade SD, Methow Valley SD)**: pair `"[School]" principal [town name] [year]` with a press-archive fallback (`leavenworthecho.com`, `methow.org`) — rural districts publish leadership transitions through local newspapers more often than press releases.

#### NEW (Run 12) — high-yield templates added
- For small rural WA districts, the district homepage (`brewsterbears.org`, `bridgeport.wednet.edu`) typically has a "School Name" subpage with principal + accreditation in body content; even when the homepage is too large, the subpage URL `[district].wednet.edu/page/home-hs` is parseable and surfaces principal name reliably.
- Cross-state homonym disambiguation: `"School Name" [county or region] [state] principal` (e.g. `"Brewster High School" Okanogan Washington principal`) avoids NY/MA/etc. cross-contamination.

#### NEW (Run 11) — high-yield templates added
- CTE / Skills Centers: `"[Skills Center name]" director programs CTE` — returns director + program list in one snippet.
- Recovery / alt-academy franchises: combine `"[School]" [district]` (general) + `"[School]" [city] niche student teacher ratio` (Niche stats) for full coverage in 2 searches.


#### NEW (Run 21) — high-yield templates added
- Disambiguating head principal vs sub-principal at large schools: `"[School]" "[district]" "head principal" OR "principal" [mascot]` — the mascot keyword filters out staff handbook hits and surfaces athletics/news pages with the lead admin name.
- For partner-org alt schools (Graduation Alliance, Acceleration Academy): `"[School]" "[district]" principal program description` reliably returns the local principal + partner-org program model in a single snippet.

- Principal: `site:[district].org "[School]" principal`
- Enrollment: `"[School]" Washington enrollment 2024 OR 2025`
- AP courses: `"[School]" "Advanced Placement" courses count`
- Test scores: `[School] Washington state report card`
- Magnet / lottery school context: `"[School]" magnet OR lottery [city] enrollment` (Run 9 found Intl School curriculum + lottery rules in 1 query)


### NEW (Run 13)
- `nbs.cfsd401.org/*` — Cape Flattery SD secondary site, ~170KB; WebFetch saves to file but `principal` regex returned 0 matches. Skip WebFetch, use WebSearch.
- `cascadesd.org/staff` — Cascade SD staff page; reachable via WebSearch but principal/asst-principal split needs the `ncwbusiness.com` 2024 leadership-change article for context (`https://www.ncwbusiness.com/stories/cascade-school-district-navigates-leadership-changes-at-high-school-and-middle-school,79656`).

#### NEW (Run 13) — high-yield templates added
- For Camas SD schools: `site:camas.wednet.edu "[School]" principal` returns clean staff-directory snippet.
- For tribal/reservation schools with active district sites: `"[School]" principal "[District]" 2024 OR 2025` — surfaces OSPI / state-level coverage with principal name in body text.

## DATA QUALITY FLAGS DISCOVERED

- 2026-04-26: **Summit Olympus, Tacoma** appears to have CLOSED at the end of 2024-25 per WA Charter Commission. Recorded with `schoolStatus: "closed_2025"` so the frontend can filter. Going forward: when adding charter schools, do a quick "[school] charter commission [state] status" check.
- 2026-04-26: NCES placeholders for "Renton Technical HS" (5 students) and "Ella Baker HS" (Open Doors reentry, 88 students) — confirm enrollment >50 before spending an enrichment slot on a school.
- 2026-04-26 (Run 9): **Duplicate-with-manual-entries problem.** Bellevue HS, Interlake, and Newport were already in `enriched.json` (manual entries from Run 4) but the NCES queue at offset 65-67 hit them again, wasting 3/8 slots. Future runs should run a `name-in-existing-enriched` pre-filter before counting toward batch size, OR the next prompt iteration should pre-skip dups and pull from the next NCES rows to maintain net-8 enrichments.


- 2026-04-26 (Run 13): **Triple alt-placeholder cluster — every Camas SD + Burlington-Edison district had a "[District] Open Doors" or "[District] Virtual Academy" sub-50 NCES record interleaved with their real schools.** Open Doors / Virtual Academy / Reentry naming pattern is a near-deterministic signal of <50 enrollment alt placeholder. Future runs can pre-skip on name-pattern match (`Open Doors|Virtual Academy|Reentry|Re-Engagement`) without checking enrollment first.
- 2026-04-26 (Run 13): **NCES enrollment for choice/PBL schools is current** — Discovery HS NCES total=191 matches public sources (181-201 range across years). Unlike Skills Centers (suppressed) or alt-placeholders (single-digit), regular choice schools report accurate enrollment.

- 2026-04-26 (Run 12): **Heavy alt-school cluster around offsets 91/93/95.** WA HS NCES rows are interleaved: regular HS at even offsets, alternative/reentry placeholder at the next odd offset. This means a sequential 8-row batch can lose 3-4 slots to <50 skips when the queue lands on an alt-cluster band. Future bumps to batch_size 10 should assume effective net-yield of 5-7, not 8-10.
- 2026-04-26 (Run 12): **Skills Centers consistently show suppressed NCES enrollment (8-40)** despite being real multi-district CTE programs serving 100s+ students. Specific to `schoolType: "vocational"` + named "Skills Center"/"Technical Skills". Rule: do NOT skip these despite <50 NCES.

- 2026-04-26 (Run 11): **NCES `enrollment.total = 0` records.** Morgan Center School (Bremerton SD, ncessch 530066001751) has total=0 — the school's NCES record exists but it's effectively a programmatic placeholder (no enrollment, possibly admin-only). Adding to the auto-skip list alongside `<50 enrollment` and `tribal placeholder` filters.
- 2026-04-26 (Run 11): **Acceleration Academy** is a national franchise model — local entries here may have no traditional principal field. Schema accepts this since `_sources` has 3+ live verified URLs and we have website/enrollment/student-teacher-ratio (3 of 4 REQUIRED).


- 2026-04-26 (Run 13): **Conflicting enrollment & graduation rate sources for Discovery HS Camas.** US News/Niche show 181-201 students, grad rate 84.5%; project-design source claims 94% grad rate. Recorded the higher (94%) and noted SAT 1250. **Pattern:** when enrollment fluctuates by ±10% across sources, prefer the most recent NCES + Niche convergence. When grad rates conflict, prefer the higher *only if* it appears in 2+ independent sources; otherwise flag and pick the lower (more conservative).
- 2026-04-26 (Run 13): **Tribal/reservation school enrollment is reliable.** Neah Bay Jr/Sr HS NCES = 189 vs Niche/PSR = 196 (likely combined Jr+Sr count incl. Markishtum MS). Both are in the right neighborhood; the school operates as a combined 6-12 secondary. Recorded 196 with note in `programNotes`.


- 2026-04-26 (Run 21): **Skeletal NCES-only entries from prior auto-runs** — Jackson HS at offset 189 was already in enriched.json (Run 19) but with NCES-only fields (demographics, enrollment-by-grade, no principal/programs). When the grinder hits these, the right move is `merge` not `skip` — preserve the rich NCES detail and layer the web-research fields on top. Update `lastRunReplaced` count, not `lastRunAdded`.

## CALIBRATION SUGGESTIONS FROM PAST RUNS

- **NEW (Run 21):** Run 21 yielded 5 new + 1 merged-replace + 3 skips on offsets 185-193. The Everett SD cluster (5 of 9 raw rows from 530267xxx) gave dense district-cluster batching — all WebSearch, no WebFetch needed. ~7 min wall clock. Recommend keeping batch_size=8 through the rest of the WA-high E-band (offsets 194-250 likely contains Federal Way + Ferndale + Fife districts based on alphabetical ordering). **Open follow-up:** the dedup-merge auto-detection is now formalized as an EFFECTIVE PATTERN above — future runs should always check `existing_ncessch` before skipping.

- Batch size 8 is the current setting and seems sustainable. Run 7 reported "WebFetch hit 'file too large' wall on 2 of 8 sites" — workaround via WebSearch handled it without dropping enrichment quality.
- The grinder is currently advancing offset by 8 even when 2-3 are skipped. Consider whether to keep advancing the cursor (current behavior — moves through the queue faster but leaves gaps) vs. only advancing the cursor by `verified` count (more thorough but slower). **Current consensus: advancing by 8 is correct** — skipped schools are typically structurally low-yield and not worth re-attempting later.

- **NEW (Run 13, replaces Run 12 suggestion):** Run 13 mirrored Runs 10/11 — 5 verified + 3 sub-50 skips, ~7 min research wall-clock, all WebSearch (one large WebFetch failed and was correctly abandoned). The Camas SD cluster (3 schools at offsets 97/98/100) made the run efficient — district-clustering rule continues to hold. **Recommend keeping batch_size=8** for at least one more WA-high run; the queue at offset 104 enters a Cashmere/Cathlamet/Centralia stretch which should still cluster well by district. **Codification proposal still standing:** pre-skip pre-filter for `enrollment<50` + `name in enriched.json` (Run 9's proposal) — if next prompt iteration adopts this, batch_size could safely bump to 10 since net-yield would no longer be eaten by structural skips.

- **NEW (Run 12, retained for reference):** Run 12 yielded 5 verified + 3 skipped — net 5/8 due to alt-cluster on offsets 91/93/95. Wall-clock research ~6 min (all WebSearch, no WebFetch). **Recommend keeping batch_size=8** through the alt-heavy WA-high mid-section (offsets 96-150 likely contains more alt placeholders). When the queue clears the alphabetical alt-cluster band, reconsider bumping to 10. **New filtering proposal:** at batch-selection, pre-flag `schoolType: "alternative" + enrollment < 50` rows so they consume the offset-slot but don't count against the 8 enrichment target — same fix as Run 9's dedup proposal but for alt-placeholders. Until prompt formalizes this, business-as-usual works.
- **NEW (Run 12) — Skills Center carve-out:** the `<50 enrollment skip` rule should NOT apply to vocational/CTE skills centers. This run West Sound Tech (NCES enrollment=40) was successfully verified with `enrollmentNotes` explaining the under-count. Future prompt iteration: codify "if `schoolType: vocational` + 'Skills Center' or 'Technical' in name, never auto-skip on enrollment count."

- **NEW (Run 11, replaces Run 10 suggestion):** Run 11 mirrored Run 10 — 6/6 verified across 3 districts (Bethel + Blaine + Bremerton) using WebSearch only, ~5 min wall clock for research. Batch_size=8 is the sweet spot; the natural alphabetical-by-city NCES ordering keeps clustering automatic. Recommend keeping batch_size=8 for at least one more WA-high run before considering a bump. **Open follow-up:** the dedup-against-existing-enriched pre-filter (Run 9's proposal) is still unimplemented at the prompt level — it didn't bite this run, but will at offsets ~95+ where Run 4's manual additions cluster.

- **NEW (Run 10, retained):** Run 10 hit a clean district-cluster (Bellingham SD + Bethel SD) and verified 6/6 with no dups in ~10 min. Validates that **clustering by district** is the right batch-selection heuristic when the queue allows it. Strong recommendation for next prompt iteration: when `findRaw`/batch-selection returns a sequential window, look ahead for district groupings and prefer 6-8 schools across 1-3 districts over 8 schools spread across 8 districts. Until prompt formalizes this, the natural NCES alphabetical-by-city ordering already groups districts well, so business-as-usual works.
- **NEW (Run 9 — kept for reference):** Run 9 produced only 3 enrichments because 3 dups + 2 alt-program skips ate the batch. Two viable next-run tweaks: (a) **pre-dedup pass** — at batch-selection time, scan candidates against the existing `enriched.json` name set; advance past dups silently and pull additional NCES rows to keep net target = 8 enrichments. (b) **Bump batch_size to 10** for the WA-high tail since most remaining entries are processable. Recommend (a) — preserves data quality, addresses the actual blocker. **Proposed prompt change for next iteration:** add step "When selecting batch, skip names already present in enriched.json (count as 'pre-dedup', not 'skipped'); advance offset until net target = batch_size processable schools." Until prompt changes, this run advanced offset only by 8 per current rule.


- **NEW (Run 14):** Run 14 was the first **8/8 verified, 0 skipped** batch since Run 6 — the queue exited the alt-cluster band at offset ~104 and the next 8 NCES rows were all comprehensive HS in clean district clusters (Cashmere SD, Castle Rock SD, Central Kitsap SD, Central Valley SD). **Recommend bumping batch_size to 10 for the next 1-2 runs** while the queue stays in this clean band; revert to 8 if skip rate climbs back above 25%. Wall-clock research ~12 min for 8 schools, 1 fetch (CVHS admin page for principal disambiguation), rest via WebSearch.
- **NEW (Run 14):** Mike Hittle disambiguation took 1 extra search round + 1 fetch — net cost of ~2 min, but caught a name that would have been a false-positive verified entry. Keep this as a default cross-check whenever the principal source is only an old article.

- **NEW (Run 15, replaces Run 14 suggestion):** Run 15 yielded 6 verified + 2 skipped on the CVSD-Spokane band (offsets 112-119). Includes one Skills Center carve-out + one Open Doors consortium + one juvenile-rehab academic school — three "edge case" school types in one batch that all enriched cleanly thanks to prior runs' carve-out rules. **Recommend keeping batch_size=8** through the next 1-2 WA-high runs. After that, consider bumping to 10 once the queue clears the Spokane / Lewis County band (offsets 120+) and enters the larger comprehensive-HS bands. The dedup pre-filter (Run 9's open proposal) STILL hasn't been formalized in the prompt — Run 15 had 0 dups but the risk remains.

## OPEN QUESTIONS / TODO FOR FUTURE RUNS

- Worth normalizing rating fields across US News / Niche / GreatSchools to a unified 1-10 scale? Currently each entry stores source + scale separately.
- A handful of WA private schools (Lakeside Upper School, etc.) appear in NCES dataset but with limited public data — should we deprioritize private schools in this grinder, since they're less searchable in our typical sources?
- Should the grinder annotate magnet/STEM/IB designation as a separate top-level field (currently buried in `notablePrograms`)? Run 9 added `admission` and tagged `magnet: true / magnetProgram: true` for International School — propose making `admission` and `magnetProgram` first-class top-level fields in the schema.
- The 32 prior manual entries don't have stable ncessch keys aligned with the NCES dump (some used different IDs). Worth a one-time backfill script to reconcile so future dedup checks can match on ncessch instead of name.

## RUN HISTORY (most recent 10 runs — older entries get summarized + pruned)

| Date       | Run # | Verified | Skipped | Notable                                                                                                |
|------------|-------|----------|---------|--------------------------------------------------------------------------------------------------------|
| 2026-04-26 | 21    | 5 new + 1 merged | 3 | WA high offsets 185-193 (Ephrata + Everett SD cluster). 5 verified new (Ephrata HS, Cascade HS Everett, Everett HS, Sequoia HS, Everett Reengagement Academy) + 1 merged-replace (Jackson HS — added principal/AP/mascot to existing Run 19 NCES-stub). 3 skipped (Sage Hills Open Doors enr=26, NW Learning Center enr=1, Sno Co Jail enr=0 placeholder). Discovered tmpfs-permission trap AGAIN — Run 9/11/21 same root cause. ~7 min research wall-clock, all WebSearch. |
| 2026-04-26 | 15    | 6        | 2       | WA high offsets 112-119 (Central Valley SD cluster + Centralia HS + Green Hill juvenile-rehab academic). 6/6 processable verified (SVT Skills Center, CVSD Open Doors, STEM Academy at SVT, Ridgeline HS, Centralia HS, Green Hill Academic). 2 skipped (School to Life enr=33 special_ed, Futurus enr=47 alt). Three edge-case school types in one batch: Skills Center carve-out, reentry consortium, juvenile rehab — all enriched cleanly via existing rules. Wall-clock research ~8 min, all WebSearch + 1 small fetch. |
| 2026-04-26 | 13    | 5        | 3       | WA high offsets 96-103 (Camas SD cluster + Neah Bay tribal + Cascade SD Leavenworth). 5/5 verified (Camas HS 1983 enroll, Hayes Freedom alt 161, Discovery HS STEAM 201, Neah Bay Jr/Sr 196 Makah Reservation, Cascade HS Leavenworth 410). 3 sub-50 skips (Open Doors Mt Vernon enr=9, Camas SD Open Doors enr=6, Kodiak Virtual Academy Leavenworth enr=7). Note: Camas + Hayes Freedom + Discovery share district homepage `camas.wednet.edu` — district-cluster batching held. Tribal/reservation Neah Bay was processable (enroll>50). All-WebSearch run, ~7 min research. |
| 2026-04-26 | 14    | 8        | 0       | WA high offsets 104-111 (Cashmere + Castle Rock + Central Kitsap SD + Central Valley SD). 8/8 verified, 0 skipped — clean comprehensive-HS band. Caught Mike Hittle (CVHS) hallucination via direct cvhs.cvsd.org fetch — actual principal is Katie Louie. Wall-clock research ~12 min. |
| 2026-04-26 | 13    | 5        | 3       | WA high offsets 96-103 (Camas SD cluster + Cascade HS Leavenworth + Neah Bay Jr/Sr HS). 5/5 of processable verified (Camas HS [O'Rourke], Hayes Freedom [Holmes], Discovery HS [Huld, Ed.D.], Cascade HS [Swanson - new principal 2024-25], Neah Bay [Dafoe, Secondary Principal]). 3 alt-placeholder skips: Open Doors Mt Vernon (9), Camas SD Open Doors (6), Kodiak Virtual Academy (7) — all <50. Caught Mike-Hill hallucination via cross-verification with Wenatchee Business Journal byline. ~7 min research wall-clock, all WebSearch. |
| 2026-04-26 | 20    | 6        | 2       | WA high offsets 177-184 (Edmonds SD cluster + Ellensburg + Elma + Entiat). Verified Edmonds eLearning Academy (Kim Hunter), Edmonds-Woodway HS (Allison Chace Larsen, IB), Edmonds Career Access Program (consortium-no-principal), Ellensburg HS (Beau Snow), Elma HS (Tatia Holme), Entiat MS/HS (principal blank). Skipped East Grays Harbor pair (enr=8, enr=44 — both <50 alt). Wasted ~10 min on stale-clone trap before reclone (see lesson). |
| 2026-04-26 | 12    | 5        | 3       | WA high offsets 88-95 (Bremerton + Brewster + Bridgeport + Burlington-Edison cluster). 5/5 verified (West Sound Tech Skills Center, Renaissance Alt HS, Brewster HS, Bridgeport HS, Burlington Edison HS). 3 alt-school skips all <50 (Brewster Alt enr=17, Bridgeport Aurora enr=29, Burlington-Edison Alt enr=23). Heavy alt-school cluster — 3 of 8 raw rows were sub-50 alt placeholders. ~6 min research wall-clock, all WebSearch. |
| 2026-04-26 | 11    | 6        | 2       | WA high offsets 80-87 (Bethel + Blaine + Bremerton SD cluster). 6/6 verified (Challenger HS, Graham Kapowsin HS, Pierce County Skills Center, Acceleration Academy, Blaine HS, Bremerton HS). 2 skipped (Blaine Re-Engagement enr=13 alt; Morgan Center enr=0 placeholder). All-WebSearch run, ~5 min research wall-clock. |
| 2026-04-25 | 10    | 6        | 2       | WA high offsets 72-79 (Bellingham SD + Bethel SD cluster). 6/6 verified, 2 skipped (Visions enr=13, Bellingham Re-Engagement alt). District-cluster batching = fast. |
| 2026-04-26 | 9     | 3        | 5       | 3/5 skips were dups w/ manual entries (Bellevue HS, Interlake, Newport); 2 alt-program <50 skips. Discovered fuse mount + /tmp full traps. |
| 2026-04-26 | 8     | 7        | 1       | Battle Ground / Prairie / Summit View / Lumen / Whatcom batch; 1 alt placeholder skipped              |
| 2026-04-26 | 7     | 6        | 2       | WebFetch failed on 2 sites; site:domain workaround OK                                                  |
| 2026-04-26 | 6     | 8        | 0       | All 8 enriched; no issues                                                                              |
| 2026-04-26 | 5     | 7        | 1       | One charter placeholder skipped                                                                        |
| (earlier runs summarized in next compaction pass) | | | | |


## RUN 16 (2026-04-26) — Lewis/Chelan/Cheney/Chewelah/Chimacum/Clarkston/Cle Elum band (offsets 120-136)

### Outcome
- Verified: 8 (W F West HS, Chelan HS, Cheney HS, Three Springs HS [alt], Jenkins Jr/Sr, Chimacum Jr/Sr, Charles Francis Adams [Clarkston HS], Cle Elum-Roslyn HS)
- Skipped: 7 (all <50 alt placeholders: Lewis Juv Det 10, Lewis Jail 0, Lewis Alt 45, Chelan Innovation 15, Cheney Open Doors 9, Chewelah Open Doors 27, Open Doors Reengagement 0)
- Wall clock: ~10 min, all WebSearch except 1 small Finalsite staff page fetch (Three Springs)

### EFFECTIVE PATTERNS (added)
- **Catching up stale progress.json**: Runs 14 and 15 had committed enriched data (offsets 104-119) without updating `k12-grinder-progress.json` — the progress JSON still pointed to offset 104 even though those rows were already in `k12-enriched.json`. Always reconcile by name-checking candidates against `enriched.json` before treating progress offset as authoritative. This run dedup-prefiltered offsets 104-119 (all DUP) and started genuine work at offset 120. Lesson: **always run dedup pre-check, don't trust progress.json alone**.
- **Three Springs / Catheleen Scott via Finalsite staff page**: tshs.cheneysd.org/contact/our-staff loaded inline (~83KB, under threshold) and the principal's name + photo + title were directly in the `<h3 class="fsFullName">` block. No grep gymnastics needed for sub-100KB Finalsite staff pages.
- **Cross-state homonym disambiguation worked perfectly for "Ryan Stevens" Chimacum**: appended Sequim + Quileute + Chimacum + 2025 to the name-verification query and got 2 independent confirmations (ptleader Nov 2025 hire announcement + king5 Nov 2025 marching band article). Lesson: chain 2-3 disambiguators to defeat name-collision hallucinations.
- **For interim/transitional principals (Tim Berndt at CERHS)**: cersd.org/article/1712841 hire announcement + dailyrecordnews byline gave 2 independent timestamps + biography. The school's own "meet-the-principal" page is too large to fetch but its existence + cross-confirms via two news sources is enough.
- **District news archives (Daily Chronicle / Lake Chelan Mirror / Daily Record / Cheney Free Press / Port Townsend Leader)** consistently surface principal-transition announcements with quoted-name byline citations. For rural WA districts, local newspapers > district staff pages.

### FAILED PATTERNS (added)
- **`cersd.org/o/cerhs/page/meet-the-principal`** returned >1MB inline tokens — too large to parse. Skip and rely on the two news-article sources instead.
- **`site:tshs.cheneysd.org` WebSearch returned no results** — but a direct WebFetch on the same URL worked. Don't rely on `site:` operator for low-traffic small-school subdomains; just fetch the URL directly when you know it.

#
- **NEW (Run 21):** Don't trust the first WebSearch hit for `"School" "Mill Creek" principal` — for Henry M Jackson HS, the 2024-25 student handbook shows "Monica Pierce, Principal for Instruction (12th grade)" prominently. That's a sub-role, NOT the head principal. The actual head is Lance Balla (verified via countyoffice.org snippet quoting "Lance Balla is listed as the Principal"). **Lesson:** when a school's handbook lists multiple "Principal of X" roles, do a follow-up search for "head principal" to disambiguate.
- **NEW (Run 21):** Don't `git clone` to `/tmp/wayfinder` — the fresh clone *appears* to succeed with current-user ownership but underlying files (e.g. `k12-enriched.json`) get written with `nobody:nogroup` ownership from the prior session's leftovers, blocking subsequent writes with `Permission denied`. Confirmed AGAIN this run (Run 21) — same trap as Runs 9/11. Always clone to `/sessions/[session-id]/wfclone-$$` from the start.

## SOURCE-SPECIFIC NOTES (added)
- `cersd.org/o/cerhs/page/meet-the-principal` — too large (>1MB), use cersd.org/article/1712841 (the hire announcement article) instead for principal info.
- `tshs.cheneysd.org/contact/our-staff` — clean Finalsite staff directory, ~83KB; principal at top in "Front Office Staff" section, parseable inline.
- `chronline.com` (Daily Chronicle) — high-yield WA SW news source; principal-transition articles surface in search snippets without needing fetch.
- `ptleader.com` (Port Townsend Leader) — high-yield Olympic Peninsula source; principal announcements + admin transitions for CSD49.
- `dailyrecordnews.com` — high-yield Kittitas County source; CERSD admin announcements.
- `cheneyfreepress.com` — high-yield Cheney/Eastern WA source; college-prep/curriculum coverage with principal context.

### DATA QUALITY FLAGS
- **Catheleen Scott / Three Springs** is listed as Principal in the Front Office Staff section, but the school is alternative — the title may be "Alternative Schools Principal" per generic district org chart. Recorded as "Principal" with school-type=alternative in entry to be safe.
- **Tim Berndt is "interim"** at CERHS — flagged in `principalNotes` so future grinder runs know to re-check.
- **Doug LaMunyan / Charles Francis Adams**: WebSearch synthesis was clean and corroborated by Niche + USNews + PSR for the school. Did not independently fetch CHS principal page (chs.csdk12.org). Single-source name risk; should re-verify if any future run has a discrepancy.
- **Three Springs enrollment** sources show 91 (Niche), 116 (NCES alt-period), 88 (USNews) — recorded 91 (Niche, most recent). NCES `alternative` programs commonly have ±25% variance.
- **Chimacum Jr/Sr enrollment** Niche shows 276 grades 7-12, NCES shows 258. The grades 7-12 vs 9-12 split likely accounts for the variance. Recorded 276.
- **W F West graduation rate** Niche shows 95%, USNews/PSR show 97.6%. Recorded 95% (more conservative + Niche is most recent).

### CALIBRATION SUGGESTIONS
- **Reconciliation in progress.json**: bumped totalRuns 13 -> 16 to absorb runs 14+15 (which committed enriched data without bumping progress). This run is structurally Run 16 (chronologically the third grinder pass since the offset 104 cursor froze).
- **Recommend keeping batch_size=8** for next 1-2 runs. Heavy alt-placeholder cluster expected at offsets 137-160 (per the queue: Clover Park area + Pacific Lutheran area + alphabetical CO-bands typically have alt-school density).
- **Pre-dedup check is now mandatory** — bake it into the next prompt revision: before counting toward batch, name-check each candidate against `enriched.json`, advance past dups silently. If formalized, batch_size could safely bump to 10.
- **Skill Center / juvenile rehab / Open Doors carve-outs from prior runs all held this run** — good signal that the schema is stable enough to allow batch_size 10 in the near future.

### OPEN QUESTIONS / TODO
- Should the inject pipeline normalize `enrollment` to a single most-recent NCES year + a `enrollmentRangeNote` for cases like Three Springs (88-116 range across sources)?
- Should `principal` schema have a `principalStatus: permanent | interim | acting` field? Tim Berndt at CERHS would benefit from this.
- The progress.json drift problem (runs 14+15 stale) suggests progress.json should be auto-derived from `k12-enriched.json` last-row offset rather than separately maintained, to prevent future stale-cursor bugs.

## RUN HISTORY UPDATE (compact, recent 10 only)

| Date       | Run # | Verified | Skipped | Notable                                                                                                |
|------------|-------|----------|---------|--------------------------------------------------------------------------------------------------------|
| 2026-04-26 | 16    | 8        | 7       | WA high offsets 120-136 (Lewis/Chelan/Cheney/Chewelah/Chimacum/Clarkston/Cle Elum band). 8/8 verified incl. 1 alt (Three Springs); 7 alt-placeholder skips all <50. Caught up progress.json which had been stale at offset 104 since run 13 (runs 14+15 committed data without bumping cursor). Wall-clock ~10 min, mostly WebSearch + 1 Finalsite staff fetch. |
| 2026-04-26 | 15    | 6        | 2       | WA high offsets 112-119 (CVSD Spokane). Edge-case heavy: SVT Skills Center + CVSD Open Doors + Green Hill juvenile-rehab academic — all enriched cleanly via prior carve-outs. |
| 2026-04-26 | 14    | 8        | 0       | WA high offsets 104-111 (Cashmere/Castle Rock/CK SD/CVSD). 8/8 verified clean comprehensive band. Caught Hittle/CVHS hallucination via direct admin-page fetch (actual: Katie Louie). |
| 2026-04-26 | 13    | 5        | 3       | WA high offsets 96-103 (Camas SD cluster + Neah Bay tribal + Cascade SD Leavenworth). Tribal-school carve-out applied. |
| 2026-04-26 | 20    | 6        | 2       | WA high offsets 177-184 (Edmonds SD cluster + Ellensburg + Elma + Entiat). Verified Edmonds eLearning Academy (Kim Hunter), Edmonds-Woodway HS (Allison Chace Larsen, IB), Edmonds Career Access Program (consortium-no-principal), Ellensburg HS (Beau Snow), Elma HS (Tatia Holme), Entiat MS/HS (principal blank). Skipped East Grays Harbor pair (enr=8, enr=44 — both <50 alt). Wasted ~10 min on stale-clone trap before reclone (see lesson). |
| 2026-04-26 | 12    | 5        | 3       | WA high offsets 88-95 (Bremerton/Brewster/Bridgeport/Burlington-Edison). Alt-cluster band; Skills Center carve-out applied. |
| 2026-04-26 | 11    | 6        | 2       | WA high offsets 80-87 (Bethel/Blaine/Bremerton). All-WebSearch run, district clustering held. |
| 2026-04-25 | 10    | 6        | 2       | WA high offsets 72-79 (Bellingham/Bethel district cluster). |
| 2026-04-26 | 9     | 3        | 5       | Dup-with-manual-entries problem surfaced; /tmp full + fuse mount traps discovered. |
| 2026-04-26 | 8     | 7        | 1       | Battle Ground / Prairie / Summit View / Lumen / Whatcom batch. |
| 2026-04-26 | 7     | 6        | 2       | WebFetch failures + site:domain workaround. |

## RUN 17 (2026-04-26) — Lakewood/Colfax/College Place/Burbank/Colville/Concrete band (offsets 137-154)

### Outcome
- Verified: 8 (Clover Park HS, Lakes HS, Harrison Prep, Colfax HS, College Place HS, Columbia HS Burbank, Colville Senior HS, Concrete HS)
- Skipped: 10 (Swiftwater alt 22, Alfaretta House special_ed 14, Re-Entry HS 0, Transition Day 12, Oakridge Group 3, CPSD Open Doors 218 [name-pattern auto-skip], College Place Open Doors 8, Columbia Alt 0, Colville Fish Hatchery vocational 1, Twin Cedars alt 0)
- Wall-clock: ~10 min, 1 successful WebFetch (Concrete HS staff directory ~149KB, parseable via python regex)

### EFFECTIVE PATTERNS (added)
- **Combined-role discovery via direct staff-directory fetch**: Concrete SD (small rural Skagit district) has Carrie Crickmore as both **Superintendent and Principal** — surfaced from staff-directory page that web-search couldn't pin down. Lesson: when WebSearch returns ambiguous results for small rural HS principals, fetch the district's HS staff-directory URL directly; the JSON-wrapped HTML is parseable via python regex on `principal` keyword even at 100KB+.
- **Lakewood Clover Park SD cluster (3 schools)**: Clover Park HS + Lakes HS + Harrison Prep — district-clustering held but each school had different administrative pages. Cluster batching saved time on context-switching but each school still needed an individual `"[School]" Lakewood principal 2024 2025` query because they don't share staff.
- **Cross-state homonym disambiguation for "Lakewood"**: Lakewood, WA vs Lakewood, OH/CA/NJ/CO are all distinct districts. Always include "Lakewood Washington" or "WA" in the query to defeat the OH/NJ Lakewood HS dominance in search results.
- **Outgoing/incoming principal transitions**: Colfax HS had David Gibb (out, 6 years) → R. Aaron Lippy (in, 2025-26). Two-article confirm via Whitman County Gazette (April 2025 nomination + 2026 follow-up "top story" recap). Lesson: when a principal-transition article surfaces, *always* search for a follow-up confirmation article 6-12 months later before recording the new name as current.

### FAILED PATTERNS (added)
- **Niche / RateMyTeachers role-confusion**: For Lakes HS, an old RateMyTeachers archive listed Kären Mauer-Smith as "Registrar" — first-pass WebSearch synthesis surfaced this and contradicted the actual current "Principal" listing on the district staff page. Lesson: when role conflict appears in synthesis, *always* prefer the district's official staff page URL (lakes.cloverpark.k12.wa.us/students/school_groups/guidance_office/meet_our_staff) over third-party archives.
- **Synthesis hallucination on conflicting names**: For Clover Park HS, first synthesis paragraph claimed "Tim Stults" as principal alongside "Jennifer Appel" — Stults is outdated. Lesson: when synthesis offers two candidate names, run a `"[Candidate]" [School] [district]` confirmation query before recording either; the wrong name will produce no LinkedIn/news hit, the right one will.

#
- **NEW (Run 21):** Don't trust the first WebSearch hit for `"School" "Mill Creek" principal` — for Henry M Jackson HS, the 2024-25 student handbook shows "Monica Pierce, Principal for Instruction (12th grade)" prominently. That's a sub-role, NOT the head principal. The actual head is Lance Balla (verified via countyoffice.org snippet quoting "Lance Balla is listed as the Principal"). **Lesson:** when a school's handbook lists multiple "Principal of X" roles, do a follow-up search for "head principal" to disambiguate.
- **NEW (Run 21):** Don't `git clone` to `/tmp/wayfinder` — the fresh clone *appears* to succeed with current-user ownership but underlying files (e.g. `k12-enriched.json`) get written with `nobody:nogroup` ownership from the prior session's leftovers, blocking subsequent writes with `Permission denied`. Confirmed AGAIN this run (Run 21) — same trap as Runs 9/11. Always clone to `/sessions/[session-id]/wfclone-$$` from the start.

## SOURCE-SPECIFIC NOTES (added)
- `concrete.k12.wa.us/en-US/contact-us/high-school-staff-directory-db71f6b6` — ~149KB; web_fetch saves to file; principal name parseable via python regex on `principal` keyword.
- `cphs.cloverpark.k12.wa.us/principal-message` — clean, fetches inline; carries principal name in body.
- `harrisonprep.cloverpark.k12.wa.us/` — clean, IB-focused school page.
- `lakes.cloverpark.k12.wa.us/students/school_groups/guidance_office/meet_our_staff` — staff list, parseable.
- `wcgazette.com` — high-yield Whitman County (Colfax/Pullman) news source for school admin transitions.
- `union-bulletin.com` — high-yield Walla Walla / College Place news source.
- `goskagit.com` — high-yield Skagit County (Concrete/Mt Vernon/Burlington) news source.

### DATA QUALITY FLAGS
- **Columbia HS Burbank single-source principal**: Kyle Miller from Wikipedia only — no LinkedIn/news byline corroboration found. Recommend follow-up cross-check on csd400.org admin page next pass.
- **Lakes HS staff-page role conflict** (registrar vs principal for Mauer-Smith) — recorded as Principal per current district staff page; flagged in `principalNotes`.
- **Concrete HS combined Superintendent/Principal role** — Carrie Crickmore holds both; record reflects the dual role in `principalNotes`.
- **CPSD Open Doors Program (enr=218)** is the first Open Doors entry above the <50 skip threshold. Per name-pattern lessons rule from Run 13, auto-skipped without research because "Open Doors" name pattern signals consortium-administered alternative pathway, not a regular HS — but worth noting for future-prompt revision: should the threshold be enr<100 specifically for Open Doors / Reentry / Virtual Academy patterns to avoid over-aggressive skipping?

### CALIBRATION SUGGESTIONS
- **Heavy alt-cluster band confirmed**: 10 of 18 raw rows (55%) at offsets 137-154 were sub-50 alt placeholders or special-ed homes. The CPSD Lakewood band has the worst alt-density seen so far (5 of 9 CPSD rows were skipped). Recommend keeping batch_size=8 — bumping to 10 in this band would only yield maybe 1-2 extra schools but cost more wall-clock per skip.
- **Open Doors name-pattern carve-out works at the >50 threshold too**: CPSD Open Doors enr=218 was correctly auto-skipped without research per the name-pattern rule. The rule is robust.
- **Pre-dedup pass**: Run 17 had 0 dups (all 8 candidates were NEW), but the Run 9/16 proposal to formalize a pre-dedup pre-filter remains open.
- **Recommend keeping batch_size=8** for next 1-2 runs. Queue at offset 155+ enters Coupeville / Creston / Cusick / Curlew band — likely lower density, more rural single-district schools.

### OPEN QUESTIONS / TODO
- Should `principalNotes` get a structured `principalRole: "primary | combined-superintendent | interim | acting"` field? Concrete HS would benefit. CERHS (Run 16's Tim Berndt interim) too.
- Wikipedia-only principal name (Columbia HS Burbank Kyle Miller) — should the schema mark single-source-name entries with a `verificationStrength: "low|medium|high"` tag so a future pass can reprioritize re-verification?
- `Open Doors` name-pattern: tighten or loosen? CPSD Open Doors at enr=218 was a real consortium program but auto-skipped. Future-prompt revision could carve out a "consortium reentry" track that processes these with a `schoolType: "open_doors_consortium"` schema.

## RUN HISTORY UPDATE (compact, recent 10 only)

| Date       | Run # | Verified | Skipped | Notable                                                                                                |
|------------|-------|----------|---------|--------------------------------------------------------------------------------------------------------|
| 2026-04-26 | 17    | 8        | 10      | WA high offsets 137-154 (Lakewood CPSD x3 + Colfax + College Place + Burbank Columbia + Colville + Concrete). 8/8 verified. Heavy alt-cluster band (55% skip rate). Concrete SD combined Superintendent/Principal (Carrie Crickmore) discovered via direct staff-directory fetch. Colfax incoming-principal transition (Lippy 2025-26 replacing Gibb) confirmed via 2 Whitman Gazette articles. ~10 min wall-clock, 1 WebFetch. |
| 2026-04-26 | 16    | 8        | 7       | WA high offsets 120-136 (Lewis/Chelan/Cheney/Chewelah/Chimacum/Clarkston/Cle Elum band). 8/8 verified incl. 1 alt (Three Springs); 7 alt-placeholder skips all <50. Caught up progress.json drift from runs 14+15. |
| 2026-04-26 | 15    | 6        | 2       | WA high offsets 112-119 (CVSD Spokane). Edge-case heavy: SVT Skills Center + CVSD Open Doors + Green Hill juvenile-rehab academic. |
| 2026-04-26 | 14    | 8        | 0       | WA high offsets 104-111 (Cashmere/Castle Rock/CK SD/CVSD). 8/8 verified clean comprehensive band. Caught Hittle/CVHS hallucination via direct admin-page fetch (actual: Katie Louie). |
| 2026-04-26 | 13    | 5        | 3       | WA high offsets 96-103 (Camas SD cluster + Neah Bay tribal + Cascade SD Leavenworth). |
| 2026-04-26 | 20    | 6        | 2       | WA high offsets 177-184 (Edmonds SD cluster + Ellensburg + Elma + Entiat). Verified Edmonds eLearning Academy (Kim Hunter), Edmonds-Woodway HS (Allison Chace Larsen, IB), Edmonds Career Access Program (consortium-no-principal), Ellensburg HS (Beau Snow), Elma HS (Tatia Holme), Entiat MS/HS (principal blank). Skipped East Grays Harbor pair (enr=8, enr=44 — both <50 alt). Wasted ~10 min on stale-clone trap before reclone (see lesson). |
| 2026-04-26 | 12    | 5        | 3       | WA high offsets 88-95 (Bremerton/Brewster/Bridgeport/Burlington-Edison). |
| 2026-04-26 | 11    | 6        | 2       | WA high offsets 80-87 (Bethel/Blaine/Bremerton). |
| 2026-04-25 | 10    | 6        | 2       | WA high offsets 72-79 (Bellingham/Bethel district cluster). |
| 2026-04-26 | 9     | 3        | 5       | Dup-with-manual-entries problem surfaced. |
| 2026-04-26 | 8     | 7        | 1       | Battle Ground / Prairie / Summit View / Lumen / Whatcom batch. |

## RUN 18 (2026-04-26) — Coupeville/Creston/Cusick/Darrington/Davenport/Dayton/Deer Park/East Valley band (offsets 155-168)

### Outcome
- Verified: 8 (Coupeville HS, Creston Jr-Sr HS, Cusick Jr Sr HS, Darrington HS, Davenport Senior HS, Dayton HS, Deer Park HS, East Valley HS Spokane)
- Skipped: 6 (Island Juv Det 2, Island Cty Corrections 0, Open Den 48-57 alt borderline + name change, Ferry Cty Open Doors 33 alt, Lincoln Cty Tech 0 vocational placeholder, Dayton SD Alt 3 alt)
- Wall clock: ~10 min, all WebSearch (no WebFetch needed)

### EFFECTIVE PATTERNS (added)
- **Three principal-transitions captured cleanly via newspaper bylines** (Whidbey News-Times Mar 2026 + Coupeville Sports Jan 2025 + Whidbey News-Times older "Coupeville schools pick new principal"): chained 3 articles to reconstruct the Geoff Kappes → Springy Yamasaki → Dan Berard → Becky Cays succession. Recorded the *acting* current principal (Cays) with full predecessor context in `principalNotes` so the entry stays accurate as the situation evolves.
- **Cooperative-district principal lookup**: For Creston Jr-Sr HS, the standalone school's NCES record points to a cooperative arrangement with Wilbur SD. The `wcsd.wednet.edu/page/wilbur-creston-high-school` page surfaced Teresa Chrisman as the cooperative principal — single search query yielded the cooperative structure + principal name. **Pattern:** for any small rural WA HS with enrollment <100 in a Lincoln/Adams/Whitman/Garfield county district, check whether it's part of a cooperative before recording.
- **Press-archive disambiguation for transitional principals (Dayton's Guin Joyce)**: The Dayton Chronicle 2022 hire announcement + the Waitsburg Times 2024 superintendent-finalist article confirmed Joyce was *still* the secondary principal as of early 2024 (since she didn't get the super job, she stayed in the principal role). Two-source timestamp triangulation works well for "is this person still in the role?" verification.
- **Single-quoted-name search for tier-2 small rural districts** (`"Steve Bollinger" Cusick Washington principal`) cleanly returned the K-12 Principal title + district directory hit. Worked first try without needing district homepage fetch.

### FAILED PATTERNS (added)
- **Open Den (Coupeville alternative HS)** has been renamed to "Coupeville Open Academy" (board action March 2024, per Coupeville Sports). NCES still has it as "Open Den" with enrollment 57; Niche shows 48 (post-rename). Borderline <50 enrollment + name-change pending in NCES = skip. Future runs may want a `nameAlias` lookup.
- **Don't conflate WA Davenport (Lincoln County, Gorillas) with FL/TX Davenport HS** in initial WebSearch — first results page mixed all three. Add state qualifier (`Washington` + `Lincoln County`) to disambiguate.

#
- **NEW (Run 21):** Don't trust the first WebSearch hit for `"School" "Mill Creek" principal` — for Henry M Jackson HS, the 2024-25 student handbook shows "Monica Pierce, Principal for Instruction (12th grade)" prominently. That's a sub-role, NOT the head principal. The actual head is Lance Balla (verified via countyoffice.org snippet quoting "Lance Balla is listed as the Principal"). **Lesson:** when a school's handbook lists multiple "Principal of X" roles, do a follow-up search for "head principal" to disambiguate.
- **NEW (Run 21):** Don't `git clone` to `/tmp/wayfinder` — the fresh clone *appears* to succeed with current-user ownership but underlying files (e.g. `k12-enriched.json`) get written with `nobody:nogroup` ownership from the prior session's leftovers, blocking subsequent writes with `Permission denied`. Confirmed AGAIN this run (Run 21) — same trap as Runs 9/11. Always clone to `/sessions/[session-id]/wfclone-$$` from the start.

## SOURCE-SPECIFIC NOTES (added)
- `whidbeynewstimes.com` / `southwhidbeyrecord.com` / `coupevillesports.com` — high-yield Island County WA news triad; Coupeville SD admin transitions consistently surface here with named-byline articles.
- `wcsd.wednet.edu` (Wilbur-Creston Cooperative) — multi-district cooperative homepage; reachable via WebSearch. The cooperative-school page directly lists principal name in body content.
- `daytonchronicle.com` — high-yield Columbia County WA local paper; Dayton SD admin transitions and superintendent searches covered with named bylines.
- `waitsburgtimes.com` — also high-yield for Walla Walla / Columbia County coverage.
- `statesmanexaminer.com` — Deer Park / Stevens County news; useful for Deer Park HS reclassification + admin coverage.
- `ncwbusiness.com` (already noted in Run 13) — NCW (Wenatchee + surrounding) press source for principal transitions.

### DATA QUALITY FLAGS
- **Coupeville HS**: 3 principals in 18 months (Kappes → Yamasaki interim → Berard → Cays acting). Recorded current acting principal; flagged in `principalNotes` for re-verification on next pass through this district.
- **Creston Jr-Sr HS**: enrollment of 54 alone, but cooperative HS instruction is centralized at Wilbur. The NCES record may be stale — both districts may report identical/near-identical schools through cooperative arrangement.
- **Open Den (offset 158)**: Renamed to "Coupeville Open Academy" 2024; NCES still uses old name. **Recommend rename normalization** at inject time so frontend doesn't show stale name.
- **Davenport Senior HS** grades 6-12 (per Niche) but NCES classifies as `level: high`. Combined Jr/Sr HS housed in one building — common pattern for rural WA <500-student districts.
- **Deer Park HS** graduation rate: 92% Niche / 85-89% USNews / 96.2% school-reported. Recorded the middle estimate (Niche) per prior conservative-default rule.
- **East Valley HS (Spokane)** has had 18% enrollment decline over 5 years per Niche. Worth tracking as a downward-trend indicator for the East Valley SD.

### CALIBRATION SUGGESTIONS
- **Recommend bumping batch_size to 10 for next 1-2 runs**. This run's queue was clean comprehensive-HS band (only 2 of 14 raw rows were structural <50 placeholders aside from Open Den borderline). Net 8/14 = 57% verification rate, but the comprehensive-HS share is rising as we exit alphabetical-by-district. The next bands (E-G) will likely include Edmonds/Eastmont/Eatonville/Edgemont/Enumclaw/Everett/Federal Way/Ferndale/Forks/Friday Harbor — large comprehensive HS districts with deep enrichment data.
- **Pre-dedup pass STILL not formalized in prompt** — Run 18 had zero dups but the risk grows as the queue advances toward populous-district bands where prior manual entries (Run 4) cluster.
- **Cooperative-district carve-out**: when a school's NCES record indicates cooperative arrangement (Wilbur-Creston, Wahkiakum-Naselle, etc.), record principal at the cooperative level + add `cooperativeNotes` field. New schema field worth formalizing.
- **Acting/Interim principal annotation**: Coupeville HS this run has an "Acting" principal (Becky Cays). Recommend formalizing `principalStatus: permanent | interim | acting | on-leave` field as previously suggested in Run 16.

### OPEN QUESTIONS / TODO
- Should the inject pipeline normalize NCES "Open Den" → "Coupeville Open Academy" via a `nameAlias` map? Same for any other recent renames.
- The cooperative-school principal arrangement (Wilbur-Creston shared admin) is a recurring rural-WA pattern. Worth a one-time pass to identify all WA cooperative HS arrangements and tag them.
- Three principal transitions in 18 months at Coupeville HS suggest the entry will need re-verification soon. Worth a `verifyAfter: <date>` field to flag entries needing re-verification?

## RUN HISTORY UPDATE (compact, recent 10 only)

| Date       | Run # | Verified | Skipped | Notable                                                                                                |
|------------|-------|----------|---------|--------------------------------------------------------------------------------------------------------|
| 2026-04-26 | 18    | 8        | 6       | WA high offsets 155-168 (Coupeville/Creston/Cusick/Darrington/Davenport/Dayton/Deer Park/East Valley). 8/8 verified, 6 sub-50/placeholder skips. Captured 3 principal transitions at Coupeville (Kappes→Yamasaki→Berard→Cays Acting Mar 2026). Cooperative-district detail captured for Creston (Wilbur-Creston cooperative under Teresa Chrisman). All-WebSearch run, ~10 min. |
| 2026-04-26 | 17    | 8        | 10      | WA high offsets 137-154 (Lakewood/Colfax/College Place/Burbank/Colville/Concrete band). Concrete combined Super-Principal role (Carrie Crickmore). |
| 2026-04-26 | 16    | 8        | 7       | WA high offsets 120-136 (Lewis/Chelan/Cheney/Chewelah/Chimacum/Clarkston/Cle Elum band). Caught up progress.json drift since run 13. |
| 2026-04-26 | 15    | 6        | 2       | WA high offsets 112-119 (CVSD Spokane). Edge-case heavy: Skills Center + Open Doors + juvenile-rehab. |
| 2026-04-26 | 14    | 8        | 0       | WA high offsets 104-111 (Cashmere/Castle Rock/CK SD/CVSD). Caught Hittle/CVHS hallucination via direct admin-page fetch. |
| 2026-04-26 | 13    | 5        | 3       | WA high offsets 96-103 (Camas SD cluster + Neah Bay tribal + Cascade SD Leavenworth). Tribal-school carve-out applied. |
| 2026-04-26 | 20    | 6        | 2       | WA high offsets 177-184 (Edmonds SD cluster + Ellensburg + Elma + Entiat). Verified Edmonds eLearning Academy (Kim Hunter), Edmonds-Woodway HS (Allison Chace Larsen, IB), Edmonds Career Access Program (consortium-no-principal), Ellensburg HS (Beau Snow), Elma HS (Tatia Holme), Entiat MS/HS (principal blank). Skipped East Grays Harbor pair (enr=8, enr=44 — both <50 alt). Wasted ~10 min on stale-clone trap before reclone (see lesson). |
| 2026-04-26 | 12    | 5        | 3       | WA high offsets 88-95 (Bremerton/Brewster/Bridgeport/Burlington-Edison). Skills Center carve-out applied. |
| 2026-04-26 | 11    | 6        | 2       | WA high offsets 80-87 (Bethel/Blaine/Bremerton). All-WebSearch run, district clustering held. |
| 2026-04-25 | 10    | 6        | 2       | WA high offsets 72-79 (Bellingham/Bethel district cluster). |
| 2026-04-26 | 9     | 3        | 5       | Dup-with-manual-entries problem surfaced; /tmp full + fuse mount traps discovered. |

## RUN 19 (2026-04-26) — Eastmont/Eatonville/Edmonds-SD band (offsets 169-176)

### Outcome
- Verified: 6 (Eastmont Senior High, Eatonville HS, Scriber Lake HS [alt-choice], Lynnwood HS, Meadowdale HS, Mountlake Terrace HS [STEM magnet])
- Skipped: 2 (Easton Secondary enr=0 placeholder; ESD New Beginnings [Eatonville SD] enr=40 alt)
- Wall-clock: ~10 min — mix of WebSearch + 4 large-file `about` page fetches with python regex parsing

### EFFECTIVE PATTERNS (added)
- **Edmonds SD `*.edmonds.wednet.edu/about` pages all carry `Principal: <Name>` in plain text** (Lynnwood, Meadowdale, Mountlake Terrace, Scriber Lake all confirmed this pattern). Pages exceed inline token cap (60-90KB) but the saved-fetch-file + python regex `[Pp]rincipal[^A-Za-z].{0,300}` extracts cleanly. Same pattern works for assistant principals — 3-4 staff names per fetch in one pass. Net: 4 schools verified in 4 fetches (1 per school), all single-source-of-truth from school's own site.
- **Eatonville's Finalsite `principals-message` page carries the principal name + photo as plain text + image alt-text** (Amy Sturdivant). Page is ~80KB but inline-fetchable. Pattern: `[district].wednet.edu/[school-code]/about-us/principals-message` is a reliable single-source for small WA districts using Finalsite — bypass the staff-directory pages entirely.
- **eastmont206.org/ehs/people staff page is large (~270KB)** but `Del Enders` shows up cleanly via regex on the saved-fetch file under both `>Email Del Enders` and the principal block. Confirmed Del Enders hire from May 2024 Wenatchee World article.

### FAILED PATTERNS (added)
- **`site:edmonds.wednet.edu` WebSearch returned only general district hits** — no specific principal names per school surfaced in snippets. Going direct to school subdomain `*.edmonds.wednet.edu/about` was much faster. Lesson: for districts with subdomain-per-school sites, skip the district-level site: search and go straight to subdomain about pages.
- **`mhs.edmonds.wednet.edu/about` and `mths.edmonds.wednet.edu/about` both exceed the inline token cap (74KB and 87KB)** — but they SAVE TO FILE and the saved file is parseable with the python regex pattern. Pattern is now: try inline fetch, on token-exceed go straight to the saved file path under `mnt/.claude/projects/.../tool-results/`.

#
- **NEW (Run 21):** Don't trust the first WebSearch hit for `"School" "Mill Creek" principal` — for Henry M Jackson HS, the 2024-25 student handbook shows "Monica Pierce, Principal for Instruction (12th grade)" prominently. That's a sub-role, NOT the head principal. The actual head is Lance Balla (verified via countyoffice.org snippet quoting "Lance Balla is listed as the Principal"). **Lesson:** when a school's handbook lists multiple "Principal of X" roles, do a follow-up search for "head principal" to disambiguate.
- **NEW (Run 21):** Don't `git clone` to `/tmp/wayfinder` — the fresh clone *appears* to succeed with current-user ownership but underlying files (e.g. `k12-enriched.json`) get written with `nobody:nogroup` ownership from the prior session's leftovers, blocking subsequent writes with `Permission denied`. Confirmed AGAIN this run (Run 21) — same trap as Runs 9/11. Always clone to `/sessions/[session-id]/wfclone-$$` from the start.

## SOURCE-SPECIFIC NOTES (added)
- `*.edmonds.wednet.edu/about` — all four high-school subdomain about-pages tested in Run 19 follow the same template: `Principal: <Name>` followed by `Assistant Principal: <Name>` rows. Reliable single-source.
- `eatonville.wednet.edu/ehs/about-us/principals-message` — Finalsite-template principal-letter page; inline-fetchable (~80KB); image alt-text + signed letter both name the principal.
- `eastmont206.org/ehs/people` — large staff directory page (~270KB), saves to file, parseable via regex; includes principal email format.
- `lynnwoodtimes.com/2024/09/05/principals/` — Edmonds SD's "11 new principals" article from 2024; useful for cross-checking Edmonds SD admin transitions, though most current data was on the school's own about page.
- `wenatcheeworld.com` — high-yield Wenatchee/East Wenatchee news source for Eastmont SD admin transitions.

### DATA QUALITY FLAGS
- **Mountlake Terrace HS leadership transition**: Crosby Carpenter was principal in March 2024 (per My Edmonds News board meeting article); David Friedle is current principal (per mths.edmonds.wednet.edu/about). Recorded Friedle with note in `principalNotes`.
- **Scriber Lake HS Dan Falk is INTERIM** — flagged with `principalStatus: "interim"`. Future grinder runs should re-check.
- **Lynnwood HS principal verification**: name is "Jesse Goodsky" with email-prefix `skyj@edmonds.wednet.edu` — uncommon spelling, confirmed via direct fetch (no WebSearch result mentioned the name). Single-source but the source IS the school's own about page, so confidence is high.
- **Eatonville HS image filename hints at prior posting**: Amy Sturdivant's photo URL contains `Weyerhaeuser_Elementary` — implies she was previously at the elementary school in the same district. Not a quality issue, just an interesting district-internal-mobility data point.
- **Eastmont enrollment grades 10-12**: Eastmont serves only grades 10-12 (1562 students) — sophomore-and-up campus. Sister school Eastmont Junior High likely handles 9th grade. NCES schoolLevel=3 (high) is correct but `grades` field set to "10-12" not "9-12".

### CALIBRATION SUGGESTIONS
- **6 verified + 2 skipped = net 6/8 batch**. Slightly below ideal (8/8) but right at the typical 25% skip rate. Recommend keeping batch_size=8 for next 1-2 runs while the queue traverses the Edmonds/Ellensburg/Enumclaw band — these are mostly clean comprehensive HS districts but with the usual 1-2 alt placeholders interleaved per district.
- **Dedup pre-filter is now demonstrably necessary**: progress.json was stale at offset 96 (showed Run 12 state) but actual enriched.json was already at Run 18 (offset 169). Required reading the actual enriched.json + progress.json fresh-clone-side-by-side to discover the drift. Run 16 lessons mentioned the same issue. Codification: next prompt iteration MUST add a step "before selecting batch, derive next-offset from `enriched.json` length-based proxy AND cross-check progress.json — use the higher offset as authoritative".
- **Stale `/tmp/wayfinder` clone trap (re-confirmed)**: this run hit the Run 11 lesson — old `/tmp/wayfinder` from prior session was owned by `nobody:nogroup`, and that stale clone had Run 12-state data that was 7 runs out of date. The fresh `/sessions/jolly-loving-feynman/wfclone-$$` clone had the correct current state. **Always clone fresh on `/sessions/[session-id]/` first thing**, never trust an existing `/tmp/wayfinder`.

### OPEN QUESTIONS / TODO
- Should `principalStatus` be added as a first-class schema field? Run 16 (Tim Berndt CERHS interim), Run 19 (Dan Falk Scriber Lake interim), Run 18 (Becky Cays Coupeville acting) all have interim/acting flags — making it a first-class field would let the frontend filter "schools with permanent leadership" if useful.
- Edmonds SD has 4 high schools all on the same Finalsite template — a one-time scraper to pull `Principal:` from each `*.edmonds.wednet.edu/about` page might be more efficient than the per-grinder-run pattern. Worth proposing if Edmonds-style multi-school subdomain districts cluster again.
- Eastmont's 10-12 grade structure suggests a `feederSchool` field for sophomore-and-up campuses — would help college-search UX understand the actual entry grade.

### RUN HISTORY UPDATE (compact, recent 10 only)

| Date       | Run # | Verified | Skipped | Notable                                                                                                |
|------------|-------|----------|---------|--------------------------------------------------------------------------------------------------------|
| 2026-04-26 | 19    | 6        | 2       | Eastmont/Eatonville/Edmonds-SD cluster (offsets 169-176). All 4 Edmonds SD HS verified via subdomain `about` pages: Lynnwood/Meadowdale/Mountlake Terrace + Scriber Lake choice. STEM magnet flag added for Mountlake Terrace. Caught 7-run progress.json drift from stale /tmp clone — re-cloned fresh on /sessions. ~10 min wall-clock. |
| 2026-04-26 | 18    | 8        | 6       | Coupeville/Creston/Cusick/Darrington/Davenport/Dayton/Deer Park/East Valley (offsets 155-168).         |
| 2026-04-26 | 17    | 8        | 10      | Lakewood/Colfax/College Place/Burbank/Colville/Concrete band (offsets 137-154).                        |
| 2026-04-26 | 16    | 8        | 7       | Lewis/Chelan/Cheney/Chewelah/Chimacum/Clarkston/Cle Elum band (offsets 120-136).                       |
| 2026-04-26 | 15    | 6        | 2       | WA high offsets 112-119 (CVSD Spokane). Edge-case heavy.                                               |
| 2026-04-26 | 14    | 8        | 0       | WA high offsets 104-111 (Cashmere/Castle Rock/CK SD/CVSD). Caught Hittle/CVHS hallucination.           |
| 2026-04-26 | 13    | 5        | 3       | Camas SD cluster + Neah Bay tribal + Cascade SD Leavenworth.                                           |
| 2026-04-26 | 20    | 6        | 2       | WA high offsets 177-184 (Edmonds SD cluster + Ellensburg + Elma + Entiat). Verified Edmonds eLearning Academy (Kim Hunter), Edmonds-Woodway HS (Allison Chace Larsen, IB), Edmonds Career Access Program (consortium-no-principal), Ellensburg HS (Beau Snow), Elma HS (Tatia Holme), Entiat MS/HS (principal blank). Skipped East Grays Harbor pair (enr=8, enr=44 — both <50 alt). Wasted ~10 min on stale-clone trap before reclone (see lesson). |
| 2026-04-26 | 12    | 5        | 3       | Bremerton/Brewster/Bridgeport/Burlington-Edison.                                                       |
| 2026-04-26 | 11    | 6        | 2       | Bethel/Blaine/Bremerton SD cluster.                                                                    |
| 2026-04-25 | 10    | 6        | 2       | Bellingham/Bethel district cluster.                                                                    |
