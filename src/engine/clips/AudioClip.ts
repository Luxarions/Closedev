import { TimelineClip } from '../core/TimelineClip';

export class AudioClip extends TimelineClip {
  public isAudioClip = true;
  public override type: 'audio' = 'audio';

  public sampleRate = 44100;
  public channels = 2;
  public bitDepth = 16;

  public constructor() {
    super();
    this.mediaType = 'audio';
  }

  public override copy(source: AudioClip, recursive = false): this {
    super.copy(source, recursive);
    this.sampleRate = source.sampleRate;
    this.channels = source.channels;
    this.bitDepth = source.bitDepth;
    return this;
  }

  public override toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      sampleRate: this.sampleRate,
      channels: this.channels,
      bitDepth: this.bitDepth,
    };
  }

  public override fromJSON(data: Record<string, any>): this {
    super.fromJSON(data);
    this.sampleRate = data.sampleRate || 44100;
    this.channels = data.channels || 2;
    this.bitDepth = data.bitDepth || 16;
    return this;
  }
}
