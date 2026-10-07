import { PixelSpriteEngine } from '../../packages/animation-engine';
import { ChiptuneSoundEngine } from '../../packages/sound-engine';
import {
  CodePetConfig,
  PetAnimationState,
  PetReaction,
  PetSpecies,
  PetSkin,
  PetAccessory
} from '../../packages/shared/types';
import { DEFAULT_CONFIG } from '../../packages/shared/constants';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  shape: 'square' | 'circle' | 'heart' | 'star' | 'letter';
  char?: string;
}

class DesktopPetController {
  private config: CodePetConfig = DEFAULT_CONFIG;
  private spriteEngine = new PixelSpriteEngine();
  private soundEngine = new ChiptuneSoundEngine(DEFAULT_CONFIG.sound);

  private petCanvas: HTMLCanvasElement;
  private petCtx: CanvasRenderingContext2D;
  private particleCanvas: HTMLCanvasElement;
  private particleCtx: CanvasRenderingContext2D;

  private speechBubble: HTMLElement;
  private speechText: HTMLElement;
  private petContainer: HTMLElement;
  private contextMenu: HTMLElement;

  private currentState: PetAnimationState = 'IDLE';
  private frameIndex: number = 0;
  private lastFrameTime: number = 0;
  private particles: Particle[] = [];
  private speechTimer?: NodeJS.Timeout;

  // Dragging state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private initialWinX = 0;
  private initialWinY = 0;

  constructor() {
    this.petCanvas = document.getElementById('pet-canvas') as HTMLCanvasElement;
    this.petCtx = this.petCanvas.getContext('2d')!;
    this.particleCanvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
    this.particleCtx = this.particleCanvas.getContext('2d')!;

    this.speechBubble = document.getElementById('speech-bubble')!;
    this.speechText = document.getElementById('speech-text')!;
    this.petContainer = document.getElementById('pet-container')!;
    this.contextMenu = document.getElementById('context-menu')!;

    this.init();
  }

  private async init() {
    // Load config from main
    if ((window as any).codePetApi) {
      try {
        const loadedConfig = await (window as any).codePetApi.getConfig();
        if (loadedConfig) {
          this.config = loadedConfig;
          this.soundEngine.updateSettings(this.config.sound);
        }
      } catch (err) {
        console.warn('Failed to load initial config:', err);
      }

      // Listen for reactions
      (window as any).codePetApi.onReaction((reaction: PetReaction) => {
        this.handleReaction(reaction);
      });

      // Listen for config updates
      (window as any).codePetApi.onConfigUpdated((newConfig: CodePetConfig) => {
        this.config = newConfig;
        this.soundEngine.updateSettings(newConfig.sound);
        this.updateScale();
      });
    }

    this.setupInteractions();
    this.updateScale();
    this.startAnimationLoop();

    // Initial greeting
    setTimeout(() => {
      this.showSpeech('hello dev! 👋', 3000);
      this.soundEngine.play('happy');
    }, 800);
  }

  private updateScale() {
    const scale = this.config.appearance.pixelScale || 4;
    const size = 24 * scale;
    this.petCanvas.width = size;
    this.petCanvas.height = size;
  }

  private setupInteractions() {
    // Mouse hover detection for selective click-through
    this.petContainer.addEventListener('mouseenter', () => {
      (window as any).codePetApi?.setIgnoreMouseEvents(false);
    });

    this.petContainer.addEventListener('mouseleave', () => {
      if (!this.isDragging && this.contextMenu.classList.contains('hidden')) {
        (window as any).codePetApi?.setIgnoreMouseEvents(true);
      }
    });

    // Drag and drop window positioning
    this.petContainer.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 0) { // Left click
        this.isDragging = true;
        this.dragStartX = e.screenX;
        this.dragStartY = e.screenY;
        this.initialWinX = window.screenX;
        this.initialWinY = window.screenY;
        this.contextMenu.classList.add('hidden');
      }
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (this.isDragging) {
        const deltaX = e.screenX - this.dragStartX;
        const deltaY = e.screenY - this.dragStartY;
        const newX = this.initialWinX + deltaX;
        const newY = this.initialWinY + deltaY;
        (window as any).codePetApi?.setWindowPosition(newX, newY);
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
      }
    });

    // Double click -> random action
    this.petContainer.addEventListener('dblclick', () => {
      (window as any).codePetApi?.triggerInteraction('double-click');
    });

    // Right click -> context menu
    this.petContainer.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      this.contextMenu.classList.remove('hidden');
      (window as any).codePetApi?.setIgnoreMouseEvents(false);
    });

    // Menu item clicks
    this.contextMenu.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = (e.currentTarget as HTMLElement).getAttribute('data-action');
        this.contextMenu.classList.add('hidden');
        if (action === 'settings') {
          (window as any).codePetApi?.openSettings();
        } else if (action === 'hide') {
          (window as any).codePetApi?.hidePet();
        } else if (action) {
          (window as any).codePetApi?.triggerInteraction(action);
        }
      });
    });

    // Close menu when clicking outside
    window.addEventListener('click', (e) => {
      if (!this.contextMenu.contains(e.target as Node) && e.target !== this.petContainer) {
        this.contextMenu.classList.add('hidden');
      }
    });
  }

  public handleReaction(reaction: PetReaction) {
    this.currentState = reaction.state;

    if (reaction.sound) {
      this.soundEngine.play(reaction.sound);
    }

    if (reaction.speech && this.config.behavior.speechBubblesEnabled) {
      this.showSpeech(reaction.speech, reaction.durationMs || 3500);
    }

    if (reaction.particle && this.config.appearance.particlesEnabled) {
      this.spawnParticles(reaction.particle);
    }

    // Small bounce effect on pet
    if (reaction.state === 'CELEBRATING' || reaction.state === 'EXCITED') {
      this.petContainer.classList.add('shake');
      setTimeout(() => this.petContainer.classList.remove('shake'), 450);
    }
  }

  private showSpeech(text: string, durationMs: number = 3500) {
    if (this.speechTimer) {
      clearTimeout(this.speechTimer);
    }
    this.speechText.innerText = text;
    this.speechBubble.classList.remove('hidden');

    this.speechTimer = setTimeout(() => {
      this.speechBubble.classList.add('hidden');
    }, durationMs);
  }

  private spawnParticles(type: PetReaction['particle']) {
    const originX = 120;
    const originY = 140;

    const count = type === 'confetti' || type === 'sparkles' ? 24 : 12;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      const speed = 1.5 + Math.random() * 2.5;

      let color = '#38bdf8';
      let shape: Particle['shape'] = 'circle';
      let char: string | undefined = undefined;

      if (type === 'hearts') {
        color = '#f43f5e';
        shape = 'heart';
      } else if (type === 'sparkles') {
        color = ['#fbbf24', '#f472b6', '#38bdf8', '#a78bfa'][Math.floor(Math.random() * 4)];
        shape = 'star';
      } else if (type === 'confetti') {
        color = ['#10b981', '#f59e0b', '#ec4899', '#6366f1'][Math.floor(Math.random() * 4)];
        shape = 'square';
      } else if (type === 'sweat') {
        color = '#38bdf8';
        shape = 'circle';
      } else if (type === 'zzz') {
        color = '#94a3b8';
        shape = 'letter';
        char = 'z';
      }

      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        life: 1.0,
        maxLife: 30 + Math.random() * 20,
        color,
        size: shape === 'square' ? 3 + Math.random() * 3 : 2 + Math.random() * 2,
        shape,
        char
      });
    }
  }

  private startAnimationLoop() {
    const loop = (time: number) => {
      const animSpeed = this.config.pet.animationSpeed || 1.0;
      const frameInterval = 280 / animSpeed;

      if (time - this.lastFrameTime > frameInterval) {
        this.frameIndex++;
        this.lastFrameTime = time;
      }

      this.render();
      this.updateAndRenderParticles();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  private render() {
    this.petCtx.clearRect(0, 0, this.petCanvas.width, this.petCanvas.height);

    const species: PetSpecies = this.config.pet.species || 'cat';
    const skin: PetSkin = this.config.appearance.skin || 'default';
    const accessory: PetAccessory = this.config.appearance.accessory || 'none';
    const scale = this.config.appearance.pixelScale || 4;

    const frame = this.spriteEngine.getFrame(
      species,
      this.currentState,
      this.frameIndex,
      skin,
      accessory
    );

    this.spriteEngine.drawToCanvas(this.petCtx, frame, scale, 0, 0);
  }

  private updateAndRenderParticles() {
    this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.life -= 1 / p.maxLife;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.particleCtx.save();
      this.particleCtx.globalAlpha = p.life;
      this.particleCtx.fillStyle = p.color;

      if (p.shape === 'letter' && p.char) {
        this.particleCtx.font = '10px monospace';
        this.particleCtx.fillText(p.char, p.x, p.y);
      } else if (p.shape === 'heart') {
        this.particleCtx.font = '11px sans-serif';
        this.particleCtx.fillText('❤️', p.x, p.y);
      } else if (p.shape === 'square') {
        this.particleCtx.fillRect(p.x, p.y, p.size, p.size);
      } else {
        this.particleCtx.beginPath();
        this.particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.particleCtx.fill();
      }

      this.particleCtx.restore();
    }
  }
}

// Instantiate on load
window.addEventListener('DOMContentLoaded', () => {
  new DesktopPetController();
});
