import React from "react";
import { Box, Text, Field, Checkbox } from "@chakra-ui/react";
import TextField from "../common/TextField";
import SelectField from "../common/SelectField";
import SelectOptionText from "../common/SelectOptionText";

// Rich enum option structure
interface EnumOption {
  id: string; // The actual value
  description: string; // Display text
}

interface ParameterSchema {
  type: 'string' | 'number' | 'integer' | 'boolean';
  description?: string;
  default?: any;
  enum?: EnumOption[] | string[]; // Can be rich objects or simple strings
  minimum?: number;
  maximum?: number;
  pattern?: string;
  required?: boolean;
  helper?: string; // Custom helper text
  placeholder?: string; // Custom placeholder text
}

// Flow parameter metadata (stored in flow class)
interface FlowParameterMetadata {
  description: string;
  order: number;
  type: string; // Reference to parameter definition name
}

interface ParameterInputsProps {
  parameterDefinitions: { [key: string]: ParameterSchema }; // The actual definitions
  parameterMapping: { [key: string]: string }; // Maps flow param names to definition names
  parameterMetadata: { [key: string]: FlowParameterMetadata }; // Flow-specific metadata
  parameterValues: { [key: string]: any };
  onParameterChange: (values: { [key: string]: any }) => void;
  validationErrors: { [key: string]: string };
  contentRef?: React.RefObject<HTMLDivElement>;
}

const ParameterInputs: React.FC<ParameterInputsProps> = ({
  parameterDefinitions,
  parameterMapping,
  parameterMetadata,
  parameterValues,
  onParameterChange,
  validationErrors,
  contentRef,
}) => {
  if (!parameterMapping || Object.keys(parameterMapping).length === 0) {
    return null;
  }

  const handleParameterChange = (paramName: string, value: any) => {
    onParameterChange({
      ...parameterValues,
      [paramName]: value,
    });
  };

  const renderParameterInput = (flowParamName: string, definitionName: string) => {
    const schema = parameterDefinitions[definitionName];
    const metadata = parameterMetadata[flowParamName];
    if (!schema) {
      return null;
    }
    const defaultValue = schema.default;
    const value = parameterValues[flowParamName] ?? defaultValue ?? "";
    const error = validationErrors[flowParamName];
    // Use metadata description if available, fallback to schema description, then parameter name
    const description = metadata?.description || schema.description;
    const label = description || flowParamName;

    // Helper text priority: schema.helper -> type-based fallback
    const getHelperText = () => {
      if (schema.helper) return schema.helper;

      switch (schema.type) {
        case 'integer': return 'Enter a whole number';
        case 'number': return 'Enter a number (decimals allowed)';
        case 'boolean': return 'Select true or false';
        case 'string': return schema.enum ? undefined : 'Enter text';
        default: return undefined;
      }
    };

    const helperText = getHelperText();
    const placeholder = schema.placeholder || "";

    // Enum parameters - handle both rich {id, description} and simple string arrays
    if (schema.enum && schema.enum.length > 0) {
      const options = schema.enum.map(option => {
        // Handle both rich {id, description} and simple string enums
        const optionId = typeof option === 'object' ? option.id : option;
        const optionDesc = typeof option === 'object' ? option.description : option;

        return {
          value: optionId,
          label: optionDesc,
          description: (
            <SelectOptionText title={optionDesc}>
              {optionId}
            </SelectOptionText>
          ),
        };
      });

      return (
        <Box key={flowParamName} mt={5}>
          <SelectField
            label={schema.required ? `${label} *` : label}
            items={options}
            value={value ? [value.toString()] : []}
            onValueChange={(values) => {
              const selectedValue = values.length > 0 ? values[0] : "";
              handleParameterChange(flowParamName, selectedValue);
            }}
            contentRef={contentRef}
          />
          {error && <Text color="red.500" fontSize="sm" mt={1}>{error}</Text>}
          {helperText && (
            <Text fontSize="sm" color="fg.muted" mt={1}>
              {helperText}
            </Text>
          )}
        </Box>
      );
    }

    // Boolean parameters - use Checkbox
    if (schema.type === 'boolean') {
      return (
        <Box key={flowParamName} mt={5}>
          <Field.Root>
            <Checkbox
              checked={value}
              onChange={(e) => handleParameterChange(flowParamName, e.target.checked)}
            >
              {schema.required ? `${label} *` : label}
            </Checkbox>
            {helperText && <Field.HelperText>{helperText}</Field.HelperText>}
            {error && <Text color="red.500" fontSize="sm" mt={1}>{error}</Text>}
          </Field.Root>
        </Box>
      );
    }

    // Number/Integer parameters - use TextField with type="number"
    if (schema.type === 'number' || schema.type === 'integer') {
      let enhancedHelperText = helperText;
      if (schema.minimum !== undefined || schema.maximum !== undefined) {
        const rangeText = [];
        if (schema.minimum !== undefined) rangeText.push(`min: ${schema.minimum}`);
        if (schema.maximum !== undefined) rangeText.push(`max: ${schema.maximum}`);
        const rangeInfo = rangeText.join(", ");
        enhancedHelperText = enhancedHelperText
          ? `${enhancedHelperText} (${rangeInfo})`
          : rangeInfo;
      }

      return (
        <Box key={flowParamName} mt={5}>
          <TextField
            label={label}
            helperText={enhancedHelperText}
            placeholder={placeholder}
            value={value.toString()}
            onValueChange={(val) => {
              // Store as string since backend expects string-encoded values
              handleParameterChange(flowParamName, val);
            }}
            type="number"
            required={schema.required}
          />
          {error && <Text color="red.500" fontSize="sm" mt={1}>{error}</Text>}
        </Box>
      );
    }

    // String parameters - use TextField
    return (
      <Box key={flowParamName} mt={5}>
        <TextField
          label={label}
          helperText={helperText}
          placeholder={placeholder}
          value={value.toString()}
          onValueChange={(val) => handleParameterChange(flowParamName, val)}
          required={schema.required}
        />
        {error && <Text color="red.500" fontSize="sm" mt={1}>{error}</Text>}
      </Box>
    );
  };

  // Sort parameters by order field from metadata
  const sortedParameters = Object.entries(parameterMapping).sort(([paramNameA], [paramNameB]) => {
    const orderA = parameterMetadata[paramNameA]?.order || 999;
    const orderB = parameterMetadata[paramNameB]?.order || 999;
    return orderA - orderB;
  });

  return (
    <Box>
      <Box mt={5} mb={3} fontWeight="bold">
        Parameters:
      </Box>
      {sortedParameters.map(([flowParamName, definitionName]) =>
        renderParameterInput(flowParamName, definitionName)
      )}
    </Box>
  );
};

export default ParameterInputs;