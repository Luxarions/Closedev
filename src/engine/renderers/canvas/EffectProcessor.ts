import { TimelineClip } from '../../types/timeline';

export class EffectProcessor {
  public constructor() {}

  public _applyEffects(
    ctx: CanvasRenderingContext2D,
    clip: TimelineClip,
    timelineTime: number,
    canvasW: number,
    canvasH: number
  ): void {
    if (!clip.effects || clip.effects.length === 0) return;

    for (const effect of clip.effects) {
      if (effect.effectTypeId === 'blur' || effect.name.toLowerCase().includes('blur')) {
        const intensity = (effect.intensity || 50) / 10;
        ctx.filter = `blur(${intensity}px)`;
      } else if (effect.effectTypeId === 'glitch' || effect.name.toLowerCase().includes('glitch')) {
        if (Math.random() > 0.6) {
          const shiftX = (Math.random() - 0.5) * 20;
          const shiftY = (Math.random() - 0.5) * 20;
          ctx.drawImage(
            ctx.canvas,
            0,
            0,
            canvasW,
            canvasH,
            shiftX,
            shiftY,
            canvasW,
            canvasH
          );
        }
      } else if (effect.effectTypeId === 'vintage' || effect.name.toLowerCase().includes('vintage')) {
        ctx.fillStyle = 'rgba(255, 200, 100, 0.15)';
        ctx.fillRect(-canvasW / 2, -canvasH / 2, canvasW, canvasH);
      } else if (effect.effectTypeId === 'blackwhite' || effect.name.toLowerCase().includes('blackwhite')) {
        ctx.filter = 'grayscale(100%)';
      } else if (effect.effectTypeId === 'vignette' || effect.name.toLowerCase().includes('vignette')) {
        const gradient = ctx.createRadialGradient(0, 0, canvasW * 0.3, 0, 0, canvasW * 0.7);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = gradient;
        ctx.fillRect(-canvasW / 2, -canvasH / 2, canvasW, canvasH);
      }
    }
  }
}
