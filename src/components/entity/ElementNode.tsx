import React from "react";

import { LabeledTerm, getTermValue } from "@trustgraph/react-state";
import { Entity } from "@trustgraph/react-state";
import LiteralNode from "./LiteralNode";
import EntityNode from "./EntityNode";
import SelectedNode from "./SelectedNode";

// Check if term is an IRI or blank node (i.e., an entity reference)
const isEntity = (term: LabeledTerm): boolean => term.t === "i" || term.t === "b";

const ElementNode: React.FC<{ value: LabeledTerm; selected: Entity }> = ({
  value,
  selected,
}) => {
  if (isEntity(value)) {
    const uri = getTermValue(value);
    if (selected && uri === selected.uri)
      return <SelectedNode value={value} />;
    else return <EntityNode value={value} />;
  }
  return <LiteralNode value={value} />;
};

export default ElementNode;
