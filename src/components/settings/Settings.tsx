import React from "react";
import { VStack, HStack, Button, Spinner, Center } from "@chakra-ui/react";
import { RotateCcw, Download, Upload } from "lucide-react";
import { useSettings } from "../../state/settings";
import { useNotification } from "../../state/notify";
import AuthenticationSection from "./AuthenticationSection";
import GraphRagSection from "./GraphRagSection";
import FeatureSwitchesSection from "./FeatureSwitchesSection";

const Settings: React.FC = () => {
  const {
    settings,
    isLoaded,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
  } = useSettings();

  const notify = useNotification();

  const handleReset = async () => {
    try {
      resetSettings();
      notify.success("Settings reset to defaults successfully");
    } catch (error) {
      notify.error("Failed to reset settings");
    }
  };

  const handleExport = () => {
    try {
      const settingsJson = exportSettings();
      const blob = new Blob([settingsJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "trustgraph-settings.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      notify.success("Settings exported successfully");
    } catch (error) {
      notify.error("Failed to export settings");
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            importSettings(content);
            notify.success("Settings imported successfully");
          } catch (error) {
            notify.error("Failed to import settings - invalid format");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (!isLoaded) {
    return (
      <Center py={8}>
        <Spinner />
      </Center>
    );
  }

  return (
    <VStack gap={6} align="stretch" p={6} maxW="4xl" mx="auto">
      <HStack justify="flex-end" gap={2}>
        <Button
          variant="outline"
          onClick={handleImport}
          leftIcon={<Upload />}
        >
          Import
        </Button>
        <Button
          variant="outline"
          onClick={handleExport}
          leftIcon={<Download />}
        >
          Export
        </Button>
        <Button
          variant="outline"
          colorPalette="red"
          onClick={handleReset}
          leftIcon={<RotateCcw />}
        >
          Reset to Defaults
        </Button>
      </HStack>

      <AuthenticationSection
        apiKey={settings.authentication.apiKey}
        onApiKeyChange={(value) =>
          updateSetting("authentication.apiKey", value)
        }
      />

      <GraphRagSection
        entityLimit={settings.graphrag.entityLimit}
        tripleLimit={settings.graphrag.tripleLimit}
        maxSubgraphSize={settings.graphrag.maxSubgraphSize}
        pathLength={settings.graphrag.pathLength}
        onEntityLimitChange={(value) =>
          updateSetting("graphrag.entityLimit", value)
        }
        onTripleLimitChange={(value) =>
          updateSetting("graphrag.tripleLimit", value)
        }
        onMaxSubgraphSizeChange={(value) =>
          updateSetting("graphrag.maxSubgraphSize", value)
        }
        onPathLengthChange={(value) =>
          updateSetting("graphrag.pathLength", value)
        }
      />

      <FeatureSwitchesSection
        taxonomyEditor={settings.featureSwitches.taxonomyEditor}
        submissions={settings.featureSwitches.submissions}
        agentTools={settings.featureSwitches.agentTools}
        mcpTools={settings.featureSwitches.mcpTools}
        schemas={settings.featureSwitches.schemas}
        tokenCost={settings.featureSwitches.tokenCost}
        onTaxonomyEditorChange={(value) =>
          updateSetting("featureSwitches.taxonomyEditor", value)
        }
        onSubmissionsChange={(value) =>
          updateSetting("featureSwitches.submissions", value)
        }
        onAgentToolsChange={(value) =>
          updateSetting("featureSwitches.agentTools", value)
        }
        onMcpToolsChange={(value) =>
          updateSetting("featureSwitches.mcpTools", value)
        }
        onSchemasChange={(value) =>
          updateSetting("featureSwitches.schemas", value)
        }
        onTokenCostChange={(value) =>
          updateSetting("featureSwitches.tokenCost", value)
        }
      />
    </VStack>
  );
};

export default Settings;
