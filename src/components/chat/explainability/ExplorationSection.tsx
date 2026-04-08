import { Box, Text, Flex } from "@chakra-ui/react";
import { Network } from "lucide-react";
import type { ExplorationEvent } from "@trustgraph/react-state";

interface ExplorationSectionProps {
  exploration: ExplorationEvent;
}

const ExplorationSection = ({ exploration }: ExplorationSectionProps) => {
  if (exploration.edgeCount === undefined) return null;

  return (
    <Flex align="center" gap={2} mb={3}>
      <Network size={14} />
      <Text fontSize="sm" color="fg.muted">
        Explored{" "}
        <Text as="span" fontWeight="medium" color="fg">
          {exploration.edgeCount}
        </Text>{" "}
        edges in knowledge graph
      </Text>
    </Flex>
  );
};

export default ExplorationSection;
