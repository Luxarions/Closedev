import { TimelineClip } from '../core/TimelineClip';

export class ImageClip extends TimelineClip {
  public isImageClip = true;

  public width = 1080;
  public height = 1080;

  public constructor() {
    super();
    this.mediaType = 'image';
  }

  public override copy(source: ImageClip, recursive = false): this {
    super.copy(source, recursive);
    this.width = source.width;
    this.height = source.height;
    return this;
  }
}
