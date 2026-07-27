import { EngineState, AspectRatio } from '../types/timeline';
import { CanvasRenderer } from './CanvasRenderer';
import { AudioEngine } from './AudioEngine';

export interface ExportProgress {
  status: 'idle' | 'rendering' | 'completed' | 'error';
  progressPercent: number;
  currentFrame: number;
  totalFrames: number;
  downloadUrl?: string;
  errorMessage?: string;
}

export class ExportEngine {
  private isExporting = false;

  public async exportVideo(
    state: EngineState,
    aspectRatio: AspectRatio,
    fps: number = 30,
    onProgress: (progress: ExportProgress) => void
  ): Promise<string> {
    if (this.isExporting) {
      throw new Error('Ekspor sedang berjalan.');
    }

    this.isExporting = true;
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

    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    const mediaRecorder = new MediaRecorder(canvasStream, { mimeType });
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        this.isExporting = false;
        const finalBlob = new Blob(chunks, { type: mimeType });
        const downloadUrl = URL.createObjectURL(finalBlob);
        onProgress({
          status: 'completed',
          progressPercent: 100,
          currentFrame: totalFrames,
          totalFrames,
          downloadUrl,
        });
        resolve(downloadUrl);
      };

      mediaRecorder.onerror = (e) => {
        this.isExporting = false;
        const errorMessage = `Gagal mengekspor video: ${e.error?.message || 'Error tidak diketahui'}`;
        onProgress({
          status: 'error',
          progressPercent: 0,
          currentFrame: 0,
          totalFrames,
          errorMessage,
        });
        reject(new Error(errorMessage));
      };

      mediaRecorder.start(100);

      let currentFrame = 0;
      const frameInterval = 1000 / fps;

      const renderStep = async () => {
        if (currentFrame >= totalFrames || !this.isExporting) {
          mediaRecorder.stop();
          return;
        }

        const currentTime = currentFrame / fps;

        // Render visual frame
        canvasRenderer.renderFrame(state.tracks, currentTime, aspectRatio, null);

        // Render audio
        audioEngine.updateAudioAtTime(state.tracks, currentTime, true);

        currentFrame++;
        const progressPercent = Math.round((currentFrame / totalFrames) * 100);

        onProgress({
          status: 'rendering',
          progressPercent,
          currentFrame,
          totalFrames,
        });

        setTimeout(renderStep, frameInterval / 2); // Accelerate rendering
      };

      renderStep();
    });
  }

  public cancelExport(): void {
    this.isExporting = false;
  }
}
