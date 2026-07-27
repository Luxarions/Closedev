export class ProgressTracker {
  private _isCancelled: boolean = false;

  public constructor() {}

  public _reset(): void {
    this._isCancelled = false;
  }

  public _cancel(): void {
    this._isCancelled = true;
  }

  public _isAborted(): boolean {
    return this._isCancelled;
  }

  public _calculatePercent(currentFrame: number, totalFrames: number): number {
    if (totalFrames <= 0) return 0;
    return Math.min(100, Math.round((currentFrame / totalFrames) * 100));
  }
}
