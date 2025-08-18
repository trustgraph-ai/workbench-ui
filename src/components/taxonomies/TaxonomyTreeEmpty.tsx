import React from "react";
import { Box, Text, IconButton } from "@chakra-ui/react";
import { Plus } from "lucide-react";

interface TaxonomyTreeEmptyProps {
  onAddConcept: () => void;
}

export const TaxonomyTreeEmpty: React.FC<TaxonomyTreeEmptyProps> = ({
  onAddConcept,
}) => {
  return (
    <Box p={4} textAlign="center" color="fg.muted">
      <Text mb={4}>No concepts in this taxonomy yet.</Text>
      <IconButton
        aria-label="Add first concept"
        colorPalette="primary"
        onClick={onAddConcept}
      >
        <Plus />
      </IconButton>
      <Text fontSize="sm" mt={2}>
        Add your first concept
      </Text>
    </Box>
  );
};