import React, { useState } from "react";
import { Box, VStack, HStack, Text, Button, Input, IconButton } from "@chakra-ui/react";
import { Plus, ChevronRight, ChevronDown, Hash } from "lucide-react";
import { OWLClass } from "../../state/ontologies";

interface ClassTreeProps {
  classes: Record<string, OWLClass>;
  selectedClassId?: string | null;
  onSelectClass: (classId: string) => void;
  onCreateClass: (className: string) => void;
}

export const ClassTree: React.FC<ClassTreeProps> = ({
  classes,
  selectedClassId,
  onSelectClass,
  onCreateClass,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());

  const classEntries = Object.entries(classes);

  const handleCreateClass = () => {
    if (newClassName.trim()) {
      onCreateClass(newClassName.trim());
      setNewClassName("");
      setIsCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setNewClassName("");
    setIsCreating(false);
  };

  const toggleExpanded = (classId: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(classId)) {
      newExpanded.delete(classId);
    } else {
      newExpanded.add(classId);
    }
    setExpandedClasses(newExpanded);
  };

  const getClassLabel = (owlClass: OWLClass): string => {
    if (owlClass["rdfs:label"] && owlClass["rdfs:label"].length > 0) {
      return owlClass["rdfs:label"][0].value;
    }
    // Fallback to extracting from URI
    const parts = owlClass.uri.split(/[/#]/);
    return parts[parts.length - 1] || "Unnamed Class";
  };

  return (
    <VStack align="stretch" spacing={0} h="100%">
      {/* Header */}
      <Box p={3} borderBottomWidth="1px">
        <HStack justify="space-between">
          <Text fontWeight="semibold" fontSize="sm" color="gray.700">
            Classes ({classEntries.length})
          </Text>
          <IconButton
            size="xs"
            variant="ghost"
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            <Plus size={14} />
          </IconButton>
        </HStack>
      </Box>

      {/* Class List */}
      <Box flex="1" overflow="auto">
        <VStack align="stretch" spacing={0}>
          {/* New Class Creation */}
          {isCreating && (
            <Box p={2} bg="blue.50" borderBottomWidth="1px">
              <VStack spacing={2}>
                <Input
                  size="sm"
                  placeholder="Class name (e.g., Document)"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateClass();
                    if (e.key === "Escape") handleCancelCreate();
                  }}
                  autoFocus
                />
                <HStack spacing={2}>
                  <Button size="xs" colorPalette="blue" onClick={handleCreateClass}>
                    Create
                  </Button>
                  <Button size="xs" variant="ghost" onClick={handleCancelCreate}>
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </Box>
          )}

          {/* Existing Classes */}
          {classEntries.length === 0 && !isCreating ? (
            <Box p={4} textAlign="center">
              <Text color="gray.500" fontSize="sm">
                No classes yet
              </Text>
              <Button
                size="sm"
                variant="ghost"
                colorPalette="blue"
                mt={2}
                onClick={() => setIsCreating(true)}
              >
                <Plus size={14} style={{ marginRight: "4px" }} />
                Add First Class
              </Button>
            </Box>
          ) : (
            classEntries.map(([classId, owlClass]) => {
              const isSelected = classId === selectedClassId;
              const isExpanded = expandedClasses.has(classId);
              const hasSubclasses = false; // TODO: Phase 3 - implement subclass relationships

              return (
                <Box key={classId}>
                  <HStack
                    p={2}
                    spacing={1}
                    bg={isSelected ? "blue.100" : "transparent"}
                    cursor="pointer"
                    _hover={{ bg: isSelected ? "blue.100" : "gray.100" }}
                    onClick={() => onSelectClass(classId)}
                  >
                    {hasSubclasses ? (
                      <IconButton
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(classId);
                        }}
                      >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </IconButton>
                    ) : (
                      <Box w={6} /> // Spacer for alignment
                    )}

                    <Hash size={14} color="#666" />

                    <VStack align="start" spacing={0} flex="1" minW="0">
                      <Text
                        fontSize="sm"
                        fontWeight={isSelected ? "semibold" : "normal"}
                        color={isSelected ? "blue.800" : "gray.800"}
                        noOfLines={1}
                      >
                        {getClassLabel(owlClass)}
                      </Text>
                      {owlClass["rdfs:comment"] && (
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {owlClass["rdfs:comment"]}
                        </Text>
                      )}
                    </VStack>
                  </HStack>

                  {/* Subclasses - TODO: Phase 3 */}
                  {hasSubclasses && isExpanded && (
                    <Box pl={4} borderLeftWidth="1px" borderLeftColor="gray.200" ml={3}>
                      {/* Subclass items will go here in Phase 3 */}
                    </Box>
                  )}
                </Box>
              );
            })
          )}
        </VStack>
      </Box>
    </VStack>
  );
};