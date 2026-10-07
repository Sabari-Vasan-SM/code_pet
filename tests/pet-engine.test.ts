import { describe, it, expect, beforeEach } from 'vitest';
import { MoodEngine, PetStateMachine } from '../src/packages/pet-engine';
import { DEFAULT_CONFIG } from '../src/packages/shared/constants';

describe('MoodEngine', () => {
  let moodEngine: MoodEngine;

  beforeEach(() => {
    moodEngine = new MoodEngine('Happy');
  });

  it('should transition through Confused -> Sad -> Angry on consecutive build failures', () => {
    const dummyEvent = (type: any) => ({
      id: 'test',
      type,
      tool: 'claude-code',
      timestamp: Date.now(),
      priority: 90
    });

    expect(moodEngine.processEvent(dummyEvent('BUILD_FAILED'))).toBe('Confused');
    expect(moodEngine.processEvent(dummyEvent('BUILD_FAILED'))).toBe('Sad');
    expect(moodEngine.processEvent(dummyEvent('BUILD_FAILED'))).toBe('Angry');
  });

  it('should transition from Happy -> Excited -> Celebrating on consecutive build passes', () => {
    const dummyEvent = (type: any) => ({
      id: 'test',
      type,
      tool: 'claude-code',
      timestamp: Date.now(),
      priority: 80
    });

    expect(moodEngine.processEvent(dummyEvent('BUILD_SUCCESS'))).toBe('Excited');
    expect(moodEngine.processEvent(dummyEvent('BUILD_SUCCESS'))).toBe('Excited');
    expect(moodEngine.processEvent(dummyEvent('BUILD_SUCCESS'))).toBe('Celebrating');
  });
});

describe('PetStateMachine', () => {
  it('should trigger CELEBRATING state on build success', () => {
    const machine = new PetStateMachine(DEFAULT_CONFIG);
    const reaction = machine.handleCodingEvent({
      id: '1',
      type: 'BUILD_SUCCESS',
      tool: 'claude-code',
      timestamp: Date.now(),
      priority: 80
    });

    expect(reaction.state).toBe('CELEBRATING');
    expect(reaction.particle).toBe('sparkles');
    expect(reaction.sound).toBe('celebrate');
    machine.dispose();
  });

  it('should handle manual pet interaction with affection increase', () => {
    const machine = new PetStateMachine(DEFAULT_CONFIG);
    const initialAffection = machine.getSessionStats().petAffectionLevel;
    const reaction = machine.triggerManualInteraction('pet');

    expect(reaction.state).toBe('PLAYING');
    expect(reaction.particle).toBe('hearts');
    expect(machine.getSessionStats().petAffectionLevel).toBeGreaterThan(initialAffection);
    machine.dispose();
  });
});
