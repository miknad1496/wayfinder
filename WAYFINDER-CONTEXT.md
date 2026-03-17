# Wayfinder — Complete Project Context for Engine Development

## What Wayfinder Is

Wayfinder (wayfinderai.org) is an AI-powered dual-service platform for **career advising** and **college admissions consulting**. The core thesis: democratize the $5K-$10K private admissions consultant experience and high-quality career guidance that only well-resourced families currently access. Built by Dan Kim.

**Live at:** https://wayfinderai.org
**Repo:** github.com/miknad1496/wayfinder (private, `main` branch)
**Hosting:** Render (Starter plan, Node.js)
**Current commit:** `4dde6b6` (deployed and live as of March 17, 2026)

---

## Tech Stack

- **Backend:** Node.js/Express (ES modules), file-based JSON storage (no database)
- **Frontend:** Vanilla JavaScript, Vite build system
- **AI:** Anthropic Claude API (Sonnet for chat, Opus for distillation)
- **Payments:** Stripe (test mode currently)
- **Email:** Resend API (invite emails)
- **Auth:** bcryptjs password hashing, token-based sessions (30-day TTL)
- **Security:** Helmet v8 (CSP configured), express-rate-limit, compression
- **Hosting:** Render web service (auto-deploy on commit to `main`)

**Important build detail:** Render's build command is `cd backend && npm install && cd ../frontend && npm install --include=dev && npm run build`. Dependencies live in `backend/package.json` (NOT the root package.json). The start command is `cd backend && node server.js`.

---

## Architecture Overview

### The Brain: Three-Layer Knowledge System

Wayfinder's intelligence comes from a three-layer architecture defined in `backend/services/knowledge.js` (1487 lines):

**LAYER 1 — DISTILLED INTELLIGENCE (Primary Brain)**
- 35 Opus-synthesized markdown files in `backend/knowledge-base/distilled/`
- Organized into 15 category buckets (tech_careers, finance_careers, healthcare_careers, government_careers, trades_careers, career_transitions, education_decisions, admissions, local_schools, salary_negotiation, job_search, certifications, ai_impact, first_gen, data_synthesis)
- Each category has trigger keywords for routing and references specific distilled files
- Searched on every Engine query via targeted routing
- Boost factor: 2.0x (highest priority)

**LAYER 2 — BASE KNOWLEDGE (Fallback)**
- Hand-crafted markdown files in `backend/knowledge-base/` (root level)
- Files like `career-exploration-basics.md`, `salary-data-overview.md`, `top-certifications-students.md`
- Always included as fallback context
- Boost factor: 1.0x

**LAYER 3 — RAW DATA RESERVE (Deep-Dive)**
- Scraped JSON files in `backend/data/scraped/`
- Sources: O*NET occupations, BLS statistics, NCES earnings by major, certifications, Reddit career stories/salary/advice, college admissions data (49 schools), curriculum data, local schools (Seattle/Bellevue metro)
- Only accessed when specificity detection triggers (user asks specific quantitative or school-specific questions)
- ~99% of queries never touch this layer
- Boost factor: 0.6-1.0x depending on source

### Dual Brain System (Standard Mode)

For standard (non-engine) queries, Wayfinder uses a lightweight dual brain instead of full RAG:
- `career-brain.md` (~5,850 chars) — condensed career intelligence
- `admissions-brain.md` (~5,576 chars) — condensed admissions intelligence
- `general-brain.md` (~6,858 chars) — fallback if career brain not found
- Keyword routing determines which brain(s) to serve (~50% token savings vs full RAG)
- Strong admissions signals (school names, "admissions", "SAT", etc.) → admissions brain
- Weak signals ("college", "school") need 3+ co-occurrences to trigger admissions
- Cross-over queries get both brains with selective section inclusion

### Three-Stage Retrieval Pipeline (Engine Mode)

When Wayfinder Engine is activated (3 queries/day limit per user):

**Stage 0: Intent Classification**
Six intent types: `specific_lookup`, `comparison`, `strategic`, `financial`, `exploratory`, `personal`. Influences breadth of retrieval and number of results.

**Stage 1: Category Routing (zero cost, keyword-based)**
- Specific triggers weighted 4x, ambiguous triggers ("school", "college") weighted 1x
- Gate: needs ≥1 specific hit OR ≥3 ambiguous co-occurrences to activate a category
- Intent-aware breadth: comparison/financial intents include more categories; specific_lookup stays narrow
- Fallback to `data_synthesis` if no categories match (never dumps everything)

**Stage 1.5: Specificity Detection**
- Detects signals like "how much", "median", "acceptance rate", "requirements for", named entities
- 2+ signals = specific enough to drill into raw data (Layer 3)
- Intent lowers threshold: specific_lookup and comparison intents need only 1 signal

**Stage 2: Targeted Chunk Retrieval**
- Scores chunks by keyword overlap (exact match = 2pts, partial = 1pt, title match = 3pts)
- Applies boost factors (distilled 2.0x, base 1.0x, raw 0.6-1.0x)
- Returns top-K results (scales with conversation phase: 4 early, 6 mid, 8 deep)
- Total context capped at 32,000 chars

### Conversation Phase System

Defined in `backend/services/claude.js` (347 lines):

**Phase 1 — Context Building** (≤2 exchanges, no profile yet)
- Max tokens: 800
- Response: 150-250 words, warm, question at end
- No deep analysis nudges

**Phase 2 — Targeted Exploration** (≤6-8 exchanges)
- Max tokens: 1,200
- Response: 250-400 words, data-specific
- May nudge toward deeper analysis if profile built

**Phase 3 — Deep Analysis** (earned through conversation depth)
- Max tokens: 2,000
- Response: 400-600+ words, structured, comprehensive
- "The $10K consultant moment"

### Structured Analysis Frameworks

Three frameworks auto-inject when signal keywords are detected (≥2 signal hits):

1. **ROI Academic** — Signals: "roi", "worth it", "payoff", "cost benefit". Produces: investment summary, earnings trajectory, breakeven analysis, risk-adjusted ROI, alternative paths, forward trajectory, verdict.

2. **Forward Compensation** — Signals: "future salary", "projection", "earning potential". Produces: current state, graduation timeline, pipeline dynamics, supply/demand forecast, compensation projection (year 0-20), disruption factors, compounding skills premium.

3. **Perception vs Reality** — Signals: "myth", "actually", "overrated", "hype". Produces: popular perception, current reality, forward reality, the gap, who benefits from the perception, contrarian play, Wayfinder verdict.

---

## Distillation System

`backend/distillation/distill.js` with prompts defined in `backend/distillation/prompts.js` (1185 lines).

### 9 Prompt Layers, 28+ Prompts Total:

**Layer 1 — Career Pathway Maps** (5 prompts)
- pathway-tech-transitions, pathway-non-degree, pathway-career-pivots-30s, pathway-stem-vs-non-stem, pathway-ai-disruption-map

**Layer 2 — Decision Frameworks** (4 prompts)
- framework-major-selection, framework-salary-negotiation, framework-grad-school, framework-job-offer-evaluation

**Layer 3 — ROI Analysis** (3 prompts)
- roi-certifications, roi-bootcamps, roi-college-alternatives

**Layer 4 — Industry Intelligence** (5 prompts)
- intel-tech-landscape, intel-healthcare-careers, intel-finance-careers, intel-trades-renaissance, intel-government-federal

**Layer 5 — Real-World Playbooks** (3 prompts)
- playbook-first-job, playbook-networking, playbook-interview

**Layer 6 — Audience-Specific Guidance** (3 prompts)
- audience-high-school-undecided, audience-first-gen, audience-career-changer

**Layer 7 — Core Identity** (2 prompts)
- core-reasoning-principles (Wayfinder's soul — advisory philosophy, reasoning patterns, calibration guidelines, tone principles, anti-patterns)
- core-conversation-patterns (8 conversation flow scenarios)

**Layer 8 — Cross-Referenced Synthesis** (2 prompts, require scraped data injection)
- synthesis-bls-insights (interprets raw BLS data for career decision-making)
- synthesis-community-wisdom (extracts wisdom from Reddit/HN noise)

**Layer 9 — College Admissions Intelligence** (7 prompts)
- admissions-strategic-playbook (the $10K consultant playbook)
- admissions-school-selection-intelligence (tier analysis, major-school fit, geographic strategy)
- admissions-parent-strategy-guide (parent timeline by grade, money conversation, strategic playbook)
- admissions-essay-intelligence (how AOs read essays, Common App strategy, supplemental strategy)
- admissions-curriculum-synthesis (requires curriculum-data.json)
- admissions-data-synthesis (requires college-admissions.json)
- admissions-pre-highschool-planning (grades 5-9, non-consensus strategies)
- admissions-parent-adult-children (supporting 20-30 year olds, tax strategies, wealth transfer)

### Currently Distilled Files (35 files in knowledge-base/distilled/):
All 28+ prompts have been distilled. Total: ~22,091 lines across all distilled files. Plus three brain summary files:
- career-brain.md (5,850 chars)
- admissions-brain.md (5,576 chars)
- general-brain.md (6,858 chars)

---

## System Prompt

Located at `prompts/wayfinder-system-prompt.txt`. Defines:

1. **Identity & Role** — Wayfinder: warm, direct, data-driven mentor. Two tracks: career counseling + college admissions.
2. **User Detection** — 5 user types: Pre-College Student, Current College Student, Parent/Family, Advisor/Faculty, Career Explorer. Each has specific tone, focus, and key questions.
3. **Advisory Principles** — Core philosophy: FORWARD-LOOKING TRAJECTORIES. Not "what's hot now" but "where will this be in 2-6 years." 8 principles: data-grounded, multiple pathways, skills over titles, honest about uncertainty, credential-aware, equity-conscious, action-biased, trajectory-first.
4. **Knowledge Domains** — 11 career clusters + admissions.
5. **Conversation Playbooks** — 11 playbooks covering "I don't know what I want", "Should I major in X?", "How do I get into [career]?", "Is [career] good?", student loans, international students, advisors, school selection, application improvement, ED strategy, financial aid.
6. **Response Format** — Acknowledge → Provide data → Contextualize → Action step. 200-400 words standard.
7. **Three-Phase Conversation Arc** — Context Building → Targeted Exploration → Deep Analysis. Natural escalation, never mention "engine mode" to users.
8. **Context Documents** — `{RETRIEVED_CONTEXT}` placeholder replaced at runtime with RAG results.

---

## Scraped Data Sources (in backend/data/scraped/)

| File | Description |
|------|-------------|
| bls-occupations.json | Bureau of Labor Statistics occupation profiles |
| onet-occupations.json | O*NET detailed occupation profiles (tasks, skills, knowledge, wages) |
| nces-earnings-by-major.json | NCES earnings by college major (1yr, 4yr post-grad, percentiles) |
| certifications.json | Professional certification details (cost, time, ROI) |
| college-admissions.json | 49 schools: scorecard data + curated strategic intel |
| curriculum-data.json | Core requirements, major sequences, academic features for top schools |
| local-schools.json | Seattle/Bellevue metro K-12 (districts, private, public, middle, elementary) |
| reddit-salary-discussions.json | Reddit salary threads (score > 20) |
| reddit-career-stories.json | Reddit career transition stories (score > 10) |
| reddit-advice-threads.json | Reddit career advice threads (score > 50) |
| community-career-wisdom.json | Community career insights |
| community-hn-discussions.json | HackerNews career discussions |
| community-hn-hiring.json | HackerNews hiring threads |
| government-pathways.json | Government career pathway data |

---

## User System & Limits

- **Auth:** Email/password, bcryptjs hashing (12 rounds), 30-day token TTL
- **User types:** student, pre-college, advisor, general, parent/family, career explorer
- **Profile fields:** name, email, userType, school, interests, profile (age, gradeLevel, childGrade, targetSchools, favoriteClasses, careerInterests, aboutMe)
- **Engine limit:** 3 Wayfinder Engine queries per day per user
- **Token limit:** Daily token limits by plan (checked via `checkTokenUsage`)
- **Session:** History capped at 20 messages (10 exchanges), JSON file per session
- **Invites:** Invite-only registration, invite codes with expiration, unlimited invites for admin emails
- **Plans:** Tied to Stripe (test mode), affects token limits

---

## File Structure (Key Files)

```
wayfinder/
├── backend/
│   ├── package.json              ← RENDER USES THIS (not root)
│   ├── server.js                 ← Express app, Helmet CSP, routes
│   ├── services/
│   │   ├── knowledge.js          ← 1487 lines, 3-layer RAG engine
│   │   ├── claude.js             ← 347 lines, API calls, phase detection, frameworks
│   │   ├── auth.js               ← User auth, bcryptjs, token management
│   │   ├── invites.js            ← Invite code system
│   │   ├── email.js              ← Resend API for invite emails
│   │   ├── storage.js            ← File paths, session/feedback storage
│   │   ├── learn.js              ← Learning from interactions
│   │   └── ingest.js             ← Knowledge ingestion
│   ├── routes/
│   │   ├── chat.js               ← 233 lines, chat endpoint + engine limits
│   │   ├── auth.js               ← Registration, login, profile
│   │   ├── stripe.js             ← Checkout, webhooks, portal
│   │   ├── invites.js            ← Create/delete/list invites
│   │   ├── admin.js              ← Prompt reload, cache invalidation
│   │   └── feedback.js           ← User feedback
│   ├── knowledge-base/
│   │   ├── distilled/            ← 35 Opus-generated intelligence files + 3 brain files
│   │   ├── career-exploration-basics.md
│   │   ├── salary-data-overview.md
│   │   └── top-certifications-students.md
│   ├── data/
│   │   ├── scraped/              ← 14+ JSON/MD files from scrapers
│   │   ├── sessions/             ← Per-session JSON files
│   │   ├── users/                ← Per-user JSON files
│   │   └── feedback/             ← Feedback JSONL
│   ├── distillation/
│   │   ├── distill.js            ← Opus distillation runner
│   │   └── prompts.js            ← 1185 lines, 28+ distillation prompts across 9 layers
│   ├── scrapers/                 ← BLS, O*NET, NCES, Reddit, admissions, curriculum, local schools
│   └── scripts/
│       └── seed-invites.js       ← Create admin invite codes
├── frontend/
│   ├── package.json              ← Vite + frontend deps
│   ├── index.html
│   └── src/
│       └── app.js                ← Full frontend (vanilla JS)
├── prompts/
│   └── wayfinder-system-prompt.txt  ← The system prompt
├── render.yaml                   ← Render config (starter plan)
├── PUSH.bat                      ← Git push shortcut
├── SEED.bat                      ← Seed invite codes locally
└── package.json                  ← Root (for local dev only, NOT used by Render)
```

---

## Environment Variables (on Render)

- `ANTHROPIC_API_KEY` — Claude API key
- `CLAUDE_MODEL` — `claude-sonnet-4-6` (for standard chat)
- `CLAUDE_MODEL_ENGINE` — `claude-opus-4-6` (for paid-tier Engine pulls and essay reviews)
- `NODE_ENV` — `production`
- `RESEND_API_KEY` — Email sending
- `STRIPE_SECRET_KEY` — Stripe (test mode)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook verification
- `EMAIL_FROM` — Sender address (default: `Wayfinder <onboarding@resend.dev>`)
- `DATA_GOV_API_KEY` — College Scorecard API (optional, for live admissions data)

---

## Current State & What's Working

✅ Site is live at wayfinderai.org
✅ All 35 distilled intelligence files generated
✅ Dual brain system (career + admissions) operational
✅ 3-layer RAG with intent classification and specificity detection
✅ Conversation phase system with token budget scaling
✅ Analysis frameworks (ROI, Forward Compensation, Perception vs Reality)
✅ User auth with invite system
✅ Invite create/delete/copy-link all working
✅ Email invites via Resend
✅ Stripe integration (test mode)
✅ All scrapers functional (BLS, O*NET, NCES, Reddit, admissions, curriculum, local schools)
✅ Render deploy working (auto-deploy on commit)

---

## Pending / Future Work

- **Seed initial invites** on Render (can't use SEED.bat since data lives on Render's persistent disk)
- **Stripe live mode** — switch from test keys when ready for real payments
- **Custom email domain** — verify wayfinderai.org on Resend, set EMAIL_FROM
- **College Scorecard API** — add DATA_GOV_API_KEY for live admissions data
- **Engine/brain improvements** — the focus of this next session
- **Auto-deploy webhook** — investigate why Render didn't auto-deploy on recent pushes (had to manual deploy)
