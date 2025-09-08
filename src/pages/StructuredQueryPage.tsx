import React from "react";
import { FileSearch } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import { Box, Text } from "@chakra-ui/react";

const StructuredQueryPage: React.FC = () => {
  return (
    <>
      <PageHeader
        icon={<FileSearch />}
        title="Structured Query"
        description="Build and execute structured queries to explore your data"
      />
      <Box p={6}>
        <Text color="fg.muted">
          Structured Query interface coming soon...
        </Text>
      </Box>
    </>
  );
};

export default StructuredQueryPage;