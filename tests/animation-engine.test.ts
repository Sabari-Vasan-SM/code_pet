import { describe, it, expect } from 'vitest';
import { PixelSpriteEngine } from '../src/packages/animation-engine';
import { PetSpecies, PetAnimationState } from '../src/packages/shared/types';

describe('PixelSpriteEngine', () => {
  const engine = new PixelSpriteEngine();

  const speciesList: PetSpecies[] = [
    'cat',
    'dog',
    'fox',
    'dino',
    'parrot',
    'snake',
    'penguin',
    'robot',
    'ghost',
    'custom'
  ];
  const states: PetAnimationState[] = ['IDLE', 'WALKING', 'SLEEPING', 'CODING', 'CELEBRATING', 'ERROR'];

  speciesList.forEach(species => {
    it(`should generate 32-bit pixel frames for species "${species}"`, () => {
      const frame = engine.getFrame(species, 'IDLE', 0, 'default', 'none');
      expect(frame.width).toBe(32);
      expect(frame.height).toBe(32);
      expect(frame.pixels.length).toBeGreaterThan(25);
    });
  });

  states.forEach(state => {
    it(`should render state "${state}" on 32x32 grid without errors`, () => {
      const frame = engine.getFrame('cat', state, 1, 'cyberpunk', 'wizard-hat');
      expect(frame.pixels.length).toBeGreaterThan(0);
      frame.pixels.forEach(p => {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThan(32);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThan(32);
      });
    });
  });
});
