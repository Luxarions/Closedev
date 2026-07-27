import { TimelineClip } from '../../types/timeline';

export class MediaDrawer {
  private _mediaCache: Map<string, HTMLImageElement | HTMLVideoElement> = new Map();

  public constructor() {}

  public _drawMediaClip(
    ctx: CanvasRenderingContext2D,
    clip: TimelineClip,
    clipTime: number,
    canvasW: number,
    canvasH: number
  ): void {
    if (!clip.sourceUrl) return;

    if (clip.mediaType === 'image' || clip.type === 'sticker') {
      this._drawImage(ctx, clip, canvasW, canvasH);
    } else if (clip.mediaType === 'video' || clip.type === 'video') {
      this._drawVideo(ctx, clip, clipTime, canvasW, canvasH);
    }
  }

  private _drawImage(
    ctx: CanvasRenderingContext2D,
    clip: TimelineClip,
    canvasW: number,
    canvasH: number
  ): void {
    let img = this._mediaCache.get(clip.sourceUrl) as HTMLImageElement;
    if (!img) {
      img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = clip.sourceUrl;
      this._mediaCache.set(clip.sourceUrl, img);
    }

    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, -canvasW / 2, -canvasH / 2, canvasW, canvasH);
    }
  }

  private _drawVideo(
    ctx: CanvasRenderingContext2D,
    clip: TimelineClip,
    clipTime: number,
    canvasW: number,
    canvasH: number
  ): void {
    let video = this._mediaCache.get(clip.sourceUrl) as HTMLVideoElement;
    if (!video) {
      video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.src = clip.sourceUrl;
      this._mediaCache.set(clip.sourceUrl, video);
    }

    if (video.readyState >= 2) {
      if (Math.abs(video.currentTime - clipTime) > 0.1) {
        video.currentTime = clipTime;
      }
      ctx.drawImage(video, -canvasW / 2, -canvasH / 2, canvasW, canvasH);
    }
  }
}
