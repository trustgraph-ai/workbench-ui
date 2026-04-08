import React, { useState } from "react";

import { ScrollText } from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import FlowBlueprintsTable from "../components/flow-blueprints/FlowBlueprintTable";
import { FlowBlueprintEditorView } from "../components/flow-blueprints/FlowBlueprintEditorView";

type ViewMode = "table" | "editor";

const FlowBlueprintsPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [editingFlowBlueprintId, setEditingFlowBlueprintId] = useState<string | null>(
    null,
  );

  const handleEditFlowBlueprint = (flowBlueprintId: string) => {
    setEditingFlowBlueprintId(flowBlueprintId);
    setViewMode("editor");
  };

  const handleBackToTable = () => {
    setViewMode("table");
    setEditingFlowBlueprintId(null);
  };

  if (viewMode === "editor" && editingFlowBlueprintId) {
    return (
      <FlowBlueprintEditorView
        flowBlueprintId={editingFlowBlueprintId}
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
