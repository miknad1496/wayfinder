# wayfinder-insight-harvest — Lessons Learned

> Retroactive harvest task. Reads existing entries from programs.json (K-8 only),
> k12-enriched.json, and volunteer-opportunities.json. For each, re-fetches the
> _source URL and extracts parent-facing insights ONLY — does NOT modify the
> existing entry. Insights flow into the field-notes section of the matching
> insights JSON file.

## CURRENT CALIBRATION

- batch_size: 5 entries per run (small — quality > throughput)
- typical_run_duration: ~6 min on esms module (mostly WebSearch + occasional curl fallback)
- typical_skip_rate: 0% on first esms batch — every entry yielded ≥1 actionable insight. Seattle/WA programs are insight-rich because partner orgs publish detailed FAQ/scholarship pages
- last_calibration_change: 2026-04-26 — first run completed, batch_size 5 felt right

## EFFECTIVE PATTERNS (to be filled by runs)

(seeded patterns to try)
- Look at FAQ pages, scholarship sub-pages, "for parents" sections — these are insight-rich
- Search-result snippets often capture FAQ accordion content even when the page itself is too large to fetch
- Compare published age min vs. real flexibility ("ages 6-12, exceptions for siblings")
- Check for hidden discount stacks (multi-week + sibling + Early Bird + member)
- Note real cost vs sticker (registration fee, late fee, refund policy)
- Search-engine snippet often surfaces FAQ-page content even when the camp's main page is JS-bundled and unreadable via curl (Pacific Science Center, Museum of Flight)
- For programs where the entry mentions "scholarships available," dig into the actual scholarship sub-page — it almost always has gotcha timing (Pacific Science Center: Mar 13 deadline; Museum of Flight: Feb 2 deadline BEFORE registration even opens)
- Two-tier scholarship structures (full + partial) hide the "you missed full but partial is still open" pathway parents need to know about (Museum of Flight Campership)
- For UW / university-affiliated programs, the gotcha is usually "is this what the parent thinks it is?" — Seattle MESA is teacher-nominated; Engineering Discovery Days is a 2-day spring event not a camp; Robinson Saturday Program doesn't run in summer
- Public-Servant / educator / military discounts are a recurring under-marketed insight (DigiPen 50%) — worth checking explicitly on every commercial program

## FAILED PATTERNS / KNOWN ANTI-PATTERNS

(empty — fill as discovered)

- Don't fabricate insights. If the page only confirms standard fields, skip — record entry as harvested with `_insightYield: 0`.
- Don't append generic insights ("X is a good camp") — only specific, actionable, parent-facing nuggets.

## ROTATION SCHEDULE

Each run picks ONE module to harvest from in rotation:
1. esms (programs.json — K-8 entries) → summer-camp-insights.json field-notes
2. k12 (k12-enriched.json) → k12-insights.json field-notes
3. volunteer (volunteer-opportunities.json) → volunteer-insights.json field-notes
4. (back to 1)

## PROGRESS TRACKING

`backend/data/scraped/insight-harvest-progress.json`:
```json
{
  "lastRun": "...",
  "totalRuns": 0,
  "totalInsightsCaptured": 0,
  "currentModule": "esms",
  "harvestedKeys": {
    "esms": ["entry-name-hash-1", ...],
    "k12": ["ncessch-1", ...],
    "volunteer": ["entry-name-hash-1", ...]
  }
}
```

Entries are uniquely identified:
- esms / volunteer: by lowercase `${name}+${provider/organization}` hash (or just the name if no provider)
- k12: by `ncessch` (NCES school ID)

Once all entries in a module are harvested, the rotation skips that module (until new entries are added by the regular grinders).

## QUALITY BAR

Each captured insight must be:
- **Specific** to the named org/school
- **Actionable** for a parent
- **Sourced** from a fetched page during this run
- **Non-obvious** (not already in the entry's structured fields)
- **Currently true** (registration windows, scholarship offerings — date-stamp inline if temporal)

## RUN HISTORY

| Date | Run # | Module | Entries scanned | Insights captured | Notable |
|------|-------|--------|-----------------|-------------------|---------|
| (no runs yet) | | | | | |
| 2026-04-26 | 1 | esms | 5 | 5 | First run; 100% capture rate. WA Seattle programs all yielded insights. Notable: Museum of Flight Campership full-aid window closes BEFORE registration opens — parent gotcha. |


## DATA QUALITY FLAGS

- DigiPen Open World entry name says "Ages 5-12" but real product structure is Explorer (6-8), Adventurer (9-13), Innovator (14-18). Lower bound is 6 not 5; upper bound goes to 13 for the Adventurer track. Consider patching the entry name on next data refresh.
- UW Engineering Discovery Days is in programs.json with eligibility.grades K-8, but the program officially targets grades 4-8 only. Also it's a 2-day spring event, not a multi-week summer program — `type: 'summer'` may be wrong. Worth a future correction.
- Robinson Center entry exists but its Saturday Enrichment program does NOT run in summer — it's quarterly fall/winter/spring. If users filter by `type: 'summer'`, this entry should map to Robinson's separate summer offerings instead.

## CALIBRATION SUGGESTIONS

- Keep batch_size at 5 — yield was high enough that throughput is fine. Going to 10 risks shallower research per entry.
- Add a "name vs reality" check pattern explicitly to STEP 2 — entries 3 and 5 both had name/eligibility mismatches that became insights.
- Consider a `_dataQualityFlags` field harvested in parallel that the data-refresh task can read to schedule entry corrections (separate from the parent-facing insights).

## RUN 2 — 2026-04-26 (k12 module)

| Date | Run # | Module | Entries scanned | Insights captured | Notable |
|------|-------|--------|-----------------|-------------------|---------|
| 2026-04-26 | 2 | k12 | 5 | 7 | First k12 batch — Bellevue/Newport/Tesla STEM/Roosevelt/Garfield (all WA). 7 insights from 5 entries (>1 per school). Tesla STEM lottery-waitlist-carries-forward is a major parent insight; Garfield "Honors for All" default-tracks every freshman. |

### EFFECTIVE PATTERNS (additions from run 2)

- For magnet/choice schools with lotteries (Tesla STEM), the LWSD waitlist-carry-forward rule is a major non-obvious parent insight — apply early even if not entry year. Search for `[choice school] lottery waitlist [year]` to surface current cohort fill status.
- For comprehensive HS, look beyond AP counts to the CTE side: industry certifications (ASE, CCNA, etc.) + college-credit pathways are non-obvious differentiators. WANIC network sharing means students can reach programs at peer schools.
- For Seattle Public Schools, "Honors for All" / equity-driven default tracks at specific HS (Garfield 9th-grade humanities) are critical for parents to know — they invert the assumption that honors requires advocacy.
- "College in the High School" (UW partnership at Roosevelt) is a Running-Start alternative that lets students earn college credit on the home campus — worth flagging where it exists.
- Booster-funded programs (Roosevelt Jazz, Garfield Jazz) — when a famous program is largely parent-funded, dues + fundraising are real cost vectors parents under-estimate.

### FAILED PATTERNS / KNOWN ANTI-PATTERNS (additions)

- WebFetch on district homepages returns oversized navigation HTML (Bellevue HS hit 191K chars). Skip the homepage; go straight to subpages (CTE, profile PDF, counseling) or use WebSearch with specific query.

### DATA QUALITY FLAGS (additions)

- Roosevelt HS entry has principal=undefined; should be filled on next k12-grinder pass.
- Garfield HS entry has principal=undefined; should be filled on next k12-grinder pass.
- Several Bellevue School District schools share the same "27 AP courses" stat — verify this is actually shared across BHS/Newport vs. each having their own catalog.

### CALIBRATION SUGGESTIONS (additions)

- Run 2 yielded 7 insights from 5 entries — slightly above 1:1, partially because Garfield/Roosevelt/Tesla each had two distinct insight types (academic + activity, or admission + program-cost). When an entry yields two distinct insights, capture both rather than forcing one.
- Continue batch_size=5; quality bar held.
