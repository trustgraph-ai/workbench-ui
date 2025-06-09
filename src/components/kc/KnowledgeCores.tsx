import React, { useState } from "react";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { columns } from "../../model/knowledge-core-table";
import { useSocket } from "../../api/trustgraph/socket";
import { useKnowledgeCores } from "../../state/knowledge-cores";

import SelectableTable from "../common/SelectableTable";
import Actions from "./Actions";
import KnowledgeCoreUpload from "./KnowledgeCoreUpload";

const KnowledgeCores = () => {
  const state = useKnowledgeCores();

  const knowledgeCores = state.knowledgeCores ? state.knowledgeCores : [];

  // Initialize React Table with document data and column configuration
  const table = useReactTable({
    data: knowledgeCores,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Get array of selected document IDs from the table selection
  const selected = table.getSelectedRowModel().rows.map((x) => x.original.id);

  const [files, setFiles] = useState([]);
  const [id, setId] = useState("");

  const socket = useSocket();

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

  const upload = () => {
    // Submit button is disabled, shouldn't happen
    if (files.length == 0) return;

    // Only 1 file can be selected
    const file = files[0];

    const url =
      "/api/import-core?" +
      "id=" +
      encodeURIComponent(id) +
      "&user=" +
      encodeURIComponent("trustgraph");

    fetch(url, {
      method: "POST",
      body: file,
    }).then(() => {
      console.log("Upload success.");
      setFiles([]);
      setId("");
      refresh(socket);
    });
  };

  return (
    <>
      <Actions
        selectedCount={selected.length}
        onDelete={onDelete}
        onDownload={onDownload}
      />

      <SelectableTable table={table} />

      <KnowledgeCoreUpload
        files={files}
        setFiles={setFiles}
        submit={() => upload()}
        id={id}
        setId={setId}
      />
    </>
  );
};

export default KnowledgeCores;
