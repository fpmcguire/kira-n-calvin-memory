import { TestBed } from '@angular/core/testing';
import { MemoryStorage } from '../../testing/memory-storage';
import { DEVICE_STORAGE, STORAGE_KEYS } from './game-storage';
import { Sound, SoundCue, TonePlayer } from './sound';

function setup(device = new MemoryStorage(), play: (cue: SoundCue) => void = vi.fn()) {
  TestBed.configureTestingModule({
    providers: [
      { provide: DEVICE_STORAGE, useValue: device },
      { provide: TonePlayer, useValue: { play } },
    ],
  });
  return { sound: TestBed.inject(Sound), play };
}

describe('Sound', () => {
  it('is on by default and requests each cue (R31, AC14)', () => {
    const { sound, play } = setup();
    expect(sound.on()).toBe(true);
    sound.play('flip');
    sound.play('match');
    sound.play('win');
    expect(vi.mocked(play).mock.calls).toEqual([['flip'], ['match'], ['win']]);
  });

  it('requests nothing while off (AC14)', () => {
    const { sound, play } = setup();
    sound.toggle();
    expect(sound.on()).toBe(false);
    sound.play('flip');
    sound.play('win');
    expect(play).not.toHaveBeenCalled();
  });

  it('keeps the preference on the device across visits (AC13)', () => {
    const device = new MemoryStorage();
    setup(device).sound.toggle();
    expect(device.getItem(STORAGE_KEYS.sound)).toBe('false');
    TestBed.resetTestingModule();
    expect(setup(device).sound.on()).toBe(false);
  });

  it('swallows a failing player (AC15)', () => {
    const { sound } = setup(new MemoryStorage(), () => {
      throw new Error('no audio');
    });
    expect(() => sound.play('match')).not.toThrow();
  });
});

describe('TonePlayer', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('does nothing where Web Audio is unavailable (AC15)', () => {
    vi.stubGlobal('AudioContext', undefined);
    expect(() => new TonePlayer().play('win')).not.toThrow();
  });

  it('does nothing when the audio context cannot start (AC15)', () => {
    vi.stubGlobal(
      'AudioContext',
      class {
        constructor() {
          throw new Error('blocked');
        }
      },
    );
    const player = new TonePlayer();
    expect(() => player.play('flip')).not.toThrow();
    expect(() => player.play('match')).not.toThrow();
  });

  it('schedules one note for flip, three for match and four for win (DS-021)', () => {
    const started: number[] = [];
    const param = () => ({
      value: 0,
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    });
    const resume = vi.fn(() => Promise.resolve());
    vi.stubGlobal(
      'AudioContext',
      class {
        state = 'suspended';
        currentTime = 0;
        destination = {};
        resume = resume;
        createGain = () => ({ gain: param(), connect: (node: unknown) => node });
        createOscillator = () => ({
          type: '',
          frequency: param(),
          connect: (node: unknown) => node,
          start: (at: number) => started.push(at),
          stop: vi.fn(),
        });
      },
    );
    const player = new TonePlayer();
    player.play('flip');
    expect(started).toHaveLength(1);
    player.play('match');
    expect(started).toHaveLength(4);
    player.play('win');
    expect(started).toHaveLength(8);
    expect(resume).toHaveBeenCalled();
  });
});
