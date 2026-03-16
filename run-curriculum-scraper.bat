@echo off
title Wayfinder Curriculum Data
echo.
echo  Starting curriculum data generation...
echo.
cd /d "%~dp0"
node backend/scrapers/run-curriculum.js
pause
