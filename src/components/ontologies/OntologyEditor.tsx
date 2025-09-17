import React, { useState, useEffect } from "react";
import { Box, VStack, HStack, Heading, Button, Text } from "@chakra-ui/react";
import { Save, ArrowLeft } from "lucide-react";
import { useOntologies, Ontology, OWLClass } from "../../state/ontologies";
import { ClassTree } from "./ClassTree";
import { ClassEditor } from "./ClassEditor";
import { WelcomePanel } from "./WelcomePanel";

interface OntologyEditorProps {
  ontologyId: string;
  onBack?: () => void;
}

export const OntologyEditor: React.FC<OntologyEditorProps> = ({
  ontologyId,
  onBack,
}) => {
  const { ontologies, updateOntology } = useOntologies();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  // Find the ontology data
  const ontologyData = ontologies.find((ont) => ont[0] === ontologyId)?.[1];

  useEffect(() => {
    if (ontologyData) {
      // Show welcome panel for empty ontologies
      const hasClasses = Object.keys(ontologyData.classes).length > 0;
      const hasProperties =
        Object.keys(ontologyData.objectProperties).length > 0 ||
        Object.keys(ontologyData.datatypeProperties).length > 0;

      setShowWelcome(!hasClasses && !hasProperties);
    }
  }, [ontologyData]);

  if (!ontologyData) {
    return (
      <Box p={6}>
        <Text color="red.500">Ontology not found: {ontologyId}</Text>
      </Box>
    );
  }

  const handleSave = () => {
    updateOntology({
      id: ontologyId,
      ontology: ontologyData,
    });
  };

  const handleCreateClass = (className: string) => {
    if (!ontologyData) return;

    const classId = className.toLowerCase().replace(/\s+/g, "");
    const classUri = `${ontologyData.metadata.namespace}${classId}`;

    const newClass: OWLClass = {
      uri: classUri,
      type: "owl:Class",
      "rdfs:label": [{ value: className, lang: "en" }],
      "rdfs:comment": "",
    };

    const updatedOntology: Ontology = {
      ...ontologyData,
      classes: {
        ...ontologyData.classes,
        [classId]: newClass,
      },
      metadata: {
        ...ontologyData.metadata,
        modified: new Date().toISOString(),
      },
    };

    updateOntology({
      id: ontologyId,
      ontology: updatedOntology,
    });

    setSelectedClassId(classId);
    setShowWelcome(false);
  };

  const handleUpdateClass = (classId: string, updatedClass: OWLClass) => {
    if (!ontologyData) return;

    const updatedOntology: Ontology = {
      ...ontologyData,
      classes: {
        ...ontologyData.classes,
        [classId]: updatedClass,
      },
      metadata: {
        ...ontologyData.metadata,
        modified: new Date().toISOString(),
      },
    };

    updateOntology({
      id: ontologyId,
      ontology: updatedOntology,
    });
  };

  const selectedClass = selectedClassId ? ontologyData.classes[selectedClassId] : null;

  return (
    <Box h="calc(100vh - 140px)" display="flex" flexDirection="column">
      {/* Header */}
      <Box p={4} borderBottomWidth="1px" bg="gray.50">
        <HStack justify="space-between" align="center">
          <HStack>
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft size={16} />
              </Button>
            )}
            <VStack align="start" spacing={0}>
              <Heading size="lg">{ontologyData.metadata.name}</Heading>
              <Text fontSize="sm" color="gray.600">
                {ontologyData.metadata.description}
              </Text>
            </VStack>
          </HStack>
          <Button colorPalette="primary" onClick={handleSave}>
            <Save size={16} style={{ marginRight: "8px" }} />
            Save
          </Button>
        </HStack>
      </Box>

      {/* Main Content */}
      <Box flex="1" display="flex" minH="0">
        {showWelcome ? (
          <Box flex="1" p={6} display="flex" alignItems="center" justifyContent="center">
            <WelcomePanel
              ontologyName={ontologyData.metadata.name}
              onCreateClass={handleCreateClass}
              onDismiss={() => setShowWelcome(false)}
            />
          </Box>
        ) : (
          <>
            {/* Left Panel - Class Tree */}
            <Box w="300px" borderRightWidth="1px" bg="gray.50" overflow="auto">
              <ClassTree
                classes={ontologyData.classes}
                selectedClassId={selectedClassId}
                onSelectClass={setSelectedClassId}
                onCreateClass={handleCreateClass}
              />
            </Box>

            {/* Right Panel - Class Editor */}
            <Box flex="1" overflow="auto">
              {selectedClass && selectedClassId ? (
                <ClassEditor
                  classId={selectedClassId}
                  owlClass={selectedClass}
                  ontology={ontologyData}
                  onUpdateClass={handleUpdateClass}
                />
              ) : (
                <Box p={6} display="flex" alignItems="center" justifyContent="center" h="100%">
                  <VStack spacing={4}>
                    <Text color="gray.500" fontSize="lg">
                      Select a class to edit
                    </Text>
                    <Text color="gray.400" fontSize="sm" textAlign="center">
                      Choose a class from the tree view on the left<br />
                      or create a new class to get started
                    </Text>
                  </VStack>
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};