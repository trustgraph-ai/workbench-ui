import { createColumnHelper } from "@tanstack/react-table";
import { Text } from "@chakra-ui/react";

/**
 * Flow class data structure for the flow classes table
 * Represents a flow class as a tuple with name and metadata
 */
export type FlowClassRow = [
  string,
  { description: string; [key: string]: unknown },
];

// Create a column helper instance for type-safe column definitions
export const columnHelper = createColumnHelper<FlowClassRow>();

/**
 * Column definitions for the flow classes table
 * Defines how each column should be rendered and what data it displays
 */
export const flowClassColumns = [
  // Name column - displays the flow class name (first element of tuple)
  columnHelper.accessor((row) => row[0], {
    id: "name",
    header: "Name",
    cell: (info) => <Text fontWeight="medium">{info.getValue()}</Text>,
  }),

  // Description column - displays the flow class description
  columnHelper.accessor((row) => row[1]?.description || "", {
    id: "description",
    header: "Description",
    cell: (info) => <Text>{info.getValue()}</Text>,
  }),
];
