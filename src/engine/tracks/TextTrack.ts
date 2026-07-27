import { TimelineTrack } from '../core/TimelineTrack';

export class TextTrack extends TimelineTrack {
  public isTextTrack = true;
  public override type: 'text' = 'text';

  public constructor() {
    super();
    this.name = 'Trek Teks';
  }
}
