import React, { useEffect, useState } from "react";

import { Table, Code, Tabs, Box } from "@chakra-ui/react";

import { useProgressStateStore } from "../../state/progress";
import { useSocket } from "../../api/trustgraph/socket";
import { toaster } from "../ui/toaster";

const SystemPrompt = ({
  prompt, onEdit
}) => {

  return (
    <>
          <Box
            onClick={() => onEdit()}
            p={4}
            _hover={{ backgroundColor: "bg.emphasized" }}
          >
            <Code p={2}>{prompt}</Code>
          </Box>
    </>
  );
};

export default SystemPrompt;
