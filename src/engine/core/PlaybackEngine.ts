import { TimelineEngine } from './TimelineEngine';

export class PlaybackEngine {
  private timelineEngine: TimelineEngine;
  private animFrameId: number | null = null;
  private lastTickTime: number = 0;
  private isPlaying = false;

  constructor(timelineEngine: TimelineEngine) {
    this.timelineEngine = timelineEngine;
  }

  public play(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.lastTickTime = performance.now();
    this._tick();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public togglePlayPause(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number): void {
    this.timelineEngine.setCurrentTime(seconds);
  }

  public stepForward(frames: number = 1, fps: number = 30): void {
    const currentState = this.timelineEngine.getState();
    this.seek(currentState.currentTime + frames / fps);
  }

  public stepBackward(frames: number = 1, fps: number = 30): void {
    const currentState = this.timelineEngine.getState();
    this.seek(currentState.currentTime - frames / fps);
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  private _tick = (): void => {
    if (!this.isPlaying) return;

    const now = performance.now();
    const deltaSeconds = (now - this.lastTickTime) / 1000;
    this.lastTickTime = now;

    const currentState = this.timelineEngine.getState();
    const nextTime = currentState.currentTime + deltaSeconds;

    if (nextTime >= currentState.duration) {
      // Loop back to start
      this.seek(0);
    } else {
      this.timelineEngine.setCurrentTime(nextTime);
    }

    this.animFrameId = requestAnimationFrame(this._tick);
  };
}
