import React from "react";
import { CircleArrowRight } from "lucide-react";

import CenterSpinner from "../components/common/CenterSpinner";
import PageHeader from "../components/common/PageHeader";
import ProcessingTable from "../components/processing/ProcessingTable";

const ProcessingPage = () => {
  return (
    <>
      <PageHeader
        icon={<CircleArrowRight />}
        title="Processing"
        description="Submit documents for processing"
      />
      <ProcessingTable />
      <CenterSpinner />
    </>
  );
};

export default ProcessingPage;
