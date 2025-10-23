import React from "react";
import { Box, Spinner, Text } from "@chakra-ui/react";
import {
  SocketProvider as BaseSocketProvider,
  useSocket,
  useConnectionState,
} from "@trustgraph/react-provider";
import { useSettings } from "@trustgraph/react-state";

// Re-export hooks for backward compatibility
export { useSocket, useConnectionState };

interface SocketProviderProps {
  children: React.ReactNode;
}

/**
 * Application-specific SocketProvider that integrates with settings
 *
 * Wraps BaseSocketProvider from @trustgraph/react-provider and configures it
 * with user settings (user identity and API key).
 *
 * Note: Assumes settings are already loaded (enforced by SettingsLoadingBoundary)
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
}) => {
  const { settings } = useSettings();

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
          <Spinner size="xl" />
          <Text color="fg.muted">Connecting to server...</Text>
        </Box>
      }
    >
      {children}
    </BaseSocketProvider>
  );
};
