import React from "react";
import { BrainCircuit } from "lucide-react";

import CenterSpinner from "../components/common/CenterSpinner";
import PageHeader from "../components/common/PageHeader";
import KnowledgeCores from "../components/kc/KnowledgeCores";

const KnowledgeCoresPage = () => {
  return (
    <>
      <PageHeader
        icon={<BrainCircuit />}
        title="Knowledge Cores"
        description="Knowledge cores are modules which encapsulate a set of domain knowledge"
      />
      <KnowledgeCores />
      <CenterSpinner />
    </>
  );
};

export default KnowledgeCoresPage;
