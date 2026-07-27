import { TimelineTrack } from '../core/TimelineTrack';

export class VideoTrack extends TimelineTrack {
  public isVideoTrack = true;
  public override type: 'video' = 'video';

  public constructor() {
    super();
    this.name = 'Trek Video';
  }
}
