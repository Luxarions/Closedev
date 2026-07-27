/**
 * Version / Revision identification
 */
export const REVISION = '1.0.0-videoengine';

/**
 * Stage 1: Constants.ts
 * Global engine constants defining coordinate systems, playback loop modes, 
 * controls, blend modes, keyframe interpolations, track types, and default states.
 * 
 * Modeled strictly after Three.js constants.js architecture.
 */

// --- 1. Interaction Controls & Input Identifiers ---
/**
 * Represents mouse buttons and interaction modes for preview navigation/transform.
 */
export const MOUSE = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2,
  PAN: 0,
  ZOOM: 1,
  ROTATE: 2,
} as const;

/**
 * Represents touch interaction types for multi-touch viewports.
 */
export const TOUCH = {
  PAN: 0,
  PINCH_ZOOM: 1,
  ROTATE: 2,
} as const;

// --- 2. System & Coordinate Systems ---
export const WebGLCoordinateSystem = 2000;
export const CanvasCoordinateSystem = 2001;
export const WebGPUCoordinateSystem = 2002;

// --- 3. Playback Loop Modes ---
export const LoopOnce = 2200;
export const LoopRepeat = 2201;
export const LoopPingPong = 2202;

// --- 4. Keyframe Interpolation Modes ---
export const InterpolateDiscrete = 2300;
export const InterpolateLinear = 2301;
export const InterpolateSmooth = 2302;
export const InterpolateBezier = 2303;

// --- 5. Compositing & Blending Modes ---
export const NoBlending = 0;
export const NormalBlending = 1;
export const AdditiveBlending = 2;
export const SubtractiveBlending = 3;
export const MultiplyBlending = 4;
export const CustomBlending = 5;

// --- 6. Track & Clip Media Types ---
export const TRACK_TYPE_VIDEO = 'video' as const;
export const TRACK_TYPE_AUDIO = 'audio' as const;
export const TRACK_TYPE_TEXT = 'text' as const;
export const TRACK_TYPE_EFFECT = 'effect' as const;
export const TRACK_TYPE_STICKER = 'sticker' as const;

// --- 7. Timeline & Engine Defaults ---
export const DEFAULT_FPS = 30;
export const DEFAULT_SAMPLE_RATE = 44100;
export const DEFAULT_PROJECT_TITLE = 'Proyek CapCut Baru';
export const DEFAULT_CANVAS_BACKGROUND = '#0a0a0c';
export const DEFAULT_TIMELINE_DURATION = 15;
export const DEFAULT_ZOOM_LEVEL = 60; // Pixels per second on timeline ruler
export const DEFAULT_SNAP_THRESHOLD = 0.15; // Seconds

// --- 8. Aspect Ratio Presets ---
export const ASPECT_RATIO_CONFIGS = {
  '16:9': { name: 'YouTube / Wide (16:9)', ratio: 16 / 9, width: 1920, height: 1080 },
  '9:16': { name: 'TikTok / Reel / Shorts (9:16)', ratio: 9 / 16, width: 1080, height: 1920 },
  '1:1': { name: 'Instagram Feed (1:1)', ratio: 1, width: 1080, height: 1080 },
  '4:5': { name: 'Instagram Portrait (4:5)', ratio: 4 / 5, width: 1080, height: 1350 },
  '21:9': { name: 'Cinematic Ultrawide (21:9)', ratio: 21 / 9, width: 2560, height: 1080 },
} as const;

// --- 9. Default Transform Object State ---
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

// --- 10. Default Filter Object State ---
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

// --- 11. Default Text Object Properties ---
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
