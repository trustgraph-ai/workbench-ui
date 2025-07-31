import { useContext } from "react";

import { SocketContext } from "./SocketContext";

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};
