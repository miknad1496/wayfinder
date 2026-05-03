# Wayfinder AP Exam Study Guides

This directory holds per-AP-exam study guide markdown files that are
auto-loaded into the education_decisions RAG category by REVAMP V2: AP EXAMS PATCH58.

## Filename convention
`ap-<exam-slug>.md` — e.g., `ap-calc-bc.md`, `ap-bio.md`,
`ap-us-history.md`. The slug becomes the exam identifier in chunk
metadata (chunk._apExam).

## File template (suggested sections)

```markdown
# AP <Exam Name> — Wayfinder Study Guide

## Exam structure
- Total time, section breakdown, scoring scale

## What's tested
- Units / topics with exam weight percentages

## Score distribution
- Recent year stats: % of 5s, 4s, 3s, etc.

## Strategy by score target
- Targeting a 5
- Targeting a 4
- Targeting a 3

## Common mistakes that lose points
- Notation, formula errors, time mistakes

## Study timeline
- Month-by-month suggested plan

## Resources
- Free (Khan Academy, AP Daily, College Board)
- Paid (Princeton Review, Barron's, tutors)

## College credit policy
- General + how to verify per school

---

_lastUpdated: YYYY-MM-DD
_sources:
  - College Board AP <Exam> CED
  - apstudents.collegeboard.org released exams
  - Score distribution data
```

## How content surfaces in chat

When a user asks about a specific AP exam ("how should I prep for AP Bio?"
or "AP Calc BC strategy"), the BM25 retrieval picks up your study guide.
Engine + SLM + paid Haiku Advisor all surface this — same path as
school deep files.

For generic AP-prep questions ("when should I start AP prep?"), the
critical-facts-injector ap_prep topic fires too — it injects general
AP-strategy facts (when to start, score targets, retake math).

## To add a new AP study guide

1. Drop `ap-<exam-slug>.md` here following the template above.
2. Restart Render (or wait 10 minutes for cache TTL).
3. Test by asking the chat about that exam.

The wayfinder-data-refresh scheduled task can also be configured to
build new AP guides autonomously over time. Drop your existing study
guides in here as you finish them — they'll auto-surface.
