import { Triple, Value } from "./Triple";
import { ServiceCallMulti } from "./service-call-multi";
import { ServiceCall } from "./service-call";

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

//type Timeout = ReturnType<typeof setTimeout>;

const SOCKET_RECONNECTION_TIMEOUT = 2000;
const SOCKET_URL = "/api/socket";

export interface Socket {
  close: () => void;

  textCompletion: (system: string, text: string) => Promise<string>;

  graphRag: (text: string) => Promise<string>;

  agent: (
    question: string,
    think: (t: string) => void,
    observe: (t: string) => void,
    answer: (t: string) => void,
    error: (e: string) => void,
  ) => void;

  embeddings: (text: string) => Promise<number[][]>;

  graphEmbeddingsQuery: (vecs: number[][], limit: number) => Promise<Value[]>;

  triplesQuery: (
    s?: Value,
    p?: Value,
    o?: Value,
    limit?: number,
  ) => Promise<Triple[]>;

  loadDocument: (
    document: string,
    id?: string,
    metadata?: Triple[],
  ) => Promise<void>;

  loadText: (text: string, id?: string, metadata?: Triple[]) => Promise<void>;

  loadLibraryDocument: (
    document: string,
    id?: string,
    metadata?: Triple[],
    mimeType: string,
  ) => Promise<void>;
}

// Create a random message ID
function makeid(length: number) {
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  const characters = "abcdefghijklmnopqrstuvwxyz1234567890";

  return array.reduce(
    (acc, current) => acc + characters[current % characters.length],
    "",
  );
}

export class BaseApi {
  ws?: WebSocket;
  tag: string;
  id: number;
  inflight: { [key: string]: ServiceCall } = {};

  constructor() {
    this.tag = makeid(16);
    this.id = 1;

    this.openSocket();
  }

  openSocket() {
    this.ws = new WebSocket(SOCKET_URL);

    const onMessage = (message: MessageEvent) => {
      if (!message.data) return;

      const obj = JSON.parse(message.data);

      //            console.log("<--", obj);

      if (!obj.id) return;

      if (this.inflight[obj.id]) {
        this.inflight[obj.id].onReceived(obj.response);
      } else {
        //                console.log("Message ID", obj.id, "not known");
      }
    };

    const onClose = () => {
      console.log("[socket close]");
      this.ws = undefined;
      setTimeout(() => {
        this.reopen();
      }, SOCKET_RECONNECTION_TIMEOUT);
    };

    const onOpen = () => {
      console.log("[socket open]");
    };

    this.ws.addEventListener("message", onMessage);
    this.ws.addEventListener("close", onClose);
    this.ws.addEventListener("open", onOpen);
  }

  reopen() {
    console.log("[socket reopen]");
    this.openSocket();
  }

  close() {
    // Maybe these 'leak' websocket references?
    //        this.ws.removeEventListener("message", onMessage);
    //        this.ws.removeEventListener("close", onClose);
    //        this.ws.removeEventListener("open", doOpen);
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }

  getNextId() {
    const mid = this.tag + "-" + this.id.toString();
    this.id++;
    return mid;
  }

  makeRequest<RequestType, ResponseType>(
    service: string,
    request: RequestType,
    timeout?: number,
    retries?: number,
    flow?: string,
  ) {
    const mid = this.getNextId();

    if (timeout == undefined) timeout = 10000;

    if (retries == undefined) retries = 3;

    const msg: RequestMessage = {
      id: mid,
      service: service,
      request: request,
    };

    if (flow) msg.flow = flow;

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

      //            console.log("-->", msg);
    }).then((obj) => {
      //                console.log("Success for", mid);
      return obj as ResponseType;
    });
  }

  makeRequestMulti<RequestType, ResponseType>(
    service: string,
    request: RequestType,
    receiver,
    timeout?: number,
    retries?: number,
    flow?: string,
  ) {
    const mid = this.getNextId();

    if (timeout == undefined) timeout = 10000;

    if (retries == undefined) retries = 3;

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

      //            console.log("-->", msg);
    }).then((obj) => {
      //                console.log("Success for", mid);
      return obj as ResponseType;
    });
  }

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

export class LibrarianApi {
  constructor(api) {
    this.api = api;
  }

  getDocuments() {
    return this.api
      .makeRequest<LibrarianRequest, LibrarianResponse>(
        "librarian",
        {
          operation: "list-documents",
          user: "trustgraph",
        },
        60000,
      )
      .then((r) => r["document-metadatas"]);
  }

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

  loadDocument(
    // base64-encoded doc
    document: string,

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
          time: Math.floor(Date.now() / 1000),
          kind: mimeType,
          title: title,
          comments: comments,
          metadata: metadata,
          user: user ? user : "trustgraph",
          tags: tags,
        },
        content: document,
      },
      30000,
    );
  }

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

export class FlowsApi {
  constructor(api) {
    this.api = api;
  }

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
      .then((r) => JSON.parse(r.flow));
  }

  getConfigAll() {
    return this.api.makeRequest<ConfigRequest, ConfigResponse>(
      "config",
      {
        operation: "config",
      },
      60000,
    );
  }

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

  getPrompts() {
    return this.api
      .getConfigAll()
      .then((r) => JSON.parse(r.config.prompt["template-index"]));
  }

  getPrompt(id: string) {
    return this.getConfigAll().then((r) =>
      JSON.parse(r.config.prompt[`template.${id}`]),
    );
  }

  getSystemPrompt() {
    return this.getConfigAll().then((r) =>
      JSON.parse(r.config.prompt.system),
    );
  }

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

export class FlowApi {
  constructor(api, flowId) {
    this.api = api;
    this.flowId = flowId;
  }

  textCompletion(system: string, text: string): Promise<string> {
    return this.api
      .makeRequest<TextCompletionRequest, TextCompletionResponse>(
        "text-completion",
        {
          system: system,
          prompt: text,
        },
        30000,
        null, // retries
        this.flowId, // Flow ID
      )
      .then((r) => r.response);
  }

  graphRag(text: string) {
    return this.api
      .makeRequest<GraphRagRequest, GraphRagResponse>(
        "graph-rag",
        {
          query: text,
        },
        60000,
        null,
        this.flowId,
      )
      .then((r) => r.response);
  }

  agent(
    question: string,
    think: (s: string) => void,
    observe: (s: string) => void,
    answer: (s: string) => void,
    error: (s: string) => void,
  ) {
    const mid = this.api.getNextId();

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

    const ok = (e: ApiResponse) => {
      const resp = e.response as AgentResponse;
      if (resp.thought) think(resp.thought);
      if (resp.observation) observe(resp.observation);
      if (resp.answer) {
        answer(resp.answer);

        clearTimeout(this.api, inflight[mid].timeoutId);
        delete this.inflight[mid];
      }
    };

    const timeout = 60000;
    const retries = 2;

    this.inflight[mid] = {
      success: ok,
      error: err,
      timeoutId: setTimeout(() => this.timeout(mid), timeout),
      timeout: timeout,
      retries: retries,
    };

    if (this.ws) {
      this.ws.send(msg);
    } else {
      // Arrange for send later
    }
  }

  embeddings(text: string) {
    return this.api
      .makeFlowRequest<EmbeddingsRequest, EmbeddingsResponse>(
        "embeddings",
        {
          text: text,
        },
        30000,
      )
      .then((r) => r.vectors);
  }

  graphEmbeddingsQuery(vecs: number[][], limit: number | undefined) {
    return this.api
      .makeFlowRequest<
        GraphEmbeddingsQueryRequest,
        GraphEmbeddingsQueryResponse
      >(
        "graph-embeddings",
        {
          vectors: vecs,
          limit: limit ? limit : 20,
        },
        30000,
      )
      .then((r) => r.entities);
  }

  triplesQuery(s?: Value, p?: Value, o?: Value, limit?: number) {
    return this.api
      .makeFlowRequest<TriplesQueryRequest, TriplesQueryResponse>(
        "triples",
        {
          s: s,
          p: p,
          o: o,
          limit: limit ? limit : 20,
        },
        30000,
      )
      .then((r) => r.response);
  }

  loadDocument(
    // base64-encoded doc
    document: string,

    id?: string,
    metadata?: Triple[],
  ) {
    return this.api.makeFlowRequest<
      LoadDocumentRequest,
      LoadDocumentResponse
    >(
      "document-load",
      {
        id: id,
        metadata: metadata,
        data: document,
      },
      30000,
    );
  }

  loadText(
    // base64-encoded doc
    text: string,

    id?: string,
    metadata?: Triple[],

    charset?: string,
  ) {
    return this.api.makeFlowRequest<LoadTextRequest, LoadTextResponse>(
      "text-load",
      {
        id: id,
        metadata: metadata,
        text: text,
        charset: charset,
      },
      30000,
    );
  }
}

export class ConfigApi {
  constructor(api) {
    this.api = api;
  }

  getConfigAll() {
    return this.api.makeRequest<ConfigRequest, ConfigResponse>(
      "config",
      {
        operation: "config",
      },
      60000,
    );
  }

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

  getPrompts() {
    return this.api
      .getConfigAll()
      .then((r) => JSON.parse(r.config.prompt["template-index"]));
  }

  getPrompt(id: string) {
    return this.api
      .getConfigAll()
      .then((r) => JSON.parse(r.config.prompt[`template.${id}`]));
  }

  getSystemPrompt() {
    return this.api
      .getConfigAll()
      .then((r) => JSON.parse(r.config.prompt.system));
  }

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
        r.values.map((x) => {
          return { key: x.key, value: JSON.parse(x.value) };
        }),
      )
      .then((r) =>
        r.map((x) => {
          return {
            model: x.key,
            input_price: x.value.input_price,
            output_price: x.value.output_price,
          };
        }),
      );
  }
}

export class KnowledgeApi {
  constructor(api) {
    this.api = api;
  }

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

  getKgCore(id: string, user?: string, receiver) {
    const recv = (msg) => {
      if (msg.eos) {
        receiver(msg, true);
        return true;
      } else {
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
      recv,
      30000,
    );
  }
}

export const createTrustGraphSocket = (): Socket => {
  return new BaseApi();
};
