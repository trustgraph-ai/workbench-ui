import React, { useState } from "react";
import { VStack, Text } from "@chakra-ui/react";
import { useLLMModels } from "../../state/llm-models";
import ParameterTypeSelector from "./ParameterTypeSelector";
import ModelsTable from "./ModelsTable";
import { EnumOption } from "../../model/llm-models";

const LLMModels: React.FC = () => {
  const { parameterTypes, updateParameter, isUpdating } = useLLMModels();
  const [selectedType, setSelectedType] = useState<string>("");

  // Auto-select first parameter type when data loads
  React.useEffect(() => {
    if (parameterTypes.length > 0 && !selectedType) {
      setSelectedType(parameterTypes[0].name);
    }
  }, [parameterTypes, selectedType]);

  const selectedParam = parameterTypes.find((pt) => pt.name === selectedType);

  const handleUpdate = (models: EnumOption[], defaultValue: string) => {
    if (!selectedType) return;

    updateParameter({
      name: selectedType,
      enum: models,
      default: defaultValue,
    });
  };

  if (parameterTypes.length === 0) {
    return (
      <Text color="fg.muted">
        No parameter types with enum options found. Parameter types with enums
        will appear here for editing.
      </Text>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      <ParameterTypeSelector
        parameterTypes={parameterTypes}
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      {selectedParam && (
        <VStack gap={4} align="stretch">
          <VStack gap={1} align="start">
            <Text fontSize="sm" fontWeight="medium">
              {selectedParam.description}
            </Text>
            <Text fontSize="xs" color="fg.muted">
              Type: {selectedParam.type} | Required:{" "}
              {selectedParam.required ? "Yes" : "No"}
            </Text>
          </VStack>

          <ModelsTable
            models={selectedParam.enum}
            defaultValue={selectedParam.default}
            onUpdate={handleUpdate}
            isUpdating={isUpdating}
          />
        </VStack>
      )}
    </VStack>
  );
};

export default LLMModels;
