import { TimelineClip } from '../../types/timeline';

export class SelectionOverlay {
  public constructor() {}

  public _drawSelectionOutline(
    ctx: CanvasRenderingContext2D,
    clip: TimelineClip,
    canvasW: number,
    canvasH: number
  ): void {
    const boxW = canvasW;
    const boxH = canvasH;

    ctx.strokeStyle = '#00F2FE';
    ctx.lineWidth = 3;
    ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);

    // Corner transform handles
    const handleSize = 10;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#00F2FE';
    ctx.lineWidth = 2;

    const corners = [
      { x: -boxW / 2, y: -boxH / 2 },
      { x: boxW / 2, y: -boxH / 2 },
      { x: -boxW / 2, y: boxH / 2 },
      { x: boxW / 2, y: boxH / 2 }
    ];

    for (const corner of corners) {
      ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
    }
  }
}
