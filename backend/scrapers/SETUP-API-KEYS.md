# Wayfinder API Keys Setup

The scrapers work without API keys (using static data), but adding these free keys unlocks live data.

## 1. USAJobs API Key (free)
- Go to: https://developer.usajobs.gov/APIRequest/Index
- Enter your email and agree to terms
- You'll get an API key emailed to you instantly
- Add to your `.env` file:
  ```
  USAJOBS_API_KEY=your_key_here
  USAJOBS_EMAIL=your_email@example.com
  ```

## 2. Data.gov API Key (free) — for NCES College Scorecard
- Go to: https://api.data.gov/signup/
- Enter your name and email
- You'll get a key instantly
- Add to your `.env` file:
  ```
  DATA_GOV_API_KEY=your_key_here
  ```

## 3. No keys needed for:
- **BLS** — uses public web pages
- **O*NET** — uses public web pages
- **Certifications** — static curated data
- **Reddit** — uses public JSON API (no auth required)
- **HackerNews** — uses public Algolia search API (no auth required)

## Running the enhanced scrapers

1. Copy the new scraper files into `backend/scrapers/`:
   - `reddit-scraper.js`
   - `community-scraper.js`
   - Replace `run-all.js` with the new version

2. Run: `npm run scrape` or `SCRAPE.bat`

3. Upload the scraped data (from `backend/data/scraped/`) to Claude for intelligence synthesis

4. Claude builds the enhanced knowledge base → you push to GitHub → Render deploys
