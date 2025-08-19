import React, { useState } from "react";
import { VStack, HStack, IconButton, Text } from "@chakra-ui/react";
import { Eye, EyeOff, Key } from "lucide-react";
import Card from "../common/Card";
import TextField from "../common/TextField";

interface AuthenticationSectionProps {
  apiKey: string;
  onApiKeyChange: (value: string) => void;
}

const AuthenticationSection: React.FC<AuthenticationSectionProps> = ({
  apiKey,
  onApiKeyChange,
}) => {
  const [showApiKey, setShowApiKey] = useState(false);

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <Card
      title="Authentication"
      description="Configure API authentication for TrustGraph socket connections"
      icon={<Key />}
    >
      <VStack gap={4} align="stretch">
        <VStack gap={2} align="stretch">
          <HStack justify="space-between">
            <Text fontWeight="medium">API Key</Text>
            <IconButton
              size="sm"
              variant="ghost"
              onClick={toggleApiKeyVisibility}
              aria-label={showApiKey ? "Hide API key" : "Show API key"}
            >
              {showApiKey ? <EyeOff /> : <Eye />}
            </IconButton>
          </HStack>
          <TextField
            placeholder="Enter API key (leave empty for no authentication)"
            value={apiKey}
            onValueChange={onApiKeyChange}
            type={showApiKey ? "text" : "password"}
          />
          <Text fontSize="sm" color="fg.muted">
            {apiKey
              ? "API key will be used for socket authentication"
              : "No API key set - authentication disabled"}
          </Text>
        </VStack>
      </VStack>
    </Card>
  );
};

export default AuthenticationSection;
