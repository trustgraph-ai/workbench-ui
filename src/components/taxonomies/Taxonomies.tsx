import React, { useState } from "react";
import { Box, Button, Heading, HStack, VStack, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
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
        <Tabs height="100%">
          <TabList>
            <Tab>
              <FiList style={{ marginRight: "8px" }} />
              All Taxonomies
            </Tab>
            <Tab>
              <FiEdit3 style={{ marginRight: "8px" }} />
              Editor
            </Tab>
          </TabList>

          <TabPanels height="calc(100% - 40px)">
            <TabPanel height="100%">
              <TaxonomiesTable />
            </TabPanel>
            <TabPanel height="100%" p={0}>
              <TaxonomyManager
                selectedTaxonomyId={selectedTaxonomyId || undefined}
                onTaxonomySelect={setSelectedTaxonomyId}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      <EditTaxonomyDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
      />
    </VStack>
  );
};