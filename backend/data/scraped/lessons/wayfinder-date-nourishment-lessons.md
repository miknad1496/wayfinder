# Date-Nourishment Backfill — Running Notes

Started 2026-04-26. Goal: backfill scheduling fields on K-8 program entries in programs.json AND distill what we learn into a permanent, progressive knowledge layer that flows into Wayfinder's AI surfaces (David concierge, Build My Summer planner, K-8 Ask).

## Knowledge integration architecture (the permanent + progressive part)

Learnings from this work flow back into the live system through:

1. **Per-program scheduling fields** (`scheduleConfidence`, `summerWindow`, `sessions[]`, `registrationOpens`, `scheduleNotes`) — visible in the K-8 Browse Camps card UI and consumed by the calendar prefill flow.

2. **`summer-camp-insights.json` sections marked `_aiContext: true`** — these flow into AI system prompts at request time on:
   - `/api/summer-camps/plan` (Build My Summer)
   - `/api/summer-camps/ask` (K-8 free-form Q&A)
   - `/api/coach/chat` (David concierge — when toolContext indicates Summer Camps / K-8 / Volunteer / K-12)
   
   To add new permanent calibration without a code deploy: add a new section to the insights file with `_aiContext: true` and the items will appear in all three AI surfaces on next request. Use this for cross-cutting patterns (regional windows, registration timing, pricing tiers, holiday-week adjustments) — NOT for individual program detail (which goes in per-program scheduling fields or `field-notes`).

3. **Per-program parent-actionable insights** in the existing `field-notes` section of `summer-camp-insights.json` — visible in the Insights tab of the K-8 modal. Use for org-specific gotchas ("PSC scholarship form is 1 page", "Steve & Kate's auto-refunds unused passes").

4. **This lessons file** — researcher-facing playbook. Every batch refreshes its own batch log and adds any new takeaways to the "Hard-earned lessons" section. Future Cowork sessions / scheduled grinder runs read this first to avoid relearning.

## Tier definitions
- **verified**: actual sessions[] populated, OR year-round program with continuous enrollment (sessionPattern="year-round-classes")
- **window**: confirmed 2026 summer window from official site
- **inferred**: estimated from 2025 pattern, similar program, or partial info
- **unknown**: no useful data — frontend shows "Visit program site"

## Workflow per program
1. Confirm DB match: `GET /api/summer-camps/browse?state=...&search=<keyword>`
2. WebSearch `"<program name>" 2026 dates schedule registration`
3. Map findings to a tier:
   - 2026 official window confirmed → `window`
   - Actual session list surfaced → `verified` (capture sessions[])
   - Only 2025 pattern / partial → `inferred` + `_scheduleSource: "inferred-2025-pattern"`
   - Year-round subscription / on-demand → `verified` with sessionPattern=year-round-classes, summerWindow=null. Skip WebSearch.
   - Nothing useful → `unknown`
4. Capture parent-actionable detail in `scheduleNotes` (member discount %, scholarship window, before/after care fee, sliding scale, promo codes).
5. **If a pattern is cross-cutting (applies across multiple programs/regions/categories) — add it to a `_aiContext: true` section of the insights file, not just to the individual program.** This is how learnings become permanent.

## Hard-earned lessons
1. **Skip raw HTML** — homepage HTML is 200KB+, ungreppable. WebSearch returns concise summaries.
2. **WebSearch mixes years** — cross-check Mondays in summer 2026: Jun 22, Jul 6, Jul 13, Jul 20, Jul 27, Aug 3, Aug 10, Aug 17, Aug 24.
3. **Reg windows easier than session dates.** Member-early-access dates publish before full session calendars.
4. **PDF guides unparseable via web_fetch** — note in `_scheduleSource` for revisit.
5. **Holiday weeks are 4-day** — Juneteenth (Jun 19, Fri) and Independence Day (Jul 4, Sat). Camps adjust week of Jun 29 - Jul 3 to 4-day.
6. **Host-school-dependent programs** vary by site — wide summerWindow + scheduleNotes "varies by host".
7. **Verify the DB match BEFORE researching** — `?state=...&search=<keyword>` is fast.
8. **WebSearch surfaces verified session lists for well-indexed sites** (Woodland Park Zoo had all 10 sessions; Music Works NW had 3 specific tracks; The Tech Interactive had Jun 15 - Aug 7 8-week schedule; California Science Center same; Birch Aquarium same).
9. **Capture parent-actionable detail in scheduleNotes**: half/full-day, before/after care, member discount, scholarship state restrictions, waitlist signal, promo codes.
10. **Year-round programs are quick wins** — no WebSearch needed.
11. **Existing description fields often have date data** — read first before searching.
12. **Multi-program providers can have aliased entries** (PSC has both "Camps for Curious Minds" and "Camps for Curious Minds (Multiple Locations)"). Update both.
13. **Promo codes belong in scheduleNotes** — sibling discounts, early-bird codes are parent-actionable.
14. **Cross-cutting patterns belong in `_aiContext: true` sections of the insights file** — not just per-program. That's how the AI surfaces learn permanently.

## Open questions
- Multi-location chains — per-location entries with location-specific summerWindow? **Deferred. Use program-level for now.**
- Existing `deadline` field normalization? **Don't touch yet. New schema fields are additive.**
- One verified session date but more known to exist (Burke Dino Trackers): tier `window` with sessions[] containing the one confirmed is honest. Don't claim `verified` if list is incomplete.
- Should existing insights sections (registration-windows, scholarship-cheats) be marked `_aiContext: true` to flow into AI prompts? **Future batch — start with new dedicated sections to avoid context overflow.**

## Batch log (most recent at top)

### 2026-04-26 — batch 10 (knowledge-integration sections)
3 new `_aiContext: true` sections in summer-camp-insights.json:
- `regional-summer-windows-2026` (Seattle / Bay / Chicago / NYC / year-round / single-day)
- `registration-timing-anchors-2026` (PSC, MoF ACE, Camp Orkila, Camp Galileo, Point Defiance, Lawrence Hall, CSC)
- `pricing-tiers-k8-2026` (free / low / mid / premium / specialty / single-day + hidden cost-leverage patterns)
These flow into /plan, /ask, and David's chat after patch7 deploys.

### 2026-04-26 — batches 1-9 (60 program entries)
See submitted-batches log for per-batch detail.
- Batches 1-3: 15 entries (5 each) — WA + nationwide STEM anchors + nationwide brands
- Batches 4-7: 40 entries (10 each) — bulk year-round + WA arts/sleepaway + nationwide
- Batch 8: lessons-only refresh
- Batch 9: 10 entries — CA anchors (Lawrence Hall ✨, Tech Interactive ✨ verified sessions, CA Science Center, Birch Aquarium, LA's BEST, CYC SF, Club SciKidz) + Maker Camp, Camp Invention, JA BizTown

## Backlog priority order
1. **CA remaining** — Stanford youth, COSMOS, AoPS Academy SF
2. **NY** — Carnegie summer, NY Phil, Lincoln Center youth, more AMNH-adjacent
3. **TX, IL, MA, MI, MD, DC** anchor cities
4. **Nationwide chains remaining** — Y-USA umbrella, FIRST LEGO + VEX, KE Camps, Kids in the Game
5. **Non-STEM categories** — leadership, service, sports academies
6. **Mark existing insights sections as `_aiContext: true`** — registration-windows, scholarship-cheats are already excellent calibration — wire them in once we've confirmed the new sections aren't bloating prompts

**Total nourished:** 65 / 956 + 3 _aiContext sections
**Last touched:** 2026-04-26
