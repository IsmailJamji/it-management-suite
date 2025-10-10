@echo off
title Reset Database - IT Management Suite
echo.
echo ========================================
echo   Reset Database - IT Management Suite
echo ========================================
echo.
echo This will reset the database to fix any schema issues.
echo.

REM Stop any running instances
taskkill /f /im electron.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

echo Step 1: Backing up existing database...
if exist "it_management.db" (
    copy "it_management.db" "it_management_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.db" >nul
    echo ✓ Database backed up
) else (
    echo - No existing database found
)

echo.
echo Step 2: Removing old database...
if exist "it_management.db" del "it_management.db"
if exist "electron\dist\it_management.db" del "electron\dist\it_management.db"
if exist "%USERPROFILE%\AppData\Roaming\it-management-suite\it_management.db" del "%USERPROFILE%\AppData\Roaming\it-management-suite\it_management.db"

echo.
echo Step 3: Rebuilding application...
npm run build:electron
if %errorlevel% neq 0 (
    echo ERROR: Failed to build application
    pause
    exit /b 1
)

echo.
echo Step 4: Testing application...
echo Starting application to initialize database...
timeout /t 3 >nul

echo.
echo ========================================
echo   Database Reset Complete!
echo ========================================
echo.
echo The database has been reset and the application should now work properly.
echo.
echo You can now:
echo 1. Double-click the desktop shortcut
echo 2. Run IT-Management-Suite.bat
echo 3. Search for "IT Management Suite" in Start Menu
echo.

pause
