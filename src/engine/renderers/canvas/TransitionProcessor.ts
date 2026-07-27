import { TimelineClip } from '../../types/timeline';

export class TransitionProcessor {
  public constructor() {}

  public _applyTransitions(
    ctx: CanvasRenderingContext2D,
    clip: TimelineClip,
    timelineTime: number,
    canvasW: number,
    canvasH: number
  ): void {
    if (!clip.transitionIn) return;

    const transition = clip.transitionIn;
    const transitionEnd = clip.startTime + transition.duration;

    if (timelineTime >= clip.startTime && timelineTime <= transitionEnd) {
      const progress = (timelineTime - clip.startTime) / transition.duration;

      if (transition.transitionTypeId === 'fade' || transition.name.toLowerCase().includes('fade')) {
        ctx.globalAlpha *= progress;
      } else if (transition.transitionTypeId === 'dissolve' || transition.name.toLowerCase().includes('dissolve')) {
        ctx.globalAlpha *= Math.min(1, progress * 1.2);
      } else if (transition.transitionTypeId === 'wipe_left' || transition.name.toLowerCase().includes('wipe')) {
        ctx.beginPath();
        ctx.rect(-canvasW / 2, -canvasH / 2, canvasW * progress, canvasH);
        ctx.clip();
      } else if (transition.transitionTypeId === 'zoom' || transition.name.toLowerCase().includes('zoom')) {
        const scale = 0.5 + progress * 0.5;
        ctx.scale(scale, scale);
      }
    }
  }
}
