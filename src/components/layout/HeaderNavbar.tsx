import React, { useState } from 'react';
import { useEngine } from '../../context/EngineContext';
import { useEngineState } from '../../hooks/useEngineState';
import { ASPECT_RATIOS, AspectRatio } from '../../engine/types/timeline';
import {
  Video,
  Undo2,
  Redo2,
  Download,
  Sparkles,
  Smartphone,
  Monitor,
  Square,
  Instagram,
  ChevronDown,
} from 'lucide-react';

interface HeaderNavbarProps {
  onOpenExport: () => void;
  onLoadSampleProject: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({ onOpenExport, onLoadSampleProject }) => {
  const { timelineEngine } = useEngine();
  const state = useEngineState();
  const [showAspectDropdown, setShowAspectDropdown] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    timelineEngine.setProjectTitle(e.target.value);
  };

  const handleSelectAspect = (ratio: AspectRatio) => {
    timelineEngine.setAspectRatio(ratio);
    setShowAspectDropdown(false);
  };

  const getAspectIcon = (ratio: AspectRatio) => {
    switch (ratio) {
      case '16:9':
        return <Monitor className="w-4 h-4 text-blue-400" />;
      case '9:16':
        return <Smartphone className="w-4 h-4 text-pink-400" />;
      case '1:1':
        return <Square className="w-4 h-4 text-emerald-400" />;
      case '4:5':
        return <Instagram className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <header className="h-14 bg-zinc-950 border-b border-zinc-800/80 px-4 flex items-center justify-between select-none z-30">
      {/* Left Branding & Project Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm">
          <Video className="w-5 h-5 text-white" />
          <span className="font-bold text-white text-sm tracking-wide">CapCut Studio</span>
        </div>

        <div className="h-5 w-px bg-zinc-800 mx-1" />

        <input
          type="text"
          value={state.project.title}
          onChange={handleTitleChange}
          className="bg-transparent hover:bg-zinc-900 focus:bg-zinc-900 border border-transparent focus:border-zinc-700 rounded px-2 py-1 text-sm font-medium text-zinc-200 focus:outline-none transition-colors w-48 truncate"
          title="Klik untuk mengubah nama proyek"
        />

        <button
          onClick={onLoadSampleProject}
          className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md px-2.5 py-1 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Muat Proyek Contoh</span>
        </button>
      </div>

      {/* Middle Controls (Aspect Ratio & Undo/Redo) */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
          <button
            onClick={() => timelineEngine.undo()}
            disabled={!state.canUndo}
            className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors rounded hover:bg-zinc-800"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => timelineEngine.redo()}
            disabled={!state.canRedo}
            className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors rounded hover:bg-zinc-800"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="relative">
          <button
            onClick={() => setShowAspectDropdown(!showAspectDropdown)}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            {getAspectIcon(state.project.aspectRatio)}
            <span>{ASPECT_RATIOS[state.project.aspectRatio].label.split(' ')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {showAspectDropdown && (
            <div className="absolute top-full mt-1.5 right-0 w-52 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 z-50">
              {(Object.keys(ASPECT_RATIOS) as AspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => handleSelectAspect(ratio)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                    state.project.aspectRatio === ratio
                      ? 'bg-blue-600/20 text-blue-400 font-semibold'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {getAspectIcon(ratio)}
                  <span>{ASPECT_RATIOS[ratio].label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Export Button */}
      <div className="flex items-center gap-3">
        <div className="text-xs text-zinc-500 font-mono hidden md:block">
          {state.project.fps} FPS • 1080p
        </div>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-blue-500/20 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Video</span>
        </button>
      </div>
    </header>
  );
};
