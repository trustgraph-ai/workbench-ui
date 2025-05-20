
import { createContext, ReactNode } from "react";

import { createTrustGraphSocket } from "./trustgraph-socket";

const socket = createTrustGraphSocket();

export const SocketContext = createContext(socket);

interface ISocketProvider {
    children? : ReactNode;
}

export const SocketProvider = (props : ISocketProvider) => {

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    );

}

