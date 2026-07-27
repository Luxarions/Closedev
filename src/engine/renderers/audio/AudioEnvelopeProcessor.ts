import { TimelineClip } from '../../types/timeline';

export class AudioEnvelopeProcessor {
  public constructor() {}

  public _applyAudioEnvelope(gainNode: GainNode, clip: TimelineClip, currentTime: number, ctx: AudioContext): void {
    const baseVolume = (clip.volume / 100) * (clip.muted ? 0 : 1);
    const clipOffset = currentTime - clip.startTime;
    const clipEndOffset = clip.duration - clipOffset;

    let targetVolume = baseVolume;

    // Fade-in envelope
    if (clip.fadeInDuration && clipOffset < clip.fadeInDuration) {
      targetVolume *= clipOffset / clip.fadeInDuration;
    }

    // Fade-out envelope
    if (clip.fadeOutDuration && clipEndOffset < clip.fadeOutDuration) {
      targetVolume *= clipEndOffset / clip.fadeOutDuration;
    }

    gainNode.gain.setTargetAtTime(targetVolume, ctx.currentTime, 0.05);
  }
}
