import React, { useState } from "react";

import { useSocket } from "../../api/trustgraph/socket";
import { useFlows } from "../../state/flows";

import Actions from "./Actions";
import FlowControls from "./FlowControls";
import FlowsTable from "./FlowsTable";

const Flows = () => {

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const flowState = useFlows();
  const flows = flowState.flows ? flowState.flows : [];

  const socket = useSocket();

  const onDelete = () => {
    const ids = Array.from(selected);
    flowState.stopFlows({
      ids: ids,
      onSuccess: () => {},
    });
  };

  const toggle = (id) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  return (
    <>
      <Actions selectedCount={selected.size} onDelete={onDelete} />
      <FlowsTable flows={flows} selected={selected} toggle={toggle} />
      <FlowControls />
    </>
  );
};

export default Flows;
