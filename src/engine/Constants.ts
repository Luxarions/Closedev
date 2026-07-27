/**
 * Stage 1: Constants.ts
 * Global engine constants defining coordinate systems, playback loop modes, 
 * default project ratios, track types, default transform & filter states.
 * 
 * Modeled after Three.js constants.js pattern.
 */

// --- 1. System & Coordinate Identifiers ---
export const WebGLCoordinateSystem = 2000;
export const CanvasCoordinateSystem = 2001;

// --- 2. Playback & Loop Modes ---
export const LoopOnce = 3000;
export const LoopRepeat = 3001;
export const LoopPingPong = 3002;

// --- 3. Track & Clip Media Identifiers ---
export const TRACK_TYPE_VIDEO = 'video' as const;
export const TRACK_TYPE_AUDIO = 'audio' as const;
export const TRACK_TYPE_TEXT = 'text' as const;
export const TRACK_TYPE_EFFECT = 'effect' as const;
export const TRACK_TYPE_STICKER = 'sticker' as const;

// --- 4. Timeline & Rendering Defaults ---
export const DEFAULT_FPS = 30;
export const DEFAULT_SAMPLE_RATE = 44100;
export const DEFAULT_PROJECT_TITLE = 'Proyek CapCut Baru';
export const DEFAULT_CANVAS_BACKGROUND = '#0a0a0c';
export const DEFAULT_TIMELINE_DURATION = 15;
export const DEFAULT_ZOOM_LEVEL = 60; // Pixels per second
export const DEFAULT_SNAP_THRESHOLD = 0.15; // Seconds

// --- 5. Aspect Ratio Presets ---
export const ASPECT_RATIO_CONFIGS = {
  '16:9': { name: 'YouTube / Wide (16:9)', ratio: 16 / 9, width: 1920, height: 1080 },
  '9:16': { name: 'TikTok / Reel / Shorts (9:16)', ratio: 9 / 16, width: 1080, height: 1920 },
  '1:1': { name: 'Instagram Feed (1:1)', ratio: 1, width: 1080, height: 1080 },
  '4:5': { name: 'Instagram Portrait (4:5)', ratio: 4 / 5, width: 1080, height: 1350 },
  '21:9': { name: 'Cinematic Ultrawide (21:9)', ratio: 21 / 9, width: 2560, height: 1080 },
} as const;

// --- 6. Default Transform Properties ---
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

// --- 7. Default Filter Properties ---
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

// --- 8. Default Text Properties ---
export const DEFAULT_TEXT_PROPS = {
  content: 'Teks Baru',
  fontFamily: 'Inter',
  fontSize: 48,
  color: '#ffffff',
  backgroundColor: 'transparent',
  strokeColor: '#000000',
  strokeWidth: 0,
  align: 'center' as const,
  bold: true,
  italic: false,
  animationStyle: 'none' as const,
};
