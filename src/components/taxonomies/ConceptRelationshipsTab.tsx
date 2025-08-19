import React from "react";
import { VStack } from "@chakra-ui/react";
import SelectField from "../common/SelectField";
import { ArrayFieldEditor } from "./ArrayFieldEditor";
import { TaxonomyConcept } from "../../state/taxonomies";

interface ConceptRelationshipsTabProps {
  editedConcept: TaxonomyConcept;
  availableConcepts: Array<{ id: string; prefLabel: string }>;
  onUpdateField: (field: keyof TaxonomyConcept, value: any) => void;
  onAddItem: (field: keyof TaxonomyConcept, value: string) => void;
  onRemoveItem: (field: keyof TaxonomyConcept, index: number) => void;
  onUpdateItem: (
    field: keyof TaxonomyConcept,
    index: number,
    value: string,
  ) => void;
}

export const ConceptRelationshipsTab: React.FC<
  ConceptRelationshipsTabProps
> = ({
  editedConcept,
  availableConcepts,
  onUpdateField,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}) => {
  return (
    <VStack gap={4} align="stretch">
      <SelectField
        label="Broader Concept"
        items={[
          {
            value: "",
            label: "No parent concept",
            description: "No parent concept",
          },
          ...availableConcepts.map((c) => ({
            value: c.id,
            label: c.prefLabel,
            description: c.prefLabel,
          })),
        ]}
        value={editedConcept.broader || ""}
        onValueChange={(value) =>
          onUpdateField("broader", value === "" ? null : value)
        }
      />

      <ArrayFieldEditor
        label="Narrower Concepts"
        field="narrower"
        placeholder=""
        isConceptSelect={true}
        items={(editedConcept.narrower as string[]) || []}
        availableConcepts={availableConcepts}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
      />

      <ArrayFieldEditor
        label="Related Concepts"
        field="related"
        placeholder=""
        isConceptSelect={true}
        items={(editedConcept.related as string[]) || []}
        availableConcepts={availableConcepts}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
      />
    </VStack>
  );
};
