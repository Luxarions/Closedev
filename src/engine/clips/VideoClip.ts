import { TimelineClip } from '../core/TimelineClip';

export class VideoClip extends TimelineClip {
  public isVideoClip = true;
  public override type: 'video' = 'video';

  public width = 1920;
  public height = 1080;
  public aspectRatio = 16 / 9;
  public frameRate = 30;

  public constructor() {
    super();
    this.mediaType = 'video';
  }

  public setResolution(width: number, height: number): this {
    this.width = width;
    this.height = height;
    this.aspectRatio = width / height;
    this.dispatchEvent({ type: 'resolutionChanged', width, height });
    return this;
  }

  public override copy(source: VideoClip, recursive = false): this {
    super.copy(source, recursive);
    this.width = source.width;
    this.height = source.height;
    this.aspectRatio = source.aspectRatio;
    this.frameRate = source.frameRate;
    return this;
  }

  public override toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      width: this.width,
      height: this.height,
      aspectRatio: this.aspectRatio,
      frameRate: this.frameRate,
    };
  }

  public override fromJSON(data: Record<string, any>): this {
    super.fromJSON(data);
    this.width = data.width || 1920;
    this.height = data.height || 1080;
    this.aspectRatio = data.aspectRatio || 16 / 9;
    this.frameRate = data.frameRate || 30;
    return this;
  }
}
