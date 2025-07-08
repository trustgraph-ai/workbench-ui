import React from "react";
import { Hammer } from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import McpTools from "../components/mcp-tools/McpTools";

const McpToolsPage = () => {
  return (
    <>
      <PageHeader
        icon={<Hammer />}
        title="MCP Tools Configuration"
        description="Makes MCP tools available for agent integration"
      />
      <McpTools />
    </>
  );
};

export default McpToolsPage;
