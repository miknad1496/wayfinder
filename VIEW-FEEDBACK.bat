@echo off
cd /d "%~dp0"
echo.
echo  Opening Wayfinder feedback dashboard...
echo  (Make sure Wayfinder is running first)
echo.
start http://localhost:3001/api/feedback/stats
start http://localhost:3001/api/admin/dashboard
pause
