import { Box, Text, VStack, Card, Flex } from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";
import type { FocusEvent, SelectedEdge, ProvenanceChainItem } from "@trustgraph/react-state";
import SourceLink from "./SourceLink";

interface FocusSectionProps {
  focus: FocusEvent;
  onSourceClick?: (source: ProvenanceChainItem) => void;
}

const EdgeDisplay = ({
  edge,
  onSourceClick,
}: {
  edge: SelectedEdge;
  onSourceClick?: (source: ProvenanceChainItem) => void;
}) => {
  const labels = edge.labels || {
    s: edge.edge.s,
    p: edge.edge.p,
    o: edge.edge.o,
  };

  // Get the last source in the chain (the document)
  const documentSource = edge.sources?.[edge.sources.length - 1];

  return (
    <Card.Root size="sm" variant="outline" mb={2}>
      <Card.Body p={3}>
        <Flex align="center" gap={2} flexWrap="wrap" mb={edge.reasoning || documentSource ? 2 : 0}>
          <Text fontSize="sm" fontWeight="medium">
            {labels.s}
          </Text>
          <ArrowRight size={14} />
          <Text fontSize="sm" color="fg.muted">
            {labels.p}
          </Text>
          <ArrowRight size={14} />
          <Text fontSize="sm" fontWeight="medium">
            {labels.o}
          </Text>
        </Flex>

        {edge.reasoning && (
          <Text fontSize="xs" color="fg.muted" mb={documentSource ? 2 : 0}>
            {edge.reasoning}
          </Text>
        )}

        {documentSource && (
          <Box>
            <SourceLink source={documentSource} onClick={onSourceClick} />
          </Box>
        )}
      </Card.Body>
    </Card.Root>
  );
};

const FocusSection = ({ focus, onSourceClick }: FocusSectionProps) => {
  if (!focus.selectedEdges || focus.selectedEdges.length === 0) return null;

  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" color="fg.muted" mb={2}>
        Selected Evidence
      </Text>
      <VStack align="stretch" gap={0}>
        {focus.selectedEdges.map((edge, index) => (
          <EdgeDisplay key={index} edge={edge} onSourceClick={onSourceClick} />
        ))}
      </VStack>
    </Box>
  );
};

export default FocusSection;
