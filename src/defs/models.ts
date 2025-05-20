
type ModelDescriptor = { id : string, description : string };
type ModelCatalog = { [ix : string] : ModelDescriptor[] };

import modelsRaw from './model-catalog.json';
export const models = modelsRaw as ModelCatalog;

