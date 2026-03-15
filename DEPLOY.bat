@echo off
cd /d "%~dp0"
echo.
echo  Wayfinder - Deploy to Render (Free Hosting)
echo  =============================================
echo.
echo  This will guide you through deploying Wayfinder to the web for free.
echo.
echo  STEP 1: Make sure you have a GitHub account
echo          (go to github.com and sign up if you don't)
echo.
echo  STEP 2: Make sure Git is installed
echo          (checking now...)
echo.
git --version >nul 2>&1
if errorlevel 1 (
    echo  Git is NOT installed. Please install it:
    echo  Download from: https://git-scm.com/download/win
    echo  Run the installer, then come back and run DEPLOY.bat again.
    echo.
    pause
    exit /b 1
)
echo  Git is installed!
echo.

echo  STEP 3: Fix permissions and initialize Git repository
echo.
:: Fix the "dubious ownership" error that happens when files were created by another process
git config --global --add safe.directory "%cd%"
echo  Permissions fixed.

if not exist ".git" (
    git init
    echo  Git repository created.
) else (
    echo  Git repository already exists.
)
echo.

echo  STEP 4: Stage all files for commit
echo.
git add -A
git commit -m "Initial Wayfinder deployment"
echo.

echo  STEP 5: Create GitHub repository
echo.
echo  Now you need to:
echo    1. Go to github.com/new in your browser
echo    2. Name it "wayfinder"
echo    3. Keep it Private
echo    4. Do NOT check any boxes (no README, no .gitignore)
echo    5. Click "Create repository"
echo    6. Copy the URL (looks like: https://github.com/YOUR-USERNAME/wayfinder.git)
echo.
echo  Press any key once you've created the repo and copied the URL...
pause >nul
echo.
set /p REPO_URL="Paste your GitHub repository URL here: "
echo.

if "%REPO_URL%"=="" (
    echo  No URL provided. You can add the remote later with:
    echo    git remote add origin YOUR_URL
    echo    git push -u origin main
) else (
    git remote add origin %REPO_URL% 2>nul || git remote set-url origin %REPO_URL%
    git branch -M main
    echo  Pushing to GitHub (you may be asked to log in)...
    git push -u origin main
    echo.
    echo  Pushed to GitHub!
)
echo.
echo  STEP 6: Deploy on Render
echo  ========================
echo.
echo  1. Go to render.com and sign up (free) with your GitHub account
echo  2. Click "New +" then "Web Service"
echo  3. Connect your "wayfinder" GitHub repository
echo  4. Render will auto-detect settings from render.yaml
echo  5. Add your environment variable:
echo       Key: ANTHROPIC_API_KEY
echo       Value: (paste your API key from .env)
echo  6. Click "Deploy"
echo.
echo  Your Wayfinder will be live at: https://wayfinder-XXXX.onrender.com
echo.
echo  CUSTOM DOMAIN (optional):
echo  To use a domain like wayfinder.org:
echo    1. Buy the domain from namecheap.com or similar (~$10/year)
echo    2. In Render dashboard, go to your service Settings > Custom Domains
echo    3. Add your domain and follow the DNS instructions
echo    4. Render handles SSL (https) automatically
echo.
echo  NOTE: Free Render services sleep after 15 minutes of inactivity.
echo        First visit after sleep takes ~30 seconds to wake up.
echo.
pause
