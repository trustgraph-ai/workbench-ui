import React, { useState } from "react";
import { Box, Button, HStack } from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { OntologiesTable } from "./OntologiesTable";
import { OntologyEditor } from "./OntologyEditor";

export const Ontologies: React.FC = () => {
  const [selectedOntologyId, setSelectedOntologyId] = useState<string | null>(
    null,
  );

  const handleEditOntology = (ontologyId: string) => {
    setSelectedOntologyId(ontologyId);
  };

  const handleBackToList = () => {
    setSelectedOntologyId(null);
  };

  if (selectedOntologyId) {
    return (
      <OntologyEditor
        ontologyId={selectedOntologyId}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <Box p={6}>
      <OntologiesTable onEditOntology={handleEditOntology} />
    </Box>
  );
};
