import React, { useState } from "react";
import { Box, Button, HStack, VStack, Tabs } from "@chakra-ui/react";
import { Plus, List, Edit } from "lucide-react";
import { OntologiesTable } from "./OntologiesTable";
import { EditOntologyDialog } from "./EditOntologyDialog";
import { OntologyManager } from "./OntologyManager";

export const Ontologies: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOntologyId, setSelectedOntologyId] = useState<string | null>(
    null,
  );

  return (
    <VStack gap={6} align="stretch" h="calc(100vh - 200px)">
      <HStack justify="flex-end">
        <Button colorPalette="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus /> Create Ontology
        </Button>
      </HStack>

      <Box flex="1" minH="0">
        <Tabs.Root height="100%" defaultValue="list">
          <Tabs.List>
            <Tabs.Trigger value="list">
              <List style={{ marginRight: "8px" }} />
              All Ontologies
            </Tabs.Trigger>
            <Tabs.Trigger value="editor">
              <Edit style={{ marginRight: "8px" }} />
              Editor
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="list" height="calc(100% - 40px)">
            <OntologiesTable />
          </Tabs.Content>
          <Tabs.Content value="editor" height="100%" p={0}>
            <OntologyManager
              selectedOntologyId={selectedOntologyId || undefined}
              onOntologySelect={setSelectedOntologyId}
            />
          </Tabs.Content>
        </Tabs.Root>
      </Box>

      <EditOntologyDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
      />
    </VStack>
  );
};
