import {
  CodingEventType,
  NormalizedCodingEvent,
  PetAnimationState,
  PetMood,
  PetReaction,
  PetSpecies,
  DeveloperSessionStats,
  CodePetConfig
} from '../shared/types';
import { SPEECH_LINES } from '../shared/constants';

export class MoodEngine {
  private currentMood: PetMood = 'Happy';
  private consecutiveFailures: number = 0;
  private consecutiveSuccesses: number = 0;
  private lastActivityTimestamp: number = Date.now();
  private sessionStartTimestamp: number = Date.now();
  private affectionScore: number = 50;

  constructor(initialMood: PetMood = 'Happy') {
    this.currentMood = initialMood;
  }

  public getMood(): PetMood {
    return this.currentMood;
  }

  public getAffection(): number {
    return this.affectionScore;
  }

  public adjustAffection(delta: number): void {
    this.affectionScore = Math.max(0, Math.min(100, this.affectionScore + delta));
  }

  public processEvent(event: NormalizedCodingEvent): PetMood {
    this.lastActivityTimestamp = Date.now();

    switch (event.type) {
      case 'BUILD_FAILED':
      case 'TEST_FAILED':
      case 'ERROR_DETECTED':
        this.consecutiveSuccesses = 0;
        this.consecutiveFailures++;
        if (this.consecutiveFailures === 1) {
          this.currentMood = 'Confused';
        } else if (this.consecutiveFailures === 2) {
          this.currentMood = 'Sad';
        } else {
          this.currentMood = 'Angry';
        }
        break;

      case 'BUILD_SUCCESS':
      case 'TEST_PASSED':
        this.consecutiveFailures = 0;
        this.consecutiveSuccesses++;
        if (this.consecutiveSuccesses >= 3) {
          this.currentMood = 'Celebrating';
        } else if (this.consecutiveSuccesses >= 1) {
          this.currentMood = 'Excited';
        } else {
          this.currentMood = 'Happy';
        }
        this.adjustAffection(3);
        break;

      case 'THINKING':
        this.currentMood = 'Thinking';
        break;

      case 'GENERATING':
      case 'PROMPT_SUBMITTED':
        this.currentMood = 'Curious';
        break;

      case 'CODE_EDITED':
      case 'PROMPT_TYPED':
      case 'COMMAND_RUNNING':
        this.currentMood = 'Focused';
        break;

      case 'MANUAL_INTERACTION':
        this.currentMood = 'Happy';
        this.adjustAffection(5);
        break;

      case 'TOOL_IDLE':
        this.checkIdleMood();
        break;
    }

    return this.currentMood;
  }

  public checkIdleMood(): PetMood {
    const idleMs = Date.now() - this.lastActivityTimestamp;
    const idleMinutes = idleMs / (1000 * 60);

    const sessionMinutes = (Date.now() - this.sessionStartTimestamp) / (1000 * 60);

    if (sessionMinutes > 120 && idleMinutes > 5) {
      this.currentMood = 'Tired';
    } else if (idleMinutes >= 15) {
      this.currentMood = 'Sleepy';
    } else if (idleMinutes >= 5) {
      this.currentMood = 'Bored';
    }

    return this.currentMood;
  }

  public setMood(mood: PetMood): void {
    this.currentMood = mood;
  }

  public resetStreak(): void {
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
  }
}

export class PetStateMachine {
  private currentState: PetAnimationState = 'IDLE';
  private previousState: PetAnimationState = 'IDLE';
  private moodEngine: MoodEngine;
  private reactionTimeout?: NodeJS.Timeout;
  private idleCheckInterval?: NodeJS.Timeout;
  private config: CodePetConfig;
  private sessionStats: DeveloperSessionStats;
  private onStateChangeCallback?: (reaction: PetReaction) => void;

  constructor(config: CodePetConfig) {
    this.config = config;
    this.moodEngine = new MoodEngine('Happy');
    this.sessionStats = {
      sessionStartTime: Date.now(),
      activeCodingMs: 0,
      lastActiveTime: Date.now(),
      promptsCompleted: 0,
      buildsCount: 0,
      buildsSuccess: 0,
      buildsFailed: 0,
      testsRun: 0,
      testsPassed: 0,
      testsFailed: 0,
      linesEdited: 0,
      petAffectionLevel: 60
    };

    this.startIdleMonitoring();
  }

  public updateConfig(newConfig: CodePetConfig): void {
    this.config = newConfig;
  }

  public setStateChangeHandler(callback: (reaction: PetReaction) => void): void {
    this.onStateChangeCallback = callback;
  }

  public getCurrentState(): PetAnimationState {
    return this.currentState;
  }

  public getCurrentMood(): PetMood {
    return this.moodEngine.getMood();
  }

  public getSessionStats(): DeveloperSessionStats {
    return {
      ...this.sessionStats,
      petAffectionLevel: this.moodEngine.getAffection()
    };
  }

  public handleCodingEvent(event: NormalizedCodingEvent): PetReaction {
    const mood = this.moodEngine.processEvent(event);
    this.updateStatsFromEvent(event);

    let nextState: PetAnimationState = 'IDLE';
    let durationMs = 3000;
    let particle: PetReaction['particle'] = undefined;
    let sound: string | undefined = undefined;

    switch (event.type) {
      case 'BUILD_SUCCESS':
        nextState = 'CELEBRATING';
        durationMs = 4000;
        particle = 'sparkles';
        sound = 'celebrate';
        break;

      case 'BUILD_FAILED':
        nextState = 'ERROR';
        durationMs = 4500;
        particle = 'sweat';
        sound = 'error';
        break;

      case 'TEST_PASSED':
        nextState = 'EXCITED';
        durationMs = 3500;
        particle = 'stars';
        sound = 'happy';
        break;

      case 'TEST_FAILED':
        nextState = 'SAD';
        durationMs = 4000;
        particle = 'sweat';
        sound = 'error';
        break;

      case 'ERROR_DETECTED':
        nextState = 'CONFUSED';
        durationMs = 4000;
        particle = 'exclamation';
        sound = 'error';
        break;

      case 'THINKING':
        nextState = 'THINKING';
        durationMs = 3000;
        particle = 'sparkles';
        sound = 'prompt_submit';
        break;

      case 'GENERATING':
        nextState = 'CODING';
        durationMs = 3500;
        sound = 'typing';
        break;

      case 'PROMPT_SUBMITTED':
        nextState = 'EXCITED';
        durationMs = 2500;
        sound = 'prompt_submit';
        break;

      case 'PROMPT_TYPED':
      case 'CODE_EDITED':
        nextState = 'CODING';
        durationMs = 2000;
        break;

      case 'MANUAL_INTERACTION':
        nextState = 'PLAYING';
        durationMs = 3000;
        particle = 'hearts';
        sound = 'interact';
        break;

      case 'TOOL_IDLE':
      default:
        const idleMood = this.moodEngine.getMood();
        if (idleMood === 'Sleepy') {
          nextState = 'SLEEPING';
          particle = 'zzz';
        } else if (idleMood === 'Tired') {
          nextState = 'TIRED';
        } else {
          nextState = 'IDLE';
        }
        durationMs = 0;
        break;
    }

    const speech = this.pickSpeechLine(nextState);

    const reaction: PetReaction = {
      state: nextState,
      mood,
      durationMs,
      speech: this.config.behavior.speechBubblesEnabled ? speech : undefined,
      sound,
      particle
    };

    this.applyStateReaction(reaction);
    return reaction;
  }

  public triggerManualInteraction(type: 'click' | 'double-click' | 'feed' | 'pet' | 'play' | 'dance' | 'sleep' | 'wake'): PetReaction {
    this.moodEngine.adjustAffection(5);
    let state: PetAnimationState = 'PLAYING';
    let mood: PetMood = 'Happy';
    let duration = 3000;
    let particle: PetReaction['particle'] = 'hearts';
    let sound = 'interact';
    let customSpeech: string = 'purr! ✨';

    switch (type) {
      case 'feed':
        state = 'HAPPY';
        customSpeech = 'yum! snack recharged 🐟';
        sound = 'happy';
        break;
      case 'pet':
        state = 'PLAYING';
        particle = 'hearts';
        customSpeech = 'purrrrr ❤️';
        sound = 'purr';
        break;
      case 'dance':
        state = 'CELEBRATING';
        particle = 'confetti';
        customSpeech = 'party time! 💃';
        sound = 'celebrate';
        duration = 4000;
        break;
      case 'sleep':
        state = 'SLEEPING';
        particle = 'zzz';
        mood = 'Sleepy';
        customSpeech = 'taking a quick catnap... 💤';
        sound = 'sleep';
        duration = 8000;
        break;
      case 'wake':
        state = 'EXCITED';
        particle = 'sparkles';
        mood = 'Excited';
        customSpeech = 'wide awake & ready! ⚡';
        sound = 'wake';
        break;
      case 'double-click':
        state = Math.random() > 0.5 ? 'PLAYING' : 'CELEBRATING';
        particle = 'sparkles';
        customSpeech = 'whoopee! ✨';
        sound = 'happy';
        break;
      case 'click':
      default:
        state = 'HAPPY';
        customSpeech = 'hello dev! 👋';
        sound = 'interact';
        duration = 2000;
        break;
    }

    const reaction: PetReaction = {
      state,
      mood,
      durationMs: duration,
      speech: this.config.behavior.speechBubblesEnabled ? customSpeech : undefined,
      sound,
      particle
    };

    this.applyStateReaction(reaction);
    return reaction;
  }

  private applyStateReaction(reaction: PetReaction): void {
    if (this.reactionTimeout) {
      clearTimeout(this.reactionTimeout);
      this.reactionTimeout = undefined;
    }

    this.previousState = this.currentState;
    this.currentState = reaction.state;

    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(reaction);
    }

    // If temporary reaction, schedule return to IDLE or background state
    if (reaction.durationMs > 0 && reaction.state !== 'SLEEPING') {
      this.reactionTimeout = setTimeout(() => {
        this.currentState = 'IDLE';
        if (this.onStateChangeCallback) {
          this.onStateChangeCallback({
            state: 'IDLE',
            mood: this.moodEngine.getMood(),
            durationMs: 0
          });
        }
      }, reaction.durationMs);
    }
  }

  private pickSpeechLine(state: PetAnimationState): string | undefined {
    // 30% chance to remain silent during micro-actions unless celebrated or errored
    const alwaysSpeak = ['CELEBRATING', 'BUILD_FAILED', 'ERROR', 'TEST_FAILED'];
    if (!alwaysSpeak.includes(state) && Math.random() < 0.35) {
      return undefined;
    }

    const lines = (SPEECH_LINES as Record<string, string[]>)[state] || SPEECH_LINES.IDLE;
    if (!lines || lines.length === 0) return undefined;

    // Pick random line
    const randomIndex = Math.floor(Math.random() * lines.length);
    return lines[randomIndex];
  }

  private updateStatsFromEvent(event: NormalizedCodingEvent): void {
    const now = Date.now();
    const timeDelta = Math.min(now - this.sessionStats.lastActiveTime, 60000); // Max 1 min delta
    this.sessionStats.activeCodingMs += timeDelta;
    this.sessionStats.lastActiveTime = now;

    if (event.type === 'BUILD_STARTED') {
      this.sessionStats.buildsCount++;
    } else if (event.type === 'BUILD_SUCCESS') {
      this.sessionStats.buildsSuccess++;
    } else if (event.type === 'BUILD_FAILED') {
      this.sessionStats.buildsFailed++;
    } else if (event.type === 'TEST_STARTED') {
      this.sessionStats.testsRun++;
    } else if (event.type === 'TEST_PASSED') {
      this.sessionStats.testsPassed++;
    } else if (event.type === 'TEST_FAILED') {
      this.sessionStats.testsFailed++;
    } else if (event.type === 'PROMPT_SUBMITTED' || event.type === 'CODE_GENERATED') {
      this.sessionStats.promptsCompleted++;
    } else if (event.type === 'CODE_EDITED') {
      this.sessionStats.linesEdited += 5;
    }
  }

  private startIdleMonitoring(): void {
    this.idleCheckInterval = setInterval(() => {
      const idleMood = this.moodEngine.checkIdleMood();
      if (idleMood === 'Sleepy' && this.currentState !== 'SLEEPING') {
        this.applyStateReaction({
          state: 'SLEEPING',
          mood: 'Sleepy',
          durationMs: 0,
          particle: 'zzz',
          speech: 'zzz...'
        });
      } else if (idleMood === 'Bored' && this.currentState === 'IDLE' && Math.random() < 0.2) {
        // Trigger a cute bored idle animation (e.g. stretch or look around)
        this.applyStateReaction({
          state: 'WALKING',
          mood: 'Bored',
          durationMs: 2000,
          speech: '*looks around*'
        });
      }
    }, 20000);
  }

  public dispose(): void {
    if (this.reactionTimeout) clearTimeout(this.reactionTimeout);
    if (this.idleCheckInterval) clearInterval(this.idleCheckInterval);
  }
}
