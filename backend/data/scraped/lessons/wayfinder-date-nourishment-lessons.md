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
6. If year-round program (subscription, on-demand) → `verified` with sessionPattern=year-round-classes, summerWindow=null. **Skip WebSearch** — these don't have date concepts.
7. If nothing useful → `unknown`
8. Don't burn a second WebSearch trying to nail down sessions[] when the first one only gave a window — window-tier is already a big upgrade.

## Hard-earned lessons
1. **Skip raw HTML** — homepage HTML is 200KB+, collapses to one line for grep, can't be parsed. **WebSearch is the right tool** — it returns concise summarized snippets.
2. **WebSearch mixes years** — it can pull dates from 2022/2023/2025 without flagging. Cross-check month-name + day-of-week against 2026 calendar (Mondays in summer 2026: Jun 22, Jul 6, Jul 13, Jul 20, Jul 27, Aug 3, Aug 10, Aug 17, Aug 24).
3. **Registration windows easier than session dates.** Most camps publish "members get early access on X" before posting full session calendars.
4. **PDF guides are the gold standard but unparseable via web_fetch.** Note in `_scheduleSource` for future revisit if needed.
5. **Holiday weeks are 4-day** — Juneteenth (Jun 19, Fri) and Independence Day (Jul 4, Sat). Camps often adjust the week of June 29 - July 3 to be 4-day (Mon-Thu).
6. **Host-school-dependent programs** (Camp Invention, NSBE SEEK, JA BizTown) vary by site. Use a wide summerWindow + scheduleNotes "varies by host".
7. **Verify the DB match BEFORE researching** — `?state=WA&search=<keyword>` is fast and prevents wasted research on programs that use different naming.
8. **WebSearch DOES surface verified session lists for well-indexed sites** (Woodland Park Zoo had all 10 sessions). Don't pre-judge. Verified > window when easy to capture.
9. **Capture parent-actionable detail in scheduleNotes**: half-day vs full-day, before/after care timing + cost, member discount %, scholarship availability + state restrictions, waitlist signal ("many sessions sold out"). These are the differentiators.
10. **Year-round programs are quick wins** — Khan, Beast Academy, Synthesis don't need WebSearch; tier=verified, sessionPattern=year-round-classes, summerWindow=null. Pull pricing/access details from existing description into scheduleNotes.

## Open questions
- Multi-location chains (PSC has 6+ locations, Camp Galileo has many) — should we eventually have per-location entries with location-specific summerWindow? **Deferred. Use program-level summerWindow.**
- Should the existing `deadline` field be normalized? Many entries say "Rolling until full" or "Rolling — early-bird ends Feb 28" instead of a real date. **Don't touch existing `deadline` strings yet. New schema fields are additive.**
- For programs with one verified session date but more sessions known to exist (Burke Dino Trackers): tier `window` with sessions[] containing the one confirmed session is honest. Don't claim `verified` if the list is incomplete.

## Batch log (most recent at top)

### 2026-04-26 — batch 3 (5 nationwide brands)
- iD Tech Camps at UW Seattle → **inferred** (no 2026 weeks surfaced; typical UW summer window)
- iD Tech Online Camps → **window** (rolling Jun-Aug)
- Beast Academy Online (AoPS) → **verified** year-round
- Synthesis Tutor (AI Math) → **verified** year-round
- Khan Academy + Khan Academy Kids → **verified** year-round

### 2026-04-26 — batch 2 (5 entries, WA Seattle metro anchors + Outschool)
- Burke Museum Summer Camps → **window** (one Dino Trackers session Jul 13 confirmed)
- Woodland Park Zoo Summer Day Camps → **verified** ✨ all 10 weekly sessions captured (Jun 22 – Aug 28)
- Seattle Aquarium Marine Summer Camp → **window** (Jun 22 – Aug 28 confirmed)
- Point Defiance Zoo & Aquarium → **inferred** (reg Mar 10/12)
- Outschool Online Summer Camps → **window** (Jun 15 – Aug 22)

### 2026-04-26 — batch 1 (5 entries, WA + nationwide STEM anchors)
- Pacific Science Center Camps for Curious Minds → **inferred**
- Museum of Flight ACE → **window** (Jun 22 – Aug 28 2026 confirmed, reg Feb 20/21)
- DigiPen Open World Summer Workshops → **inferred**
- Camp Galileo Bellevue → **window**
- Camp Invention 2026 — Spark → **window**

## Backlog priority order
1. **WA Seattle major institutions remaining** (Children's Theatre, KidsQuest, Music Center NW, SPS Expanded Learning, Launch Learning, Destination Science)
2. **WA sleepaway camps** (Camp Sealth, Camp Orkila, YMCA residential)
3. **WA Eastside** (PacSci Bellevue, more Bellevue/Redmond/Kirkland)
4. **Major nationwide brands remaining** (AoPS combined entry, Camp CrunchLabs, NSBE SEEK, Generation Genius, Mystery Science, Code.org, Google CS First, Maker Camp, Black Girls CODE, Apple Camp, NASA STEM, AMNH, Field Museum, Exploratorium)
5. **Other major metros** (Bay Area, NYC, LA, Boston, Chicago, DC, Austin)
6. **Year-round programs across the board**

**Total nourished:** 15 / 956
**Last touched:** 2026-04-26
