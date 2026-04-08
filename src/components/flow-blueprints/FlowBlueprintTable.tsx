import React from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Box } from "@chakra-ui/react";

import {
  useFlowBlueprints,
  generateFlowBlueprintId,
  FlowBlueprintDefinition,
} from "@trustgraph/react-state";
import { flowBlueprintsColumns, FlowBlueprintRow } from "../../model/flow-blueprint-table";

import SelectableTable from "../common/SelectableTable";
import FlowBlueprintsActions from "./FlowBlueprintActions";
import FlowBlueprintsControls from "./FlowBlueprintControls";

interface FlowBlueprintsTableProps {
  onEdit?: (flowBlueprintsId: string) => void;
}

const FlowBlueprintsTable: React.FC<FlowBlueprintTableProps> = ({ onEdit }) => {
  const { flowBlueprints, createFlowBlueprints, deleteFlowBlueprint, duplicateFlowBlueprint } =
    useFlowBlueprints();

  // No need for selected flow blueprint state - actions handled by ActionBar

  // Transform flow Blueprint data if it's in [key, value] format
  const transformedFlowBlueprints = React.useMemo(() => {
    if (!flowBlueprints || !Array.isArray(flowBlueprints)) return [];

    // Check if first item is an array [key, value] pair
    if (
      flowBlueprints.length > 0 &&
      Array.isArray(flowBlueprints[0]) &&
      flowBlueprints[0].length === 2
    ) {
      return flowBlueprints.map(([id, flowBlueprints]) => ({
        id,
        ...(flowBlueprints as Omit<FlowBlueprintDefinition, "id">),
      }));
    }

    // Already transformed
    return flowBlueprints;
  }, [flowBlueprints]);

  // Initialize React Table with flow blueprint data and column configuration
  const table = useReactTable({
    data: (transformedFlowBlueprints as FlowBlueprintsRow[]) || [],
    columns: flowBlueprintsColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Get array of selected flow blueprint IDs from the table selection
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original.id!);
  const selectedCount = selectedIds.length;

  const handleEdit = () => {
    if (selectedRows.length === 1) {
      const flowBlueprintsId = selectedRows[0].original.id;
      onEdit?.(flowBlueprintsId);
    }
  };

  const handleDuplicate = async () => {
    if (selectedRows.length === 1) {
      const sourceId = selectedRows[0].original.id!;
      const targetId = generateFlowBlueprintId(`${sourceId}-copy`);

      try {
        await duplicateFlowBlueprints({ sourceId, targetId });
        table.setRowSelection({});
      } catch (error) {
        console.error("Failed to duplicate flow blueprint:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length > 0) {
      await Promise.all(selectedIds.map((id) => deleteFlowBlueprints(id)));
      table.setRowSelection({});
    }
  };

  const handleNew = async (id: string) => {
    const newFlowBlueprints = {
      blueprint: {},
      flow: {},
      interfaces: {},
      description: "New flow blueprint",
      tags: [],
    };

    try {
      await createFlowBlueprints({ id, flowBlueprint: newFlowBlueprint });
    } catch (error) {
      console.error("Failed to create flow blueprint:", error);
    }
  };

  // Removed edit panel handlers - no longer needed

  return (
    <Box position="relative">
      {/* Action buttons for bulk operations on selected flow Blueprint */}
      <FlowBlueprintsActions
        selectedCount={selectedCount}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />

      {/* Main table displaying flow Blueprint with selection capabilities */}
      <SelectableTable table={table} />

      {/* Controls for flow blueprint operations - create */}
      <FlowBlueprintsControls onNew={handleNew} />

      {/* No edit panel needed - actions are handled by the ActionBar */}
    </Box>
  );
};

export default FlowBlueprintsTable;
