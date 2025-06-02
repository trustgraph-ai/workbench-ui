import React, { useEffect, useState } from "react";

import { v4 as uuidv4 } from "uuid";

import { useProgressStateStore } from "../../state/progress";
import { toaster } from "../ui/toaster";
import { useSocket } from "../../api/trustgraph/socket";

import Actions from "./Actions";
import SubmitDialog from "./SubmitDialog";
import DocumentTable from "./DocumentTable";
import DocumentControls from "./DocumentControls";
import UploadDialog from "../load/UploadDialog";

const Documents = () => {
  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  const [view, setView] = useState([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitOpen, setSubmitOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const socket = useSocket();

  const refresh = (socket) => {
    const act = "Load library";
    addActivity(act);
    socket
      .librarian()
      .getDocuments()
      .then((x) => {
        setView(x);
        removeActivity(act);
      })
      .catch((err) => {
        console.log("Error:", err);
        removeAct(act);
        toaster.create({
          title: "Error: " + err.toString(),
          type: "error",
        });
      });
  };

  useEffect(() => {
    refresh(socket);
  }, [socket]);

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

    let title = view
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

    deleteOne(ids)
      .then(() => {
        console.log("Success");
        toaster.create({
          title: "Documents deleted",
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

  const deleteOne = (ids) => {
    // Shouldn't happen, make it a no-op.
    if (ids.length == 0) return;

    console.log("Deleting", ids[0]);
    const prom = socket
      .librarian()
      .removeDocument(ids[0])
      .then(() => {
        setView((x) => x.filter((row) => row.id != ids[0]));
        setSelected((x) => {
          const newSet = new Set(x);
          x.delete(ids[0]);
          return newSet;
        });
      });

    if (ids.length < 2) {
      return prom;
    } else {
      return prom.then(() => deleteOne(ids.slice(1)));
    }
  };

  const upload = () => {
    setUploadOpen(true);
  };

  const onUploadComplete = () => {
    console.log("UPLOAD!");
    setUploadOpen(false);
    refresh(socket);
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
        docs={view.filter((x) => selected.has(x.id))}
      />

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onComplete={onUploadComplete}
      />

      <DocumentTable selected={selected} documents={view} toggle={toggle} />

      <DocumentControls onUpload={upload} />
    </>
  );
};

export default Documents;
