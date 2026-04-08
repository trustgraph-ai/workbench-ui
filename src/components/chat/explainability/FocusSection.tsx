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

  // Build breadcrumb from chain: e.g. "Chunk 3 → Page 2 → Beyond the vigilant state"
  const chunkSource = edge.sources?.[0];
  const chainLabel = edge.sources && edge.sources.length > 0
    ? edge.sources.map((s) => s.label).join(" \u2192 ")
    : undefined;

  return (
    <Card.Root size="sm" variant="outline" mb={2}>
      <Card.Body p={3}>
        <Flex align="center" gap={2} flexWrap="wrap" mb={edge.reasoning || chunkSource ? 2 : 0}>
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
          <Text fontSize="xs" color="fg.muted" mb={chunkSource ? 2 : 0}>
            {edge.reasoning}
          </Text>
        )}

        {chunkSource && (
          <Box>
            <SourceLink
              source={{ uri: chunkSource.uri, label: chainLabel || chunkSource.label }}
              onClick={onSourceClick}
            />
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
