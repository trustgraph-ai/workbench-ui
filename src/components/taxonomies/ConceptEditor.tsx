import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Field,
  Input,
  Button,
  IconButton,
  Text,
  Tabs,
  Badge,
  Select,
  Switch,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { Plus, X, Save } from "lucide-react";
import { useNotification } from "../../state/notify";
import { TaxonomyConcept, Taxonomy } from "../../state/taxonomies";
import TextField from "../common/TextField";
import TextAreaField from "../common/TextAreaField";

// console.log("DEBUG - Plus:", Plus, typeof Plus);
// console.log("DEBUG - X:", X, typeof X);
// console.log("DEBUG - Save:", Save, typeof Save);
// console.log("DEBUG - TextField:", TextField, typeof TextField);
// console.log("DEBUG - TextAreaField:", TextAreaField, typeof TextAreaField);

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
  // console.log("ConceptEditor render - concept:", concept, "taxonomy:", taxonomy);
  
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

  const ArrayFieldEditor: React.FC<{
    label: string;
    field: keyof TaxonomyConcept;
    placeholder: string;
    isConceptSelect?: boolean;
  }> = ({ label, field, placeholder, isConceptSelect = false }) => {
    // console.log("ArrayFieldEditor render - isConceptSelect:", isConceptSelect, "field:", field);
    
    const [newItem, setNewItem] = useState("");
    const items = (editedConcept[field] as string[]) || [];
    
    // console.log("ArrayFieldEditor - items:", items, "availableConcepts:", availableConcepts);

    const handleAdd = () => {
      if (newItem.trim() && !items.includes(newItem.trim())) {
        addToArrayField(field, newItem.trim());
        setNewItem("");
      }
    };

    return (
      <Field.Root>
        <Field.Label>{label}</Field.Label>
        <VStack align="stretch" gap={2}>
          {items.map((item, index) => (
            <HStack key={index}>
              {isConceptSelect ? (
                <Text>SELECT DISABLED FOR DEBUG: {item}</Text>
              ) : (
                <Input
                  value={item}
                  onChange={(e) => updateArrayItem(field, index, e.target.value)}
                  flex="1"
                />
              )}
              <IconButton
                aria-label="Remove"
                size="sm"
                variant="ghost"
                colorPalette="red"
                onClick={() => removeFromArrayField(field, index)}
              >
                ❌
              </IconButton>
            </HStack>
          ))}
          <HStack>
            {isConceptSelect ? (
              <Text>ADD SELECT DISABLED FOR DEBUG</Text>
            ) : (
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={placeholder}
                onKeyPress={(e) => e.key === "Enter" && handleAdd()}
              />
            )}
            <IconButton
              aria-label="Add"
              size="sm"
              variant="outline"
              colorPalette="primary"
              onClick={handleAdd}
              disabled={!newItem.trim() || (isConceptSelect ? items.includes(newItem) : false)}
            >
              ➕
            </IconButton>
          </HStack>
        </VStack>
      </Field.Root>
    );
  };

  return (
    <VStack gap={4} align="stretch" h="100%">
      <HStack justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="bold">
          {concept ? "Edit Concept" : "New Concept"}
        </Text>
        <HStack>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button colorPalette="primary" onClick={handleSave}>
            💾 Save
          </Button>
        </HStack>
      </HStack>

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
                label="Test Field"
                field="altLabel"
                placeholder="test"
              />
              <Text>Basic tab content...</Text>
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
            />
          </Tabs.Content>

          <Tabs.Content value="relationships">
            <VStack gap={4} align="stretch">
              <Field.Root>
                <Field.Label>Broader Concept</Field.Label>
                <Select
                  value={editedConcept.broader || ""}
                  onChange={(e) => updateField("broader", e.target.value || null)}
                >
                  <option value="">No parent concept</option>
                  {availableConcepts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.prefLabel}
                    </option>
                  ))}
                </Select>
              </Field.Root>

              <Text>DEBUG: availableConcepts length: {availableConcepts.length}</Text>
              <ArrayFieldEditor
                label="Narrower Concepts"
                field="narrower"
                placeholder=""
                isConceptSelect={true}
              />
              
              <Text>Narrower concepts rendered successfully</Text>
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="metadata">
            <VStack gap={4} align="stretch">
              <Text>Metadata tab content...</Text>
            </VStack>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </VStack>
  );
};