import React, { useState } from "react";

import { Plus } from "lucide-react";

import { Button, Box } from "@chakra-ui/react";

import EditDialog from "./EditDialog";

const Controls = ({ onUpload }) => {
  return (
    <Box>
      <Button
        mt={5}
        ml={5}
        mb={5}
        variant="solid"
        colorPalette="brand"
        onClick={() => onUpload()}
      >
        <Plus /> Upload Documents
      </Button>
    </Box>
  );
};

export default Controls;
