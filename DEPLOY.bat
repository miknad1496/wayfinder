@echo off
cd /d "%~dp0"
echo.
echo  ==========================================
echo   WAYFINDER DEPLOY - Commit + Push to Render
echo  ==========================================
echo.

git add backend/services/auth.js DEPLOY.bat
echo.
echo  Staged files:
git diff --cached --name-only
echo.

git commit -m "Add danielyungkim to VIP list for unlimited invites"

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
    echo   Wait ~2-3 min then test invites
    echo  ==========================================
) else (
    echo.
    echo   PUSH FAILED - check git auth / network
)

echo.
pause
