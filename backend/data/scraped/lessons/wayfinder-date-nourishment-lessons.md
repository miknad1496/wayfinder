# Date-Nourishment Backfill — Running Notes

Started 2026-04-26 by Cowork session (manual, not the scheduled grinder). Goal: backfill scheduling fields on existing K-8 program entries in programs.json without rewriting the file (uses /api/admin/grinder-write update-array-items op, matched by name+provider).

## Tier definitions
- **verified**: actual sessions[] populated, OR year-round program with continuous enrollment (sessionPattern="year-round-classes")
- **window**: confirmed 2026 summer window from official site
- **inferred**: estimated from 2025 pattern, similar program, or partial info
- **unknown**: no useful data — frontend shows "Visit program site"

## Workflow per program
1. Confirm DB match: `GET /api/summer-camps/browse?state=...&search=<keyword>` (case-insensitive name+provider lookup)
2. WebSearch `"<program name>" 2026 dates schedule registration`
3. If 2026 official window confirmed → `window`
4. If actual session list surfaced → `verified` (capture sessions[])
5. If only 2025 pattern / partial info → `inferred` + `_scheduleSource: "inferred-2025-pattern"` or `"inferred-similar-program"`
6. If year-round program (subscription, on-demand) → `verified` with sessionPattern=year-round-classes, summerWindow=null. **Skip WebSearch** — no date concept.
7. If nothing useful → `unknown`
8. Don't burn a second WebSearch trying to nail down sessions[] when first one only gave a window.

## Hard-earned lessons
1. **Skip raw HTML** — homepage HTML is 200KB+, collapses to one line for grep. **WebSearch is the right tool** — concise summarized snippets.
2. **WebSearch mixes years** — can pull dates from 2022/2023/2025 without flagging. Cross-check month-name + day-of-week against 2026 calendar (Mondays in summer 2026: Jun 22, Jul 6, Jul 13, Jul 20, Jul 27, Aug 3, Aug 10, Aug 17, Aug 24).
3. **Registration windows easier than session dates.** Most camps publish member-early-access dates before posting full session calendars.
4. **PDF guides are gold standard but unparseable via web_fetch.** Note in `_scheduleSource` for revisit.
5. **Holiday weeks are 4-day** — Juneteenth (Jun 19, Fri) and Independence Day (Jul 4, Sat). Camps often adjust week of June 29 - July 3 to Mon-Thu.
6. **Host-school-dependent programs** (Camp Invention, NSBE SEEK, JA BizTown) vary by site. Wide summerWindow + scheduleNotes "varies by host".
7. **Verify the DB match BEFORE researching** — `?state=WA&search=<keyword>` is fast.
8. **WebSearch DOES surface verified session lists for well-indexed sites** (Woodland Park Zoo had all 10 sessions; Music Works NW had 3 specific tracks). Don't pre-judge. Verified > window when available.
9. **Capture parent-actionable detail in scheduleNotes**: half-day vs full-day, before/after care timing + cost, member discount %, scholarship availability + state restrictions, waitlist signal, sliding-scale pricing, financial aid coverage %.
10. **Year-round programs are quick wins** — Khan, Beast Academy, Synthesis, Code.org don't need WebSearch; tier=verified, sessionPattern=year-round-classes, summerWindow=null.
11. **Existing description fields often contain dated info** — check for explicit dates like "June 15-Aug 21" or "June 22-26" before searching. Music Works NW, Camp Tech Revolution, Northwestern CTD all had session info already in description.
12. **Multi-program providers can have aliased entries** — Pacific Science Center has both "Camps for Curious Minds" and "Camps for Curious Minds (Multiple Locations)" entries pointing to same brand. Update both with same data; differentiate in scheduleNotes if location-specific data exists.
13. **Promo codes belong in scheduleNotes** — sibling discounts, early-bird codes are parent-actionable and worth preserving (Camp Invention CIFUN25/CIFUN20, Camp Galileo Early Bird).

## Open questions
- Multi-location chains (PSC has 6+ locations) — per-location entries with location-specific summerWindow? **Deferred. Use program-level summerWindow.**
- Existing `deadline` field normalization ("Rolling until full" etc.)? **Don't touch yet. New schema fields are additive.**
- One verified session date but more known to exist (Burke Dino Trackers): tier `window` with sessions[] containing the one confirmed session is honest. Don't claim `verified` if list is incomplete.

## Batch log (most recent at top)

### 2026-04-26 — batches 4-7 (40 entries) — bulk nourishment
**Batch 4 (10 entries):** Code.org, Google CS First, NASA STEM, Nat Geo Kids, Generation Genius, Mystery Science (all verified year-round) + Camp Tech Revolution Seattle (window Jun 15-Aug 21), Northwestern CTD (window Jun 29-Aug 7), PacSci Bellevue (inferred, mirror of main entry), Camp CrunchLabs (window 12-week summer)
**Batch 5 (10 entries):** Destination Science Seattle (×2), Launch Learning, Lavner UW, UW K-12 Engineering Outreach, SPS Expanded Learning, NYLF Pathways, Washington STEM Network, UW Engineering Discovery Days, AoPS+Beast combined
**Batch 6 (10 entries):** NSBE SEEK, Math Beasts Camp, Northwestern CTD Solstice, CodeWizardsHQ, Black Girls CODE 2026 (verified ✨ — Jul 7-9 + Aug 4-6 virtual sessions), Apple Camp at store, Audubon for Kids, Earthwatch Family, AMNH, Exploratorium
**Batch 7 (10 entries):** Music Works Northwest (verified ✨ 3 tracks), Music Center NW (verified ✨ Jul 20-24), Studio Coyote, Seattle Children's Theatre, MacTheatre, Interlochen Arts Camp + Junior, Carnegie Hall Link Up (verified year-round), Camp Sealth, Camp Orkila (window, reg Feb 4)

### 2026-04-26 — batch 3 (5 entries, nationwide brands)
- iD Tech Camps at UW Seattle → **inferred**
- iD Tech Online Camps → **window** (rolling Jun-Aug)
- Beast Academy Online (AoPS) → **verified** year-round
- Synthesis Tutor (AI Math) → **verified** year-round
- Khan Academy + Khan Academy Kids → **verified** year-round

### 2026-04-26 — batch 2 (5 entries, WA Seattle metro anchors + Outschool)
- Burke Museum Summer Camps → **window** (one Dino Trackers session Jul 13 confirmed)
- Woodland Park Zoo Summer Day Camps → **verified** ✨ all 10 weekly sessions captured
- Seattle Aquarium Marine Summer Camp → **window** (Jun 22 – Aug 28)
- Point Defiance Zoo & Aquarium → **inferred** (reg Mar 10/12)
- Outschool Online Summer Camps → **window** (Jun 15 – Aug 22)

### 2026-04-26 — batch 1 (5 entries, WA + nationwide STEM anchors)
- Pacific Science Center Camps for Curious Minds → **inferred**
- Museum of Flight ACE → **window** (Jun 22 – Aug 28 confirmed, reg Feb 20/21)
- DigiPen Open World Summer Workshops → **inferred**
- Camp Galileo Bellevue → **window** (Jun 15+)
- Camp Invention 2026 — Spark → **window** (host-school-varying)

## Backlog priority order (continue here)
1. **WA remaining** (KidsQuest, more sleepaway, Bellevue/Redmond/Kirkland enrichment programs, Pre-K specialty)
2. **CA major institutions** (Exploratorium done; Stanford youth programs, COSMOS, AoPS Academy SF, etc.)
3. **NY** (AMNH done; Carnegie summer, NY Phil, Lincoln Center youth, etc.)
4. **TX, IL, MA, MI, MD** anchor cities
5. **Nationwide chains remaining** (Y-USA umbrella, FIRST LEGO + VEX year-round, Destination Imagination, JA BizTown, KE Camps, Kids in the Game)
6. **Non-STEM categories** (leadership, service, music academies, sports academies)

## Tier distribution after 55 entries
- verified: 11 (incl. all year-round programs)
- window: 27
- inferred: 17
- unknown: 901 (untouched)

**Total nourished:** 55 / 956
**Last touched:** 2026-04-26
