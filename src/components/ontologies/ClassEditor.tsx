import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Button,
  Field,
  Separator,
  Badge,
} from "@chakra-ui/react";
import SelectField from "../common/SelectField";
import { Hash, Save } from "lucide-react";
import { OWLClass, Ontology } from "../../state/ontologies";

interface ClassEditorProps {
  classId: string;
  owlClass: OWLClass;
  ontology: Ontology;
  onUpdateClass: (classId: string, updatedClass: OWLClass) => void;
}

export const ClassEditor: React.FC<ClassEditorProps> = ({
  classId,
  owlClass,
  ontology,
  onUpdateClass,
}) => {
  const [label, setLabel] = useState("");
  const [comment, setComment] = useState("");
  const [subClassOf, setSubClassOf] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Initialize form with current values
    const currentLabel = owlClass["rdfs:label"]?.[0]?.value || "";
    const currentComment = owlClass["rdfs:comment"] || "";
    const currentSubClassOf = owlClass["rdfs:subClassOf"] || "";

    setLabel(currentLabel);
    setComment(currentComment);
    setSubClassOf(currentSubClassOf);
    setHasChanges(false);
  }, [classId, owlClass]);

  useEffect(() => {
    // Check for changes
    const currentLabel = owlClass["rdfs:label"]?.[0]?.value || "";
    const currentComment = owlClass["rdfs:comment"] || "";
    const currentSubClassOf = owlClass["rdfs:subClassOf"] || "";

    const labelChanged = label !== currentLabel;
    const commentChanged = comment !== currentComment;
    const subClassOfChanged = subClassOf !== currentSubClassOf;

    setHasChanges(labelChanged || commentChanged || subClassOfChanged);
  }, [label, comment, subClassOf, owlClass]);

  const handleSave = () => {
    const updatedClass: OWLClass = {
      ...owlClass,
      "rdfs:label": label.trim() ? [{ value: label.trim(), lang: "en" }] : [],
      "rdfs:comment": comment.trim(),
      "rdfs:subClassOf": subClassOf.trim() || undefined,
    };

    onUpdateClass(classId, updatedClass);
    setHasChanges(false);
  };

  const handleReset = () => {
    const currentLabel = owlClass["rdfs:label"]?.[0]?.value || "";
    const currentComment = owlClass["rdfs:comment"] || "";
    const currentSubClassOf = owlClass["rdfs:subClassOf"] || "";

    setLabel(currentLabel);
    setComment(currentComment);
    setSubClassOf(currentSubClassOf);
    setHasChanges(false);
  };

  return (
    <Box h="100%" display="flex" flexDirection="column">
      {/* Header */}
      <Box p={4} borderBottomWidth="1px">
        <HStack justify="space-between" align="center">
          <HStack>
            <Hash size={20} color="#666" />
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="semibold">
                {owlClass["rdfs:label"]?.[0]?.value || classId}
              </Text>
              <Text fontSize="sm" color="gray.500" fontFamily="mono">
                {owlClass.uri}
              </Text>
            </VStack>
          </HStack>
          {hasChanges && (
            <HStack>
              <Badge colorPalette="orange" variant="subtle">
                Unsaved changes
              </Badge>
              <Button size="sm" variant="ghost" onClick={handleReset}>
                Reset
              </Button>
              <Button size="sm" colorPalette="primary" onClick={handleSave}>
                <Save size={14} style={{ marginRight: "4px" }} />
                Save
              </Button>
            </HStack>
          )}
        </HStack>
      </Box>

      {/* Form Content */}
      <Box flex="1" overflow="auto" p={6}>
        <VStack align="stretch" spacing={6} maxW="600px">
          {/* Basic Information */}
          <VStack align="stretch" spacing={4}>
            <Text fontSize="md" fontWeight="semibold" color="gray.700">
              Basic Information
            </Text>

            <Field.Root required>
              <Field.Label>
                Label
                <Field.RequiredIndicator />
              </Field.Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Human-readable class name"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                The preferred human-readable name for this class
              </Text>
            </Field.Root>

            <Field.Root>
              <Field.Label>Description</Field.Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Brief description of what this class represents..."
                rows={3}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                A brief description explaining the purpose and scope of this class
              </Text>
            </Field.Root>
          </VStack>

          <Separator />

          {/* Technical Information */}
          <VStack align="stretch" spacing={4}>
            <Text fontSize="md" fontWeight="semibold" color="gray.700">
              Technical Details
            </Text>

            <Field.Root>
              <Field.Label>URI</Field.Label>
              <Input
                value={owlClass.uri}
                isReadOnly
                bg="gray.50"
                color="gray.600"
                fontFamily="mono"
                fontSize="sm"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Unique identifier for this class (read-only)
              </Text>
            </Field.Root>

            <Field.Root>
              <Field.Label>Type</Field.Label>
              <Input
                value="owl:Class"
                isReadOnly
                bg="gray.50"
                color="gray.600"
                fontFamily="mono"
                fontSize="sm"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                OWL class type (read-only)
              </Text>
            </Field.Root>

            <Field.Root>
              <Field.Label>Class ID</Field.Label>
              <Input
                value={classId}
                isReadOnly
                bg="gray.50"
                color="gray.600"
                fontFamily="mono"
                fontSize="sm"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Internal identifier used in the ontology structure (read-only)
              </Text>
            </Field.Root>
          </VStack>

          <Separator />

          {/* Relationships */}
          <VStack align="stretch" spacing={4}>
            <Text fontSize="md" fontWeight="semibold" color="gray.700">
              Relationships
            </Text>

            <VStack align="stretch" spacing={1}>
              <SelectField
                label="Subclass Of (rdfs:subClassOf)"
                items={[
                  { value: "", label: "None (top-level class)" },
                  ...Object.entries(ontology.classes)
                    .filter(([id]) => id !== classId) // Don't allow self-reference
                    .map(([id, owlClass]) => ({
                      value: id,
                      label: owlClass["rdfs:label"]?.[0]?.value || id,
                    }))
                ]}
                value={subClassOf}
                onValueChange={setSubClassOf}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Choose a parent class to create a subclass relationship. Leave empty for top-level classes.
              </Text>
            </VStack>

            {/* Future relationships - Coming in Phase 4+ */}
            <Box p={3} bg="gray.50" borderRadius="md">
              <VStack spacing={1}>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Additional Relationships (Coming in Phase 4)
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  • Disjoint classes (owl:disjointWith)<br />
                  • Equivalent classes (owl:equivalentClass)
                </Text>
              </VStack>
            </Box>
          </VStack>

          <Separator />

          {/* Properties - Placeholder for Phase 3+ */}
          <VStack align="stretch" spacing={4}>
            <Text fontSize="md" fontWeight="semibold" color="gray.700">
              Properties
            </Text>

            <Box p={4} bg="gray.50" borderRadius="md">
              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Properties with this class as domain will be shown here in Phase 3
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  • Object properties linking to other classes<br />
                  • Datatype properties with literal values<br />
                  • Property constraints and cardinality
                </Text>
              </VStack>
            </Box>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
};