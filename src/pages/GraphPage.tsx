import { Rotate3d } from "lucide-react";

import CenterSpinner from "../components/common/CenterSpinner";
import PageHeader from "../components/common/PageHeader";
import Graph from "../components/graph/Graph";

const GraphView = () => {
  return (
    <>
      <PageHeader
        icon={<Rotate3d />}
        title="Visualize"
        description="Projects the knowledge graph into 3 dimensions"
      />
      <CenterSpinner />
      <Graph />
    </>
  );
};

export default GraphView;
