import React from "react";
import { Plus } from "lucide-react";
import { Button, Box } from "@chakra-ui/react";
import { generateFlowBlueprintId } from "@trustgraph/react-state";

interface FlowBlueprintsControlsProps {
  onNew?: (id: string) => void;
}

const FlowBlueprintsControls: React.FC<FlowBlueprintControlsProps> = ({ onNew }) => {
  const handleCreate = () => {
    const newId = generateFlowBlueprintId("flow-blueprint");
    onNew?.(newId);
  };

  return (
    <Box>
      <Button
        mt={5}
        ml={5}
        mb={5}
        variant="solid"
        colorPalette="primary"
        onClick={handleCreate}
      >
        <Plus /> Create Flow Blueprints
      </Button>
    </Box>
  );
};

export default FlowBlueprintsControls;
