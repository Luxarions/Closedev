import React, { useState } from 'react';
import { useEngine } from '../../context/EngineContext';
import { useEngineState } from '../../hooks/useEngineState';
import {
  Sliders,
  Type,
  Volume2,
  Sparkles,
  Zap,
  Trash2,
  RotateCcw,
  Gauge,
  Layers,
} from 'lucide-react';

export const InspectorPanel: React.FC = () => {
  const { timelineEngine } = useEngine();
  const state = useEngineState();
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'text' | 'effects'>('video');

  const selectedClip = state.selectedClipId
    ? state.tracks.flatMap((t) => t.clips).find((c) => c.id === state.selectedClipId)
    : null;

  if (!selectedClip) {
    return (
      <aside className="w-72 bg-zinc-950 border-l border-zinc-800 p-4 text-center flex flex-col items-center justify-center select-none text-zinc-500 z-10 shrink-0">
        <Layers className="w-10 h-10 mb-2 stroke-1 text-zinc-700" />
        <p className="text-xs font-medium text-zinc-400">Tidak ada klip dipilih</p>
        <p className="text-[11px] text-zinc-600 mt-1 max-w-[180px]">
          Klik klip pada timeline untuk membuka panel inspektor dan menyunting properti.
        </p>
      </aside>
    );
  }

  const isTextClip = selectedClip.type === 'text' || !!selectedClip.textProps;

  return (
    <aside className="w-72 bg-zinc-950 border-l border-zinc-800 flex flex-col h-full select-none z-10 shrink-0">
      {/* Clip Header Badge */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold text-zinc-200 truncate">{selectedClip.name}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{selectedClip.type} Clip</p>
        </div>
        <button
          onClick={() => timelineEngine.deleteSelectedClip()}
          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded transition-colors"
          title="Hapus Klip (Delete)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-zinc-800 bg-zinc-900/50 text-[11px] font-medium text-zinc-400">
        <button
          onClick={() => setActiveTab('video')}
          className={`flex-1 py-2 flex items-center justify-center gap-1 border-b-2 transition-colors ${
            activeTab === 'video' ? 'border-blue-500 text-blue-400 font-semibold bg-zinc-900' : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Basic</span>
        </button>

        {isTextClip && (
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2 flex items-center justify-center gap-1 border-b-2 transition-colors ${
              activeTab === 'text' ? 'border-amber-500 text-amber-400 font-semibold bg-zinc-900' : 'border-transparent hover:text-zinc-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Teks</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex-1 py-2 flex items-center justify-center gap-1 border-b-2 transition-colors ${
            activeTab === 'audio' ? 'border-emerald-500 text-emerald-400 font-semibold bg-zinc-900' : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Audio</span>
        </button>

        <button
          onClick={() => setActiveTab('effects')}
          className={`flex-1 py-2 flex items-center justify-center gap-1 border-b-2 transition-colors ${
            activeTab === 'effects' ? 'border-purple-500 text-purple-400 font-semibold bg-zinc-900' : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Efek</span>
        </button>
      </div>

      {/* Inspector Body Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar text-xs text-zinc-300">
        {/* --- VIDEO / BASIC TRANSFORM & COLOR TAB --- */}
        {activeTab === 'video' && (
          <div className="space-y-4">
            {/* Transform Properties */}
            <div>
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Transformasi</h3>
              
              <div className="space-y-2.5 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                {/* Scale */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Skala Ukuran</span>
                    <span className="font-mono text-blue-400">{Math.round(selectedClip.transform.scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.05"
                    value={selectedClip.transform.scale}
                    onChange={(e) =>
                      timelineEngine.updateClipTransform(selectedClip.id, {
                        scale: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                {/* Opacity */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Opasitas (Transparansi)</span>
                    <span className="font-mono text-blue-400">{Math.round(selectedClip.transform.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.02"
                    value={selectedClip.transform.opacity}
                    onChange={(e) =>
                      timelineEngine.updateClipTransform(selectedClip.id, {
                        opacity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Rotasi</span>
                    <span className="font-mono text-blue-400">{selectedClip.transform.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={selectedClip.transform.rotation}
                    onChange={(e) =>
                      timelineEngine.updateClipTransform(selectedClip.id, {
                        rotation: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Color Adjustments */}
            <div>
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Penyesuaian Warna</h3>

              <div className="space-y-2.5 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                {/* Brightness */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Kecerahan (Brightness)</span>
                    <span className="font-mono text-zinc-400">{selectedClip.filters.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={selectedClip.filters.brightness}
                    onChange={(e) =>
                      timelineEngine.updateClipFilters(selectedClip.id, {
                        brightness: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Kontras (Contrast)</span>
                    <span className="font-mono text-zinc-400">{selectedClip.filters.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={selectedClip.filters.contrast}
                    onChange={(e) =>
                      timelineEngine.updateClipFilters(selectedClip.id, {
                        contrast: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                {/* Saturation */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Saturasi Warna</span>
                    <span className="font-mono text-zinc-400">{selectedClip.filters.saturate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={selectedClip.filters.saturate}
                    onChange={(e) =>
                      timelineEngine.updateClipFilters(selectedClip.id, {
                        saturate: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                {/* Blur */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Efek Buram (Blur)</span>
                    <span className="font-mono text-zinc-400">{selectedClip.filters.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={selectedClip.filters.blur}
                    onChange={(e) =>
                      timelineEngine.updateClipFilters(selectedClip.id, {
                        blur: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TEXT PROPERTIES TAB --- */}
        {activeTab === 'text' && selectedClip.textProps && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">Konten Teks</label>
              <textarea
                value={selectedClip.textProps.content}
                onChange={(e) =>
                  timelineEngine.updateClipTextProps(selectedClip.id, {
                    content: e.target.value,
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-sans text-zinc-100 focus:border-amber-500 focus:outline-none h-20 resize-none"
              />
            </div>

            {/* Font Styling */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Ukuran Font</label>
                <input
                  type="number"
                  value={selectedClip.textProps.fontSize}
                  onChange={(e) =>
                    timelineEngine.updateClipTextProps(selectedClip.id, {
                      fontSize: parseInt(e.target.value) || 24,
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Warna Teks</label>
                <input
                  type="color"
                  value={selectedClip.textProps.color}
                  onChange={(e) =>
                    timelineEngine.updateClipTextProps(selectedClip.id, {
                      color: e.target.value,
                    })
                  }
                  className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded cursor-pointer p-0.5"
                />
              </div>
            </div>

            {/* Animation Style */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">Gaya Animasi Teks</label>
              <select
                value={selectedClip.textProps.animationStyle || 'none'}
                onChange={(e) =>
                  timelineEngine.updateClipTextProps(selectedClip.id, {
                    animationStyle: e.target.value as unknown as typeof selectedClip.textProps.animationStyle,
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="none">Tanpa Animasi</option>
                <option value="typewriter">Typewriter (Mesin Tik)</option>
                <option value="bounce">Bounce (Membal)</option>
                <option value="slideUp">Slide Up (Geser Ke Atas)</option>
                <option value="glow">Cyber Glow</option>
              </select>
            </div>
          </div>
        )}

        {/* --- AUDIO TAB --- */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 space-y-3">
              {/* Volume */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Volume Suara</span>
                  <span className="font-mono text-emerald-400">{selectedClip.volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedClip.volume}
                  onChange={(e) => {
                    selectedClip.volume = parseInt(e.target.value);
                    timelineEngine.selectClip(selectedClip.id);
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Fade In */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Fade In (Detik)</span>
                  <span className="font-mono text-zinc-400">{selectedClip.fadeInDuration}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3.0"
                  step="0.1"
                  value={selectedClip.fadeInDuration}
                  onChange={(e) => {
                    selectedClip.fadeInDuration = parseFloat(e.target.value);
                    timelineEngine.selectClip(selectedClip.id);
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Fade Out */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Fade Out (Detik)</span>
                  <span className="font-mono text-zinc-400">{selectedClip.fadeOutDuration}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3.0"
                  step="0.1"
                  value={selectedClip.fadeOutDuration}
                  onChange={(e) => {
                    selectedClip.fadeOutDuration = parseFloat(e.target.value);
                    timelineEngine.selectClip(selectedClip.id);
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- EFFECTS & TRANSITIONS TAB --- */}
        {activeTab === 'effects' && (
          <div className="space-y-4">
            {/* Applied Transition */}
            <div>
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Transisi Masuk</h3>
              {selectedClip.transitionIn ? (
                <div className="flex items-center justify-between p-2.5 bg-pink-950/40 border border-pink-800/60 rounded-lg">
                  <div>
                    <p className="text-xs font-semibold text-pink-300">{selectedClip.transitionIn.name}</p>
                    <p className="text-[10px] text-zinc-400">{selectedClip.transitionIn.duration}s durasi</p>
                  </div>
                  <button
                    onClick={() => timelineEngine.setClipTransitionIn(selectedClip.id, undefined)}
                    className="p-1 text-pink-400 hover:text-pink-200"
                    title="Hapus Transisi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500 italic">Belum ada transisi ditambahkan.</p>
              )}
            </div>

            {/* Applied Effects */}
            <div>
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Efek Aktif</h3>
              {selectedClip.effects.length > 0 ? (
                <div className="space-y-2">
                  {selectedClip.effects.map((effect) => (
                    <div
                      key={effect.id}
                      className="p-2.5 bg-purple-950/40 border border-purple-800/60 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-purple-300">{effect.name}</span>
                        <button
                          onClick={() => timelineEngine.removeEffectFromClip(selectedClip.id, effect.id)}
                          className="p-1 text-purple-400 hover:text-purple-200"
                          title="Hapus Efek"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                          <span>Intensitas Efek</span>
                          <span>{effect.intensity}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={effect.intensity}
                          onChange={(e) => {
                            effect.intensity = parseInt(e.target.value);
                            timelineEngine.selectClip(selectedClip.id);
                          }}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500 italic">Belum ada efek ditambahkan.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
