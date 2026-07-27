import { TimelineTrack } from '../../types/timeline';

export class SnappingManager {
  private _snapThresholdSeconds: number;

  public constructor(snapThresholdSeconds: number = 0.15) {
    this._snapThresholdSeconds = snapThresholdSeconds;
  }

  public _findSnapPosition(
    targetTime: number,
    tracks: TimelineTrack[],
    currentTime: number,
    ignoreClipId?: string
  ): { time: number; snapped: boolean; snapPoint?: number } {
    let closestDistance = this._snapThresholdSeconds;
    let snapTime = targetTime;
    let isSnapped = false;

    // 1. Playhead snapping
    const playheadDist = Math.abs(targetTime - currentTime);
    if (playheadDist < closestDistance) {
      closestDistance = playheadDist;
      snapTime = currentTime;
      isSnapped = true;
    }

    // 2. Clip edge snapping across all tracks
    for (const track of tracks) {
      for (const clip of track.clips) {
        if (clip.id === ignoreClipId) continue;

        const clipStartDist = Math.abs(targetTime - clip.startTime);
        if (clipStartDist < closestDistance) {
          closestDistance = clipStartDist;
          snapTime = clip.startTime;
          isSnapped = true;
        }

        const clipEnd = clip.startTime + clip.duration;
        const clipEndDist = Math.abs(targetTime - clipEnd);
        if (clipEndDist < closestDistance) {
          closestDistance = clipEndDist;
          snapTime = clipEnd;
          isSnapped = true;
        }
      }
    }

    return {
      time: snapTime,
      snapped: isSnapped,
      snapPoint: isSnapped ? snapTime : undefined
    };
  }
}
