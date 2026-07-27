import { generateGradientThumbnail } from '../../utils/colorUtils';

export interface MediaAsset {
  id: string;
  title: string;
  category: 'Video' | 'Audio' | 'Sticker' | 'Text' | 'User Upload';
  type: 'video' | 'audio' | 'image' | 'text' | 'sticker';
  url: string;
  thumbnailUrl: string;
  duration: number;
  description?: string;
  author?: string;
  tags?: string[];
}

export class StockMediaProvider {
  private _userUploadedAssets: MediaAsset[] = [];

  public constructor() {}

  public _getStockMedia(): MediaAsset[] {
    const stockAssets: MediaAsset[] = [
      {
        id: 'stock-video-1',
        title: 'Cinematic Sunset Beach',
        category: 'Video',
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: generateGradientThumbnail('#FF512F', '#DD2476', 'Sunset Beach'),
        duration: 15,
        description: 'Pemandangan pantai senja yang tenang dengan ombak lembut.',
        author: 'CapCut Creator Library',
        tags: ['pantai', 'sunset', 'cinematic', 'estetik']
      },
      {
        id: 'stock-video-2',
        title: 'Cyberpunk Neon City',
        category: 'Video',
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: generateGradientThumbnail('#00F2FE', '#4FACFE', 'Cyberpunk Neon'),
        duration: 20,
        description: 'Lampu neon kota di malam hari bergaya futuristik.',
        author: 'CapCut Creator Library',
        tags: ['neon', 'cyberpunk', 'kota', 'malam']
      },
      {
        id: 'stock-video-3',
        title: 'Nature Forest Waterfall',
        category: 'Video',
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: generateGradientThumbnail('#11998e', '#38ef7d', 'Forest Waterfall'),
        duration: 12,
        description: 'Air terjun alami di tengah hutan tropis yang segar.',
        author: 'CapCut Creator Library',
        tags: ['hutan', 'air terjun', 'alam', 'hijau']
      },
      {
        id: 'stock-audio-1',
        title: 'Upbeat Lo-Fi Chill Beats',
        category: 'Audio',
        type: 'audio',
        url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
        thumbnailUrl: generateGradientThumbnail('#8E2DE2', '#4A00E0', 'Lo-Fi Beat'),
        duration: 30,
        description: 'Musik santai cocok untuk vlog harian dan intro video.',
        author: 'CapCut Audio Team',
        tags: ['lofi', 'chill', 'vlog', 'musik']
      },
      {
        id: 'stock-audio-2',
        title: 'Energetic EDM Beat Drop',
        category: 'Audio',
        type: 'audio',
        url: 'https://actions.google.com/sounds/v1/sports/crowd_cheer.ogg',
        thumbnailUrl: generateGradientThumbnail('#F12711', '#F5AF19', 'EDM Drop'),
        duration: 25,
        description: 'Beat penuh energi cocok untuk transisi cepat dan olahraga.',
        author: 'CapCut Audio Team',
        tags: ['edm', 'energetik', 'beat', 'trend']
      }
    ];

    return [...stockAssets, ...this._userUploadedAssets];
  }

  public _addUploadedAsset(asset: MediaAsset): void {
    this._userUploadedAssets.unshift(asset);
  }
}
