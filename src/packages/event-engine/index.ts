import { CodingEventType, NormalizedCodingEvent } from '../shared/types';
import { EVENT_PRIORITY_MAP } from '../shared/constants';

type EventListener = (event: NormalizedCodingEvent) => void;

export class PriorityEventQueue {
  private queue: NormalizedCodingEvent[] = [];
  private lastDispatchedTime: number = 0;
  private minDispatchIntervalMs: number = 350; // Throttle interval
  private debounceTimers: Map<CodingEventType, NodeJS.Timeout> = new Map();
  private debounceWindowMs: number = 200;
  private isProcessing: boolean = false;
  private onDispatchCallback?: (event: NormalizedCodingEvent) => void;

  constructor(options?: { minIntervalMs?: number; debounceWindowMs?: number }) {
    if (options?.minIntervalMs) this.minDispatchIntervalMs = options.minIntervalMs;
    if (options?.debounceWindowMs) this.debounceWindowMs = options.debounceWindowMs;
  }

  public setDispatchHandler(callback: (event: NormalizedCodingEvent) => void) {
    this.onDispatchCallback = callback;
  }

  public enqueue(event: NormalizedCodingEvent): void {
    // Debounce rapid continuous events like PROMPT_TYPED or CODE_EDITED
    const shouldDebounce = event.type === 'PROMPT_TYPED' || event.type === 'CODE_EDITED';

    if (shouldDebounce) {
      const existing = this.debounceTimers.get(event.type);
      if (existing) {
        clearTimeout(existing);
      }
      const timer = setTimeout(() => {
        this.debounceTimers.delete(event.type);
        this.insertSorted(event);
        this.processNext();
      }, this.debounceWindowMs);
      this.debounceTimers.set(event.type, timer);
      return;
    }

    this.insertSorted(event);
    this.processNext();
  }

  private insertSorted(event: NormalizedCodingEvent): void {
    // Insert into queue maintaining descending order of priority
    let inserted = false;
    for (let i = 0; i < this.queue.length; i++) {
      if (event.priority > this.queue[i].priority) {
        this.queue.splice(i, 0, event);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.queue.push(event);
    }

    // Cap queue length to prevent runaway memory
    if (this.queue.length > 50) {
      this.queue.pop();
    }
  }

  private processNext(): void {
    if (this.isProcessing || this.queue.length === 0) return;

    const now = Date.now();
    const timeSinceLast = now - this.lastDispatchedTime;

    if (timeSinceLast < this.minDispatchIntervalMs) {
      const delay = this.minDispatchIntervalMs - timeSinceLast;
      setTimeout(() => this.processNext(), delay);
      return;
    }

    const event = this.queue.shift();
    if (!event) return;

    this.lastDispatchedTime = Date.now();
    this.isProcessing = true;

    try {
      if (this.onDispatchCallback) {
        this.onDispatchCallback(event);
      }
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        setTimeout(() => this.processNext(), this.minDispatchIntervalMs);
      }
    }
  }

  public clear(): void {
    this.queue = [];
    this.debounceTimers.forEach(t => clearTimeout(t));
    this.debounceTimers.clear();
  }

  public size(): number {
    return this.queue.length;
  }
}

export class EventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private priorityQueue: PriorityEventQueue;
  private history: NormalizedCodingEvent[] = [];
  private maxHistory: number = 100;

  constructor() {
    this.priorityQueue = new PriorityEventQueue();
    this.priorityQueue.setDispatchHandler(event => {
      this.dispatchImmediate(event);
    });
  }

  public on(eventType: string, listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    return () => {
      this.off(eventType, listener);
    };
  }

  public off(eventType: string, listener: EventListener): void {
    const set = this.listeners.get(eventType);
    if (set) {
      set.delete(listener);
      if (set.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  public emit(rawEvent: Omit<NormalizedCodingEvent, 'id' | 'timestamp' | 'priority'> & { priority?: number; timestamp?: number }): void {
    const priority = rawEvent.priority ?? EVENT_PRIORITY_MAP[rawEvent.type] ?? 30;
    const event: NormalizedCodingEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: rawEvent.timestamp || Date.now(),
      priority,
      ...rawEvent
    };

    // Store in history
    this.history.unshift(event);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    // High priority events (like ERROR or BUILD_FAILED) preempt immediately if desired
    if (priority >= 90) {
      this.dispatchImmediate(event);
    } else {
      this.priorityQueue.enqueue(event);
    }
  }

  private dispatchImmediate(event: NormalizedCodingEvent): void {
    // Specific event listeners
    const specificListeners = this.listeners.get(event.type);
    if (specificListeners) {
      specificListeners.forEach(listener => {
        try {
          listener(event);
        } catch (err) {
          console.error(`Error in event listener for ${event.type}:`, err);
        }
      });
    }

    // Wildcard listeners ('*')
    const allListeners = this.listeners.get('*');
    if (allListeners) {
      allListeners.forEach(listener => {
        try {
          listener(event);
        } catch (err) {
          console.error(`Error in wildcard listener:`, err);
        }
      });
    }
  }

  public getHistory(): NormalizedCodingEvent[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history = [];
    this.priorityQueue.clear();
  }
}
