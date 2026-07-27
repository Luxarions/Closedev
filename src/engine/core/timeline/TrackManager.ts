import { TimelineTrack, TimelineClip, TrackType } from '../../types/timeline';

export class TrackManager {
  public constructor() {}

  public _addTrack(tracks: TimelineTrack[], type: TrackType, name?: string): TimelineTrack {
    const defaultNames: Record<TrackType, string> = {
      video: `Video Track ${tracks.filter(t => t.type === 'video').length + 1}`,
      audio: `Audio Track ${tracks.filter(t => t.type === 'audio').length + 1}`,
      text: `Text Track ${tracks.filter(t => t.type === 'text').length + 1}`,
      sticker: `Sticker Track ${tracks.filter(t => t.type === 'sticker').length + 1}`,
      effect: `Effect Track ${tracks.filter(t => t.type === 'effect').length + 1}`
    };

    const newTrack: TimelineTrack = {
      id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name || defaultNames[type],
      type,
      clips: [],
      muted: false,
      locked: false,
      hidden: false,
      order: tracks.length
    };

    tracks.push(newTrack);
    return newTrack;
  }

  public _removeTrack(tracks: TimelineTrack[], trackId: string): TimelineTrack[] {
    return tracks.filter(t => t.id !== trackId);
  }

  public _toggleMuteTrack(tracks: TimelineTrack[], trackId: string): void {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      track.muted = !track.muted;
      for (const clip of track.clips) {
        clip.muted = track.muted;
      }
    }
  }

  public _toggleLockTrack(tracks: TimelineTrack[], trackId: string): void {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      track.locked = !track.locked;
    }
  }

  public _toggleHideTrack(tracks: TimelineTrack[], trackId: string): void {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      track.hidden = !track.hidden;
    }
  }

  public _reorderTracks(tracks: TimelineTrack[], sourceIndex: number, targetIndex: number): void {
    if (sourceIndex < 0 || sourceIndex >= tracks.length || targetIndex < 0 || targetIndex >= tracks.length) return;
    const [moved] = tracks.splice(sourceIndex, 1);
    tracks.splice(targetIndex, 0, moved);
    tracks.forEach((t, i) => {
      t.order = i;
    });
  }

  public _findTrackForClip(tracks: TimelineTrack[], clipId: string): TimelineTrack | undefined {
    return tracks.find(t => t.clips.some(c => c.id === clipId));
  }

  public _findClipById(tracks: TimelineTrack[], clipId: string): TimelineClip | undefined {
    for (const track of tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) return clip;
    }
    return undefined;
  }
}
