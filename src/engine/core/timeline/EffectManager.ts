import { TimelineTrack, TimelineClip, TransformProps, TextProperties, FilterProps, AppliedEffect, AppliedTransition } from '../../types/timeline';

export class EffectManager {
  public constructor() {}

  public _updateClipTransform(
    tracks: TimelineTrack[],
    clipId: string,
    transformPatch: Partial<TransformProps>
  ): void {
    for (const track of tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) {
        clip.transform = { ...clip.transform, ...transformPatch };
        return;
      }
    }
  }

  public _updateClipFilters(
    tracks: TimelineTrack[],
    clipId: string,
    filtersPatch: Partial<FilterProps>
  ): void {
    for (const track of tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) {
        clip.filters = { ...clip.filters, ...filtersPatch };
        return;
      }
    }
  }

  public _updateTextProps(
    tracks: TimelineTrack[],
    clipId: string,
    textPropsPatch: Partial<TextProperties>
  ): void {
    for (const track of tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip && clip.type === 'text') {
        clip.textProps = { ...clip.textProps, ...textPropsPatch } as TextProperties;
        return;
      }
    }
  }

  public _addEffectToClip(
    tracks: TimelineTrack[],
    clipId: string,
    effect: AppliedEffect
  ): void {
    for (const track of tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) {
        clip.effects = clip.effects || [];
        clip.effects = clip.effects.filter(e => e.id !== effect.id);
        clip.effects.push(effect);
        return;
      }
    }
  }

  public _removeEffectFromClip(
    tracks: TimelineTrack[],
    clipId: string,
    effectId: string
  ): void {
    for (const track of tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip && clip.effects) {
        clip.effects = clip.effects.filter(e => e.id !== effectId);
        return;
      }
    }
  }

  public _setTransitionIn(
    tracks: TimelineTrack[],
    clipId: string,
    transition?: AppliedTransition
  ): void {
    for (const track of tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) {
        clip.transitionIn = transition;
        return;
      }
    }
  }

  public _setTransitionOut(
    tracks: TimelineTrack[],
    clipId: string,
    transition?: AppliedTransition
  ): void {
    for (const track of tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) {
        clip.transitionOut = transition;
        return;
      }
    }
  }
}
