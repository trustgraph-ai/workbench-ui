
import { createContext, ReactChild } from "react";

import { createTrustGraphSocket } from "./trustgraph-socket";

const socket = createTrustGraphSocket();

export const SocketContext = createContext(socket);

interface ISocketProvider {
    children : ReactChild;
}

export const SocketProvider = (props : ISocketProvider) => {

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    );

}

