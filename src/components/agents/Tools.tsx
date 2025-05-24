import React, { useEffect, useState } from "react";

import { Table } from "@chakra-ui/react";

import { useProgressStateStore } from "../../state/progress";
import EditDialog from "./EditDialog";
import Controls from "./Controls";
import { useSocket } from "../../api/trustgraph/socket";
import { toaster } from "../ui/toaster";

const ToolTable = () => {
  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  const socket = useSocket();

  const [tools, setTools] = useState([]);

  const [selected, setSelected] = useState("");

  const refresh = (socket) => {
    const act = "Load tools";
    addActivity(act);

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
      .then((config) => {
        removeActivity(act);
        setTools(config);
      })
      .catch((err) => {
        removeActivity(act);
        console.log("Error:", err);
        toaster.create({
          title: "Error: " + err.toString(),
          type: "error",
        });
      });
  };

  useEffect(() => {
    refresh(socket);
  }, [socket]);

  const onSelect = (row) => {
    setSelected(row[0]);
  };

  const onComplete = () => {
    setSelected("");
    refresh(socket);
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
      <Controls onUpdate={() => refresh(socket)} />
    </>
  );
};

export default ToolTable;
