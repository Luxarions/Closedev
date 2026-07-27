import { MediaAsset, StockMediaProvider } from './assets/StockMediaProvider';
import { TextPreset, StickerPreset, TextPresetProvider } from './assets/TextPresetProvider';
import { FilterPreset, FilterPresetProvider } from './assets/FilterPresetProvider';
import { TransitionPreset, TransitionPresetProvider } from './assets/TransitionPresetProvider';
import { generateGradientThumbnail } from '../utils/colorUtils';

export type { MediaAsset, TextPreset, StickerPreset, FilterPreset, TransitionPreset };

export class AssetStore {
  private static _instance: AssetStore | null = null;

  private _stockMediaProvider: StockMediaProvider;
  private _textPresetProvider: TextPresetProvider;
  private _filterPresetProvider: FilterPresetProvider;
  private _transitionPresetProvider: TransitionPresetProvider;

  public constructor() {
    this._stockMediaProvider = new StockMediaProvider();
    this._textPresetProvider = new TextPresetProvider();
    this._filterPresetProvider = new FilterPresetProvider();
    this._transitionPresetProvider = new TransitionPresetProvider();
  }

  public static getInstance(): AssetStore {
    if (!AssetStore._instance) {
      AssetStore._instance = new AssetStore();
    }
    return AssetStore._instance;
  }

  public initializeDefaults(): void {
    // Defaults are loaded on initialization
  }

  public getMediaAssets(): MediaAsset[] {
    return this._stockMediaProvider._getStockMedia();
  }

  public async getPreparedMediaAssetUrl(assetId: string): Promise<string> {
    const asset = this.getMediaAssets().find(a => a.id === assetId);
    return asset ? asset.url : '';
  }

  public addUploadedAsset(asset: MediaAsset): void {
    this._stockMediaProvider._addUploadedAsset(asset);
  }

  public registerUserFile(file: File): MediaAsset {
    const objectUrl = URL.createObjectURL(file);
    const isAudio = file.type.startsWith('audio/');
    const isImage = file.type.startsWith('image/');

    const newAsset: MediaAsset = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: file.name,
      category: 'User Upload',
      type: isImage ? 'image' : isAudio ? 'audio' : 'video',
      url: objectUrl,
      thumbnailUrl: generateGradientThumbnail('#1F1C2C', '#928DAB', file.name.substring(0, 10)),
      duration: 10,
      description: `File unggahan lokal: ${file.name}`,
      author: 'Pengguna',
      tags: ['upload', 'lokal']
    };

    this.addUploadedAsset(newAsset);
    return newAsset;
  }

  public getTextPresets(): TextPreset[] {
    return this._textPresetProvider._getTextPresets();
  }

  public getStickerPresets(): StickerPreset[] {
    return this._textPresetProvider._getStickerPresets();
  }

  public getFilterPresets(): FilterPreset[] {
    return this._filterPresetProvider._getFilterPresets();
  }

  public getTransitionPresets(): TransitionPreset[] {
    return this._transitionPresetProvider._getTransitionPresets();
  }
}

// Export alias for backward compatibility
export const AssetStoreService = AssetStore;
