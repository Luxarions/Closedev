import { TimelineTrack, TimelineClip } from '../types/timeline';
import { AudioContextManager } from './audio/AudioContextManager';
import { AudioBufferLoader } from './audio/AudioBufferLoader';
import { AudioEnvelopeProcessor } from './audio/AudioEnvelopeProcessor';

export class AudioEngine {
  private _contextManager: AudioContextManager;
  private _bufferLoader: AudioBufferLoader;
  private _envelopeProcessor: AudioEnvelopeProcessor;

  private _masterGain: GainNode | null = null;
  private _activeSources: Map<string, { sourceNode: AudioBufferSourceNode; gainNode: GainNode }> = new Map();

  public constructor() {
    this._contextManager = new AudioContextManager();
    this._bufferLoader = new AudioBufferLoader();
    this._envelopeProcessor = new AudioEnvelopeProcessor();
  }

  public getMasterDestination(): AudioNode | null {
    const ctx = this._contextManager._getAudioContext();
    if (!this._masterGain) {
      this._masterGain = ctx.createGain();
      this._masterGain.connect(ctx.destination);
    }
    return this._masterGain;
  }

  public setMasterVolume(volume: number): void {
    const ctx = this._contextManager._getAudioContext();
    const master = this.getMasterDestination() as GainNode;
    if (master) {
      master.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime);
    }
  }

  public async preloadAudioBuffer(url: string): Promise<AudioBuffer | null> {
    if (!url) return null;
    return this._bufferLoader._loadAudioBuffer(url, this._contextManager);
  }

  /**
   * Synchronizes audio playback for all tracks at time t
   */
  public updateAudioAtTime(tracks: TimelineTrack[], currentTime: number, isPlaying: boolean): void {
    const ctx = this._contextManager._getAudioContext();

    if (!isPlaying) {
      this.stopAllAudio();
      return;
    }

    const activeClipIds = new Set<string>();

    for (const track of tracks) {
      if (track.muted || track.hidden) continue;

      for (const clip of track.clips) {
        const clipEnd = clip.startTime + clip.duration;
        if (currentTime >= clip.startTime && currentTime < clipEnd) {
          activeClipIds.add(clip.id);
          this._syncClipAudio(clip, track, currentTime, ctx);
        }
      }
    }

    // Stop nodes that are no longer active
    for (const [clipId, entry] of this._activeSources.entries()) {
      if (!activeClipIds.has(clipId)) {
        try {
          entry.sourceNode.stop();
        } catch {}
        this._activeSources.delete(clipId);
      }
    }
  }

  public stopAllAudio(): void {
    for (const entry of this._activeSources.values()) {
      try {
        entry.sourceNode.stop();
      } catch {}
    }
    this._activeSources.clear();
  }

  private _syncClipAudio(clip: TimelineClip, track: TimelineTrack, currentTime: number, ctx: AudioContext): void {
    if (clip.muted || clip.volume === 0 || !clip.sourceUrl) return;

    // Check if source node already running for this clip
    if (this._activeSources.has(clip.id)) {
      const entry = this._activeSources.get(clip.id)!;
      this._envelopeProcessor._applyAudioEnvelope(entry.gainNode, clip, currentTime, ctx);
      return;
    }

    // Start playing buffer
    this.preloadAudioBuffer(clip.sourceUrl).then(buffer => {
      if (!buffer) return;

      try {
        const sourceNode = ctx.createBufferSource();
        sourceNode.buffer = buffer;
        sourceNode.playbackRate.value = clip.playbackRate || 1.0;

        const gainNode = ctx.createGain();
        this._envelopeProcessor._applyAudioEnvelope(gainNode, clip, currentTime, ctx);

        sourceNode.connect(gainNode);
        const master = this.getMasterDestination();
        if (master) {
          gainNode.connect(master);
        } else {
          gainNode.connect(ctx.destination);
        }

        const clipOffset = currentTime - clip.startTime + clip.mediaOffset;
        sourceNode.start(0, clipOffset);

        this._activeSources.set(clip.id, { sourceNode, gainNode });
      } catch (e) {
        console.warn('Gagal memutar audio clip:', e);
      }
    });
  }

  public dispose(): void {
    this.stopAllAudio();
    this._contextManager._close();
  }
}
