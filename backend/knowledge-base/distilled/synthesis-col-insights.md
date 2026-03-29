# Cost of Living Intelligence: Regional Price Parities for Career Decisions

**Source**: Bureau of Economic Analysis (BEA) Regional Price Parities (RPPs)
**Created**: March 2026
**Purpose**: Adjust nominal salary figures for real purchasing power by location

---

## What RPP Means

Regional Price Parities (RPP) measure relative price levels across states and metro areas. **100 = national average.** An RPP of 110 means costs are 10% above average; RPP 90 means 10% below.

**The salary adjustment formula:**
```
Real Salary = Nominal Salary × (100 / Local RPP)
```
Example: $150,000 in San Francisco (RPP ~116) = $150,000 × (100/116) = **$129,310 in real purchasing power**
Example: $100,000 in Des Moines (RPP ~89) = $100,000 × (100/89) = **$112,360 in real purchasing power**

**This is the single most important adjustment when comparing job offers across locations.**

---

## Key State-Level Benchmarks (RPP All Items)

### Most Expensive States (RPP > 105)
| State | RPP | What $100K Buys |
|-------|-----|-----------------|
| California | 110.7 | $90,334 |
| Hawaii | 110.0 | $90,909 |
| District of Columbia | 109.9 | $90,992 |
| New Jersey | 108.8 | $91,912 |
| New York | 107.9 | $92,678 |
| Massachusetts | 107.5 | $93,023 |
| Washington | 106.5 | $93,897 |
| Maryland | 105.4 | $94,877 |
| Connecticut | 105.2 | $95,057 |
| Oregon | 105.0 | $95,238 |

### Least Expensive States (RPP < 90)
| State | RPP | What $100K Buys |
|-------|-----|-----------------|
| Arkansas | 86.9 | $115,075 |
| Mississippi | 87.0 | $114,943 |
| Iowa | 87.8 | $113,895 |
| Oklahoma | 87.8 | $113,895 |
| Louisiana | 88.2 | $113,379 |
| West Virginia | 88.4 | $113,122 |
| Alabama | 88.6 | $112,867 |
| Kansas | 89.0 | $112,360 |
| Missouri | 89.3 | $112,010 |
| Indiana | 89.8 | $111,359 |

### Strategic Middle Ground (RPP 93-100)
States like Texas (96.5), North Carolina (95.2), Georgia (93.8), Colorado (99.8), and Virginia (100.5) sit near the national average — offering a balance of job availability and purchasing power.

---

## Key Metro-Level Benchmarks

### Tech Hub Comparison
| Metro | RPP | $200K Salary = Real |
|-------|-----|---------------------|
| San Francisco-Oakland | ~116 | $172,414 |
| San Jose-Sunnyvale | ~114 | $175,439 |
| New York-Newark-NJ | ~113 | $176,991 |
| Los Angeles-Long Beach | ~114 | $175,439 |
| Seattle-Tacoma | ~109 | $183,486 |
| Boston-Cambridge | ~109 | $183,486 |
| Denver-Aurora | ~103 | $194,175 |
| Austin-Round Rock | ~99 | $202,020 |
| Raleigh-Cary | ~95 | $210,526 |
| Dallas-Fort Worth | ~98 | $204,082 |

### Critical Insight: The $200K Trap
A $200,000 salary in San Francisco has the purchasing power of ~$172K nationally. The same $200K in Raleigh buys what $211K would nationally. That's a **$39K real difference** — or nearly 23% more purchasing power in Raleigh.

**This doesn't mean "move to Raleigh."** It means:
1. Compare offers by adjusting to real dollars first
2. A $165K offer in Raleigh may beat a $200K offer in SF
3. Remote workers from high-RPP metros who relocate get an instant "raise"
4. Entry-level roles in expensive metros are especially squeezed

---

## Decision Frameworks

### Framework 1: Offer Comparison Across Locations

When a user has offers in different cities:
1. Get nominal salary for each offer
2. Look up metro RPP (or state RPP if metro unavailable)
3. Calculate: Real Salary = Nominal × (100 / RPP)
4. Compare real salaries — that's the true comparison
5. Also factor in state income tax (no income tax: TX, FL, WA, TN, NV, WY, SD, NH, AK)

### Framework 2: "Should I Relocate?" Analysis

For relocation decisions:
1. Calculate real salary in current location
2. Calculate real salary in target location
3. If real salary is higher AND career trajectory is equal or better → strong relocate signal
4. If nominal salary is higher but real salary is lower → the "raise" is an illusion
5. Housing RPP matters more than overall RPP for young professionals (housing is 30-40% of spend)

### Framework 3: Remote Work Arbitrage

For remote workers negotiating salary:
1. Company may peg salary to their HQ location (e.g., SF: RPP 116)
2. If you live in RPP 92 area, your $150K SF salary = $163K real purchasing power
3. Some companies apply location-based pay bands — understand the discount before accepting
4. A 10% location discount on a SF salary to live in Austin still leaves you ahead in real terms

---

## Common Misconceptions

**"NYC is the most expensive city."** Not quite. San Francisco, Napa, and several CA metros have higher RPPs than NYC proper. Miami has surged recently.

**"The South is always cheap."** Not uniformly. Miami (RPP ~114) is among the most expensive metros nationally. Nashville, Austin, and Charlotte have risen significantly.

**"Cost of living only matters for low earners."** False. At $300K income, the difference between RPP 116 (SF) and RPP 92 (Indianapolis) is $78K in real purchasing power — enough to fund retirement contributions, college savings, AND lifestyle improvements.

**"Remote work eliminates COL concerns."** Partially true. If your company doesn't apply location adjustments, remote work in a low-RPP area is the ultimate salary optimizer. But many companies now apply geo-bands.

---

## Integration with BLS Wage Data

The Wayfinder knowledge base contains BLS wage data by state and metro for 315 occupations. When combining BLS wages with RPP data:

**Adjusted Median = BLS Median × (100 / Metro RPP)**

This reveals where specific occupations pay best in real terms. Software developers in Austin (nominal $120K, RPP ~99 → real $121K) may outperform the same role in SF (nominal $160K, RPP ~116 → real $138K) when factoring in quality of life, housing costs, and state income tax (TX: 0% vs CA: ~9%).

---

## Data Coverage

- **51 states/territories** with all-items RPP, goods, services, and housing sub-indices
- **387 metropolitan statistical areas** with all-items RPP
- **Source**: BEA Regional Price Parities, latest available year
- **Refresh**: Annual (BEA releases new RPP data each December)
- **Methodology**: Based on CPI pricing data across ~400 categories of goods and services
