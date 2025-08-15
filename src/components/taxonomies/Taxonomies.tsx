import React, { useState } from "react";
import { Box, Button, Heading, HStack, VStack } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { TaxonomiesTable } from "./TaxonomiesTable";
import { EditTaxonomyDialog } from "./EditTaxonomyDialog";

export const Taxonomies: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <VStack spacing={6} align="stretch" p={6}>
      <HStack justify="space-between">
        <Heading size="lg">Taxonomies</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="blue"
          onClick={() => setIsCreateOpen(true)}
        >
          Create Taxonomy
        </Button>
      </HStack>

      <Box>
        <TaxonomiesTable />
      </Box>

      <EditTaxonomyDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        mode="create"
      />
    </VStack>
  );
};