
const SOCKET_RECONNECTION_TIMEOUT = 2000;
const SOCKET_URL = "/api/socket";

export interface Value {
    v : string,
    e : boolean,
};

export interface Triple {
    s? : Value,
    p? : Value,
    o? : Value,
};

export interface Socket {
    close : () => void;
    textCompletion : (text : string) => Promise<string>;
    graphRag : (text : string) => Promise<string>;
    agent : (
        question : string, think : any, observe : any, answer : any,
    ) => void;
    embeddings : (text : string) => Promise<number[][]>;
    graphEmbeddingsQuery : (
        vecs : number[][], limit : number
    ) => Promise<Value[]>;
    triplesQuery : (
        s? : Value, p? : Value, o? : Value, limit? : number
    ) => Promise<Triple[]>;
};

export interface Callbacks {
    success : any;
    error : any;
};

export interface TextCompletionResponse {
    id : string;
    response : {
        response : string;
    };
};

export interface GraphRagResponse {
    id : string;
    response : any;
};

export interface AgentResponse {
    id : string;
    response : any;
};

export interface EmbeddingsResponse {
    id : string;
    response : any;
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
        response : {
             s : Value;
             p : Value;
             o : Value;
         };
    }[];
};

export const createTrustGraphSocket = () : Socket => {

    let id = 1;
    let ws = new WebSocket(SOCKET_URL);

    let inFlight : { [key : string] : Callbacks } = {}

    const onMessage = (message : any) => {

        if (!message.data) return;
        const obj = JSON.parse(message.data);

        if (!obj.id) return;

        if (inFlight[obj.id]) {
            inFlight[obj.id].success(obj);
        }

    };

    const onClose = () => {
        console.log("CLOSE");
        setTimeout(
            () => {
                ws = new WebSocket(SOCKET_URL);
            },
            SOCKET_RECONNECTION_TIMEOUT
        );
    };

    const textCompletion = (text : string) => {
        const mid = "m" + id.toString();
        id++;
        const msg = JSON.stringify({
            "id": mid,
            "service": "text-completion",
            "request": {
                "system": "You are a helpful assistant.",
                "prompt": text,
            }
        });

        return new Promise<TextCompletionResponse>((resolve, reject) => {

            inFlight[mid] = { success: resolve, error: reject};

            ws.send(msg);

        }).then(
            (obj) => {
                delete inFlight[obj.id];
                return obj.response.response;
            }
        );
    }

    const graphRag = (text : string) => {
        const mid = "m" + id.toString();
        id++;
        const msg = JSON.stringify({
            "id": mid,
            "service": "graph-rag",
            "request": {
                "query": text,
            }
        });

        return new Promise<GraphRagResponse>((resolve, reject) => {

            inFlight[mid] = { success: resolve, error: reject};

            ws.send(msg);

        }).then(
            (obj) => {
                delete inFlight[obj.id];
                return obj.response.response;
            }
        );
    }

    const agent = (
        question : string,
        think : any,
        observe : any,
        answer : any
    ) => {
        const mid = "m" + id.toString();
        id++;
        const msg = JSON.stringify({
            "id": mid,
            "service": "agent",
            "request": {
                "question": question,
            }

        });

        const err = (e : any) => {
            console.log("Error:", e);
        };

        const ok = (e : AgentResponse) => {
            if (e.response.thought) think(e.response.thought);
            if (e.response.observation) observe(e.response.observation);
            if (e.response.answer) {
                answer(e.response.answer);
                delete inFlight[mid];
            }
        };

        inFlight[mid] = { success: ok, error: err};

        ws.send(msg);

    }

    const embeddings = (text : string) => {
        const mid = "m" + id.toString();
        id++;
        const msg = JSON.stringify({
            "id": mid,
            "service": "embeddings",
            "request": {
                "text": text,
            }
        });

        return new Promise<EmbeddingsResponse>((resolve, reject) => {
            inFlight[mid] = { success: resolve, error: reject};
            ws.send(msg);
        }).then(
            (obj) => {
                delete inFlight[obj.id];
                return obj.response.vectors;
            }
        );
    }

    const graphEmbeddingsQuery = (
        vecs : number[][],
        limit : number | undefined,
    ) => {
        const mid = "m" + id.toString();
        id++;
        const msg = JSON.stringify({
            "id": mid,
            "service": "graph-embeddings-query",
            "request": {
                "vectors": vecs,
                "limit": limit ? limit : 20,
            }
        });

        return new Promise<GraphEmbeddingsQueryResponse>((resolve, reject) => {
            inFlight[mid] = { success: resolve, error: reject};
            ws.send(msg);
        }).then(
            (obj) => {
                delete inFlight[obj.id];
                return obj.response.entities;
            }
        );
    }

    const triplesQuery = (
        s : Value | undefined,
        p : Value | undefined,
        o : Value | undefined,
        limit : number | undefined,
    ) => {
        const mid = "m" + id.toString();
        id++;

        const msg = JSON.stringify({
            "id": mid,
            "service": "triples-query",
            "request": {
                s: s, p: p, o: o,
                limit: limit ? limit : 20,
            }
        });

        return new Promise<TriplesQueryResponse>((resolve, reject) => {
            inFlight[mid] = { success: resolve, error: reject};
            ws.send(msg);
        }).then(
            (obj) => {
                delete inFlight[obj.id];
                return obj.response.response;
            }
        );
    }

    const doOpen = () => {
        console.log("OPEN");
    }

    const doClose = () => {
        ws.removeEventListener("message", onMessage);
        ws.removeEventListener("close", onClose);
        ws.removeEventListener("open", doOpen);
    };

    ws.addEventListener("message", onMessage);
    ws.addEventListener("close", onClose);
    ws.addEventListener("open", doOpen);

    return {
        close: doClose,
        textCompletion: textCompletion,
        graphRag: graphRag,
        agent: agent,
        embeddings: embeddings,
        graphEmbeddingsQuery: graphEmbeddingsQuery,
        triplesQuery: triplesQuery,
    };

}

