import { TimelineTrack } from '../core/TimelineTrack';

export class AudioTrack extends TimelineTrack {
  public isAudioTrack = true;
  public override type: 'audio' = 'audio';

  public volume = 100;

  public constructor() {
    super();
    this.name = 'Trek Audio';
  }
}
