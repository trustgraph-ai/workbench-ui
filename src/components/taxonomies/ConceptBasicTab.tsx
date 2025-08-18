import React from "react";
import { VStack } from "@chakra-ui/react";
import TextField from "../common/TextField";
import { ArrayFieldEditor } from "./ArrayFieldEditor";
import { TaxonomyConcept } from "../../state/taxonomies";

interface ConceptBasicTabProps {
  editedConcept: TaxonomyConcept;
  availableConcepts: Array<{ id: string; prefLabel: string }>;
  onUpdateField: (field: keyof TaxonomyConcept, value: any) => void;
  onAddItem: (field: keyof TaxonomyConcept, value: string) => void;
  onRemoveItem: (field: keyof TaxonomyConcept, index: number) => void;
  onUpdateItem: (field: keyof TaxonomyConcept, index: number, value: string) => void;
}

export const ConceptBasicTab: React.FC<ConceptBasicTabProps> = ({
  editedConcept,
  availableConcepts,
  onUpdateField,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}) => {
  return (
    <VStack gap={4} align="stretch">
      <TextField
        label="Preferred Label"
        value={editedConcept.prefLabel}
        onValueChange={(value) => onUpdateField("prefLabel", value)}
        placeholder="Main name for this concept"
        required
      />
      <ArrayFieldEditor
        label="Alternative Labels"
        field="altLabel"
        placeholder="Add alternative label..."
        items={(editedConcept.altLabel as string[]) || []}
        availableConcepts={availableConcepts}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
      />
    </VStack>
  );
};