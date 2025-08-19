import React from "react";
import { Box, Text, Center } from "@chakra-ui/react";

interface ErrorStateProps {
  error: Error | unknown;
  title?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  title = "Error loading schemas",
}) => (
  <Box
    p={4}
    borderWidth="1px"
    borderColor="red.500"
    borderRadius="md"
    bg="red.50"
  >
    <Text color="red.700">
      {title}: {error?.toString()}
    </Text>
  </Box>
);

interface EmptyStateProps {
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = "No schemas found. Create one to get started.",
}) => (
  <Center h="200px">
    <Text color="fg.muted">{message}</Text>
  </Center>
);
