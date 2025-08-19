import React, { useState, useEffect } from "react";
import {
  Portal,
  Button,
  Dialog,
  CloseButton,
  Tabs,
  Separator,
} from "@chakra-ui/react";
import { useNotification } from "../../state/notify";
import {
  useTaxonomies,
  Taxonomy,
  TaxonomyConcept,
} from "../../state/taxonomies";
import { validateTaxonomy } from "../../utils/skos-validation";
import { TaxonomyMetadataTab } from "./TaxonomyMetadataTab";
import { TaxonomyConceptsTab } from "./TaxonomyConceptsTab";
import { TaxonomySchemeTab } from "./TaxonomySchemeTab";
import { TaxonomyJsonPreviewTab } from "./TaxonomyJsonPreviewTab";
import { TaxonomyValidationTab } from "./TaxonomyValidationTab";

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
    },
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
        uri:
          taxonomy.scheme.uri ||
          `${taxonomy.metadata.namespace}${taxonomyId}`,
        prefLabel: taxonomy.scheme.prefLabel || taxonomy.metadata.name,
      },
    };

    // Run validation and warn about issues
    const validation = validateTaxonomy(updatedTaxonomy);

    if (validation.errors.length > 0) {
      const shouldContinue = window.confirm(
        `This taxonomy has ${validation.errors.length} validation error${validation.errors.length !== 1 ? "s" : ""}. ` +
          "Saving may result in an invalid SKOS taxonomy. Do you want to continue?",
      );
      if (!shouldContinue) return;
    } else if (validation.warnings.length > 0) {
      notify.warning(
        `Taxonomy saved with ${validation.warnings.length} validation warning${validation.warnings.length !== 1 ? "s" : ""}`,
      );
    }

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
        `Are you sure you want to delete the taxonomy "${taxonomy.metadata.name}"?`,
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

  const isLoading =
    isCreatingTaxonomy || isUpdatingTaxonomy || isDeletingTaxonomy;

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
                  <Tabs.Trigger value="concepts">
                    Concepts ({Object.keys(taxonomy.concepts).length})
                  </Tabs.Trigger>
                  <Tabs.Trigger value="scheme">Scheme</Tabs.Trigger>
                  <Tabs.Trigger value="validation">Validation</Tabs.Trigger>
                  <Tabs.Trigger value="json">JSON Preview</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="metadata">
                  <TaxonomyMetadataTab
                    taxonomyId={taxonomyId}
                    taxonomy={taxonomy}
                    mode={mode}
                    onTaxonomyIdChange={setTaxonomyId}
                    onMetadataChange={handleMetadataChange}
                  />
                </Tabs.Content>

                <Tabs.Content value="concepts">
                  <TaxonomyConceptsTab
                    taxonomy={taxonomy}
                    onAddConcept={addConcept}
                    onDeleteConcept={deleteConcept}
                    onUpdateConcept={updateConcept}
                  />
                </Tabs.Content>

                <Tabs.Content value="scheme">
                  <TaxonomySchemeTab
                    taxonomy={taxonomy}
                    onSchemeChange={handleSchemeChange}
                  />
                </Tabs.Content>

                <Tabs.Content value="validation">
                  <TaxonomyValidationTab
                    taxonomy={taxonomy}
                    onTaxonomyChange={setTaxonomy}
                  />
                </Tabs.Content>

                <Tabs.Content value="json">
                  <TaxonomyJsonPreviewTab taxonomy={taxonomy} />
                </Tabs.Content>
              </Tabs.Root>
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
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
