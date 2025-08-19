import React from "react";
import { Box, Table } from "@chakra-ui/react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useSchemas } from "../../state/schemas";
import { SchemaTableRow, schemaColumns } from "../../model/schemas-table";
import { EditSchemaDialog } from "./EditSchemaDialog";
import { ErrorState, EmptyState } from "./SchemaTableStates";

export const SchemasTable: React.FC = () => {
  const { schemas, schemasLoading, schemasError } = useSchemas();
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedSchema, setSelectedSchema] =
    React.useState<SchemaTableRow | null>(null);

  const table = useReactTable({
    data: schemas as SchemaTableRow[],
    columns: schemaColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleRowClick = (row: SchemaTableRow) => {
    setSelectedSchema(row);
    setIsOpen(true);
  };

  // Loading state is handled by useActivity in the schemas hook
  // CenterSpinner component automatically shows when activities are active

  if (schemasError) {
    return <ErrorState error={schemasError} />;
  }

  if (schemas.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
        <Table.Root interactive>
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeader key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <Table.Row
                key={row.id}
                onClick={() => handleRowClick(row.original)}
                style={{ cursor: "pointer" }}
              >
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {selectedSchema && (
        <EditSchemaDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          mode="edit"
          schemaId={selectedSchema[0]}
          initialSchema={selectedSchema[1]}
        />
      )}
    </>
  );
};
