import { CodePetConfig, CodingEventType } from './types';

export const DEFAULT_CONFIG: CodePetConfig = {
  version: '1.0.0',
  onboardingCompleted: false,
  pet: {
    species: 'cat',
    name: 'Pixel',
    size: 'medium',
    animationSpeed: 1.0
  },
  appearance: {
    pixelScale: 4,
    skin: 'default',
    accessory: 'none',
    theme: 'dark',
    particlesEnabled: true
  },
  behavior: {
    idleFrequency: 'normal',
    reactionIntensity: 'normal',
    sleepAfterInactiveMinutes: 10,
    speechBubblesEnabled: true,
    speechBubbleDurationMs: 3500,
    speechBubbleFrequency: 'normal',
    customMessages: [],
    disabledDefaultMessages: []
  },
  sound: {
    enabled: true,
    masterVolume: 0.6,
    soundPack: '8bit',
    muteDuringQuietHours: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    perEventVolume: {}
  },
  system: {
    launchAtStartup: false,
    startMinimized: false,
    performanceMode: false,
    showInTray: true,
    alwaysOnTop: true,
    lockPosition: false,
    multiMonitorBehavior: 'remember',
    position: { x: 120, y: 120 }
  },
  tools: {
    enabledTools: [
      'claude-code',
      'cursor',
      'antigravity',
      'codex',
      'copilot',
      'windsurf',
      'generic-cli'
    ],
    customTools: []
  }
};

export const EVENT_PRIORITY_MAP: Record<CodingEventType, number> = {
  ERROR_DETECTED: 100,
  BUILD_FAILED: 90,
  TEST_FAILED: 85,
  BUILD_SUCCESS: 80,
  TEST_PASSED: 78,
  SESSION_ENDED: 75,
  CODE_GENERATED: 70,
  COMMAND_COMPLETED: 65,
  GENERATING: 60,
  THINKING: 55,
  PROMPT_SUBMITTED: 50,
  MANUAL_INTERACTION: 45,
  BUILD_STARTED: 40,
  TEST_STARTED: 40,
  COMMAND_RUNNING: 35,
  CODE_EDITED: 30,
  PROMPT_TYPED: 25,
  TOOL_STARTED: 20,
  SESSION_STARTED: 15,
  TOOL_IDLE: 5
};

export const SPEECH_LINES = {
  THINKING: [
    'thinking...',
    'one sec 👀',
    'pondering the prompt...',
    'crunching tokens...',
    'analyzing context...'
  ],
  GENERATING: [
    'typing code...',
    'cooking up a solution 🔥',
    'crafting syntax...',
    'generating magic...'
  ],
  BUILD_SUCCESS: [
    'build passed! ✨',
    'clean build!',
    'compiled like a charm!',
    'zero errors! 🎉'
  ],
  BUILD_FAILED: [
    'uh oh...',
    'build failed 😭',
    'compiler had a fit!',
    "let's check the stack trace"
  ],
  TEST_PASSED: [
    'all green 💚',
    '100% test pass!',
    'assertions satisfied!',
    'you nailed it!'
  ],
  TEST_FAILED: [
    'we broke something 😭',
    'test red! 🛑',
    'assertion error...',
    "let's fix this together"
  ],
  ERROR_DETECTED: [
    'runtime error!',
    'exception thrown!',
    'whoops! 👀',
    'hold on, bug spotted!'
  ],
  CELEBRATING: [
    'you cooked 🔥',
    'ship it! 🚀',
    'legendary dev move!',
    'clean code unlocked!',
    'flawless victory! 🏆'
  ],
  TIRED: [
    'coffee? ☕',
    'long session...',
    'remember to stretch!',
    'stay hydrated 💧'
  ],
  SLEEPING: [
    'zzz...',
    'dreaming of clean git history...',
    'sleep mode engaged...'
  ],
  IDLE: [
    'what are we building next?',
    'standing by...',
    'ready when you are!',
    '*stretches*',
    'curious about your code...'
  ],
  MANUAL_INTERACTION: [
    'meow! 🐾',
    'hehe that tickles!',
    '*happy purr*',
    'ready to pair program!',
    'pet received! +10 focus'
  ]
};

export const PET_SPECIES_META = [
  {
    id: 'cat',
    name: 'Pixel Cat',
    description: 'Agile, curious, purrs when code builds clean, naps when idle.',
    trait: 'Purrs on green builds, naps during long contemplation.'
  },
  {
    id: 'dog',
    name: 'Cyber Dog',
    description: 'Enthusiastic and loyal, jumps with joy when prompts finish.',
    trait: 'High energy, always excited to test and run commands.'
  },
  {
    id: 'fox',
    name: 'Code Fox',
    description: 'Clever and quick, sharp instincts for finding tricky bugs.',
    trait: 'Alert eyes when errors appear, quick celebratory spins.'
  },
  {
    id: 'penguin',
    name: 'Linux Penguin',
    description: 'Diligent, organized, slides around your screen on builds.',
    trait: 'Cool under pressure, slides across desktop on test pass.'
  },
  {
    id: 'robot',
    name: 'Byte Bot',
    description: 'Retro mechanical buddy with glowing antennas and digital smiles.',
    trait: 'Displays calculation matrix and beeps binary tones.'
  },
  {
    id: 'ghost',
    name: 'Git Ghost',
    description: 'Ethereal spirit of deleted branches, floats playfully.',
    trait: 'Hovers silently, phase shifts when syntax errors vanish.'
  },
  {
    id: 'dino',
    name: 'Emerald Dino',
    description: 'Mini prehistoric coder, wags heavy tail and roars tiny cheers on green tests.',
    trait: 'Raptor roar on build pass, coils tail when snoozing.'
  },
  {
    id: 'parrot',
    name: 'Tropical Parrot',
    description: 'Vibrant plumage, bobs head to keyboard rhythms and chirps on AI responses.',
    trait: 'Flaps wings in celebration, cocks head when reviewing code.'
  },
  {
    id: 'snake',
    name: 'Python Snake',
    description: 'Sleek, glossy green serpent that rests peacefully on your desktop.',
    trait: 'Tongue flick on prompt receive, coils into a spiral when sleeping.'
  },
  {
    id: 'custom',
    name: 'Custom Pet',
    description: 'Customizable pixel sprite with customizable palette.',
    trait: 'Full visual and behavioral flexibility.'
  }
];

export const TOOL_REGISTRY = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    category: 'ai-cli' as const,
    processNames: ['claude', 'claude-code'],
    description: 'Anthropic AI CLI coding agent in terminal'
  },
  {
    id: 'codex',
    name: 'Codex / OpenAI',
    category: 'ai-cli' as const,
    processNames: ['codex', 'openai'],
    description: 'OpenAI coding CLI & assistant'
  },
  {
    id: 'cursor',
    name: 'Cursor',
    category: 'ide' as const,
    processNames: ['Cursor', 'cursor'],
    description: 'AI-first code editor'
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    category: 'ide' as const,
    processNames: ['Antigravity', 'antigravity', 'agy'],
    description: 'Google DeepMind advanced agentic coding environment'
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    category: 'agent' as const,
    processNames: ['copilot-agent', 'github-copilot'],
    description: 'GitHub Copilot agent & language server'
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    category: 'ide' as const,
    processNames: ['Windsurf', 'windsurf'],
    description: 'Codeium agentic IDE'
  },
  {
    id: 'cline',
    name: 'Cline',
    category: 'agent' as const,
    processNames: ['cline'],
    description: 'Autonomous coding agent in VS Code'
  },
  {
    id: 'roo-code',
    name: 'Roo Code',
    category: 'agent' as const,
    processNames: ['roo-cline', 'roo-code'],
    description: 'Roo Code AI assistant'
  },
  {
    id: 'aider',
    name: 'Aider',
    category: 'ai-cli' as const,
    processNames: ['aider'],
    description: 'AI pair programming in your terminal'
  },
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    category: 'ai-cli' as const,
    processNames: ['gemini', 'gemini-cli'],
    description: 'Google Gemini CLI developer assistant'
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    category: 'ai-cli' as const,
    processNames: ['opencode'],
    description: 'Open source terminal AI assistant'
  },
  {
    id: 'continue',
    name: 'Continue',
    category: 'agent' as const,
    processNames: ['continue'],
    description: 'Open-source AI code assistant'
  },
  {
    id: 'generic-cli',
    name: 'Terminal / Git / Build Watcher',
    category: 'generic' as const,
    processNames: ['npm', 'pnpm', 'yarn', 'cargo', 'pytest', 'vitest', 'go', 'git', 'make'],
    description: 'Watches common build runners, git commits, and test commands'
  }
];
