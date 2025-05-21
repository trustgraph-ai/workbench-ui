import React, { useEffect, useState } from "react";

import { Table, Link } from "@chakra-ui/react";

import { useWorkbenchStateStore } from "../../state/WorkbenchState";
import { Row } from "../state/row";

import { useSocket } from "../../api/trustgraph/socket";

const KnowledgeCoresTable = () => {
  const [view, setView] = useState([]);

  const socket = useSocket();

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

  const setSelected = useWorkbenchStateStore((state) => state.setSelected);

  const setTool = useWorkbenchStateStore((state) => state.setTool);

  const select = (row: Row) => {
    setSelected({ uri: row.uri, label: row.label ? row.label : "n/a" });
    setTool("entity");
  };

  return (
    <Table.Root sx={{ minWidth: 450 }} aria-label="table of entities">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>ID</Table.ColumnHeader>
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
              <Link
                align="left"
                component="button"
                onClick={() => select(row)}
              >
                {row.id}
              </Link>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default KnowledgeCoresTable;
