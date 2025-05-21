import { Triple, Value } from "../state/Triple";

type Timeout = ReturnType<typeof setTimeout>;

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

class ServiceCall {
  constructor(
    mid: string,
    msg: RequestMessage,
    success: (resp: Response) => void,
    error: (err: Error) => void,
    timeout: number,
    retries: number,
    socket: Socket,
  ) {
    this.mid = mid;
    this.msg = msg;
    this.success = success;
    this.error = error;
    this.timeout = timeout;
    this.retries = retries;
    this.socket = socket;
    this.complete = false;
  }

  mid: string;
  success: (resp: object) => void; // FIXME: any
  error: (err: object | string) => void; // FIXME: any
  timeoutId: Timeout;
  timeout: number;
  retries: number;
  socket: Socket;
  complete: boolean;

  start() {
    this.socket.inflight[this.mid] = this;
    this.attempt();
  }

  onReceived(resp: object) {
    if (this.complete == true)
      console.log(this.mid, "should not happen, request is already complete");

    this.complete = true;

    //        console.log("Received for", this.mid);
    clearTimeout(this.timeoutId);
    this.timeoutId = null;
    delete this.socket.inflight[this.mid];
    this.success(resp);
  }

  onTimeout() {
    if (this.complete == true)
      console.log(
        this.mid,
        "timeout should not happen, request is already complete",
      );

    console.log("Request", this.mid, "timed out");
    clearTimeout(this.timeoutId);
    this.attempt();
  }

  attempt() {
    //        console.log("attempt:", this.mid);

    if (this.complete == true)
      console.log(
        this.mid,
        "attempt should not be called, request is already complete",
      );

    this.retries--;

    if (this.retries < 0) {
      console.log("Request", this.mid, "ran out of retries");

      clearTimeout(this.timeoutId);
      delete this.socket.inflight[this.mid];

      this.error("Ran out of retries");
    }

    if (this.socket.ws) {
      try {
        this.socket.ws.send(JSON.stringify(this.msg));
        this.timeoutId = setTimeout(this.onTimeout, this.timeout);

        return;
      } catch (e) {
        console.log("Error:", e);
        console.log("Message send failure, retry...");

        this.timeoutId = setTimeout(
          this.attempt,
          SOCKET_RECONNECTION_TIMEOUT,
        );
      }
    } else {
      setTimeout(this.attempt, SOCKET_RECONNECTION_TIMEOUT);
    }
  }
}

class ServiceCallMulti {
  constructor(
    mid: string,
    msg: RequestMessage,
    success: (resp: Response) => void,
    error: (err: Error) => void,
    timeout: number,
    retries: number,
    socket: Socket,
    receiver,
  ) {
    this.mid = mid;
    this.msg = msg;
    this.success = success;
    this.error = error;
    this.timeout = timeout;
    this.retries = retries;
    this.socket = socket;
    this.complete = false;
    this.receiver = receiver;
  }

  mid: string;
  success: (resp: object) => void; // FIXME: any
  error: (err: object | string) => void; // FIXME: any
  timeoutId: Timeout;
  timeout: number;
  retries: number;
  socket: Socket;
  complete: boolean;

  start() {
    this.socket.inflight[this.mid] = this;
    this.attempt();
  }

  onReceived(resp: object) {
    if (this.complete == true)
      console.log(this.mid, "should not happen, request is already complete");

      const fin = this.receiver(resp);

      if (fin) {


          this.complete = true;

          //        console.log("Received for", this.mid);
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
          delete this.socket.inflight[this.mid];
          this.success(resp);
      }

  }

  onTimeout() {
    if (this.complete == true)
      console.log(
        this.mid,
        "timeout should not happen, request is already complete",
      );

    console.log("Request", this.mid, "timed out");
    clearTimeout(this.timeoutId);
    this.attempt();
  }

  attempt() {
    //        console.log("attempt:", this.mid);

    if (this.complete == true)
      console.log(
        this.mid,
        "attempt should not be called, request is already complete",
      );

    this.retries--;

    if (this.retries < 0) {
      console.log("Request", this.mid, "ran out of retries");

      clearTimeout(this.timeoutId);
      delete this.socket.inflight[this.mid];

      this.error("Ran out of retries");
    }

    if (this.socket.ws) {
      try {
        this.socket.ws.send(JSON.stringify(this.msg));
        this.timeoutId = setTimeout(this.onTimeout, this.timeout);

        return;
      } catch (e) {
        console.log("Error:", e);
        console.log("Message send failure, retry...");

        this.timeoutId = setTimeout(
          this.attempt,
          SOCKET_RECONNECTION_TIMEOUT,
        );
      }
    } else {
      setTimeout(this.attempt, SOCKET_RECONNECTION_TIMEOUT);
    }
  }
}

export interface Metadata {
    id? : string;
    metadata? : Triple[];
    user? : string;
    collection? : string;
};


export interface EntityEmbeddings {
    entity? : Value;
    vectors? : number[][];

};

export interface GraphEmbeddings {
    metadata? : Metadata;
    entities? : EntityEmbedding[];
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
    user? : string;
    id? : string;
    flow? : string;
    collection? : string;
    triples? : Triple[];
    graphEmbeddings? : GraphEmbeddings;
}

export interface KnowledgeResponse {
  error?: Error;
    ids? : string[];
    eos? : boolean;
    triples? : Triple[];
    graphEmbeddings? : Graphembeddings;
}

export interface TextCompletionResponse {
  response: string;
}

function makeid(length: number) {
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  const characters = "abcdefghijklmnopqrstuvwxyz1234567890";

  return array.reduce(
    (acc, current) => acc + characters[current % characters.length],
    "",
  );
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

export type KnowledgeRequest = object;
export type KnowledgeResponse = object;

export class SocketImplementation {
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
    if (!flow) flow = "0000";

    return this.makeRequest<RequestType, ResponseType>(
      service,
      request,
      timeout,
      retries,
      flow,
    );
  }

  textCompletion(system: string, text: string): Promise<string> {
    return this.makeFlowRequest<
      TextCompletionRequest,
      TextCompletionResponse
    >(
      "text-completion",
      {
        system: system,
        prompt: text,
      },
      30000,
    ).then((r) => r.response);
  }

  graphRag(text: string) {
    return this.makeFlowRequest<GraphRagRequest, GraphRagResponse>(
      "graph-rag",
      {
        query: text,
      },
      60000,
    ).then((r) => r.response);
  }

  getFlows() {
    return this.makeRequest<FlowRequest, FlowResponse>(
      "flow",
      {
        operation: "list-flows",
      },
      60000,
    ).then((r) => r["flow-ids"]);
  }

  getFlow(id: string) {
    return this.makeRequest<FlowRequest, FlowResponse>(
      "flow",
      {
        operation: "get-flow",
        "flow-id": id,
      },
      60000,
    ).then((r) => JSON.parse(r.flow));
  }

  getConfigAll() {
    return this.makeRequest<FlowRequest, FlowResponse>(
      "config",
      {
        operation: "config",
      },
      60000,
    );
  }

  getConfig(keys: { type: string; key: string }[]) {
    return this.makeRequest<FlowRequest, FlowResponse>(
      "config",
      {
        operation: "get",
        keys: keys,
      },
      60000,
    );
  }

  putConfig(values: { type: string; key: string; value: string }[]) {
    return this.makeRequest<FlowRequest, FlowResponse>(
      "config",
      {
        operation: "put",
        values: values,
      },
      60000,
    );
  }

  getPrompts() {
    return this.getConfigAll().then((r) =>
      JSON.parse(r.config.prompt["template-index"]),
    );
  }

  getPrompt(id: string) {
    return this.getConfigAll().then((r) =>
      JSON.parse(r.config.prompt[`template.${id}`]),
    );
  }
  /*
    setPrompt(
      id : string, prompt : string, responseType : string,
      schema : any,
    ) {
      

      return this.getConfigAll().then(
          (r) => JSON.parse(r.config.prompt[`template.${id}`])
      );
    }
*/
  getSystemPrompt() {
    return this.getConfigAll().then((r) =>
      JSON.parse(r.config.prompt.system),
    );
  }

  getFlowClasses() {
    return this.makeRequest<FlowRequest, FlowResponse>(
      "flow",
      {
        operation: "list-classes",
      },
      60000,
    ).then((r) => r["class-names"]);
  }

  getKnowledgeCores() {
    return this.makeRequest<FlowRequest, FlowResponse>(
      "knowledge",
      {
        operation: "list-kg-cores",
        user: "trustgraph",
      },
      60000,
    ).then((r) => r.ids);
  }

  getTokenCosts() {
    return this.makeRequest<ConfigRequest, ConfigResponse>(
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

  getFlowClass(name: string) {
    return this.makeRequest<FlowRequest, FlowResponse>(
      "flow",
      {
        operation: "get-class",
        "class-name": name,
      },
      60000,
    ).then((r) => JSON.parse(r["class-definition"]));
  }

  getLibraryDocuments() {
    return this.makeRequest<LibrarianRequest, LibrarianResponse>(
      "librarian",
      {
        operation: "list-documents",
        user: "trustgraph",
      },
      60000,
    ).then((r) => r["document-metadatas"]);
  }
  getLibraryProcessing() {
    return this.makeRequest<LibrarianRequest, LibrarianResponse>(
      "librarian",
      {
        operation: "list-processing",
        user: "trustgraph",
      },
      60000,
    ).then((r) => r["processing-metadatas"]);
  }

  agent(
    question: string,
    think: (s: string) => void,
    observe: (s: string) => void,
    answer: (s: string) => void,
    error: (s: string) => void,
  ) {
    const mid = this.getNextId();

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

        clearTimeout(this.inflight[mid].timeoutId);
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
    return this.makeFlowRequest<EmbeddingsRequest, EmbeddingsResponse>(
      "embeddings",
      {
        text: text,
      },
      30000,
    ).then((r) => r.vectors);
  }

  graphEmbeddingsQuery(vecs: number[][], limit: number | undefined) {
    return this.makeFlowRequest<
      GraphEmbeddingsQueryRequest,
      GraphEmbeddingsQueryResponse
    >(
      "graph-embeddings",
      {
        vectors: vecs,
        limit: limit ? limit : 20,
      },
      30000,
    ).then((r) => r.entities);
  }

  triplesQuery(s?: Value, p?: Value, o?: Value, limit?: number) {
    return this.makeFlowRequest<TriplesQueryRequest, TriplesQueryResponse>(
      "triples",
      {
        s: s,
        p: p,
        o: o,
        limit: limit ? limit : 20,
      },
      30000,
    ).then((r) => r.response);
  }

  loadDocument(
    // base64-encoded doc
    document: string,

    id?: string,
    metadata?: Triple[],
  ) {
    return this.makeFlowRequest<LoadDocumentRequest, LoadDocumentResponse>(
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
    return this.makeFlowRequest<LoadTextRequest, LoadTextResponse>(
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

  loadLibraryDocument(
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
    return this.makeRequest<LibraryRequest, LibraryResponse>(
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

  removeLibraryDocument(id: string, user: string) {
    return this.makeRequest<LibraryRequest, LibraryResponse>(
      "librarian",
      {
        operation: "remove-document",
        "document-id": id,
        user: user ? user : "trustgraph",
      },
      30000,
    );
  }

  addLibraryProcessing(
    id: string,
    doc_id: string,
    flow: string,
    user?: string,
    collection?: string,
    tags?: string[],
  ) {
    return this.makeRequest<LibraryRequest, LibraryResponse>(
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

  startFlow(id: string, class_name: string, description: string) {
    return this.makeRequest<LibraryRequest, LibraryResponse>(
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
    return this.makeRequest<LibraryRequest, LibraryResponse>(
      "flow",
      {
        operation: "stop-flow",
        "flow-id": id,
      },
      30000,
    );
  }

  deleteKgCore(id: string, user?: string) {
    return this.makeRequest<LibraryRequest, LibraryResponse>(
      "knowledge",
      {
        operation: "delete-kg-core",
          id: id,
          user: user ? user : "trustgraph",
      },
      30000,
    );
  }

    getKgCore(id : string, user?: string, receiver) {

      const recv = (msg) => {

          if (msg.eos) {
              receiver(msg, true);
              return true;
          } else {
              receiver(msg, false);
              return false;
          }
            
      }

    return this.makeRequestMulti<LibraryRequest, LibraryResponse>(
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
  return new SocketImplementation();
};
