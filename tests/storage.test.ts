import { describe, it, expect, afterEach } from 'vitest';
import { ConfigStorage } from '../src/packages/storage';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('ConfigStorage', () => {
  const tempDir = path.join(os.tmpdir(), `codepet-test-${Date.now()}`);

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should initialize default config and persist changes', () => {
    const storage = new ConfigStorage(tempDir);
    const config = storage.getConfig();

    expect(config.pet.species).toBe('cat');
    expect(config.onboardingCompleted).toBe(false);

    storage.updateConfig({
      onboardingCompleted: true,
      pet: { ...config.pet, species: 'robot', name: 'Robo' }
    });

    const reloaded = new ConfigStorage(tempDir);
    expect(reloaded.getConfig().onboardingCompleted).toBe(true);
    expect(reloaded.getConfig().pet.species).toBe('robot');
  });

  it('should save and load developer session statistics', () => {
    const storage = new ConfigStorage(tempDir);
    storage.saveSessionStats({
      sessionStartTime: 1000,
      activeCodingMs: 50000,
      lastActiveTime: 1200,
      promptsCompleted: 12,
      buildsCount: 5,
      buildsSuccess: 4,
      buildsFailed: 1,
      testsRun: 8,
      testsPassed: 8,
      testsFailed: 0,
      linesEdited: 350,
      petAffectionLevel: 85
    });

    const loaded = storage.loadSessionStats();
    expect(loaded?.promptsCompleted).toBe(12);
    expect(loaded?.buildsSuccess).toBe(4);
    expect(loaded?.petAffectionLevel).toBe(85);
  });
});
