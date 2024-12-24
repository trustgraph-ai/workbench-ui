
import { Triple, Value } from '../state/Triple';

const SOCKET_RECONNECTION_TIMEOUT = 2000;
const SOCKET_URL = "/api/socket";

export interface Socket {
    close : () => void;
    textCompletion : (text : string) => Promise<string>;
    graphRag : (text : string) => Promise<string>;
    agent : (
        question : string,
        think : (t : string) => void,
        observe : (t : string) => void,
        answer : (t : string) => void,
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
    success : (resp: ApiResponse) => void;
    error : (err : string) => void;
};

export interface TextCompletionResponse {
    id : string;
    response : {
        response : string;
    };
};

export interface GraphRagResponse {
    id : string;
    response : {
        response : string;
    };
};

export interface AgentResponse {
    id : string;
    response : {
        thought? : string;
        observation? : string;
        answer? : string;
        error? : string;
    };
};

export interface EmbeddingsResponse {
    id : string;
    response : {
        vectors : number[][];
    };
};

export interface GraphEmbeddingsQueryResponse {
    id : string;
    response : {
        entities : Value[];
    };
};

export interface TriplesQueryResponse {
    id : string;
    response : {
        response : Triple[];
    };
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
                this.inFlight[obj.id].success(obj);
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

    makeRequest(service : string, request : any) {

        const mid = this.getNextId();

        const msg = JSON.stringify({
            id: mid,
            service: service,
            request: request,
        });

        return new Promise<any>((resolve, reject) => {
            this.inFlight[mid] = { success: resolve, error: reject};

            console.log("-->", msg);

            this.ws.send(msg);

        }).then(
            (obj) => {
                delete this.inFlight[mid];
                return obj.response;
            }
        );
    }


    textCompletion(system : string, text : string) {
        const p = this.makeRequest(
            "text-completion",
            {
                system: system,
                prompt: text,
            }
        ) as Promise<TextCompletionResponse>;
        return p.then(r => r.response);
    }

    graphRag(text : string) {
        const p = this.makeRequest(
            "graph-rag",
            {
                query: text,
            }
        ) as Promise<GraphRagResponse>;
        return p.then(r => r.response);
    }

    agent(
        question : string,
        think : (s : string) => void,
        observe : (s : string) => void,
        answer : (s : string) => void,
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
            console.log("Error:", e);
        };

        const ok = (e : AgentResponse) => {
            if (e.response.thought) think(e.response.thought);
            if (e.response.observation) observe(e.response.observation);
            if (e.response.answer) {
                answer(e.response.answer);
                delete this.inFlight[mid];
            }
        };

        this.inFlight[mid] = { success: ok, error: err};

        this.ws.send(msg);

    }

    embeddings(text : string) {
        let p = this.makeRequest(
            "embeddings",
            {
                text: text,
            }
        ) as Promise<EmbeddingsResponse>;
        return p.then(r => r.vectors);
    }

    graphEmbeddingsQuery(
        vecs : number[][],
        limit : number | undefined,
    ) {
        let pr = this.makeRequest(
            "graph-embeddings-query",
            {
                vectors: vecs,
                limit: limit ? limit : 20,
            }
        ) as Promise<GraphEmbeddingsQueryResponse>;
        return pr.then(r => r.entities);

    }

    triplesQuery(
        s? : Value,
        p? : Value,
        o? : Value,
        limit? : number,
    ) {
        let pr = this.makeRequest(
            "triples-query",
            {
                s: s, p: p, o: o,
                limit: limit ? limit : 20,
            }
        ) as Promise<TriplesQueryResponse>;
        return pr.then(r => r.response);
    }

};

export const createTrustGraphSocket = () : Socket => {

    return new SocketImplementation();

}

