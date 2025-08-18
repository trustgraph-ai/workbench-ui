import React from "react";
import { Box } from "@chakra-ui/react";
import { Taxonomy } from "../../state/taxonomies";

interface TaxonomyJsonPreviewTabProps {
  taxonomy: Taxonomy;
}

export const TaxonomyJsonPreviewTab: React.FC<TaxonomyJsonPreviewTabProps> = ({
  taxonomy,
}) => {
  return (
    <Box
      as="pre"
      p={4}
      bg="bg.muted"
      borderRadius="md"
      overflow="auto"
      maxH="400px"
      fontSize="sm"
    >
      {JSON.stringify(taxonomy, null, 2)}
    </Box>
  );
};