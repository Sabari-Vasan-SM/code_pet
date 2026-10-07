#!/bin/bash
set -e

echo "=============================================="
echo "🐾 CodePet — macOS Installer"
echo "=============================================="

# Detect Architecture
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
  APP_DIR="release/mac-arm64/CodePet.app"
else
  APP_DIR="release/mac/CodePet.app"
fi

# Check if pre-built app exists; if not, build it
if [ ! -d "$APP_DIR" ]; then
  echo "📦 Building CodePet for macOS ($ARCH)..."
  if [ ! -d "node_modules" ]; then
    npm install
  fi
  npm run build
  npx electron-builder --mac --dir
fi

# Close any running instance
if pgrep -x "CodePet" > /dev/null; then
  echo "🔄 Closing existing CodePet instance..."
  killall CodePet || true
  sleep 1
fi

echo "🚀 Installing to /Applications/CodePet.app..."
rm -rf /Applications/CodePet.app
cp -R "$APP_DIR" /Applications/

# Strip Gatekeeper quarantine attribute
echo "🛡️ Configuring permissions..."
xattr -cr /Applications/CodePet.app || true

echo "✨ Launching CodePet..."
open /Applications/CodePet.app

echo "=============================================="
echo "🎉 CodePet successfully installed and launched!"
echo "   Look at the bottom-right of your screen or"
echo "   the menu bar icon at the top right."
echo "=============================================="
