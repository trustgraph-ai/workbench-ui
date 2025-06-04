import React, { useState } from "react";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { columns } from "../../model/document-table";

import { useLibrary } from "../../state/library.ts";
import { useNotification } from "../../state/notify.ts";
import Actions from "./Actions";
import SubmitDialog from "./SubmitDialog";
import DocumentTable from "./DocumentTable";
import DocumentControls from "./DocumentControls";
import UploadDialog from "../load/UploadDialog";

const Documents = () => {
  const [submitOpen, setSubmitOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const notify = useNotification();

  const library = useLibrary();
  const documents = library.documents ? library.documents : [];

  const table = useReactTable({
    data: documents,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const selected = table.getSelectedRowModel().rows.map((x) => x.original.id);

  const deleteDocuments = (ids) =>
    library.deleteDocuments({
      ids: ids,
      onSuccess: () => {
        table.setRowSelection({});
      },
    });

  const submitDocuments = (ids, flow, tags) =>
    library.submitDocuments({
      ids: ids,
      flow: flow,
      tags: tags,
      onSuccess: () => {
        table.setRowSelection({});
        setSubmitOpen(false);
      },
    });

  const onConfirmSubmit = (flow, tags) => {
    submitDocuments(selected, flow, tags);
  };

  const onEdit = () => {
    notify.info("Not implemented");
  };

  const onDelete = () => {
    deleteDocuments(selected);
  };

  const onUploadComplete = () => {
    setUploadOpen(false);
  };

  return (
    <>
      <Actions
        selectedCount={selected.length}
        onSubmit={() => setSubmitOpen(true)}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <SubmitDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        onSubmit={onConfirmSubmit}
        docs={table.getSelectedRowModel().rows.map((x) => x.original)}
      />

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onComplete={onUploadComplete}
      />

      <DocumentTable table={table} />

      <DocumentControls onUpload={() => setUploadOpen(true)} />
    </>
  );
};

export default Documents;
