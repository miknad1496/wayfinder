@echo off
title Wayfinder Career Scraper
echo.
echo  ========================================
echo   Wayfinder Career Scraper
echo   BLS, O*NET, NCES, Reddit, and more
echo  ========================================
echo.
echo  Starting career data scrape...
echo.

cd /d "%~dp0"
node backend/scrapers/run-career.js

echo.
echo  ========================================
echo   Done! You can close this window.
echo  ========================================
echo.
pause
