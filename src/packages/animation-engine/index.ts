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

// 16-bit Retro Color Palettes
export const PALETTES: Record<PetSkin, Record<string, string>> = {
  default: {
    // 16-bit retro ginger tabby (matching reference image)
    primary: '#f39237',       // Vibrant ginger orange
    primaryDark: '#d46e16',   // Shaded ginger fur
    secondary: '#ffffff',     // Crisp white chest, muzzle, paws, tail-tip
    dark: '#2b2338',          // Deep retro pixel outline & eyes
    accent: '#ffa8ba',        // Soft pink inner ears & nose
    eye: '#2b2338',           // Dark eyes
    highlight: '#ffffff',     // Catchlight
    detail: '#ff758f',        // Tongue & blush
    glint: '#facc15'          // Golden celebration sparkle glints
  },
  neon: {
    primary: '#00f0ff',
    primaryDark: '#00a3cc',
    secondary: '#ffffff',
    dark: '#070a1e',
    accent: '#ff007f',
    eye: '#ffe600',
    highlight: '#ffffff',
    detail: '#39ff14',
    glint: '#00f0ff'
  },
  pastel: {
    primary: '#fbcfe8',
    primaryDark: '#f472b6',
    secondary: '#ffffff',
    dark: '#475569',
    accent: '#fbcfe8',
    eye: '#334155',
    highlight: '#ffffff',
    detail: '#fb7185',
    glint: '#fde047'
  },
  'retro-monochrome': {
    primary: '#88a070',
    primaryDark: '#506840',
    secondary: '#e8f0d8',
    dark: '#182010',
    accent: '#a0b888',
    eye: '#182010',
    highlight: '#ffffff',
    detail: '#506840',
    glint: '#d0d8b8'
  },
  golden: {
    primary: '#f59e0b',
    primaryDark: '#b45309',
    secondary: '#fef3c7',
    dark: '#291b0f',
    accent: '#fde68a',
    eye: '#291b0f',
    highlight: '#ffffff',
    detail: '#f59e0b',
    glint: '#fbbf24'
  },
  cyberpunk: {
    primary: '#ec4899',
    primaryDark: '#be185d',
    secondary: '#67e8f9',
    dark: '#0f172a',
    accent: '#a855f7',
    eye: '#38bdf8',
    highlight: '#ffffff',
    detail: '#f43f5e',
    glint: '#e879f9'
  }
};

export class PixelSpriteEngine {
  private baseGridSize = 24;

  public getFrame(
    species: PetSpecies,
    state: PetAnimationState,
    frameIndex: number,
    skin: PetSkin = 'default',
    accessory: PetAccessory = 'none',
    lookDirection: { x: number; y: number } = { x: 0, y: 0 }
  ): SpriteFrame {
    const palette = PALETTES[skin] || PALETTES.default;
    const pixels: PixelPoint[] = [];
    const cycle = frameIndex % 4;

    // Render species body base
    this.renderSpeciesBody(pixels, species, state, cycle, palette, lookDirection);

    // Render facial expression & eyes
    this.renderExpression(pixels, species, state, cycle, palette, lookDirection);

    // Render state-specific props (laptop, coffee, thought bubble, sparkles)
    this.renderProps(pixels, state, cycle, palette);

    // Render accessories (wizard-hat, glasses, headphones, etc.)
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
    p: Record<string, string>,
    look: { x: number; y: number }
  ) {
    const isSleeping = state === 'SLEEPING';
    const isHappy = state === 'HAPPY' || state === 'EXCITED' || state === 'CELEBRATING';
    const isWalk = state === 'WALKING';

    const bob = isWalk
      ? (cycle % 2 === 0 ? 0 : -1)
      : isHappy
      ? (cycle % 2 === 0 ? -1 : -2)
      : (state === 'IDLE' && cycle === 2 ? -1 : 0);

    const bodyY = isSleeping ? 14 : 11 + bob;

    switch (species) {
      case 'cat':
      case 'custom':
        if (isSleeping) {
          // Flat loaf sleeping pose matching reference image
          // Body loaf
          this.rect(pixels, 5, 14, 14, 6, p.primary);
          this.rect(pixels, 6, 13, 11, 2, p.primary);
          // Dark outline base
          this.rect(pixels, 5, 19, 14, 1, p.dark);
          // Small folded ears
          pixels.push({ x: 6, y: 12, color: p.primary });
          pixels.push({ x: 7, y: 12, color: p.accent });
          pixels.push({ x: 14, y: 12, color: p.accent });
          pixels.push({ x: 15, y: 12, color: p.primary });
          // White chest & paws tucked under chin
          this.rect(pixels, 8, 16, 6, 3, p.secondary);
          pixels.push({ x: 7, y: 18, color: p.secondary });
          pixels.push({ x: 14, y: 18, color: p.secondary });
          // Curled tail wrapped around body
          this.rect(pixels, 17, 15, 2, 4, p.primary);
          pixels.push({ x: 16, y: 15, color: p.secondary }); // white tip
          break;
        }

        if (isHappy) {
          // Standing celebratory pose with raised paws matching reference image
          // Big triangular ears
          this.rect(pixels, 7, bodyY - 6, 3, 3, p.primary);
          this.rect(pixels, 14, bodyY - 6, 3, 3, p.primary);
          pixels.push({ x: 8, y: bodyY - 5, color: p.accent });
          pixels.push({ x: 15, y: bodyY - 5, color: p.accent });

          // Head
          this.rect(pixels, 6, bodyY - 3, 12, 7, p.primary);
          // White muzzle blaze
          this.rect(pixels, 9, bodyY - 1, 6, 6, p.secondary);
          // Pink blush on cheeks
          pixels.push({ x: 7, y: bodyY + 1, color: p.detail });
          pixels.push({ x: 16, y: bodyY + 1, color: p.detail });

          // Raised front paws in celebration ("\o/")
          this.rect(pixels, 4, bodyY - 1, 2, 4, p.primary);
          this.rect(pixels, 4, bodyY - 2, 2, 2, p.secondary); // white paw left
          this.rect(pixels, 18, bodyY - 1, 2, 4, p.primary);
          this.rect(pixels, 18, bodyY - 2, 2, 2, p.secondary); // white paw right

          // Torso
          this.rect(pixels, 8, bodyY + 4, 8, 5, p.primary);
          this.rect(pixels, 10, bodyY + 4, 4, 5, p.secondary);

          // Hind paws
          this.rect(pixels, 8, bodyY + 9, 3, 1, p.secondary);
          this.rect(pixels, 13, bodyY + 9, 3, 1, p.secondary);

          // Upright wagging tail
          const happyTail = cycle % 2 === 0 ? 0 : 1;
          this.rect(pixels, 18, bodyY + 4 + happyTail, 2, 4, p.primary);
          this.rect(pixels, 19, bodyY + 3 + happyTail, 2, 2, p.secondary); // white tail tip
          break;
        }

        // Standard 16-bit retro cat (Idle, Walk, Sit, Code, Think, Error)
        // Triangular ears with pink inner ear
        this.rect(pixels, 7, bodyY - 5, 3, 3, p.primary);
        this.rect(pixels, 14, bodyY - 5, 3, 3, p.primary);
        pixels.push({ x: 8, y: bodyY - 4, color: p.accent });
        pixels.push({ x: 15, y: bodyY - 4, color: p.accent });

        // Head block
        this.rect(pixels, 6, bodyY - 2, 12, 6, p.primary);

        // White muzzle / blaze
        this.rect(pixels, 9, bodyY - 1, 6, 6, p.secondary);
        // Cheeks
        pixels.push({ x: 6, y: bodyY + 2, color: p.secondary });
        pixels.push({ x: 17, y: bodyY + 2, color: p.secondary });
        // Soft blush
        pixels.push({ x: 7, y: bodyY + 2, color: p.accent });
        pixels.push({ x: 16, y: bodyY + 2, color: p.accent });

        // Body
        this.rect(pixels, 7, bodyY + 4, 10, 5, p.primary);
        this.rect(pixels, 9, bodyY + 4, 6, 5, p.secondary); // white belly

        // Front paws
        if (isWalk) {
          // Alternating stepping paws
          const stepL = cycle % 2 === 0 ? 0 : 1;
          const stepR = cycle % 2 === 0 ? 1 : 0;
          this.rect(pixels, 8, bodyY + 9 - stepL, 2, 1 + stepL, p.secondary);
          this.rect(pixels, 13, bodyY + 9 - stepR, 2, 1 + stepR, p.secondary);
        } else {
          this.rect(pixels, 8, bodyY + 9, 2, 1, p.secondary);
          this.rect(pixels, 13, bodyY + 9, 2, 1, p.secondary);
        }

        // Curled tail with white tip
        const tailWag = isWalk
          ? (cycle % 2 === 0 ? 0 : 1)
          : (cycle === 0 ? 0 : cycle === 1 ? 1 : cycle === 2 ? 0 : -1);

        this.rect(pixels, 17, bodyY + 4, 2, 4, p.primary);
        this.rect(pixels, 18 + tailWag, bodyY + 2, 2, 3, p.primary);
        this.rect(pixels, 19 + tailWag, bodyY + 1, 2, 2, p.secondary); // white tip
        break;

      case 'dog':
        const earBob = cycle % 2 === 0 ? 0 : 1;
        this.rect(pixels, 5, bodyY - 2 + earBob, 2, 4, p.primaryDark || p.dark);
        this.rect(pixels, 16, bodyY - 2 + earBob, 2, 4, p.primaryDark || p.dark);
        this.rect(pixels, 7, bodyY - 3, 9, 7, p.primary);
        this.rect(pixels, 6, bodyY + 4, 11, 5, p.primary);
        this.rect(pixels, 9, bodyY + 1, 5, 3, p.secondary);
        pixels.push({ x: 11, y: bodyY + 1, color: p.dark });
        this.rect(pixels, 8, bodyY + 9, 2, 1, p.secondary);
        this.rect(pixels, 13, bodyY + 9, 2, 1, p.secondary);
        const dogTail = cycle % 2 === 0 ? 4 : 5;
        pixels.push({ x: dogTail, y: bodyY + 3, color: p.primary });
        break;

      case 'fox':
        this.rect(pixels, 6, bodyY - 6, 3, 3, p.primary);
        this.rect(pixels, 14, bodyY - 6, 3, 3, p.primary);
        pixels.push({ x: 7, y: bodyY - 5, color: p.dark });
        pixels.push({ x: 15, y: bodyY - 5, color: p.dark });
        this.rect(pixels, 6, bodyY - 3, 11, 6, p.primary);
        this.rect(pixels, 5, bodyY, 2, 3, p.secondary);
        this.rect(pixels, 16, bodyY, 2, 3, p.secondary);
        this.rect(pixels, 7, bodyY + 3, 9, 6, p.primary);
        this.rect(pixels, 2, bodyY + 1, 3, 4, p.secondary);
        this.rect(pixels, 7, bodyY + 9, 2, 1, p.dark);
        this.rect(pixels, 14, bodyY + 9, 2, 1, p.dark);
        break;

      case 'penguin':
        this.rect(pixels, 7, bodyY - 3, 9, 12, p.dark);
        this.rect(pixels, 9, bodyY - 1, 5, 9, p.secondary);
        this.rect(pixels, 11, bodyY, 2, 2, p.accent);
        this.rect(pixels, 5, bodyY + 2, 2, 4, p.dark);
        this.rect(pixels, 16, bodyY + 2, 2, 4, p.dark);
        this.rect(pixels, 7, bodyY + 9, 3, 1, p.accent);
        this.rect(pixels, 13, bodyY + 9, 3, 1, p.accent);
        break;

      case 'robot':
        pixels.push({ x: 11, y: bodyY - 6, color: cycle % 2 === 0 ? p.accent : p.primary });
        this.rect(pixels, 11, bodyY - 5, 1, 2, p.dark);
        this.rect(pixels, 6, bodyY - 3, 11, 6, p.primary);
        this.rect(pixels, 7, bodyY - 2, 9, 4, p.dark);
        this.rect(pixels, 7, bodyY + 4, 9, 5, p.primary);
        this.rect(pixels, 6, bodyY + 9, 11, 2, p.dark);
        break;

      case 'ghost':
        const floatBob = Math.sin((cycle / 4) * Math.PI * 2) > 0 ? 1 : -1;
        const gY = bodyY - 2 + floatBob;
        this.rect(pixels, 7, gY, 9, 2, p.secondary);
        this.rect(pixels, 6, gY + 2, 11, 7, p.secondary);
        this.rect(pixels, 6, gY + 9, 3, cycle % 2 === 0 ? 2 : 1, p.secondary);
        this.rect(pixels, 10, gY + 9, 3, cycle % 2 === 1 ? 2 : 1, p.secondary);
        this.rect(pixels, 14, gY + 9, 3, cycle % 2 === 0 ? 2 : 1, p.secondary);
        pixels.push({ x: 6, y: gY + 5, color: p.primary });
        pixels.push({ x: 16, y: gY + 5, color: p.primary });
        break;
    }
  }

  private renderExpression(
    pixels: PixelPoint[],
    species: PetSpecies,
    state: PetAnimationState,
    cycle: number,
    p: Record<string, string>,
    look: { x: number; y: number }
  ) {
    const eyeY = 10;
    // Eye gaze shift (-1, 0, or 1 based on mouse direction)
    const shiftX = Math.max(-1, Math.min(1, Math.round(look.x)));
    const shiftY = Math.max(-1, Math.min(1, Math.round(look.y)));

    switch (state) {
      case 'SLEEPING':
        // Closed relaxed eye slits (- -)
        this.rect(pixels, 8, eyeY, 2, 1, p.eye);
        this.rect(pixels, 13, eyeY, 2, 1, p.eye);
        pixels.push({ x: 11, y: eyeY + 1, color: p.accent }); // nose
        break;

      case 'ERROR':
        // Closed sad downward curved eyes + dizzy scribble
        pixels.push({ x: 8, y: eyeY, color: p.eye }, { x: 9, y: eyeY + 1, color: p.eye });
        pixels.push({ x: 13, y: eyeY + 1, color: p.eye }, { x: 14, y: eyeY, color: p.eye });
        pixels.push({ x: 11, y: eyeY + 2, color: p.accent }); // nose
        break;

      case 'CELEBRATING':
      case 'EXCITED':
      case 'HAPPY':
        // Happy curved eyes (^ ^) and big open smile with tongue
        pixels.push({ x: 8, y: eyeY, color: p.eye }, { x: 9, y: eyeY - 1, color: p.eye });
        pixels.push({ x: 13, y: eyeY - 1, color: p.eye }, { x: 14, y: eyeY, color: p.eye });
        // Nose
        pixels.push({ x: 11, y: eyeY, color: p.accent });
        // Open happy smile with pink tongue
        this.rect(pixels, 10, eyeY + 2, 3, 2, p.dark);
        pixels.push({ x: 11, y: eyeY + 3, color: p.detail }); // pink tongue
        break;

      case 'CONFUSED':
        // Asymmetric head tilt eyes
        this.rect(pixels, 8, eyeY, 2, 2, p.eye);
        pixels.push({ x: 14, y: eyeY - 1, color: p.eye });
        pixels.push({ x: 11, y: eyeY + 1, color: p.accent });
        break;

      case 'SAD':
        // Drooping eyes
        pixels.push({ x: 8, y: eyeY + 1, color: p.eye });
        pixels.push({ x: 9, y: eyeY, color: p.eye });
        pixels.push({ x: 13, y: eyeY, color: p.eye });
        pixels.push({ x: 14, y: eyeY + 1, color: p.eye });
        pixels.push({ x: 11, y: eyeY + 2, color: p.accent });
        break;

      case 'THINKING':
        // Looking up to corner
        pixels.push({ x: 9, y: eyeY - 1, color: p.eye });
        pixels.push({ x: 14, y: eyeY - 1, color: p.eye });
        pixels.push({ x: 11, y: eyeY + 1, color: p.accent });
        break;

      case 'TIRED':
        // Half closed drowsy lids
        this.rect(pixels, 8, eyeY - 1, 2, 1, p.dark);
        pixels.push({ x: 8, y: eyeY, color: p.eye });
        this.rect(pixels, 13, eyeY - 1, 2, 1, p.dark);
        pixels.push({ x: 13, y: eyeY, color: p.eye });
        pixels.push({ x: 11, y: eyeY + 1, color: p.accent });
        break;

      case 'IDLE':
      case 'WALKING':
      case 'CODING':
      default:
        // Regular blinking & interactive gaze tracking!
        if (cycle === 3) {
          // Blink
          this.rect(pixels, 8, eyeY, 2, 1, p.eye);
          this.rect(pixels, 13, eyeY, 2, 1, p.eye);
        } else {
          // 2x2 solid dark retro eyes with gaze shift!
          const eye1X = 8 + shiftX;
          const eye2X = 13 + shiftX;
          const eyeYPos = eyeY - 1 + shiftY;

          this.rect(pixels, eye1X, eyeYPos, 2, 2, p.eye);
          this.rect(pixels, eye2X, eyeYPos, 2, 2, p.eye);
        }
        // Pink nose at center
        pixels.push({ x: 11, y: eyeY + 1, color: p.accent });
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
      // 16-bit mini laptop open in front (matching reference image)
      // Display lid
      this.rect(pixels, 13, 12, 7, 5, '#334155');
      // Glowing illuminated laptop emblem (e.g. white Apple/logo dot)
      pixels.push({ x: 16, y: 14, color: '#ffffff' });
      // Keyboard base
      this.rect(pixels, 11, 17, 9, 2, '#1e293b');
      // Typing paws tapping keys
      const pawTap = cycle % 2;
      pixels.push({ x: 12 + pawTap, y: 16, color: p.secondary });
      pixels.push({ x: 15 - pawTap, y: 16, color: p.secondary });
    } else if (state === 'THINKING') {
      // Small 3-dot thought bubble "..." above head (matching reference image)
      this.rect(pixels, 15, 2, 7, 5, '#ffffff');
      this.rect(pixels, 16, 1, 5, 1, '#ffffff');
      this.rect(pixels, 16, 7, 5, 1, '#ffffff');
      // Thought bubble tail dots
      pixels.push({ x: 14, y: 7, color: '#ffffff' });
      pixels.push({ x: 13, y: 9, color: '#ffffff' });
      // The three dots "..."
      pixels.push({ x: 17, y: 4, color: '#2b2338' });
      pixels.push({ x: 19, y: 4, color: '#2b2338' });
      pixels.push({ x: 21, y: 4, color: '#2b2338' });
    } else if (state === 'ERROR') {
      // Dizzy spiral scribble / swirl over head (matching reference image)
      const swirlColor = '#94a3b8';
      this.rect(pixels, 10, 2, 4, 1, swirlColor);
      this.rect(pixels, 14, 3, 1, 3, swirlColor);
      this.rect(pixels, 11, 6, 3, 1, swirlColor);
      this.rect(pixels, 9, 3, 1, 3, swirlColor);
      pixels.push({ x: 12, y: 4, color: swirlColor });
    } else if (state === 'HAPPY' || state === 'EXCITED' || state === 'CELEBRATING') {
      // Dual golden celebration sparkle crosses (+ +) on left and right (matching reference image)
      const gColor = p.glint || '#facc15';
      // Left cross glint (+)
      pixels.push({ x: 2, y: 5, color: gColor });
      this.rect(pixels, 1, 6, 3, 1, gColor);
      pixels.push({ x: 2, y: 7, color: gColor });
      // Right cross glint (+)
      pixels.push({ x: 21, y: 6, color: gColor });
      this.rect(pixels, 20, 7, 3, 1, gColor);
      pixels.push({ x: 21, y: 8, color: gColor });
    } else if (state === 'SLEEPING') {
      // Floating retro "Z z z"
      const zColor = '#ffffff';
      pixels.push({ x: 19, y: 5, color: zColor }, { x: 20, y: 5, color: zColor }, { x: 21, y: 5, color: zColor });
      pixels.push({ x: 20, y: 6, color: zColor });
      pixels.push({ x: 19, y: 7, color: zColor }, { x: 20, y: 7, color: zColor }, { x: 21, y: 7, color: zColor });
      // Smaller z
      pixels.push({ x: 17, y: 9, color: zColor }, { x: 18, y: 9, color: zColor });
      pixels.push({ x: 18, y: 10, color: zColor });
      pixels.push({ x: 17, y: 11, color: zColor }, { x: 18, y: 11, color: zColor });
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
        this.rect(pixels, 5, 5, 13, 2, '#3b2d54');
        this.rect(pixels, 7, 3, 9, 2, '#5e3a8c');
        this.rect(pixels, 9, 1, 5, 2, '#5e3a8c');
        pixels.push({ x: 11, y: 0, color: '#facc15' });
        break;

      case 'top-hat':
        this.rect(pixels, 5, 5, 13, 1, '#1a202c');
        this.rect(pixels, 7, 1, 9, 4, '#1a202c');
        this.rect(pixels, 7, 4, 9, 1, '#e53e3e');
        break;

      case 'cool-glasses':
        this.rect(pixels, 7, 8, 4, 3, '#111111');
        this.rect(pixels, 13, 8, 4, 3, '#111111');
        this.rect(pixels, 11, 9, 2, 1, '#111111');
        pixels.push({ x: 8, y: 8, color: '#ffffff' });
        pixels.push({ x: 14, y: 8, color: '#ffffff' });
        break;

      case 'bowtie':
        this.rect(pixels, 9, 14, 2, 2, '#e53e3e');
        pixels.push({ x: 11, y: 14, color: '#ffffff' });
        this.rect(pixels, 12, 14, 2, 2, '#e53e3e');
        break;

      case 'developer-headset':
        this.rect(pixels, 7, 3, 9, 1, '#4a5568');
        this.rect(pixels, 6, 5, 2, 5, '#e53e3e');
        this.rect(pixels, 15, 5, 2, 5, '#e53e3e');
        pixels.push({ x: 15, y: 10, color: '#4a5568' });
        pixels.push({ x: 14, y: 11, color: '#e53e3e' });
        break;

      case 'halo':
        this.rect(pixels, 7, 2, 9, 1, '#facc15');
        pixels.push({ x: 6, y: 3, color: '#facc15' });
        pixels.push({ x: 16, y: 3, color: '#facc15' });
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
