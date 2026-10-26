@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title SKU Studio - one-click GitHub push

set "REPO_URL=https://github.com/lyy197673/sku-SCQ.git"
set "EXIT_CODE=0"

where git >nul 2>nul
if errorlevel 1 goto :no_git

echo.
echo   SKU Studio / one-click GitHub push
echo   ----------------------------------------
echo   Repository: %REPO_URL%
echo.

if exist ".git" goto :repo_ready

echo   First run: cloning repository metadata...
if exist ".git-bootstrap" rmdir /s /q ".git-bootstrap" >nul 2>nul
git clone --no-checkout "%REPO_URL%" ".git-bootstrap"
if errorlevel 1 goto :clone_failed
if not exist ".git-bootstrap\.git" goto :clone_failed
powershell -NoProfile -ExecutionPolicy Bypass -Command "Move-Item -LiteralPath '.git-bootstrap\.git' -Destination '.git' -Force" >nul
if errorlevel 1 goto :clone_failed
rmdir /s /q ".git-bootstrap" >nul 2>nul

:repo_ready
git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 goto :not_repo

git remote get-url origin >nul 2>nul
if errorlevel 1 (
  git remote add origin "%REPO_URL%"
) else (
  git remote set-url origin "%REPO_URL%"
)

set "BRANCH="
for /f "delims=" %%B in ('git branch --show-current 2^>nul') do set "BRANCH=%%B"
if not defined BRANCH (
  git symbolic-ref HEAD refs/heads/main >nul 2>nul
  set "BRANCH=main"
)

git config --get user.name >nul 2>nul
if errorlevel 1 git config user.name "SKU Studio"
git config --get user.email >nul 2>nul
if errorlevel 1 git config user.email "sku-studio@local"

echo   Branch: %BRANCH%
echo   Staging changes...
git add -A
if errorlevel 1 goto :stage_failed

git diff --cached --quiet
if errorlevel 1 (
  echo   Creating commit...
  git commit -m "Update site %DATE% %TIME%"
  if errorlevel 1 goto :commit_failed
) else (
  echo   No file changes to commit.
)

echo   Pushing to GitHub...
git push -u origin "%BRANCH%"
if not errorlevel 1 goto :success

echo.
echo   Push was rejected. Trying to sync with the remote...
git pull --rebase origin "%BRANCH%"
if errorlevel 1 goto :push_failed
git push -u origin "%BRANCH%"
if errorlevel 1 goto :push_failed

:success
echo.
echo   Done. GitHub is updated.
echo   Cloudflare Pages should rebuild automatically.
echo.
goto :finish

:no_git
set "EXIT_CODE=1"
echo.
echo   [Git not found]
echo   Install Git for Windows and run this file again:
echo   https://git-scm.com/download/win
goto :finish

:clone_failed
set "EXIT_CODE=1"
echo.
echo   [Could not connect to GitHub]
echo   Check the repository URL and your network or GitHub login.
echo   If a .git-bootstrap folder was created, it will be cleaned up on the next run.
goto :finish

:not_repo
set "EXIT_CODE=1"
echo.
echo   [Not a Git working tree]
echo   Run this file from the project root.
goto :finish

:stage_failed
set "EXIT_CODE=1"
echo.
echo   [Could not stage files]
echo   Check whether another program is locking a file, then try again.
goto :finish

:commit_failed
set "EXIT_CODE=1"
echo.
echo   [Could not create a commit]
echo   Check your Git user.name and user.email settings.
goto :finish

:push_failed
set "EXIT_CODE=1"
echo.
echo   [Could not push]
echo   The remote may have changes that conflict with this local copy.
echo   Resolve the conflict, then run this file again.
goto :finish

:finish
echo.
if /I not "%NO_PAUSE%"=="1" pause
exit /b %EXIT_CODE%
