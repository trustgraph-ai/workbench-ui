import { useContext } from "react";
import { useSettings } from "../../state/settings";

import { SocketContext } from "./SocketContext";

export const useSocket = () => {

  const socket = useContext(SocketContext);

    const { settings } = useSettings();

    console.log(settings);

  console.log("useSocket");
  return socket;
};
