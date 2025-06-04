import React, { useState } from "react";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { v4 as uuidv4 } from "uuid";

import { columns } from "../../model/document-table";

import { toaster } from "../ui/toaster";
import { useLibrary } from "../../state/library.ts";
import Actions from "./Actions";
import SubmitDialog from "./SubmitDialog";
import DocumentTable from "./DocumentTable";
import DocumentControls from "./DocumentControls";
import UploadDialog from "../load/UploadDialog";

const Documents = () => {
  const [submitOpen, setSubmitOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const library = useLibrary();
  const documents = library.documents ? library.documents : [];
  const deleteDocuments = library.deleteDocuments;

  const table = useReactTable({
    data: documents,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const selected = table.getSelectedRowModel().rows.map((x) => x.original.id);

  const onSubmit = () => {
    setSubmitOpen(true);
  };

  const onSubmitConfirm = (flow, tags) => {
    setSubmitOpen(false);

    const ids = Array.from(selected);

    submitOne(ids, flow, tags)
      .then(() => {
        console.log("Success");
        setSelected(() => new Set([]));
        toaster.create({
          title: "Documents submitted",
          type: "success",
        });
      })
      .catch((e) =>
        toaster.create({
          title: "Error: " + e.toString(),
          type: "error",
        }),
      );
  };

  const submitOne = (ids, flow, tags) => {
    // Shouldn't happen, make it a no-op.
    if (ids.length == 0) return;

    console.log("Submitting", ids[0]);

    const proc_id = uuidv4();

    let title = documents
      .filter((row) => row.id == ids[0])
      .map((row) => row.title)
      .join(",");

    if (!title) title = "<no title>";

    const prom = socket
      .librarian()
      .addProcessing(proc_id, ids[0], flow, null, null, tags)
      .then(() => {
        toaster.create({
          title: "Submitted " + title,
          type: "info",
        });
      });

    if (ids.length < 2) {
      return prom;
    } else {
      return prom.then(() => submitOne(ids.slice(1), flow, tags));
    }
  };

  const onEdit = () => {
    toaster.create({
      title: "Not implemented",
      type: "info",
    });
  };

  const onDelete = () => {
    const ids = Array.from(selected);
    deleteDocuments(ids);
  };

  const upload = () => {
    setUploadOpen(true);
  };

  const onUploadComplete = () => {
    console.log("UPLOAD!");
    setUploadOpen(false);
    //    refresh(socket);
  };

  return (
    <>
      <Actions
        selectedCount={selected.length}
        onSubmit={onSubmit}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <SubmitDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        onSubmit={onSubmitConfirm}
        docs={table.getSelectedRowModel().rows.map((x) => x.original)}
      />

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onComplete={onUploadComplete}
      />

      <DocumentTable table={table} />
      <DocumentControls onUpload={upload} />
    </>
  );
};

export default Documents;
