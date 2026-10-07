import { contextBridge, ipcRenderer } from 'electron';
import {
  CodePetConfig,
  ToolStatus,
  DeveloperSessionStats,
  CustomToolConfig,
  CodingEventType
} from '../packages/shared/types';

export interface SettingsApi {
  getConfig: () => Promise<CodePetConfig>;
  saveConfig: (config: CodePetConfig) => Promise<boolean>;
  getToolStatuses: () => Promise<ToolStatus[]>;
  triggerTestEvent: (eventType: CodingEventType, tool?: string) => Promise<boolean>;
  triggerPetInteraction: (action: string) => Promise<boolean>;
  getSessionStats: () => Promise<DeveloperSessionStats>;
  addCustomTool: (tool: CustomToolConfig) => Promise<boolean>;
  removeCustomTool: (toolId: string) => Promise<boolean>;
  closeWindow: () => void;
  openExternal: (url: string) => void;
}

const api: SettingsApi = {
  getConfig: () => ipcRenderer.invoke('config:get'),
  saveConfig: (config: CodePetConfig) => ipcRenderer.invoke('config:save', config),
  getToolStatuses: () => ipcRenderer.invoke('tools:get-status'),
  triggerTestEvent: (eventType: CodingEventType, tool?: string) =>
    ipcRenderer.invoke('test:emit-event', { eventType, tool }),
  triggerPetInteraction: (action: string) =>
    ipcRenderer.invoke('pet:interact', action),
  getSessionStats: () => ipcRenderer.invoke('stats:get'),
  addCustomTool: (tool: CustomToolConfig) =>
    ipcRenderer.invoke('tools:add-custom', tool),
  removeCustomTool: (toolId: string) =>
    ipcRenderer.invoke('tools:remove-custom', toolId),
  closeWindow: () => ipcRenderer.send('settings:close'),
  openExternal: (url: string) => ipcRenderer.send('shell:open-external', url)
};

contextBridge.exposeInMainWorld('codePetSettingsApi', api);
