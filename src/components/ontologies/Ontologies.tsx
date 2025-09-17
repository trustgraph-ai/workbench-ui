import React from "react";
import { Box } from "@chakra-ui/react";
import { OntologiesTable } from "./OntologiesTable";

export const Ontologies: React.FC = () => {
  const handleEditOntology = (ontologyId: string) => {
    // TODO: Navigate to ontology editor in Phase 2
    console.log(`Edit ontology: ${ontologyId}`);
    alert(`Ontology editor will be implemented in Phase 2.\nOntology ID: ${ontologyId}`);
  };

  return (
    <Box p={6}>
      <OntologiesTable onEditOntology={handleEditOntology} />
    </Box>
  );
};
