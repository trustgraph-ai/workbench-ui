
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
}

export interface GraphRagResponse {
  response: string;
}

export interface AgentRequest {
  question: string;
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
}

export interface GraphEmbeddingsQueryResponse {
  entities: Value[];
}

export interface TriplesQueryRequest {
  s?: Value;
  p?: Value;
  o?: Value;
  limit: number;
}

export interface TriplesQueryResponse {
  response: Triple[];
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

type LoadTextResponse = void;

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
  document_id?: string;
  time?: number;
  flow?: string;
  user?: string;
  collection?: string;
  tags?: string[];
}

export interface LibraryRequest {
  operation: string;
  document_id?: string;
  processing_id?: string;
  document_metadata?: DocumentMetadata;
  processing_metadata?: ProcessingMetadata;
  content?: string;
  user?: string;
  collection?: string;
  metadata?: Triple[];
}

export interface LibraryResponse {
  error: Error;
  document_metadata?: DocumentMetadata;
  content?: string;
  document_metadatas?: DocumentMetadata[];
  processing_metadata?: ProcessingMetadata;
}

export interface KnowledgeRequest {
  operation: string;
  user?: string;
  id?: string;
  flow?: string;
  collection?: string;
  triples?: Triple[];
  graphEmbeddings?: GraphEmbeddings;
}

export interface KnowledgeResponse {
  error?: Error;
  ids?: string[];
  eos?: boolean;
  triples?: Triple[];
  graphEmbeddings?: GraphEmbeddings;
}

export interface FlowRequest {
  operation: string;
  class_name?: string;
  class_definition?: string;
  description?: string;
  flow_id?: string;
}

export interface FlowResponse {
  class_names?: string[];
  flow_ids?: string[];
  class_definition?: string;
  flow?: string;
  description?: string;
  error?: Error;
}

export type ConfigRequest = object;
export type ConfigResponse = object;


