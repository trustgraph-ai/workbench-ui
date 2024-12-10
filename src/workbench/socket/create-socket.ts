
import { EventBus } from './EventBus';

const SOCKET_RECONNECTION_TIMEOUT = 2000;
const SOCKET_URL = "/api/socket";

interface Socket {
    send : (text : string) => void;
};

interface Value {
    v : string,
    e : boolean,
};

export const createSocket = () : Socket => {

    let id = 1;
    let ws = new WebSocket(SOCKET_URL);
    let textCompletion = new EventBus();

    let inFlight = {}

    const onMessage = (message : any) => {

        if (!message.data) return;
        const obj = JSON.parse(message.data);

        if (!obj.id) return;

        if (inFlight[obj.id]) {
            inFlight[obj.id].s(obj);
        }

    };

    const onClose = () => {
        console.log("CLOSE");
        setTimeout(() => {
            ws = new WebSocket(SOCKET_URL);
        },
        SOCKET_RECONNECTION_TIMEOUT);
    };

    const textComplete = (text : string) => {
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

        return new Promise((resolve, reject) => {

            inFlight[mid] = { s: resolve, e: reject};

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

        return new Promise((resolve, reject) => {

            inFlight[mid] = { s: resolve, e: reject};

            ws.send(msg);

        }).then(
            (obj) => {
                delete inFlight[obj.id];
                return obj.response.response;
            }
        );
    }

    const agent = (question : string, think, observe, answer) => {
        const mid = "m" + id.toString();
        id++;
        const msg = JSON.stringify({
            "id": mid,
            "service": "agent",
            "request": {
                "question": question,
            }

        });

        const err = (e) => {
            console.log("Error:", e);
        };

        const ok = (e) => {
            if (e.response.thought) think(e.response.thought);
            if (e.response.observation) observe(e.response.observation);
            if (e.response.answer) {
                answer(e.response.answer);
                delete inFlight[mid];
            }
        };

        inFlight[mid] = { s: ok, e: err};

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

        return new Promise((resolve, reject) => {
            inFlight[mid] = { s: resolve, e: reject};
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

        return new Promise((resolve, reject) => {
            inFlight[mid] = { s: resolve, e: reject};
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

        return new Promise((resolve, reject) => {
            inFlight[mid] = { s: resolve, e: reject};
            ws.send(msg);
        }).then(
            (obj) => {
                delete inFlight[obj.id];
                return obj.response;
            }
        );
    }

    const doOpen = () => {
        console.log("OPEN");
    }

    const doClose = () => {
        ws.removeEventListener("message", onMessage);
        ws.removeEventListener("close", doClose);
        ws.removeEventListener("open", doOpen);
    };

    ws.addEventListener("message", onMessage);
    ws.addEventListener("close", doClose);
    ws.addEventListener("open", doOpen);

    return {
        ws: ws,
        textComplete: textComplete,
        graphRag: graphRag,
        agent: agent,
        embeddings: embeddings,
        graphEmbeddingsQuery: graphEmbeddingsQuery,
        triplesQuery: triplesQuery,
    };

}

