@echo off
REM Run Local Schools Data Export
REM This batch file exports comprehensive Seattle/Bellevue school data to JSON

echo Running Local Schools Data Export...
node backend/scrapers/run-local-schools.js

if errorlevel 1 (
    echo.
    echo ERROR: Local schools export failed!
    pause
    exit /b 1
) else (
    echo.
    echo Local schools data export completed successfully!
    pause
)
