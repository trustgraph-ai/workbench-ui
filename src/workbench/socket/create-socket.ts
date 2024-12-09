
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

    const onMessage = (message : any) => {
        if (!message.data) return;
        const obj = JSON.parse(message.data);
        const text = obj.response.response;
        textCompletion.execute(text);
    };

    const onClose = () => {
        console.log("CLOSE");
        setTimeout(() => {
            ws = new WebSocket(SOCKET_URL);
        },
        SOCKET_RECONNECTION_TIMEOUT);
    };

    const send = (text : string) => {
        const msg = JSON.stringify({
            "id": "m" + id.toString(),
            "service": "text-completion",
            "request": {
                "system": "You are a helpful assistant.",
                "prompt": text,
            }
        });
        ws.send(msg);
        id++;
    }

    const doOpen = () => {
        console.log("OPEN");
    }

    const doClose = () => {
        ws.removeEventListener("message", onMessage);
        ws.removeEventListener("close", doClose);
        ws.removeEventListener("open", doOpen);
    };

    const addEventListener = (kind, callback) => {
        if (kind == "text-completion") {
            textCompletion.register(callback);
            return
        }
    };

    const removeEventListener = (kind, callback) => {
        if (kind == "text-completion") {
            textCompletion.unregister(callback);
            return
        }
    };

    ws.addEventListener("message", onMessage);
    ws.addEventListener("close", doClose);
    ws.addEventListener("open", doOpen);

    return {
        ws: ws,
        send: send,
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
    };

}

