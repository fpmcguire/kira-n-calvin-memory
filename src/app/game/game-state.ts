import { computed, inject, Service, signal } from '@angular/core';
import { EDITION } from '../content/edition';
import { choosePlayer, isBeforeCutoff } from '../domain/cutoff';
import { canGo, cardCount, defaultOptions } from '../domain/options';
import { ChildId, GameOptions } from '../domain/types';
import { Clock } from './clock';
import { Random } from './random';

export interface PlayerBlock {
  readonly id: ChildId;
  readonly name: string;
  readonly active: boolean;
}

/**
 * Top-level signal state for the game route (splash, options overlay, draft).
 * Provided per game route visit so it never leaks into the greeting route.
 * No deck or play record exists yet; those arrive in Steps 03-04.
 */
@Service({ autoProvided: false })
export class GameState {
  private readonly edition = inject(EDITION);
  private readonly random = inject(Random);

  /** Evaluated once on entry so the splash never changes while it is showing (R2, R3). */
  readonly beforeCutoff = isBeforeCutoff(inject(Clock).now(), this.edition.cutoff);

  readonly splashVisible = signal(true);
  readonly popupOpen = signal(false);
  /** Options applied by Go; null until the first Go. */
  readonly applied = signal<GameOptions | null>(null);
  /** Unsaved popup selections, applied only by Go (R37). */
  readonly draft = signal(defaultOptions(this.edition.themes.map((theme) => theme.id)));

  private readonly singlePlayer = signal(this.rollPlayer());
  private readonly firstPlayer = signal(this.rollPlayer());

  /** The popup has a Close button only when there is a game to return to (DS-010). */
  readonly closable = computed(() => this.applied() !== null);

  /** Face-down preview count: draft on first open, applied options afterwards (DS-007). */
  readonly previewCount = computed(() => cardCount(this.applied() ?? this.draft()));

  readonly players = computed<readonly PlayerBlock[]>(() => {
    const twoPlayers = this.applied()?.twoPlayers ?? false;
    const ids = twoPlayers ? this.edition.children.map((child) => child.id) : [this.singlePlayer()];
    return ids.map((id) => ({
      id,
      name: this.edition.children.find((child) => child.id === id)?.name ?? id,
      active: twoPlayers && id === this.firstPlayer(),
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
    this.singlePlayer.set(this.rollPlayer());
    this.firstPlayer.set(this.rollPlayer());
    this.popupOpen.set(false);
  }

  private rollPlayer(): ChildId {
    return choosePlayer(
      this.beforeCutoff,
      this.edition.cutoff,
      this.edition.children.map((child) => child.id),
      () => this.random.next(),
    );
  }
}
