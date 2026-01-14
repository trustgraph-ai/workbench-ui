import React, { useState } from "react";

import { ScrollText } from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import FlowBlueprintsTable from "../components/flow-Blueprint/FlowBlueprintTable";
import { FlowBlueprintsEditorView } from "../components/flow-Blueprint/FlowBlueprintEditorView";

type ViewMode = "table" | "editor";

const FlowBlueprintsPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [editingFlowBlueprintsId, setEditingFlowBlueprintId] = useState<string | null>(
    null,
  );

  const handleEditFlowBlueprints = (flowBlueprintId: string) => {
    setEditingFlowBlueprintsId(flowBlueprintId);
    setViewMode("editor");
  };

  const handleBackToTable = () => {
    setViewMode("table");
    setEditingFlowBlueprintsId(null);
  };

  if (viewMode === "editor" && editingFlowBlueprintsId) {
    return (
      <FlowBlueprintsEditorView
        flowBlueprintsId={editingFlowBlueprintId}
        onBack={handleBackToTable}
      />
    );
  }

  return (
    <>
      <PageHeader
        icon={<ScrollText />}
        title="Flow Blueprints"
        description="Managing the dataflow definitions"
      />
      <FlowBlueprintsTable onEdit={handleEditFlowBlueprint} />
    </>
  );
};

export default FlowBlueprintsPage;
