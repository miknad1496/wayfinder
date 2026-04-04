@echo off
echo Refreshing Wayfinder databases...
node backend/scrapers/db-refresher.js
echo Done!
pause
