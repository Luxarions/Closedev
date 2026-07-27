/**
 * Effects and Transitions Library Specifications
 */

export interface EffectPreset {
  id: string;
  name: string;
  category: 'Trending' | 'Glitch' | 'Retro' | 'Light' | 'Distortion' | 'Party';
  icon: string; // Lucide icon name or image
  thumbnailUrl?: string;
  description: string;
  defaultIntensity: number;
}

export interface TransitionPreset {
  id: string;
  name: string;
  category: 'Basic' | 'Camera' | 'Glitch' | 'Light Leak' | 'Blur' | 'Slide';
  icon: string;
  thumbnailUrl?: string;
  description: string;
  defaultDuration: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  category: 'Featured' | 'Film' | 'Portrait' | 'Retro' | 'Cyberpunk' | 'Nature';
  thumbnailUrl?: string;
  filterValues: {
    brightness: number;
    contrast: number;
    saturate: number;
    hueRotate: number;
    blur: number;
    sepia: number;
    temperature: number;
  };
}

export const EFFECT_PRESETS: EffectPreset[] = [
  {
    id: 'vhs_glitch',
    name: 'VHS Retro Glitch',
    category: 'Glitch',
    icon: 'Tv',
    description: 'Sensasi pita kaset VHS jadul dengan scanlines & chromatic aberration',
    defaultIntensity: 70,
  },
  {
    id: 'zoom_blur',
    name: 'Dynamic Motion Zoom',
    category: 'Trending',
    icon: 'Zap',
    description: 'Efek zoom cepat berkecepatan tinggi dengan efek buram gerakan',
    defaultIntensity: 80,
  },
  {
    id: 'rgb_split',
    name: 'RGB Split 3D',
    category: 'Glitch',
    icon: 'Layers',
    description: 'Pemisahan saluran warna Merah, Hijau, dan Biru bergaya cyberpunk',
    defaultIntensity: 65,
  },
  {
    id: 'neon_glow',
    name: 'Cyber Neon Aura',
    category: 'Light',
    icon: 'Sparkles',
    description: 'Pencahayaan neon bercahaya terang di area garis tepi objek',
    defaultIntensity: 75,
  },
  {
    id: 'vintage_film',
    name: 'Old Film Grain & Dust',
    category: 'Retro',
    icon: 'Film',
    description: 'Tekstur film seluloid 16mm dengan bintik debu & goresan nostalgia',
    defaultIntensity: 60,
  },
  {
    id: 'light_leak',
    name: 'Warm Light Leak',
    category: 'Light',
    icon: 'Sun',
    description: 'Sinar cahaya keemasan dari tepi lensa kamera vintage',
    defaultIntensity: 50,
  },
  {
    id: 'vignette_dark',
    name: 'Cinematic Vignette',
    category: 'Retro',
    icon: 'Disc',
    description: 'Bayangan sudut gelap khas film layar lebar Hollywood',
    defaultIntensity: 65,
  },
  {
    id: 'shake_party',
    name: 'Bass Beat Shake',
    category: 'Party',
    icon: 'Activity',
    description: 'Guncangan tempo musik bergetar cepat cocok untuk jedag-jedug',
    defaultIntensity: 85,
  },
];

export const TRANSITION_PRESETS: TransitionPreset[] = [
  {
    id: 'cross_dissolve',
    name: 'Cross Dissolve',
    category: 'Basic',
    icon: 'Blend',
    description: 'Peleburan halus antara dua klip video',
    defaultDuration: 0.8,
  },
  {
    id: 'fade_to_black',
    name: 'Fade to Black',
    category: 'Basic',
    icon: 'EyeOff',
    description: 'Meredup perlahan ke hitam lalu muncul klip berikutnya',
    defaultDuration: 0.7,
  },
  {
    id: 'zoom_spin_in',
    name: 'Zoom Spin In',
    category: 'Camera',
    icon: 'RotateCw',
    description: 'Putaran zoom dramatis memasuki klip berikutnya',
    defaultDuration: 0.6,
  },
  {
    id: 'slide_push_left',
    name: 'Slide Push Left',
    category: 'Slide',
    icon: 'MoveLeft',
    description: 'Pendorongan klip ke arah kiri dengan mulus',
    defaultDuration: 0.5,
  },
  {
    id: 'glitch_flash',
    name: 'Cyber Glitch Flash',
    category: 'Glitch',
    icon: 'Zap',
    description: 'Kilatan glitch digital saat pergantian klip',
    defaultDuration: 0.4,
  },
  {
    id: 'wipe_right',
    name: 'Wipe Diagonal',
    category: 'Slide',
    icon: 'ArrowUpRight',
    description: 'Usapan diagonal cepat membuka gambar baru',
    defaultDuration: 0.6,
  },
];

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'normal',
    name: 'Original / Normal',
    category: 'Featured',
    filterValues: {
      brightness: 100,
      contrast: 100,
      saturate: 100,
      hueRotate: 0,
      blur: 0,
      sepia: 0,
      temperature: 0,
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    category: 'Cyberpunk',
    filterValues: {
      brightness: 110,
      contrast: 135,
      saturate: 160,
      hueRotate: 310,
      blur: 0,
      sepia: 0,
      temperature: -30,
    },
  },
  {
    id: 'warm_sunset',
    name: 'Warm Golden Sunset',
    category: 'Nature',
    filterValues: {
      brightness: 108,
      contrast: 115,
      saturate: 130,
      hueRotate: 15,
      blur: 0,
      sepia: 25,
      temperature: 45,
    },
  },
  {
    id: 'cinematic_moody',
    name: 'Cinematic Moody Teal',
    category: 'Film',
    filterValues: {
      brightness: 95,
      contrast: 140,
      saturate: 115,
      hueRotate: 180,
      blur: 0,
      sepia: 10,
      temperature: -20,
    },
  },
  {
    id: 'retro_monochrome',
    name: 'Noir Monochrome B&W',
    category: 'Retro',
    filterValues: {
      brightness: 105,
      contrast: 150,
      saturate: 0,
      hueRotate: 0,
      blur: 0,
      sepia: 10,
      temperature: 0,
    },
  },
  {
    id: 'vivid_pop',
    name: 'Vivid Pastel Pop',
    category: 'Portrait',
    filterValues: {
      brightness: 115,
      contrast: 120,
      saturate: 175,
      hueRotate: 350,
      blur: 0,
      sepia: 0,
      temperature: 10,
    },
  },
];
