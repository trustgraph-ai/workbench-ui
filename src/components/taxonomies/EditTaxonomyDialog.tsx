import React, { useState, useEffect } from "react";
import {
  Portal,
  Button,
  Dialog,
  CloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  Tabs,
  Box,
  IconButton,
  Divider,
} from "@chakra-ui/react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { toaster } from "../ui/toaster";
import { useTaxonomies, Taxonomy, TaxonomyConcept } from "../../state/taxonomies";

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
      toaster.create({
        title: "Error",
        description: "Taxonomy ID is required",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (!taxonomy.metadata.name.trim()) {
      toaster.create({
        title: "Error",
        description: "Taxonomy name is required",
        status: "error",
        duration: 3000,
      });
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
                  <FormControl isRequired>
                    <FormLabel>Taxonomy ID</FormLabel>
                    <Input
                      value={taxonomyId}
                      onChange={(e) => setTaxonomyId(e.target.value)}
                      placeholder="e.g., risk-categories"
                      isDisabled={mode === "edit"}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input
                      value={taxonomy.metadata.name}
                      onChange={(e) =>
                        handleMetadataChange("name", e.target.value)
                      }
                      placeholder="e.g., Risk Categories"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={taxonomy.metadata.description}
                      onChange={(e) =>
                        handleMetadataChange("description", e.target.value)
                      }
                      placeholder="Describe the purpose of this taxonomy"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Version</FormLabel>
                    <Input
                      value={taxonomy.metadata.version}
                      onChange={(e) =>
                        handleMetadataChange("version", e.target.value)
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Namespace</FormLabel>
                    <Input
                      value={taxonomy.metadata.namespace}
                      onChange={(e) =>
                        handleMetadataChange("namespace", e.target.value)
                      }
                      placeholder="http://example.org/taxonomies/"
                    />
                  </FormControl>
                </VStack>
              </Tabs.Content>

              <Tabs.Content value="concepts">
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold">
                      Concepts
                    </Text>
                    <Button
                      leftIcon={<FiPlus />}
                      colorScheme="blue"
                      size="sm"
                      onClick={addConcept}
                    >
                      Add Concept
                    </Button>
                  </HStack>

                  {Object.entries(taxonomy.concepts).length === 0 ? (
                    <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                      <Text color="gray.600">
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
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => deleteConcept(id)}
                            />
                          </HStack>
                          <VStack spacing={2} align="stretch">
                            <FormControl>
                              <FormLabel fontSize="sm">Preferred Label</FormLabel>
                              <Input
                                size="sm"
                                value={concept.prefLabel}
                                onChange={(e) =>
                                  updateConcept(id, "prefLabel", e.target.value)
                                }
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">Definition</FormLabel>
                              <Textarea
                                size="sm"
                                value={concept.definition || ""}
                                onChange={(e) =>
                                  updateConcept(id, "definition", e.target.value)
                                }
                              />
                            </FormControl>
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </Tabs.Content>

              <Tabs.Content value="scheme">
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Scheme URI</FormLabel>
                    <Input
                      value={taxonomy.scheme.uri}
                      onChange={(e) => handleSchemeChange("uri", e.target.value)}
                      placeholder="Will be auto-generated if empty"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Scheme Label</FormLabel>
                    <Input
                      value={taxonomy.scheme.prefLabel}
                      onChange={(e) =>
                        handleSchemeChange("prefLabel", e.target.value)
                      }
                      placeholder="Will use taxonomy name if empty"
                    />
                  </FormControl>
                </VStack>
              </Tabs.Content>

              <Tabs.Content value="json">
                <Box
                  as="pre"
                  p={4}
                  bg="gray.50"
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
                colorPalette="blue"
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