import {
  EngineState,
  ProjectSettings,
  TimelineTrack,
  TimelineClip,
  TrackType,
  AppliedEffect,
  AppliedTransition,
  FilterProps,
  TextProperties,
  TransformProps,
} from '../types/timeline';
import { clamp } from '../utils/timecodeUtils';

type EventListener = (state: EngineState) => void;

export class TimelineEngine {
  private state: EngineState;
  private historyStack: EngineState[] = [];
  private listeners: Set<EventListener> = new Set();
  private maxHistory = 30;

  constructor(initialSettings?: Partial<ProjectSettings>) {
    const defaultProject: ProjectSettings = {
      title: 'Proyek CapCut Baru',
      aspectRatio: '16:9',
      fps: 30,
      sampleRate: 44100,
      backgroundColor: '#0a0a0c',
      ...initialSettings,
    };

    // Default CapCut tracks
    const defaultTracks: TimelineTrack[] = [
      {
        id: 'track_text_1',
        name: 'Teks & Stiker',
        type: 'text',
        order: 3,
        muted: false,
        locked: false,
        hidden: false,
        clips: [],
      },
      {
        id: 'track_effect_1',
        name: 'Efek & Filter',
        type: 'effect',
        order: 2,
        muted: false,
        locked: false,
        hidden: false,
        clips: [],
      },
      {
        id: 'track_video_1',
        name: 'Video Utama',
        type: 'video',
        order: 1,
        muted: false,
        locked: false,
        hidden: false,
        clips: [],
      },
      {
        id: 'track_audio_1',
        name: 'Musik & Audio',
        type: 'audio',
        order: 0,
        muted: false,
        locked: false,
        hidden: false,
        clips: [],
      },
    ];

    this.state = {
      project: defaultProject,
      tracks: defaultTracks,
      currentTime: 0,
      duration: 15,
      isPlaying: false,
      selectedClipId: null,
      selectedTrackId: null,
      selectedTransitionId: null,
      selectedEffectId: null,
      zoomLevel: 60, // 60 pixels per second
      snapToGrid: true,
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
    };

    this.saveHistoryState();
  }

  // --- Listener Subscription ---
  public subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const currentState = this.getState();
    this.listeners.forEach((fn) => fn(currentState));
  }

  public getState(): EngineState {
    return JSON.parse(JSON.stringify(this.state));
  }

  // --- State History (Undo / Redo) ---
  private saveHistoryState(): void {
    if (this.state.historyIndex < this.historyStack.length - 1) {
      this.historyStack = this.historyStack.slice(0, this.state.historyIndex + 1);
    }
    this.historyStack.push(JSON.parse(JSON.stringify(this.state)));
    if (this.historyStack.length > this.maxHistory) {
      this.historyStack.shift();
    }
    this.state.historyIndex = this.historyStack.length - 1;
    this.updateUndoRedoStatus();
  }

  private updateUndoRedoStatus(): void {
    this.state.canUndo = this.state.historyIndex > 0;
    this.state.canRedo = this.state.historyIndex < this.historyStack.length - 1;
  }

  public undo(): void {
    if (this.state.canUndo) {
      this.state.historyIndex--;
      this.state = JSON.parse(JSON.stringify(this.historyStack[this.state.historyIndex]));
      this.updateUndoRedoStatus();
      this.notifyListeners();
    }
  }

  public redo(): void {
    if (this.state.canRedo) {
      this.state.historyIndex++;
      this.state = JSON.parse(JSON.stringify(this.historyStack[this.state.historyIndex]));
      this.updateUndoRedoStatus();
      this.notifyListeners();
    }
  }

  // --- Project Settings ---
  public setProjectTitle(title: string): void {
    this.state.project.title = title;
    this.saveHistoryState();
    this.notifyListeners();
  }

  public setAspectRatio(aspectRatio: ProjectSettings['aspectRatio']): void {
    this.state.project.aspectRatio = aspectRatio;
    this.saveHistoryState();
    this.notifyListeners();
  }

  public setZoomLevel(zoomLevel: number): void {
    this.state.zoomLevel = clamp(zoomLevel, 10, 300);
    this.notifyListeners();
  }

  public toggleSnapToGrid(): void {
    this.state.snapToGrid = !this.state.snapToGrid;
    this.notifyListeners();
  }

  // --- Track Management ---
  public addTrack(type: TrackType, name?: string): TimelineTrack {
    const trackCount = this.state.tracks.filter((t) => t.type === type).length;
    const newTrack: TimelineTrack = {
      id: `track_${type}_${Date.now()}`,
      name: name || `Trek ${type.toUpperCase()} ${trackCount + 1}`,
      type,
      order: this.state.tracks.length,
      muted: false,
      locked: false,
      hidden: false,
      clips: [],
    };

    this.state.tracks.unshift(newTrack);
    this.reorderTracks();
    this.saveHistoryState();
    this.notifyListeners();
    return newTrack;
  }

  public removeTrack(trackId: string): void {
    this.state.tracks = this.state.tracks.filter((t) => t.id !== trackId);
    this.reorderTracks();
    this.recalculateTotalDuration();
    this.saveHistoryState();
    this.notifyListeners();
  }

  public toggleTrackMute(trackId: string): void {
    const track = this.state.tracks.find((t) => t.id === trackId);
    if (track) {
      track.muted = !track.muted;
      this.saveHistoryState();
      this.notifyListeners();
    }
  }

  public toggleTrackLock(trackId: string): void {
    const track = this.state.tracks.find((t) => t.id === trackId);
    if (track) {
      track.locked = !track.locked;
      this.saveHistoryState();
      this.notifyListeners();
    }
  }

  public toggleTrackHide(trackId: string): void {
    const track = this.state.tracks.find((t) => t.id === trackId);
    if (track) {
      track.hidden = !track.hidden;
      this.saveHistoryState();
      this.notifyListeners();
    }
  }

  private reorderTracks(): void {
    this.state.tracks.forEach((track, idx) => {
      track.order = this.state.tracks.length - 1 - idx;
    });
  }

  // --- Clip Operations (Add, Move, Trim, Split, Delete) ---
  public addClipToTrack(
    trackId: string,
    clipData: Partial<TimelineClip> & { name: string; sourceUrl: string }
  ): TimelineClip | null {
    const track = this.state.tracks.find((t) => t.id === trackId);
    if (!track || track.locked) return null;

    const defaultTransform: TransformProps = {
      x: 0,
      y: 0,
      scale: 1.0,
      rotation: 0,
      opacity: 1.0,
    };

    const defaultFilters: FilterProps = {
      brightness: 100,
      contrast: 100,
      saturate: 100,
      hueRotate: 0,
      blur: 0,
      sepia: 0,
      temperature: 0,
    };

    const startTime = clipData.startTime ?? this.state.currentTime;
    const duration = clipData.duration ?? 5.0;

    const newClip: TimelineClip = {
      id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trackId,
      name: clipData.name,
      type: track.type,
      startTime,
      duration,
      mediaOffset: 0,
      mediaDuration: clipData.mediaDuration ?? duration,
      sourceUrl: clipData.sourceUrl,
      thumbnailUrl: clipData.thumbnailUrl,
      mediaType: clipData.mediaType ?? (track.type === 'video' ? 'video' : track.type === 'audio' ? 'audio' : 'text'),
      transform: { ...defaultTransform, ...clipData.transform },
      volume: clipData.volume ?? 100,
      muted: false,
      fadeInDuration: 0,
      fadeOutDuration: 0,
      playbackRate: 1.0,
      filters: { ...defaultFilters, ...clipData.filters },
      effects: clipData.effects ?? [],
      textProps: clipData.textProps,
      keyframes: [],
    };

    track.clips.push(newClip);
    this.state.selectedClipId = newClip.id;
    this.recalculateTotalDuration();
    this.saveHistoryState();
    this.notifyListeners();
    return newClip;
  }

  public moveClip(clipId: string, newStartTime: number, targetTrackId?: string): void {
    let sourceTrack: TimelineTrack | undefined;
    let foundClip: TimelineClip | undefined;

    for (const track of this.state.tracks) {
      const c = track.clips.find((item) => item.id === clipId);
      if (c) {
        sourceTrack = track;
        foundClip = c;
        break;
      }
    }

    if (!foundClip || !sourceTrack) return;

    let targetTrack = sourceTrack;
    if (targetTrackId && targetTrackId !== sourceTrack.id) {
      const t = this.state.tracks.find((tr) => tr.id === targetTrackId);
      if (t && !t.locked) {
        targetTrack = t;
      }
    }

    if (targetTrack.locked) return;

    // Apply Snapping
    let clampedStartTime = Math.max(0, newStartTime);
    if (this.state.snapToGrid) {
      clampedStartTime = this.calculateSnappedTime(clampedStartTime, clipId);
    }

    // Move track reference if changed
    if (targetTrack.id !== sourceTrack.id) {
      sourceTrack.clips = sourceTrack.clips.filter((c) => c.id !== clipId);
      foundClip.trackId = targetTrack.id;
      targetTrack.clips.push(foundClip);
    }

    foundClip.startTime = clampedStartTime;
    this.recalculateTotalDuration();
    this.saveHistoryState();
    this.notifyListeners();
  }

  public trimClip(clipId: string, newStartTime: number, newDuration: number): void {
    const clip = this.getClipById(clipId);
    if (!clip) return;

    const clampedDuration = Math.max(0.2, newDuration);
    clip.startTime = Math.max(0, newStartTime);
    clip.duration = clampedDuration;

    this.recalculateTotalDuration();
    this.saveHistoryState();
    this.notifyListeners();
  }

  public splitClipAtPlayhead(clipId?: string): void {
    const targetClipId = clipId || this.state.selectedClipId;
    if (!targetClipId) return;

    const clip = this.getClipById(targetClipId);
    if (!clip) return;

    const currentTime = this.state.currentTime;
    const clipEnd = clip.startTime + clip.duration;

    if (currentTime <= clip.startTime || currentTime >= clipEnd) return;

    const firstHalfDuration = currentTime - clip.startTime;
    const secondHalfDuration = clip.duration - firstHalfDuration;

    // Update original clip duration
    clip.duration = firstHalfDuration;

    // Create second clip
    const track = this.state.tracks.find((t) => t.id === clip.trackId);
    if (!track) return;

    const splitClip: TimelineClip = JSON.parse(JSON.stringify(clip));
    splitClip.id = `clip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    splitClip.startTime = currentTime;
    splitClip.duration = secondHalfDuration;
    splitClip.mediaOffset = clip.mediaOffset + firstHalfDuration;

    track.clips.push(splitClip);
    this.state.selectedClipId = splitClip.id;

    this.recalculateTotalDuration();
    this.saveHistoryState();
    this.notifyListeners();
  }

  public deleteSelectedClip(): void {
    if (!this.state.selectedClipId) return;

    for (const track of this.state.tracks) {
      if (track.locked) continue;
      const initialLen = track.clips.length;
      track.clips = track.clips.filter((c) => c.id !== this.state.selectedClipId);
      if (track.clips.length !== initialLen) {
        break;
      }
    }

    this.state.selectedClipId = null;
    this.recalculateTotalDuration();
    this.saveHistoryState();
    this.notifyListeners();
  }

  public duplicateSelectedClip(): void {
    if (!this.state.selectedClipId) return;
    const clip = this.getClipById(this.state.selectedClipId);
    if (!clip) return;

    const track = this.state.tracks.find((t) => t.id === clip.trackId);
    if (!track || track.locked) return;

    const dupClip: TimelineClip = JSON.parse(JSON.stringify(clip));
    dupClip.id = `clip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    dupClip.startTime = clip.startTime + clip.duration + 0.2;

    track.clips.push(dupClip);
    this.state.selectedClipId = dupClip.id;
    this.recalculateTotalDuration();
    this.saveHistoryState();
    this.notifyListeners();
  }

  // --- Clip Property Modifications ---
  public updateClipTransform(clipId: string, transform: Partial<TransformProps>): void {
    const clip = this.getClipById(clipId);
    if (clip) {
      clip.transform = { ...clip.transform, ...transform };
      this.saveHistoryState();
      this.notifyListeners();
    }
  }

  public updateClipFilters(clipId: string, filters: Partial<FilterProps>): void {
    const clip = this.getClipById(clipId);
    if (clip) {
      clip.filters = { ...clip.filters, ...filters };
      this.saveHistoryState();
      this.notifyListeners();
    }
  }

  public updateClipTextProps(clipId: string, textProps: Partial<TextProperties>): void {
    const clip = this.getClipById(clipId);
    if (clip && clip.textProps) {
      clip.textProps = { ...clip.textProps, ...textProps };
      this.saveHistoryState();
      this.notifyListeners();
    }
  }

  public addEffectToClip(clipId: string, effect: AppliedEffect): void {
    const clip = this.getClipById(clipId);
    if (clip) {
      clip.effects.push(effect);
      this.saveHistoryState();
      this.notifyListeners();
    }
  }

  public removeEffectFromClip(clipId: string, effectId: string): void {
    const clip = this.getClipById(clipId);
    if (clip) {
      clip.effects = clip.effects.filter((e) => e.id !== effectId);
      this.saveHistoryState();
      this.notifyListeners();
    }
  }

  public setClipTransitionIn(clipId: string, transition: AppliedTransition | undefined): void {
    const clip = this.getClipById(clipId);
    if (clip) {
      clip.transitionIn = transition;
      this.saveHistoryState();
      this.notifyListeners();
    }
  }

  // --- Selection & Current Time ---
  public selectClip(clipId: string | null): void {
    this.state.selectedClipId = clipId;
    this.notifyListeners();
  }

  public setCurrentTime(time: number): void {
    this.state.currentTime = clamp(time, 0, this.state.duration);
    this.notifyListeners();
  }

  // --- Helpers ---
  private getClipById(clipId: string): TimelineClip | undefined {
    for (const track of this.state.tracks) {
      const clip = track.clips.find((c) => c.id === clipId);
      if (clip) return clip;
    }
    return undefined;
  }

  private recalculateTotalDuration(): void {
    let maxTime = 15; // Minimum timeline duration
    for (const track of this.state.tracks) {
      for (const clip of track.clips) {
        maxTime = Math.max(maxTime, clip.startTime + clip.duration + 5);
      }
    }
    this.state.duration = Math.ceil(maxTime);
  }

  private calculateSnappedTime(time: number, ignoreClipId: string): number {
    const snapThreshold = 0.3; // 300ms threshold
    let nearestTime = time;
    let minDiff = snapThreshold;

    // Check playhead
    const playheadDiff = Math.abs(time - this.state.currentTime);
    if (playheadDiff < minDiff) {
      minDiff = playheadDiff;
      nearestTime = this.state.currentTime;
    }

    // Check other clip edges
    for (const track of this.state.tracks) {
      for (const clip of track.clips) {
        if (clip.id === ignoreClipId) continue;

        const startDiff = Math.abs(time - clip.startTime);
        if (startDiff < minDiff) {
          minDiff = startDiff;
          nearestTime = clip.startTime;
        }

        const endDiff = Math.abs(time - (clip.startTime + clip.duration));
        if (endDiff < minDiff) {
          minDiff = endDiff;
          nearestTime = clip.startTime + clip.duration;
        }
      }
    }

    return nearestTime;
  }
}
