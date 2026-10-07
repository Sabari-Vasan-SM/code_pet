import { ipcMain, shell, app } from 'electron';
import { ConfigStorage } from '../packages/storage';
import { EventBus } from '../packages/event-engine';
import { PetStateMachine } from '../packages/pet-engine';
import { ToolAdapterManager } from '../packages/tool-adapters';
import { PetWindowManager } from './pet-window';
import { SettingsWindowManager } from './settings-window';
import { TrayManager } from './tray-manager';
import {
  CodePetConfig,
  CustomToolConfig,
  CodingEventType,
  PetReaction
} from '../packages/shared/types';

export function registerIpcHandlers(
  storage: ConfigStorage,
  eventBus: EventBus,
  petMachine: PetStateMachine,
  toolManager: ToolAdapterManager,
  petWindowManager: PetWindowManager,
  settingsWindowManager: SettingsWindowManager,
  trayManager: TrayManager
) {
  // Config
  ipcMain.handle('config:get', async () => {
    return storage.getConfig();
  });

  ipcMain.handle('config:save', async (_event, newConfig: CodePetConfig) => {
    storage.saveConfig(newConfig);
    petMachine.updateConfig(newConfig);
    petWindowManager.updateConfig(newConfig);
    // Restart tool adapters according to enabled list
    await toolManager.startEnabledAdapters(newConfig.tools.enabledTools);
    return true;
  });

  // Pet window manipulation
  ipcMain.on('pet:set-position', (_event, { x, y }) => {
    petWindowManager.setPosition(x, y);
    storage.updateConfig({
      system: {
        ...storage.getConfig().system,
        position: { x: Math.round(x), y: Math.round(y) }
      }
    });
  });

  ipcMain.on('pet:set-ignore-mouse', (_event, ignore: boolean) => {
    petWindowManager.setIgnoreMouseEvents(ignore);
  });

  ipcMain.on('pet:hide', () => {
    petWindowManager.hide();
    trayManager.setPetVisible(false);
  });

  // Pet manual interactions (click, pet, feed, play, dance, sleep, wake)
  ipcMain.handle('pet:interact', async (_event, action: string) => {
    const reaction = petMachine.triggerManualInteraction(action as any);
    trayManager.updateStatus(petMachine.getCurrentMood(), 'User Interaction');
    return true;
  });

  ipcMain.on('pet:interact', (_event, action: string) => {
    petMachine.triggerManualInteraction(action as any);
  });

  // Tool statuses
  ipcMain.handle('tools:get-status', async () => {
    return await toolManager.getAllStatuses();
  });

  ipcMain.handle('tools:add-custom', async (_event, customTool: CustomToolConfig) => {
    const config = storage.getConfig();
    const updatedCustom = [...config.tools.customTools.filter(t => t.id !== customTool.id), customTool];
    const updatedEnabled = [...config.tools.enabledTools, customTool.id];
    storage.updateConfig({
      tools: {
        enabledTools: updatedEnabled,
        customTools: updatedCustom
      }
    });
    toolManager.registerCustomTools([customTool]);
    await toolManager.startEnabledAdapters(updatedEnabled);
    return true;
  });

  ipcMain.handle('tools:remove-custom', async (_event, toolId: string) => {
    const config = storage.getConfig();
    const updatedCustom = config.tools.customTools.filter(t => t.id !== toolId);
    const updatedEnabled = config.tools.enabledTools.filter(id => id !== toolId);
    storage.updateConfig({
      tools: {
        enabledTools: updatedEnabled,
        customTools: updatedCustom
      }
    });
    await toolManager.startEnabledAdapters(updatedEnabled);
    return true;
  });

  // Developer Session Stats
  ipcMain.handle('stats:get', async () => {
    return petMachine.getSessionStats();
  });

  // Test Event simulation from Settings / CLI
  ipcMain.handle('test:emit-event', async (_event, { eventType, tool }: { eventType: CodingEventType; tool?: string }) => {
    eventBus.emit({
      type: eventType,
      tool: tool || 'claude-code',
      message: `Manual test trigger: ${eventType}`
    });
    return true;
  });

  // Window openers
  ipcMain.on('app:open-settings', () => {
    settingsWindowManager.create();
  });

  ipcMain.on('settings:close', () => {
    settingsWindowManager.close();
  });

  ipcMain.on('shell:open-external', (_event, url: string) => {
    shell.openExternal(url);
  });

  ipcMain.on('app:quit', () => {
    app.quit();
  });
}
