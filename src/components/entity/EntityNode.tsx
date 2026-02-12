import React from "react";

import { Button } from "@chakra-ui/react";

import { useWorkbenchStateStore, LabeledTerm, getTermValue } from "@trustgraph/react-state";

const EntityNode: React.FC<{ value: LabeledTerm }> = ({ value }) => {
  const setSelected = useWorkbenchStateStore((state) => state.setSelected);
  const uri = getTermValue(value);
  const label = value.label ?? uri;

  return (
    <Button
      size="xs"
      variant="subtle"
      colorPalette="blue"
      onClick={() =>
        setSelected({
          uri,
          label,
        })
      }
    >
      {label}
    </Button>
  );
};

export default EntityNode;
