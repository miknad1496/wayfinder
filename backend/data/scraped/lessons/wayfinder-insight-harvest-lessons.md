# wayfinder-insight-harvest — Lessons Learned

> Retroactive harvest task. Reads existing entries from programs.json (K-8 only),
> k12-enriched.json, and volunteer-opportunities.json. For each, re-fetches the
> _source URL and extracts parent-facing insights ONLY — does NOT modify the
> existing entry. Insights flow into the field-notes section of the matching
> insights JSON file.

## CURRENT CALIBRATION

- batch_size: 5 entries per run (small — quality > throughput)
- typical_run_duration: TBD (no runs yet)
- typical_skip_rate: expect 30-50% of entries to yield no new insight worth capturing
- last_calibration_change: 2026-04-26 — initial bootstrap

## EFFECTIVE PATTERNS (to be filled by runs)

(seeded patterns to try)
- Look at FAQ pages, scholarship sub-pages, "for parents" sections — these are insight-rich
- Search-result snippets often capture FAQ accordion content even when the page itself is too large to fetch
- Compare published age min vs. real flexibility ("ages 6-12, exceptions for siblings")
- Check for hidden discount stacks (multi-week + sibling + Early Bird + member)
- Note real cost vs sticker (registration fee, late fee, refund policy)

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
