# Wayfinder — AI Career Advisor

An AI-powered career guidance chatbot for pre-college and college students, built on Claude's API with a progressive knowledge system that gets smarter over time.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure your API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY from console.anthropic.com

# 3. Generate starter knowledge base
npm run ingest

# 4. Start the app
npm run dev

# 5. Open http://localhost:3000
```

## Architecture

```
wayfinder/
├── backend/
│   ├── server.js              # Express API server
│   ├── routes/
│   │   ├── chat.js            # Chat endpoint (calls Claude)
│   │   ├── feedback.js        # User feedback collection
│   │   └── admin.js           # Dashboard & management
│   ├── services/
│   │   ├── claude.js          # Claude API integration
│   │   ├── knowledge.js       # RAG retrieval engine
│   │   ├── storage.js         # Session & data persistence
│   │   └── ingest.js          # Knowledge base ingestion pipeline
│   ├── scrapers/
│   │   ├── bls-scraper.js     # Bureau of Labor Statistics
│   │   ├── onet-scraper.js    # O*NET career data
│   │   ├── nces-scraper.js    # College Scorecard earnings
│   │   ├── usajobs-scraper.js # Government careers & visa info
│   │   ├── certifications-scraper.js  # Professional certs
│   │   └── run-all.js         # Run all scrapers
│   └── knowledge-base/        # Ingested knowledge docs
├── frontend/
│   ├── index.html             # Chat UI
│   ├── src/app.js             # Chat logic & API calls
│   └── src/styles/main.css    # Styling
├── prompts/
│   └── wayfinder-system-prompt.txt  # The AI personality & instructions
└── scripts/
    └── setup.sh               # One-command setup
```

## How It Gets Smarter (Progressive Improvement)

Wayfinder uses three mechanisms to improve without model retraining:

1. **Growing Knowledge Base (RAG)** — Run scrapers to pull fresh data from BLS, O*NET, College Scorecard, and more. The retrieval engine automatically incorporates new documents.

2. **Feedback Loop** — Users rate responses (thumbs up/down). Low-rated conversations surface gaps in the knowledge base. Review them monthly, add new docs or update the system prompt.

3. **Prompt Versioning** — The system prompt in `prompts/wayfinder-system-prompt.txt` encodes all advisory logic. Edit it to fix patterns, add edge cases, and refine tone. This is surprisingly powerful.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in development |
| `npm run scrape` | Run all data scrapers |
| `npm run scrape:bls` | Scrape BLS Occupational Outlook only |
| `npm run scrape:onet` | Scrape O*NET career data only |
| `npm run scrape:nces` | Scrape College Scorecard only |
| `npm run scrape:usajobs` | Scrape government career data only |
| `npm run scrape:certifications` | Compile certification data |
| `npm run ingest` | Load scraped data into knowledge base |
| `npm run build` | Build frontend for production |
| `npm run start` | Start production server |

## Data Sources

1. **BLS Occupational Outlook Handbook** — Salary, growth, education for 300+ occupations
2. **O*NET Online** — Skills, interests, RIASEC model, detailed occupation profiles
3. **NCES College Scorecard** — Earnings by major and institution
4. **USAJobs / Government** — Federal pathways, GS pay scale, visa info, PSLF
5. **Professional Certifications** — CFA, CPA, CompTIA, AWS, Google, PMI, SHRM
6. **NACE** — Starting salary benchmarks, employer skill preferences

## API Endpoints

- `POST /api/chat` — Send a message, get a response
- `POST /api/chat/context` — Update user profile for a session
- `GET /api/chat/session/:id` — Get session info
- `POST /api/feedback` — Submit response feedback
- `GET /api/feedback/stats` — Feedback dashboard
- `GET /api/admin/dashboard` — System overview
- `POST /api/admin/reload-prompt` — Hot-reload system prompt
- `POST /api/admin/reload-knowledge` — Refresh knowledge cache

## Deployment

**Vercel (recommended for free hosting):**
1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

**Any Node.js host:**
1. `npm install && npm run build`
2. Set environment variables
3. `npm run start`

## Cost

- Claude API (Sonnet): ~$3/1M input tokens, ~$15/1M output tokens
- Typical conversation: ~2,000 input + 500 output tokens = ~$0.01 per exchange
- At 100 conversations/day: ~$30/month
- Vercel hosting: Free tier
- Domain: ~$12/year

## Monthly Improvement Workflow

1. **Week 1**: Review feedback dashboard (`GET /api/feedback/stats`). Read negative feedback comments.
2. **Week 2**: Run scrapers for fresh data (`npm run scrape && npm run ingest`).
3. **Week 3**: Update system prompt based on gaps found. Add new few-shot examples.
4. **Week 4**: Add new knowledge base documents for underserved topics.
