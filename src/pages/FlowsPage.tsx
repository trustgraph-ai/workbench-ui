import React from "react";
import { Workflow } from "lucide-react";

import CenterSpinner from "../components/common/CenterSpinner";
import PageHeader from "../components/common/PageHeader";
import FlowTable from "../components/flows/FlowTable";

const FlowsPage = () => {
  return (
    <>
      <PageHeader
        icon={<Workflow />}
        title="Processing Flows"
        description="Managing the data flows in the system"
      />
      <FlowTable />
      <CenterSpinner />
    </>
  );
};

export default FlowsPage;
