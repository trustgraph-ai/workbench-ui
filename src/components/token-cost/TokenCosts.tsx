import React, { useEffect, useState } from "react";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { Table } from "@chakra-ui/react";

import { useProgressStateStore } from "../../state/progress";
import { useSocket } from "../../api/trustgraph/socket";
import EditDialog from "./EditDialog";
import Controls from "./Controls";
import { toaster } from "../ui/toaster";
import { useTokenCosts } from '../../state/token-costs';
import { columns } from '../../model/token-costs-table';
import ClickableTable from "../common/ClickableTable";

const TokenCostTable = () => {

  const state = useTokenCosts();

const tokenCosts = state.tokenCosts ? state.tokenCosts : [];


  // Initialize React Table with document data and column configuration
  const table = useReactTable({
    data: tokenCosts,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });
  

  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  const [view, setView] = useState([]);

  const socket = useSocket();

  const refresh = (socket) => {
    const act = "Load token costs...";
    addActivity(act);
    socket
      .config()
      .getTokenCosts()
      .then((x) => {
        setView(x);
        removeActivity(act);
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

  const [selected, setSelected] = useState("");

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

      <ClickableTable table={table}
        onClick={(row) => setSelected(row.original.model)}
      />

      <Controls onUpdate={() => refresh(socket)} />
    </>
  );
};

export default TokenCostTable;
