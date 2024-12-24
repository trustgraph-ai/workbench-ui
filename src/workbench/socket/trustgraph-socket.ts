
import { Triple, Value } from '../state/Triple';

const SOCKET_RECONNECTION_TIMEOUT = 2000;
const SOCKET_URL = "/api/socket";

export interface Socket {

    close : () => void;

    textCompletion : (system : string, text : string) => Promise<string>;

    graphRag : (text : string) => Promise<string>;

    agent : (
        question : string,
        think : (t : string) => void,
        observe : (t : string) => void,
        answer : (t : string) => void,
        error : (e : string) => void,
    ) => void;

    embeddings : (text : string) => Promise<number[][]>;

    graphEmbeddingsQuery : (
        vecs : number[][], limit : number
    ) => Promise<Value[]>;

    triplesQuery : (
        s? : Value, p? : Value, o? : Value, limit? : number
    ) => Promise<Triple[]>;

};

export interface ApiResponse {
    id : string;
    response : any;
};

export interface Callbacks {
    success : (resp: any) => void;
    error : (err : any) => void;
};

export interface TextCompletionRequest {
    system : string;
    prompt : string;
};

export interface TextCompletionResponse {
    response : string;
};

export interface GraphRagRequest {
    query : string;
};

export interface GraphRagResponse {
    response : string;
};

export interface AgentRequest {
    question : string;
};

export interface AgentResponse {
    thought? : string;
    observation? : string;
    answer? : string;
    error? : string;
};

export interface EmbeddingsRequest {
    text : string;
};

export interface EmbeddingsResponse {
    vectors : number[][];
};

export interface GraphEmbeddingsQueryRequest {
    vectors : number[][];
    limit : number;
};

export interface GraphEmbeddingsQueryResponse {
    entities : Value[];
};

export interface TriplesQueryRequest {
    s? : Value;
    p? : Value;
    o? : Value;
    limit : number;
};

export interface TriplesQueryResponse {
    response : Triple[];
};

// FIXME: Should use something more 'unique', cryptorand
function makeid(length : number) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
      );
      counter += 1;
    }
    return result;
}


export class SocketImplementation {

    ws : WebSocket;
    tag : string;
    id : number;
    inFlight : { [key : string] : Callbacks } = {};

    constructor() {

        this.ws = new WebSocket(SOCKET_URL);
        this.tag = makeid(8);
        this.id = 1;

        const onMessage = (message : MessageEvent) => {

            if (!message.data) return;


            const obj = JSON.parse(message.data);

            console.log("<--", obj);

            if (!obj.id) return;

            if (this.inFlight[obj.id]) {
                this.inFlight[obj.id].success(obj.response);
            }

        };

        const onClose = () => {
            console.log("[socket close]");
            setTimeout(
                () => { this.reopen() }, 
                SOCKET_RECONNECTION_TIMEOUT,
            );
        };

        const onOpen = () => {
            console.log("[socket open]");
        }

        this.ws.addEventListener("message", onMessage);
        this.ws.addEventListener("close", onClose);
        this.ws.addEventListener("open", onOpen);

    }

    reopen() {
        this.ws = new WebSocket(SOCKET_URL);
    }

    close() {
          // Maybe these 'leak' websocket references?
//        this.ws.removeEventListener("message", onMessage);
//        this.ws.removeEventListener("close", onClose);
//        this.ws.removeEventListener("open", doOpen);
        this.ws.close();
    }

    getNextId() {
        const mid = this.tag + "-" + this.id.toString();
        this.id++;
        return mid;
    }

    makeRequest<RequestType, ResponseType>(
        service : string, request : RequestType
    ) {

        const mid = this.getNextId();

        const msg = {
            id: mid,
            service: service,
            request: request,
        };

        return new Promise<ResponseType>((resolve, reject) => {
            this.inFlight[mid] = { success: resolve, error: reject};

            console.log("-->", msg);

            this.ws.send(JSON.stringify(msg));

        }).then(
            (obj) => {
                delete this.inFlight[mid];
                return (obj as ResponseType);
            }
        );
    }


    textCompletion(system : string, text : string) : Promise<string> {
        return this.makeRequest<TextCompletionRequest, TextCompletionResponse>(
            "text-completion",
            {
                system: system,
                prompt: text,
            }
        ).then(r => r.response);
    }

    graphRag(text : string) {
        return this.makeRequest<GraphRagRequest, GraphRagResponse>(
            "graph-rag",
            {
                query: text,
            }
        ).then(r => r.response);
    }

    agent(
        question : string,
        think : (s : string) => void,
        observe : (s : string) => void,
        answer : (s : string) => void,
        error : (s : string) => void,
    ) {

        const mid = this.getNextId();

        const msg = JSON.stringify({
            "id": mid,
            "service": "agent",
            "request": {
                "question": question,
            }

        });

        const err = (e : string) => {
            error(e);
            console.log("Error:", e);
        };

        const ok = (e : ApiResponse) => {
            const resp = (e.response as AgentResponse);
            if (resp.thought) think(resp.thought);
            if (resp.observation) observe(resp.observation);
            if (resp.answer) {
                answer(resp.answer);
                delete this.inFlight[mid];
            }
        };

        this.inFlight[mid] = { success: ok, error: err};

        this.ws.send(msg);

    }

    embeddings(text : string) {
        return this.makeRequest<EmbeddingsRequest, EmbeddingsResponse>(
            "embeddings",
            {
                text: text,
            }
        ).then(r => r.vectors);
    }

    graphEmbeddingsQuery(
        vecs : number[][],
        limit : number | undefined,
    ) {
        return this.makeRequest<
            GraphEmbeddingsQueryRequest, GraphEmbeddingsQueryResponse
        >(
            "graph-embeddings-query",
            {
                vectors: vecs,
                limit: limit ? limit : 20,
            }
        ).then(r => r.entities);

    }

    triplesQuery(
        s? : Value,
        p? : Value,
        o? : Value,
        limit? : number,
    ) {
        return this.makeRequest<TriplesQueryRequest, TriplesQueryResponse>(
            "triples-query",
            {
                s: s, p: p, o: o,
                limit: limit ? limit : 20,
            }
        ).then(r => r.response);
    }

};

export const createTrustGraphSocket = () : Socket => {
    return new SocketImplementation();
}

