import { Tray, Menu, nativeImage, app } from 'electron';
import { PetMood, ToolStatus } from '../packages/shared/types';

export interface TrayCallbacks {
  onTogglePet: () => void;
  onOpenSettings: () => void;
  onToggleMute: () => void;
  onToggleReactions: () => void;
  onTogglePerformance: () => void;
  onQuit: () => void;
}

export class TrayManager {
  private tray: Tray | null = null;
  private callbacks: TrayCallbacks;
  private currentMood: PetMood = 'Happy';
  private activeTool: string = 'None';
  private isPetVisible: boolean = true;
  private isMuted: boolean = false;
  private isReactionsPaused: boolean = false;
  private isPerformanceMode: boolean = false;

  constructor(callbacks: TrayCallbacks) {
    this.callbacks = callbacks;
  }

  public init(): void {
    if (this.tray) return;

    // Create 16x16 pixel cat face icon as 1-bit or data URL
    const icon = this.createTrayIcon();
    this.tray = new Tray(icon);
    this.tray.setToolTip('CodePet - Virtual Coding Companion');

    this.rebuildMenu();

    this.tray.on('click', () => {
      this.callbacks.onTogglePet();
    });
  }

  public updateStatus(mood: PetMood, toolName: string) {
    this.currentMood = mood;
    this.activeTool = toolName;
    this.rebuildMenu();
  }

  public setPetVisible(visible: boolean) {
    this.isPetVisible = visible;
    this.rebuildMenu();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.rebuildMenu();
  }

  public setReactionsPaused(paused: boolean) {
    this.isReactionsPaused = paused;
    this.rebuildMenu();
  }

  public setPerformanceMode(perf: boolean) {
    this.isPerformanceMode = perf;
    this.rebuildMenu();
  }

  private rebuildMenu(): void {
    if (!this.tray) return;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'CodePet: Active',
        enabled: false
      },
      {
        label: `Pet Mood: ${this.currentMood}`,
        enabled: false
      },
      {
        label: `Active Tool: ${this.activeTool}`,
        enabled: false
      },
      { type: 'separator' },
      {
        label: this.isPetVisible ? 'Hide Pet' : 'Show Pet',
        click: () => {
          this.callbacks.onTogglePet();
        }
      },
      {
        label: 'Pause Reactions',
        type: 'checkbox',
        checked: this.isReactionsPaused,
        click: () => {
          this.callbacks.onToggleReactions();
        }
      },
      {
        label: 'Mute Sounds',
        type: 'checkbox',
        checked: this.isMuted,
        click: () => {
          this.callbacks.onToggleMute();
        }
      },
      {
        label: 'Performance Mode',
        type: 'checkbox',
        checked: this.isPerformanceMode,
        click: () => {
          this.callbacks.onTogglePerformance();
        }
      },
      { type: 'separator' },
      {
        label: 'Settings & Dashboard...',
        click: () => {
          this.callbacks.onOpenSettings();
        }
      },
      { type: 'separator' },
      {
        label: 'Quit CodePet',
        click: () => {
          this.callbacks.onQuit();
        }
      }
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  private createTrayIcon(): Electron.NativeImage {
    // 16x16 pixel cat icon in PNG base64 format
    // A clean black/white template pixel cat for macOS menu bar & Windows tray
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <rect x="3" y="2" width="2" height="2" fill="#333333"/>
        <rect x="11" y="2" width="2" height="2" fill="#333333"/>
        <rect x="2" y="4" width="12" height="8" fill="#333333"/>
        <rect x="4" y="6" width="2" height="2" fill="#ffffff"/>
        <rect x="10" y="6" width="2" height="2" fill="#ffffff"/>
        <rect x="7" y="8" width="2" height="1" fill="#ff70a6"/>
        <rect x="3" y="12" width="10" height="2" fill="#333333"/>
      </svg>
    `;
    const image = nativeImage.createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`);
    image.setTemplateImage(true);
    return image.resize({ width: 16, height: 16 });
  }

  public destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
