import React, { useState, useEffect, useCallback } from 'react';
import { EngineProvider, useEngine } from './context/EngineContext';
import { HeaderNavbar } from './components/layout/HeaderNavbar';
import { SidebarNav, SidebarTab } from './components/sidebar/SidebarNav';
import { AssetLibraryPanel } from './components/sidebar/AssetLibraryPanel';
import { PreviewPlayer } from './components/preview/PreviewPlayer';
import { InspectorPanel } from './components/inspector/InspectorPanel';
import { TimelineContainer } from './components/timeline/TimelineContainer';
import { ExportModal } from './components/modals/ExportModal';

const AppContent: React.FC = () => {
  const { timelineEngine, assetStore } = useEngine();
  const [activeTab, setActiveTab] = useState<SidebarTab>('media');
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Load a rich sample CapCut project on demand
  const handleLoadSampleProject = useCallback(async () => {
    // 1. Prepare video assets
    const vid1Url = await assetStore.getPreparedMediaAssetUrl('stock_vid_1');
    const vid2Url = await assetStore.getPreparedMediaAssetUrl('stock_vid_2');
    const audioUrl = await assetStore.getPreparedMediaAssetUrl('stock_audio_1');

    // 2. Get tracks
    const state = timelineEngine.getState();
    const videoTrack = state.tracks.find((t) => t.type === 'video') || timelineEngine.addTrack('video', 'Video Utama');
    const audioTrack = state.tracks.find((t) => t.type === 'audio') || timelineEngine.addTrack('audio', 'Musik Track');
    const textTrack = state.tracks.find((t) => t.type === 'text') || timelineEngine.addTrack('text', 'Teks Track');

    // 3. Clear existing clips
    state.tracks.forEach((t) => (t.clips = []));

    // 4. Add Video Clip 1
    const clip1 = timelineEngine.addClipToTrack(videoTrack.id, {
      name: 'Sunset City',
      sourceUrl: vid1Url,
      duration: 6.0,
      startTime: 0,
      filters: { brightness: 105, contrast: 110, saturate: 120, hueRotate: 0, blur: 0, sepia: 0, temperature: 15 },
    });

    // 5. Add Video Clip 2 with Cross Dissolve Transition
    const clip2 = timelineEngine.addClipToTrack(videoTrack.id, {
      name: 'Cyberpunk Neon',
      sourceUrl: vid2Url,
      duration: 6.0,
      startTime: 6.0,
      filters: { brightness: 110, contrast: 130, saturate: 150, hueRotate: 310, blur: 0, sepia: 0, temperature: -20 },
    });

    if (clip2) {
      timelineEngine.setClipTransitionIn(clip2.id, {
        id: `tr_${Date.now()}`,
        transitionTypeId: 'cross_dissolve',
        name: 'Cross Dissolve',
        duration: 1.0,
        targetClipId: clip2.id,
      });

      // Add VHS Glitch effect to Clip 2
      timelineEngine.addEffectToClip(clip2.id, {
        id: `fx_${Date.now()}`,
        effectTypeId: 'vhs_glitch',
        name: 'VHS Retro Glitch',
        intensity: 65,
      });
    }

    // 6. Add Animated Text
    timelineEngine.addClipToTrack(textTrack.id, {
      name: 'Judul Video',
      sourceUrl: '',
      duration: 5.0,
      startTime: 0.5,
      textProps: {
        content: 'VLOG CAPCUT PROTOTYPE 🚀',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 38,
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.6)',
        strokeColor: '#3b82f6',
        strokeWidth: 2,
        align: 'center',
        bold: true,
        italic: false,
        animationStyle: 'bounce',
      },
    });

    // 7. Add Background Audio
    if (audioUrl) {
      timelineEngine.addClipToTrack(audioTrack.id, {
        name: 'Chill Lo-Fi Track',
        sourceUrl: audioUrl,
        duration: 12.0,
        startTime: 0,
        volume: 80,
      });
    }

    timelineEngine.setCurrentTime(0);
  }, [assetStore, timelineEngine]);

  // Load sample project automatically on first mount
  useEffect(() => {
    handleLoadSampleProject();
  }, [handleLoadSampleProject]);

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <HeaderNavbar
        onOpenExport={() => setIsExportOpen(true)}
        onLoadSampleProject={handleLoadSampleProject}
      />

      {/* Main Workspace (Sidebar, Asset Library, Preview Canvas, Inspector) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* CapCut Vertical Sidebar Navigation */}
        <SidebarNav activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Asset Library Panel */}
        <AssetLibraryPanel activeTab={activeTab} />

        {/* Center Interactive Preview Player */}
        <PreviewPlayer />

        {/* Right Inspector Panel */}
        <InspectorPanel />
      </div>

      {/* Bottom Timeline Editor Area */}
      <TimelineContainer />

      {/* Export Video Modal */}
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <EngineProvider>
      <AppContent />
    </EngineProvider>
  );
}
