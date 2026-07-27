import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useEngine } from '../../context/EngineContext';
import { useEngineState } from '../../hooks/useEngineState';
import { CanvasRenderer } from '../../engine/renderers/CanvasRenderer';
import { AudioEngine } from '../../engine/renderers/AudioEngine';
import { formatTimecode } from '../../engine/utils/timecodeUtils';
import { ASPECT_RATIOS } from '../../engine/types/timeline';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
} from 'lucide-react';

export const PreviewPlayer: React.FC = () => {
  const { timelineEngine, playbackEngine } = useEngine();
  const state = useEngineState();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const audioEngineRef = useRef<AudioEngine | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Canvas Renderer and Audio Engine once
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current);
      audioEngineRef.current = new AudioEngine();
    }
  }, []);

  // Update canvas sizing and render frame whenever timeline state ticks
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.resizeCanvas(state.project.aspectRatio, 1280);
      rendererRef.current.renderFrame(
        state.tracks,
        state.currentTime,
        state.project.aspectRatio,
        state.selectedClipId
      );
    }

    if (audioEngineRef.current) {
      audioEngineRef.current.updateAudioAtTime(state.tracks, state.currentTime, state.isPlaying);
    }
  }, [state]);

  const handleTogglePlay = () => {
    playbackEngine.togglePlayPause();
  };

  const handleStepBack = () => {
    playbackEngine.stepBackward(1, state.project.fps);
  };

  const handleStepForward = () => {
    playbackEngine.stepForward(1, state.project.fps);
  };

  const handleMuteToggle = () => {
    if (audioEngineRef.current) {
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      audioEngineRef.current.setMasterVolume(nextMuted ? 0 : 1.0);
    }
  };

  const handleFullscreenToggle = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Aspect ratio styling box
  const aspectConfig = ASPECT_RATIOS[state.project.aspectRatio] || ASPECT_RATIOS['16:9'];

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none"
    >
      {/* Canvas Viewport Frame */}
      <div className="relative flex-1 w-full flex items-center justify-center min-h-0">
        <div
          style={{ aspectRatio: `${aspectConfig.ratio}` }}
          className="relative max-w-full max-h-full bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800 flex items-center justify-center"
        >
          <canvas ref={canvasRef} className="w-full h-full object-contain" />

          {/* Canvas Aspect Ratio Overlay Label */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur text-zinc-300 text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-800 pointer-events-none">
            {state.project.aspectRatio}
          </div>
        </div>
      </div>

      {/* Floating Transport Bar */}
      <div className="mt-3 bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-xl px-4 py-2 flex items-center justify-between w-full max-w-lg shadow-lg">
        {/* Playhead Timecode Counter */}
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
          <span className="text-blue-400 font-bold">
            {formatTimecode(state.currentTime, state.project.fps)}
          </span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-500">
            {formatTimecode(state.duration, state.project.fps)}
          </span>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleStepBack}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
            title="Frame Sebelumnya"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all shadow-md active:scale-95"
            title={state.isPlaying ? 'Jeda (Space)' : 'Putar (Space)'}
          >
            {state.isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleStepForward}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
            title="Frame Selanjutnya"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right Aux Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleMuteToggle}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
            title={isMuted ? 'Unmute Preview' : 'Mute Preview'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleFullscreenToggle}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
            title="Layar Penuh"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
