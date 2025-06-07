import { useState } from "react";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import EditDialog from "./EditDialog";
import Controls from "./Controls";
import { useTokenCosts } from "../../state/token-costs";
import { columns } from "../../model/token-costs-table";
import ClickableTable from "../common/ClickableTable";

const TokenCostTable = () => {
  const state = useTokenCosts();

  const tokenCosts = state.tokenCosts ? state.tokenCosts : [];

  // Initialize React Table with document data and column configuration
  const table = useReactTable({
    data: tokenCosts,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const [selected, setSelected] = useState("");

  const onComplete = () => {
    setSelected("");
  };

  return (
    <>
      <EditDialog
        open={selected != ""}
        onOpenChange={() => setSelected("")}
        onComplete={() => onComplete()}
        create={false}
        id={selected}
      />

      <ClickableTable
        table={table}
        onClick={(row) => setSelected(row.original.model)}
      />

      <Controls />
    </>
  );
};

export default TokenCostTable;
