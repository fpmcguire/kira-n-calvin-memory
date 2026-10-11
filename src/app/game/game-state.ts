import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { EDITION } from '../content/edition';
import { FEATURE_FLAGS } from '../config/feature-flags';
import { BestOutcome } from '../domain/best-score';
import { showsBirthdaySplash } from '../domain/cutoff';
import { dealGame } from '../domain/deck';
import { faceCue } from '../domain/difference';
import { canGo, cardCount, defaultOptions } from '../domain/options';
import {
  canFlip,
  canShowAll,
  flipCard,
  gameResult,
  isComplete,
  isInProgress,
  PlayRecord,
  resolveMatch,
  resolveMismatch,
  startPlay,
  turnOutcome,
  useShowAll,
} from '../domain/play';
import { assignPlayers } from '../domain/players';
import { RandomSource } from '../domain/random';
import { ChildId, Deal, FaceId, GameOptions, PlayerAssignment } from '../domain/types';
import { BoardCard } from './board/board';
import { FacePresentation, presentFace } from './card-face/face-presentation';
import { Clock } from './clock';
import { formatElapsed } from './format-elapsed';
import { GameStorage } from './game-storage';
import { RevealOutcome } from './pair-reveal/pair-reveal';
import { Random } from './random';
import { Sound } from './sound';
import { END_DELAY_MS, FLIP_MS, MATCH_PAUSE_MS, SHOW_ALL_MS, TICK_MS } from './timings';
import { TimerBag } from './timers';

export interface PlayerBlock {
  readonly id: ChildId;
  readonly name: string;
  readonly active: boolean;
  readonly attempts: number;
  readonly pairs: number;
}

/**
 * What the live game is doing between selections. Anything but `idle` locks input, so
 * cards, Show All, Restart and New Game cannot create overlapping transitions (R18).
 */
export type TurnPhase =
  | 'idle'
  /** Second card is turning over; the reveal opens after the flip delay. */
  | 'flipping'
  | 'reveal-match'
  | 'reveal-mismatch'
  /** Show All is showing every remaining card. */
  | 'peek'
  /** Last pair matched; the end screen follows. */
  | 'finishing';

/** Which action raised "Start over?" and so where the secondary button leads (DS-018). */
export type StartOverKind = 'restart' | 'go';

/**
 * Top-level signal state for the game route: splash, options overlay, draft and the
 * live game. Provided per game route visit so it never leaks into the greeting route.
 * Rules live in `src/app/domain/`; this class feeds them the edition, clock and random
 * source and owns the timed transitions, which it cancels with each new game (OBS-010).
 */
@Service({ autoProvided: false })
export class GameState {
  private readonly edition = inject(EDITION);
  private readonly random = inject(Random);
  private readonly clock = inject(Clock);
  private readonly storage = inject(GameStorage);
  private readonly sound = inject(Sound);
  private readonly timers = new TimerBag();
  private ticker: ReturnType<typeof setInterval> | undefined;

  /**
   * Birthday or generic splash, from the permanent birthday flag or the cutoff (R2, R38).
   * Evaluated once on entry so the splash never changes while it is showing.
   */
  readonly birthdaySplash = showsBirthdaySplash(
    this.clock.now(),
    this.edition.cutoff,
    FEATURE_FLAGS.permanentBirthday,
  );

  private readonly children = this.edition.children.map((child) => child.id);
  private readonly randomSource: RandomSource = () => this.random.next();

  readonly splashVisible = signal(true);
  readonly popupOpen = signal(false);
  /** Options applied by Go; null until the first Go. */
  readonly applied = signal<GameOptions | null>(null);
  /**
   * Unsaved popup selections, applied only by Go (R37). First open restores the last-used
   * options when valid (R36, DS-024), else checks the first child (Kira) alone (R4).
   */
  readonly draft = signal(
    this.storage.loadOptions() ??
      defaultOptions(
        this.edition.themes.map((theme) => theme.id),
        this.children.slice(0, 1),
      ),
  );

  /** Dealt deck and per-theme difference types; null until the first Go. */
  readonly deal = signal<Deal | null>(null);
  /** Rolled on each Go and Restart (R4, DS-020); the draft's players until the first Go. */
  readonly assignment = signal<PlayerAssignment>(this.assign(this.draft().players));

  /** The live game record; null until the first Go. Preserved under the options popup (R37). */
  readonly play = signal<PlayRecord | null>(null);
  readonly phase = signal<TurnPhase>('idle');
  /** The end screen has been reached; the completed game stays on the table behind it. */
  readonly ended = signal(false);
  readonly confirm = signal<StartOverKind | null>(null);
  /** Single-player best on this board once the game has ended; null in two-player (DS-016). */
  readonly best = signal<BestOutcome | null>(null);
  /** Sound preference, owned by the `Sound` service so it outlives this route (R31, DS-006). */
  readonly soundOn = this.sound.on;

  // Single-player timer: running from the deal, paused under the popup, frozen at the end.
  private readonly startedAt = signal(0);
  private readonly pausedAt = signal<number | null>(null);
  private readonly endedAt = signal<number | null>(null);
  private readonly tickNow = signal(this.clock.now().getTime());

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.timers.clear();
      this.stopTicker();
    });
  }

  /** The popup has a Close button only when there is a game to return to (DS-010). */
  readonly closable = computed(() => this.applied() !== null);

  /** Face-down preview count: draft on first open, the dealt deck afterwards (DS-007). */
  readonly previewCount = computed(
    () => this.deal()?.cards.length ?? cardCount(this.applied() ?? this.draft()),
  );

  readonly locked = computed(() => this.phase() !== 'idle');

  /** A card flipped or Show All used, and not yet ended (R25). */
  readonly inProgress = computed(() => {
    const record = this.play();
    return record !== null && !this.ended() && isInProgress(record);
  });

  readonly players = computed<readonly PlayerBlock[]>(() => {
    const { mode, players, first } = this.assignment();
    const record = this.play();
    const live = record !== null && !this.ended();
    return players.map((id) => ({
      id,
      name: this.edition.children.find((child) => child.id === id)?.name ?? id,
      active: mode === 'two' && (record ? live && record.current === id : id === first),
      attempts: record?.scores[id].attempts ?? 0,
      pairs: record?.scores[id].pairs ?? 0,
    }));
  });

  readonly timerText = computed(() => {
    const end = this.endedAt() ?? this.pausedAt() ?? this.tickNow();
    return formatElapsed(end - this.startedAt());
  });
  readonly timerState = computed<'running' | 'paused' | 'ended'>(() => {
    if (this.endedAt() !== null) {
      return 'ended';
    }
    return this.pausedAt() === null ? 'running' : 'paused';
  });

  readonly cardViews = computed<readonly BoardCard[]>(() => {
    const record = this.play();
    const deal = this.deal();
    const options = this.applied();
    if (!record || !deal || !options) {
      return [];
    }
    const peeking = this.phase() === 'peek';
    return record.cards.map((card, index) => {
      const face = this.present(card.faceId, deal, options);
      const stored = record.states[index];
      const state =
        stored === 'gone' ? 'gone' : stored === 'up' ? 'up' : peeking ? 'peeked' : 'down';
      return {
        id: card.id,
        state,
        face,
        label: state === 'down' || state === 'gone' ? `Card ${index + 1}, face down` : face.label,
      };
    });
  });

  /** The open reveal: the outcome and the two flipped faces, or null (DS-012). */
  readonly reveal = computed<{ outcome: RevealOutcome; faces: FacePresentation[] } | null>(() => {
    const phase = this.phase();
    const record = this.play();
    if (!record || (phase !== 'reveal-match' && phase !== 'reveal-mismatch')) {
      return null;
    }
    const views = this.cardViews();
    return {
      outcome: phase === 'reveal-match' ? 'match' : 'mismatch',
      faces: record.flipped.map((index) => views[index].face),
    };
  });

  readonly result = computed(() => {
    const record = this.play();
    return record && this.ended() ? gameResult(record) : null;
  });

  readonly showAllDisabled = computed(() => {
    const record = this.play();
    return !record || this.ended() || this.popupOpen() || this.locked() || !canShowAll(record);
  });
  readonly restartDisabled = computed(
    () => this.play() === null || this.popupOpen() || this.locked(),
  );
  readonly newGameDisabled = computed(() => this.popupOpen() || this.locked());

  dismissSplash(): void {
    this.splashVisible.set(false);
    this.popupOpen.set(true);
  }

  /** New Game opens the popup over the preserved game and never asks to start over (R24, R25). */
  openOptions(): void {
    if (this.popupOpen() || this.locked()) {
      return;
    }
    const applied = this.applied();
    if (applied) {
      this.draft.set(applied);
      // A completed game's timer is already frozen; a live one pauses until Close (R37, DS-004).
      if (this.play() && !this.ended()) {
        this.pausedAt.set(this.clock.now().getTime());
      }
    }
    this.popupOpen.set(true);
  }

  /** Close and Escape: discard the draft and return to the game unchanged (R37, DS-025). */
  closeOptions(): void {
    const applied = this.applied();
    if (!applied || !this.popupOpen()) {
      return;
    }
    this.draft.set(applied);
    this.resumeTimer();
    this.popupOpen.set(false);
  }

  /** Go: deals at once, or asks "Start over?" when the popup is over a game in progress (R25). */
  go(): void {
    const draft = this.draft();
    if (!canGo(draft)) {
      return;
    }
    if (this.popupOpen() && this.inProgress()) {
      this.confirm.set('go');
      return;
    }
    this.startFromDraft(draft);
  }

  /** Restart keeps the options and deals fresh; asks only for a game in progress (R23, R25). */
  restart(): void {
    const applied = this.applied();
    if (!applied || this.popupOpen() || this.locked()) {
      return;
    }
    if (this.inProgress()) {
      this.confirm.set('restart');
      return;
    }
    this.startGame(applied);
  }

  /** "Start over": Go deals with the draft options, Restart with the current ones. */
  confirmStartOver(): void {
    const kind = this.confirm();
    const applied = this.applied();
    this.confirm.set(null);
    if (kind === 'go') {
      this.startFromDraft(this.draft());
    } else if (kind === 'restart' && applied) {
      this.startGame(applied);
    }
  }

  /** "Keep playing" / "Back to options" / Escape: nothing changes (DS-018). */
  cancelStartOver(): void {
    this.confirm.set(null);
  }

  toggleSound(): void {
    this.sound.toggle();
  }

  /** A card was tapped or activated. Ignored unless it counts as a selection (R18). */
  selectCard(index: number): void {
    const record = this.play();
    if (!record || this.ended() || this.locked() || this.popupOpen() || !canFlip(record, index)) {
      return;
    }
    const next = flipCard(record, index);
    this.play.set(next);
    this.sound.play('flip');
    if (next.flipped.length === 2) {
      this.phase.set('flipping');
      this.timers.after(FLIP_MS, () => this.openReveal());
    }
  }

  /** A mismatch reveal was dismissed: cards turn down and the turn passes (R17). */
  dismissReveal(): void {
    const record = this.play();
    if (!record || this.phase() !== 'reveal-mismatch') {
      return;
    }
    this.play.set(resolveMismatch(record));
    this.phase.set('idle');
  }

  /** Show All: every remaining card face up for about 3 seconds, one attempt (R26). */
  showAll(): void {
    const record = this.play();
    if (!record || this.showAllDisabled()) {
      return;
    }
    this.play.set(useShowAll(record));
    this.phase.set('peek');
    this.timers.after(SHOW_ALL_MS, () => this.phase.set('idle'));
  }

  private openReveal(): void {
    const record = this.play();
    const outcome = record ? turnOutcome(record) : null;
    if (!outcome) {
      return;
    }
    if (outcome === 'match') {
      this.phase.set('reveal-match');
      this.sound.play('match');
      this.timers.after(MATCH_PAUSE_MS, () => this.finishMatch());
    } else {
      this.phase.set('reveal-mismatch');
    }
  }

  private finishMatch(): void {
    const record = this.play();
    if (!record) {
      return;
    }
    const next = resolveMatch(record);
    this.play.set(next);
    if (isComplete(next)) {
      this.phase.set('finishing');
      this.timers.after(END_DELAY_MS, () => this.finish());
    } else {
      this.phase.set('idle');
    }
  }

  private finish(): void {
    const endedAt = this.clock.now().getTime();
    this.endedAt.set(endedAt);
    this.stopTicker();
    this.recordBest(endedAt);
    this.phase.set('idle');
    this.ended.set(true);
    this.sound.play('win');
  }

  /** Single-player only: keep the fewest attempts per player and board (R36, DS-024). */
  private recordBest(endedAt: number): void {
    const record = this.play();
    const options = this.applied();
    const result = record ? gameResult(record) : null;
    if (!options || result?.kind !== 'single') {
      return;
    }
    this.best.set(
      this.storage.recordBest(result.player, options, {
        attempts: result.attempts,
        timeMs: endedAt - this.startedAt(),
      }),
    );
  }

  /** Go starts a game from the draft and remembers those options on the device (R36, DS-024). */
  private startFromDraft(options: GameOptions): void {
    this.storage.saveOptions(options);
    this.startGame(options);
  }

  /** Deals a fresh game; cancels every pending transition of the previous one. */
  private startGame(options: GameOptions): void {
    this.timers.clear();
    this.stopTicker();

    this.applied.set(options);
    const assignment = this.assign(options.players);
    const deal = dealGame(options, this.edition.differenceTypes, this.randomSource);
    this.assignment.set(assignment);
    this.deal.set(deal);
    this.play.set(startPlay(deal.cards, assignment));

    this.phase.set('idle');
    this.ended.set(false);
    this.best.set(null);
    this.confirm.set(null);
    this.popupOpen.set(false);

    const now = this.clock.now().getTime();
    this.startedAt.set(now);
    this.pausedAt.set(null);
    this.endedAt.set(null);
    this.tickNow.set(now);
    if (assignment.mode === 'single') {
      this.ticker = setInterval(() => this.tickNow.set(this.clock.now().getTime()), TICK_MS);
    }
  }

  /** Closing the popup shifts the start instant by the paused time, so the timer resumes unchanged. */
  private resumeTimer(): void {
    const pausedAt = this.pausedAt();
    if (pausedAt === null) {
      return;
    }
    const now = this.clock.now().getTime();
    this.startedAt.update((startedAt) => startedAt + (now - pausedAt));
    this.pausedAt.set(null);
    this.tickNow.set(now);
  }

  private stopTicker(): void {
    clearInterval(this.ticker);
    this.ticker = undefined;
  }

  private present(face: FaceId, deal: Deal, options: GameOptions): FacePresentation {
    const theme = this.edition.themes.find((candidate) => candidate.id === face.themeId);
    if (!theme) {
      throw new Error(`Unknown theme "${face.themeId}" in the dealt deck`);
    }
    const childName =
      this.edition.children.find((child) => child.id === theme.child)?.name ?? theme.child;
    return presentFace(face, faceCue(face, deal.differences, options.variants), theme, childName);
  }

  /** Players for a Go or Restart from the checked children; two-player re-rolls the first player (R4). */
  private assign(selected: readonly ChildId[]): PlayerAssignment {
    return assignPlayers(selected, this.children, this.randomSource);
  }
}
