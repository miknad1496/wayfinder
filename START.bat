@echo off
REM ══════════════════════════════════════════
REM  Wayfinder — One-Click Launcher
REM  Just double-click this file!
REM ══════════════════════════════════════════

cd /d "%~dp0"

echo.
echo  ====================================
echo   Wayfinder - Starting Up...
echo  ====================================
echo.

REM Create data directories if missing
if not exist "backend\data\sessions" mkdir "backend\data\sessions"
if not exist "backend\data\feedback" mkdir "backend\data\feedback"
if not exist "backend\data\scraped" mkdir "backend\data\scraped"
if not exist "backend\knowledge-base" mkdir "backend\knowledge-base"

REM Generate knowledge base if empty
dir /b "backend\knowledge-base\*.md" >nul 2>nul
if %errorlevel% neq 0 (
    echo Building knowledge base...
    cd backend
    call node services/ingest.js
    cd ..
    echo [OK] Knowledge base ready
)

echo.
echo  Opening http://localhost:3000 in your browser...
echo  Keep this window open! Press Ctrl+C to stop.
echo.

REM Open browser after short delay
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

REM Start the app
call npm run dev
