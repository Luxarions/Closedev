import {
  EngineState,
  ProjectSettings,
  TimelineTrack,
  TimelineClip,
  TrackType,
  TextProperties,
  TransformProps,
  FilterProps,
  AppliedEffect,
  AppliedTransition,
  AspectRatio,
} from '../types/timeline';
import { clamp } from '../utils/timecodeUtils';
import { HistoryManager } from './timeline/HistoryManager';
import { SnappingManager } from './timeline/SnappingManager';
import { TrackManager } from './timeline/TrackManager';
import { ClipManager } from './timeline/ClipManager';
import { EffectManager } from './timeline/EffectManager';

type EventListener = (state: EngineState) => void;

export class TimelineEngine {
  private _state: EngineState;
  private _listeners: Set<EventListener> = new Set();
  
  // Sub-modules (Dependency Injection & Orchestration)
  private _historyManager: HistoryManager;
  private _snappingManager: SnappingManager;
  private _trackManager: TrackManager;
  private _clipManager: ClipManager;
  private _effectManager: EffectManager;

  public constructor(initialSettings?: Partial<ProjectSettings>) {
    const defaultProject: ProjectSettings = {
      title: 'Proyek CapCut Baru',
      aspectRatio: '16:9',
      fps: 30,
      sampleRate: 44100,
      backgroundColor: '#0a0a0c',
      ...initialSettings,
    };

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

    this._state = {
      project: defaultProject,
      tracks: defaultTracks,
      currentTime: 0,
      duration: 15,
      isPlaying: false,
      selectedClipId: null,
      selectedTrackId: null,
      selectedTransitionId: null,
      selectedEffectId: null,
      zoomLevel: 60,
      snapToGrid: true,
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
    };

    // Instantiate Sub-modules
    this._historyManager = new HistoryManager();
    this._snappingManager = new SnappingManager(0.15);
    this._trackManager = new TrackManager();
    this._clipManager = new ClipManager();
    this._effectManager = new EffectManager();

    this._saveHistoryState();
  }

  // --- Subscriptions ---
  public subscribe(listener: EventListener): () => void {
    this._listeners.add(listener);
    listener(this.getState());
    return () => this._listeners.delete(listener);
  }

  private _notify(): void {
    this._recalculateDuration();
    const currentState = this.getState();
    for (const listener of this._listeners) {
      listener(currentState);
    }
  }

  public getState(): EngineState {
    return JSON.parse(JSON.stringify(this._state));
  }

  private _saveHistoryState(): void {
    this._historyManager._pushSnapshot(this._state);
  }

  public undo(): void {
    const restored = this._historyManager._undo(this._state);
    if (restored) {
      this._state = restored;
      this._notify();
    }
  }

  public redo(): void {
    const restored = this._historyManager._redo(this._state);
    if (restored) {
      this._state = restored;
      this._notify();
    }
  }

  // --- Project Settings ---
  public setProjectTitle(title: string): void {
    this._state.project.title = title;
    this._notify();
  }

  public setAspectRatio(aspectRatio: AspectRatio): void {
    this._state.project.aspectRatio = aspectRatio;
    this._notify();
  }

  // --- Playhead & Timeline Controls ---
  public setCurrentTime(time: number): void {
    const clamped = clamp(time, 0, this._state.duration);
    this._state.currentTime = clamped;
    this._notify();
  }

  public setPlaying(isPlaying: boolean): void {
    this._state.isPlaying = isPlaying;
    this._notify();
  }

  public setZoomLevel(zoom: number): void {
    this._state.zoomLevel = clamp(zoom, 10, 300);
    this._notify();
  }

  public setSnapToGrid(enabled: boolean): void {
    this._state.snapToGrid = enabled;
    this._notify();
  }

  public toggleSnapToGrid(): void {
    this._state.snapToGrid = !this._state.snapToGrid;
    this._notify();
  }

  public selectClip(clipId: string | null): void {
    this._state.selectedClipId = clipId;
    if (clipId) {
      const track = this._trackManager._findTrackForClip(this._state.tracks, clipId);
      this._state.selectedTrackId = track ? track.id : null;
    }
    this._notify();
  }

  public selectTrack(trackId: string | null): void {
    this._state.selectedTrackId = trackId;
    this._notify();
  }

  // --- Track Management ---
  public addTrack(type: TrackType, name?: string): TimelineTrack {
    const newTrack = this._trackManager._addTrack(this._state.tracks, type, name);
    this._saveHistoryState();
    this._notify();
    return newTrack;
  }

  public removeTrack(trackId: string): void {
    this._state.tracks = this._trackManager._removeTrack(this._state.tracks, trackId);
    if (this._state.selectedTrackId === trackId) {
      this._state.selectedTrackId = null;
    }
    this._saveHistoryState();
    this._notify();
  }

  public toggleMuteTrack(trackId: string): void {
    this._trackManager._toggleMuteTrack(this._state.tracks, trackId);
    this._notify();
  }

  public toggleTrackMute(trackId: string): void {
    this.toggleMuteTrack(trackId);
  }

  public toggleLockTrack(trackId: string): void {
    this._trackManager._toggleLockTrack(this._state.tracks, trackId);
    this._notify();
  }

  public toggleTrackLock(trackId: string): void {
    this.toggleLockTrack(trackId);
  }

  public toggleHideTrack(trackId: string): void {
    this._trackManager._toggleHideTrack(this._state.tracks, trackId);
    this._notify();
  }

  public toggleTrackHide(trackId: string): void {
    this.toggleHideTrack(trackId);
  }

  public reorderTracks(sourceIndex: number, targetIndex: number): void {
    this._trackManager._reorderTracks(this._state.tracks, sourceIndex, targetIndex);
    this._saveHistoryState();
    this._notify();
  }

  // --- Clip Management ---
  public addClipToTrack(targetTrackId: string, clipData: Partial<TimelineClip> & { name: string }): TimelineClip {
    const clip = this._clipManager._addClip(this._state.tracks, targetTrackId, clipData);
    this._state.selectedClipId = clip.id;
    this._saveHistoryState();
    this._notify();
    return clip;
  }

  public moveClip(clipId: string, targetTrackId: string, newStartTime: number): void {
    let finalStartTime = newStartTime;
    if (this._state.snapToGrid) {
      const snapResult = this._snappingManager._findSnapPosition(
        newStartTime,
        this._state.tracks,
        this._state.currentTime,
        clipId
      );
      finalStartTime = snapResult.time;
    }

    this._clipManager._moveClip(this._state.tracks, clipId, targetTrackId, finalStartTime);
    this._saveHistoryState();
    this._notify();
  }

  public trimClip(clipId: string, newStartTime: number, newDuration: number, newMediaOffset?: number): void {
    this._clipManager._trimClip(this._state.tracks, clipId, newStartTime, newDuration, newMediaOffset);
    this._saveHistoryState();
    this._notify();
  }

  public splitClipAtPlayhead(clipId?: string): TimelineClip[] {
    const targetClipId = clipId || this._state.selectedClipId;
    if (!targetClipId) return [];

    const splitClips = this._clipManager._splitClip(this._state.tracks, targetClipId, this._state.currentTime);
    if (splitClips.length > 1) {
      this._state.selectedClipId = splitClips[1].id;
      this._saveHistoryState();
      this._notify();
    }
    return splitClips;
  }

  public deleteClip(clipId?: string): void {
    const idToDelete = clipId || this._state.selectedClipId;
    if (!idToDelete) return;

    this._clipManager._deleteClip(this._state.tracks, idToDelete);
    if (this._state.selectedClipId === idToDelete) {
      this._state.selectedClipId = null;
    }
    this._saveHistoryState();
    this._notify();
  }

  public deleteSelectedClip(): void {
    this.deleteClip();
  }

  public duplicateClip(clipId?: string): TimelineClip | undefined {
    const idToDup = clipId || this._state.selectedClipId;
    if (!idToDup) return undefined;

    const duplicated = this._clipManager._duplicateClip(this._state.tracks, idToDup);
    if (duplicated) {
      this._state.selectedClipId = duplicated.id;
      this._saveHistoryState();
      this._notify();
    }
    return duplicated;
  }

  public duplicateSelectedClip(): TimelineClip | undefined {
    return this.duplicateClip();
  }

  // --- Effects & Transformations ---
  public updateClipTransform(clipId: string, transformPatch: Partial<TransformProps>): void {
    this._effectManager._updateClipTransform(this._state.tracks, clipId, transformPatch);
    this._notify();
  }

  public updateClipFilters(clipId: string, filterPatch: Partial<FilterProps>): void {
    this._effectManager._updateClipFilters(this._state.tracks, clipId, filterPatch);
    this._notify();
  }

  public updateTextProps(clipId: string, textPropsPatch: Partial<TextProperties>): void {
    this._effectManager._updateTextProps(this._state.tracks, clipId, textPropsPatch);
    this._notify();
  }

  public updateClipTextProps(clipId: string, textPropsPatch: Partial<TextProperties>): void {
    this.updateTextProps(clipId, textPropsPatch);
  }

  public addEffectToClip(clipId: string, effect: AppliedEffect): void {
    this._effectManager._addEffectToClip(this._state.tracks, clipId, effect);
    this._saveHistoryState();
    this._notify();
  }

  public removeEffectFromClip(clipId: string, effectId: string): void {
    this._effectManager._removeEffectFromClip(this._state.tracks, clipId, effectId);
    this._saveHistoryState();
    this._notify();
  }

  public setTransitionIn(clipId: string, transition?: AppliedTransition): void {
    this._effectManager._setTransitionIn(this._state.tracks, clipId, transition);
    this._saveHistoryState();
    this._notify();
  }

  public setClipTransitionIn(clipId: string, transition?: AppliedTransition): void {
    this.setTransitionIn(clipId, transition);
  }

  public setTransitionOut(clipId: string, transition?: AppliedTransition): void {
    this._effectManager._setTransitionOut(this._state.tracks, clipId, transition);
    this._saveHistoryState();
    this._notify();
  }

  private _recalculateDuration(): void {
    let maxTime = 15;
    for (const track of this._state.tracks) {
      for (const clip of track.clips) {
        const clipEnd = clip.startTime + clip.duration;
        if (clipEnd > maxTime) {
          maxTime = clipEnd;
        }
      }
    }
    this._state.duration = Math.ceil(maxTime + 5);
  }
}
