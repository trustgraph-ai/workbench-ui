import React from "react";

import { ScrollText } from "lucide-react";

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
      <FlowClasses />
    </>
  );
};

export default FlowClassesPage;
