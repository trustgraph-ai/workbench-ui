import React from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Spinner,
  Center,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
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
  const [selectedSchema, setSelectedSchema] = React.useState<SchemaTableRow | null>(null);

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
      <Alert status="error">
        <AlertIcon />
        Error loading schemas: {schemasError.toString()}
      </Alert>
    );
  }

  if (schemas.length === 0) {
    return (
      <Center h="200px">
        <Text color="gray.500">No schemas found. Create one to get started.</Text>
      </Center>
    );
  }

  return (
    <>
      <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
        <Table variant="simple">
          <Thead bg="gray.50">
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr
                key={row.id}
                _hover={{ bg: "gray.50", cursor: "pointer" }}
                onClick={() => handleRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
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