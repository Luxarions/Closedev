import { TimelineClip } from '../../types/timeline';

export class TextDrawer {
  public constructor() {}

  public _drawTextClip(
    ctx: CanvasRenderingContext2D,
    clip: TimelineClip,
    clipTime: number
  ): void {
    const props = clip.textProps;
    if (!props) return;

    let displayText = props.content || 'Teks Baru';

    // Typewriter animation
    if (props.animationStyle === 'typewriter') {
      const charsToShow = Math.min(
        displayText.length,
        Math.floor(clipTime * 15)
      );
      displayText = displayText.substring(0, charsToShow);
    }

    const fontStyle = `${props.bold ? 'bold' : ''} ${props.italic ? 'italic' : ''}`.trim() || 'normal';
    ctx.font = `${fontStyle} ${props.fontSize || 48}px "${props.fontFamily || 'Inter'}", sans-serif`;
    ctx.textAlign = (props.align || 'center') as CanvasTextAlign;
    ctx.textBaseline = 'middle';

    // Draw background box
    if (props.backgroundColor) {
      const metrics = ctx.measureText(displayText);
      const textWidth = metrics.width;
      const textHeight = (props.fontSize || 48) * 1.2;
      ctx.fillStyle = props.backgroundColor;
      ctx.fillRect(-textWidth / 2 - 16, -textHeight / 2, textWidth + 32, textHeight);
    }

    // Draw stroke / outline
    if (props.strokeColor && props.strokeWidth) {
      ctx.strokeStyle = props.strokeColor;
      ctx.lineWidth = props.strokeWidth;
      ctx.strokeText(displayText, 0, 0);
    }

    // Draw shadow
    if (props.shadowColor) {
      ctx.shadowColor = props.shadowColor;
      ctx.shadowBlur = props.shadowBlur || 8;
      ctx.shadowOffsetX = props.shadowOffsetX || 2;
      ctx.shadowOffsetY = props.shadowOffsetY || 2;
    }

    // Draw main text
    ctx.fillStyle = props.color || '#FFFFFF';
    ctx.fillText(displayText, 0, 0);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
}
