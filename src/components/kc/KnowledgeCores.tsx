import React, { useEffect, useState } from "react";

import { useProgressStateStore } from "../../state/progress";
import { toaster } from "../ui/toaster";
import { useSocket } from "../../api/trustgraph/socket";
import { encode as msgpackEncode } from "@msgpack/msgpack";

import Actions from "./Actions";
import streamSaver from "streamsaver";
import KnowledgeCoresTable from './KnowledgeCoresTable';

const KnowledgeCores = () => {
  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );
  const [view, setView] = useState([]);

  const socket = useSocket();

  const refresh = (socket) => {
    const act = "Load knowledge cores";
    addActivity(act);
    socket
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
        refresh();
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
    const prom = socket.deleteKgCore(ids[0]).then(() => {
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
    console.log("DOWNLOAD");
    toaster.create({
      title: "Download is experimental",
      type: "info",
    });

    const sels = Array.from(selected);

    if (sels.length != 1) return;

    console.log(sels[0]);

    console.log("DOWNLOAD...");

    const fileStream = streamSaver.createWriteStream("filename.out", {
      //      size: uInt8.byteLength, // (optional filesize) Will show progress
      //            writableStrategy: undefined, // (optional)
      //                  readableStrategy: undefined  // (optional)
    });

    const writer = fileStream.getWriter();

    const receiver = (msg, fin) => {
      if (msg.triples) {
        const fmtd = {
          m: {
            i: msg.triples.metadata.id,
            m: msg.triples.metadata.metadata,
            u: msg.triples.metadata.user,
            c: msg.triples.metadata.collection,
          },
          t: msg.triples.triples,
        };
        const buf = msgpackEncode(["t", fmtd]);
        writer.write(buf);
      }

      if (msg["graph-embeddings"]) {
        const fmtd = {
          m: {
            i: msg["graph-embeddings"].metadata.id,
            m: msg["graph-embeddings"].metadata.metadata,
            u: msg["graph-embeddings"].metadata.user,
            c: msg["graph-embeddings"].metadata.collection,
          },
          e: msg["graph-embeddings"].entities.map((ge) => {
            return {
              v: ge.vectors,
              e: ge.entity,
            };
          }),
        };
        const buf = msgpackEncode(["ge", fmtd]);
        writer.write(buf);
      }

      //      console.log(buf);
      //      writer.write(buf);

      if (fin) {
        console.log("DONE");
        writer.close();
      }
    };

    socket.getKgCore(sels[0], null, receiver).then(() => {
      console.log("I am done");
      toaster.create({
        title: "Download finished",
        type: "success",
      });
    });
  };

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
      <KnowledgeCoresTable cores={view} selected={selected} toggle={toggle}
      />
    </>
  );
};

export default KnowledgeCores;
