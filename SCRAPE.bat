@echo off
cd /d "%~dp0"
echo.
echo  Wayfinder - Running Data Scrapers
echo  ===================================
echo  This pulls fresh career data from BLS, O*NET, NCES, and more.
echo  Takes a few minutes...
echo.
call npm run scrape
echo.
echo  Done! Now ingesting into knowledge base...
echo.
call npm run ingest
echo.
echo  ===================================
echo  Knowledge base updated!
echo  Restart Wayfinder (START.bat) to use the new data.
echo  ===================================
pause
