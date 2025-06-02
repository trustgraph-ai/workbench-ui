import React, { useEffect, useState } from "react";

import { useProgressStateStore } from "../../state/progress";
import { toaster } from "../ui/toaster";
import { useSocket } from "../../api/trustgraph/socket";

import Actions from "./Actions";
import KnowledgeCoresTable from "./KnowledgeCoresTable";
import KnowledgeCoreUpload from "./KnowledgeCoreUpload";

const KnowledgeCores = () => {
  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );
  const [view, setView] = useState([]);

  const [files, setFiles] = useState([]);
  const [id, setId] = useState("");

  const socket = useSocket();

  const refresh = (socket) => {
    const act = "Load knowledge cores";
    addActivity(act);
    socket
      .knowledge()
      .getKnowledgeCores()
      .then((x) => {
        removeActivity(act);
        setView(
          x.map((x) => {
            return { id: x };
          }),
        );
      })
      .catch((err) => {
        console.log("Error:", err);
        removeActivity(act);
        toaster.create({
          title: "Error: " + err.toString(),
          type: "error",
        });
      });
  };

  useEffect(() => {
    refresh(socket);
  }, [socket]);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const onDelete = () => {
    const ids = Array.from(selected);

    deleteOne(ids)
      .then(() => {
        console.log("Success");
        toaster.create({
          title: "Flows deleted",
          type: "success",
        });
        refresh(socket);
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
    const prom = socket.knowledge().deleteKgCore(ids[0]).then(() => {
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

  const onDownload = () => {

    const sels = Array.from(selected);

    for (const sel of sels) {

        console.log(sel);

        const fname = sel
          .replace("https://", "")
          .replace("http://", "")
          .replace(/[ :/]/g, "-")
          .replace(/[^-a-zA-Z0-9.]/g, "")
          .substr(0, 15)
          + ".core"
        ;

        console.log(">>", fname);

        const link = document.createElement("a");
        const url = "/api/export-core?" +
            "id=" + encodeURIComponent(sels[0]) +
            "&user=" + encodeURIComponent("trustgraph");

        link.href = url;

        link.download = fname;
        link.click();

    }

  };

  const upload = () => {

      // Submit button is disabled, shouldn't happen
      if (files.length == 0) return;

console.log(">>>", files);

      // Only 1 file can be selected
      const file = files[0];

      console.log("UPLAOD");

console.log("ID is ", id);

        const url = "/api/import-core?" +
            "id=" + encodeURIComponent(id) +
            "&user=" + encodeURIComponent("trustgraph");

  console.log(url);
  console.log(file);

fetch(url, {
method: "POST",
body: file,
}).then(() =>
{
console.log("UPLOAD SUCCESS");
setFiles([]);
setId("");
refresh(socket);
}
);

  }

  const toggle = (id) => {
    console.log(id);
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  return (
    <>
      <Actions
        selectedCount={selected.size}
        onDelete={onDelete}
        onDownload={onDownload}
      />
      <KnowledgeCoresTable cores={view} selected={selected} toggle={toggle} />
      <KnowledgeCoreUpload files={files} setFiles={setFiles}
          submit={() => upload()} id={id} setId={setId}
      />
    </>
  );
};

export default KnowledgeCores;
