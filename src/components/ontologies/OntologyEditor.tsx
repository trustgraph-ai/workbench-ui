import React, { useState, useEffect } from "react";
import { Box, VStack, HStack, Heading, Button, Text, Tabs } from "@chakra-ui/react";
import { Save, ArrowLeft } from "lucide-react";
import { useOntologies, Ontology, OWLClass, OWLObjectProperty, OWLDatatypeProperty } from "../../state/ontologies";
import { ClassTree } from "./ClassTree";
import { ClassEditor } from "./ClassEditor";
import { PropertyTree } from "./PropertyTree";
import { PropertyEditor } from "./PropertyEditor";
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
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState<"object" | "datatype" | null>(null);
  const [activeTab, setActiveTab] = useState<"classes" | "properties">("classes");
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

  const handleDeleteClass = (classId: string) => {
    if (!ontologyData) return;

    const classToDelete = ontologyData.classes[classId];
    if (!classToDelete) return;

    // Check for dependencies
    const dependencies = getClassDependencies(classId);

    if (dependencies.length > 0) {
      const dependencyList = dependencies.map(dep => {
        const depClass = ontologyData.classes[dep];
        return depClass?.["rdfs:label"]?.[0]?.value || dep;
      }).join(", ");

      if (!confirm(
        `This class is referenced by other classes: ${dependencyList}. ` +
        `Deleting it will remove these relationships. Continue?`
      )) {
        return;
      }
    } else {
      const className = classToDelete["rdfs:label"]?.[0]?.value || classId;
      if (!confirm(`Are you sure you want to delete the class "${className}"?`)) {
        return;
      }
    }

    // Remove the class and clean up references
    const updatedClasses = { ...ontologyData.classes };
    delete updatedClasses[classId];

    // Remove references to this class from subClassOf relationships
    Object.keys(updatedClasses).forEach(otherClassId => {
      const otherClass = updatedClasses[otherClassId];
      if (otherClass["rdfs:subClassOf"] === classId) {
        updatedClasses[otherClassId] = {
          ...otherClass,
          "rdfs:subClassOf": undefined,
        };
      }
    });

    // Remove references from properties' domain/range
    const updatedObjectProperties = { ...ontologyData.objectProperties };
    Object.keys(updatedObjectProperties).forEach(propId => {
      const prop = updatedObjectProperties[propId];
      let updated = false;

      if (prop["rdfs:domain"] === classId) {
        updatedObjectProperties[propId] = { ...prop, "rdfs:domain": undefined };
        updated = true;
      }
      if (prop["rdfs:range"] === classId) {
        updatedObjectProperties[propId] = { ...prop, "rdfs:range": undefined };
        updated = true;
      }
    });

    const updatedDatatypeProperties = { ...ontologyData.datatypeProperties };
    Object.keys(updatedDatatypeProperties).forEach(propId => {
      const prop = updatedDatatypeProperties[propId];
      if (prop["rdfs:domain"] === classId) {
        updatedDatatypeProperties[propId] = { ...prop, "rdfs:domain": undefined };
      }
    });

    const updatedOntology: Ontology = {
      ...ontologyData,
      classes: updatedClasses,
      objectProperties: updatedObjectProperties,
      datatypeProperties: updatedDatatypeProperties,
      metadata: {
        ...ontologyData.metadata,
        modified: new Date().toISOString(),
      },
    };

    updateOntology({
      id: ontologyId,
      ontology: updatedOntology,
    });

    // Clear selection if the deleted class was selected
    if (selectedClassId === classId) {
      setSelectedClassId(null);
    }
  };

  const getClassDependencies = (classId: string): string[] => {
    if (!ontologyData) return [];

    const dependencies: string[] = [];

    // Check subclass relationships
    Object.entries(ontologyData.classes).forEach(([otherClassId, otherClass]) => {
      if (otherClass["rdfs:subClassOf"] === classId) {
        dependencies.push(otherClassId);
      }
    });

    return dependencies;
  };

  const handleCreateObjectProperty = (propertyName: string) => {
    if (!ontologyData) return;

    const propertyId = propertyName.toLowerCase().replace(/\s+/g, "");
    const propertyUri = `${ontologyData.metadata.namespace}${propertyId}`;

    const newProperty: OWLObjectProperty = {
      uri: propertyUri,
      type: "owl:ObjectProperty",
      "rdfs:label": [{ value: propertyName, lang: "en" }],
      "rdfs:comment": "",
    };

    const updatedOntology: Ontology = {
      ...ontologyData,
      objectProperties: {
        ...ontologyData.objectProperties,
        [propertyId]: newProperty,
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

    setSelectedPropertyId(propertyId);
    setSelectedPropertyType("object");
    setActiveTab("properties");
    setShowWelcome(false);
  };

  const handleCreateDatatypeProperty = (propertyName: string) => {
    if (!ontologyData) return;

    const propertyId = propertyName.toLowerCase().replace(/\s+/g, "");
    const propertyUri = `${ontologyData.metadata.namespace}${propertyId}`;

    const newProperty: OWLDatatypeProperty = {
      uri: propertyUri,
      type: "owl:DatatypeProperty",
      "rdfs:label": [{ value: propertyName, lang: "en" }],
      "rdfs:comment": "",
      "rdfs:range": "xsd:string",
    };

    const updatedOntology: Ontology = {
      ...ontologyData,
      datatypeProperties: {
        ...ontologyData.datatypeProperties,
        [propertyId]: newProperty,
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

    setSelectedPropertyId(propertyId);
    setSelectedPropertyType("datatype");
    setActiveTab("properties");
    setShowWelcome(false);
  };

  const handleSelectProperty = (propertyId: string, type: "object" | "datatype") => {
    setSelectedPropertyId(propertyId);
    setSelectedPropertyType(type);
    setSelectedClassId(null); // Clear class selection
  };

  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedPropertyId(null); // Clear property selection
    setSelectedPropertyType(null);
    setActiveTab("classes");
  };

  const handleUpdateProperty = (
    propertyId: string,
    updatedProperty: OWLObjectProperty | OWLDatatypeProperty,
    type: "object" | "datatype"
  ) => {
    if (!ontologyData) return;

    const updatedOntology: Ontology = {
      ...ontologyData,
      ...(type === "object"
        ? {
            objectProperties: {
              ...ontologyData.objectProperties,
              [propertyId]: updatedProperty as OWLObjectProperty,
            },
          }
        : {
            datatypeProperties: {
              ...ontologyData.datatypeProperties,
              [propertyId]: updatedProperty as OWLDatatypeProperty,
            },
          }),
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
  const selectedProperty = selectedPropertyId && selectedPropertyType
    ? (selectedPropertyType === "object"
        ? ontologyData.objectProperties[selectedPropertyId]
        : ontologyData.datatypeProperties[selectedPropertyId])
    : null;

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
            {/* Left Panel - Tabbed Navigation */}
            <Box w="350px" borderRightWidth="1px" bg="gray.50" overflow="auto">
              <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as "classes" | "properties")}>
                <Tabs.List>
                  <Tabs.Trigger value="classes">Classes</Tabs.Trigger>
                  <Tabs.Trigger value="properties">Properties</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="classes">
                  <ClassTree
                    classes={ontologyData.classes}
                    selectedClassId={selectedClassId}
                    onSelectClass={handleSelectClass}
                    onCreateClass={handleCreateClass}
                    onUpdateClass={handleUpdateClass}
                    onDeleteClass={handleDeleteClass}
                  />
                </Tabs.Content>

                <Tabs.Content value="properties">
                  <PropertyTree
                    objectProperties={ontologyData.objectProperties}
                    datatypeProperties={ontologyData.datatypeProperties}
                    selectedPropertyId={selectedPropertyId}
                    selectedPropertyType={selectedPropertyType}
                    onSelectProperty={handleSelectProperty}
                    onCreateObjectProperty={handleCreateObjectProperty}
                    onCreateDatatypeProperty={handleCreateDatatypeProperty}
                  />
                </Tabs.Content>
              </Tabs.Root>
            </Box>

            {/* Right Panel - Editor */}
            <Box flex="1" overflow="auto">
              {selectedClass && selectedClassId ? (
                <ClassEditor
                  classId={selectedClassId}
                  owlClass={selectedClass}
                  ontology={ontologyData}
                  onUpdateClass={handleUpdateClass}
                  onDeleteClass={handleDeleteClass}
                />
              ) : selectedProperty && selectedPropertyId && selectedPropertyType ? (
                <PropertyEditor
                  propertyId={selectedPropertyId}
                  property={selectedProperty}
                  propertyType={selectedPropertyType}
                  ontology={ontologyData}
                  onUpdateProperty={handleUpdateProperty}
                />
              ) : (
                <Box p={6} display="flex" alignItems="center" justifyContent="center" h="100%">
                  <VStack spacing={4}>
                    <Text color="gray.500" fontSize="lg">
                      Select a class or property to edit
                    </Text>
                    <Text color="gray.400" fontSize="sm" textAlign="center">
                      Choose an item from the navigation panel<br />
                      or create a new class or property to get started
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