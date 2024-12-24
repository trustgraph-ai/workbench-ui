
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

export interface ServiceCall {
    success : (resp: any) => void;
    error : (err : any) => void;
    timeout : number;
    expiry : numer;
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

    ws? : WebSocket;
    tag : string;
    id : number;
    inflight : { [key : string] : ServiceCall } = {};

    constructor() {

        this.tag = makeid(8);
        this.id = 1;

        this.openSocket();

    }

    openSocket() {
        this.ws = new WebSocket(SOCKET_URL);

        const onMessage = (message : MessageEvent) => {

            if (!message.data) return;


            const obj = JSON.parse(message.data);

            console.log("<--", obj);

            if (!obj.id) return;

            if (this.inflight[obj.id]) {
                this.inflight[obj.id].success(obj.response);
            } else {
                console.log("Message ID", this.inflight[obj.id], "not known");
            }

        };

        const onClose = () => {
            console.log("[socket close]");
            this.ws = undefined;
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
        console.log("[socket reopen >]");
        this.openSocket();
        console.log(this.ws);
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

    timeout(mid : string) {

        if (this.inflight[mid].expiry < Date.now()) {
            this.inflight[mid].error("Timeout");
            delete this.inflight[mid];
            return
        }

        this.inflight[mid].timeout = setTimeout(
            () => this.timeout(mid),
            this.inflight[mid].expiry - Date.now(),
        );

    }

    makeRequest<RequestType, ResponseType>(
        service : string, request : RequestType,
        timeout : number,
    ) {

        const mid = this.getNextId();

        if (timeout == undefined)
            timeout = 10;

        const msg = {
            id: mid,
            service: service,
            request: request,
        };

        return new Promise<ResponseType>((resolve, reject) => {

            this.inflight[mid] = {
                success: resolve,
                error: reject,
                timeout: setTimeout(
                    () => this.timeout(mid),
                    timeout,
                ),
                expiry: Date.now(),
            };

            console.log("-->", msg);

            if (this.ws) {
                this.ws.send(JSON.stringify(msg));
            }
            // FIXME: Else arrange for re-connect & retry

        }).then(
            (obj) => {

                clearTimeout(this.inflight[mid].timeout);
                delete this.inflight[mid];

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

                clearTimeout(this.inflight[mid].timeout);
                delete this.inflight[mid];

            }
        };

        this.inflight[mid] = { success: ok, error: err};

        if (this.ws) {
            this.ws.send(msg);
        } else {
            // Arrange for send later
        }

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

