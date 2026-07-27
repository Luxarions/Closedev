/**
 * Stage 1: Constants.ts
 * Global engine constants defining default ratios, playback settings, coordinates, and types.
 */

export const WebGLCoordinateSystem = 2000;
export const CanvasCoordinateSystem = 2001;

export const DEFAULT_FPS = 30;
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

export const DEFAULT_TRANSFORM_PROPS: {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
} = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  opacity: 1,
};

export const DEFAULT_FILTER_PROPS: {
  brightness: number;
  contrast: number;
  saturate: number;
  hueRotate: number;
  blur: number;
  sepia: number;
  temperature: number;
} = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  hueRotate: 0,
  blur: 0,
  sepia: 0,
  temperature: 0,
};
