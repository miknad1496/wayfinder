@echo off
REM ══════════════════════════════════════════
REM  Wayfinder — One-Click Setup (Windows)
REM ══════════════════════════════════════════
echo.
echo  ====================================
echo   Wayfinder Setup
echo  ====================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Install it from https://nodejs.org
    echo         Download the LTS version, install, then re-run this script.
    pause
    exit /b 1
)
echo [OK] Node.js found

REM Install dependencies
echo.
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed. Check your internet connection.
    pause
    exit /b 1
)
echo [OK] Dependencies installed

REM Create .env if it doesn't exist
if not exist .env (
    echo.
    echo Creating .env from template...
    copy .env.example .env >nul
    echo [ACTION REQUIRED] Open .env in a text editor and add your ANTHROPIC_API_KEY
    echo   Get your key at: https://console.anthropic.com/
) else (
    echo [OK] .env file exists
)

REM Create data directories
echo.
echo Creating data directories...
if not exist "backend\data\sessions" mkdir "backend\data\sessions"
if not exist "backend\data\feedback" mkdir "backend\data\feedback"
if not exist "backend\data\scraped" mkdir "backend\data\scraped"
if not exist "backend\knowledge-base" mkdir "backend\knowledge-base"
echo [OK] Directories created

REM Generate starter knowledge base
echo.
echo Generating starter knowledge base...
cd backend
call node services/ingest.js
cd ..

echo.
echo  ====================================
echo   Setup Complete!
echo  ====================================
echo.
echo  Next steps:
echo    1. Open .env and paste your ANTHROPIC_API_KEY
echo    2. Run: npm run dev
echo    3. Open: http://localhost:3000
echo.
echo  Optional:
echo    - Run scrapers: npm run scrape
echo    - Then ingest:  npm run ingest
echo.
pause
