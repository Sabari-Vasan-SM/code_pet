# 🐾 CodePet — Installation Guide (macOS & Windows)

Welcome to **CodePet**! This guide contains step-by-step instructions and one-line commands to install and launch CodePet on **macOS** and **Windows**.

---

## 🍎 macOS Installation

### Method 1: Automated Script (Fastest)

Run the included automated installer script in your terminal:

```bash
chmod +x ./install-mac.sh && ./install-mac.sh
```

This will automatically build (if needed), install CodePet into `/Applications/CodePet.app`, clear macOS Gatekeeper flags, and launch the pet.

---

### Method 2: Manual Copy to `/Applications`

If you already have the repository cloned and built:

```bash
# 1. Ensure the app is built
npm run build && npm run pack

# 2. Copy to Applications folder
cp -R release/mac-arm64/CodePet.app /Applications/

# 3. Clear macOS Gatekeeper quarantine flag (prevents "Unidentified Developer" warning)
xattr -cr /Applications/CodePet.app

# 4. Launch CodePet
open /Applications/CodePet.app
```

---

### Method 3: Using the `.dmg` Disk Image

1. Generate or open the DMG installer:
   ```bash
   open release/CodePet-1.0.0-arm64.dmg
   ```
2. Drag the **CodePet** icon into your **Applications** folder.
3. Open **CodePet** from Spotlight (`Cmd + Space` -> type `CodePet`) or `/Applications`.

> **Tip for macOS Security (Gatekeeper):**
> If macOS displays *"CodePet cannot be opened because the developer cannot be verified"*:
> Run this single terminal command:
> ```bash
> xattr -cr /Applications/CodePet.app
> ```
> Or go to **System Settings** → **Privacy & Security** → scroll down and click **Open Anyway**.

---

## 🪟 Windows Installation

### Method 1: Automated PowerShell Script (Recommended)

Open **PowerShell** in the `code_pet` project directory and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\install-windows.ps1
```

---

### Method 2: Command Prompt / Batch Script

Double-click `install-windows.bat` or run in **Command Prompt (cmd.exe)**:

```cmd
install-windows.bat
```

---

### Method 3: Manual Windows Build & Packaging

If you want to manually package and run on Windows:

```cmd
:: 1. Install dependencies
npm install

:: 2. Build the application
npm run build

:: 3. Generate Windows installer (NSIS) and portable EXE
npx electron-builder --win

:: 4. Run the installer or portable app
start release\CodePet-1.0.0-setup.exe
```

The compiled binaries will be available in the `release/` directory:
- `release/CodePet-1.0.0-setup.exe` (Standard Windows NSIS Installer)
- `release/win-unpacked/CodePet.exe` (Standalone Portable Executable)

---

## 💻 Developer / Run Directly from Source (Any OS)

If you have Node.js installed and just want to run CodePet in development mode:

```bash
# 1. Install dependencies
npm install

# 2. Build renderer and main process
npm run build

# 3. Start the application
npm start
```

---

## 🐾 What Happens on First Launch:

1. **Setup Wizard**:
   - Welcome screen introducing CodePet.
   - Select which coding tools to listen to (**Claude Code**, **Cursor**, **Antigravity**, **Codex**, **Copilot**, etc.).
   - Choose your starting pet (**Pixel Cat**, **Cyber Dog**, **Code Fox**, **Emerald Dino**, **Tropical Parrot**, **Python Snake**, **Linux Penguin**, **Byte Bot**, **Git Ghost**, or **Custom Pet**).
   - Customize pixel scale and sound preferences.
2. Click **"Launch CodePet onto Desktop 🚀"** and your pet will float freely on your screen!
3. Control settings anytime from the **menu bar (macOS)** or **system tray (Windows)** icon.

---

## 🛠️ CLI Companion Installation

To trigger events, builds, and celebrations from your terminal or shell scripts:

```bash
# Link the codepet command globally
npm link

# Now you can emit events anywhere:
codepet emit BUILD_SUCCESS --tool claude-code --message "Build clean! ✨"
codepet emit THINKING --tool antigravity
codepet status
```
