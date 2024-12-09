
import { createContext, ReactChild, useState, useEffect } from "react";

const SOCKET_RECONNECTION_TIMEOUT = 2000;
const SOCKET_URL = "/api/socket";

import { createSocket } from "./Socket";

const socket = createSocket();

export const SocketContext = createContext(socket);

interface ISocketProvider {
    children : ReactChild;
}

export const SocketProvider = (props : ISocketProvider) => {

//    const [ws, setWs] = useState<Socket>(socket);

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    );

}

