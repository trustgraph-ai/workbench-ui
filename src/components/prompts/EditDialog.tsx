import React, { useEffect, useState, useRef } from "react";

import { Trash, SendHorizontal } from "lucide-react";

import {
  Portal,
  Button,
  Dialog,
  Box,
  CloseButton,
} from "@chakra-ui/react";

import { useSocket } from "../../api/trustgraph/socket";
import SelectField from "../common/SelectField";
import TextAreaField from "../common/TextAreaField";
import TextField from "../common/TextField";
import { toaster } from "../ui/toaster";

const EditDialog = ({ open, onOpenChange, onComplete, id, create }) => {
  const socket = useSocket();

  const [newId, setNewId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState("");
  const [schema, setSchema] = useState("");

  useEffect(() => {
    if (create) {
      setFormat("text");
      return;
    }

    if (!id) return;

    socket
      .getConfig([{ type: "prompt", key: "template." + id }])
      .then((x) => {
        return JSON.parse(x.values[0].value);
      })
      .then((x) => {
        // Store flow information
        setPrompt(x.prompt);
        setFormat(x["response-type"]);
        if (x.schema) setSchema(JSON.stringify(x.schema, null, 4));
        else setSchema("");
      })
      .catch((e) => {
        console.log("Error:", err);
        toaster.create({
          title: "Error: " + e.toString(),
          type: "error",
        });
      });
  }, [id, create, socket]);

  const formatOptions = [
    {
      value: "json",
      label: "JSON",
      description: "Structured output using JSON",
    },
    { value: "text", label: "text", description: "Unstructured text output" },
  ];

  const contentRef = useRef<HTMLDivElement>(null);

  const onEdit = () => {
    // Build the prompt structure
    const promptStruct = {
      prompt: prompt,
      "response-type": format,
    };

    // Add schema if not an empty string.  Schema is an object embedded
    // in the structure.  It must be JSON schema if specified, we're
    // not checking that here.
    if (schema) {
      const parsedSchema = JSON.parse(schema);
      promptStruct["schema"] = parsedSchema;
    }

    // Create is different from edit existing
    if (create) {
      // When creating, the order is...
      // 1) write the prompt template,
      // 2) get the template index
      // 3) add this prompt ID to the index if not already there

      socket
        .putConfig([
          {
            type: "prompt",
            key: "template." + newId,
            value: JSON.stringify(promptStruct),
          },
        ])
        .then(() =>
          socket.getConfig([{ type: "prompt", key: "template-index" }]),
        )
        .then(() => {
          const templates = JSON.parse(x.values[0].value);

          if (!templates.includes(newId)) {
            templates.push(newId);
            return socket
              .putConfig([
                {
                  type: "prompt",
                  key: "template-index",
                  value: JSON.stringify(templates),
                },
              ])
              .then({});
          } else {
            return {};
          }
        })
        .then(() => {
          toaster.create({
            title: "Created prompt",
            type: "success",
          });
          onComplete();
        })

        .catch((err) => {
          console.log("Error:", err);
          toaster.create({
            title: "Error: " + e.toString(),
            type: "error",
          });
        });
    } else {
      // This is the case for updating an existing template, just over-write
      // its value.
      return socket
        .putConfig([
          {
            type: "prompt",
            key: "template." + id,
            value: JSON.stringify(promptStruct),
          },
        ])
        .then(() => {
          toaster.create({
            title: "Edited prompt",
            type: "success",
          });
          onComplete();
        })
        .catch((e) => {
          console.log("Error:", err);
          toaster.create({
            title: "Error: " + e.toString(),
            type: "error",
          });
        });
    }
  };

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
              {create && <Dialog.Title>Create prompt</Dialog.Title>}

              {!create && (
                <Dialog.Title>
                  Edit prompt: <code>{id}</code>
                </Dialog.Title>
              )}
            </Dialog.Header>
            <Dialog.Body>
              {create && (
                <TextField
                  label="Prompt ID"
                  placeholder="Enter a unique prompt ID"
                  value={newId}
                  onValueChange={(v) => setNewId(v)}
                  required={true}
                />
              )}

              <TextAreaField
                label="Prompt"
                placeholder="Enter AI prompt"
                value={prompt}
                onValueChange={(v) => setPrompt(v)}
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
                onValueChange={(v) => setSchema(v)}
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="solid"
                onClick={() => onOpenChange(false)}
                colorPalette="red"
              >
                <Trash /> Delete
              </Button>
              <Button onClick={() => onEdit()}>
                <SendHorizontal /> Submit
              </Button>
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
