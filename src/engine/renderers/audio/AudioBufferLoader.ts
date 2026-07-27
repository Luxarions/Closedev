import { AudioContextManager } from './AudioContextManager';

export class AudioBufferLoader {
  private _bufferCache: Map<string, AudioBuffer> = new Map();

  public constructor() {}

  public async _loadAudioBuffer(url: string, contextManager: AudioContextManager): Promise<AudioBuffer | null> {
    if (this._bufferCache.has(url)) {
      return this._bufferCache.get(url)!;
    }

    try {
      const ctx = contextManager._getAudioContext();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      this._bufferCache.set(url, decodedBuffer);
      return decodedBuffer;
    } catch (err) {
      console.warn('Gagal memuat buffer audio:', url, err);
      return null;
    }
  }
}
