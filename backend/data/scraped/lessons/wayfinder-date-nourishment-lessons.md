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


## Cumulative Learnings (added 2026-04-27, post 30+ batches)

11. **Multi-program providers can have aliased entries** — Pacific Science Center has TWO entries ("Camps for Curious Minds" + "Multiple Locations"); Destination Science has TWO Seattle entries. Always check for sibling entries before assuming a program is single-row. Update both.

12. **Promo codes belong in scheduleNotes** — sibling discounts, early-bird codes, scholarship app links are parent-actionable. Capture the actual code text, not "various discounts available."

13. **Cross-cutting patterns belong in `_aiContext: true` sections in `summer-camp-insights.json`**, not in individual program scheduleNotes. When you notice a pattern across 5+ programs (e.g., "all WA registration opens 2 weeks before competing-state programs"), add it as a calibration item. Sections marked `_aiContext: true` flow into `/plan`, `/ask`, and David's coach simultaneously with no code redeploy. Adding a new section is a single batch using `append-array` with key=`sections` on `summer-camp-insights.json`.

14. **The mailto: body limit is ~1900 chars** across major mail clients — for long content, copy-as-text is the better UX path than email export.

15. **`/plan` strict-JSON output is sensitive to long system prompts.** Solution: split into two parallel LLM calls — JSON plan + free-text calibration — combined client-side. See `_summerLLMCall` + `_strategyLLMCall` in routes/summer-camps.js + routes/programs.js.

16. **GitHub contents-API stale-read race (CRITICAL — learned 2026-04-27).** Two batch writes to the same file landing within ~30s — the second one silently REVERTS the first. Confirmed by reading commit `8054b0e` (batch 2): it both adds batch 2's entries AND removes batch 1's (commit `75610fe`, 6s earlier). Mechanism: `GET /contents/{path}?ref=<branch>` is eventually consistent — it can serve PRE-write content for several seconds after `PATCH /git/refs/heads/<branch>` returns 200. The second writer reconstructs the file WITHOUT the first writer's changes and commits that on top. **Universal fix for any GitHub Git Data API write loop:** read content at `?ref=<commitSha>` (immutable), never `?ref=<branch>`. Patched in `backend/routes/admin.js` `/grinder-write` (marker: `REVAMP V2: GRINDER-WRITE READ-AT-COMMIT-SHA`). Defense-in-depth: 60s inter-invocation gap in `submit-nourishment.js` via `.nourishment-gap.json` state file (marker: `REVAMP V2: NOURISHMENT-INTER-BATCH-GAP`). **Diagnostic technique:** when data appears lost after multiple rapid writes, read each suspect commit's diff via `GET /repos/.../commits/<sha>` — negative deltas (`-` lines) reveal what got reverted.

17. **Patch-induced deploy crash from a typoed import (learned 2026-04-27 night).** Patch15 added internships.js with `import { chatSLM, isSLMAvailable } from '../services/slm-client.js';` — but the actual file is `slm.js`. Programs.js (the model) imports correctly. Render rejected every deploy for ~3 hours with "Exited with status 1." Production stayed pinned to the pre-patch15 build, hiding the failure (site looked normal, just out of date). Defense: `validate-changes.js` + `validate-changes.bat` in the Wayfinder folder root parses every static `import ... from 'X'` and `require('X')` in the touched .js files; for relative paths, verifies each resolved path exists on disk. Every future apply-changes-NN.bat that touches code MUST call this before `git push`.

18. **K-8 database is more constrained than `956 total programs.json count` suggests.** The K-8 surface (filtered by `eligibility.grades` having any of `K, 1-8, Pre-K`) is much smaller than the total. Categories like outdoor (3 entries), service (1 entry), arts (10 entries), academic-enrichment (11 entries) are nearly fully nourished after batches 1-30. STEM is the largest K-8 category. The remainder of the 956 are HS-only entries (grades 9-12) which fall outside the K-8 module's `/browse` endpoint. Lesson: don't conflate "total programs.json size" with "K-8 nourishment opportunity." Audit progress by category (use `progress-audit.bat`) before assuming there's grind left to do.

19. **`_aiContext: true` sections compound — minimal effort, broad reach.** Adding a single new section to `summer-camp-insights.json` flows into THREE AI surfaces simultaneously: David's coach/chat (when toolContext indicates K-8/Summer/Volunteer/K-12), `/api/summer-camps/plan` (Build My Summer planner), `/api/summer-camps/ask` (K-8 free-text Q&A). No code redeploy needed — the data file change auto-deploys, and `loadJsonFresh` 5-min TTL picks up the new section in production within minutes. **Pattern for highest-leverage section additions:** (a) cross-cutting parent-actionable intelligence that doesn't fit on one program (timeline, equity, transition), (b) WA/regional spotlight that compounds with existing wa-spotlight-2026, (c) demographic-targeted aid landscape that helps families navigate the actual pool of available money. Sections shipped in batches 31-33: K-8→HS bridge intelligence, WA registration calendar 2026, Equity-focused funding landscape.

20. **Lessons file edits via local Edit tool DON'T PERSIST** — the `apply-changes-NN.bat` does `git reset --hard origin/main` first thing, wiping any uncommitted local edits to wayfinder/. To ship lessons-file updates, write them as a batch JSON using `append-text` op on the `.md` file path. That goes through /grinder-write which commits + pushes properly.
