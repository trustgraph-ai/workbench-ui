import React, { useEffect, useState, useRef } from "react";

import { Trash, SendHorizontal } from "lucide-react";

import { Portal, Button, Dialog, Box, CloseButton } from "@chakra-ui/react";

import { useSocket } from "../../api/trustgraph/socket";
import SelectField from "../common/SelectField";
import TextField from "../common/TextField";
import { toaster } from "../ui/toaster";

const EditDialog = ({ open, onOpenChange, onComplete, id, create }) => {
  const socket = useSocket();

  const [newId, setNewId] = useState("");
  const [input, setInput] = useState(0);
  const [output, setOutput] = useState(0);

  useEffect(() => {

    if (!id) return;

    socket
      .getConfig([{ type: "token-costs", key: id }])
      .then((x) => {
        return JSON.parse(x.values[0].value);
      })
      .then((x) => {
        // Store flow information
        setInput(x.input_price * 1000000);
        setOutput(x.output_price * 1000000);
      })
      .catch((e) => {
        console.log("Error:", e);
        toaster.create({
          title: "Error: " + e.toString(),
          type: "error",
        });
      });
  }, [id, create, socket]);

  const onEdit = () => {

    // Build the prompt structure
    const cost = {
      input_price: input / 1000000,
      output_price: output / 1000000,
    };

    // Create is different from edit existing
    if (create) {
      // When creating, the order is...
      // 1) write the prompt template,
      // 2) get the template index
      // 3) add this prompt ID to the index if not already there

      socket
        .putConfig([
          {
            type: "token-costs",
            key: newId,
            value: JSON.stringify(cost),
          },
        ])
        .then(() => {
          toaster.create({
            title: "Created model cost",
            type: "success",
          });
          onComplete();
        })

        .catch((err) => {
          console.log("Error:", err);
          toaster.create({
            title: "Error: " + err.toString(),
            type: "error",
          });
        });
    } else {
      // This is the case for updating an existing template, just over-write
      // its value.
      return socket
        .putConfig([
          {
            type: "token-costs",
            key: id,
            value: JSON.stringify(cost),
          },
        ])
        .then(() => {
          toaster.create({
            title: "Edited model costs",
            type: "success",
          });
          onComplete();
        })
        .catch((e) => {
          console.log("Error:", e);
          toaster.create({
            title: "Error: " + e.toString(),
            type: "error",
          });
        });
    }
  };

  const onDelete = () => {
    // Shouldn't happen, but can't delete a prompt that hasn't been created
    // yet
    if (create) return;

    // When creating, the order is...
    // 1) Get the template index
    // 2) Write back
    // 3) Delete the prompt

    socket.deleteConfig([
          {
            type: "token-costs",
            key: id,
          },
        ])
      .then(() => {
        toaster.create({
          title: "Model cost deleted",
          type: "success",
        });
        onComplete();
      })
      .catch((err) => {
        console.log("Error:", err);
        toaster.create({
          title: "Error: " + err.toString(),
          type: "error",
        });
      });
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
          <Dialog.Content>
            <Dialog.Header>
              {create && <Dialog.Title>Create model cost</Dialog.Title>}

              {!create && (
                <Dialog.Title>
                  Edit model cost: <code>{id}</code>
                </Dialog.Title>
              )}
            </Dialog.Header>
            <Dialog.Body>
              {create && (
                <TextField
                  label="Model ID"
                  placeholder="Enter a unique model ID"
                  value={newId}
                  onValueChange={(v) => setNewId(v)}
                  required={true}
                />
              )}

              <TextField
                label="Input token cost ( $ / 1Mt )"
                placeholder="Input token cost"
                value={input}
                onValueChange={(v) => setInput(v)}
                required={true}
              />

              <TextField
                label="Output token cost ( $ / 1Mt )"
                placeholder="Output token cost ($/token)"
                value={output}
                onValueChange={(v) => setOutput(v)}
                required={true}
              />

            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {
                // If a 'create' operation, there's nothing to delete, only
                // present if an existing prompt exists
              }
              {!create && (
                <Button
                  variant="solid"
                  onClick={() => onDelete()}
                  colorPalette="red"
                >
                  <Trash /> Delete
                </Button>
              )}
              <Button onClick={() => onEdit()} colorPalette="brand">
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

