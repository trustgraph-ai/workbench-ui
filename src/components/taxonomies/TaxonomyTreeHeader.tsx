import React from "react";
import { HStack, Text, IconButton } from "@chakra-ui/react";
import { Plus } from "lucide-react";

interface TaxonomyTreeHeaderProps {
  conceptCount: number;
  onAddRootConcept: () => void;
}

export const TaxonomyTreeHeader: React.FC<TaxonomyTreeHeaderProps> = ({
  conceptCount,
  onAddRootConcept,
}) => {
  return (
    <HStack justify="space-between">
      <Text fontSize="sm" color="fg.muted">
        {conceptCount} concept(s)
      </Text>
      <IconButton
        aria-label="Add root concept"
        size="sm"
        variant="outline"
        onClick={onAddRootConcept}
      >
        <Plus />
      </IconButton>
    </HStack>
  );
};
