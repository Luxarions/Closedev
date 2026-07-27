import React, { useEffect, useRef } from 'react';
import { useEngine } from '../../context/EngineContext';
import { useEngineState } from '../../hooks/useEngineState';
import { TimelineRuler } from './TimelineRuler';
import { TrackHeader } from './TrackHeader';
import { TimelineTrack } from './TimelineTrack';
import {
  Scissors,
  Trash2,
  Copy,
  Plus,
  Play,
  Pause,
} from 'lucide-react';

export const TimelineContainer: React.FC = () => {
  const { timelineEngine, playbackEngine } = useEngine();
  const state = useEngineState();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const pixelsPerSecond = state.zoomLevel;
  const playheadLeftPx = state.currentTime * pixelsPerSecond;
  const totalWidthPx = state.duration * pixelsPerSecond;

  // Keyboard Shortcuts Handler (Space = Play, S = Split, Delete = Remove, Ctrl+Z = Undo, Ctrl+Y = Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        playbackEngine.togglePlayPause();
      } else if (e.code === 'KeyS' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        timelineEngine.splitClipAtPlayhead();
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        timelineEngine.deleteSelectedClip();
      } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
        e.preventDefault();
        if (e.shiftKey) {
          timelineEngine.redo();
        } else {
          timelineEngine.undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyY') {
        e.preventDefault();
        timelineEngine.redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playbackEngine, timelineEngine]);

  const handleAddVideoTrack = () => {
    timelineEngine.addTrack('video', 'Video Track');
  };

  const handleAddAudioTrack = () => {
    timelineEngine.addTrack('audio', 'Audio Track');
  };

  return (
    <div className="h-72 bg-zinc-950 border-t border-zinc-800 flex flex-col select-none z-20 shrink-0">
      {/* Timeline Toolbar (Split, Delete, Duplicate, Add Track) */}
      <div className="h-10 bg-zinc-950 border-b border-zinc-800/80 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => playbackEngine.togglePlayPause()}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors mr-2"
          >
            {state.isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{state.isPlaying ? 'Jeda' : 'Putar'}</span>
          </button>

          <button
            onClick={() => timelineEngine.splitClipAtPlayhead()}
            disabled={!state.selectedClipId}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-200 rounded text-xs font-medium border border-zinc-800 transition-colors"
            title="Potong Klip di Playhead (S)"
          >
            <Scissors className="w-3.5 h-3.5 text-blue-400" />
            <span>Potong (S)</span>
          </button>

          <button
            onClick={() => timelineEngine.duplicateSelectedClip()}
            disabled={!state.selectedClipId}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-200 rounded text-xs font-medium border border-zinc-800 transition-colors"
            title="Duplikat Klip"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            <span>Duplikat</span>
          </button>

          <button
            onClick={() => timelineEngine.deleteSelectedClip()}
            disabled={!state.selectedClipId}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-200 rounded text-xs font-medium border border-zinc-800 transition-colors"
            title="Hapus Klip (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Hapus</span>
          </button>
        </div>

        {/* Add Track buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddVideoTrack}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2 py-1 rounded transition-colors"
          >
            <Plus className="w-3 h-3 text-blue-400" />
            <span>+ Trek Video</span>
          </button>

          <button
            onClick={handleAddAudioTrack}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2 py-1 rounded transition-colors"
          >
            <Plus className="w-3 h-3 text-emerald-400" />
            <span>+ Trek Audio</span>
          </button>
        </div>
      </div>

      {/* Timeline Ruler & Track Area Wrapper */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Track Headers Column (Fixed Left) */}
        <div className="w-56 bg-zinc-950 border-r border-zinc-800 flex flex-col shrink-0 overflow-hidden z-20">
          <div className="h-9 border-b border-zinc-800 bg-zinc-950 px-3 flex items-center font-bold text-[11px] text-zinc-400 uppercase tracking-wider">
            Trek Lapis
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {state.tracks.map((track) => (
              <TrackHeader key={track.id} track={track} />
            ))}
          </div>
        </div>

        {/* Scrollable Timeline Grid Column */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex flex-col overflow-x-auto overflow-y-auto relative custom-scrollbar bg-zinc-950"
        >
          {/* Ruler Bar */}
          <TimelineRuler />

          {/* Tracks Lanes */}
          <div style={{ width: `${totalWidthPx}px` }} className="relative flex-1">
            {/* Playhead Vertical Scrub Line */}
            <div
              style={{ left: `${playheadLeftPx}px` }}
              className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-30 pointer-events-none flex flex-col items-center"
            >
              <div className="w-3 h-3 bg-blue-500 rounded-b-sm shadow-md -mt-1" />
            </div>

            {state.tracks.map((track) => (
              <TimelineTrack
                key={track.id}
                track={track}
                pixelsPerSecond={pixelsPerSecond}
                selectedClipId={state.selectedClipId}
                totalDuration={state.duration}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
