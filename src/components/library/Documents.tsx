import React, { useEffect, useState } from "react";

import {
  useQueryClient,
  useQuery,
  useMutation,
} from '@tanstack/react-query'

import { v4 as uuidv4 } from "uuid";

import { useProgressStateStore } from "../../state/progress";
import { toaster } from "../ui/toaster";
import { useSocket } from "../../api/trustgraph/socket";

import Actions from "./Actions";
import SubmitDialog from "./SubmitDialog";
import DocumentTable from "./DocumentTable";
import DocumentControls from "./DocumentControls";
import UploadDialog from "../load/UploadDialog";

export const useActivity = (isActive, description) => {

  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  useEffect(() => {
    if (isActive) {
      addActivity(description)
      return () => removeActivity(description)
    }
  }, [isActive, description])

}

const useLibrary = () => {

  const socket = useSocket();
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ['documents'],
    queryFn: () => { return socket.librarian().getDocuments(); }
  });

  const documents = documentsQuery.isSuccess ? documentsQuery.data : [];

  const deleteDocumentsMutation = useMutation({
    mutationFn: (ids) => {
      console.log("DELETE", ids);
      const asd = Promise.all(
        ids.map(id => socket.librarian().removeDocument(id))
      );
      console.log(asd);
      return asd;
    },
    onError: (x) => console.log(x),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    }
  });

  useActivity(documentsQuery.isLoading, "Loading documents");
  useActivity(deleteDocumentsMutation.isPending, "Deleting documents");

  return {
    documents: documentsQuery.data,
    isLoading: documentsQuery.isLoading,
    isError: documentsQuery.isError,
    error: documentsQuery.error,
    deleteDocuments: deleteDocumentsMutation.mutate,
    isDeleting: deleteDocumentsMutation.isPending,
    deleteError: deleteDocumentsMutation.error,
    refetch: documentsQuery.refetch
  }

};

const Documents = () => {

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitOpen, setSubmitOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const library = useLibrary();
  const documents = library.documents ? library.documents : [];
  const deleteDocuments = library.deleteDocuments;

  const toggle = (id) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

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
  }

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
        selectedCount={selected.size}
        onSubmit={onSubmit}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <SubmitDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        onSubmit={onSubmitConfirm}
        docs={documents.filter((x) => selected.has(x.id))}
      />

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onComplete={onUploadComplete}
      />

      <DocumentTable selected={selected} documents={documents} toggle={toggle} />

      <DocumentControls onUpload={upload} />
    </>
  );
};

export default Documents;
