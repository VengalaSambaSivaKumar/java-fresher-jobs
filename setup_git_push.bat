@echo off
:: 🧩 Java Fresher Jobs GitHub Auto Upload Script
:: Author: ChatGPT Assistant
:: Use: Double-click this file after making changes to automatically push updates to GitHub.

:: Step 1 — Navigate to your project directory
cd /d "%~dp0"

:: Step 2 — Initialize Git if not already done
git rev-parse --is-inside-work-tree >nul 2>&1
if %errorlevel% neq 0 (
    git init
    git branch -M main
)

:: Step 3 — Add all files
echo Adding all files to commit...
git add .

:: Step 4 — Commit changes
set /p msg="Enter commit message (or press Enter for default): "
if "%msg%"=="" set msg=Auto-update from batch script

git commit -m "%msg%"

:: Step 5 — Set remote if not exists
git remote -v | find "origin" >nul 2>&1
if %errorlevel% neq 0 (
    echo Adding remote origin...
    git remote add origin https://github.com/VengalaSambSivaKumar/java-fresher-jobs-data.git
)

:: Step 6 — Push to GitHub
echo Pushing changes to GitHub...
git push -u origin main

:: Step 7 — Confirm success
echo.
echo ✅ Successfully pushed updates to GitHub Repository!
echo 🔗 View here: https://github.com/VengalaSambSivaKumar/java-fresher-jobs-data

:: Step 8 — Auto-schedule every 6 hours using Windows Task Scheduler
:: (You can skip this step if you prefer manual execution.)
:: Run the following once in CMD as administrator:
:: schtasks /create /sc hourly /mo 6 /tn "JavaFresherJobsAutoPush" /tr "%~dp0setup_git_push.bat"

pause
