import React, { useState } from "react";

import { Plus } from "lucide-react";

import { Button, Box } from "@chakra-ui/react";

import CreateDialog from "./CreateDialog";
import { useFlows } from "../../state/flows";

const FlowControls = () => {
  const flowState = useFlows();

  const [createOpen, setCreateOpen] = useState(false);

  const onCreate = (flowClass, id, description) => {
    console.log(flowClass, id, description);
    flowState.startFlow({
      id: id,
      flowClass: flowClass,
      description: description,
      onSuccess: () => {},
    });
  };

  return (
    <Box>
      <Button
        mt={5}
        ml={5}
        mb={5}
        variant="solid"
        colorPalette="brand"
        onClick={() => setCreateOpen(true)}
      >
        <Plus /> Create
      </Button>
      <CreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={onCreate}
      />
    </Box>
  );
};

export default FlowControls;
