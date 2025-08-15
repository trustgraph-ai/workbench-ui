import React, { useState } from "react";
import {
  Box,
  Grid,
  GridItem,
  Heading,
  HStack,
  VStack,
  Button,
  Select,
  IconButton,
  Text,
  Separator,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { FiPlus, FiDownload, FiUpload, FiSettings } from "react-icons/fi";
import { toaster } from "../ui/toaster";
import { useTaxonomies, Taxonomy, TaxonomyConcept } from "../../state/taxonomies";
import { TaxonomyTree } from "./TaxonomyTree";
import { ConceptEditor } from "./ConceptEditor";

interface TaxonomyManagerProps {
  selectedTaxonomyId?: string;
  onTaxonomySelect?: (taxonomyId: string) => void;
}

export const TaxonomyManager: React.FC<TaxonomyManagerProps> = ({
  selectedTaxonomyId,
  onTaxonomySelect,
}) => {
  const { taxonomies, updateTaxonomy, isUpdatingTaxonomy } = useTaxonomies();
  
  const [currentTaxonomyId, setCurrentTaxonomyId] = useState<string | null>(
    selectedTaxonomyId || null
  );
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [editingConcept, setEditingConcept] = useState<TaxonomyConcept | null>(null);
  const [isCreatingConcept, setIsCreatingConcept] = useState(false);

  const currentTaxonomy = currentTaxonomyId
    ? taxonomies.find(([id]) => id === currentTaxonomyId)?.[1]
    : null;

  const selectedConcept = selectedConceptId && currentTaxonomy
    ? currentTaxonomy.concepts[selectedConceptId]
    : null;

  const handleTaxonomyChange = (taxonomyId: string) => {
    setCurrentTaxonomyId(taxonomyId);
    setSelectedConceptId(null);
    setEditingConcept(null);
    setIsCreatingConcept(false);
    onTaxonomySelect?.(taxonomyId);
  };

  const handleConceptSelect = (conceptId: string) => {
    setSelectedConceptId(conceptId);
    setEditingConcept(null);
    setIsCreatingConcept(false);
  };

  const handleConceptAdd = (parentId?: string) => {
    if (!currentTaxonomy || !currentTaxonomyId) return;

    const newConcept: TaxonomyConcept = {
      id: `concept-${Date.now()}`,
      prefLabel: "New Concept",
      broader: parentId || null,
      narrower: [],
      related: [],
      topConcept: !parentId, // If no parent, make it a top concept
    };

    setEditingConcept(newConcept);
    setIsCreatingConcept(true);
    setSelectedConceptId(newConcept.id);
  };

  const handleConceptEdit = (conceptId: string) => {
    if (!currentTaxonomy) return;
    const concept = currentTaxonomy.concepts[conceptId];
    if (concept) {
      setEditingConcept({ ...concept });
      setIsCreatingConcept(false);
      setSelectedConceptId(conceptId);
    }
  };

  const handleConceptSave = (concept: TaxonomyConcept) => {
    if (!currentTaxonomy || !currentTaxonomyId) return;

    // Update the taxonomy with the new/modified concept
    const updatedConcepts = {
      ...currentTaxonomy.concepts,
      [concept.id]: concept,
    };

    // Update broader/narrower relationships
    if (concept.broader) {
      const parent = updatedConcepts[concept.broader];
      if (parent && !parent.narrower?.includes(concept.id)) {
        parent.narrower = [...(parent.narrower || []), concept.id];
      }
    }

    // Update scheme's hasTopConcept if this is a top concept
    const updatedScheme = { ...currentTaxonomy.scheme };
    if (concept.topConcept && !updatedScheme.hasTopConcept.includes(concept.id)) {
      updatedScheme.hasTopConcept = [...updatedScheme.hasTopConcept, concept.id];
    } else if (!concept.topConcept && updatedScheme.hasTopConcept.includes(concept.id)) {
      updatedScheme.hasTopConcept = updatedScheme.hasTopConcept.filter(id => id !== concept.id);
    }

    const updatedTaxonomy: Taxonomy = {
      ...currentTaxonomy,
      concepts: updatedConcepts,
      scheme: updatedScheme,
      metadata: {
        ...currentTaxonomy.metadata,
        modified: new Date().toISOString(),
      },
    };

    updateTaxonomy({
      id: currentTaxonomyId,
      taxonomy: updatedTaxonomy,
      onSuccess: () => {
        setEditingConcept(null);
        setIsCreatingConcept(false);
        setSelectedConceptId(concept.id);
        toaster.create({
          title: "Success",
          description: isCreatingConcept ? "Concept created" : "Concept updated",
          status: "success",
          duration: 3000,
        });
      },
    });
  };

  const handleConceptDelete = (conceptId: string) => {
    if (!currentTaxonomy || !currentTaxonomyId) return;

    if (window.confirm("Are you sure you want to delete this concept? This action cannot be undone.")) {
      const { [conceptId]: deleted, ...remainingConcepts } = currentTaxonomy.concepts;

      // Remove from parent's narrower list
      Object.values(remainingConcepts).forEach(concept => {
        if (concept.narrower?.includes(conceptId)) {
          concept.narrower = concept.narrower.filter(id => id !== conceptId);
        }
        if (concept.related?.includes(conceptId)) {
          concept.related = concept.related.filter(id => id !== conceptId);
        }
      });

      // Remove from scheme's hasTopConcept
      const updatedScheme = {
        ...currentTaxonomy.scheme,
        hasTopConcept: currentTaxonomy.scheme.hasTopConcept.filter(id => id !== conceptId),
      };

      const updatedTaxonomy: Taxonomy = {
        ...currentTaxonomy,
        concepts: remainingConcepts,
        scheme: updatedScheme,
        metadata: {
          ...currentTaxonomy.metadata,
          modified: new Date().toISOString(),
        },
      };

      updateTaxonomy({
        id: currentTaxonomyId,
        taxonomy: updatedTaxonomy,
        onSuccess: () => {
          setSelectedConceptId(null);
          setEditingConcept(null);
          toaster.create({
            title: "Success",
            description: "Concept deleted",
            status: "success",
            duration: 3000,
          });
        },
      });
    }
  };

  const handleConceptMove = (conceptId: string, newParentId?: string) => {
    // TODO: Implement drag-and-drop concept moving
    toaster.create({
      title: "Feature not implemented",
      description: "Drag-and-drop concept moving will be implemented in a future update",
      status: "info",
      duration: 3000,
    });
  };

  const getConceptBreadcrumb = (conceptId: string): string[] => {
    if (!currentTaxonomy || !conceptId) return [];
    
    const path: string[] = [];
    let currentId: string | null = conceptId;
    
    while (currentId) {
      const concept = currentTaxonomy.concepts[currentId];
      if (!concept) break;
      
      path.unshift(concept.prefLabel);
      currentId = concept.broader;
    }
    
    return path;
  };

  if (!taxonomies.length) {
    return (
      <Box p={8} textAlign="center" color="gray.500">
        <Text mb={4}>No taxonomies available. Create one to get started.</Text>
      </Box>
    );
  }

  if (!currentTaxonomy) {
    return (
      <VStack spacing={4} p={8}>
        <Text color="gray.600">Select a taxonomy to start editing:</Text>
        <Select
          placeholder="Choose a taxonomy..."
          onChange={(e) => e.target.value && handleTaxonomyChange(e.target.value)}
          maxW="400px"
        >
          {taxonomies.map(([id, taxonomy]) => (
            <option key={id} value={id}>
              {taxonomy.metadata.name} ({Object.keys(taxonomy.concepts).length} concepts)
            </option>
          ))}
        </Select>
      </VStack>
    );
  }

  return (
    <VStack spacing={4} align="stretch" h="100%">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <HStack>
            <Heading size="lg">{currentTaxonomy.metadata.name}</Heading>
            <Text color="gray.500">
              ({Object.keys(currentTaxonomy.concepts).length} concepts)
            </Text>
          </HStack>
          {selectedConcept && (
            <Breadcrumb fontSize="sm" color="gray.600">
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => setSelectedConceptId(null)}>
                  {currentTaxonomy.metadata.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {getConceptBreadcrumb(selectedConcept.id).map((label, index, arr) => (
                <BreadcrumbItem key={index} isCurrentPage={index === arr.length - 1}>
                  <BreadcrumbLink>{label}</BreadcrumbLink>
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          )}
        </VStack>
        
        <HStack>
          <Select
            value={currentTaxonomyId || ""}
            onChange={(e) => e.target.value && handleTaxonomyChange(e.target.value)}
            w="250px"
          >
            {taxonomies.map(([id, taxonomy]) => (
              <option key={id} value={id}>
                {taxonomy.metadata.name}
              </option>
            ))}
          </Select>
          <Button leftIcon={<FiPlus />} colorPalette="blue" onClick={() => handleConceptAdd()}>
            Add Concept
          </Button>
          <IconButton
            aria-label="Import"
            icon={<FiUpload />}
            variant="outline"
            onClick={() => toaster.create({ title: "Import feature coming soon", status: "info" })}
          />
          <IconButton
            aria-label="Export"
            icon={<FiDownload />}
            variant="outline"
            onClick={() => toaster.create({ title: "Export feature coming soon", status: "info" })}
          />
          <IconButton
            aria-label="Settings"
            icon={<FiSettings />}
            variant="outline"
            onClick={() => toaster.create({ title: "Settings feature coming soon", status: "info" })}
          />
        </HStack>
      </HStack>

      <Separator />

      {/* Main Content */}
      <Grid templateColumns="1fr 1px 2fr" gap={0} flex="1" minH="0">
        {/* Left Panel - Tree View */}
        <GridItem>
          <Box h="100%" p={4} overflowY="auto">
            <TaxonomyTree
              taxonomy={currentTaxonomy}
              selectedConceptId={selectedConceptId}
              onConceptSelect={handleConceptSelect}
              onConceptAdd={handleConceptAdd}
              onConceptEdit={handleConceptEdit}
              onConceptDelete={handleConceptDelete}
              onConceptMove={handleConceptMove}
            />
          </Box>
        </GridItem>

        {/* Divider */}
        <GridItem>
          <Box w="1px" h="100%" bg="gray.200" />
        </GridItem>

        {/* Right Panel - Concept Editor */}
        <GridItem>
          <Box h="100%" p={4}>
            {editingConcept ? (
              <ConceptEditor
                concept={isCreatingConcept ? undefined : editingConcept}
                taxonomy={currentTaxonomy}
                onSave={handleConceptSave}
                onCancel={() => {
                  setEditingConcept(null);
                  setIsCreatingConcept(false);
                  if (isCreatingConcept) {
                    setSelectedConceptId(null);
                  }
                }}
              />
            ) : selectedConcept ? (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">{selectedConcept.prefLabel}</Heading>
                  <Button
                    size="sm"
                    colorPalette="blue"
                    onClick={() => handleConceptEdit(selectedConcept.id)}
                  >
                    Edit
                  </Button>
                </HStack>
                
                <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                  <VStack align="start" spacing={3}>
                    {selectedConcept.definition && (
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">
                          Definition
                        </Text>
                        <Text>{selectedConcept.definition}</Text>
                      </Box>
                    )}
                    
                    {selectedConcept.scopeNote && (
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">
                          Scope Note
                        </Text>
                        <Text fontSize="sm">{selectedConcept.scopeNote}</Text>
                      </Box>
                    )}
                    
                    {selectedConcept.example && selectedConcept.example.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">
                          Examples
                        </Text>
                        <VStack align="start" spacing={1}>
                          {selectedConcept.example.map((ex, index) => (
                            <Text key={index} fontSize="sm">• {ex}</Text>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                </Box>
              </VStack>
            ) : (
              <Box p={8} textAlign="center" color="gray.500">
                <Text>Select a concept from the tree to view details, or create a new concept.</Text>
              </Box>
            )}
          </Box>
        </GridItem>
      </Grid>
    </VStack>
  );
};