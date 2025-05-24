import React, { useEffect, useState } from "react";

import { Table } from "@chakra-ui/react";

import { useSocket } from "../../api/trustgraph/socket";

const FlowClassesTable = () => {
  const [view, setView] = useState([]);

  const socket = useSocket();

  useEffect(() => {
    socket
      .getFlowClasses()
      .then((names) => {
        return Promise.all(
          names.map((name) =>
            socket.getFlowClass(name).then((x) => [name, x]),
          ),
        );
      })
      .then((x) => setView(x))
      .catch((err) => console.log("Error:", err));
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
