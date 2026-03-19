@echo off
echo ==========================================
echo   Wayfinder Expanded Data Pipeline
echo ==========================================
echo.

echo Step 1: Fetching College Scorecard data for 229 schools...
echo (Requires DATA_GOV_API_KEY in .env)
echo.
node backend/scrapers/expanded-admissions-scraper.js
if errorlevel 1 (
    echo.
    echo ERROR: Scorecard scrape failed. Check your DATA_GOV_API_KEY.
    pause
    exit /b 1
)

echo.
echo Step 2: Generating strategic intel (batch of 20)...
echo (Uses Claude Sonnet — ~$0.50 per batch of 20)
echo.
node backend/scrapers/strategic-intel-generator.js --batch-size=20 --start=0
echo.
echo Done! Check backend/data/scraped/ for results.
echo.
echo To continue generating intel for more schools, run:
echo   node backend/scrapers/strategic-intel-generator.js --batch-size=20 --start=20
echo   node backend/scrapers/strategic-intel-generator.js --batch-size=20 --start=40
echo   ... and so on
echo.
pause
