export class AudioContextManager {
  private _audioCtx: AudioContext | null = null;

  public constructor() {}

  public _getAudioContext(): AudioContext {
    if (!this._audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this._audioCtx = new AudioContextClass();
    }
    if (this._audioCtx.state === 'suspended') {
      this._audioCtx.resume();
    }
    return this._audioCtx;
  }

  public _close(): void {
    if (this._audioCtx) {
      this._audioCtx.close();
      this._audioCtx = null;
    }
  }
}
