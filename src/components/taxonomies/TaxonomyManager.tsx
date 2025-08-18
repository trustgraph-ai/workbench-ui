import React, { useState } from "react";
import {
  Box,
  Grid,
  GridItem,
  VStack,
  Text,
} from "@chakra-ui/react";
import { TaxonomyManagerHeader } from "./TaxonomyManagerHeader";
import { ConceptDetailView } from "./ConceptDetailView";
import { TaxonomyEmptyStates } from "./TaxonomyEmptyStates";
import { SKOSDialog } from "./SKOSDialog";
import { useNotification } from "../../state/notify";
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
  const { taxonomies, updateTaxonomy, createTaxonomy, isUpdatingTaxonomy } = useTaxonomies();
  const notify = useNotification();
  
  const [currentTaxonomyId, setCurrentTaxonomyId] = useState<string | null>(
    selectedTaxonomyId || null
  );
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [editingConcept, setEditingConcept] = useState<TaxonomyConcept | null>(null);
  const [isCreatingConcept, setIsCreatingConcept] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

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
        notify.success(isCreatingConcept ? "Concept created" : "Concept updated");
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
          notify.success("Concept deleted");
        },
      });
    }
  };

  const handleConceptMove = (conceptId: string, newParentId?: string) => {
    // TODO: Implement drag-and-drop concept moving
    notify.info("Drag-and-drop concept moving will be implemented in a future update");
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

  const handleImportTaxonomy = (importedTaxonomy: Taxonomy, taxonomyId: string) => {
    createTaxonomy({
      id: taxonomyId,
      taxonomy: importedTaxonomy,
      onSuccess: () => {
        setCurrentTaxonomyId(taxonomyId);
        setSelectedConceptId(null);
        setEditingConcept(null);
        setIsCreatingConcept(false);
        notify.success(`Taxonomy "${importedTaxonomy.metadata.name}" imported successfully`);
      },
    });
  };

  const handleExportTaxonomy = () => {
    if (!currentTaxonomy) {
      notify.error("No taxonomy selected for export");
      return;
    }
    setExportDialogOpen(true);
  };

  const handleImportDialogOpen = () => {
    setImportDialogOpen(true);
  };

  if (!taxonomies.length) {
    return <TaxonomyEmptyStates type="no-taxonomies" />;
  }

  if (!currentTaxonomy) {
    return (
      <TaxonomyEmptyStates
        type="no-taxonomy-selected"
        taxonomies={taxonomies}
        onTaxonomyChange={handleTaxonomyChange}
      />
    );
  }

  return (
    <VStack gap={4} align="stretch" h="100%">
      {/* Header */}
      <TaxonomyManagerHeader
        currentTaxonomy={currentTaxonomy}
        currentTaxonomyId={currentTaxonomyId}
        selectedConcept={selectedConcept}
        taxonomies={taxonomies}
        conceptBreadcrumb={selectedConcept ? getConceptBreadcrumb(selectedConcept.id) : []}
        onTaxonomyChange={handleTaxonomyChange}
        onConceptAdd={() => handleConceptAdd()}
        onImport={handleImportDialogOpen}
        onExport={handleExportTaxonomy}
        onSettings={() => notify.info("Settings feature coming soon")}
      />

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
          <Box w="1px" h="100%" bg="bg.subtle" />
        </GridItem>

        {/* Right Panel - Concept Editor */}
        <GridItem>
          <Box h="100%" p={4}>
            {editingConcept ? (
              <ConceptEditor
                concept={editingConcept}
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
              <ConceptDetailView
                concept={selectedConcept}
                onEdit={() => handleConceptEdit(selectedConcept.id)}
              />
            ) : (
              <TaxonomyEmptyStates type="no-concept-selected" />
            )}
          </Box>
        </GridItem>
      </Grid>

      {/* SKOS Export Dialog */}
      <SKOSDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        mode="export"
        taxonomy={currentTaxonomy || undefined}
      />

      {/* SKOS Import Dialog */}
      <SKOSDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        mode="import"
        onImport={handleImportTaxonomy}
      />
    </VStack>
  );
};