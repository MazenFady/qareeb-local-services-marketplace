@echo off
title Qareeb Local Services Marketplace Prototype
cd /d "%~dp0"

echo ========================================================
echo  Starting Qareeb (قريب) Marketplace UI Prototype
echo ========================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting static server on http://localhost:3000 ...
    start "" http://localhost:3000
    node server.js
) else (
    echo Opening index.html directly in your default browser...
    start "" "%~dp0index.html"
)
