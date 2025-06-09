import React, { useState } from "react";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { columns } from "../../model/knowledge-core-table";
import { useKnowledgeCores } from "../../state/knowledge-cores";

import SelectableTable from "../common/SelectableTable";
import Actions from "./Actions";
import Controls from "./Controls";
import LoadDialog from "./LoadDialog";

const KnowledgeCores = () => {
  const state = useKnowledgeCores();

  const knowledgeCores = state.knowledgeCores ? state.knowledgeCores : [];

  const [loadDialogOpen, setLoadDialogOpen] = useState(false);

  // Initialize React Table with document data and column configuration
  const table = useReactTable({
    data: knowledgeCores,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Get array of selected document IDs from the table selection
  const selected = table.getSelectedRowModel().rows.map((x) => x.original.id);


  const onDelete = () => {
    state.deleteKnowledgeCores({
      ids: selected,
      onSuccess: () => {
        // Clear row selection after successful deletion
        table.setRowSelection({});
      },
    });
  };

  const onDownload = () => {
    const sels = Array.from(selected);

    for (const sel of sels) {
      const fname =
        sel
          .replace("https://", "")
          .replace("http://", "")
          .replace(/[ :/]/g, "-")
          .replace(/[^-a-zA-Z0-9.]/g, "")
          .substr(0, 15) + ".core";

      const link = document.createElement("a");
      const url =
        "/api/export-core?" +
        "id=" +
        encodeURIComponent(sels[0]) +
        "&user=" +
        encodeURIComponent("trustgraph");

      link.href = url;

      link.download = fname;
      link.click();
    }
  };

  const onLoad = () => {
    setLoadDialogOpen(true);
  };

  const handleLoad = (ids, flow) => {
    state.loadKnowledgeCores({
      ids: ids,
      flow: flow,
      onSuccess: () => {
        // Clear row selection after successful load
        table.setRowSelection({});
      },
    });
  };

  return (
    <>
      <Actions
        selectedCount={selected.length}
        onDelete={onDelete}
        onDownload={onDownload}
        onLoad={onLoad}
      />

      <SelectableTable table={table} />

      <Controls />

      <LoadDialog
        open={loadDialogOpen}
        onOpenChange={setLoadDialogOpen}
        selectedIds={selected}
        onLoad={handleLoad}
      />
    </>
  );
};

export default KnowledgeCores;
