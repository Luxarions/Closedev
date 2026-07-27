import { TimelineTrack, TimelineClip, AspectRatio, ASPECT_RATIOS } from '../types/timeline';
import { buildCssFilterString } from '../utils/colorUtils';
import { MediaDrawer } from './canvas/MediaDrawer';
import { TextDrawer } from './canvas/TextDrawer';
import { EffectProcessor } from './canvas/EffectProcessor';
import { TransitionProcessor } from './canvas/TransitionProcessor';
import { SelectionOverlay } from './canvas/SelectionOverlay';

export class CanvasRenderer {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;

  // Sub-module rendering delegates
  private _mediaDrawer: MediaDrawer;
  private _textDrawer: TextDrawer;
  private _effectProcessor: EffectProcessor;
  private _transitionProcessor: TransitionProcessor;
  private _selectionOverlay: SelectionOverlay;

  public constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error('Canvas 2D Context could not be created.');
    }
    this._ctx = context;

    // Instantiate sub-module renderers
    this._mediaDrawer = new MediaDrawer();
    this._textDrawer = new TextDrawer();
    this._effectProcessor = new EffectProcessor();
    this._transitionProcessor = new TransitionProcessor();
    this._selectionOverlay = new SelectionOverlay();
  }

  public resizeCanvas(aspectRatio: AspectRatio, targetWidth?: number): void {
    const config = ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS['16:9'];
    const w = targetWidth || config.width;
    const h = Math.round(w / config.ratio);

    if (this._canvas.width !== w || this._canvas.height !== h) {
      this._canvas.width = w;
      this._canvas.height = h;
    }
  }

  public getCanvas(): HTMLCanvasElement {
    return this._canvas;
  }

  /**
   * Main composition draw call for frame at time currentTime
   */
  public renderFrame(
    tracks: TimelineTrack[],
    currentTime: number,
    aspectRatio: AspectRatio,
    selectedClipId?: string | null
  ): void {
    const w = this._canvas.width;
    const h = this._canvas.height;

    // Clear background
    this._ctx.fillStyle = '#0a0a0c';
    this._ctx.fillRect(0, 0, w, h);

    // Sort tracks by order bottom to top
    const sortedTracks = [...tracks].sort((a, b) => a.order - b.order);

    for (const track of sortedTracks) {
      if (track.hidden) continue;

      for (const clip of track.clips) {
        const clipEnd = clip.startTime + clip.duration;

        // Check if clip is active at current timeline time
        if (currentTime >= clip.startTime && currentTime < clipEnd) {
          const clipTime = currentTime - clip.startTime + clip.mediaOffset;
          this._renderClip(clip, clipTime, currentTime, w, h, selectedClipId === clip.id);
        }
      }
    }
  }

  private _renderClip(
    clip: TimelineClip,
    clipTime: number,
    timelineTime: number,
    canvasW: number,
    canvasH: number,
    isSelected: boolean
  ): void {
    this._ctx.save();

    // 1. Position & Transform
    const transform = clip.transform;
    const centerX = canvasW / 2 + transform.x;
    const centerY = canvasH / 2 + transform.y;

    this._ctx.translate(centerX, centerY);
    if (transform.rotation) {
      this._ctx.rotate((transform.rotation * Math.PI) / 180);
    }
    this._ctx.scale(transform.scale, transform.scale);
    this._ctx.globalAlpha = transform.opacity;

    // 2. Color Filter Adjustment
    if (clip.filters) {
      this._ctx.filter = buildCssFilterString(clip.filters);
    }

    // 3. Render content based on type
    if (clip.type === 'video' || clip.type === 'sticker') {
      this._mediaDrawer._drawMediaClip(this._ctx, clip, clipTime, canvasW, canvasH);
    } else if (clip.type === 'text') {
      this._textDrawer._drawTextClip(this._ctx, clip, clipTime);
    }

    // 4. Reset filter for overlay effects
    this._ctx.filter = 'none';

    // 5. Apply CapCut Effects
    this._effectProcessor._applyEffects(this._ctx, clip, timelineTime, canvasW, canvasH);

    // 6. Apply Transition Blending
    this._transitionProcessor._applyTransitions(this._ctx, clip, timelineTime, canvasW, canvasH);

    // 7. Render Selection bounding box highlight if selected
    if (isSelected) {
      this._selectionOverlay._drawSelectionOutline(this._ctx, clip, canvasW, canvasH);
    }

    this._ctx.restore();
  }
}
