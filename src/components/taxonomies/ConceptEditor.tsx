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
import { FiPlus, FiX, FiSave } from "react-icons/fi";
import { useNotification } from "../../state/notify";
import { TaxonomyConcept, Taxonomy } from "../../state/taxonomies";
import TextField from "../common/TextField";
import TextAreaField from "../common/TextAreaField";

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

  const ArrayFieldEditor: React.FC<{
    label: string;
    field: keyof TaxonomyConcept;
    placeholder: string;
    isConceptSelect?: boolean;
  }> = ({ label, field, placeholder, isConceptSelect = false }) => {
    const [newItem, setNewItem] = useState("");
    const items = (editedConcept[field] as string[]) || [];

    const handleAdd = () => {
      if (newItem.trim() && !items.includes(newItem.trim())) {
        addToArrayField(field, newItem.trim());
        setNewItem("");
      }
    };

    return (
      <Field.Root>
        <Field.Label>{label}</Field.Label>
        <VStack align="stretch" spacing={2}>
          {items.map((item, index) => (
            <HStack key={index}>
              {isConceptSelect ? (
                <Select
                  value={item}
                  onChange={(e) => updateArrayItem(field, index, e.target.value)}
                  flex="1"
                >
                  <option value="">Select concept...</option>
                  {availableConcepts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.prefLabel}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  value={item}
                  onChange={(e) => updateArrayItem(field, index, e.target.value)}
                  flex="1"
                />
              )}
              <IconButton
                aria-label="Remove"
                icon={<FiX />}
                size="sm"
                variant="ghost"
                colorPalette="red"
                onClick={() => removeFromArrayField(field, index)}
              />
            </HStack>
          ))}
          <HStack>
            {isConceptSelect ? (
              <Select
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Select concept to add..."
              >
                {availableConcepts
                  .filter(c => !items.includes(c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.prefLabel}
                    </option>
                  ))}
              </Select>
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
              icon={<FiPlus />}
              size="sm"
              variant="outline"
              colorPalette="primary"
              onClick={handleAdd}
              disabled={!newItem.trim() || (isConceptSelect ? items.includes(newItem) : false)}
            />
          </HStack>
        </VStack>
      </Field.Root>
    );
  };

  if (!concept && Object.keys(taxonomy.concepts).length === 0) {
    return (
      <Box p={6} textAlign="center" color="gray.500">
        <Text>Select a concept from the tree to edit, or create a new one.</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" h="100%">
      <HStack justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="bold">
          {concept ? "Edit Concept" : "New Concept"}
        </Text>
        <HStack>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button leftIcon={<FiSave />} colorPalette="primary" onClick={handleSave}>
            Save
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
              <VStack spacing={4} align="stretch">
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
                  placeholder="Add alternative name..."
                />

                <TextField
                  label="Notation"
                  value={editedConcept.notation || ""}
                  onValueChange={(value) => updateField("notation", value)}
                  placeholder="e.g., 1.1 or A-01"
                />

                <Field.Root>
                  <HStack>
                    <Switch
                      isChecked={editedConcept.topConcept || false}
                      onChange={(e) => updateField("topConcept", e.target.checked)}
                    />
                    <Field.Label mb={0}>Top Concept</Field.Label>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Mark as a root-level concept in the taxonomy
                  </Text>
                </Field.Root>
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="definition">
              <VStack spacing={4} align="stretch">
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
              <VStack spacing={4} align="stretch">
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

                <ArrayFieldEditor
                  label="Narrower Concepts"
                  field="narrower"
                  placeholder=""
                  isConceptSelect={true}
                />

                <ArrayFieldEditor
                  label="Related Concepts"
                  field="related"
                  placeholder=""
                  isConceptSelect={true}
                />
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="metadata">
              <VStack spacing={4} align="stretch">
                <Field.Root>
                  <Field.Label>Concept ID</Field.Label>
                  <Input
                    value={editedConcept.id}
                    onChange={(e) => updateField("id", e.target.value)}
                    disabled={!!concept} // Don't allow editing existing IDs
                  />
                  {concept && (
                    <Text fontSize="sm" color="gray.600">
                      ID cannot be changed for existing concepts
                    </Text>
                  )}
                </Field.Root>

                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Concept Summary
                  </Text>
                  <Wrap>
                    <WrapItem>
                      <Badge colorPalette={editedConcept.prefLabel ? "green" : "red"}>
                        {editedConcept.prefLabel ? "Has Label" : "No Label"}
                      </Badge>
                    </WrapItem>
                    <WrapItem>
                      <Badge colorPalette={editedConcept.definition ? "green" : "yellow"}>
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