import React, { useEffect, useState } from "react";

import { Table, Checkbox } from "@chakra-ui/react";

import { useSocket } from "../../api/trustgraph/socket";
import Actions from "./Actions";
import FlowControls from "./FlowControls";

const FlowTable = () => {
  const [view, setView] = useState([]);

  const socket = useSocket();

  const refresh = () => {
    socket
      .getFlows()
      .then((ids) => {
        return Promise.all(
          ids.map((id) => socket.getFlow(id).then((x) => [id, x])),
        );
      })
      .then((x) => setView(x))
      .catch((err) => console.log("Error:", err));
  };

  useEffect(() => {
    refresh();
  });

  const onDelete = () => {};

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
            <Table.Row onClick={() => toggle(row.id)} key={row[0]}>
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
              <Table.Cell>{row[0]}</Table.Cell>
              <Table.Cell>{row[1]["class-name"]}</Table.Cell>
              <Table.Cell>{row[1].description}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <FlowControls onUpdate={refresh} />
    </>
  );
};

export default FlowTable;
