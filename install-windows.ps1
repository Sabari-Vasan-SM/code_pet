# ==============================================
# 🐾 CodePet — Windows PowerShell Installer
# ==============================================

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "🐾 CodePet — Windows Installer (PowerShell)" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not found. Please install it from https://nodejs.org/" -ForegroundColor Red
    Exit 1
}

# Install dependencies if missing
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] npm install failed." -ForegroundColor Red
        Exit 1
    }
}

# Build CodePet
Write-Host "[INFO] Compiling CodePet assets and TypeScript..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] npm run build failed." -ForegroundColor Red
    Exit 1
}

# Package Windows binaries
Write-Host "[INFO] Packaging Windows executable..." -ForegroundColor Yellow
npx electron-builder --win
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Windows packaging failed." -ForegroundColor Red
    Exit 1
}

Write-Host "`n==============================================" -ForegroundColor Green
Write-Host "🎉 CodePet build completed successfully!" -ForegroundColor Green

if (Test-Path "release\win-unpacked\CodePet.exe") {
    Write-Host "[INFO] Launching CodePet..." -ForegroundColor Cyan
    Start-Process "release\win-unpacked\CodePet.exe"
} else {
    Write-Host "[INFO] Binaries generated in release/ directory:" -ForegroundColor Cyan
    Get-ChildItem -Path "release" -Filter "*.exe" | Select-Object Name
}
Write-Host "==============================================" -ForegroundColor Green
