import React from "react";

import { Tag } from "@chakra-ui/react";

import { LabeledTerm, getTermValue } from "@trustgraph/react-state";

const SelectedNode: React.FC<{ value: LabeledTerm }> = ({ value }) => {
  const label = value.label ?? getTermValue(value);
  return (
    <Tag.Root variant="surface" color="gray.50" backgroundColor="gray.600">
      <Tag.Label>{label}</Tag.Label>
    </Tag.Root>
  );
};

export default SelectedNode;
