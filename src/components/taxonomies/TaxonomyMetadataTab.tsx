import React from "react";
import { VStack } from "@chakra-ui/react";
import TextField from "../common/TextField";
import TextAreaField from "../common/TextAreaField";
import { Taxonomy } from "../../state/taxonomies";

interface TaxonomyMetadataTabProps {
  taxonomyId: string;
  taxonomy: Taxonomy;
  mode: "create" | "edit";
  onTaxonomyIdChange: (value: string) => void;
  onMetadataChange: (
    field: keyof Taxonomy["metadata"],
    value: string,
  ) => void;
}

export const TaxonomyMetadataTab: React.FC<TaxonomyMetadataTabProps> = ({
  taxonomyId,
  taxonomy,
  mode,
  onTaxonomyIdChange,
  onMetadataChange,
}) => {
  return (
    <VStack gap={4} align="stretch">
      <TextField
        label="Taxonomy ID"
        value={taxonomyId}
        onValueChange={onTaxonomyIdChange}
        placeholder="e.g., risk-categories"
        required
        disabled={mode === "edit"}
      />

      <TextField
        label="Name"
        value={taxonomy.metadata.name}
        onValueChange={(value) => onMetadataChange("name", value)}
        placeholder="e.g., Risk Categories"
        required
      />

      <TextAreaField
        label="Description"
        value={taxonomy.metadata.description}
        onValueChange={(value) => onMetadataChange("description", value)}
        placeholder="Describe the purpose of this taxonomy"
      />

      <TextField
        label="Version"
        value={taxonomy.metadata.version}
        onValueChange={(value) => onMetadataChange("version", value)}
      />

      <TextField
        label="Namespace"
        value={taxonomy.metadata.namespace}
        onValueChange={(value) => onMetadataChange("namespace", value)}
        placeholder="http://example.org/taxonomies/"
      />
    </VStack>
  );
};
