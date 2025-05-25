import React, { useEffect, useState } from "react";

import { Table } from "@chakra-ui/react";

import { toaster } from "../ui/toaster";
import { useSocket } from "../../api/trustgraph/socket";
import { useProgressStateStore } from "../../state/ProgressState";

const FlowClassesTable = () => {
  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  const [view, setView] = useState([]);

  const socket = useSocket();

  useEffect(() => {
    const act = "Load flow classes";
    addActivity(act);
    socket
      .getFlowClasses()
      .then((names) => {
        return Promise.all(
          names.map((name) =>
            socket.getFlowClass(name).then((x) => [name, x]),
          ),
        );
      })
      .then((x) => {
        setView(x);
        removeActivity(act);
      })
      .catch((err) => {
        console.log("Error:", err);
        toaster.create({
          title: "Error: " + err.toString(),
          type: "error",
        });
      });
  }, [socket]);

  return (
    <Table.Root sx={{ minWidth: 450 }} aria-label="table of entities">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Name</Table.ColumnHeader>
          <Table.ColumnHeader>Description</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {view.map((row: Row) => (
          <Table.Row
            key={row[0]}
            sx={{
              "&:last-child td": { border: 0 },
              "&:last-child th": { border: 0 },
            }}
          >
            <Table.Cell component="th" scope="row">
              {row[0]}
            </Table.Cell>
            <Table.Cell>{row[1].description}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default FlowClassesTable;
