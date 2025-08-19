import { useContext } from "react";

import { SocketContext } from "./SocketContext";

export const useSocket = () => {
  const socket = useContext(SocketContext);

  console.log("useSocket");
  return socket;
};
