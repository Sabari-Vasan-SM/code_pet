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

// 32-bit High-Fidelity Color Palettes with Realistic Lighting & Shading
export const PALETTES: Record<PetSkin, Record<string, string>> = {
  default: {
    // Realistic Ginger Tabby / Animal Colors
    primary: '#f28b24',        // Vibrant warm ginger
    primaryDark: '#c96a12',    // Fur shadow / stripes
    primaryDeep: '#8f4405',    // Deep contour shading
    primaryLight: '#ffa852',   // Sunlit fur highlight
    secondary: '#ffffff',      // Pure white bib / paws / muzzle
    secondaryShade: '#e2e8f0', // Soft shaded white
    dark: '#1e1b26',           // Crisp dark outline & pupils
    accent: '#ff94a4',         // Soft pink inner ear / nose / tongue
    accentDark: '#e06075',     // Shaded pink
    eye: '#1e1b26',            // Dark iris
    eyeHighlight: '#ffffff',   // Glistening catchlight
    detail: '#ff758f',         // Blush & mouth interior
    glint: '#facc15',          // Golden sparkle stars

    // Dino colors
    dinoGreen: '#22c55e',
    dinoDark: '#15803d',
    dinoLight: '#86efac',
    dinoBelly: '#bbf7d0',
    dinoSpikes: '#047857',

    // Parrot colors
    parrotRed: '#ef4444',
    parrotYellow: '#eab308',
    parrotBlue: '#3b82f6',
    parrotBeak: '#475569',

    // Snake colors
    snakeGreen: '#10b981',
    snakeDark: '#047857',
    snakeLight: '#6ee7b7',
    snakeBelly: '#d1fae5',
    snakeTongue: '#f43f5e'
  },
  neon: {
    primary: '#00f0ff',
    primaryDark: '#0099cc',
    primaryDeep: '#004d66',
    primaryLight: '#80f8ff',
    secondary: '#ffffff',
    secondaryShade: '#cceeff',
    dark: '#050716',
    accent: '#ff007f',
    accentDark: '#cc0066',
    eye: '#ffe600',
    eyeHighlight: '#ffffff',
    detail: '#39ff14',
    glint: '#00f0ff',

    dinoGreen: '#00ffcc',
    dinoDark: '#00997a',
    dinoLight: '#80ffe5',
    dinoBelly: '#e6fffa',
    dinoSpikes: '#ff007f',

    parrotRed: '#ff007f',
    parrotYellow: '#ffe600',
    parrotBlue: '#00f0ff',
    parrotBeak: '#1a1a2e',

    snakeGreen: '#39ff14',
    snakeDark: '#20900b',
    snakeLight: '#8aff75',
    snakeBelly: '#eaffea',
    snakeTongue: '#ff007f'
  },
  pastel: {
    primary: '#f4a6c6',
    primaryDark: '#d97d9e',
    primaryDeep: '#9c4d68',
    primaryLight: '#ffd6e7',
    secondary: '#ffffff',
    secondaryShade: '#f1f5f9',
    dark: '#334155',
    accent: '#fbcfe8',
    accentDark: '#f472b6',
    eye: '#1e293b',
    eyeHighlight: '#ffffff',
    detail: '#fb7185',
    glint: '#fde047',

    dinoGreen: '#86efac',
    dinoDark: '#4ade80',
    dinoLight: '#bbf7d0',
    dinoBelly: '#f0fdf4',
    dinoSpikes: '#f472b6',

    parrotRed: '#fda4af',
    parrotYellow: '#fef08a',
    parrotBlue: '#93c5fd',
    parrotBeak: '#64748b',

    snakeGreen: '#a7f3d0',
    snakeDark: '#6ee7b7',
    snakeLight: '#d1fae5',
    snakeBelly: '#f0fdf4',
    snakeTongue: '#fb7185'
  },
  'retro-monochrome': {
    primary: '#88a070',
    primaryDark: '#506840',
    primaryDeep: '#283820',
    primaryLight: '#a8c090',
    secondary: '#e8f0d8',
    secondaryShade: '#d0d8b8',
    dark: '#182010',
    accent: '#a0b888',
    accentDark: '#688050',
    eye: '#182010',
    eyeHighlight: '#ffffff',
    detail: '#506840',
    glint: '#d0d8b8',

    dinoGreen: '#88a070',
    dinoDark: '#506840',
    dinoLight: '#a8c090',
    dinoBelly: '#e8f0d8',
    dinoSpikes: '#283820',

    parrotRed: '#a8c090',
    parrotYellow: '#d0d8b8',
    parrotBlue: '#506840',
    parrotBeak: '#182010',

    snakeGreen: '#88a070',
    snakeDark: '#506840',
    snakeLight: '#a8c090',
    snakeBelly: '#e8f0d8',
    snakeTongue: '#283820'
  },
  golden: {
    primary: '#f59e0b',
    primaryDark: '#b45309',
    primaryDeep: '#78350f',
    primaryLight: '#fbbf24',
    secondary: '#fef3c7',
    secondaryShade: '#fde68a',
    dark: '#291b0f',
    accent: '#fde68a',
    accentDark: '#d97706',
    eye: '#291b0f',
    eyeHighlight: '#ffffff',
    detail: '#f59e0b',
    glint: '#fbbf24',

    dinoGreen: '#d97706',
    dinoDark: '#92400e',
    dinoLight: '#fcd34d',
    dinoBelly: '#fef3c7',
    dinoSpikes: '#78350f',

    parrotRed: '#f59e0b',
    parrotYellow: '#fef08a',
    parrotBlue: '#d97706',
    parrotBeak: '#451a03',

    snakeGreen: '#f59e0b',
    snakeDark: '#b45309',
    snakeLight: '#fde68a',
    snakeBelly: '#fef3c7',
    snakeTongue: '#78350f'
  },
  cyberpunk: {
    primary: '#ec4899',
    primaryDark: '#be185d',
    primaryDeep: '#831843',
    primaryLight: '#f472b6',
    secondary: '#67e8f9',
    secondaryShade: '#22d3ee',
    dark: '#0f172a',
    accent: '#a855f7',
    accentDark: '#7e22ce',
    eye: '#38bdf8',
    eyeHighlight: '#ffffff',
    detail: '#f43f5e',
    glint: '#e879f9',

    dinoGreen: '#10b981',
    dinoDark: '#047857',
    dinoLight: '#34d399',
    dinoBelly: '#a7f3d0',
    dinoSpikes: '#ec4899',

    parrotRed: '#ec4899',
    parrotYellow: '#facc15',
    parrotBlue: '#38bdf8',
    parrotBeak: '#1e1b4b',

    snakeGreen: '#06b6d4',
    snakeDark: '#0e7490',
    snakeLight: '#67e8f9',
    snakeBelly: '#cffafe',
    snakeTongue: '#ec4899'
  }
};

export class PixelSpriteEngine {
  private baseGridSize = 32; // 32x32 resolution for lifelike pet detail

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

    this.renderSpeciesBody(pixels, species, state, cycle, palette, lookDirection);
    this.renderExpression(pixels, species, state, cycle, palette, lookDirection);
    this.renderProps(pixels, state, cycle, palette);

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

    const bodyY = isSleeping ? 18 : 14 + bob;

    switch (species) {
      // 🐱 1. REALISTIC 32-BIT CAT
      case 'cat':
      case 'custom':
        if (isSleeping) {
          // Curled flat sleeping loaf
          this.rect(pixels, 6, 18, 20, 8, p.primary);
          this.rect(pixels, 8, 16, 16, 3, p.primaryLight);
          this.rect(pixels, 7, 24, 18, 2, p.primaryDark);
          // Dark outline bottom
          this.rect(pixels, 6, 26, 20, 1, p.dark);

          // Folded ears with pink tufts
          this.rect(pixels, 7, 15, 3, 2, p.primary);
          pixels.push({ x: 8, y: 15, color: p.accent });
          this.rect(pixels, 19, 15, 3, 2, p.primary);
          pixels.push({ x: 20, y: 15, color: p.accent });

          // White chest & paws tucked in
          this.rect(pixels, 11, 20, 8, 5, p.secondary);
          this.rect(pixels, 9, 23, 3, 2, p.secondaryShade);
          this.rect(pixels, 18, 23, 3, 2, p.secondaryShade);

          // Curled tail wrapping around body with white tip
          this.rect(pixels, 24, 20, 3, 5, p.primaryDark);
          this.rect(pixels, 23, 19, 3, 2, p.secondary);
          break;
        }

        if (isHappy) {
          // Celebratory standing pose: paws raised high in the air (\o/)
          // Detailed triangular ears with fluffy inner ear tufts
          this.rect(pixels, 8, bodyY - 7, 4, 4, p.primary);
          this.rect(pixels, 9, bodyY - 6, 2, 3, p.accent);
          pixels.push({ x: 10, y: bodyY - 5, color: p.secondary }); // tuft

          this.rect(pixels, 19, bodyY - 7, 4, 4, p.primary);
          this.rect(pixels, 20, bodyY - 6, 2, 3, p.accent);
          pixels.push({ x: 21, y: bodyY - 5, color: p.secondary });

          // Head with fur shading & cheek ruffs
          this.rect(pixels, 7, bodyY - 4, 17, 9, p.primary);
          this.rect(pixels, 9, bodyY - 4, 13, 2, p.primaryLight);
          // White muzzle blaze
          this.rect(pixels, 12, bodyY - 1, 7, 7, p.secondary);
          // Pink cheek blush
          this.rect(pixels, 8, bodyY + 2, 2, 2, p.accentDark);
          this.rect(pixels, 21, bodyY + 2, 2, 2, p.accentDark);

          // Raised front paws cheering high
          this.rect(pixels, 4, bodyY - 3, 3, 6, p.primary);
          this.rect(pixels, 4, bodyY - 5, 3, 3, p.secondary); // white paw left
          this.rect(pixels, 24, bodyY - 3, 3, 6, p.primary);
          this.rect(pixels, 24, bodyY - 5, 3, 3, p.secondary); // white paw right

          // Torso & white bib
          this.rect(pixels, 10, bodyY + 5, 11, 7, p.primary);
          this.rect(pixels, 12, bodyY + 5, 7, 7, p.secondary);
          this.rect(pixels, 10, bodyY + 11, 4, 2, p.secondary);
          this.rect(pixels, 17, bodyY + 11, 4, 2, p.secondary);

          // Upright celebratory tail
          const tailSway = cycle % 2 === 0 ? 0 : 1;
          this.rect(pixels, 23, bodyY + 4 + tailSway, 3, 6, p.primaryDark);
          this.rect(pixels, 24, bodyY + 2 + tailSway, 3, 3, p.secondary);
          break;
        }

        // Standard 32-bit Realistic Cat (Idle, Walk, Sit, Code, Think, Error)
        // Ears with 32-bit gradient & inner fur tufts
        this.rect(pixels, 8, bodyY - 6, 4, 4, p.primary);
        this.rect(pixels, 9, bodyY - 5, 2, 3, p.accent);
        pixels.push({ x: 9, y: bodyY - 4, color: p.secondary }); // inner tuft

        this.rect(pixels, 19, bodyY - 6, 4, 4, p.primary);
        this.rect(pixels, 20, bodyY - 5, 2, 3, p.accent);
        pixels.push({ x: 20, y: bodyY - 4, color: p.secondary });

        // Head dome with realistic fur highlights
        this.rect(pixels, 7, bodyY - 3, 17, 9, p.primary);
        this.rect(pixels, 9, bodyY - 3, 13, 2, p.primaryLight);
        // Tabby forehead marking
        pixels.push({ x: 15, y: bodyY - 2, color: p.primaryDark });
        pixels.push({ x: 14, y: bodyY - 1, color: p.primaryDark });
        pixels.push({ x: 16, y: bodyY - 1, color: p.primaryDark });

        // Fluffy cheek ruffs
        pixels.push({ x: 6, y: bodyY + 2, color: p.primaryLight });
        pixels.push({ x: 6, y: bodyY + 3, color: p.secondary });
        pixels.push({ x: 24, y: bodyY + 2, color: p.primaryLight });
        pixels.push({ x: 24, y: bodyY + 3, color: p.secondary });

        // White muzzle & chin
        this.rect(pixels, 12, bodyY, 7, 6, p.secondary);
        // Whiskers!
        pixels.push({ x: 6, y: bodyY + 1, color: '#ffffff' });
        pixels.push({ x: 5, y: bodyY + 1, color: '#ffffff' });
        pixels.push({ x: 24, y: bodyY + 1, color: '#ffffff' });
        pixels.push({ x: 25, y: bodyY + 1, color: '#ffffff' });

        // Body with shading
        this.rect(pixels, 9, bodyY + 5, 13, 7, p.primary);
        this.rect(pixels, 12, bodyY + 5, 7, 7, p.secondary); // white chest
        this.rect(pixels, 9, bodyY + 7, 2, 4, p.primaryDark); // flank shadow

        // Paws with toe separations
        if (isWalk) {
          const s1 = cycle % 2 === 0 ? 0 : 2;
          const s2 = cycle % 2 === 0 ? 2 : 0;
          this.rect(pixels, 10, bodyY + 11 - s1, 3, 2 + s1, p.secondary);
          this.rect(pixels, 17, bodyY + 11 - s2, 3, 2 + s2, p.secondary);
        } else {
          this.rect(pixels, 10, bodyY + 11, 4, 2, p.secondary);
          this.rect(pixels, 17, bodyY + 11, 4, 2, p.secondary);
        }

        // Elegant curved tail with white tip
        const tailOffset = isWalk ? (cycle % 2 === 0 ? 0 : 1) : (cycle === 1 ? 1 : cycle === 3 ? -1 : 0);
        this.rect(pixels, 22, bodyY + 5, 3, 6, p.primary);
        this.rect(pixels, 23 + tailOffset, bodyY + 2, 3, 4, p.primary);
        this.rect(pixels, 24 + tailOffset, bodyY + 1, 3, 2, p.secondary);
        break;

      // 🐶 2. REALISTIC 32-BIT DOG
      case 'dog':
        const earBob = cycle % 2 === 0 ? 0 : 1;
        // Floppy shaded hound/retriever ears
        this.rect(pixels, 6, bodyY - 4 + earBob, 4, 8, p.primaryDark);
        this.rect(pixels, 22, bodyY - 4 + earBob, 4, 8, p.primaryDark);

        // Head
        this.rect(pixels, 9, bodyY - 4, 14, 9, p.primary);
        this.rect(pixels, 11, bodyY - 4, 10, 2, p.primaryLight);

        // Canine snout with black wet nose
        this.rect(pixels, 12, bodyY, 8, 6, p.secondary);
        this.rect(pixels, 14, bodyY, 4, 2, p.dark);
        pixels.push({ x: 15, y: bodyY, color: p.eyeHighlight }); // nose shine

        // Body & golden chest
        this.rect(pixels, 8, bodyY + 5, 16, 7, p.primary);
        this.rect(pixels, 12, bodyY + 5, 8, 7, p.secondary);

        // Paws
        this.rect(pixels, 10, bodyY + 11, 4, 2, p.secondary);
        this.rect(pixels, 18, bodyY + 11, 4, 2, p.secondary);

        // Happy wagging dog tail
        const dTail = cycle % 2 === 0 ? 5 : 6;
        this.rect(pixels, 5, bodyY + dTail, 3, 3, p.primary);
        break;

      // 🦊 3. REALISTIC 32-BIT FOX
      case 'fox':
        // Big pointy fox ears with dark back & white inner fur
        this.rect(pixels, 7, bodyY - 8, 5, 5, p.dark);
        this.rect(pixels, 8, bodyY - 7, 3, 4, p.primary);
        pixels.push({ x: 9, y: bodyY - 6, color: p.secondary });

        this.rect(pixels, 19, bodyY - 8, 5, 5, p.dark);
        this.rect(pixels, 20, bodyY - 7, 3, 4, p.primary);
        pixels.push({ x: 21, y: bodyY - 6, color: p.secondary });

        // Head & white ruff cheeks
        this.rect(pixels, 8, bodyY - 4, 15, 8, p.primary);
        this.rect(pixels, 6, bodyY, 3, 4, p.secondary);
        this.rect(pixels, 22, bodyY, 3, 4, p.secondary);

        // Snout with black tip
        this.rect(pixels, 13, bodyY + 1, 5, 4, p.secondary);
        pixels.push({ x: 15, y: bodyY + 1, color: p.dark });

        // Slender body & dark stockings
        this.rect(pixels, 9, bodyY + 4, 13, 7, p.primary);
        this.rect(pixels, 13, bodyY + 4, 5, 7, p.secondary);
        this.rect(pixels, 10, bodyY + 10, 3, 3, p.dark); // dark paws
        this.rect(pixels, 18, bodyY + 10, 3, 3, p.dark);

        // Huge bushy fox brush tail with big white tip
        this.rect(pixels, 3, bodyY + 2, 6, 8, p.primary);
        this.rect(pixels, 2, bodyY + 1, 4, 4, p.secondary);
        break;

      // 🦖 4. NEW PET: EMERALD DINO (Raptor / T-Rex)
      case 'dino':
        const dG = p.dinoGreen || '#22c55e';
        const dD = p.dinoDark || '#15803d';
        const dL = p.dinoLight || '#86efac';
        const dB = p.dinoBelly || '#bbf7d0';
        const dS = p.dinoSpikes || '#047857';

        if (isSleeping) {
          // Curled sleeping dino
          this.rect(pixels, 7, 18, 18, 8, dG);
          this.rect(pixels, 9, 21, 12, 4, dB);
          // Tail curled around
          this.rect(pixels, 5, 20, 3, 5, dD);
          // Tiny spikes on back
          pixels.push({ x: 11, y: 17, color: dS }, { x: 15, y: 17, color: dS }, { x: 19, y: 17, color: dS });
          break;
        }

        // Rounded raptor head with snout
        this.rect(pixels, 10, bodyY - 5, 12, 9, dG);
        this.rect(pixels, 18, bodyY - 3, 5, 6, dG); // snout protruding
        this.rect(pixels, 11, bodyY - 5, 8, 2, dL); // brow highlight
        pixels.push({ x: 21, y: bodyY - 1, color: dD }); // nostril

        // Triangular spikes down the head & spine
        pixels.push({ x: 9, y: bodyY - 5, color: dS });
        pixels.push({ x: 8, y: bodyY - 2, color: dS });
        pixels.push({ x: 7, y: bodyY + 2, color: dS });
        pixels.push({ x: 6, y: bodyY + 6, color: dS });

        // Plump belly & body
        this.rect(pixels, 8, bodyY + 4, 13, 8, dG);
        this.rect(pixels, 12, bodyY + 4, 8, 7, dB); // light underbelly

        // Tiny cute dino arms!
        if (isHappy) {
          // Arms raised up
          this.rect(pixels, 18, bodyY + 2, 4, 2, dG);
          pixels.push({ x: 21, y: bodyY + 1, color: dL });
        } else {
          this.rect(pixels, 18, bodyY + 5, 3, 2, dG);
          pixels.push({ x: 20, y: bodyY + 6, color: dL }); // claws
        }

        // Heavy counterbalancing tail
        const dinoTailWag = cycle % 2 === 0 ? 0 : 1;
        this.rect(pixels, 3, bodyY + 5 + dinoTailWag, 6, 5, dG);
        this.rect(pixels, 1, bodyY + 3 + dinoTailWag, 3, 4, dG);

        // Strong muscular hind legs
        this.rect(pixels, 10, bodyY + 11, 4, 2, dG);
        this.rect(pixels, 16, bodyY + 11, 4, 2, dG);
        break;

      // 🦜 5. NEW PET: TROPICAL PARROT (Macaw / Parakeet)
      case 'parrot':
        const pR = p.parrotRed || '#ef4444';
        const pY = p.parrotYellow || '#eab308';
        const pB = p.parrotBlue || '#3b82f6';
        const pBk = p.parrotBeak || '#475569';

        // Vibrant parrot head
        this.rect(pixels, 11, bodyY - 6, 10, 8, pR);
        this.rect(pixels, 12, bodyY - 6, 7, 2, '#f87171');

        // White facial feather patch
        this.rect(pixels, 16, bodyY - 4, 4, 4, '#ffffff');

        // Curved dark hooked beak
        this.rect(pixels, 20, bodyY - 3, 3, 4, pBk);
        pixels.push({ x: 22, y: bodyY - 1, color: pBk });

        // Round tropical body
        this.rect(pixels, 10, bodyY + 2, 10, 9, pR);

        // Multicolored wings (Red -> Yellow -> Blue)
        if (isHappy) {
          // Flapping wings spread wide!
          this.rect(pixels, 3, bodyY - 1, 7, 4, pR);
          this.rect(pixels, 3, bodyY + 3, 7, 3, pY);
          this.rect(pixels, 2, bodyY + 6, 7, 3, pB);
        } else {
          this.rect(pixels, 7, bodyY + 2, 5, 4, pR);
          this.rect(pixels, 7, bodyY + 6, 5, 3, pY);
          this.rect(pixels, 7, bodyY + 9, 5, 4, pB);
        }

        // Long blue & yellow tail feathers
        this.rect(pixels, 6, bodyY + 11, 3, 6, pB);
        this.rect(pixels, 8, bodyY + 11, 2, 4, pY);

        // Perched bird feet
        this.rect(pixels, 13, bodyY + 11, 2, 2, '#f59e0b');
        this.rect(pixels, 17, bodyY + 11, 2, 2, '#f59e0b');
        break;

      // 🐍 6. NEW PET: PYTHON SNAKE
      case 'snake':
        const sG = p.snakeGreen || '#10b981';
        const sD = p.snakeDark || '#047857';
        const sL = p.snakeLight || '#6ee7b7';
        const sB = p.snakeBelly || '#d1fae5';

        if (isSleeping) {
          // Snake coiled in a concentric spiral
          this.rect(pixels, 8, 18, 16, 7, sG);
          this.rect(pixels, 10, 19, 12, 4, sD);
          this.rect(pixels, 12, 20, 8, 2, sL);
          // Head resting on top of coil
          this.rect(pixels, 18, 17, 5, 4, sG);
          break;
        }

        // Coiled snake body rings
        this.rect(pixels, 6, bodyY + 6, 19, 6, sG);
        this.rect(pixels, 7, bodyY + 8, 17, 4, sB); // pale underbelly
        this.rect(pixels, 10, bodyY + 6, 3, 2, sD); // decorative markings
        this.rect(pixels, 16, bodyY + 6, 3, 2, sD);

        // Elevated sleek serpent head
        const snakeBob = isHappy ? -3 : 0;
        this.rect(pixels, 17, bodyY - 3 + snakeBob, 8, 6, sG);
        this.rect(pixels, 19, bodyY - 3 + snakeBob, 5, 2, sL); // crown highlight
        this.rect(pixels, 19, bodyY + 1 + snakeBob, 6, 2, sB); // jaw

        // Flickering red tongue!
        if (cycle % 2 === 0 || isHappy) {
          pixels.push({ x: 25, y: bodyY + 1 + snakeBob, color: '#f43f5e' });
          pixels.push({ x: 26, y: bodyY + snakeBob, color: '#f43f5e' });
          pixels.push({ x: 26, y: bodyY + 2 + snakeBob, color: '#f43f5e' });
        }
        break;

      // 🐧 7. PENGUIN
      case 'penguin':
        this.rect(pixels, 9, bodyY - 5, 13, 16, p.dark);
        this.rect(pixels, 12, bodyY - 2, 7, 12, p.secondary);
        this.rect(pixels, 14, bodyY, 3, 3, p.accent);
        this.rect(pixels, 7, bodyY + 2, 3, 7, p.dark);
        this.rect(pixels, 21, bodyY + 2, 3, 7, p.dark);
        this.rect(pixels, 10, bodyY + 11, 4, 2, p.accent);
        this.rect(pixels, 17, bodyY + 11, 4, 2, p.accent);
        break;

      // 🤖 8. ROBOT
      case 'robot':
        pixels.push({ x: 15, y: bodyY - 8, color: p.accent });
        this.rect(pixels, 15, bodyY - 7, 2, 3, p.dark);
        this.rect(pixels, 8, bodyY - 4, 15, 8, p.primary);
        this.rect(pixels, 10, bodyY - 2, 11, 5, p.dark);
        this.rect(pixels, 9, bodyY + 4, 13, 7, p.primary);
        this.rect(pixels, 8, bodyY + 11, 15, 3, p.dark);
        break;

      // 👻 9. GHOST
      case 'ghost':
        const gBob = Math.sin((cycle / 4) * Math.PI * 2) > 0 ? 1 : -1;
        const ghostY = bodyY - 2 + gBob;
        this.rect(pixels, 9, ghostY - 3, 13, 14, p.secondary);
        this.rect(pixels, 9, ghostY + 10, 4, cycle % 2 === 0 ? 3 : 1, p.secondary);
        this.rect(pixels, 14, ghostY + 10, 4, cycle % 2 === 1 ? 3 : 1, p.secondary);
        this.rect(pixels, 19, ghostY + 10, 4, cycle % 2 === 0 ? 3 : 1, p.secondary);
        pixels.push({ x: 8, y: ghostY + 4, color: p.accent });
        pixels.push({ x: 22, y: ghostY + 4, color: p.accent });
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
    const eyeY = 14;
    const shiftX = Math.max(-1, Math.min(1, Math.round(look.x)));
    const shiftY = Math.max(-1, Math.min(1, Math.round(look.y)));

    // Eye positions vary slightly per species
    const isBird = species === 'parrot';
    const isSnake = species === 'snake';
    const isDino = species === 'dino';

    if (state === 'SLEEPING') {
      // Slit curved closed sleeping eyes
      this.rect(pixels, 11, eyeY, 3, 1, p.eye);
      this.rect(pixels, 18, eyeY, 3, 1, p.eye);
      return;
    }

    if (state === 'ERROR') {
      // Dizzy spiral sad eyes
      pixels.push({ x: 11, y: eyeY, color: p.eye }, { x: 12, y: eyeY + 1, color: p.eye });
      pixels.push({ x: 18, y: eyeY + 1, color: p.eye }, { x: 19, y: eyeY, color: p.eye });
      return;
    }

    if (state === 'CELEBRATING' || state === 'EXCITED' || state === 'HAPPY') {
      // Happy smiling arch eyes (^ ^) and open mouth
      pixels.push({ x: 11, y: eyeY - 1, color: p.eye }, { x: 12, y: eyeY - 2, color: p.eye }, { x: 13, y: eyeY - 1, color: p.eye });
      pixels.push({ x: 18, y: eyeY - 1, color: p.eye }, { x: 19, y: eyeY - 2, color: p.eye }, { x: 20, y: eyeY - 1, color: p.eye });
      // Open mouth with tongue
      this.rect(pixels, 14, eyeY + 2, 4, 3, p.dark);
      pixels.push({ x: 15, y: eyeY + 3, color: p.detail }, { x: 16, y: eyeY + 3, color: p.detail });
      return;
    }

    // Standard eyes with 32-bit pupils, eye shine & gaze shift
    if (cycle === 3) {
      // Natural blink
      this.rect(pixels, 11, eyeY, 3, 1, p.eye);
      this.rect(pixels, 18, eyeY, 3, 1, p.eye);
    } else {
      const e1X = (isBird ? 17 : isSnake ? 20 : isDino ? 16 : 11) + shiftX;
      const e2X = (isBird ? 17 : isSnake ? 20 : isDino ? 16 : 18) + shiftX;
      const eY = eyeY - 1 + shiftY;

      // Almond/round eyes with pupil and bright catchlight
      this.rect(pixels, e1X, eY, 3, 3, p.eye);
      pixels.push({ x: e1X, y: eY, color: p.eyeHighlight }); // catchlight

      if (!isBird && !isSnake && !isDino) {
        this.rect(pixels, e2X, eY, 3, 3, p.eye);
        pixels.push({ x: e2X, y: eY, color: p.eyeHighlight });
      }
    }

    // Realistic pink nose for furry pets
    if (species === 'cat' || species === 'dog' || species === 'custom') {
      this.rect(pixels, 15, eyeY + 2, 2, 1, p.accent);
    }
  }

  private renderProps(
    pixels: PixelPoint[],
    state: PetAnimationState,
    cycle: number,
    p: Record<string, string>
  ) {
    if (state === 'CODING') {
      // 32-bit detailed angled laptop in front of paws
      // Screen lid with glowing Apple/code logo
      this.rect(pixels, 17, 16, 11, 7, '#334155');
      this.rect(pixels, 18, 17, 9, 5, '#1e293b');
      pixels.push({ x: 22, y: 19, color: '#38bdf8' }); // glowing logo
      // Base keyboard
      this.rect(pixels, 15, 23, 14, 3, '#0f172a');
      this.rect(pixels, 17, 23, 10, 1, '#64748b'); // keyboard row
      // Typing paws
      const pawTap = cycle % 2;
      pixels.push({ x: 16 + pawTap, y: 22, color: p.secondary });
      pixels.push({ x: 20 - pawTap, y: 22, color: p.secondary });
    } else if (state === 'THINKING') {
      // 32-bit floating thought bubble with three dots
      this.rect(pixels, 21, 2, 9, 7, '#ffffff');
      this.rect(pixels, 22, 1, 7, 9, '#ffffff');
      pixels.push({ x: 20, y: 9, color: '#ffffff' });
      pixels.push({ x: 19, y: 11, color: '#ffffff' });
      // The three dots "..."
      pixels.push({ x: 23, y: 5, color: '#1e293b' });
      pixels.push({ x: 25, y: 5, color: '#1e293b' });
      pixels.push({ x: 27, y: 5, color: '#1e293b' });
    } else if (state === 'ERROR') {
      // Dizzy spiral scribble storm cloud
      const sCol = '#94a3b8';
      this.rect(pixels, 13, 2, 6, 2, sCol);
      this.rect(pixels, 18, 3, 2, 4, sCol);
      this.rect(pixels, 14, 7, 5, 2, sCol);
      this.rect(pixels, 12, 4, 2, 4, sCol);
      pixels.push({ x: 15, y: 5, color: sCol });
    } else if (state === 'HAPPY' || state === 'EXCITED' || state === 'CELEBRATING') {
      // 32-bit golden celebration sparkle crosses (+ +)
      const glint = p.glint || '#facc15';
      // Left glint
      this.rect(pixels, 2, 7, 5, 1, glint);
      this.rect(pixels, 4, 5, 1, 5, glint);
      // Right glint
      this.rect(pixels, 26, 8, 5, 1, glint);
      this.rect(pixels, 28, 6, 1, 5, glint);
    } else if (state === 'SLEEPING') {
      // Floating retro Zzz
      const zC = '#ffffff';
      this.rect(pixels, 25, 6, 4, 1, zC);
      pixels.push({ x: 27, y: 7, color: zC });
      pixels.push({ x: 26, y: 8, color: zC });
      this.rect(pixels, 25, 9, 4, 1, zC);
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
        this.rect(pixels, 7, 7, 18, 3, '#3b2d54');
        this.rect(pixels, 10, 4, 12, 3, '#5e3a8c');
        this.rect(pixels, 13, 1, 6, 3, '#5e3a8c');
        pixels.push({ x: 15, y: 0, color: '#facc15' }); // golden star
        break;

      case 'top-hat':
        this.rect(pixels, 7, 7, 18, 2, '#1a202c');
        this.rect(pixels, 10, 1, 12, 6, '#1a202c');
        this.rect(pixels, 10, 6, 12, 2, '#e53e3e'); // red silk ribbon
        break;

      case 'cool-glasses':
        this.rect(pixels, 9, 11, 6, 5, '#111111');
        this.rect(pixels, 17, 11, 6, 5, '#111111');
        this.rect(pixels, 15, 12, 2, 2, '#111111'); // bridge
        pixels.push({ x: 10, y: 12, color: '#ffffff' }); // white glare
        pixels.push({ x: 18, y: 12, color: '#ffffff' });
        break;

      case 'bowtie':
        this.rect(pixels, 12, 19, 3, 3, '#e53e3e');
        pixels.push({ x: 15, y: 20, color: '#ffffff' });
        this.rect(pixels, 16, 19, 3, 3, '#e53e3e');
        break;

      case 'developer-headset':
        this.rect(pixels, 10, 5, 12, 2, '#4a5568'); // band
        this.rect(pixels, 7, 9, 3, 7, '#e53e3e');  // left ear cup
        this.rect(pixels, 22, 9, 3, 7, '#e53e3e'); // right ear cup
        pixels.push({ x: 22, y: 16, color: '#4a5568' });
        pixels.push({ x: 20, y: 17, color: '#e53e3e' }); // mic
        break;

      case 'halo':
        this.rect(pixels, 10, 4, 12, 2, '#facc15');
        pixels.push({ x: 9, y: 5, color: '#facc15' });
        pixels.push({ x: 22, y: 5, color: '#facc15' });
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
