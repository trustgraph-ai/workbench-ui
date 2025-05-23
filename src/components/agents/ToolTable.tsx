import React, { useEffect, useState } from "react";

import { Table } from "@chakra-ui/react";

import EditDialog from "./EditDialog";
import Controls from "./Controls";
import { useSocket } from "../../api/trustgraph/socket";

const ToolTable = () => {
  const socket = useSocket();

  const [tools, setTools] = useState([]);

  const [selected, setSelected] = useState("");

  const refresh = () => {
    socket
      .getConfig([{ type: "agent", key: "tool-index" }])
      .then((res) => {
        const toolIds = JSON.parse(res.values[0].value);

        return socket
          .getConfig(
            toolIds.map((id) => {
              return {
                type: "agent",
                key: "tool." + id,
              };
            }),
          )
          .then((r) => {
            return { tools: toolIds, config: r.values };
          });
      })
      .then((p) => {
        return {
          tools: p.tools,
          config: p.config.map((c) => JSON.parse(c.value)),
        };
      })
      .then((p) => {
        const toolIds = p.tools;
        const config = p.config.map((c, ix) => [toolIds[ix], c]);
        return config;
      })
      .then((config) => setTools(config));
  };

  useEffect(() => {
    socket
      .getConfig([{ type: "agent", key: "tool-index" }])
      .then((res) => {
        const toolIds = JSON.parse(res.values[0].value);

        return socket
          .getConfig(
            toolIds.map((id) => {
              return {
                type: "agent",
                key: "tool." + id,
              };
            }),
          )
          .then((r) => {
            return { tools: toolIds, config: r.values };
          });
      })
      .then((p) => {
        return {
          tools: p.tools,
          config: p.config.map((c) => JSON.parse(c.value)),
        };
      })
      .then((p) => {
        const toolIds = p.tools;
        const config = p.config.map((c, ix) => [toolIds[ix], c]);
        return config;
      })
      .then((config) => setTools(config));
  }, [socket]);

  const onSelect = (row) => {
    setSelected(row[0]);
  };

  const onComplete = () => {
    console.log("COMPLETE");
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
      <Table.Root
        sx={{ minWidth: 450 }}
        aria-label="table of entities"
        interactive
      >
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Tool ID</Table.ColumnHeader>
            <Table.ColumnHeader>Description</Table.ColumnHeader>
            <Table.ColumnHeader>Type</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {tools.map((row, ix) => (
            <Table.Row key={ix} onClick={() => onSelect(row)}>
              <Table.Cell component="th" scope="row" verticalAlign="top">
                {row[0]}
              </Table.Cell>
              <Table.Cell verticalAlign="top">
                {row[1] ? row[1].description : ""}
              </Table.Cell>
              <Table.Cell verticalAlign="top">
                {row[1] ? row[1].type : ""}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Controls onUpdate={refresh} />
    </>
  );
};

export default ToolTable;
