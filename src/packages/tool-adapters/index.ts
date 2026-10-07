import {
  CodingEventType,
  CodingToolId,
  NormalizedCodingEvent,
  ToolStatus,
  CustomToolConfig
} from '../shared/types';
import { TOOL_REGISTRY } from '../shared/constants';
import * as http from 'http';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

export type EventEmitCallback = (
  event: Omit<NormalizedCodingEvent, 'id' | 'timestamp' | 'priority'> & { priority?: number; timestamp?: number }
) => void;

export abstract class BaseToolAdapter {
  public abstract readonly id: CodingToolId;
  public abstract readonly name: string;
  public abstract readonly category: 'ai-cli' | 'ide' | 'agent' | 'generic';
  protected isRunning: boolean = false;
  protected emitCallback?: EventEmitCallback;

  public setEmitCallback(callback: EventEmitCallback) {
    this.emitCallback = callback;
  }

  public abstract isAvailable(): Promise<boolean>;
  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;

  protected emit(
    type: CodingEventType,
    options?: { message?: string; data?: Record<string, any>; priority?: number }
  ) {
    if (this.emitCallback) {
      this.emitCallback({
        type,
        tool: this.id,
        toolName: this.name,
        message: options?.message,
        data: options?.data,
        priority: options?.priority
      });
    }
  }

  public getStatus(): ToolStatus {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      connected: this.isRunning,
      installed: false,
      statusText: this.isRunning ? 'Active / Monitoring' : 'Idle'
    };
  }
}

// Utility: Check if a process name is running in macOS / Linux or Windows
export function checkProcessRunning(processNames: string[]): Promise<boolean> {
  return new Promise(resolve => {
    const isWin = process.platform === 'win32';
    const cmd = isWin ? 'tasklist' : 'ps -e -o comm=';

    exec(cmd, { timeout: 3000 }, (error, stdout) => {
      if (error || !stdout) {
        resolve(false);
        return;
      }
      const lowerOut = stdout.toLowerCase();
      const found = processNames.some(name => lowerOut.includes(name.toLowerCase()));
      resolve(found);
    });
  });
}

// Claude Code CLI Adapter
export class ClaudeCodeAdapter extends BaseToolAdapter {
  public readonly id = 'claude-code';
  public readonly name = 'Claude Code';
  public readonly category = 'ai-cli' as const;
  private pollInterval?: NodeJS.Timeout;
  private lastState: boolean = false;

  public async isAvailable(): Promise<boolean> {
    const home = os.homedir();
    const claudeDir = path.join(home, '.claude');
    return fs.existsSync(claudeDir) || (await checkProcessRunning(['claude', 'claude-code']));
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    this.pollInterval = setInterval(async () => {
      const active = await checkProcessRunning(['claude', 'claude-code']);
      if (active && !this.lastState) {
        this.emit('TOOL_STARTED', { message: 'Claude Code launched in terminal' });
      } else if (!active && this.lastState) {
        this.emit('TOOL_IDLE', { message: 'Claude Code session completed' });
      }
      this.lastState = active;
    }, 4000);
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}

// Codex / OpenAI Adapter
export class CodexAdapter extends BaseToolAdapter {
  public readonly id = 'codex';
  public readonly name = 'Codex';
  public readonly category = 'ai-cli' as const;
  private pollInterval?: NodeJS.Timeout;

  public async isAvailable(): Promise<boolean> {
    return checkProcessRunning(['codex', 'openai']);
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    this.pollInterval = setInterval(async () => {
      const active = await checkProcessRunning(['codex', 'openai']);
      if (active) {
        this.emit('GENERATING', { message: 'Codex processing request' });
      }
    }, 6000);
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}

// Cursor Adapter
export class CursorAdapter extends BaseToolAdapter {
  public readonly id = 'cursor';
  public readonly name = 'Cursor';
  public readonly category = 'ide' as const;
  private pollInterval?: NodeJS.Timeout;

  public async isAvailable(): Promise<boolean> {
    return checkProcessRunning(['Cursor', 'cursor']);
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    this.pollInterval = setInterval(async () => {
      const active = await checkProcessRunning(['Cursor', 'cursor']);
      if (active) {
        // Active IDE detected
      }
    }, 5000);
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}

// Antigravity Adapter
export class AntigravityAdapter extends BaseToolAdapter {
  public readonly id = 'antigravity';
  public readonly name = 'Antigravity';
  public readonly category = 'ide' as const;
  private pollInterval?: NodeJS.Timeout;
  private watchedLogPath?: string;

  public async isAvailable(): Promise<boolean> {
    const home = os.homedir();
    const agyConfig = path.join(home, '.gemini/antigravity-ide');
    return fs.existsSync(agyConfig) || (await checkProcessRunning(['Antigravity', 'antigravity', 'agy']));
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    this.pollInterval = setInterval(async () => {
      const active = await checkProcessRunning(['Antigravity', 'antigravity', 'agy']);
      if (active) {
        // Can emit periodic active status if needed
      }
    }, 5000);
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}

// GitHub Copilot Adapter
export class CopilotAdapter extends BaseToolAdapter {
  public readonly id = 'copilot';
  public readonly name = 'GitHub Copilot';
  public readonly category = 'agent' as const;
  private pollInterval?: NodeJS.Timeout;

  public async isAvailable(): Promise<boolean> {
    return checkProcessRunning(['copilot-agent', 'github-copilot']);
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    this.pollInterval = setInterval(async () => {
      await checkProcessRunning(['copilot-agent', 'github-copilot']);
    }, 6000);
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}

// Windsurf Adapter
export class WindsurfAdapter extends BaseToolAdapter {
  public readonly id = 'windsurf';
  public readonly name = 'Windsurf';
  public readonly category = 'ide' as const;
  private pollInterval?: NodeJS.Timeout;

  public async isAvailable(): Promise<boolean> {
    return checkProcessRunning(['Windsurf', 'windsurf']);
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    this.pollInterval = setInterval(async () => {
      await checkProcessRunning(['Windsurf', 'windsurf']);
    }, 5000);
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}

// Generic CLI & Build Watcher Adapter (Terminal commands, git, build runners)
export class GenericCliAdapter extends BaseToolAdapter {
  public readonly id = 'generic-cli';
  public readonly name = 'Terminal & Build Watcher';
  public readonly category = 'generic' as const;
  private pollInterval?: NodeJS.Timeout;
  private lastDetectedCommands: Set<string> = new Set();

  public async isAvailable(): Promise<boolean> {
    return true; // Always available on any developer machine
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    const targets = ['npm', 'pnpm', 'yarn', 'cargo', 'pytest', 'vitest', 'go', 'git'];

    this.pollInterval = setInterval(async () => {
      for (const cmd of targets) {
        const isRunning = await checkProcessRunning([cmd]);
        if (isRunning && !this.lastDetectedCommands.has(cmd)) {
          this.lastDetectedCommands.add(cmd);
          if (cmd === 'pytest' || cmd === 'vitest') {
            this.emit('TEST_STARTED', { message: `Running tests with ${cmd}` });
          } else if (cmd === 'cargo' || cmd === 'npm') {
            this.emit('BUILD_STARTED', { message: `Build initiated via ${cmd}` });
          } else {
            this.emit('COMMAND_RUNNING', { message: `Running ${cmd} in terminal` });
          }
        } else if (!isRunning && this.lastDetectedCommands.has(cmd)) {
          this.lastDetectedCommands.delete(cmd);
          if (cmd === 'pytest' || cmd === 'vitest') {
            this.emit('TEST_PASSED', { message: `Tests finished on ${cmd}` });
          } else if (cmd === 'cargo' || cmd === 'npm') {
            this.emit('BUILD_SUCCESS', { message: `Build completed for ${cmd}` });
          } else {
            this.emit('COMMAND_COMPLETED', { message: `Completed ${cmd}` });
          }
        }
      }
    }, 2500);
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.lastDetectedCommands.clear();
  }
}

// Custom Tool Adapter configured by user
export class CustomToolAdapter extends BaseToolAdapter {
  public readonly id: string;
  public readonly name: string;
  public readonly category = 'agent' as const;
  private config: CustomToolConfig;
  private pollInterval?: NodeJS.Timeout;

  constructor(config: CustomToolConfig) {
    super();
    this.id = config.id;
    this.name = config.name;
    this.config = config;
  }

  public async isAvailable(): Promise<boolean> {
    if (this.config.executablePath && fs.existsSync(this.config.executablePath)) {
      return true;
    }
    if (this.config.detectionCommand) {
      return checkProcessRunning([this.config.detectionCommand]);
    }
    return false;
  }

  public async start(): Promise<void> {
    if (!this.config.enabled) return;
    this.isRunning = true;
    if (this.config.detectionCommand) {
      this.pollInterval = setInterval(async () => {
        const active = await checkProcessRunning([this.config.detectionCommand!]);
        if (active) {
          this.emit('COMMAND_RUNNING', { message: `${this.name} active` });
        }
      }, 5000);
    }
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}

// Local Webhook & CLI IPC Server (Allows curl / scripts / CLI to emit events: http://127.0.0.1:41738/event)
export class LocalWebhookAdapter extends BaseToolAdapter {
  public readonly id = 'local-webhook';
  public readonly name = 'CodePet Event Hook Server';
  public readonly category = 'generic' as const;
  private server: http.Server | null = null;
  private port: number = 41738;

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async start(): Promise<void> {
    if (this.server) return;

    this.server = http.createServer((req, res) => {
      // Set CORS for local development
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      if (req.method === 'GET' && req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', name: 'CodePet Event Server', version: '1.0.0' }));
        return;
      }

      if (req.method === 'POST' && (req.url === '/event' || req.url === '/emit')) {
        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const eventType: CodingEventType = data.type || data.event || 'MANUAL_INTERACTION';
            const tool = data.tool || 'generic-cli';
            const message = data.message;
            const eventData = data.data;

            this.emit(eventType, {
              message,
              data: eventData
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, received: eventType }));
          } catch (e: any) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
          }
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    return new Promise(resolve => {
      this.server?.listen(this.port, '127.0.0.1', () => {
        this.isRunning = true;
        resolve();
      });

      this.server?.on('error', err => {
        console.warn('CodePet Local Webhook port in use or error:', err.message);
        resolve();
      });
    });
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}

// Tool Adapter Manager orchestrating all adapters
export class ToolAdapterManager {
  private adapters: Map<string, BaseToolAdapter> = new Map();
  private emitCallback?: EventEmitCallback;

  constructor() {
    this.registerAdapter(new ClaudeCodeAdapter());
    this.registerAdapter(new CodexAdapter());
    this.registerAdapter(new CursorAdapter());
    this.registerAdapter(new AntigravityAdapter());
    this.registerAdapter(new CopilotAdapter());
    this.registerAdapter(new WindsurfAdapter());
    this.registerAdapter(new GenericCliAdapter());
    this.registerAdapter(new LocalWebhookAdapter());
  }

  public setEmitCallback(callback: EventEmitCallback) {
    this.emitCallback = callback;
    for (const adapter of this.adapters.values()) {
      adapter.setEmitCallback(callback);
    }
  }

  public registerAdapter(adapter: BaseToolAdapter): void {
    if (this.emitCallback) {
      adapter.setEmitCallback(this.emitCallback);
    }
    this.adapters.set(adapter.id, adapter);
  }

  public registerCustomTools(customTools: CustomToolConfig[]): void {
    for (const custom of customTools) {
      const adapter = new CustomToolAdapter(custom);
      this.registerAdapter(adapter);
    }
  }

  public async startEnabledAdapters(enabledToolIds: string[]): Promise<void> {
    // Always start LocalWebhookAdapter so CLI emit works
    const webhook = this.adapters.get('local-webhook');
    if (webhook) await webhook.start();

    for (const [id, adapter] of this.adapters.entries()) {
      if (id === 'local-webhook') continue;
      if (enabledToolIds.includes(id)) {
        await adapter.start();
      } else {
        await adapter.stop();
      }
    }
  }

  public async stopAll(): Promise<void> {
    for (const adapter of this.adapters.values()) {
      await adapter.stop();
    }
  }

  public async getAllStatuses(): Promise<ToolStatus[]> {
    const statuses: ToolStatus[] = [];
    for (const adapter of this.adapters.values()) {
      if (adapter.id === 'local-webhook') continue;
      const status = adapter.getStatus();
      status.installed = await adapter.isAvailable();
      statuses.push(status);
    }
    return statuses;
  }

  public getAdapter(id: string): BaseToolAdapter | undefined {
    return this.adapters.get(id);
  }
}
