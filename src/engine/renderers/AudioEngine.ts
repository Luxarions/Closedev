import { TimelineTrack, TimelineClip } from '../types/timeline';

export class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeSources: Map<string, { sourceNode: AudioBufferSourceNode | MediaElementAudioSourceNode; gainNode: GainNode }> = new Map();
  private audioBufferCache: Map<string, AudioBuffer> = new Map();

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private _initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public getMasterDestination(): AudioNode | null {
    if (!this.audioCtx || !this.masterGain) return null;
    return this.masterGain;
  }

  public setMasterVolume(volume: number): void {
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.audioCtx.currentTime);
    }
  }

  public async preloadAudioBuffer(url: string): Promise<AudioBuffer | null> {
    if (!url) return null;
    if (this.audioBufferCache.has(url)) {
      return this.audioBufferCache.get(url)!;
    }

    try {
      const ctx = this._initAudioContext();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.audioBufferCache.set(url, decodedBuffer);
      return decodedBuffer;
    } catch {
      return null;
    }
  }

  /**
   * Synchronizes audio playback for all tracks at time t
   */
  public updateAudioAtTime(tracks: TimelineTrack[], currentTime: number, isPlaying: boolean): void {
    const ctx = this._initAudioContext();

    if (!isPlaying) {
      this.stopAllAudio();
      return;
    }

    // Collect active audio clips at currentTime
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

    // Stop audio for clips no longer active
    for (const [clipId, entry] of this.activeSources.entries()) {
      if (!activeClipIds.has(clipId)) {
        try {
          if ('stop' in entry.sourceNode) {
            entry.sourceNode.stop();
          }
          entry.sourceNode.disconnect();
        } catch {
          // ignore
        }
        this.activeSources.delete(clipId);
      }
    }
  }

  private _syncClipAudio(clip: TimelineClip, track: TimelineTrack, currentTime: number, ctx: AudioContext): void {
    if (clip.muted || clip.volume === 0 || !clip.sourceUrl) return;

    // Check if source node already running for this clip
    if (this.activeSources.has(clip.id)) {
      // Adjust volume / envelope
      const entry = this.activeSources.get(clip.id)!;
      this._applyAudioEnvelope(entry.gainNode, clip, currentTime, ctx);
      return;
    }

    // Attempt to start buffer audio
    const buffer = this.audioBufferCache.get(clip.sourceUrl);
    if (buffer) {
      try {
        const sourceNode = ctx.createBufferSource();
        sourceNode.buffer = buffer;
        sourceNode.playbackRate.value = clip.playbackRate || 1.0;

        const gainNode = ctx.createGain();
        this._applyAudioEnvelope(gainNode, clip, currentTime, ctx);

        sourceNode.connect(gainNode);
        if (this.masterGain) {
          gainNode.connect(this.masterGain);
        } else {
          gainNode.connect(ctx.destination);
        }

        const offsetInClip = currentTime - clip.startTime;
        const bufferOffset = clip.mediaOffset + offsetInClip;

        if (bufferOffset >= 0 && bufferOffset < buffer.duration) {
          sourceNode.start(0, bufferOffset);
          this.activeSources.set(clip.id, { sourceNode, gainNode });
        }
      } catch {
        // Source start error
      }
    } else {
      // Preload buffer for next tick
      this.preloadAudioBuffer(clip.sourceUrl);
    }
  }

  private _applyAudioEnvelope(gainNode: GainNode, clip: TimelineClip, currentTime: number, ctx: AudioContext): void {
    const baseVolume = (clip.volume / 100) * (clip.muted ? 0 : 1);
    const clipOffset = currentTime - clip.startTime;
    const clipEndOffset = clip.duration - clipOffset;

    let envelopeMult = 1.0;

    // Fade In
    if (clip.fadeInDuration > 0 && clipOffset < clip.fadeInDuration) {
      envelopeMult = Math.max(0, clipOffset / clip.fadeInDuration);
    }

    // Fade Out
    if (clip.fadeOutDuration > 0 && clipEndOffset < clip.fadeOutDuration) {
      envelopeMult = Math.min(envelopeMult, Math.max(0, clipEndOffset / clip.fadeOutDuration));
    }

    const finalGain = baseVolume * envelopeMult;
    gainNode.gain.setValueAtTime(finalGain, ctx.currentTime);
  }

  public stopAllAudio(): void {
    for (const entry of this.activeSources.values()) {
      try {
        if ('stop' in entry.sourceNode) {
          entry.sourceNode.stop();
        }
        entry.sourceNode.disconnect();
      } catch {
        // ignore
      }
    }
    this.activeSources.clear();
  }
}
