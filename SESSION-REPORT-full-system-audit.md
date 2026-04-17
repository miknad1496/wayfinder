# Full System Audit — Session Report
**Date:** 2026-04-17
**Focus Area:** Data Layer — JSON integrity, verified entry quality, metadata consistency, state code normalization, format field coverage

## Run Summary
Deep audit of all three data files (`scholarships.json`, `programs.json`, `internships.json`) covering: metadata accuracy, duplicate detection, verified entry quality (source URLs, required fields), state code normalization, format field coverage, and filter compatibility. Found and fixed 5 issues across all three data files.

## Key Findings

### DL-1: LOW — Scholarship Metadata Count Mismatch
**File:** `backend/data/scraped/scholarships.json` — metadata
**Status:** FIXED

`metadata.totalCount` was 1037 (correct) but `metadata.totalScholarships` was 1039 (stale from a previous inject run). These two fields should always match the actual array length. Could cause confusion in admin dashboards or stats endpoints.

**Fix:** Synced both `totalCount` and `totalScholarships` to actual array length (1037).

### DL-2: MODERATE — 744 Programs Missing `format` Field (91% of dataset)
**File:** `backend/data/scraped/programs.json` — 744 of 821 entries
**Status:** FIXED

Only 77 programs (all verified entries) had a `format` field. The remaining 744 non-verified entries lacked it entirely. The programs search route filters by format (`p.format?.toLowerCase() === fmt`), so any user filtering by "in-person" would only see 70 results instead of the expected ~807. This made the format filter nearly useless for programs.

**Fix:** Backfilled `format` based on `location.state`: entries with `state=Online` → `"online"`, `state=Remote` → `"remote"`, all others → `"in-person"`. Result: 807 in-person, 3 hybrid, 8 online, 3 remote. Added `_formatBackfillNotes` to metadata documenting the inference.

### DL-3: LOW — 4 Programs with Combo State Codes (e.g., "NY/IN")
**File:** `backend/data/scraped/programs.json` — 4 entries
**Status:** FIXED

Four programs had compound state codes like `NY/IN`, `CA/NY`, `CA/MA`, `NY/MA` in `location.state`. These never match the state filter (which compares against a single 2-letter code). Affected programs: Telluride Association Summer Program (TASP), Venture Capital Summer Internship, Biotech Summer Research Internship, Consulting Summer Program.

**Fix:** Normalized `location.state` to the first state in the compound. Added the second state to `eligibility.states` so the program is still discoverable when filtering by either state.

### DL-4: LOW — 48 Programs and 4 Internships with Country Names as State Codes
**File:** `backend/data/scraped/programs.json` (48 entries), `internships.json` (4 entries)
**Status:** FIXED

International programs/internships had country names (Costa Rica, Peru, Spain, Germany, Japan, Brazil, Switzerland, UK, France) stored in `location.state`. These never match any state filter and create misleading state distribution stats.

**Fix:** Moved country name to new `location.country` field and set `location.state` to `"International"`. This preserves the country data while making the state field consistent and filterable.

### DL-5: INFO — `programs-expanded.json` is Orphaned (Not Used by Any Route)
**File:** `backend/data/scraped/programs-expanded.json`
**Status:** NOT FIXED — informational

This file has a section-based structure (`middleSchool`, `highSchoolInternships`, `highSchoolPrograms`) with 74 entries total, 0 verified. The programs route loads `programs.json` (821 entries, 77 verified), and the inject script targets `programs.json`. `programs-expanded.json` appears to be an older format that is no longer canonical. It has no consumers.

**Recommendation:** Consider deleting `programs-expanded.json` or archiving it to avoid confusion. Multiple audits have flagged confusion about which file is canonical.

## Data Health Summary

| Dataset | Total | Verified | Duplicates | Missing Key Fields | State Issues |
|---------|-------|----------|------------|-------------------|--------------|
| Scholarships | 1,037 | 74 (7.1%) | 0 | 0 | 0 |
| Programs | 821 | 77 (9.4%) | 0 | 0 (after fix) | 0 (after fix) |
| Internships | 1,599 | 974 (60.9%) | 0 | 0 | 0 (after fix) |

### Verified Entry Quality
All verified entries across all three datasets have valid `_source` URLs (no example.com, no missing protocols), proper `_verifiedDate` fields, and complete required fields. Source URL quality is good — no hallucinated URLs detected.

### Data Structure Notes
- Scholarships use `name` as primary identifier
- Internships use `title` (not `name`) as primary identifier — consistent across all 1,599 entries
- Programs use `name` as primary identifier
- All three datasets have proper deduplication (0 duplicates found)

## Positive Observations
- All verified source URLs are valid and well-formed
- Deadline formats are consistent across all three datasets
- Scholarship amount structure is uniform (all have `amount.min`/`amount.max`)
- Internship field, company, and location coverage is 100% for verified entries
- Grade coverage is 100% for programs (all 821 have `eligibility.grades`)
- The inject scripts correctly target the canonical data files

## Previously Flagged Items — Status
- **C-5 (metadata count mismatches):** RESOLVED — scholarships metadata synced, programs metadata was already correct at 74 (for programs-expanded.json) and 821 (for programs.json)
- **H-10 (scholarship state data):** RESOLVED — all 258 state-scoped scholarships have proper `eligibility.states` arrays
- **H-11 (program invalid state codes):** RESOLVED — combo codes and country names normalized
- **Password validation mismatch (6 vs 8):** Already fixed in a prior commit (app.js line 1457 now says 8)

## Git Status
- **Files changed:** `backend/data/scraped/scholarships.json`, `backend/data/scraped/programs.json`, `backend/data/scraped/internships.json`
- **Commit:** See below
