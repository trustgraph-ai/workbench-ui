import React, { useEffect, useState } from "react";

import { useProgressStateStore } from "../../state/progress";
import EditDialog from "./EditDialog";
import Controls from "./Controls";
import ToolsTable from "./ToolsTable";
import { useSocket } from "../../api/trustgraph/socket";
import { toaster } from "../ui/toaster";

const Tools = () => {
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
    .config()
      .getConfig([{ type: "agent", key: "tool-index" }])
      .then((res) => {
        const toolIds = JSON.parse(res.values[0].value);

        return socket
        .config()
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
      <ToolsTable
        selected={selected}
        setSelected={setSelected}
        tools={tools}
      />
      <Controls onUpdate={() => refresh(socket)} />
    </>
  );
};

export default Tools;
