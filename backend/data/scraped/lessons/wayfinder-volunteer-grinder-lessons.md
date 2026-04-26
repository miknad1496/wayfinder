# wayfinder-volunteer-grinder — Lessons Learned

> Read at the START of every run. Append takeaways at the END before push.

## CURRENT CALIBRATION (latest accepted values)

- batch_size: 5 entries (run 4 again completed 5-of-5 verified, 0 skipped — sustain at 5)
- typical_run_duration: ~15-20 min for 5 entries (most time in HTML extraction from Squarespace/WordPress sites)
- typical_skip_rate: 0-1 of 5 candidates
- last_calibration_change: 2026-04-26 — run 3 (raised from 4 → 5); run 4 confirms 5 is sustainable for Eastside cluster


## EFFECTIVE PATTERNS

- VolunteerMatch.org and Idealist.org are useful aggregator search sources
- Local United Way chapters typically have program listings under "Volunteer" or "Get Involved"
- `site:[city].gov "youth" volunteer` finds municipal teen programs
- For health-sector volunteering: `"[hospital]" "junior volunteer" OR "teen volunteer"`
- For environmental: `"[park / land trust]" volunteer days teens`
- Major regional museum/aquarium teen-corps programs (Pacific Science Center Discovery Corps, Seattle Aquarium YOA, Woodland Park Zoo Teen Volunteer, **Point Defiance Zoo Zoo Guides**) are excellent verified entries — sustained for decades, structured cohorts, cited in college-prep guides. Search formula: `"[museum/aquarium]" "teen volunteer" OR "youth advocate"` then verify on the org's own /volunteer/ page.
- Library systems (KCLS) offer well-documented teen volunteer pages with explicit age ranges. Search: `"[library system]" teen volunteer program`.
- Hopelink-style multi-program social service nonprofits (regional United Way affiliates, county food bank coalitions) consolidate many volunteer roles — one DB entry can cover warehouse / food market / home delivery / weekly community dinners.
- State-based environmental/trail orgs (Washington Trails Association) run hundreds of work parties per year — strong for "leadership / outdoor stewardship" angle. Search: `"[state] trails association"`, `"[state] conservation corps"`.
- **NEW (run 3):** Children's museums (Greentrike Children's Museum of Tacoma, Mobius Discovery Center Spokane) consistently publish age-min on `/volunteer` pages — typically 14-16+. Strong fit for "education + arts" combined categorization. Search: `"[city] children's museum" volunteer age` works well.
- **NEW (run 3):** Regional Feeding America food banks (Second Harvest Inland Northwest) cover a multi-county footprint — appropriate to mark `scope: state` and put both home state + neighbor state in `states` (Second Harvest serves WA + ID).
- **NEW (run 3):** "Rescue mission" / city-mission orgs (Tacoma Rescue Mission, founded 1912) are structured for sustained recurring volunteering with explicit age tiers (often 8+ with adult, 18+ for some sites). Search: `"[city] rescue mission" volunteer FAQ`.
- **NEW (run 4):** When direct `web_fetch` redirects are cancelled (LifeWire) or the page is JS-rendered (Jubilee REACH on Squarespace), fall back to `curl -sL --max-redirs 5 -A "Mozilla/5.0"` from bash for the canonical org URL. This recovered LifeWire's age-min text where the internal tool failed. Pattern: `curl -sL -A "Mozilla/5.0" URL -o /tmp/page.html` then `python3` HTML-strip + regex-grep. The 404 footer of an org's site often reveals the real volunteer-page slug (LifeWire 404 footer linked to `/get-involved/volunteer/`).
- **NEW (run 4):** KCLS BiblioCommons curated lists (Adult Bellevue Volunteering Resources, Teen Bellevue Volunteering Resources at `kcls.bibliocommons.com/v2/list/display/2311538779/...`) are useful corroborating sources — librarian-vetted, often include explicit age-min annotations alongside official URLs. Treat as a starting filter for orgs to research, then verify on the org's own canonical page.
- **NEW (run 4):** For Eastside (Bellevue/Sammamish/Issaquah/Kirkland) cluster, the `/volunteer` slug is consistent across the strongest candidates (Renewal Food Bank, Sophia Way, KidVantage, EFS, LifeWire). Pre-fetch all 5 in parallel-ish first; only research more if 2+ skip.
## FAILED PATTERNS / KNOWN ANTI-PATTERNS

- Programs that look national but are actually defunct local chapters (verify the chapter is still active by looking for events in the last 6 months)
- Pay-to-volunteer programs ("send your teen to Bali to teach English for $4,500") — voluntourism, NOT a fit
- One-off events (Susan G Komen 5K) — DB is for sustained recurring programs only
- Faith-based programs that require religious affiliation as a participation requirement (note when this applies, but most welcome non-affiliated volunteers)
- Squarespace/WordPress nonprofit volunteer pages that omit age min (e.g. Ballard Food Bank in run 2). Skip rather than guess.
- **NEW (run 3):** Some org sites are split between a brochure home page and a `/get-involved/volunteer/` URL that returns 404 (Emergency Food Network, Tacoma — `/get-involved/volunteer/` 404s even though the home-page nav links to it). Treat as a SKIP unless an alternate canonical URL exists. Re-check via Wayback or volunteer-portal subdomains in a future run.
- **NEW (run 4):** Bellevue Botanical Garden currently has NO ongoing teen volunteer slots — only annual Scout Day in spring. Skip until they revive a teen-corps. Pattern: confirm "currently does not have opportunities for teen volunteers" before listing.
- **NEW (run 4):** Imagine Housing Bellevue volunteer page omits explicit age min — only states background check + orientation requirements. Per the Squarespace/WordPress skip rule, do NOT guess. Skip until the page is updated or contact yields a number.
- **NEW (run 4):** Jubilee REACH (Bellevue Lake Hills) is a strong-fit org (2000+ volunteers, after-school sports across 7 middle schools, KidREACH tutoring, ESL, Camp Jubilee) but the Squarespace `/volunteer` and `/get-involved-volunteer-individual` pages do NOT publish an explicit age min. WA state law requires background checks for under-16 volunteers with unsupervised child contact, which the org acknowledges, but no minimum is on the public page. SKIPPED per "no guessing" rule. Re-check next quarter for an updated FAQ — meanwhile a contact-email verification approach could unlock this entry.
## SOURCE-SPECIFIC NOTES

- `wta.org/get-involved/volunteer/questions` — comprehensive FAQ with explicit age policy (10+, <14 with adult, <18 parent sign-in). Reliable single-fetch verification.
- `seattleaquarium.org/act-for-the-ocean/volunteer/youth-ocean-advocates/` — clean structured page listing tiers, eligibility, application timeline. Reliable.
- `hopelink.org/ways-to-help/volunteer/` — explicit age policy (16+, some 18+) and 2025 hours stat (61,730) on the page itself.
- `kcls.org/news/teen-volunteer-program-tvp/` — narrative news article rather than a structured volunteer page. Useful for verifying program existence and origin date; for explicit age info also reference `kcls.org/faq/volunteer/`.
- `pdza.org/connect/volunteer/` — Cloudflare-protected; direct curl returns the JS challenge page. The internal web_fetch tool succeeds and returns the full content. Comprehensive page listing Zoo Guides (14-18, grades 9-12), Spot the Swallows (14+ with parental supervision), Explore the Shore (16+), 1-yr commitment minimum.
- `trm.org/volunteer-faq/` — well-structured FAQ: ages 8+ (8-13 w/ adult), 18+ for Donation Center / Litter Pickup, High Impact role requires interview + 6-month commitment. Volunteer hub at rescue-mission.volunteerhub.com.
- `2-harvest.org/volunteer/` — clear age policy (14+ independent; 9-13 with chaperone; under 9 not allowed). Multi-county footprint (WA + ID).
- `greentrike.org/about/volunteer` — 14+ with 14-17 needing parent permission form. Background check required. VMIS registration.
- `mobiusdiscoverycenter.org/join/volunteer/` — minimum 16 (15- with adult 18+), criminal background check. Spokane museum.
- **TODO (still open from run 2):** check if Ballard Food Bank's volunteer application form (linked from /volunteer page) discloses age min — try a deeper crawl next time.
- **TODO (run 3):** Emergency Food Network Tacoma — find canonical volunteer URL (search results cite repack/Mother Earth Farm policies but `/get-involved/volunteer/` 404s).
- `renewalfoodbank.org/volunteer` — explicit age policy (14+; under 14 with adult chaperone during non-operational hours). Published 1998 founding date and 500K+ individuals served stat. GoDaddy / wsimg-hosted; clean fetch via internal web_fetch.
- `sophiaway.org/volunteer/` — WordPress (Yoast SEO). Per-program age tiers laid out per-shift: Donation Center 16+ (10-15 w/parent); Shelter Assistance women-only 18+ (13-17 w/parent); Youth Engagement Committee for high schoolers explicitly named.
- `kidvantagenw.org/volunteer/` — Cloudflare protected; redirected on direct fetch but HTTP 200 with internal web_fetch on `/volunteer/` path. Welcomes 12+ on own; 12-13 must be 1:1 with adult. Multi-hub footprint (Issaquah/Shoreline/Bremerton).
- `eastsidefriendsofseniors.org/volunteer` — Wix site, clean text. Explicit "All volunteers must be 16+ and drivers 21+" + 2-5 hr/mo for 6 months minimum commitment.
- `lifewire.org/get-involved/volunteer/` — internal web_fetch returns "Redirect was cancelled" (cookie/CSRF challenge); recovered the canonical slug from the LifeWire 404 page footer, then bash `curl -sL -A "Mozilla/5.0"` succeeded. Page lists role types (Stewardship Ambassador, Event Assistant, Social Media Strategist, In-Kind Donations) and age policy: "Volunteers under the age of 18 must be supervised by a parent or guardian and may not be eligible for all opportunities." 20-hour DV 101 training is the gateway to advocacy roles.
- `kcls.bibliocommons.com/v2/list/display/2311538779/2325333629` (Adult Bellevue Volunteering Resources) and `.../2316615229` (Teen Bellevue Volunteering Resources) — librarian-curated with annotation notes that often surface age policies before fetching the org's own page.
## DATA QUALITY FLAGS DISCOVERED

- Hopelink, KCLS, Seattle Aquarium YOA, WTA, PDZA, TRM, Greentrike, Mobius are all "scope": "state" rather than "national" — but their reach is regional (Puget Sound or all-WA), not single-city. Confirmed appropriate per the existing schema.
- Second Harvest Inland Northwest is the first DB entry with a multi-state `states` array (`["WA", "ID"]`) — confirmed appropriate; the route filter handles arrays.
- **NEW (run 4):** LifeWire reports "40 years of service" in 2026 (founded 1986 as Eastside Domestic Violence Program, rebranded LifeWire). When a description references program age in years, anchor it to founding year not "40 years" so it doesn't go stale.
- **NEW (run 4):** KidVantage was previously "Eastside Baby Corner" — older inbound links and aggregator listings still use the old name. The DB entry name includes "(formerly Eastside Baby Corner)" for searchability.
## CALIBRATION SUGGESTIONS FROM PAST RUNS

- Run 2 added 4 verified WA entries (skipped 1) — runtime well within budget.
- **Run 3 added 5 verified WA entries (skipped 0 — Emergency Food Network was the only candidate not verified, replaced live with Mobius Spokane). Cluster-by-metro approach (3 Tacoma + 2 Spokane) was efficient. Recommend STAY at 5 next run.**
- After 3 runs WA queue is at 14/30. At ~5 entries/run that's 3-4 more WA runs to complete the queue. Continue cluster-by-metro: run 4 should focus on Bellevue/Eastside (LifeWire, The Sophia Way, Renewal Food Bank, Eastside Catholic Outreach) before returning to Vancouver/Olympia.
- **Pre-filter recommendation continues:** run a Python `existing_keys` dedupe set on (name.lower, organization.lower) before researching. Implemented in runs 2 and 3 — keep this pattern.
- **Verification fallback:** when curl is blocked by Cloudflare or returns 404, try the internal `web_fetch` tool first before skipping. The internal tool successfully bypassed Cloudflare on PDZA in run 3.
- **Run 4 added 5 verified Eastside entries (skipped 0 from final batch; 3 deferred earlier in research — Bellevue Botanical Garden, Imagine Housing, Jubilee REACH — all due to undocumented age min). Cluster-by-metro Eastside approach worked: 4 of 5 are within ~10 miles of one another. Recommend STAY at 5 next run.**
- After 4 runs WA queue is at 19/30. ~2 more WA-focused runs to complete the queue. Suggested run-5 target: Vancouver WA (Share Vancouver, Innovative Services NW, Clark County Volunteer Connections) and Olympia (Senior Services for South Sound, Olympia Free Clinic, Capital Land Trust). Cluster on Vancouver first — closer to a single-metro cluster than mixed.
- **NEW pattern:** when a candidate is solid programmatically but lacks a published age min on its volunteer page, log it as DEFERRED in the lessons file rather than just skipping silently — a future run with an email-contact step can unlock these (Jubilee REACH especially — 2000+ vols is too valuable to leave out long-term).
## OPEN QUESTIONS / TODO FOR FUTURE RUNS

- For state-priority entries (WA target 30): cluster by metro for efficiency? Doing all Seattle entries before moving to Tacoma may compound source familiarity. **Run 3 confirmed cluster-by-metro is faster.**
- How to track "this program was verified active as of X date" so we know to re-verify after some time? The `_verifiedDate` field already serves this — consider a lightweight stale-checker that re-verifies entries older than 12 months.
- Web fetches return huge HTML payloads (>200KB common) and exceed the response-size limit; the workaround is reading from the saved file with jq + grep regex. Consider adding a small helper script in a future run.
- Bellevue / Eastside still has gaps: Eastside Catholic / LifeWire / The Sophia Way (women's housing) / Renewal Food Bank — all candidates for run 4.
- Tacoma now has solid coverage (PDZA, TRM, Greentrike). Vancouver WA and Olympia still untouched. Olympia candidates: Olympia Free Clinic, Senior Services for South Sound, Capital Land Trust. Vancouver candidates: Clark County Volunteer Connections, Share Vancouver, Innovative Services NW.
- Spokane has 2 entries now (Second Harvest, Mobius). Future Spokane candidates: YWCA Spokane, Catholic Charities Eastern WA, Spokane Riverkeeper, Vanessa Behan Crisis Nursery.
- **NEW (run 4):** Build a "deferred candidates" worklog for orgs that lack public age info but are otherwise high-fit: Jubilee REACH, Imagine Housing, possibly Eastside Pathways. Future run could batch-email 3-5 of these via the volunteer coordinator email and unlock 5+ entries in one pass.
- **NEW (run 4):** When fetching JS-rendered Squarespace/WordPress pages, the volunteer schedule details (timing, specific roles) often appear in JSON-LD or in the rendered DOM but not in the static HTML scrape. A future helper could check both `/volunteer` and `/sitemap.xml` to enumerate sub-pages (e.g. `/get-involved-volunteer-individual` for Jubilee REACH was only discoverable that way).
- **NEW (run 4):** All run-4 entries are "scope: state, states: [WA]" — the geographic scope is actually East King County / Puget Sound subregion. The DB schema doesn't have a "subregion" or "metro" field. Worth adding for future filter precision (e.g. show "Bellevue/Eastside" vs "Tacoma" tier without forcing user to scroll all WA results).
## RUN HISTORY

| Date | Run # | Added | Skipped | Focus | Notable |
|------|-------|-------|---------|-------|---------|
| 2026-04-25 | 1 | 5 | ? | WA (Seattle) | Initial WA cohort: FareStart, Pacific Science Center Discovery Corps, Seattle Humane, EarthCorps, Treehouse |
| 2026-04-26 | 2 | 4 | 1 | WA (Eastside + Seattle + state) | Hopelink, Seattle Aquarium YOA, KCLS TVP, WTA. Ballard Food Bank skipped — couldn't confirm age min. |
| 2026-04-26 | 3 | 5 | 0 | WA (Tacoma + Spokane) | Point Defiance Zoo Youth Volunteers, Tacoma Rescue Mission, Second Harvest Inland Northwest, Greentrike Children's Museum of Tacoma, Mobius Discovery Center Spokane. EFN (Tacoma) candidate dropped — `/get-involved/volunteer/` 404s; replaced with Mobius. |
| 2026-04-26 | 4 | 5 | 0 | WA (Bellevue/Eastside cluster) | Renewal Food Bank, The Sophia Way, KidVantage (Eastside Baby Corner), Eastside Friends of Seniors, LifeWire. Deferred (no published age min): Jubilee REACH, Imagine Housing, Bellevue Botanical Garden (no current teen slots). |
