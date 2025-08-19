export interface Settings {
  authentication: {
    apiKey: string;
  };
  graphrag: {
    entityLimit: number;
    tripleLimit: number;
    maxSubgraphSize: number;
    pathLength: number;
  };
  featureSwitches: {
    taxonomyEditor: boolean;
    submissions: boolean;
  };
}

export const DEFAULT_SETTINGS: Settings = {
  authentication: {
    apiKey: '',
  },
  graphrag: {
    entityLimit: 50,
    tripleLimit: 30,
    maxSubgraphSize: 1000,
    pathLength: 2,
  },
  featureSwitches: {
    taxonomyEditor: false,
    submissions: false,
  },
};

export const SETTINGS_STORAGE_KEY = 'trustgraph-settings';