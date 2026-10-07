@echo off
setlocal enabledelayedexpansion

echo ==============================================
echo 🐾 CodePet — Windows Installer
echo ==============================================

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo [INFO] Installing project dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

:: Build renderer and main bundles
echo [INFO] Compiling CodePet assets and TypeScript...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build failed.
    pause
    exit /b 1
)

:: Package Windows binaries
echo [INFO] Packaging Windows application...
call npx electron-builder --win
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Windows packaging failed.
    pause
    exit /b 1
)

echo.
echo ==============================================
echo 🎉 Build complete!
echo.
if exist "release\win-unpacked\CodePet.exe" (
    echo [INFO] Launching CodePet...
    start "" "release\win-unpacked\CodePet.exe"
) else (
    echo [INFO] Windows installer generated in release\ directory:
    dir /b release\*.exe
)
echo ==============================================

pause
