import React from "react";
import { Box, Table, Text, Spinner, Center } from "@chakra-ui/react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useSchemas } from "../../state/schemas";
import { SchemaTableRow, schemaColumns } from "../../model/schemas-table";
import { EditSchemaDialog } from "./EditSchemaDialog";

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

  if (schemasLoading) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (schemasError) {
    return (
      <Box
        p={4}
        borderWidth="1px"
        borderColor="red.500"
        borderRadius="md"
        bg="red.50"
      >
        <Text color="red.700">
          Error loading schemas: {schemasError.toString()}
        </Text>
      </Box>
    );
  }

  if (schemas.length === 0) {
    return (
      <Center h="200px">
        <Text color="fg.muted">
          No schemas found. Create one to get started.
        </Text>
      </Center>
    );
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
