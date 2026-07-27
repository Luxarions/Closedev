import React, { useRef } from 'react';
import { useEngine } from '../../context/EngineContext';
import { useEngineState } from '../../hooks/useEngineState';
import { formatDurationSimple } from '../../engine/utils/timecodeUtils';
import { ZoomIn, ZoomOut, Magnet } from 'lucide-react';

export const TimelineRuler: React.FC = () => {
  const { timelineEngine, playbackEngine } = useEngine();
  const state = useEngineState();
  const rulerRef = useRef<HTMLDivElement | null>(null);

  const pixelsPerSecond = state.zoomLevel;
  const totalDuration = state.duration;
  const totalWidthPx = totalDuration * pixelsPerSecond;

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.max(0, clickX / pixelsPerSecond);
    playbackEngine.seek(newTime);
  };

  // Generate tick marks
  const tickIntervalSec = pixelsPerSecond < 30 ? 5 : pixelsPerSecond < 80 ? 2 : 1;
  const ticks = [];
  for (let sec = 0; sec <= totalDuration; sec += tickIntervalSec) {
    ticks.push(sec);
  }

  return (
    <div className="h-9 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-3 select-none shrink-0 sticky top-0 z-20">
      {/* Left Snapping & Zoom Controls */}
      <div className="flex items-center gap-3 w-56 shrink-0 border-r border-zinc-800 pr-3">
        <button
          onClick={() => timelineEngine.toggleSnapToGrid()}
          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded transition-colors ${
            state.snapToGrid
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
          }`}
          title="Magnet Snapping Grid"
        >
          <Magnet className="w-3.5 h-3.5" />
          <span>Snap</span>
        </button>

        {/* Zoom Slider */}
        <div className="flex items-center gap-1.5 flex-1">
          <ZoomOut
            className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
            onClick={() => timelineEngine.setZoomLevel(state.zoomLevel - 15)}
          />
          <input
            type="range"
            min="20"
            max="200"
            value={state.zoomLevel}
            onChange={(e) => timelineEngine.setZoomLevel(parseInt(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <ZoomIn
            className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
            onClick={() => timelineEngine.setZoomLevel(state.zoomLevel + 15)}
          />
        </div>
      </div>

      {/* Scrubbable Time Ruler Grid */}
      <div
        ref={rulerRef}
        onClick={handleRulerClick}
        style={{ width: `${totalWidthPx}px` }}
        className="h-full relative cursor-pointer flex-1 overflow-hidden"
      >
        {ticks.map((sec) => {
          const posX = sec * pixelsPerSecond;
          return (
            <div
              key={sec}
              style={{ left: `${posX}px` }}
              className="absolute top-0 h-full border-l border-zinc-800 flex flex-col justify-between pt-1 pointer-events-none"
            >
              <span className="text-[9px] font-mono text-zinc-500 pl-1">{formatDurationSimple(sec)}</span>
              <div className="h-2 w-px bg-zinc-700" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
