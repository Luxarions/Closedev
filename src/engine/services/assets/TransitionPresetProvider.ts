export interface TransitionPreset {
  id: string;
  name: string;
  type: string;
  duration: number;
  thumbnailUrl: string;
}

export class TransitionPresetProvider {
  public constructor() {}

  public _getTransitionPresets(): TransitionPreset[] {
    return [
      {
        id: 'trn-1',
        name: 'Fade Cross Dissolve',
        type: 'dissolve',
        duration: 0.8,
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&h=100&fit=crop'
      },
      {
        id: 'trn-2',
        name: 'Wipe Left Slide',
        type: 'wipe_left',
        duration: 0.6,
        thumbnailUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&h=100&fit=crop'
      },
      {
        id: 'trn-3',
        name: 'Zoom Punch In',
        type: 'zoom',
        duration: 0.5,
        thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150&h=100&fit=crop'
      }
    ];
  }
}
