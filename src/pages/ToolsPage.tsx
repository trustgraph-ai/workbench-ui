import React from "react";
import { Hammer } from "lucide-react";

import CenterSpinner from "../components/common/CenterSpinner";
import PageHeader from "../components/common/PageHeader";
import ToolTable from '../components/agents/ToolTable';

const ToolsPage = () => {
  return (
    <>
      <PageHeader
        icon={<Hammer />}
        title="Agent Tools Configuration"
        description="Agent tools equip the agent framework to work with your data"
      />
      <ToolTable />
      <CenterSpinner />
    </>
  );
};

export default ToolsPage;

