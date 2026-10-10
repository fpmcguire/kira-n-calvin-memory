/** Injectable random source returning a number in [0, 1), like `Math.random`. */
export type RandomSource = () => number;

/** An integer in [0, bound). Guards a source that returns exactly 1. */
export function randomInt(random: RandomSource, bound: number): number {
  return Math.min(bound - 1, Math.floor(random() * bound));
}

/** Fisher-Yates shuffle; returns a new array and leaves `items` untouched. */
export function shuffle<T>(items: readonly T[], random: RandomSource): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(random, i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
