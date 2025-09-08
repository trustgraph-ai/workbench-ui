export interface Settings {
  user: string;
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
    ontologyEditor: boolean;
    submissions: boolean;
    agentTools: boolean;
    mcpTools: boolean;
    schemas: boolean;
    tokenCost: boolean;
    flowClasses: boolean;
    structuredQuery: boolean;
  };
}

export const DEFAULT_SETTINGS: Settings = {
  user: "trustgraph", // Default user ID
  authentication: {
    apiKey: "",
  },
  graphrag: {
    entityLimit: 50,
    tripleLimit: 30,
    maxSubgraphSize: 1000,
    pathLength: 2,
  },
  featureSwitches: {
    ontologyEditor: false,
    submissions: false,
    agentTools: true, // On by default
    mcpTools: false, // Off by default
    schemas: false, // Off by default
    tokenCost: false, // Off by default
    flowClasses: false, // Off by default
    structuredQuery: false, // Off by default
  },
};

export const SETTINGS_STORAGE_KEY = "trustgraph-settings";
