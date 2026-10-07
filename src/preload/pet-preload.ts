import { contextBridge, ipcRenderer } from 'electron';
import { PetReaction, CodePetConfig } from '../packages/shared/types';

export interface PetApi {
  onReaction: (callback: (reaction: PetReaction) => void) => () => void;
  onConfigUpdated: (callback: (config: CodePetConfig) => void) => () => void;
  triggerInteraction: (action: string) => void;
  setWindowPosition: (x: number, y: number) => void;
  setIgnoreMouseEvents: (ignore: boolean) => void;
  openSettings: () => void;
  hidePet: () => void;
  closeApp: () => void;
  getConfig: () => Promise<CodePetConfig>;
}

const api: PetApi = {
  onReaction: (callback) => {
    const handler = (_event: any, reaction: PetReaction) => callback(reaction);
    ipcRenderer.on('pet:reaction', handler);
    return () => {
      ipcRenderer.removeListener('pet:reaction', handler);
    };
  },
  onConfigUpdated: (callback) => {
    const handler = (_event: any, config: CodePetConfig) => callback(config);
    ipcRenderer.on('config:updated', handler);
    return () => {
      ipcRenderer.removeListener('config:updated', handler);
    };
  },
  triggerInteraction: (action: string) => {
    ipcRenderer.send('pet:interact', action);
  },
  setWindowPosition: (x: number, y: number) => {
    ipcRenderer.send('pet:set-position', { x, y });
  },
  setIgnoreMouseEvents: (ignore: boolean) => {
    ipcRenderer.send('pet:set-ignore-mouse', ignore);
  },
  openSettings: () => {
    ipcRenderer.send('app:open-settings');
  },
  hidePet: () => {
    ipcRenderer.send('pet:hide');
  },
  closeApp: () => {
    ipcRenderer.send('app:quit');
  },
  getConfig: () => {
    return ipcRenderer.invoke('config:get');
  }
};

contextBridge.exposeInMainWorld('codePetApi', api);
