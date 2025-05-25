import React, { useEffect, useState } from "react";

import { Table, Tag } from "@chakra-ui/react";

import { useProgressStateStore } from "../../state/progress";
import { useSocket } from "../../api/trustgraph/socket";
import { timeString } from "../../utils/time-string.ts";
import { toaster } from "../ui/toaster";

const ProcessingTable = () => {
  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );
  const [view, setView] = useState([]);

  const socket = useSocket();

  useEffect(() => {
    const act = "Load submissions";
    addActivity(act);
    socket
      .librarian()
      .getProcessing()
      .then((x) => {
        setView(x);
        removeActivity(act);
      })
      .catch((err) => {
        console.log("Error:", err);
        removeActivity(act);
        console.log(err);
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
