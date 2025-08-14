import React from "react";
import { Box, VStack, Heading } from "@chakra-ui/react";
import { SchemaControls } from "./SchemaControls";
import { SchemasTable } from "./SchemasTable";

export const Schemas: React.FC = () => {
  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Heading size="lg">Schemas</Heading>
        <SchemaControls />
        <SchemasTable />
      </VStack>
    </Box>
  );
};