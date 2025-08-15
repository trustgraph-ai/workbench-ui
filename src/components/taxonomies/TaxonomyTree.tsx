import React, { useState, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Input,
  Menu,
  useDisclosure,
  Badge,
} from "@chakra-ui/react";
import {
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiMoreVertical,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiMove,
} from "react-icons/fi";
import { TaxonomyConcept, Taxonomy } from "../../state/taxonomies";

interface TaxonomyTreeProps {
  taxonomy: Taxonomy;
  selectedConceptId?: string;
  onConceptSelect: (conceptId: string) => void;
  onConceptAdd: (parentId?: string) => void;
  onConceptEdit: (conceptId: string) => void;
  onConceptDelete: (conceptId: string) => void;
  onConceptMove: (conceptId: string, newParentId?: string) => void;
}

interface TreeNodeProps {
  concept: TaxonomyConcept;
  taxonomy: Taxonomy;
  level: number;
  isSelected: boolean;
  searchTerm: string;
  onSelect: (conceptId: string) => void;
  onAdd: (parentId: string) => void;
  onEdit: (conceptId: string) => void;
  onDelete: (conceptId: string) => void;
  onMove: (conceptId: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  concept,
  taxonomy,
  level,
  isSelected,
  searchTerm,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  onMove,
}) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: level < 2 });
  
  const children = concept.narrower || [];
  const hasChildren = children.length > 0;
  
  // Filter children based on search term
  const filteredChildren = useMemo(() => {
    if (!searchTerm) return children;
    return children.filter(childId => {
      const childConcept = taxonomy.concepts[childId];
      return childConcept?.prefLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
             childConcept?.definition?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [children, searchTerm, taxonomy.concepts]);

  const shouldShowNode = !searchTerm || 
    concept.prefLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    concept.definition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    filteredChildren.length > 0;

  if (!shouldShowNode) return null;

  const paddingLeft = level * 20;

  return (
    <VStack spacing={1} align="stretch">
      <HStack
        spacing={2}
        p={2}
        borderRadius="md"
        bg={isSelected ? "primary.muted" : "transparent"}
        borderLeft={isSelected ? "3px solid" : "3px solid transparent"}
        borderLeftColor={isSelected ? "primary.solid" : "transparent"}
        _hover={{ bg: "bg.muted" }}
        cursor="pointer"
        paddingLeft={paddingLeft}
      >
        {/* Expand/collapse button */}
        <IconButton
          aria-label="Toggle"
          size="xs"
          variant="ghost"
          onClick={hasChildren ? onToggle : undefined}
          visibility={hasChildren ? "visible" : "hidden"}
        >
          {hasChildren ? (
            isOpen ? (
              <FiChevronDown />
            ) : (
              <FiChevronRight />
            )
          ) : null}
        </IconButton>

        {/* Concept content */}
        <Box flex="1" onClick={() => onSelect(concept.id)}>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={0} flex="1">
              <HStack>
                <Text fontWeight={concept.topConcept ? "bold" : "medium"} fontSize="sm">
                  {concept.prefLabel}
                </Text>
                {concept.topConcept && (
                  <Badge size="xs" colorPalette="primary">
                    Top
                  </Badge>
                )}
                {concept.notation && (
                  <Badge size="xs" variant="outline">
                    {concept.notation}
                  </Badge>
                )}
              </HStack>
              {concept.definition && (
                <Text fontSize="xs" color="fg.muted" noOfLines={1}>
                  {concept.definition}
                </Text>
              )}
            </VStack>

            {/* Context menu */}
            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton
                  aria-label="Options"
                  variant="ghost"
                  size="xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiMoreVertical />
                </IconButton>
              </Menu.Trigger>
              <Menu.Content>
                <Menu.Item onClick={() => onAdd(concept.id)}>
                  <FiPlus /> Add Child Concept
                </Menu.Item>
                <Menu.Item onClick={() => onEdit(concept.id)}>
                  <FiEdit3 /> Edit Concept
                </Menu.Item>
                <Menu.Item onClick={() => onMove(concept.id)}>
                  <FiMove /> Move Concept
                </Menu.Item>
                <Menu.Item
                  onClick={() => onDelete(concept.id)}
                  color="red.fg"
                >
                  <FiTrash2 /> Delete Concept
                </Menu.Item>
              </Menu.Content>
            </Menu.Root>
          </HStack>
        </Box>
      </HStack>

      {/* Children */}
      {hasChildren && isOpen && (
        <VStack spacing={1} align="stretch">
          {filteredChildren.map((childId) => {
            const childConcept = taxonomy.concepts[childId];
            if (!childConcept) return null;
            
            return (
              <TreeNode
                key={childId}
                concept={childConcept}
                taxonomy={taxonomy}
                level={level + 1}
                isSelected={isSelected}
                searchTerm={searchTerm}
                onSelect={onSelect}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={onMove}
              />
            );
          })}
        </VStack>
      )}
    </VStack>
  );
};

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
      .filter(c => c.topConcept)
      .map(c => c.id);
    
    // Combine both sources and remove duplicates
    const allTopIds = [...new Set([...topConceptIds, ...conceptsWithTopFlag])];
    
    return allTopIds
      .map(id => taxonomy.concepts[id])
      .filter(Boolean);
  }, [taxonomy.concepts, taxonomy.scheme?.hasTopConcept]);

  // Get orphaned concepts (no broader relation and not in top concepts)
  const orphanedConcepts = useMemo(() => {
    const topConceptIds = new Set(topConcepts.map(c => c.id));
    return Object.values(taxonomy.concepts)
      .filter(concept => !concept.broader && !topConceptIds.has(concept.id))
      .filter(concept => !concept.topConcept);
  }, [taxonomy.concepts, topConcepts]);

  const allRootConcepts = [...topConcepts, ...orphanedConcepts];

  if (Object.keys(taxonomy.concepts).length === 0) {
    return (
      <Box p={4} textAlign="center" color="fg.muted">
        <Text mb={4}>No concepts in this taxonomy yet.</Text>
        <IconButton
          aria-label="Add first concept"
          colorPalette="primary"
          onClick={() => onConceptAdd()}
        >
          <FiPlus />
        </IconButton>
        <Text fontSize="sm" mt={2}>
          Add your first concept
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" h="100%">
      {/* Search */}
      <HStack>
        <Input
          placeholder="🔍 Search concepts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </HStack>

      {/* Add root concept button */}
      <HStack justify="space-between">
        <Text fontSize="sm" color="fg.muted">
          {Object.keys(taxonomy.concepts).length} concept(s)
        </Text>
        <IconButton
          aria-label="Add root concept"
          size="sm"
          variant="outline"
          onClick={() => onConceptAdd()}
        >
          <FiPlus />
        </IconButton>
      </HStack>

      {/* Tree */}
      <Box flex="1" overflowY="auto">
        <VStack spacing={1} align="stretch">
          {allRootConcepts.map((concept) => (
            <TreeNode
              key={concept.id}
              concept={concept}
              taxonomy={taxonomy}
              level={0}
              isSelected={selectedConceptId === concept.id}
              searchTerm={searchTerm}
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