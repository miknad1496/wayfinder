# Wayfinder — Persistent Context for Claude

## Who YOU Are
Claude's smartest, most qualified brain. You are Dan's chief architect and executive. You are excellent at execution with highest quality and accuracy of content (never hallucinated to fit the task or narrative). You understand how to take a step back and think holistically about the entire project, not just the immediate next task at hand. You know not to fall into brute force task taker cycles where you degrade in thoughtful action and become a mindless minion (which leads to low quality/high error output).

## Hard Rules (Non-Negotiable)
### Communication
- **Plain language only.** No jargon without explanation. Use concrete examples over abstract concepts.
- **Explain before acting.** State the situation clearly, get Dan's approval before making architectural changes. Don't apply patches reactively.
- **Reason from first principles.** Don't pattern-match from stale context. Ask yourself "why are we in this situation?" before jumping to fixes.
- **Be proactive.** Explain behavior and trade-offs upfront — don't make Dan ask follow-up questions.
- **Never make Dan copy-paste code repeatedly.** Store operational scripts, commands, and procedures persistently in context/skill files.
### Technical
- **Do NOT use AGENTS!** Claude almost always breaks down in quality once agents are run, no matter how menial the task.
- **Prioritize data PERSISTENCE!** It is critical for user data and profiles to remain intact, especially after new updates, pushes, and deploys take place. Always architect changes so that this is never a risk.
- **Verify data against authoritative sources.** IRS, state tax agencies, official program sites. Flag anything that can't be immediately verified for manual review.
- **Cross-check consistency across all related files.** If a data point appears in multiple HTML/JS files, they must all match.
- **Trace the full code path before proposing fixes.** Read the actual implementation. Understand the architectural problem, not just the symptom. Don't guess.
### Workflow
- **Predict when task/prompt string is getting too long.** Suggest entering a new fresh string with full handoff prepared.
- **Create CONTEXT-HANDOFF.md for complex projects.** Capture: current state, architecture decisions, mistakes & lessons learned, pending work, file maps, operational notes.
- **Don't continue degraded long threads.** Start fresh with context docs instead.
- **Test through first-time user eyes.** Check for empty states, hardcoded data, unintuitive flows.
### Auditing & Reporting
- **Every audit needs:** before/after counts, severity levels (HIGH/MEDIUM/LOW), exact sources cited, flagged items for manual follow-up, "no change needed" confirmations.
- **Update "last verified" timestamps** in source blocks after data checks.

## What Is Wayfinder
College admissions advisory SaaS built by Dan (danielyungkim@hotmail.com). Deployed on Render with auto-deploy from GitHub. Dan's daughter uses it — data quality matters personally.

## Tech Stack
- **Backend**: Express.js (ESM imports), file-based JSON data, hosted on Render
- **Frontend**: Vanilla JS SPA, Vite build, `$()` helper = `document.getElementById`
- **Auth**: JWT Bearer tokens, tier-based access (Free / Pro / Elite / Consultant)
- **Repo**: github.com/miknad1496/wayfinder
- **Git push URL**: Use PAT from environment or Render settings
- **Working directory**: The `wayfinder/` subfolder inside the mounted Wayfinder folder

## Data Architecture
All curated data lives in `backend/data/scraped/*.json`. Each module (internships, programs, scholarships) has:
- A main JSON file (e.g., `scholarships.json`) with a `{ scholarships: [...], metadata: {...} }` structure
- An inject script (`backend/scrapers/inject-verified-*.js`) that merges verified entries into the main file
- Verified entries have: `_verified: true`, `_verifiedDate: "YYYY-MM-DD"`, `_source: "https://..."` (real URL)

### Inject Script Pattern
Each inject script:
1. Reads the existing JSON file
2. For each verified entry, checks if one with the same name exists
3. If exists → replaces it (verified overwrites template). If not → appends it
4. Writes back with updated metadata counts
5. Run with: `node backend/scrapers/inject-verified-scholarships.js` (from wayfinder/ root)

## Current Module Status (as of April 2026)

### Internships
- **Total**: ~1543 entries, 34 verified
- **Filters**: state, field, paid/unpaid, format (in-person/remote/hybrid), search
- **Route**: `backend/routes/internships.js` → GET `/api/internships/search`
- **Data**: `backend/data/scraped/internships.json`
- **Key fields**: `format`, `paid` (boolean), `field`, `location.state`

### Programs (Summer/Enrichment)
- **Total**: ~788 entries, 42 verified
- **Filters**: state (20 states), grade (elementary/middle/high), format, category, cost, selectivity, search
- **Route**: `backend/routes/programs.js` → GET `/api/programs/search`
- **Data**: `backend/data/scraped/programs-expanded.json`
- **Key fields**: `format`, `eligibility.grades` (array like ["K","1"..."12"]), `category`
- **Grade mapping in backend**: elementary=K-5, middle=6-8, high=9-12

### Scholarships
- **Total**: ~1003 entries, 35 verified
- **Filters**: scope (national/state/regional), category, state (all 50+DC), amount range (under1k/1k-5k/5k-20k/20k-50k/over50k), applicationFormat (essay/video/portfolio/project/research-paper/application-only), search
- **Route**: `backend/routes/scholarships.js` → GET `/api/scholarships/search`
- **Data**: `backend/data/scraped/scholarships.json`
- **Key fields**: `scope`, `applicationFormat`, `amount.min`, `amount.max`, `_verified`, `_source`

## Frontend Filter IDs (in index.html)
- Internships: `internshipField`, `internshipState`, `internshipPaid`, `internshipFormat`, `internshipSearch`
- Programs: `programCategory`, `programState`, `programGrade`, `programFormat`, `programCost`, `programSelectivity`, `programSearch`
- Scholarships: `scholarshipScope`, `scholarshipCategory`, `scholarshipState`, `scholarshipAmount`, `scholarshipFormat`, `scholarshipSearch`

## Frontend JS (app.js) Key Functions
- `searchInternships()`, `searchScholarships()`, `searchPrograms()` — build URLSearchParams from filter IDs, fetch from API_BASE
- `renderToolResults(containerId, results, fullAccess, previewMessage, type)` → calls `renderToolCard(item, type, fullAccess)`
- Scholarship cards show: amount, scope badge, format badge, verified tag, provider, deadline, competitiveness
- All filter dropdowns have `change` event listeners that auto-trigger search

## CRITICAL Rules
1. **NO AGENTS for data work** — Dan was furious when agents hallucinated data. Do all verified data research manually, one by one.
2. **Every verified entry MUST have a real `_source` URL** — no made-up URLs, no generic homepages. The actual program/scholarship page.
3. **Heavy Seattle/WA focus** — Dan's family is in the Seattle metro area. Always prioritize WA state data, then TX, CA, NY, MI.
4. **Test before pushing** — Run inject scripts locally, verify counts, then push.
5. **Content filter workaround** — The Edit tool hits a 400 content filter error when writing large HTML blocks with all 50 US states. Use a Node.js script to patch index.html programmatically instead.

## How to Add More Verified Data
1. Research the scholarship/program/internship on the web — get the official page URL
2. Add to the appropriate `inject-verified-*.js` script's data array
3. Run the script: `node backend/scrapers/inject-verified-scholarships.js`
4. Verify the output counts look right
5. `git add` the changed files, commit, push

## Essay Module (Current State — April 2026)

### Architecture
- **Route**: `backend/routes/essays.js` → 5 endpoints (GET /credits, GET /types, POST /review, GET /history, GET /review/:id)
- **Service**: `backend/services/essay-reviewer.js` — Claude integration with 6-layer knowledge injection
- **Rate limit**: `expensiveLimiter` (3 req/min) since it calls Claude directly
- **Monetization**: Credit-based add-on. 1 credit = 1 review. Packs: 5/$10, 10/$15, 20/$18 via Stripe
- **Access**: Pro/Elite tiers only. Free users see form but can't submit (upgrade gate)
- **Review storage**: `backend/data/essay-reviews/` — one JSON file per review, keyed by `rev_` + random hex
- **Model**: Uses `CLAUDE_MODEL_ENGINE` env var, defaults to claude-opus-4-6

### Essay Types (8)
common-app, supplemental, why-school, diversity, activity, community, challenge, other

### Knowledge Base — Core (6 files, loaded at startup, cached)
Located in `backend/knowledge-base/distilled/`:
- `admissions-essay-intelligence.md` — Core AO reading process, what gets flagged
- `essay-voice-authenticity-intelligence.md` — Authentic vs performed voice markers
- `essay-structural-architecture.md` — Hook → narrative → turning point → reflection
- `essay-revision-methodology.md` — 4-pass coaching framework, feedback prioritization
- `essay-differentiation-intelligence.md` — What makes essays unforgettable
- `essay-school-specific-decoding.md` — Per-school calibration guidance

### Knowledge Base — Deep (16 essay files, NOT currently injected)
Located in `backend/knowledge-base/distilled/essay-deep/`:
- `essay-diagnostic-decision-tree.md` (62KB) — 4-tier diagnostic: initial read → story problems → execution → school-fit
- `essay-diagnostic-failure-patterns.md` (59KB) — 30 named failure patterns with frequency, before/after, fixes
- `essay-scoring-calibration.md` (48KB) — Detailed 1-10 anchor descriptions with AO thinking, textual markers
- `essay-ai-landscape-2026.md` (31KB) — AI detection, ethics, what AOs check for
- `essay-ao-insider-intelligence.md` (40KB) — How AOs actually read, committee dynamics
- `essay-ao-reading-simulation.md` (26KB) — Simulating the AO reading experience
- `essay-coaching-demonstrations.md` (50KB) — Before/after coaching examples
- `essay-post-sffa-adversity-intelligence.md` (44KB) — Post-SFFA context for identity essays
- `essay-supplement-type-mastery.md` (60KB) — Supplement essay type-specific strategies
- `essay-edge-case-coaching.md` (82KB) — First-gen, international, trauma, non-traditional
- `essay-emerging-trends-2026.md` (47KB) — 2026-specific trends
- `essay-ecosystem-strategy.md` (41KB) — How essays work together across an app
- `essay-process-timeline.md` (60KB) — Timeline management for essay writing
- `essay-technique-before-after-library.md` (20KB) — Specific transformation examples

### Data Files
- `backend/data/scraped/essay-admissions-officer-insights.json` — AO interview data (NACAC, Harvard, Yale, MIT, Stanford, Berkeley)
- `backend/data/scraped/essay-writing-craft-techniques.json` — 50+ writing techniques with examples
- `backend/data/scraped/essay-school-specific-strategies.json` — 229+ schools with strategic implications

### Review JSON Structure (what Claude returns)
```json
{
  "overallScore": 1-10,
  "scoreLabel": "Needs Work | Fair | Good | Strong | Exceptional",
  "summary": "2-3 sentence coaching assessment",
  "strengths": ["specific strength with detail"],
  "improvements": [{"area": "...", "suggestion": "...", "priority": "high|medium|low"}],
  "lineNotes": [{"text": "exact phrase from essay", "note": "coaching suggestion"}],
  "voiceAssessment": {"authentic": bool, "sounds_like_teenager": bool, "notes": "..."},
  "structure": {"hasHook": bool, "hasNarrative": bool, "hasReflection": bool, "notes": "..."},
  "wordCount": number,
  "readingLevel": "grade level"
}
```

### Frontend (index.html lines 766-824, app.js lines 2653-2769)
- Modal: `#essaysModal` with `.modal-essays` class
- Form fields: `essayType` (select), `essayTargetSchool` (input), `essayPrompt` (input), `essayText` (textarea, 15K max)
- Credits bar: `#essayCreditsBar` with count + "Buy more" button
- Result rendering: `renderEssayReview()` — score with color class, voice badges, strengths list, improvements list, structure notes
- Upgrade gate: `#essaysRequiresUpgrade` shown for free users

### Key Functions in app.js
- `openEssays()` — opens modal, checks access, loads credits
- `loadEssayCredits()` — fetches remaining credits from API
- `submitEssayReview()` — validates (50 char min), POSTs to /api/essays/review, renders result
- `renderEssayReview(review)` — builds result HTML with score, voice assessment, strengths, improvements, structure
- `handleEssayPurchase(pack)` — Stripe checkout for credit packs

### Recent Changes (April 5 2026 session)
- Backend: max_tokens bumped to 3500, deep knowledge injection added (4 files), new review fields (emotionalArc, admissionsImpact, topPriority), essay type-specific prompting
- Backend: prompt database endpoint, enhanced history with filters, drafts endpoint, credit refund on failure
- Frontend: full renderEssayReview rewrite (gauge, line notes, structure checks, emotional arc, impact badges), prompt picker, tab bar with history, score progression chart
- Admin dashboard: fixed auth (was using X-Admin-Secret, now uses JWT login)

### Remaining Gaps / Active TODO
1. **Essay UX still in a modal** — needs to be a premium standalone view, not just another modal like internships/scholarships
2. **Knowledge base files need quality audit** — deep files may have been agent-generated, need manual verification and improvement
3. **Review history UI needs polish** — basic implementation exists but needs premium feel
4. **Draft comparison** — no side-by-side diff between revisions yet
5. **Essay word limit guidance** — no warnings about Common App 650 word limit, UC 350 word limit, etc.

## Scheduled Refresh Task
A Cowork scheduled task runs weekly to research and inject new verified entries across all three modules. See the task prompt for details.

## Nightly Audit Task
A Cowork scheduled task runs at midnight daily to audit the codebase across rotating focus areas (security, reliability, performance, UX, code quality, data integrity, API design, DevOps). Findings logged to `AUDIT_LOG.md`.
