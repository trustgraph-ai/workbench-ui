import React from "react";

import { ScrollText } from "lucide-react";

import CenterSpinner from "../components/common/CenterSpinner";
import PageHeader from "../components/common/PageHeader";
import FlowClasses from "../components/flow-classes/FlowClasses";

const FlowClassesPage = () => {
  return (
    <>
      <PageHeader
        icon={<ScrollText />}
        title="Flow Classes"
        description="Managing the dataflow definitions"
      />
      <CenterSpinner />
      <FlowClasses />
    </>
  );
};

export default FlowClassesPage;
