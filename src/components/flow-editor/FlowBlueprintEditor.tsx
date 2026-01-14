import React from "react";
import { Box, VStack, Heading, Text, Button } from "@chakra-ui/react";
import { Construction } from "lucide-react";

interface FlowBlueprintEditorProps {
  flowBlueprintId?: string;
  onClose?: () => void;
}

export const FlowBlueprintEditor: React.FC<FlowBlueprintEditorProps> = ({
  flowBlueprintId,
  onClose,
}) => {
  return (
    <Box
      h="100vh"
      bg="bg.subtle"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack
        gap={6}
        p={8}
        bg="bg"
        borderRadius="lg"
        boxShadow="lg"
        maxW="600px"
      >
        <Construction size={48} color="var(--colors-fg-muted)" />

        <VStack gap={2} textAlign="center">
          <Heading size="xl">Flow Blueprint Editor</Heading>
          <Text color="fg.muted" fontSize="lg">
            Under Construction
          </Text>
        </VStack>

        <VStack gap={3} textAlign="center">
          <Text color="fg.subtle">
            The Flow Blueprint Editor is being rebuilt for a better experience.
          </Text>
          {flowBlueprintId && (
            <Text fontSize="sm" color="fg.muted">
              Flow Blueprint ID: <code>{flowBlueprintId}</code>
            </Text>
          )}
        </VStack>

        {onClose && (
          <Button onClick={onClose} variant="outline" size="lg">
            Go Back
          </Button>
        )}
      </VStack>
    </Box>
  );
};
