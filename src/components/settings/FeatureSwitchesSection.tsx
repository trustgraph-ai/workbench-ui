import React from "react";
import { VStack, HStack, Text, Switch } from "@chakra-ui/react";
import { ToggleLeft } from "lucide-react";
import Card from "../common/Card";

interface FeatureSwitchesSectionProps {
  taxonomyEditor: boolean;
  submissions: boolean;
  onTaxonomyEditorChange: (enabled: boolean) => void;
  onSubmissionsChange: (enabled: boolean) => void;
}

const FeatureSwitchesSection: React.FC<FeatureSwitchesSectionProps> = ({
  taxonomyEditor,
  submissions,
  onTaxonomyEditorChange,
  onSubmissionsChange,
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
      </VStack>
    </Card>
  );
};

export default FeatureSwitchesSection;