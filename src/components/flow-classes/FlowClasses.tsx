import React from "react";
import { Box, Table, Text, Center } from "@chakra-ui/react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useFlows } from "../../state/flows";

// Define the flow class data structure
type FlowClassRow = [string, { description: string; [key: string]: unknown }];

// Table columns configuration
const flowClassColumns = [
  {
    id: "name",
    header: "Name",
    accessorFn: (row: FlowClassRow) => row[0],
    cell: ({ getValue }) => <Text fontWeight="medium">{getValue()}</Text>,
  },
  {
    id: "description", 
    header: "Description",
    accessorFn: (row: FlowClassRow) => row[1]?.description || "",
    cell: ({ getValue }) => <Text>{getValue()}</Text>,
  },
];

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

  if (isFlowClassesError) {
    return (
      <Box
        p={4}
        borderWidth="1px"
        borderColor="red.500"
        borderRadius="md"
        bg="red.50"
      >
        <Text color="red.700">
          Error loading flow classes: {flowClassesError?.toString()}
        </Text>
      </Box>
    );
  }

  if (!flowClasses || flowClasses.length === 0) {
    return (
      <Center h="200px">
        <Text color="fg.muted">
          No flow classes found.
        </Text>
      </Center>
    );
  }

  return (
    <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
      <Table.Root>
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
            <Table.Row key={row.id}>
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
  );
};

export default FlowClasses;