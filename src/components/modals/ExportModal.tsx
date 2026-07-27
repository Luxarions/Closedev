import React, { useState } from 'react';
import { useEngine } from '../../context/EngineContext';
import { useEngineState } from '../../hooks/useEngineState';
import { ExportProgress } from '../../engine/renderers/ExportEngine';
import { ASPECT_RATIOS } from '../../engine/types/timeline';
import { X, Download, Film, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { exportEngine } = useEngine();
  const state = useEngineState();

  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [fps, setFps] = useState<number>(30);
  const [progress, setProgress] = useState<ExportProgress>({
    status: 'idle',
    progressPercent: 0,
    currentFrame: 0,
    totalFrames: 0,
  });

  if (!isOpen) return null;

  const handleStartExport = async () => {
    try {
      await exportEngine.exportVideo(state, state.project.aspectRatio, fps, (p) => {
        setProgress(p);
      });
    } catch {
      // Export error captured in callback
    }
  };

  const handleCancel = () => {
    exportEngine.cancelExport();
    setProgress({
      status: 'idle',
      progressPercent: 0,
      currentFrame: 0,
      totalFrames: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Ekspor Video Hasil Suntingan</h2>
              <p className="text-[11px] text-zinc-400">Pilih kualitas dan unduh hasil karya video Anda</p>
            </div>
          </div>
          {progress.status !== 'rendering' && (
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {progress.status === 'idle' && (
            <>
              {/* Project Overview Card */}
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 space-y-1.5 text-xs text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Judul Proyek:</span>
                  <span className="font-semibold text-zinc-200">{state.project.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Rasio Aspek:</span>
                  <span className="font-semibold text-blue-400">{ASPECT_RATIOS[state.project.aspectRatio].label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Durasi:</span>
                  <span className="font-mono text-zinc-200">{state.duration.toFixed(1)} Detik</span>
                </div>
              </div>

              {/* Resolution selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Resolusi Video</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setResolution('1080p')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      resolution === '1080p'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <span>1080p Full HD</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Sangat Jernih</span>
                  </button>

                  <button
                    onClick={() => setResolution('720p')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      resolution === '720p'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <span>720p HD</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Ukuran Ringkas</span>
                  </button>
                </div>
              </div>

              {/* FPS Selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Frame Rate (FPS)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFps(30)}
                    className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                      fps === 30
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    30 FPS (Standar)
                  </button>
                  <button
                    onClick={() => setFps(60)}
                    className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                      fps === 60
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    60 FPS (Super Mulus)
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Rendering Progress View */}
          {progress.status === 'rendering' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/40 rounded-full flex items-center justify-center mx-auto text-blue-400 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-100">Sedang Merender Video...</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Frame {progress.currentFrame} / {progress.totalFrames} ({progress.progressPercent}%)
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-950 rounded-full h-3 overflow-hidden border border-zinc-800">
                <div
                  style={{ width: `${progress.progressPercent}%` }}
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Completed Download View */}
          {progress.status === 'completed' && progress.downloadUrl && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-600/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-100">Video Berhasil Diterbitkan!</h3>
                <p className="text-xs text-zinc-400 mt-1">Format WebM • Siap diunduh dan dibagikan</p>
              </div>

              <a
                href={progress.downloadUrl}
                download={`${state.project.title.replace(/\s+/g, '_')}.webm`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95"
              >
                <Download className="w-5 h-5" />
                <span>Unduh File Video (.webm)</span>
              </a>
            </div>
          )}

          {/* Error View */}
          {progress.status === 'error' && (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 bg-red-600/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-red-400">{progress.errorMessage}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-2">
          {progress.status === 'idle' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleStartExport}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-5 py-2 rounded-xl shadow-md transition-all active:scale-95"
              >
                <Film className="w-4 h-4" />
                <span>Mulai Render</span>
              </button>
            </>
          )}

          {progress.status === 'rendering' && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/80 rounded-xl transition-colors"
            >
              Batalkan Render
            </button>
          )}

          {progress.status === 'completed' && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
