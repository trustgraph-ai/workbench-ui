import React, { useEffect, useState } from "react";

import { Table, Checkbox } from "@chakra-ui/react";

import { toaster } from "../ui/toaster";

import { useSocket } from "../../api/trustgraph/socket";
import Actions from "./Actions";

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

const receiver = (msg, fin)  => {
console.log(msg);
if (fin) console.log("DONE");
};

  const onDownload = () => {
    console.log("DOWNLOAD");
    const sels = Array.from(selected);
    if (sels.length != 1) return;
    console.log(sels[0]);

console.log("DOWNLOAD...");
socket.getKgCore(sels[0], null, receiver).then(
   (x) => console.log("I am done")
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
      <Actions selectedCount={selected.size}
        onDelete={onDelete} onDownload={onDownload}
      />
    <Table.Root sx={{ minWidth: 450 }} aria-label="table of entities">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>ID</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {view.map((row) => (
          <Table.Row
            key={row.id} onClick={() => toggle(row.id)}
          >
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
