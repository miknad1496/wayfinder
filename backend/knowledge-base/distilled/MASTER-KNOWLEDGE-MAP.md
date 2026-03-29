# Wayfinder Knowledge Base — Master Knowledge Map

## Architecture Summary

| Metric | Value |
|--------|-------|
| **Total Brain Files** | 87 (67 root + 20 essay-deep) |
| **Total Size** | ~3.2 MB (2.0 MB root + 1.14 MB essay-deep) |
| **Domain Coverage** | 7 domains |
| **Named Institutions with Full DNA** | 55+ (undergrad) + 40+ (graduate/professional) |
| **Last Updated** | March 20, 2026 |

---

## DOMAIN 1: ADMISSIONS STRATEGY (18 files, ~530 KB)

*The core college admissions intelligence layer — from school selection through post-decision recovery.*

### Primary Brains

| File | Size | Purpose | Key Cross-References |
|------|------|---------|---------------------|
| `admissions-brain.md` | 7.8 KB | Master routing brain — entry point for all admissions queries | All admissions files |
| `admissions-strategic-playbook.md` | 21.8 KB | ED/EA/RD strategy, application timing, school list architecture | `institutional-dna-*`, `admissions-ed-strategy-calibration` |
| `admissions-ed-strategy-calibration.md` | 20.9 KB | Early Decision calibration — when to deploy ED vs. EA | `admissions-strategic-playbook`, `institutional-dna-*` |
| `admissions-school-selection-intelligence.md` | 26.6 KB | School list construction — reach/match/safety framework | `roi-engine`, `institutional-dna-*` |
| `admissions-data-synthesis.md` | 27.1 KB | Acceptance rate trends, yield data, institutional behavior patterns | `admissions-strategic-playbook` |

### Specialized Modules

| File | Size | Purpose | Key Cross-References |
|------|------|---------|---------------------|
| `admissions-extracurricular-differentiation-strategy.md` | 32.8 KB | Qualitative EC evaluation — commoditization cycle, performed vs. demonstrated | `extracurricular-spike` (quantitative scoring layer) |
| `admissions-adversity-landscape-intelligence.md` | 27.2 KB | Post-SFFA adversity framing, demographic context | `feeder-school-diagnostic`, `audience-first-gen` |
| `admissions-diversity-school-profiling.md` | 43.4 KB | School diversity profiles, demographic data | `admissions-school-selection-intelligence` |
| `admissions-curriculum-synthesis.md` | 42.7 KB | Course rigor analysis — AP/IB/DE evaluation | `feeder-school-diagnostic` |
| `admissions-essay-intelligence.md` | 27.3 KB | Essay strategy routing brain — connects to essay-deep | `essay-brain`, all essay-deep files |
| `admissions-pre-highschool-planning.md` | 36.2 KB | 8th-9th grade positioning, course selection pipeline | `admissions-curriculum-synthesis` |
| `admissions-parent-strategy-guide.md` | 29.1 KB | Parent-facing strategy communication | `admissions-parent-adult-children` |
| `admissions-parent-adult-children.md` | 35.9 KB | Adult/non-traditional applicant strategy | `transfer-strategy` |

### Recovery & Alternative Pathways

| File | Size | Purpose | Key Cross-References |
|------|------|---------|---------------------|
| `waitlist-recovery.md` | 12.3 KB | LOCI protocol, deferral response, Material Update Threshold | `institutional-dna-*`, `extracurricular-spike`, `compliance-brain` |
| `transfer-strategy.md` | 12.9 KB | CC-to-Elite pipeline, transfer ROI framework, application differences | `roi-engine`, `institutional-dna-*`, `financial-aid-brain` |
| `international-student-brain.md` | 28.0 KB | Visa, credential evaluation, international-specific strategy | `financial-aid-brain` |

---

## DOMAIN 2: INSTITUTIONAL INTELLIGENCE (9 files, ~370 KB)

*School-specific DNA files — the "Easter Eggs" layer. Covers 55+ named undergraduate institutions and 40+ graduate/professional programs.*

| File | Size | Purpose | Key Cross-References |
|------|------|---------|---------------------|
| `institutional-dna-top7.md` | 26.4 KB | Stanford, Harvard, MIT, Yale, Princeton, Columbia, UChicago — Hidden Ask, essay decoding, Value Indicator | `roi-engine`, `essay-school-specific-decoding` |
| `institutional-dna-next10.md` | 37.9 KB | UPenn, Caltech, Duke, Hopkins, Northwestern, Brown, Dartmouth, Cornell, Rice, Notre Dame — 2025-26 verified essay prompts, Value Indicator | `roi-engine`, `essay-school-specific-decoding` |
| `institutional-dna-next20.md` | 97.8 KB | Georgetown, WashU, Emory, USC, Tufts, UVA, Michigan, UNC, CMU, Georgia Tech, NYU, BC, UCLA, UC Berkeley, Villanova, Wake Forest, BU, UF, Wisconsin, UT Austin | `roi-engine`, `extracurricular-spike`, `feeder-school-diagnostic`, `financial-aid-brain`, `compliance-brain` |
| `institutional-dna-value-tier.md` | 69.0 KB | Lehigh, Rochester, CWRU, Tulane, Northeastern, Pepperdine, Purdue, Virginia Tech, Colorado Mines, RPI, UC Irvine, UCSD, UC Davis, UW Seattle, Ohio State, Penn State, Rutgers, Maryland — the T41-T60 ROI anchors | `roi-engine` (Smart Money + Efficiency Outliers), `financial-aid-brain`, `compliance-brain` |
| `grad-school-institutional-dna.md` | 19.0 KB | T14 Law (Yale, Stanford, Harvard + full T14 table), T10 Med (HMS, Hopkins + full T10 table), Top PhD by field (CS, Econ, Bio, Humanities warning), MPP/MPA programs (HKS, Princeton SPA, Columbia SIPA, Chicago Harris, Georgetown McCourt, Michigan Ford, Berkeley Goldman) | `graduate-admissions-brain`, `framework-grad-school`, `roi-engine`, `compliance-brain` |
| `school-list-builder.md` | 29.0 KB | **THE ORCHESTRATION BRAIN** — 3-Filter Logic Gate (Fit + Context + ROI), 2-2-2-2-2 Output Format, Decision Tree, Edge Cases. The CPU that assembles all other brains into a personalized 10-school list | ALL brain files (see MODULE 7 cross-reference map) |
| `athletic-recruitment-brain.md` | 15.0 KB | NCAA D1/D2/D3/NAIA division structure, Ivy League Academic Index calculation, recruitment timeline by grade, sport-specific scholarship limits, how recruitment modifies the school-list-builder 2-2-2-2-2 framework, NCAA eligibility requirements | `school-list-builder`, `test-prep-strategic-brain`, `institutional-dna-*`, `financial-aid-brain`, `compliance-brain` |
| `k12-metro-intelligence.md` | 52.0 KB | 15-metro GT/magnet/feeder intelligence: NYC, Bay Area, LA, DC/NoVA, Chicago, Houston/DFW, Boston, Atlanta, Philadelphia, Miami, Denver, Research Triangle, Minneapolis, Seattle, Phoenix. NCES Data Query Protocol for SLM school lookups. State residential STEM academy inventory | `feeder-school-diagnostic`, `essay-deep/cogat-master-brain`, `essay-deep/elementary-school-master-brain`, `admissions-pre-highschool-planning`, `compliance-brain` |
| `feeder-school-diagnostic.md` | 17.7 KB | 3-Tier High School Rigor Model, NCES/CRDC variables, contextual multiplier | `extracurricular-spike` (anti-bias adjustments), `admissions-adversity-landscape-intelligence` |

---

## DOMAIN 3: ESSAY INTELLIGENCE (27 files, ~1.08 MB)

*The largest single domain — comprehensive essay strategy from diagnostics through final polish.*

### Root-Level Essay Brains

| File | Size | Purpose | Key Cross-References |
|------|------|---------|---------------------|
| `essay-brain.md` | 18.4 KB | Master essay routing brain | All essay files |
| `essay-structural-architecture.md` | 40.2 KB | Narrative structures — "architecture before prose" framework | `essay-voice-authenticity-intelligence` |
| `essay-voice-authenticity-intelligence.md` | 28.6 KB | Voice development, authenticity markers, cliché detection | `essay-structural-architecture` |
| `essay-differentiation-intelligence.md` | 43.7 KB | What makes an essay stand out — differentiation taxonomy | `extracurricular-spike` |
| `essay-revision-methodology.md` | 39.1 KB | Revision protocol — iterative editing framework | `essay-structural-architecture` |
| `essay-school-specific-decoding.md` | 38.6 KB | Supplemental essay decoding — "what they're really asking" | `institutional-dna-*` |

### Essay-Deep Subdirectory (20 files, 1.14 MB)

| File | Size | Purpose |
|------|------|---------|
| `essay-deep/cogat-master-brain.md` | 112.2 KB | CogAT test preparation intelligence |
| `essay-deep/elementary-school-master-brain.md` | 106.9 KB | Elementary school positioning strategy |
| `essay-deep/middle-school-master-brain.md` | 91.4 KB | Middle school preparation intelligence |
| `essay-deep/sat-act-master-brain.md` | 88.9 KB | SAT/ACT deep strategy (complements `test-prep-strategic-brain`) |
| `essay-deep/essay-edge-case-coaching.md` | 82.1 KB | Edge case essay coaching — unusual situations |
| `essay-deep/essay-diagnostic-decision-tree.md` | 62.1 KB | Diagnostic tree for essay type selection |
| `essay-deep/essay-process-timeline.md` | 60.8 KB | Essay writing timeline — month-by-month schedule |
| `essay-deep/essay-supplement-type-mastery.md` | 60.3 KB | Supplement types — "Why Us," "Community," "Challenge," etc. |
| `essay-deep/essay-diagnostic-failure-patterns.md` | 59.2 KB | Common failure patterns — what kills essays |
| `essay-deep/rec-letter-strategy-brain.md` | 50.5 KB | Recommendation letter strategy — who to ask, how to prep |
| `essay-deep/essay-coaching-demonstrations.md` | 50.1 KB | Before/after coaching demonstrations |
| `essay-deep/essay-scoring-calibration.md` | 48.5 KB | AO scoring calibration — how essays are actually evaluated |
| `essay-deep/essay-emerging-trends-2026.md` | 47.4 KB | 2026 essay trend analysis |
| `essay-deep/essay-post-sffa-adversity-intelligence.md` | 44.7 KB | Post-SFFA adversity and identity essay intelligence |
| `essay-deep/vocab-retention-hacker-brain.md` | 43.9 KB | Vocabulary retention strategies for test prep |
| `essay-deep/essay-ecosystem-strategy.md` | 41.2 KB | Full-application essay ecosystem strategy |
| `essay-deep/essay-ao-insider-intelligence.md` | 40.5 KB | AO insider intelligence — how admissions offices work |
| `essay-deep/essay-ai-landscape-2026.md` | 31.6 KB | AI detection landscape and essay authenticity |
| `essay-deep/essay-ao-reading-simulation.md` | 26.4 KB | Simulating the AO reading experience |
| `essay-deep/essay-technique-before-after-library.md` | 20.8 KB | Technique library with before/after examples |

---

## DOMAIN 4: TEST PREPARATION (2 files, ~112 KB)

| File | Size | Purpose | Key Cross-References |
|------|------|---------|---------------------|
| `test-prep-strategic-brain.md` | 22.8 KB | DSAT adaptive mechanics, PSAT→NM pipeline, 50-state cutoffs, NM full-ride table, calculator/reading strategy | `roi-engine` (NM→merit stacking), `feeder-school-diagnostic` |
| `essay-deep/sat-act-master-brain.md` | 88.9 KB | Deep SAT/ACT strategy — section-by-section mastery | `test-prep-strategic-brain` |

---

## DOMAIN 5: FINANCIAL STRATEGY (6 files, ~174 KB)

*Financial aid mechanics, ROI analysis, and cost optimization.*

| File | Size | Purpose | Key Cross-References |
|------|------|---------|---------------------|
| `financial-aid-brain.md` | 27.6 KB | FAFSA, CSS Profile, aid negotiation, expected family contribution | `roi-engine` |
| `roi-engine.md` | 16.9 KB | Smart Money Table, Efficiency Outliers, Brand-to-Value Pivot, merit arbitrage | `financial-aid-brain`, `test-prep-strategic-brain`, `institutional-dna-*` |
| `roi-college-alternatives.md` | 48.2 KB | Full alternative pathway ROI — CC, gap year, trade school, military | `transfer-strategy`, `pathway-non-degree` |
| `roi-bootcamps.md` | 43.5 KB | Coding bootcamp ROI analysis — providers, outcomes, cost | `roi-certifications`, `pathway-tech-transitions` |
| `roi-certifications.md` | 27.2 KB | Professional certification ROI — AWS, CPA, PMP, etc. | `roi-bootcamps`, `career-brain` |
| `extracurricular-spike.md` | 12.5 KB | 4-Tier Activity Impact Scale with anti-bias mechanism (financial domain via socioeconomic context adjustments) | `feeder-school-diagnostic`, `admissions-extracurricular-differentiation-strategy` |

---

## DOMAIN 6: CAREER INTELLIGENCE (14 files, ~445 KB)

*Industry landscapes, career pathway analysis, and professional development playbooks.*

### Industry Intelligence

| File | Size | Purpose | Key Cross-References |
|------|------|---------|---------------------|
| `career-brain.md` | 32.5 KB | Master career routing brain — entry point | All career/pathway files |
| `intel-tech-landscape.md` | 27.9 KB | Tech industry map — FAANG, startups, enterprise | `pathway-tech-transitions`, `roi-bootcamps` |
| `intel-finance-careers.md` | 17.2 KB | Finance career map — IB, PE, VC, wealth management | `roi-engine` (brand-dependent careers) |
| `intel-healthcare-careers.md` | 27.5 KB | Healthcare career map — MD, nursing, PA, allied health | `roi-engine` (brand-independent careers) |
| `intel-government-federal.md` | 44.8 KB | Government/federal career intelligence | `pathway-non-degree` |
| `intel-trades-renaissance.md` | 47.0 KB | Skilled trades intelligence — the anti-college pathway | `roi-college-alternatives`, `pathway-non-degree` |
| `synthesis-bls-insights.md` | 45.6 KB | BLS data synthesis — employment projections, wage data | All career files |

### Pathway & Framework Files

| File | Size | Purpose | Key Cross-References |
|------|------|---------|---------------------|
| `pathway-ai-disruption-map.md` | 27.8 KB | AI disruption by career — automation risk assessment | `intel-tech-landscape` |
| `pathway-career-pivots-30s.md` | 67.4 KB | Career pivot strategy for 30s professionals | `audience-career-changer` |
| `pathway-non-degree.md` | 40.3 KB | Non-degree pathways — apprenticeships, certifications, military | `roi-college-alternatives`, `intel-trades-renaissance` |
| `pathway-stem-vs-non-stem.md` | 38.9 KB | STEM vs. non-STEM pathway analysis | `roi-engine` |
| `pathway-tech-transitions.md` | 37.3 KB | Tech career transition framework | `roi-bootcamps`, `intel-tech-landscape` |
| `framework-salary-negotiation.md` | 21.4 KB | Salary negotiation playbook | `framework-job-offer-evaluation` |
| `framework-job-offer-evaluation.md` | 41.3 KB | Job offer evaluation framework — total comp analysis | `framework-salary-negotiation` |

---

## DOMAIN 7: SYSTEM & AUDIENCE LAYER (11 files, ~270 KB)

*Core reasoning, compliance, conversation patterns, and audience-specific overlays.*

### Core System Files

| File | Size | Purpose | Key Cross-References |
|------|------|---------|---------------------|
| `general-brain.md` | 21.9 KB | General-purpose routing brain — master entry point | All files |
| `core-reasoning-principles.md` | 31.4 KB | SLM reasoning architecture — how to think, not what to think | All files |
| `core-conversation-patterns.md` | 34.4 KB | Conversation management — tone, pacing, escalation | All files |
| `compliance-brain.md` | 16.1 KB | **THE SHIELD** — legal compliance, disclaimer protocols, liability gates | All files (mandatory cross-reference) |

### Audience Overlays

| File | Size | Purpose | Key Cross-References |
|------|------|---------|---------------------|
| `audience-first-gen.md` | 19.7 KB | First-generation college student overlay | `feeder-school-diagnostic`, `financial-aid-brain`, `admissions-adversity-landscape-intelligence` |
| `audience-high-school-undecided.md` | 14.0 KB | Undecided high school student overlay | `framework-major-selection`, `admissions-school-selection-intelligence` |
| `audience-career-changer.md` | 21.3 KB | Career changer overlay | `pathway-career-pivots-30s`, `roi-bootcamps` |

### Professional Development Playbooks

| File | Size | Purpose | Key Cross-References |
|------|------|---------|---------------------|
| `playbook-interview.md` | 54.3 KB | Interview preparation playbook | `career-brain` |
| `playbook-first-job.md` | 17.7 KB | First job navigation | `career-brain`, `playbook-networking` |
| `playbook-networking.md` | 15.4 KB | Professional networking strategy | `playbook-first-job` |
| `synthesis-community-wisdom.md` | 28.1 KB | Community-sourced wisdom — Reddit, forums, practitioner insights | All files |

### Graduate/Professional School

| File | Size | Purpose | Key Cross-References |
|------|------|---------|---------------------|
| `graduate-admissions-brain.md` | 22.3 KB | Graduate school admissions strategy — MBA, JD, MD, PhD | `framework-grad-school` |
| `framework-grad-school.md` | 15.9 KB | Graduate school decision framework — when/whether to go | `graduate-admissions-brain`, `roi-engine` |
| `framework-major-selection.md` | 18.2 KB | Major selection framework | `pathway-stem-vs-non-stem`, `roi-engine` |

---

## CROSS-REFERENCE DENSITY MAP

The following files are referenced by the most other brains (highest interconnection):

| File | Inbound References | Role |
|------|-------------------|------|
| `compliance-brain.md` | ALL files | Universal compliance gate |
| `roi-engine.md` | 12+ files | Financial decision backbone |
| `school-list-builder.md` | 44+ files | Orchestration CPU — references ALL brains |
| `institutional-dna-*` (6 files) | 10+ files | School-specific intelligence (undergrad + grad) |
| `feeder-school-diagnostic.md` | 6+ files | Socioeconomic context provider |
| `extracurricular-spike.md` | 5+ files | Activity scoring engine |
| `financial-aid-brain.md` | 8+ files | Aid mechanics provider |
| `career-brain.md` | 10+ files | Career routing hub |

---

## FILE NAMING CONVENTION

| Prefix | Meaning | Count |
|--------|---------|-------|
| `admissions-` | College admissions strategy | 13 |
| `essay-` / `essay-deep/` | Essay intelligence | 27 |
| `intel-` | Industry intelligence | 5 |
| `pathway-` | Career pathway analysis | 5 |
| `roi-` | Return on investment analysis | 4 |
| `framework-` | Decision frameworks | 4 |
| `playbook-` | Tactical playbooks | 3 |
| `audience-` | Audience-specific overlays | 3 |
| `core-` | System reasoning layer | 2 |
| `synthesis-` | Data synthesis | 2 |
| `institutional-dna-` | School-specific DNA | 5 |
| (standalone) | Specialized brains (athletic-recruitment, k12-metro, etc.) | 10 |
