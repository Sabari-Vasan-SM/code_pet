import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { CodePetConfig, DeveloperSessionStats } from '../shared/types';
import { DEFAULT_CONFIG } from '../shared/constants';

export class ConfigStorage {
  private configPath: string;
  private statsPath: string;
  private currentConfig: CodePetConfig;

  constructor(customDirectory?: string) {
    const dir = customDirectory || this.getDefaultConfigDir();
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (err) {
        console.warn('Failed to create config dir, using fallback:', err);
      }
    }
    this.configPath = path.join(dir, 'codepet-config.json');
    this.statsPath = path.join(dir, 'codepet-stats.json');
    this.currentConfig = this.loadConfig();
  }

  private getDefaultConfigDir(): string {
    const home = os.homedir();
    if (process.platform === 'darwin') {
      return path.join(home, 'Library', 'Application Support', 'CodePet');
    } else if (process.platform === 'win32') {
      return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'CodePet');
    }
    return path.join(home, '.config', 'codepet');
  }

  public loadConfig(): CodePetConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, 'utf8');
        const parsed = JSON.parse(raw);
        // Merge deep with DEFAULT_CONFIG
        this.currentConfig = {
          ...DEFAULT_CONFIG,
          ...parsed,
          pet: { ...DEFAULT_CONFIG.pet, ...(parsed.pet || {}) },
          appearance: { ...DEFAULT_CONFIG.appearance, ...(parsed.appearance || {}) },
          behavior: { ...DEFAULT_CONFIG.behavior, ...(parsed.behavior || {}) },
          sound: { ...DEFAULT_CONFIG.sound, ...(parsed.sound || {}) },
          system: { ...DEFAULT_CONFIG.system, ...(parsed.system || {}) },
          tools: {
            enabledTools: parsed.tools?.enabledTools || DEFAULT_CONFIG.tools.enabledTools,
            customTools: parsed.tools?.customTools || []
          }
        };
        return this.currentConfig;
      }
    } catch (e) {
      console.error('Failed to parse config file, using defaults:', e);
    }
    this.currentConfig = { ...DEFAULT_CONFIG };
    this.saveConfig(this.currentConfig);
    return this.currentConfig;
  }

  public saveConfig(config: CodePetConfig): void {
    this.currentConfig = config;
    try {
      const tempPath = `${this.configPath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(config, null, 2), 'utf8');
      fs.renameSync(tempPath, this.configPath);
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  }

  public getConfig(): CodePetConfig {
    return this.currentConfig;
  }

  public updateConfig(partial: Partial<CodePetConfig>): CodePetConfig {
    const updated = {
      ...this.currentConfig,
      ...partial
    };
    this.saveConfig(updated);
    return updated;
  }

  public saveSessionStats(stats: DeveloperSessionStats): void {
    try {
      const tempPath = `${this.statsPath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(stats, null, 2), 'utf8');
      fs.renameSync(tempPath, this.statsPath);
    } catch (err) {
      console.error('Failed to save stats:', err);
    }
  }

  public loadSessionStats(): DeveloperSessionStats | null {
    try {
      if (fs.existsSync(this.statsPath)) {
        const raw = fs.readFileSync(this.statsPath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load session stats:', e);
    }
    return null;
  }
}
