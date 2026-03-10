import { useState } from "react";
import { Box, Flex, Text, Badge, IconButton, Collapsible } from "@chakra-ui/react";
import { ChevronDown, ChevronRight, Lightbulb } from "lucide-react";
import { useExplainabilityStore } from "@trustgraph/react-state";
import type { ProvenanceChainItem } from "@trustgraph/react-state";
import {
  QuestionSection,
  ExplorationSection,
  FocusSection,
  SourceDrawer,
} from "./explainability";

interface ExplainabilityPanelProps {
  sessionId: string;
}

const ExplainabilityPanel = ({ sessionId }: ExplainabilityPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSource, setSelectedSource] = useState<ProvenanceChainItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const session = useExplainabilityStore((state) => state.sessions[sessionId]);

  // Don't render if no session data
  if (!session) return null;

  // Check if there's any meaningful data to show
  const hasData =
    session.question?.query ||
    session.exploration?.edgeCount !== undefined ||
    (session.focus?.selectedEdges && session.focus.selectedEdges.length > 0);

  if (!hasData) return null;

  const handleSourceClick = (source: ProvenanceChainItem) => {
    setSelectedSource(source);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedSource(null);
  };

  return (
    <>
      <Box mt={2} borderTopWidth="1px" borderColor="border.muted" pt={2}>
        <Collapsible.Root open={isExpanded} onOpenChange={(e) => setIsExpanded(e.open)}>
          <Collapsible.Trigger asChild>
            <Flex
              align="center"
              gap={2}
              cursor="pointer"
              py={1}
              px={2}
              borderRadius="md"
              _hover={{ bg: "bg.subtle" }}
            >
              <IconButton
                aria-label={isExpanded ? "Collapse" : "Expand"}
                size="xs"
                variant="ghost"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </IconButton>
              <Badge size="sm" colorPalette="blue" variant="subtle">
                <Lightbulb size={12} />
              </Badge>
              <Text fontSize="sm" color="fg.muted">
                How I found this answer
              </Text>
            </Flex>
          </Collapsible.Trigger>

          <Collapsible.Content>
            <Box pl={8} pr={2} py={2}>
              {session.question && <QuestionSection question={session.question} />}
              {session.exploration && <ExplorationSection exploration={session.exploration} />}
              {session.focus && (
                <FocusSection focus={session.focus} onSourceClick={handleSourceClick} />
              )}
            </Box>
          </Collapsible.Content>
        </Collapsible.Root>
      </Box>

      <SourceDrawer
        source={selectedSource}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </>
  );
};

export default ExplainabilityPanel;
