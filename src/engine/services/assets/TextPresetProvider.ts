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

export class TextPresetProvider {
  public constructor() {}

  public _getTextPresets(): TextPreset[] {
    return [
      {
        id: 'txt-1',
        name: 'Judul Modern Neon',
        content: 'NAMA JUDUL ANDA',
        fontFamily: 'Montserrat',
        fontSize: 54,
        color: '#00F2FE',
        strokeColor: '#000000',
        strokeWidth: 4,
        animationStyle: 'glow',
        thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=200&h=120&fit=crop'
      },
      {
        id: 'txt-2',
        name: 'Typewriter Subtitle',
        content: 'Teks bergerak mengetik otomatis...',
        fontFamily: 'Inter',
        fontSize: 36,
        color: '#FFFFFF',
        backgroundColor: 'rgba(0,0,0,0.7)',
        animationStyle: 'typewriter',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=120&fit=crop'
      },
      {
        id: 'txt-3',
        name: 'Vlog Bold Callout',
        content: 'HIILIGHT HARI INI!',
        fontFamily: 'Impact',
        fontSize: 64,
        color: '#FFEA00',
        strokeColor: '#111111',
        strokeWidth: 6,
        animationStyle: 'bounce',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=200&h=120&fit=crop'
      }
    ];
  }

  public _getStickerPresets(): StickerPreset[] {
    return [
      {
        id: 'stk-1',
        name: 'Subscribe Button Red',
        svgContent: '<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="#FF0000"/></svg>',
        url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&h=120&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&h=120&fit=crop'
      },
      {
        id: 'stk-2',
        name: 'Fire Emoji Trend',
        svgContent: '<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="#FF6B00"/></svg>',
        url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=120&h=120&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=120&h=120&fit=crop'
      }
    ];
  }
}
