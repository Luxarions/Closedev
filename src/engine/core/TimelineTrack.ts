import { TimelineItem } from './TimelineItem';
import { TimelineClip } from './TimelineClip';
import { TrackType, TimelineTrack as ITimelineTrack } from '../types/timeline';

/**
 * Base Track class holding an ordered list of TimelineClips.
 * Extends TimelineItem following Object3D hierarchy principles.
 * 
 * @augments TimelineItem
 */
export class TimelineTrack extends TimelineItem implements ITimelineTrack {
  public isTimelineTrack = true;
  public override type: TrackType = 'video';

  public order = 0;
  public muted = false;
  public locked = false;
  public hidden = false;
  public clips: TimelineClip[] = [];

  public constructor() {
    super();
  }

  public addClip(clip: TimelineClip): this {
    if (clip.parent) {
      clip.parent.removeChild(clip);
    }
    clip.setTrack(this.id);
    this.clips.push(clip);
    this.addChild(clip);
    this.dispatchEvent({ type: 'clipAdded', clip });
    return this;
  }

  public removeClip(clip: TimelineClip): this {
    const index = this.clips.indexOf(clip);
    if (index !== -1) {
      this.clips.splice(index, 1);
      this.removeChild(clip);
      this.dispatchEvent({ type: 'clipRemoved', clip });
    }
    return this;
  }

  public findClip(clipId: string): TimelineClip | undefined {
    return this.clips.find((c) => c.id === clipId);
  }

  public getClipsAtTime(time: number): TimelineClip[] {
    return this.clips.filter((c) => c.startTime <= time && time <= c.startTime + c.duration);
  }

  public override copy(source: TimelineTrack, recursive = false): this {
    super.copy(source, recursive);
    this.order = source.order;
    this.muted = source.muted;
    this.locked = source.locked;
    this.hidden = source.hidden;

    if (recursive) {
      this.clips = [];
      for (const clip of source.clips) {
        this.addClip(clip.clone() as TimelineClip);
      }
    }

    return this;
  }

  public override toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      order: this.order,
      muted: this.muted,
      locked: this.locked,
      hidden: this.hidden,
      clips: this.clips.map((c) => c.toJSON()),
    };
  }

  public override fromJSON(data: Record<string, any>): this {
    super.fromJSON(data);
    this.order = data.order || 0;
    this.muted = data.muted || false;
    this.locked = data.locked || false;
    this.hidden = data.hidden || false;
    return this;
  }
}
