import { Waypoints } from "lucide-react";

import CenterSpinner from "../components/common/CenterSpinner";
import PageHeader from "../components/common/PageHeader";
import EntityDetail from "../components/entity/EntityDetail";

const EntityPage = () => {
  return (
    <>
      <PageHeader
        icon={<Waypoints />}
        title="Explore"
        description="Exploring properties and relationships of the knowledge graph"
      />

      <CenterSpinner />

      <EntityDetail />
    </>
  );
};

export default EntityPage;
