import { BrowserWindow, screen } from 'electron';
import * as path from 'path';
import { CodePetConfig } from '../packages/shared/types';

export class PetWindowManager {
  private window: BrowserWindow | null = null;
  private config: CodePetConfig;
  private isHidden: boolean = false;

  constructor(config: CodePetConfig) {
    this.config = config;
  }

  public create(): BrowserWindow {
    if (this.window && !this.window.isDestroyed()) {
      return this.window;
    }

    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

    // Default position at bottom-right of primary screen if not set
    let posX = this.config.system.position?.x ?? (screenWidth - 280);
    let posY = this.config.system.position?.y ?? (screenHeight - 260);

    // Keep on screen
    posX = Math.max(10, Math.min(screenWidth - 260, posX));
    posY = Math.max(10, Math.min(screenHeight - 240, posY));

    const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

    this.window = new BrowserWindow({
      width: 260,
      height: 240,
      x: posX,
      y: posY,
      transparent: true,
      frame: false,
      alwaysOnTop: this.config.system.alwaysOnTop,
      resizable: false,
      hasShadow: false,
      skipTaskbar: true,
      focusable: false,
      type: process.platform === 'darwin' ? 'panel' : undefined,
      webPreferences: {
        preload: path.join(__dirname, '../preload/pet-preload.cjs'),
        nodeIntegration: false,
        contextIsolation: true,
        backgroundThrottling: false
      }
    });

    if (process.platform === 'darwin') {
      this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      this.window.setAlwaysOnTop(this.config.system.alwaysOnTop, 'floating', 1);
    }

    // Load renderer HTML
    const htmlPath = path.join(__dirname, '../renderer/pet/index.html');
    this.window.loadFile(htmlPath);

    this.window.on('closed', () => {
      this.window = null;
    });

    return this.window;
  }

  public getWindow(): BrowserWindow | null {
    return this.window;
  }

  public setPosition(x: number, y: number) {
    if (this.window && !this.window.isDestroyed() && !this.config.system.lockPosition) {
      this.window.setPosition(Math.round(x), Math.round(y));
      this.config.system.position = { x: Math.round(x), y: Math.round(y) };
    }
  }

  public setIgnoreMouseEvents(ignore: boolean) {
    if (this.window && !this.window.isDestroyed()) {
      this.window.setIgnoreMouseEvents(ignore, { forward: true });
    }
  }

  public toggleVisibility(): boolean {
    if (!this.window || this.window.isDestroyed()) {
      this.create();
      this.isHidden = false;
      return true;
    }

    if (this.window.isVisible()) {
      this.window.hide();
      this.isHidden = true;
      return false;
    } else {
      this.window.show();
      this.isHidden = false;
      return true;
    }
  }

  public show(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.show();
      this.isHidden = false;
    }
  }

  public hide(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.hide();
      this.isHidden = true;
    }
  }

  public updateConfig(newConfig: CodePetConfig): void {
    this.config = newConfig;
    if (this.window && !this.window.isDestroyed()) {
      this.window.setAlwaysOnTop(this.config.system.alwaysOnTop);
      this.window.webContents.send('config:updated', newConfig);
    }
  }
}
