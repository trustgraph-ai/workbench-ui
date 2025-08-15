import React, { useState, useEffect } from "react";
import {
  Portal,
  Button,
  Dialog,
  CloseButton,
  Field,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  Tabs,
  Box,
  IconButton,
  Separator,
} from "@chakra-ui/react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useNotification } from "../../state/notify";
import { useTaxonomies, Taxonomy, TaxonomyConcept } from "../../state/taxonomies";
import TextField from "../common/TextField";
import TextAreaField from "../common/TextAreaField";

interface EditTaxonomyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  taxonomyId?: string;
  initialTaxonomy?: Taxonomy;
}

export const EditTaxonomyDialog: React.FC<EditTaxonomyDialogProps> = ({
  open,
  onOpenChange,
  mode,
  taxonomyId: initialTaxonomyId,
  initialTaxonomy,
}) => {
  const {
    createTaxonomy,
    updateTaxonomy,
    deleteTaxonomy,
    isCreatingTaxonomy,
    isUpdatingTaxonomy,
    isDeletingTaxonomy,
  } = useTaxonomies();
  const notify = useNotification();

  const [taxonomyId, setTaxonomyId] = useState(initialTaxonomyId || "");
  const [taxonomy, setTaxonomy] = useState<Taxonomy>(
    initialTaxonomy || {
      metadata: {
        name: "",
        description: "",
        version: "1.0",
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        creator: "user",
        namespace: "http://example.org/taxonomies/",
      },
      concepts: {},
      scheme: {
        uri: "",
        prefLabel: "",
        hasTopConcept: [],
      },
    }
  );

  useEffect(() => {
    if (initialTaxonomy) {
      setTaxonomy(initialTaxonomy);
    }
    if (initialTaxonomyId) {
      setTaxonomyId(initialTaxonomyId);
    }
  }, [initialTaxonomy, initialTaxonomyId]);

  const handleSave = () => {
    if (!taxonomyId.trim()) {
      notify.error("Taxonomy ID is required");
      return;
    }

    if (!taxonomy.metadata.name.trim()) {
      notify.error("Taxonomy name is required");
      return;
    }

    const updatedTaxonomy = {
      ...taxonomy,
      metadata: {
        ...taxonomy.metadata,
        modified: new Date().toISOString(),
      },
      scheme: {
        ...taxonomy.scheme,
        uri: taxonomy.scheme.uri || `${taxonomy.metadata.namespace}${taxonomyId}`,
        prefLabel: taxonomy.scheme.prefLabel || taxonomy.metadata.name,
      },
    };

    const mutation = mode === "create" ? createTaxonomy : updateTaxonomy;
    mutation({
      id: taxonomyId,
      taxonomy: updatedTaxonomy,
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the taxonomy "${taxonomy.metadata.name}"?`
      )
    ) {
      deleteTaxonomy({
        id: taxonomyId,
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  const handleMetadataChange = (field: string, value: string) => {
    setTaxonomy({
      ...taxonomy,
      metadata: {
        ...taxonomy.metadata,
        [field]: value,
      },
    });
  };

  const handleSchemeChange = (field: string, value: string) => {
    setTaxonomy({
      ...taxonomy,
      scheme: {
        ...taxonomy.scheme,
        [field]: value,
      },
    });
  };

  const addConcept = () => {
    const newId = `concept-${Date.now()}`;
    const newConcept: TaxonomyConcept = {
      id: newId,
      prefLabel: "New Concept",
      narrower: [],
      related: [],
    };
    
    setTaxonomy({
      ...taxonomy,
      concepts: {
        ...taxonomy.concepts,
        [newId]: newConcept,
      },
    });
  };

  const updateConcept = (conceptId: string, field: string, value: any) => {
    setTaxonomy({
      ...taxonomy,
      concepts: {
        ...taxonomy.concepts,
        [conceptId]: {
          ...taxonomy.concepts[conceptId],
          [field]: value,
        },
      },
    });
  };

  const deleteConcept = (conceptId: string) => {
    const { [conceptId]: _, ...remainingConcepts } = taxonomy.concepts;
    setTaxonomy({
      ...taxonomy,
      concepts: remainingConcepts,
    });
  };

  const isLoading = isCreatingTaxonomy || isUpdatingTaxonomy || isDeletingTaxonomy;

  return (
    <Dialog.Root
      placement="center"
      size="xl"
      open={open}
      onOpenChange={(x) => {
        onOpenChange(x.open);
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="4xl">
            <Dialog.Header>
              <Dialog.Title>
                {mode === "create" ? "Create New Taxonomy" : "Edit Taxonomy"}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
          <Tabs.Root defaultValue="metadata">
            <Tabs.List>
              <Tabs.Trigger value="metadata">Metadata</Tabs.Trigger>
              <Tabs.Trigger value="concepts">Concepts ({Object.keys(taxonomy.concepts).length})</Tabs.Trigger>
              <Tabs.Trigger value="scheme">Scheme</Tabs.Trigger>
              <Tabs.Trigger value="json">JSON Preview</Tabs.Trigger>
            </Tabs.List>

              <Tabs.Content value="metadata">
                <VStack spacing={4} align="stretch">
                  <TextField
                    label="Taxonomy ID"
                    value={taxonomyId}
                    onValueChange={setTaxonomyId}
                    placeholder="e.g., risk-categories"
                    required
                    disabled={mode === "edit"}
                  />

                  <TextField
                    label="Name"
                    value={taxonomy.metadata.name}
                    onValueChange={(value) => handleMetadataChange("name", value)}
                    placeholder="e.g., Risk Categories"
                    required
                  />

                  <TextAreaField
                    label="Description"
                    value={taxonomy.metadata.description}
                    onValueChange={(value) => handleMetadataChange("description", value)}
                    placeholder="Describe the purpose of this taxonomy"
                  />

                  <TextField
                    label="Version"
                    value={taxonomy.metadata.version}
                    onValueChange={(value) => handleMetadataChange("version", value)}
                  />

                  <TextField
                    label="Namespace"
                    value={taxonomy.metadata.namespace}
                    onValueChange={(value) => handleMetadataChange("namespace", value)}
                    placeholder="http://example.org/taxonomies/"
                  />
                </VStack>
              </Tabs.Content>

              <Tabs.Content value="concepts">
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold">
                      Concepts
                    </Text>
                    <Button
                      colorPalette="primary"
                      size="sm"
                      onClick={addConcept}
                    >
                      <FiPlus /> Add Concept
                    </Button>
                  </HStack>

                  {Object.entries(taxonomy.concepts).length === 0 ? (
                    <Box p={4} borderWidth="1px" borderRadius="md" bg="bg.muted">
                      <Text color="fg.muted">
                        No concepts yet. Click "Add Concept" to create one.
                      </Text>
                    </Box>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {Object.entries(taxonomy.concepts).map(([id, concept]) => (
                        <Box
                          key={id}
                          p={4}
                          borderWidth="1px"
                          borderRadius="md"
                        >
                          <HStack justify="space-between" mb={3}>
                            <Text fontWeight="bold">{concept.prefLabel}</Text>
                            <IconButton
                              aria-label="Delete concept"
                              size="sm"
                              colorPalette="red"
                              variant="ghost"
                              onClick={() => deleteConcept(id)}
                            >
                              <FiTrash2 />
                            </IconButton>
                          </HStack>
                          <VStack spacing={2} align="stretch">
                            <Field.Root>
                              <Field.Label fontSize="sm">Preferred Label</Field.Label>
                              <Input
                                size="sm"
                                value={concept.prefLabel}
                                onChange={(e) =>
                                  updateConcept(id, "prefLabel", e.target.value)
                                }
                              />
                            </Field.Root>
                            <Field.Root>
                              <Field.Label fontSize="sm">Definition</Field.Label>
                              <Textarea
                                size="sm"
                                value={concept.definition || ""}
                                onChange={(e) =>
                                  updateConcept(id, "definition", e.target.value)
                                }
                              />
                            </Field.Root>
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </Tabs.Content>

              <Tabs.Content value="scheme">
                <VStack spacing={4} align="stretch">
                  <TextField
                    label="Scheme URI"
                    value={taxonomy.scheme.uri}
                    onValueChange={(value) => handleSchemeChange("uri", value)}
                    placeholder="Will be auto-generated if empty"
                  />

                  <TextField
                    label="Scheme Label"
                    value={taxonomy.scheme.prefLabel}
                    onValueChange={(value) => handleSchemeChange("prefLabel", value)}
                    placeholder="Will use taxonomy name if empty"
                  />
                </VStack>
              </Tabs.Content>

              <Tabs.Content value="json">
                <Box
                  as="pre"
                  p={4}
                  bg="bg.muted"
                  borderRadius="md"
                  overflow="auto"
                  maxH="400px"
                  fontSize="sm"
                >
                  {JSON.stringify(taxonomy, null, 2)}
                </Box>
              </Tabs.Content>
          </Tabs.Root>
            </Dialog.Body>

            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              {mode === "edit" && (
                <Button
                  colorPalette="red"
                  variant="solid"
                  onClick={handleDelete}
                  loading={isDeletingTaxonomy}
                >
                  Delete
                </Button>
              )}
              <Button
                colorPalette="primary"
                onClick={handleSave}
                loading={isLoading}
              >
                {mode === "create" ? "Create" : "Save"}
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};