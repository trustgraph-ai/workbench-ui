import React, { useState, useMemo } from "react";
import { Box, VStack } from "@chakra-ui/react";
import { Taxonomy } from "../../state/taxonomies";
import { TaxonomyTreeNode } from "./TaxonomyTreeNode";
import { TaxonomyTreeSearch } from "./TaxonomyTreeSearch";
import { TaxonomyTreeHeader } from "./TaxonomyTreeHeader";
import { TaxonomyTreeEmpty } from "./TaxonomyTreeEmpty";

interface TaxonomyTreeProps {
  taxonomy: Taxonomy;
  selectedConceptId?: string;
  onConceptSelect: (conceptId: string) => void;
  onConceptAdd: (parentId?: string) => void;
  onConceptEdit: (conceptId: string) => void;
  onConceptDelete: (conceptId: string) => void;
  onConceptMove: (conceptId: string, newParentId?: string) => void;
}

export const TaxonomyTree: React.FC<TaxonomyTreeProps> = ({
  taxonomy,
  selectedConceptId,
  onConceptSelect,
  onConceptAdd,
  onConceptEdit,
  onConceptDelete,
  onConceptMove,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Get top-level concepts (those marked as topConcept or in hasTopConcept)
  const topConcepts = useMemo(() => {
    const topConceptIds = taxonomy.scheme?.hasTopConcept || [];
    const conceptsWithTopFlag = Object.values(taxonomy.concepts)
      .filter((c) => c.topConcept)
      .map((c) => c.id);

    // Combine both sources and remove duplicates
    const allTopIds = [
      ...new Set([...topConceptIds, ...conceptsWithTopFlag]),
    ];

    return allTopIds.map((id) => taxonomy.concepts[id]).filter(Boolean);
  }, [taxonomy.concepts, taxonomy.scheme?.hasTopConcept]);

  // Get orphaned concepts (no broader relation and not in top concepts)
  const orphanedConcepts = useMemo(() => {
    const topConceptIds = new Set(topConcepts.map((c) => c.id));
    return Object.values(taxonomy.concepts)
      .filter((concept) => !concept.broader && !topConceptIds.has(concept.id))
      .filter((concept) => !concept.topConcept);
  }, [taxonomy.concepts, topConcepts]);

  const allRootConcepts = [...topConcepts, ...orphanedConcepts];

  if (Object.keys(taxonomy.concepts).length === 0) {
    return <TaxonomyTreeEmpty onAddConcept={() => onConceptAdd()} />;
  }

  return (
    <VStack gap={4} align="stretch" h="100%">
      <TaxonomyTreeSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <TaxonomyTreeHeader
        conceptCount={Object.keys(taxonomy.concepts).length}
        onAddRootConcept={() => onConceptAdd()}
      />

      {/* Tree */}
      <Box flex="1" overflowY="auto">
        <VStack gap={1} align="stretch">
          {allRootConcepts.map((concept) => (
            <TaxonomyTreeNode
              key={concept.id}
              concept={concept}
              taxonomy={taxonomy}
              level={0}
              isSelected={selectedConceptId === concept.id}
              searchTerm={searchTerm}
              selectedConceptId={selectedConceptId}
              onSelect={onConceptSelect}
              onAdd={onConceptAdd}
              onEdit={onConceptEdit}
              onDelete={onConceptDelete}
              onMove={onConceptMove}
            />
          ))}
        </VStack>
      </Box>
    </VStack>
  );
};
