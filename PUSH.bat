@echo off
cd /d "%~dp0"
echo.
echo  Wayfinder - Push to GitHub
echo  ==========================
echo.

:: Fix ownership
git config --global --add safe.directory "%cd%"

:: Make sure we have a git repo
if not exist ".git" (
    git init
)

:: Stage and commit
echo  Staging files...
git add -A
git commit -m "Wayfinder deployment" 2>nul
echo.

:: Set remote with token authentication
git remote remove origin 2>nul
git remote add origin https://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@github.com/miknad1496/wayfinder.git
git branch -M main

echo  Pulling latest from GitHub first...
git pull --rebase origin main 2>nul
echo.
echo  Pushing to GitHub...
echo.
git push -u origin main
echo.

if errorlevel 1 (
    echo  Push failed. See error above.
) else (
    echo  ========================================
    echo  SUCCESS! Code is now on GitHub!
    echo  ========================================
    echo.
    echo  Next step: Deploy on Render
    echo  ===========================
    echo  1. Go to render.com and sign up with your GitHub account
    echo  2. Click "New +" then "Web Service"
    echo  3. Connect your "wayfinder" repository
    echo  4. Add environment variable:
    echo       Key: ANTHROPIC_API_KEY
    echo       Value: your API key from .env file
    echo  5. Click "Deploy"
)
echo.
pause
