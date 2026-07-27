import { EngineState, AspectRatio } from '../types/timeline';
import { CanvasRenderer } from './CanvasRenderer';
import { AudioEngine } from './AudioEngine';
import { FrameRecorder } from './export/FrameRecorder';
import { ProgressTracker } from './export/ProgressTracker';

export interface ExportProgress {
  status: 'idle' | 'rendering' | 'completed' | 'error';
  progressPercent: number;
  currentFrame: number;
  totalFrames: number;
  downloadUrl?: string;
  errorMessage?: string;
}

export class ExportEngine {
  private _frameRecorder: FrameRecorder;
  private _progressTracker: ProgressTracker;
  private _isExporting = false;

  public constructor() {
    this._frameRecorder = new FrameRecorder();
    this._progressTracker = new ProgressTracker();
  }

  public cancelExport(): void {
    this._progressTracker._cancel();
    this._isExporting = false;
  }

  public async exportVideo(
    state: EngineState,
    aspectRatio: AspectRatio,
    fps: number = 30,
    onProgress: (progress: ExportProgress) => void
  ): Promise<string> {
    if (this._isExporting) {
      throw new Error('Ekspor sedang berjalan.');
    }

    this._isExporting = true;
    this._progressTracker._reset();

    const totalDuration = Math.max(1, state.duration);
    const totalFrames = Math.ceil(totalDuration * fps);

    // Create offscreen canvas for export rendering
    const offscreenCanvas = document.createElement('canvas');
    const canvasRenderer = new CanvasRenderer(offscreenCanvas);
    canvasRenderer.resizeCanvas(aspectRatio, 1920);

    const audioEngine = new AudioEngine();

    // Stream Setup
    const canvasStream = offscreenCanvas.captureStream(fps);
    const audioDestination = audioEngine.getMasterDestination();
    if (audioDestination && 'stream' in audioDestination) {
      const audioStream = (audioDestination as unknown as { stream: MediaStream }).stream;
      audioStream.getAudioTracks().forEach((track) => canvasStream.addTrack(track));
    }

    this._frameRecorder._startRecording(canvasStream);

    return new Promise((resolve, reject) => {
      let currentFrame = 0;
      const frameDuration = 1 / fps;

      const renderNextFrame = async () => {
        if (this._progressTracker._isAborted()) {
          this._frameRecorder._stopRecording();
          audioEngine.dispose();
          this._isExporting = false;
          reject(new Error('Ekspor dibatalkan.'));
          return;
        }

        if (currentFrame >= totalFrames) {
          audioEngine.stopAllAudio();
          const finalBlob = await this._frameRecorder._stopRecording();
          audioEngine.dispose();
          this._isExporting = false;

          const downloadUrl = URL.createObjectURL(finalBlob);
          onProgress({
            status: 'completed',
            progressPercent: 100,
            currentFrame: totalFrames,
            totalFrames,
            downloadUrl,
          });
          resolve(downloadUrl);
          return;
        }

        const currentTime = currentFrame * frameDuration;

        // Render Canvas Frame
        canvasRenderer.renderFrame(state.tracks, currentTime, aspectRatio);

        // Sync Audio
        audioEngine.updateAudioAtTime(state.tracks, currentTime, true);

        currentFrame++;
        const percent = this._progressTracker._calculatePercent(currentFrame, totalFrames);

        onProgress({
          status: 'rendering',
          progressPercent: percent,
          currentFrame,
          totalFrames,
        });

        setTimeout(renderNextFrame, Math.round(frameDuration * 1000));
      };

      renderNextFrame();
    });
  }
}
