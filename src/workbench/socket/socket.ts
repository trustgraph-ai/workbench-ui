
import { useContext } from "react";

//import { EventBus } from './EventBus';

import { SocketContext } from "./SocketProvider";

/*
export class Socket {

    ws : any;
    id : number;

    textCompletion : any = new EventBus();

    onMessage(message : any) {
        if (!message.data) return;
        const obj = JSON.parse(message.data);
        const text = obj.response.response;
        self.textCompletion.execute(obj);
    };

    constructor(ws) {
        this.ws = ws;
        this.id = 1;
        this.ws.addEventListener("message", this.onMessage);
    };

    close() {
        this.ws.removeEventListener("message", this.onMessage);
        this.ws.close();
    }

    addEventListener(kind, callback) : void {

        if (kind == "text-completion") {
            this.textCompletion.register(callback);
            return
        }

    }

    removeEventListener(kind, callback) {

        if (kind == "text-completion") {
            this.textCompletion.unregister(callback);
            return
        }

    }

    send(msg) {

        this.ws.send(
            JSON.stringify({
                "id": "m" + this.id.toString(),
                "service": "text-completion",
                "request": {
                    "system": "You are a helpful assistant.",
                    "prompt": text
                }
            })
        );

        this.id
        
    }

};*/

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
};


/*
    const onMessage = (message : any) => {

        if (!message.data) return;

        const obj = JSON.parse(message.data);

        console.log("<- ", obj);

        const text = obj.response.response;

        setMessages([
            ...messages,
            {
                role: "ai",
                text: text,
            },
        ]);

    };
       

    useEffect(() => {

        socket.addEventListener("message", onMessage);

        return () => {
            socket.removeEventListener("message", onMessage);
        }

    });

*/

