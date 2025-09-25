import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSocket, useConnectionState } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";

// Parameter schema definition
interface ParameterSchema {
  type: 'string' | 'number' | 'integer' | 'boolean';
  description?: string;
  default?: any;
  enum?: EnumOption[] | string[];
  minimum?: number;
  maximum?: number;
  pattern?: string;
  required?: boolean;
  helper?: string;
  placeholder?: string;
}

// Rich enum option structure
interface EnumOption {
  id: string;
  description: string;
}

// Parameter definitions fetched from config
interface ParameterDefinitions {
  [definitionName: string]: ParameterSchema;
}

// Flow parameter metadata (stored in flow class)
interface FlowParameterMetadata {
  description: string;
  order: number;
  type: string; // Reference to parameter definition name
}

/**
 * Custom hook for fetching parameter definitions for a flow class
 * @param flowClassName - The name of the flow class to fetch parameters for
 * @returns Parameter definitions, mapping, and loading states
 */
export const useFlowParameters = (flowClassName?: string) => {
  const socket = useSocket();
  const connectionState = useConnectionState();
  const notify = useNotification();

  const isSocketReady =
    connectionState?.status === "authenticated" ||
    connectionState?.status === "unauthenticated";

  /**
   * Query for fetching parameter definitions for a flow class
   */
  const parametersQuery = useQuery({
    queryKey: ["flow-parameters", flowClassName],
    enabled: isSocketReady && !!flowClassName,
    queryFn: async () => {
      if (!flowClassName) return null;

      try {
        // Get flow class definition first
        const flowClass = await socket.flows().getFlowClass(flowClassName);

        // Extract parameter metadata with new structure
        const parameterMetadata: { [key: string]: FlowParameterMetadata } = flowClass.parameters || {};
        if (Object.keys(parameterMetadata).length === 0) {
          return { parameterDefinitions: {}, parameterMapping: {}, parameterMetadata: {} };
        }

        // Create mapping from flow param names to definition names
        const parameterMapping: { [key: string]: string } = {};
        Object.entries(parameterMetadata).forEach(([flowParamName, metadata]) => {
          parameterMapping[flowParamName] = metadata.type;
        });

        // Fetch parameter definitions from config
        const definitionNames = Object.values(parameterMapping);
        const configKeys = definitionNames.map(name => ({ type: "parameter-types", key: name }));

        const configResponse = await socket.config().getConfig(configKeys);
        const parameterDefinitions: ParameterDefinitions = {};

        // Parse config response to get parameter definitions
        configResponse.values?.forEach(item => {
          if (item.type === "parameter-types") {
            try {
              parameterDefinitions[item.key] = JSON.parse(item.value);
            } catch (error) {
              console.error(`Failed to parse parameter definition for ${item.key}:`, error);
            }
          }
        });

        return {
          parameterDefinitions,
          parameterMapping, // Maps flow param names to definition names
          parameterMetadata, // Flow-specific metadata with description, order, type
        };
      } catch (error) {
        console.error("Failed to fetch flow parameters:", error);
        throw error;
      }
    },
  });

  useActivity(parametersQuery.isLoading, "Loading flow parameters");

  return {
    parameterDefinitions: parametersQuery.data?.parameterDefinitions || {},
    parameterMapping: parametersQuery.data?.parameterMapping || {},
    parameterMetadata: parametersQuery.data?.parameterMetadata || {},
    isLoading: parametersQuery.isLoading,
    isError: parametersQuery.isError,
    error: parametersQuery.error,
  };
};

/**
 * Custom hook for parameter validation
 * @param parameterDefinitions - The parameter schema definitions
 * @param parameterMapping - Maps flow param names to definition names
 * @param parameterValues - Current parameter values
 * @returns Validation result with isValid flag and errors object
 */
export const useParameterValidation = (
  parameterDefinitions: ParameterDefinitions,
  parameterMapping: { [key: string]: string },
  parameterValues: { [key: string]: any }
) => {
  return useMemo(() => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    Object.entries(parameterMapping).forEach(([flowParamName, definitionName]) => {
      const schema = parameterDefinitions[definitionName];
      if (!schema) return;

      const value = parameterValues[flowParamName];

      // Check required fields
      if (schema.required && (value === undefined || value === "")) {
        errors[flowParamName] = `${flowParamName} is required`;
        isValid = false;
        return;
      }

      // Skip validation for empty optional fields
      if (value === undefined || value === "") {
        return;
      }

      // Type validation
      if (schema.type === 'number' || schema.type === 'integer') {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) {
          errors[flowParamName] = `${flowParamName} must be a valid number`;
          isValid = false;
          return;
        }

        if (schema.type === 'integer' && !Number.isInteger(numValue)) {
          errors[flowParamName] = `${flowParamName} must be an integer`;
          isValid = false;
          return;
        }

        // Range validation
        if (schema.minimum !== undefined && numValue < schema.minimum) {
          errors[flowParamName] = `${flowParamName} must be at least ${schema.minimum}`;
          isValid = false;
        }
        if (schema.maximum !== undefined && numValue > schema.maximum) {
          errors[flowParamName] = `${flowParamName} must be at most ${schema.maximum}`;
          isValid = false;
        }
      }

      // Enum validation
      if (schema.enum && schema.enum.length > 0) {
        const validValues = schema.enum.map(option =>
          typeof option === 'object' ? option.id : option
        );
        if (!validValues.includes(value)) {
          errors[flowParamName] = `${flowParamName} must be one of: ${validValues.join(', ')}`;
          isValid = false;
        }
      }

      // Pattern validation for strings
      if (schema.pattern && schema.type === 'string') {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(value.toString())) {
          errors[flowParamName] = `${flowParamName} format is invalid`;
          isValid = false;
        }
      }
    });

    return { isValid, errors };
  }, [parameterDefinitions, parameterMapping, parameterValues]);
};

export type { ParameterSchema, EnumOption, ParameterDefinitions, FlowParameterMetadata };