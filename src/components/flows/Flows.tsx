import React, { useEffect, useState } from "react";

import { Table, Checkbox } from "@chakra-ui/react";

import { useProgressStateStore } from "../../state/ProgressState";
import { useSocket } from "../../api/trustgraph/socket";
import Actions from "./Actions";
import FlowControls from "./FlowControls";
import { toaster } from "../ui/toaster";

const FlowTable = () => {
  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  const [view, setView] = useState([]);

  const socket = useSocket();

  const refresh = (socket) => {
    const act = "Load flows";
    addActivity(act);
    socket
      .getFlows()
      .then((ids) => {
        return Promise.all(
          ids.map((id) => socket.getFlow(id).then((x) => [id, x])),
        );
      })
      .then((x) => {
        removeActivity(act);
        setView(x);
      })
      .catch((err) => {
        removeActivity(act);
        console.log("Error:", err);
      });
  };

  useEffect(() => {
    refresh(socket);
  }, [socket]);

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

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  return (
    <>
      <Actions selectedCount={selected.size} onDelete={onDelete} />

      <Table.Root interactive>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>Class name</Table.ColumnHeader>
            <Table.ColumnHeader>Description</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {view.map((row: Row) => (
            <Table.Row onClick={() => toggle(row[0])} key={row[0]}>
              <Table.Cell>
                <Checkbox.Root
                  size="lg"
                  variant="solid"
                  checked={selected.has(row[0])}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                </Checkbox.Root>
              </Table.Cell>
              <Table.Cell>{row[0]}</Table.Cell>
              <Table.Cell>{row[1]["class-name"]}</Table.Cell>
              <Table.Cell>{row[1].description}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <FlowControls onUpdate={() => refresh(socket)} />
    </>
  );
};

export default FlowTable;
