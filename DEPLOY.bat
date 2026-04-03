@echo off
cd /d "%~dp0"
echo.
echo  ==========================================
echo   WAYFINDER DEPLOY - Push to Render
echo  ==========================================
echo.

git status --short
echo.
echo  Pushing main to origin...
echo.

git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo  ==========================================
    echo   PUSHED - Render auto-deploy triggered
    echo   https://dashboard.render.com
    echo  ==========================================
) else (
    echo.
    echo   PUSH FAILED - check git auth / network
)

echo.
pause
