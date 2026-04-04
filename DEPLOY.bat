@echo off
cd /d "%~dp0"
echo.
echo  ==========================================
echo   WAYFINDER DEPLOY - Commit + Push to Render
echo  ==========================================
echo.

:: Stage the specific files we changed
git add frontend/src/app.js
git add backend/services/auth.js
git add backend/routes/stripe.js
git add backend/services/invites.js
git add backend/services/email.js
git add frontend/index.html
git add frontend/src/styles/main.css
git add frontend/privacy.html
git add frontend/terms.html
git add frontend/admin-dashboard.html
git add frontend/why.html
git add DEPLOY.bat
echo.

:: Show what's being committed
echo  Staged files:
git diff --cached --name-only
echo.

:: Commit
git commit -m "Fix invites (admin infinite, elite tier), email colors, auth + checkout fixes"

if %ERRORLEVEL% NEQ 0 (
    echo.
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
    echo   Wait ~2-3 min then test at wayfinderai.org
    echo   Check deploy status: https://dashboard.render.com
    echo  ==========================================
) else (
    echo.
    echo   PUSH FAILED - check git auth / network
)

echo.
pause
