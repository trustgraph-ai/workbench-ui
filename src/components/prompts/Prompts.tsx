import React, { useEffect, useState } from "react";

import { Tabs } from "@chakra-ui/react";

import { useProgressStateStore } from "../../state/progress";
import { useSocket } from "../../api/trustgraph/socket";
import { toaster } from "../ui/toaster";

import EditDialog from "./EditDialog";
import PromptControls from "./PromptControls";
import EditSystemPrompt from "./EditSystemPrompt";
import PromptsTable from "./PromptsTable";
import SystemPrompt from "./SystemPrompt";

const Prompts = () => {
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
      .config()
      .getConfig([
        { type: "prompt", key: "system" },
        { type: "prompt", key: "template-index" },
      ])
      .then((res) => {
        setSystemPrompt(JSON.parse(res.values[0].value));

        const promptIds = JSON.parse(res.values[1].value);

        return socket
          .config()
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
          <PromptsTable prompts={prompts} onSelect={(row) => onSelect(row)} />
          <PromptControls onUpdate={() => refresh(socket)} />
        </Tabs.Content>
        <Tabs.Content value="system">
          <SystemPrompt prompt={systemPrompt} onEdit={onSystemEdit} />
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
};

export default Prompts;
