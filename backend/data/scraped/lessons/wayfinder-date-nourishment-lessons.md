# Date-Nourishment Backfill — Running Notes

Started 2026-04-26 by Cowork session (manual, not the scheduled grinder). Goal: backfill scheduling fields on existing K-8 program entries in programs.json without rewriting the file (uses /api/admin/grinder-write update-array-items op, matched by name+provider).

## Tier definitions
- **verified**: actual sessions[] populated from official site
- **window**: confirmed 2026 summer window from official site
- **inferred**: estimated from 2025 pattern, similar program, or partial info
- **unknown**: no useful data — frontend shows "Visit program site"

## Workflow per program
1. Confirm DB match: `GET /api/summer-camps/browse?state=...&search=<keyword>` (case-insensitive name+provider lookup)
2. WebSearch `"<program name>" 2026 dates schedule registration`
3. If 2026 official window confirmed → `window`
4. If actual session list surfaced → `verified` (capture sessions[])
5. If only 2025 pattern / partial info → `inferred` + `_scheduleSource: "inferred-2025-pattern"` or `"inferred-similar-program"`
6. If nothing useful → `unknown`
7. Don't burn a second WebSearch trying to nail down sessions[] when the first one only gave a window — window-tier is already a big upgrade.

## Hard-earned lessons
1. **Skip raw HTML** — homepage HTML is 200KB+, collapses to one line for grep, can't be parsed. **WebSearch is the right tool** — it returns concise summarized snippets.
2. **WebSearch mixes years** — it can pull dates from 2022/2023/2025 without flagging. Cross-check month-name + day-of-week against 2026 calendar (e.g., "June 22" being a Monday is true in 2026). For 2026: Jun 22, Jul 6, Jul 13, Jul 20, Jul 27, Aug 3, Aug 10, Aug 17, Aug 24 are Mondays.
3. **Registration windows easier than session dates.** Most camps publish "members get early access on X" before posting full session calendars.
4. **PDF guides are the gold standard but unparseable via web_fetch.** Note in `_scheduleSource` for future revisit if needed.
5. **Holiday weeks are 4-day** — Juneteenth (Jun 19, Fri) and Independence Day (Jul 4, Sat). Camps often adjust the week of June 29 - July 3 to be 4-day (Mon-Thu) so counselors get a long weekend.
6. **Host-school-dependent programs** (Camp Invention, NSBE SEEK, JA BizTown) vary by site. Use a wide summerWindow + scheduleNotes "varies by host".
7. **Verify the DB match BEFORE researching** — `?state=WA&search=<keyword>` is fast and prevents wasted research on programs that don't exist or use different naming. Adds ~10 sec/program but saves the wasted update-array-items call when notFound.
8. **WebSearch DOES surface verified session lists for well-indexed sites** (Woodland Park Zoo had all 10 sessions). Don't pre-judge a program as "window-only" — read what the search returns first. Verified > window when easy to capture.
9. **Capture parent-actionable detail in scheduleNotes**: half-day vs full-day, before/after care timing + cost, member discount %, scholarship availability + state restrictions, waitlist signal ("many sessions sold out"). These are the differentiators parents actually use.

## Open questions
- Multi-location chains (PSC has 6+ locations, Camp Galileo has many) — should we eventually have per-location entries with location-specific summerWindow? **Deferred. Use program-level summerWindow.**
- Year-round programs (Khan, Beast Academy, Synthesis) — set summerWindow? **No. sessionPattern="year-round-classes", summerWindow=null, tier="verified" if continuously enrolling.**
- Should the existing `deadline` field be normalized? Many entries say "Rolling until full" or "Rolling — early-bird ends Feb 28" instead of a real date. **Don't touch existing `deadline` strings yet. New schema fields are additive.**
- For programs with one verified session date but more sessions known to exist (Burke Dino Trackers): tier `window` with sessions[] containing the one confirmed session is honest. Don't claim `verified` if the list is incomplete.

## Batch log (most recent at top)

### 2026-04-26 — batch 2 (5 entries, WA Seattle metro anchors + Outschool)
- Burke Museum Summer Camps → **window** (one Dino Trackers session Jul 13 confirmed; rest of program has more sessions per site)
- Woodland Park Zoo Summer Day Camps → **verified** ✨ all 10 weekly sessions captured (Jun 22 – Aug 28)
- Seattle Aquarium Marine Summer Camp → **window** (Jun 22 – Aug 28 confirmed; per-session not in search)
- Point Defiance Zoo & Aquarium → **inferred** (reg dates Mar 10/12 confirmed, summer window estimated)
- Outschool Online Summer Camps → **window** (most camps Jun 15 – Aug 22)

### 2026-04-26 — batch 1 (5 entries, WA + nationwide STEM anchors)
- Pacific Science Center Camps for Curious Minds → **inferred** (reg dates confirmed 2026, summer window est. from 2025)
- Museum of Flight ACE → **window** (Jun 22 – Aug 28 2026 confirmed, reg Feb 20/21)
- DigiPen Open World Summer Workshops → **inferred** (no 2026 hard dates surfaced)
- Camp Galileo Bellevue → **window** (Jun 15+ start, currently enrolling, 4-day Juneteenth/Jul 4 weeks confirmed)
- Camp Invention 2026 — Spark → **window** (host-school-varying; nationwide window Jun 1 – mid Aug)

## Backlog priority order
1. **WA Seattle major institutions remaining** (Children's Theatre, KidsQuest, Music Center NW, Seattle Public Schools Expanded Learning)
2. **WA sleepaway camps** (Camp Sealth, Camp Orkila, YMCA residential)
3. **WA Eastside / Bellevue / Redmond / Kirkland** (PacSci Bellevue, more)
4. **Major nationwide brands** (iD Tech UW + online, AoPS, Synthesis, Beast Academy, Camp CrunchLabs, NSBE SEEK, Khan)
5. **National museum chains** (AMNH, Field Museum, Exploratorium, etc.)
6. **Other major metros** (Bay Area, NYC, LA, Boston, Chicago, DC, Austin)
7. **Year-round programs** (set as `verified` with sessionPattern=year-round-classes, summerWindow=null)

**Total nourished:** 10 / 956
**Last touched:** 2026-04-26
