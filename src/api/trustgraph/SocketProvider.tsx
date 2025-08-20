import React, { useEffect, useState, createContext, useContext } from "react";
import { Box, Text } from "@chakra-ui/react";
import {
  createTrustGraphSocket,
  type ConnectionState,
} from "./trustgraph-socket";
import { useSettings } from "../../state/settings";
import CenterSpinner from "../../components/common/CenterSpinner";
import type { Socket } from "./trustgraph-socket";

// Create contexts for socket and connection state
export const SocketContext = createContext<Socket | null>(null);
export const ConnectionStateContext = createContext<ConnectionState | null>(
  null,
);

// Hook to use the socket context
export const useSocket = () => {
  const socket = useContext(SocketContext);

  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return socket;
};

// Hook to use the connection state context
export const useConnectionState = () => {
  const state = useContext(ConnectionStateContext);

  if (!state) {
    throw new Error(
      "useConnectionState must be used within a SocketProvider",
    );
  }

  return state;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

/**
 * SocketProvider - Manages WebSocket connection with authentication
 *
 * Critical requirements:
 * 1. Wait for settings to load before creating socket
 * 2. Create socket with token if apiKey is present
 * 3. Reconnect when authentication settings change
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
}) => {
  const { settings, isLoaded } = useSettings();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [connectionState, setConnectionState] =
    useState<ConnectionState | null>(null);

  useEffect(() => {
    // CRITICAL: Wait for settings to load before creating socket
    if (!isLoaded) {
      console.log("SocketProvider: Waiting for settings to load...");
      return;
    }

    console.log(
      "SocketProvider: Settings loaded, creating socket with auth:",
      settings.authentication.apiKey ? "enabled" : "disabled",
    );

    // Clean up existing socket before creating new one (for reconnection)
    if (socket) {
      console.log(
        "SocketProvider: API key changed, closing existing socket...",
      );
      socket.close();
      setIsSocketReady(false);
    }

    // Create socket with current auth settings
    const apiKey = settings.authentication.apiKey;
    const newSocket = createTrustGraphSocket(apiKey || undefined);

    // Subscribe to connection state changes
    const unsubscribe = newSocket.onConnectionStateChange(setConnectionState);

    setSocket(newSocket);

    // Mark socket as ready (we don't wait for connection since the socket
    // handles reconnection internally)
    setIsSocketReady(true);

    return () => {
      if (newSocket) {
        console.log("SocketProvider: Cleaning up socket on unmount");
        unsubscribe(); // Unsubscribe from state changes
        newSocket.close();
      }
      setIsSocketReady(false);
      setConnectionState(null);
    };
  }, [isLoaded, settings.authentication.apiKey]); // Reconnects when API key changes

  // Show loading state until both settings and socket are ready
  if (!isSocketReady) {
    return (
      <Box
        width="100%"
        height="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={4}
      >
        <CenterSpinner />
        <Text color="fg.muted">
          {!isLoaded ? "Loading settings..." : "Connecting to server..."}
        </Text>
      </Box>
    );
  }

  return (
    <SocketContext.Provider value={socket}>
      <ConnectionStateContext.Provider value={connectionState}>
        {children}
      </ConnectionStateContext.Provider>
    </SocketContext.Provider>
  );
};
