@echo off
cd /d "%~dp0"
echo.
echo  ==========================================
echo   WAYFINDER DEPLOY - Commit + Push to Render
echo  ==========================================
echo.

:: Stage changed files
git add backend/services/auth.js
git add DEPLOY.bat
echo.

:: Show what's being committed
echo  Staged files:
git diff --cached --name-only
echo.

:: Commit
git commit -m "Fix corrupted JSON crash: safe parse in all auth functions"

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
    echo   PUSHED SUCCESSFULLY
    echo.
    echo   IMPORTANT: Go to dashboard.render.com
    echo   Click: Manual Deploy ^> Clear build cache ^& deploy
    echo   This forces a full fresh rebuild.
    echo   Wait ~3 min then test at wayfinderai.org
    echo  ==========================================
) else (
    echo.
    echo   PUSH FAILED - check git auth / network
)

echo.
pause
