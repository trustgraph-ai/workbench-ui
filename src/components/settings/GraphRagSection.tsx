import React from "react";
import { VStack, SimpleGrid, Text } from "@chakra-ui/react";
import { Network } from "lucide-react";
import Card from "../common/Card";
import NumberField from "../common/NumberField";

interface GraphRagSectionProps {
  entityLimit: number;
  tripleLimit: number;
  maxSubgraphSize: number;
  pathLength: number;
  onEntityLimitChange: (value: number) => void;
  onTripleLimitChange: (value: number) => void;
  onMaxSubgraphSizeChange: (value: number) => void;
  onPathLengthChange: (value: number) => void;
}

const GraphRagSection: React.FC<GraphRagSectionProps> = ({
  entityLimit,
  tripleLimit,
  maxSubgraphSize,
  pathLength,
  onEntityLimitChange,
  onTripleLimitChange,
  onMaxSubgraphSizeChange,
  onPathLengthChange,
}) => {
  return (
    <Card
      title="GraphRAG Configuration"
      description="Configure entity limits, triple limits, and graph traversal settings"
      icon={<Network />}
    >
      <VStack gap={4} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <VStack gap={2} align="stretch">
            <NumberField
              label="Entity Limit"
              value={entityLimit}
              onValueChange={onEntityLimitChange}
              minValue={1}
              maxValue={1000}
            />
            <Text fontSize="sm" color="fg.muted">
              Maximum number of entities to include in graph queries
            </Text>
          </VStack>

          <VStack gap={2} align="stretch">
            <NumberField
              label="Triple Limit"
              value={tripleLimit}
              onValueChange={onTripleLimitChange}
              minValue={1}
              maxValue={500}
            />
            <Text fontSize="sm" color="fg.muted">
              Maximum number of triples to retrieve per query
            </Text>
          </VStack>

          <VStack gap={2} align="stretch">
            <NumberField
              label="Max Subgraph Size"
              value={maxSubgraphSize}
              onValueChange={onMaxSubgraphSizeChange}
              minValue={100}
              maxValue={10000}
            />
            <Text fontSize="sm" color="fg.muted">
              Maximum size of subgraphs for processing
            </Text>
          </VStack>

          <VStack gap={2} align="stretch">
            <NumberField
              label="Path Length"
              value={pathLength}
              onValueChange={onPathLengthChange}
              minValue={1}
              maxValue={10}
            />
            <Text fontSize="sm" color="fg.muted">
              Maximum path length for graph traversal
            </Text>
          </VStack>
        </SimpleGrid>
      </VStack>
    </Card>
  );
};

export default GraphRagSection;