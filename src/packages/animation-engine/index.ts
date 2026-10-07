import {
  PetSpecies,
  PetAnimationState,
  PetSkin,
  PetAccessory
} from '../shared/types';

export interface PixelPoint {
  x: number;
  y: number;
  color: string;
}

export interface SpriteFrame {
  width: number;
  height: number;
  pixels: PixelPoint[];
}

export interface AnimationDefinition {
  frames: SpriteFrame[];
  frameDurationMs: number;
}

// Color palettes for skins
export const PALETTES: Record<PetSkin, Record<string, string>> = {
  default: {
    primary: '#e07a5f',
    secondary: '#f4f1de',
    dark: '#3d405a',
    accent: '#81b29a',
    eye: '#264653',
    highlight: '#ffffff',
    detail: '#f2cc8f'
  },
  neon: {
    primary: '#00f0ff',
    secondary: '#ff007f',
    dark: '#0a0a1a',
    accent: '#39ff14',
    eye: '#ffe600',
    highlight: '#ffffff',
    detail: '#bc13fe'
  },
  pastel: {
    primary: '#b8c0ff',
    secondary: '#ffd6ff',
    dark: '#5a5766',
    accent: '#c8e7ff',
    eye: '#3c3744',
    highlight: '#ffffff',
    detail: '#e7c6ff'
  },
  'retro-monochrome': {
    primary: '#88a070',
    secondary: '#d0d8b8',
    dark: '#283820',
    accent: '#506840',
    eye: '#182010',
    highlight: '#e8f0d8',
    detail: '#506840'
  },
  golden: {
    primary: '#e6af2e',
    secondary: '#f5d547',
    dark: '#3e2723',
    accent: '#ffb703',
    eye: '#2b1e16',
    highlight: '#fff9db',
    detail: '#fb8500'
  },
  cyberpunk: {
    primary: '#f72585',
    secondary: '#7209b7',
    dark: '#10002b',
    accent: '#4cc9f0',
    eye: '#4895ef',
    highlight: '#ffffff',
    detail: '#3a0ca3'
  }
};

export class PixelSpriteEngine {
  private baseGridSize = 24;

  public getFrame(
    species: PetSpecies,
    state: PetAnimationState,
    frameIndex: number,
    skin: PetSkin = 'default',
    accessory: PetAccessory = 'none'
  ): SpriteFrame {
    const palette = PALETTES[skin] || PALETTES.default;
    const pixels: PixelPoint[] = [];

    // Animation cycle (0, 1, 2, 3)
    const cycle = frameIndex % 4;

    // Render species body base
    this.renderSpeciesBody(pixels, species, state, cycle, palette);

    // Render facial expression & eyes depending on state
    this.renderExpression(pixels, species, state, cycle, palette);

    // Render state-specific props (e.g. laptop for CODING, coffee for TIRED, sleep bubble for SLEEPING)
    this.renderProps(pixels, state, cycle, palette);

    // Render accessories (wizard-hat, cool-glasses, etc.)
    if (accessory !== 'none') {
      this.renderAccessory(pixels, accessory, cycle, palette);
    }

    return {
      width: this.baseGridSize,
      height: this.baseGridSize,
      pixels
    };
  }

  private renderSpeciesBody(
    pixels: PixelPoint[],
    species: PetSpecies,
    state: PetAnimationState,
    cycle: number,
    p: Record<string, string>
  ) {
    const bob = state === 'WALKING' || state === 'EXCITED' || state === 'CELEBRATING'
      ? (cycle % 2 === 0 ? 0 : -1)
      : (state === 'IDLE' && cycle === 2 ? -1 : 0);

    const isSleeping = state === 'SLEEPING';
    const bodyY = isSleeping ? 14 : 11 + bob;

    switch (species) {
      case 'cat':
      case 'custom':
        // Cat Ears
        if (!isSleeping) {
          this.rect(pixels, 7, bodyY - 5, 2, 2, p.primary);
          this.rect(pixels, 13, bodyY - 5, 2, 2, p.primary);
          pixels.push({ x: 7, y: bodyY - 4, color: p.secondary });
          pixels.push({ x: 14, y: bodyY - 4, color: p.secondary });
        }
        // Head & Body
        this.rect(pixels, 6, bodyY - 3, 10, 7, p.primary);
        this.rect(pixels, 7, bodyY + 4, 8, 5, p.primary);
        // Chest/belly patch
        this.rect(pixels, 9, bodyY + 1, 4, 6, p.secondary);
        // Tail
        const tailOffset = cycle === 0 ? 0 : cycle === 1 ? 1 : cycle === 2 ? 0 : -1;
        this.rect(pixels, 4 + tailOffset, bodyY + 3, 2, 4, p.primary);
        pixels.push({ x: 3 + tailOffset, y: bodyY + 2, color: p.detail });
        // Paws
        this.rect(pixels, 7, bodyY + 9, 2, 1, p.secondary);
        this.rect(pixels, 13, bodyY + 9, 2, 1, p.secondary);
        break;

      case 'dog':
        // Floppy ears
        const earBob = cycle % 2 === 0 ? 0 : 1;
        this.rect(pixels, 5, bodyY - 2 + earBob, 2, 4, p.dark);
        this.rect(pixels, 15, bodyY - 2 + earBob, 2, 4, p.dark);
        // Head & Body
        this.rect(pixels, 7, bodyY - 3, 8, 7, p.primary);
        this.rect(pixels, 6, bodyY + 4, 10, 5, p.primary);
        // Snout
        this.rect(pixels, 9, bodyY + 1, 4, 3, p.secondary);
        pixels.push({ x: 10, y: bodyY + 1, color: p.dark }); // nose
        // Wagging tail
        const dogTail = cycle % 2 === 0 ? 3 : 4;
        pixels.push({ x: dogTail, y: bodyY + 2, color: p.primary });
        pixels.push({ x: dogTail + 1, y: bodyY + 3, color: p.primary });
        // Paws
        this.rect(pixels, 7, bodyY + 9, 2, 1, p.secondary);
        this.rect(pixels, 13, bodyY + 9, 2, 1, p.secondary);
        break;

      case 'fox':
        // Big pointy fox ears
        this.rect(pixels, 6, bodyY - 6, 3, 3, p.primary);
        this.rect(pixels, 13, bodyY - 6, 3, 3, p.primary);
        pixels.push({ x: 7, y: bodyY - 5, color: p.dark });
        pixels.push({ x: 14, y: bodyY - 5, color: p.dark });
        // Head
        this.rect(pixels, 6, bodyY - 3, 10, 6, p.primary);
        // White cheeks
        this.rect(pixels, 5, bodyY, 2, 3, p.secondary);
        this.rect(pixels, 15, bodyY, 2, 3, p.secondary);
        // Body
        this.rect(pixels, 7, bodyY + 3, 8, 6, p.primary);
        // Big bushy tail with white tip
        this.rect(pixels, 3, bodyY + 2, 3, 5, p.primary);
        this.rect(pixels, 2, bodyY + 1, 2, 3, p.secondary);
        // Paws
        this.rect(pixels, 7, bodyY + 9, 2, 1, p.dark);
        this.rect(pixels, 13, bodyY + 9, 2, 1, p.dark);
        break;

      case 'penguin':
        // Penguin rounded head & body
        this.rect(pixels, 7, bodyY - 3, 8, 12, p.dark);
        // White tummy
        this.rect(pixels, 9, bodyY - 1, 4, 9, p.secondary);
        // Orange beak
        this.rect(pixels, 10, bodyY, 2, 2, p.accent);
        // Flippers
        const flipperAngle = (state === 'CELEBRATING' || state === 'EXCITED') ? -2 : 0;
        this.rect(pixels, 5, bodyY + 2 + flipperAngle, 2, 4, p.dark);
        this.rect(pixels, 15, bodyY + 2 + flipperAngle, 2, 4, p.dark);
        // Orange feet
        this.rect(pixels, 7, bodyY + 9, 3, 1, p.accent);
        this.rect(pixels, 12, bodyY + 9, 3, 1, p.accent);
        break;

      case 'robot':
        // Antenna
        pixels.push({ x: 11, y: bodyY - 6, color: cycle % 2 === 0 ? p.accent : p.primary });
        this.rect(pixels, 11, bodyY - 5, 1, 2, p.dark);
        // Rectangular head
        this.rect(pixels, 6, bodyY - 3, 10, 6, p.primary);
        // Screen face
        this.rect(pixels, 7, bodyY - 2, 8, 4, p.dark);
        // Torso
        this.rect(pixels, 7, bodyY + 4, 8, 5, p.primary);
        // Chest meter
        pixels.push({ x: 9, y: bodyY + 5, color: cycle === 0 ? p.accent : p.secondary });
        pixels.push({ x: 11, y: bodyY + 5, color: cycle === 1 ? p.accent : p.secondary });
        // Treads / wheels
        this.rect(pixels, 6, bodyY + 9, 10, 2, p.dark);
        break;

      case 'ghost':
        // Ghost floating bob
        const floatBob = Math.sin((cycle / 4) * Math.PI * 2) > 0 ? 1 : -1;
        const gY = bodyY - 2 + floatBob;
        // Rounded dome
        this.rect(pixels, 7, gY, 8, 2, p.secondary);
        this.rect(pixels, 6, gY + 2, 10, 7, p.secondary);
        // Wavy bottom tails
        this.rect(pixels, 6, gY + 9, 2, cycle % 2 === 0 ? 2 : 1, p.secondary);
        this.rect(pixels, 9, gY + 9, 2, cycle % 2 === 1 ? 2 : 1, p.secondary);
        this.rect(pixels, 12, gY + 9, 2, cycle % 2 === 0 ? 2 : 1, p.secondary);
        // Rosy ghost cheeks
        pixels.push({ x: 6, y: gY + 5, color: p.primary });
        pixels.push({ x: 13, y: gY + 5, color: p.primary });
        break;
    }
  }

  private renderExpression(
    pixels: PixelPoint[],
    species: PetSpecies,
    state: PetAnimationState,
    cycle: number,
    p: Record<string, string>
  ) {
    const eyeY = 10;

    switch (state) {
      case 'SLEEPING':
        // Closed relaxed eyes (- -)
        this.rect(pixels, 8, eyeY, 2, 1, p.eye);
        this.rect(pixels, 12, eyeY, 2, 1, p.eye);
        break;

      case 'ERROR':
        // Dizzy X eyes
        pixels.push({ x: 8, y: eyeY - 1, color: p.eye }, { x: 9, y: eyeY, color: p.eye }, { x: 8, y: eyeY + 1, color: p.eye });
        pixels.push({ x: 12, y: eyeY - 1, color: p.eye }, { x: 13, y: eyeY, color: p.eye }, { x: 12, y: eyeY + 1, color: p.eye });
        // Sweat drop
        pixels.push({ x: 16, y: eyeY - 3, color: '#00d2ff' });
        pixels.push({ x: 16, y: eyeY - 2, color: '#00d2ff' });
        break;

      case 'CELEBRATING':
      case 'HAPPY':
        // Happy arch eyes (^ ^)
        pixels.push({ x: 8, y: eyeY - 1, color: p.eye });
        pixels.push({ x: 9, y: eyeY, color: p.eye });
        pixels.push({ x: 12, y: eyeY, color: p.eye });
        pixels.push({ x: 13, y: eyeY - 1, color: p.eye });
        // Happy smile
        pixels.push({ x: 10, y: eyeY + 2, color: p.eye });
        pixels.push({ x: 11, y: eyeY + 2, color: p.eye });
        break;

      case 'CONFUSED':
        // One big eye, one small eye
        this.rect(pixels, 8, eyeY, 2, 2, p.eye);
        pixels.push({ x: 13, y: eyeY, color: p.eye });
        // Wavy mouth
        pixels.push({ x: 10, y: eyeY + 2, color: p.eye });
        pixels.push({ x: 11, y: eyeY + 3, color: p.eye });
        break;

      case 'SAD':
        // Drooping eyes and frown
        pixels.push({ x: 8, y: eyeY, color: p.eye });
        pixels.push({ x: 9, y: eyeY + 1, color: p.eye });
        pixels.push({ x: 12, y: eyeY + 1, color: p.eye });
        pixels.push({ x: 13, y: eyeY, color: p.eye });
        // Teardrop
        pixels.push({ x: 7, y: eyeY + 2, color: '#4cc9f0' });
        break;

      case 'THINKING':
        // Looking up to corner
        pixels.push({ x: 9, y: eyeY - 1, color: p.eye });
        pixels.push({ x: 13, y: eyeY - 1, color: p.eye });
        break;

      case 'TIRED':
        // Half closed eyelids
        this.rect(pixels, 8, eyeY, 2, 1, p.dark);
        this.rect(pixels, 8, eyeY + 1, 2, 1, p.eye);
        this.rect(pixels, 12, eyeY, 2, 1, p.dark);
        this.rect(pixels, 12, eyeY + 1, 2, 1, p.eye);
        break;

      case 'IDLE':
      default:
        // Regular blinking: blink on cycle 3
        if (cycle === 3) {
          this.rect(pixels, 8, eyeY, 2, 1, p.eye);
          this.rect(pixels, 12, eyeY, 2, 1, p.eye);
        } else {
          this.rect(pixels, 8, eyeY - 1, 2, 2, p.eye);
          this.rect(pixels, 12, eyeY - 1, 2, 2, p.eye);
          // Catchlight
          pixels.push({ x: 8, y: eyeY - 1, color: p.highlight });
          pixels.push({ x: 12, y: eyeY - 1, color: p.highlight });
        }
        break;
    }
  }

  private renderProps(
    pixels: PixelPoint[],
    state: PetAnimationState,
    cycle: number,
    p: Record<string, string>
  ) {
    if (state === 'CODING') {
      // Mini laptop in front of pet
      this.rect(pixels, 13, 13, 6, 4, '#4a5568'); // screen
      this.rect(pixels, 14, 14, 4, 2, '#63b3ed'); // glowing display
      this.rect(pixels, 12, 17, 8, 1, '#2d3748'); // keyboard base
      // Typing paws animation
      pixels.push({ x: 13 + (cycle % 2), y: 16, color: p.secondary });
    } else if (state === 'TIRED') {
      // Coffee mug
      this.rect(pixels, 16, 14, 3, 4, '#edf2f7');
      pixels.push({ x: 19, y: 15, color: '#edf2f7' }); // handle
      pixels.push({ x: 17, y: 13, color: '#795548' }); // coffee surface
      // Steam
      if (cycle % 2 === 0) {
        pixels.push({ x: 17, y: 11, color: '#e2e8f0' });
      }
    } else if (state === 'THINKING') {
      // Little thought bubbles
      pixels.push({ x: 17, y: 7, color: '#cbd5e0' });
      pixels.push({ x: 19, y: 5, color: '#cbd5e0' });
      this.rect(pixels, 20, 2, 2, 2, p.accent);
    }
  }

  private renderAccessory(
    pixels: PixelPoint[],
    acc: PetAccessory,
    cycle: number,
    p: Record<string, string>
  ) {
    switch (acc) {
      case 'wizard-hat':
        // Pointy purple/blue wizard hat
        this.rect(pixels, 5, 6, 12, 2, '#3b2d54'); // brim
        this.rect(pixels, 7, 4, 8, 2, '#5e3a8c');
        this.rect(pixels, 9, 2, 4, 2, '#5e3a8c');
        pixels.push({ x: 10, y: 1, color: '#ffd166' }); // star on top
        break;

      case 'top-hat':
        // Classy black top hat with red ribbon
        this.rect(pixels, 5, 6, 12, 1, '#1a202c');
        this.rect(pixels, 7, 2, 8, 4, '#1a202c');
        this.rect(pixels, 7, 5, 8, 1, '#e53e3e'); // ribbon
        break;

      case 'cool-glasses':
        // Sunglasses (deal with it style)
        this.rect(pixels, 7, 8, 4, 3, '#111111');
        this.rect(pixels, 12, 8, 4, 3, '#111111');
        this.rect(pixels, 11, 9, 1, 1, '#111111'); // bridge
        // White glint
        pixels.push({ x: 8, y: 8, color: '#ffffff' });
        pixels.push({ x: 13, y: 8, color: '#ffffff' });
        break;

      case 'bowtie':
        // Dapper bowtie
        this.rect(pixels, 9, 14, 1, 2, '#e53e3e');
        pixels.push({ x: 10, y: 14, color: '#fff' });
        this.rect(pixels, 11, 14, 1, 2, '#e53e3e');
        break;

      case 'developer-headset':
        // Over-ear headphones with mic
        this.rect(pixels, 7, 4, 8, 1, '#4a5568'); // headband
        this.rect(pixels, 6, 6, 2, 5, '#e53e3e'); // left ear cup
        this.rect(pixels, 14, 6, 2, 5, '#e53e3e'); // right ear cup
        // Mic boom
        pixels.push({ x: 14, y: 11, color: '#4a5568' });
        pixels.push({ x: 13, y: 12, color: '#e53e3e' });
        break;

      case 'halo':
        // Golden angel halo
        this.rect(pixels, 7, 3, 8, 1, '#ffd700');
        pixels.push({ x: 6, y: 4, color: '#ffd700' });
        pixels.push({ x: 15, y: 4, color: '#ffd700' });
        break;
    }
  }

  private rect(
    pixels: PixelPoint[],
    startX: number,
    startY: number,
    width: number,
    height: number,
    color: string
  ) {
    for (let x = startX; x < startX + width; x++) {
      for (let y = startY; y < startY + height; y++) {
        if (x >= 0 && x < this.baseGridSize && y >= 0 && y < this.baseGridSize) {
          pixels.push({ x, y, color });
        }
      }
    }
  }

  // Draw sprite to HTML5 Canvas
  public drawToCanvas(
    ctx: CanvasRenderingContext2D,
    frame: SpriteFrame,
    scale: number,
    offsetX: number = 0,
    offsetY: number = 0
  ) {
    ctx.imageSmoothingEnabled = false;
    for (const pt of frame.pixels) {
      ctx.fillStyle = pt.color;
      ctx.fillRect(offsetX + pt.x * scale, offsetY + pt.y * scale, scale, scale);
    }
  }
}
