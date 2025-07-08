// Import core types and classes for the TrustGraph API
import { Triple, Value } from "./Triple";
import { ServiceCallMulti } from "./service-call-multi";
import { ServiceCall } from "./service-call";

// Import all message types for different services
import {
  //  AgentRequest,
  AgentResponse,
  ApiResponse,
  ConfigRequest,
  ConfigResponse,
  //  DocumentMetadata,
  EmbeddingsRequest,
  EmbeddingsResponse,
  FlowRequest,
  FlowResponse,
  GraphEmbeddingsQueryRequest,
  GraphEmbeddingsQueryResponse,
  GraphRagRequest,
  GraphRagResponse,
  //  KnowledgeRequest,
  //  KnowledgeResponse,
  LibraryRequest,
  LibraryResponse,
  LoadDocumentRequest,
  LoadDocumentResponse,
  LoadTextRequest,
  //  LoadTextResponse,
  //  ProcessingMetadata,
  RequestMessage,
  TextCompletionRequest,
  TextCompletionResponse,
  TriplesQueryRequest,
  TriplesQueryResponse,
  //  EntityEmbeddings,
  //  Error,
  //  GraphEmbedding,
  //  Metadata,
  //  Request,
  //  Response,
} from "./messages";

// Configuration constants
const SOCKET_RECONNECTION_TIMEOUT = 2000; // 2 seconds between reconnection
// attempts
const SOCKET_URL = "/api/socket"; // WebSocket endpoint path

/**
 * Socket interface defining all available operations for the TrustGraph API
 * This provides a unified interface for various AI/ML and knowledge graph
 * operations
 */
export interface Socket {
  close: () => void;

  // Text completion using AI models
  textCompletion: (system: string, text: string) => Promise<string>;

  // Graph-based Retrieval Augmented Generation
  graphRag: (text: string) => Promise<string>;

  // Agent interaction with streaming callbacks for different phases
  agent: (
    question: string,
    think: (t: string) => void, // Called when agent is thinking
    observe: (t: string) => void, // Called when agent makes observations
    answer: (t: string) => void, // Called when agent provides final answer
    error: (e: string) => void, // Called on errors
  ) => void;

  // Generate embeddings for text
  embeddings: (text: string) => Promise<number[][]>;

  // Query graph using embedding vectors
  graphEmbeddingsQuery: (vecs: number[][], limit: number) => Promise<Value[]>;

  // Query knowledge graph triples (subject-predicate-object)
  triplesQuery: (
    s?: Value, // Subject (optional)
    p?: Value, // Predicate (optional)
    o?: Value, // Object (optional)
    limit?: number,
  ) => Promise<Triple[]>;

  // Load a document into the system
  loadDocument: (
    document: string, // Base64-encoded document
    id?: string, // Optional document ID
    metadata?: Triple[], // Optional metadata as triples
  ) => Promise<void>;

  // Load plain text into the system
  loadText: (text: string, id?: string, metadata?: Triple[]) => Promise<void>;

  // Load a document into the library with full metadata
  loadLibraryDocument: (
    document: string,
    id?: string,
    metadata?: Triple[],
    mimeType: string,
  ) => Promise<void>;
}

/**
 * Generates a random message ID using cryptographically secure random values
 * @param length - Number of random characters to generate
 * @returns Random string of specified length
 */
function makeid(length: number) {
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  const characters = "abcdefghijklmnopqrstuvwxyz1234567890";

  return array.reduce(
    (acc, current) => acc + characters[current % characters.length],
    "",
  );
}

/**
 * BaseApi - Core WebSocket client for TrustGraph API
 * Manages connection lifecycle, message routing, and provides base request
 * functionality
 */
export class BaseApi {
  ws?: WebSocket; // WebSocket connection instance
  tag: string; // Unique client identifier
  id: number; // Counter for generating unique message IDs
  inflight: { [key: string]: ServiceCall } = {}; // Track active requests by
  // message ID

  constructor() {
    this.tag = makeid(16); // Generate unique client tag
    this.id = 1; // Start message ID counter
    this.openSocket(); // Establish WebSocket connection
  }

  /**
   * Establishes WebSocket connection and sets up event handlers
   */
  openSocket() {
    this.ws = new WebSocket(SOCKET_URL);

    // Handle incoming messages from server
    const onMessage = (message: MessageEvent) => {
      if (!message.data) return;

      const obj = JSON.parse(message.data);

      // Skip messages without ID (can't route them)
      if (!obj.id) return;

      // Route response to the corresponding inflight request
      if (this.inflight[obj.id]) {
        this.inflight[obj.id].onReceived(obj.response);
      } else {
        // Message ID not recognized - likely already processed or timed out
        // Commented out to reduce noise:
        // console.log("Message ID", obj.id, "not known");
      }
    };

    // Handle connection closure - automatically attempt reconnection
    const onClose = () => {
      console.log("[socket close]");
      this.ws = undefined;
      setTimeout(() => {
        this.reopen();
      }, SOCKET_RECONNECTION_TIMEOUT);
    };

    // Log successful connection
    const onOpen = () => {
      console.log("[socket open]");
    };

    // Attach event listeners
    this.ws.addEventListener("message", onMessage);
    this.ws.addEventListener("close", onClose);
    this.ws.addEventListener("open", onOpen);
  }

  /**
   * Reopens the WebSocket connection (used after connection failures)
   */
  reopen() {
    console.log("[socket reopen]");
    this.openSocket();
  }

  /**
   * Closes the WebSocket connection and cleans up
   */
  close() {
    // Note: Could potentially leak WebSocket references if event listeners
    // aren't removed
    // Currently commented out to avoid potential issues
    // with handler references
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }

  /**
   * Generates the next unique message ID for requests
   * Format: {clientTag}-{incrementingNumber}
   */
  getNextId() {
    const mid = this.tag + "-" + this.id.toString();
    this.id++;
    return mid;
  }

  /**
   * Core method for making service requests over WebSocket
   * @param service - Name of the service to call
   * @param request - Request payload
   * @param timeout - Request timeout in milliseconds (default: 10000)
   * @param retries - Number of retry attempts (default: 3)
   * @param flow - Optional flow identifier
   * @returns Promise resolving to the service response
   */
  makeRequest<RequestType, ResponseType>(
    service: string,
    request: RequestType,
    timeout?: number,
    retries?: number,
    flow?: string,
  ) {
    const mid = this.getNextId();

    // Set default values
    if (timeout == undefined) timeout = 10000;
    if (retries == undefined) retries = 3;

    // Construct the request message
    const msg: RequestMessage = {
      id: mid,
      service: service,
      request: request,
    };

    // Add flow identifier if provided
    if (flow) msg.flow = flow;

    // Return a Promise that will be resolved/rejected by the ServiceCall
    return new Promise<ResponseType>((resolve, reject) => {
      const call = new ServiceCall(
        mid,
        msg,
        resolve,
        reject,
        timeout,
        retries,
        this,
      );

      call.start();
      // Commented out debug logging: console.log("-->", msg);
    }).then((obj) => {
      // Commented out success logging: console.log("Success for", mid);
      return obj as ResponseType;
    });
  }

  /**
   * Makes a request that can receive multiple responses (streaming)
   * Used for operations that return data in chunks
   */
  makeRequestMulti<RequestType, ResponseType>(
    service: string,
    request: RequestType,
    receiver, // Callback to handle each response chunk
    timeout?: number,
    retries?: number,
    flow?: string,
  ) {
    const mid = this.getNextId();

    // Set defaults
    if (timeout == undefined) timeout = 10000;
    if (retries == undefined) retries = 3;

    // Construct request message
    const msg: RequestMessage = {
      id: mid,
      service: service,
      request: request,
    };

    if (flow) msg.flow = flow;

    return new Promise<ResponseType>((resolve, reject) => {
      const call = new ServiceCallMulti(
        mid,
        msg,
        resolve,
        reject,
        timeout,
        retries,
        this,
        receiver,
      );

      call.start();
    }).then((obj) => {
      return obj as ResponseType;
    });
  }

  /**
   * Convenience method for making flow-specific requests
   * Defaults to "default" flow if none specified
   */
  makeFlowRequest<RequestType, ResponseType>(
    service: string,
    request: RequestType,
    timeout?: number,
    retries?: number,
    flow?: string,
  ) {
    if (!flow) flow = "default";

    return this.makeRequest<RequestType, ResponseType>(
      service,
      request,
      timeout,
      retries,
      flow,
    );
  }

  // Factory methods for creating specialized API instances
  librarian() {
    return new LibrarianApi(this);
  }

  flows() {
    return new FlowsApi(this);
  }

  flow(id) {
    return new FlowApi(this, id);
  }

  knowledge() {
    return new KnowledgeApi(this);
  }

  config() {
    return new ConfigApi(this);
  }
}

/**
 * LibrarianApi - Manages document storage and retrieval
 * Handles document lifecycle including upload, processing, and removal
 */
export class LibrarianApi {
  constructor(api) {
    this.api = api;
  }

  /**
   * Retrieves list of all documents in the system
   */
  getDocuments() {
    return this.api
      .makeRequest<LibrarianRequest, LibrarianResponse>(
        "librarian",
        {
          operation: "list-documents",
          user: "trustgraph",
        },
        60000, // 60 second timeout for potentially large lists
      )
      .then((r) => r["document-metadatas"]);
  }

  /**
   * Retrieves list of documents currently being processed
   */
  getProcessing() {
    return this.api
      .makeRequest<LibrarianRequest, LibrarianResponse>(
        "librarian",
        {
          operation: "list-processing",
          user: "trustgraph",
        },
        60000,
      )
      .then((r) => r["processing-metadatas"]);
  }

  /**
   * Uploads a document to the library with full metadata
   * @param document - Base64-encoded document content
   * @param id - Optional document identifier
   * @param metadata - Optional metadata as triples
   * @param mimeType - Document MIME type
   * @param title - Document title
   * @param comments - Additional comments
   * @param tags - Document tags for categorization
   * @param user - User identifier
   */
  loadDocument(
    document: string, // base64-encoded doc
    id?: string,
    metadata?: Triple[],
    mimeType: string,
    title: string,
    comments: string,
    tags: string[],
    user: string,
  ) {
    return this.api.makeRequest<LibraryRequest, LibraryResponse>(
      "librarian",
      {
        operation: "add-document",
        "document-metadata": {
          id: id,
          time: Math.floor(Date.now() / 1000), // Unix timestamp
          kind: mimeType,
          title: title,
          comments: comments,
          metadata: metadata,
          user: user ? user : "trustgraph",
          tags: tags,
        },
        content: document,
      },
      30000, // 30 second timeout for document upload
    );
  }

  /**
   * Removes a document from the library
   */
  removeDocument(id: string, user: string) {
    return this.api.makeRequest<LibraryRequest, LibraryResponse>(
      "librarian",
      {
        operation: "remove-document",
        "document-id": id,
        user: user ? user : "trustgraph",
      },
      30000,
    );
  }

  /**
   * Adds a document to the processing queue
   * @param id - Processing job identifier
   * @param doc_id - Document to process
   * @param flow - Processing flow to use
   * @param user - User identifier
   * @param collection - Collection to add processed data to
   * @param tags - Tags for the processing job
   */
  addProcessing(
    id: string,
    doc_id: string,
    flow: string,
    user?: string,
    collection?: string,
    tags?: string[],
  ) {
    return this.api.makeRequest<LibraryRequest, LibraryResponse>(
      "librarian",
      {
        operation: "add-processing",
        "processing-metadata": {
          id: id,
          "document-id": doc_id,
          time: Math.floor(Date.now() / 1000),
          flow: flow,
          user: user ? user : "trustgraph",
          collection: collection ? collection : "default",
          tags: tags ? tags : [],
        },
      },
      30000,
    );
  }
}

/**
 * FlowsApi - Manages processing flows and configuration
 * Flows define how documents and data are processed through the system
 */
export class FlowsApi {
  constructor(api) {
    this.api = api;
  }

  /**
   * Retrieves list of available flows
   */
  getFlows() {
    return this.api
      .makeRequest<FlowRequest, FlowResponse>(
        "flow",
        {
          operation: "list-flows",
        },
        60000,
      )
      .then((r) => r["flow-ids"]);
  }

  /**
   * Retrieves definition of a specific flow
   */
  getFlow(id: string) {
    return this.api
      .makeRequest<FlowRequest, FlowResponse>(
        "flow",
        {
          operation: "get-flow",
          "flow-id": id,
        },
        60000,
      )
      .then((r) => JSON.parse(r.flow)); // Parse JSON flow definition
  }

  // Configuration management methods

  /**
   * Retrieves all configuration settings
   */
  getConfigAll() {
    return this.api.makeRequest<ConfigRequest, ConfigResponse>(
      "config",
      {
        operation: "config",
      },
      60000,
    );
  }

  /**
   * Retrieves specific configuration values by key
   */
  getConfig(keys: { type: string; key: string }[]) {
    return this.api.makeRequest<ConfigRequest, ConfigResponse>(
      "config",
      {
        operation: "get",
        keys: keys,
      },
      60000,
    );
  }

  /**
   * Updates configuration values
   */
  putConfig(values: { type: string; key: string; value: string }[]) {
    return this.api.makeRequest<ConfigRequest, ConfigResponse>(
      "config",
      {
        operation: "put",
        values: values,
      },
      60000,
    );
  }

  /**
   * Deletes configuration entries
   */
  deleteConfig(keys: { type: string; key: string }) {
    return this.api.makeRequest<ConfigRequest, ConfigResponse>(
      "config",
      {
        operation: "delete",
        keys: keys,
      },
      30000,
    );
  }

  // Prompt management - specialized config operations for AI prompts

  /**
   * Retrieves list of available prompt templates
   */
  getPrompts() {
    return this.api
      .getConfigAll()
      .then((r) => JSON.parse(r.config.prompt["template-index"]));
  }

  /**
   * Retrieves a specific prompt template
   */
  getPrompt(id: string) {
    return this.getConfigAll().then((r) =>
      JSON.parse(r.config.prompt[`template.${id}`]),
    );
  }

  /**
   * Retrieves the system prompt configuration
   */
  getSystemPrompt() {
    return this.getConfigAll().then((r) =>
      JSON.parse(r.config.prompt.system),
    );
  }

  // Flow class management - templates for creating flows

  /**
   * Retrieves list of available flow classes (templates)
   */
  getFlowClasses() {
    return this.api
      .makeRequest<FlowRequest, FlowResponse>(
        "flow",
        {
          operation: "list-classes",
        },
        60000,
      )
      .then((r) => r["class-names"]);
  }

  /**
   * Retrieves definition of a specific flow class
   */
  getFlowClass(name: string) {
    return this.api
      .makeRequest<FlowRequest, FlowResponse>(
        "flow",
        {
          operation: "get-class",
          "class-name": name,
        },
        60000,
      )
      .then((r) => JSON.parse(r["class-definition"]));
  }

  // Flow lifecycle management

  /**
   * Starts a new flow instance
   */
  startFlow(id: string, class_name: string, description: string) {
    return this.api.makeRequest<LibraryRequest, LibraryResponse>(
      "flow",
      {
        operation: "start-flow",
        "flow-id": id,
        "class-name": class_name,
        description: description,
      },
      30000,
    );
  }

  /**
   * Stops a running flow instance
   */
  stopFlow(id: string) {
    return this.api.makeRequest<LibraryRequest, LibraryResponse>(
      "flow",
      {
        operation: "stop-flow",
        "flow-id": id,
      },
      30000,
    );
  }
}

/**
 * FlowApi - Interface for interacting with a specific flow instance
 * Provides flow-specific versions of core AI/ML operations
 */
export class FlowApi {
  constructor(api, flowId) {
    this.api = api;
    this.flowId = flowId; // All requests will be routed through this flow
  }

  /**
   * Performs text completion using AI models within this flow
   */
  textCompletion(system: string, text: string): Promise<string> {
    return this.api
      .makeRequest<TextCompletionRequest, TextCompletionResponse>(
        "text-completion",
        {
          system: system, // System prompt/instructions
          prompt: text, // User prompt
        },
        30000,
        null, // Use default retries
        this.flowId, // Route through this flow
      )
      .then((r) => r.response);
  }

  /**
   * Performs Graph RAG (Retrieval Augmented Generation) query
   */
  graphRag(text: string) {
    return this.api
      .makeRequest<GraphRagRequest, GraphRagResponse>(
        "graph-rag",
        {
          query: text,
        },
        60000, // Longer timeout for complex graph operations
        null,
        this.flowId,
      )
      .then((r) => r.response);
  }

  /**
   * Interacts with an AI agent that provides streaming responses
   * Note: This implementation appears to have some issues and inconsistencies
   */
  agent(
    question: string,
    think: (s: string) => void, // Called when agent is thinking
    observe: (s: string) => void, // Called when agent observes something
    answer: (s: string) => void, // Called when agent provides answer
    error: (s: string) => void, // Called on errors
  ) {
    const mid = this.api.getNextId();

    // Manually construct message (bypasses normal request flow)
    const msg = JSON.stringify({
      id: mid,
      service: "agent",
      request: {
        question: question,
      },
    });

    const err = (e: string) => {
      error(e);
      console.log("Error:", e);
    };

    // Handle agent responses - different types trigger different callbacks
    const ok = (e: ApiResponse) => {
      const resp = e.response as AgentResponse;
      if (resp.thought) think(resp.thought);
      if (resp.observation) observe(resp.observation);
      if (resp.answer) {
        answer(resp.answer);
        // Clean up when final answer is received
        // Note: This code has syntax errors and inconsistent property access
        clearTimeout(this.api, inflight[mid].timeoutId);
        delete this.inflight[mid];
      }
    };

    const timeout = 60000;
    const retries = 2;

    // Manual inflight tracking (inconsistent with rest of API)
    this.inflight[mid] = {
      success: ok,
      error: err,
      timeoutId: setTimeout(() => this.timeout(mid), timeout),
      timeout: timeout,
      retries: retries,
    };

    // Send message if WebSocket is available
    if (this.ws) {
      this.ws.send(msg);
    } else {
      // TODO: Queue for later sending when connection is available
    }
  }

  /**
   * Generates embeddings for text within this flow
   */
  embeddings(text: string) {
    return this.api
      .makeRequest<EmbeddingsRequest, EmbeddingsResponse>(
        "embeddings",
        {
          text: text,
        },
        30000,
        null,
        this.flowId,
      )
      .then((r) => r.vectors);
  }

  /**
   * Queries the knowledge graph using embedding vectors
   */
  graphEmbeddingsQuery(vecs: number[][], limit: number | undefined) {
    return this.api
      .makeRequest<GraphEmbeddingsQueryRequest, GraphEmbeddingsQueryResponse>(
        "graph-embeddings",
        {
          vectors: vecs,
          limit: limit ? limit : 20, // Default to 20 results
        },
        30000,
        null,
        this.flowId,
      )
      .then((r) => r.entities);
  }

  /**
   * Queries knowledge graph triples (subject-predicate-object relationships)
   * All parameters are optional - omitted parameters act as wildcards
   */
  triplesQuery(s?: Value, p?: Value, o?: Value, limit?: number) {
    return this.api
      .makeRequest<TriplesQueryRequest, TriplesQueryResponse>(
        "triples",
        {
          s: s, // Subject
          p: p, // Predicate
          o: o, // Object
          limit: limit ? limit : 20,
        },
        30000,
        null,
        this.flowId,
      )
      .then((r) => r.response);
  }

  /**
   * Loads a document into this flow for processing
   */
  loadDocument(
    document: string, // base64-encoded document
    id?: string,
    metadata?: Triple[],
  ) {
    return this.api.makeRequest<LoadDocumentRequest, LoadDocumentResponse>(
      "document-load",
      {
        id: id,
        metadata: metadata,
        data: document,
      },
      30000,
      null,
      this.flowId,
    );
  }

  /**
   * Loads plain text into this flow for processing
   */
  loadText(
    text: string, // Text content
    id?: string,
    metadata?: Triple[],
    charset?: string, // Character encoding
  ) {
    return this.api.makeRequest<LoadTextRequest, LoadTextResponse>(
      "text-load",
      {
        id: id,
        metadata: metadata,
        text: text,
        charset: charset,
      },
      30000,
      null,
      this.flowId,
    );
  }
}

/**
 * ConfigApi - Dedicated configuration management interface
 * Handles system configuration, prompts, and token cost tracking
 */
export class ConfigApi {
  constructor(api) {
    this.api = api;
  }

  /**
   * Retrieves complete configuration
   */
  getConfigAll() {
    return this.api.makeRequest<ConfigRequest, ConfigResponse>(
      "config",
      {
        operation: "config",
      },
      60000,
    );
  }

  /**
   * Retrieves specific configuration entries
   */
  getConfig(keys: { type: string; key: string }[]) {
    return this.api.makeRequest<ConfigRequest, ConfigResponse>(
      "config",
      {
        operation: "get",
        keys: keys,
      },
      60000,
    );
  }

  /**
   * Updates configuration values
   */
  putConfig(values: { type: string; key: string; value: string }[]) {
    return this.api.makeRequest<ConfigRequest, ConfigResponse>(
      "config",
      {
        operation: "put",
        values: values,
      },
      60000,
    );
  }

  /**
   * Deletes configuration entries
   */
  deleteConfig(keys: { type: string; key: string }) {
    return this.api.makeRequest<ConfigRequest, ConfigResponse>(
      "config",
      {
        operation: "delete",
        keys: keys,
      },
      30000,
    );
  }

  // Specialized prompt management methods

  /**
   * Retrieves available prompt templates
   */
  getPrompts() {
    return this.api
      .getConfigAll()
      .then((r) => JSON.parse(r.config.prompt["template-index"]));
  }

  /**
   * Retrieves a specific prompt template
   */
  getPrompt(id: string) {
    return this.api
      .getConfigAll()
      .then((r) => JSON.parse(r.config.prompt[`template.${id}`]));
  }

  /**
   * Retrieves system prompt configuration
   */
  getSystemPrompt() {
    return this.api
      .getConfigAll()
      .then((r) => JSON.parse(r.config.prompt.system));
  }

  /**
   * Lists available configuration types
   */
  list(type: string) {
    return this.api.makeRequest<ConfigRequest, ConfigResponse>(
      "config",
      {
        operation: "list",
        type: type,
      },
      60000,
    ).then((r) => r);
  }

  /**
   * Retrieves all key/values for a specific type
   */
  getValues(type: string) {
    return this.api.makeRequest<ConfigRequest, ConfigResponse>(
      "config",
      {
        operation: "getvalues",
        type: type,
      },
      60000,
    ).then((r) => r.values);
  }

  /**
   * Retrieves token cost information for different AI models
   * Useful for cost tracking and optimization
   */
  getTokenCosts() {
    return this.api
      .makeRequest<ConfigRequest, ConfigResponse>(
        "config",
        {
          operation: "getvalues",
          type: "token-costs",
        },
        60000,
      )
      .then((r) =>
        // Parse JSON values and restructure data
        r.values.map((x) => {
          return { key: x.key, value: JSON.parse(x.value) };
        }),
      )
      .then((r) =>
        // Transform to more usable format
        r.map((x) => {
          return {
            model: x.key,
            input_price: x.value.input_price, // Cost per input token
            output_price: x.value.output_price, // Cost per output token
          };
        }),
      );
  }
}

/**
 * KnowledgeApi - Manages knowledge graph cores and data
 * Knowledge cores appear to be collections of processed knowledge graph data
 */
export class KnowledgeApi {
  constructor(api) {
    this.api = api;
  }

  /**
   * Retrieves list of available knowledge graph cores
   */
  getKnowledgeCores() {
    return this.api
      .makeRequest<FlowRequest, FlowResponse>(
        "knowledge",
        {
          operation: "list-kg-cores",
          user: "trustgraph",
        },
        60000,
      )
      .then((r) => r.ids);
  }

  /**
   * Deletes a knowledge graph core
   */
  deleteKgCore(id: string, user?: string) {
    return this.api.makeRequest<LibraryRequest, LibraryResponse>(
      "knowledge",
      {
        operation: "delete-kg-core",
        id: id,
        user: user ? user : "trustgraph",
      },
      30000,
    );
  }

  /**
   * Deletes a knowledge graph core
   */
  loadKgCore(id: string, flow: string, user?: string, collection?: string) {
    return this.api.makeRequest<LibraryRequest, LibraryResponse>(
      "knowledge",
      {
        operation: "load-kg-core",
        id: id,
        flow: flow,
        user: user ? user : "trustgraph",
        collection: collection ? collection : "default",
      },
      30000,
    );
  }

  /**
   * Retrieves a knowledge graph core with streaming data
   * Uses multi-request pattern for large datasets
   * @param receiver - Callback function to handle streaming data chunks
   */
  getKgCore(id: string, user?: string, receiver) {
    // Wrapper to handle end-of-stream detection
    const recv = (msg) => {
      if (msg.eos) {
        // End of stream - notify receiver and signal completion
        receiver(msg, true);
        return true;
      } else {
        // Regular message - continue streaming
        receiver(msg, false);
        return false;
      }
    };

    return this.api.makeRequestMulti<LibraryRequest, LibraryResponse>(
      "knowledge",
      {
        operation: "get-kg-core",
        id: id,
        user: user ? user : "trustgraph",
      },
      recv, // Stream handler
      30000,
    );
  }
}

/**
 * Factory function to create a new TrustGraph WebSocket connection
 * This is the main entry point for using the TrustGraph API
 */
export const createTrustGraphSocket = (): Socket => {
  return new BaseApi();
};
