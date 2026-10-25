@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title SKU Studio - Local Editor

where node >nul 2>nul
if errorlevel 1 goto :no_node

set "OPEN_FLAG=--open"
if /I "%~1"=="--no-open" set "OPEN_FLAG=--no-open"

echo.
echo   SKU Studio / local workspace
echo   ----------------------------------------
echo   Node.js:
node -v
echo.
echo   Starting local server...
echo.

node "server\server.js" %OPEN_FLAG%

if errorlevel 1 (
  echo.
  echo   The local server exited unexpectedly.
  echo   Check the error above, or run this command manually:
  echo   node server\server.js --no-open
  echo.
  pause
)

exit /b 0

:no_node
echo.
echo   [Node.js not found]
echo.
echo   Install Node.js 18.17 or newer:
echo   https://nodejs.org/
echo.
echo   After installation, double-click this script again.
echo.
pause
exit /b 1
