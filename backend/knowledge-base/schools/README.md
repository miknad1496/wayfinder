# Wayfinder School Deep Knowledge Files

This directory holds per-school deep-knowledge markdown files that are
auto-loaded into the admissions RAG category by REVAMP V2: SCHOOLS DEEP KNOWLEDGE PATCH37.

## Filename convention
`school-<slug>.md` — e.g. `school-stanford.md`, `school-mit.md`,
`school-uchicago.md`. The slug becomes the school identifier in chunk
metadata (chunk._school).

## File template

```markdown
# <School Name> — Wayfinder Deep Knowledge

## Snapshot
- Type: <private/public, R1/LAC>, <undergrad enrollment>
- Most recent admit rate: <X.X%> (Class of <YEAR> per <SOURCE>)
- Test policy: <required / test-optional / test-blind> through <CYCLE>
- Application: <Common App / Coalition / school-specific> + supplements
- Early round: <ED1 / ED2 / EA / REA / SCEA / none>, deadline <DATE>
- RD deadline: <DATE>

## What admissions actually weights
<3-5 paragraph summary of the admissions philosophy. Cite official
admissions blog posts, NACAC reports, current/former AO interviews.
Focus on signal patterns over numerical thresholds.>

## Recent essay shifts (2024-2026)
<Notable changes to supplements, common essay themes that have
diverged from peers, recent prompts AOs have publicly discussed.>

## Post-SFFA stance
<How the school has communicated about the SFFA decision and
adversity-essay strategy in their context. Cite official statements.>

## Demonstrated interest
<Yes/no/measured. Most selectives say no but visit/info-session
attendance still matters at some.>

## Strategic notes for applicants
<School-fit signals, what makes apps memorable here specifically,
common failure patterns the school has flagged in public talks.>

## Aid + scholarship policy
<Need-blind/aware, no-loan policies, merit aid availability,
QuestBridge partnership status if any.>

---

_lastUpdated: YYYY-MM-DD
_sources:
  - <official admissions blog URL>
  - <Common Data Set YYYY-YY URL>
  - <NACAC State of College Admission YYYY URL>
  - <other primary sources>
```

## CRITICAL: data-quality rules
- ALL numerical claims (admit rate, yield, demographics) MUST cite a
  primary source (Common Data Set, official press release, or
  authoritative news source quoting the dean/AO).
- Mark any rumor, speculation, or "common wisdom" claim explicitly.
- Update _lastUpdated every time you touch the file. Stale files
  >12 months old should get re-verified or removed.
- DO NOT include estimated/projected admit rates — only published.
- Avoid inventing quotes or attributing statements to specific AOs
  without a primary source.

## How content surfaces in chat
- Files are loaded with weight 2.0 (same as distilled brain)
- They merge into the `admissions` category bucket
- BM25 retrieval picks them up when query keywords match
- The per-school file gets a strong score boost when the school
  name appears in the query (via _school metadata + entity boost)

## To add a new school
1. Drop a properly-formatted `school-<slug>.md` here
2. Restart Render (or wait for cache TTL — 10 minutes)
3. Test by asking the chat about that school

The wayfinder-data-refresh scheduled task can also be configured to
research and add school files autonomously over time.
