import React, { useEffect, useState } from "react";

import { useProgressStateStore } from "../../state/progress";
import { useSocket } from "../../api/trustgraph/socket";
import { toaster } from "../ui/toaster";

import Actions from "./Actions";
import FlowControls from "./FlowControls";
import FlowsTable from "./FlowsTable";

const Flows = () => {
  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  const [flows, setFlows] = useState([]);

  const socket = useSocket();

  const refresh = (socket) => {
    const act = "Load flows";
    addActivity(act);
    socket
    .flows()
      .getFlows()
      .then((ids) => {
        return Promise.all(
          ids.map((id) => socket.flows().getFlow(id).then((x) => [id, x])),
        );
      })
      .then((x) => {
        removeActivity(act);
        setFlows(x);
      })
      .catch((err) => {
        removeActivity(act);
        console.log("Error:", err);
      });
  };

  useEffect(() => {
    refresh(socket);
  }, [socket]);

  const onDelete = () => {
    const ids = Array.from(selected);

    deleteOne(ids)
      .then(() => {
        console.log("Success");
        toaster.create({
          title: "Flows deleted",
          type: "success",
        });
        refresh(socket);
      })
      .catch((e) =>
        toaster.create({
          title: "Error: " + e.toString(),
          type: "error",
        }),
      );
  };

  const deleteOne = (ids) => {
    // Shouldn't happen, make it a no-op.
    if (ids.length == 0) return;

    console.log("Deleting", ids[0]);
    const prom = socket.flows().stopFlow(ids[0]).then(() => {
      setFlows((x) => x.filter((row) => row.id != ids[0]));
      setSelected((x) => {
        const newSet = new Set(x);
        x.delete(ids[0]);
        return newSet;
      });
    });

    if (ids.length < 2) {
      return prom;
    } else {
      return prom.then(() => deleteOne(ids.slice(1)));
    }
  };

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  return (
    <>
      <Actions selectedCount={selected.size} onDelete={onDelete} />
      <FlowsTable flows={flows} selected={selected} toggle={toggle} />
      <FlowControls onUpdate={() => refresh(socket)} />
    </>
  );
};

export default Flows;
