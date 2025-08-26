import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useOntologies } from "../../state/ontologies";
import {
  OntologyTableRow,
  ontologyColumns,
} from "../../model/ontologies-table";
import { EditOntologyDialog } from "./EditOntologyDialog";
import TableWithStates from "../common/TableWithStates";

export const OntologiesTable: React.FC = () => {
  const { ontologies, ontologiesError } = useOntologies();
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedOntology, setSelectedOntology] =
    React.useState<OntologyTableRow | null>(null);

  const table = useReactTable({
    data: ontologies as OntologyTableRow[],
    columns: ontologyColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleRowClick = (row: OntologyTableRow) => {
    setSelectedOntology(row);
    setIsOpen(true);
  };

  // Loading state is handled by useActivity in the ontologies hook
  // CenterSpinner component automatically shows when activities are active

  return (
    <>
      <TableWithStates
        table={table}
        data={ontologies}
        error={ontologiesError}
        onClick={handleRowClick}
        emptyMessage="No ontologies found. Create one to get started."
        errorTitle="Error loading ontologies"
      />

      {selectedOntology && (
        <EditOntologyDialog
          open={isOpen}
          onOpenChange={(open) => setIsOpen(open)}
          mode="edit"
          ontologyId={selectedOntology[0]}
          initialOntology={selectedOntology[1]}
        />
      )}
    </>
  );
};
