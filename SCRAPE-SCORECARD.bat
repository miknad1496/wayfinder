@echo off
echo ==========================================
echo  College Scorecard Data Scraper
echo  Pulls VERIFIED federal tuition data
echo ==========================================
echo.
echo This replaces ALL school data in financial-aid-db.json
echo with verified IPEDS data from the U.S. Dept of Education.
echo.

if defined SCORECARD_API_KEY (
    echo Using saved API key: %SCORECARD_API_KEY:~0,8%...
    echo.
) else (
    echo Paste your API key from https://api.data.gov/signup/
    echo Or just press Enter to use DEMO_KEY (slow, 30 req/hour^).
    echo.
    set /p SCORECARD_API_KEY="API Key: "
    if not defined SCORECARD_API_KEY set SCORECARD_API_KEY=DEMO_KEY
)

node backend/scrapers/college-scorecard-scraper.js
echo.
echo Done! Check backend\data\scraped\financial-aid-db.json
pause
