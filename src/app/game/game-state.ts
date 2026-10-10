import { computed, inject, Service, signal } from '@angular/core';
import { EDITION } from '../content/edition';
import { isBeforeCutoff } from '../domain/cutoff';
import { dealGame } from '../domain/deck';
import { canGo, cardCount, defaultOptions } from '../domain/options';
import { assignPlayers } from '../domain/players';
import { RandomSource } from '../domain/random';
import { ChildId, Deal, GameOptions, PlayerAssignment } from '../domain/types';
import { Clock } from './clock';
import { Random } from './random';

export interface PlayerBlock {
  readonly id: ChildId;
  readonly name: string;
  readonly active: boolean;
}

/**
 * Top-level signal state for the game route (splash, options overlay, draft, deal).
 * Provided per game route visit so it never leaks into the greeting route.
 * Rules live in `src/app/domain/`; this class only feeds them the edition, clock and
 * random source. The play record (flips, scores, turns) arrives in Step 04.
 */
@Service({ autoProvided: false })
export class GameState {
  private readonly edition = inject(EDITION);
  private readonly random = inject(Random);

  /** Evaluated once on entry so the splash never changes while it is showing (R2, R3). */
  readonly beforeCutoff = isBeforeCutoff(inject(Clock).now(), this.edition.cutoff);

  private readonly children = this.edition.children.map((child) => child.id);
  private readonly randomSource: RandomSource = () => this.random.next();

  readonly splashVisible = signal(true);
  readonly popupOpen = signal(false);
  /** Options applied by Go; null until the first Go. */
  readonly applied = signal<GameOptions | null>(null);
  /** Unsaved popup selections, applied only by Go (R37). */
  readonly draft = signal(defaultOptions(this.edition.themes.map((theme) => theme.id)));

  /** Dealt deck and per-theme difference types; null until the first Go. */
  readonly deal = signal<Deal | null>(null);
  /** Rolled on each Go (R4, DS-020); single player until the first Go. */
  readonly assignment = signal<PlayerAssignment>(this.assign(false));

  /** The popup has a Close button only when there is a game to return to (DS-010). */
  readonly closable = computed(() => this.applied() !== null);

  /** Face-down preview count: draft on first open, the dealt deck afterwards (DS-007). */
  readonly previewCount = computed(
    () => this.deal()?.cards.length ?? cardCount(this.applied() ?? this.draft()),
  );

  readonly players = computed<readonly PlayerBlock[]>(() => {
    const { mode, players, first } = this.assignment();
    return players.map((id) => ({
      id,
      name: this.edition.children.find((child) => child.id === id)?.name ?? id,
      active: mode === 'two' && id === first,
    }));
  });

  dismissSplash(): void {
    this.splashVisible.set(false);
    this.popupOpen.set(true);
  }

  openOptions(): void {
    const applied = this.applied();
    if (applied) {
      this.draft.set(applied);
    }
    this.popupOpen.set(true);
  }

  /** Close and Escape: discard the draft and return to the game unchanged (R37, DS-025). */
  closeOptions(): void {
    const applied = this.applied();
    if (!applied) {
      return;
    }
    this.draft.set(applied);
    this.popupOpen.set(false);
  }

  go(): void {
    const draft = this.draft();
    if (!canGo(draft)) {
      return;
    }
    this.applied.set(draft);
    this.assignment.set(this.assign(draft.twoPlayers));
    this.deal.set(dealGame(draft, this.edition.differenceTypes, this.randomSource));
    this.popupOpen.set(false);
  }

  private assign(twoPlayers: boolean): PlayerAssignment {
    return assignPlayers(
      twoPlayers,
      this.beforeCutoff,
      this.edition.cutoff,
      this.children,
      this.randomSource,
    );
  }
}
