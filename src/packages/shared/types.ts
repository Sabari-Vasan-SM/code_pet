export type CodingEventType =
  | 'TOOL_STARTED'
  | 'PROMPT_TYPED'
  | 'PROMPT_SUBMITTED'
  | 'THINKING'
  | 'GENERATING'
  | 'COMMAND_RUNNING'
  | 'COMMAND_COMPLETED'
  | 'CODE_GENERATED'
  | 'CODE_EDITED'
  | 'BUILD_STARTED'
  | 'BUILD_SUCCESS'
  | 'BUILD_FAILED'
  | 'TEST_STARTED'
  | 'TEST_PASSED'
  | 'TEST_FAILED'
  | 'ERROR_DETECTED'
  | 'TERMINAL_COMMAND'
  | 'TOOL_IDLE'
  | 'SESSION_STARTED'
  | 'SESSION_ENDED'
  | 'MANUAL_INTERACTION';

export type CodingToolId =
  | 'claude-code'
  | 'codex'
  | 'cursor'
  | 'antigravity'
  | 'copilot'
  | 'windsurf'
  | 'cline'
  | 'roo-code'
  | 'aider'
  | 'gemini-cli'
  | 'opencode'
  | 'continue'
  | 'generic-cli'
  | string;

export interface NormalizedCodingEvent {
  id: string;
  type: CodingEventType;
  tool: CodingToolId;
  toolName?: string;
  timestamp: number;
  priority: number; // Higher number = higher priority
  data?: Record<string, any>;
  message?: string;
}

export type PetSpecies =
  | 'cat'
  | 'dog'
  | 'fox'
  | 'penguin'
  | 'robot'
  | 'ghost'
  | 'custom';

export type PetAnimationState =
  | 'IDLE'
  | 'WALKING'
  | 'SLEEPING'
  | 'THINKING'
  | 'CODING'
  | 'EXCITED'
  | 'HAPPY'
  | 'SAD'
  | 'CONFUSED'
  | 'ERROR'
  | 'CELEBRATING'
  | 'TIRED'
  | 'PLAYING';

export type PetMood =
  | 'Happy'
  | 'Excited'
  | 'Curious'
  | 'Focused'
  | 'Thinking'
  | 'Confused'
  | 'Surprised'
  | 'Sad'
  | 'Angry'
  | 'Sleepy'
  | 'Bored'
  | 'Proud'
  | 'Celebrating'
  | 'Tired';

export type PetAccessory =
  | 'none'
  | 'wizard-hat'
  | 'top-hat'
  | 'cool-glasses'
  | 'bowtie'
  | 'developer-headset'
  | 'halo';

export type PetSkin =
  | 'default'
  | 'neon'
  | 'pastel'
  | 'retro-monochrome'
  | 'golden'
  | 'cyberpunk';

export type PetSize = 'small' | 'medium' | 'large' | 'xl';

export interface CustomToolConfig {
  id: string;
  name: string;
  executablePath?: string;
  detectionCommand?: string;
  logPath?: string;
  enabled: boolean;
}

export interface SoundSettings {
  enabled: boolean;
  masterVolume: number; // 0.0 - 1.0
  soundPack: '8bit' | 'soft' | 'arcade';
  muteDuringQuietHours: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "08:00"
  perEventVolume: Record<string, number>;
}

export interface BehaviorSettings {
  idleFrequency: 'low' | 'normal' | 'high';
  reactionIntensity: 'subtle' | 'normal' | 'expressive';
  sleepAfterInactiveMinutes: number;
  speechBubblesEnabled: boolean;
  speechBubbleDurationMs: number;
  speechBubbleFrequency: 'low' | 'normal' | 'high';
  customMessages: string[];
  disabledDefaultMessages: string[];
}

export interface AppearanceSettings {
  pixelScale: number; // 2, 3, 4, 5
  skin: PetSkin;
  accessory: PetAccessory;
  theme: 'dark' | 'light' | 'retro';
  particlesEnabled: boolean;
}

export interface SystemSettings {
  launchAtStartup: boolean;
  startMinimized: boolean;
  performanceMode: boolean;
  showInTray: boolean;
  alwaysOnTop: boolean;
  lockPosition: boolean;
  multiMonitorBehavior: 'primary' | 'remember' | 'follow-mouse';
  position: { x: number; y: number };
}

export interface DeveloperSessionStats {
  sessionStartTime: number;
  activeCodingMs: number;
  lastActiveTime: number;
  promptsCompleted: number;
  buildsCount: number;
  buildsSuccess: number;
  buildsFailed: number;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  linesEdited: number;
  petAffectionLevel: number; // 0 - 100
}

export interface CodePetConfig {
  version: string;
  onboardingCompleted: boolean;
  pet: {
    species: PetSpecies;
    name: string;
    size: PetSize;
    animationSpeed: number; // 0.5 - 2.0
  };
  appearance: AppearanceSettings;
  behavior: BehaviorSettings;
  sound: SoundSettings;
  system: SystemSettings;
  tools: {
    enabledTools: string[];
    customTools: CustomToolConfig[];
  };
}

export interface ToolStatus {
  id: string;
  name: string;
  category: 'ai-cli' | 'ide' | 'agent' | 'generic';
  connected: boolean;
  installed: boolean;
  statusText: string;
  lastEventTime?: number;
}

export interface PetReaction {
  state: PetAnimationState;
  mood: PetMood;
  durationMs: number;
  speech?: string;
  sound?: string;
  particle?: 'sparkles' | 'hearts' | 'sweat' | 'stars' | 'confetti' | 'zzz' | 'exclamation';
}
