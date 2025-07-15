import React, { useState } from "react";
import { Select, Portal, createListCollection } from "@chakra-ui/react";

const ChatModeSelector = () => {
  const [value, setValue] = useState("graph-rag");
  
  const chatModes = [
    { value: "graph-rag", label: "Graph RAG" },
    { value: "agent", label: "Agent" },
    { value: "basic-llm", label: "Basic LLM" },
  ];

  const collection = createListCollection({ items: chatModes });

  return (
    <Select.Root
      collection={collection}
      value={[value]}
      onValueChange={(e) => setValue(e.value[0])}
      size="sm"
      width="150px"
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {chatModes.map((mode) => (
              <Select.Item item={mode} key={mode.value}>
                <Select.ItemText>{mode.label}</Select.ItemText>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};

export default ChatModeSelector;