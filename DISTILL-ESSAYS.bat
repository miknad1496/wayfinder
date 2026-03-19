@echo off
echo ==========================================
echo   Wayfinder Essay Deep Distillation
echo ==========================================
echo.
echo This will generate essay intelligence files using Claude.
echo.
echo Options:
echo   1 = Dry run (preview only, no API calls)
echo   2 = Run all with Sonnet (~$2-3)
echo   3 = Run all with Opus (~$10-15, higher quality)
echo   4 = Run specific layer
echo.
set /p choice="Choose option (1-4): "

if "%choice%"=="1" (
    node backend/distillation/distill-essays.js --dry-run
) else if "%choice%"=="2" (
    node backend/distillation/distill-essays.js
) else if "%choice%"=="3" (
    node backend/distillation/distill-essays.js --opus
) else if "%choice%"=="4" (
    echo.
    echo Layers: E1=Diagnostic, E2=School-Specific, E3=Worked Examples
    echo         E4=Edge Cases, E5=Process, E6=Ecosystem
    echo         E7=Cutting-Edge 2026, E8=AO Voice Mining
    echo.
    set /p layer="Enter layer (E1-E8): "
    node backend/distillation/distill-essays.js --layer=%layer%
)

echo.
pause
