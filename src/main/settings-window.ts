import { BrowserWindow } from 'electron';
import * as path from 'path';

export class SettingsWindowManager {
  private window: BrowserWindow | null = null;

  public create(): BrowserWindow {
    if (this.window && !this.window.isDestroyed()) {
      this.window.show();
      this.window.focus();
      return this.window;
    }

    this.window = new BrowserWindow({
      width: 900,
      height: 660,
      minWidth: 780,
      minHeight: 520,
      title: 'CodePet - Settings & Companion Dashboard',
      backgroundColor: '#0f172a',
      show: false,
      autoHideMenuBar: true,
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      webPreferences: {
        preload: path.join(__dirname, '../preload/settings-preload.cjs'),
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    const htmlPath = path.join(__dirname, '../renderer/settings/index.html');
    this.window.loadFile(htmlPath);

    this.window.once('ready-to-show', () => {
      this.window?.show();
    });

    this.window.on('closed', () => {
      this.window = null;
    });

    return this.window;
  }

  public getWindow(): BrowserWindow | null {
    return this.window;
  }

  public close(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.close();
    }
  }
}
