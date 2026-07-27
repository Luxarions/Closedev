import React, { useState, useEffect } from 'react';
import { SidebarTab } from './SidebarNav';
import { useEngine } from '../../context/EngineContext';
import { useEngineState } from '../../hooks/useEngineState';
import { MediaAsset, TextPreset, StickerPreset } from '../../engine/services/AssetStore';
import { EFFECT_PRESETS, TRANSITION_PRESETS, FILTER_PRESETS } from '../../engine/types/effects';
import { formatDurationSimple } from '../../engine/utils/timecodeUtils';
import {
  Plus,
  Upload,
  Play,
  Wand2,
  GitCommit,
  Type,
  Smile,
  SlidersHorizontal,
  Film,
  Music,
} from 'lucide-react';

interface AssetLibraryPanelProps {
  activeTab: SidebarTab;
}

export const AssetLibraryPanel: React.FC<AssetLibraryPanelProps> = ({ activeTab }) => {
  const { timelineEngine, assetStore } = useEngine();
  const state = useEngineState();

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [textPresets, setTextPresets] = useState<TextPreset[]>([]);
  const [stickerPresets, setStickerPresets] = useState<StickerPreset[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setMediaAssets(assetStore.getMediaAssets());
    setTextPresets(assetStore.getTextPresets());
    setStickerPresets(assetStore.getStickerPresets());
  }, [assetStore]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const asset = assetStore.registerUserFile(files[i]);
      setMediaAssets((prev) => [asset, ...prev]);
    }
    setUploading(false);
  };

  // Drag and Drop Helper
  const handleDragStart = (e: React.DragEvent, type: string, payload: unknown) => {
    e.dataTransfer.setData('capcut/type', type);
    e.dataTransfer.setData('capcut/payload', JSON.stringify(payload));
  };

  // Quick Add Button Handlers
  const handleAddMediaToTimeline = async (asset: MediaAsset) => {
    const targetTrackType = asset.type === 'audio' ? 'audio' : 'video';
    let targetTrack = state.tracks.find((t) => t.type === targetTrackType && !t.locked);

    if (!targetTrack) {
      targetTrack = timelineEngine.addTrack(targetTrackType);
    }

    const preparedUrl = await assetStore.getPreparedMediaAssetUrl(asset.id);

    timelineEngine.addClipToTrack(targetTrack.id, {
      name: asset.title,
      sourceUrl: preparedUrl || asset.url,
      thumbnailUrl: asset.thumbnailUrl,
      duration: asset.duration || 8,
      mediaDuration: asset.duration || 8,
      mediaType: asset.type === 'image' ? 'image' : asset.type === 'audio' ? 'audio' : 'video',
    });
  };

  const handleAddTextToTimeline = (preset: TextPreset) => {
    let textTrack = state.tracks.find((t) => t.type === 'text' && !t.locked);
    if (!textTrack) {
      textTrack = timelineEngine.addTrack('text', 'Teks Track');
    }

    timelineEngine.addClipToTrack(textTrack.id, {
      name: preset.name,
      sourceUrl: '',
      duration: 4,
      textProps: {
        content: preset.content,
        fontFamily: preset.fontFamily,
        fontSize: preset.fontSize,
        color: preset.color,
        backgroundColor: preset.backgroundColor,
        strokeColor: preset.strokeColor,
        strokeWidth: 2,
        align: 'center',
        bold: true,
        italic: false,
        animationStyle: preset.animationStyle,
      },
    });
  };

  const handleAddStickerToTimeline = (sticker: StickerPreset) => {
    let textTrack = state.tracks.find((t) => t.type === 'text' && !t.locked);
    if (!textTrack) {
      textTrack = timelineEngine.addTrack('text', 'Stiker Track');
    }

    timelineEngine.addClipToTrack(textTrack.id, {
      name: sticker.name,
      sourceUrl: sticker.url,
      duration: 3,
      transform: { x: 0, y: 0, scale: 0.6, rotation: 0, opacity: 1 },
      mediaType: 'sticker',
    });
  };

  const handleAddEffectToSelectedClip = (effectId: string, effectName: string) => {
    if (!state.selectedClipId) {
      alert('Pilih klip di timeline terlebih dahulu untuk menambahkan efek.');
      return;
    }

    timelineEngine.addEffectToClip(state.selectedClipId, {
      id: `fx_${Date.now()}`,
      effectTypeId: effectId,
      name: effectName,
      intensity: 75,
    });
  };

  const handleAddTransitionToSelectedClip = (transId: string, transName: string) => {
    if (!state.selectedClipId) {
      alert('Pilih klip di timeline terlebih dahulu untuk menambahkan transisi.');
      return;
    }

    timelineEngine.setClipTransitionIn(state.selectedClipId, {
      id: `tr_${Date.now()}`,
      transitionTypeId: transId,
      name: transName,
      duration: 0.8,
      targetClipId: state.selectedClipId,
    });
  };

  const handleApplyFilterToSelectedClip = (filterValues: typeof FILTER_PRESETS[0]['filterValues']) => {
    if (!state.selectedClipId) {
      alert('Pilih klip di timeline terlebih dahulu untuk menerapkan filter.');
      return;
    }

    timelineEngine.updateClipFilters(state.selectedClipId, filterValues);
  };

  return (
    <aside className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full select-none z-10 shrink-0">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-100 capitalize flex items-center gap-2">
          {activeTab === 'media' && <Film className="w-4 h-4 text-blue-400" />}
          {activeTab === 'audio' && <Music className="w-4 h-4 text-emerald-400" />}
          {activeTab === 'text' && <Type className="w-4 h-4 text-amber-400" />}
          {activeTab === 'effects' && <Wand2 className="w-4 h-4 text-purple-400" />}
          {activeTab === 'transitions' && <GitCommit className="w-4 h-4 text-pink-400" />}
          {activeTab === 'stickers' && <Smile className="w-4 h-4 text-yellow-400" />}
          {activeTab === 'filters' && <SlidersHorizontal className="w-4 h-4 text-cyan-400" />}
          <span>Pustaka {activeTab}</span>
        </h2>

        {/* Upload Button for Media & Audio */}
        {(activeTab === 'media' || activeTab === 'audio') && (
          <label className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Mengunggah...' : 'Unggah'}</span>
            <input
              type="file"
              accept={activeTab === 'audio' ? 'audio/*' : 'video/*,image/*,audio/*'}
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Panel Body Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {/* --- MEDIA TAB --- */}
        {activeTab === 'media' && (
          <div className="grid grid-cols-2 gap-2.5">
            {mediaAssets
              .filter((a) => a.type !== 'audio')
              .map((asset) => (
                <div
                  key={asset.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'media', asset)}
                  className="group relative bg-zinc-950 border border-zinc-800 hover:border-blue-500/80 rounded-lg overflow-hidden transition-all shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing"
                >
                  <div className="aspect-video relative bg-zinc-900 overflow-hidden">
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-1.5">
                      <button
                        onClick={() => handleAddMediaToTimeline(asset)}
                        className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-transform active:scale-90 shadow"
                        title="Tambah ke Timeline (+)"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-zinc-300 font-mono px-1 rounded">
                      {formatDurationSimple(asset.duration)}
                    </span>
                  </div>
                  <div className="p-1.5">
                    <p className="text-xs font-medium text-zinc-200 truncate">{asset.title}</p>
                    <p className="text-[10px] text-zinc-500">{asset.category}</p>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* --- AUDIO TAB --- */}
        {activeTab === 'audio' && (
          <div className="space-y-2">
            {mediaAssets
              .filter((a) => a.type === 'audio')
              .map((audio) => (
                <div
                  key={audio.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'media', audio)}
                  className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/80 rounded-lg transition-colors group cursor-grab"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-950/80 border border-emerald-800/50 rounded-lg flex items-center justify-center text-emerald-400 shrink-0">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 truncate">{audio.title}</p>
                      <p className="text-[10px] text-zinc-500">{formatDurationSimple(audio.duration)} • Musik</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddMediaToTimeline(audio)}
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-transform active:scale-90 shrink-0"
                    title="Tambah Audio"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* --- TEXT TAB --- */}
        {activeTab === 'text' && (
          <div className="grid grid-cols-2 gap-2.5">
            {textPresets.map((preset) => (
              <div
                key={preset.id}
                draggable
                onDragStart={(e) => handleDragStart(e, 'text', preset)}
                onClick={() => handleAddTextToTimeline(preset)}
                className="group relative bg-zinc-950 border border-zinc-800 hover:border-amber-500/80 rounded-lg p-3 text-center cursor-pointer transition-all hover:bg-zinc-900"
              >
                <div className="h-16 flex items-center justify-center bg-zinc-900/60 rounded border border-zinc-800/50 mb-2 overflow-hidden px-1">
                  <span
                    style={{
                      fontFamily: preset.fontFamily,
                      color: preset.color,
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                    className="truncate"
                  >
                    {preset.content}
                  </span>
                </div>
                <p className="text-xs font-medium text-zinc-300 truncate">{preset.name}</p>
                <span className="text-[10px] text-amber-400 capitalize">{preset.animationStyle}</span>
              </div>
            ))}
          </div>
        )}

        {/* --- EFFECTS TAB --- */}
        {activeTab === 'effects' && (
          <div className="grid grid-cols-2 gap-2.5">
            {EFFECT_PRESETS.map((effect) => (
              <div
                key={effect.id}
                onClick={() => handleAddEffectToSelectedClip(effect.id, effect.name)}
                className="group bg-zinc-950 border border-zinc-800 hover:border-purple-500/80 rounded-lg p-2.5 cursor-pointer transition-all hover:bg-zinc-900 flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 bg-purple-950 border border-purple-800/50 rounded text-purple-400">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-purple-400 font-semibold px-1.5 py-0.5 bg-purple-950/60 rounded border border-purple-800/40">
                    {effect.category}
                  </span>
                </div>
                <p className="text-xs font-semibold text-zinc-200 group-hover:text-purple-300 transition-colors">
                  {effect.name}
                </p>
                <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1">{effect.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* --- TRANSITIONS TAB --- */}
        {activeTab === 'transitions' && (
          <div className="grid grid-cols-2 gap-2.5">
            {TRANSITION_PRESETS.map((trans) => (
              <div
                key={trans.id}
                onClick={() => handleAddTransitionToSelectedClip(trans.id, trans.name)}
                className="group bg-zinc-950 border border-zinc-800 hover:border-pink-500/80 rounded-lg p-2.5 cursor-pointer transition-all hover:bg-zinc-900"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 bg-pink-950 border border-pink-800/50 rounded text-pink-400">
                    <GitCommit className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-pink-400 font-semibold">{trans.category}</span>
                </div>
                <p className="text-xs font-semibold text-zinc-200 group-hover:text-pink-300 transition-colors">
                  {trans.name}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1">{trans.defaultDuration}s durasi</p>
              </div>
            ))}
          </div>
        )}

        {/* --- STICKERS TAB --- */}
        {activeTab === 'stickers' && (
          <div className="grid grid-cols-3 gap-2">
            {stickerPresets.map((stk) => (
              <button
                key={stk.id}
                onClick={() => handleAddStickerToTimeline(stk)}
                className="p-3 bg-zinc-950 border border-zinc-800 hover:border-yellow-500/80 rounded-lg flex flex-col items-center justify-center transition-all hover:bg-zinc-900 group"
              >
                <div
                  dangerouslySetInnerHTML={{ __html: stk.svgContent }}
                  className="w-10 h-10 group-hover:scale-110 transition-transform"
                />
                <span className="text-[10px] text-zinc-400 mt-1 truncate">{stk.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* --- FILTERS TAB --- */}
        {activeTab === 'filters' && (
          <div className="grid grid-cols-2 gap-2.5">
            {FILTER_PRESETS.map((filter) => (
              <div
                key={filter.id}
                onClick={() => handleApplyFilterToSelectedClip(filter.filterValues)}
                className="group bg-zinc-950 border border-zinc-800 hover:border-cyan-500/80 rounded-lg p-2.5 cursor-pointer transition-all hover:bg-zinc-900"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-cyan-300">
                    {filter.name}
                  </span>
                  <span className="text-[9px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/40">
                    {filter.category}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500">Klik untuk Terapkan pada klip aktif</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
