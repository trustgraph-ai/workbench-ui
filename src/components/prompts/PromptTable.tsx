import React, { useEffect, useState } from "react";
import { useSocket } from "../../api/trustgraph/socket";

import { Table, Code } from "@chakra-ui/react";
import EditDialog from "./EditDialog";
import PromptControls from "./PromptControls";

const PromptTable = () => {
  const socket = useSocket();

  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [prompts, setPrompts] = useState([]);

  const [selected, setSelected] = useState("");

  const refresh = () => {
    socket
      .getConfig([
        { type: "prompt", key: "system" },
        { type: "prompt", key: "template-index" },
      ])
      .then((res) => {
        setSystemPrompt(JSON.parse(res.values[0].value));

        const promptIds = JSON.parse(res.values[1].value);

        return socket
          .getConfig(
            promptIds.map((id) => {
              return {
                type: "prompt",
                key: "template." + id,
              };
            }),
          )
          .then((r) => {
            return { prompts: promptIds, config: r.values };
          });
      })
      .then((p) => {
        return {
          prompts: p.prompts,
          config: p.config.map((c) => JSON.parse(c.value)),
        };
      })
      .then((p) => {
        const promptIds = p.prompts;
        const config = p.config.map((c, ix) => [promptIds[ix], c]);
        return config;
      })
      .then((config) => setPrompts(config));
  };

  useEffect(() => {
    socket
      .getConfig([
        { type: "prompt", key: "system" },
        { type: "prompt", key: "template-index" },
      ])
      .then((res) => {
        setSystemPrompt(JSON.parse(res.values[0].value));

        console.log("System:", res.values[0].value);

        const promptIds = JSON.parse(res.values[1].value);

        return socket
          .getConfig(
            promptIds.map((id) => {
              return {
                type: "prompt",
                key: "template." + id,
              };
            }),
          )
          .then((r) => {
            return { prompts: promptIds, config: r.values };
          });
      })
      .then((p) => {
        return {
          prompts: p.prompts,
          config: p.config.map((c) => JSON.parse(c.value)),
        };
      })
      .then((p) => {
        const promptIds = p.prompts;
        const config = p.config.map((c, ix) => [promptIds[ix], c]);
        return config;
      })
      .then((config) => setPrompts(config));
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
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>Prompt</Table.ColumnHeader>
            <Table.ColumnHeader>Response</Table.ColumnHeader>
            <Table.ColumnHeader>Schema?</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {prompts.map((row, ix) => (
            <Table.Row key={ix} onClick={() => onSelect(row)}>
              <Table.Cell component="th" scope="row" verticalAlign="top">
                <Code>{row[0]}</Code>
              </Table.Cell>
              <Table.Cell verticalAlign="top">
                <Code>{row[1] ? row[1].prompt : ""}</Code>
              </Table.Cell>
              <Table.Cell verticalAlign="top">
                {row[1]
                  ? row[1]["response-type"] == "json"
                    ? "JSON"
                    : "text"
                  : "text"}
              </Table.Cell>
              <Table.Cell verticalAlign="top">
                {row[1] ? (row[1].schema ? "yes" : "no") : ""}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <PromptControls onUpdate={refresh} />
    </>
  );
};

export default PromptTable;
