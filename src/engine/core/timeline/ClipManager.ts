import { TimelineTrack, TimelineClip, TransformProps, TextProperties, AppliedEffect, AppliedTransition } from '../../types/timeline';

export class ClipManager {
  public constructor() {}

  public _addClip(
    tracks: TimelineTrack[],
    targetTrackId: string,
    clipData: Partial<TimelineClip> & { name: string }
  ): TimelineClip {
    const track = tracks.find(t => t.id === targetTrackId);
    if (!track) {
      throw new Error(`Target track ${targetTrackId} not found`);
    }

    const defaultTransform: TransformProps = {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1
    };

    const newClip: TimelineClip = {
      id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      trackId: targetTrackId,
      name: clipData.name,
      type: clipData.type || track.type,
      startTime: clipData.startTime ?? 0,
      duration: clipData.duration ?? 5,
      mediaOffset: clipData.mediaOffset ?? 0,
      mediaDuration: clipData.mediaDuration ?? (clipData.duration ?? 5),
      sourceUrl: clipData.sourceUrl || '',
      thumbnailUrl: clipData.thumbnailUrl,
      mediaType: clipData.mediaType || (track.type === 'video' ? 'video' : track.type === 'audio' ? 'audio' : 'text'),
      transform: clipData.transform || defaultTransform,
      volume: clipData.volume ?? 100,
      muted: clipData.muted ?? false,
      fadeInDuration: clipData.fadeInDuration ?? 0,
      fadeOutDuration: clipData.fadeOutDuration ?? 0,
      playbackRate: clipData.playbackRate ?? 1.0,
      filters: clipData.filters || {
        brightness: 100,
        contrast: 100,
        saturate: 100,
        hueRotate: 0,
        blur: 0,
        sepia: 0,
        temperature: 0
      },
      effects: clipData.effects || [],
      transitionIn: clipData.transitionIn,
      transitionOut: clipData.transitionOut,
      textProps: clipData.textProps,
      keyframes: clipData.keyframes || []
    };

    track.clips.push(newClip);
    return newClip;
  }

  public _moveClip(
    tracks: TimelineTrack[],
    clipId: string,
    targetTrackId: string,
    newStartTime: number
  ): void {
    let foundClip: TimelineClip | undefined;
    let sourceTrack: TimelineTrack | undefined;

    for (const track of tracks) {
      const index = track.clips.findIndex(c => c.id === clipId);
      if (index !== -1) {
        foundClip = track.clips[index];
        sourceTrack = track;
        track.clips.splice(index, 1);
        break;
      }
    }

    if (!foundClip || !sourceTrack) return;

    const targetTrack = tracks.find(t => t.id === targetTrackId) || sourceTrack;
    foundClip.startTime = Math.max(0, newStartTime);
    foundClip.trackId = targetTrack.id;
    targetTrack.clips.push(foundClip);
  }

  public _trimClip(
    tracks: TimelineTrack[],
    clipId: string,
    newStartTime: number,
    newDuration: number,
    newMediaOffset?: number
  ): void {
    for (const track of tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) {
        clip.startTime = Math.max(0, newStartTime);
        clip.duration = Math.max(0.1, newDuration);
        if (newMediaOffset !== undefined) {
          clip.mediaOffset = Math.max(0, newMediaOffset);
        }
        return;
      }
    }
  }

  public _splitClip(
    tracks: TimelineTrack[],
    clipId: string,
    splitTime: number
  ): TimelineClip[] {
    for (const track of tracks) {
      const index = track.clips.findIndex(c => c.id === clipId);
      if (index !== -1) {
        const original = track.clips[index];
        const clipEnd = original.startTime + original.duration;

        if (splitTime <= original.startTime || splitTime >= clipEnd) {
          return [original];
        }

        const leftDuration = splitTime - original.startTime;
        const rightDuration = original.duration - leftDuration;
        const rightOffset = original.mediaOffset + leftDuration;

        original.duration = leftDuration;

        const rightClip: TimelineClip = {
          ...JSON.parse(JSON.stringify(original)),
          id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          startTime: splitTime,
          duration: rightDuration,
          mediaOffset: rightOffset
        };

        track.clips.splice(index + 1, 0, rightClip);
        return [original, rightClip];
      }
    }
    return [];
  }

  public _deleteClip(tracks: TimelineTrack[], clipId: string): void {
    for (const track of tracks) {
      const index = track.clips.findIndex(c => c.id === clipId);
      if (index !== -1) {
        track.clips.splice(index, 1);
        return;
      }
    }
  }

  public _duplicateClip(tracks: TimelineTrack[], clipId: string): TimelineClip | undefined {
    for (const track of tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) {
        const duplicated: TimelineClip = {
          ...JSON.parse(JSON.stringify(clip)),
          id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          startTime: clip.startTime + clip.duration
        };
        track.clips.push(duplicated);
        return duplicated;
      }
    }
    return undefined;
  }
}
