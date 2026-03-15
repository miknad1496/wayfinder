@echo off
cd /d "%~dp0"
echo.
echo  Wayfinder - Rebuilding Knowledge Base
echo  =======================================
echo.
call npm run ingest
echo.
echo  Done! Restart Wayfinder (START.bat) to use updated knowledge.
pause
