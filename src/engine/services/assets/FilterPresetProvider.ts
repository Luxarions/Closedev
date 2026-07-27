export interface FilterPreset {
  id: string;
  name: string;
  type: string;
  thumbnailUrl: string;
}

export class FilterPresetProvider {
  public constructor() {}

  public _getFilterPresets(): FilterPreset[] {
    return [
      {
        id: 'flt-1',
        name: 'Sinematik Teal & Orange',
        type: 'vintage',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=150&h=100&fit=crop'
      },
      {
        id: 'flt-2',
        name: 'Glitch Cyber Wave',
        type: 'glitch',
        thumbnailUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=150&h=100&fit=crop'
      },
      {
        id: 'flt-3',
        name: 'Soft Dream Blur',
        type: 'blur',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=150&h=100&fit=crop'
      },
      {
        id: 'flt-4',
        name: 'Monochrome Noir',
        type: 'blackwhite',
        thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&h=100&fit=crop'
      }
    ];
  }
}
