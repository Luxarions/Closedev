import React from 'react';
import { useEngine } from '../../context/EngineContext';
import { TimelineTrack } from '../../engine/types/timeline';
import {
  Film,
  Music,
  Type,
  Wand2,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';

interface TrackHeaderProps {
  track: TimelineTrack;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({ track }) => {
  const { timelineEngine } = useEngine();

  const getTrackIcon = () => {
    switch (track.type) {
      case 'video':
        return <Film className="w-3.5 h-3.5 text-blue-400" />;
      case 'audio':
        return <Music className="w-3.5 h-3.5 text-emerald-400" />;
      case 'text':
        return <Type className="w-3.5 h-3.5 text-amber-400" />;
      case 'effect':
        return <Wand2 className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Film className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="h-14 w-56 bg-zinc-950 border-r border-b border-zinc-800/80 px-2.5 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-2 min-w-0">
        <div className="p-1 bg-zinc-900 rounded border border-zinc-800">{getTrackIcon()}</div>
        <span className="text-xs font-semibold text-zinc-300 truncate">{track.name}</span>
      </div>

      <div className="flex items-center gap-1">
        {/* Mute Toggle */}
        <button
          onClick={() => timelineEngine.toggleTrackMute(track.id)}
          className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
            track.muted ? 'text-red-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title={track.muted ? 'Unmute Trek' : 'Mute Trek'}
        >
          {track.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Lock Toggle */}
        <button
          onClick={() => timelineEngine.toggleTrackLock(track.id)}
          className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
            track.locked ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title={track.locked ? 'Buka Kunci Trek' : 'Kunci Trek'}
        >
          {track.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>

        {/* Hide Toggle */}
        <button
          onClick={() => timelineEngine.toggleTrackHide(track.id)}
          className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
            track.hidden ? 'text-red-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title={track.hidden ? 'Tampilkan Trek' : 'Sembunyikan Trek'}
        >
          {track.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>

        {/* Delete Track */}
        <button
          onClick={() => timelineEngine.removeTrack(track.id)}
          className="p-1 text-zinc-600 hover:text-red-400 rounded hover:bg-zinc-800 transition-colors"
          title="Hapus Trek"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
