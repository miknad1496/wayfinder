# Wayfinder v2 — Architecture Plan

## Product Vision

Two distinct products under one roof:

| | **Career Explorer** (Free) | **Admissions Coach Pro** ($20/mo) | **Admissions Coach Elite** ($40/mo) |
|---|---|---|---|
| **Identity** | General career/college Q&A | Your personal admissions strategist | Full consultant replacement |
| **Engine pulls** | 3/day | 20/day | 40/day |
| **Daily token cap** | 50,000 | 250,000 | 500,000 |
| **Monthly token cap** | — | 5,000,000 | 12,000,000 |
| **Invites** | 1 | 5 | 10 |
| **Demographics** | Preview (3 majors) | Full (100 schools, all majors) | Full + compare tool |
| **Decision dates** | ✗ | ✓ (99 schools) | ✓ + email reminders |
| **Admissions timeline** | ✗ | ✓ Personalized widget | ✓ + email nudges |
| **Internships DB** | ✗ | Preview (top 5) | Full (6 states + national) |
| **Scholarships DB** | ✗ | ✗ (preview teaser) | Full |
| **Programs/Activities DB** | ✗ | ✗ (preview teaser) | Full |
| **Email reminders** | ✗ | Decision dates only | Full (dates + deadlines + scholarships) |
| **Essay reviewer** | ✗ | Add-on purchase | Add-on purchase |

### Essay Reviewer Add-On (any paid tier)

Consumption-based, not subscription:

| Pack | Reviews | Price | Per-review |
|------|---------|-------|------------|
| Starter | 5 | $10 | $2.00 |
| Standard | 10 | $15 | $1.50 |
| Bulk | 20 | $18 | $0.90 |

---

## 1. Pricing & Tier Architecture

### 1.1 Database Schema Changes (auth.js)

```javascript
// Updated user object
{
  email, passwordHash, name, role,
  plan: 'free',                    // free | pro | elite
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  planExpiresAt: null,

  // Usage tracking
  engineUsesToday: 0,
  engineLastReset: 'YYYY-MM-DD',
  tokensUsedToday: 0,
  tokensUsedMonth: 0,
  tokenMonthReset: 'YYYY-MM',

  // Essay reviewer credits
  essayReviewsRemaining: 0,
  essayReviewsPurchased: [],       // [{pack, quantity, purchasedAt, stripePaymentId}]

  // Admissions profile (for timeline + reminders)
  admissionsProfile: {
    graduationYear: null,          // e.g. 2026
    targetSchools: [],             // [{name, unitId, deadline, decisionType}]
    intendedMajors: [],            // ['Computer Science', 'Data Science']
    state: null,                   // Home state (for internship filtering)
    reminderPreferences: {
      email: true,
      frequency: 'weekly',        // daily | weekly | monthly
      types: ['deadlines', 'decisions', 'scholarships']
    }
  },

  createdAt, lastLoginAt, consentedAt
}
```

### 1.2 Plan Limits (auth.js updates)

```javascript
function getPlanLimits(plan) {
  const limits = {
    free:  { enginePerDay: 3,  dailyTokens: 50000,   monthlyTokens: null,     invites: 1  },
    pro:   { enginePerDay: 20, dailyTokens: 250000,  monthlyTokens: 5000000,  invites: 5  },
    elite: { enginePerDay: 40, dailyTokens: 500000,  monthlyTokens: 12000000, invites: 10 },
  };
  return limits[plan] || limits.free;
}

// Feature access gates
function canAccess(plan, feature) {
  const access = {
    demographics_full:    ['pro', 'elite'],
    demographics_compare: ['elite'],
    decision_dates:       ['pro', 'elite'],
    admissions_timeline:  ['pro', 'elite'],
    internships_full:     ['elite'],
    internships_preview:  ['pro'],
    scholarships:         ['elite'],
    programs:             ['elite'],
    email_reminders:      ['pro', 'elite'],    // pro = decision dates only
    email_full_reminders: ['elite'],            // elite = everything
    essay_reviewer:       ['pro', 'elite'],     // requires purchased credits
  };
  return (access[feature] || []).includes(plan);
}
```

### 1.3 Stripe Products

Need to create in Stripe Dashboard:
- **Product: Admissions Coach Pro** → Price: $20/month recurring
- **Product: Admissions Coach Elite** → Price: $40/month recurring
- **Product: Essay Review - Starter** → Price: $10 one-time
- **Product: Essay Review - Standard** → Price: $15 one-time
- **Product: Essay Review - Bulk** → Price: $18 one-time

Env vars to add:
```
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_ELITE=price_xxx
STRIPE_PRICE_ESSAY_5=price_xxx
STRIPE_PRICE_ESSAY_10=price_xxx
STRIPE_PRICE_ESSAY_20=price_xxx
```

---

## 2. Email Reminder System

### 2.1 Using Resend (already configured)

Expand `backend/services/email.js` with new templates:

```
email.js
├── sendInviteEmail()          ← existing
├── sendDeadlineReminder()     ← NEW
├── sendDecisionDateAlert()    ← NEW
├── sendScholarshipReminder()  ← NEW
├── sendWeeklyDigest()         ← NEW
└── sendEssayReviewReady()     ← NEW
```

### 2.2 Reminder Scheduler

New file: `backend/services/scheduler.js`

Runs on server startup, checks every hour:
1. Query all pro/elite users with `admissionsProfile.targetSchools`
2. Cross-reference with decision dates database
3. Send reminders at configured intervals:
   - **7 days before** application deadline
   - **3 days before** application deadline
   - **1 day before** application deadline
   - **Day of** decision release
   - **Weekly digest** of upcoming dates (Mondays)

### 2.3 Reminder Data Model

New file: `backend/data/reminders/` (JSON file storage, consistent with existing pattern)

```javascript
// reminders/{userId}.json
{
  userId: 'xxx',
  email: 'user@example.com',
  reminders: [
    {
      id: 'rem_xxx',
      type: 'deadline',          // deadline | decision | scholarship | program
      schoolName: 'Harvard',
      date: '2026-01-01',
      description: 'Regular Decision deadline',
      notifiedAt: [],            // timestamps of sent reminders
      dismissed: false
    }
  ],
  preferences: {
    email: true,
    frequency: 'weekly',
    timezone: 'America/Los_Angeles'
  }
}
```

---

## 3. New Sidebar Tools

### Current sidebar (bottom):
```
📊 Demographics
⚡ Upgrade plan
👤 Dan Kim
```

### New sidebar (bottom):
```
📊 Demographics
🎯 Admissions Timeline    ← NEW (pro+)
🔍 Internships            ← NEW (preview pro / full elite)
🎓 Scholarships           ← NEW (preview pro / full elite)
🏆 Programs               ← NEW (preview pro / full elite)
✍️  Essay Reviewer          ← NEW (add-on, pro+)
⚡ Upgrade plan
👤 Dan Kim
```

Each tool follows the same modal pattern as Demographics:
- Click opens modal overlay
- Search/filter interface
- Free/Pro users see preview + upgrade teaser for locked features
- Data loaded from backend API

---

## 4. Admissions Timeline Widget

### 4.1 Concept

A personalized, interactive timeline that shows:
- Application deadlines for target schools
- Decision release dates
- Scholarship deadlines
- Recommended prep milestones (test dates, essay drafts, etc.)

### 4.2 User Flow

1. User opens Timeline tool → prompted to set up profile if empty
2. Profile setup: graduation year, target schools (search from demographics DB), intended majors, home state
3. System generates personalized timeline by cross-referencing:
   - Decision dates database (99 schools)
   - Scholarship deadlines (from scraper)
   - Standard admissions milestones
4. Timeline displayed as vertical scrollable view with color-coded categories
5. Email reminders auto-configured based on timeline events

### 4.3 API Routes

New file: `backend/routes/timeline.js`

```
POST /api/timeline/profile     — Save/update admissions profile
GET  /api/timeline/profile     — Get current profile
GET  /api/timeline/events      — Get personalized timeline events
POST /api/timeline/dismiss     — Dismiss/snooze a reminder
GET  /api/timeline/upcoming    — Next 7 days (for dashboard widget)
```

### 4.4 Frontend Component

```
┌─────────────────────────────────────────┐
│  🎯 Your Admissions Timeline            │
│  Graduation: 2026 · 5 target schools    │
├─────────────────────────────────────────┤
│                                         │
│  ── March 2026 ──────────────────────   │
│  🔴 Mar 15 · Harvard RD Deadline        │
│  🔴 Mar 15 · MIT RD Deadline            │
│  🟡 Mar 20 · Finish CommonApp essay     │
│                                         │
│  ── April 2026 ──────────────────────   │
│  🟢 Apr 1  · Harvard Decision Release   │
│  🟢 Apr 1  · Stanford Decision Release  │
│  🔵 Apr 5  · Gates Scholarship Deadline │
│  🟠 Apr 15 · Summer internship apps     │
│                                         │
│  ── May 2026 ─────────────────────────  │
│  🔴 May 1  · Enrollment Decision Day    │
│                                         │
└─────────────────────────────────────────┘
│  Color key:                             │
│  🔴 Deadline  🟢 Decision  🔵 Scholar  │
│  🟠 Internship  🟡 Milestone           │
└─────────────────────────────────────────┘
```

---

## 5. Essay Reviewer Tool

### 5.1 How It Works

1. User opens Essay Reviewer modal
2. Selects essay type: Common App, Supplemental, Why [School], Diversity, etc.
3. Pastes essay text (or uploads .txt/.docx — future)
4. Selects target school (optional, for supplemental context)
5. Clicks "Review" → uses 1 credit
6. Claude analyzes with specialized admissions essay prompt
7. Returns structured feedback:
   - Overall score (1-10)
   - Strengths (3-5 bullets)
   - Areas for improvement (3-5 bullets)
   - Specific line-by-line suggestions
   - Tone/voice assessment
   - "Does this sound like a 17-year-old?" authenticity check

### 5.2 API Routes

New file: `backend/routes/essays.js`

```
GET  /api/essays/credits        — Check remaining credits
POST /api/essays/purchase       — Buy credit pack (→ Stripe)
POST /api/essays/review         — Submit essay for review (costs 1 credit)
GET  /api/essays/history        — Past reviews
GET  /api/essays/review/:id     — Get specific review result
```

### 5.3 Credit System

```javascript
// On successful Stripe payment for essay pack:
user.essayReviewsRemaining += packSize;  // 5, 10, or 20
user.essayReviewsPurchased.push({
  pack: 'starter',           // starter|standard|bulk
  quantity: 5,
  price: 1000,               // cents
  purchasedAt: new Date(),
  stripePaymentId: 'pi_xxx'
});
```

---

## 6. Scraper Architecture

### 6.1 Design Principles

- **Intelligent, not just raw data**: Every scraper produces curated, searchable, categorized JSON
- **GitHub-hosted data**: All scraped data committed to repo, served via GitHub raw fallback (proven pattern from demographics)
- **Regular updates**: Cron job / manual trigger, data versioned with timestamps
- **Unified scraper framework**: Common base class for all scrapers

### 6.2 Scraper Framework

New directory: `backend/scrapers/`

```
backend/scrapers/
├── base-scraper.js            — Shared utilities (fetch, parse, rate-limit, retry)
├── internships/
│   ├── scraper.js             — Main internship scraper
│   ├── sources.js             — Data source URLs and configs
│   └── transform.js           — Raw → structured data transform
├── scholarships/
│   ├── scraper.js
│   ├── sources.js
│   └── transform.js
├── programs/
│   ├── scraper.js
│   ├── sources.js
│   └── transform.js
└── run-all.js                 — CLI: node run-all.js [--type internships]
```

### 6.3 Data Output Structure

All scrapers output to `backend/data/scraped/`:

```
backend/data/scraped/
├── ethnicity-demographics.json     ← existing (100 schools)
├── internships.json                ← NEW
├── scholarships.json               ← NEW
├── programs.json                   ← NEW
└── metadata.json                   ← NEW (last scrape times, counts)
```

---

## 7. Internships Database

### 7.1 Data Sources

**State-specific (WA, CA, TX, MI, NY, OR):**
- Handshake public postings (career services aggregator)
- State workforce development boards
- Indeed/LinkedIn API (if available) filtered by state
- University career center RSS feeds
- Government internship portals (USAJOBS for federal)

**National by field/major:**
- Major-specific professional associations
- Industry internship boards (e.g., GitHub jobs for tech, AMA for healthcare)
- Fortune 500 internship programs
- Startup internship aggregators

### 7.2 Data Schema

```javascript
// internships.json
{
  metadata: {
    lastScraped: '2026-03-17T00:00:00Z',
    totalCount: 2500,
    sources: ['handshake', 'indeed', 'usajobs', ...],
    states: ['WA', 'CA', 'TX', 'MI', 'NY', 'OR'],
    version: '1.0'
  },
  internships: [
    {
      id: 'intern_xxx',
      title: 'Software Engineering Intern',
      company: 'Amazon',
      location: { city: 'Seattle', state: 'WA', remote: false },
      type: 'summer',              // summer | semester | year-round
      paid: true,
      compensation: '$45/hr',
      field: 'Technology',          // Mapped to career categories
      majors: ['Computer Science', 'Software Engineering', 'Data Science'],
      deadline: '2026-04-15',
      startDate: '2026-06-15',
      endDate: '2026-09-15',
      description: '...',           // Truncated summary
      url: 'https://...',           // Application link
      requirements: {
        gpa: 3.0,
        year: ['junior', 'senior'],
        citizenship: 'any'
      },
      tags: ['FAANG', 'paid', 'housing-provided'],
      source: 'handshake',
      scrapedAt: '2026-03-17T00:00:00Z'
    }
  ],
  // Pre-computed indexes for fast filtering
  byState: { 'WA': [0, 5, 12, ...], 'CA': [1, 3, 7, ...] },
  byField: { 'Technology': [0, 1, ...], 'Healthcare': [2, 4, ...] },
  byMajor: { 'Computer Science': [0, 1, ...] }
}
```

### 7.3 API Routes

New file: `backend/routes/internships.js`

```
GET /api/internships/search?state=WA&field=Technology&major=CS&paid=true
GET /api/internships/featured          — Curated top picks
GET /api/internships/deadlines         — Upcoming deadlines
GET /api/internships/stats             — Counts by state/field
```

**Access control:**
- Pro: preview (top 5 results per query, no application links)
- Elite: full access (all results, direct links, export)
- Free: locked with teaser

---

## 8. Scholarships Database

### 8.1 Data Sources

- Fastweb API/scraping
- Scholarships.com
- College Board Scholarship Search
- Individual university merit scholarship pages
- Professional association scholarships
- State-specific grants (WA, CA, TX, MI, NY, OR)
- Minority/diversity-specific scholarships
- STEM-specific awards
- Athletic scholarships aggregators

### 8.2 Data Schema

```javascript
// scholarships.json
{
  metadata: {
    lastScraped: '2026-03-17T00:00:00Z',
    totalCount: 3000,
    totalValue: '$45,000,000',       // Aggregate available
    version: '1.0'
  },
  scholarships: [
    {
      id: 'schol_xxx',
      name: 'Gates Scholarship',
      provider: 'Bill & Melinda Gates Foundation',
      amount: { min: 0, max: 76000, type: 'full-ride' },  // full-ride | fixed | variable
      renewable: true,
      renewalYears: 4,
      deadline: '2026-09-15',
      eligibility: {
        gpa: 3.3,
        financialNeed: true,
        citizenship: ['us_citizen', 'permanent_resident'],
        ethnicity: ['any'],          // or specific groups
        year: ['senior'],
        states: ['all'],             // or specific states
        majors: ['any'],
        firstGeneration: false
      },
      category: ['merit', 'need-based', 'leadership'],
      description: '...',
      url: 'https://...',
      applicationProcess: 'Online application + essays + recommendations',
      tips: 'Strong emphasis on community service and leadership',
      competitiveness: 'very_high',  // low | medium | high | very_high
      source: 'fastweb',
      scrapedAt: '2026-03-17T00:00:00Z'
    }
  ],
  byCategory: { 'merit': [...], 'need-based': [...] },
  byState: { 'WA': [...], 'CA': [...] },
  byDeadlineMonth: { '09': [...], '10': [...] }
}
```

### 8.3 API Routes

New file: `backend/routes/scholarships.js`

```
GET /api/scholarships/search?state=WA&gpa=3.5&need=true&major=CS
GET /api/scholarships/featured         — High-value, upcoming deadline
GET /api/scholarships/deadlines        — Calendar view data
GET /api/scholarships/match            — AI-matched to user profile
GET /api/scholarships/stats            — Total available, by category
```

**Access control:**
- Elite only (full access)
- Pro: sees count + top 3 preview + teaser
- Free: locked entirely

---

## 9. Programs & Activities Database

### 9.1 Categories

**Leadership:**
- Student government programs
- Model UN
- Boys/Girls State
- Leadership summer institutes (e.g., HOBY, NSLC)

**Academic/Research:**
- RSI (Research Science Institute)
- PROMYS, ROSS, Hampshire (math)
- SSP (Summer Science Program)
- University pre-college programs

**Summer Programs:**
- Paid summer programs at top universities
- Free/scholarship-based programs
- STEM camps
- Arts/humanities programs

**Community/Service:**
- AmeriCorps youth
- Habitat for Humanity builds
- Environmental conservation programs
- Hospital volunteering programs

**Non-Traditional (smart picks):**
- Startup incubators for teens
- Gap year programs
- International exchange
- Apprenticeships and career exploration
- Open-source contribution programs (Google Summer of Code for HS)
- Research mentorship matching

### 9.2 Data Schema

```javascript
// programs.json
{
  metadata: {
    lastScraped: '2026-03-17T00:00:00Z',
    totalCount: 1500,
    categories: ['leadership', 'academic', 'summer', 'service', 'non-traditional'],
    version: '1.0'
  },
  programs: [
    {
      id: 'prog_xxx',
      name: 'Research Science Institute (RSI)',
      provider: 'MIT / CEE',
      category: 'academic',
      subcategory: 'research',
      type: 'summer',               // summer | year-round | weekend | online
      duration: '6 weeks',
      dates: { start: '2026-06-20', end: '2026-08-01' },
      location: { city: 'Cambridge', state: 'MA', onsite: true, remote: false },
      cost: { amount: 0, type: 'free', stipend: true },
      deadline: '2026-01-15',
      eligibility: {
        grades: ['11'],              // rising juniors
        gpa: null,                   // not specified
        age: { min: 15, max: 18 },
        citizenship: ['any'],
        states: ['all']
      },
      selectivity: 'extremely_selective',  // open | selective | highly | extremely
      acceptanceRate: '< 3%',
      admissionsImpact: 'very_high',      // how much this helps college apps
      description: '...',
      url: 'https://...',
      tags: ['STEM', 'research', 'prestigious', 'free', 'residential'],
      alumniNotable: 'Multiple Nobel laureates, Fields medalists',
      source: 'manual_curated',
      scrapedAt: '2026-03-17T00:00:00Z'
    }
  ],
  byCategory: { 'academic': [...], 'leadership': [...] },
  byState: { 'MA': [...], 'CA': [...] },
  byCost: { 'free': [...], 'paid': [...] },
  bySelectivity: { 'extremely_selective': [...] }
}
```

### 9.3 API Routes

New file: `backend/routes/programs.js`

```
GET /api/programs/search?category=academic&state=WA&cost=free&grade=11
GET /api/programs/featured            — Editor's picks, high-impact
GET /api/programs/deadlines           — Upcoming deadlines
GET /api/programs/impact              — Sorted by admissions impact
GET /api/programs/non-traditional     — Smart/unique picks
GET /api/programs/stats
```

---

## 10. Implementation Sequence

### Phase 1: Foundation (Week 1-2)
1. ✅ Update pricing tiers in auth.js (free → pro → elite)
2. ✅ Create new Stripe products/prices
3. ✅ Update frontend upgrade modal with new tiers
4. ✅ Add feature gating (canAccess function)
5. ✅ Add monthly token tracking
6. ✅ Update sidebar with new tool icons

### Phase 2: Timeline + Reminders (Week 2-3)
1. ✅ Build admissions profile API
2. ✅ Build timeline widget (frontend modal)
3. ✅ Expand email.js with reminder templates
4. ✅ Build scheduler service
5. ✅ Wire up decision dates → reminders

### Phase 3: Essay Reviewer (Week 3)
1. ✅ Build essay review API + Claude prompt
2. ✅ Build credit purchase flow (Stripe one-time)
3. ✅ Build essay reviewer modal (frontend)
4. ✅ Wire up to Stripe webhooks

### Phase 4: Scraper Framework + Internships (Week 3-4)
1. ✅ Build base scraper framework
2. ✅ Build internship scraper (6 states + national)
3. ✅ Build internship API routes
4. ✅ Build internship modal (frontend)
5. ✅ Commit data + GitHub fallback

### Phase 5: Scholarships + Programs (Week 4-5)
1. ✅ Build scholarship scraper
2. ✅ Build programs scraper
3. ✅ Build API routes for both
4. ✅ Build frontend modals
5. ✅ Wire up scholarship deadlines → reminder system

### Phase 6: Polish + Launch (Week 5-6)
1. ✅ Preview/teaser UX for locked features
2. ✅ Email templates for all reminder types
3. ✅ Update Why Wayfinder page
4. ✅ Test full upgrade flow
5. ✅ Production deploy + Stripe live mode

---

## 11. File Changes Summary

### New Files
```
backend/routes/timeline.js
backend/routes/essays.js
backend/routes/internships.js
backend/routes/scholarships.js
backend/routes/programs.js
backend/services/scheduler.js
backend/services/essay-reviewer.js
backend/scrapers/base-scraper.js
backend/scrapers/internships/scraper.js
backend/scrapers/internships/sources.js
backend/scrapers/internships/transform.js
backend/scrapers/scholarships/scraper.js
backend/scrapers/scholarships/sources.js
backend/scrapers/scholarships/transform.js
backend/scrapers/programs/scraper.js
backend/scrapers/programs/sources.js
backend/scrapers/programs/transform.js
backend/scrapers/run-all.js
backend/data/scraped/internships.json
backend/data/scraped/scholarships.json
backend/data/scraped/programs.json
backend/data/reminders/              (directory)
```

### Modified Files
```
backend/services/auth.js             — New tiers, canAccess(), monthly tokens, essay credits
backend/services/email.js            — Reminder templates, digest email
backend/routes/stripe.js             — Essay credit purchases, new price IDs
backend/server.js                    — Mount new routes
frontend/index.html                  — New modals, sidebar icons
frontend/src/app.js                  — New modal logic, tool handlers
frontend/why.html                    — Updated feature list
```

### Environment Variables to Add
```
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_ELITE=price_xxx
STRIPE_PRICE_ESSAY_5=price_xxx
STRIPE_PRICE_ESSAY_10=price_xxx
STRIPE_PRICE_ESSAY_20=price_xxx
```
