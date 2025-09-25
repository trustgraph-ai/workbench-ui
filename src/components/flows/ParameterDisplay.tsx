import React, { useMemo } from "react";
import { Text, VStack } from "@chakra-ui/react";
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

  // Display parameters with descriptions when available
  return (
    <VStack align="start" gap={1}>
      {sortedParameterEntries.map(([key, value]) => {
        // Use parameter description if available, otherwise fall back to key
        const displayName = parameterMetadata[key]?.description || key;
        const displayValue = displayValues[key] || String(value);

        return (
          <Text key={key} fontSize="sm">
            <Text as="span" fontWeight="medium">{displayName}:</Text>{" "}
            <Text as="span" color="fg.muted">{displayValue}</Text>
          </Text>
        );
      })}
    </VStack>
  );
};

export default ParameterDisplay;