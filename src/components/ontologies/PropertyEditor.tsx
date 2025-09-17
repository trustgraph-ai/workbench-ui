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
import XSDDatatypeSelector from "./XSDDatatypeSelector";
import { Link, Type, Save, Trash2 } from "lucide-react";
import { OWLObjectProperty, OWLDatatypeProperty, Ontology } from "../../state/ontologies";

interface PropertyEditorProps {
  propertyId: string;
  property: OWLObjectProperty | OWLDatatypeProperty;
  propertyType: "object" | "datatype";
  ontology: Ontology;
  onUpdateProperty: (propertyId: string, updatedProperty: OWLObjectProperty | OWLDatatypeProperty, type: "object" | "datatype") => void;
  onDeleteProperty: (propertyId: string, type: "object" | "datatype") => void;
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  propertyId,
  property,
  propertyType,
  ontology,
  onUpdateProperty,
  onDeleteProperty,
}) => {
  const [label, setLabel] = useState("");
  const [comment, setComment] = useState("");
  const [domain, setDomain] = useState("");
  const [range, setRange] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Initialize form with current values
    const currentLabel = property["rdfs:label"]?.[0]?.value || "";
    const currentComment = property["rdfs:comment"] || "";
    const currentDomain = property["rdfs:domain"] || "";
    const currentRange = property["rdfs:range"] || "";

    setLabel(currentLabel);
    setComment(currentComment);
    setDomain(currentDomain);
    setRange(currentRange);
    setHasChanges(false);
  }, [propertyId, property]);

  useEffect(() => {
    // Check for changes
    const currentLabel = property["rdfs:label"]?.[0]?.value || "";
    const currentComment = property["rdfs:comment"] || "";
    const currentDomain = property["rdfs:domain"] || "";
    const currentRange = property["rdfs:range"] || "";

    const labelChanged = label !== currentLabel;
    const commentChanged = comment !== currentComment;
    const domainChanged = domain !== currentDomain;
    const rangeChanged = range !== currentRange;

    setHasChanges(labelChanged || commentChanged || domainChanged || rangeChanged);
  }, [label, comment, domain, range, property]);

  const handleSave = () => {
    const updatedProperty = {
      ...property,
      "rdfs:label": label.trim() ? [{ value: label.trim(), lang: "en" }] : [],
      "rdfs:comment": comment.trim(),
      "rdfs:domain": domain.trim() || undefined,
      "rdfs:range": range.trim() || undefined,
    };

    onUpdateProperty(propertyId, updatedProperty, propertyType);
    setHasChanges(false);
  };

  const handleReset = () => {
    const currentLabel = property["rdfs:label"]?.[0]?.value || "";
    const currentComment = property["rdfs:comment"] || "";
    const currentDomain = property["rdfs:domain"] || "";
    const currentRange = property["rdfs:range"] || "";

    setLabel(currentLabel);
    setComment(currentComment);
    setDomain(currentDomain);
    setRange(currentRange);
    setHasChanges(false);
  };

  // Get available classes for domain/range selection
  const classOptions = [
    { value: "", label: "None" },
    ...Object.entries(ontology.classes).map(([id, owlClass]) => ({
      value: id,
      label: owlClass["rdfs:label"]?.[0]?.value || id,
    }))
  ];


  return (
    <Box h="100%" display="flex" flexDirection="column">
      {/* Header */}
      <Box p={4} borderBottomWidth="1px">
        <HStack justify="space-between" align="center">
          <HStack>
            {propertyType === "object" ? (
              <Link size={20} color="#666" />
            ) : (
              <Type size={20} color="#666" />
            )}
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="semibold">
                {property["rdfs:label"]?.[0]?.value || propertyId}
              </Text>
              <Text fontSize="sm" color="gray.500" fontFamily="mono">
                {property.uri}
              </Text>
            </VStack>
          </HStack>
          <HStack>
            {hasChanges && (
              <>
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
              </>
            )}
            <Button
              size="sm"
              colorPalette="red"
              variant="ghost"
              onClick={() => onDeleteProperty(propertyId, propertyType)}
              ml={hasChanges ? 2 : 0}
            >
              <Trash2 size={14} style={{ marginRight: "4px" }} />
              Delete
            </Button>
          </HStack>
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
                placeholder="Human-readable property name"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                The preferred human-readable name for this property
              </Text>
            </Field.Root>

            <Field.Root>
              <Field.Label>Description</Field.Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Brief description of what this property represents..."
                rows={3}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                A brief description explaining the purpose and scope of this property
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
                value={property.uri}
                readOnly
                bg="gray.50"
                color="gray.600"
                fontFamily="mono"
                fontSize="sm"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Unique identifier for this property (read-only)
              </Text>
            </Field.Root>

            <Field.Root>
              <Field.Label>Type</Field.Label>
              <Input
                value={property.type}
                readOnly
                bg="gray.50"
                color="gray.600"
                fontFamily="mono"
                fontSize="sm"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                OWL property type (read-only)
              </Text>
            </Field.Root>

            <Field.Root>
              <Field.Label>Property ID</Field.Label>
              <Input
                value={propertyId}
                readOnly
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

          {/* Domain and Range */}
          <VStack align="stretch" spacing={4}>
            <Text fontSize="md" fontWeight="semibold" color="gray.700">
              Domain and Range
            </Text>

            <VStack align="stretch" spacing={1}>
              <SelectField
                label="Domain (rdfs:domain)"
                items={classOptions}
                value={domain}
                onValueChange={setDomain}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                The class that can have this property. Leave empty if any class can have this property.
              </Text>
            </VStack>

            <VStack align="stretch" spacing={1}>
              {propertyType === "object" ? (
                <SelectField
                  label="Range (rdfs:range)"
                  items={classOptions}
                  value={range}
                  onValueChange={setRange}
                />
              ) : (
                <XSDDatatypeSelector
                  label="Range (rdfs:range)"
                  value={range}
                  onValueChange={setRange}
                />
              )}
              <Text fontSize="xs" color="gray.500" mt={1}>
                {propertyType === "object"
                  ? "The class that this property points to."
                  : "The datatype of values for this property."
                }
              </Text>
            </VStack>
          </VStack>

          <Separator />

          {/* Future features - Placeholder */}
          <VStack align="stretch" spacing={4}>
            <Text fontSize="md" fontWeight="semibold" color="gray.700">
              Advanced Properties
            </Text>

            <Box p={3} bg="gray.50" borderRadius="md">
              <VStack spacing={1}>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Advanced Features (Coming in Phase 4+)
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  • Property characteristics (functional, symmetric, etc.)<br />
                  • Property chains and complex relationships<br />
                  • Cardinality restrictions
                </Text>
              </VStack>
            </Box>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
};