@echo off
cd /d "%~dp0"
echo.
echo  ======================================================
echo   WAYFINDER KNOWLEDGE DISTILLATION
echo   Using Opus 4.6 to build Wayfinder's brain
echo  ======================================================
echo.
echo  This sends ~20 deep queries to Claude Opus 4.6 and stores
echo  the synthesized intelligence in the knowledge base.
echo.
echo  Estimated time: ~30 minutes
echo  Estimated cost: ~$3-5 in API usage
echo.
echo  Options:
echo    1. Run ALL prompts (full distillation)
echo    2. Resume (skip already-completed prompts)
echo    3. List prompts only (no API calls)
echo    4. Cancel
echo.
set /p choice="  Choose (1-4): "

if "%choice%"=="1" (
    echo.
    echo  Starting full distillation...
    echo.
    node backend/distillation/distill.js
) else if "%choice%"=="2" (
    echo.
    echo  Resuming distillation - skipping completed...
    echo.
    node backend/distillation/distill.js --resume
) else if "%choice%"=="3" (
    echo.
    node backend/distillation/distill.js --list
) else (
    echo.
    echo  Cancelled.
    echo.
    goto end
)

echo.
echo  ======================================================
echo  Distillation complete!
echo  Files saved to: backend\knowledge-base\distilled\
echo.
echo  Next: Push to GitHub (PUSH.bat) to deploy the brain.
echo  ======================================================
:end
pause
