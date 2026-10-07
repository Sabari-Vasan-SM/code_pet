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

interface ToyItem {
  type: 'fish' | 'yarn' | 'coffee';
  x: number;
  y: number;
  vx: number;
  vy: number;
  groundY: number;
  active: boolean;
  bounces: number;
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
  private affectionBadge: HTMLElement;
  private laserDot: HTMLElement;

  private currentState: PetAnimationState = 'IDLE';
  private frameIndex: number = 0;
  private lastFrameTime: number = 0;
  private particles: Particle[] = [];
  private activeToy: ToyItem | null = null;
  private speechTimer?: NodeJS.Timeout;

  // Interactive gaze tracking
  private lookDirection = { x: 0, y: 0 };
  private laserActive = false;

  // Petting stroke detection
  private petStrokeDistance = 0;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private lastStrokeTime = 0;

  // Window drag state
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
    this.affectionBadge = document.getElementById('affection-badge')!;
    this.laserDot = document.getElementById('laser-dot')!;

    this.init();
  }

  private async init() {
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

      (window as any).codePetApi.onReaction((reaction: PetReaction) => {
        this.handleReaction(reaction);
      });

      (window as any).codePetApi.onConfigUpdated((newConfig: CodePetConfig) => {
        this.config = newConfig;
        this.soundEngine.updateSettings(newConfig.sound);
        this.updateScale();
      });
    }

    this.setupInteractions();
    this.setupActionDock();
    this.updateScale();
    this.startAnimationLoop();

    // Initial greeting matching reference style
    setTimeout(() => {
      this.showSpeech('hello dev! ✨', 2800);
      this.soundEngine.play('happy');
    }, 600);
  }

  private updateScale() {
    const scale = this.config.appearance.pixelScale || 4;
    const size = 24 * scale;
    this.petCanvas.width = size;
    this.petCanvas.height = size;
  }

  private setupActionDock() {
    // 🐟 Snack button
    document.getElementById('btn-snack')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.spawnToy('fish');
    });

    // 🧶 Toy button
    document.getElementById('btn-toy')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.spawnToy('yarn');
    });

    // ☕ Coffee button
    document.getElementById('btn-coffee')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.spawnToy('coffee');
    });

    // 🔴 Laser pointer toggle
    document.getElementById('btn-laser')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.laserActive = !this.laserActive;
      if (this.laserActive) {
        this.laserDot.classList.remove('hidden');
        this.showSpeech('chasing laser! 👀', 2000);
        this.soundEngine.play('wake');
      } else {
        this.laserDot.classList.add('hidden');
      }
    });

    // 💤 Sleep / Wake toggle
    document.getElementById('btn-sleep')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.currentState === 'SLEEPING') {
        this.currentState = 'HAPPY';
        this.showSpeech('wide awake! ⚡', 2000);
        this.soundEngine.play('wake');
        this.spawnParticles('sparkles');
      } else {
        this.currentState = 'SLEEPING';
        this.showSpeech('catnap mode 💤', 2500);
        this.soundEngine.play('sleep');
        this.spawnParticles('zzz');
      }
    });

    // ⚙️ Settings
    document.getElementById('btn-settings')?.addEventListener('click', (e) => {
      e.stopPropagation();
      (window as any).codePetApi?.openSettings();
    });
  }

  private setupInteractions() {
    // Selective mouse click-through
    this.petContainer.addEventListener('mouseenter', () => {
      (window as any).codePetApi?.setIgnoreMouseEvents(false);
    });

    document.getElementById('action-dock')?.addEventListener('mouseenter', () => {
      (window as any).codePetApi?.setIgnoreMouseEvents(false);
    });

    this.petContainer.addEventListener('mouseleave', () => {
      if (!this.isDragging && this.contextMenu.classList.contains('hidden') && !this.laserActive) {
        (window as any).codePetApi?.setIgnoreMouseEvents(true);
      }
    });

    // Mouse movement: Gaze tracking & Petting stroke detection
    window.addEventListener('mousemove', (e: MouseEvent) => {
      // 1. Laser pointer positioning
      if (this.laserActive) {
        this.laserDot.style.left = `${e.clientX}px`;
        this.laserDot.style.top = `${e.clientY}px`;
      }

      // 2. Interactive eye gaze tracking
      const petRect = this.petCanvas.getBoundingClientRect();
      const petCenterX = petRect.left + petRect.width / 2;
      const petCenterY = petRect.top + petRect.height / 2;

      const diffX = e.clientX - petCenterX;
      const diffY = e.clientY - petCenterY;

      this.lookDirection = {
        x: Math.abs(diffX) > 15 ? (diffX > 0 ? 1 : -1) : 0,
        y: Math.abs(diffY) > 15 ? (diffY > 0 ? 1 : -1) : 0
      };

      // 3. Petting stroke detection over the pet
      if (this.petContainer.contains(e.target as Node) && !this.isDragging) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const now = Date.now();
        if (now - this.lastStrokeTime < 250) {
          this.petStrokeDistance += dist;
          if (this.petStrokeDistance > 120) {
            // User is petting the pet!
            this.handlePettingStroke();
            this.petStrokeDistance = 0;
          }
        } else {
          this.petStrokeDistance = 0;
        }

        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.lastStrokeTime = now;
      }

      // 4. Window drag handling
      if (this.isDragging) {
        const deltaX = e.screenX - this.dragStartX;
        const deltaY = e.screenY - this.dragStartY;
        const newX = this.initialWinX + deltaX;
        const newY = this.initialWinY + deltaY;
        (window as any).codePetApi?.setWindowPosition(newX, newY);
      }
    });

    // Drag start
    this.petContainer.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 0) {
        this.isDragging = true;
        this.dragStartX = e.screenX;
        this.dragStartY = e.screenY;
        this.initialWinX = window.screenX;
        this.initialWinY = window.screenY;
        this.contextMenu.classList.add('hidden');
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
      }
    });

    // Poke / Tap click: makes pet bounce playfully!
    this.petContainer.addEventListener('click', (e) => {
      if (this.isDragging) return;
      this.petContainer.classList.add('bounce');
      setTimeout(() => this.petContainer.classList.remove('bounce'), 350);

      if (this.currentState === 'SLEEPING') {
        this.currentState = 'HAPPY';
        this.showSpeech('*wakes up* mew! ✨', 2000);
        this.soundEngine.play('wake');
      } else {
        this.soundEngine.play('interact');
        if (Math.random() < 0.4) {
          this.showSpeech('purr! 🐾', 1500);
        }
      }
    });

    // Double click -> celebration dance!
    this.petContainer.addEventListener('dblclick', () => {
      this.currentState = 'CELEBRATING';
      this.spawnParticles('confetti');
      this.showSpeech('you got this! 🔥', 2500);
      this.soundEngine.play('celebrate');
      (window as any).codePetApi?.triggerInteraction('double-click');
    });

    // Right click -> context menu
    this.petContainer.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      this.contextMenu.classList.remove('hidden');
      (window as any).codePetApi?.setIgnoreMouseEvents(false);
    });

    // Context menu actions
    this.contextMenu.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = (e.currentTarget as HTMLElement).getAttribute('data-action');
        this.contextMenu.classList.add('hidden');
        if (action === 'feed') {
          this.spawnToy('fish');
        } else if (action === 'play') {
          this.spawnToy('yarn');
        } else if (action === 'coffee') {
          this.spawnToy('coffee');
        } else if (action === 'settings') {
          (window as any).codePetApi?.openSettings();
        } else if (action === 'hide') {
          (window as any).codePetApi?.hidePet();
        } else if (action === 'pet') {
          this.handlePettingStroke();
        } else if (action === 'sleep') {
          this.currentState = 'SLEEPING';
          this.showSpeech('zzz...', 3000);
          this.soundEngine.play('sleep');
          this.spawnParticles('zzz');
        } else if (action === 'wake') {
          this.currentState = 'HAPPY';
          this.showSpeech('ready! ⚡', 2000);
          this.soundEngine.play('wake');
        } else if (action === 'dance') {
          this.currentState = 'CELEBRATING';
          this.soundEngine.play('celebrate');
          this.spawnParticles('confetti');
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

  // Interactive petting gesture handler
  private handlePettingStroke() {
    this.currentState = 'HAPPY';
    this.soundEngine.play('purr');
    this.spawnParticles('hearts');

    // Show affection toast
    this.affectionBadge.innerText = '+5 ❤️ Purring!';
    this.affectionBadge.classList.remove('hidden');
    setTimeout(() => {
      this.affectionBadge.classList.add('hidden');
    }, 900);

    (window as any).codePetApi?.triggerInteraction('pet');
  }

  // Spawn physics interactive toy/snack
  public spawnToy(type: 'fish' | 'yarn' | 'coffee') {
    this.activeToy = {
      type,
      x: 40 + Math.random() * 40,
      y: 40,
      vx: 1.5 + Math.random() * 1.5,
      vy: -2.5,
      groundY: 190,
      active: true,
      bounces: 0
    };

    if (type === 'fish') {
      this.showSpeech('ooh a fish! 🐟', 2000);
      this.soundEngine.play('interact');
    } else if (type === 'yarn') {
      this.showSpeech('yarn ball time! 🧶', 2000);
      this.soundEngine.play('happy');
    } else if (type === 'coffee') {
      this.showSpeech('dev espresso ☕ +10 focus', 2000);
      this.soundEngine.play('prompt_submit');
    }
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

    if (reaction.state === 'CELEBRATING' || reaction.state === 'EXCITED') {
      this.petContainer.classList.add('shake');
      setTimeout(() => this.petContainer.classList.remove('shake'), 450);
    }
  }

  private showSpeech(text: string, durationMs: number = 3200) {
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
    const originX = 130;
    const originY = 150;
    const count = type === 'confetti' || type === 'sparkles' ? 24 : 12;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      const speed = 1.6 + Math.random() * 2.4;

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

  private wasParticlesRendered = false;

  private isHighFpsNeeded(): boolean {
    return (
      this.particles.length > 0 ||
      this.activeToy !== null ||
      this.isDragging ||
      this.laserActive ||
      this.currentState === 'CELEBRATING' ||
      this.currentState === 'EXCITED' ||
      this.currentState === 'PLAYING'
    );
  }

  private startAnimationLoop() {
    const loop = (time: number) => {
      const animSpeed = this.config.pet.animationSpeed || 1.0;
      const frameInterval = 280 / animSpeed;
      const highFps = this.isHighFpsNeeded();

      if (time - this.lastFrameTime >= frameInterval) {
        this.frameIndex++;
        this.lastFrameTime = time;
        this.render();
      }

      if (highFps) {
        this.wasParticlesRendered = true;
        this.updateAndRenderParticles();
        this.updateAndRenderToy();
        requestAnimationFrame(loop);
      } else {
        if (this.wasParticlesRendered) {
          this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
          this.wasParticlesRendered = false;
        }
        // Ultra-low CPU idle: sleep between sprite frames
        setTimeout(() => {
          requestAnimationFrame(loop);
        }, Math.max(60, frameInterval - 40));
      }
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
      accessory,
      this.lookDirection
    );

    this.spriteEngine.drawToCanvas(this.petCtx, frame, scale, 0, 0);
  }

  private updateAndRenderToy() {
    if (!this.activeToy) return;

    const toy = this.activeToy;
    toy.x += toy.vx;
    toy.y += toy.vy;
    toy.vy += 0.35; // gravity

    // Bounce on floor
    if (toy.y >= toy.groundY) {
      toy.y = toy.groundY;
      toy.vy = -toy.vy * 0.55; // bounce dampening
      toy.vx *= 0.8;
      toy.bounces++;

      if (toy.bounces === 1) {
        this.soundEngine.play('interact');
      }

      // When toy settles near pet
      if (Math.abs(toy.vy) < 0.3 && Math.abs(toy.vx) < 0.2) {
        toy.active = false;
        // Trigger pet celebration & consumption!
        setTimeout(() => {
          this.currentState = 'HAPPY';
          this.spawnParticles(toy.type === 'fish' ? 'hearts' : 'sparkles');
          this.soundEngine.play('happy');
          this.activeToy = null;
        }, 1200);
      }
    }

    // Draw pixel toy on particle canvas
    this.particleCtx.save();
    if (toy.type === 'fish') {
      // 16-bit retro fish snack (blue/silver with eye)
      this.particleCtx.font = '16px sans-serif';
      this.particleCtx.fillText('🐟', toy.x, toy.y);
    } else if (toy.type === 'yarn') {
      // Yarn ball
      this.particleCtx.font = '16px sans-serif';
      this.particleCtx.fillText('🧶', toy.x, toy.y);
    } else if (toy.type === 'coffee') {
      // Steaming coffee mug
      this.particleCtx.font = '16px sans-serif';
      this.particleCtx.fillText('☕', toy.x, toy.y);
    }
    this.particleCtx.restore();
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

window.addEventListener('DOMContentLoaded', () => {
  new DesktopPetController();
});
