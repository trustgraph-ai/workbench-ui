import React, { useEffect, useState } from "react";

import { Table, Tag } from "@chakra-ui/react";

import { useSocket } from "../../api/trustgraph/socket";
import { timeString } from "../../utils/time-string.ts";

const ProcessingTable = () => {
  const [view, setView] = useState([]);

  const socket = useSocket();

  useEffect(() => {
    socket
      .getLibraryProcessing()
      .then((x) => setView(x))
      .catch((err) => console.log("Error:", err));
  }, [socket]);

  return (
    <Table.Root sx={{ minWidth: 450 }} aria-label="table of entities">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>ID</Table.ColumnHeader>
          <Table.ColumnHeader>Time</Table.ColumnHeader>
          <Table.ColumnHeader>Document</Table.ColumnHeader>
          <Table.ColumnHeader>Tags</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {view.map((row: Row) => (
          <Table.Row
            key={row.id}
            sx={{
              "&:last-child td": { border: 0 },
              "&:last-child th": { border: 0 },
            }}
          >
            <Table.Cell component="th" scope="row">
              {row.id}
            </Table.Cell>
            <Table.Cell>{timeString(row.time)}</Table.Cell>
            <Table.Cell>{row["document-id"]}</Table.Cell>
            <Table.Cell>
              {row.tags.map((t) => (
                <Tag.Root key={t} mr={2}>
                  <Tag.Label>{t}</Tag.Label>
                </Tag.Root>
              ))}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default ProcessingTable;
