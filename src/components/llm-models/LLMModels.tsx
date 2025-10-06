import React from "react";
import { Box, VStack, Text } from "@chakra-ui/react";
import { useLLMModels } from "../../state/llm-models";
import ModelsTable from "./ModelsTable";
import { EnumOption } from "../../model/llm-models";

const LLMModels: React.FC = () => {
  const { parameterTypes, updateParameter, isUpdating } = useLLMModels();

  const llmModelParam = parameterTypes[0]; // We only fetch llm-model

  const handleUpdate = (models: EnumOption[], defaultValue: string) => {
    updateParameter({
      name: "llm-model",
      enum: models,
      default: defaultValue,
    });
  };

  if (!llmModelParam) {
    return (
      <Box>
        <Text color="fg.muted">
          LLM model parameter type not found. Please configure the llm-model
          parameter type in your system.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <VStack gap={1} align="start">
          <Text fontSize="sm" fontWeight="medium">
            {llmModelParam.description}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            Type: {llmModelParam.type} | Required:{" "}
            {llmModelParam.required ? "Yes" : "No"}
          </Text>
        </VStack>

        <ModelsTable
          models={llmModelParam.enum}
          defaultValue={llmModelParam.default}
          onUpdate={handleUpdate}
          isUpdating={isUpdating}
        />
      </VStack>
    </Box>
  );
};

export default LLMModels;
