import React from "react";
import { Text, VStack } from "@chakra-ui/react";
import { useFlows } from "../../state/flows";

interface ParameterDisplayProps {
  flowClassName: string;
  parameters: { [key: string]: any } | undefined;
}

/**
 * Component for displaying flow parameters with descriptive names
 * Looks up parameter metadata from flow class to show descriptions instead of identifiers
 */
const ParameterDisplay: React.FC<ParameterDisplayProps> = ({ flowClassName, parameters }) => {
  const { flowClasses } = useFlows();

  // If no parameters, show "None"
  if (!parameters || Object.keys(parameters).length === 0) {
    return <Text color="fg.muted" fontSize="sm">None</Text>;
  }

  // Find the flow class metadata
  const flowClass = flowClasses?.find(([id]) => id === flowClassName)?.[1];
  const parameterMetadata = flowClass?.parameters || {};

  // Display parameters with descriptions when available
  return (
    <VStack align="start" gap={1}>
      {Object.entries(parameters).map(([key, value]) => {
        // Use parameter description if available, otherwise fall back to key
        const displayName = parameterMetadata[key]?.description || key;

        return (
          <Text key={key} fontSize="sm">
            <Text as="span" fontWeight="medium">{displayName}:</Text>{" "}
            <Text as="span" color="fg.muted">{String(value)}</Text>
          </Text>
        );
      })}
    </VStack>
  );
};

export default ParameterDisplay;