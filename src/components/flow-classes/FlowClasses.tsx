import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useFlows } from "../../state/flows";
import {
  FlowClassRow,
  flowClassColumns,
} from "../../model/flow-classes-table";
import TableWithStates from "../common/TableWithStates";

const FlowClasses: React.FC = () => {
  const { flowClasses, isFlowClassesError, flowClassesError } = useFlows();

  const table = useReactTable({
    data: (flowClasses as FlowClassRow[]) || [],
    columns: flowClassColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Loading state is handled by useActivity in the flows hook
  // CenterSpinner component automatically shows when activities are active

  return (
    <TableWithStates
      table={table}
      data={flowClasses || []}
      error={isFlowClassesError ? flowClassesError : undefined}
      emptyMessage="No flow classes found."
      errorTitle="Error loading flow classes"
    />
  );
};

export default FlowClasses;
