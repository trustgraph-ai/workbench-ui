import React, { useEffect, useState } from "react";

import { Table, Code, Tabs, Box } from "@chakra-ui/react";

import { useProgressStateStore } from "../../state/ProgressState";
import EditDialog from "./EditDialog";
import PromptControls from "./PromptControls";
import { useSocket } from "../../api/trustgraph/socket";
import EditSystemPrompt from "./EditSystemPrompt";
import { toaster } from "../ui/toaster";

const PromptTable = () => {
  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  const socket = useSocket();

  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [prompts, setPrompts] = useState([]);

  const [selected, setSelected] = useState("");
  const [systemEdit, setSystemEdit] = useState(false);

  const refresh = (socket) => {
    const act = "Load prompts";
    addActivity(act);
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
      .then((config) => {
        removeActivity(act);
        setPrompts(config);
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
    console.log("COMPLETE");
    setSelected("");
    setSystemEdit(false);
    refresh(socket);
  };

  const onSystemEdit = () => {
    setSystemEdit(true);
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
      <EditSystemPrompt
        open={systemEdit}
        onOpenChange={() => setSystemEdit(false)}
        onComplete={() => onComplete()}
      />
      <Tabs.Root defaultValue="prompts">
        <Tabs.List>
          <Tabs.Trigger value="prompts">Prompt templates</Tabs.Trigger>
          <Tabs.Trigger value="system">System prompt</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="prompts">
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
                    <Code p={2}>{row[0]}</Code>
                  </Table.Cell>
                  <Table.Cell verticalAlign="top">
                    <Code p={2}>{row[1] ? row[1].prompt : ""}</Code>
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
          <PromptControls onUpdate={() => refresh(socket)} />
        </Tabs.Content>
        <Tabs.Content value="system">
          <Box
            onClick={() => onSystemEdit()}
            p={4}
            _hover={{ backgroundColor: "bg.emphasized" }}
          >
            <Code p={2}>{systemPrompt}</Code>
          </Box>
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
};

export default PromptTable;
