import { TimelineTrack, TimelineClip, AspectRatio, ASPECT_RATIOS } from '../types/timeline';
import { buildCssFilterString } from '../utils/colorUtils';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private videoElementCache: Map<string, HTMLVideoElement> = new Map();
  private imageElementCache: Map<string, HTMLImageElement> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error('Canvas 2D Context could not be created.');
    }
    this.ctx = context;
  }

  public resizeCanvas(aspectRatio: AspectRatio, targetWidth?: number): void {
    const config = ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS['16:9'];
    const w = targetWidth || config.width;
    const h = Math.round(w / config.ratio);

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
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
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear background
    this.ctx.fillStyle = '#0a0a0c';
    this.ctx.fillRect(0, 0, w, h);

    // Sort tracks by order bottom to top
    const sortedTracks = [...tracks].sort((a, b) => a.order - b.order);

    for (const track of sortedTracks) {
      if (track.hidden) continue;

      for (const clip of track.clips) {
        const clipEnd = clip.startTime + clip.duration;

        // Check if clip is active at current timeline time
        if (currentTime >= clip.startTime && currentTime < clipEnd) {
          const clipTime = currentTime - clip.startTime + clip.mediaOffset;
          this.renderClip(clip, clipTime, currentTime, w, h, selectedClipId === clip.id);
        }
      }
    }
  }

  private renderClip(
    clip: TimelineClip,
    clipTime: number,
    timelineTime: number,
    canvasW: number,
    canvasH: number,
    isSelected: boolean
  ): void {
    this.ctx.save();

    // 1. Calculate Transform Position
    const centerX = canvasW / 2 + clip.transform.x;
    const centerY = canvasH / 2 + clip.transform.y;

    this.ctx.translate(centerX, centerY);
    if (clip.transform.rotation !== 0) {
      this.ctx.rotate((clip.transform.rotation * Math.PI) / 180);
    }
    const scale = clip.transform.scale;
    this.ctx.scale(scale, scale);
    this.ctx.globalAlpha = Math.max(0, Math.min(1, clip.transform.opacity));

    // 2. Apply CSS Filters
    const filterString = buildCssFilterString(clip.filters);
    if (filterString !== 'none') {
      this.ctx.filter = filterString;
    }

    // 3. Render content based on type
    if (clip.type === 'video' || clip.type === 'sticker') {
      this.drawMediaClip(clip, clipTime, canvasW, canvasH);
    } else if (clip.type === 'text') {
      this.drawTextClip(clip, clipTime);
    }

    // 4. Reset filter for overlay effects
    this.ctx.filter = 'none';

    // 5. Apply CapCut Effects
    this.applyEffects(clip, timelineTime, canvasW, canvasH);

    // 6. Apply Transition Blending
    this.applyTransitions(clip, timelineTime, canvasW, canvasH);

    // 7. Render Selection bounding box highlight if selected
    if (isSelected) {
      this.drawSelectionOutline(clip, canvasW, canvasH);
    }

    this.ctx.restore();
  }

  private drawMediaClip(clip: TimelineClip, clipTime: number, canvasW: number, canvasH: number): void {
    if (!clip.sourceUrl) return;

    if (clip.mediaType === 'image' || clip.type === 'sticker') {
      let img = this.imageElementCache.get(clip.sourceUrl);
      if (!img) {
        img = new Image();
        img.src = clip.sourceUrl;
        this.imageElementCache.set(clip.sourceUrl, img);
      }
      if (img.complete && img.naturalWidth > 0) {
        const aspect = img.naturalWidth / img.naturalHeight;
        let drawW = canvasW;
        let drawH = canvasW / aspect;
        if (drawH < canvasH) {
          drawH = canvasH;
          drawW = canvasH * aspect;
        }
        if (clip.type === 'sticker') {
          drawW = 200;
          drawH = 200;
        }
        this.ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      }
    } else {
      // Video clip
      let video = this.videoElementCache.get(clip.sourceUrl);
      if (!video) {
        video = document.createElement('video');
        video.src = clip.sourceUrl;
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        this.videoElementCache.set(clip.sourceUrl, video);
      }

      if (video.readyState >= 2) {
        const targetVideoTime = clipTime % (video.duration || clip.duration || 10);
        if (Math.abs(video.currentTime - targetVideoTime) > 0.2) {
          video.currentTime = targetVideoTime;
        }
        const aspect = (video.videoWidth || 16) / (video.videoHeight || 9);
        let drawW = canvasW;
        let drawH = canvasW / aspect;
        if (drawH < canvasH) {
          drawH = canvasH;
          drawW = canvasH * aspect;
        }
        this.ctx.drawImage(video, -drawW / 2, -drawH / 2, drawW, drawH);
      } else {
        // Draw loading placeholder card
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(-canvasW / 2, -canvasH / 2, canvasW, canvasH);
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '20px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Memuat ${clip.name}...`, 0, 0);
      }
    }
  }

  private drawTextClip(clip: TimelineClip, clipTime: number): void {
    const props = clip.textProps;
    if (!props) return;

    let displayText = props.content;

    // Handle Animations
    if (props.animationStyle === 'typewriter') {
      const charCount = Math.floor(clipTime * 12);
      displayText = props.content.substring(0, charCount);
    } else if (props.animationStyle === 'bounce') {
      const bounce = Math.abs(Math.sin(clipTime * 4)) * 12;
      this.ctx.translate(0, -bounce);
    } else if (props.animationStyle === 'slideUp') {
      const slide = Math.max(0, 100 - clipTime * 150);
      this.ctx.translate(0, slide);
    }

    const fontStyle = `${props.italic ? 'italic ' : ''}${props.bold ? 'bold ' : ''}${props.fontSize}px ${props.fontFamily}`;
    this.ctx.font = fontStyle;
    this.ctx.textAlign = props.align;
    this.ctx.textBaseline = 'middle';

    const metrics = this.ctx.measureText(displayText);
    const textWidth = metrics.width;
    const textHeight = props.fontSize * 1.2;

    // Background box
    if (props.backgroundColor && props.backgroundColor !== 'transparent') {
      this.ctx.fillStyle = props.backgroundColor;
      this.ctx.fillRect(-textWidth / 2 - 16, -textHeight / 2 - 8, textWidth + 32, textHeight + 16);
    }

    // Glow Effect
    if (props.animationStyle === 'glow') {
      this.ctx.shadowColor = props.color;
      this.ctx.shadowBlur = 20 + Math.sin(clipTime * 6) * 10;
    }

    // Text Stroke
    if (props.strokeColor && props.strokeWidth) {
      this.ctx.strokeStyle = props.strokeColor;
      this.ctx.lineWidth = props.strokeWidth;
      this.ctx.strokeText(displayText, 0, 0);
    }

    // Text Fill
    this.ctx.fillStyle = props.color;
    this.ctx.fillText(displayText, 0, 0);
  }

  private applyEffects(clip: TimelineClip, timelineTime: number, canvasW: number, canvasH: number): void {
    if (!clip.effects || clip.effects.length === 0) return;

    for (const effect of clip.effects) {
      const intensity = effect.intensity / 100;

      if (effect.effectTypeId === 'vhs_glitch') {
        // VHS Glitch lines
        this.ctx.fillStyle = 'rgba(255, 0, 85, 0.15)';
        const lineY = (Math.sin(timelineTime * 15) * canvasH) / 2;
        this.ctx.fillRect(-canvasW / 2, lineY, canvasW, 6 * intensity);

        // Scanlines
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        for (let y = -canvasH / 2; y < canvasH / 2; y += 8) {
          this.ctx.fillRect(-canvasW / 2, y, canvasW, 2);
        }
      } else if (effect.effectTypeId === 'rgb_split') {
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillStyle = `rgba(255, 0, 0, ${0.3 * intensity})`;
        const shiftX = Math.sin(timelineTime * 10) * 12 * intensity;
        this.ctx.fillRect(-canvasW / 2 + shiftX, -canvasH / 2, canvasW, canvasH);
        this.ctx.globalCompositeOperation = 'source-over';
      } else if (effect.effectTypeId === 'neon_glow') {
        this.ctx.shadowColor = '#00f0ff';
        this.ctx.shadowBlur = 30 * intensity;
      } else if (effect.effectTypeId === 'vignette_dark') {
        const grad = this.ctx.createRadialGradient(0, 0, canvasW * 0.2, 0, 0, canvasW * 0.7);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, `rgba(0,0,0,${0.85 * intensity})`);
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(-canvasW / 2, -canvasH / 2, canvasW, canvasH);
      } else if (effect.effectTypeId === 'light_leak') {
        const leakX = Math.cos(timelineTime * 2) * canvasW * 0.4;
        const grad = this.ctx.createRadialGradient(leakX, -canvasH * 0.3, 10, leakX, -canvasH * 0.3, canvasW * 0.6);
        grad.addColorStop(0, `rgba(255, 180, 50, ${0.4 * intensity})`);
        grad.addColorStop(1, 'rgba(255, 180, 50, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(-canvasW / 2, -canvasH / 2, canvasW, canvasH);
      }
    }
  }

  private applyTransitions(clip: TimelineClip, timelineTime: number, canvasW: number, canvasH: number): void {
    if (!clip.transitionIn) return;

    const transition = clip.transitionIn;
    const progress = (timelineTime - clip.startTime) / transition.duration;

    if (progress >= 0 && progress <= 1) {
      if (transition.transitionTypeId === 'fade_to_black') {
        const blackAlpha = Math.sin(progress * Math.PI);
        this.ctx.fillStyle = `rgba(0, 0, 0, ${blackAlpha})`;
        this.ctx.fillRect(-canvasW / 2, -canvasH / 2, canvasW, canvasH);
      } else if (transition.transitionTypeId === 'cross_dissolve') {
        this.ctx.globalAlpha = progress;
      } else if (transition.transitionTypeId === 'glitch_flash') {
        if (Math.random() > 0.5) {
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          this.ctx.fillRect(-canvasW / 2, -canvasH / 2, canvasW, canvasH);
        }
      } else if (transition.transitionTypeId === 'slide_push_left') {
        const slideX = (1 - progress) * canvasW;
        this.ctx.translate(-slideX, 0);
      }
    }
  }

  private drawSelectionOutline(clip: TimelineClip, canvasW: number, canvasH: number): void {
    const boxW = canvasW;
    const boxH = canvasH;

    this.ctx.strokeStyle = '#3b82f6';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);

    // Corner Handles
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#2563eb';
    this.ctx.lineWidth = 2;
    const handleSize = 10;

    const corners = [
      [-boxW / 2, -boxH / 2],
      [boxW / 2, -boxH / 2],
      [-boxW / 2, boxH / 2],
      [boxW / 2, boxH / 2],
    ];

    for (const [cx, cy] of corners) {
      this.ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
      this.ctx.strokeRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
    }
  }
}
