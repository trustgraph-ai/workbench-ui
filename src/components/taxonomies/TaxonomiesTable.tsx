import React from "react";
import { Box, Table, Text, Spinner, Center } from "@chakra-ui/react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useTaxonomies } from "../../state/taxonomies";
import { TaxonomyTableRow, taxonomyColumns } from "../../model/taxonomies-table";
import { EditTaxonomyDialog } from "./EditTaxonomyDialog";

export const TaxonomiesTable: React.FC = () => {
  const { taxonomies, taxonomiesLoading, taxonomiesError } = useTaxonomies();
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

  if (taxonomiesLoading) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (taxonomiesError) {
    return (
      <Box
        p={4}
        borderWidth="1px"
        borderColor="red.500"
        borderRadius="md"
        bg="red.50"
      >
        <Text color="red.700">
          Error loading taxonomies: {taxonomiesError.toString()}
        </Text>
      </Box>
    );
  }

  if (taxonomies.length === 0) {
    return (
      <Center h="200px">
        <Text color="gray.500">
          No taxonomies found. Create one to get started.
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