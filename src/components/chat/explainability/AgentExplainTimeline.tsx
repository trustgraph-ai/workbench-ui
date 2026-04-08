import { Box, Text, Badge, VStack, Flex } from "@chakra-ui/react";
import {
  HelpCircle,
  GitBranch,
  Wrench,
  MessageSquare,
  CheckCircle,
  Search,
} from "lucide-react";
import type {
  StructuredExplainEvent,
  AgentQuestionEvent,
  DecompositionEvent,
  AnalysisEvent,
  GroundingEvent,
} from "@trustgraph/react-state";

const STEP_CONFIG: Record<
  string,
  { color: string; icon: React.ReactNode; defaultLabel: string }
> = {
  "agent-question": {
    color: "orange",
    icon: <HelpCircle size={12} />,
    defaultLabel: "Question",
  },
  decomposition: {
    color: "yellow",
    icon: <GitBranch size={12} />,
    defaultLabel: "Decomposition",
  },
  analysis: {
    color: "purple",
    icon: <Wrench size={12} />,
    defaultLabel: "Analysis",
  },
  reflection: {
    color: "cyan",
    icon: <MessageSquare size={12} />,
    defaultLabel: "Observation",
  },
  conclusion: {
    color: "green",
    icon: <CheckCircle size={12} />,
    defaultLabel: "Conclusion",
  },
  grounding: {
    color: "blue",
    icon: <Search size={12} />,
    defaultLabel: "Grounding",
  },
};

/** Render type-specific detail below the badge */
const StepDetail = ({ step }: { step: StructuredExplainEvent }) => {
  switch (step.type) {
    case "agent-question": {
      const q = (step as AgentQuestionEvent).query;
      return q ? (
        <Text fontSize="xs" fontStyle="italic">"{q}"</Text>
      ) : null;
    }
    case "decomposition": {
      const goals = (step as DecompositionEvent).goals;
      return goals.length > 0 ? (
        <Box pl={2}>
          {goals.map((g, i) => (
            <Text key={i} fontSize="xs" color="fg.muted">- {g}</Text>
          ))}
        </Box>
      ) : null;
    }
    case "analysis": {
      const a = step as AnalysisEvent;
      return a.action ? (
        <Text fontSize="xs" color="fg.muted">
          {a.action}
          {a.arguments && (
            <Text as="span" fontSize="xs" color="fg.subtle" ml={1}>
              {a.arguments.length > 80
                ? a.arguments.substring(0, 80) + "..."
                : a.arguments}
            </Text>
          )}
        </Text>
      ) : null;
    }
    case "grounding": {
      const concepts = (step as GroundingEvent).concepts;
      return concepts.length > 0 ? (
        <Text fontSize="xs" color="fg.muted">
          {concepts.join(", ")}
        </Text>
      ) : null;
    }
    default:
      return null;
  }
};

interface AgentExplainTimelineProps {
  steps: StructuredExplainEvent[];
}

// Filter out steps that duplicate the conversation bubbles above
const VISIBLE_TYPES = new Set(["decomposition", "analysis", "grounding"]);

const AgentExplainTimeline = ({ steps }: AgentExplainTimelineProps) => {
  const visible = steps.filter((s) => VISIBLE_TYPES.has(s.type));
  if (visible.length === 0) return null;

  return (
    <VStack gap={1} align="stretch">
      {visible.map((step, i) => {
        const config = STEP_CONFIG[step.type] || STEP_CONFIG.reflection;
        const label =
          ("label" in step && step.label) || config.defaultLabel;

        return (
          <Box key={i} py={1}>
            <Flex align="center" gap={2}>
              <Badge
                size="sm"
                colorPalette={config.color}
                variant="subtle"
              >
                {config.icon}
                <Text ml={1}>{label}</Text>
              </Badge>
            </Flex>
            <Box pl={2} mt={0.5}>
              <StepDetail step={step} />
            </Box>
          </Box>
        );
      })}
    </VStack>
  );
};

export default AgentExplainTimeline;
