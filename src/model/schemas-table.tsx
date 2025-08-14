import { ColumnDef } from "@tanstack/react-table";
import { Flex, HStack, Badge, Text } from "@chakra-ui/react";

export interface SchemaField {
  name: string;
  type: "string" | "integer" | "float" | "boolean" | "timestamp" | "enum";
  primary_key?: boolean;
  required?: boolean;
  enum?: string[];
}

export interface Schema {
  name: string;
  description: string;
  fields: SchemaField[];
  indexes?: string[];
}

export type SchemaTableRow = [string, Schema];

export const schemaColumns: ColumnDef<SchemaTableRow>[] = [
  {
    accessorKey: "0",
    header: "ID",
    cell: ({ row }) => {
      return (
        <Text fontFamily="mono" fontSize="sm">
          {row.original[0]}
        </Text>
      );
    },
  },
  {
    accessorKey: "1.description",
    header: "Description",
    cell: ({ row }) => {
      return <Text>{row.original[1].description}</Text>;
    },
  },
  {
    header: "Fields",
    cell: ({ row }) => {
      const fieldCount = row.original[1].fields.length;
      const pkCount = row.original[1].fields.filter(f => f.primary_key).length;
      return (
        <HStack spacing={2}>
          <Badge size="sm" colorScheme="blue">
            {fieldCount} field{fieldCount !== 1 ? "s" : ""}
          </Badge>
          {pkCount > 0 && (
            <Badge size="sm" colorScheme="purple">
              {pkCount} PK
            </Badge>
          )}
        </HStack>
      );
    },
  },
  {
    header: "Types",
    cell: ({ row }) => {
      const types = [...new Set(row.original[1].fields.map(f => f.type))];
      return (
        <Flex wrap="wrap" gap={1}>
          {types.map((type) => (
            <Badge key={type} size="sm" variant="outline">
              {type}
            </Badge>
          ))}
        </Flex>
      );
    },
  },
  {
    header: "Indexes",
    cell: ({ row }) => {
      const indexes = row.original[1].indexes || [];
      return (
        <Text fontSize="sm" color="gray.600">
          {indexes.length > 0 ? indexes.join(", ") : "None"}
        </Text>
      );
    },
  },
];