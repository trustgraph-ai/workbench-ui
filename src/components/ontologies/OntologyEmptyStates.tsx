import React from "react";
import { Box, VStack, Text } from "@chakra-ui/react";
import SelectField from "../common/SelectField";
import { Taxonomy } from "../../state/taxonomies";

interface EmptyStatesProps {
  type: "no-taxonomies" | "no-taxonomy-selected" | "no-concept-selected";
  taxonomies?: Array<[string, Taxonomy]>;
  onTaxonomyChange?: (taxonomyId: string) => void;
}

export const TaxonomyEmptyStates: React.FC<EmptyStatesProps> = ({
  type,
  taxonomies,
  onTaxonomyChange,
}) => {
  if (type === "no-taxonomies") {
    return (
      <Box p={8} textAlign="center" color="fg.muted">
        <Text mb={4}>
          No taxonomies available. Create one to get started.
        </Text>
      </Box>
    );
  }

  if (type === "no-taxonomy-selected") {
    return (
      <VStack gap={4} p={8}>
        <Text color="fg.muted">Select a taxonomy to start editing:</Text>
        <Box maxW="400px">
          <SelectField
            label="Select Taxonomy"
            items={(taxonomies || []).map(([id, taxonomy]) => ({
              value: id,
              label: taxonomy.metadata.name,
              description: taxonomy.metadata.name,
            }))}
            value={[]}
            onValueChange={(values) => {
              if (values.length > 0 && onTaxonomyChange) {
                onTaxonomyChange(values[0]);
              }
            }}
          />
        </Box>
      </VStack>
    );
  }

  if (type === "no-concept-selected") {
    return (
      <Box p={8} textAlign="center" color="fg.muted">
        <Text>
          Select a concept from the tree to view details, or create a new
          concept.
        </Text>
      </Box>
    );
  }

  return null;
};
