import { createColumnHelper } from "@tanstack/react-table";
import { Taxonomy } from "../state/taxonomies";

export type TaxonomyTableRow = [string, Taxonomy];

const columnHelper = createColumnHelper<TaxonomyTableRow>();

export const taxonomyColumns = [
  columnHelper.accessor((row) => row[0], {
    id: "id",
    header: "ID",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => row[1].metadata.name, {
    id: "name",
    header: "Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => row[1].metadata.description, {
    id: "description",
    header: "Description",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor((row) => Object.keys(row[1].concepts).length, {
    id: "conceptCount",
    header: "Concepts",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => row[1].metadata.modified, {
    id: "modified",
    header: "Last Modified",
    cell: (info) => {
      const date = new Date(info.getValue());
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    },
  }),
];
