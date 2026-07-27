/**
 * Engine-wide Constants (Single Source of Truth)
 * Location: src/core/Constants.ts
 */

export const VERSION = '1.0.0-videoengine';

export const MIME_TYPES = {
  VIDEO_MP4: 'video/mp4',
  VIDEO_WEBM: 'video/webm',
  AUDIO_MP3: 'audio/mp3',
  AUDIO_WAV: 'audio/wav',
  IMAGE_PNG: 'image/png',
  IMAGE_JPEG: 'image/jpeg',
} as const;

export const DEFAULT_FRAMERATE = 30;

export const VIDEO_TRACK_TYPE = 'video' as const;
export const AUDIO_TRACK_TYPE = 'audio' as const;
export const TEXT_TRACK_TYPE = 'text' as const;
export const EFFECT_TRACK_TYPE = 'effect' as const;
export const STICKER_TRACK_TYPE = 'sticker' as const;

export const WebGLCoordinateSystem = 2000;
export const CanvasCoordinateSystem = 2001;

export const LoopOnce = 2200;
export const LoopRepeat = 2201;
export const LoopPingPong = 2202;

export const InterpolateDiscrete = 2300;
export const InterpolateLinear = 2301;
export const InterpolateSmooth = 2302;
export const InterpolateBezier = 2303;

export const MOUSE = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2,
  PAN: 0,
  ZOOM: 1,
  ROTATE: 2,
} as const;

export const TOUCH = {
  PAN: 0,
  PINCH_ZOOM: 1,
  ROTATE: 2,
} as const;

export const DEFAULT_SAMPLE_RATE = 44100;
export const DEFAULT_PROJECT_TITLE = 'Proyek CapCut Baru';
export const DEFAULT_CANVAS_BACKGROUND = '#0a0a0c';
export const DEFAULT_TIMELINE_DURATION = 15;
export const DEFAULT_ZOOM_LEVEL = 60;
export const DEFAULT_SNAP_THRESHOLD = 0.15;

export const ASPECT_RATIO_CONFIGS = {
  '16:9': { name: 'YouTube / Wide (16:9)', ratio: 16 / 9, width: 1920, height: 1080 },
  '9:16': { name: 'TikTok / Reel / Shorts (9:16)', ratio: 9 / 16, width: 1080, height: 1920 },
  '1:1': { name: 'Instagram Feed (1:1)', ratio: 1, width: 1080, height: 1080 },
  '4:5': { name: 'Instagram Portrait (4:5)', ratio: 4 / 5, width: 1080, height: 1350 },
  '21:9': { name: 'Cinematic Ultrawide (21:9)', ratio: 21 / 9, width: 2560, height: 1080 },
} as const;
