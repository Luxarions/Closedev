import { TimelineItem } from './TimelineItem';
import {
  TrackType,
  TransformProps,
  FilterProps,
  AppliedEffect,
  AppliedTransition,
  Keyframe,
  TextProperties,
  TimelineClip as ITimelineClip,
} from '../types/timeline';

/**
 * Abstract base class for all clips placed on tracks.
 * Extends TimelineItem with clip-specific attributes and methods.
 * 
 * @abstract
 * @augments TimelineItem
 */
export abstract class TimelineClip extends TimelineItem implements ITimelineClip {
  public isTimelineClip = true;
  public override type: TrackType = 'video';

  public trackId = '';
  public mediaOffset = 0;
  public mediaDuration = 5;
  public sourceUrl = '';
  public thumbnailUrl?: string;
  public mediaType?: 'video' | 'image' | 'audio' | 'text' | 'sticker' = 'video';

  public transform: TransformProps = {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    opacity: 1,
  };

  public volume = 100;
  public muted = false;
  public fadeInDuration = 0;
  public fadeOutDuration = 0;
  public playbackRate = 1.0;

  public filters: FilterProps = {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    hueRotate: 0,
    blur: 0,
    sepia: 0,
    temperature: 0,
  };

  public effects: AppliedEffect[] = [];
  public keyframes: Keyframe[] = [];
  public transitionIn?: AppliedTransition;
  public transitionOut?: AppliedTransition;
  public textProps?: TextProperties;

  public constructor() {
    super();
  }

  public setTrack(trackId: string): this {
    this.trackId = trackId;
    this.dispatchEvent({ type: 'trackChanged', trackId });
    return this;
  }

  public trim(newStartTime: number, newDuration: number, newMediaOffset?: number): this {
    this.startTime = Math.max(0, newStartTime);
    this.duration = Math.max(0.1, newDuration);
    if (newMediaOffset !== undefined) {
      this.mediaOffset = Math.max(0, newMediaOffset);
    }
    this.dispatchEvent({ type: 'trimmed' });
    return this;
  }

  public split(splitTime: number): [TimelineClip, TimelineClip | null] {
    const clipEnd = this.startTime + this.duration;
    if (splitTime <= this.startTime || splitTime >= clipEnd) {
      return [this, null];
    }

    const leftDuration = splitTime - this.startTime;
    const rightDuration = this.duration - leftDuration;
    const rightOffset = this.mediaOffset + leftDuration;

    const rightClip = this.clone() as TimelineClip;
    rightClip.id = this.generateId();
    rightClip.startTime = splitTime;
    rightClip.duration = rightDuration;
    rightClip.mediaOffset = rightOffset;

    this.duration = leftDuration;

    this.dispatchEvent({ type: 'split', left: this, right: rightClip });
    return [this, rightClip];
  }

  public override copy(source: TimelineClip, recursive = false): this {
    super.copy(source, recursive);
    this.trackId = source.trackId;
    this.mediaOffset = source.mediaOffset;
    this.mediaDuration = source.mediaDuration;
    this.sourceUrl = source.sourceUrl;
    this.thumbnailUrl = source.thumbnailUrl;
    this.mediaType = source.mediaType;
    this.transform = { ...source.transform };
    this.volume = source.volume;
    this.muted = source.muted;
    this.fadeInDuration = source.fadeInDuration;
    this.fadeOutDuration = source.fadeOutDuration;
    this.playbackRate = source.playbackRate;
    this.filters = { ...source.filters };
    this.effects = (source.effects || []).map((e) => ({ ...e }));
    this.keyframes = (source.keyframes || []).map((k) => ({ ...k }));
    this.transitionIn = source.transitionIn ? { ...source.transitionIn } : undefined;
    this.transitionOut = source.transitionOut ? { ...source.transitionOut } : undefined;
    if (source.textProps) {
      this.textProps = { ...source.textProps };
    }
    return this;
  }

  public override toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      trackId: this.trackId,
      mediaOffset: this.mediaOffset,
      mediaDuration: this.mediaDuration,
      sourceUrl: this.sourceUrl,
      thumbnailUrl: this.thumbnailUrl,
      mediaType: this.mediaType,
      transform: this.transform,
      volume: this.volume,
      muted: this.muted,
      fadeInDuration: this.fadeInDuration,
      fadeOutDuration: this.fadeOutDuration,
      playbackRate: this.playbackRate,
      filters: this.filters,
      effects: this.effects,
      keyframes: this.keyframes,
      transitionIn: this.transitionIn,
      transitionOut: this.transitionOut,
      textProps: this.textProps,
    };
  }

  public override fromJSON(data: Record<string, any>): this {
    super.fromJSON(data);
    this.trackId = data.trackId || '';
    this.mediaOffset = data.mediaOffset || 0;
    this.mediaDuration = data.mediaDuration || 5;
    this.sourceUrl = data.sourceUrl || '';
    this.thumbnailUrl = data.thumbnailUrl;
    this.mediaType = data.mediaType || 'video';
    this.transform = data.transform || this.transform;
    this.volume = data.volume ?? 100;
    this.muted = data.muted ?? false;
    this.fadeInDuration = data.fadeInDuration || 0;
    this.fadeOutDuration = data.fadeOutDuration || 0;
    this.playbackRate = data.playbackRate || 1.0;
    this.filters = data.filters || this.filters;
    this.effects = data.effects || [];
    this.keyframes = data.keyframes || [];
    this.transitionIn = data.transitionIn;
    this.transitionOut = data.transitionOut;
    this.textProps = data.textProps;
    return this;
  }
}
