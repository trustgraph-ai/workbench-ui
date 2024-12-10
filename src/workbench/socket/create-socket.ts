
import { EventBus } from './EventBus';

const SOCKET_RECONNECTION_TIMEOUT = 2000;
const SOCKET_URL = "/api/socket";

interface Socket {
    send : (text : string) => void;
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
            delete inFlight[obj.id];
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
            (obj) => obj.response.response
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
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
        textComplete: textComplete,
    };

}

