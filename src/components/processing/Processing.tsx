import React, { useEffect, useState } from "react";

import { Table, Tag } from "@chakra-ui/react";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { useProgressStateStore } from "../../state/progress";
import { useSocket } from "../../api/trustgraph/socket";
import { timeString } from "../../utils/time-string.ts";
import { toaster } from "../ui/toaster";
import { useProcessing } from "../../state/processing";
import BasicTable from "../common/BasicTable";

import { columns } from "../../model/processing-table";

const ProcessingTable = () => {
  // Processing state
  const processingState = useProcessing();
  const processing = processingState.processing
    ? processingState.processing
    : [];

  // Initialize React Table with document data and column configuration
  const table = useReactTable({
    data: processing,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <BasicTable table={table} />;
};

export default ProcessingTable;
