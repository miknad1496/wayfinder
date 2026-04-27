# Date-Nourishment Backfill — Running Notes

Started 2026-04-26 by Cowork session (manual, not the scheduled grinder). Goal: backfill scheduling fields on existing K-8 program entries in programs.json without rewriting the file (uses /api/admin/grinder-write update-array-items op, matched by name+provider).

## Tier definitions
- **verified**: actual sessions[] populated from official site
- **window**: confirmed 2026 summer window from official site
- **inferred**: estimated from 2025 pattern, similar program, or partial info
- **unknown**: no useful data — frontend shows "Visit program site"

## Workflow per program
1. WebSearch `"<program name>" 2026 dates schedule registration`
2. If 2026 official window confirmed → `window`
3. If only 2025 pattern / partial info → `inferred` + `_scheduleSource: "inferred-2025-pattern"`
4. If nothing useful → `unknown`
5. Skip per-session granularity in first pass — `summerWindow` + `sessionPattern` only

## Hard-earned lessons
1. **Skip raw HTML** — homepage HTML is 200KB+, collapses to one line for grep, can't be parsed. **WebSearch is the right tool** — it returns concise summarized snippets.
2. **WebSearch mixes years** — it can pull dates from 2022/2023/2025 without flagging. Cross-check month-name + day-of-week against the current year's calendar before treating dates as 2026 (e.g., "June 22" being a Monday is true in 2026 — that gives me confidence).
3. **Registration windows are easier to find than exact session dates.** Most camps publish "members get early access on X" before posting full session calendars. Reg dates → high confidence; sessions → often inferred.
4. **PDF guides are the gold standard but unparseable via web_fetch.** Note them in `_scheduleSource` for future revisit if needed.
5. **Holiday weeks are 4-day** — Juneteenth (Jun 19) and Independence Day (Jul 4) make those weeks short. Note in scheduleNotes when relevant.
6. **Host-school-dependent programs** (Camp Invention, NSBE SEEK, JA BizTown) vary by site. Use a wide summerWindow + scheduleNotes that says "varies by host".
7. **One WebSearch per program is enough.** Don't burn a second one trying to nail down sessions[] in the first pass — that's a waste; window-tier is already a big upgrade from "unknown".

## Open questions
- For programs with multiple distinct locations (PSC, Camp Galileo) — should we eventually have per-location entries with location-specific summerWindow? **Deferred. Use program-level summerWindow for now.**
- Year-round programs (Khan, Beast Academy, Synthesis) — set summerWindow? **No. sessionPattern="year-round-classes", summerWindow=null, tier="verified" if continuously enrolling.**
- Should the deadline field be normalized? Many entries say "Rolling until full" or "Rolling — early-bird ends Feb 28" instead of a real date. **Don't touch existing deadline strings yet. New schema fields are additive.**

## Batch log

### 2026-04-26 — batch 1 (5 entries, WA + nationwide STEM anchors)
- Pacific Science Center Camps for Curious Minds → **inferred** (reg dates confirmed 2026, summer window est. from 2025)
- Museum of Flight ACE → **window** (Jun 22 – Aug 28 2026 confirmed, reg Feb 20/21)
- DigiPen Open World Summer Workshops → **inferred** (no 2026 hard dates surfaced via WebSearch)
- Camp Galileo Bellevue → **window** (Jun 15+ start, currently enrolling, 4-day Juneteenth/Jul 4 weeks confirmed)
- Camp Invention 2026 — Spark → **window** (host-school-varying; nationwide window Jun 1 – mid Aug)

## Backlog priority order
1. WA Seattle metro anchors (Burke Museum, Woodland Park Zoo, Seattle Aquarium, Children's Theatre, Camp Sealth, Camp Orkila)
2. WA Eastside (KidsQuest, Music Center NW, more Bellevue/Redmond/Kirkland)
3. Major nationwide brands (iD Tech, Outschool, AoPS, Synthesis, Beast Academy, Camp CrunchLabs, Khan)
4. Other major metros (Bay Area, NYC, LA, Boston, Chicago, DC, Austin)
5. Year-round programs across the board

**Total nourished:** 5 / 956
**Last touched:** 2026-04-26
