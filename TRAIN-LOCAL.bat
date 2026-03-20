@echo off
echo ==========================================
echo   Wayfinder SLM Local Training
echo   RTX 5060 Ti / 8GB VRAM / QLoRA 4-bit
echo ==========================================
echo.
echo Options:
echo   1 = Train Admissions SLM (dry run - just show stats)
echo   2 = Train Admissions SLM (FULL TRAINING ~8-14 hours)
echo   3 = Train Career SLM (dry run)
echo   4 = Train Career SLM (FULL TRAINING ~6-10 hours)
echo.
set /p choice="Choose (1-4): "

if "%choice%"=="1" (
    python slm-training/train-local-5060ti.py --model admissions --dry-run
) else if "%choice%"=="2" (
    echo.
    echo Starting Admissions SLM training...
    echo This will take 8-14 hours. Leave your computer on.
    echo.
    python slm-training/train-local-5060ti.py --model admissions --epochs 3
) else if "%choice%"=="3" (
    python slm-training/train-local-5060ti.py --model career --dry-run
) else if "%choice%"=="4" (
    echo.
    echo Starting Career SLM training...
    echo This will take 6-10 hours. Leave your computer on.
    echo.
    python slm-training/train-local-5060ti.py --model career --epochs 3
)

echo.
pause
