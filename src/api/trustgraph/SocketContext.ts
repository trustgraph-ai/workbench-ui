import { createTrustGraphSocket } from "./trustgraph-socket";
import { createContext } from "react";

const socket = createTrustGraphSocket();

export const SocketContext = createContext(socket);
