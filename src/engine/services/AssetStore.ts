import { generateGradientThumbnail } from '../utils/colorUtils';

export interface MediaAsset {
  id: string;
  title: string;
  category: 'Video' | 'Audio' | 'Sticker' | 'Text' | 'User Upload';
  type: 'video' | 'audio' | 'image' | 'text' | 'sticker';
  url: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  description?: string;
  author?: string;
  tags?: string[];
}

export interface TextPreset {
  id: string;
  name: string;
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  animationStyle: 'none' | 'typewriter' | 'fade' | 'bounce' | 'slideUp' | 'glow';
  thumbnailUrl: string;
}

export interface StickerPreset {
  id: string;
  name: string;
  svgContent: string;
  url: string;
  thumbnailUrl: string;
}

/**
 * Creates a synthetic procedural video canvas as a Blob URL for instant reliable video playback
 */
export function createSyntheticVideoUrl(title: string, colorA: string, colorB: string, durationSec: number = 8): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const stream = canvas.captureStream(30);
  const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const totalFrames = durationSec * 30;
  let currentFrame = 0;

  return new Promise<string>((resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(URL.createObjectURL(blob));
    };

    mediaRecorder.start();

    const renderLoop = () => {
      if (currentFrame >= totalFrames) {
        mediaRecorder.stop();
        return;
      }

      const progress = currentFrame / totalFrames;

      // Draw dynamic background gradient
      const grad = ctx.createLinearGradient(
        Math.cos(progress * Math.PI * 2) * 640 + 640,
        0,
        Math.sin(progress * Math.PI * 2) * 640 + 640,
        720
      );
      grad.addColorStop(0, colorA);
      grad.addColorStop(1, colorB);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      // Draw animated dynamic geometric elements
      ctx.save();
      ctx.translate(640, 360);
      ctx.rotate(progress * Math.PI * 4);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(-150, -150, 300, 300);
      ctx.restore();

      // Draw Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 12;
      ctx.fillText(title, 640, 340);

      ctx.font = '24px system-ui, sans-serif';
      ctx.fillText(`Sample Clip • ${Math.floor(progress * durationSec)}s / ${durationSec}s`, 640, 410);

      currentFrame++;
      setTimeout(renderLoop, 1000 / 30);
    };

    renderLoop();
  }) as unknown as string;
}

/**
 * Creates a synthetic procedural Web Audio tone sound for reliable audio playback
 */
export function createSyntheticAudioUrl(freq: number, type: OscillatorType = 'sine', durationSec: number = 10): string {
  const sampleRate = 44100;
  const numSamples = sampleRate * durationSec;
  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const buffer = audioCtx.createBuffer(2, numSamples, sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Melody pattern
      const noteFreq = freq * (1 + 0.25 * Math.sin(t * 3 * Math.PI));
      const envelope = Math.min(1, Math.sin((t / durationSec) * Math.PI));
      data[i] = Math.sin(2 * Math.PI * noteFreq * t) * 0.2 * envelope;
    }
  }

  // Convert AudioBuffer to WAV Blob
  const wavBlob = audioBufferToWav(buffer);
  return URL.createObjectURL(wavBlob);
}

// Convert AudioBuffer to WAV format
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  let channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;

  const writeString = (str: string) => {
    for (let i = 0; i < str.length; i++) {
      out.setUint8(offset++, str.charCodeAt(i));
    }
  };

  const writeUint32 = (data: number) => {
    out.setUint32(offset, data, true);
    offset += 4;
  };

  const writeUint16 = (data: number) => {
    out.setUint16(offset, data, true);
    offset += 2;
  };

  writeString('RIFF');
  writeUint32(length - 8);
  writeString('WAVE');
  writeString('fmt ');
  writeUint32(16);
  writeUint16(1);
  writeUint16(numOfChan);
  writeUint32(sampleRate);
  writeUint32(sampleRate * 2 * numOfChan);
  writeUint16(numOfChan * 2);
  writeUint16(16);
  writeString('data');
  writeUint32(length - 44);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numOfChan; ch++) {
      let sample = Math.max(-1, Math.min(1, channels[ch][i]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(offset, sample, true);
      offset += 2;
    }
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

export class AssetStoreService {
  private static instance: AssetStoreService;
  private mediaAssets: MediaAsset[] = [];
  private textPresets: TextPreset[] = [];
  private stickerPresets: StickerPreset[] = [];
  private initialized = false;

  private constructor() {}

  public static getInstance(): AssetStoreService {
    if (!AssetStoreService.instance) {
      AssetStoreService.instance = new AssetStoreService();
    }
    return AssetStoreService.instance;
  }

  public async initializeDefaults(): Promise<void> {
    if (this.initialized) return;

    // Default Stock Media Assets
    const video1Thumbnail = generateGradientThumbnail('#ec4899', '#8b5cf6', 'City Sunset');
    const video2Thumbnail = generateGradientThumbnail('#3b82f6', '#06b6d4', 'Ocean Breeze');
    const video3Thumbnail = generateGradientThumbnail('#f59e0b', '#ef4444', 'Neon Cyber');
    const video4Thumbnail = generateGradientThumbnail('#10b981', '#3b82f6', 'Nature Hike');

    this.mediaAssets = [
      {
        id: 'stock_vid_1',
        title: 'City Sunset Vibe',
        category: 'Video',
        type: 'video',
        url: '', // populated asynchronously or on demand
        thumbnailUrl: video1Thumbnail,
        duration: 10,
        description: 'Pemandangan senja perkotaan dengan nuansa hangat',
        author: 'CapCut Stock',
        tags: ['city', 'sunset', 'aesthetic'],
      },
      {
        id: 'stock_vid_2',
        title: 'Cyberpunk Neon Street',
        category: 'Video',
        type: 'video',
        url: '',
        thumbnailUrl: video3Thumbnail,
        duration: 8,
        description: 'Lampu neon jalanan futuristik malam hari',
        author: 'CapCut Stock',
        tags: ['cyberpunk', 'neon', 'night'],
      },
      {
        id: 'stock_vid_3',
        title: 'Ocean Wave Motion',
        category: 'Video',
        type: 'video',
        url: '',
        thumbnailUrl: video2Thumbnail,
        duration: 12,
        description: 'Ombak biru laut pasifik bergerak tenang',
        author: 'CapCut Stock',
        tags: ['ocean', 'nature', 'blue'],
      },
      {
        id: 'stock_vid_4',
        title: 'Forest Sunshine Walk',
        category: 'Video',
        type: 'video',
        url: '',
        thumbnailUrl: video4Thumbnail,
        duration: 9,
        description: 'Pancaran sinar matahari melalui pepohonan hijau',
        author: 'CapCut Stock',
        tags: ['forest', 'sunshine', 'relax'],
      },
    ];

    // Default Text Presets
    this.textPresets = [
      {
        id: 'txt_title_bold',
        name: 'Bold Title',
        content: 'JUDUL UTAMA',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 48,
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.6)',
        animationStyle: 'bounce',
        thumbnailUrl: generateGradientThumbnail('#111827', '#374151', 'JUDUL'),
      },
      {
        id: 'txt_typewriter',
        name: 'Typewriter Subtitle',
        content: 'Teks mengetik otomatis...',
        fontFamily: 'monospace',
        fontSize: 32,
        color: '#facc15',
        animationStyle: 'typewriter',
        thumbnailUrl: generateGradientThumbnail('#1e1b4b', '#312e81', 'TYPE'),
      },
      {
        id: 'txt_neon_glow',
        name: 'Neon Cyber Glow',
        content: 'NEON NIGHTS',
        fontFamily: 'Impact, sans-serif',
        fontSize: 54,
        color: '#38bdf8',
        strokeColor: '#0284c7',
        strokeWidth: 2,
        animationStyle: 'glow',
        thumbnailUrl: generateGradientThumbnail('#0284c7', '#06b6d4', 'NEON'),
      },
      {
        id: 'txt_vlog_caption',
        name: 'Minimal Vlog Caption',
        content: 'Hari ini jalan-jalan ke pantai 🌊',
        fontFamily: 'sans-serif',
        fontSize: 28,
        color: '#ffffff',
        backgroundColor: '#000000',
        animationStyle: 'slideUp',
        thumbnailUrl: generateGradientThumbnail('#047857', '#10b981', 'VLOG'),
      },
    ];

    // Default Sticker Presets
    this.stickerPresets = [
      {
        id: 'stk_fire',
        name: 'Fire Flame',
        svgContent: `<svg viewBox="0 0 24 24" fill="#ef4444" width="60" height="60"><path d="M12 23c-4.97 0-9-3.58-9-8 0-4.19 3.01-7.26 6.13-10.42a1 1 0 0 1 1.62.33c.85 2.1 2.25 3.32 3.65 4.54C16.14 11 18 12.63 18 15c0 4.42-2.69 8-6 8zm0-15.5c-2.3 2.5-4.5 4.9-4.5 7.5 0 2.48 2.02 4.5 4.5 4.5s4.5-2.02 4.5-4.5c0-1.5-.92-2.35-2.3-3.5-.83-.7-1.72-1.45-2.2-2.5z"/></svg>`,
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444"><path d="M12 23c-4.97 0-9-3.58-9-8 0-4.19 3.01-7.26 6.13-10.42a1 1 0 0 1 1.62.33c.85 2.1 2.25 3.32 3.65 4.54C16.14 11 18 12.63 18 15c0 4.42-2.69 8-6 8z"/></svg>',
        thumbnailUrl: generateGradientThumbnail('#991b1b', '#ef4444', '🔥 Fire'),
      },
      {
        id: 'stk_heart',
        name: 'Sparkle Heart',
        svgContent: `<svg viewBox="0 0 24 24" fill="#ec4899" width="60" height="60"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ec4899"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
        thumbnailUrl: generateGradientThumbnail('#831843', '#ec4899', '💖 Heart'),
      },
      {
        id: 'stk_star',
        name: 'Golden Star',
        svgContent: `<svg viewBox="0 0 24 24" fill="#eab308" width="60" height="60"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23eab308"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
        thumbnailUrl: generateGradientThumbnail('#713f12', '#eab308', '⭐ Star'),
      },
    ];

    // Generate procedural audio assets
    try {
      const audioUrl1 = createSyntheticAudioUrl(440, 'sine', 12);
      const audioUrl2 = createSyntheticAudioUrl(320, 'triangle', 15);

      this.mediaAssets.push(
        {
          id: 'stock_audio_1',
          title: 'Upbeat Chill Lo-Fi',
          category: 'Audio',
          type: 'audio',
          url: audioUrl1,
          thumbnailUrl: generateGradientThumbnail('#4c1d95', '#8b5cf6', '🎵 Chill'),
          duration: 12,
          description: 'Musik latar santai & ceria cocok untuk vlog',
          author: 'CapCut Audio',
        },
        {
          id: 'stock_audio_2',
          title: 'Cyberpunk Synthwave Beat',
          category: 'Audio',
          type: 'audio',
          url: audioUrl2,
          thumbnailUrl: generateGradientThumbnail('#1e3a8a', '#3b82f6', '⚡ Synth'),
          duration: 15,
          description: 'Ritme bass elektronik energik untuk editan cepat',
          author: 'CapCut Audio',
        }
      );
    } catch {
      // Fallback if audio context unavailable
    }

    this.initialized = true;
  }

  public getMediaAssets(): MediaAsset[] {
    return this.mediaAssets;
  }

  public getTextPresets(): TextPreset[] {
    return this.textPresets;
  }

  public getStickerPresets(): StickerPreset[] {
    return this.stickerPresets;
  }

  /**
   * Lazily builds sample video blob URL if not already prepared
   */
  public async getPreparedMediaAssetUrl(assetId: string): Promise<string> {
    const asset = this.mediaAssets.find((a) => a.id === assetId);
    if (!asset) return '';

    if (asset.url) return asset.url;

    // Generate video URL procedurally
    let videoBlobUrl = '';
    if (assetId === 'stock_vid_1') {
      videoBlobUrl = await createSyntheticVideoUrl('CITY SUNSET', '#db2777', '#7c3aed', 10);
    } else if (assetId === 'stock_vid_2') {
      videoBlobUrl = await createSyntheticVideoUrl('CYBERPUNK NEON', '#0284c7', '#ec4899', 8);
    } else if (assetId === 'stock_vid_3') {
      videoBlobUrl = await createSyntheticVideoUrl('OCEAN WAVES', '#0d9488', '#2563eb', 12);
    } else if (assetId === 'stock_vid_4') {
      videoBlobUrl = await createSyntheticVideoUrl('FOREST WALK', '#059669', '#3b82f6', 9);
    }

    if (videoBlobUrl) {
      asset.url = videoBlobUrl;
    }

    return asset.url;
  }

  /**
   * Registers custom user uploaded video/audio/image file
   */
  public registerUserFile(file: File): MediaAsset {
    const objectUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    const isImage = file.type.startsWith('image/');

    let type: 'video' | 'audio' | 'image' = 'video';
    if (isAudio) type = 'audio';
    if (isImage) type = 'image';

    const asset: MediaAsset = {
      id: `user_upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: file.name,
      category: 'User Upload',
      type: type,
      url: objectUrl,
      thumbnailUrl: isImage
        ? objectUrl
        : generateGradientThumbnail('#374151', '#4b5563', isVideo ? '🎥 VIDEO' : '🎵 AUDIO'),
      duration: isVideo ? 10 : isAudio ? 15 : 5,
      description: `Berkas diunggah pengguna: ${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    };

    this.mediaAssets.unshift(asset);
    return asset;
  }
}
