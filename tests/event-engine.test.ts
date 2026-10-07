import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PriorityEventQueue, EventBus } from '../src/packages/event-engine';
import { NormalizedCodingEvent } from '../src/packages/shared/types';

describe('PriorityEventQueue', () => {
  it('should process higher priority events before lower priority events', async () => {
    const queue = new PriorityEventQueue({ minIntervalMs: 10, debounceWindowMs: 10 });
    const dispatched: string[] = [];

    queue.setDispatchHandler((event: NormalizedCodingEvent) => {
      dispatched.push(event.type);
    });

    queue.enqueue({
      id: '1',
      type: 'PROMPT_TYPED',
      tool: 'claude-code',
      timestamp: Date.now(),
      priority: 25
    });

    queue.enqueue({
      id: '2',
      type: 'BUILD_FAILED',
      tool: 'claude-code',
      timestamp: Date.now(),
      priority: 90
    });

    queue.enqueue({
      id: '3',
      type: 'BUILD_SUCCESS',
      tool: 'claude-code',
      timestamp: Date.now(),
      priority: 80
    });

    // Wait for queue dispatch
    await new Promise(resolve => setTimeout(resolve, 80));

    expect(dispatched[0]).toBe('BUILD_FAILED');
    expect(dispatched[1]).toBe('BUILD_SUCCESS');
  });

  it('should debounce rapid continuous typing events', async () => {
    const queue = new PriorityEventQueue({ minIntervalMs: 10, debounceWindowMs: 30 });
    const dispatched: string[] = [];

    queue.setDispatchHandler((event: NormalizedCodingEvent) => {
      dispatched.push(event.id);
    });

    queue.enqueue({ id: 'type_1', type: 'PROMPT_TYPED', tool: 'cursor', timestamp: Date.now(), priority: 25 });
    queue.enqueue({ id: 'type_2', type: 'PROMPT_TYPED', tool: 'cursor', timestamp: Date.now(), priority: 25 });
    queue.enqueue({ id: 'type_3', type: 'PROMPT_TYPED', tool: 'cursor', timestamp: Date.now(), priority: 25 });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Only the final debounced typing event should be processed
    expect(dispatched.length).toBe(1);
    expect(dispatched[0]).toBe('type_3');
  });
});

describe('EventBus', () => {
  it('should subscribe and receive emitted events', async () => {
    const bus = new EventBus();
    const received: string[] = [];

    bus.on('BUILD_SUCCESS', (e) => {
      received.push(e.type);
    });

    bus.emit({
      type: 'BUILD_SUCCESS',
      tool: 'claude-code',
      message: 'Clean build'
    });

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(received).toContain('BUILD_SUCCESS');
  });
});
