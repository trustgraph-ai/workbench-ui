import React from "react";
import {
  Box,
  Heading,
  HStack,
  VStack,
  Button,
  IconButton,
  Text,
  Separator,
} from "@chakra-ui/react";
import { Plus, Download, Upload, Settings } from "lucide-react";
import SelectField from "../common/SelectField";
import { Taxonomy, TaxonomyConcept } from "../../state/taxonomies";

interface TaxonomyManagerHeaderProps {
  currentTaxonomy: Taxonomy;
  currentTaxonomyId: string | null;
  selectedConcept?: TaxonomyConcept;
  taxonomies: Array<[string, Taxonomy]>;
  conceptBreadcrumb: string[];
  onTaxonomyChange: (taxonomyId: string) => void;
  onConceptAdd: () => void;
  onImport: () => void;
  onExport: () => void;
  onSettings: () => void;
}

export const TaxonomyManagerHeader: React.FC<TaxonomyManagerHeaderProps> = ({
  currentTaxonomy,
  currentTaxonomyId,
  selectedConcept,
  taxonomies,
  conceptBreadcrumb,
  onTaxonomyChange,
  onConceptAdd,
  onImport,
  onExport,
  onSettings,
}) => {
  return (
    <>
      <HStack justify="space-between" align="center">
        <VStack align="start" gap={1}>
          <HStack>
            <Heading size="lg">{currentTaxonomy.metadata.name}</Heading>
            <Text color="fg.muted">
              ({Object.keys(currentTaxonomy.concepts).length} concepts)
            </Text>
          </HStack>
          {selectedConcept && (
            <Text fontSize="sm" color="fg.muted">
              {currentTaxonomy.metadata.name} → {conceptBreadcrumb.join(" → ")}
            </Text>
          )}
        </VStack>
        
        <HStack>
          <Box w="250px">
            <SelectField
              label="Current Taxonomy"
              items={taxonomies.map(([id, taxonomy]) => ({
                value: id,
                label: taxonomy.metadata.name,
                description: taxonomy.metadata.name
              }))}
              value={currentTaxonomyId ? [currentTaxonomyId] : []}
              onValueChange={(values) => {
                if (values.length > 0) {
                  onTaxonomyChange(values[0]);
                }
              }}
            />
          </Box>
          <Button colorPalette="primary" onClick={onConceptAdd}>
            <Plus /> Add Concept
          </Button>
          <IconButton
            aria-label="Import"
            variant="outline"
            onClick={onImport}
          >
            <Upload />
          </IconButton>
          <IconButton
            aria-label="Export"
            variant="outline"
            onClick={onExport}
          >
            <Download />
          </IconButton>
          <IconButton
            aria-label="Settings"
            variant="outline"
            onClick={onSettings}
          >
            <Settings />
          </IconButton>
        </HStack>
      </HStack>

      <Separator />
    </>
  );
};