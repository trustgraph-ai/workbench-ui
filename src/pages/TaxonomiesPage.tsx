import React from "react";
import { Tags } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import { Taxonomies } from "../components/taxonomies/Taxonomies";

const TaxonomiesPage: React.FC = () => {
  return (
    <>
      <PageHeader
        icon={<Tags />}
        title="Taxonomy Management"
        description="Create and manage taxonomies for organizing knowledge"
      />
      <Taxonomies />
    </>
  );
};

export default TaxonomiesPage;