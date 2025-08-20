import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useTaxonomies } from "../../state/taxonomies";
import {
  TaxonomyTableRow,
  taxonomyColumns,
} from "../../model/taxonomies-table";
import { EditTaxonomyDialog } from "./EditTaxonomyDialog";
import TableWithStates from "../common/TableWithStates";

export const TaxonomiesTable: React.FC = () => {
  const { taxonomies, taxonomiesError } = useTaxonomies();
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedTaxonomy, setSelectedTaxonomy] =
    React.useState<TaxonomyTableRow | null>(null);

  const table = useReactTable({
    data: taxonomies as TaxonomyTableRow[],
    columns: taxonomyColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleRowClick = (row: TaxonomyTableRow) => {
    setSelectedTaxonomy(row);
    setIsOpen(true);
  };

  // Loading state is handled by useActivity in the taxonomies hook
  // CenterSpinner component automatically shows when activities are active

  return (
    <>
      <TableWithStates
        table={table}
        data={taxonomies}
        error={taxonomiesError}
        onClick={handleRowClick}
        emptyMessage="No taxonomies found. Create one to get started."
        errorTitle="Error loading taxonomies"
      />

      {selectedTaxonomy && (
        <EditTaxonomyDialog
          open={isOpen}
          onOpenChange={(open) => setIsOpen(open)}
          mode="edit"
          taxonomyId={selectedTaxonomy[0]}
          initialTaxonomy={selectedTaxonomy[1]}
        />
      )}
    </>
  );
};
