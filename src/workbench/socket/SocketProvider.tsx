
import { createContext, ReactChild, useState, useEffect } from "react";

const SOCKET_RECONNECTION_TIMEOUT = 2000;
const SOCKET_URL = "/api/socket";

const websocket = new WebSocket(SOCKET_URL);

export const SocketContext = createContext(websocket);

interface ISocketProvider {
    children : ReactChild;
}

export const SocketProvider = (props : ISocketProvider) => {

    const [ws, setWs] = useState<WebSocket>(websocket);

    useEffect(() => {

        const onClose = () => {
            setTimeout(() => {
                setWs(new WebSocket(SOCKET_URL));
            }, SOCKET_RECONNECTION_TIMEOUT);
        };

        ws.addEventListener("close", onClose);

        ws.addEventListener("open", () => { console.log("OPEN"); });

        return () => {
            ws.removeEventListener("close", onClose);
        };

    }, [ws, setWs]);


    return (
        <SocketContext.Provider value={ws}>
            {props.children}
        </SocketContext.Provider>
    );

}

