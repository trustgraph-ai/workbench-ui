import React from "react";
import { Workflow } from "lucide-react";

import CenterSpinner from "../components/common/CenterSpinner";
import PageHeader from "../components/common/PageHeader";
import Flows from "../components/flows/Flows";

const FlowsPage = () => {
  return (
    <>
      <PageHeader
        icon={<Workflow />}
        title="Processing Flows"
        description="Managing the data flows in the system"
      />
      <Flows />
      <CenterSpinner />
    </>
  );
};

export default FlowsPage;
