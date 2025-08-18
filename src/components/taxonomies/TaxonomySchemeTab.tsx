import React from "react";
import { VStack } from "@chakra-ui/react";
import TextField from "../common/TextField";
import { Taxonomy } from "../../state/taxonomies";

interface TaxonomySchemeTabProps {
  taxonomy: Taxonomy;
  onSchemeChange: (field: keyof Taxonomy["scheme"], value: string) => void;
}

export const TaxonomySchemeTab: React.FC<TaxonomySchemeTabProps> = ({
  taxonomy,
  onSchemeChange,
}) => {
  return (
    <VStack gap={4} align="stretch">
      <TextField
        label="Scheme URI"
        value={taxonomy.scheme.uri}
        onValueChange={(value) => onSchemeChange("uri", value)}
        placeholder="Will be auto-generated if empty"
      />

      <TextField
        label="Scheme Label"
        value={taxonomy.scheme.prefLabel}
        onValueChange={(value) => onSchemeChange("prefLabel", value)}
        placeholder="Will use taxonomy name if empty"
      />
    </VStack>
  );
};