@echo off
cd /d "%~dp0"
echo.
echo  Wayfinder - Learn From Conversations
echo  ======================================
echo  Analyzing stored conversations to improve the knowledge base...
echo.
cd backend
call node services/learn.js
cd ..
echo.
echo  Done! Restart Wayfinder (START.bat) to use improved knowledge.
pause
