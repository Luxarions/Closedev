import React from 'react';
import { useEngine } from '../../context/EngineContext';
import { TimelineTrack as TimelineTrackType } from '../../engine/types/timeline';
import { TimelineClipItem } from './TimelineClipItem';
import { MediaAsset, TextPreset } from '../../engine/services/AssetStore';

interface TimelineTrackProps {
  track: TimelineTrackType;
  pixelsPerSecond: number;
  selectedClipId: string | null;
  totalDuration: number;
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({
  track,
  pixelsPerSecond,
  selectedClipId,
  totalDuration,
}) => {
  const { timelineEngine, assetStore } = useEngine();

  const trackWidthPx = totalDuration * pixelsPerSecond;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (track.locked) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const dropX = e.clientX - rect.left;
    const dropTime = Math.max(0, dropX / pixelsPerSecond);

    // Case 1: Dragged clip reordering on timeline
    const movedClipId = e.dataTransfer.getData('capcut/clipId');
    if (movedClipId) {
      timelineEngine.moveClip(movedClipId, track.id, dropTime);
      return;
    }

    // Case 2: Dragged asset from Library Panel
    const itemType = e.dataTransfer.getData('capcut/type');
    const payloadJson = e.dataTransfer.getData('capcut/payload');

    if (itemType && payloadJson) {
      try {
        const payload = JSON.parse(payloadJson);

        if (itemType === 'media') {
          const asset = payload as MediaAsset;
          const preparedUrl = await assetStore.getPreparedMediaAssetUrl(asset.id);

          timelineEngine.addClipToTrack(track.id, {
            trackId: track.id,
            name: asset.title,
            type: track.type,
            sourceUrl: preparedUrl || asset.url,
            thumbnailUrl: asset.thumbnailUrl,
            duration: asset.duration || 8,
            startTime: dropTime,
            mediaOffset: 0,
            mediaDuration: asset.duration || 8,
            mediaType: asset.type === 'image' ? 'image' : asset.type === 'audio' ? 'audio' : 'video',
            transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
            volume: 100,
            muted: false,
            fadeInDuration: 0,
            fadeOutDuration: 0,
            playbackRate: 1.0,
            filters: { brightness: 100, contrast: 100, saturate: 100, hueRotate: 0, blur: 0, sepia: 0, temperature: 0 },
            effects: [],
            keyframes: [],
          });
        } else if (itemType === 'text') {
          const preset = payload as TextPreset;
          timelineEngine.addClipToTrack(track.id, {
            trackId: track.id,
            name: preset.name,
            type: 'text',
            sourceUrl: '',
            duration: 4,
            startTime: dropTime,
            mediaOffset: 0,
            mediaDuration: 4,
            transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
            volume: 100,
            muted: false,
            fadeInDuration: 0,
            fadeOutDuration: 0,
            playbackRate: 1.0,
            filters: { brightness: 100, contrast: 100, saturate: 100, hueRotate: 0, blur: 0, sepia: 0, temperature: 0 },
            effects: [],
            keyframes: [],
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
        }
      } catch {
        // drop JSON parse error fallback
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ width: `${trackWidthPx}px` }}
      className="h-14 relative bg-zinc-900/40 border-b border-zinc-800/80 shrink-0 select-none hover:bg-zinc-900/60 transition-colors"
    >
      {track.clips.map((clip) => (
        <TimelineClipItem
          key={clip.id}
          clip={clip}
          pixelsPerSecond={pixelsPerSecond}
          isSelected={selectedClipId === clip.id}
        />
      ))}
    </div>
  );
};
