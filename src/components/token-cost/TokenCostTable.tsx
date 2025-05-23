import React, { useEffect, useState } from "react";

import { Table } from "@chakra-ui/react";

import { useSocket } from "../../api/trustgraph/socket";
import EditDialog from "./EditDialog";
import Controls from "./Controls";

const TokenCostTable = () => {
  const [view, setView] = useState([]);

  const socket = useSocket();

  const refresh = () => {
    socket
      .getTokenCosts()
      .then((x) => setView(x))
      .catch((err) => console.log("Error:", err));
  };

  useEffect(() => {
    socket
      .getTokenCosts()
      .then((x) => setView(x))
      .catch((err) => console.log("Error:", err));
  }, [socket]);

  const [selected, setSelected] = useState("");

  const onComplete = () => {
    setSelected("");
    refresh();
  };

  return (
    <>
      <EditDialog
        open={selected != ""}
        onOpenChange={() => setSelected("")}
        onComplete={() => onComplete()}
        create={false}
        id={selected}
      />
      <Table.Root interactive>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Model</Table.ColumnHeader>
            <Table.ColumnHeader>Input ($/1Mt)</Table.ColumnHeader>
            <Table.ColumnHeader>Output ($/1Mt)</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {view.map((row: Row) => (
            <Table.Row key={row.model} onClick={() => setSelected(row.model)}>
              <Table.Cell component="th" scope="row">
                {row.model}
              </Table.Cell>
              <Table.Cell>
                {(row.input_price * 1000000).toFixed(3)}
              </Table.Cell>
              <Table.Cell>
                {(row.output_price * 1000000).toFixed(3)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Controls onUpdate={refresh} />
    </>
  );
};

export default TokenCostTable;
