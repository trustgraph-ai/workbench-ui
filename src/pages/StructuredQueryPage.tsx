import React from "react";
import { FileSearch, Search, Code, Play, Sparkles } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import { Box } from "@chakra-ui/react";
import { Tabs } from "@chakra-ui/react";
import GenerateGraphQLTab from "../components/structured-query/GenerateGraphQLTab";
import RunGraphQLTab from "../components/structured-query/RunGraphQLTab";
import StructuredQueryTab from "../components/structured-query/StructuredQueryTab";
import RowEmbeddingsQueryTab from "../components/structured-query/RowEmbeddingsQueryTab";

const StructuredQueryPage: React.FC = () => {
  return (
    <>
      <PageHeader
        icon={<FileSearch />}
        title="Structured Query"
        description="Build and execute structured queries to explore your data"
      />
      <Box p={6}>
        <Tabs.Root defaultValue="structured-query" variant="enclosed">
          <Tabs.List>
            <Tabs.Trigger value="structured-query">
              <Search size={16} />
              Structured Query
            </Tabs.Trigger>
            <Tabs.Trigger value="row-embeddings">
              <Sparkles size={16} />
              Semantic Search
            </Tabs.Trigger>
            <Tabs.Trigger value="generate-graphql">
              <Code size={16} />
              Generate GraphQL
            </Tabs.Trigger>
            <Tabs.Trigger value="run-graphql">
              <Play size={16} />
              Run GraphQL
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="structured-query">
            <StructuredQueryTab />
          </Tabs.Content>

          <Tabs.Content value="row-embeddings">
            <RowEmbeddingsQueryTab />
          </Tabs.Content>

          <Tabs.Content value="generate-graphql">
            <GenerateGraphQLTab />
          </Tabs.Content>

          <Tabs.Content value="run-graphql">
            <RunGraphQLTab />
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </>
  );
};

export default StructuredQueryPage;
