import React, { useEffect, useState, useRef } from "react";

import {
  List,
  Portal,
  Button,
  Dialog,
  Box,
  CloseButton,
} from "@chakra-ui/react";

import { useSocket } from "../../api/trustgraph/socket";
import SelectField from "../common/SelectField";
import SelectOption from "../common/SelectOption";
import TextAreaField from "../common/TextAreaField";

const EditDialog = ({ open, onOpenChange, onSubmit, id }) => {

  const socket = useSocket();

  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState("");
  const [schema, setSchema] = useState("");

  useEffect(() => {
    if (!id) return;
    socket
      .getConfig([
        { type: "prompt", key: "template." + id},
      ])
      .then((x) => {
        return JSON.parse(x.values[0].value);
      })
      .then((x) => {
        // Store flow information
        setPrompt(x.prompt);
        setFormat(x["response-type"]);
        if (x.schema)
          setSchema(JSON.stringify(x.schema, null, 4));
        else
          setSchema("");
      })
      .catch((err) => console.log("Error:", err));
  }, [id]);

  const formatOptions = [
    { value: "json", label: "JSON",
      "description": "Structured output using JSON"
    },
    { value: "text", label: "text",
      "description": "Unstructured text output"
    },
  ];

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog.Root
      placement="center"
      size="xl"
      open={open}
      onOpenChange={(x) => {
        onOpenChange(x.open);
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content ref={contentRef}>
            <Dialog.Header>
              <Dialog.Title>Edit prompt: <code>{id}</code></Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>

              <TextAreaField
                label="Prompt"
                placeholder="Enter AI prompt"
                value={prompt}
                onValueChange={ (v) => setPrompt(v) }
                required={true}
              />

              <Box mt={5}>With following flows:</Box>

              <Box mt={5}>
                <SelectField
                  label="Format"
                  items={formatOptions}
                  value={format}
                  onValueChange={(x) => {
                    setFormat(x);
                  }}
                  contentRef={contentRef}
                />
              </Box>

              <TextAreaField
                label="Schema"
                placeholder="Enter JSON schema for validation"
                value={schema}
                onValueChange={ (v) => setSchema(v) }
              />

            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => onSubmit(flow, tags)}>Submit</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default EditDialog;
