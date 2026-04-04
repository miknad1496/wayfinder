@echo off
echo ==========================================
echo  Pushing Scorecard data to GitHub
echo ==========================================
echo.
git add backend\data\scraped\financial-aid-db.json
git commit -m "Update financial-aid-db.json with verified College Scorecard data (1423 schools)"
git push
echo.
echo Done! Render will auto-deploy in ~2 minutes.
pause
