@echo off
echo ==========================================
echo  College Scorecard Data Scraper
echo  Pulls VERIFIED federal tuition data
echo ==========================================
echo.
echo This replaces ALL school data in financial-aid-db.json
echo with verified IPEDS data from the U.S. Dept of Education.
echo.
echo PREREQUISITE: Get a free API key from https://api.data.gov/signup/
echo Then add to your .env file: SCORECARD_API_KEY=your_key_here
echo.
echo The DEMO_KEY works but is rate-limited to 30 req/hour.
echo A real key allows 1000 req/hour.
echo.
pause
node backend/scrapers/college-scorecard-scraper.js
echo.
echo Done! Check backend/data/scraped/financial-aid-db.json
pause
