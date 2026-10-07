import { SoundSettings } from '../shared/types';

export class ChiptuneSoundEngine {
  private ctx: AudioContext | null = null;
  private settings: SoundSettings;

  constructor(settings: SoundSettings) {
    this.settings = settings;
  }

  public updateSettings(newSettings: SoundSettings): void {
    this.settings = newSettings;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private isQuietHour(): boolean {
    if (!this.settings.muteDuringQuietHours) return false;
    const now = new Date();
    const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const start = this.settings.quietHoursStart;
    const end = this.settings.quietHoursEnd;

    if (start <= end) {
      return current >= start && current <= end;
    } else {
      // Overnight (e.g. 22:00 to 08:00)
      return current >= start || current <= end;
    }
  }

  public play(soundName: string): void {
    if (!this.settings.enabled || this.isQuietHour()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const masterVol = this.settings.masterVolume;
    if (masterVol <= 0) return;

    const eventVol = this.settings.perEventVolume[soundName] ?? 1.0;
    const finalVolume = masterVol * eventVol * 0.15; // Keep sounds comfortable & subtle

    switch (soundName) {
      case 'happy':
        this.playHappy(ctx, finalVolume);
        break;
      case 'celebrate':
        this.playCelebration(ctx, finalVolume);
        break;
      case 'error':
        this.playError(ctx, finalVolume);
        break;
      case 'prompt_submit':
      case 'notification':
        this.playNotification(ctx, finalVolume);
        break;
      case 'typing':
        this.playTyping(ctx, finalVolume * 0.4);
        break;
      case 'sleep':
        this.playSleep(ctx, finalVolume * 0.6);
        break;
      case 'wake':
        this.playWake(ctx, finalVolume);
        break;
      case 'interact':
        this.playInteract(ctx, finalVolume);
        break;
      case 'purr':
        this.playPurr(ctx, finalVolume * 0.5);
        break;
    }
  }

  private playTone(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'square'
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = this.settings.soundPack === 'soft' ? 'sine' : type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playHappy(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    this.playTone(ctx, 523.25, now, 0.08, vol); // C5
    this.playTone(ctx, 659.25, now + 0.08, 0.08, vol); // E5
    this.playTone(ctx, 783.99, now + 0.16, 0.15, vol); // G5
  }

  private playCelebration(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    this.playTone(ctx, 440.0, now, 0.07, vol); // A4
    this.playTone(ctx, 554.37, now + 0.07, 0.07, vol); // C#5
    this.playTone(ctx, 659.25, now + 0.14, 0.07, vol); // E5
    this.playTone(ctx, 880.0, now + 0.21, 0.25, vol); // A5
  }

  private playError(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.2);

    gain.gain.setValueAtTime(vol * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  private playNotification(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    this.playTone(ctx, 880, now, 0.06, vol * 0.7, 'triangle');
    this.playTone(ctx, 1174.66, now + 0.06, 0.1, vol * 0.7, 'triangle');
  }

  private playTyping(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200 + Math.random() * 400, now);

    gain.gain.setValueAtTime(vol * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  private playSleep(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    this.playTone(ctx, 392.0, now, 0.2, vol * 0.5, 'sine'); // G4
    this.playTone(ctx, 329.63, now + 0.22, 0.3, vol * 0.4, 'sine'); // E4
  }

  private playWake(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    this.playTone(ctx, 440.0, now, 0.08, vol * 0.7, 'triangle');
    this.playTone(ctx, 659.25, now + 0.08, 0.12, vol * 0.7, 'triangle');
  }

  private playInteract(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);

    gain.gain.setValueAtTime(vol * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  private playPurr(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(65, now);

    lfo.frequency.setValueAtTime(15, now); // 15 Hz purr vibrato
    lfoGain.gain.setValueAtTime(15, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(vol * 0.5, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.4);
    osc.stop(now + 0.4);
  }
}
