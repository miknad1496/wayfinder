@echo off
cd /d "%~dp0"
echo.
echo  ==========================================
echo   WAYFINDER DEPLOY - Commit + Push to Render
echo  ==========================================
echo.

git add backend/services/auth.js backend/routes/admin.js frontend/admin-dashboard.html DEPLOY.bat
echo.
echo  Staged files:
git diff --cached --name-only
echo.

git commit -m "Add All Users table to admin dashboard with join dates and invite stats"

if %ERRORLEVEL% NEQ 0 (
    echo  Nothing new to commit - pushing existing changes...
)

echo.
echo  Pushing main to origin...
echo.

git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo  ==========================================
    echo   PUSHED - Render auto-deploy triggered
    echo   Wait ~2-3 min then check admin dashboard
    echo  ==========================================
) else (
    echo.
    echo   PUSH FAILED - check git auth / network
)

echo.
pause
