import { app, BrowserWindow } from 'electron';
import { ConfigStorage } from '../packages/storage';
import { EventBus } from '../packages/event-engine';
import { PetStateMachine } from '../packages/pet-engine';
import { ToolAdapterManager } from '../packages/tool-adapters';
import { PetWindowManager } from './pet-window';
import { SettingsWindowManager } from './settings-window';
import { TrayManager } from './tray-manager';
import { registerIpcHandlers } from './ipc-handlers';

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let storage: ConfigStorage;
  let eventBus: EventBus;
  let petMachine: PetStateMachine;
  let toolManager: ToolAdapterManager;
  let petWindowManager: PetWindowManager;
  let settingsWindowManager: SettingsWindowManager;
  let trayManager: TrayManager;

  app.on('second-instance', () => {
    // Focus settings window if user tries to open app again
    const settingsWin = settingsWindowManager?.getWindow();
    if (settingsWin) {
      if (settingsWin.isMinimized()) settingsWin.restore();
      settingsWin.focus();
    } else {
      settingsWindowManager?.create();
    }
  });

  app.whenReady().then(async () => {
    // Hide dock icon on macOS if configured to live only as floating pet & tray
    // if (process.platform === 'darwin') app.dock.hide();

    storage = new ConfigStorage();
    const config = storage.getConfig();

    eventBus = new EventBus();
    petMachine = new PetStateMachine(config);
    toolManager = new ToolAdapterManager();
    petWindowManager = new PetWindowManager(config);
    settingsWindowManager = new SettingsWindowManager();

    trayManager = new TrayManager({
      onTogglePet: () => {
        const visible = petWindowManager.toggleVisibility();
        trayManager.setPetVisible(visible);
      },
      onOpenSettings: () => {
        settingsWindowManager.create();
      },
      onToggleMute: () => {
        const curr = storage.getConfig();
        const newMuted = !curr.sound.enabled;
        curr.sound.enabled = !newMuted;
        storage.saveConfig(curr);
        petWindowManager.updateConfig(curr);
        trayManager.setMuted(newMuted);
      },
      onToggleReactions: () => {
        // Toggle behavior speech bubbles/reactions
        const curr = storage.getConfig();
        curr.behavior.speechBubblesEnabled = !curr.behavior.speechBubblesEnabled;
        storage.saveConfig(curr);
        petWindowManager.updateConfig(curr);
      },
      onTogglePerformance: () => {
        const curr = storage.getConfig();
        curr.system.performanceMode = !curr.system.performanceMode;
        storage.saveConfig(curr);
        petWindowManager.updateConfig(curr);
        trayManager.setPerformanceMode(curr.system.performanceMode);
      },
      onQuit: () => {
        app.quit();
      }
    });

    // Initialize Tray
    trayManager.init();

    // Wire up Tool Adapters to EventBus
    toolManager.setEmitCallback(event => {
      eventBus.emit(event);
    });

    // Wire up EventBus to PetStateMachine & Pet Window
    eventBus.on('*', event => {
      const reaction = petMachine.handleCodingEvent(event);
      trayManager.updateStatus(reaction.mood, event.toolName || event.tool);
      const petWin = petWindowManager.getWindow();
      if (petWin && !petWin.isDestroyed()) {
        petWin.webContents.send('pet:reaction', reaction);
      }
    });

    // Wire manual interactions or state machine changes to pet window
    petMachine.setStateChangeHandler(reaction => {
      const petWin = petWindowManager.getWindow();
      if (petWin && !petWin.isDestroyed()) {
        petWin.webContents.send('pet:reaction', reaction);
      }
    });

    // Register all IPC handlers
    registerIpcHandlers(
      storage,
      eventBus,
      petMachine,
      toolManager,
      petWindowManager,
      settingsWindowManager,
      trayManager
    );

    // Register custom tools from config
    toolManager.registerCustomTools(config.tools.customTools);

    // Start enabled tool adapters
    await toolManager.startEnabledAdapters(config.tools.enabledTools);

    // Launch flow: First time onboarding vs direct pet launch
    if (!config.onboardingCompleted) {
      settingsWindowManager.create();
      // Also show pet window in background for immediate delightful feedback
      petWindowManager.create();
    } else {
      petWindowManager.create();
      if (!config.system.startMinimized) {
        // Can open settings if user configured
      }
    }

    // Auto-launch handling
    if (config.system.launchAtStartup) {
      app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: config.system.startMinimized
      });
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        petWindowManager.create();
      }
    });
  });

  app.on('window-all-closed', () => {
    // Keep app alive in background / system tray
    if (process.platform !== 'darwin' && !storage?.getConfig()?.system?.showInTray) {
      app.quit();
    }
  });

  app.on('before-quit', async () => {
    if (toolManager) {
      await toolManager.stopAll();
    }
    if (petMachine && storage) {
      storage.saveSessionStats(petMachine.getSessionStats());
      petMachine.dispose();
    }
  });
}
