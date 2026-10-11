import { inject, Service, signal } from '@angular/core';
import { GameStorage } from './game-storage';

/** The three game sounds (R31, DS-021). Each one has a visible equivalent on the table. */
export type SoundCue = 'flip' | 'match' | 'win';

interface Tone {
  /** Note frequencies in Hz, played one after another. */
  readonly notes: readonly number[];
  /** Seconds between note starts. */
  readonly step: number;
  /** Seconds each note rings. */
  readonly length: number;
}

/**
 * Placeholder tones until the final sounds arrive (STEP-06): a short high flip, a rising
 * three-note match and a rising four-note win (DS-021).
 */
const TONES: Readonly<Record<SoundCue, Tone>> = {
  flip: { notes: [880], step: 0, length: 0.08 },
  match: { notes: [523.25, 659.25, 783.99], step: 0.1, length: 0.16 },
  win: { notes: [523.25, 659.25, 783.99, 1046.5], step: 0.12, length: 0.24 },
};

const PEAK_GAIN = 0.15;

/**
 * Plays cues through Web Audio. Every failure is swallowed: without audio the game
 * carries on unchanged. Tests replace this with a fake rather than relying on output.
 */
@Service()
export class TonePlayer {
  private context: AudioContext | null | undefined;

  play(cue: SoundCue): void {
    try {
      const context = this.audio();
      if (!context) {
        return;
      }
      if (context.state === 'suspended') {
        context.resume().catch(() => undefined);
      }
      const { notes, step, length } = TONES[cue];
      notes.forEach((frequency, i) => {
        const start = context.currentTime + i * step;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + length + 0.02);
      });
    } catch {
      // Audio is a bonus channel; never let it interrupt play.
    }
  }

  /** Created on the first cue, which follows a tap, so browsers allow it to start. */
  private audio(): AudioContext | null {
    if (this.context === undefined) {
      try {
        this.context = typeof AudioContext === 'function' ? new AudioContext() : null;
      } catch {
        this.context = null;
      }
    }
    return this.context;
  }
}

/**
 * Sound preference and cue requests (R31, DS-006, DS-021). The preference outlives the
 * game route and is kept on the device, so it survives route visits and reloads.
 */
@Service()
export class Sound {
  private readonly storage = inject(GameStorage);
  private readonly player = inject(TonePlayer);
  private readonly enabled = signal(this.storage.loadSound());

  readonly on = this.enabled.asReadonly();

  toggle(): void {
    const on = !this.enabled();
    this.enabled.set(on);
    this.storage.saveSound(on);
  }

  /** Requests a cue; nothing is requested while Sound is off. */
  play(cue: SoundCue): void {
    if (!this.enabled()) {
      return;
    }
    try {
      this.player.play(cue);
    } catch {
      // A failing player must not break the game.
    }
  }
}
