import React from "react";
import { Box, Text } from "@chakra-ui/react";
import {
  SocketProvider as BaseSocketProvider,
  useSocket,
  useConnectionState,
} from "@trustgraph/react-provider";
import { useSettings } from "@trustgraph/react-state";
import CenterSpinner from "../../components/common/CenterSpinner";

// Re-export hooks for backward compatibility
export { useSocket, useConnectionState };

interface SocketProviderProps {
  children: React.ReactNode;
}

/**
 * Workbench-specific SocketProvider that integrates with settings
 *
 * This wraps SocketProvider to provide:
 * 1. Settings management
 * 2. WebSocket connection with user authentication
 * 3. Custom loading UI with CenterSpinner
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
}) => {
  const { settings, isLoaded } = useSettings();

  // Show loading state while settings load
  if (!isLoaded) {
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
        <Text color="fg.muted">Loading settings...</Text>
      </Box>
    );
  }

  return (
    <BaseSocketProvider
      user={settings.user}
      apiKey={settings.authentication.apiKey || undefined}
      loadingComponent={
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
          <Text color="fg.muted">Connecting to server...</Text>
        </Box>
      }
    >
      {children}
    </BaseSocketProvider>
  );
};
