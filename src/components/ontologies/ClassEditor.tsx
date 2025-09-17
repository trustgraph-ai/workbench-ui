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
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Initialize form with current values
    const currentLabel = owlClass["rdfs:label"]?.[0]?.value || "";
    const currentComment = owlClass["rdfs:comment"] || "";

    setLabel(currentLabel);
    setComment(currentComment);
    setHasChanges(false);
  }, [classId, owlClass]);

  useEffect(() => {
    // Check for changes
    const currentLabel = owlClass["rdfs:label"]?.[0]?.value || "";
    const currentComment = owlClass["rdfs:comment"] || "";

    const labelChanged = label !== currentLabel;
    const commentChanged = comment !== currentComment;

    setHasChanges(labelChanged || commentChanged);
  }, [label, comment, owlClass]);

  const handleSave = () => {
    const updatedClass: OWLClass = {
      ...owlClass,
      "rdfs:label": label.trim() ? [{ value: label.trim(), lang: "en" }] : [],
      "rdfs:comment": comment.trim(),
    };

    onUpdateClass(classId, updatedClass);
    setHasChanges(false);
  };

  const handleReset = () => {
    const currentLabel = owlClass["rdfs:label"]?.[0]?.value || "";
    const currentComment = owlClass["rdfs:comment"] || "";

    setLabel(currentLabel);
    setComment(currentComment);
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

            <Field label="Label" required>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Human-readable class name"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                The preferred human-readable name for this class
              </Text>
            </Field>

            <Field label="Description">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Brief description of what this class represents..."
                rows={3}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                A brief description explaining the purpose and scope of this class
              </Text>
            </Field>
          </VStack>

          <Separator />

          {/* Technical Information */}
          <VStack align="stretch" spacing={4}>
            <Text fontSize="md" fontWeight="semibold" color="gray.700">
              Technical Details
            </Text>

            <Field label="URI">
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
            </Field>

            <Field label="Type">
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
            </Field>

            <Field label="Class ID">
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
            </Field>
          </VStack>

          <Separator />

          {/* Relationships - Placeholder for Phase 3+ */}
          <VStack align="stretch" spacing={4}>
            <Text fontSize="md" fontWeight="semibold" color="gray.700">
              Relationships
            </Text>

            <Box p={4} bg="gray.50" borderRadius="md">
              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Class relationships will be available in Phase 3
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  • Subclass relationships (rdfs:subClassOf)<br />
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