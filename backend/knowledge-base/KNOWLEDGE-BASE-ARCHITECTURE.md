# Wayfinder Knowledge Base Architecture v2

## The Problem

Wayfinder is a career and education advisor that currently has ~20 real salary data points. That's like being a financial advisor with no access to stock prices. Every ROI recommendation, salary negotiation guide, career trajectory projection, and school-vs-school comparison is either hallucinated or pulled from the model's training data (stale, generic, unverifiable).

## What We Need

A career advisor needs to answer questions like:

- "What does a software engineer make in Austin vs Seattle?" (geographic comp)
- "Should I get an MBA? What's the ROI?" (education ROI)
- "Is nursing still a good career in 2026?" (demand + comp + trajectory)
- "My son got into Purdue and Georgia Tech for ME. What do graduates actually earn?" (institution-specific outcomes)
- "I'm 5 years into marketing making $75K. Am I underpaid?" (experience progression)
- "What trades pay the best in my area?" (local trade wages)
- "How much do H1B software engineers at Google actually make?" (company-specific comp)

Each of these requires different data from different sources.

## Architecture: 6 Data Domains

### Domain 1: OCCUPATION COMPENSATION
*"What does this job pay?"*

**Source: BLS OEWS API (free, public domain)**
- 830+ occupations (SOC codes)
- Wage percentiles: 10th, 25th, 50th (median), 75th, 90th
- Annual and hourly wages
- By geography: national, state, 400+ metro areas
- By industry: NAICS sector breakdowns
- Updated annually (May reference period)

**Schema: `bls-compensation.json`**
```json
{
  "soc": "15-1252",
  "title": "Software Developers",
  "wages": {
    "national": {
      "annual": { "p10": 70160, "p25": 90870, "p50": 127260, "p75": 163220, "p90": 202170 },
      "hourly": { "p10": 33.73, "p25": 43.69, "p50": 61.18, "p75": 78.47, "p90": 97.20 },
      "mean": 132270
    },
    "by_state": {
      "CA": { "annual": { "p50": 146770 }, "employment": 298400 },
      "TX": { "annual": { "p50": 125680 }, "employment": 142300 },
      ...
    },
    "by_metro": {
      "San Jose-Sunnyvale-Santa Clara, CA": { "annual": { "p50": 175390 }, "employment": 68200 },
      "Seattle-Tacoma-Bellevue, WA": { "annual": { "p50": 167260 }, "employment": 52100 },
      ...
    }
  },
  "employment": {
    "total": 1795300,
    "jobs_per_1000": 11.8
  },
  "outlook": {
    "growth_rate": "25%",
    "growth_category": "Much faster than average",
    "projected_openings": 153900,
    "period": "2022-2032"
  }
}
```

**Coverage target: 300+ occupations with full wage data + top 50 metros**
(Focus on occupations students/career changers actually ask about, not all 830)

### Domain 2: EDUCATION-TO-EARNINGS
*"What do graduates of X major / X school actually earn?"*

**Source: College Scorecard API (free, no auth needed)**
- Earnings by field of study (CIP code) across all institutions
- Earnings by specific institution + field combination
- 1-year and 4-year post-graduation earnings
- Debt at graduation
- Completion rates
- Covers 6,500+ institutions

**Schema: `scorecard-earnings.json`**
```json
{
  "institution": {
    "id": 243780,
    "name": "Purdue University-Main Campus",
    "state": "IN",
    "type": "public",
    "admission_rate": 0.53,
    "avg_net_price": 14520
  },
  "programs": [
    {
      "cip": "14",
      "field": "Engineering",
      "credential": "bachelors",
      "earnings_1yr": { "median": 72000, "p25": 58000, "p75": 88000 },
      "earnings_4yr": { "median": 95000, "p25": 78000, "p75": 118000 },
      "debt_at_grad": { "median": 27000 },
      "completers": 1450
    },
    {
      "cip": "11",
      "field": "Computer Science",
      "credential": "bachelors",
      "earnings_1yr": { "median": 82000 },
      "earnings_4yr": { "median": 110000 },
      "debt_at_grad": { "median": 25000 },
      "completers": 980
    }
  ]
}
```

**Coverage target: Top 200 institutions × top 20 fields = ~4,000 program-level earnings records**
Plus aggregate field-level data for all ~40 CIP 2-digit codes.

### Domain 3: EDUCATION-LEVEL EARNINGS
*"Is a master's degree worth it for my field?"*

**Source: Census ACS API (free, key required)**
- Earnings by education level × occupation × geography
- Cross-tabulated: bachelor's vs master's vs professional vs doctorate
- By age bracket (proxy for experience)
- Down to county/metro level

**Schema: `census-education-earnings.json`**
```json
{
  "occupation_group": "Computer and Mathematical",
  "acs_code": "110XX",
  "by_education": {
    "bachelors": { "median": 95000, "count": 1450000 },
    "masters": { "median": 112000, "count": 520000 },
    "professional": { "median": 125000, "count": 45000 },
    "doctorate": { "median": 130000, "count": 85000 }
  },
  "by_age": {
    "25-34": { "bachelors": 82000, "masters": 95000 },
    "35-44": { "bachelors": 110000, "masters": 125000 },
    "45-54": { "bachelors": 118000, "masters": 135000 }
  },
  "masters_premium": "+17.9%",
  "doctorate_premium": "+36.8%"
}
```

**Coverage target: All 25 major occupation groups × 4 education levels × 3 age brackets**

### Domain 4: TECH COMPENSATION (H1B)
*"What do companies actually pay for this role?"*

**Source: H1B LCA Disclosure Data (public records, free)**
- Millions of salary records with employer name
- SOC code, job title, prevailing wage level (I-IV)
- Worksite city/state/ZIP
- Full-time/part-time designation
- Updated quarterly

**Schema: `h1b-compensation.json`**
```json
{
  "soc": "15-1252",
  "title": "Software Developers",
  "by_company": {
    "Google": {
      "count": 4200,
      "wages": { "p25": 155000, "p50": 185000, "p75": 210000 },
      "levels": { "I": 45, "II": 890, "III": 2100, "IV": 1165 }
    },
    "Amazon": {
      "count": 8900,
      "wages": { "p25": 138000, "p50": 165000, "p75": 195000 }
    }
  },
  "by_metro": {
    "San Jose-Sunnyvale-Santa Clara": {
      "count": 22000,
      "wages": { "p25": 145000, "p50": 175000, "p75": 210000 }
    }
  },
  "total_filings": 45000,
  "fiscal_year": "2025"
}
```

**Coverage target: Top 50 SOC codes × top 50 employers × top 30 metros**

### Domain 5: OCCUPATION PROFILES (enriched O*NET)
*"What does this career actually involve?"*

**Source: CareerOneStop API / O*NET (free with key)**
- Tasks, skills, knowledge areas
- Education requirements
- Work values and interests (RIASEC)
- Technology skills
- Related occupations
- Wage data (same BLS source, but through cleaner API)
- Job zone (experience level 1-5)

**Schema: `onet-profiles.json`**
```json
{
  "soc": "15-1252.00",
  "title": "Software Developers",
  "job_zone": 4,
  "education": {
    "typical": "Bachelor's degree",
    "required_levels": { "bachelors": 72, "masters": 18, "associate": 5, "doctorate": 2 }
  },
  "tasks": ["Analyze user needs...", "Develop software testing...", ...],
  "top_skills": [
    { "name": "Programming", "importance": 88 },
    { "name": "Complex Problem Solving", "importance": 82 }
  ],
  "top_knowledge": [
    { "name": "Computers and Electronics", "importance": 92 },
    { "name": "Mathematics", "importance": 78 }
  ],
  "interests": { "primary": "Investigative", "secondary": "Conventional" },
  "work_values": ["Achievement", "Independence", "Recognition"],
  "technology_skills": ["Python", "Java", "SQL", "JavaScript", "Git"],
  "related_occupations": [
    { "soc": "15-1253.00", "title": "Software Quality Assurance Analysts" },
    { "soc": "15-1299.08", "title": "Computer Systems Engineers/Architects" }
  ],
  "ai_disruption_risk": "medium-low",
  "ai_disruption_notes": "Core development skills remain essential but AI tools are augmenting productivity by 30-50%. Entry-level code-writing tasks most affected."
}
```

**Coverage target: 300+ occupations (matching the BLS compensation list)**

### Domain 6: COST OF LIVING / GEOGRAPHIC ADJUSTMENT
*"$75K in Omaha vs $75K in San Francisco"*

**Source: BLS Regional Price Parities + Census ACS**
- Regional Price Parities by state and metro
- Housing cost indices
- Allows converting nominal salary to purchasing-power-adjusted salary

**Schema: `cost-of-living.json`**
```json
{
  "metro": "San Francisco-Oakland-Berkeley, CA",
  "rpp": 127.8,
  "rpp_housing": 176.3,
  "rpp_nonhousing": 108.2,
  "interpretation": "Costs 27.8% above national average",
  "salary_equivalent": {
    "100000_nominal": 78247,
    "note": "$100K in SF buys what $78K buys nationally"
  }
}
```

**Coverage target: All 50 states + top 100 metros**

---

## How This Maps to RAG Categories

The existing RAG pipeline uses 14 category buckets with trigger keywords. Each new data domain maps to existing raw data categories:

| New Domain | RAG Category | Replaces |
|---|---|---|
| BLS Compensation | `raw_bls` | Broken bls-occupations.json |
| College Scorecard | `raw_nces` + new `raw_scorecard` | Thin nces-earnings.json |
| Census Education | new `raw_census` | Nothing (new) |
| H1B Compensation | new `raw_h1b` | Nothing (new) |
| O*NET Profiles | `raw_onet` | Thin onet-occupations.json |
| Cost of Living | new `raw_col` | Nothing (new) |

New categories needed in knowledge.js:
- `raw_scorecard` — institution-specific earnings
- `raw_census` — education-level earnings cross-tabs
- `raw_h1b` — company/role-specific tech compensation
- `raw_col` — cost of living adjustments

---

## Data Volume Estimates

| Domain | Current | Target | Growth |
|---|---|---|---|
| BLS Compensation | 0 salary records | 300 occupations × 50 metros = 15,000+ | ∞ |
| College Scorecard | 20 majors | 200 schools × 20 fields = 4,000 | 200× |
| Census Education | 0 | 25 groups × 4 edu × 3 age = 300 | new |
| H1B Compensation | 0 | 50 SOCs × 50 companies = 2,500 | new |
| O*NET Profiles | 25 occupations | 300 occupations | 12× |
| Cost of Living | 0 | 50 states + 100 metros = 150 | new |
| **TOTAL** | **~220 data points** | **~22,000+ data points** | **100×** |

---

## API Endpoints and Authentication

| Source | API URL | Auth | Rate Limits |
|---|---|---|---|
| BLS v2 | api.bls.gov/publicAPI/v2 | Free registration key | 500 queries/day, 50 series/query |
| College Scorecard | api.data.gov/ed/collegescorecard | api.data.gov key (free) | 1000/hr |
| Census ACS | api.census.gov/data/2024/acs | Free key | Generous |
| H1B LCA | lcr-pjr.doleta.gov | None (bulk download) | N/A |
| CareerOneStop | api.careeronestop.org | Free key request | Reasonable |
| BEA (RPP/CoL) | apps.bea.gov/api | Free key | 100/min |

All free. All public domain or public records. No ToS issues.

---

## Build Priority

1. **BLS Compensation** — Highest impact. Directly answers "what does X pay?" which is asked in >50% of career conversations. Uses their actual API instead of broken web scraping.

2. **College Scorecard** — Second highest. Directly answers "what do graduates of X school/major earn?" which is critical for every college decision conversation. Already have a thin version (20 majors) — need to expand massively.

3. **O*NET Profiles** — Enriches career advice with actual task/skill data for 300 occupations instead of 25. Uses CareerOneStop API.

4. **H1B Compensation** — Gives company-specific salary data for tech roles. High value for the AI-disruption career advice angle.

5. **Census Education Earnings** — Enables "is a master's worth it?" analysis by field. Cross-tab data.

6. **Cost of Living** — Enables geographic salary comparisons. Nice to have but lower priority.

---

## AI Disruption Overlay

The AI disruption risk data is NOT available from any government API. It needs to be curated manually or derived from:
- BLS employment projections (which occupations are growing/shrinking)
- News analysis of AI impact by sector
- Dan's admin insights layer

This is a Layer 0 / admin insights concern, not a scraper concern. The scraped data provides the foundation; the AI disruption lens is the editorial layer Dan adds on top.
