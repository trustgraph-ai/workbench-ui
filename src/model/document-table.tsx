
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Table, Tag, Checkbox } from "@chakra-ui/react";

import { timeString } from "../utils/time-string.ts";

export type Document = {
  id: string;
  title: string;
  time: number;
  kind: string;
  user: string;
  comments: string;
  tags: string[];
  metadata: {
    s: { v: string; e: boolean };
    p: { v: string; e: boolean };
    o: { v: string; e: boolean };
  }[];
};

export const columnHelper = createColumnHelper<Document>();

  const selectionState = (table) => {
    if (table.getIsAllRowsSelected()) return true;
    if (table.getIsSomeRowsSelected()) return "indeterminate";
    return false;
  };

export const columns = [
    // Checkbox column instead of ID
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox.Root
          size="lg"
          variant="solid"
          checked={selectionState(table)}
          onChange={table.getToggleAllRowsSelectedHandler()}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      ),
      cell: ({ row }) => (
        <Checkbox.Root
          size="lg"
          variant="solid"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      ),
    }),
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("time", {
      header: "Time",
      cell: (info) => timeString(info.getValue()),
    }),
    // Description column showing comments data
    columnHelper.accessor("comments", {
      id: "description",
      header: "Description",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("tags", {
      header: "Tags",
      cell: (info) =>
        info.getValue()?.map((t) => (
          <Tag.Root key={t} mr={2}>
            <Tag.Label>{t}</Tag.Label>
          </Tag.Root>
        )),
    }),
  ];
