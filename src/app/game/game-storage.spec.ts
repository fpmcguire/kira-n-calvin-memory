import { TestBed } from '@angular/core/testing';
import { MemoryStorage } from '../../testing/memory-storage';
import { GameOptions } from '../domain/types';
import { DEVICE_STORAGE, GameStorage, STORAGE_KEYS } from './game-storage';

const OPTIONS: GameOptions = {
  players: ['calvin', 'kira'],
  variants: true,
  fill: false,
  fillCount: 4,
  themes: ['dance', 'drones'],
};

function setup(storage: Storage | null = new MemoryStorage()) {
  TestBed.configureTestingModule({ providers: [{ provide: DEVICE_STORAGE, useValue: storage }] });
  return TestBed.inject(GameStorage);
}

/** Storage that refuses every call, like a blocked or full browser store. */
class FailingStorage extends MemoryStorage {
  override getItem(): string | null {
    throw new DOMException('blocked', 'SecurityError');
  }
  override setItem(): void {
    throw new DOMException('full', 'QuotaExceededError');
  }
}

describe('GameStorage', () => {
  it('gets fresh in-memory storage in every unit test, never the real localStorage', () => {
    const device = TestBed.inject(DEVICE_STORAGE);
    expect(device).toBeInstanceOf(MemoryStorage);
    expect(device?.length).toBe(0);
  });

  it('has nothing to restore on a first visit (AC1)', () => {
    const storage = setup();
    expect(storage.loadOptions()).toBeNull();
    expect(storage.bestScore('kira', OPTIONS)).toBeNull();
    expect(storage.loadSound()).toBe(true);
  });

  it('saves options under a versioned key with players as child IDs (AC2, AC7)', () => {
    const device = new MemoryStorage();
    setup(device).saveOptions({ ...OPTIONS, first: 'calvin' } as GameOptions);
    const saved = JSON.parse(device.getItem(STORAGE_KEYS.options) ?? 'null');
    expect(STORAGE_KEYS.options).toMatch(/\.v1\./);
    expect(saved).toEqual(OPTIONS);
    expect(saved).not.toHaveProperty('first');
    expect(saved).not.toHaveProperty('twoPlayers');
  });

  it('restores saved options in a later visit', () => {
    const device = new MemoryStorage();
    setup(device).saveOptions(OPTIONS);
    TestBed.resetTestingModule();
    expect(setup(device).loadOptions()).toEqual(OPTIONS);
  });

  it.each([
    ['malformed JSON', '{players:'],
    ['an unknown theme', JSON.stringify({ ...OPTIONS, themes: ['surfing'] })],
    ['an unknown player', JSON.stringify({ ...OPTIONS, players: ['zoe'] })],
    ['an impossible fill count', JSON.stringify({ ...OPTIONS, fill: true, fillCount: 3 })],
    ['empty players', JSON.stringify({ ...OPTIONS, players: [] })],
    ['empty themes', JSON.stringify({ ...OPTIONS, themes: [] })],
    [
      'the retired Two players option',
      JSON.stringify({ ...OPTIONS, players: undefined, twoPlayers: true }),
    ],
  ])('falls back from %s without throwing (AC3)', (_name, raw) => {
    const storage = setup(new MemoryStorage({ [STORAGE_KEYS.options]: raw }));
    expect(storage.loadOptions()).toBeNull();
  });

  it('ignores data stored under another schema version', () => {
    const old = new MemoryStorage({ 'knc-memory.v0.options': JSON.stringify(OPTIONS) });
    expect(setup(old).loadOptions()).toBeNull();
  });

  it('records a first best and replaces it only with fewer attempts (AC8, AC9)', () => {
    const storage = setup();
    expect(storage.recordBest('kira', OPTIONS, { attempts: 6, timeMs: 30_000 })).toEqual({
      kind: 'new',
      best: { attempts: 6, timeMs: 30_000 },
    });
    expect(storage.recordBest('kira', OPTIONS, { attempts: 6, timeMs: 1_000 })).toEqual({
      kind: 'kept',
      best: { attempts: 6, timeMs: 30_000 },
    });
    expect(storage.recordBest('kira', OPTIONS, { attempts: 9, timeMs: 1_000 }).kind).toBe('kept');
    expect(storage.recordBest('kira', OPTIONS, { attempts: 4, timeMs: 50_000 }).kind).toBe('new');
    expect(storage.bestScore('kira', OPTIONS)).toEqual({ attempts: 4, timeMs: 50_000 });
  });

  it('keeps bests per player and per board (AC10, AC11)', () => {
    const storage = setup();
    const plain = { ...OPTIONS, variants: false };
    const filled = { ...OPTIONS, fill: true, fillCount: 16 };
    storage.recordBest('kira', OPTIONS, { attempts: 4, timeMs: 0 });
    storage.recordBest('calvin', OPTIONS, { attempts: 7, timeMs: 0 });
    storage.recordBest('kira', plain, { attempts: 9, timeMs: 0 });
    storage.recordBest('kira', filled, { attempts: 11, timeMs: 0 });

    expect(storage.bestScore('kira', OPTIONS)?.attempts).toBe(4);
    expect(storage.bestScore('calvin', OPTIONS)?.attempts).toBe(7);
    expect(storage.bestScore('kira', plain)?.attempts).toBe(9);
    expect(storage.bestScore('kira', filled)?.attempts).toBe(11);
  });

  it('starts a fresh best table when the stored one is malformed', () => {
    const storage = setup(new MemoryStorage({ [STORAGE_KEYS.best]: '[1,2' }));
    expect(storage.bestScore('kira', OPTIONS)).toBeNull();
    expect(storage.recordBest('kira', OPTIONS, { attempts: 5, timeMs: 0 }).kind).toBe('new');
  });

  it('persists the sound preference', () => {
    const device = new MemoryStorage();
    setup(device).saveSound(false);
    TestBed.resetTestingModule();
    expect(setup(device).loadSound()).toBe(false);
  });

  for (const [name, device] of [
    ['unavailable', null],
    ['failing', new FailingStorage()],
  ] as const) {
    it(`keeps working in memory when storage is ${name}`, () => {
      const storage = setup(device);
      expect(storage.loadOptions()).toBeNull();
      expect(() => storage.saveOptions(OPTIONS)).not.toThrow();
      expect(storage.loadOptions()).toEqual(OPTIONS);
      expect(storage.recordBest('kira', OPTIONS, { attempts: 5, timeMs: 0 }).kind).toBe('new');
      expect(storage.recordBest('kira', OPTIONS, { attempts: 6, timeMs: 0 }).kind).toBe('kept');
      storage.saveSound(false);
      expect(storage.loadSound()).toBe(false);
    });
  }
});
