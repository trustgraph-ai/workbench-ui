import React from "react";

import { Button, Tag } from "@chakra-ui/react";

import { useWorkbenchStateStore } from "@trustgraph/react-state";
import { Value } from "@trustgraph/react-state";

const EntityNode: React.FC<{ value: Value }> = ({ value }) => {
  const setSelected = useWorkbenchStateStore((state) => state.setSelected);

  return (
    <Tag.Root
      asChild
      variant="subtle"
      color="text"
      backgroundColor="primary.contrast"
    >
      <Button
        size="xs"
        onClick={() =>
          setSelected({
            uri: value.v,
            label: value.label ? value.label : value.v,
          })
        }
      >
        <Tag.Label>{value.label}</Tag.Label>
      </Button>
    </Tag.Root>
  );
};

export default EntityNode;
