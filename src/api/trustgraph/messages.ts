// FIXME: Better types?
export type Request = object;
export type Response = object;
export type Error = object | string;

export interface RequestMessage {
  id: string;
  service: string;
  request: Request;
}

export interface ApiResponse {
  id: string;
  response: Response;
}

export interface Metadata {
  id?: string;
  metadata?: Triple[];
  user?: string;
  collection?: string;
}

export interface EntityEmbeddings {
  entity?: Value;
  vectors?: number[][];
}

export interface GraphEmbeddings {
  metadata?: Metadata;
  entities?: EntityEmbedding[];
}

export interface TextCompletionRequest {
  system: string;
  prompt: string;
}

export interface TextCompletionResponse {
  response: string;
}

export interface GraphRagRequest {
  query: string;
  user?: string;
  collection?: string;
  "entity-limit"?: number; // Default: 50
  "triple-limit"?: number; // Default: 30
  "max-subgraph-size"?: number; // Default: 1000
  "max-path-length"?: number; // Default: 2
}

export interface GraphRagResponse {
  response: string;
}

export interface DocumentRagRequest {
  query: string;
  user?: string;
  collection?: string;
  "doc-limit"?: number; // Default: 20
}

export interface DocumentRagResponse {
  response: string;
}

export interface AgentRequest {
  question: string;
  user?: string;
}

export interface AgentResponse {
  thought?: string;
  observation?: string;
  answer?: string;
  error?: string;
}

export interface EmbeddingsRequest {
  text: string;
}

export interface EmbeddingsResponse {
  vectors: number[][];
}

export interface GraphEmbeddingsQueryRequest {
  vectors: number[][];
  limit: number;
  user?: string;
  collection?: string;
}

export interface GraphEmbeddingsQueryResponse {
  entities: Value[];
}

export interface TriplesQueryRequest {
  s?: Value;
  p?: Value;
  o?: Value;
  limit: number;
  user?: string;
  collection?: string;
}

export interface TriplesQueryResponse {
  response: Triple[];
}

export interface ObjectsQueryRequest {
  query: string;
  user?: string;
  collection?: string;
  variables?: any;
  operation_name?: string;
}

export interface ObjectsQueryResponse {
  data?: any;
  errors?: any[];
  extensions?: any;
}

export interface NlpQueryRequest {
  question: string;
  max_results?: number;
}

export interface NlpQueryResponse {
  graphql_query?: string;
  variables?: any;
  detected_schemas?: any[];
  confidence?: number;
}

export interface StructuredQueryRequest {
  question: string;
  user?: string;
  collection?: string;
}

export interface StructuredQueryResponse {
  data?: any;
  errors?: any[];
}

export interface LoadDocumentRequest {
  id?: string;
  data: string;
  metadata?: Triple[];
}

export type LoadDocumentResponse = void;

export interface LoadTextRequest {
  id?: string;
  text: string;
  charset?: string;
  metadata?: Triple[];
}

export type LoadTextResponse = void;

export interface DocumentMetadata {
  id?: string;
  time?: number;
  kind?: string;
  title?: string;
  comments?: string;
  metadata?: Triple[];
  user?: string;
  tags?: string[];
}

export interface ProcessingMetadata {
  id?: string;
  "document-id"?: string;
  time?: number;
  flow?: string;
  user?: string;
  collection?: string;
  tags?: string[];
}

export interface LibraryRequest {
  operation: string;
  "document-id"?: string;
  "processing-id"?: string;
  "document-metadata"?: DocumentMetadata;
  "processing-metadata"?: ProcessingMetadata;
  content?: string;
  user?: string;
  collection?: string;
  metadata?: Triple[];
}

export interface LibraryResponse {
  error: Error;
  "document-metadata"?: DocumentMetadata;
  content?: string;
  "document-metadatas"?: DocumentMetadata[];
  "processing-metadata"?: ProcessingMetadata;
}

export interface KnowledgeRequest {
  operation: string;
  user?: string;
  id?: string;
  flow?: string;
  collection?: string;
  triples?: Triple[];
  "graph-embeddings"?: GraphEmbeddings;
}

export interface KnowledgeResponse {
  error?: Error;
  ids?: string[];
  eos?: boolean;
  triples?: Triple[];
  "graph-embeddings"?: GraphEmbeddings;
}

export interface FlowRequest {
  operation: string;
  "class-name"?: string;
  "class-definition"?: string;
  description?: string;
  "flow-id"?: string;
}

export interface FlowResponse {
  "class-names"?: string[];
  "flow-ids"?: string[];
  "class-definition"?: string;
  flow?: string;
  description?: string;
  error?: Error;
}

export type ConfigRequest = object;
export type ConfigResponse = object;
