import React from "react";
import { Box, Text, VStack, HStack, Button, Tabs, Field, Input } from "@chakra-ui/react";
import { TaxonomyConcept, Taxonomy } from "../../state/taxonomies";
import SelectField from "../common/SelectField";

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
          <Button colorPalette="primary" onClick={() => {}}>
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
          </Tabs.List>

          <Tabs.Content value="basic">
            <VStack gap={4} align="stretch">
              <Field.Root>
                <Field.Label>Preferred Label</Field.Label>
                <Input
                  value={concept ? concept.prefLabel : ""}
                  placeholder="Main name for this concept"
                />
              </Field.Root>
              <Text>Testing Field.Root and Input components</Text>
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="definition">
            <VStack gap={4} align="stretch">
              <Text>Testing simple Select component import...</Text>
              <Text>Select component type: {typeof Select}</Text>
              <Text>Select component: {Select ? "exists" : "undefined"}</Text>
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="examples">
            <VStack gap={4} align="stretch">
              <Text>Testing SelectField component...</Text>
              <SelectField
                label="Test SelectField"
                items={[
                  {value: '1', label: 'Option 1'},
                  {value: '2', label: 'Option 2'},
                  {value: '3', label: 'Option 3'}
                ]}
                value=""
                onValueChange={() => {}}
              />
            </VStack>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </VStack>
  );
};