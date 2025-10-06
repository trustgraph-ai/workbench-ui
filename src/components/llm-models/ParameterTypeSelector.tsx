import React from "react";
import { HStack, VStack, Text } from "@chakra-ui/react";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "../ui/select";
import { createListCollection } from "@chakra-ui/react";
import { LLMModelParameter } from "../../model/llm-models";

interface ParameterTypeSelectorProps {
  parameterTypes: LLMModelParameter[];
  selectedType: string;
  onSelectType: (type: string) => void;
}

const ParameterTypeSelector: React.FC<ParameterTypeSelectorProps> = ({
  parameterTypes,
  selectedType,
  onSelectType,
}) => {
  const collection = createListCollection({
    items: parameterTypes.map((pt) => ({
      label: pt.name,
      value: pt.name,
    })),
  });

  return (
    <VStack gap={2} align="stretch">
      <Text fontSize="sm" fontWeight="medium">
        Parameter Type
      </Text>
      <SelectRoot
        collection={collection}
        value={[selectedType]}
        onValueChange={(e) => onSelectType(e.value[0])}
        size="sm"
        width="300px"
      >
        <SelectTrigger>
          <SelectValueText placeholder="Select a parameter type" />
        </SelectTrigger>
        <SelectContent>
          {parameterTypes.map((pt) => (
            <SelectItem key={pt.name} item={pt.name}>
              {pt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </VStack>
  );
};

export default ParameterTypeSelector;
