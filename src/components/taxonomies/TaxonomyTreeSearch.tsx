import React from "react";
import { HStack, Input } from "@chakra-ui/react";

interface TaxonomyTreeSearchProps {
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
}

export const TaxonomyTreeSearch: React.FC<TaxonomyTreeSearchProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <HStack>
      <Input
        placeholder="🔍 Search concepts..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </HStack>
  );
};
