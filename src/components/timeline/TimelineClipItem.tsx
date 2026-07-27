import React, { useRef } from 'react';
import { useEngine } from '../../context/EngineContext';
import { TimelineClip } from '../../engine/types/timeline';
import { formatDurationSimple } from '../../engine/utils/timecodeUtils';
import { Wand2, GitCommit, Volume2 } from 'lucide-react';

interface TimelineClipItemProps {
  clip: TimelineClip;
  pixelsPerSecond: number;
  isSelected: boolean;
}

export const TimelineClipItem: React.FC<TimelineClipItemProps> = ({
  clip,
  pixelsPerSecond,
  isSelected,
}) => {
  const { timelineEngine } = useEngine();
  const itemRef = useRef<HTMLDivElement | null>(null);

  const leftPx = clip.startTime * pixelsPerSecond;
  const widthPx = Math.max(12, clip.duration * pixelsPerSecond);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    timelineEngine.selectClip(clip.id);
  };

  // Drag Clip Left/Right
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('capcut/clipId', clip.id);
    e.dataTransfer.setData('capcut/clipOffset', (e.clientX - (itemRef.current?.getBoundingClientRect().left || 0)).toString());
  };

  // Left Trim Handle Drag
  const handleTrimLeft = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const initialStartTime = clip.startTime;
    const initialDuration = clip.duration;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaPx = moveEvent.clientX - startX;
      const deltaSec = deltaPx / pixelsPerSecond;
      const newStartTime = Math.max(0, initialStartTime + deltaSec);
      const newDuration = Math.max(0.3, initialDuration - deltaSec);

      timelineEngine.trimClip(clip.id, newStartTime, newDuration);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Right Trim Handle Drag
  const handleTrimRight = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const initialDuration = clip.duration;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaPx = moveEvent.clientX - startX;
      const deltaSec = deltaPx / pixelsPerSecond;
      const newDuration = Math.max(0.3, initialDuration + deltaSec);

      timelineEngine.trimClip(clip.id, clip.startTime, newDuration);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const getBgColor = () => {
    switch (clip.type) {
      case 'video':
        return 'bg-blue-900/80 border-blue-600/80 text-blue-100';
      case 'audio':
        return 'bg-emerald-900/80 border-emerald-600/80 text-emerald-100';
      case 'text':
        return 'bg-amber-900/80 border-amber-600/80 text-amber-100';
      case 'effect':
        return 'bg-purple-900/80 border-purple-600/80 text-purple-100';
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-200';
    }
  };

  return (
    <div
      ref={itemRef}
      draggable
      onDragStart={handleDragStart}
      onClick={handleSelect}
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
      }}
      className={`absolute top-1 bottom-1 rounded-md border text-xs font-medium select-none cursor-pointer flex items-center justify-between px-2 overflow-hidden shadow-sm transition-shadow group ${getBgColor()} ${
        isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-black z-10 shadow-lg' : 'hover:brightness-110'
      }`}
    >
      {/* Left Trim Handle */}
      <div
        onMouseDown={handleTrimLeft}
        className="absolute left-0 top-0 bottom-0 w-2.5 bg-white/20 hover:bg-white/60 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
      >
        <div className="w-0.5 h-3 bg-black/60 rounded" />
      </div>

      {/* Clip Content Preview */}
      <div className="flex items-center gap-1.5 min-w-0 pointer-events-none px-1">
        {clip.thumbnailUrl && (
          <img
            src={clip.thumbnailUrl}
            alt=""
            className="w-6 h-6 object-cover rounded shrink-0 border border-black/30"
          />
        )}
        <span className="truncate text-[11px] font-semibold">{clip.name}</span>
      </div>

      {/* Badges for Effects / Transitions / Volume */}
      <div className="flex items-center gap-1 shrink-0 pointer-events-none text-[10px]">
        {clip.transitionIn && (
          <span className="p-0.5 bg-pink-500/80 text-white rounded" title="Transisi Aktif">
            <GitCommit className="w-3 h-3" />
          </span>
        )}
        {clip.effects && clip.effects.length > 0 && (
          <span className="p-0.5 bg-purple-500/80 text-white rounded" title="Efek Aktif">
            <Wand2 className="w-3 h-3" />
          </span>
        )}
        <span className="opacity-70 font-mono hidden sm:inline">
          {formatDurationSimple(clip.duration)}
        </span>
      </div>

      {/* Right Trim Handle */}
      <div
        onMouseDown={handleTrimRight}
        className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/20 hover:bg-white/60 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
      >
        <div className="w-0.5 h-3 bg-black/60 rounded" />
      </div>
    </div>
  );
};
