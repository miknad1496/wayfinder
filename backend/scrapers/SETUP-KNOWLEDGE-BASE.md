# Knowledge Base Setup

## Quick Start (one command)

```bash
cd wayfinder/backend
node scrapers/run-all-scrapers.js
```

This runs all 5 scrapers and automatically builds the SQLite database at the end.

## API Keys

Already configured in `wayfinder/.env`. All free, all set up:

| Source | Env Variable | Status |
|--------|-------------|--------|
| College Scorecard | `SCORECARD_API_KEY` | ✓ |
| Census ACS | No key needed | ✓ |
| BEA (Cost of Living) | `BEA_API_KEY` | ✓ |
| BLS OEWS | No key (flat files in `data/oews/`) | ✓ |
| H1B | No key (flat files in `data/H1B/`) | ✓ |

## What it produces

```
knowledge-base/
  bls-compensation.json       ~5.5MB   315 occupations × wages × states × metros
  scorecard-earnings.json     ~2.8MB   141 institutions × 8,362 programs
  census-education-earnings.json ~15KB 52 states × education levels
  cost-of-living.json         ~varies  50 states + 380 metros RPP indices
  h1b-compensation.json       ~579KB   112 SOC codes × 1,936 companies
  wayfinder-kb.db             ~3MB     SQLite database (all of the above combined)
```

## Manual rebuilds

If you only need to rebuild the SQLite DB (after editing JSON files):
```bash
node scripts/build-knowledge-db.js
```

If you need to re-run a single scraper:
```bash
node scrapers/scorecard-scraper.js
node scrapers/census-acs-scraper.js
node scrapers/col-scraper.js
node scrapers/bls-oews-scraper.js --from-files data/oews/
```

## How it integrates

`knowledge.js` auto-detects the SQLite DB on startup. If `sql.js` is installed and `wayfinder-kb.db` exists, it uses SQL queries for Layer 3 raw data. Otherwise it falls back to loading JSON files directly. No config changes needed.

## Data freshness

| Source | Updates | How to refresh |
|--------|---------|---------------|
| BLS OEWS | Annual (May) | Download new flat files from bls.gov/oes/tables.htm |
| College Scorecard | Rolling | Re-run scraper (API fetches latest) |
| Census ACS | Annual | Re-run scraper |
| BEA RPPs | Annual | Re-run scraper |
| H1B LCA | Quarterly | Download new disclosure file from dol.gov |
