import React, { createContext, useContext, useMemo } from 'react';
import { TimelineEngine } from '../engine/core/TimelineEngine';
import { PlaybackEngine } from '../engine/core/PlaybackEngine';
import { AssetStore } from '../engine/services/AssetStore';
import { ExportEngine } from '../engine/renderers/ExportEngine';

interface EngineContextType {
  timelineEngine: TimelineEngine;
  playbackEngine: PlaybackEngine;
  assetStore: AssetStore;
  exportEngine: ExportEngine;
}

const EngineContext = createContext<EngineContextType | null>(null);

export const EngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const engines = useMemo(() => {
    const timelineEngine = new TimelineEngine();
    const playbackEngine = new PlaybackEngine(timelineEngine);
    const assetStore = AssetStore.getInstance();
    const exportEngine = new ExportEngine();

    assetStore.initializeDefaults();

    return {
      timelineEngine,
      playbackEngine,
      assetStore,
      exportEngine,
    };
  }, []);

  return <EngineContext.Provider value={engines}>{children}</EngineContext.Provider>;
};

export const useEngine = (): EngineContextType => {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error('useEngine must be used within an EngineProvider');
  }
  return context;
};
