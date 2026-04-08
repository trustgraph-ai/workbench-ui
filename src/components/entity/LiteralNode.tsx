import React from "react";

import { Text } from "@chakra-ui/react";

import { LabeledTerm, getTermValue } from "@trustgraph/react-state";

const LiteralNode: React.FC<{ value: LabeledTerm }> = ({ value }) => {
  const label = value.label ?? getTermValue(value);
  return <Text>{label}</Text>;
};

export default LiteralNode;
