import React from "react";

import { Upload } from "lucide-react";

import { Box, Button, Alert } from "@chakra-ui/react";

import { useLoadStateStore } from "../../state/load";
import TextAreaField from "../common/TextAreaField";

interface TextBufferProps {}

const TextBuffer: React.FC<TextBufferProps> = ({ submit }) => {
  const value = useLoadStateStore((state) => state.text);
  const setValue = useLoadStateStore((state) => state.setText);
  const textUploads = useLoadStateStore((state) => state.textUploads);

  return (
    <>
      <Box mt={5}>
        <TextAreaField
          value={value}
          onValueChange={(e) => setValue(e)}
          label="Text content"
          rows={15}
        />
      </Box>
    </>
  );
};

export default TextBuffer;
