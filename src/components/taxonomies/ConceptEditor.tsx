import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Tabs,
  Badge,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { Save } from "lucide-react";
import { useNotification } from "../../state/notify";
import { TaxonomyConcept, Taxonomy } from "../../state/taxonomies";
import TextField from "../common/TextField";
import TextAreaField from "../common/TextAreaField";
import SelectField from "../common/SelectField";
import { ArrayFieldEditor } from "./ArrayFieldEditor";
import { ConceptEditorHeader } from "./ConceptEditorHeader";
import { ConceptMetadataTab } from "./ConceptMetadataTab";


interface ConceptEditorProps {
  concept?: TaxonomyConcept;
  taxonomy: Taxonomy;
  onSave: (concept: TaxonomyConcept) => void;
  onCancel: () => void;
}

export const ConceptEditor: React.FC<ConceptEditorProps> = ({
  concept,
  taxonomy,
  onSave,
  onCancel,
}) => {
  
  const notify = useNotification();
  const [editedConcept, setEditedConcept] = useState<TaxonomyConcept>(
    concept || {
      id: `concept-${Date.now()}`,
      prefLabel: "",
      narrower: [],
      related: [],
    }
  );

  useEffect(() => {
    if (concept) {
      setEditedConcept(concept);
    }
  }, [concept]);

  const handleSave = () => {
    if (!editedConcept.prefLabel.trim()) {
      notify.error("Preferred label is required");
      return;
    }

    onSave(editedConcept);
  };

  const updateField = (field: keyof TaxonomyConcept, value: any) => {
    setEditedConcept(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addToArrayField = (field: keyof TaxonomyConcept, value: string) => {
    const currentArray = (editedConcept[field] as string[]) || [];
    updateField(field, [...currentArray, value]);
  };

  const removeFromArrayField = (field: keyof TaxonomyConcept, index: number) => {
    const currentArray = (editedConcept[field] as string[]) || [];
    updateField(field, currentArray.filter((_, i) => i !== index));
  };

  const updateArrayItem = (field: keyof TaxonomyConcept, index: number, value: string) => {
    const currentArray = (editedConcept[field] as string[]) || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    updateField(field, newArray);
  };

  const availableConcepts = Object.values(taxonomy.concepts)
    .filter(c => c.id !== editedConcept.id)
    .sort((a, b) => a.prefLabel.localeCompare(b.prefLabel));


  return (
    <VStack gap={4} align="stretch" h="100%">
      <ConceptEditorHeader
        concept={concept}
        onSave={handleSave}
        onCancel={onCancel}
      />

      <Box flex="1" overflowY="auto">
        <Tabs.Root defaultValue="basic">
          <Tabs.List>
            <Tabs.Trigger value="basic">Basic Info</Tabs.Trigger>
            <Tabs.Trigger value="definition">Definition</Tabs.Trigger>
            <Tabs.Trigger value="examples">Examples</Tabs.Trigger>
            <Tabs.Trigger value="relationships">Relationships</Tabs.Trigger>
            <Tabs.Trigger value="metadata">Metadata</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="basic">
            <VStack gap={4} align="stretch">
              <TextField
                label="Preferred Label"
                value={editedConcept.prefLabel}
                onValueChange={(value) => updateField("prefLabel", value)}
                placeholder="Main name for this concept"
                required
              />
              <ArrayFieldEditor
                label="Alternative Labels"
                field="altLabel"
                placeholder="Add alternative label..."
                items={(editedConcept.altLabel as string[]) || []}
                availableConcepts={availableConcepts}
                onAddItem={addToArrayField}
                onRemoveItem={removeFromArrayField}
                onUpdateItem={updateArrayItem}
              />
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="definition">
            <VStack gap={4} align="stretch">
              <TextAreaField
                label="Definition"
                value={editedConcept.definition || ""}
                onValueChange={(value) => updateField("definition", value)}
                placeholder="Formal definition of this concept..."
              />

              <TextAreaField
                label="Scope Note"
                value={editedConcept.scopeNote || ""}
                onValueChange={(value) => updateField("scopeNote", value)}
                placeholder="Additional context about the scope and usage..."
              />
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="examples">
            <ArrayFieldEditor
              label="Examples"
              field="example"
              placeholder="Add example..."
              items={(editedConcept.example as string[]) || []}
              availableConcepts={availableConcepts}
              onAddItem={addToArrayField}
              onRemoveItem={removeFromArrayField}
              onUpdateItem={updateArrayItem}
            />
          </Tabs.Content>

          <Tabs.Content value="relationships">
            <VStack gap={4} align="stretch">
              <SelectField
                label="Broader Concept"
                items={[
                  {value: '', label: 'No parent concept'},
                  ...availableConcepts.map(c => ({
                    value: c.id,
                    label: c.prefLabel
                  }))
                ]}
                value={editedConcept.broader || ''}
                onValueChange={(value) => updateField("broader", value || null)}
              />

              <ArrayFieldEditor
                label="Narrower Concepts"
                field="narrower"
                placeholder=""
                isConceptSelect={true}
                items={(editedConcept.narrower as string[]) || []}
                availableConcepts={availableConcepts}
                onAddItem={addToArrayField}
                onRemoveItem={removeFromArrayField}
                onUpdateItem={updateArrayItem}
              />

              <ArrayFieldEditor
                label="Related Concepts"
                field="related"
                placeholder=""
                isConceptSelect={true}
                items={(editedConcept.related as string[]) || []}
                availableConcepts={availableConcepts}
                onAddItem={addToArrayField}
                onRemoveItem={removeFromArrayField}
                onUpdateItem={updateArrayItem}
              />
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="metadata">
            <VStack gap={4} align="stretch">
              <Field.Root>
                <Field.Label>Concept ID</Field.Label>
                <Input
                  value={editedConcept.id}
                  onChange={(e) => updateField("id", e.target.value)}
                  disabled={!!concept} // Don't allow editing existing IDs
                />
                {concept && (
                  <Text fontSize="sm" color="fg.muted">
                    ID cannot be changed for existing concepts
                  </Text>
                )}
              </Field.Root>

              <Box p={4} bg="bg.muted" borderRadius="md">
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  Concept Summary
                </Text>
                <Wrap>
                  <WrapItem>
                    <Badge colorPalette={editedConcept.prefLabel ? "primary" : "red"}>
                      {editedConcept.prefLabel ? "Has Label" : "No Label"}
                    </Badge>
                  </WrapItem>
                  <WrapItem>
                    <Badge colorPalette={editedConcept.definition ? "primary" : "yellow"}>
                      {editedConcept.definition ? "Defined" : "No Definition"}
                    </Badge>
                  </WrapItem>
                  <WrapItem>
                    <Badge colorPalette={editedConcept.broader ? "blue" : "gray"}>
                      {editedConcept.broader ? "Has Parent" : "Root Level"}
                    </Badge>
                  </WrapItem>
                  <WrapItem>
                    <Badge>
                      {(editedConcept.narrower || []).length} Children
                    </Badge>
                  </WrapItem>
                  <WrapItem>
                    <Badge>
                      {(editedConcept.related || []).length} Related
                    </Badge>
                  </WrapItem>
                </Wrap>
              </Box>
            </VStack>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </VStack>
  );
};