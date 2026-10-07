import { describe, it, expect } from 'vitest';
import { PixelSpriteEngine } from '../src/packages/animation-engine';
import { PetSpecies, PetAnimationState } from '../src/packages/shared/types';

describe('PixelSpriteEngine', () => {
  const engine = new PixelSpriteEngine();

  const speciesList: PetSpecies[] = ['cat', 'dog', 'fox', 'penguin', 'robot', 'ghost', 'custom'];
  const states: PetAnimationState[] = ['IDLE', 'WALKING', 'SLEEPING', 'CODING', 'CELEBRATING', 'ERROR'];

  speciesList.forEach(species => {
    it(`should generate valid pixel frames for species "${species}"`, () => {
      const frame = engine.getFrame(species, 'IDLE', 0, 'default', 'none');
      expect(frame.width).toBe(24);
      expect(frame.height).toBe(24);
      expect(frame.pixels.length).toBeGreaterThan(20);
    });
  });

  states.forEach(state => {
    it(`should render state "${state}" without errors`, () => {
      const frame = engine.getFrame('cat', state, 1, 'cyberpunk', 'wizard-hat');
      expect(frame.pixels.length).toBeGreaterThan(0);
      // Verify valid coordinates
      frame.pixels.forEach(p => {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThan(24);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThan(24);
      });
    });
  });
});
