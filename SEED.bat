@echo off
echo.
echo  Creating Wayfinder admin invite codes...
echo.
cd /d "%~dp0"
node backend/scripts/seed-invites.js
echo.
pause
