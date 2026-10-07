# 🐾 CodePet — Desktop Coding Companion

> A polished, lightweight, cross-platform pixel-art virtual pet for **macOS** and **Windows** that lives freely on your desktop and reacts in real time to your coding activity, builds, tests, and AI coding tools.

---

## ✨ Features at a Glance

- **Living Desktop Character**: Completely transparent, frameless floating overlay with **no window background**. Sits naturally on your screen, drag it anywhere, or lock its position.
- **Smart Click-Through**: Intelligent mouse-event forwarding ensures the pet never interferes with clicking or typing in your IDE, terminal, or browser.
- **Real-Time Coding Reactions**:
  - 🟢 **Build Success**: Jumps for joy, shows sparkles, celebrates with fanfare.
  - 🔴 **Build Failure**: Dizzy spiral eyes, sweat drop, panic speech bubbles.
  - 💚 **Tests Passed**: Excited bounce, "all green 💚" dialogue.
  - 🧠 **AI Thinking / Generating**: Watches the screen, contemplates, miniature laptop typing animation.
  - ☕ **Long Session / Idle**: Yawns, drinks coffee, curls up for a catnap.
- **Living Mood Engine**: 14 distinct emotional states (`Happy`, `Excited`, `Curious`, `Focused`, `Thinking`, `Confused`, `Surprised`, `Sad`, `Angry`, `Sleepy`, `Bored`, `Proud`, `Celebrating`, `Tired`) driven by streak tracking and activity velocity.
- **Procedural Pixel Art Engine**: 100% crisp vector-sharp sprites rendered to HTML5 canvas with custom palettes (`Default`, `Neon`, `Pastel`, `Retro Game Boy`, `Golden`, `Cyberpunk`) and accessories (`Wizard Hat`, `Top Hat`, `Sunglasses`, `Bowtie`, `Developer Headset`, `Halo`).
- **Procedural 8-Bit Chiptune Synthesizer**: Zero external audio files or latency! Uses the Web Audio API with square/sine oscillators for subtle retro audio feedback (with quiet hours and volume control).
- **Extensible Tool Adapters**: Modular adapters for **Claude Code**, **Cursor**, **Antigravity**, **Codex**, **GitHub Copilot**, **Windsurf**, **Cline**, **Generic CLI / Build Watchers**, plus a **Custom Tool Wizard**.
- **Local Webhook & CLI**: Built-in HTTP endpoint (`http://127.0.0.1:41738/event`) and CLI companion (`codepet emit BUILD_SUCCESS`) for terminal hooks, git pre-commit, and custom agent scripts.
- **100% Local & Privacy-Conscious**: Zero code uploads, zero prompt snooping, zero network telemetry. All processing remains strictly on your machine.
- **System Tray & Menu Bar**: Quick actions to hide/show, pause reactions, mute, toggle performance mode, and check pet mood.

---

## 🏗️ Architecture

```
CodePet Application Architecture
─────────────────────────────────────────────────────────────────
[Coding Tools / IDEs / CLI / Hooks / Webhook]
                     │
                     ▼
            [Tool Adapter Manager]
                     │
                     ▼
           [Priority Event Queue]
      (throttling, debouncing, prioritization)
                     │
                     ▼
             [Pet State Machine] ◄──── [Mood Engine]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
 [Animation Engine]      [Sound Synthesizer]
 (Procedural Pixels)     (8-bit Web Audio)
         │                       │
         ▼                       ▼
 [Pet Overlay Window]    [Settings & Dashboard]
 (Transparent Canvas)    (React + Vite UI)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (tested on Node v20 & v22)
- npm 9+

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/Sabari-Vasan-SM/code_pet.git
cd code_pet

# Install dependencies
npm install

# Run unit tests
npm test

# Build application
npm run build

# Launch CodePet desktop application
npm start
```

---

## 🛠️ CLI Companion

CodePet includes a command-line tool `codepet` that communicates with your running CodePet instance:

```bash
# Emit a build success event
npx codepet emit BUILD_SUCCESS --tool claude-code --message "Build clean!"

# Emit a test failure event
npx codepet emit TEST_FAILED --tool vitest --message "3 tests failing"

# Trigger AI thinking animation
npx codepet emit THINKING --tool cursor

# Check status of local CodePet server
npx codepet status
```

### Git Hook Integration (`.git/hooks/post-commit`)
Add to your project's `.git/hooks/post-commit` to have your pet celebrate every commit:
```bash
#!/bin/sh
curl -s -X POST http://127.0.0.1:41738/event \
  -H "Content-Type: application/json" \
  -d '{"type":"CELEBRATING","message":"Committed changes! 🚀"}' >/dev/null 2>&1 &
```

---

## 🧪 Testing

CodePet includes automated unit tests covering the Priority Queue, Event Bus, Mood Engine, Animation Generation, and Local Storage:

```bash
npm test
```

---

## 📦 Packaging & Distribution

To create standalone, production-ready desktop binaries:

```bash
# Package into release/ folder
npm run pack

# Create macOS DMG / Windows NSIS installer
npm run dist
```

Targets:
- **macOS**: Apple Silicon (`arm64`) & Intel (`x64`) DMG + ZIP
- **Windows**: NSIS installer + Portable x64 executable

---

## 🔒 Privacy & Permissions

CodePet is built on a strict **local-first** security model:
1. **Never uploads source code** or project directories.
2. **Never stores or transmits AI prompts** or conversational history.
3. **No telemetry or remote analytics**.
4. Inspects only local process execution markers and optional configured hooks.
