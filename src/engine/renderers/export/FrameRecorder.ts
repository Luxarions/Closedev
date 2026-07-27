export class FrameRecorder {
  private _mediaRecorder: MediaRecorder | null = null;
  private _recordedChunks: Blob[] = [];

  public constructor() {}

  public _startRecording(stream: MediaStream): void {
    this._recordedChunks = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    this._mediaRecorder = new MediaRecorder(stream, { mimeType });
    this._mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this._recordedChunks.push(e.data);
      }
    };
    this._mediaRecorder.start(100);
  }

  public _stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this._mediaRecorder) {
        resolve(new Blob([], { type: 'video/webm' }));
        return;
      }

      this._mediaRecorder.onstop = () => {
        const blob = new Blob(this._recordedChunks, { type: 'video/webm' });
        resolve(blob);
      };
      this._mediaRecorder.stop();
    });
  }
}
