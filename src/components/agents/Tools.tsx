import React, { useState } from "react";

import { useAgentTools } from "../../state/agent-tools";
import EditDialog from "./EditDialog";
import Controls from "./Controls";
import ToolsTable from "./ToolsTable";

const Tools = () => {
  const toolsState = useAgentTools();
  const [selected, setSelected] = useState("");

  const onComplete = () => {
    setSelected("");
  };

  return (
    <>
      <EditDialog
        open={selected != ""}
        onOpenChange={() => setSelected("")}
        onComplete={() => onComplete()}
        create={false}
        id={selected}
      />
      <ToolsTable
        selected={selected}
        setSelected={setSelected}
        tools={toolsState.tools}
      />
      <Controls />
    </>
  );
};

export default Tools;
