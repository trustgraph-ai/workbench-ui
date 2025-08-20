import React, { useMemo } from "react";
import {
  Table,
  Editable,
  Popover,
  Text,
  RadioGroup,
  Stack,
  Box,
} from "@chakra-ui/react";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

interface Argument {
  name: string;
  description: string;
  type: "string" | "number";
}

interface EditableArgumentsTableProps {
  args: Argument[];
  editArgIx: number;
  setEditArgIx: (ix: number) => void;
  setArgAttr: (ix: number, attr: keyof Argument, value: string) => void;
}

const columnHelper = createColumnHelper<Argument>();

export const EditableArgumentsTable: React.FC<EditableArgumentsTableProps> = ({
  args,
  editArgIx,
  setEditArgIx,
  setArgAttr,
}) => {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "name",
        header: "Name",
        size: 20,
        cell: ({ row }) => (
          <Editable.Root
            autoResize={false}
            value={row.original.name}
            onValueChange={(v) => setArgAttr(row.index, "name", v.value)}
          >
            <Editable.Preview />
            <Editable.Input />
          </Editable.Root>
        ),
      }),
      columnHelper.display({
        id: "description",
        header: "Description",
        size: 50,
        cell: ({ row }) => (
          <Editable.Root
            value={row.original.description}
            onValueChange={(v) => setArgAttr(row.index, "description", v.value)}
          >
            <Editable.Preview />
            <Editable.Input />
          </Editable.Root>
        ),
      }),
      columnHelper.display({
        id: "type",
        header: "Type",
        size: 30,
        cell: ({ row }) => (
          <div onClick={() => setEditArgIx(row.index)}>
            {editArgIx === row.index && (
              <Popover.Root
                open={editArgIx === row.index}
                onOpenChange={(e) => {
                  if (!e.open) setEditArgIx(-1);
                }}
              >
                <Popover.Trigger asChild>
                  <Text cursor="pointer">{row.original.type}</Text>
                </Popover.Trigger>
                <Popover.Positioner>
                  <Popover.Content>
                    <Popover.Arrow />
                    <Popover.Body>
                      <RadioGroup.Root
                        value={row.original.type}
                        onValueChange={(v) =>
                          setArgAttr(row.index, "type", v.value)
                        }
                      >
                        <Stack gap="6">
                          <RadioGroup.Item value="string">
                            <RadioGroup.ItemHiddenInput />
                            <RadioGroup.ItemIndicator />
                            <RadioGroup.ItemText>string</RadioGroup.ItemText>
                          </RadioGroup.Item>
                          <RadioGroup.Item value="number">
                            <RadioGroup.ItemHiddenInput />
                            <RadioGroup.ItemIndicator />
                            <RadioGroup.ItemText>number</RadioGroup.ItemText>
                          </RadioGroup.Item>
                        </Stack>
                      </RadioGroup.Root>
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Popover.Root>
            )}
            {editArgIx !== row.index && (
              <Text cursor="pointer">{row.original.type}</Text>
            )}
          </div>
        ),
      }),
    ],
    [editArgIx, setEditArgIx, setArgAttr]
  );

  const table = useReactTable({
    data: args,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Show helpful message if no arguments yet
  if (args.length === 0) {
    return (
      <Box 
        p={4} 
        borderWidth="1px" 
        borderRadius="md" 
        borderStyle="dashed"
        borderColor="border.default"
        color="fg.muted"
        textAlign="center"
        fontSize="sm"
      >
        No arguments defined yet. Click "add argument" below to create template variables.
      </Box>
    );
  }

  return (
    <Table.Root interactive size="xs">
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Row key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.ColumnHeader
                key={header.id}
                width={
                  header.column.columnDef.size
                    ? `${header.column.columnDef.size}%`
                    : undefined
                }
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
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
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default EditableArgumentsTable;