# Date-Nourishment Backfill — Running Notes

Started 2026-04-26 by Cowork session. Goal: backfill scheduling fields on K-8 program entries in programs.json AND distill what we learn into a permanent, progressive knowledge layer that flows into Wayfinder's AI surfaces (David concierge, Build My Summer planner, K-8 Ask).

## Current state (2026-04-27)
- **103 program entries** nourished with schedule fields (out of ~956 total)
- **3 `_aiContext: true` calibration sections** wired into /plan, /ask, and David's coach/chat
- **/plan two-call architecture** (strict-JSON plan + free-text 2026 calibration insight in parallel) — verified working with concrete 2026 dates appearing in family-specific guidance
- **Print / Email / Copy export** on /plan output
- **(?) tooltips** on Internships / Programs / Scholarships filters (patch11)

## Knowledge integration architecture (the permanent + progressive part)

Learnings flow back into the live system through:

1. **Per-program scheduling fields** (`scheduleConfidence`, `summerWindow`, `sessions[]`, `registrationOpens`, `scheduleNotes`) — visible in the K-8 Browse Camps card UI; consumed by the calendar prefill flow.
2. **`summer-camp-insights.json` sections marked `_aiContext: true`** — flow into AI system prompts at request time on `/api/summer-camps/plan`, `/api/summer-camps/ask`, and `/api/coach/chat` (David, when toolContext indicates K-8/Summer/Volunteer/K-12).
3. **Per-program parent-actionable insights** in the existing `field-notes` section — visible in the Insights tab.
4. **This lessons file** — researcher-facing playbook.

## Tier definitions
- **verified**: actual sessions[] populated, OR year-round program with continuous enrollment (sessionPattern=year-round-classes)
- **window**: confirmed 2026 summer window from official site
- **inferred**: estimated from 2025 pattern, similar program, or partial info
- **unknown**: no useful data

## Workflow per program
1. Confirm DB match: `GET /api/summer-camps/browse?state=...&search=<keyword>`
2. Read EXISTING description first — many programs have explicit dates/registration windows already there
3. WebSearch only when description is sparse
4. Map findings to a tier; capture parent-actionable detail in scheduleNotes
5. **If a pattern is cross-cutting → add to a `_aiContext: true` section, not just the individual program**

## Hard-earned lessons
1. Skip raw HTML — homepage HTML is 200KB+, ungreppable. WebSearch is the right tool.
2. WebSearch mixes years — cross-check Mondays in summer 2026: Jun 22, Jul 6, Jul 13, Jul 20, Jul 27, Aug 3, Aug 10, Aug 17, Aug 24.
3. Reg windows easier than session dates. Member-early-access dates publish before full session calendars.
4. Holiday weeks are 4-day — Juneteenth (Jun 19, Fri 2026), Independence Day (Jul 4, Sat 2026).
5. Host-school-dependent programs vary by site. Wide summerWindow + scheduleNotes "varies by host."
6. Verify the DB match BEFORE researching.
7. WebSearch DOES surface verified session lists for well-indexed sites (Woodland Park Zoo, The Tech Interactive, Music Works NW).
8. Capture parent-actionable detail in scheduleNotes: half/full-day, before/after care, member discount, scholarship state restrictions, waitlist signal, promo codes.
9. Year-round programs are quick wins — no WebSearch needed.
10. Existing description fields often have date data — read first.
11. Multi-program providers can have aliased entries (PSC has both "..." and "... (Multiple Locations)"). Update both.
12. Promo codes belong in scheduleNotes — sibling discounts, early-bird codes are parent-actionable.
13. Cross-cutting patterns belong in `_aiContext: true` sections.
14. The mailto: body limit is ~1900 chars across major mail clients — for long content, copy-as-text is the better UX.
15. /plan strict-JSON output is sensitive to long system prompts. Solution: split into two parallel LLM calls — JSON plan + free-text calibration — combined client-side.

## Open questions
- Multi-location chains — per-location entries with location-specific summerWindow? Deferred. Use program-level for now.
- Existing `deadline` field normalization? Don't touch yet. New schema fields are additive.
- Should existing insights sections (registration-windows, scholarship-cheats) be marked `_aiContext: true` to flow into AI prompts? Future batch — start with new dedicated sections to avoid context overflow.

## Batch log (most recent at top)

### 2026-04-27 — batches 11-14 (38 entries) — WA + nationwide year-round + summer-rich-data
**Batch 11 (6 WA):** IslandWood, KidsQuest Children's Museum, Lakeside LEEP, Whatcom Family YMCA, KiDiMu, City of Vancouver Parks (reg Apr 15/16)
**Batch 12 (12 verified year-round):** NPS Junior Ranger, Outschool small-group, Smithsonian Learning Lab, Boys & Girls Clubs, YMCA Youth Programs umbrella, PJ Library, PBS Kids, Junior Master Gardener, National History Day, Best Buddies, Sierra Club ICO, NWF Eco-Schools
**Batch 13 (10):** NPS Every Kid Outdoors, NOAA Planet Stewards, Outdoor Afro, Special Olympics Unified, Friendship Circle, USA Junior Olympic, Camp Wonderopolis, BrainPOP, Camp Korey (WA chronic-illness, free), Brain Chase (Jun 15-Jul 17 verified window)
**Batch 14 (10):** 4-H Cooperative Extension, CISV International (Oct-Dec apply), Concordia Language Villages, Foundation for Jewish Camp OHC grant, Plum Village retreats, FGC Quaker Family Camp, Easter Seals Camps, Family Equality Family Week (Provincetown early Aug), Camp Brave Trails (LGBTQ+), Scholastic Summer Reading

### 2026-04-26 — batches 4-9 (45 entries)
Covered: WA STEM anchors (PSC, MoF, DigiPen, Galileo, Camp Invention, Burke ✨, Woodland Park Zoo ✨, Aquarium, Point Defiance, Outschool, iD Tech, Beast Academy, Synthesis, Khan, Code.org, Google CS First, NASA, NatGeo, GenGenius, Mystery Science, Camp Tech Revolution, Northwestern CTD, PacSci Bellevue, CrunchLabs, Destination Science×2, Launch Learning, Lavner UW, UW Eng K-12, SPS Expanded, NYLF, WA STEM, UW Engineering Discovery Days, AoPS+Beast, NSBE SEEK, Math Beasts, Northwestern CTD Solstice, CodeWizardsHQ, Black Girls CODE ✨, Apple Camp, Audubon, Earthwatch, AMNH, Exploratorium, Music Works NW ✨, Music Center NW ✨, Studio Coyote, SCT Drama, MacTheatre, Interlochen×2, Carnegie Link Up, Camp Sealth, Camp Orkila), CA anchors (Lawrence Hall, Tech Interactive ✨ verified sessions, CA Science Center, Birch Aquarium, LA's BEST, CYC SF, Club SciKidz, Maker Camp, Camp Invention national, JA BizTown).

### 2026-04-26 — batch 10 (knowledge-integration sections)
3 new `_aiContext: true` sections added: regional-summer-windows-2026, registration-timing-anchors-2026, pricing-tiers-k8-2026.

## Backlog priority order
1. **WA remaining gaps**: more municipal parks dept day camps, sports academies, faith-based summer programs (Catholic Heart Workcamp, etc.)
2. **TX, IL, MA, MI, MD, DC anchor cities**: Field Museum (already done), more major-metro museum/zoo/specialty
3. **Nationwide chains remaining**: KE Camps, Kids in the Game, more regional Y residential camps (Camp Cheerio, etc.)
4. **Non-STEM categories**: leadership, service academy, sports academies, faith
5. **WWOOF Family Stays, EF Language Travel, Native Like Water, Autism Society** — already in DB, untouched
6. **Mark existing insights sections as `_aiContext: true`** — registration-windows, scholarship-cheats are excellent calibration

**Total nourished:** 103 / 956
**Last touched:** 2026-04-27
