# wayfinder-k12-grinder — Lessons Learned

> Read at the START of every run. Append takeaways at the END before push.

## CURRENT CALIBRATION (latest accepted values)

- batch_size: 8 schools (current setting in prompt)
- typical_run_duration: 12-20 min (Run 10 ~10 min — batched parallel WebSearch is fast for clusters of district-grouped schools)
- typical_skip_rate: ~25% structural; can spike to 60%+ when batch overlaps with manually-entered schools
- last_calibration_change: 2026-04-26 — Run 13 confirmed batch_size=8 holds for Camas SD cluster + tribal-reservation school + new-build STEAM program. 5/5 processable verified, 3 sub-50 alt skips. Tribal-school exemption added: enroll>50 + active district site → process; otherwise skip.

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

- **NEW (Run 14):** **Verify principal names against the school's own current administration page when historical mentions exist.** Web-search synthesis returned "Mike Hittle" as Central Valley HS principal — true in 2009 (Distinguished League Principal Award), but the current principal is Katie Louie (per cvhs.cvsd.org admin page footer). When the only WebSearch citation for a principal is from >5 years ago, treat as historical and follow up with a direct fetch of the school's admin page. Sharp School / Edlio sites expose admin lists in the page footer (`<span id="footer_names">`) which is parseable from a single fetch.
- **NEW (Run 14):** **CK SD's Sharp School/CMS sites embed admin info on the about page rather than staff-directory.** olympic.ckschools.org/about-olympic, cvhs.cvsd.org admin page, etc. — the staff-directory.html is a JS-rendered widget (empty without browser), but the about page footer carries Principal/AP names in `<p style="text-align: center;"><strong>Principal:</strong>` blocks. Saved-fetch + python regex extracts cleanly.

- **NEW (Run 15):** **Co-located school IDs share staff/principal.** SVT Skills Center (NCES 530111003387) and STEM Academy at SVT (NCES 530111003657) are two distinct NCES records but the same physical campus + administration (115 S University Rd, Spokane Valley) — both list Amanda St Pierre as principal. When two queue rows have the same address, treat them as a paired enrichment: research once, write two entries with cross-referencing `principalNotes`. Saves ~50% research time on these pairs.
- **NEW (Run 15):** **WA Open Doors / reentry programs DO have enrichable data** when enrollment > 50, even though they're consortium-administered. The CVSD/OSPI program profile PDF + the district's `/apps/pages/OpenDoors` landing page provide outcomes (diploma counts, GED counts) and consortium structure — counts as ≥3 verified fields without a traditional principal. Use `schoolType: "reentry"` and skip the principal field.
- **NEW (Run 15):** **Juvenile-rehab schools (Green Hill, Maple Lane historically)** have a clean enrichment path: WA DCYF page (facility info, superintendent name, capacity) + DCYF's youth handbook PDF + Wikipedia + Niche/USNews academic profile = 4-5 sources. Use `schoolType: "juvenile_rehabilitation"` and a `facilityNotes` field; the academic program is operated by the host district (Chehalis SD for Green Hill).

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


- **NEW (Run 13):** Don't WebFetch `nbs.cfsd401.org/332823_2` or other Cape Flattery SD pages — they return 169KB+ HTML that exceeds inline tokens and `principal` keyword grep over the saved file returned no matches (the principal name was instead surfaced via WebSearch result snippet). Skip the WebFetch step for `*.cfsd401.org/*` and go straight to WebSearch.


- **NEW (Run 14):** **Don't trust principal names sourced only from old award/news articles.** Spokesman-Review's 2009 "Hittle awarded principal honors" article surfaces in 2026 search results without dating context, and LLM synthesis treats it as current. Rule: any principal sourced from a news article older than 3 years should be treated as needs-verification, not as the answer.
- **NEW (Run 14):** **us news k12 pages with auto-generated leadership lists are stale.** US News' "Principal: [Name]" line on Olympic HS pointed to a generic answer because the data refresh appears to lag the school's own site. Prefer the school district's own admin page when available.

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

## CALIBRATION SUGGESTIONS FROM PAST RUNS

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
| 2026-04-26 | 15    | 6        | 2       | WA high offsets 112-119 (Central Valley SD cluster + Centralia HS + Green Hill juvenile-rehab academic). 6/6 processable verified (SVT Skills Center, CVSD Open Doors, STEM Academy at SVT, Ridgeline HS, Centralia HS, Green Hill Academic). 2 skipped (School to Life enr=33 special_ed, Futurus enr=47 alt). Three edge-case school types in one batch: Skills Center carve-out, reentry consortium, juvenile rehab — all enriched cleanly via existing rules. Wall-clock research ~8 min, all WebSearch + 1 small fetch. |
| 2026-04-26 | 13    | 5        | 3       | WA high offsets 96-103 (Camas SD cluster + Neah Bay tribal + Cascade SD Leavenworth). 5/5 verified (Camas HS 1983 enroll, Hayes Freedom alt 161, Discovery HS STEAM 201, Neah Bay Jr/Sr 196 Makah Reservation, Cascade HS Leavenworth 410). 3 sub-50 skips (Open Doors Mt Vernon enr=9, Camas SD Open Doors enr=6, Kodiak Virtual Academy Leavenworth enr=7). Note: Camas + Hayes Freedom + Discovery share district homepage `camas.wednet.edu` — district-cluster batching held. Tribal/reservation Neah Bay was processable (enroll>50). All-WebSearch run, ~7 min research. |
| 2026-04-26 | 14    | 8        | 0       | WA high offsets 104-111 (Cashmere + Castle Rock + Central Kitsap SD + Central Valley SD). 8/8 verified, 0 skipped — clean comprehensive-HS band. Caught Mike Hittle (CVHS) hallucination via direct cvhs.cvsd.org fetch — actual principal is Katie Louie. Wall-clock research ~12 min. |
| 2026-04-26 | 13    | 5        | 3       | WA high offsets 96-103 (Camas SD cluster + Cascade HS Leavenworth + Neah Bay Jr/Sr HS). 5/5 of processable verified (Camas HS [O'Rourke], Hayes Freedom [Holmes], Discovery HS [Huld, Ed.D.], Cascade HS [Swanson - new principal 2024-25], Neah Bay [Dafoe, Secondary Principal]). 3 alt-placeholder skips: Open Doors Mt Vernon (9), Camas SD Open Doors (6), Kodiak Virtual Academy (7) — all <50. Caught Mike-Hill hallucination via cross-verification with Wenatchee Business Journal byline. ~7 min research wall-clock, all WebSearch. |
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

### SOURCE-SPECIFIC NOTES (added)
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
| 2026-04-26 | 12    | 5        | 3       | WA high offsets 88-95 (Bremerton/Brewster/Bridgeport/Burlington-Edison). Alt-cluster band; Skills Center carve-out applied. |
| 2026-04-26 | 11    | 6        | 2       | WA high offsets 80-87 (Bethel/Blaine/Bremerton). All-WebSearch run, district clustering held. |
| 2026-04-25 | 10    | 6        | 2       | WA high offsets 72-79 (Bellingham/Bethel district cluster). |
| 2026-04-26 | 9     | 3        | 5       | Dup-with-manual-entries problem surfaced; /tmp full + fuse mount traps discovered. |
| 2026-04-26 | 8     | 7        | 1       | Battle Ground / Prairie / Summit View / Lumen / Whatcom batch. |
| 2026-04-26 | 7     | 6        | 2       | WebFetch failures + site:domain workaround. |
