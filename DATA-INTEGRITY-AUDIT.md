# Data Integrity Audit — Wayfinder

**Date**: April 4, 2026  
**Status**: CRITICAL — Must be resolved before commercial launch

## Executive Summary

Multiple data modules contain AI-generated content that has never been validated against real sources. The financial-aid-db.json (school tuition/costs) is the most critical — every tuition number was fabricated by an LLM and is not from IPEDS, College Scorecard, or any school website.

---

## Module-by-Module Assessment

### RED — AI-Fabricated, Must Replace Before Launch

| File | Items | Issue |
|------|-------|-------|
| `financial-aid-db.json` — schools | 149 schools | **All tuition, fees, room & board numbers are fabricated.** Not scraped from any real source. In-state/out-of-state relationships were inverted. Amounts are plausible but wrong. |
| `financial-aid-db.json` — stateGrants | 222 grants | Grant names may be fabricated. URLs point to state agency homepages, not specific programs. Amounts unverified. Only 25/222 have path-specific URLs. |
| `financial-aid-db.json` — federalPrograms | 9 programs | Federal program names and studentaid.gov URLs are correct. **Amounts need verification** (e.g., Pell Grant max was $7,395 — verify current year). |
| `decision-dates.json` | 99 schools | Has IPEDS unitIds (good), but actual decision dates may be fabricated. Deadlines change annually. |
| `curriculum-data.json` | ~20 schools | Course requirements, credit counts, calendars — likely AI-generated, not scraped from registrar sites. |
| `college-admissions.json` — scorecardProfiles | 0 items | **Empty** — never populated. Dead feature. |

### YELLOW — Has Real Structure but Details May Be Fabricated

| File | Items | Issue |
|------|-------|-------|
| `internships.json` | 1,510 | URLs are real company career portals. But specific details (deadlines, compensation amounts like "$8,000/month", descriptions) are likely fabricated. Description text is suspiciously templated. |
| `scholarships.json` | 976 | URLs point to real organizations. Major scholarship names are correct. But specific amounts, deadlines, and eligibility details need verification. |
| `programs.json` | 746 | URLs look real and specific. Program names match known programs (MITES, RSI, COSMOS). Amounts and deadlines need verification. |
| `local-schools.json` | ~12 districts | Seattle-area K-12 data. District names are real. Specific data points need verification. |
| `nces-earnings-by-major.json` | 20 majors | Has CIP codes (good sign). Dollar amounts need verification against actual NCES data. |

### GREEN — Likely Real / Low Risk

| File | Items | Assessment |
|------|-------|-----------|
| `bls-occupations.json` | 191 | Has BLS.gov URLs for every entry. Likely scraped from real BLS Occupational Outlook Handbook. |
| `onet-occupations.json` | 25 | Has SOC codes. Appears scraped from O*NET. |
| `reddit-*.json` | ~1,400 posts | All have reddit.com URLs with real post IDs. Content appears scraped from actual Reddit threads. |
| `community-hn-*.json` | 64 items | Have Hacker News URLs. Appears real. |
| `ethnicity-demographics.json` | 100 schools | Has IPEDS unitIds, claims NCES source. Structure matches real IPEDS data format. |
| `essay-*.json` | ~117 items | Advisory/strategic content (techniques, insights). Not factual data claims — these are opinion/advice which is fine to be AI-curated. |

---

## Fix Plan

### Immediate (Before Launch)

1. **Run `SCRAPE-SCORECARD.bat`** locally — pulls verified IPEDS data from College Scorecard API for all schools (tuition, fees, room & board, net prices, admissions, outcomes). Replaces entire schools array.

2. **Verify federal programs** — spot-check the 9 federal program amounts against studentaid.gov.

3. **State grants** — either build a scraper for each state's higher ed agency, or reduce to only the top 5-10 per state with manually verified data. Better to have 50 verified grants than 222 unverified ones.

### Before Scale

4. **Scholarships** — verify top 100 by amount against real org websites. Flag unverified ones.

5. **Internships** — remove fabricated compensation/deadline data. Keep company names and career portal URLs. Let the URL be the source of truth for details.

6. **Decision dates** — build annual scraper or use Common Data Set information.

---

## Root Cause

The initial data population used Claude to generate "plausible" data rather than scraping from real sources. This created a database that looks professional but contains fabricated numbers. The problem was compounded by subsequent sessions that didn't question the data's origin and instead layered more AI-generated content on top.

**Lesson**: Any data that Wayfinder presents as factual must come from a verifiable source (API, official website, government database) — never from an LLM generating "what sounds right."
