import React from "react";
import { VStack, HStack, Text, Switch } from "@chakra-ui/react";
import { ToggleLeft } from "lucide-react";
import Card from "../common/Card";

interface FeatureSwitchesSectionProps {
  taxonomyEditor: boolean;
  submissions: boolean;
  agentTools: boolean;
  mcpTools: boolean;
  schemas: boolean;
  tokenCost: boolean;
  onTaxonomyEditorChange: (enabled: boolean) => void;
  onSubmissionsChange: (enabled: boolean) => void;
  onAgentToolsChange: (enabled: boolean) => void;
  onMcpToolsChange: (enabled: boolean) => void;
  onSchemasChange: (enabled: boolean) => void;
  onTokenCostChange: (enabled: boolean) => void;
}

const FeatureSwitchesSection: React.FC<FeatureSwitchesSectionProps> = ({
  taxonomyEditor,
  submissions,
  agentTools,
  mcpTools,
  schemas,
  tokenCost,
  onTaxonomyEditorChange,
  onSubmissionsChange,
  onAgentToolsChange,
  onMcpToolsChange,
  onSchemasChange,
  onTokenCostChange,
}) => {
  return (
    <Card
      title="Feature Switches"
      description="Enable or disable advanced and experimental features"
      icon={<ToggleLeft />}
    >
      <VStack gap={4} align="stretch">
        <HStack justify="space-between" align="center">
          <VStack gap={1} align="start">
            <Text fontWeight="medium">Taxonomy Editor</Text>
            <Text fontSize="sm" color="fg.muted">
              Enable the taxonomy management interface for SKOS concepts
            </Text>
          </VStack>
          <Switch.Root
            checked={taxonomyEditor}
            onCheckedChange={(details) => onTaxonomyEditorChange(details.checked)}
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Root>
        </HStack>

        <HStack justify="space-between" align="center">
          <VStack gap={1} align="start">
            <Text fontWeight="medium">Submissions</Text>
            <Text fontSize="sm" color="fg.muted">
              Enable the submissions and processing interface
            </Text>
          </VStack>
          <Switch.Root
            checked={submissions}
            onCheckedChange={(details) => onSubmissionsChange(details.checked)}
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Root>
        </HStack>

        <HStack justify="space-between" align="center">
          <VStack gap={1} align="start">
            <Text fontWeight="medium">Agent Tools</Text>
            <Text fontSize="sm" color="fg.muted">
              Enable the agent tools configuration interface
            </Text>
          </VStack>
          <Switch.Root
            checked={agentTools}
            onCheckedChange={(details) => onAgentToolsChange(details.checked)}
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Root>
        </HStack>

        <HStack justify="space-between" align="center">
          <VStack gap={1} align="start">
            <Text fontWeight="medium">MCP Tools</Text>
            <Text fontSize="sm" color="fg.muted">
              Enable the MCP (Model Context Protocol) tools interface
            </Text>
          </VStack>
          <Switch.Root
            checked={mcpTools}
            onCheckedChange={(details) => onMcpToolsChange(details.checked)}
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Root>
        </HStack>

        <HStack justify="space-between" align="center">
          <VStack gap={1} align="start">
            <Text fontWeight="medium">Schemas</Text>
            <Text fontSize="sm" color="fg.muted">
              Enable the schemas management interface for structured data
            </Text>
          </VStack>
          <Switch.Root
            checked={schemas}
            onCheckedChange={(details) => onSchemasChange(details.checked)}
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Root>
        </HStack>

        <HStack justify="space-between" align="center">
          <VStack gap={1} align="start">
            <Text fontWeight="medium">Token Cost</Text>
            <Text fontSize="sm" color="fg.muted">
              Enable the token cost tracking and analysis interface
            </Text>
          </VStack>
          <Switch.Root
            checked={tokenCost}
            onCheckedChange={(details) => onTokenCostChange(details.checked)}
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Root>
        </HStack>
      </VStack>
    </Card>
  );
};

export default FeatureSwitchesSection;