import React, { useMemo } from "react";
import { Text, Box, Badge, Flex } from "@chakra-ui/react";
import { useFlows } from "../../state/flows";
import { useFlowParameters } from "../../state/flow-parameters";

interface ParameterDisplayProps {
  flowClassName: string;
  parameters: { [key: string]: any } | undefined;
}

/**
 * Component for displaying flow parameters with descriptive names and values
 * Looks up parameter metadata from flow class to show descriptions instead of identifiers
 * Also maps enum values to their descriptions when available
 */
const ParameterDisplay: React.FC<ParameterDisplayProps> = ({ flowClassName, parameters }) => {
  const { flowClasses } = useFlows();

  // Fetch parameter definitions to get enum mappings
  const { parameterDefinitions, parameterMapping } = useFlowParameters(flowClassName);

  // If no parameters, show "None"
  if (!parameters || Object.keys(parameters).length === 0) {
    return <Text color="fg.muted" fontSize="sm">None</Text>;
  }

  // Find the flow class metadata
  const flowClass = flowClasses?.find(([id]) => id === flowClassName)?.[1];
  const parameterMetadata = flowClass?.parameters || {};

  // Create a mapping of parameter values to display values
  const displayValues = useMemo(() => {
    const result: { [key: string]: string } = {};

    Object.entries(parameters).forEach(([paramName, paramValue]) => {
      // Get the parameter definition name from mapping
      const definitionName = parameterMapping[paramName];
      const definition = definitionName ? parameterDefinitions[definitionName] : null;

      // If parameter has enum options, try to find the description
      if (definition?.enum && Array.isArray(definition.enum)) {
        const enumOption = definition.enum.find(option => {
          // Handle both rich {id, description} and simple string enums
          const optionId = typeof option === 'object' ? option.id : option;
          return optionId === paramValue;
        });

        if (enumOption) {
          // Use description if available, otherwise use the value itself
          result[paramName] = typeof enumOption === 'object' ? enumOption.description : enumOption;
        } else {
          result[paramName] = String(paramValue);
        }
      } else {
        result[paramName] = String(paramValue);
      }
    });

    return result;
  }, [parameters, parameterDefinitions, parameterMapping]);

  // Sort parameters by order field from metadata
  const sortedParameterEntries = useMemo(() => {
    return Object.entries(parameters).sort(([keyA], [keyB]) => {
      const orderA = parameterMetadata[keyA]?.order || 999;
      const orderB = parameterMetadata[keyB]?.order || 999;
      return orderA - orderB;
    });
  }, [parameters, parameterMetadata]);

  // Array of color palettes to cycle through for visual distinction
  const colorPalettes = ["blue", "teal", "purple", "green", "orange", "pink", "cyan"];

  // Display parameters as compact badges that can wrap
  return (
    <Flex wrap="wrap" gap={1.5} maxWidth="400px">
      {sortedParameterEntries.map(([key, value], index) => {
        // Use parameter description if available, otherwise fall back to key
        const displayName = parameterMetadata[key]?.description || key;
        const displayValue = displayValues[key] || String(value);
        // Cycle through color palettes for visual distinction
        const colorPalette = colorPalettes[index % colorPalettes.length];

        return (
          <Badge
            key={key}
            colorPalette={colorPalette}
            variant="subtle"
            size="sm"
            px={2}
            py={0.5}
            borderRadius="md"
          >
            <Text fontSize="xs">
              <Text as="span" fontWeight="semibold">{displayName}:</Text>{" "}
              <Text as="span">{displayValue}</Text>
            </Text>
          </Badge>
        );
      })}
    </Flex>
  );
};

export default ParameterDisplay;