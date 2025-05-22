import React, { useEffect, useState } from "react";

import { Table, Checkbox } from "@chakra-ui/react";

import { toaster } from "../ui/toaster";

import { useSocket } from "../../api/trustgraph/socket";
import Actions from "./Actions";
import streamSaver from 'streamsaver';
import { encode as msgpackEncode } from "@msgpack/msgpack";

const KnowledgeCoresTable = () => {
  const [view, setView] = useState([]);

  const socket = useSocket();

  const refresh = () => {
    socket
      .getKnowledgeCores()
      .then((x) =>
        setView(
          x.map((x) => {
            return { id: x };
          }),
        ),
      )
      .catch((err) => console.log("Error:", err));
  };

  useEffect(() => {
    socket
      .getKnowledgeCores()
      .then((x) =>
        setView(
          x.map((x) => {
            return { id: x };
          }),
        ),
      )
      .catch((err) => console.log("Error:", err));
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
    const prom = socket.stopFlow(ids[0]).then(() => {
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

    const fileStream = streamSaver.createWriteStream('filename.out', {
//      size: uInt8.byteLength, // (optional filesize) Will show progress
//            writableStrategy: undefined, // (optional)
//                  readableStrategy: undefined  // (optional)
    });

    const writer = fileStream.getWriter();
    const encoder = new TextEncoder();


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
        }
        const buf = msgpackEncode(["t", msg]);
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
          e: msg["graph-embeddings"].entities.map(
            (ge) => {
              return {
                v: ge.vectors,
                e: ge.entity,
              };
            }
          )
        }
        const buf = msgpackEncode(["ge", msg]);
        writer.write(buf);
      }


//      console.log(buf);
//      writer.write(buf);

      if (fin) {
        console.log("DONE");
        writer.close();
      }
    };


    socket
      .getKgCore(sels[0], null, receiver)
      .then(() => {
          console.log("I am done");
        toaster.create({
          title: "Download finished",
          type: "success",
        });
}
          );

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
      <Table.Root sx={{ minWidth: 450 }} aria-label="table of entities">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {view.map((row) => (
            <Table.Row key={row.id} onClick={() => toggle(row.id)}>
              <Table.Cell>
                <Checkbox.Root
                  size="lg"
                  variant="solid"
                  checked={selected.has(row.id)}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                </Checkbox.Root>
              </Table.Cell>
              <Table.Cell component="th" scope="row">
                {row.id}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
};

export default KnowledgeCoresTable;
