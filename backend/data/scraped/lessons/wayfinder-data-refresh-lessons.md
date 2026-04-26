# wayfinder-data-refresh — Lessons Learned

> Weekly Sunday refresh: research and inject new verified scholarships,
> programs, internships. Read at start, append at end.

## CURRENT CALIBRATION

- frequency: weekly Sunday 9:03am PT
- typical batch: ~5-10 new entries per category per week
- last_calibration_change: 2026-04-26 — initial bootstrap

## EFFECTIVE PATTERNS

- Verifying entries with multiple sources (program homepage + state DOE listing OR USDE listing OR foundation directory) catches expired programs before they pollute the DB.
- Internship and scholarship deadlines in Dec-March are most at-risk of staleness — that's when programs publish/finalize next-year specifics. Re-verify these entries closer to season.

## FAILED PATTERNS

- Don't add scholarships announced "for 2025-26 only" — they're one-cycle, not the kind of recurring program the DB is built for.
- Don't add programs that require parent fundraising or massive participation fees as "free" — note the actual cost tier.

## DATA QUALITY FLAGS

(empty — fill as discovered)

## CALIBRATION SUGGESTIONS

- 5-10 entries/category/week is sustainable for verification quality. If the LLM consistently completes in <20 min, consider going to 12-15.

## OPEN QUESTIONS

- Worth re-verifying old entries (>1 year since last verify) on a rotating cadence?

## RUN HISTORY

(see git log for "Weekly data refresh" commits — most recent: 2026-04-23)
