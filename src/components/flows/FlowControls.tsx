import React, { useEffect, useState } from "react";

import { Plus } from "lucide-react";

import { Button, Box } from "@chakra-ui/react";

import CreateDialog from "./CreateDialog";
import { useSocket } from "../../api/trustgraph/socket";
import { toaster } from "../ui/toaster";

const FlowControls = ({ onUpdate }) => {
  const socket = useSocket();

  const [createOpen, setCreateOpen] = useState(false);

  const onCreate = (flowClass, id, description) => {
    console.log(flowClass, id, description);

    socket
      .startFlow(id, flowClass, description)
      .then(() => {
        console.log("Success");
        setCreateOpen(false);
        onUpdate();
        toaster.create({
          title: "Flow created",
          type: "success",
        });
      })
      .catch((e) =>
        toaster.create({
          title: "Error: " + e.toString(),
          type: "error",
        }),
      );
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
