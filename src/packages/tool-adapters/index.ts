import {
  CodingEventType,
  CodingToolId,
  NormalizedCodingEvent,
  ToolStatus,
  CustomToolConfig
} from '../shared/types';
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

// Low-CPU Cached Process Checker (prevents continuous subshell spawning)
class ProcessMonitorCache {
  private static cachedOutput: string = '';
  private static lastCheckTime: number = 0;
  private static isChecking: boolean = false;
  private static cacheDurationMs: number = 20000; // 20s cache to keep Mac cool

  public static async isProcessRunning(names: string[]): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastCheckTime > this.cacheDurationMs && !this.isChecking) {
      await this.refreshProcessList();
    }
    const lower = this.cachedOutput.toLowerCase();
    return names.some(n => lower.includes(n.toLowerCase()));
  }

  private static refreshProcessList(): Promise<void> {
    return new Promise(resolve => {
      this.isChecking = true;
      const isWin = process.platform === 'win32';
      const cmd = isWin ? 'tasklist' : 'ps -e -o comm=';

      exec(cmd, { timeout: 4000 }, (err, stdout) => {
        this.isChecking = false;
        this.lastCheckTime = Date.now();
        if (!err && stdout) {
          this.cachedOutput = stdout;
        }
        resolve();
      });
    });
  }
}

// Real-Time Antigravity Agent & IDE Adapter
export class AntigravityAdapter extends BaseToolAdapter {
  public readonly id = 'antigravity';
  public readonly name = 'Antigravity';
  public readonly category = 'ide' as const;

  private activeTranscriptPath: string | null = null;
  private fileWatcher: fs.FSWatcher | null = null;
  private brainWatcher: fs.FSWatcher | null = null;
  private lastFileOffset: number = 0;
  private sessionScanInterval?: NodeJS.Timeout;
  private workspaceWatcher: fs.FSWatcher | null = null;

  public async isAvailable(): Promise<boolean> {
    const home = os.homedir();
    const agyConfig = path.join(home, '.gemini/antigravity-ide');
    return fs.existsSync(agyConfig) || (await ProcessMonitorCache.isProcessRunning(['Antigravity', 'antigravity', 'agy']));
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    this.findAndWatchActiveTranscript();

    // Re-check for new conversation every 30 seconds
    this.sessionScanInterval = setInterval(() => {
      this.findAndWatchActiveTranscript();
    }, 30000);

    // Also watch current workspace directory for live file edits
    this.watchWorkspaceFiles();
  }

  private findAndWatchActiveTranscript() {
    const home = os.homedir();
    const brainDir = path.join(home, '.gemini/antigravity-ide/brain');
    if (!fs.existsSync(brainDir)) return;

    try {
      const entries = fs.readdirSync(brainDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && d.name !== 'tempmediaStorage')
        .map(d => {
          const logPath = path.join(brainDir, d.name, '.system_generated/logs/transcript.jsonl');
          const hasLog = fs.existsSync(logPath);
          const mtime = hasLog ? fs.statSync(logPath).mtimeMs : 0;
          return { logPath, hasLog, mtime };
        })
        .filter(e => e.hasLog)
        .sort((a, b) => b.mtime - a.mtime);

      if (entries.length > 0) {
        const latestLog = entries[0].logPath;
        if (latestLog !== this.activeTranscriptPath) {
          this.attachTranscriptWatcher(latestLog);
        }
      }
    } catch (err) {
      console.warn('Antigravity session scan error:', err);
    }
  }

  private attachTranscriptWatcher(logPath: string) {
    if (this.fileWatcher) {
      this.fileWatcher.close();
      this.fileWatcher = null;
    }

    this.activeTranscriptPath = logPath;
    try {
      // Start reading from current end of file
      const stats = fs.statSync(logPath);
      this.lastFileOffset = stats.size;

      // Event-driven zero-CPU file watcher via kernel FSEvents
      this.fileWatcher = fs.watch(logPath, (eventType) => {
        if (eventType === 'change') {
          this.readNewTranscriptLines();
        }
      });
    } catch (err) {
      console.warn('Failed to watch transcript:', err);
    }
  }

  private readNewTranscriptLines() {
    if (!this.activeTranscriptPath || !fs.existsSync(this.activeTranscriptPath)) return;

    try {
      const stats = fs.statSync(this.activeTranscriptPath);
      if (stats.size < this.lastFileOffset) {
        // File truncated/restarted
        this.lastFileOffset = 0;
      }
      if (stats.size === this.lastFileOffset) return;

      const stream = fs.createReadStream(this.activeTranscriptPath, {
        start: this.lastFileOffset,
        end: stats.size
      });

      this.lastFileOffset = stats.size;
      let buffer = '';

      stream.on('data', chunk => {
        buffer += chunk.toString();
      });

      stream.on('end', () => {
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const entry = JSON.parse(line);
            this.handleTranscriptEntry(entry);
          } catch (e) {
            // Partial line
          }
        }
      });
    } catch (err) {
      console.warn('Error reading transcript stream:', err);
    }
  }

  private handleTranscriptEntry(entry: any) {
    // 1. User prompt submitted
    if (entry.type === 'USER_INPUT') {
      this.emit('PROMPT_SUBMITTED', {
        message: 'Prompt received! Analyzing request 👀',
        priority: 50
      });
      return;
    }

    // 2. Antigravity thinking & planning
    if (entry.type === 'PLANNER_RESPONSE') {
      if (entry.thinking || (entry.content && !entry.tool_calls)) {
        this.emit('THINKING', {
          message: 'pondering solution...',
          priority: 55
        });
      }

      // 3. Coding & tool execution
      if (Array.isArray(entry.tool_calls) && entry.tool_calls.length > 0) {
        const hasCodeEdit = entry.tool_calls.some(
          (t: any) => t.name === 'write_to_file' || t.name === 'replace_file_content' || t.name === 'multi_replace_file_content'
        );
        const hasCommand = entry.tool_calls.some((t: any) => t.name === 'run_command');

        if (hasCodeEdit) {
          this.emit('GENERATING', {
            message: 'writing code... 🔥',
            priority: 65
          });
        } else if (hasCommand) {
          this.emit('COMMAND_RUNNING', {
            message: 'executing command in shell...',
            priority: 45
          });
        }
      }
      return;
    }

    // 4. Command exit & execution completion
    if (entry.type === 'RUN_COMMAND' || entry.type === 'RUN_COMMAND_OUTPUT') {
      if (entry.exit_code === 0) {
        this.emit('BUILD_SUCCESS', {
          message: 'task passed! ✨',
          priority: 80
        });
      } else if (entry.exit_code && entry.exit_code !== 0) {
        this.emit('BUILD_FAILED', {
          message: 'command error detected 😭',
          priority: 90
        });
      }
      return;
    }

    // 5. Turn completed (Model finished work)
    if (entry.status === 'DONE' && entry.source === 'MODEL' && !entry.tool_calls) {
      this.emit('CODE_GENERATED', {
        message: 'code complete! you cooked 🔥',
        priority: 75
      });
    }
  }

  // Watch current workspace directory for file changes
  private watchWorkspaceFiles() {
    const cwd = process.cwd();
    try {
      this.workspaceWatcher = fs.watch(cwd, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        // Ignore build artifacts & git
        if (
          filename.includes('.git') ||
          filename.includes('node_modules') ||
          filename.includes('dist') ||
          filename.includes('release') ||
          filename.endsWith('.log')
        ) {
          return;
        }

        this.emit('CODE_EDITED', {
          message: `Edited ${path.basename(filename)}`,
          priority: 30
        });
      });
    } catch (err) {
      // Recursive watch might not be supported on all OS
    }
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.fileWatcher) {
      this.fileWatcher.close();
      this.fileWatcher = null;
    }
    if (this.sessionScanInterval) {
      clearInterval(this.sessionScanInterval);
    }
    if (this.workspaceWatcher) {
      this.workspaceWatcher.close();
      this.workspaceWatcher = null;
    }
  }
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
    return fs.existsSync(claudeDir) || (await ProcessMonitorCache.isProcessRunning(['claude', 'claude-code']));
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    this.pollInterval = setInterval(async () => {
      const active = await ProcessMonitorCache.isProcessRunning(['claude', 'claude-code']);
      if (active && !this.lastState) {
        this.emit('TOOL_STARTED', { message: 'Claude Code launched in terminal' });
      } else if (!active && this.lastState) {
        this.emit('TOOL_IDLE', { message: 'Claude Code session completed' });
      }
      this.lastState = active;
    }, 20000); // 20s interval for cool Mac
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
    return ProcessMonitorCache.isProcessRunning(['Cursor', 'cursor']);
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    this.pollInterval = setInterval(async () => {
      await ProcessMonitorCache.isProcessRunning(['Cursor', 'cursor']);
    }, 25000);
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}

// Codex Adapter
export class CodexAdapter extends BaseToolAdapter {
  public readonly id = 'codex';
  public readonly name = 'Codex';
  public readonly category = 'ai-cli' as const;
  private pollInterval?: NodeJS.Timeout;

  public async isAvailable(): Promise<boolean> {
    return ProcessMonitorCache.isProcessRunning(['codex', 'openai']);
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    this.pollInterval = setInterval(async () => {
      await ProcessMonitorCache.isProcessRunning(['codex', 'openai']);
    }, 25000);
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
    return ProcessMonitorCache.isProcessRunning(['copilot-agent', 'github-copilot']);
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    this.pollInterval = setInterval(async () => {
      await ProcessMonitorCache.isProcessRunning(['copilot-agent', 'github-copilot']);
    }, 25000);
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
    return ProcessMonitorCache.isProcessRunning(['Windsurf', 'windsurf']);
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    this.pollInterval = setInterval(async () => {
      await ProcessMonitorCache.isProcessRunning(['Windsurf', 'windsurf']);
    }, 25000);
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}

// Generic CLI & Build Watcher Adapter (Low-CPU Event-Driven)
export class GenericCliAdapter extends BaseToolAdapter {
  public readonly id = 'generic-cli';
  public readonly name = 'Terminal & Build Watcher';
  public readonly category = 'generic' as const;
  private pollInterval?: NodeJS.Timeout;

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    const targets = ['pytest', 'vitest', 'cargo'];

    this.pollInterval = setInterval(async () => {
      for (const cmd of targets) {
        const isRunning = await ProcessMonitorCache.isProcessRunning([cmd]);
        if (isRunning) {
          this.emit('COMMAND_RUNNING', { message: `Running ${cmd}` });
          break;
        }
      }
    }, 15000);
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}

// Custom Tool Adapter
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
      return ProcessMonitorCache.isProcessRunning([this.config.detectionCommand]);
    }
    return false;
  }

  public async start(): Promise<void> {
    if (!this.config.enabled) return;
    this.isRunning = true;
    if (this.config.detectionCommand) {
      this.pollInterval = setInterval(async () => {
        const active = await ProcessMonitorCache.isProcessRunning([this.config.detectionCommand!]);
        if (active) {
          this.emit('COMMAND_RUNNING', { message: `${this.name} active` });
        }
      }, 20000);
    }
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}

// Local Webhook & CLI IPC Server (Allows curl/scripts/CLI: http://127.0.0.1:41738/event)
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
        console.warn('CodePet Local Webhook port error:', err.message);
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

// Tool Adapter Manager
export class ToolAdapterManager {
  private adapters: Map<string, BaseToolAdapter> = new Map();
  private emitCallback?: EventEmitCallback;

  constructor() {
    this.registerAdapter(new AntigravityAdapter());
    this.registerAdapter(new ClaudeCodeAdapter());
    this.registerAdapter(new CursorAdapter());
    this.registerAdapter(new CodexAdapter());
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
    // Always start Antigravity and LocalWebhook
    const webhook = this.adapters.get('local-webhook');
    if (webhook) await webhook.start();

    const agy = this.adapters.get('antigravity');
    if (agy) await agy.start();

    for (const [id, adapter] of this.adapters.entries()) {
      if (id === 'local-webhook' || id === 'antigravity') continue;
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
