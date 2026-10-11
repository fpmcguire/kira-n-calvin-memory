/**
 * Timeouts owned by one live game. `clear()` cancels every pending one together, so
 * Restart, New Game's Go and navigation never leave a stale callback behind (OBS-010).
 */
export class TimerBag {
  private readonly handles = new Set<ReturnType<typeof setTimeout>>();

  after(ms: number, action: () => void): void {
    const handle = setTimeout(() => {
      this.handles.delete(handle);
      action();
    }, ms);
    this.handles.add(handle);
  }

  clear(): void {
    for (const handle of this.handles) {
      clearTimeout(handle);
    }
    this.handles.clear();
  }
}
