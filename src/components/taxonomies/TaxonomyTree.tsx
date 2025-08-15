import React, { useState, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Collapse,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
        bg={isSelected ? "blue.50" : "transparent"}
        borderLeft={isSelected ? "3px solid" : "3px solid transparent"}
        borderLeftColor={isSelected ? "blue.500" : "transparent"}
        _hover={{ bg: "gray.50" }}
        cursor="pointer"
        paddingLeft={paddingLeft}
      >
        {/* Expand/collapse button */}
        <IconButton
          aria-label="Toggle"
          icon={
            hasChildren ? (
              isOpen ? (
                <FiChevronDown />
              ) : (
                <FiChevronRight />
              )
            ) : null
          }
          size="xs"
          variant="ghost"
          onClick={hasChildren ? onToggle : undefined}
          visibility={hasChildren ? "visible" : "hidden"}
        />

        {/* Concept content */}
        <Box flex="1" onClick={() => onSelect(concept.id)}>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={0} flex="1">
              <HStack>
                <Text fontWeight={concept.topConcept ? "bold" : "medium"} fontSize="sm">
                  {concept.prefLabel}
                </Text>
                {concept.topConcept && (
                  <Badge size="xs" colorScheme="blue">
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
                <Text fontSize="xs" color="gray.600" noOfLines={1}>
                  {concept.definition}
                </Text>
              )}
            </VStack>

            {/* Context menu */}
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<FiMoreVertical />}
                variant="ghost"
                size="xs"
                onClick={(e) => e.stopPropagation()}
              />
              <MenuList>
                <MenuItem icon={<FiPlus />} onClick={() => onAdd(concept.id)}>
                  Add Child Concept
                </MenuItem>
                <MenuItem icon={<FiEdit3 />} onClick={() => onEdit(concept.id)}>
                  Edit Concept
                </MenuItem>
                <MenuItem icon={<FiMove />} onClick={() => onMove(concept.id)}>
                  Move Concept
                </MenuItem>
                <MenuItem
                  icon={<FiTrash2 />}
                  onClick={() => onDelete(concept.id)}
                  color="red.500"
                >
                  Delete Concept
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Box>
      </HStack>

      {/* Children */}
      {hasChildren && (
        <Collapse in={isOpen}>
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
        </Collapse>
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
      <Box p={4} textAlign="center" color="gray.500">
        <Text mb={4}>No concepts in this taxonomy yet.</Text>
        <IconButton
          aria-label="Add first concept"
          icon={<FiPlus />}
          colorScheme="blue"
          onClick={() => onConceptAdd()}
        />
        <Text fontSize="sm" mt={2}>
          Add your first concept
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" h="100%">
      {/* Search */}
      <InputGroup>
        <InputLeftElement>
          <FiSearch color="gray.500" />
        </InputLeftElement>
        <Input
          placeholder="Search concepts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      {/* Add root concept button */}
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.600">
          {Object.keys(taxonomy.concepts).length} concept(s)
        </Text>
        <IconButton
          aria-label="Add root concept"
          icon={<FiPlus />}
          size="sm"
          variant="outline"
          onClick={() => onConceptAdd()}
        />
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