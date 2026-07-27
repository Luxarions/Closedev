/**
 * Timeline Data Types for CapCut Engine
 */

export type TrackType = 'video' | 'audio' | 'text' | 'effect' | 'sticker';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export interface AspectRatioConfig {
  label: string;
  width: number;
  height: number;
  ratio: number;
}

export const ASPECT_RATIOS: Record<AspectRatio, AspectRatioConfig> = {
  '16:9': { label: '16:9 (Landscape)', width: 1920, height: 1080, ratio: 16 / 9 },
  '9:16': { label: '9:16 (TikTok / Reels)', width: 1080, height: 1920, ratio: 9 / 16 },
  '1:1': { label: '1:1 (Square)', width: 1080, height: 1080, ratio: 1 },
  '4:5': { label: '4:5 (Instagram)', width: 1080, height: 1350, ratio: 4 / 5 },
};

export interface TransformProps {
  x: number; // Offset X in px relative to center
  y: number; // Offset Y in px relative to center
  scale: number; // 0.1 to 5.0
  rotation: number; // in degrees
  opacity: number; // 0 to 1
}

export interface Keyframe {
  id: string;
  timeOffset: number; // Relative to clip start in seconds
  transform: Partial<TransformProps>;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export interface FilterProps {
  brightness: number; // 0 to 200 (default 100)
  contrast: number;   // 0 to 200 (default 100)
  saturate: number;   // 0 to 200 (default 100)
  hueRotate: number;  // 0 to 360 (default 0)
  blur: number;       // 0 to 50 (default 0)
  sepia: number;      // 0 to 100 (default 0)
  temperature: number;// -100 to 100 (default 0)
}

export interface TextProperties {
  content: string;
  fontFamily: string;
  fontSize: number; // in px
  color: string;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  align: 'left' | 'center' | 'right';
  bold: boolean;
  italic: boolean;
  animationStyle?: 'none' | 'typewriter' | 'fade' | 'bounce' | 'slideUp' | 'glow';
}

export interface AppliedEffect {
  id: string;
  effectTypeId: string;
  name: string;
  intensity: number; // 0 to 100
  parameters?: Record<string, number | string | boolean>;
}

export interface AppliedTransition {
  id: string;
  transitionTypeId: string;
  name: string;
  duration: number; // In seconds, e.g. 0.5 to 2.0
  targetClipId: string; // The clip this transition transitions into
}

export interface TimelineClip {
  id: string;
  trackId: string;
  name: string;
  type: TrackType;
  
  // Timeline timing
  startTime: number; // Position in timeline (seconds)
  duration: number;  // Visible duration on timeline (seconds)
  mediaOffset: number; // Offset in media source file (seconds)
  mediaDuration: number; // Total duration of original media (seconds)
  
  // Media source reference
  sourceUrl: string;
  thumbnailUrl?: string;
  mediaType?: 'video' | 'image' | 'audio' | 'text' | 'sticker';
  
  // Video / Visual Transform
  transform: TransformProps;
  
  // Audio settings
  volume: number; // 0 to 100
  muted: boolean;
  fadeInDuration: number; // seconds
  fadeOutDuration: number; // seconds
  playbackRate: number; // 0.25 to 4.0
  
  // Adjustments & Effects
  filters: FilterProps;
  effects: AppliedEffect[];
  transitionIn?: AppliedTransition;
  
  // Text specific (if type === 'text')
  textProps?: TextProperties;
  
  // Keyframes
  keyframes: Keyframe[];
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: TrackType;
  order: number;
  muted: boolean;
  locked: boolean;
  hidden: boolean;
  clips: TimelineClip[];
}

export interface ProjectSettings {
  title: string;
  aspectRatio: AspectRatio;
  fps: number; // 24, 30, 60
  sampleRate: number;
  backgroundColor: string;
}

export interface EngineState {
  project: ProjectSettings;
  tracks: TimelineTrack[];
  currentTime: number; // Playhead position in seconds
  duration: number;    // Total duration of project in seconds
  isPlaying: boolean;
  selectedClipId: string | null;
  selectedTrackId: string | null;
  selectedTransitionId: string | null;
  selectedEffectId: string | null;
  zoomLevel: number;   // Pixels per second (e.g. 20 to 200)
  snapToGrid: boolean;
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
}
