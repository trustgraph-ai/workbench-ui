import React from "react";
import { Box, HStack, Icon, Text, Tooltip } from "@chakra-ui/react";
import { 
  CheckCircleIcon, 
  WarningIcon, 
  InfoIcon,
  TimeIcon,
  CloseIcon 
} from "@chakra-ui/icons";
import { useConnectionState } from "../../api/trustgraph/SocketProvider";
import type { ConnectionState } from "../../api/trustgraph/trustgraph-socket";

interface ConnectionStatusProps {
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
}

const getStatusDisplay = (state: ConnectionState) => {
  switch (state.status) {
    case 'connecting':
      return {
        icon: TimeIcon,
        color: "yellow.500",
        text: "Connecting...",
        tooltip: "Establishing connection to server"
      };
    
    case 'connected':
      return {
        icon: CheckCircleIcon,
        color: "green.500", 
        text: "Connected",
        tooltip: "Connected to server"
      };
    
    case 'authenticated':
      return {
        icon: CheckCircleIcon,
        color: "green.500",
        text: "Authenticated", 
        tooltip: "Connected with API key authentication"
      };
    
    case 'unauthenticated':
      return {
        icon: InfoIcon,
        color: "blue.500",
        text: "Unauthenticated",
        tooltip: "Connected but no API key provided (limited functionality)"
      };
    
    case 'reconnecting':
      return {
        icon: TimeIcon,
        color: "orange.500",
        text: `Reconnecting... (${state.reconnectAttempt}/${state.maxAttempts})`,
        tooltip: `Attempting to reconnect. Try ${state.reconnectAttempt} of ${state.maxAttempts}`
      };
    
    case 'failed':
      return {
        icon: CloseIcon,
        color: "red.500", 
        text: "Connection Failed",
        tooltip: state.lastError || "Connection failed after maximum retry attempts"
      };
    
    default:
      return {
        icon: InfoIcon,
        color: "gray.500",
        text: "Unknown",
        tooltip: "Unknown connection state"
      };
  }
};

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showDetails = false,
  size = "md" 
}) => {
  const connectionState = useConnectionState();
  
  if (!connectionState) {
    return null;
  }

  const { icon: StatusIcon, color, text, tooltip } = getStatusDisplay(connectionState);
  
  const iconSize = size === "sm" ? 3 : size === "lg" ? 5 : 4;
  const fontSize = size === "sm" ? "xs" : size === "lg" ? "md" : "sm";

  return (
    <Tooltip label={tooltip} placement="top">
      <HStack spacing={2} cursor="pointer">
        <Icon as={StatusIcon} color={color} boxSize={iconSize} />
        <Text fontSize={fontSize} color="fg.default">
          {showDetails ? text : connectionState.status}
        </Text>
        {showDetails && connectionState.hasApiKey && (
          <Text fontSize="xs" color="fg.muted">
            (API Key)
          </Text>
        )}
      </HStack>
    </Tooltip>
  );
};

export default ConnectionStatus;