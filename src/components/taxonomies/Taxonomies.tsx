import React, { useState } from "react";
import { Box, Button, Heading, HStack, VStack, Tabs } from "@chakra-ui/react";
import { FiPlus, FiList, FiEdit3 } from "react-icons/fi";
import { TaxonomiesTable } from "./TaxonomiesTable";
import { EditTaxonomyDialog } from "./EditTaxonomyDialog";
import { TaxonomyManager } from "./TaxonomyManager";

export const Taxonomies: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaxonomyId, setSelectedTaxonomyId] = useState<string | null>(null);

  return (
    <VStack spacing={6} align="stretch" h="calc(100vh - 100px)">
      <HStack justify="space-between">
        <Heading size="lg">Taxonomies</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorPalette="blue"
          onClick={() => setIsCreateOpen(true)}
        >
          Create Taxonomy
        </Button>
      </HStack>

      <Box flex="1" minH="0">
        <Tabs.Root height="100%" defaultValue="list">
          <Tabs.List>
            <Tabs.Trigger value="list">
              <FiList style={{ marginRight: "8px" }} />
              All Taxonomies
            </Tabs.Trigger>
            <Tabs.Trigger value="editor">
              <FiEdit3 style={{ marginRight: "8px" }} />
              Editor
            </Tabs.Trigger>
          </Tabs.List>

            <Tabs.Content value="list" height="calc(100% - 40px)">
              <TaxonomiesTable />
            </Tabs.Content>
            <Tabs.Content value="editor" height="100%" p={0}>
              <TaxonomyManager
                selectedTaxonomyId={selectedTaxonomyId || undefined}
                onTaxonomySelect={setSelectedTaxonomyId}
              />
            </Tabs.Content>
        </Tabs.Root>
      </Box>

      <EditTaxonomyDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
      />
    </VStack>
  );
};