@echo off
title Wayfinder Admissions Scraper
echo.
echo  ========================================
echo   Wayfinder Admissions Scraper
echo   College Scorecard + Curated Intel
echo  ========================================
echo.
echo  Starting admissions data scrape...
echo.

cd /d "%~dp0"
node backend/scrapers/run-admissions.js

echo.
echo  ========================================
echo   Done! You can close this window.
echo  ========================================
echo.
pause
